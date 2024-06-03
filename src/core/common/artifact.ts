

// TODO parse artifact types from TOSCA profiles

import { all_profiles } from "@/totypa/parsedProfiles/v2dot0-profiles/all_profiles";

function getAvailableArtifactTypes() {

    return all_profiles.flatMap(profile => {
        return Object.entries(profile.artifact_types).map(([typeKey, typeDefinition]) => {
            return typeKey;
        })
    })
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
    #properties: string;

    constructor(
        type: string,
        file: string,
        repository: string,
        description: string,
        deployPath: string,
        artifactVersion: string,
        checksum: string,
        checksumAlgorithm: string,
        properties: string
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

    getProperties(): string {
        return this.#properties;
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

    setProperties(properties: string): void {
        this.#properties = properties;
    }
}

export { Artifact, getAvailableArtifactTypes }