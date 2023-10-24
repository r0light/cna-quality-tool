type key = string;
type typeName = string;

class TwoWayKeyTypeMap {

    #keyToType = new Map<key, typeName>();
    #typeToKey = new Map<typeName, key>();

    add(type: typeName, key: key) {
        this.#keyToType.set(key, type);
        this.#typeToKey.set(type, key);
    }

    getKey(type: typeName) { 
        return this.#typeToKey.get(type); 
    }

    getType(key: key) { 
        return this.#keyToType.get(key); 
    }

}

export { TwoWayKeyTypeMap }