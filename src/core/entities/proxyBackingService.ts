import { EntityProperty, parseProperties } from '../common/entityProperty.js'
import { Component } from './component.js'
import { cna_modeling_profile } from '../../totypa/parsedProfiles/v2dot0-profiles/cna_modeling_profile.js'
import { MetaData } from '../common/entityDataTypes.js'

/**
 * The module for aspects related to a Backing Service quality model entity.
 * @module entities/proxyBackingService
 */

const PROXY_BACKING_SERVICE_TOSCA_KEY = "cna-modeling.entities.ProxyBackingService";
const PROXY_BACKING_SERVICE_TOSCA_EQUIVALENT = cna_modeling_profile.node_types[PROXY_BACKING_SERVICE_TOSCA_KEY];


function getProxyBackingServiceProperties(): EntityProperty[] {
    let parsed = parseProperties(PROXY_BACKING_SERVICE_TOSCA_EQUIVALENT.properties);

    /*
    for (const prop of parsed) {
        switch (prop.getKey) {
            case "providedFunctionality":
                prop.setName = "Provided Functionality:";
                prop.setExample = "e.g. Logging";
            break;
        }
    }
        */
    
    return parsed;
}

/**
 * Class representing a Backing Service entity.
 * @class
 * @extends Component A {@link Component} entity
 */
class ProxyBackingService extends Component {

    /**
     * Create a Proxy Backing Service entity.
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Backing Service entity. 
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     */
    constructor(id: string, name: string, metaData: MetaData) {
        super(id, name, metaData)
        this.addProperties(getProxyBackingServiceProperties());
    }

    /**
     * Transforms the BackingService object into a String. 
     * @returns {string}
     */
    toString() {
        return "ProxyBackingService " + JSON.stringify(this);
    }
}

export { ProxyBackingService, PROXY_BACKING_SERVICE_TOSCA_KEY, getProxyBackingServiceProperties };