import { EntityProperty, TextEntityProperty, parseProperties } from "../common/entityProperty";
import { tosca_simple_profile_for_yaml_v1_3 } from '../../totypa/parsedProfiles/tosca_simple_profile_for_yaml_v1_3'

const ENDPOINT_TOSCA_EQUIVALENT = tosca_simple_profile_for_yaml_v1_3.capability_types["tosca.capabilities.Endpoint"];

/**
 * The module for aspects related to a Endpoint quality model Entity.
 * @module entities/endpoint
 */

function getEndpointProperties(): EntityProperty[] {
    let parsed = parseProperties(ENDPOINT_TOSCA_EQUIVALENT.properties);

    for (const prop of parsed) {
        switch (prop.getKey) {
            case "protocol":
                prop.setName = "Endpoint Type:";
                prop.setExample = "e.g. HTTP GET";
                (prop as TextEntityProperty).setOptions = [{
                    value: "GET",
                    text: "GET"
                },
                {
                    value: "POST",
                    text: "POST"
                },
                {
                    value: "Topic send-to",
                    text: "Topic send-to"
                },
                {
                    value: "Topic receive-from",
                    text: "Topic receive-from"
                }
                ];
                break;
            case "url_path":
                prop.setName = "Endpoint Path:";
                prop.setExample = "e.g. /orders";
                break;
            case "port": // TODO transform to Number type?
                prop.setName = "Port: ";
                prop.setExample = "e.g. 3306"
                break;
        }
    }
    return parsed;
}


/**
 * Class representing an Endpoint entity.
 * @class
 */
class Endpoint {

    #id: string; //TODO

    #modelId: string;

    #parentName: string; //TODO change to id

    #properties: EntityProperty[];

    // TODO ref Component here?

    /**
     * Create an Endpoint entity.
     * @param {modelId} modelId The ID, the respective entity representation has in the joint.dia.Graph model.
     * @param {string} parentName The name of the parent Entity.
     */
    constructor(modelId: string, parentName: string) {
        this.#modelId = modelId;
        this.#parentName = parentName;
        this.#properties = getEndpointProperties();
    }

    /**
     * Returns the ne name ID, which is a combination of the parent Entity's name and the Endpoint URL Path (parentName-urlPath).
     * @returns {string}
     */
    getNameId() {
        let endpointDescription;

        let endpointType = this.#properties.find(property => property.getKey === "endpointType").value;
        let endpointName = this.#properties.find(property => property.getKey === "endpointPath").value;

        if (endpointType?.toLowerCase().includes("topic")) {
            endpointDescription = endpointName + "-" + endpointType.replace(/Topic/gi, "").trim();
        } else {
            let type = `${endpointType.slice(0, 1).toUpperCase()}${endpointType.slice(1).toLowerCase()}`;
            let splittedPath = endpointName.split("/");
            let name = "";
            for (const splittedWord of splittedPath) {
                if (splittedWord.includes("?")) {
                    let additionalSplit = splittedWord.split("?");
                    let remainingString = additionalSplit[1].split("="); console.log(remainingString)
                    name += `${additionalSplit[0].slice(0, 1).toUpperCase()}${additionalSplit[0].slice(1).toLowerCase()}By${remainingString[0].slice(0, 1).toUpperCase()}${remainingString[0].slice(1).toLowerCase()}`
                } else if (splittedWord.includes("{")) {
                    let correctedString = splittedWord.replace("{", "").replace("}", "");
                    name += `By${correctedString.slice(0, 1).toUpperCase()}${correctedString.slice(1).toLowerCase()}`;
                } else if (splittedWord === "") {
                    // ignore
                } else {
                    name += `${splittedWord.slice(0, 1).toUpperCase()}${splittedWord.slice(1).toLowerCase()}`;
                }
            }
            endpointDescription = type + name;
        }

        return `${this.#parentName}-${endpointDescription}`;
    }

    /**
    * Returns the ID of this Backing Data entity.
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
     * Adds additional properties to this entity, only intended for subtypes to add additional properties
     * 
     * @param {EntityProperty[]} entityProperties 
     */
    addProperties(entityProperties: EntityProperty[]) {
        this.#properties = this.#properties.concat(entityProperties);
    }

    getProperties() {
        return this.#properties;
    }

    /**
     * Return the name of the parent entity where this Endpoint is available.
     * @returns {string}
     */
    get getParentName() {
        return this.#parentName;
    }

    /**
     * Transforms the Endpoint object into a String. 
     * @returns {string}
     */
    toString() {
        return "Endpoint " + JSON.stringify(this);
    }
}

export { Endpoint, ENDPOINT_TOSCA_EQUIVALENT, getEndpointProperties }; // TODO keep endpointType?