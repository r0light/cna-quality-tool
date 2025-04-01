import { Artifact, getArtifactTypeProperties } from "@/core/common/artifact";
import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { BackingData, BackingService, BrokerBackingService, DataAggregate, DeploymentMapping, Endpoint, ExternalEndpoint, Infrastructure, Link, ProxyBackingService, RequestTrace, Service, StorageBackingService, System } from "@/core/entities";
import { RelationToBackingData } from "@/core/entities/relationToBackingData";
import { RelationToDataAggregate } from "@/core/entities/relationToDataAggregate";
import { requestTraceMeasureImplementations } from "@/core/qualitymodel/evaluation/measure-implementations/requestTraceMeasures";
import { systemMeasureImplementations } from "@/core/qualitymodel/evaluation/measure-implementations/systemMeasures";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { ENTITIES } from "@/core/qualitymodel/specifications/entities";
import { ASYNCHRONOUS_ENDPOINT_KIND, BACKING_DATA_CONFIG_KIND, BACKING_DATA_LOGS_KIND, BACKING_DATA_METRICS_KIND, BACKING_DATA_SECRET_KIND, COMMAND_ENDPOINT_KIND, DYNAMIC_INFRASTRUCTURE, QUERY_ENDPOINT_KIND, SEND_EVENT_ENDPOINT_KIND, SERVICE_MESH_KIND, SUBSCRIBE_ENDPOINT_KIND, SYNCHRONOUS_ENDPOINT_KIND } from "@/core/qualitymodel/specifications/featureModel";
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
    expect(measureValue).toEqual(1 / 3);

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
    expect(measureValue).toEqual(3 / 4);
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

test("numberOfAvailabilityZonesUsedByInfrastructure", () => {
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

    let measureValue = requestTraceMeasureImplementations["numberOfAvailabilityZonesUsedByInfrastructure"]({ entity: requestTrace, system: system });
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
    expect(measureValue).toEqual(6 / 4);
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

test("serviceMeshUsage", () => {
    let system = new System("sys1", "testSystem");

    let proxyA = new ProxyBackingService("p1", "proxy 1", getEmptyMetaData());
    proxyA.setPropertyValue("kind", SERVICE_MESH_KIND);

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    serviceA.setIngressProxiedBy = proxyA;
    serviceA.setEgressProxiedBy = proxyA;

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    serviceB.setIngressProxiedBy = proxyA;
    serviceB.setEgressProxiedBy = proxyA;

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let linkAB = new Link("l1", serviceA, endpointB);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntity(proxyA);
    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["serviceMeshUsage"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1);
})


test("configurationExternalization", () => {

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

    let configA = new BackingData("c1", "config A", getEmptyMetaData());
    configA.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let configB = new BackingData("c2", "config B", getEmptyMetaData());
    configB.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let configC = new BackingData("c3", "config C", getEmptyMetaData());
    configC.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);

    let storageServiceA = new StorageBackingService("sbs1", "storage service A", getEmptyMetaData());
    let endpointSA = new Endpoint("e4", "endpoint SA", getEmptyMetaData());
    storageServiceA.addEndpoint(endpointSA);

    let backingService = new BackingService("b1", "backing service", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", "config");

    let usageBSA = new RelationToBackingData("r1", getEmptyMetaData());
    usageBSA.setPropertyValue("usage_relation", "persistence");
    backingService.addBackingDataEntity(configA, usageBSA);

    let usageBSC = new RelationToBackingData("r2", getEmptyMetaData());
    usageBSC.setPropertyValue("usage_relation", "persistence");
    backingService.addBackingDataEntity(configC, usageBSC);

    let usageAA = new RelationToBackingData("r3", getEmptyMetaData());
    usageAA.setPropertyValue("usage_relation", "usage");
    serviceA.addBackingDataEntity(configA, usageAA);

    let usageAB = new RelationToBackingData("r4", getEmptyMetaData());
    usageAB.setPropertyValue("usage_relation", "persistence");
    serviceA.addBackingDataEntity(configB, usageAB);

    let usageBA = new RelationToBackingData("r5", getEmptyMetaData());
    usageBA.setPropertyValue("usage_relation", "usage");
    serviceB.addBackingDataEntity(configA, usageBA);

    let usageBC = new RelationToBackingData("r6", getEmptyMetaData());
    usageBC.setPropertyValue("usage_relation", "cached-usage");
    serviceB.addBackingDataEntity(configC, usageBC);


    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBSA = new Link("l2", serviceB, endpointSA);
    let linkBC = new Link("l3", serviceB, endpointC);

    let requestTrace = new RequestTrace("r1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [
        [linkAB],
        [linkBSA, linkBC]
    ]
    requestTrace.setExternalEndpoint = externalEndpoint;

    system.addEntities([configA, configB, configC]);
    system.addEntities([backingService]);
    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([storageServiceA]);
    system.addEntities([linkAB, linkBSA, linkBC]);
    system.addEntities([requestTrace]);


    let measureValue = requestTraceMeasureImplementations["configurationExternalization"]({ entity: requestTrace, system: system });
    expect(measureValue).toBeCloseTo(1.5 / 2);

})

test("secretsExternalization", () => {

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

    let secretA = new BackingData("c1", "secret A", getEmptyMetaData());
    secretA.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let secretB = new BackingData("c2", "secret B", getEmptyMetaData());
    secretB.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let secretC = new BackingData("c3", "secret C", getEmptyMetaData());
    secretC.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);

    let storageServiceA = new StorageBackingService("sbs1", "storage service A", getEmptyMetaData());
    let endpointSA = new Endpoint("e4", "endpoint SA", getEmptyMetaData());
    storageServiceA.addEndpoint(endpointSA);

    let backingService = new BackingService("b1", "backing service", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", "vault");

    let usageBSA = new RelationToBackingData("r1", getEmptyMetaData());
    usageBSA.setPropertyValue("usage_relation", "persistence");
    backingService.addBackingDataEntity(secretA, usageBSA);

    let usageBSC = new RelationToBackingData("r2", getEmptyMetaData());
    usageBSC.setPropertyValue("usage_relation", "persistence");
    backingService.addBackingDataEntity(secretC, usageBSC);

    let usageAA = new RelationToBackingData("r3", getEmptyMetaData());
    usageAA.setPropertyValue("usage_relation", "usage");
    serviceA.addBackingDataEntity(secretA, usageAA);

    let usageAB = new RelationToBackingData("r4", getEmptyMetaData());
    usageAB.setPropertyValue("usage_relation", "persistence");
    serviceA.addBackingDataEntity(secretB, usageAB);

    let usageBA = new RelationToBackingData("r5", getEmptyMetaData());
    usageBA.setPropertyValue("usage_relation", "usage");
    serviceB.addBackingDataEntity(secretA, usageBA);

    let usageBC = new RelationToBackingData("r6", getEmptyMetaData());
    usageBC.setPropertyValue("usage_relation", "cached-usage");
    serviceB.addBackingDataEntity(secretC, usageBC);


    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBSA = new Link("l2", serviceB, endpointSA);
    let linkBC = new Link("l3", serviceB, endpointC);

    let requestTrace = new RequestTrace("r1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [
        [linkAB],
        [linkBSA, linkBC]
    ]
    requestTrace.setExternalEndpoint = externalEndpoint;

    system.addEntities([secretA, secretB, secretC]);
    system.addEntities([backingService]);
    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([storageServiceA]);
    system.addEntities([linkAB, linkBSA, linkBC]);
    system.addEntities([requestTrace]);


    let measureValue = requestTraceMeasureImplementations["secretsExternalization"]({ entity: requestTrace, system: system });
    expect(measureValue).toBeCloseTo(1.5 / 2);

})


test("suitablyReplicatedStatefulService", () => {

    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService A", getEmptyMetaData());
    let externalEndpoint = new ExternalEndpoint("ee1", "external endpoint", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpoint);

    let infrastructureA = new Infrastructure("i1", "Infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());
    let storageBackingServiceA = new StorageBackingService("sbs1", "Storage Backing Service A", getEmptyMetaData());
    storageBackingServiceA.setPropertyValue("stateless", false);
    storageBackingServiceA.setPropertyValue("replication_strategy", "read-only-replication");
    let endpointB = new Endpoint("e2", "endpoint B", getEmptyMetaData());
    storageBackingServiceA.addEndpoint(endpointB);

    let storageBackingServiceB = new StorageBackingService("sbs2", "Storage Backing Service B", getEmptyMetaData());
    storageBackingServiceB.setPropertyValue("stateless", false);
    storageBackingServiceB.setPropertyValue("replication_strategy", "none");

    let storageBackingServiceC = new StorageBackingService("sbs3", "Storage Backing Service C", getEmptyMetaData());
    storageBackingServiceC.setPropertyValue("stateless", false);
    storageBackingServiceC.setPropertyValue("replication_strategy", "none");

    let deploymentMappingA = new DeploymentMapping("dm1", storageBackingServiceA, infrastructureA);
    deploymentMappingA.setPropertyValue("replicas", 3);

    let deploymentMappingB = new DeploymentMapping("dm2", storageBackingServiceB, infrastructureB);
    deploymentMappingB.setPropertyValue("replicas", 2);

    let deploymentMappingC = new DeploymentMapping("dm3", storageBackingServiceC, infrastructureA);
    deploymentMappingC.setPropertyValue("replicas", 1);


    let linkAB = new Link("l1", serviceA, endpointB);

    let requestTrace = new RequestTrace("r1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [
        [linkAB]
    ]
    requestTrace.setExternalEndpoint = externalEndpoint;

    system.addEntities([serviceA]);
    system.addEntities([storageBackingServiceA, storageBackingServiceB, storageBackingServiceC]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);
    system.addEntities([linkAB]);
    system.addEntities([requestTrace]);

    let measureValue = requestTraceMeasureImplementations["suitablyReplicatedStatefulService"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1);
})



test("ratioOfUniqueAccountUsage", () => {
    let system = new System("sys1", "testSystem");;
    let infrastructureA = new Infrastructure("i1", "Infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("identities", { "infraAccount": "account" });
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());
    infrastructureB.setPropertyValue("identities", { "default-account": "account" });

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    serviceA.setPropertyValue("identities", { "serviceAccount": "account" });
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    serviceB.setPropertyValue("identities", { "default-account": "account" });
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    serviceC.setPropertyValue("identities", { "default-account": "account" });
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let deploymentMappingAA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingBB = new DeploymentMapping("dm2", serviceB, infrastructureB);
    let deploymentMappingCA = new DeploymentMapping("dm6", serviceC, infrastructureA);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([deploymentMappingAA, deploymentMappingBB, deploymentMappingCA]);
    system.addEntities([linkAB, linkBC]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfUniqueAccountUsage"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.6);
})

test("accessRestrictedToCallers", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setAllowedAccounts = ["a1", "a2"]
    serviceA.addEndpoint(endpointA);

    let serviceB = new Service("s2", "service B", getEmptyMetaData())
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setAllowedAccounts = ["a1"];
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "service C", getEmptyMetaData())
    serviceC.setPropertyValue("identities", { "a1": "account" });

    let serviceD = new Service("s4", "service D", getEmptyMetaData())
    let endpointD = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointD.setAllowedAccounts = [];
    serviceD.addEndpoint(endpointD);

    let linkCA = new Link("l1", serviceC, endpointA);
    let linkCB = new Link("l2", serviceC, endpointB);
    let linkAD = new Link("l3", serviceA, endpointD);

    let requestTrace = new RequestTrace("rt1", "request trace", getEmptyMetaData());
    requestTrace.setLinks = [[linkCA], [linkAD]];

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkCA, linkCB, linkAD]);
    system.addEntities([requestTrace])

    let measureValue = requestTraceMeasureImplementations["accessRestrictedToCallers"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.25);
})



test("ratioOfDelegatedAuthentication", () => {
    let system = new System("sys1", "testSystem");

    let authService = new BackingService("auth1", "auth service", getEmptyMetaData());
    authService.setPropertyValue("providedFunctionality", "authentication/authorization");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    serviceA.setAuthenticationBy = authService;
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);

    let serviceB = new Service("s2", "service B", getEmptyMetaData())
    serviceB.setAuthenticationBy = authService;

    let serviceC = new Service("s3", "service C", getEmptyMetaData())
    let endpointC = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let linkAC = new Link("l1", serviceA, endpointC);

    let requestTrace = new RequestTrace("rt1", "request trace", getEmptyMetaData());
    requestTrace.setLinks = [[linkAC]];

    system.addEntities([authService, serviceA, serviceB, serviceC]);
    system.addEntities([linkAC]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfDelegatedAuthentication"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.5);
})

test("ratioOfStandardizedArtifacts", () => {
    let system = new System("sys1", "testSystem");;
    let infrastructureA = new Infrastructure("i1", "Infrastructure 1", getEmptyMetaData());
    let propertiesA = getArtifactTypeProperties("Image.Container.OCI");
    propertiesA.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    infrastructureA.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesA
    ));
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    let propertiesB = getArtifactTypeProperties("Image.Container.OCI");
    propertiesB.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    serviceA.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesB
    ));

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let deploymentMappingAA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingBB = new DeploymentMapping("dm2", serviceB, infrastructureB);
    let deploymentMappingCA = new DeploymentMapping("dm6", serviceC, infrastructureA);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([deploymentMappingAA, deploymentMappingBB, deploymentMappingCA]);
    system.addEntities([linkAB, linkBC]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfStandardizedArtifacts"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1);
})


test("ratioOfEntitiesProvidingStandardizedArtifacts", () => {
    let system = new System("sys1", "testSystem");;
    let infrastructureA = new Infrastructure("i1", "Infrastructure 1", getEmptyMetaData());
    let propertiesA = getArtifactTypeProperties("Image.Container.OCI");
    propertiesA.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    infrastructureA.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesA
    ));
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    let propertiesB = getArtifactTypeProperties("Image.Container.OCI");
    propertiesB.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    serviceA.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesB
    ));

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let deploymentMappingAA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingBB = new DeploymentMapping("dm2", serviceB, infrastructureB);
    let deploymentMappingCA = new DeploymentMapping("dm6", serviceC, infrastructureA);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([deploymentMappingAA, deploymentMappingBB, deploymentMappingCA]);
    system.addEntities([linkAB, linkBC]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfEntitiesProvidingStandardizedArtifacts"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2 / 5);
})

test("componentArtifactsSimilarity", () => {
    let system = new System("sys1", "testSystem");;
    let infrastructureA = new Infrastructure("i1", "Infrastructure 1", getEmptyMetaData());
    let propertiesA = getArtifactTypeProperties("Image.Container.OCI");
    propertiesA.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    infrastructureA.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesA
    ));
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    let propertiesB = getArtifactTypeProperties("Implementation.Java");
    serviceA.setArtifact("art1", new Artifact(
        "Implementation.Java",
        "", "", "", "", "", "", "", propertiesB
    ));

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);
    let propertiesC = getArtifactTypeProperties("Implementation.Java");
    serviceC.setArtifact("art2", new Artifact(
        "Implementation.Java",
        "", "", "", "", "", "", "", propertiesC
    ));

    let deploymentMappingAA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingBB = new DeploymentMapping("dm2", serviceB, infrastructureB);
    let deploymentMappingCA = new DeploymentMapping("dm6", serviceC, infrastructureA);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([deploymentMappingAA, deploymentMappingBB, deploymentMappingCA]);
    system.addEntities([linkAB, linkBC]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["componentArtifactsSimilarity"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1 / 3);
})



test("ratioOfDeploymentsOnDynamicInfrastructure", () => {
    let system = new System("sys1", "testSystem");
    let infrastructureA = new Infrastructure("i1", "Infrastructure A", getEmptyMetaData());
    infrastructureA.setPropertyValue("kind", DYNAMIC_INFRASTRUCTURE[0]);
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());
    infrastructureB.setPropertyValue("kind", "virtual-hardware");
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

    let linkAB = new Link("l1", serviceA, endpointB);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureB);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureA);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);
    system.addEntities([linkAB]);
    system.addEntity(requestTrace);
    let measureValue = requestTraceMeasureImplementations["ratioOfDeploymentsOnDynamicInfrastructure"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.5);
})


test("ratioOfEndpointsCoveredByContract", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let propertiesB = getArtifactTypeProperties("Spring.CloudContract");
    serviceA.setArtifact("art1", new Artifact(
        "Spring.CloudContract",
        "", "", "", "", "", "", "", propertiesB
    ));
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setDocumentedBy = ["art1"];
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let propertiesC = getArtifactTypeProperties("Spring.CloudContract");
    serviceC.setArtifact("art2", new Artifact(
        "Spring.CloudContract",
        "", "", "", "", "", "", "", propertiesC
    ));
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setDocumentedBy = ["art2"];
    serviceC.addEndpoint(endpointC);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB, linkBC]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfEndpointsCoveredByContract"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2 / 3);
})


test("standardizedDeployments", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let propertiesA = getArtifactTypeProperties("Image.Container.OCI");
    propertiesA.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    serviceA.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesA
    ));
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setDocumentedBy = ["art1"];
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let propertiesB = getArtifactTypeProperties("Image.Container.OCI");
    propertiesB.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    serviceB.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesB
    ));
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("deployment_unit", "Image.Container.OCI");
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    deploymentMappingB.setPropertyValue("deployment_unit", "Image.Container.OCI");
    let deploymentMappingC = new DeploymentMapping("dm3", serviceA, infrastructureB);

    let linkAB = new Link("l1", serviceA, endpointB);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);
    system.addEntities([linkAB]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["standardizedDeployments"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2 / 3);
})

test("selfContainedDeployments", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let propertiesA = getArtifactTypeProperties("Image.Container.OCI");
    propertiesA.find(prop => prop.getKey === "self_contained").value = true;
    serviceA.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesA
    ));
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setDocumentedBy = ["art1"];
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let propertiesB = getArtifactTypeProperties("Image.Container.OCI");
    propertiesB.find(prop => prop.getKey === "self_contained").value = true;
    serviceB.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesB
    ));
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("deployment_unit", "Image.Container.OCI");
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    deploymentMappingB.setPropertyValue("deployment_unit", "Image.Container.OCI");
    let deploymentMappingC = new DeploymentMapping("dm3", serviceA, infrastructureB);

    let linkAB = new Link("l1", serviceA, endpointB);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);
    system.addEntities([linkAB]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["selfContainedDeployments"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2 / 3);
})


test("ratioOfDocumentedEndpoints", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let propertiesB = getArtifactTypeProperties("OpenAPI");
    serviceA.setArtifact("art1", new Artifact(
        "OpenAPI",
        "", "", "", "", "", "", "", propertiesB
    ));
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setDocumentedBy = ["art1"];
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let propertiesC = getArtifactTypeProperties("OpenAPI");
    serviceC.setArtifact("art2", new Artifact(
        "OpenAPI",
        "", "", "", "", "", "", "", propertiesC
    ));
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setDocumentedBy = ["art2"];
    serviceC.addEndpoint(endpointC);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB, linkBC]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfDocumentedEndpoints"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2 / 3);
})


test("ratioOfEndpointsThatSupportTokenBasedAuthentication", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("supported_authentication_methods", ["Token", "basic_authentication"]);
    serviceA.addEndpoint(endpointA);
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("supported_authentication_methods", ["Token", "basic_authentication"]);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("supported_authentication_methods", ["Token", "basic_authentication"]);
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB, linkBC]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfEndpointsThatSupportTokenBasedAuthentication"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2 / 3);
})

test("ratioOfEndpointsThatSupportApiKeys", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("supported_authentication_methods", ["API-Key", "basic_authentication"]);
    serviceA.addEndpoint(endpointA);
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("supported_authentication_methods", ["API-Key", "basic_authentication"]);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("supported_authentication_methods", ["Token", "API-Key"]);
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB, linkBC]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfEndpointsThatSupportApiKeys"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2 / 3);
})


test("ratioOfEndpointsThatSupportPlaintextAuthentication", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("supported_authentication_methods", ["Token", "basic_authentication"]);
    serviceA.addEndpoint(endpointA);
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("supported_authentication_methods", ["Single Sign-On", "basic_authentication"]);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("supported_authentication_methods", ["Token", "basic_authentication"]);
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB, linkBC]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfEndpointsThatSupportPlaintextAuthentication"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2 / 3);
})


test("ratioOfEndpointsThatAreIncludedInASingleSignOnApproach", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("supported_authentication_methods", ["Token", "Single Sign-On"]);
    serviceA.addEndpoint(endpointA);
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("supported_authentication_methods", ["Single Sign-On", "basic_authentication"]);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("supported_authentication_methods", ["Single Sign-On", "basic_authentication"]);
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB, linkBC]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfEndpointsThatAreIncludedInASingleSignOnApproach"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2 / 3);
})

test("endpointAccessConsistency", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("supported_authentication_methods", ["Token", "Single Sign-On"]);
    serviceA.addEndpoint(endpointA);
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("supported_authentication_methods", ["Single Sign-On", "basic_authentication"]);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("supported_authentication_methods", ["API-Key"]);
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("supported_authentication_methods", ["API-Key"]);
    serviceC.addEndpoint(endpointC);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB, linkBC]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["endpointAccessConsistency"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1);
})



test("degreeToWhichComponentsAreLinkedToStatefulComponents", () => {
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
    serviceD.setPropertyValue("stateless", true);
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

    let measureValue = requestTraceMeasureImplementations["degreeToWhichComponentsAreLinkedToStatefulComponents"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.25);
})

test("ratioOfSpecializedStatefulServices", () => {

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

    let serviceC = new StorageBackingService("s3", "test storage service", getEmptyMetaData());
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

    let measureValue = requestTraceMeasureImplementations["ratioOfSpecializedStatefulServices"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.5);
})

test("degreeOfSeparationByGateways", () => {

    let system = new System("sys1", "testSystem");;

    let apiGatewayA = new ProxyBackingService("g1", "gateway 1", getEmptyMetaData());
    apiGatewayA.setPropertyValue("kind", "API Gateway");
    let apiGatewayB = new ProxyBackingService("g2", "gateway 2", getEmptyMetaData());
    apiGatewayB.setPropertyValue("kind", "API Gateway");

    let serviceA = new Service("s1", "testService 1", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    serviceA.setExternalIngressProxiedBy = apiGatewayA;

    let serviceB = new Service("s2", "testService 2", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    serviceB.setExternalIngressProxiedBy = apiGatewayA;

    let serviceC = new Service("s3", "testService 3", getEmptyMetaData());
    let endpointC = new ExternalEndpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);
    serviceC.setExternalIngressProxiedBy = apiGatewayB;

    let serviceD = new Service("s4", "testService 4", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);
    serviceD.setExternalIngressProxiedBy = apiGatewayB;

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l3", serviceD, endpointB);
    let linkCD = new Link("l5", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD], [linkDB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([apiGatewayA, apiGatewayB]);
    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkDB, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["degreeOfSeparationByGateways"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.5);
})


test("serviceInteractionViaBackingService", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService 1", getEmptyMetaData());
    let endpointA = new ExternalEndpoint("ee1", "externalEndpoint", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    let serviceB = new Service("s2", "testService 2", getEmptyMetaData());
    let serviceC = new Service("s3", "testService 3", getEmptyMetaData());

    let brokerService = new BrokerBackingService("bs1", "broker service", getEmptyMetaData());
    brokerService.setPropertyValue("kind", "queue");
    let inEndpoint = new Endpoint("e1", "in endpoint", getEmptyMetaData());
    inEndpoint.setPropertyValue("kind", SEND_EVENT_ENDPOINT_KIND);
    inEndpoint.setPropertyValue("url_path", "orders");
    brokerService.addEndpoint(inEndpoint);
    let outEndpoint = new Endpoint("e2", "out endpoint", getEmptyMetaData());
    outEndpoint.setPropertyValue("kind", SUBSCRIBE_ENDPOINT_KIND);
    outEndpoint.setPropertyValue("url_path", "orders");
    brokerService.addEndpoint(outEndpoint);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let serviceE = new Service("s5", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointE.setPropertyValue("kind", COMMAND_ENDPOINT_KIND);
    serviceE.addEndpoint(endpointE);
    let serviceF = new Service("s6", "testService 6", getEmptyMetaData());
    let endpointF = new Endpoint("e4", "endpoint F", getEmptyMetaData());
    serviceF.addEndpoint(endpointF);
    endpointF.setPropertyValue("kind", QUERY_ENDPOINT_KIND);

    let linkABS = new Link("l1", serviceA, inEndpoint);
    let linkBBS = new Link("l2", serviceB, outEndpoint);
    let linkCBS = new Link("l3", serviceC, outEndpoint);
    let linkDE = new Link("l4", serviceD, endpointE);
    let linkEF = new Link("l5", serviceE, endpointF);


    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkABS], [linkBBS, linkCBS]];
    requestTrace.setExternalEndpoint = endpointA;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE, serviceF]);
    system.addEntities([brokerService]);
    system.addEntities([linkABS, linkBBS, linkCBS, linkDE, linkEF]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["serviceInteractionViaBackingService"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1);
})





test("rollingUpdates", () => {
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
    deploymentMappingA.setPropertyValue("update_strategy", "replace");

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    deploymentMappingB.setPropertyValue("update_strategy", "blue-green");

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);
    let deploymentMappingC = new DeploymentMapping("dm2", serviceC, infrastructureB);
    deploymentMappingC.setPropertyValue("update_strategy", "rolling");

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);
    let deploymentMappingD = new DeploymentMapping("dm3", serviceD, infrastructureB);
    deploymentMappingD.setPropertyValue("update_strategy", "blue-green");

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

    let measureValue = requestTraceMeasureImplementations["rollingUpdates"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2/3);

})


test("ratioOfComponentsWhoseExternalIngressIsProxied", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpointA);
    let serviceB = new Service("s2", "testService 2", getEmptyMetaData());
    let endpointB = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    let serviceC = new Service("s3", "testService 3", getEmptyMetaData());
    let externalEndpointC = new ExternalEndpoint("ee2", "external endpoint 2", getEmptyMetaData());
    serviceC.addEndpoint(externalEndpointC);

    let serviceD = new Service("s4", "testService 3", getEmptyMetaData());
    let endpointD = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let storageBackingService = new StorageBackingService("sbs1", "storageBackingService", getEmptyMetaData());
    let endpointSBS = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    storageBackingService.addEndpoint(endpointSBS);

    let gatewayServiceA = new ProxyBackingService("p1", "proxy 1", getEmptyMetaData());
    gatewayServiceA.setPropertyValue("kind", "API Gateway");

    let serviceMesh = new ProxyBackingService("p2", "proxy ", getEmptyMetaData());
    serviceMesh.setPropertyValue("kind", "Service Mesh");

    serviceA.setIngressProxiedBy = serviceMesh;
    serviceA.setExternalIngressProxiedBy = gatewayServiceA;

    serviceB.setIngressProxiedBy = serviceMesh;

    storageBackingService.setIngressProxiedBy = serviceMesh;

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkDC = new Link("l2", serviceB, endpointD);
    let linkCSBS = new Link("l3", serviceD, endpointSBS);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkDC], [linkCSBS]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, storageBackingService, gatewayServiceA, serviceMesh]);
    system.addEntities([linkAB, linkDC, linkCSBS])
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["ratioOfComponentsWhoseExternalIngressIsProxied"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1);
})

test("numberOfAvailabilityZonesUsedByServices", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpointA);
    let serviceB = new Service("s2", "testService 2", getEmptyMetaData());
    let endpointB = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("availability_zone", "us-east1");
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    infrastructureB.setPropertyValue("availability_zone", "us-east1,us-east2");

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureB);

    let linkAB = new Link("l1", serviceA, endpointB);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB]);
    system.addEntities([deploymentMappingA, deploymentMappingB]);
    system.addEntities([linkAB]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["numberOfAvailabilityZonesUsedByServices"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2);
})

test("numberOfAvailabilityZonesUsedByStorageServices", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpointA);

    let storageServiceA = new StorageBackingService("st1", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    storageServiceA.addEndpoint(endpointB);
    let storageServiceB = new StorageBackingService("st2", "testService 2", getEmptyMetaData());
    let endpointC = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    storageServiceB.addEndpoint(endpointC);

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("availability_zone", "us-east1");
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    infrastructureB.setPropertyValue("availability_zone", "us-east1,us-east2");

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", storageServiceA, infrastructureB);
    let deploymentMappingC = new DeploymentMapping("dm2", storageServiceB, infrastructureB);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkAC = new Link("l2", serviceA, endpointC);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB,linkAC]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, storageServiceA, storageServiceB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);
    system.addEntities([linkAB,linkAC]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["numberOfAvailabilityZonesUsedByStorageServices"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2);
})


test("linksWithTimeout", () => {
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
    linkAB.setPropertyValue("timeout", "2000");
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);
    linkCD.setPropertyValue("timeout", "2000");

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["linksWithTimeout"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(2/3);
})

test("ratioOfExternalEndpointsSupportingTls", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("protocol", "HTTPS");
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

    let measureValue = requestTraceMeasureImplementations["ratioOfExternalEndpointsSupportingTls"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(1);
})


test("degreeOfAsynchronousCommunication", () => {
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

    let measureValue = requestTraceMeasureImplementations["degreeOfAsynchronousCommunication"]({ entity: requestTrace, system: system });
    expect(measureValue).toEqual(0.5);
})