import EntityTypes from "./entityTypes";

const ToolbarElementType = Object.freeze({
    BUTTON: "button",
    BUTTON_DROPDOWN: "button-dropdown"
})

const ItemType = Object.freeze({
    BUTTON: "button",
    CHECKBOX: "checkbox"
});

export type BasicToolConfig = {
    providedFeature: string,
    tooltipText: string,
    text: string,
    iconClass: string,
    additionalCssClass: string,
};

export type SingleToolConfig = BasicToolConfig & {
    buttonType: "button"
}

export type DropdownToolConfig = BasicToolConfig & {
    buttonType: "button-dropdown",
    dropdownButtons: BasicToolConfig[]
}

export type ToolGroupConfig = {
    buttonGroupId: string, 
    content: (SingleToolConfig | DropdownToolConfig)[]
}

export type FilterKey = "deploymentView" | "communicationView" | "backingView" | "dataView" | "traceView";

export type FilterConfig = {
    key: FilterKey,
    labelText: string,
    tooltipText: string
}

export type ToolbarConfiguration = {
    Tools: ToolGroupConfig[],
    FilterConfig: FilterConfig[],
    ToolbarRowConfig: { rowIndex: number, tools: ToolGroupConfig[]}[]
}

export const ToolbarConfig: ToolbarConfiguration = {
    Tools: [
        {
            buttonGroupId: "general-paper-actions",
            content: [
                {
                    providedFeature: "fullScreen",
                    tooltipText: "Open fullscreen",
                    text: "",
                    iconClass: "fa-solid fa-expand",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON
                },
                {
                    providedFeature: "closefullScreen",
                    tooltipText: "Close fullscreen",
                    text: "",
                    iconClass: "fa-solid fa-compress",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON
                },
                {
                    providedFeature: "fitActivePaperToContent",
                    tooltipText: "Fit paper to content",
                    text: "",
                    iconClass: "fa-solid fa-crop",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON
                },
                // {
                //     providedFeature: "lockPaperInteractivity",
                //     tooltipText: "Lock modeling area and disable interactivity",
                //     text: "",
                //     iconClass: "fa-solid fa-lock",
                //     additionalCssClass: "",
                //     buttonType: ToolbarElementType.BUTTON
                // },
                // {
                //     providedFeature: "unlockPaperInteractivity",
                //     tooltipText: "Unlock modeling area and enable interactivity",
                //     text: "",
                //     iconClass: "fa-solid fa-unlock-keyhole",
                //     additionalCssClass: "buttonInitialHide",
                //     buttonType: ToolbarElementType.BUTTON
                // }
            ]
        },
        {
            buttonGroupId: "extern-clear",
            content: [
                {
                    providedFeature: "clearActivePaper",
                    tooltipText: "Clear current paper",
                    text: "",
                    iconClass: "fa-solid fa-trash-can",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON
                },
                {
                    providedFeature: "printActivePaper",
                    tooltipText: "Print current paper",
                    text: "",
                    iconClass: "fa-solid fa-print",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON
                },
                {
                    providedFeature: "exportSvg",
                    tooltipText: "Export current model as SVG",
                    text: "",
                    iconClass: "fa-solid fa-bezier-curve",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON
                },
                {
                    providedFeature: "validateModel",
                    tooltipText: "Validate the current model for problems",
                    text: "",
                    iconClass: "fa-solid fa-file-circle-check",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON
                },
                {
                    providedFeature: "convertModeledSystemEntity",
                    tooltipText: "Export modeled System",
                    text: "",
                    iconClass: "fa-solid fa-download",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON_DROPDOWN,
                    dropdownButtons: [
                        {
                            providedFeature: "convertModeledSystemEntityToJson",
                            tooltipText: "Export modeled System to JSON",
                            text: "Export to JSON",
                            iconClass: "bi bi-filetype-json",
                            additionalCssClass: ""
                        },
                        {
                            providedFeature: "convertModeledSystemEntityToTosca",
                            tooltipText: "Export modeled System to TOSCA",
                            text: "Transform to TOSCA",
                            iconClass: "bi bi-filetype-yml",
                            additionalCssClass: ""
                        }
                    ]
                },
                {
                    providedFeature: "loadModeledSystemEntity",
                    tooltipText: "Import modeled System",
                    text: "",
                    iconClass: "fa-solid fa-upload",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON_DROPDOWN,
                    dropdownButtons: [
                        {
                            providedFeature: "loadModeledSystemEntityFromJson",
                            tooltipText: "Import modeled System from JSON",
                            text: "Import from JSON",
                            iconClass: "bi bi-filetype-json",
                            additionalCssClass: ""
                        },
                        {
                            providedFeature: "loadModeledSystemEntityFromTosca",
                            tooltipText: "Import modeled System from TOSCA",
                            text: "Import from TOSCA",
                            iconClass: "bi bi-filetype-yml",
                            additionalCssClass: ""
                        }
                    ]
                }
            ]
        },
        {
            buttonGroupId: "zoom",
            content: [
                {
                    providedFeature: "zoomOutPaper",
                    tooltipText: "Zoom out from modeling area",
                    text: "",
                    iconClass: "fa-solid fa-magnifying-glass-minus",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON
                },
                {
                    providedFeature: "zoomInPaper",
                    tooltipText: "Zoom into modeling area",
                    text: "",
                    iconClass: "fa-solid fa-magnifying-glass-plus",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON
                }
            ]
        },
        {
            buttonGroupId: "paper-background",
            content: [
                {
                    providedFeature: "changeGrid",
                    // tooltipText: "Change grid appearance",
                    tooltipText: "Clear grid",
                    text: "",
                    iconClass: "fa-solid fa-border-all",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON
                },
                {
                    providedFeature: "fitAllElementsToEmbedded",
                    tooltipText: "Fit elements to embedded",
                    text: "",
                    // iconClass: "fa-solid fa-up-down-left-right",
                    iconClass: "bi bi-aspect-ratio-fill",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON
                }
            ]
        },
        // TODO keep here?
        {
            buttonGroupId: "paper-individual-elements",
            content: [
                {
                    providedFeature: "expandAll",
                    tooltipText: "Expand all entities",
                    text: "",
                    // iconClass: "fa-solid fa-circle-plus",
                    iconClass: "fa-regular fa-square-plus",
                    // iconClass: "fa-solid fa-arrows-left-right-to-line",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON
                },
                {
                    providedFeature: "collapseAll",
                    tooltipText: "Collapse all entities",
                    text: "",
                    // iconClass: "fa-solid fa-circle-minus",
                    iconClass: "fa-regular fa-square-minus",
                    // iconClass: "fa-solid fa-square-minus",
                    additionalCssClass: "",
                    buttonType: ToolbarElementType.BUTTON
                }
            ]
        },
        {
            buttonGroupId: "requestTraceView",
            content: [
                {
                    providedFeature: "exitRequestTraceView",
                    tooltipText: "Exit current Request Trace view",
                    text: "",
                    iconClass: "fa-solid fa-arrow-right-from-bracket",
                    additionalCssClass: "buttonInitialHide btn-danger exitRequestTraceView",
                    buttonType: ToolbarElementType.BUTTON
                }
            ]
        }
    ],

    FilterConfig: [
        {
            key: "deploymentView",
            labelText: "Deployment View",
            tooltipText: "Show/Hide Infrastructure and Deployment Mapping Entities"
        },
        {
            key: "communicationView",
            labelText: "Communication View",
            tooltipText: "Show/Hide Endpoint and Link Entities"
        },
        {
            key: "backingView",
            labelText: "Backing Services View",
            tooltipText: "Show/Hide Backing Services"
        },
        {
            key: "dataView",
            labelText: "Data View",
            tooltipText: "Show/Hide Data Aggregates and Backing Data"
        },
        {
            key: "traceView",
            labelText: "Request Trace View",
            tooltipText: "Show/Hide Request Trace entities"
        },
    ],
    ToolbarRowConfig: [
        {
            rowIndex: 1,
            tools: [
                {
                    buttonGroupId: "settings",
                    content: [
                        {
                            buttonType: ItemType.BUTTON,
                            providedFeature: "applicationSettings",
                            tooltipText: "Edit application settings",
                            text: "",
                            iconClass: "fa-solid fa-gear",
                            additionalCssClass: ""
                        }
                    ]
                },
                {
                    buttonGroupId: "additionalToolbar",
                    content: [
                        {
                            buttonType: ItemType.BUTTON,
                            providedFeature: "showEntityToolbarRow",
                            tooltipText: "Show entity specific options",
                            text: "",
                            iconClass: "fa-solid fa-angles-down",
                            additionalCssClass: "buttonInitialHide"
                        }
                    ]
                }
            ]
        },
        {
            rowIndex: 2,
            tools: [
                {
                    buttonGroupId: "entireToolbarSecondRow",
                    content: [
                        {
                            buttonType: ItemType.BUTTON,
                            providedFeature: "hideEntityToolbarRow",
                            tooltipText: "Hide entity specific options",
                            text: "",
                            iconClass: "fa-solid fa-angles-up",
                            additionalCssClass: ""
                        }
                    ]
                }
            ]
        }
    ]
}