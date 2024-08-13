import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { Endpoint, Service, System } from "@/core/entities"
import { expect, test } from "vitest";

test("searchComponentOfEndpointShouldReturnCorrectEntity", () => {
    let systemToTest = new System("testSystem");

    let serviceA = new Service("s1", "service a", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint A", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);

    systemToTest.addEntity(serviceA);

    expect(systemToTest.searchComponentOfEndpoint(endpointA.getId).getId).toEqual(serviceA.getId);
})