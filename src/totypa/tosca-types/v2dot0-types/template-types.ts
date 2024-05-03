import { TOSCA_Artifact_Type_Key, TOSCA_Attribute_Assignment, TOSCA_Attribute_Name, TOSCA_Capability_Type_Key, TOSCA_Condition_Clause, TOSCA_Function_Call, TOSCA_Group_Template_Key, TOSCA_Group_Type_Key, TOSCA_Interface_Type_Key, TOSCA_Node_Template_Key, TOSCA_Node_Type_Key, TOSCA_Operation_Name, TOSCA_Parameter_Assignment, TOSCA_Parameter_Name, TOSCA_Policy_Type_Key, TOSCA_Property_Assignment, TOSCA_Property_Name, TOSCA_Relationship_Template_Key, TOSCA_Relationship_Type_Key, TOSCA_Repository_Name, TOSCA_Requirement_Type_Key, TOSCA_Trigger_Type_Key, TOSCA_Validation_Clause, TOSCA_Workflow_Name, TOSCA_Workflow_Step_Name } from "./alias-types"
import { TOSCA_Directive, TOSCA_Implementation_Definition, TOSCA_Metadata, TOSCA_Parameter_Definition, TOSCA_Relationship_Definition } from "./definition-types"

// 5.2.6 Service template definition
export type TOSCA_Service_Template = {
    description?: string,
    inputs?: {
        [parameterKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Definition
    },
    node_templates?: {
        [nodeKey: TOSCA_Node_Template_Key]: TOSCA_Node_Template
    },
    relationship_templates?: {
        [relationshipKey: TOSCA_Relationship_Template_Key]: TOSCA_Relationship_Template
    },
    groups?: {
        [groupKey: TOSCA_Group_Template_Key]: TOSCA_Group_Definition
    },
    policies?: TOSCA_Policy_Definition[], // should this also be an object with policy names? Standard is ambiguous
    outputs?: {
        [outputKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Definition
    },
    substitution_mappings?: TOSCA_Substitution_Mapping,
    workflows?: {
        [workflowKey: TOSCA_Workflow_Name]: TOSCA_Workflow_Definition
    }
}


// 5.3.2 Node Template
export type TOSCA_Node_Template = {
    type: TOSCA_Node_Type_Key,
    description?: string,
    metadata?: TOSCA_Metadata,
    directives?: string[],
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Assignment
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Name]: TOSCA_Attribute_Assignment
    },
    requirements?: {
        [requirementKey: TOSCA_Requirement_Type_Key]: TOSCA_Requirement_Assignment | TOSCA_Node_Template_Key | TOSCA_Relationship_Template_Key | TOSCA_Relationship_Type_Key
    }[],
    capabilities?: {
        [capabilityKey: TOSCA_Capability_Type_Key]: TOSCA_Capability_Assignment
    },
    interfaces?: {
        [interfaceKey: TOSCA_Interface_Type_Key]: TOSCA_Interface_Assignment
    },
    artifacts?: {
        [artifactKey: TOSCA_Artifact_Type_Key]: TOSCA_Artifact_Definition
    },
    node_filter?: TOSCA_Condition_Clause,
    copy?: TOSCA_Node_Template_Key
}


// 5.3.5.6 Requirement assignment
export type TOSCA_Requirement_Assignment = {
    capability?: TOSCA_Capability_Type_Key,
    node?: TOSCA_Node_Template_Key | TOSCA_Node_Type_Key,
    relationship?: TOSCA_Relationship_Template_Key | TOSCA_Relationship_Type_Key | TOSCA_Relationship_Definition
    allocation?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Assignment
    }
    node_filer?: TOSCA_Condition_Clause,
    count?: number,
    directives?: string[],
    optional?: boolean
}


// 5.3.5.3 Capability assignment
export type TOSCA_Capability_Assignment = {
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Assignment
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Name]: TOSCA_Attribute_Assignment
    }
    directives?: TOSCA_Directive[]
}

// 5.3.6.3 Interface assignment
export type TOSCA_Interface_Assignment = {
    inputs?: {
        [parameterKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Assignment
    },
    operations?: {
        [operationKey: string]: TOSCA_Operation_Assignment
    },
    notifications?: {
        [notificationKey: string]: TOSCA_Notification_Assignment
    }
}

// 5.3.6.5 Operation assignment
export type TOSCA_Operation_Assignment = {
    implementation?: TOSCA_Implementation_Definition,
    inputs?: {
        [parameterKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Assignment
    },
    outputs?: {
        [parameterKey: TOSCA_Parameter_Name]: string
    }
}

// 5.3.6.7 Notification assignment
export type TOSCA_Notification_Assignment = {
    implementation?: TOSCA_Implementation_Definition,
    outputs?: {
        [parameterKey: TOSCA_Parameter_Name]: string
    }
}

// 5.3.7.2 Artifact definition
export type TOSCA_Artifact_Definition = {
    type: TOSCA_Artifact_Type_Key,
    file: string,
    repository?: TOSCA_Repository_Name,
    description?: string,
    deploy_path?: string,
    artifact_version?: string,
    checksum?: string,
    checksum_algorithm?: string,
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Assignment
    }
}


// 5.3.4 Relationship Template
export type TOSCA_Relationship_Template = {
    type: TOSCA_Relationship_Type_Key,
    description?: string,
    metadata?: TOSCA_Metadata,
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Assignment
    },
    attributes?: {
        [attributeKey: TOSCA_Property_Name]: TOSCA_Attribute_Assignment
    },
    interfaces?: {
        [interfaceKey: TOSCA_Interface_Type_Key]: TOSCA_Interface_Assignment
    },
    copy?: TOSCA_Relationship_Template_Key
}


// 5.6.2 Group definition
export type TOSCA_Group_Definition = {
    type: TOSCA_Group_Type_Key,
    description?: string,
    metadata?: TOSCA_Metadata,
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Assignment
    },
    attributes?: {
        [attributeKey: TOSCA_Property_Name]: TOSCA_Attribute_Assignment
    },
    members?: TOSCA_Node_Template_Key[]
}


// 5.6.4 Policy definition
export type TOSCA_Policy_Definition = {
    type: TOSCA_Policy_Type_Key,
    description?: string,
    metadata?: TOSCA_Metadata,
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Assignment
    },
    targets?: TOSCA_Node_Template_Key[],
    triggers?: {
        [triggerKey: TOSCA_Trigger_Type_Key]: TOSCA_Trigger
    }
}


// 5.6.5 Trigger definition
export type TOSCA_Trigger = {
    description?: string,
    event: string,
    condition?: TOSCA_Condition_Clause,
    action: TOSCA_Activity
}


// 5.6.6 Activity definitions
export type TOSCA_Activity = TOSCA_Activity_Delegate |
    TOSCA_Activity_SetState |
    TOSCA_Activity_Call |
    TOSCA_Activity_Inline

// 5.6.6.1 Delegate workflow activity definition
export type TOSCA_Activity_Delegate = { delegate: TOSCA_Workflow_Name } | {
    delegate: {
        workflow?: TOSCA_Workflow_Name,
        inputs?: {
            [parameterKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Assignment
        }
    }
}

// 5.6.6.2 Set state activity definition
export type TOSCA_Activity_SetState = {
    set_state: string
}

// 5.6.6.3 Call operation activity definition
export type TOSCA_Activity_Call = { call_operation: `${TOSCA_Interface_Type_Key}.${TOSCA_Operation_Name}`} | {
    call_operation: {
        operation?: `${TOSCA_Interface_Type_Key}.${TOSCA_Operation_Name}`,
        inputs?: {
            [parameterKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Assignment
        }
    }
}

// 5.6.6.4 Inline workflow activity definition
export type TOSCA_Activity_Inline = { inline: string } | {
    inline: {
        workflow?: string,
        inputs?: {
            [parameterKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Assignment
        }
    }
}

// 5.5.1 Substitution mapping
export type TOSCA_Substitution_Mapping = {
    node_type: string,
    substitution_filter?: TOSCA_Condition_Clause,
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Mapping
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Name]: TOSCA_Attribute_Mapping
    },
    capabilities?: {
        [capabilityKey: TOSCA_Capability_Type_Key]: TOSCA_Capability_Mapping
    },
    requirements?: {
        [requirementKey: TOSCA_Requirement_Type_Key]: TOSCA_Requirement_Mapping
    },
    interfaces?: {
        [interfaceKey: TOSCA_Interface_Type_Key]: TOSCA_Interface_Mapping
    }
}

// 5.5.2 Property mapping
export type TOSCA_Property_Mapping = {
    mapping?: (TOSCA_Parameter_Name)[],
    value?: any
}

// 5.5.3 Attribute mapping
export type TOSCA_Attribute_Mapping = {
    mapping?: (TOSCA_Parameter_Name)[]
}

// 5.5.4 Capability mapping
export type TOSCA_Capability_Mapping = {
    mapping?: (TOSCA_Node_Template_Key | TOSCA_Capability_Type_Key)[],
    properties?: {
        [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Assignment
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Name]: TOSCA_Attribute_Assignment
    },
}

// 5.5.5 Requirement mapping
export type TOSCA_Requirement_Mapping = {
    mapping?: (TOSCA_Node_Template_Key | TOSCA_Capability_Type_Key)[],
    properties?: {
        properties?: {
            [propertyKey: TOSCA_Property_Name]: TOSCA_Property_Assignment
        },
        attributes?: {
            [attributeKey: TOSCA_Attribute_Name]: TOSCA_Attribute_Assignment
        },
    }
}

// 5.5.6 Interface mapping
export type TOSCA_Interface_Mapping = {
    [operationKey: TOSCA_Operation_Name]: TOSCA_Workflow_Name
}

// 5.7.1 Imperative Workflow definition
export type TOSCA_Workflow_Definition = {
    description?: string,
    metadata?: TOSCA_Metadata,
    inputs?: {
        [inputKey: TOSCA_Parameter_Name]: TOSCA_Parameter_Definition
    },
    precondition?: TOSCA_Condition_Clause,
    steps?: {
        [stepKey: TOSCA_Workflow_Step_Name]: TOSCA_Workflow_Step_Definition
    },
    implementation?: TOSCA_Implementation_Definition,
    outputs?: {
        [attributeMappingKey: TOSCA_Attribute_Name]: TOSCA_Attribute_Mapping
    }
}


// 5.7.3 Workflow step definition
export type TOSCA_Workflow_Step_Definition = {
    target: TOSCA_Node_Template_Key | TOSCA_Group_Template_Key,
    target_relationship?: string,
    operation_host?: string,
    filter?: TOSCA_Validation_Clause[],
    activities: TOSCA_Activity[],
    on_success?: string[],
    on_failure?: string[]
}