/* 
   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions 
*/

import { TOSCA_Requirement_Assignment } from "../tosca-types/template-types"
import { TOSCA_Metadata, TOSCA_Interface, TOSCA_Artifact } from "../tosca-types/core-types"
import { ToscaDatatypesCredential, ToscaCapabilitiesNode, ToscaCapabilitiesEndpoint, ToscaCapabilitiesEndpointPublic, ToscaDatatypesNetworkNetworkInfo, ToscaDatatypesNetworkPortInfo, ToscaCapabilitiesCompute, ToscaCapabilitiesOperatingSystem, ToscaCapabilitiesEndpointAdmin, ToscaCapabilitiesScalable, ToscaCapabilitiesNetworkBindable, ToscaCapabilitiesAttachment } from './tosca_simple_profile_for_yaml_v1_3_ts_types'

export type CnaQualityModelCapabilitiesDataStorage = any
export type CnaQualityModelEntitiesConnectsToLink = {
    properties?: {
    relation_type: string,
    credential?: ToscaDatatypesCredential,
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
export type CnaQualityModelRelationshipsAttachesToData = {
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
export type CnaQualityModelEntitiesRootComponent = {
    type: "cna.qualityModel.entities.Root.Component",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    managed?: string,
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    feature?: ToscaCapabilitiesNode,
},
requirements?: {host: TOSCA_Requirement_Assignment | string} | {provides_endpoint: TOSCA_Requirement_Assignment | string} | {provides_external_endpoint: TOSCA_Requirement_Assignment | string} | {endpoint_link: TOSCA_Requirement_Assignment | string} | {uses_data: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces?: {
    Standard?: TOSCA_Interface,
    [interfaceKey: string]: TOSCA_Interface
},
artifacts?: {
    [artifactKey: string]: TOSCA_Artifact
},
}
export type CnaQualityModelEntitiesSoftwareComponentService = {
    type: "cna.qualityModel.entities.SoftwareComponent.Service",
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
requirements?: {provides_endpoint: TOSCA_Requirement_Assignment | string} | {provides_external_endpoint: TOSCA_Requirement_Assignment | string} | {endpoint_link: TOSCA_Requirement_Assignment | string} | {uses_data: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
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
},
attributes?: {
    tosca_id?: string,
    tosca_name?: string,
    state?: string,
},
capabilities?: {
    feature?: ToscaCapabilitiesNode,
},
requirements?: {host: TOSCA_Requirement_Assignment | string} | {provides_endpoint: TOSCA_Requirement_Assignment | string} | {provides_external_endpoint: TOSCA_Requirement_Assignment | string} | {endpoint_link: TOSCA_Requirement_Assignment | string} | {uses_data: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
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
requirements?: {dependency: TOSCA_Requirement_Assignment | string}[],
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
requirements?: {dependency: TOSCA_Requirement_Assignment | string}[],
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
export type CnaQualityModelEntitiesDBMSStorageService = {
    type: "cna.qualityModel.entities.DBMS.StorageService",
                       metadata?: TOSCA_Metadata,
                       properties?: {
    name: string,
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
    endpoint?: ToscaCapabilitiesEndpoint,
    external_endpoint?: ToscaCapabilitiesEndpointPublic,
    persist_data?: CnaQualityModelCapabilitiesDataStorage,
    host?: ToscaCapabilitiesCompute,
    feature?: ToscaCapabilitiesNode,
},
requirements?: {endpoint_link: TOSCA_Requirement_Assignment | string} | {uses_data: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
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