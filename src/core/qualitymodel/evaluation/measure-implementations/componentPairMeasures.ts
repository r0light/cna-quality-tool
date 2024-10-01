import { Component, System } from "../../../entities.js";
import { Calculation, CalculationParameters, MeasureValue } from "../../quamoco/Measure.js";

export const couplingOfServicesBasedOnUsedDataAggregates= (parameters: {entityA: Component, entityB: Component, system: System}) => {
    let dataAggregatesUsedByA = new Set<string>(parameters.entityA.getDataAggregateEntities.map(dataAggregate => dataAggregate.data.getId));
    let dataAggregatesUsedByB = new Set<string>(parameters.entityB.getDataAggregateEntities.map(dataAggregate => dataAggregate.data.getId));

    if (dataAggregatesUsedByA.union(dataAggregatesUsedByB).size === 0) {
        return 0;
    }

    return dataAggregatesUsedByA.intersection(dataAggregatesUsedByB).size / dataAggregatesUsedByA.union(dataAggregatesUsedByB).size;
}

export const couplingOfServicesBasedServicesWhichCallThem = (parameters: {entityA: Component, entityB: Component, system: System}) => {
    let servicesWhichCallA = new Set<string>(parameters.system.getIncomingLinksOfComponent(parameters.entityA.getId).map(link => link.getSourceEntity.getId));
    let servicesWhichCallB = new Set<string>(parameters.system.getIncomingLinksOfComponent(parameters.entityB.getId).map(link => link.getSourceEntity.getId));

    if (servicesWhichCallA.union(servicesWhichCallB).size === 0) {
        return 0;
    }

    return servicesWhichCallA.intersection(servicesWhichCallB).size / servicesWhichCallA.union(servicesWhichCallB).size;
}

export const couplingOfServicesBasedServicesWhichAreCalledByThem = (parameters: {entityA: Component, entityB: Component, system: System}) => {
    let servicesCalledByA = new Set<string>(parameters.system.getOutgoingLinksOfComponent(parameters.entityA.getId).map(link => parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId));

    let servicesCalledByB = new Set<string>(parameters.system.getOutgoingLinksOfComponent(parameters.entityB.getId).map(link => parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId));

    if (servicesCalledByA.union(servicesCalledByB).size === 0) {
        return 0;
    }

    return servicesCalledByA.intersection(servicesCalledByB).size / servicesCalledByA.union(servicesCalledByB).size
}


export const couplingOfServicesBasedOnAmountOfRequestTracesThatIncludeASpecificLink = (parameters:{entityA: Component, entityB: Component, system: System}) => {

    let allRequestTraces = parameters.system.getRequestTraceEntities;

    let requestTracesIncludingA = new Set<string>();
    let requestTracesIncludingB = new Set<string>();
    let requestTracesInWhichACallsB = new Set<string>();
    let requestTracesInWhichBCallsA = new Set<string>();

    for (const [requestTraceId, requestTrace] of allRequestTraces.entries()) {
        for (const link of requestTrace.getLinks.flat()) {
            let callingComponentId = link.getSourceEntity.getId;
            let calledComponentId = parameters.system.searchComponentOfEndpoint(link.getTargetEndpoint.getId).getId;

            let aIsCalling = callingComponentId === parameters.entityA.getId;
            let bIsCalled = calledComponentId === parameters.entityB.getId;
            let bIsCalling = callingComponentId === parameters.entityB.getId;
            let aIsCalled = calledComponentId === parameters.entityA.getId;

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

export const couplingOfServicesBasedTimesThatTheyOccurInTheSameRequestTrace = (parameters: {entityA: Component, entityB: Component, system: System}) => {
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

            let aIsCalling = callingComponentId === parameters.entityA.getId;
            let bIsCalled = calledComponentId === parameters.entityB.getId;
            let bIsCalling = callingComponentId === parameters.entityB.getId;
            let aIsCalled = calledComponentId === parameters.entityA.getId;

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

export const numberOfLinksBetweenTwoServices = (parameters: {entityA: Component, entityB: Component, system: System}) => {
    let numberOfLinksFromAToB = 0;
    let idA: string = parameters.entityA.getId;
    let endpointIdsOfB: string[] = parameters.entityB.getEndpointEntities.concat(parameters.entityB.getExternalEndpointEntities).map(endpoint => endpoint.getId);

    for (const [linkId, link] of parameters.system.getLinkEntities) {
        if (link.getSourceEntity.getId === idA && endpointIdsOfB.includes(link.getTargetEndpoint.getId)) {
            numberOfLinksFromAToB++;
        }
    }

    return numberOfLinksFromAToB;
}

export const componentPairMeasureImplementations: { [measureKey: string]: (parameters: {entityA: Component, entityB: Component, system: System}) => MeasureValue } = {
    "couplingOfServicesBasedOnUsedDataAggregates": couplingOfServicesBasedOnUsedDataAggregates,
    "couplingOfServicesBasedServicesWhichCallThem": couplingOfServicesBasedServicesWhichCallThem,
    "couplingOfServicesBasedServicesWhichAreCalledByThem": couplingOfServicesBasedServicesWhichAreCalledByThem,
    "couplingOfServicesBasedOnAmountOfRequestTracesThatIncludeASpecificLink": couplingOfServicesBasedOnAmountOfRequestTracesThatIncludeASpecificLink,
    "couplingOfServicesBasedTimesThatTheyOccurInTheSameRequestTrace": couplingOfServicesBasedTimesThatTheyOccurInTheSameRequestTrace,
    "numberOfLinksBetweenTwoServices": numberOfLinksBetweenTwoServices
}
