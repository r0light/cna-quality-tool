/**
 * The module for a property of an entity to provide all information needed for the Editor and TOSCA converter
 * @module entities/entityProperty
 */

import { all_profiles } from "@/totypa/parsedProfiles/all_profiles";
import { TOSCA_Property } from "@/totypa/tosca-types/core-types";
import { TOSCA_Node } from "@/totypa/tosca-types/entity-types";
import { parse } from "path";

type propertyDatatype = "text" | "textarea" | "number" | "boolean" | "bounded" | "list" | "map" //TODO | "timestamp" | "version"

/**
 * Class representing an Entity property
 * @class
 */
class EntityProperty {

    #key: string; //string

    #name: string; //string

    #description: string; //string

    #example: string; //string

    #required: boolean; //boolean

    #datatype: propertyDatatype; //constant text, number, boolean, list

    value: any;

    /**
     * Create an Entity property
     * @param {key} key The key of the property to be used to uniquely identify it
     * @param {name} name The readable name of the property
     * @param {description} description a description to be used as a help text
     * @param {example} example example value which can be used as a placeholder
     * @param {required} required boolean to indicate whether the property is needed
     * @param {datatype} datatype the type of the property, can be "text" | "number" | "boolean" | "list"
     * @param {maxLength} maxLength only for the "number" type, maximum number of digits
     * @param {options} options only for the "list" type, an array of options to choose from
     * @param {value} value the actual value of this property
     */
    constructor(key: string, name: string, description: string, example: string, required: boolean, datatype: propertyDatatype, value: any) {
        this.#key = key;
        this.#name = name;
        this.#description = description;
        this.#example = example;
        this.#required = required;
        this.#datatype = datatype;
        this.value = value;
    }

    get getKey() {
        return this.#key;
    }

    get getName() {
        return this.#name;
    }

    set setName(name: string) {
        this.#name = name;
    }

    get getDescription() {
        return this.#description;
    }

    set setDescription(description: string) {
        this.#description = description;
    }

    get getExample() {
        return this.#example;
    }

    set setExample(example: string) {
        this.#example = example;
    }

    get getRequired() {
        return this.#required;
    }

    get getDataType() {
        return this.#datatype;
    }

}


type listOptions = {
    value: string,
    text: string
}

class TextEntityProperty extends EntityProperty {

    #maxLength: number;

    #proposedOptions: listOptions[]

    constructor(key: string, name: string, description: string, example: string, required: boolean, maxLength: number, options: listOptions[], value: string) {
        super(key, name, description, example, required, "text", value);
        this.#maxLength = maxLength;
        this.#proposedOptions = options;
    }

    get getMaxLength() {
        return this.#maxLength;
    }

    set setMaxLength(maxLength: number) {
        this.#maxLength = maxLength;
    }

    get getOptions() {
        return this.#proposedOptions;
    }

    set setOptions(options: listOptions[]) {
        this.#proposedOptions = options;
    }

}

class TextAreaEntityProperty extends EntityProperty {

    #maxLength: number;

    #rows: number;

    constructor(key: string, name: string, description: string, example: string, required: boolean, maxLength: number, rows: number, value: string) {
        super(key, name, description, example, required, "textarea", value);
        this.#maxLength = maxLength;
        this.#rows = rows;
    }

    get getMaxLength() {
        return this.#maxLength;
    }

    set setMaxLength(maxLength: number) {
        this.#maxLength = maxLength;
    }

    get getRows() {
        return this.#rows;
    }

    set setRows(rows: number) {
        this.#rows = rows;
    }


}

class NumberEntityProperty extends EntityProperty {

    #maximumValue: number;

    #minimumValue: number;

    constructor(key: string, name: string, description: string, example: string, required: boolean, maximumValue: number, minimumValue: number, value: number) {
        super(key, name, description, example, required, "number", value);
        this.#maximumValue = maximumValue;
        this.#minimumValue = minimumValue;
    }

    get getMaximum() {
        return this.#maximumValue;
    }

    get getMinimum() {
        return this.#minimumValue;
    }


}

class BooleanEntityProperty extends EntityProperty {

    constructor(key: string, name: string, description: string, example: string, required: boolean, value: boolean) {
        super(key, name, description, example, required, "boolean", value);
    }

}

class BoundsEntityProperty extends EntityProperty {

    constructor(key: string, name: string, description: string, example: string, required: boolean, value: (number | string)[]) {
        super(key, name, description, example, required, "bounded", value);
    }

}


class ListEntityProperty extends EntityProperty {

    constructor(key: string, name: string, description: string, example: string, required: boolean, value: any[]) {
        super(key, name, description, example, required, "list", value);
    }

}

class MapEntityProperty extends EntityProperty {

    #keyType: string;

    #keyDescription: string;

    #valueType: string;

    #valueDescription: string;

    constructor(key: string, name: string, description: string, example: string, required: boolean, value: object, keyType: string, keyDescription: string, valueType: string, valueDescription: string) {
        super(key, name, description, example, required, "map", value);
        this.#keyType = keyType;
        this.#keyDescription = keyDescription;
        this.#valueType = valueType;
        this.#valueDescription = valueDescription;
    }

    get getKeyType() {
        return this.#keyType;
    }

    get getKeyDescription() {
        return this.#keyDescription;
    }

    get getValueType() {
        return this.#valueType;
    }

    get getValueDescription() {
        return this.#valueDescription;
    }
}

function loadAllProperties(nodeDefinition: TOSCA_Node): EntityProperty[] {
    let parsedProperties: EntityProperty[] = [];
    let currentNode = nodeDefinition;
    if (nodeDefinition.properties) {
        parsedProperties.push(...parseProperties(nodeDefinition.properties));
    }
    while (currentNode.derived_from) {
        let nextNode = all_profiles.flatMap(profile => Object.entries(profile.node_types)).find(([nodeName, nodeType]) => nodeName === currentNode.derived_from);
        if (nextNode) {
            currentNode = nextNode[1];
            if (currentNode.properties) {
                parsedProperties.push(...parseProperties(currentNode.properties));
            }
        } else {
            break;
        }
    }
    return parsedProperties;
}

function toReadableKey(yamlKey: string) {
    return yamlKey.replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())       // Initial char (after -/_)
        .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase()) // First char after each -/_
}

function parseProperties(properties: { [propertyKey: string]: TOSCA_Property }): EntityProperty[] {

    let parsedProperties: EntityProperty[] = [];

    for (const [key, property] of Object.entries(properties)) {
        switch (property.type) {
            case "string":
            case "timestamp": // TODO more specific type?
            case "version": // TODO more specific type?
            case "scalar-unit": // TODO more specific type(s)!
            default:
                parsedProperties.push(new TextEntityProperty(key,
                    toReadableKey(key),
                    property.description ? property.description : "",
                    "",
                    property.required,
                    255,
                    [],
                    ""));
                break;
            case "integer":
            case "float": // TODO more specific property?
                parsedProperties.push(new NumberEntityProperty(key, 
                    toReadableKey(key), 
                    property.description ? property.description : "", 
                    "", 
                    property.required, 
                    Number.MAX_SAFE_INTEGER, 
                    Number.MIN_SAFE_INTEGER, 
                    0));
                break;
            case "boolean":
                parsedProperties.push(new BooleanEntityProperty(key, 
                    toReadableKey(key), 
                    property.description ? property.description : "",
                    "", 
                    property.required, 
                    false));
                break;
            case "range":
                parsedProperties.push(new BoundsEntityProperty(key, 
                    toReadableKey(key), 
                    property.description ? property.description : "",
                    "", 
                    property.required, 
                    [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]));
                break;
            case "list":
                parsedProperties.push(new ListEntityProperty(key, 
                    toReadableKey(key), 
                    property.description ? property.description : "", 
                    "", 
                    property.required, 
                    []))
                break;
            case "map":

                parsedProperties.push(new MapEntityProperty(key, 
                    toReadableKey(key), 
                    property.description ? property.description : "",
                    "", 
                    property.required, 
                    {},
                    property.key_schema ? property.key_schema.type : "string",
                    property.key_schema ? property.key_schema.description : "",
                    property.entry_schema ? property.entry_schema.type : "string",
                    property.entry_schema ? property.entry_schema.description : ""))
                    //TODO handle case where a map does not have a key_schema
                break;
        }
    }

    return parsedProperties;
}


export { EntityProperty, TextEntityProperty, TextAreaEntityProperty, NumberEntityProperty, BooleanEntityProperty, BoundsEntityProperty as BoundedEntityProperty, ListEntityProperty, MapEntityProperty, loadAllProperties, parseProperties };