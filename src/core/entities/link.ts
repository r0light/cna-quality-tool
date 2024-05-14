import { BackingService } from './backingService.js';
import { Component } from './component.js'
import { Endpoint } from './endpoint.js'
import { ExternalEndpoint } from './externalEndpoint.js';
import { Service } from './service.js';
import { StorageBackingService } from './storageBackingService.js';
import { cna_modeling_profile } from '../../totypa/parsedProfiles/v2dot0-profiles/cna_modeling_profile.js'
import { EntityProperty, parseProperties } from '../common/entityProperty.js';


/**
 * The module for aspects related to a Link quality model entity.
 * @module entities/link
 */

const LINK_TOSCA_KEY = "cna-modeling.entities.ConnectsTo.Link";
const LINK_TOSCA_EQUIVALENT = cna_modeling_profile.relationship_types[LINK_TOSCA_KEY];

function getLinkProperties(): EntityProperty[] {
    let parsed = parseProperties(LINK_TOSCA_EQUIVALENT.properties);

    for (const prop of parsed) {
        switch (prop.getKey) {
            case "relation_type":
                prop.setName = "Relation Type:";
                prop.setExample = "e.g. subscribes to";
                break;
        }
    }

    return parsed;
}


/**
 * Class representing a Link entity.
 * @class
 */
class Link {

    #id: string;

    #sourceEntity: Component;

    #targetEndpoint: Endpoint;

    #properties: EntityProperty[] = new Array();

    /**
     * Create a Link entity. Represents the connection between {@link Component}, {@link Service}, {@link BackingService} or {@link StorageBackingService} and an {@link Endpoint} or {@link ExternalEndpoint} entity.
     * @param {id} id The unique id for this entity.
     * @param {Component | Service | BackingService | StorageBackingService} sourceEntity The entity that links to an Endpoint of another entity.
     * @param {Endpoint | ExternalEndpoint} targetEndpoint The Endpoint the Link connects to.
     * @throws {TypeError} If a wrong entity type is being provided
     * @throws {Error} If the targeted Endpoint is included in the sourceEntity.
     */
    constructor(id: string, sourceEntity: Component, targetEndpoint: Endpoint) {
        this.#id = id;
        this.#sourceEntity = sourceEntity;
        this.#targetEndpoint = targetEndpoint;

        if (sourceEntity.getEndpointEntities.find(endpoint => endpoint.getId === targetEndpoint.getId)) {
            const errorMessage = "A Link cannot be created from an entity to its own included Endpoint.";
            throw new Error(errorMessage);
        }

        this.#properties = getLinkProperties();
    }

    /**
     * Returns the ID of this Component entity.
     * @returns {string}
     */
    get getId() {
        return this.#id;
    }

    set setId(newId: string) {
        this.#id = newId;
    }

    /**
     * Returns the {@link Component}, {@link Service}, {@link BackingService} or {@link StorageBackingService} entity, which the Link connects to the targetEndpoint.
     * @returns {Component}
     */
    get getSourceEntity() {
        return this.#sourceEntity;
    }

    /**
      * Changes the sourceEntity.
      * @param {Component | Service | BackingService | StorageBackingService} newSourceEntity The entity that links to an Endpoint of another entity.
      * @throws {TypeError} If a wrong entity type is being provided
      * @throws {Error} If the targeted Endpoint is included in the newSourceEntity.
      */
    set setSourceEntity(newSourceEntity: Component) {
        if (newSourceEntity.getEndpointEntities.find(endpoint => endpoint.getId === this.#targetEndpoint.getId)) {
            const errorMessage = "A Link cannot be created from an entity to its own included Endpoint.";
            throw new Error(errorMessage);
        }

        this.#sourceEntity = newSourceEntity;
    }

    /**
     * Returns the {@link Endpoint} or {@link ExternalEndpoint} this Link connects to.
     * @returns {Endpoint|ExternalEndpoint}
     */
    get getTargetEndpoint() {
        return this.#targetEndpoint
    }

    /**
      * Changes the targetEntity.
      * @param {Endpoint | ExternalEndpoint} newTargetEndpoint The Endpoint the Link connects to.
      * @throws {TypeError} If a wrong entity type is being provided
      * @throws {Error} If the targeted Endpoint is included in the sourceEntity.
      */
    set setTargetEndpoint(newTargetEndpoint: Endpoint) {
        if (this.#sourceEntity.getEndpointEntities.find(endpoint => endpoint.getId === newTargetEndpoint.getId)) {
            const errorMessage = "A Link cannot be created from an entity to its own included Endpoint.";
            throw new Error(errorMessage);
        }
        this.#targetEndpoint = newTargetEndpoint;
    }

    /**
     * Returns all properties of this entity
     * @returns {EntityProperty[]}
    */
    getProperties() {
        return this.#properties;
    }

    setPropertyValue(propertyKey: string, propertyValue: any) {
        let propertyToSet = (this.#properties.find(property => property.getKey === propertyKey))
        if (propertyToSet) {
            propertyToSet.value = propertyValue
        } else {
            throw new Error(`Property with key ${propertyKey} not found in ${this.constructor}`)
        }
    }

    /**
     * Transforms the Link object into a String. 
     * @returns {string}
     */
    toString() {
        return "Link " + JSON.stringify(this);
    }
}

export { Link, LINK_TOSCA_KEY, getLinkProperties };