import { ProductFactor } from "../quamoco/ProductFactor";
import { CalculatedMeasure, EvaluatedProductFactor, ForwardImpactingPath, ProductFactorEvaluationResult } from "./EvaluationTypes";


type ProductFactorEvaluationFunction = (factor: ProductFactor, incomingImpacts: ForwardImpactingPath[], calculatedMeasures: Map<string, CalculatedMeasure>, evaluatedProductFactors: Map<string, EvaluatedProductFactor>) => ProductFactorEvaluationResult;

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

        let impacts: ForwardImpactingPath[] = [];

        for (const impactingFactor of this.#evaluatedFactor.getImpactingFactors()) {
            let evaluatedImpactingFactor = evaluatedProductFactors.get(impactingFactor.getId)
            if (evaluatedImpactingFactor) {
                let impact = evaluatedImpactingFactor.forwardImpacts.find(impact => impact.impactedFactorKey === this.#evaluatedFactor.getId);
                if (impact) {
                    impacts.push(impact);
                }
            }
        }


        return this.#evaluate(this.#evaluatedFactor, impacts, calculatedMeasures, evaluatedProductFactors);
    }
}

export { ProductFactorEvaluation, ProductFactorEvaluationFunction }