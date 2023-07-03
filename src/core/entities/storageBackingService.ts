import { Component } from './component'
import { parseProperties } from '../common/entityProperty';
import { cna_modeling_tosca_profile } from '../../totypa/parsedProfiles/cna_modeling_tosca_profile'

/**
 * The module for aspects related to a Component quality model Entity.
 * @module entities/storageBackingService
 */

const STORAGE_BACKING_SERVICE_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types["cna.qualityModel.entities.DBMS.StorageService"];

function getStorageBackingServiceProperties() {
    let parsed = parseProperties(STORAGE_BACKING_SERVICE_TOSCA_EQUIVALENT.properties);

    for (const prop of parsed) {
        switch (prop.getKey) {
            case "name":
                prop.setName = "Database Name:";
                prop.setExample = "e.g. Order";
                break;
        }
    }
    return parsed;
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

export { StorageBackingService, STORAGE_BACKING_SERVICE_TOSCA_EQUIVALENT, getStorageBackingServiceProperties };