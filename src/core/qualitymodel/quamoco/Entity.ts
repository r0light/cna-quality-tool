type RelationType = {type: "" | "part-of" | "is-a", target: string};

class Entity {

    #key: string;
    #name: string;
    #description: string;
    #formalSpecification: string;
    #symbol: string;
    #relation: RelationType;

    constructor(key: string, name: string, description: string, symbol: string, formalSpecification: string, relation: RelationType) {
        this.#key = key;
        this.#name = name;
        this.#description = description;
        this.#symbol = symbol;
        this.#formalSpecification = formalSpecification;
        this.#relation = relation;
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

    get getSymbol() {
        return this.#symbol;
    }

    get getFormalSpecification() {
        return this.#formalSpecification;
    }

    get getRelation() {
        return this.#relation;
    }


}

export { Entity, RelationType }