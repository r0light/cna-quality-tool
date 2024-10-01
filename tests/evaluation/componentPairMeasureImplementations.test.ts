import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { DataAggregate, Endpoint, ExternalEndpoint, Link, RequestTrace, Service, System } from "@/core/entities";
import { RelationToDataAggregate } from "@/core/entities/relationToDataAggregate";
import { componentPairMeasureImplementations } from "@/core/qualitymodel/evaluation/measure-implementations/componentPairMeasures";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { expect, test } from "vitest";


test("couplingOfServicesBasedOnUsedDataAggregates", () => {
    let system = new System("sys1", "testSystem");


    let dataAggregateA = new DataAggregate("d1", "data 1", getEmptyMetaData());
    let dataAggregateB = new DataAggregate("d2", "data 2", getEmptyMetaData());
    let dataAggregateC = new DataAggregate("d3", "data 3", getEmptyMetaData());
    let dataAggregateD = new DataAggregate("d4", "data 4", getEmptyMetaData());


    let serviceA = new Service("s1", "testService 1", getEmptyMetaData());
    serviceA.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r1", getEmptyMetaData()));
    serviceA.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r2", getEmptyMetaData()));
    serviceA.addDataAggregateEntity(dataAggregateC, new RelationToDataAggregate("r3", getEmptyMetaData()));

    let serviceB = new Service("s2", "testService 2", getEmptyMetaData());
    serviceB.addDataAggregateEntity(dataAggregateC, new RelationToDataAggregate("r4", getEmptyMetaData()));
    serviceB.addDataAggregateEntity(dataAggregateD, new RelationToDataAggregate("r5", getEmptyMetaData()));

    system.addEntities([dataAggregateA, dataAggregateB, dataAggregateC, dataAggregateD]);
    system.addEntities([serviceA, serviceB]);

    let measureValue = componentPairMeasureImplementations["couplingOfServicesBasedOnUsedDataAggregates"]({entityA: serviceA, entityB: serviceB,  system: system});
    expect(measureValue).toEqual(1/4);

    })


test("couplingOfServicesBasedServicesWhichCallThem", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD =  new Service("s4", "testService", getEmptyMetaData());
    let serviceE =  new Service("s5", "testService", getEmptyMetaData());
    let serviceF =  new Service("s6", "testService", getEmptyMetaData());

    let linkAB = new Link("l1", serviceA, endpointA);
    let linkAC = new Link("l3", serviceA, endpointC);
    let linkDB = new Link("l4", serviceD, endpointA);
    let linkEC = new Link("l5", serviceE, endpointC);

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE, serviceF]);
    system.addEntities([linkAB, linkAC, linkDB, linkEC]);

    let measureValue = componentPairMeasureImplementations["couplingOfServicesBasedServicesWhichCallThem"]({entityA: serviceB, entityB: serviceC, system: system});
    expect(measureValue).toEqual(1/3);
})

test("couplingOfServicesBasedServicesWhichAreCalledByThem", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD =  new Service("s4", "testService", getEmptyMetaData());
    let serviceE =  new Service("s5", "testService", getEmptyMetaData());
    let serviceF =  new Service("s6", "testService", getEmptyMetaData());

    let linkAB = new Link("l1", serviceA, endpointA);
    let linkAC = new Link("l3", serviceA, endpointC);
    let linkDB = new Link("l4", serviceD, endpointA);
    let linkEC = new Link("l5", serviceE, endpointC);

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE, serviceF]);
    system.addEntities([linkAB, linkAC, linkDB, linkEC]);

    let measureValue = componentPairMeasureImplementations["couplingOfServicesBasedServicesWhichAreCalledByThem"]({entityA: serviceA, entityB: serviceD, system: system});
    expect(measureValue).toEqual(1/2);

})

test("couplingOfServicesBasedOnAmountOfRequestTracesThatIncludeASpecificLink", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD =  new Service("s4", "testService", getEmptyMetaData());

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l4", serviceD, endpointB);

    let requestTraceX = new RequestTrace("rq1", "Request Trace X", getEmptyMetaData());
    requestTraceX.setLinks = [[linkAB], [linkBC]];

    let requestTraceY = new RequestTrace("rq2", "Request Trace Y", getEmptyMetaData());
    requestTraceY.setLinks = [[linkDB], [linkBC]]

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkDB]);
    system.addEntities([requestTraceX, requestTraceY]);

    let measureValue = componentPairMeasureImplementations["couplingOfServicesBasedOnAmountOfRequestTracesThatIncludeASpecificLink"]({entityA: serviceD, entityB: serviceB, system: system});
    expect(measureValue).toEqual(1/2);
})

test("couplingOfServicesBasedTimesThatTheyOccurInTheSameRequestTrace", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD =  new Service("s4", "testService", getEmptyMetaData());

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l4", serviceD, endpointB);

    let requestTraceX = new RequestTrace("rq1", "Request Trace X", getEmptyMetaData());
    requestTraceX.setLinks = [[linkAB], [linkBC]];

    let requestTraceY = new RequestTrace("rq2", "Request Trace Y", getEmptyMetaData());
    requestTraceY.setLinks = [[linkDB], [linkBC]]

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkDB]);
    system.addEntities([requestTraceX, requestTraceY]);

    let measureValue = componentPairMeasureImplementations["couplingOfServicesBasedTimesThatTheyOccurInTheSameRequestTrace"]({entityA: serviceA, entityB: serviceB, system: system});
    expect(measureValue).toEqual(1/2);
})

test("numberOfLinksBetweenTwoServices", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB1 = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointB1);
    let endpointB2 = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB2);
    let endpointB3 = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceB.addEndpoint(endpointB3);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e4", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let linkAB1 = new Link("l1", serviceA, endpointB1);
    let linkAB2 = new Link("l2", serviceA, endpointB2);
    let linkAC = new Link("l3", serviceA, endpointC);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB1, linkAB2, linkAC]);

    let measureValue = componentPairMeasureImplementations["numberOfLinksBetweenTwoServices"]({entityA: serviceA, entityB: serviceB, system: system});
    expect(measureValue).toEqual(2);
})