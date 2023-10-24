import { TOSCA_Artifact_File_Uri, TOSCA_Artifact_Type_Key, TOSCA_Attribute_Definition_Key, TOSCA_Attribute_Instance_Key, TOSCA_Capability_Instance_Key, TOSCA_Datatype_Type_Key, TOSCA_Group_Template_Key, TOSCA_Interface_Type_Key, TOSCA_Node_Template_Key, TOSCA_Node_Type_Key, TOSCA_Notification_Definition_Key, TOSCA_Notification_Instance_Key, TOSCA_Operation_Definition_Key, TOSCA_Operation_Instance_Key, TOSCA_Parameter_Definition_Key, TOSCA_Parameter_Instance_Key, TOSCA_Property_Definition_Key, TOSCA_Property_Instance_Key, TOSCA_Repository_Definition_Key, TOSCA_Requirement_Instance_Key, TOSCA_Workflow_Instance_Key } from "./alias-types"

export type TOSCA_Version = "tosca_simple_yaml_1_3" 

// 3.6.2 Metadata
export type TOSCA_Metadata = {
    [key: string]: string
}

// 3.6.3 Constraint clause
export type TOSCA_Property_Constraint =
    { equal: any } |
    { greater_than: any } |
    { greater_or_equal: any } |
    { less_than: any } |
    { less_or_equal: any } |
    { in_range: any[] } |
    { valid_values: any[] } |
    { min_length: number } |
    { max_length: number } |
    { pattern: string } |
    { schema: string }

// 3.6.4 Property Filter definition
export type TOSCA_Property_Filter = {
    [propertyKey: TOSCA_Property_Instance_Key]: TOSCA_Property_Constraint | TOSCA_Property_Constraint[]
}

// 3.6.5 Node Filter definition
export type TOSCA_Node_Filter = {
    properties?: TOSCA_Property_Instance_Key[],
    capabilities?: string[] | { [capabilityKey: TOSCA_Capability_Instance_Key]: string[] }
}

// 3.6.6 Repository definition
export type TOSCA_Repository = {
    url: string,
    description?: string,
    credential?: string
}

// 3.6.7 Artifact definition
export type TOSCA_Artifact = {
    type: TOSCA_Artifact_Type_Key,
    file: TOSCA_Artifact_File_Uri,
    repository?: TOSCA_Repository_Definition_Key,
    description?: string,
    deploy_path?: string,
    artifact_version?: string,
    checksum?: string,
    checksum_algorithm?: string,
    properties?: {
        [propertyKey: TOSCA_Property_Instance_Key]: any
    }
}


// 3.6.8 Import definition
export type TOSCA_Import = {
    file: string,
    repository?: string,
    namespace_prefix?: string,
    namespace_uri?: string
}

// 3.6.9 Schema Definition
export type TOSCA_Property_Schema = {
    type: string,
    description?: string,
    constraints?: TOSCA_Property_Constraint[],
    key_schema?: TOSCA_Property_Schema,
    entry_schema?: TOSCA_Property_Schema
}

// 3.6.10.3 Status values
export type TOSCA_Property_Status = "supported" | "unsupported" | "experimental" | "deprecated"

// 3.6.10 Property definition
export type TOSCA_Property = {
    type?: TOSCA_Datatype_Type_Key,
    description?: string,
    required?: boolean,
    default?: any,
    status?: TOSCA_Property_Status,
    constraints?: TOSCA_Property_Constraint[],
    key_schema?: TOSCA_Property_Schema,
    entry_schema?: TOSCA_Property_Schema,
    external_schema?: string,
    metadata?: TOSCA_Metadata
};

// 3.6.11 Property Assignment
export type TOSCA_Property_Assignment = any

// 3.6.12 Attribute definition
export type TOSCA_Attribute = {
    type: TOSCA_Datatype_Type_Key,
    description?: string,
    default?: any,
    status?: string,
    key_schema?: TOSCA_Property_Schema,
    entry_schema?: TOSCA_Property_Schema
}

// 3.6.13 Attribute assignment
export type TOSCA_Attribute_Assignment = any | {
    description: string,
    value: any
}

// 3.6.14 Parameter definition
export type TOSCA_Parameter = {
    type: TOSCA_Datatype_Type_Key,
    value: any,
    description?: string,
    required?: boolean,
    default?: any,
    status?: TOSCA_Property_Status,
    constraints?: TOSCA_Property_Constraint[],
    key_schema?: TOSCA_Property_Schema,
    entry_schema?: TOSCA_Property_Schema
}

// 3.6.15 Attribute Mapping definition
/* unclear
export type TOSCA_Attribute_Mapping = {

}
*/

// 3.6.16 Operation implementation definition
export type TOSCA_Operation_Implementation = {
    primary?: string,
    dependencies?: string[],
    timeout?: number,
    operation_host?: string
}

// 3.6.17 Operation definition
export type TOSCA_Operation = {
    description?: string,
    implementation?: string,
    inputs?: { [parameterKey: TOSCA_Property_Definition_Key]: TOSCA_Property_Schema } | { [propertyKey: TOSCA_Property_Instance_Key]: any },
    outputs?: { [attributeKey: TOSCA_Attribute_Instance_Key]: string }
}

// 3.6.18 Notification implementation definition
export type TOSCA_Notification_Implementation = {
    primary?: string,
    dependencies?: string[]
}

// 3.6.19 Notification definition
export type TOSCA_Notification = {
    description?: string,
    implementation?: string,
    outputs?: {
        [attributeKey: TOSCA_Attribute_Instance_Key]: string
    }
}

// 3.6.20 Interface definition
export type TOSCA_Interface = {
    type?: TOSCA_Interface_Type_Key,
    description?: string,
    derived_from?: string,
    inputs?: { [parameterKey: TOSCA_Property_Definition_Key]: TOSCA_Property_Schema } | { [propertyKey: TOSCA_Property_Instance_Key]: any },
    operations?: {
        [operationKey: TOSCA_Operation_Definition_Key]: TOSCA_Operation
    }
    notifications?: {
        [notificationKey: TOSCA_Notification_Definition_Key]: TOSCA_Notification
    }
}

// 3.6.21 Event Filter definition
export type TOSCA_Event_Filter = {
    node: TOSCA_Node_Type_Key | TOSCA_Node_Template_Key,
    requirement?: TOSCA_Requirement_Instance_Key,
    capability?: TOSCA_Capability_Instance_Key
}

// 3.6.22.2 Additional keynames for the extended condition notation
export type TOSCA_Condition = {
    constraint?: TOSCA_Property_Constraint,
    period?: string,
    evaluations?: number,
    method?: string
}


// 3.7.6 Data Type
export type TOSCA_Datatype = {
    description?: string,
    derived_from?: string,
    version?: string,
    metadata?: TOSCA_Metadata,
    properties?: {
        [propertyKey: TOSCA_Property_Definition_Key]: TOSCA_Property
    }
    constraints?: TOSCA_Property_Constraint[],
    key_schema?: TOSCA_Property_Schema,
    entry_schema?: TOSCA_Property_Schema
}

const TOSCA_Datatype_TimeInterval = "tosca.datatypes.TimeInterval";
export type TOSCA_Datatype_TimeInterval = {
    start_time: string,
    end_time: string
}


// TODO remove here? this should be generated
const data_types: { [datatypeKey: string]: TOSCA_Datatype } = {
    
    "tosca.datatypes.TimeInterval": {
        derived_from: "tosca.datatypes.Root",
        properties: {
            start_time: {
                type: "timestamp",
                required: true,
            },
            end_time: {
                type: "timestamp",
                required: true
            }
        }
    }

}


// 3.6.22 Trigger definition
export type TOSCA_Trigger = {
    description?: string,
    event: string,
    schedule?: TOSCA_Datatype_TimeInterval,
    target_filter?: TOSCA_Event_Filter,
    condition?: TOSCA_Condition,
    action: TOSCA_Activity
}

// 3.6.23 Activity definitions
export type TOSCA_Activity = TOSCA_Activity_Delegate |
    TOSCA_Activity_SetState |
    TOSCA_Activity_Call |
    TOSCA_Activity_Inline

// 3.6.23.1 Delegate workflow activity definition
export type TOSCA_Activity_Delegate = { delegate: TOSCA_Workflow_Instance_Key } | {
    delegate: {
        workflow?: TOSCA_Workflow_Instance_Key,
        inputs?: {
            [parameterKey: TOSCA_Parameter_Instance_Key]: any
        }
    }
}

// 3.6.23.2 Set state activity definition
export type TOSCA_Activity_SetState = {
    set_state: string
}

// 3.6.23.3 Call operation activity definition
export type TOSCA_Activity_Call = { call_operation: TOSCA_Operation_Instance_Key } | {
    call_operation: {
        operation?: TOSCA_Operation_Instance_Key,
        inputs?: {
            [parameterKey: TOSCA_Parameter_Instance_Key]: any
        }
    }
}

// 3.6.23.4 Inline workflow activity definition
export type TOSCA_Activity_Inline = { inline: string } | {
    inline: {
        workflow?: string,
        inputs?: {
            [parameterKey: TOSCA_Parameter_Instance_Key]: any
        }
    }
}

// 3.6.24 Assertion definition
export type TOSCA_Assertion = {
    [attributeKey: TOSCA_Attribute_Definition_Key]: TOSCA_Property_Constraint[]
}

// 3.6.25 Condition clause definition
export type TOSCA_Condition_Clause = 
{ and?: TOSCA_Condition_Clause } | 
{ or?: TOSCA_Condition_Clause } | 
{ not: TOSCA_Condition_Clause } | 
{ [attributeKey: TOSCA_Attribute_Definition_Key]: TOSCA_Property_Constraint }

// 3.6.26 Workflow precondition definition
export type TOSCA_Workflow_Precondition = {
    target: TOSCA_Node_Template_Key | TOSCA_Group_Template_Key,
    target_relationship?: string,
    condition?: TOSCA_Condition_Clause[] 
}

// 3.6.27 Workflow step definition
export type TOSCA_Workflow_Step = {
    target: TOSCA_Node_Template_Key | TOSCA_Group_Template_Key,
    target_relationship?: string,
    operation_host?: string,
    filter?: TOSCA_Property_Constraint,
    activities: TOSCA_Activity[],
    on_success?: string[],
    on_failure?: string[]
}