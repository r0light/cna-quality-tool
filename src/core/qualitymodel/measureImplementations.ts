import { sum } from "lodash";
import { ExternalEndpoint } from "../entities";
import { Service } from "../entities/service";
import { Calculation } from "./quamoco/Measure";

const average: (list: number[]) => number = list => {
    return list.reduce((e1, e2) => e1 + e2, 0) / list.length
}

const measureImplementations: { [measureKey: string]: Calculation } = {
    "serviceReplicationLevel": (system) => {
        return average([...system.getComponentEntities.entries()]
            .map(entry => entry[1])
            .filter(entity => entity.constructor.name === Service.name)
            .map(service => service.getProperties()
                .find(prop => prop.getKey === "replicas").value)
            );
    },
    "externallyAvailableEndpoints": (system) => {
        return [...system.getComponentEntities.entries()].map(entry => entry[1].getExternalEndpointEntities.length).reduce((e1, e2) => e1 + e2, 0);
    }
}

export { measureImplementations }