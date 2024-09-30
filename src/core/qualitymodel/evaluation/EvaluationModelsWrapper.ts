import { Component, Infrastructure, RequestTrace, System } from "@/core/entities";
import { QualityModelInstance } from "../QualityModelInstance";
import { EvaluatedEntityModel } from "./EvaluationModels";
import { ENTITIES } from "../specifications/entities";

export class EvaluationModelsWrapper {

    #qualityModel: QualityModelInstance;
    #system: System;
    #evaluatedSystemModel: EvaluatedEntityModel<ENTITIES.SYSTEM, System>;
    #evaluatedComponentModels: Map<string, EvaluatedEntityModel<ENTITIES.COMPONENT, Component>>;
    #evaluatedInfrastructureModels: Map<string, EvaluatedEntityModel<ENTITIES.INFRASTRUCTURE, Infrastructure>>;
    #evaluatedRequestTraceModels: Map<string, EvaluatedEntityModel<ENTITIES.REQUEST_TRACE, RequestTrace>>;

    constructor(system: System, qualityModel: QualityModelInstance) {
        this.#qualityModel = qualityModel;
        this.#system = system;
        this.#evaluatedSystemModel = new EvaluatedEntityModel(ENTITIES.SYSTEM, system, system, qualityModel);
        this.#evaluatedComponentModels = new Map();
        [...system.getComponentEntities.entries()].forEach(([componentId, component]) => {
            this.#evaluatedComponentModels.set(componentId, new EvaluatedEntityModel(ENTITIES.COMPONENT, component, system, qualityModel));
        })

        this.#evaluatedInfrastructureModels = new Map();
        [...system.getInfrastructureEntities.entries()].forEach(([infrastructureId, infrastructure]) => {
            this.#evaluatedInfrastructureModels.set(infrastructureId, new EvaluatedEntityModel(ENTITIES.INFRASTRUCTURE, infrastructure, system, qualityModel));
        })

        this.#evaluatedRequestTraceModels = new Map();
        [...system.getRequestTraceEntities.entries()].forEach(([requestTraceId, requestTrace]) => {
            this.#evaluatedRequestTraceModels.set(requestTraceId, new EvaluatedEntityModel(ENTITIES.REQUEST_TRACE, requestTrace, system, qualityModel));
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