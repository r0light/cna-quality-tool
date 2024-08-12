
// 5.4.2.1 TOSCA version
export type TOSCA_Version = string

// 5.4.6 Validation clause definition
export type TOSCA_Validation_Clause = TOSCA_Function_Call;

// see 6.2 Boolean Functions
export type TOSCA_Condition_Clause = TOSCA_Function_Call;

// 5.4.14 Function syntax
export type TOSCA_Function_Name = string;
export type TOSCA_Function_Reference = `$${TOSCA_Function_Name}`;
export type functionArgument = (string | functionArgument | TOSCA_Function_Call)[];
export type TOSCA_Function_Call = TOSCA_Function_Reference | { [key: TOSCA_Function_Reference]: functionArgument};

// 5.4.8 Property assignment
export type TOSCA_Property_Assignment = any

// 5.4.10 Attribute assignment
export type TOSCA_Attribute_Assignment = any

export type TOSCA_Parameter_Assignment = any | TOSCA_Function_Call

export type TOSCA_Profile_Name = string;
export type TOSCA_Repository_Name = string;
export type TOSCA_Parameter_Name = string;
export type TOSCA_Property_Name = string;
export type TOSCA_Attribute_Name = string;
export type TOSCA_Trigger_Name = string;
export type TOSCA_Workflow_Name = string;
export type TOSCA_Operation_Name = string;
export type TOSCA_Notification_Name = string;
export type TOSCA_Workflow_Step_Name = string;

export type TOSCA_Artifact_Type_Key = string;
export type TOSCA_Datatype_Type_Key = string;
export type TOSCA_Capability_Type_Key = string;
export type TOSCA_Interface_Type_Key = string;
export type TOSCA_Node_Type_Key = string;
export type TOSCA_Relationship_Type_Key = string;
export type TOSCA_Requirement_Type_Key = string;
export type TOSCA_Group_Type_Key = string;
export type TOSCA_Policy_Type_Key = string;
export type TOSCA_Trigger_Type_Key = string;

export type TOSCA_Group_Template_Key = string;
export type TOSCA_Node_Template_Key = string;
export type TOSCA_Relationship_Template_Key = string;
