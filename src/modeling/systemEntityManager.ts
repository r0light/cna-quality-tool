import { dia, util } from '@joint/core';
import * as yaml from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import EntityTypes from './config/entityTypes';
import * as Entities from '../core/entities';
import ErrorMessage, { ErrorType } from './errorMessage'
import { DetailsSidebarConfig, EntityDetailsConfig, EntityRelationsConfig } from './config/detailsSidebarConfig';
import { MetaData, getEmptyMetaData } from "../core/common/entityDataTypes";
import { convertToServiceTemplate, importFromServiceTemplate } from "../core/tosca-adapter/ToscaAdapter";
import {
    Component as ComponentElement, Service as ServiceElement, BackingService as BackingServiceElement, StorageBackingService as StorageBackingServiceElement, ProxyBackingService as ProxyBackingServiceElement, BrokerBackingService as BrokerBackingServiceElement,
    Endpoint as EndpointElement, ExternalEndpoint as ExternalEndpointElement, Link as LinkElement,
    Infrastructure as InfrastructureElement, DeploymentMapping as DeploymentMappingElement,
    RequestTrace as RequestTraceElement, DataAggregate as DataAggregateElement, BackingData as BackingDataElement, Network as NetworkElement,
    entityShapes
} from './config/entityShapes'
import { DataAggregate } from "../core/entities";
import { FormContentConfig } from "./config/actionDialogConfig";
import { RelationToDataAggregate } from "../core/entities/relationToDataAggregate";
import { RelationToBackingData } from "../core/entities/relationToBackingData";
import { Artifact } from '@/core/common/artifact';
import { Entity } from '@/core/qualitymodel/quamoco/Entity';
import { networkInterfaces } from 'os';
import { Network } from '@/core/entities/network';

class SystemEntityManager {

    #currentSystemGraph: dia.Graph;

    #currentSystemEntity: Entities.System;

    #errorMessages = new Map();

    #includedDataAggregateEntities = new Map();

    constructor(currentGraph: dia.Graph) {

        this.#currentSystemGraph = currentGraph;
        this.#currentSystemEntity = new Entities.System("test");

        // needed because javascript (https://stackoverflow.com/questions/67416881/es6-proxied-class-access-private-property-cannot-read-private-member-hidden-f)
        this.getSystemEntity = this.getSystemEntity.bind(this);
        this.overwriteSystemEntity = this.overwriteSystemEntity.bind(this);
        this.convertToGraph = this.convertToGraph.bind(this);
        this.convertToJson = this.convertToJson.bind(this);
        this.convertToCustomTosca = this.convertToCustomTosca.bind(this);
        this.loadFromCustomTosca = this.loadFromCustomTosca.bind(this);
        this.loadFromJson = this.loadFromJson.bind(this);
        this.getGraph = this.getGraph.bind(this);
        this.validateModeledSystem = this.validateModeledSystem.bind(this);
    }

    getSystemEntity(): Entities.System {
        this.#convertToSystemEntity();
        return this.#currentSystemEntity;
    }

    getGraph(): dia.Graph {
        // call convertToGraph()?;
        return this.#currentSystemGraph;
    }

    convertToCustomTosca(): { tosca: string, errors: string[] } {

        let graphErrors = this.#validateGraph();

        this.#currentSystemEntity.resetAllIncludedSystemEntities();

        this.#convertToSystemEntity();

        let systemErrors = this.#validateSystemEntity();

        let serviceTemplate = convertToServiceTemplate(this.#currentSystemEntity);
        try {
            const asYaml = yaml.dump(serviceTemplate, {
                styles: {
                    '!!null': 'empty'
                }
            });
            return { tosca: asYaml, errors: graphErrors.concat(systemErrors) };
        } catch (err) {
            console.error(err);
        }
    }


    loadFromCustomTosca(stringifiedTOSCA: string, fileName: string, strategy: "replace" | "merge"): { createdCells: dia.Cell[], error: string } {
        let system = new Entities.System("imported");
        try {
            system = importFromServiceTemplate(fileName, stringifiedTOSCA);
        } catch (err) {
            console.trace();
            console.log(err);
            return { createdCells: [], error: err.toString() }
        }
        if (strategy === "replace") {
            this.overwriteSystemEntity(system);
        } else if (strategy === "merge") {

            for (const [id, dataAggregate] of system.getDataAggregateEntities.entries()) {
                if (this.#currentSystemEntity.getDataAggregateEntities.get(id)) {
                    let newId = uuidv4();
                    dataAggregate.setId = newId;
                }
                this.#currentSystemEntity.addEntity(dataAggregate);
            }

            for (const [id, backingData] of system.getBackingDataEntities.entries()) {
                if (this.#currentSystemEntity.getBackingDataEntities.get(id)) {
                    let newId = uuidv4();
                    backingData.setId = newId;
                }
                this.#currentSystemEntity.addEntity(backingData);
            }

            for (const [id, network] of system.getNetworkEntities.entries()) {
                if (this.#currentSystemEntity.getNetworkEntities.get(id)) {
                    let newId = uuidv4();
                    network.setId = newId;
                }
                this.#currentSystemEntity.addEntity(network);
            }

            for (const [id, infrastructure] of system.getInfrastructureEntities.entries()) {
                if (this.#currentSystemEntity.getInfrastructureEntities.get(id)) {
                    let newId = uuidv4();
                    infrastructure.setId = newId;
                }
                this.#currentSystemEntity.addEntity(infrastructure);
            }

            for (const [id, component] of system.getComponentEntities.entries()) {
                if (this.#currentSystemEntity.getComponentEntities.get(id)) {
                    let newId = uuidv4();
                    component.setId = newId;
                }

                for (const endpoint of component.getEndpointEntities) {
                    if (this.#currentSystemEntity.searchComponentOfEndpoint(endpoint.getId)) {
                        endpoint.setId = uuidv4();
                    }
                }

                for (const endpoint of component.getExternalEndpointEntities) {
                    // TODO check for external endpoints
                }

                this.#currentSystemEntity.addEntity(component);
            }

            for (const [id, deploymentMapping] of system.getDeploymentMappingEntities.entries()) {
                if (this.#currentSystemEntity.getDeploymentMappingEntities.get(id)) {
                    let newId = uuidv4();
                    deploymentMapping.setId = newId;
                }
                this.#currentSystemEntity.addEntity(deploymentMapping);
            }

            for (const [id, link] of system.getLinkEntities.entries()) {
                if (this.#currentSystemEntity.getLinkEntities.get(id)) {
                    let newId = uuidv4();
                    link.setId = newId;
                }
                this.#currentSystemEntity.addEntity(link);
            }

            for (const [id, requestTrace] of system.getRequestTraceEntities.entries()) {
                if (this.#currentSystemEntity.getRequestTraceEntities.get(id)) {
                    let newId = uuidv4();
                    requestTrace.setId = newId;
                }
                this.#currentSystemEntity.addEntity(requestTrace);
            }

        }

        this.convertToGraph();
        this.#currentSystemGraph.trigger("reloaded");

        return { createdCells: this.#currentSystemGraph.getCells(), error: null };
    }

    convertToJson(): string {
        let jsonSerializedGraph = this.#currentSystemGraph.toJSON();
        return jsonSerializedGraph;
    }

    loadFromJson(stringifiedJson: string, fileName: string, strategy: "replace" | "merge"): { createdCells: dia.Cell[], error: string } {
        let jsonGraph = {};
        try {
            jsonGraph = JSON.parse(stringifiedJson);
            if (strategy === "replace") {
                this.#currentSystemGraph.clear();
                this.#currentSystemGraph.fromJSON(jsonGraph);
            } else if (strategy === "merge") {
                let newGraph: dia.Graph = new dia.Graph({}, { cellNamespace: entityShapes });
                newGraph.fromJSON(jsonGraph);
                newGraph.getCells().forEach(cell => {
                    this.#currentSystemGraph.addCell(cell);
                });
            }
        } catch (e) {
            return { createdCells: [], error: e.toString() }
        }


        this.#currentSystemGraph.trigger("reloaded");

        this.#currentSystemEntity.setSystemName = fileName.replace(/\..*$/g, "");
        return { createdCells: this.#currentSystemGraph.getCells(), error: null }
    }

    validateModeledSystem(): string[] {

        let graphErrors = this.#validateGraph();

        this.#currentSystemEntity.resetAllIncludedSystemEntities();

        this.#convertToSystemEntity();

        let systemErrors = this.#validateSystemEntity();

        return graphErrors.concat(systemErrors);
    }


    #convertToSystemEntity() {
        // get first elements to ensure that all connection relate entities already exist

        let elements: dia.Element[] = this.#currentSystemGraph.getElements();

        // start with Data Aggregate and Backing Data, because Components need to refer to them
        let dataEntities = elements.filter((element) => element.prop("entity/type") === EntityTypes.DATA_AGGREGATE
            || element.prop("entity/type") === EntityTypes.BACKING_DATA
        );
        for (const dataEntityElement of dataEntities) {
            this.#addDataEntity(dataEntityElement);
        }

        // continue with networks
        let networkEntities = elements.filter((element) => element.prop("entity/type") === EntityTypes.NETWORK);
        for (const networkElement of networkEntities) {
            this.#addNetworkEntity(networkElement)
        }

        // continue with entities
        let componentEntities = elements.filter((element) => element.prop("entity/type") === EntityTypes.COMPONENT
            || element.prop("entity/type") === EntityTypes.SERVICE
            || element.prop("entity/type") === EntityTypes.BACKING_SERVICE
            || element.prop("entity/type") === EntityTypes.STORAGE_BACKING_SERVICE
            || element.prop("entity/type") === EntityTypes.PROXY_BACKING_SERVICE
            || element.prop("entity/type") === EntityTypes.BROKER_BACKING_SERVICE
            || element.prop("entity/type") === EntityTypes.INFRASTRUCTURE
        );

        for (const graphElement of componentEntities) {

            let addedEntity: Entities.Component | Entities.Infrastructure;

            switch (graphElement.prop("entity/type")) {
                case EntityTypes.COMPONENT:
                case EntityTypes.SERVICE:
                case EntityTypes.BACKING_SERVICE:
                case EntityTypes.STORAGE_BACKING_SERVICE:
                case EntityTypes.PROXY_BACKING_SERVICE:
                case EntityTypes.BROKER_BACKING_SERVICE:
                    addedEntity = this.#createComponentEntity(graphElement);
                    break;
                case EntityTypes.INFRASTRUCTURE:
                    addedEntity = this.#createInfrastructureEntity(graphElement);
                    break;
                default:
                    throw new TypeError("Unsuitable Element provided! No corresponding Entity type is known for: " + JSON.stringify(graphElement));
            }

            this.#currentSystemEntity.addEntity(addedEntity);
        }

        for (const graphElement of componentEntities) {

            switch (graphElement.prop("entity/type")) {
                case EntityTypes.COMPONENT:
                case EntityTypes.SERVICE:
                case EntityTypes.BACKING_SERVICE:
                case EntityTypes.STORAGE_BACKING_SERVICE:
                case EntityTypes.PROXY_BACKING_SERVICE:
                case EntityTypes.BROKER_BACKING_SERVICE:
                    let addedEntity = this.#currentSystemEntity.getComponentEntities.get(graphElement.id.toString());
                    this.#configureComponentEntity(addedEntity, graphElement);
                    break;
                case EntityTypes.INFRASTRUCTURE:
                    let addedInfrastructure = this.#currentSystemEntity.getInfrastructureEntities.get(graphElement.id.toString());
                    this.#configureInfrastructureEntity(addedInfrastructure, graphElement);
                    break;
                default:
                    throw new TypeError("Unsuitable Element provided! No corresponding Entity type is known for: " + JSON.stringify(graphElement));
            }
        }

        // next are Links and Deployment Mappings
        for (const graphLink of this.#currentSystemGraph.getLinks()) {
            this.#addConnectionEntity(graphLink);
        }

        // finally add Request Traces
        let traceEntities = elements.filter((element) => element.prop("entity/type") === EntityTypes.REQUEST_TRACE);
        for (const graphElement of traceEntities) {
            this.#addTraceEntity(graphElement);
        }

        // now, validate the created system TODO here or independently?
        let errors: string[] = this.#validateSystemEntity();
    }

    #addDataEntity(graphElement: dia.Element) {
        let addedEntity: Entities.DataAggregate | Entities.BackingData;
        switch (graphElement.prop("entity/type")) {
            case EntityTypes.DATA_AGGREGATE:
                addedEntity = this.#createDataAggregateEntity(graphElement);
                if ([...(this.#currentSystemEntity.getDataAggregateEntities)].filter(([id, existingDataAggregate]) => existingDataAggregate.getName === addedEntity.getName).length === 0) {
                    // only add data aggregate if a data aggregate with the same name not already exists
                    this.#currentSystemEntity.addEntity(addedEntity);
                }
                break;
            case EntityTypes.BACKING_DATA:
                addedEntity = this.#createBackingDataEntity(graphElement);
                if ([...(this.#currentSystemEntity.getBackingDataEntities)].filter(([id, existingBackingData]) => existingBackingData.getName === addedEntity.getName).length === 0) {
                    // only add data aggregate if a data aggregate with the same name not already exists
                    this.#currentSystemEntity.addEntity(addedEntity);
                }
                break;
            default:
                throw new TypeError("Unsuitable Data Element provided! No corresponding Data Entity type is known for: " + JSON.stringify(graphElement));
        }
    }

    #addNetworkEntity(network: dia.Element) {
        let networkEntity: Entities.Network = this.#createNetworkEntity(network);
        this.#currentSystemEntity.addEntity(networkEntity);
    }

    #createNetworkEntity(graphElement) {
        const networkEntity = new Entities.Network(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));

        // set entity properties
        for (let property of networkEntity.getProperties()) {
            property.value = graphElement.prop("entity/properties/" + property.getKey)
        }

        return networkEntity;
    }

    #addConnectionEntity(graphLink: dia.Link) {
        let addedEntity: Entities.Link | Entities.DeploymentMapping;
        switch (graphLink.prop("entity/type")) {
            case EntityTypes.LINK:
                addedEntity = this.#createLinkEntity(graphLink);
                break;
            case EntityTypes.DEPLOYMENT_MAPPING:
                addedEntity = this.#createDeploymentMappingEntity(graphLink);
                break;
            default:
                throw new TypeError("Unsuitable Link Element provided! No corresponding connection type is known for: " + JSON.stringify(graphLink));
        }

        this.#currentSystemEntity.addEntity(addedEntity);
    }

    #addTraceEntity(requestTrace: dia.Element) {
        let requestTraceEntity: Entities.RequestTrace = this.#createRequestTraceEntity(requestTrace);
        this.#currentSystemEntity.addEntity(requestTraceEntity);
    }

    #createDataAggregateEntity(graphElement, returnDataAggregateAnyway = false) {

        const dataAggregate = new Entities.DataAggregate(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));

        return dataAggregate;
    }

    #createBackingDataEntity(graphElement) {

        const backingData = new Entities.BackingData(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));

        // set entity properties
        for (let property of backingData.getProperties()) {
            property.value = graphElement.prop("entity/properties/" + property.getKey)
        }

        return backingData;
    }

    #createComponentEntity(graphElement: dia.Element) {

        let componentModelEntity: Entities.Component | Entities.Service | Entities.BackingService | Entities.StorageBackingService | Entities.ProxyBackingService;
        switch (graphElement.prop("entity/type")) {
            case EntityTypes.SERVICE:
                componentModelEntity = new Entities.Service(graphElement.id.toString(), graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));
                break;
            case EntityTypes.BACKING_SERVICE:
                componentModelEntity = new Entities.BackingService(graphElement.id.toString(), graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));
                break;
            case EntityTypes.STORAGE_BACKING_SERVICE:
                componentModelEntity = new Entities.StorageBackingService(graphElement.id.toString(), graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));
                break;
            case EntityTypes.PROXY_BACKING_SERVICE:
                componentModelEntity = new Entities.ProxyBackingService(graphElement.id.toString(), graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));
                break;
            case EntityTypes.BROKER_BACKING_SERVICE:
                componentModelEntity = new Entities.BrokerBackingService(graphElement.id.toString(), graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));
                break;
            case EntityTypes.COMPONENT:
            default:
                componentModelEntity = new Entities.Component(graphElement.id.toString(), graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));
        }


        return componentModelEntity;

    }

    #configureComponentEntity(entity: Entities.Component | Entities.Service | Entities.BackingService | Entities.StorageBackingService | Entities.ProxyBackingService | Entities.BrokerBackingService, graphElement: dia.Element) {
        // set entity properties
        for (let property of entity.getProperties()) {
            property.value = graphElement.prop("entity/properties/" + property.getKey)
        }

        // set artifact(s)
        let artifactsData = graphElement.prop("entity/artifacts");
        for (const artifactData of artifactsData) {
            let artifact = new Artifact(artifactData.type,
                artifactData.file,
                artifactData.repository,
                artifactData.description,
                artifactData.deploy_path,
                artifactData.artifact_version,
                artifactData.checksum,
                artifactData.checksum_algorithm,
            )
            entity.setArtifact(artifactData.key, artifact);
        }


        for (const embeddedCell of graphElement.getEmbeddedCells()) {
            switch (embeddedCell.prop("entity/type")) {
                case EntityTypes.ENDPOINT:
                case EntityTypes.EXTERNAL_ENDPOINT:
                    const endpoint = this.#createEndpointEntity(embeddedCell, graphElement, entity);
                    if (!endpoint) {
                        // ErrorMessages already created while creating entity 
                        break;
                    }
                    entity.addEndpoint(endpoint);
                    break;
                case EntityTypes.DATA_AGGREGATE:
                    let dataAggregateName: string = embeddedCell.attr("label/textWrap/text");
                    let referencedDataAggregate = [...(this.#currentSystemEntity.getDataAggregateEntities)].filter(([id, dataAggregate]) => dataAggregate.getName === dataAggregateName);
                    if (referencedDataAggregate.length > 0) {
                        let relation = new RelationToDataAggregate(embeddedCell.id.toString(), this.#parseMetaDataFromElement(embeddedCell as dia.Element));
                        for (let property of relation.getProperties()) {
                            property.value = embeddedCell.prop("relationship/properties/" + property.getKey)
                        }
                        // TODO parse data aggregate properties and use single data aggregate only?
                        entity.addDataAggregateEntity(referencedDataAggregate[0][1], relation);
                    } else {
                        throw new Error(`Data Aggregate with name ${dataAggregateName} should be there, but could not be found in ${this.#currentSystemEntity.getDataAggregateEntities}`);
                    }
                    break;
                case EntityTypes.BACKING_DATA:
                    let backingDataName: string = embeddedCell.attr("label/textWrap/text");
                    let referencedBackingData = [...(this.#currentSystemEntity.getBackingDataEntities)].filter(([id, backingData]) => backingData.getName === backingDataName);
                    if (referencedBackingData.length > 0) {
                        let relation = new RelationToBackingData(embeddedCell.id.toString(), this.#parseMetaDataFromElement(embeddedCell as dia.Element));

                        for (let property of relation.getProperties()) {
                            property.value = embeddedCell.prop("relationship/properties/" + property.getKey)
                        }

                        entity.addBackingDataEntity(referencedBackingData[0][1], relation);
                    } else {
                        throw new Error(`Backing Data with name ${backingDataName} should be there, but could not be found in ${this.#currentSystemEntity.getBackingDataEntities}`);
                    }
                    break;
                default:
                    break;
            }
        }

        const proxyId = graphElement.prop("entity/relations/proxied_by");
        if (proxyId) {
            const backingService = [...(this.#currentSystemEntity.getComponentEntities)].find(([id, component]) => { return id === proxyId });
            if (backingService) {
                entity.setProxiedBy = backingService[1];
            } else {
                console.log(`Backing Service ${proxyId} not found`)
            }
        }

        const addressResolutionId = graphElement.prop("entity/relations/address_resolution_by");
        if (addressResolutionId) {
            const resolutionComponent = [...(this.#currentSystemEntity.getComponentEntities)].find(([id, component]) => { return id === addressResolutionId });
            if (resolutionComponent) {
                entity.setAddressResolutionBy = resolutionComponent[1];
            } else {
                const resolutionInfrastructure = [...(this.#currentSystemEntity.getInfrastructureEntities)].find(([id, infrastructure]) => { return id === addressResolutionId });
                if (resolutionInfrastructure) {
                    entity.setAddressResolutionBy = resolutionInfrastructure[1];
                } else {
                    const resolutionNetwork = [...(this.#currentSystemEntity.getNetworkEntities)].find(([id, network]) => { return id === addressResolutionId });
                    if (resolutionNetwork) {
                        entity.setAddressResolutionBy = resolutionNetwork[1];
                    } else {
                        console.log(`Entity ${addressResolutionId} not found`)
                    }
                }
            }
        }

        const assignedNetworks = graphElement.prop("entity/relations/assigned_to_networks");
        if (assignedNetworks && assignedNetworks.length > 0) {
            for (const networkId of assignedNetworks) {
                let network = this.#currentSystemEntity.getNetworkEntities.get(networkId);
                if (network) {
                    entity.addNetwork(network);
                } else {
                    console.log(`Network ${networkId} not found`)
                }
            }
        }
    }

    #createInfrastructureEntity(graphElement) {
        let infrastructureEntity = new Entities.Infrastructure(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));

        return infrastructureEntity;
    }

    #configureInfrastructureEntity(infrastructureEntity: Entities.Infrastructure, infrastructureElement: dia.Element) {

        // set entity properties
        for (let property of infrastructureEntity.getProperties()) {
            property.value = infrastructureElement.prop("entity/properties/" + property.getKey)
        }

        // set artifact(s)
        let artifactsData = infrastructureElement.prop("entity/artifacts");
        for (const artifactData of artifactsData) {
            let artifact = new Artifact(artifactData.type,
                artifactData.file,
                artifactData.repository,
                artifactData.description,
                artifactData.deploy_path,
                artifactData.artifact_version,
                artifactData.checksum,
                artifactData.checksum_algorithm,
            )
            infrastructureEntity.setArtifact(artifactData.key, artifact);
        }

        const backingDataEntities = infrastructureElement.getEmbeddedCells();

        for (const embeddedBackingData of backingDataEntities) {
            switch (embeddedBackingData.prop("entity/type")) {
                case EntityTypes.BACKING_DATA:
                    let backingDataName: string = embeddedBackingData.attr("label/textWrap/text");
                    let referencedBackingData = [...(this.#currentSystemEntity.getBackingDataEntities)].filter(([id, backingData]) => backingData.getName === backingDataName);
                    if (referencedBackingData.length > 0) {
                        let relation = new RelationToBackingData(embeddedBackingData.id.toString(), this.#parseMetaDataFromElement(embeddedBackingData as dia.Element));

                        for (let property of relation.getProperties()) {
                            property.value = embeddedBackingData.prop("relationship/properties/" + property.getKey)
                        }

                        infrastructureEntity.addBackingDataEntity(referencedBackingData[0][1], relation);
                    } else {
                        throw new Error(`Backing Data with name ${backingDataName} should be there, but could not be found in ${this.#currentSystemEntity.getBackingDataEntities}`);
                    }
                    break;
                default:
                    break;
            }
        }

        const assignedNetworks = infrastructureElement.prop("entity/relations/assigned_to_networks");
        if (assignedNetworks && assignedNetworks.length > 0) {
            for (const networkId of assignedNetworks) {
                let network = this.#currentSystemEntity.getNetworkEntities.get(networkId);
                if (network) {
                    infrastructureEntity.addNetwork(network);
                } else {
                    console.log(`Network ${networkId} not found`)
                }
            }
        }

    }


    #validateGraph(): string[] {

        let errors = []


        this.#currentSystemGraph.getElements().forEach(element => {
            switch (element.prop("entity/type")) {
                case EntityTypes.ENDPOINT:
                    if (!element.isEmbedded()) {
                        errors.push(`Endpoint ${element.attr("label/textWrap/text")} is not added to any component; It will be ignored when exporting`)
                    }
                    break;
                case EntityTypes.EXTERNAL_ENDPOINT:
                    if (!element.isEmbedded()) {
                        errors.push(`External Endpoint ${element.attr("label/textWrap/text")} is not added to any component; It will be ignored when exporting`)
                    }
                    break;
                case EntityTypes.DATA_AGGREGATE:
                    if (!element.isEmbedded()) {
                        errors.push(`Data Aggregate ${element.attr("label/textWrap/text")} is not added to any component; It will be ignored when exporting`)
                    }
                    break;
                case EntityTypes.BACKING_DATA:
                    if (!element.isEmbedded()) {
                        errors.push(`Data Aggregate ${element.attr("label/textWrap/text")} is not added to any component; It will be ignored when exporting`)
                    }
                    break;
            }
        })

        /*
        const externalEndpointId = graphElement.prop("entity/properties/referred_endpoint");
        if (!externalEndpointId || !(externalEndpointId.trim())) {
            const message = `A Request Trace entity is only valid if it specifies its referred External Endpoint entity. However, for the Request Trace "${graphElement.attr("label/textWrap/text")}" 
            no External Endpoint was selected and it is, therefore, invalid.`;
            const error = new ErrorMessage(EntityTypes.REQUEST_TRACE, ErrorType.INVALID_MODEL_ENTIY, graphElement.attr("label/textWrap/text"), "External Endpoint", message);
            this.#errorMessages.set(graphElement.id, error);
            return null;
        }

        const involvedLinkIds = graphElement.prop("entity/properties/involved_links");
        if (!involvedLinkIds || !involvedLinkIds[0] || involvedLinkIds[0].length <= 0) {
            const message = `A Request Trace entity is only valid if it specifies its involved Link entities. However, the Request Trace "${graphElement.attr("label/textWrap/text")}" 
            does not provide any information about its involved Links and it is, therefore, invalid.`;
            const error = new ErrorMessage(EntityTypes.REQUEST_TRACE, ErrorType.INVALID_MODEL_ENTIY, graphElement.attr("label/textWrap/text"), "Involved Links", message);
            this.#errorMessages.set(graphElement.id, error);
            return null;
        }
*/

        return errors;

    }


    #validateSystemEntity(): string[] {

        let errors = [];

        // validate that each component has a deployment mapping
        let mappingToDeployment = new Map<string, string>();
        for (const [mappingId, deploymentMapping] of this.#currentSystemEntity.getDeploymentMappingEntities.entries()) {
            if (deploymentMapping.getDeployedEntity) {
                mappingToDeployment.set(deploymentMapping.getDeployedEntity.getId, mappingId);
            }
        }
        for (let [componentId, component] of this.#currentSystemEntity.getComponentEntities.entries()) {
            if (!mappingToDeployment.has(componentId)) {
                let entityType = ((component) => {
                    switch (component.constructor) {
                        case Entities.Service:
                            return "Service";
                        case Entities.BackingService:
                            return "Backing Service";
                        case Entities.StorageBackingService:
                            return "Storage Backing Service";
                        case Entities.ProxyBackingService:
                            return "Proxy Backing Service";
                        case Entities.BrokerBackingService:
                            return "Broker Backing Service";
                        case Entities.Component:
                        default:
                            return "Component";
                    }
                })(component);
                errors.push(`${entityType} ${component.getName} is not deployed on any infrastructure.`)
            }
        }


        // validate that each Data Aggregate is persisted by at least one component
        let dataAggregateRelations: Map<string, RelationToDataAggregate[]> = new Map();
        this.#currentSystemEntity.getDataAggregateEntities.forEach((dataAggregate, dataAggregateId) => {
            dataAggregateRelations.set(dataAggregateId, []);
        })
        for (let [componentId, component] of this.#currentSystemEntity.getComponentEntities.entries()) {
            component.getDataAggregateEntities.forEach(dataAggregateRelation => {
                dataAggregateRelations.get(dataAggregateRelation.data.getId).push(dataAggregateRelation.relation);
            })
        }
        for (let [dataAggregateId, dataAggregate] of this.#currentSystemEntity.getDataAggregateEntities.entries()) {
            let relationsToThisDataAggregate = dataAggregateRelations.get(dataAggregateId);
            if (!relationsToThisDataAggregate.some(relation => relation.getProperties().find(prop => prop.getKey === "usage_relation").value === "persistence")) {
                errors.push(`Data Aggregate ${dataAggregate.getName} is not persisted by any entity.`)
            }
        }

        // validate that each request trace has a referred endpoint and associated links
        for (let [requestTraceId, requestTrace] of this.#currentSystemEntity.getRequestTraceEntities.entries()) {
            if (!requestTrace.getExternalEndpoint) {
                errors.push(`Request Trace ${requestTrace.getName} has no external endpoint to which it refers.`);
            }
            if (requestTrace.getLinks.size === 0) {
                errors.push(`Request Trace ${requestTrace.getName} has no links added to it.`);
            }
        }

        return errors;
    }

    #createEndpointEntity(graphElement, parentElement: dia.Element, parentEntity: Entities.Component | Entities.Service | Entities.BackingService | Entities.StorageBackingService | Entities.ProxyBackingService | Entities.BrokerBackingService) {
        let endpointEntity: Entities.Endpoint | Entities.ExternalEndpoint;
        switch (graphElement.prop("entity/type")) {
            case EntityTypes.EXTERNAL_ENDPOINT:
                endpointEntity = new Entities.ExternalEndpoint(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));
                break;
            case EntityTypes.ENDPOINT:
            default:
                endpointEntity = new Entities.Endpoint(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));
        }
        for (let property of endpointEntity.getProperties()) {
            property.value = graphElement.prop("entity/properties/" + property.getKey);
        }

        if (graphElement.prop("entity/relations/uses_data")) {

            let dataAggregateIds = graphElement.prop("entity/relations/uses_data");


            for (const dataAggregateId of dataAggregateIds) {

                let dataAggregateCell = this.getGraph().getCell(dataAggregateId);

                if (dataAggregateCell) {
                    let dataAggregateName: string = dataAggregateCell.attr("label/textWrap/text");

                    let referencedDataAggregate = parentEntity.getDataAggregateEntities.find(dataAggregateRelation => dataAggregateRelation.data.getName === dataAggregateName);

                    endpointEntity.addDataAggregateEntity(referencedDataAggregate.data, referencedDataAggregate.relation);
                }

            }
        }

        return endpointEntity;
    }



    #createLinkEntity(graphLink) {
        const sourceElement = graphLink.getSourceElement();
        const targetElement = graphLink.getTargetElement();
        if (!sourceElement && targetElement) {
            const message = "There exists a Link that is missing its source entity.";
            const error = new ErrorMessage(EntityTypes.LINK, ErrorType.INVALID_MODEL_ENTIY, "Target: " + targetElement.attr("label/textWrap/text"), "Link Source Entity", message);
            this.#errorMessages.set(graphLink.id, error);
            return null;
        }

        if (!targetElement && sourceElement) {
            const message = "There exists a Link that is missing its target entity.";
            const error = new ErrorMessage(EntityTypes.LINK, ErrorType.INVALID_MODEL_ENTIY, "Source: " + sourceElement.attr("label/textWrap/text"), "Link Target Entity ", message);
            this.#errorMessages.set(graphLink.id, error);
            return null;
        }

        if (!targetElement && !sourceElement) {
            const message = "There exists a Link that is missing its source and target entity.";
            const error = new ErrorMessage(EntityTypes.LINK, ErrorType.INVALID_MODEL_ENTIY, graphLink.id, "Link Source and Target Entity", message);
            this.#errorMessages.set(graphLink.id, error);
            return null;
        }



        const sourceEntity = this.#currentSystemEntity.getComponentEntities.get(sourceElement.id);


        if (!targetElement.getParentCell()) {
            throw new Error(`Cannot create a link to the Endpoint ${targetElement}, because it is not embedded`);
        }
        let targetParent = this.#currentSystemEntity.getComponentEntities.get(targetElement.getParentCell().id);
        const targetEndpoint = targetParent.getEndpointEntities.concat(targetParent.getExternalEndpointEntities).filter(endpoint => endpoint.getId === targetElement.id);

        if (targetEndpoint.length === 0) {
            throw new Error(`Could not find Endpoint for: ${targetElement}`);
        }


        let linkEntity = new Entities.Link(graphLink.id, sourceEntity, targetEndpoint[0]);


        // set entity properties
        for (let property of linkEntity.getProperties()) {
            property.value = graphLink.prop("entity/properties/" + property.getKey)
        }

        return linkEntity;

        /* //TODO necessary?
        if (sourceEntity) {
            // add Link Connection to source entity --> needed at least for TOSCA export 
            sourceEntity.addLinkEntity(linkEntity);
        }
        */
    }

    #createDeploymentMappingEntity(graphLink) {
        const sourceElement = graphLink.getSourceElement(); // TODO check for storageBackingService
        const targetElement = graphLink.getTargetElement();
        if (!sourceElement && targetElement) {
            const message = "There exists a Deployment Mapping that is missing its source entity.";
            const error = new ErrorMessage(EntityTypes.LINK, ErrorType.INVALID_MODEL_ENTIY, "Target: " + targetElement.attr("label/textWrap/text"), "Deployment Mapping Source Entity", message);
            this.#errorMessages.set(graphLink.id, error);
            return null;
        }

        if (!targetElement && sourceElement) {
            const message = "There exists a Deployment Mapping that is missing its target entity.";
            const error = new ErrorMessage(EntityTypes.LINK, ErrorType.INVALID_MODEL_ENTIY, "Source: " + sourceElement.attr("label/textWrap/text"), "Deployment Mapping Target Entity", message);
            this.#errorMessages.set(graphLink.id, error);
            return null;
        }

        if (!targetElement && !sourceElement) {
            const message = "There exists a Deployment Mapping that is missing its source and target entity.";
            const error = new ErrorMessage(EntityTypes.LINK, ErrorType.INVALID_MODEL_ENTIY, graphLink.id, "Deployment Mapping Source and Target Entity", message);
            this.#errorMessages.set(graphLink.id, error);
            return null;
        }

        let underlyingInfrastructure = this.#currentSystemEntity.getInfrastructureEntities.get(targetElement.id);
        let deployedEntity;
        if (sourceElement.prop("entity/type") === EntityTypes.INFRASTRUCTURE) {
            deployedEntity = this.#currentSystemEntity.getInfrastructureEntities.get(sourceElement.id);
        } else {
            deployedEntity = this.#currentSystemEntity.getComponentEntities.get(sourceElement.id);
        }

        if (!underlyingInfrastructure || !deployedEntity) {
            // ErrorMessages already created while creating entity 
            return null;
        }

        const deploymentMapping = new Entities.DeploymentMapping(graphLink.id, deployedEntity, underlyingInfrastructure);

        // set entity properties
        for (let property of deploymentMapping.getProperties()) {
            property.value = graphLink.prop("entity/properties/" + property.getKey)
        }

        return deploymentMapping
    }

    #createRequestTraceEntity(graphElement) {

        const requestTrace = new Entities.RequestTrace(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));

        const externalEndpointId = graphElement.prop("entity/relations/referred_endpoint");
        const externalEndpoint = [...(this.#currentSystemEntity.getComponentEntities)].map(([id, component]) => component).flatMap(component => component.getExternalEndpointEntities).find(endpoint => endpoint.getId === externalEndpointId);
        if (externalEndpoint) {
            requestTrace.setExternalEndpoint = externalEndpoint;
        } else {
            console.log(`External Endpoint ${externalEndpointId} not found in any component`)
        }

        const involvedLinkIds = graphElement.prop("entity/relations/involved_links");

        if (involvedLinkIds) {
            const involvedLinks = involvedLinkIds.map(linkId => this.#currentSystemEntity.getLinkEntities.get(linkId));
            requestTrace.setLinks = involvedLinks;
        }

        // set entity properties
        for (let property of requestTrace.getProperties()) {
            property.value = graphElement.prop("entity/properties/" + property.getKey)
        }

        return requestTrace;
    }

    #parseMetaDataFromElement(cell: dia.Element): MetaData {
        return {
            label: cell.attr("label/textWrap/text"),
            fontSize: cell.attr("label/fontSize"),
            size: {
                width: cell.size().width,
                height: cell.size().height
            },
            position: {
                xCoord: cell.position().x,
                yCoord: cell.position().y
            }
        }
    }

    overwriteSystemEntity(newSystemEntity: Entities.System) {

        this.#currentSystemEntity.setSystemName = newSystemEntity.getSystemName;

        this.#currentSystemEntity.resetAllIncludedSystemEntities();
        this.#currentSystemEntity.addEntities(Array.from(newSystemEntity.getDataAggregateEntities.values()));
        this.#currentSystemEntity.addEntities(Array.from(newSystemEntity.getBackingDataEntities.values()));
        this.#currentSystemEntity.addEntities(Array.from(newSystemEntity.getNetworkEntities.values()));
        this.#currentSystemEntity.addEntities(Array.from(newSystemEntity.getInfrastructureEntities.values()));
        this.#currentSystemEntity.addEntities(Array.from(newSystemEntity.getComponentEntities.values()));
        this.#currentSystemEntity.addEntities(Array.from(newSystemEntity.getDeploymentMappingEntities.values()));
        this.#currentSystemEntity.addEntities(Array.from(newSystemEntity.getLinkEntities.values()));
        this.#currentSystemEntity.addEntities(Array.from(newSystemEntity.getRequestTraceEntities.values()));
    }

    convertToGraph(): dia.Cell[] {

        this.#currentSystemGraph.clear();

        let createdCells = [];
        let createdEdges = [];

        for (const [id, network] of this.#currentSystemEntity.getNetworkEntities) {
            let newNetwork = this.#createNetworkCell(network);
            this.#currentSystemGraph.addCell(newNetwork);
            createdCells.push(newNetwork);
        }

        for (const [id, infrastructure] of this.#currentSystemEntity.getInfrastructureEntities) {
            let newInfrastructure = this.#createInfrastructureCell(infrastructure);
            this.#currentSystemGraph.addCell(newInfrastructure);
            createdCells.push(newInfrastructure);

        }

        for (const [id, infrastructure] of this.#currentSystemEntity.getInfrastructureEntities) {

            let infrastructureElement: dia.Element = this.#currentSystemGraph.getCell(id) as dia.Element;

            this.#configureInfrastructureCell(infrastructure, infrastructureElement);

            let index = 0;
            for (const usedBackingData of infrastructure.getBackingDataEntities) {
                let newBackingData = this.#createBackingDataCell(usedBackingData, infrastructureElement, index);
                index++;
                this.#currentSystemGraph.addCell(newBackingData);
                createdCells.push(newBackingData);
            }
        }


        // first pass: only create entities
        for (const [id, component] of this.#currentSystemEntity.getComponentEntities) {
            switch (component.constructor.name) {
                case Entities.Service.name:
                    let newService = this.#createServiceCell(component);
                    this.#currentSystemGraph.addCell(newService);
                    break;
                case Entities.BackingService.name:
                    let newBackingService = this.#createBackingServiceCell(component);
                    this.#currentSystemGraph.addCell(newBackingService);
                    break;
                case Entities.StorageBackingService.name:
                    let newStorageBackingService = this.#createStorageBackingServiceCell(component);
                    this.#currentSystemGraph.addCell(newStorageBackingService);
                    break;
                case Entities.ProxyBackingService.name:
                    let newProxyBackingService = this.#createProxyBackingServiceCell(component);
                    this.#currentSystemGraph.addCell(newProxyBackingService);
                    break;
                case Entities.BrokerBackingService.name:
                    let newBrokerBackingService = this.#createBrokerBackingServiceCell(component);
                    this.#currentSystemGraph.addCell(newBrokerBackingService);
                    break;
                case Entities.Component.name:
                    let newComponent = this.#createComponentCell(component);
                    this.#currentSystemGraph.addCell(newComponent);
                    break;
            }
        }


        // second pass: configure entities and set relations
        for (const [id, component] of this.#currentSystemEntity.getComponentEntities) {

            let componentElement: dia.Element = this.#currentSystemGraph.getCell(id) as dia.Element;

            if (component.constructor.name === Entities.Service.name) {
                this.#configureComponentCell(component, componentElement);
                createdCells.push(componentElement);
            } else if (component.constructor.name === Entities.BackingService.name) {
                this.#configureComponentCell(component, componentElement);
                createdCells.push(componentElement);
            } else if (component.constructor.name === Entities.StorageBackingService.name) {
                this.#configureComponentCell(component, componentElement);
                createdCells.push(componentElement);
            } else if (component.constructor.name === Entities.ProxyBackingService.name) {
                this.#configureComponentCell(component, componentElement);
                createdCells.push(componentElement);
            } else if (component.constructor.name === Entities.BrokerBackingService.name) {
                this.#configureComponentCell(component, componentElement);
                createdCells.push(componentElement);
            } else if (component.constructor.name === Entities.Component.name) {
                this.#configureComponentCell(component, componentElement);
                createdCells.push(componentElement);
            }

            let index = 0;
            for (const usedDataAggregate of component.getDataAggregateEntities) {
                let newDataAggregate = this.#createDataAggregateCell(usedDataAggregate, componentElement, index);
                index++;
                this.#currentSystemGraph.addCell(newDataAggregate);
                createdCells.push(newDataAggregate);
            }

            index = 0;
            for (const usedBackingData of component.getBackingDataEntities) {
                let newBackingData = this.#createBackingDataCell(usedBackingData, componentElement, index);
                index++;
                this.#currentSystemGraph.addCell(newBackingData);
                createdCells.push(newBackingData);
            }

            for (const providedEndpoint of component.getEndpointEntities) {
                let newEndpoint = this.#createEndpointCell(providedEndpoint, componentElement);
                this.#currentSystemGraph.addCell(newEndpoint);
                createdCells.push(newEndpoint);
            }

            for (const providedExternalEndpoint of component.getExternalEndpointEntities) {
                let newExternalEndpoint = this.#createExternalEndpointCell(providedExternalEndpoint, componentElement);
                this.#currentSystemGraph.addCell(newExternalEndpoint);
                createdCells.push(newExternalEndpoint);
            }
        }

        for (const [id, deploymentMapping] of this.#currentSystemEntity.getDeploymentMappingEntities) {
            let newDeploymentMapping = new DeploymentMappingElement({ id: id })
            newDeploymentMapping.source(createdCells.find(cell => cell.id.toString() === deploymentMapping.getDeployedEntity.getId));
            newDeploymentMapping.target(createdCells.find(cell => cell.id.toString() === deploymentMapping.getUnderlyingInfrastructure.getId));

            for (const property of EntityDetailsConfig.DeploymentMapping.specificProperties) {
                if (property.jointJsConfig.modelPath) {
                    newDeploymentMapping.prop(property.jointJsConfig.modelPath, deploymentMapping.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
                }
            }

            newDeploymentMapping.addTo(this.#currentSystemGraph);
            createdEdges.push(newDeploymentMapping);
        }

        for (const [id, link] of this.#currentSystemEntity.getLinkEntities) {

            let newLink = new LinkElement({ id: id })
            newLink.source(createdCells.find(cell => cell.id.toString() === link.getSourceEntity.getId));
            newLink.target(createdCells.find(cell => cell.id.toString() === link.getTargetEndpoint.getId));

            for (const property of EntityDetailsConfig.Link.specificProperties) {
                if (property.jointJsConfig.modelPath) {
                    newLink.prop(property.jointJsConfig.modelPath, link.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
                }
            }

            newLink.addTo(this.#currentSystemGraph);
            createdEdges.push(newLink);
        }

        for (const [id, requestTrace] of this.#currentSystemEntity.getRequestTraceEntities) {
            let newRequestTrace = this.#createRequestTraceCell(requestTrace, createdCells, createdEdges);
            this.#currentSystemGraph.addCell(newRequestTrace);
            createdCells.push(newRequestTrace);
        }

        return createdCells;
    }

    #createNetworkCell(network: Entities.Network) {
        let newNetworkElement: dia.Element = new NetworkElement({
            id: network.getId,
            position: { x: network.getMetaData.position.xCoord, y: network.getMetaData.position.yCoord },
            size: network.getMetaData.size,
            attrs: {
                root: {
                    title: "cna.qualityModel.Network"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: network.getMetaData.fontSize,
                    textWrap: {
                        text: network.getMetaData.label ? network.getMetaData.label : network.getName
                    }
                }
            }
        })

        for (const property of EntityDetailsConfig.Network.specificProperties) {
            if (property.jointJsConfig.modelPath) {
                newNetworkElement.prop(property.jointJsConfig.modelPath, network.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
            }
        }

        return newNetworkElement;
    }

    #createInfrastructureCell(infrastructure: Entities.Infrastructure) {
        let newInfrastructure: dia.Element = new InfrastructureElement({
            id: infrastructure.getId,
            position: { x: infrastructure.getMetaData.position.xCoord, y: infrastructure.getMetaData.position.yCoord },
            size: infrastructure.getMetaData.size,
            attrs: {
                root: {
                    title: "cna.qualityModel.Infrastructure"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: infrastructure.getMetaData.fontSize,
                    textWrap: {
                        text: infrastructure.getMetaData.label ? infrastructure.getMetaData.label : infrastructure.getName
                    }
                }
            }
        });
        return newInfrastructure;
    }

    #configureInfrastructureCell(infrastructure: Entities.Infrastructure, infrastructureElement: dia.Element) {
        for (const property of EntityDetailsConfig.Infrastructure.specificProperties) {
            switch (property.providedFeature) {
                case "assigned_to_networks":
                    infrastructureElement.prop(property.jointJsConfig.modelPath, infrastructure.getNetworks.keys().toArray());
                    break;
                default:
                    if (property.jointJsConfig.modelPath) {
                        infrastructureElement.prop(property.jointJsConfig.modelPath, infrastructure.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
                    }
            }
        }

        let artifacts = [];
        for (const [artifactKey, artifact] of infrastructure.getArtifacts.entries()) {
            artifacts.push(artifact.getAsSimpleObject(artifactKey));
        }
        infrastructureElement.prop(DetailsSidebarConfig.GeneralProperties.artifacts.options[0].jointJsConfig.modelPath, artifacts)

    }


    #createServiceCell(service: Entities.Service) {
        let newService: dia.Element = new ServiceElement({
            id: service.getId,
            position: { x: service.getMetaData.position.xCoord, y: service.getMetaData.position.yCoord },
            size: service.getMetaData.size,
            attrs: {
                root: {
                    title: "cna.qualityModel.Service"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: service.getMetaData.fontSize,
                    textWrap: {
                        text: service.getMetaData.label ? service.getMetaData.label : service.getName
                    }
                }
            }
        })
        return newService;
    }


    #createBackingServiceCell(backingService: Entities.BackingService) {
        let newBackingService: dia.Element = new BackingServiceElement({
            id: backingService.getId,
            position: { x: backingService.getMetaData.position.xCoord, y: backingService.getMetaData.position.yCoord },
            size: backingService.getMetaData.size,
            attrs: {
                root: {
                    title: "cna.qualityModel.BackingService"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: backingService.getMetaData.fontSize,
                    textWrap: {
                        text: backingService.getMetaData.label ? backingService.getMetaData.label : backingService.getName
                    }
                }
            }
        })
        return newBackingService;
    }

    #createStorageBackingServiceCell(storageBackingService: Entities.StorageBackingService) {
        let newStorageBackingService: dia.Element = new StorageBackingServiceElement({
            id: storageBackingService.getId,
            position: { x: storageBackingService.getMetaData.position.xCoord, y: storageBackingService.getMetaData.position.yCoord },
            size: storageBackingService.getMetaData.size,
            attrs: {
                root: {
                    title: "cna.qualityModel.BackingService"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: storageBackingService.getMetaData.fontSize,
                    textWrap: {
                        text: storageBackingService.getMetaData.label ? storageBackingService.getMetaData.label : storageBackingService.getName
                    }
                }
            }
        })
        return newStorageBackingService;
    }

    #createProxyBackingServiceCell(proxyBackingService: Entities.ProxyBackingService) {
        let newProxyBackingService: dia.Element = new ProxyBackingServiceElement({
            id: proxyBackingService.getId,
            position: { x: proxyBackingService.getMetaData.position.xCoord, y: proxyBackingService.getMetaData.position.yCoord },
            size: proxyBackingService.getMetaData.size,
            attrs: {
                root: {
                    title: "cna.qualityModel.ProxyBackingService"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: proxyBackingService.getMetaData.fontSize,
                    textWrap: {
                        text: proxyBackingService.getMetaData.label ? proxyBackingService.getMetaData.label : proxyBackingService.getName
                    }
                }
            }
        })
        return newProxyBackingService;
    }

    #createBrokerBackingServiceCell(brokerBackingService: Entities.BrokerBackingService) {
        let newBrokerBackingService: dia.Element = new BrokerBackingServiceElement({
            id: brokerBackingService.getId,
            position: { x: brokerBackingService.getMetaData.position.xCoord, y: brokerBackingService.getMetaData.position.yCoord },
            size: brokerBackingService.getMetaData.size,
            attrs: {
                root: {
                    title: "cna.qualityModel.BrokerBackingService"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: brokerBackingService.getMetaData.fontSize,
                    textWrap: {
                        text: brokerBackingService.getMetaData.label ? brokerBackingService.getMetaData.label : brokerBackingService.getName
                    }
                }
            }
        })
        return newBrokerBackingService;
    }

    #createComponentCell(component: Entities.Component) {
        let newComponent: dia.Element = new ComponentElement({
            id: component.getId,
            position: { x: component.getMetaData.position.xCoord, y: component.getMetaData.position.yCoord },
            size: component.getMetaData.size,
            attrs: {
                root: {
                    title: "cna.qualityModel.Component"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: component.getMetaData.fontSize,
                    textWrap: {
                        text: component.getMetaData.label ? component.getMetaData.label : component.getName
                    }
                }
            }
        })
        return newComponent;
    }

    #configureComponentCell(component: Entities.Component, componentElement: dia.Element) {

        for (const property of EntityDetailsConfig[component.constructor.name].specificProperties) {
            if (property.jointJsConfig.modelPath) {
                componentElement.prop(property.jointJsConfig.modelPath, component.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
            }
        }

        for (const relation of EntityRelationsConfig[component.constructor.name].relations) {
            switch (relation.providedFeature) {
                case "proxiedBy":
                    if (component.getProxiedBy) {
                        componentElement.prop(relation.jointJsConfig.modelPath, component.getProxiedBy.getId);
                    }
                    break;
                case "addressResolutionBy":
                    if (component.getAddressResolutionBy) {
                        componentElement.prop(relation.jointJsConfig.modelPath, component.getAddressResolutionBy.getId);
                    }
                    break;
                case "assigned_to_networks":
                    componentElement.prop(relation.jointJsConfig.modelPath, [...component.getNetworks.keys()]);
                    break;
                default:
                    throw new Error(`Unknown relation ${relation.providedFeature} found for ${component.constructor.name}.`)
            }
        }

        let artifacts = [];
        for (const [artifactKey, artifact] of component.getArtifacts.entries()) {
            artifacts.push(artifact.getAsSimpleObject(artifactKey));
        }
        componentElement.prop(DetailsSidebarConfig.GeneralProperties.artifacts.options[0].jointJsConfig.modelPath, artifacts)

        return componentElement;
    }


    #createDataAggregateCell(dataAggregate: { data: DataAggregate, relation: RelationToDataAggregate }, parent: dia.Element, index: number) {

        let xPosition = dataAggregate.relation.getMetaData.position.xCoord !== 0 ? dataAggregate.relation.getMetaData.position.xCoord : parent.position().x + Math.floor(parent.size().width / 3) + dataAggregate.data.getMetaData.size.width * index;
        let yPosition = dataAggregate.relation.getMetaData.position.yCoord !== 0 ? dataAggregate.relation.getMetaData.position.yCoord : parent.position().y + Math.floor(parent.size().height / 3) + dataAggregate.data.getMetaData.size.height * index;

        let width = dataAggregate.relation.getMetaData.size.width !== dataAggregate.data.getMetaData.size.width ? dataAggregate.relation.getMetaData.size.width : dataAggregate.data.getMetaData.size.width;
        let height = dataAggregate.relation.getMetaData.size.height !== dataAggregate.data.getMetaData.size.height ? dataAggregate.relation.getMetaData.size.height : dataAggregate.data.getMetaData.size.height;

        let newDataAggregate = new DataAggregateElement({
            position: { x: xPosition, y: yPosition },
            size: { width: width, height: height },
            attrs: {
                root: {
                    title: "cna.qualityModel.DataAggregate"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: dataAggregate.relation.getMetaData.fontSize !== dataAggregate.data.getMetaData.fontSize ? dataAggregate.relation.getMetaData.fontSize : dataAggregate.data.getMetaData.fontSize,
                    textWrap: {
                        text: dataAggregate.data.getMetaData.label ? dataAggregate.data.getMetaData.label : dataAggregate.data.getName
                    }
                }
            }
        });

        parent.embed(newDataAggregate);

        for (const property of EntityDetailsConfig.DataAggregate.specificProperties) {
            switch (property.providedFeature) {
                case "embedded":
                    newDataAggregate.prop(property.jointJsConfig.modelPath, parent.id.toString());
                    break;
                case "dataAggregate-assignedFamily":
                    newDataAggregate.prop(property.jointJsConfig.modelPath, dataAggregate.data.getName);
                    break;
                default:
                    // TODO handle additional attributes?; decide based on model path whether it can be found in data or relation    
                    if (property.jointJsConfig.modelPath) {
                        if (dataAggregate.data.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature)) {
                            newDataAggregate.prop(property.jointJsConfig.modelPath, dataAggregate.data.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
                        } else if (dataAggregate.relation.getProperties().find(relationProperty => relationProperty.getKey === property.providedFeature)) {
                            newDataAggregate.prop(property.jointJsConfig.modelPath, dataAggregate.relation.getProperties().find(relationProperty => relationProperty.getKey === property.providedFeature).value)
                        }
                    }
                    break;

            }
        }
        return newDataAggregate;
    }


    #createBackingDataCell(backingData: { backingData: Entities.BackingData, relation: RelationToBackingData }, parent: dia.Element, index: number) {

        let xPosition = backingData.relation.getMetaData.position.xCoord !== 0 ? backingData.relation.getMetaData.position.xCoord : parent.position().x + Math.floor(parent.size().width / 3) + backingData.backingData.getMetaData.size.width * index;
        let yPosition = backingData.relation.getMetaData.position.yCoord !== 0 ? backingData.relation.getMetaData.position.yCoord : parent.position().y + Math.floor(parent.size().height / 3) + backingData.backingData.getMetaData.size.height * index;

        let width = backingData.relation.getMetaData.size.width !== backingData.backingData.getMetaData.size.width ? backingData.relation.getMetaData.size.width : backingData.backingData.getMetaData.size.width;
        let height = backingData.relation.getMetaData.size.height !== backingData.backingData.getMetaData.size.height ? backingData.relation.getMetaData.size.height : backingData.backingData.getMetaData.size.height;

        let newBackingData = new BackingDataElement({
            position: { x: xPosition, y: yPosition },
            size: { width: width, height: height },
            attrs: {
                root: {
                    title: "cna.qualityModel.BackingData"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: backingData.relation.getMetaData.fontSize !== backingData.backingData.getMetaData.fontSize ? backingData.relation.getMetaData.fontSize : backingData.backingData.getMetaData.fontSize,
                    textWrap: {
                        text: backingData.backingData.getMetaData.label ? backingData.backingData.getMetaData.label : backingData.backingData.getName
                    }
                }
            }
        });

        parent.embed(newBackingData);

        for (const property of EntityDetailsConfig.BackingData.specificProperties) {
            switch (property.providedFeature) {
                case "embedded":
                    newBackingData.prop(property.jointJsConfig.modelPath, parent.id.toString());
                    break;
                case "backingData-assignedFamily":
                    newBackingData.prop(property.jointJsConfig.modelPath, backingData.backingData.getName);
                    break;
                case "backingData-chooseEditMode":
                default:
                    // TODO handle additional attributes?; decide based on model path whether it can be found in data or relation    
                    if (property.jointJsConfig.modelPath) {
                        if (backingData.backingData.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature)) {
                            newBackingData.prop(property.jointJsConfig.modelPath, backingData.backingData.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
                        } else if (backingData.relation.getProperties().find(relationProperty => relationProperty.getKey === property.providedFeature)) {
                            newBackingData.prop(property.jointJsConfig.modelPath, backingData.relation.getProperties().find(relationProperty => relationProperty.getKey === property.providedFeature).value)
                        }
                    }
                    break;
            }
        }
        return newBackingData;
    }

    #createEndpointCell(endpoint: Entities.Endpoint, parent: dia.Element) {
        let newEndpoint = new EndpointElement({
            id: endpoint.getId,
            position: { x: endpoint.getMetaData.position.xCoord, y: endpoint.getMetaData.position.yCoord },
            size: { width: endpoint.getMetaData.size.width, height: endpoint.getMetaData.size.height },
            attrs: {
                root: {
                    title: "cna.qualityModel.Endpoint"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: endpoint.getMetaData.fontSize,
                    textWrap: {
                        text: endpoint.getMetaData.label ? endpoint.getMetaData.label : endpoint.getName
                    }
                }
            }
        });

        parent.embed(newEndpoint);

        for (const property of EntityDetailsConfig.Endpoint.specificProperties) {
            if (property.jointJsConfig.modelPath) {
                if (property.providedFeature === "embedded") {
                    newEndpoint.prop(property.jointJsConfig.modelPath, parent.id.toString());
                } else {
                    newEndpoint.prop(property.jointJsConfig.modelPath, endpoint.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
                }
            }
        }

        if (endpoint.getDataAggregateEntities.length > 0) {
            newEndpoint.prop("entity/relations/uses_data", endpoint.getDataAggregateEntities.map(usedData => {
                return parent.getEmbeddedCells().find(cell => cell.prop("entity/assignedFamily") === usedData.data.getName).id;
            }));
        }

        return newEndpoint;
    }


    #createExternalEndpointCell(externalEndpoint: Entities.ExternalEndpoint, parent: dia.Element) {
        let newExternalEndpoint = new ExternalEndpointElement({
            id: externalEndpoint.getId,
            position: { x: externalEndpoint.getMetaData.position.xCoord, y: externalEndpoint.getMetaData.position.yCoord },
            size: { width: externalEndpoint.getMetaData.size.width, height: externalEndpoint.getMetaData.size.height },
            attrs: {
                root: {
                    title: "cna.qualityModel.ExternalEndpoint"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: externalEndpoint.getMetaData.fontSize,
                    textWrap: {
                        text: externalEndpoint.getMetaData.label ? externalEndpoint.getMetaData.label : externalEndpoint.getName
                    }
                }
            }
        });

        parent.embed(newExternalEndpoint);

        for (const property of EntityDetailsConfig.ExternalEndpoint.specificProperties) {
            if (property.jointJsConfig.modelPath) {
                if (property.providedFeature === "embedded") {
                    newExternalEndpoint.prop(property.jointJsConfig.modelPath, parent.id.toString());
                } else {
                    newExternalEndpoint.prop(property.jointJsConfig.modelPath, externalEndpoint.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
                }
            }
        }

        if (externalEndpoint.getDataAggregateEntities.length > 0) {
            newExternalEndpoint.prop("entity/relations/uses_data", externalEndpoint.getDataAggregateEntities.map(usedData => {
                return parent.getEmbeddedCells().find(cell => cell.prop("entity/assignedFamily") === usedData.data.getName).id;
            }));
        }

        return newExternalEndpoint;
    }

    #createRequestTraceCell(requestTrace: Entities.RequestTrace, elements: dia.Element[], edges: dia.Link[]) {
        let newRequestTrace = new RequestTraceElement({
            position: { x: requestTrace.getMetaData.position.xCoord, y: requestTrace.getMetaData.position.yCoord },
            size: { width: requestTrace.getMetaData.size.width, height: requestTrace.getMetaData.size.height },
            attrs: {
                root: {
                    title: "cna.qualityModel.RequestTrace"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: requestTrace.getMetaData.fontSize,
                    textWrap: {
                        text: requestTrace.getMetaData.label ? requestTrace.getMetaData.label : requestTrace.getName,
                    }
                }
            }
        })

        for (const property of EntityDetailsConfig.RequestTrace.specificProperties) {
            if (property.jointJsConfig.modelPath) {
                newRequestTrace.prop(property.jointJsConfig.modelPath, requestTrace.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
            }
        }

        for (const relation of EntityRelationsConfig.RequestTrace.relations) {
            switch (relation.providedFeature) {
                case "referred_endpoint":
                    if (requestTrace.getExternalEndpoint) {
                        newRequestTrace.prop(relation.jointJsConfig.modelPath, requestTrace.getExternalEndpoint.getId);
                    } else {
                        newRequestTrace.prop(relation.jointJsConfig.modelPath, "");
                    }
                    break;
                case "involved_links":
                    newRequestTrace.prop(relation.jointJsConfig.modelPath, Array.from(requestTrace.getLinks).map(link => link.getId));
                    break;
                default:
                    throw new Error(`unknown relation ${relation.providedFeature} in request trace.`)
            }
        }
        return newRequestTrace;
    }

}

// TODO keep here? --> currently shown every time new problematic connection is added
/*
const InvalidModelItemsDialogConfig = {
    type: "modalDialog",
    header: {
        iconClass: "fa-solid fa-triangle-exclamation",
        type: "error",
        text: "Invalid Model Items",
        closeButton: true
    },
    footer: {
        cancelButtonText: "Ok, understood",
    },
    content: {
        contentType: UIContentType.GROUP_FORMS,
        groups: [
            {
                id: "invalid-model-elements-table",
                contentType: PropertyContentType.TABLE,
                headline: "Identified Error",
                text: `The following table shows all identified errors that prevent a valid TOSCA transformation. 
                Please fix the following error, and then try to restart the transformation process. `,
                tableColumnHeaders: [
                    {
                        text: "Entity Type"
                    },
                    {
                        text: "Error Type"
                    },
                    {
                        text: "Affected Entity"
                    },
                    {
                        text: "Affected Information"
                    },
                    {
                        text: "Message"
                    }
                ],
                tableRows: []
            }
        ]
    }
};
*/

export default SystemEntityManager;