const EntityTypes = Object.freeze({
    COMPONENT: "component",
    SERVICE: "service",
    BACKING_SERVICE: "backing-service",
    STORAGE_BACKING_SERVICE: "storage-backing-service",
    PROXY_BACKING_SERVICE: "proxy-backing-service",
    BROKER_BACKING_SERVICE: "broker-backing-service",
    ENDPOINT: "endpoint",
    EXTERNAL_ENDPOINT: "external-endpoint",
    LINK: "link",
    INFRASTRUCTURE: "infrastructure",
    DEPLOYMENT_MAPPING: "deployment-mapping",
    REQUEST_TRACE: "request-trace",
    DATA_AGGREGATE: "data-aggregate",
    BACKING_DATA: "backing-data",
    NETWORK: "network"
});

export default EntityTypes;