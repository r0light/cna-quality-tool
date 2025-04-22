import { Impact } from "./Impact";
import { ProductFactor } from "./ProductFactor";
import { Evaluation } from "../evaluation/EvaluationModels";
import { QualityAspectEvaluationResult } from "../evaluation/Evaluation";
import { QualityAspectEvaluation } from "../evaluation/FactorEvaluation";
import { QualityAspectKey } from "../specifications/qualitymodel";

class QualityAspect {

    #id: QualityAspectKey;
    #name: string;
    #highLevelAspectKey: string;
    #description: string;
    #evaluation: QualityAspectEvaluation;

    #incomingImpacts: Impact[];

    constructor(id: QualityAspectKey, name: string, highLevelAspectKey: string, description: string) {
        this.#id = id;
        this.#name = name;
        this.#highLevelAspectKey = highLevelAspectKey;
        this.#description = description;
        this.#incomingImpacts = [];
    }

    get getFactorType(): "qualityAspect" {
        return "qualityAspect";
    }

    get getId() {
        return this.#id;
    }

    get getName() {
        return this.#name;
    }

    get getHighLevelAspectKey() {
        return this.#highLevelAspectKey;
    }

    get getDescription() {
        return this.#description;
    }

    get getIncomingImpacts() {
        return this.#incomingImpacts;
    }

    addIncomingImpact(impact: Impact) {
        this.#incomingImpacts.push(impact);
    }

    addEvaluation(evaluation: QualityAspectEvaluation) {
        this.#evaluation = evaluation;
    }

    getImpactingFactors(): ProductFactor[] {
        return this.#incomingImpacts.map(impact => impact.getSourceFactor);
    }

    isEvaluationAvailable(): boolean {
        return this.#evaluation !== undefined;
    }

    evaluate(evaluation: Evaluation): QualityAspectEvaluationResult {
        return this.#evaluation.evaluate(evaluation.getCalculatedMeasures(), evaluation.getEvaluatedProductFactors());
    }

}

export { QualityAspect }