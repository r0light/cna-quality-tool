import { dia } from "jointjs"
import { PropertyConfig } from "./detailsSidebarConfig"

export type DialogConfig = {
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
        content: FormContentConfig | InfoContentConfig
    }
}

export type FormContentConfig = {
    contentType: "groupForms",
    groups: (TablePropertyConfig | FormGroupPropertyConfig)[]
}

export type TablePropertyConfig = {
    id: string,
    contentType: "table",
    headline: string,
    text: string,
    tableColumnHeaders: TableColumnHeaderConfig[],
    tableRows: TableRowConfig[]
}

export type TableRowConfig = {
    attributes: { isTheCurrentEntity: boolean, representationClass: string, disabled: boolean },
    columns: {
        [key: string]: string | TableRowContentConfig
    }
}

export type TableRowContentConfig = {
    contentType: "checkbox-without-label",
    disabled: boolean,
    checked: boolean,
    id: dia.Cell.ID
}


export type TableColumnHeaderConfig = {
    text: string
}

export type InfoContentConfig = {
    contentType: "textBlock"
    text: string
}

export type FormGroupPropertyConfig = {
    id: string,
    contentType: "formgroup",
    headline: string,
    contentItems: PropertyConfig[]
}

const UIContentType = Object.freeze({
    SINGLE_TEXTBLOCK: "textBlock",
    GROUP_FORMS: "groupForms"
})


const DialogSize = Object.freeze({
    SMALL: "modal-sm",
    DEFAULT: "",
    LARGE: "modal-lg",
    EXTRA_LARGE: "modal-xl"
})

const SectionContentType = Object.freeze({
    BUTTON: "button",
    CHECKBOX: "checkbox",
    INPUT_TEXTBOX: "text",
    INPUT_NUMBERBOX: "number",
    INPUT_RANGE: "range",
});

const ApplicationSettingsDialogConfig = {
    title: {
        type: "normal",
        text: "Application Settings",
        icon: "fa-solid fa-gear"
    },
    content: {
        Size: {
            id: "modeling-area-size",
            heading: "Modeling Area Size",
            sectionContent: {
                PaperWidth: {
                    providedFeature: "paperWidth",
                    name: "Width",
                    icon: "fa-solid fa-ruler-horizontal",
                    type: SectionContentType.INPUT_NUMBERBOX,
                    defaultValue: 1000,
                    min: 100,
                    helpText: "Due to the included content the value has to be greater than",
                    additionalItems: [
                        {
                            text: "Reset",
                            type: SectionContentType.BUTTON
                        }
                    ]
                },
                PaperHeight: {
                    providedFeature: "paperHeight",
                    name: "Height",
                    icon: "fa-solid fa-ruler-vertical",
                    type: SectionContentType.INPUT_NUMBERBOX,
                    defaultValue: 3000,
                    min: 100,
                    helpText: "Due to the included content the value has to be greater than",
                    additionalItems: [
                        {
                            text: "Reset",
                            type: SectionContentType.BUTTON
                        }
                    ]
                }
            }
        },
        Grid: {
            id: "modeling-area-grid",
            heading: "Modeling Area Grid",
            sectionContent: {
                Size: {
                    providedFeature: "gridSize",
                    name: "Size",
                    icon: "",
                    type: SectionContentType.INPUT_RANGE,
                    defaultValue: 10,
                    min: 1,
                    max: 50,
                    additionalItems: [
                        {
                            text: "Reset",
                            type: SectionContentType.BUTTON
                        }
                    ]
                },
                Thickness: {
                    providedFeature: "gridThickness",
                    name: "Thickness",
                    icon: "",
                    type: SectionContentType.INPUT_RANGE,
                    defaultValue: 1,
                    min: 1,
                    max: 10,
                    additionalItems: [
                        {
                            text: "Reset",
                            type: SectionContentType.BUTTON
                        }
                    ]
                }
            }
        }

    },
    cancelButton: {
        text: "Cancel"
    },
    saveButton: {
        icon: "fa-regular fa-floppy-disk",
        text: "Apply changes",
        action: function () { }
    }
};

export { ApplicationSettingsDialogConfig, DialogSize, SectionContentType };