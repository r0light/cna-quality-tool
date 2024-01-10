class LiteratureSource {

    #key: string;
    #info: string;
    #url: string;

    constructor(key: string, info: string, url: string) {
        this.#key = key;
        this.#info = info;
        this.#url = url;
    }

    get getKey() {
        return this.#key;
    }

    get getInfo() {
        return this.#info;
    }

    get getUrl() {
        return this.#url;
    }

}

export { LiteratureSource }