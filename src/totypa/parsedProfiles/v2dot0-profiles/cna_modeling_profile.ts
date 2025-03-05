/* 
   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions 
*/

import { TOSCA_File } from '../../tosca-types/v2dot0-types/definition-types.js';

export const cna_modeling_profile: TOSCA_File = {
  "tosca_definitions_version": "tosca_2_0",
  "profile": "org.dsg.cna-modeling:0.4",
  "metadata": {
    "template_name": "profile.yaml",
    "template_author": "Distributed Systems Group",
    "template_version": 0.5
  },
  "description": "This TOSCA definitions document contains the CNA Modeling TOSCA profile",
  "dsl_definitions": "",
  "repositories": {},
  "artifact_types": {
    "Kubernetes.Resource": {
      "description": "A Kubernetes resource (like Deployment, Service, etc) which is described in a file\n",
      "file_ext": [
        "yaml",
        "yml"
      ]
    },
    "Implementation.Java": {
      "description": "Artifact type for a Java archive which might be executable\n",
      "derived_from": "Implementation",
      "file_ext": [
        "jar"
      ]
    },
    "Terraform.Script": {
      "description": "A configuration file which can be used by Terraform to set up components or infrastructure.",
      "file_ext": [
        "tf",
        "tf.json"
      ]
    },
    "CloudFormation.Script": {
      "description": "A configuration file which can be used by AWS tools to set up components or infrastructure.",
      "file_ext": [
        "yaml",
        "yml",
        "json"
      ]
    },
    "AWS.Resource": {
      "description": "An abstract type for resources created in the AWS cloud."
    },
    "AWS.EKS.Cluster": {
      "description": "An AWS EKS Cluster",
      "derived_from": "AWS.Resource"
    },
    "AWS.EC2.Instance": {
      "description": "An AWS EC2 Instance",
      "derived_from": "AWS.Resource"
    },
    "AWS.Beanstalk.Application": {
      "description": "An AWS Beanstalk application",
      "derived_from": "AWS.Resource"
    },
    "AWS.RDS.Instance": {
      "description": "An AWS RDS instance",
      "derived_from": "AWS.Resource"
    }
  },
  "data_types": {},
  "capability_types": {
    "cna-modeling.capabilities.Endpoint": {
      "description": "The Endpoint capability enables specifying a relationship to an endpoint."
    },
    "cna-modeling.capabilities.Host": {
      "description": "Indicates that the node can provide hosting."
    },
    "cna-modeling.capabilities.DataUsage": {
      "description": "The DataUsage capability describes the capability of nodes to use data aggregates or backing data."
    },
    "cna-modeling.capabilities.Proxy": {
      "description": "When included, the Node is able to act as a proxy. This covers all communication to the endpoints of the proxied component.",
      "properties": {
        "load_balancing": {
          "description": "Flag whether the proxy functionality includes load balancing",
          "type": "boolean",
          "default": false
        }
      }
    },
    "cna-modeling.capabilities.AdressResolution": {
      "description": "When included, the Node is able to provide address resolution, meaning that symbolic names can be translated into specific IP adresses",
      "properties": {
        "address_resolution_kind": {
          "description": "If address resolution is provided, state the kind here, otherwise leave as 'none'",
          "type": "string",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "none",
                "discovery",
                "DNS",
                "other"
              ]
            ]
          },
          "default": "none"
        }
      }
    },
    "cna-modeling.capabilities.Authentication": {
      "description": "When included, the Node is able to provide authentication services."
    },
    "cna-modeling.capabilities.Linkable": {
      "description": "A node type that includes the Linkable capability indicates that it can be pointed to by a LinksTo relationship type."
    }
  },
  "interface_types": {},
  "relationship_types": {
    "cna-modeling.relationships.ConnectsTo.Link": {
      "description": "Relationship Type to model Link entities",
      "properties": {
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
      "valid_capability_types": [
        "cna-modeling.capabilities.Endpoint"
      ],
      "valid_target_node_types": [
        "cna-modeling.entities.Endpoint",
        "cna-modeling.entities.Endpoint.External"
      ]
    },
    "cna-modeling.relationships.HostedOn.DeploymentMapping": {
      "description": "Relationship Type to model DeploymentMapping entities",
      "properties": {
        "deployment": {
          "type": "string",
          "required": true,
          "description": "How this deployment mapping is described or ensured. Valid values can be manual, automated imperative, or automated declarative",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "manual",
                "automated-imperative",
                "automated-declarative",
                "transparent"
              ]
            ]
          },
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
          "validation": {
            "$valid_values": [
              "$value",
              [
                "in-place",
                "replace",
                "rolling",
                "blue-green"
              ]
            ]
          },
          "default": "in-place"
        },
        "automated_restart_policy": {
          "type": "string",
          "required": true,
          "description": "If the deployed entity is automatically restarted in case of failure.",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "never",
                "onReboot",
                "onProcessFailure",
                "onHealthFailure"
              ]
            ]
          },
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
      ],
      "valid_target_node_types": [
        "cna-modeling.entities.Infrastructure"
      ]
    },
    "cna-modeling.relationships.Provides.Endpoint": {
      "description": "Relationship Type to connect Endpoints to the Components which provide them",
      "valid_capability_types": [
        "cna-modeling.capabilities.Endpoint"
      ],
      "valid_target_node_types": [
        "cna-modeling.entities.Endpoint",
        "cna-modeling.entities.Endpoint.External"
      ]
    },
    "cna-modeling.relationships.AttachesTo.DataAggregate": {
      "properties": {
        "usage_relation": {
          "type": "string",
          "required": true,
          "description": "Describes how a component uses attached data, that means whether it just uses (reads) it for its functionality or if it also updates and persists (writes) it; possible values are usage, cached usage, and persistence",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "usage",
                "cached-usage",
                "persistence"
              ]
            ]
          },
          "default": "usage"
        },
        "sharding_level": {
          "type": "integer",
          "required": true,
          "default": 0,
          "description": "Only applicable if data is persisted by a component; If a component persists data, the sharding level describes the number of shards used; 0 acts as a placeholder if data is not persisted; 1 is the default meaning that no sharding is used; >1 is the number of shards"
        }
      },
      "valid_capability_types": [
        "cna-modeling.capabilities.DataUsage"
      ],
      "valid_target_node_types": [
        "cna-modeling.entities.DataAggregate"
      ]
    },
    "cna-modeling.relationships.AttachesTo.BackingData": {
      "properties": {
        "usage_relation": {
          "type": "string",
          "required": true,
          "description": "Describes how a component uses attached data, that means whether it just uses (reads) it for its functionality or if it also updates and persists (writes) it; possible values are usage, cached usage, and persistence",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "usage",
                "cached-usage",
                "persistence"
              ]
            ]
          },
          "default": "usage"
        }
      },
      "valid_capability_types": [
        "cna-modeling.capabilities.DataUsage"
      ],
      "valid_target_node_types": [
        "cna-modeling.entities.BackingData"
      ]
    },
    "cna-modeling.relationships.ProxiedBy.ProxyBackingService": {
      "description": "Relationship Type to connect Components to Backing Services which act as a proxy for them",
      "valid_capability_types": [
        "cna-modeling.capabilities.Proxy"
      ],
      "valid_target_node_types": [
        "cna-modeling.entities.ProxyBackingService"
      ]
    },
    "cna-modeling.relationships.LinksTo": {
      "description": "The LinksTo type represents an association relationship between a component/infrastructure and a network",
      "valid_capability_types": [
        "cna-modeling.capabilities.Linkable"
      ],
      "valid_target_node_types": [
        "cna-modeling.entities.Network"
      ]
    },
    "cna-modeling.relationships.UseAddressResolution": {
      "description": "Relationship Type to connect Components to entities which provide address resolution",
      "valid_capability_types": [
        "cna-modeling.capabilities.AdressResolution"
      ],
      "valid_target_node_types": [
        "cna-modeling.entities.BackingService",
        "cna-modeling.entities.ProxyBackingService",
        "cna-modeling.entities.Infrastructure",
        "Network"
      ]
    },
    "cna-modeling.relationships.DelegateAuthentication": {
      "description": "Relationship Type to connect Components to entities which provide authentication",
      "valid_capability_types": [
        "cna-modeling.capabilities.Authentication"
      ],
      "valid_target_node_types": [
        "cna-modeling.entities.BackingService"
      ]
    },
    "cna-modeling.relationships.PartOf": {
      "description": "Relationship Type to model an endpoint as part of a request trace",
      "valid_capability_types": [
        "cna-modeling.capabilities.Endpoint"
      ],
      "valid_target_node_types": [
        "cna-modeling.entities.Endpoint.External"
      ]
    }
  },
  "node_types": {
    "cna-modeling.entities.Component": {
      "description": "Node Type to model Component entities",
      "properties": {
        "managed": {
          "type": "boolean",
          "description": "A component is managed if it is exclusively operated by someone else, e.g. a cloud provider and the source code of the component instance is inaccessible. If the source code of a component can be changed by yourself, the component is not managed.",
          "required": true
        },
        "software_type": {
          "type": "string",
          "description": "The type of the software in the sense of who developed it. If it is a self-written component use \"custom\", if it is an existing open-source solution which is not customized (apart from configuration) use \"open-source\". If it is licensed proprietary software, use \"proprietary\".",
          "default": "custom",
          "required": true,
          "validation": {
            "$valid_values": [
              "$value",
              [
                "custom",
                "open-source",
                "proprietary"
              ]
            ]
          }
        },
        "stateless": {
          "type": "boolean",
          "description": "True if this component is stateless, that means it requires no disk storage space where data is persisted between executions. That means it can store data to disk, but should not rely on this data to be available for following executions. Instead it should be able to restore required data after a restart in a different environment.",
          "default": true,
          "required": true
        },
        "load_shedding": {
          "type": "boolean",
          "description": "Whether or not this component applies load shedding. That means whether the component rejects incoming load based on certain thresholds (resource usage, concurrent requests).",
          "required": true,
          "default": false
        },
        "account": {
          "type": "string",
          "description": "The identifier of the account with which this component is executed.",
          "default": "default-account",
          "required": true
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "cna-modeling.capabilities.Host",
            "node": "cna-modeling.entities.Infrastructure",
            "relationship": "cna-modeling.entities.HostedOn.DeploymentMapping"
          }
        },
        {
          "provides_endpoint": {
            "capability": "cna-modeling.capabilities.Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "cna-modeling.capabilities.Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "cna-modeling.capabilities.Endpoint",
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
            "capability": "cna-modeling.capabilities.DataUsage",
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
            "capability": "cna-modeling.capabilities.DataUsage",
            "node": "cna-modeling.entities.BackingData",
            "relationship": "cna-modeling.relationships.AttachesTo.BackingData",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "external_ingress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "ingress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "egress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "assigned_to_network": {
            "capability": "Linkable",
            "node": "Network",
            "relationship": "LinksTo",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "address_resolution_by": {
            "capability": "cna-modeling.capabilities.AdressResolution",
            "relationship": "cna-modeling.relationships.UseAddressResolution",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "authentication_by": {
            "capability": "cna-modeling.capabilities.Authentication",
            "relationship": "cna-modeling.relationships.DelegateAuthentication",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ]
    },
    "cna-modeling.entities.Service": {
      "description": "Node Type to model Service entities",
      "properties": {
        "managed": {
          "type": "boolean",
          "description": "A component is managed if it is exclusively operated by someone else, e.g. a cloud provider and the source code of the component instance is inaccessible. If the source code of a component can be changed by yourself, the component is not managed.",
          "required": true
        },
        "software_type": {
          "type": "string",
          "description": "The type of the software in the sense of who developed it. If it is a self-written component use \"custom\", if it is an existing open-source solution which is not customized (apart from configuration) use \"open-source\". If it is licensed proprietary software, use \"proprietary\".",
          "default": "custom",
          "required": true,
          "validation": {
            "$valid_values": [
              "$value",
              [
                "custom",
                "open-source",
                "proprietary"
              ]
            ]
          }
        },
        "stateless": {
          "type": "boolean",
          "description": "True if this component is stateless, that means it requires no disk storage space where data is persisted between executions. That means it can store data to disk, but should not rely on this data to be available for following executions. Instead it should be able to restore required data after a restart in a different environment.",
          "default": true,
          "required": true
        },
        "load_shedding": {
          "type": "boolean",
          "description": "Whether or not this component applies load shedding. That means whether the component rejects incoming load based on certain thresholds (resource usage, concurrent requests).",
          "required": true,
          "default": false
        },
        "account": {
          "type": "string",
          "description": "The identifier of the account with which this component is executed.",
          "default": "default-account",
          "required": true
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "cna-modeling.capabilities.Host",
            "node": "cna-modeling.entities.Infrastructure",
            "relationship": "cna-modeling.entities.HostedOn.DeploymentMapping"
          }
        },
        {
          "provides_endpoint": {
            "capability": "cna-modeling.capabilities.Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "cna-modeling.capabilities.Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "cna-modeling.capabilities.Endpoint",
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
            "capability": "cna-modeling.capabilities.DataUsage",
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
            "capability": "cna-modeling.capabilities.DataUsage",
            "node": "cna-modeling.entities.BackingData",
            "relationship": "cna-modeling.relationships.AttachesTo.BackingData",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "external_ingress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "ingress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "egress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "assigned_to_network": {
            "capability": "Linkable",
            "node": "Network",
            "relationship": "LinksTo",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "address_resolution_by": {
            "capability": "cna-modeling.capabilities.AdressResolution",
            "relationship": "cna-modeling.relationships.UseAddressResolution",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "authentication_by": {
            "capability": "cna-modeling.capabilities.Authentication",
            "relationship": "cna-modeling.relationships.DelegateAuthentication",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "derived_from": "cna-modeling.entities.Component"
    },
    "cna-modeling.entities.BackingService": {
      "description": "Node Type to model Backing Service entities",
      "properties": {
        "managed": {
          "type": "boolean",
          "description": "A component is managed if it is exclusively operated by someone else, e.g. a cloud provider and the source code of the component instance is inaccessible. If the source code of a component can be changed by yourself, the component is not managed.",
          "required": true
        },
        "software_type": {
          "type": "string",
          "description": "The type of the software in the sense of who developed it. If it is a self-written component use \"custom\", if it is an existing open-source solution which is not customized (apart from configuration) use \"open-source\". If it is licensed proprietary software, use \"proprietary\".",
          "default": "custom",
          "required": true,
          "validation": {
            "$valid_values": [
              "$value",
              [
                "custom",
                "open-source",
                "proprietary"
              ]
            ]
          }
        },
        "stateless": {
          "type": "boolean",
          "description": "True if this component is stateless, that means it requires no disk storage space where data is persisted between executions. That means it can store data to disk, but should not rely on this data to be available for following executions. Instead it should be able to restore required data after a restart in a different environment.",
          "default": true,
          "required": true
        },
        "load_shedding": {
          "type": "boolean",
          "description": "Whether or not this component applies load shedding. That means whether the component rejects incoming load based on certain thresholds (resource usage, concurrent requests).",
          "required": true,
          "default": false
        },
        "account": {
          "type": "string",
          "description": "The identifier of the account with which this component is executed.",
          "default": "default-account",
          "required": true
        },
        "providedFunctionality": {
          "type": "string",
          "description": "The functionality provided by this backing service",
          "required": true,
          "validation": {
            "$valid_values": [
              "$value",
              [
                "naming/addressing",
                "configuration",
                "authentication/authorization",
                "logging",
                "metrics",
                "tracing",
                "vault",
                "other"
              ]
            ]
          },
          "default": "other"
        },
        "replication_strategy": {
          "type": "string",
          "description": "The strategy used to replicate data, if multiple replicas of this backing service are deployed.",
          "required": true,
          "default": "none",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "none",
                "read-only-replication",
                "active-active-replication"
              ]
            ]
          }
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "cna-modeling.capabilities.Host",
            "node": "cna-modeling.entities.Infrastructure",
            "relationship": "cna-modeling.entities.HostedOn.DeploymentMapping"
          }
        },
        {
          "provides_endpoint": {
            "capability": "cna-modeling.capabilities.Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "cna-modeling.capabilities.Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "cna-modeling.capabilities.Endpoint",
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
            "capability": "cna-modeling.capabilities.DataUsage",
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
            "capability": "cna-modeling.capabilities.DataUsage",
            "node": "cna-modeling.entities.BackingData",
            "relationship": "cna-modeling.relationships.AttachesTo.BackingData",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "external_ingress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "ingress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "egress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "assigned_to_network": {
            "capability": "Linkable",
            "node": "Network",
            "relationship": "LinksTo",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "address_resolution_by": {
            "capability": "cna-modeling.capabilities.AdressResolution",
            "relationship": "cna-modeling.relationships.UseAddressResolution",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "authentication_by": {
            "capability": "cna-modeling.capabilities.Authentication",
            "relationship": "cna-modeling.relationships.DelegateAuthentication",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "derived_from": "cna-modeling.entities.Component",
      "capabilities": {
        "address_resolution": {
          "type": "cna-modeling.capabilities.AdressResolution",
          "valid_source_node_types": [
            "cna-modeling.entities.Component",
            "cna-modeling.entities.Service",
            "cna-modeling.entities.BackingService",
            "cna-modeling.entities.StorageBackingService",
            "cna-modeling.entities.ProxyBackingService",
            "cna-modeling.entities.BrokerBackingService"
          ]
        },
        "authentication": {
          "type": "cna-modeling.capabilities.Authentication",
          "valid_source_node_types": [
            "cna-modeling.entities.Component",
            "cna-modeling.entities.Service",
            "cna-modeling.entities.BackingService",
            "cna-modeling.entities.StorageBackingService",
            "cna-modeling.entities.ProxyBackingService",
            "cna-modeling.entities.BrokerBackingService"
          ]
        }
      }
    },
    "cna-modeling.entities.ProxyBackingService": {
      "description": "Node Type to model Proxy Backing Service entities, typically Load Balancers, API Gateways or other intermediate Services",
      "properties": {
        "managed": {
          "type": "boolean",
          "description": "A component is managed if it is exclusively operated by someone else, e.g. a cloud provider and the source code of the component instance is inaccessible. If the source code of a component can be changed by yourself, the component is not managed.",
          "required": true
        },
        "software_type": {
          "type": "string",
          "description": "The type of the software in the sense of who developed it. If it is a self-written component use \"custom\", if it is an existing open-source solution which is not customized (apart from configuration) use \"open-source\". If it is licensed proprietary software, use \"proprietary\".",
          "default": "custom",
          "required": true,
          "validation": {
            "$valid_values": [
              "$value",
              [
                "custom",
                "open-source",
                "proprietary"
              ]
            ]
          }
        },
        "stateless": {
          "type": "boolean",
          "description": "True if this component is stateless, that means it requires no disk storage space where data is persisted between executions. That means it can store data to disk, but should not rely on this data to be available for following executions. Instead it should be able to restore required data after a restart in a different environment.",
          "default": true,
          "required": true
        },
        "load_shedding": {
          "type": "boolean",
          "description": "Whether or not this component applies load shedding. That means whether the component rejects incoming load based on certain thresholds (resource usage, concurrent requests).",
          "required": true,
          "default": false
        },
        "account": {
          "type": "string",
          "description": "The identifier of the account with which this component is executed.",
          "default": "default-account",
          "required": true
        },
        "kind": {
          "type": "string",
          "description": "The kind of proxy this is.",
          "required": true,
          "validation": {
            "$valid_values": [
              "$value",
              [
                "API Gateway",
                "Load Balancer",
                "Service Mesh",
                "other"
              ]
            ]
          },
          "default": "other"
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "cna-modeling.capabilities.Host",
            "node": "cna-modeling.entities.Infrastructure",
            "relationship": "cna-modeling.entities.HostedOn.DeploymentMapping"
          }
        },
        {
          "provides_endpoint": {
            "capability": "cna-modeling.capabilities.Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "cna-modeling.capabilities.Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "cna-modeling.capabilities.Endpoint",
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
            "capability": "cna-modeling.capabilities.DataUsage",
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
            "capability": "cna-modeling.capabilities.DataUsage",
            "node": "cna-modeling.entities.BackingData",
            "relationship": "cna-modeling.relationships.AttachesTo.BackingData",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "external_ingress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "ingress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "egress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "assigned_to_network": {
            "capability": "Linkable",
            "node": "Network",
            "relationship": "LinksTo",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "address_resolution_by": {
            "capability": "cna-modeling.capabilities.AdressResolution",
            "relationship": "cna-modeling.relationships.UseAddressResolution",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "authentication_by": {
            "capability": "cna-modeling.capabilities.Authentication",
            "relationship": "cna-modeling.relationships.DelegateAuthentication",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "derived_from": "cna-modeling.entities.Component",
      "capabilities": {
        "proxy": {
          "type": "cna-modeling.capabilities.Proxy",
          "valid_source_node_types": [
            "cna-modeling.entities.Component",
            "cna-modeling.entities.Service",
            "cna-modeling.entities.BackingService",
            "cna-modeling.entities.StorageBackingService",
            "cna-modeling.entities.ProxyBackingService",
            "cna-modeling.entities.BrokerBackingService"
          ]
        }
      }
    },
    "cna-modeling.entities.BrokerBackingService": {
      "description": "Node Type to model Broker Backing Service entities, typically Message Brokers or Event Stores",
      "properties": {
        "managed": {
          "type": "boolean",
          "description": "A component is managed if it is exclusively operated by someone else, e.g. a cloud provider and the source code of the component instance is inaccessible. If the source code of a component can be changed by yourself, the component is not managed.",
          "required": true
        },
        "software_type": {
          "type": "string",
          "description": "The type of the software in the sense of who developed it. If it is a self-written component use \"custom\", if it is an existing open-source solution which is not customized (apart from configuration) use \"open-source\". If it is licensed proprietary software, use \"proprietary\".",
          "default": "custom",
          "required": true,
          "validation": {
            "$valid_values": [
              "$value",
              [
                "custom",
                "open-source",
                "proprietary"
              ]
            ]
          }
        },
        "stateless": {
          "type": "boolean",
          "description": "True if this component is stateless, that means it requires no disk storage space where data is persisted between executions. That means it can store data to disk, but should not rely on this data to be available for following executions. Instead it should be able to restore required data after a restart in a different environment.",
          "default": true,
          "required": true
        },
        "load_shedding": {
          "type": "boolean",
          "description": "Whether or not this component applies load shedding. That means whether the component rejects incoming load based on certain thresholds (resource usage, concurrent requests).",
          "required": true,
          "default": false
        },
        "account": {
          "type": "string",
          "description": "The identifier of the account with which this component is executed.",
          "default": "default-account",
          "required": true
        },
        "kind": {
          "type": "string",
          "description": "The kind of broker based on how messages are persisted and delivered. Queue is the classical message broker where messages are stored in a queue, delivered to one consumer and deleted afterwards. Topic enables a delivery of one message to several different consumers, but messages are also deleted. Log enables the Event sourcing pattern, since messages/events are persistently stored and can be retrieved at any time.",
          "required": true,
          "validation": {
            "$valid_values": [
              "$value",
              [
                "queue",
                "topic",
                "log"
              ]
            ]
          },
          "default": "queue"
        },
        "replication_strategy": {
          "type": "string",
          "description": "The strategy used to replicate data, if multiple replicas of this broker backing service are deployed.",
          "required": true,
          "default": "none",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "none",
                "read-only-replication",
                "active-active-replication"
              ]
            ]
          }
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "cna-modeling.capabilities.Host",
            "node": "cna-modeling.entities.Infrastructure",
            "relationship": "cna-modeling.entities.HostedOn.DeploymentMapping"
          }
        },
        {
          "provides_endpoint": {
            "capability": "cna-modeling.capabilities.Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "cna-modeling.capabilities.Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "cna-modeling.capabilities.Endpoint",
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
            "capability": "cna-modeling.capabilities.DataUsage",
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
            "capability": "cna-modeling.capabilities.DataUsage",
            "node": "cna-modeling.entities.BackingData",
            "relationship": "cna-modeling.relationships.AttachesTo.BackingData",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "external_ingress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "ingress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "egress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "assigned_to_network": {
            "capability": "Linkable",
            "node": "Network",
            "relationship": "LinksTo",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "address_resolution_by": {
            "capability": "cna-modeling.capabilities.AdressResolution",
            "relationship": "cna-modeling.relationships.UseAddressResolution",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "authentication_by": {
            "capability": "cna-modeling.capabilities.Authentication",
            "relationship": "cna-modeling.relationships.DelegateAuthentication",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "derived_from": "cna-modeling.entities.Component"
    },
    "cna-modeling.entities.StorageBackingService": {
      "description": "Node Type to model Storage Backing Service entities, typically databases",
      "properties": {
        "managed": {
          "type": "boolean",
          "description": "A component is managed if it is exclusively operated by someone else, e.g. a cloud provider and the source code of the component instance is inaccessible. If the source code of a component can be changed by yourself, the component is not managed.",
          "required": true
        },
        "software_type": {
          "type": "string",
          "description": "The type of the software in the sense of who developed it. If it is a self-written component use \"custom\", if it is an existing open-source solution which is not customized (apart from configuration) use \"open-source\". If it is licensed proprietary software, use \"proprietary\".",
          "default": "custom",
          "required": true,
          "validation": {
            "$valid_values": [
              "$value",
              [
                "custom",
                "open-source",
                "proprietary"
              ]
            ]
          }
        },
        "stateless": {
          "type": "boolean",
          "description": "Storage Backing Service are per default stateful (not stateless)",
          "default": false,
          "required": true
        },
        "load_shedding": {
          "type": "boolean",
          "description": "Whether or not this component applies load shedding. That means whether the component rejects incoming load based on certain thresholds (resource usage, concurrent requests).",
          "required": true,
          "default": false
        },
        "account": {
          "type": "string",
          "description": "The identifier of the account with which this component is executed.",
          "default": "default-account",
          "required": true
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
        },
        "replication_strategy": {
          "type": "string",
          "description": "The strategy used to replicate data, if multiple replicas of this storage backing service are deployed.",
          "required": true,
          "default": "none",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "none",
                "read-only-replication",
                "active-active-replication"
              ]
            ]
          }
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "cna-modeling.capabilities.Host",
            "node": "cna-modeling.entities.Infrastructure",
            "relationship": "cna-modeling.entities.HostedOn.DeploymentMapping"
          }
        },
        {
          "provides_endpoint": {
            "capability": "cna-modeling.capabilities.Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "cna-modeling.capabilities.Endpoint",
            "relationship": "cna-modeling.relationships.Provides.Endpoint",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "cna-modeling.capabilities.Endpoint",
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
            "capability": "cna-modeling.capabilities.DataUsage",
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
            "capability": "cna-modeling.capabilities.DataUsage",
            "node": "cna-modeling.entities.BackingData",
            "relationship": "cna-modeling.relationships.AttachesTo.BackingData",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "external_ingress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "ingress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "egress_proxied_by": {
            "capability": "cna-modeling.capabilities.Proxy",
            "node": "cna-modeling.entities.ProxyBackingService",
            "relationship": "cna-modeling.relationships.ProxiedBy.ProxyBackingService",
            "count_range": [
              0,
              1
            ]
          }
        },
        {
          "assigned_to_network": {
            "capability": "Linkable",
            "node": "Network",
            "relationship": "LinksTo",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "address_resolution_by": {
            "capability": "cna-modeling.capabilities.AdressResolution",
            "relationship": "cna-modeling.relationships.UseAddressResolution",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "authentication_by": {
            "capability": "cna-modeling.capabilities.Authentication",
            "relationship": "cna-modeling.relationships.DelegateAuthentication",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "derived_from": "cna-modeling.entities.Component"
    },
    "cna-modeling.entities.Infrastructure": {
      "description": "Node Type to model Infrastructure entities",
      "properties": {
        "kind": {
          "type": "string",
          "description": "The kind of infrastructure. Possible kinds are \"physical hardware\", \"virtual hardware\", \"software platform\", or \"cloud service\".",
          "required": true,
          "validation": {
            "$valid_values": [
              "$value",
              [
                "physical-hardware",
                "virtual-hardware",
                "software-platform",
                "cloud-service"
              ]
            ]
          },
          "default": "virtual-hardware"
        },
        "environment_access": {
          "type": "string",
          "description": "Describes the extend of available access to the environment in which the infrastructure is operated. With full access, one can control all aspects of the infrastructure. Limited access means that infrastructure is under control of a provider and only certain things are allowed, such as configuration. With no access infrastructure is completely managed by a cloud provider.",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "full",
                "limited",
                "none"
              ]
            ]
          },
          "default": "full"
        },
        "maintenance": {
          "type": "string",
          "description": "How infrastructure is maintained, that means for example how updates are installed or how certificates are regenerated.",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "manual",
                "automated",
                "transparent"
              ]
            ]
          },
          "default": "manual"
        },
        "provisioning": {
          "type": "string",
          "description": "How infrastructure is initially provisioned. This can be done manually (for example through the web interface of a cloud provider), automatically coded (for example through an IaC tool), automatically inferred, if it is inferred based on deployed components, or transparent, if it is not explicitly provisioned by a consumer, but done on-demand by a provider.",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "manual",
                "automated-coded",
                "automated-inferred",
                "transparent"
              ]
            ]
          },
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
          "validation": {
            "$valid_values": [
              "$value",
              [
                "none",
                "manual",
                "automated-built-in",
                "automated-separate"
              ]
            ]
          },
          "default": "none"
        },
        "self_scaling": {
          "type": "string",
          "required": true,
          "description": "Whether and how this entity scales itself, either horizontally or vertically.",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "none",
                "manual",
                "automated-built-in",
                "automated-separate"
              ]
            ]
          },
          "default": "none"
        },
        "enforced_resource_bounds": {
          "type": "boolean",
          "required": true,
          "description": "Set to true if the infrastructure enforces resource bounds on deployed components, for example regarding cpu shares or memory size. Deployed entities can then only use resources up to a certain bound. Otherwise entities can use resources as available.",
          "default": false
        },
        "account": {
          "type": "string",
          "description": "The identifier of the account with which this component is executed.",
          "default": "default-account",
          "required": true
        }
      },
      "capabilities": {
        "host": {
          "type": "cna-modeling.capabilities.Host",
          "valid_source_node_types": [
            "cna-modeling.entities.Component",
            "cna-modeling.entities.Service",
            "cna-modeling.entities.BackingService",
            "cna-modeling.entities.StorageBackingService",
            "cna-modeling.entities.ProxyBackingService",
            "cna-modeling.entities.BrokerBackingService",
            "cna-modeling.entities.Infrastructure"
          ]
        },
        "address_resolution": {
          "type": "cna-modeling.capabilities.AdressResolution",
          "valid_source_node_types": [
            "cna-modeling.entities.Component",
            "cna-modeling.entities.Service",
            "cna-modeling.entities.BackingService",
            "cna-modeling.entities.StorageBackingService",
            "cna-modeling.entities.ProxyBackingService",
            "cna-modeling.entities.BrokerBackingService"
          ]
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "cna-modeling.capabilities.Host",
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
            "capability": "cna-modeling.capabilities.DataUsage",
            "node": "cna-modeling.entities.BackingData",
            "relationship": "cna-modeling.relationships.AttachesTo.BackingData",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "assigned_to_network": {
            "capability": "cna-modeling.capabilities.Linkable",
            "node": "cna-modeling.entities.Network",
            "relationship": "cna-modeling.relationships.LinksTo",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ]
    },
    "cna-modeling.entities.Endpoint": {
      "description": "Endpoint type to explicitly model endpoints as entities",
      "properties": {
        "kind": {
          "type": "string",
          "required": true,
          "description": "The kind of endpoint which can be either \"query\", \"command\", or \"event\". A \"query\" is a synchronous request for data which the client needs for further processing. A \"command\" is a synchronous send of data for which the client needs a corresponding answer for further processing. An \"event\" is an asynchronous send of data for which the client does not expect data to be returned for further processing.",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "query",
                "command",
                "send event",
                "subscribe"
              ]
            ]
          },
          "default": "query"
        },
        "method_name": {
          "type": "string",
          "required": false,
          "description": "An optional name of the method/action used. For REST APIs it can for example be specified whether it is a GET or POST method. For message brokers it can be specified whether it is a publish or subscribe action."
        },
        "protocol": {
          "description": "The name of the (Layer 4 through 7) protocol that the endpoint accepts.",
          "type": "string",
          "default": "tcp"
        },
        "port": {
          "description": "The optional port of the endpoint.",
          "type": "string",
          "required": false
        },
        "secure": {
          "description": "If set, the endpoint accepts only secure connections.",
          "type": "boolean",
          "required": false,
          "default": false
        },
        "allow_access_to": {
          "description": "A list of entities/accounts who are allowed to access this endpoint. If the list is empty anybody can access the endpoint ",
          "type": "list",
          "required": true,
          "entry_schema": {
            "description": "The id of an account that can access this endpoint.",
            "type": "string"
          }
        },
        "url_path": {
          "description": "The optional URL path of the endpoint's address if applicable for the protocol.",
          "type": "string",
          "required": false
        },
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
      },
      "capabilities": {
        "endpoint": {
          "type": "cna-modeling.capabilities.Endpoint",
          "count_range": [
            1,
            1
          ]
        }
      },
      "requirements": [
        {
          "uses_data": {
            "capability": "cna-modeling.capabilities.DataUsage",
            "node": "cna-modeling.entities.DataAggregate",
            "relationship": "cna-modeling.relationships.AttachesTo.DataAggregate",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ]
    },
    "cna-modeling.entities.Endpoint.External": {
      "description": "Endpoint type to explicitly model external endpoints as entities",
      "properties": {
        "kind": {
          "type": "string",
          "required": true,
          "description": "The kind of endpoint which can be either \"query\", \"command\", or \"event\". A \"query\" is a synchronous request for data which the client needs for further processing. A \"command\" is a synchronous send of data for which the client needs a corresponding answer for further processing. An \"event\" is an asynchronous send of data for which the client does not expect data to be returned for further processing.",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "query",
                "command",
                "send event",
                "subscribe"
              ]
            ]
          },
          "default": "query"
        },
        "method_name": {
          "type": "string",
          "required": false,
          "description": "An optional name of the method/action used. For REST APIs it can for example be specified whether it is a GET or POST method. For message brokers it can be specified whether it is a publish or subscribe action."
        },
        "protocol": {
          "description": "The name of the (Layer 4 through 7) protocol that the endpoint accepts.",
          "type": "string",
          "default": "tcp"
        },
        "port": {
          "description": "The optional port of the endpoint.",
          "type": "string",
          "required": false
        },
        "secure": {
          "description": "If set, the endpoint accepts only secure connections.",
          "type": "boolean",
          "required": false,
          "default": false
        },
        "allow_access_to": {
          "description": "A list of entities/accounts who are allowed to access this endpoint. If the list is empty anybody can access the endpoint ",
          "type": "list",
          "required": true,
          "entry_schema": {
            "description": "The id of an account that can access this endpoint.",
            "type": "string"
          }
        },
        "url_path": {
          "description": "The optional URL path of the endpoint's address if applicable for the protocol.",
          "type": "string",
          "required": false
        },
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
      },
      "capabilities": {
        "endpoint": {
          "type": "cna-modeling.capabilities.Endpoint",
          "count_range": [
            1,
            1
          ]
        },
        "external_endpoint": {
          "type": "cna-modeling.capabilities.Endpoint",
          "count_range": [
            1,
            1
          ]
        }
      },
      "requirements": [
        {
          "uses_data": {
            "capability": "cna-modeling.capabilities.DataUsage",
            "node": "cna-modeling.entities.DataAggregate",
            "relationship": "cna-modeling.relationships.AttachesTo.DataAggregate",
            "count_range": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "derived_from": "cna-modeling.entities.Endpoint"
    },
    "cna-modeling.entities.BackingData": {
      "description": "Node Type to model Backing Data entities",
      "properties": {
        "kind": {
          "type": "string",
          "required": true,
          "description": "The kind of backing data, meaning what kind of data this refers to",
          "validation": {
            "$valid_values": [
              "$value",
              [
                "config",
                "secret",
                "logs",
                "metrics"
              ]
            ]
          },
          "default": "config"
        },
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
      },
      "capabilities": {
        "provides_data": {
          "type": "cna-modeling.capabilities.DataUsage",
          "valid_source_node_types": [
            "cna-modeling.entities.Component",
            "cna-modeling.entities.Service",
            "cna-modeling.entities.BackingService",
            "cna-modeling.entities.StorageBackingService",
            "cna-modeling.entities.ProxyBackingService",
            "cna-modeling.entities.BrokerBackingService",
            "cna-modeling.entities.Infrastructure"
          ]
        }
      }
    },
    "cna-modeling.entities.DataAggregate": {
      "description": "Node Type to model Data Aggregate entities",
      "capabilities": {
        "provides_data": {
          "type": "cna-modeling.capabilities.DataUsage",
          "valid_source_node_types": [
            "cna-modeling.entities.Component",
            "cna-modeling.entities.Service",
            "cna-modeling.entities.BackingService",
            "cna-modeling.entities.StorageBackingService",
            "cna-modeling.entities.BrokerBackingService",
            "cna-modeling.entities.Endpoint"
          ]
        }
      }
    },
    "cna-modeling.entities.RequestTrace": {
      "description": "Node Type to model Request Trace entities",
      "properties": {
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
      },
      "requirements": [
        {
          "external_endpoint": {
            "capability": "cna-modeling.capabilities.Endpoint",
            "relationship": "cna-modeling.relationships.PartOf",
            "count_range": [
              1,
              1
            ]
          }
        }
      ]
    },
    "cna-modeling.entities.Network": {
      "description": "Node Type to model a (virtual) network (e.g. a subnet)\n",
      "attributes": {
        "state": {
          "type": "string"
        }
      },
      "capabilities": {
        "feature": {
          "type": "Node"
        },
        "link": {
          "type": "cna-modeling.capabilities.Linkable"
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
        "ip_version": {
          "description": "The IP version of the requested  Valid values are 4 for ipv4 or 6 for ipv6.\n",
          "type": "integer",
          "required": false,
          "default": 4
        },
        "cidr": {
          "description": "The cidr block of the requested\n",
          "type": "string",
          "required": false
        },
        "start_ip": {
          "description": "The IP address to be used as the start of a pool of addresses within the full IP range derived from the cidr block.\n",
          "type": "string",
          "required": false
        },
        "end_ip": {
          "description": "The IP address to be used as the end of a pool of addresses within the full IP range derived from the cidr block.\n",
          "type": "string",
          "required": false
        },
        "gateway_ip": {
          "description": "The gateway IP address.\n",
          "type": "string",
          "required": false
        },
        "network_type": {
          "description": "Specifies the nature of the network in the underlying cloud infrastructure.\n",
          "type": "string",
          "required": false
        }
      }
    }
  },
  "group_types": {},
  "policy_types": {}
};