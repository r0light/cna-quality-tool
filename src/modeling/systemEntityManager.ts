import { dia, util } from "jointjs";
import EntityTypes from './config/entityTypes';
import * as Entities from '../core/entities';
import ErrorMessage, { ErrorType } from './errorMessage'
import ToscaConverter from '../core/tosca-adapter/ToscaConverter.js';
import { UIContentType } from './config/toolbarConfiguration';
import UIModalDialog, { DialogSize } from './representations/guiElements.dialog';
import { PropertyContentType } from './config/detailsSidebarConfig';
import { MetaData } from "@/core/common/entityDataTypes";

class SystemEntityManager {

    #currentSystemGraph: dia.Graph;

    #currentSystemEntity: Entities.System;

    #errorMessages = new Map();

    #includedDataAggregateEntities = new Map();

    constructor(currentGraph: dia.Graph) {

        this.#currentSystemGraph = currentGraph;
        this.#currentSystemEntity = new Entities.System("test");

        this.#subscribeToEvents();
    }

    #subscribeToEvents() {

        // TODO adjust to Vue Events

        this.#currentSystemGraph.on("initialSystemName", (event) => {
            this.#currentSystemEntity.setSystemName = event.systemName;
        });

        this.#currentSystemGraph.on("systemNameChanged", (event) => {
            this.#currentSystemEntity.setSystemName = event.editedAppName;
        });

        this.#currentSystemGraph.on("startToscaTransformation", (event) => {
            this.#createYamlDocument();
        });
    }

    #createYamlDocument() {
        this.#errorMessages = new Map();
        this.#includedDataAggregateEntities = new Map();
        this.#currentSystemEntity.resetAllIncludedSystemEntities();

        this.#convertToSystemEntity();

        console.log(this.#currentSystemEntity);

        /* TODO trigger tosca adapter to do the transformation
        if (this.#errorMessages?.size > 0) {
            this.#provideConnectionWarningDialog();
            return;
        }

        const toscaConverter = new ToscaConverter(this.#currentSystemEntity);
        toscaConverter.convert();
        */
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
            this.#addEntity(graphElement);
        }

        // next are Links and Deployment Mappings
        for (const graphLink of this.#currentSystemGraph.getLinks()) {
            this.#addConnectionEntity(graphLink);
        }

        // finally add Request Traces
        let traceEntities = elements.filter((element) => element.prop("entity/type") === EntityTypes.REQUEST_TRACE);
        for (const graphElement of traceEntities) {
            this.#addTrace(graphElement);
        }

        // now, validate the created system
        this.#validateSystemEntity();
        this.#checkValidityOfDataAggregates();
    }

    #addDataEntity(graphElement: dia.Element) {
        let addedEntity: Entities.DataAggregate | Entities.BackingData;
        switch (graphElement.prop("entity/type")) {
            case EntityTypes.DATA_AGGREGATE:
                addedEntity = this.#createDataAggregate(graphElement);
                if ([...(this.#currentSystemEntity.getDataAggregateEntities)].filter(([id, existingDataAggregate]) => existingDataAggregate.getName === addedEntity.getName).length === 0) {
                    // only add data aggregate if a data aggregate with the same name not already exists
                    this.#currentSystemEntity.addEntity(addedEntity);
                }
                break;
            case EntityTypes.BACKING_DATA:
                addedEntity = this.#createBackingData(graphElement);
                if ([...(this.#currentSystemEntity.getBackingDataEntities)].filter(([id, existingBackingData]) => existingBackingData.getName === addedEntity.getName).length === 0) {
                    // only add data aggregate if a data aggregate with the same name not already exists
                    this.#currentSystemEntity.addEntity(addedEntity);
                }
                break;
            default:
                throw new TypeError("Unsuitable Data Element provided! No corresponding Data Entity type is known for: " + JSON.stringify(graphElement));
        }
    }

    #addEntity(graphElement: dia.Element) {
        let addedEntity: Entities.Component | Entities.Infrastructure;
        switch (graphElement.prop("entity/type")) {
            case EntityTypes.COMPONENT:
            case EntityTypes.SERVICE:
            case EntityTypes.BACKING_SERVICE:
            case EntityTypes.STORAGE_BACKING_SERVICE:
                addedEntity = this.#createComponent(graphElement);
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
                addedEntity = this.#createLink(graphLink);
                break;
            case EntityTypes.DEPLOYMENT_MAPPING:
                addedEntity = this.#createDeploymentMapping(graphLink);
                break;
            default:
                throw new TypeError("Unsuitable Link Element provided! No corresponding connection type is known for: " + JSON.stringify(graphLink));
        }

        this.#currentSystemEntity.addEntity(addedEntity);
    }

    #addTrace(requestTrace: dia.Element) {
        let requestTraceEntity: Entities.RequestTrace = this.#createRequestTrace(requestTrace);
        this.#currentSystemEntity.addEntity(requestTraceEntity);
    }

    #createDataAggregate(graphElement, returnDataAggregateAnyway = false) {

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

    #createBackingData(graphElement) {
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

        const includedData = graphElement.prop("entity/properties/includedData");

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

        const backingData = new Entities.BackingData(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement), includedData);

        return backingData;
    }

    #createComponent(graphElement) {

        let componentModelEntity: Entities.Component | Entities.Service | Entities.BackingService | Entities.StorageBackingService;
        switch (graphElement.prop("entity/type")) {
            case EntityTypes.SERVICE:
                componentModelEntity = new Entities.Service(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));
                break;
            case EntityTypes.BACKING_SERVICE:
                componentModelEntity = new Entities.BackingService(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));
                break;
            case EntityTypes.STORAGE_BACKING_SERVICE:
                componentModelEntity = new Entities.StorageBackingService(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));
                break;
            case EntityTypes.COMPONENT:
            default:
                componentModelEntity = new Entities.Component(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement));
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
                        componentModelEntity.addDataEntity(referencedBackingData[0][1]);
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
        let infrastructureEntity = new Entities.Infrastructure(graphElement.id, graphElement.attr("label/textWrap/text"), this.#parseMetaDataFromElement(graphElement), Entities.InfrastructureTypes.COMPUTE); // TODO differentiate infrastructure types?

        const backingDataEntities = graphElement.getEmbeddedCells();

        for (const embeddedBackingData of backingDataEntities) {
            switch (embeddedBackingData.prop("entity/type")) {
                case EntityTypes.BACKING_DATA:
                    let backingDataName: string = embeddedBackingData.attr("label/textWrap/text");
                    let referencedBackingData = [...(this.#currentSystemEntity.getBackingDataEntities)].filter(([id, backingData]) => backingData.getName === backingDataName);
                    if (referencedBackingData.length > 0) {
                        infrastructureEntity.addBackingDataEntity(referencedBackingData[0][1]);
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



    #createLink(graphLink) {
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

        const relationType = graphLink.prop("entity/properties/relationType");
        linkEntity.addRelationType(relationType);

        return linkEntity;

        /* //TODO necessary?
        if (sourceEntity) {
            // add Link Connection to source entity --> needed at least for TOSCA export 
            sourceEntity.addLinkEntity(linkEntity);
        }
        */
    }

    #createDeploymentMapping(graphLink) {
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

        return new Entities.DeploymentMapping(graphLink.id, deployedEntity, underlyingInfrastructure);
    }

    #createRequestTrace(graphElement) {
        const externalEndpointId = graphElement.prop("entity/properties/referredEndpoint");
        if (!externalEndpointId || !(externalEndpointId.trim())) {
            const message = `A Request Trace entity is only valid if it specifies its referred External Endpoint entity. However, for the Request Trace "${graphElement.attr("label/textWrap/text")}" 
            no External Endpoint was selected and it is, therefore, invalid.`;
            const error = new ErrorMessage(EntityTypes.REQUEST_TRACE, ErrorType.INVALID_MODEL_ENTIY, graphElement.attr("label/textWrap/text"), "External Endpoint", message);
            this.#errorMessages.set(graphElement.id, error);
            return null;
        }

        const involvedLinkIds = graphElement.prop("entity/properties/involvedLinks");
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