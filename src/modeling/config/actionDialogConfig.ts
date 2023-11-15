import { dia } from "jointjs"
import { PropertyConfig } from "./detailsSidebarConfig"

export type DialogConfig = {
    dialogMetaData: DialogMetaData,
    dialogContent: InfoContentConfig | FormContentConfig
}

export type DialogMetaData = {
    dialogSize: string,
    header: {
        iconClass: string,
        svgRepresentation: string,
        text: string
    }
    footer: {
        cancelButtonText: string,
        saveButtonIconClass: string,
        saveButtonText: string
    }
}

export type InfoContentConfig = {
    contentType: "textBlock"
    text: string
}

export type FormContentConfig = {
    contentType: "groupForms", //TODO rename
    groups: FormContentGroupConfig[]
}

export type FormContentGroupConfig = {
    contentGroupMetaData : ContentGroupMetaData
    contentItems: PropertyConfig[]
}

export type ContentGroupMetaData = {
    id: string,
    headline: string,
    text: string
}

export const UIContentType = Object.freeze({
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
    DROPDOWN: "select"
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
        },
        Router: {
            id: "default-link-router",
            heading: "Link Router Type",
            sectionContent: {
                Router: {
                    providedFeature: "defaultRouter",
                    name: "Link router",
                    icon: "",
                    type: SectionContentType.DROPDOWN,
                    defaultValue: "manhattan",
                    options: ["manhattan", "normal", "metro"],
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