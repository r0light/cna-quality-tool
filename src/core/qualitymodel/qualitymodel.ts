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
                }
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
                    "name": "Analyzability",
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
                }
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
                }
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
                }
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
                }
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
                }
            }
        }
    },
    "productFactors": {
        "dataEncryptionInTransit": {
            "name": "Data encryption in transit",
            "description": "Data which is sent through a link from one component to another should be encrypted so that even when an attacker has access to the network layer, the data remains confidential.",
            "relevantEntities": ["link" , "endpoint"],
            "sources": [
                { "key": "Scholl2019", "section": "6 Encrypt Data in Transit" },
                { "key": "Indrasiri2021", "section": "2 Security (Use TLS for synchronous communications)" }
            ],
            "measures": ["ratioOfEndpointsSupportingSSL", "ratioOfSecuredLinks"]
        },
        "secretsManagement": {
            "name": "Secrets management",
            "description": "Secrets (e.g. passwords, access tokens, encryption keys) which allow access to other components or data should be managed specifically to make sure they stay confidential and only authorized components or persons can access them.",
            "relevantEntities": ["component"],
            "sources": [],
            "measures": []
        },
        "isolatedSecrets": {
            "name": "Isolated secrets",
            "description": "Secrets (e.g. passwords, access tokens, encryption keys) should not be stored by in component artifacts (e.g. binaries, images). Instead, components should be given access at runtime only to those secrets which they actually need and only when they need it.",
            "relevantEntities": ["component", "backingData"],
            "sources": [{ "key": "Scholl2019", "section": "6 Never Store Secrets or Configuration Inside an Image" }, { "key": "Adkins2019", "section": "14 Don't Check In Secrets" }],
            "measures": []
        },
        "secretsStoredInSpecializedServices": {
            "name": "Secrets stored in specialized services",
            "description": "A dedicated backing service to host secrets (e.g. passwords, access tokens, encryption keys) exists. All secrets required by a system are hosted in this backing service where they can also be managed (for example they can be revoked or replaced with updated secrets). Components fetch secrets from this backing services in a controlled way when they need them.",
            "relevantEntities": ["service", "backingService", "backingData"],
            "sources": [{ "key": "Scholl2019", "section": "6 Securely Store All Secrets" },
            { "key": "Arundel2019", "section": "10 Kubernetes Secrets" }
            ],
            "measures": []
        },
        "accessRestriction": {
            "name": "Access restriction",
            "description": "Access to components should be restricted to those who actually need it. Also within a system access controls should be put in place to have multiple layers of defense. A dedicated component to manage access policies can be used.",
            "relevantEntities": ["component", "endpoint"],
            "sources": [],
            "measures": []
        },
        "leastPrivilegedAccess": {
            "name": "Least-privileged access",
            "description": "Access to endpoints should be given as restrictive as possible so that only components who really need it can access an endpoint.",
            "relevantEntities": ["component", "endpoint"],
            "sources": [{ "key": "Scholl2019", "section": "6 Grant Least-Privileged Access" }, { "key": "Arundel2019", "section": "11 Access Control and Permissions" }],
            "measures": []
        },
        "accessControlManagementConsistency": {
            "name": "Access control management consistency",
            "description": "Access control for endpoints is managed in a consistent way, that means for example always the same format is used for access control lists or a single account directory in a dedicated backing service exists for all components. Access control configurations can then be made always in the same known style and only in a dedicated place. Based on such a consistent access control configuration, also verifications can be performed to ensure that access restrictions are implemented correctly.",
            "relevantEntities": ["component"],
            "sources": [{ "key": "Adkins2019", "section": "6 Access Control (Access control managed by framework)" }, { "key": "Goniwada2021", "section": "9 Policy as Code (consistently describe your security policies in form of code)" }],
            "measures": ["RatioOfEndpointsThatSupportTokenBasedAuthentication"]
        },
        "accountSeparation": {
            "name": "Account separation",
            "description": "Components are separated by assigning them different accounts. Ideally each component has an individual account. Through this, it is possible to trace which component performed which actions and it is possible to restrict access to other components on a fine-grained level, so that for example in the case of an attack, compromised components can be isolated based on their account.",
            "relevantEntities": ["component"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Separate Accounts/Subscriptions/Tenants”" }, { "key": "Adkins2019", "section": "8 Role separation”(let different services run with different roles to restrict access)" }, { "key": "Adkins2019", "section": "8 “Location separation (use different roles for a service in different locations to limit attack impacts)" }],
            "measures": []
        },
        "authenticationDelegation": {
            "name": "Authentication delegation",
            "description": "The verification of an entity for authenticity, for example upon a request, is delegated to a dedicated backing service. This concern is therefore removed from individual components so that their focus can remain on business functionalities while for example different authentication options can be managed in one place only.",
            "relevantEntities": ["system", "backingService"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Federated Identity Management" }, { "key": "Goniwada2021", "section": "9 Decentralized Identity" }],
            "measures": []
        },
        "serviceOrientation": {
            "name": "Service-orientation",
            "description": "Cloud-native applications should realize modularity by being service-oriented, that means the system should be decomposed into services described by interfaces following the microservices architectural style.",
            "relevantEntities": ["system", "service"],
            "sources": [],
            "measures": []
        },
        "limitedFunctionalScope": {
            "name": "Limited functional scope",
            "description": "Each service should cover only a limited, but cohesive functional scope to keep service manageable.",
            "relevantEntities": ["service", "endpoint"],
            "sources": [{ "key": "Reznik2019", "section": "9 Microservices Architecture" }, { "key": "Adkins2019", "section": "7 Use Microservices" }, { "key": "Goniwada2021", "section": "3 Polylithic Architecture Principle (Build separate services for different business functionalitites) " }],
            "measures": []
        },
        "limitedDataScope": {
            "name": "Limited data scope",
            "description": "The number of data aggregates that are processed in a service is limited to those which need to be administrated together, for example to fulfill data consistency requirements. The aim is to keep the functional scope of a service cohesive. Data aggregates for which consistency requirements can be relaxed might be distributed over separate services.",
            "relevantEntities": ["service", "dataAggregate"],
            "sources": [],
            "measures": []
        },
        "limitedEndpointScope": {
            "name": "Limited endpoint scope",
            "description": "To keep the functional scope of services limited, the number of endpoints of a service should be limited to a coveshive set of endpoints that provide related operations.",
            "relevantEntities": ["service", "endpoint"],
            "sources": [],
            "measures": []
        },
        "commandQueryResponsibilitySegregation": {
            "name": "Command Query Responsibility Segregation",
            "description": "Endpoints for read (query) and write (command) operations on the same data aggregate are separated into different services. Changes to these operations can then be made independently and also different representations for data aggregates can be used. That way operations on data aggregates can be adjusted to differing usage patterns, different format requirements, or if they are changed for different reasons.",
            "relevantEntities": ["service", "endpoint"],
            "sources": [{ "key": "Davis2019", "section": "4.4" }, { "key": "Richardson2019", "section": "7.2 Using the CQRS pattern" }, { "key": "Bastani2017", "section": "12 CQRS (Command Query Responsibility Segregation)" }, { "key": "Indrasiri2021", "section": "4 Command and Query Responsibility Segregation Pattern" }, { "key": "Goniwada2021", "section": "4 Command and Query Responsibility Segregation Pattern" }],
            "measures": []
        },
        "separationByGateways": {
            "name": "Separation by gateways",
            "description": "Individual components or groups of components are separated through gateways. That means communication is proxied and controlled at specific gateway components. It also abstracts one part of a system from another so that it can be reused by different components without needing direct links to components that actually provide the needed functionality. This way, communication can also be redirected when component endpoints change without changing the gateway endpoint. Also incoming communication from outside of a system can be directed at external endpoints of a central component (the gateway).",
            "relevantEntities": ["system", "component", "endpoint"],
            "sources": [{ "key": "Davis2019", "section": "10.2" },
            { "key": "Richardson2019", "section": "8.2" }, { "key": "Bastani2017", "section": "8 Edge Services: Filtering and Proxying with Netflix Zuul" }, { "key": "Indrasiri2021", "section": "7 API Gateway Pattern" }, { "key": "Indrasiri2021", "section": "7 API Microgateway Pattern (Smaller API microgateways to avoid having a monolithic API gateway)" }, { "key": "Goniwada2021", "section": "4 “Mediator” (Use a mediator pattern between clients and servers)" }],
            "measures": []
        },
        "isolatedState": {
            "name": "Isolated state",
            "description": "In cloud-native applications services should be structured by clearly separating stateless and stateful services. Stateful services should be reduced to a minimum.",
            "relevantEntities": ["system", "component", "storageBackingService"],
            "sources": [{ "key": "Goniwada2021", "section": "3 Coupling (Services should be as loosely coupled as possible)" }],
            "measures": []
        },
        "mostlyStatelessServices": {
            "name": "Mostly stateless services",
            "description": "Most services in a system are kept stateless, that means not requiring durable disk space on the infrastructure that they run on. Stateless services can be replaced, updated or replicated at any time. Stateful services are reduced to a minimum.",
            "relevantEntities": ["component"],
            "sources": [{ "key": "Davis2019", "section": "5.4" }, { "key": "Scholl2019", "section": "6 “Design Stateless Services That Scale Out" }, { "key": "Goniwada2021", "section": "3 Be Smart with State Principle, 5 Stateless Services" }],
            "measures": []
        },
        "specializedStatefulServices": {
            "name": "Specialized stateful services",
            "description": "For stateful components, that means components that do require durable disk space on the infrastructure that they run on, specialized software or frameworks are used that can handle distributed state by replicating it over several components or component instances while still ensuring consistency requirements for that state.",
            "relevantEntities": ["component", "storageBackingService"],
            "sources": [{ "key": "Davis2019", "section": "5.4" }, { "key": "Ibryam2020", "section": "11 “Stateful Service”" }],
            "measures": []
        },
        "looseCoupling": {
            "name": "Loose coupling",
            "description": "In cloud-native applications links between components should be loosely coupled in time, location, and language to achieve independence.",
            "relevantEntities": ["system", "component", "link"],
            "sources": [],
            "measures": []
        },
        "asynchronousCommunication": {
            "name": "Asynchronous communication",
            "description": "Asynchronous links (e.g. based on messaging backing services) are preferred for the communication between components. That way, components are decoupled in time meaning that not all linked components need to be available at the same time for a successful communication. Additionally, callers do not await a response.",
            "relevantEntities": ["link"],
            "sources": [{ "key": "Davis2019", "section": "4.2" }, { "key": "Scholl2019", "section": "6 Prefer Asynchronous Communication" }, { "key": "Richardson2019", "section": "3.3.2, 3.4 Using asynchronous messaging to improve availability" }, { "key": "Indrasiri2021", "section": "3 Service Choreography Pattern" }, { "key": "Ruecker2021", "section": "9 Asynchronous Request/Response (Use asynchronous communication to make services more robust)" }, { "key": "Goniwada2021", "section": "4 Asynchronous Nonblocking I/O" }],
            "measures": []
        },
        "communicationPartnerAbstraction": {
            "name": "Communication partner abstraction",
            "description": "Communication via links is not based on specific communication partners (specific components) but abstracted based on the content of communication. An example is event-driven communication where events are published to channels without the publisher knowing which components receive events and events can therefore also be received by components which are created later in time.",
            "relevantEntities": ["link", "backingService"],
            "sources": [{ "key": "Richardson2019", "section": "6 Event-driven communication" }, { "key": "Ruecker2021", "section": "8: Event-driven systems “event chains emerge over time and therefore lack visibility." }],
            "measures": []
        },
        "persistentCommunication": {
            "name": "Persistent communication",
            "description": "Links persist messages which have been sent (e.g. based on messaging backing services). That way, components are decoupled, because components need not yet exist at the time a message is sent, but can still receive a message. Communication can also be repeated, because persisted messages can be retrieved again.",
            "relevantEntities": ["link"],
            "sources": [{ "key": "Indrasiri2021", "section": "5 Event Sourcing Pattern: Log-based message brokers" }],
            "measures": []
        },
        "usageOfExistingSolutionsForNon-CoreCapabilities": {
            "name": "Usage of existing solutions for non-core capabilities",
            "description": "By using readily available standardized, open source solutions for non-core capabilities, the development effort is reduced and the software quality can be increased, because a broader community ensures the well-functioning of a software solution.",
            "relevantEntities": ["component", "backingService"],
            "sources": [{ "key": "Reznik2019", "section": "9 Avoid Reinventing the Wheel" }, { "key": "Adkins2019", "section": "12 Frameworks to Enforce Security and Reliability" }],
            "measures": []
        },
        "standardization": {
            "name": "Standardization",
            "description": "By using standardized technologies within components, for interfaces, and especially for the infrastructure, backing services and other non-business concerns, reusability can be increased and the effort to develop additional functionality which integrates with existing components can be reduced.",
            "relevantEntities": ["system", "component", "link"],
            "sources": [],
            "measures": []
        },
        "componentSimilarity": {
            "name": "Component similarity",
            "description": "The more similar components are, the higher the reusability is and the easier it is for developers to work on an unfamiliar component. Furthermore, similar components can be more easily integrated and maintainted in the same way. Similarity considers mainly the libraries and technologies used for implementing and deploying services.",
            "relevantEntities": ["component"],
            "sources": [{ "key": "Reznik2019", "section": "9 Reference Architecture" }],
            "measures": []
        },
        "automatedMonitoring": {
            "name": "Automated Monitoring",
            "description": "Cloud-native applications should enable monitoring at various levels (business functionalities in services, backing-service funtionalities, infrastructure) in an automated fashion to enable observable and autononmous reactions to changing system conditions.",
            "relevantEntities": ["service", "link", "infrastructure"],
            "sources": [{ "key": "Goniwada2021", "section": "3 High Observability Principle" }],
            "measures": []
        },
        "consistentCentralizedLogging": {
            "name": "Consistent centralized logging",
            "description": "Logging functionality, specifically the automated collection of logs, is concentrated in a centralized backing service which combines and stores logs from the components of a system. The logs are kept consistent regarding their format and level of granularity. In the backing service also log analysis functionalities are provided, for example by also enabling a correlation of logs from different components.",
            "relevantEntities": ["service", "backingService"],
            "sources": [{ "key": "Davis2019", "section": "11.1" }, { "key": "Scholl2019", "section": "6 Use a Unified Logging System" }, { "key": "Scholl2019", "section": "6 Common and Structured Logging Format" }, { "key": "Richardson2019", "section": "11.3.2 Applying the Log aggregation pattern" }, { "key": "Reznik2019", "section": "10 Observability" }, { "key": "Garrison2017", "section": "7 Monitoring and Logging" }, { "key": "Adkins2019", "section": "15 Design your logging to be immutable" }, { "key": "Arundel2019", "section": "15 Logging" }, { "key": "Winn2017", "section": "2 Aggregated Streaming of Logs and Metrics" }, { "key": "Bastani2017", "section": "13 Application Logging" }, { "key": "Bastani2017", "section": "13 Audit Events (capture events for audits, like failed logins etc)" }, { "key": "Ruecker2021", "section": "11 Custom Centralized Monitoring" }, { "key": "Goniwada2021", "section": "19 One Source of Truth" }],
            "measures": []
        },
        "consistentCentralizedMetrics": {
            "name": "Consistent centralized metrics",
            "description": "Metrics gathering and calculation functionality for monitoring purposes is concentrated in a centralized component which combines, aggregates and stores metrics from the components of a system. The metrics are kept consistent regarding their format and support multiple levels of granularity. In the backing service also metric analysis functionalities are provided, for example by also enabling correlations of metrics.",
            "relevantEntities": ["service", "backingService"],
            "sources": [{ "key": "Davis2019", "section": "11.2" }, { "key": "Scholl2019", "section": "6 Tag Your Metrics Appropriately" }, { "key": "Richardson2019", "section": "11.3.4 Applying the Applications metrics pattern" }, { "key": "Garrison2017", "section": "7 Monitoring and Logging, Metrics Aggregation" }, { "key": "Reznik2019", "section": "10 Observability" }, { "key": "Arundel2019", "section": "15 Metrics help predict problems" }, { "key": "Winn2017", "section": "2 Aggregated Streaming of Logs and Metrics" }, { "key": "Arundel2019", "section": "15 Logging" }, { "key": "Winn2017", "section": "2 Aggregated Streaming of Logs and Metrics" }, { "key": "Bastani2017", "section": "13 Metrics" }, { "key": "Arundel2019", "section": "16 The RED Pattern (common metrics you should have for services" }, { "key": "Arundel2019", "section": "16 The USE Pattern (common metrics for resources" }, { "key": "Goniwada2021", "section": "19 One Source of Truth" }],
            "measures": []
        },
        "distributedTracingOfInvocations": {
            "name": "Distributed tracing of invocations",
            "description": "For request traces that span multiple components in a system, distributed tracing is enabled so that traces based on correlation IDs are captured automatically and stored in a backing service where they can be analyzed and problems within request traces can be clearly attributed to single components.",
            "relevantEntities": ["service", "link", "requestTrace"],
            "sources": [{ "key": "Davis2019", "section": "11.3" }, { "key": "Scholl2019", "section": "6 Use Correlation IDs" }, { "key": "Richardson2019", "section": "11.3.3 AUsing the Distributed tracing pattern" }, { "key": "Garrison2017", "section": "7 Debugging and Tracing" }, { "key": "Reznik2019", "section": "10 Observability" }, { "key": "Arundel2019", "section": "15 Tracing" }, { "key": "Bastani2017", "section": "13 Distributed Tracing" }, { "key": "Ruecker2021", "section": "11 Observability and Distributed Tracing Tools (Use Distributed Tracing)" }, { "key": "Goniwada2021", "section": "19 One Source of Truth" }],
            "measures": []
        },
        "healthAndReadinessChecks": {
            "name": "Health and readiness Checks",
            "description": "All components in a system offer health and readiness checks so that unhealthy components can be identified and communication can be restricted to happen only between healthy and ready components. Health and readiness checks can for example be dedicated endpoints of components which can be called regularly to check a component. That way, also an up-to-date holistic overview of the health of a system is enabled.",
            "relevantEntities": ["service"],
            "sources": [{ "key": "Scholl2019", "section": "6 Implement Health Checks and Readiness Checks" }, { "key": "Ibryam2020", "section": "4 Health Probe" }, { "key": "Richardson2019", "section": "11.3.1 Using the Health check API pattern" }, { "key": "Garrison2017", "section": "7 State Management" }, { "key": "Arundel2019", "section": "5 Liveness Probes" }, { "key": "Arundel2019", "section": "5 Readiness Probes" }, { "key": "Bastani2017", "section": "13 Health Checks" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?, Health monitoring" }, { "key": "Goniwada2021", "section": "4 Fail Fast, 16 Health Probe" }],
            "measures": []
        },
        "automatedInfrastructureProvisioning": {
            "name": "Automated infrastructure Provisioning",
            "description": "Infrastructure provisioning should be automated based on component requirements which are either stated explicitly or inferred from the component which should be deployed. The infrastructure and tools used should require only minimal manual effort. Ideally it should be combined with continuous delivery processes so that no further interaction is needed for a component deployment.",
            "relevantEntities": ["infrastructure"],
            "sources": [{ "key": "Reznik2019", "section": "10 Automated Infrastructure" }, { "key": "Goniwada2021", "section": "5 Automation" }],
            "measures": []
        },
        "useInfrastructureAsCode": {
            "name": "Use infrastructure as code",
            "description": "To avoid manual infrastructure operation and configuration, the infrastructure requirements and constraints should be defined (coded) independently of the actual runtime. That way a defined infrastructure can be automatically provisioned repeatedly and ideally on different underlying infrastructures (cloud providers).",
            "relevantEntities": ["infrastructure"],
            "sources": [{ "key": "Scholl2019", "section": "6 Describe Infrastructure Using Code" }, { "key": "Goniwada2021", "section": "16 Declarative Deployment, 17 What Is Infrastructure as Code?" }],
            "measures": []
        },
        "dynamicScheduling": {
            "name": "Dynamic scheduling",
            "description": "Resource provisioning to deployed components should be dynamic and automated so that every component is ensured to have the resources it needs and only that many resources are provisioned wich are really needed at the same time. This requires dynamic adjustments to resources to adapt to changing environments. This capability should be part of the used infrastructure.",
            "relevantEntities": ["infrastructure"],
            "sources": [{ "key": "Reznik2019", "section": "10 Dynamic Scheduling" }, { "key": "Garrison2017", "section": "7 Resource Allocation and Scheduling" }, { "key": "Ibryam2020", "section": "6 Automated Placement" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; Resource Management" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; Automatic provisioning" }, { "key": "Goniwada2021", "section": "16 Automated Placement" }],
            "measures": []
        },
        "serviceIndependence": {
            "name": "Service independence",
            "description": "In a cloud-native application services should be as independent as possible throughout their lifecycle, that means development, operation, and evolution. Changes to one services should not impact other services.",
            "relevantEntities": ["service", "link"],
            "sources": [{ "key": "Goniwada2021", "section": "3 Decentralize Everything Principle (Decentralize deployment, governance)" }],
            "measures": []
        },
        "lowCoupling": {
            "name": "Low coupling",
            "description": "In a cloud-native application coupling shoud be low in terms of links between components. Each link represents a dependency and therefore decreases service independent",
            "relevantEntities": ["service", "link"],
            "sources": [],
            "measures": []
        },
        "functionalDecentralization": {
            "name": "Functional decentralization",
            "description": "Business functionality should be decentralized over the system as a whole to make components more independent.",
            "relevantEntities": ["system", "service", "link"],
            "sources": [],
            "measures": []
        },
        "limitedRequestTraceScope": {
            "name": "Limited request trace scope",
            "description": "A request that requires the collaboration of several services should still be limited to as few services as possible, because otherwise services are less independent the more they need to collaborate to handle requests.",
            "relevantEntities": ["requestTrace"],
            "sources": [],
            "measures": []
        },
        "logicalGrouping": {
            "name": "Logical grouping",
            "description": "To increase the independence of services, services should also be grouped so that services which are related are in the same group, but services which are independent are separated further. That way a separation can also be achieved on the network and infrastructure level by separating independent component groups more strictly. Potential impacts of a compromised or misbehaving service can therefore be reduced to the group to which it belongs but other groups are unaffected.",
            "relevantEntities": ["system", "service"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Namespaces to Organize Services in Kubernetes" }, { "key": "Arundel2019", "section": "5 Using Namespaces" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; Componentization and isolation" }],
            "measures": []
        },
        "backingServiceDecentralization": {
            "name": "Backing service decentralization",
            "description": "By assigning different backing services to different components a decentralization can be achieved which makes components more independent. For example, instead of one message broker for a whole system, several message brokers can be used, each for a group of components that are interrelated. A problem in one messaging broker has an impact on only those components using it, but not on components having separate message brokers.",
            "relevantEntities": ["service", "backingService"],
            "sources": [{ "key": "Indrasiri2021", "section": "4 Decentralized Data Management (decentralized data leads to higher service independence while centralized data leads to higher consistency.)" }, { "key": "Indrasiri2021", "section": "4 Data Service Pattern (As having a negative impact because multiple services should not access the same data);" }, { "key": "Ruecker2021", "section": "2 Different Workflow Engines for different services" }, { "key": "Goniwada2021", "section": "5 Distributed State, Decentralized Data" }],
            "measures": []
        },
        "addressingAbstraction": {
            "name": "Addressing abstraction",
            "description": "By abstracting from specific addresses for reaching other components, address changes can be handled automatically without impacting the link between components. This can be achieved for example through service discovery where components are addressed through abstract service names and specific addresses are resolved through service discovery.",
            "relevantEntities": ["link", "backingService"],
            "sources": [{ "key": "Davis2019", "section": "8.3" }, { "key": "Ibryam2020", "section": "12 Service Discovery" }, { "key": "Richardson2019", "section": "Using service discovery" }, { "key": "Garrison2017", "section": "7 Service Discovery" }, { "key": "Indrasiri2021", "section": "3 Service Registry and Discovery Pattern" }, { "key": "Bastani2017", "section": "7 Routing (Use service discovery with support for health checks and respect varying workloads)" }, { "key": "Indrasiri2021", "section": "3 Service Abstraction Pattern (Use an abstraction layer in front of services (for example Kubernetes Service))" }, { "key": "Goniwada2021", "section": "4 Service Discovery" }],
            "measures": []
        },
        "sparcity": {
            "name": "Sparsity",
            "description": "The more sparse a system is, that means the less components there are, the more simple it is in general",
            "relevantEntities": ["system", "component", "infrastructure"],
            "sources": [],
            "measures": []
        },
        "operationOutsourcing": {
            "name": "Operation outsourcing",
            "description": "By outsourcing the operation of infrastructure and components to a cloud provider or other vendor, the operation is simplified because responsibility is transferred. Furthermore, costs can be made more flexible because providers and vendors can provide a usage-based pricing.",
            "relevantEntities": ["backingService", "infrastructure"],
            "sources": [],
            "measures": []
        },
        "managedInfrastructure": {
            "name": "Managed infrastructure",
            "description": "Infrastructure such as basic computing, storage or network resources can be managed by vendors to ensure a stable functioning and up-to-date functionalities. Furthermore, it reduces the operational overhead.",
            "relevantEntities": ["infrastructure"],
            "sources": [],
            "measures": []
        },
        "managedBackingServices": {
            "name": "Managed backing services",
            "description": "Especially backing services that provide non-business functionality can be managed by vendors to ensure a stable functioning and up-to-date functionalities. Furthermore, it reduces the operational overhead.",
            "relevantEntities": ["backingService"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Managed Databases and Analytics Services" }, { "key": "Arundel2019", "section": "15 Don't build your own monitoring infrastructure (Use an external monitoring service)" }, { "key": "Bastani2017", "section": "10 managed and automated messaging system (operating your own messaging system increases operational overhead, better use a system managed by a platform)" }],
            "measures": []
        },
        "replication": {
            "name": "Replication",
            "description": "In a cloud-native application business logic and needed data should be replicated at various points in a system so that latencies can be minimized and requests can be distributed for fast request handling.",
            "relevantEntities": ["system", "component"],
            "sources": [],
            "measures": []
        },
        "serviceReplication": {
            "name": "Service replication",
            "description": "In a cloud-native application services and therefore their provided functionalities should be replicated across different locations so that the latency for accesses from different locations is minimized and the incoming load can be distributed among replicas.",
            "relevantEntities": ["service"],
            "sources": [],
            "measures": []
        },
        "horizontalDataReplication": {
            "name": "Horizontal data replication",
            "description": "Data should be replicated horizontally, that means duplicated across several data storage components so that higher load can be handled and replicas closer to the service where data is needed can be used to reduce latency.",
            "relevantEntities": ["storageBackingService", "dataAggregate"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Data Partitioning and Replication for Scale" }, { "key": "Goniwada2021", "section": "4 Data Replication" }],
            "measures": []
        },
        "verticalDataReplication": {
            "name": "Vertical data replication",
            "description": "Data should be replicated vertically, that means across a request trace so that it is available closer to where a request initially comes in. Typically caching is used for vertical data replication.",
            "relevantEntities": ["service", "dataAggregate"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Caching" }, { "key": "Bastani2017", "section": "9 Caching (Use an In-Memory cache for queries to relieve datastore from traffic; replication into faster data storage)" }, { "key": "Indrasiri2021", "section": "4 Caching Pattern" }],
            "measures": []
        },
        "shardedDataStoreReplication": {
            "name": "Sharded data store replication",
            "description": "Data should be sharded, that means split into several storage components by a reasonable strategy so that requests can be distributed across shards to increase performance, because one storage component is not as easily overloaded with requests.",
            "relevantEntities": ["storageBackingService", "dataAggregate"],
            "sources": [{ "key": "Indrasiri2014", "section": "4 Data Sharding Pattern" }, { "key": "Goniwada2021", "section": "4 Data Partitioning Pattern" }],
            "measures": []
        },
        "enforcementOfAppropriateResourceBoundaries": {
            "name": "Enforcement of appropriate resource boundaries",
            "description": "In cloud-native applications, the resources required by a component should be predictable as precisely as possible and specified accordingly for each component in terms of lower and upper boundaries. Resources include CPU, memory, GPU, or Network requirements. This information should be used by the infrastructure to enforce these resource boundaries. Thereby it is ensured that a component has the resources available that it needs to function properly, that the infrastructure can optimize the amount of allocated resource, and that components are not negatively impacted by defective components which excessively consume resources.",
            "relevantEntities": ["component"],
            "sources": [{ "key": "Scholl2019", "section": "6 Define CPU and Memory Limits for Your Containers" },{ "key": "Arundel2019", "section": "5 Resource Limits" },{ "key": "Ibryam2020", "section": "2 Defined Resource requirements" },{ "key": "Arundel2019", "section": "5 Resource Quotas (limit maximum resources for a namespace)" },{ "key": "Goniwada2021", "section": "3 Runtime Confinement Principle, 6 Predictable Demands" }],
            "measures": []
        },
        "built-InAutoscaling": {
            "name": "Built-in autoscaling",
            "description": "In a cloud-native application, autoscaling of components should be automated and ideally built-in into the infrastructure to reduce the operational effort for scaling. Autoscaling should be based on appropriate rules so that resurce utilization is optimized. The automated scaling also has to account for a services’ dependencies.",
            "relevantEntities": ["component", "infrastructure"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Platform Autoscaling Features" },{ "key": "Ibryam2020", "section": "24 Elastic Scale" },{ "key": "Bastani2017", "section": "13 Autoscaling" },{ "key": "Indrasiri2021", "section": "1 Why container orchestration?; Scaling" },{ "key": "Goniwada2021", "section": "5 Elasticity in Microservices" }],
            "measures": []
        },
        "infrastructureAbstraction": {
            "name": "Infrastructure abstraction",
            "description": "In a cloud-native application the used infrastructure should be abstracted by clear boundaries to decouple the system from physical hardware or also virtual hardware to minimize the effort and risk involved with managing infrastructure.",
            "relevantEntities": ["service", "infrastructure"],
            "sources": [{ "key": "Bastani2017", "section": "14 Service Brokers (make use of service brokers as an additional level of abstraction to automatically add or remove backing services)" },{ "key": "Goniwada2021", "section": "3 Location-Independent Principle" }],
            "measures": []
        },
        "cloudVendorAbstraction": {
            "name": "Cloud vendor abstraction",
            "description": "In a cloud-native application the infrastructure and services offered by a cloud provider should be abstracted with a unifying boundary to enable portability across different cloud vendors.",
            "relevantEntities": ["service", "infrastructure"],
            "sources": [{ "key": "Wimm2017", "section": "3 Infrastructure and the Cloud Provider Interface" },{ "key": "Indrasiri2021", "section": "1 Dynamic Management; Multicloud support" }],
            "measures": []
        },
        "configurationManagement": {
            "name": "Configuration management",
            "description": "Configuration values which are specific to an environment should be managed separately in a consistent way. Through this, components are more portable across environments and configuration can change independently from components.",
            "relevantEntities": ["component", "backingData"],
            "sources": [],
            "measures": []
        },
        "isolatedConfiguration": {
            "name": "Isolated configuration",
            "description": "Following DevOps principles, environment-specific configurations should be separated from component artifacts (e.g. deployment units) and provided by the environment in which a cloud-native application runs. This enables adaptability across environments (also across testing and production environments)",
            "relevantEntities": ["service", "backingData"],
            "sources": [{ "key": "Davis2019", "section": "6.2 The app's configuration layer" },{ "key": "Ibryam2020", "section": "18" },{ "key": "Scholl2019", "section": "6 Never Store Secrets or Configuration Inside an Image" },{ "key": "Adkins2019", "section": "14 Treat Configuration as Code" },{ "key": "Indrasiri2021", "section": " Decoupled Configurations" }],
            "measures": []
        },
        "configurationStoredInSpecializedServices": {
            "name": "Configuration stored in specialized services",
            "description": "Configuration values are stored in specialized backing services and not only environment variables for example. That way, changing configurations at runtime is facilitated and can be enabled by connecting components to such specialized backing services and checking for updated configurations at runtime. Additionally, configurations can be stored once, but accessed by different components.",
            "relevantEntities": ["service", "backingData", "backingService"],
            "sources": [{ "key": "Ibryam2020", "section": "19 Configuration Resource" },{ "key": "Richardson2019", "section": "11.2 “Designing configurable services" },{ "key": "Arundel2019", "section": "10 ConfigMaps" },{ "key": "Bastani2017", "section": "2 Centralized, Journaled Configuration" },{ "key": "Bastani2017", "section": "2 Refreshable Configuration" }],
            "measures": []
        },
        "contract-BasedLinks": {
            "name": "Contract-based links",
            "description": "Contracts are defined for the communication via links so that changes to endpoints can be evaluated by their impact on the contract and delayed when a contract would be broken. That way consumers of endpoints can adapt to changes when necessary without suddenly breaking communication via a link due to a changed endpoint.",
            "relevantEntities": ["service", "endpoint", "link"],
            "sources": [{ "key": "Bastani2017", "section": "4 Consumer-Driven Contract Testing (Use contracts for APIs to test against)" }],
            "measures": []
        },
        "standardizedSelf-containedDeploymentUnit": {
            "name": "Standardized self-contained deployment unit",
            "description": "The components of a cloud-native applications should be deployed as standardized self-contained units so that the same artifact can reliably be installed and run in different environments and on different infrastructure.",
            "relevantEntities": ["component"],
            "sources": [{ "key": "Reznik2019", "section": "10 Containerized Apps" },{ "key": "Adkins2019", "section": "7 Use Containers (smaller deployments, separated operating system, portable);" },{ "key": "Indrasiri2021", "section": "1 Use Containerization and Container Orchestration" },{ "key": "Garrison2017", "section": "7 Application Runtime and Isolation" },{ "key": "Goniwada2021", "section": "3 Deploy Independently Principle (deploy services in independent containers), Self-Containment Principle, 5 Containerization" }],
            "measures": []
        },
        "immutableArtifacts": {
            "name": "Immutable artifacts",
            "description": "Infrastructure and components of a system are defined and described in its entirety at development time so that artifacts are immutable at runtime. This means upgrades are introduced at runtime through replacement of components instead of modification. Furthermore components do not differ across environments and in case of replication all replicas are identical to avoid unexpected behavior.",
            "relevantEntities": ["service", "infrastructure"],
            "sources": [{ "key": "Scholl2019", "section": "6 Don't Modify Deployed Infrastructure" },{ "key": "Indrasiri2021", "section": "1 Containerization" },{ "key": "Goniwada2021", "section": "3 Process Disposability Principle, Image Immutability Principle" }],
            "measures": []
        },
        "guardedIngress": {
            "name": "Guarded ingress",
            "description": "Ingress communication, that means communication coming from the outside of a system, needs to be guarded. It should be ensured that access is controlled and that a system is not maliciously overwhelmed.",
            "relevantEntities": ["service", "endpoint"],
            "sources": [{ "key": "Scholl2019", "section": "6 Implement Rate Limiting and Throttling" },{ "key": "Adkins2019", "section": "8 Throttling (Delaying processing or responding to remain functional and decrease traffic from individual clients) (should be automated, part of graceful degradation)" },{ "key": "Adkins2019", "section": "8 Load shedding (In case of traffic spike, deny low priority requests to remain functional) (should be automated, part of graceful degradation)" },{ "key": "Goniwada2021", "section": "5 Throttling " }],
            "measures": []
        },
        "distribution": {
            "name": "Distribution",
            "description": "In cloud-native applications components should be distributed across locations and data centers for availability, reliability, and performance.",
            "relevantEntities": ["service", "infrastructure"],
            "sources": [],
            "measures": []
        },
        "physicalDataDistribution": {
            "name": "Physical data distribution",
            "description": "Storage Backing Service instances where Data aggregates are persisted are distributed across physical locations (e.g. availability zones of a cloud vendor) so that even in the case of a failure of one physical location, another physical location is still useable.",
            "relevantEntities": ["storageBackingService", "infrastructure"],
            "sources": [{ "key": "Scholl2019", "section": "6 Keep Data in Multiple Regions or Zones" },{ "key": "Indrasiri2021", "section": "4 Data Sharding Pattern: Geographically distribute data" }],
            "measures": []
        },
        "physicalServiceDistribution": {
            "name": "Physical service distribution",
            "description": "Components are distributed through replication across physical locations (e.g. availability zones of a cloud vendor) so that even in the case of a failure of one physical location, another physical location is still useable.",
            "relevantEntities": ["component", "infrastructure"],
            "sources": [{ "key": "Winn2017", "section": "2 Resiliency Through Availability Zones" }],
            "measures": []
        },
        "seamlessUpgrades": {
            "name": "Seamless upgrades",
            "description": "Upgrades of services should not interfere with availability. There are different strategies, like rolling upgrades, to achieve this which should be provided as a capability by the infrastructure.",
            "relevantEntities": ["component"],
            "sources": [],
            "measures": []
        },
        "rollingUpgradesEnabled": {
            "name": "Rolling upgrades enabled",
            "description": "The infrastructure on which components are deployed provides the ability for rolling upgrades. That means upgrades of components can be performed seamlessly in an automated manner. Seamlessly means that upgrades of components do not necessitate planned downtime.",
            "relevantEntities": ["component", "infrastructure"],
            "sources": [{ "key": "Davis2019", "section": "7.2" },{ "key": "Scholl2019", "section": "6 Use Zero-Downtime Releases" },{ "key": "Ibryam2020", "section": "3 Declarative Deployment" },{ "key": "Reznik2019", "section": "10 Risk-Reducing Deployment Strategies" },{ "key": "Arundel2019", "section": "13 Rolling Updates" },{ "key": "Indrasiri2021", "section": "1 Why container orchestration?; Rolling upgrades" }],
            "measures": []
        },
        "automatedInfrastructureMaintenance": {
            "name": "Automated infrastructure maintenance",
            "description": "The used infrastructure should automate regular maintenance tasks as much as possible in a way that the operation of components is not impacted by these tasks. Such tasks include updates of operating systems, standard libraries, and middleware managed by the infrastructure, but also certificate regeneration.",
            "relevantEntities": ["infrastructure"],
            "sources": [{ "key": "Reznik2019", "section": "10 Automated Infrastructure" },{ "key": "Goniwada2021", "section": "5 Automation" }],
            "measures": []
        },
        "autonomousFaultHandling": {
            "name": "Autonomous fault handling",
            "description": "In cloud-native applications services should expect faults at different levels and either handle them or minimize their impact by relying on the capabilities of cloud environments.",
            "relevantEntities": ["service", "link", "infrastructure"],
            "sources": [],
            "measures": []
        },
        "invocationTimeouts": {
            "name": "Invocation timeouts",
            "description": "For links between components, timeouts should be defined to avoid infinite waiting on a service that is unavailable and a timely handling of problems.",
            "relevantEntities": ["link"],
            "sources": [{ "key": "Indrasiri2021", "section": "3 Resilient Connectivity Pattern: Time-out" },{ "key": "Richardson2019", "section": "3.2.3 Handling partial failures using the Circuit Breaker pattern" },{ "key": "Goniwada2021", "section": "5 Timeout" }],
            "measures": []
        },
        "retriesForSafeInvocations": {
            "name": "Retries for safe invocations",
            "description": "Links that are safe to invoke multiple times without leading to unintended state changes, are automatically retried in case of errors to transparently handle transient faults in communication. That way faults can be prevented from being propagated higher up in a request trace.",
            "relevantEntities": ["link"],
            "sources": [{ "key": "Davis2019", "section": "9.1" },{ "key": "Scholl2019", "section": "6 Handle Transient Failures with Retries" },{ "key": "Scholl2019", "section": "6 Use a Finite Number of Retries" },{ "key": "Bastani2017", "section": "12 Isolating Failures and Graceful Degradation: Use retries" },{ "key": "Indrasiri2021", "section": "3 Resilient Connectivity Pattern: Retry" },{ "key": "Ruecker2021", "section": "9 Synchronous Request/Response (Use retries in synchronous communications)" },{ "key": "Ruecker2021", "section": "9 The Importance of Idempotency (Communication which is retried needs idempotency)" },{ "key": "Goniwada2021", "section": "Idempotent Service Operation, Retry, 5 Retry " }],
            "measures": []
        },
        "circuitBreakedCommunication": {
            "name": "Circuit breaked communication",
            "description": "For links a circuit breaker implementation is used which avoids unnecessary communication and therefore waiting time if a communication is known to fail. Instead the circuit breaker immediately returns an error response of a default response, is possible, while periodically retrying communication in the background",
            "relevantEntities": ["link"],
            "sources": [{ "key": "Davis2019", "section": "10.1" },{ "key": "Scholl2019", "section": "6 Use Circuit Breakers for Nontransient Failures" },{ "key": "Richardson2019", "section": "3.2.3 Handling partial failures using the Circuit Breaker pattern" },{ "key": "Bastani2017", "section": "12 Isolating Failures and Graceful Degradation: circuit breaker" },{ "key": "Indrasiri2021", "section": "3 Resilient Connectivity Pattern: Circuit breaker" },{ "key": " Goniwada2021", "section": "4 Circuit Breaker" }],
            "measures": []
        },
        "automatedRestarts": {
            "name": "Automated restarts",
            "description": "When a component is found to be unhealthy, that means not functioning as expected, it is directly and automatically restarted. Ideally this capability is provided by the infrastructure on which a component is running.",
            "relevantEntities": ["component"],
            "sources": [{ "key": "Winn2017", "section": "2 Self-Healing Processes; Self-Healing VMs" },{ "key": "Bastani2017", "section": "13 automatic remediation" },{ "key": "Indrasiri2021", "section": "1 Why container orchestration?; High availability" },{ "key": "Goniwada2021", "section": "5 Self-Healing" }],
            "measures": []
        },
        "api-BasedCommunication": {
            "name": "API-based communication",
            "description": "All endpoints that are offered by a service are part of a well-defined and documented API. That means, the APIs are based on common principles, are declarative instead of imperative, and are documented in a standardized or specified format (such as the OpenAPI specification). Communication only happens via endpoints that are part of such APIs and can be both synchronous or asynchronous.",
            "relevantEntities": ["service", "endpoint", "link"],
            "sources": [{ "key": "Reznik2019", "section": "9 Communicate Through APIs" },{ "key": "Adkins2019", "section": "6 Understandable Interface Specifications (Use Interface specifications for understandability" },{ "key": "Bastani2017", "section": "6 Everything is an API (Services are integrated via APIs)" },{ "key": "Indrasiri2021", "section": "2 Service Definitions in Synchronous Communication (Use a service definition for each service);" },{ "key": "Indrasiri2021", "section": "2 Service Definition in Asynchronous Communication (Use schemas to define message formats);" },{ "key": "Goniwada2021", "section": "3 API First Principle" }],
            "measures": []
        },
        "mediatedCommunication": {
            "name": "Mediated communication",
            "description": "Communication from one component via a link is mediated through additional components so that there is no direct dependence on the other communication partner and additional operations can be performed to manage the communication, also in a centrally and consistently configurable way. Such operations can for example be access control, load balancing, retries, or monitoring.",
            "relevantEntities": ["component", "link"],
            "sources": [{ "key": "Indrasiri2021", "section": "3 Sidecar Pattern, Service Mesh Pattern, Service Abstraction Pattern (Proxy communication with services to include service discovery and load balancing)" },{ "key": "Davis2019", "section": "10.3" },{ "key": "Richardson2019", "section": "11.4.2" }],
            "measures": []
        }
    },
    "impacts": [
        { "impactedFactor": "secretsManagement", "sourceFactor": "secretsStoredInSpecializedServices", "impactType": "positive" },
        { "impactedFactor": "confidentiality", "sourceFactor": "dataEncryptionInTransit", "impactType": "positive" },
        { "impactedFactor": "confidentiality", "sourceFactor": "secretsManagement", "impactType": "positive" },
        { "impactedFactor": "secretsManagement", "sourceFactor": "isolatedSecrets", "impactType": "positive" },
        { "impactedFactor": "integrity", "sourceFactor": "accessRestriction", "impactType": "positive" },
        { "impactedFactor": "accessRestriction", "sourceFactor": "leastPrivilegedAccess", "impactType": "positive" },
        { "impactedFactor": "accessRestriction", "sourceFactor": "accessControlManagementConsistency", "impactType": "positive" },
        { "impactedFactor": "accountability", "sourceFactor": "accountSeparation", "impactType": "positive" },
        { "impactedFactor": "authenticity", "sourceFactor": "authenticationDelegation", "impactType": "positive" },
        { "impactedFactor": "modularity", "sourceFactor": "serviceOrientation", "impactType": "positive" },
        { "impactedFactor": "serviceOrientation", "sourceFactor": "limitedFunctionalScope", "impactType": "positive" },
        { "impactedFactor": "limitedFunctionalScope", "sourceFactor": "limitedDataScope", "impactType": "positive" },
        { "impactedFactor": "limitedFunctionalScope", "sourceFactor": "limitedEndpointScope", "impactType": "positive" },
        { "impactedFactor": "limitedFunctionalScope", "sourceFactor": "commandQueryResponsibilitySegregation", "impactType": "positive" },
        { "impactedFactor": "simplicity", "sourceFactor": "commandQueryResponsibilitySegregation", "impactType": "negative" },
        { "impactedFactor": "serviceOrientation", "sourceFactor": "separationByGateways", "impactType": "positive" },
        { "impactedFactor": "seamlessUpgrades", "sourceFactor": "separationByGateways", "impactType": "positive" },
        { "impactedFactor": "availability", "sourceFactor": "seamlessUpgrades", "impactType": "positive" },
        { "impactedFactor": "modularity", "sourceFactor": "isolatedState", "impactType": "positive" },
        { "impactedFactor": "replaceability", "sourceFactor": "isolatedState", "impactType": "positive" },
        { "impactedFactor": "elasticity", "sourceFactor": "isolatedState", "impactType": "positive" },
        { "impactedFactor": "isolatedState", "sourceFactor": "mostlyStatelessServices", "impactType": "positive" },
        { "impactedFactor": "testability", "sourceFactor": "mostlyStatelessServices", "impactType": "positive" },
        { "impactedFactor": "isolatedState", "sourceFactor": "specializedStatefulServices", "impactType": "positive" },
        { "impactedFactor": "modularity", "sourceFactor": "looseCoupling", "impactType": "positive" },
        { "impactedFactor": "looseCoupling", "sourceFactor": "asynchronousCommunication", "impactType": "positive" },
        { "impactedFactor": "looseCoupling", "sourceFactor": "communicationPartnerAbstraction", "impactType": "positive" },
        { "impactedFactor": "analyzability", "sourceFactor": "communicationPartnerAbstraction", "impactType": "negative" },
        { "impactedFactor": "faultTolerance", "sourceFactor": "persistentCommunication", "impactType": "positive" },
        { "impactedFactor": "simplicity", "sourceFactor": "usageOfExistingSolutionsForNon-CoreCapabilities", "impactType": "positive" },
        { "impactedFactor": "reusability", "sourceFactor": "standardization", "impactType": "positive" },
        { "impactedFactor": "standardization", "sourceFactor": "componentSimilarity", "impactType": "positive" },
        { "impactedFactor": "analyzability", "sourceFactor": "automatedMonitoring", "impactType": "positive" },
        { "impactedFactor": "automatedMonitoring", "sourceFactor": "consistentCentralizedLogging", "impactType": "positive" },
        { "impactedFactor": "accountability", "sourceFactor": "consistentCentralizedLogging", "impactType": "positive" },
        { "impactedFactor": "automatedMonitoring", "sourceFactor": "consistentCentralizedMetrics", "impactType": "positive" },
        { "impactedFactor": "automatedMonitoring", "sourceFactor": "distributedTracingOfInvocations", "impactType": "positive" },
        { "impactedFactor": "automatedMonitoring", "sourceFactor": "healthAndReadinessChecks", "impactType": "positive" },
        { "impactedFactor": "automatedRestarts", "sourceFactor": "healthAndReadinessChecks", "impactType": "positive" },
        { "impactedFactor": "availability", "sourceFactor": "healthAndReadinessChecks", "impactType": "positive" },
        { "impactedFactor": "modifiability", "sourceFactor": "automatedInfrastructureProvisioning", "impactType": "positive" },
        { "impactedFactor": "installability", "sourceFactor": "automatedInfrastructureProvisioning", "impactType": "positive" },
        { "impactedFactor": "modifiability", "sourceFactor": "useInfrastructureAsCode", "impactType": "positive" },
        { "impactedFactor": "adaptability", "sourceFactor": "useInfrastructureAsCode", "impactType": "positive" },
        { "impactedFactor": "reusability", "sourceFactor": "useInfrastructureAsCode", "impactType": "positive" },
        { "impactedFactor": "recoverability", "sourceFactor": "useInfrastructureAsCode", "impactType": "positive" },
        { "impactedFactor": "modifiability", "sourceFactor": "serviceIndependence", "impactType": "positive" },
        { "impactedFactor": "serviceIndependence", "sourceFactor": "lowCoupling", "impactType": "positive" },
        { "impactedFactor": "serviceIndependence", "sourceFactor": "functionalDecentralization", "impactType": "positive" },
        { "impactedFactor": "serviceIndependence", "sourceFactor": "limitedRequestTraceScope", "impactType": "positive" },
        { "impactedFactor": "serviceIndependence", "sourceFactor": "logicalGrouping", "impactType": "positive" },
        { "impactedFactor": "serviceIndependence", "sourceFactor": "backingServiceDecentralization", "impactType": "positive" },
        { "impactedFactor": "modifiability", "sourceFactor": "addressingAbstraction", "impactType": "positive" },
        { "impactedFactor": "replaceability", "sourceFactor": "addressingAbstraction", "impactType": "positive" },
        { "impactedFactor": "simplicity", "sourceFactor": "sparcity", "impactType": "positive" },
        { "impactedFactor": "simplicity", "sourceFactor": "operationOutsourcing", "impactType": "positive" },
        { "impactedFactor": "operationOutsourcing", "sourceFactor": "managedInfrastructure", "impactType": "positive" },
        { "impactedFactor": "operationOutsourcing", "sourceFactor": "managedBackingServices", "impactType": "positive" },
        { "impactedFactor": "operationOutsourcing", "sourceFactor": "managedBackingServices", "impactType": "positive" },
        { "impactedFactor": "resourceUtilization", "sourceFactor": "dynamicScheduling", "impactType": "positive" },
        { "impactedFactor": "timeBehaviour", "sourceFactor": "replication", "impactType": "positive" },
        { "impactedFactor": "replication", "sourceFactor": "serviceReplication", "impactType": "positive" },
        { "impactedFactor": "availability", "sourceFactor": "serviceReplication", "impactType": "positive" },
        { "impactedFactor": "replication", "sourceFactor": "horizontalDataReplication", "impactType": "positive" },
        { "impactedFactor": "replication", "sourceFactor": "verticalDataReplication", "impactType": "positive" },
        { "impactedFactor": "analyzability", "sourceFactor": "verticalDataReplication", "impactType": "negative" },
        { "impactedFactor": "availability", "sourceFactor": "verticalDataReplication", "impactType": "positive" },
        { "impactedFactor": "replication", "sourceFactor": "shardedDataStoreReplication", "impactType": "positive" },
        { "impactedFactor": "resourceUtilization", "sourceFactor": "enforcementOfAppropriateResourceBoundaries", "impactType": "positive" },
        { "impactedFactor": "availability", "sourceFactor": "enforcementOfAppropriateResourceBoundaries", "impactType": "positive" },
        { "impactedFactor": "availability", "sourceFactor": "built-InAutoscaling", "impactType": "positive" },
        { "impactedFactor": "elasticity", "sourceFactor": "built-InAutoscaling", "impactType": "positive" },
        { "impactedFactor": "adaptability", "sourceFactor": "infrastructureAbstraction", "impactType": "positive" },
        { "impactedFactor": "adaptability", "sourceFactor": "cloudVendorAbstraction", "impactType": "positive" },
        { "impactedFactor": "reusability", "sourceFactor": "cloudVendorAbstraction", "impactType": "positive" },
        { "impactedFactor": "adaptability", "sourceFactor": "configurationManagement", "impactType": "positive" },
        { "impactedFactor": "configurationManagement", "sourceFactor": "isolatedConfiguration", "impactType": "positive" },
        { "impactedFactor": "configurationManagement", "sourceFactor": "configurationStoredInSpecializedServices", "impactType": "positive" },
        { "impactedFactor": "adaptability", "sourceFactor": "contract-BasedLinks", "impactType": "positive" },
        { "impactedFactor": "installability", "sourceFactor": "standardizedSelf-containedDeploymentUnit", "impactType": "positive" },
        { "impactedFactor": "replaceability", "sourceFactor": "immutableArtifacts", "impactType": "positive" },
        { "impactedFactor": "availability", "sourceFactor": "guardedIngress", "impactType": "positive" },
        { "impactedFactor": "availability", "sourceFactor": "distribution", "impactType": "positive" },
        { "impactedFactor": "distribution", "sourceFactor": "physicalDataDistribution", "impactType": "positive" },
        { "impactedFactor": "distribution", "sourceFactor": "physicalServiceDistribution", "impactType": "positive" },
        { "impactedFactor": "seamlessUpgrades", "sourceFactor": "rollingUpgradesEnabled", "impactType": "positive" },
        { "impactedFactor": "availability", "sourceFactor": "automatedInfrastructureMaintenance", "impactType": "positive" },
        { "impactedFactor": "recoverability", "sourceFactor": "automatedInfrastructureMaintenance", "impactType": "positive" },
        { "impactedFactor": "faultTolerance", "sourceFactor": "autonomousFaultHandling", "impactType": "positive" },
        { "impactedFactor": "autonomousFaultHandling", "sourceFactor": "invocationTimeouts", "impactType": "positive" },
        { "impactedFactor": "autonomousFaultHandling", "sourceFactor": "retriesForSafeInvocations", "impactType": "positive" },
        { "impactedFactor": "autonomousFaultHandling", "sourceFactor": "circuitBreakedCommunication", "impactType": "positive" },
        { "impactedFactor": "recoverability", "sourceFactor": "automatedRestarts", "impactType": "positive" },
        { "impactedFactor": "interoperability", "sourceFactor": "api-BasedCommunication", "impactType": "positive" },
        { "impactedFactor": "testability", "sourceFactor": "api-BasedCommunication", "impactType": "positive" },
        { "impactedFactor": "interoperability", "sourceFactor": "mediatedCommunication", "impactType": "positive" },
        { "impactedFactor": "timeBehaviour", "sourceFactor": "mediatedCommunication", "impactType": "negative" },
        { "impactedFactor": "analyzability", "sourceFactor": "mediatedCommunication", "impactType": "positive" }
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
        },
        "RatioOfEndpointsThatSupportTokenBasedAuthentication": {
            "name": "Ratio of endpoints that support token-based authentication ",
            "calculation": "Endpoints supportin tokens / All endpoints",
            "sources": ["Ntentos2022", "Zdun2023"]
        }
    }
}