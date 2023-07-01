import { EntityProperty, TextEntityProperty } from './entityProperty'
import { Component } from './component'
import { Infrastructure } from './infrastructure'
import { parseProperties } from './entityProperty'
import { cna_modeling_tosca_profile } from '../totypa/parsedProfiles/cna_modeling_tosca_profile'

/**
 * The module for aspects related to a Backing Service quality model entity.
 * @module entities/backingService
 */

const BACKING_SERVICE_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types["cna.qualityModel.entities.BackingService"];


function getBackingServiceProperties(): EntityProperty[] {
    let parsed = parseProperties(BACKING_SERVICE_TOSCA_EQUIVALENT.properties);
    for (const prop of parsed) {
        switch (prop.getKey) {
            case "providedFunctionality":
                prop.setName = "Provided Functionality:";
                prop.setExample = "e.g. Logging";
            break;
        }
    }
    return parsed;
}


/**
 * Class representing a Backing Service entity.
 * @class
 * @extends Component A {@link Component} entity
 */
class BackingService extends Component {

    /**
     * Create a Backing Service entity.
     * @param {string} name The name of the Backing Service entity. 
     * @param {modelId} modelId The ID, the respective entity representation has in the joint.dia.Graph model.
     * @param {Infrastructure} hostingInfrastructure The {@link Infrastructure} entity that hosts this Backing Service entity.
     */
    constructor(name: string, modelId: string, hostingInfrastructure: Infrastructure) {
        super(name, modelId, hostingInfrastructure)
        this.addProperties(getBackingServiceProperties());
    }

    /**
     * Transforms the BackingService object into a String. 
     * @returns {string}
     */
    toString() {
        return "BackingService " + JSON.stringify(this);
    }
}

export { BackingService, BACKING_SERVICE_TOSCA_EQUIVALENT, getBackingServiceProperties };