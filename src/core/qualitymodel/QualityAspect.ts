import { Impact } from "./Impact";
import { ProductFactor } from "./ProductFactor";

class QualityAspect {

    #id: string;
    #name: string;
    #highLevelAspectKey: string;
    #description: string;

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

    getImpactingFactors(): ProductFactor[] {
        return this.#incomingImpacts.map(impact => impact.getSourceFactor);
    }

}

export { QualityAspect }