import { HighLevelAspect } from "./quamoco/HighLevelAspect.js";
import { Impact } from "./quamoco/Impact.js";
import { Measure } from "./quamoco/Measure.js";
import { ProductFactor } from "./quamoco/ProductFactor.js";
import { QualityAspect } from "./quamoco/QualityAspect.js";
import { ENTITIES, entities } from "./specifications/entities.js";
import { DEFAULT_IMPACTS_INTERPRETATION, DEFAULT_PRECONDITION, FactorCategoryKey, MeasureKey, ProductFactorKey, ProductFactorSpec, QualityAspectKey, qualityModel, QualityModelSpec } from "./specifications/qualitymodel.js";
import { literature } from "./specifications/literature.js";
import { LiteratureSource } from "./quamoco/LiteratureSource.js";
import { Entity } from "./quamoco/Entity.js";
import { generalEvaluationImplementation, productFactorEvaluationImplementation, qualityAspectEvaluationImplementation } from "./evaluation/evaluationImplementations.js";
import { componentMeasureImplementations, componentPairMeasureImplementations, infrastructureMeasureImplementations, requestTraceMeasureImplementations, systemMeasureImplementations } from "./evaluation/measureImplementations.js";
import { Component, Infrastructure, RequestTrace, System } from "../entities.js";
import { FactorEvaluation } from "./evaluation/FactorEvaluation.js";


function getQualityModel(): QualityModelInstance {

    const newQualityModel = new QualityModelInstance();
    const specifiedQualityModel = qualityModel as QualityModelSpec;

    // add all entities
    for (const [entityKey, entity] of Object.entries(entities)) {
        let newEntity = new Entity(entityKey, entity.name, entity.description, entity.relation);
        newQualityModel.entities.push(newEntity);
    }

    // add all HighLevel Aspects and Quality Aspects
    for (const [highLevelQualityAspectKey, highLevelQualityAspect] of Object.entries(specifiedQualityModel.qualityAspects)) {
        let highLevelAspect = new HighLevelAspect(highLevelQualityAspectKey, highLevelQualityAspect.name);
        newQualityModel.highLevelAspects.push(highLevelAspect);
        for (const [qualityAspectKey, qualityAspect] of Object.entries(highLevelQualityAspect.aspects)) {
            let newQualityAspect = new QualityAspect(qualityAspectKey as QualityAspectKey, qualityAspect.name, highLevelQualityAspectKey, qualityAspect.description);
            newQualityModel.qualityAspects.push(newQualityAspect);
        }
    }

    // add all factor categories
    for (const [categoryKey, category] of Object.entries(specifiedQualityModel.factorCategories)) {
        newQualityModel.factorCategories.push({
            categoryKey: categoryKey as FactorCategoryKey,
            categoryName: category.name
        })
    }

    // add all Measures

    for (const [measureKey, measure] of Object.entries(specifiedQualityModel.measures)) {
        let newMeasure = new Measure(measureKey as MeasureKey, measure.name, measure.calculation);
        measure.sources.forEach(sourceKey => {
            let url = literature[sourceKey] ? literature[sourceKey].url : "";
            newMeasure.addSource(new LiteratureSource(sourceKey, "", url));
        });
        if (systemMeasureImplementations[measureKey]) {
            newMeasure.addCalculation(systemMeasureImplementations[measureKey]);
            newQualityModel.systemMeasures.push(newMeasure as Measure<System>);
        } else if (componentMeasureImplementations[measureKey]) {
            newMeasure.addCalculation(componentMeasureImplementations[measureKey]);
            newQualityModel.componentMeasures.push(newMeasure as Measure<{ component: Component, system: System }>);
        } else if (componentPairMeasureImplementations[measureKey]) {
            newMeasure.addCalculation(componentPairMeasureImplementations[measureKey]);
            newQualityModel.componentPairMeasures.push(newMeasure as Measure<{ componentA: Component, componentB: Component, system: System }>);
        } else if (infrastructureMeasureImplementations[measureKey]) {
            newMeasure.addCalculation(infrastructureMeasureImplementations[measureKey]);
            newQualityModel.infrastructureMeasures.push(newMeasure as Measure<{ infrastructure: Infrastructure, system: System }>);
        } else if (requestTraceMeasureImplementations[measureKey]) {
            newMeasure.addCalculation(requestTraceMeasureImplementations[measureKey]);
            newQualityModel.requestTraceMeasures.push(newMeasure as Measure<{ requestTrace: RequestTrace, system: System }>);
        } else {
            //console.log(`No measure implementation found for measure ${measureKey}`);
            //default:
            newQualityModel.systemMeasures.push(newMeasure as Measure<System>);
        }
    }

    // add all Product Factors
    for (const [productFactorKey, productFactor] of Object.entries(specifiedQualityModel.productFactors)) {

        let assignedCategories = productFactor.categories.map(categoryKey => {
            if (newQualityModel.findFactorCategory(categoryKey)) {
                return categoryKey;
            } else {
                throw new Error(`Category with key ${categoryKey} in product factor ${productFactorKey} does not exist!`);
            }
        })

        let newProductFactor = new ProductFactor(productFactorKey as ProductFactorKey, productFactor.name, productFactor.description, productFactor.categories);

        //TODO also add categories and explicit attribute of categories to quality model?

        productFactor.applicableEntities.forEach(entity => newProductFactor.addRelevantEntity(entity));
        productFactor.sources.forEach(source => {
            let url = literature[source.key] ? literature[source.key].url : "";
            newProductFactor.addSource(new LiteratureSource(source.key, source.section, url));
        });

        for (const measureKey of productFactor.measures) {
            let foundSystemMeasure = newQualityModel.findSystemMeasure(measureKey);
            if (foundSystemMeasure) {
                newProductFactor.addSystemMeasure(foundSystemMeasure);
                continue;
            }

            let foundComponentMeasure = newQualityModel.findComponentMeasure(measureKey);
            if (foundComponentMeasure) {
                newProductFactor.addComponentMeasure(foundComponentMeasure);
                continue;
            }

            let foundComponentPairMeasure = newQualityModel.findComponentPairMeasure(measureKey);
            if (foundComponentPairMeasure) {
                newProductFactor.addComponentPairMeasure(foundComponentPairMeasure);
                continue;
            }

            let foundInfrastructureMeasure = newQualityModel.findInfrastructureMeasure(measureKey);
            if (foundInfrastructureMeasure) {
                newProductFactor.addInfrastructureMeasures(foundInfrastructureMeasure);
                continue;
            }

            let foundRequestTraceMeasure = newQualityModel.findRequestTraceMeasure(measureKey);
            if (foundRequestTraceMeasure) {
                newProductFactor.addRequestTraceMeasure(foundRequestTraceMeasure);
                continue;
            }

            // else
            throw Error("No measure with key " + measureKey + " could be found, please check the quality model definition.")
        }
        newQualityModel.productFactors.push(newProductFactor);
    }

    // add all Impacts
    for (const impact of specifiedQualityModel.impacts) {

        let impacted = (() => {
            let foundQualityAspect = newQualityModel.findQualityAspect(impact.impactedFactor as QualityAspectKey);
            if (foundQualityAspect) {
                return foundQualityAspect;
            } else {
                let foundProductFactor = newQualityModel.findProductFactor(impact.impactedFactor as ProductFactorKey);
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

        let newImpact = new Impact(impacted, impacter, impact.impactType);
        impacted.addIncomingImpact(newImpact);
        impacter.addOutgoingImpact(newImpact);
        newQualityModel.impacts.push(newImpact);
    }

    // add all product factor evaluations
    for (const productFactorEvaluation of specifiedQualityModel.productFactorEvaluations) {

        let evaluatedProductFactor = newQualityModel.findProductFactor(productFactorEvaluation.targetFactor);
        if (evaluatedProductFactor) {

            let newEvaluation = new FactorEvaluation(evaluatedProductFactor, 
                productFactorEvaluation.evaluation, 
                productFactorEvaluation.reasoning,
                productFactorEvaluation.precondition ? productFactorEvaluation.precondition : DEFAULT_PRECONDITION,
                productFactorEvaluation.impactsInterpretation ? productFactorEvaluation.impactsInterpretation : DEFAULT_IMPACTS_INTERPRETATION,
                productFactorEvaluation.customImpactInterpretation ? productFactorEvaluation.customImpactInterpretation : (impacts: number[]) => 0
            );
            let availableImplementation = productFactorEvaluationImplementation[newEvaluation.getEvaluationId]
            if (availableImplementation) {
                newEvaluation.addEvaluation(availableImplementation);
                evaluatedProductFactor.addEvaluation(newEvaluation);
            } else {
                availableImplementation = generalEvaluationImplementation[newEvaluation.getEvaluationId];
                if (availableImplementation) {
                    newEvaluation.addEvaluation(availableImplementation);
                    evaluatedProductFactor.addEvaluation(newEvaluation);
                } else {
                    throw new Error(`No evaluation implementation found with id ${newEvaluation.getEvaluationId}`);
                }
            }
        } else {
            throw new Error(`There is no product factor with key ${productFactorEvaluation.targetFactor}`);
        }

    }

    // add all quality aspect evaluations
    for (const qualityAspectEvaluation of specifiedQualityModel.qualityAspectEvaluations) {

        let evaluatedQualityAspect = newQualityModel.findQualityAspect(qualityAspectEvaluation.targetAspect);
        if (evaluatedQualityAspect) {

            let newEvaluation = new FactorEvaluation(evaluatedQualityAspect, 
                qualityAspectEvaluation.evaluation, 
                qualityAspectEvaluation.reasoning,
                qualityAspectEvaluation.precondition ? qualityAspectEvaluation.precondition : DEFAULT_PRECONDITION,
                qualityAspectEvaluation.impactsInterpretation ? qualityAspectEvaluation.impactsInterpretation : DEFAULT_IMPACTS_INTERPRETATION,
                qualityAspectEvaluation.customImpactInterpretation ? qualityAspectEvaluation.customImpactInterpretation : (impacts: number[]) => 0
            );
            let availableImplementation = qualityAspectEvaluationImplementation[newEvaluation.getEvaluationId]
            if (availableImplementation) {
                newEvaluation.addEvaluation(availableImplementation);
                evaluatedQualityAspect.addEvaluation(newEvaluation);
            } else {
                availableImplementation = generalEvaluationImplementation[newEvaluation.getEvaluationId];
                if (availableImplementation) {
                    newEvaluation.addEvaluation(availableImplementation);
                    evaluatedQualityAspect.addEvaluation(newEvaluation);
                } else {
                    throw new Error(`No evaluation implementation found with id ${newEvaluation.getEvaluationId}`);
                }
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

    factorCategories: { categoryKey: FactorCategoryKey, categoryName: string }[];

    impacts: Impact[];

    systemMeasures: (Measure<System>)[];

    componentMeasures: Measure<{ component: Component, system: System }>[];

    componentPairMeasures: Measure<{ componentA: Component, componentB: Component, system: System }>[];

    infrastructureMeasures: Measure<{ infrastructure: Infrastructure, system: System }>[];

    requestTraceMeasures: Measure<{ requestTrace: RequestTrace, system: System }>[];

    entities: Entity[];

    constructor() {
        this.highLevelAspects = [];
        this.qualityAspects = [];
        this.productFactors = [];
        this.factorCategories = [];
        this.impacts = [];
        this.systemMeasures = [];
        this.componentMeasures = [];
        this.componentPairMeasures = [];
        this.infrastructureMeasures = [];
        this.requestTraceMeasures = [];
        this.entities = [];
    }

    findQualityAspect(qualityAspectKey: QualityAspectKey): QualityAspect {
        return this.qualityAspects.find(qa => qa.getId === qualityAspectKey);
    }

    findFactorCategory(categoryKey: FactorCategoryKey): { categoryKey: string, categoryName: string } {
        return this.factorCategories.find(category => category.categoryKey === categoryKey);
    }

    findProductFactor(productFactorKey: ProductFactorKey): ProductFactor {
        return this.productFactors.find(pf => pf.getId === productFactorKey);
    }

    findSystemMeasure(measureKey: MeasureKey): Measure<System> {
        return this.systemMeasures.find(m => m.getId === measureKey);
    }

    findComponentMeasure(measureKey: MeasureKey): Measure<{ component: Component, system: System }> {
        return this.componentMeasures.find(m => m.getId === measureKey);
    }

    findComponentPairMeasure(measureKey: MeasureKey): Measure<{ componentA: Component, componentB: Component, system: System }> {
        return this.componentPairMeasures.find(m => m.getId === measureKey);
    }

    findInfrastructureMeasure(measureKey: MeasureKey): Measure<{ infrastructure: Infrastructure, system: System }> {
        return this.infrastructureMeasures.find(m => m.getId === measureKey);
    }

    findRequestTraceMeasure(measureKey: MeasureKey): Measure<{ requestTrace: RequestTrace, system: System }> {
        return this.requestTraceMeasures.find(m => m.getId === measureKey);
    }

    findEntity(entityKey: `${ENTITIES}`): Entity {
        return this.entities.find(e => e.getKey === entityKey);
    }
}

export { getQualityModel, QualityModelInstance }