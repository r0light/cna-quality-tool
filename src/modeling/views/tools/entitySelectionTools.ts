import { dia, elementTools } from '@joint/core';
import EntityTypes from "../../config/entityTypes";

let CloneButton = elementTools.Button.extend({
    name: "clone-button",
    options: {
        markup: [{
            tagName: "title",
            selector: "iconTooltip",
            textContent: "Copy entity"
        },
        {
            tagName: "image",
            selector: "icon",
            attributes: {
                href: "static/icons/copy-solid.svg",
                fill: "black",
                transform: "translate(-6, -6) scale(0.1)",
                cursor: "pointer",
                class: "entityTool"
            }
        }
        ],
        x: "100%",
        y: "100%",
        offset: {
            x: 0,
            y: 0
        },
        rotate: true,
        action: function (evt, cellView) {
            let clonedElement = cellView.model.clone(); // TODO deep clone?
            clonedElement.position(cellView.model.position().x + 20, cellView.model.position().y + 20);
            cellView.model.graph.addCell(clonedElement);
            
            addSelectionToolToEntity(clonedElement, cellView.paper);
        }
    }
});

let CreateLinkButton = elementTools.Connect.extend({
    name: "link",
    children: [{
        tagName: "title",
        selector: "iconTooltip",
        textContent: "Create a Link or Deployment Mapping to another entity"
    },
    {
        tagName: "image",
        selector: "icon",
        attributes: {
            href: "static/icons/arrows-split-up-and-left-solid.svg",
            fill: "white",
            transform: "scale(0.1) rotate(90)",
            cursor: "pointer",
            class: "entityTool"
        }
    }]
});

let CustomRemoveButton = elementTools.Remove.extend({
    name: "remove",
    children: [{
        tagName: "title",
        selector: "iconTooltip",
        textContent: "Remove entire entity"
    },
    {
        tagName: "circle",
        selector: "button",
        attributes: {
            r: 7,
            fill: "black",
            cursor: "pointer",
            class: "entityTool"
        }
    }, {
        tagName: "path",
        selector: "icon",
        attributes: {
            d: "M -3 -3 3 3 M -3 3 3 -3",
            fill: "none",
            stroke: "#FFFFFF",
            "stroke-width": 2,
            pointerEvents: "none"
        }
    }]
});


let CollapseButton = elementTools.Button.extend({
    name: "collapse-button",
    options: {
        markup: [{
            tagName: "title",
            selector: "iconTooltip",
            textContent: "Collapse to hide embedded entities"
        },
        {
            tagName: "image",
            selector: "icon",
            attributes: {
                href: "static/icons/circle-minus-solid.svg",
                transform: "translate(-6, -6) scale(0.1)",
                // href: "icon/dash-circle.svg",
                // transform: "translate(-10, -6) scale(0.9)",
                cursor: "pointer",
                class: "entityTool"
            }
        }
        ],
        x: "100%",
        y: "100%",
        offset: {
            x: 0,
            y: 0
        },
        rotate: true,
        action: function (evt, cellView) {
            let element = cellView.model;

            // for (const tool of cellView._toolsView.tools) { // TODO
            //     if ("collapse-button".localeCompare(tool.name) === 0) {
            //         tool.hide();
            //     }
            // }

            element.attr("icon/visibility", true, { isolate: true });
            element.prop("collapsed", true);

            // hide embedded items
            let embeddedCells = element.getEmbeddedCells({ deep: true });
            embeddedCells.forEach(embeddedElement => {
                embeddedElement.attr("root/visibility", "hidden", { isolate: true });
                embeddedElement.prop("parentCollapsed", true);
            });
        }
    }
});


class EntitySelectionTools extends dia.ToolsView {

    "use strict";

    tools = []

    constructor(connectableItem = false, collapsableItem = false) {
        super({ name: "EntityTools" });

        this.options.tools = [
            this.createBoundaryTool(),
            this.createRemoveTool(),
            this.createCopyTool()
        ]

        if (connectableItem) {
            this.options.tools.push(this.createConnectTool());
        }

        if (collapsableItem) {
            this.options.tools.push(this.createCollapseTool());
        }

        this.tools = this.options.tools;
    }

    createBoundaryTool() {
        let boundaryTool = new elementTools.Boundary({
            padding: 2,
            attributes: {
                fill: "none",
                stroke: "#FEB663",
                "stroke-width": "3"
            }
        });

        return boundaryTool;
    }

    createRemoveTool() {
        let removeButton = new CustomRemoveButton(
            {
                focusOpacity: 0.5,
                x: '0%',
                y: '0%',
                offset: { x: -11, y: -7 }
            }
        );
        return removeButton;
    }

    createConnectTool() {
        let connectButton = new CreateLinkButton(
            {
                focusOpacity: 0.5,
                x: '100%',
                y: '50%',
                offset: { x: 22, y: -7 },
                magnet: "body"
            }
        );

        return connectButton;
    }

    createCopyTool() {
        return new CloneButton(
            {
                focusOpacity: 0.5,
                x: '100%',
                y: '100%',
                offset: { x: 12, y: 5 }
            }
        );
    }

    createCollapseTool() {
        return new CollapseButton(
            {
                focusOpacity: 0.5,
                x: '0%',
                y: '100%',
                offset: { x: -12, y: 7 }
            }
        );
    }


}

function addSelectionToolToEntity(addedElement: dia.Cell, currentPaper: dia.Paper) {
    if (addedElement.isLink()) {
        return;
    }

    let connectableEntity = (addedElement.prop("entity/type") === EntityTypes.COMPONENT || addedElement.prop("entity/type") === EntityTypes.SERVICE || addedElement.prop("entity/type") === EntityTypes.BACKING_SERVICE || addedElement.prop("entity/type") === EntityTypes.STORAGE_BACKING_SERVICE || addedElement.prop("entity/type") === EntityTypes.INFRASTRUCTURE) ? true : false;
    let collapsableEntity = (addedElement.prop("entity/type") === EntityTypes.REQUEST_TRACE || connectableEntity) ? true : false;
    let toolToAdd = new EntitySelectionTools(connectableEntity, collapsableEntity);
    var elementView = currentPaper.requireView(addedElement);
    elementView.addTools(toolToAdd);
    elementView.hideTools();
}

export { EntitySelectionTools, addSelectionToolToEntity };