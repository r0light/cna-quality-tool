import { DataAggregate } from "../entities"

export type MetaData = {
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
    fontSize: string,
    size_width: string,
    size_height: string,
    position_xCoord: string,
    position_yCoord: string
}

export function flatMetaData(metaData: MetaData): FlatMetaData {
    return {
        fontSize: metaData.fontSize.toString(),
        size_width: metaData.size.width.toString(),
        size_height: metaData.size.height.toString(),
        position_xCoord: metaData.position.xCoord.toString(),
        position_yCoord: metaData.position.yCoord.toString(),
    }
}

export function readMetaData(metaData: FlatMetaData): MetaData {
    return {
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

export type DataUsageRelation = "uses" | "persists";