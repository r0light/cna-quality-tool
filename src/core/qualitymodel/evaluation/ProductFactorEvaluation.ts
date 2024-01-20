import { System } from "@/core/entities";
import { ProductFactor } from "../quamoco/ProductFactor";
import { CalculatedMeasure, EvaluatedProductFactor } from "./EvaluatedSystemModel";

type NumericResult = number;
type OrdinalResult = "none" | "low" | "high";
type ProductFactorEvaluationResult = NumericResult | OrdinalResult | "n/a";

type ProductFactorEvaluationFunction = (factor: ProductFactor, calculatedMeasures: Map<string, CalculatedMeasure>, evaluatedProductFactors: Map<string, EvaluatedProductFactor>) => ProductFactorEvaluationResult;

class ProductFactorEvaluation {

    #evaluatedFactor: ProductFactor;
    #evaluate: ProductFactorEvaluationFunction;
    #reasoning: string;

    constructor(evaluatedFactor: ProductFactor, reasoning: string) {
        this.#evaluatedFactor = evaluatedFactor;
        this.#reasoning = reasoning;
    }

    get getEvaluatedFactor() {
        return this.#evaluatedFactor;
    }

    get getReasoning() {
        return this.#reasoning;
    }

    addEvaluation(evaluationFunction: ProductFactorEvaluationFunction) {
        this.#evaluate = evaluationFunction;
    }

    evaluate(calculatedMeasures: Map<string, CalculatedMeasure>, evaluatedProductFactors: Map<string, EvaluatedProductFactor>) {
        return this.#evaluate(this.#evaluatedFactor, calculatedMeasures, evaluatedProductFactors);
    }
}

export { ProductFactorEvaluation, ProductFactorEvaluationResult, ProductFactorEvaluationFunction }