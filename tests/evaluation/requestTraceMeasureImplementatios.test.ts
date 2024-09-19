import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { Endpoint, ExternalEndpoint, Link, RequestTrace, Service, System } from "@/core/entities";
import { requestTraceMeasureImplementations } from "@/core/qualitymodel/evaluation/measureImplementations";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { expect, test } from "vitest";

test("all implementation names refer to an existing measure", () => {
    let measureKeys = getQualityModel().requestTraceMeasures.map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(requestTraceMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    expect(measureKeys).toEqual(
        expect.arrayContaining(measureImplementationKeys)
      )
})

test("all implemented measure must provide information on the calculation", () => {
    let measures = getQualityModel().requestTraceMeasures;
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

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;



    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["requestTraceLength"]({ requestTrace: requestTrace, system: system});
    expect(measureValue).toEqual(3);


})

test("numberOfCyclesInRequestTraces", () => {

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
    let linkDB = new Link("l4", serviceD, endpointB);
    let linkCD = new Link("l5", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkDB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkDB, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["numberOfCyclesInRequestTraces"]({ requestTrace: requestTrace, system: system});
    expect(measureValue).toEqual(1);

})