import { EntityProperty, parseProperties } from "../common/entityProperty"
import { Endpoint } from "./endpoint";
import { tosca_simple_profile_for_yaml_v1_3 } from '../../totypa/parsedProfiles/tosca_simple_profile_for_yaml_v1_3'

/**
 * The module for aspects related to a External Endpoint quality model Entity.
 * @module entities/externalEndpoint
 */

const EXTERNAL_ENDPOINT_TOSCA_EQUIVALENT = tosca_simple_profile_for_yaml_v1_3.capability_types["tosca.capabilities.Endpoint.Public"];

function getExternalEndpointProperties(): EntityProperty[] {
    let parsed = parseProperties(EXTERNAL_ENDPOINT_TOSCA_EQUIVALENT.properties);
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
     * @param {modelId} modelId The ID, the respective entity representation has in the joint.dia.Graph model.
     * @param {string} parentName The name of the parent Entity.
     */
    constructor(modelId: string, parentName: string) {
        super(modelId, parentName);
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

export { ExternalEndpoint, EXTERNAL_ENDPOINT_TOSCA_EQUIVALENT, getExternalEndpointProperties };