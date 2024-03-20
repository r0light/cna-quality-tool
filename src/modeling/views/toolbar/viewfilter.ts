import EntityTypes from "@/modeling/config/entityTypes";
import { dia } from "jointjs";

export function getAffectedBackingViewCells(graph: dia.Graph, communicationShown: boolean, deploymentShown: boolean, dataShown: boolean): dia.Cell[] {

    let affectedEntities = graph
        .getCells()
        .filter(cell => {
            return cell.attributes.entity.type === EntityTypes.BACKING_SERVICE
        })

    if (communicationShown) {
        // communication is shown, therefore communication to from backing services should be hidden.
        let index = 0;
        while (index < affectedEntities.length) {
            let affectedEntity = affectedEntities[index];

            let embeddedEntities = affectedEntity.getEmbeddedCells();
            embeddedEntities.forEach(embeddedEntity => {
                if (embeddedEntity.attributes.entity.type === EntityTypes.ENDPOINT || embeddedEntity.attributes.entity.type === EntityTypes.EXTERNAL_ENDPOINT) {
                    let incomingLinks = graph.getConnectedLinks(embeddedEntity);
                    affectedEntities.push(...incomingLinks);
                    affectedEntities.push(embeddedEntity);
                }
            })

            let outgoingLinks = graph.getConnectedLinks(affectedEntity).filter(linkCell => linkCell.attributes.entity.type === EntityTypes.LINK);
            affectedEntities.push(...outgoingLinks);
            index = index + 1;
        }
    }

    if (deploymentShown) {
        let index = 0;
        while (index < affectedEntities.length) {
            let affectedEntity = affectedEntities[index];

            let outgoingLinks = graph.getConnectedLinks(affectedEntity).filter(linkCell => linkCell.attributes.entity.type === EntityTypes.DEPLOYMENT_MAPPING);
            affectedEntities.push(...outgoingLinks);
            index = index + 1;
        }
    }

    if (dataShown) {
        let index = 0;
        while (index < affectedEntities.length) {
            let affectedEntity = affectedEntities[index];

            let embeddedEntities = affectedEntity.getEmbeddedCells();
            embeddedEntities.forEach(embeddedEntity => {
                if (embeddedEntity.attributes.entity.type === EntityTypes.DATA_AGGREGATE || embeddedEntity.attributes.entity.type === EntityTypes.BACKING_DATA) {
                    affectedEntities.push(embeddedEntity);
                }
            })
            index = index + 1;
        }
    }

    return affectedEntities;
}


export function getAffectedDeploymentViewCells(graph: dia.Graph, backingShown: boolean, dataShown: boolean): dia.Cell[] {

    let affectedEntities = graph
        .getCells()
        .filter(cell => {
            return cell.attributes.entity.type === EntityTypes.INFRASTRUCTURE || cell.attributes.entity.type === EntityTypes.DEPLOYMENT_MAPPING
        });


    if (!backingShown) {
        let index = 0;
        backingDependantDeployment: while (index < affectedEntities.length) {
            let affectedEntity = affectedEntities[index];

            if (affectedEntity.attributes.entity.type === EntityTypes.DEPLOYMENT_MAPPING) {
                let deployedEntity = (affectedEntity as dia.Link).getSourceCell();
                if (deployedEntity.attributes.entity.type === EntityTypes.BACKING_SERVICE) {
                    affectedEntities.splice(index, 1);
                    continue backingDependantDeployment;
                }
            }
            index = index + 1;
        }
    }

    if (dataShown) {
        let index = 0;
        while (index < affectedEntities.length) {
            let affectedEntity = affectedEntities[index];

            let embeddedEntities = affectedEntity.getEmbeddedCells();
            embeddedEntities.forEach(embeddedEntity => {
                if (embeddedEntity.attributes.entity.type === EntityTypes.DATA_AGGREGATE || embeddedEntity.attributes.entity.type === EntityTypes.BACKING_DATA) {
                    affectedEntities.push(embeddedEntity);
                }
            })
            index = index + 1;
        }
    }

    return affectedEntities;
}

export function getAffectedCommunicationViewCells(graph: dia.Graph, backingShown: boolean, requestTracesShown): dia.Cell[] {
    let affectedEntities = graph
        .getCells()
        .filter(cell => {
            return cell.attributes.entity.type === EntityTypes.LINK || cell.attributes.entity.type === EntityTypes.ENDPOINT || cell.attributes.entity.type === EntityTypes.EXTERNAL_ENDPOINT || cell.attributes.entity.type === EntityTypes.REQUEST_TRACE
        });


    if (!backingShown) {
        let index = 0;
        backingDependantCommunication: while (index < affectedEntities.length) {

            let affectedEntity = affectedEntities[index];

            if (affectedEntity.attributes.entity.type === EntityTypes.LINK) {
                let source = (affectedEntity as dia.Link).getSourceCell();
                let target = (affectedEntity as dia.Link).getTargetCell();

                if (source.attributes.entity.type === EntityTypes.BACKING_SERVICE || (target.isEmbedded() && target.getParentCell().attributes.entity.type === EntityTypes.BACKING_SERVICE)) {
                    affectedEntities.splice(index, 1);
                    continue backingDependantCommunication;
                }
            }

            if (
                (affectedEntity.attributes.entity.type === EntityTypes.ENDPOINT
                    || affectedEntity.attributes.entity.type === EntityTypes.EXTERNAL_ENDPOINT)
                && (affectedEntity.isEmbedded() && affectedEntity.getParentCell().attributes.entity.type === EntityTypes.BACKING_SERVICE)
            ) {
                affectedEntities.splice(index, 1);
                continue backingDependantCommunication;
            }
            index = index + 1;
        }
    }

    if (!requestTracesShown) {
        return affectedEntities.filter(cell => cell.attributes.entity.type !== EntityTypes.REQUEST_TRACE);
    }

    return affectedEntities;

}

export function getAffectedDataViewCells(graph: dia.Graph, deploymentShown: boolean, backingShown: boolean): dia.Cell[] {

    let affectedEntities = graph
        .getCells()
        .filter(cell => {
            return cell.attributes.entity.type === EntityTypes.DATA_AGGREGATE || cell.attributes.entity.type === EntityTypes.BACKING_DATA
        });

    if (!deploymentShown) {
        let index = 0;
        deploymentDependantData: while (index < affectedEntities.length) {

            let affectedEntity = affectedEntities[index];

            if (affectedEntity.isEmbedded()) {
                let parent = affectedEntity.getParentCell();

                if (parent.attributes.entity.types === EntityTypes.INFRASTRUCTURE) {
                    affectedEntities.splice(index, 1);
                    continue deploymentDependantData;
                }

            }
            index = index + 1;
        }
    }

    if (!backingShown) {
        let index = 0;
        backingDependantData: while (index < affectedEntities.length) {

            let affectedEntity = affectedEntities[index];

            if (affectedEntity.isEmbedded()) {
                let parent = affectedEntity.getParentCell();

                if (parent.attributes.entity.types === EntityTypes.BACKING_SERVICE) {
                    affectedEntities.splice(index, 1);
                    continue backingDependantData;
                }
            }
            index = index + 1;
        }
    }

    return affectedEntities;
}

export function getAffectedRequestTraceCells(graph: dia.Graph, communicationShown: boolean): dia.Cell[] {

    if (!communicationShown) {
        return [];
    }

    let affectedEntities = graph
        .getCells()
        .filter(cell => {
            return cell.attributes.entity.type === EntityTypes.REQUEST_TRACE
        });

    return affectedEntities;
}