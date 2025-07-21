<template>
    <div class="full-width">
        <div class="d-flex flex-column p-1 evaluation-background">
            <h2>Evaluation {{ currentEvaluationName }}</h2>
            <FilterToolbar :highLevelAspectFilter="highLevelAspectFilter" :factorCategoryFilter="factorCategoryFilter"
                @update:filters="saveEvaluationConfig(); triggerEvaluation()"></FilterToolbar>
            <div class="d-flex flex-row selection-bar">
                <div class="m-1 evaluation-tool">
                    <span>Select the evaluation viewpoint: </span>
                    <select v-model="selectedViewpoint" @change="saveEvaluationConfig">
                        <option value="perQualityAspect">per Quality Aspect</option>
                        <option value="perProductFactor">per Product Factor</option>
                    </select>
                </div>
                <div class="m-1 evaluation-tool">
                    <span>Select the modeled system to evaluate: </span>
                    <select @change="onSelectSystem" v-model="selectedSystemId">
                        <option value=-1>Select a system...</option>
                        <option v-for="system of systemsData" :value="system.id">{{ system.name }}</option>
                    </select>
                </div>
                <div class="m-1 evaluation-tool">
                    <span>Show inconclusive evaluations? </span>
                    <input type="checkbox" v-model="showInconclusive" @change="saveEvaluationConfig">
                </div>
                <div class="m-1 evaluation-tool">
                    <button class="btn btn-secondary selection-bar-button" :disabled="selectedSystemId === -1"
                        @click="exportMeasures">Export measures as CSV</button>
                </div>
                <div class="m-1 evaluation-tool">
                    <button class="btn btn-secondary selection-bar-button" :disabled="selectedSystemId === -1"
                        @click="exportEvaluation">Export evaluation as CSV</button>
                </div>
            </div>
            <div class="d-flex flex-row selection-bar" v-if="selectedSystemId > -1">
                <div class="m-1 evaluation-tool">
                    <span>Select a component to evaluate: </span>
                    <select @change="onSelectEntity('component')" v-model="selectedComponentId">
                        <option v-for="component of selectableEntities.components" :value="component.id">{{
                            component.name }}</option>
                    </select>
                </div>
                <div class="m-1 evaluation-tool">
                    <span>Select an infrastructure to evaluate: </span>
                    <select @change="onSelectEntity('infrastructure')" v-model="selectedInfrastructureId">
                        <option v-for="infrastructure of selectableEntities.infrastructures" :value="infrastructure.id">
                            {{ infrastructure.name }}</option>
                    </select>
                </div>
                <div class="m-1 evaluation-tool">
                    <span>Select a request trace to evaluate: </span>
                    <select @change="onSelectEntity('requestTrace')" v-model="selectedRequestTraceId">
                        <option v-for="requestTrace of selectableEntities.requestTraces" :value="requestTrace.id">{{
                            requestTrace.name }}</option>
                    </select>
                </div>
            </div>
            <div v-if="selectedSystemId > -1">
                <div v-if="selectedViewpoint === 'perProductFactor'">
                    <ProductFactorViewpoint
                        :evaluatedProductFactors="(evaluatedProductFactors as Map<string, EvaluatedProductFactor>)"
                        :showInconclusiveEvaluations="showInconclusive">
                    </ProductFactorViewpoint>
                </div>
                <div v-if="selectedViewpoint === 'perQualityAspect'">
                    <QualityAspectViewpoint
                        :evaluatedQualityAspects="(evaluatedQualityAspects as Map<string, EvaluatedQualityAspect>)"
                        :showInconclusiveEvaluations="showInconclusive">
                    </QualityAspectViewpoint>
                </div>
                <!--<div v-for="[key, calculatedMeasure] of calculatedMeasures">
                    <span>{{ calculatedMeasure.name }}</span>: <span> {{ calculatedMeasure.value }}</span>
                </div>-->
            </div>

        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, onMounted, onUpdated, ref, toRaw } from 'vue';
import { ModelingData } from '../App.vue';
import { QualityModelInstance, getQualityModel } from '@/core/qualitymodel/QualityModelInstance';
import ProductFactorViewpoint from './ProductFactorViewpoint.vue';
import QualityAspectViewpoint from './QualityAspectViewpoint.vue';
import FilterToolbar, { ItemFilter, createFactorCategoryFilter, createHighLevelAspectFilter, getActiveElements, getActiveFilterItems } from '../qualitymodel/FilterToolbar.vue';
import SystemEntityManager from '@/modeling/systemEntityManager';
import { entityShapes } from '@/modeling/config/entityShapes';
import { dia } from '@joint/core';
import { CalculatedMeasure, EvaluatedProductFactor, EvaluatedQualityAspect } from '@/core/qualitymodel/evaluation/Evaluation';
import { triggerDownload } from '@/modeling/utilities';
import { ProductFactorKey, QualityAspectKey } from '@/core/qualitymodel/specifications/qualitymodel';
import { EvaluationModelsWrapper } from '@/core/qualitymodel/evaluation/EvaluationModelsWrapper';
import { System } from '@/core/entities';
import { Evaluation } from '@/core/qualitymodel/evaluation/EvaluationModels';

type EvaluationViewpoint = "perQualityAspect" | "perProductFactor";

type EvaluationConfig = {
    highLevelAspectFilter: ItemFilter,
    factorCategoryFilter: ItemFilter,
    selectedViewpoint: EvaluationViewpoint,
    showInconclusive: boolean
}

const props = defineProps<{
    systemsData: ModelingData[],
    evaluatedSystemId: number,
    evaluatedEntityId: string,
    evaluationConfig: EvaluationConfig
}>()

const emit = defineEmits<{
    (e: "update:evaluatedSystem", systemId: number): void;
    (e: "update:evaluatedEntity", entityId: string): void,
    (e: "update:evaluationConfig", evaluationConfig: EvaluationConfig): void;
}>()

const qualityModel: QualityModelInstance = getQualityModel();

const highLevelAspectFilter = ref<ItemFilter>(createHighLevelAspectFilter(qualityModel));

const factorCategoryFilter = ref<ItemFilter>(createFactorCategoryFilter(qualityModel));

const selectedSystemId = ref<number>(-1);

const selectedViewpoint = ref<EvaluationViewpoint>("perProductFactor");

const showInconclusive = ref<boolean>(false);

function saveEvaluationConfig() {
    emit("update:evaluationConfig", {
        highLevelAspectFilter: highLevelAspectFilter.value,
        factorCategoryFilter: factorCategoryFilter.value,
        selectedViewpoint: selectedViewpoint.value,
        showInconclusive: showInconclusive.value
    })
}

type SelectatableEntity = { id: string, name: string };
const unselectedEntity = { id: "none", name: "" };
const selectableEntities = ref<{ components: SelectatableEntity[], infrastructures: SelectatableEntity[], requestTraces: SelectatableEntity[] }>({ components: [unselectedEntity], infrastructures: [unselectedEntity], requestTraces: [unselectedEntity] });
const selectedComponentId = ref<string>("none");
const selectedInfrastructureId = ref<string>("none");
const selectedRequestTraceId = ref<string>("none");

const evaluationModelsWrapper = ref<EvaluationModelsWrapper>(null);

const calculatedMeasures = ref<Map<string, CalculatedMeasure>>(new Map());

const evaluatedProductFactors = ref<Map<ProductFactorKey, EvaluatedProductFactor>>(new Map());

const evaluatedQualityAspects = ref<Map<QualityAspectKey, EvaluatedQualityAspect>>(new Map());

const currentEvaluationName: ComputedRef<string> = computed(() => {
    let nameToShow = "";
    if (selectedComponentId.value && selectedComponentId.value !== "none") {
        nameToShow = ` of component: ${selectableEntities.value.components.find(component => component.id === selectedComponentId.value).name} in system ${props.systemsData.find(system => system.id === selectedSystemId.value).name}`;
    } else if (selectedInfrastructureId.value && selectedInfrastructureId.value !== "none") {
        nameToShow = ` of infrastructure: ${selectableEntities.value.infrastructures.find(infrastructure => infrastructure.id === selectedInfrastructureId.value).name} in system ${props.systemsData.find(system => system.id === selectedSystemId.value).name}`;
    } else if (selectedRequestTraceId.value && selectedRequestTraceId.value !== "none") {
        nameToShow = ` of request trace: ${selectableEntities.value.requestTraces.find(requestTrace => requestTrace.id === selectedRequestTraceId.value).name} in system ${props.systemsData.find(system => system.id === selectedSystemId.value).name}`;
    } else if (selectedSystemId.value && props.systemsData.find(system => system.id === selectedSystemId.value)) {
        nameToShow = " of system: ".concat(props.systemsData.find(system => system.id === selectedSystemId.value).name);
    }
    return nameToShow;
});

onMounted(() => {

    if (props.evaluationConfig) {
        if (props.evaluationConfig.highLevelAspectFilter) {
            highLevelAspectFilter.value = props.evaluationConfig.highLevelAspectFilter;
        }
        if (props.evaluationConfig.factorCategoryFilter) {
            factorCategoryFilter.value = props.evaluationConfig.factorCategoryFilter;
        }
        if (props.evaluationConfig.selectedViewpoint) {
            selectedViewpoint.value = props.evaluationConfig.selectedViewpoint;
        }
        if (props.evaluationConfig.showInconclusive) {
            showInconclusive.value = props.evaluationConfig.showInconclusive
        }
    }

    if (props.evaluatedSystemId && props.systemsData.find(system => system.id === props.evaluatedSystemId)) {
        selectedSystemId.value = props.evaluatedSystemId;
        onSelectSystem();
        if (props.evaluatedEntityId) {
            if (selectableEntities.value.components.find(selectableComponent => selectableComponent.id === props.evaluatedEntityId)) {
                selectedComponentId.value = props.evaluatedEntityId;
                onSelectEntity("component");
            }
            if (selectableEntities.value.infrastructures.find(selectableInfrastructure => selectableInfrastructure.id === props.evaluatedEntityId)) {
                selectedInfrastructureId.value = props.evaluatedEntityId;
                onSelectEntity("infrastructure");
            }
            if (selectableEntities.value.requestTraces.find(selectableRequestTrace => selectableRequestTrace.id === props.evaluatedEntityId)) {
                selectedRequestTraceId.value = props.evaluatedEntityId;
                onSelectEntity("requestTrace");
            }
        }
    }
});

onUpdated(() => {

    if (!props.systemsData.find(system => system.id === selectedSystemId.value)) {
        selectedSystemId.value = -1;
        clearEvaluation();
    }

});


function onSelectSystem() {

    let selectedSystem = props.systemsData.find(system => system.id === selectedSystemId.value);

    if (!selectedSystem) {
        // selectedSystem might not be findable, if it has been deleted
        selectedSystemId.value = -1;
        clearEvaluation();
        resetEntitySelection();
        return;
    }
    emit("update:evaluatedSystem", selectedSystemId.value);
    resetEntitySelection();

    let systemEntityManager = selectedSystem.entityManager ? toRaw(selectedSystem.entityManager) : createTemporaryEntityManager(selectedSystem);
    let currentSystemEntity = systemEntityManager.getSystemEntity();

    currentSystemEntity.getComponentEntities.entries().forEach(([componentId, component]) => {
        selectableEntities.value.components.push({ id: componentId, name: component.getName });
    })
    currentSystemEntity.getInfrastructureEntities.entries().forEach(([infrastructureId, infrastructure]) => {
        selectableEntities.value.infrastructures.push({ id: infrastructureId, name: infrastructure.getName });
    })
    currentSystemEntity.getRequestTraceEntities.entries().forEach(([requestTraceId, requestTrace]) => {
        selectableEntities.value.requestTraces.push({ id: requestTraceId, name: requestTrace.getName });
    })
    // ------------

    triggerEvaluation();
}

function onSelectEntity(type: "component" | "infrastructure" | "requestTrace") {
    switch (type) {
        case "component":
            selectedInfrastructureId.value = "none";
            selectedRequestTraceId.value = "none";
            emit("update:evaluatedEntity", selectedComponentId.value);
            break;
        case "infrastructure":
            selectedComponentId.value = "none";
            selectedRequestTraceId.value = "none";
            emit("update:evaluatedEntity", selectedInfrastructureId.value);
            break;
        case "requestTrace":
            selectedComponentId.value = "none";
            selectedInfrastructureId.value = "none";
            emit("update:evaluatedEntity", selectedRequestTraceId.value);
            break;
    }
    triggerEvaluation();
}

function clearEvaluation() {
    calculatedMeasures.value.clear();
    evaluatedProductFactors.value.clear();
    evaluatedQualityAspects.value.clear();
}

function resetEntitySelection() {
    selectedComponentId.value = "none";
    selectableEntities.value.components = [unselectedEntity];
    selectedInfrastructureId.value = "none";
    selectableEntities.value.infrastructures = [unselectedEntity];
    selectedRequestTraceId.value = "none";
    selectableEntities.value.requestTraces = [unselectedEntity];
}


function triggerEvaluation() {
    clearEvaluation();

    let selectedSystem = props.systemsData.find(system => system.id === selectedSystemId.value);

    if (!selectedSystem) {
        // selectedSystem might not be findable, if it has been deleted
        selectedSystemId.value = -1;
        emit("update:evaluatedSystem", selectedSystemId.value);
        clearEvaluation();
        return;
    }

    let systemEntityManager = selectedSystem.entityManager ? toRaw(selectedSystem.entityManager) : createTemporaryEntityManager(selectedSystem);
    let currentSystemEntity = systemEntityManager.getSystemEntity();

    evaluationModelsWrapper.value = new EvaluationModelsWrapper(currentSystemEntity, qualityModel);

    if (selectedComponentId.value && selectedComponentId.value !== "none") {
        evaluateComponent(selectedComponentId.value);
    } else if (selectedInfrastructureId.value && selectedInfrastructureId.value !== "none") {
        evaluateInfrastructure(selectedInfrastructureId.value);
    } else if (selectedRequestTraceId.value && selectedRequestTraceId.value !== "none") {
        evaluateRequestTrace(selectedRequestTraceId.value);
    } else {
        evaluateSystem();
    }
}

function evaluateSystem() {
    console.time('evaluation');

    let activeElements = getActiveElements(getActiveFilterItems(highLevelAspectFilter.value), getActiveFilterItems(factorCategoryFilter.value), qualityModel);

    let evaluatedSystem = evaluationModelsWrapper.value.getEvaluatedSystemModel(activeElements.activeQualityAspects, activeElements.activeProductFactors);

    updateEvaluation(evaluatedSystem);
    console.timeEnd('evaluation');
}

function evaluateComponent(componentId: string) {
    console.time('evaluation');

    let activeElements = getActiveElements(getActiveFilterItems(highLevelAspectFilter.value), getActiveFilterItems(factorCategoryFilter.value), qualityModel);

    let evaluatedComponent = evaluationModelsWrapper.value.getEvaluatedComponentModel(componentId, activeElements.activeQualityAspects, activeElements.activeProductFactors);

    updateEvaluation(evaluatedComponent);
    console.timeEnd('evaluation');
}

function evaluateInfrastructure(infrastructureId: string) {
    console.time('evaluation');

    let activeElements = getActiveElements(getActiveFilterItems(highLevelAspectFilter.value), getActiveFilterItems(factorCategoryFilter.value), qualityModel);

    let evaluatedInfrastructure = evaluationModelsWrapper.value.getEvaluatedInfrastructureModel(infrastructureId, activeElements.activeQualityAspects, activeElements.activeProductFactors);

    updateEvaluation(evaluatedInfrastructure);
    console.timeEnd('evaluation');
}

function evaluateRequestTrace(requestTraceId: string) {
    console.time('evaluation');

    let activeElements = getActiveElements(getActiveFilterItems(highLevelAspectFilter.value), getActiveFilterItems(factorCategoryFilter.value), qualityModel);

    let evaluatedRequestTrace = evaluationModelsWrapper.value.getEvaluatedRequestTraceModel(requestTraceId, activeElements.activeQualityAspects, activeElements.activeProductFactors);

    updateEvaluation(evaluatedRequestTrace);
    console.timeEnd('evaluation');
}

function updateEvaluation(evaluation: Evaluation) {
    evaluation.getCalculatedMeasures().forEach((value, key, map) => {
        calculatedMeasures.value.set(key, value);
    });

    evaluation.getEvaluatedProductFactors().forEach((value, key, map) => {
        evaluatedProductFactors.value.set(key, value);
    });

    evaluation.getEvaluatedQualityAspects().forEach((value, key, map) => {
        evaluatedQualityAspects.value.set(key, value);
    });
}

function createTemporaryEntityManager(selectedSystem: ModelingData): SystemEntityManager {
    // workaround to fix the problem that if the page has been reloaded and the modeled system in question has not been opened in the modeling tab, then it has not been imported yet and the entityManager has not been created yet
    // not the best solution, because the evaluation now depends on jointjs

    let newEntityManager = new SystemEntityManager(new dia.Graph({}, { cellNamespace: entityShapes }), "0");
    newEntityManager.loadFromJson(selectedSystem.toImport.fileContent, selectedSystem.toImport.fileName, "replace");
    return newEntityManager;
}

function exportMeasures() {

    let systemData = props.systemsData.find(data => data.id === selectedSystemId.value);
    let system = (systemData.entityManager ? toRaw(systemData.entityManager) : createTemporaryEntityManager(systemData)).getSystemEntity();
    let systemName = systemData.name;

    let headers = '"measureKey";"measureName";"systemName";"entityName";"entityType";"entityId";"value"';
    let measuresAsCsv = [...calculatedMeasures.value.entries()].map(([measureKey, calculatedMeasure]) =>
        `"${measureKey}";"${calculatedMeasure.name}";"${systemName}";"${systemName}";"${calculatedMeasure.entity}";"${selectedSystemId.value}";"${calculatedMeasure.value}"`)

    let activeElements = getActiveElements(getActiveFilterItems(highLevelAspectFilter.value), getActiveFilterItems(factorCategoryFilter.value), qualityModel);

    evaluationModelsWrapper.value.getAvailableComponents().forEach(componentId => {
        let componentName = system.getComponentEntities.get(componentId).getName;
        let evaluatedComponentModel = evaluationModelsWrapper.value.getEvaluatedComponentModel(componentId, activeElements.activeQualityAspects, activeElements.activeProductFactors);
        let componentMeasures = [...evaluatedComponentModel.getCalculatedMeasures().entries()].map(([measureKey, calculatedMeasure]) =>
            `"${measureKey}";"${calculatedMeasure.name}";"${systemName}";"${componentName}";"${calculatedMeasure.entity}";"${componentId}";"${calculatedMeasure.value}"`)
        measuresAsCsv = measuresAsCsv.concat(componentMeasures);
    });

    evaluationModelsWrapper.value.getAvailableInfrastructureEntities().forEach(infrastructureId => {
        let infrastructureName = system.getInfrastructureEntities.get(infrastructureId).getName;
        let evaluatedInfrastructureModel = evaluationModelsWrapper.value.getEvaluatedInfrastructureModel(infrastructureId, activeElements.activeQualityAspects, activeElements.activeProductFactors);
        let infrastructureMeasures = [...evaluatedInfrastructureModel.getCalculatedMeasures().entries()].map(([measureKey, calculatedMeasure]) =>
            `"${measureKey}";"${calculatedMeasure.name}";"${systemName}";"${infrastructureName}";"${calculatedMeasure.entity}";"${infrastructureId}";"${calculatedMeasure.value}"`)
        measuresAsCsv = measuresAsCsv.concat(infrastructureMeasures);
    });

    evaluationModelsWrapper.value.getAvailableRequestTraces().forEach(requestTraceId => {
        let requestTraceName = system.getRequestTraceEntities.get(requestTraceId).getName;
        let evaluatedRequestTraceModel = evaluationModelsWrapper.value.getEvaluatedRequestTraceModel(requestTraceId, activeElements.activeQualityAspects, activeElements.activeProductFactors);
        let requestTraceMeasures = [...evaluatedRequestTraceModel.getCalculatedMeasures().entries()].map(([measureKey, calculatedMeasure]) =>
            `"${measureKey}";"${calculatedMeasure.name}";"${systemName}";"${requestTraceName}";"${calculatedMeasure.entity}";"${requestTraceId}";"${calculatedMeasure.value}"`)
        measuresAsCsv = measuresAsCsv.concat(requestTraceMeasures);
    });

    triggerDownload(headers.concat("\n").concat(measuresAsCsv.join("\n")), "text/csv", `${systemName}-measures.csv`);
}

function roundIfNumeric(value: string | number) {
    if (typeof value === "number" && !isNaN(value)) {
        return value.toFixed(3);
    }
    return value;
}

function exportEvaluation() {

    let systemData = props.systemsData.find(data => data.id === selectedSystemId.value);
    let system = (systemData.entityManager ? toRaw(systemData.entityManager) : createTemporaryEntityManager(systemData)).getSystemEntity();
    let systemName = systemData.name;

    let activeElements = getActiveElements(getActiveFilterItems(highLevelAspectFilter.value), getActiveFilterItems(factorCategoryFilter.value), qualityModel);

    let headers: string[] = ["entity", "hierarchy", "type", "key", "name", systemName];
    let indexCount = 0;
    const entityToIndex: Map<string, number> = new Map();
    evaluationModelsWrapper.value.getAvailableComponents().forEach(componentId => {
        headers.push(system.getComponentEntities.get(componentId).getName);
        entityToIndex.set(componentId, indexCount);
        indexCount++;
    })
    evaluationModelsWrapper.value.getAvailableInfrastructureEntities().forEach(infrastructureId => {
        headers.push(system.getInfrastructureEntities.get(infrastructureId).getName);
        entityToIndex.set(infrastructureId, indexCount);
        indexCount++;
    })
    evaluationModelsWrapper.value.getAvailableRequestTraces().forEach(requestTraceId => {
        headers.push(system.getRequestTraceEntities.get(requestTraceId).getName);
        entityToIndex.set(requestTraceId, indexCount);
        indexCount++;
    })

    let asCSVrows = [];
    const otherColumns = new Array(entityToIndex.size).fill("n/a");

    const systemEvaluationModel = evaluationModelsWrapper.value.getEvaluatedSystemModel(activeElements.activeQualityAspects, activeElements.activeProductFactors);
    systemEvaluationModel.getEvaluatedQualityAspects().forEach(qualityAspect => {
        let qualityAspectRow = `system;${qualityAspect.id};${qualityAspect.factorType};${qualityAspect.id};${qualityAspect.name};${qualityAspect.result};${otherColumns.join(";")}`;
        asCSVrows.push(qualityAspectRow);
        let impacts = qualityAspect.backwardImpacts;
        while (impacts.length > 0) {
            let currentImpact = impacts.shift();
            let factor = currentImpact.impactingFactor;
            let factorRow = `system;${qualityAspect.id};${factor.factorType};${factor.id};${factor.name};${roundIfNumeric(factor.result)};${otherColumns.join(";")}`;
            asCSVrows.push(factorRow);
            factor.measuresForEvaluation.entries().forEach(([measureKey, measure]) => {
                let measureRow = `system;${qualityAspect.id};measure;${measureKey};${measure.name};${roundIfNumeric(measure.value)};${otherColumns.join(";")}`;
                asCSVrows.push(measureRow);
            })
            let deepImpacting = factor.backwardImpacts;
            impacts.unshift(...deepImpacting);
        }
    })

    const componentRows: Map<string, { commons: string, otherColumns: (string | number)[] }> = new Map();
    evaluationModelsWrapper.value.getAvailableComponents().forEach(componentId => {
        let evaluatedComponentModel = evaluationModelsWrapper.value.getEvaluatedComponentModel(componentId, activeElements.activeQualityAspects, activeElements.activeProductFactors);
        evaluatedComponentModel.getEvaluatedQualityAspects().forEach(qualityAspect => {
            if (!componentRows.has(qualityAspect.id)) {
                componentRows.set(qualityAspect.id, { commons: `component;${qualityAspect.id};${qualityAspect.factorType};${qualityAspect.id};${qualityAspect.name};n/a;`, otherColumns: [...otherColumns] });
            }
            componentRows.get(qualityAspect.id).otherColumns[entityToIndex.get(componentId)] = qualityAspect.result;

            let impacts = qualityAspect.backwardImpacts;
            while (impacts.length > 0) {
                let currentImpact = impacts.shift();
                let factor = currentImpact.impactingFactor;

                if (!componentRows.has(factor.id)) {
                    componentRows.set(factor.id, { commons: `component;${qualityAspect.id};${factor.factorType};${factor.id};${factor.name};n/a;`, otherColumns: [...otherColumns] });
                }
                componentRows.get(factor.id).otherColumns[entityToIndex.get(componentId)] = roundIfNumeric(factor.result);
                factor.measuresForEvaluation.entries().forEach(([measureKey, measure]) => {
                    if (!componentRows.has(measureKey)) {
                        componentRows.set(measureKey, { commons: `component;${qualityAspect.id};measure;${measureKey};${measure.name};n/a;`, otherColumns: [...otherColumns] });
                    }
                    componentRows.get(measureKey).otherColumns[entityToIndex.get(componentId)] = roundIfNumeric(measure.value);
                })

                let deepImpacting = factor.backwardImpacts;
                impacts.unshift(...deepImpacting);
            }
        })
    });
    componentRows.entries().forEach(([key, value]) => {
        asCSVrows.push(`${value.commons}${value.otherColumns.join(";")}`);
    })

    const infrastructureRows: Map<string, { commons: string, otherColumns: (string | number)[] }> = new Map();
    evaluationModelsWrapper.value.getAvailableInfrastructureEntities().forEach(infrastructureId => {
        let evaluatedInfrastructureModel = evaluationModelsWrapper.value.getEvaluatedInfrastructureModel(infrastructureId, activeElements.activeQualityAspects, activeElements.activeProductFactors);
        evaluatedInfrastructureModel.getEvaluatedQualityAspects().forEach(qualityAspect => {
            if (!infrastructureRows.has(qualityAspect.id)) {
                infrastructureRows.set(qualityAspect.id, { commons: `infrastructure;${qualityAspect.id};${qualityAspect.factorType};${qualityAspect.id};${qualityAspect.name};n/a;`, otherColumns: [...otherColumns] });
            }
            infrastructureRows.get(qualityAspect.id).otherColumns[entityToIndex.get(infrastructureId)] = qualityAspect.result;

            let impacts = qualityAspect.backwardImpacts;
            while (impacts.length > 0) {
                let currentImpact = impacts.shift();
                let factor = currentImpact.impactingFactor;

                if (!infrastructureRows.has(factor.id)) {
                    infrastructureRows.set(factor.id, { commons: `infrastructure;${qualityAspect.id};${factor.factorType};${factor.id};${factor.name};n/a;`, otherColumns: [...otherColumns] });
                }
                infrastructureRows.get(factor.id).otherColumns[entityToIndex.get(infrastructureId)] = roundIfNumeric(factor.result);
                factor.measuresForEvaluation.entries().forEach(([measureKey, measure]) => {
                    if (!infrastructureRows.has(measureKey)) {
                        infrastructureRows.set(measureKey, { commons: `infrastructure;${qualityAspect.id};measure;${measureKey};${measure.name};n/a;`, otherColumns: [...otherColumns] });
                    }
                    infrastructureRows.get(measureKey).otherColumns[entityToIndex.get(infrastructureId)] = roundIfNumeric(measure.value);
                })
                let deepImpacting = factor.backwardImpacts;
                impacts.unshift(...deepImpacting);
            }

        })
    });
    infrastructureRows.entries().forEach(([key, value]) => {
        asCSVrows.push(`${value.commons}${value.otherColumns.join(";")}`);
    })


    const requestTraceRows: Map<string, { commons: string, otherColumns: (string | number)[] }> = new Map();
    evaluationModelsWrapper.value.getAvailableRequestTraces().forEach(requestTraceId => {
        let evaluatedRequestTraceModel = evaluationModelsWrapper.value.getEvaluatedRequestTraceModel(requestTraceId, activeElements.activeQualityAspects, activeElements.activeProductFactors);
        evaluatedRequestTraceModel.getEvaluatedQualityAspects().forEach(qualityAspect => {
            if (!requestTraceRows.has(qualityAspect.id)) {
                requestTraceRows.set(qualityAspect.id, { commons: `requestTrace;${qualityAspect.id};${qualityAspect.factorType};${qualityAspect.id};${qualityAspect.name};n/a;`, otherColumns: [...otherColumns] });
            }
            requestTraceRows.get(qualityAspect.id).otherColumns[entityToIndex.get(requestTraceId)] = qualityAspect.result;

            let impacts = qualityAspect.backwardImpacts;
            while (impacts.length > 0) {
                let currentImpact = impacts.shift();
                let factor = currentImpact.impactingFactor;

                if (!requestTraceRows.has(factor.id)) {
                    requestTraceRows.set(factor.id, { commons: `requestTrace;${qualityAspect.id};${factor.factorType};${factor.id};${factor.name};n/a;`, otherColumns: [...otherColumns] });
                }
                requestTraceRows.get(factor.id).otherColumns[entityToIndex.get(requestTraceId)] = roundIfNumeric(factor.result);
                factor.measuresForEvaluation.entries().forEach(([measureKey, measure]) => {
                    if (!requestTraceRows.has(measureKey)) {
                        requestTraceRows.set(measureKey, { commons: `requestTrace;${qualityAspect.id};measure;${measureKey};${measure.name};n/a;`, otherColumns: [...otherColumns] });
                    }
                    requestTraceRows.get(measureKey).otherColumns[entityToIndex.get(requestTraceId)] = roundIfNumeric(measure.value);
                })

                let deepImpacting = factor.backwardImpacts;
                impacts.unshift(...deepImpacting);
            }
        })
    });
    requestTraceRows.entries().forEach(([key, value]) => {
        asCSVrows.push(`${value.commons}${value.otherColumns.join(";")}`);
    })


    /*
    const componentRows: Map<string, { commons: string, otherColumns: (string | number)[] }> = new Map();
    evaluationModelsWrapper.value.getAvailableComponents().forEach(componentId => {
        let evaluatedComponentModel = evaluationModelsWrapper.value.getEvaluatedComponentModel(componentId, activeElements.activeQualityAspects, activeElements.activeProductFactors);
        evaluatedComponentModel.getEvaluatedQualityAspects().forEach(qualityAspect => {
            if (!componentRows.has(qualityAspect.id)) {
                componentRows.set(qualityAspect.id, { commons: `component;${qualityAspect.factorType};${qualityAspect.id};${qualityAspect.name};n/a;`, otherColumns: [...otherColumns] });
            }
            componentRows.get(qualityAspect.id).otherColumns[entityToIndex.get(componentId)] = qualityAspect.result;
        })
        evaluatedComponentModel.getEvaluatedProductFactors().forEach(factor => {
            if (!componentRows.has(factor.id)) {
                componentRows.set(factor.id, { commons: `component;${factor.factorType};${factor.id};${factor.name};n/a;`, otherColumns: [...otherColumns] });
            }
            componentRows.get(factor.id).otherColumns[entityToIndex.get(componentId)] = roundIfNumeric(factor.result);
            factor.measuresForEvaluation.entries().forEach(([measureKey, measure]) => {
                if (!componentRows.has(measureKey)) {
                    componentRows.set(measureKey, { commons: `component;measure;${measureKey};${measure.name};n/a;`, otherColumns: [...otherColumns] });
                }
                componentRows.get(measureKey).otherColumns[entityToIndex.get(componentId)] = roundIfNumeric(measure.value);
            })
        })
    });
    componentRows.entries().forEach(([key, value]) => {
        asCSVrows.push(`${value.commons}${value.otherColumns.join(";")}`);
    })
 
    const infrastructureRows: Map<string, { commons: string, otherColumns: (string | number)[] }> = new Map();
    evaluationModelsWrapper.value.getAvailableInfrastructureEntities().forEach(infrastructureId => {
        let evaluatedInfrastructureModel = evaluationModelsWrapper.value.getEvaluatedInfrastructureModel(infrastructureId, activeElements.activeQualityAspects, activeElements.activeProductFactors);
        evaluatedInfrastructureModel.getEvaluatedQualityAspects().forEach(qualityAspect => {
            if (!infrastructureRows.has(qualityAspect.id)) {
                infrastructureRows.set(qualityAspect.id, { commons: `infrastructure;${qualityAspect.factorType};${qualityAspect.id};${qualityAspect.name};n/a;`, otherColumns: [...otherColumns] });
            }
            infrastructureRows.get(qualityAspect.id).otherColumns[entityToIndex.get(infrastructureId)] = qualityAspect.result;
        })
        evaluatedInfrastructureModel.getEvaluatedProductFactors().forEach(factor => {
            if (!infrastructureRows.has(factor.id)) {
                infrastructureRows.set(factor.id, { commons: `infrastructure;${factor.factorType};${factor.id};${factor.name};n/a;`, otherColumns: [...otherColumns] });
            }
            infrastructureRows.get(factor.id).otherColumns[entityToIndex.get(infrastructureId)] = roundIfNumeric(factor.result);
            factor.measuresForEvaluation.entries().forEach(([measureKey, measure]) => {
                if (!infrastructureRows.has(measureKey)) {
                    infrastructureRows.set(measureKey, { commons: `infrastructure;measure;${measureKey};${measure.name};n/a;`, otherColumns: [...otherColumns] });
                }
                infrastructureRows.get(measureKey).otherColumns[entityToIndex.get(infrastructureId)] = roundIfNumeric(measure.value);
            })
        })
    });
    infrastructureRows.entries().forEach(([key, value]) => {
        asCSVrows.push(`${value.commons}${value.otherColumns.join(";")}`);
    })
 
 
    const requestTraceRows: Map<string, { commons: string, otherColumns: (string | number)[] }> = new Map();
    evaluationModelsWrapper.value.getAvailableRequestTraces().forEach(requestTraceId => {
        let evaluatedRequestTraceModel = evaluationModelsWrapper.value.getEvaluatedRequestTraceModel(requestTraceId, activeElements.activeQualityAspects, activeElements.activeProductFactors);
        evaluatedRequestTraceModel.getEvaluatedQualityAspects().forEach(qualityAspect => {
            if (!requestTraceRows.has(qualityAspect.id)) {
                requestTraceRows.set(qualityAspect.id, { commons: `requestTrace;${qualityAspect.factorType};${qualityAspect.id};${qualityAspect.name};n/a;`, otherColumns: [...otherColumns] });
            }
            requestTraceRows.get(qualityAspect.id).otherColumns[entityToIndex.get(requestTraceId)] = qualityAspect.result;
        })
        evaluatedRequestTraceModel.getEvaluatedProductFactors().forEach(factor => {
            if (!requestTraceRows.has(factor.id)) {
                requestTraceRows.set(factor.id, { commons: `requestTrace;${factor.factorType};${factor.id};${factor.name};n/a;`, otherColumns: [...otherColumns] });
            }
            requestTraceRows.get(factor.id).otherColumns[entityToIndex.get(requestTraceId)] = roundIfNumeric(factor.result);
            factor.measuresForEvaluation.entries().forEach(([measureKey, measure]) => {
                if (!requestTraceRows.has(measureKey)) {
                    requestTraceRows.set(measureKey, { commons: `requestTrace;measure;${measureKey};${measure.name};n/a;`, otherColumns: [...otherColumns] });
                }
                requestTraceRows.get(measureKey).otherColumns[entityToIndex.get(requestTraceId)] = roundIfNumeric(measure.value);
            })
        })
    });
    requestTraceRows.entries().forEach(([key, value]) => {
        asCSVrows.push(`${value.commons}${value.otherColumns.join(";")}`);
    })
        */



    triggerDownload(headers.join(";").concat("\n").concat(asCSVrows.join("\n")), "text/csv", `${systemName}-evaluation.csv`);
}

</script>

<style>
.full-width {
    width: 100%;
}

.evaluation-background {
    background-color: #e9ecef;
}

.selection-bar {
    background-color: #fff;
}

.selection-bar:not(:last-child) {
    border-bottom: 2px solid var(--toolbar-line-colour);
}

.selection-bar div {
    display: flex;
    column-gap: 4px;
    align-items: center;
}

.selection-bar-button {
    padding: 0.2rem;
}

.evaluation-tool:not(:last-child) {
    padding-right: 5px;
    border-right: 2px solid var(--toolbar-line-colour);
}
</style>