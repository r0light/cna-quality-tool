import { QualityAspect } from "../quamoco/QualityAspect";

type QualityAspectEvaluationResult = string //TODO what to do here?

type QualityAspectEvaluationFunction = (factor: QualityAspect) => QualityAspectEvaluationResult;

class QualityAspectEvaluation {

    #evaluatedFactor: QualityAspect;
    #evaluate: QualityAspectEvaluationFunction;
    #reasoning: string;

    constructor(evaluatedFactor: QualityAspect, reasoning: string) {
        this.#evaluatedFactor = evaluatedFactor;
        this.#reasoning = reasoning;
    }

    get getEvaluatedFactor() {
        return this.#evaluatedFactor;
    }

    get getReasoning() {
        return this.#reasoning;
    }

    addEvaluation(evaluationFunction: QualityAspectEvaluationFunction) {
        this.#evaluate = evaluationFunction;
    }

    evaluate() {
        return this.#evaluate(this.#evaluatedFactor);
    }
}

export { QualityAspectEvaluation, QualityAspectEvaluationResult, QualityAspectEvaluationFunction}