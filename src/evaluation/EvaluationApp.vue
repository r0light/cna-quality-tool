<template>
    <div>
        <h2>Evaluation</h2>
        <div>
            <select @change="onSelectSystem" v-model="selectedSystemIndex">
                <option value=-1>Select a system...</option>
                <option v-for="system of systemsData" :value="system.index">{{ system.name }}</option>
            </select>
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

    if (selectedSystemIndex.value == -1) {
        return;
    }

    let selectedSystem = props.systemsData.find(system => system.index === selectedSystemIndex.value);
    let systemEntityManager = toRaw(selectedSystem.entityManager);

    let services = [...systemEntityManager.getSystemEntity().getComponentEntities.entries()].map(entry => entry[1]).filter(entity => entity.constructor.name === "Service");

    /*
    console.log({"measure": "number of services",
                "value:": services.length
            })
            */
}

</script>
