import { Artifact, getArtifactTypeProperties } from "@/core/common/artifact";
import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { BackingData, BackingService, BrokerBackingService, Component, DataAggregate, DeploymentMapping, Endpoint, ExternalEndpoint, Infrastructure, Link, ProxyBackingService, RequestTrace, Service, StorageBackingService, System } from "@/core/entities";
import { RelationToBackingData } from "@/core/entities/relationToBackingData";
import { RelationToDataAggregate } from "@/core/entities/relationToDataAggregate";
import { systemMeasureImplementations } from "@/core/qualitymodel/evaluation/measure-implementations/systemMeasures";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { ENTITIES } from "@/core/qualitymodel/specifications/entities";
import { ASYNCHRONOUS_ENDPOINT_KIND, AUTOMATED_INFRASTRUCTURE_MAINTENANCE, BACKING_DATA_CONFIG_KIND, BACKING_DATA_SECRET_KIND, COMMAND_ENDPOINT_KIND, CONFIG_SERVICE_KIND, DATA_USAGE_RELATION_PERSISTENCE, DATA_USAGE_RELATION_USAGE, DYNAMIC_INFRASTRUCTURE, MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS, MANAGED_INFRASTRUCTURE_MAINTENANCE, QUERY_ENDPOINT_KIND, SEND_EVENT_ENDPOINT_KIND, SERVICE_MESH_KIND, SUBSCRIBE_ENDPOINT_KIND, SYNCHRONOUS_ENDPOINT_KIND } from "@/core/qualitymodel/specifications/featureModel";
import { backingDataSvgRepresentation } from "@/modeling/config/detailsSidebarConfig";
import { beforeAll, expect, test } from "vitest"

var systemToEvaluateA: System = new System("sys1", "testSystem");;

beforeAll(() => {
    systemToEvaluateA = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "serviceA", getEmptyMetaData());


    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("protocol", "https");
    serviceA.addEndpoint(externalEndpointA);
    let externalEndpointB = new ExternalEndpoint("ee2", "external endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpointB);

    let serviceB = new Service("s2", "serviceB", getEmptyMetaData());
    serviceB.setPropertyValue("stateless", false);
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("protocol", "https");
    serviceB.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceB.addEndpoint(endpointD);

    let linkAC = new Link("l1", serviceA, endpointC);
    let linkAD = new Link("l2", serviceA, endpointD);

    systemToEvaluateA.addEntities([serviceA, serviceB]);
    systemToEvaluateA.addEntities([linkAC, linkAD]);

    let dataAggregateA = new DataAggregate("da1", "Data A", getEmptyMetaData());

    systemToEvaluateA.addEntity(dataAggregateA);
    serviceA.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("dar1", getEmptyMetaData()));

    let dataAggregateB = new DataAggregate("da2", "Data B", getEmptyMetaData());
    serviceB.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("dar2", getEmptyMetaData()));
    systemToEvaluateA.addEntity(dataAggregateB);

    let storageBackingServiceA = new StorageBackingService("st1", "Storage 1", getEmptyMetaData());
    systemToEvaluateA.addEntity(storageBackingServiceA);
})


test("all implementation names refer to an existing measure", () => {
    let measureKeys = getQualityModel().measures.get(ENTITIES.SYSTEM).map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(systemMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    /*expect(measureKeys).toEqual(
        expect.arrayContaining(measureImplementationKeys)
      )*/

    measureImplementationKeys.forEach(key => {
        expect(measureKeys).include(key);
    })
})

test("all implemented measure must provide information on the calculation", () => {
    let measures = getQualityModel().measures.get(ENTITIES.SYSTEM);
    let measureKeys = measures.map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(systemMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    for (const measure of measures) {
        if (measureImplementationKeys.includes(measure.getId)) {
            expect(measure.getCalculationDescription.length, `Implemented measure ${measure.getId} does not provide a calculation description`).toBeGreaterThan(0)
        }
    }
})

test("ratioOfEndpointsSupportingSsl", () => {
    let measureValue = systemMeasureImplementations["ratioOfEndpointsSupportingSsl"]({ entity: systemToEvaluateA, system: systemToEvaluateA });

    expect(measureValue).toEqual(0.5);
})

test("ratioOfExternalEndpointsSupportingTls", () => {
    let measureValue = systemMeasureImplementations["ratioOfExternalEndpointsSupportingTls"]({ entity: systemToEvaluateA, system: systemToEvaluateA });

    expect(measureValue).toEqual(0.5);
})

test("ratioOfSecuredLinks", () => {
    let measureValue = systemMeasureImplementations["ratioOfSecuredLinks"]({ entity: systemToEvaluateA, system: systemToEvaluateA });

    expect(measureValue).toEqual(0.5);
})

test("dataAggregateScope", () => {
    let measureValue = systemMeasureImplementations["dataAggregateScope"]({ entity: systemToEvaluateA, system: systemToEvaluateA });

    expect(measureValue).toEqual(2);
})

test("ratioOfStatefulComponents", () => {
    let measureValue = systemMeasureImplementations["ratioOfStatefulComponents"]({ entity: systemToEvaluateA, system: systemToEvaluateA });

    expect(measureValue).toEqual(2 / 3);
})

test("ratioOfStatelessComponents", () => {
    let measureValue = systemMeasureImplementations["ratioOfStatelessComponents"]({ entity: systemToEvaluateA, system: systemToEvaluateA });

    expect(measureValue).toEqual(1 / 3);
})


test("degreeToWhichComponentsAreLinkedToStatefulComponents", () => {
    let measureValue = systemMeasureImplementations["degreeToWhichComponentsAreLinkedToStatefulComponents"]({ entity: systemToEvaluateA, system: systemToEvaluateA });

    expect(measureValue).toEqual(1 / 3);
})

test("degreeOfAsynchronousCommunication", () => {

    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(externalEndpointA);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointD);

    system.addEntities([serviceX, serviceY]);

    let measureValue = systemMeasureImplementations["degreeOfAsynchronousCommunication"]({ entity: system, system: system });

    expect(measureValue).toEqual(2 / 3);
})

test("asynchronousCommunicationUtilization", () => {
    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(externalEndpointA);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointD);

    let linkYX1 = new Link("l1", serviceY, endpointA);
    let linkYX2 = new Link("l2", serviceY, endpointB);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l3", serviceZ, endpointC);
    let linkZX2 = new Link("l4", serviceZ, endpointD);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkYX1, linkYX2, linkZX1, linkZX2]);

    let measureValue = systemMeasureImplementations["asynchronousCommunicationUtilization"]({ entity: system, system: system });

    expect(measureValue).toEqual(3 / 4);

})

test("ratioOfServicesThatProvideHealthEndpoints", () => {
    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("health_check", true);
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("readiness_check", true);
    serviceX.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(externalEndpointA);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    system.addEntities([serviceX, serviceY]);

    let measureValue = systemMeasureImplementations["ratioOfServicesThatProvideHealthEndpoints"]({ entity: system, system: system });

    expect(measureValue).toEqual(0.5);
})


test("couplingDegreeBasedOnPotentialCoupling", () => {
    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceY.addEndpoint(endpointB);

    let serviceZ = new Service("s3", "serviceC", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceZ.addEndpoint(endpointC);

    let linkXY = new Link("l1", serviceX, endpointB);
    let linkYZ = new Link("l2", serviceY, endpointC);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkXY, linkYZ]);

    let measureValue = systemMeasureImplementations["couplingDegreeBasedOnPotentialCoupling"]({ entity: system, system: system });

    expect(measureValue).toEqual(1 / 3);


})

test("interactionDensityBasedOnComponents", () => {
    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkYX1 = new Link("l1", serviceY, endpointA);
    let linkYX2 = new Link("l2", serviceY, endpointB);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l3", serviceZ, endpointC);
    let linkZX2 = new Link("l4", serviceZ, endpointD);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkYX1, linkYX2, linkZX1, linkZX2]);

    let measureValue = systemMeasureImplementations["interactionDensityBasedOnComponents"]({ entity: system, system: system });

    expect(measureValue).toEqual(4 / 3);

})


test("interactionDensityBasedOnLinks", () => {

    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkYX1 = new Link("l1", serviceY, endpointA);
    let linkYX2 = new Link("l2", serviceY, endpointB);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l3", serviceZ, endpointC);
    let linkZX2 = new Link("l4", serviceZ, endpointD);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkYX1, linkYX2, linkZX1, linkZX2]);

    let measureValue = systemMeasureImplementations["interactionDensityBasedOnLinks"]({ entity: system, system: system });

    expect(measureValue).toEqual(1 / 3);

})

test("systemCouplingBasedOnEndpointEntropy", () => {

    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkYX1 = new Link("l1", serviceY, endpointA);
    let linkYX2 = new Link("l2", serviceY, endpointB);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l3", serviceZ, endpointC);
    let linkZX2 = new Link("l4", serviceZ, endpointD);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkYX1, linkYX2, linkZX1, linkZX2]);

    let measureValue = systemMeasureImplementations["systemCouplingBasedOnEndpointEntropy"]({ entity: system, system: system });

    expect(measureValue).toBeCloseTo(0.602059, 5);
})

test("servicesInterdependenceInTheSystem", () => {
    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkXY = new Link("l1", serviceX, endpointC);
    let linkYX = new Link("l2", serviceY, endpointA);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX = new Link("l3", serviceZ, endpointC);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkXY, linkYX, linkZX]);

    let measureValue = systemMeasureImplementations["servicesInterdependenceInTheSystem"]({ entity: system, system: system });

    expect(measureValue).toEqual(1);

})

test("aggregateSystemMetricToMeasureServiceCoupling", () => {

    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkXY = new Link("l1", serviceX, endpointC);
    let linkYX = new Link("l2", serviceY, endpointA);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX = new Link("l3", serviceZ, endpointC);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkXY, linkYX, linkZX]);

    let measureValue = systemMeasureImplementations["aggregateSystemMetricToMeasureServiceCoupling"]({ entity: system, system: system });

    expect(measureValue).toEqual(0.5);
})

test("degreeOfCouplingInASystem", () => {
    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkXY = new Link("l1", serviceX, endpointC);
    let linkYX = new Link("l2", serviceY, endpointA);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX = new Link("l3", serviceZ, endpointC);

    let serviceA = new Service("s4", "service A", getEmptyMetaData());

    system.addEntities([serviceX, serviceY, serviceZ, serviceA]);
    system.addEntities([linkXY, linkYX, linkZX]);

    let measureValue = systemMeasureImplementations["degreeOfCouplingInASystem"]({ entity: system, system: system });

    expect(measureValue).toEqual(1 / 4);
})

test("simpleDegreeOfCouplingInASystem", () => {
    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkXY = new Link("l1", serviceX, endpointC);
    let linkYX = new Link("l2", serviceY, endpointA);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX = new Link("l3", serviceZ, endpointC);

    let serviceA = new Service("s4", "service A", getEmptyMetaData());

    system.addEntities([serviceX, serviceY, serviceZ, serviceA]);
    system.addEntities([linkXY, linkYX, linkZX]);

    let measureValue = systemMeasureImplementations["simpleDegreeOfCouplingInASystem"]({ entity: system, system: system });

    expect(measureValue).toEqual(3 / 4);

})

test("directServiceSharing", () => {
    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l1", serviceZ, endpointA);
    let linkZX2 = new Link("l2", serviceZ, endpointB);

    let serviceA = new Service("s4", "service A", getEmptyMetaData());
    let linkAX = new Link("l3", serviceA, endpointB);

    system.addEntities([serviceX, serviceY, serviceZ, serviceA]);
    system.addEntities([linkZX1, linkZX2, linkAX]);

    let measureValue = systemMeasureImplementations["directServiceSharing"]({ entity: system, system: system });
    expect(measureValue).toBeCloseTo(7 / 24, 6);
})

test("transitivelySharedServices", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "serviceA", getEmptyMetaData());

    let serviceB = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC = new Service("s3", "serviceC", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceC.addEndpoint(endpointB);

    let serviceD = new Service("s4", "service D", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceD.addEndpoint(endpointC);

    let serviceE = new Service("s5", "service E", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceE.addEndpoint(endpointD);
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);


    let linkAB = new Link("l1", serviceA, endpointA);
    let linkAC = new Link("l2", serviceA, endpointB);
    let linkBD = new Link("l3", serviceB, endpointC);
    let LinkBE = new Link("l4", serviceB, endpointD);
    let linkCE = new Link("l5", serviceC, endpointE);

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkAC, linkBD, LinkBE, linkCE]);

    let measureValue = systemMeasureImplementations["transitivelySharedServices"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);

})

test("ratioOfSharedNonExternalComponentsToNonExternalComponents", () => {
    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l1", serviceZ, endpointA);
    let linkZX2 = new Link("l2", serviceZ, endpointB);

    let serviceA = new Service("s4", "service A", getEmptyMetaData());
    let linkAX = new Link("l3", serviceA, endpointB);

    system.addEntities([serviceX, serviceY, serviceZ, serviceA]);
    system.addEntities([linkZX1, linkZX2, linkAX]);

    let measureValue = systemMeasureImplementations["ratioOfSharedNonExternalComponentsToNonExternalComponents"]({ entity: system, system: system });
    expect(measureValue).toEqual(1 / 4);

})

test("ratioOfSharedDependenciesOfNonExternalComponentsToPossibleDependencies", () => {
    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l1", serviceZ, endpointA);
    let linkZX2 = new Link("l2", serviceZ, endpointB);

    let serviceA = new Service("s4", "service A", getEmptyMetaData());
    let linkAX = new Link("l3", serviceA, endpointB);

    system.addEntities([serviceX, serviceY, serviceZ, serviceA]);
    system.addEntities([linkZX1, linkZX2, linkAX]);

    let measureValue = systemMeasureImplementations["ratioOfSharedDependenciesOfNonExternalComponentsToPossibleDependencies"]({ entity: system, system: system });
    expect(measureValue).toEqual(1 / 8);
})

test("averageSystemCoupling", () => {

    let system = new System("sys1", "testSystem");;

    let dataAggregateA = new DataAggregate("da1", "data aggregate 1", getEmptyMetaData());
    let dataAggregateB = new DataAggregate("da2", "data aggregate 2", getEmptyMetaData());

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", "query");
    let relationAA = new RelationToDataAggregate("dar1", getEmptyMetaData());
    relationAA.setPropertyValue("usage_relation", "usage");
    endpointA.addDataAggregateEntity(dataAggregateA, relationAA);
    serviceX.addEndpoint(endpointA);

    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);
    endpointB.setPropertyValue("kind", "command");
    let relationBB = new RelationToDataAggregate("dar2", getEmptyMetaData());
    relationBB.setPropertyValue("usage_relation", "persistence");
    endpointB.addDataAggregateEntity(dataAggregateB, relationBB);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let linkYX1 = new Link("l1", serviceY, endpointA);
    let linkYX2 = new Link("l2", serviceY, endpointB);

    let serviceZ = new Service("s3", "service C", getEmptyMetaData());
    let linkZX = new Link("l3", serviceZ, endpointB);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkYX1, linkYX2, linkZX]);

    let measureValue = systemMeasureImplementations["averageSystemCoupling"]({ entity: system, system: system });
    expect(measureValue).toEqual(2.45 / 3);

})

test("numberOfSynchronousCycles", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceA.addEndpoint(endpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceD.addEndpoint(endpointD);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);
    let linkDA = new Link("l4", serviceD, endpointA);
    let linkDB = new Link("l5", serviceD, endpointB);

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkCD, linkDA, linkDB]);

    let measureValue = systemMeasureImplementations["numberOfSynchronousCycles"]({ entity: system, system: system });
    expect(measureValue).toEqual(2);

})

test("densityOfAggregation", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let linkAC = new Link("l1", serviceA, endpointC);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAC, linkBC, linkCD]);

    let measureValue = systemMeasureImplementations["densityOfAggregation"]({ entity: system, system: system });
    expect(measureValue).toBeCloseTo(-0.405465, 5);

})

test("dataAggregateConvergenceAcrossComponents", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let dataAggregateX = new DataAggregate("da1", "data aggregate 1", getEmptyMetaData());
    let dataAggregateY = new DataAggregate("da2", "data aggregate 2", getEmptyMetaData());
    let dataAggregateZ = new DataAggregate("da3", "data aggregate 3", getEmptyMetaData());

    serviceA.addDataAggregateEntity(dataAggregateX, new RelationToDataAggregate("r1", getEmptyMetaData()));
    serviceA.addDataAggregateEntity(dataAggregateY, new RelationToDataAggregate("r2", getEmptyMetaData()));

    serviceB.addDataAggregateEntity(dataAggregateY, new RelationToDataAggregate("r3", getEmptyMetaData()));
    serviceB.addDataAggregateEntity(dataAggregateZ, new RelationToDataAggregate("r4", getEmptyMetaData()));

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([dataAggregateX, dataAggregateY, dataAggregateZ]);

    let measureValue = systemMeasureImplementations["dataAggregateConvergenceAcrossComponents"]({ entity: system, system: system });
    expect(measureValue).toBeCloseTo(2.666666666, 5);
})

test("ratioOfCyclicRequestTraces", () => {
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
    let linkDB = new Link("l4", serviceD, endpointB);
    let linkED = new Link("l5", serviceE, endpointD);


    let requestTraceA = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTraceA.setLinks = [[linkAB], [linkBC]];
    requestTraceA.setExternalEndpoint = externalEndpointA;

    let requestTraceB = new RequestTrace("rq2", "request trace 2", getEmptyMetaData());
    requestTraceB.setLinks = [[linkED], [linkDB], [linkBC], [linkCD]];
    requestTraceB.setExternalEndpoint = externalEndpointE;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkCD, linkDB, linkED]);
    system.addEntities([requestTraceA, requestTraceB]);

    let measureValue = systemMeasureImplementations["ratioOfCyclicRequestTraces"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
})


test("numberOfPotentialCyclesInASystem", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);

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
    let linkDA = new Link("l4", serviceD, endpointA);
    let linkDB = new Link("l5", serviceD, endpointB);

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkCD, linkDA, linkDB]);

    let measureValue = systemMeasureImplementations["numberOfPotentialCyclesInASystem"]({ entity: system, system: system });
    expect(measureValue).toEqual(2);

})

test("maximumLengthOfServiceLinkChainPerRequestTrace", () => {
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
    let linkED = new Link("l3", serviceE, endpointD);
    let linkDB = new Link("l4", serviceD, endpointB);

    let requestTraceA = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTraceA.setLinks = [[linkAB], [linkBC]];
    requestTraceA.setExternalEndpoint = externalEndpointA;

    let requestTraceB = new RequestTrace("rq2", "request trace 2", getEmptyMetaData());
    requestTraceB.setLinks = [[linkED], [linkDB], [linkBC]];
    requestTraceB.setExternalEndpoint = externalEndpointE;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkED, linkDB]);
    system.addEntities([requestTraceA, requestTraceB]);

    let measureValue = systemMeasureImplementations["maximumLengthOfServiceLinkChainPerRequestTrace"]({ entity: system, system: system });
    expect(measureValue).toEqual(3);
})

test("maximumNumberOfServicesWithinARequestTrace", () => {

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
    let linkED = new Link("l3", serviceE, endpointD);
    let linkDB = new Link("l4", serviceD, endpointB);

    let requestTraceA = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTraceA.setLinks = [[linkAB], [linkBC]];
    requestTraceA.setExternalEndpoint = externalEndpointA;

    let requestTraceB = new RequestTrace("rq2", "request trace 2", getEmptyMetaData());
    requestTraceB.setLinks = [[linkED], [linkDB], [linkBC]];
    requestTraceB.setExternalEndpoint = externalEndpointE;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkED, linkDB]);
    system.addEntities([requestTraceA, requestTraceB]);

    let measureValue = systemMeasureImplementations["maximumNumberOfServicesWithinARequestTrace"]({ entity: system, system: system });
    expect(measureValue).toEqual(4);
})

test("databaseTypeUtilization", () => {

    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let storageBackingService = new StorageBackingService("sbs1", "storage service", getEmptyMetaData());
    let endpointS = new Endpoint("e2", "storage endpoint", getEmptyMetaData());
    storageBackingService.addEndpoint(endpointS);


    let linkAS = new Link("l1", serviceA, endpointS);
    let linkBS = new Link("l2", serviceB, endpointS);
    let linkCS = new Link("l3", serviceC, endpointS);
    let linkAB = new Link("l4", serviceA, endpointA);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntity(storageBackingService);
    system.addEntities([linkAS, linkBS, linkCS, linkAB]);

    let measureValue = systemMeasureImplementations["databaseTypeUtilization"]({ entity: system, system: system });
    expect(measureValue).toEqual(0);

})

test("databaseTypeUtilization databasePerService", () => {

    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let storageBackingServiceA = new StorageBackingService("sbs1", "storage service", getEmptyMetaData());
    let endpointSA = new Endpoint("es1", "storage endpoint", getEmptyMetaData());
    storageBackingServiceA.addEndpoint(endpointSA);

    let storageBackingServiceB = new StorageBackingService("sbs2", "storage service", getEmptyMetaData());
    let endpointSB = new Endpoint("es2", "storage endpoint", getEmptyMetaData());
    storageBackingServiceB.addEndpoint(endpointSB);

    let storageBackingServiceC = new StorageBackingService("sbs3", "storage service", getEmptyMetaData());
    let endpointSC = new Endpoint("es3", "storage endpoint", getEmptyMetaData());
    storageBackingServiceC.addEndpoint(endpointSC);


    let linkASA = new Link("l1", serviceA, endpointSA);
    let linkBSB = new Link("l2", serviceB, endpointSB);
    let linkCSC = new Link("l3", serviceC, endpointSC);
    let linkAB = new Link("l4", serviceA, endpointA);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([storageBackingServiceA, storageBackingServiceB, storageBackingServiceC]);
    system.addEntities([linkASA, linkBSB, linkCSC, linkAB]);

    let measureValue = systemMeasureImplementations["databaseTypeUtilization"]({ entity: system, system: system });
    expect(measureValue).toEqual(1);

})

test("averageNumberOfEndpointsPerService", () => {

    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB1 = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB1);
    let endpointB2 = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceB.addEndpoint(endpointB2);
    let endpointB3 = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceB.addEndpoint(endpointB3);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e5", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let externalEndpointE = new ExternalEndpoint("ex2", "external endpoint 2", getEmptyMetaData());
    serviceD.addEndpoint(externalEndpointE);

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);

    let measureValue = systemMeasureImplementations["averageNumberOfEndpointsPerService"]({ entity: system, system: system });
    expect(measureValue).toEqual(7 / 4);

})

test("numberOfComponents", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let storageBackingService = new StorageBackingService("sb1", "storage service", getEmptyMetaData());

    let component = new Component("c1", "component 1", getEmptyMetaData());

    system.addEntities([serviceA, storageBackingService, component]);

    let measureValue = systemMeasureImplementations["numberOfComponents"]({ entity: system, system: system });
    expect(measureValue).toEqual(3);

})

test("ratioOfProviderManagedComponentsAndInfrastructure", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    serviceA.setPropertyValue("managed", true);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB1 = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB1);
    let endpointB2 = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceB.addEndpoint(endpointB2);
    let endpointB3 = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceB.addEndpoint(endpointB3);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e5", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    infrastructureB.setPropertyValue("environment_access", "limited");
    let infrastructureC = new Infrastructure("i3", "infrastructure 3", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureB);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureC);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = systemMeasureImplementations["ratioOfProviderManagedComponentsAndInfrastructure"]({ entity: system, system: system });
    expect(measureValue).toEqual(1 / 3);

})

test("componentDensity", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);
    serviceA.setPropertyValue("managed", true);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB1 = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB1);
    let endpointB2 = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceB.addEndpoint(endpointB2);
    let endpointB3 = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceB.addEndpoint(endpointB3);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e5", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 3", getEmptyMetaData());
    let infrastructureC = new Infrastructure("i3", "infrastructure 4", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureB);
    let deploymentMappingD = new DeploymentMapping("dm4", infrastructureB, infrastructureC);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC, deploymentMappingD]);

    let measureValue = systemMeasureImplementations["componentDensity"]({ entity: system, system: system });
    expect(measureValue).toEqual(1.5);
})


test("numberOfAvailabilityZonesUsed", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("availability_zone", "zone-1,zone-2");
    let infrastructureB = new Infrastructure("i2", "infrastructure 3", getEmptyMetaData());
    infrastructureB.setPropertyValue("availability_zone", "zone-1");
    let infrastructureC = new Infrastructure("i3", "infrastructure 4", getEmptyMetaData());
    infrastructureC.setPropertyValue("availability_zone", "zone-1,zone-2,zone-3");

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureB);
    let deploymentMappingD = new DeploymentMapping("dm4", infrastructureB, infrastructureC);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC, deploymentMappingD]);

    let measureValue = systemMeasureImplementations["numberOfAvailabilityZonesUsed"]({ entity: system, system: system });
    expect(measureValue).toEqual(3);
})

test("rollingUpdateOption", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("supported_update_strategies", ["in-place"]);
    let infrastructureB = new Infrastructure("i2", "infrastructure 3", getEmptyMetaData());
    infrastructureB.setPropertyValue("supported_update_strategies", ["rolling"]);
    let infrastructureC = new Infrastructure("i3", "infrastructure 4", getEmptyMetaData());
    infrastructureC.setPropertyValue("supported_update_strategies", ["in-place", "blue-green"]);

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureB);
    let deploymentMappingD = new DeploymentMapping("dm4", infrastructureB, infrastructureC);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC, deploymentMappingD]);

    let measureValue = systemMeasureImplementations["rollingUpdateOption"]({ entity: system, system: system });
    expect(measureValue).toEqual(1 / 2);
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

    let serviceE = new Service("s5", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    let externalEndpointE = new ExternalEndpoint("ex2", "external endpoint 2", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);
    serviceE.addEndpoint(externalEndpointE);

    let linkAB = new Link("l1", serviceA, endpointB);
    linkAB.setPropertyValue("retries", 3);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkED = new Link("l3", serviceD, endpointB);
    let linkDB = new Link("l4", serviceE, endpointD);
    linkDB.setPropertyValue("retries", 2);

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkED, linkDB]);

    let measureValue = systemMeasureImplementations["numberOfLinksWithRetryLogic"]({ entity: system, system: system });
    expect(measureValue).toEqual(2 / 3);
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

    let serviceE = new Service("s5", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    let externalEndpointE = new ExternalEndpoint("ex2", "external endpoint 2", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);
    serviceE.addEndpoint(externalEndpointE);

    let linkAB = new Link("l1", serviceA, endpointB);
    linkAB.setPropertyValue("circuit_breaker", "with default value");
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkED = new Link("l3", serviceD, endpointB);
    let linkDB = new Link("l4", serviceE, endpointD);
    linkDB.setPropertyValue("circuit_breaker", "with cached response");

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkED, linkDB]);

    let measureValue = systemMeasureImplementations["numberOfLinksWithComplexFailover"]({ entity: system, system: system });
    expect(measureValue).toEqual(2 / 3);
})

test("totalNumberOfComponents", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let backingServiceC = new BackingService("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    backingServiceC.addEndpoint(endpointC);

    let storageBackingServiceD = new StorageBackingService("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    storageBackingServiceD.addEndpoint(endpointD);

    let componentE = new Component("s5", "testService", getEmptyMetaData());

    system.addEntities([serviceA, serviceB, backingServiceC, storageBackingServiceD, componentE]);

    let measureValue = systemMeasureImplementations["totalNumberOfComponents"]({ entity: system, system: system });
    expect(measureValue).toEqual(5);
})


test("numberOfServices", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let backingServiceC = new BackingService("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    backingServiceC.addEndpoint(endpointC);

    let storageBackingServiceD = new StorageBackingService("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    storageBackingServiceD.addEndpoint(endpointD);

    let componentE = new Component("s5", "testService", getEmptyMetaData());

    system.addEntities([serviceA, serviceB, backingServiceC, storageBackingServiceD, componentE]);

    let measureValue = systemMeasureImplementations["numberOfServices"]({ entity: system, system: system });
    expect(measureValue).toEqual(2);

})

test("numberOfBackingServices", () => {

    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let backingServiceC = new BackingService("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    backingServiceC.addEndpoint(endpointC);

    let storageBackingServiceD = new StorageBackingService("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    storageBackingServiceD.addEndpoint(endpointD);

    let componentE = new Component("s5", "testService", getEmptyMetaData());

    system.addEntities([serviceA, serviceB, backingServiceC, storageBackingServiceD, componentE]);

    let measureValue = systemMeasureImplementations["numberOfBackingServices"]({ entity: system, system: system });
    expect(measureValue).toEqual(1);
})

test("totalNumberOfLinksInASystem", () => {

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
    let linkED = new Link("l3", serviceD, endpointB);
    let linkDB = new Link("l4", serviceE, endpointD);

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkED, linkDB]);

    let measureValue = systemMeasureImplementations["totalNumberOfLinksInASystem"]({ entity: system, system: system });
    expect(measureValue).toEqual(4);
})

test("numberOfSynchronousEndpoints", () => {
    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(externalEndpointA);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointD);

    system.addEntities([serviceX, serviceY]);

    let measureValue = systemMeasureImplementations["numberOfSynchronousEndpoints"]({ entity: system, system: system });
    expect(measureValue).toEqual(3);
})

test("numberOfAsynchronousEndpoints", () => {
    let system = new System("sys1", "testSystem");;

    let serviceX = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(externalEndpointA);

    let serviceY = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointD);

    system.addEntities([serviceX, serviceY]);

    let measureValue = systemMeasureImplementations["numberOfAsynchronousEndpoints"]({ entity: system, system: system });
    expect(measureValue).toEqual(2);
})

test("numberOfServicesWhichHaveIncomingLinks", () => {
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
    let linkED = new Link("l3", serviceD, endpointB);
    let linkDB = new Link("l4", serviceE, endpointD);

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkED, linkDB]);

    let measureValue = systemMeasureImplementations["numberOfServicesWhichHaveIncomingLinks"]({ entity: system, system: system });
    expect(measureValue).toEqual(3);
})

test("numberOfServicesWhichHaveOutgoingLinks", () => {
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
    let linkED = new Link("l3", serviceD, endpointB);
    let linkDB = new Link("l4", serviceE, endpointD);

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkED, linkDB]);

    let measureValue = systemMeasureImplementations["numberOfServicesWhichHaveOutgoingLinks"]({ entity: system, system: system });
    expect(measureValue).toEqual(4);
})

test("numberOfServicesWhichHaveBothIncomingAndOutgoingLinks", () => {
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
    let linkED = new Link("l3", serviceD, endpointB);
    let linkDB = new Link("l4", serviceE, endpointD);

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkED, linkDB]);

    let measureValue = systemMeasureImplementations["numberOfServicesWhichHaveBothIncomingAndOutgoingLinks"]({ entity: system, system: system });
    expect(measureValue).toEqual(2);
})


test("numberOfServiceConnectedToStorageBackingService", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let storageBackingService = new StorageBackingService("sbs1", "storage service", getEmptyMetaData());
    let endpointS = new Endpoint("e2", "storage endpoint", getEmptyMetaData());
    storageBackingService.addEndpoint(endpointS);


    let linkAS = new Link("l1", serviceA, endpointS);
    let linkBS = new Link("l2", serviceB, endpointS);
    let linkCS = new Link("l3", serviceC, endpointS);
    let linkAB = new Link("l4", serviceA, endpointA);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntity(storageBackingService);
    system.addEntities([linkAS, linkBS, linkCS, linkAB]);

    let measureValue = systemMeasureImplementations["numberOfServiceConnectedToStorageBackingService"]({ entity: system, system: system });
    expect(measureValue).toEqual(3);

})

test("numberOfRequestTraces", () => {

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
    let linkDB = new Link("l3", serviceD, endpointB);
    let linkED = new Link("l4", serviceE, endpointD);


    let requestTraceA = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTraceA.setLinks = [[linkAB], [linkBC]];
    requestTraceA.setExternalEndpoint = externalEndpointA;

    let requestTraceB = new RequestTrace("rq2", "request trace 2", getEmptyMetaData());
    requestTraceB.setLinks = [[linkED], [linkDB], [linkBC]];
    requestTraceB.setExternalEndpoint = externalEndpointE;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkDB, linkED]);
    system.addEntities([requestTraceA, requestTraceB]);

    let measureValue = systemMeasureImplementations["numberOfRequestTraces"]({ entity: system, system: system });
    expect(measureValue).toEqual(2);
})

test("averageComplexityOfRequestTraces", () => {
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
    let linkDB = new Link("l3", serviceD, endpointB);
    let linkED = new Link("l4", serviceE, endpointD);


    let requestTraceA = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTraceA.setLinks = [[linkAB], [linkBC]];
    requestTraceA.setExternalEndpoint = externalEndpointA;

    let requestTraceB = new RequestTrace("rq2", "request trace 2", getEmptyMetaData());
    requestTraceB.setLinks = [[linkED], [linkDB], [linkBC]];
    requestTraceB.setExternalEndpoint = externalEndpointE;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkDB, linkED]);
    system.addEntities([requestTraceA, requestTraceB]);

    let measureValue = systemMeasureImplementations["averageComplexityOfRequestTraces"]({ entity: system, system: system });
    expect(measureValue).toEqual(2.5);
})


test("amountOfRedundancy", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    let infrastructureC = new Infrastructure("i3", "infrastructure 3", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceA, infrastructureB);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceB, infrastructureB);
    let deploymentMappingD = new DeploymentMapping("dm4", serviceC, infrastructureC);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC, deploymentMappingD]);

    let measureValue = systemMeasureImplementations["amountOfRedundancy"]({ entity: system, system: system });
    expect(measureValue).toEqual(4 / 3);
})


test("serviceInteractionViaBackingService", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService 1", getEmptyMetaData());
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

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE, serviceF]);
    system.addEntities([brokerService]);
    system.addEntities([linkABS, linkBBS, linkCBS, linkDE, linkEF]);

    let measureValue = systemMeasureImplementations["serviceInteractionViaBackingService"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
})

test("serviceInteractionViaBackingService", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService 1", getEmptyMetaData());
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
    let linkDF = new Link("l5", serviceD, endpointF);
    let linkEF = new Link("l6", serviceE, endpointF);

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE, serviceF]);
    system.addEntities([brokerService]);
    system.addEntities([linkABS, linkBBS, linkCBS, linkDE, linkDF, linkEF]);

    let measureValue = systemMeasureImplementations["eventSourcingUtilizationMetric"]({ entity: system, system: system });
    expect(measureValue).toEqual(2 / 5);
})

test("configurationExternalization", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let configA = new BackingData("c1", "config A", getEmptyMetaData());
    let relationAtoA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    serviceA.addBackingDataEntity(configA, relationAtoA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let configB = new BackingData("c2", "config B", getEmptyMetaData());
    let relationBtoB = new RelationToBackingData("r2", getEmptyMetaData());
    relationBtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    serviceB.addBackingDataEntity(configB, relationBtoB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let configC = new BackingData("c3", "config C", getEmptyMetaData());
    let relationCtoC = new RelationToBackingData("r3", getEmptyMetaData());
    relationCtoC.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    serviceC.addBackingDataEntity(configC, relationCtoC);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", "config");
    let relationBStoA = new RelationToBackingData("r4", getEmptyMetaData());
    relationBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    backingService.addBackingDataEntity(configA, relationBStoA);

    let storageBackingService = new StorageBackingService("sbs1", "storage backing service 1", getEmptyMetaData());
    let relationSBStoA = new RelationToBackingData("r5", getEmptyMetaData());
    relationSBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    storageBackingService.addBackingDataEntity(configA, relationSBStoA);

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let relationIAtoC = new RelationToBackingData("r6", getEmptyMetaData());
    relationIAtoC.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    infrastructureA.addBackingDataEntity(configC, relationIAtoC);

    system.addEntities([configA, configB, configC]);
    system.addEntities([serviceA, serviceB, serviceC, backingService, storageBackingService]);
    system.addEntities([infrastructureA]);

    let measureValue = systemMeasureImplementations["configurationExternalization"]({ entity: system, system: system });
    expect(measureValue).toEqual(3 / 4);

})

test("ratioOfRequestTracesThroughGateway", () => {
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
    serviceA.setExternalIngressProxiedBy = gatewayServiceA;

    let gatewayServiceB = new ProxyBackingService("p2", "proxy 2", getEmptyMetaData());
    gatewayServiceB.setPropertyValue("kind", "API Gateway");
    let externalEndpointPB = new ExternalEndpoint("ee3", "external endpoint 3", getEmptyMetaData());
    gatewayServiceB.addEndpoint(externalEndpointPB);
    serviceB.setExternalIngressProxiedBy = gatewayServiceB;

    let linkPAA = new Link("l1", gatewayServiceA, externalEndpointA);
    let linkASBS = new Link("l2", serviceA, endpointSBS);
    let linkBSBS = new Link("l3", serviceB, endpointSBS);
    let linkPBB = new Link("l4", gatewayServiceB, endpointB);
    let linkCD = new Link("l5", serviceC, endpointD);

    let requestTraceA = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTraceA.setLinks = [[linkPAA], [linkASBS]];
    requestTraceA.setExternalEndpoint = externalEndpointA;

    let requestTraceB = new RequestTrace("rq2", "request trace 2", getEmptyMetaData());
    requestTraceB.setLinks = [[linkPBB], [linkBSBS]];
    requestTraceB.setExternalEndpoint = externalEndpointPB

    let requestTraceC = new RequestTrace("rq3", "request trace 3", getEmptyMetaData());
    requestTraceC.setLinks = [[linkCD]]
    requestTraceC.setExternalEndpoint = externalEndpointC;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, storageBackingService, gatewayServiceA, gatewayServiceB]);
    system.addEntities([linkPAA, linkASBS, linkBSBS, linkPBB, linkCD]);
    system.addEntities([requestTraceA, requestTraceB, requestTraceC])

    let measureValue = systemMeasureImplementations["ratioOfRequestTracesThroughGateway"]({ entity: system, system: system });
    expect(measureValue).toEqual(2 / 3);

})


test("ratioOfInfrastructureNodesThatSupportMonitoring", () => {
    let system = new System("sys1", "testSystem");;

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let metricsIA = new BackingData("m2", "metrics 2", getEmptyMetaData());
    metricsIA.setPropertyValue("kind", "metrics");
    let relationIAtoMIA = new RelationToBackingData("r4", getEmptyMetaData());
    relationIAtoMIA.setPropertyValue("usage_relation", "persistence");
    infrastructureA.addBackingDataEntity(metricsIA, relationIAtoMIA);
    let logsIA = new BackingData("l2", "logs 2", getEmptyMetaData());
    logsIA.setPropertyValue("kind", "logs");
    let relationIAtoLIA = new RelationToBackingData("r5", getEmptyMetaData());
    relationIAtoLIA.setPropertyValue("usage_relation", "persistence");
    infrastructureA.addBackingDataEntity(logsIA, relationIAtoLIA);

    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    let logsIB = new BackingData("l3", "logs 3", getEmptyMetaData());
    logsIB.setPropertyValue("kind", "logs");
    let relationIBtoLIB = new RelationToBackingData("r6", getEmptyMetaData());
    relationIBtoLIB.setPropertyValue("usage_relation", "persistence");
    infrastructureB.addBackingDataEntity(logsIB, relationIBtoLIB);

    let infrastructureC = new Infrastructure("i3", "infrastructure 3", getEmptyMetaData());

    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);

    let measureValue = systemMeasureImplementations["ratioOfInfrastructureNodesThatSupportMonitoring"]({ entity: system, system: system });
    expect(measureValue).toEqual(1 / 3);
})

test("ratioOfComponentsThatSupportMonitoring", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService 1", getEmptyMetaData());
    let metricsA = new BackingData("m1", "metrics 1", getEmptyMetaData());
    metricsA.setPropertyValue("kind", "metrics");
    let relationAtoMA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoMA.setPropertyValue("usage_relation", "persistence");
    serviceA.addBackingDataEntity(metricsA, relationAtoMA);
    let logsA = new BackingData("l1", "logs 1", getEmptyMetaData());
    logsA.setPropertyValue("kind", "logs");
    let relationAtoLA = new RelationToBackingData("r2", getEmptyMetaData());
    relationAtoLA.setPropertyValue("usage_relation", "persistence");
    serviceA.addBackingDataEntity(logsA, relationAtoLA);

    let serviceB = new Service("s2", "testService 2", getEmptyMetaData());
    let logsB = new BackingData("l2", "logs 2", getEmptyMetaData());
    logsB.setPropertyValue("kind", "logs");
    let relationBtoLB = new RelationToBackingData("r3", getEmptyMetaData());
    relationBtoLB.setPropertyValue("usage_relation", "persistence");
    serviceB.addBackingDataEntity(logsB, relationBtoLB);

    let serviceC = new Service("s3", "testService 3", getEmptyMetaData());

    system.addEntities([serviceA, serviceB, serviceC]);

    let measureValue = systemMeasureImplementations["ratioOfComponentsThatSupportMonitoring"]({ entity: system, system: system });
    expect(measureValue).toEqual(1 / 3);

})

test("ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService", () => {
    let system = new System("sys1", "testSystem");;

    let loggingService = new BackingService("bl1", "logging service", getEmptyMetaData());
    loggingService.setPropertyValue("providedFunctionality", "logging");
    let loggingEndpoint = new Endpoint("e1", "logging endpoint", getEmptyMetaData());
    loggingService.addEndpoint(loggingEndpoint);

    let serviceA = new Service("s1", "testService 1", getEmptyMetaData());
    let metricsA = new BackingData("m1", "metrics 1", getEmptyMetaData());
    metricsA.setPropertyValue("kind", "metrics");
    let relationAtoMA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoMA.setPropertyValue("usage_relation", "persistence");
    serviceA.addBackingDataEntity(metricsA, relationAtoMA);
    let logsA = new BackingData("l1", "logs 1", getEmptyMetaData());
    logsA.setPropertyValue("kind", "logs");
    let relationAtoLA = new RelationToBackingData("r2", getEmptyMetaData());
    relationAtoLA.setPropertyValue("usage_relation", "usage");
    serviceA.addBackingDataEntity(logsA, relationAtoLA);
    let relationLStoLA = new RelationToBackingData("r3", getEmptyMetaData());
    relationLStoLA.setPropertyValue("usage_relation", "persistence");
    loggingService.addBackingDataEntity(logsA, relationLStoLA);

    let serviceB = new Service("s2", "testService 2", getEmptyMetaData());
    let logsB = new BackingData("l2", "logs 2", getEmptyMetaData());
    logsB.setPropertyValue("kind", "logs");
    let relationBtoLB = new RelationToBackingData("r4", getEmptyMetaData());
    relationBtoLB.setPropertyValue("usage_relation", "usage");
    serviceB.addBackingDataEntity(logsB, relationBtoLB);
    let relationLStoLB = new RelationToBackingData("r5", getEmptyMetaData());
    relationLStoLB.setPropertyValue("usage_relation", "persistence");
    loggingService.addBackingDataEntity(logsB, relationLStoLB);
    let endpointB = new Endpoint("e2", "endpoint B", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService 3", getEmptyMetaData());
    let logsC = new BackingData("l3", "logs 3", getEmptyMetaData());
    logsC.setPropertyValue("kind", "logs");
    let relationCtoLC = new RelationToBackingData("r6", getEmptyMetaData());
    relationCtoLC.setPropertyValue("usage_relation", "persistence");
    serviceC.addBackingDataEntity(logsC, relationCtoLC);


    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let metricsIA = new BackingData("m2", "metrics 2", getEmptyMetaData());
    metricsIA.setPropertyValue("kind", "metrics");
    let relationIAtoMIA = new RelationToBackingData("r7", getEmptyMetaData());
    relationIAtoMIA.setPropertyValue("usage_relation", "persistence");
    infrastructureA.addBackingDataEntity(metricsIA, relationIAtoMIA);
    let logsIA = new BackingData("l4", "logs 4", getEmptyMetaData());
    logsIA.setPropertyValue("kind", "logs");
    let relationIAtoLIA = new RelationToBackingData("r8", getEmptyMetaData());
    relationIAtoLIA.setPropertyValue("usage_relation", "usage");
    infrastructureA.addBackingDataEntity(logsIA, relationIAtoLIA);
    let relationLStoLIA = new RelationToBackingData("r9", getEmptyMetaData());
    relationLStoLIA.setPropertyValue("usage_relation", "persistence");
    loggingService.addBackingDataEntity(logsIA, relationLStoLIA);


    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    let logsIB = new BackingData("l5", "logs 5", getEmptyMetaData());
    logsIB.setPropertyValue("kind", "logs");
    let relationIBtoLIB = new RelationToBackingData("r10", getEmptyMetaData());
    relationIBtoLIB.setPropertyValue("usage_relation", "persistence");
    infrastructureB.addBackingDataEntity(logsIB, relationIBtoLIB);

    let infrastructureC = new Infrastructure("i3", "infrastructure 3", getEmptyMetaData());

    let linkALS = new Link("link1", serviceA, loggingEndpoint);
    let linkLSB = new Link("link2", loggingService, endpointB);


    system.addEntities([loggingService, serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([linkALS, linkLSB]);

    let measureValue = systemMeasureImplementations["ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService"]({ entity: system, system: system });
    expect(measureValue).toEqual(3 / 6);
})


test("ratioOfComponentsOrInfrastructureNodesThatExportMetrics", () => {
    let system = new System("sys1", "testSystem");;

    let metricsService = new BackingService("bl1", "metrics service", getEmptyMetaData());
    metricsService.setPropertyValue("providedFunctionality", "metrics");
    let metricsEndpoint = new Endpoint("e1", "metrics endpoint", getEmptyMetaData());
    metricsService.addEndpoint(metricsEndpoint);

    let serviceA = new Service("s1", "testService 1", getEmptyMetaData());
    let metricsA = new BackingData("m1", "metrics 1", getEmptyMetaData());
    metricsA.setPropertyValue("kind", "metrics");
    let relationAtoMA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoMA.setPropertyValue("usage_relation", "usage");
    serviceA.addBackingDataEntity(metricsA, relationAtoMA);
    let relationMStoMA = new RelationToBackingData("r2", getEmptyMetaData());
    relationMStoMA.setPropertyValue("usage_relation", "persistence");
    metricsService.addBackingDataEntity(metricsA, relationMStoMA);

    let serviceB = new Service("s2", "testService 2", getEmptyMetaData());
    let metricsB = new BackingData("m2", "metrics 2", getEmptyMetaData());
    metricsB.setPropertyValue("kind", "metrics");
    let relationBtoMB = new RelationToBackingData("r3", getEmptyMetaData());
    relationBtoMB.setPropertyValue("usage_relation", "usage");
    serviceB.addBackingDataEntity(metricsB, relationBtoMB);
    let relationMStoMB = new RelationToBackingData("r4", getEmptyMetaData());
    relationMStoMB.setPropertyValue("usage_relation", "persistence");
    metricsService.addBackingDataEntity(metricsB, relationMStoMB);
    let endpointB = new Endpoint("e2", "endpoint B", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService 3", getEmptyMetaData());
    let metricsC = new BackingData("m3", "metrics 3", getEmptyMetaData());
    metricsC.setPropertyValue("kind", "metrics");
    let relationCtoMC = new RelationToBackingData("r5", getEmptyMetaData());
    relationCtoMC.setPropertyValue("usage_relation", "persistence");
    serviceC.addBackingDataEntity(metricsC, relationCtoMC);


    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let metricsIA = new BackingData("m4", "metrics 4", getEmptyMetaData());
    metricsIA.setPropertyValue("kind", "metrics");
    let relationIAtoMIA = new RelationToBackingData("r6", getEmptyMetaData());
    relationIAtoMIA.setPropertyValue("usage_relation", "usage");
    infrastructureA.addBackingDataEntity(metricsIA, relationIAtoMIA);
    let relationMStoMIA = new RelationToBackingData("r7", getEmptyMetaData());
    relationMStoMIA.setPropertyValue("usage_relation", "persistence");
    metricsService.addBackingDataEntity(metricsIA, relationMStoMIA);


    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    let metricsIB = new BackingData("m5", "metrics 5", getEmptyMetaData());
    metricsIB.setPropertyValue("kind", "metrics");
    let relationIBtoMIB = new RelationToBackingData("r8", getEmptyMetaData());
    relationIBtoMIB.setPropertyValue("usage_relation", "persistence");
    infrastructureB.addBackingDataEntity(metricsIB, relationIBtoMIB);

    let infrastructureC = new Infrastructure("i3", "infrastructure 3", getEmptyMetaData());

    let linkAMS = new Link("link1", serviceA, metricsEndpoint);
    let linkMSB = new Link("link2", metricsService, endpointB);

    system.addEntities([metricsService, serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([linkAMS, linkMSB]);

    let measureValue = systemMeasureImplementations["ratioOfComponentsOrInfrastructureNodesThatExportMetrics"]({ entity: system, system: system });
    expect(measureValue).toEqual(3 / 6);
})


test("distributedTracingSupport", () => {
    let system = new System("sys1", "testSystem");;

    let tracingService = new BackingService("t1", "tracing service", getEmptyMetaData());
    tracingService.setPropertyValue("providedFunctionality", "tracing");
    let tracingEndpoint = new Endpoint("te1", "tracing endpoint", getEmptyMetaData());
    tracingService.addEndpoint(tracingEndpoint);

    let serviceA = new Service("s1", "testService 1", getEmptyMetaData());
    let serviceB = new Service("s2", "testService 2", getEmptyMetaData())
    let serviceC = new Service("s3", "testService 3", getEmptyMetaData());

    let storageBackingService = new StorageBackingService("sbs1", "storage 1", getEmptyMetaData());

    let linkATS = new Link("link1", serviceA, tracingEndpoint);
    let linkCTS = new Link("link2", serviceC, tracingEndpoint);
    let linkSBSTS = new Link("link3", storageBackingService, tracingEndpoint);

    system.addEntities([tracingService, serviceA, serviceB, serviceC, storageBackingService]);
    system.addEntities([linkATS, linkCTS, linkSBSTS]);

    let measureValue = systemMeasureImplementations["distributedTracingSupport"]({ entity: system, system: system });
    expect(measureValue).toEqual(3 / 4);
})


test("serviceDiscoveryUsage", () => {

    let system = new System("sys1", "testSystem");;

    let discoveryService = new BackingService("b1", "discoveryService", getEmptyMetaData());
    discoveryService.setPropertyValue("address_resolution_kind", "discovery");

    let serviceA = new Service("s1", "testService 1", getEmptyMetaData());
    serviceA.setAddressResolutionBy = discoveryService;

    let serviceB = new Service("s2", "testService 2", getEmptyMetaData());
    let endpointB = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    let serviceC = new Service("s3", "testService 3", getEmptyMetaData());
    let endpointC = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService 3", getEmptyMetaData());
    let endpointD = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let storageBackingService = new StorageBackingService("sbs1", "storageBackingService", getEmptyMetaData());
    let endpointSBS = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    storageBackingService.addEndpoint(endpointSBS);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkAC = new Link("l2", serviceA, endpointC);
    let linkASBS = new Link("l3", serviceA, endpointSBS);
    let linkBD = new Link("l4", serviceB, endpointD);
    let linkBSBS = new Link("l5", serviceB, endpointSBS);

    system.addEntities([serviceA, serviceB, serviceC, serviceD, storageBackingService]);
    system.addEntities([linkAB, linkAC, linkASBS, linkBD, linkBSBS]);

    let measureValue = systemMeasureImplementations["serviceDiscoveryUsage"]({ entity: system, system: system });
    expect(measureValue).toEqual(3 / 5);
})

test("ratioOfComponentsWhoseIngressIsProxied", () => {
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

    serviceA.setExternalIngressProxiedBy = gatewayServiceA;
    serviceA.setIngressProxiedBy = serviceMesh;

    serviceB.setIngressProxiedBy = serviceMesh

    storageBackingService.setExternalIngressProxiedBy = gatewayServiceA;
    storageBackingService.setIngressProxiedBy = serviceMesh;


    system.addEntities([serviceA, serviceB, serviceC, serviceD, storageBackingService, gatewayServiceA, serviceMesh]);

    let measureValue = systemMeasureImplementations["ratioOfComponentsWhoseIngressIsProxied"]({ entity: system, system: system });
    expect(measureValue).toEqual(2 / 5);
})

test("ratioOfComponentsWhoseEgressIsProxied", () => {
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

    serviceA.setEgressProxiedBy = serviceMesh;

    serviceB.setEgressProxiedBy = serviceMesh;

    storageBackingService.setEgressProxiedBy = serviceMesh;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, storageBackingService, gatewayServiceA, serviceMesh]);

    let measureValue = systemMeasureImplementations["ratioOfComponentsWhoseEgressIsProxied"]({ entity: system, system: system });
    expect(measureValue).toEqual(3 / 5);
})

test("ratioOfCachedDataAggregates", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let dataAggregateX = new DataAggregate("da1", "data aggregate 1", getEmptyMetaData());
    let dataAggregateY = new DataAggregate("da2", "data aggregate 2", getEmptyMetaData());
    let dataAggregateZ = new DataAggregate("da3", "data aggregate 3", getEmptyMetaData());

    let usageAX = new RelationToDataAggregate("r1", getEmptyMetaData());
    usageAX.setPropertyValue("usage_relation", "cached-usage");
    let usageAY = new RelationToDataAggregate("r2", getEmptyMetaData());
    usageAY.setPropertyValue("usage_relation", "cached-usage");
    serviceA.addDataAggregateEntity(dataAggregateX, usageAX);
    serviceA.addDataAggregateEntity(dataAggregateY, usageAY);

    let usageBX = new RelationToDataAggregate("r3", getEmptyMetaData());
    usageBX.setPropertyValue("usage_relation", "usage");
    let usageBY = new RelationToDataAggregate("r4", getEmptyMetaData());
    usageBY.setPropertyValue("usage_relation", "cached-usage");
    serviceB.addDataAggregateEntity(dataAggregateX, usageBX);
    serviceB.addDataAggregateEntity(dataAggregateY, usageBY);

    let usageCX = new RelationToDataAggregate("r5", getEmptyMetaData());
    usageCX.setPropertyValue("usage_relation", "persistence");
    let usageCY = new RelationToDataAggregate("r6", getEmptyMetaData());
    usageCY.setPropertyValue("usage_relation", "persistence");
    let usageCZ = new RelationToDataAggregate("r7", getEmptyMetaData());
    usageCZ.setPropertyValue("usage_relation", "usage");
    serviceC.addDataAggregateEntity(dataAggregateX, usageCX);
    serviceC.addDataAggregateEntity(dataAggregateY, usageCY);
    serviceC.addDataAggregateEntity(dataAggregateZ, usageCZ);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([dataAggregateX, dataAggregateY, dataAggregateZ]);

    let measureValue = systemMeasureImplementations["ratioOfCachedDataAggregates"]({ entity: system, system: system });
    expect(measureValue).toBe(3 / 5);

})

test("ratioOfStateDependencyOfEndpoints", () => {

    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint A", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint B", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let dataAggregateX = new DataAggregate("da1", "data aggregate 1", getEmptyMetaData());

    let usageAX = new RelationToDataAggregate("r1", getEmptyMetaData());
    usageAX.setPropertyValue("usage_relation", "cached-usage");
    let usageEAX = new RelationToDataAggregate("r2", getEmptyMetaData());
    usageEAX.setPropertyValue("usage_relation", "cached-usage");
    endpointA.addDataAggregateEntity(dataAggregateX, usageEAX);

    system.addEntity(dataAggregateX);
    system.addEntities([serviceA, serviceB]);


    let measureValue = systemMeasureImplementations["ratioOfStateDependencyOfEndpoints"]({ entity: system, system: system });
    expect(measureValue).toBe(0.5);

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

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC, deploymentMappingD]);
    system.addEntities([linkAB, linkBC, linkCD]);

    let measureValue = systemMeasureImplementations["serviceReplicationLevel"]({ entity: system, system: system });
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
    deploymentMappingC.setPropertyValue("replicas", 3);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);
    let deploymentMappingD = new DeploymentMapping("dm4", serviceD, infrastructureB);
    deploymentMappingD.setPropertyValue("replicas", 3);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC, deploymentMappingD]);
    system.addEntities([linkAB, linkBC, linkCD]);

    let measureValue = systemMeasureImplementations["medianServiceReplication"]({ entity: system, system: system });
    expect(measureValue).toEqual(2.5);
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
    deploymentMappingA.setPropertyValue("replicas", 1);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    deploymentMappingB.setPropertyValue("replicas", 2);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureB);
    deploymentMappingC.setPropertyValue("replicas", 3);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);
    let deploymentMappingD = new DeploymentMapping("dm4", serviceD, infrastructureB);
    deploymentMappingD.setPropertyValue("replicas", 3);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC, deploymentMappingD]);
    system.addEntities([linkAB, linkBC, linkCD]);

    let measureValue = systemMeasureImplementations["smallestReplicationValue"]({ entity: system, system: system });
    expect(measureValue).toEqual(1);
})


test("serviceMeshUsage", () => {
    let system = new System("sys1", "testSystem");
    let proxyA = new ProxyBackingService("p1", "proxy 1", getEmptyMetaData());
    proxyA.setPropertyValue("kind", SERVICE_MESH_KIND);
    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    serviceA.setIngressProxiedBy = proxyA;
    serviceA.setEgressProxiedBy = proxyA;
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    serviceB.setIngressProxiedBy = proxyA;
    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    serviceC.setIngressProxiedBy = proxyA;

    system.addEntities([proxyA]);
    system.addEntities([serviceA, serviceB, serviceC]);

    let measureValue = systemMeasureImplementations["serviceMeshUsage"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})

test("secretsExternalization", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let secretA = new BackingData("c1", "secret A", getEmptyMetaData());
    secretA.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let relationAtoA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    serviceA.addBackingDataEntity(secretA, relationAtoA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let secretB = new BackingData("c2", "config B", getEmptyMetaData());
    secretB.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let relationBtoB = new RelationToBackingData("r2", getEmptyMetaData());
    relationBtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    serviceB.addBackingDataEntity(secretB, relationBtoB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let secretC = new BackingData("c3", "config C", getEmptyMetaData());
    secretC.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let relationCtoC = new RelationToBackingData("r3", getEmptyMetaData());
    relationCtoC.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    serviceC.addBackingDataEntity(secretC, relationCtoC);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", "vault");
    let relationBStoA = new RelationToBackingData("r4", getEmptyMetaData());
    relationBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    backingService.addBackingDataEntity(secretA, relationBStoA);

    let storageBackingService = new StorageBackingService("sbs1", "storage backing service 1", getEmptyMetaData());
    let relationSBStoA = new RelationToBackingData("r5", getEmptyMetaData());
    relationSBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    storageBackingService.addBackingDataEntity(secretA, relationSBStoA);

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let relationIAtoC = new RelationToBackingData("r6", getEmptyMetaData());
    relationIAtoC.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    infrastructureA.addBackingDataEntity(secretC, relationIAtoC);

    system.addEntities([secretA, secretB, secretC]);
    system.addEntities([serviceA, serviceB, serviceC, backingService, storageBackingService]);
    system.addEntities([infrastructureA]);

    let measureValue = systemMeasureImplementations["secretsExternalization"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.75);
})

test("ratioOfSpecializedStatefulServices", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    serviceA.setPropertyValue("stateless", true);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    serviceB.setPropertyValue("stateless", false);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", "config");
    backingService.setPropertyValue("stateless", true);

    let storageBackingService = new StorageBackingService("sbs1", "storage backing service 1", getEmptyMetaData());
    storageBackingService.setPropertyValue("stateless", false);

    system.addEntities([serviceA, serviceB, backingService, storageBackingService]);

    let measureValue = systemMeasureImplementations["ratioOfSpecializedStatefulServices"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
})


test("suitablyReplicatedStatefulService", () => {

    let system = new System("sys1", "testSystem");;
    let infrastructureA = new Infrastructure("i1", "Infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());
    let storageBackingServiceA = new StorageBackingService("sbs1", "Storage Backing Service A", getEmptyMetaData());
    storageBackingServiceA.setPropertyValue("stateless", false);
    storageBackingServiceA.setPropertyValue("replication_strategy", "read-only-replication");

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

    system.addEntities([storageBackingServiceA, storageBackingServiceB, storageBackingServiceC]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = systemMeasureImplementations["suitablyReplicatedStatefulService"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
})

test("ratioOfUniqueAccountUsage", () => {
    let system = new System("sys1", "testSystem");;
    let infrastructureA = new Infrastructure("i1", "Infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("identities", {"infraAccount": "account"});
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());
    infrastructureB.setPropertyValue("identities", {"default-account": "account"});

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    serviceA.setPropertyValue("identities", {"serviceAccount": "account"});

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    serviceB.setPropertyValue("identities", {"default-account": "account"});

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([serviceA, serviceB]);

    let measureValue = systemMeasureImplementations["ratioOfUniqueAccountUsage"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.75);
})


test("ratioOfNonCustomBackingServices", () => {
    let system = new System("sys1", "testSystem");;
    let backingService = new BackingService("s1", "backingService", getEmptyMetaData());
    backingService.setPropertyValue("software_type", "open-source");
    system.addEntity(backingService);

    let storageBackingService = new StorageBackingService("s2", "storageBackingService", getEmptyMetaData());
    storageBackingService.setPropertyValue("software_type", "custom");
    system.addEntity(storageBackingService);

    let proxyBackingService = new ProxyBackingService("s3", "proxyBackingService", getEmptyMetaData());
    proxyBackingService.setPropertyValue("software_type", "proprietary");
    system.addEntity(proxyBackingService);

    let brokerBackingService = new BrokerBackingService("s4", "brokerBackingService", getEmptyMetaData());
    brokerBackingService.setPropertyValue("software_type", "custom");
    system.addEntity(brokerBackingService);

    let measureValue = systemMeasureImplementations["ratioOfNonCustomBackingServices"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
})


test("secretsStoredInVault", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let secretA = new BackingData("b1", "secret A", getEmptyMetaData());
    secretA.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let relationAtoA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    serviceA.addBackingDataEntity(secretA, relationAtoA);

    let secretB = new BackingData("b2", "secret B", getEmptyMetaData());
    secretB.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let relationAtoB = new RelationToBackingData("r2", getEmptyMetaData());
    relationAtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    serviceA.addBackingDataEntity(secretB, relationAtoB);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", "configuration");
    let relationBStoA = new RelationToBackingData("r4", getEmptyMetaData());
    relationBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    backingService.addBackingDataEntity(secretA, relationBStoA);

    let vaultService = new BackingService("vs1", "backing service 1", getEmptyMetaData());
    vaultService.setPropertyValue("providedFunctionality", "vault");
    let relationVStoA = new RelationToBackingData("r5", getEmptyMetaData());
    relationVStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    vaultService.addBackingDataEntity(secretA, relationVStoA);
    let relationVStoB = new RelationToBackingData("r6", getEmptyMetaData());
    relationVStoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    vaultService.addBackingDataEntity(secretB, relationVStoB);


    system.addEntities([secretA, secretB]);
    system.addEntities([serviceA, backingService, vaultService]);

    let measureValue = systemMeasureImplementations["secretsStoredInVault"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
})


test("accessRestrictedToCallers", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setAllowedAccounts = ["a1", "a2"];
    serviceA.addEndpoint(endpointA);

    let serviceB = new Service("s2", "service B", getEmptyMetaData())
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setAllowedAccounts = ["a1"];
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "service C", getEmptyMetaData())
    serviceC.setPropertyValue("identities", {"a1": "account"});

    let serviceD = new Service("s4", "service D", getEmptyMetaData())
    let endpointD = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointD.setAllowedAccounts = [];
    serviceD.addEndpoint(endpointD);

    let linkCA = new Link("l1", serviceC, endpointA);
    let linkCB = new Link("l2", serviceC, endpointB);
    let linkAD = new Link("l3", serviceA, endpointD);

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkCA, linkCB, linkAD]);

    let measureValue = systemMeasureImplementations["accessRestrictedToCallers"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
})

test("ratioOfDelegatedAuthentication", () => {
    let system = new System("sys1", "testSystem");

    let authService = new BackingService("auth1", "auth service", getEmptyMetaData());
    authService.setPropertyValue("providedFunctionality", "authentication/authorization");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    serviceA.setAuthenticationBy = authService;

    let serviceB = new Service("s2", "service B", getEmptyMetaData())
    serviceB.setAuthenticationBy = authService;

    let serviceC = new Service("s3", "service C", getEmptyMetaData())

    system.addEntities([authService, serviceA, serviceB, serviceC]);

    let measureValue = systemMeasureImplementations["ratioOfDelegatedAuthentication"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})


test("ratioOfStandardizedArtifacts", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let propertiesA = getArtifactTypeProperties("Image.Container.OCI");
    propertiesA.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    serviceA.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesA
    ));

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData())
    let propertiesIA = getArtifactTypeProperties("Image.Container.OCI");
    propertiesIA.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    infrastructureA.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesIA
    ));
    let propertiesIB = getArtifactTypeProperties("Implementation.Java");
    propertiesIB.find(prop => prop.getKey === "based_on_standard").value = "none";
    infrastructureA.setArtifact("art2", new Artifact(
        "Implementation.Java",
        "", "", "", "", "", "", "", propertiesIB
    ));

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([infrastructureA]);
    system.addEntities([serviceA, backingService]);

    let measureValue = systemMeasureImplementations["ratioOfStandardizedArtifacts"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})

test("ratioOfEntitiesProvidingStandardizedArtifacts", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let propertiesA = getArtifactTypeProperties("Image.Container.OCI");
    propertiesA.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    serviceA.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesA
    ));

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData());
    let propertiesIB = getArtifactTypeProperties("Implementation.Java");
    propertiesIB.find(prop => prop.getKey === "based_on_standard").value = "none";
    infrastructureA.setArtifact("art2", new Artifact(
        "Implementation.Java",
        "", "", "", "", "", "", "", propertiesIB
    ));

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([infrastructureA]);
    system.addEntities([serviceA, backingService]);

    let measureValue = systemMeasureImplementations["ratioOfEntitiesProvidingStandardizedArtifacts"]({ entity: system, system: system });
    expect(measureValue).toEqual(1/3);
})

test("componentArtifactsSimilarity", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let propertiesA = getArtifactTypeProperties("Implementation.Java");
    serviceA.setArtifact("art1", new Artifact(
        "Implementation.Java",
        "", "", "", "", "", "", "", propertiesA
    ));

    let serviceB = new Service("s2", "service B", getEmptyMetaData())
    let propertiesB = getArtifactTypeProperties("Implementation.Java");
    serviceB.setArtifact("art2", new Artifact(
        "Implementation.Java",
        "", "", "", "", "", "", "", propertiesB
    ));

    let serviceC = new Service("s3", "service C", getEmptyMetaData())
    let propertiesC = getArtifactTypeProperties("Implementation.Python");
    serviceC.setArtifact("art3", new Artifact(
        "Implementation.Python",
        "", "", "", "", "", "", "", propertiesC
    ));

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData());
    let propertiesIB = getArtifactTypeProperties("Implementation.Java");
    propertiesIB.find(prop => prop.getKey === "based_on_standard").value = "none";
    infrastructureA.setArtifact("art2", new Artifact(
        "Implementation.Java",
        "", "", "", "", "", "", "", propertiesIB
    ));

    system.addEntities([infrastructureA]);
    system.addEntities([serviceA, serviceB, serviceC]);

    let measureValue = systemMeasureImplementations["componentArtifactsSimilarity"]({ entity: system, system: system });
    expect(measureValue).toEqual(1/3);
})


test("infrastructureArtifactsSimilarity", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let propertiesA = getArtifactTypeProperties("Implementation.Java");
    serviceA.setArtifact("art1", new Artifact(
        "Implementation.Java",
        "", "", "", "", "", "", "", propertiesA
    ));

    let infrastructureB = new Infrastructure("i1", "infrastructure A", getEmptyMetaData());
    let propertiesB = getArtifactTypeProperties("Image.Container.OCI");
    propertiesB.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    infrastructureB.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesB
    ));

    let infrastructureC = new Infrastructure("i2", "infrastructure B", getEmptyMetaData());
    let propertiesC = getArtifactTypeProperties("Image.Container.OCI");
    propertiesC.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    infrastructureC.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesC
    ));

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([infrastructureB, infrastructureC]);
    system.addEntities([serviceA, backingService]);

    let measureValue = systemMeasureImplementations["infrastructureArtifactsSimilarity"]({ entity: system, system: system });
    expect(measureValue).toEqual(1);
})


test("ratioOfAutomaticallyProvisionedInfrastructure", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData());
    infrastructureA.setPropertyValue("provisioning", "transparent");
    let infrastructureB = new Infrastructure("i2", "infrastructure B", getEmptyMetaData());
    infrastructureB.setPropertyValue("provisioning", "transparent");
    let infrastructureC = new Infrastructure("i3", "infrastructure C", getEmptyMetaData());

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([backingService]);

    let measureValue = systemMeasureImplementations["ratioOfAutomaticallyProvisionedInfrastructure"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})

test("ratioOfDeploymentsOnDynamicInfrastructure", () => {
    let system = new System("sys1", "testSystem");
    let infrastructureA = new Infrastructure("i1", "Infrastructure A", getEmptyMetaData());
    infrastructureA.setPropertyValue("kind", DYNAMIC_INFRASTRUCTURE[0]);
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());
    infrastructureB.setPropertyValue("kind", "virtual-hardware");
    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService 2", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceA, infrastructureB);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceB, infrastructureA);

    system.addEntities([serviceA, serviceB]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);
    let measureValue = systemMeasureImplementations["ratioOfDeploymentsOnDynamicInfrastructure"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})

test("ratioOfInfrastructureWithIaCArtifact", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData())
    let propertiesA = getArtifactTypeProperties("Terraform.Script");
    infrastructureA.setArtifact("art1", new Artifact(
        "Terraform.Script",
        "", "", "", "", "", "", "", propertiesA
    ));
    let propertiesAA = getArtifactTypeProperties("Azure.Resource");
    infrastructureA.setArtifact("art2", new Artifact(
       "Azure.Resource",
        "", "", "", "", "", "", "", propertiesAA
    ));

    let infrastructureB = new Infrastructure("i2", "infrastructure B", getEmptyMetaData())
    let propertiesB = getArtifactTypeProperties("Pulumi.Script");
    infrastructureB.setArtifact("art3", new Artifact(
        "Pulumi.Script",
        "", "", "", "", "", "", "", propertiesB
    ));

    let infrastructureC = new Infrastructure("i3", "infrastructure C", getEmptyMetaData())
    let propertiesC = getArtifactTypeProperties("Azure.Resource");
    infrastructureC.setArtifact("art4", new Artifact(
       "Azure.Resource",
        "", "", "", "", "", "", "", propertiesC
    ));

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([backingService]);

    let measureValue = systemMeasureImplementations["ratioOfInfrastructureWithIaCArtifact"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})


test("namespaceSeparation - full", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    serviceA.setPropertyValue("namespace", "first");

    let serviceB = new Service("s2", "service B", getEmptyMetaData())
    serviceB.setPropertyValue("namespace", "second");

    let serviceC = new Service("s3", "service C", getEmptyMetaData())
    serviceC.setPropertyValue("namespace", "third");

    let serviceD = new Service("s4", "service D", getEmptyMetaData())
    serviceD.setPropertyValue("namespace", "fourth");

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);

    let measureValue = systemMeasureImplementations["namespaceSeparation"]({ entity: system, system: system });
    expect(measureValue).toEqual(1);
})

test("namespaceSeparation - mixed", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    serviceA.setPropertyValue("namespace", "first");

    let serviceB = new Service("s2", "service B", getEmptyMetaData())
    serviceB.setPropertyValue("namespace", "first");

    let serviceC = new Service("s3", "service C", getEmptyMetaData())
    serviceC.setPropertyValue("namespace", "second");

    let serviceD = new Service("s4", "service D", getEmptyMetaData())
    serviceD.setPropertyValue("namespace", "second");

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);

    let measureValue = systemMeasureImplementations["namespaceSeparation"]({ entity: system, system: system });
    expect(measureValue).toBeCloseTo(2/3, 5);
})

test("namespaceSeparation - none", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    serviceA.setPropertyValue("namespace", "first");

    let serviceB = new Service("s2", "service B", getEmptyMetaData())
    serviceB.setPropertyValue("namespace", "first");

    let serviceC = new Service("s3", "service C", getEmptyMetaData())
    serviceC.setPropertyValue("namespace", "first");

    let serviceD = new Service("s4", "service D", getEmptyMetaData())
    serviceD.setPropertyValue("namespace", "first");

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);

    let measureValue = systemMeasureImplementations["namespaceSeparation"]({ entity: system, system: system });
    expect(measureValue).toEqual(0);
})

test("ratioOfFullyManagedInfrastructure", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData())
    infrastructureA.setPropertyValue("environment_access", MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS[0]);
    infrastructureA.setPropertyValue("maintenance", MANAGED_INFRASTRUCTURE_MAINTENANCE[0]);


    let infrastructureB = new Infrastructure("i2", "infrastructure B", getEmptyMetaData())
    infrastructureB.setPropertyValue("environment_access", MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS[0]);
    infrastructureB.setPropertyValue("maintenance", "manual");


    let infrastructureC = new Infrastructure("i3", "infrastructure C", getEmptyMetaData())
    infrastructureC.setPropertyValue("environment_access", "full");
    infrastructureC.setPropertyValue("maintenance", MANAGED_INFRASTRUCTURE_MAINTENANCE[0]);


    let infrastructureD = new Infrastructure("i4", "infrastructure D", getEmptyMetaData())
    infrastructureD.setPropertyValue("environment_access", "full");
    infrastructureD.setPropertyValue("maintenance", "manual");

    system.addEntities([infrastructureA, infrastructureB, infrastructureC, infrastructureD]);

    let measureValue = systemMeasureImplementations["ratioOfFullyManagedInfrastructure"]({ entity: system, system: system });
    expect(measureValue).toEqual(1/4);
})

test("ratioOfManagedBackingServices", () => {
    let system = new System("sys1", "testSystem");

    let backingServiceA = new BackingService("bs1", "backing service A", getEmptyMetaData())
    backingServiceA.setPropertyValue("managed", true);

    let backingServiceB = new StorageBackingService("bs2", "storage backing service B", getEmptyMetaData())
    backingServiceB.setPropertyValue("managed", false);

    let backingServiceC = new ProxyBackingService("bs3", "proxy backing service C", getEmptyMetaData())
    backingServiceC.setPropertyValue("managed", false);

    let backingServiceD = new BrokerBackingService("bs4", "broker backing service D", getEmptyMetaData())
    backingServiceD.setPropertyValue("managed", true);

    let serviceD = new Service("s1", "service A", getEmptyMetaData())
    serviceD.setPropertyValue("managed", true);

    system.addEntities([backingServiceA, backingServiceB, backingServiceC, backingServiceD]);
    system.addEntities([serviceD]);

    let measureValue = systemMeasureImplementations["ratioOfManagedBackingServices"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
})


test("ratioOfInfrastructureEnforcingResourceBoundaries", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData())
    infrastructureA.setPropertyValue("enforced_resource_bounds", true);

    let infrastructureB = new Infrastructure("i2", "infrastructure B", getEmptyMetaData())
    infrastructureB.setPropertyValue("enforced_resource_bounds", true);

    let infrastructureC = new Infrastructure("i3", "infrastructure C", getEmptyMetaData())
    infrastructureC.setPropertyValue("enforced_resource_bounds", false);

    let infrastructureD = new Infrastructure("i4", "infrastructure D", getEmptyMetaData())
    infrastructureD.setPropertyValue("enforced_resource_bounds", false);

    system.addEntities([infrastructureA, infrastructureB, infrastructureC, infrastructureD]);

    let measureValue = systemMeasureImplementations["ratioOfInfrastructureEnforcingResourceBoundaries"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
})

test("ratioOfDeploymentMappingsWithStatedResourceRequirements", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    let infrastructureC = new Infrastructure("i3", "infrastructure 3", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("resource_requirements", "cpu:200m, memory:1GB");
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureB);
    deploymentMappingC.setPropertyValue("resource_requirements", "cpu:200m, memory:1GB");

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = systemMeasureImplementations["ratioOfDeploymentMappingsWithStatedResourceRequirements"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})

test("deployedEntitiesAutoscaling", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("deployed_entities_scaling", "automated-built-in");
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    infrastructureB.setPropertyValue("deployed_entities_scaling", "automated-separate");
    let infrastructureC = new Infrastructure("i3", "infrastructure 3", getEmptyMetaData());
    infrastructureC.setPropertyValue("deployed_entities_scaling", "none");

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureB);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureC);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = systemMeasureImplementations["deployedEntitiesAutoscaling"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})


test("infrastructureAutoscaling", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("self_scaling", "automated-built-in");
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    infrastructureB.setPropertyValue("self_scaling", "manual");
    let infrastructureC = new Infrastructure("i3", "infrastructure 3", getEmptyMetaData());
    infrastructureC.setPropertyValue("self_scaling", "none");

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureB);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureC);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = systemMeasureImplementations["infrastructureAutoscaling"]({ entity: system, system: system });
    expect(measureValue).toEqual(1/3);
})



test("ratioOfAbstractedHardware", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("kind", DYNAMIC_INFRASTRUCTURE[0]);
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    infrastructureB.setPropertyValue("kind", "virtual-hardware");
    let infrastructureC = new Infrastructure("i3", "infrastructure 3", getEmptyMetaData());
    infrastructureC.setPropertyValue("kind", DYNAMIC_INFRASTRUCTURE[0]);

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureB);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureC);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = systemMeasureImplementations["ratioOfAbstractedHardware"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})


test("nonProviderSpecificInfrastructureArtifacts", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData())
    let propertiesA = getArtifactTypeProperties("Kubernetes.Resource");
    propertiesA.find(prop => prop.getKey === "provider_specific").value = false;
    infrastructureA.setArtifact("art1", new Artifact(
        "Kubernetes.Resource",
        "", "", "", "", "", "", "", propertiesA
    ));
    let infrastructureB = new Infrastructure("i2", "infrastructure B", getEmptyMetaData())
    let propertiesB = getArtifactTypeProperties("AWS.Resource");
    propertiesB.find(prop => prop.getKey === "provider_specific").value = true;
    infrastructureB.setArtifact("art2", new Artifact(
        "AWS.Resource",
        "", "", "", "", "", "", "", propertiesB
    ));

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([backingService]);

    let measureValue = systemMeasureImplementations["nonProviderSpecificInfrastructureArtifacts"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
})

test("nonProviderSpecificComponentArtifacts", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let propertiesA = getArtifactTypeProperties("Kubernetes.Resource");
    propertiesA.find(prop => prop.getKey === "provider_specific").value = false;
    serviceA.setArtifact("art1", new Artifact(
        "Kubernetes.Resource",
        "", "", "", "", "", "", "", propertiesA
    ));
    let serviceB = new Service("s2", "service B", getEmptyMetaData())
    let propertiesB = getArtifactTypeProperties("AWS.Resource");
    propertiesB.find(prop => prop.getKey === "provider_specific").value = true;
    serviceB.setArtifact("art2", new Artifact(
        "AWS.Resource",
        "", "", "", "", "", "", "", propertiesB
    ));

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([serviceA, serviceB]);
    system.addEntities([backingService]);

    let measureValue = systemMeasureImplementations["nonProviderSpecificComponentArtifacts"]({ entity: system, system: system });
    expect(measureValue).toEqual(1/3);
})

test("configurationStoredInConfigService", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let configA = new BackingData("b1", "config A", getEmptyMetaData());
    configA.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let relationAtoA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    serviceA.addBackingDataEntity(configA, relationAtoA);

    let configB = new BackingData("b2", "config B", getEmptyMetaData());
    configB.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let relationAtoB = new RelationToBackingData("r2", getEmptyMetaData());
    relationAtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    serviceA.addBackingDataEntity(configB, relationAtoB);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", "other");
    let relationBStoA = new RelationToBackingData("r4", getEmptyMetaData());
    relationBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    backingService.addBackingDataEntity(configA, relationBStoA);

    let configService = new BackingService("vs1", "backing service 1", getEmptyMetaData());
    configService.setPropertyValue("providedFunctionality", CONFIG_SERVICE_KIND[0]);
    let relationCStoA = new RelationToBackingData("r5", getEmptyMetaData());
    relationCStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    configService.addBackingDataEntity(configA, relationCStoA);
    let relationCStoB = new RelationToBackingData("r6", getEmptyMetaData());
    relationCStoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    configService.addBackingDataEntity(configB, relationCStoB);


    system.addEntities([configA, configB]);
    system.addEntities([serviceA, backingService, configService]);

    let measureValue = systemMeasureImplementations["configurationStoredInConfigService"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
})


test("ratioOfEndpointsCoveredByContract", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let propertiesA = getArtifactTypeProperties("Spring.CloudContract");
    serviceA.setArtifact("art1", new Artifact(
        "Spring.CloudContract",
        "", "", "", "", "", "", "", propertiesA
    ));

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setDocumentedBy = ["art1"];
    serviceA.addEndpoint(endpointA);

    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointB);

    let serviceB = new Service("s2", "service B", getEmptyMetaData())
    let propertiesB = getArtifactTypeProperties("Spring.CloudContract");
    serviceB.setArtifact("art1", new Artifact(
        "Spring.CloudContract",
        "", "", "", "", "", "", "", propertiesB
    ));

    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setDocumentedBy = ["art1"];
    serviceB.addEndpoint(endpointC);

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceB.addEndpoint(endpointD);


    system.addEntities([serviceA, serviceB]);

    let measureValue = systemMeasureImplementations["ratioOfEndpointsCoveredByContract"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
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
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let propertiesB = getArtifactTypeProperties("Image.Container.OCI");
    propertiesB.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    serviceB.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesB
    ));

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("deployment_unit", "Image.Container.OCI");
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    deploymentMappingB.setPropertyValue("deployment_unit", "Image.Container.OCI");
    let deploymentMappingC = new DeploymentMapping("dm3", serviceA, infrastructureB);


    system.addEntities([serviceA, serviceB]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = systemMeasureImplementations["standardizedDeployments"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
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
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let propertiesB = getArtifactTypeProperties("Image.Container.OCI");
    propertiesB.find(prop => prop.getKey === "self_contained").value = true;
    serviceB.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesB
    ));

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("deployment_unit", "Image.Container.OCI");
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    deploymentMappingB.setPropertyValue("deployment_unit", "Image.Container.OCI");
    let deploymentMappingC = new DeploymentMapping("dm3", serviceA, infrastructureB);


    system.addEntities([serviceA, serviceB]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = systemMeasureImplementations["selfContainedDeployments"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})

test("replacingDeployments", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("update_strategy", "in-place");
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    deploymentMappingB.setPropertyValue("update_strategy", "replace");
    let deploymentMappingC = new DeploymentMapping("dm3", serviceA, infrastructureB);
    deploymentMappingC.setPropertyValue("update_strategy", "replace");


    system.addEntities([serviceA, serviceB]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = systemMeasureImplementations["replacingDeployments"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})

test("ratioOfAutomaticallyMaintainedInfrastructure", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("maintenance", AUTOMATED_INFRASTRUCTURE_MAINTENANCE[0]);
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", infrastructureA, infrastructureB);

    system.addEntities([serviceA]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB]);

    let measureValue = systemMeasureImplementations["ratioOfAutomaticallyMaintainedInfrastructure"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
})

test("linksWithTimeout", () => {
    let system = new System("sys1", "testSystem");

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
    linkAB.setPropertyValue("timeout", "2000");
    let linkAC = new Link("l2", serviceA, endpointC);
    let linkAD = new Link("l3", serviceA, endpointD);

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkAC, linkAD]);

    let measureValue = systemMeasureImplementations["linksWithTimeout"]({ entity: system, system: system });
    expect(measureValue).toEqual(1/3);
})

test("deploymentsWithRestart", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("automated_restart_policy", "never");
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    deploymentMappingB.setPropertyValue("automated_restart_policy", "onProcessFailure");
    let deploymentMappingC = new DeploymentMapping("dm3", serviceA, infrastructureB);
    deploymentMappingC.setPropertyValue("automated_restart_policy", "onProcessFailure");

    system.addEntities([serviceA, serviceB]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = systemMeasureImplementations["deploymentsWithRestart"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})

test("ratioOfDocumentedEndpoints", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let propertiesA = getArtifactTypeProperties("OpenAPI");
    serviceA.setArtifact("art1", new Artifact(
        "OpenAPI",
        "", "", "", "", "", "", "", propertiesA
    ));

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setDocumentedBy = ["art1"];
    serviceA.addEndpoint(endpointA);

    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointB);

    let serviceB = new Service("s2", "service B", getEmptyMetaData())
    let propertiesB = getArtifactTypeProperties("OpenAPI");
    serviceB.setArtifact("art1", new Artifact(
        "OpenAPI",
        "", "", "", "", "", "", "", propertiesB
    ));

    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setDocumentedBy = ["art1"];
    serviceB.addEndpoint(endpointC);

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceB.addEndpoint(endpointD);

    system.addEntities([serviceA, serviceB]);

    let measureValue = systemMeasureImplementations["ratioOfDocumentedEndpoints"]({ entity: system, system: system });
    expect(measureValue).toEqual(0.5);
})

test("ratioOfEndpointsThatSupportTokenBasedAuthentication", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("supported_authentication_methods", ["Token", "basic_authentication"]);
    serviceA.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointB);
    endpointB.setPropertyValue("supported_authentication_methods", []);

    let backingServiceB = new Service("bs1", "backing service 1", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("supported_authentication_methods", ["Token", "basic_authentication"]);
    backingServiceB.addEndpoint(endpointC);

    system.addEntities([serviceA, backingServiceB]);

    let measureValue = systemMeasureImplementations["ratioOfEndpointsThatSupportTokenBasedAuthentication"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})

test("ratioOfEndpointsThatSupportApiKeys", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("supported_authentication_methods", ["Token", "API-Key"]);
    serviceA.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointB);
    endpointB.setPropertyValue("supported_authentication_methods", []);

    let backingServiceB = new Service("bs1", "backing service 1", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("supported_authentication_methods", ["API-Key", "basic_authentication"]);
    backingServiceB.addEndpoint(endpointC);

    system.addEntities([serviceA, backingServiceB]);

    let measureValue = systemMeasureImplementations["ratioOfEndpointsThatSupportApiKeys"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})

test("ratioOfEndpointsThatSupportPlaintextAuthentication", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("supported_authentication_methods", ["API-Key", "basic_authentication"]);
    serviceA.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointB);
    endpointB.setPropertyValue("supported_authentication_methods", []);

    let backingServiceB = new Service("bs1", "backing service 1", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("supported_authentication_methods", ["Token", "basic_authentication"]);
    backingServiceB.addEndpoint(endpointC);

    system.addEntities([serviceA, backingServiceB]);

    let measureValue = systemMeasureImplementations["ratioOfEndpointsThatSupportPlaintextAuthentication"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})

test("ratioOfEndpointsThatAreIncludedInASingleSignOnApproach", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("supported_authentication_methods", ["Single Sign-On", "basic_authentication"]);
    serviceA.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointB);
    endpointB.setPropertyValue("supported_authentication_methods", []);

    let backingServiceB = new Service("bs1", "backing service 1", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("supported_authentication_methods", ["Token", "Single Sign-On"]);
    backingServiceB.addEndpoint(endpointC);

    system.addEntities([serviceA, backingServiceB]);

    let measureValue = systemMeasureImplementations["ratioOfEndpointsThatAreIncludedInASingleSignOnApproach"]({ entity: system, system: system });
    expect(measureValue).toEqual(2/3);
})

test("endpointAccessConsistency", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("supported_authentication_methods", ["Token"]);
    serviceA.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("supported_authentication_methods", ["Token"]);
    serviceA.addEndpoint(endpointB);

    let backingServiceB = new Service("bs1", "backing service 1", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("supported_authentication_methods", ["Single Sign-On"]);
    backingServiceB.addEndpoint(endpointC);

    system.addEntities([serviceA, backingServiceB]);

    let measureValue = systemMeasureImplementations["endpointAccessConsistency"]({ entity: system, system: system });
    expect(measureValue).toEqual(1/3);
})

test("externalEndpointAccessConsistency", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let endpointA = new ExternalEndpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("supported_authentication_methods", ["Token"]);
    serviceA.addEndpoint(endpointA);
    let endpointB = new ExternalEndpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("supported_authentication_methods", ["Token"]);
    serviceA.addEndpoint(endpointB);

    let backingServiceB = new Service("bs1", "backing service 1", getEmptyMetaData());
    let endpointC = new ExternalEndpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("supported_authentication_methods", ["Single Sign-On"]);
    backingServiceB.addEndpoint(endpointC);

    system.addEntities([serviceA, backingServiceB]);

    let measureValue = systemMeasureImplementations["externalEndpointAccessConsistency"]({ entity: system, system: system });
    expect(measureValue).toEqual(1/3);
})