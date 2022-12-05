import { Component } from './component.js'
import { EntityProperty } from './entityProperty.js';

/**
 * The module for aspects related to a Component quality model Entity.
 * @module entities/storageBackingService
 */

function getStorageBackingServiceProperties() {
    return [
        new EntityProperty(
            "databaseName",
            "Database Name:",
            "e.g. Order",
            false,
            "text",
            0,
            [],
            ""
        ),
        new EntityProperty(
            "databasePort",
            "Port:",
            "e.g. 3306",
            false,
            "number",
            4,
            [],
            ""
        )
    ]
}

/**
 * Class representing a Storage Backing Service entity.
 * @class
 * @extends Component A {@link Component} entity
 */
class StorageBackingService extends Component {

    /**
     * Create a Storage Backing Service entity.
     * @param {string} name The name of the Storage Backing Service entity. 
     * @param {modelId} modelId The ID, the respective entity representation has in the joint.dia.Graph model.
     * @param {Infrastructure} hostingInfrastructure The {@link Infrastructure} entity that hosts this Storage Backing Service entity.
     */
    constructor(name, modelId, hostingInfrastructure) {
        super(name, modelId, hostingInfrastructure);
        this.addProperties(getStorageBackingServiceProperties());
    }

    /**
     * Transforms the StorageBackingService object into a String. 
     * @returns {string}
     */
    toString() {
        return "StorageBackingService " + JSON.stringify(this);
    }
}

export { StorageBackingService, getStorageBackingServiceProperties };