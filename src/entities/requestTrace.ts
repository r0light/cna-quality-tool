
import { ExternalEndpoint } from "./externalEndpoint";
import { Link } from "./link";

/**
 * The module for aspects related to a Component quality model Entity.
 * @module entities/requestTrace
 */

/**
 * Class representing a Request Trace entity.
 * @class
 */
class RequestTrace {

    #id: string;

    #modelId: string;

    #name: string;

    #externalEndpoint: ExternalEndpoint;

    #linkEntityIds: Set<string> = new Set();

    /**
     * Create a Request Trace entity.
     * @param {string} name The name of the Request Trace entity.
     * @param {modelId} modelId The ID, the respective entity representation has in the joint.dia.Graph model.
     * @param {ExternalEndpoint} externalEndpoint The {@link ExternalEndpoint} entity for which the Request Trace is being defined.
     * @param {string} linkEntityOrEntities The Id {@link Link} entity or entities that take part in this Request Trace (1...N)
     * @throws {TypeError} If a wrong entity type is being provided
     */
    constructor(name, modelId, externalEndpoint: ExternalEndpoint, linkEntityOrEntities: string[]) {
        for (const linkEntity of linkEntityOrEntities) {
            if (this.#linkEntityIds.has(linkEntity)) {
                return;
            }

            this.#linkEntityIds.add(linkEntity);
        }

        this.#name = name;
        this.#modelId = modelId;
        this.#externalEndpoint = externalEndpoint;
    }

    // TODO include constructor that allows lists?

    /**
      * Adds a {@link Link} entity to this Request Trace.
      * @param {Link} linkEntityToAdd A {@link Link} entity that is part of this RequestTrace.
      * @throws {TypeError} If a wrong entity type is being provided
      */
    addLinkEntity(linkEntityIdToAdd: string) {

        if (this.#linkEntityIds.has(linkEntityIdToAdd)) {
            return;
        }

        this.#linkEntityIds.add(linkEntityIdToAdd);
    }

    /**
     * Returns the ID of this RequestTrace entity.
     * @returns {string}
     */
    get getId() {
        return this.#id;
    }

    /**
     * Returns the ID, the respective entity representation has in the joint.dia.Graph model.
     * @returns {string}
     */
    get getModelId() {
        return this.#modelId;
    }

    /**
     * Returns the name of this Request Trace entity.
     * @returns {string}
     */
    get getName() {
        return this.#name;
    }

    /**
     * Returns the {@link ExternalEndpoint} of this RequestTrace entity.
     * @returns {ExternalEndpoint}
     */
    get getExternalEndpoint() {
        return this.#externalEndpoint;
    }

    /**
      * Changes the {@link ExternalEndpoint}.
      * @param {ExternalEndpoint} newExternalEndpoint The {@link ExternalEndpoint} for of this RequestTrace entity.
      * @throws {TypeError} If a wrong entity type is being provided
      */
    set setExternalEndpoint(newExternalEndpoint) {
        if (!(newExternalEndpoint instanceof ExternalEndpoint)) {
            const errorMessage = "Wrong entity type provided. Only an ExternalEndpoint entity is allowed. However, the provided entity was: " + Object.getPrototypeOf(newExternalEndpoint) + JSON.stringify(newExternalEndpoint);
            throw new TypeError(errorMessage);
        }

        this.#externalEndpoint = newExternalEndpoint;
    }

    /**
     * Returns the IDs of the {@link Link} entities involved in this RequestTrace entity.
     * @returns {string}
     */
    get getLinkEntityIds() {
        return this.#linkEntityIds;
    }

    /**
     * Transforms the RequestTrace object into a String. 
     * @returns {string}
     */
    toString() {
        return "RequestTrace " + JSON.stringify(this);
    }
}

export { RequestTrace };