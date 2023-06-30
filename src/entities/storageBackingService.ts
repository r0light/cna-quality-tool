import { Component } from './component'
import { EntityProperty, NumberEntityProperty, TextEntityProperty } from './entityProperty';

/**
 * The module for aspects related to a Component quality model Entity.
 * @module entities/storageBackingService
 */

function getStorageBackingServiceProperties() {
    return [
        new TextEntityProperty(
            "databaseName",
            "Database Name:",
            "The name of the database",
            "e.g. Order",
            false,
            0,
            [],
            ""
        ),
        new NumberEntityProperty(
            "databasePort",
            "Port:",
            "The port of the database",
            "e.g. 3306",
            false,
            65535,
            1,
            0
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
    constructor(name: string, modelId: string, hostingInfrastructure: string) {
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