import { sum } from "lodash";
import { ExternalEndpoint, System, Service } from "../entities";
import { Calculation } from "./quamoco/Measure";
import { ProductFactorEvaluationFunction } from "./quamoco/ProductFactorEvaluation";
import { QualityAspectEvaluationFunction } from "./quamoco/QualityAspectEvaluation";
import { ProductFactor } from "./quamoco/ProductFactor";

const average: (list: number[]) => number = list => {
    return list.reduce((e1, e2) => e1 + e2, 0) / list.length
}

const measureImplementations: { [measureKey: string]: Calculation } = {
    "serviceReplicationLevel": (system) => {
        return average([...system.getComponentEntities.entries()]
            .map(entry => entry[1])
            .filter(entity => entity.constructor.name === Service.name)
            .map(service => service.getProperties()
                .find(prop => prop.getKey === "replicas").value)
            );
    },
    "externallyAvailableEndpoints": (system) => {
        return [...system.getComponentEntities.entries()].map(entry => entry[1].getExternalEndpointEntities.length).reduce((e1, e2) => e1 + e2, 0);
    }
}

const productFactorEvaluationImplementation: {
    [factorKey: string]: ProductFactorEvaluationFunction
} = {
    "serviceReplication": (factor: ProductFactor, system: System) => {
        let serviceReplicationLevel = factor.getMeasure("serviceReplicationLevel").calculate(system) as number;  //TODO better solution??
        if (serviceReplicationLevel <= 1) {
            return "none";
        } else if (serviceReplicationLevel > 1 && serviceReplicationLevel < 3) {
            return "low";
        } else {
            return "high";
        }
    }
};

const qualityAspectEvaluationImplementation: {
    [aspectKey: string]: QualityAspectEvaluationFunction
} = {

};

export { measureImplementations, productFactorEvaluationImplementation, qualityAspectEvaluationImplementation }