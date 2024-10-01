import { RequestTrace } from "@/core/entities";
import { Calculation, CalculationParameters } from "../../quamoco/Measure";
import { average } from "./general-functions";
import { calculateRatioOfEndpointsSupportingSsl } from "./componentMeasures";
import { calculateRatioOfSecuredLinks } from "./systemMeasures";


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


export const requestTraceMeasureImplementations: { [measureKey: string]: Calculation } = {
    "ratioOfEndpointsSupportingSsl": ratioOfEndpointsSupportingSsl,
    "ratioOfSecuredLinks": ratioOfSecuredLinks,
    "requestTraceLength": requestTraceLength,
    "numberOfCyclesInRequestTraces": numberOfCyclesInRequestTraces,
    "dataReplicationAlongRequestTrace": dataReplicationAlongRequestTrace,
    "ratioOfStateDependencyOfEndpoints": ratioOfStateDependencyOfEndpoints
}

