<template>
    <div class="app-header-first-row">
        <div class="input-group app-title">
            <input id="appNameTitle" type="text" class="user-select-all form-control" v-model="currentSystemName"
                aria-label="Application name of current System entity" aria-describedby="app-title-description"
                :disabled="nameEditMode === 'none'">
            <div class="input-group-append" id="app-title-description">
                <span class="user-select-none input-group-text">Current System</span>

                <button id="editApplicationNameBtn" class="btn btn-outline-secondary" type="button" data-toggle="tooltip"
                    data-placement="bottom" title="Edit name of System entity" v-show="nameEditMode === 'none'"
                    @click="onToolbarButtonClick('editApplicationNameBtn', $event)">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>

                <button id="cancelEditApplicationNameBtn" class="btn btn-outline-danger submitEditApplicationNameBtnGroup"
                    type="button" data-toggle="tooltip" data-placement="bottom" title="Cancel editing"
                    v-show="nameEditMode === 'editing'"
                    @click="onToolbarButtonClick('cancelEditApplicationNameBtn', $event)">
                    <i class="fa-solid fa-xmark"></i>
                </button>


                <button id="submitEditApplicationNameBtn" class="btn btn-outline-success submitEditApplicationNameBtnGroup"
                    type="button" data-toggle="tooltip" data-placement="bottom" title="Submit name of System entity"
                    v-show="nameEditMode === 'editing'"
                    @click="onToolbarButtonClick('submitEditApplicationNameBtn', $event)">
                    <i class="fa-solid fa-check"></i>
                </button>

                <button id="addNewSystemEntity" class="btn btn-outline-secondary" type="button" data-toggle="tooltip"
                    data-placement="bottom" title="Add new System entity">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        </div>
        <div id="modelAppToolbar" class="toolbar-container">
            <div class="app-toolbar">
                <div v-for="buttonGroup in generalTools" class="app-toolbar-tools">
                    <ButtonGroup :buttonGroupId="buttonGroup.buttonGroupId" :buttons="buttonGroup.buttons"
                        @toolbarButtonClicked="onToolbarButtonClick">
                    </ButtonGroup>
                    <div class="group-divider"></div>
                </div>
                <div class="button-group" data-group="first-row-config-button">
                    <ButtonGroup v-for="tool of firstAdditionalTools" :buttonGroupId="tool.buttonGroupId"
                        :buttons="tool.buttons" @toolbarButtonClicked="onToolbarButtonClick"></ButtonGroup>
                </div>
            </div>
        </div>
    </div>
    <div class="app-header-second-row" v-show="showEntityBar">
        <div class="entity-tools">
            <div class="entity-overall-group" data-group="entity-overall-group">
                <div v-for="filterTool of filterTools">
                    <div class="entity-group form-check form-check-inline" :data-group="filterTool.viewKey"
                        :title="filterTool.tooltipText" data-toggle="tooltip" data-placement="bottom">
                        <input :id="filterTool.filterInput" @change="onFilterSelection(filterTool.viewKey)"
                            :data-entity-type="filterTool.viewKey" v-model="filterTool.filterState"
                            class="entityCheckBox form-check-input" type="checkbox" :value="filterTool.viewKey" checked>
                        <label :id="filterTool.entityLabel" class="user-select-none entityCheckBoxLabel form-check-label"
                            :for="filterTool.filterInput">
                            {{ filterTool.labelText }}
                        </label>

                    </div>
                    <div class="group-divider"></div>
                </div>
            </div>
        </div>
        <div v-for="tool of secondAdditionalTools" class="second-row-tools" data-group="second-row-config-tools">
            <div class="group-divider"></div>
            <ButtonGroup :buttonGroupId="tool.buttonGroupId" :buttons="tool.buttons"
                @toolbarButtonClicked="onToolbarButtonClick"></ButtonGroup>
        </div>
    </div>
    <ModalConfirmationDialog v-bind="confirmationModalManager"></ModalConfirmationDialog>
    <ModalWrapper :show="showAppSettings" :dialogMetaData="settingsModalMetaData" @close:Modal="showAppSettings = false"
        @save:Modal="updateAppSettings">
        <template v-slot:modalContent>
            <div class="modalDialogActionContainer container-fluid">
                <div id="modeling-area-size-row">
                    <h5>Modeling Area Size</h5>
                    <div class="modalElementGroup">
                        <form class="form-group">
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">
                                        <i class="fa-solid fa-ruler-horizontal"></i>
                                        <span class="modalInputLabel">Width</span>
                                    </span>
                                </div>
                                <input id="paperWidth" class="form-control" type="number" placeholder="Default: 3000"
                                    v-model="appSettings.paperWidth" aria-describedby="paperWidth-helpText" min="26">
                                <button id="paperWidth-resetButton" class="btn btn-outline-secondary" type="reset"
                                    @click="appSettings.paperWidth = 3000">Reset</button>
                                <small id="paperWidth-helpText" class="form-text text-muted">Due to the included content the
                                    value has to be greater than 26</small>
                            </div>
                        </form>
                        <form class="form-group">
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">
                                        <i class="fa-solid fa-ruler-vertical"></i>
                                        <span class="modalInputLabel">Height</span>
                                    </span>
                                </div>
                                <input id="paperHeight" class="form-control" type="number" placeholder="Default: 3000"
                                    v-model="appSettings.paperHeight" aria-describedby="paperHeight-helpText" min="26">
                                <button class="btn btn-outline-secondary" type="reset"
                                    @click="appSettings.paperHeight = 3000">Reset</button>
                                <small id="paperHeight-helpText" class="form-text text-muted">Due to the included content
                                    the
                                    value has to be greater than 26</small>
                            </div>
                        </form>
                    </div>
                    <hr>
                </div>
                <div>
                    <h5>Modeling Area Grid</h5>
                    <div class="modalElementGroup">
                        <form class="form-group">
                            <div>
                                <label for="gridSize" class="align-baseline">Size:<span
                                        class="rangeBoxCurrentValue ml-2 align-baseline badge badge-primary badge-pill">{{
                                            appSettings.paperGridSize }}</span></label>
                                <div class="inputRow form-row">
                                    <input class="col px-md-2 form-control-range" id="gridSize" type="range" min="1"
                                        max="50" v-model="appSettings.paperGridSize" step="1">
                                    <button id="gridSize-resetButton" class="btn btn-outline-secondary ml-2 btn-sm"
                                        type="reset" @click="appSettings.paperGridSize = 10">Reset</button>
                                </div>
                            </div>
                        </form>
                        <form class="form-group">
                            <div>
                                <label for="gridThickness" class="align-baseline">Thickness:
                                    <span id="gridThickness-currentValue"
                                        class="rangeBoxCurrentValue ml-2 align-baseline badge badge-primary badge-pill">{{
                                            appSettings.paperGridThickness }}</span></label>
                                <div class="inputRow form-row"><input class="col px-md-2 form-control-range"
                                        id="gridThickness" type="range" min="1" max="10"
                                        v-model="appSettings.paperGridThickness" step="1">
                                    <button id="gridThickness-resetButton" class="btn btn-outline-secondary ml-2 btn-sm"
                                        type="reset" @click="appSettings.paperGridThickness = 1">Reset</button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <hr>
                </div>
                <div>
                    <h5>Link Router Type</h5>
                    <div class="modalElementGroup">
                        <form class="form-group">
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span id="defaultRouter-inputGroupIconText" class="input-group-text">
                                        <i class=""></i>
                                        <span class="modalInputLabel">Link router</span>
                                    </span>
                                </div>
                                <select id="defaultRouter" class="form-control" v-model="appSettings.routerType">
                                    <option value="manhattan">Manhattan</option>
                                    <option value="normal">Normal</option>
                                    <option value="metro">Metro</option>
                                </select>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </template>
    </ModalWrapper>
</template>


<script lang="ts" setup>
import $, { data } from 'jquery';
import { ref, computed, onMounted, Ref, ComputedRef, nextTick } from "vue";
import { dia, util, highlighters, routers } from "jointjs";
import { DialogMetaData, DialogSize } from "../../config/actionDialogConfig";
import EntityTypes from "../../config/entityTypes";
import ToolbarConfig from "../../config/toolbarConfiguration";
import ButtonGroup from './ButtonGroup.vue';
import ModalConfirmationDialog, { ConfirmationModalProps, getDefaultConfirmationDialogData } from '../components/ModalConfirmationDialog.vue';
import ModalWrapper from '../components/ModalWrapper.vue';
import { filter } from 'lodash';
import { EntitiesToToscaConverter } from '@/core/tosca-adapter/EntitiesToToscaConverter';
import { getAffectedBackingViewCells, getAffectedCommunicationViewCells, getAffectedDataViewCells, getAffectedDeploymentViewCells } from './viewfilter';

export type ToolbarButton = {
    buttonType: string,
    providedFeature: string,
    tooltipText: string,
    text: string,
    iconClass: string,
    additionalCssClass: string,
    show: boolean | ComputedRef<boolean>,
    // in case of Dropdown buttons:
    providedFeatureGroup?: string,
    dropdownButtons?: ToolbarButton[]
}

export type ToolbarButtonGroup = {
    buttonGroupId: string,
    buttons: ToolbarButton[]
}

const props = defineProps<{
    systemName: string;
    paper: dia.Paper;
    graph: dia.Graph;
    selectedRequestTrace: dia.Element
}>();

const emit = defineEmits<{
    (e: "update:systemName", newName: string): void;
    (e: "click:exitRequestTraceView"): void;
    (e: "click:printActivePaper"): void;
    (e: "click:exportSvg"): void;
    (e: "load:fromJson", stringifiedJson: string, fileName: string);
    (e: "save:toJson");
    (e: "load:fromTosca", stringifiedYaml: string, fileName: string);
    (e: "save:toTosca");
}>();

const currentSystemName = ref<string>(props.systemName);
const nameEditMode = ref<"none" | "editing">("none");
const showEntityBar = ref<boolean>(true);
const isFullScreen = ref<boolean>(false);

const confirmationModalManager = ref<ConfirmationModalProps>(getDefaultConfirmationDialogData());

const showAppSettings = ref<boolean>(false);
const settingsModalMetaData: DialogMetaData = {
    dialogSize: DialogSize.DEFAULT,
    header: {
        iconClass: "fa-solid fa-gear",
        svgRepresentation: "",
        text: "Application Settings"
    },
    footer: {
        showCancelButton: true,
        cancelButtonText: "Cancel",
        saveButtonIconClass: "fa-regular fa-floppy-disk",
        saveButtonText: "Apply changes"
    }
};
const appSettings = ref({
    paperWidth: 3000,
    paperHeight: 3000,
    paperGridSize: 10,
    paperGridThickness: 1,
    routerType: "manhattan"
})

function configureToolbarButtons(config: any[]): ToolbarButtonGroup[] {
    let toolbarGroups: ToolbarButtonGroup[] = [];
    for (const buttonGroup of config) {
        let buttons = [];
        for (const groupItem of buttonGroup.content) {
            if (groupItem.buttonType === 'button-dropdown') {
                let dropdownItems = [];
                for (const dropdownItem of groupItem.dropdownButtons) {
                    dropdownItems.push({
                        providedFeature: dropdownItem.providedFeature + '-dropdownItemButton',
                        additionalCssClass: dropdownItem.additionalCssClass,
                        iconClass: dropdownItem.iconClass,
                        text: dropdownItem.text,
                        show: true,
                    })
                }
                buttons.push({
                    buttonType: groupItem.buttonType,
                    providedFeature: groupItem.providedFeature + "-buttonDropDown",
                    tooltipText: groupItem.tooltipText,
                    text: groupItem.text,
                    iconClass: groupItem.iconClass,
                    additionalCssClass: groupItem.additionalCssClass,
                    show: true,
                    providedFeatureGroup: groupItem.providedFeature + "-buttonDropDownGroup",
                    dropdownButtons: dropdownItems,
                })
            } else {
                buttons.push({
                    buttonType: groupItem.buttonType,
                    providedFeature: groupItem.providedFeature + "-button",
                    tooltipText: groupItem.tooltipText,
                    text: groupItem.text,
                    iconClass: groupItem.iconClass,
                    additionalCssClass: groupItem.additionalCssClass,
                    show: true,
                })
            }
        }
        toolbarGroups.push({
            buttonGroupId: buttonGroup.buttonGroupId,
            buttons: buttons
        })
    }
    return toolbarGroups;
}

const generalTools: Ref<ToolbarButtonGroup[]> = ref((() => {
    return configureToolbarButtons(ToolbarConfig.Tools)
})());

const filterTools = ref((() => {
    let toolEntries = [];
    for (const filterElement of ToolbarConfig.FilterConfig) {
        toolEntries.push({
            viewKey: filterElement.key,
            filterInput: filterElement.key + "-checkBox",
            entityLabel: filterElement.key + "-checkBoxLabel",
            labelText: filterElement.labelText,
            tooltipText: filterElement.tooltipText,
            filterState: true
        })
    }
    return toolEntries;
})())

const firstAdditionalTools: Ref<ToolbarButtonGroup[]> = ref((() => {
    return configureToolbarButtons(ToolbarConfig.ToolbarRowConfig.find(element => element.rowIndex === 1).tools)
})());

const secondAdditionalTools: Ref<ToolbarButtonGroup[]> = ref((() => {
    return configureToolbarButtons(ToolbarConfig.ToolbarRowConfig.find(element => element.rowIndex === 2).tools)
})());

props.graph.on("change:attrs", entityVisibilityChanged);


function onToolbarButtonClick(buttonId: string, event) {
    switch (buttonId) {
        case "editApplicationNameBtn":
            nameEditMode.value = "editing";
            break;
        case "cancelEditApplicationNameBtn":
            currentSystemName.value = props.systemName;
            nameEditMode.value = "none";
            break;
        case "submitEditApplicationNameBtn":
            onNameEditSubmit();
            break;
        case "fullScreen-button":
            enterFullScreen();
            break;
        case "closefullScreen-button":
            exitFullScreen();
            break;
        case "fitActivePaperToContent-button":
            fitActivePaperToContent();
            break;
        case "clearActivePaper-button":
            clearActivePaper();
            break;
        case "printActivePaper-button":
            emit("click:printActivePaper");
            break;
        case "exportSvg-button":
            emit("click:exportSvg");
            break;
        case "zoomOutPaper-button":
            zoomOutPaper();
            break;
        case "zoomInPaper-button":
            zoomInPaper();
            break;
        case "exitRequestTraceView-button":
            emit("click:exitRequestTraceView");
            break;
        case "expandAll-button":
            toggleEntityExpansion(event);
            break;
        case "collapseAll-button":
            toggleEntityExpansion(event);
            break;
        case "applicationSettings-button":
            editApplicationSettings();
            break;
        case "showEntityToolbarRow-button":
            showEntityBar.value = true;
            break;
        case "hideEntityToolbarRow-button":
            showEntityBar.value = false;
            break;
        case "convertModeledSystemEntityToJson-dropdownItemButton":
            emit("save:toJson");
            //convertToJson();
            break;
        case "convertModeledSystemEntityToTosca-dropdownItemButton":
            emit("save:toTosca");
            break;
        case "loadModeledSystemEntityFromJson-dropdownItemButton":
            loadFromJson();
            break;
        case "loadModeledSystemEntityFromTosca-dropdownItemButton":
            loadFromTosca();
            break;
        case "changeGrid-button":
            changeGrid();
        case "fitAllElementsToEmbedded-button":
            fitAllElementsToEmbedded();
            break;
    }
}


function onNameEditSubmit() {
    if (!currentSystemName.value) {
        currentSystemName.value = props.systemName;
    } else {
        emit("update:systemName", currentSystemName.value);
    }
    nameEditMode.value = "none";
}

onMounted(() => {

    generalTools.value.find(element => element.buttonGroupId === "general-paper-actions")
        .buttons
        .find(element => element.providedFeature === "fullScreen-button")
        .show = computed(() => !isFullScreen.value);

    generalTools.value.find(element => element.buttonGroupId === "general-paper-actions")
        .buttons
        .find(element => element.providedFeature === "closefullScreen-button")
        .show = computed(() => isFullScreen.value);

    generalTools.value.find(element => element.buttonGroupId === "requestTraceView")
        .buttons
        .find(element => element.providedFeature === "exitRequestTraceView-button")
        .show = computed(() => !!props.selectedRequestTrace);

    firstAdditionalTools.value.find(element => element.buttonGroupId === "additionalToolbar")
        .buttons
        .find(element => element.providedFeature === "showEntityToolbarRow-button")
        .show = computed(() => !showEntityBar.value);

    secondAdditionalTools.value.find(element => element.buttonGroupId === "entireToolbarSecondRow")
        .buttons
        .find(element => element.providedFeature === "hideEntityToolbarRow-button")
        .show = computed(() => showEntityBar.value);

    tryResetFilters();

    return this;
})


function tryResetFilters() {
    // workaround, paper might be undefined, therefore wait for it to be ready
    if (props.paper) {
        // reset all filtering
        for (const filterTool of filterTools.value) {
            filterTool.filterState = true;
            onFilterSelection(filterTool.viewKey);
        }
    } else {
        setTimeout(tryResetFilters, 50);
    }
}

function enterFullScreen() {
    //TODO use only one button to toggle fullscreen? Because now, the button switching does not work when exiting full screen via browser "Esc"

    // decide what should be toggled --> Fix design and scrolling
    // joint.util.toggleFullScreen(document.getElementById("app"));
    util.toggleFullScreen();
    isFullScreen.value = true;
}

function exitFullScreen() {
    // decide what should be toggled --> Fix design and scrolling
    // joint.util.toggleFullScreen(document.getElementById("app"));
    util.toggleFullScreen();
    isFullScreen.value = false;
}

function fitActivePaperToContent() {
    props.paper.fitToContent({
        padding: util.normalizeSides(25),
        minWidth: 300,
        minHeight: 250
    });
}

// TODO if lock mechanism is included
// togglePaperInteractivity() {
//     if (this.paper.options.interactive == false) {
//         this.paper.setInteractivity({
//             labelMove: false,
//             addLinkFromMagnet: true,
//             linkMove: true
//         });
//     } else {
//         this.paper.setInteractivity(false);
//     }

//     $("#lockPaperInteractivity-button").toggle();
//     $("#unlockPaperInteractivity-button").toggle();
// }

function clearActivePaper() {
    confirmationModalManager.value = {
        show: true,
        dialogMetaData: {
            dialogSize: DialogSize.DEFAULT,
            header: {
                iconClass: "fa-solid fa-triangle-exclamation",
                svgRepresentation: "",
                text: "Warning"
            },
            footer: {
                showCancelButton: true,
                cancelButtonText: "No, Cancel",
                saveButtonIconClass: "fa-solid fa-trash-can",
                saveButtonText: "Yes, clear paper"
            },
        },
        confirmationPrompt: "Are you sure you want to clear the entire paper? You won't be able to undo this action.",
        onCancel: () => confirmationModalManager.value.show = false,
        onConfirm: () => {
            props.graph.clear();
            confirmationModalManager.value.show = false;
        }
    }
}

function changeGrid() {
    // TODO for options
    props.paper.clearGrid();
}

function zoomInPaper() {
    const dimensionsBeforeZoom = props.paper.getComputedSize();
    let currentScale = props.paper.scale();
    if (currentScale.sx >= 1) {
        props.paper.scale(currentScale.sx + 0.5);
    } else {
        props.paper.scale(currentScale.sx * 2);
    }
    props.paper.fitToContent({
        padding: 50,
        minWidth: dimensionsBeforeZoom.width,
        minHeight: dimensionsBeforeZoom.height
    });
}

function zoomOutPaper() {
    const dimensionsBeforeZoom = props.paper.getComputedSize();
    let currentScale = props.paper.scale();
    if (Math.round(currentScale.sx) <= 1) {
        props.paper.scale(currentScale.sx * 0.5);
    } else {
        props.paper.scale(currentScale.sx - 0.5);
    }
    props.paper.fitToContent({
        padding: 50,
        minWidth: dimensionsBeforeZoom.width,
        minHeight: dimensionsBeforeZoom.height
    });
}

function askForConversionToTosca() {
    confirmationModalManager.value = {
        show: true,
        dialogMetaData: {
            dialogSize: DialogSize.DEFAULT,
            header: {
                iconClass: "fa-solid fa-triangle-exclamation",
                svgRepresentation: "",
                text: "Warning"
            },
            footer: {
                showCancelButton: true,
                cancelButtonText: "No, Cancel",
                saveButtonIconClass: "fa-solid fa-download",
                saveButtonText: "Yes, start TOSCA transformation."
            },
        },
        confirmationPrompt: `The TOSCA export uses the labels of the respective entities as keys for the node_templates that represent the modeled entities. Therefore, please make sure, each entity has a unique label name, otherwise an entity might be missing in the export. Are you sure, you want to continue?`,
        onCancel: () => confirmationModalManager.value.show = false,
        onConfirm: () => {
            emit("save:toTosca");
            confirmationModalManager.value.show = false;
        }
    }
}

function loadFromJson() {

    let fileName = "";

    function loadFromUpload(fileReader: ProgressEvent<FileReader>) {
        let stringifiedJson: string = fileReader.target.result.toString();
        emit("load:fromJson", stringifiedJson, fileName);
    }

    let uploadElement = document.createElement("input");
    uploadElement.setAttribute("type", "file");
    uploadElement.setAttribute("accept", ".json");

    let fr = new FileReader();
    fr.onload = loadFromUpload;

    uploadElement.onchange = () => {
        // only one file should be selected
        fileName = uploadElement.files[0].name;
        fr.readAsText(uploadElement.files[0]);
    }
    uploadElement.click();
}

function loadFromTosca() {

    let fileName = "";

    function loadFromUpload(fileReader: ProgressEvent<FileReader>) {
        let stringified: string = fileReader.target.result.toString();
        emit("load:fromTosca", stringified, fileName);
    }

    let uploadElement = document.createElement("input");
    uploadElement.setAttribute("type", "file");
    uploadElement.setAttribute("accept", ".yaml");

    let fr = new FileReader();
    fr.onload = loadFromUpload;

    uploadElement.onchange = () => {
        // only one file should be selected
        fileName = uploadElement.files[0].name;
        fr.readAsText(uploadElement.files[0]);
    }
    uploadElement.click();

}

function fitAllElementsToEmbedded() {
    let elements = props.graph.getElements();

    for (const element of elements) {
        if (element.getEmbeddedCells().length === 0) {
            continue;
        }

        element.fitEmbeds({
            deep: true,
            padding: 10,
            expandOnly: true
            // padding: { //TODO useful values
            //top: 40,
            //bottom: 10,
            //left: 10,
            //right: 10
            // }
        });
    }
}

function toggleEntityExpansion(event) {
    let elements = props.graph.getElements();
    elements.forEach(element => {
        if (!element.attr("icon") || element.prop("entity/type") === EntityTypes.REQUEST_TRACE) {
            return;
        }

        element.prop("collapsed", (event.currentTarget.id.includes("collapse") ? true : false));
        let toggledVisibility = event.currentTarget.id.includes("collapse") ? "visible" : "hidden";
        // check if entity is currently hidden
        let iconVisibility = element.attr("root/visibility") === "hidden" ? "hidden" : toggledVisibility;
        element.attr("icon/visibility", iconVisibility, { isolate: true });

        // hide embedded items
        let embeddedCells = element.getEmbeddedCells({ deep: true });
        embeddedCells.forEach(embeddedElement => {
            const itemVisibility = event.currentTarget.id.includes("collapse") ? "hidden" : "visible";
            // check if entity is currently filtered by checkbox
            const entityTypeHidden = embeddedElement.prop("entityTypeHidden");
            const newItemVisibility = entityTypeHidden ? "hidden" : itemVisibility;
            embeddedElement.attr("root/visibility", newItemVisibility, { isolate: true });
            embeddedElement.prop("parentCollapsed", ("hidden".localeCompare(toggledVisibility) === 0 ? false : true));
        });
    });
}

function editApplicationSettings() {
    // load current values
    appSettings.value.paperWidth = props.paper.options.width as number;
    appSettings.value.paperHeight = props.paper.options.height as number;
    appSettings.value.paperGridSize = props.paper.options.gridSize;
    appSettings.value.paperGridThickness = props.paper["_gridSettings"][0].thickness;
    appSettings.value.routerType = (props.paper.options.defaultRouter as routers.Router).name;

    showAppSettings.value = true;
}

function updateAppSettings() {
    if (appSettings.value.paperWidth !== props.paper.options.width as number || appSettings.value.paperHeight !== props.paper.options.height as number) {
        props.paper.setDimensions(appSettings.value.paperWidth, appSettings.value.paperHeight);
    }

    if (appSettings.value.paperGridSize !== props.paper["_gridSettings"][0].thickness) {
        props.paper.setGridSize(appSettings.value.paperGridSize);
    }

    if (appSettings.value.paperGridThickness !== props.paper["_gridSettings"][0].thickness) {
        props.paper.drawGrid({ thickness: appSettings.value.paperGridThickness });
    }

    if (appSettings.value.routerType !== (props.paper.options.defaultRouter as routers.Router).name) {

        // unset all routers of links to ensure new default router is applied
        props.graph.getLinks().forEach(link => {
            link.unset("router");

        })

        switch (appSettings.value.routerType) {
            case "normal":
                props.paper.options.defaultRouter = {
                    name: "normal"
                }
                break;
            case "metro":
                props.paper.options.defaultRouter = {
                    name: "metro",
                    args: {
                        step: 10,
                        padding: 15,
                        maximumLoops: 5000,
                        maxAllowedDirectionChange: 100,
                    }
                }
                break;
            case "manhattan":
            default:
                props.paper.options.defaultRouter = {
                    name: "manhattan",
                    args: {
                        step: 10,
                        padding: 15,
                        maximumLoops: 5000,
                        maxAllowedDirectionChange: 100,
                    }
                }
                break;
        }
        // redraw
        let currentGraph = JSON.stringify(props.graph.toJSON());
        let currentName = props.systemName;
        props.paper.render();
        emit("load:fromJson", currentGraph, currentName);
    }
    showAppSettings.value = false;
}

function getFilterState(viewKey: string): boolean {
    return filterTools.value.find(filter => filter.viewKey === viewKey).filterState;
}

function onFilterSelection(viewKey: string) {

    let showView = filterTools.value.find(filter => filter.viewKey === viewKey).filterState;

    let newVisibilityValue = showView ? "visible" : "hidden";

    let filteredGraphCells: dia.Cell[] = [];

    switch (viewKey) {
        case "deploymentView":
            filteredGraphCells.push(...getAffectedDeploymentViewCells(props.graph, getFilterState("backingView"), getFilterState("dataView")));
            break;
        case "communicationView":
            filteredGraphCells.push(...getAffectedCommunicationViewCells(props.graph, getFilterState("backingView")))
            break;
        case "backingView":
            filteredGraphCells.push(...getAffectedBackingViewCells(props.graph, getFilterState("communicationView"), getFilterState("deploymentView"), getFilterState("dataView")));
            break;
        case "dataView":
            filteredGraphCells.push(...getAffectedDataViewCells(props.graph, getFilterState("deploymentView"), getFilterState("backingView")));
            break;
        default:
            break;
    }

    filteredGraphCells.forEach(cell => {
        toggleCellVisibility(cell, newVisibilityValue);
    });
}

function toggleCellVisibility(cell: dia.Cell, newVisibilityValue: string) {
    cell.prop("entityTypeHidden", newVisibilityValue === "hidden");

    // ensure icon appears when needed despite filtering
    if (cell.attr("icon")) {
        let entityCollapsed = cell.get("collapsed") === true ? "visible" : "hidden";
        let iconVisibility = newVisibilityValue === "visible" ? entityCollapsed : "hidden";
        cell.attr("icon/visibility", iconVisibility, { isolate: true });
    }

    // ensure child entities stay hidden when parent entity is collapsed 
    if (cell.prop("parentCollapsed")) {
        newVisibilityValue = "hidden";
    }

    cell.attr("root/visibility", newVisibilityValue, { isolate: true });
}

function entityVisibilityChanged(element, attrs, opt) {
    if (opt.propertyPath && opt.propertyPath.includes("visibility")) {
        let cellView = element.findView(props.paper);
        cellView.hideTools();
        highlighters.stroke.remove(cellView);
    }
}

</script>


<style lang="scss">
/* Configuring modeling app toolbar */

:root {
    --toolbar-line-colour: rgba(52, 58, 64, 0.5);
    --button-focus-colour: rgba(52, 58, 64, 0.5);
    --menu-background-colour: #343a40;
    --test: 5px solid var(--menu-background-colour);
}

.app-header {
    /* position: relative; */
    /* display: flex; */
    width: 100%;
    /* border-bottom: 2px solid var(--toolbar-line-colour); */
    /* TODO necessary to fill parent?: */
    /* display:table-row; */
}

.app-header-first-row {
    display: flex;
    width: 100%;
    box-shadow: inset 0 -2px 0 var(--toolbar-line-colour);
}

.app-header-second-row {
    display: flex;
    width: auto;
    position: relative;
}

.toolbar-container {
    width: 100%;
    /* box-shadow: inset 0 -2px 0 var(--toolbar-line-colour); */
}

/* Configuring System title items (toolbar left) */
.app-title {
    width: auto;
    max-width: 30%;
    min-width: 20%;
    box-sizing: border-box;
}

.app-toolbar {
    align-items: center;
    width: auto;
    display: flex;
}

/* Toolbar Button elements */
.app-toolbar-tools {
    display: flex;
    /* align-items: center;
    flex-shrink: 1000 */
}

.button-group {
    /* box-shadow: inset 0 -4px 0 darkgray;
    margin-bottom: 2px; */
    display: flex;
}

.button-group[data-group=first-row-config-button] {
    display: flex;
    float: right;
    margin-left: auto;
}

.group-divider {
    margin-left: 6px;
    margin-right: 4px;
    position: relative;
}

.group-divider:after {
    content: '';
    width: 2px;

    position: absolute;
    right: 0;
    top: 0;

    background-color: var(--toolbar-line-colour);
    top: 20%;
    height: 60%;
}

.toolbarDropdownButtonItem:hover,
.toolbarDropdownButton:hover,
.toolbarButton:hover {
    color: #fff;
    background-color: #343a40;
    /* border-color: #343a40; */
}

.toolbarDropdownButtonItem:focus,
.toolbarDropdownButton:focus,
.toolbarButton:focus,
.toolbarButton.focus {
    box-shadow: 0 0 0 0 !important;
}

/* Entity Checkboxes */
.entity-tools {
    display: flex;
    width: auto;
    width: 100%;
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 10px;
    /* padding-right: 10px; */
    position: relative;
}

.entity-overall-group {
    display: flex;
    position: relative;
    width: auto;
    width: 100%;
    /* multiple lines if not enough space */
    flex-wrap: wrap;
}

.entity-group {
    align-items: center;
}

.entityCheckBox:checked {
    /* accent-color: #720c01; */
    /* Colour of active menu item: */
    /* accent-color: #3db4f4; */
    /* accent-color: #00466b; */
    accent-color: #343a40;
}

.entityCheckBoxLabel {
    font-size: 10px;
    font-size: 0.9em;
    /* font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; */
}


.numberOfEntities {
    margin-left: 5px;
    background-color: #343a40;
    opacity: 0.4;
}

.numberOfEntities.addingEntity {
    opacity: 0.4;
    animation-name: addingEntity;
    animation-duration: 2s;
}

.numberOfEntities.removingEntity {
    opacity: 0.4;
    animation-name: removingEntity;
    animation-duration: 2s;
}

@keyframes addingEntity {
    0% {
        background-color: #343a40;
        opacity: 0.4;
    }

    25% {
        background-color: #06b83e;
        opacity: 1;
    }

    100% {
        background-color: #343a40;
        opacity: 0.4;
    }
}

@keyframes removingEntity {
    0% {
        background-color: #343a40;
        opacity: 0.4;
    }

    25% {
        background-color: #b8060c;
        opacity: 1;
    }

    100% {
        background-color: #343a40;
        opacity: 0.4;
    }
}


.second-row-tools[data-group=second-row-config-tools] {
    display: flex;
    float: right;
    margin-left: auto;
    align-self: center;
}

.group-divider[data-group=second-row-config-button] {
    margin-right: 4px;
    position: relative;
    align-self: auto;
}

.exitRequestTraceView {
    background-color: rgb(220, 20, 60);
}

.exitRequestTraceView:hover {
    background-color: rgb(139, 0, 0, 0.8);
    border-color: rgb(139, 0, 0, 0.8);
}
</style>