import { QualityAspect } from "../quamoco/QualityAspect";
import { CalculatedMeasure, EvaluatedProductFactor, FactorEvaluationFunction, ForwardImpactingPath } from "./Evaluation";

class QualityAspectEvaluation {

    #evaluatedAspect: QualityAspect;
    #evaluationId: string;
    #evaluate: FactorEvaluationFunction;
    #reasoning: string;

    constructor(evaluatedFactor: QualityAspect, evaluationId: string,  reasoning: string) {
        this.#evaluatedAspect = evaluatedFactor;
        this.#evaluationId = evaluationId;
        this.#reasoning = reasoning;
    }

    get getEvaluatedFactor() {
        return this.#evaluatedAspect;
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

        for (const impactingFactor of this.#evaluatedAspect.getImpactingFactors()) {
            let evaluatedImpactingFactor = evaluatedProductFactors.get(impactingFactor.getId)
            if (evaluatedImpactingFactor) {
                let impact = evaluatedImpactingFactor.forwardImpacts.find(impact => impact.impactedFactorKey === this.#evaluatedAspect.getId);
                if (impact) {
                    impacts.push(impact);
                }
            }
        }


        return this.#evaluate({factor: this.#evaluatedAspect, incomingImpacts: impacts, calculatedMeasures: calculatedMeasures, evaluatedProductFactors: evaluatedProductFactors});
    }
}

export { QualityAspectEvaluation }