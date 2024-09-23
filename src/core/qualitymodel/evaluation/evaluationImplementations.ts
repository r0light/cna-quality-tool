import { ProductFactor } from "../quamoco/ProductFactor";
import { data } from "jquery";
import { FactorEvaluationFunction, ImpactWeight } from "./Evaluation";
import { ProductFactorKey, qualityModel, QualityModelSpec } from "../specifications/qualitymodel";

const average: (list: number[]) => number = list => {
    return list.reduce((e1, e2) => e1 + e2, 0) / list.length
}

const generalEvaluationImplementation: {
    [evaluationKey: string]: FactorEvaluationFunction
} = {
    "aggregateImpacts": (parameters) => {
        let aggregateResult: ImpactWeight[] = parameters.incomingImpacts.map(impact => impact.weight);

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
            switch (result) {
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
    [factorKey in ProductFactorKey]?: FactorEvaluationFunction
} = {
    "serviceReplication": (parameters) => {
        let serviceReplicationLevel = parameters.calculatedMeasures.get("serviceReplicationLevel").value;
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
    "horizontalDataReplication": (parameters) => {
        let storageReplicationLevel = parameters.calculatedMeasures.get("storageReplicationLevel").value;
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
    "shardedDataStoreReplication": (parameters) => {
        let dataShardingLevel = parameters.calculatedMeasures.get("dataShardingLevel").value;
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
    [aspectKey: string]: FactorEvaluationFunction
} = {

};

export { generalEvaluationImplementation, productFactorEvaluationImplementation, qualityAspectEvaluationImplementation }