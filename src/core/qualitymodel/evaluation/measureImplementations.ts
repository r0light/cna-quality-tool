import { compact } from "lodash";
import { Service, StorageBackingService } from "../../entities.js";
import { Calculation } from "../quamoco/Measure.js";
import { PROTOCOLS_SUPPORTING_TLS } from "../specifications/featureModel.js";

const average: (list: number[]) => number = list => {
    return list.reduce((e1, e2) => e1 + e2, 0) / list.length
}

const measureImplementations: { [measureKey: string]: Calculation } = {
    "serviceReplicationLevel": (system) => {
        let replicasPerService: Map<String, number> = new Map();
        for (const [id, deploymentMapping] of system.getDeploymentMappingEntities.entries()) {
            let deployedEntity = deploymentMapping.getDeployedEntity
            if (deployedEntity.constructor.name === Service.name) {
                let noOfReplicas = deploymentMapping.getProperties().find(prop => prop.getKey === "replicas").value
                if (replicasPerService.has(deployedEntity.getId)) {
                    replicasPerService.set(deployedEntity.getId, replicasPerService.get(deployedEntity.getId) + noOfReplicas);
                } else {
                    replicasPerService.set(deployedEntity.getId, noOfReplicas);
                }
            }
        }

        if (replicasPerService.size === 0) {
            return "n/a";
        } else {
            return average(
                Array.from(replicasPerService.values())
            );
        }
    },
    "storageReplicationLevel": (system) => {
        let replicasPerStorageService: Map<String, number> = new Map();
        for (const [id, deploymentMapping] of system.getDeploymentMappingEntities.entries()) {
            let deployedEntity = deploymentMapping.getDeployedEntity
            if (deployedEntity.constructor.name === StorageBackingService.name) {
                let noOfReplicas = deploymentMapping.getProperties().find(prop => prop.getKey === "replicas").value
                if (replicasPerStorageService.has(deployedEntity.getId)) {
                    replicasPerStorageService.set(deployedEntity.getId, replicasPerStorageService.get(deployedEntity.getId) + noOfReplicas);
                } else {
                    replicasPerStorageService.set(deployedEntity.getId, noOfReplicas);
                }
            }
        }

        if (replicasPerStorageService.size === 0) {
            return "n/a";
        } else {
            return average(
                Array.from(replicasPerStorageService.values())
            );
        }
    },
    "externallyAvailableEndpoints": (system) => {
        return [...system.getComponentEntities.entries()].map(entry => entry[1].getExternalEndpointEntities.length).reduce((e1, e2) => e1 + e2, 0);
    },
    "dataShardingLevel": (system) => {
        let storageBackingServices = [...system.getComponentEntities.entries()]
            .map(entry => entry[1])
            .filter(entity => entity.constructor.name === StorageBackingService.name);
        if (storageBackingServices.length === 0) {
            return "n/a";
        } else {
            return average(storageBackingServices
                .map(storageService => storageService.getProperties()
                    .find(prop => prop.getKey === "shards").value)
            );
        }
    },
    "ratioOfEndpointsSupportingSsl": (system) => {
        let allEndpoints = [...system.getComponentEntities.entries()].flatMap(entry => entry[1].getEndpointEntities.concat(entry[1].getExternalEndpointEntities));
        let numberOfEndpointsSupportingSsl = allEndpoints.map(endpoint => endpoint.getProperties().find(property => property.getKey === "protocol").value)
            .filter(protocol => PROTOCOLS_SUPPORTING_TLS.includes(protocol))
            .length;
        if ((allEndpoints.length - numberOfEndpointsSupportingSsl) === 0) {
            return 0;
        }

        return numberOfEndpointsSupportingSsl / (allEndpoints.length - numberOfEndpointsSupportingSsl);
    },
    "ratioOfExternalEndpointsSupportingTls": (system) => {
        let allExternalEndpoints = [...system.getComponentEntities.entries()].flatMap(entry => entry[1].getExternalEndpointEntities);
        let numberOfExternalEndpointsSupportingTLS = allExternalEndpoints.map(endpoint => endpoint.getProperties().find(property => property.getKey === "protocol").value)
            .filter(protocol => PROTOCOLS_SUPPORTING_TLS.includes(protocol))
            .length;
        if (allExternalEndpoints.length === 0) {
            return 0;
        }

        return numberOfExternalEndpointsSupportingTLS / allExternalEndpoints.length;
    },
    "ratioOfSecuredLinks": (system) => {
        let allLinks = [...system.getLinkEntities.entries()].map(link => link[1]);
        let linksConnectedToSecureEndpoints = allLinks.filter(link => {
            let protocol = link.getTargetEndpoint.getProperties().find(property => property.getKey === "protocol").value;
            return PROTOCOLS_SUPPORTING_TLS.includes(protocol);
        }).length

        if (allLinks.length === 0) {
            return 0;
        }

        return linksConnectedToSecureEndpoints / allLinks.length;
    },
    "dataAggregateScope": (system) => {
        return [...system.getDataAggregateEntities.keys()].length;
    },
    "ratioOfStatefulComponents": (system) => {
        let allComponents = [...system.getComponentEntities.entries()]
        let numberOfStatefulComponents = allComponents.filter(entry => !(entry[1].getProperties().find(property => property.getKey === "stateless").value)).length;

        if (allComponents.length === 0) {
            return 0;
        }

        return numberOfStatefulComponents / allComponents.length;
    },
    "ratioOfStatelessComponents": (system) => {
        let allComponents = [...system.getComponentEntities.entries()]
        let numberOfStatelessComponents = allComponents.filter(entry => (entry[1].getProperties().find(property => property.getKey === "stateless").value)).length;

        if (allComponents.length === 0) {
            return 0;
        }

        return numberOfStatelessComponents / allComponents.length;
    }
}


export { measureImplementations }