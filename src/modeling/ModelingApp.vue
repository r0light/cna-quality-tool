<template>
    <div id="app">
        <Toolbar :system-name="currentSystemName" :key="currentSystemName" :paper="(mainPaper as dia.Paper)"
            :graph="(currentSystemGraph as dia.Graph)" :selectedRequestTrace="currentRequestTraceViewSelection"
            @update:systemName="setCurrentSystemName" @click:exit-request-trace-view="onRequestTraceDeselect"
            @click:print-active-paper="onPrintRequested" @load:fromJson="loadFromJson" @save:toJson="saveToJson"
            @load:fromTosca="loadFromTosca" @save:toTosca="saveToTosca"></Toolbar>
        <div class="app-body">
            <div class="entityShapes-sidebar-container d-print-none">
                <EntitySidebar :paper="mainPaper" :pageId="`model${pageIndex}`"></EntitySidebar>
            </div>
            <div class="visible-modeling-area">
                <ModelingArea :pageId="`model${pageIndex}`" :graph="(currentSystemGraph as dia.Graph)"
                    v-model:paper="mainPaper" :currentElementSelection="currentSelection"
                    :currentRequestTraceSelection="currentRequestTraceViewSelection" :printing="printing"
                    @select:Element="(element: dia.CellView | dia.LinkView) => currentSelection = element"
                    @select:RequestTrace="onSelectRequestTrace" @deselect:Element="currentSelection = null"
                    @deselect:RequestTrace="onRequestTraceDeselect">
                </ModelingArea>
            </div>
            <DetailsSidebar :paper="mainPaper" :graph="(currentSystemGraph as dia.Graph)" :selectedEntity="currentSelection"
                :selectedDataAggregate="currentDataAggregateHighlight" :selectedBackingData="currentBackingDataHightlight">
            </DetailsSidebar>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, toRaw } from 'vue'
import { dia, shapes } from "jointjs";
import SystemEntityManager from './systemEntityManager';
import Toolbar from './views/toolbar/Toolbar.vue';
import ModelingArea from './views/ModelingArea.vue';
import DetailsSidebar from './views/detailsSidebar/DetailsSidebar.vue';
import EntitySidebar from './views/EntitySidebar.vue';
import { addSelectionToolToEntity } from './views/tools/entitySelectionTools';
import { ModelingData } from '@/App.vue';

const props = defineProps<{
    systemName: string,
    pageIndex: number,
    modelingData: ModelingData
}>()


const emit = defineEmits<{
    (e: "update:systemName", newName: string): void;
    (e: "store:modelingData", systemEntitManager: SystemEntityManager): void;
}>()

const currentSystemName = ref(props.systemName);

function setCurrentSystemName(systemName: string) {
    if (!systemName) {
        return;
    }
    currentSystemName.value = systemName;
    emit("update:systemName", currentSystemName.value);
    // TODO sessionStorage ?
}

const currentSystemGraph = ref<dia.Graph>((() => {
    const dataKey = "graph";

    if (props.modelingData.entityManager) {
        return props.modelingData.entityManager.getGraph() as dia.Graph;
    } else {
        const newGraph = new dia.Graph({}, { cellNamespace: shapes });
        return newGraph;
    }
})());

const systemEntityManager: SystemEntityManager = (() => {

    if (props.modelingData.entityManager) {
        return props.modelingData.entityManager;
    } else {
        const newEntityManager = new SystemEntityManager(currentSystemGraph.value as dia.Graph);
        emit("store:modelingData", newEntityManager);
        return new SystemEntityManager(currentSystemGraph.value as dia.Graph);
    }
})();

const mainPaper = ref<dia.Paper>();

const currentSelection = ref<dia.CellView | dia.LinkView>();
const currentRequestTraceViewSelection = ref<dia.Element>();
const printing = ref(false);
const currentDataAggregateHighlight = ref<string>("");
const currentBackingDataHightlight = ref<string>("");


onMounted(() => {

    /**
     * Create and initialize the Details Sidebar view. 
     * Additionally, it defines when the sidebar should be generally displayed.
    */

    currentSystemGraph.value.on("add", (cell) => {
        currentSelection.value = mainPaper.value.findViewByModel(cell);
    })

    document.addEventListener("keydown", (keydownEvent) => {
        if (keydownEvent.code === "Delete") {
            // check if Element is selected
            if (currentSelection.value) {
                currentSelection.value.model.remove();
                currentSelection.value = null;
            }
        }
    }, false);

})

function loadFromJson(jsonString: string, fileName: string) {
    let createdCells = systemEntityManager.loadFromJson(jsonString, fileName);

    for (const cell of createdCells) {
        addSelectionToolToEntity(cell, mainPaper.value);
    }

    setCurrentSystemName(systemEntityManager.getSystemEntity().getSystemName);

    setTimeout(() => {
        mainPaper.value.hideTools();
    }, 100)
}

function saveToJson() {
    let jsonSerializedGraph = systemEntityManager.convertToJson();

    // download created yaml taken from https://stackoverflow.com/a/22347908
    let downloadElement = document.createElement("a");
    downloadElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonSerializedGraph)));
    downloadElement.setAttribute('download', `${currentSystemName.value}.json`);
    downloadElement.click();
}

function loadFromTosca(yamlString: string, fileName: string) {
    let createdCells = systemEntityManager.loadFromCustomTosca(yamlString, fileName);

    for (const cell of createdCells) {
        addSelectionToolToEntity(cell, mainPaper.value);
    }

    setCurrentSystemName(systemEntityManager.getSystemEntity().getSystemName);

    setTimeout(() => {
        mainPaper.value.hideTools();
    }, 100)
}

function saveToTosca() {
    let asYaml = systemEntityManager.convertToCustomTosca();

    // download created yaml taken from https://stackoverflow.com/a/22347908
    let downloadElement = document.createElement("a");
    downloadElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(asYaml));
    downloadElement.setAttribute('download', `${currentSystemName.value}.yaml`);
    downloadElement.click();
}

function onSelectRequestTrace(element: dia.Element) {

    currentRequestTraceViewSelection.value = element;

    element.prop("collapsed", false);
    element.attr("icon/visibility", "hidden");
    element.attr("body/fill", "gold");

    // get involved Links
    const involvedLinks = element.prop("entity/properties/involved_links");

    let allInvolvedEntities = new Set(involvedLinks);
    // add Request Trace entity itself 
    allInvolvedEntities.add(element.id);
    // add referred External Endpoint
    allInvolvedEntities.add(element.prop("entity/properties/referred_endpoint"));

    if (involvedLinks && involvedLinks.length > 0) {
        for (const involvedLink of involvedLinks) {
            const linkEntity = currentSystemGraph.value.getCell(involvedLink) as dia.Link;
            allInvolvedEntities.add(linkEntity.getTargetElement().id);
            allInvolvedEntities.add(linkEntity.getTargetElement().parent());
            allInvolvedEntities.add(linkEntity.getSourceElement().id);
        }
    }

    // hide all other entities
    const allSystemEntities = currentSystemGraph.value.getCells();
    for (const entity of allSystemEntities) {
        if (allInvolvedEntities.has(entity.id)) {
            continue;
        }
        entity.attr("root/visibility", "hidden", { isolate: true }); // TODO check isolate
    }
}

function onRequestTraceDeselect() {

    currentRequestTraceViewSelection.value?.attr("body/fill", "white");
    currentRequestTraceViewSelection.value?.attr("icon/visibility", "visible");
    currentRequestTraceViewSelection.value?.prop("collapsed", true);

    currentRequestTraceViewSelection.value = null

    const allSystemEntities = currentSystemGraph.value.getCells();
    for (const entity of allSystemEntities) {
        entity.attr("root/visibility", "visible", { isolate: true });
    }
}

function onPrintRequested() {
    printing.value = true;
    nextTick(function () {
        // DOM updated
        window.print();
        printing.value = false;
    });
}

</script>
