import { DialogMetaData, DialogSize } from "@/modeling/config/actionDialogConfig";


export function getEmptyMetaData(): DialogMetaData {
    return {
        dialogSize: DialogSize.DEFAULT,
        header: {
            iconClass: "",
            svgRepresentation: "",
            text: ""
        },
        footer: {
            cancelButtonText: "Cancel",
            saveButtonIconClass: "",
            saveButtonText: "Save"
        }
    }
}