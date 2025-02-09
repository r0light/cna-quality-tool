import { HighLevelAspect } from "./quamoco/HighLevelAspect.js";
import { Impact } from "./quamoco/Impact.js";
import { Measure } from "./quamoco/Measure.js";
import { ProductFactor } from "./quamoco/ProductFactor.js";
import { QualityAspect } from "./quamoco/QualityAspect.js";
import { ENTITIES, entities } from "./specifications/entities.js";
import { DEFAULT_IMPACTS_INTERPRETATION, DEFAULT_PRECONDITION, FactorCategoryKey, MeasureKey, ProductFactorKey, QualityAspectKey, qualityModel, QualityModelSpec } from "./specifications/qualitymodel.js";
import { literature } from "./specifications/literature.js";
import { LiteratureSource } from "./quamoco/LiteratureSource.js";
import { Entity } from "./quamoco/Entity.js";
import { generalProductFactorEvaluationImplementation, generalQualityAspectEvaluationImplementation, productFactorEvaluationImplementation, qualityAspectEvaluationImplementation } from "./evaluation/evaluationImplementations.js";
import { systemMeasureImplementations } from "./evaluation/measure-implementations/systemMeasures.js";
import { componentMeasureImplementations } from "./evaluation/measure-implementations/componentMeasures.js";
import { infrastructureMeasureImplementations } from "./evaluation/measure-implementations/infrastructureMeasures.js";
import { requestTraceMeasureImplementations } from "./evaluation/measure-implementations/requestTraceMeasures.js";
import { EvaluationDetails, ProductFactorEvaluation, QualityAspectEvaluation } from "./evaluation/FactorEvaluation.js";


function getQualityModel(): QualityModelInstance {

    const newQualityModel = new QualityModelInstance();
    const specifiedQualityModel = qualityModel as QualityModelSpec;

    // add all entities
    for (const [entityKey, entity] of Object.entries(entities)) {
        let newEntity = new Entity(entityKey, entity.name, entity.description, entity.formal, entity.relation);
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
    Object.values(ENTITIES).forEach(entityKey => {
        newQualityModel.measures.set(entityKey as `${ENTITIES}`, []);
    });

    for (const [measureKey, measure] of Object.entries(specifiedQualityModel.measures)) {
        for (const entityKey of measure.applicableEntities) {

            let newMeasure = new Measure(measureKey as MeasureKey, measure.name, measure.calculation);
            measure.sources.forEach(sourceKey => {
                let url = literature[sourceKey] ? literature[sourceKey].url : "";
                newMeasure.addSource(new LiteratureSource(sourceKey, "", url));
            });

            switch (entityKey) {
                case ENTITIES.SYSTEM:
                    newMeasure.addCalculation(systemMeasureImplementations[measureKey]);
                    break;
                case ENTITIES.COMPONENT:
                    newMeasure.addCalculation(componentMeasureImplementations[measureKey]);
                    break;
                case ENTITIES.INFRASTRUCTURE:
                    newMeasure.addCalculation(infrastructureMeasureImplementations[measureKey]);
                    break;
                case ENTITIES.REQUEST_TRACE:
                    newMeasure.addCalculation(requestTraceMeasureImplementations[measureKey]);
                    break;
            }
            newQualityModel.measures.get(entityKey).push(newMeasure);
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

        productFactor.relevantEntities.forEach(entity => newProductFactor.addRelevantEntity(entity));
        productFactor.applicableEntities.forEach(entity => newProductFactor.addApplicableEntity(entity));
        productFactor.sources.forEach(source => {
            let url = literature[source.key] ? literature[source.key].url : "";
            newProductFactor.addSource(new LiteratureSource(source.key, source.section, url));
        });

        for (const measureKey of productFactor.measures) {
            let measure = specifiedQualityModel.measures[measureKey];
            if (!measure) {
                throw Error(`No measure with key ${measureKey} as specified in product factor ${productFactorKey} could be found, please check the quality model definition.`)
            }
            for (const entityKey of measure.applicableEntities) {
                let foundMeasure = newQualityModel.findMeasure(entityKey, measureKey);
                if (foundMeasure) {
                    newProductFactor.addMeasure(entityKey, foundMeasure);
                    continue;
                }
                // else
                throw Error("No measure with key " + measureKey + " could be found, please check the quality model definition.")
            }
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

            let evaluationDetails = new EvaluationDetails(productFactorEvaluation.evaluation, 
                productFactorEvaluation.reasoning, 
                productFactorEvaluation.precondition ? productFactorEvaluation.precondition : DEFAULT_PRECONDITION,
                productFactorEvaluation.impactsInterpretation ? productFactorEvaluation.impactsInterpretation : DEFAULT_IMPACTS_INTERPRETATION,
                productFactorEvaluation.customImpactInterpretation ? productFactorEvaluation.customImpactInterpretation : (impacts: number[]) => 0
            )
            let newEvaluation = new ProductFactorEvaluation(evaluatedProductFactor, evaluationDetails);
            let availableImplementation = productFactorEvaluationImplementation[newEvaluation.getEvaluationDetails.getEvaluationId]
            if (availableImplementation) {
                newEvaluation.addEvaluation(availableImplementation);
                productFactorEvaluation.targetEntities.forEach(targetEntity => {
                    evaluatedProductFactor.addEvaluation(targetEntity, newEvaluation);
                })
            } else {
                availableImplementation = generalProductFactorEvaluationImplementation[newEvaluation.getEvaluationDetails.getEvaluationId];
                if (availableImplementation) {
                    newEvaluation.addEvaluation(availableImplementation);
                    productFactorEvaluation.targetEntities.forEach(targetEntity => {
                        evaluatedProductFactor.addEvaluation(targetEntity, newEvaluation);
                    })
                } else {
                    throw new Error(`No evaluation implementation found with id ${newEvaluation.getEvaluationDetails.getEvaluationId}`);
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


            let evaluationDetails = new EvaluationDetails(qualityAspectEvaluation.evaluation,
                qualityAspectEvaluation.reasoning,
                qualityAspectEvaluation.precondition ? qualityAspectEvaluation.precondition : DEFAULT_PRECONDITION,
                qualityAspectEvaluation.impactsInterpretation ? qualityAspectEvaluation.impactsInterpretation : DEFAULT_IMPACTS_INTERPRETATION,
                qualityAspectEvaluation.customImpactInterpretation ? qualityAspectEvaluation.customImpactInterpretation : (impacts: number[]) => 0
            )
            let newEvaluation = new QualityAspectEvaluation(evaluatedQualityAspect, evaluationDetails);
            let availableImplementation = qualityAspectEvaluationImplementation[newEvaluation.getEvaluationDetails.getEvaluationId]
            if (availableImplementation) {
                newEvaluation.addEvaluation(availableImplementation);
                evaluatedQualityAspect.addEvaluation(newEvaluation);
            } else {
                availableImplementation = generalQualityAspectEvaluationImplementation[newEvaluation.getEvaluationDetails.getEvaluationId];
                if (availableImplementation) {
                    newEvaluation.addEvaluation(availableImplementation);
                    evaluatedQualityAspect.addEvaluation(newEvaluation);
                } else {
                    throw new Error(`No evaluation implementation found with id ${newEvaluation.getEvaluationDetails.getEvaluationId}`);
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

    measures: Map<`${ENTITIES}`, Measure[]>;

    unusedMeasures: Measure[];

    entities: Entity[];

    constructor() {
        this.highLevelAspects = [];
        this.qualityAspects = [];
        this.productFactors = [];
        this.factorCategories = [];
        this.impacts = [];
        this.measures = new Map();
        this.unusedMeasures = [];
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

    findMeasure(forEntity: `${ENTITIES}`, measureKey: MeasureKey) {
        return this.measures.get(forEntity).find(m => m.getId === measureKey);
    }

    findEntity(entityKey: `${ENTITIES}`): Entity {
        return this.entities.find(e => e.getKey === entityKey);
    }
}

export { getQualityModel, QualityModelInstance }