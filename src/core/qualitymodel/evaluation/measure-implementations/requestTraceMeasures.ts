import { BackingService, BrokerBackingService, Component, DeploymentMapping, ExternalEndpoint, Infrastructure, ProxyBackingService, RequestTrace, Service, StorageBackingService, System } from "@/core/entities";
import { Calculation, CalculationParameters } from "../../quamoco/Measure";
import { average, lowest, median } from "./general-functions";
import { calculateRatioOfEndpointsSupportingSsl, calculateRatioOfExternalEndpointsSupportingTls, componentMeasureImplementations, providesHealthEndpoints, providesReadinessEndpoints } from "./componentMeasures";
import { calculateNumberOfLinksWithServiceDiscovery, calculateRatioOfLinksToAsynchronousEndpoints, calculateRatioOfSecuredLinks, calculateRatioOfStatefulComponents, calculateRatioOfStatelessComponents, calculateReplicasPerService, countComponentsConnectedToCertainEndpoints, getServiceInteractions } from "./systemMeasures";
import { ASYNCHRONOUS_ENDPOINT_KIND, BACKING_DATA_CONFIG_KIND, BACKING_DATA_SECRET_KIND, CONTRACT_ARTIFACT_TYPE, DATA_USAGE_RELATION_PERSISTENCE, DATA_USAGE_RELATION_USAGE, DYNAMIC_INFRASTRUCTURE, EVENT_SOURCING_KIND, MESSAGE_BROKER_KIND, ROLLING_UPDATE_STRATEGY_OPTIONS, SERVICE_MESH_KIND, SYNCHRONOUS_ENDPOINT_KIND } from "../../specifications/featureModel";
import { supportsMonitoring as infrastructureSupportsMonitoring } from "./infrastructureMeasures";
import { supportsMonitoring as componentSupportsMonitoring } from "./componentMeasures";
import { serviceMeshUsage as componentServiceMeshUsage } from "./componentMeasures";
import { Artifact } from "@/core/common/artifact";

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
        return "n/a";
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
        return "n/a";
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
        return "n/a";
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
        return "n/a";
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
        return "n/a";
    }

    let numberOfServicesWithHealthEndpoint = 0;

    for (const service of allServices) {
        if (providesHealthEndpoints(service)) {
            numberOfServicesWithHealthEndpoint++;
        }
    }

    return numberOfServicesWithHealthEndpoint / allServices.length;
}

export const ratioOfServicesThatProvideReadinessEndpoints: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let allServices = getIncludedComponents(parameters.entity, parameters.system).filter(component => component.constructor.name === Service.name);

    if (allServices.length === 0) {
        return "n/a";
    }

    let numberOfServicesWithReadinessEndpoint = 0;

    for (const service of allServices) {
        if (providesReadinessEndpoints(service)) {
            numberOfServicesWithReadinessEndpoint++;
        }
    }

    return numberOfServicesWithReadinessEndpoint / allServices.length;
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
        return "n/a";
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
        return "n/a";
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

export const numberOfAvailabilityZonesUsedByInfrastructure: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
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

export const ratioOfLinksWithRetryLogic: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allLinks = parameters.entity.getLinks.flat();

    // TODO also limit to endpoints which are safe/idempotent
    let linksToSynchronousEndpoints = allLinks.filter((link) => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value));

    if (linksToSynchronousEndpoints.length === 0) {
        return "n/a";
    }

    let linksWithRetryLogic = linksToSynchronousEndpoints.filter(link => link.getProperty("retries").value > 0);

    return linksWithRetryLogic.length / linksToSynchronousEndpoints.length;

}


export const ratioOfLinksWithComplexFailover: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let allLinks = parameters.entity.getLinks.flat();

    // TODO also limit to endpoints which are safe/idempotent
    let linksToSynchronousEndpoints = allLinks.filter((link) => SYNCHRONOUS_ENDPOINT_KIND.includes(link.getTargetEndpoint.getProperty("kind").value));

    if (linksToSynchronousEndpoints.length === 0) {
        return "n/a";
    }

    let linksWithCircuitBreaker = linksToSynchronousEndpoints.filter(link => link.getProperty("circuit_breaker").value !== "none");

    return linksWithCircuitBreaker.length / linksToSynchronousEndpoints.length;
}

export const amountOfRedundancy: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    if (parameters.system.getDeploymentMappingEntities.size === 0) {
        return "n/a";
    }

    let includedComponentIds = getIncludedComponents(parameters.entity, parameters.system).map(component => component.getId);

    let deploymentMappings: Set<string> = new Set();
    let deployedComponents: Set<string> = new Set();

    for (const [deploymentMappingId, deploymentMapping] of parameters.system.getDeploymentMappingEntities) {
        if (includedComponentIds.includes(deploymentMapping.getDeployedEntity.getId)) {
            deploymentMappings.add(deploymentMappingId);
            deployedComponents.add(deploymentMapping.getDeployedEntity.getId);
        }
    }

    return deploymentMappings.size / deployedComponents.size
}


export const dataShardingLevel: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedStorageBackingServices = getIncludedComponents(parameters.entity, parameters.system).filter(entity => entity.constructor.name === StorageBackingService.name);

    if (includedStorageBackingServices.length === 0) {
        return "n/a";
    } else {
        return average(includedStorageBackingServices
            .map(storageService => storageService.getProperties()
                .find(prop => prop.getKey === "shards").value)
        );
    }
}

export const serviceMeshUsage: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponents = getIncludedComponents(parameters.entity, parameters.system);

    const componentsToEvaluate = includedComponents.filter(component => component.constructor.name !== ProxyBackingService.name || component.getProperty("kind").value !== SERVICE_MESH_KIND);

    return average(componentsToEvaluate.map(component => componentServiceMeshUsage({ entity: component, system: parameters.system }) as number));
}

export const configurationExternalization: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponents = getIncludedComponents(parameters.entity, parameters.system);

    let configurationExternalizationValues = includedComponents
        .filter(component => component.getBackingDataEntities.filter(backingData => backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND).length > 0)
        .map(component => {
            return componentMeasureImplementations["configurationExternalization"]({ entity: component, system: parameters.system }) as number;
        })

    return average(configurationExternalizationValues);
}

export const secretsExternalization: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponents = getIncludedComponents(parameters.entity, parameters.system);

    let secretsExternalizationValues = includedComponents
        .filter(component => component.getBackingDataEntities.filter(backingData => backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND).length > 0)
        .map(component => {
            return componentMeasureImplementations["secretsExternalization"]({ entity: component, system: parameters.system }) as number;
        })

    return average(secretsExternalizationValues);
}

export const suitablyReplicatedStatefulService: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponents = getIncludedComponents(parameters.entity, parameters.system);

    let allStatefulBackingServices = includedComponents
        .filter(component => [StorageBackingService.name, BackingService.name, BrokerBackingService.name].includes(component.constructor.name)
            && !component.getProperty("stateless").value);

    if (allStatefulBackingServices.length === 0) {
        return "n/a";
    }

    let deploymentMappings: Map<string, DeploymentMapping[]> = new Map();
    allStatefulBackingServices.forEach(service => deploymentMappings.set(service.getId, []));

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
            let replicatedService = allStatefulBackingServices.find(service => {
                return service.getId == serviceId
            });
            if (replicatedService.getProperty("replication_strategy").value !== "none") {
                suitablyReplicated.add(serviceId);
            }
        }
    });


    if (replicated.size === 0) {
        return "n/a";
    }

    return suitablyReplicated.size / replicated.size;
}

export const ratioOfUniqueAccountUsage: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let accounts = new Set();

    let includedComponents = getIncludedComponents(parameters.entity, parameters.system);

    for (const component of includedComponents) {

        let componentAccounts = new Set(Object.entries(component.getProperty("identities").value).filter(([identifier, identityType]) => identityType === "account").map(([identifier, identityType]) => identifier));
        if (componentAccounts.size === 0) {
            accounts.add("default-account");
        } else {
            componentAccounts.forEach(account => accounts.add(account));
        }
    }

    let includedComponentIds = includedComponents.map(component => component.getId);

    let supportingInfrastructure = new Set<Infrastructure>();

    for (const [deploymentMappingId, deploymentMapping] of parameters.system.getDeploymentMappingEntities.entries()) {
        if (includedComponentIds.includes(deploymentMapping.getDeployedEntity.getId)) {
            supportingInfrastructure.add(deploymentMapping.getUnderlyingInfrastructure);
            let infrastructureAccounts = new Set(Object.entries(deploymentMapping.getUnderlyingInfrastructure.getProperty("identities").value).filter(([identifier, identityType]) => identityType === "account").map(([identifier, identityType]) => identifier));
            if (infrastructureAccounts.size === 0) {
                accounts.add("default-account");
            } else {
                infrastructureAccounts.forEach(account => accounts.add(account));
            }
        }
    }

    let componentsAndInfrastructure = includedComponents.length + supportingInfrastructure.size;
    if (componentsAndInfrastructure === 0) {
        return "n/a";
    }

    return accounts.size / componentsAndInfrastructure;
}

export const accessRestrictedToCallers: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponents = getIncludedComponents(parameters.entity, parameters.system);

    if (includedComponents.length == 0) {
        return "n/a";
    }

    let accessRestrictedToCallersPerComponent = includedComponents.map((component) => componentMeasureImplementations["accessRestrictedToCallers"]({ entity: component, system: parameters.system }));

    let validValues = accessRestrictedToCallersPerComponent.filter(value => value !== "n/a");

    if (validValues.length === 0) {
        return "n/a"
    } else {
        return average(validValues as number[]);
    }
}

export const ratioOfDelegatedAuthentication: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let allComponents = getIncludedComponents(parameters.entity, parameters.system).filter(component => {
        return component.constructor.name !== BackingService.name || component.getProperty("providedFunctionality").value !== "authentication/authorization"
    })


    if (allComponents.length === 0) {
        return "n/a";
    }

    return average(allComponents.map(component => {
        if (component.getAuthenticationBy) {
            return 1;
        } else {
            return 0;
        }
    }));

}

export const ratioOfStandardizedArtifacts: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let allArtifacts = new Map<string, Artifact>();

    let includedComponentIds = getIncludedComponents(parameters.entity, parameters.system).map(component => component.getId);
    let supportingInfrastructure = new Set<Infrastructure>();
    for (const [deploymentMappingId, deploymentMapping] of parameters.system.getDeploymentMappingEntities.entries()) {
        if (includedComponentIds.includes(deploymentMapping.getDeployedEntity.getId)) {
            supportingInfrastructure.add(deploymentMapping.getUnderlyingInfrastructure);
        }
    }

    getIncludedComponents(parameters.entity, parameters.system).forEach((component) => {
        component.getArtifacts.entries().forEach(([artifactKey, artifact]) => {
            allArtifacts.set(`${component.getId}-${artifactKey}`, artifact);
        })
    })

    supportingInfrastructure.forEach(infrastructure => {
        infrastructure.getArtifacts.entries().forEach(([artifactKey, artifact]) => {
            allArtifacts.set(`${infrastructure.getId}-${artifactKey}`, artifact);
        })
    })

    if (allArtifacts.size === 0) {
        return "n/a";
    }

    let standardized = allArtifacts.entries().filter(([key, artifact]) => artifact.getProperty("based_on_standard") && artifact.getProperty("based_on_standard").value !== "none").toArray();

    return standardized.length / allArtifacts.size;
}

export const ratioOfEntitiesProvidingStandardizedArtifacts: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponentIds = getIncludedComponents(parameters.entity, parameters.system).map(component => component.getId);
    let supportingInfrastructure = new Set<Infrastructure>();
    for (const [deploymentMappingId, deploymentMapping] of parameters.system.getDeploymentMappingEntities.entries()) {
        if (includedComponentIds.includes(deploymentMapping.getDeployedEntity.getId)) {
            supportingInfrastructure.add(deploymentMapping.getUnderlyingInfrastructure);
        }
    }

    let providesStandardizedArtifact = new Set<string>();

    if (getIncludedComponents(parameters.entity, parameters.system).length + supportingInfrastructure.size === 0) {
        return "n/a";
    }

    getIncludedComponents(parameters.entity, parameters.system).forEach(component => {
        let standardizedArtifacts = component.getArtifacts.entries().filter(([key, artifact]) => artifact.getProperty("based_on_standard") && artifact.getProperty("based_on_standard").value !== "none").toArray();
        if (standardizedArtifacts.length > 0) {
            providesStandardizedArtifact.add(component.getId);
        }
    })

    supportingInfrastructure.forEach(infrastructure => {
        let standardizedArtifacts = infrastructure.getArtifacts.entries().filter(([key, artifact]) => artifact.getProperty("based_on_standard") && artifact.getProperty("based_on_standard").value !== "none").toArray();
        if (standardizedArtifacts.length > 0) {
            providesStandardizedArtifact.add(infrastructure.getId);
        }
    })

    return providesStandardizedArtifact.size / (includedComponentIds.length + supportingInfrastructure.size);
}

export const componentArtifactsSimilarity: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponents = getIncludedComponents(parameters.entity, parameters.system)

    if (includedComponents.length <= 1) {
        return "n/a";
    }

    let comparisons = [];

    for (const [index, componentA] of includedComponents.entries()) {
        if (index < includedComponents.length - 1) {
            for (const componentB of includedComponents.slice(index + 1)) {
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

export const ratioOfDeploymentsOnDynamicInfrastructure: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponentIds = getIncludedComponents(parameters.entity, parameters.system).map(component => component.getId);

    let infrastructureOfDeploymentMappingsForComponents = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return includedComponentIds.includes(deploymentMapping.getDeployedEntity.getId);
    }).map(([deploymentMappingKey, deploymentMapping]) => deploymentMapping.getUnderlyingInfrastructure).toArray();

    if (infrastructureOfDeploymentMappingsForComponents.length === 0) {
        return "n/a";
    }

    let dynamicDeployment = infrastructureOfDeploymentMappingsForComponents.filter(infrastructure => {
        return DYNAMIC_INFRASTRUCTURE.includes(infrastructure.getProperty("kind").value);
    })

    return dynamicDeployment.length / infrastructureOfDeploymentMappingsForComponents.length;

}

export const ratioOfEndpointsCoveredByContract: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let allEndpoints = parameters.entity.getLinks.flatMap(links => links).map(link => link.getTargetEndpoint);
    if (parameters.entity.getExternalEndpoint) {
        allEndpoints.push(parameters.entity.getExternalEndpoint);
    }

    if (allEndpoints.length === 0) {
        return "n/a";
    }

    let coveredByContractIds = [];

    for (const endpoint of allEndpoints) {
        let parentComponent = parameters.system.searchComponentOfEndpoint(endpoint.getId);
        if (parentComponent) {

            let componentArtifacts = parentComponent.getArtifacts;

            let contractArtifact = endpoint.getDocumentedBy.map(artifactKey => componentArtifacts.get(artifactKey)).find(artifact => {
                return CONTRACT_ARTIFACT_TYPE.includes(artifact.getType());
            })
            if (contractArtifact) {
                coveredByContractIds.push(endpoint.getId);
            }
        }
    }

    return coveredByContractIds.length / allEndpoints.length;
}


export const standardizedDeployments: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let includedComponentIds = getIncludedComponents(parameters.entity, parameters.system).map(component => component.getId);

    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return includedComponentIds.includes(deploymentMapping.getDeployedEntity.getId);
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

export const selfContainedDeployments: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let includedComponentIds = getIncludedComponents(parameters.entity, parameters.system).map(component => component.getId);

    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return includedComponentIds.includes(deploymentMapping.getDeployedEntity.getId);
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

export const ratioOfDocumentedEndpoints: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allEndpoints = parameters.entity.getLinks.flatMap(links => links).map(link => link.getTargetEndpoint);
    if (parameters.entity.getExternalEndpoint) {
        allEndpoints.push(parameters.entity.getExternalEndpoint);
    }

    if (allEndpoints.length === 0) {
        return "n/a";
    }

    let documented = [];

    for (const endpoint of allEndpoints) {
        if (endpoint.getDocumentedBy.length > 0) {
            documented.push(endpoint.getId);
        }
    }

    return documented.length / allEndpoints.length;
}

export const ratioOfEndpointsThatSupportTokenBasedAuthentication: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allEndpoints = parameters.entity.getLinks.flatMap(links => links).map(link => link.getTargetEndpoint);
    if (parameters.entity.getExternalEndpoint) {
        allEndpoints.push(parameters.entity.getExternalEndpoint);
    }

    if (allEndpoints.length === 0) {
        return "n/a";
    }

    let supportingToken = [];

    for (const endpoint of allEndpoints) {
        if (endpoint.getProperty("supported_authentication_methods").value.includes("Token")) {
            supportingToken.push(endpoint.getId);
        }
    }

    return supportingToken.length / allEndpoints.length;
}

export const ratioOfEndpointsThatSupportApiKeys: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allEndpoints = parameters.entity.getLinks.flatMap(links => links).map(link => link.getTargetEndpoint);
    if (parameters.entity.getExternalEndpoint) {
        allEndpoints.push(parameters.entity.getExternalEndpoint);
    }

    if (allEndpoints.length === 0) {
        return "n/a";
    }

    let supportingToken = [];

    for (const endpoint of allEndpoints) {
        if (endpoint.getProperty("supported_authentication_methods").value.includes("API-Key")) {
            supportingToken.push(endpoint.getId);
        }
    }

    return supportingToken.length / allEndpoints.length;
}


export const ratioOfEndpointsThatSupportPlaintextAuthentication: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allEndpoints = parameters.entity.getLinks.flatMap(links => links).map(link => link.getTargetEndpoint);
    if (parameters.entity.getExternalEndpoint) {
        allEndpoints.push(parameters.entity.getExternalEndpoint);
    }

    if (allEndpoints.length === 0) {
        return "n/a";
    }

    let supportingToken = [];

    for (const endpoint of allEndpoints) {
        if (endpoint.getProperty("supported_authentication_methods").value.includes("basic_authentication")) {
            supportingToken.push(endpoint.getId);
        }
    }

    return supportingToken.length / allEndpoints.length;
}


export const ratioOfEndpointsThatAreIncludedInASingleSignOnApproach: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allEndpoints = parameters.entity.getLinks.flatMap(links => links).map(link => link.getTargetEndpoint);
    if (parameters.entity.getExternalEndpoint) {
        allEndpoints.push(parameters.entity.getExternalEndpoint);
    }

    if (allEndpoints.length === 0) {
        return "n/a";
    }

    let supportingToken = [];

    for (const endpoint of allEndpoints) {
        if (endpoint.getProperty("supported_authentication_methods").value.includes("Single Sign-On")) {
            supportingToken.push(endpoint.getId);
        }
    }

    return supportingToken.length / allEndpoints.length;
}

export const iendpointAccessMethodsConsistency: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allEndpoints = parameters.entity.getLinks.flatMap(links => links).map(link => link.getTargetEndpoint);

    let endpointsWithAccessControl = allEndpoints.filter(endpoint => endpoint.getProperty("supported_authentication_methods").value.length !== 0);


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

export const degreeToWhichComponentsAreLinkedToStatefulComponents: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponents = getIncludedComponents(parameters.entity, parameters.system);

    if (includedComponents.length === 0) {
        return "n/a";
    }

    let degrees = [];
    for (const component of includedComponents) {
        let connectedToComponents = new Set<string>();
        let connectedToStatefulComponents = new Set<string>();

        for (const link of parameters.system.getOutgoingLinksOfComponent(component.getId).filter(outgoingLink => parameters.entity.getLinks.flatMap(step => step).map(link => link.getId).includes(outgoingLink.getId))) {

            let connectedToComponent = parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId)
            connectedToComponents.add(connectedToComponent.getId);
            if (!connectedToComponent.getProperty("stateless").value) {
                connectedToStatefulComponents.add(connectedToComponent.getId);
            }
        }
        if (connectedToComponents.size > 0) {
            degrees.push(connectedToStatefulComponents.size / connectedToComponents.size);
        }
    }

    if (degrees.length === 0) {
        return "n/a";
    }

    return average(degrees);
}

export const ratioOfSpecializedStatefulServices: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponents = getIncludedComponents(parameters.entity, parameters.system);

    if (includedComponents.length === 0) {
        return "n/a";
    }

    let statefulServices = includedComponents.filter(component => !component.getProperty("stateless").value);

    if (statefulServices.length === 0) {
        return "n/a";
    }

    let specializedServices: string[] = [];

    for (const statefulService of statefulServices) {
        if ([StorageBackingService.name, BackingService.name, BrokerBackingService.name].includes(statefulService.constructor.name)) {
            specializedServices.push(statefulService.getId);
        }
    }

    return specializedServices.length / statefulServices.length;
}

export const degreeOfSeparationByGateways: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allServicesWithGateway = getIncludedComponents(parameters.entity, parameters.system)
        .filter(component => component.constructor.name === Service.name)
        .filter(component => component.getExternalIngressProxiedBy && component.getExternalIngressProxiedBy.getProperty("kind").value === "API Gateway");

    if (allServicesWithGateway.length === 0) {
        return "n/a";
    }

    let gateways = new Set<string>();
    allServicesWithGateway.forEach(service => {
        gateways.add(service.getExternalIngressProxiedBy.getId);
    })

    if (gateways.size === 0) {
        return "n/a";
    }

    let degreeOfSharing = allServicesWithGateway.length / gateways.size;

    return 1 / degreeOfSharing;
}

export const serviceInteractionViaBackingService: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponents = getIncludedComponents(parameters.entity, parameters.system);
    let includedLinks = parameters.entity.getLinks.flatMap(step => step);

    let serviceInteractions = getServiceInteractions(includedComponents,
        includedLinks,
        parameters.system
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

export const rollingUpdates: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponentIds = getIncludedComponents(parameters.entity, parameters.system).map(component => component.getId);

    let deploymentMappingsForThisRequestTrace = [...parameters.system.getDeploymentMappingEntities.values()]
        .filter(deploymentMapping => includedComponentIds.includes(deploymentMapping.getDeployedEntity.getId));

    if (deploymentMappingsForThisRequestTrace.length === 0) {
        return "n/a";
    }

    let rolling = [];

    deploymentMappingsForThisRequestTrace.forEach(deploymentMapping => {
        if (ROLLING_UPDATE_STRATEGY_OPTIONS.includes(deploymentMapping.getProperty("update_strategy").value)) {
            rolling.push(deploymentMapping.getId);
        }
    })

    return rolling.length / deploymentMappingsForThisRequestTrace.length;
}

export const ratioOfComponentsWhoseExternalIngressIsProxied: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponents = getIncludedComponents(parameters.entity, parameters.system)

    const proxyComponents = parameters.system.getComponentEntities.entries().filter(([componentId, component]) => component.constructor.name !== ProxyBackingService.name).toArray();

    if (includedComponents.length === 0 || proxyComponents.length === 0) {
        return "n/a";
    }

    let allComponentsWithExternalEndpoints = 0;
    let numberOfComponentsWithProxiedExternalIngress = 0;

    for (const component of includedComponents) {
        if (component.getExternalEndpointEntities.length > 0) {
            allComponentsWithExternalEndpoints++;
            if (component.getExternalIngressProxiedBy) {
                numberOfComponentsWithProxiedExternalIngress++;
            }
        }
    }

    if (allComponentsWithExternalEndpoints === 0) {
        return "n/a";
    }

    return numberOfComponentsWithProxiedExternalIngress / allComponentsWithExternalEndpoints;
}

export const numberOfAvailabilityZonesUsedByServices: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponents = getIncludedComponents(parameters.entity, parameters.system)

    let allServiceIds = includedComponents
        .filter((component) => component.constructor.name === Service.name)
        .map((component) => component.getId);

    if (allServiceIds.length === 0) {
        return "n/a";
    }

    let deploymentMappingsForServices = [...parameters.system.getDeploymentMappingEntities.values()].filter(deploymentMapping => allServiceIds.includes(deploymentMapping.getDeployedEntity.getId));

    if (deploymentMappingsForServices.length === 0) {
        return "n/a";
    }

    let infrastructureForServices = deploymentMappingsForServices.map(deploymentMapping => deploymentMapping.getUnderlyingInfrastructure);

    let availabilityZones: Set<string> = new Set();

    infrastructureForServices.forEach(infrastructure => {
        let usedAvailabilityZones = (infrastructure.getProperty("availability_zone").value as string).split(",");
        usedAvailabilityZones.forEach(zoneId => availabilityZones.add(zoneId));
    })

    return availabilityZones.size;
}

export const numberOfAvailabilityZonesUsedByStorageServices: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedComponents = getIncludedComponents(parameters.entity, parameters.system)

    let allStorageServiceIds = includedComponents
        .filter(component => component.constructor.name === StorageBackingService.name)
        .map(component => component.getId);

    if (allStorageServiceIds.length === 0) {
        return "n/a";
    }

    let deploymentMappingsForServices = [...parameters.system.getDeploymentMappingEntities.values()].filter(deploymentMapping => allStorageServiceIds.includes(deploymentMapping.getDeployedEntity.getId));

    if (deploymentMappingsForServices.length === 0) {
        return "n/a";
    }

    let infrastructureForStorageServices = deploymentMappingsForServices.map(deploymentMapping => deploymentMapping.getUnderlyingInfrastructure);

    let availabilityZones: Set<string> = new Set();

    infrastructureForStorageServices.forEach(infrastructure => {
        let usedAvailabilityZones = (infrastructure.getProperty("availability_zone").value as string).split(",");
        usedAvailabilityZones.forEach(zoneId => availabilityZones.add(zoneId));
    })

    return availabilityZones.size;
}

export const ratioOfLinksWithTimeout: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let includedLinks = parameters.entity.getLinks.flatMap(step => step);

    if (includedLinks.length === 0) {
        return "n/a";
    }

    let linksWithTimeout = includedLinks.filter(link => link.getProperty("timeout").value > 0);

    return linksWithTimeout.length / includedLinks.length;
}

export const ratioOfExternalEndpointsSupportingTls: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let allExternalEndpoints = [];

    let allEndpoints = parameters.entity.getLinks.flatMap(links => links).map(link => link.getTargetEndpoint);
    allEndpoints.forEach(endpoint => {
        if (endpoint.constructor.name === ExternalEndpoint.name) {
            allExternalEndpoints.push(endpoint);
        }
    })


    if (parameters.entity.getExternalEndpoint) {
        allExternalEndpoints.push(parameters.entity.getExternalEndpoint);
    }

    return calculateRatioOfExternalEndpointsSupportingTls(allExternalEndpoints);
}

export const degreeOfAsynchronousCommunication: Calculation = (parameters: CalculationParameters<RequestTrace>) => {
    let allEndpoints = parameters.entity.getLinks.flatMap(links => links).map(link => link.getTargetEndpoint);
    if (parameters.entity.getExternalEndpoint) {
        allEndpoints.push(parameters.entity.getExternalEndpoint);
    }

    if (allEndpoints.length === 0) {
        return "n/a";
    }

    let asynchronousEndpoints: string[] = [];

    for (const endpoint of allEndpoints) {

        if (ASYNCHRONOUS_ENDPOINT_KIND.includes(endpoint.getProperty("kind").value)) {
            asynchronousEndpoints.push(endpoint.getId);
        }
    }

    return asynchronousEndpoints.length / allEndpoints.length
}


export const ratioOfRateLimitingEndpoints: Calculation = (parameters: CalculationParameters<RequestTrace>) => {

    let allEndpoints = parameters.entity.getLinks.flatMap(links => links).map(link => link.getTargetEndpoint);
    if (parameters.entity.getExternalEndpoint) {
        allEndpoints.push(parameters.entity.getExternalEndpoint);
    }

    if (allEndpoints.length === 0) {
        return "n/a";
    }

    return allEndpoints.filter(endpoint => endpoint.getProperty("rate_limiting").value !== "none").length / allEndpoints.length;
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
    "ratioOfServicesThatProvideReadinessEndpoints": ratioOfServicesThatProvideReadinessEndpoints,
    "maximumNumberOfServicesWithinARequestTrace": maximumNumberOfServicesWithinARequestTrace,
    "databaseTypeUtilization": databaseTypeUtilization,
    "serviceDiscoveryUsage": serviceDiscoveryUsage,
    "serviceReplicationLevel": serviceReplicationLevel,
    "medianServiceReplication": medianServiceReplication,
    "smallestReplicationValue": smallestReplicationValue,
    "storageReplicationLevel": storageReplicationLevel,
    "numberOfAvailabilityZonesUsedByInfrastructure": numberOfAvailabilityZonesUsedByInfrastructure,
    "ratioOfLinksWithRetryLogic": ratioOfLinksWithRetryLogic,
    "ratioOfLinksWithComplexFailover": ratioOfLinksWithComplexFailover,
    "amountOfRedundancy": amountOfRedundancy,
    "dataShardingLevel": dataShardingLevel,
    "serviceMeshUsage": serviceMeshUsage,
    "configurationExternalization": configurationExternalization,
    "secretsExternalization": secretsExternalization,
    "suitablyReplicatedStatefulService": suitablyReplicatedStatefulService,
    "ratioOfUniqueAccountUsage": ratioOfUniqueAccountUsage,
    "accessRestrictedToCallers": accessRestrictedToCallers,
    "ratioOfDelegatedAuthentication": ratioOfDelegatedAuthentication,
    "ratioOfStandardizedArtifacts": ratioOfStandardizedArtifacts,
    "ratioOfEntitiesProvidingStandardizedArtifacts": ratioOfEntitiesProvidingStandardizedArtifacts,
    "componentArtifactsSimilarity": componentArtifactsSimilarity,
    "ratioOfDeploymentsOnDynamicInfrastructure": ratioOfDeploymentsOnDynamicInfrastructure,
    "ratioOfEndpointsCoveredByContract": ratioOfEndpointsCoveredByContract,
    "standardizedDeployments": standardizedDeployments,
    "selfContainedDeployments": selfContainedDeployments,
    "ratioOfDocumentedEndpoints": ratioOfDocumentedEndpoints,
    "ratioOfEndpointsThatSupportTokenBasedAuthentication": ratioOfEndpointsThatSupportTokenBasedAuthentication,
    "ratioOfEndpointsThatSupportApiKeys": ratioOfEndpointsThatSupportApiKeys,
    "ratioOfEndpointsThatSupportPlaintextAuthentication": ratioOfEndpointsThatSupportPlaintextAuthentication,
    "ratioOfEndpointsThatAreIncludedInASingleSignOnApproach": ratioOfEndpointsThatAreIncludedInASingleSignOnApproach,
    "iendpointAccessMethodsConsistency": iendpointAccessMethodsConsistency,
    "degreeToWhichComponentsAreLinkedToStatefulComponents": degreeToWhichComponentsAreLinkedToStatefulComponents,
    "ratioOfSpecializedStatefulServices": ratioOfSpecializedStatefulServices,
    "degreeOfSeparationByGateways": degreeOfSeparationByGateways,
    "serviceInteractionViaBackingService": serviceInteractionViaBackingService,
    "rollingUpdates": rollingUpdates,
    "ratioOfComponentsWhoseExternalIngressIsProxied": ratioOfComponentsWhoseExternalIngressIsProxied,
    "numberOfAvailabilityZonesUsedByServices": numberOfAvailabilityZonesUsedByServices,
    "numberOfAvailabilityZonesUsedByStorageServices": numberOfAvailabilityZonesUsedByStorageServices,
    "ratioOfLinksWithTimeout": ratioOfLinksWithTimeout,
    "ratioOfExternalEndpointsSupportingTls": ratioOfExternalEndpointsSupportingTls,
    "degreeOfAsynchronousCommunication": degreeOfAsynchronousCommunication,
    "ratioOfRateLimitingEndpoints": ratioOfRateLimitingEndpoints
}

