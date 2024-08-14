import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { DataAggregate, Endpoint, ExternalEndpoint, Link, Service, System } from "@/core/entities";
import { RelationToDataAggregate } from "@/core/entities/relationToDataAggregate";
import { componentMeasureImplementations } from "@/core/qualitymodel/evaluation/measureImplementations";
import { expect, test } from "vitest";

test("serviceInterfaceDataCohesion", () => {
    let system = new System("testSystem");

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

    let measureValue = componentMeasureImplementations["serviceInterfaceDataCohesion"]({component: service, system: system});
    expect(measureValue).toEqual(2);

})


test("serviceInterfaceUsageCohesion", () => {
    let system = new System("testSystem");

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

    let measureValue = componentMeasureImplementations["serviceInterfaceUsageCohesion"]({component: serviceA, system: system});
    expect(measureValue).toEqual(3/4);
})

test("totalServiceInterfaceCohesion", () => {

    let system = new System("testSystem");

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

    let measureValue = componentMeasureImplementations["totalServiceInterfaceCohesion"]({component: serviceA, system: system});
    expect(measureValue).toEqual(7/6);
})

test("cohesionBetweenEndpointsBasedOnDataAggregateUsage", () => {
    let system = new System("testSystem");

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

    let measureValue = componentMeasureImplementations["cohesionBetweenEndpointsBasedOnDataAggregateUsage"]({component: service, system: system});
    expect(measureValue).toEqual(1/3);

})