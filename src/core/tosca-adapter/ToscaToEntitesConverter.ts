import { v4 as uuidv4 } from 'uuid';
import * as Entities from '../entities'
import { TwoWayKeyIdMap } from "./TwoWayKeyIdMap";
import { DATA_AGGREGATE_TOSCA_KEY } from '../entities/dataAggregate';
import { BACKING_DATA_TOSCA_KEY } from '../entities/backingData';
import { getEmptyMetaData, readToscaMetaData } from '../common/entityDataTypes';
import { DEPLOYMENT_MAPPING_TOSCA_KEY } from '../entities/deploymentMapping';
import { Link, LINK_TOSCA_KEY } from '../entities/link';
import { INFRASTRUCTURE_TOSCA_KEY } from '../entities/infrastructure';
import { ENDPOINT_TOSCA_KEY } from '../entities/endpoint';
import { EXTERNAL_ENDPOINT_TOSCA_KEY } from '../entities/externalEndpoint';
import { SERVICE_TOSCA_KEY } from '../entities/service';
import { BACKING_SERVICE_TOSCA_KEY } from '../entities/backingService';
import { STORAGE_BACKING_SERVICE_TOSCA_KEY } from '../entities/storageBackingService';
import { COMPONENT_TOSCA_KEY } from '../entities/component';
import { REQUEST_TRACE_TOSCA_KEY } from '../entities/requestTrace';
import { RelationToDataAggregate } from '../entities/relationToDataAggregate';
import { RelationToBackingData } from '../entities/relationToBackingData';
import { TOSCA_File } from '@/totypa/tosca-types/v2dot0-types/definition-types';
import { TOSCA_Node_Template, TOSCA_Service_Template } from '@/totypa/tosca-types/v2dot0-types/template-types';
import { Artifact } from '../common/artifact';
import { PROXY_BACKING_SERVICE_TOSCA_KEY } from '../entities/proxyBackingService';
import { BROKER_BACKING_SERVICE_TOSCA_KEY } from '../entities/brokerBackingService';
import { NETWORK_TOSCA_KEY } from '../entities/network';
import { valHooks } from 'jquery';
import { EntityPropertyKey } from '@/totypa/parsedProfiles/v2dot0-profiles/propertyKeys';

const MATCH_UNDERSCORE = new RegExp(/_/g);
const MATCH_FIRST_CHARACTER = new RegExp(/^./g);
const MATCH_CHARACTER_AFTER_SPACE = new RegExp(/(\s)(.)/g);

class ToscaToEntitesConverter {

    #keyIdMap = new TwoWayKeyIdMap();

    #importedSystem: Entities.System;

    #toscaFile: TOSCA_File;
    #serviceTemplate: TOSCA_Service_Template;

    constructor(id: string, toscaFile: TOSCA_File, systemName: string) {
        this.#toscaFile = toscaFile;
        this.#serviceTemplate = this.#toscaFile.service_template;
        this.#importedSystem = new Entities.System(id, systemName);
    }

    convert(): Entities.System {

        // first pass: create ids for nodes and add them to the system

        // store endpoints separately, because they are no first-class entities
        let endpoints: Map<string, Entities.Endpoint> = new Map();

        for (const [key, node] of Object.entries(this.#serviceTemplate.node_templates)) {
            let uuid = uuidv4();
            this.#keyIdMap.add(key, uuid);
            switch (node.type) {
                case DATA_AGGREGATE_TOSCA_KEY:
                    let dataAggregate = new Entities.DataAggregate(this.#keyIdMap.getId(key), this.#transformYamlKeyToLabel(key), readToscaMetaData(node.metadata));
                    this.#importedSystem.addEntity(dataAggregate);
                    break;
                case BACKING_DATA_TOSCA_KEY:
                    let backingData = new Entities.BackingData(this.#keyIdMap.getId(key), this.#transformYamlKeyToLabel(key), readToscaMetaData(node.metadata));
                    this.#importedSystem.addEntity(backingData);
                    break;
                case INFRASTRUCTURE_TOSCA_KEY:
                    let infrastructure = new Entities.Infrastructure(this.#keyIdMap.getId(key), this.#transformYamlKeyToLabel(key), readToscaMetaData(node.metadata));
                    this.#importedSystem.addEntity(infrastructure);
                    break;
                case ENDPOINT_TOSCA_KEY:
                    let endpoint = new Entities.Endpoint(this.#keyIdMap.getId(key), this.#transformYamlKeyToLabel(key), readToscaMetaData(node.metadata));
                    endpoints.set(this.#keyIdMap.getId(key), endpoint);
                    break;
                case EXTERNAL_ENDPOINT_TOSCA_KEY:
                    let externalEndpoint = new Entities.ExternalEndpoint(this.#keyIdMap.getId(key), this.#transformYamlKeyToLabel(key), readToscaMetaData(node.metadata));
                    endpoints.set(this.#keyIdMap.getId(key), externalEndpoint);
                    break;
                case SERVICE_TOSCA_KEY:
                    let service = new Entities.Service(uuid, this.#transformYamlKeyToLabel(key), readToscaMetaData(node.metadata));
                    this.#importedSystem.addEntity(service);
                    break;
                case BACKING_SERVICE_TOSCA_KEY:
                    let backingService = new Entities.BackingService(uuid, this.#transformYamlKeyToLabel(key), readToscaMetaData(node.metadata));
                    this.#importedSystem.addEntity(backingService);
                    break;
                case STORAGE_BACKING_SERVICE_TOSCA_KEY:
                    let storageBackingService = new Entities.StorageBackingService(uuid, this.#transformYamlKeyToLabel(key), readToscaMetaData(node.metadata));
                    this.#importedSystem.addEntity(storageBackingService);
                    break;
                case PROXY_BACKING_SERVICE_TOSCA_KEY:
                    let proxyBackingService = new Entities.ProxyBackingService(uuid, this.#transformYamlKeyToLabel(key), readToscaMetaData(node.metadata));
                    this.#importedSystem.addEntity(proxyBackingService);
                    break;
                case BROKER_BACKING_SERVICE_TOSCA_KEY:
                    let brokerBackingService = new Entities.BrokerBackingService(uuid, this.#transformYamlKeyToLabel(key), readToscaMetaData(node.metadata));
                    this.#importedSystem.addEntity(brokerBackingService);
                    break;
                case COMPONENT_TOSCA_KEY:
                    let component = new Entities.Component(uuid, this.#transformYamlKeyToLabel(key), readToscaMetaData(node.metadata));
                    this.#importedSystem.addEntity(component);
                    break;
                case REQUEST_TRACE_TOSCA_KEY:
                    let requestTrace = new Entities.RequestTrace(uuid, this.#transformYamlKeyToLabel(key), readToscaMetaData(node.metadata));
                    this.#importedSystem.addEntity(requestTrace);
                    break;
                case NETWORK_TOSCA_KEY:
                    let network = new Entities.Network(uuid, this.#transformYamlKeyToLabel(key), readToscaMetaData(node.metadata));
                    this.#importedSystem.addEntity(network);
                    break;
                default:
                    throw new Error(`Unknown node type: ${node.type}. Cannot parse`)
            }
        }

        // second pass: parse properties and requirements

        // start with DataAggregates and BackingData
        for (const [key, node] of Object.entries(this.#serviceTemplate.node_templates)) {
            if (node.type === DATA_AGGREGATE_TOSCA_KEY) {
                let dataAggregate = this.#importedSystem.getDataAggregateEntities.get(this.#keyIdMap.getId(key));
                if (node.properties) {
                    for (const [key, value] of Object.entries(node.properties)) {
                        dataAggregate.setPropertyValue(key as EntityPropertyKey, value);
                    }
                }
            } else if (node.type === BACKING_DATA_TOSCA_KEY) {
                let backingData = this.#importedSystem.getBackingDataEntities.get(this.#keyIdMap.getId(key));
                if (node.properties) {
                    for (const [key, value] of Object.entries(node.properties)) {
                        backingData.setPropertyValue(key as EntityPropertyKey, value);
                    }
                }
            }
        }

        // continue with Infrastructure
        for (const [key, node] of Object.entries(this.#serviceTemplate.node_templates)) {
            if (node.type === INFRASTRUCTURE_TOSCA_KEY) {

                let infrastructure = this.#importedSystem.getInfrastructureEntities.get(this.#keyIdMap.getId(key));

                if (node.requirements) {
                    for (const requirementAssignment of node.requirements) {
                        for (const [requirementKey, requirement] of Object.entries(requirementAssignment)) {
                            if (requirementKey === "uses_backing_data") { // TODO no hard coded Key

                                if (typeof requirement === "string") {
                                    infrastructure.addBackingDataEntity(this.#importedSystem.getBackingDataEntities.get(this.#keyIdMap.getId(requirement)), new RelationToBackingData(`${infrastructure.getId}_uses_backing_data_${this.#keyIdMap.getId(requirement)}`, getEmptyMetaData()));
                                } else if (typeof requirement === "object") {
                                    // TODO requirement is of type TOSCA_Requirement_Assignment
                                    if (requirement.node && requirement.relationship && typeof requirement.relationship === "string") {
                                        let relationship = this.#serviceTemplate.relationship_templates[requirement.relationship];

                                        let metaData = !!relationship.metadata ? readToscaMetaData(relationship.metadata) : getEmptyMetaData();
                                        let relation = new RelationToBackingData(requirement.relationship, metaData);

                                        for (const [key, value] of Object.entries(relationship.properties)) {
                                            relation.setPropertyValue(key as EntityPropertyKey, value);
                                        }

                                        infrastructure.addBackingDataEntity(this.#importedSystem.getBackingDataEntities.get(this.#keyIdMap.getId(requirement.node)), relation);
                                    }
                                }
                            } else if (requirementKey === "host") {
                                if (typeof requirement === "string") {
                                    // TODO requirement is of type string
                                } else {
                                    let linkId = uuidv4();
                                    let hostInfrastructure = this.#importedSystem.getInfrastructureEntities.get(this.#keyIdMap.getId(requirement.node))
                                    let deploymentMapping = new Entities.DeploymentMapping(linkId, infrastructure, hostInfrastructure);
                                    this.#keyIdMap.add(requirement.relationship as string, deploymentMapping.getId);
                                    this.#importedSystem.addEntity(deploymentMapping);
                                }
                            } else if (requirementKey === "assigned_to_network") {
                                if (typeof requirement === "string") {
                                    // TODO requirement is of type string
                                } else {
                                    let assignedToNetwork = this.#importedSystem.getNetworkEntities.get(this.#keyIdMap.getId(requirement.node));
                                    infrastructure.addNetwork(assignedToNetwork);
                                }
                            }
                        }
                    }
                }

                if (node.properties) {
                    for (const [key, value] of Object.entries(node.properties)) {
                        infrastructure.setPropertyValue(key as EntityPropertyKey, value);
                    }
                }

                if (node.capabilities) {
                    for (const [capabilityKey, capability] of Object.entries(node.capabilities)) {
                        if (capability.properties) {
                            for (const [key, value] of Object.entries(capability.properties)) {
                                infrastructure.setPropertyValue(key as EntityPropertyKey, value);
                            }
                        }
                    }
                }

                if (node.artifacts) {
                    for (const [key, value] of Object.entries(node.artifacts)) {
                        infrastructure.setArtifact(key, new Artifact(
                            value.type ? value.type : "",
                            value.file ? value.file : "",
                            value.repository ? value.repository : "",
                            value.description ? value.description : "",
                            value.deploy_path ? value.deploy_path : "",
                            value.artifact_version ? value.artifact_version : "",
                            value.checksum ? value.checksum : "",
                            value.checksum_algorithm ? value.checksum_algorithm : ""
                        ))
                    }
                }
            }
        }

        // continue with Networks
        for (const [key, node] of Object.entries(this.#serviceTemplate.node_templates)) {
            if (node.type === NETWORK_TOSCA_KEY) {

                let network = this.#importedSystem.getNetworkEntities.get(this.#keyIdMap.getId(key));

                if (node.properties) {
                    for (const [key, value] of Object.entries(node.properties)) {
                        network.setPropertyValue(key as EntityPropertyKey, value);
                    }
                }

                if (node.capabilities) {
                    for (const [capabilityKey, capability] of Object.entries(node.capabilities)) {
                        if (capability.properties) {
                            for (const [key, value] of Object.entries(capability.properties)) {
                                network.setPropertyValue(key as EntityPropertyKey, value);
                            }
                        }
                    }
                }
            }
        }

        // continue with Endpoints
        for (const [key, node] of Object.entries(this.#serviceTemplate.node_templates)) {
            if (node.type === ENDPOINT_TOSCA_KEY) {
                let endpoint = endpoints.get(this.#keyIdMap.getId(key));
                if (node.properties) {
                    for (const [key, value] of Object.entries(node.properties)) {
                        endpoint.setPropertyValue(key as EntityPropertyKey, value);
                    }
                }
                if (node.capabilities) {
                    for (const [capabilityKey, capability] of Object.entries(node.capabilities)) {
                        if (capability.properties) {
                            for (const [key, value] of Object.entries(capability.properties)) {
                                endpoint.setPropertyValue(key as EntityPropertyKey, value);
                            }
                        }
                    }
                }
                if (node.requirements) {
                    for (const requirementAssignment of node.requirements) {
                        for (const [requirementKey, requirement] of Object.entries(requirementAssignment)) {
                            if (requirementKey === "uses_data") { // TODO no hard coded Key

                                if (typeof requirement === "string") {
                                    endpoint.addDataAggregateEntity(this.#importedSystem.getDataAggregateEntities.get(this.#keyIdMap.getId(requirement)), new RelationToDataAggregate(`${endpoint.getId}_uses_data_${this.#keyIdMap.getId(requirement)}`, getEmptyMetaData()));
                                } else if (typeof requirement === "object") {
                                    // TODO requirement is of type TOSCA_Requirement_Assignment
                                    if (requirement.node && requirement.relationship && typeof requirement.relationship === "string") {
                                        let relationship = this.#serviceTemplate.relationship_templates[requirement.relationship];

                                        let metaData = !!relationship.metadata ? readToscaMetaData(relationship.metadata) : getEmptyMetaData();
                                        let relation = new RelationToDataAggregate(requirement.relationship, metaData);

                                        for (const [key, value] of Object.entries(relationship.properties)) {
                                            relation.setPropertyValue(key as EntityPropertyKey, value);
                                        }

                                        endpoint.addDataAggregateEntity(this.#importedSystem.getDataAggregateEntities.get(this.#keyIdMap.getId(requirement.node)), relation);
                                    }
                                }
                            }
                        }
                    }
                }

            } else if (node.type === EXTERNAL_ENDPOINT_TOSCA_KEY) {
                let externalEndpoint = endpoints.get(this.#keyIdMap.getId(key));
                if (node.properties) {
                    for (const [key, value] of Object.entries(node.properties)) {
                        externalEndpoint.setPropertyValue(key as EntityPropertyKey, value);
                    }
                }
                if (node.capabilities) {
                    for (const [capabilityKey, capability] of Object.entries(node.capabilities)) {
                        if (capability.properties) {
                            for (const [key, value] of Object.entries(capability.properties)) {
                                externalEndpoint.setPropertyValue(key as EntityPropertyKey, value);
                            }
                        }
                    }
                }
                if (node.requirements) {
                    for (const requirementAssignment of node.requirements) {
                        for (const [requirementKey, requirement] of Object.entries(requirementAssignment)) {
                            if (requirementKey === "uses_data") { // TODO no hard coded Key

                                if (typeof requirement === "string") {
                                    externalEndpoint.addDataAggregateEntity(this.#importedSystem.getDataAggregateEntities.get(this.#keyIdMap.getId(requirement)), new RelationToDataAggregate(`${externalEndpoint.getId}_uses_data_${this.#keyIdMap.getId(requirement)}`, getEmptyMetaData()));
                                } else if (typeof requirement === "object") {
                                    // TODO requirement is of type TOSCA_Requirement_Assignment
                                    if (requirement.node && requirement.relationship && typeof requirement.relationship === "string") {
                                        let relationship = this.#serviceTemplate.relationship_templates[requirement.relationship];

                                        let metaData = !!relationship.metadata ? readToscaMetaData(relationship.metadata) : getEmptyMetaData();
                                        let relation = new RelationToDataAggregate(requirement.relationship, metaData);

                                        for (const [key, value] of Object.entries(relationship.properties)) {
                                            relation.setPropertyValue(key as EntityPropertyKey, value);
                                        }

                                        externalEndpoint.addDataAggregateEntity(this.#importedSystem.getDataAggregateEntities.get(this.#keyIdMap.getId(requirement.node)), relation);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // continue with components
        for (const [key, node] of Object.entries(this.#serviceTemplate.node_templates)) {
            if (node.type === SERVICE_TOSCA_KEY ||
                node.type === BACKING_SERVICE_TOSCA_KEY ||
                node.type === STORAGE_BACKING_SERVICE_TOSCA_KEY ||
                node.type === PROXY_BACKING_SERVICE_TOSCA_KEY ||
                node.type === BROKER_BACKING_SERVICE_TOSCA_KEY ||
                node.type === COMPONENT_TOSCA_KEY) {
                let component = this.#importedSystem.getComponentEntities.get(this.#keyIdMap.getId(key));

                this.#parseRequirements(node, component, endpoints);

                if (node.properties) {
                    for (const [key, value] of Object.entries(node.properties)) {
                        component.setPropertyValue(key as EntityPropertyKey, value);
                    }
                }

                if (node.capabilities) {
                    for (const [capabilityKey, capability] of Object.entries(node.capabilities)) {
                        if (capability.properties) {
                            for (const [propertyKey, propertyValue] of Object.entries(capability.properties)) {
                                component.setPropertyValue(propertyKey as EntityPropertyKey, propertyValue);
                            }
                        }
                    }
                }

                if (node.artifacts) {
                    for (const [key, value] of Object.entries(node.artifacts)) {
                        component.setArtifact(key, new Artifact(
                            value.type ? value.type : "",
                            value.file ? value.file : "",
                            value.repository ? value.repository : "",
                            value.description ? value.description : "",
                            value.deploy_path ? value.deploy_path : "",
                            value.artifact_version ? value.artifact_version : "",
                            value.checksum ? value.checksum : "",
                            value.checksum_algorithm ? value.checksum_algorithm : ""
                        ))
                    }
                }
            }
        }

        // parse relationship_templates to add properties to links and deployment mappings
        for (const [key, relationship] of Object.entries(this.#serviceTemplate.relationship_templates)) {

            if (relationship.type === LINK_TOSCA_KEY) {
                if (relationship.properties) {
                    const linkEntity = this.#importedSystem.getLinkEntities.get(this.#keyIdMap.getId(key));
                    for (const [key, value] of Object.entries(relationship.properties)) {
                        linkEntity.setPropertyValue(key as EntityPropertyKey, value);
                    }
                }
            } else if (relationship.type === DEPLOYMENT_MAPPING_TOSCA_KEY) {
                if (relationship.properties) {
                    const deploymentMappingEntity = this.#importedSystem.getDeploymentMappingEntities.get(this.#keyIdMap.getId(key));
                    for (const [key, value] of Object.entries(relationship.properties)) {
                        deploymentMappingEntity.setPropertyValue(key as EntityPropertyKey, value);
                    }
                }
            }
        }

        // finally add request traces
        for (const [key, node] of Object.entries(this.#serviceTemplate.node_templates)) {
            if (node.type === REQUEST_TRACE_TOSCA_KEY) {

                let requestTrace = this.#importedSystem.getRequestTraceEntities.get(this.#keyIdMap.getId(key));

                if (node.requirements) {
                    for (const requirementAssignment of node.requirements) {
                        for (const [requirementKey, requirement] of Object.entries(requirementAssignment)) {
                            if (requirementKey === "external_endpoint") {
                                if (typeof requirement === "string") {
                                    // TODO 
                                } else {
                                    if (requirement.node) {
                                        let externalEndpoint = endpoints.get(this.#keyIdMap.getId(requirement.node));
                                        if (externalEndpoint) {
                                            requestTrace.setExternalEndpoint = externalEndpoint;
                                        }
                                    }
                                }

                            }
                        }
                    }
                }

                let links: Link[][] = node.properties && node.properties["involved_links"] ? node.properties["involved_links"].map(index => index.map(linkKey => this.#importedSystem.getLinkEntities.get(this.#keyIdMap.getId(linkKey)))) : [];

                requestTrace.setLinks = links;

                if (node.properties) {
                    for (const [key, value] of Object.entries(node.properties)) {
                        switch (key) {
                            case "nodes":
                                requestTrace.setPropertyValue(key as EntityPropertyKey, value.map(nodeKey => this.#keyIdMap.getId(nodeKey)));
                                break;
                            case "involved_links":
                                // ignore, because it has been set already
                                break;
                            default:
                                requestTrace.setPropertyValue(key as EntityPropertyKey, value);
                        }
                    }
                }
            }
        }

        return this.#importedSystem;
    }

    #transformYamlKeyToLabel(key: string) {

        // 1. replace underscore with whitespace
        // 2. make first character uppercase
        // 3. make all characters after a space uppercase

        return key.replace(MATCH_UNDERSCORE, " ").replace(MATCH_FIRST_CHARACTER, (match) => match.toUpperCase()).replace(MATCH_CHARACTER_AFTER_SPACE, (match, p1, p2) => `${p1}${p2.toUpperCase()}`)
    }

    #parseRequirements(node: TOSCA_Node_Template, component: Entities.Component, endpoints: Map<string, Entities.Endpoint>) {
        if (node.requirements) {
            for (const requirementAssignment of node.requirements) {
                for (const [requirementKey, requirement] of Object.entries(requirementAssignment)) {
                    switch (requirementKey) {
                        case "uses_data":
                            if (typeof requirement === "string") {
                                // TODO properly deal with this?
                                component.addDataAggregateEntity(this.#importedSystem.getDataAggregateEntities.get(this.#keyIdMap.getId(requirement)), new RelationToDataAggregate(`${component.getId}_uses_data_${this.#keyIdMap.getId(requirement)}`, getEmptyMetaData()));
                            } else if (typeof requirement === "object") {
                                // TODO requirement is of type TOSCA_Requirement_Assignment
                                if (requirement.node && requirement.relationship && typeof requirement.relationship === "string") {
                                    let relationship = this.#serviceTemplate.relationship_templates[requirement.relationship];
                                    let metaData = !!relationship.metadata ? readToscaMetaData(relationship.metadata) : getEmptyMetaData();
                                    let relation = new RelationToDataAggregate(requirement.relationship, metaData);

                                    for (const [key, value] of Object.entries(relationship.properties)) {
                                        relation.setPropertyValue(key as EntityPropertyKey, value);
                                    }

                                    component.addDataAggregateEntity(this.#importedSystem.getDataAggregateEntities.get(this.#keyIdMap.getId(requirement.node)), relation);
                                }
                            }
                            break;
                        case "uses_backing_data":
                            if (typeof requirement === "string") {
                                component.addBackingDataEntity(this.#importedSystem.getBackingDataEntities.get(this.#keyIdMap.getId(requirement)), new RelationToBackingData(`${component.getId}_uses_backing_data_${this.#keyIdMap.getId(requirement)}`, getEmptyMetaData()));
                            } else if (typeof requirement === "object") {
                                // TODO requirement is of type TOSCA_Requirement_Assignment
                                if (requirement.node && requirement.relationship && typeof requirement.relationship === "string") {
                                    let relationship = this.#serviceTemplate.relationship_templates[requirement.relationship];

                                    let metaData = !!relationship.metadata ? readToscaMetaData(relationship.metadata) : getEmptyMetaData();
                                    let relation = new RelationToBackingData(requirement.relationship, metaData);

                                    for (const [key, value] of Object.entries(relationship.properties)) {
                                        relation.setPropertyValue(key as EntityPropertyKey, value);
                                    }

                                    component.addBackingDataEntity(this.#importedSystem.getBackingDataEntities.get(this.#keyIdMap.getId(requirement.node)), relation);
                                }
                            }
                            break;
                        case "provides_endpoint":
                            if (typeof requirement === "string") {
                                // TODO requirement is of type string
                            } else {
                                component.addEndpoint(endpoints.get(this.#keyIdMap.getId(requirement.node)));
                            }
                            break;
                        case "provides_external_endpoint":
                            if (typeof requirement === "string") {
                                // TODO requirement is of type string
                            } else {
                                component.addEndpoint(endpoints.get(this.#keyIdMap.getId(requirement.node)));
                            }
                            break;
                        case "host":
                            if (typeof requirement === "string") {
                                // TODO requirement is of type string
                            } else {
                                let linkId = uuidv4();
                                let deploymentMapping = new Entities.DeploymentMapping(linkId, component, this.#importedSystem.getInfrastructureEntities.get(this.#keyIdMap.getId(requirement.node)));
                                this.#keyIdMap.add(requirement.relationship as string, linkId) // TODO requirement.relationship is object
                                this.#importedSystem.addEntity(deploymentMapping);
                            }
                            break;
                        case "endpoint_link":
                            if (typeof requirement === "string") {
                                // TODO requirement is of type string
                            } else if (typeof requirement === "object") {
                                let linkId = uuidv4();
                                let link = new Entities.Link(linkId, component, endpoints.get(this.#keyIdMap.getId(requirement.node)));
                                this.#keyIdMap.add(requirement.relationship as string, linkId) // TODO requirement.relationship is object
                                this.#importedSystem.addEntity(link);
                                // TODO add to Component (includedLinks?)
                            }
                            break;
                        case "external_ingress_proxied_by":
                            if (typeof requirement === "string") {
                                // TODO requirement is of type string
                            } else if (typeof requirement === "object") {
                                component.setExternalIngressProxiedBy = this.#importedSystem.getComponentEntities.get(this.#keyIdMap.getId(requirement.node));
                            }
                            break;
                        case "ingress_proxied_by":
                            if (typeof requirement === "string") {
                                // TODO requirement is of type string
                            } else if (typeof requirement === "object") {
                                component.setIngressProxiedBy = this.#importedSystem.getComponentEntities.get(this.#keyIdMap.getId(requirement.node));
                            }
                            break;
                        case "egress_proxied_by":
                            if (typeof requirement === "string") {
                                // TODO requirement is of type string
                            } else if (typeof requirement === "object") {
                                component.setEgressProxiedBy = this.#importedSystem.getComponentEntities.get(this.#keyIdMap.getId(requirement.node));
                            }
                            break;
                        case "address_resolution_by":
                            if (typeof requirement === "string") {
                                // TODO requirement is of type string
                            } else if (typeof requirement === "object") {
                                let addressResolutionEntity: Entities.Component | Entities.Infrastructure | Entities.Network = this.#importedSystem.getComponentEntities.get(this.#keyIdMap.getId(requirement.node));
                                if (!addressResolutionEntity) {
                                    addressResolutionEntity = this.#importedSystem.getInfrastructureEntities.get(this.#keyIdMap.getId(requirement.node));
                                }
                                if (!addressResolutionEntity) {
                                    addressResolutionEntity = this.#importedSystem.getNetworkEntities.get(this.#keyIdMap.getId(requirement.node));
                                }
                                if (!addressResolutionEntity) {
                                    throw new Error(`Node with key ${requirement.node} not found!`);
                                }
                                component.setAddressResolutionBy = addressResolutionEntity;
                            }
                            break;
                        case "authentication_by":
                            if (typeof requirement === "string") {
                                // TODO requirement is of type string
                            } else if (typeof requirement === "object") {
                                let authenticationEntity: Entities.Component = this.#importedSystem.getComponentEntities.get(this.#keyIdMap.getId(requirement.node));
                                if (!authenticationEntity) {
                                    throw new Error(`Node with key ${requirement.node} not found!`);
                                }
                                component.setAuthenticationBy = authenticationEntity;
                            }
                            break;
                        case "assigned_to_network":
                            if (typeof requirement === "string") {
                                // TODO requirement is of type string
                            } else if (typeof requirement === "object") {
                                let assignedToNetwork = this.#importedSystem.getNetworkEntities.get(this.#keyIdMap.getId(requirement.node));
                                component.addNetwork(assignedToNetwork);
                            }
                            break;
                    }

                }
            }
        }
    }
}

export { ToscaToEntitesConverter }