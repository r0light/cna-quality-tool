import $ from 'jquery';
import * as Backbone from 'backbone';
import { dia, mvc, util, highlighters } from "jointjs";
import { ApplicationSettingsDialogConfig } from "../config/actionDialogConfig";
import EntityTypes from "../config/entityTypes";
import ToolbarConfig from "../config/toolbarConfiguration";
import ModalDialog from "./modalDialog";
import UIModalDialog from "../representations/guiElements.dialog";
import ToolbarTools from "../representations/guiElements.toolbarTools";


class Toolbar extends mvc.View<Backbone.Model, Element> {

    "use strict";

    currentSystemName: string = ""; // TODO keep here?

    paper: dia.Paper;

    graph: dia.Graph;

    appTools: typeof ToolbarConfig.Tools;

    entityTools: typeof ToolbarConfig.EntityConfig;

    additionalRowTools: typeof ToolbarConfig.ToolbarRowConfig;

    #toolbarButtonActionConfig: typeof ToolbarConfig.ToolbarButtonActionConfig;

    #applicationModalDialog: ModalDialog; 

    constructor(documentElement: HTMLElement, currentPaper: dia.Paper, toolbarConfig: typeof ToolbarConfig, currentSystemName: string) { // TODO get current applicationName

        super({
            className: "toolbar",
            el: documentElement,
            /*
            paper: currentPaper,
            graph: currentPaper.model,
            appTools: toolbarConfig && toolbarConfig.Tools ? toolbarConfig.Tools : [],
            entityTools: toolbarConfig && toolbarConfig.EntityConfig ? toolbarConfig.EntityConfig : [],
            additionalRowToolsConfig: toolbarConfig && toolbarConfig.ToolbarRowConfig ? toolbarConfig.ToolbarRowConfig : [],
            toolbarButtonActionConfig: toolbarConfig && toolbarConfig.ToolbarButtonActionConfig ? toolbarConfig.ToolbarButtonActionConfig : {},
            currentSystemName: currentSystemName,
            */

            events: {
                "initialSystemName #appNameTitle": "setInitialSystemName",

                // Tool buttons
                "click #fullScreen-button": "toggleFullScreen",
                "click #closefullScreen-button": "toggleFullScreen",
                "click #fitActivePaperToContent-button": "fitActivePaperToContent",
                // TODO if lock mechanism is included
                // "click #lockPaperInteractivity-button": "togglePaperInteractivity",
                // "click #unlockPaperInteractivity-button": "togglePaperInteractivity",

                "click #clearActivePaper-button": "clearActivePaper",
                "click #printActivePaper-button": "printActivePaper",

                "click #zoomOutPaper-button": "zoomOutPaper",
                "click #zoomInPaper-button": "zoomInPaper",

                "click #expandAll-button": "toggleEntityExpansion",
                "click #collapseAll-button": "toggleEntityExpansion",

                "click #applicationSettings-button": "editApplicationSettings",

                "click #showEntityToolbarRow-button": "toggleEntityOptionsBar",
                "click #hideEntityToolbarRow-button": "toggleEntityOptionsBar",

                // Collapsible elements
                "click #convertModeledSystemEntityToJson-dropdownItemButton": "convertToJson",
                "click #convertModeledSystemEntityToTosca-dropdownItemButton": "convertToTosca",
                "click #changeGrid-button": "changeGrid",

                'click input[type="checkbox"]': "toggleEntityVisibility",

                "mouseup": 'removeFocusFromSelection',

                // Test section --> TODO 
                "click #fitAllElementsToEmbedded-button": "fitAllElementsToEmbedded"
            }

        });

        this.paper = currentPaper;
        this.graph = currentPaper.model;
        this.appTools = toolbarConfig.Tools;
        this.entityTools = toolbarConfig.EntityConfig;
        this.additionalRowTools = toolbarConfig.ToolbarRowConfig;
        this.#toolbarButtonActionConfig = toolbarConfig.ToolbarButtonActionConfig;
        this.currentSystemName = currentSystemName;

        this.delegateEvents();

        this.listenTo(this.graph, "add", this.entityAdded);
        this.listenTo(this.graph, "remove", this.entityRemoved);
        this.listenTo(this.graph, "change:entity", (element, entity, opt) => { this.entityTypeChanged(opt.previousType, entity.type) });
        this.listenTo(this.graph, "change:attrs", this.entityVisibilityChanged);

        this.#applicationModalDialog = new ModalDialog();
    }

    init() {

    }

    onRender() {

    }

    confirmUpdate(flag: number, opt: { [key: string]: any; }) {
        return 0;
    }

    onSetTheme(oldTheme, newTheme) {

    }

    onRemove() {

    }

    render() {
        const toolbarTools = new ToolbarTools();
        toolbarTools.addSystemTitle();

        for (const buttonGroup of this.appTools) {
            toolbarTools.addButtonGroup(buttonGroup);
        }

        for (const entityElement of this.entityTools) {
            toolbarTools.addEntityCheckboxTool(entityElement.entityType, entityElement.labelText, entityElement.tooltipText);
        }

        for (const additionalRowTool of this.additionalRowTools) {
            switch (additionalRowTool.rowIndex) {
                case 1:
                    toolbarTools.addAdditionalFirstRowConfigTool(additionalRowTool.tools);
                    break;
                case 2:
                    toolbarTools.addAdditionalSecondRowConfigTool(additionalRowTool.tools);
                    break;
                default:
                    toolbarTools.addAdditionalFirstRowConfigTool(additionalRowTool.tools);
                    break;
            }
        }

        const appToolbar = toolbarTools.getCreatedToolbarTemplate();
        $("#appToolbarContainer").append(appToolbar);

        this.#configureGeneralToolbarBehaviour();

        $(".buttonInitialHide").hide();
        // remove focus from checkbox element after it has been clicked
        $(".app-header-second-row").on("click", () => { $(':focus').blur(); });
        return this;
    }

    toggleFullScreen() {
        // decide what should be toggled --> Fix design and scrolling
        // joint.util.toggleFullScreen(document.getElementById("app"));
        util.toggleFullScreen();
        let openFullScreenButtonId = "fullScreen-button";
        let closeFullScreenButtonId = "closefullScreen-button";
        $("#" + openFullScreenButtonId).toggle();
        $("#" + closeFullScreenButtonId).toggle();
        // let 
    }

    fitActivePaperToContent() {
        this.paper.fitToContent({
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

    clearActivePaper() {
        const config = this.#toolbarButtonActionConfig["clearActivePaper"];
        if (config) {
            let modalDialog = new UIModalDialog("extern-clear", "clearActivePaper");
            modalDialog.create(config);
            modalDialog.render("modals", true);
            modalDialog.configureSaveButtonAction(() => { this.graph.clear() });
            modalDialog.show();
        } else {
            this.graph.clear();
        }
    }

    changeGrid() {
        // TODO for options
        this.paper.clearGrid();
    }

    printActivePaper() {
        // TODO Fixme that only paper is printed
        window.print();
    }

    zoomInPaper() {
        const dimensionsBeforeZoom = this.paper.getComputedSize();
        let currentScale = this.paper.scale();
        if (currentScale.sx >= 1) {
            this.paper.scale(currentScale.sx + 0.5);
        } else {
            this.paper.scale(currentScale.sx * 2);
        }
        this.paper.fitToContent({
            padding: 50,
            minWidth: dimensionsBeforeZoom.width,
            minHeight: dimensionsBeforeZoom.height
        });
    }

    zoomOutPaper() {
        const dimensionsBeforeZoom = this.paper.getComputedSize();
        let currentScale = this.paper.scale();
        if (Math.round(currentScale.sx) <= 1) {
            this.paper.scale(currentScale.sx * 0.5);
        } else {
            this.paper.scale(currentScale.sx - 0.5);
        }
        this.paper.fitToContent({
            padding: 50,
            minWidth: dimensionsBeforeZoom.width,
            minHeight: dimensionsBeforeZoom.height
        });
    }

    convertToJson() {
        let jsonSerlializedGraph = this.graph.toJSON();
        // download created yaml taken from https://stackoverflow.com/a/22347908
        let downloadElement = document.createElement("a");
        downloadElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonSerlializedGraph)));
        downloadElement.setAttribute('download', `${this.currentSystemName}.json`);
        downloadElement.click();
    }

    convertToTosca() {
        const config = this.#toolbarButtonActionConfig["convertToTosca"];
        if (config) {
            let modalDialog = new UIModalDialog("tosca-export", "convertToTosca");
            modalDialog.create(config);
            modalDialog.render("modals", true);
            modalDialog.configureSaveButtonAction(() => { this.graph.trigger("startToscaTransformation"); });
            modalDialog.show();
        }
    }

    removeFocusFromSelection(event) {

        if (event.button === 2) {
            // ignore right click
            return;
        }

        if (event.target.id === "appNameTitle") {
            // keep focus if text box input field is focused
            return;
        }

        $('[data-toggle="tooltip"]').tooltip("hide");
        $('[data-tooltip-toggle="tooltip"]').tooltip("hide");
        (document.activeElement as HTMLElement).blur();
    }

    fitAllElementsToEmbedded() {
        let elements = this.graph.getElements();

        for (const element of elements) {
            if (element.getEmbeddedCells().length === 0) {
                continue;
            }

            element.fitEmbeds({
                deep: true,
                padding: 10
                // padding: { //TODO useful values
                // top: 40,
                // bottom: 10,
                // left: 10,
                // right: 10
                // }
            });
        }
    }

    toggleEntityExpansion(event) {
        let elements = this.graph.getElements();
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

    toggleEntityOptionsBar() {
        $("#showEntityToolbarRow-button").toggle();
        $("#hideEntityToolbarRow-button").toggle();
        $("#additionalToolbar-groupDivider").toggle();
        $(".app-header-second-row").toggle();
    }

    editApplicationSettings() {
        ApplicationSettingsDialogConfig.saveButton.action = () => {
            let newWidth = $("#" + ApplicationSettingsDialogConfig.content.Size.sectionContent.PaperWidth.providedFeature).val() as string;
            let newHeight = $("#" + ApplicationSettingsDialogConfig.content.Size.sectionContent.PaperHeight.providedFeature).val() as string;
            let newGridSize = $("#" + ApplicationSettingsDialogConfig.content.Grid.sectionContent.Size.providedFeature).val() as number;
            let newGridThickness = $("#" + ApplicationSettingsDialogConfig.content.Grid.sectionContent.Thickness.providedFeature).val() as number;
            this.paper.setDimensions(newWidth, newHeight);
            this.paper.setGridSize(newGridSize);
            this.paper.drawGrid({ thickness: newGridThickness });
        };
        // get current values
        ApplicationSettingsDialogConfig.content.Size.sectionContent.PaperWidth.min = this.paper.getFitToContentArea({ padding: util.normalizeSides(25) }).width;
        ApplicationSettingsDialogConfig.content.Size.sectionContent.PaperHeight.min = this.paper.getFitToContentArea({ padding: util.normalizeSides(25) }).height;
        ApplicationSettingsDialogConfig.content.Size.sectionContent.PaperWidth.defaultValue = this.paper.options.width as number;
        ApplicationSettingsDialogConfig.content.Size.sectionContent.PaperHeight.defaultValue = this.paper.options.height as number;
        ApplicationSettingsDialogConfig.content.Grid.sectionContent.Size.defaultValue = this.paper.options.gridSize;
        // TODO fix access
        ApplicationSettingsDialogConfig.content.Grid.sectionContent.Thickness.defaultValue = this.paper["_gridSettings"][0].thickness;
        // create dialog with information
        this.#applicationModalDialog.renderActionDialog(ApplicationSettingsDialogConfig.title, ApplicationSettingsDialogConfig.content, ApplicationSettingsDialogConfig.cancelButton.text, ApplicationSettingsDialogConfig.saveButton);

        this.#applicationModalDialog.show();
    }

    entityAdded(cell) {
        if (!(cell.attributes.entity) || !(Object.values(EntityTypes).includes(cell.attributes.entity.type))) {
            console.error("Entity Type does not exist"); // TODO error?
            return;
        }

        this.#updateEntityCounter(cell.attributes.entity.type, "add");
    }

    entityRemoved(cell) {
        if (!(cell.attributes.entity) || !(Object.values(EntityTypes).includes(cell.attributes.entity.type))) {
            console.error("Entity Type does not exist"); // TODO error?
            return;
        }

        this.#updateEntityCounter(cell.attributes.entity.type, "remove");
    }

    entityTypeChanged(previousType, newType) {
        if (!previousType) {
            // entity properties not type changed
            return;
        }

        if (!(Object.values(EntityTypes).includes(previousType)) || !(Object.values(EntityTypes).includes(newType))) {
            console.error("Entity Type does not exist"); // TODO error?
            return;
        }

        this.#updateEntityCounter(previousType, "remove");
        this.#updateEntityCounter(newType, "add");
    }

    updateEntityEventListener(event) {
        const currentBadge = event.target.getAttribute("data-entity-type");
        $('.addingEntity[data-entity-type="' + currentBadge + '"]').removeClass("addingEntity");
        $('.removingEntity[data-entity-type="' + currentBadge + '"]').removeClass("removingEntity");
    }

    toggleEntityVisibility(event) {
        let affectedEntityType = event.target.value;
        let clickedCheckbox = $('.entityCheckBox[data-entity-type="' + affectedEntityType + '"]');

        let graphCells = this.graph.getCells();
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

    entityVisibilityChanged(element, attrs, opt) {
        if (opt.propertyPath && opt.propertyPath.includes("visibility")) {
            let cellView = element.findView(this.paper);
            cellView.hideTools();
            highlighters.stroke.remove(cellView);
        }
    }

    #updateEntityCounter(dataEntityType, updateType) {
        let counterElement = $('.numberOfEntities[data-entity-type="' + dataEntityType + '"]');
        let oldValue = counterElement.text();

        if (updateType === "add") {
            counterElement.addClass("addingEntity")
            counterElement.text(parseInt(oldValue) + 1);
        } else if (updateType === "remove") {
            counterElement.addClass("removingEntity")
            const newValue = (parseInt(oldValue) - 1) >= 0 ? (parseInt(oldValue) - 1) : 0;
            counterElement.text(newValue);
        }
    }

    #configureGeneralToolbarBehaviour() {
        $(".numberOfEntities[data-entity-type]").on("animationend", this.updateEntityEventListener);

        $("#editApplicationNameBtn").on("click", () => {
            this.#toggleApplicationNameEditingMode();
        });

        $("#cancelEditApplicationNameBtn").on("click", () => {
            $("#appNameTitle").val(this.currentSystemName);
            this.#toggleApplicationNameEditingMode();
        });

        $("#submitEditApplicationNameBtn").on("click", () => {
            let editedAppName = $("#appNameTitle").val() as string;
            if (!editedAppName) {
                $("#appNameTitle").val(this.currentSystemName);
            } else {
                $("#appNameTitle").val(editedAppName);
                this.currentSystemName = editedAppName;

                // 
                $("#appNameTitle").trigger($.Event("systemNameChanged", 
                    {
                      updatedSystemName: editedAppName
                    }
                ));

                this.graph.trigger("systemNameChanged", { editedAppName: editedAppName });
            }

            this.#toggleApplicationNameEditingMode();
        });

        // // TODO keep?
        $("#addNewSystemEntity").on("click", () => {
            alert("Maybe TODO");
        });

        // ensure tooltip is hidden when dropdown is opened
        $(".buttonDropDownGroup").on('show.bs.dropdown', function () {
            $('.toolbarDropdownButton[data-tooltip-toggle="tooltip"]').tooltip("hide");
        })

        $(".buttonDropDownGroup").on('shown.bs.dropdown', function () {
            $('.toolbarDropdownButton[data-tooltip-toggle="tooltip"]').tooltip("hide");
        })
    }

    #toggleApplicationNameEditingMode() {
        let systemTitleInputField = $("#appNameTitle");
        if (systemTitleInputField.attr("disabled")) {
            systemTitleInputField.attr("disabled", null); // disabled false
        } else {
            systemTitleInputField.attr("disabled", ""); // disabled true
        }

        $("#editApplicationNameBtn").toggle();
        $("#cancelEditApplicationNameBtn").toggle();
        $("#submitEditApplicationNameBtn").toggle();
    }

    setInitialSystemName(event) {
        this.currentSystemName = event.systemName;
    }
}

export default Toolbar;