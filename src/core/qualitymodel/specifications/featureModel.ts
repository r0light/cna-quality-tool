const PROTOCOLS_SUPPORTING_TLS = ["https", "sftp"];

const QUERY_ENDPOINT_KIND = "query";
const COMMAND_ENDPOINT_KIND = "command";
const SEND_EVENT_ENDPOINT_KIND = "send event";
const SUBSCRIBE_ENDPOINT_KIND = "subscribe";
const SYNCHRONOUS_ENDPOINT_KIND = [QUERY_ENDPOINT_KIND, COMMAND_ENDPOINT_KIND];
const ASYNCHRONOUS_ENDPOINT_KIND = [SEND_EVENT_ENDPOINT_KIND, SUBSCRIBE_ENDPOINT_KIND];

const MESSAGE_BROKER_KIND = ["queue", "topic"];
const EVENT_SOURCING_KIND = ["log"];

const VAULT_KIND = ["vault"];
const CONFIG_SERVICE_KIND = ["configuration"];

const MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS = ["limited", "none"];
const AUTOMATED_INFRASTRUCTURE_PROVISIONING = ["automated-coded", "automated-inferred", "transparent"];
const AUTOMATED_INFRASTRUCTURE_MAINTENANCE = ["transparent", "automated"];
const MANAGED_INFRASTRUCTURE_MAINTENANCE = ["transparent"];
const DYNAMIC_INFRASTRUCTURE = ["software-platform", "cloud-service"];

const ROLLING_UPDATE_STRATEGY_OPTIONS = ["rolling", "blue-green"]

const BACKING_DATA_CONFIG_KIND = "config";
const BACKING_DATA_LOGS_KIND = "logs";
const BACKING_DATA_METRICS_KIND = "metrics";
const BACKING_DATA_SECRET_KIND = "secret";

const DATA_USAGE_RELATION_USAGE = ["usage", "cached-usage"];
const DATA_USAGE_RELATION_PERSISTENCE = ["persistence"];

const SERVICE_MESH_KIND = "Service Mesh";

const CUSTOM_SOFTWARE_TYPE = "custom";

const IAC_ARTIFACT_TYPE = ["Terraform.Script", "CloudFormation.Script", "Pulumi.Script", "Ansible.Script", "Chef.Script", "Puppet.Script", "Azure.ResourceManagerTemplate"];
const CONTRACT_ARTIFACT_TYPE = ["Spring.CloudContract", "Pact.Contract"];

const AUTOMATED_SCALING = ["automated-built-in", "automated-separate"];

const AUTOMATED_RESTART_POLICIES = ["onProcessFailure", "onHealthFailure"];

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




export { PROTOCOLS_SUPPORTING_TLS, QUERY_ENDPOINT_KIND, COMMAND_ENDPOINT_KIND, SEND_EVENT_ENDPOINT_KIND, SUBSCRIBE_ENDPOINT_KIND, SYNCHRONOUS_ENDPOINT_KIND, ASYNCHRONOUS_ENDPOINT_KIND, MESSAGE_BROKER_KIND, EVENT_SOURCING_KIND, VAULT_KIND, CONFIG_SERVICE_KIND, MANAGED_INFRASTRUCTURE_ENVIRONMENT_ACCESS, AUTOMATED_INFRASTRUCTURE_PROVISIONING, AUTOMATED_INFRASTRUCTURE_MAINTENANCE, MANAGED_INFRASTRUCTURE_MAINTENANCE, DYNAMIC_INFRASTRUCTURE, ROLLING_UPDATE_STRATEGY_OPTIONS, BACKING_DATA_CONFIG_KIND, BACKING_DATA_LOGS_KIND, BACKING_DATA_METRICS_KIND, BACKING_DATA_SECRET_KIND, DATA_USAGE_RELATION_USAGE, DATA_USAGE_RELATION_PERSISTENCE, SERVICE_MESH_KIND,  CUSTOM_SOFTWARE_TYPE, IAC_ARTIFACT_TYPE, CONTRACT_ARTIFACT_TYPE, AUTOMATED_SCALING, AUTOMATED_RESTART_POLICIES, getUsageRelationWeight, getEndpointKindWeight }

