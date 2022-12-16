import $ from 'jquery';
import { dia, mvc } from "jointjs";
import ModelingArea from './modelingArea';
import Toolbar from './toolbar.js';
import EntitySidebar from './entitySidebar';
import DetailsSidebar from './detailsSidebar';

import ToolbarConfig from "../config/toolbarConfiguration";
import SidebarEntityShapes from '../config/entitySidebarShape.config';
import { DetailsSidebarConfig } from '../config/detailsSidebarConfig';

/**
 * The module for the main view of the modeling application.
 * @module views/modelingAppMainView
 */

/**
 * Class rendering the content for the modeling application, including a toolbar, a template sidebar for the
 * entity representation, the main modeling area and a detailsbar for the currently selected entity.
 * 
 * @class
 * @extends mvc.View
 */
const ModelingAppMainView = mvc.View.extend({

    className: 'modelingAppMainView',

    mainPaper: null,

    options: {
        modelingAreaGraph: null,
        currentSystemName: ""
    },

    init() {

        this.initializeModelingArea(this.options.modelingAreaGraph);
        this.initializeToolbar(this.mainPaper);
        this.initializeEntitySidebar(this.mainPaper);
        this.initializeDetailsSidebar(this.mainPaper);
    },

    /**
     * Create and initialize the main Modeling Area View, which will include the interactive Paper view.
     * 
     * @param {joint.dia.Graph} modelingAreaGraph The Graph model that will include all information about the currently modeled system.
     */
    initializeModelingArea(modelingAreaGraph: dia.Graph) {

        let modelingArea = new ModelingArea({
            graph: modelingAreaGraph
        });
        modelingArea.render();
        this.mainPaper = modelingArea.getPaper();
    },

    /**
     * Create and initialize the Toolbar View, which provides additional tooling for the main modeling area.
     * 
     * @param {joint.dia.Paper} modelingAreaPaper The Paper view of the main modeling area for which the tools are provided.
     */
    initializeToolbar(modelingAreaPaper: dia.Paper) {

        const toolbar = new Toolbar(this.$(".app-header"), modelingAreaPaper, ToolbarConfig, this.options.currentSystemName);
        toolbar.render();
    },

    /**
     * Create and initialize the Entity Sidebar view, which includes the template shapes for the entities. 
     * 
     * @param {joint.dia.Paper} modelingAreaPaper The Paper view of the main modeling area to which the selected entity will be added.
     */
    initializeEntitySidebar(modelingAreaPaper) {
        if (!(modelingAreaPaper instanceof dia.Paper)) {
            throw new TypeError("ModelingAppMainView: The provided paper has to be a joint.dia.Paper element");
        }

        const entitySidebar = new EntitySidebar({
            paper: modelingAreaPaper,
            documentElement: this.$(".entityShapes-sidebar-container"),
            sidebarEntityConfig: SidebarEntityShapes
        });
        entitySidebar.render();
    },

    /**
     * Create and initialize the Details Sidebar view. 
     * Additionally, it defines when the sidebar should be generally displayed.
     * 
     * @param {joint.dia.Paper} modelingAreaPaper The Paper view of the main modeling area for which information will be shown in sidebar.
     */
    initializeDetailsSidebar(modelingAreaPaper) {
        if (!(modelingAreaPaper instanceof dia.Paper)) {
            throw new TypeError("ModelingAppMainView: The provided paper has to be a joint.dia.Paper element");
        }

        const detailsSidebar = new DetailsSidebar({
            el: this.$(".details-container"),
            paper: modelingAreaPaper,
            detailsSidebarConfig: DetailsSidebarConfig
        });
        detailsSidebar.render();

        this.listenTo(this.mainPaper, "cell:pointerdown", (cellView: dia.CellView) => {
            detailsSidebar.renderEntitySelectionProperties(cellView.model);
        });

        this.listenTo(this.mainPaper, "blank:pointerdown", () => {
            detailsSidebar.hideEntitySelectionProperties();
        });

        this.listenTo(this.mainPaper, "blank:contextmenu", () => {
            detailsSidebar.hideEntitySelectionProperties();
        });
    }
});

export default ModelingAppMainView;

