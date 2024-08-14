import { Component, System } from "../../entities";
import { LiteratureSource } from "./LiteratureSource";

type MeasureValue = number | string | "n/a";
type Calculation<T> = (parameters: T) => MeasureValue;

class Measure<T> {

    #id: string;
    #name: string;
    #calculationDescription: string;
    #calculation: Calculation<T>;
    #sources: LiteratureSource[];

    constructor(id: string, name: string, calculationDescription: string) {
        this.#id = id;
        this.#name = name;
        this.#calculationDescription = calculationDescription;
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

    get getSources() {
        return this.#sources;
    }

    addSource(literatureSource: LiteratureSource) {
        this.#sources.push(literatureSource);
    }

    addCalculation(calculation: Calculation<T>) {
        this.#calculation = calculation;
    }

    isCalculationAvailable() {
        return !!this.#calculation;
    }

    calculate(parameters: T) {
        return this.#calculation(parameters);
    }
}

export { Measure, MeasureValue, Calculation }