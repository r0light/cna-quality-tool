import { TOSCA_Artifact_Type_Key, TOSCA_Capability_Type_Key, TOSCA_Datatype_Type_Key, TOSCA_Group_Type_Key, TOSCA_Interface_Type_Key, TOSCA_Node_Type_Key, TOSCA_Policy_Type_Key, TOSCA_Relationship_Type_Key } from "../tosca-types/v2dot0-types/alias-types";
import { TOSCA_Artifact_Type_Definition, TOSCA_Capability_Type_Definition, TOSCA_Datatype_Definition, TOSCA_Group_Type_Definition, TOSCA_Interface_Type_Definition, TOSCA_Node_Definition, TOSCA_Policy_Type_Definition, TOSCA_Relationship_Definition } from "../tosca-types/v2dot0-types/definition-types";

//type key = TOSCA_Artifact_Type_Key | TOSCA_Datatype_Type_Key | TOSCA_Capability_Type_Key | TOSCA_Interface_Type_Key | TOSCA_Relationship_Type_Key | TOSCA_Node_Type_Key | TOSCA_Group_Type_Key | TOSCA_Policy_Type_Key;
//type typeDefinition = TOSCA_Artifact_Type_Definition | TOSCA_Datatype_Definition | TOSCA_Capability_Type_Definition | TOSCA_Interface_Type_Definition | TOSCA_Relationship_Definition | TOSCA_Node_Definition | TOSCA_Group_Type_Definition | TOSCA_Policy_Type_Definition;

class TwoWayKeyTypeDefinitionMap<key, typeDefinition> {

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

    iterateWithDependencyConstraint(toIterate: [key, typeDefinition][], dependsOnElementByKey: (elementWithDependency: typeDefinition) => key, process: (element: [key, typeDefinition]) => void) {

        let elementsToIterate = toIterate.slice();
        let numberOfProcessedElements: number = 0;
        let elementsWithUnresolvedDependency: key[] = [];

        elementLoop: while (elementsToIterate.length > 0) {
            let currentElement = elementsToIterate[0];

            let dependency = dependsOnElementByKey(currentElement[1])
            if (dependency) {
                if (this.getType(dependency)) {
                    // dependency has been processed and we can continue;
                    let index = elementsWithUnresolvedDependency.indexOf(currentElement[0]);
                    if (~index) {
                        elementsWithUnresolvedDependency.splice(index, 1)
                    }
                } else {
                    // check if processing has to stop with error because dependency cannot be found in elementsToIterate
                    if (toIterate.filter(([key, typeDefinition]) => { return key === dependency}).length < 1) {
                        throw new Error(`Dependency ${dependency}, on which ${currentElement[0]} depends, does not exist in current iteration.`);
                    }

                    // dependency has not been resolved yet and we have to push the current element to the end of the array
                    elementsToIterate.splice(0, 1);
                    elementsWithUnresolvedDependency.push(currentElement[0]);
                    continue elementLoop;
                }

            }

            process(currentElement);
            elementsToIterate.splice(0, 1);
            numberOfProcessedElements = numberOfProcessedElements + 1;

        }
    }

}

export { TwoWayKeyTypeDefinitionMap }