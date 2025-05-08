import { Measure } from "../quamoco/Measure";
import { ProductFactor } from "../quamoco/ProductFactor";
import { QualityAspect } from "../quamoco/QualityAspect";
import { EvaluationPrecondition, IncomingImpactsInterpretation, MeasureKey, ProductFactorKey } from "../specifications/qualitymodel";
import { AspectEvaluationFunction, CalculatedMeasure, EvaluatedProductFactor, FactorEvaluationFunction, ForwardImpactingPath } from "./Evaluation";



class ProductFactorEvaluation {

    #evaluatedFactor: ProductFactor;
    #evaluationDetails: EvaluationDetails;
    #evaluate: FactorEvaluationFunction;

    constructor(evaluatedFactor: ProductFactor, evaluationDetails: EvaluationDetails) {
        this.#evaluatedFactor = evaluatedFactor;
        this.#evaluationDetails = evaluationDetails;
    }

    get getEvaluatedFactor() {
        return this.#evaluatedFactor;
    }

    get getEvaluationDetails() {
        return this.#evaluationDetails;
    }

    addEvaluation(evaluationFunction: FactorEvaluationFunction) {
        this.#evaluate = evaluationFunction;
    }
    
    evaluate(calculatedMeasures: Map<MeasureKey, CalculatedMeasure>, evaluatedProductFactors: Map<ProductFactorKey, EvaluatedProductFactor>) {

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
            precondition: this.#evaluationDetails.getPrecondition, 
            impactsInterpretation: this.#evaluationDetails.getImpactsInterpretation, 
            calculatedMeasures: calculatedMeasures, 
            evaluatedProductFactors: evaluatedProductFactors,
            customImpactInterpretation: this.#evaluationDetails.getCustomImpactInterpretation});
    }
}

class QualityAspectEvaluation {

    #evaluatedAspect: QualityAspect;
    #evaluationDetails: EvaluationDetails;
    #evaluate: AspectEvaluationFunction;

    constructor(evaluatedAspect: QualityAspect, evaluationDetails: EvaluationDetails) {
        this.#evaluatedAspect = evaluatedAspect;
        this.#evaluationDetails = evaluationDetails;
    }

    get getEvaluatedAspect() {
        return this.#evaluatedAspect;
    }

    get getEvaluationDetails() {
        return this.#evaluationDetails;
    }

    addEvaluation(evaluationFunction: AspectEvaluationFunction) {
        this.#evaluate = evaluationFunction;
    }
    
    evaluate(calculatedMeasures: Map<MeasureKey, CalculatedMeasure>, evaluatedProductFactors: Map<ProductFactorKey, EvaluatedProductFactor>) {

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

        return this.#evaluate({factor: this.#evaluatedAspect, 
            incomingImpacts: impacts, 
            precondition: this.#evaluationDetails.getPrecondition, 
            impactsInterpretation: this.#evaluationDetails.getImpactsInterpretation, 
            calculatedMeasures: calculatedMeasures, 
            evaluatedProductFactors: evaluatedProductFactors,
            customImpactInterpretation: this.#evaluationDetails.getCustomImpactInterpretation});
    }
}

class EvaluationDetails {
    
    #evaluationId: string;
    #reasoning: string;    
    #usedMeasures: Measure[];
    #precondition: EvaluationPrecondition;
    #impactsInterpretation: IncomingImpactsInterpretation;
    #customImpactInterpretation: (impactWeights: number[]) => number;

    constructor(evaluationId: string, reasoning: string, usedMeasures: Measure[], precondition: EvaluationPrecondition, impactsInterpretation: IncomingImpactsInterpretation, customImpactInterpretation: (impactWeights: number[]) => number) {
        this.#evaluationId = evaluationId;
        this.#reasoning = reasoning;
        this.#usedMeasures = usedMeasures;
        this.#precondition = precondition;
        this.#impactsInterpretation = impactsInterpretation;
        this.#customImpactInterpretation = customImpactInterpretation;
    }

    get getEvaluationId() {
        return this.#evaluationId;
    }

    get getReasoning() {
        return this.#reasoning;
    }

    get getUsedMeasures() {
        return this.#usedMeasures;
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

}

export { ProductFactorEvaluation, QualityAspectEvaluation, EvaluationDetails }