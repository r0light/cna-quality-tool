import { EntityProperty, loadAllProperties } from '../common/entityProperty.js'
import { Component } from './component.js'
import { Infrastructure } from './infrastructure.js'
import { cna_modeling_tosca_profile } from '../../totypa/parsedProfiles/cna_modeling_tosca_profile.js'
import { MetaData } from '../common/entityDataTypes.js'

/**
 * The module for aspects related to a Backing Service quality model entity.
 * @module entities/backingService
 */

const BACKING_SERVICE_TOSCA_KEY = "cna.qualityModel.entities.BackingService";
const BACKING_SERVICE_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types[BACKING_SERVICE_TOSCA_KEY];


function getBackingServiceProperties(): EntityProperty[] {
    let parsed = loadAllProperties(BACKING_SERVICE_TOSCA_EQUIVALENT);

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
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Backing Service entity. 
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     * @param {Infrastructure} hostingInfrastructure The {@link Infrastructure} entity that hosts this Backing Service entity.
     */
    constructor(id: string, name: string, metaData: MetaData) {
        super(id, name, metaData)
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

export { BackingService, BACKING_SERVICE_TOSCA_KEY, getBackingServiceProperties };