import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { TOSCA_Service_Template } from '../../tosca-types/v2dot0-types/template-types.js';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { TwoWayKeyTypeMap } from '../TwoWayKeyTypeMap.js';
import { TOSCA_Capability_Type_Key, TOSCA_Property_Name } from '../../tosca-types/v2dot0-types/alias-types.js';
import { TOSCA_Attribute_Definition, TOSCA_Capability_Definition, TOSCA_File, TOSCA_Node_Definition, TOSCA_Property_Definition, TOSCA_Relationship_Definition } from '@/totypa/tosca-types/v2dot0-types/definition-types.js';
import { TOSCA_Relationship_Template } from '@/totypa/tosca-types/v1dot3-types/template-types.js';

const YAML_KEY_PATTERN = new RegExp(/\.([A-z])/g);
const MATCH_FIRST_CHARACTER = new RegExp(/^./g);

type ProfileInfo = {
    jsonFileName: string,
    typesFileName: string,
    profileName: string,
    profile: TOSCA_File
}

const hint = "/* \n   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions \n*/\n";

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
    })
}

function parseAllProfiles(profilesFolder: string): Promise<Promise<ProfileInfo>[]> {
    return readdir(profilesFolder).then(entries => {
        return entries.sort((entryA, entryB) => {
            // make sure the tosca simple profile is always parsed first so that types are available

            if (entryA.includes("simple-profile")) {
                return -1
            }
            if (entryB.includes("tosca-simple")) {
                return 1;
            }
            return entryA.localeCompare(entryB);
        }).map(entry => {
            const fullDirectoryPath = path.join(profilesFolder, entry)
            return fs.promises.lstat(fullDirectoryPath).then(stats => {
                if (stats.isDirectory) {
                    return generateFromProfile(fullDirectoryPath).then(profile => {
                        let generatedName = entry.replace(/\s/g, "").replace(/[\.-]/g, "_");
                        return {
                            jsonFileName: `${generatedName}.ts`,
                            typesFileName: `${generatedName}_ts_types.ts`,
                            profileName: generatedName,
                            profile: profile
                        }
                    })
                }
            });
        });
    });
}

async function generateFromProfile(profileDirectory: string): Promise<TOSCA_File> {

    const profile: TOSCA_File = {
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
        const files = await readdir(profileDirectory);
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

            if (profileDocument.group_types) {
                for (let [key, value] of Object.entries(profileDocument.group_types)) {
                    profile.group_types[key] = value;
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

    fs.writeFile(`../../parsedProfiles/v2dot0-profiles/${profileInfo.jsonFileName}`, `${hint}\n${preparedData}`, (err) => {
        if (err) {
            console.error(`Could not save ${profileInfo.profileName} to file: ${err}`)
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



