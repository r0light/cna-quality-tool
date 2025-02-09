export enum ENTITIES {
    SYSTEM = "system",
    COMPONENT = "component",
    SERVICE = "service",
    BACKING_SERVICE = "backingService",
    STORAGE_BACKING_SERVICE = "storageBackingService",
    PROXY_BACKING_SERVICE = "proxyBackingService",
    BROKER_BACKING_SERVICE = "brokerBackingService",
    ENDPOINT = "endpoint",
    EXTERNAL_ENDPOINT = "externalEndpoint",
    LINK = "link",
    INFRASTRUCTURE = "infrastructure",
    DEPLOYMENT_MAPPING = "deploymentMapping",
    REQUEST_TRACE = "requestTrace",
    DATA_AGGREGATE = "dataAggregate",
    BACKING_DATA = "backingData",
    NETWORK = "network"
};

type EntitySpec =  {
    name: string, 
    description: string, 
    relation: {type: "" | "part-of" | "is-a", target: `${ENTITIES}`; },
    formal: string
}

export const entities: {[key in ENTITIES]: EntitySpec}  = {
    "system": {
        "name": "System",
        "description": "The cloud-native application as a whole",
        "relation": {"type": "is-a", "target": ENTITIES.SYSTEM},
        "formal": "SYS = <C,E,L,I,DM,RT,DA,BD,N>"
    },
    "component": {
        "name": "Component",
        "description": "An abstract entity for representing distinguishable executable parts of the system that provide certain functionalities. It can for example be a service or a certain cloud resource. Regarding its granularity, it should, generally speaking, correspond to something that can be run as an OS process.",
        "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
        "formal": "C"
    },
    "service": {
        "name": "Service",
        "description": "A component that implements a business functionality",
        "relation": {"type": "is-a", "target": ENTITIES.COMPONENT},
        "formal": "S ⊆ C"
    },
    "backingService": {
        "name": "Backing Service",
        "description": "A component providing general functionalities needed by services, for example, messaging, logging",
       "relation": {"type": "is-a", "target": ENTITIES.COMPONENT},
       "formal": "BS ⊆ C"
    },
    "storageBackingService": {
        "name": "Storage Backing Service",
        "description": "An explicitly stateful component used to store business data, e.g., a database",
       "relation": {"type": "is-a", "target": ENTITIES.COMPONENT},
       "formal": "SBS ⊆ C"
    },
    "proxyBackingService": {
        "name": "Proxy Backing Service",
        "description": "A component which can act as a proxy for all kinds of communication (links) between other components",
        "relation": {"type": "is-a", "target": ENTITIES.COMPONENT},
        "formal": "PBS ⊆ C"
    },
    "brokerBackingService": {
        "name": "Broker Backing Service",
        "description": "A component which acts as a communication broker, for example a message broker or an event store",
        "relation": {"type": "is-a", "target": ENTITIES.COMPONENT},
        "formal": "BBS ⊆ C"
    },
    "endpoint": {
        "name": "Endpoint",
        "description": "A communication endpoint, for example a REST endpoint, message producer/listener",
       "relation": {"type": "part-of", "target": ENTITIES.COMPONENT},
       "formal": "E"
    },
    "externalEndpoint": {
        "name": "External Endpoint",
        "description": "An endpoint which is explicitly publicly available",
       "relation": {"type": "is-a", "target": ENTITIES.ENDPOINT},
       "formal": "EE ⊆ E"
    },
    "link": {
        "name": "Link",
        "description": "A directed potential connection between a specific component and a specific endpoint of a different component. Potential in this case refers to the design time perspective, meaning that a component is implemented so that it can invoke the respective endpoint.",
       "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
       "formal": "L = C x E"
    },
    "infrastructure": {
        "name": "Infrastructure",
        "description": "The technical foundation where components are deployed, e.g., a container orchestration system",
       "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
       "formal": "I"
    },
    "deploymentMapping": {
        "name": "Deployment Mapping",
        "description": "A connection between a component or infrastructure and its underlying infrastructure on which that component or infrastructure is deployed.",
       "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
       "formal": "DM = C x I ∪ I x I"
    },
    "requestTrace": {
        "name": "Request Trace",
        "description": "The whole resulting trace of a service invocation from the outside that means when an external endpoint is invoked. A request trace includes a collection of components and links",
       "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
       "formal": "RT = <L,EE>"
    },
    "dataAggregate": {
        "name": "Data Aggregate",
        "description": "An aggregate which needs to be persisted and is used by services, e.g., Business objects",
       "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
       "formal": "DA"
    },
    "backingData": {
        "name": "Backing Data",
        "description": "Non-business data, e.g., config values, secrets, logs, metrics",
       "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
       "formal": "BD"
    },
    "network": {
        "name": "Network",
        "description": "A network or subnet which covers a range of (ip) addresses and to which components can be assigned to.",
        "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
        "formal": "N"
    }
};

