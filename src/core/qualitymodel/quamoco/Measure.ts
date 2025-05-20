import { Component, Infrastructure, RequestTrace, System } from "@/core/entities";
import { ENTITIES } from "../specifications/entities";
import { MeasureKey } from "../specifications/qualitymodel";
import { LiteratureSource } from "./LiteratureSource";

type MeasureValue = number | string | "n/a";
type CalculationParameters<T> = { entity: T, system: System };
type Calculation = (parameters: CalculationParameters<any>) => MeasureValue;

class Measure {

    #id: MeasureKey;
    #name: string;
    #calculationDescription: string;
    #calculationFormula: string;
    #helperFunctions: string[];
    #calculation: Calculation;
    #sources: LiteratureSource[];

    constructor(id: MeasureKey, name: string, calculationDescription: string, calculationFormula: string, helperFunctions: string[]) {
        this.#id = id;
        this.#name = name;
        this.#calculationDescription = calculationDescription;
        this.#calculationFormula = calculationFormula;
        this.#helperFunctions = helperFunctions;
        this.#calculation = undefined;
        this.#sources = [];
    }

    get getId() {
        return this.#id;
    }

    get getName() {
        return this.#name;
    }

    get getCalculationDescription() {
        return this.#calculationDescription;
    }
    
    get getCalculationFormula() {
        return this.#calculationFormula;
    }

    get getHelperFunctions() {
        return this.#helperFunctions;
    }

    get getSources() {
        return this.#sources;
    }

    addSource(literatureSource: LiteratureSource) {
        this.#sources.push(literatureSource);
    }

    addCalculation(calculation: Calculation) {
        this.#calculation = calculation;
    }

    isCalculationAvailable() {
        return !!this.#calculation;
    }

    calculate(parameters: CalculationParameters<any>) {
        return this.#calculation(parameters);
    }
}

export { Measure, MeasureValue, Calculation, CalculationParameters }