
import { a } from "vitest/dist/suite-IbNSsUWN.js";
import { Component, Service, StorageBackingService, System } from "../../entities.js";
import { Calculation } from "../quamoco/Measure.js";
import { ASYNCHRONOUS_ENDPOINT_KIND, PROTOCOLS_SUPPORTING_TLS, SYNCHRONOUS_ENDPOINT_KIND } from "../specifications/featureModel.js";
import { c } from "vite/dist/node/types.d-aGj9QkWt.js";

const average: (list: number[]) => number = list => {
    return list.reduce((e1, e2) => e1 + e2, 0) / list.length
}

export const serviceReplicationLevel: Calculation<System> = (system) => {
    let replicasPerService: Map<String, number> = new Map();
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

    if (replicasPerService.size === 0) {
        return "n/a";
    } else {
        return average(
            Array.from(replicasPerService.values())
        );
    }
}

export const storageReplicationLevel: Calculation<System> = (system) => {
    let replicasPerStorageService: Map<String, number> = new Map();
    for (const [id, deploymentMapping] of system.getDeploymentMappingEntities.entries()) {
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

export const externallyAvailableEndpoints: Calculation<System> = (system) => {
    return [...system.getComponentEntities.entries()].map(entry => entry[1].getExternalEndpointEntities.length).reduce((e1, e2) => e1 + e2, 0);
}

export const dataShardingLevel: Calculation<System> = (system) => {
    let storageBackingServices = [...system.getComponentEntities.entries()]
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

export const ratioOfEndpointsSupportingSsl: Calculation<System> = (system) => {
    let allEndpoints = [...system.getComponentEntities.entries()].flatMap(entry => entry[1].getEndpointEntities.concat(entry[1].getExternalEndpointEntities));
    let numberOfEndpointsSupportingSsl = allEndpoints.map(endpoint => endpoint.getProperties().find(property => property.getKey === "protocol").value)
        .filter(protocol => PROTOCOLS_SUPPORTING_TLS.includes(protocol))
        .length;
    if ((allEndpoints.length - numberOfEndpointsSupportingSsl) === 0) {
        return 0;
    }

    return numberOfEndpointsSupportingSsl / (allEndpoints.length - numberOfEndpointsSupportingSsl);
}

export const ratioOfExternalEndpointsSupportingTls: Calculation<System> = (system) => {
    let allExternalEndpoints = [...system.getComponentEntities.entries()].flatMap(entry => entry[1].getExternalEndpointEntities);
    let numberOfExternalEndpointsSupportingTLS = allExternalEndpoints.map(endpoint => endpoint.getProperties().find(property => property.getKey === "protocol").value)
        .filter(protocol => PROTOCOLS_SUPPORTING_TLS.includes(protocol))
        .length;
    if (allExternalEndpoints.length === 0) {
        return 0;
    }

    return numberOfExternalEndpointsSupportingTLS / allExternalEndpoints.length;
}

export const ratioOfSecuredLinks: Calculation<System> = (system) => {
    let allLinks = [...system.getLinkEntities.entries()].map(link => link[1]);
    let linksConnectedToSecureEndpoints = allLinks.filter(link => {
        let protocol = link.getTargetEndpoint.getProperties().find(property => property.getKey === "protocol").value;
        return PROTOCOLS_SUPPORTING_TLS.includes(protocol);
    }).length

    if (allLinks.length === 0) {
        return 0;
    }

    return linksConnectedToSecureEndpoints / allLinks.length;
}

export const dataAggregateScope: Calculation<System> = (system) => {
    return [...system.getDataAggregateEntities.keys()].length;
}

export const ratioOfStatefulComponents: Calculation<System> = (system) => {
    let allComponents = [...system.getComponentEntities.entries()];
    let numberOfStatefulComponents = allComponents.filter(entry => !(entry[1].getProperties().find(property => property.getKey === "stateless").value)).length;

    if (allComponents.length === 0) {
        return 0;
    }

    return numberOfStatefulComponents / allComponents.length;
}

export const ratioOfStatelessComponents: Calculation<System> = (system) => {
    let allComponents = [...system.getComponentEntities.entries()];
    let numberOfStatelessComponents = allComponents.filter(entry => (entry[1].getProperties().find(property => property.getKey === "stateless").value)).length;

    if (allComponents.length === 0) {
        return 0;
    }

    return numberOfStatelessComponents / allComponents.length;
}

export const degreeToWhichComponentsAreLinkedToStatefulComponents: Calculation<System> = (system) => {
    let allComponents = [...system.getComponentEntities.entries()];

    if (allComponents.length === 0) {
        return 0;
    }

    let totalNumberOfConnectionsToStatefulComponents = 0;
    for (const component of allComponents) {
        let connectedToStatefulComponents = new Set<string>();
        for (const link of system.getOutgoingLinksOfComponent(component[0])) {

            let connectedToComponent = system.searchComponentOfEndpoint(link.getTargetEndpoint.getId)
            if (!connectedToComponent.getProperty("stateless").value) {
                connectedToStatefulComponents.add(connectedToComponent.getId);
            }
        }
        totalNumberOfConnectionsToStatefulComponents = totalNumberOfConnectionsToStatefulComponents + connectedToStatefulComponents.size;
    }
    return totalNumberOfConnectionsToStatefulComponents / allComponents.length;
}

export const degreeOfAsynchronousCommunication: Calculation<System> = (system) => {
    let allComponents = [...system.getComponentEntities.entries()];

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

export const asynchronousCommunicationUtilization: Calculation<System> = (system) => {

    let allLinks = system.getLinkEntities;

    if (allLinks.size === 0) {
        return 0;
    }

    let numberOfLinksToAnAsynchronousEndpoint = 0;
    for (const [linkId, link] of allLinks) {
        if (ASYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value)) {
            numberOfLinksToAnAsynchronousEndpoint++;
        }
    }

    return numberOfLinksToAnAsynchronousEndpoint / allLinks.size;
}

export const ratioOfServicesThatProvideHealthEndpoints: Calculation<System> = (system) => {

    let allServices = [...system.getComponentEntities.entries()]
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

export const couplingDegreeBasedOnPotentialCoupling: Calculation<System> = (system) => {

    let allComponents = [...system.getComponentEntities.entries()].map(entry => entry[0]);

    // the system has to have at least three components for this measure to make sense, because otherwise max-min is 0.
    if (allComponents.length < 3) {
        return 0;
    }

    let shortestPaths = new Map<string, Map<string, number>>();
    let pathSum = 0;

    for (const componentId of allComponents) {
        for (const otherComponentId of allComponents.filter(id => id !== componentId)) {
            let shortestPath = system.getShortestPathLength(componentId, otherComponentId);

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

export const interactionDensityBasedOnComponents: Calculation<System> = (system) => {

    let numberOfComponents = system.getComponentEntities.size;

    if (numberOfComponents === 0) {
        return 0;
    }

    return system.getLinkEntities.size / numberOfComponents;
}

export const interactionDensityBasedOnLinks: Calculation<System> = (system) => {

    let maximumPotentialNumberOfLinks = system.getComponentEntities.size * (system.getComponentEntities.size - 1) * (system.getComponentEntities.size - 1);

    if (maximumPotentialNumberOfLinks === 0) {
        return 0;
    }

    return system.getLinkEntities.size / maximumPotentialNumberOfLinks;
}

export const systemCouplingBasedOnEndpointEntropy: Calculation<System> = (system) => {

    let allComponents = [...system.getComponentEntities.entries()];

    let cumulativeCoupling = 0;
    for (const [componentId, component] of allComponents) {
        let coupling = serviceCouplingBasedOnEndpointEntropy({ component: component, system: system });
        cumulativeCoupling += coupling as number;
    }

    return cumulativeCoupling;

}


export const servicesInterdependenceInTheSystem: Calculation<System> = (system) => {

    let allLinks = [...system.getLinkEntities.entries()];

    // tracl pairs of services, if a link exists between two services and entry is added which has a unique id for this pair and the set stores the source service of links.
    // Thus, if a pair has two entries in the set in the end, there exists a bi-directional connection for this pair
    let componentPairs = new Map<string, Set<string>>();
    
    for (const [linkId, link] of allLinks) {
        let from = link.getSourceEntity;
        let to = system.searchComponentOfEndpoint(link.getTargetEndpoint.getId);
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


export const systemMeasureImplementations: { [measureKey: string]: Calculation<System> } = {
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
    "servicesInterdependenceInTheSystem": servicesInterdependenceInTheSystem
}

export const serviceInterfaceDataCohesion: Calculation<{ component: Component, system: System }> = (parameters) => {
    let dataAggregateUsage = new Map<string, string[]>();
    parameters.component.getDataAggregateEntities.forEach(dataAggregate => {
        dataAggregateUsage.set(dataAggregate.data.getId, []);
    })

    parameters.component.getEndpointEntities.concat(parameters.component.getExternalEndpointEntities).forEach(endpoint => {
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


export const serviceInterfaceUsageCohesion: Calculation<{ component: Component, system: System }> = (parameters) => {
    let totalSumOfEndpointUsage = 0;

    let allEndpointsOfThisComponent = parameters.component.getEndpointEntities;
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

export const totalServiceInterfaceCohesion: Calculation<{ component: Component, system: System }> = (parameters) => {
    let serviceInterfaceDataCohesionValue = serviceInterfaceDataCohesion(parameters);
    let serviceInterfaceUsageCohesionValue = serviceInterfaceUsageCohesion(parameters);

    return ((serviceInterfaceDataCohesionValue as number) + (serviceInterfaceUsageCohesionValue as number)) / 2;

}

export const cohesionBetweenEndpointsBasedOnDataAggregateUsage: Calculation<{ component: Component, system: System }> = (parameters) => {
    let allEndpoints = parameters.component.getEndpointEntities.concat(parameters.component.getExternalEndpointEntities);

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

export const numberOfProvidedSynchronousAndAsynchronousEndpoints: Calculation<{ component: Component, system: System }> = (parameters) => {
    return parameters.component.getEndpointEntities.concat(parameters.component.getExternalEndpointEntities).length;
}

export const numberOfSynchronousEndpointsOfferedByAService: Calculation<{ component: Component, system: System }> = (parameters) => {
    return parameters.component.getEndpointEntities.concat(parameters.component.getExternalEndpointEntities)
        .filter(endpoint => SYNCHRONOUS_ENDPOINT_KIND.includes(endpoint.getProperty("kind").value)).length;
}

export const numberOfAsynchronousEndpointsOfferedByAService: Calculation<{ component: Component, system: System }> = (parameters) => {
    return parameters.component.getEndpointEntities.concat(parameters.component.getExternalEndpointEntities)
        .filter(endpoint => ASYNCHRONOUS_ENDPOINT_KIND.includes(endpoint.getProperty("kind").value)).length;
}

export const numberOfSynchronousOutgoingLinks: Calculation<{ component: Component, system: System }> = (parameters) => {
    let outgoingLinks = parameters.system.getOutgoingLinksOfComponent(parameters.component.getId);
    return outgoingLinks.filter(link => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value)).length;
}

export const numberOfAsynchronousOutgoingLinks: Calculation<{ component: Component, system: System }> = (parameters) => {
    let outgoingLinks = parameters.system.getOutgoingLinksOfComponent(parameters.component.getId);
    return outgoingLinks.filter(link => ASYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value)).length;
}

export const ratioOfAsynchronousOutgoingLinks: Calculation<{ component: Component, system: System }> = (parameters) => {
    let outgoingLinks = parameters.system.getOutgoingLinksOfComponent(parameters.component.getId);
    let asynchronousOutgoingLinks = outgoingLinks.filter(link => ASYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value));

    if (outgoingLinks.length === 0) {
        return 0;
    }

    return asynchronousOutgoingLinks.length / outgoingLinks.length;
}

export const numberOfLinksPerComponent: Calculation<{ component: Component, system: System }> = (parameters) => {
    let numberOfOutgoingLinks: number = numberOfConsumedEndpoints(parameters) as number;
    let incomingLinks = parameters.system.getIncomingLinksOfComponent(parameters.component.getId);
    return numberOfOutgoingLinks + incomingLinks.length;
}

export const numberOfConsumedEndpoints: Calculation<{ component: Component, system: System }> = (parameters) => {
    let outgoingLinks = parameters.system.getOutgoingLinksOfComponent(parameters.component.getId);
    return outgoingLinks.length;
}

export const incomingOutgoingRatioOfAComponent: Calculation<{ component: Component, system: System }> = (parameters) => {
    1
    let numberOfOutgoingLinks: number = numberOfConsumedEndpoints(parameters) as number;
    let incomingLinks = parameters.system.getIncomingLinksOfComponent(parameters.component.getId);
    if (incomingLinks.length === 0) {
        return 0;
    }
    return numberOfOutgoingLinks / incomingLinks.length;
}

export const ratioOfOutgoingLinksOfAService: Calculation<{ component: Component, system: System }> = (parameters) => {
    1
    let numberOfOutgoingLinks: number = numberOfConsumedEndpoints(parameters) as number;
    let incomingLinks = parameters.system.getIncomingLinksOfComponent(parameters.component.getId);
    if (incomingLinks.length + numberOfOutgoingLinks === 0) {
        return 0;
    }

    return (numberOfOutgoingLinks / (incomingLinks.length + numberOfOutgoingLinks)) * 100
}

export const indirectInteractionDensity: Calculation<{ component: Component, system: System }> = (parameters) => {
    let allComponents = parameters.system.getComponentEntities;

    if (allComponents.size < 3) {
        return 0;
    }

    let directDependencies = parameters.system.getOutgoingLinksOfComponent(parameters.component.getId).map(link => parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId));
    let directDependenciesIds = directDependencies.map(component => component.getId);

    // initialize potentialIndirectDependencies with all values to 0 assuming there are no indirect dependencies
    let potentialIndirectDependencies = new Map<string, number>();
    [...parameters.system.getComponentEntities.entries()]
        .map(component => component[0])
        .filter(componentId => componentId !== parameters.component.getId && !directDependenciesIds.includes(componentId))
        .forEach(componentId => {
            potentialIndirectDependencies.set(componentId, 0);
        })

    let alreadyVisited: string[] = directDependenciesIds.concat([parameters.component.getId]); // track visited nodes to handle potential circular paths
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


export const serviceCouplingBasedOnEndpointEntropy: Calculation<{ component: Component, system: System }> = (parameters) => {
    let endpointIds = parameters.component.getEndpointEntities.map(endpoint => endpoint.getId);

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

export const ratioOfStorageBackendSharing: Calculation<{ component: Component, system: System }> = (parameters) => {
    let storageServicesUsedByThisComponent = parameters.system.getOutgoingLinksOfComponent(parameters.component.getId)
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
        if (link.getSourceEntity.getId === parameters.component.getId) {
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

export const combinedMetricForIndirectDependency: Calculation<{ component: Component, system: System }> = (parameters) => {

    let indirectInteractionDensityValue = indirectInteractionDensity({component: parameters.component, system: parameters.system});

    let ratioOfStorageBackendSharingValue = ratioOfStorageBackendSharing({component: parameters.component, system: parameters.system});

    return ((indirectInteractionDensityValue as number) + (ratioOfStorageBackendSharingValue as number)) / 2;
}

export const numberOfComponentsThatAreLinkedToAComponent: Calculation<{ component: Component, system: System }> = (parameters) => {

    let allLinks = parameters.system.getLinkEntities;
    let consumers = new Set<string>();

    for (const [linkId, link] of allLinks) {
        if (parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId === parameters.component.getId) {
            let consumer = link.getSourceEntity.getId;
            consumers.add(consumer);
        }
    }
    return consumers.size;
}

export const numberOfComponentsAComponentIsLinkedTo: Calculation<{ component: Component, system: System }> = (parameters) => {   
    let linksWithThisComponentAsSource = [...parameters.system.getLinkEntities.entries()].filter(link => link[1].getSourceEntity.getId === parameters.component.getId);
    let linkedToServices = new Set<string>();

    linksWithThisComponentAsSource.forEach(link => {
        linkedToServices.add(parameters.system.searchComponentOfEndpoint(link[1].getTargetEndpoint.getId).getId);
    })

    return linkedToServices.size;
}

export const averageNumberOfDirectlyConnectedServices: Calculation<{ component: Component, system: System }> = (parameters) => {
    let numberOfComponentsAComponentIsLinkedToValue = numberOfComponentsAComponentIsLinkedTo(parameters);

    let numberOfComponentsThatAreLinkedToAComponentValue = numberOfComponentsThatAreLinkedToAComponent(parameters);

    return ((numberOfComponentsAComponentIsLinkedToValue as number) + (numberOfComponentsThatAreLinkedToAComponentValue as number)) / parameters.system.getComponentEntities.size;
}



export const componentMeasureImplementations: { [measureKey: string]: Calculation<{ component: Component, system: System }> } = {
    "serviceInterfaceDataCohesion": serviceInterfaceDataCohesion,
    "serviceInterfaceUsageCohesion": serviceInterfaceUsageCohesion,
    "totalServiceInterfaceCohesion": totalServiceInterfaceCohesion,
    "cohesionBetweenEndpointsBasedOnDataAggregateUsage": cohesionBetweenEndpointsBasedOnDataAggregateUsage,
    "numberOfProvidedSynchronousAndAsynchronousEndpoints": numberOfProvidedSynchronousAndAsynchronousEndpoints,
    "numberOfSynchronousEndpointsOfferedByAService": numberOfSynchronousEndpointsOfferedByAService,
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
    averageNumberOfDirectlyConnectedServices
}
