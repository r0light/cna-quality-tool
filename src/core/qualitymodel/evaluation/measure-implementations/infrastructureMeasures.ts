import { Infrastructure } from "@/core/entities";
import { Calculation, CalculationParameters } from "../../quamoco/Measure";


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
