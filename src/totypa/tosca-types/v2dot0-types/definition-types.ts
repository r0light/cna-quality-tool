import { TOSCA_Artifact_Type_Key, TOSCA_Capability_Type_Key, TOSCA_Condition_Clause, TOSCA_Datatype_Type_Key, TOSCA_Group_Type_Key, TOSCA_Interface_Type_Key, TOSCA_Node_Type_Key, TOSCA_Policy_Type_Key, TOSCA_Relationship_Type_Key, TOSCA_Repository_Definition_Key, TOSCA_Requirement_Type_Key, TOSCA_Validation_Clause, TOSCA_Version } from "./alias-types"
import { TOSCA_Service_Template } from "./template-types"

// 5.2.1 TOSCA file definition
export type TOSCA_File = {
    tosca_definitions_version: "tosca_2_0",
    profile?: string,
    metadata?: {
        [key: string]: any
    },
    description?: string,
    dsl_definitions?: any,
    repositories?: {
        [repositoryKey: TOSCA_Repository_Definition_Key]: TOSCA_Repository_Definition 
    },
    imports?: TOSCA_Import_Definition[],
    artifact_types?: {
        [artifactTypeKey: TOSCA_Artifact_Type_Key]: TOSCA_Artifact_Type_Definition
    },
    data_types?:  {
        [datatypeTypeKey: TOSCA_Datatype_Type_Key]: TOSCA_Datatype_Definition
    },
    capability_types?: {
        [capabilityTypeKey: TOSCA_Capability_Type_Key]: TOSCA_Capability_Definition
    },
    interface_types?: {
        [interfaceTypeKey: TOSCA_Interface_Type_Key]: TOSCA_Interface_Definition
    },
    relationship_types?: {
        [relationshipTypeKey: TOSCA_Relationship_Type_Key]: TOSCA_Relationship_Definition
    },
    node_types?: {
        [nodeTypeKey: TOSCA_Node_Type_Key]: TOSCA_Node_Definition
    },
    group_types?: {
        [groupTypeKey: TOSCA_Group_Type_Key]: TOSCA_Group_Type_Definition
    },
    policy_types?: {
        [policyTypeKey: TOSCA_Policy_Type_Key]: TOSCA_Policy_Type_Definition
    },
    service_template?: TOSCA_Service_Template,
    functions?: {
        [functionKey: string]: any // TODO
    }
}

export type TOSCA_Metadata = {
    [metadataKey: string]: string
}

// 5.2.5.2 Common keynames in type definitions
export type TOSCA_Type_Definition_Commons = {
    derived_from?: string,
    version?: TOSCA_Version,
    metadata?: TOSCA_Metadata,
    description?: string
}

export type TOSCA_Directive = "internal" | "external"


// 5.2.3.3 Repository definition
export type TOSCA_Repository_Definition = {
    description?: string,
    url: string
}

// 5.2.3.1 Import definition
export type TOSCA_Import_Definition = {
    url?: string,
    profile?: string,
    repository?: string,
    namespace?: string
}

// 5.3.7.1 Artifact Type
export type TOSCA_Artifact_Type_Definition = {
    mime_type?: string,
    file_ext?: string[],
    properties?: {
        [TOSCA_Property_Definition_Key: string]: TOSCA_Property_Definition
    }    
}

// 5.4.7 Property definition
export type TOSCA_Property_Definition = {
    type: string,
    description?: string,
    required?: boolean,
    default?: any,
    value?: any,
    status?: string,
    validation?: TOSCA_Validation_Clause,
    key_schema?: TOSCA_Schema_Definition,
    entry_schema?: TOSCA_Schema_Definition,
    external_schema?: string,
    metadata?: TOSCA_Metadata
}


// 5.4.5 Schema definition
export type TOSCA_Schema_Definition = {
    type: string,
    description?: string,
    validation: TOSCA_Validation_Clause,
    key_schema?: TOSCA_Schema_Definition,
    entry_schema?: TOSCA_Schema_Definition
}


// 5.4.4 Data Type
export type TOSCA_Datatype_Definition = TOSCA_Type_Definition_Commons & {
    validation?: TOSCA_Validation_Clause,
    properties?: {
        [TOSCA_Property_Definition_Key: string]: TOSCA_Property_Definition
    },
    key_schema?: TOSCA_Schema_Definition,
    entry_schema?: TOSCA_Schema_Definition,
}

// 5.3.5.1 Capability Type
export type TOSCA_Capability_Definition = TOSCA_Type_Definition_Commons & {
    properties?: {
        [TOSCA_Property_Definition_Key: string]: TOSCA_Property_Definition
    },
    attributes?: {
        [TOSCA_Attribute_Definition_Key: string]: TOSCA_Attribute_Definition
    },
    valid_source_node_types?: string[],
    valid_relationship_types?: string[]
}

// 5.4.9 Attribute definition
export type TOSCA_Attribute_Definition = {
    type: string,
    description?: string,
    default?: any,
    value?: any,
    status?: string,
    validation?: TOSCA_Validation_Clause,
    key_schema?: TOSCA_Schema_Definition,
    entry_schema?: TOSCA_Schema_Definition,
    metadata?: {
        [metadataKey: string]: string
    }
}


// 5.3.6.1 Interface Type
export type TOSCA_Interface_Definition = TOSCA_Type_Definition_Commons &  {
    inputs?: {
        [parameterKey: string]: TOSCA_Parameter_Definition
    },
    operations?: {
        [operationKey: string]: TOSCA_Operation_Definition
    },
    notifications?: {
        [notificationKey: string]: TOSCA_Notification_Definition
    }
}


// 5.4.11 Parameter definition
export type TOSCA_Parameter_Definition = {
    type?: string,
    value?: any,
    mapping?: string[]
}

// 5.3.6.4 Operation definition
export type TOSCA_Operation_Definition = {
    description?: string,
    implementation: TOSCA_Implementation_Definition,
    inputs?: {
        [parameterKey: string]: TOSCA_Parameter_Definition
    },
    outputs?: {
        [parameterKey: string]: TOSCA_Parameter_Definition
    }

}

// 5.3.6.6 Notification definition
export type TOSCA_Notification_Definition = {
    description?: string,
    implementation: TOSCA_Implementation_Definition,
    outputs?: {
        [parameterKey: string]: TOSCA_Parameter_Definition
    }
}

// 5.3.6.8 Operation and notification implementation definition
export type TOSCA_Implementation_Definition = {
    primary?: TOSCA_Artifact_Type_Definition,
    dependencies?: TOSCA_Artifact_Type_Definition[],
    timeout?: number
}

// 5.3.3 Relationship Type
export type TOSCA_Relationship_Definition = TOSCA_Type_Definition_Commons & {
    properties?: {
        [TOSCA_Property_Definition_Key: string]: TOSCA_Property_Definition
    },
    attributes?: {
        [TOSCA_Attribute_Definition_Key: string]: TOSCA_Attribute_Definition
    },
    interfaces?: {
        [interfaceTypeKey: TOSCA_Interface_Type_Key]: TOSCA_Interface_Definition
    },
    valid_capability_types?: TOSCA_Capability_Type_Key[],
    valid_target_node_types?: TOSCA_Node_Type_Key[],
    valid_source_node_types?: TOSCA_Node_Type_Key[],
}

// 5.3.5.5 Requirement definition
export type TOSCA_Requirement_Definition = {
    description?: string,
    capability: TOSCA_Capability_Type_Key,
    node?: TOSCA_Node_Type_Key,
    relationship?: TOSCA_Relationship_Type_Key,
    node_filter?: TOSCA_Condition_Clause,
    count_range?: (string| number)[],
}

// 5.3.1 Node Type
export type TOSCA_Node_Definition = TOSCA_Type_Definition_Commons & {
    properties?: {
        [TOSCA_Property_Definition_Key: string]: TOSCA_Property_Definition
    },
    attributes?: {
        [TOSCA_Attribute_Definition_Key: string]: TOSCA_Attribute_Definition
    },
    capabilities?: {
        [capabilityTypeKey: TOSCA_Capability_Type_Key]: TOSCA_Capability_Definition
    },
    requirements?: {
        [requirementTypeKey: TOSCA_Requirement_Type_Key]: TOSCA_Requirement_Definition
    }
    interfaces?: {
        [interfaceTypeKey: TOSCA_Interface_Type_Key]: TOSCA_Interface_Definition
    },
    artifacts?: {
        [artifactTypeLey: TOSCA_Artifact_Type_Key]: TOSCA_Artifact_Type_Definition
    }
}

// 5.6.1 Group Type
export type TOSCA_Group_Type_Definition = TOSCA_Type_Definition_Commons & {
    properties?: {
        [TOSCA_Property_Definition_Key: string]: TOSCA_Property_Definition
    },
    attributes?: {
        [TOSCA_Attribute_Definition_Key: string]: TOSCA_Attribute_Definition
    },
    members?: TOSCA_Node_Type_Key[];
}

// 5.6.3 Policy Type
export type TOSCA_Policy_Type_Definition = TOSCA_Type_Definition_Commons & {
    properties?: {
        [TOSCA_Property_Definition_Key: string]: TOSCA_Property_Definition
    },
    targets?: (TOSCA_Node_Type_Key | TOSCA_Group_Type_Key)[],
    triggers?: {
        [triggerKey: string]: TOSCA_Trigger_Definition
    }

}

// 5.6.5 Trigger definition
export type TOSCA_Trigger_Definition = {
    description?: string,
    event: string,
    condition?: TOSCA_Condition_Clause,
    action: TOSCA_Activity_Definition[]
}


// 5.6.6 Activity definitions
export type TOSCA_Activity_Definition = {
    delegate: string,
    workflow?: string,
    inputs?: {
        [parameterKey: string]: TOSCA_Parameter_Definition
    },
}