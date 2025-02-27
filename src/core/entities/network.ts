import { tosca_simple_2_0 } from "@/totypa/parsedProfiles/v2dot0-profiles/tosca_simple_2_0";
import { EntityProperty, mergeAllCapabilitiesProperties, parseCapabilitiesProperties, parseProperties } from "../common/entityProperty";
import { MetaData } from "../common/entityDataTypes";
import { EntityPropertyKey } from "@/totypa/parsedProfiles/v2dot0-profiles/propertyKeys";

const NETWORK_TOSCA_KEY = "Network"
const NETWORK_TOSCA_EQUIVALENT = tosca_simple_2_0.node_types[NETWORK_TOSCA_KEY];

function getNetworkProperties(): EntityProperty[] {
    let parsed = parseProperties(NETWORK_TOSCA_EQUIVALENT.properties).concat(mergeAllCapabilitiesProperties(parseCapabilitiesProperties(NETWORK_TOSCA_EQUIVALENT.capabilities)));

    /*
    return parsed.map((prop) => {
        switch (prop.getKey) {
            case "managed":
                prop.setName = "Managed cloud service?";
                prop.setExample = "e.g. yes";
                return prop;
            default:
                return prop;
        }
    })*/
   return parsed;
}

/**
 * Class representing a Component entity.
 * @class
 */
class Network {

    #id: string;

    name: string;

    #metaData: MetaData;

    #properties: EntityProperty[] = new Array();

    /**
     * Create a Network entity.
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Component entity. 
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     */
    constructor(id: string, name: string, metaData: MetaData) {
        this.#id = id,
        this.name = name;
        this.#metaData = metaData;
        this.#properties = getNetworkProperties();
    }

    /**
     * Returns the ID of this Network entity.
     * @returns {string}
     */
    get getId() {
        return this.#id;
    }

    set setId(newId: string) {
        this.#id = newId;
    }

    /**
     * Return the name of this Network entity.
     * @returns {string}
     */
    get getName() {
        return this.name;
    }

    /**
     * Return the meta data for this node entity.
     * @returns {MetaData}
     */
    get getMetaData() {
        return this.#metaData;
    }

    /**
     * Adds additional properties to this entity, only intended for subtypes to add additional properties
     * 
     * @param {EntityProperty[]} entityProperties 
     */
    addProperties(entityProperties: EntityProperty[]) {
        for (const newProperty of entityProperties) {
            let existingPropertyIndex = this.#properties.findIndex(property => property.getKey === newProperty.getKey);
            if (~existingPropertyIndex) {
                this.#properties[existingPropertyIndex] = newProperty;
            } else {
                this.#properties.push(newProperty);
            }
        }
    }

    setPropertyValue(propertyKey: EntityPropertyKey, propertyValue: any) {
        let propertyToSet = (this.#properties.find(property => property.getKey === propertyKey))
        if (propertyToSet) {
            propertyToSet.value = propertyValue
        } else {
            throw new Error(`Property with key ${propertyKey} not found in ${this.constructor}`)
        }
    }

    getProperty(propertyKey: EntityPropertyKey) {
        return this.#properties.find(property => property.getKey === propertyKey);
    }

    /**
     * Returns all properties of this entity
     * @returns {EntityProperty[]}
     */
    getProperties() {
        return this.#properties;
    }

    /**
     * Transforms the Network object into a String. 
     * @returns {string}
     */
    toString() {
        return "Network " + JSON.stringify(this);
    }

}

export { Network, NETWORK_TOSCA_KEY, getNetworkProperties };