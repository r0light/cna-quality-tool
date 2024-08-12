import { TOSCA_Node_Definition, TOSCA_Property_Definition, TOSCA_Property_Refinement, TOSCA_Relationship_Definition } from '@/totypa/tosca-types/v2dot0-types/definition-types';
import { all_profiles } from '../../totypa/parsedProfiles/v2dot0-profiles/all_profiles.js'
import { TOSCA_Property_Name } from '@/totypa/tosca-types/v2dot0-types/alias-types';


function getValidPropertyValues(toscaType: "node" | "relationship", definitionKey: string, propertyKey: string): string[] {

    let error = "";

    for (let profile of all_profiles) {
        let searchType: "relationship_types" | "node_types" = (toscaType => {
            switch (toscaType) {
                case "relationship":
                    return "relationship_types";
                case "node":
                default:
                    return "node_types";
            }
        })(toscaType);

        let definitions: { [key: string]: TOSCA_Relationship_Definition | TOSCA_Node_Definition} = profile[searchType];
        if (!definitions) {
            error = `Profiles do not contain any ${searchType}.`;
            continue;
        }

        let definition: TOSCA_Relationship_Definition | TOSCA_Node_Definition = definitions[definitionKey];
        if (!definition) {
            error = `No ${toscaType} with key ${definitionKey} found.`
            continue;
        }

        let properties: {[propertyKey: TOSCA_Property_Name]: TOSCA_Property_Definition | TOSCA_Property_Refinement} = definition.properties;
        if (!properties) {
            error = `No properties found for ${toscaType} with key ${definitionKey}.`
            continue;
        }

        let property: TOSCA_Property_Definition | TOSCA_Property_Refinement = properties[propertyKey];
        if (!property) {
            error = `No property with key ${propertyKey} found for ${definitionKey}.`
            continue;
        }

        let validValues: string[] = property["validation"]["$valid_values"][1];

        if (!validValues) {
            error = `No valid values found for property ${propertyKey} in ${definitionKey}.`
            continue;
        }

        return validValues;
    }

    throw new Error(error);
}

export { getValidPropertyValues }