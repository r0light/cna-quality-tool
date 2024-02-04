import { ProductFactorEvaluationFunction } from "./ProductFactorEvaluation";
import { QualityAspectEvaluationFunction } from "./QualityAspectEvaluation";
import { ProductFactor } from "../quamoco/ProductFactor";
import { CalculatedMeasure, EvaluatedProductFactor } from "./EvaluatedSystemModel";


const productFactorEvaluationImplementation: {
    [factorKey: string]: ProductFactorEvaluationFunction
} = {
    "serviceReplication": (factor , incomingPaths, calculatedMeasures, evaluatedProductFactors) => {
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
    "horizontalDataReplication": (factor, incomingPaths, calculatedMeasures, evaluatedProductFactors) => {
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
    "replication": (factor, incomingPaths, calculatedMeasures, evaluatedProductFactors) => {
        // TODO integrate all impacting factors
        let aggregateResult: string[] = incomingPaths.map(impact => impact.weight);
        
        if (aggregateResult.length === 0) {
            return "n/a";
        } else {
            return aggregateResult;
        }
    }
};

const qualityAspectEvaluationImplementation: {
    [aspectKey: string]: QualityAspectEvaluationFunction
} = {

};

export { productFactorEvaluationImplementation, qualityAspectEvaluationImplementation }