import { EntityProperty, SelectEntityProperty, parseProperties } from '../common/entityProperty.js'
import { Endpoint } from './endpoint.js'
import { ExternalEndpoint } from './externalEndpoint.js'
import { DataAggregate } from './dataAggregate.js'
import { BackingData } from './backingData.js'
import { cna_modeling_profile } from '../../totypa/parsedProfiles/v2dot0-profiles/cna_modeling_profile.js'
import { MetaData } from '../common/entityDataTypes.js'
import { RelationToDataAggregate } from './relationToDataAggregate.js'
import { RelationToBackingData } from './relationToBackingData.js'
import { BackingService } from './backingService.js'
import { Artifact } from '../common/artifact.js'


/**
 * The module for aspects related to a Component quality model entity.
 * @module entities/component
 */
const COMPONENT_TOSCA_KEY = "cna-modeling.entities.Component"
const COMPONENT_TOSCA_EQUIVALENT = cna_modeling_profile.node_types[COMPONENT_TOSCA_KEY];

function getComponentProperties(): EntityProperty[] {
    let parsed = parseProperties(COMPONENT_TOSCA_EQUIVALENT.properties);

    return parsed.map((prop) => {
        switch (prop.getKey) {
            case "managed":
                prop.setName = "Managed cloud service?";
                prop.setExample = "e.g. yes";
                return prop;
            default:
                return prop;
        }
    })
}

/**
 * Class representing a Component entity.
 * @class
 */
class Component {

    #id: string;

    name: string;

    #metaData: MetaData;

    #endpointEntities = new Array<Endpoint>();

    #externalEndpointEntities = new Array<ExternalEndpoint>();

    #backingDataEntities = new Array<{ backingData: BackingData, relation: RelationToBackingData }>();

    #dataAggregateEntities = new Array<{ data: DataAggregate, relation: RelationToDataAggregate }>();

    #proxiedBy: BackingService;

    #artifacts: Map<string, Artifact> = new Map<string, Artifact>();

    #properties: EntityProperty[] = new Array();

    /**
     * Create a Component entity.
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Component entity. 
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     */
    constructor(id: string, name: string, metaData: MetaData) {
        this.#id = id,
        this.name = name;
        this.#metaData = metaData;
        this.#properties = getComponentProperties();
    }

    /**
     * Add a quality model entity to the Component. However, a Component only includes {@link Endpoint}, {@link ExternalEndpoint}, {@link DataAggregate} 
     * and {@link BackingData} entities. Therefore, only one of these entity types can be added. Otherwise, a {@link TypeError} exception will be thrown.
     * @param {Endpoint|ExternalEndpoint|DataAggregate|BackingData} entityToAdd The quality Model entity that should be added.
     * @throws {TypeError} If the provided parameter is neither an instance of External Endpoint, Endpoint, Data Aggregate or Backing Data.  
     */
    addEndpoint(endpointToAdd: Endpoint | ExternalEndpoint) {

        let endpointAlreadyIncluded = (endpointToAdd) => {
            if (this.getEndpointEntities.some(endpoint => endpoint.getId === endpointToAdd.getId)) {
                return true;
            } else if (this.getExternalEndpointEntities.some(endpoint => endpoint.getId === endpointToAdd.getId)) {
                return true;
            }
            return false;
        }

        if (endpointToAdd instanceof ExternalEndpoint) {
            if (endpointAlreadyIncluded(endpointToAdd)) {
                return;
            }
            this.#externalEndpointEntities.push(endpointToAdd);
        } else if (endpointToAdd instanceof Endpoint) {
            if (endpointAlreadyIncluded(endpointToAdd)) {
                return;
            }
            this.#endpointEntities.push(endpointToAdd);
        }

    };

    addDataAggregateEntity(dataEntityToAdd: DataAggregate, relation: RelationToDataAggregate) {
        this.#dataAggregateEntities.push({ data: dataEntityToAdd, relation });
    }

    addBackingDataEntity(entityToAdd: BackingData, relation: RelationToBackingData) {
        this.#backingDataEntities.push({backingData: entityToAdd, relation: relation });
    }

    /**
     * Returns the ID of this Component entity.
     * @returns {string}
     */
    get getId() {
        return this.#id;
    }

    set setId(newId: string) {
        this.#id = newId;
    }

    /**
     * Return the name of this Component entity.
     * @returns {string}
     */
    get getName() {
        return this.name;
    }

    /**
     * Return the meta data for this node entity.
     * @returns {MetaData}
     */
    get getMetaData() {
        return this.#metaData;
    }

    /**
     * Returns the {@link Endpoint} entities included in this Component.
     * @returns {Endpoint[]}
     */
    get getEndpointEntities() {
        return this.#endpointEntities;
    }

    /**
     * Returns the {@link ExternalEndpoint} entities included in this Component.
     * @returns {ExternalEndpoint[]}
     */
    get getExternalEndpointEntities() {
        return this.#externalEndpointEntities;
    }

    /**
     * Returns the {@link DataAggregate} entities included in this Component.
     * @returns {DataAggregate[]}
     */
    get getDataAggregateEntities() {
        return this.#dataAggregateEntities;
    }

    /**
    * Returns the {@link BackingData} entities included in this Component.
    * @returns {BackingData[]}
    */
    get getBackingDataEntities() {
        return this.#backingDataEntities;
    }

    get getProxiedBy() {
        return this.#proxiedBy;
    }

    set setProxiedBy(proxy: BackingService) {
        this.#proxiedBy = proxy;
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

    /**
     * Adds additional properties to this entity, only intended for subtypes to add additional properties
     * 
     * @param {EntityProperty[]} entityProperties 
     */
    addProperties(entityProperties: EntityProperty[]) {
        for (const newProperty of entityProperties) {
            let existingPropertyIndex = this.#properties.findIndex(property => property.getKey === newProperty.getKey);
            if (~existingPropertyIndex) {
                this.#properties[existingPropertyIndex] = newProperty;
            } else {
                this.#properties.push(newProperty);
            }
        }
    }

    setPropertyValue(propertyKey: string, propertyValue: any) {
        let propertyToSet = (this.#properties.find(property => property.getKey === propertyKey))
        if (propertyToSet) {
            propertyToSet.value = propertyValue
        } else {
            throw new Error(`Property with key ${propertyKey} not found in ${this.constructor}`)
        }
    }

    getProperty(propertyKey: string) {
        return this.#properties.find(property => property.getKey === propertyKey);
    }

    /**
     * Returns all properties of this entity
     * @returns {EntityProperty[]}
     */
    getProperties() {
        return this.#properties;
    }

    /**
     * Transforms the Component object into a String. 
     * @returns {string}
     */
    toString() {
        return "Component " + JSON.stringify(this);
    }

}

export { Component, COMPONENT_TOSCA_KEY, getComponentProperties };