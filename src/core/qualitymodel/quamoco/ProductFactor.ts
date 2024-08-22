import { Component, RequestTrace, System } from "@/core/entities";
import { EvaluatedSystemModel, ProductFactorEvaluationResult } from "../evaluation/EvaluatedSystemModel";
import { ProductFactorEvaluation } from "../evaluation/ProductFactorEvaluation";
import { Impact } from "./Impact";
import { LiteratureSource } from "./LiteratureSource";
import { Measure } from "./Measure";
import { QualityAspect } from "./QualityAspect";

class ProductFactor {

    #id: string;
    #name: string;
    #description: string;
    #categories: string[];
    #relevantEntities: string[];
    #sources: LiteratureSource[];
    #systemMeasures: Measure<System>[];
    #componentMeasures: Measure<{component: Component, system: System}>[];
    #componentPairMeasures: Measure<{ componentA: Component, componentB: Component, system: System }>[];
    #requestTraceMeasures: Measure<{requestTrace: RequestTrace, system: System}>[];
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
        this.#systemMeasures = [];
        this.#componentMeasures = [];
        this.#componentPairMeasures = [];
        this.#requestTraceMeasures = [];
        this.#evaluation = undefined;
        this.#outgoingImpacts = [];
        this.#incomingImpacts = [];

        this.getImpactedFactors = this.getImpactedFactors.bind(this);
        this.getImpactingFactors = this.getImpactingFactors.bind(this);
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

    get getSystemMeasures() {
        return this.#systemMeasures;
    }

    get getComponentMeasures() {
        return this.#componentMeasures;
    }

    get getComponentPairMeasures() {
        return this.#componentPairMeasures;
    }

    get getRequestTraceMeasures() {
        return this.#requestTraceMeasures;
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

    addSystemMeasure(measure: Measure<System>) {
        this.#systemMeasures.push(measure);
    }

    addComponentMeasure(measure: Measure<{component: Component, system: System}>) {
        this.#componentMeasures.push(measure);
    }

    addComponentPairMeasure(measure: Measure<{ componentA: Component, componentB: Component, system: System }>) {
        this.#componentPairMeasures.push(measure);
    }

    addRequestTraceMeasure(measure: Measure<{requestTrace: RequestTrace, system: System}>) {
        this.#requestTraceMeasures.push(measure);
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

    getSystemMeasure(measureKey: string) {
        let measure = this.#systemMeasures.find(measure => measure.getId === measureKey);
        if (measure) {
            return measure;
        } else {
            throw new Error (`Measure ${measureKey} not found for product factor ${this.#id}`);
        }
    }

    getComponentMeasure(measureKey: string) {
        let measure = this.#componentMeasures.find(measure => measure.getId === measureKey);
        if (measure) {
            return measure;
        } else {
            throw new Error (`Measure ${measureKey} not found for product factor ${this.#id}`);
        }
    }

    getComponentPairMeasure(measureKey: string) {
        let measure = this.#componentPairMeasures.find(measure => measure.getId === measureKey);
        if (measure) {
            return measure;
        } else {
            throw new Error (`Measure ${measureKey} not found for product factor ${this.#id}`);
        }
    }


    isEvaluationAvailable(): boolean {
        return this.#evaluation !== undefined;
    }

    evaluate(evaluatedSystem: EvaluatedSystemModel): ProductFactorEvaluationResult {
        return this.#evaluation.evaluate(evaluatedSystem.getCalculatedMeasures, evaluatedSystem.getEvaluatedProductFactors);
    }

}

export { ProductFactor }