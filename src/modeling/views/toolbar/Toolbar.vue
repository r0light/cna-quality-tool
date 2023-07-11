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
                <div v-for="entityTool of entityTools">
                    <div class="entity-group form-check form-check-inline" :data-group="entityTool.entityType"
                        :title="entityTool.tooltipText" data-toggle="tooltip" data-placement="bottom">
                        <input :id="entityTool.entityInput" @input="onEntitySelection(entityTool.entityInput, $event)"
                            :data-entity-type="entityTool.entityType" class="entityCheckBox form-check-input"
                            type="checkbox" :value="entityTool.entityType" checked>
                        <label :id="entityTool.entityLabel" class="user-select-none entityCheckBoxLabel form-check-label"
                            :for="entityTool.entityInput">
                            {{ entityTool.labelText }}
                            <span class="numberOfEntities badge badge-primary badge-pill"
                                :class="{ addingEntity: entityTool.addingAnimation, removingEntity: entityTool.removingAnimation }"
                                :data-entity-type="entityTool.entityType">{{ entityTool.entityCounter }}</span>
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
</template>


<script lang="ts" setup>
import $, { data } from 'jquery';
import { ref, computed, onMounted, onUpdated, watch, reactive, Ref, ComputedRef } from "vue";
import { dia, util, highlighters } from "jointjs";
import { ApplicationSettingsDialogConfig } from "../../config/actionDialogConfig";
import EntityTypes from "../../config/entityTypes";
import ToolbarConfig from "../../config/toolbarConfiguration";
import ModalDialog from "../modalDialog";
import UIModalDialog from "../../representations/guiElements.dialog";
import { addSelectionToolToEntity } from "../tools/entitySelectionTools";
import ButtonGroup from './ButtonGroup.vue';
import { importFromServiceTemplate } from '@/core/tosca-adapter/ToscaAdapter';

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
    (e: "update:SystemName", newName: string): void;
    (e: "click:exitRequestTraceView"): void;
    (e: "click:printActivePaper"): void;
}>();

const currentSystemName = ref<string>(props.systemName);
const nameEditMode = ref<"none" | "editing">("none");
const showEntityBar = ref<boolean>(true);
const isFullScreen = ref<boolean>(false);

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

const entityTools = ref((() => {
    let toolEntries = [];
    for (const entityElement of ToolbarConfig.EntityConfig) {
        toolEntries.push({
            entityType: entityElement.entityType,
            entityInput: entityElement.entityType + "-checkBox",
            entityLabel: entityElement.entityType + "-checkBoxLabel",
            labelText: entityElement.labelText,
            tooltipText: entityElement.tooltipText,
            entityCounter: 0,
            addingAnimation: false,
            removingAnimation: false,
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

props.graph.on("add", (cell: dia.Cell) => updateEntityCounter(cell.attributes.entity.type, "add"));
props.graph.on("remove", (cell: dia.Cell) => updateEntityCounter(cell.attributes.entity.type, "remove"));
props.graph.on("change:entity", (element, entity, opt) => { entityTypeChanged(opt.previousType, entity.type) });
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
            convertToJson();
            break;
        case "convertModeledSystemEntityToTosca-dropdownItemButton":
            convertToTosca();
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
        emit("update:SystemName", currentSystemName.value);
    }
    nameEditMode.value = "none";
}

function onEntitySelection(buttonId: string, event) {
    toggleEntityVisibility(event);
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

    return this;
})


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
    const config = ToolbarConfig.ToolbarButtonActionConfig["clearActivePaper"];
    if (config) {
        let modalDialog = new UIModalDialog("extern-clear", "clearActivePaper");
        modalDialog.create(config);
        modalDialog.render("modals", true);
        modalDialog.configureSaveButtonAction(() => { props.graph.clear() });
        modalDialog.show();
    } else {
        props.graph.clear();
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

function convertToJson() {
    let jsonSerlializedGraph = props.graph.toJSON();
    // download created yaml taken from https://stackoverflow.com/a/22347908
    let downloadElement = document.createElement("a");
    downloadElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonSerlializedGraph)));
    downloadElement.setAttribute('download', `${currentSystemName.value}.json`);
    downloadElement.click();
}

function convertToTosca() {
    const config = ToolbarConfig.ToolbarButtonActionConfig["convertToTosca"];
    if (config) {
        let modalDialog = new UIModalDialog("tosca-export", "convertToTosca");
        modalDialog.create(config);
        modalDialog.render("modals", true);
        modalDialog.configureSaveButtonAction(() => { props.graph.trigger("startToscaTransformation"); });
        modalDialog.show();
    }
}

function loadFromJson() {

    function replaceWithUpload(fileReader: ProgressEvent<FileReader>) {
        let stringifiedJson: string = fileReader.target.result.toString();
        try {
            let jsonGraph: any = JSON.parse(stringifiedJson);
            props.graph.clear();
            props.graph.fromJSON(jsonGraph);
            let elements: dia.Cell[] = props.graph.getCells();
            for (let element of elements) {
                addSelectionToolToEntity(element, props.paper)
            }
            // call hideTools in Timeout, because it does not work when called directly...
            setTimeout(() => { props.paper.hideTools() }, 100);

            for (const [key, value] of Object.entries(EntityTypes)) {
                updateEntityCounter(value, "add");
            }
        } catch (e) {
            // TODO provide error message to user
            console.log(e)
        }
    }

    let fr = new FileReader();
    fr.onload = replaceWithUpload.bind(this);

    let uploadElement = document.createElement("input");
    uploadElement.setAttribute("type", "file");
    uploadElement.setAttribute("accept", ".json");
    uploadElement.onchange = () => {
        // only one file should be selected
        fr.readAsText(uploadElement.files[0]);
    }
    uploadElement.click();
}

function loadFromTosca() {

    let fileName = "";

    function loadFromUpload(fileReader: ProgressEvent<FileReader>) {
        let stringified: string = fileReader.target.result.toString();

        // TODO remove file ending from name

        let system = importFromServiceTemplate(fileName, stringified);


        // TODO convert to jointJs graph
        console.log(system);
    }

    let uploadElement = document.createElement("input");
    uploadElement.setAttribute("type", "file");
    uploadElement.setAttribute("accept", ".yaml");

    let fr = new FileReader();
    fr.onload = loadFromUpload.bind(this);

    uploadElement.onchange = () => {
        // only one file should be selected
        console.log(uploadElement);
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
    ApplicationSettingsDialogConfig.saveButton.action = () => {
        let newWidth = $("#" + ApplicationSettingsDialogConfig.content.Size.sectionContent.PaperWidth.providedFeature).val() as string;
        let newHeight = $("#" + ApplicationSettingsDialogConfig.content.Size.sectionContent.PaperHeight.providedFeature).val() as string;
        let newGridSize = $("#" + ApplicationSettingsDialogConfig.content.Grid.sectionContent.Size.providedFeature).val() as number;
        let newGridThickness = $("#" + ApplicationSettingsDialogConfig.content.Grid.sectionContent.Thickness.providedFeature).val() as number;
        props.paper.setDimensions(newWidth, newHeight);
        props.paper.setGridSize(newGridSize);
        props.paper.drawGrid({ thickness: newGridThickness });
    };
    // get current values
    ApplicationSettingsDialogConfig.content.Size.sectionContent.PaperWidth.min = props.paper.getFitToContentArea({ padding: util.normalizeSides(25) }).width;
    ApplicationSettingsDialogConfig.content.Size.sectionContent.PaperHeight.min = props.paper.getFitToContentArea({ padding: util.normalizeSides(25) }).height;
    ApplicationSettingsDialogConfig.content.Size.sectionContent.PaperWidth.defaultValue = props.paper.options.width as number;
    ApplicationSettingsDialogConfig.content.Size.sectionContent.PaperHeight.defaultValue = props.paper.options.height as number;
    ApplicationSettingsDialogConfig.content.Grid.sectionContent.Size.defaultValue = props.paper.options.gridSize;
    // TODO fix access
    ApplicationSettingsDialogConfig.content.Grid.sectionContent.Thickness.defaultValue = props.paper["_gridSettings"][0].thickness;
    // create dialog with information
    let applicationModalDialog = new ModalDialog();
    applicationModalDialog.renderActionDialog(ApplicationSettingsDialogConfig.title, ApplicationSettingsDialogConfig.content, ApplicationSettingsDialogConfig.cancelButton.text, ApplicationSettingsDialogConfig.saveButton);

    applicationModalDialog.show();
}

function entityTypeChanged(previousType, newType) {
    if (!previousType) {
        // entity properties not type changed
        return;
    }

    if (!(Object.values(EntityTypes).includes(previousType)) || !(Object.values(EntityTypes).includes(newType))) {
        console.error("Entity Type does not exist"); // TODO error?
        return;
    }

    updateEntityCounter(previousType, "remove");
    updateEntityCounter(newType, "add");
}

function toggleEntityVisibility(event) {
    let affectedEntityType = event.target.value;
    let clickedCheckbox = $('.entityCheckBox[data-entity-type="' + affectedEntityType + '"]');

    let graphCells = props.graph.getCells();
    let filteredGraphCells = graphCells.filter((graphCell) => {
        return graphCell.attributes.entity.type === affectedEntityType;
    });

    for (const relevantCell of filteredGraphCells) {
        let newVisibilityValue = clickedCheckbox.prop("checked") ? "visible" : "hidden";
        relevantCell.prop("entityTypeHidden", (clickedCheckbox.prop("checked") === false));

        // ensure icon appears when needed despite filtering
        if (relevantCell.attr("icon")) {
            let entityCollapsed = relevantCell.get("collapsed") === true ? "visible" : "hidden";
            let iconVisibility = clickedCheckbox.prop("checked") ? entityCollapsed : "hidden";
            relevantCell.attr("icon/visibility", iconVisibility, { isolate: true });
        }

        // ensure child entities stay hidden when parent entity is collapsed 
        if (relevantCell.prop("parentCollapsed")) {
            newVisibilityValue = "hidden";
        }

        relevantCell.attr("root/visibility", newVisibilityValue, { isolate: true });
    }
}

function entityVisibilityChanged(element, attrs, opt) {
    if (opt.propertyPath && opt.propertyPath.includes("visibility")) {
        let cellView = element.findView(props.paper);
        cellView.hideTools();
        highlighters.stroke.remove(cellView);
    }
}

function updateEntityCounter(dataEntityType: string, updateType: string) {

    let newValue = props.graph.getElements().filter(element => element.attributes.entity.type === dataEntityType).length

    let currentEntity = entityTools.value.find(element => element.entityType === dataEntityType)
    currentEntity.entityCounter = newValue;

    if (updateType === "add") {
        currentEntity.addingAnimation = true;
        setTimeout(() => currentEntity.addingAnimation = false, 2000);
    } else if (updateType === "remove") {
        currentEntity.removingAnimation = true;
        setTimeout(() => currentEntity.removingAnimation = false, 2000);
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
    /* distribute included elements evenly */
    justify-content: space-evenly;
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