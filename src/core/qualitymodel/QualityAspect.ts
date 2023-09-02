class QualityAspect {

    #id: string;
    #name: string;
    #highLevelAspect: string;
    #description: string;

    constructor(id: string, name: string, highLevelAspect: string, description: string) {
        this.#id = id;
        this.#name = name;
        this.#highLevelAspect = highLevelAspect;
        this.#description = description;
    }

    get getId() {
        return this.#id;
    }

    get getName() {
        return this.#name;
    }

    get getHighLevelAspect() {
        return this.#highLevelAspect;
    }

    get getDescription() {
        return this.#description;
    }

}

export { QualityAspect }