export class MermaidBuffer {
    #linkCounter: number;
    #elementsSection: string;
    #stylingSection: string;

    constructor() {
        this.#linkCounter = 0;
        this.#elementsSection = "";
        this.#stylingSection = "";
    }

    incrementLinkCounter() {
        this.#linkCounter++;
    }

    get getLinkCounter() {
        return this.#linkCounter;
    }

    addElement(element: string) {
        this.#elementsSection = this.#elementsSection.concat(element);
    }

    get getElementSection() {
        return this.#elementsSection;
    }

    addStyling(style: string) {
        this.#stylingSection = this.#stylingSection.concat(style);
    }

    get getStylingSection() {
        return this.#stylingSection;
    }
}