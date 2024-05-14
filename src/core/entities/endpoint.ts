import { EntityProperty, TextEntityProperty, parseProperties } from "../common/entityProperty.js";
import { tosca_simple_2_0 } from '../../totypa/parsedProfiles/v2dot0-profiles/tosca_simple_2_0.js'
import { MetaData } from "../common/entityDataTypes.js";
import { cna_modeling_profile } from '../../totypa/parsedProfiles/v2dot0-profiles/cna_modeling_profile.js'
import { DataAggregate } from "./dataAggregate.js";
import { RelationToDataAggregate } from "./relationToDataAggregate.js";

const ENDPOINT_TOSCA_KEY = "cna-modeling.entities.Endpoint";
const ENDPOINT_TOSCA_EQUIVALENT = cna_modeling_profile.node_types[ENDPOINT_TOSCA_KEY];

const ENDPOINT_CAPABILITY_KEY = "Endpoint";
const ENDPOINT_CAPABILITY_EQUIVALENT = tosca_simple_2_0.capability_types[ENDPOINT_CAPABILITY_KEY];

/**
 * The module for aspects related to a Endpoint quality model Entity.
 * @module entities/endpoint
 */

function getEndpointProperties(): EntityProperty[] {
    let parsed = parseProperties(ENDPOINT_CAPABILITY_EQUIVALENT.properties).concat(parseProperties(ENDPOINT_TOSCA_EQUIVALENT.properties));

    for (const prop of parsed) {
        switch (prop.getKey) {
            case "protocol":
                prop.setName = "Endpoint Type:";
                prop.setExample = "e.g. HTTP GET";
                (prop as TextEntityProperty).setOptions = [{
                    value: "GET",
                    text: "GET"
                },
                {
                    value: "POST",
                    text: "POST"
                },
                {
                    value: "Topic send-to",
                    text: "Topic send-to"
                },
                {
                    value: "Topic receive-from",
                    text: "Topic receive-from"
                }
                ];
                break;
            case "url_path":
                prop.setName = "Endpoint Path:";
                prop.setExample = "e.g. /orders";
                break;
            case "port": // TODO transform to Number type?
                prop.setName = "Port: ";
                prop.setExample = "e.g. 3306"
                break;
        }
    }
    return parsed;
}


/**
 * Class representing an Endpoint entity.
 * @class
 */
class Endpoint {

    #id: string;

    name: string;

    #metaData: MetaData;

    #dataAggregateEntities = new Array<{ data: DataAggregate, relation: RelationToDataAggregate }>();

    #properties: EntityProperty[];

    // TODO ref Component here?

    /**
     * Create an Endpoint entity.
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Endpoint entity. 
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     */
    constructor(id: string, name: string, metaData: MetaData) {
        this.#id = id;
        this.name = name;
        this.#metaData = metaData;
        this.#properties = getEndpointProperties();
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
     * Return the name of this Endpoint entity.
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
     * Returns the {@link DataAggregate} entities this endpoint is relying on
     */
    get getDataAggregateEntities() {
        return this.#dataAggregateEntities;
    }

    addDataAggregateEntity(dataEntityToAdd: DataAggregate, relation: RelationToDataAggregate) {
        this.#dataAggregateEntities.push({ data: dataEntityToAdd, relation });
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


    getProperties() {
        return this.#properties;
    }

    /**
     * Transforms the Endpoint object into a String. 
     * @returns {string}
     */
    toString() {
        return "Endpoint " + JSON.stringify(this);
    }
}

export { Endpoint, ENDPOINT_TOSCA_KEY, getEndpointProperties };