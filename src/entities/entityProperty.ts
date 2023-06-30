/**
 * The module for a property of an entity to provide all information needed for the Editor and TOSCA converter
 * @module entities/entityProperty
 */

type listOptions = {
    value: string,
    text: string
}

type propertyDatatype = "text" | "number" | "boolean" | "list" //TODO  | "map" | "range"

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

    get getDescription() {
        return this.#description;
    }

    get getExample() {
        return this.#example;
    }

    get getRequired() {
        return this.#required;
    }

    get getDataType() {
        return this.#datatype;
    }


}


class TextEntityProperty extends EntityProperty {

    #maxLength: number;

    #proposedOptions: listOptions[]

    constructor(key: string, name: string, description: string, example: string, required: boolean,  maxLength: number, options: listOptions[], value: string) {
        super(key, name, description, example, required, "text", value);
        this.#maxLength = maxLength;
        this.#proposedOptions = options;
    }

    get getMaxLength() {
        return this.#maxLength;
    }

    get getOptions() {
        return this.#proposedOptions;
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


class ListEntityProperty extends EntityProperty {

    constructor(key: string, name: string, description: string, example: string, required: boolean, value: any[]) {
        super(key, name, description, example, required, "list", value);
    }

}



export { EntityProperty, TextEntityProperty, NumberEntityProperty };