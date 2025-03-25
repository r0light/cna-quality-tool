import { Evaluation } from "../evaluation/EvaluationModels";
import { ProductFactorEvaluation } from "../evaluation/FactorEvaluation";
import { Impact } from "./Impact";
import { LiteratureSource } from "./LiteratureSource";
import { Measure } from "./Measure";
import { QualityAspect } from "./QualityAspect";
import { FactorEvaluationResult } from "../evaluation/Evaluation";
import { FactorCategoryKey, ProductFactorKey } from "../specifications/qualitymodel";
import { ENTITIES } from "../specifications/entities";

class ProductFactor {

    #id: ProductFactorKey;
    #name: string;
    #description: string;
    #categories: FactorCategoryKey[];
    #relevantEntities: `${ENTITIES}`[];
    #applicableEntities: `${ENTITIES}`[];
    #sources: LiteratureSource[];
    #measures: Map<`${ENTITIES}`,Measure[]>;
    #evaluations: Map<`${ENTITIES}`,ProductFactorEvaluation>;

    #outgoingImpacts: Impact[];
    #incomingImpacts: Impact[];

    constructor(id: ProductFactorKey, name: string, description: string, categories: FactorCategoryKey[]) {
        this.#id = id;
        this.#name = name;
        this.#description = description;
        this.#categories = categories;
        this.#relevantEntities = [];
        this.#applicableEntities = [];
        this.#sources = [];
        this.#measures = new Map();
        this.#evaluations = new Map();
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

    get getRelevantEntities() {
        return this.#relevantEntities;
    }

    get getApplicableEntities() {
        return this.#applicableEntities;
    }

    get getSources() {
        return this.#sources;
    }

    get getOutgoingImpacts() {
        return this.#outgoingImpacts;
    }

    get getIncomingImpacts() {
        return this.#incomingImpacts;
    }

    addRelevantEntity(entity: `${ENTITIES}`) {
        this.#relevantEntities.push(entity);
    }

    addApplicableEntity(entity: `${ENTITIES}`) {
        this.#applicableEntities.push(entity);
    }

    addSource(literatureSource: LiteratureSource) {
        this.#sources.push(literatureSource);
    }

    addMeasure(forEntity: `${ENTITIES}`, measure: Measure) {
        if (this.#measures.has(forEntity)) {
            this.#measures.get(forEntity).push(measure);
        } else {
            let measures = [measure];
            this.#measures.set(forEntity, measures);
        }
    }

    addOutgoingImpact(impact: Impact) {
        this.#outgoingImpacts.push(impact);
    }

    addIncomingImpact(impact: Impact) {
        this.#incomingImpacts.push(impact);
    }

    addEvaluation(forEntity: `${ENTITIES}`, evaluation: ProductFactorEvaluation) {
        this.#evaluations.set(forEntity, evaluation);
    }

    getImpactedFactors(): (ProductFactor | QualityAspect)[] {
        return this.#outgoingImpacts.map(impact => impact.getImpactedFactor);
    }

    getImpactingFactors(): ProductFactor[] {
        return this.#incomingImpacts.map(impact => impact.getSourceFactor);
    }

    getAllMeasures(): Measure[] {
        let uniqueMeasures = new Map<string, Measure>();
        [...this.#measures.values()].flatMap(measures => measures).forEach(measure => uniqueMeasures.set(measure.getId, measure));
        return [...uniqueMeasures.values()];
    }

    getMeasuresFor(entity: `${ENTITIES}`) {
        return this.#measures.has(entity) ? this.#measures.get(entity) : [];
    }

    isEvaluationAvailable(forEntity: `${ENTITIES}`): boolean {
        return this.#evaluations.has(forEntity);
    }

    getEvaluation(forEntity: `${ENTITIES}`): ProductFactorEvaluation {
        return this.#evaluations.get(forEntity);
    }

    evaluate(forEntity: `${ENTITIES}`, currentEvaluation: Evaluation): FactorEvaluationResult {
        return this.#evaluations.get(forEntity).evaluate(currentEvaluation.getCalculatedMeasures(), currentEvaluation.getEvaluatedProductFactors());
    }

}

export { ProductFactor }