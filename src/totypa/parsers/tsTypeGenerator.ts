import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { TOSCA_Service_Template } from '../tosca-types/template-types';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

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

            let results : Promise<string>[] = [];

            // 1. write profiles as Typescript (but basically JSON)
            let profileResults : Promise<ProfileInfo>[] = [];
            profiles.forEach(profile => {
                profileResults.push(saveGeneratedProfileAsJson(profile));
            })
            results.push(Promise.all(profileResults).then(profileInfos => {
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

            // 2. write Typescript Type Definition for the parsed profiles

            // TODO ensure type uniqueness
            // TODO for each TOSCA type definition generate a corresponding Typescript Type


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