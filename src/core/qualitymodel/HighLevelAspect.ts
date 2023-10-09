class HighLevelAspect {

    #id: string;
    #name: string;

    constructor(id: string, name: string) {
        this.#id = id;
        this.#name = name;
    }

    get getId() {
        return this.#id;
    }

    get getName() {
        return this.#name;
    }

}

export { HighLevelAspect }