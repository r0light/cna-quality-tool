import { ImpactType } from "../quamoco/Impact";
import { MeasureValue } from "../quamoco/Measure";
import { ProductFactor } from "../quamoco/ProductFactor";
import { QualityAspect } from "../quamoco/QualityAspect";
import { ENTITIES } from "../specifications/entities";

export type CalculatedMeasure = {
    name: string,
    type: "system" | "component" | "componentPair" | "infrastructure" | "requestTrace",
    entity: `${ENTITIES}`,
    value: MeasureValue,
    description: string
}

export type NumericEvaluationResult = number;
export type OrdinalEvaluationResult = "none" | "low" | "moderate" | "high";
export type AggregateResult = { tendency: string, impacts: string[] };
export type FactorEvaluationResult = NumericEvaluationResult | OrdinalEvaluationResult | "n/a" | AggregateResult;

export type ImpactWeight = "negative" | "slightly negative" | "neutral" | "slightly positive" | "positive" | "n/a";

export type EvaluatedProductFactor = {
    id: string,
    name: string,
    factorType: 'productFactor', //TODO has to be "productFactor"
    productFactor: ProductFactor,
    result: FactorEvaluationResult, 
    measures: Map<string, CalculatedMeasure>,
    forwardImpacts: ForwardImpactingPath[],
    backwardImpacts: BackwardImpactingPath[]
}

export type EvaluatedQualityAspect = {
    id: string,
    name: string,
    factorType: 'qualityAspect',  //TODO has to be "qualityAspect"
    qualityAspect: QualityAspect,
    result: FactorEvaluationResult,
    backwardImpacts: BackwardImpactingPath[]
}

export type ForwardImpactingPath = {
    impactedFactorKey: string,
    impactedFactorName: string,
    impactType: ImpactType,
    weight: ImpactWeight,
    impactedFactor?: EvaluatedProductFactor | EvaluatedQualityAspect
}

export type BackwardImpactingPath = {
    impactingFactorKey: string,
    impactingFactorName: string,
    impactType: ImpactType,
    weight: ImpactWeight,
    impactingFactor: EvaluatedProductFactor
}

export type FactorEvaluationParameters = {
    factor: ProductFactor | QualityAspect, 
    incomingImpacts: ForwardImpactingPath[], 
    calculatedMeasures: Map<string, CalculatedMeasure>, 
    evaluatedProductFactors: Map<string, EvaluatedProductFactor>
}

export type FactorEvaluationFunction = (parameters: FactorEvaluationParameters) => FactorEvaluationResult;


// TODO: how to specify this and where to put it?
export function deriveImpactWeight(evaluationResult: FactorEvaluationResult, impactType: ImpactType): ImpactWeight {
    if (evaluationResult === "n/a") {
        return "n/a";
    }
    if (typeof evaluationResult === "string") {
        switch (evaluationResult) {
            case "none":
                return "neutral";
            case "low":
                if (impactType === "+" || impactType === "++") {
                    return "slightly positive";
                } else if (impactType === "--" || impactType === "-") {
                    return "slightly negative";
                }
                break;
            case "high":
                if (impactType === "+" || impactType === "++") {
                    return "positive";
                } else if (impactType === "--" || impactType === "-") {
                    return "negative";
                }
                break;
        }
    } else if (typeof evaluationResult === "number") {
        if (evaluationResult === 0) {
            return "neutral";
        }

        if (evaluationResult > 0 && evaluationResult < 0.5) {
            if (impactType === "+" || impactType === "++") {
                return "slightly positive";
            } else if (impactType === "--" || impactType === "-") {
                return "slightly negative";
            }
        }

        if (evaluationResult >= 0.5 && evaluationResult <= 1) {
            if (impactType === "+" || impactType === "++") {
                return "positive";
            } else if (impactType === "--" || impactType === "-") {
                return "negative";
            }
        }

        // else
        throw new Error("A numeric evaluation result for a product factor should be between 0 and 1, here it is: " + evaluationResult);
    } else if (evaluationResult.tendency && evaluationResult.impacts) {
        switch (evaluationResult.tendency) {
            case "positive":
                return "slightly positive" //TODO more specific
            case "neutral":
                return "neutral"
            case "negative":
                return "slightly negative"
            case "n/a":
            default:
                return "n/a";
        }
    }
}
