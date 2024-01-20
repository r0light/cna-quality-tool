<template>
    <div>
        <div class="d-flex flex-column p-1">
            <h2>Evaluation</h2>
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
                <p>In development...</p>
                <div v-if="selectedViewpoint === 'perProductFactor'">
                    <div v-for="[productFactorKey, productFactor] of evaluatedProductFactors.entries()">
                        <span>{{ productFactor.name }}</span>: <span> {{ productFactor.result }}</span>
                        <div v-for="impact of productFactor.impacts">
                            <!-- TODO recursively show impacts using an explicit component-->
                            <span>{{ productFactor.name }} has a {{ impact.impactType }} impact on {{
                                impact.impactedFactorName }}</span>
                        </div>
                        <p>Relevant measures:</p>
                        <div v-for="[key, measure] of productFactor.measures">
                            <span>{{ measure.name }}</span>: <span> {{ measure.value }}</span>
                        </div>
                    </div>

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
import { CalculatedMeasure, EvaluatedProductFactor, EvaluatedQualityAspect, EvaluatedSystemModel } from '@/core/qualitymodel/evaluation/EvaluatedSystemModel';

const props = defineProps<{
    systemsData: ModelingData[],
    active: boolean
}>()

const qualityModel: QualityModelInstance = getQualityModel();

const selectedSystemId = ref<number>(-1);

const selectedViewpoint = ref<"perQualityAspect" | "perProductFactor">("perProductFactor");

const calculatedMeasures = ref<Map<string,CalculatedMeasure>>(new Map());

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
    let systemEntityManager = toRaw(selectedSystem.entityManager);
    let currentSystemEntity = systemEntityManager.getSystemEntity();

    let evaluatedSystem = new EvaluatedSystemModel(currentSystemEntity, qualityModel);

    console.time('evaluation');

    evaluatedSystem.evaluate();

    evaluatedSystem.getCalculatedMeasures.forEach((value, key, map) => {
        calculatedMeasures.value.set(key, value);
    });

    evaluatedSystem.getEvaluatedProductFactors.forEach((value, key, map) => {
        evaluatedProductFactors.value.set(key, value);
    });

    evaluatedSystem.getEvaluatedQualityAspects.forEach((value, key, map) => {
        evaluatedQualityAspects.value.set(key, value);
    });

    console.timeEnd('evaluation');

}

</script>
