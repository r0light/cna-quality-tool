import { getBackingDataProperties, getBackingServiceProperties, getBrokerBackingServiceProperties, getComponentProperties, getDataAggregateProperties, getDeploymentMappingProperties, getEndpointProperties, getInfrastructureProperties, getLinkProperties, getNetworkProperties, getProxyBackingServiceProperties, getRequestTraceProperties, getServiceProperties, getStorageBackingServiceProperties } from "@/core/entities";
import { getDefaultAppSettings } from "@/modeling/config/appSettings";

let componentPropertyKeys = getComponentProperties().map(property => property.getKey);
let endpointPropertyKeys = getEndpointProperties().map(property => property.getKey);

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
    NETWORK = "network",
    ARTIFACT = "artifact"
};

type EntitySpec =  {
    name: string, 
    description: string, 
    relation: {type: "" | "part-of" | "is-a", target: `${ENTITIES}`; },
    symbol: string,
    formal: string
}

export const entities: {[key in ENTITIES]: EntitySpec}  = {
    "system": {
        "name": "System",
        "description": "The cloud-native application as a whole",
        "relation": {"type": "is-a", "target": ENTITIES.SYSTEM},
        "symbol": "SYS",
        "formal": "\tSYS := (C,L,I,DM,RT,DA,BD,N)"
    },
    "component": {
        "name": "Component",
        "description": "An abstract entity for representing distinguishable executable parts of the system that provide certain functionalities. It can for example be a service or a certain cloud resource. Regarding its granularity, it should, generally speaking, correspond to something that can be run as an OS process.",
        "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
        "symbol": "C",
        "formal": `\tC := (id,name,props,RDA,RBD,RN,artifacts,providedEndpoints,externalIngressProxiedBy,ingressProxiedBy,egressProxiedBy,addressResolutionBy,authenticationBy)
        props<sub>C</sub> := {${getComponentProperties().map(property => property.getKey).join(",")}}
        RDA ⊆ C ⨯ DA
        RBD ⊆ C ⨯ BD
        RN ⊆ C ⨯ N
        artifacts ⊆ A
        providedEndpoints ⊆ E
        externalIngressProxiedBy ∈ PBS
        ingressProxiedBy ∈ PBS
        egressProxiedBy ∈ PBS
        addressResolutionBy ∈ BS ∪ PBS ∪ I ∪ N
        authenticationBy ∈ BS`
        },
    "service": {
        "name": "Service",
        "description": "A component that implements a business functionality.",
        "relation": {"type": "is-a", "target": ENTITIES.COMPONENT},
        "symbol": "S",
        "formal": `\tS ⊆ C
        props<sub>S</sub> := props<sub>C</sub> ∪ {${getServiceProperties().filter(prop => !componentPropertyKeys.includes(prop.getKey)).map(property => property.getKey).join(",")}}`
    },
    "backingService": {
        "name": "Backing Service",
        "description": "A component providing general functionalities needed by services, for example, messaging, logging.",
        "relation": {"type": "is-a", "target": ENTITIES.COMPONENT},
        "symbol": "BS",
        "formal": `\tBS ⊆ C
        props<sub>BS</sub> := props<sub>C</sub> ∪ {${getBackingServiceProperties().filter(prop => !componentPropertyKeys.includes(prop.getKey)).map(property => property.getKey).join(",")}}`
    },
    "storageBackingService": {
        "name": "Storage Backing Service",
        "description": "An explicitly stateful component used to store business data, e.g., a database.",
        "relation": {"type": "is-a", "target": ENTITIES.COMPONENT},
        "symbol": "SBS",
        "formal": `\tSBS ⊆ C
        props<sub>SBS</sub> := props<sub>C</sub> ∪ {${getStorageBackingServiceProperties().filter(prop => !componentPropertyKeys.includes(prop.getKey)).map(property => property.getKey).join(",")}}`
    },
    "proxyBackingService": {
        "name": "Proxy Backing Service",
        "description": "A component which can act as a proxy for all kinds of communication (links) between other components.",
        "relation": {"type": "is-a", "target": ENTITIES.COMPONENT},
        "symbol": "PBS",
        "formal": `\tPBS ⊆ C
        props<sub>PBS</sub> := props<sub>C</sub> ∪ {${getProxyBackingServiceProperties().filter(prop => !componentPropertyKeys.includes(prop.getKey)).map(property => property.getKey).join(",")}}`
    },
    "brokerBackingService": {
        "name": "Broker Backing Service",
        "description": "A component which acts as a communication broker, for example a message broker or an event store.",
        "relation": {"type": "is-a", "target": ENTITIES.COMPONENT},
        "symbol": "BBS",
        "formal": `\tBBS ⊆ C
        props<sub>BBS</sub> := props<sub>C</sub> ∪ {${getBrokerBackingServiceProperties().filter(prop => !componentPropertyKeys.includes(prop.getKey)).map(property => property.getKey).join(",")}}`
    },
    "endpoint": {
        "name": "Endpoint",
        "description": "A communication endpoint, for example a REST endpoint, message producer/listener.",
        "relation": {"type": "part-of", "target": ENTITIES.COMPONENT},
        "symbol": "E",
        "formal": `\tE := (id,name,props,RDA,documentedBy)
        props<sub>E</sub> := {${getEndpointProperties().map(property => property.getKey).join(",")}}
        RDA ⊆ E ⨯ DA
        documentedBy ⊆ A`
    },
    "externalEndpoint": {
        "name": "External Endpoint",
        "description": "An endpoint which is explicitly publicly available.",
        "relation": {"type": "is-a", "target": ENTITIES.ENDPOINT},
        "symbol": "EE",
        "formal": "\tEE ⊆ E"
    },
    "link": {
        "name": "Link",
        "description": "A directed potential connection between a specific component and a specific endpoint of a different component. Potential in this case refers to the design time perspective, meaning that a component is implemented so that it can invoke the respective endpoint.",
        "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
        "symbol": "L",
        "formal": `\tL := (id,props,sourceComponent,targetEndpoint)
        props<sub>L</sub> := {${getLinkProperties().map(property => property.getKey).join(",")}}
        sourceComponent ∈ C
        targetEndpoint ∈ E
        targetEndpoint ∉ sourceComponent.E`
    },
    "infrastructure": {
        "name": "Infrastructure",
        "description": "The technical foundation where components are deployed, e.g., a container orchestration system.",
        "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
        "symbol": "I",
        "formal": `\tI := (id,name,props,artifacts,RBD,RN)
        props<sub>I</sub> := {${getInfrastructureProperties().map(property => property.getKey).join(",")}}
        artifacts ⊆ A
        RBD ⊆ I ⨯ BD
        RN ⊆ I ⨯ N`
    },
    "deploymentMapping": {
        "name": "Deployment Mapping",
        "description": "A connection between a component or infrastructure and its underlying infrastructure on which that component or infrastructure is deployed.",
        "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
        "symbol": "DM",
        "formal": `\tDM := (id,props,deployed,host)
        props<sub>DM</sub> := {${getDeploymentMappingProperties().map(property => property.getKey).join(",")}}
        deployed ∈ C ∪ I
        host ∈ I
        deployed ≠ host`
    },
    "requestTrace": {
        "name": "Request Trace",
        "description": "The whole resulting trace of a service invocation from the outside that means when an external endpoint is invoked. A request trace includes a collection of components and links.",
        "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
        "symbol": "RT",
        "formal": `\tRT := (id,name,props,involvedLinks,referencedEndpoint)
        props<sub>RT</sub> := {${getRequestTraceProperties().map(property => property.getKey).join(",")}}
        involvedLinks ⊆ L
        referencedEndpoint ∈ EE`
    },
    "dataAggregate": {
        "name": "Data Aggregate",
        "description": "An aggregate which needs to be persisted and is used by services, e.g., business objects.",
        "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
        "symbol": "DA",
        "formal": `\tDA := (id, name, props)
        props<sub>DA</sub> := {${getDataAggregateProperties().map(property => property.getKey).join(",")}}`
    },
    "backingData": {
        "name": "Backing Data",
        "description": "Non-business data, e.g., config values, secrets, logs, metrics",
        "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
        "symbol": "BD",
        "formal": `\tBD := (id, name, props)
        props<sub>BD</sub> := {${getBackingDataProperties().map(property => property.getKey).join(",")}}`
    },
    "network": {
        "name": "Network",
        "description": "A network or subnet which covers a range of (ip) addresses and to which components and infrastructure entities can be assigned to.",
        "relation": {"type": "part-of", "target": ENTITIES.SYSTEM},
        "symbol": "N",
        "formal": `\tN := (id, name, props)
        props<sub>N</sub> := {${getNetworkProperties().map(property => property.getKey).join(",")}}`
    },
    "artifact": {
        "name": "Artifact",
        "description": "An artifact associcated with a component or an infrastructure entity that enables the actual deployment or execution of that entity. For example, a Jar-File or a Container Image",
        "relation": {"type": "part-of", "target": ENTITIES.COMPONENT},
        "symbol": "A",
        "formal": `\tA := (id, type, props)`
    }
};

