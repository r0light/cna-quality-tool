<template>
    <Teleport :disabled="!printing" to="body">
        <div id="print-section" class="system-container printable" data-cursor=grab>
            <div class="system-container-modeling-area">
                <div class="paperArea">
                    <div id="jointPaper"></div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { onMounted, onUpdated } from 'vue';
import { dia, routers, shapes, highlighters } from "jointjs";
import { ModelingValidator } from '../modelingValidator';
import ConnectionSelectionTools from "./tools/connectionSelectionTools";
import EntityTypes from "../config/entityTypes";
import { DeploymentMapping, Link } from "../config/entityShapes";
import { UIContentType } from "../config/toolbarConfiguration";
import UIModalDialog from "../representations/guiElements.dialog";


const props = defineProps<{
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

onMounted(() => {

    var modelingValidator = new ModelingValidator(props.graph);
    var paper = new dia.Paper({
        el: $("#jointPaper"),
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

        cellViewNamespace: shapes,
        routerNamespace: routers,

        // defaults:
        defaultLink: (cellView, magnet) => modelingValidator.defaultLink(cellView, magnet),
        defaultRouter: {
            name: "manhattan"
        },
        defaultConnector: {
            name: "rounded",
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
            let currentPaper = this;
            this.model.getLinks().forEach(function (link) {
                highlighters.stroke.remove(link.findView(currentPaper));
            });
            // TODO if lock mechanism is included 
            // if (cellView.paper.options.interactive == false) {
            //     return;
            // }
            setCurrentSelection(cellView);
            cellView.showTools();
        },
        'blank:pointerdown': function (evt, x, y) {
            this.hideTools();
            //setSelectionHandle(undefined);
            resetCurrentSelection();
            let currentPaper = this;
            this.model.getLinks().forEach(function (link) {
                highlighters.stroke.remove(link.findView(currentPaper));
            });
        },
        'element:contextmenu': function (cellView, evt, x, y) {
            cellView.showTools();
        },
        "link:pointerclick": function (linkView: dia.LinkView, evt) {

            linkView.unhighlight();

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


    paper.render();
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

    checkIfStorageBackingServiceConnected(linkView, elementViewConnected);
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
    let modalDialog = new UIModalDialog("invalidToscaConnection-information", "invalidToscaConnection");
    modalDialog.create(InvalidToscaConnectionDialogConfig);
    modalDialog.render("modals", true);
    modalDialog.show();
}


// TODO keep here? --> currently shown every time new problematic connection is added
const InvalidToscaConnectionDialogConfig = {
    type: "modalDialog",
    header: {
        iconClass: "fa-solid fa-triangle-exclamation",
        type: "warning",
        text: "Deployment Mapping Connection",
        closeButton: true
    },
    footer: {
        cancelButtonText: "Ok, understood",
    },
    content: {
        contentType: UIContentType.SINGLE_TEXTBLOCK,
        text: "You are currently deploying at least one Storage Backing Service entity with Component, Service or Backing Service entities"
            + " on the same Infrastructure. Although the modeling is generally possible, you won't be able to transform it into the TOSCA format like this."
            + " If you want to transform it into the TOSCA format, you have to introduce a new Infrastructure entity between the Storage Backing Service"
            + " and the current Infrastructure entity."
    }
};




</script>