import { Component } from './component.js'
import { Infrastructure } from './infrastructure.js'
import { EntityProperty, SelectEntityProperty, parseProperties } from '../common/entityProperty.js';
import { cna_modeling_tosca_profile } from '../../totypa/parsedProfiles/v2dot0-profiles/cna_modeling_tosca_profile.js'
import { EntityPropertyKey } from '@/totypa/parsedProfiles/v2dot0-profiles/propertyKeys.js';
import { getAvailableArtifactTypes } from '../common/artifact.js';

/**
 * The module for aspects related to a Deployment Mapping quality model entity.
 * @module entities/deploymentMapping
 */
const DEPLOYMENT_MAPPING_TOSCA_KEY = "cna-modeling.relationships.HostedOn.DeploymentMapping";
const DEPLOYMENT_MAPPING_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.relationship_types[DEPLOYMENT_MAPPING_TOSCA_KEY];

function getDeploymentMappingProperties(): EntityProperty[] {
    let parsed = parseProperties(DEPLOYMENT_MAPPING_TOSCA_EQUIVALENT.properties);

    return parsed.map((prop) => {
        switch (prop.getKey) {
            case "deployment":
                prop.setName = "Deployment process"
                return prop;
            case "deployment_unit":
                return new SelectEntityProperty(prop.getKey,
                    prop.getName,
                    prop.getDescription,
                    prop.getExample,
                    prop.getRequired,
                    ["custom"].concat(getAvailableArtifactTypes()).map(option => { return { value: option, text: option } }),
                    prop.getDefaultValue,
                    prop.value)
            default:
                return prop;
        }
    })
}

/**
 * Class representing a Deployment Mapping entity.
 * @class
 */
class DeploymentMapping {

    #id: string;

    #deployedEntity: Component | Infrastructure;

    #underlyingInfrastructure: Infrastructure;

    #properties: EntityProperty[] = new Array();

    /**
     * Create a Deployment Mapping entity. Represents the connection between either {@link Component} - {@link Infrastructure} or {@link Infrastructure} - {@link Infrastructure}. 
     * @param {string} id The unique id for this entity.
     * @param {Component|Service|BackingService|StorageBackingService|Infrastructure} deployedEntity The entity that is being deployed.
     * @param {Infrastructure} underlyingInfrastructure The Infrastructure entity, which deploys the other entity.
     * @throws {TypeError} If a wrong entity type is being provided.
     * @throws {Error} If the deployedEntity and the underylingInfrastructure are the same.
     */
    constructor(id: string, deployedEntity: Component | Infrastructure, underlyingInfrastructure: Infrastructure) {
        if (deployedEntity.getId === underlyingInfrastructure.getId) {
            const errorMessage = "The entities for which the DeploymentMapping is defined have to be distinguishable.";
            throw new Error(errorMessage);
        }

        if (!(deployedEntity instanceof Component || deployedEntity instanceof Infrastructure)) {
            const errorMessage = "Wrong entity type provided. Only Component, Service, BackingService, StorageBackingService or Infrastructure entities can be deployed by an underlying Infrastructure. However, the provided entity was: " + Object.getPrototypeOf(deployedEntity) + JSON.stringify(deployedEntity);
            throw new TypeError(errorMessage);
        }

        if (!(underlyingInfrastructure instanceof Infrastructure)) {
            const errorMessage = "Wrong entity type provided. Only an Infrastructure entity is able to deploy other entities. However, the provided entity was: " + Object.getPrototypeOf(underlyingInfrastructure) + JSON.stringify(underlyingInfrastructure);
            throw new TypeError(errorMessage);
        }

        this.#id = id;
        this.#deployedEntity = deployedEntity;
        this.#underlyingInfrastructure = underlyingInfrastructure;
        this.#properties = getDeploymentMappingProperties();
    }

    /**
     * Returns the ID of this Deployment Mapping entity.
     * @returns {string}
     */
    get getId() {
        return this.#id;
    }

    set setId(newId: string) {
        this.#id = newId;
    }

    /**
     * Returns the {@link Component} entity included in this DeploymentMapping.
     * @returns {Component}
     */
    get getDeployedEntity() {
        return this.#deployedEntity;
    }

    /**
     * Change the deployedEntity. 
     * @param {Component|Service|BackingService|StorageBackingService|Infrastructure} newDeployedEntity The entity that is being deployed.
     * @throws {TypeError} If a wrong entity type is being provided.
     * @throws {Error} If the newDeployedEntity and the underylingInfrastructure are the same.
     */
    set setDeployedEntity(newDeployedEntity: Component | Infrastructure) {
        if (!(newDeployedEntity instanceof Component || newDeployedEntity instanceof Infrastructure)) {
            const errorMessage = "Wrong entity type provided. Only Component, Service, BackingService, StorageBackingService or Infrastructure entities can be deployed by an underlying Infrastructure. However, the provided entity was: " + Object.getPrototypeOf(newDeployedEntity) + JSON.stringify(newDeployedEntity);
            throw new TypeError(errorMessage);
        }

        if (JSON.stringify(newDeployedEntity) === JSON.stringify(this.#underlyingInfrastructure)) {
            const errorMessage = "The entity is already included as the underyling infrastructure.";
            throw new Error(errorMessage);
        }

        this.#deployedEntity = newDeployedEntity;
    }

    /**
     * Returns the {@link Infrastructure} entity included in this DeploymentMapping.
     * @returns {Infrastructure}
     */
    get getUnderlyingInfrastructure() {
        return this.#underlyingInfrastructure;
    }

    /**
    * Change the underlyingInfrastructure. 
    * @param {Infrastructure} newUnderlyingInfrastructure The Infrastructure entity, which deploys the entity provided in the deployedEntity element.
    * @throws {TypeError} If a wrong entity type is being provided.
    * @throws {Error} If the newUnderlyingInfrastructure and the deployedEntity are the same.
    */
    set setUnderlyingInfrastructure(newUnderlyingInfrastructure: Infrastructure) {

        if (JSON.stringify(newUnderlyingInfrastructure) === JSON.stringify(this.#deployedEntity)) {
            const errorMessage = "The entity is already included as being deployed on this infrastructure";
            throw new Error(errorMessage);
        }

        this.#underlyingInfrastructure = newUnderlyingInfrastructure;
    }

    /**
     * Returns all properties of this entity
     * @returns {EntityProperty[]}
    */
    getProperties() {
        return this.#properties;
    }

    getProperty(propertyKey: EntityPropertyKey) {
        return this.#properties.find(property => property.getKey === propertyKey);
    }


    setPropertyValue(propertyKey: EntityPropertyKey, propertyValue: any) {
        let propertyToSet = (this.#properties.find(property => property.getKey === propertyKey))
        if (propertyToSet) {
            propertyToSet.value = propertyValue
        } else {
            throw new Error(`Property with key ${propertyKey} not found in ${this.constructor}`)
        }
    }

    /**
     * Transforms the DeploymentMapping object into a String. 
     * @returns {string}
     */
    toString() {
        return "DeploymentMapping " + JSON.stringify(this);
    }
}

export { DeploymentMapping, DEPLOYMENT_MAPPING_TOSCA_KEY, getDeploymentMappingProperties };