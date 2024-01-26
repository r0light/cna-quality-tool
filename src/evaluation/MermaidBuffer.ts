export class MermaidBuffer {
    #linkCounter: number;
    #addedElementIds: string[];
    #elementsSection: string;
    #stylingSection: string;

    constructor() {
        this.#linkCounter = 0;
        this.#addedElementIds = [];
        this.#elementsSection = "";
        this.#stylingSection = "";
    }

    incrementLinkCounter() {
        this.#linkCounter++;
    }

    get getLinkCounter() {
        return this.#linkCounter;
    }

    isNotYetAdded(elementId: string) {
        return !this.#addedElementIds.includes(elementId);
    }

    addElement(elementId: string, element: string) {
        this.#elementsSection = this.#elementsSection.concat(element);
        this.#addedElementIds.push(elementId);
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