type EntitySpec =  {
    name: string, 
    description: string, 
    relation: {type: "" | "part-of" | "is-a", target: string }
}

export const entities: {[key: string]: EntitySpec}  = {
    "system": {
        "name": "System",
        "description": "The cloud-native application as a whole",
        "relation": {"type": "", "target": ""}
    },
    "component": {
        "name": "Component",
        "description": "An abstract entity for representing distinguishable executable parts of the system that provide certain functionalities. It can for example be a service or a certain cloud resource. Regarding its granularity, it should, generally speaking, correspond to something that can be run as an OS process.",
        "relation": {"type": "part-of", "target": "system"}
    },
    "service": {
        "name": "Service",
        "description": "A component that implements a business functionality",
        "relation": {"type": "is-a", "target": "component"}
    },
    "backingService": {
        "name": "Backing Service",
        "description": "A component providing general functionalities needed by services, for example, messaging, logging",
       "relation": {"type": "is-a", "target": "component"} 
    },
    "storageBackingService": {
        "name": "Storage Backing Service",
        "description": "An explicitly stateful component used to store business data, e.g., a database",
       "relation": {"type": "is-a", "target": "component"} 
    },
    "endpoint": {
        "name": "Endpoint",
        "description": "A communication endpoint, for example a REST endpoint, message producer/listener",
       "relation": {"type": "part-of", "target": "component"} 
    },
    "externalEndpoint": {
        "name": "External Endpoint",
        "description": "An endpoint which is explicitly publicly available",
       "relation": {"type": "is-a", "target": "endpoint"} 
    },
    "link": {
        "name": "Link",
        "description": "A directed potential connection between a specific component and a specific endpoint of a different component. Potential in this case refers to the design time perspective, meaning that a component is implemented so that it can invoke the respective endpoint.",
       "relation": {"type": "part-of", "target": "system"} 
    },
    "infrastructure": {
        "name": "Infrastructure",
        "description": "The technical foundation where components are deployed, e.g., a container orchestration system",
       "relation": {"type": "part-of", "target": "system"} 
    },
    "deploymentMapping": {
        "name": "Deployment Mapping",
        "description": "A connection between a component or infrastructure and its underlying infrastructure on which that component or infrastructure is deployed.",
       "relation": {"type": "part-of", "target": "system"} 
    },
    "requestTrace": {
        "name": "Request Trace",
        "description": "The whole resulting trace of a service invocation from the outside that means when an external endpoint is invoked. A request trace includes a collection of components and links",
       "relation": {"type": "part-of", "target": "system"} 
    },
    "dataAggregate": {
        "name": "Data Aggregate",
        "description": "An aggregate which needs to be persisted and is used by services, e.g., Business objects",
       "relation": {"type": "part-of", "target": "system"} 
    },
    "backingData": {
        "name": "Backing Data",
        "description": "Non-business data, e.g., config values, secrets, logs, metrics",
       "relation": {"type": "part-of", "target": "system"} 
    },
};

