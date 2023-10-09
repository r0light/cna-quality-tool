<template>
    <div>
        <h2>Evaluation</h2>
        <div>
            <select @change="onSelectSystem" v-model="selectedSystemIndex">
                <option value=-1>Select a system...</option>
                <option v-for="system of systemsData" :value="system.index">{{ system.name }}</option>
            </select>
        </div>
        <div v-if="selectedSystemIndex > -1">
            <p>In development...</p>
            <p>Number of services:<span> {{ getNumberOfServices(selectedSystemIndex) }} </span></p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, toRaw } from 'vue';
import { ModelingData } from '../App.vue';


const props = defineProps<{
    systemsData: ModelingData[],
}>()

const selectedSystemIndex = ref<number>(-1)

function onSelectSystem() {

    // start metric calculation here?
}

function getNumberOfServices(systemIndex: number) {

    if (systemIndex === -1) {
        return;
    }

    let selectedSystem = props.systemsData.find(system => system.index === systemIndex);
    let systemEntityManager = toRaw(selectedSystem.entityManager);

    let services = [...systemEntityManager.getSystemEntity().getComponentEntities.entries()].map(entry => entry[1]).filter(entity => entity.constructor.name === "Service");

    return services.length;
}

</script>
