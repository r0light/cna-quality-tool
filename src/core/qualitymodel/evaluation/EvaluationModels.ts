import { Component, Infrastructure, RequestTrace, System } from "../../entities";
import { QualityModelInstance } from "../QualityModelInstance";
import { ImpactType } from "../quamoco/Impact";
import { CalculationParameters } from "../quamoco/Measure";
import { ProductFactor } from "../quamoco/ProductFactor";
import { QualityAspect } from "../quamoco/QualityAspect";
import { ENTITIES } from "../specifications/entities";
import { MeasureKey, ProductFactorKey, QualityAspectKey } from "../specifications/qualitymodel";
import { CalculatedMeasure, deriveImpactWeight, EvaluatedProductFactor, EvaluatedQualityAspect, FactorEvaluationResult, ImpactWeight } from "./Evaluation";

export interface Evaluation {
    evaluate(activeQualityAspects: string[], activeProductFactors: string[]): void,
    getCalculatedMeasures(): Map<MeasureKey, CalculatedMeasure>,
    getEvaluatedProductFactors(): Map<ProductFactorKey, EvaluatedProductFactor>,
    getEvaluatedQualityAspects(): Map<string, EvaluatedQualityAspect>,
}

class EvaluationModel {

    calculatedMeasures: Map<MeasureKey, CalculatedMeasure>;
    evaluatedProductFactors: Map<ProductFactorKey, EvaluatedProductFactor>;
    evaluatedQualityAspects: Map<QualityAspectKey, EvaluatedQualityAspect>;

    constructor() {
        this.calculatedMeasures = new Map();
        this.evaluatedProductFactors = new Map();
        this.evaluatedQualityAspects = new Map();
    }

}

class EvaluatedEntityModel<T extends `${ENTITIES}`, E> implements Evaluation {

    #qualityModel: QualityModelInstance;
    #evaluationModel: EvaluationModel
    #entityKey: T;
    #entity: E;
    #system: System;

    constructor(entityKey: T, entity: E, system: System, qualityModel: QualityModelInstance) {
        this.#qualityModel = qualityModel;
        this.#evaluationModel = new EvaluationModel();
        this.#entityKey = entityKey;
        this.#entity = entity;
        this.#system = system;
    }

    getCalculatedMeasures() {
        return this.#evaluationModel.calculatedMeasures;
    }
    getEvaluatedProductFactors() {
        return this.#evaluationModel.evaluatedProductFactors;
    }
    getEvaluatedQualityAspects() {
        return this.#evaluationModel.evaluatedQualityAspects;
    }

    evaluate(activeQualityAspects: string[], activeProductFactors: string[]) {

        let factorsToEvaluate = this.#qualityModel.productFactors.slice(0).filter(factor => activeProductFactors.includes(factor.getId));
        let aspectsToEvaluate = this.#qualityModel.qualityAspects.slice(0).filter(aspect => activeQualityAspects.includes(aspect.getId));

        let factorKeys: string[] = factorsToEvaluate.map(factor => factor.getId);
        let aspectKeys: string[] = aspectsToEvaluate.map(aspect => aspect.getId);

        factorLoop: while (factorsToEvaluate.length > 0) {
            let currentFactor = factorsToEvaluate[0];

            // if the current factor has impacting factors and any of these has not been evaluated yet, skip the current factor and try again later
            for (const impactingFactor of currentFactor.getImpactingFactors()) {
                if (!this.#evaluationModel.evaluatedProductFactors.has(impactingFactor.getId) && factorKeys.includes(impactingFactor.getId)) {
                    factorsToEvaluate.push(factorsToEvaluate.splice(0, 1)[0]);
                    continue factorLoop;
                }
            }


            // add measures for this factor
            let measuresForThisFactor = new Map();
            currentFactor.getMeasuresFor(this.#entityKey).forEach(measure => {
                if (this.#evaluationModel.calculatedMeasures.has(measure.getId)) {
                    measuresForThisFactor.set(measure.getId, this.#evaluationModel.calculatedMeasures.get(measure.getId));
                    return;
                }
                if (measure.isCalculationAvailable()) {
                    let calculatedMeasure: CalculatedMeasure = { name: measure.getName, entity: this.#entityKey, value: measure.calculate({ entity: this.#entity, system: this.#system }), description: measure.getCalculationDescription };

                    measuresForThisFactor.set(measure.getId, calculatedMeasure)
                    this.#evaluationModel.calculatedMeasures.set(measure.getId, calculatedMeasure);
                }
            })


            let evaluatedProductFactor: EvaluatedProductFactor = {
                id: currentFactor.getId,
                name: currentFactor.getName,
                factorType: 'productFactor' as const,
                productFactor: currentFactor,
                result: currentFactor.isEvaluationAvailable(this.#entityKey) ? currentFactor.evaluate(this.#entityKey, this) : "n/a",
                measures: measuresForThisFactor,
                forwardImpacts: [],
                backwardImpacts: []
            }

            for (const impact of currentFactor.getOutgoingImpacts) {
                if (factorKeys.includes(impact.getImpactedFactor.getId) || aspectKeys.includes(impact.getImpactedFactor.getId)) {
                    evaluatedProductFactor.forwardImpacts.push({
                        impactedFactorKey: impact.getImpactedFactor.getId,
                        impactedFactorName: impact.getImpactedFactor.getName,
                        impactType: impact.getImpactType,
                        weight: deriveImpactWeight(evaluatedProductFactor.result, impact.getImpactType)
                    });
                }
            }


            for (const impact of currentFactor.getIncomingImpacts) {
                if (factorKeys.includes(impact.getSourceFactor.getId)) {
                    let impactingFactor = this.#evaluationModel.evaluatedProductFactors.get(impact.getSourceFactor.getId);
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

            this.#evaluationModel.evaluatedProductFactors.set(currentFactor.getId, evaluatedProductFactor);
            factorsToEvaluate.splice(0, 1);
        }

        aspectsLoop: for (const qualityAspect of aspectsToEvaluate) {

            let evaluatedQualityAspect: EvaluatedQualityAspect = {
                id: qualityAspect.getId,
                name: qualityAspect.getName,
                factorType: "qualityAspect",
                qualityAspect: qualityAspect,
                result: qualityAspect.isEvaluationAvailable() ? qualityAspect.evaluate(this) : "n/a",
                backwardImpacts: []
            }

            for (const incomingImpact of qualityAspect.getIncomingImpacts) {

                if (factorKeys.includes(incomingImpact.getSourceFactor.getId)) {
                    let evaluatedProductFactor = this.#evaluationModel.evaluatedProductFactors.get(incomingImpact.getSourceFactor.getId);

                    evaluatedQualityAspect.backwardImpacts.push({
                        impactingFactorKey: evaluatedProductFactor.id,
                        impactingFactorName: evaluatedProductFactor.name,
                        impactType: incomingImpact.getImpactType,
                        weight: evaluatedProductFactor.forwardImpacts.find(impact => impact.impactedFactorKey === evaluatedQualityAspect.id).weight,
                        impactingFactor: evaluatedProductFactor
                    })

                    this.#evaluationModel.evaluatedProductFactors.get(incomingImpact.getSourceFactor.getId)
                        .forwardImpacts
                        .find(impact => impact.impactedFactorKey === evaluatedQualityAspect.id)
                        .impactedFactor = evaluatedQualityAspect;
                }
            }

            this.#evaluationModel.evaluatedQualityAspects.set(evaluatedQualityAspect.id, evaluatedQualityAspect);
        }
    }
}


export { EvaluatedEntityModel }