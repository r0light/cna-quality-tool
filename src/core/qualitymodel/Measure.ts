class Measure {

    #id: string;
    #name: string;
    #description: string;
    #calculation: string;
    #references: string[];

    constructor(id: string, name: string, description: string, calculation: string, references: string[]) {
        this.#id = id;
        this.#name = name;
        this.#description = description;
        this.#calculation = calculation;
        this.#references = references;
    }

    get getId() {
        return this.#id;
    }

    get getName() {
        return this.#name;
    }

    get getDescription() {
        return this.#description
    }

    get getCalculation() {
        return this.#calculation;
    }

    get getReferences() {
        return this.#references;
    }
}

export { Measure }