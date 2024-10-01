import { Component } from "../../../entities.js";
import { Calculation, CalculationParameters } from "../../quamoco/Measure.js";

export const couplingOfServicesBasedOnUsedDataAggregates: Calculation= (parameters: CalculationParameters<{entityA: Component, entityB: Component}>) => {
    let dataAggregatesUsedByA = new Set<string>(parameters.entity.entityA.getDataAggregateEntities.map(dataAggregate => dataAggregate.data.getId));
    let dataAggregatesUsedByB = new Set<string>(parameters.entity.entityB.getDataAggregateEntities.map(dataAggregate => dataAggregate.data.getId));

    if (dataAggregatesUsedByA.union(dataAggregatesUsedByB).size === 0) {
        return 0;
    }

    return dataAggregatesUsedByA.intersection(dataAggregatesUsedByB).size / dataAggregatesUsedByA.union(dataAggregatesUsedByB).size;
}

export const couplingOfServicesBasedServicesWhichCallThem: Calculation = (parameters: CalculationParameters<{entityA: Component, entityB: Component}>) => {
    let servicesWhichCallA = new Set<string>(parameters.system.getIncomingLinksOfComponent(parameters.entity.entityA.getId).map(link => link.getSourceEntity.getId));
    let servicesWhichCallB = new Set<string>(parameters.system.getIncomingLinksOfComponent(parameters.entity.entityB.getId).map(link => link.getSourceEntity.getId));

    if (servicesWhichCallA.union(servicesWhichCallB).size === 0) {
        return 0;
    }

    return servicesWhichCallA.intersection(servicesWhichCallB).size / servicesWhichCallA.union(servicesWhichCallB).size;
}

export const couplingOfServicesBasedServicesWhichAreCalledByThem: Calculation = (parameters: CalculationParameters<{entityA: Component, entityB: Component}>) => {
    let servicesCalledByA = new Set<string>(parameters.system.getOutgoingLinksOfComponent(parameters.entity.entityA.getId).map(link => parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId));

    let servicesCalledByB = new Set<string>(parameters.system.getOutgoingLinksOfComponent(parameters.entity.entityB.getId).map(link => parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId));

    if (servicesCalledByA.union(servicesCalledByB).size === 0) {
        return 0;
    }

    return servicesCalledByA.intersection(servicesCalledByB).size / servicesCalledByA.union(servicesCalledByB).size
}


export const couplingOfServicesBasedOnAmountOfRequestTracesThatIncludeASpecificLink: Calculation = (parameters: CalculationParameters<{entityA: Component, entityB: Component}>) => {

    let allRequestTraces = parameters.system.getRequestTraceEntities;

    let requestTracesIncludingA = new Set<string>();
    let requestTracesIncludingB = new Set<string>();
    let requestTracesInWhichACallsB = new Set<string>();
    let requestTracesInWhichBCallsA = new Set<string>();

    for (const [requestTraceId, requestTrace] of allRequestTraces.entries()) {
        for (const link of requestTrace.getLinks.flat()) {
            let callingComponentId = link.getSourceEntity.getId;
            let calledComponentId = parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId;

            let aIsCalling = callingComponentId === parameters.entity.entityA.getId;
            let bIsCalled = calledComponentId === parameters.entity.entityB.getId;
            let bIsCalling = callingComponentId === parameters.entity.entityB.getId;
            let aIsCalled = calledComponentId === parameters.entity.entityA.getId;

            if (aIsCalling || aIsCalled) {
                requestTracesIncludingA.add(requestTraceId);
                if (aIsCalling && bIsCalled) {
                    requestTracesInWhichACallsB.add(requestTraceId);
                }
            }
            if (bIsCalling || bIsCalled) {
                requestTracesIncludingB.add(requestTraceId);
                if (bIsCalled && aIsCalled) {
                    requestTracesInWhichBCallsA.add(requestTraceId);
                }
            }
        }
    }

    let probA = requestTracesIncludingB.size === 0 ? 0 : requestTracesInWhichACallsB.size / requestTracesIncludingB.size;
    let probB = requestTracesIncludingA.size === 0 ? 0 : requestTracesInWhichBCallsA.size / requestTracesIncludingA.size;

    return Math.max(probA, probB);
}

export const couplingOfServicesBasedTimesThatTheyOccurInTheSameRequestTrace: Calculation = (parameters: CalculationParameters<{entityA: Component, entityB: Component}>) => {
    let allRequestTraces = parameters.system.getRequestTraceEntities;

    if (allRequestTraces.size === 0) {
        return 0;
    }

    let requestTracesIncludingA = new Set<string>();
    let requestTracesIncludingB = new Set<string>();

    for (const [requestTraceId, requestTrace] of allRequestTraces.entries()) {
        for (const link of requestTrace.getLinks.flat()) {
            let callingComponentId = link.getSourceEntity.getId;
            let calledComponentId = parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId;

            let aIsCalling = callingComponentId === parameters.entity.entityA.getId;
            let bIsCalled = calledComponentId === parameters.entity.entityB.getId;
            let bIsCalling = callingComponentId === parameters.entity.entityB.getId;
            let aIsCalled = calledComponentId === parameters.entity.entityA.getId;

            if (aIsCalling || aIsCalled) {
                requestTracesIncludingA.add(requestTraceId);
            }
            if (bIsCalling || bIsCalled) {
                requestTracesIncludingB.add(requestTraceId);
            }
        }
    }

    return requestTracesIncludingA.intersection(requestTracesIncludingB).size / allRequestTraces.size;
}

export const numberOfLinksBetweenTwoServices: Calculation = (parameters: CalculationParameters<{entityA: Component, entityB: Component}>) => {
    let numberOfLinksFromAToB = 0;
    let idA: string = parameters.entity.entityA.getId;
    let endpointIdsOfB: string[] = parameters.entity.entityB.getEndpointEntities.concat(parameters.entity.entityB.getExternalEndpointEntities).map(endpoint => endpoint.getId);

    for (const [linkId, link] of parameters.system.getLinkEntities) {
        if (link.getSourceEntity.getId === idA && endpointIdsOfB.includes(link.getTargetEndpoint.getId)) {
            numberOfLinksFromAToB++;
        }
    }

    return numberOfLinksFromAToB;
}

export const componentPairMeasureImplementations: { [measureKey: string]: Calculation } = {
    "couplingOfServicesBasedOnUsedDataAggregates": couplingOfServicesBasedOnUsedDataAggregates,
    "couplingOfServicesBasedServicesWhichCallThem": couplingOfServicesBasedServicesWhichCallThem,
    "couplingOfServicesBasedServicesWhichAreCalledByThem": couplingOfServicesBasedServicesWhichAreCalledByThem,
    "couplingOfServicesBasedOnAmountOfRequestTracesThatIncludeASpecificLink": couplingOfServicesBasedOnAmountOfRequestTracesThatIncludeASpecificLink,
    "couplingOfServicesBasedTimesThatTheyOccurInTheSameRequestTrace": couplingOfServicesBasedTimesThatTheyOccurInTheSameRequestTrace,
    "numberOfLinksBetweenTwoServices": numberOfLinksBetweenTwoServices
}
