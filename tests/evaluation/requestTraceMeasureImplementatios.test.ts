import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { BackingData, BackingService, BrokerBackingService, DataAggregate, DeploymentMapping, Endpoint, ExternalEndpoint, Infrastructure, Link, RequestTrace, Service, StorageBackingService, System } from "@/core/entities";
import { RelationToBackingData } from "@/core/entities/relationToBackingData";
import { RelationToDataAggregate } from "@/core/entities/relationToDataAggregate";
import { requestTraceMeasureImplementations } from "@/core/qualitymodel/evaluation/measure-implementations/requestTraceMeasures";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { ENTITIES } from "@/core/qualitymodel/specifications/entities";
import { ASYNCHRONOUS_ENDPOINT_KIND, BACKING_DATA_LOGS_KIND, BACKING_DATA_METRICS_KIND, COMMAND_ENDPOINT_KIND, QUERY_ENDPOINT_KIND, SEND_EVENT_ENDPOINT_KIND, SUBSCRIBE_ENDPOINT_KIND, SYNCHRONOUS_ENDPOINT_KIND } from "@/core/qualitymodel/specifications/featureModel";
import { expect, test } from "vitest";

test("all implementation names refer to an existing measure", () => {
    let measureKeys = getQualityModel().measures.get(ENTITIES.REQUEST_TRACE).map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(requestTraceMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    measureImplementationKeys.forEach(key => {
        expect(measureKeys).include(key);
    })
})

test("all implemented measure must provide information on the calculation", () => {
    let measures = getQualityModel().measures.get(ENTITIES.REQUEST_TRACE);
    let measureKeys = measures.map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(requestTraceMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    for (const measure of measures) {
        if (measureImplementationKeys.includes(measure.getId)) {
            expect(measure.getCalculationDescription.length, `Implemented measure ${measure.getId} does not provide a calculation description`).toBeGreaterThan(0)
        }
    }
})

test("requestTraceLength", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let serviceE = new Service("s5", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    let externalEndpointE = new ExternalEndpoint("ex2", "external endpoint 2", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);
    serviceE.addEndpoint(externalEndpointE);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;



    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["requestTraceLength"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(3);


})

test("numberOfCyclesInRequestTraces", () => {

    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let serviceE = new Service("s5", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    let externalEndpointE = new ExternalEndpoint("ex2", "external endpoint 2", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);
    serviceE.addEndpoint(externalEndpointE);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l4", serviceD, endpointB);
    let linkCD = new Link("l5", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD], [linkDB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkCD, linkDB]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["numberOfCyclesInRequestTraces"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1);

})


test("dataReplicationAlongRequestTrace", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService A", getEmptyMetaData());
    let externalEndpoint = new ExternalEndpoint("ee1", "external endpoint", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpoint);

    let serviceB = new Service("s2", "testService B", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint B", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService C", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint C", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let dataAggregateA = new DataAggregate("da1", "data aggregate A", getEmptyMetaData());
    let dataAggregateB = new DataAggregate("da2", "data aggregate B", getEmptyMetaData());

    let storageServiceA = new StorageBackingService("sbs1", "storage service A", getEmptyMetaData());
    let endpointSA = new Endpoint("e4", "endpoint SA", getEmptyMetaData());
    storageServiceA.addEndpoint(endpointSA);

    let storageServiceB = new StorageBackingService("sbs2", "storage service B", getEmptyMetaData());
    let endpointSB = new Endpoint("e5", "endpoint SB", getEmptyMetaData());
    storageServiceB.addEndpoint(endpointSB);


    let usageAA = new RelationToDataAggregate("r1", getEmptyMetaData());
    usageAA.setPropertyValue("usage_relation", "usage");
    serviceA.addDataAggregateEntity(dataAggregateA, usageAA);

    let usageAB = new RelationToDataAggregate("r2", getEmptyMetaData());
    usageAB.setPropertyValue("usage_relation", "usage");
    serviceA.addDataAggregateEntity(dataAggregateB, usageAB);

    let usageEAA = new RelationToDataAggregate("r3", getEmptyMetaData());
    usageEAA.setPropertyValue("usage_relation", "usage");
    externalEndpoint.addDataAggregateEntity(dataAggregateA, usageEAA);

    let usageEAB = new RelationToDataAggregate("r4", getEmptyMetaData());
    usageEAB.setPropertyValue("usage_relation", "usage");
    externalEndpoint.addDataAggregateEntity(dataAggregateB, usageEAB);


    let usageBA = new RelationToDataAggregate("r5", getEmptyMetaData());
    usageBA.setPropertyValue("usage_relation", "cached-usage");
    serviceB.addDataAggregateEntity(dataAggregateA, usageBA);

    let usageBB = new RelationToDataAggregate("r6", getEmptyMetaData());
    usageBB.setPropertyValue("usage_relation", "cached-usage");
    serviceB.addDataAggregateEntity(dataAggregateB, usageBB);

    let usageEBA = new RelationToDataAggregate("r7", getEmptyMetaData());
    usageEBA.setPropertyValue("usage_relation", "cached-usage");
    endpointB.addDataAggregateEntity(dataAggregateA, usageEBA);

    let usageEBB = new RelationToDataAggregate("r8", getEmptyMetaData());
    usageEBB.setPropertyValue("usage_relation", "cached-usage");
    endpointB.addDataAggregateEntity(dataAggregateB, usageEBB);



    let usageCB = new RelationToDataAggregate("r9", getEmptyMetaData());
    usageCB.setPropertyValue("usage_relation", "cached-usage");
    serviceC.addDataAggregateEntity(dataAggregateB, usageCB);

    let usageECB = new RelationToDataAggregate("r10", getEmptyMetaData());
    usageECB.setPropertyValue("usage_relation", "cached-usage");
    endpointC.addDataAggregateEntity(dataAggregateB, usageECB);


    let usageSAA = new RelationToDataAggregate("r11", getEmptyMetaData());
    usageSAA.setPropertyValue("usage_relation", "persistence");
    storageServiceA.addDataAggregateEntity(dataAggregateA, usageSAA);

    let usageESAA = new RelationToDataAggregate("r12", getEmptyMetaData());
    usageESAA.setPropertyValue("usage_relation", "persistence");
    endpointSA.addDataAggregateEntity(dataAggregateA, usageESAA);


    let usageSBB = new RelationToDataAggregate("r13", getEmptyMetaData());
    usageSBB.setPropertyValue("usage_relation", "persistence");
    storageServiceB.addDataAggregateEntity(dataAggregateB, usageSBB);

    let usageESBB = new RelationToDataAggregate("r14", getEmptyMetaData());
    usageESBB.setPropertyValue("usage_relation", "persistence");
    endpointSB.addDataAggregateEntity(dataAggregateB, usageESBB);


    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBSA = new Link("l2", serviceB, endpointSA);
    let linkBC = new Link("l3", serviceB, endpointC);
    let linkCSB = new Link("l4", serviceC, endpointSB);

    let requestTrace = new RequestTrace("r1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [
        [linkAB],
        [linkBSA, linkBC],
        [linkCSB]
    ]
    requestTrace.setExternalEndpoint = externalEndpoint;

    system.addEntities([dataAggregateA, dataAggregateB]);
    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([storageServiceA, storageServiceB]);
    system.addEntities([linkAB, linkBSA, linkBC, linkCSB]);
    system.addEntities([requestTrace]);


    let measureValue = requestTraceMeasureImplementations["dataReplicationAlongRequestTrace"]({ entity: requestTrace, system: system });
    expect(measureValue).toBeCloseTo(17 / 24, 5);

})

test("ratioOfEndpointsSupportingSsl", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("protocol", "https");
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let serviceE = new Service("s5", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    let externalEndpointE = new ExternalEndpoint("ex2", "external endpoint 2", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);
    serviceE.addEndpoint(externalEndpointE);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l4", serviceD, endpointB);
    let linkCD = new Link("l5", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD], [linkDB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkDB, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfEndpointsSupportingSsl"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.5);

})

test("ratioOfSecuredLinks", () => {

    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("protocol", "https");
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let serviceE = new Service("s5", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    let externalEndpointE = new ExternalEndpoint("ex2", "external endpoint 2", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);
    serviceE.addEndpoint(externalEndpointE);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l4", serviceD, endpointB);
    let linkCD = new Link("l5", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD], [linkDB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkDB, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfSecuredLinks"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.5);
})


test("ratioOfStateDependencyOfEndpoints", () => {

    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService A", getEmptyMetaData());
    let externalEndpoint = new ExternalEndpoint("ee1", "external endpoint", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpoint);

    let serviceB = new Service("s2", "testService B", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint B", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService C", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint C", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let dataAggregateA = new DataAggregate("da1", "data aggregate A", getEmptyMetaData());

    let usageAA = new RelationToDataAggregate("r1", getEmptyMetaData());
    usageAA.setPropertyValue("usage_relation", "usage");
    serviceA.addDataAggregateEntity(dataAggregateA, usageAA);

    let usageEAA = new RelationToDataAggregate("r3", getEmptyMetaData());
    usageEAA.setPropertyValue("usage_relation", "usage");
    externalEndpoint.addDataAggregateEntity(dataAggregateA, usageEAA);


    let usageBA = new RelationToDataAggregate("r5", getEmptyMetaData());
    usageBA.setPropertyValue("usage_relation", "cached-usage");
    serviceB.addDataAggregateEntity(dataAggregateA, usageBA);

    let usageEBA = new RelationToDataAggregate("r7", getEmptyMetaData());
    usageEBA.setPropertyValue("usage_relation", "cached-usage");
    endpointB.addDataAggregateEntity(dataAggregateA, usageEBA);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l3", serviceB, endpointC);

    let requestTrace = new RequestTrace("r1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [
        [linkAB],
        [linkBC]
    ]
    requestTrace.setExternalEndpoint = externalEndpoint;

    system.addEntities([dataAggregateA]);
    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB, linkBC]);
    system.addEntities([requestTrace]);


    let measureValue = requestTraceMeasureImplementations["ratioOfStateDependencyOfEndpoints"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2 / 3);

})

test("ratioOfStatefulComponents", () => {

    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    serviceB.setPropertyValue("stateless", false);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    serviceC.setPropertyValue("stateless", false);
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l3", serviceD, endpointB);
    let linkCD = new Link("l5", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD], [linkDB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkDB, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfStatefulComponents"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.5);
})


test("ratioOfStatelessComponents", () => {

    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    serviceB.setPropertyValue("stateless", true);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    serviceC.setPropertyValue("stateless", false);
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l3", serviceD, endpointB);
    let linkCD = new Link("l5", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD], [linkDB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkDB, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfStatelessComponents"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.75);
})

test("asynchronousCommunicationUtilization", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB1 = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB1.setPropertyValue("kind", SEND_EVENT_ENDPOINT_KIND);
    serviceB.addEndpoint(endpointB1);
    let endpointB2 = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointB2.setPropertyValue("kind", SUBSCRIBE_ENDPOINT_KIND);
    serviceB.addEndpoint(endpointB2);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let linkAB = new Link("l1", serviceA, endpointB1);
    let linkCB = new Link("l2", serviceC, endpointB2);
    let linkCD = new Link("l3", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkCB], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkCB, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["asynchronousCommunicationUtilization"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2 / 3);

})

test("eventSourcingUtilizationMetric", () => {

    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService 1", getEmptyMetaData());
    let externalEndpoint = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpoint);
    let serviceB = new Service("s2", "testService 2", getEmptyMetaData());
    let serviceC = new Service("s3", "testService 3", getEmptyMetaData());

    let brokerService = new BrokerBackingService("bs1", "broker service", getEmptyMetaData());
    brokerService.setPropertyValue("kind", "log");
    let inEndpoint = new Endpoint("e1", "in endpoint", getEmptyMetaData());
    inEndpoint.setPropertyValue("kind", SEND_EVENT_ENDPOINT_KIND);
    inEndpoint.setPropertyValue("url_path", "orders");
    brokerService.addEndpoint(inEndpoint);
    let outEndpoint = new Endpoint("e2", "out endpoint", getEmptyMetaData());
    outEndpoint.setPropertyValue("kind", SUBSCRIBE_ENDPOINT_KIND);
    outEndpoint.setPropertyValue("url_path", "orders");
    brokerService.addEndpoint(outEndpoint);

    let linkABS = new Link("l1", serviceA, inEndpoint);
    let linkBBS = new Link("l2", serviceB, outEndpoint);
    let linkCBS = new Link("l3", serviceC, outEndpoint);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkABS], [linkBBS], [linkCBS]];
    requestTrace.setExternalEndpoint = externalEndpoint;

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([brokerService]);
    system.addEntities([linkABS, linkBBS, linkCBS]);
    system.addEntity(requestTrace);


    let measureValue = requestTraceMeasureImplementations["eventSourcingUtilizationMetric"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1);

})


test("ratioOfInfrastructureNodesThatSupportMonitoring", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let logData = new BackingData("bd1", "logging data 1", getEmptyMetaData());
    logData.setPropertyValue("kind", BACKING_DATA_LOGS_KIND);
    let metricsData = new BackingData("bd2", "metrics data 1", getEmptyMetaData());
    metricsData.setPropertyValue("kind", BACKING_DATA_METRICS_KIND);
    infrastructureA.addBackingDataEntity(logData, new RelationToBackingData("r1", getEmptyMetaData()));
    infrastructureA.addBackingDataEntity(metricsData, new RelationToBackingData("r2", getEmptyMetaData()));
    let infrastructureB = new Infrastructure("i2", "infratstructure 2", getEmptyMetaData());


    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);
    let deploymentMappingC = new DeploymentMapping("dm2", serviceC, infrastructureB);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);
    let deploymentMappingD = new DeploymentMapping("dm3", serviceD, infrastructureB);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;


    system.addEntities([logData, metricsData]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC, deploymentMappingD]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfInfrastructureNodesThatSupportMonitoring"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.5);

})

test("ratioOfComponentsThatSupportMonitoring", () => {
    let system = new System("sys1", "testSystem");

    let logData = new BackingData("bd1", "logging data 1", getEmptyMetaData());
    logData.setPropertyValue("kind", BACKING_DATA_LOGS_KIND);
    let metricsData = new BackingData("bd2", "metrics data 1", getEmptyMetaData());
    metricsData.setPropertyValue("kind", BACKING_DATA_METRICS_KIND);

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    serviceA.addBackingDataEntity(logData, new RelationToBackingData("r1", getEmptyMetaData()));
    serviceA.addBackingDataEntity(metricsData, new RelationToBackingData("r2", getEmptyMetaData()));

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;


    system.addEntities([logData, metricsData]);
    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfComponentsThatSupportMonitoring"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1 / 4);
})


test("ratioOfServicesThatProvideHealthEndpoints", () => {

    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    let endpointHA = new Endpoint("e1a", "endpoint 1a", getEmptyMetaData());
    endpointHA.setPropertyValue("health_check", true);
    let endpointRA = new Endpoint("e1b", "endpoint 1b", getEmptyMetaData());
    endpointRA.setPropertyValue("readiness_check", true);
    serviceA.addEndpoint(endpointHA);
    serviceA.addEndpoint(endpointRA);


    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    serviceB.setPropertyValue("stateless", false);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    let endpointHB = new Endpoint("e2a", "endpoint 2a", getEmptyMetaData());
    endpointHB.setPropertyValue("health_check", true);
    let endpointRB = new Endpoint("e2b", "endpoint 2b", getEmptyMetaData());
    endpointRB.setPropertyValue("readiness_check", true);
    serviceB.addEndpoint(endpointHB);
    serviceB.addEndpoint(endpointRB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    serviceC.setPropertyValue("stateless", false);
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l3", serviceD, endpointB);
    let linkCD = new Link("l5", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD], [linkDB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkDB, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfServicesThatProvideHealthEndpoints"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.5);

})

test("distributedTracingSupport", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let tracingService = new BackingService("t1", "tracing service", getEmptyMetaData());
    tracingService.setPropertyValue("providedFunctionality", "tracing");
    let tracingEndpoint = new Endpoint("te1", "tracing endpoint", getEmptyMetaData());
    tracingService.addEndpoint(tracingEndpoint)


    let linkAB = new Link("l1", serviceA, endpointB);
    let linkAT = new Link("lt1", serviceA, tracingEndpoint);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkBT = new Link("lt2", serviceB, tracingEndpoint);
    let linkCD = new Link("l3", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;


    system.addEntities([serviceA, serviceB, serviceC, serviceD, tracingService]);
    system.addEntities([linkAB, linkBC, linkCD, linkAT, linkBT]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["distributedTracingSupport"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1 / 2);

})

test("maximumNumberOfServicesWithinARequestTrace", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);


    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;


    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["maximumNumberOfServicesWithinARequestTrace"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(4);
})

test("requestTraceComplexity", () => {

    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let serviceE = new Service("s5", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);


    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkBE = new Link("l3", serviceB, endpointE);
    let linkCD = new Link("l4", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC, linkBE], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["requestTraceComplexity"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(4);

})


test("databaseTypeUtilization", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService A", getEmptyMetaData());
    let externalEndpoint = new ExternalEndpoint("ee1", "external endpoint", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpoint);

    let serviceB = new Service("s2", "testService B", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint B", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService C", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint C", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let storageServiceA = new StorageBackingService("sbs1", "storage service A", getEmptyMetaData());
    let endpointSA = new Endpoint("e4", "endpoint SA", getEmptyMetaData());
    storageServiceA.addEndpoint(endpointSA);

    let storageServiceB = new StorageBackingService("sbs2", "storage service B", getEmptyMetaData());
    let endpointSB = new Endpoint("e5", "endpoint SB", getEmptyMetaData());
    storageServiceB.addEndpoint(endpointSB);


    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBSA = new Link("l2", serviceB, endpointSA);
    let linkBC = new Link("l3", serviceB, endpointC);
    let linkCSB = new Link("l4", serviceC, endpointSB);

    let requestTrace = new RequestTrace("r1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [
        [linkAB],
        [linkBSA, linkBC],
        [linkCSB]
    ]
    requestTrace.setExternalEndpoint = externalEndpoint;

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([storageServiceA, storageServiceB]);
    system.addEntities([linkAB, linkBSA, linkBC, linkCSB]);
    system.addEntities([requestTrace]);


    let measureValue = requestTraceMeasureImplementations["databaseTypeUtilization"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1);
})

test("serviceDiscoveryUsage", () => {

    let system = new System("sys1", "testSystem");

    let discoveryService = new BackingService("b1", "discoveryService", getEmptyMetaData());
    discoveryService.setPropertyValue("address_resolution_kind", "discovery");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    serviceA.setAddressResolutionBy = discoveryService;

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    serviceB.setAddressResolutionBy = discoveryService;

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let serviceE = new Service("s5", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkBE = new Link("l3", serviceB, endpointE);
    let linkCD = new Link("l4", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC, linkBE], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([discoveryService, serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["serviceDiscoveryUsage"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(3/4);
})

test("serviceReplicationLevel", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infratstructure 2", getEmptyMetaData());

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("replicas", 2);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    deploymentMappingB.setPropertyValue("replicas", 1);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureB);
    deploymentMappingC.setPropertyValue("replicas", 2);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);
    let deploymentMappingD = new DeploymentMapping("dm4", serviceD, infrastructureB);
    deploymentMappingD.setPropertyValue("replicas", 1);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC, deploymentMappingD]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["serviceReplicationLevel"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1.5);
})

test("medianServiceReplication", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infratstructure 2", getEmptyMetaData());

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("replicas", 2);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    deploymentMappingB.setPropertyValue("replicas", 2);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureB);
    deploymentMappingC.setPropertyValue("replicas", 2);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);
    let deploymentMappingD = new DeploymentMapping("dm4", serviceD, infrastructureB);
    deploymentMappingD.setPropertyValue("replicas", 1);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC, deploymentMappingD]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["medianServiceReplication"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2);
})

test("smallestReplicationValue", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infratstructure 2", getEmptyMetaData());

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("replicas", 2);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    deploymentMappingB.setPropertyValue("replicas", 3);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureB);
    deploymentMappingC.setPropertyValue("replicas", 2);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);
    let deploymentMappingD = new DeploymentMapping("dm4", serviceD, infrastructureB);
    deploymentMappingD.setPropertyValue("replicas", 1);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC, deploymentMappingD]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["smallestReplicationValue"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1);
})

test("storageReplicationLevel", () => {

    let system = new System("sys1", "testSystem");


    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infratstructure 2", getEmptyMetaData());

    let serviceA = new Service("s1", "testService A", getEmptyMetaData());
    let externalEndpoint = new ExternalEndpoint("ee1", "external endpoint", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpoint);

    let serviceB = new Service("s2", "testService B", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint B", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService C", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint C", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let storageServiceA = new StorageBackingService("sbs1", "storage service A", getEmptyMetaData());
    let endpointSA = new Endpoint("e4", "endpoint SA", getEmptyMetaData());
    storageServiceA.addEndpoint(endpointSA);
    let deploymentMappingA = new DeploymentMapping("dm1", storageServiceA, infrastructureA);
    deploymentMappingA.setPropertyValue("replicas", 2);

    let storageServiceB = new StorageBackingService("sbs2", "storage service B", getEmptyMetaData());
    let endpointSB = new Endpoint("e5", "endpoint SB", getEmptyMetaData());
    storageServiceB.addEndpoint(endpointSB);
    let deploymentMappingB = new DeploymentMapping("dm2", storageServiceB, infrastructureB);
    deploymentMappingB.setPropertyValue("replicas", 3);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBSA = new Link("l2", serviceB, endpointSA);
    let linkBC = new Link("l3", serviceB, endpointC);
    let linkCSB = new Link("l4", serviceC, endpointSB);

    let requestTrace = new RequestTrace("r1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [
        [linkAB],
        [linkBSA, linkBC],
        [linkCSB]
    ]
    requestTrace.setExternalEndpoint = externalEndpoint;

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([storageServiceA, storageServiceB]);
    system.addEntities([deploymentMappingA, deploymentMappingB]);
    system.addEntities([linkAB, linkBSA, linkBC, linkCSB]);
    system.addEntities([requestTrace]);

    let measureValue = requestTraceMeasureImplementations["storageReplicationLevel"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2.5);

})

test("numberOfAvailabilityZonesUsed", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("availability_zone", "privateA,privateB,public")
    let infrastructureB = new Infrastructure("i2", "infratstructure 2", getEmptyMetaData());
    infrastructureA.setPropertyValue("availability_zone", "privateA,privateC,public")

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureB);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);
    let deploymentMappingD = new DeploymentMapping("dm4", serviceD, infrastructureB);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC, deploymentMappingD]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["numberOfAvailabilityZonesUsed"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(4);
})

test("numberOfLinksWithRetryLogic", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceD.addEndpoint(endpointD);

    let linkAB = new Link("l1", serviceA, endpointB);
    linkAB.setPropertyValue("retries", 3);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);
    linkCD.setPropertyValue("retries", 2);

    let requestTrace = new RequestTrace("rq1", "request trace", getEmptyMetaData());
    requestTrace.setExternalEndpoint = externalEndpointA;
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["numberOfLinksWithRetryLogic"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2);
})


test("numberOfLinksWithComplexFailover", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceD.addEndpoint(endpointD);

    let linkAB = new Link("l1", serviceA, endpointB);
    linkAB.setPropertyValue("circuit_breaker", "with default value");
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);
    linkCD.setPropertyValue("circuit_breaker", "none");

    let requestTrace = new RequestTrace("rq1", "request trace", getEmptyMetaData());
    requestTrace.setExternalEndpoint = externalEndpointA;
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["numberOfLinksWithComplexFailover"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1);
})

test("amountOfRedundancy", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infratstructure 2", getEmptyMetaData());


    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    let deploymentMappingAA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingAB = new DeploymentMapping("dm2", serviceA, infrastructureB);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    let deploymentMappingBA = new DeploymentMapping("dm3", serviceB, infrastructureA);
    let deploymentMappingBB = new DeploymentMapping("dm4", serviceB, infrastructureB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);
    let deploymentMappingC = new DeploymentMapping("dm5", serviceC, infrastructureB);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);
    let deploymentMappingD = new DeploymentMapping("dm6", serviceD, infrastructureB);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;


    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([deploymentMappingAA, deploymentMappingAB, deploymentMappingBA, deploymentMappingBB, deploymentMappingC, deploymentMappingD]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["amountOfRedundancy"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(6/4);
})

test("dataShardingLevel", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService A", getEmptyMetaData());
    let externalEndpoint = new ExternalEndpoint("ee1", "external endpoint", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpoint);

    let serviceB = new Service("s2", "testService B", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint B", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService C", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint C", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let storageServiceA = new StorageBackingService("sbs1", "storage service A", getEmptyMetaData());
    storageServiceA.setPropertyValue("shards", 1);
    let endpointSA = new Endpoint("e4", "endpoint SA", getEmptyMetaData());
    storageServiceA.addEndpoint(endpointSA);

    let storageServiceB = new StorageBackingService("sbs2", "storage service B", getEmptyMetaData());
    let endpointSB = new Endpoint("e5", "endpoint SB", getEmptyMetaData());
    storageServiceB.addEndpoint(endpointSB);
    storageServiceA.setPropertyValue("shards", 3);


    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBSA = new Link("l2", serviceB, endpointSA);
    let linkBC = new Link("l3", serviceB, endpointC);
    let linkCSB = new Link("l4", serviceC, endpointSB);

    let requestTrace = new RequestTrace("r1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [
        [linkAB],
        [linkBSA, linkBC],
        [linkCSB]
    ]
    requestTrace.setExternalEndpoint = externalEndpoint;

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([storageServiceA, storageServiceB]);
    system.addEntities([linkAB, linkBSA, linkBC, linkCSB]);
    system.addEntities([requestTrace]);


    let measureValue = requestTraceMeasureImplementations["dataShardingLevel"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2);

})