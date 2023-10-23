import { TOSCA_Artifact_Definition_Key, TOSCA_Artifact_Instance_Key, TOSCA_Attribute_Definition_Key, TOSCA_Capability_Definition_Key, TOSCA_Capability_Instance_Key, TOSCA_Group_Template_Key, TOSCA_Group_Type_Key, TOSCA_Interface_Definition_Key, TOSCA_Interface_Template_Key, TOSCA_Node_Type_Key, TOSCA_Notification_Definition_Key, TOSCA_Operation_Definition_Key, TOSCA_Policy_Type_Key, TOSCA_Property_Definition_Key, TOSCA_Relationship_Type_Key, TOSCA_Requirement_Definition_Key, TOSCA_Requirement_Instance_Key, TOSCA_Trigger_Type_Key } from "./alias-types"
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
    type?: TOSCA_Capability_Definition_Key,
    description?: string,
    derived_from?: TOSCA_Capability_Definition_Key,
    properties?: {
        [propertyKey: TOSCA_Property_Definition_Key]: TOSCA_Property
    }
    attributes?: {
        [attributeKey: TOSCA_Attribute_Definition_Key]: TOSCA_Attribute,
    }
    valid_source_types?: TOSCA_Node_Type_Key[],
    occurrences?: (string | number)[]
}

// 3.7.3 Requirement definition / 3.7.8 Requirement Type
export type TOSCA_Requirement = {
    capability: TOSCA_Capability_Definition_Key,
    node?: TOSCA_Node_Type_Key,
    relationship?: TOSCA_Relationship_Type_Key | { type: TOSCA_Relationship_Type_Key, interfaces: { [interfaceKey: TOSCA_Interface_Definition_Key]: TOSCA_Interface } }
    occurrences?: (string| number)[],
    description?: string
}

// 3.7.4 Artifact Type
export type TOSCA_Artifact = {
    derived_from?: TOSCA_Attribute_Definition_Key,
    version?: string,
    metadata?: TOSCA_Metadata,
    description?: string
    mime_type?: string,
    file_ext?: string[]
    properties?: {
        [propertyKey: TOSCA_Property_Definition_Key]: TOSCA_Property
    }
}

// 3.7.5 Interface Type
export type TOSCA_Interface2 = {
    derived_from?: TOSCA_Interface_Definition_Key,
    version?: string,
    metadata?: TOSCA_Metadata,
    description?: string
    inputs?: { [propertyKey: TOSCA_Property_Definition_Key]: TOSCA_Property_Schema },
    operations?: {
        [operationKey: TOSCA_Operation_Definition_Key]: TOSCA_Operation
    }
    notifications?: {
        [notificationKey: TOSCA_Notification_Definition_Key]: TOSCA_Notification
    }
}

// 3.7.9 Node Type
export type TOSCA_Node = {
    derived_from?: TOSCA_Node_Type_Key,
    version?: string,
    metadata?: TOSCA_Metadata,
    description?: string
    properties?: {
        [propertyKey: TOSCA_Property_Definition_Key]: TOSCA_Property
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Definition_Key]: TOSCA_Attribute
    },
    requirements?: {
        [requirementKey: TOSCA_Requirement_Instance_Key]: TOSCA_Requirement | TOSCA_Requirement_Definition_Key
    }[],
    capabilities?: {
        [capabilityKey: TOSCA_Capability_Instance_Key]: TOSCA_Capability | TOSCA_Capability_Definition_Key
    },
    interfaces?: {
        [interfaceKey: TOSCA_Interface_Template_Key]: TOSCA_Interface | TOSCA_Interface_Definition_Key
    },
    artifacts?: {
        [artifactKey: TOSCA_Artifact_Instance_Key]: TOSCA_Artifact | TOSCA_Artifact_Definition_Key
    }
}

// 3.7.10 Relationship Type
export type TOSCA_Relationship = {
    derived_from?: TOSCA_Relationship_Type_Key,
    version?: string,
    metadata?: TOSCA_Metadata,
    description?: string,
    properties?: {
        [propertyKey: TOSCA_Property_Definition_Key]: TOSCA_Property
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Definition_Key]: TOSCA_Attribute
    },
    interfaces?: {
        [interfaceKey: TOSCA_Interface_Definition_Key]: TOSCA_Interface
    },
    valid_target_types?: TOSCA_Capability_Definition_Key[]
}

// 3.7.11 Group Type
export type TOSCA_Group = {
    derived_from?: TOSCA_Group_Type_Key,
    version?: string,
    metadata?: TOSCA_Metadata,
    description?: string,
    properties?: {
        [propertyKey: TOSCA_Property_Definition_Key]: TOSCA_Property
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Definition_Key]: TOSCA_Attribute
    },
    members?: TOSCA_Node_Type_Key[]
}

// 3.7.12 Policy Type
export type TOSCA_Policy = {
    derived_from?: TOSCA_Policy_Type_Key,
    version?: string,
    metadata?: TOSCA_Metadata,
    description?: string,
    properties?: {
        [propertyKey: TOSCA_Property_Definition_Key]: TOSCA_Property
    },
    targets?: (TOSCA_Node_Type_Key | TOSCA_Group_Type_Key)[],
    triggers?: {
        [triggerKey: TOSCA_Trigger_Type_Key]: TOSCA_Trigger
    }
}

