/* 
   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions 
*/

import { TOSCA_Service_Template } from '../../tosca-types/v1dot3-types/template-types.js';

export const tosca_simple_profile_for_yaml_v1_3: TOSCA_Service_Template = {
  "tosca_definitions_version": "tosca_simple_yaml_1_3",
  "namespace": "http://docs.oasis-open.org/tosca/ns/simple/yaml/1.3",
  "metadata": {
    "template_name": "tosca-normative-types",
    "template_author": "TOSCA TC",
    "template_version": "1.3.0"
  },
  "description": "This TOSCA definitions document contains the TOSCA Simple Profile types as defined in the TOSCA Simple Profile for YAML v1.3 specification.",
  "dsl_definitions": "",
  "repositories": {},
  "artifact_types": {
    "tosca.artifacts.Root": {
      "description": "The TOSCA Artifact Type all other TOSCA Artifact Types derive from"
    },
    "tosca.artifacts.File": {
      "derived_from": "tosca.artifacts.Root",
      "description": "This artifact type is used when an artifact definition needs to have its associated file simply treated as a file and no special handling/handlers are invoked.\n"
    },
    "tosca.artifacts.Deployment": {
      "derived_from": "tosca.artifacts.Root",
      "description": "TOSCA base type for deployment artifacts"
    },
    "tosca.artifacts.Deployment.Image": {
      "derived_from": "tosca.artifacts.Deployment",
      "description": "This artifact type represents a parent type for any “image” which is an opaque packaging of a TOSCA Node’s deployment (whether real or virtual) whose contents are typically already installed and pre-configured (i.e., “stateful”) and prepared to be run on a known target container.\n"
    },
    "tosca.artifacts.Deployment.Image.VM": {
      "derived_from": "tosca.artifacts.Deployment.Image",
      "description": "This artifact represents the parent type for all Virtual Machine (VM) image and container formatted deployment artifacts.  These images contain a stateful capture of a machine (e.g., server) including operating system and installed software along with any configurations and can be run on another machine using a hypervisor which virtualizes typical server (i.e., hardware) resources.  Virtual Machine (VM) Image\n"
    },
    "tosca.artifacts.Implementation": {
      "derived_from": "tosca.artifacts.Root",
      "description": "TOSCA base type for implementation artifacts"
    },
    "tosca.artifacts.Implementation.Bash": {
      "derived_from": "tosca.artifacts.Implementation",
      "description": "Script artifact for the Unix Bash shell",
      "mime_type": "application/x-sh",
      "file_ext": [
        "sh"
      ]
    },
    "tosca.artifacts.Implementation.Python": {
      "derived_from": "tosca.artifacts.Implementation",
      "description": "Artifact for the interpreted Python language",
      "mime_type": "application/x-python",
      "file_ext": [
        "py"
      ]
    },
    "tosca.artifacts.template": {
      "derived_from": "tosca.artifacts.Root",
      "description": "TOSCA base type for template artifacts"
    }
  },
  "data_types": {
    "tosca.datatypes.Root": {
      "description": "The TOSCA root Data Type all other TOSCA base Data Types derive from."
    },
    "tosca.datatypes.json": {
      "derived_from": "string",
      "description": "The json type defines a string that containst data in the JavaScript Object Notation (JSON) format."
    },
    "tosca.datatypes.xml": {
      "derived_from": "string",
      "description": "The xml type defines a string that containst data in the Extensible Markup Language (XML) format."
    },
    "tosca.datatypes.Credential": {
      "derived_from": "tosca.datatypes.Root",
      "description": "The Credential type is a complex TOSCA data Type used when describing authorization credentials used to access network accessible resources.",
      "properties": {
        "protocol": {
          "type": "string",
          "description": "The optional protocol name.",
          "required": false
        },
        "token_type": {
          "type": "string",
          "description": "The required token type.",
          "default": "password"
        },
        "token": {
          "type": "string",
          "description": "The required token used as a credential for authorization or access to a networked resource."
        },
        "keys": {
          "type": "map",
          "description": "The optional list of protocol-specific keys or assertions.",
          "required": false,
          "entry_schema": {
            "type": "string"
          }
        },
        "user": {
          "type": "string",
          "description": "The optional user (name or ID) used for non-token based credentials.",
          "required": false
        }
      }
    },
    "tosca.datatypes.TimeInterval": {
      "derived_from": "tosca.datatypes.Root",
      "description": "The TimeInterval type describes a period of time using the YAML ISO 8601 format to declare the start and end times.",
      "properties": {
        "start_time": {
          "type": "timestamp",
          "description": "The inclusive start time for the time interval.",
          "required": true
        },
        "end_time": {
          "type": "timestamp",
          "description": "The inclusive end time for the time interval.",
          "required": true
        }
      }
    },
    "tosca.datatypes.network.NetworkInfo": {
      "derived_from": "tosca.datatypes.Root",
      "description": "The Network type describes logical network information.",
      "properties": {
        "network_name": {
          "type": "string",
          "description": "The name of the logical network. e.g., “public”, “private”, “admin”. etc."
        },
        "network_id": {
          "type": "string",
          "description": "The unique ID of for the network generated by the network provider."
        },
        "addresses": {
          "type": "list",
          "description": "The list of IP addresses assigned from the underlying network.",
          "entry_schema": {
            "type": "string"
          }
        }
      }
    },
    "tosca.datatypes.network.PortInfo": {
      "derived_from": "tosca.datatypes.Root",
      "description": "The PortInfo type describes network port information.",
      "properties": {
        "port_name": {
          "type": "string",
          "description": "The logical network port name."
        },
        "port_id": {
          "type": "string",
          "description": "The unique ID for the network port generated by the network provider."
        },
        "network_id": {
          "type": "string",
          "description": "The unique ID for the network."
        },
        "mac_address": {
          "type": "string",
          "description": "The unique media access control address (MAC address) assigned to the port."
        },
        "addresses": {
          "type": "list",
          "description": "The list of IP address(es) assigned to the port.",
          "entry_schema": {
            "type": "string"
          }
        }
      }
    },
    "tosca.datatypes.network.PortDef": {
      "derived_from": "integer",
      "description": "The PortDef type defines a network port.",
      "constraints": [
        {
          "in_range": [
            1,
            65535
          ]
        }
      ]
    },
    "tosca.datatypes.network.PortSpec": {
      "derived_from": "tosca.datatypes.Root",
      "description": "The PortSpec type describes port specifications for a network connection.",
      "properties": {
        "protocol": {
          "type": "string",
          "description": "The required protocol used on the port.",
          "required": true,
          "default": "tcp",
          "constraints": [
            {
              "valid_values": [
                "udp",
                "tcp",
                "igmp"
              ]
            }
          ]
        },
        "source": {
          "type": "tosca.datatypes.network.PortDef",
          "description": "The optional source port.",
          "required": false
        },
        "source_range": {
          "type": "range",
          "description": "The optional range for the source port.",
          "required": false,
          "constraints": [
            {
              "in_range": [
                1,
                65535
              ]
            }
          ]
        },
        "target": {
          "type": "tosca.datatypes.network.PortDef",
          "description": "The optional target port.",
          "required": false
        },
        "target_range": {
          "type": "range",
          "description": "The optional range for the target port.",
          "required": false,
          "constraints": [
            {
              "in_range": [
                1,
                65535
              ]
            }
          ]
        }
      }
    }
  },
  "capability_types": {
    "tosca.capabilities.Root": {
      "description": "This is the default (root) TOSCA Capability Type definition that all other TOSCA Capability Types derive from."
    },
    "tosca.capabilities.Node": {
      "derived_from": "tosca.capabilities.Root",
      "description": "The Node capability indicates the base capabilities of a TOSCA Node Type."
    },
    "tosca.capabilities.Container": {
      "derived_from": "tosca.capabilities.Root",
      "description": "The Container capability, when included on a Node Type or Template definition, indicates that the node can act as a container for (or a host for) one or more other declared Node Types."
    },
    "tosca.capabilities.Compute": {
      "derived_from": "tosca.capabilities.Container",
      "description": "The Compute capability, when included on a Node Type or Template definition, indicates that the node can provide hosting on a named compute resource.\n",
      "properties": {
        "name": {
          "type": "string",
          "description": "The otional name (or identifier) of a specific compute resource for hosting.",
          "required": false
        },
        "num_cpus": {
          "type": "integer",
          "description": "Number of (actual or virtual) CPUs associated with the Compute node.",
          "required": false,
          "constraints": [
            {
              "greater_or_equal": 1
            }
          ]
        },
        "cpu_frequency": {
          "type": "scalar-unit.frequency",
          "description": "Specifies the operating frequency of CPU's core.  This property expresses the expected frequency of one (1) CPU as provided by the property “num_cpus”.\n",
          "required": false,
          "constraints": [
            {
              "greater_or_equal": "0.1 GHz"
            }
          ]
        },
        "disk_size": {
          "type": "scalar-unit.size",
          "description": "Size of the local disk available to applications running on the Compute node (default unit is MB).",
          "required": false,
          "constraints": [
            {
              "greater_or_equal": "0 MB"
            }
          ]
        },
        "mem_size": {
          "type": "scalar-unit.size",
          "description": "Size of memory available to applications running on the Compute node (default unit is MB).",
          "required": false,
          "constraints": [
            {
              "greater_or_equal": "0 MB"
            }
          ]
        }
      }
    },
    "tosca.capabilities.Network": {
      "derived_from": "tosca.capabilities.Root",
      "description": "The Network capability, when included on a Node Type or Template definition, indicates that the node can provide addressiblity for the resource on a named network with the specified ports.",
      "properties": {
        "name": {
          "type": "string",
          "description": "The otional name (or identifier) of a specific network resource.",
          "required": false
        }
      }
    },
    "tosca.capabilities.Storage": {
      "derived_from": "tosca.capabilities.Root",
      "description": "The Storage capability, when included on a Node Type or Template definition, indicates that the node can provide a named storage location with specified size range.",
      "properties": {
        "name": {
          "type": "string",
          "description": "The otional name (or identifier) of a specific storage resource.",
          "required": false
        }
      }
    },
    "tosca.capabilities.Endpoint": {
      "derived_from": "tosca.capabilities.Root",
      "description": "This is the default TOSCA type that should be used or extended to define a network endpoint capability.  This includes the information to express a basic endpoint with a single port or a complex endpoint with multiple ports.  By default the Endpoint is assumed to represent an address on a private network unless otherwise specified.\n",
      "properties": {
        "protocol": {
          "type": "string",
          "description": "The name of the protocol (i.e., the protocol prefix) that the endpoint accepts (any OSI Layer 4-7 protocols) Examples: http, https, ftp, tcp, udp, etc.\n",
          "default": "tcp"
        },
        "port": {
          "type": "tosca.datatypes.network.PortDef",
          "description": "The optional port of the endpoint.",
          "required": false
        },
        "secure": {
          "type": "boolean",
          "description": "Requests for the endpoint to be secure and use credentials supplied on the ConnectsTo relationship.",
          "required": false,
          "default": false
        },
        "url_path": {
          "type": "string",
          "description": "The optional URL path of the endpoint’s address if applicable for the protocol.",
          "required": false
        },
        "port_name": {
          "type": "string",
          "description": "The optional name (or ID) of the network port this endpoint should be bound to.",
          "required": false
        },
        "network_name": {
          "type": "string",
          "description": "The optional name (or ID) of the network this endpoint should be bound to.  network_name: PRIVATE | PUBLIC |<network_name> | <network_id>\n",
          "required": false,
          "default": "PRIVATE"
        },
        "initiator": {
          "type": "string",
          "description": "The optional indicator of the direction of the connection.",
          "required": false,
          "default": "source",
          "constraints": [
            {
              "valid_values": [
                "source",
                "target",
                "peer"
              ]
            }
          ]
        },
        "ports": {
          "type": "map",
          "description": "The optional map of ports the Endpoint supports (if more than one).",
          "required": false,
          "constraints": [
            {
              "min_length": 1
            }
          ],
          "entry_schema": {
            "type": "tosca.datatypes.network.PortSpec"
          }
        }
      },
      "attributes": {
        "ip_address": {
          "type": "string",
          "description": "This is the IP address as propagated up by the associated node’s host (Compute) container."
        }
      }
    },
    "tosca.capabilities.Endpoint.Public": {
      "derived_from": "tosca.capabilities.Endpoint",
      "description": "This capability represents a public endpoint which is accessible to the general internet (and its public IP address ranges). This public endpoint capability also can be used to create a floating (IP) address that the underlying network assigns from a pool allocated from the application’s underlying public network. This floating address is managed by the underlying network such that can be routed an application’s private address and remains reliable to internet clients.\n",
      "properties": {
        "network_name": {
          "type": "string",
          "default": "PUBLIC",
          "constraints": [
            {
              "equal": "PUBLIC"
            }
          ]
        },
        "floating": {
          "description": "Indicates that the public address should be allocated from a pool of floating IPs that are associated with the network.\n",
          "type": "boolean",
          "default": false,
          "status": "experimental"
        },
        "dns_name": {
          "description": "The optional name to register with DNS",
          "type": "string",
          "required": false,
          "status": "experimental"
        }
      }
    },
    "tosca.capabilities.Endpoint.Admin": {
      "derived_from": "tosca.capabilities.Endpoint",
      "description": "This is the default TOSCA type that should be used or extended to define a specialized administrator endpoint capability.",
      "properties": {
        "secure": {
          "type": "boolean",
          "default": true,
          "constraints": [
            {
              "equal": true
            }
          ]
        }
      }
    },
    "tosca.capabilities.Endpoint.Database": {
      "derived_from": "tosca.capabilities.Endpoint",
      "description": "This is the default TOSCA type that should be used or extended to define a specialized database endpoint capability."
    },
    "tosca.capabilities.Attachment": {
      "derived_from": "tosca.capabilities.Root",
      "description": "This is the default TOSCA type that should be used or extended to define an attachment capability of a (logical) infrastructure device node (e.g., BlockStorage node).\n"
    },
    "tosca.capabilities.OperatingSystem": {
      "derived_from": "tosca.capabilities.Root",
      "description": "This is the default TOSCA type that should be used to express an Operating System capability for a node.",
      "properties": {
        "architecture": {
          "type": "string",
          "description": "The Operating System (OS) architecture.  Examples of valid values include: x86_32, x86_64, etc.\n",
          "required": false
        },
        "type": {
          "type": "string",
          "description": "The Operating System (OS) type.  Examples of valid values include: linux, aix, mac, windows, etc.\n",
          "required": false
        },
        "distribution": {
          "type": "string",
          "description": "The Operating System (OS) distribution.  Examples of valid values for an “type” of “Linux” would include: debian, fedora, rhel and ubuntu.\n",
          "required": false
        },
        "version": {
          "type": "version",
          "description": "The Operating System version.\n",
          "required": false
        }
      }
    },
    "tosca.capabilities.Scalable": {
      "derived_from": "tosca.capabilities.Root",
      "description": "This is the default TOSCA type that should be used to express a scalability capability for a node.",
      "properties": {
        "min_instances": {
          "type": "integer",
          "description": "This property is used to indicate the minimum number of instances that should be created for the associated TOSCA Node Template by a TOSCA orchestrator.\n",
          "default": 1
        },
        "max_instances": {
          "type": "integer",
          "description": "This property is used to indicate the maximum number of instances that should be created for the associated TOSCA Node Template by a TOSCA orchestrator.\n",
          "default": 1
        },
        "default_instances": {
          "type": "integer",
          "required": false,
          "description": "An optional property that indicates the requested default number of instances that should be the starting number of instances a TOSCA orchestrator should attempt to allocate. Note: The value for this property MUST be in the range between the values set for ‘min_instances’ and ‘max_instances’ properties.\n",
          "default": 1
        }
      }
    },
    "tosca.capabilities.network.Bindable": {
      "derived_from": "tosca.capabilities.Node",
      "description": "A node type that includes the Bindable capability indicates that it can be bound to a logical network association via a network port."
    },
    "tosca.capabilities.network.Linkable": {
      "description": "A node type that includes the Linkable capability indicates that it can be pointed to by a tosca.relationships.network.LinksTo relationship type.",
      "derived_from": "tosca.capabilities.Node"
    }
  },
  "interface_types": {
    "tosca.interfaces.Root": {
      "description": "The TOSCA root Interface Type all other TOSCA base Interface Types derive from."
    },
    "tosca.interfaces.node.lifecycle.Standard": {
      "derived_from": "tosca.interfaces.Root",
      "operations": {
        "create": {
          "description": "Standard lifecycle create operation."
        },
        "configure": {
          "description": "Standard lifecycle configure operation."
        },
        "start": {
          "description": "Standard lifecycle start operation."
        },
        "stop": {
          "description": "Standard lifecycle stop operation."
        },
        "delete": {
          "description": "Standard lifecycle delete operation."
        }
      }
    },
    "tosca.interfaces.relationship.Configure": {
      "derived_from": "tosca.interfaces.Root",
      "operations": {
        "pre_configure_source": {
          "description": "Operation to pre-configure the source endpoint."
        },
        "pre_configure_target": {
          "description": "Operation to pre-configure the target endpoint."
        },
        "post_configure_source": {
          "description": "Operation to post-configure the source endpoint."
        },
        "post_configure_target": {
          "description": "Operation to post-configure the target endpoint."
        },
        "add_target": {
          "description": "Operation to notify the source node of a target node being added via a relationship."
        },
        "add_source": {
          "description": "Operation to notify the target node of a source node which is now available via a relationship."
        },
        "target_changed": {
          "description": "Operation to notify source some property or attribute of the target changed"
        },
        "remove_target": {
          "description": "Operation to remove a target node."
        }
      }
    }
  },
  "relationship_types": {
    "tosca.relationships.Root": {
      "description": "The TOSCA root Relationship Type all other TOSCA base Relationship Types derive from",
      "attributes": {
        "tosca_id": {
          "type": "string",
          "description": "A unique identifier of the realized instance of a Relationship Template that derives from any TOSCA normative type."
        },
        "tosca_name": {
          "type": "string",
          "description": "This attribute reflects the name of the Relationship Template as defined in the TOSCA service template.  This name is not unique to the realized instance model of corresponding deployed application as each template in the model can result in one or more instances (e.g., scaled) when orchestrated to a provider environment.\n"
        },
        "state": {
          "type": "string",
          "description": "The state of the relationship instance.",
          "default": "initial"
        }
      },
      "interfaces": {
        "Configure": {
          "type": "tosca.interfaces.relationship.Configure"
        }
      }
    },
    "tosca.relationships.DependsOn": {
      "derived_from": "tosca.relationships.Root",
      "description": "This type represents a general dependency relationship between two nodes.",
      "valid_target_types": [
        "tosca.capabilities.Node"
      ]
    },
    "tosca.relationships.HostedOn": {
      "derived_from": "tosca.relationships.Root",
      "description": "This type represents a hosting relationship between two nodes.",
      "valid_target_types": [
        "tosca.capabilities.Container"
      ]
    },
    "tosca.relationships.ConnectsTo": {
      "derived_from": "tosca.relationships.Root",
      "description": "This type represents a network connection relationship between two nodes.",
      "valid_target_types": [
        "tosca.capabilities.Endpoint"
      ],
      "properties": {
        "credential": {
          "type": "tosca.datatypes.Credential",
          "description": "The security credential to use to present to the target endpoint to for either authentication or authorization purposes.",
          "required": false
        }
      }
    },
    "tosca.relationships.AttachesTo": {
      "derived_from": "tosca.relationships.Root",
      "valid_target_types": [
        "tosca.capabilities.Attachment"
      ],
      "properties": {
        "location": {
          "type": "string",
          "constraints": [
            {
              "min_length": 1
            }
          ]
        },
        "device": {
          "type": "string",
          "required": false
        }
      }
    },
    "tosca.relationships.RoutesTo": {
      "derived_from": "tosca.relationships.ConnectsTo",
      "description": "This type represents an intentional network routing between two Endpoints in different networks.",
      "valid_target_types": [
        "tosca.capabilities.Endpoint"
      ]
    },
    "tosca.relationships.network.LinksTo": {
      "derived_from": "tosca.relationships.DependsOn",
      "description": "This relationship type represents an association relationship between Port and Network node types.\n",
      "valid_target_types": [
        "tosca.capabilities.network.Linkable"
      ]
    },
    "tosca.relationships.network.BindsTo": {
      "derived_from": "tosca.relationships.DependsOn",
      "description": "This type represents a network association relationship between Port and Compute node types.\n",
      "valid_target_types": [
        "tosca.capabilities.network.Bindable"
      ]
    }
  },
  "node_types": {
    "tosca.nodes.Root": {
      "description": "This is the default (root) TOSCA Node Type that all other TOSCA nodes should extends.  This allows all TOSCA nodes to have a consistent set of features for modeling and management (e.g, consistent definitions for requirements, capabilities, and lifecycle interfaces).\n",
      "attributes": {
        "tosca_id": {
          "type": "string",
          "description": "A unique identifier of the realized instance of a Node Template that derives from any TOSCA normative type."
        },
        "tosca_name": {
          "type": "string",
          "description": "This attribute reflects the name of the Node Template as defined in the TOSCA service template.  This name is not unique to the realized instance model of corresponding deployed application as each template in the model can result in one or more instances (e.g., scaled) when orchestrated to a provider environment.\n"
        },
        "state": {
          "type": "string",
          "description": "The state of the node instance. See section “Node States” for allowed values.",
          "default": "initial"
        }
      },
      "capabilities": {
        "feature": {
          "type": "tosca.capabilities.Node"
        }
      },
      "requirements": [
        {
          "dependency": {
            "capability": "tosca.capabilities.Node",
            "node": "tosca.nodes.Root",
            "relationship": "tosca.relationships.DependsOn",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "interfaces": {
        "Standard": {
          "type": "tosca.interfaces.node.lifecycle.Standard"
        }
      }
    },
    "tosca.nodes.Abstract.Compute": {
      "derived_from": "tosca.nodes.Root",
      "description": "The TOSCA Abstract.Compute node represents an abstract compute resource without any requirements on storage or network resources.",
      "capabilities": {
        "host": {
          "type": "tosca.capabilities.Compute"
        }
      }
    },
    "tosca.nodes.Compute": {
      "derived_from": "tosca.nodes.Abstract.Compute",
      "description": "The TOSCA Compute node represents one or more real or virtual processors of software applications or services along with other essential local resources.  Collectively, the resources the compute node represents can logically be viewed as a (real or virtual) “server”.\n",
      "attributes": {
        "private_address": {
          "type": "string",
          "description": "The primary private IP address assigned by the cloud provider that applications may use to access the Compute node."
        },
        "public_address": {
          "type": "string",
          "description": "The primary public IP address assigned by the cloud provider that applications may use to access the Compute node."
        },
        "networks": {
          "type": "map",
          "entry_schema": {
            "type": "tosca.datatypes.network.NetworkInfo"
          }
        },
        "ports": {
          "type": "map",
          "entry_schema": {
            "type": "tosca.datatypes.network.PortInfo"
          }
        }
      },
      "requirements": [
        {
          "local_storage": {
            "capability": "tosca.capabilities.Attachment",
            "node": "tosca.nodes.Storage.BlockStorage",
            "relationship": "tosca.relationships.AttachesTo",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "capabilities": {
        "host": {
          "type": "tosca.capabilities.Compute",
          "valid_source_types": [
            "tosca.nodes.SoftwareComponent"
          ]
        },
        "os": {
          "type": "tosca.capabilities.OperatingSystem"
        },
        "endpoint": {
          "type": "tosca.capabilities.Endpoint.Admin"
        },
        "scalable": {
          "type": "tosca.capabilities.Scalable"
        },
        "binding": {
          "type": "tosca.capabilities.network.Bindable"
        }
      }
    },
    "tosca.nodes.SoftwareComponent": {
      "derived_from": "tosca.nodes.Root",
      "description": "The TOSCA SoftwareComponent node represents a generic software component that can be managed and run by a TOSCA Compute Node Type.",
      "properties": {
        "component_version": {
          "type": "version",
          "description": "The optional software component’s version.",
          "required": false
        },
        "admin_credential": {
          "type": "tosca.datatypes.Credential",
          "description": "The optional credential that can be used to authenticate to the software component.",
          "required": false
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "tosca.capabilities.Compute",
            "node": "tosca.nodes.Compute",
            "relationship": "tosca.relationships.HostedOn"
          }
        }
      ]
    },
    "tosca.nodes.WebServer": {
      "derived_from": "tosca.nodes.SoftwareComponent",
      "description": "This TOSCA WebServer Node Type represents an abstract software component or service that is capable of hosting and providing management operations for one or more WebApplication nodes.\n",
      "capabilities": {
        "data_endpoint": "tosca.capabilities.Endpoint",
        "admin_endpoint": "tosca.capabilities.Endpoint.Admin",
        "host": {
          "type": "tosca.capabilities.Compute",
          "valid_source_types": [
            "tosca.nodes.WebApplication"
          ]
        }
      }
    },
    "tosca.nodes.WebApplication": {
      "derived_from": "tosca.nodes.Root",
      "description": "The TOSCA WebApplication node represents a software application that can be managed and run by a TOSCA WebServer node.  Specific types of web applications such as Java, etc. could be derived from this type.\n",
      "properties": {
        "context_root": {
          "type": "string",
          "required": false,
          "description": "The web application’s context root which designates the application’s URL path within the web server it is hosted on."
        }
      },
      "capabilities": {
        "app_endpoint": {
          "type": "tosca.capabilities.Endpoint"
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "tosca.capabilities.Compute",
            "node": "tosca.nodes.WebServer",
            "relationship": "tosca.relationships.HostedOn"
          }
        }
      ]
    },
    "tosca.nodes.DBMS": {
      "derived_from": "tosca.nodes.SoftwareComponent",
      "description": "The TOSCA DBMS node represents a typical relational, SQL Database Management System software component or service.",
      "properties": {
        "root_password": {
          "type": "string",
          "required": false,
          "description": "the optional root password for the DBMS service"
        },
        "port": {
          "type": "integer",
          "required": false,
          "description": "the port the DBMS service will listen to for data and requests"
        }
      },
      "capabilities": {
        "host": {
          "type": "tosca.capabilities.Compute",
          "valid_source_types": [
            "tosca.nodes.Database"
          ]
        }
      }
    },
    "tosca.nodes.Database": {
      "derived_from": "tosca.nodes.Root",
      "description": "The TOSCA Database node represents a logical database that can be managed and hosted by a TOSCA DBMS node.",
      "properties": {
        "name": {
          "type": "string",
          "description": "the logical name of the database",
          "required": true
        },
        "port": {
          "type": "integer",
          "description": "the port the underlying database service will listen to for data",
          "required": false
        },
        "user": {
          "type": "string",
          "description": "the optional user account name for DB administration",
          "required": false
        },
        "password": {
          "type": "string",
          "description": "the optional password for the DB user account",
          "required": false
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "tosca.capabilities.Compute",
            "node": "tosca.nodes.DBMS",
            "relationship": "tosca.relationships.HostedOn"
          }
        }
      ],
      "capabilities": {
        "database_endpoint": {
          "type": "tosca.capabilities.Endpoint.Database"
        }
      }
    },
    "tosca.nodes.Abstract.Storage": {
      "derived_from": "tosca.nodes.Root",
      "description": "The TOSCA Abstract.Storage node represents an abstract storage resource without any requirements on compute or network resources.",
      "properties": {
        "name": {
          "type": "string",
          "description": "The logical name (or ID) of the storage resource."
        },
        "size": {
          "type": "scalar-unit.size",
          "description": "The requested initial storage size (default unit is in Gigabytes).",
          "default": "0 MB",
          "constraints": [
            {
              "greater_or_equal": "0 MB"
            }
          ]
        }
      }
    },
    "tosca.nodes.Storage.ObjectStorage": {
      "derived_from": "tosca.nodes.Abstract.Storage",
      "description": "The TOSCA ObjectStorage node represents storage that provides the ability to store data as objects (or BLOBs of data) without consideration for the underlying filesystem or devices.",
      "properties": {
        "maxsize": {
          "type": "scalar-unit.size",
          "description": "The requested maximum storage size (default unit is in Gigabytes).",
          "constraints": [
            {
              "greater_or_equal": "0 GB"
            }
          ],
          "required": false
        }
      },
      "capabilities": {
        "storage_endpoint": {
          "type": "tosca.capabilities.Endpoint"
        }
      }
    },
    "tosca.nodes.Storage.BlockStorage": {
      "derived_from": "tosca.nodes.Abstract.Storage",
      "description": "The TOSCA BlockStorage node currently represents a server-local block storage device (i.e., not shared) offering evenly sized blocks of data from which raw storage volumes can be created.\n",
      "properties": {
        "size": {
          "default": "1 MB",
          "constraints": [
            {
              "greater_or_equal": "1 MB"
            }
          ]
        },
        "volume_id": {
          "type": "string",
          "description": "ID of an existing volume (that is in the accessible scope of the requesting application).",
          "required": false
        },
        "snapshot_id": {
          "type": "string",
          "description": "Some identifier that represents an existing snapshot that should be used when creating the block storage (volume).",
          "required": false
        }
      },
      "capabilities": {
        "attachment": {
          "type": "tosca.capabilities.Attachment"
        }
      }
    },
    "tosca.nodes.Container.Runtime": {
      "derived_from": "tosca.nodes.SoftwareComponent",
      "description": "The TOSCA Container Runtime node represents operating system-level virtualization technology used to run multiple application services on a single Compute host.\n",
      "capabilities": {
        "host": {
          "type": "tosca.capabilities.Compute",
          "valid_source_types": [
            "tosca.nodes.Container.Application"
          ]
        },
        "scalable": {
          "type": "tosca.capabilities.Scalable"
        }
      }
    },
    "tosca.nodes.Container.Application": {
      "derived_from": "tosca.nodes.Root",
      "description": "The TOSCA Container Application node represents an application that requires Container-level virtualization technology.\n",
      "requirements": [
        {
          "host": {
            "capability": "tosca.capabilities.Compute",
            "node": "tosca.nodes.Container.Runtime",
            "relationship": "tosca.relationships.HostedOn"
          }
        },
        {
          "storage": {
            "capability": "tosca.capabilities.Storage"
          }
        },
        {
          "network": {
            "capability": "tosca.capabilities.Endpoint"
          }
        }
      ]
    },
    "tosca.nodes.LoadBalancer": {
      "derived_from": "tosca.nodes.Root",
      "description": "The TOSCA Load Balancer node represents logical function that be used in conjunction with a Floating Address to distribute an application’s traffic (load) across a number of instances of the application (e.g., for a clustered or scaled application).\n",
      "properties": {
        "algorithm": {
          "type": "string",
          "required": false,
          "status": "experimental"
        }
      },
      "capabilities": {
        "client": {
          "type": "tosca.capabilities.Endpoint.Public",
          "occurrences": [
            0,
            "UNBOUNDED"
          ],
          "description": "the Floating (IP) client’s on the public network can connect to"
        }
      },
      "requirements": [
        {
          "application": {
            "capability": "tosca.capabilities.Endpoint",
            "relationship": "tosca.relationships.RoutesTo",
            "occurrences": [
              0,
              "UNBOUNDED"
            ],
            "description": "Connection to one or more load balanced applications"
          }
        }
      ]
    },
    "tosca.nodes.network.Network": {
      "derived_from": "tosca.nodes.Root",
      "description": "The TOSCA Network node represents a simple, logical network service.\n",
      "properties": {
        "ip_version": {
          "description": "The IP version of the requested network.\n",
          "type": "integer",
          "required": false,
          "default": 4,
          "constraints": [
            {
              "valid_values": [
                4,
                6
              ]
            }
          ]
        },
        "cidr": {
          "description": "The cidr block of the requested network.\n",
          "type": "string",
          "required": false
        },
        "start_ip": {
          "description": "The IP address to be used as the 1st one in a pool of addresses derived from the cidr block full IP range.\n",
          "type": "string",
          "required": false
        },
        "end_ip": {
          "description": "The IP address to be used as the last one in a pool of addresses derived from the cidr block full IP range.\n",
          "type": "string",
          "required": false
        },
        "gateway_ip": {
          "description": "The gateway IP address.\n",
          "type": "string",
          "required": false
        },
        "network_name": {
          "description": "An Identifier that represents an existing Network instance in the underlying cloud infrastructure – OR – be used as the name of the new created network. . If network_name is provided along with network_id they will be used to uniquely identify an existing network and not creating a new one, means all other possible properties are not allowed. . network_name should be more convenient for using. But in case that network name uniqueness is not guaranteed then one should provide a network_id as well.\n",
          "type": "string",
          "required": false
        },
        "network_id": {
          "description": "An Identifier that represents an existing Network instance in the underlying cloud infrastructure. This property is mutually exclusive with all other properties except network_name. . Appearance of network_id in network template instructs the Tosca container to use an existing network instead of creating a new one. . network_name should be more convenient for using. But in case that network name uniqueness is not guaranteed then one should add a network_id as well. . network_name and network_id can be still used together to achieve both uniqueness and convenient.\n",
          "type": "string",
          "required": false
        },
        "segmentation_id": {
          "description": "A segmentation identifier in the underlying cloud infrastructure (e.g., VLAN id, GRE tunnel id). If the segmentation_id is specified, the network_type or physical_network properties should be provided as well.\n",
          "type": "string",
          "required": false
        },
        "network_type": {
          "description": "Optionally, specifies the nature of the physical network in the underlying cloud infrastructure. Examples are flat, vlan, gre or vxlan. For flat and vlan types, physical_network should be provided too.\n",
          "type": "string",
          "required": false
        },
        "physical_network": {
          "description": "Optionally, identifies the physical network on top of which the network is implemented, e.g. physnet1. This property is required if network_type is flat or vlan.\n",
          "type": "string",
          "required": false
        },
        "dhcp_enabled": {
          "description": "Indicates the TOSCA container to create a virtual network instance with or without a DHCP service.\n",
          "type": "boolean",
          "required": false,
          "default": true
        }
      },
      "attributes": {
        "segmentation_id": {
          "description": "The actual segmentation_id that is been assigned to the network by the underlying cloud infrastructure.\n",
          "type": "string"
        }
      },
      "capabilities": {
        "link": {
          "type": "tosca.capabilities.network.Linkable"
        }
      }
    },
    "tosca.nodes.network.Port": {
      "derived_from": "tosca.nodes.Root",
      "description": "The TOSCA Port node represents a logical entity that associates between Compute and Network normative types. The Port node type effectively represents a single virtual NIC on the Compute node instance.\n",
      "properties": {
        "ip_address": {
          "description": "Allow the user to set a fixed IP address. Note that this address is a request to the provider which they will attempt to fulfill but may not be able to dependent on the network the port is associated with.\n",
          "type": "string",
          "required": false
        },
        "order": {
          "description": "The order of the NIC on the compute instance (e.g. eth2). Note: when binding more than one port to a single compute (aka multi vNICs) and ordering is desired, it is *mandatory* that all ports will be set with an order value and. The order values must represent a positive, arithmetic progression that starts with 0 (e.g. 0, 1, 2, ..., n).\n",
          "type": "integer",
          "required": true,
          "default": 0,
          "constraints": [
            {
              "greater_or_equal": 0
            }
          ]
        },
        "is_default": {
          "description": "Set is_default=true to apply a default gateway route on the running compute instance to the associated network gateway. Only one port that is associated to single compute node can set as default=true.\n",
          "type": "boolean",
          "required": false,
          "default": false
        },
        "ip_range_start": {
          "description": "Defines the starting IP of a range to be allocated for the compute instances that are associated by this Port. Without setting this property the IP allocation is done from the entire CIDR block of the network.\n",
          "type": "string",
          "required": false
        },
        "ip_range_end": {
          "description": "Defines the ending IP of a range to be allocated for the compute instances that are associated by this Port. Without setting this property the IP allocation is done from the entire CIDR block of the network.\n",
          "type": "string",
          "required": false
        }
      },
      "attributes": {
        "ip_address": {
          "description": "The IP address would be assigned to the associated compute instance.\n",
          "type": "string"
        }
      },
      "requirements": [
        {
          "link": {
            "capability": "tosca.capabilities.network.Linkable",
            "relationship": "tosca.relationships.network.LinksTo"
          }
        },
        {
          "binding": {
            "capability": "tosca.capabilities.network.Bindable",
            "relationship": "tosca.relationships.network.BindsTo"
          }
        }
      ]
    }
  },
  "policy_types": {
    "tosca.policies.Root": {
      "description": "The TOSCA Policy Type all other TOSCA Policy Types derive from"
    },
    "tosca.policies.Placement": {
      "derived_from": "tosca.policies.Root",
      "description": "The TOSCA Policy Type definition that is used to govern placement of TOSCA nodes or groups of nodes."
    },
    "tosca.policies.Scaling": {
      "derived_from": "tosca.policies.Root",
      "description": "The TOSCA Policy Type definition that is used to govern scaling of TOSCA nodes or groups of nodes."
    },
    "tosca.policies.Update": {
      "derived_from": "tosca.policies.Root",
      "description": "The TOSCA Policy Type definition that is used to govern update of TOSCA nodes or groups of nodes."
    },
    "tosca.policies.Performance": {
      "derived_from": "tosca.policies.Root",
      "description": "The TOSCA Policy Type definition that is used to declare performance requirements for TOSCA nodes or groups of nodes."
    }
  }
};