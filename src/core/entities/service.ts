import { Component } from './component.js'
import { Infrastructure } from './infrastructure.js';
import { cna_modeling_tosca_profile } from '../../totypa/parsedProfiles/cna_modeling_tosca_profile.js'
import { MetaData } from '../common/entityDataTypes.js';
import { loadAllProperties } from '../common/entityProperty.js';


/**
 * The module for aspects related to a Component quality model Entity.
 * @module entities/service
 */

const SERVICE_TOSCA_KEY = "cna.qualityModel.entities.SoftwareComponent.Service";
const SERVICE_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types[SERVICE_TOSCA_KEY];

function getServiceProperties() {
    let parsed = loadAllProperties(SERVICE_TOSCA_EQUIVALENT);

    return parsed;
}


/**
 * Class representing a Service entity.
 * @class
 * @extends Component A {@link Component} entity
 */
class Service extends Component {

    /**
     * Create a Service entity.
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Service entity. 
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     * @param {Infrastructure} hostingInfrastructure The {@link Infrastructure} entity that hosts this Service entity.
     */
    constructor(id: string, name: string, metaData: MetaData) {
        super(id, name, metaData)
        this.addProperties(getServiceProperties());
    }

    /**
     * Transforms the Service object into a String. 
     * @returns {string}
     */
    toString() {
        return "Service " + JSON.stringify(this);
    }
}

export { Service, SERVICE_TOSCA_KEY, getServiceProperties };