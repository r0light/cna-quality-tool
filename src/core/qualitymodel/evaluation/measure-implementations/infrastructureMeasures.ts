import { Infrastructure } from "@/core/entities";
import { Calculation, CalculationParameters } from "../../quamoco/Measure";
import { BACKING_DATA_LOGS_KIND, BACKING_DATA_METRICS_KIND, ROLLING_UPDATE_STRATEGY_OPTIONS } from "../../specifications/featureModel";


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

export const infrastructureMeasureImplementations: { [measureKey: string]: Calculation } = {
    "numberOfServiceHostedOnOneInfrastructure": numberOfServiceHostedOnOneInfrastructure,
    "numberOfAvailabilityZonesUsed": numberOfAvailabilityZonesUsed,
    "rollingUpdateOption": rollingUpdateOption
}
