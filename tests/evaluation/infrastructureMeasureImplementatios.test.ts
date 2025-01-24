import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { BackingData, BackingService, DeploymentMapping, Infrastructure, Service, System } from "@/core/entities";
import { RelationToBackingData } from "@/core/entities/relationToBackingData";
import { infrastructureMeasureImplementations } from "@/core/qualitymodel/evaluation/measure-implementations/infrastructureMeasures";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { ENTITIES } from "@/core/qualitymodel/specifications/entities";
import { BACKING_DATA_CONFIG_KIND, BACKING_DATA_SECRET_KIND, DATA_USAGE_RELATION_PERSISTENCE, DATA_USAGE_RELATION_USAGE } from "@/core/qualitymodel/specifications/featureModel";
import { expect, test } from "vitest";


test("all implementation names refer to an existing measure", () => {
    let measureKeys = getQualityModel().measures.get(ENTITIES.INFRASTRUCTURE).map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(infrastructureMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    measureImplementationKeys.forEach(key => {
        expect(measureKeys).include(key);
    })
})

test("all implemented measure must provide information on the calculation", () => {
    let measures = getQualityModel().measures.get(ENTITIES.INFRASTRUCTURE);
    let measureKeys = measures.map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(infrastructureMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    for (const measure of measures) {
        if (measureImplementationKeys.includes(measure.getId)) {
            expect(measure.getCalculationDescription.length, `Implemented measure ${measure.getId} does not provide a calculation description`).toBeGreaterThan(0)
        }
    }
})


test("numberOfServiceHostedOnOneInfrastructure", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    let infrastructureC = new Infrastructure("i3", "infrastructure 3", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureB);

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = infrastructureMeasureImplementations["numberOfServiceHostedOnOneInfrastructure"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(2);
})

test("numberOfAvailabilityZonesUsed", () => {
    let system = new System("sys1", "testSystem");;

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("availability_zone", "privateA,privateB,public")

    system.addEntities([infrastructureA]);

    let measureValue = infrastructureMeasureImplementations["numberOfAvailabilityZonesUsed"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(3);
})

test("rollingUpdateOption", () => {
    let system = new System("sys1", "testSystem");;

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("supported_update_strategies", ["rolling"]);

    system.addEntities([infrastructureA]);

    let measureValue = infrastructureMeasureImplementations["rollingUpdateOption"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})


test("secretsExternalization", () => {
    let system = new System("sys1", "testSystem");;

    let infrastructureA = new Infrastructure("i1", "testInfrastructure", getEmptyMetaData());

    let secretA = new BackingData("b1", "secret A", getEmptyMetaData());
    secretA.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let relationAtoA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    infrastructureA.addBackingDataEntity(secretA, relationAtoA);

    let secretB = new BackingData("b2", "secret B", getEmptyMetaData());
    secretB.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let relationAtoB = new RelationToBackingData("r2", getEmptyMetaData());
    relationAtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    infrastructureA.addBackingDataEntity(secretB, relationAtoB);

    let secretC = new BackingData("b3", "secret C", getEmptyMetaData());
    secretC.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let relationAtoC = new RelationToBackingData("r3", getEmptyMetaData());
    relationAtoC.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    infrastructureA.addBackingDataEntity(secretC, relationAtoC);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", "config");
    let relationBStoA = new RelationToBackingData("r4", getEmptyMetaData());
    relationBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    backingService.addBackingDataEntity(secretA, relationBStoA);

    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    let relationIBtoB = new RelationToBackingData("r5", getEmptyMetaData());
    relationIBtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    infrastructureB.addBackingDataEntity(secretB, relationIBtoB);

    system.addEntities([secretA, secretB, secretC]);
    system.addEntities([backingService]);
    system.addEntities([infrastructureA, infrastructureB]);

    let measureValue = infrastructureMeasureImplementations["secretsExternalization"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(2 / 3);
})

test("configurationExternalization", () => {
    let system = new System("sys1", "testSystem");;

    let infrastructureA = new Infrastructure("i1", "testInfrastructure", getEmptyMetaData());

    let configA = new BackingData("b1", "config A", getEmptyMetaData());
    configA.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let relationAtoA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    infrastructureA.addBackingDataEntity(configA, relationAtoA);

    let configB = new BackingData("b2", "secret B", getEmptyMetaData());
    configB.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let relationAtoB = new RelationToBackingData("r2", getEmptyMetaData());
    relationAtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    infrastructureA.addBackingDataEntity(configB, relationAtoB);

    let configC = new BackingData("b3", "secret C", getEmptyMetaData());
    configC.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let relationAtoC = new RelationToBackingData("r3", getEmptyMetaData());
    relationAtoC.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    infrastructureA.addBackingDataEntity(configC, relationAtoC);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", "config");
    let relationBStoA = new RelationToBackingData("r4", getEmptyMetaData());
    relationBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    backingService.addBackingDataEntity(configA, relationBStoA);

    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    let relationIBtoB = new RelationToBackingData("r5", getEmptyMetaData());
    relationIBtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    infrastructureB.addBackingDataEntity(configB, relationIBtoB);

    system.addEntities([configA, configB, configC]);
    system.addEntities([backingService]);
    system.addEntities([infrastructureA, infrastructureB]);

    let measureValue = infrastructureMeasureImplementations["configurationExternalization"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(2 / 3);


})