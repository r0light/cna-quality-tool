/* 
   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions 
*/

import { TOSCA_Requirement_Assignment } from "../tosca-types/template-types.js"
import { TOSCA_Metadata, TOSCA_Interface, TOSCA_Artifact } from "../tosca-types/core-types.js"
import { ToscaDatatypesCredential, ToscaCapabilitiesNode, ToscaDatatypesNetworkNetworkInfo, ToscaDatatypesNetworkPortInfo, ToscaCapabilitiesCompute, ToscaCapabilitiesOperatingSystem, ToscaCapabilitiesEndpointAdmin, ToscaCapabilitiesScalable, ToscaCapabilitiesNetworkBindable, ToscaCapabilitiesEndpoint, ToscaCapabilitiesEndpointPublic, ToscaCapabilitiesAttachment } from './tosca_simple_profile_for_yaml_v1_3_ts_types.js'

export type CnaQualityModelCapabilitiesDataStorage = any
export type CnaQualityModelEntitiesConnectsToLink = {
    properties?: {
    relation_type: string,
    timeout: number,
    credential?: ToscaDatatypesCredential,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
}
export type CnaQualityModelEntitiesHostedOnDeploymentMapping = {
    properties?: {
    deployment: string,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
}
export type CnaQualityModelRelationshipsProvidesEndpoint = {
    attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
}
export type CnaQualityModelRelationshipsAttachesToDataAggregate = {
    properties?: {
    location?: string,
    usage_relation: string,
    sharding_level: number,
    device?: string,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
}
export type CnaQualityModelRelationshipsAttachesToBackingData = {
    properties?: {
    location?: string,
    usage_relation: string,
    device?: string,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
}
export type CnaQualityModelEntitiesComponent = {
    type: "cna.qualityModel.entities.Component",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    managed: boolean,
    software_type: string,
    stateless: boolean,
    artifact: string,
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
requirements?: {host: TOSCA_Requirement_Assignment | string} | {provides_endpoint: TOSCA_Requirement_Assignment | string} | {provides_external_endpoint: TOSCA_Requirement_Assignment | string} | {endpoint_link: TOSCA_Requirement_Assignment | string} | {uses_data: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type CnaQualityModelEntitiesService = {
    type: "cna.qualityModel.entities.Service",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    replicas: number,
    managed: boolean,
    software_type: string,
    stateless: boolean,
    artifact: string,
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
requirements?: {host: TOSCA_Requirement_Assignment | string} | {provides_endpoint: TOSCA_Requirement_Assignment | string} | {provides_external_endpoint: TOSCA_Requirement_Assignment | string} | {endpoint_link: TOSCA_Requirement_Assignment | string} | {uses_data: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type CnaQualityModelEntitiesBackingService = {
    type: "cna.qualityModel.entities.BackingService",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    providedFunctionality?: string,
    managed: boolean,
    software_type: string,
    stateless: boolean,
    artifact: string,
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
requirements?: {host: TOSCA_Requirement_Assignment | string} | {provides_endpoint: TOSCA_Requirement_Assignment | string} | {provides_external_endpoint: TOSCA_Requirement_Assignment | string} | {endpoint_link: TOSCA_Requirement_Assignment | string} | {uses_data: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type CnaQualityModelEntitiesStorageBackingService = {
    type: "cna.qualityModel.entities.StorageBackingService",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    name: string,
    stateless: boolean,
    replicas: number,
    shards: number,
    managed: boolean,
    software_type: string,
    artifact: string,
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
requirements?: {host: TOSCA_Requirement_Assignment | string} | {provides_endpoint: TOSCA_Requirement_Assignment | string} | {provides_external_endpoint: TOSCA_Requirement_Assignment | string} | {endpoint_link: TOSCA_Requirement_Assignment | string} | {uses_data: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type CnaQualityModelEntitiesComputeInfrastructure = {
    type: "cna.qualityModel.entities.Compute.Infrastructure",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    kind: string,
    environment_access?: string,
    maintenance?: string,
    provisioning?: string,
    supported_artifacts?: string[],
    availability_zone: string,
    region: string,
},
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
requirements?: {host: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {local_storage: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type CnaQualityModelEntitiesEndpoint = {
    type: "cna.qualityModel.entities.Endpoint",
                       metadata?: TOSCA_Metadata,
                       attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    endpoint?: ToscaCapabilitiesEndpoint,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {uses_data: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type CnaQualityModelEntitiesEndpointExternal = {
    type: "cna.qualityModel.entities.Endpoint.External",
                       metadata?: TOSCA_Metadata,
                       attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    external_endpoint?: ToscaCapabilitiesEndpointPublic,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {uses_data: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type CnaQualityModelEntitiesBackingData = {
    type: "cna.qualityModel.entities.BackingData",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    included_data: {[mapKey: string]: string},
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    provides_data?: ToscaCapabilitiesAttachment,
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
export type CnaQualityModelEntitiesDataAggregate = {
    type: "cna.qualityModel.entities.DataAggregate",
                       metadata?: TOSCA_Metadata,
                       attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    provides_data?: ToscaCapabilitiesAttachment,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {persistence: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type CnaQualityModelEntitiesRequestTrace = {
    type: "cna.qualityModel.entities.RequestTrace",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    referred_endpoint: string,
    nodes?: string[],
    involved_links: string[],
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    feature?: ToscaCapabilitiesNode,
},
requirements?: {external_endpoint: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}