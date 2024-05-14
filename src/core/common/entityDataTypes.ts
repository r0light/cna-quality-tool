import { TOSCA_Metadata } from "../../totypa/tosca-types/v1dot3-types/core-types.js"

export type MetaData = {
    label: string,
    fontSize: number,
    size: {
        width: number,
        height: number
    },
    position: {
        xCoord: number,
        yCoord: number
    }
}

export type FlatMetaData = {
    label: string
    fontSize: string,
    size_width: string,
    size_height: string,
    position_xCoord: string,
    position_yCoord: string
}

export function flatMetaData(metaData: MetaData): FlatMetaData {
    return {
        label: metaData.label,
        fontSize: metaData.fontSize.toString(),
        size_width: metaData.size.width.toString(),
        size_height: metaData.size.height.toString(),
        position_xCoord: metaData.position.xCoord.toString(),
        position_yCoord: metaData.position.yCoord.toString(),
    }
}

export function readMetaData(metaData: FlatMetaData): MetaData {
    return {
        label: metaData.label,
        fontSize: Number.parseFloat(metaData.fontSize),
        size: {
            width: Number.parseFloat(metaData.size_width),
            height: Number.parseFloat(metaData.size_height)
        },
        position: {
            xCoord: Number.parseFloat(metaData.position_xCoord),
            yCoord: Number.parseFloat(metaData.position_yCoord)
        }
    }
}

export function readToscaMetaData(toscaMetaData: TOSCA_Metadata): MetaData {

    return {
        label: toscaMetaData.label ? toscaMetaData.label : "",
        fontSize: toscaMetaData.fontSize ? Number.parseFloat(toscaMetaData.fontSize) : -1,
        size: {
            width: toscaMetaData.size_width ? Number.parseFloat(toscaMetaData.size_width) : -1,
            height: toscaMetaData.size_height ? Number.parseFloat(toscaMetaData.size_height) : -1
        },
        position: {
            xCoord: toscaMetaData.position_xCoord ? Number.parseFloat(toscaMetaData.position_xCoord) : -1,
            yCoord: toscaMetaData.position_yCoord ? Number.parseFloat(toscaMetaData.position_yCoord) : -1
        }
    };
}

export function getEmptyMetaData() {
    return {
        label: "",
        fontSize: 12,
        size: {
            width: 50,
            height: 20
        },
        position: {
            xCoord: 0,
            yCoord: 0
        }
    }
}
