/* 
   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions 
*/

import { TOSCA_File } from '../../tosca-types/v2dot0-types/definition-types.js';

export const cna_modeling_profile: TOSCA_File = {
  "tosca_definitions_version": "tosca_2_0",
  "profile": "org.dsg.cna-modeling:0.2",
  "metadata": {
    "template_name": "profile.yaml",
    "template_author": "Distributed Systems Group",
    "template_version": 0.2
  },
  "description": "This TOSCA definitions document contains the CNA Modeling TOSCA profile",
  "dsl_definitions": "",
  "repositories": {},
  "artifact_types": {},
  "data_types": {},
  "capability_types": {
    "cna-modeling.capabilities.Proxy": {
      "description": "When included, the Node is able to act as a proxy. This covers all communication to the endpoints of the proxied component.",
      "derived_from": "Node"
    }
  },
  "interface_types": {},
  "relationship_types": {
    "cna-modeling.entities.ConnectsTo.Link": {
      "description": "Relationship Type to model Link entities",
      "interfaces": {
        "Configure": {
          "type": "Relationship.Configure"
        }
      },
      "derived_from": "ConnectsTo",
      "properties": {
        "credential": {
          "description": "The security credential to present to the target endpoint for either authentication or authorization purposes.",
          "type": "Credential",
          "required": false
        },
        "relation_type": {
          "type": "string",
          "required": true,
          "description": "Type of relation, e.g. subscribes to or calls"
        },
        "timeout": {
          "type": "integer",
          "description": "If a timeout is applied for this link, specify it's length here. If no timeout is applied, use 0.",
          "default": 0,
          "required": true
        },
        "retries": {
          "type": "integer",
          "description": "Number of times this invocation is retried, if it fails.",
          "default": 0,
          "required": true
        },
        "circuit_breaker": {
          "type": "string",
          "description": "Whether or not this invocation is protected by a circuit breaker",
          "default": "none"
        }
      },
      "valid_target_node_types": [
        "Endpoint",
        "cna-modeling.entities.Endpoint",
        "cna-modeling.entities.Endpoint.External"
      ],
      "valid_capability_types": [
        "Endpoint",
        "Endpoint.Public"
      ]
    },
    "cna-modeling.entities.HostedOn.DeploymentMapping": {
      "description": "Relationship Type to model DeploymentMapping entities",
      "interfaces": {
        "Configure": {
          "type": "Relationship.Configure"
        }
      },
      "derived_from": "HostedOn",
      "valid_target_node_types": [
        "Container",
        "cna-modeling.entities.Infrastructure"
      ],
      "properties": {
        "deployment": {
          "type": "string",
          "required": true,
          "description": "How this deployment mapping is described or ensured. Valid values can be manual, automated imperative, or automated declarative",
          "default": "manual"
        },
        "deployment_unit": {
          "type": "string",
          "required": true,
          "description": "When this deployment mapping can be described as a specific unit of deployment (e.g. a Kubernetes Pod), state it here. Otherwise it is custom.",
          "default": "custom"
        },
        "replicas": {
          "type": "integer",
          "description": "The minimum number of replicated instances for the deployed component when it is running",
          "required": true,
          "default": 1
        },
        "update_strategy": {
          "type": "string",
          "required": true,
          "description": "How the deployed entity is updated in case a new version is deployed. It can simply be replaced by an instance of the new version, or specific strategies like \"rolling upgrade\" or \"blue-green\" can be used.",
          "default": "in-place"
        },
        "automated_restart_policy": {
          "type": "string",
          "required": true,
          "description": "If the deployed entity is automatically restarted in case of failure.",
          "default": "never"
        },
        "assigned_account": {
          "type": "string",
          "required": true,
          "description": "The name of the account under which this component is deployed (e.g. a service account from a cloud provider)",
          "default": "default-account"
        },
        "resource_requirements": {
          "type": "string",
          "required": true,
          "description": "Explicitly stated resource requirements for this deployment. If stated the infrastructure can schedule an entity accordingly.",
          "default": "unstated"
        }
      },
      "valid_capability_types": [
        "Compute"
      ]
    },
    "cna-modeling.relationships.Provides.Endpoint": {
      "description": "Relationship Type to connect Endpoints to the Components which provide them",
      "interfaces": {
        "Configure": {
          "type": "Relationship.Configure"
        }
      },
      "derived_from": "Root",
      "valid_capability_types": [
        "Endpoint",
        "Endpoint.Public"
      ],
      "valid_target_node_types": [
        "cna-modeling.entities.Endpoint",
        "cna-modeling.entities.Endpoint.External"
      ]
    },
    "cna-modeling.relationships.AttachesTo.DataAggregate": {
      "description": "The AttachesTo type represents an attachment relationship between two nodes (e.g. for attaching a storage node to a Compute node).",
      "interfaces": {
        "Configure": {
          "type": "Relationship.Configure"
        }
      },
      "derived_from": "AttachesTo",
      "properties": {
        "location": {
          "description": "The relative location (e.g., mount point on the file system) that provides the root location to address the attached node.",
          "type": "string",
          "required": false
        },
        "device": {
          "description": "The logical device name for the attached device.",
          "type": "string",
          "required": false
        },
        "usage_relation": {
          "type": "string",
          "required": true,
          "description": "Describes how a component uses attached data, that means whether it just uses (reads) it for its functionality or if it also updates and persists (writes) it; possible values are usage, cached usage, and persistence"
        },
        "sharding_level": {
          "type": "integer",
          "required": true,
          "default": 0,
          "description": "Only applicable if data is persisted by a component; If a component persists data, the sharding level describes the number of shards used; 0 acts as a placeholder if data is not persisted; 1 is the default meaning that no sharding is used; >1 is the number of shards"
        }
      },
      "valid_target_node_types": [
        "Attachment"
      ]
    },
    "cna-modeling.relationships.AttachesTo.BackingData": {
      "description": "The AttachesTo type represents an attachment relationship between two nodes (e.g. for attaching a storage node to a Compute node).",
      "interfaces": {
        "Configure": {
          "type": "Relationship.Configure"
        }
      },
      "derived_from": "AttachesTo",
      "properties": {
        "location": {
          "description": "The relative location (e.g., mount point on the file system) that provides the root location to address the attached node.",
          "type": "string",
          "required": false
        },
        "device": {
          "description": "The logical device name for the attached device.",
          "type": "string",
          "required": false
        },
        "usage_relation": {
          "type": "string",
          "required": true,
          "description": "Describes how a component uses attached data, that means whether it just uses (reads) it for its functionality or if it also updates and persists (writes) it; possible values are usage and persistence"
        }
      },
      "valid_target_node_types": [
        "Attachment",
        "cna-modeling.entities.BackingData"
      ],
      "valid_capability_types": [
        "Attachment"
      ]
    },
    "cna-modeling.relationships.ProxiedBy.BackingService": {
      "description": "Relationship Type to connect Components to Backing Services which act as a proxy for them",
      "interfaces": {
        "Configure": {
          "type": "Relationship.Configure"
        }
      },
      "derived_from": "Root",
      "valid_target_node_types": [
        "cna.qualityModel.entities.BackingService"
      ]
    }
  },
  "node_types": {
    "cna-modeling.entities.Component": {
      "description": "Node Type to model Component entities",
      "attributes": {
        "state": {
          "type": "string"
        }
      },
      "capabilities": {
        "feature": {
          "type": "Node"
        }
      },
      "requirements": [
        {
          "dependency": {
            "capability": "Node",
            "node": "Root",
            "relationship": "DependsOn",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "host": {
            "capability": "Compute",
            "node": "cna-modeling.entities.Infrastructure",
            "relationship": "cna-modeling.entities.HostedOn.DeploymentMapping"
          }
        },
        {
          "provides_endpoint": {
            "capability": "Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "Endpoint.Public",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "Endpoint",
            "node": "cna-modeling.entities.Endpoint",
            "relationship": "cna-modeling.relationships.ConnectsTo.Link",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "Attachment",
            "node": "cna-modeling.entities.DataAggregate",
            "relationship": "cna-modeling.relationships.AttachesTo.DataAggregate",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "Attachment",
            "node": "cna-modeling.entities.BackingData",
            "relationship": "cna-modeling.relationships.AttachesTo.BackingData",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.BackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.BackingService",
            "count_range": [
              0,
              1
            ]
          }
        }
      ],
      "interfaces": {
        "Standard": {
          "type": "Lifecycle.Standard"
        }
      },
      "derived_from": "SoftwareComponent",
      "properties": {
        "component_version": {
          "description": "Domain-specific software component version.\n",
          "type": "version",
          "required": false
        },
        "admin_credential": {
          "description": "The optional credential that can be used to authenticate to the software component.",
          "type": "Credential",
          "required": false
        },
        "managed": {
          "type": "boolean",
          "description": "A component is managed if it is exclusively operated by someone else, e.g. a cloud provider and the source code of the component instance is inaccessible. If the source code of a component can be changed by yourself, the component is not managed.",
          "required": true
        },
        "software_type": {
          "type": "string",
          "description": "The type of the software in the sense of who developed it. If it is a self-written component use \"custom\", if it is an existing open-source solution which is not customized (apart from configuration) use \"open-source\". If it is licensed proprietary software, use \"proprietary\".",
          "default": "custom",
          "required": true
        },
        "stateless": {
          "type": "boolean",
          "description": "True if this component is stateless, that means it requires no disk storage space where data is persisted between executions. That means it can store data to disk, but should not rely on this data to be available for following executions. Instead it should be able to restore required data after a restart in a different environment.",
          "default": true,
          "required": true
        },
        "artifact": {
          "type": "string",
          "description": "The kind of artifact which is produced for deploying this component. This can for example be a container image, a native executable, a jar file, or some custom packaging format for specific cloud services.",
          "required": true
        },
        "load_shedding": {
          "type": "boolean",
          "description": "Whether or not this component applies load shedding. That means whether the component rejects incoming load based on certain thresholds (resource usage, concurrent requests).",
          "required": true,
          "default": false
        },
        "assigned_networks": {
          "type": "list",
          "description": "A list of networks to which this component is assigned to.",
          "entry_schema": {
            "description": "Either a network id or subnet mask",
            "type": "string"
          }
        }
      }
    },
    "cna-modeling.entities.Service": {
      "description": "Node Type to model Service entities",
      "attributes": {
        "state": {
          "type": "string"
        }
      },
      "capabilities": {
        "feature": {
          "type": "Node"
        }
      },
      "requirements": [
        {
          "dependency": {
            "capability": "Node",
            "node": "Root",
            "relationship": "DependsOn",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "host": {
            "capability": "Compute",
            "node": "cna-modeling.entities.Infrastructure",
            "relationship": "cna-modeling.entities.HostedOn.DeploymentMapping"
          }
        },
        {
          "provides_endpoint": {
            "capability": "Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "Endpoint.Public",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "Endpoint",
            "node": "cna-modeling.entities.Endpoint",
            "relationship": "cna-modeling.relationships.ConnectsTo.Link",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "Attachment",
            "node": "cna-modeling.entities.DataAggregate",
            "relationship": "cna-modeling.relationships.AttachesTo.DataAggregate",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "Attachment",
            "node": "cna-modeling.entities.BackingData",
            "relationship": "cna-modeling.relationships.AttachesTo.BackingData",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.BackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.BackingService",
            "count_range": [
              0,
              1
            ]
          }
        }
      ],
      "interfaces": {
        "Standard": {
          "type": "Lifecycle.Standard"
        }
      },
      "derived_from": "cna-modeling.entities.Component",
      "properties": {
        "component_version": {
          "description": "Domain-specific software component version.\n",
          "type": "version",
          "required": false
        },
        "admin_credential": {
          "description": "The optional credential that can be used to authenticate to the software component.",
          "type": "Credential",
          "required": false
        },
        "managed": {
          "type": "boolean",
          "description": "A component is managed if it is exclusively operated by someone else, e.g. a cloud provider and the source code of the component instance is inaccessible. If the source code of a component can be changed by yourself, the component is not managed.",
          "required": true
        },
        "software_type": {
          "type": "string",
          "description": "The type of the software in the sense of who developed it. If it is a self-written component use \"custom\", if it is an existing open-source solution which is not customized (apart from configuration) use \"open-source\". If it is licensed proprietary software, use \"proprietary\".",
          "default": "custom",
          "required": true
        },
        "stateless": {
          "type": "boolean",
          "description": "True if this component is stateless, that means it requires no disk storage space where data is persisted between executions. That means it can store data to disk, but should not rely on this data to be available for following executions. Instead it should be able to restore required data after a restart in a different environment.",
          "default": true,
          "required": true
        },
        "artifact": {
          "type": "string",
          "description": "The kind of artifact which is produced for deploying this component. This can for example be a container image, a native executable, a jar file, or some custom packaging format for specific cloud services.",
          "required": true
        },
        "load_shedding": {
          "type": "boolean",
          "description": "Whether or not this component applies load shedding. That means whether the component rejects incoming load based on certain thresholds (resource usage, concurrent requests).",
          "required": true,
          "default": false
        },
        "assigned_networks": {
          "type": "list",
          "description": "A list of networks to which this component is assigned to.",
          "entry_schema": {
            "description": "Either a network id or subnet mask",
            "type": "string"
          }
        }
      }
    },
    "cna-modeling.entities.BackingService": {
      "description": "Node Type to model Backing Service entities",
      "attributes": {
        "state": {
          "type": "string"
        }
      },
      "capabilities": {
        "feature": {
          "type": "Node"
        },
        "proxy": {
          "type": "cna-modeling.capabilities.Proxy",
          "valid_source_node_types": [
            "cna-modeling.entities.Component",
            "cna-modeling.entities.Service",
            "cna-modeling.entities.BackingService",
            "cna-modeling.entities.StorageBackingService"
          ]
        }
      },
      "requirements": [
        {
          "dependency": {
            "capability": "Node",
            "node": "Root",
            "relationship": "DependsOn",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "host": {
            "capability": "Compute",
            "node": "cna-modeling.entities.Infrastructure",
            "relationship": "cna-modeling.entities.HostedOn.DeploymentMapping"
          }
        },
        {
          "provides_endpoint": {
            "capability": "Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "Endpoint.Public",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "Endpoint",
            "node": "cna-modeling.entities.Endpoint",
            "relationship": "cna-modeling.relationships.ConnectsTo.Link",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "Attachment",
            "node": "cna-modeling.entities.DataAggregate",
            "relationship": "cna-modeling.relationships.AttachesTo.DataAggregate",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "Attachment",
            "node": "cna-modeling.entities.BackingData",
            "relationship": "cna-modeling.relationships.AttachesTo.BackingData",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.BackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.BackingService",
            "count_range": [
              0,
              1
            ]
          }
        }
      ],
      "interfaces": {
        "Standard": {
          "type": "Lifecycle.Standard"
        }
      },
      "derived_from": "cna-modeling.entities.Component",
      "properties": {
        "component_version": {
          "description": "Domain-specific software component version.\n",
          "type": "version",
          "required": false
        },
        "admin_credential": {
          "description": "The optional credential that can be used to authenticate to the software component.",
          "type": "Credential",
          "required": false
        },
        "managed": {
          "type": "boolean",
          "description": "A component is managed if it is exclusively operated by someone else, e.g. a cloud provider and the source code of the component instance is inaccessible. If the source code of a component can be changed by yourself, the component is not managed.",
          "required": true
        },
        "software_type": {
          "type": "string",
          "description": "The type of the software in the sense of who developed it. If it is a self-written component use \"custom\", if it is an existing open-source solution which is not customized (apart from configuration) use \"open-source\". If it is licensed proprietary software, use \"proprietary\".",
          "default": "custom",
          "required": true
        },
        "stateless": {
          "type": "boolean",
          "description": "True if this component is stateless, that means it requires no disk storage space where data is persisted between executions. That means it can store data to disk, but should not rely on this data to be available for following executions. Instead it should be able to restore required data after a restart in a different environment.",
          "default": true,
          "required": true
        },
        "artifact": {
          "type": "string",
          "description": "The kind of artifact which is produced for deploying this component. This can for example be a container image, a native executable, a jar file, or some custom packaging format for specific cloud services.",
          "required": true
        },
        "load_shedding": {
          "type": "boolean",
          "description": "Whether or not this component applies load shedding. That means whether the component rejects incoming load based on certain thresholds (resource usage, concurrent requests).",
          "required": true,
          "default": false
        },
        "assigned_networks": {
          "type": "list",
          "description": "A list of networks to which this component is assigned to.",
          "entry_schema": {
            "description": "Either a network id or subnet mask",
            "type": "string"
          }
        },
        "providedFunctionality": {
          "type": "string",
          "description": "A short description of the provided functionality.",
          "required": false
        }
      }
    },
    "cna-modeling.entities.StorageBackingService": {
      "description": "Node Type to model Storage Backing Service entities",
      "attributes": {
        "state": {
          "type": "string"
        }
      },
      "capabilities": {
        "feature": {
          "type": "Node"
        }
      },
      "requirements": [
        {
          "dependency": {
            "capability": "Node",
            "node": "Root",
            "relationship": "DependsOn",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "host": {
            "capability": "Compute",
            "node": "cna-modeling.entities.Infrastructure",
            "relationship": "cna-modeling.entities.HostedOn.DeploymentMapping"
          }
        },
        {
          "provides_endpoint": {
            "capability": "Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "Endpoint.Public",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "Endpoint",
            "node": "cna-modeling.entities.Endpoint",
            "relationship": "cna-modeling.relationships.ConnectsTo.Link",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "Attachment",
            "node": "cna-modeling.entities.DataAggregate",
            "relationship": "cna-modeling.relationships.AttachesTo.DataAggregate",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "Attachment",
            "node": "cna-modeling.entities.BackingData",
            "relationship": "cna-modeling.relationships.AttachesTo.BackingData",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.BackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.BackingService",
            "count_range": [
              0,
              1
            ]
          }
        }
      ],
      "interfaces": {
        "Standard": {
          "type": "Lifecycle.Standard"
        }
      },
      "derived_from": "cna-modeling.entities.Component",
      "properties": {
        "component_version": {
          "description": "Domain-specific software component version.\n",
          "type": "version",
          "required": false
        },
        "admin_credential": {
          "description": "The optional credential that can be used to authenticate to the software component.",
          "type": "Credential",
          "required": false
        },
        "managed": {
          "type": "boolean",
          "description": "A component is managed if it is exclusively operated by someone else, e.g. a cloud provider and the source code of the component instance is inaccessible. If the source code of a component can be changed by yourself, the component is not managed.",
          "required": true
        },
        "software_type": {
          "type": "string",
          "description": "The type of the software in the sense of who developed it. If it is a self-written component use \"custom\", if it is an existing open-source solution which is not customized (apart from configuration) use \"open-source\". If it is licensed proprietary software, use \"proprietary\".",
          "default": "custom",
          "required": true
        },
        "stateless": {
          "type": "boolean",
          "description": "Storage Backing Service are per default stateful (not stateless)",
          "default": false,
          "required": true
        },
        "artifact": {
          "type": "string",
          "description": "The kind of artifact which is produced for deploying this component. This can for example be a container image, a native executable, a jar file, or some custom packaging format for specific cloud services.",
          "required": true
        },
        "load_shedding": {
          "type": "boolean",
          "description": "Whether or not this component applies load shedding. That means whether the component rejects incoming load based on certain thresholds (resource usage, concurrent requests).",
          "required": true,
          "default": false
        },
        "assigned_networks": {
          "type": "list",
          "description": "A list of networks to which this component is assigned to.",
          "entry_schema": {
            "description": "Either a network id or subnet mask",
            "type": "string"
          }
        },
        "name": {
          "type": "string",
          "description": "the logical name of the database",
          "required": true
        },
        "shards": {
          "type": "integer",
          "description": "The number of shards this storage service is configured with, the default of 1 means no sharding is used.",
          "required": true,
          "default": 1
        }
      }
    },
    "cna-modeling.entities.Infrastructure": {
      "description": "Node Type to model Infrastructure entities",
      "attributes": {
        "state": {
          "type": "string"
        }
      },
      "capabilities": {
        "feature": {
          "type": "Node"
        },
        "host": {
          "type": "Compute",
          "valid_source_node_types": []
        }
      },
      "requirements": [
        {
          "dependency": {
            "capability": "Node",
            "node": "Root",
            "relationship": "DependsOn",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "host": {
            "capability": "Compute",
            "node": "cna-modeling.entities.Infrastructure",
            "relationship": "cna-modeling.entities.HostedOn.DeploymentMapping",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "Attachment",
            "node": "cna-modeling.entities.BackingData",
            "relationship": "cna-modeling.relationships.AttachesTo.BackingData",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "interfaces": {
        "Standard": {
          "type": "Lifecycle.Standard"
        }
      },
      "derived_from": "Abstract.Compute",
      "properties": {
        "kind": {
          "type": "string",
          "description": "The kind of infrastructure. Possible kinds are \"physical hardware\", \"virtual hardware\", \"software platform\", or \"cloud service\".",
          "required": true,
          "default": "virtual hardware"
        },
        "environment_access": {
          "type": "string",
          "description": "Describes the extend of available access to the environment in which the infrastructure is operated. With full access, one can control all aspects of the infrastructure. Limited access means that infrastructure is under control of a provider and only certain things are allowed, such as configuration. With no access infrastructure is completely managed by a cloud provider.",
          "default": "full"
        },
        "maintenance": {
          "type": "string",
          "description": "How infrastructure is maintained, that means for example how updates are installed or how certificates are regenerated.",
          "default": "manual"
        },
        "provisioning": {
          "type": "string",
          "description": "How infrastructure is initially provisioned. This can be done manually (for example through the web interface of a cloud provider), automatically coded (for example through an IaC tool), automatically inferred, if it is inferred based on deployed components, or transparent, if it is not explicitly provisioned by a consumer, but done on-demand by a provider.",
          "default": "manual"
        },
        "supported_artifacts": {
          "type": "list",
          "description": "Which kind of artifacts can be deployed on this infrastructure, e.g. VM images, container images, jar archives, native executables, ...",
          "entry_schema": {
            "description": "An artifact type that this infrastructure supports.",
            "type": "string"
          }
        },
        "availability_zone": {
          "type": "string",
          "required": true,
          "description": "The name of the availability zone in which this infrastructure is provided. If it is running in multiple availability zones, provide their names as a comma-separated list.",
          "default": "default-zone"
        },
        "region": {
          "type": "string",
          "required": true,
          "description": "The name of the region in which this infrastructure is provided.",
          "default": "default-region"
        },
        "supported_update_strategies": {
          "type": "list",
          "description": "Which update strategies are supported for entities deployed on this infrastructure",
          "entry_schema": {
            "description": "An update strategy supported by this infrastructure",
            "type": "string"
          }
        },
        "deployed_entities_scaling": {
          "type": "string",
          "required": true,
          "description": "Whether and how entities deployed on this infrastructure can be scaled horizontally",
          "default": "none"
        },
        "self_scaling": {
          "type": "string",
          "required": true,
          "description": "Whether and how this entity scales itself, either horizontally or vertically.",
          "default": "none"
        },
        "enforced_resource_bounds": {
          "type": "boolean",
          "required": true,
          "description": "Set to true if the infrastructure enforces resource bounds on deployed components, for example regarding cpu shares or memory size. Deployed entities can then only use resources up to a certain bound. Otherwise entities can use resources as available.",
          "default": false
        },
        "assigned_networks": {
          "type": "list",
          "description": "A list of networks to which this infrastructure is assigned to.",
          "entry_schema": {
            "description": "Either a network id or subnet mask",
            "type": "string"
          }
        }
      }
    },
    "cna-modeling.entities.Endpoint": {
      "description": "Endpoint type to explicitly model endpoints as entities",
      "attributes": {
        "state": {
          "type": "string"
        }
      },
      "capabilities": {
        "feature": {
          "type": "Node"
        },
        "endpoint": {
          "type": "Endpoint"
        }
      },
      "requirements": [
        {
          "dependency": {
            "capability": "Node",
            "node": "Root",
            "relationship": "DependsOn",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "Attachment",
            "node": "cna-modeling.entities.DataAggregate",
            "relationship": "cna-modeling.relationships.AttachesTo.DataAggregate",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "interfaces": {
        "Standard": {
          "type": "Lifecycle.Standard"
        }
      },
      "derived_from": "Root",
      "properties": {
        "rate_limiting": {
          "type": "string",
          "required": true,
          "description": "If for this endpoint rate limiting is enforced, the limit can be stated here, otherwise it is \"none\".",
          "default": "none"
        },
        "idempotent": {
          "type": "boolean",
          "required": true,
          "description": "Flag to specify whether this endpoint is idempotent, meaning that the effect of a successful invocation is independent of the number of times it is invoked.",
          "default": false
        },
        "readiness_check": {
          "type": "boolean",
          "required": true,
          "description": "Flag to specify whether this endpoint is used as a readiness check",
          "default": false
        },
        "health_check": {
          "type": "boolean",
          "required": true,
          "description": "Flag to specify whether this endpoint is used as a health check",
          "default": false
        }
      }
    },
    "cna-modeling.entities.Endpoint.External": {
      "description": "Endpoint type to explicitly model external endpoints as entities",
      "attributes": {
        "state": {
          "type": "string"
        }
      },
      "capabilities": {
        "feature": {
          "type": "Node"
        },
        "external_endpoint": {
          "type": "Endpoint.Public"
        }
      },
      "requirements": [
        {
          "dependency": {
            "capability": "Node",
            "node": "Root",
            "relationship": "DependsOn",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "Attachment",
            "node": "cna-modeling.entities.DataAggregate",
            "relationship": "cna-modeling.relationships.AttachesTo.DataAggregate",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "interfaces": {
        "Standard": {
          "type": "Lifecycle.Standard"
        }
      },
      "derived_from": "Root"
    },
    "cna-modeling.entities.BackingData": {
      "description": "Node Type to model Backing Data entities",
      "attributes": {
        "state": {
          "type": "string"
        }
      },
      "capabilities": {
        "feature": {
          "type": "Node"
        },
        "provides_data": {
          "type": "Attachment",
          "valid_source_node_types": [
            "cna-modeling.entities.Component",
            "cna-modeling.entities.Service",
            "cna-modeling.entities.BackingService",
            "cna-modeling.entities.StorageBackingService",
            "cna-modeling.entities.Infrastructure"
          ]
        }
      },
      "requirements": [
        {
          "dependency": {
            "capability": "Node",
            "node": "Root",
            "relationship": "DependsOn",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "interfaces": {
        "Standard": {
          "type": "Lifecycle.Standard"
        }
      },
      "derived_from": "Root",
      "properties": {
        "included_data": {
          "type": "map",
          "required": true,
          "key_schema": {
            "type": "string",
            "description": "The name specifying the individual Backing Data element"
          },
          "entry_schema": {
            "type": "string",
            "description": "The value of the individual Backing Data element"
          }
        }
      }
    },
    "cna-modeling.entities.DataAggregate": {
      "description": "Node Type to model Data Aggregate entities",
      "attributes": {
        "state": {
          "type": "string"
        }
      },
      "capabilities": {
        "feature": {
          "type": "Node"
        },
        "provides_data": {
          "type": "Attachment",
          "valid_source_node_types": [
            "cna-modeling.entities.Component",
            "cna-modeling.entities.Service",
            "cna-modeling.entities.BackingService",
            "cna-modeling.entities.StorageBackingService"
          ]
        }
      },
      "requirements": [
        {
          "dependency": {
            "capability": "Node",
            "node": "Root",
            "relationship": "DependsOn",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "interfaces": {
        "Standard": {
          "type": "Lifecycle.Standard"
        }
      },
      "derived_from": "Root"
    },
    "cna-modeling.entities.RequestTrace": {
      "description": "Node Type to model Request Trace entities",
      "attributes": {
        "state": {
          "type": "string"
        }
      },
      "capabilities": {
        "feature": {
          "type": "Node"
        }
      },
      "requirements": [
        {
          "dependency": {
            "capability": "Node",
            "node": "Root",
            "relationship": "DependsOn",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "external_endpoint": {
            "capability": "Endpoint.Public",
            "relationship": "ConnectsTo",
            "count_range": [
              1,
              1
            ]
          }
        }
      ],
      "interfaces": {
        "Standard": {
          "type": "Lifecycle.Standard"
        }
      },
      "derived_from": "Root",
      "properties": {
        "referred_endpoint": {
          "type": "string",
          "required": true
        },
        "nodes": {
          "type": "list",
          "required": false,
          "entry_schema": {
            "description": "An existing Component, Service, Backing Service or Storage Backing Service entity which is part of this Request Trace entity",
            "type": "string"
          }
        },
        "involved_links": {
          "type": "list",
          "required": true,
          "entry_schema": {
            "description": "An existing Link entity which is part of this Request Trace entity",
            "type": "string"
          }
        }
      }
    }
  },
  "group_types": {},
  "policy_types": {}
};