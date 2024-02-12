import { Service, StorageBackingService } from "../../entities.js";
import { Calculation } from "../quamoco/Measure.js";

const average: (list: number[]) => number = list => {
    return list.reduce((e1, e2) => e1 + e2, 0) / list.length
}

const measureImplementations: { [measureKey: string]: Calculation } = {
    "serviceReplicationLevel": (system) => {
        let services = [...system.getComponentEntities.entries()]
            .map(entry => entry[1])
            .filter(entity => entity.constructor.name === Service.name);
        if (services.length === 0) {
            return "n/a";
        } else {
            return average(
                services
                    .map(service => service.getProperties()
                        .find(prop => prop.getKey === "replicas").value)
            );
        }
    },
    "storageReplicationLevel": (system) => {
        let storageBackingServices = [...system.getComponentEntities.entries()]
            .map(entry => entry[1])
            .filter(entity => entity.constructor.name === StorageBackingService.name);
        if (storageBackingServices.length === 0) {
            return "n/a";
        } else {
            return average(storageBackingServices
                .map(storageService => storageService.getProperties()
                    .find(prop => prop.getKey === "replicas").value)
            );
        }
    },
    "externallyAvailableEndpoints": (system) => {
        return [...system.getComponentEntities.entries()].map(entry => entry[1].getExternalEndpointEntities.length).reduce((e1, e2) => e1 + e2, 0);
    }
}


export { measureImplementations, }