<template>
    <div class="entitySidebar">
        <div :id="`${wrapperElementId}-headline`" class="user-select-none entityShapes-headline sticky-top">
            <div class="entityShapes-icon">
                <i class="fa-solid fa-shapes"></i>
            </div>
            <div class="entityShapes-text">
                <span class="">Entity Shapes</span>
            </div>
        </div>
        <div class="entityShapes-container">
            <div :id="entityShapesPaperId" class="entityShapes-paper"></div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import $ from 'jquery';
import { ref, onMounted } from 'vue'
import { dia } from "jointjs";
import SidebarEntityShapes from '../config/entitySidebarShape.config';
import ConnectionSelectionTools from "./tools/connectionSelectionTools";
import { addSelectionToolToEntity } from "./tools/entitySelectionTools";
import { entityShapes } from '../config/entityShapes';

const props = defineProps<{
    paper: dia.Paper,
    pageId: string,
    wrapperElementId: string
}>()

const entityShapesPaperId = `entityShapesPaper-${props.pageId}`;

const entityShapeGraph: dia.Graph = new dia.Graph();

const entityHighlightColour = ref<string>("darkorange");
const entityTextHighlightColour = ref<string>("darkorange");

const dragging = ref<boolean>(false);

onMounted(() => {

    // TODO might be problematic when multiple pages exist
    let sidebarContainerElement = $(`#${props.wrapperElementId}`).first();

    const sidebarWidth = sidebarContainerElement && sidebarContainerElement.innerWidth() && sidebarContainerElement.innerWidth() > 0 ? sidebarContainerElement.innerWidth() : 245;
    const sidebarHeight = sidebarContainerElement && sidebarContainerElement.innerHeight() && sidebarContainerElement.innerHeight() > 0  ? sidebarContainerElement.innerHeight() : 600;
    // this.options.entityRepresentations = this.options.sidebarEntityConfig ? this.options.sidebarEntityConfig : {};
    entityHighlightColour.value = getComputedStyle(document.documentElement).getPropertyValue('--entitySidebar-highlighting-colour') ?? "darkorange";
    entityTextHighlightColour.value = getComputedStyle(document.documentElement).getPropertyValue('--entitySidebar-textHighlighting-colour') ?? "darkorange";

    //this.entityRepresentations = this.options.entityRepresentations;

    //TODO is this needed?
    //this.delegateEvents();

    let paperHeight = sidebarHeight - ($(`#${props.wrapperElementId}-headline`).first().outerHeight());

    // get colour from container element but change opacity value (otherwise the colour will appear darker than intended)
    let parentBackgroundColorElements = $(`#${props.wrapperElementId}`).first().css("backgroundColor").split(",");
    let adaptedBackgroundColor = parentBackgroundColorElements[0].concat(",", parentBackgroundColorElements[1]).concat(",", parentBackgroundColorElements[2]).concat(", ", "0)");
    //this._entityShapeGraph = new dia.Graph();
    let entityShapePaper = new dia.Paper({
        el: $(`#${entityShapesPaperId}`),
        width: Math.floor(sidebarWidth) >= 244 ? Math.floor(sidebarWidth) : 244,
        height: Math.floor(paperHeight) >= 547 ? Math.floor(paperHeight) : 547,
        gridSize: 10,
        drawGrid: false,
        model: entityShapeGraph,
        embeddingMode: false,
        background: {
            color: adaptedBackgroundColor
        },
        interactive: false,
        cellViewNamespace: entityShapes
    });

    entityShapePaper.render();

    entityShapePaper.on("cell:mouseenter", highlightEntity);
    entityShapePaper.on("cell:mouseleave", unhighlightEntity);

    entityShapePaper.on("element:pointerclick", addEntity);
    entityShapePaper.on("requestTrace:icon:pointerclick", addEntity)
    entityShapePaper.on("link:pointerclick", addLink)
    entityShapePaper.on("cell:pointermove", (evt, x, y) => { dragging.value = true });

    Object.keys(SidebarEntityShapes).forEach((key) => {
        entityShapeGraph.addCell(SidebarEntityShapes[key].shape);
    });

    // this._entityShapePaper.on("cell:pointermove", (evt, x, y) => { this._dragging = true; })
    // this._entityShapePaper.on("cell:pointerup", (cellView, evt, x, y) => { this.onDragEntity(cellView, evt, x, y) })

});



// TODO endpoints
function addEntity(eventElement) {

    let cell: dia.Element = entityShapeGraph.getCell(eventElement.model.id) as dia.Element;
    let newElement = cell.clone();
    
    newElement.attr("label/fontSize", cell.prop("defaults/fontSize"));
    newElement.removeAttr("root/title");
    newElement.position(30, 20);

    let addedCell = props.paper.model.addCell(newElement).getCell(newElement.id) as dia.Element;

    addSelectionToolToEntity(addedCell, props.paper);

    props.paper.requireView(addedCell);
    addedCell.resize(cell.prop("defaults/size/width"), cell.prop("defaults/size/height"));
}

function addLink(eventElement) {
    let cell: dia.Link = entityShapeGraph.getCell(eventElement.model.id) as dia.Link;
    let newElement = cell.clone();
    newElement.attr("wrapper/cursor", "pointer");
    newElement.attr("wrapper/class", "modelingArea-Connection");
    newElement.attr("line/stroke", "black");
    newElement.removeAttr("root/title");
    newElement.removeLabel(-1);
    newElement.prop("source", { x: 30, y: 30 });
    newElement.prop("target", { x: 130, y: 30 });
    props.paper.model.addCell(newElement);

    // test
    let toolsView = new ConnectionSelectionTools(true);
    var linkView = newElement.findView(props.paper);
    linkView.addTools(toolsView);
}


function onDragEntity(cellView, event, x, y) {
    //console.log(event);

    if (!this._dragging) {
        return;
    }
    // console.log(this.#entityShapePaper);


    // copy dragged entity
    let cell = entityShapeGraph.getCell(cellView.model.id);
    let newElement = cell.clone();

    // transform x coordinate of sidebar paper to modeling area paper
    let transformedXCoordinate = props.paper.localToPaperPoint(props.paper.pageToLocalPoint(x));
    let transformedXEndCoordiante = transformedXCoordinate.x - (newElement.getBBox().width / 2);

    let titleContainerHeight = $(`#${props.wrapperElementId}-headline`).first().outerHeight();
    let correctedY = y + Math.floor(titleContainerHeight);
    let transformedYCoordinate = props.paper.localToPaperPoint(correctedY);
    let offsetToConsider = Math.abs(props.paper.pageOffset().y < 0 ? props.paper.pageOffset().y : 0);
    let transformedYEndCoordiante = transformedYCoordinate.x + offsetToConsider - (newElement.getBBox().height / 2);

    // console.log(titleContainerHeight);
    // console.log(transformedYEndCoordiante);
    // console.log(event.clientY);

    //newElement.position(transformedXEndCoordiante, transformedYEndCoordiante); // TODO fix y-value --> not fully correct when scrolling

    // TODO check if valid area, check if drag cancelled
    // console.log("pageOffset");
    // console.log(this._entityShapeGraph.pageOffset());
    // console.log(this.options.paper.pageOffset());

    // TODO scale

    props.paper.model.addCells([newElement]);
    dragging.value = false;
    addSelectionToolToEntity(newElement, props.paper);


}


function highlightEntity(cellView) {
    if (cellView.model.isLink()) {
        cellView.model.attr("line/stroke", entityHighlightColour.value);
        cellView.model.attr("text/fill", entityHighlightColour.value);
        // cellView.model.attr("text/fill", this.options.entityTextHighlightColour);
        return;
    }

    cellView.$el.addClass("highlightEntity");
}

function unhighlightEntity(cellView) {
    if (cellView.model.isLink()) {
        cellView.model.attr("line/stroke", "black");
        cellView.model.attr("text/fill", "black");
        return;
    }
    cellView.$el.removeClass("highlightEntity");
}
</script>

<style>
:root {
    /* blue version */
    --svg-icon-hover-filter: invert(33%) sepia(68%) saturate(1476%) hue-rotate(206deg) brightness(96%) contrast(88%);
    /* orange version like sidebar highlighting */
    /* --svg-icon-highlight-filter: invert(48%) sepia(78%) saturate(785%) hue-rotate(1deg) brightness(105%) contrast(103%); */
    /* if darkorange */
    /* dodgerblue version like sidebar highlighting */
    --svg-icon-highlight-filter: invert(43%) sepia(38%) saturate(3310%) hue-rotate(195deg) brightness(102%) contrast(107%);
    --entitySidebar-highlighting-colour: dodgerblue;
    --entitySidebar-textHighlighting-colour: steelblue;
}

.entitySidebar {
    position: absolute;
    width: auto;
    height: auto;
}

.entityShapes-container {
    /* Fix me: with the following line small space disappears but always overflow.. */
    /* display:inline-block; */
}

.entityShapes-headline {
    display: flex;
    padding-top: 10px;
    padding-bottom: 10px;
    box-sizing: content-box;
    border-bottom: 3px solid var(--toolbar-line-colour);
    justify-content: center;
    column-gap: 10px;
    align-items: center;
    /* background-color: var(--toolbar-line-colour); */
    background-color: #70828D;
    color: white;
}

.expandEntityIcon {
    cursor: pointer;
}

.expandEntityIcon:hover {
    /* filter: invert(11%) sepia(79%) saturate(4175%) hue-rotate(356deg) brightness(88%) contrast(117%);
    -webkit-filter: invert(11%) sepia(79%) saturate(4175%) hue-rotate(356deg) brightness(88%) contrast(117%); */
    /* filter: invert(62%) sepia(43%) saturate(6433%) hue-rotate(21deg) brightness(96%) contrast(91%);
    -webkit-filter: invert(62%) sepia(43%) saturate(6433%) hue-rotate(21deg) brightness(96%) contrast(91%); */
    filter: var(--svg-icon-hover-filter);
    -webkit-filter: var(--svg-icon-hover-filter);
}

/* TODO: keep? */
/* .entityShape:hover~.expandEntityIcon,
.entityLabel:hover~.expandEntityIcon {
    filter: var(--svg-icon-hover-filter);
    -webkit-filter: var(--svg-icon-hover-filter);
} */

/* .entityHighlighting:hover,
.entityHighlighting:active { */
/* fill: darkgoldenrod; */
/* stroke: darkorange; */
/* stroke: dodgerblue; */
/* stroke: firebrick; */
/* stroke: gold; */
/* stroke: seagreen; */
/* stroke: red;  */
/* } */

.highlightEntity>* {
    /* stroke: darkorange; */
    stroke: var(--entitySidebar-highlighting-colour);
    /* stroke: steelblue; */
}

.highlightEntity text {
    /* fill: darkorange; */
    /* fill: dodgerblue; */
    fill: var(--entitySidebar-textHighlighting-colour);
    stroke-width: 0.5px;
}

.highlightEntity image,
.highlightEntity image:hover {
    filter: var(--svg-icon-highlight-filter);
    -webkit-filter: var(--svg-icon-highlight-filter);
}

.sidebarConnection {
    cursor: "move"
}

.modelingArea-Connection {
    cursor: "pointer"
}
</style>