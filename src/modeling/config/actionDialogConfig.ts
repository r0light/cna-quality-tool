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
    },
    footer: {
        showCancelButton: boolean,
        cancelButtonText: string,
        actionButtons: { buttonIconClass: string, buttonText: string}[]
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


export { DialogSize };