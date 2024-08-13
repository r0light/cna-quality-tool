import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { Endpoint, Link, Service, System } from "@/core/entities";
import { measureImplementations } from "@/core/qualitymodel/evaluation/measureImplementations";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { beforeAll, expect, test } from "vitest"

var systemToEvaluate: System = new System("testSystem");

beforeAll(() => {
    systemToEvaluate = new System("testSystem");

    let serviceA  = new Service("s1", "serviceA", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointB);

    let serviceB  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("protocol", "https");
    serviceB.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceB.addEndpoint(endpointD);

    let linkAC = new Link("l1", serviceA, endpointC);
    let linkAD = new Link("l2", serviceA, endpointD);

    systemToEvaluate.addEntities([serviceA, serviceB]);
    systemToEvaluate.addEntities([linkAC, linkAD]);
})


test("all implementation names refer to an existing measure", () => {
    let measureKeys = getQualityModel().measures.map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(measureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    expect(measureKeys).toEqual(
        expect.arrayContaining(measureImplementationKeys)
      )
})



test("ratioOfEndpointsSupportingSsl", () => {
    let measureValue = measureImplementations["ratioOfEndpointsSupportingSsl"](systemToEvaluate);

    expect(measureValue).toEqual(0.25);
})

test("ratioOfSecuredLinks", () => {
    let measureValue = measureImplementations["ratioOfSecuredLinks"](systemToEvaluate);

    expect(measureValue).toEqual(0.5);
})