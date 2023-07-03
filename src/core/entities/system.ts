import { BackingData } from "./backingData";
import { BackingService } from "./backingService";
import { Component } from "./component";
import { DataAggregate } from "./dataAggregate";
import { DeploymentMapping } from "./deploymentMapping";
import { Infrastructure } from "./infrastructure";
import { Link } from "./link";
import { RequestTrace } from "./requestTrace";
import { Service } from "./service";
import { StorageBackingService } from "./storageBackingService";

/**
 * The module for aspects related to a Component quality model Entity.
 * @module entities/system
 */

/**
 * Class representing a System entity.
 * @class
 */
class System { // TODO use ID's as keys instead of name?

    #systemName: string;

    #componentEntities: Map<string, Component> = new Map();

    #linkEntities: Map<string, Link> = new Map();

    #infrastructureEntities: Map<string, Infrastructure> = new Map();

    #deploymentMappingEntities: Map<string, DeploymentMapping> = new Map();

    #requestTraceEntities: Map<string, RequestTrace> = new Map();

    #dataAggregateEntities: Map<string, DataAggregate> = new Map();

    #backingDataEntities: Map<string, BackingData> = new Map();

    /**
     * Create a System entity.
     * @param {string} applicationName The name of the application, which the System entity represents. 
     */
    constructor(applicationName: string) {
        this.#systemName = applicationName;
    }

    /**
     * Add a list of quality model entities ({@link Component}, {@link Service}, {@link BackingService}, {@link StorageBackingService}, {@link Link}, {@link Infrastructure},
     * {@link DeploymentMapping}, {@link RequestTrace}, {@link DataAggregate} or {@link BackingData}) to the System. 
     * @param {Array} listOfEntitiesToAdd The list of entities, which should be added to the System entity.
     * @throws {TypeError} If a wrong entity type is being provided. 
     */
    addEntities(listOfEntitiesToAdd: Component[] | Service[] | BackingService[] | StorageBackingService[] | Link[] | Infrastructure[] | DeploymentMapping[] | RequestTrace[] | DataAggregate[] | BackingData[] ) {
        for (const newEntity of listOfEntitiesToAdd) {
            this.addEntity(newEntity);
        }
    }

    /**
     * Add a quality model entity ({@link Component}, {@link Service}, {@link BackingService}, {@link StorageBackingService}, {@link Link}, {@link Infrastructure},
     * {@link DeploymentMapping}, {@link RequestTrace}, {@link DataAggregate} or {@link BackingData}) to the System. 
     * @param {Component|Link|Infrastructure|DeploymentMapping|RequestTrace|DataAggregate|BackingData} entityToAdd The entity that is part of this System entity.
     * @throws {TypeError} If a wrong entity type is being provided. 
     */
    addEntity(entityToAdd: Component | Link | Infrastructure | DeploymentMapping | RequestTrace | DataAggregate | BackingData) {
        switch (entityToAdd.constructor) {
            case Component:
            case Service:
            case BackingService:
            case StorageBackingService:
                this.addComponentEntity(<Component> entityToAdd);
                break;
            case Link:
                this.addLinkEntity(<Link> entityToAdd);
                break;
            case Infrastructure:
                this.addInfrastructureEntity(<Infrastructure> entityToAdd);
                break;
            case DeploymentMapping:
                this.addDeploymentMappingEntity(<DeploymentMapping> entityToAdd);
                break;
            case RequestTrace:
                this.addRequestTraceEntity(<RequestTrace> entityToAdd);
                break;
            case DataAggregate:
                this.addDataAggregateEntity(<DataAggregate> entityToAdd);
                break;
            case BackingData:
                this.addBackingDataEntity(<BackingData> entityToAdd);
                break;
            default:
                const errorMessage = "Wrong entity type provided. The provided entity was: " + Object.getPrototypeOf(entityToAdd) + JSON.stringify(entityToAdd);
                throw new TypeError(errorMessage);

        }
    }

    /**
     * Add a {@link Component}, {@link Service}, {@link BackingService} or {@link StorageBackingService} entity. 
     * @param {Component|Service|BackingService|StorageBackingService} componentEntityToAdd The entity that is part of this System entity.
     * @throws {TypeError} If a wrong entity type is being provided. 
     */
    addComponentEntity(componentEntityToAdd: Component) {
        // this.#componentEntities.set(componentEntityToAdd.name, componentEntityToAdd);
        this.#componentEntities.set(componentEntityToAdd.getModelId, componentEntityToAdd);
    }

    /**
     * Add a {@link Link} entity. 
     * @param {Link} linkEntityToAdd The Link entity that is part of this System entity.
     * @throws {TypeError} If a wrong entity type is being provided. 
     */
    addLinkEntity(linkEntityToAdd: Link) {
        // this.#linkEntities.set(linkEntityToAdd.name, linkEntityToAdd);
        this.#linkEntities.set(linkEntityToAdd.getModelId, linkEntityToAdd);
    }

    /**
     * Add a {@link Infrastructure} entity. 
     * @param {Infrastructure} infrastructureEntityToAdd The entity that is part of this System entity.
     * @throws {TypeError} If a wrong entity type is being provided. 
     */
    addInfrastructureEntity(infrastructureEntityToAdd: Infrastructure) {
        // this.#infrastructureEntities.set(infrastructureEntityToAdd.name, infrastructureEntityToAdd);
        this.#infrastructureEntities.set(infrastructureEntityToAdd.getModelId, infrastructureEntityToAdd);
    }

    /**
     * Add a {@link DeploymentMapping} entity. 
     * @param {DeploymentMapping} deploymentMappingEntityToAdd The entity that is part of this System entity.
     * @throws {TypeError} If a wrong entity type is being provided. 
     */
    addDeploymentMappingEntity(deploymentMappingEntityToAdd: DeploymentMapping) {

        // this.#deploymentMappingEntities.set(deploymentMappingEntityToAdd.getId, deploymentMappingEntityToAdd);
        this.#deploymentMappingEntities.set(deploymentMappingEntityToAdd.getModelId, deploymentMappingEntityToAdd);
    }

    /**
     * Add a {@link RequestTrace} entity. 
     * @param {RequestTrace} requestTraceEntityToAdd The entity that is part of this System entity.
     * @throws {TypeError} If a wrong entity type is being provided. 
     */
    addRequestTraceEntity(requestTraceEntityToAdd: RequestTrace) {
        // this.#requestTraceEntities.set(requestTraceEntityToAdd.name, requestTraceEntityToAdd);
        this.#requestTraceEntities.set(requestTraceEntityToAdd.getModelId, requestTraceEntityToAdd);
    }

    /**
     * Add a {@link DataAggregate} entity. 
     * @param {DataAggregate} dataAggregateEntityToAdd The entity that is part of this System entity.
     * @throws {TypeError} If a wrong entity type is being provided. 
     */
    addDataAggregateEntity(dataAggregateEntityToAdd: DataAggregate) {
        // Names are unique therefore used as ID --> ensures that Set includes each one only once
        this.#dataAggregateEntities.set(dataAggregateEntityToAdd.getName, dataAggregateEntityToAdd);
    }

    /**
     * Add a {@link BackingData} entity. 
     * @param {BackingData} componentEntityToAdd The entity that is part of this System entity.
     * @throws {TypeError} If a wrong entity type is being provided. 
     */
    addBackingDataEntity(backingDataEntityToAdd: BackingData) {

        // Names are unique therefore used as ID --> ensures that Set includes each one only once
        this.#backingDataEntities.set(backingDataEntityToAdd.getName, backingDataEntityToAdd);
    }

    resetAllIncludedSystemEntities() {
        this.#componentEntities = new Map();
        this.#linkEntities = new Map();    
        this.#infrastructureEntities = new Map();    
        this.#deploymentMappingEntities = new Map();    
        this.#requestTraceEntities = new Map();    
        this.#dataAggregateEntities = new Map();    
        this.#backingDataEntities = new Map();
    }

    set setSystemName(updatedSystemName: string) {
        if (!updatedSystemName || !(updatedSystemName.trim())) {
            return;
        }
        
        this.#systemName = updatedSystemName;
    }

    get getSystemName() {
        return this.#systemName;
    }

    /**
     * Returns the {@link Component} entities included in this System entity.
     * @returns {Component}
     */
    get getComponentEntities() {
        return this.#componentEntities;
    }

    /**
     * Returns the {@link Link} entities included in this System entity.
     * @returns {Link}
     */
    get getLinkEntities() {
        return this.#linkEntities;
    }

    /**
     * Returns the {@link Infrastructure} entities included in this System entity.
     * @returns {Infrastructure}
     */
    get getInfrastructureEntities() {
        return this.#infrastructureEntities;
    }

    /**
     * Returns the {@link DeploymentMapping} entities included in this System entity.
     * @returns {DeploymentMapping}
     */
    get getDeploymentMappingEntities() {
        return this.#deploymentMappingEntities;
    }

    /**
     * Returns the {@link RequestTrace} entities included in this System entity.
     * @returns {RequestTrace}
     */
    get getRequestTraceEntities() {
        return this.#requestTraceEntities;
    }

    /**
     * Returns the {@link DataAggregate} entities included in this System entity.
     * @returns {DataAggregate}
     */
    get getDataAggregateEntities() {
        return this.#dataAggregateEntities;
    }

    /**
     * Returns the {@link BackingData} entities included in this System entity.
     * @returns {BackingData}
     */
    get getBackingDataEntities() {
        return this.#backingDataEntities;
    }

    /**
     * Transforms the System object into a String. 
     * @returns {string}
     */
    toString() {
        return "System " + JSON.stringify(this);
    }
}

export { System };