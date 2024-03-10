<template>
    <Teleport :disabled="!printing" to="body">
        <div id="print-section" class="system-container printable" data-cursor=grab>
            <div class="system-container-modeling-area">
                <div class="paperArea">
                    <div :id="pageId"></div>
                </div>
            </div>
        </div>
    </Teleport>
    <ModalConfirmationDialog v-bind="confirmationModalManager"></ModalConfirmationDialog>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { partial } from 'lodash';
import { onMounted, ref } from 'vue';
import { g, dia, routers, shapes, highlighters } from "jointjs";
import { ModelingValidator } from '../modelingValidator';
import ConnectionSelectionTools from "./tools/connectionSelectionTools";
import EntityTypes from "../config/entityTypes";
import { DeploymentMapping, Link, entityShapes } from "../config/entityShapes";
import { DialogSize } from '../config/actionDialogConfig';
import ModalConfirmationDialog, { ConfirmationModalProps, getDefaultConfirmationDialogData } from './components/ModalConfirmationDialog.vue';
import { ensureCorrectRendering } from '../renderingUtilities';


const props = defineProps<{
    pageId: string,
    graph: dia.Graph,
    paper: dia.Paper,
    currentElementSelection: dia.CellView | null,
    currentRequestTraceSelection: dia.Element | null
    printing: boolean,
}>()

const emit = defineEmits<{
    (e: "update:paper", paper: dia.Paper): void;
    (e: "select:Element", element: dia.ElementView | dia.LinkView): void;
    (e: "select:RequestTrace", requestTrace: dia.Element): void;
    (e: "deselect:Element"): void;
    (e: "deselect:RequestTrace"): void;
}>()

const confirmationModalManager = ref<ConfirmationModalProps>(getDefaultConfirmationDialogData());

onMounted(() => {

    var modelingValidator = new ModelingValidator(props.graph);
    var paper = new dia.Paper({
        el: $(`#${props.pageId}`),
        width: 3000,
        height: 3000,
        gridSize: 10,
        drawGrid: true,
        model: props.graph as dia.Graph,
        embeddingMode: true,
        background: {
            color: "rgba(192, 192, 192, 0.3)"
        },
        async: true,
        sorting: dia.Paper.sorting.APPROX,

        cellViewNamespace: entityShapes,
        routerNamespace: routers,

        // defaults:
        defaultLink: (cellView, magnet) => modelingValidator.defaultLink(cellView, magnet),
        defaultRouter: {
            name: "manhattan",
            args: {
                step: 10,
                padding: 15,
                maximumLoops: 5000,
                maxAllowedDirectionChange: 100,
            }
        },
        defaultConnector: {
            name: "jumpover",
            args: {
                radius: 4
            }
        },
        defaultConnectionPoint: {
            name: "boundary",
            args: {
                sticky: true,
                stroke: true
            }
        },

        linkView: dia.LinkView.extend({
            pointerdblclick: function (evt, x, y) {
                this.addVertex(x, y);
            }
        }),

        // validation methods
        validateConnection: (cellViewS, magnetS, cellViewT, magnetT, end, linkView) => modelingValidator.validateLinks(cellViewS, magnetS, cellViewT, magnetT, end, linkView),
        validateEmbedding: (chieldView, parentView) => modelingValidator.validateEmbedding(chieldView, parentView),
        validateUnembedding: (chieldView) => modelingValidator.validateUnembedding(chieldView),
        allowLink: (linkView, paper) => modelingValidator.checkCreatedLink(linkView, paper),

        interactive: { labelMove: false, addLinkFromMagnet: true, linkMove: true, vertexAdd: false },
        // Restricts modeling area to defined paper width and height with a small padding because of tools
        restrictTranslate: true,
        // TODO fix Data Aggregate entity + FIX me for zoom
        // restrictTranslate: (elementView, x0, y0) => {
        //     let restrictedWidth = elementView.paper.options.width - 20 - 25;
        //     let restrictedHeight = elementView.paper.options.height - 20 - 15;
        //     console.log(restrictedWidth)
        //     console.log(elementView.paper.options.height)
        //     console.log(elementView.paper.getComputedSize())
        //     return { x: 20, y: 20, width: restrictedWidth, height: restrictedHeight };
        // },

        // Allows highlighting the entities to which validate connections can be made
        markAvailable: true,
        // prevent multiple links between same target and source
        multiLinks: false
    })

    paper.on({
        'element:pointerdown': function (cellView: dia.ElementView, evt, x, y) {
            this.hideTools();
            removeHighlightingFromAllLinks();
            setCurrentSelection(cellView);
            cellView.showTools();
            props.graph.getConnectedLinks(cellView.model).forEach(link => {
                if (link.attr("root/visibility") === "visible") {
                    highlighters.stroke.add(props.paper.requireView(link), { selector: 'line' }, 'my-element-highlight', {
                        layer: 'back',
                        attrs: {
                            'stroke': '#feb663',
                            'stroke-width': 5,
                        }
                    });
                }
            })
        },
        'blank:pointerdown': function (evt, x, y) {
            this.hideTools();
            //setSelectionHandle(undefined);
            resetCurrentSelection();
            removeHighlightingFromAllLinks();
        },
        'element:contextmenu': function (cellView, evt, x, y) {
            cellView.showTools();
        },
        "link:pointerclick": function (linkView: dia.LinkView, evt) {

            removeHighlightingFromAllLinks();

            setCurrentSelection(linkView);
            linkView.highlight();

            if (!linkView.hasTools()) {
                let toolsView = new ConnectionSelectionTools();
                linkView.addTools(toolsView);
            }
            linkView.showTools();
            return;
        },
        "cell:highlight": function (cellView, node, options) {

            //TODO is this really necessary?
            if (cellView.model.isLink()) {
                this.hideTools();
                this.model.getLinks().forEach(function (link) {
                    if (!(link === cellView.model)) {
                        highlighters.stroke.remove(link.findView(cellView.paper));
                        return;
                    }
                });
            }

        },
        "link:connect": (linkView, evt, elementViewConnected, magnet, arrowhead) => configureLink(linkView, evt, elementViewConnected, magnet, arrowhead),

        "element:icon:pointerclick": (elementView, evt) => onEntityCollapsed(evt, elementView),
        "requestTrace:icon:pointerclick": (elementView, evt, x, y) => onShowRequestTraceIncludedEntities(elementView, evt)
        // "cell:pointerdbclick": function (elementView, evt, x, y) {
        //     console.log("Double click"); // doesn't work at the moment
        // },
        // "blank:mousewheel": function (event, x, y, delta) {
        //     console.log("mousewheel");
        //     if (event.shiftKey) {
        //         console.log("Todo zoom") // TODO zoom?
        //         event.stopPropagation();
        //     }
        // },
        // "blank:pointermove": function (event, x, y) {
        //     console.log("move");
        //     console.log(event.data)
        //     console.log(x)
        //     console.log(y)
        // }
    });


    // bind `graph` to the `adjustVertices` function
    var adjustGraphVertices = partial(adjustVertices, props.graph);
    // adjust vertices when a cell is removed or its source/target was changed
    props.graph.on('add remove change:source change:target', adjustGraphVertices);
    // adjust vertices when the user stops interacting with an element
    paper.on('cell:pointerup', adjustGraphVertices);


    paper.render();
    props.graph.resetCells(props.graph.getCells());
    ensureCorrectRendering(props.graph.getCells(), paper);
    // convention to update a value in the parent (https://vuejs.org/guide/components/v-model.html#v-model-arguments)
    emit("update:paper", paper);
})

/* TODO not needed?
onUpdated(() => {
    // react on changed entity selection, to make sure that only for one element the tools are shown
    if (props.currentElementSelection) {
        props.paper.hideTools();
        props.currentElementSelection.showTools();
    }
})
*/

function removeHighlightingFromAllLinks() {
    props.graph.getLinks().forEach(function (link) {
        highlighters.stroke.remove(link.findView(props.paper));
    });
}


function setCurrentSelection(cell: dia.ElementView | dia.LinkView) {
    emit("select:Element", cell);
}

function resetCurrentSelection() {
    emit("deselect:Element");
}

function onEntityCollapsed(evt, elementView) {
    // Stop further event propagation --> e.g. element cannot be dragged when clicking on icon
    evt.stopPropagation();
    elementView.model.prop("collapsed", false);
    elementView.model.attr("icon/visibility", "hidden");

    // show embedded entities
    let embeddedCells = elementView.model.getEmbeddedCells({ deep: true });
    embeddedCells.forEach(embeddedElement => {
        const entityTypeHidden = embeddedElement.prop("entityTypeHidden");
        const newItemVisibility = entityTypeHidden ? "hidden" : "visible";
        embeddedElement.attr("root/visibility", newItemVisibility, { isolate: true });
        embeddedElement.prop("parentCollapsed", false);
    });
}

function onShowRequestTraceIncludedEntities(elementView, evt) {
    // Stop further event propagation --> e.g. element cannot be dragged when clicking on icon
    evt.stopPropagation();
    emit("select:RequestTrace", elementView.model);
}

function configureLink(linkView, evt, elementViewConnected, magnet, arrowhead) {

    let linkSource = linkView.model.attributes.source;
    let linkTarget = linkView.model.attributes.target;

    if ((linkView.model.prop("entity/type") === EntityTypes.LINK) && (elementViewConnected.model.prop("entity/type") === EntityTypes.INFRASTRUCTURE)) {
        let deploymentMappingLink = new DeploymentMapping();

        linkView.model.source(linkSource);
        linkView.model.target(linkTarget);
        linkView.model.set("type", deploymentMappingLink.prop("type"));
        linkView.model.attr("root", deploymentMappingLink.attr("root"));
        linkView.model.attr("line", deploymentMappingLink.attr("line"));
        linkView.model.prop("entity", deploymentMappingLink.prop("entity"), { previousType: EntityTypes.LINK });
    }

    if ((linkView.model.prop("entity/type") === EntityTypes.DEPLOYMENT_MAPPING) &&
        (elementViewConnected.model.prop("entity/type") === EntityTypes.ENDPOINT || elementViewConnected.model.prop("entity/type") === EntityTypes.EXTERNAL_ENDPOINT)) {
        let link = new Link();

        linkView.model.source(linkSource);
        linkView.model.target(linkTarget);
        linkView.model.set("type", link.prop("type"));
        linkView.model.attr("root", link.attr("root"));
        linkView.model.attr("line", link.attr("line"));
        linkView.model.prop("entity", link.prop("entity"), { previousType: EntityTypes.DEPLOYMENT_MAPPING });
        return;
    }

    if (!(linkView.model.getSourceElement()) || !(linkView.model.getTargetElement()) || linkView.model.prop("entity/type") === EntityTypes.LINK) {
        // possible since Link and Deployment Mapping can be added by sidebar
        // ignore if the current connection is actually a Link entity --> Deploy problematic does not exist 
        return;
    }

    //checkIfStorageBackingServiceConnected(linkView, elementViewConnected);
}

function checkIfStorageBackingServiceConnected(linkView, elementViewConnected) {
    let infrastructureElement = linkView.model.getSourceElement()?.prop("entity/type") === EntityTypes.INFRASTRUCTURE ? linkView.model.getSourceElement() : elementViewConnected.model;
    let connectedLinksForCurrentInfrastructure = elementViewConnected.model.graph.getConnectedLinks(infrastructureElement);

    if (connectedLinksForCurrentInfrastructure.length <= 1) {
        return;
    }

    let storageBackingServiceConnected = false;
    let includesComponentTypesInDepoyment = false;
    connectedLinksForCurrentInfrastructure.forEach(connectedLink => {
        if (!(connectedLink.getTargetElement()?.prop("entity/type") === EntityTypes.INFRASTRUCTURE && connectedLink.getSourceElement()?.prop("entity/type") === EntityTypes.INFRASTRUCTURE) &&
            (connectedLink.getTargetElement()?.prop("entity/type") !== EntityTypes.STORAGE_BACKING_SERVICE && connectedLink.getSourceElement()?.prop("entity/type") !== EntityTypes.STORAGE_BACKING_SERVICE)) {
            // check if connected Deployment Mappings includes only Infrastructure and possibly Storage Backing Service entities 
            includesComponentTypesInDepoyment = true;
        }

        if (connectedLink.getTargetElement()?.prop("entity/type") === EntityTypes.STORAGE_BACKING_SERVICE) {
            storageBackingServiceConnected = true;
        } else if (connectedLink.getSourceElement()?.prop("entity/type") === EntityTypes.STORAGE_BACKING_SERVICE) {
            storageBackingServiceConnected = true;
        }
    });

    if (storageBackingServiceConnected && includesComponentTypesInDepoyment) {
        provideConnectionWarningDialog();
    }
}

function provideConnectionWarningDialog() {
    confirmationModalManager.value = {
        show: true,
        dialogMetaData: {
            dialogSize: DialogSize.DEFAULT,
            header: {
                iconClass: "fa-solid fa-triangle-exclamation",
                svgRepresentation: "",
                text: "Deployment Mapping Connection"
            },
            footer: {
                showCancelButton: true,
                cancelButtonText: "Cancel",
                saveButtonIconClass: "fa-solid fa-trash-can",
                saveButtonText: "Ok, understood"
            },
        },
        confirmationPrompt: "You are currently deploying at least one Storage Backing Service entity with Component, Service or Backing Service entities"
            + " on the same Infrastructure. Although the modeling is generally possible, you won't be able to transform it into the TOSCA format like this."
            + " If you want to transform it into the TOSCA format, you have to introduce a new Infrastructure entity between the Storage Backing Service"
            + " and the current Infrastructure entity.",
        onCancel: () => confirmationModalManager.value.show = false,
        onConfirm: () => {
            confirmationModalManager.value.show = false;
        }
    }
}


type Vertex = { x: number, y: number };

function adjustVertices(graph: dia.Graph, cell: dia.Cell | dia.CellView) {

    const PADDING_TO_SOURCE_ELEMENT = 30;

    // if `cell` is a view, find its model
    if (cell instanceof dia.CellView) {
        cell = cell.model;
    }

    if (cell instanceof dia.Element) {
        // `cell` is an element

        graph.getConnectedLinks(cell).forEach(link => adjustVertices(graph, link));
        cell.getEmbeddedCells().forEach(child => graph.getConnectedLinks(child).forEach(link => adjustVertices(graph, link)));
        return;
    } else if (cell instanceof dia.Link) {

        // reset own vertices
        //let closestToTarget = cell.getSourcePoint();
        
        var sourceCell = cell.getSourceCell();
        /*
        if (sourceCell) {
            closestToTarget = getFirstIntersectionPoint(sourceCell, cell.getSourcePoint(), cell.getTargetPoint());
        } else {
            console.log("source cell currently not available for" + cell.id);
        }
        */
        //closestToTarget = moveOnLine(closestToTarget, cell.getTargetPoint(), PADDING_TO_SOURCE_ELEMENT);
        let closestToTarget = getOutboundPointInSuitableDirection(sourceCell, cell.getSourcePoint(), cell.getTargetPoint(), 20);
        //let closestToTarget = getOutboundPointInSuitableDirection(cell.getSourceCell(), cell.getSourcePoint(), cell.getTargetPoint(), cell.getSourcePoint().distance(cell.getTargetPoint()) * 0.5);

        // initialize vertices
        cell.vertices([closestToTarget], { rewrite: true } );


        // try to avoid conflicts
        var sourceId: dia.Cell.ID = cell.get('source').id || cell.previous('source').id;
        var linksWithSameSource = graph.getConnectedLinks(graph.getCell(sourceId)).filter(function (otherLink: dia.Link) {
            if (cell.id === otherLink.id) {
                return false;
            }
            return sourceId === otherLink.source().id;
        });

        let otherWayPoints: Vertex[] = [];
        linksWithSameSource.forEach(link => {
            otherWayPoints.push(...link.vertices());
        })

        let maximumTries = 100;
        for (let [index, vertex] of cell.vertices().entries()) {
            let tries = 0;
            while (hasConflictingWaypoint(vertex, otherWayPoints)) {
                if (tries >= maximumTries) {    
                    break;
                }
                //adjustVertexPosition(vertex, closestToTarget, cell.getTargetPoint());
                let newPoint = moveOnLine(new g.Point(vertex.x, vertex.y), cell.getTargetPoint(), 10);
                cell.vertex(index, {x: newPoint.x, y: newPoint.y});
                vertex.x = newPoint.x;
                vertex.y = newPoint.y;
                tries = tries + 1;
            }
        }
        

    }
}

function getFirstIntersectionPoint(sourceCell: dia.Cell, sourcePoint: g.Point, targetPoint: g.Point): g.Point {

    var lineToTarget = new g.Line(sourcePoint, targetPoint).setLength(3000);

    let closestIntersectionPoint: g.Point = sourcePoint; // use sourcePoint as default
    var intersectionPoints = lineToTarget.intersect(sourceCell.getBBox());

    if (intersectionPoints && intersectionPoints.length > 0) {
        closestIntersectionPoint = intersectionPoints[0];

        let smallestDistance = intersectionPoints[0].distance(targetPoint);
        for (const intersectionPoint of intersectionPoints) {
            if (intersectionPoint.distance(targetPoint) < smallestDistance) {
                closestIntersectionPoint = intersectionPoint;
            }
        }
    } else {
        console.log("NO intersection points");
    }
    return closestIntersectionPoint;
}

function getOutboundPointInSuitableDirection(sourceCell: dia.Cell, sourcePoint: g.Point, targetPoint: g.Point, buffer: number) {

    var lineToTarget = new g.Line(sourcePoint, targetPoint);
    if (lineToTarget.isDifferentiable()) {
        let angle = lineToTarget.angle();
        if (angle >= 315 || angle < 45) {
            // outbound point should be to the right
            let intersectionPoint = getFirstIntersectionPoint(sourceCell, sourcePoint, new g.Point(sourcePoint.x + 1, sourcePoint.y));
            return new g.Point(intersectionPoint.x + buffer, intersectionPoint.y);
        } else if (angle >= 45 && angle < 135) {
            // outbound point should be to the bottom
            let intersectionPoint = getFirstIntersectionPoint(sourceCell, sourcePoint, new g.Point(sourcePoint.x, sourcePoint.y + 1));
            return new g.Point(intersectionPoint.x, intersectionPoint.y + buffer);
        } else if (angle >= 135 && angle < 225) {
            // outbound point should be to the left
            let intersectionPoint = getFirstIntersectionPoint(sourceCell, sourcePoint, new g.Point(sourcePoint.x - 1, sourcePoint.y));
            return new g.Point(intersectionPoint.x - buffer, intersectionPoint.y);
        } else {
            // angle > 225 && angle < 315
            // outbound point should be to the top
            let intersectionPoint = getFirstIntersectionPoint(sourceCell, sourcePoint, new g.Point(sourcePoint.x, sourcePoint.y - 1));
            return new g.Point(intersectionPoint.x, intersectionPoint.y - buffer);
        }
    } else {
        console.log("sourcePoint and targetPoint should not be the same")
        return sourcePoint;
    }
}

function moveOnLine(lineStart: g.Point, lineTarget: g.Point, distanceToMove): g.Point {

    let distanceToTarget = lineStart.distance(lineTarget);
    let distanceRatio = distanceToMove / distanceToTarget;

    let newX = (1 - distanceRatio) * lineStart.x + distanceRatio * lineTarget.x;
    let newY = (1 - distanceRatio) * lineStart.y + distanceRatio * lineTarget.y;
    return new g.Point(newX, newY);
}

function hasConflictingWaypoint(vertex: Vertex, others: Vertex[]) {
    let tolerance = 8;
    return others.map(other => {
        return (Math.abs(other.x - vertex.x) < tolerance) || (Math.abs(other.y - vertex.y) < tolerance)
    }
    ).reduce((accumulator, conflict) => accumulator || conflict, false);
}

function adjustVertexPosition(currentVertex: Vertex, closestToTarget: g.Point, targetPoint: Vertex) {

    let slopeOfLineToTarget = (targetPoint.y - closestToTarget.y) / (targetPoint.x - closestToTarget.x);
    let slopeOfOrthogonalLine = -1 * slopeOfLineToTarget;
    let axisDistanceOfOrthogonalLine = closestToTarget.y - slopeOfOrthogonalLine * closestToTarget.x;
    let randomOtherPointOnLine: Vertex = { x: closestToTarget.x + 10, y: slopeOfOrthogonalLine * (closestToTarget.x + 10) + axisDistanceOfOrthogonalLine };
    let singleStepDistance = 10;

    let currentDistanceFromClosestPoint = new g.Point(currentVertex).distance(closestToTarget);
    if (currentDistanceFromClosestPoint === 0) {
        let newPoint = moveOnLine(closestToTarget, new g.Point(randomOtherPointOnLine), 10);
        currentVertex.x = newPoint.x;
        currentVertex.y = newPoint.y;
        return;
    } else {
        if (currentVertex.x > closestToTarget.x) {
            let newPoint = moveOnLine(closestToTarget, new g.Point(randomOtherPointOnLine), currentDistanceFromClosestPoint + singleStepDistance);
            currentVertex.x = newPoint.x;
            currentVertex.y = newPoint.y;
            return;
        } else {
            let newPoint = moveOnLine(closestToTarget, new g.Point(randomOtherPointOnLine), currentDistanceFromClosestPoint * -1);
            currentVertex.x = newPoint.x;
            currentVertex.y = newPoint.y;
            return;
        }
    }
}

</script>