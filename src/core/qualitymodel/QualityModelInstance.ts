import { h } from "vue";
import { HighLevelAspect } from "./HighLevelAspect";
import { Impact, ImpactType } from "./Impact";
import { Measure } from "./Measure";
import { ProductFactor } from "./ProductFactor";
import { QualityAspect } from "./QualityAspect";
import { entities } from "./entities";
import { qualityModel } from "./qualitymodel";
import { literature } from "./literature";
import { LiteratureSource } from "./LiteratureSource";
import { Entity } from "./Entity";


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

    // add all Product Factors
    for (const [productFactorKey, productFactor] of Object.entries(qualityModel.productFactors)) {
        let newProductFactor = new ProductFactor(productFactorKey, productFactor.name, productFactor.description);

        productFactor.relevantEntities.forEach(entity => newProductFactor.addRelevantEntity(entity));
        productFactor.sources.forEach(source => {
            let url = literature[source.key] ? literature[source.key].url : "";
            newProductFactor.addSource(new LiteratureSource(source.key, source.section, url));
        });

        for (const measureKey of productFactor.measures) {
            let foundMeasure = qualityModel.measures[measureKey];
            if (foundMeasure) {
                let newMeasure = new Measure(measureKey, foundMeasure.name, "", foundMeasure.calculation);
                foundMeasure.sources.forEach(sourceKey => {
                    let url = literature[sourceKey] ? literature[sourceKey].url : "";
                    newMeasure.addSource(new LiteratureSource(sourceKey, "", url));
                })
                newProductFactor.addMeasure(newMeasure);
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

    return newQualityModel;
}


class QualityModelInstance {

    highLevelAspects: HighLevelAspect[];

    qualityAspects: QualityAspect[];

    productFactors: ProductFactor[];

    impacts: Impact[];

    entities: Entity[];

    constructor() {
        this.highLevelAspects = [];
        this.qualityAspects = [];
        this.productFactors = [];
        this.impacts = [];
        this.entities = [];
    }

    findQualityAspect(qualityAspectKey: string) {
        return this.qualityAspects.find(qa => qa.getId === qualityAspectKey);
    }

    findProductFactor(productFactorKey: string) {
        return this.productFactors.find(pf => pf.getId === productFactorKey);
    }

    findEntity(entityKey: string) {
        return this.entities.find(e => e.getKey === entityKey);
    }
}

export { getQualityModel, QualityModelInstance }