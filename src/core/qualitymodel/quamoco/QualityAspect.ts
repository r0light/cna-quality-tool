import { Impact } from "./Impact";
import { ProductFactor } from "./ProductFactor";
import { QualityAspectEvaluation, QualityAspectEvaluationResult } from "./QualityAspectEvaluation";

class QualityAspect {

    #id: string;
    #name: string;
    #highLevelAspectKey: string;
    #description: string;
    #evaluation: QualityAspectEvaluation;

    #incomingImpacts: Impact[];

    constructor(id: string, name: string, highLevelAspectKey: string, description: string) {
        this.#id = id;
        this.#name = name;
        this.#highLevelAspectKey = highLevelAspectKey;
        this.#description = description;
        this.#incomingImpacts = [];
    }

    get getFactorType() {
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

    evaluate(): QualityAspectEvaluationResult {
        return this.#evaluation.evaluate();
    }


}

export { QualityAspect }