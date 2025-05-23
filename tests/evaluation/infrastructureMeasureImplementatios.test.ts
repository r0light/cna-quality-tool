import { Artifact, getArtifactTypeProperties } from "@/core/common/artifact";
import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { BackingData, BackingService, DeploymentMapping, Endpoint, Infrastructure, Service, System } from "@/core/entities";
import { RelationToBackingData } from "@/core/entities/relationToBackingData";
import { infrastructureMeasureImplementations } from "@/core/qualitymodel/evaluation/measure-implementations/infrastructureMeasures";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { ENTITIES } from "@/core/qualitymodel/specifications/entities";
import { AUTOMATED_INFRASTRUCTURE_MAINTENANCE, AUTOMATED_SCALING, BACKING_DATA_CONFIG_KIND, BACKING_DATA_SECRET_KIND, CONFIG_SERVICE_KIND, DATA_USAGE_RELATION_PERSISTENCE, DATA_USAGE_RELATION_USAGE, DYNAMIC_INFRASTRUCTURE, MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS, MANAGED_INFRASTRUCTURE_MAINTENANCE, VAULT_KIND } from "@/core/qualitymodel/specifications/featureModel";
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

test("numberOfAvailabilityZonesUsedByInfrastructure", () => {
    let system = new System("sys1", "testSystem");;

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("availability_zone", "privateA,privateB,public")

    system.addEntities([infrastructureA]);

    let measureValue = infrastructureMeasureImplementations["numberOfAvailabilityZonesUsedByInfrastructure"]({ entity: infrastructureA, system: system });
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
    backingService.setPropertyValue("providedFunctionality", "vault");
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

test("ratioOfStandardizedArtifacts", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData())
    let propertiesA = getArtifactTypeProperties("Image.Container.OCI");
    propertiesA.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    infrastructureA.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesA
    ));

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([infrastructureA]);
    system.addEntities([backingService]);

    let measureValue = infrastructureMeasureImplementations["ratioOfStandardizedArtifacts"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})

test("ratioOfEntitiesProvidingStandardizedArtifacts", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData())
    let propertiesA = getArtifactTypeProperties("Image.Container.OCI");
    propertiesA.find(prop => prop.getKey === "based_on_standard").value = "OCI";
    infrastructureA.setArtifact("art1", new Artifact(
        "Image.Container.OCI",
        "", "", "", "", "", "", "", propertiesA
    ));

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([infrastructureA]);
    system.addEntities([backingService]);

    let measureValue = infrastructureMeasureImplementations["ratioOfStandardizedArtifacts"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})


test("ratioOfAutomaticallyProvisionedInfrastructure", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData());
    infrastructureA.setPropertyValue("provisioning", "transparent");
    let infrastructureB = new Infrastructure("i2", "infrastructure B", getEmptyMetaData());
    let infrastructureC = new Infrastructure("i3", "infrastructure C", getEmptyMetaData());

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([backingService]);

    let measureValue = infrastructureMeasureImplementations["ratioOfAutomaticallyProvisionedInfrastructure"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})

test("ratioOfInfrastructureWithIaCArtifact", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData())
    let propertiesA = getArtifactTypeProperties("Terraform.Script");
    infrastructureA.setArtifact("art1", new Artifact(
        "Terraform.Script",
        "", "", "", "", "", "", "", propertiesA
    ));

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([infrastructureA]);
    system.addEntities([backingService]);

    let measureValue = infrastructureMeasureImplementations["ratioOfInfrastructureWithIaCArtifact"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})

test("ratioOfFullyManagedInfrastructure", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData())
    infrastructureA.setPropertyValue("environment_access", MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS[0]);
    infrastructureA.setPropertyValue("maintenance", MANAGED_INFRASTRUCTURE_MAINTENANCE[0]);

    system.addEntities([infrastructureA]);

    let measureValue = infrastructureMeasureImplementations["ratioOfFullyManagedInfrastructure"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})

test("ratioOfInfrastructureEnforcingResourceBoundaries", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData())
    infrastructureA.setPropertyValue("enforced_resource_bounds", true);

    system.addEntities([infrastructureA]);

    let measureValue = infrastructureMeasureImplementations["ratioOfInfrastructureEnforcingResourceBoundaries"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})

test("ratioOfDeploymentMappingsWithStatedResourceRequirements", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let serviceC = new Service("s3", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    let infrastructureC = new Infrastructure("i3", "infrastructure 3", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("resource_requirements", "cpu:200m, memory:1GB");
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceC, infrastructureB);
    deploymentMappingC.setPropertyValue("resource_requirements", "cpu:200m, memory:1GB");

    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([infrastructureA, infrastructureB, infrastructureC]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = infrastructureMeasureImplementations["ratioOfDeploymentMappingsWithStatedResourceRequirements"]({ entity: infrastructureA, system: system });
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

    let measureValue = infrastructureMeasureImplementations["deployedEntitiesAutoscaling"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})

test("infrastructureAutoscaling", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("self_scaling", AUTOMATED_SCALING[0]);

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);

    system.addEntities([serviceA, serviceB]);
    system.addEntities([infrastructureA]);
    system.addEntities([deploymentMappingA, deploymentMappingB]);

    let measureValue = infrastructureMeasureImplementations["infrastructureAutoscaling"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})

test("ratioOfAbstractedHardware", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let serviceB = new Service("s2", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("kind", DYNAMIC_INFRASTRUCTURE[0]);
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());
    infrastructureB.setPropertyValue("kind", "virtual-hardware");

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", serviceB, infrastructureA);
    let deploymentMappingC = new DeploymentMapping("dm3", serviceA, infrastructureB);

    system.addEntities([serviceA, serviceB]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB, deploymentMappingC]);

    let measureValue = infrastructureMeasureImplementations["ratioOfAbstractedHardware"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})

test("nonProviderSpecificInfrastructureArtifacts", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "infrastructure A", getEmptyMetaData())
    let propertiesA = getArtifactTypeProperties("Kubernetes.Resource");
    propertiesA.find(prop => prop.getKey === "provider_specific").value = false;
    infrastructureA.setArtifact("art1", new Artifact(
        "Kubernetes.Resource",
        "", "", "", "", "", "", "", propertiesA
    ));

    let backingService = new BackingService("bs1", "auth service", getEmptyMetaData());

    system.addEntities([infrastructureA]);
    system.addEntities([backingService]);

    let measureValue = infrastructureMeasureImplementations["nonProviderSpecificInfrastructureArtifacts"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})

test("replacingDeployments", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("update_strategy", "in-place");
    let deploymentMappingB = new DeploymentMapping("dm2", infrastructureA, infrastructureB);
    deploymentMappingB.setPropertyValue("update_strategy", "replace");


    system.addEntities([serviceA]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB]);

    let measureValue = infrastructureMeasureImplementations["replacingDeployments"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})

test("ratioOfAutomaticallyMaintainedInfrastructure", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    infrastructureA.setPropertyValue("maintenance", AUTOMATED_INFRASTRUCTURE_MAINTENANCE[0]);
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    let deploymentMappingB = new DeploymentMapping("dm2", infrastructureA, infrastructureB);

    system.addEntities([serviceA]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB]);

    let measureValue = infrastructureMeasureImplementations["ratioOfAutomaticallyMaintainedInfrastructure"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})



test("deploymentsWithRestart", () => {
    let system = new System("sys1", "testSystem");;

    let serviceA = new Service("s1", "testService", getEmptyMetaData());

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let infrastructureB = new Infrastructure("i2", "infrastructure 2", getEmptyMetaData());

    let deploymentMappingA = new DeploymentMapping("dm1", serviceA, infrastructureA);
    deploymentMappingA.setPropertyValue("automated_restart_policy", "never");
    let deploymentMappingB = new DeploymentMapping("dm2", infrastructureA, infrastructureB);
    deploymentMappingB.setPropertyValue("automated_restart_policy", "onProcessFailure");


    system.addEntities([serviceA]);
    system.addEntities([infrastructureA, infrastructureB]);
    system.addEntities([deploymentMappingA, deploymentMappingB]);

    let measureValue = infrastructureMeasureImplementations["deploymentsWithRestart"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})

test("secretsStoredInVault", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "testInfra", getEmptyMetaData());

    let secretA = new BackingData("b1", "secret A", getEmptyMetaData());
    secretA.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let relationAtoA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    infrastructureA.addBackingDataEntity(secretA, relationAtoA);

    let secretB = new BackingData("b2", "secret B", getEmptyMetaData());
    secretB.setPropertyValue("kind", BACKING_DATA_SECRET_KIND);
    let relationAtoB = new RelationToBackingData("r2", getEmptyMetaData());
    relationAtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    infrastructureA.addBackingDataEntity(secretB, relationAtoB);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", VAULT_KIND[0]);
    let relationBStoA = new RelationToBackingData("r4", getEmptyMetaData());
    relationBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    backingService.addBackingDataEntity(secretA, relationBStoA);

    system.addEntities([secretA, secretB]);
    system.addEntities([infrastructureA]);
    system.addEntities([backingService]);

    let measureValue = infrastructureMeasureImplementations["secretsStoredInVault"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(0.5);
})

test("ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService", () => {
    let system = new System("sys1", "testSystem");;

    let loggingService = new BackingService("bl1", "logging service", getEmptyMetaData());
    loggingService.setPropertyValue("providedFunctionality", "logging");
    let loggingEndpoint = new Endpoint("e1", "logging endpoint", getEmptyMetaData());
    loggingService.addEndpoint(loggingEndpoint);


    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let metricsIA = new BackingData("m2", "metrics 2", getEmptyMetaData());
    metricsIA.setPropertyValue("kind", "metrics");
    let relationIAtoMIA = new RelationToBackingData("r7", getEmptyMetaData());
    relationIAtoMIA.setPropertyValue("usage_relation", "persistence");
    infrastructureA.addBackingDataEntity(metricsIA, relationIAtoMIA);
    let logsIA = new BackingData("l4", "logs 4", getEmptyMetaData());
    logsIA.setPropertyValue("kind", "logs");
    let relationIAtoLIA = new RelationToBackingData("r8", getEmptyMetaData());
    relationIAtoLIA.setPropertyValue("usage_relation", "usage");
    infrastructureA.addBackingDataEntity(logsIA, relationIAtoLIA);
    let relationLStoLIA = new RelationToBackingData("r9", getEmptyMetaData());
    relationLStoLIA.setPropertyValue("usage_relation", "persistence");
    loggingService.addBackingDataEntity(logsIA, relationLStoLIA);

    system.addEntities([loggingService]);
    system.addEntities([infrastructureA]);

    let measureValue = infrastructureMeasureImplementations["ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})

test("ratioOfComponentsOrInfrastructureNodesThatExportMetrics", () => {
    let system = new System("sys1", "testSystem");;

    let metricsService = new BackingService("bl1", "metrics service", getEmptyMetaData());
    metricsService.setPropertyValue("providedFunctionality", "metrics");
    let metricsEndpoint = new Endpoint("e1", "metrics endpoint", getEmptyMetaData());
    metricsService.addEndpoint(metricsEndpoint);

    let infrastructureA = new Infrastructure("i1", "infrastructure 1", getEmptyMetaData());
    let metricsIA = new BackingData("m4", "metrics 4", getEmptyMetaData());
    metricsIA.setPropertyValue("kind", "metrics");
    let relationIAtoMIA = new RelationToBackingData("r6", getEmptyMetaData());
    relationIAtoMIA.setPropertyValue("usage_relation", "usage");
    infrastructureA.addBackingDataEntity(metricsIA, relationIAtoMIA);
    let relationMStoMIA = new RelationToBackingData("r7", getEmptyMetaData());
    relationMStoMIA.setPropertyValue("usage_relation", "persistence");
    metricsService.addBackingDataEntity(metricsIA, relationMStoMIA);

    system.addEntities([metricsService]);
    system.addEntities([infrastructureA]);

    let measureValue = infrastructureMeasureImplementations["ratioOfComponentsOrInfrastructureNodesThatExportMetrics"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(1);
})

test("configurationStoredInConfigService", () => {
    let system = new System("sys1", "testSystem");

    let infrastructureA = new Infrastructure("i1", "testInfra", getEmptyMetaData());

    let configA = new BackingData("b1", "config A", getEmptyMetaData());
    configA.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let relationAtoA = new RelationToBackingData("r1", getEmptyMetaData());
    relationAtoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_USAGE[0]);
    infrastructureA.addBackingDataEntity(configA, relationAtoA);

    let configB = new BackingData("b2", "config B", getEmptyMetaData());
    configB.setPropertyValue("kind", BACKING_DATA_CONFIG_KIND);
    let relationAtoB = new RelationToBackingData("r2", getEmptyMetaData());
    relationAtoB.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    infrastructureA.addBackingDataEntity(configB, relationAtoB);

    let backingService = new BackingService("bs1", "backing service 1", getEmptyMetaData());
    backingService.setPropertyValue("providedFunctionality", CONFIG_SERVICE_KIND[0]);
    let relationBStoA = new RelationToBackingData("r4", getEmptyMetaData());
    relationBStoA.setPropertyValue("usage_relation", DATA_USAGE_RELATION_PERSISTENCE[0]);
    backingService.addBackingDataEntity(configA, relationBStoA);

    system.addEntities([configA, configB]);
    system.addEntities([infrastructureA]);
    system.addEntities([backingService]);

    let measureValue = infrastructureMeasureImplementations["configurationStoredInConfigService"]({ entity: infrastructureA, system: system });
    expect(measureValue).toEqual(0.5);
})
