export type ModelingAppSettings = {
    paperWidth: number,
    paperHeight: number,
    paperGridSize: number,
    paperGridThickness: number,
    routerType: "manhattan" | "metro" | "normal"
}

export function getDefaultAppSettings(): ModelingAppSettings {
    return {
        paperWidth: 3000,
        paperHeight: 3000,
        paperGridSize: 10,
        paperGridThickness: 1,
        routerType: "manhattan"
    }
}

export function getRouterConfig(routerName: "manhattan" | "metro" | "normal") {
    switch ( routerName) {
        case "normal":
            return {
                name: "normal"
            }
        case "metro":
            return {
                name: "metro",
                args: {
                    step: 10,
                    padding: 15,
                    maximumLoops: 5000,
                    maxAllowedDirectionChange: 100,
                }
            }
        case "manhattan":
        default:
            return {
                name: "manhattan",
                args: {
                    step: 10,
                    padding: 15,
                    maximumLoops: 5000,
                    maxAllowedDirectionChange: 100,
                }
            }
    }
}