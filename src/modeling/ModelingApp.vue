<template>
    <div id="app">
        <Toolbar :system-name="currentSystemName" :key="currentSystemName" :paper="(mainPaper as dia.Paper)"
            :graph="(currentSystemGraph as dia.Graph)" :selectedRequestTrace="currentRequestTraceViewSelection"
            @update:systemName="setCurrentSystemName" @click:exit-request-trace-view="resetRequestTraceSelection"
            @click:print-active-paper="onPrintRequested" @load:fromJson="loadFromJson" @save:toJson="saveToJson"
            @load:fromTosca="loadFromTosca" @save:toTosca="saveToTosca"></Toolbar>
        <div class="app-body">
            <div :id="`entity-sidebar-${pageId}`" class="entityShapes-sidebar-container d-print-none">
                <EntitySidebar :paper="mainPaper" :pageId="`model${pageId}`" :wrapperElementId="`entity-sidebar-${pageId}`">
                </EntitySidebar>
            </div>
            <div class="visible-modeling-area">
                <ModelingArea :pageId="`model${pageId}`" :graph="(currentSystemGraph as dia.Graph)"
                    v-model:paper="mainPaper" :currentElementSelection="currentSelection"
                    :currentRequestTraceSelection="currentRequestTraceViewSelection" :printing="printing"
                    @select:Element="(element: dia.CellView | dia.LinkView) => currentSelection = element"
                    @select:RequestTrace="onSelectRequestTrace" @deselect:Element="currentSelection = null"
                    @deselect:RequestTrace="resetRequestTraceSelection">
                </ModelingArea>
            </div>
            <DetailsSidebar :paper="mainPaper" :graph="(currentSystemGraph as dia.Graph)" :selectedEntity="currentSelection"
                :selectedDataAggregate="currentDataAggregateHighlight" :selectedBackingData="currentBackingDataHightlight">
            </DetailsSidebar>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import { dia } from "jointjs";
import SystemEntityManager from './systemEntityManager';
import Toolbar from './views/toolbar/Toolbar.vue';
import ModelingArea from './views/ModelingArea.vue';
import DetailsSidebar from './views/detailsSidebar/DetailsSidebar.vue';
import EntitySidebar from './views/EntitySidebar.vue';
import { addSelectionToolToEntity } from './views/tools/entitySelectionTools';
import { ImportData, ModelingData } from '@/App.vue';
import EntityTypes from './config/entityTypes';
import { entityShapes } from './config/entityShapes';

const props = defineProps<{
    systemName: string,
    pageId: number,
    modelingData: ModelingData
}>()


const emit = defineEmits<{
    (e: "update:systemName", newName: string): void;
    (e: "store:modelingData", systemEntitManager: SystemEntityManager, toImport: ImportData, importDone: boolean): void;
}>()

const currentSystemName = ref(props.systemName);

function setCurrentSystemName(systemName: string) {
    if (!systemName) {
        return;
    }
    currentSystemName.value = systemName;
    emit("update:systemName", currentSystemName.value);
}

const currentSystemGraph = ref<dia.Graph>((() => {

    if (props.modelingData.entityManager) {
        return props.modelingData.entityManager.getGraph() as dia.Graph;
    } else {
        const newGraph = new dia.Graph({}, { cellNamespace: entityShapes });
        return newGraph;
    }
})());

const systemEntityManager: SystemEntityManager = (() => {

    if (props.modelingData.entityManager) {
        return props.modelingData.entityManager;
    } else {
        const newEntityManager = new SystemEntityManager(currentSystemGraph.value as dia.Graph);
        emit("store:modelingData", newEntityManager, props.modelingData.toImport, true);
        return new SystemEntityManager(currentSystemGraph.value as dia.Graph);
    }
})();

const mainPaper = ref<dia.Paper>();

const currentSelection = ref<dia.CellView | dia.LinkView>();
const currentRequestTraceViewSelection = ref<dia.Element>();
const printing = ref(false);
const currentDataAggregateHighlight = ref<string>("none");
const currentBackingDataHightlight = ref<string>("none");

/*
function startWaitingForPaperToBeVisible(): Promise<void> {
    return new Promise((resolve, reject) => {
        waitForPaperToBeVisible(resolve);
    })
}

function waitForPaperToBeVisible(resolve: () => void) {

    console.log(`paper of ${props.systemName} is visible? ${mainPaper.value.$el.is(':visible')}`);
    if (mainPaper.value.$el.is(':visible')) {
        resolve();
    } else {
        setTimeout(waitForPaperToBeVisible.bind(this, resolve), 100);
    }
}
*/

onMounted(() => {

    /**
     * Create and initialize the Details Sidebar view. 
     * Additionally, it defines when the sidebar should be generally displayed.
    */

    let loaded;

    if (props.modelingData.toImport.fileName) {
        if (props.modelingData.toImport.fileName.endsWith("json")) {
            loaded = loadFromJson(props.modelingData.toImport.fileContent, props.modelingData.toImport.fileName);
        } else if (props.modelingData.toImport.fileName.endsWith("yaml")
            || props.modelingData.toImport.fileName.endsWith("yml")
            || props.modelingData.toImport.fileName.endsWith("tosca")) {
            loaded = loadFromTosca(props.modelingData.toImport.fileContent, props.modelingData.toImport.fileName);
        }

        loaded.then(() => {
            emit("store:modelingData", systemEntityManager, { fileName: '', fileContent: '' }, true);
        })
    }

    /*
    currentSystemGraph.value.on("add", (cell) => {
        currentSelection.value = mainPaper.value.findViewByModel(cell);
    })
    */

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

function resetAllHighlighting() {
    mainPaper.value.trigger('blank:pointerdown');
    currentSelection.value = null;

    currentSystemGraph.value.trigger('resetHighlighting');

    resetRequestTraceSelection();
}

function loadFromJson(jsonString: string, fileName: string): Promise<void> {
    resetAllHighlighting();

    let createdCells = systemEntityManager.loadFromJson(jsonString, fileName);

    setCurrentSystemName(systemEntityManager.getSystemEntity().getSystemName);

    return ensureCorrectRendering(createdCells);
}

function saveToJson() {
    resetAllHighlighting();

    let jsonSerializedGraph = systemEntityManager.convertToJson();

    // download created yaml taken from https://stackoverflow.com/a/22347908
    let downloadElement = document.createElement("a");
    downloadElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonSerializedGraph)));
    downloadElement.setAttribute('download', `${currentSystemName.value}.json`);
    downloadElement.click();
}

function loadFromTosca(yamlString: string, fileName: string): Promise<void> {
    resetAllHighlighting();

    let createdCells = systemEntityManager.loadFromCustomTosca(yamlString, fileName);

    setCurrentSystemName(systemEntityManager.getSystemEntity().getSystemName);

    return ensureCorrectRendering(createdCells);

}

/*
function waitForCellToBeVisible(cell: dia.CellView, resolve: () => void) {
    if (cell.$el.is(':visible')) {
        resolve()
    } else {
        setTimeout(waitForCellToBeVisible.bind(this, cell, resolve), 100);
    }
}
*/

function ensureCorrectRendering(createdCells: dia.Cell[]): Promise<void> {
    return new Promise<void>((outerResolve, outerReject) => {

        let cellsRendered = [];

        for (const cell of createdCells) {

            let cellRendered = Promise.resolve();

            if (cell.isElement()) {

                // resize element to a different size and that to the wanted size again, to rerender the bounding box and ensure that it has the right size
                let wantedWidth = cell.prop("size/width");
                let wantedHeight = cell.prop("size/height");
                cellsRendered.push(
                    cellRendered.then(() => {
                        return new Promise<void>((resolve, reject) => {
                            //element.resize(element.prop("defaults/size").width, element.prop("defaults/size").height);
                            (cell as dia.Element).resize(wantedWidth + 10, wantedHeight + 10);
                            setTimeout(() => {
                                resolve();
                            }, 100)
                        })
                    }).then(() => {
                        return new Promise<void>((resolve, reject) => {
                            (cell as dia.Element).resize(wantedWidth, wantedHeight);
                            setTimeout(() => {
                                resolve();
                            }, 100)
                        });
                    }).then(() => {
                        return new Promise<void>((resolve, reject) => {
                            addSelectionToolToEntity(mainPaper.value.requireView(cell as dia.Element).model, mainPaper.value);
                            setTimeout(() => {
                                resolve();
                            }, 100)
                        });
                    })
                );
            } /*else if (cell.isLink) {
                cellsRendered.push(
                    cellRendered.then(() => {
                        return new Promise<void>((resolve, reject) => {
                            waitForCellToBeVisible(cell.findView(mainPaper.value), resolve);
                        })
                    })  
                )
            } */
        }

        Promise.all(cellsRendered).then(() => {
            //mainPaper.value.updateViews();
            mainPaper.value.hideTools();
            outerResolve();
        })
    });
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

    highlightRequestTrace(element);

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
        entity.attr("icon/visibility", "hidden", { isolate: true });
    }
}

function resetRequestTraceSelection() {

    //TODO unhighlight all request traces so that this function can be used for the reload
    if (currentRequestTraceViewSelection.value) {
        unhighlightRequestTrace(currentRequestTraceViewSelection.value);
    }

    currentRequestTraceViewSelection.value = null

    const allSystemEntities = currentSystemGraph.value.getCells();
    for (const entity of allSystemEntities) {

        if (!entity.prop("parentCollapsed") || entity.prop("parentCollapsed") === false) {
            entity.attr("root/visibility", "visible", { isolate: true });
        }

        if (entity.attr("collapsed") === true || entity.prop("entity/type") === EntityTypes.REQUEST_TRACE) {
            entity.attr("icon/visibility", "visible", { isolate: true });
        }
    }
}

function highlightRequestTrace(requestTrace: dia.Element) {
    requestTrace.prop("collapsed", false);
    requestTrace.attr("icon/visibility", "hidden");
    requestTrace.attr("body/fill", "gold");
}

function unhighlightRequestTrace(requestTrace: dia.Element) {
    requestTrace.prop("collapsed", true);
    requestTrace.attr("icon/visibility", "visible");
    requestTrace.attr("body/fill", "white");
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
