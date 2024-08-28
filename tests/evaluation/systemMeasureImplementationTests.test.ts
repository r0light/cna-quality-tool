import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { BackingService, Component, DataAggregate, DeploymentMapping, Endpoint, ExternalEndpoint, Infrastructure, Link, RequestTrace, Service, StorageBackingService, System } from "@/core/entities";
import { RelationToBackingData } from "@/core/entities/relationToBackingData";
import { RelationToDataAggregate } from "@/core/entities/relationToDataAggregate";
import { systemMeasureImplementations } from "@/core/qualitymodel/evaluation/measureImplementations";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { ASYNCHRONOUS_ENDPOINT_KIND, SYNCHRONOUS_ENDPOINT_KIND } from "@/core/qualitymodel/specifications/featureModel";
import { beforeAll, expect, test } from "vitest"

var systemToEvaluateA: System = new System("testSystem");

beforeAll(() => {
    systemToEvaluateA = new System("testSystem");

    let serviceA  = new Service("s1", "serviceA", getEmptyMetaData());


    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("protocol", "https");
    serviceA.addEndpoint(externalEndpointA);
    let externalEndpointB = new ExternalEndpoint("ee2", "external endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpointB);

    let serviceB  = new Service("s2", "serviceB", getEmptyMetaData());
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
    let measureKeys = getQualityModel().systemMeasures.map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(systemMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    expect(measureKeys).toEqual(
        expect.arrayContaining(measureImplementationKeys)
      )
})

test("all implemented measure must provide information on the calculation", () => {
    let measures = getQualityModel().systemMeasures;
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
    let measureValue = systemMeasureImplementations["ratioOfEndpointsSupportingSsl"](systemToEvaluateA);

    expect(measureValue).toEqual(0.5);
})

test("ratioOfExternalEndpointsSupportingTls", () => {
    let measureValue = systemMeasureImplementations["ratioOfExternalEndpointsSupportingTls"](systemToEvaluateA);

    expect(measureValue).toEqual(0.5);
})

test("ratioOfSecuredLinks", () => {
    let measureValue = systemMeasureImplementations["ratioOfSecuredLinks"](systemToEvaluateA);

    expect(measureValue).toEqual(0.5);
})

test("dataAggregateScope", () => {
    let measureValue = systemMeasureImplementations["dataAggregateScope"](systemToEvaluateA);

    expect(measureValue).toEqual(2);
})

test("ratioOfStatefulComponents", () => {
    let measureValue = systemMeasureImplementations["ratioOfStatefulComponents"](systemToEvaluateA);

    expect(measureValue).toEqual(2/3);
})

test("ratioOfStatelessComponents", () => {
    let measureValue = systemMeasureImplementations["ratioOfStatelessComponents"](systemToEvaluateA);

    expect(measureValue).toEqual(1/3);
})


test("degreeToWhichComponentsAreLinkedToStatefulComponents", () => {
    let measureValue = systemMeasureImplementations["degreeToWhichComponentsAreLinkedToStatefulComponents"](systemToEvaluateA);

    expect(measureValue).toEqual(1/3);
})

test("degreeOfAsynchronousCommunication", () => {

    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(externalEndpointA);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointD);

    system.addEntities([serviceX, serviceY]);

    let measureValue = systemMeasureImplementations["degreeOfAsynchronousCommunication"](system);

    expect(measureValue).toEqual(2/3);
})

test("asynchronousCommunicationUtilization", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(externalEndpointA);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
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

    let measureValue = systemMeasureImplementations["asynchronousCommunicationUtilization"](system);

    expect(measureValue).toEqual(3/4);

})

test("ratioOfServicesThatProvideHealthEndpoints", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("health_check", true);
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("readiness_check", true);
    serviceX.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(externalEndpointA);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    system.addEntities([serviceX, serviceY]);

    let measureValue = systemMeasureImplementations["ratioOfServicesThatProvideHealthEndpoints"](system);

    expect(measureValue).toEqual(0.5);
})


test("couplingDegreeBasedOnPotentialCoupling", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceY.addEndpoint(endpointB);

    let serviceZ  = new Service("s3", "serviceC", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceZ.addEndpoint(endpointC);

    let linkXY = new Link("l1", serviceX, endpointB);
    let linkYZ = new Link("l2", serviceY, endpointC);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkXY, linkYZ]);

    let measureValue = systemMeasureImplementations["couplingDegreeBasedOnPotentialCoupling"](system);

    expect(measureValue).toEqual(1/3);


})

test("interactionDensityBasedOnComponents", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
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

    let measureValue = systemMeasureImplementations["interactionDensityBasedOnComponents"](system);

    expect(measureValue).toEqual(4/3);

})


test("interactionDensityBasedOnLinks", () => {

    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
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

    let measureValue = systemMeasureImplementations["interactionDensityBasedOnLinks"](system);

    expect(measureValue).toEqual(1/3);

})

test("systemCouplingBasedOnEndpointEntropy", () => {

    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
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

    let measureValue = systemMeasureImplementations["systemCouplingBasedOnEndpointEntropy"](system);

    expect(measureValue).toBeCloseTo(0.602059, 5);
})

test("servicesInterdependenceInTheSystem", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
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

    let measureValue = systemMeasureImplementations["servicesInterdependenceInTheSystem"](system);

    expect(measureValue).toEqual(1);

})

test("aggregateSystemMetricToMeasureServiceCoupling", () => {

    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
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

    let measureValue = systemMeasureImplementations["aggregateSystemMetricToMeasureServiceCoupling"](system);

    expect(measureValue).toEqual(0.5);
})

test("degreeOfCouplingInASystem", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
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

    let measureValue = systemMeasureImplementations["degreeOfCouplingInASystem"](system);

    expect(measureValue).toEqual(1/4);
})

test("simpleDegreeOfCouplingInASystem", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
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

    let measureValue = systemMeasureImplementations["simpleDegreeOfCouplingInASystem"](system);

    expect(measureValue).toEqual(3/4);

})

test("directServiceSharing", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
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

    let measureValue = systemMeasureImplementations["directServiceSharing"](system);
    expect(measureValue).toBeCloseTo(7/24, 6);
})

test("transitivelySharedServices", () => {
    let system = new System("testSystem");

    let serviceA  = new Service("s1", "serviceA", getEmptyMetaData());

    let serviceB  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC  = new Service("s3", "serviceC", getEmptyMetaData());
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

    let measureValue = systemMeasureImplementations["transitivelySharedServices"](system);
    expect(measureValue).toEqual(0.5);

})

test("ratioOfSharedNonExternalComponentsToNonExternalComponents", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
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

    let measureValue = systemMeasureImplementations["ratioOfSharedNonExternalComponentsToNonExternalComponents"](system);
    expect(measureValue).toEqual(1/4);

})

test("ratioOfSharedDependenciesOfNonExternalComponentsToPossibleDependencies", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
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

    let measureValue = systemMeasureImplementations["ratioOfSharedDependenciesOfNonExternalComponentsToPossibleDependencies"](system);
    expect(measureValue).toEqual(1/8);
})

test("averageSystemCoupling", () => {

    let system = new System("testSystem");

    let dataAggregateA = new DataAggregate("da1", "data aggregate 1", getEmptyMetaData());
    let dataAggregateB = new DataAggregate("da2", "data aggregate 2", getEmptyMetaData());

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());
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

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let linkYX1 = new Link("l1", serviceY, endpointA);
    let linkYX2 = new Link("l2", serviceY, endpointB);

    let serviceZ = new Service("s3", "service C", getEmptyMetaData());
    let linkZX = new Link("l3", serviceZ, endpointB);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkYX1, linkYX2, linkZX]);

    let measureValue = systemMeasureImplementations["averageSystemCoupling"](system);
    expect(measureValue).toEqual(2.45/3);

})

test("numberOfSynchronousCycles", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["numberOfSynchronousCycles"](system);
    expect(measureValue).toEqual(2);

})

test("densityOfAggregation", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["densityOfAggregation"](system);
    expect(measureValue).toBeCloseTo(-0.405465, 5);

})

test("dataAggregateConvergenceAcrossComponents", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["dataAggregateConvergenceAcrossComponents"](system);
    expect(measureValue).toBeCloseTo(2.666666666, 5);
})

test("ratioOfCyclicRequestTraces", () => {
    let system = new System("testSystem");

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
    requestTraceA.setLinks = [linkAB, linkBC];
    requestTraceA.setExternalEndpoint = externalEndpointA;

    let requestTraceB = new RequestTrace("rq2", "request trace 2", getEmptyMetaData());
    requestTraceB.setLinks = [linkED, linkDB, linkBC, linkCD];
    requestTraceB.setExternalEndpoint = externalEndpointE;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkCD, linkDB, linkED]);
    system.addEntities([requestTraceA, requestTraceB]);

    let measureValue = systemMeasureImplementations["ratioOfCyclicRequestTraces"](system);
    expect(measureValue).toEqual(0.5);
})


test("numberOfPotentialCyclesInASystem", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["numberOfPotentialCyclesInASystem"](system);
    expect(measureValue).toEqual(2);

})

test("maximumLengthOfServiceLinkChainPerRequestTrace", () => {
    let system = new System("testSystem");

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
    requestTraceA.setLinks = [linkAB, linkBC];
    requestTraceA.setExternalEndpoint = externalEndpointA;

    let requestTraceB = new RequestTrace("rq2", "request trace 2", getEmptyMetaData());
    requestTraceB.setLinks = [linkED, linkDB, linkBC];
    requestTraceB.setExternalEndpoint = externalEndpointE;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkED, linkDB]);
    system.addEntities([requestTraceA, requestTraceB]);

    let measureValue = systemMeasureImplementations["maximumLengthOfServiceLinkChainPerRequestTrace"](system);
    expect(measureValue).toEqual(3);
})

test("maximumNumberOfServicesWithinARequestTrace", () => {

    let system = new System("testSystem");

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
    requestTraceA.setLinks = [linkAB, linkBC];
    requestTraceA.setExternalEndpoint = externalEndpointA;

    let requestTraceB = new RequestTrace("rq2", "request trace 2", getEmptyMetaData());
    requestTraceB.setLinks = [linkED, linkDB, linkBC];
    requestTraceB.setExternalEndpoint = externalEndpointE;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkED, linkDB]);
    system.addEntities([requestTraceA, requestTraceB]);

    let measureValue = systemMeasureImplementations["maximumNumberOfServicesWithinARequestTrace"](system);
    expect(measureValue).toEqual(4);
})

test("databaseTypeUtilization", () => {

    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["databaseTypeUtilization"](system);
    expect(measureValue).toEqual(0);

})

test("databaseTypeUtilization databasePerService", () => {

    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["databaseTypeUtilization"](system);
    expect(measureValue).toEqual(1);

})

test("averageNumberOfEndpointsPerService", () => {

    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["averageNumberOfEndpointsPerService"](system);
    expect(measureValue).toEqual(7/4);

})

test("numberOfComponents", () => {
    let system = new System("testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let storageBackingService = new StorageBackingService("sb1", "storage service", getEmptyMetaData());

    let component = new Component("c1", "component 1", getEmptyMetaData());

    system.addEntities([serviceA, storageBackingService, component]);

    let measureValue = systemMeasureImplementations["numberOfComponents"](system);
    expect(measureValue).toEqual(3);

})

test("ratioOfProviderManagedComponentsAndInfrastructure", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["ratioOfProviderManagedComponentsAndInfrastructure"](system);
    expect(measureValue).toEqual(1/3);

})

test("componentDensity", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["componentDensity"](system);
    expect(measureValue).toEqual(1.5);
})


test("numberOfAvailabilityZonesUsed", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["numberOfAvailabilityZonesUsed"](system);
    expect(measureValue).toEqual(3);
})

test("rollingUpdateOption", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["rollingUpdateOption"](system);
    expect(measureValue).toEqual(1/2);
})

test("numberOfLinksWithRetryLogic", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["numberOfLinksWithRetryLogic"](system);
    expect(measureValue).toEqual(2/3);
})

test("numberOfLinksWithComplexFailover", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["numberOfLinksWithComplexFailover"](system);
    expect(measureValue).toEqual(2/3);
})

test("totalNumberOfComponents", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["totalNumberOfComponents"](system);
    expect(measureValue).toEqual(5);
})


test("numberOfServices", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["numberOfServices"](system);
    expect(measureValue).toEqual(2);

})

test("numberOfBackingServices", () => {

    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["numberOfBackingServices"](system);
    expect(measureValue).toEqual(1);
})

test("totalNumberOfLinksInASystem", () => {

    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["totalNumberOfLinksInASystem"](system);
    expect(measureValue).toEqual(4);
})

test("numberOfSynchronousEndpoints", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(externalEndpointA);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointD);

    system.addEntities([serviceX, serviceY]);

    let measureValue = systemMeasureImplementations["numberOfSynchronousEndpoints"](system);
    expect(measureValue).toEqual(3);
})

test("numberOfAsynchronousEndpoints", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(externalEndpointA);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointD);

    system.addEntities([serviceX, serviceY]);

    let measureValue = systemMeasureImplementations["numberOfAsynchronousEndpoints"](system);
    expect(measureValue).toEqual(2);
})

test("numberOfServicesWhichHaveIncomingLinks", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["numberOfServicesWhichHaveIncomingLinks"](system);
    expect(measureValue).toEqual(3);
})

test("numberOfServicesWhichHaveOutgoingLinks", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["numberOfServicesWhichHaveOutgoingLinks"](system);
    expect(measureValue).toEqual(4);
})

test("numberOfServicesWhichHaveBothIncomingAndOutgoingLinks", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["numberOfServicesWhichHaveBothIncomingAndOutgoingLinks"](system);
    expect(measureValue).toEqual(2);
})


test("numberOfServiceConnectedToStorageBackingService", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["numberOfServiceConnectedToStorageBackingService"](system);
    expect(measureValue).toEqual(3);

})

test("numberOfRequestTraces", () => {

    let system = new System("testSystem");

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
    requestTraceA.setLinks = [linkAB, linkBC];
    requestTraceA.setExternalEndpoint = externalEndpointA;

    let requestTraceB = new RequestTrace("rq2", "request trace 2", getEmptyMetaData());
    requestTraceB.setLinks = [linkED, linkDB, linkBC];
    requestTraceB.setExternalEndpoint = externalEndpointE;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkDB, linkED]);
    system.addEntities([requestTraceA, requestTraceB]);

    let measureValue = systemMeasureImplementations["numberOfRequestTraces"](system);
    expect(measureValue).toEqual(2);
})

test("averageComplexityOfRequestTraces", () => {
    let system = new System("testSystem");

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
    requestTraceA.setLinks = [linkAB, linkBC];
    requestTraceA.setExternalEndpoint = externalEndpointA;

    let requestTraceB = new RequestTrace("rq2", "request trace 2", getEmptyMetaData());
    requestTraceB.setLinks = [linkED, linkDB, linkBC];
    requestTraceB.setExternalEndpoint = externalEndpointE;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkDB, linkED]);
    system.addEntities([requestTraceA, requestTraceB]);

    let measureValue = systemMeasureImplementations["averageComplexityOfRequestTraces"](system);
    expect(measureValue).toEqual(2.5);
})


test("amountOfRedundancy", () => {
    let system = new System("testSystem");

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

    let measureValue = systemMeasureImplementations["amountOfRedundancy"](system);
    expect(measureValue).toEqual(4/3);
})