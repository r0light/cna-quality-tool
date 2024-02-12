import { Component } from './component.js'
import { loadAllProperties, parseProperties } from '../common/entityProperty.js';
import { cna_modeling_tosca_profile } from '../../totypa/parsedProfiles/cna_modeling_tosca_profile.js'
import { MetaData } from '../common/entityDataTypes.js';
import { Infrastructure } from './infrastructure.js';


/**
 * The module for aspects related to a Component quality model Entity.
 * @module entities/storageBackingService
 */
const STORAGE_BACKING_SERVICE_TOSCA_KEY = "cna.qualityModel.entities.DBMS.StorageService";
const STORAGE_BACKING_SERVICE_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types[STORAGE_BACKING_SERVICE_TOSCA_KEY];

function getStorageBackingServiceProperties() {
    let parsed = loadAllProperties(STORAGE_BACKING_SERVICE_TOSCA_EQUIVALENT);

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
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Storage Backing Service entity. 
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     * @param {Infrastructure} hostingInfrastructure The {@link Infrastructure} entity that hosts this Storage Backing Service entity.
     */
    constructor(id: string, name: string, metaData: MetaData) {
        super(id, name, metaData);
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

export { StorageBackingService, STORAGE_BACKING_SERVICE_TOSCA_KEY, getStorageBackingServiceProperties };