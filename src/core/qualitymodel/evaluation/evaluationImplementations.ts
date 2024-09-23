import { FactorEvaluationFunction, FactorEvaluationParameters, ImpactWeight, impactWeightNumericMapping, interpretNumericalResultAsFactorEvaluation } from "./Evaluation";
import { ProductFactorKey } from "../specifications/qualitymodel";

const mean: (list: number[]) => number = list => {
    return list.reduce((e1, e2) => e1 + e2, 0) / list.length
}
const median = (arr: number[]): number | undefined => {
    if (!arr.length) return undefined;
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : ((s[mid - 1] + s[mid]) / 2);
  };
const lowest: (list: number[]) => number = list => { return Math.min(...list)}
const highest: (list: number[]) => number = list => { return Math.max(...list)} 


const generalEvaluationImplementation: {
    [evaluationKey: string]: FactorEvaluationFunction
} = {
    "aggregateImpacts": (parameters) => {
        let aggregateResult: ImpactWeight[] = parameters.incomingImpacts.map(impact => impact.weight);

        if (aggregateResult.length === 0) {
            return "n/a";
        }

        let valuedImpacts = aggregateResult.filter(result => result !== "n/a");
        let numberOfValuedImpacts = valuedImpacts.length;

        // if there is no valued impact, directly return 
        if (numberOfValuedImpacts === 0) {
            return "n/a";
        }

        // if precondition is all, all incoming impacts need to have a value
        if (parameters.precondition === "all" && numberOfValuedImpacts < aggregateResult.length) {
            return "n/a";
        }

        // if precondition is majority, a majority needs to be valued
        if (parameters.precondition === "majority" && numberOfValuedImpacts < Math.ceil(aggregateResult.length / 2)) {
            return "n/a";
        }

        let numericalImpacts = valuedImpacts.map(impact => impactWeightNumericMapping(impact));

        // else: precondition is at-least-one
        let numericalResult = ((parameters: FactorEvaluationParameters) => { 
            switch(parameters.impactsInterpretation) {
            case "highest":
                return highest(numericalImpacts);
            case "lowest":
                return lowest(numericalImpacts);
            case "mean":
                return mean(numericalImpacts);
            case "median":
                return median(numericalImpacts);
            case "custom":
                return parameters.customImpactInterpretation(numericalImpacts);
            default:
                throw new Error("Unknown impacts interpretation: " + parameters.impactsInterpretation);
        }})(parameters);

        return interpretNumericalResultAsFactorEvaluation(numericalResult);
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
            } else if (serviceReplicationLevel > 1 && serviceReplicationLevel < 1.5) {
                return "low";
            } else if (serviceReplicationLevel >= 1.5 && serviceReplicationLevel < 3) {
                return "moderate";
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
            } else if (storageReplicationLevel > 1 && storageReplicationLevel < 1.5) {
                return "low";
            } else if (storageReplicationLevel >= 1.5 && storageReplicationLevel < 3) {
                return "moderate";
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
            } else if (dataShardingLevel > 1 && dataShardingLevel < 1.5) {
                return "low";
            } else if (dataShardingLevel >= 1.5 && dataShardingLevel < 3) {
                return "moderate";
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