import { dia, util } from "jointjs";
import * as yaml from 'js-yaml';
import EntityTypes from './config/entityTypes';
import * as Entities from '../core/entities';
import ErrorMessage, { ErrorType } from './errorMessage'
import { UIContentType } from './config/toolbarConfiguration';
import UIModalDialog, { DialogSize } from './representations/guiElements.dialog';
import { EntityDetailsConfig, PropertyContentType, TableDialogPropertyConfig } from './config/detailsSidebarConfig';
import { DataUsageRelation, MetaData } from "@/core/common/entityDataTypes";
import { convertToServiceTemplate, importFromServiceTemplate } from "@/core/tosca-adapter/ToscaAdapter";
import {
    Component as ComponentElement, Service as ServiceElement, BackingService as BackingServiceElement, StorageBackingService as StorageBackingServiceElement,
    Endpoint as EndpointElement, ExternalEndpoint as ExternalEndpointElement, Link as LinkElement,
    Infrastructure as InfrastructureElement, DeploymentMapping as DeploymentMappingElement,
    RequestTrace as RequestTraceElement, DataAggregate as DataAggregateElement, BackingData as BackingDataElement
} from './config/entityShapes'
import { DataAggregate } from "../core/entities";
import { FormContentConfig } from "./config/actionDialogConfig";

class SystemEntityManager {

    #currentSystemGraph: dia.Graph;

    #currentSystemEntity: Entities.System;

    #errorMessages = new Map();

    #includedDataAggregateEntities = new Map();

    constructor(currentGraph: dia.Graph) {

        this.#currentSystemGraph = currentGraph;
        this.#currentSystemEntity = new Entities.System("test");

        // needed because javascript (https://stackoverflow.com/questions/67416881/es6-proxied-class-access-private-property-cannot-read-private-member-hidden-f)
        this.overwriteSystemEntity = this.overwriteSystemEntity.bind(this);
        this.convertToGraph = this.convertToGraph.bind(this);
    }

    getSystemEntity(): Entities.System {
        this.#convertToSystemEntity();
        return this.#currentSystemEntity;
    }

    getGraph(): dia.Graph {
        // call convertToGraph()?;
        return this.#currentSystemGraph;
    }

    convertToCustomTosca(): string {
        this.#errorMessages = new Map();
        this.#includedDataAggregateEntities = new Map();
        this.#currentSystemEntity.resetAllIncludedSystemEntities();

        this.#convertToSystemEntity();


        /* TODO check for errors?
        if (this.#errorMessages?.size > 0) {
            this.#provideConnectionWarningDialog();
            return;
        }
        */

        let serviceTemplate = convertToServiceTemplate(this.#currentSystemEntity);
        try {
            const asYaml = yaml.dump(serviceTemplate, {
                styles: {
                    '!!null': 'empty'
                }
            });
            return asYaml;
        } catch (err) {
            console.error(err);
        }
    }

    loadFromCustomTosca(stringifiedTOSCA: string, fileName: string): dia.Cell[] {
        let system = importFromServiceTemplate(fileName, stringifiedTOSCA);
        this.overwriteSystemEntity(system);
        return this.convertToGraph();
    }

    convertToJson(): string {
        let jsonSerializedGraph = this.#currentSystemGraph.toJSON();
        return jsonSerializedGraph;
    }

    loadFromJson(stringifiedJson: string, fileName: string): dia.Cell[] {
        try {
            let jsonGraph: any = JSON.parse(stringifiedJson);
            this.#currentSystemGraph.clear();
            this.#currentSystemGraph.fromJSON(jsonGraph);
            this.#currentSystemGraph.trigger("reloaded");
        } catch (e) {
            //TODO provide error message to user
            console.log(e)
        }

        // update system entity
        this.#convertToSystemEntity();
        this.#currentSystemEntity.setSystemName = fileName.replace(/\..*$/g, "");

        return this.#currentSystemGraph.getCells();
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

        // continue with entities
        let componentEntities = elements.filter((element) => element.prop("entity/type") === EntityTypes.COMPONENT
            || element.prop("entity/type") === EntityTypes.SERVICE
            || element.prop("entity/type") === EntityTypes.BACKING_SERVICE
            || element.prop("entity/type") === EntityTypes.STORAGE_BACKING_SERVICE
            || element.prop("entity/type") === EntityTypes.INFRASTRUCTURE
        );
        for (const graphElement of componentEntities) {
            this.#addComponentEntity(graphElement);
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

        // now, validate the created system
        this.#validateSystemEntity();
        this.#checkValidityOfDataAggregates();
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

    #addComponentEntity(graphElement: dia.Element) {
        let addedEntity: Entities.Component | Entities.Infrastructure;
        switch (graphElement.prop("entity/type")) {
            case EntityTypes.COMPONENT:
            case EntityTypes.SERVICE:
            case EntityTypes.BACKING_SERVICE:
            case EntityTypes.STORAGE_BACKING_SERVICE:
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

        // TODO allow for now
        /*
        if (!graphElement || !(graphElement.getParentCell())) {
            const message = `A Data Aggregate entity is only valid if it is embedded in one of the component type entities. However, the Data Aggregate "${graphElement.attr("label/textWrap/text")}" has no parent entity 
            and is, therefore, invalid.`;
            const error = new ErrorMessage(EntityTypes.DATA_AGGREGATE, ErrorType.INVALID_MODEL_ENTIY, graphElement.attr("label/textWrap/text"), "Embedded Relation", message);
            this.#errorMessages.set(graphElement.id, error);
            return null;
        }
        */

        const dataAggregate = new Entities.DataAggregate(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));

        return dataAggregate;
    }

    #createBackingDataEntity(graphElement) {
        // TODO allow for now
        /*
        if (!graphElement || !(graphElement.getParentCell())) {
            const message = `A Backing Data entity is only valid if it is embedded in one of the component type or infrastructure entities. However, the Backing Data "${graphElement.attr("label/textWrap/text")}" 
            has no parent entity and is, therefore, invalid.`;
            const error = new ErrorMessage(EntityTypes.BACKING_DATA, ErrorType.INVALID_MODEL_ENTIY, graphElement.attr("label/textWrap/text"), "Embedded Relation", message);
            this.#errorMessages.set(graphElement.id, error);
            return null;
        }
        */

        // TODO allow for now
        /*
        if (includedData.length <= 0) {
            const message = `A Backing Data entity has to include at least one data item. However, the Backing Data "${graphElement.attr("label/textWrap/text")}" 
            has information included and is, therefore, invalid.`;
            const error = new ErrorMessage(EntityTypes.BACKING_DATA, ErrorType.MISSING_INFORMATION, graphElement.attr("label/textWrap/text"), "Included Data", message);
            this.#errorMessages.set(graphElement.id, error);
            return null;
        }
        */

        const backingData = new Entities.BackingData(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));

        // set entity properties
        for (let property of backingData.getProperties()) {
            property.value = graphElement.prop("entity/properties/" + property.getKey)
        }

        return backingData;
    }

    #createComponentEntity(graphElement: dia.Element) {

        let componentModelEntity: Entities.Component | Entities.Service | Entities.BackingService | Entities.StorageBackingService;
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
            case EntityTypes.COMPONENT:
            default:
                componentModelEntity = new Entities.Component(graphElement.id.toString(), graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));
        }
        // set entity properties
        for (let property of componentModelEntity.getProperties()) {
            property.value = graphElement.prop("entity/properties/" + property.getKey)
        }

        let embeddedCells = graphElement.getEmbeddedCells();
        for (const embeddedCell of embeddedCells) {
            switch (embeddedCell.prop("entity/type")) {
                case EntityTypes.ENDPOINT:
                case EntityTypes.EXTERNAL_ENDPOINT:
                    const endpoint = this.#createEndpointEntity(embeddedCell);
                    if (!endpoint) {
                        // ErrorMessages already created while creating entity 
                        break;
                    }
                    componentModelEntity.addEndpoint(endpoint);
                    break;
                case EntityTypes.DATA_AGGREGATE:
                    let dataAggregateName: string = embeddedCell.attr("label/textWrap/text");
                    let referencedDataAggregate = [...(this.#currentSystemEntity.getDataAggregateEntities)].filter(([id, dataAggregate]) => dataAggregate.getName === dataAggregateName);
                    if (referencedDataAggregate.length > 0) {
                        componentModelEntity.addDataEntity(referencedDataAggregate[0][1], embeddedCell.prop("entity/properties/dataAggregate-parentRelation"));
                    } else {
                        throw new Error(`Data Aggregate with name ${dataAggregateName} should be there, but could not be found in ${this.#currentSystemEntity.getDataAggregateEntities}`);
                    }
                    break;
                case EntityTypes.BACKING_DATA:
                    let backingDataName: string = embeddedCell.attr("label/textWrap/text");
                    let referencedBackingData = [...(this.#currentSystemEntity.getBackingDataEntities)].filter(([id, backingData]) => backingData.getName === backingDataName);
                    if (referencedBackingData.length > 0) {
                        componentModelEntity.addDataEntity(referencedBackingData[0][1], embeddedCell.prop("entity/properties/backingData-parentRelation"));
                    } else {
                        throw new Error(`Backing Data with name ${backingDataName} should be there, but could not be found in ${this.#currentSystemEntity.getBackingDataEntities}`);
                    }
                    break;
                default:
                    break;
            }
        }

        return componentModelEntity;
    }

    #createInfrastructureEntity(graphElement) {
        let infrastructureEntity = new Entities.Infrastructure(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));

        const backingDataEntities = graphElement.getEmbeddedCells();

        for (const embeddedBackingData of backingDataEntities) {
            switch (embeddedBackingData.prop("entity/type")) {
                case EntityTypes.BACKING_DATA:
                    let backingDataName: string = embeddedBackingData.attr("label/textWrap/text");
                    let referencedBackingData = [...(this.#currentSystemEntity.getBackingDataEntities)].filter(([id, backingData]) => backingData.getName === backingDataName);
                    if (referencedBackingData.length > 0) {
                        infrastructureEntity.addBackingDataEntity(referencedBackingData[0][1], embeddedBackingData.prop("entity/properties/backingData-parentRelation"));
                    } else {
                        throw new Error(`Backing Data with name ${backingDataName} should be there, but could not be found in ${this.#currentSystemEntity.getBackingDataEntities}`);
                    }
                    break;
                default:
                    break;
            }
        }
        return infrastructureEntity;
    }

    /*
    #checkIfStorageBackingServiceConnected(graphElement) {
        let connectedLinksForCurrentInfrastructure = this.#currentSystemGraph.getConnectedLinks(graphElement);

        if (connectedLinksForCurrentInfrastructure.length <= 1) {
            if (connectedLinksForCurrentInfrastructure[0].getTargetElement()?.prop("entity/type") !== EntityTypes.STORAGE_BACKING_SERVICE || connectedLinksForCurrentInfrastructure[0].getSourceElement()?.prop("entity/type") !== EntityTypes.STORAGE_BACKING_SERVICE) {
                return new Entities.Infrastructure(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement), Entities.InfrastructureTypes.DBMS);
            } else {
                return new Entities.Infrastructure(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement), Entities.InfrastructureTypes.COMPUTE);
            }
        }

        let storageBackingServiceConnected = false;
        let includesComponentTypesInDepoyment = false;
        connectedLinksForCurrentInfrastructure.forEach(connectedLink => {
            if (!(connectedLink.getTargetElement()?.prop("entity/type") === EntityTypes.INFRASTRUCTURE && connectedLink.getSourceElement()?.prop("entity/type") === EntityTypes.INFRASTRUCTURE) &&
                (connectedLink.getTargetElement()?.prop("entity/type") !== EntityTypes.STORAGE_BACKING_SERVICE && connectedLink.getSourceElement()?.prop("entity/type") !== EntityTypes.STORAGE_BACKING_SERVICE)) {
                // check if connected Deployment Mappings includes only Infrastructure and possibly Storage Backing Service entities 
                includesComponentTypesInDepoyment = true;
            }

            if (connectedLink.getTargetElement()?.prop("entity/type") === EntityTypes.STORAGE_BACKING_SERVICE) {
                storageBackingServiceConnected = true;
            } else if (connectedLink.getSourceElement()?.prop("entity/type") === EntityTypes.STORAGE_BACKING_SERVICE) {
                storageBackingServiceConnected = true;
            }
        });

        if (storageBackingServiceConnected && includesComponentTypesInDepoyment) {
            return null;
        } else if (storageBackingServiceConnected && !includesComponentTypesInDepoyment) {
            return new Entities.Infrastructure(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement), Entities.InfrastructureTypes.DBMS);
        }
        return new Entities.Infrastructure(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement), Entities.InfrastructureTypes.COMPUTE);
    }
    */



    #validateSystemEntity() {
        //TODO validate Storage Service specifics 
        /*
        let infrastructureEntity = this.#checkIfStorageBackingServiceConnected(graphElement);
        if (!infrastructureEntity) {
            const message = `A Storage Backing Service entity cannot be deployed with Component, Service or Backing Service entities on the same Infrastructure entity. However, the Infrastructure "${graphElement.attr("label/textWrap/text")}" 
            currently deploys a Storage Backing Service with at least one other entity type and is, therefore, invalid.`;
            const error = new ErrorMessage(EntityTypes.INFRASTRUCTURE, ErrorType.INVALID_MODEL_ENTIY, graphElement.attr("label/textWrap/text"), "Entity Type Deployments", message);
            this.#errorMessages.set(graphElement.id, error);
            return null;
        }
        */


        //TODO validate deployment mappings:
        /*
        let groupedLinks = util.groupBy(this.#currentSystemGraph.getConnectedLinks(graphElement), (element) => {
            return element.prop("entity/type");
        });

        const deploymentMappings = groupedLinks[EntityTypes.DEPLOYMENT_MAPPING];

        if (!deploymentMappings || deploymentMappings.length === 0 || deploymentMappings.length > 1) {
            const type = endpointEntityType === EntityTypes.COMPONENT ? "Component" : (endpointEntityType === EntityTypes.SERVICE ? "Service" : (endpointEntityType === EntityTypes.BACKING_SERVICE ? "Backing Service" : "Storage Backing Service"));
            const message = `The ${type} entity is only valid if it is hosted by exactly one Infrastructure entity. However, the ${type} "${graphElement.attr("label/textWrap/text")}" is hosted by none or several Infrastructure 
            entities and is, therefore, invalid.`;
            const error = new ErrorMessage(endpointEntityType ?? EntityTypes.COMPONENT, ErrorType.INVALID_MODEL_ENTIY, graphElement.attr("label/textWrap/text"), "Hosting Relation", message);
            this.#errorMessages.set(graphElement.id, error);
            return null;
        }

        const infrastructureModelEntity = deploymentMappings[0].getSourceElement().prop("entity/type") === EntityTypes.INFRASTRUCTURE ? deploymentMappings[0].getSourceElement() : deploymentMappings[0].getTargetElement();
        const infrastructure = this.#currentSystemEntity.getInfrastructureEntities.get(infrastructureModelEntity.getModelId) ?? this.#createInfrastructureEntity(infrastructureModelEntity);

        if (!infrastructure) {
            // ErrorMessages already created while creating entity
            return null;
        }
        */

        //TODO validate endpoints
        /*
        const endpointType = graphElement.prop("entity/properties/endpointType");
        const endpointPath = graphElement.prop("entity/properties/endpointPath");
        const port = graphElement.prop("entity/properties/port");

        if (!endpointType || typeof endpointType !== "string") {
            const message = `An ${type} entity is only valid if it defines its type, e.g. POST or subscribes-to. However, the ${type} "${graphElement.attr("label/textWrap/text")}" does not provide this information 
            and is, therefore, invalid.`;
            const error = new ErrorMessage(endpointEntityType === EntityTypes.ENDPOINT ? EntityTypes.ENDPOINT : EntityTypes.EXTERNAL_ENDPOINT, ErrorType.MISSING_INFORMATION, graphElement.attr("label/textWrap/text"), "Endpoint Type", message);
            this.#errorMessages.set(graphElement.id, error);
            return null;
        }

        if (!endpointPath || typeof endpointPath !== "string") {
            const message = `An ${type} entity is only valid if it specifies its URL path, e.g. /customers/{customerId}. However, the ${type} "${graphElement.attr("label/textWrap/text")}" does not provide this information 
            and is, therefore, invalid.`;
            const error = new ErrorMessage(endpointEntityType === EntityTypes.ENDPOINT ? EntityTypes.ENDPOINT : EntityTypes.EXTERNAL_ENDPOINT, ErrorType.MISSING_INFORMATION, graphElement.attr("label/textWrap/text"), "Endpoint Path", message);
            this.#errorMessages.set(graphElement.id, error);
            return null;
        }

        if (!port || isNaN(port)) {
            const message = `An ${type} entity is only valid if it provides the port at which it is available, e.g. 8001. However, the ${type} "${graphElement.attr("label/textWrap/text")}" does not provide this information 
            and is, therefore, invalid.`;
            const error = new ErrorMessage(endpointEntityType === EntityTypes.ENDPOINT ? EntityTypes.ENDPOINT : EntityTypes.EXTERNAL_ENDPOINT, ErrorType.MISSING_INFORMATION, graphElement.attr("label/textWrap/text"), "Port", message);
            this.#errorMessages.set(graphElement.id, error);
            return null;
        }
        */
    }

    // ensure that Data Aggregate is persisted at least once by another entity
    #checkValidityOfDataAggregates() {

        /*
        let addedEntity = null;
        if ("persisted".localeCompare(dataAggregateEmbeddedProperties.parentRelation) === 0) {
            if (this.#currentSystemEntity.getDataAggregateEntities.has(dataAggregate.name)) {
                this.#currentSystemEntity.getDataAggregateEntities.get(dataAggregate.name).addPersistedByEntity(graphElement.getParentCell().attr("label/textWrap/text"));
            } else {
                dataAggregate.addPersistedByEntity(graphElement.getParentCell().attr("label/textWrap/text"));
                addedEntity = dataAggregate;
            }
        } else if (returnDataAggregateAnyway) {
            // Component entities want persisted and used Data Aggregates whereas the System should only store each Data Aggregate once therefore otherwise focus on persisted ones
            addedEntity = dataAggregate;
        }
        */

        for (const dataAggregate of this.#includedDataAggregateEntities.values()) {
            if (!(this.#currentSystemEntity.getDataAggregateEntities.has(dataAggregate.getName))) {
                const message = `A Data Aggregate entity has to be persisted by at least one component type entity, preferably a Storage Backing Service. However, the Data Aggreagte 
                "${dataAggregate.getName}" is currently not persisted by any other entity and is, therefore, invalid.`;
                const error = new ErrorMessage(EntityTypes.DATA_AGGREGATE, ErrorType.INVALID_MODEL_ENTIY, dataAggregate.getName, "Parent Relation", message);
                this.#errorMessages.set(dataAggregate.getModelId, error);
            }
        }
    }

    #createEndpointEntity(graphElement) {
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
        const targetEndpoint = this.#currentSystemEntity.getComponentEntities.get(targetElement.getParentCell().id).getEndpointEntities.filter(endpoint => endpoint.getId === targetElement.id);

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

        let underlyingInfrastructure;
        let deployedEntity;
        if (sourceElement.prop("entity/type") === EntityTypes.INFRASTRUCTURE) {
            underlyingInfrastructure = this.#currentSystemEntity.getInfrastructureEntities.get(sourceElement.id);

            if (targetElement.prop("entity/type") === EntityTypes.INFRASTRUCTURE) {
                deployedEntity = this.#currentSystemEntity.getInfrastructureEntities.get(targetElement.id);
            } else {
                deployedEntity = this.#currentSystemEntity.getComponentEntities.get(targetElement.id);
            }
        } else {
            underlyingInfrastructure = this.#currentSystemEntity.getInfrastructureEntities.get(targetElement.id);
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

        const externalEndpoint = [...(this.#currentSystemEntity.getComponentEntities)].map(([id, component]) => component).flatMap(component => component.getExternalEndpointEntities).find(endpoint => endpoint.getId === externalEndpointId);
        if (!externalEndpoint) {
            // ErrorMessages already created while creating entity
            throw new Error(`External Endpoint ${externalEndpointId} not found in any component`)
        }

        const involvedLinks = involvedLinkIds.map(linkId => this.#currentSystemEntity.getLinkEntities.get(linkId));

        const requestTrace = new Entities.RequestTrace(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement), externalEndpoint, involvedLinks);

        // set entity properties
        for (let property of requestTrace.getProperties()) {
            property.value = graphElement.prop("entity/properties/" + property.getKey)
        }

        return requestTrace;
    }



    #provideConnectionWarningDialog() {
        let modalDialog = new UIModalDialog("invalidToscaModelItems-error", "invalidToscaModelItems");
        const tableRows = this.#createErrorTableRows();
        InvalidModelItemsDialogConfig.content.groups.forEach((groupElement) => {
            if (String("invalid-model-elements-table").localeCompare(groupElement.id) === 0) {
                groupElement.tableRows = tableRows;
            }
        });
        modalDialog.create(InvalidModelItemsDialogConfig);
        modalDialog.render("modals", true, DialogSize.EXTRA_LARGE);
        modalDialog.show();
    }

    #createErrorTableRows() {
        let tableRows = new Array();
        for (const errorMessage of this.#errorMessages.values()) {
            tableRows.push({
                entityType: errorMessage.getAffectedEntityType,
                errorType: errorMessage.getErrorType,
                entity: errorMessage.getEntityName,
                affectedInformation: errorMessage.getAffectedInformation,
                message: errorMessage.getMessage
            });
        }
        return tableRows;
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

        for (const [id, infrastructure] of this.#currentSystemEntity.getInfrastructureEntities) {
            let newInfrastructure = this.#createInfrastructureCell(infrastructure);
            this.#currentSystemGraph.addCell(newInfrastructure);
            createdCells.push(newInfrastructure);

            let index = 0;
            for (const usedBackingData of infrastructure.getBackingDataEntities) {
                let newBackingData = this.#createBackingDataCell(usedBackingData, newInfrastructure, index);
                index++;
                this.#currentSystemGraph.addCell(newBackingData);
                createdCells.push(newBackingData);
            }
        }

        for (const [id, component] of this.#currentSystemEntity.getComponentEntities) {

            let newComponent: dia.Element;
            if (component.constructor.name === "Service") {
                newComponent = this.#createServiceCell(component);
                this.#currentSystemGraph.addCell(newComponent);
                createdCells.push(newComponent);
            } else if (component.constructor.name === "BackingService") {
                newComponent = this.#createBackingServiceCell(component);
                this.#currentSystemGraph.addCell(newComponent);
                createdCells.push(newComponent);
            } else if (component.constructor.name === "StorageBackingService") {
                newComponent = this.#createStorageBackingServiceCell(component);
                this.#currentSystemGraph.addCell(newComponent);
                createdCells.push(newComponent);
            } else if (component.constructor.name === "Component") {
                newComponent = this.#createComponentCell(component);
                this.#currentSystemGraph.addCell(newComponent);
                createdCells.push(newComponent);
            }

            let index = 0;
            for (const usedDataAggregate of component.getDataAggregateEntities) {
                let newDataAggregate = this.#createDataAggregateCell(usedDataAggregate, newComponent, index);
                index++;
                this.#currentSystemGraph.addCell(newDataAggregate);
                createdCells.push(newDataAggregate);
            }

            index = 0;
            for (const usedBackingData of component.getBackingDataEntities) {
                let newBackingData = this.#createBackingDataCell(usedBackingData, newComponent, index);
                index++;
                this.#currentSystemGraph.addCell(newBackingData);
                createdCells.push(newBackingData);
            }

            for (const providedEndpoint of component.getEndpointEntities) {
                let newEndpoint = this.#createEndpointCell(providedEndpoint, newComponent);
                this.#currentSystemGraph.addCell(newEndpoint);
                createdCells.push(newEndpoint);
            }

            for (const providedExternalEndpoint of component.getExternalEndpointEntities) {
                let newExternalEndpoint = this.#createExternalEndpointCell(providedExternalEndpoint, newComponent);
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
                        text: infrastructure.getName
                    }
                }
            }
        });
        for (const property of EntityDetailsConfig.Infrastructure.specificProperties) {
            if (property.jointJsConfig.modelPath) {
                newInfrastructure.prop(property.jointJsConfig.modelPath, infrastructure.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
            }
        }
        return newInfrastructure;
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
                        text: service.getName
                    }
                }
            }
        })
        for (const property of EntityDetailsConfig.Service.specificProperties) {
            if (property.jointJsConfig.modelPath) {
                newService.prop(property.jointJsConfig.modelPath, service.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
            }
        }
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
                        text: backingService.getName
                    }
                }
            }
        })
        for (const property of EntityDetailsConfig.BackingService.specificProperties) {
            if (property.jointJsConfig.modelPath) {
                newBackingService.prop(property.jointJsConfig.modelPath, backingService.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
            }
        }
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
                        text: storageBackingService.getName
                    }
                }
            }
        })
        for (const property of EntityDetailsConfig.StorageBackingService.specificProperties) {
            if (property.jointJsConfig.modelPath) {
                newStorageBackingService.prop(property.jointJsConfig.modelPath, storageBackingService.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
            }
        }
        return newStorageBackingService;
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
                        text: component.getName
                    }
                }
            }
        })
        for (const property of EntityDetailsConfig.Component.specificProperties) {
            if (property.jointJsConfig.modelPath) {
                newComponent.prop(property.jointJsConfig.modelPath, component.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
            }
        }
        return newComponent;
    }


    #createDataAggregateCell(dataAggregate: { data: DataAggregate, relation: DataUsageRelation }, parent: dia.Element, index: number) {
        let xPosition = parent.position().x + Math.floor(parent.size().width / 3) + dataAggregate.data.getMetaData.size.width * index;
        let yPosition = parent.position().y + Math.floor(parent.size().height / 3) + dataAggregate.data.getMetaData.size.height * index;

        let newDataAggregate = new DataAggregateElement({
            position: { x: xPosition, y: yPosition }, // TODO good approach for positioning?
            size: { width: dataAggregate.data.getMetaData.size.width, height: dataAggregate.data.getMetaData.size.height },
            attrs: {
                root: {
                    title: "cna.qualityModel.DataAggregate"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: dataAggregate.data.getMetaData.fontSize,
                    textWrap: {
                        text: dataAggregate.data.getName,
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
                case "dataAggregate-parentRelation":
                    newDataAggregate.prop(property.jointJsConfig.modelPath, dataAggregate.relation);
                    break;
                case "dataAggregate-assignedFamily":
                    newDataAggregate.prop(property.jointJsConfig.modelPath, dataAggregate.data.getName);
                    break;
                default:
                // TODO handle additional attributes?    
                /*
                  if (property.jointJsConfig.modelPath) {
                    newDataAggregate.prop(property.jointJsConfig.modelPath, dataAggregate.data.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
                  }
                  break;
                */
            }
        }
        return newDataAggregate;
    }


    #createBackingDataCell(backingData: { backingData: Entities.BackingData, relation: DataUsageRelation }, parent: dia.Element, index: number) {

        console.log(backingData)

        let xPosition = parent.position().x + Math.floor(parent.size().width / 3) + backingData.backingData.getMetaData.size.width * index;
        let yPosition = parent.position().y + Math.floor(parent.size().height / 3) + backingData.backingData.getMetaData.size.height * index;

        let newBackingData = new BackingDataElement({
            position: { x: xPosition, y: yPosition }, // TODO good approach for positioning?
            size: { width: backingData.backingData.getMetaData.size.width, height: backingData.backingData.getMetaData.size.height },
            attrs: {
                root: {
                    title: "cna.qualityModel.BackingData"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: backingData.backingData.getMetaData.fontSize,
                    textWrap: {
                        text: backingData.backingData.getName,
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
                case "backingData-parentRelation":
                    newBackingData.prop(property.jointJsConfig.modelPath, backingData.relation);
                    break;
                case "backingData-assignedFamily":
                    newBackingData.prop(property.jointJsConfig.modelPath, backingData.backingData.getName);
                    break;
                case "backingData-includedData-wrapper":
                    let tmp = (property as TableDialogPropertyConfig).buttonActionContent.dialogContent as FormContentConfig;
                    let actualProperty = tmp.groups[0].contentItems[0];
                    newBackingData.prop(actualProperty.jointJsConfig.modelPath, backingData.backingData.getProperties().find(entityProperty => entityProperty.getKey === "included_data").value);
                    break;
                case "backingData-chooseEditMode":
                case "backingData-familyConfig-wrapper":
                    // ignore
                    break;
                default:
                    newBackingData.prop(property.jointJsConfig.modelPath, backingData.backingData.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
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
                        text: endpoint.getName
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
                        text: externalEndpoint.getName
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
                        text: requestTrace.getName,
                    }
                }
            }
        })

        for (const property of EntityDetailsConfig.RequestTrace.specificProperties) {
            switch (property.providedFeature) {
                case "referred_endpoint":
                    newRequestTrace.prop(property.jointJsConfig.modelPath, requestTrace.getExternalEndpoint.getId);
                    break;
                case "involvedLinks-wrapper":
                    let tmp = (property as TableDialogPropertyConfig).buttonActionContent.dialogContent as FormContentConfig;
                    let actualProperty = tmp.groups[0].contentItems[0];
                    newRequestTrace.prop(actualProperty.jointJsConfig.modelPath, Array.from(requestTrace.getLinks).map(link => link.getId));
                    break;
                default:
                    if (property.jointJsConfig.modelPath) {
                        newRequestTrace.prop(property.jointJsConfig.modelPath, requestTrace.getProperties().find(entityProperty => entityProperty.getKey === property.providedFeature).value)
                    }
                    break;
            }
        }
        return newRequestTrace;
    }

}

// TODO keep here? --> currently shown every time new problematic connection is added
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

export default SystemEntityManager;