import { Component, Infrastructure, RequestTrace, System } from "../../entities";
import { QualityModelInstance } from "../QualityModelInstance";
import { ImpactType } from "../quamoco/Impact";
import { ProductFactor } from "../quamoco/ProductFactor";
import { QualityAspect } from "../quamoco/QualityAspect";
import { ENTITIES } from "../specifications/entities";
import { MeasureKey, ProductFactorKey } from "../specifications/qualitymodel";
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
    evaluatedQualityAspects: Map<string, EvaluatedQualityAspect>;

    constructor() {
        this.calculatedMeasures = new Map();
        this.evaluatedProductFactors = new Map();
        this.evaluatedQualityAspects = new Map();
    }

}

class EvaluatedSystemModel implements Evaluation {

    #qualityModel: QualityModelInstance;
    #evaluationModel: EvaluationModel
    #system: System;

    constructor(system: System, qualityModel: QualityModelInstance) {
        this.#qualityModel = qualityModel;
        this.#evaluationModel = new EvaluationModel();
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

        evaluateBasedOnQualityModel(this, factorsToEvaluate, aspectsToEvaluate, this.#evaluationModel, (factor: ProductFactor) => {
            let measuresForThisFactor = new Map();
            factor.getSystemMeasures.forEach(measure => {
                if (this.#evaluationModel.calculatedMeasures.has(measure.getId)) {
                    measuresForThisFactor.set(measure.getId, this.#evaluationModel.calculatedMeasures.get(measure.getId));
                    return;
                }
                if (measure.isCalculationAvailable()) {
                    let calculatedMeasure: CalculatedMeasure = { name: measure.getName, type: 'system', entity: ENTITIES.SYSTEM, value: measure.calculate(this.#system), description: measure.getCalculationDescription };

                    measuresForThisFactor.set(measure.getId, calculatedMeasure)
                    this.#evaluationModel.calculatedMeasures.set(measure.getId, calculatedMeasure);
                }
            })

            return measuresForThisFactor;
        })
    }
}


class EvaluatedComponentModel implements Evaluation {

    #qualityModel: QualityModelInstance;
    #evaluationModel: EvaluationModel
    #component: Component
    #system: System;

    constructor(system: System, component: Component, qualityModel: QualityModelInstance) {
        this.#qualityModel = qualityModel;
        this.#evaluationModel = new EvaluationModel();
        this.#system = system;
        this.#component = component;
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

        evaluateBasedOnQualityModel(this, factorsToEvaluate, aspectsToEvaluate, this.#evaluationModel, (factor: ProductFactor) => {
            let measuresForThisFactor = new Map();
            factor.getComponentMeasures.forEach(measure => {
                if (this.#evaluationModel.calculatedMeasures.has(measure.getId)) {
                    measuresForThisFactor.set(measure.getId, this.#evaluationModel.calculatedMeasures.get(measure.getId));
                    return;
                }
                if (measure.isCalculationAvailable()) {
                    let calculatedMeasure: CalculatedMeasure = { name: measure.getName, type: 'component', entity: ENTITIES.COMPONENT, value: measure.calculate({ component: this.#component, system: this.#system }), description: measure.getCalculationDescription };

                    measuresForThisFactor.set(measure.getId, calculatedMeasure)
                    this.#evaluationModel.calculatedMeasures.set(measure.getId, calculatedMeasure);
                }
            })

            return measuresForThisFactor;
        })
    }
}

class EvaluatedComponentPairModel implements Evaluation {

    #qualityModel: QualityModelInstance;
    #evaluationModel: EvaluationModel;
    #componentA: Component;
    #componentB: Component;
    #system: System;

    constructor(system: System, componentA: Component, componentB: Component, qualityModel: QualityModelInstance) {
        this.#qualityModel = qualityModel;
        this.#evaluationModel = new EvaluationModel();
        this.#system = system;
        this.#componentA = componentA;
        this.#componentB = componentB;
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

        evaluateBasedOnQualityModel(this, factorsToEvaluate, aspectsToEvaluate, this.#evaluationModel, (factor: ProductFactor) => {
            let measuresForThisFactor = new Map();
            factor.getComponentPairMeasures.forEach(measure => {
                if (this.#evaluationModel.calculatedMeasures.has(measure.getId)) {
                    measuresForThisFactor.set(measure.getId, this.#evaluationModel.calculatedMeasures.get(measure.getId));
                    return;
                }
                if (measure.isCalculationAvailable()) {
                    let calculatedMeasure: CalculatedMeasure = { name: measure.getName, type: 'componentPair', entity: ENTITIES.COMPONENT, value: measure.calculate({ componentA: this.#componentA, componentB: this.#componentB, system: this.#system }), description: measure.getCalculationDescription };

                    measuresForThisFactor.set(measure.getId, calculatedMeasure)
                    this.#evaluationModel.calculatedMeasures.set(measure.getId, calculatedMeasure);
                }
            })

            return measuresForThisFactor;
        })
    }
}

class EvaluatedInfrastructureModel implements Evaluation {

    #qualityModel: QualityModelInstance;
    #evaluationModel: EvaluationModel
    #infrastructure: Infrastructure;
    #system: System;

    constructor(system: System, infrastructure: Infrastructure, qualityModel: QualityModelInstance) {
        this.#qualityModel = qualityModel;
        this.#evaluationModel = new EvaluationModel();
        this.#system = system;
        this.#infrastructure = infrastructure;
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

        evaluateBasedOnQualityModel(this, factorsToEvaluate, aspectsToEvaluate, this.#evaluationModel, (factor: ProductFactor) => {
            let measuresForThisFactor = new Map();
            factor.getInfrastructureMeasures.forEach(measure => {
                if (this.#evaluationModel.calculatedMeasures.has(measure.getId)) {
                    measuresForThisFactor.set(measure.getId, this.#evaluationModel.calculatedMeasures.get(measure.getId));
                    return;
                }
                if (measure.isCalculationAvailable()) {
                    let calculatedMeasure: CalculatedMeasure = { name: measure.getName, type: 'infrastructure', entity: ENTITIES.INFRASTRUCTURE, value: measure.calculate({ infrastructure: this.#infrastructure, system: this.#system }), description: measure.getCalculationDescription };

                    measuresForThisFactor.set(measure.getId, calculatedMeasure)
                    this.#evaluationModel.calculatedMeasures.set(measure.getId, calculatedMeasure);
                }
            })

            return measuresForThisFactor;
        })
    }
}

class EvaluatedRequestTraceModel implements Evaluation {

    #qualityModel: QualityModelInstance;
    #evaluationModel: EvaluationModel
    #requestTrace: RequestTrace;
    #system: System;

    constructor(system: System, requestTrace: RequestTrace, qualityModel: QualityModelInstance) {
        this.#qualityModel = qualityModel;
        this.#evaluationModel = new EvaluationModel();
        this.#system = system;
        this.#requestTrace = requestTrace;
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

        evaluateBasedOnQualityModel(this, factorsToEvaluate, aspectsToEvaluate, this.#evaluationModel, (factor: ProductFactor) => {
            let measuresForThisFactor = new Map();
            factor.getRequestTraceMeasures.forEach(measure => {
                if (this.#evaluationModel.calculatedMeasures.has(measure.getId)) {
                    measuresForThisFactor.set(measure.getId, this.#evaluationModel.calculatedMeasures.get(measure.getId));
                    return;
                }
                if (measure.isCalculationAvailable()) {
                    let calculatedMeasure: CalculatedMeasure = { name: measure.getName, type: 'requestTrace', entity: ENTITIES.REQUEST_TRACE, value: measure.calculate({ requestTrace: this.#requestTrace, system: this.#system }), description: measure.getCalculationDescription };

                    measuresForThisFactor.set(measure.getId, calculatedMeasure)
                    this.#evaluationModel.calculatedMeasures.set(measure.getId, calculatedMeasure);
                }
            })

            return measuresForThisFactor;
        })
    }
}

function evaluateBasedOnQualityModel(
    evaluation: Evaluation,
    factorsToEvaluate: ProductFactor[],
    aspectsToEvaluate: QualityAspect[],
    evaluationModel: EvaluationModel,
    calculateFactorMeasures: (factor: ProductFactor) => Map<string, CalculatedMeasure>
) {

    let factorKeys: string[] = factorsToEvaluate.map(factor => factor.getId);
    let aspectKeys: string[] = aspectsToEvaluate.map(aspect => aspect.getId);

    factorLoop: while (factorsToEvaluate.length > 0) {
        let currentFactor = factorsToEvaluate[0];

        // if the current factor has impacting factors and any of these has not been evaluated yet, skip the current factor and try again later
        for (const impactingFactor of currentFactor.getImpactingFactors()) {
            if (!evaluationModel.evaluatedProductFactors.has(impactingFactor.getId) && factorKeys.includes(impactingFactor.getId)) {
                factorsToEvaluate.push(factorsToEvaluate.splice(0, 1)[0]);
                continue factorLoop;
            }
        }


        // add measures for this factor
        let measuresForThisFactor = calculateFactorMeasures(currentFactor);

        let evaluatedProductFactor: EvaluatedProductFactor = {
            id: currentFactor.getId,
            name: currentFactor.getName,
            factorType: 'productFactor' as const,
            productFactor: currentFactor,
            result: currentFactor.isEvaluationAvailable() ? currentFactor.evaluate(evaluation) : "n/a",
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
                let impactingFactor = evaluationModel.evaluatedProductFactors.get(impact.getSourceFactor.getId);
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

        evaluationModel.evaluatedProductFactors.set(currentFactor.getId, evaluatedProductFactor);
        factorsToEvaluate.splice(0, 1);
    }

    aspectsLoop: for (const qualityAspect of aspectsToEvaluate) {

        let evaluatedQualityAspect: EvaluatedQualityAspect = {
            id: qualityAspect.getId,
            name: qualityAspect.getName,
            factorType: "qualityAspect",
            qualityAspect: qualityAspect,
            result: qualityAspect.isEvaluationAvailable() ? qualityAspect.evaluate(evaluation) : "n/a",
            backwardImpacts: []
        }

        for (const incomingImpact of qualityAspect.getIncomingImpacts) {

            if (factorKeys.includes(incomingImpact.getSourceFactor.getId)) {
                let evaluatedProductFactor = evaluationModel.evaluatedProductFactors.get(incomingImpact.getSourceFactor.getId);

                evaluatedQualityAspect.backwardImpacts.push({
                    impactingFactorKey: evaluatedProductFactor.id,
                    impactingFactorName: evaluatedProductFactor.name,
                    impactType: incomingImpact.getImpactType,
                    weight: evaluatedProductFactor.forwardImpacts.find(impact => impact.impactedFactorKey === evaluatedQualityAspect.id).weight,
                    impactingFactor: evaluatedProductFactor
                })

                evaluationModel.evaluatedProductFactors.get(incomingImpact.getSourceFactor.getId)
                    .forwardImpacts
                    .find(impact => impact.impactedFactorKey === evaluatedQualityAspect.id)
                    .impactedFactor = evaluatedQualityAspect;
            }
        }

        evaluationModel.evaluatedQualityAspects.set(evaluatedQualityAspect.id, evaluatedQualityAspect);
    }
}


export { EvaluatedSystemModel, EvaluatedComponentModel, EvaluatedComponentPairModel, EvaluatedInfrastructureModel, EvaluatedRequestTraceModel }