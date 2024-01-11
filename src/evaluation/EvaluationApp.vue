<template>
    <div>
        <h2>Evaluation</h2>
        <div>
            <select @change="onSelectSystem" v-model="selectedSystemId">
                <option value=-1>Select a system...</option>
                <option v-for="system of systemsData" :value="system.id">{{ system.name }}</option>
            </select>
        </div>
        <div v-if="selectedSystemId > -1">
            <p>In development...</p>
            <div v-for="metric of calculatedMetrics">
                <span>{{ metric.name }}</span>: <span> {{ metric.value }}</span>
            </div>
            <div v-for="productFactors of evaluatedProductFactors">
                <span>{{ productFactors.name }}</span>: <span> {{ productFactors.result }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onUpdated, ref, toRaw } from 'vue';
import { ModelingData } from '../App.vue';
import { QualityModelInstance, getQualityModel } from '@/core/qualitymodel/QualityModelInstance';


type Metric = {
    name: string,
    value: any
}

const props = defineProps<{
    systemsData: ModelingData[],
    active: boolean
}>()

const qualityModel: QualityModelInstance = getQualityModel();

const selectedSystemId = ref<number>(-1);

const calculatedMetrics = ref<Metric[]>([]);

const evaluatedProductFactors = ref<{ name: string, result: any }[]>([]);

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

function onSelectSystem() {

    calculatedMetrics.value.length = 0;
    evaluatedProductFactors.value.length = 0;

    if (selectedSystemId.value == -1) {
        return
    }

    console.time('measure calculation');

    let selectedSystem = props.systemsData.find(system => system.id === selectedSystemId.value);
    let systemEntityManager = toRaw(selectedSystem.entityManager);

    for (const measure of qualityModel.measures) {

        if (measure.isCalculationAvailable()) {
            calculatedMetrics.value.push({
                name: measure.getName,
                value: measure.calculate(systemEntityManager.getSystemEntity())
            });

        } else {
            // console.log(`Could not calculate metric ${measure.getName}`);
        }


    }

    for (const productFactor of qualityModel.productFactors) {
        if (productFactor.isEvaluationAvailable()) {
            evaluatedProductFactors.value.push({
                "name": productFactor.getName,
                "result": productFactor.evaluate(systemEntityManager.getSystemEntity())
            });
        }
    }

    console.timeEnd('measure calculation');

}

</script>
