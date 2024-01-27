<template>
    <div class="full-width">
        <div class="d-flex flex-column p-1">
            <h2>Evaluation</h2>
            <p class="font-weight-bold">The evaluation feature is still in development...</p>
            <div class="d-flex flex-row">
                <div class="m-1">
                    <span>Select the evaluation viewpoint: </span>
                    <select @change="onSelectViewpoint" v-model="selectedViewpoint">
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
            </div>
            <div v-if="selectedSystemId > -1">

                <div v-if="selectedViewpoint === 'perProductFactor'">
                    <ProductFactorViewpoint :evaluatedProductFactors="(evaluatedProductFactors as Map<string, EvaluatedProductFactor>)"></ProductFactorViewpoint>
                </div>
                <div v-if="selectedViewpoint === 'perQualityAspect'">
                    <QualityAspectViewpoint :evaluatedQualityAspects="(evaluatedQualityAspects as Map<string, EvaluatedQualityAspect>)"></QualityAspectViewpoint>
                </div>
                <div v-for="[key, calculatedMeasure] of calculatedMeasures">
                    <span>{{ calculatedMeasure.name }}</span>: <span> {{ calculatedMeasure.value }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onUpdated, ref, toRaw } from 'vue';
import { ModelingData } from '../App.vue';
import { QualityModelInstance, getQualityModel } from '@/core/qualitymodel/QualityModelInstance';
import { CalculatedMeasure, EvaluatedProductFactor, EvaluatedQualityAspect, EvaluatedSystemModel, ForwardImpactingPath } from '@/core/qualitymodel/evaluation/EvaluatedSystemModel';
import ProductFactorViewpoint from './ProductFactorViewpoint.vue';
import QualityAspectViewpoint from './QualityAspectViewpoint.vue';

const props = defineProps<{
    systemsData: ModelingData[],
    active: boolean
}>()

const qualityModel: QualityModelInstance = getQualityModel();

const selectedSystemId = ref<number>(-1);

const selectedViewpoint = ref<"perQualityAspect" | "perProductFactor">("perProductFactor");

const calculatedMeasures = ref<Map<string, CalculatedMeasure>>(new Map());

const evaluatedProductFactors = ref<Map<string, EvaluatedProductFactor>>(new Map());

const evaluatedQualityAspects = ref<Map<string, EvaluatedQualityAspect>>(new Map());

var refresh = true;

onUpdated(() => {
    if (props.active) {
        if (refresh) {
            refresh = false;
            onSelectSystem();
        }
    } else {
        refresh = true;
    }
})

function onSelectViewpoint() {
    // TODO reorder display of evaluation
}

function onSelectSystem() {

    calculatedMeasures.value.clear();
    evaluatedProductFactors.value.clear();
    evaluatedQualityAspects.value.clear();

    if (selectedSystemId.value == -1) {
        return
    }

    let selectedSystem = props.systemsData.find(system => system.id === selectedSystemId.value);

    if (!selectedSystem) {
        // selectedSystem might not be findable, if it has been deleted
        selectedSystemId.value = -1;
        return;
    }


    let systemEntityManager = toRaw(selectedSystem.entityManager);
    let currentSystemEntity = systemEntityManager.getSystemEntity();

    let evaluatedSystem = new EvaluatedSystemModel(currentSystemEntity, qualityModel);

    console.time('evaluation');

    evaluatedSystem.evaluate();

    evaluatedSystem.getCalculatedMeasures.forEach((value, key, map) => {
        calculatedMeasures.value.set(key, value);
    });

    evaluatedSystem.getEvaluatedProductFactors.forEach((value, key, map) => {
        // only add leaf factors ? Otherwise also a specific entry for aggregating factors would be possible
        if (value.productFactor.getImpactingFactors().length === 0) {
            evaluatedProductFactors.value.set(key, value);
        }
    });

    evaluatedSystem.getEvaluatedQualityAspects.forEach((value, key, map) => {
        evaluatedQualityAspects.value.set(key, value);
    });

    console.timeEnd('evaluation');

}


</script>

<style>
.full-width {
    width: 100%;
}
</style>