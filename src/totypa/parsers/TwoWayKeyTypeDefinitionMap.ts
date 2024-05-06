import { TOSCA_Artifact_Type_Key, TOSCA_Capability_Type_Key, TOSCA_Datatype_Type_Key, TOSCA_Group_Type_Key, TOSCA_Interface_Type_Key, TOSCA_Node_Type_Key, TOSCA_Policy_Type_Key, TOSCA_Relationship_Type_Key } from "../tosca-types/v2dot0-types/alias-types";
import { TOSCA_Capability_Definition, TOSCA_Datatype_Definition, TOSCA_Interface_Definition, TOSCA_Node_Definition, TOSCA_Relationship_Definition } from "../tosca-types/v2dot0-types/definition-types";
import { TOSCA_Artifact_Definition, TOSCA_Group_Definition, TOSCA_Policy_Definition } from "../tosca-types/v2dot0-types/template-types";

type key = TOSCA_Artifact_Type_Key | TOSCA_Datatype_Type_Key | TOSCA_Capability_Type_Key | TOSCA_Interface_Type_Key | TOSCA_Relationship_Type_Key | TOSCA_Node_Type_Key | TOSCA_Group_Type_Key | TOSCA_Policy_Type_Key;
type typeDefinition = TOSCA_Artifact_Definition | TOSCA_Datatype_Definition | TOSCA_Capability_Definition | TOSCA_Interface_Definition | TOSCA_Relationship_Definition | TOSCA_Node_Definition | TOSCA_Group_Definition | TOSCA_Policy_Definition;

class TwoWayKeyTypeDefinitionMap {

    #keyToType = new Map<key, typeDefinition>();
    #typeToKey = new Map<typeDefinition, key>();

    add(type: typeDefinition, key: key) {
        this.#keyToType.set(key, type);
        this.#typeToKey.set(type, key);
    }

    getKey(type: typeDefinition) { 
        return this.#typeToKey.get(type); 
    }

    getType(key: key) { 
        return this.#keyToType.get(key); 
    }

}

export { TwoWayKeyTypeDefinitionMap }