import { EntityProperty } from './entityProperty.js'
import { Component } from './component.js'

/**
 * The module for aspects related to a Backing Service quality model entity.
 * @module entities/backingService
 */

function getBackingServiceProperties() {
    return [
        new EntityProperty("providedFunctionality", 
        "Provided Functionality:", 
        "A short description of the provided functionality.",
        "e.g. Logging",
        false,
        "")
    ]
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
    constructor(name, modelId, hostingInfrastructure) {
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

export { BackingService, getBackingServiceProperties };