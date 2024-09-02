import { BackingData } from "./backingData.js";
import { BackingService } from "./backingService.js";
import { Component } from "./component.js";
import { DataAggregate } from "./dataAggregate.js";
import { DeploymentMapping } from "./deploymentMapping.js";
import { Infrastructure } from "./infrastructure.js";
import { Link } from "./link.js";
import { ProxyBackingService } from "./proxyBackingService.js";
import { RequestTrace } from "./requestTrace.js";
import { Service } from "./service.js";
import { StorageBackingService } from "./storageBackingService.js";

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
            case ProxyBackingService:
                this.#componentEntities.set(entityToAdd.getId, entityToAdd as Component);
                break;
            case Link:
                this.#linkEntities.set(entityToAdd.getId, entityToAdd as Link);
                break;
            case Infrastructure:
                this.#infrastructureEntities.set(entityToAdd.getId, entityToAdd as Infrastructure);
                break;
            case DeploymentMapping:
                this.#deploymentMappingEntities.set(entityToAdd.getId, entityToAdd as DeploymentMapping);
                break;
            case RequestTrace:
                this.#requestTraceEntities.set(entityToAdd.getId, entityToAdd as RequestTrace);
                break;
            case DataAggregate:
                this.#dataAggregateEntities.set(entityToAdd.getId, entityToAdd as DataAggregate);
                break;
            case BackingData:
                this.#backingDataEntities.set(entityToAdd.getId, entityToAdd as BackingData);
                break;
            default:
                const errorMessage = "Wrong entity type provided. The provided entity was: " + Object.getPrototypeOf(entityToAdd) + JSON.stringify(entityToAdd);
                throw new TypeError(errorMessage);

        }
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


    searchComponentOfEndpoint(endpointId: string): Component | undefined {
        return Array.from(this.#componentEntities.values()).find(component => {
            return !!component.getEndpointEntities.find(endpoint => {
                return endpoint.getId === endpointId;
            }) 
        })
    }

    getOutgoingLinksOfComponent(componentId: string): Link[] {
        return [...this.#linkEntities.values()].filter(link => link.getSourceEntity.getId === componentId);
    }

    getIncomingLinksOfComponent(componentId: string): Link[] {
        let endpointIds = this.#componentEntities.get(componentId).getEndpointEntities.map(endpoint => endpoint.getId);
        return [...this.#linkEntities.values()].filter(link => endpointIds.includes(link.getTargetEndpoint.getId));
    }

    getShortestPathLength(fromComponentId: string, toComponentId: string) {
        let alreadyVisited: string[] = [fromComponentId]; // track visited nodes to handle potential circular paths
        let nextNodes: {component: Component, currentPath: number}[] = this.getOutgoingLinksOfComponent(fromComponentId)
        .map(link => {
            return {component: this.searchComponentOfEndpoint(link.getTargetEndpoint.getId), currentPath: 1};
        })
        .filter(next => !alreadyVisited.includes(next.component.getId));
        let shortestPath = this.getComponentEntities.size - 1; //assume longest possible path length if no path can be found
        while(nextNodes.length > 0) {
            let next = nextNodes[0];
            if (next.component.getId === toComponentId) {
                // found path :)
                shortestPath = next.currentPath;
                break;
            } else {
                // continue search
                let nextNextNodes: {component: Component, currentPath: number}[] = this.getOutgoingLinksOfComponent(next.component.getId)
                .map(link => {
                    return {component: this.searchComponentOfEndpoint(link.getTargetEndpoint.getId), currentPath: next.currentPath + 1};
                })
                .filter(next => !alreadyVisited.includes(next.component.getId));
                nextNodes.push(...nextNextNodes);
                alreadyVisited.push(next.component.getId);
                nextNodes.splice(0, 1);
            }
        }
        return shortestPath;
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