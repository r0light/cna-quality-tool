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

export type DataUsageRelation = "uses" | "persists";