import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { TOSCA_Service_Template } from '../tosca-types/template-types';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { TOSCA_Datatype, TOSCA_Property } from '../tosca-types/core-types';
import { data } from 'jquery';
import { TwoWayKeyTypeMap } from './TwoWayKeyTypeMap';
import { TOSCA_Capability_Type } from '../tosca-types/entity-types';

type ProfileInfo = {
    fileName: string,
    profileName: string,
    profile: TOSCA_Service_Template
}

const hint = "/* \n   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions \n*/\n";

startParsing();

async function startParsing() {
    parseAllProfiles("../../../tosca-profiles").then(promises => {
        return Promise.all(promises).then(profiles => {

            let results: Promise<string>[] = [];

            // 1. write profiles as Typescript (but basically JSON)
            let profileJsonResults: Promise<ProfileInfo>[] = [];
            profiles.forEach(profile => {
                profileJsonResults.push(saveGeneratedProfileAsJson(profile));
            })
            results.push(Promise.all(profileJsonResults).then(profileInfos => {
                let importStatements = profileInfos.map(info => {
                    return `import { ${info.profileName} } from "./${info.profileName}";`
                })

                let preparedData = `import { TOSCA_Service_Template } from '../tosca-types/template-types';\n${importStatements.join("\n")}\n\nexport const all_profiles: TOSCA_Service_Template[] = [\n${profileInfos.map(info => info.profileName).join(",\n")}\n];`

                fs.writeFile(`../parsedProfiles/all_profiles.ts`, `${hint}\n${preparedData}`, (err) => {
                    if (err) {
                        console.error(`Could not save all_profiles: ${err}`)
                        return err;
                    }
                })
                return "success";
            }))

            // merge all definitions to be able to use them
            const mergedProfiles = mergeAllProfiles(profiles);

            // remember all stored types
            const typeKeyMap = new TwoWayKeyTypeMap();

            // TODO ensure type uniqueness

            // 2. write Typescript Type Definition for the parsed profiles
            let profileTypescriptResults: Promise<profileTypesInfo>[] = [];
            profiles.forEach(profile => {
                profileTypescriptResults.push(saveGeneratedProfileAsTypescriptTypes(profile, mergedProfiles, typeKeyMap));
            })
            results.push(Promise.all(profileTypescriptResults).then(profileTypeInfo => {

                // TODO write combining typescript file
                return "success";
            }))

            return results;
        })
    }).catch(err => {
        console.error("Profile parsing failed!: " + err);
    })
}

function parseAllProfiles(profilesFolder: string): Promise<Promise<ProfileInfo>[]> {
    return readdir(profilesFolder).then(entries => {
        return entries.map(entry => {
            const fullDirectoryPath = path.join(profilesFolder, entry)
            return fs.promises.lstat(fullDirectoryPath).then(stats => {
                if (stats.isDirectory) {
                    return generateFromProfile(fullDirectoryPath).then(profile => {
                        let generatedName = entry.replace(/\s/g, "").replace(/[\.-]/g, "_");
                        return {
                            fileName: `${generatedName}.ts`,
                            profileName: generatedName,
                            profile: profile
                        }
                    })
                }
            });
        });
    });
}

async function generateFromProfile(profileDirectory: string): Promise<TOSCA_Service_Template> {

    const profile: TOSCA_Service_Template = {
        tosca_definitions_version: "",
        namespace: "",
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

    try {
        const files = await readdir(profileDirectory);
        for (const file of files) {
            if (!(file.endsWith(".yaml") || file.endsWith(".yml") || file.endsWith(".tosca"))) {
                continue;
            }

            const profileDocument: TOSCA_Service_Template = yaml.load(fs.readFileSync(path.join(profileDirectory, file), 'utf8')) as TOSCA_Service_Template;

            if (profileDocument.namespace) {
                // assume that if the file has a namespace it is the file for the whole profile
                profile.namespace = profileDocument.namespace;

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
                for (let [key, value] of Object.entries(profileDocument.artifact_types)) {
                    profile.artifact_types[key] = value;
                }
            }

            if (profileDocument.data_types) {
                for (let [key, value] of Object.entries(profileDocument.data_types)) {
                    profile.data_types[key] = value;
                }
            }

            if (profileDocument.capability_types) {
                for (let [key, value] of Object.entries(profileDocument.capability_types)) {
                    profile.capability_types[key] = value;
                }
            }

            if (profileDocument.interface_types) {
                for (let [key, value] of Object.entries(profileDocument.interface_types)) {
                    profile.interface_types[key] = value;
                }
            }

            if (profileDocument.relationship_types) {
                for (let [key, value] of Object.entries(profileDocument.relationship_types)) {
                    profile.relationship_types[key] = value;
                }
            }

            if (profileDocument.node_types) {
                for (let [key, value] of Object.entries(profileDocument.node_types)) {
                    profile.node_types[key] = value;
                }
            }

            if (profileDocument.policy_types) {
                for (let [key, value] of Object.entries(profileDocument.policy_types)) {
                    profile.policy_types[key] = value;
                }
            }

        }
    } catch (err) {
        console.error("Could not read directory " + profileDirectory + " because of: " + err);
        return err;
    }
    return profile;
}

function mergeAllProfiles(profiles: ProfileInfo[]): TOSCA_Service_Template {

    let merged: TOSCA_Service_Template = {
        tosca_definitions_version: "",
        namespace: "",
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

    let preparedData = `import { TOSCA_Service_Template } from '../tosca-types/template-types';\n\nexport const ${profileInfo.profileName}: TOSCA_Service_Template = ${JSON.stringify(profileInfo.profile, null, 2)};`

    fs.writeFile(`../parsedProfiles/${profileInfo.fileName}`, `${hint}\n${preparedData}`, (err) => {
        if (err) {
            console.error(`Could not save ${profileInfo.profileName} to file: ${err}`)
            return err;
        }
    })
    return profileInfo;
}


const YAML_KEY_PATTERN = new RegExp(/\.([A-z])/g);
const MATCH_FIRST_CHARACTER = new RegExp(/^./g);
function toPascalCase(name) {
    return name.replace(YAML_KEY_PATTERN, (match, capture) => capture.toUpperCase()).replace(MATCH_FIRST_CHARACTER, (match) => match.toUpperCase())
}

type profileTypesInfo = {
    profileName: string,
    fileName: string,
    types: string[]
}


async function saveGeneratedProfileAsTypescriptTypes(profileInfo: ProfileInfo, mergedProfiles: TOSCA_Service_Template, typeKeyMap: TwoWayKeyTypeMap): Promise<profileTypesInfo> {

    let generatedTypeDefinitions: string[] = [];

    // 1. Datatypes
    if (profileInfo.profile.data_types) {
        for (const [datatypeKey, datatype] of Object.entries(profileInfo.profile.data_types)) {
            let datatypeTypeName = toPascalCase(datatypeKey);
            generatedTypeDefinitions.push(`export type ${datatypeTypeName} = ${buildTsTypeForDatatype(datatype, mergedProfiles.data_types, typeKeyMap)}`)
            typeKeyMap.add(datatypeTypeName, datatypeKey);
        }
    }

    // 2. Interfaces (together with operations)
    if (profileInfo.profile.interface_types) {
        for (const [interfaceKey, interfaceDefinition] of Object.entries(profileInfo.profile.interface_types)) {
            let interfaceTypeName = toPascalCase(interfaceKey);
            generatedTypeDefinitions.push(`export type ${interfaceTypeName} = object`)
            // TODO add attributes to type, based on an example of a node template that declares an interface of a specific type.
            // TODO consider derived_from to add all attributes also of parent interface types
            typeKeyMap.add(interfaceTypeName, interfaceKey);
        }
    }

    // 3. Artifacts
    if (profileInfo.profile.artifact_types) {
        for (const [artifactKey, artifact] of Object.entries(profileInfo.profile.artifact_types)) {
            let artifactTypeName = toPascalCase(artifactKey);
            generatedTypeDefinitions.push(`export type ${artifactTypeName} = object`)
            // TODO add attributes to type, based on an example of a node template that declares an artifact of a specific type.
            // TODO consider derived_from to add all attributes also of parent artifact types
            typeKeyMap.add(artifactTypeName, artifactKey);
        }
    }


    // 4. Capabilities (depend on datatypes)
    if (profileInfo.profile.capability_types) {
        for (const [capabilityKey, capability] of Object.entries(profileInfo.profile.capability_types)) {
            let capabilityTypeName = toPascalCase(capabilityKey);
            generatedTypeDefinitions.push(`export type ${capabilityTypeName} = ${buildTsTypeForCapability(capability, mergedProfiles.capability_types, mergedProfiles.data_types, typeKeyMap)}`)
            typeKeyMap.add(capabilityTypeName, capabilityKey);
        }
    }

    // 5. Relationships (depend on capabilities)

    // 6. Nodes (depend on datatypes, capabilities, relationships, interfaces, artifacts)

    // 7. Groups (depend on nodes)

    // 8. Policies (depend on nodes, groups)

    // write file
    let hint = "/* \n   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions \n*/\n";

    let preparedData = generatedTypeDefinitions.join("\n");

    let fileName = `${profileInfo.profileName}_ts_types.ts`;
    fs.writeFile(`../parsedProfiles/${fileName}`, `${hint}\n${preparedData}`, (err) => {
        if (err) {
            console.error(`Could not save ${profileInfo.profileName} to file: ${err}`)
            return err;
        }
    })

    return {
        profileName: profileInfo.profileName,
        fileName: fileName,
        types: generatedTypeDefinitions
    }
}


function buildTsTypeForDatatype(datatype: string | TOSCA_Datatype, allDataTypes: { [datatypeKey: string]: TOSCA_Datatype }, alreadyParsedTypes: TwoWayKeyTypeMap): string {
    if (typeof datatype === "string") {
        switch (datatype) {
            case "boolean":
                return "boolean";
            case "string":
            case "timestamp":
            case "version":
            case "scalar-unit.size":
            case "scalar-unit.time":
            case "scalar-unit.frequency":
            case "scalar-unit.bitrate":
                return "string";
            case "integer":
            case "float":
                return "number";
            case "range":
                return "number[]";
            default:
                let alreadyParsed = alreadyParsedTypes.getType(datatype);
                if (alreadyParsed) {
                    console.log("type " + datatype + " found in already parsed types");
                    return alreadyParsed;
                } else {
                    console.log("trying to derive type for: " + datatype);
                    return buildTsTypeForDatatype(allDataTypes[datatype], allDataTypes, alreadyParsedTypes);
                }
        }
    } else {
        // type must be TOSCA_Datatype
        if (!datatype.derived_from) {
            return "any"
        } else {
            switch (datatype.derived_from) {
                case "boolean":
                case "string":
                case "timestamp":
                case "version":
                case "scalar-unit.size":
                case "scalar-unit.time":
                case "scalar-unit.frequency":
                case "scalar-unit.bitrate":
                case "integer":
                case "float":
                case "range":
                    return buildTsTypeForDatatype(datatype.derived_from, allDataTypes, alreadyParsedTypes)
                default:
                    console.log("trying to derive type for: " + datatype);
                    break;
            }
            let generatedTypeDefinition = "{\n    properties: {\n";
            let currentType = datatype;
            while (currentType) {
                if (currentType.properties) {
                    for (const [propKey, prop] of Object.entries(currentType.properties)) {
                        generatedTypeDefinition = generatedTypeDefinition.concat(`    ${propKey}${prop.required ? "" : "?"}: ${getTypeForToscaPropertyType(prop, allDataTypes, alreadyParsedTypes)},\n`)
                    }
                }
                if (currentType.derived_from) {
                    currentType = allDataTypes[currentType.derived_from];
                } else {
                    break;
                }
            }
            generatedTypeDefinition = generatedTypeDefinition.concat("    }\n}")
            return generatedTypeDefinition;
        }
    }
}


function getTypeForToscaPropertyType(property: TOSCA_Property, allDataTypes: { [datatypeKey: string]: TOSCA_Datatype }, alreadyParsedTypes: TwoWayKeyTypeMap): string {
    switch (property.type) {
        case "map":
            if (property.entry_schema) {
                return `{[mapKey: string]: ${buildTsTypeForDatatype(property.entry_schema.type, allDataTypes, alreadyParsedTypes)}}`;
            } else {
                return "{[mapKey: string]: string}";
            }
        case "list":
            if (property.entry_schema) {
                return `${buildTsTypeForDatatype(property.entry_schema.type, allDataTypes, alreadyParsedTypes)}[]`;
            } else {
                return "string[]";
            }
        default:
            break;
    }
    return buildTsTypeForDatatype(property.type, allDataTypes, alreadyParsedTypes);
}

function buildTsTypeForCapability(capability: TOSCA_Capability_Type, allCapabilityTypes: { [capabilityKey: string]: TOSCA_Capability_Type }, allDataTypes: { [datatypeKey: string]: TOSCA_Datatype }, alreadyParsedTypes: TwoWayKeyTypeMap): string {
    let allProperties: { [propKey: string]: TOSCA_Property } = {};
    let currentCapability = capability;
    while (currentCapability) {
        if (currentCapability.properties) {
            for (const [propKey, prop] of Object.entries(currentCapability.properties)) {
                allProperties[propKey] = prop;
                //generatedTypeDefinition = generatedTypeDefinition.concat(`    ${propKey}${prop.required ? "" : "?"}: ${getTypeForToscaType(prop.type, allDataTypes)},\n`)
            }
        }
        if (currentCapability.derived_from) {
            currentCapability = allCapabilityTypes[currentCapability.derived_from];
        } else {
            break;
        }
    }
    if (Object.keys(allProperties).length > 0) {
        let generatedTypeDefinition = "{\n    properties: {\n";
        for (const [propKey, prop] of Object.entries(allProperties)) {
            generatedTypeDefinition = generatedTypeDefinition.concat(`    ${propKey}${prop.required ? "" : "?"}: ${getTypeForToscaPropertyType(prop, allDataTypes, alreadyParsedTypes)},\n`)
        }
        generatedTypeDefinition = generatedTypeDefinition.concat("    }\n}")
        return generatedTypeDefinition;
    } else {
        return "string" //TODO how to deal with a capability that has no properties?
    }
}
