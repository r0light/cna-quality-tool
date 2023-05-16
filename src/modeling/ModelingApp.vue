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
        <div id="appToolbarContainer" class="app-header d-print-none"></div>
        <div class="app-body">
            <div class="entityShapes-sidebar-container d-print-none"></div>
            <div class="visible-modeling-area"></div>
            <div class="details-container d-print-none"></div>
        </div>
        <div id="modals" class="d-print-none"></div>
    </div>
</template>



<script lang="ts" setup>
import $ from 'jquery';
import { ref, onMounted } from 'vue'
import { dia, shapes } from 'jointjs'
import SystemEntityManager from './systemEntityManager';
import ModelingAppMainView from './views/modelingAppMainView'

const currentSystemName = ref("");
//const currentSystemGraph = ref<dia.Graph>(new dia.Graph({}, { cellNamespace: shapes }));
//const systemEntityManager = ref(new SystemEntityManager(currentSystemGraph.value));

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

    $("#appNameTitle").val(currentSystemName.value);
    setCurrentSystemName(currentSystemName.value)
    showInitOverlay.value = false;
    $("#appToolbarContainer button").attr("disabled", null);

}

function setCurrentSystemName(systemName: string) {
    if (!systemName) {
        return;
    }

    if (!currentSystemName.value) {
        $("#appNameTitle").trigger($.Event("initialSystemName",
            { systemName: systemName }
        ));
        //currentSystemGraph.value.trigger($.Event("initialSystemName", { systemName: systemName }));
    }

    //currentSystemName.value = systemName;
    // TODO sessionStorage ?
}

onMounted(() => {
        
    document.getElementById("applicationNameInputField").addEventListener("keydown", (event) => {
        if (event.key?.localeCompare("Enter") === 0) {
            event.preventDefault();
            onNameEntered();
        }
    });

    var mainView = new ModelingAppMainView({
        el: '#app',
        //modelingAreaGraph: currentSystemGraph.value,
        modelingAreaGraph: new dia.Graph({}, { cellNamespace: shapes }),
        currentSystemName: currentSystemName.value
    });
    $("#appToolbarContainer button").attr("disabled", "");

    if (currentSystemName.value) {
        $("#appNameTitle").val(currentSystemName.value);
    }
    $("#appNameTitle").on("systemNameChanged", (event) => {
        // this.#currentSystemGraph.on("systemNameChanged", (event) => {
        if (event.data && event.data["updatedSystemName"]) {
            setCurrentSystemName(event.data["updatedSystemName"]);
        }
    });
})




</script>
