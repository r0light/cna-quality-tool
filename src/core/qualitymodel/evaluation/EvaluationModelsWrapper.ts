import { System } from "@/core/entities";
import { QualityModelInstance } from "../QualityModelInstance";
import { EvaluatedComponentModel, EvaluatedInfrastructureModel, EvaluatedRequestTraceModel, EvaluatedSystemModel } from "./EvaluationModels";

export class EvaluationModelsWrapper {

    #qualityModel: QualityModelInstance;
    #system: System;
    #evaluatedSystemModel: EvaluatedSystemModel;
    #evaluatedComponentModels: Map<string, EvaluatedComponentModel>;
    #evaluatedInfrastructureModels: Map<string,EvaluatedInfrastructureModel>;
    #evaluatedRequestTraceModels: Map<string, EvaluatedRequestTraceModel>;

    constructor(system: System, qualityModel: QualityModelInstance) {
        this.#qualityModel = qualityModel;
        this.#system = system;
        this.#evaluatedSystemModel = new EvaluatedSystemModel(system, qualityModel);
        this.#evaluatedComponentModels = new Map();
        [...system.getComponentEntities.entries()].forEach(([componentId, component]) => {
            this.#evaluatedComponentModels.set(componentId, new EvaluatedComponentModel(system, component, qualityModel));
        })

        this.#evaluatedInfrastructureModels = new Map();
        [...system.getInfrastructureEntities.entries()].forEach(([infrastructureId, infrastructure]) => {
            this.#evaluatedInfrastructureModels.set(infrastructureId, new EvaluatedInfrastructureModel(system, infrastructure, qualityModel));
        })

        this.#evaluatedRequestTraceModels = new Map();
        [...system.getRequestTraceEntities.entries()].forEach(([requestTraceId, requestTrace]) => {
            this.#evaluatedRequestTraceModels.set(requestTraceId, new EvaluatedRequestTraceModel(system, requestTrace, qualityModel));
        })

        this.getEvaluatedSystemModel = this.getEvaluatedSystemModel.bind(this);
        this.getAvailableComponents = this.getAvailableComponents.bind(this);
        this.getEvaluatedComponentModel = this.getEvaluatedComponentModel.bind(this);
        this.getAvailableInfrastructureEntities = this.getAvailableInfrastructureEntities.bind(this);
        this.getEvaluatedInfrastructureModel = this.getEvaluatedInfrastructureModel.bind(this);
        this.getAvailableRequestTraces = this.getAvailableRequestTraces.bind(this);
        this.getEvaluatedRequestTraceModel = this.getEvaluatedRequestTraceModel.bind(this);
    }

    getEvaluatedSystemModel(activeQualityAspects: string[], activeProductFactors: string[]) {
        this.#evaluatedSystemModel.evaluate(activeQualityAspects, activeProductFactors);
        return this.#evaluatedSystemModel;
    }

    getAvailableComponents() {
        return [...this.#evaluatedComponentModels.keys()]
    }

    getEvaluatedComponentModel(componentId: string, activeQualityAspects: string[], activeProductFactors: string[]) {
        this.#evaluatedComponentModels.get(componentId).evaluate(activeQualityAspects, activeProductFactors);
        return this.#evaluatedComponentModels.get(componentId);
    }

    getAvailableInfrastructureEntities() {
        return [...this.#evaluatedInfrastructureModels.keys()]
    }

    getEvaluatedInfrastructureModel(infrastructureId: string, activeQualityAspects: string[], activeProductFactors: string[]) {
        this.#evaluatedInfrastructureModels.get(infrastructureId).evaluate(activeQualityAspects, activeProductFactors);
        return this.#evaluatedInfrastructureModels.get(infrastructureId);
    }

    getAvailableRequestTraces() {
        return [...this.#evaluatedRequestTraceModels.keys()];
    }

    getEvaluatedRequestTraceModel(requestTraceId: string, activeQualityAspects: string[], activeProductFactors: string[]) {
        this.#evaluatedRequestTraceModels.get(requestTraceId).evaluate(activeQualityAspects, activeProductFactors);
        return this.#evaluatedRequestTraceModels.get(requestTraceId);
    }

}