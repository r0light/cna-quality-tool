type id = string;
type key = string;

class TwoWayKeyIdMap {

    #keyToId = new Map<key, id>();
    #idToKey = new Map<id, key>();

    add(key: key, id: id) {
        if (this.#keyToId.has(key) ) {
            throw new Error(`An entry with key ${key} already exists!`)
        }
        if (this.#idToKey.has(id)) {
            throw new Error(`An entry with id ${id} already exists!`)
        }

        this.#keyToId.set(key, id);
        this.#idToKey.set(id, key);
    }

    getId(key: key) {
        return this.#keyToId.get(key);
    }

    getKey(id: id) {
        return this.#idToKey.get(id);
    }

}

export { TwoWayKeyIdMap }