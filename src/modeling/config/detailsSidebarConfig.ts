import EntityTypes from "./entityTypes";
import { getComponentProperties, getBackingServiceProperties, getStorageBackingServiceProperties, getEndpointProperties, getExternalEndpointProperties, getInfrastructureProperties, getRequestTraceProperties, getBackingDataProperties, getDataAggregateProperties, getDeploymentMappingProperties, getLinkProperties, getServiceProperties } from "../../core/entities";
import { DialogConfig, DialogSize, FormContentConfig, UIContentType } from "./actionDialogConfig";
import { EntityProperty, NumberEntityProperty, TextEntityProperty } from "@/core/common/entityProperty";

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
    propertyType: "attribute" | "providedMethod" | "property" | "customProperty" | "free",
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
        suggestedValues: {value: string, text: string}[]
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

export type TableDialogPropertyConfig = BasicPropertyConfig & {
    contentType: "table-dialog",
    attributes: {
        svgRepresentation: string,
        buttonText: string,
        buttonIconClass: string
    },
    buttonActionContent: DialogConfig
}

export type TablePropertyConfig = BasicPropertyConfig & {
    contentType: "table",
    tableColumnHeaders: { text: string }[]
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
    listElementFields: ListElementField[],
    addElementButton: {
        label: string,
        labelIcon: string
    }

}

export type ListElementField = {
    key: string,
    label: string,
    helpText: string,
    labelIcon: string,
    placeholder: string
}


export type PropertyConfig = TextPropertyConfig | TextAreaPropertyConfig | NumberPropertyConfig | NumberRangePropertyConfig | CheckboxPropertyConfig | CheckboxWithoutLabelPropertyConfig | DropdownPropertyConfig | TableDialogPropertyConfig | TogglePropertyConfig | TablePropertyConfig | DynamicListPropertyConfig;

function parseProperties(properties: EntityProperty[]): PropertyConfig[] {
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
                modelPath: "entity/properties/" + property.getKey,
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
                            defaultValue: false,
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
                            defaultValue: 0
                        }
                    }
                }
                return numberPropertyConfig as PropertyConfig;
            case "text":
            default:
                var textPropertyConfig: TextPropertyConfig = {
                    ...preparedConfig, ...{
                        contentType: "text",
                        attributes: {
                            placeholder: property.getExample,
                            defaultValue: "",
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

function customizePropertyConfigs(configs: PropertyConfig[], customConfigOverwrites: PropertyConfig[]): PropertyConfig[] {
    for (const customConfig of customConfigOverwrites) {
        let propertyKey = "";
        if (customConfig.providedFeature.includes("wrapper")) {
            propertyKey = ((customConfig as TableDialogPropertyConfig).buttonActionContent.dialogContent as FormContentConfig).groups[0].contentItems[0].providedFeature;
        } else {
            propertyKey = customConfig.providedFeature;
        }

        let existingConfigIndex = configs.findIndex(config => config.providedFeature === propertyKey);
        if (~existingConfigIndex) {
            configs[existingConfigIndex] = customConfig
        } else {
            configs.push(customConfig);
        }
    }
    return configs;
}

export type PropertyContentType = "checkbox" | "checkbox-without-label" | "text" | "number" | "range" | "textarea" | "select" | "table-dialog" | "table" | "toggle" | "formgroup" | "dynamic-list";

const PropertyContentType = Object.freeze({
    INPUT_TEXTBOX: "text",
    TEXTAREA: "textarea",
    INPUT_NUMBERBOX: "number",
    INPUT_RANGE: "range",
    CHECKBOX: "checkbox",
    CHECKBOX_WITHOUT_LABEL: "checkbox-without-label",
    DROPDOWN: "select",
    TABLE_DIALOG: "table-dialog",
    TABLE: "table",
    TOGGLE: "toggle",
    FORMGROUP: "formgroup",
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
        label: {
            headline: "Entity Label",
            iconClass: "fa-solid fa-font",
            options: [
                {
                    providedFeature: "entity-text",
                    contentType: PropertyContentType.TEXTAREA,
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
                    contentType: PropertyContentType.INPUT_RANGE,
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
                    contentType: PropertyContentType.INPUT_NUMBERBOX,
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
                    contentType: PropertyContentType.INPUT_NUMBERBOX,
                    label: "Height:",
                    inputProperties: {
                        disabled: true,
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
                    helpText: "The value will be calculated based on the given width to preserve the aspect ratio of the entity shape",
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
                    contentType: PropertyContentType.CHECKBOX,
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
                    show: true,
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
                    contentType: PropertyContentType.INPUT_TEXTBOX,
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
                    contentType: PropertyContentType.INPUT_NUMBERBOX,
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
                    contentType: PropertyContentType.INPUT_NUMBERBOX,
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

const EntityDetailsConfig: {
    [key: string]: {
        type: string,
        specificProperties: PropertyConfig[]
    }
} = {
    Component: {
        type: EntityTypes.COMPONENT,
        specificProperties: parseProperties(getComponentProperties())
    },
    Service: {
        type: EntityTypes.SERVICE,
        specificProperties: parseProperties(getComponentProperties()).concat(parseProperties(getServiceProperties()))
    },
    BackingService: {
        type: EntityTypes.BACKING_SERVICE,
        specificProperties: parseProperties(getComponentProperties()).concat(parseProperties(getBackingServiceProperties()))
    },
    StorageBackingService: {
        type: EntityTypes.STORAGE_BACKING_SERVICE,
        specificProperties: parseProperties(getComponentProperties()).concat(parseProperties(getStorageBackingServiceProperties()))
    },
    Endpoint: {
        type: EntityTypes.ENDPOINT,
        specificProperties: customizePropertyConfigs(parseProperties(getEndpointProperties()), [
            {
                providedFeature: "embedded",
                contentType: PropertyContentType.INPUT_TEXTBOX,
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
        ])
    },
    ExternalEndpoint: {
        type: EntityTypes.EXTERNAL_ENDPOINT,
        specificProperties: customizePropertyConfigs(parseProperties(getEndpointProperties().concat(getExternalEndpointProperties())), [
            {
                providedFeature: "embedded",
                contentType: PropertyContentType.INPUT_TEXTBOX,
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
        ])
    },
    Link: {
        type: EntityTypes.LINK,
        specificProperties: parseProperties(getLinkProperties())
    },
    Infrastructure: {
        type: EntityTypes.INFRASTRUCTURE,
        specificProperties: parseProperties(getInfrastructureProperties())
    },
    DeploymentMapping: {
        type: EntityTypes.DEPLOYMENT_MAPPING,
        specificProperties: parseProperties(getDeploymentMappingProperties())
    },
    DataAggregate: {
        type: EntityTypes.DATA_AGGREGATE,
        specificProperties: customizePropertyConfigs(parseProperties(getDataAggregateProperties()), [{
            providedFeature: "dataAggregate-chooseEditMode",
            contentType: PropertyContentType.TOGGLE,
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
            contentType: PropertyContentType.INPUT_TEXTBOX,
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
            providedFeature: "dataAggregate-parentRelation",
            contentType: PropertyContentType.DROPDOWN,
            label: "Parent Relation:",
            helpText: "How the entity is utilized by its parent.",
            inputProperties: {
                disabled: false,
                required: true,
                checked: true,
                selected: false,
                readonly: false
            },
            attributes: {
                placeholder: "", // TODO keep assumption that "used" if nothing selected?
                defaultValue: ParentRelation.USED,
                svgRepresentation: ""
            },
            dropdownOptions: [
                {
                    optionValue: ParentRelation.USED,
                    optionText: ParentRelation.USED,
                    optionTitle: "",
                    representationClass: "",
                    disabled: false
                },
                {
                    optionValue: ParentRelation.PERSISTED,
                    optionText: ParentRelation.PERSISTED,
                    optionTitle: "",
                    representationClass: "",
                    disabled: false
                }
            ],
            provideEnterButton: false,
            show: true,
            jointJsConfig: {
                propertyType: "property",
                modelPath: "entity/properties/dataAggregate-parentRelation",
                defaultPropPath: "",
                minPath: "",
                min: ""
            }
        },
        {
            providedFeature: "dataAggregate-assignedFamily",
            contentType: PropertyContentType.INPUT_TEXTBOX,
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
            providedFeature: "dataAggregate-familyConfig-wrapper",
            contentType: PropertyContentType.TABLE_DIALOG,
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
                buttonIconClass: "fa-solid fa-pencil"
            },
            show: true,
            provideEnterButton: false,
            jointJsConfig: {
                propertyType: "free",
                modelPath: "",
                defaultPropPath: "",
                minPath: "",
                min: ""
            },
            buttonActionContent: {
                // contentType: PropertyContentType // TODO modalDialog,
                dialogMetaData: {
                    dialogSize: DialogSize.LARGE,
                    header: {
                        iconClass: "",
                        svgRepresentation: `<svg width="30" height="20">${dataAggregateSvgRepresentation()}</svg>`,
                        text: "Data Aggregate Family Config",
                    },
                    footer: {
                        cancelButtonText: "Cancel",
                        saveButtonIconClass: "fa-regular fa-floppy-disk",
                        saveButtonText: "Save"
                    },
                },
                dialogContent: {
                    contentType: UIContentType.GROUP_FORMS,
                    groups: [
                        {
                            contentGroupMetaData: {
                                id: "dataAggregate-familyConfig-table",
                                headline: "Included Data Aggregate entities" + '  ( <svg width="30" height="20">' + dataAggregateSvgRepresentation() + '</svg>)',
                                text: `The following table shows all existing Data Aggregate entities within this System. You can select which ones of the following Data Aggregate entities you want to include in this
                                    family. Note that if you select a Data Aggregate and save your changes, the labels of the selected Data Aggregate entities might change since they have to be equal to the family name.
                                    Additionally, if you deselect entities that have previously been part of this family, their label will be reset to "Data Aggregate". However, your changes won't be adopted until you 
                                    clicked "Save". In case you cancel and change your entity selection, all your changes will be lost. While you keep the selection of this Data Aggregate entity, your changes will be remembered.`
                            },
                            contentItems: [{
                                providedFeature: "dataAggregate-familyConfig",
                                contentType: PropertyContentType.TABLE,
                                label: "",
                                helpText: "",
                                inputProperties: {
                                    disabled: false,
                                    readonly: false,
                                    required: false,
                                    checked: false,
                                    selected: false,
                                },
                                provideEnterButton: false,
                                show: true,
                                jointJsConfig: {
                                    propertyType: "customProperty",
                                    modelPath: "",
                                    defaultPropPath: "",
                                    minPath: "",
                                    min: ""
                                },
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
                            }
                            ]
                        }
                    ]
                }
            }
        }
        ])
    },
    BackingData: {
        type: EntityTypes.BACKING_DATA,
        specificProperties: customizePropertyConfigs(parseProperties(getBackingDataProperties()), [
            {
                providedFeature: "backingData-chooseEditMode",
                contentType: PropertyContentType.TOGGLE,
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
                contentType: PropertyContentType.INPUT_TEXTBOX,
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
                providedFeature: "backingData-parentRelation",
                contentType: PropertyContentType.DROPDOWN,
                label: "Parent Relation:",
                helpText: "How the entity is utilized by its parent.",
                inputProperties: {
                    disabled: false,
                    required: true,
                    checked: true,
                    selected: false,
                    readonly: false
                },
                attributes: {
                    placeholder: "", // TODO keep assumption that "used" if nothing selected?
                    defaultValue: ParentRelation.USED,
                    svgRepresentation: ""
                },
                dropdownOptions: [
                    {
                        optionValue: ParentRelation.USED,
                        optionText: ParentRelation.USED,
                        optionTitle: "",
                        representationClass: "",
                        disabled: false
                    },
                    {
                        optionValue: ParentRelation.PERSISTED,
                        optionText: ParentRelation.PERSISTED,
                        optionTitle: "",
                        representationClass: "",
                        disabled: false
                    }
                ],
                provideEnterButton: false,
                show: true,
                jointJsConfig: {
                    propertyType: "property",
                    modelPath: "entity/properties/backingData-parentRelation",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                }
            },
            {
                providedFeature: "backingData-includedData-wrapper",
                contentType: PropertyContentType.TABLE_DIALOG,
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
                    buttonIconClass: "fa-solid fa-pencil"
                },
                provideEnterButton: false,
                show: false,
                jointJsConfig: {
                    propertyType: "free",
                    modelPath: "",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                },
                buttonActionContent: {
                    // contentType: PropertyContentType // TODO modalDialog,
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            iconClass: "",
                            svgRepresentation: `<svg width="30" height="20">${backingDataSvgRepresentation()}</svg>`,
                            text: "Backing Data Included Data: "
                        },
                        footer: {
                            cancelButtonText: "Cancel",
                            saveButtonIconClass: "fa-regular fa-floppy-disk",
                            saveButtonText: "Save"
                        }
                    },
                    dialogContent: {
                        contentType: UIContentType.GROUP_FORMS,
                        groups: [
                            {
                                contentGroupMetaData: {
                                    id: "backingData-includedData",
                                    headline: "Included Data",
                                    text: `The following table shows all data elements included in this Backing Data entity. In case you want to add a new entry, the following section provides two text element boxes you can use to 
                                        provide the information and then add it using the plus button. However, your changes won't be saved or adopted until you clicked "Save". In case you cancel and change your entity selection, all 
                                        your changes will be lost. While you keep the selection of this Backing Data entity, your changes will be remembered.`,
                                },
                                contentItems: [
                                    {
                                        providedFeature: "backingData-includedData",
                                        contentType: PropertyContentType.DYNAMIC_LIST,
                                        label: "",
                                        helpText: "",
                                        inputProperties: {
                                            disabled: false,
                                            readonly: false,
                                            required: false,
                                            checked: false,
                                            selected: false,
                                        },
                                        provideEnterButton: false,
                                        show: true,
                                        jointJsConfig: {
                                            propertyType: "customProperty",
                                            modelPath: "entity/properties/included_data",
                                            defaultPropPath: "",
                                            minPath: "",
                                            min: ""
                                        },
                                        listElementFields: [
                                            {
                                                key: "key",
                                                label: "Key",
                                                helpText: "The key that identifies the following value item.",
                                                labelIcon: "fa-solid fa-key",
                                                placeholder: "e.g. My_SQL_Password"
                                            },
                                            {
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
                                    }
                                ]
                            },
                        ]
                    }
                }
            },
            {
                providedFeature: "backingData-assignedFamily",
                contentType: PropertyContentType.INPUT_TEXTBOX,
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
                providedFeature: "backingData-familyConfig-wrapper",
                contentType: PropertyContentType.TABLE_DIALOG,
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
                    buttonIconClass: "fa-solid fa-pencil"
                },
                show: true,
                provideEnterButton: false,
                jointJsConfig: {
                    propertyType: "free",
                    modelPath: "",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                },
                buttonActionContent: {
                    // contentType: PropertyContentType // TODO modalDialog,
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            iconClass: "",
                            svgRepresentation: `<svg width="30" height="20">${backingDataSvgRepresentation()}</svg>`,
                            text: "Backing Data Family Config "
                        },
                        footer: {
                            cancelButtonText: "Cancel",
                            saveButtonIconClass: "fa-regular fa-floppy-disk",
                            saveButtonText: "Save"
                        }
                    },
                    dialogContent: {
                        contentType: UIContentType.GROUP_FORMS,
                        groups: [
                            {
                                contentGroupMetaData: {
                                    id: "backingData-familyConfig-table",
                                    headline: "Included Backing Data entities" + '  ( <svg width="30" height="20">' + backingDataSvgRepresentation() + '</svg>)',
                                    text: `The following table shows all existing Backing Data entities within this System. You can select which ones of the following Backing Data entities you want to include in this
                                    family. Note that if you select a Backing Data and save your changes, the labels of the selected Backing Data entities might change since they have to be equal to the family name.
                                    Additionally, if you deselect entities that have previously been part of this family, their label will be reset to "Backing Data". However, your changes won't be adopted until you 
                                    clicked "Save". In case you cancel and change your entity selection, all your changes will be lost. While you keep the selection of this Backing Data entity, your changes will be remembered.`,
                                },
                                contentItems: [
                                    {
                                        providedFeature: "backingData-familyConfig",
                                        contentType: PropertyContentType.TABLE,
                                        label: "",
                                        helpText: "",
                                        inputProperties: {
                                            disabled: false,
                                            readonly: false,
                                            required: false,
                                            checked: false,
                                            selected: false,
                                        },
                                        provideEnterButton: false,
                                        show: true,
                                        jointJsConfig: {
                                            propertyType: "customProperty",
                                            modelPath: "",
                                            defaultPropPath: "",
                                            minPath: "",
                                            min: ""
                                        },
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
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        ])
    },
    RequestTrace: {
        type: EntityTypes.REQUEST_TRACE,
        specificProperties: customizePropertyConfigs(parseProperties(getRequestTraceProperties()), [
            {
                providedFeature: "referred_endpoint",
                contentType: PropertyContentType.DROPDOWN,
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
                    propertyType: "property",
                    modelPath: "entity/properties/referred_endpoint",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                },
                dropdownOptions: []
            },
            {
                providedFeature: "involvedLinks-wrapper",
                contentType: PropertyContentType.TABLE_DIALOG,
                label: "Involved Links:",
                inputProperties: {
                    disabled: false,
                    required: true,
                    checked: false,
                    selected: false,
                    readonly: false,
                },
                helpText: "The links involved in this request trace.",
                show: true,
                attributes: {
                    svgRepresentation: '<svg width="35" height="20">' + linkSvgRepresentation() + '</svg>',
                    buttonText: "Add Link entities",
                    buttonIconClass: "bi bi-window-plus"
                },
                provideEnterButton: false,
                jointJsConfig: {
                    propertyType: "free",
                    modelPath: "",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                },
                buttonActionContent: {
                    // contentType: PropertyContentType // TODO modalDialog,
                    dialogMetaData: {
                        dialogSize: DialogSize.LARGE,
                        header: {
                            // iconClass: "bi bi-window-plus", // TODO decide if this or SVG
                            iconClass: "",
                            svgRepresentation: '<svg width="35" height="20"><polygon points="0,0 28,0 35,7 28,14 0,14 7,7" transform="translate(0,1)" stroke-width="2" stroke="black" fill="white"></polygon></svg>',
                            text: "Request Trace: ",
                        },
                        footer: {
                            cancelButtonText: "Cancel",
                            saveButtonIconClass: "fa-regular fa-floppy-disk",
                            saveButtonText: "Save"
                        },
                    },
                    dialogContent: {
                        contentType: UIContentType.GROUP_FORMS,
                        groups: [
                            {
                                contentGroupMetaData: {
                                    id: "involved-links-table",
                                    headline: "Involved Links" + '  ( <svg width="35" height="20">' + linkSvgRepresentation() + '</svg>)',
                                    text: `The following table shows all Link entities that currently exist for this System. 
                                        Invalid Links, such as non-connected ones or if they are connected to an Endpoint without
                                        a parent entity cannot be selected and are thus deactived. By selecting the respective 
                                        checkbox the Link entity will be added to this Request Trace. The selection at the beginning 
                                        shows the currently saved state for this entity. Your changes won't be adopted until you 
                                        clicked "Save". In case you cancel and change your entity selection, all your changes will be 
                                        lost. While you keep the selection of this Request Trace entity, your changes will be remembered.`,
                                },
                                contentItems: [
                                    {
                                        providedFeature: "involved_links",
                                        contentType: PropertyContentType.TABLE,
                                        label: "",
                                        helpText: "",
                                        inputProperties: {
                                            disabled: false,
                                            readonly: false,
                                            required: false,
                                            checked: false,
                                            selected: false,
                                        },
                                        provideEnterButton: false,
                                        show: true,
                                        jointJsConfig: {
                                            propertyType: "customProperty",
                                            modelPath: "entity/properties/involved_links",
                                            defaultPropPath: "",
                                            minPath: "",
                                            min: ""
                                        },
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
                                                text: "Include"
                                            }
                                        ],
                                    }

                                ]
                            }
                        ]
                    }
                }
            }

        ])
    }
};

const ColourConfig = {
    // entityHighlighting: "aqua"
    // entityHighlighting: "cyan"
    // entityHighlighting: "coral"
    entityHighlighting: "orange"
}

export {
    PropertyContentType, ParentRelation, DetailsSidebarConfig,
    EntityDetailsConfig, ColourConfig,
    dataAggregateSvgRepresentation, backingDataSvgRepresentation
};