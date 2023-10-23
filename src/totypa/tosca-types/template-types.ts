import { TOSCA_Attribute_Instance_Key, TOSCA_Capability_Definition_Key as TOSCA_Capability_Type_Key, TOSCA_Capability_Instance_Key, TOSCA_Interface_Template_Key, TOSCA_Node_Type_Key, TOSCA_Node_Template_Key, TOSCA_Property_Instance_Key, TOSCA_Relationship_Type_Key, TOSCA_Relationship_Template_Key, TOSCA_Requirement_Instance_Key, TOSCA_Capability_Definition_Key, TOSCA_Interface_Definition_Key, TOSCA_Artifact_Definition_Key, TOSCA_Group_Type_Key, TOSCA_Policy_Type_Key, TOSCA_Trigger_Type_Key, TOSCA_Property_Definition_Key, TOSCA_Parameter_Definition_Key, TOSCA_Group_Template_Key, TOSCA_Datatype_Type_Key } from "./alias-types"
import { TOSCA_Datatype, TOSCA_Attribute_Assignment, TOSCA_Import, TOSCA_Interface, TOSCA_Metadata, TOSCA_Node_Filter, TOSCA_Operation_Implementation, TOSCA_Parameter, TOSCA_Property, TOSCA_Property_Assignment, TOSCA_Repository, TOSCA_Trigger, TOSCA_Workflow_Precondition, TOSCA_Workflow_Step } from "./core-types"
import { TOSCA_Capability, TOSCA_Artifact, TOSCA_Interface2, TOSCA_Relationship, TOSCA_Group, TOSCA_Policy, TOSCA_Node } from "./entity-types"


// 3.8.1 Capability assignment
export type TOSCA_Capability_Assignment = {
    properties?: {
        [propertyKey: TOSCA_Property_Instance_Key]: TOSCA_Property_Assignment
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Instance_Key]: TOSCA_Attribute_Assignment
    }
    occurrences?: (number | string)[]
}

// 3.8.2 Requirement assignment
export type TOSCA_Requirement_Assignment = {
    capability?: TOSCA_Capability_Instance_Key | TOSCA_Capability_Type_Key,
    node?: TOSCA_Node_Template_Key | TOSCA_Node_Type_Key,
    relationship?: TOSCA_Relationship_Template_Key | TOSCA_Relationship_Type_Key | {
        type: TOSCA_Relationship_Template_Key | TOSCA_Relationship_Type_Key,
        properties?: {
            [propertyKey: TOSCA_Property_Instance_Key]: TOSCA_Property_Assignment
        },
        interfaces?: {
            [interfaceKey: TOSCA_Interface_Template_Key]: TOSCA_Interface
        }
    }
    node_filer?: TOSCA_Node_Filter,
    occurrences?: (number | string)[]
}

// 3.8.3 Node Template
export type TOSCA_Node_Template = {
    type: TOSCA_Node_Type_Key,
    description?: string,
    metadata?: TOSCA_Metadata,
    directives?: string[],
    properties?: {
        [propertyKey: TOSCA_Property_Instance_Key]: TOSCA_Property_Assignment
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Instance_Key]: TOSCA_Attribute_Assignment
    },
    requirements?: {
        [requirementKey: TOSCA_Requirement_Instance_Key]: TOSCA_Requirement_Assignment | TOSCA_Node_Template_Key 
    }[],
    capabilities?: {
        [capabilityKey: TOSCA_Capability_Instance_Key]: TOSCA_Capability_Assignment
    },
    interfaces?: {
        [interfaceKey: TOSCA_Interface_Definition_Key]: TOSCA_Interface
    },
    artifacts?: {
        [artifactKey: TOSCA_Artifact_Definition_Key]: TOSCA_Artifact
    },
    node_filter?: TOSCA_Node_Filter,
    copy?: TOSCA_Node_Template_Key
}

// 3.8.4 Relationship Template
export type TOSCA_Relationship_Template = {
    type: TOSCA_Relationship_Type_Key,
    description?: string,
    metadata?: TOSCA_Metadata,
    properties?: {
        [propertyKey: TOSCA_Property_Instance_Key]: TOSCA_Property_Assignment
    },
    attributes?: {
        [attributeKey: TOSCA_Attribute_Instance_Key]: TOSCA_Attribute_Assignment
    },
    interfaces?: {
        [interfaceKey: TOSCA_Interface_Definition_Key]: TOSCA_Interface
    },
    copy?: TOSCA_Relationship_Template_Key
}

// 3.8.5 Group definition
export type TOSCA_Group_Definition = {
    type: TOSCA_Group_Type_Key,
    description?: string,
    metadata?: TOSCA_Metadata,
    properties?: {
        [propertyKey: TOSCA_Property_Instance_Key]: TOSCA_Property_Assignment
    },
    members?: TOSCA_Node_Template_Key[]
}

// 3.8.6 Policy definition
export type TOSCA_Policy_Definition = {
    type: TOSCA_Policy_Type_Key,
    description?: string,
    metadata?: TOSCA_Metadata,
    properties?: {
        [propertyKey: TOSCA_Property_Instance_Key]: TOSCA_Property_Assignment
    },
    targets?: TOSCA_Node_Template_Key[],
    triggers?: {
        [triggerKey: TOSCA_Trigger_Type_Key]: TOSCA_Trigger
    }
}

// 3.8.7 Imperative Workflow definition
export type TOSCA_Workflow_Definition = {
    description?: string,
    metadata?: TOSCA_Metadata,
    inputs?: {
        [inputKey: TOSCA_Property_Definition_Key]: TOSCA_Property
    },
    preconditions?: TOSCA_Workflow_Precondition[],
    steps?: {
        [stepKey: string]: TOSCA_Workflow_Step
    },
    implementation?: TOSCA_Operation_Implementation,
    outputs?: {
        [attributeMappingKey: string]: TOSCA_Attribute_Mapping
    }
}

// 3.8.8 Property mapping
export type TOSCA_Property_Mapping = {
    mapping?: string[],
    value?: any
}

// 3.8.9 Attribute mapping
export type TOSCA_Attribute_Mapping = {
    mapping?: string[]
}

// 3.8.10 Capability mapping
export type TOSCA_Capability_Mapping = {
    mapping?: string[],
    properties?: {
        [propertyKey: string]: TOSCA_Property_Assignment
    },
    attributes?: {
        [attributeKey: string]: TOSCA_Attribute_Assignment
    },
}

// 3.8.11 Requirement mapping
export type TOSCA_Requirement_Mapping = {
    mapping?: string[],
    properties?: {
        [propertyKey: string]: TOSCA_Property_Assignment
    },
    attributes?: {
        [attributeKey: string]: TOSCA_Attribute_Assignment
    }
}

// 3.8.12 Interface mapping
export type TOSCA_Interface_Mapping = {
    [operationKey: string]: string
}

// 3.8.13 Substitution mapping
export type TOSCA_Substitution_Mapping = {
    node_type: string,
    substitution_filter: TOSCA_Node_Filter,
    properties?: {
        [propertyKey: string]: TOSCA_Property_Mapping
    },
    attributes?: {
        [attributeKey: string]: TOSCA_Attribute_Mapping
    },
    capabilities?: {
        [capabilityKey: string]: TOSCA_Capability_Mapping
    },
    requirements?: {
        [requirementKey: string]: TOSCA_Requirement_Mapping
    },
    interfaces?: {
        [interfaceKey: string]: TOSCA_Interface_Mapping
    }
}

// 3.9 Topology Template definition
export type TOSCA_Topology_Template = {
    description?: string,
    inputs?: {
        [inputKey: TOSCA_Parameter_Definition_Key]: TOSCA_Parameter
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
    policies?: TOSCA_Policy_Definition[],
    outputs?: {
        [outputKey: TOSCA_Parameter_Definition_Key]: TOSCA_Parameter
    },
    substitution_mappings?: TOSCA_Substitution_Mapping,
    workflows?: {
        [workflowKey: string]: TOSCA_Workflow_Definition
    }

}

// 3.10 Service Template definition
export type TOSCA_Service_Template = {
    tosca_definitions_version: string,
    namespace?: string,
    metadata?: {
        template_name: string,
        template_author: string,
        template_version: string,
        [metadataKey: string]: string
    }
    description?: string,
    dsl_definitions?: string,
    repositories?: {
        [repositoryKey: string]: TOSCA_Repository 
    },
    imports?: TOSCA_Import[],
    artifact_types?: {
        [artifactKey: TOSCA_Artifact_Definition_Key]: TOSCA_Artifact
    },
    data_types?:  {
        [datatypeKey: TOSCA_Datatype_Type_Key]: TOSCA_Datatype
    },
    capability_types?: {
        [capabilityKey: TOSCA_Capability_Type_Key]: TOSCA_Capability 
    },
    interface_types?: {
        [interfaceKey: TOSCA_Interface_Definition_Key]: TOSCA_Interface2
    },
    relationship_types?: {
        [relationshipKey: TOSCA_Relationship_Type_Key]: TOSCA_Relationship
    },
    node_types?: {
        [nodeKey: TOSCA_Node_Type_Key]: TOSCA_Node
    },
    group_types?: {
        [grouKey: TOSCA_Group_Type_Key]: TOSCA_Group
    },
    policy_types?: {
        [policyKey: TOSCA_Policy_Type_Key]: TOSCA_Policy
    },
    topology_template?: TOSCA_Topology_Template
}


