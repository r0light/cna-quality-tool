export const qualityModel = {
    "qualityAspects": {
        "security": {
            "name": "Security",
            "aspects": {
                "confidentiality": {
                    "name": "Confidentiality",
                    "description": "Confidentiality describes to what extent data processed in a system is only accessible to those who actually need it and is otherwise protected from illegitimate access."
                },
                "integrity": {
                    "name": "Integrity",
                    "description": "Integrity describes how well a system is able to prevent unauthorized access or manipulation of functions and data."
                },
                "nonrepudiation": {
                    "name": "Non-repudiation",
                    "description": "Non-repudiation describes to what extent it is possible to prove and reconstruct which actions have taken place in a system."
                },
                "accountability": {
                    "name": "Accountability",
                    "description": "Accountability describes to what extent it is possible in a system to trace back actions that have taken place back to the subject that performed them."
                },
                "authenticity": {
                    "name": "Authenticity",
                    "description": "Authenticity describes how well a system is able to identify a subject and validate its identity as well as claims made by a subject."
                },
            }
        },
        "maintainability": {
            "name": "Maintainability",
            "aspects": {
                "modularity": {
                    "name": "Modularity",
                    "description": "Modularity describes how well a system is composed of different components, so that a change in one component has a minimal impact on other components."
                },
                "reusability": {
                    "name": "Reusability",
                    "description": "Reusability describes to what extent parts of a system can be used in more than one system."
                },
                "analyzability": {
                    "name": "Analysability",
                    "description": "Analyzability describes to what extent it is possible to accurately assess the impact of an intended change as well as the extent to which failures can be diagnosed to find their cause or parts that need to be changed can be identified."
                },
                "modifiability": {
                    "name": "Modifiability",
                    "description": "Modifiability describes how well a system can be modified without introducing defects or degrading other qualities of the system."
                },
                "testability": {
                    "name": "Testability",
                    "description": "Testability describes how effective test criteria can be defined and used for a system are to check the intended behavior of a system as well as how facile it is to perform the tests to determine whether the test criteria are met."
                },
                "simplicity": {
                    "name": "Simplicity",
                    "description": "Simplicity describes how well a system is composed of as few components as possible and includes simple instead of complex interrelations to enable a good overview and understanding of the system."
                },
            }
        },
        "performanceEfficiency": {
            "name": "Performance efficiency",
            "aspects": {
                "timeBehaviour": {
                    "name": "Time-behaviour",
                    "description": "Time-behaviour describes how well a system performs in terms of processing and response times as well as the throughput rate when performing its functions."
                },
                "resourceUtilization": {
                    "name": "Resource utilization",
                    "description": "Resource utilization describes to what extent resources are available and used as required by a system when performing its functions, in terms of storage space needed, CPU utilization, memory usage, or network usage."
                },
                "capability": {
                    "name": "Capability",
                    "description": "Capability describes to which extent the maximum limits of a system meet its requirements, in terms of workload sizes or number of concurrent users."
                },
                "elasticity": {
                    "name": "Elasticity",
                    "description": "Elasticity describes the rapidness and accurateness with which a system is able to adjust its allocated resources to the currently required amount without over- or under-allocation."
                },
            }
        },
        "portability": {
            "name": "Portability",
            "aspects": {
                "adaptability": {
                    "name": "Adaptability",
                    "description": "Adaptability describes how well and how easy a system can be adapted to be executed on different or evolving software, platforms, environments, or hardware."
                },
                "installability": {
                    "name": "Installability",
                    "description": "Installability describes how well a system can be installed or uninstalled completely and correctly in a specific environment."
                },
                "replaceability": {
                    "name": "Replaceability",
                    "description": "Replaceability describes how well a component or system can replace another component or system for the same purpose in the same environment."
                },
            }
        },
        "reliability": {
            "name": "Reliability",
            "aspects": {
                "availability": {
                    "name": "Availability",
                    "description": "Availability describes to what extent a system is operational and accessible at any point in time when it is needed."
                },
                "faultTolerance": {
                    "name": "Fault tolerance",
                    "description": "Fault tolerance describes how well a system is able to operate even when facing software or hardware faults."
                },
                "recoverability": {
                    "name": "Recoverability",
                    "description": "Recoverability describes how well a system is able to recover and return to the intended state after an interruption or failure."
                },
                "maturity": {
                    "name": "Maturity",
                    "description": "Maturity describes to what extent a system meets the specified needs for reliability in normal, expected circumstances."
                },
            }
        },
        "compatibility": {
            "name": "Compatibility",
            "aspects": {
                "coExistence": {
                    "name": "Co-existence",
                    "description": "Co-existence describes how well a system can operate and perform its functions while sharing an environment and resources with other systems and without negatively impacting those other systems."
                },
                "interoperability": {
                    "name": "Interoperability",
                    "description": "Interoperability describes how well two parts of a system or two systems are able to exchange information and to process such exchanged information."
                },
            }
        }
    },
    "productFactors": {
        "dataEncryptionInTransit": {
            "name": "Data encryption in transit",
            "description": "Data which is sent through a link from one component to another should be encrypted so that even when an attacker has access to the network layer, the data remains confidential.",
            "sources": [
                {"key": "Scholl2019", "section": "6 Encrypt Data in Transit"},
                {"key": "Indrasiri2021", "section": "2 Security (Use TLS for synchronous communications)"}
            ],
            "measures": ["ratioOfEndpointsSupportingSSL", "ratioOfSecuredLinks"]
        },
        "secretsStoredInSpecializedServices": {
            "name": "Secrets stored in specialized services",
            "description": "A dedicated backing service to host secrets (e.g. passwords, access tokens, encryption keys) exists. All secrets required by a system are hosted in this backing service where they can also be managed (for example they can be revoked or replaced with updated secrets). Components fetch secrets from this backing services in a controlled way when they need them.",
            "sources": [{"key": "Scholl2019", "section": "6 Securely Store All Secrets"},
                        {"key": "Arundel2019", "section": "10 Kubernetes Secrets"}
                        ],
            "measures": []
        },
        "accessControlManagementConsistency": {
            "name": "Access control management consistency",
            "description": "Access control for endpoints is managed in a consistent way, that means for example always the same format is used for access control lists or a single account directory in a dedicated backing service exists for all components. Access control configurations can then be made always in the same known style and only in a dedicated place. Based on such a consistent access control configuration, also verifications can be performed to ensure that access restrictions are implemented correctly."
        },
        "accountSeparation": {
            "name": "Account separation",
            "description": "Components are separated by assigning them different accounts. Ideally each component has an individual account. Through this, it is possible to trace which component performed which actions and it is possible to restrict access to other components on a fine-grained level, so that for example in the case of an attack, compromised components can be isolated based on their account."
        },
        "authenticationDelegation": {
            "name": "Authentication delegation",
            "description": "The verification of an entity for authenticity, for example upon a request, is delegated to a dedicated backing service. This concern is therefore removed from individual components so that their focus can remain on business functionalities while for example different authentication options can be managed in one place only."
        },
        "limitedDataScope": {
            "name": "Limited data scope",
            "description": "The number of data aggregates that are processed in a service is limited to those which need to be administrated together, for example to fulfill data consistency requirements. The aim is to keep the functional scope of a service cohesive. Data aggregates for which consistency requirements can be relaxed might be distributed over separate services."
        },
        "commandQueryResponsibilitySegregation": {
            "name": "Command Query Responsibility Segregation",
            "description": "Endpoints for read (query) and write (command) operations on the same data aggregate are separated into different services. Changes to these operations can then be made independently and also different representations for data aggregates can be used. That way operations on data aggregates can be adjusted to differing usage patterns, different format requirements, or if they are changed for different reasons."
        },
        "mostlyStatelessServices": {
            "name": "Mostly stateless services",
            "description": "Most services in a system are kept stateless, that means not requiring durable disk space on the infrastructure that they run on. Stateless services can be replaced, updated or replicated at any time. Stateful services are reduced to a minimum."
        },
        "specializedStatefulServices": {
            "name": "Specialized stateful services",
            "description": "For stateful components, that means components that do require durable disk space on the infrastructure that they run on, specialized software or frameworks are used that can handle distributed state by replicating it over several components or component instances while still ensuring consistency requirements for that state."
        },
        "asynchronousCommunication": {
            "name": "Asynchronous communication",
            "description": "Asynchronous links (e.g. based on messaging backing services) are preferred for the communication between components. That way, components are decoupled in time meaning that not all linked components need to be available at the same time for a successful communication. Additionally, callers do not await a response."
        },
        "persistentCommunication": {
            "name": "Persistent communication",
            "description": "Links persist messages which have been sent (e.g. based on messaging backing services). That way, components are decoupled, because components need not yet exist at the time a message is sent, but can still receive a message. Communication can also be repeated, because persisted messages can be retrieved again."
        },
        "usageOfExistingSolutionsForNon-CoreCapabilities": {
            "name": "Usage of existing solutions for non-core capabilities",
            "description": "For non-core capabilities readily available solutions are used. This means solutions which are based on a standard or a specification, are widely adopted and ideally open source so that their well-functioning is ensured by a broader community. Non-core capabilities include interface technologies or protocols for endpoints, infrastructure technologies (for example container orchestration engines), and software for backing services. That way capabilities don't need to self-implemented and existing integration options can be used."
        },
        "separationByGateways": {
            "name": "Separation by gateways",
            "description": "Individual components or groups of components are separated through gateways. That means communication is proxied and controlled at specific gateway components. It also abstracts one part of a system from another so that it can be reused by different components without needing direct links to components that actually provide the needed functionality. This way, communication can also be redirected when component endpoints change without changing the gateway endpoint. Also incoming communication from outside of a system can be directed at external endpoints of a central component (the gateway)."
        },
        "consistentCentralizedLogging": {
            "name": "Consistent centralized logging",
            "description": "Logging functionality, specifically the automated collection of logs, is concentrated in a centralized backing service which combines and stores logs from the components of a system. The logs are kept consistent regarding their format and level of granularity. In the backing service also log analysis functionalities are provided, for example by also enabling a correlation of logs from different components."
        },
        "consistentCentralizedMetrics": {
            "name": "Consistent centralized metrics",
            "description": "Metrics gathering and calculation functionality for monitoring purposes is concentrated in a centralized component which combines, aggregates and stores metrics from the components of a system. The metrics are kept consistent regarding their format and support multiple levels of granularity. In the backing service also metric analysis functionalities are provided, for example by also enabling correlations of metrics."
        },
        "distributedTracingOfInvocations": {
            "name": "Distributed tracing of invocations",
            "description": "For request traces that span multiple components in a system, distributed tracing is enabled so that traces based on correlation IDs are captured automatically and stored in a backing service where they can be analyzed and problems within request traces can be clearly attributed to single components."
        },
        "healthAndReadinessChecks": {
            "name": "Health and readiness Checks",
            "description": "All components in a system offer health and readiness checks so that unhealthy components can be identified and communication can be restricted to happen only between healthy and ready components. Health and readiness checks can for example be dedicated endpoints of components which can be called regularly to check a component. That way, also an up-to-date holistic overview of the health of a system is enabled."
        },
        "automatedInfrastructure": {
            "name": "Automated infrastructure",
            "description": "Infrastructure provisioning and management is automated as much as possible and manual tasks are reduced. That means infrastructure is created automatically when needed, kept up-to-date automatically while in use, and removed automatically once not needed anymore. Ideally it is combined with components deployments so that no manual infrastructure management is needed for a component deployment."
        },
        "useInfrastructureAsCode": {
            "name": "Use infrastructure as code",
            "description": "The infrastructure requirements and constraints of a system are defined (coded) independently of the actual runtime in a storable format. That way a defined infrastructure can be automatically provisioned repeatedly and ideally also on different underlying infrastructures (cloud providers) based on the stored infrastructure definition. Infrastructure provisioning and configuration operations are not performed manually via an interface of a cloud provider."
        },
        "dynamicScheduling": {
            "name": "Dynamic scheduling",
            "description": "Resource provisioning to deployed components is dynamic and automated so that every component is ensured to have the resources it needs and only that many resources are provisioned wich are really needed at the same time. This requires dynamic adjustments to resources to adapt to changing environments. This capability is part of the used infrastructure."
        },
        "limitedRequestTraceScope": {
            "name": "Limited request trace scope",
            "description": "A request that requires the collaboration of several services is still limited to as few services as possible. Otherwise, the more services are part of a request trace the more dependent they are on each other."
        },
        "logicalGrouping": {
            "name": "Logical grouping",
            "description": "Services are logically grouped so that services which are related (for example by having many links or processing the same data aggregates) are in the same group, but services which are more independent are separated in different groups. That way a separation can also be achieved on the network and infrastructure level by separating service groups more strictly, such as having different subnets for such logical groups or not letting different groups run on the same infrastructure. Potential impacts of a compromised or misbehaving service can therefore be reduced to the group to which it belongs but other groups are ideally unaffected."
        },
        "backingServiceDecentralization": {
            "name": "Backing service decentralization",
            "description": "Different backing services are assigned to different components. That way, a decentralization is achieved. For example, instead of one message broker for a whole system, several message brokers can be used, each for a group of components that are interrelated. A problem in one messaging broker has an impact on only those components using it, but not on components having separate message brokers."
        },
        "managedInfrastructure": {
            "name": "Managed infrastructure",
            "description": "Infrastructure such as basic computing, storage or network resources, but potentially also software infrastructure (for example a container orchestration engine) is managed by a cloud provider who is responsible for a stable functioning and up-to-date functionalities. The more infrastructure is managed, the more operational responsibility is transferred. This will also be reflected in the costs which are then calculated more on usage-based pricing schemes."
        },
        "managedBackingServices": {
            "name": "Managed backing services",
            "description": "Backing services that provide non-business functionality are operated and managed by vendors who are responsible for a stable functioning and up-to-date functionalities. Operational responsibility is transferred which is also reflected in the costs which are then calculated more on usage-based pricing schemes."
        },
        "serviceReplication": {
            "name": "Service replication",
            "description": "Services and therefore their provided functionalities are replicated across different locations so that the latency for accesses from different locations is minimized and the incoming load can be distributed among replicas."
        },
        "horizontalDataReplication": {
            "name": "Horizontal data replication",
            "description": "Data is replicated horizontally, that means duplicated across several instances of a storage backing service so that a higher load can be handled and replicas closer to the service where data is needed can be used to reduce latency."
        },
        "verticalDataReplication": {
            "name": "Vertical data replication",
            "description": "Data is replicated vertically, that means across a request trace so that it is available closer to where a request initially comes in. Typically caching is used for vertical data replication."
        },
        "shardedDataStoreReplication": {
            "name": "Sharded data store replication",
            "description": "Data storage is sharded, that means data is split into several storage backing service instances by a certain strategy so that requests can be distributed across shards to increase performance. One example strategy could be to shard data geographically, that means user data from one location is stored in one shard while user data from another location is stored in a different shard. One storage backing service instance is then less likely to be overloaded with requests, because the number of potential requests is limited by the amount of data in that instance."
        },
        "resourceLimits": {
            "name": "Resource limits",
            "description": "For all components the maximum amount of resources a component can consume is limited based on its predicted needs so that resources are provisioned efficiently. That means a component gets the resources that it needs, but not more than necessary. By making the resource requirements explicit, for example in a configuration file, these limits can be enforced by the infrastructure."
        },
        "built-InAutoscaling": {
            "name": "Built-in autoscaling",
            "description": "Horizontal up- and down-scaling of components is automated and built into the infrastructure on which components run. Horizontal scaling means that component instances are replicated when the load increases and components instances are removed when load decreases. This autoscaling is based on rules which can be configured according to system needs."
        },
        "infrastructureAbstraction": {
            "name": "Infrastructure abstraction",
            "description": "The used infrastructure such as physical hardware, virtual hardware, or software platform is abstracted by clear boundaries to enable a clear differentiation of responsibilities for operating and managing infrastructure. For example, when a managed container orchestration system is used, the system is operable on that level of abstraction meaning that the API of the orchestration system is the boundary. Problems with underlying hardware or VMs are handled transparently by the provider."
        },
        "cloudVendorAbstraction": {
            "name": "Cloud vendor abstraction",
            "description": "The managed infrastructure and backing services used by a system and provided by a cloud vendor are based on unified or standardized interfaces so that vendor specifics are abstracted and a system could potentially be transferred to a another cloud vendor offering the same unified or standardized interfaces."
        },
        "configurationStoredInSpecializedServices": {
            "name": "Configuration stored in specialized services",
            "description": "Configuration values are stored in specialized backing services and not only environment variables for example. That way, changing configurations at runtime is facilitated and can be enabled by connecting components to such specialized backing services and checking for updated configurations at runtime. Additionally, configurations can be stored once, but accessed by different components."
        },
        "immutableArtifacts": {
            "name": "Immutable artifacts",
            "description": "Infrastructure and components of a system are defined and described in its entirety at development time so that artifacts are immutable at runtime. This means upgrades are introduced at runtime through replacement of components instead of modification. Furthermore components do not differ across environments and in case of replication all replicas are identical to avoid unexpected behavior."
        },
        "physicalDataDistribution": {
            "name": "Physical data distribution",
            "description": "Storage Backing Service instances where Data aggregates are persisted are distributed across physical locations (e.g. availability zones of a cloud vendor) so that even in the case of a failure of one physical location, another physical location is still useable."
        },
        "physicalServiceDistribution": {
            "name": "Physical service distribution",
            "description": "Components are distributed through replication across physical locations (e.g. availability zones of a cloud vendor) so that even in the case of a failure of one physical location, another physical location is still useable."
        },
        "rollingUpgradesEnabled": {
            "name": "Rolling upgrades enabled",
            "description": "The infrastructure on which components are deployed provides the ability for rolling upgrades. That means upgrades of components can be performed seamlessly in an automated manner. Seamlessly means that upgrades of components do not necessitate planned downtime."
        },
        "retriesForSafeInvocations": {
            "name": "Retries for safe invocations",
            "description": "Links that are safe to invoke multiple times without leading to unintended state changes, are automatically retried in case of errors to transparently handle transient faults in communication. That way faults can be prevented from being propagated higher up in a request trace."
        },
        "circuitBreakedCommunication": {
            "name": "Circuit breaked communication",
            "description": "For links a circuit breaker implementation is used which avoids unnecessary communication and therefore waiting time if a communication is known to fail. Instead the circuit breaker immediately returns an error response of a default response, is possible, while periodically retrying communication in the background"
        },
        "automatedRestarts": {
            "name": "Automated restarts",
            "description": "When a component is found to be unhealthy, that means not functioning as expected, it is directly and automatically restarted. Ideally this capability is provided by the infrastructure on which a component is running."
        },
        "api-BasedCommunication": {
            "name": "API-based communication",
            "description": "All endpoints that are offered by a service are part of a well-defined and documented API. That means, the APIs are based on common principles, are declarative instead of imperative, and are documented in a standardized or specified format (such as the OpenAPI specification). Communication only happens via endpoints that are part of such APIs and can be both synchronous or asynchronous."
        },
        "contract-BasedLinks": {
            "name": "Contract-based links",
            "description": "Contracts are defined for the communication via links so that changes to endpoints can be evaluated by their impact on the contract and delayed when a contract would be broken. That way consumers of endpoints can adapt to changes when necessary without suddenly breaking communication via a link due to a changed endpoint."
        },
        "mediatedCommunication": {
            "name": "Mediated communication",
            "description": "Communication from one component via a link is mediated through additional components so that there is no direct dependence on the other communication partner and additional operations can be performed to manage the communication, also in a centrally and consistently configurable way. Such operations can for example be access control, load balancing, retries, or monitoring."
        },
        "addressingAbstraction": {
            "name": "Addressing abstraction",
            "description": "In a link from one component to another the specific addresses for reaching the other component is not used, but instead an abstract address is used. That way, the specific addresses of components can be changed without impacting the link between components. This can be achieved for example through service discovery where components are addressed through abstract service names and specific addresses are resolved through service discovery which can be implemented in the infrastructure or a backing service."
        },
        "communicationPartnerAbstraction": {
            "name": "Communication partner abstraction",
            "description": "Communication via links is not based on specific communication partners (specific components) but abstracted based on the content of communication. An example is event-driven communication where events are published to channels without the publisher knowing which components receive events and events can therefore also be received by components which are created later in time."
        }
    },
    "impacts": [
        { "impactedFactor": "confidentiality", "sourceFactor": "secretsStoredInSpecializedServices", "impactType": "positive" },
        { "impactedFactor": "confidentiality", "sourceFactor": "dataEncryptionInTransit", "impactType": "positive"}
    ],
    "measures": {
        "ratioOfEndpointsSupportingSSL": {
            "name": "Ratio of endpoints that support SSL",
            "calculation": "Endpoints that support SSL / Endpoints that do not support SSL",
            "sources": ["Ntentos2022"]
        },
        "ratioOfSecuredLinks": {
            "name": "Ratio of secured links",
            "calculation": "Links secured by SSL / All links",
            "sources": ["Zdun2023"]
        }
    }
}