const PROTOCOLS_SUPPORTING_TLS = ["https", "sftp"];

const QUERY_ENDPOINT_KIND = "query";
const COMMAND_ENDPOINT_KIND = "command";
const SEND_EVENT_ENDPOINT_KIND = "send event";
const SUBSCRIBE_ENDPOINT_KIND = "subscribe";
const SYNCHRONOUS_ENDPOINT_KIND = [QUERY_ENDPOINT_KIND, COMMAND_ENDPOINT_KIND];
const ASYNCHRONOUS_ENDPOINT_KIND = [SEND_EVENT_ENDPOINT_KIND, SUBSCRIBE_ENDPOINT_KIND];

const MESSAGE_BROKER_KIND = ["queue", "topic"];
const EVENT_SOURCING_KIND = ["log"];

const MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS = ["limited", "none"];

const ROLLING_UPDATE_STRATEGY_OPTIONS = ["rolling", "blue-green"]

const BACKING_DATA_CONFIG_KIND = "config";
const BACKING_DATA_LOGS_KIND = "logs";
const BACKING_DATA_METRICS_KIND = "metrics";

const DATA_USAGE_RELATION_USAGE = ["usage", "cached-usage"];
const DATA_USAGE_RELATION_PERSISTENCE = ["persistence"];

const SERVICE_MESH_KIND = "Service Mesh";

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




export { PROTOCOLS_SUPPORTING_TLS, QUERY_ENDPOINT_KIND, COMMAND_ENDPOINT_KIND, SEND_EVENT_ENDPOINT_KIND, SUBSCRIBE_ENDPOINT_KIND, SYNCHRONOUS_ENDPOINT_KIND, ASYNCHRONOUS_ENDPOINT_KIND, MESSAGE_BROKER_KIND, EVENT_SOURCING_KIND, MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS, ROLLING_UPDATE_STRATEGY_OPTIONS, BACKING_DATA_CONFIG_KIND, BACKING_DATA_LOGS_KIND, BACKING_DATA_METRICS_KIND, DATA_USAGE_RELATION_USAGE, DATA_USAGE_RELATION_PERSISTENCE, SERVICE_MESH_KIND, getUsageRelationWeight, getEndpointKindWeight }

