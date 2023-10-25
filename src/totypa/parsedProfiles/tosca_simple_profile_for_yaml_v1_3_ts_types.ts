/* 
   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions 
*/

import { TOSCA_Requirement_Assignment } from "../tosca-types/template-types"
import { TOSCA_Interface, TOSCA_Artifact } from "../tosca-types/core-types"

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
export type ToscaCapabilitiesRoot = string
export type ToscaCapabilitiesNode = string
export type ToscaCapabilitiesContainer = string
export type ToscaCapabilitiesCompute = {
    properties: {
    name?: string,
    num_cpus?: number,
    cpu_frequency?: string,
    disk_size?: string,
    mem_size?: string,
},
}
export type ToscaCapabilitiesNetwork = {
    properties: {
    name?: string,
},
}
export type ToscaCapabilitiesStorage = {
    properties: {
    name?: string,
},
}
export type ToscaCapabilitiesEndpoint = {
    properties: {
    protocol?: string,
    port?: ToscaDatatypesNetworkPortDef,
    secure?: boolean,
    url_path?: string,
    port_name?: string,
    network_name?: string,
    initiator?: string,
    ports?: {[mapKey: string]: ToscaDatatypesNetworkPortSpec},
},
attributes: {
    ip_address: string,
},
}
export type ToscaCapabilitiesEndpointPublic = {
    properties: {
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
attributes: {
    ip_address: string,
},
}
export type ToscaCapabilitiesEndpointAdmin = {
    properties: {
    secure?: boolean,
    protocol?: string,
    port?: ToscaDatatypesNetworkPortDef,
    url_path?: string,
    port_name?: string,
    network_name?: string,
    initiator?: string,
    ports?: {[mapKey: string]: ToscaDatatypesNetworkPortSpec},
},
attributes: {
    ip_address: string,
},
}
export type ToscaCapabilitiesEndpointDatabase = {
    properties: {
    protocol?: string,
    port?: ToscaDatatypesNetworkPortDef,
    secure?: boolean,
    url_path?: string,
    port_name?: string,
    network_name?: string,
    initiator?: string,
    ports?: {[mapKey: string]: ToscaDatatypesNetworkPortSpec},
},
attributes: {
    ip_address: string,
},
}
export type ToscaCapabilitiesAttachment = string
export type ToscaCapabilitiesOperatingSystem = {
    properties: {
    architecture?: string,
    type?: string,
    distribution?: string,
    version?: string,
},
}
export type ToscaCapabilitiesScalable = {
    properties: {
    min_instances?: number,
    max_instances?: number,
    default_instances?: number,
},
}
export type ToscaCapabilitiesNetworkBindable = string
export type ToscaCapabilitiesNetworkLinkable = string
export type ToscaRelationshipsRoot = {
    attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
}
export type ToscaRelationshipsDependsOn = {
    attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
}
export type ToscaRelationshipsHostedOn = {
    attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
}
export type ToscaRelationshipsConnectsTo = {
    properties: {
    credential?: ToscaDatatypesCredential,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
}
export type ToscaRelationshipsAttachesTo = {
    properties: {
    location?: string,
    device?: string,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
}
export type ToscaRelationshipsRoutesTo = {
    properties: {
    credential?: ToscaDatatypesCredential,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
}
export type ToscaRelationshipsNetworkLinksTo = {
    attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
}
export type ToscaRelationshipsNetworkBindsTo = {
    attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
}
export type ToscaNodesRoot = {
    attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    feature: ToscaCapabilitiesNode,
},
requirements: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesAbstractCompute = {
    attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    host: ToscaCapabilitiesCompute,
    feature: ToscaCapabilitiesNode,
},
requirements: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesCompute = {
    attributes: {
    private_address: string,
    public_address: string,
    networks: {[mapKey: string]: ToscaDatatypesNetworkNetworkInfo},
    ports: {[mapKey: string]: ToscaDatatypesNetworkPortInfo},
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    host: ToscaCapabilitiesCompute,
    os: ToscaCapabilitiesOperatingSystem,
    endpoint: ToscaCapabilitiesEndpointAdmin,
    scalable: ToscaCapabilitiesScalable,
    binding: ToscaCapabilitiesNetworkBindable,
    feature: ToscaCapabilitiesNode,
},
requirements: {local_storage: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesSoftwareComponent = {
    properties: {
    component_version?: string,
    admin_credential?: ToscaDatatypesCredential,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    feature: ToscaCapabilitiesNode,
},
requirements: {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesWebServer = {
    properties: {
    component_version?: string,
    admin_credential?: ToscaDatatypesCredential,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    data_endpoint: ToscaCapabilitiesEndpoint,
    admin_endpoint: ToscaCapabilitiesEndpointAdmin,
    host: ToscaCapabilitiesCompute,
    feature: ToscaCapabilitiesNode,
},
requirements: {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesWebApplication = {
    properties: {
    context_root?: string,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    app_endpoint: ToscaCapabilitiesEndpoint,
    feature: ToscaCapabilitiesNode,
},
requirements: {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesDBMS = {
    properties: {
    root_password?: string,
    port?: number,
    component_version?: string,
    admin_credential?: ToscaDatatypesCredential,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    host: ToscaCapabilitiesCompute,
    feature: ToscaCapabilitiesNode,
},
requirements: {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesDatabase = {
    properties: {
    name: string,
    port?: number,
    user?: string,
    password?: string,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    database_endpoint: ToscaCapabilitiesEndpointDatabase,
    feature: ToscaCapabilitiesNode,
},
requirements: {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesAbstractStorage = {
    properties: {
    name?: string,
    size?: string,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    feature: ToscaCapabilitiesNode,
},
requirements: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesStorageObjectStorage = {
    properties: {
    maxsize?: string,
    name?: string,
    size?: string,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    storage_endpoint: ToscaCapabilitiesEndpoint,
    feature: ToscaCapabilitiesNode,
},
requirements: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesStorageBlockStorage = {
    properties: {
    size?: string,
    volume_id?: string,
    snapshot_id?: string,
    name?: string,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    attachment: ToscaCapabilitiesAttachment,
    feature: ToscaCapabilitiesNode,
},
requirements: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesContainerRuntime = {
    properties: {
    component_version?: string,
    admin_credential?: ToscaDatatypesCredential,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    host: ToscaCapabilitiesCompute,
    scalable: ToscaCapabilitiesScalable,
    feature: ToscaCapabilitiesNode,
},
requirements: {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesContainerApplication = {
    attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    feature: ToscaCapabilitiesNode,
},
requirements: {host: TOSCA_Requirement_Assignment | string} | {storage: TOSCA_Requirement_Assignment | string} | {network: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesLoadBalancer = {
    properties: {
    algorithm?: string,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    client: ToscaCapabilitiesEndpointPublic,
    feature: ToscaCapabilitiesNode,
},
requirements: {application: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesNetworkNetwork = {
    properties: {
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
attributes: {
    segmentation_id: string,
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    link: ToscaCapabilitiesNetworkLinkable,
    feature: ToscaCapabilitiesNode,
},
requirements: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type ToscaNodesNetworkPort = {
    properties: {
    ip_address?: string,
    order: number,
    is_default?: boolean,
    ip_range_start?: string,
    ip_range_end?: string,
},
attributes: {
    ip_address: string,
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    feature: ToscaCapabilitiesNode,
},
requirements: {link: TOSCA_Requirement_Assignment | string} | {binding: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts: {
    [artifactKey: string]: TOSCA_Artifact
},
}