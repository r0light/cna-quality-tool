import { System } from "../../entities";
import { QualityModelInstance } from "../QualityModelInstance";
import { QualityAspect } from "../quamoco/QualityAspect";
import { ProductFactor } from "../quamoco/ProductFactor";
import { ImpactType } from "../quamoco/Impact";
import { MeasureValue } from "../quamoco/Measure";

type CalculatedMeasure = {
    name: string,
    value: MeasureValue,
    description: string
}

type NumericEvaluationResult = number;
type OrdinalEvaluationResult = "none" | "low" | "high";
type AggregateResult = { tendency: string, impacts: string[] };
type ProductFactorEvaluationResult = NumericEvaluationResult | OrdinalEvaluationResult | "n/a" | AggregateResult;
type QualityAspectEvaluationResult = NumericEvaluationResult | OrdinalEvaluationResult | "n/a" | AggregateResult;

type ImpactWeight = "negative" | "slightly negative" | "neutral" | "slightly positive" | "positive" | "n/a";

type EvaluatedProductFactor = {
    id: string,
    name: string,
    factorType: 'productFactor', //TODO has to be "productFactor"
    productFactor: ProductFactor,
    result: ProductFactorEvaluationResult,
    measures: Map<string, CalculatedMeasure>,
    forwardImpacts: ForwardImpactingPath[],
    backwardImpacts: BackwardImpactingPath[]
}

type EvaluatedQualityAspect = {
    id: string,
    name: string,
    factorType: 'qualityAspect',  //TODO has to be "qualityAspect"
    qualityAspect: QualityAspect,
    result: QualityAspectEvaluationResult,
    backwardImpacts: BackwardImpactingPath[]
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

    constructor(system: System, qualityModel: QualityModelInstance) {
        this.#system = system;
        this.#qualityModel = qualityModel;
        this.#calculatedMeasures = new Map();
        this.#evaluatedProductFactors = new Map();
        this.#evaluatedQualityAspects = new Map();
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

    evaluate(activeQualityAspects: string[], activeProductFactors: string[]) {

        //TODO use supplied filters

        let factorsToEvaluate = this.#qualityModel.productFactors.slice(0);

        factorLoop: while (factorsToEvaluate.length > 0) {
            let currentFactor = factorsToEvaluate[0];

            if (!activeProductFactors.includes(currentFactor.getId)) {
                factorsToEvaluate.splice(0, 1);
                continue factorLoop;
            }


            // if the current factor has impacting factors and any of these has not been evaluated yet, skip the current factor and try again later
            for (const impactingFactor of currentFactor.getImpactingFactors()) {
                if (!this.#evaluatedProductFactors.has(impactingFactor.getId) && activeProductFactors.includes(impactingFactor.getId)) {
                    factorsToEvaluate.push(factorsToEvaluate.splice(0, 1)[0]);
                    continue factorLoop;
                }
            }

            // add measures for this factor
            let measuresForThisFactor = new Map();
            currentFactor.getSystemMeasures.forEach(measure => {
                if (this.#calculatedMeasures.has(measure.getId)) {
                    measuresForThisFactor.set(measure.getId, this.#calculatedMeasures.get(measure.getId));
                    return;
                }
                if (measure.isCalculationAvailable()) {
                    let calculatedMeasure = { name: measure.getName, value: measure.calculate(this.#system), description: measure.getCalculationDescription };

                    measuresForThisFactor.set(measure.getId, calculatedMeasure)
                    this.#calculatedMeasures.set(measure.getId, calculatedMeasure);
                }
            })

            let evaluatedProductFactor: EvaluatedProductFactor = {
                id: currentFactor.getId,
                name: currentFactor.getName,
                factorType: 'productFactor' as const,
                productFactor: currentFactor,
                result: currentFactor.isEvaluationAvailable() ? currentFactor.evaluate(this) : "n/a",
                measures: measuresForThisFactor,
                forwardImpacts: [],
                backwardImpacts: []
            }

            for (const impact of currentFactor.getOutgoingImpacts) {
                if (activeProductFactors.includes(impact.getImpactedFactor.getId) || activeQualityAspects.includes(impact.getImpactedFactor.getId)) {
                    evaluatedProductFactor.forwardImpacts.push({
                        impactedFactorKey: impact.getImpactedFactor.getId,
                        impactedFactorName: impact.getImpactedFactor.getName,
                        impactType: impact.getImpactType,
                        weight: deriveImpactWeight(evaluatedProductFactor.result, impact.getImpactType)
                    });
                }
            }


            for (const impact of currentFactor.getIncomingImpacts) {
                if (activeProductFactors.includes(impact.getSourceFactor.getId)) {
                    let impactingFactor = this.#evaluatedProductFactors.get(impact.getSourceFactor.getId);
                    let correspondingForwardingImpact = impactingFactor.forwardImpacts.find(impact => impact.impactedFactorKey === currentFactor.getId);
                    correspondingForwardingImpact.impactedFactor = evaluatedProductFactor;

                    evaluatedProductFactor.backwardImpacts.push({
                        impactingFactorKey: impactingFactor.id,
                        impactingFactorName: impactingFactor.name,
                        impactType: impact.getImpactType,
                        weight: correspondingForwardingImpact.weight,
                        impactingFactor: impactingFactor
                    })
                }
            }

            this.#evaluatedProductFactors.set(currentFactor.getId, evaluatedProductFactor);
            factorsToEvaluate.splice(0, 1);
        }

        aspectsLoop: for (const qualityAspect of this.#qualityModel.qualityAspects) {

            if (!activeQualityAspects.includes(qualityAspect.getId)) {
                continue aspectsLoop;
            }

            let evaluatedQualityAspect: EvaluatedQualityAspect = {
                id: qualityAspect.getId,
                name: qualityAspect.getName,
                factorType: "qualityAspect",
                qualityAspect: qualityAspect,
                result: qualityAspect.isEvaluationAvailable() ? qualityAspect.evaluate(this) : "n/a",
                backwardImpacts: []
            }

            for (const incomingImpact of qualityAspect.getIncomingImpacts) {

                if (activeProductFactors.includes(incomingImpact.getSourceFactor.getId)) {
                    let evaluatedProductFactor = this.#evaluatedProductFactors.get(incomingImpact.getSourceFactor.getId);

                    evaluatedQualityAspect.backwardImpacts.push({
                        impactingFactorKey: evaluatedProductFactor.id,
                        impactingFactorName: evaluatedProductFactor.name,
                        impactType: incomingImpact.getImpactType,
                        weight: evaluatedProductFactor.forwardImpacts.find(impact => impact.impactedFactorKey === evaluatedQualityAspect.id).weight,
                        impactingFactor: evaluatedProductFactor
                    })

                    this.#evaluatedProductFactors.get(incomingImpact.getSourceFactor.getId)
                        .forwardImpacts
                        .find(impact => impact.impactedFactorKey === evaluatedQualityAspect.id)
                        .impactedFactor = evaluatedQualityAspect;
                }
            }

            this.#evaluatedQualityAspects.set(evaluatedQualityAspect.id, evaluatedQualityAspect);
        }

        /*
        this.#qualityModel.measures.forEach(measure => {
            if (this.#calculatedMeasures.has(measure.getId)) {
                return;
            }
            if (measure.isCalculationAvailable()) {
                let calculatedMeasure = { name: measure.getName, value: measure.calculate(this.#system), description: measure.getCalculationDescription };
                this.#calculatedMeasures.set(measure.getId, calculatedMeasure);
            }
        })
            */

    }

}

// TODO: how to specify this and where to put it?
function deriveImpactWeight(evaluationResult: ProductFactorEvaluationResult, impactType: ImpactType): ImpactWeight {
    if (evaluationResult === "n/a") {
        return "n/a";
    }
    if (typeof evaluationResult === "string") {
        switch (evaluationResult) {
            case "none":
                return "neutral";
            case "low":
                if (impactType === "+" || impactType === "++") {
                    return "slightly positive";
                } else if (impactType === "--" || impactType === "-") {
                    return "slightly negative";
                }
                break;
            case "high":
                if (impactType === "+" || impactType === "++") {
                    return "positive";
                } else if (impactType === "--" || impactType === "-") {
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
            } else if (impactType === "--" || impactType === "-") {
                return "slightly negative";
            }
        }

        if (evaluationResult >= 0.5 && evaluationResult <= 1) {
            if (impactType === "+" || impactType === "++") {
                return "positive";
            } else if (impactType === "--" || impactType === "-") {
                return "negative";
            }
        }

        // else
        throw new Error("A numeric evaluation result for a product factor should be between 0 and 1, here it is: " + evaluationResult);
    } else if (evaluationResult.tendency && evaluationResult.impacts) {
        switch (evaluationResult.tendency) {
            case "positive":
                return "slightly positive" //TODO more specific
            case "neutral":
                return "neutral"
            case "negative":
                return "slightly negative"
            case "n/a":
            default:
                return "n/a";
        }
    }
}

export { EvaluatedSystemModel, CalculatedMeasure, ProductFactorEvaluationResult, QualityAspectEvaluationResult, EvaluatedProductFactor, OrdinalEvaluationResult, NumericEvaluationResult, ImpactWeight, EvaluatedQualityAspect, ForwardImpactingPath }