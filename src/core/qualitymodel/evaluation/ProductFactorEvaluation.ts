import { System } from "@/core/entities";
import { ProductFactor } from "../quamoco/ProductFactor";
import { CalculatedMeasure, EvaluatedProductFactor, ProductFactorEvaluationResult } from "./EvaluatedSystemModel";


type ProductFactorEvaluationFunction = (factor: ProductFactor, calculatedMeasures: Map<string, CalculatedMeasure>, evaluatedProductFactors: Map<string, EvaluatedProductFactor>) => ProductFactorEvaluationResult;

class ProductFactorEvaluation {

    #evaluatedFactor: ProductFactor;
    #evaluationId: string;
    #evaluate: ProductFactorEvaluationFunction;
    #reasoning: string;

    constructor(evaluatedFactor: ProductFactor, evaluationId: string, reasoning: string) {
        this.#evaluatedFactor = evaluatedFactor;
        this.#evaluationId = evaluationId;
        this.#reasoning = reasoning;
    }

    get getEvaluatedFactor() {
        return this.#evaluatedFactor;
    }

    get getEvaluationId() {
        return this.#evaluationId;
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

export { ProductFactorEvaluation, ProductFactorEvaluationFunction }