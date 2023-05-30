import EntityTypes from "./entityTypes";
import { getComponentProperties, getBackingServiceProperties, getStorageBackingServiceProperties, getEndpointProperties, getInfrastructureProperties } from "../entities";
import { UIContentType } from "./toolbarConfiguration";
import { DialogSize } from "./actionDialogConfig";

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
    isProperty: boolean,
    hasProvidedMethod: boolean,
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
    hidden: boolean,
    provideEnterButton: boolean,
    jointJsConfig: JointJsConfig
}

export type ButtonPropertyConfig = BasicPropertyConfig & {
    contentType: "button",
    attributes: {
        labelIcon: string
    }
}

export type TextPropertyConfig = BasicPropertyConfig & {
    contentType: "text",
    attributes: {
        placeholder: string,
        defaultValue: string,
        svgRepresentation: string
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

export type TextLabelPrependPropertyConfig = BasicPropertyConfig & {
    contentType: "text-label-prepend",
    attributes: {
        labelIcon: string,
        defaultValue: string,
        provideEditButton: boolean,
        provideEnterButton: boolean
    }
}

export type NumberPropertyConfig = BasicPropertyConfig & {
    contentType: "number",
    attributes: {
        min: number,
        max: number,
        defaultValue: number,
        maxLength: number,
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
    selected: boolean
}

export type ListPropertyConfig = BasicPropertyConfig & {
    contentType: "list",
    attributes: {
        datalistItems: DataListItemConfig[]
    }
}

export type DataListItemConfig = {
    value: string,
    text: string
}

export type TableDialogPropertyConfig = BasicPropertyConfig & {
    contentType: "table-dialog",
    attributes: {
        svgRepresentation: string,
        buttonText: string,
        buttonIconClass: string
    },
    buttonActionContent: {
        dialogSize: string,
        dialogContent: {
            header: {
                svgRepresentation: string,
                text: string,
                closeButton: boolean
            },
            footer: {
                cancelButtonText: string,
                saveButtonIconClass: string,
                saveButtonText: string
            },
            content: {
                contentType: string,
                groups: TablePropertyConfig[]
            }
        }
    }
}

export type TablePropertyConfig = {
    id: string,
    contentType: "table",
    headline: string,
    text: string,
    tableColumnHeaders: TableColumnHeaderConfig[]
    tableRows: any[] //TODO more specific?
}

export type TableColumnHeaderConfig = {
    text: string
}

export type TogglePropertyConfig = BasicPropertyConfig & {
    contentType: "toggle",
    labels: {
        headLabel: string,
        leftLabel: string,
        rightLabel: string
    }
}

export type FormGroupPropertyConfig = BasicPropertyConfig & {
    id: string,
    contentType: "formgroup",
    headline: string,
    contentItems: PropertyConfig[]
}


export type PropertyConfig = ButtonPropertyConfig | TextPropertyConfig | TextAreaPropertyConfig | TextLabelPrependPropertyConfig | NumberPropertyConfig | NumberRangePropertyConfig | CheckboxPropertyConfig | CheckboxWithoutLabelPropertyConfig | DropdownPropertyConfig | ListPropertyConfig | TableDialogPropertyConfig | TogglePropertyConfig | FormGroupPropertyConfig;

function parseProperties(properties): PropertyConfig[] {
    return properties.map(property => {

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
            hidden: false,
            provideEnterButton: false,
            jointJsConfig: { //TODO add values 
                isProperty: false,
                hasProvidedMethod: false,
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
                            defaultValue: 0,
                            maxLength: property.getMaxLength,
                        }
                    }
                }
                return numberPropertyConfig as PropertyConfig;
            case "list":
                var listPropertyConfig: ListPropertyConfig = {
                    ...preparedConfig, ...{
                        contentType: "list",
                        attributes: {
                            datalistItems: property.getOptions
                        }
                    }
                }
                return listPropertyConfig as PropertyConfig;
            case "text":
            default:
                var textPropertyConfig: TextPropertyConfig = {
                    ...preparedConfig, ...{
                        contentType: "text",
                        attributes: {
                            placeholder: property.getExample,
                            defaultValue: "",
                            svgRepresentation: ""
                        }
                    }
                }
                return textPropertyConfig as PropertyConfig;
        }
    })
}

export type PropertyContentType = "button" | "checkbox" | "checkbox-without-label" | "text" | "text-label-prepend" | "number" | "range" | "textarea" | "select" | "list" | "table-dialog" | "table" | "toggle" | "formgroup";

const PropertyContentType = Object.freeze({
    BUTTON: "button",
    INPUT_TEXTBOX: "text",
    TEXTAREA: "textarea",
    INPUT_TEXTBOX_LABEL_PREPEND: "text-label-prepend",
    INPUT_NUMBERBOX: "number",
    INPUT_RANGE: "range",
    CHECKBOX: "checkbox",
    CHECKBOX_WITHOUT_LABEL: "checkbox-without-label",
    DROPDOWN: "select",
    INPUT_LIST: "list",
    TABLE_DIALOG: "table-dialog",
    TABLE: "table",
    TOGGLE: "toggle",
    FORMGROUP: "formgroup"
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
                    hidden: false,
                    provideEnterButton: false,
                    jointJsConfig: {
                        isProperty: false,
                        hasProvidedMethod: false,
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
                    hidden: false,
                    provideEnterButton: false,
                    jointJsConfig: {
                        isProperty: false,
                        hasProvidedMethod: false,
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
                        maxLength: 5,
                    },
                    helpText: "The entity width",
                    hidden: false,
                    provideEnterButton: true,
                    jointJsConfig: {
                        isProperty: true,
                        hasProvidedMethod: true,
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
                        maxLength: 5,
                    },
                    helpText: "The value will be calculated based on the given width to preserve the aspect ratio of the entity shape",
                    hidden: false,
                    provideEnterButton: true,
                    jointJsConfig: {
                        isProperty: true,
                        hasProvidedMethod: true,
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
                    hidden: false,
                    provideEnterButton: false,
                    jointJsConfig: {
                        isProperty: false,
                        hasProvidedMethod: false,
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
                        svgRepresentation: ""
                    },
                    helpText: "The value will be calculated based on the given width to preserve the aspect ratio of the entity shape",
                    hidden: true,
                    provideEnterButton: false,
                    jointJsConfig: {
                        isProperty: true,
                        hasProvidedMethod: false,
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
                        maxLength: Number.MAX_SAFE_INTEGER,
                    },
                    helpText: "X Coordinate for the entity placement",
                    hidden: false,
                    provideEnterButton: true,
                    jointJsConfig: {
                        isProperty: true,
                        hasProvidedMethod: true,
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
                        maxLength: Number.MAX_SAFE_INTEGER,
                    },
                    helpText: "Y Coordinate for the entity placement",
                    hidden: false,
                    provideEnterButton: true,
                    jointJsConfig: {
                        isProperty: true,
                        hasProvidedMethod: true,
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

/*
const EntityGeneralProperties = {
    "entity-text": {
        // to identify whether to use element.attr() or element.prop() later
        isProperty: false,
        modelPath: "label/textWrap/text",
        defaultPropPath: "",
        min: ""
    },
    "entity-font-size": {
        isProperty: false,
        modelPath: "label/fontSize",
        defaultPropPath: "defaults/fontSize",
        min: "6"
    },
    "entity-width": {
        isProperty: true,
        hasProvidedMethod: true,
        modelPath: "size/width",
        defaultPropPath: "defaults/size/width",
        minPath: "defaults/size/width"
    },
    "entity-height": {
        isProperty: true,
        hasProvidedMethod: true,
        modelPath: "size/height",
        defaultPropPath: "defaults/size/height",
        minPath: "defaults/size/height"
    },
    "entity-aspect-ratio": {
        isProperty: true,
        modelPath: "defaults/size",
        defaultPropPath: "",
        helpText: "The value will be calculated based on the given width to preserve the aspect ratio of the entity shape",
        min: ""
    },
    "entity-x-position": {
        isProperty: true,
        hasProvidedMethod: true,
        modelPath: "position/x",
        defaultPropPath: "",
        min: "21"
    },
    "entity-y-position": {
        isProperty: true,
        hasProvidedMethod: true,
        modelPath: "position/y",
        defaultPropPath: "",
        min: "21"
    }
};
*/

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
        specificProperties: parseProperties(getComponentProperties())
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
        specificProperties: parseProperties(getEndpointProperties())
    },
    ExternalEndpoint: {
        type: EntityTypes.EXTERNAL_ENDPOINT,
        specificProperties: parseProperties(getEndpointProperties())
    },
    Link: {
        type: EntityTypes.LINK,
        specificProperties: [
            {
                providedFeature: "relationType",
                contentType: PropertyContentType.INPUT_TEXTBOX,
                label: "Relation Type:",
                inputProperties: {
                    disabled: false,
                    required: true,
                    checked: false,
                    selected: false,
                    readonly: false,
                },
                attributes: {
                    placeholder: "e.g. subscribes to",
                    defaultValue: "",
                    svgRepresentation: ""
                },
                helpText: "Type of relation",
                hidden: false,
                provideEnterButton: true,
                jointJsConfig: {
                    isProperty: false,
                    hasProvidedMethod: false,
                    modelPath: "entity/properties/relationType",
                    defaultPropPath: "",
                    minPath: "",
                    min: ""
                }
            }
        ]
    },
    Infrastructure: {
        type: EntityTypes.INFRASTRUCTURE,
        specificProperties: parseProperties(getInfrastructureProperties())
    },
    DeploymentMapping: {
        type: EntityTypes.DEPLOYMENT_MAPPING,
        specificProperties: [/* currently no properties */]
    },
    DataAggregate: {
        type: EntityTypes.DATA_AGGREGATE,
        specificProperties: [{
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
            hidden: false,
            jointJsConfig: {
                isProperty: false,
                hasProvidedMethod: false,
                modelPath: "",
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
                    selected: true
                },
                {
                    optionValue: ParentRelation.PERSISTED,
                    optionText: ParentRelation.PERSISTED,
                    selected: false
                }
            ],
            provideEnterButton: false,
            hidden: false,
            jointJsConfig: {
                isProperty: false,
                hasProvidedMethod: false,
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
                svgRepresentation: '<svg width="30" height="20"><ellipse cx="13" cy="9" rx="12" ry="6" stroke="black" fill="white" opacity="1"/></svg>'
            },
            provideEnterButton: false,
            hidden: false,
            jointJsConfig: {
                isProperty: false,
                hasProvidedMethod: false,
                modelPath: "entity/properties/dataAggregate-parentRelation",
                defaultPropPath: "",
                minPath: "",
                min: ""
            }
        },{
            providedFeature: "dataAggregate-familyConfig",
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
                svgRepresentation: `<svg width="30" height="20">${dataAggregateSvgRepresentation()}</svg>`,
                buttonText: "Edit Family",
                buttonIconClass: "fa-solid fa-pencil"
            },
            hidden: false,
            provideEnterButton: false,
            jointJsConfig: {
                isProperty: false,
                hasProvidedMethod: false,
                modelPath: "",
                defaultPropPath: "",
                minPath: "",
                min: ""
            },
            buttonActionContent: {
                // contentType: PropertyContentType // TODO modalDialog,
                dialogSize: DialogSize.LARGE,
                dialogContent: {
                    header: {
                        svgRepresentation: `<svg width="30" height="20">${dataAggregateSvgRepresentation()}</svg>`,
                        text: "Data Aggregate Family: ",
                        closeButton: false
                    },
                    footer: {
                        cancelButtonText: "Cancel",
                        saveButtonIconClass: "fa-regular fa-floppy-disk",
                        saveButtonText: "Save"
                    },
                    content: {
                        contentType: UIContentType.GROUP_FORMS,
                        groups: [
                            {
                                id: "dataAggregate-familyConfig-table",
                                contentType: PropertyContentType.TABLE,
                                headline: "Included Data Aggregate entities" + '  ( <svg width="30" height="20">' + dataAggregateSvgRepresentation() + '</svg>)',
                                text: `The following table shows all existing Data Aggregate entities within this System. You can select which ones of the following Data Aggregate entities you want to include in this
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
                                        text: "Formerly Included"
                                    },
                                    {
                                        text: "Include"
                                    }
                                ],
                                tableRows: []
                            }
                        ]
                    }
                }
            }
        }
        ]
    },
    BackingData: {
        type: EntityTypes.BACKING_DATA,
        specificProperties: [

        ]
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