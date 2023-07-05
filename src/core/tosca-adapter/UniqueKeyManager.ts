class UniqueKeyManager {

    #MATCH_SUFFIX = new RegExp(/_([a-z]+)$/g)

    #keys = new Set<string>();

    ensureUniqueness(newKey: string): string {
        if(this.#keys.has(newKey)) {
            // key is not unique, so a new one needs to be found
            let suffix = [97];
            let alternativeKey = `${newKey}${this.#toStringSuffix(suffix)}`;
            while(this.#keys.has(alternativeKey)) {
                suffix = this.#advanceSuffix(suffix);
                alternativeKey = alternativeKey.replace(this.#MATCH_SUFFIX, this.#toStringSuffix(suffix));
            }
            // new unique key found
            this.#keys.add(alternativeKey);
            return alternativeKey
        } else {
            // key is unique
            this.#keys.add(newKey);
            return newKey;
        }
    }

    #toStringSuffix(currentSuffix: number[]): string {
        let suffix = "_";
        for (let position of currentSuffix) {
            suffix = suffix + String.fromCharCode(position);
        }
        return suffix
    }

    #advanceSuffix(currentSuffix: number[]): number[] {
        // 'a' corresponds to charCode 97 and 'z' corresponds to charCode 122

        for (let i = 0; i<currentSuffix.length;i++) {
            if (currentSuffix[i] < 122) {
                currentSuffix[i] = currentSuffix[i] + 1
                return currentSuffix;
            }
        }
        // all positions are at 122, therefore add new position which starts at 97 ('a')
        currentSuffix.push(97);
        return currentSuffix;
    }
}

export { UniqueKeyManager };