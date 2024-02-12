/* 
   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions 
*/

import { TOSCA_Requirement_Assignment } from "../tosca-types/template-types.js"
import { TOSCA_Metadata, TOSCA_Interface, TOSCA_Artifact } from "../tosca-types/core-types.js"

export type ToscaDatatypesRoot = any
export type ToscaDatatypesJson = string
export type ToscaDatatypesXml = string
export type ToscaDatatypesCredential = {
    properties: {
    protocol?: string,
    token_type?: string,
    token?: string,
    keys?: {[mapKey: string]: string},
    user?: string,
    }
}
export type ToscaDatatypesTimeInterval = {
    properties: {
    start_time: string,
    end_time: string,
    }
}
export type ToscaDatatypesNetworkNetworkInfo = {
    properties: {
    network_name?: string,
    network_id?: string,
    addresses?: string[],
    }
}
export type ToscaDatatypesNetworkPortInfo = {
    properties: {
    port_name?: string,
    port_id?: string,
    network_id?: string,
    mac_address?: string,
    addresses?: string[],
    }
}
export type ToscaDatatypesNetworkPortDef = number
export type ToscaDatatypesNetworkPortSpec = {
    properties: {
    protocol: string,
    source?: ToscaDatatypesNetworkPortDef,
    source_range?: number[],
    target?: ToscaDatatypesNetworkPortDef,
    target_range?: number[],
    }
}
export type ToscaInterfacesRoot = object
export type ToscaInterfacesNodeLifecycleStandard = object
export type ToscaInterfacesRelationshipConfigure = object
export type ToscaArtifactsRoot = object
export type ToscaArtifactsFile = object
export type ToscaArtifactsDeployment = object
export type ToscaArtifactsDeploymentImage = object
export type ToscaArtifactsDeploymentImageVM = object
export type ToscaArtifactsImplementation = object
export type ToscaArtifactsImplementationBash = object
export type ToscaArtifactsImplementationPython = object
export type ToscaArtifactsTemplate = object
export type ToscaCapabilitiesRoot = any
export type ToscaCapabilitiesNode = any
export type ToscaCapabilitiesContainer = any
export type ToscaCapabilitiesCompute = {
    properties?: {
    name?: string,
    num_cpus?: number,
    cpu_frequency?: string,
    disk_size?: string,
    mem_size?: string,
},
}
export type ToscaCapabilitiesNetwork = {
    properties?: {
    name?: string,
},
}
export type ToscaCapabilitiesStorage = {
    properties?: {
    name?: string,
},
}
export type ToscaCapabilitiesEndpoint = {
    properties?: {
    protocol?: string,
    port?: ToscaDatatypesNetworkPortDef,
    secure?: boolean,
    url_path?: string,
    port_name?: string,
    network_name?: string,
    initiator?: string,
    ports?: {[mapKey: string]: ToscaDatatypesNetworkPortSpec},
},
attributes?: {
    ip_address?: string,
},
}
export type ToscaCapabilitiesEndpointPublic = {
    properties?: {
    network_name?: string,
    floating?: boolean,
    dns_name?: string,
    protocol?: string,
    port?: ToscaDatatypesNetworkPortDef,
    secure?: boolean,
    url_path?: string,
    port_name?: string,
    initiator?: string,
    ports?: {[mapKey: string]: ToscaDatatypesNetworkPortSpec},
},
attributes?: {
    ip_address?: string,
},
}
export type ToscaCapabilitiesEndpointAdmin = {
    properties?: {
    secure?: boolean,
    protocol?: string,
    port?: ToscaDatatypesNetworkPortDef,
    url_path?: string,
    port_name?: string,
    network_name?: string,
    initiator?: string,
    ports?: {[mapKey: string]: ToscaDatatypesNetworkPortSpec},
},
attributes?: {
    ip_address?: string,
},
}
export type ToscaCapabilitiesEndpointDatabase = {
    properties?: {
    protocol?: string,
    port?: ToscaDatatypesNetworkPortDef,
    secure?: boolean,
    url_path?: string,
    port_name?: string,
    network_name?: string,
    initiator?: string,
    ports?: {[mapKey: string]: ToscaDatatypesNetworkPortSpec},
},
attributes?: {
    ip_address?: string,
},
}
export type ToscaCapabilitiesAttachment = any
export type ToscaCapabilitiesOperatingSystem = {
    properties?: {
    architecture?: string,
    type?: string,
    distribution?: string,
    version?: string,
},
}
export type ToscaCapabilitiesScalable = {
    properties?: {
    min_instances?: number,
    max_instances?: number,
    default_instances?: number,
},
}
export type ToscaCapabilitiesNetworkBindable = any
export type ToscaCapabilitiesNetworkLinkable = any
export type ToscaRelationshipsRoot = {
    attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
}
export type ToscaRelationshipsDependsOn = {
    attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
}
export type ToscaRelationshipsHostedOn = {
    attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
}
export type ToscaRelationshipsConnectsTo = {
    properties?: {
    credential?: ToscaDatatypesCredential,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
}
export type ToscaRelationshipsAttachesTo = {
    properties?: {
    location?: string,
    device?: string,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
}
export type ToscaRelationshipsRoutesTo = {
    properties?: {
    credential?: ToscaDatatypesCredential,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
}
export type ToscaRelationshipsNetworkLinksTo = {
    attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
}
export type ToscaRelationshipsNetworkBindsTo = {
    attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
}
export type ToscaNodesRoot = {
    type: "tosca.nodes.Root",
                       metadata?: TOSCA_Metadata,
                       attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    feature?: ToscaCapabilitiesNode,
},
requirements?: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesAbstractCompute = {
    type: "tosca.nodes.Abstract.Compute",
                       metadata?: TOSCA_Metadata,
                       attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    host?: ToscaCapabilitiesCompute,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesCompute = {
    type: "tosca.nodes.Compute",
                       metadata?: TOSCA_Metadata,
                       attributes?: {
    private_address?: string,
    public_address?: string,
    networks?: {[mapKey: string]: ToscaDatatypesNetworkNetworkInfo},
    ports?: {[mapKey: string]: ToscaDatatypesNetworkPortInfo},
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    host?: ToscaCapabilitiesCompute,
    os?: ToscaCapabilitiesOperatingSystem,
    endpoint?: ToscaCapabilitiesEndpointAdmin,
    scalable?: ToscaCapabilitiesScalable,
    binding?: ToscaCapabilitiesNetworkBindable,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {local_storage: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesSoftwareComponent = {
    type: "tosca.nodes.SoftwareComponent",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    component_version?: string,
    admin_credential?: ToscaDatatypesCredential,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    feature?: ToscaCapabilitiesNode,
},
requirements?: {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesWebServer = {
    type: "tosca.nodes.WebServer",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    component_version?: string,
    admin_credential?: ToscaDatatypesCredential,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    data_endpoint?: ToscaCapabilitiesEndpoint,
    admin_endpoint?: ToscaCapabilitiesEndpointAdmin,
    host?: ToscaCapabilitiesCompute,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesWebApplication = {
    type: "tosca.nodes.WebApplication",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    context_root?: string,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    app_endpoint?: ToscaCapabilitiesEndpoint,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesDBMS = {
    type: "tosca.nodes.DBMS",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    root_password?: string,
    port?: number,
    component_version?: string,
    admin_credential?: ToscaDatatypesCredential,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    host?: ToscaCapabilitiesCompute,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesDatabase = {
    type: "tosca.nodes.Database",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    name: string,
    port?: number,
    user?: string,
    password?: string,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    database_endpoint?: ToscaCapabilitiesEndpointDatabase,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesAbstractStorage = {
    type: "tosca.nodes.Abstract.Storage",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    name?: string,
    size?: string,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    feature?: ToscaCapabilitiesNode,
},
requirements?: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesStorageObjectStorage = {
    type: "tosca.nodes.Storage.ObjectStorage",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    maxsize?: string,
    name?: string,
    size?: string,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    storage_endpoint?: ToscaCapabilitiesEndpoint,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesStorageBlockStorage = {
    type: "tosca.nodes.Storage.BlockStorage",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    size?: string,
    volume_id?: string,
    snapshot_id?: string,
    name?: string,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    attachment?: ToscaCapabilitiesAttachment,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesContainerRuntime = {
    type: "tosca.nodes.Container.Runtime",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    component_version?: string,
    admin_credential?: ToscaDatatypesCredential,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    host?: ToscaCapabilitiesCompute,
    scalable?: ToscaCapabilitiesScalable,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesContainerApplication = {
    type: "tosca.nodes.Container.Application",
                       metadata?: TOSCA_Metadata,
                       attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    feature?: ToscaCapabilitiesNode,
},
requirements?: {host: TOSCA_Requirement_Assignment | string} | {storage: TOSCA_Requirement_Assignment | string} | {network: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesLoadBalancer = {
    type: "tosca.nodes.LoadBalancer",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    algorithm?: string,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    client?: ToscaCapabilitiesEndpointPublic,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {application: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesNetworkNetwork = {
    type: "tosca.nodes.network.Network",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    ip_version?: number,
    cidr?: string,
    start_ip?: string,
    end_ip?: string,
    gateway_ip?: string,
    network_name?: string,
    network_id?: string,
    segmentation_id?: string,
    network_type?: string,
    physical_network?: string,
    dhcp_enabled?: boolean,
},
attributes?: {
    segmentation_id?: string,
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    link?: ToscaCapabilitiesNetworkLinkable,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesNetworkPort = {
    type: "tosca.nodes.network.Port",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    ip_address?: string,
    order: number,
    is_default?: boolean,
    ip_range_start?: string,
    ip_range_end?: string,
},
attributes?: {
    ip_address?: string,
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    feature?: ToscaCapabilitiesNode,
},
requirements?: {link: TOSCA_Requirement_Assignment | string} | {binding: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}