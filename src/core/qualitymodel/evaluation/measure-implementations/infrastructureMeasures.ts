import { BackingService, Infrastructure } from "@/core/entities";
import { Calculation, CalculationParameters } from "../../quamoco/Measure";
import { BACKING_DATA_CONFIG_KIND, BACKING_DATA_LOGS_KIND, BACKING_DATA_METRICS_KIND, BACKING_DATA_SECRET_KIND, DATA_USAGE_RELATION_PERSISTENCE, DATA_USAGE_RELATION_USAGE, ROLLING_UPDATE_STRATEGY_OPTIONS } from "../../specifications/featureModel";


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

    let secrets= parameters.entity.getBackingDataEntities.filter(backingData => backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND);

    if (secrets.length === 0) {
        return 0;
    }

    let notStoredSecrets = secrets.filter(secret => DATA_USAGE_RELATION_USAGE.includes(secret.relation.getProperty("usage_relation").value));
    let notStoredSecretIds = notStoredSecrets.map(secret => secret.backingData.getId);

    let allConfigServices = [...parameters.system.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && component.getProperty("providedFunctionality").value === "config";
    })

    let allInfrastructure = [...parameters.system.getInfrastructureEntities.entries()].filter(entry => entry[0] !== parameters.entity.getId);

    let secretsStoredOutsideComponent = new Set();

    for (const [configServiceId, configService] of allConfigServices) {
        let secrets = configService.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_SECRET_KIND });
        secrets.forEach(secret => {
            if (notStoredSecretIds.includes(secret.backingData.getId) && DATA_USAGE_RELATION_PERSISTENCE.includes(secret.relation.getProperty("usage_relation").value) ) {
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

    let configurations= parameters.entity.getBackingDataEntities.filter(backingData => backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND);

    if (configurations.length === 0) {
        return 0;
    }

    let notStoredConfigs = configurations.filter(config => DATA_USAGE_RELATION_USAGE.includes(config.relation.getProperty("usage_relation").value));
    let notStoredConfigIds = notStoredConfigs.map(config => config.backingData.getId);

    let allConfigServices = [...parameters.system.getComponentEntities.entries()].filter(([componentId, component]) => {
        return component.constructor.name === BackingService.name && component.getProperty("providedFunctionality").value === "config";
    })

    let allInfrastructure = [...parameters.system.getInfrastructureEntities.entries()].filter(entry => entry[0] !== parameters.entity.getId);

    let configsStoredOutsideComponent = new Set();

    for (const [configServiceId, configService] of allConfigServices) {
        let secrets = configService.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND });
        secrets.forEach(config => {
            if (notStoredConfigIds.includes(config.backingData.getId) && DATA_USAGE_RELATION_PERSISTENCE.includes(config.relation.getProperty("usage_relation").value) ) {
                configsStoredOutsideComponent.add(config.backingData.getId);
            }
        })
    }

    for (const [infrastructureId, infrastructure] of allInfrastructure) {
        let secrets = infrastructure.getBackingDataEntities.filter(backingData => { return backingData.backingData.getProperty("kind").value === BACKING_DATA_CONFIG_KIND });
        secrets.forEach(config => {
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



export const infrastructureMeasureImplementations: { [measureKey: string]: Calculation } = {
    "numberOfServiceHostedOnOneInfrastructure": numberOfServiceHostedOnOneInfrastructure,
    "numberOfAvailabilityZonesUsed": numberOfAvailabilityZonesUsed,
    "rollingUpdateOption": rollingUpdateOption,
    "secretsExternalization": secretsExternalization,
    "configurationExternalization": configurationExternalization,
    "ratioOfStandardizedArtifacts": ratioOfStandardizedArtifacts,
    "ratioOfEntitiesProvidingStandardizedArtifacts": ratioOfEntitiesProvidingStandardizedArtifacts
}
