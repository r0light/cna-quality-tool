import { BackingService, BrokerBackingService, Component, Infrastructure, Link, ProxyBackingService, Service, StorageBackingService, System } from "@/core/entities";
import { Calculation, CalculationParameters } from "../../quamoco/Measure";
import { average, partition } from "./general-functions";
import { ASYNCHRONOUS_ENDPOINT_KIND, BACKING_DATA_CONFIG_KIND, BACKING_DATA_LOGS_KIND, BACKING_DATA_METRICS_KIND, DATA_USAGE_RELATION_PERSISTENCE, DATA_USAGE_RELATION_USAGE, EVENT_SOURCING_KIND, getEndpointKindWeight, getUsageRelationWeight, MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS, MESSAGE_BROKER_KIND, PROTOCOLS_SUPPORTING_TLS, ROLLING_UPDATE_STRATEGY_OPTIONS, SEND_EVENT_ENDPOINT_KIND, SUBSCRIBE_ENDPOINT_KIND, SYNCHRONOUS_ENDPOINT_KIND } from "../../specifications/featureModel";
import { calculateRatioOfEndpointsSupportingSsl, calculateRatioOfExternalEndpointsSupportingTls, numberOfAsynchronousEndpointsOfferedByAService, numberOfComponentsAComponentIsLinkedTo, numberOfSynchronousEndpointsOfferedByAService, serviceCouplingBasedOnEndpointEntropy } from "./componentMeasures";
import { numberOfCyclesInRequestTraces } from "./requestTraceMeasures";
import { supportsMonitoring as infrastructureSupportsMonitoring} from "./infrastructureMeasures";
import { supportsMonitoring as componentSupportsMonitoring} from "./componentMeasures";

export const serviceReplicationLevel: Calculation = (parameters: CalculationParameters<System>) => {

    let replicasPerService: Map<String, number> = new Map();
    for (const [id, deploymentMapping] of parameters.entity.getDeploymentMappingEntities.entries()) {
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

    if (replicasPerService.size === 0) {
        return "n/a";
    } else {
        return average(
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

export const calculateRatioOfSecuredLinks: (allLinks: Link[]) => number = (allLinks) => {
    let linksConnectedToSecureEndpoints = allLinks.filter(link => {
        let protocol = link.getTargetEndpoint.getProperties().find(property => property.getKey === "protocol").value;
        return PROTOCOLS_SUPPORTING_TLS.includes(protocol);
    }).length

    if (allLinks.length === 0) {
        return 0;
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

export const calculateRatioOfStatefulComponents: (allComponents: Component[]) => number = (allComponents) => {
    let numberOfStatefulComponents = allComponents.filter(entry => !(entry.getProperties().find(property => property.getKey === "stateless").value)).length;

    if (allComponents.length === 0) {
        return 0;
    }
    return numberOfStatefulComponents / allComponents.length;

}

export const ratioOfStatefulComponents: Calculation = (parameters: CalculationParameters<System>) => {
    let allComponents = [...parameters.entity.getComponentEntities.values()];
    return calculateRatioOfStatefulComponents(allComponents);
}

export const calculateRatioOfStatelessComponents: (allComponents: Component[]) => number = (allComponents) => {
    let numberOfStatelessComponents = allComponents.filter(entry => (entry.getProperties().find(property => property.getKey === "stateless").value)).length;

    if (allComponents.length === 0) {
        return 0;
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
        return 0;
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
        return 0;
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

export const calculateRatioOfLinksToAsynchronousEndpoints: (allLinks: Link[]) => number = (allLinks) => {

    if (allLinks.length === 0) {
        return 0;
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
        return 0;
    }

    let numberOfServicesWithHealthAndReadinessEndpoint = 0;

    for (const service of allServices) {
        let hasHealthEndpoint = [...service.getEndpointEntities.entries()].filter(service => service[1].getProperty("health_check").value).length > 0;
        let hasReadinessEndpoint = [...service.getEndpointEntities.entries()].filter(service => service[1].getProperty("readiness_check").value).length > 0;
        if (hasHealthEndpoint && hasReadinessEndpoint) {
            numberOfServicesWithHealthAndReadinessEndpoint++;
        }
    }

    return numberOfServicesWithHealthAndReadinessEndpoint / allServices.length;
}

export const couplingDegreeBasedOnPotentialCoupling: Calculation = (parameters: CalculationParameters<System>) => {

    let allComponents = [...parameters.entity.getComponentEntities.entries()].map(entry => entry[0]);

    // the system has to have at least three components for this measure to make sense, because otherwise max-min is 0.
    if (allComponents.length < 3) {
        return 0;
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
        return 0;
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
        cumulativeCoupling += coupling as number;
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
        return 0;
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
        return 0;
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
        return 0;
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
        return 0;
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



    return Math.max(...allRequestTraces.map(requestTrace => requestTrace.getLinks.length));
}

export const maximumNumberOfServicesWithinARequestTrace: Calculation = (parameters: CalculationParameters<System>) => {
    let allRequestTraces = [...parameters.entity.getRequestTraceEntities.entries()].map(requestTrace => requestTrace[1]);

    return Math.max(...allRequestTraces.map(requestTrace => {
        let nodes = [...requestTrace.getLinks].flatMap(traceIndex => traceIndex.map(link => [link.getSourceEntity, parameters.entity.searchComponentOfEndpoint(link.getTargetEndpoint.getId)]).flatMap(components => components.map(component => component.getId)));
        return new Set(nodes).size;
    }));
}

export const databaseTypeUtilization: Calculation = (parameters: CalculationParameters<System>) => {

    let componentsPerStorage = new Map<string, Set<string>>();

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
        return 0;
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
        return 0;
    }

    let numberOfManagedComponents = [...allComponents.entries()].filter(component => component[1].getProperty("managed").value).reduce((accumulator, current) => accumulator + 1, 0);

    let numberOfManagedInfrastructure = [...allInfrastructure.entries()].filter(infrastructure => MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS.includes(infrastructure[1].getProperty("environment_access").value)).reduce((accumulator, current) => accumulator + 1, 0);

    return (numberOfManagedComponents + numberOfManagedInfrastructure) / (allComponents.size + allInfrastructure.size);
}

export const componentDensity: Calculation = (parameters: CalculationParameters<System>) => {

    let allDeploymentMappings = parameters.entity.getDeploymentMappingEntities;

    if (allDeploymentMappings.size === 0) {
        return 0;
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
        return 0;
    }

    let infrastructureEnablingRollingUpdates = [...infrastructureDeployingComponents.entries()].filter(infrastructure => infrastructure[1].getProperty("supported_update_strategies").value.some(strategy => ROLLING_UPDATE_STRATEGY_OPTIONS.includes(strategy))).map(infrastructure => infrastructure[1]);

    return infrastructureEnablingRollingUpdates.length / infrastructureDeployingComponents.size;
}

export const numberOfLinksWithRetryLogic: Calculation = (parameters: CalculationParameters<System>) => {

    // TODO also limit to endpoints which are safe/idempotent
    let linksToSynchronousEndpoints = [...parameters.entity.getLinkEntities.entries()].filter(([linkId, link]) => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value)).map(([linkId, link]) => link);

    if (linksToSynchronousEndpoints.length === 0) {
        return 0;
    }

    let linksWithRetryLogic = linksToSynchronousEndpoints.filter(link => link.getProperty("retries").value > 0);

    return linksWithRetryLogic.length / linksToSynchronousEndpoints.length;

}

export const numberOfLinksWithComplexFailover: Calculation = (parameters: CalculationParameters<System>) => {
    // TODO also limit to endpoints which are safe/idempotent
    let linksToSynchronousEndpoints = [...parameters.entity.getLinkEntities.entries()].filter(([linkId, link]) => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value)).map(([linkId, link]) => link);

    if (linksToSynchronousEndpoints.length === 0) {
        return 0;
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
        return 0;
    }

    return average([...parameters.entity.getRequestTraceEntities.entries()].map(([requestTraceId, requestTrace]) => requestTrace.getLinks.length));
}

export const amountOfRedundancy: Calculation = (parameters: CalculationParameters<System>) => {
    if (parameters.entity.getDeploymentMappingEntities.size === 0) {
        return 0;
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
        return 0;
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
        return 0;
    }

    return numberOfEventSourcingConnections / (numberOfEventSourcingConnections + serviceInteractions.synchronousConnections.size);

}

export const configurationExternalization: Calculation = (parameters: CalculationParameters<System>) => {

    let allNonConfigServices = [...parameters.entity.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name !== BackingService.name || component.getProperty("providedFunctionality").value !== "config";
    })

    let allConfigServices = [...parameters.entity.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && component.getProperty("providedFunctionality").value === "config";
    })

    let allInfrastructure = [...parameters.entity.getInfrastructureEntities.entries()];

    let configurationRelations: Map<string, {
        "usedBy": string[],
        "persistedBy": string[],
    }> = new Map();

    [...parameters.entity.getBackingDataEntities.entries()]
        .filter(([backingDataId, backingData]) => { return backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND })
        .forEach(([configId, config]) => { configurationRelations.set(configId, { "usedBy": [], "persistedBy": [] }) });

    for (const [componentId, component] of allNonConfigServices) {
        let configurations = component.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND });
        configurations.forEach(config => {
            // set usedBy in any case
            configurationRelations.get(config.backingData.getId).usedBy.push(componentId);
            if (DATA_USAGE_RELATION_PERSISTENCE.includes(config.relation.getProperty("usage_relation").value)) {
                configurationRelations.get(config.backingData.getId).persistedBy.push(componentId);
            }
        })
    }

    for (const [configServiceId, configService] of allConfigServices) {
        let configurations = configService.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND });
        configurations.forEach(config => {
            if (DATA_USAGE_RELATION_USAGE.includes(config.relation.getProperty("usage_relation").value)) {
                configurationRelations.get(config.backingData.getId).usedBy.push(configServiceId);
            }
            if (DATA_USAGE_RELATION_PERSISTENCE.includes(config.relation.getProperty("usage_relation").value)) {
                configurationRelations.get(config.backingData.getId).persistedBy.push(configServiceId);
            }
        })
    }

    for (const [infrastructureId, infrastructure] of allInfrastructure) {
        let configurations = infrastructure.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND });
        configurations.forEach(config => {
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
        for (const usingComponent of relations.usedBy) {
            if (!relations.persistedBy.includes(usingComponent) && relations.persistedBy.length > 0) {
                externalizedConfigurations++;
            } else {
                nonExternalizedConfigurations++;
            }
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
        return 0;
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
        return 0;
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
        return 0;
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

    let allTraceableComponents = [...parameters.entity.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name !== BackingService.name || component.getProperty("providedFunctionality").value !== "tracing";
    })

    let tracingServices = [...parameters.entity.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && component.getProperty("providedFunctionality").value === "tracing";
    })

    if (allTraceableComponents.length === 0 || tracingServices.length === 0) {
        return 0;
    }

    let tracingEndpoints = new Set(tracingServices.flatMap(([componentId, component]) => {
        return component.getEndpointEntities.map(endpoint => endpoint.getId);
    }));

    let numberOfComponentsConnectedToTracingService = 0;

    for (const [componentId, component] of allTraceableComponents) {
        let targetedEndpoints = new Set(parameters.entity.getOutgoingLinksOfComponent(componentId).map(link => link.getTargetEndpoint.getId));
        if (targetedEndpoints.intersection(tracingEndpoints).size > 0) {
            numberOfComponentsConnectedToTracingService++;
        }
    }

    return numberOfComponentsConnectedToTracingService / allTraceableComponents.length;
}

export const serviceDiscoveryUsage: Calculation = (parameters: CalculationParameters<System>) => {

    let allLinks = [...parameters.entity.getLinkEntities.entries()];

    if (allLinks.length === 0) {
        return 0;
    }

    let linksWithServiceDiscovery = 0;

    for (const [linkId, link] of allLinks) {
        let sourceComponent = link.getSourceEntity;
        if (sourceComponent.getAddressResolutionBy && sourceComponent.getAddressResolutionBy.getProperty("address_resolution_kind").value !== "none") {
            linksWithServiceDiscovery++;
        }
    }

    return linksWithServiceDiscovery / allLinks.length;
}

export const ratioOfComponentsWhoseIngressIsProxied: Calculation = (parameters: CalculationParameters<System>) => {

    const [allNonProxyComponents, proxyComponents] = partition([...parameters.entity.getComponentEntities.entries()], ([componentId, component]) => component.constructor.name !== ProxyBackingService.name);

    if (proxyComponents.length === 0 || allNonProxyComponents.length === 0) {
        return 0;
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
        return 0;
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
        return 0;
    }

    let numberOfDependingEndpoints = allEndpoints.filter(endpoint => endpoint.getDataAggregateEntities.length > 0).length;

    return numberOfDependingEndpoints / allEndpoints.length;
}


export const systemMeasureImplementations: { [measureKey: string]: Calculation } = {
    "serviceReplicationLevel": serviceReplicationLevel,
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
    "aggregateSystemMetricToMeasureServiceCoupling":
        aggregateSystemMetricToMeasureServiceCoupling,
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
    "ratioOfStateDependencyOfEndpoints": ratioOfStateDependencyOfEndpoints
}
