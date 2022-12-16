import { TOSCA_Datatype, TOSCA_Artifact, TOSCA_Attribute_Assignment, TOSCA_Import, TOSCA_Interface, TOSCA_Metadata, TOSCA_Node_Filter, TOSCA_Operation_Implementation, TOSCA_Parameter, TOSCA_Property, TOSCA_Property_Assignment, TOSCA_Repository, TOSCA_Trigger, TOSCA_Workflow_Precondition, TOSCA_Workflow_Step } from "./core-types"
import { TOSCA_Capability, TOSCA_Interface2, TOSCA_Relationship, TOSCA_Group, TOSCA_Policy } from "./entity-types"


// 3.8.1 Capability assignment
export type TOSCA_Capability_Assignment = {
    properties?: {
        [propertyKey: string]: TOSCA_Property_Assignment
    },
    attributes?: {
        [attributeKey: string]: TOSCA_Attribute_Assignment
    }
    occurrences?: number[]
}

// 3.8.2 Requirement assignment
export type TOSCA_Requirement_Assignment = {
    capability?: string,
    node?: string,
    relationship?: string | {
        type: string,
        properties?: {
            [propertyKey: string]: TOSCA_Property_Assignment
        },
        interfaces?: {
            [interfaceKey: string]: TOSCA_Interface
        }
    }
    node_filer?: TOSCA_Node_Filter,
    occurrences: number[]
}

// 3.8.3 Node Template
export type TOSCA_Node_Template = {
    type: string,
    description?: string,
    metadata?: TOSCA_Metadata,
    directives: string[],
    properties?: {
        [propertyKey: string]: TOSCA_Property_Assignment
    },
    attributes?: {
        [attributeKey: string]: TOSCA_Attribute_Assignment
    },
    requirements?: TOSCA_Requirement_Assignment[],
    capabilities?: {
        [capabilityKey: string]: TOSCA_Capability_Assignment
    },
    interfaces?: {
        [interfaceKey: string]: TOSCA_Interface
    },
    artifacts?: {
        [artifactKey: string]: TOSCA_Artifact
    },
    node_filter?: TOSCA_Node_Filter,
    copy?: string
}

// 3.8.4 Relationship Template
export type TOSCA_Relationship_Template = {
    type: string,
    description?: string,
    metadata?: TOSCA_Metadata,
    properties?: {
        [propertyKey: string]: TOSCA_Property_Assignment
    },
    attributes?: {
        [attributeKey: string]: TOSCA_Attribute_Assignment
    },
    interfaces?: {
        [interfaceKey: string]: TOSCA_Interface
    },
    copy?: string
}

// 3.8.5 Group definition
export type TOSCA_Group_Definition = {
    type: string,
    description?: string,
    metadata?: TOSCA_Metadata,
    properties?: {
        [propertyKey: string]: TOSCA_Property_Assignment
    },
    members?: string[]
}

// 3.8.6 Policy definition
export type TOSCA_Policy_Definition = {
    type: string,
    description?: string,
    metadata?: TOSCA_Metadata,
    properties?: {
        [propertyKey: string]: TOSCA_Property_Assignment
    },
    targets?: string[],
    triggers?: {
        [triggerKey: string]: TOSCA_Trigger
    }
}

// 3.8.7 Imperative Workflow definition
export type TOSCA_Workflow_Definition = {
    description?: string,
    metadata?: TOSCA_Metadata,
    inputs?: {
        [inputKey: string]: TOSCA_Property
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
        [inputKey: string]: TOSCA_Parameter
    },
    node_templates?: {
        [nodeKey: string]: TOSCA_Node_Template
    },
    relationship_templates?: {
        [relationshipKey: string]: TOSCA_Relationship_Template
    },
    groups?: {
        [groupKey: string]: TOSCA_Group_Definition
    },
    policies?: TOSCA_Policy_Definition[],
    outputs?: {
        [outputKey: string]: TOSCA_Parameter
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
        [artifactKey: string]: TOSCA_Artifact
    },
    data_types?:  {
        [datatypeKey: string]: TOSCA_Datatype
    },
    capability_types?: {
        [capabilityKey: string]: TOSCA_Capability 
    },
    interface_types?: {
        [interfaceKey: string]: TOSCA_Interface2
    },
    relationship_types?: {
        [relationshipKey: string]: TOSCA_Relationship
    },
    node_types?: {
        [grouKey: string]: TOSCA_Group
    },
    policy_types?: TOSCA_Policy[]
    topology_template?: TOSCA_Topology_Template
}


