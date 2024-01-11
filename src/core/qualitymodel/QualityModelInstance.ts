import { HighLevelAspect } from "./quamoco/HighLevelAspect";
import { Impact, ImpactType } from "./quamoco/Impact";
import { Measure } from "./quamoco/Measure";
import { ProductFactor } from "./quamoco/ProductFactor";
import { QualityAspect } from "./quamoco/QualityAspect";
import { entities } from "./specifications/entities";
import { qualityModel } from "./specifications/qualitymodel";
import { literature } from "./specifications/literature";
import { LiteratureSource } from "./quamoco/LiteratureSource";
import { Entity } from "./quamoco/Entity";
import { measureImplementations, productFactorEvaluationImplementation } from "./evaluationImplementation";
import { ProductFactorEvaluation } from "./quamoco/ProductFactorEvaluation";


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

    // add all Measures
    for (const [measureKey, measure] of Object.entries(qualityModel.measures)) {
        let newMeasure = new Measure(measureKey, measure.name, "", measure.calculation);
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
        let newProductFactor = new ProductFactor(productFactorKey, productFactor.name, productFactor.description);
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

            let newEvaluation = new ProductFactorEvaluation(evaluatedProductFactor, productFactorEvaluation.reasoning);
            let availableImplementation = productFactorEvaluationImplementation[evaluatedProductFactor.getId]
            if (availableImplementation) {
                newEvaluation.addEvaluation(availableImplementation);
                evaluatedProductFactor.addEvaluation(newEvaluation);
            } else {
                console.log(`No evaluation implementation found for evaluation of factor ${evaluatedProductFactor.getId}`);
            }
        } else {
            throw new Error(`There is no product factor with key ${productFactorEvaluation.targetFactor}`);
        }

    }

    return newQualityModel;
}


class QualityModelInstance {

    highLevelAspects: HighLevelAspect[];

    qualityAspects: QualityAspect[];

    productFactors: ProductFactor[];

    impacts: Impact[];

    measures: Measure[];

    entities: Entity[];

    constructor() {
        this.highLevelAspects = [];
        this.qualityAspects = [];
        this.productFactors = [];
        this.impacts = [];
        this.measures = [];
        this.entities = [];
    }

    findQualityAspect(qualityAspectKey: string) {
        return this.qualityAspects.find(qa => qa.getId === qualityAspectKey);
    }

    findProductFactor(productFactorKey: string) {
        return this.productFactors.find(pf => pf.getId === productFactorKey);
    }

    findMeasure(measureKey: string) {
        return this.measures.find(m => m.getId === measureKey);
    }

    findEntity(entityKey: string) {
        return this.entities.find(e => e.getKey === entityKey);
    }
}

export { getQualityModel, QualityModelInstance }