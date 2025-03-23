import EntityTypes from "./entityTypes";
import { getComponentProperties, getBackingServiceProperties, getStorageBackingServiceProperties, getEndpointProperties, getExternalEndpointProperties, getInfrastructureProperties, getRequestTraceProperties, getBackingDataProperties, getDataAggregateProperties, getDeploymentMappingProperties, getLinkProperties, getServiceProperties, getProxyBackingServiceProperties } from "../../core/entities";
import { DialogConfig, DialogMetaData, DialogSize, FormContentConfig, UIContentType } from "./actionDialogConfig";
import { EntityProperty, NumberEntityProperty, SelectEntityProperty, TextEntityProperty } from "../../core/common/entityProperty";
import { getDataAggregateRelationshipProperties } from "@/core/entities/relationToDataAggregate";
import { getBackingDataRelationshipProperties } from "@/core/entities/relationToBackingData";
import { getBrokerBackingServiceProperties } from "@/core/entities/brokerBackingService";
import { getNetworkProperties } from "@/core/entities/network";

export type DatalistItem = {
    value: string,
    text: string,
    selected: boolean
}

export type InputProperties = {
    disabled: boolean,
    required: boolean,
    checked: boolean,
    selected: boolean,
    readonly: boolean,
    additionalButton?: InputProperties
}

export type JointJsConfig = {
    propertyType: "attribute" | "providedMethod" | "property" | "customProperty" | "relation" | "free",
    modelPath: string,
    defaultPropPath: string,
    minPath: string,
    min: string
}

export type BasicPropertyConfig = {
    providedFeature: string,
    label: string,
    inputProperties: InputProperties,
    helpText: string,
    show: boolean,
    provideEnterButton: boolean,
    jointJsConfig: JointJsConfig
}

export type TextPropertyConfig = BasicPropertyConfig & {
    contentType: "text",
    attributes: {
        placeholder: string,
        defaultValue: string,
        svgRepresentation: string,
        inputLabelIcon: string,
        provideEditButton: boolean,
        suggestedValues: { value: string, text: string }[]
    }
}

export type TextAreaPropertyConfig = BasicPropertyConfig & {
    contentType: "textarea",
    attributes: {
        rows: number,
        maxLength: number,
        placeholder: string,
        defaultValue: string,
        provideEnterButton: boolean
    }
}

export type NumberPropertyConfig = BasicPropertyConfig & {
    contentType: "number",
    attributes: {
        min: number,
        max: number,
        defaultValue: number,
    }
}

export type NumberRangePropertyConfig = BasicPropertyConfig & {
    contentType: "range",
    attributes: {
        min: number,
        max: number,
        defaultValue: number,
        step: number,
        provideEnterButton: false
    }
}

export type CheckboxPropertyConfig = BasicPropertyConfig & {
    contentType: "checkbox",
    attributes: {
        defaultValue: boolean,
    }
}

export type CheckboxWithoutLabelPropertyConfig = BasicPropertyConfig & {
    contentType: "checkbox-without-label",
    attributes: {
        defaultValue: boolean,
    }
    id: string
}

export type DropdownPropertyConfig = BasicPropertyConfig & {
    contentType: "select",
    attributes: {
        svgRepresentation: string,
        placeholder: string,
        defaultValue: string,
    },
    dropdownOptions: DropdownOptionConfig[]
}

export type DropdownOptionConfig = {
    optionValue: string,
    optionText: string,
    optionTitle: string,
    representationClass: string,
    disabled: boolean
}

export type MultiSelectPropertyConfig = BasicPropertyConfig & {
    contentType: "multi-select",
    attributes: {
        svgRepresentation: string,
        buttonText: string,
        buttonIconClass: string,
        dialogMetaData: DialogMetaData,
        dialogInfo: string,
        tableColumnHeaders: { text: string }[]
    }
}

export type TogglePropertyConfig = BasicPropertyConfig & {
    contentType: "toggle",
    labels: {
        headLabel: string,
        leftLabel: string,
        rightLabel: string
    }
}

export type DynamicListPropertyConfig = BasicPropertyConfig & {
    contentType: "dynamic-list",
    attributes: {
        svgRepresentation: string,
        buttonText: string,
        buttonIconClass: string,
        dialogMetaData: DialogMetaData,
        dialogInfo: string,
        listElementFields: (ListElementTextField | ListElementDropdownField)[],
        addElementButton: {
            label: string,
            labelIcon: string
        }
    }
}

export type ListElementField = {
    key: string,
    label: string,
    helpText: string,
    labelIcon: string
}

export type ListElementTextField = ListElementField & {
    fieldType: "text",
    placeholder: string
}

export type ListElementDropdownField = ListElementField & {
    fieldType: "dropdown",
    dropdownOptions: string[],
}

export type PropertyConfig = TextPropertyConfig | TextAreaPropertyConfig | NumberPropertyConfig | NumberRangePropertyConfig | CheckboxPropertyConfig | CheckboxWithoutLabelPropertyConfig | DropdownPropertyConfig | MultiSelectPropertyConfig | TogglePropertyConfig | DynamicListPropertyConfig;

function parseProperties(properties: EntityProperty[], path: "entity" | "relationship"): PropertyConfig[] {
    return properties.filter(property => {
        // ignore the following property types because they are handled customly, TODO is there a better way?
        return property.getDataType !== "map" && property.getDataType !== "list"
    }).map(property => {

        var preparedConfig: BasicPropertyConfig = {
            providedFeature: property.getKey,
            label: property.getName,
            inputProperties: {
                disabled: false,
                required: property.getRequired,
                checked: false,
                selected: false,
                readonly: false
            },
            helpText: property.getDescription,
            show: true,
            provideEnterButton: false,
            jointJsConfig: { //TODO add values 
                propertyType: "property",
                modelPath: `${path}/properties/${property.getKey}`,
                defaultPropPath: "",
                minPath: "", // TODO set dynamically?
                min: ""
            },
        }

        switch (property.getDataType) {
            case "boolean":
                var checkboxPropertyConfig: CheckboxPropertyConfig =
                {
                    ...preparedConfig, ...{
                        contentType: "checkbox",
                        attributes: {
                            defaultValue: property.getDefaultValue,
                        }
                    }
                }
                return checkboxPropertyConfig as PropertyConfig;;
            case "number":
                var numberPropertyConfig: NumberPropertyConfig = {
                    ...preparedConfig, ...{
                        contentType: "number",
                        attributes: {
                            min: Number.MIN_SAFE_INTEGER,
                            max: Number.MAX_SAFE_INTEGER,
                            defaultValue: property.getDefaultValue
                        }
                    }
                }
                return numberPropertyConfig as PropertyConfig;
            case "select":
                var selectPropertyConfig: DropdownPropertyConfig = {
                    ...preparedConfig, ...{
                        contentType: "select",
                        attributes: {
                            svgRepresentation: "",
                            placeholder: property.getExample,
                            defaultValue: property.getDefaultValue
                        },
                        dropdownOptions: (property as SelectEntityProperty).getOptions.map(option => {
                            return {
                                optionValue: option.value,
                                optionText: option.text,
                                optionTitle: "",
                                representationClass: "",
                                disabled: false
                            }
                        })
                    }
                }
                return selectPropertyConfig as PropertyConfig;
            case "text":
            default:
                var textPropertyConfig: TextPropertyConfig = {
                    ...preparedConfig, ...{
                        contentType: "text",
                        attributes: {
                            placeholder: property.getExample,
                            defaultValue: property.getDefaultValue,
                            svgRepresentation: "",
                            inputLabelIcon: "",
                            provideEditButton: false,
                            suggestedValues: (property as TextEntityProperty).getOptions
                        }
                    }
                }
                return textPropertyConfig as PropertyConfig;
        }
    })
}


function concatInOrder(...propertyConfigs: PropertyConfig[][]): PropertyConfig[] {
    let concatenatedProperties: PropertyConfig[] = [];
    let propertyKeys: string[] = [];
    for (const propertyConfig of propertyConfigs) {
        propertyConfig.forEach(propertyConfig => {
            if (!propertyKeys.includes(propertyConfig.providedFeature)) {
                concatenatedProperties.push(propertyConfig);
                propertyKeys.push(propertyConfig.providedFeature);
            }
        })
    }
    return concatenatedProperties;
}

function customizePropertyConfigs(configs: PropertyConfig[], customConfigOverwrites: PropertyConfig[]): PropertyConfig[] {
    for (const customConfig of customConfigOverwrites) {
        let propertyKey = customConfig.providedFeature;

        let existingConfigIndex = configs.findIndex(config => config.providedFeature === propertyKey);
        if (~existingConfigIndex) {
            configs[existingConfigIndex] = customConfig
        } else {
            configs.push(customConfig);
        }
    }
    return configs;
}

export type PropertyContentType = "text" | "textarea" | "number" | "range" | "checkbox" | "checkbox-without-label" | "select" | "multi-select" | "toggle" | "dynamic-list";

const PropertyContent = Object.freeze({
    INPUT_TEXTBOX: "text",
    TEXTAREA: "textarea",
    INPUT_NUMBERBOX: "number",
    INPUT_RANGE: "range",
    CHECKBOX: "checkbox",
    CHECKBOX_WITHOUT_LABEL: "checkbox-without-label",
    DROPDOWN: "select",
    MULTI_SELECT: "multi-select",
    TOGGLE: "toggle",
    DYNAMIC_LIST: "dynamic-list"
});

const ParentRelation = Object.freeze({
    USED: "used",
    PERSISTED: "persisted"
});

const dataAggregateSvgRepresentation = (svgElementId = "", fillColour = "white", opacity = 1) => {
    return `<ellipse ${svgElementId ? `id="${svgElementId}"` : ''} cx="13" cy="9" rx="12" ry="6" stroke="black" fill="${fillColour}" opacity="${opacity}"/>`;
};

const backingDataSvgRepresentation = (svgElementId = "", fillColour = "white", opacity = 1) => {
    return `<path ${svgElementId ? `id="${svgElementId}"` : ''} d="M 0 0 L 16.8 0 Q 24 0 24 7.2 Q 24 14.4 16.8 14.4 L 0 14.4 Z" transform="translate(1, 1.5)" opacity="${opacity}" stroke-width="1" stroke-dasharray="0" stroke="black" fill="${fillColour}"></path>`;
};

export type EntityHighlightingConfig = {
    type: string,
    labelText: string,
    svgRepresentation: string,
    highlightColour: string
}

const DetailsSidebarConfig: {
    EntityHighlighting: EntityHighlightingConfig[]
    , GeneralProperties: {
        [key: string]: {
            headline: string,
            iconClass: string,
            options: PropertyConfig[]
        };
    }
}
    = {
    EntityHighlighting: [
        {
            type: EntityTypes.DATA_AGGREGATE,
            labelText: "Data Aggregate",
            svgRepresentation: `<svg width="30" height="20">${dataAggregateSvgRepresentation("data-aggregate-highlightingRepresentation", "gold", 0.4)}</svg>`,
            highlightColour: "gold"
        },
        {
            type: EntityTypes.BACKING_DATA,
            labelText: "Backing Data",
            svgRepresentation: `<svg width="30" height="20">${backingDataSvgRepresentation("backing-data-highlightingRepresentation", "limegreen", 0.4)}</svg>`,
            highlightColour: "limegreen"
        }
    ],
    GeneralProperties: {
        entity: {
            headline: "Entity Specific",
            iconClass: "fa-solid fa-sliders",
            options: []
        },
        relations: {
            headline: "Relations",
            iconClass: "fa-solid fa-diagram-project",
            options: []
        },
        artifacts: {
            headline: "Artifacts",
            iconClass: "fa-regular fa-file-code",
            options: [
                {
                    providedFeature: "artifacts",
                    contentType: PropertyContent.DYNAMIC_LIST,
                    label: "Deployment Artifacts",
                    helpText: "",
                    inputProperties: {
                        disabled: false,
                        required: false,
                        checked: false,
                        selected: false,
                        readonly: false
                    },
                    attributes: {
                        svgRepresentation: "",
                        buttonText: "Edit Artifacts",
                        buttonIconClass: "fa-solid fa-pencil",
                        dialogMetaData: {
                            dialogSize: DialogSize.LARGE,
                            header: {
                                iconClass: "fa-regular fa-file-code",
                                svgRepresentation: "",
                                text: "Artifacts of this entity: "
                            },
                            footer: {
                                showCancelButton: true,
                                cancelButtonText: "Cancel",
                                actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                            }
                        },
                        dialogInfo: `The following table shows all artifacts included in this entity. In case you want to add a new entry, the following section provides the corresponding input elements which you can submit using the plus button. However, your changes won't be saved or adopted until you clicked "Save". In case you cancel and change your entity selection, all 
                    your changes will be lost. While you keep the selection of this entity, your changes will be remembered.`,
                        listElementFields: [
                            {
                                fieldType: "text",
                                key: "key",
                                label: "Key",
                                helpText: "The key that identifies the artifact",
                                labelIcon: "fa-solid fa-key",
                                placeholder: "e.g. deployment-script"
                            },
                            {
                                fieldType: "dropdown",
                                key: "type",
                                label: "Type",
                                helpText: "The type of the artifact",
                                labelIcon: "fa-solid fa-tag",
                                dropdownOptions: []
                            },
                            {
                                fieldType: "text",
                                key: "file",
                                label: "File",
                                helpText: "The name of the file for this artifact",
                                labelIcon: "fa-regular fa-file",
                                placeholder: "e.g. entity-deployment.yml"
                            },
                            {
                                fieldType: "text",
                                key: "repository",
                                label: "Repository",
                                helpText: "The repository where the file can be found",
                                labelIcon: "fa-solid fa-server",
                                placeholder: "e.g. https://myrepo.com"
                            },
                            {
                                fieldType: "text",
                                key: "description",
                                label: "Description",
                                helpText: "A description of this artifact",
                                labelIcon: "fa-solid fa-message",
                                placeholder: "e.g. This file is executed by the platform"
                            },
                            {
                                fieldType: "text",
                                key: "deploy_path",
                                label: "Deploy Path",
                                helpText: "The file path the associated file will be deployed on within the target node's container.",
                                labelIcon: "fa-solid fa-terminal",
                                placeholder: "e.g. ./"
                            },
                            {
                                fieldType: "text",
                                key: "artifact_version",
                                label: "Artifact version",
                                helpText: "The version of this artifact.",
                                labelIcon: "fa-solid fa-code-branch",
                                placeholder: "e.g. 1.0"
                            },
                            {
                                fieldType: "text",
                                key: "checksum",
                                label: "Checksum",
                                helpText: "The checksum used to validate the integrity of the artifact.",
                                labelIcon: "fa-regular fa-hashtag",
                                placeholder: "e.g. 34534534"
                            },
                            {
                                fieldType: "text",
                                key: "checksum_algorithm",
                                label: "Checksum Algorithm",
                                helpText: "Algorithm used to calculate the artifact checksum.",
                                labelIcon: "fa-solid fa-gears",
                                placeholder: "e.g. MD5"
                            }
                        ],
                        addElementButton: {
                            label: "Submit",
                            labelIcon: "fa-solid fa-plus"
                        }
                    },
                    provideEnterButton: false,
                    show: true,
                    jointJsConfig: {
                        propertyType: "customProperty",
                        modelPath: "entity/artifacts",
                        defaultPropPath: "",
                        minPath: "",
                        min: ""
                    },
                }
            ]
        },
        label: {
            headline: "Entity Label",
            iconClass: "fa-solid fa-font",
            options: [
                {
                    providedFeature: "entity-text",
                    contentType: PropertyContent.TEXTAREA,
                    label: "Text:",
                    inputProperties: {
                        disabled: false,
                        required: true,
                        checked: false,
                        selected: false,
                        readonly: false,
                    },
                    attributes: {
                        rows: 1,
                        maxLength: 200,
                        placeholder: "",
                        defaultValue: "",
                        provideEnterButton: false
                    },
                    helpText: "Use enter key to submit change.",
                    show: true,
                    provideEnterButton: false,
                    jointJsConfig: {
                        propertyType: "attribute",
                        modelPath: "label/textWrap/text",
                        defaultPropPath: "",
                        minPath: "",
                        min: ""
                    },
                },
                {
                    providedFeature: "entity-font-size",
                    contentType: PropertyContent.INPUT_RANGE,
                    label: "Font Size:",
                    inputProperties: {
                        disabled: false,
                        required: true,
                        checked: false,
                        selected: false,
                        readonly: false,
                    },
                    attributes: {
                        min: 8,
                        max: 24,
                        defaultValue: 14,
                        step: 1,

                        provideEnterButton: false
                    },
                    helpText: "Use enter key to submit change.",
                    show: true,
                    provideEnterButton: false,
                    jointJsConfig: {
                        propertyType: "attribute",
                        modelPath: "label/fontSize",
                        defaultPropPath: "defaults/fontSize",
                        minPath: "",
                        min: "6"
                    },
                }
            ]
        },
        size: {
            headline: "Entity Size",
            iconClass: "fa-solid fa-vector-square",
            options: [
                {
                    providedFeature: "entity-width",
                    contentType: PropertyContent.INPUT_NUMBERBOX,
                    label: "Width:",
                    inputProperties: {
                        disabled: false,
                        required: true,
                        checked: false,
                        selected: false,
                        readonly: false,
                    },
                    attributes: {
                        min: 40,
                        max: 99999,
                        defaultValue: 150,
                    },
                    helpText: "The entity width",
                    show: true,
                    provideEnterButton: true,
                    jointJsConfig: {
                        propertyType: "providedMethod",
                        modelPath: "size/width",
                        defaultPropPath: "defaults/size/width",
                        minPath: "defaults/size/width",
                        min: ""
                    }
                },
                {
                    providedFeature: "entity-height",
                    contentType: PropertyContent.INPUT_NUMBERBOX,
                    label: "Height:",
                    inputProperties: {
                        disabled: false,
                        required: true,
                        checked: false,
                        selected: false,
                        readonly: false,
                    },
                    attributes: {
                        min: 40,
                        max: 99999,
                        defaultValue: 150,
                    },
                    helpText: "The entity height; might also change due to width change to preserve aspect ratio",
                    show: true,
                    provideEnterButton: true,
                    jointJsConfig: {
                        propertyType: "providedMethod",
                        modelPath: "size/height",
                        defaultPropPath: "defaults/size/height",
                        minPath: "defaults/size/height",
                        min: ""
                    },
                },
                {
                    providedFeature: "keep-entity-aspect-ratio",
                    contentType: PropertyContent.CHECKBOX,
                    label: "Preserve aspect ratio",
                    inputProperties: {
                        disabled: true,
                        required: true,
                        checked: true,
                        selected: false,
                        readonly: false,
                    },
                    attributes: {
                        defaultValue: true,
                    },
                    helpText: "If aspect ratio is preserved, width and height change simultaneously.",
                    show: false,
                    provideEnterButton: false,
                    jointJsConfig: {
                        propertyType: "free",
                        modelPath: "",
                        defaultPropPath: "",
                        minPath: "",
                        min: ""
                    },
                },
                {
                    providedFeature: "entity-aspect-ratio",
                    contentType: PropertyContent.INPUT_TEXTBOX,
                    label: "Aspect ratio",
                    inputProperties: {
                        disabled: true,
                        required: true,
                        checked: true,
                        selected: false,
                        readonly: true,
                    },
                    attributes: {
                        placeholder: "",
                        defaultValue: "",
                        svgRepresentation: "",
                        inputLabelIcon: "",
                        provideEditButton: false,
                        suggestedValues: []
                    },
                    helpText: "The value will be calculated based on the given width to preserve the aspect ratio of the entity shape",
                    show: false,
                    provideEnterButton: false,
                    jointJsConfig: {
                        propertyType: "property",
                        modelPath: "defaults/size",
                        defaultPropPath: "",
                        minPath: "",
                        min: ""
                    },
                }
            ]
        },
        position: {
            headline: "Entity Position",
            iconClass: "fa-solid fa-crosshairs",
            options: [
                // {
                //     providedFeature: "entity-position-info",
                //     contentType: PropertyContentType.INFO,

                // },
                {
                    providedFeature: "entity-x-position",
                    contentType: PropertyContent.INPUT_NUMBERBOX,
                    label: "X-Coordinate:",
                    inputProperties: {
                        disabled: false,
                        required: true,
                        checked: false,
                        selected: false,
                        readonly: false,
                    },
                    attributes: {
                        min: 21,
                        max: Number.MAX_SAFE_INTEGER,
                        defaultValue: 21,
                    },
                    helpText: "X Coordinate for the entity placement",
                    show: true,
                    provideEnterButton: true,
                    jointJsConfig: {
                        propertyType: "providedMethod",
                        modelPath: "position/x",
                        defaultPropPath: "",
                        minPath: "",
                        min: "21"
                    },
                },
                {
                    providedFeature: "entity-y-position",
                    contentType: PropertyContent.INPUT_NUMBERBOX,
                    label: "Y-Coordinate:",
                    inputProperties: {
                        disabled: false,
                        required: true,
                        checked: false,
                        selected: false,
                        readonly: false,
                    },
                    attributes: {
                        min: 21,
                        max: Number.MAX_SAFE_INTEGER,
                        defaultValue: 21,
                    },
                    helpText: "Y Coordinate for the entity placement",
                    show: true,
                    provideEnterButton: true,
                    jointJsConfig: {
                        propertyType: "providedMethod",
                        modelPath: "position/y",
                        defaultPropPath: "",
                        minPath: "",
                        min: "21"
                    }
                }
            ]
        }
    }
};

const linkSvgRepresentation = () => {
    // let marker = '<defs><marker id="arrowHead" orient="auto" overflow="visible" markerUnits="userSpaceOnUse"><path id="v-66" stroke="black" fill="black" transform="rotate(180)" d="M 10 -5 0 0 10 5 z"></path></marker></defs>';
    let marker = '<defs><marker id="arrowHead" orient="auto" overflow="visible" markerUnits="userSpaceOnUse"><path id="v-66" stroke="black" fill="black" transform="rotate(180)" d="M 8 -4.5 0 0 8 4.5 z"></path></marker></defs>';
    let pathElement = '<path d="M 1 8 L 27 8" marker-end="url(#arrowHead)" fill="none" stroke="black" stroke-dasharray="none" stroke-width="2" stroke-line-join="round" stroke-linejoin="round"</path>';
    return marker + pathElement;
}

const getIdentitiesConfig: () => PropertyConfig = () => {
    return {
        providedFeature: "identities",
        contentType: PropertyContent.DYNAMIC_LIST,
        label: "Assigned identities:",
        helpText: "",
        inputProperties: {
            disabled: false,
            required: false,
            checked: false,
            selected: false,
            readonly: false
        },
        attributes: {
            svgRepresentation: "",
            buttonText: "Edit Identities",
            buttonIconClass: "fa-solid fa-pencil",
            dialogMetaData: {
                dialogSize: DialogSize.LARGE,
                header: {
                    iconClass: "fa-regular fa-id-card",
                    svgRepresentation: "",
                    text: "Identities: "
                },
                footer: {
                    showCancelButton: true,
                    cancelButtonText: "Cancel",
                    actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                }
            },
            dialogInfo: `The following table shows all identities assigned to this component. In case you want to add a new entry, the following section provides one text element box and one dropdown field you can use to provide the information and then add it using the plus button. However, your changes won't be saved or adopted until you clicked "Save". In case you cancel and change your entity selection, all your changes will be lost. While you keep the selection of this Backing Data entity, your changes will be remembered.`,
            listElementFields: [
                {
                    fieldType: "text",
                    key: "identifier",
                    label: "Identifier",
                    helpText: "A unique identifying name",
                    labelIcon: "fa-regular fa-id-card",
                    placeholder: "e.g. account1"
                },
                {
                    fieldType: "dropdown",
                    key: "identityType",
                    dropdownOptions: [],
                    label: "Type",
                    helpText: "The type of this identity",
                    labelIcon: "fa-solid fa-passport",
                }
            ],
            addElementButton: {
                label: "Submit",
                labelIcon: "fa-solid fa-plus"
            }
        },
        provideEnterButton: false,
        show: true,
        jointJsConfig: {
            propertyType: "customProperty",
            modelPath: "entity/properties/identities",
            defaultPropPath: "",
            minPath: "",
            min: ""
        }
    };
}

const EntityDetailsConfig: {
    [key: string]: {
        type: string,
        specificProperties: PropertyConfig[]
    }
} = {
    Component: {
        type: EntityTypes.COMPONENT,
        specificProperties: customizePropertyConfigs(parseProperties(getComponentProperties(), "entity"), [
            getIdentitiesConfig()
        ])
    },
    Service: {
        type: EntityTypes.SERVICE,
        specificProperties: customizePropertyConfigs(concatInOrder(parseProperties(getServiceProperties(), "entity"), parseProperties(getComponentProperties(), "entity")), [
            getIdentitiesConfig()
        ])
    },
    BackingService: {
        type: EntityTypes.BACKING_SERVICE,
        specificProperties: customizePropertyConfigs(concatInOrder(parseProperties(getBackingServiceProperties(), "entity"), parseProperties(getComponentProperties(), "entity")), [
            getIdentitiesConfig()
        ])
    },
    StorageBackingService: {
        type: EntityTypes.STORAGE_BACKING_SERVICE,
        specificProperties: customizePropertyConfigs(concatInOrder(parseProperties(getStorageBackingServiceProperties(), "entity"), parseProperties(getComponentProperties(), "entity")), [
            getIdentitiesConfig()
        ])
    },
    BrokerBackingService: {
        type: EntityTypes.BROKER_BACKING_SERVICE,
        specificProperties: customizePropertyConfigs(concatInOrder(parseProperties(getBrokerBackingServiceProperties(), "entity"), parseProperties(getComponentProperties(), "entity")), [
            getIdentitiesConfig()
        ])
    },
    ProxyBackingService: {
        type: EntityTypes.PROXY_BACKING_SERVICE,
        specificProperties: customizePropertyConfigs(concatInOrder(parseProperties(getProxyBackingServiceProperties(), "entity"), parseProperties(getComponentProperties(), "entity")), [
            getIdentitiesConfig()
        ])
    },
    Endpoint: {
        type: EntityTypes.ENDPOINT,
        specificProperties: customizePropertyConfigs(parseProperties(getEndpointProperties(), "entity"), [
            {
                providedFeature: "embedded",
                contentType: PropertyContent.INPUT_TEXTBOX,
                label: "Parent",
                helpText: "The parent of the endpoint if it is embedded",
                inputProperties: {
                    disabled: true,
                    required: true,
                    checked: false,
                    selected: false,
                    readonly: false
                },
                attributes: {
                    placeholder: "",
                    defaultValue: "",
                    svgRepresentation: "",
                    inputLabelIcon: "",
                    provideEditButton: false,
                    suggestedValues: []
                },
                provideEnterButton: false,
                show: false,
                jointJsConfig: {
                    propertyType: "property",
                    modelPath: "entity/embedded",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                }
            },
            {
                providedFeature: "supported_authentication_methods",
                contentType: PropertyContent.MULTI_SELECT,
                label: "Authentication methods supported by this endpoint:",
                helpText: "",
                inputProperties: {
                    disabled: false,
                    required: false,
                    checked: false,
                    selected: false,
                    readonly: false
                },
                attributes: {
                    svgRepresentation: "",
                    buttonText: "Edit supported methods",
                    buttonIconClass: "fa-solid fa-pencil",
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            iconClass: "fa-regular fa-id-card",
                            svgRepresentation: "",
                            text: "Supported methods "
                        },
                        footer: {
                            showCancelButton: true,
                            cancelButtonText: "Cancel",
                            actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                        }
                    },
                    dialogInfo: `Check all authentication methods that are supported by this endpoint. If no method is selected, no authentication is needed for this endpoint. Your changes won't be saved or adopted until you clicked "Save". In case you cancel and change your selection, all your changes will be lost.`,
                    tableColumnHeaders: [
                        {
                            text: "Method"
                        },
                        {
                            text: "supported"
                        },
                    ]
                },
                provideEnterButton: false,
                show: true,
                jointJsConfig: {
                    propertyType: "customProperty",
                    modelPath: "entity/relations/supported_authentication_methods",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                },
            }
        ])
    },
    ExternalEndpoint: {
        type: EntityTypes.EXTERNAL_ENDPOINT,
        specificProperties: customizePropertyConfigs(concatInOrder(parseProperties(getExternalEndpointProperties(), "entity"), parseProperties(getEndpointProperties(), "entity")), [
            {
                providedFeature: "embedded",
                contentType: PropertyContent.INPUT_TEXTBOX,
                label: "Parent",
                helpText: "The parent of the endpoint if it is embedded",
                inputProperties: {
                    disabled: true,
                    required: true,
                    checked: false,
                    selected: false,
                    readonly: false
                },
                attributes: {
                    placeholder: "",
                    defaultValue: "",
                    svgRepresentation: "",
                    inputLabelIcon: "",
                    provideEditButton: false,
                    suggestedValues: []
                },
                provideEnterButton: false,
                show: false,
                jointJsConfig: {
                    propertyType: "property",
                    modelPath: "entity/embedded",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                }
            },
            {
                providedFeature: "supported_authentication_methods",
                contentType: PropertyContent.MULTI_SELECT,
                label: "Authentication methods supported by this endpoint:",
                helpText: "",
                inputProperties: {
                    disabled: false,
                    required: false,
                    checked: false,
                    selected: false,
                    readonly: false
                },
                attributes: {
                    svgRepresentation: "",
                    buttonText: "Edit supported methods",
                    buttonIconClass: "fa-solid fa-pencil",
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            iconClass: "fa-regular fa-id-card",
                            svgRepresentation: "",
                            text: "Supported methods "
                        },
                        footer: {
                            showCancelButton: true,
                            cancelButtonText: "Cancel",
                            actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                        }
                    },
                    dialogInfo: `Check all authentication methods that are supported by this endpoint. If no method is selected, no authentication is needed for this endpoint. Your changes won't be saved or adopted until you clicked "Save". In case you cancel and change your selection, all your changes will be lost.`,
                    tableColumnHeaders: [
                        {
                            text: "Method"
                        },
                        {
                            text: "supported"
                        },
                    ]
                },
                provideEnterButton: false,
                show: true,
                jointJsConfig: {
                    propertyType: "customProperty",
                    modelPath: "entity/relations/supported_authentication_methods",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                },
            }
        ])
    },
    Link: {
        type: EntityTypes.LINK,
        specificProperties: parseProperties(getLinkProperties(), "entity")
    },
    Infrastructure: {
        type: EntityTypes.INFRASTRUCTURE,
        specificProperties: customizePropertyConfigs(parseProperties(getInfrastructureProperties(), "entity"), [
            getIdentitiesConfig(),
            {
                providedFeature: "supported_artifacts",
                contentType: PropertyContent.MULTI_SELECT,
                label: "Supported Artifacts:",
                helpText: "",
                inputProperties: {
                    disabled: false,
                    required: false,
                    checked: false,
                    selected: false,
                    readonly: false
                },
                attributes: {
                    svgRepresentation: "",
                    buttonText: "Edit supported artifacts",
                    buttonIconClass: "fa-solid fa-pencil",
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            iconClass: "fa-regular fa-file-code",
                            svgRepresentation: "",
                            text: "Supported artifacts: "
                        },
                        footer: {
                            showCancelButton: true,
                            cancelButtonText: "Cancel",
                            actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                        }
                    },
                    dialogInfo: `Type in the name of an artifact type and then add it using the plus button. However, your changes won't be saved or adopted until you clicked "Save". In case you cancel and change your entity selection, all your changes will be lost. While you keep the selection of this Backing Data entity, your changes will be remembered.`,
                    tableColumnHeaders: [
                        {
                            text: "Artifact type"
                        },
                        {
                            text: "Include"
                        }
                    ]
                },
                provideEnterButton: false,
                show: true,
                jointJsConfig: {
                    propertyType: "customProperty",
                    modelPath: "entity/properties/supported_artifacts",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                },
            },
            {
                providedFeature: "supported_update_strategies",
                contentType: PropertyContent.MULTI_SELECT,
                label: "Supported Update Strategies:",
                helpText: "",
                inputProperties: {
                    disabled: false,
                    required: false,
                    checked: false,
                    selected: false,
                    readonly: false
                },
                attributes: {
                    svgRepresentation: "",
                    buttonText: "Edit supported update strategies",
                    buttonIconClass: "fa-solid fa-pencil",
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            iconClass: "fa-solid fa-arrow-up-from-bracket",
                            svgRepresentation: "",
                            text: "Supported update strategies: "
                        },
                        footer: {
                            showCancelButton: true,
                            cancelButtonText: "Cancel",
                            actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                        }
                    },
                    dialogInfo: `Check all update strategies supported by this infrastructure. Your changes won't be saved or adopted until you clicked "Save". In case you cancel and change your entity selection, all your changes will be lost.`,
                    tableColumnHeaders: [
                        {
                            text: "Update strategy"
                        },
                        {
                            text: "Supported"
                        },
                    ]
                },
                provideEnterButton: false,
                show: true,
                jointJsConfig: {
                    propertyType: "customProperty",
                    modelPath: "entity/properties/supported_update_strategies",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                },
            }
        ])
    },
    DeploymentMapping: {
        type: EntityTypes.DEPLOYMENT_MAPPING,
        specificProperties: parseProperties(getDeploymentMappingProperties(), "entity")
    },
    DataAggregate: {
        type: EntityTypes.DATA_AGGREGATE,
        specificProperties: customizePropertyConfigs(parseProperties(getDataAggregateProperties(), "entity").concat(parseProperties(getDataAggregateRelationshipProperties(), "relationship")), [{
            providedFeature: "dataAggregate-chooseEditMode",
            contentType: PropertyContent.TOGGLE,
            label: "Edit Mode:",
            labels: {
                headLabel: "<U>Edit Mode:</U>",
                leftLabel: "Original",
                rightLabel: "Embedded"
            },
            inputProperties: {
                disabled: false,
                required: false,
                checked: true,
                selected: false,
                readonly: false
            },
            helpText: "Choose whether you want to modify the embedded element or the actual Data Aggregate entity.",
            provideEnterButton: false,
            show: true,
            jointJsConfig: {
                propertyType: "free",
                modelPath: "",
                defaultPropPath: "",
                minPath: "",
                min: ""
            }
        },
        {
            providedFeature: "embedded",
            contentType: PropertyContent.INPUT_TEXTBOX,
            label: "Parent",
            helpText: "The parent of the data aggregate if it is embedded",
            inputProperties: {
                disabled: true,
                required: true,
                checked: false,
                selected: false,
                readonly: false
            },
            attributes: {
                placeholder: "",
                defaultValue: "",
                svgRepresentation: "",
                inputLabelIcon: "",
                provideEditButton: false,
                suggestedValues: []
            },
            provideEnterButton: false,
            show: false,
            jointJsConfig: {
                propertyType: "property",
                modelPath: "entity/embedded",
                defaultPropPath: "",
                minPath: "",
                min: ""
            }
        },
        {
            providedFeature: "dataAggregate-assignedFamily",
            contentType: PropertyContent.INPUT_TEXTBOX,
            label: "- Family assigned:",
            helpText: "The family of the Data Aggregate",
            inputProperties: {
                disabled: true,
                readonly: true,
                required: false,
                checked: false,
                selected: false,
            },
            attributes: {
                placeholder: "No family assigned",
                defaultValue: "",
                svgRepresentation: '<svg width="30" height="20"><ellipse cx="13" cy="9" rx="12" ry="6" stroke="black" fill="white" opacity="1"/></svg>',
                inputLabelIcon: "",
                provideEditButton: false,
                suggestedValues: []
            },
            provideEnterButton: false,
            show: true,
            jointJsConfig: {
                propertyType: "property",
                modelPath: "entity/assignedFamily",
                defaultPropPath: "",
                minPath: "",
                min: ""
            }
        }, {
            providedFeature: "dataAggregate-familyConfig",
            contentType: PropertyContent.MULTI_SELECT,
            label: "- Family:",
            helpText: "",
            inputProperties: {
                disabled: false,
                required: false,
                checked: false,
                selected: false,
                readonly: false,
            },
            attributes: {
                svgRepresentation: `<svg width="30" height="20">${dataAggregateSvgRepresentation()}</svg>`,
                buttonText: "Edit Family",
                buttonIconClass: "fa-solid fa-pencil",
                dialogMetaData: {
                    dialogSize: DialogSize.LARGE,
                    header: {
                        iconClass: "",
                        svgRepresentation: `<svg width="30" height="20">${dataAggregateSvgRepresentation()}</svg>`,
                        text: "Included Data Aggregate entities",
                    },
                    footer: {
                        showCancelButton: true,
                        cancelButtonText: "Cancel",
                        actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                    },

                },
                dialogInfo: `The following table shows all existing Data Aggregate entities within this System. You can select which ones of the following Data Aggregate entities you want to include in this
                family. Note that if you select a Data Aggregate and save your changes, the labels of the selected Data Aggregate entities might change since they have to be equal to the family name.
                Additionally, if you deselect entities that have previously been part of this family, their label will be reset to "Data Aggregate". However, your changes won't be adopted until you 
                clicked "Save". In case you cancel and change your entity selection, all your changes will be lost. While you keep the selection of this Data Aggregate entity, your changes will be remembered.`,
                tableColumnHeaders: [
                    {
                        text: "Name"
                    },
                    {
                        text: "Family Name"
                    },
                    {
                        text: "Parent"
                    },
                    {
                        text: "Include"
                    }
                ]
            },
            show: true,
            provideEnterButton: false,
            jointJsConfig: {
                propertyType: "customProperty",
                modelPath: "",
                defaultPropPath: "",
                minPath: "",
                min: ""
            }
        }
        ])
    },
    BackingData: {
        type: EntityTypes.BACKING_DATA,
        specificProperties: customizePropertyConfigs(parseProperties(getBackingDataProperties(), "entity").concat(parseProperties(getBackingDataRelationshipProperties(), "relationship")), [
            {
                providedFeature: "backingData-chooseEditMode",
                contentType: PropertyContent.TOGGLE,
                label: "Edit Mode:",
                labels: {
                    headLabel: "<U>Edit Mode:</U>",
                    leftLabel: "Original",
                    rightLabel: "Embedded"
                },
                inputProperties: {
                    disabled: false,
                    required: false,
                    checked: true,
                    selected: false,
                    readonly: false
                },
                helpText: "Choose whether you want to modify the embedded element or the actual Backing Data entity.",
                provideEnterButton: false,
                show: true,
                jointJsConfig: {
                    propertyType: "free",
                    modelPath: "",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                }
            },
            {
                providedFeature: "embedded",
                contentType: PropertyContent.INPUT_TEXTBOX,
                label: "Parent",
                helpText: "The parent of the backing data if it is embedded",
                inputProperties: {
                    disabled: true,
                    required: true,
                    checked: false,
                    selected: false,
                    readonly: false
                },
                attributes: {
                    placeholder: "",
                    defaultValue: "",
                    svgRepresentation: "",
                    inputLabelIcon: "",
                    provideEditButton: false,
                    suggestedValues: []
                },
                provideEnterButton: false,
                show: false,
                jointJsConfig: {
                    propertyType: "property",
                    modelPath: "entity/embedded",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                }
            },
            {
                providedFeature: "backingData-includedData",
                contentType: PropertyContent.DYNAMIC_LIST,
                label: "Included Data:",
                helpText: "",
                inputProperties: {
                    disabled: false,
                    required: false,
                    checked: false,
                    selected: false,
                    readonly: false
                },
                attributes: {
                    svgRepresentation: `<svg width="30" height="20">${backingDataSvgRepresentation()}</svg>`,
                    buttonText: "Edit Included Data",
                    buttonIconClass: "fa-solid fa-pencil",
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            iconClass: "",
                            svgRepresentation: `<svg width="30" height="20">${backingDataSvgRepresentation()}</svg>`,
                            text: "Backing Data Included Data: "
                        },
                        footer: {
                            showCancelButton: true,
                            cancelButtonText: "Cancel",
                            actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                        }
                    },
                    dialogInfo: `The following table shows all data elements included in this Backing Data entity. In case you want to add a new entry, the following section provides two text element boxes you can use to 
                    provide the information and then add it using the plus button. However, your changes won't be saved or adopted until you clicked "Save". In case you cancel and change your entity selection, all 
                    your changes will be lost. While you keep the selection of this Backing Data entity, your changes will be remembered.`,
                    listElementFields: [
                        {
                            fieldType: "text",
                            key: "key",
                            label: "Key",
                            helpText: "The key that identifies the following value item.",
                            labelIcon: "fa-solid fa-key",
                            placeholder: "e.g. My_SQL_Password"
                        },
                        {
                            fieldType: "text",
                            key: "value",
                            label: "Value",
                            helpText: "The value of this data item.",
                            labelIcon: "bi bi-chat-square-text-fill",
                            placeholder: "e.g. mysqlpw"
                        }
                    ],
                    addElementButton: {
                        label: "Submit",
                        labelIcon: "fa-solid fa-plus"
                    }
                },
                provideEnterButton: false,
                show: false,
                jointJsConfig: {
                    propertyType: "customProperty",
                    modelPath: "entity/properties/included_data",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                }
            },
            {
                providedFeature: "backingData-assignedFamily",
                contentType: PropertyContent.INPUT_TEXTBOX,
                label: `- Family assigned:`,
                inputProperties: {
                    disabled: true,
                    required: true,
                    checked: false,
                    selected: false,
                    readonly: false
                },
                helpText: "The family of the Backing Data",
                attributes: {
                    placeholder: "No family assigned",
                    defaultValue: "",
                    svgRepresentation: `<span><svg width="30" height="20">${backingDataSvgRepresentation()}</svg></span>`,
                    inputLabelIcon: "",
                    provideEditButton: false,
                    suggestedValues: []
                },
                provideEnterButton: false,
                show: true,
                jointJsConfig: {
                    propertyType: "property",
                    modelPath: "entity/assignedFamily",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                }
            },
            {
                providedFeature: "backingData-familyConfig",
                contentType: PropertyContent.MULTI_SELECT,
                label: "– Family:",
                helpText: "",
                inputProperties: {
                    disabled: false,
                    required: false,
                    checked: false,
                    selected: false,
                    readonly: false,
                },
                attributes: {
                    svgRepresentation: `<svg width="30" height="20">${backingDataSvgRepresentation()}</svg>`,
                    buttonText: "Edit Family",
                    buttonIconClass: "fa-solid fa-pencil",
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            iconClass: "",
                            svgRepresentation: `<svg width="30" height="20">${backingDataSvgRepresentation()}</svg>`,
                            text: "Included Backing Data entities "
                        },
                        footer: {
                            showCancelButton: true,
                            cancelButtonText: "Cancel",
                            actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                        }
                    },
                    dialogInfo: `The following table shows all existing Backing Data entities within this System. You can select which ones of the following Backing Data entities you want to include in this
                    family. Note that if you select a Backing Data and save your changes, the labels of the selected Backing Data entities might change since they have to be equal to the family name.
                    Additionally, if you deselect entities that have previously been part of this family, their label will be reset to "Backing Data". However, your changes won't be adopted until you 
                    clicked "Save". In case you cancel and change your entity selection, all your changes will be lost. While you keep the selection of this Backing Data entity, your changes will be remembered.`,
                    tableColumnHeaders: [
                        {
                            text: "Name"
                        },
                        {
                            text: "Family Name"
                        },
                        {
                            text: "Parent"
                        },
                        {
                            text: "Include"
                        }
                    ]
                },
                show: true,
                provideEnterButton: false,
                jointJsConfig: {
                    propertyType: "customProperty",
                    modelPath: "",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                },
            }
        ])
    },
    RequestTrace: {
        type: EntityTypes.REQUEST_TRACE,
        specificProperties: parseProperties(getRequestTraceProperties(), "entity")
    },
    Network: {
        type: EntityTypes.NETWORK,
        specificProperties: parseProperties(getNetworkProperties(), "entity")
    }
};





const getAssignedNetworksRelationConfig: ()=>PropertyConfig = () => {
    return {
        providedFeature: "assigned_to_networks",
        contentType: PropertyContent.MULTI_SELECT,
        label: "Assigned networks:",
        helpText: "",
        inputProperties: {
            disabled: false,
            required: false,
            checked: false,
            selected: false,
            readonly: false
        },
        attributes: {
            svgRepresentation: "",
            buttonText: "Edit assigned networks",
            buttonIconClass: "fa-solid fa-pencil",
            dialogMetaData: {
                dialogSize: DialogSize.LARGE,
                header: {
                    iconClass: "fa-solid fa-network-wired",
                    svgRepresentation: "",
                    text: "Assigned networks: "
                },
                footer: {
                    showCancelButton: true,
                    cancelButtonText: "Cancel",
                    actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                }
            },
            dialogInfo: `Check all networks to which this entity is assigned to.`,
            tableColumnHeaders: [
                {
                    text: "Network"
                },
                {
                    text: "Assigned"
                }
            ]
        },
        provideEnterButton: false,
        show: true,
        jointJsConfig: {
            propertyType: "relation",
            modelPath: "entity/relations/assigned_to_networks",
            defaultPropPath: "",
            minPath: "",
            min: ""
        },
    };
}

const getExternalIngressProxiedByRelationConfig: ()=>PropertyConfig = () => {
    return {
        providedFeature: "externalIngressProxiedBy",
        contentType: PropertyContent.DROPDOWN,
        label: "External Ingress proxied by:",
        inputProperties: {
            disabled: false,
            required: true,
            checked: false,
            selected: false,
            readonly: false,
        },
        helpText: "The proxy backing service acting as an external ingress proxy for this component.",
        show: true,
        attributes: {
            placeholder: "Choose Proxy Backing Service...",
            svgRepresentation: "",
            defaultValue: ""

        },
        provideEnterButton: false,
        jointJsConfig: {
            propertyType: "relation",
            modelPath: "entity/relations/external_ingress_proxied_by",
            defaultPropPath: "",
            minPath: "",
            min: ""
        },
        dropdownOptions: []
    }
}

const getIngressProxiedByRelationConfig: ()=>PropertyConfig = () => {
    return {
        providedFeature: "ingressProxiedBy",
        contentType: PropertyContent.DROPDOWN,
        label: "Ingress proxied by:",
        inputProperties: {
            disabled: false,
            required: true,
            checked: false,
            selected: false,
            readonly: false,
        },
        helpText: "The proxy backing service acting as an ingress proxy for this component.",
        show: true,
        attributes: {
            placeholder: "Choose Proxy Backing Service...",
            svgRepresentation: "",
            defaultValue: ""

        },
        provideEnterButton: false,
        jointJsConfig: {
            propertyType: "relation",
            modelPath: "entity/relations/ingress_proxied_by",
            defaultPropPath: "",
            minPath: "",
            min: ""
        },
        dropdownOptions: []
    }
}

const getEgressProxiedByRelationConfig: ()=>PropertyConfig = () => {
    return {
        providedFeature: "egressProxiedBy",
        contentType: PropertyContent.DROPDOWN,
        label: "Egress proxied by:",
        inputProperties: {
            disabled: false,
            required: true,
            checked: false,
            selected: false,
            readonly: false,
        },
        helpText: "The proxy backing service acting as an egress proxy for this component.",
        show: true,
        attributes: {
            placeholder: "Choose Proxy Backing Service...",
            svgRepresentation: "",
            defaultValue: ""

        },
        provideEnterButton: false,
        jointJsConfig: {
            propertyType: "relation",
            modelPath: "entity/relations/egress_proxied_by",
            defaultPropPath: "",
            minPath: "",
            min: ""
        },
        dropdownOptions: []
    }
}

const getAddressResolutionByRelationConfig: ()=>PropertyConfig = () => {
    return {
        providedFeature: "addressResolutionBy",
        contentType: PropertyContent.DROPDOWN,
        label: "Address resolution by:",
        inputProperties: {
            disabled: false,
            required: true,
            checked: false,
            selected: false,
            readonly: false,
        },
        helpText: "The entity providing address resolution for the communication done by this entity.",
        show: true,
        attributes: {
            placeholder: "Choose entity...",
            svgRepresentation: "",
            defaultValue: ""

        },
        provideEnterButton: false,
        jointJsConfig: {
            propertyType: "relation",
            modelPath: "entity/relations/address_resolution_by",
            defaultPropPath: "",
            minPath: "",
            min: ""
        },
        dropdownOptions: []
    }
}

const getAuthenticationByRelationConfig: ()=>PropertyConfig = () => {
    return {
        providedFeature: "authenticationBy",
        contentType: PropertyContent.DROPDOWN,
        label: "Authentication by:",
        inputProperties: {
            disabled: false,
            required: true,
            checked: false,
            selected: false,
            readonly: false,
        },
        helpText: "The entity providing authentication for endpoints provided by this entity.",
        show: true,
        attributes: {
            placeholder: "Choose entity...",
            svgRepresentation: "",
            defaultValue: ""

        },
        provideEnterButton: false,
        jointJsConfig: {
            propertyType: "relation",
            modelPath: "entity/relations/authentication_by",
            defaultPropPath: "",
            minPath: "",
            min: ""
        },
        dropdownOptions: []
    }
}

const EntityRelationsConfig: {
    [key: string]: {
        type: string,
        relations: PropertyConfig[]
    }
} = {
    Component: {
        type: EntityTypes.COMPONENT,
        relations: [
            getAssignedNetworksRelationConfig(),
            getExternalIngressProxiedByRelationConfig(),
            getIngressProxiedByRelationConfig(),
            getEgressProxiedByRelationConfig(),
            getAddressResolutionByRelationConfig(),
            getAuthenticationByRelationConfig()
        ]
    },
    Service: {
        type: EntityTypes.SERVICE,
        relations: [
            getAssignedNetworksRelationConfig(),
            getExternalIngressProxiedByRelationConfig(),
            getIngressProxiedByRelationConfig(),
            getEgressProxiedByRelationConfig(),
            getAddressResolutionByRelationConfig(),
            getAuthenticationByRelationConfig()
        ]
    },
    BackingService: {
        type: EntityTypes.BACKING_SERVICE,
        relations: [
            getAssignedNetworksRelationConfig(),
            getExternalIngressProxiedByRelationConfig(),
            getIngressProxiedByRelationConfig(),
            getEgressProxiedByRelationConfig(),
            getAddressResolutionByRelationConfig(),
            getAuthenticationByRelationConfig()
        ]
    },
    StorageBackingService: {
        type: EntityTypes.STORAGE_BACKING_SERVICE,
        relations: [
            getAssignedNetworksRelationConfig(),
            getExternalIngressProxiedByRelationConfig(),
            getIngressProxiedByRelationConfig(),
            getEgressProxiedByRelationConfig(),
            getAddressResolutionByRelationConfig(),
            getAuthenticationByRelationConfig()
        ]
    },
    BrokerBackingService: {
        type: EntityTypes.BROKER_BACKING_SERVICE,
        relations: [
            getAssignedNetworksRelationConfig(),
            getExternalIngressProxiedByRelationConfig(),
            getIngressProxiedByRelationConfig(),
            getEgressProxiedByRelationConfig(),
            getAddressResolutionByRelationConfig(),
            getAuthenticationByRelationConfig()
        ]
    },
    ProxyBackingService: {
        type: EntityTypes.PROXY_BACKING_SERVICE,
        relations: [
            getAssignedNetworksRelationConfig(),
            getExternalIngressProxiedByRelationConfig(),
            getIngressProxiedByRelationConfig(),
            getEgressProxiedByRelationConfig(),
            getAddressResolutionByRelationConfig(),
            getAuthenticationByRelationConfig()
        ]
    },
    Endpoint: {
        type: EntityTypes.ENDPOINT,
        relations: [
            {
                providedFeature: "uses_data",
                contentType: PropertyContent.MULTI_SELECT,
                label: "Data Aggregates used:",
                inputProperties: {
                    disabled: false,
                    required: true,
                    checked: false,
                    selected: false,
                    readonly: false,
                },
                helpText: "",
                show: true,
                attributes: {
                    svgRepresentation: '<svg width="35" height="20">' + dataAggregateSvgRepresentation() + '</svg>',
                    buttonText: "Add Data Aggregates",
                    buttonIconClass: "bi bi-window-plus",
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            // iconClass: "bi bi-window-plus", // TODO decide if this or SVG
                            iconClass: "",
                            svgRepresentation: '<svg width="35" height="20">' + dataAggregateSvgRepresentation() + '</svg>',
                            text: "Data Aggregates used by Endpoint: ",
                        },
                        footer: {
                            showCancelButton: true,
                            cancelButtonText: "Cancel",
                            actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                        },
                    },
                    dialogInfo: `The following table shows all Data Aggregate entities associated with this component. By selecting the respective 
                    checkbox the Data Aggregate entity will be added to this Endpoint. The selection at the beginning 
                    shows the currently saved state for this entity. Your changes won't be adopted until you 
                    clicked "Save". In case you cancel and change your entity selection, all your changes will be 
                    lost. While you keep the selection of this Endpoint entity, your changes will be remembered.`,
                    tableColumnHeaders: [
                        {
                            text: "Data Aggregate"
                        },
                        {
                            text: "Usage relation"
                        },
                        {
                            text: "Include"
                        }
                    ]
                },
                provideEnterButton: false,
                jointJsConfig: {
                    propertyType: "relation",
                    modelPath: "entity/relations/uses_data",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                }
            },
            {
                providedFeature: "allow_access_to",
                contentType: PropertyContent.MULTI_SELECT,
                label: "Accounts allowed to call this endpoint:",
                helpText: "",
                inputProperties: {
                    disabled: false,
                    required: false,
                    checked: false,
                    selected: false,
                    readonly: false
                },
                attributes: {
                    svgRepresentation: "",
                    buttonText: "Edit allowed accounts",
                    buttonIconClass: "fa-solid fa-pencil",
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            iconClass: "fa-regular fa-id-card",
                            svgRepresentation: "",
                            text: "Allowed accounts: "
                        },
                        footer: {
                            showCancelButton: true,
                            cancelButtonText: "Cancel",
                            actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                        }
                    },
                    dialogInfo: `Check all accounts that are allowed to call this endpoint. If no account is selected, anybody is allowed to call this endpoint. Your changes won't be saved or adopted until you clicked "Save". In case you cancel and change your selection, all your changes will be lost.`,
                    tableColumnHeaders: [
                        {
                            text: "Account"
                        },
                        {
                            text: "allowed"
                        },
                    ]
                },
                provideEnterButton: false,
                show: true,
                jointJsConfig: {
                    propertyType: "relation",
                    modelPath: "entity/relations/allow_access_to",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                },
            },
            {
                providedFeature: "documentedBy",
                contentType: PropertyContent.MULTI_SELECT,
                label: "Documented by:",
                inputProperties: {
                    disabled: false,
                    required: false,
                    checked: false,
                    selected: false,
                    readonly: false,
                },
                helpText: "The artifact documenting this endpoint.",
                show: true,
                attributes: {
                    svgRepresentation: "",
                    buttonText: "Edit documentating artifacts",
                    buttonIconClass: "fa-solid fa-pencil",
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            iconClass: "fa-regular fa-file-lines",
                            svgRepresentation: "",
                            text: "Documenting artifacts: "
                        },
                        footer: {
                            showCancelButton: true,
                            cancelButtonText: "Cancel",
                            actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                        }
                    },
                    dialogInfo: `Check all artifacts that provide documentation for this endpoint. Your changes won't be saved or adopted until you clicked "Save". In case you cancel and change your selection, all your changes will be lost.`,
                    tableColumnHeaders: [
                        {
                            text: "Artifact"
                        },
                        {
                            text: "Type"
                        },
                        {
                            text: "documenting"
                        },
                    ]
                },
                provideEnterButton: false,
                jointJsConfig: {
                    propertyType: "relation",
                    modelPath: "entity/relations/documented_by",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                }
            },
        ]
    },
    ExternalEndpoint: {
        type: EntityTypes.EXTERNAL_ENDPOINT,
        relations: [
            {
                providedFeature: "uses_data",
                contentType: PropertyContent.MULTI_SELECT,
                label: "Data Aggregates used:",
                inputProperties: {
                    disabled: false,
                    required: true,
                    checked: false,
                    selected: false,
                    readonly: false,
                },
                helpText: "",
                show: true,
                attributes: {
                    svgRepresentation: '<svg width="35" height="20">' + dataAggregateSvgRepresentation() + '</svg>',
                    buttonText: "Add Data Aggregates",
                    buttonIconClass: "bi bi-window-plus",
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            // iconClass: "bi bi-window-plus", // TODO decide if this or SVG
                            iconClass: "",
                            svgRepresentation: '<svg width="35" height="20">' + dataAggregateSvgRepresentation() + '</svg>',
                            text: "Data Aggregates used by External Endpoint: ",
                        },
                        footer: {
                            showCancelButton: true,
                            cancelButtonText: "Cancel",
                            actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                        },
                    },
                    dialogInfo: `The following table shows all Data Aggregate entities associated with this component. By selecting the respective 
                    checkbox the Data Aggregate entity will be added to this Endpoint. The selection at the beginning 
                    shows the currently saved state for this entity. Your changes won't be adopted until you 
                    clicked "Save". In case you cancel and change your entity selection, all your changes will be 
                    lost. While you keep the selection of this Endpoint entity, your changes will be remembered.`,
                    tableColumnHeaders: [
                        {
                            text: "Data Aggregate"
                        },
                        {
                            text: "Usage relation"
                        },
                        {
                            text: "Include"
                        }
                    ]
                },
                provideEnterButton: false,
                jointJsConfig: {
                    propertyType: "relation",
                    modelPath: "entity/relations/uses_data",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                }
            },
            {
                providedFeature: "allow_access_to",
                contentType: PropertyContent.MULTI_SELECT,
                label: "Accounts allowed to call this endpoint:",
                helpText: "",
                inputProperties: {
                    disabled: false,
                    required: false,
                    checked: false,
                    selected: false,
                    readonly: false
                },
                attributes: {
                    svgRepresentation: "",
                    buttonText: "Edit allowed accounts",
                    buttonIconClass: "fa-solid fa-pencil",
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            iconClass: "fa-regular fa-id-card",
                            svgRepresentation: "",
                            text: "Allowed accounts: "
                        },
                        footer: {
                            showCancelButton: true,
                            cancelButtonText: "Cancel",
                            actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                        }
                    },
                    dialogInfo: `Check all accounts that are allowed to call this endpoint. If no account is selected, anybody is allowed to call this endpoint. Your changes won't be saved or adopted until you clicked "Save". In case you cancel and change your selection, all your changes will be lost.`,
                    tableColumnHeaders: [
                        {
                            text: "Account"
                        },
                        {
                            text: "allowed"
                        },
                    ]
                },
                provideEnterButton: false,
                show: true,
                jointJsConfig: {
                    propertyType: "relation",
                    modelPath: "entity/relations/allow_access_to",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                },
            },
            {
                providedFeature: "documentedBy",
                contentType: PropertyContent.MULTI_SELECT,
                label: "Documented by:",
                inputProperties: {
                    disabled: false,
                    required: false,
                    checked: false,
                    selected: false,
                    readonly: false,
                },
                helpText: "The artifact documenting this endpoint.",
                show: true,
                attributes: {
                    svgRepresentation: "",
                    buttonText: "Edit documentating artifacts",
                    buttonIconClass: "fa-solid fa-pencil",
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            iconClass: "fa-regular fa-file-lines",
                            svgRepresentation: "",
                            text: "Documenting artifacts: "
                        },
                        footer: {
                            showCancelButton: true,
                            cancelButtonText: "Cancel",
                            actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                        }
                    },
                    dialogInfo: `Check all artifacts that provide documentation for this endpoint. Your changes won't be saved or adopted until you clicked "Save". In case you cancel and change your selection, all your changes will be lost.`,
                    tableColumnHeaders: [
                        {
                            text: "Artifact"
                        },
                        {
                            text: "Type"
                        },
                        {
                            text: "documenting"
                        },
                    ]
                },
                provideEnterButton: false,
                jointJsConfig: {
                    propertyType: "relation",
                    modelPath: "entity/relations/documented_by",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                }
            },
        ]
    },
    Link: {
        type: EntityTypes.LINK,
        relations: []
    },
    Infrastructure: {
        type: EntityTypes.INFRASTRUCTURE,
        relations: [
            getAssignedNetworksRelationConfig(),
        ]
    },
    DeploymentMapping: {
        type: EntityTypes.DEPLOYMENT_MAPPING,
        relations: []
    },
    DataAggregate: {
        type: EntityTypes.DATA_AGGREGATE,
        relations: []
    },
    BackingData: {
        type: EntityTypes.BACKING_DATA,
        relations: []
    },
    RequestTrace: {
        type: EntityTypes.REQUEST_TRACE,
        relations: [
            {
                providedFeature: "referred_endpoint",
                contentType: PropertyContent.DROPDOWN,
                label: "External Endpoint:",
                inputProperties: {
                    disabled: false,
                    required: true,
                    checked: false,
                    selected: false,
                    readonly: false,
                },
                helpText: "The referred External Endpoint.",
                show: true,
                attributes: {
                    placeholder: "Choose External Endpoint...",
                    svgRepresentation: '<svg width="30" height="20"><circle id="request-trace-external-endpoint" cx="15" cy="9" r="4" stroke="black" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                    defaultValue: ""

                },
                provideEnterButton: false,
                jointJsConfig: {
                    propertyType: "relation",
                    modelPath: "entity/relations/referred_endpoint",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                },
                dropdownOptions: []
            },
            {
                providedFeature: "involved_links",
                contentType: PropertyContent.MULTI_SELECT,
                label: "Involved Links:",
                inputProperties: {
                    disabled: false,
                    required: true,
                    checked: false,
                    selected: false,
                    readonly: false,
                },
                helpText: "",
                show: true,
                attributes: {
                    svgRepresentation: '<svg width="35" height="20">' + linkSvgRepresentation() + '</svg>',
                    buttonText: "Edit Link entities",
                    buttonIconClass: "bi bi-window-plus",
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            // iconClass: "bi bi-window-plus", // TODO decide if this or SVG
                            iconClass: "",
                            svgRepresentation: '<svg width="35" height="20">' + linkSvgRepresentation() + '</svg>',
                            text: "Links involved in Request Trace",
                        },
                        footer: {
                            showCancelButton: true,
                            cancelButtonText: "Cancel",
                            actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
                        },
                    },
                    dialogInfo: `The following table shows all Link entities that currently exist for this System. 
                    Invalid Links, such as non-connected ones or if they are connected to an Endpoint without
                    a parent entity cannot be selected and are thus deactivated. To include a link in the request trace, specify its index which signifies when a link is used. An index of \"-1\" means that a link is not included. Links with a higher index are used after links with lower indices. When links are used in parallel, they can also be assigned to the same index. The selection at the beginning 
                    shows the currently saved state for this entity. Your changes won't be adopted until you 
                    clicked "Save". In case you cancel and change your entity selection, all your changes will be 
                    lost. While you keep the selection of this Request Trace entity, your changes will be remembered.`,
                    tableColumnHeaders: [
                        {
                            text: "From"
                        },
                        {
                            text: "To Endpoint"
                        },
                        {
                            text: "Endpoint Parent"
                        },
                        {
                            text: "Trace Index"
                        }
                    ],
                },
                provideEnterButton: false,
                jointJsConfig: {
                    propertyType: "relation",
                    modelPath: "entity/relations/involved_links",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                },
            }
        ]
    },
    Network: {
        type: EntityTypes.NETWORK,
        relations: []
    }
}

const EditArtifactsConfig: PropertyConfig = {
    providedFeature: "artifacts",
    contentType: PropertyContent.DYNAMIC_LIST,
    label: "Deployment Artifacts",
    helpText: "",
    inputProperties: {
        disabled: false,
        required: false,
        checked: false,
        selected: false,
        readonly: false
    },
    attributes: {
        svgRepresentation: "",
        buttonText: "Edit Artifacts",
        buttonIconClass: "fa-solid fa-pencil",
        dialogMetaData: {
            dialogSize: DialogSize.LARGE,
            header: {
                iconClass: "fa-regular fa-file-code",
                svgRepresentation: "",
                text: "Artifacts of this entity: "
            },
            footer: {
                showCancelButton: true,
                cancelButtonText: "Cancel",
                actionButtons: [{ buttonIconClass: "fa-regular fa-floppy-disk", buttonText: "Save" }]
            }
        },
        dialogInfo: `The following table shows all artifacts included in this entity. In case you want to add a new entry, the following section provides the corresponding input elements which you can submit using the plus button. However, your changes won't be saved or adopted until you clicked "Save". In case you cancel and change your entity selection, all 
        your changes will be lost. While you keep the selection of this entity, your changes will be remembered.`,
        listElementFields: [
            {
                fieldType: "text",
                key: "key",
                label: "Key",
                helpText: "The key that identifies the artifact",
                labelIcon: "fa-solid fa-key",
                placeholder: "e.g. deployment-script"
            },
            {
                fieldType: "dropdown",
                key: "type",
                label: "Type",
                helpText: "The type of the artifact",
                labelIcon: "fa-solid fa-tag",
                dropdownOptions: []
            },
            {
                fieldType: "text",
                key: "file",
                label: "File",
                helpText: "The name of the file for this artifact",
                labelIcon: "fa-regular fa-file",
                placeholder: "e.g. entity-deployment.yml"
            },
            {
                fieldType: "text",
                key: "repository",
                label: "Repository",
                helpText: "The repository where the file can be found",
                labelIcon: "fa-solid fa-server",
                placeholder: "e.g. https://myrepo.com"
            },
            {
                fieldType: "text",
                key: "description",
                label: "Description",
                helpText: "A description of this artifact",
                labelIcon: "fa-solid fa-message",
                placeholder: "e.g. This file is executed by the platform"
            },
            {
                fieldType: "text",
                key: "deploy_path",
                label: "Deploy Path",
                helpText: "The file path the associated file will be deployed on within the target node's container.",
                labelIcon: "fa-solid fa-terminal",
                placeholder: "e.g. ./"
            },
            {
                fieldType: "text",
                key: "artifact_version",
                label: "Artifact version",
                helpText: "The version of this artifact.",
                labelIcon: "fa-solid fa-code-branch",
                placeholder: "e.g. 1.0"
            },
            {
                fieldType: "text",
                key: "checksum",
                label: "Checksum",
                helpText: "The checksum used to validate the integrity of the artifact.",
                labelIcon: "fa-regular fa-hashtag",
                placeholder: "e.g. 34534534"
            },
            {
                fieldType: "text",
                key: "checksum_algorithm",
                label: "Checksum Algorithm",
                helpText: "Algorithm used to calculate the artifact checksum.",
                labelIcon: "fa-solid fa-gears",
                placeholder: "e.g. MD5"
            }
        ],
        addElementButton: {
            label: "Submit",
            labelIcon: "fa-solid fa-plus"
        }
    },
    provideEnterButton: false,
    show: true,
    jointJsConfig: {
        propertyType: "property",
        modelPath: "entity/artifacts",
        defaultPropPath: "",
        minPath: "",
        min: ""
    },
}



const ColourConfig = {
    // entityHighlighting: "aqua"
    // entityHighlighting: "cyan"
    // entityHighlighting: "coral"
    entityHighlighting: "orange"
}

export {
    PropertyContent, ParentRelation, DetailsSidebarConfig,
    EntityDetailsConfig, EntityRelationsConfig, EditArtifactsConfig, ColourConfig,
    dataAggregateSvgRepresentation, backingDataSvgRepresentation
};