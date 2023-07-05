type id = string;
type key = string;

class TwoWayKeyIdMap {

    #keyToId = new Map<key, id>();
    #idToKey = new Map<id, key>();

    add(key: key, id: id) {
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