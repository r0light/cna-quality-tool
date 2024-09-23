import { ProductFactor } from "../quamoco/ProductFactor";
import { QualityAspect } from "../quamoco/QualityAspect";
import { EvaluationPrecondition, IncomingImpactsInterpretation } from "../specifications/qualitymodel";
import { CalculatedMeasure, EvaluatedProductFactor, FactorEvaluationFunction, ForwardImpactingPath } from "./Evaluation";

class FactorEvaluation {

    #evaluatedFactor: ProductFactor | QualityAspect;
    #evaluationId: string;
    #evaluate: FactorEvaluationFunction;
    #reasoning: string;    
    #precondition: EvaluationPrecondition;
    #impactsInterpretation: IncomingImpactsInterpretation;
    #customImpactInterpretation: (impactWeights: number[]) => number;

    constructor(evaluatedFactor: ProductFactor | QualityAspect, evaluationId: string, reasoning: string, precondition: EvaluationPrecondition, impactsInterpretation: IncomingImpactsInterpretation, customImpactInterpretation: (impactWeights: number[]) => number) {
        this.#evaluatedFactor = evaluatedFactor;
        this.#evaluationId = evaluationId;
        this.#reasoning = reasoning;
        this.#precondition = precondition;
        this.#impactsInterpretation = impactsInterpretation;
        this.#customImpactInterpretation = customImpactInterpretation;
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

    get getPrecondition() {
        return this.#precondition;
    }

    get getImpactsInterpretation() {
        return this.#impactsInterpretation;
    }

    get getCustomImpactInterpretation() {
        return this.#customImpactInterpretation;
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

        return this.#evaluate({factor: this.#evaluatedFactor, 
            incomingImpacts: impacts, 
            precondition: this.#precondition, 
            impactsInterpretation: this.#impactsInterpretation, 
            calculatedMeasures: calculatedMeasures, 
            evaluatedProductFactors: evaluatedProductFactors,
            customImpactInterpretation: this.#customImpactInterpretation});
    }
}

export { FactorEvaluation }