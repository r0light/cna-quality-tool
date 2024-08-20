const PROTOCOLS_SUPPORTING_TLS = ["https", "sftp"];

const SYNCHRONOUS_ENDPOINT_KIND = ["query", "command"];
const ASYNCHRONOUS_ENDPOINT_KIND = ["event"];


const getUsageRelationWeight = (usageRelation: "usage" | "cached-usage" | "persistence"): number => {
    switch (usageRelation) {
        case "persistence":
            return 0.5;
        case "cached-usage":
            return 0.1;
        case "usage":
        default:
            return 0.25;
    }
}

const getEndpointKindWeight = (usageRelation: "query" | "command" | "event"): number => {
    switch (usageRelation) {
        case "event":
            return 0.1
        case "command":
            return 0.5;
        case "query":
        default:
            return 0.2;
    }
}




export { PROTOCOLS_SUPPORTING_TLS, SYNCHRONOUS_ENDPOINT_KIND, ASYNCHRONOUS_ENDPOINT_KIND, getUsageRelationWeight, getEndpointKindWeight }

