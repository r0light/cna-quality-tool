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

type ImpactWeight = "negative" | "slightly negative" | "neutral" | "slightly positive" | "positive" | "n/a";

type EvaluatedProductFactor = {
    id: string,
    name: string,
    factorType: 'productFactor', //TODO has to be "productFactor"
    productFactor: ProductFactor,
    result: ProductFactorEvaluationResult,
    measures: Map<string, CalculatedMeasure>,
    impacts: ForwardImpactingPath[] //TODO | BackwardImpactingPath[] ?
}

type EvaluatedQualityAspect = {
    id: string,
    name: string,
    factorType: 'qualityAspect',  //TODO has to be "qualityAspect"
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

            // add measures for this factor
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
                factorType: 'productFactor' as const,
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
                    weight: deriveImpactWeight(evaluatedProductFactor.result, impact.getImpactType)
                });
            }
    

            for (const impact of currentFactor.getIncomingImpacts) {
                // TODO currently only add them, if they were evaluated
                if (this.#evaluatedProductFactors.has(impact.getSourceFactor.getId)) {
                    this.#evaluatedProductFactors.get(impact.getSourceFactor.getId).impacts.find(impact => impact.impactedFactorKey === currentFactor.getId).impactedFactor = evaluatedProductFactor;
                }
            }
    
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

        console.log(this);
    
    }

}

// TODO: how to specify this and where to put it?
function deriveImpactWeight(evaluationResult: ProductFactorEvaluationResult, impactType: ImpactType): ImpactWeight {
    if (evaluationResult === "n/a") {
        return "n/a"
    }
    if (typeof evaluationResult === "string") {
        switch(evaluationResult) {
            case "none":
                return "neutral";
            case "low":
                if (impactType === "+" || impactType === "++") {
                    return "slightly positive";
                } else  if (impactType === "--" || impactType === "-") {
                    return "slightly negative";
                }
                break;
            case "high":
                if (impactType === "+" || impactType === "++") {
                    return "positive";
                } else  if (impactType === "--" || impactType === "-") {
                    return "negative";
                }
                break;
        }
    } else if (typeof evaluationResult === "number") {
        if (evaluationResult === 0) {
            return "neutral";
        }

        if (evaluationResult > 0 && evaluationResult < 0.5) {
            if (impactType === "+" || impactType === "++") {
                return "slightly positive";
            } else  if (impactType === "--" || impactType === "-") {
                return "slightly negative";
            }
        }

        if (evaluationResult >= 0.5 && evaluationResult <= 1) {
            if (impactType === "+" || impactType === "++") {
                return "positive";
            } else  if (impactType === "--" || impactType === "-") {
                return "negative";
            }
        }

        // else
        throw new Error("A numeric evaluation result for a product factor should be between 0 and 1, here it is: " + evaluationResult);

    }
}

export { EvaluatedSystemModel, CalculatedMeasure,EvaluatedProductFactor, EvaluatedQualityAspect, ForwardImpactingPath }