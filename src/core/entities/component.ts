import { EntityProperty, loadAllProperties, parseProperties } from '../common/entityProperty'
import { Endpoint } from './endpoint.js'
import { ExternalEndpoint } from './externalEndpoint.js'
import { DataAggregate } from './dataAggregate.js'
import { BackingData } from './backingData.js'
import { Infrastructure } from './infrastructure.js'
import { cna_modeling_tosca_profile } from '../../totypa/parsedProfiles/cna_modeling_tosca_profile'
import { DataUsageRelation, MetaData } from '../common/entityDataTypes'
import { RelationToDataAggregate } from './RelationToDataAggregate'


/**
 * The module for aspects related to a Component quality model entity.
 * @module entities/component
 */
const COMPONENT_TOSCA_KEY = "cna.qualityModel.entities.Root.Component"
const COMPONENT_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types[COMPONENT_TOSCA_KEY];

function getComponentProperties(): EntityProperty[] {
    let parsed = loadAllProperties(COMPONENT_TOSCA_EQUIVALENT);

    for (const prop of parsed) {
        switch (prop.getKey) {
            case "managed":
                prop.setName = "Managed cloud service?";
                prop.setExample = "e.g. yes";
                break;
        }
    }
    return parsed;
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

    #backingDataEntities = new Array<{ backingData: BackingData, relation: DataUsageRelation, metaData: MetaData }>();

    #dataAggregateEntities = new Array<{ data: DataAggregate, relation: RelationToDataAggregate }>();

    #includedLinkEntities = new Array();

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

        // TODO necessary?
        let endpointAlreadyIncluded = (endpointToAdd) => {
            if (this.getEndpointEntities.some(endpoint => JSON.stringify(endpoint) === JSON.stringify(endpointToAdd))) {
                return true;
            } else if (this.getExternalEndpointEntities.some(externalEndpoint => JSON.stringify(externalEndpoint) === JSON.stringify(endpointToAdd))) {
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

    addBackingDataEntity(entityToAdd: BackingData, usageRelation: DataUsageRelation, metaData: MetaData) {
        this.#backingDataEntities.push({backingData: entityToAdd, relation: usageRelation, metaData: metaData });
    }

    addLinkEntity(linkEntity) {
        // TODO add check
        this.#includedLinkEntities.push(linkEntity);
    }

    /**
     * Returns the ID of this Component entity.
     * @returns {string}
     */
    get getId() {
        return this.#id;
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

    /**
    * Returns the {@link Link} entities included in this Component.
    * @returns {Link[]}
    */
    get getIncludedLinkEntities() {
        return this.#includedLinkEntities;
    }

    /**
     * Adds additional properties to this entity, only intended for subtypes to add additional properties
     * 
     * @param {EntityProperty[]} entityProperties 
     */
    addProperties(entityProperties: EntityProperty[]) {
        this.#properties = this.#properties.concat(entityProperties);
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