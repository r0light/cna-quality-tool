import { cna_modeling_tosca_profile } from '../totypa/parsedProfiles/cna_modeling_tosca_profile'


/**
 * The module for aspects related to a Data Aggregate quality model entity.
 * @module entities/dataAggregate
 */

const DATA_AGGREGATE_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types["cna.qualityModel.entities.DataAggregate"];

/**
 * Class representing a Data Aggregate entity.
 * @class
 */
class DataAggregate {

    #id: string; //TODO

    #modelId: string;

    name: string;

    #persistedBy: string[];

    // TODO ref components here?

    /**
     * Create a Data Aggregate entity.
     * @param {string} name The name of the Data Aggregate entity. 
     * @param {modelId} modelId The ID, the respective entity representation has in the joint.dia.Graph model.
     */
    constructor(name, modelId) {
        this.name = name;
        this.#modelId = modelId;
        this.#persistedBy = new Array();
    }

    /**
     * Add name of a component type entity that persists this Data Aggregate entity.
     * @param {string} persistedByEntity The name of a {@link Component} entity that persists this Data Aggregate.
     */
    addPersistedByEntity(persistedByEntity) {
        this.#persistedBy.push(persistedByEntity);
    }

    /**
    * Returns the ID of this Component entity.
    * @returns {string}
    */
    get getId() {
        return this.#id;
    }

    /**
     * Returns the ID, the respective entity representation has in the joint.dia.Graph model.
     * @returns {string}
     */
    get getModelId() {
        return this.#modelId;
    }

    /**
     * Return the name of this Data Aggregate entity.
     * @returns {string}
     */
    get getName() {
        return this.name;
    }

    /**
     * Returns the Entity names that persist this Data Aggregate entity.
     * @returns {string}
     */
    get getPersistedBy() {
        return this.#persistedBy;
    }

    /**
     * Transforms the DataAggregate object into a String. 
     * @returns {string}
     */
    toString() {
        return "DataAggregate " + JSON.stringify(this);
    }
}

export { DataAggregate, DATA_AGGREGATE_TOSCA_EQUIVALENT };