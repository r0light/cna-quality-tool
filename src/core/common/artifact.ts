

// TODO parse artifact types from TOSCA profiles

import { all_profiles } from "@/totypa/parsedProfiles/v2dot0-profiles/all_profiles";
import { EntityProperty } from "./entityProperty";
import { EntityPropertyKey } from "@/totypa/parsedProfiles/v2dot0-profiles/propertyKeys";

function getAvailableArtifactTypes() {

    return all_profiles.flatMap(profile => {
        return Object.entries(profile.artifact_types).map(([typeKey, typeDefinition]) => {
            return typeKey;
        })
    })
}

function getArtifactProperties() {
    return [];
}


// Aligned to 5.3.7.2 Artifact definition
class Artifact {
    #type: string;
    #file: string;
    #repository: string;
    #description: string;
    #deployPath: string;
    #artifactVersion: string;
    #checksum: string;
    #checksumAlgorithm: string;
    #properties: EntityProperty[];

    constructor(
        type: string,
        file: string,
        repository: string,
        description: string,
        deployPath: string,
        artifactVersion: string,
        checksum: string,
        checksumAlgorithm: string,
        properties: EntityProperty[]
    ) {
        this.#type = type;
        this.#file = file;
        this.#repository = repository;
        this.#description = description;
        this.#deployPath = deployPath;
        this.#artifactVersion = artifactVersion;
        this.#checksum = checksum;
        this.#checksumAlgorithm = checksumAlgorithm;
        this.#properties = properties;
    }

    getType(): string {
        return this.#type;
    }

    getFile(): string {
        return this.#file;
    }

    getRepository(): string {
        return this.#repository;
    }

    getDescription(): string {
        return this.#description;
    }

    getDeployPath(): string {
        return this.#deployPath;
    }

    getArtifactVersion(): string {
        return this.#artifactVersion;
    }

    getChecksum(): string {
        return this.#checksum;
    }

    getChecksumAlgorithm(): string {
        return this.#checksumAlgorithm;
    }

    setType(type: string): void {
        this.#type = type;
    }

    setFile(file: string): void {
        this.#file = file;
    }

    setRepository(repository: string): void {
        this.#repository = repository;
    }

    setDescription(description: string): void {
        this.#description = description;
    }

    setDeployPath(deployPath: string): void {
        this.#deployPath = deployPath;
    }

    setArtifactVersion(artifactVersion: string): void {
        this.#artifactVersion = artifactVersion;
    }

    setChecksum(checksum: string): void {
        this.#checksum = checksum;
    }

    setChecksumAlgorithm(checksumAlgorithm: string): void {
        this.#checksumAlgorithm = checksumAlgorithm;
    }

    getAsSimpleObject(keyToAssign: string) {
        if (keyToAssign) {
            return {
                key: keyToAssign,
                type: this.#type,
                file: this.#file,
                repository: this.#repository,
                description: this.#description,
                deploy_path: this.#deployPath,
                artifact_version: this.#artifactVersion,
                checksum: this.#checksum,
                checksum_algorithm: this.#checksumAlgorithm
            }
        } else {
            return {
                type: this.#type,
                file: this.#file,
                repository: this.#repository,
                description: this.#description,
                deploy_path: this.#deployPath,
                artifact_version: this.#artifactVersion,
                checksum: this.#checksum,
                checksum_algorithm: this.#checksumAlgorithm
            }
        }


    }

    setPropertyValue(propertyKey: EntityPropertyKey, propertyValue: any) {
        let propertyToSet = (this.#properties.find(property => property.getKey === propertyKey))
        if (propertyToSet) {
            propertyToSet.value = propertyValue
        } else {
            throw new Error(`Property with key ${propertyKey} not found in ${this.constructor}`)
        }
    }

    getProperty(propertyKey: EntityPropertyKey) {
        return this.#properties.find(property => property.getKey === propertyKey);
    }

    getProperties() {
        return this.#properties;
    }


}

export { Artifact, getAvailableArtifactTypes }