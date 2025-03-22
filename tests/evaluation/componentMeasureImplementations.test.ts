import { Artifact, getArtifactTypeProperties } from "@/core/common/artifact";
import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { EntityProperty } from "@/core/common/entityProperty";
import { BackingData, BackingService, DataAggregate, DeploymentMapping, Endpoint, ExternalEndpoint, Infrastructure, Link, ProxyBackingService, Service, StorageBackingService, System } from "@/core/entities";
import { RelationToBackingData } from "@/core/entities/relationToBackingData";
import { RelationToDataAggregate } from "@/core/entities/relationToDataAggregate";
import { componentMeasureImplementations } from "@/core/qualitymodel/evaluation/measure-implementations/componentMeasures";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { ENTITIES } from "@/core/qualitymodel/specifications/entities";
import { ASYNCHRONOUS_ENDPOINT_KIND, AUTOMATED_SCALING, BACKING_DATA_CONFIG_KIND, BACKING_DATA_SECRET_KIND, CONFIG_SERVICE_KIND, DATA_USAGE_RELATION_PERSISTENCE, DATA_USAGE_RELATION_USAGE, DYNAMIC_INFRASTRUCTURE, SERVICE_MESH_KIND, SYNCHRONOUS_ENDPOINT_KIND, VAULT_KIND } from "@/core/qualitymodel/specifications/featureModel";
import { linkTools } from "@joint/core";
import { expect, test } from "vitest";


test("all implementation names refer to an existing measure", () => {
    let measureKeys = getQualityModel().measures.get(ENTITIES.COMPONENT).map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size)

    let measureImplementationKeys = Object.keys(componentMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    measureImplementationKeys.forEach(key => {
        expect(measureKeys).include(key);
    })
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

    let measureValue = componentMeasureImplementations["serviceInterfaceDataCohesion"]({ entity: service, system: system });
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

    let measureValue = componentMeasureImplementations["serviceInterfaceUsageCohesion"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(3 / 4);
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

    let measureValue = componentMeasureImplementations["totalServiceInterfaceCohesion"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(7 / 6);
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

    let measureValue = componentMeasureImplementations["cohesionBetweenEndpointsBasedOnDataAggregateUsage"]({ entity: service, system: system });
    expect(measureValue).toEqual(1 / 3);

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

    let measureValue = componentMeasureImplementations["numberOfProvidedSynchronousAndAsynchronousEndpoints"]({ entity: service, system: system });
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

    let measureValue = componentMeasureImplementations["numberOfSynchronousEndpointsOfferedByAService"]({ entity: service, system: system });
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

    let measureValue = componentMeasureImplementations["numberOfAsynchronousEndpointsOfferedByAService"]({ entity: service, system: system });
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

    let measureValue = componentMeasureImplementations["numberOfSynchronousOutgoingLinks"]({ entity: serviceA, system: system });
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

    let measureValue = componentMeasureImplementations["numberOfAsynchronousOutgoingLinks"]({ entity: serviceA, system: system });
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

    let measureValue = componentMeasureImplementations["ratioOfAsynchronousOutgoingLinks"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(3 / 4);
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

    let measureValue = componentMeasureImplementations["numberOfLinksPerComponent"]({ entity: serviceB, system: system });
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

    let measureValue = componentMeasureImplementations["numberOfConsumedEndpoints"]({ entity: serviceA, system: system });
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

    let measureValue = componentMeasureImplementations["incomingOutgoingRatioOfAComponent"]({ entity: serviceB, system: system });
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

    let measureValue = componentMeasureImplementations["ratioOfOutgoingLinksOfAService"]({ entity: serviceB, system: system });
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

    let measureValue = componentMeasureImplementations["indirectInteractionDensity"]({ entity: serviceA, system: system });
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

    let measureValue = componentMeasureImplementations["serviceCouplingBasedOnEndpointEntropy"]({ entity: serviceA, system: system });
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

    let measureValue = componentMeasureImplementations["ratioOfStorageBackendSharing"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(1 / 3);
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

    let measureValue = componentMeasureImplementations["combinedMetricForIndirectDependency"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(1 / 6);
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

    let measureValue = componentMeasureImplementations["numberOfComponentsThatAreLinkedToAComponent"]({ entity: serviceB, system: system });
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

    let measureValue = componentMeasureImplementations["numberOfComponentsAComponentIsLinkedTo"]({ entity: serviceD, system: system });
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

    let measureValue = componentMeasureImplementations["averageNumberOfDirectlyConnectedServices"]({ entity: serviceB, system: system });
    expect(measureValue).toEqual(3 / 4);

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

    let measureValue = componentMeasureImplementations["numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents"]({ entity: serviceD, system: system });
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

    let measureValue = componentMeasureImplementations["cyclicCommunication"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(1);
})

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

    let measureValue = componentMeasureImplementations["cyclicCommunication"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(0);
})

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

    let measureValue = componentMeasureImplementations["relativeImportanceOfTheService"]({ entity: serviceA, system: system });
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

    let serviceE = new Service("s5", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);

    let linkBA = new Link("l1", serviceB, endpointA);
    let linkCA = new Link("l2", serviceC, endpointA);
    let linkAD = new Link("l3", serviceA, endpointD);
    let linkAE = new Link("l4", serviceA, endpointE);

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkBA, linkCA, linkAD, linkAE])

    let measureValue = componentMeasureImplementations["serviceCriticality"]({ entity: serviceA, system: system });
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

    let measureValue = componentMeasureImplementations["degreeOfStorageBackendSharing"]({ entity: storageBackingService, system: system });
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

    let measureValue = componentMeasureImplementations["resourceCount"]({ entity: service, system: system });
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

    let measureValue = componentMeasureImplementations["serviceSize"]({ entity: serviceA, system: system });
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

    let measureValue = componentMeasureImplementations["unusedEndpointCount"]({ entity: serviceA, system: system });
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

    let measureValue = componentMeasureImplementations["numberOfReadEndpointsProvidedByAService"]({ entity: serviceA, system: system });
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

    let measureValue = componentMeasureImplementations["numberOfWriteEndpointsProvidedByAService"]({ entity: serviceA, system: system });
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

    let measureValue = componentMeasureImplementations["ratioOfStateDependencyOfEndpoints"]({ entity: service, system: system });
    expect(measureValue).toEqual(0.5);

})

test("ratioOfEndpointsSupportingSsl", () => {

    let system = new System("sys1", "testSystem");

    let service = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint A", getEmptyMetaData());
    endpointA.setPropertyValue("protocol", "https");
    let endpointB = new Endpoint("e2", "endpoint B", getEmptyMetaData());
    endpointB.setPropertyValue("protocol", "https");
    let endpointC = new Endpoint("e3", "endpoint C", getEmptyMetaData());

    service.addEndpoint(endpointA);
    service.addEndpoint(endpointB);
    service.addEndpoint(endpointC);

    system.addEntity(service);

    let measureValue = componentMeasureImplementations["ratioOfEndpointsSupportingSsl"]({ entity: service, system: system });
    expect(measureValue).toEqual(2);

})

test("ratioOfExternalEndpointsSupportingTls", () => {
    let system = new System("sys1", "testSystem");

    let service = new Service("s1", "testService", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("e1", "endpoint A", getEmptyMetaData());
    externalEndpointA.setPropertyValue("protocol", "https");
    let externalEndpointB = new ExternalEndpoint("e2", "endpoint B", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint C", getEmptyMetaData());

    service.addEndpoint(externalEndpointA);
    service.addEndpoint(externalEndpointB);
    service.addEndpoint(endpointC);

    system.addEntity(service);

    let measureValue = componentMeasureImplementations["ratioOfExternalEndpointsSupportingTls"]({ entity: service, system: system });
    expect(measureValue).toEqual(0.5);


})


test("numberOfLinksWithRetryLogic", () => {
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
    linkAB.setPropertyValue("retries", 3);
    let linkAC = new Link("l2", serviceA, endpointC);
    linkAC.setPropertyValue("retries", 2);
    let linkAD = new Link("l3", serviceA, endpointD);
    linkAD.setPropertyValue("retries", 2);

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkAC, linkAD]);

    let measureValue = componentMeasureImplementations["numberOfLinksWithRetryLogic"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(2);
})

test("numberOfLinksWithComplexFailover", () => {
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
    linkAB.setPropertyValue("circuit_breaker", "with default value");
    let linkAC = new Link("l2", serviceA, endpointC);
    let linkAD = new Link("l3", serviceA, endpointD);
    linkAD.setPropertyValue("circuit_breaker", "none");

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkAC, linkAD]);

    let measureValue = componentMeasureImplementations["numberOfLinksWithComplexFailover"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(1);
})


test("serviceReplicationLevel", () => {
    let system = new System("sys1", "testSystem");
    let infrastructureA = new Infrastructure("i1", "Infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());
    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("replicas", 2);

    let deploymentMappingB = new DeploymentMapping("dm2", serviceA, infrastructureB);
    deploymentMappingB.setPropertyValue("replicas", 5);

    system.addEntities([serviceA]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB]);

    let measureValue = componentMeasureImplementations["serviceReplicationLevel"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(7);
})

test("amountOfRedundancy", () => {
    let system = new System("sys1", "testSystem");
    let infrastructureA = new Infrastructure("i1", "Infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());
    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("replicas", 2);

    let deploymentMappingB = new DeploymentMapping("dm2", serviceA, infrastructureB);
    deploymentMappingB.setPropertyValue("replicas", 5);

    system.addEntities([serviceA]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB]);

    let measureValue = componentMeasureImplementations["amountOfRedundancy"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(2);
})

test("storageReplicationLevel", () => {
    let system = new System("sys1", "testSystem");
    let infrastructureA = new Infrastructure("i1", "Infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());
    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("replicas", 2);

    let deploymentMappingB = new DeploymentMapping("dm2", serviceA, infrastructureB);
    deploymentMappingB.setPropertyValue("replicas", 5);

    system.addEntities([serviceA]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB]);

    let measureValue = componentMeasureImplementations["storageReplicationLevel"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual("n/a");
})

test("storageReplicationLevel", () => {

    let system = new System("sys1", "testSystem");
    let infrastructureA = new Infrastructure("i1", "Infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());
    let sbs = new StorageBackingService("s1", "testService", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", sbs, infrastructureA);
    deploymentMappingA.setPropertyValue("replicas", 2);

    let deploymentMappingB = new DeploymentMapping("dm2", sbs, infrastructureB);
    deploymentMappingB.setPropertyValue("replicas", 5);

    system.addEntities([sbs]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB]);

    let measureValue = componentMeasureImplementations["storageReplicationLevel"]({ entity: sbs, system: system });
    expect(measureValue).toEqual(7);
})


test("serviceMeshUsage", () => {

    let system = new System("sys1", "testSystem");
    let proxyA = new ProxyBackingService("p1", "proxy 1", getEmptyMetaData());
    proxyA.setPropertyValue("kind", SERVICE_MESH_KIND);
    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    serviceA.setIngressProxiedBy = proxyA;

    system.addEntities([proxyA]);
    system.addEntities([serviceA]);

    let measureValue = componentMeasureImplementations["serviceMeshUsage"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(0.5);

})

test("secretsExternalization", () => {
    let system = new System("sys1", "testSystem");

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

    let secretC = new BackingData("b3", "secret C", getEmptyMetaData());
    secretC.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let relationAtoC = new RelationToBackingData("r3", getEmptyMetaData());
    relationAtoC.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    serviceA.addBackingDataEntity(secretC, relationAtoC);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", "vault");
    let relationBStoA = new RelationToBackingData("r4", getEmptyMetaData());
    relationBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    backingService.addBackingDataEntity(secretA, relationBStoA);

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let relationIAtoB = new RelationToBackingData("r5", getEmptyMetaData());
    relationIAtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    infrastructureA.addBackingDataEntity(secretB, relationIAtoB);

    system.addEntities([secretA, secretB, secretC]);
    system.addEntities([serviceA, backingService]);
    system.addEntities([infrastructureA]);

    let measureValue = componentMeasureImplementations["secretsExternalization"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(2 / 3);
})

test("configurationExternalization", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let configA = new BackingData("b1", "config A", getEmptyMetaData());
    configA.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let relationAtoA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    serviceA.addBackingDataEntity(configA, relationAtoA);

    let configB = new BackingData("b2", "secret B", getEmptyMetaData());
    configB.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let relationAtoB = new RelationToBackingData("r2", getEmptyMetaData());
    relationAtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    serviceA.addBackingDataEntity(configB, relationAtoB);

    let configC = new BackingData("b3", "secret C", getEmptyMetaData());
    configC.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let relationAtoC = new RelationToBackingData("r3", getEmptyMetaData());
    relationAtoC.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    serviceA.addBackingDataEntity(configC, relationAtoC);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", "config");
    let relationBStoA = new RelationToBackingData("r4", getEmptyMetaData());
    relationBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    backingService.addBackingDataEntity(configA, relationBStoA);

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let relationIAtoB = new RelationToBackingData("r5", getEmptyMetaData());
    relationIAtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    infrastructureA.addBackingDataEntity(configB, relationIAtoB);

    system.addEntities([configA, configB, configC]);
    system.addEntities([serviceA, backingService]);
    system.addEntities([infrastructureA]);

    let measureValue = componentMeasureImplementations["configurationExternalization"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(2 / 3);


})

test("suitablyReplicatedStatefulService - for service", () => {
    let system = new System("sys1", "testSystem");
    let infrastructureA = new Infrastructure("i1", "Infrastructure 1", getEmptyMetaData());
    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    serviceA.setPropertyValue("stateless", false);

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("replicas", 2);

    system.addEntities([serviceA]);
    system.addEntities([infrastructureA]);
    system.addEntities([deploymentMappingA]);

    let measureValue = componentMeasureImplementations["suitablyReplicatedStatefulService"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual("n/a");
})

test("suitablyReplicatedStatefulService - for storageBackingService", () => {
    let system = new System("sys1", "testSystem");
    let infrastructureA = new Infrastructure("i1", "Infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());
    let storageBackingService = new StorageBackingService("sbs1", "Storage Backing Service", getEmptyMetaData());
    storageBackingService.setPropertyValue("stateless", false);
    storageBackingService.setPropertyValue("replication_strategy", "read-only-replication");

    let deploymentMappingA = new DeploymentMapping("dm1", storageBackingService, infrastructureA);
    deploymentMappingA.setPropertyValue("replicas", 2);


    system.addEntities([storageBackingService]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA]);

    let measureValue = componentMeasureImplementations["suitablyReplicatedStatefulService"]({ entity: storageBackingService, system: system });
    expect(measureValue).toEqual(1);
})

test("ratioOfNonCustomBackingServices - non-custom", () => {
    let system = new System("sys1", "testSystem");
    let backingServiceA = new BackingService("s1", "backingService", getEmptyMetaData());
    backingServiceA.setPropertyValue("software_type", "open-source");
    system.addEntity(backingServiceA);

    let measureValue = componentMeasureImplementations["ratioOfNonCustomBackingServices"]({ entity: backingServiceA, system: system });
    expect(measureValue).toEqual(1);
})

test("ratioOfNonCustomBackingServices - custom", () => {
    let system = new System("sys1", "testSystem");
    let backingServiceA = new BackingService("s1", "backingService", getEmptyMetaData());
    backingServiceA.setPropertyValue("software_type", "custom");
    system.addEntity(backingServiceA);

    let measureValue = componentMeasureImplementations["ratioOfNonCustomBackingServices"]({ entity: backingServiceA, system: system });
    expect(measureValue).toEqual(0);
})


test("secretsStoredInVault", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let secretA = new BackingData("b1", "secret A", getEmptyMetaData());
    secretA.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let relationAtoA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    serviceA.addBackingDataEntity(secretA, relationAtoA);

    let secretB = new BackingData("b2", "secret B", getEmptyMetaData());
    secretB.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let relationAtoB = new RelationToBackingData("r2", getEmptyMetaData());
    relationAtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    serviceA.addBackingDataEntity(secretB, relationAtoB);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", VAULT_KIND[0]);
    let relationBStoA = new RelationToBackingData("r4", getEmptyMetaData());
    relationBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    backingService.addBackingDataEntity(secretA, relationBStoA);

    system.addEntities([secretA, secretB]);
    system.addEntities([serviceA, backingService]);

    let measureValue = componentMeasureImplementations["secretsStoredInVault"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(0.5);
})

test("secretsStoredInVault", () => {
    let system = new System("sys1", "testSystem");

    let secretA = new BackingData("b1", "secret A", getEmptyMetaData());
    secretA.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", "vault");
    let relationBStoA = new RelationToBackingData("r4", getEmptyMetaData());
    relationBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    backingService.addBackingDataEntity(secretA, relationBStoA);

    system.addEntities([secretA]);
    system.addEntities([backingService]);

    let measureValue = componentMeasureImplementations["secretsStoredInVault"]({ entity: backingService, system: system });
    expect(measureValue).toEqual(1);
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

    let linkCA = new Link("l1", serviceC, endpointA);
    let linkCB = new Link("l2", serviceC, endpointB);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([linkCA, linkCB]);

    let measureValue = componentMeasureImplementations["accessRestrictedToCallers"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(0.5);
})

test("accessRestrictedToCallers - allow all", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setAllowedAccounts = [];
    serviceA.addEndpoint(endpointA);

    system.addEntities([serviceA]);

    let measureValue = componentMeasureImplementations["accessRestrictedToCallers"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(0);
})

test("accessRestrictedToCallers - external endpoint", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())
    let endpointA = new ExternalEndpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setAllowedAccounts = ["external account"];
    serviceA.addEndpoint(endpointA);

    system.addEntities([serviceA]);

    let measureValue = componentMeasureImplementations["accessRestrictedToCallers"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(1);
})

test("ratioOfDelegatedAuthentication", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "service A", getEmptyMetaData())

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", "authentication/authorization");

    serviceA.setAuthenticationBy = backingService;

    system.addEntities([serviceA, backingService]);

    let measureValue = componentMeasureImplementations["ratioOfDelegatedAuthentication"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(1);
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

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([serviceA, backingService]);

    let measureValue = componentMeasureImplementations["ratioOfStandardizedArtifacts"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(1);
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

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([serviceA, backingService]);

    let measureValue = componentMeasureImplementations["ratioOfStandardizedArtifacts"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(1);
})


test("ratioOfDeploymentsOnDynamicInfrastructure", () => {
    let system = new System("sys1", "testSystem");
    let infrastructureA = new Infrastructure("i1", "Infrastructure A", getEmptyMetaData());
    infrastructureA.setPropertyValue("kind", DYNAMIC_INFRASTRUCTURE[0]);
    let infrastructureB = new Infrastructure("i2", "Infrastruture B", getEmptyMetaData());
    infrastructureB.setPropertyValue("kind", "virtual-hardware");
    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("replicas", 2);

    let deploymentMappingB = new DeploymentMapping("dm2", serviceA, infrastructureB);
    deploymentMappingB.setPropertyValue("replicas", 5);

    system.addEntities([serviceA]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB]);

    let measureValue = componentMeasureImplementations["ratioOfDeploymentsOnDynamicInfrastructure"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(0.5);
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

    let measureValue = componentMeasureImplementations["namespaceSeparation"]({ entity: serviceA, system: system });
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

    let measureValue = componentMeasureImplementations["namespaceSeparation"]({ entity: serviceA, system: system });
    expect(measureValue).toBeCloseTo(2 / 3, 5);
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

    let measureValue = componentMeasureImplementations["namespaceSeparation"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(0);
})

test("ratioOfManagedBackingServices", () => {
    let system = new System("sys1", "testSystem");

    let backingServiceA = new BackingService("bs1", "service A", getEmptyMetaData())
    backingServiceA.setPropertyValue("managed", true);

    system.addEntities([backingServiceA]);

    let measureValue = componentMeasureImplementations["ratioOfManagedBackingServices"]({ entity: backingServiceA, system: system });
    expect(measureValue).toEqual(1);
})

test("ratioOfDeploymentMappingsWithStatedResourceRequirements", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("resource_requirements", "cpu:200m, memory:1GB");
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    deploymentMappingB.setPropertyValue("resource_requirements", "cpu:200m, memory:1GB");
    let deploymentMappingC = new DeploymentMapping("dm3", serviceA, infrastructureB);


    system.addEntities([serviceA, serviceB]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = componentMeasureImplementations["ratioOfDeploymentMappingsWithStatedResourceRequirements"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(0.5);
})


test("deployedEntitiesAutoscaling", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("deployed_entities_scaling", AUTOMATED_SCALING[0]);
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    infrastructureB.setPropertyValue("deployed_entities_scaling", "none");

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceA, infrastructureB);

    system.addEntities([serviceA, serviceB]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = componentMeasureImplementations["deployedEntitiesAutoscaling"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(0.5);
})


test("nonProviderSpecificComponentArtifacts", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let propertiesA = getArtifactTypeProperties("Kubernetes.Resource");
    propertiesA.find(prop => prop.getKey === "provider_specific").value = false;
    serviceA.setArtifact("art1", new Artifact(
        "Kubernetes.Resource",
        "", "", "", "", "", "", "", propertiesA
    ));

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([serviceA]);
    system.addEntities([backingService]);

    let measureValue = componentMeasureImplementations["nonProviderSpecificComponentArtifacts"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(1);
})

test("configurationStoredInConfigService", () => {
    let system = new System("sys1", "testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let configA = new BackingData("b1", "config A", getEmptyMetaData());
    configA.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let relationAtoA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    serviceA.addBackingDataEntity(configA, relationAtoA);

    let configB = new BackingData("b2", "config B", getEmptyMetaData());
    configB.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let relationAtoB = new RelationToBackingData("r2", getEmptyMetaData());
    relationAtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    serviceA.addBackingDataEntity(configB, relationAtoB);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", CONFIG_SERVICE_KIND[0]);
    let relationBStoA = new RelationToBackingData("r4", getEmptyMetaData());
    relationBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    backingService.addBackingDataEntity(configA, relationBStoA);

    system.addEntities([configA, configB]);
    system.addEntities([serviceA, backingService]);

    let measureValue = componentMeasureImplementations["configurationStoredInConfigService"]({ entity: serviceA, system: system });
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

    system.addEntities([serviceA]);

    let measureValue = componentMeasureImplementations["ratioOfEndpointsCoveredByContract"]({ entity: serviceA, system: system });
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

    let measureValue = componentMeasureImplementations["standardizedDeployments"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(0.5);
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

    let measureValue = componentMeasureImplementations["selfContainedDeployments"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(0.5);
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

    let measureValue = componentMeasureImplementations["replacingDeployments"]({ entity: serviceA, system: system });
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
    linkAD.setPropertyValue("timeout", "2000");

    system.addEntities([serviceA, serviceB, serviceC, serviceD]);
    system.addEntities([linkAB, linkAC, linkAD]);

    let measureValue = componentMeasureImplementations["linksWithTimeout"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(2/3);
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

    let measureValue = componentMeasureImplementations["deploymentsWithRestart"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(0.5);
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

    system.addEntities([serviceA]);

    let measureValue = componentMeasureImplementations["ratioOfDocumentedEndpoints"]({ entity: serviceA, system: system });
    expect(measureValue).toEqual(0.5);
})
