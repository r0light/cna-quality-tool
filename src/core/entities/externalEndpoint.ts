import { EntityProperty, parseProperties } from "../common/entityProperty"
import { Endpoint } from "./endpoint";
import { tosca_simple_profile_for_yaml_v1_3 } from '../../totypa/parsedProfiles/tosca_simple_profile_for_yaml_v1_3'
import { MetaData } from "../common/entityDataTypes";
import { cna_modeling_tosca_profile } from "@/totypa/parsedProfiles/cna_modeling_tosca_profile";

/**
 * The module for aspects related to a External Endpoint quality model Entity.
 * @module entities/externalEndpoint
 */
const EXTERNAL_ENDPOINT_TOSCA_KEY = "cna.qualityModel.entities.Endpoint.External";
const EXTERNAL_ENDPOINT_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types[EXTERNAL_ENDPOINT_TOSCA_KEY];

const EXTERNAL_ENDPOINT_CAPABILITY_KEY = "tosca.capabilities.Endpoint.Public";
const EXTERNAL_ENDPOINT_CAPABILITY_EQUIVALENT = tosca_simple_profile_for_yaml_v1_3.capability_types[EXTERNAL_ENDPOINT_CAPABILITY_KEY];


function getExternalEndpointProperties(): EntityProperty[] {
    let parsed = parseProperties(EXTERNAL_ENDPOINT_CAPABILITY_EQUIVALENT.properties);
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

export { ExternalEndpoint, EXTERNAL_ENDPOINT_TOSCA_KEY, getExternalEndpointProperties };