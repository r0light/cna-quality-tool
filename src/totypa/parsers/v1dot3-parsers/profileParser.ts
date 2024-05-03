import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { TOSCA_Service_Template } from '../../tosca-types/v1dot3-types/template-types.js';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { TOSCA_Artifact, TOSCA_Attribute, TOSCA_Datatype, TOSCA_Interface, TOSCA_Property } from '../../tosca-types/v1dot3-types/core-types.js';
import { TwoWayKeyTypeMap } from '../TwoWayKeyTypeMap.js';
import { TOSCA_Capability, TOSCA_Capability_Type, TOSCA_Node, TOSCA_Relationship, TOSCA_Requirement } from '../../tosca-types/v1dot3-types/entity-types.js';
import { TOSCA_Capability_Type_Key } from '../../tosca-types/v1dot3-types/alias-types.js';

const YAML_KEY_PATTERN = new RegExp(/\.([A-z])/g);
const MATCH_FIRST_CHARACTER = new RegExp(/^./g);

type ProfileInfo = {
    jsonFileName: string,
    typesFileName: string,
    profileName: string,
    profile: TOSCA_Service_Template
}

const hint = "/* \n   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions \n*/\n";

startParsing();

export async function startParsing() {
    parseAllProfiles("../../../../tosca-profiles/v1dot3-profiles/").then(promises => {
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

                let preparedData = `import { TOSCA_Service_Template } from '../../tosca-types/v1dot3-types/template-types.js';\n${importStatements.join("\n")}\n\nexport const all_profiles: TOSCA_Service_Template[] = [\n${profileInfos.map(info => info.profileName).join(",\n")}\n];`

                fs.writeFile(`../../parsedProfiles/v1dot3-profiles/all_profiles.ts`, `${hint}\n${preparedData}`, (err) => {
                    if (err) {
                        console.error(`Could not save all_profiles: ${err}`)
                        return err;
                    }
                })
            }))

            // merge all definitions to be able to use them
            const mergedProfiles = mergeAllProfiles(profiles);

            // remember all stored types
            const typeKeyMap = new TwoWayKeyTypeMap();

            // TODO ensure type uniqueness

            // 2. write Typescript Type Definition for the parsed profiles
            let processInSequence: Promise<void> = Promise.resolve();
            profiles.forEach(profile => {
                processInSequence = processInSequence.then(result => {
                    let typescriptTypeGenerator = new TypescriptTypeGenerator(mergedProfiles, profile, typeKeyMap);
                    typescriptTypeGenerator.saveGeneratedProfileAsTypescriptTypes();
                });
            })
            results.push(processInSequence);

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
            if (entryB.includes("tosca-simple-profile")) {
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

    let preparedData = `import { TOSCA_Service_Template } from '../../tosca-types/v1dot3-types/template-types.js';\n\nexport const ${profileInfo.profileName}: TOSCA_Service_Template = ${JSON.stringify(profileInfo.profile, null, 2)};`

    fs.writeFile(`../../parsedProfiles/v1dot3-profiles/${profileInfo.jsonFileName}`, `${hint}\n${preparedData}`, (err) => {
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


class TypescriptTypeGenerator {

    #mergedProfile: TOSCA_Service_Template;

    #currentProfile: ProfileInfo;

    #typeKeyMap: TwoWayKeyTypeMap;

    #importManager: ImportManager;

    constructor(mergedProfile: TOSCA_Service_Template, currentProfile: ProfileInfo, typeKeyMap: TwoWayKeyTypeMap) {
        this.#mergedProfile = mergedProfile;
        this.#currentProfile = currentProfile;
        this.#typeKeyMap = typeKeyMap;
        this.#importManager = new ImportManager();
    }

    async saveGeneratedProfileAsTypescriptTypes(): Promise<profileTypesInfo> {

        let generatedTypeDefinitions: string[] = [];

        // 1. Datatypes
        if (this.#currentProfile.profile.data_types) {
            for (const [datatypeKey, datatype] of Object.entries(this.#currentProfile.profile.data_types)) {
                let datatypeTypeName = toPascalCase(datatypeKey);
                generatedTypeDefinitions.push(`export type ${datatypeTypeName} = ${this.#buildTsTypeForDatatype(datatype)}`)
                this.#typeKeyMap.add({ typeName: datatypeTypeName, sourceFile: this.#currentProfile.typesFileName }, datatypeKey);
            }
        }

        // 2. Interfaces (together with operations)
        if (this.#currentProfile.profile.interface_types) {
            for (const [interfaceKey, interfaceDefinition] of Object.entries(this.#currentProfile.profile.interface_types)) {
                let interfaceTypeName = toPascalCase(interfaceKey);
                generatedTypeDefinitions.push(`export type ${interfaceTypeName} = object`)
                // TODO add attributes to type, based on an example of a node template that declares an interface of a specific type.
                // TODO consider derived_from to add all attributes also of parent interface types
                this.#typeKeyMap.add({ typeName: interfaceTypeName, sourceFile: this.#currentProfile.typesFileName }, interfaceKey);
            }
        }

        // 3. Artifacts
        if (this.#currentProfile.profile.artifact_types) {
            for (const [artifactKey, artifact] of Object.entries(this.#currentProfile.profile.artifact_types)) {
                let artifactTypeName = toPascalCase(artifactKey);
                generatedTypeDefinitions.push(`export type ${artifactTypeName} = object`)
                // TODO add attributes to type, based on an example of a node template that declares an artifact of a specific type.
                // TODO consider derived_from to add all attributes also of parent artifact types
                this.#typeKeyMap.add({ typeName: artifactTypeName, sourceFile: this.#currentProfile.typesFileName }, artifactKey);
            }
        }

        // 4. Capabilities (depend on datatypes)
        if (this.#currentProfile.profile.capability_types) {
            for (const [capabilityKey, capability] of Object.entries(this.#currentProfile.profile.capability_types)) {
                let capabilityTypeName = toPascalCase(capabilityKey);
                generatedTypeDefinitions.push(`export type ${capabilityTypeName} = ${this.#buildTsTypeForCapability(capability)}`)
                this.#typeKeyMap.add({ typeName: capabilityTypeName, sourceFile: this.#currentProfile.typesFileName }, capabilityKey);
            }
        }

        // 5. Relationships (depend on capabilities)
        if (this.#currentProfile.profile.relationship_types) {
            for (const [relationshipKey, relationship] of Object.entries(this.#currentProfile.profile.relationship_types)) {
                let relationshipTypeName = toPascalCase(relationshipKey);
                generatedTypeDefinitions.push(`export type ${relationshipTypeName} = ${this.#buildTsTypeForRelationship(relationship)}`);
                this.#typeKeyMap.add({ typeName: relationshipTypeName, sourceFile: this.#currentProfile.typesFileName }, relationshipKey);
            }
        }

        // 6. Nodes (depend on datatypes, capabilities, relationships, interfaces, artifacts)
        if (this.#currentProfile.profile.node_types) {
            for (const [nodeKey, node] of Object.entries(this.#currentProfile.profile.node_types)) {
                let nodeTypeName = toPascalCase(nodeKey);
                generatedTypeDefinitions.push(`export type ${nodeTypeName} = ${this.#buildTsTypeForNode(nodeKey, node)}`);
                this.#typeKeyMap.add({ typeName: nodeTypeName, sourceFile: this.#currentProfile.typesFileName }, nodeKey);
            }
        }

        // 7. Groups (depend on nodes)

        // 8. Policies (depend on nodes, groups)

        // write file
        let hint = "/* \n   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions \n*/\n";

        let imports = 'import { TOSCA_Requirement_Assignment } from "../../tosca-types/v1dot3-types/template-types.js"\n'
            .concat('import { TOSCA_Metadata, TOSCA_Interface, TOSCA_Artifact } from "../../tosca-types/v1dot3-types/core-types.js"\n')
            .concat(this.#importManager.generateImportStatement());

        let preparedData = generatedTypeDefinitions.join("\n");

        let fileName = `${this.#currentProfile.profileName}_ts_types.ts`;
        fs.writeFile(`../../parsedProfiles/v1dot3-profiles/${fileName}`, `${hint}\n${imports}\n${preparedData}`, (err) => {
            if (err) {
                console.error(`Could not save ${this.#currentProfile.profileName} to file: ${err}`)
                return err;
            }
        })

        return {
            profileName: this.#currentProfile.profileName,
            fileName: fileName,
            types: generatedTypeDefinitions
        }
    }


    #buildTsTypeForDatatype(datatype: string | TOSCA_Datatype): string {
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
                    let alreadyParsed = this.#typeKeyMap.getType(datatype);
                    if (alreadyParsed.typeName) {
                        console.log("type " + datatype + " found in already parsed types");
                        if (alreadyParsed.sourceFile !== this.#currentProfile.typesFileName) {
                            this.#importManager.add(alreadyParsed.typeName, alreadyParsed.sourceFile);
                        }
                        return alreadyParsed.typeName;
                    } else {
                        console.log("trying to derive type for: " + datatype);
                        return this.#buildTsTypeForDatatype(this.#mergedProfile.data_types[datatype]);
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
                        return this.#buildTsTypeForDatatype(datatype.derived_from)
                    default:
                        console.log("trying to derive type for: " + datatype);
                        break;
                }
                let generatedTypeDefinition = "{\n    properties: {\n";
                let currentType = datatype;
                while (currentType) {
                    if (currentType.properties) {
                        for (const [propKey, prop] of Object.entries(currentType.properties)) {
                            generatedTypeDefinition = generatedTypeDefinition.concat(`    ${propKey}${prop.required ? "" : "?"}: ${this.#getTypeForToscaPropertyType(prop)},\n`)
                        }
                    }
                    if (currentType.derived_from) {
                        currentType = this.#mergedProfile.data_types[currentType.derived_from];
                    } else {
                        break;
                    }
                }
                generatedTypeDefinition = generatedTypeDefinition.concat("    }\n}")
                return generatedTypeDefinition;
            }
        }
    }


    #getTypeForToscaPropertyType(property: TOSCA_Property): string {
        switch (property.type) {
            case "map":
                if (property.entry_schema) {
                    return `{[mapKey: string]: ${this.#buildTsTypeForDatatype(property.entry_schema.type)}}`;
                } else {
                    return "{[mapKey: string]: string}";
                }
            case "list":
                if (property.entry_schema) {
                    return `${this.#buildTsTypeForDatatype(property.entry_schema.type)}[]`;
                } else {
                    return "string[]";
                }
            default:
                break;
        }
        return this.#buildTsTypeForDatatype(property.type);
    }

    #getTypeForToscaAttributeType(attribute: TOSCA_Attribute): string {
        switch (attribute.type) {
            case "map":
                if (attribute.entry_schema) {
                    return `{[mapKey: string]: ${this.#buildTsTypeForDatatype(attribute.entry_schema.type)}}`;
                } else {
                    return "{[mapKey: string]: string}";
                }
            case "list":
                if (attribute.entry_schema) {
                    return `${this.#buildTsTypeForDatatype(attribute.entry_schema.type)}[]`;
                } else {
                    return "string[]";
                }
            default:
                break;
        }
        return this.#buildTsTypeForDatatype(attribute.type);
    }

    #buildTsTypeForCapability(capability: TOSCA_Capability_Type): string {
        let properties = this.#deriveAllProperties(capability, this.#mergedProfile.capability_types);
        let attributes = this.#deriveAllAttributes(capability, this.#mergedProfile.capability_types);
        if (properties.length === 0 && attributes.length === 0) {
            return "any" //TODO how to deal with a capability that has no properties and no attributes?
        }
        return `{\n    ${properties}${attributes}}`;
    }

    #buildTsTypeForRelationship(relationship: TOSCA_Relationship): string {
        let properties = this.#deriveAllProperties(relationship, this.#mergedProfile.relationship_types);
        let attributes = this.#deriveAllAttributes(relationship, this.#mergedProfile.relationship_types);
        if (properties.length === 0 && attributes.length === 0) {
            return "any" //TODO how to deal with a capability that has no properties and no attributes?
        }

        return `{\n    ${properties}${attributes}}`;
    }

    #buildTsTypeForNode(nodeTypeKey: string, node: TOSCA_Node): string {
        let properties = this.#deriveAllProperties(node, this.#mergedProfile.node_types);
        let attributes = this.#deriveAllAttributes(node, this.#mergedProfile.node_types);
        let capabilities = this.#deriveAllCapabilities(node, this.#mergedProfile.node_types);
        let requirements = this.#deriveAllRequirements(node, this.#mergedProfile.node_types);

        let interfaces = this.#copyAllInterfaces(node, this.#mergedProfile.node_types);
        let artifacts = this.#copyAllArtifacts(node, this.#mergedProfile.node_types);

        return `{\n    type: "${nodeTypeKey}",
                       metadata?: TOSCA_Metadata,
                       ${properties}${attributes}${capabilities}${requirements}${interfaces}${artifacts}}`;
    }

    #deriveAllProperties(entity: TOSCA_Relationship | TOSCA_Capability_Type | TOSCA_Node, allEntities: { [entityKey: string]: TOSCA_Relationship | TOSCA_Capability_Type | TOSCA_Node }): string {
        let allProperties: { [propKey: string]: TOSCA_Property } = {};
        let currentEntity = entity;
        while (currentEntity) {
            if (currentEntity.properties) {
                for (const [propKey, prop] of Object.entries(currentEntity.properties)) {
                    allProperties[propKey] = prop;
                }
            }
            if (currentEntity.derived_from) {
                currentEntity = allEntities[currentEntity.derived_from];
            } else {
                break;
            }
        }
        if (Object.keys(allProperties).length > 0) {
            let generatedPropertiesTypeDefinition = "properties?: {\n";
            for (const [propKey, prop] of Object.entries(allProperties)) {
                generatedPropertiesTypeDefinition = generatedPropertiesTypeDefinition.concat(`    ${propKey}${prop.required ? "" : "?"}: ${this.#getTypeForToscaPropertyType(prop)},\n`)
            }
            return generatedPropertiesTypeDefinition.concat("},\n")
        }
        return "";
    }

    #deriveAllAttributes(entity: TOSCA_Relationship | TOSCA_Capability_Type | TOSCA_Node, allEntities: { [entityKey: string]: TOSCA_Relationship | TOSCA_Capability_Type | TOSCA_Node }): string {
        let allAttributes: { [attrKey: string]: TOSCA_Attribute } = {};
        let currentEntity = entity;
        while (currentEntity) {
            if (currentEntity.attributes) {
                for (const [propKey, prop] of Object.entries(currentEntity.attributes)) {
                    allAttributes[propKey] = prop;
                }
            }
            if (currentEntity.derived_from) {
                currentEntity = allEntities[currentEntity.derived_from];
            } else {
                break;
            }
        }
        if (Object.keys(allAttributes).length > 0) {
            let generatedAttributesTypeDefinition = "attributes?: {\n";
            for (const [attrKey, attribute] of Object.entries(allAttributes)) {
                generatedAttributesTypeDefinition = generatedAttributesTypeDefinition.concat(`    ${attrKey}?: ${this.#getTypeForToscaAttributeType(attribute)},\n`)
            }
            return generatedAttributesTypeDefinition.concat("},\n")
        }
        return "";
    }

    #deriveAllCapabilities(node: TOSCA_Node, allNodes: { [nodeKey: string]: TOSCA_Node }): string {
        let allCapabilities: { [capabilityKey: string]: TOSCA_Capability | TOSCA_Capability_Type_Key } = {};
        let currentNode = node;
        while (currentNode) {
            if (currentNode.capabilities) {
                for (const [capabilityKey, capability] of Object.entries(currentNode.capabilities)) {
                    allCapabilities[capabilityKey] = capability;
                }
            }
            if (currentNode.derived_from) {
                currentNode = allNodes[currentNode.derived_from];
            } else {
                break;
            }
        }
        if (Object.keys(allCapabilities).length > 0) {
            let generatedCapabilitesTypeDefinition = "capabilities?: {\n";
            for (const [capabilityKey, capability] of Object.entries(allCapabilities)) {
                let alreadyParsed = typeof capability === "string" ? this.#typeKeyMap.getType(capability) : this.#typeKeyMap.getType(capability.type);
                if (alreadyParsed.typeName) {
                    if (alreadyParsed.sourceFile !== this.#currentProfile.typesFileName) {
                        this.#importManager.add(alreadyParsed.typeName, alreadyParsed.sourceFile);
                    }
                    generatedCapabilitesTypeDefinition = generatedCapabilitesTypeDefinition.concat(`    ${capabilityKey}?: ${alreadyParsed.typeName},\n`)
                }
            }
            return generatedCapabilitesTypeDefinition.concat("},\n")
        }
        return "";
    }

    #deriveAllRequirements(node: TOSCA_Node, allNodes: { [nodeKey: string]: TOSCA_Node }): string {
        let allRequirements: { [requirementKey: string]: TOSCA_Requirement | string }[] = [];
        let currentNode = node;
        while (currentNode) {
            if (currentNode.requirements) {
                allRequirements.push(...currentNode.requirements);
            }
            if (currentNode.derived_from) {
                currentNode = allNodes[currentNode.derived_from];
            } else {
                break;
            }
        }
        if (allRequirements.length > 0) {

            let generatedRequirementsTypeDefinition = "requirements?: ";
            let requirementTypeOptions: string[] = [];
            for (const requirement of allRequirements) {
                for (const [requirementKey, requirementDefinition] of Object.entries(requirement)) {
                    requirementTypeOptions.push(`{${requirementKey}: TOSCA_Requirement_Assignment | string}`);
                }
            }
            return generatedRequirementsTypeDefinition.concat(requirementTypeOptions.join(" | "), "[],\n");
        }
        return "";
    }

    #copyAllInterfaces(node: TOSCA_Node, allNodes: { [nodeKey: string]: TOSCA_Node }): string {
        let allInterfaces: {[interfaceKey: string]: TOSCA_Interface}[] = [];
        let currentNode = node;
        while (currentNode) {
            if (currentNode.interfaces) {
                for (const [interfaceKey, interfaceDefinition] of Object.entries(currentNode.interfaces)) {
                    allInterfaces[interfaceKey] = interfaceDefinition;
                }
            }
            if (currentNode.derived_from) {
                currentNode = allNodes[currentNode.derived_from];
            } else {
                break;
            }
        }
        let generatedInterfacesTypeDefinition = "interfaces?: {\n";
        if (Object.keys(allInterfaces).length > 0) {
            for (const [interfaceKey, interfaceDefinition] of Object.entries(allInterfaces)) {
                generatedInterfacesTypeDefinition = generatedInterfacesTypeDefinition.concat(`    ${interfaceKey}?: TOSCA_Interface,\n`)
            }
        }
        return generatedInterfacesTypeDefinition.concat("    [interfaceKey: string]: TOSCA_Interface\n},\n")
    }


    #copyAllArtifacts(node: TOSCA_Node, allNodes: { [nodeKey: string]: TOSCA_Node }): string {
        let allArtifacts: {[artifactKey: string]: TOSCA_Artifact}[] = [];
        let currentNode = node;
        while (currentNode) {
            if (currentNode.artifacts) {
                for (const [artifactKey, artifact] of Object.entries(currentNode.artifacts)) {
                    allArtifacts[artifactKey] = artifact;
                }
            }
            if (currentNode.derived_from) {
                currentNode = allNodes[currentNode.derived_from];
            } else {
                break;
            }
        }
        let generatedArtifactsTypeDefinition = "artifacts?: {\n";
        if (Object.keys(allArtifacts).length > 0) {
            for (const [artifactKey, artifact] of Object.entries(allArtifacts)) {
                generatedArtifactsTypeDefinition = generatedArtifactsTypeDefinition.concat(`    ${artifactKey}?: TOSCA_Artifact,\n`)
            }
        }
        return generatedArtifactsTypeDefinition.concat("    [artifactKey: string]: TOSCA_Artifact\n},\n")
    }
}



