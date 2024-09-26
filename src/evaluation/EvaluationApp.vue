<template>
    <div class="full-width">
        <div class="d-flex flex-column p-1 evaluation-background">
            <h2>Evaluation</h2>
            <p class="font-weight-bold">The evaluation feature is still in development...</p>
            <FilterToolbar :highLevelAspectFilter="highLevelAspectFilter" :factorCategoryFilter="factorCategoryFilter"
                @update:filters="saveEvaluationConfig(); evaluateSystem()"></FilterToolbar>
            <div class="d-flex flex-row selection-bar">
                <div class="m-1">
                    <span>Select the evaluation viewpoint: </span>
                    <select v-model="selectedViewpoint" @change="saveEvaluationConfig">
                        <option value="perQualityAspect">per Quality Aspect</option>
                        <option value="perProductFactor">per Product Factor</option>
                    </select>
                </div>
                <div class="m-1">
                    <span>Select the modeled system to evaluate: </span>
                    <select @change="onSelectSystem" v-model="selectedSystemId">
                        <option value=-1>Select a system...</option>
                        <option v-for="system of systemsData" :value="system.id">{{ system.name }}</option>
                    </select>
                </div>
                <div class="m-1">
                    <span>Show inconclusive evaluations? </span>
                    <input type="checkbox" v-model="showInconclusive" @change="saveEvaluationConfig">
                </div>
                <div class="m-1">
                    <button class="btn btn-secondary selection-bar-button" :disabled="selectedSystemId === -1" @click="exportMeasures">Export measures as CSV</button>
                </div>
            </div>
            <div v-if="selectedSystemId > -1">
                <div v-if="selectedViewpoint === 'perProductFactor'">
                    <ProductFactorViewpoint
                        :evaluatedProductFactors="(evaluatedProductFactors as Map<string, EvaluatedProductFactor>)" :showInconclusiveEvaluations="showInconclusive">
                    </ProductFactorViewpoint>
                </div>
                <div v-if="selectedViewpoint === 'perQualityAspect'">
                    <QualityAspectViewpoint
                        :evaluatedQualityAspects="(evaluatedQualityAspects as Map<string, EvaluatedQualityAspect>)" :showInconclusiveEvaluations="showInconclusive">
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
import { onMounted, onUpdated, ref, toRaw } from 'vue';
import { ModelingData } from '../App.vue';
import { QualityModelInstance, getQualityModel } from '@/core/qualitymodel/QualityModelInstance';
import { EvaluatedSystemModel } from '@/core/qualitymodel/evaluation/EvaluationModels';
import ProductFactorViewpoint from './ProductFactorViewpoint.vue';
import QualityAspectViewpoint from './QualityAspectViewpoint.vue';
import FilterToolbar, { ItemFilter, createFactorCategoryFilter, createHighLevelAspectFilter, getActiveElements, getActiveFilterItems } from '../qualitymodel/FilterToolbar.vue';
import SystemEntityManager from '@/modeling/systemEntityManager';
import { entityShapes } from '@/modeling/config/entityShapes';
import { dia } from '@joint/core';
import { CalculatedMeasure, EvaluatedProductFactor, EvaluatedQualityAspect } from '@/core/qualitymodel/evaluation/Evaluation';
import { triggerDownload } from '@/modeling/utilities';

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
    evaluationConfig: EvaluationConfig
}>()

const emit = defineEmits<{
    (e: "update:evaluatedSystem", systemId: number): void;
    (e: "update:evaluationConfig", evaluationConfig: EvaluationConfig): void;
}>()

const qualityModel: QualityModelInstance = getQualityModel();

const highLevelAspectFilter = ref<ItemFilter>(createHighLevelAspectFilter(qualityModel));

const factorCategoryFilter= ref<ItemFilter>(createFactorCategoryFilter(qualityModel));

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

const calculatedMeasures = ref<Map<string, CalculatedMeasure>>(new Map());

const evaluatedProductFactors = ref<Map<string, EvaluatedProductFactor>>(new Map());

const evaluatedQualityAspects = ref<Map<string, EvaluatedQualityAspect>>(new Map());

onMounted(() => {

    if (props.evaluationConfig) {
        if(props.evaluationConfig.highLevelAspectFilter) {
            highLevelAspectFilter.value = props.evaluationConfig.highLevelAspectFilter;
        }

        if(props.evaluationConfig.factorCategoryFilter) {
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
        evaluateSystem();
    }

});

onUpdated(() => {

    if (!props.systemsData.find(system => system.id === selectedSystemId.value)) {
        selectedSystemId.value = -1;
        clearEvaluation();
    }

});

function onSelectSystem() {

    if (selectedSystemId.value == -1) {
        clearEvaluation();
        return;
    } else {
        emit("update:evaluatedSystem", selectedSystemId.value);
        evaluateSystem();
    }

}

function clearEvaluation() {
    calculatedMeasures.value.clear();
    evaluatedProductFactors.value.clear();
    evaluatedQualityAspects.value.clear();
}

function evaluateSystem() {
    //TODO split in different functions (depending on system or filter select) for better performance?

    clearEvaluation();

    let selectedSystem = props.systemsData.find(system => system.id === selectedSystemId.value);

    if (!selectedSystem) {
        // selectedSystem might not be findable, if it has been deleted
        selectedSystemId.value = -1;
        return;
    }

    let systemEntityManager = selectedSystem.entityManager ? toRaw(selectedSystem.entityManager) : createTemporaryEntityManager(selectedSystem);
    let currentSystemEntity = systemEntityManager.getSystemEntity();

    let evaluatedSystem = new EvaluatedSystemModel(currentSystemEntity, qualityModel);

    console.time('evaluation');

    let activeElements = getActiveElements(getActiveFilterItems(highLevelAspectFilter.value), getActiveFilterItems(factorCategoryFilter.value), qualityModel);

    evaluatedSystem.evaluate(activeElements.activeQualityAspects, activeElements.activeProductFactors);

    evaluatedSystem.getCalculatedMeasures().forEach((value, key, map) => {
        calculatedMeasures.value.set(key, value);
    });

    evaluatedSystem.getEvaluatedProductFactors().forEach((value, key, map) => {
        // only add leaf factors ? Otherwise also a specific entry for aggregating factors would be possible
        if (value.productFactor.getImpactingFactors().length === 0) {
            evaluatedProductFactors.value.set(key, value);
        }
    });

    evaluatedSystem.getEvaluatedQualityAspects().forEach((value, key, map) => {
        evaluatedQualityAspects.value.set(key, value);
    });

    console.timeEnd('evaluation');

}

function createTemporaryEntityManager(selectedSystem: ModelingData): SystemEntityManager {
    // workaround to fix the problem that if the page has been reloaded and the modeled system in question has not been opened in the modeling tab, then it has not been imported yet and the entityManager has not been created yet
    // not the best solution, because the evaluation now depends on jointjs

    let newEntityManager = new SystemEntityManager(new dia.Graph({}, { cellNamespace: entityShapes }));
    newEntityManager.loadFromJson(selectedSystem.toImport.fileContent, selectedSystem.toImport.fileName, "replace");
    return newEntityManager;
}

function exportMeasures() {

    let systemName = props.systemsData.find(data => data.id === selectedSystemId.value).name;

    let headers = '"measureKey";"measureName";"systemName";"entityType";"entityId";"value"';
    let measuresAsCsv = [...calculatedMeasures.value.entries()].map(([measureKey, calculatedMeasure]) => 
        `"${measureKey}";"${calculatedMeasure.name}";"${systemName}";"${calculatedMeasure.entity}";"${selectedSystemId.value}";"${calculatedMeasure.value}"`)
    
    triggerDownload(headers.concat("\n").concat(measuresAsCsv.join("\n")), "text/csv", `${systemName}-measures.csv`);
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

.selection-bar div {
    display: flex;
    column-gap: 4px;
    align-items: center;
}

.selection-bar-button {
    padding: 0.2rem;
}

</style>