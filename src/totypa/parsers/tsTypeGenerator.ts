import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { TOSCA_Service_Template } from '../tosca-types/template-types';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { TOSCA_Datatype, TOSCA_Property } from '../tosca-types/core-types';
import { data } from 'jquery';

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

            // TODO merge all definitions to be able to use them
            const mergedProfiles = mergeAllProfiles(profiles);

            // TODO ensure type uniqueness

            // 2. write Typescript Type Definition for the parsed profiles
            let profileTypescriptResults: Promise<profileTypesInfo>[] = [];
            profiles.forEach(profile => {
                profileTypescriptResults.push(saveGeneratedProfileAsTypescriptTypes(profile, mergedProfiles));
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


async function saveGeneratedProfileAsTypescriptTypes(profileInfo: ProfileInfo, mergedProfiles: TOSCA_Service_Template): Promise<profileTypesInfo> {

    let generatedTypeDefinitions: string[] = [];

    // 1. Datatypes
    if (profileInfo.profile.data_types) {
        for (const [datatypeKey, datatype] of Object.entries(profileInfo.profile.data_types)) {
            generatedTypeDefinitions.push(`export type ${toPascalCase(datatypeKey)} = ${buildTsTypeForDatatype(datatypeKey, datatype, mergedProfiles.data_types)}`)
        }
    }

    // 2. Operations

    // 3. Interfaces (depend on operations)

    // 3. Artifacts

    // 4. Groups

    // 5. Policies

    // 6. Capabilities (depend on datatypes)

    // 7. Relationships (depend on capabilities)

    // 8. Nodes (depend on datatypes, capabilities, relationships, interfaces, artifacts)


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


function buildTsTypeForDatatype(datatypeKey: string, datatype: TOSCA_Datatype, allDataTypes: { [datatypeKey: string]: TOSCA_Datatype }): string {
    if (!datatype.derived_from) {
        return "any";
    } else if (datatype.derived_from === "boolean") {
        return "boolean";
    } else if (datatype.derived_from === "string" || datatype.derived_from === "timestamp" || datatype.derived_from === "version") {
        return "string";
    } else if (datatype.derived_from === "integer" || datatype.derived_from === "float") {
        return "number";
    } else if (datatype.derived_from === "range") {
        return "number[]";
    } else { //TODO consider "list" and "map" here?
        let generatedTypeDefinition = "{\n";
        let datatypeProperties: { [propertyKey: string]: TOSCA_Property } = {};
        let currentType = datatype;
        while (currentType) {
            if (currentType.properties) {
                for (const [propKey, prop] of Object.entries(currentType.properties)) {
                    generatedTypeDefinition = generatedTypeDefinition.concat(`    ${propKey}${prop.required ? "" : "?"}: ${getTypeForToscaType(prop.type, allDataTypes)},\n`)
                }
            }
            if (currentType.derived_from) {
                currentType = allDataTypes[currentType.derived_from];
            } else {
                break;
            }
        }
        generatedTypeDefinition = generatedTypeDefinition.concat("}")
        return generatedTypeDefinition;
    }
}


function getTypeForToscaType(toscaType: string, allDataTypes: { [datatypeKey: string]: TOSCA_Datatype }): string {
    switch (toscaType) {
        case "boolean":
            return "boolean";
        case "string":
        case "timestamp":
        case "version":
            return "string";
        case "integer":
        case "float":
            return "number";
        case "range":
            return "number[]";
        case "list":
            return "string[]";
        case "map":
            return "{[mapKey: string]: string}";
        default:
            console.log("trying to derive type for: " + toscaType);
            break;
    }
    return getTypeForToscaType(allDataTypes[toscaType].derived_from, allDataTypes);
}