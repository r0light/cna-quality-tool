import { HighLevelAspect } from "./quamoco/HighLevelAspect.js";
import { Impact, ImpactType } from "./quamoco/Impact.js";
import { Measure } from "./quamoco/Measure.js";
import { ProductFactor } from "./quamoco/ProductFactor.js";
import { QualityAspect } from "./quamoco/QualityAspect.js";
import { entities } from "./specifications/entities.js";
import { qualityModel } from "./specifications/qualitymodel.js";
import { literature } from "./specifications/literature.js";
import { LiteratureSource } from "./quamoco/LiteratureSource.js";
import { Entity } from "./quamoco/Entity.js";
import { productFactorEvaluationImplementation, qualityAspectEvaluationImplementation } from "./evaluation/evaluationImplementations.js";
import { ProductFactorEvaluation } from "./evaluation/ProductFactorEvaluation.js";
import { measureImplementations } from "./evaluation/measureImplementations.js";
import { QualityAspectEvaluation } from "./evaluation/QualityAspectEvaluation.js";


function getQualityModel(): QualityModelInstance {

    const newQualityModel = new QualityModelInstance();

    // add all entities
    for (const [entityKey, entity] of Object.entries(entities)) {
        let newEntity = new Entity(entityKey, entity.name, entity.description, entity.relation);
        newQualityModel.entities.push(newEntity);
    }

    // add all HighLevel Aspects and Quality Aspects
    for (const [highLevelQualityAspectKey, highLevelQualityAspect] of Object.entries(qualityModel.qualityAspects)) {
        let highLevelAspect = new HighLevelAspect(highLevelQualityAspectKey, highLevelQualityAspect.name);
        newQualityModel.highLevelAspects.push(highLevelAspect);
        for (const [qualityAspectKey, qualityAspect] of Object.entries(highLevelQualityAspect.aspects)) {
            let newQualityAspect = new QualityAspect(qualityAspectKey, qualityAspect.name, highLevelQualityAspectKey, qualityAspect.description);
            newQualityModel.qualityAspects.push(newQualityAspect);
        }
    }

    // add all factor categories
    for (const [categoryKey, category] of Object.entries(qualityModel.factorCategories)) {
        newQualityModel.factorCategories.push({
            categoryKey: categoryKey,
            categoryName: category.name
        })
    }

    // add all Measures
    for (const [measureKey, measure] of Object.entries(qualityModel.measures)) {
        let newMeasure = new Measure(measureKey, measure.name, measure.calculation);
        measure.sources.forEach(sourceKey => {
            let url = literature[sourceKey] ? literature[sourceKey].url : "";
            newMeasure.addSource(new LiteratureSource(sourceKey, "", url));
        });
        if (measureImplementations[measureKey]) {
            newMeasure.addCalculation(measureImplementations[measureKey]);
        } else {
            //console.log(`No measure implementation found for measure ${measureKey}`);
        }
        newQualityModel.measures.push(newMeasure);
    }

    // add all Product Factors
    for (const [productFactorKey, productFactor] of Object.entries(qualityModel.productFactors)) {

        let assignedCategories = productFactor.categories.map(categoryKey => {
            if (newQualityModel.findFactorCategory(categoryKey)) {
                return categoryKey;
            } else {
                throw new Error(`Category with key ${categoryKey} in product factor ${productFactorKey} does not exist!`);
            }
        })

        let newProductFactor = new ProductFactor(productFactorKey, productFactor.name, productFactor.description, productFactor.categories);

        //TODO also add categories and explicit attribute of categories to quality model?

        productFactor.relevantEntities.forEach(entity => newProductFactor.addRelevantEntity(entity));
        productFactor.sources.forEach(source => {
            let url = literature[source.key] ? literature[source.key].url : "";
            newProductFactor.addSource(new LiteratureSource(source.key, source.section, url));
        });

        for (const measureKey of productFactor.measures) {
            let foundMeasure = newQualityModel.findMeasure(measureKey);
            if (foundMeasure) {
                newProductFactor.addMeasure(foundMeasure);
            } else {
                throw Error("No measure with key " + measureKey + " could be found, please check the quality model definition.")
            }
        }

        newQualityModel.productFactors.push(newProductFactor);

    }

    // add all Impacts
    for (const impact of qualityModel.impacts) {

        let impacted = (() => {
            let foundQualityAspect = newQualityModel.findQualityAspect(impact.impactedFactor);
            if (foundQualityAspect) {
                return foundQualityAspect;
            } else {
                let foundProductFactor = newQualityModel.findProductFactor(impact.impactedFactor);
                if (foundProductFactor) {
                    return foundProductFactor;
                } else {
                    throw Error("No quality aspect or product factor with key: " + impact.impactedFactor + " could be found, please check the quality model definition.")
                }
            }
        })();

        let impacter = (() => {
            let foundProductFactor = newQualityModel.findProductFactor(impact.sourceFactor);
            if (foundProductFactor) {
                return foundProductFactor;
            } else {
                throw Error("No product factor with key: " + impact.sourceFactor + " could be found, please check the quality model definition.")
            }
        })();

        let impactType: ImpactType = (() => {
            switch (impact.impactType) {
                case "positive":
                    return "+";
                case "negative":
                    return "-";
                default:
                    return "o";
            }
        })();


        let newImpact = new Impact(impacted, impacter, impactType);
        impacted.addIncomingImpact(newImpact);
        impacter.addOutgoingImpact(newImpact);
        newQualityModel.impacts.push(newImpact);
    }

    // add all product factor evaluations
    for (const productFactorEvaluation of qualityModel.productFactorEvaluations) {

        let evaluatedProductFactor = newQualityModel.findProductFactor(productFactorEvaluation.targetFactor);
        if (evaluatedProductFactor) {

            let newEvaluation = new ProductFactorEvaluation(evaluatedProductFactor, productFactorEvaluation.evaluation, productFactorEvaluation.reasoning);
            let availableImplementation = productFactorEvaluationImplementation[newEvaluation.getEvaluationId]
            if (availableImplementation) {
                newEvaluation.addEvaluation(availableImplementation);
                evaluatedProductFactor.addEvaluation(newEvaluation);
            } else {
                throw new Error(`No evaluation implementation found with id ${newEvaluation.getEvaluationId}`);
            }
        } else {
            throw new Error(`There is no product factor with key ${productFactorEvaluation.targetFactor}`);
        }

    }

    // add all quality aspect evaluations
    for (const qualityAspectEvaluation of qualityModel.qualityAspectEvaluations) {

        let evaluatedQualityAspect = newQualityModel.findQualityAspect(qualityAspectEvaluation.targetAspect);
        if (evaluatedQualityAspect) {

            let newEvaluation = new QualityAspectEvaluation(evaluatedQualityAspect, qualityAspectEvaluation.evaluation, qualityAspectEvaluation.reasoning);
            let availableImplementation = qualityAspectEvaluationImplementation[newEvaluation.getEvaluationId]
            if (availableImplementation) {
                newEvaluation.addEvaluation(availableImplementation);
                evaluatedQualityAspect.addEvaluation(newEvaluation);
            } else {
                throw new Error(`No evaluation implementation found with id ${newEvaluation.getEvaluationId}`);
            }
        } else {
            throw new Error(`There is no quality aspect with key ${qualityAspectEvaluation.targetAspect}`);
        }

    }



    return newQualityModel;
}


class QualityModelInstance {

    highLevelAspects: HighLevelAspect[];

    qualityAspects: QualityAspect[];

    productFactors: ProductFactor[];

    factorCategories: { categoryKey: string, categoryName: string }[];

    impacts: Impact[];

    measures: Measure[];

    entities: Entity[];

    constructor() {
        this.highLevelAspects = [];
        this.qualityAspects = [];
        this.productFactors = [];
        this.factorCategories = [];
        this.impacts = [];
        this.measures = [];
        this.entities = [];
    }

    findQualityAspect(qualityAspectKey: string): QualityAspect {
        return this.qualityAspects.find(qa => qa.getId === qualityAspectKey);
    }

    findFactorCategory(categoryKey: string): { categoryKey: string, categoryName: string } {
        return this.factorCategories.find(category => category.categoryKey === categoryKey);
    }

    findProductFactor(productFactorKey: string): ProductFactor {
        return this.productFactors.find(pf => pf.getId === productFactorKey);
    }

    findMeasure(measureKey: string): Measure {
        return this.measures.find(m => m.getId === measureKey);
    }

    findEntity(entityKey: string): Entity {
        return this.entities.find(e => e.getKey === entityKey);
    }
}

export { getQualityModel, QualityModelInstance }