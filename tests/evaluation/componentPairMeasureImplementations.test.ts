import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { DataAggregate, Endpoint, ExternalEndpoint, Service, System } from "@/core/entities";
import { RelationToDataAggregate } from "@/core/entities/relationToDataAggregate";
import { componentPairMeasureImplementations } from "@/core/qualitymodel/evaluation/measureImplementations";
import { expect, test } from "vitest";

test("couplingOfServicesBasedOnUsedDataAggregates", () => {
    let system = new System("testSystem");


    let dataAggregateA = new DataAggregate("d1", "data 1", getEmptyMetaData());
    let dataAggregateB = new DataAggregate("d2", "data 2", getEmptyMetaData());
    let dataAggregateC = new DataAggregate("d3", "data 3", getEmptyMetaData());
    let dataAggregateD = new DataAggregate("d4", "data 4", getEmptyMetaData());


    let serviceA = new Service("s1", "testService 1", getEmptyMetaData());
    serviceA.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("r1", getEmptyMetaData()));
    serviceA.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("r2", getEmptyMetaData()));
    serviceA.addDataAggregateEntity(dataAggregateC, new RelationToDataAggregate("r3", getEmptyMetaData()));

    let serviceB = new Service("s2", "testService 2", getEmptyMetaData());
    serviceB.addDataAggregateEntity(dataAggregateC, new RelationToDataAggregate("r4", getEmptyMetaData()));
    serviceB.addDataAggregateEntity(dataAggregateD, new RelationToDataAggregate("r5", getEmptyMetaData()));

    system.addEntities([dataAggregateA, dataAggregateB, dataAggregateC, dataAggregateD]);
    system.addEntities([serviceA, serviceB]);

    let measureValue = componentPairMeasureImplementations["couplingOfServicesBasedOnUsedDataAggregates"]({componentA: serviceA, componentB: serviceB,  system: system});
    expect(measureValue).toEqual(1/4);

    })