import { TOSCA_Artifact_Type_Key, TOSCA_Attribute_Name, TOSCA_Capability_Type_Key, TOSCA_Condition_Clause, TOSCA_Datatype_Type_Key, TOSCA_Function_Name, TOSCA_Group_Type_Key, TOSCA_Interface_Type_Key, TOSCA_Node_Type_Key, TOSCA_Notification_Name, TOSCA_Operation_Name, TOSCA_Parameter_Assignment, TOSCA_Parameter_Name, TOSCA_Policy_Type_Key, TOSCA_Profile_Name, TOSCA_Property_Name, TOSCA_Relationship_Type_Key, TOSCA_Repository_Name, TOSCA_Requirement_Type_Key, TOSCA_Trigger_Name, TOSCA_Validation_Clause, TOSCA_Version, TOSCA_Workflow_Name } from "./alias-types"
import { TOSCA_Service_Template } from "./template-types"

// 5.2.1 TOSCA file definition
export type TOSCA_File = {
    tosca_definitions_version: "tosca_2_0",
    profile?: TOSCA_Profile_Name,
    metadata?: {
        [key: string]: any
    },
    description?: string,
    dsl_definitions?: any,
    repositories?: {
        [repositoryKey: TOSCA_Repository_Name]: TOSCA_Repository_Definition 
    },
    imports?: TOSCA_Import_Definition[],
    artifact_types?: {
        [artifactTypeKey: TOSCA_Artifact_Type_Key]: TOSCA_Artifact_Type_Definition
    },
    data_types?:  {
        [datatypeTypeKey: TOSCA_Datatype_Type_Key]: TOSCA_Datatype_Definition
    },
    capability_types?: {
        [capabilityTypeKey: TOSCA_Capability_Type_Key]: TOSCA_Capability_Type_Definition
    },
    interface_types?: {
        [interfaceTypeKey: TOSCA_Interface_Type_Key]: TOSCA_Interface_Type_Definition
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
        [functionKey: TOSCA_Function_Name]: TOSCA_Function_Definition
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
    profile?: TOSCA_Profile_Name,
    repository?: TOSCA_Repository_Name,
    namespace?: string
}

// 5.3.7.1 Artifact Type
export type TOSCA_Artifact_Type_Definition = TOSCA_Type_Definition_Commons & {
    mime_type?: string,
    file_ext?: string[],
    properties?: {
        [TOSCA_Property_Definition_Key: TOSCA_Property_Name]: TOSCA_Property_Definition
    }    
}

// 5.4.7 Property definition
// string can be used when a fixed value is provided
export type TOSCA_Property_Definition = string | number | boolean | {
    type: string,
    description?: string,
    required?: boolean,
    default?: any,
    value?: any,
    status?: TOSCA_Property_Status,
    validation?: TOSCA_Validation_Clause,
    key_schema?: TOSCA_Schema_Definition,
    entry_schema?: TOSCA_Schema_Definition,
    external_schema?: string,
    metadata?: TOSCA_Metadata
}

// 5.4.7.5 Property Refinement rules
// string can be used when a fixed value is provided
export type TOSCA_Property_Refinement = string | number | boolean | {
    type?: string,
    description?: string,
    required?: boolean,
    default?: any,
    value?: any,
    status?: TOSCA_Property_Status,
    validation?: TOSCA_Validation_Clause,
    key_schema?: TOSCA_Schema_Definition,
    entry_schema?: TOSCA_Schema_Definition,
    external_schema?: string,
    metadata?: TOSCA_Metadata
}

// 5.4.7.3 Status values
export type TOSCA_Property_Status = "supported" | "unsupported" | "experimental" | "deprecated"


// 5.4.5 Schema definition
export type TOSCA_Schema_Definition = {
    type: string,
    description?: string,
    validation?: TOSCA_Validation_Clause,
    key_schema?: TOSCA_Schema_Definition,
    entry_schema?: TOSCA_Schema_Definition
}

// 5.4.5.3 Refinement rules
export type TOSCA_Schema_Refinement = {
    type?: string,
    description?: string,
    validation?: TOSCA_Validation_Clause,
    key_schema?: TOSCA_Schema_Definition,
    entry_schema?: TOSCA_Schema_Definition
}


// 5.4.4 Data Type
export type TOSCA_Datatype_Definition = TOSCA_Type_Definition_Commons & {
    validation?: TOSCA_Validation_Clause,
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Definition
    },
    key_schema?: TOSCA_Schema_Definition,
    entry_schema?: TOSCA_Schema_Definition,
}

// 5.3.5.1 Capability Type
export type TOSCA_Capability_Type_Definition = TOSCA_Type_Definition_Commons & {
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Definition
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Name]: TOSCA_Attribute_Definition
    },
    valid_source_node_types?: string[],
    valid_relationship_types?: string[]
}

// 5.3.5.2 Capability Definition
export type TOSCA_Capability_Definition = TOSCA_Capability_Type_Key | {
    type: TOSCA_Capability_Type_Key,
    description?: string,
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Definition
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Name]: TOSCA_Attribute_Definition
    },
    valid_source_node_types?: string[],
    valid_relationship_types?: string[]
}

// 5.3.5.2.3 Capability Refinement rules
export type TOSCA_Capability_Refinement = {
    type?: TOSCA_Capability_Type_Key,
    description?: string,
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Definition
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Name]: TOSCA_Attribute_Definition
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
    status?: TOSCA_Property_Status,
    validation?: TOSCA_Validation_Clause,
    key_schema?: TOSCA_Schema_Definition,
    entry_schema?: TOSCA_Schema_Definition,
    metadata?: {
        [metadataKey: string]: string
    }
}

// 5.4.9.4 Attribute Refinement rules
export type TOSCA_Attribute_Refinement = {
    type?: string,
    description?: string,
    default?: any,
    value?: any,
    status?: TOSCA_Property_Status,
    validation?: TOSCA_Validation_Clause,
    key_schema?: TOSCA_Schema_Definition,
    entry_schema?: TOSCA_Schema_Definition,
    metadata?: {
        [metadataKey: string]: string
    }
}


// 5.3.6.1 Interface Type
export type TOSCA_Interface_Type_Definition = TOSCA_Type_Definition_Commons &  {
    inputs?: {
        [parameterKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Definition
    },
    operations?: {
        [operationKey: TOSCA_Operation_Name]: TOSCA_Operation_Definition
    },
    notifications?: {
        [notificationKey: TOSCA_Notification_Name]: TOSCA_Notification_Definition
    }
}

// 5.3.6.2 Interface Definition
export type TOSCA_Interface_Definition = {
    type: TOSCA_Interface_Type_Key,
    description?: string
    inputs?: {
        [parameterKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Definition
    },
    operations?: {
        [operationKey: TOSCA_Operation_Name]: TOSCA_Operation_Definition
    },
    notifications?: {
        [notificationKey: TOSCA_Notification_Name]: TOSCA_Notification_Definition
    }
}


// 5.4.11 Parameter definition
export type TOSCA_Parameter_Definition = TOSCA_Property_Definition & {
    type?: string,
    value?: any,
    mapping?: string[]
}

// 5.3.6.4 Operation definition
export type TOSCA_Operation_Definition = {
    description?: string,
    implementation?: TOSCA_Implementation_Definition,
    inputs?: {
        [parameterKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Definition
    },
    outputs?: {
        [parameterKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Definition
    }

}

// 5.3.6.6 Notification definition
export type TOSCA_Notification_Definition = {
    description?: string,
    implementation: TOSCA_Implementation_Definition,
    outputs?: {
        [parameterKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Definition
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
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Definition
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Name]: TOSCA_Attribute_Definition
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

// 5.3.5.5.3 Requirement Refinement rules
export type TOSCA_Requirement_Refinement = {
    description?: string,
    capability?: TOSCA_Capability_Type_Key,
    node?: TOSCA_Node_Type_Key,
    relationship?: TOSCA_Relationship_Type_Key,
    node_filter?: TOSCA_Condition_Clause,
    count_range?: (string| number)[],
}

// 5.3.1 Node Type
export type TOSCA_Node_Definition = TOSCA_Type_Definition_Commons & {
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Definition | TOSCA_Property_Refinement
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Name]: TOSCA_Attribute_Definition | TOSCA_Attribute_Refinement
    },
    capabilities?: {
        [capabilityTypeKey: TOSCA_Capability_Type_Key]: TOSCA_Capability_Definition | TOSCA_Capability_Refinement
    },
    requirements?: {
        [requirementTypeKey: TOSCA_Requirement_Type_Key]: TOSCA_Requirement_Definition | TOSCA_Requirement_Refinement
    }[]
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
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Definition
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Name]: TOSCA_Attribute_Definition
    },
    members?: TOSCA_Node_Type_Key[];
}

// 5.6.3 Policy Type
export type TOSCA_Policy_Type_Definition = TOSCA_Type_Definition_Commons & {
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Definition
    },
    targets?: (TOSCA_Node_Type_Key | TOSCA_Group_Type_Key)[],
    triggers?: {
        [triggerKey: TOSCA_Trigger_Name]: TOSCA_Trigger_Definition
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
    delegate: TOSCA_Workflow_Name | { workflow: TOSCA_Workflow_Name, inputs: { [parameterKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Assignment } },
    workflow?: TOSCA_Workflow_Name,
    inputs?: {
        [parameterKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Assignment
    },
}

// 5.4.15 Function definitions
export type TOSCA_Function_Definition = {
    signatures: TOSCA_Function_Signature_Definition[],
    description?: string,
    metadata?: TOSCA_Metadata
}

// 5.4.15 Function definitions
export type TOSCA_Function_Signature_Definition = {
    arguments?: TOSCA_Schema_Definition[],
    optional_arguments?: TOSCA_Schema_Definition[],
    variadic?: boolean,
    result?: TOSCA_Schema_Definition,
    implementation?: TOSCA_Implementation_Definition
}


