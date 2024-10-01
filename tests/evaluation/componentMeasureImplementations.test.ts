import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { DataAggregate, Endpoint, ExternalEndpoint, Link, Service, StorageBackingService, System } from "@/core/entities";
import { RelationToDataAggregate } from "@/core/entities/relationToDataAggregate";
import { componentMeasureImplementations } from "@/core/qualitymodel/evaluation/measure-implementations/componentMeasures";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { ENTITIES } from "@/core/qualitymodel/specifications/entities";
import { ASYNCHRONOUS_ENDPOINT_KIND, SYNCHRONOUS_ENDPOINT_KIND } from "@/core/qualitymodel/specifications/featureModel";
import { expect, test } from "vitest";


test("all implementation names refer to an existing measure", () => {
    let measureKeys = getQualityModel().measures.get(ENTITIES.COMPONENT).map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(componentMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    expect(measureKeys).toEqual(
        expect.arrayContaining(measureImplementationKeys)
      )
})

test("all implemented measure must provide information on the calculation", () => {
    let measures = getQualityModel().measures.get(ENTITIES.COMPONENT);
    let measureKeys = measures.map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(componentMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    for (const measure of measures) {
        if (measureImplementationKeys.includes(measure.getId)) {
            expect(measure.getCalculationDescription.length, `Implemented measure ${measure.getId} does not provide a calculation description`).toBeGreaterThan(0)
        }
    }
})

test("serviceInterfaceDataCohesion", () => {
    let system = new System("sys1", "testSystem");

    let service = new Service("s1", "testService", getEmptyMetaData());
    let dataAggregateA = new DataAggregate("d1", "data 1", getEmptyMetaData());
    service.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r1", getEmptyMetaData()));
    let dataAggregateB = new DataAggregate("d2", "data 2", getEmptyMetaData());
    service.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r2", getEmptyMetaData()));


    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    service.addEndpoint(endpointA);
    endpointA.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r3", getEmptyMetaData()));

    let endpointB = new ExternalEndpoint("e2", "endpoint 2", getEmptyMetaData());
    service.addEndpoint(endpointB);
    endpointB.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r4", getEmptyMetaData()));

    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    service.addEndpoint(endpointC);
    endpointC.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r5", getEmptyMetaData()));

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    service.addEndpoint(endpointD);
    endpointD.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r6", getEmptyMetaData()));

    system.addEntities([dataAggregateA, dataAggregateB]);
    system.addEntity(service);

    let measureValue = componentMeasureImplementations["serviceInterfaceDataCohesion"]({entity: service, system: system});
    expect(measureValue).toEqual(2);

})


test("serviceInterfaceUsageCohesion", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);

    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointB);

    // should not influence the result
    let endpointC = new ExternalEndpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceA.addEndpoint(endpointC);

    let serviceB = new Service("s2", "service B", getEmptyMetaData());
    let linkBA1 = new Link("l1", serviceB, endpointA);
    let linkBA2 = new Link("l2", serviceB, endpointB);

    let serviceC = new Service("s3", "service C", getEmptyMetaData());
    let linkCA2 = new Link("l3", serviceC, endpointB);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkBA1, linkBA2, linkCA2]);

    let measureValue = componentMeasureImplementations["serviceInterfaceUsageCohesion"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(3/4);
})

test("totalServiceInterfaceCohesion", () => {

    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let dataAggregateA = new DataAggregate("d1", "data 1", getEmptyMetaData());
    serviceA.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r1", getEmptyMetaData()));
    let dataAggregateB = new DataAggregate("d2", "data 2", getEmptyMetaData());
    serviceA.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r2", getEmptyMetaData()));


    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    endpointA.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r3", getEmptyMetaData()));

    let endpointB = new ExternalEndpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointB);
    endpointB.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r4", getEmptyMetaData()));

    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceA.addEndpoint(endpointC);
    endpointC.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r5", getEmptyMetaData()));

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceA.addEndpoint(endpointD);
    endpointD.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r6", getEmptyMetaData()));

    let serviceB = new Service("s2", "service B", getEmptyMetaData());
    let linkBA1 = new Link("l1", serviceB, endpointA);
    let linkBA2 = new Link("l2", serviceB, endpointB);

    let serviceC = new Service("s3", "service C", getEmptyMetaData());
    let linkCA2 = new Link("l3", serviceC, endpointB);

    system.addEntities([dataAggregateA, dataAggregateB]);
    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkBA1, linkBA2, linkCA2]);

    let measureValue = componentMeasureImplementations["totalServiceInterfaceCohesion"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(7/6);
})

test("cohesionBetweenEndpointsBasedOnDataAggregateUsage", () => {
    let system = new System("sys1", "testSystem");

    let service = new Service("s1", "testService", getEmptyMetaData());
    let dataAggregateA = new DataAggregate("d1", "data 1", getEmptyMetaData());
    service.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r1", getEmptyMetaData()));
    let dataAggregateB = new DataAggregate("d2", "data 2", getEmptyMetaData());
    service.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r2", getEmptyMetaData()));


    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    service.addEndpoint(endpointA);
    endpointA.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r3", getEmptyMetaData()));

    let endpointB = new ExternalEndpoint("e2", "endpoint 2", getEmptyMetaData());
    service.addEndpoint(endpointB);
    endpointB.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r4", getEmptyMetaData()));

    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    service.addEndpoint(endpointC);
    endpointC.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r5", getEmptyMetaData()));

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    service.addEndpoint(endpointD);
    endpointD.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r6", getEmptyMetaData()));

    system.addEntities([dataAggregateA, dataAggregateB]);
    system.addEntity(service);

    let measureValue = componentMeasureImplementations["cohesionBetweenEndpointsBasedOnDataAggregateUsage"]({entity: service, system: system});
    expect(measureValue).toEqual(1/3);

})

test("numberOfProvidedSynchronousAndAsynchronousEndpoints", () => {
    let system = new System("sys1", "testSystem");

    let service = new Service("s1", "testService", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    service.addEndpoint(endpointA);

    let endpointB = new ExternalEndpoint("e2", "endpoint 2", getEmptyMetaData());
    service.addEndpoint(endpointB);

    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    service.addEndpoint(endpointC);

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    service.addEndpoint(endpointD);

    system.addEntity(service);

    let measureValue = componentMeasureImplementations["numberOfProvidedSynchronousAndAsynchronousEndpoints"]({entity: service, system: system});
    expect(measureValue).toEqual(4);
})

test("numberOfSynchronousEndpointsOfferedByAService", () => {
    let system = new System("sys1", "testSystem");

    let service = new Service("s1", "testService", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    service.addEndpoint(endpointA);

    let endpointB = new ExternalEndpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    service.addEndpoint(endpointB);

    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    service.addEndpoint(endpointC);

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    service.addEndpoint(endpointD);

    system.addEntity(service);

    let measureValue = componentMeasureImplementations["numberOfSynchronousEndpointsOfferedByAService"]({entity: service, system: system});
    expect(measureValue).toEqual(2);

})

test("numberOfAsynchronousEndpointsOfferedByAService", () => {
    let system = new System("sys1", "testSystem");

    let service = new Service("s1", "testService", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    service.addEndpoint(endpointA);

    let endpointB = new ExternalEndpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    service.addEndpoint(endpointB);

    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    service.addEndpoint(endpointC);

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    service.addEndpoint(endpointD);

    system.addEntity(service);

    let measureValue = componentMeasureImplementations["numberOfAsynchronousEndpointsOfferedByAService"]({entity: service, system: system});
    expect(measureValue).toEqual(2);

})

test("numberOfSynchronousOutgoingLinks", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceB.addEndpoint(endpointA);

    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceB.addEndpoint(endpointB);


    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceC.addEndpoint(endpointC);

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceC.addEndpoint(endpointD);

    let linkAB1 = new Link("l1", serviceA, endpointA);
    let linkAB2 = new Link("l2", serviceA, endpointB);
    let linkAC1 = new Link("l3", serviceA, endpointC);
    let linkAC2 = new Link("l4", serviceA, endpointD);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB1, linkAB2, linkAC1, linkAC2]);

    let measureValue = componentMeasureImplementations["numberOfSynchronousOutgoingLinks"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(2);

})

test("numberOfAsynchronousOutgoingLinks", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceB.addEndpoint(endpointA);

    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceB.addEndpoint(endpointB);


    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceC.addEndpoint(endpointC);

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceC.addEndpoint(endpointD);

    let linkAB1 = new Link("l1", serviceA, endpointA);
    let linkAB2 = new Link("l2", serviceA, endpointB);
    let linkAC1 = new Link("l3", serviceA, endpointC);
    let linkAC2 = new Link("l4", serviceA, endpointD);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB1, linkAB2, linkAC1, linkAC2]);

    let measureValue = componentMeasureImplementations["numberOfAsynchronousOutgoingLinks"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(3);
})

test("ratioOfAsynchronousOutgoingLinks", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceB.addEndpoint(endpointA);

    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceB.addEndpoint(endpointB);


    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceC.addEndpoint(endpointC);

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceC.addEndpoint(endpointD);

    let linkAB1 = new Link("l1", serviceA, endpointA);
    let linkAB2 = new Link("l2", serviceA, endpointB);
    let linkAC1 = new Link("l3", serviceA, endpointC);
    let linkAC2 = new Link("l4", serviceA, endpointD);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB1, linkAB2, linkAC1, linkAC2]);

    let measureValue = componentMeasureImplementations["ratioOfAsynchronousOutgoingLinks"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(3/4);
})

test("numberOfLinksPerComponent", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);


    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceC.addEndpoint(endpointD);

    let linkAB1 = new Link("l1", serviceA, endpointA);
    let linkAB2 = new Link("l2", serviceA, endpointB);
    let linkBC1 = new Link("l3", serviceB, endpointC);
    let linkBC2 = new Link("l4", serviceB, endpointD);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB1, linkAB2, linkBC1, linkBC2]);

    let measureValue = componentMeasureImplementations["numberOfLinksPerComponent"]({entity: serviceB, system: system});
    expect(measureValue).toEqual(4);

})


test("numberOfConsumedEndpoints", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceC.addEndpoint(endpointD);

    let linkAB1 = new Link("l1", serviceA, endpointA);
    let linkAB2 = new Link("l2", serviceA, endpointB);
    let linkBC1 = new Link("l3", serviceB, endpointC);
    let linkBC2 = new Link("l4", serviceB, endpointD);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB1, linkAB2, linkBC1, linkBC2]);

    let measureValue = componentMeasureImplementations["numberOfConsumedEndpoints"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(2);

})

test("incomingOutgoingRatioOfAComponent", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceC.addEndpoint(endpointD);

    let linkAB1 = new Link("l1", serviceA, endpointA);
    let linkAB2 = new Link("l2", serviceA, endpointB);
    let linkBC1 = new Link("l3", serviceB, endpointC);
    let linkBC2 = new Link("l4", serviceB, endpointD);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB1, linkAB2, linkBC1, linkBC2]);

    let measureValue = componentMeasureImplementations["incomingOutgoingRatioOfAComponent"]({entity: serviceB, system: system});
    expect(measureValue).toEqual(1);
})

test("ratioOfOutgoingLinksOfAService", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceC.addEndpoint(endpointD);

    let linkAB1 = new Link("l1", serviceA, endpointA);
    let linkAB2 = new Link("l2", serviceA, endpointB);
    let linkBC1 = new Link("l3", serviceB, endpointC);
    let linkBC2 = new Link("l4", serviceB, endpointD);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkAB1, linkAB2, linkBC1, linkBC2]);

    let measureValue = componentMeasureImplementations["ratioOfOutgoingLinksOfAService"]({entity: serviceB, system: system});
    expect(measureValue).toEqual(50);

})

test("indirectInteractionDensity", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    serviceD.addEndpoint(endpointE);

    let linkAB1 = new Link("l1", serviceA, endpointA);
    let linkBC1 = new Link("l3", serviceB, endpointC);

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB1, linkBC1]);

    let measureValue = componentMeasureImplementations["indirectInteractionDensity"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(0.5);

})

test("serviceCouplingBasedOnEndpointEntropy", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointB);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let linkBA1 = new Link("l1", serviceB, endpointA);
    let linkCA1 = new Link("l2", serviceC, endpointA);
    let linkBA2 = new Link("l3", serviceC, endpointB);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkBA1, linkBA2, linkCA1]);

    let measureValue = componentMeasureImplementations["serviceCouplingBasedOnEndpointEntropy"]({entity: serviceA, system: system});
    expect(measureValue).toBeCloseTo(0.389075, 5)
})

test("ratioOfStorageBackendSharing", () => {

    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let storageServiceD = new StorageBackingService("s4", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    storageServiceD.addEndpoint(endpointE);

    let linkAD = new Link("l1", serviceA, endpointE);
    let linkBD = new Link("l3", serviceB, endpointE);

    system.addEntities([serviceA, serviceB, serviceC, storageServiceD]);
    system.addEntities([linkAD, linkBD]);

    let measureValue = componentMeasureImplementations["ratioOfStorageBackendSharing"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(1/3);
})

test("combinedMetricForIndirectDependency", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let storageServiceD = new StorageBackingService("s4", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    storageServiceD.addEndpoint(endpointE);

    let serviceE = new Service("s5", "testService", getEmptyMetaData());
    let endpointF = new Endpoint("e6", "endpoint 6", getEmptyMetaData());
    serviceE.addEndpoint(endpointF);

    let linkAD = new Link("l1", serviceA, endpointE);
    let linkBD = new Link("l3", serviceB, endpointE);
    let linkAB = new Link("l1", serviceA, endpointA);
    let linkBC = new Link("l3", serviceB, endpointC);

    system.addEntities([serviceA, serviceB, serviceC, storageServiceD, serviceE]);
    system.addEntities([linkAD, linkBD, linkAB, linkBC]);

    let measureValue = componentMeasureImplementations["combinedMetricForIndirectDependency"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(1/6);
})

test("numberOfComponentsThatAreLinkedToAComponent", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointF = new Endpoint("e6", "endpoint 6", getEmptyMetaData());
    serviceD.addEndpoint(endpointF);

    let linkAB = new Link("l1", serviceA, endpointA);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l3", serviceD, endpointA);
    let linkDC = new Link("l4", serviceD, endpointC);

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkDB, linkDC]);

    let measureValue = componentMeasureImplementations["numberOfComponentsThatAreLinkedToAComponent"]({entity: serviceB, system: system});
    expect(measureValue).toEqual(2);


})

test("numberOfComponentsAComponentIsLinkedTo", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointF = new Endpoint("e6", "endpoint 6", getEmptyMetaData());
    serviceD.addEndpoint(endpointF);

    let linkAB = new Link("l1", serviceA, endpointA);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l3", serviceD, endpointA);
    let linkDC = new Link("l4", serviceD, endpointC);

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkDB, linkDC]);

    let measureValue = componentMeasureImplementations["numberOfComponentsAComponentIsLinkedTo"]({entity: serviceD, system: system});
    expect(measureValue).toEqual(2);

})

test("averageNumberOfDirectlyConnectedServices", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointF = new Endpoint("e6", "endpoint 6", getEmptyMetaData());
    serviceD.addEndpoint(endpointF);

    let linkAB = new Link("l1", serviceA, endpointA);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l3", serviceD, endpointA);
    let linkDC = new Link("l4", serviceD, endpointC);

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkDB, linkDC]);

    let measureValue = componentMeasureImplementations["averageNumberOfDirectlyConnectedServices"]({entity: serviceB, system: system});
    expect(measureValue).toEqual(3/4);

})

test("numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointF = new Endpoint("e6", "endpoint 6", getEmptyMetaData());
    serviceD.addEndpoint(endpointF);

    let linkAB = new Link("l1", serviceA, endpointA);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l3", serviceD, endpointA);
    let linkDC = new Link("l4", serviceD, endpointC);

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkDB, linkDC]);

    let measureValue = componentMeasureImplementations["numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents"]({entity: serviceD, system: system});
    expect(measureValue).toEqual(0.5);
})

test("cyclicCommunication cycle found", () => {
    let system = new System("sys1", "testSystem");

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

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkCD, linkDA]);

    let measureValue = componentMeasureImplementations["cyclicCommunication"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(1);
} )

test("cyclicCommunication no cycle found", () => {
    let system = new System("sys1", "testSystem");

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

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkBC, linkCD]);

    let measureValue = componentMeasureImplementations["cyclicCommunication"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(0);
} )

test("relativeImportanceOfTheService", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let serviceD = new Service("s4", "testService", getEmptyMetaData());

    let linkBA = new Link("l1", serviceB, endpointA);
    let linkCA = new Link("l2", serviceC, endpointA);

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkBA, linkCA])

    let measureValue = componentMeasureImplementations["relativeImportanceOfTheService"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(0.5)
})

test("serviceCriticality", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let serviceE =  new Service("s5", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);

    let linkBA = new Link("l1", serviceB, endpointA);
    let linkCA = new Link("l2", serviceC, endpointA);
    let linkAD = new Link("l3", serviceA, endpointD);
    let linkAE = new Link("l4", serviceA, endpointE);

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkBA, linkCA, linkAD, linkAE])

    let measureValue = componentMeasureImplementations["serviceCriticality"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(4)
})

test("degreeOfStorageBackendSharing", () => {
    let system = new System("sys1", "testSystem");

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

    let measureValue = componentMeasureImplementations["degreeOfStorageBackendSharing"]({entity: storageBackingService, system: system});
    expect(measureValue).toEqual(3);

})

test("resourceCount", () => {
    let system = new System("sys1", "testSystem");

    let service = new Service("s1", "testService", getEmptyMetaData());
    let dataAggregateA = new DataAggregate("d1", "data 1", getEmptyMetaData());
    service.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r1", getEmptyMetaData()));
    let dataAggregateB = new DataAggregate("d2", "data 2", getEmptyMetaData());
    service.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r2", getEmptyMetaData()));

    system.addEntities([dataAggregateA, dataAggregateB]);
    system.addEntity(service);

    let measureValue = componentMeasureImplementations["resourceCount"]({entity: service, system: system});
    expect(measureValue).toEqual(2);
})

test("serviceSize", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let dataAggregateA = new DataAggregate("d1", "data 1", getEmptyMetaData());
    serviceA.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r1", getEmptyMetaData()));
    let dataAggregateB = new DataAggregate("d2", "data 2", getEmptyMetaData());
    serviceA.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r2", getEmptyMetaData()));
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);

    let serviceB = new Service("s2", "service B", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint B", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "service C", getEmptyMetaData());

    let linkBA = new Link("l1", serviceB, endpointA);
    let linkCA = new Link("l2", serviceC, endpointA);
    let linkCB = new Link("l3", serviceC, endpointB);

    system.addEntities([dataAggregateA, dataAggregateB]);
    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkBA, linkCA, linkCB]);

    let measureValue = componentMeasureImplementations["serviceSize"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(4);
})

test("unusedEndpointCount", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA1 = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA1);
    let endpointA2 = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointA2);
    let endpointA3 = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceA.addEndpoint(endpointA3);

    let serviceB = new Service("s2", "service B", getEmptyMetaData());
    let endpointB = new Endpoint("e4", "endpoint B", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "service C", getEmptyMetaData());

    let linkBA = new Link("l1", serviceB, endpointA1);
    let linkCA = new Link("l2", serviceC, endpointA1);
    let linkCB = new Link("l3", serviceC, endpointB);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkBA, linkCA, linkCB]);

    let measureValue = componentMeasureImplementations["unusedEndpointCount"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(2);
})

test("numberOfReadEndpointsProvidedByAService", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA1 = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA1.setPropertyValue("kind", "query");
    serviceA.addEndpoint(endpointA1);
    let endpointA2 = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointA2.setPropertyValue("kind", "command");
    serviceA.addEndpoint(endpointA2);
    let endpointA3 = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointA1.setPropertyValue("kind", "query");
    serviceA.addEndpoint(endpointA3);

    let serviceB = new Service("s2", "service B", getEmptyMetaData());
    let endpointB = new Endpoint("e4", "endpoint B", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "service C", getEmptyMetaData());

    let linkBA = new Link("l1", serviceB, endpointA1);
    let linkCA = new Link("l2", serviceC, endpointA1);
    let linkCB = new Link("l3", serviceC, endpointB);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkBA, linkCA, linkCB]);

    let measureValue = componentMeasureImplementations["numberOfReadEndpointsProvidedByAService"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(2);
})

test("numberOfWriteEndpointsProvidedByAService", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA1 = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA1.setPropertyValue("kind", "query");
    serviceA.addEndpoint(endpointA1);
    let endpointA2 = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointA2.setPropertyValue("kind", "command");
    serviceA.addEndpoint(endpointA2);
    let endpointA3 = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointA1.setPropertyValue("kind", "event");
    serviceA.addEndpoint(endpointA3);

    let serviceB = new Service("s2", "service B", getEmptyMetaData());
    let endpointB = new Endpoint("e4", "endpoint B", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "service C", getEmptyMetaData());

    let linkBA = new Link("l1", serviceB, endpointA1);
    let linkCA = new Link("l2", serviceC, endpointA1);
    let linkCB = new Link("l3", serviceC, endpointB);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkBA, linkCA, linkCB]);

    let measureValue = componentMeasureImplementations["numberOfWriteEndpointsProvidedByAService"]({entity: serviceA, system: system});
    expect(measureValue).toEqual(2);

})

test("ratioOfStateDependencyOfEndpoints", () => {
   let system = new System("sys1", "testSystem");

    let service = new Service("s1", "testService", getEmptyMetaData());
    let dataAggregateA = new DataAggregate("d1", "data 1", getEmptyMetaData());
    service.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r1", getEmptyMetaData()));
    let dataAggregateB = new DataAggregate("d2", "data 2", getEmptyMetaData());
    service.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r2", getEmptyMetaData()));


    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    service.addEndpoint(endpointA);
    endpointA.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r3", getEmptyMetaData()));

    let endpointB = new ExternalEndpoint("e2", "endpoint 2", getEmptyMetaData());
    service.addEndpoint(endpointB);
    endpointB.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r4", getEmptyMetaData()));

    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    service.addEndpoint(endpointC);

    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    service.addEndpoint(endpointD);

    system.addEntities([dataAggregateA, dataAggregateB]);
    system.addEntity(service);

    let measureValue = componentMeasureImplementations["ratioOfStateDependencyOfEndpoints"]({entity: service, system: system});
    expect(measureValue).toEqual(0.5);

})