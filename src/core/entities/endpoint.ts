import { EntityProperty, TextEntityProperty, mergeAllCapabilitiesProperties, parseCapabilitiesProperties, parseProperties } from "../common/entityProperty.js";
import { MetaData } from "../common/entityDataTypes.js";
import { cna_modeling_tosca_profile } from '../../totypa/parsedProfiles/v2dot0-profiles/cna_modeling_tosca_profile.js'
import { DataAggregate } from "./dataAggregate.js";
import { RelationToDataAggregate } from "./relationToDataAggregate.js";
import { EntityPropertyKey } from "@/totypa/parsedProfiles/v2dot0-profiles/propertyKeys.js";
import { Artifact } from "../common/artifact.js";

const ENDPOINT_TOSCA_KEY = "cna-modeling.entities.Endpoint";
const ENDPOINT_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types[ENDPOINT_TOSCA_KEY];

/**
 * The module for aspects related to a Endpoint quality model Entity.
 * @module entities/endpoint
 */

function getEndpointProperties(): EntityProperty[] {
    let parsed = parseProperties(ENDPOINT_TOSCA_EQUIVALENT.properties).concat(mergeAllCapabilitiesProperties(parseCapabilitiesProperties(ENDPOINT_TOSCA_EQUIVALENT.capabilities))).filter(property => !["allow_access_to", "documented_by"].includes(property.getKey));

    for (const prop of parsed) {
        switch (prop.getKey) {
            case "method_name":
                prop.setName = "Method name";
                prop.setExample = "e.g. GET if protocol is http";
                (prop as TextEntityProperty).setOptions = [{
                    value: "GET",
                    text: "GET"
                },
                {
                    value: "POST",
                    text: "POST"
                },
                {
                    value: "publish",
                    text: "publish"
                },
                {
                    value: "subscribe",
                    text: "subscribe"
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

    #allowedAccounts = new Array<string>(); // account ids

    #documented_by = new Array<string>(); // artifact keys

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

    get getAllowedAccounts() {
        return this.#allowedAccounts;
    }

    set setAllowedAccounts(accountIds: string[]) {
        this.#allowedAccounts = accountIds;
    }

    addAllowedAccount(accountId: string) {
        this.#allowedAccounts.push(accountId);
    }

    removeAllowedAccount(accountId: string) {
        let index = this.#allowedAccounts.indexOf(accountId);
        if (index !== -1) {
            this.#allowedAccounts.splice(index, 1);
        }
    }

    get getDocumentedBy() {
        return this.#documented_by;
    }

    set setDocumentedBy(artifactKeys: string[]) {
        this.#documented_by = artifactKeys;
    }

    addDocumentedBy(artifactKey: string) {
        this.#documented_by.push(artifactKey);
    }

    removeDocumentedBy(artifactKey: string) {
        let index = this.#documented_by.indexOf(artifactKey);
        if (index !== -1) {
            this.#documented_by.splice(index, 1);
        }
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

    /**
     * Transforms the Endpoint object into a String. 
     * @returns {string}
     */
    toString() {
        return "Endpoint " + JSON.stringify(this);
    }
}

export { Endpoint, ENDPOINT_TOSCA_KEY, ENDPOINT_TOSCA_EQUIVALENT, getEndpointProperties };