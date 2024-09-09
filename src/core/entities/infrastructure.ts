import { BackingData } from "./backingData.js";
import { EntityProperty, SelectEntityProperty, parseProperties } from "../common/entityProperty.js";
import { cna_modeling_profile } from '../../totypa/parsedProfiles/v2dot0-profiles/cna_modeling_profile.js'
import { MetaData } from "../common/entityDataTypes.js";
import { RelationToBackingData } from "./relationToBackingData.js";
import { Artifact } from "../common/artifact.js";
import { Network } from "./network.js";


/**
 * The module for aspects related to an Infrastructure quality model entity.
 * @module entities/infrastructure
 */

const INFRASTRUCTURE_TOSCA_KEY = "cna-modeling.entities.Infrastructure";
const INFRASTRUCTURE_TOSCA_EQUIVALENT = cna_modeling_profile.node_types[INFRASTRUCTURE_TOSCA_KEY];

function getInfrastructureProperties() {
    let parsed = parseProperties(INFRASTRUCTURE_TOSCA_EQUIVALENT.properties);

    return parsed.map((prop) => {
        switch (prop.getKey) {
            case "kind":
                prop.setName = "Kind of infrastructure";
                return prop;
            default:
                return prop;
        }
    })
}

/**
 * Class representing an Infrastructure entity.
 * @class
 */
class Infrastructure {

    #id: string;

    name: string;

    #metaData: MetaData;

    #backingDataEntities = new Array<{ backingData: BackingData, relation: RelationToBackingData }>();

    #artifacts: Map<string, Artifact> = new Map<string, Artifact>();

    #networks: Map<string, Network> = new Map();

    #properties: EntityProperty[];

    /**
     * Create an Infrastructure entity.
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Infrastructure entity. 
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     */
    constructor(id: string, name: string, metaData: MetaData) {
        this.#id = id;
        this.name = name;
        this.#metaData = metaData;
        this.#properties = getInfrastructureProperties();
    }

    /**
     * Add a {@link BackingData} entity to the Component. In case the provided entity is not a Backing Data entity, a {@link TypeError} exception will be thrown.
     * @param {BackingData} backingDataEntity The Backing Data entity that should be added.
     * @throws {TypeError} If the provided parameter is neither an instance of External Endpoint, Endpoint, Data Aggregate or Backing Data.  
     */
    addBackingDataEntity(backingDataEntity: BackingData, relation: RelationToBackingData) {
        this.#backingDataEntities.push({ backingData: backingDataEntity, relation: relation });

        /*
        const errorMessage = "The provided entity cannot be added. Only BackingData entities are allowed. However, the object to add was: " + Object.getPrototypeOf(backingDataEntity) + JSON.stringify(backingDataEntity);
        throw new TypeError(errorMessage);
        */
    }

    /**
     * Returns the ID of this Infrastructure entity.
     * @returns {string}
     */
    get getId() {
        return this.#id;
    }

    set setId(newId: string) {
        this.#id = newId;
    }

    /**
     * Return the meta data for this node entity.
     * @returns {MetaData}
     */
    get getMetaData() {
        return this.#metaData;
    }

    /**
     * Return the name of this Infrastructure entity.
     * @returns {string}
     */
    get getName() {
        return this.name;
    }

    /**
     * Returns the {@link BackingData} entities included in this Infrastructure entity.
     * @returns {BackingData[]}
     */
    get getBackingDataEntities() {
        return this.#backingDataEntities;
    }

    get getArtifacts() {
        return this.#artifacts;
    }

    setArtifact(artifactKey: string, artifact: Artifact) {
        this.#artifacts.set(artifactKey, artifact)
    }

    removeArtifact(artifactKey: string) {
        this.#artifacts.delete(artifactKey);
    }

    get getNetworks() {
        return this.#networks;
    }

    addNetwork(network: Network) {
        this.#networks.set(network.getId, network);
    }

    removeNetwork(networkId: string) {
        this.#networks.delete(networkId);
    }
    
    /**
     * Returns all properties of this entity
     * @returns {EntityProperty[]}
     */
    getProperties() {
        return this.#properties;
    }

    getProperty(propertyKey: string) {
        return this.#properties.find(property => property.getKey === propertyKey);
    }

    setPropertyValue(propertyKey: string, propertyValue: any) {
        let propertyToSet = (this.#properties.find(property => property.getKey === propertyKey))
        if (propertyToSet) {
            propertyToSet.value = propertyValue
        } else {
            throw new Error(`Property with key ${propertyKey} not found in ${this.constructor}`)
        }
    }

    /**
     * Transforms the Infrastructure object into a String. 
     * @returns {string}
     */
    toString() {
        return "Infrastructure " + JSON.stringify(this);
    }

}

export { Infrastructure, INFRASTRUCTURE_TOSCA_KEY, getInfrastructureProperties };