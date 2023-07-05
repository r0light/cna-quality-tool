import { cna_modeling_tosca_profile } from '../../totypa/parsedProfiles/cna_modeling_tosca_profile'
import { MetaData } from '../common/entityDataTypes';

/**
 * The module for aspects related to a Backing Data quality model entity.
 * @module entities/backingData
 */

const BACKING_DATA_TOSCA_KEY = "cna.qualityModel.entities.BackingData";
const BACKING_DATA_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types[BACKING_DATA_TOSCA_KEY];

/**
 * Class representing a Backing Data entity.
 * @class
 */
class BackingData {

    #id: string;

    name: string;

    #metaData: MetaData;

    #includedData: { key: string, value: string }[]; //TODO more specific type

    /**
     * Create a Backing Data entity.representation has in the joint.dia.Graph model.
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Backing Data entity.
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     * @param {Array} includedData The included data values with key of this Backing Data entity.
     */
    constructor(id: string, name: string, metaData: MetaData, includedData: { key: string, value: string }[]) {
        this.#id = id;
        this.name = name;
        this.#metaData = metaData;
        this.#includedData = includedData;
    }

    /**
     * Returns the ID of this Backing Data entity.
     * @returns {string}
     */
    get getId() {
        return this.#id;
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
     * Returns the data items that are included in this Backing Data entities.
     * @returns {Array}
     */
    get getIncludedData() {
        return this.#includedData;
    }

    /**
     * Transforms the BackingData object into a String. 
     * @returns {string}
     */
    toString() {
        return "BackingData " + JSON.stringify(this);
    }
}

export { BackingData, BACKING_DATA_TOSCA_KEY };