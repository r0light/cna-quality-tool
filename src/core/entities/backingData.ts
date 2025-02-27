import { EntityPropertyKey } from '@/totypa/parsedProfiles/v2dot0-profiles/propertyKeys.js';
import { cna_modeling_profile } from '../../totypa/parsedProfiles/v2dot0-profiles/cna_modeling_profile.js'
import { MetaData } from '../common/entityDataTypes.js';
import { EntityProperty, parseProperties } from '../common/entityProperty.js';

/**
 * The module for aspects related to a Backing Data quality model entity.
 * @module entities/backingData
 */

const BACKING_DATA_TOSCA_KEY = "cna-modeling.entities.BackingData";
const BACKING_DATA_TOSCA_EQUIVALENT = cna_modeling_profile.node_types[BACKING_DATA_TOSCA_KEY];

function getBackingDataProperties(): EntityProperty[] {
    let parsed = parseProperties(BACKING_DATA_TOSCA_EQUIVALENT.properties);
    return parsed;
}

/**
 * Class representing a Backing Data entity.
 * @class
 */
class BackingData {

    #id: string;

    name: string;

    #metaData: MetaData;

    #properties: EntityProperty[] = new Array();

    /**
     * Create a Backing Data entity.representation has in the joint.dia.Graph model.
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Backing Data entity.
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     */
    constructor(id: string, name: string, metaData: MetaData, ) {
        this.#id = id;
        this.name = name;
        this.#metaData = metaData;
        this.#properties = getBackingDataProperties();
    }

    /**
     * Returns the ID of this Backing Data entity.
     * @returns {string}
     */
    get getId() {
        return this.#id;
    }

    set setId(newId: string) {
        this.#id = newId;
    }

    /**
     * Return the name of this Backing Data entity.
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

    getProperty(propertyKey: EntityPropertyKey) {
        return this.#properties.find(property => property.getKey === propertyKey);
    }

    /**
     * Transforms the BackingData object into a String. 
     * @returns {string}
     */
    toString() {
        return "BackingData " + JSON.stringify(this);
    }
}

export { BackingData, BACKING_DATA_TOSCA_KEY, getBackingDataProperties };