import { BackingService, DeploymentMapping, Infrastructure } from "@/core/entities";
import { Calculation, CalculationParameters } from "../../quamoco/Measure";
import { AUTOMATED_INFRASTRUCTURE_MAINTENANCE, AUTOMATED_INFRASTRUCTURE_PROVISIONING, AUTOMATED_RESTART_POLICIES, AUTOMATED_SCALING, BACKING_DATA_CONFIG_KIND, BACKING_DATA_LOGS_KIND, BACKING_DATA_METRICS_KIND, BACKING_DATA_SECRET_KIND, DATA_USAGE_RELATION_PERSISTENCE, DATA_USAGE_RELATION_USAGE, DYNAMIC_INFRASTRUCTURE, IAC_ARTIFACT_TYPE, MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS, MANAGED_INFRASTRUCTURE_MAINTENANCE, ROLLING_UPDATE_STRATEGY_OPTIONS, VAULT_KIND } from "../../specifications/featureModel";


export const supportsMonitoring: (infrastructure: Infrastructure) => boolean = (infrastructure: Infrastructure) => {

    let supportsMetrics = false;
    let supportsLogging = false;

    for (const backingData of infrastructure.getBackingDataEntities) {
        if (backingData.backingData.getProperty("kind").value === BACKING_DATA_METRICS_KIND) {
            supportsMetrics = true;
            continue;
        }
        if (backingData.backingData.getProperty("kind").value === BACKING_DATA_LOGS_KIND) {
            supportsLogging = true;
        }
    }

    return supportsMetrics && supportsLogging;
}

export const rollingUpdateOption: Calculation = (parameters: CalculationParameters<Infrastructure>) => {

    return parameters.entity.getProperty("supported_update_strategies").value.some(strategy => ROLLING_UPDATE_STRATEGY_OPTIONS.includes(strategy)) ? 1 : 0;

}

export const numberOfServiceHostedOnOneInfrastructure: Calculation = (parameters: CalculationParameters<Infrastructure>) => {

    let numberOfServicesHostedOnInfrastructure = 0;

    for (const [deploymentMappingId, deploymentMapping] of parameters.system.getDeploymentMappingEntities) {
        if (deploymentMapping.getUnderlyingInfrastructure.getId === parameters.entity.getId
            && deploymentMapping.getDeployedEntity.constructor.name !== Infrastructure.name) {
            numberOfServicesHostedOnInfrastructure++;
        }
    }
    return numberOfServicesHostedOnInfrastructure;
}

export const numberOfAvailabilityZonesUsed: Calculation = (parameters: CalculationParameters<Infrastructure>) => {

    let availabilityZones: Set<string> = new Set();

    let usedAvailabilityZones = (parameters.entity.getProperty("availability_zone").value as string).split(",");
    usedAvailabilityZones.forEach(zoneId => availabilityZones.add(zoneId));

    return availabilityZones.size;
}

export const secretsExternalization: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    let secrets = parameters.entity.getBackingDataEntities.filter(backingData => backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND);

    if (secrets.length === 0) {
        return "n/a";
    }

    let notStoredSecrets = secrets.filter(secret => DATA_USAGE_RELATION_USAGE.includes(secret.relation.getProperty("usage_relation").value));
    let notStoredSecretIds = notStoredSecrets.map(secret => secret.backingData.getId);

    let allOtherComponents = parameters.system.getComponentEntities.entries();
    let allInfrastructure = [...parameters.system.getInfrastructureEntities.entries()];


    let secretsStoredOutsideComponent = new Set();

    for (const [otherServiceId, otherService] of allOtherComponents) {
        let secrets = otherService.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND });
        secrets.forEach(secret => {
            if (notStoredSecretIds.includes(secret.backingData.getId) && DATA_USAGE_RELATION_PERSISTENCE.includes(secret.relation.getProperty("usage_relation").value)) {
                secretsStoredOutsideComponent.add(secret.backingData.getId);
            }
        })
    }

    for (const [infrastructureId, infrastructure] of allInfrastructure) {
        let secrets = infrastructure.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND });
        secrets.forEach(secret => {
            if (notStoredSecretIds.includes(secret.backingData.getId) && DATA_USAGE_RELATION_PERSISTENCE.includes(secret.relation.getProperty("usage_relation").value)) {
                secretsStoredOutsideComponent.add(secret.backingData.getId);
            }
        })
    }

    return secretsStoredOutsideComponent.size / secrets.length;
}

export const configurationExternalization: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    let configurations = parameters.entity.getBackingDataEntities.filter(backingData => backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND);

    if (configurations.length === 0) {
        return "n/a";
    }

    let notStoredConfigs = configurations.filter(config => DATA_USAGE_RELATION_USAGE.includes(config.relation.getProperty("usage_relation").value));
    let notStoredConfigIds = notStoredConfigs.map(config => config.backingData.getId);

    let allOtherComponents = parameters.system.getComponentEntities.entries();
    let allInfrastructure = [...parameters.system.getInfrastructureEntities.entries()];


    let configsStoredOutsideComponent = new Set();

    for (const [otherServiceId, otherService] of allOtherComponents) {
        let configs = otherService.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND });
        configs.forEach(config => {
            if (notStoredConfigIds.includes(config.backingData.getId) && DATA_USAGE_RELATION_PERSISTENCE.includes(config.relation.getProperty("usage_relation").value)) {
                configsStoredOutsideComponent.add(config.backingData.getId);
            }
        })
    }

    for (const [infrastructureId, infrastructure] of allInfrastructure) {
        let configs = infrastructure.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND });
        configs.forEach(config => {
            if (notStoredConfigIds.includes(config.backingData.getId) && DATA_USAGE_RELATION_PERSISTENCE.includes(config.relation.getProperty("usage_relation").value)) {
                configsStoredOutsideComponent.add(config.backingData.getId);
            }
        })
    }

    return configsStoredOutsideComponent.size / configurations.length;

}

export const ratioOfStandardizedArtifacts: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    let artifacts = parameters.entity.getArtifacts;

    if (artifacts.size === 0) {
        return "n/a";
    }

    let standardized = artifacts.entries().filter(([key, artifact]) => artifact.getProperty("based_on_standard") && artifact.getProperty("based_on_standard").value !== "none").toArray();

    return standardized.length / artifacts.size;
}

export const ratioOfEntitiesProvidingStandardizedArtifacts: Calculation = (parameters: CalculationParameters<Infrastructure>) => {

    let artifacts = parameters.entity.getArtifacts;

    if (artifacts.size === 0) {
        return "n/a";
    }

    let standardized = artifacts.entries().filter(([key, artifact]) => artifact.getProperty("based_on_standard") && artifact.getProperty("based_on_standard").value !== "none").toArray();

    return standardized.length > 0 ? 1 : 0;
}

export const ratioOfAutomaticallyProvisionedInfrastructure: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    return AUTOMATED_INFRASTRUCTURE_PROVISIONING.includes(parameters.entity.getProperty("provisioning").value) ? 1 : 0;
}

export const ratioOfInfrastructureWithIaCArtifact: Calculation = (parameters: CalculationParameters<Infrastructure>) => {

    let artifacts = parameters.entity.getArtifacts;

    if (artifacts.size === 0) {
        return "n/a";
    }

    let iacArtifact = artifacts.entries().find(([artifactKey, artifact]) => IAC_ARTIFACT_TYPE.includes(artifact.getType()));

    return iacArtifact ? 1 : 0;
}

export const ratioOfFullyManagedInfrastructure: Calculation = (parameters: CalculationParameters<Infrastructure>) => {

    return MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS.includes(parameters.entity.getProperty("environment_access").value) &&
        MANAGED_INFRASTRUCTURE_MAINTENANCE.includes(parameters.entity.getProperty("maintenance").value) ? 1 : 0;
}

export const ratioOfInfrastructureEnforcingResourceBoundaries: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    return parameters.entity.getProperty("enforced_resource_bounds").value ? 1 : 0;
}

export const ratioOfDeploymentMappingsWithStatedResourceRequirements: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return deploymentMapping.getUnderlyingInfrastructure.getId === parameters.entity.getId;
    }).toArray();

    if (relevantDeploymentMappings.length === 0) {
        return "n/a";
    }

    let statingResourceRequirements = relevantDeploymentMappings.filter(([deplyomentMappingKey, deploymentMapping]) => deploymentMapping.getProperty("resource_requirements").value !== "unstated");

    return statingResourceRequirements.length / relevantDeploymentMappings.length;

}

export const deployedEntitiesAutoscaling: Calculation = (parameters: CalculationParameters<Infrastructure>) => {

    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return deploymentMapping.getUnderlyingInfrastructure.getId === parameters.entity.getId;
    }).toArray();

    if (relevantDeploymentMappings.length === 0) {
        return "n/a";
    }

    let underlyingInfrastructure = relevantDeploymentMappings.map(([deploymentMappingKey, deploymentMapping]) => deploymentMapping.getUnderlyingInfrastructure);

    let infrastructureProvidesScaling = underlyingInfrastructure.filter(infrastructure => AUTOMATED_SCALING.includes(infrastructure.getProperty("deployed_entities_scaling").value))

    return AUTOMATED_SCALING.includes(parameters.entity.getProperty("deployed_entities_scaling").value) ? 1 : 0;
}

export const infrastructureAutoscaling: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    return AUTOMATED_SCALING.includes(parameters.entity.getProperty("self_scaling").value) ? 1 : 0;
}

export const ratioOfAbstractedHardware: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    return DYNAMIC_INFRASTRUCTURE.includes(parameters.entity.getProperty("kind").value) ? 1 : 0;
}

export const nonProviderSpecificInfrastructureArtifacts: Calculation = (parameters: CalculationParameters<Infrastructure>) => {

    let allArtifacts = parameters.entity.getArtifacts;

    if (allArtifacts.size === 0) {
        return "n/a";
    }

    let nonProviderSpecificArtifacts = allArtifacts.entries().filter(([artifactKey, artifact]) => {
        return artifact.getProperty("provider_specific") && !artifact.getProperty("provider_specific").value;
    }).toArray();

    return nonProviderSpecificArtifacts.length / allArtifacts.size;
}

export const replacingDeployments: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return deploymentMapping.getDeployedEntity.getId === parameters.entity.getId;
    }).toArray();

    if (relevantDeploymentMappings.length === 0) {
        return "n/a";
    }

    let replacing = [];

    relevantDeploymentMappings.forEach(([deploymentMappingId, deploymentMapping]) => {
        if (deploymentMapping.getProperty("update_strategy").value !== "in-place") {
            replacing.push(deploymentMappingId);
        }
    })

    return replacing.length / relevantDeploymentMappings.length;
}

export const ratioOfAutomaticallyMaintainedInfrastructure: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    return AUTOMATED_INFRASTRUCTURE_MAINTENANCE.includes(parameters.entity.getProperty("maintenance").value) ? 1 : 0;
}

export const deploymentsWithRestart: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    let relevantDeploymentMappings = parameters.system.getDeploymentMappingEntities.entries().filter(([deploymentMappingKey, deploymentMapping]) => {
        return deploymentMapping.getDeployedEntity.getId === parameters.entity.getId;
    }).toArray();

    if (relevantDeploymentMappings.length === 0) {
        return "n/a";
    }

    let automatedRestart = relevantDeploymentMappings.filter(([deploymentMappingId, deploymentMapping]) => AUTOMATED_RESTART_POLICIES.includes(deploymentMapping.getProperty("automated_restart_policy").value));

    return automatedRestart.length / relevantDeploymentMappings.length;
}


export const secretsStoredInVault: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    let referencedSecrets = parameters.entity.getBackingDataEntities.filter(backingData => backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND);

    if (referencedSecrets.length === 0) {
        return "n/a";
    }

    let usedSecrets = referencedSecrets.filter(backingData => DATA_USAGE_RELATION_USAGE.includes(backingData.relation.getProperty("usage_relation").value));
    let usedSecretIds = usedSecrets.map(backingData => backingData.backingData.getId);
    let persistedSecrets = referencedSecrets.filter(backingData => DATA_USAGE_RELATION_PERSISTENCE.includes(backingData.relation.getProperty("usage_relation").value));

    let secretsInVault: Set<string> = new Set();

    let allVaultServices = [...parameters.system.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && VAULT_KIND.includes(component.getProperty("providedFunctionality").value);
    })

    for (const [valutServiceId, vaultService] of allVaultServices) {
        let secrets = vaultService.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND });
        secrets.forEach(secret => {
            if (usedSecretIds.includes(secret.backingData.getId) && DATA_USAGE_RELATION_PERSISTENCE.includes(secret.relation.getProperty("usage_relation").value)) {
                secretsInVault.add(secret.backingData.getId);
            }
        })
    }

    if (parameters.entity.constructor.name === BackingService.name && VAULT_KIND.includes(parameters.entity.getProperty("providedFunctionality").value)) {
        persistedSecrets.map(backingData => backingData.backingData.getId).forEach(secretId => secretsInVault.add(secretId));
    }

    return (secretsInVault.size / referencedSecrets.length);
}

export const ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    let loggingComponents = [...parameters.system.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && component.getProperty("providedFunctionality").value === "logging";
    })

    if (loggingComponents.length === 0) {
        return 0;
    }

    let loggingData: string[] = parameters.entity.getBackingDataEntities.filter(backingData => {
        return backingData.backingData.getProperty("kind").value === BACKING_DATA_LOGS_KIND && DATA_USAGE_RELATION_USAGE.includes(backingData.relation.getProperty("usage_relation").value)
    }).map(backingData => backingData.backingData.getId);

    let infrastructureExportsLoggingData = false;
    for (const [loggingServiceId, loggingService] of loggingComponents) {
        let loggingDataAlsoInLoggingService = loggingService.getBackingDataEntities.find(backingData => {
            return loggingData.includes(backingData.backingData.getId)
        });
        if (loggingDataAlsoInLoggingService && DATA_USAGE_RELATION_PERSISTENCE.includes(loggingDataAlsoInLoggingService.relation.getProperty("usage_relation").value)) {
            infrastructureExportsLoggingData = true;
        }
    }
    if (infrastructureExportsLoggingData) {
        return 1;
    }

    return 0;
}

export const ratioOfComponentsOrInfrastructureNodesThatExportMetrics: Calculation = (parameters: CalculationParameters<Infrastructure>) => {
    let metricComponents = [...parameters.system.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && component.getProperty("providedFunctionality").value === "metrics";
    })

    if (metricComponents.length === 0) {
        return 0;
    }

    let metricData: string[] = parameters.entity.getBackingDataEntities.filter(backingData => {
        return backingData.backingData.getProperty("kind").value === BACKING_DATA_METRICS_KIND && DATA_USAGE_RELATION_USAGE.includes(backingData.relation.getProperty("usage_relation").value)
    }).map(backingData => backingData.backingData.getId);

    let infrastructureExportsMetrics = false;
    for (const [metricServiceId, metricService] of metricComponents) {
        let metricsAlsoInMetricsService = metricService.getBackingDataEntities.find(backingData => {
            return metricData.includes(backingData.backingData.getId)
        });
        if (metricsAlsoInMetricsService && DATA_USAGE_RELATION_PERSISTENCE.includes(metricsAlsoInMetricsService.relation.getProperty("usage_relation").value)) {
            infrastructureExportsMetrics = true;
        }
    }
    if (infrastructureExportsMetrics) {
        return 1;
    }

    return 0;
}


export const infrastructureMeasureImplementations: { [measureKey: string]: Calculation } = {
    "numberOfServiceHostedOnOneInfrastructure": numberOfServiceHostedOnOneInfrastructure,
    "numberOfAvailabilityZonesUsed": numberOfAvailabilityZonesUsed,
    "rollingUpdateOption": rollingUpdateOption,
    "secretsExternalization": secretsExternalization,
    "configurationExternalization": configurationExternalization,
    "ratioOfStandardizedArtifacts": ratioOfStandardizedArtifacts,
    "ratioOfEntitiesProvidingStandardizedArtifacts": ratioOfEntitiesProvidingStandardizedArtifacts,
    "ratioOfAutomaticallyProvisionedInfrastructure": ratioOfAutomaticallyProvisionedInfrastructure,
    "ratioOfInfrastructureWithIaCArtifact": ratioOfInfrastructureWithIaCArtifact,
    "ratioOfFullyManagedInfrastructure": ratioOfFullyManagedInfrastructure,
    "ratioOfInfrastructureEnforcingResourceBoundaries": ratioOfInfrastructureEnforcingResourceBoundaries,
    "ratioOfDeploymentMappingsWithStatedResourceRequirements": ratioOfDeploymentMappingsWithStatedResourceRequirements,
    "deployedEntitiesAutoscaling": deployedEntitiesAutoscaling,
    "infrastructureAutoscaling": infrastructureAutoscaling,
    "ratioOfAbstractedHardware": ratioOfAbstractedHardware,
    "nonProviderSpecificInfrastructureArtifacts": nonProviderSpecificInfrastructureArtifacts,
    "replacingDeployments": replacingDeployments,
    "ratioOfAutomaticallyMaintainedInfrastructure": ratioOfAutomaticallyMaintainedInfrastructure,
    "deploymentsWithRestart": deploymentsWithRestart,
    "secretsStoredInVault": secretsStoredInVault,
    "ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService": ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService,
    "ratioOfComponentsOrInfrastructureNodesThatExportMetrics": ratioOfComponentsOrInfrastructureNodesThatExportMetrics
}
