import { QualityAspect } from "../quamoco/QualityAspect";
import { EvaluatedProductFactor, ForwardImpactingPath, QualityAspectEvaluationResult } from "./EvaluatedSystemModel";

type QualityAspectEvaluationFunction = (factor: QualityAspect, incomingImpacts: ForwardImpactingPath[], evaluatedProductFactors: Map<string, EvaluatedProductFactor>) => QualityAspectEvaluationResult;

class QualityAspectEvaluation {

    #evaluatedAspect: QualityAspect;
    #evaluationId: string;
    #evaluate: QualityAspectEvaluationFunction;
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

    addEvaluation(evaluationFunction: QualityAspectEvaluationFunction) {
        this.#evaluate = evaluationFunction;
    }

    evaluate(evaluatedProductFactors: Map<string, EvaluatedProductFactor>) {

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


        return this.#evaluate(this.#evaluatedAspect, impacts, evaluatedProductFactors);
    }
}

export { QualityAspectEvaluation, QualityAspectEvaluationFunction}