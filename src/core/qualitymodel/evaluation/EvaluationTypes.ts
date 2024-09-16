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
export type OrdinalEvaluationResult = "none" | "low" | "high";
export type AggregateResult = { tendency: string, impacts: string[] };
export type ProductFactorEvaluationResult = NumericEvaluationResult | OrdinalEvaluationResult | "n/a" | AggregateResult;
export type QualityAspectEvaluationResult = NumericEvaluationResult | OrdinalEvaluationResult | "n/a" | AggregateResult;

export type ImpactWeight = "negative" | "slightly negative" | "neutral" | "slightly positive" | "positive" | "n/a";

export type EvaluatedProductFactor = {
    id: string,
    name: string,
    factorType: 'productFactor', //TODO has to be "productFactor"
    productFactor: ProductFactor,
    result: ProductFactorEvaluationResult, 
    measures: Map<string, CalculatedMeasure>,
    forwardImpacts: ForwardImpactingPath[],
    backwardImpacts: BackwardImpactingPath[]
}

export type EvaluatedQualityAspect = {
    id: string,
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