import { Component, RequestTrace, System } from "@/core/entities";
import { Calculation, CalculationParameters } from "../../quamoco/Measure";
import { average } from "./general-functions";
import { calculateRatioOfEndpointsSupportingSsl } from "./componentMeasures";
import { calculateRatioOfLinksToAsynchronousEndpoints, calculateRatioOfSecuredLinks, calculateRatioOfStatefulComponents, calculateRatioOfStatelessComponents, getServiceInteractions } from "./systemMeasures";
import { EVENT_SOURCING_KIND } from "../../specifications/featureModel";

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

export const requestTraceMeasureImplementations: { [measureKey: string]: Calculation } = {
    "ratioOfEndpointsSupportingSsl": ratioOfEndpointsSupportingSsl,
    "ratioOfSecuredLinks": ratioOfSecuredLinks,
    "requestTraceLength": requestTraceLength,
    "numberOfCyclesInRequestTraces": numberOfCyclesInRequestTraces,
    "dataReplicationAlongRequestTrace": dataReplicationAlongRequestTrace,
    "ratioOfStateDependencyOfEndpoints": ratioOfStateDependencyOfEndpoints,
    "ratioOfStatefulComponents": ratioOfStatefulComponents,
    "ratioOfStatelessComponents": ratioOfStatelessComponents,
    "asynchronousCommunicationUtilization": asynchronousCommunicationUtilization,
    "eventSourcingUtilizationMetric": eventSourcingUtilizationMetric
}

