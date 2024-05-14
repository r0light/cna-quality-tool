import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { TOSCA_Artifact_Type_Key, TOSCA_Capability_Type_Key, TOSCA_Datatype_Type_Key, TOSCA_Group_Type_Key, TOSCA_Interface_Type_Key, TOSCA_Node_Type_Key, TOSCA_Policy_Type_Key, TOSCA_Relationship_Type_Key } from '../../tosca-types/v2dot0-types/alias-types.js';
import { TOSCA_Artifact_Type_Definition, TOSCA_Capability_Type_Definition, TOSCA_Datatype_Definition, TOSCA_File, TOSCA_Group_Type_Definition, TOSCA_Interface_Type_Definition, TOSCA_Node_Definition, TOSCA_Policy_Type_Definition, TOSCA_Relationship_Definition, TOSCA_Type_Definition_Commons } from '@/totypa/tosca-types/v2dot0-types/definition-types.js';
import { TwoWayKeyTypeDefinitionMap } from '../TwoWayKeyTypeDefinitionMap.js';

const YAML_KEY_PATTERN = new RegExp(/\.([A-z])/g);
const MATCH_FIRST_CHARACTER = new RegExp(/^./g);

type ProfileInfo = {
    jsonFileName: string,
    typesFileName: string,
    profileName: string,
    profile: TOSCA_File
}

const hint = "/* \n   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions \n*/\n";

const isDerivedFrom = (typeDefinition: TOSCA_Type_Definition_Commons) => {
    if (typeDefinition.derived_from) {
        return typeDefinition.derived_from;
    }
    return "";
}

type key = TOSCA_Artifact_Type_Key | TOSCA_Datatype_Type_Key | TOSCA_Capability_Type_Key | TOSCA_Interface_Type_Key | TOSCA_Relationship_Type_Key | TOSCA_Node_Type_Key | TOSCA_Group_Type_Key | TOSCA_Policy_Type_Key;
type typeDefinition = TOSCA_Artifact_Type_Definition | TOSCA_Datatype_Definition | TOSCA_Capability_Type_Definition | TOSCA_Interface_Type_Definition | TOSCA_Relationship_Definition | TOSCA_Node_Definition | TOSCA_Group_Type_Definition | TOSCA_Policy_Type_Definition;

const buildFromTypeHierarchy = (definition: typeDefinition, existingTypes: TwoWayKeyTypeDefinitionMap<key, typeDefinition>, overwriteKeys: string[], refineKeys: string[]) => {
    let resultingDefinition: typeDefinition = {};
    let hierarchy = [JSON.parse(JSON.stringify(definition))];
    let nextDerivedFromType = definition.derived_from;
    while (nextDerivedFromType) {
        let nextDefinition = existingTypes.getType(nextDerivedFromType);
        hierarchy.unshift(JSON.parse(JSON.stringify(nextDefinition)));
        nextDerivedFromType = nextDefinition.derived_from;
    }
    for (let definitionPart of hierarchy) {
        for (let keyToOverwrite of overwriteKeys) {
            if (definitionPart[keyToOverwrite]) {
                resultingDefinition[keyToOverwrite] = definitionPart[keyToOverwrite];
            }
        }
        for (let keyToRefine of refineKeys) {
            if (definitionPart[keyToRefine]) {
                resultingDefinition[keyToRefine] = refineValue(resultingDefinition[keyToRefine], definitionPart[keyToRefine]);
            }
        }
    }
    return resultingDefinition;
}

const refineValue = (thingToRefine: any, thingWithRefinements: any) => {
    if (["string", "boolean", "number"].includes(typeof thingWithRefinements)) {
        return thingWithRefinements;
    } else if (Array.isArray(thingWithRefinements)) {
        if (Array.isArray(thingToRefine)) {
            for (let element of thingWithRefinements) {
                if (typeof element === "object" && Object.entries(element).length === 1) {
                    // is a list of "complex" elements, which might already exist and need to be refined
                    let elementKey = Object.entries(element)[0][0];
                    let indexOfExistingElement = thingToRefine.findIndex(existingElement => {
                        return typeof existingElement === "object" && Object.entries(existingElement).length === 1 && Object.entries(existingElement)[0][0] === elementKey;
                    });
                    if (~indexOfExistingElement) {
                        thingToRefine[indexOfExistingElement] = element;
                    } else {
                        thingToRefine.push(element);
                    }
                } else if (!thingToRefine.includes(element)) {
                    thingToRefine.push(element);
                }
            }
            return thingToRefine;
        } else {
            return thingWithRefinements;
        }
    } else {
        // thingWithRefinements is an object
        if (!thingToRefine) {
            thingToRefine = {};
        }
        for (let [attributeKey, attributeValue] of Object.entries(thingWithRefinements)) {
            if (thingToRefine.hasOwnProperty(attributeKey)) {
                thingToRefine[attributeKey] = refineValue(thingToRefine[attributeKey], attributeValue);
            } else {
                thingToRefine[attributeKey] = attributeValue;
            }
        }
        return thingToRefine;
    }
}

startParsing();

export async function startParsing() {
    parseAllProfiles("../../../../tosca-profiles/v2dot0-profiles/").then(promises => {
        return Promise.all(promises).then(profiles => {

            let results: Promise<void>[] = [];

            // 1. write profiles as Typescript (but basically JSON)
            let profileJsonResults: Promise<ProfileInfo>[] = [];
            profiles.forEach(profile => {
                profileJsonResults.push(saveGeneratedProfileAsJson(profile));
            })
            results.push(Promise.all(profileJsonResults).then(profileInfos => {
                let importStatements = profileInfos.map(info => {
                    return `import { ${info.profileName} } from "./${info.profileName}.js";`
                })

                let preparedData = `import { TOSCA_File } from '../../tosca-types/v2dot0-types/definition-types.js';\n${importStatements.join("\n")}\n\nexport const all_profiles: TOSCA_File[] = [\n${profileInfos.map(info => info.profileName).join(",\n")}\n];`

                fs.writeFile(`../../parsedProfiles/v2dot0-profiles/all_profiles.ts`, `${hint}\n${preparedData}`, (err) => {
                    if (err) {
                        console.error(`Could not save all_profiles: ${err}`)
                        console.trace();
                        return err;
                    }
                })
            }))

            // merge all definitions to be able to use them
            //const mergedProfiles = mergeAllProfiles(profiles);
            // TODO maybe use again when trying to create types for parsed profiles

            return results;
        })
    }).catch(err => {
        console.error("Profile parsing failed!: " + err);
        console.trace();
    })
}

function parseAllProfiles(profilesFolder: string): Promise<ProfileInfo[]> {
    return readdir(profilesFolder).then(entries => {

        let typeMaps = {
            artifactTypesMap: new TwoWayKeyTypeDefinitionMap<TOSCA_Artifact_Type_Key, TOSCA_Artifact_Type_Definition>(),
            dataTypesMap: new TwoWayKeyTypeDefinitionMap<TOSCA_Datatype_Type_Key, TOSCA_Datatype_Definition>(),
            capabilityTypesMap: new TwoWayKeyTypeDefinitionMap<TOSCA_Capability_Type_Key, TOSCA_Capability_Type_Definition>(),
            interfaceTypesMap: new TwoWayKeyTypeDefinitionMap<TOSCA_Interface_Type_Key, TOSCA_Interface_Type_Definition>(),
            relationshipTypesMap: new TwoWayKeyTypeDefinitionMap<TOSCA_Relationship_Type_Key, TOSCA_Relationship_Definition>(),
            nodeTypesMap: new TwoWayKeyTypeDefinitionMap<TOSCA_Node_Type_Key, TOSCA_Node_Definition>(),
            groupTypesMap: new TwoWayKeyTypeDefinitionMap<TOSCA_Group_Type_Key, TOSCA_Group_Type_Definition>(),
            policyTypesMap: new TwoWayKeyTypeDefinitionMap<TOSCA_Policy_Type_Key, TOSCA_Policy_Type_Definition>(),
        }
        // initialize basic types to avoid errors
        typeMaps.dataTypesMap.add({ description: "basic YAML string type" }, "string");
        typeMaps.dataTypesMap.add({ description: "basic YAML integer type" }, "integer");

        console.log(entries);
        let sortedEntries = entries.sort((entryA, entryB) => {
            // make sure the tosca simple profile is always parsed first so that types are available

            let valueA = entryA.includes("tosca-simple") ? 0 : 1;
            let valueB = entryB.includes("tosca-simple") ? 0 : 1;
            return valueA - valueB;
        });
        console.log(sortedEntries);
        return sortedEntries.map(entry => {
            const fullDirectoryPath = path.join(profilesFolder, entry);
            const stats = fs.lstatSync(fullDirectoryPath);

            if (stats.isDirectory) {
                const generatedProfile = generateFromProfile(fullDirectoryPath, typeMaps);
                const generatedName = entry.replace(/\s/g, "").replace(/[\.-]/g, "_");
                return {
                    jsonFileName: `${generatedName}.ts`,
                    typesFileName: `${generatedName}_ts_types.ts`,
                    profileName: generatedName,
                    profile: generatedProfile
                };
            }
        });
    });
}

function generateFromProfile(profileDirectory: string, typeMaps: { [mapName: string]: TwoWayKeyTypeDefinitionMap<string, any> }): TOSCA_File {

    let profile: TOSCA_File = {
        tosca_definitions_version: "tosca_2_0",
        profile: "",
        metadata: {
            template_name: "",
            template_author: "",
            template_version: "",
        },
        description: "",
        dsl_definitions: "",
        repositories: {},
        artifact_types: {},
        data_types: {},
        capability_types: {},
        interface_types: {},
        relationship_types: {},
        node_types: {},
        group_types: {},
        policy_types: {}
    }

    try {
        const files = fs.readdirSync(profileDirectory);
        for (const file of files) {
            if (!(file.endsWith(".yaml") || file.endsWith(".yml") || file.endsWith(".tosca"))) {
                continue;
            }

            const profileDocument: TOSCA_File = yaml.load(fs.readFileSync(path.join(profileDirectory, file), 'utf8')) as TOSCA_File;

            if (profileDocument.profile) {
                // assume that if the file has a profile it is the file for the whole profile
                profile.profile = profileDocument.profile;

                profile.tosca_definitions_version = profileDocument.tosca_definitions_version;

                profile.metadata = profileDocument.metadata;
                profile.description = profileDocument.description;
            }

            if (profileDocument.dsl_definitions) {
                for (let [key, value] of Object.entries(profileDocument.dsl_definitions)) {
                    profile.dsl_definitions[key] = value;
                }
            }

            if (profileDocument.repositories) {
                for (let [key, value] of Object.entries(profileDocument.repositories)) {
                    profile.repositories[key] = value;
                }
            }

            if (profileDocument.artifact_types) {
                typeMaps.artifactTypesMap.iterateWithDependencyConstraint(Object.entries(profileDocument.artifact_types),
                    isDerivedFrom,
                    (element => {
                        typeMaps.artifactTypesMap.add(element[1], element[0]);

                        // see 5.3.7.1.3 Derivation rules
                        let mergedType = buildFromTypeHierarchy(element[1],
                            typeMaps.artifactTypesMap,
                            ["derived_from", "version", "metadata", "description", "mime_type", "file_ext"],
                            ["properties"]
                        )

                        profile.artifact_types[element[0]] = mergedType as TOSCA_Artifact_Type_Definition;
                    })
                )
            }

            if (profileDocument.data_types) {
                typeMaps.dataTypesMap.iterateWithDependencyConstraint(Object.entries(profileDocument.data_types),
                    isDerivedFrom,
                    (element => {
                        typeMaps.dataTypesMap.add(element[1], element[0]);

                        // see 5.4.4.3 Derivation rules
                        let mergedType = buildFromTypeHierarchy(element[1],
                            typeMaps.dataTypesMap,
                            ["derived_from", "version", "metadata", "description"],
                            ["validation", "properties", "key_schema", "entry_schema"]
                        )

                        profile.data_types[element[0]] = mergedType as TOSCA_Datatype_Definition;
                    })
                )
            }

            if (profileDocument.capability_types) {
                typeMaps.capabilityTypesMap.iterateWithDependencyConstraint(Object.entries(profileDocument.capability_types),
                    isDerivedFrom,
                    (element => {
                        typeMaps.capabilityTypesMap.add(element[1], element[0]);

                        // see 5.3.5.1.3 Derivation rules
                        let mergedType = buildFromTypeHierarchy(element[1],
                            typeMaps.capabilityTypesMap,
                            ["derived_from", "version", "metadata", "description"],
                            ["attributes", "properties", "valid_source_node_types", "valid_relationship_types"]
                        )

                        profile.capability_types[element[0]] = mergedType as TOSCA_Capability_Type_Definition;
                    })
                )
            }

            if (profileDocument.interface_types) {

                typeMaps.interfaceTypesMap.iterateWithDependencyConstraint(Object.entries(profileDocument.interface_types),
                    isDerivedFrom,
                    (element => {
                        typeMaps.interfaceTypesMap.add(element[1], element[0]);

                        // see 5.3.6.1.3 Derivation rules
                        let mergedType = buildFromTypeHierarchy(element[1],
                            typeMaps.interfaceTypesMap,
                            ["derived_from", "version", "metadata", "description"],
                            ["inputs", "operations", "notifications",]
                        )

                        profile.interface_types[element[0]] = mergedType as TOSCA_Interface_Type_Definition;
                    })
                )
            }

            if (profileDocument.relationship_types) {

                typeMaps.relationshipTypesMap.iterateWithDependencyConstraint(Object.entries(profileDocument.relationship_types),
                    isDerivedFrom,
                    (element => {
                        typeMaps.relationshipTypesMap.add(element[1], element[0]);

                        // see 5.3.3.3 Derivation rules
                        let mergedType = buildFromTypeHierarchy(element[1],
                            typeMaps.relationshipTypesMap,
                            ["derived_from", "version", "metadata", "description"],
                            ["properties", "attributes", "interfaces", "valid_capability_types", "valid_target_node_types", "valid_source_node_types"]
                        )

                        profile.relationship_types[element[0]] = mergedType as TOSCA_Relationship_Definition;
                    })
                )
            }

            if (profileDocument.node_types) {

                typeMaps.nodeTypesMap.iterateWithDependencyConstraint(Object.entries(profileDocument.node_types),
                    isDerivedFrom,
                    (element => {
                        typeMaps.nodeTypesMap.add(element[1], element[0]);

                        // see 5.3.1.3 Derivation rules
                        let mergedType = buildFromTypeHierarchy(element[1],
                            typeMaps.nodeTypesMap,
                            ["derived_from", "version", "metadata", "description"],
                            ["properties", "attributes", "capabilities", "requirements", "interfaces", "artifacts"]
                        )

                        profile.node_types[element[0]] = mergedType as TOSCA_Node_Definition;
                    })

                )
            }

            if (profileDocument.group_types) {

                typeMaps.groupTypesMap.iterateWithDependencyConstraint(Object.entries(profileDocument.group_types),
                    isDerivedFrom,
                    (element => {
                        typeMaps.groupTypesMap.add(element[1], element[0]);

                        // see 5.6.1.3 Derivation rules
                        let mergedType = buildFromTypeHierarchy(element[1],
                            typeMaps.groupTypesMap,
                            ["derived_from", "version", "metadata", "description"],
                            ["properties", "attributes", "members"]
                        )

                        profile.group_types[element[0]] = mergedType as TOSCA_Group_Type_Definition;
                    })

                )
            }

            if (profileDocument.policy_types) {

                typeMaps.policyTypesMap.iterateWithDependencyConstraint(Object.entries(profileDocument.policy_types),
                    isDerivedFrom,
                    (element => {
                        typeMaps.policyTypesMap.add(element[1], element[0]);

                        // see 5.6.3.3 Derivation rules
                        let mergedType = buildFromTypeHierarchy(element[1],
                            typeMaps.policyTypesMap,
                            ["derived_from", "version", "metadata", "description"],
                            ["properties", "targets", "triggers"]
                        )

                        profile.policy_types[element[0]] = mergedType as TOSCA_Policy_Type_Definition;
                    })

                )

            }
        }
    } catch (err) {
        console.error("Could not read directory " + profileDirectory + " because of: " + err);
        console.error(err.stack);
        return err;
    }
    return profile;
}

function mergeAllProfiles(profiles: ProfileInfo[]): TOSCA_File {

    let merged: TOSCA_File = {
        tosca_definitions_version: "tosca_2_0",
        profile: "",
        metadata: {
            template_name: "",
            template_author: "",
            template_version: "",
        },
        description: "",
        dsl_definitions: "",
        repositories: {},
        artifact_types: {},
        data_types: {},
        capability_types: {},
        interface_types: {},
        relationship_types: {},
        node_types: {},
        policy_types: {}
    }

    for (const profile of profiles) {
        const profileTemplate = profile.profile;


        if (profileTemplate.dsl_definitions) {
            for (let [key, value] of Object.entries(profileTemplate.dsl_definitions)) {
                merged.dsl_definitions[key] = value;
            }
        }

        if (profileTemplate.repositories) {
            for (let [key, value] of Object.entries(profileTemplate.repositories)) {
                merged.repositories[key] = value;
            }
        }

        if (profileTemplate.artifact_types) {
            for (let [key, value] of Object.entries(profileTemplate.artifact_types)) {
                merged.artifact_types[key] = value;
            }
        }

        if (profileTemplate.data_types) {
            for (let [key, value] of Object.entries(profileTemplate.data_types)) {
                merged.data_types[key] = value;
            }
        }

        if (profileTemplate.capability_types) {
            for (let [key, value] of Object.entries(profileTemplate.capability_types)) {
                merged.capability_types[key] = value;
            }
        }

        if (profileTemplate.interface_types) {
            for (let [key, value] of Object.entries(profileTemplate.interface_types)) {
                merged.interface_types[key] = value;
            }
        }

        if (profileTemplate.relationship_types) {
            for (let [key, value] of Object.entries(profileTemplate.relationship_types)) {
                merged.relationship_types[key] = value;
            }
        }

        if (profileTemplate.node_types) {
            for (let [key, value] of Object.entries(profileTemplate.node_types)) {
                merged.node_types[key] = value;
            }
        }

        if (profileTemplate.policy_types) {
            for (let [key, value] of Object.entries(profileTemplate.policy_types)) {
                merged.policy_types[key] = value;
            }
        }
    }
    return merged;
}

async function saveGeneratedProfileAsJson(profileInfo: ProfileInfo): Promise<ProfileInfo> {

    let hint = "/* \n   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions \n*/\n";

    let preparedData = `import { TOSCA_File } from '../../tosca-types/v2dot0-types/definition-types.js';\n\nexport const ${profileInfo.profileName}: TOSCA_File = ${JSON.stringify(profileInfo.profile, null, 2)};`

    //console.log("saving: " + JSON.stringify(profileInfo.profile.node_types));

    fs.writeFile(`../../parsedProfiles/v2dot0-profiles/${profileInfo.jsonFileName}`, `${hint}\n${preparedData}`, (err) => {
        if (err) {
            console.error(`Could not save ${profileInfo.profileName} to file: ${err}`);
            console.trace();
            return err;
        }
    })
    return profileInfo;
}

type profileTypesInfo = {
    profileName: string,
    fileName: string,
    types: string[]
}

function toPascalCase(name: string): string {
    return name.replace(YAML_KEY_PATTERN, (match, capture) => capture.toUpperCase()).replace(MATCH_FIRST_CHARACTER, (match) => match.toUpperCase())
}

class ImportManager {

    #requiredImports = new Map<string, Set<string>>;

    add(typeName, sourceFile) {
        if (this.#requiredImports.has(sourceFile)) {
            this.#requiredImports.get(sourceFile).add(typeName);
        } else {
            let imports: Set<string> = new Set();
            imports.add(typeName);
            this.#requiredImports.set(sourceFile, imports);
        }
    }

    generateImportStatement() {
        let statement = "";
        for (const [sourceFile, imports] of this.#requiredImports.entries()) {
            let fileWithoutEnding = sourceFile.includes(".ts") ? sourceFile.substring(0, sourceFile.indexOf(".ts")) : sourceFile;
            statement = statement.concat(`import { ${[...imports].join(", ")} } from './${fileWithoutEnding}.js'\n`);
        }
        return statement;
    }
}



