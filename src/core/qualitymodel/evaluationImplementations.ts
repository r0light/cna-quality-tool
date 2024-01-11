import { ProductFactorEvaluationFunction } from "./quamoco/ProductFactorEvaluation";
import { QualityAspectEvaluationFunction } from "./quamoco/QualityAspectEvaluation";
import { ProductFactor } from "./quamoco/ProductFactor";
import { System } from "../entities";


const productFactorEvaluationImplementation: {
    [factorKey: string]: ProductFactorEvaluationFunction
} = {
    "serviceReplication": (factor: ProductFactor, system: System) => {
        let serviceReplicationLevel = factor.getMeasure("serviceReplicationLevel").calculate(system);
        if (serviceReplicationLevel === "n/a") {
            return "n/a";
        } else if (typeof serviceReplicationLevel === "number") {
            if (serviceReplicationLevel <= 1) {
                return "none";
            } else if (serviceReplicationLevel > 1 && serviceReplicationLevel < 3) {
                return "low";
            } else {
                return "high";
            }
        } else {
            throw new Error(`serviceReplicationLevel is of type ${typeof serviceReplicationLevel}, but should be of type number`);
        }
    }
};

const qualityAspectEvaluationImplementation: {
    [aspectKey: string]: QualityAspectEvaluationFunction
} = {

};

export { productFactorEvaluationImplementation, qualityAspectEvaluationImplementation }