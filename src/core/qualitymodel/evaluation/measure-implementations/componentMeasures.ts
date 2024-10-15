
import { Component, Endpoint, Service, StorageBackingService, System } from "../../../entities.js";
import { Calculation, CalculationParameters } from "../../quamoco/Measure.js";
import { ASYNCHRONOUS_ENDPOINT_KIND, BACKING_DATA_LOGS_KIND, BACKING_DATA_METRICS_KIND, PROTOCOLS_SUPPORTING_TLS, SERVICE_MESH_KIND, SYNCHRONOUS_ENDPOINT_KIND } from "../../specifications/featureModel.js";
import { average } from "./general-functions.js";


export const supportsMonitoring: (component: Component) => boolean = (component) => {

    let supportsMetrics = false;
    let supportsLogging = false;

    for (const backingData of component.getBackingDataEntities) {
        if (backingData.backingData.getProperty("kind").value === BACKING_DATA_METRICS_KIND) {
            supportsMetrics = true;
            continue;
        }
        if (backingData.backingData.getProperty("kind").value === BACKING_DATA_LOGS_KIND) {
            supportsLogging = true;
        }
    }

    return supportsMetrics && supportsLogging;
}

export const providesHealthAndReadinessEndpoints: (component: Component) => boolean = (component) => {
    let hasHealthEndpoint = [...component.getEndpointEntities.entries()].filter(endpoint => endpoint[1].getProperty("health_check").value).length > 0;
    let hasReadinessEndpoint = [...component.getEndpointEntities.entries()].filter(endpoint => endpoint[1].getProperty("readiness_check").value).length > 0;

    return hasHealthEndpoint && hasReadinessEndpoint;

}

export const calculateRatioOfEndpointsSupportingSsl: (endpoints: Endpoint[]) => number = (allEndpoints) => {
    let numberOfEndpointsSupportingSsl = allEndpoints.map(endpoint => endpoint.getProperties().find(property => property.getKey === "protocol").value)
        .filter(protocol => PROTOCOLS_SUPPORTING_TLS.includes(protocol))
        .length;

    if ((allEndpoints.length - numberOfEndpointsSupportingSsl) === 0) {
        return 0;
    }

    return numberOfEndpointsSupportingSsl / (allEndpoints.length - numberOfEndpointsSupportingSsl);
}


export const ratioOfEndpointsSupportingSsl: Calculation = (parameters: CalculationParameters<Component>) => {

    let allEndpoints = parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities);
    return calculateRatioOfEndpointsSupportingSsl(allEndpoints);
}

export const calculateRatioOfExternalEndpointsSupportingTls: (endpoints: Endpoint[]) => number = (allExternalEndpoints) => {
    let numberOfExternalEndpointsSupportingTLS = allExternalEndpoints.map(endpoint => endpoint.getProperties().find(property => property.getKey === "protocol").value)
        .filter(protocol => PROTOCOLS_SUPPORTING_TLS.includes(protocol))
        .length;
    if (allExternalEndpoints.length === 0) {
        return 0;
    }

    return numberOfExternalEndpointsSupportingTLS / allExternalEndpoints.length;
}

export const ratioOfExternalEndpointsSupportingTls: Calculation = (parameters: CalculationParameters<Component>) => {
    let allExternalEndpoints = parameters.entity.getExternalEndpointEntities;
    return calculateRatioOfExternalEndpointsSupportingTls(allExternalEndpoints);

}


export const serviceInterfaceDataCohesion: Calculation = (parameters: CalculationParameters<Component>) => {
    let dataAggregateUsage = new Map<string, string[]>();
    parameters.entity.getDataAggregateEntities.forEach(dataAggregate => {
        dataAggregateUsage.set(dataAggregate.data.getId, []);
    })

    parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities).forEach(endpoint => {
        for (const relatedDataAggregate of endpoint.getDataAggregateEntities) {
            if (dataAggregateUsage.has(relatedDataAggregate.data.getId)) {
                dataAggregateUsage.set(relatedDataAggregate.data.getId, dataAggregateUsage.get(relatedDataAggregate.data.getId).concat(endpoint.getId));
            }
        }
    });

    let endpointsHavingADataAggregateInCommon = new Set<string>();
    for (const [dataAggregate, endpoints] of dataAggregateUsage.entries()) {
        if (endpoints.length > 1) {
            endpoints.forEach(endpointsHavingADataAggregateInCommon.add, endpointsHavingADataAggregateInCommon);
        }
    }

    if (dataAggregateUsage.size > 0) {
        return endpointsHavingADataAggregateInCommon.size / dataAggregateUsage.size;
    }
    return 0;
}


export const serviceInterfaceUsageCohesion: Calculation = (parameters: CalculationParameters<Component>) => {
    let totalSumOfEndpointUsage = 0;

    let allEndpointsOfThisComponent = parameters.entity.getEndpointEntities;
    let endpointIds = allEndpointsOfThisComponent.map(endpoint => endpoint.getId);
    let clientsOfThisService = new Set<string>();

    for (const [linkId, link] of parameters.system.getLinkEntities) {
        if (endpointIds.includes(link.getTargetEndpoint.getId)) {
            clientsOfThisService.add(link.getSourceEntity.getId);
            totalSumOfEndpointUsage++;
        }
    }

    if (allEndpointsOfThisComponent.length === 0 || clientsOfThisService.size === 0) {
        return 0;
    }
    return totalSumOfEndpointUsage / (allEndpointsOfThisComponent.length * clientsOfThisService.size);
}

export const totalServiceInterfaceCohesion: Calculation = (parameters: CalculationParameters<Component>) => {
    let serviceInterfaceDataCohesionValue = serviceInterfaceDataCohesion(parameters);
    let serviceInterfaceUsageCohesionValue = serviceInterfaceUsageCohesion(parameters);

    return ((serviceInterfaceDataCohesionValue as number) + (serviceInterfaceUsageCohesionValue as number)) / 2;

}

export const cohesionBetweenEndpointsBasedOnDataAggregateUsage: Calculation = (parameters: CalculationParameters<Component>) => {
    let allEndpoints = parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities);

    let dataAggregateUsage = new Map<string, Set<string>>();
    let sharedUsages: number[] = [];

    for (const [index, endpoint] of allEndpoints.entries()) {
        if (!dataAggregateUsage.has(endpoint.getId)) {
            dataAggregateUsage.set(endpoint.getId, new Set([...endpoint.getDataAggregateEntities.entries()].map(entry => entry[1].data.getId)));
        }
        for (const otherEndpoint of allEndpoints.slice(index + 1)) {
            if (!dataAggregateUsage.has(otherEndpoint.getId)) {
                dataAggregateUsage.set(otherEndpoint.getId, new Set([...otherEndpoint.getDataAggregateEntities.entries()].map(entry => entry[1].data.getId)));
            }
            let union = dataAggregateUsage.get(endpoint.getId).union(dataAggregateUsage.get(otherEndpoint.getId));
            if (union.size === 0) {
                sharedUsages.push(0)
            } else {
                sharedUsages.push(dataAggregateUsage.get(endpoint.getId).intersection(dataAggregateUsage.get(otherEndpoint.getId)).size / union.size);
            }
        }
    }
    return average(sharedUsages);
}

export const numberOfProvidedSynchronousAndAsynchronousEndpoints: Calculation = (parameters: CalculationParameters<Component>) => {
    return parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities).length;
}

export const numberOfSynchronousEndpointsOfferedByAService: Calculation = (parameters: CalculationParameters<Component>) => {
    return parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities)
        .filter(endpoint => SYNCHRONOUS_ENDPOINT_KIND.includes(endpoint.getProperty("kind").value)).length;
}

export const ratioOfStateDependencyOfEndpoints: Calculation = (parameters: CalculationParameters<Component>) => {
    let allEndpoints = parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities);

    if (allEndpoints.length === 0) {
        return 0;
    }

    let numberOfDependingEndpoints = allEndpoints.filter(endpoint => endpoint.getDataAggregateEntities.length > 0).length;

    return numberOfDependingEndpoints / allEndpoints.length;
}

export const numberOfAsynchronousEndpointsOfferedByAService: Calculation = (parameters: CalculationParameters<Component>) => {
    return parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities)
        .filter(endpoint => ASYNCHRONOUS_ENDPOINT_KIND.includes(endpoint.getProperty("kind").value)).length;
}

export const numberOfSynchronousOutgoingLinks: Calculation = (parameters: CalculationParameters<Component>) => {
    let outgoingLinks = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId);
    return outgoingLinks.filter(link => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value)).length;
}

export const numberOfAsynchronousOutgoingLinks: Calculation = (parameters: CalculationParameters<Component>) => {
    let outgoingLinks = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId);
    return outgoingLinks.filter(link => ASYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value)).length;
}

export const ratioOfAsynchronousOutgoingLinks: Calculation = (parameters: CalculationParameters<Component>) => {
    let outgoingLinks = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId);
    let asynchronousOutgoingLinks = outgoingLinks.filter(link => ASYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value));

    if (outgoingLinks.length === 0) {
        return 0;
    }

    return asynchronousOutgoingLinks.length / outgoingLinks.length;
}

export const numberOfLinksPerComponent: Calculation = (parameters: CalculationParameters<Component>) => {
    let numberOfOutgoingLinks: number = numberOfConsumedEndpoints(parameters) as number;
    let incomingLinks = parameters.system.getIncomingLinksOfComponent(parameters.entity.getId);
    return numberOfOutgoingLinks + incomingLinks.length;
}

export const numberOfConsumedEndpoints: Calculation = (parameters: CalculationParameters<Component>) => {
    let outgoingLinks = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId);
    return outgoingLinks.length;
}

export const incomingOutgoingRatioOfAComponent: Calculation = (parameters: CalculationParameters<Component>) => {
    1
    let numberOfOutgoingLinks: number = numberOfConsumedEndpoints(parameters) as number;
    let incomingLinks = parameters.system.getIncomingLinksOfComponent(parameters.entity.getId);
    if (incomingLinks.length === 0) {
        return 0;
    }
    return numberOfOutgoingLinks / incomingLinks.length;
}

export const ratioOfOutgoingLinksOfAService: Calculation = (parameters: CalculationParameters<Component>) => {
    1
    let numberOfOutgoingLinks: number = numberOfConsumedEndpoints(parameters) as number;
    let incomingLinks = parameters.system.getIncomingLinksOfComponent(parameters.entity.getId);
    if (incomingLinks.length + numberOfOutgoingLinks === 0) {
        return 0;
    }

    return (numberOfOutgoingLinks / (incomingLinks.length + numberOfOutgoingLinks)) * 100
}

export const indirectInteractionDensity: Calculation = (parameters: CalculationParameters<Component>) => {
    let allComponents = parameters.system.getComponentEntities;

    if (allComponents.size < 3) {
        return 0;
    }

    let directDependencies = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId).map(link => parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId));
    let directDependenciesIds = directDependencies.map(component => component.getId);

    // initialize potentialIndirectDependencies with all values to 0 assuming there are no indirect dependencies
    let potentialIndirectDependencies = new Map<string, number>();
    [...parameters.system.getComponentEntities.entries()]
        .map(component => component[0])
        .filter(componentId => componentId !== parameters.entity.getId && !directDependenciesIds.includes(componentId))
        .forEach(componentId => {
            potentialIndirectDependencies.set(componentId, 0);
        })

    let alreadyVisited: string[] = directDependenciesIds.concat([parameters.entity.getId]); // track visited nodes to handle potential circular paths
    let nextNodeIds: string[] = directDependenciesIds
        .flatMap(componentId => {
            return parameters.system.getOutgoingLinksOfComponent(componentId).map(link => parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId)
        })
        .filter(nextId => !alreadyVisited.includes(nextId));
    while (nextNodeIds.length > 0) {
        let nextNodeId = nextNodeIds[0];
        // set visited node as indirect dependency
        potentialIndirectDependencies.set(nextNodeId, 1);

        // continue search
        let nextNextNodeIds: string[] = parameters.system.getOutgoingLinksOfComponent(nextNodeId)
            .map(link => parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId)
            .filter(nextId => !alreadyVisited.includes(nextId));
        nextNodeIds.push(...nextNextNodeIds);
        alreadyVisited.push(nextNodeId);
        nextNodeIds.splice(0, 1);

    }

    return average([...potentialIndirectDependencies.values()]);
}


export const serviceCouplingBasedOnEndpointEntropy: Calculation = (parameters: CalculationParameters<Component>) => {
    let endpointIds = parameters.entity.getEndpointEntities.map(endpoint => endpoint.getId);

    if (endpointIds.length === 0) {
        return 0;
    }

    let incomingLinks = new Map<string, string[]>();
    endpointIds.forEach(endpointId => incomingLinks.set(endpointId, []));
    for (const [linkId, link] of parameters.system.getLinkEntities) {
        let targetEndpointId = link.getTargetEndpoint.getId;
        if (endpointIds.includes(targetEndpointId)) {
            incomingLinks.get(targetEndpointId).push(linkId);
        }
    }

    let sum = 0;

    for (const endpointId of endpointIds) {
        let val = Math.log10(1 / (incomingLinks.get(endpointId).length + 1));
        sum -= val
    }

    return sum / endpointIds.length;
}

export const ratioOfStorageBackendSharing: Calculation = (parameters: CalculationParameters<Component>) => {
    let storageServicesUsedByThisComponent = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId)
        .map(link => parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId))
        .filter(component => component.constructor.name === StorageBackingService.name);

    if (storageServicesUsedByThisComponent.length === 0) {
        return 0;
    }

    let otherServicesUsingStorageServices = new Map<string, Set<string>>();
    storageServicesUsedByThisComponent.forEach(storageService => {
        otherServicesUsingStorageServices.set(storageService.getId, new Set<string>());
    })

    for (const [linkId, link] of parameters.system.getLinkEntities) {
        if (link.getSourceEntity.getId === parameters.entity.getId) {
            continue;
        }

        let targetComponentId = parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId;
        if (otherServicesUsingStorageServices.has(targetComponentId)) {
            otherServicesUsingStorageServices.get(targetComponentId).add(link.getSourceEntity.getId);
        }

    }

    let sum = 0;
    for (const [storageId, storageService] of otherServicesUsingStorageServices.entries()) {
        sum += otherServicesUsingStorageServices.get(storageId).size;
    }

    return sum / (([...parameters.system.getComponentEntities.entries()]).filter(component => component[1].constructor.name === Service.name).length * ([...parameters.system.getComponentEntities.entries()]).filter(component => component[1].constructor.name === StorageBackingService.name).length)

}

export const combinedMetricForIndirectDependency: Calculation = (parameters: CalculationParameters<Component>) => {

    let indirectInteractionDensityValue = indirectInteractionDensity({ entity: parameters.entity, system: parameters.system });

    let ratioOfStorageBackendSharingValue = ratioOfStorageBackendSharing({ entity: parameters.entity, system: parameters.system });

    return ((indirectInteractionDensityValue as number) + (ratioOfStorageBackendSharingValue as number)) / 2;
}

export const numberOfComponentsThatAreLinkedToAComponent: Calculation = (parameters: CalculationParameters<Component>) => {

    let allLinks = parameters.system.getLinkEntities;
    let consumers = new Set<string>();

    for (const [linkId, link] of allLinks) {
        if (parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId === parameters.entity.getId) {
            let consumer = link.getSourceEntity.getId;
            consumers.add(consumer);
        }
    }
    return consumers.size;
}

export const numberOfComponentsAComponentIsLinkedTo: Calculation = (parameters: CalculationParameters<Component>) => {
    let linksWithThisComponentAsSource = [...parameters.system.getLinkEntities.entries()].filter(link => link[1].getSourceEntity.getId === parameters.entity.getId);
    let linkedToServices = new Set<string>();

    linksWithThisComponentAsSource.forEach(link => {
        linkedToServices.add(parameters.system.searchComponentOfEndpoint(link[1].getTargetEndpoint.getId).getId);
    })

    return linkedToServices.size;
}

export const averageNumberOfDirectlyConnectedServices: Calculation = (parameters: CalculationParameters<Component>) => {
    let numberOfComponentsAComponentIsLinkedToValue = numberOfComponentsAComponentIsLinkedTo(parameters);

    let numberOfComponentsThatAreLinkedToAComponentValue = numberOfComponentsThatAreLinkedToAComponent(parameters);

    return ((numberOfComponentsAComponentIsLinkedToValue as number) + (numberOfComponentsThatAreLinkedToAComponentValue as number)) / parameters.system.getComponentEntities.size;
}

export const numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents: Calculation = (parameters) => {

    if (parameters.system.getComponentEntities.size === 0) {
        return 0;
    }

    let numberOfComponentsAComponentIsLinkedToValue = numberOfComponentsAComponentIsLinkedTo(parameters);

    return (numberOfComponentsAComponentIsLinkedToValue as number) / parameters.system.getComponentEntities.size;

}

/* returns 1 if component is part of a communication cycle, and 0 if not */
export const cyclicCommunication: Calculation = (parameters: CalculationParameters<Component>) => {
    let linksToSearch = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId);
    let linksVisited: string[] = [];
    let cycleFound: number = 0;

    while (linksToSearch.length > 0) {
        let link = linksToSearch[0];
        if (linksVisited.includes(link.getId)) {
            linksToSearch.splice(0, 1);
            continue;
        }

        let targetComponentId = parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId;
        if (targetComponentId === parameters.entity.getId) {
            cycleFound = 1;
            break;
        }
        linksToSearch.push(...parameters.system.getOutgoingLinksOfComponent(targetComponentId));
        linksToSearch.splice(0, 1);
    }

    return cycleFound;
}

export const relativeImportanceOfTheService: Calculation = (parameters: CalculationParameters<Component>) => {
    let consumers = new Set<string>(parameters.system.getIncomingLinksOfComponent(parameters.entity.getId).map(link => link.getSourceEntity.getId));

    return consumers.size / parameters.system.getComponentEntities.size;
}

export const serviceCriticality: Calculation = (parameters: CalculationParameters<Component>) => {
    return numberOfComponentsThatAreLinkedToAComponent(parameters) as number * (numberOfComponentsAComponentIsLinkedTo(parameters) as number);
}

export const degreeOfStorageBackendSharing: Calculation = (parameters: CalculationParameters<Component>) => {
    if (parameters.entity.constructor.name === StorageBackingService.name) {
        return numberOfComponentsThatAreLinkedToAComponent(parameters);
    } else {
        // TODO how to react here? throw an error?
        return 0;
    }
}

export const resourceCount: Calculation = (parameters: CalculationParameters<Component>) => {
    return parameters.entity.getDataAggregateEntities.length;

}

export const serviceSize: Calculation = (parameters: CalculationParameters<Component>) => {
    return resourceCount(parameters) as number + (numberOfComponentsThatAreLinkedToAComponent(parameters) as number);
}

export const unusedEndpointCount: Calculation = (parameters: CalculationParameters<Component>) => {

    let endpointUsage: Map<string, string[]> = new Map();

    parameters.entity.getEndpointEntities.forEach(endpoint => {
        endpointUsage.set(endpoint.getId, []);
    })

    for (const [linkId, link] of parameters.system.getLinkEntities.entries()) {
        if (endpointUsage.has(link.getTargetEndpoint.getId)) {
            endpointUsage.get(link.getTargetEndpoint.getId).push(linkId);
        }
    }

    return [...endpointUsage.entries()].filter(([endpointId, usage]) => usage.length === 0).length;
}

export const numberOfReadEndpointsProvidedByAService: Calculation = (parameters: CalculationParameters<Component>) => {

    return parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities).filter(endpoint => {
        return endpoint.getProperty("kind").value === "query";
    }).length;
}

export const numberOfWriteEndpointsProvidedByAService: Calculation = (parameters: CalculationParameters<Component>) => {

    return parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities).filter(endpoint => {
        return ["command", "event"].includes(endpoint.getProperty("kind").value);
    }).length;
}

export const numberOfLinksWithRetryLogic: Calculation = (parameters: CalculationParameters<Component>) => {

    let outgoingLinks = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId);

    // TODO also limit to endpoints which are safe/idempotent
    let linksToSynchronousEndpoints = outgoingLinks.filter((link) => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value));

    if (linksToSynchronousEndpoints.length === 0) {
        return 0;
    }

    let linksWithRetryLogic = linksToSynchronousEndpoints.filter(link => link.getProperty("retries").value > 0);

    return linksWithRetryLogic.length;
}

export const numberOfLinksWithComplexFailover: Calculation = (parameters: CalculationParameters<Component>) => {

    let outgoingLinks = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId);

    // TODO also limit to endpoints which are safe/idempotent
    let linksToSynchronousEndpoints = outgoingLinks.filter((link) => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value));

    if (linksToSynchronousEndpoints.length === 0) {
        return 0;
    }

    let linksWithCircuitBreaker = linksToSynchronousEndpoints.filter(link => link.getProperty("circuit_breaker").value !== "none");

    return linksWithCircuitBreaker.length;
}


export const countReplicasOfThisComponent: (component: Component, system: System) => number = (component, system) => {

    let replicas: number = 0;
    for (const [id, deploymentMapping] of system.getDeploymentMappingEntities.entries()) {
        let deployedEntity = deploymentMapping.getDeployedEntity
        if (deployedEntity.getId === component.getId) {
            let noOfReplicas = deploymentMapping.getProperties().find(prop => prop.getKey === "replicas").value
            replicas += noOfReplicas;
        }
    }
    return replicas;
} 

export const serviceReplicationLevel: Calculation = (parameters: CalculationParameters<Component>) => {

   return countReplicasOfThisComponent(parameters.entity, parameters.system);
}

export const amountOfRedundancy: Calculation = (parameters: CalculationParameters<Component>) => {

    let deploymentMappingsForThisComponent = [...parameters.system.getDeploymentMappingEntities.values()].filter(deploymentMapping => deploymentMapping.getDeployedEntity.getId === parameters.entity.getId);

    return deploymentMappingsForThisComponent.length;
}

export const storageReplicationLevel: Calculation = (parameters: CalculationParameters<Component>) => {

    if (parameters.entity.constructor.name !== StorageBackingService.name) {
        return "n/a";
    }
    
    return countReplicasOfThisComponent(parameters.entity, parameters.system);
}

export const serviceMeshUsage: Calculation = (parameters: CalculationParameters<Component>) => {
    
    let usage = 0;

    let outgoingProxy = parameters.entity.getEgressProxiedBy;
    if (outgoingProxy && outgoingProxy.getProperty("kind").value === SERVICE_MESH_KIND) {
        usage += 0.5;
    }

    let incomingProxy = parameters.entity.getIngressProxiedBy;
    if (incomingProxy && incomingProxy.getProperty("kind").value === SERVICE_MESH_KIND) {
        usage += 0.5;
    }

    return usage;
}

export const componentMeasureImplementations: { [measureKey: string]: Calculation } = {
    "ratioOfEndpointsSupportingSsl": ratioOfEndpointsSupportingSsl,
    "ratioOfExternalEndpointsSupportingTls": ratioOfExternalEndpointsSupportingTls,
    "serviceInterfaceDataCohesion": serviceInterfaceDataCohesion,
    "serviceInterfaceUsageCohesion": serviceInterfaceUsageCohesion,
    "totalServiceInterfaceCohesion": totalServiceInterfaceCohesion,
    "cohesionBetweenEndpointsBasedOnDataAggregateUsage": cohesionBetweenEndpointsBasedOnDataAggregateUsage,
    "numberOfProvidedSynchronousAndAsynchronousEndpoints": numberOfProvidedSynchronousAndAsynchronousEndpoints,
    "numberOfSynchronousEndpointsOfferedByAService": numberOfSynchronousEndpointsOfferedByAService,
    "ratioOfStateDependencyOfEndpoints": ratioOfStateDependencyOfEndpoints,
    "numberOfAsynchronousEndpointsOfferedByAService": numberOfAsynchronousEndpointsOfferedByAService,
    "numberOfSynchronousOutgoingLinks": numberOfSynchronousOutgoingLinks,
    "numberOfAsynchronousOutgoingLinks": numberOfAsynchronousOutgoingLinks,
    "ratioOfAsynchronousOutgoingLinks": ratioOfAsynchronousOutgoingLinks,
    "numberOfLinksPerComponent": numberOfLinksPerComponent,
    "numberOfConsumedEndpoints": numberOfConsumedEndpoints,
    "incomingOutgoingRatioOfAComponent": incomingOutgoingRatioOfAComponent,
    "ratioOfOutgoingLinksOfAService": ratioOfOutgoingLinksOfAService,
    "indirectInteractionDensity": indirectInteractionDensity,
    "serviceCouplingBasedOnEndpointEntropy": serviceCouplingBasedOnEndpointEntropy,
    "ratioOfStorageBackendSharing": ratioOfStorageBackendSharing,
    "combinedMetricForIndirectDependency": combinedMetricForIndirectDependency,
    "numberOfComponentsThatAreLinkedToAComponent": numberOfComponentsThatAreLinkedToAComponent,
    "numberOfComponentsAComponentIsLinkedTo": numberOfComponentsAComponentIsLinkedTo,
    "averageNumberOfDirectlyConnectedServices":
        averageNumberOfDirectlyConnectedServices,
    "numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents": numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents,
    "cyclicCommunication": cyclicCommunication,
    "relativeImportanceOfTheService": relativeImportanceOfTheService,
    "serviceCriticality": serviceCriticality,
    "degreeOfStorageBackendSharing": degreeOfStorageBackendSharing,
    "resourceCount": resourceCount,
    "serviceSize": serviceSize,
    "unusedEndpointCount": unusedEndpointCount,
    "numberOfReadEndpointsProvidedByAService": numberOfReadEndpointsProvidedByAService,
    "numberOfWriteEndpointsProvidedByAService": numberOfWriteEndpointsProvidedByAService,
    "numberOfLinksWithRetryLogic": numberOfLinksWithRetryLogic,
    "numberOfLinksWithComplexFailover": numberOfLinksWithComplexFailover,
    "serviceReplicationLevel": serviceReplicationLevel,
    "amountOfRedundancy": amountOfRedundancy,
    "storageReplicationLevel": storageReplicationLevel,
    "serviceMeshUsage": serviceMeshUsage
}

