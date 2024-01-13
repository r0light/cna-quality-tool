import { ProductFactorEvaluation, ProductFactorEvaluationResult } from "./ProductFactorEvaluation";
import { Impact } from "./Impact";
import { LiteratureSource } from "./LiteratureSource";
import { Measure } from "./Measure";
import { QualityAspect } from "./QualityAspect";
import { System } from "@/core/entities";

class ProductFactor {

    #id: string;
    #name: string;
    #description: string;
    #categories: string[];
    #relevantEntities: string[];
    #sources: LiteratureSource[];
    #measures: Measure[];
    #evaluation: ProductFactorEvaluation;

    #outgoingImpacts: Impact[];
    #incomingImpacts: Impact[];

    constructor(id: string, name: string, description: string, categories: string[]) {
        this.#id = id;
        this.#name = name;
        this.#description = description;
        this.#categories = categories;
        this.#relevantEntities = [];
        this.#sources = [];
        this.#measures = [];
        this.#evaluation = undefined;
        this.#outgoingImpacts = [];
        this.#incomingImpacts = [];
    }

    get getFactorType() {
        return "productFactor";
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

    get getCategories() {
        return this.#categories;
    }

    get getRelevantEntities(): string[] {
        return this.#relevantEntities;
    }

    get getSources() {
        return this.#sources;
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

    addRelevantEntity(entity: string) {
        this.#relevantEntities.push(entity);
    }

    addSource(literatureSource: LiteratureSource) {
        this.#sources.push(literatureSource);
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

    addEvaluation(evaluation: ProductFactorEvaluation) {
        this.#evaluation = evaluation;
    }

    getImpactedFactors(): (ProductFactor | QualityAspect)[] {
        return this.#outgoingImpacts.map(impact => impact.getImpactedFactor);
    }

    getImpactingFactors(): ProductFactor[] {
        return this.#incomingImpacts.map(impact => impact.getSourceFactor);
    }

    getMeasure(measureKey: string) {
        let measure = this.#measures.find(measure => measure.getId === measureKey);
        if (measure) {
            return measure;
        } else {
            throw new Error (`Measure ${measureKey} not found for product factor ${this.#id}`);
        }
    }

    isEvaluationAvailable(): boolean {
        return this.#evaluation !== undefined;
    }

    evaluate(system: System): ProductFactorEvaluationResult {
        return this.#evaluation.evaluate(system);
    }

}

export { ProductFactor }