import { ProductFactor } from "./ProductFactor";
import { QualityAspect } from "./QualityAspect";

type ImpactType = "--" | "-" | "o" | "+" | "++";

class Impact {

    #impactedFactor: ProductFactor | QualityAspect;
    #sourceFactor: ProductFactor;
    #impactType: ImpactType;

    constructor(impactedFactor: ProductFactor | QualityAspect, sourceFactor: ProductFactor, impactType: ImpactType) {
        this.#impactedFactor = impactedFactor;
        this.#sourceFactor = sourceFactor;
        this.#impactType = impactType;

    }

    get getImpactedFactor() {
        return this.#impactedFactor;
    }

    get getSourceFactor() {
        return this.#sourceFactor;
    }

    get getImpactType() {
        return this.#impactType;
    }
}

export { ImpactType, Impact }