import { ProductFactor } from "../quamoco/ProductFactor";
import { CalculatedMeasure, EvaluatedProductFactor, FactorEvaluationFunction, ForwardImpactingPath } from "./Evaluation";

class ProductFactorEvaluation {

    #evaluatedFactor: ProductFactor;
    #evaluationId: string;
    #evaluate: FactorEvaluationFunction;
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

    addEvaluation(evaluationFunction: FactorEvaluationFunction) {
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


        return this.#evaluate({factor: this.#evaluatedFactor, incomingImpacts: impacts, calculatedMeasures: calculatedMeasures, evaluatedProductFactors: evaluatedProductFactors});
    }
}

export { ProductFactorEvaluation }