import { ImpactType } from "../quamoco/Impact";
import { MeasureValue } from "../quamoco/Measure";
import { ProductFactor } from "../quamoco/ProductFactor";
import { QualityAspect } from "../quamoco/QualityAspect";
import { ENTITIES } from "../specifications/entities";
import { EvaluationPrecondition, IncomingImpactsInterpretation, MeasureKey, ProductFactorKey, QualityAspectKey } from "../specifications/qualitymodel";

export type CalculatedMeasure = {
    name: string,
    entity: `${ENTITIES}`,
    value: MeasureValue,
    description: string
}

export type NumericEvaluationResult = number;
export type OrdinalEvaluationResult = "none" | "low" | "moderate" | "high";
export type FactorEvaluationResult = NumericEvaluationResult | OrdinalEvaluationResult | "n/a"
export type QualityAspectEvaluationResult = "negative" | "slightly negative" | "mixed"| "neutral" | "slightly positive" | "positive" | "n/a";

export type ImpactWeight = "negative" | "slightly negative" | "neutral" | "slightly positive" | "positive" | "n/a";

export type EvaluatedProductFactor = {
    id: ProductFactorKey,
    name: string,
    factorType: 'productFactor', //TODO has to be "productFactor"
    productFactor: ProductFactor,
    result: FactorEvaluationResult, 
    evaluationReasoning: string,
	measuresForEvaluation: Map<string, CalculatedMeasure>,
    otherMeasures: Map<string, CalculatedMeasure>,
    forwardImpacts: ForwardImpactingPath[],
    backwardImpacts: BackwardImpactingPath[]
}

export type EvaluatedQualityAspect = {
    id: QualityAspectKey,
    name: string,
    factorType: 'qualityAspect',  //TODO has to be "qualityAspect"
    qualityAspect: QualityAspect,
    result: QualityAspectEvaluationResult,
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
    precondition: EvaluationPrecondition,
    impactsInterpretation: IncomingImpactsInterpretation,
    customImpactInterpretation: (impactWeights: number[]) => number,
    calculatedMeasures: Map<MeasureKey, CalculatedMeasure>, 
    evaluatedProductFactors: Map<string, EvaluatedProductFactor>
}

export type FactorEvaluationFunction = (parameters: FactorEvaluationParameters) => FactorEvaluationResult;
export type AspectEvaluationFunction = (parameters: FactorEvaluationParameters) => QualityAspectEvaluationResult;

export function impactWeightNumericMapping(ordinalWeight: ImpactWeight) {
    switch (ordinalWeight) {
        case "negative": return -1;
        case "slightly negative": return -0.5;
        case "neutral": return 0;
        case "slightly positive": return 0.5;
        case "positive": return 1;
        default:
        case "n/a": 
            return NaN;
    }
}

export function interpretNumericValueAsOutcome(value: number): QualityAspectEvaluationResult {
    if (isNaN(value)) {
        return "n/a";
    }
    if (value < -0.5) {
        return "negative";
    }
    if (value < 0 ){
        return "slightly negative";
    }
    if (value === 0) {
        return "neutral"
    }
    if (value < 0.5) {
        return "slightly positive";
    } else {
        return "positive";
    }
}

export function interpretNumericalResultAsFactorEvaluation(result: number): OrdinalEvaluationResult {
    if (result <= 0) {
        return "none";
    } else {
        return linearNumericalMapping(result);
    }
}

const ONE_THIRD = 1/3;
const TWO_THIRD = 2/3;

export function linearNumericalMapping(result: NumericEvaluationResult): OrdinalEvaluationResult {
    if (Number.isNaN(result) || result === 0) {
        return "none";
    }
    if (result > 0 && result < ONE_THIRD) {
        return "low";
    }
    if (result >= ONE_THIRD && result < TWO_THIRD) {
        return "moderate";
    }
    if (result >= TWO_THIRD && result <= 1) {
        return "high";
    }
    // else
    throw new Error("A numeric evaluation result for a product factor should be between 0 and 1, here it is: " + result);
}

const EXPONENTIAL_ONE_THIRD = Math.pow(ONE_THIRD, 2);
const EXPONENTIAL_TWO_THIRD = Math.pow(TWO_THIRD, 2);

export function exponentialNumericalMapping(result: NumericEvaluationResult): OrdinalEvaluationResult {
    if (Number.isNaN(result) || result === 0) {
        return "none";
    }
    if (result > 0 && result < EXPONENTIAL_ONE_THIRD) {
        return "low";
    }
    if (result >= EXPONENTIAL_ONE_THIRD && result < EXPONENTIAL_TWO_THIRD) {
        return "moderate";
    }
    if (result >= EXPONENTIAL_TWO_THIRD && result <= 1) {
        return "high";
    }
    // else
    throw new Error("A numeric evaluation result for a product factor should be between 0 and 1, here it is: " + result);
}

const ROOTED_ONE_THIRD = Math.sqrt(ONE_THIRD);
const ROOTED_TWO_THIRD = Math.sqrt(TWO_THIRD);

export function squareRootedNumericalMapping(result: NumericEvaluationResult): OrdinalEvaluationResult {
    if (Number.isNaN(result) || result === 0) {
        return "none";
    }
    if (result > 0 && result < ROOTED_ONE_THIRD) {
        return "low";
    }
    if (result >= ROOTED_ONE_THIRD && result < ROOTED_TWO_THIRD) {
        return "moderate";
    }
    if (result >= ROOTED_TWO_THIRD && result <= 1) {
        return "high";
    }
    // else
    throw new Error("A numeric evaluation result for a product factor should be between 0 and 1, here it is: " + result);
}


function defaultFactorImpactMapping(evaluationResult: FactorEvaluationResult, impactType: ImpactType) {
    if (evaluationResult === "n/a") {
        return "n/a";
    }

    let ordinalResult = typeof evaluationResult === "string" ? evaluationResult : linearNumericalMapping(evaluationResult);

    if (impactType === "positive") {
        switch (ordinalResult) {
            case "none":
            case "low":
                return "neutral";
            case "moderate":
                return "slightly positive";
            case "high":
                return "positive";
        }
    } else if (impactType === "negative") {
        switch (ordinalResult) {
            case "none":
            case "low":
                return "neutral";
            case "moderate":
                return "slightly negative";
            case "high":
                return "negative";
        }
    } else {
        throw new Error("Unknown impactType: "  + impactType);
    }
}   


export function deriveImpactWeight(evaluationResult: FactorEvaluationResult, impactType: ImpactType): ImpactWeight {
    // for now, only use the default mapping, maybe enable other mappings and a configuration later
    // (such as impact only if moderate or already "strong" impact for moderate evaluation)
    return defaultFactorImpactMapping(evaluationResult, impactType);
}
