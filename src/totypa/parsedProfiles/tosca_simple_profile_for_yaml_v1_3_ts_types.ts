/* 
   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions 
*/

export type ToscaDatatypesRoot = any
export type ToscaDatatypesJson = string
export type ToscaDatatypesXml = string
export type ToscaDatatypesCredential = {
    properties: {
        protocol?: string,
        token_type?: string,
        token?: string,
        keys?: { [mapKey: string]: string },
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
        ports?: { [mapKey: string]: ToscaDatatypesNetworkPortSpec },
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
        ports?: { [mapKey: string]: ToscaDatatypesNetworkPortSpec },
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
        ports?: { [mapKey: string]: ToscaDatatypesNetworkPortSpec },
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
        ports?: { [mapKey: string]: ToscaDatatypesNetworkPortSpec },
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