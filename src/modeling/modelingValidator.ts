import { dia } from '@joint/core'
import EntityTypes from "./config/entityTypes";
import { DeploymentMapping, Link } from "./config/entityShapes";

export class ModelingValidator {

    graph: dia.Graph;


    constructor(graph: dia.Graph) {
        this.graph = graph;
    }


    validateLinks(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
        if (!cellViewS || !cellViewT) {
            // check if the link was added by sidebar --> first time both ends are not connected
            return this.handleSidebarLink(cellViewS, cellViewT, end, linkView);
        }

        if (magnetS && magnetT && magnetS === magnetT) {
            // no self-linking
            return false;
        }

        if (cellViewT && cellViewS && (cellViewT.model.isLink() || cellViewS.model.isLink())) {
            // no link-to-link connections
            return false;
        }

        if (cellViewS === cellViewT) {
            return false;
        }

        if (this.checkIfConnectionAlreadyExists(cellViewS, cellViewT)) {
            return false;
        }

        if (!magnetS || (!magnetT && !magnetS)) {
            if (cellViewT && cellViewT.model.prop("entity/type") == EntityTypes.ENDPOINT ||
                cellViewT.model.prop("entity/type") == EntityTypes.EXTERNAL_ENDPOINT) {
                return this.connectableEntity(cellViewS) && !(cellViewT.model.isEmbeddedIn(cellViewS.model));
            }

            if (cellViewT && cellViewT.model.attributes.entity.type === EntityTypes.INFRASTRUCTURE) {
                return this.deployableEntity(cellViewS);
            }
        }

        // only target ends can be reconnected
        if (end === "source") {
            return false;
        }

        if (this.connectableEntity(cellViewS)) {
            if (cellViewT.model.attributes.entity.type === EntityTypes.ENDPOINT || cellViewT.model.attributes.entity.type === EntityTypes.EXTERNAL_ENDPOINT) {
                // if the target is an Endpoint or External Endpoint check that the Endpoint is a valid one, meaning it has a parent but also not the source entity as parent
                return !cellViewT.model.isEmbeddedIn(cellViewS.model) && cellViewT.model.getParentCell();
            }

            return cellViewT.model.attributes.entity.type === EntityTypes.INFRASTRUCTURE;
        }

        if (cellViewS.model.attributes.entity.type === EntityTypes.INFRASTRUCTURE) {
            return this.deployableEntity(cellViewT);
        }

        return false;
    }

    /**
     * Sidebar Links or Deployment Mappings can be moved from both sides and required therefore additional logic.
     * However, the original restrictions regarding target and source ends remains. This means that target ends can only 
     * connect to Endpoint or External Endpoint entities for Links and Infrastructure entities for Deployment Mappings. 
     * In contrast, source ends are allowed to connect to all Component entity types for Links and for Deployments Mappings
     * are Infrastructure entities additionally allowed.
     * 
     * @param {joint.dia.ElementView} cellViewS The ElementView that contains the required model data for the connected source element, if present.
     * @param {joint.dia.ElementView} cellViewT The ElementView that contains the required model data for the connected target end, if present.
     * @param {string} end Which side of the connection is currently being realized.
     * @param {joint.dia.LinkView} linkView The LinkView of the current connection.
     * @returns 
     */
    handleSidebarLink(cellViewS, cellViewT, end, linkView) {
        if (!cellViewS && cellViewT && end === "target") {
            // allow target connection side to connect only to endpoint or infrastructure entities
            if (linkView.model.prop("entity/type") === EntityTypes.DEPLOYMENT_MAPPING) {
                return cellViewT.model.attributes.entity.type === EntityTypes.INFRASTRUCTURE; // TODO allow all deployable entities?
            }

            return (cellViewT.model.attributes.entity.type === EntityTypes.ENDPOINT ||
                cellViewT.model.attributes.entity.type === EntityTypes.EXTERNAL_ENDPOINT) && cellViewT.model.getParentCell();
        }

        if (!cellViewT && cellViewS && end === "source") {
            // allow source connection side to connect only to connectable entities
            if (linkView.model.prop("entity/type") === EntityTypes.LINK) {
                return this.connectableEntity(cellViewS);
            }

            return this.deployableEntity(cellViewS);
        }

        return false;
    }

    /**
     * Checks if the given element is deployable using an Infrastructure entity. 
     * The element is identified by its included model. 
     * 
     * @param {joint.dia.ElementView} cellView The cellView of the element to check. 
     * @returns true if it is deployable
     */
    deployableEntity(cellView) {
        return cellView.model.attributes.entity.type === EntityTypes.COMPONENT ||
            cellView.model.attributes.entity.type === EntityTypes.SERVICE ||
            cellView.model.attributes.entity.type === EntityTypes.BACKING_SERVICE ||
            cellView.model.attributes.entity.type === EntityTypes.STORAGE_BACKING_SERVICE ||
            cellView.model.attributes.entity.type === EntityTypes.PROXY_BACKING_SERVICE ||
            cellView.model.attributes.entity.type === EntityTypes.INFRASTRUCTURE;
    }

    /**
     * Checks if the given element can be connected to other entities. The element is identified
     * by its included model.
     * 
     * @param {joint.dia.ElementView} cellView The cellView of the element to check. 
     * @returns true if it can be connected
     */
    connectableEntity(cellView) {
        return cellView.model.attributes.entity.type === EntityTypes.COMPONENT ||
            cellView.model.attributes.entity.type === EntityTypes.SERVICE ||
            cellView.model.attributes.entity.type === EntityTypes.BACKING_SERVICE ||
            cellView.model.attributes.entity.type === EntityTypes.STORAGE_BACKING_SERVICE ||
            cellView.model.attributes.entity.type === EntityTypes.PROXY_BACKING_SERVICE;
    }

    /**
     * Check if the connection between the target and the source element already exists,
     * just the other way round.
     * 
     * @param {joint.dia.ElementView} cellViewS The source cellView of the link to create. 
     * @param {joint.dia.ElementView} cellViewT The target cellView of the link to create. 
     * @returns true if this connection already exists
     */
    checkIfConnectionAlreadyExists(cellViewS, cellViewT) {
        let connectionAlreadyExists = false;
        this.graph.getConnectedLinks(cellViewT.model).forEach(connectedLink => {
            if (connectedLink.prop("target/id") === cellViewT.model.id &&
                connectedLink.prop("source/id") === cellViewS.model.id) {
                connectionAlreadyExists = true;
                return;
            } else if (connectedLink.prop("source/id") === cellViewT.model.id &&
                connectedLink.prop("target/id") === cellViewS.model.id) {
                connectionAlreadyExists = true;
                return;
            }
        });

        return connectionAlreadyExists;
    }

    validateEmbedding(childView, parentView) {

        switch (parentView.model.attributes.entity.type) {
            case EntityTypes.COMPONENT:
            case EntityTypes.SERVICE:
            case EntityTypes.BACKING_SERVICE:
            case EntityTypes.STORAGE_BACKING_SERVICE:
            case EntityTypes.PROXY_BACKING_SERVICE:
                if (this.checkIfConnectionAlreadyExists(childView, parentView)) {
                    // cannot embed entities to which a connection exists
                    return false;
                }

                // TODO check if dataaggregate or backingData already included?

                return childView.model.attributes.entity.type === EntityTypes.ENDPOINT ||
                    childView.model.attributes.entity.type === EntityTypes.EXTERNAL_ENDPOINT ||
                    childView.model.attributes.entity.type === EntityTypes.DATA_AGGREGATE ||
                    childView.model.attributes.entity.type === EntityTypes.BACKING_DATA;
            case EntityTypes.INFRASTRUCTURE:
                return childView.model.attributes.entity.type === EntityTypes.BACKING_DATA;
            default:
                return false;
        }
    }

    validateUnembedding(childView) {
        return !(childView.model.attributes.entity.type === EntityTypes.ENDPOINT) ||
            !(childView.model.attributes.entity.type === EntityTypes.EXTERNAL_ENDPOINT) ||
            !(childView.model.attributes.entity.type === EntityTypes.DATA_AGGREGATE) ||
            !(childView.model.attributes.entity.type === EntityTypes.BACKING_DATA);
    }

    checkCreatedLink(linkView, paper) {
        if ((linkView.targetBBox.x === 0) && (linkView.targetBBox.y === 0)) {
            // element selected and not just any point on paper
            return true;
        }

        if ((linkView.sourceBBox.x === 0) && (linkView.sourceBBox.y === 0)) {
            // element selected and not just any point on paper
            return true;
        }

        return false;
    }

    defaultLink(cellView, magnet) {
        if (cellView.model.attributes.entity.type === EntityTypes.INFRASTRUCTURE) {
            return new DeploymentMapping();
        }

        return new Link();
    }
}