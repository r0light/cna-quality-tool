import type { TOSCA_Metadata, TOSCA_Property, TOSCA_Attribute, TOSCA_Interface, TOSCA_Property_Schema, TOSCA_Operation, TOSCA_Notification, TOSCA_Trigger } from "./core-types"


// 3.7.1 Entity Type Schema
export type TOSCA_Entity = {
    derived_from?: string,
    version?: string,
    metadata?: TOSCA_Metadata,
    description?: string
}

// 3.7.2 Capability definition / 3.7.7 Capability Type
export type TOSCA_Capability = {
    type?: string,
    description?: string,
    derived_from?: string,
    properties?: {
        [propertyKey: string]: TOSCA_Property
    }
    attributes?: {
        [attributeKey: string]: TOSCA_Attribute,
    }
    valid_source_types?: string[],
    occurrences?: (string | number)[]
}

// 3.7.3 Requirement definition / 3.7.8 Requirement Type
export type TOSCA_Requirement = {
    capability: string,
    node?: string,
    relationship?: string | { type: string, interfaces: { [interfaceKey: string]: TOSCA_Interface } }
    occurrences?: (string| number)[],
    description?: string
}

// 3.7.4 Artifact Type
export type TOSCA_Artifact = {
    derived_from?: string,
    version?: string,
    metadata?: TOSCA_Metadata,
    description?: string
    mime_type?: string,
    file_ext?: string[]
    properties?: {
        [propertyKey: string]: TOSCA_Property
    }
}

// 3.7.5 Interface Type
export type TOSCA_Interface2 = {
    derived_from?: string,
    version?: string,
    metadata?: TOSCA_Metadata,
    description?: string
    inputs?: { [propertyKey: string]: TOSCA_Property_Schema },
    operations?: {
        [operationKey: string]: TOSCA_Operation
    }
    notifications?: {
        [notificationKey: string]: TOSCA_Notification
    }
}

// 3.7.9 Node Type
export type TOSCA_Node = {
    derived_from?: string,
    version?: string,
    metadata?: TOSCA_Metadata,
    description?: string
    properties?: {
        [propertyKey: string]: TOSCA_Property
    },
    attributes?: {
        [attributeKey: string]: TOSCA_Attribute
    },
    requirements?: {
        [requirementKey: string]: TOSCA_Requirement
    }[],
    capabilities?: {
        [capabilityKey: string]: TOSCA_Capability | string
    },
    interfaces?: {
        [interfaceKey: string]: TOSCA_Interface
    },
    artifacts?: {
        [artifactKey: string]: TOSCA_Artifact
    }
}

// 3.7.10 Relationship Type
export type TOSCA_Relationship = {
    derived_from?: string,
    version?: string,
    metadata?: TOSCA_Metadata,
    description?: string,
    properties?: {
        [propertyKey: string]: TOSCA_Property
    },
    attributes?: {
        [attributeKey: string]: TOSCA_Attribute
    },
    interfaces?: {
        [interfaceKey: string]: TOSCA_Interface
    },
    valid_target_types?: string[]
}

// 3.7.11 Group Type
export type TOSCA_Group = {
    derived_from?: string,
    version?: string,
    metadata?: TOSCA_Metadata,
    description?: string,
    properties?: {
        [propertyKey: string]: TOSCA_Property
    },
    attributes?: {
        [attributeKey: string]: TOSCA_Attribute
    },
    members?: string[]
}

// 3.7.12 Policy Type
export type TOSCA_Policy = {
    derived_from?: string,
    version?: string,
    metadata?: TOSCA_Metadata,
    description?: string,
    properties?: {
        [propertyKey: string]: TOSCA_Property
    },
    targets?: string[],
    triggers?: {
        [triggerKey: string]: TOSCA_Trigger
    }
}

