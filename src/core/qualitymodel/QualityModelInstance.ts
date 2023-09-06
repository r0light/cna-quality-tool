import { Impact, ImpactType } from "./Impact";
import { Measure } from "./Measure";
import { ProductFactor } from "./ProductFactor";
import { QualityAspect } from "./QualityAspect";
import { qualityModel } from "./qualitymodel";


function getQualityModel(): QualityModelInstance {

    const newQualityModel = new QualityModelInstance();

    // add all Quality Aspects
    for (const [highLevelQualityAspectKey, highLevelQualityAspect] of Object.entries(qualityModel.qualityAspects)) {
        for (const [qualityAspectKey, qualityAspect] of Object.entries(highLevelQualityAspect.aspects)) {
            let newQualityAspect = new QualityAspect(qualityAspectKey, qualityAspect.name, highLevelQualityAspectKey, qualityAspect.description);
            newQualityModel.qualityAspects.push(newQualityAspect);
        }
    }

    // add all Product Factors
    for (const [productFactorKey, productFactor] of Object.entries(qualityModel.productFactors)) {
        let newProductFactor = new ProductFactor(productFactorKey, productFactor.name, productFactor.description);

        for (const measureKey of productFactor.measures) {
            let foundMeasure = qualityModel.measures[measureKey];
            if (foundMeasure) {
                newProductFactor.addMeasure(new Measure(measureKey, foundMeasure.name, "", foundMeasure.calculation, foundMeasure.sources));
            } else {
                throw Error("No measure with key " + measureKey + " could be found, please check the quality model definition.")
            }
        }

        newQualityModel.productFactors.push(newProductFactor);

        //TODO also add sources
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

    qualityAspects: QualityAspect[];

    productFactors: ProductFactor[];

    impacts: Impact[];

    constructor() {
        this.qualityAspects = [];
        this.productFactors = [];
        this.impacts = [];
    }

    findQualityAspect(qualityAspectKey: string) {
        return this.qualityAspects.find(qa => qa.getId === qualityAspectKey);
    }

    findProductFactor(productFactorKey: string) {
        return this.productFactors.find(pf => pf.getId === productFactorKey);
    }
}

export { getQualityModel, QualityModelInstance }