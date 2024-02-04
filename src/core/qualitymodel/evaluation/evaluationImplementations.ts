import { ProductFactorEvaluationFunction } from "./ProductFactorEvaluation";
import { QualityAspectEvaluationFunction } from "./QualityAspectEvaluation";
import { ProductFactor } from "../quamoco/ProductFactor";
import { CalculatedMeasure, EvaluatedProductFactor } from "./EvaluatedSystemModel";


const productFactorEvaluationImplementation: {
    [factorKey: string]: ProductFactorEvaluationFunction
} = {
    "serviceReplication": (factor: ProductFactor, calculatedMeasures: Map<string, CalculatedMeasure>, evaluatedProductFactors: Map<string, EvaluatedProductFactor>) => {
        let serviceReplicationLevel = calculatedMeasures.get("serviceReplicationLevel").value;
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
    },
    "horizontalDataReplication": (factor, calculatedMeasures, evaluatedProductFactors) => {
        let storageReplicationLevel = calculatedMeasures.get("storageReplicationLevel").value;
        if (storageReplicationLevel === "n/a") {
            return "n/a";
        } else if (typeof storageReplicationLevel === "number") {
            if (storageReplicationLevel <= 1) {
                return "none";
            } else if (storageReplicationLevel > 1 && storageReplicationLevel < 3) {
                return "low";
            } else {
                return "high";
            }
        } else {
            throw new Error(`storageReplicationLevel is of type ${typeof storageReplicationLevel}, but should be of type number`);
        }
    },
    "replication": (factor: ProductFactor, calculatedMeasures: Map<string, CalculatedMeasure>, evaluatedProductFactors: Map<string, EvaluatedProductFactor>) => {
        // TODO integrate all impacting factors
        if (evaluatedProductFactors.has("serviceReplication")) {
            return evaluatedProductFactors.get("serviceReplication").result;
        } else {
            return "n/a";
        }
    }
};

const qualityAspectEvaluationImplementation: {
    [aspectKey: string]: QualityAspectEvaluationFunction
} = {

};

export { productFactorEvaluationImplementation, qualityAspectEvaluationImplementation }