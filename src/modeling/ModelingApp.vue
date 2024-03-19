<template>
    <div id="app">
        <Toolbar :system-name="currentSystemName" :key="currentSystemName" :paper="(mainPaper as dia.Paper)"
            :graph="(currentSystemGraph as dia.Graph)" :selectedRequestTrace="currentRequestTraceViewSelection"
            :appSettings="modelingData ? modelingData.appSettings : getDefaultAppSettings()"
            @update:systemName="setCurrentSystemName" @update:appSettings="setCurrentAppSettings"
            @click:exit-request-trace-view="resetRequestTraceSelection" @click:print-active-paper="onPrintRequested"
            @click:exportSvg="onSvgExportRequested" @click:validate="triggerValidation" @load:fromJson="loadFromJson"
            @save:toJson="saveToJson" @load:fromTosca="requestLoadFromTosca" @save:toTosca="saveToTosca"></Toolbar>
        <div class="app-body">
            <div :id="`entity-sidebar-${pageId}`" class="entityShapes-sidebar-container d-print-none">
                <EntitySidebar :paper="mainPaper" :pageId="`model${pageId}`"
                    :wrapperElementId="`entity-sidebar-${pageId}`">
                </EntitySidebar>
            </div>
            <div class="visible-modeling-area">
                <ModelingArea :pageId="`model${pageId}`" :graph="(currentSystemGraph as dia.Graph)"
                    v-model:paper="mainPaper" :currentElementSelection="currentSelection"
                    :currentRequestTraceSelection="currentRequestTraceViewSelection" :printing="printing"
                    :appSettings="modelingData ? modelingData.appSettings : getDefaultAppSettings()"
                    @select:Element="(element: dia.CellView | dia.LinkView) => currentSelection = element"
                    @select:RequestTrace="onSelectRequestTrace" @deselect:Element="currentSelection = null"
                    @deselect:RequestTrace="resetRequestTraceSelection">
                </ModelingArea>
            </div>
            <DetailsSidebar :paper="mainPaper" :graph="(currentSystemGraph as dia.Graph)"
                :selectedEntity="currentSelection" :selectedDataAggregate="currentDataAggregateHighlight"
                :selectedBackingData="currentBackingDataHightlight">
            </DetailsSidebar>
        </div>
        <ModalConfirmationDialog v-bind="confirmationModalManager"></ModalConfirmationDialog>
    </div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
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
import { ensureCorrectRendering } from './renderingUtilities';
import ModalConfirmationDialog, { ConfirmationModalProps, getDefaultConfirmationDialogData } from './views/components/ModalConfirmationDialog.vue';
import { DialogSize } from './config/actionDialogConfig';
import { ModelingAppSettings, getDefaultAppSettings } from './config/appSettings';
import { request } from 'http';

const props = defineProps<{
    systemName: string,
    pageId: number,
    modelingData: ModelingData
}>()


const emit = defineEmits<{
    (e: "update:systemName", newName: string, id: number): void;
    (e: "store:modelingData", id: number, systemEntitManager: SystemEntityManager, toImport: ImportData, importDone: boolean, appSettings: ModelingAppSettings): void;
}>()

const currentSystemName = ref(props.systemName);

function setCurrentSystemName(systemName: string) {
    if (!systemName) {
        return;
    }
    currentSystemName.value = systemName;
    emit("update:systemName", currentSystemName.value, props.pageId);
}

function setCurrentAppSettings(appSettings: ModelingAppSettings) {
    emit("store:modelingData", props.modelingData.id, systemEntityManager, props.modelingData.toImport, props.modelingData.importDone, appSettings);
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
        emit("store:modelingData", props.modelingData.id, newEntityManager, props.modelingData.toImport, true, props.modelingData.appSettings);
        return new SystemEntityManager(currentSystemGraph.value as dia.Graph);
    }
})();

const mainPaper = ref<dia.Paper>();

const currentSelection = ref<dia.CellView | dia.LinkView>();
const currentRequestTraceViewSelection = ref<dia.Element>();
const printing = ref(false);
const currentDataAggregateHighlight = ref<string>("none");
const currentBackingDataHightlight = ref<string>("none");

const confirmationModalManager = ref<ConfirmationModalProps>(getDefaultConfirmationDialogData());


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
            loaded = loadFromTosca(props.modelingData.toImport.fileContent, props.modelingData.toImport.fileName, "replace");
        }

        loaded.then(() => {
            emit("store:modelingData", props.modelingData.id, systemEntityManager, { fileName: '', fileContent: '' }, true, props.modelingData.appSettings);
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

    let loadResult = systemEntityManager.loadFromJson(jsonString, fileName);

    if (loadResult.error) {
        showError("Import from JSON failed", loadResult.error);
        return Promise.resolve();
    }

    setCurrentSystemName(systemEntityManager.getSystemEntity().getSystemName);

    return ensureCorrectRendering(loadResult.createdCells, mainPaper.value).then(done => resetAllHighlighting());
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

function requestLoadFromTosca(yamlString: string, fileName: string) {
    
    confirmationModalManager.value = {
        show: true,
        dialogMetaData: {
            dialogSize: DialogSize.DEFAULT,
            header: {   
                iconClass: "fa-solid fa-question",
                svgRepresentation: "",
                text: "Replace or merge?"
            },
            footer: {
                showCancelButton: true,
                cancelButtonText: "Cancel",
                actionButtons: [{ buttonIconClass: "", buttonText: "Merge"}, { buttonIconClass: "", buttonText: "Replace"}]
            },
        },
        confirmationPrompt: "Do you want to replace the current model with the imported model or merge the imported model into the current model?",
        onCancel: () => confirmationModalManager.value.show = false,
        actions: [
            function decideToMerge() {
                confirmationModalManager.value.show = false;
                systemEntityManager.getSystemEntity;
                loadFromTosca(yamlString, fileName, "merge");
            },
            function decideToReplace() {
                confirmationModalManager.value.show = false;
                loadFromTosca(yamlString, fileName, "replace");
            },
        ]
    }
}

function loadFromTosca(yamlString: string, fileName: string, strategy: "replace" | "merge"): Promise<void> {
    resetAllHighlighting();

    let loadResult = systemEntityManager.loadFromCustomTosca(yamlString, fileName, strategy);

    if (loadResult.error) {
        showError("Import from TOSCA failed", loadResult.error);
        return Promise.resolve();
    }

    setCurrentSystemName(systemEntityManager.getSystemEntity().getSystemName);

    return ensureCorrectRendering(loadResult.createdCells, mainPaper.value).then(done => resetAllHighlighting());

}

function showError(errorTitle, errorMessage) {
    confirmationModalManager.value = {
        show: true,
        dialogMetaData: {
            dialogSize: DialogSize.DEFAULT,
            header: {
                iconClass: "fa-solid fa-triangle-exclamation",
                svgRepresentation: "",
                text: errorTitle
            },
            footer: {
                showCancelButton: false,
                cancelButtonText: "Cancel",
                actionButtons: [{ buttonIconClass: "", buttonText: "OK" }]
            },
        },
        confirmationPrompt: errorMessage,
        onCancel: () => confirmationModalManager.value.show = false,
        actions: [function onConfirm() {
            confirmationModalManager.value.show = false;
        }]
    }
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

function saveToTosca() {

    let result = systemEntityManager.convertToCustomTosca();

    function continueExport() {
        // download created yaml taken from https://stackoverflow.com/a/22347908
        let downloadElement = document.createElement("a");
        downloadElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(result.tosca));
        downloadElement.setAttribute('download', `${currentSystemName.value}.yaml`);
        downloadElement.click();
    }

    if (result.errors.length > 0) {
        confirmationModalManager.value = {
            show: true,
            dialogMetaData: {
                dialogSize: DialogSize.LARGE,
                header: {
                    iconClass: "fa-solid fa-triangle-exclamation",
                    svgRepresentation: "",
                    text: "Warning"
                },
                footer: {
                    showCancelButton: true,
                    cancelButtonText: "No, cancel export",
                    actionButtons: [{ buttonIconClass: "", buttonText: "Yes, export anyway" }]
                },
            },
            confirmationPrompt: `Problems detected while preparing the export:
            <ul>
                <li> ${result.errors.join("</li>\n<li>")} </li>
            </ul>
            Are you sure you want to export?
            `,
            onCancel: () => confirmationModalManager.value.show = false,
            actions: [function onConfirm() {
                confirmationModalManager.value.show = false;
                continueExport();
            }]
        }
    } else {
        continueExport();
    }
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
            if (linkEntity.getTargetElement().prop("entity/properties/uses_data")) {
                for (const usedData of linkEntity.getTargetElement().prop("entity/properties/uses_data")) {
                    allInvolvedEntities.add(currentSystemGraph.value.getCell(usedData).id);
                }
            }
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
    } else {
        currentSystemGraph.value.getElements().filter(element => element.prop("entity/type") === EntityTypes.REQUEST_TRACE).forEach(requestTrace => {
            unhighlightRequestTrace(requestTrace)
        });
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

function onSvgExportRequested() {
    let paperDiv = $(`#model${props.pageId}`);

    let svgElement = paperDiv.find("svg").clone()[0];
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    let layersElement = paperDiv.find(".joint-layers")[0];
    let boundingBox = layersElement.getBoundingClientRect();

    svgElement.setAttribute("viewBox", `0 0 ${boundingBox.x + boundingBox.width} ${boundingBox.y + boundingBox.height}`);

    let asString = svgElement.outerHTML;
    asString = asString.replaceAll("&nbsp;", " ");

    // download created svg (taken from https://stackoverflow.com/a/22347908)
    let downloadElement = document.createElement("a");
    downloadElement.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(asString));
    downloadElement.setAttribute('download', `${currentSystemName.value}.svg`);
    downloadElement.click();
}

function triggerValidation() {
    let errors = systemEntityManager.validateModeledSystem();

    if (errors.length > 0) {
        confirmationModalManager.value = {
            show: true,
            dialogMetaData: {
                dialogSize: DialogSize.LARGE,
                header: {
                    iconClass: "fa-solid fa-triangle-exclamation",
                    svgRepresentation: "",
                    text: "Warning"
                },
                footer: {
                    showCancelButton: false,
                    cancelButtonText: "",
                    actionButtons: [{ buttonIconClass: "", buttonText: "OK" }]
                },
            },
            confirmationPrompt: `The following problems were detected while validating the modeled system:
            <ul>
                <li> ${errors.join("</li>\n<li>")} </li>
            </ul>
            `,
            onCancel: () => confirmationModalManager.value.show = false,
            actions: [function onConfirm() {
                confirmationModalManager.value.show = false;
            }]
        }
    } else {
        confirmationModalManager.value = {
            show: true,
            dialogMetaData: {
                dialogSize: DialogSize.DEFAULT,
                header: {
                    iconClass: "fa-solid fa-circle-check",
                    svgRepresentation: "",
                    text: "Validation passed."
                },
                footer: {
                    showCancelButton: false,
                    cancelButtonText: "",
                    actionButtons: [{ buttonIconClass: "", buttonText: "OK" }]
                },
            },
            confirmationPrompt: `No problems were detected while validating the modeled system!`,
            onCancel: () => confirmationModalManager.value.show = false,
            actions: [function onConfirm() {
                confirmationModalManager.value.show = false;
            }]
        }
    }

}

</script>
