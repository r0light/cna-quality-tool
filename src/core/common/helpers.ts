import { TOSCA_Node_Definition, TOSCA_Property_Definition, TOSCA_Property_Refinement, TOSCA_Relationship_Definition } from '@/totypa/tosca-types/v2dot0-types/definition-types';
import { all_profiles } from '../../totypa/parsedProfiles/v2dot0-profiles/all_profiles.js'
import { TOSCA_Property_Name } from '@/totypa/tosca-types/v2dot0-types/alias-types';
import { COMPONENT_TOSCA_KEY } from '../entities/component.js';
import { cna_modeling_tosca_profile } from '@/totypa/parsedProfiles/v2dot0-profiles/cna_modeling_tosca_profile.js';
import { ENDPOINT_TOSCA_EQUIVALENT, ENDPOINT_TOSCA_KEY } from '../entities/endpoint.js';


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

function getCapabilityTypeDefinition(capabilityTypeKeyToFind: string) {

    for (let profile of all_profiles) {
        let capabilityTypes = profile.capability_types;
        if (capabilityTypes) {
            for (const [capabilityTypeKey, capabilityTypeDefinition] of Object.entries(capabilityTypes)) {
                if (capabilityTypeKey === capabilityTypeKeyToFind) {
                    return capabilityTypeDefinition;
                }
            }
        }
    }
    throw new Error(`No capability type with key ${capabilityTypeKeyToFind} found in any profile.`)
}


const refineValue = (thingToRefine: any, thingWithRefinements: any) => {
    if (["string", "boolean", "number"].includes(typeof thingWithRefinements)) {
        return thingWithRefinements;
    } else if (Array.isArray(thingWithRefinements)) {
        if (Array.isArray(thingToRefine)) {
            for (let element of thingWithRefinements) {
                if (typeof element === "object" && Object.entries(element).length === 1) {
                    // is a list of "complex" elements, which might already exist and need to be refined
                    let elementKey = Object.entries(element)[0][0];
                    let indexOfExistingElement = thingToRefine.findIndex(existingElement => {
                        return typeof existingElement === "object" && Object.entries(existingElement).length === 1 && Object.entries(existingElement)[0][0] === elementKey;
                    });
                    if (~indexOfExistingElement) {
                        thingToRefine[indexOfExistingElement] = element;
                    } else {
                        thingToRefine.push(element);
                    }
                } else if (!thingToRefine.includes(element)) {
                    thingToRefine.push(element);
                }
            }
            return thingToRefine;
        } else {
            return thingWithRefinements;
        }
    } else {
        // thingWithRefinements is an object
        if (!thingToRefine) {
            thingToRefine = {};
        }
        for (let [attributeKey, attributeValue] of Object.entries(thingWithRefinements)) {
            if (thingToRefine.hasOwnProperty(attributeKey)) {
                thingToRefine[attributeKey] = refineValue(thingToRefine[attributeKey], attributeValue);
            } else {
                thingToRefine[attributeKey] = attributeValue;
            }
        }
        return thingToRefine;
    }
}


function getIdentityTypes(): {value: string, text: string}[] {
    const COMPONENT_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types[COMPONENT_TOSCA_KEY];

    if (COMPONENT_TOSCA_EQUIVALENT.properties 
        && COMPONENT_TOSCA_EQUIVALENT.properties.identities 
        && COMPONENT_TOSCA_EQUIVALENT.properties.identities["entry_schema"]
        && COMPONENT_TOSCA_EQUIVALENT.properties.identities["entry_schema"].validation
        && COMPONENT_TOSCA_EQUIVALENT.properties.identities["entry_schema"].validation["$valid_values"]) {
        let validValues = COMPONENT_TOSCA_EQUIVALENT.properties.identities["entry_schema"].validation["$valid_values"];
        let validOptions = validValues[1];
        return validOptions;
    }
    return [];
}

function getAuthenticationMethods(): string[] {
    const ENDPOINT_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types[ENDPOINT_TOSCA_KEY];

    if (ENDPOINT_TOSCA_EQUIVALENT.properties 
        && ENDPOINT_TOSCA_EQUIVALENT.properties.supported_authentication_methods 
        && ENDPOINT_TOSCA_EQUIVALENT.properties.supported_authentication_methods["entry_schema"]
        && ENDPOINT_TOSCA_EQUIVALENT.properties.supported_authentication_methods["entry_schema"].validation
        && ENDPOINT_TOSCA_EQUIVALENT.properties.supported_authentication_methods["entry_schema"].validation["$valid_values"]) {
        let validValues = ENDPOINT_TOSCA_EQUIVALENT.properties.supported_authentication_methods["entry_schema"].validation["$valid_values"];
        let validOptions = validValues[1];
        return validOptions;
    }
    return [];
}


export { getValidPropertyValues, getCapabilityTypeDefinition, refineValue, getIdentityTypes, getAuthenticationMethods}