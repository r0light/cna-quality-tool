type key = string;
type tsType = {typeName: string, sourceFile: string};

class TwoWayKeyTypeMap {

    #keyToType = new Map<key, tsType>();
    #typeToKey = new Map<tsType, key>();

    add(type: tsType, key: key) {
        this.#keyToType.set(key, type);
        this.#typeToKey.set(type, key);
    }

    getKey(type: tsType) { 
        return this.#typeToKey.get(type); 
    }

    getType(key: key) { 
        return this.#keyToType.get(key); 
    }

}

export { TwoWayKeyTypeMap }