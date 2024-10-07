import { BackingService, Component, Infrastructure, RequestTrace, Service, StorageBackingService, System } from "@/core/entities";
import { Calculation, CalculationParameters } from "../../quamoco/Measure";
import { average, lowest, median } from "./general-functions";
import { calculateRatioOfEndpointsSupportingSsl, providesHealthAndReadinessEndpoints } from "./componentMeasures";
import { calculateNumberOfLinksWithServiceDiscovery, calculateRatioOfLinksToAsynchronousEndpoints, calculateRatioOfSecuredLinks, calculateRatioOfStatefulComponents, calculateRatioOfStatelessComponents, calculateReplicasPerService, countComponentsConnectedToCertainEndpoints, getServiceInteractions } from "./systemMeasures";
import { EVENT_SOURCING_KIND, SYNCHRONOUS_ENDPOINT_KIND } from "../../specifications/featureModel";
import { supportsMonitoring as infrastructureSupportsMonitoring } from "./infrastructureMeasures";
import { supportsMonitoring as componentSupportsMonitoring } from "./componentMeasures";

export const getIncludedComponents: (requestTrace: RequestTrace, system: System) => Component[] = (requestTrace, system) => {
    let includedUniqueComponents = new Set(requestTrace.getLinks
        .flat()
        .map(link => {
            return [link.getSourceEntity, system.searchComponentOfEndpoint(link.getTargetEndpoint.getId)]
        }).flat());

    return Array.from(includedUniqueComponents);
}


export const ratioOfEndpointsSupportingSsl = (parameters: CalculationParameters<RequestTrace>) => {
    let traceEndpoints = parameters.entity.getLinks.flatMap(links => links).map(link => link.getTargetEndpoint);
    let uniqueEndpoints = new Set(traceEndpoints);
    return calculateRatioOfEndpointsSupportingSsl(Array.from(uniqueEndpoints));
}

export const requestTraceLength: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    return parameters.entity.getLinks.length;
}

export const requestTraceComplexity: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    return parameters.entity.getLinks.flat().length;
}

export const ratioOfSecuredLinks: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allLinks = parameters.entity.getLinks.flatMap(links => links);
    return calculateRatioOfSecuredLinks(allLinks);
}


export const numberOfCyclesInRequestTraces: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let includedNodes = [];
    let links = parameters.entity.getLinks;
    let numberOfCycles = 0;

    for (const link of links.flat()) {
        includedNodes.push(link.getSourceEntity.getId);
        let targetComponent = parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId);
        if (includedNodes.includes(targetComponent.getId)) {
            numberOfCycles += 1;
            includedNodes = [];
        }
    }
    return numberOfCycles;
}

const dataReplicationAlongRequestTrace: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let dataAggregateUsages = new Map<string, Map<string, string>>();

    if (parameters.entity.getExternalEndpoint) {
        let endpoint = parameters.entity.getExternalEndpoint;
        let parentComponent = parameters.system.searchComponentOfEndpoint(endpoint.getId);
        endpoint.getDataAggregateEntities.forEach(dataAggregateUsage => {
            if (dataAggregateUsages.get(dataAggregateUsage.data.getId)) {
                dataAggregateUsages.get(dataAggregateUsage.data.getId).set(parentComponent.getId, dataAggregateUsage.relation.getProperty("usage_relation").value);
            } else {
                let firstUsage = new Map();
                firstUsage.set(parentComponent.getId, dataAggregateUsage.relation.getProperty("usage_relation").value);
                dataAggregateUsages.set(dataAggregateUsage.data.getId, firstUsage);
            }
        })
    }

    parameters.entity.getLinks.flat().forEach(link => {
        let calledEndpoint = link.getTargetEndpoint;
        let parentComponent = parameters.system.searchComponentOfEndpoint(calledEndpoint.getId);
        calledEndpoint.getDataAggregateEntities.forEach(dataAggregateUsage => {
            if (dataAggregateUsages.get(dataAggregateUsage.data.getId)) {
                dataAggregateUsages.get(dataAggregateUsage.data.getId).set(parentComponent.getId, dataAggregateUsage.relation.getProperty("usage_relation").value);
            } else {
                let firstUsage = new Map();
                firstUsage.set(parentComponent.getId, dataAggregateUsage.relation.getProperty("usage_relation").value);
                dataAggregateUsages.set(dataAggregateUsage.data.getId, firstUsage);
            }
        })

    })

    return average([...dataAggregateUsages.values()].map(usageByComponents => average([...usageByComponents.values()].map(usage => {
        if (["cached-usage", "persistence"].includes(usage)) {
            return 1
        }
        else {
            return 0;
        }
    }))))

}

export const ratioOfStateDependencyOfEndpoints: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allEndpoints = parameters.entity.getLinks.flatMap(links => links).map(link => link.getTargetEndpoint);
    if (parameters.entity.getExternalEndpoint) {
        allEndpoints.push(parameters.entity.getExternalEndpoint);
    }

    if (allEndpoints.length === 0) {
        return 0;
    }

    let numberOfDependingEndpoints = allEndpoints.filter(endpoint => endpoint.getDataAggregateEntities.length > 0).length;

    return numberOfDependingEndpoints / allEndpoints.length;
}

export const ratioOfStatefulComponents: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let includedUniqueComponents = new Set(parameters.entity.getLinks
        .flat()
        .map(link => {
            return [link.getSourceEntity, parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId)]
        }).flat());
    return calculateRatioOfStatefulComponents(Array.from(includedUniqueComponents));
}


export const ratioOfStatelessComponents: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let includedUniqueComponents = new Set(parameters.entity.getLinks
        .flat()
        .map(link => {
            return [link.getSourceEntity, parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId)]
        }).flat());
    return calculateRatioOfStatelessComponents(Array.from(includedUniqueComponents));
}

export const asynchronousCommunicationUtilization: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allLinks = parameters.entity.getLinks.flat();
    return calculateRatioOfLinksToAsynchronousEndpoints(allLinks);
}

export const eventSourcingUtilizationMetric: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let serviceInteractions = getServiceInteractions(
        getIncludedComponents(parameters.entity, parameters.system),
        parameters.entity.getLinks.flat(),
        parameters.system
    );

    let numberOfEventSourcingConnections = [...serviceInteractions.asynchronousConnections.entries()]
        .filter(([connectionId, connection]) => {
            return EVENT_SOURCING_KIND.includes(connection.broker.getProperty("kind").value);
        })
        .map(([connectionId, connection]) => {
            return connection.in.size * connection.out.size;
        }).reduce((accumulator, currentValue) => { return accumulator + currentValue }, 0);

    if ((numberOfEventSourcingConnections + serviceInteractions.synchronousConnections.size) === 0) {
        return 0;
    }

    return numberOfEventSourcingConnections / (numberOfEventSourcingConnections + serviceInteractions.synchronousConnections.size);
}

export const ratioOfInfrastructureNodesThatSupportMonitoring: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let includedComponents = getIncludedComponents(parameters.entity, parameters.system).map(component => component.getId);


    let supportingInfrastructure = new Set<Infrastructure>();

    for (const [deploymentMappingId, deploymentMapping] of parameters.system.getDeploymentMappingEntities.entries()) {
        if (includedComponents.includes(deploymentMapping.getDeployedEntity.getId)) {
            supportingInfrastructure.add(deploymentMapping.getUnderlyingInfrastructure);
        }
    }

    if (supportingInfrastructure.size === 0) {
        return 0;
    }

    let numberOfInfrastructureNodesSupportingMonitoring = 0;

    supportingInfrastructure.forEach(infrastructure => {
        if (infrastructureSupportsMonitoring(infrastructure)) {
            numberOfInfrastructureNodesSupportingMonitoring++;
        }
    })

    return numberOfInfrastructureNodesSupportingMonitoring / supportingInfrastructure.size;
}

export const ratioOfComponentsThatSupportMonitoring: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let components = getIncludedComponents(parameters.entity, parameters.system);

    if (components.length === 0) {
        return 0;
    }

    let numberOfComponentsSupportingMonitoring = 0;

    for (const component of components) {
        if (componentSupportsMonitoring(component)) {
            numberOfComponentsSupportingMonitoring++;
        }
    }

    return numberOfComponentsSupportingMonitoring / components.length;
}

export const ratioOfServicesThatProvideHealthEndpoints: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let allServices = getIncludedComponents(parameters.entity, parameters.system).filter(component => component.constructor.name === Service.name);


    if (allServices.length === 0) {
        return 0;
    }

    let numberOfServicesWithHealthAndReadinessEndpoint = 0;

    for (const service of allServices) {
        if (providesHealthAndReadinessEndpoints(service)) {
            numberOfServicesWithHealthAndReadinessEndpoint++;
        }
    }

    return numberOfServicesWithHealthAndReadinessEndpoint / allServices.length;
}

export const distributedTracingSupport: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    // TODO also consider a proxy service that supports tracing and when a component is proxied by that proxy?

    let allTraceableComponents = getIncludedComponents(parameters.entity, parameters.system).filter((component) => {
        return component.constructor.name !== BackingService.name || component.getProperty("providedFunctionality").value !== "tracing";
    })

    let tracingServices = [...parameters.system.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && component.getProperty("providedFunctionality").value === "tracing";
    })

    if (allTraceableComponents.length === 0 || tracingServices.length === 0) {
        return 0;
    }

    let tracingEndpoints = new Set(tracingServices.flatMap(([componentId, component]) => {
        return component.getEndpointEntities.map(endpoint => endpoint.getId);
    }));

    return countComponentsConnectedToCertainEndpoints(allTraceableComponents, tracingEndpoints, parameters.system) / allTraceableComponents.length;
}

export const maximumNumberOfServicesWithinARequestTrace: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    return getIncludedComponents(parameters.entity, parameters.system).length;
}

export const databaseTypeUtilization: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let componentsPerStorage = new Map<string, Set<string>>();

    for (const link of parameters.entity.getLinks.flat()) {
        let targetComponent = parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId);
        if (targetComponent.constructor.name === StorageBackingService.name) {
            let storageId = targetComponent.getId;
            let callerId = link.getSourceEntity.getId;

            if (componentsPerStorage.has(storageId)) {
                componentsPerStorage.get(storageId).add(callerId);
            } else {
                let setOfComponents = new Set<string>();
                setOfComponents.add(callerId);
                componentsPerStorage.set(storageId, setOfComponents);
            }

        }
    }

    return [...componentsPerStorage.values()].filter(componentSet => componentSet.size === 1).length / componentsPerStorage.size;
}

export const serviceDiscoveryUsage: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allLinks = [...parameters.entity.getLinks.flat()];

    if (allLinks.length === 0) {
        return 0;
    }

    return calculateNumberOfLinksWithServiceDiscovery(allLinks) as number / allLinks.length;
}

export const serviceReplicationLevel: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedServiceIds = getIncludedComponents(parameters.entity, parameters.system).map(component => component.getId);

    let replicasPerService = calculateReplicasPerService(parameters.system);

    let replicasOfRequestTraceServices = [...replicasPerService.entries()]
    .filter(([serviceId, replicas]) => {
        return includedServiceIds.includes(serviceId);
    })
    .map(([serviceId, replicas]) => replicas);

    if (replicasOfRequestTraceServices.length === 0) {
        return "n/a";
    } else {
        return average(replicasOfRequestTraceServices);
    }
}

export const medianServiceReplication: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedServiceIds = getIncludedComponents(parameters.entity, parameters.system).map(component => component.getId);

    let replicasPerService = calculateReplicasPerService(parameters.system);

    let replicasOfRequestTraceServices = [...replicasPerService.entries()]
    .filter(([serviceId, replicas]) => {
        return includedServiceIds.includes(serviceId);
    })
    .map(([serviceId, replicas]) => replicas);

    if (replicasOfRequestTraceServices.length === 0) {
        return "n/a";
    } else {
        return median(replicasOfRequestTraceServices);
    }
}

export const smallestReplicationValue: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedServiceIds = getIncludedComponents(parameters.entity, parameters.system).map(component => component.getId);

    let replicasPerService = calculateReplicasPerService(parameters.system);

    let replicasOfRequestTraceServices = [...replicasPerService.entries()]
    .filter(([serviceId, replicas]) => {
        return includedServiceIds.includes(serviceId);
    })
    .map(([serviceId, replicas]) => replicas);

    if (replicasOfRequestTraceServices.length === 0) {
        return "n/a";
    } else {
        return lowest(replicasOfRequestTraceServices);
    }
}

export const storageReplicationLevel: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedServiceIds = getIncludedComponents(parameters.entity, parameters.system).map(component => component.getId);

    let replicasPerStorageService: Map<String, number> = new Map();
    for (const [id, deploymentMapping] of parameters.system.getDeploymentMappingEntities.entries()) {
        let deployedEntity = deploymentMapping.getDeployedEntity
        if (deployedEntity.constructor.name === StorageBackingService.name && includedServiceIds.includes(deployedEntity.getId)) {
            let noOfReplicas = deploymentMapping.getProperties().find(prop => prop.getKey === "replicas").value
            if (replicasPerStorageService.has(deployedEntity.getId)) {
                replicasPerStorageService.set(deployedEntity.getId, replicasPerStorageService.get(deployedEntity.getId) + noOfReplicas);
            } else {
                replicasPerStorageService.set(deployedEntity.getId, noOfReplicas);
            }
        }
    }

    if (replicasPerStorageService.size === 0) {
        return "n/a";
    } else {
        return average(
            Array.from(replicasPerStorageService.values())
        );
    }
}

export const numberOfAvailabilityZonesUsed: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let includedServiceIds = getIncludedComponents(parameters.entity, parameters.system).map(component => component.getId);

    let availabilityZones: Set<string> = new Set();

    for (const [id, deploymentMapping] of parameters.system.getDeploymentMappingEntities.entries()) {
        let deployedEntity = deploymentMapping.getDeployedEntity
        if (deployedEntity.constructor.name === Service.name && includedServiceIds.includes(deployedEntity.getId)) {

            let usedAvailabilityZones = (deploymentMapping.getUnderlyingInfrastructure.getProperty("availability_zone").value as string).split(",");
            usedAvailabilityZones.forEach(zoneId => availabilityZones.add(zoneId));
        }
    }

    return availabilityZones.size;
}

export const numberOfLinksWithRetryLogic: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allLinks = parameters.entity.getLinks.flat();

    // TODO also limit to endpoints which are safe/idempotent
    let linksToSynchronousEndpoints = allLinks.filter((link) => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value));

    if (linksToSynchronousEndpoints.length === 0) {
        return 0;
    }

    let linksWithRetryLogic = linksToSynchronousEndpoints.filter(link => link.getProperty("retries").value > 0);

    return linksWithRetryLogic.length;

}


export const numberOfLinksWithComplexFailover: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let allLinks = parameters.entity.getLinks.flat();

    // TODO also limit to endpoints which are safe/idempotent
    let linksToSynchronousEndpoints = allLinks.filter((link) => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value));

    if (linksToSynchronousEndpoints.length === 0) {
        return 0;
    }

    let linksWithCircuitBreaker = linksToSynchronousEndpoints.filter(link => link.getProperty("circuit_breaker").value !== "none");

    return linksWithCircuitBreaker.length;
}


export const requestTraceMeasureImplementations: { [measureKey: string]: Calculation } = {
    "ratioOfEndpointsSupportingSsl": ratioOfEndpointsSupportingSsl,
    "ratioOfSecuredLinks": ratioOfSecuredLinks,
    "requestTraceLength": requestTraceLength,
    "requestTraceComplexity": requestTraceComplexity,
    "numberOfCyclesInRequestTraces": numberOfCyclesInRequestTraces,
    "dataReplicationAlongRequestTrace": dataReplicationAlongRequestTrace,
    "ratioOfStateDependencyOfEndpoints": ratioOfStateDependencyOfEndpoints,
    "ratioOfStatefulComponents": ratioOfStatefulComponents,
    "ratioOfStatelessComponents": ratioOfStatelessComponents,
    "asynchronousCommunicationUtilization": asynchronousCommunicationUtilization,
    "eventSourcingUtilizationMetric": eventSourcingUtilizationMetric,
    "ratioOfInfrastructureNodesThatSupportMonitoring": ratioOfInfrastructureNodesThatSupportMonitoring,
    "ratioOfComponentsThatSupportMonitoring": ratioOfComponentsThatSupportMonitoring,
    "distributedTracingSupport": distributedTracingSupport,
    "ratioOfServicesThatProvideHealthEndpoints": ratioOfServicesThatProvideHealthEndpoints,
    "maximumNumberOfServicesWithinARequestTrace": maximumNumberOfServicesWithinARequestTrace,
    "databaseTypeUtilization": databaseTypeUtilization,
    "serviceDiscoveryUsage": serviceDiscoveryUsage,
    "serviceReplicationLevel": serviceReplicationLevel,
    "medianServiceReplication": medianServiceReplication,
    "smallestReplicationValue": smallestReplicationValue,
    "storageReplicationLevel": storageReplicationLevel,
    "numberOfAvailabilityZonesUsed": numberOfAvailabilityZonesUsed,
    "numberOfLinksWithRetryLogic": numberOfLinksWithRetryLogic,
    "numberOfLinksWithComplexFailover": numberOfLinksWithComplexFailover
}

