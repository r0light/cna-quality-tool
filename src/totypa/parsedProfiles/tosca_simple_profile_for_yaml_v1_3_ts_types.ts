/* 
   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions 
*/

export type ToscaDatatypesRoot = any
export type ToscaDatatypesJson = string
export type ToscaDatatypesXml = string
export type ToscaDatatypesCredential = {
    protocol?: string,
    token_type?: string,
    token?: string,
    keys?: {[mapKey: string]: string},
    user?: string,
}
export type ToscaDatatypesTimeInterval = {
    start_time: string,
    end_time: string,
}
export type ToscaDatatypesNetworkNetworkInfo = {
    network_name?: string,
    network_id?: string,
    addresses?: string[],
}
export type ToscaDatatypesNetworkPortInfo = {
    port_name?: string,
    port_id?: string,
    network_id?: string,
    mac_address?: string,
    addresses?: string[],
}
export type ToscaDatatypesNetworkPortDef = number
export type ToscaDatatypesNetworkPortSpec = {
    protocol: string,
    source?: number,
    source_range?: number[],
    target?: number,
    target_range?: number[],
}