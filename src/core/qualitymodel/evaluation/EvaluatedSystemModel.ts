import { System } from "@/core/entities";
import { QualityModelInstance } from "../QualityModelInstance";
import { ProductFactorEvaluationResult } from "./ProductFactorEvaluation";
import { QualityAspectEvaluationResult } from "./QualityAspectEvaluation";
import { QualityAspect } from "../quamoco/QualityAspect";
import { ProductFactor } from "../quamoco/ProductFactor";
import { ImpactType } from "../quamoco/Impact";
import { MeasureValue } from "../quamoco/Measure";

type CalculatedMeasure = {
    name: string,
    value: MeasureValue
}

type ImpactWeight = "negative" | "slightly negative" | "neutral" | "slightly positive" | "positive";

type EvaluatedProductFactor = {
    id: string,
    name: string,
    productFactor: ProductFactor,
    result: ProductFactorEvaluationResult,
    measures: Map<string, CalculatedMeasure>,
    impacts: ForwardImpactingPath[]
}

type EvaluatedQualityAspect = {
    id: string,
    name: string,
    qualityAspect: QualityAspect,
    result: QualityAspectEvaluationResult,
    impacts: BackwardImpactingPath[]
}

type ForwardImpactingPath = {
    impactedFactorKey: string,
    impactedFactorName: string,
    impactType: ImpactType,
    weight: ImpactWeight,
    impactedFactor?: EvaluatedProductFactor | EvaluatedQualityAspect
}

type BackwardImpactingPath = {
    impactingFactorKey: string,
    impactingFactorName: string,
    impactType: ImpactType,
    weight: ImpactWeight,
    impactingFactor: EvaluatedProductFactor
}

class EvaluatedSystemModel {

    #system: System;
    #qualityModel: QualityModelInstance;
    #calculatedMeasures: Map<string, CalculatedMeasure>;
    #evaluatedProductFactors: Map<string, EvaluatedProductFactor>;
    #evaluatedQualityAspects: Map<string, EvaluatedQualityAspect>;
    #notImplementedProductFactors: Map<string, ProductFactor>;

    constructor(system: System, qualityModel: QualityModelInstance) {
        this.#system = system;
        this.#qualityModel = qualityModel;
        this.#calculatedMeasures = new Map();
        this.#evaluatedProductFactors = new Map();
        this.#evaluatedQualityAspects = new Map();
        this.#notImplementedProductFactors = new Map();
    }

    get getCalculatedMeasures() {
        return this.#calculatedMeasures;
    }

    get getEvaluatedProductFactors() {
        return this.#evaluatedProductFactors;
    }

    get getEvaluatedQualityAspects() {
        return this.#evaluatedQualityAspects;
    }

    evaluate() {

        let factorsToEvaluate = this.#qualityModel.productFactors.slice(0);

        factorLoop: while (factorsToEvaluate.length > 0) {
            let currentFactor = factorsToEvaluate[0];
    
            // if the current factor has impacting factors and any of these has not been evaluated yet, skip the current factor and try again later
            for (const impactingFactor of currentFactor.getImpactingFactors()) {
                if (!this.#evaluatedProductFactors.has(impactingFactor.getId) && !this.#notImplementedProductFactors.has(impactingFactor.getId)) {
                    factorsToEvaluate.push(factorsToEvaluate.splice(0, 1)[0]);
                    continue factorLoop;
                }
            }
    
            // TODO: temporarily ignore factors for which no evaluation is available
            if (!currentFactor.isEvaluationAvailable()) {
                !this.#notImplementedProductFactors.set(currentFactor.getId, currentFactor);
                factorsToEvaluate.splice(0, 1);
                continue factorLoop;
            }

            let measuresForThisFactor = new Map();
            currentFactor.getMeasures.forEach(measure => {
                if (this.#calculatedMeasures.has(measure.getId)) {
                    measuresForThisFactor.set(measure.getId, this.#calculatedMeasures.get(measure.getId));
                    return;
                } 
                if (measure.isCalculationAvailable()) {
                    let calculatedMeasure = { name: measure.getName, value: measure.calculate(this.#system) };

                    measuresForThisFactor.set(measure.getId, calculatedMeasure)
                    this.#calculatedMeasures.set(measure.getId, calculatedMeasure);
                }
            })
    
            let evaluatedProductFactor = {
                id: currentFactor.getId,
                name: currentFactor.getName,
                productFactor: currentFactor,
                result: currentFactor.evaluate(this),
                measures: measuresForThisFactor,
                impacts: []
            }
    
            for (const impact of currentFactor.getOutgoingImpacts) {
                evaluatedProductFactor.impacts.push({
                    impactedFactorKey: impact.getImpactedFactor.getId,
                    impactedFactorName: impact.getImpactedFactor.getName,
                    impactType: impact.getImpactType,
                    weight: "slightly" //TODO properly implement a weight assignment here depeding on evaluatedProductFactor.result
                })
            }
    
            // TODO if factor has incoming impacts, set them properly now in the evaluatedProductFactors
    
            this.#evaluatedProductFactors.set(currentFactor.getId, evaluatedProductFactor);
            factorsToEvaluate.splice(0, 1);
        }

        this.#qualityModel.measures.forEach(measure => {
            if (this.#calculatedMeasures.has(measure.getId)) {
                return;
            } 
            if (measure.isCalculationAvailable()) {
                let calculatedMeasure = { name: measure.getName, value: measure.calculate(this.#system) };
                this.#calculatedMeasures.set(measure.getId, calculatedMeasure);
            }
        }) 
    
    }

}

export { EvaluatedSystemModel, CalculatedMeasure,EvaluatedProductFactor, EvaluatedQualityAspect }