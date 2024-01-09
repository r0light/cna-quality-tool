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
                <span>{{ metric.name }}</span>: <span> {{  metric.value }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, toRaw } from 'vue';
import { ModelingData } from '../App.vue';
import { Service } from '@/core/entities';


type Metric = {
    name: string,
    value: any
}

const props = defineProps<{
    systemsData: ModelingData[],
}>()

const selectedSystemId = ref<number>(-1);

const calculatedMetrics = ref<Metric[]>([]);

function onSelectSystem() {

    let selectedSystem = props.systemsData.find(system => system.id === selectedSystemId.value);
    let systemEntityManager = toRaw(selectedSystem.entityManager);

    // start metric calculation here?
    calculatedMetrics.value.length = 0;

    calculatedMetrics.value.push({
        name: "Number of services",
        value:  [...systemEntityManager.getSystemEntity().getComponentEntities.entries()].map(entry => entry[1]).filter(entity => entity.constructor.name === Service.name).length
    });

    calculatedMetrics.value.push({
        name: "Number of managed components",
        value: [...systemEntityManager.getSystemEntity().getComponentEntities.entries()].map(entry => entry[1]).filter(entity => entity.getProperties().find(property => property.getKey === "managed").value === true).length
    })

}


</script>
