import { Measure } from "./Measure";

class ProductFactor {

    #id: string;
    #name: string;
    #description: string;
    #measures: Measure[];

    constructor(id: string, name: string, description: string) {
        this.#id = id;
        this.#name = name;
        this.#description = description;
    }

    get getId() {
        return this.#id;
    }

    get getName() {
        return this.#name;
    }

    get getDescription() {
        return this.#description;
    }

    get getMeasures() {
        return this.#measures;
    }

    addMeasure(measure: Measure) {
        this.#measures.push(measure);
    }

}

export { ProductFactor }