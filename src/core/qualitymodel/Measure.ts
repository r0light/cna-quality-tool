import { LiteratureSource } from "./LiteratureSource";

class Measure {

    #id: string;
    #name: string;
    #description: string;
    #calculation: string;
    #sources: LiteratureSource[];

    constructor(id: string, name: string, description: string, calculation: string) {
        this.#id = id;
        this.#name = name;
        this.#description = description;
        this.#calculation = calculation;
        this.#sources = [];
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

    get getSources() {
        return this.#sources;
    }

    addSource(literatureSource: LiteratureSource) {
        this.#sources.push(literatureSource);
    }
}

export { Measure }