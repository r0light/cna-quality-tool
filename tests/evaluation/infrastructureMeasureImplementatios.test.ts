import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { DeploymentMapping, Infrastructure, Service, System } from "@/core/entities";
import { infrastructureMeasureImplementations } from "@/core/qualitymodel/evaluation/measure-implementations/infrastructureMeasures";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { ENTITIES } from "@/core/qualitymodel/specifications/entities";
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