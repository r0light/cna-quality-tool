/**
 * The module for a property of an entity to provide all information needed for the Editor and TOSCA converter
 * @module entities/entityProperty
 */

/**
 * Class representing a Entity property
 * @class
 */
class EntityProperty {

    //TODO add a property to configure type of this property?

    #key;

    #name;

    #description;

    #example;

    #required;

    value;

    /**
     * Create an Entity propery
     * @param {key} key The key of the property to be used to uniquely identify it
     * @param {name} name The readable name of the property
     * @param {description} description a description to be used as a help text
     * @param {example} example example value which can be used as a placeholder
     * @param {required} required boolean to indicate whether the property is needed
     * @param {value} value the actual value of this property
     */
    constructor(key, name, description, example, required, value) {
        this.key = key;
        this.name = name;
        this.description = description;
        this.example = example;
        this.required = required;
        this.value = value;
    }

    getKey() {
        return this.#key;
    }

    getName() {
        return this.#name;
    }

    getDescription() {
        return this.#description;
    }

    getExample() {
        return this.#example;
    }

    getRequired() {
        return this.#required;
    }

}

export { EntityProperty };