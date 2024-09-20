import { ProductFactorEvaluationFunction } from "./ProductFactorEvaluation";
import { QualityAspectEvaluationFunction } from "./QualityAspectEvaluation";
import { ProductFactor } from "../quamoco/ProductFactor";
import { data } from "jquery";
import { ImpactWeight } from "./EvaluationTypes";
import { ProductFactorKey, qualityModel, QualityModelSpec } from "../specifications/qualitymodel";

const average: (list: number[]) => number = list => {
    return list.reduce((e1, e2) => e1 + e2, 0) / list.length
}

const generalEvaluationImplementation: {
    [evaluationKey: string]: ProductFactorEvaluationFunction | QualityAspectEvaluationFunction
} = {
    "aggregateImpacts": (factor, incomingPaths, calculatedMeasures, evaluatedProductFactors) => {
        let aggregateResult: ImpactWeight[] = incomingPaths.map(impact => impact.weight);
        
        if (aggregateResult.length === 0) {
            return "n/a";
        }

        if (aggregateResult.every(result => result === "n/a")) {
            return {
                tendency: "n/a",
                impacts: aggregateResult
            }
        }

        let averageValue = average(aggregateResult.filter(result => result !== "n/a").map(result => {
            switch(result) {
                case "negative": return -2;
                case "slightly negative": return -1;
                case "neutral": return 0;
                case "slightly positive": return 1;
                case "positive": return 2;
            }
        }))

        let tendency = ((averageValue) => {
            if (averageValue < 0) {
                return "negative";
            } else if (averageValue === 0) {
                return "neutral";
            } else {
                return "positive";
            }
        })(averageValue);

        return {
            tendency: tendency,
            impacts: aggregateResult
        }
    }
}   

const productFactorEvaluationImplementation: {
    [ factorKey in ProductFactorKey ]?: ProductFactorEvaluationFunction
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
    "shardedDataStoreReplication": (factor, incomingPaths, calculatedMeasures, evaluatedProductFactors) => {
        let dataShardingLevel = calculatedMeasures.get("dataShardingLevel").value;
        if (dataShardingLevel === "n/a") {
            return "n/a";
        } else if (typeof dataShardingLevel === "number") {
            if (dataShardingLevel <= 1) {
                return "none";
            } else if (dataShardingLevel > 1 && dataShardingLevel < 10) {
                return "low";
            } else {
                return "high";
            }
        } else {
            throw new Error(`dataShardingLevel is of type ${typeof dataShardingLevel}, but should be of type number`);
        }
    }
};

const qualityAspectEvaluationImplementation: {
    [aspectKey: string]: QualityAspectEvaluationFunction
} = {
    "aggregateImpacts": (factor, incomingPaths, evaluatedProductFactors) => {

        let aggregateResult: ImpactWeight[] = incomingPaths.map(impact => impact.weight);
        
        if (aggregateResult.length === 0) {
            return "n/a";
        }

        if (aggregateResult.every(result => result === "n/a")) {
            return {
                tendency: "n/a",
                impacts: aggregateResult
            }
        }

        let averageValue = average(aggregateResult.filter(result => result !== "n/a").map(result => {
            switch(result) {
                case "negative": return -2;
                case "slightly negative": return -1;
                case "neutral": return 0;
                case "slightly positive": return 1;
                case "positive": return 2;
            }
        }))

        let tendency = ((averageValue) => {
            if (averageValue < 0) {
                return "negative";
            } else if (averageValue === 0) {
                return "neutral";
            } else {
                return "positive";
            }
        })(averageValue);

        return {
            tendency: tendency,
            impacts: aggregateResult
        }
    }
};

export { generalEvaluationImplementation, productFactorEvaluationImplementation, qualityAspectEvaluationImplementation }