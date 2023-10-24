/* 
   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions 
*/

export type CnaQualityModelCapabilitiesDataStorage = string
export type CnaQualityModelEntitiesConnectsToLink = {
    properties: {
    relation_type: string,
    credential?: {
    properties: {
    protocol?: string,
    token_type?: string,
    token?: string,
    keys?: {[mapKey: string]: string},
    user?: string,
    }
},
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