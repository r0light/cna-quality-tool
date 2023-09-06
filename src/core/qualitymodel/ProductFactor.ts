import { Impact } from "./Impact";
import { Measure } from "./Measure";
import { QualityAspect } from "./QualityAspect";

class ProductFactor {

    #id: string;
    #name: string;
    #description: string;
    #measures: Measure[];

    #outgoingImpacts: Impact[];
    #incomingImpacts: Impact[];

    constructor(id: string, name: string, description: string) {
        this.#id = id;
        this.#name = name;
        this.#description = description;
        this.#measures = [];
        this.#outgoingImpacts = [];
        this.#incomingImpacts = [];
    }

    get getId() {
        return this.#id;
    }

    get getName() {
        return this.#name;
    }

    get getDescription() {
        return this.#description;
    }

    get getMeasures() {
        return this.#measures;
    }

    get getOutgoingImpacts() {
        return this.#outgoingImpacts;
    }

    get getIncomingImpacts() {
        return this.#incomingImpacts;
    }

    addMeasure(measure: Measure) {
        this.#measures.push(measure);
    }

    addOutgoingImpact(impact: Impact) {
        this.#outgoingImpacts.push(impact);
    }

    addIncomingImpact(impact: Impact) {
        this.#incomingImpacts.push(impact);
    }

    getImpactedFactors(): (ProductFactor | QualityAspect)[] {
        return this.#outgoingImpacts.map(impact => impact.getImpactedFactor);
    }

    getImpactingFactors(): ProductFactor[] {
        return this.#incomingImpacts.map(impact => impact.getSourceFactor);
    }

}

export { ProductFactor }