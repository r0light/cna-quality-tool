import { BackingService, BrokerBackingService, Component, DeploymentMapping, Infrastructure, Link, ProxyBackingService, Service, StorageBackingService, System } from "@/core/entities";
import { Calculation, CalculationParameters, MeasureValue } from "../../quamoco/Measure";
import { average, median, lowest, partition } from "./general-functions";
import { ASYNCHRONOUS_ENDPOINT_KIND, AUTOMATED_INFRASTRUCTURE_MAINTENANCE, AUTOMATED_RESTART_POLICIES, AUTOMATED_SCALING, BACKING_DATA_CONFIG_KIND, BACKING_DATA_LOGS_KIND, BACKING_DATA_METRICS_KIND, BACKING_DATA_SECRET_KIND, CONFIG_SERVICE_KIND, CONTRACT_ARTIFACT_TYPE, CUSTOM_SOFTWARE_TYPE, DATA_USAGE_RELATION_PERSISTENCE, DATA_USAGE_RELATION_USAGE, DYNAMIC_INFRASTRUCTURE, EVENT_SOURCING_KIND, getEndpointKindWeight, getUsageRelationWeight, IAC_ARTIFACT_TYPE, MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS, MESSAGE_BROKER_KIND, PROTOCOLS_SUPPORTING_TLS, ROLLING_UPDATE_STRATEGY_OPTIONS, SEND_EVENT_ENDPOINT_KIND, SERVICE_MESH_KIND, SUBSCRIBE_ENDPOINT_KIND, SYNCHRONOUS_ENDPOINT_KIND, VAULT_KIND } from "../../specifications/featureModel";
import { calculateRatioOfEndpointsSupportingSsl, calculateRatioOfExternalEndpointsSupportingTls, componentMeasureImplementations, numberOfAsynchronousEndpointsOfferedByAService, numberOfComponentsAComponentIsLinkedTo, numberOfSynchronousEndpointsOfferedByAService, providesHealthAndReadinessEndpoints, serviceCouplingBasedOnEndpointEntropy } from "./componentMeasures";
import { getIncludedComponents, numberOfCyclesInRequestTraces, requestTraceComplexity } from "./requestTraceMeasures";
import { supportsMonitoring as infrastructureSupportsMonitoring, ratioOfAutomaticallyProvisionedInfrastructure as infrastructureProvisionedAutomatically, ratioOfFullyManagedInfrastructure as infrastructureIsFullyManaged, nonProviderSpecificInfrastructureArtifacts as infrastructureHasOnlyNonProviderSpecificArtifacts } from "./infrastructureMeasures";
import { supportsMonitoring as componentSupportsMonitoring, nonProviderSpecificComponentArtifacts as componentHasOnlyNonProviderSpecificArtifacts } from "./componentMeasures";
import { serviceMeshUsage as componentServiceMeshUsage, namespaceSeparation as componentNamespaceSeparation } from "./componentMeasures";
import { map } from "jquery";
import { Artifact } from "@/core/common/artifact";


export const countComponentsConnectedToCertainEndpoints: (components: Component[], endpointIds: Set<string>, system: System) => number = (components, endpointIds, system) => {

    let numberOfComponentsConnected = 0;

    for (const component of components) {
        let targetedEndpoints = new Set(system.getOutgoingLinksOfComponent(component.getId).map(link => link.getTargetEndpoint.getId));
        if (targetedEndpoints.intersection(endpointIds).size > 0) {
            numberOfComponentsConnected++;
        }
    }

    return numberOfComponentsConnected;
}


export const calculateReplicasPerService: (system: System) => Map<string, number> = (system) => {

    let replicasPerService: Map<string, number> = new Map();
    for (const [id, deploymentMapping] of system.getDeploymentMappingEntities.entries()) {
        let deployedEntity = deploymentMapping.getDeployedEntity
        if (deployedEntity.constructor.name === Service.name) {
            let noOfReplicas = deploymentMapping.getProperties().find(prop => prop.getKey === "replicas").value
            if (replicasPerService.has(deployedEntity.getId)) {
                replicasPerService.set(deployedEntity.getId, replicasPerService.get(deployedEntity.getId) + noOfReplicas);
            } else {
                replicasPerService.set(deployedEntity.getId, noOfReplicas);
            }
        }
    }
    return replicasPerService;
}


export const serviceReplicationLevel: Calculation = (parameters: CalculationParameters<System>) => {

    let replicasPerService = calculateReplicasPerService(parameters.system);

    if (replicasPerService.size === 0) {
        return "n/a";
    } else {
        return average(
            Array.from(replicasPerService.values())
        );
    }
}

export const medianServiceReplication: Calculation = (parameters: CalculationParameters<System>) => {
    let replicasPerService = calculateReplicasPerService(parameters.system);

    if (replicasPerService.size === 0) {
        return "n/a";
    } else {
        return median(
            Array.from(replicasPerService.values())
        );
    }
}

export const smallestReplicationValue: Calculation = (parameters: CalculationParameters<System>) => {
    let replicasPerService = calculateReplicasPerService(parameters.system);

    if (replicasPerService.size === 0) {
        return "n/a";
    } else {
        return lowest(
            Array.from(replicasPerService.values())
        );
    }

}

export const storageReplicationLevel: Calculation = (parameters: CalculationParameters<System>) => {
    let replicasPerStorageService: Map<String, number> = new Map();
    for (const [id, deploymentMapping] of parameters.entity.getDeploymentMappingEntities.entries()) {
        let deployedEntity = deploymentMapping.getDeployedEntity
        if (deployedEntity.constructor.name === StorageBackingService.name) {
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

export const externallyAvailableEndpoints: Calculation = (parameters: CalculationParameters<System>) => {
    return [...parameters.entity.getComponentEntities.entries()].map(entry => entry[1].getExternalEndpointEntities.length).reduce((e1, e2) => e1 + e2, 0);
}

export const dataShardingLevel: Calculation = (parameters: CalculationParameters<System>) => {
    let storageBackingServices = [...parameters.entity.getComponentEntities.entries()]
        .map(entry => entry[1])
        .filter(entity => entity.constructor.name === StorageBackingService.name);
    if (storageBackingServices.length === 0) {
        return "n/a";
    } else {
        return average(storageBackingServices
            .map(storageService => storageService.getProperties()
                .find(prop => prop.getKey === "shards").value)
        );
    }
}

export const ratioOfEndpointsSupportingSsl: Calculation = (parameters: CalculationParameters<System>) => {
    let allEndpoints = [...parameters.entity.getComponentEntities.entries()].flatMap(entry => entry[1].getEndpointEntities.concat(entry[1].getExternalEndpointEntities));
    return calculateRatioOfEndpointsSupportingSsl(allEndpoints);
}

export const ratioOfExternalEndpointsSupportingTls: Calculation = (parameters: CalculationParameters<System>) => {
    let allExternalEndpoints = [...parameters.entity.getComponentEntities.entries()].flatMap(entry => entry[1].getExternalEndpointEntities);
    return calculateRatioOfExternalEndpointsSupportingTls(allExternalEndpoints);
}

export const calculateRatioOfSecuredLinks: (allLinks: Link[]) => MeasureValue = (allLinks) => {
    let linksConnectedToSecureEndpoints = allLinks.filter(link => {
        let protocol = link.getTargetEndpoint.getProperties().find(property => property.getKey === "protocol").value;
        return PROTOCOLS_SUPPORTING_TLS.includes(protocol);
    }).length

    if (allLinks.length === 0) {
        return "n/a";
    }

    return linksConnectedToSecureEndpoints / allLinks.length;
}

export const ratioOfSecuredLinks: Calculation = (parameters: CalculationParameters<System>) => {
    let allLinks = [...parameters.entity.getLinkEntities.entries()].map(link => link[1]);
    return calculateRatioOfSecuredLinks(allLinks);
}

export const dataAggregateScope: Calculation = (parameters: CalculationParameters<System>) => {
    return [...parameters.entity.getDataAggregateEntities.keys()].length;
}

export const calculateRatioOfStatefulComponents: (allComponents: Component[]) => MeasureValue = (allComponents) => {
    let numberOfStatefulComponents = allComponents.filter(entry => !(entry.getProperties().find(property => property.getKey === "stateless").value)).length;

    if (allComponents.length === 0) {
        return "n/a";
    }
    return numberOfStatefulComponents / allComponents.length;

}

export const ratioOfStatefulComponents: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = [...parameters.entity.getComponentEntities.values()];
    return calculateRatioOfStatefulComponents(allComponents);
}

export const calculateRatioOfStatelessComponents: (allComponents: Component[]) => MeasureValue = (allComponents) => {
    let numberOfStatelessComponents = allComponents.filter(entry => (entry.getProperties().find(property => property.getKey === "stateless").value)).length;

    if (allComponents.length === 0) {
        return "n/a";
    }
    return numberOfStatelessComponents / allComponents.length;
}

export const ratioOfStatelessComponents: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = [...parameters.entity.getComponentEntities.values()];
    return calculateRatioOfStatelessComponents(allComponents)
}

export const degreeToWhichComponentsAreLinkedToStatefulComponents: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    if (allComponents.length === 0) {
        return "n/a";
    }

    let totalNumberOfConnectionsToStatefulComponents = 0;
    for (const component of allComponents) {
        let connectedToStatefulComponents = new Set<string>();
        for (const link of parameters.entity.getOutgoingLinksOfComponent(component[0])) {

            let connectedToComponent = parameters.entity.searchComponentOfEndpoint(link.getTargetEndpoint.getId)
            if (!connectedToComponent.getProperty("stateless").value) {
                connectedToStatefulComponents.add(connectedToComponent.getId);
            }
        }
        totalNumberOfConnectionsToStatefulComponents = totalNumberOfConnectionsToStatefulComponents + connectedToStatefulComponents.size;
    }
    return totalNumberOfConnectionsToStatefulComponents / allComponents.length;
}

export const degreeOfAsynchronousCommunication: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    if (allComponents.length === 0) {
        return "n/a";
    }

    let degreesOfAsynchronousEndpoints: number[] = [];

    for (const [componentId, component] of allComponents) {
        let allEndpoints = component.getEndpointEntities.concat(component.getExternalEndpointEntities);
        if (allEndpoints.length === 0) {
            continue;
        }
        let numberOfAsynchronousEndpoints = allEndpoints.filter(endpoint => ASYNCHRONOUS_ENDPOINT_KIND.includes(endpoint.getProperty("kind").value)).length;
        degreesOfAsynchronousEndpoints.push(numberOfAsynchronousEndpoints / allEndpoints.length);
    }

    return average(degreesOfAsynchronousEndpoints);
}

export const calculateRatioOfLinksToAsynchronousEndpoints: (allLinks: Link[]) => MeasureValue = (allLinks) => {

    if (allLinks.length === 0) {
        return "n/a";
    }

    let numberOfLinksToAnAsynchronousEndpoint = 0;
    for (const link of allLinks) {
        if (ASYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value)) {
            numberOfLinksToAnAsynchronousEndpoint++;
        }
    }

    return numberOfLinksToAnAsynchronousEndpoint / allLinks.length;
}

export const asynchronousCommunicationUtilization: Calculation = (parameters: CalculationParameters<System>) => {

    let allLinks = [...parameters.entity.getLinkEntities.values()];
    return calculateRatioOfLinksToAsynchronousEndpoints(allLinks);
}

export const ratioOfServicesThatProvideHealthEndpoints: Calculation = (parameters: CalculationParameters<System>) => {

    let allServices = [...parameters.entity.getComponentEntities.entries()]
        .map(entry => entry[1])
        .filter(entity => entity.constructor.name === Service.name);

    if (allServices.length === 0) {
        return "n/a";
    }

    let numberOfServicesWithHealthAndReadinessEndpoint = 0;

    for (const service of allServices) {
        if (providesHealthAndReadinessEndpoints(service)) {
            numberOfServicesWithHealthAndReadinessEndpoint++;
        }
    }

    return numberOfServicesWithHealthAndReadinessEndpoint / allServices.length;
}

export const couplingDegreeBasedOnPotentialCoupling: Calculation = (parameters: CalculationParameters<System>) => {

    let allComponents = [...parameters.entity.getComponentEntities.entries()].map(entry => entry[0]);

    // the system has to have at least three components for this measure to make sense, because otherwise max-min is 0.
    if (allComponents.length < 3) {
        return "n/a";
    }

    let shortestPaths = new Map<string, Map<string, number>>();
    let pathSum = 0;

    for (const componentId of allComponents) {
        for (const otherComponentId of allComponents.filter(id => id !== componentId)) {
            let shortestPath = parameters.entity.getShortestPathLength(componentId, otherComponentId);

            if (shortestPaths.has(componentId)) {
                shortestPaths.get(componentId).set(otherComponentId, shortestPath);
            } else {
                let newMap = new Map<string, number>();
                newMap.set(otherComponentId, shortestPath);
                shortestPaths.set(componentId, newMap);
            }
            pathSum += shortestPath;
        }
    }

    // hypothetical sum of all paths, if no connections between components exist
    let max = allComponents.length * (allComponents.length - 1) * (allComponents.length - 1);

    // hypothetical sum of all paths, if each component had a connection to each other component
    let min = allComponents.length * (allComponents.length - 1)

    return ((max - pathSum) / (max - min));
}

export const interactionDensityBasedOnComponents: Calculation = (parameters: CalculationParameters<System>) => {

    let numberOfComponents = parameters.entity.getComponentEntities.size;

    if (numberOfComponents === 0) {
        return "n/a";
    }

    return parameters.entity.getLinkEntities.size / numberOfComponents;
}

export const interactionDensityBasedOnLinks: Calculation = (parameters: CalculationParameters<System>) => {

    let maximumPotentialNumberOfLinks = parameters.entity.getComponentEntities.size * (parameters.entity.getComponentEntities.size - 1) * (parameters.entity.getComponentEntities.size - 1);

    if (maximumPotentialNumberOfLinks === 0) {
        return 0;
    }

    return parameters.entity.getLinkEntities.size / maximumPotentialNumberOfLinks;
}

export const systemCouplingBasedOnEndpointEntropy: Calculation = (parameters: CalculationParameters<System>) => {

    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    let cumulativeCoupling = 0;
    for (const [componentId, component] of allComponents) {
        let coupling = serviceCouplingBasedOnEndpointEntropy({ entity: component, system: parameters.system });
        cumulativeCoupling += coupling === "n/a" ? 0 : coupling as number;
    }

    return cumulativeCoupling;

}


export const servicesInterdependenceInTheSystem: Calculation = (parameters: CalculationParameters<System>) => {

    let allLinks = [...parameters.entity.getLinkEntities.entries()];

    // tracl pairs of services, if a link exists between two services and entry is added which has a unique id for this pair and the set stores the source service of links.
    // Thus, if a pair has two entries in the set in the end, there exists a bi-directional connection for this pair
    let componentPairs = new Map<string, Set<string>>();

    for (const [linkId, link] of allLinks) {
        let from = link.getSourceEntity;
        let to = parameters.entity.searchComponentOfEndpoint(link.getTargetEndpoint.getId);
        if (from.constructor.name === Service.name && to.constructor.name === Service.name) {
            let connectionId = [from.getId, to.getId].sort().join("");
            if (componentPairs.has(connectionId)) {
                componentPairs.get(connectionId).add(from.getId);
            } else {
                let set: Set<string> = new Set();
                set.add(from.getId);
                componentPairs.set(connectionId, set);
            }
        }
    }

    return [...componentPairs.entries()].map(pair => pair[1].size).filter(size => size === 2).length;
}

export const aggregateSystemMetricToMeasureServiceCoupling: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    let sum = 0;
    for (const [componentId, component] of allComponents) {
        let numberOfComponentsAComponentIsLinkedToValue = numberOfComponentsAComponentIsLinkedTo({ entity: component, system: parameters.system })
        sum += numberOfComponentsAComponentIsLinkedToValue as number;
    }

    return sum / (allComponents.length * (allComponents.length - 1));
}

export const degreeOfCouplingInASystem: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    let sum = 0;
    for (const [componentId, component] of allComponents) {
        let numberOfComponentsAComponentIsLinkedToValue = numberOfComponentsAComponentIsLinkedTo({ entity: component, system: parameters.system })
        sum += numberOfComponentsAComponentIsLinkedToValue as number;
    }

    return sum / (Math.pow(allComponents.length, 2) - allComponents.length);

}

export const simpleDegreeOfCouplingInASystem: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    let sum = 0;
    for (const [componentId, component] of allComponents) {
        let numberOfComponentsAComponentIsLinkedToValue = numberOfComponentsAComponentIsLinkedTo({ entity: component, system: parameters.system })
        sum += numberOfComponentsAComponentIsLinkedToValue as number;
    }

    return sum / allComponents.length;
}


export const directServiceSharing: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    let servicesUsedBy = new Map<string, Set<string>>();
    let endpointsUsedBy = new Map<string, Set<string>>();

    for (const [linkId, link] of parameters.entity.getLinkEntities.entries()) {
        let targetServiceId = parameters.entity.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId;

        if (servicesUsedBy.has(targetServiceId)) {
            servicesUsedBy.get(targetServiceId).add(link.getSourceEntity.getId);
        } else {
            let setOfServices = new Set<string>();
            setOfServices.add(link.getSourceEntity.getId);
            servicesUsedBy.set(targetServiceId, setOfServices);
        }

        if (endpointsUsedBy.has(link.getTargetEndpoint.getId)) {
            endpointsUsedBy.get(link.getTargetEndpoint.getId).add(link.getSourceEntity.getId);
        } else {
            let setOfServices = new Set<string>();
            setOfServices.add(link.getSourceEntity.getId);
            endpointsUsedBy.set(link.getTargetEndpoint.getId, setOfServices);
        }
    }

    let numberOfSharedServices = [...servicesUsedBy.entries()]
        .filter(serviceUsedBy => serviceUsedBy[1].size >= 2).length;

    let numberOfSharedEndpoints = [...endpointsUsedBy.entries()]
        .filter(endpointUsedBy => endpointUsedBy[1].size >= 2).length;

    return (((numberOfSharedServices / allComponents.length) + (numberOfSharedEndpoints / parameters.entity.getLinkEntities.size)) / 2);
}

export const transitivelySharedServices: Calculation = (parameters: CalculationParameters<System>) => {
    // TODO better rely on request traces?

    let allComponents = [...parameters.entity.getComponentEntities.entries()];
    let componentsWithIncomingLinks: string[] = [];

    for (const [componentId, component] of allComponents) {
        let incomingLinks = parameters.entity.getIncomingLinksOfComponent(componentId);
        if (incomingLinks.length > 0) {
            componentsWithIncomingLinks.push(componentId);
        }
    }

    let transitivelySharedComponents: Set<string> = new Set<string>();
    let transitivelySharedEndpoints: Set<string> = new Set<string>();

    for (const [componentId, component] of allComponents) {
        let incomingLinks = parameters.entity.getIncomingLinksOfComponent(componentId);
        for (const link of incomingLinks) {
            let consumerId = link.getSourceEntity.getId;
            if (componentsWithIncomingLinks.includes(consumerId) && consumerId !== componentId) {
                transitivelySharedEndpoints.add(link.getTargetEndpoint.getId);
                transitivelySharedComponents.add(componentId);
            }
        }
    }

    return ((transitivelySharedComponents.size / allComponents.length) + (transitivelySharedEndpoints.size / parameters.entity.getLinkEntities.size)) / 2
}


export const ratioOfSharedNonExternalComponentsToNonExternalComponents: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    if (allComponents.length === 0) {
        return "n/a";
    }

    let servicesUsedBy = new Map<string, Set<string>>();
    let endpointsUsedBy = new Map<string, Set<string>>();

    for (const [linkId, link] of parameters.entity.getLinkEntities.entries()) {
        let targetServiceId = parameters.entity.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId;

        if (servicesUsedBy.has(targetServiceId)) {
            servicesUsedBy.get(targetServiceId).add(link.getSourceEntity.getId);
        } else {
            let setOfServices = new Set<string>();
            setOfServices.add(link.getSourceEntity.getId);
            servicesUsedBy.set(targetServiceId, setOfServices);
        }

        if (endpointsUsedBy.has(link.getTargetEndpoint.getId)) {
            endpointsUsedBy.get(link.getTargetEndpoint.getId).add(link.getSourceEntity.getId);
        } else {
            let setOfServices = new Set<string>();
            setOfServices.add(link.getSourceEntity.getId);
            endpointsUsedBy.set(link.getTargetEndpoint.getId, setOfServices);
        }
    }

    let numberOfSharedServices = [...servicesUsedBy.entries()]
        .filter(serviceUsedBy => serviceUsedBy[1].size >= 2).length;

    return numberOfSharedServices / allComponents.length;


}

export const ratioOfSharedDependenciesOfNonExternalComponentsToPossibleDependencies: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    if (allComponents.length === 0) {
        return "n/a";
    }

    let servicesUsedBy = new Map<string, Set<string>>();
    let endpointsUsedBy = new Map<string, Set<string>>();

    for (const [linkId, link] of parameters.entity.getLinkEntities.entries()) {
        let targetServiceId = parameters.entity.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId;

        if (servicesUsedBy.has(targetServiceId)) {
            servicesUsedBy.get(targetServiceId).add(link.getSourceEntity.getId);
        } else {
            let setOfServices = new Set<string>();
            setOfServices.add(link.getSourceEntity.getId);
            servicesUsedBy.set(targetServiceId, setOfServices);
        }

        if (endpointsUsedBy.has(link.getTargetEndpoint.getId)) {
            endpointsUsedBy.get(link.getTargetEndpoint.getId).add(link.getSourceEntity.getId);
        } else {
            let setOfServices = new Set<string>();
            setOfServices.add(link.getSourceEntity.getId);
            endpointsUsedBy.set(link.getTargetEndpoint.getId, setOfServices);
        }
    }

    let sumOfServiceDependencyTuples = [...servicesUsedBy.entries()].map(entry => {
        let dependents = entry[1];
        if (dependents.size >= 2) {
            return dependents.size * (dependents.size - 1) // sum of "dependency relationships" from one of the dependent services considering the dependency and the other components which share this dependeny
        }
        return 0;
    }).reduce((accumulator, current) => accumulator + current, 0);


    return sumOfServiceDependencyTuples / Math.pow(allComponents.length, 2);
}

export const averageSystemCoupling: Calculation = (parameters: CalculationParameters<System>) => {

    if (parameters.entity.getComponentEntities.size === 0) {
        return "n/a";
    }

    let allLinks = [...parameters.entity.getLinkEntities.entries()];

    let sumOfLinkWeights = 0;

    for (const [linkId, link] of allLinks) {
        let linkWeight = getEndpointKindWeight(link.getTargetEndpoint.getProperty("kind").value);
        let entityUsageWeight = average(link.getTargetEndpoint.getDataAggregateEntities.map(entity => getUsageRelationWeight(entity.relation.getProperty("usage_relation").value)));
        sumOfLinkWeights += linkWeight + entityUsageWeight;
    }

    return sumOfLinkWeights / parameters.entity.getComponentEntities.size;
}

export const numberOfSynchronousCycles: Calculation = (parameters: CalculationParameters<System>) => {
    let cycles: Set<string>[] = [];

    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    for (let [componentId, component] of allComponents) {
        let pathsToSearch = parameters.entity.getOutgoingLinksOfComponent(componentId)
            .filter(link => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value))
            .map(link => [link]); // a path is an array of links
        let linksVisited: string[] = [];

        while (pathsToSearch.length > 0) {
            let currentPath = pathsToSearch[0];
            let nextLink = currentPath[currentPath.length - 1]; // next link is always the last of an array of links
            if (linksVisited.includes(nextLink.getId)) {
                pathsToSearch.splice(0, 1);
                continue;
            }

            let targetComponentId = parameters.entity.searchComponentOfEndpoint(nextLink.getTargetEndpoint.getId).getId;
            if (targetComponentId === componentId) {
                // cycle found!
                let cycle = new Set(currentPath.map(link => link.getId));
                // add it, if it has not already been detected
                if (!cycles.find(foundCycle => foundCycle.symmetricDifference(cycle).size === 0)) {
                    cycles.push(cycle);
                }
            }
            parameters.entity.getOutgoingLinksOfComponent(targetComponentId)
                .filter(link => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value))
                .forEach(link => {
                    pathsToSearch.push(currentPath.concat(link));
                })

            linksVisited.push(nextLink.getId);
            pathsToSearch.splice(0, 1);
        }
    }
    return cycles.length;
}

export const densityOfAggregation: Calculation = (parameters: CalculationParameters<System>) => {
    let aggregators = [...parameters.entity.getComponentEntities.entries()].filter(component => parameters.entity.getOutgoingLinksOfComponent(component[1].getId).length > 0 && parameters.entity.getIncomingLinksOfComponent(component[1].getId).length > 0);

    let sum = 0;

    for (const [aggregatorId, aggregator] of aggregators) {
        sum += Math.log(parameters.entity.getOutgoingLinksOfComponent(aggregatorId).length / (parameters.entity.getOutgoingLinksOfComponent(aggregatorId).length + parameters.entity.getIncomingLinksOfComponent(aggregatorId).length) * 2);
    }

    return sum;
}

export const dataAggregateConvergenceAcrossComponents: Calculation = (parameters: CalculationParameters<System>) => {

    let allDataAggregates = parameters.entity.getDataAggregateEntities;
    let dataAggregateUsedBy = new Map<string, Set<string>>();
    allDataAggregates.forEach(dataAggregate => {
        dataAggregateUsedBy.set(dataAggregate.getId, new Set());
    })

    let allComponents = parameters.entity.getComponentEntities;

    if (allDataAggregates.size === 0 || allComponents.size === 0) {
        return "n/a";
    }

    let sumOfDataAggregatesUsed = 0;

    for (const [componentId, component] of allComponents.entries()) {
        let usedDataAggregates = component.getDataAggregateEntities;
        usedDataAggregates.forEach(dataAggregateUsed => {
            dataAggregateUsedBy.get(dataAggregateUsed.data.getId).add(componentId);
        })
        sumOfDataAggregatesUsed += usedDataAggregates.length;
    }

    let sumOfServicesInWhichDataAggregatesAreUsed = 0;

    for (const [dataAggregateId, servicesUsingIt] of dataAggregateUsedBy.entries()) {
        sumOfServicesInWhichDataAggregatesAreUsed += servicesUsingIt.size;
    }

    return (sumOfDataAggregatesUsed / allComponents.size) + (sumOfServicesInWhichDataAggregatesAreUsed / allDataAggregates.size)
}

export const ratioOfCyclicRequestTraces: Calculation = (parameters: CalculationParameters<System>) => {
    let allRequestTraces = parameters.entity.getRequestTraceEntities;

    let numberOfCycles = 0;

    for (const [requestTraceId, requestTrace] of allRequestTraces) {
        if (numberOfCyclesInRequestTraces({ entity: requestTrace, system: parameters.system }) as number > 0) {
            numberOfCycles += 1;
        }
    }

    return numberOfCycles / allRequestTraces.size;
}

export const numberOfPotentialCyclesInASystem: Calculation = (parameters: CalculationParameters<System>) => {
    let cycles: Set<string>[] = [];

    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    if (allComponents.length === 0) {
        return "n/a";
    }

    for (let [componentId, component] of allComponents) {
        let pathsToSearch = parameters.entity.getOutgoingLinksOfComponent(componentId)
            .map(link => [link]); // a path is an array of links
        let linksVisited: string[] = [];

        while (pathsToSearch.length > 0) {
            let currentPath = pathsToSearch[0];
            let nextLink = currentPath[currentPath.length - 1]; // next link is always the last of an array of links
            if (linksVisited.includes(nextLink.getId)) {
                pathsToSearch.splice(0, 1);
                continue;
            }

            let targetComponentId = parameters.entity.searchComponentOfEndpoint(nextLink.getTargetEndpoint.getId).getId;
            if (targetComponentId === componentId) {
                // cycle found!
                let cycle = new Set(currentPath.map(link => link.getId));
                // add it, if it has not already been detected
                if (!cycles.find(foundCycle => foundCycle.symmetricDifference(cycle).size === 0)) {
                    cycles.push(cycle);
                }
            }
            parameters.entity.getOutgoingLinksOfComponent(targetComponentId)
                .forEach(link => {
                    pathsToSearch.push(currentPath.concat(link));
                })

            linksVisited.push(nextLink.getId);
            pathsToSearch.splice(0, 1);
        }
    }
    return cycles.length;
}

export const maximumLengthOfServiceLinkChainPerRequestTrace: Calculation = (parameters: CalculationParameters<System>) => {
    let allRequestTraces = [...parameters.entity.getRequestTraceEntities.entries()].map(requestTrace => requestTrace[1]);

    if (allRequestTraces.length === 0) {
        return "n/a";
    }

    return Math.max(...allRequestTraces.map(requestTrace => requestTrace.getLinks.length));
}

export const maximumNumberOfServicesWithinARequestTrace: Calculation = (parameters: CalculationParameters<System>) => {
    let allRequestTraces = [...parameters.entity.getRequestTraceEntities.entries()].map(requestTrace => requestTrace[1]);

    if (allRequestTraces.length === 0) {
        return "n/a";
    }

    return Math.max(...allRequestTraces.map(requestTrace => {
        let nodes = [...requestTrace.getLinks].flatMap(traceIndex => traceIndex.map(link => [link.getSourceEntity, parameters.entity.searchComponentOfEndpoint(link.getTargetEndpoint.getId)]).flatMap(components => components.map(component => component.getId)));
        return new Set(nodes).size;
    }));
}

export const databaseTypeUtilization: Calculation = (parameters: CalculationParameters<System>) => {

    let componentsPerStorage = new Map<string, Set<string>>();

    if (parameters.entity.getLinkEntities.size === 0) {
        return "n/a";
    }

    for (const [linkId, link] of parameters.entity.getLinkEntities) {
        let targetComponent = parameters.entity.searchComponentOfEndpoint(link.getTargetEndpoint.getId);
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

export const averageNumberOfEndpointsPerService: Calculation = (parameters: CalculationParameters<System>) => {

    let allComponents = parameters.entity.getComponentEntities;

    if (allComponents.size === 0) {
        return "n/a";
    }

    let allEndpointIds: string[] = [];

    for (const [componentId, component] of allComponents) {
        allEndpointIds.push(...component.getEndpointEntities.concat(component.getExternalEndpointEntities).map(endpoint => endpoint.getId));
    }

    return allEndpointIds.length / allComponents.size;
}

export const numberOfComponents: Calculation = (parameters: CalculationParameters<System>) => {
    return parameters.entity.getComponentEntities.size;
}

export const ratioOfProviderManagedComponentsAndInfrastructure: Calculation = (parameters: CalculationParameters<System>) => {

    let allComponents = parameters.entity.getComponentEntities;

    let allInfrastructure = parameters.entity.getInfrastructureEntities;

    if (allComponents.size === 0 && allInfrastructure.size === 0) {
        return "n/a";
    }

    let numberOfManagedComponents = [...allComponents.entries()].filter(component => component[1].getProperty("managed").value).reduce((accumulator, current) => accumulator + 1, 0);

    let numberOfManagedInfrastructure = [...allInfrastructure.entries()].filter(infrastructure => MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS.includes(infrastructure[1].getProperty("environment_access").value)).reduce((accumulator, current) => accumulator + 1, 0);

    return (numberOfManagedComponents + numberOfManagedInfrastructure) / (allComponents.size + allInfrastructure.size);
}

export const componentDensity: Calculation = (parameters: CalculationParameters<System>) => {

    let allDeploymentMappings = parameters.entity.getDeploymentMappingEntities;

    if (allDeploymentMappings.size === 0) {
        return "n/a";
    }

    let allComponents = parameters.entity.getComponentEntities;

    let allInfrastructure = parameters.entity.getInfrastructureEntities;

    let deployedEntityIds: string[] = [];
    let usedInfrastructureIds: string[] = [];

    parameters.entity.getDeploymentMappingEntities.forEach((deploymentMapping, id) => {
        if (deploymentMapping.getDeployedEntity.constructor.name === Infrastructure.name) {
            // ignore deployment mappings of infrastructure on infrastructure
        } else {
            deployedEntityIds.push(deploymentMapping.getDeployedEntity.getId);
            usedInfrastructureIds.push(deploymentMapping.getUnderlyingInfrastructure.getId);
        }
    })

    return [...allComponents.entries()].filter(component => deployedEntityIds.includes(component[0])).reduce((accumulator, current) => accumulator + 1, 0) /
        [...allInfrastructure.entries()].filter(infrastructure => usedInfrastructureIds.includes(infrastructure[0])).reduce((accumulator, current) => accumulator + 1, 0);
}

export const numberOfAvailabilityZonesUsed: Calculation = (parameters: CalculationParameters<System>) => {

    let availabilityZones: Set<string> = new Set();

    if (parameters.entity.getInfrastructureEntities.size === 0) {
        return "n/a";
    }

    [...parameters.entity.getInfrastructureEntities.entries()].forEach(([infrastructureId, infrastructure]) => {
        let usedAvailabilityZones = (infrastructure.getProperty("availability_zone").value as string).split(",");
        usedAvailabilityZones.forEach(zoneId => availabilityZones.add(zoneId));
    });

    return availabilityZones.size;
}


export const rollingUpdateOption: Calculation = (parameters: CalculationParameters<System>) => {
    let infrastructureDeployingComponents: Map<string, Infrastructure> = new Map();

    for (const [deploymentMappingId, deploymentMapping] of parameters.entity.getDeploymentMappingEntities) {
        if (deploymentMapping.getDeployedEntity.constructor.name !== Infrastructure.name) {
            infrastructureDeployingComponents.set(deploymentMapping.getUnderlyingInfrastructure.getId, deploymentMapping.getUnderlyingInfrastructure);
        }
    }

    if (infrastructureDeployingComponents.size === 0) {
        return "n/a";
    }

    let infrastructureEnablingRollingUpdates = [...infrastructureDeployingComponents.entries()].filter(infrastructure => infrastructure[1].getProperty("supported_update_strategies").value.some(strategy => ROLLING_UPDATE_STRATEGY_OPTIONS.includes(strategy))).map(infrastructure => infrastructure[1]);

    return infrastructureEnablingRollingUpdates.length / infrastructureDeployingComponents.size;
}

export const numberOfLinksWithRetryLogic: Calculation = (parameters: CalculationParameters<System>) => {

    // TODO also limit to endpoints which are safe/idempotent
    let linksToSynchronousEndpoints = [...parameters.entity.getLinkEntities.entries()].filter(([linkId, link]) => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value)).map(([linkId, link]) => link);

    if (linksToSynchronousEndpoints.length === 0) {
        return "n/a";
    }

    let linksWithRetryLogic = linksToSynchronousEndpoints.filter(link => link.getProperty("retries").value > 0);

    return linksWithRetryLogic.length / linksToSynchronousEndpoints.length;

}

export const numberOfLinksWithComplexFailover: Calculation = (parameters: CalculationParameters<System>) => {
    // TODO also limit to endpoints which are safe/idempotent
    let linksToSynchronousEndpoints = [...parameters.entity.getLinkEntities.entries()].filter(([linkId, link]) => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value)).map(([linkId, link]) => link);

    if (linksToSynchronousEndpoints.length === 0) {
        return "n/a";
    }

    let linksWithCircuitBreaker = linksToSynchronousEndpoints.filter(link => link.getProperty("circuit_breaker").value !== "none");

    return linksWithCircuitBreaker.length / linksToSynchronousEndpoints.length;
}

export const totalNumberOfComponents: Calculation = (parameters: CalculationParameters<System>) => {
    return parameters.entity.getComponentEntities.size;
}

export const numberOfServices: Calculation = (parameters: CalculationParameters<System>) => {
    return [...parameters.entity.getComponentEntities.entries()].filter(([componentId, component]) => component.constructor.name === Service.name).length;
}

export const numberOfBackingServices: Calculation = (parameters: CalculationParameters<System>) => {
    return [...parameters.entity.getComponentEntities.entries()].filter(([componentId, component]) => component.constructor.name === BackingService.name).length;
}

export const totalNumberOfLinksInASystem: Calculation = (parameters: CalculationParameters<System>) => {
    return parameters.entity.getLinkEntities.size;
}

export const numberOfSynchronousEndpoints: Calculation = (parameters: CalculationParameters<System>) => {
    let sum = 0;
    [...parameters.entity.getComponentEntities.entries()].forEach(([componentId, component]) => {
        sum += numberOfSynchronousEndpointsOfferedByAService({ entity: component, system: parameters.system }) as number;
    })
    return sum;
}

export const numberOfAsynchronousEndpoints: Calculation = (parameters: CalculationParameters<System>) => {
    let sum = 0;
    let allComponents = [...parameters.entity.getComponentEntities.entries()];
    allComponents.forEach(([componentId, component]) => {
        sum += numberOfAsynchronousEndpointsOfferedByAService({ entity: component, system: parameters.system }) as number;
    })
    return sum;
}

export const numberOfServicesWhichHaveIncomingLinks: Calculation = (parameters: CalculationParameters<System>) => {
    let servicesWithIncomingLinks = parameters.entity.getComponentEntities.entries()
        .filter(([componentId, component]) => {
            return component.constructor.name === Service.name && parameters.entity.getIncomingLinksOfComponent(componentId).length > 0;
        })
        .map(([componentId, component]) => componentId)
        .toArray();

    return servicesWithIncomingLinks.length;
}

export const numberOfServicesWhichHaveOutgoingLinks: Calculation = (parameters: CalculationParameters<System>) => {
    let servicesWithOutgoingLinks = parameters.entity.getComponentEntities.entries()
        .filter(([componentId, component]) => {
            return component.constructor.name === Service.name && parameters.entity.getOutgoingLinksOfComponent(componentId).length > 0;
        })
        .map(([componentId, component]) => componentId)
        .toArray();

    return servicesWithOutgoingLinks.length;
}

export const numberOfServicesWhichHaveBothIncomingAndOutgoingLinks: Calculation = (parameters: CalculationParameters<System>) => {
    let servicesWithIncomingAndOutgoingLinks = parameters.entity.getComponentEntities.entries()
        .filter(([componentId, component]) => {
            return component.constructor.name === Service.name
                && parameters.entity.getOutgoingLinksOfComponent(componentId).length > 0
                && parameters.entity.getIncomingLinksOfComponent(componentId).length > 0;
        })
        .map(([componentId, component]) => componentId)
        .toArray();

    return servicesWithIncomingAndOutgoingLinks.length;
}

export const numberOfServiceConnectedToStorageBackingService: Calculation = (parameters: CalculationParameters<System>) => {

    let servicesConnectedToAStorageBackingService: Set<string> = new Set();

    for (const [linkId, link] of parameters.entity.getLinkEntities.entries()) {
        if (link.getSourceEntity.constructor.name === Service.name
            && parameters.entity.searchComponentOfEndpoint(link.getTargetEndpoint.getId).constructor.name === StorageBackingService.name) {
            servicesConnectedToAStorageBackingService.add(link.getSourceEntity.getId);
        }
    }

    return servicesConnectedToAStorageBackingService.size;
}

export const numberOfRequestTraces: Calculation = (parameters: CalculationParameters<System>) => {
    return parameters.entity.getRequestTraceEntities.size;
}

export const averageComplexityOfRequestTraces: Calculation = (parameters: CalculationParameters<System>) => {
    if (parameters.entity.getRequestTraceEntities.size === 0) {
        return "n/a";
    }

    return average([...parameters.entity.getRequestTraceEntities.entries()].map(([requestTraceId, requestTrace]) => requestTraceComplexity({ entity: requestTrace, system: parameters.system }) as number));
}

export const amountOfRedundancy: Calculation = (parameters: CalculationParameters<System>) => {
    if (parameters.entity.getDeploymentMappingEntities.size === 0) {
        return "n/a";
    }

    let deploymentMappings: Set<string> = new Set();
    let deployedComponents: Set<string> = new Set();

    for (const [deploymentMappingId, deploymentMapping] of parameters.entity.getDeploymentMappingEntities) {
        if (deploymentMapping.getDeployedEntity.constructor.name !== Infrastructure.name) {
            deploymentMappings.add(deploymentMappingId);
            deployedComponents.add(deploymentMapping.getDeployedEntity.getId);
        }
    }

    return deploymentMappings.size / deployedComponents.size

}

export const getServiceInteractions: (components: Component[], links: Link[], system: System) => {
    asynchronousConnections: Map<string, {
        "in-endpoint-ids": Set<string>,
        "in": Set<string>,
        "broker": BrokerBackingService,
        "out-endpoint-ids": Set<string>,
        "out": Set<string>
    }>,
    synchronousConnections: Map<string, Link>
} = (components: Component[], links: Link[], system: System) => {

    let asynchronousConnections: Map<string, {
        "in-endpoint-ids": Set<string>,
        "in": Set<string>,
        "broker": BrokerBackingService
        "out-endpoint-ids": Set<string>,
        "out": Set<string>
    }> = new Map();

    // initialize potential asynchronous connection points
    let allBrokerBackingServices = components.filter(component => component.constructor.name === BrokerBackingService.name);
    for (const brokerService of allBrokerBackingServices) {
        for (const endpoint of brokerService.getEndpointEntities) {
            let endpointPath = endpoint.getProperty("url_path").value;
            let endpointKind = endpoint.getProperty("kind").value;
            let connectionPointId = brokerService.getId.concat(endpointPath);

            // initialize entry, if not present yet
            if (!asynchronousConnections.has(connectionPointId)) {
                asynchronousConnections.set(connectionPointId, {
                    "in-endpoint-ids": new Set(),
                    "in": new Set(),
                    "broker": brokerService,
                    "out-endpoint-ids": new Set(),
                    "out": new Set()
                })
            }

            // actually assign endpoint to corresponding connection point
            switch (endpointKind) {
                case SEND_EVENT_ENDPOINT_KIND:
                    asynchronousConnections.get(connectionPointId)["in-endpoint-ids"].add(endpoint.getId);
                    break;
                case SUBSCRIBE_ENDPOINT_KIND:
                    asynchronousConnections.get(connectionPointId)["out-endpoint-ids"].add(endpoint.getId);
                    break;
                default:
                // do nothing
            }
        }
    }

    let directServiceConnections: Map<string, Link> = new Map<string, Link>();

    //check all links to find asynchronous service connections and direct service connections.  
    for (const link of links) {
        if (link.getSourceEntity.constructor.name === Service.name) {
            let targetComponent = system.searchComponentOfEndpoint(link.getTargetEndpoint.getId);
            if (targetComponent && targetComponent.constructor.name === Service.name
                && SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value)) {
                directServiceConnections.set(link.getId, link);
            }
            if (targetComponent && targetComponent.constructor.name === BrokerBackingService.name) {
                let connectionPointId = targetComponent.getId.concat(link.getTargetEndpoint.getProperty("url_path").value);
                if (asynchronousConnections.get(connectionPointId)["in-endpoint-ids"].has(link.getTargetEndpoint.getId)) {
                    asynchronousConnections.get(connectionPointId)["in"].add(link.getSourceEntity.getId);
                } else if (asynchronousConnections.get(connectionPointId)["out-endpoint-ids"].has(link.getTargetEndpoint.getId)) {
                    asynchronousConnections.get(connectionPointId)["out"].add(link.getSourceEntity.getId);
                }
            }
        }
    }

    return {
        asynchronousConnections: asynchronousConnections,
        synchronousConnections: directServiceConnections
    }
}

export const serviceInteractionViaBackingService: Calculation = (parameters: CalculationParameters<System>) => {

    let serviceInteractions = getServiceInteractions([...parameters.entity.getComponentEntities.values()],
        [...parameters.entity.getLinkEntities.values()],
        parameters.entity
    );

    let numberOfAsynchronousConnectionsViaBroker = [...serviceInteractions.asynchronousConnections.entries()]
        .filter(([connectionId, connection]) => {
            return MESSAGE_BROKER_KIND.includes(connection.broker.getProperty("kind").value);
        })
        .map(([connectionId, connection]) => {
            return connection.in.size * connection.out.size;
        }).reduce((accumulator, currentValue) => { return accumulator + currentValue }, 0);

    if ((numberOfAsynchronousConnectionsViaBroker + serviceInteractions.synchronousConnections.size) === 0) {
        return "n/a";
    }

    return numberOfAsynchronousConnectionsViaBroker / (numberOfAsynchronousConnectionsViaBroker + serviceInteractions.synchronousConnections.size);
}

export const eventSourcingUtilizationMetric: Calculation = (parameters: CalculationParameters<System>) => {

    let serviceInteractions = getServiceInteractions([...parameters.entity.getComponentEntities.values()],
        [...parameters.entity.getLinkEntities.values()],
        parameters.entity
    );

    let numberOfEventSourcingConnections = [...serviceInteractions.asynchronousConnections.entries()]
        .filter(([connectionId, connection]) => {
            return EVENT_SOURCING_KIND.includes(connection.broker.getProperty("kind").value);
        })
        .map(([connectionId, connection]) => {
            return connection.in.size * connection.out.size;
        }).reduce((accumulator, currentValue) => { return accumulator + currentValue }, 0);

    if ((numberOfEventSourcingConnections + serviceInteractions.synchronousConnections.size) === 0) {
        return "n/a";
    }

    return numberOfEventSourcingConnections / (numberOfEventSourcingConnections + serviceInteractions.synchronousConnections.size);

}

export const configurationExternalization: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = [...parameters.entity.getComponentEntities.entries()];
    let allInfrastructure = [...parameters.entity.getInfrastructureEntities.entries()];

    let configurationRelations: Map<string, {
        "usedBy": string[],
        "persistedBy": string[],
    }> = new Map();

    [...parameters.entity.getBackingDataEntities.entries()]
        .filter(([backingDataId, backingData]) => { return backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND })
        .forEach(([configId, config]) => { configurationRelations.set(configId, { "usedBy": [], "persistedBy": [] }) });

    for (const [componentId, component] of allComponents) {
        let configs = component.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND });
        configs.forEach(config => {
            if (DATA_USAGE_RELATION_USAGE.includes(config.relation.getProperty("usage_relation").value)) {
                configurationRelations.get(config.backingData.getId).usedBy.push(componentId);
            }
            if (DATA_USAGE_RELATION_PERSISTENCE.includes(config.relation.getProperty("usage_relation").value)) {
                configurationRelations.get(config.backingData.getId).persistedBy.push(componentId);
            }
        })
    }

    for (const [infrastructureId, infrastructure] of allInfrastructure) {
        let configs = infrastructure.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND });
        configs.forEach(config => {
            if (DATA_USAGE_RELATION_USAGE.includes(config.relation.getProperty("usage_relation").value)) {
                configurationRelations.get(config.backingData.getId).usedBy.push(infrastructureId);
            }
            if (DATA_USAGE_RELATION_PERSISTENCE.includes(config.relation.getProperty("usage_relation").value)) {
                configurationRelations.get(config.backingData.getId).persistedBy.push(infrastructureId);
            }
        })
    }

    let nonExternalizedConfigurations = 0;
    let externalizedConfigurations = 0;
    [...configurationRelations.entries()].forEach(([configId, relations]) => {

        if (relations.persistedBy.length > 0) {
            if (relations.usedBy.length === 0) {
                nonExternalizedConfigurations++; 
            } else {
                externalizedConfigurations += relations.usedBy.length;
            }
            nonExternalizedConfigurations += relations.persistedBy.length - 1;
        }

    })

    if (nonExternalizedConfigurations + externalizedConfigurations === 0) {
        return 0;
    }
    return externalizedConfigurations / (nonExternalizedConfigurations + externalizedConfigurations);

}

export const ratioOfRequestTracesThroughGateway: Calculation = (parameters: CalculationParameters<System>) => {
    let allRequestTraces = parameters.entity.getRequestTraceEntities;

    if (allRequestTraces.size === 0) {
        return "n/a";
    }

    let numberOfRequestTracesThroughGateway = 0;

    requestTraceLoop: for (const [requestTraceId, requestTrace] of allRequestTraces) {
        // consider a request trace as going through a gateway if either the component owning the external endpoint is a Gateway or a gateway is included in the request trace

        if (requestTrace.getExternalEndpoint) {
            let componentWithExternalEndpoint = parameters.entity.searchComponentOfEndpoint(requestTrace.getExternalEndpoint.getId);
            let proxy = componentWithExternalEndpoint.getExternalIngressProxiedBy;
            if (proxy && proxy.constructor.name === ProxyBackingService.name && proxy.getProperty("kind").value === "API Gateway") {
                numberOfRequestTracesThroughGateway++;
                continue requestTraceLoop;
            }
        }

        for (const link of requestTrace.getLinks.flat(1)) {
            let linkSource = link.getSourceEntity;
            if (linkSource.constructor.name === ProxyBackingService.name && linkSource.getProperty("kind").value === "API Gateway") {
                numberOfRequestTracesThroughGateway++;
                continue requestTraceLoop;
            }
        }
    }

    return numberOfRequestTracesThroughGateway / allRequestTraces.size;
}

export const ratioOfInfrastructureNodesThatSupportMonitoring: Calculation = (parameters: CalculationParameters<System>) => {
    let allInfrastructure = parameters.entity.getInfrastructureEntities;

    if (allInfrastructure.size === 0) {
        return "n/a";
    }

    let numberOfInfrastructureNodesSupportingMonitoring = 0;

    for (const [infrastructureId, infrastructure] of allInfrastructure) {
        if (infrastructureSupportsMonitoring(infrastructure)) {
            numberOfInfrastructureNodesSupportingMonitoring++;
        }
    }

    return numberOfInfrastructureNodesSupportingMonitoring / allInfrastructure.size;
}

export const ratioOfComponentsThatSupportMonitoring: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = parameters.entity.getComponentEntities;

    if (allComponents.size === 0) {
        return "n/a";
    }

    let numberOfComponentsSupportingMonitoring = 0;

    for (const [componentId, component] of allComponents) {
        if (componentSupportsMonitoring(component)) {
            numberOfComponentsSupportingMonitoring++;
        }
    }

    return numberOfComponentsSupportingMonitoring / allComponents.size;
}

export const ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService: Calculation = (parameters: CalculationParameters<System>) => {

    let allNonLoggingComponents = [...parameters.entity.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name !== BackingService.name || component.getProperty("providedFunctionality").value !== "logging";
    })

    let allInfrastructure = parameters.entity.getInfrastructureEntities;

    let loggingComponents = [...parameters.entity.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && component.getProperty("providedFunctionality").value === "logging";
    })

    if ((allNonLoggingComponents.length + allInfrastructure.size === 0) || loggingComponents.length === 0) {
        return 0;
    }


    let connectionsToLoggingService: Map<string, {
        loggingService: string,
        mode: "push" | "pull"
    }[]> = new Map();
    allNonLoggingComponents.forEach(([componentId, component]) => connectionsToLoggingService.set(componentId, []));
    let loggingComponentIds = loggingComponents.map(([componentId, component]) => componentId);
    for (const [linkId, link] of parameters.entity.getLinkEntities) {
        let targetService = parameters.entity.searchComponentOfEndpoint(link.getTargetEndpoint.getId);
        // case 1: component sends to a logging service
        if (loggingComponentIds.includes(targetService.getId)) {
            connectionsToLoggingService.get(link.getSourceEntity.getId).push({
                loggingService: targetService.getId,
                mode: "push"
            })
        }
        // case 2: logging service scrapes logs from component
        if (loggingComponentIds.includes(link.getSourceEntity.getId)) {
            connectionsToLoggingService.get(targetService.getId).push({
                loggingService: link.getSourceEntity.getId,
                mode: "pull"
            })
        }
    }

    let numberOfComponentsOrInfrastructureExportingLogs = 0;

    for (const [componentId, nonLoggingComponent] of allNonLoggingComponents) {
        let loggingData: string[] = nonLoggingComponent.getBackingDataEntities.filter(backingData => {
            return backingData.backingData.getProperty("kind").value === BACKING_DATA_LOGS_KIND && DATA_USAGE_RELATION_USAGE.includes(backingData.relation.getProperty("usage_relation").value)
        }).map(backingData => backingData.backingData.getId);

        let componentExportsLoggingData = false;
        logDataLoop: for (const logData of loggingData) {
            for (const loggingConnection of connectionsToLoggingService.get(componentId)) {
                let loggingService = parameters.entity.getComponentEntities.get(loggingConnection.loggingService);
                let dataStoredByLoggingService = loggingService.getBackingDataEntities.find(backingData => backingData.backingData.getId === logData);
                if (dataStoredByLoggingService && DATA_USAGE_RELATION_PERSISTENCE.includes(dataStoredByLoggingService.relation.getProperty("usage_relation").value)) {
                    componentExportsLoggingData = true;
                    continue logDataLoop;
                }

            }
        }
        if (componentExportsLoggingData) {
            numberOfComponentsOrInfrastructureExportingLogs++;
        }
    }

    for (const [infrastructureId, infrastructure] of allInfrastructure) {
        let loggingData: string[] = infrastructure.getBackingDataEntities.filter(backingData => {
            return backingData.backingData.getProperty("kind").value === BACKING_DATA_LOGS_KIND && DATA_USAGE_RELATION_USAGE.includes(backingData.relation.getProperty("usage_relation").value)
        }).map(backingData => backingData.backingData.getId);

        let infrastructureExportsLoggingData = false;
        for (const [loggingServiceId, loggingService] of loggingComponents) {
            let loggingDataAlsoInLoggingService = loggingService.getBackingDataEntities.find(backingData => {
                return loggingData.includes(backingData.backingData.getId)
            });
            if (loggingDataAlsoInLoggingService && DATA_USAGE_RELATION_PERSISTENCE.includes(loggingDataAlsoInLoggingService.relation.getProperty("usage_relation").value)) {
                infrastructureExportsLoggingData = true;
            }
        }
        if (infrastructureExportsLoggingData) {
            numberOfComponentsOrInfrastructureExportingLogs++;
        }
    }

    return numberOfComponentsOrInfrastructureExportingLogs / (allNonLoggingComponents.length + allInfrastructure.size);
}

export const ratioOfComponentsOrInfrastructureNodesThatExportMetrics: Calculation = (parameters: CalculationParameters<System>) => {

    let allNonMetricsComponents = [...parameters.entity.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name !== BackingService.name || component.getProperty("providedFunctionality").value !== "metrics";
    })

    let allInfrastructure = parameters.entity.getInfrastructureEntities;

    let metricComponents = [...parameters.entity.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && component.getProperty("providedFunctionality").value === "metrics";
    })

    if ((allNonMetricsComponents.length + allInfrastructure.size === 0) || metricComponents.length === 0) {
        return 0;
    }


    let connectionsToMetricsService: Map<string, {
        metricsService: string,
        mode: "push" | "pull"
    }[]> = new Map();
    allNonMetricsComponents.forEach(([componentId, component]) => connectionsToMetricsService.set(componentId, []));
    let metricComponentIds = metricComponents.map(([componentId, component]) => componentId);
    for (const [linkId, link] of parameters.entity.getLinkEntities) {
        let targetService = parameters.entity.searchComponentOfEndpoint(link.getTargetEndpoint.getId);
        // case 1: component sends to a metrics service
        if (metricComponentIds.includes(targetService.getId)) {
            connectionsToMetricsService.get(link.getSourceEntity.getId).push({
                metricsService: targetService.getId,
                mode: "push"
            })
        }
        // case 2: metrics service scrapes metrics from component
        if (metricComponentIds.includes(link.getSourceEntity.getId)) {
            connectionsToMetricsService.get(targetService.getId).push({
                metricsService: link.getSourceEntity.getId,
                mode: "pull"
            })
        }
    }

    let numberOfComponentsOrInfrastructureExportingMetrics = 0;

    for (const [componentId, nonMetricsComponent] of allNonMetricsComponents) {
        let metricData: string[] = nonMetricsComponent.getBackingDataEntities.filter(backingData => {
            return backingData.backingData.getProperty("kind").value === BACKING_DATA_METRICS_KIND && DATA_USAGE_RELATION_USAGE.includes(backingData.relation.getProperty("usage_relation").value)
        }).map(backingData => backingData.backingData.getId);

        let componentExportsMetrics = false;
        metricsDataLoop: for (const metrics of metricData) {
            for (const metricsConnection of connectionsToMetricsService.get(componentId)) {
                let metricsService = parameters.entity.getComponentEntities.get(metricsConnection.metricsService);
                let dataStoredByMetricsService = metricsService.getBackingDataEntities.find(backingData => backingData.backingData.getId === metrics);
                if (dataStoredByMetricsService && DATA_USAGE_RELATION_PERSISTENCE.includes(dataStoredByMetricsService.relation.getProperty("usage_relation").value)) {
                    componentExportsMetrics = true;
                    continue metricsDataLoop;
                }

            }
        }
        if (componentExportsMetrics) {
            numberOfComponentsOrInfrastructureExportingMetrics++;
        }
    }

    for (const [infrastructureId, infrastructure] of allInfrastructure) {
        let metricsData: string[] = infrastructure.getBackingDataEntities.filter(backingData => {
            return backingData.backingData.getProperty("kind").value === BACKING_DATA_METRICS_KIND && DATA_USAGE_RELATION_USAGE.includes(backingData.relation.getProperty("usage_relation").value)
        }).map(backingData => backingData.backingData.getId);

        let infrastructureExportsMetricsData = false;
        for (const [metricsServiceId, metricsService] of metricComponents) {
            let metricsDataAlsoInMetricsService = metricsService.getBackingDataEntities.find(backingData => {
                return metricsData.includes(backingData.backingData.getId)
            });
            if (metricsDataAlsoInMetricsService && DATA_USAGE_RELATION_PERSISTENCE.includes(metricsDataAlsoInMetricsService.relation.getProperty("usage_relation").value)) {
                infrastructureExportsMetricsData = true;
            }
        }
        if (infrastructureExportsMetricsData) {
            numberOfComponentsOrInfrastructureExportingMetrics++;
        }
    }

    return numberOfComponentsOrInfrastructureExportingMetrics / (allNonMetricsComponents.length + allInfrastructure.size);
}

export const distributedTracingSupport: Calculation = (parameters: CalculationParameters<System>) => {

    // TODO also consider a proxy service that supports tracing and when a component is proxied by that proxy?

    let allTraceableComponents = [...parameters.entity.getComponentEntities.values()].filter((component) => {
        return component.constructor.name !== BackingService.name || component.getProperty("providedFunctionality").value !== "tracing";
    })

    let tracingServices = [...parameters.entity.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && component.getProperty("providedFunctionality").value === "tracing";
    })

    if (allTraceableComponents.length === 0 || tracingServices.length === 0) {
        return "n/a";
    }

    let tracingEndpoints = new Set(tracingServices.flatMap(([componentId, component]) => {
        return component.getEndpointEntities.map(endpoint => endpoint.getId);
    }));

    return countComponentsConnectedToCertainEndpoints(allTraceableComponents, tracingEndpoints, parameters.system) / allTraceableComponents.length;
}

export const calculateNumberOfLinksWithServiceDiscovery: (links: Link[]) => number = (links) => {
    let linksWithServiceDiscovery = 0;

    for (const link of links) {
        let sourceComponent = link.getSourceEntity;
        let addressResolutionComponent = sourceComponent.getAddressResolutionBy;
        if (addressResolutionComponent &&
            ((addressResolutionComponent.constructor.name === BackingService.name && addressResolutionComponent.getProperty("address_resolution_kind").value !== "none")
                || (addressResolutionComponent.constructor.name === ProxyBackingService.name))
        ) {
            linksWithServiceDiscovery++;
        }
    }

    return linksWithServiceDiscovery;
}

export const serviceDiscoveryUsage: Calculation = (parameters: CalculationParameters<System>) => {

    let allLinks = [...parameters.entity.getLinkEntities.values()];

    if (allLinks.length === 0) {
        return "n/a";
    }

    return calculateNumberOfLinksWithServiceDiscovery(allLinks) as number / allLinks.length;
}

export const ratioOfComponentsWhoseIngressIsProxied: Calculation = (parameters: CalculationParameters<System>) => {

    const [allNonProxyComponents, proxyComponents] = partition([...parameters.entity.getComponentEntities.entries()], ([componentId, component]) => component.constructor.name !== ProxyBackingService.name);

    if (proxyComponents.length === 0 || allNonProxyComponents.length === 0) {
        return "n/a";
    }

    let numberOfComponentsWithProxiedIngress = 0;

    for (const [componentId, component] of allNonProxyComponents) {
        if (component.getExternalIngressProxiedBy && component.getIngressProxiedBy) {
            numberOfComponentsWithProxiedIngress++;
        }
    }

    return numberOfComponentsWithProxiedIngress / allNonProxyComponents.length;
}

export const ratioOfComponentsWhoseEgressIsProxied: Calculation = (parameters: CalculationParameters<System>) => {

    const [allNonProxyComponents, proxyComponents] = partition([...parameters.entity.getComponentEntities.entries()], ([componentId, component]) => component.constructor.name !== ProxyBackingService.name);

    if (proxyComponents.length === 0 || allNonProxyComponents.length === 0) {
        return "n/a";
    }

    let numberOfComponentsWithProxiedEgress = 0;

    for (const [componentId, component] of allNonProxyComponents) {
        if (component.getEgressProxiedBy) {
            numberOfComponentsWithProxiedEgress++;
        }
    }

    return numberOfComponentsWithProxiedEgress / allNonProxyComponents.length;
}

export const ratioOfCachedDataAggregates: Calculation = (parameters: CalculationParameters<System>) => {

    const allComponents = [...parameters.entity.getComponentEntities.entries()];

    let cachedUsages = 0;
    let allUsages = 0;

    allComponents.forEach(([componentId, component]) => {

        component.getDataAggregateEntities.forEach(dataAggregateUsage => {
            if (DATA_USAGE_RELATION_USAGE.includes(dataAggregateUsage.relation.getProperty("usage_relation").value)) {
                allUsages++;
                if (dataAggregateUsage.relation.getProperty("usage_relation").value === "cached-usage") {
                    cachedUsages++;
                }
            }
        })
    })

    if (allUsages > 0) {
        return cachedUsages / allUsages;
    }
    return 0;
}

export const ratioOfStateDependencyOfEndpoints: Calculation = (parameters: CalculationParameters<System>) => {

    const allEndpoints = [...parameters.entity.getComponentEntities.entries()].flatMap(([componentId, component]) => component.getEndpointEntities.concat(component.getExternalEndpointEntities));

    if (allEndpoints.length === 0) {
        return "n/a";
    }

    let numberOfDependingEndpoints = allEndpoints.filter(endpoint => endpoint.getDataAggregateEntities.length > 0).length;

    return numberOfDependingEndpoints / allEndpoints.length;
}

export const serviceMeshUsage: Calculation = (parameters: CalculationParameters<System>) => {

    const componentsToEvaluate = [...parameters.entity.getComponentEntities.values()].filter(component => component.constructor.name !== ProxyBackingService.name || component.getProperty("kind").value !== SERVICE_MESH_KIND);

    return average(componentsToEvaluate.map(component => componentServiceMeshUsage({ entity: component, system: parameters.system }) as number));
}

export const secretsExternalization: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = [...parameters.entity.getComponentEntities.entries()];
    let allInfrastructure = [...parameters.entity.getInfrastructureEntities.entries()];

    let secretRelations: Map<string, {
        "usedBy": string[],
        "persistedBy": string[],
    }> = new Map();

    [...parameters.entity.getBackingDataEntities.entries()]
        .filter(([backingDataId, backingData]) => { return backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND })
        .forEach(([secretId, secret]) => { secretRelations.set(secretId, { "usedBy": [], "persistedBy": [] }) });

    for (const [componentId, component] of allComponents) {
        let secrets = component.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND });
        secrets.forEach(secret => {
            if (DATA_USAGE_RELATION_USAGE.includes(secret.relation.getProperty("usage_relation").value)) {
                secretRelations.get(secret.backingData.getId).usedBy.push(componentId);
            }
            if (DATA_USAGE_RELATION_PERSISTENCE.includes(secret.relation.getProperty("usage_relation").value)) {
                secretRelations.get(secret.backingData.getId).persistedBy.push(componentId);
            }
        })
    }

    for (const [infrastructureId, infrastructure] of allInfrastructure) {
        let secrets = infrastructure.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND });
        secrets.forEach(secret => {
            if (DATA_USAGE_RELATION_USAGE.includes(secret.relation.getProperty("usage_relation").value)) {
                secretRelations.get(secret.backingData.getId).usedBy.push(infrastructureId);
            }
            if (DATA_USAGE_RELATION_PERSISTENCE.includes(secret.relation.getProperty("usage_relation").value)) {
                secretRelations.get(secret.backingData.getId).persistedBy.push(infrastructureId);
            }
        })
    }

    let nonExternalizedSecrets = 0;
    let externalizedSecrets = 0;
    [...secretRelations.entries()].forEach(([secretId, relations]) => {

        if (relations.persistedBy.length > 0) {
            if (relations.usedBy.length === 0) {
                nonExternalizedSecrets++; 
            } else {
                externalizedSecrets += relations.usedBy.length;
            }
            nonExternalizedSecrets += relations.persistedBy.length - 1;
        }

    })

    if (nonExternalizedSecrets + externalizedSecrets === 0) {
        return 0;
    }
    return externalizedSecrets / (nonExternalizedSecrets + externalizedSecrets);

}

export const ratioOfSpecializedStatefulServices: Calculation = (parameters: CalculationParameters<System>) => {

    let statefulServices = [...parameters.entity.getComponentEntities.entries()].filter(([componentId, component]) => !component.getProperty("stateless").value);

    if (statefulServices.length === 0) {
        return "n/a";
    }

    let specializedServices: string[] = [];

    for (const [componentId, statefulService] of statefulServices) {
        if ([StorageBackingService.name, BackingService.name, BrokerBackingService.name].includes(statefulService.constructor.name)) {
            specializedServices.push(componentId);
        }
    }

    return specializedServices.length / statefulServices.length;
}


export const suitablyReplicatedStatefulService: Calculation = (parameters: CalculationParameters<System>) => {

    let allStatefulBackingServices = [...parameters.system.getComponentEntities.entries()]
        .filter(([componentId, component]) => [StorageBackingService.name, BackingService.name, BrokerBackingService.name].includes(component.constructor.name)
            && !component.getProperty("stateless").value);

    if (allStatefulBackingServices.length === 0) {
        return "n/a";
    }

    let deploymentMappings: Map<string, DeploymentMapping[]> = new Map();
    allStatefulBackingServices.forEach(([serviceId, service]) => deploymentMappings.set(serviceId, []));

    [...parameters.system.getDeploymentMappingEntities.entries()].forEach(([mappingId, mapping]) => {
        let isIncluded = deploymentMappings.keys().find(id => id === mapping.getDeployedEntity.getId)
        if (isIncluded) {
            deploymentMappings.get(isIncluded).push(mapping);
        }
    })

    let replicated: Set<string> = new Set();
    let suitablyReplicated: Set<string> = new Set();

    deploymentMappings.entries().forEach(([serviceId, deploymentMappings]) => {
        if (deploymentMappings.some(mapping => mapping.getProperty("replicas").value > 1)) {
            replicated.add(serviceId);
            let replicatedService = allStatefulBackingServices.find(([id, service]) => {
                return id == serviceId
            });
            if (replicatedService[1].getProperty("replication_strategy").value !== "none") {
                suitablyReplicated.add(serviceId);
            }
        }
    });


    if (replicated.size === 0) {
        return "n/a";
    }

    return suitablyReplicated.size / replicated.size;
}

export const ratioOfUniqueAccountUsage: Calculation = (parameters: CalculationParameters<System>) => {

    let accounts = new Set();

    let allComponents = parameters.entity.getComponentEntities;

    for(const [componentId, component] of allComponents) {

        let componentAccounts = new Set(Object.entries(component.getProperty("identities").value).filter(([identifier, identityType])=> identityType === "account").map(([identifier, identityType])=> identifier));
        if (componentAccounts.size === 0) {
            accounts.add("default-account");
        } else {
            componentAccounts.forEach(account => accounts.add(account));
        }
    }

    let allInfrastructureInstances = parameters.entity.getInfrastructureEntities;

    for (const [infrastructureId, infrastructure] of allInfrastructureInstances) {

        let infrastructureAccounts = new Set(Object.entries(infrastructure.getProperty("identities").value).filter(([identifier, identityType])=> identityType === "account").map(([identifier, identityType])=> identifier));
        if (infrastructureAccounts.size === 0) {
            accounts.add("default-account");
        } else {
            infrastructureAccounts.forEach(account => accounts.add(account));
        }
    }

    let componentsAndInfrastructure = allComponents.size + allInfrastructureInstances.size;
    if (componentsAndInfrastructure <= 1) {
        return "n/a";
    }

    return accounts.size / componentsAndInfrastructure;
}

export const ratioOfNonCustomBackingServices: Calculation = (parameters: CalculationParameters<System>) => {

    let allBackingServices = [...parameters.entity.getComponentEntities].filter(([componentId, component]) => {
        return [StorageBackingService.name, BackingService.name, BrokerBackingService.name, ProxyBackingService.name].includes(component.constructor.name);
    });

    if (allBackingServices.length === 0) {
        return "n/a";
    }

    let nonCustomBackingServices = allBackingServices.filter(([backingServiceId, backingService]) => backingService.getProperty("software_type").value !== CUSTOM_SOFTWARE_TYPE);

    return nonCustomBackingServices.length / allBackingServices.length;
}

export const secretsStoredInVault: Calculation = (parameters: CalculationParameters<System>) => {

    let allSecrets = [...parameters.entity.getBackingDataEntities.entries()].filter(([backingDataId, backingData]) => backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND);

    if (allSecrets.length === 0) {
        return "n/a";
    }

    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    let secretsStoredInVault: Set<string> = new Set();
    let secretsStoredElsewhere: Set<string> = new Set();

    for (const [componentId, component] of allComponents) {
        let secretsStoredInComponent = component.getBackingDataEntities
            .filter((backingData) => backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND && DATA_USAGE_RELATION_PERSISTENCE.includes(backingData.relation.getProperty("usage_relation").value))
            .map(backingData => backingData.backingData.getId);

        if (component.constructor.name === BackingService.name && VAULT_KIND.includes(component.getProperty("providedFunctionality").value)) {
            secretsStoredInComponent.forEach(secretId => secretsStoredInVault.add(secretId));
        } else {
            secretsStoredInComponent.forEach(secretId => secretsStoredElsewhere.add(secretId));
        }

    }
    let onlyStoredInVault = secretsStoredInVault.difference(secretsStoredElsewhere);

    return onlyStoredInVault.size / allSecrets.length;
}

export const accessRestrictedToCallers: Calculation = (parameters: CalculationParameters<System>) => {

    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    if (allComponents.length == 0) {
        return "n/a";
    }

    let accessRestrictedToCallersPerComponent = allComponents.map(([componentId, component]) => componentMeasureImplementations["accessRestrictedToCallers"]({ entity: component, system: parameters.system }));

    let validValues = accessRestrictedToCallersPerComponent.filter(value => value !== "n/a");

    if (validValues.length === 0) {
        return "n/a"
    } else {
        return average(validValues as number[]);
    }
}


export const ratioOfDelegatedAuthentication: Calculation = (parameters: CalculationParameters<System>) => {

    let allComponents = [...parameters.entity.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name !== BackingService.name || component.getProperty("providedFunctionality").value !== "authentication/authorization"
    })

    if (allComponents.length === 0) {
        return "n/a";
    }

    return average(allComponents.map(([componentId, component]) => {
        if (component.getAuthenticationBy) {
            return 1;
        } else {
            return 0;
        }
    }));

}

export const ratioOfStandardizedArtifacts: Calculation = (parameters: CalculationParameters<System>) => {

    let allArtifacts = new Map<string, Artifact>();

    parameters.entity.getComponentEntities.entries().forEach(([componentKey, component]) => {
        component.getArtifacts.entries().forEach(([artifactKey, artifact]) => {
            allArtifacts.set(`${componentKey}-${artifactKey}`, artifact);
        })
    })

    parameters.entity.getInfrastructureEntities.entries().forEach(([infrastructureKey, infrastructure]) => {
        infrastructure.getArtifacts.entries().forEach(([artifactKey, artifact]) => {
            allArtifacts.set(`${infrastructureKey}-${artifactKey}`, artifact);
        })
    })

    if (allArtifacts.size === 0) {
        return "n/a";
    }

    let standardized = allArtifacts.entries().filter(([key, artifact]) => artifact.getProperty("based_on_standard") && artifact.getProperty("based_on_standard").value !== "none").toArray();

    return standardized.length / allArtifacts.size;
}

export const ratioOfEntitiesProvidingStandardizedArtifacts: Calculation = (parameters: CalculationParameters<System>) => {


    let providesStandardizedArtifact = new Set<string>();

    if (parameters.entity.getComponentEntities.size + parameters.entity.getInfrastructureEntities.size === 0) {
        return "n/a";
    }

    parameters.entity.getComponentEntities.entries().forEach(([componentKey, component]) => {
        let standardizedArtifacts = component.getArtifacts.entries().filter(([key, artifact]) => artifact.getProperty("based_on_standard") && artifact.getProperty("based_on_standard").value !== "none").toArray();
        if (standardizedArtifacts.length > 0) {
            providesStandardizedArtifact.add(componentKey);
        }
    })

    parameters.entity.getInfrastructureEntities.entries().forEach(([infrastructureKey, infrastructure]) => {
        let standardizedArtifacts = infrastructure.getArtifacts.entries().filter(([key, artifact]) => artifact.getProperty("based_on_standard") && artifact.getProperty("based_on_standard").value !== "none").toArray();
        if (standardizedArtifacts.length > 0) {
            providesStandardizedArtifact.add(infrastructureKey);
        }
    })

    return providesStandardizedArtifact.size / (parameters.entity.getComponentEntities.size + parameters.entity.getInfrastructureEntities.size);
}

export const componentArtifactsSimilarity: Calculation = (parameters: CalculationParameters<System>) => {

    let allComponents = [...parameters.entity.getComponentEntities.values()];

    if (allComponents.length <= 1) {
        return "n/a";
    }

    let comparisons = [];

    for (const [index, componentA] of allComponents.entries()) {
        if (index < allComponents.length - 1) {
            for (const componentB of allComponents.slice(index + 1)) {
                let artifactTypesA = new Set(componentA.getArtifacts.entries().map(([artifactKey, artifact]) => artifact.getType()));
                let artifactTypesB = new Set(componentB.getArtifacts.entries().map(([artifactKey, artifact]) => artifact.getType()));
                if (artifactTypesA.union(artifactTypesB).size === 0) {
                    comparisons.push(0);
                } else {
                    comparisons.push(artifactTypesA.intersection(artifactTypesB).size / (artifactTypesA.union(artifactTypesB).size));
                }
            }
        }
    }

    return average(comparisons);
}

export const infrastructureArtifactsSimilarity: Calculation = (parameters: CalculationParameters<System>) => {

    let allInfrastructure = [...parameters.entity.getInfrastructureEntities.values()];

    if (allInfrastructure.length <= 1) {
        return "n/a";
    } 

    let comparisons = [];

    for (const [index, infrastructureA] of allInfrastructure.entries()) {
        if (index < allInfrastructure.length - 1) {
            for (const infrastructureB of allInfrastructure.slice(index + 1)) {
                let artifactTypesA = new Set(infrastructureA.getArtifacts.entries().map(([artifactKey, artifact]) => artifact.getType()));
                let artifactTypesB = new Set(infrastructureB.getArtifacts.entries().map(([artifactKey, artifact]) => artifact.getType()));
                if (artifactTypesA.union(artifactTypesB).size === 0) {
                    comparisons.push(0);
                } else {
                    comparisons.push(artifactTypesA.intersection(artifactTypesB).size / (artifactTypesA.union(artifactTypesB).size));
                }
            }
        }
    }

    return average(comparisons);
}

export const ratioOfAutomaticallyProvisionedInfrastructure: Calculation = (parameters: CalculationParameters<System>) => {

    let automatedProvisioning: number[] = parameters.entity.getInfrastructureEntities.values().map(infrastructure => infrastructureProvisionedAutomatically({ entity: infrastructure, system: parameters.system }) as number).toArray();

    return average(automatedProvisioning);
}

export const ratioOfDeploymentsOnDynamicInfrastructure: Calculation = (parameters: CalculationParameters<System>) => {

    let infrastructureOfDeploymentMappingsForComponents = parameters.entity.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return deploymentMapping.getDeployedEntity.constructor.name !== Infrastructure.name
    }).map(([deploymentMappingKey, deploymentMapping]) => deploymentMapping.getUnderlyingInfrastructure).toArray();

    if (infrastructureOfDeploymentMappingsForComponents.length === 0) {
        return "n/a";
    }

    let dynamicDeployment = infrastructureOfDeploymentMappingsForComponents.filter(infrastructure => {
        return DYNAMIC_INFRASTRUCTURE.includes(infrastructure.getProperty("kind").value);
    })

    return dynamicDeployment.length / infrastructureOfDeploymentMappingsForComponents.length;

}

export const ratioOfInfrastructureWithIaCArtifact: Calculation = (parameters: CalculationParameters<System>) => {

    let infrastructureEntities = parameters.entity.getInfrastructureEntities.entries().toArray();

    if (infrastructureEntities.length === 0) {
        return "n/a";
    }

    let hasIaCArtifact = [];
    infrastructureEntities.forEach(([infrastructureKey, infrastructure]) => {
        let artifacts = infrastructure.getArtifacts;
        let iacArtifact = infrastructure.getArtifacts.entries().find(([artifactKey, artifact]) => IAC_ARTIFACT_TYPE.includes(artifact.getType()));
        if (iacArtifact) {
            hasIaCArtifact.push(infrastructureKey);
        }
    })

    return hasIaCArtifact.length / infrastructureEntities.length;
}

export const namespaceSeparation: Calculation = (parameters: CalculationParameters<System>) => {

    if (parameters.entity.getComponentEntities.entries().toArray().length === 0) {
        return "n/a";
    }

    let componentNamespaceSeparations = parameters.entity.getComponentEntities.entries().map(([componentKey, component]) => componentNamespaceSeparation({ entity: component, system: parameters.system })).toArray() as number[];

    return average(componentNamespaceSeparations);
}

export const ratioOfFullyManagedInfrastructure: Calculation = (parameters: CalculationParameters<System>) => {

    let allInfrastructureInstances = parameters.entity.getInfrastructureEntities.entries().toArray();

    if (allInfrastructureInstances.length === 0) {
        return "n/a";
    }

    let fullyManaged = allInfrastructureInstances.map(([infrastructureKey, infrastructure]) => infrastructureIsFullyManaged({ entity: infrastructure, system: parameters.system })) as number[];

    return average(fullyManaged);
}

export const ratioOfManagedBackingServices: Calculation = (parameters: CalculationParameters<System>) => {

    let allBackingServices = parameters.entity.getComponentEntities.entries().filter(([componentKey, component]) => {
        return [BackingService.name, StorageBackingService.name, ProxyBackingService.name, BrokerBackingService.name].includes(component.constructor.name);
    }).toArray();

    if (allBackingServices.length === 0) {
        return "n/a";
    }

    let managedBackingServices = allBackingServices.filter(([backingServiceKey, backingService]) => backingService.getProperty("managed").value);

    return managedBackingServices.length / allBackingServices.length;
}

export const ratioOfInfrastructureEnforcingResourceBoundaries: Calculation = (parameters: CalculationParameters<System>) => {

    let allInfrastructure = parameters.system.getInfrastructureEntities.entries().toArray();

    if (allInfrastructure.length === 0) {
        return "n/a";
    }

    let enforcingInfrastructure = allInfrastructure.filter(([infrastructureKey, infrastructure]) => infrastructure.getProperty("enforced_resource_bounds").value);

    return enforcingInfrastructure.length / allInfrastructure.length;
}

export const ratioOfDeploymentMappingsWithStatedResourceRequirements: Calculation = (parameters: CalculationParameters<System>) => {
    let allDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().toArray();

    if (allDeploymentMappings.length === 0) {
        return "n/a";
    }

    let statingResourceRequirements = allDeploymentMappings.filter(([deplyomentMappingKey, deploymentMapping]) => deploymentMapping.getProperty("resource_requirements").value !== "unstated");

    return statingResourceRequirements.length / allDeploymentMappings.length;
}

export const deployedEntitiesAutoscaling: Calculation = (parameters: CalculationParameters<System>) => {

    let allComponentIds = parameters.entity.getComponentEntities.entries().map(([componentKey, component]) => componentKey).toArray();

    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return allComponentIds.includes(deploymentMapping.getDeployedEntity.getId);
    }).toArray();

    if (relevantDeploymentMappings.length === 0) {
        return "n/a";
    }

    let underlyingInfrastructure = relevantDeploymentMappings.map(([deploymentMappingKey, deploymentMapping]) => deploymentMapping.getUnderlyingInfrastructure);

    let infrastructureProvidesScaling = underlyingInfrastructure.filter(infrastructure => AUTOMATED_SCALING.includes(infrastructure.getProperty("deployed_entities_scaling").value))

    return infrastructureProvidesScaling.length / underlyingInfrastructure.length;
}

export const infrastructureAutoscaling: Calculation = (parameters: CalculationParameters<System>) => {

    let allInfrastructure = parameters.entity.getInfrastructureEntities.entries().toArray();

    if (allInfrastructure.length === 0) {
        return "n/a";
    }

    let autoscalingInfrastructure = allInfrastructure.filter(([infrastructureKey, infrastructure]) => AUTOMATED_SCALING.includes(infrastructure.getProperty("self_scaling").value));

    return autoscalingInfrastructure.length / allInfrastructure.length
}

export const ratioOfAbstractedHardware: Calculation = (parameters: CalculationParameters<System>) => {

    let allInfrastructure = parameters.entity.getInfrastructureEntities.entries().toArray();

    if (allInfrastructure.length === 0) {
        return "n/a";
    }

    let abstractedHardwareInfrastructure = allInfrastructure.filter(([infrastructureKey, infrastructure]) => DYNAMIC_INFRASTRUCTURE.includes(infrastructure.getProperty("kind").value));

    return abstractedHardwareInfrastructure.length / allInfrastructure.length
}


export const nonProviderSpecificInfrastructureArtifacts: Calculation = (parameters: CalculationParameters<System>) => {

    let allInfrastructure = parameters.entity.getInfrastructureEntities;

    if (allInfrastructure.size === 0) {
        return "n/a";
    }

    let nonProviderSpecificArtifacts = allInfrastructure.entries().filter(([infrastructureKey, infrastructure]) => {
        return infrastructureHasOnlyNonProviderSpecificArtifacts({ entity: infrastructure, system: parameters.system }) === 1
    }).toArray();

    return nonProviderSpecificArtifacts.length / allInfrastructure.size;
}

export const nonProviderSpecificComponentArtifacts: Calculation = (parameters: CalculationParameters<System>) => {

    let allComponents = parameters.entity.getComponentEntities;

    if (allComponents.size === 0) {
        return "n/a";
    }

    let nonProviderSpecificArtifacts = allComponents.entries().filter(([componentKey, component]) => {
        return componentHasOnlyNonProviderSpecificArtifacts({ entity: component, system: parameters.system }) === 1
    }).toArray();

    return nonProviderSpecificArtifacts.length / allComponents.size;
}

export const configurationStoredInConfigService: Calculation = (parameters: CalculationParameters<System>) => {

    let allConfigs = [...parameters.entity.getBackingDataEntities.entries()].filter(([backingDataId, backingData]) => backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND);

    if (allConfigs.length === 0) {
        return "n/a";
    }

    let allComponents = [...parameters.entity.getComponentEntities.entries()];

    let configsStoredInConfigService: Set<string> = new Set();
    let configsStoredElsewhere: Set<string> = new Set();

    for (const [componentId, component] of allComponents) {
        let configsStoredInComponent = component.getBackingDataEntities
            .filter((backingData) => backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND && DATA_USAGE_RELATION_PERSISTENCE.includes(backingData.relation.getProperty("usage_relation").value))
            .map(backingData => backingData.backingData.getId);

        if (component.constructor.name === BackingService.name && CONFIG_SERVICE_KIND.includes(component.getProperty("providedFunctionality").value)) {
            configsStoredInComponent.forEach(secretId => configsStoredInConfigService.add(secretId));
        } else {
            configsStoredInComponent.forEach(secretId => configsStoredElsewhere.add(secretId));
        }

    }
    let onlyStoredInConfigService = configsStoredInConfigService.difference(configsStoredElsewhere);

    return onlyStoredInConfigService.size / allConfigs.length;
}

export const ratioOfEndpointsCoveredByContract: Calculation = (parameters: CalculationParameters<System>) => {

    let allComponents = parameters.entity.getComponentEntities.entries();

    let allEndpointIds = [];
    let coveredByContractIds = [];

    for (const [componentKey, component] of allComponents) {

        let allComponentEndpoints = component.getEndpointEntities.concat(component.getExternalEndpointEntities);
        let componentArtifacts = component.getArtifacts;

        for (const endpoint of allComponentEndpoints) {
            allEndpointIds.push(endpoint.getId);

            let contractArtifact = endpoint.getDocumentedBy.map(artifactKey => componentArtifacts.get(artifactKey)).find(artifact => {
                return CONTRACT_ARTIFACT_TYPE.includes(artifact.getType());
            })
            if (contractArtifact) {
                coveredByContractIds.push(endpoint.getId);
            }
        }
    }

    if (allEndpointIds.length === 0) {
        return "n/a";
    }

    return coveredByContractIds.length / allEndpointIds.length;
}

export const standardizedDeployments: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponentIds = parameters.entity.getComponentEntities.entries().map(([componentKey, component]) => componentKey).toArray();

    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return allComponentIds.includes(deploymentMapping.getDeployedEntity.getId);
    }).toArray();

    if (relevantDeploymentMappings.length === 0) {
        return "n/a";
    }

    let standardizedDeploymentUnit = relevantDeploymentMappings.filter(([deplyomentMappingKey, deploymentMapping]) => {
        let artifacts = deploymentMapping.getDeployedEntity.getArtifacts;
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

export const selfContainedDeployments: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponentIds = parameters.entity.getComponentEntities.entries().map(([componentKey, component]) => componentKey).toArray();

    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return allComponentIds.includes(deploymentMapping.getDeployedEntity.getId);
    }).toArray();

    if (relevantDeploymentMappings.length === 0) {
        return "n/a";
    }

    let selfContainedDeploymentUnit = relevantDeploymentMappings.filter(([deplyomentMappingKey, deploymentMapping]) => {
        let artifacts = deploymentMapping.getDeployedEntity.getArtifacts;
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

export const replacingDeployments: Calculation = (parameters: CalculationParameters<System>) => {
    let allDeploymentMappings = parameters.entity.getDeploymentMappingEntities;

    if (allDeploymentMappings.size === 0) {
        return 0;
    }

    let replacing = [];

    allDeploymentMappings.entries().forEach(([deploymentMappingId, deploymentMapping]) => {
        if (deploymentMapping.getProperty("update_strategy").value !== "in-place") {
            replacing.push(deploymentMappingId);
        }
    })

    return replacing.length / allDeploymentMappings.size;
}

export const ratioOfAutomaticallyMaintainedInfrastructure: Calculation = (parameters: CalculationParameters<System>) => {
    let allInfrastructureInstances = parameters.entity.getInfrastructureEntities;

    if (allInfrastructureInstances.size === 0) {
        return "n/a";
    }

    let automaticallyMaintained = [];

    allInfrastructureInstances.entries().forEach(([infrastructureId, infrastructure]) => {
        if (AUTOMATED_INFRASTRUCTURE_MAINTENANCE.includes(infrastructure.getProperty("maintenance").value)) {
            automaticallyMaintained.push(infrastructureId);
        }
    })

    return automaticallyMaintained.length / allInfrastructureInstances.size;
}

export const linksWithTimeout: Calculation = (parameters: CalculationParameters<System>) => {

    let allLinks = parameters.entity.getLinkEntities;

    if (allLinks.size === 0) {
        return "n/a";
    }

    let linksWithTimeout = allLinks.entries().filter(([linkId, link]) => link.getProperty("timeout").value > 0).toArray();

    return linksWithTimeout.length / allLinks.size;
}

export const deploymentsWithRestart: Calculation = (parameters: CalculationParameters<System>) => {
    let allDeploymentMappings = parameters.entity.getDeploymentMappingEntities;

    if (allDeploymentMappings.size === 0) {
        return 0;
    }

    let automatedRestart = allDeploymentMappings.entries().filter(([deploymentMappingId, deploymentMapping]) => AUTOMATED_RESTART_POLICIES.includes(deploymentMapping.getProperty("automated_restart_policy").value)).toArray();

    return automatedRestart.length / allDeploymentMappings.size;
}

export const ratioOfDocumentedEndpoints: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = parameters.entity.getComponentEntities.entries();

    let allEndpointIds = [];
    let documented = [];

    for (const [componentKey, component] of allComponents) {

        let allComponentEndpoints = component.getEndpointEntities.concat(component.getExternalEndpointEntities);

        for (const endpoint of allComponentEndpoints) {
            allEndpointIds.push(endpoint.getId);
            if (endpoint.getDocumentedBy.length > 0) {
                documented.push(endpoint.getId);
            }
        }
    }

    if (allEndpointIds.length === 0) {
        return "n/a";
    }

    return documented.length / allEndpointIds.length;
}

export const ratioOfEndpointsThatSupportTokenBasedAuthentication: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = parameters.entity.getComponentEntities.entries();

    let allEndpointIds = [];
    let supportingToken = [];

    for (const [componentKey, component] of allComponents) {

        let allComponentEndpoints = component.getEndpointEntities.concat(component.getExternalEndpointEntities);

        for (const endpoint of allComponentEndpoints) {
            allEndpointIds.push(endpoint.getId);
            if (endpoint.getProperty("supported_authentication_methods").value.includes("Token")) {
                supportingToken.push(endpoint.getId);
            }
        }
    }

    if (allEndpointIds.length === 0) {
        return "n/a";
    }

    return supportingToken.length / allEndpointIds.length;
}


export const ratioOfEndpointsThatSupportApiKeys: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = parameters.entity.getComponentEntities.entries();

    let allEndpointIds = [];
    let supportingToken = [];

    for (const [componentKey, component] of allComponents) {

        let allComponentEndpoints = component.getEndpointEntities.concat(component.getExternalEndpointEntities);

        for (const endpoint of allComponentEndpoints) {
            allEndpointIds.push(endpoint.getId);
            if (endpoint.getProperty("supported_authentication_methods").value.includes("API-Key")) {
                supportingToken.push(endpoint.getId);
            }
        }
    }

    if (allEndpointIds.length === 0) {
        return "n/a";
    }

    return supportingToken.length / allEndpointIds.length;
}

export const ratioOfEndpointsThatSupportPlaintextAuthentication: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = parameters.entity.getComponentEntities.entries();

    let allEndpointIds = [];
    let supportingToken = [];

    for (const [componentKey, component] of allComponents) {

        let allComponentEndpoints = component.getEndpointEntities.concat(component.getExternalEndpointEntities);

        for (const endpoint of allComponentEndpoints) {
            allEndpointIds.push(endpoint.getId);
            if (endpoint.getProperty("supported_authentication_methods").value.includes("basic_authentication")) {
                supportingToken.push(endpoint.getId);
            }
        }
    }

    if (allEndpointIds.length === 0) {
        return "n/a";
    }

    return supportingToken.length / allEndpointIds.length;
}

export const ratioOfEndpointsThatAreIncludedInASingleSignOnApproach: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = parameters.entity.getComponentEntities.entries();

    let allEndpointIds = [];
    let supportingToken = [];

    for (const [componentKey, component] of allComponents) {

        let allComponentEndpoints = component.getEndpointEntities.concat(component.getExternalEndpointEntities);

        for (const endpoint of allComponentEndpoints) {
            allEndpointIds.push(endpoint.getId);
            if (endpoint.getProperty("supported_authentication_methods").value.includes("Single Sign-On")) {
                supportingToken.push(endpoint.getId);
            }
        }
    }

    if (allEndpointIds.length === 0) {
        return "n/a";
    }

    return supportingToken.length / allEndpointIds.length;
}


export const endpointAccessConsistency: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = parameters.entity.getComponentEntities.entries();
    let allEndpoints = allComponents.flatMap(([componentId, component]) => {
        return component.getEndpointEntities;
    }).toArray();

    let endpointsWithAccessControl = allEndpoints.filter(endpoint => endpoint.getProperty("supported_authentication_methods").value.length !== 0);

    if (endpointsWithAccessControl.length <= 1) {
        return "n/a";
    }

    let pairwiseSimilarity = [];

    for ( const [index, endpointA] of endpointsWithAccessControl.entries()) {
        for (const endpointB of endpointsWithAccessControl.slice(index+1)) {
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

export const externalEndpointAccessConsistency: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = parameters.entity.getComponentEntities.entries();
    let allExternalEndpoints = allComponents.flatMap(([componentId, component]) => {
        return component.getExternalEndpointEntities;
    }).toArray();

    let endpointsWithAccessControl = allExternalEndpoints.filter(endpoint => endpoint.getProperty("supported_authentication_methods").value.length !== 0);

    if (endpointsWithAccessControl.length <= 1) {
        return "n/a";
    }

    let pairwiseSimilarity = [];

    for ( const [index, endpointA] of endpointsWithAccessControl.entries()) {
        for (const endpointB of endpointsWithAccessControl.slice(index+1)) {
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

export const cohesionBetweenEndpointsBasedOnDataAggregateUsage: Calculation = (parameters: CalculationParameters<System>) => {
    let allServices = parameters.entity.getComponentEntities.entries().filter(([componentId, component]) => component.constructor.name === Service.name).toArray();

    let cohesionBetweenEndpointsBasedOnDataAggregateUsagePerService = allServices.map(([serviceId, service]) => componentMeasureImplementations["cohesionBetweenEndpointsBasedOnDataAggregateUsage"]({entity: service, system: parameters.system})).filter(measureValue => measureValue !== "n/a");

    if (cohesionBetweenEndpointsBasedOnDataAggregateUsagePerService.length === 0) {
        return "n/a";
    }

    return average(cohesionBetweenEndpointsBasedOnDataAggregateUsagePerService as number[]);
}

export const serviceInterfaceUsageCohesion: Calculation = (parameters: CalculationParameters<System>) => {
    let allServices = parameters.entity.getComponentEntities.entries().filter(([componentId, component]) => component.constructor.name === Service.name).toArray();

    let serviceInterfaceUsageCohesionPerService = allServices.map(([serviceId, service]) => componentMeasureImplementations["serviceInterfaceUsageCohesion"]({entity: service, system: parameters.system})).filter(measureValue => measureValue !== "n/a");

    if (serviceInterfaceUsageCohesionPerService.length === 0) {
        return "n/a";
    }

    return average(serviceInterfaceUsageCohesionPerService as number[]);
}

export const readWriteSeparationForDataAggregates: Calculation = (parameters: CalculationParameters<System>) => {
    // initialize map to track data aggregate usage
    let dataAggregateUsageSeparation = new Map<string, number[]>();
    parameters.entity.getDataAggregateEntities.entries().forEach(([dataAggregateId, dataAggregate]) => {
        dataAggregateUsageSeparation.set(dataAggregateId, []);
    })

    let allComponentEntities = parameters.entity.getComponentEntities;

    for (const [componentId, component] of allComponentEntities) {
        let dataAggregateUsage = new Map<string, {"read": boolean, "write": boolean}>();
        component.getDataAggregateEntities.forEach(dataAggregate => {
            dataAggregateUsage.set(dataAggregate.data.getId, {"read": false, "write": false});
        })
    
        let allComponentEndpoints = component.getEndpointEntities.concat(component.getExternalEndpointEntities);
    
        if (allComponentEndpoints.length === 0 || dataAggregateUsage.size === 0) {
            continue;
        }
    
        for (const endpoint of allComponentEndpoints) {
            for (const usageRelation of endpoint.getDataAggregateEntities) {
                if (endpoint.getProperty("kind").value === "query") {
                    dataAggregateUsage.get(usageRelation.data.getId).read = true;
                } else  if (endpoint.getProperty("kind").value === "command") {
                    dataAggregateUsage.get(usageRelation.data.getId).write = true;
                }
            }
        }
    
        dataAggregateUsage.entries().forEach(([dataAggregateId, usage]) => {
            if (usage.read && usage.write) {
                // both read and write
                dataAggregateUsageSeparation.get(dataAggregateId).push(0);
            } else if (usage.read != usage.write) {
                // either read or write => separation
                dataAggregateUsageSeparation.get(dataAggregateId).push(1);
            } // else no usage...
        })
    }

    let separationPerDataAggregate = new Map<string, number>();
    
    dataAggregateUsageSeparation.entries().filter(([dataAggregateId, usageSeparations]) => usageSeparations.length > 0).forEach(([dataAggregateId, usageSeparations]) => {
        separationPerDataAggregate.set(dataAggregateId, average(usageSeparations));
    })

    if (separationPerDataAggregate.size === 0) {
        return "n/a";
    }

    return average(separationPerDataAggregate.values().toArray());
}

export const degreeOfSeparationByGateways: Calculation = (parameters: CalculationParameters<System>) => {
    let allServicesWithGateway = parameters.entity.getComponentEntities.entries()
        .filter(([componentId, component]) => component.constructor.name === Service.name)
        .filter(([componentId, component]) => component.getExternalIngressProxiedBy && component.getExternalIngressProxiedBy.getProperty("kind").value === "API Gateway")
        .toArray();

    if (allServicesWithGateway.length === 0) {
        return "n/a";
    }

    let gateways = parameters.entity.getComponentEntities.entries()
        .filter(([componentId, component]) => component.constructor.name === ProxyBackingService.name && component.getProperty("kind").value === "API Gateway").toArray();

    if (gateways.length === 0) {
        return "n/a";
    }

    let degreeOfSharing = allServicesWithGateway.length / gateways.length;

    return 1 / degreeOfSharing;
}

export const dataAggregateSpread: Calculation = (parameters: CalculationParameters<System>) => {

    let allDataAggregates = parameters.entity.getDataAggregateEntities;

    if (allDataAggregates.size === 0) {
        return "n/a";
    }

    let allServices = parameters.system.getComponentEntities.entries().filter(([componentId, component]) => component.constructor.name === Service.name).toArray();

    if (allServices.length === 0) {
        return "n/a";
    }

    let dataAggregateUsage: Map<string, string[]> = new Map();
    allDataAggregates.entries().forEach(([dataAggregateId, dataAggregate]) => dataAggregateUsage.set(dataAggregateId, []));

    allServices.forEach(([serviceId, service]) => {
        service.getDataAggregateEntities.forEach(dataAggregateRelation => {
            dataAggregateUsage.get(dataAggregateRelation.data.getId).push(serviceId);
        })
    })

    let dataAggregateSpread = dataAggregateUsage.entries().map(([dataAggregateId, usage]) => {
        if (usage.length === 0) {
            return 0;
        }
        return usage.length / allServices.length;
    }).toArray();

    return average(dataAggregateSpread);
}

export const requestTraceSimilarityBasedOnIncludedComponents: Calculation = (parameters: CalculationParameters<System>) => {
    let allRequestTraces = parameters.entity.getRequestTraceEntities;

    if (allRequestTraces.size === 0) {
        return "n/a";
    }

    let requestTraceComponents: Map<string, string[]> = new Map();

    allRequestTraces.entries().forEach(([requestTraceId, requestTrace]) => {
        let includedComponentIds = getIncludedComponents(requestTrace, parameters.system).map(component => component.getId);
        if (includedComponentIds.length > 0) {
            requestTraceComponents.set(requestTraceId, includedComponentIds);
        }
    })

    let requestTracesSimilarity = [];

    let requestTraceComponentsAsArray = requestTraceComponents.values().toArray();
    for (const [index, componentIdsA] of requestTraceComponentsAsArray.entries()) {
        for (const componentIdsB of requestTraceComponentsAsArray.slice(index+1)) {
            let setA = new Set(componentIdsA);
            let setB = new Set(componentIdsB);

            requestTracesSimilarity.push(setA.intersection(setB).size / setA.union(setB).size);
        }
    }
    return average(requestTracesSimilarity);
}


export const systemMeasureImplementations: { [measureKey: string]: Calculation } = {
    "serviceReplicationLevel": serviceReplicationLevel,
    "medianServiceReplication": medianServiceReplication,
    "smallestReplicationValue": smallestReplicationValue,
    "storageReplicationLevel": storageReplicationLevel,
    "externallyAvailableEndpoints": externallyAvailableEndpoints,
    "dataShardingLevel": dataShardingLevel,
    "ratioOfEndpointsSupportingSsl": ratioOfEndpointsSupportingSsl,
    "ratioOfExternalEndpointsSupportingTls": ratioOfExternalEndpointsSupportingTls,
    "ratioOfSecuredLinks": ratioOfSecuredLinks,
    "dataAggregateScope": dataAggregateScope,
    "ratioOfStatefulComponents": ratioOfStatefulComponents,
    "ratioOfStatelessComponents": ratioOfStatelessComponents,
    "degreeToWhichComponentsAreLinkedToStatefulComponents": degreeToWhichComponentsAreLinkedToStatefulComponents,
    "degreeOfAsynchronousCommunication": degreeOfAsynchronousCommunication,
    "asynchronousCommunicationUtilization": asynchronousCommunicationUtilization,
    "ratioOfServicesThatProvideHealthEndpoints": ratioOfServicesThatProvideHealthEndpoints,
    "couplingDegreeBasedOnPotentialCoupling": couplingDegreeBasedOnPotentialCoupling,
    "interactionDensityBasedOnComponents": interactionDensityBasedOnComponents,
    "interactionDensityBasedOnLinks": interactionDensityBasedOnLinks,
    "systemCouplingBasedOnEndpointEntropy": systemCouplingBasedOnEndpointEntropy,
    "servicesInterdependenceInTheSystem": servicesInterdependenceInTheSystem,
    "aggregateSystemMetricToMeasureServiceCoupling": aggregateSystemMetricToMeasureServiceCoupling,
    "degreeOfCouplingInASystem": degreeOfCouplingInASystem,
    "simpleDegreeOfCouplingInASystem": simpleDegreeOfCouplingInASystem,
    "directServiceSharing": directServiceSharing,
    "transitivelySharedServices": transitivelySharedServices,
    "ratioOfSharedNonExternalComponentsToNonExternalComponents": ratioOfSharedNonExternalComponentsToNonExternalComponents,
    "ratioOfSharedDependenciesOfNonExternalComponentsToPossibleDependencies": ratioOfSharedDependenciesOfNonExternalComponentsToPossibleDependencies,
    "averageSystemCoupling": averageSystemCoupling,
    "numberOfSynchronousCycles": numberOfSynchronousCycles,
    "densityOfAggregation": densityOfAggregation,
    "dataAggregateConvergenceAcrossComponents": dataAggregateConvergenceAcrossComponents,
    "ratioOfCyclicRequestTraces": ratioOfCyclicRequestTraces,
    "numberOfPotentialCyclesInASystem": numberOfPotentialCyclesInASystem,
    "maximumLengthOfServiceLinkChainPerRequestTrace": maximumLengthOfServiceLinkChainPerRequestTrace,
    "maximumNumberOfServicesWithinARequestTrace": maximumNumberOfServicesWithinARequestTrace,
    "databaseTypeUtilization": databaseTypeUtilization,
    "averageNumberOfEndpointsPerService": averageNumberOfEndpointsPerService,
    "numberOfComponents": numberOfComponents,
    "ratioOfProviderManagedComponentsAndInfrastructure": ratioOfProviderManagedComponentsAndInfrastructure,
    "componentDensity": componentDensity,
    "numberOfAvailabilityZonesUsed": numberOfAvailabilityZonesUsed,
    "rollingUpdateOption": rollingUpdateOption,
    "numberOfLinksWithRetryLogic": numberOfLinksWithRetryLogic,
    "numberOfLinksWithComplexFailover": numberOfLinksWithComplexFailover,
    "totalNumberOfComponents": totalNumberOfComponents,
    "numberOfServices": numberOfServices,
    "numberOfBackingServices": numberOfBackingServices,
    "totalNumberOfLinksInASystem": totalNumberOfLinksInASystem,
    "numberOfSynchronousEndpoints": numberOfSynchronousEndpoints,
    "numberOfAsynchronousEndpoints": numberOfAsynchronousEndpoints,
    "numberOfServicesWhichHaveIncomingLinks": numberOfServicesWhichHaveIncomingLinks,
    "numberOfServicesWhichHaveOutgoingLinks": numberOfServicesWhichHaveOutgoingLinks,
    "numberOfServicesWhichHaveBothIncomingAndOutgoingLinks": numberOfServicesWhichHaveBothIncomingAndOutgoingLinks,
    "numberOfServiceConnectedToStorageBackingService": numberOfServiceConnectedToStorageBackingService,
    "numberOfRequestTraces": numberOfRequestTraces,
    "averageComplexityOfRequestTraces": averageComplexityOfRequestTraces,
    "amountOfRedundancy": amountOfRedundancy,
    "serviceInteractionViaBackingService": serviceInteractionViaBackingService,
    "eventSourcingUtilizationMetric": eventSourcingUtilizationMetric,
    "configurationExternalization": configurationExternalization,
    "ratioOfRequestTracesThroughGateway": ratioOfRequestTracesThroughGateway,
    "ratioOfInfrastructureNodesThatSupportMonitoring": ratioOfInfrastructureNodesThatSupportMonitoring,
    "ratioOfComponentsThatSupportMonitoring": ratioOfComponentsThatSupportMonitoring,
    "ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService": ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService,
    "ratioOfComponentsOrInfrastructureNodesThatExportMetrics": ratioOfComponentsOrInfrastructureNodesThatExportMetrics,
    "distributedTracingSupport": distributedTracingSupport,
    "serviceDiscoveryUsage": serviceDiscoveryUsage,
    "ratioOfComponentsWhoseIngressIsProxied": ratioOfComponentsWhoseIngressIsProxied,
    "ratioOfComponentsWhoseEgressIsProxied": ratioOfComponentsWhoseEgressIsProxied,
    "ratioOfCachedDataAggregates": ratioOfCachedDataAggregates,
    "ratioOfStateDependencyOfEndpoints": ratioOfStateDependencyOfEndpoints,
    "serviceMeshUsage": serviceMeshUsage,
    "secretsExternalization": secretsExternalization,
    "ratioOfSpecializedStatefulServices": ratioOfSpecializedStatefulServices,
    "suitablyReplicatedStatefulService": suitablyReplicatedStatefulService,
    "ratioOfUniqueAccountUsage": ratioOfUniqueAccountUsage,
    "ratioOfNonCustomBackingServices": ratioOfNonCustomBackingServices,
    "secretsStoredInVault": secretsStoredInVault,
    "accessRestrictedToCallers": accessRestrictedToCallers,
    "ratioOfDelegatedAuthentication": ratioOfDelegatedAuthentication,
    "ratioOfStandardizedArtifacts": ratioOfStandardizedArtifacts,
    "ratioOfEntitiesProvidingStandardizedArtifacts": ratioOfEntitiesProvidingStandardizedArtifacts,
    "componentArtifactsSimilarity": componentArtifactsSimilarity,
    "infrastructureArtifactsSimilarity": infrastructureArtifactsSimilarity,
    "ratioOfAutomaticallyProvisionedInfrastructure": ratioOfAutomaticallyProvisionedInfrastructure,
    "ratioOfDeploymentsOnDynamicInfrastructure": ratioOfDeploymentsOnDynamicInfrastructure,
    "ratioOfInfrastructureWithIaCArtifact": ratioOfInfrastructureWithIaCArtifact,
    "namespaceSeparation": namespaceSeparation,
    "ratioOfFullyManagedInfrastructure": ratioOfFullyManagedInfrastructure,
    "ratioOfManagedBackingServices": ratioOfManagedBackingServices,
    "ratioOfInfrastructureEnforcingResourceBoundaries": ratioOfInfrastructureEnforcingResourceBoundaries,
    "ratioOfDeploymentMappingsWithStatedResourceRequirements": ratioOfDeploymentMappingsWithStatedResourceRequirements,
    "deployedEntitiesAutoscaling": deployedEntitiesAutoscaling,
    "infrastructureAutoscaling": infrastructureAutoscaling,
    "ratioOfAbstractedHardware": ratioOfAbstractedHardware,
    "nonProviderSpecificInfrastructureArtifacts": nonProviderSpecificInfrastructureArtifacts,
    "nonProviderSpecificComponentArtifacts": nonProviderSpecificComponentArtifacts,
    "configurationStoredInConfigService": configurationStoredInConfigService,
    "ratioOfEndpointsCoveredByContract": ratioOfEndpointsCoveredByContract,
    "standardizedDeployments": standardizedDeployments,
    "selfContainedDeployments": selfContainedDeployments,
    "replacingDeployments": replacingDeployments,
    "ratioOfAutomaticallyMaintainedInfrastructure": ratioOfAutomaticallyMaintainedInfrastructure,
    "linksWithTimeout": linksWithTimeout,
    "deploymentsWithRestart": deploymentsWithRestart,
    "ratioOfDocumentedEndpoints": ratioOfDocumentedEndpoints,
    "ratioOfEndpointsThatSupportTokenBasedAuthentication": ratioOfEndpointsThatSupportTokenBasedAuthentication,
    "ratioOfEndpointsThatSupportApiKeys": ratioOfEndpointsThatSupportApiKeys,
    "ratioOfEndpointsThatSupportPlaintextAuthentication": ratioOfEndpointsThatSupportPlaintextAuthentication,
    "ratioOfEndpointsThatAreIncludedInASingleSignOnApproach": ratioOfEndpointsThatAreIncludedInASingleSignOnApproach,
    "endpointAccessConsistency": endpointAccessConsistency,
    "externalEndpointAccessConsistency": externalEndpointAccessConsistency,
    "cohesionBetweenEndpointsBasedOnDataAggregateUsage": cohesionBetweenEndpointsBasedOnDataAggregateUsage,
    "serviceInterfaceUsageCohesion": serviceInterfaceUsageCohesion,
    "readWriteSeparationForDataAggregates": readWriteSeparationForDataAggregates,
    "degreeOfSeparationByGateways": degreeOfSeparationByGateways,
    "dataAggregateSpread": dataAggregateSpread,
    "requestTraceSimilarityBasedOnIncludedComponents": requestTraceSimilarityBasedOnIncludedComponents
}