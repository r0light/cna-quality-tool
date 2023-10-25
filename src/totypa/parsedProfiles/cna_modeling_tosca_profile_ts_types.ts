/* 
   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions 
*/

import { TOSCA_Requirement_Assignment } from "../tosca-types/template-types"
import { TOSCA_Interface, TOSCA_Artifact } from "../tosca-types/core-types"
import { ToscaDatatypesCredential, ToscaCapabilitiesNode, ToscaCapabilitiesEndpoint, ToscaCapabilitiesEndpointPublic, ToscaDatatypesNetworkNetworkInfo, ToscaDatatypesNetworkPortInfo, ToscaCapabilitiesCompute, ToscaCapabilitiesOperatingSystem, ToscaCapabilitiesEndpointAdmin, ToscaCapabilitiesScalable, ToscaCapabilitiesNetworkBindable, ToscaCapabilitiesAttachment } from './tosca_simple_profile_for_yaml_v1_3_ts_types'

export type CnaQualityModelCapabilitiesDataStorage = string
export type CnaQualityModelEntitiesConnectsToLink = {
    properties: {
    relation_type: string,
    credential?: ToscaDatatypesCredential,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
}
export type CnaQualityModelRelationshipsProvidesEndpoint = {
    attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
}
export type CnaQualityModelEntitiesRootComponent = {
    properties: {
    managed?: string,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    feature: ToscaCapabilitiesNode,
},
requirements: {host: TOSCA_Requirement_Assignment | string} | {provides_endpoint: TOSCA_Requirement_Assignment | string} | {provides_external_endpoint: TOSCA_Requirement_Assignment | string} | {endpoint_link: TOSCA_Requirement_Assignment | string} | {uses_data: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
},
}
export type CnaQualityModelEntitiesSoftwareComponentService = {
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
requirements: {provides_endpoint: TOSCA_Requirement_Assignment | string} | {provides_external_endpoint: TOSCA_Requirement_Assignment | string} | {endpoint_link: TOSCA_Requirement_Assignment | string} | {uses_data: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
},
}
export type CnaQualityModelEntitiesBackingService = {
    properties: {
    providedFunctionality?: string,
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    feature: ToscaCapabilitiesNode,
},
requirements: {host: TOSCA_Requirement_Assignment | string} | {provides_endpoint: TOSCA_Requirement_Assignment | string} | {provides_external_endpoint: TOSCA_Requirement_Assignment | string} | {endpoint_link: TOSCA_Requirement_Assignment | string} | {uses_data: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
},
}
export type CnaQualityModelEntitiesEndpoint = {
    attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    endpoint: ToscaCapabilitiesEndpoint,
    feature: ToscaCapabilitiesNode,
},
requirements: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
},
}
export type CnaQualityModelEntitiesEndpointExternal = {
    attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    external_endpoint: ToscaCapabilitiesEndpointPublic,
    feature: ToscaCapabilitiesNode,
},
requirements: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
},
}
export type CnaQualityModelEntitiesComputeInfrastructure = {
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
requirements: {host: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {local_storage: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
},
}
export type CnaQualityModelEntitiesBackingData = {
    properties: {
    included_data: {[mapKey: string]: string},
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    provided_data: ToscaCapabilitiesAttachment,
    feature: ToscaCapabilitiesNode,
},
requirements: {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
},
}
export type CnaQualityModelEntitiesDataAggregate = {
    attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    provided_data: ToscaCapabilitiesAttachment,
    feature: ToscaCapabilitiesNode,
},
requirements: {persistence: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
},
}
export type CnaQualityModelEntitiesDBMSStorageService = {
    properties: {
    name: string,
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
    endpoint: ToscaCapabilitiesEndpoint,
    external_endpoint: ToscaCapabilitiesEndpointPublic,
    persist_data: CnaQualityModelCapabilitiesDataStorage,
    host: ToscaCapabilitiesCompute,
    feature: ToscaCapabilitiesNode,
},
requirements: {endpoint_link: TOSCA_Requirement_Assignment | string} | {uses_data: TOSCA_Requirement_Assignment | string} | {uses_backing_data: TOSCA_Requirement_Assignment | string} | {host: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
},
}
export type CnaQualityModelEntitiesRequestTrace = {
    properties: {
    referred_endpoint: string,
    nodes?: string[],
    involved_links: string[],
},
attributes: {
    tosca_id: string,
    tosca_name: string,
    state: string,
},
capabilities: {
    feature: ToscaCapabilitiesNode,
},
requirements: {external_endpoint: TOSCA_Requirement_Assignment | string} | {dependency: TOSCA_Requirement_Assignment | string}[],
interfaces: {
    Standard: TOSCA_Interface,
},
}