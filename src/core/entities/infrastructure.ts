import { BackingData } from "./backingData.js";
import { EntityProperty, SelectEntityProperty, parseProperties } from "../common/entityProperty.js";
import { cna_modeling_profile } from '../../totypa/parsedProfiles/v2dot0-profiles/cna_modeling_profile.js'
import { MetaData } from "../common/entityDataTypes.js";
import { RelationToBackingData } from "./relationToBackingData.js";
import { Artifact } from "../common/artifact.js";


/**
 * The module for aspects related to an Infrastructure quality model entity.
 * @module entities/infrastructure
 */

const INFRASTRUCTURE_TOSCA_KEY = "cna-modeling.entities.Infrastructure";
const INFRASTRUCTURE_TOSCA_EQUIVALENT = cna_modeling_profile.node_types[INFRASTRUCTURE_TOSCA_KEY];

function getInfrastructureProperties() {
    let parsed = parseProperties(INFRASTRUCTURE_TOSCA_EQUIVALENT.properties);

    return parsed.map((prop) => {
        switch (prop.getKey) {
            case "kind":
                return new SelectEntityProperty(prop.getKey,
                    "Kind of infrastructure",
                    prop.getDescription,
                    prop.getExample,
                    prop.getRequired,
                    [
                        {
                            value: "physical-hardware",
                            text: "physical hardware"
                        },
                        {
                            value: "virtual-hardware",
                            text: "virtual hardware"
                        },
                        {
                            value: "software-platform",
                            text: "software platform"
                        },
                        {
                            value: "cloud-service",
                            text: "cloud service"
                        }
                    ],
                    prop.getDefaultValue,
                    prop.value);
            case "environment_access":
                return new SelectEntityProperty(prop.getKey,
                    "Environment access",
                    prop.getDescription,
                    prop.getExample,
                    prop.getRequired,
                    [
                        {
                            value: "full",
                            text: "full"
                        },
                        {
                            value: "limited",
                            text: "limited"
                        },
                        {
                            value: "none",
                            text: "none"
                        }
                    ],
                    prop.getDefaultValue,
                    prop.value);
            case "maintenance":
                return new SelectEntityProperty(prop.getKey,
                    "Maintenance",
                    prop.getDescription,
                    prop.getExample,
                    prop.getRequired,
                    [
                        {
                            value: "manual",
                            text: "manual"
                        },
                        {
                            value: "automated",
                            text: "automated"
                        },
                        {
                            value: "transparent",
                            text: "transparent"
                        }
                    ],
                    prop.getDefaultValue,
                    prop.value);
            case "provisioning":
                return new SelectEntityProperty(prop.getKey,
                    "Provisioning",
                    prop.getDescription,
                    prop.getExample,
                    prop.getRequired,
                    [
                        {
                            value: "manual",
                            text: "manual"
                        },
                        {
                            value: "automated-coded",
                            text: "automated coded"
                        },
                        {
                            value: "automated-inferred",
                            text: "automated inferred"
                        },
                        {
                            value: "transparent",
                            text: "transparent"
                        }
                    ],
                    prop.getDefaultValue,
                    prop.value);
            case "deployed_entities_scaling":
                return new SelectEntityProperty(prop.getKey,
                    "Deployed entities scaling",
                    prop.getDescription,
                    prop.getExample,
                    prop.getRequired,
                    [
                        {
                            value: "none",
                            text: "none"
                        },
                        {
                            value: "manual",
                            text: "manual"
                        },
                        {
                            value: "automated-built-in",
                            text: "automated built-in"
                        },
                        {
                            value: "automated-separate",
                            text: "automated separate"
                        }
                    ],
                    prop.getDefaultValue,
                    prop.value);
            case "self_scaling":
                return new SelectEntityProperty(prop.getKey,
                    "Self scaling",
                    prop.getDescription,
                    prop.getExample,
                    prop.getRequired,
                    [
                        {
                            value: "none",
                            text: "none"
                        },
                        {
                            value: "manual",
                            text: "manual"
                        },
                        {
                            value: "automated-built-in",
                            text: "automated built-in"
                        },
                        {
                            value: "automated-separate",
                            text: "automated separate"
                        }
                    ],
                    prop.getDefaultValue,
                    prop.value);
            default:
                return prop;
        }
    })
}

/**
 * Class representing an Infrastructure entity.
 * @class
 */
class Infrastructure {

    #id: string;

    name: string;

    #metaData: MetaData;

    #backingDataEntities = new Array<{ backingData: BackingData, relation: RelationToBackingData }>();

    #artifacts: Map<string, Artifact> = new Map<string, Artifact>();

    #properties: EntityProperty[];

    /**
     * Create an Infrastructure entity.
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Infrastructure entity. 
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     */
    constructor(id: string, name: string, metaData: MetaData) {
        this.#id = id;
        this.name = name;
        this.#metaData = metaData;
        this.#properties = getInfrastructureProperties();
    }

    /**
     * Add a {@link BackingData} entity to the Component. In case the provided entity is not a Backing Data entity, a {@link TypeError} exception will be thrown.
     * @param {BackingData} backingDataEntity The Backing Data entity that should be added.
     * @throws {TypeError} If the provided parameter is neither an instance of External Endpoint, Endpoint, Data Aggregate or Backing Data.  
     */
    addBackingDataEntity(backingDataEntity: BackingData, relation: RelationToBackingData) {
        this.#backingDataEntities.push({ backingData: backingDataEntity, relation: relation });

        /*
        const errorMessage = "The provided entity cannot be added. Only BackingData entities are allowed. However, the object to add was: " + Object.getPrototypeOf(backingDataEntity) + JSON.stringify(backingDataEntity);
        throw new TypeError(errorMessage);
        */
    }

    /**
     * Returns the ID of this Infrastructure entity.
     * @returns {string}
     */
    get getId() {
        return this.#id;
    }

    set setId(newId: string) {
        this.#id = newId;
    }

    /**
     * Return the meta data for this node entity.
     * @returns {MetaData}
     */
    get getMetaData() {
        return this.#metaData;
    }

    /**
     * Return the name of this Infrastructure entity.
     * @returns {string}
     */
    get getName() {
        return this.name;
    }

    /**
     * Returns the {@link BackingData} entities included in this Infrastructure entity.
     * @returns {BackingData[]}
     */
    get getBackingDataEntities() {
        return this.#backingDataEntities;
    }

    get getArtifacts() {
        return this.#artifacts;
    }

    setArtifact(artifactKey: string, artifact: Artifact) {
        this.#artifacts.set(artifactKey, artifact)
    }

    removeArtifact(artifactKey: string) {
        this.#artifacts.delete(artifactKey);
    }

    /**
     * Returns all properties of this entity
     * @returns {EntityProperty[]}
     */
    getProperties() {
        return this.#properties;
    }

    setPropertyValue(propertyKey: string, propertyValue: any) {
        let propertyToSet = (this.#properties.find(property => property.getKey === propertyKey))
        if (propertyToSet) {
            propertyToSet.value = propertyValue
        } else {
            throw new Error(`Property with key ${propertyKey} not found in ${this.constructor}`)
        }
    }

    /**
     * Transforms the Infrastructure object into a String. 
     * @returns {string}
     */
    toString() {
        return "Infrastructure " + JSON.stringify(this);
    }

}

export { Infrastructure, INFRASTRUCTURE_TOSCA_KEY, getInfrastructureProperties };