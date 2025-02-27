import { EntityPropertyKey } from '@/totypa/parsedProfiles/v2dot0-profiles/propertyKeys.js';
import { cna_modeling_profile } from '../../totypa/parsedProfiles/v2dot0-profiles/cna_modeling_profile.js'
import { MetaData } from '../common/entityDataTypes.js';
import { EntityProperty, parseProperties } from '../common/entityProperty.js';


/**
 * The module for aspects related to a Data Aggregate quality model entity.
 * @module entities/dataAggregate
 */

const DATA_AGGREGATE_TOSCA_KEY = "cna-modeling.entities.DataAggregate";
const DATA_AGGREGATE_TOSCA_EQUIVALENT = cna_modeling_profile.node_types[DATA_AGGREGATE_TOSCA_KEY];


function getDataAggregateProperties(): EntityProperty[] {
    let parsed = parseProperties(DATA_AGGREGATE_TOSCA_EQUIVALENT.properties);

    return parsed;
}

/**
 * Class representing a Data Aggregate entity.
 * @class
 */
class DataAggregate {

    #id: string;

    name: string;

    #metaData: MetaData;

    #properties: EntityProperty[] = new Array();

    /**
     * Create a Data Aggregate entity.
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Data Aggregate entity. 
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     */
    constructor(id: string, name: string, metaData: MetaData) {
        this.#id = id;
        this.name = name;
        this.#metaData = metaData;
        this.#properties = getDataAggregateProperties();
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
     * Return the name of this Data Aggregate entity.
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
     * Returns all properties of this entity
     * @returns {EntityProperty[]}
    */
    getProperties() {
        return this.#properties;
    }

    setPropertyValue(propertyKey: EntityPropertyKey, propertyValue: any) {
        let propertyToSet = (this.#properties.find(property => property.getKey === propertyKey))
        if (propertyToSet) {
            propertyToSet.value = propertyValue
        } else {
            throw new Error(`Property with key ${propertyKey} not found in ${this.constructor}`)
        }
    }

    /**
     * Transforms the DataAggregate object into a String. 
     * @returns {string}
     */
    toString() {
        return "DataAggregate " + JSON.stringify(this);
    }
}

export { DataAggregate, DATA_AGGREGATE_TOSCA_KEY, getDataAggregateProperties };