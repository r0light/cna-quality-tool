import { System } from "@/core/entities";
import { ProductFactor } from "./ProductFactor";

type NumericResult = number;
type OrdinalResult = "none" | "low" | "high";
type ProductFactorEvaluationResult = NumericResult | OrdinalResult;

type ProductFactorEvaluationFunction = (factor: ProductFactor, system: System) => ProductFactorEvaluationResult;

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

    evaluate(system: System) {
        return this.#evaluate(this.#evaluatedFactor, system);
    }
}

export { ProductFactorEvaluation, ProductFactorEvaluationResult, ProductFactorEvaluationFunction }