import { EntityProperty, mergeAllCapabilitiesProperties, parseCapabilitiesProperties, parseProperties, TextEntityProperty } from "../common/entityProperty.js"
import { Endpoint } from "./endpoint.js";
import { MetaData } from "../common/entityDataTypes.js";
import { cna_modeling_tosca_profile } from '../../totypa/parsedProfiles/v2dot0-profiles/cna_modeling_tosca_profile.js'

/**
 * The module for aspects related to a External Endpoint quality model Entity.
 * @module entities/externalEndpoint
 */
const EXTERNAL_ENDPOINT_TOSCA_KEY = "cna-modeling.entities.Endpoint.External";
const EXTERNAL_ENDPOINT_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types[EXTERNAL_ENDPOINT_TOSCA_KEY];

function getExternalEndpointProperties(): EntityProperty[] {
    let parsed = parseProperties(EXTERNAL_ENDPOINT_TOSCA_EQUIVALENT.properties).concat(mergeAllCapabilitiesProperties(parseCapabilitiesProperties(EXTERNAL_ENDPOINT_TOSCA_EQUIVALENT.capabilities))).filter(property => !["allow_access_to", "documented_by"].includes(property.getKey));
    
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
 * Class representing an External Endpoint entity.
 * @class
 * @extends Endpoint An {@link Endpoint} entity
 */
class ExternalEndpoint extends Endpoint {

    // TODO ref Component here?

    /**
     * Create an External Endpoint entity.
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Endpoint entity. 
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     */
    constructor(id: string, name: string, metaData: MetaData) {
        super(id, name, metaData);
        this.addProperties(getExternalEndpointProperties());
    }

    /**
     * Transforms the ExternalEndpoint object into a String. 
     * @returns {string}
     */
    toString() {
        return "ExternalEndpoint " + JSON.stringify(this);
    }
}

export { ExternalEndpoint, EXTERNAL_ENDPOINT_TOSCA_KEY, EXTERNAL_ENDPOINT_TOSCA_EQUIVALENT, getExternalEndpointProperties };