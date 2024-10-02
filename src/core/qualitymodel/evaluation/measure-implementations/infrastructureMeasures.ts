import { Infrastructure } from "@/core/entities";
import { Calculation, CalculationParameters } from "../../quamoco/Measure";
import { BACKING_DATA_LOGS_KIND, BACKING_DATA_METRICS_KIND } from "../../specifications/featureModel";


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


export const infrastructureMeasureImplementations: { [measureKey: string]: Calculation } = {
    "numberOfServiceHostedOnOneInfrastructure": numberOfServiceHostedOnOneInfrastructure
}
