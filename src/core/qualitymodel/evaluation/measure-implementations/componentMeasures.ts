
import { ref } from "vue";
import { BackingService, BrokerBackingService, Component, Endpoint, ExternalEndpoint, ProxyBackingService, Service, StorageBackingService, System } from "../../../entities.js";
import { Calculation, CalculationParameters, MeasureValue } from "../../quamoco/Measure.js";
import { ASYNCHRONOUS_ENDPOINT_KIND, AUTOMATED_RESTART_POLICIES, AUTOMATED_SCALING, BACKING_DATA_CONFIG_KIND, BACKING_DATA_LOGS_KIND, BACKING_DATA_METRICS_KIND, BACKING_DATA_SECRET_KIND, CONFIG_SERVICE_KIND, CONTRACT_ARTIFACT_TYPE, CUSTOM_SOFTWARE_TYPE, DATA_USAGE_RELATION_PERSISTENCE, DATA_USAGE_RELATION_USAGE, DYNAMIC_INFRASTRUCTURE, PROTOCOLS_SUPPORTING_TLS, ROLLING_UPDATE_STRATEGY_OPTIONS, SERVICE_MESH_KIND, SYNCHRONOUS_ENDPOINT_KIND, VAULT_KIND } from "../../specifications/featureModel.js";
import { average } from "./general-functions.js";
import { Artifact, getArtifactTypeProperties, getAvailableArtifactTypes } from "@/core/common/artifact.js";
import { link } from "fs";


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

export const providesHealthEndpoints: (component: Component) => boolean = (component) => {
    let hasHealthEndpoint = [...component.getEndpointEntities.entries()].filter(endpoint => endpoint[1].getProperty("health_check").value).length > 0;

    return hasHealthEndpoint;

}

export const providesReadinessEndpoints: (component: Component) => boolean = (component) => {
    let hasReadinessEndpoint = [...component.getEndpointEntities.entries()].filter(endpoint => endpoint[1].getProperty("readiness_check").value).length > 0;

    return hasReadinessEndpoint;
}


export const calculateRatioOfEndpointsSupportingSsl: (endpoints: Endpoint[]) => MeasureValue = (allEndpoints) => {
    let numberOfEndpointsSupportingSsl = allEndpoints.map(endpoint => endpoint.getProperties().find(property => property.getKey === "protocol").value)
        .filter(protocol => PROTOCOLS_SUPPORTING_TLS.includes(protocol))
        .length;

    if (allEndpoints.length === 0) {
        return "n/a";
    }

    return numberOfEndpointsSupportingSsl / allEndpoints.length;
}


export const ratioOfEndpointsSupportingSsl: Calculation = (parameters: CalculationParameters<Component>) => {

    let allEndpoints = parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities);
    return calculateRatioOfEndpointsSupportingSsl(allEndpoints);
}

export const calculateRatioOfExternalEndpointsSupportingTls: (endpoints: Endpoint[]) => MeasureValue = (allExternalEndpoints) => {
    let numberOfExternalEndpointsSupportingTLS = allExternalEndpoints.map(endpoint => endpoint.getProperties().find(property => property.getKey === "protocol").value)
        .filter(protocol => PROTOCOLS_SUPPORTING_TLS.includes(protocol))
        .length;
    if (allExternalEndpoints.length === 0) {
        return "n/a";
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
        return "n/a";
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
    let endpointsUsingDataAggregates = allEndpoints.filter(endpoint => endpoint.getDataAggregateEntities.length > 0);

    if (endpointsUsingDataAggregates.length === 0 || parameters.entity.getDataAggregateEntities.length === 0) {
        return "n/a";
    }

    let dataAggregateUsage = new Map<string, Set<string>>();
    let sharedUsages: number[] = [];


    for (const [index, endpoint] of endpointsUsingDataAggregates.entries()) {
        if (!dataAggregateUsage.has(endpoint.getId)) {
            dataAggregateUsage.set(endpoint.getId, new Set([...endpoint.getDataAggregateEntities.entries()].map(entry => entry[1].data.getId)));
        }
        for (const otherEndpoint of endpointsUsingDataAggregates.slice(index + 1)) {
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
        return "n/a";
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
        return "n/a";
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
        return "n/a";
    }

    return (numberOfOutgoingLinks / (incomingLinks.length + numberOfOutgoingLinks)) * 100
}

export const indirectInteractionDensity: Calculation = (parameters: CalculationParameters<Component>) => {
    let allComponents = parameters.system.getComponentEntities;

    if (allComponents.size < 3) {
        return "n/a";
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
        return "n/a";
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
        return "n/a";
    }

    let allServicesUsingStorageServices = new Map<string, Set<string>>();
    storageServicesUsedByThisComponent.forEach(storageService => {
        allServicesUsingStorageServices.set(storageService.getId, new Set<string>());
    })

    for (const [linkId, link] of parameters.system.getLinkEntities) {
        if (link.getSourceEntity.getId === parameters.entity.getId) {
            continue;
        }

        let targetComponentId = parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId;
        if (allServicesUsingStorageServices.has(targetComponentId) && link.getSourceEntity.constructor.name === Service.name) {
            allServicesUsingStorageServices.get(targetComponentId).add(link.getSourceEntity.getId);
        }
    }

    let sum = 0;
    for (const [storageId, storageService] of allServicesUsingStorageServices.entries()) {
        sum += allServicesUsingStorageServices.get(storageId).size;
    }

    let numberOfServices = ([...parameters.system.getComponentEntities.entries()]).filter(component => component[1].constructor.name === Service.name).length;
    let numberOfStorageBackingServices = ([...parameters.system.getComponentEntities.entries()]).filter(component => component[1].constructor.name === StorageBackingService.name).length;

    return sum / (numberOfServices * numberOfStorageBackingServices);
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

    if (parameters.system.getComponentEntities.size <= 1) {
        return "n/a";
    }

    let numberOfComponentsAComponentIsLinkedToValue = numberOfComponentsAComponentIsLinkedTo(parameters);

    return (numberOfComponentsAComponentIsLinkedToValue as number) / (parameters.system.getComponentEntities.size - 1);

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
        return "n/a";
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

export const ratioOfLinksWithRetryLogic: Calculation = (parameters: CalculationParameters<Component>) => {

    let outgoingLinks = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId);

    // TODO also limit to endpoints which are safe/idempotent
    let linksToSynchronousEndpoints = outgoingLinks.filter((link) => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value));

    if (linksToSynchronousEndpoints.length === 0) {
        return "n/a";
    }

    let linksWithRetryLogic = linksToSynchronousEndpoints.filter(link => link.getProperty("retries").value > 0);

    return linksWithRetryLogic.length / linksToSynchronousEndpoints.length;
}

export const ratioOfLinksWithComplexFailover: Calculation = (parameters: CalculationParameters<Component>) => {

    let outgoingLinks = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId);

    // TODO also limit to endpoints which are safe/idempotent
    let linksToSynchronousEndpoints = outgoingLinks.filter((link) => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value));

    if (linksToSynchronousEndpoints.length === 0) {
        return "n/a";
    }

    let linksWithCircuitBreaker = linksToSynchronousEndpoints.filter(link => link.getProperty("circuit_breaker").value !== "none");

    return linksWithCircuitBreaker.length / linksToSynchronousEndpoints.length;
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

export const secretsExternalization: Calculation = (parameters: CalculationParameters<Component>) => {

    let secrets = parameters.entity.getBackingDataEntities.filter(backingData => backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND);

    if (secrets.length === 0) {
        return "n/a";
    }

    let notStoredSecrets = secrets.filter(secret => DATA_USAGE_RELATION_USAGE.includes(secret.relation.getProperty("usage_relation").value));
    let notStoredSecretIds = notStoredSecrets.map(secret => secret.backingData.getId);

    let allOtherComponents = parameters.system.getComponentEntities.entries();
    let allInfrastructure = [...parameters.system.getInfrastructureEntities.entries()];

    let secretsStoredOutsideComponent = new Set();

    for (const [otherServiceId, otherService] of allOtherComponents) {
        let secrets = otherService.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND });
        secrets.forEach(secret => {
            if (notStoredSecretIds.includes(secret.backingData.getId) && DATA_USAGE_RELATION_PERSISTENCE.includes(secret.relation.getProperty("usage_relation").value)) {
                secretsStoredOutsideComponent.add(secret.backingData.getId);
            }
        })
    }

    for (const [infrastructureId, infrastructure] of allInfrastructure) {
        let secrets = infrastructure.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND });
        secrets.forEach(secret => {
            if (notStoredSecretIds.includes(secret.backingData.getId) && DATA_USAGE_RELATION_PERSISTENCE.includes(secret.relation.getProperty("usage_relation").value)) {
                secretsStoredOutsideComponent.add(secret.backingData.getId);
            }
        })
    }

    return secretsStoredOutsideComponent.size / secrets.length;
}

export const configurationExternalization: Calculation = (parameters: CalculationParameters<Component>) => {
    let configurations = parameters.entity.getBackingDataEntities.filter(backingData => backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND);

    if (configurations.length === 0) {
        return "n/a";
    }

    let notStoredConfigs = configurations.filter(config => DATA_USAGE_RELATION_USAGE.includes(config.relation.getProperty("usage_relation").value));
    let notStoredConfigIds = notStoredConfigs.map(config => config.backingData.getId);

    let allOtherComponents = parameters.system.getComponentEntities.entries();
    let allInfrastructure = [...parameters.system.getInfrastructureEntities.entries()];

    let configsStoredOutsideComponent = new Set();

    for (const [otherServiceId, otherService] of allOtherComponents) {
        let configs = otherService.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND });
        configs.forEach(config => {
            if (notStoredConfigIds.includes(config.backingData.getId) && DATA_USAGE_RELATION_PERSISTENCE.includes(config.relation.getProperty("usage_relation").value)) {
                configsStoredOutsideComponent.add(config.backingData.getId);
            }
        })
    }

    for (const [infrastructureId, infrastructure] of allInfrastructure) {
        let configs = infrastructure.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND });
        configs.forEach(config => {
            if (notStoredConfigIds.includes(config.backingData.getId) && DATA_USAGE_RELATION_PERSISTENCE.includes(config.relation.getProperty("usage_relation").value)) {
                configsStoredOutsideComponent.add(config.backingData.getId);
            }
        })
    }

    return configsStoredOutsideComponent.size / configurations.length;

}


export const suitablyReplicatedStatefulService: Calculation = (parameters: CalculationParameters<Component>) => {

    if (![StorageBackingService.name, BackingService.name, BrokerBackingService.name].includes(parameters.entity.constructor.name)
        || parameters.entity.getProperty("stateless").value) {
        return "n/a";
    }

    let deploymentMappings = [...parameters.system.getDeploymentMappingEntities.entries()].filter(([mappingId, mapping]) => {
        return mapping.getDeployedEntity.getId === parameters.entity.getId;
    })

    if (deploymentMappings.length <= 0) {
        return "n/a";
    }

    if (deploymentMappings.some(([mappingId, mapping]) => mapping.getProperty("replicas").value > 1)) {
        return parameters.entity.getProperty("replication_strategy").value !== "none" ? 1 : 0;
    } else {
        return "n/a";
    }
}

export const ratioOfNonCustomBackingServices: Calculation = (parameters: CalculationParameters<Component>) => {

    if (![StorageBackingService.constructor.name, BackingService.name, BrokerBackingService.name, ProxyBackingService.name].includes(parameters.entity.constructor.name)) {
        return "n/a";
    }

    return parameters.entity.getProperty("software_type").value === CUSTOM_SOFTWARE_TYPE ? 0 : 1;
}

export const secretsStoredInVault: Calculation = (parameters: CalculationParameters<Component>) => {

    let referencedSecrets = parameters.entity.getBackingDataEntities.filter(backingData => backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND);

    if (referencedSecrets.length === 0) {
        return "n/a";
    }

    let usedSecrets = referencedSecrets.filter(backingData => DATA_USAGE_RELATION_USAGE.includes(backingData.relation.getProperty("usage_relation").value));
    let usedSecretIds = usedSecrets.map(backingData => backingData.backingData.getId);
    let persistedSecrets = referencedSecrets.filter(backingData => DATA_USAGE_RELATION_PERSISTENCE.includes(backingData.relation.getProperty("usage_relation").value));

    let secretsInVault: Set<string> = new Set();

    let allVaultServices = [...parameters.system.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && VAULT_KIND.includes(component.getProperty("providedFunctionality").value);
    })

    for (const [valutServiceId, vaultService] of allVaultServices) {
        let secrets = vaultService.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND });
        secrets.forEach(secret => {
            if (usedSecretIds.includes(secret.backingData.getId) && DATA_USAGE_RELATION_PERSISTENCE.includes(secret.relation.getProperty("usage_relation").value)) {
                secretsInVault.add(secret.backingData.getId);
            }
        })
    }

    if (parameters.entity.constructor.name === BackingService.name && VAULT_KIND.includes(parameters.entity.getProperty("providedFunctionality").value)) {
        persistedSecrets.map(backingData => backingData.backingData.getId).forEach(secretId => secretsInVault.add(secretId));
    }

    return (secretsInVault.size / referencedSecrets.length);
}

export const accessRestrictedToCallers: Calculation = (parameters: CalculationParameters<Component>) => {

    let endpoints = parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities);

    if (endpoints.length === 0) {
        return "n/a";
    }

    let calledByAccount: Map<string, Set<string>> = new Map();
    endpoints.forEach(endpoint => {
        calledByAccount.set(endpoint.getId, new Set())
        if (endpoint.constructor.name === ExternalEndpoint.name) {
            calledByAccount.get(endpoint.getId).add("external account");
        }
    });
    for (const link of parameters.system.getIncomingLinksOfComponent(parameters.entity.getId)) {
        let identities = link.getSourceEntity.getProperty("identities");
        if (identities) {
            let accounts = Object.entries(identities.value).filter(([identifier, identityType]) => identityType === "account").map(([identifier, identityType]) => identifier);
            accounts.forEach(account => calledByAccount.get(link.getTargetEndpoint.getId).add(account));
        }
    }

    let restrictiveness = [];

    for (const endpoint of endpoints) {
        let allowed = endpoint.getAllowedAccounts;
        if (allowed) {
            if (allowed.length === 0) {
                restrictiveness.push(0);
            } else {
                let allowedSet = new Set(allowed);
                let endpointRestrictiveness = 1 - ((allowedSet.difference(calledByAccount.get(endpoint.getId)).size) / allowedSet.size);
                restrictiveness.push(endpointRestrictiveness);
            }
        }
    }

    return average(restrictiveness);
}

export const ratioOfDelegatedAuthentication: Calculation = (parameters: CalculationParameters<Component>) => {

    if (parameters.entity.constructor.name === BackingService.name && parameters.entity.getProperty("providedFunctionality").value === "authentication/authorization") {
        return "n/a";
    }

    if (parameters.entity.getAuthenticationBy) {
        return 1;
    } else {
        return 0;
    }
}

export const ratioOfStandardizedArtifacts: Calculation = (parameters: CalculationParameters<Component>) => {

    let artifacts = parameters.entity.getArtifacts;

    if (artifacts.size === 0) {
        return "n/a";
    }

    let standardized = artifacts.entries().filter(([key, artifact]) => artifact.getProperty("based_on_standard") && artifact.getProperty("based_on_standard").value !== "none").toArray();

    return standardized.length / artifacts.size;
}

export const ratioOfEntitiesProvidingStandardizedArtifacts: Calculation = (parameters: CalculationParameters<Component>) => {

    let artifacts = parameters.entity.getArtifacts;

    if (artifacts.size === 0) {
        return "n/a";
    }

    let standardized = artifacts.entries().filter(([key, artifact]) => artifact.getProperty("based_on_standard") && artifact.getProperty("based_on_standard").value !== "none").toArray();

    return standardized.length > 0 ? 1 : 0;
}

export const ratioOfDeploymentsOnDynamicInfrastructure: Calculation = (parameters: CalculationParameters<Component>) => {

    let deployedOnInfrastructure = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deployment]) => {
        return deployment.getDeployedEntity.getId === parameters.entity.getId;
    }).map(([deploymentMappingKey, deployment]) => {
        return deployment.getUnderlyingInfrastructure
    }).toArray();

    if (deployedOnInfrastructure.length === 0) {
        return "n/a";
    }

    let dynamicDeployment = deployedOnInfrastructure.filter(infrastructure => {
        return DYNAMIC_INFRASTRUCTURE.includes(infrastructure.getProperty("kind").value);
    })

    return dynamicDeployment.length / deployedOnInfrastructure.length;
}

export const namespaceSeparation: Calculation = (parameters: CalculationParameters<Component>) => {

    let allOtherComponents = parameters.system.getComponentEntities.entries().filter(([componentKey, component]) => {
        return componentKey !== parameters.entity.getId
    }).toArray();

    if (allOtherComponents.length === 0) {
        return "n/a";
    }

    let sharedNamespace = []

    for (const [componentKey, component] of allOtherComponents) {
        if (parameters.entity.getProperty("namespace").value === component.getProperty("namespace").value) {
            sharedNamespace.push(1);
        } else {
            sharedNamespace.push(0);
        }

    }

    return 1 - average(sharedNamespace);
}

export const ratioOfManagedBackingServices: Calculation = (parameters: CalculationParameters<Component>) => {
    if (![BackingService.name, StorageBackingService.name, ProxyBackingService.name, BrokerBackingService.name].includes(parameters.entity.constructor.name)) {
        return "n/a";
    } else {
        return parameters.entity.getProperty("managed").value ? 1 : 0;
    }
}

export const ratioOfDeploymentMappingsWithStatedResourceRequirements: Calculation = (parameters: CalculationParameters<Component>) => {
    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return deploymentMapping.getDeployedEntity.getId === parameters.entity.getId;
    }).toArray();

    if (relevantDeploymentMappings.length === 0) {
        return "n/a";
    }

    let statingResourceRequirements = relevantDeploymentMappings.filter(([deplyomentMappingKey, deploymentMapping]) => deploymentMapping.getProperty("resource_requirements").value !== "unstated");

    return statingResourceRequirements.length / relevantDeploymentMappings.length;

}

export const deployedEntitiesAutoscaling: Calculation = (parameters: CalculationParameters<Component>) => {

    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return deploymentMapping.getDeployedEntity.getId === parameters.entity.getId;
    }).toArray();

    if (relevantDeploymentMappings.length === 0) {
        return "n/a";
    }

    let underlyingInfrastructure = relevantDeploymentMappings.map(([deploymentMappingKey, deploymentMapping]) => deploymentMapping.getUnderlyingInfrastructure);

    let infrastructureProvidesScaling = underlyingInfrastructure.filter(infrastructure => AUTOMATED_SCALING.includes(infrastructure.getProperty("deployed_entities_scaling").value))

    return infrastructureProvidesScaling.length / underlyingInfrastructure.length;
}


export const nonProviderSpecificComponentArtifacts: Calculation = (parameters: CalculationParameters<Component>) => {

    let allArtifacts = parameters.entity.getArtifacts;

    if (allArtifacts.size === 0) {
        return "n/a";
    }

    let nonProviderSpecificArtifacts = allArtifacts.entries().filter(([artifactKey, artifact]) => {
        return artifact.getProperty("provider_specific") && !artifact.getProperty("provider_specific").value;
    }).toArray();

    return nonProviderSpecificArtifacts.length / allArtifacts.size;
}

export const configurationStoredInConfigService: Calculation = (parameters: CalculationParameters<Component>) => {

    let referencedConfigs = parameters.entity.getBackingDataEntities.filter(backingData => backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND);

    if (referencedConfigs.length === 0) {
        return "n/a";
    }

    let usedConfigs = referencedConfigs.filter(backingData => DATA_USAGE_RELATION_USAGE.includes(backingData.relation.getProperty("usage_relation").value));
    let usedConfigIds = usedConfigs.map(backingData => backingData.backingData.getId);
    let persistedConfigs = referencedConfigs.filter(backingData => DATA_USAGE_RELATION_PERSISTENCE.includes(backingData.relation.getProperty("usage_relation").value));

    let configsInConfigService: Set<string> = new Set();

    let allConfigServices = [...parameters.system.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && CONFIG_SERVICE_KIND.includes(component.getProperty("providedFunctionality").value);
    })

    for (const [configServiceId, configService] of allConfigServices) {
        let configs = configService.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND });
        configs.forEach(config => {
            if (usedConfigIds.includes(config.backingData.getId) && DATA_USAGE_RELATION_PERSISTENCE.includes(config.relation.getProperty("usage_relation").value)) {
                configsInConfigService.add(config.backingData.getId);
            }
        })
    }

    if (parameters.entity.constructor.name === BackingService.name && CONFIG_SERVICE_KIND.includes(parameters.entity.getProperty("providedFunctionality").value)) {
        persistedConfigs.map(backingData => backingData.backingData.getId).forEach(configId => configsInConfigService.add(configId));
    }

    return (configsInConfigService.size / referencedConfigs.length);
}

export const ratioOfEndpointsCoveredByContract: Calculation = (parameters: CalculationParameters<Component>) => {

    let allComponentEndpoints = parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities);

    if (allComponentEndpoints.length === 0) {
        return "n/a";
    }

    let componentArtifacts = parameters.entity.getArtifacts;

    let coveredByContract = [];

    for (const endpoint of allComponentEndpoints) {
        let contractArtifact = endpoint.getDocumentedBy.map(artifactKey => componentArtifacts.get(artifactKey)).find(artifact => {
            return CONTRACT_ARTIFACT_TYPE.includes(artifact.getType());
        })
        if (contractArtifact) {
            coveredByContract.push(endpoint);
        }
    }

    return coveredByContract.length / allComponentEndpoints.length;
}

export const standardizedDeployments: Calculation = (parameters: CalculationParameters<Component>) => {
    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return deploymentMapping.getDeployedEntity.getId === parameters.entity.getId;
    }).toArray();

    if (relevantDeploymentMappings.length === 0) {
        return "n/a";
    }

    let artifacts = parameters.entity.getArtifacts;

    if (artifacts.size === 0) {
        return "n/a";
    }

    let standardizedDeploymentUnit = relevantDeploymentMappings.filter(([deplyomentMappingKey, deploymentMapping]) => {
        let deploymentUnit = deploymentMapping.getProperty("deployment_unit").value;
        if (deploymentUnit) {
            return artifacts.entries().find(([artifactKey, artifact]) => {
                return artifact.getType() === deploymentUnit && artifact.getProperty("based_on_standard") && artifact.getProperty("based_on_standard").value !== "none";
            });
        }
        return false;
    }
    );
    return standardizedDeploymentUnit.length / relevantDeploymentMappings.length;
}

export const selfContainedDeployments: Calculation = (parameters: CalculationParameters<Component>) => {
    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return deploymentMapping.getDeployedEntity.getId === parameters.entity.getId;
    }).toArray();

    if (relevantDeploymentMappings.length === 0) {
        return "n/a";
    }

    let artifacts = parameters.entity.getArtifacts;

    if (artifacts.size === 0) {
        return "n/a";
    }

    let selfContainedDeploymentUnit = relevantDeploymentMappings.filter(([deplyomentMappingKey, deploymentMapping]) => {
        let deploymentUnit = deploymentMapping.getProperty("deployment_unit").value;
        if (deploymentUnit) {
            return artifacts.entries().find(([artifactKey, artifact]) => {
                return artifact.getType() === deploymentUnit && artifact.getProperty("self_contained") && artifact.getProperty("self_contained").value;
            });
        }
        return false;
    }
    );
    return selfContainedDeploymentUnit.length / relevantDeploymentMappings.length;
}

export const replacingDeployments: Calculation = (parameters: CalculationParameters<Component>) => {
    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return deploymentMapping.getDeployedEntity.getId === parameters.entity.getId;
    }).toArray();

    if (relevantDeploymentMappings.length === 0) {
        return "n/a";
    }

    let replacing = [];

    relevantDeploymentMappings.forEach(([deploymentMappingId, deploymentMapping]) => {
        if (deploymentMapping.getProperty("update_strategy").value !== "in-place") {
            replacing.push(deploymentMappingId);
        }
    })

    return replacing.length / relevantDeploymentMappings.length;
}

export const ratioOfLinksWithTimeout: Calculation = (parameters: CalculationParameters<Component>) => {

    let outgoingLinks = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId);

    if (outgoingLinks.length === 0) {
        return "n/a";
    }

    let linksWithTimeout = outgoingLinks.filter(link => link.getProperty("timeout").value > 0);

    return linksWithTimeout.length / outgoingLinks.length;
}

export const deploymentsWithRestart: Calculation = (parameters: CalculationParameters<Component>) => {
    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return deploymentMapping.getDeployedEntity.getId === parameters.entity.getId;
    }).toArray();

    if (relevantDeploymentMappings.length === 0) {
        return "n/a";
    }

    let automatedRestart = relevantDeploymentMappings.filter(([deploymentMappingId, deploymentMapping]) => AUTOMATED_RESTART_POLICIES.includes(deploymentMapping.getProperty("automated_restart_policy").value));

    return automatedRestart.length / relevantDeploymentMappings.length;
}

export const ratioOfDocumentedEndpoints: Calculation = (parameters: CalculationParameters<Component>) => {
    let allComponentEndpoints = parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities);

    if (allComponentEndpoints.length === 0) {
        return "n/a";
    }

    let documented = allComponentEndpoints.filter(endpoint => endpoint.getDocumentedBy.length > 0);

    return documented.length / allComponentEndpoints.length;
}

export const ratioOfEndpointsThatSupportTokenBasedAuthentication: Calculation = (parameters: CalculationParameters<Component>) => {
    let allComponentEndpoints = parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities);

    if (allComponentEndpoints.length === 0) {
        return "n/a";
    }

    let endpointsSupportingTokens = allComponentEndpoints.filter(endpoint => endpoint.getProperty("supported_authentication_methods").value.includes("Token"));

    return endpointsSupportingTokens.length / allComponentEndpoints.length;
}

export const ratioOfEndpointsThatSupportApiKeys: Calculation = (parameters: CalculationParameters<Component>) => {
    let allComponentEndpoints = parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities);

    if (allComponentEndpoints.length === 0) {
        return "n/a";
    }

    let endpointsSupportingTokens = allComponentEndpoints.filter(endpoint => endpoint.getProperty("supported_authentication_methods").value.includes("API-Key"));

    return endpointsSupportingTokens.length / allComponentEndpoints.length;
}

export const ratioOfEndpointsThatSupportPlaintextAuthentication: Calculation = (parameters: CalculationParameters<Component>) => {
    let allComponentEndpoints = parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities);

    if (allComponentEndpoints.length === 0) {
        return "n/a";
    }

    let endpointsSupportingTokens = allComponentEndpoints.filter(endpoint => endpoint.getProperty("supported_authentication_methods").value.includes("basic_authentication"));

    return endpointsSupportingTokens.length / allComponentEndpoints.length;
}

export const ratioOfEndpointsThatAreIncludedInASingleSignOnApproach: Calculation = (parameters: CalculationParameters<Component>) => {
    let allComponentEndpoints = parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities);

    if (allComponentEndpoints.length === 0) {
        return "n/a";
    }

    let endpointsSupportingTokens = allComponentEndpoints.filter(endpoint => endpoint.getProperty("supported_authentication_methods").value.includes("Single Sign-On"));

    return endpointsSupportingTokens.length / allComponentEndpoints.length;
}

export const iendpointAccessMethodsConsistency: Calculation = (parameters: CalculationParameters<Component>) => {

    let allComponentEndpoints = parameters.entity.getEndpointEntities;

    let endpointsWithAccessControl = allComponentEndpoints.filter(endpoint => endpoint.getProperty("supported_authentication_methods").value.length !== 0);

    if (endpointsWithAccessControl.length <= 1) {
        return "n/a";
    }

    let pairwiseSimilarity = [];

    for (const [index, endpointA] of endpointsWithAccessControl.entries()) {
        for (const endpointB of endpointsWithAccessControl.slice(index + 1)) {
            let setA = new Set(endpointA.getProperty("supported_authentication_methods").value);
            let setB = new Set(endpointB.getProperty("supported_authentication_methods").value);

            if (setA.union(setB).size === 0) {
                pairwiseSimilarity.push(1);
            } else {
                let similarity = setA.intersection(setB).size / setA.union(setB).size;
                pairwiseSimilarity.push(similarity);
            }
        }
    }

    return average(pairwiseSimilarity);
}

export const externalEndpointAccessConsistency: Calculation = (parameters: CalculationParameters<Component>) => {

    let allComponentEndpoints = parameters.entity.getExternalEndpointEntities;

    let endpointsWithAccessControl = allComponentEndpoints.filter(endpoint => endpoint.getProperty("supported_authentication_methods").value.length !== 0);

    if (endpointsWithAccessControl.length <= 1) {
        return "n/a";
    }

    let pairwiseSimilarity = [];

    for (const [index, endpointA] of endpointsWithAccessControl.entries()) {
        for (const endpointB of endpointsWithAccessControl.slice(index + 1)) {
            let setA = new Set(endpointA.getProperty("supported_authentication_methods").value);
            let setB = new Set(endpointB.getProperty("supported_authentication_methods").value);

            if (setA.union(setB).size === 0) {
                pairwiseSimilarity.push(1);
            } else {
                let similarity = setA.intersection(setB).size / setA.union(setB).size;
                pairwiseSimilarity.push(similarity);
            }
        }
    }

    return average(pairwiseSimilarity);
}

export const readWriteSeparationForDataAggregates: Calculation = (parameters: CalculationParameters<Component>) => {
    // initialize map to track data aggregate usage
    let dataAggregateUsageSeparation = new Map<string, { "readBy": string[], "writeBy": string[] }>();
    parameters.entity.getDataAggregateEntities.forEach((dataAggregateRelation) => {
        if (DATA_USAGE_RELATION_PERSISTENCE.includes(dataAggregateRelation.relation.getProperty("usage_relation").value)) {
            dataAggregateUsageSeparation.set(dataAggregateRelation.data.getId, { "readBy": [], "writeBy": [] });
        }
    })
    let dataAggregatesUsedByThisComponent = dataAggregateUsageSeparation.keys().toArray();

    let allComponentEntities = parameters.system.getComponentEntities;
    for (const [componentId, component] of allComponentEntities) {

        let allComponentEndpoints = component.getEndpointEntities.concat(component.getExternalEndpointEntities);

        if (allComponentEndpoints.length === 0 || component.getDataAggregateEntities.length === 0) {
            continue;
        }

        for (const endpoint of allComponentEndpoints) {
            let persistenceRelations = endpoint.getDataAggregateEntities.filter(usageRelation => {
                let componentUsageRelation = component.getDataAggregateEntities.find(componentRelation => componentRelation.data.getId === usageRelation.data.getId);
                 return dataAggregatesUsedByThisComponent.includes(usageRelation.data.getId) && componentUsageRelation && DATA_USAGE_RELATION_PERSISTENCE.includes(componentUsageRelation.relation.getProperty("usage_relation").value);
            });
            for (const usageRelation of persistenceRelations) {
                if (endpoint.getProperty("kind").value === "query") {
                    dataAggregateUsageSeparation.get(usageRelation.data.getId).readBy.push(componentId);
                } else if (endpoint.getProperty("kind").value === "command") {
                    dataAggregateUsageSeparation.get(usageRelation.data.getId).writeBy.push(componentId);
                }
            }
        }
    }

    let separationPerDataAggregate = new Map<string, number>();

    dataAggregateUsageSeparation.entries().forEach(([dataAggregateId, readWriteBy]) => {
        let readBy = new Set(readWriteBy.readBy);
        let writeBy = new Set(readWriteBy.writeBy);

        if (readBy.size === 0 || writeBy.size === 0) {
            return;
        }

        if (readBy.difference(writeBy).size === 0 && writeBy.difference(readBy).size === 0) {
            // both read and write by same components
            separationPerDataAggregate.set(dataAggregateId, 0);
            return;
        }

        if (readBy.difference(writeBy).size > 0 || writeBy.difference(readBy).size > 0) {
            separationPerDataAggregate.set(dataAggregateId, 1);
            return;
        }

    })

    if (separationPerDataAggregate.size === 0) {
        return "n/a";
    }

    return average(separationPerDataAggregate.values().toArray());
}

export const ratioOfServicesThatProvideHealthEndpoints: Calculation = (parameters: CalculationParameters<Component>) => {

    if (parameters.entity.constructor.name !== Service.name) {
        return "n/a";
    }

    return providesHealthEndpoints(parameters.entity) ? 1 : 0;
}

export const ratioOfServicesThatProvideReadinessEndpoints: Calculation = (parameters: CalculationParameters<Component>) => {

    if (parameters.entity.constructor.name !== Service.name) {
        return "n/a";
    }

    return providesReadinessEndpoints(parameters.entity) ? 1 : 0;
}

export const degreeOfSeparationByGateways: Calculation = (parameters: CalculationParameters<Component>) => {

    if (parameters.entity.constructor.name !== Service.name) {
        return "n/a";
    }

    if (!parameters.entity.getExternalIngressProxiedBy) {
        return "n/a";
    }

    if (parameters.entity.getExternalIngressProxiedBy.getProperty("kind").value !== "API Gateway") {
        return "n/a";
    }

    let commonGateway = parameters.entity.getExternalIngressProxiedBy;

    let otherServices = parameters.system.getComponentEntities.entries()
        .filter(([componentId, component]) => component.constructor.name === Service.name && componentId !== parameters.entity.getId)
        .filter(([componentId, component]) => component.getExternalIngressProxiedBy && component.getExternalIngressProxiedBy.getId === commonGateway.getId)
        .toArray();

    let sharingServices = (1 + otherServices.length)
    let degreeOfSharing = sharingServices / 1;

    return 1 / degreeOfSharing;
}

export const distributedTracingSupport: Calculation = (parameters: CalculationParameters<Component>) => {

    if (parameters.entity.constructor.name === BackingService.name && parameters.entity.getProperty("providedFunctionality").value === "tracing") {
        return "n/a";
    }

    let connectedComponents = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId).map(link => parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId));

    let tracingServiceIncluded = connectedComponents.some(component => component && component.constructor.name === BackingService.name && component.getProperty("providedFunctionality").value === "tracing");

    return tracingServiceIncluded ? 1 : 0;
}

export const ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService: Calculation = (parameters: CalculationParameters<Component>) => {

    if (parameters.entity.constructor.name === BackingService.name && parameters.entity.getProperty("providedFunctionality").value === "logging") {
        return "n/a";
    }

    let loggingComponents = [...parameters.system.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && component.getProperty("providedFunctionality").value === "logging";
    })

    if (loggingComponents.length === 0) {
        return 0;
    }

    let connectionsToLoggingService: {
        loggingService: string,
        mode: "push" | "pull"
    }[] = [];
    let loggingComponentIds = loggingComponents.map(([componentId, component]) => componentId);
    for (const link of parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId)) {
        let targetService = parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId);
        // case 1: component sends to a logging service
        if (loggingComponentIds.includes(targetService.getId)) {
            connectionsToLoggingService.push({
                loggingService: targetService.getId,
                mode: "push"
            })
        }
    }

    for (const link of parameters.system.getIncomingLinksOfComponent(parameters.entity.getId)) {
        // case 2: logging service scrapes logs from component
        if (loggingComponentIds.includes(link.getSourceEntity.getId)) {
            connectionsToLoggingService.push({
                loggingService: link.getSourceEntity.getId,
                mode: "pull"
            })
        }
    }

    let loggingData: string[] = parameters.entity.getBackingDataEntities.filter(backingData => {
        return backingData.backingData.getProperty("kind").value === BACKING_DATA_LOGS_KIND && DATA_USAGE_RELATION_USAGE.includes(backingData.relation.getProperty("usage_relation").value)
    }).map(backingData => backingData.backingData.getId);

    let componentExportsLoggingData = false;
    logDataLoop: for (const logData of loggingData) {
        for (const loggingConnection of connectionsToLoggingService) {
            let loggingService = parameters.system.getComponentEntities.get(loggingConnection.loggingService);
            let dataStoredByLoggingService = loggingService.getBackingDataEntities.find(backingData => backingData.backingData.getId === logData);
            if (dataStoredByLoggingService && DATA_USAGE_RELATION_PERSISTENCE.includes(dataStoredByLoggingService.relation.getProperty("usage_relation").value)) {
                componentExportsLoggingData = true;
                continue logDataLoop;
            }

        }
    }
    if (componentExportsLoggingData) {
        return 1;
    }

    return 0;
}


export const ratioOfComponentsOrInfrastructureNodesThatExportMetrics: Calculation = (parameters: CalculationParameters<Component>) => {

    if (parameters.entity.constructor.name === BackingService.name && parameters.entity.getProperty("providedFunctionality").value === "metrics") {
        return "n/a";
    }

    let metricComponents = [...parameters.system.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && component.getProperty("providedFunctionality").value === "metrics";
    })

    if (metricComponents.length === 0) {
        return 0;
    }

    let connectionsToMetricsService: {
        metricsService: string,
        mode: "push" | "pull"
    }[] = [];
    let metricComponentIds = metricComponents.map(([componentId, component]) => componentId);
    for (const link of parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId)) {
        let targetService = parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId);
        // case 1: component sends to a metrics service
        if (metricComponentIds.includes(targetService.getId)) {
            connectionsToMetricsService.push({
                metricsService: targetService.getId,
                mode: "push"
            })
        }
    }

    for (const link of parameters.system.getIncomingLinksOfComponent(parameters.entity.getId)) {
        // case 2: metrics service scrapes logs from component
        if (metricComponentIds.includes(link.getSourceEntity.getId)) {
            connectionsToMetricsService.push({
                metricsService: link.getSourceEntity.getId,
                mode: "pull"
            })
        }
    }

    let metricData: string[] = parameters.entity.getBackingDataEntities.filter(backingData => {
        return backingData.backingData.getProperty("kind").value === BACKING_DATA_METRICS_KIND && DATA_USAGE_RELATION_USAGE.includes(backingData.relation.getProperty("usage_relation").value)
    }).map(backingData => backingData.backingData.getId);

    let componentExportsMetrics = false;
    metricsDataLoop: for (const metrics of metricData) {
        for (const metricsConnection of connectionsToMetricsService) {
            let metricsService = parameters.system.getComponentEntities.get(metricsConnection.metricsService);
            let dataStoredByMetricsService = metricsService.getBackingDataEntities.find(backingData => backingData.backingData.getId === metrics);
            if (dataStoredByMetricsService && DATA_USAGE_RELATION_PERSISTENCE.includes(dataStoredByMetricsService.relation.getProperty("usage_relation").value)) {
                componentExportsMetrics = true;
                continue metricsDataLoop;
            }

        }
    }
    if (componentExportsMetrics) {
        return 1;
    }

    return 0;
}

export const ratioOfBrokerBackendSharing: Calculation = (parameters: CalculationParameters<Component>) => {
    let brokerServicesUsedByThisComponent = parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId)
        .map(link => parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId))
        .filter(component => component.constructor.name === BrokerBackingService.name);

    if (brokerServicesUsedByThisComponent.length === 0) {
        return "n/a";
    }

    let allServicesUsingBrokerServices = new Map<string, Set<string>>();
    brokerServicesUsedByThisComponent.forEach(brokerService => {
        allServicesUsingBrokerServices.set(brokerService.getId, new Set<string>());
    })

    for (const [linkId, link] of parameters.system.getLinkEntities) {
        if (link.getSourceEntity.getId === parameters.entity.getId) {
            continue;
        }

        let targetComponentId = parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId;
        if (allServicesUsingBrokerServices.has(targetComponentId) && link.getSourceEntity.constructor.name === Service.name) {
            allServicesUsingBrokerServices.get(targetComponentId).add(link.getSourceEntity.getId);
        }
    }

    let sum = 0;
    for (const [brokerId, brokerService] of allServicesUsingBrokerServices.entries()) {
        sum += allServicesUsingBrokerServices.get(brokerId).size;
    }

    let numberOfServices = ([...parameters.system.getComponentEntities.entries()]).filter(component => component[1].constructor.name === Service.name).length;
    let numberOfBrokerBackingServices = ([...parameters.system.getComponentEntities.entries()]).filter(component => component[1].constructor.name === BrokerBackingService.name).length;

    return sum / (numberOfServices * numberOfBrokerBackingServices);
}

export const ratioOfCachedDataAggregates: Calculation = (parameters: CalculationParameters<Component>) => {

    let cachedUsages = 0;
    let allUsages = 0;

    parameters.entity.getDataAggregateEntities.forEach(dataAggregateUsage => {
        if (DATA_USAGE_RELATION_USAGE.includes(dataAggregateUsage.relation.getProperty("usage_relation").value)) {
            allUsages++;
            if (dataAggregateUsage.relation.getProperty("usage_relation").value === "cached-usage") {
                cachedUsages++;
            }
        }
    })

    if (allUsages > 0) {
        return cachedUsages / allUsages;
    }
    return "n/a";
}

export const dataShardingLevel: Calculation = (parameters: CalculationParameters<Component>) => {

    if (parameters.entity.constructor.name !== StorageBackingService.name) {
        return "n/a";
    }

    return parameters.entity.getProperty("shards").value;
}

export const rollingUpdates: Calculation = (parameters: CalculationParameters<Component>) => {

    let deploymentMappingsForThisComponent = [...parameters.system.getDeploymentMappingEntities.values()].filter(deploymentMapping => deploymentMapping.getDeployedEntity.getId === parameters.entity.getId);

    if (deploymentMappingsForThisComponent.length === 0) {
        return "n/a";
    }

    let rolling = [];

    deploymentMappingsForThisComponent.forEach(deploymentMapping => {
        if (ROLLING_UPDATE_STRATEGY_OPTIONS.includes(deploymentMapping.getProperty("update_strategy").value)) {
            rolling.push(deploymentMapping.getId);
        }
    })

    return rolling.length / deploymentMappingsForThisComponent.length;
}

export const ratioOfComponentsWhoseExternalIngressIsProxied: Calculation = (parameters: CalculationParameters<Component>) => {
    if (parameters.entity.constructor.name === ProxyBackingService.name) {
        return "n/a";
    }

    if (parameters.entity.getExternalEndpointEntities.length === 0) {
        return "n/a";
    }

    return parameters.entity.getExternalIngressProxiedBy ? 1 : 0;
}


export const numberOfAvailabilityZonesUsedByServices: Calculation = (parameters: CalculationParameters<Component>) => {

    if (parameters.entity.constructor.name !== Service.name) {
        return "n/a";
    }

    let deploymentMappingsForThisComponent = [...parameters.system.getDeploymentMappingEntities.values()].filter(deploymentMapping => deploymentMapping.getDeployedEntity.getId === parameters.entity.getId);

    if (deploymentMappingsForThisComponent.length === 0) {
        return "n/a";
    }

    let infrastructureForThisComponent = deploymentMappingsForThisComponent.map(deploymentMapping => deploymentMapping.getUnderlyingInfrastructure);

    let availabilityZones: Set<string> = new Set();

    infrastructureForThisComponent.forEach(infrastructure => {
        let usedAvailabilityZones = (infrastructure.getProperty("availability_zone").value as string).split(",");
        usedAvailabilityZones.forEach(zoneId => availabilityZones.add(zoneId));
    })

    return availabilityZones.size;
}

export const numberOfAvailabilityZonesUsedByStorageServices: Calculation = (parameters: CalculationParameters<Component>) => {

    if (parameters.entity.constructor.name !== StorageBackingService.name) {
        return "n/a";
    }

    let deploymentMappingsForThisComponent = [...parameters.system.getDeploymentMappingEntities.values()].filter(deploymentMapping => deploymentMapping.getDeployedEntity.getId === parameters.entity.getId);

    if (deploymentMappingsForThisComponent.length === 0) {
        return "n/a";
    }

    let infrastructureForThisComponent = deploymentMappingsForThisComponent.map(deploymentMapping => deploymentMapping.getUnderlyingInfrastructure);

    let availabilityZones: Set<string> = new Set();

    infrastructureForThisComponent.forEach(infrastructure => {
        let usedAvailabilityZones = (infrastructure.getProperty("availability_zone").value as string).split(",");
        usedAvailabilityZones.forEach(zoneId => availabilityZones.add(zoneId));
    })

    return availabilityZones.size;
}

export const degreeToWhichComponentsAreLinkedToStatefulComponents: Calculation = (parameters: CalculationParameters<Component>) => {

    let linkedToComponents: Map<string, Component> = new Map();
    parameters.system.getOutgoingLinksOfComponent(parameters.entity.getId).forEach(link => {
        let targetComponent = parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId);
        if (targetComponent) {
            linkedToComponents.set(targetComponent.getId, targetComponent);
        }
    })
    if (linkedToComponents.size === 0) {
        return "n/a";
    }

    let statefulComponents = new Set();

    for (const [componentId, component] of linkedToComponents.entries()) {
        if (!component.getProperty("stateless").value) {
            statefulComponents.add(componentId);
        }
    }
    return statefulComponents.size / linkedToComponents.size;
}

export const ratioOfRateLimitingEndpoints: Calculation = (parameters: CalculationParameters<Component>) => {

    let allEndpoints = [...parameters.entity.getEndpointEntities.concat(parameters.entity.getExternalEndpointEntities)];

    if (allEndpoints.length === 0) {
        return "n/a";
    }

    return allEndpoints.filter(endpoint => endpoint.getProperty("rate_limiting").value !== "none").length / allEndpoints.length;
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
    "ratioOfLinksWithRetryLogic": ratioOfLinksWithRetryLogic,
    "ratioOfLinksWithComplexFailover": ratioOfLinksWithComplexFailover,
    "serviceReplicationLevel": serviceReplicationLevel,
    "amountOfRedundancy": amountOfRedundancy,
    "storageReplicationLevel": storageReplicationLevel,
    "serviceMeshUsage": serviceMeshUsage,
    "secretsExternalization": secretsExternalization,
    "configurationExternalization": configurationExternalization,
    "suitablyReplicatedStatefulService": suitablyReplicatedStatefulService,
    "ratioOfNonCustomBackingServices": ratioOfNonCustomBackingServices,
    "secretsStoredInVault": secretsStoredInVault,
    "accessRestrictedToCallers": accessRestrictedToCallers,
    "ratioOfDelegatedAuthentication": ratioOfDelegatedAuthentication,
    "ratioOfStandardizedArtifacts": ratioOfStandardizedArtifacts,
    "ratioOfEntitiesProvidingStandardizedArtifacts": ratioOfEntitiesProvidingStandardizedArtifacts,
    "ratioOfDeploymentsOnDynamicInfrastructure": ratioOfDeploymentsOnDynamicInfrastructure,
    "namespaceSeparation": namespaceSeparation,
    "ratioOfManagedBackingServices": ratioOfManagedBackingServices,
    "ratioOfDeploymentMappingsWithStatedResourceRequirements": ratioOfDeploymentMappingsWithStatedResourceRequirements,
    "deployedEntitiesAutoscaling": deployedEntitiesAutoscaling,
    "nonProviderSpecificComponentArtifacts": nonProviderSpecificComponentArtifacts,
    "configurationStoredInConfigService": configurationStoredInConfigService,
    "ratioOfEndpointsCoveredByContract": ratioOfEndpointsCoveredByContract,
    "standardizedDeployments": standardizedDeployments,
    "selfContainedDeployments": selfContainedDeployments,
    "replacingDeployments": replacingDeployments,
    "ratioOfLinksWithTimeout": ratioOfLinksWithTimeout,
    "deploymentsWithRestart": deploymentsWithRestart,
    "ratioOfDocumentedEndpoints": ratioOfDocumentedEndpoints,
    "ratioOfEndpointsThatSupportTokenBasedAuthentication": ratioOfEndpointsThatSupportTokenBasedAuthentication,
    "ratioOfEndpointsThatSupportApiKeys": ratioOfEndpointsThatSupportApiKeys,
    "ratioOfEndpointsThatSupportPlaintextAuthentication": ratioOfEndpointsThatSupportPlaintextAuthentication,
    "ratioOfEndpointsThatAreIncludedInASingleSignOnApproach": ratioOfEndpointsThatAreIncludedInASingleSignOnApproach,
    "iendpointAccessMethodsConsistency": iendpointAccessMethodsConsistency,
    "externalEndpointAccessConsistency": externalEndpointAccessConsistency,
    "readWriteSeparationForDataAggregates": readWriteSeparationForDataAggregates,
    "ratioOfServicesThatProvideHealthEndpoints": ratioOfServicesThatProvideHealthEndpoints,
    "ratioOfServicesThatProvideReadinessEndpoints": ratioOfServicesThatProvideReadinessEndpoints,
    "degreeOfSeparationByGateways": degreeOfSeparationByGateways,
    "distributedTracingSupport": distributedTracingSupport,
    "ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService": ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService,
    "ratioOfComponentsOrInfrastructureNodesThatExportMetrics": ratioOfComponentsOrInfrastructureNodesThatExportMetrics,
    "ratioOfBrokerBackendSharing": ratioOfBrokerBackendSharing,
    "ratioOfCachedDataAggregates": ratioOfCachedDataAggregates,
    "dataShardingLevel": dataShardingLevel,
    "rollingUpdates": rollingUpdates,
    "ratioOfComponentsWhoseExternalIngressIsProxied": ratioOfComponentsWhoseExternalIngressIsProxied,
    "numberOfAvailabilityZonesUsedByServices": numberOfAvailabilityZonesUsedByServices,
    "numberOfAvailabilityZonesUsedByStorageServices": numberOfAvailabilityZonesUsedByStorageServices,
    "degreeToWhichComponentsAreLinkedToStatefulComponents": degreeToWhichComponentsAreLinkedToStatefulComponents,
    "ratioOfRateLimitingEndpoints": ratioOfRateLimitingEndpoints
}

