<template>
    <div id="init-overlay" class="init-overlay" v-show="showInitOverlay">
        <div class="init-overlay-content">
            <h2 class="user-select-none text-center">Welcome to the CNA Modeling Application!</h2>
            <div id="init-firstInformation" v-show="!showStartModelingForm">
                <p class="user-select-none">The modeling application allows you to model cloud-native application (CNA)
                    architectures using thirteen different entities. It is based on the CNA quality model
                    as introduced here:
                    https://github.com/r0light/cna-quality-model/tree/9058f6236e8e0b1cceee9abf67a96e927140d0fa. In addition,
                    the application supports exporting the graphical model into an
                    extended version of the TOSCA architecture description language. The extended TOSCA version is being
                    introduced here: https://github.com/KarolinDuerr/MA-CNA-ModelingSupport/tree/main/TOSCA_Extension.</p>
                <button id="createNewDiagramBtn" type="button" class="btn btn-outline-dark btn-light"
                    @click="startModelingForm"> <i class="fa-solid fa-pencil"></i> Create new diagram </button>
            </div>
            <div id="startModelingForm" v-show="showStartModelingForm">
                <p class="user-select-none">Please type the application name of the System entity you want to model
                    in the following form. Afterwards, you can start modeling your application's architecture.</p>
                <form class="needs-validation" novalidate>
                    <div class="form-row">
                        <div class="input-group has-validation">
                            <div class="input-group-prepend">
                                <span class="user-select-none input-group-text">Application Name</span>
                            </div>
                            <input name="systemName" type="text" class="form-control" id="applicationNameInputField"
                                placeholder="Application name of your System" v-model="currentSystemName" required>
                            <div class="validationError invalid-feedback">
                                Please provide an application name.
                            </div>
                        </div>
                        <div class="startModelingBtnArea form-group row">
                            <div class="col-auto">
                                <button id="startModelingBtn" type="button" class="btn btn-outline-dark"
                                    @click="onNameEntered"><i class="fa-solid fa-pencil"></i> Start modeling</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="app">
        <Toolbar :system-name="currentSystemName" :key="currentSystemName" :paper="mainPaper as dia.Paper"
            :graph="currentSystemGraph as dia.Graph" :selectedRequestTrace="currentRequestTraceViewSelection"
            @update:systemName="setCurrentSystemName" @click:exit-request-trace-view="onRequestTraceDeselect"
            @click:print-active-paper="onPrintRequested"></Toolbar>
        <div class="app-body">
            <div class="entityShapes-sidebar-container d-print-none"></div>
            <div class="visible-modeling-area">
                <ModelingArea :graph="currentSystemGraph as dia.Graph" v-model:paper="mainPaper"
                    :currentElementSelection="currentSelection"
                    :currentRequestTraceSelection="currentRequestTraceViewSelection" :printing="printing"
                    @select:Element="(element: dia.CellView | dia.LinkView) => currentSelection = element"
                    @select:RequestTrace="onSelectRequestTrace" @deselect:Element="currentSelection = null"
                    @deselectRequestTrage="onRequestTraceDeselect">
                </ModelingArea>
            </div>
            <div class="details-container d-print-none"></div>
        </div>
        <div id="modals" class="d-print-none"></div>
    </div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { ref, onMounted, nextTick } from 'vue'
import { dia, shapes } from "jointjs";
import SystemEntityManager from './systemEntityManager';

import Toolbar from './views/Toolbar.vue';
import ModelingArea from './views/ModelingArea.vue';
import EntitySidebar from './views/entitySidebar';
import DetailsSidebar from './views/detailsSidebar/detailsSidebar';

import SidebarEntityShapes from './config/entitySidebarShape.config';
import { DetailsSidebarConfig } from './config/detailsSidebarConfig';

const currentSystemName = ref("");
const showInitOverlay = ref(true);
const showStartModelingForm = ref(false);


function startModelingForm() {
    showStartModelingForm.value = true;
}

function onNameEntered() {
    let forms = $("#init-overlay .needs-validation");

    for (const form of forms) {
        form.classList.add('was-validated');
    }

    if (!currentSystemName.value) {
        return;
    }
    showInitOverlay.value = false;

}

function setCurrentSystemName(systemName: string) {
    if (!systemName) {
        return;
    }
    currentSystemName.value = systemName;
    // TODO sessionStorage ?
}

const currentSystemGraph = ref<dia.Graph>(new dia.Graph({}, { cellNamespace: shapes }));
const systemEntityManager = ref(new SystemEntityManager(currentSystemGraph.value));

const mainPaper = ref<dia.Paper>();

const currentSelection = ref<dia.CellView | dia.LinkView>();
const currentRequestTraceViewSelection = ref<dia.Element>();
const printing = ref(false);

onMounted(() => {

    document.getElementById("applicationNameInputField").addEventListener("keydown", (event) => {
        if (event.key?.localeCompare("Enter") === 0) {
            event.preventDefault();
            onNameEntered();
        }
    });

    // Create and initialize the Entity Sidebar view, which includes the template shapes for the entities. 
    var entitySidebar = new EntitySidebar({
        paper: mainPaper.value,
        documentElement: $(".entityShapes-sidebar-container"),
        sidebarEntityConfig: SidebarEntityShapes
    });
    entitySidebar.render();

    /**
     * Create and initialize the Details Sidebar view. 
     * Additionally, it defines when the sidebar should be generally displayed.
    */

    var detailsSidebar = new DetailsSidebar({
        el: $(".details-container"),
        paper: mainPaper.value,
        detailsSidebarConfig: DetailsSidebarConfig
    });
    detailsSidebar.render();

    mainPaper.value.on("cell:pointerdown", (cellView: dia.CellView) => {
        detailsSidebar.renderEntitySelectionProperties(cellView.model);
    });

    mainPaper.value.on("blank:pointerdown", () => {
        detailsSidebar.hideEntitySelectionProperties();
    });

    mainPaper.value.on("blank:contextmenu", () => {
        detailsSidebar.hideEntitySelectionProperties();
    });

    currentSystemGraph.value.on("add", (cell) => {
        currentSelection.value = mainPaper.value.findViewByModel(cell);
    })

    document.addEventListener("keydown", (keydownEvent) => {
        if (keydownEvent.code === "Delete") {
            // check if Element is selected
            if (currentSelection.value) {
                currentSelection.value.model.remove();
            }
        }
    }, false);

})


function onSelectRequestTrace(element: dia.Element) {

    currentRequestTraceViewSelection.value = element;

    element.prop("collapsed", false);
    element.attr("icon/visibility", "hidden");
    element.attr("body/fill", "gold");

    // get involved Links
    const involvedLinks = element.prop("entity/properties/involvedLinks");

    let allInvolvedEntities = new Set(involvedLinks[0]);
    // add Request Trace entity itself 
    allInvolvedEntities.add(element.id);
    // add referred External Endpoint
    allInvolvedEntities.add(element.prop("entity/properties/referredEndpoint"));

    if (involvedLinks && involvedLinks.length > 0) {
        for (const involvedLink of involvedLinks[0]) {
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
