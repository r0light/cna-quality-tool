type QualityModelSpec = {
    qualityAspects: { [highLevelAspectKey: string]: HighLevelQualityAspecSpec},
    factorCategories: { [categoryKey: string]: CategorySpec},
    productFactors: { [productFatorKey: string]: ProductFactorSpec},
    impacts: ImpactSpec[],
    measures: { [measureKey: string]: MeasureSpec},
    productFactorEvaluations: ProductFactorEvaluationSpec[],
    qualityAspectEvaluations: QualityAspectEvaluationSpec[]

}

type HighLevelQualityAspecSpec = {
    name: string,
    aspects: { [aspectKey: string]: QualityAspectSpec}
}

type QualityAspectSpec = {
    name: string,
    description: string
}

type CategorySpec = {
    name: string
}

type ProductFactorSpec = {
        name: string,
        description: string,
        categories: string[],
        relevantEntities: string[],
        sources: SourceSpec[],
        measures: string[]
}

type SourceSpec = {
    key: string,
    section: string
}

type ImpactSpec = {
    impactedFactor: string, 
    sourceFactor: string,
    impactType: string
}

type MeasureSpec = {
    name: string,
    calculation: string,
    sources : string[]
}

type ProductFactorEvaluationSpec = {
    targetFactor: string,
    evaluation: string,
    reasoning: string
}

type QualityAspectEvaluationSpec = {
    targetAspect: string,
    evaluation: string,
    reasoning: string
}

export const qualityModel: QualityModelSpec = {
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
    "factorCategories": {
        "cloudInfrastructure": {
            "name": "Cloud Infrastructure"
        },
        "networkCommunication": {
            "name": "Network Communication"
        },
        "applicationAdministration": {
            "name": "Application Administration"
        },
        "dataManagement": {
            "name": "Data Management"
        },
        "businessDomain": {
            "name": "Business Domain"
        }
    },
    "productFactors": {
        "dataEncryptionInTransit": {
            "name": "Data encryption in transit",
            "description": "Data which is sent or received through a link from one component to or from an endpoint of another component is encrypted so that even when an attacker has access to the network layer, the data is protected.",
            "categories": ["networkCommunication"],
            "relevantEntities": ["link", "endpoint"],
            "sources": [
                { "key": "Scholl2019", "section": "6 Encrypt Data in Transit" },
                { "key": "Indrasiri2021", "section": "2 Security (Use TLS for synchronous communications)" }
            ],
            "measures": ["ratioOfEndpointsSupportingSsl", "ratioOfExternalEndpointsSupportingTls", "ratioOfSecuredLinks"]
        },
        "secretsManagement": {
            "name": "Secrets management",
            "description": "Secrets (e.g. passwords, access tokens, encryption keys) which allow access to other components or data are managed specifically to make sure they stay confidential and only authorized components or persons can access them. Managed in this case refers to where and how secrets are stored and how components which need them can access them.",
            "categories": ["applicationAdministration", "cloudInfrastructure", "dataManagement"],
            "relevantEntities": ["component"],
            "sources": [],
            "measures": []
        },
        "isolatedSecrets": {
            "name": "Isolated secrets",
            "description": "Secrets (e.g. passwords, access tokens, encryption keys) are not stored in component artifacts (e.g. binaries, images). Instead, secrets are stored for example in the deployment environment and components are given access at runtime only to those secrets which they actually need and only when they need it.",
            "categories": ["applicationAdministration"],
            "relevantEntities": ["component", "backingData"],
            "sources": [{ "key": "Scholl2019", "section": "6 Never Store Secrets or Configuration Inside an Image" }, { "key": "Adkins2019", "section": "14 Don't Check In Secrets" }],
            "measures": []
        },
        "secretsStoredInSpecializedServices": {
            "name": "Secrets stored in specialized services",
            "description": "A dedicated backing service to host secrets (e.g. passwords, access tokens, encryption keys) exists. All secrets required by a system are hosted in this backing service where they can also be managed (for example they can be revoked or replaced with updated secrets). Components fetch secrets from this backing services in a controlled way when they need them.",
            "categories": ["cloudInfrastructure", "dataManagement"],
            "relevantEntities": ["service", "backingService", "backingData"],
            "sources": [{ "key": "Scholl2019", "section": "6 Securely Store All Secrets" },
            { "key": "Arundel2019", "section": "10 Kubernetes Secrets" }
            ],
            "measures": []
        },
        "accessRestriction": {
            "name": "Access restriction",
            "description": "Access to components is restricted to those who actually need it. Also, within a system access controls are put in place to have multiple layers of defense. A dedicated component to manage access policies can be used.",
            "categories": ["networkCommunication", "applicationAdministration"],
            "relevantEntities": ["component", "endpoint"],
            "sources": [],
            "measures": []
        },
        "leastPrivilegedAccess": {
            "name": "Least-privileged access",
            "description": "Access to endpoints is given as restrictive as possible so that only components who really need it can access an endpoint.",
            "categories": ["networkCommunication", "applicationAdministration"],
            "relevantEntities": ["component", "endpoint"],
            "sources": [{ "key": "Scholl2019", "section": "6 Grant Least-Privileged Access" }, { "key": "Arundel2019", "section": "11 Access Control and Permissions" }],
            "measures": []
        },
        "accessControlManagementConsistency": {
            "name": "Access control management consistency",
            "description": "Access control for endpoints is managed in a consistent way, that means for example always the same format is used for access control lists or a single account directory in a dedicated backing service exists for all components. Access control configurations can then be made always in the same known style and only in a dedicated place. Based on such a consistent access control configuration, also verifications can be performed to ensure that access restrictions are implemented correctly.",
            "categories": ["applicationAdministration", "networkCommunication"],
            "relevantEntities": ["component"],
            "sources": [{ "key": "Adkins2019", "section": "6 Access Control (Access control managed by framework)" }, { "key": "Goniwada2021", "section": "9 Policy as Code (consistently describe your security policies in form of code)" }],
            "measures": ["ratioOfEndpointsThatSupportTokenBasedAuthentication", "ratioOfEndpointsThatSupportApiKeys", "ratioOfEndpointsThatSupportPlaintextAuthentication", "ratioOfEndpointsThatAreIncludedInASingleSignOnApproach"]
        },
        "accountSeparation": {
            "name": "Account separation",
            "description": "Components are separated by assigning them different accounts. Ideally each component has an individual account. Through this, it is possible to trace which component performed which actions and it is possible to restrict access to other components on a fine-grained level, so that for example in the case of an attack, compromised components can be isolated based on their account.",
            "categories": ["applicationAdministration", "businessDomain"],
            "relevantEntities": ["component"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Separate Accounts/Subscriptions/Tenants”" }, { "key": "Adkins2019", "section": "8 Role separation”(let different services run with different roles to restrict access)" }, { "key": "Adkins2019", "section": "8 “Location separation (use different roles for a service in different locations to limit attack impacts)" }],
            "measures": []
        },
        "authenticationDelegation": {
            "name": "Authentication delegation",
            "description": "The verification of an entity for authenticity, for example upon a request, is delegated to a dedicated backing service. This concern is therefore removed from individual components so that their focus can remain on business functionalities while for example different authentication options can be managed in one place only.",
            "categories": ["applicationAdministration", "businessDomain"],
            "relevantEntities": ["system", "backingService"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Federated Identity Management" }, { "key": "Goniwada2021", "section": "9 Decentralized Identity" }],
            "measures": []
        },
        "serviceOrientation": {
            "name": "Service-orientation",
            "description": "Cloud-native applications realize modularity by being service-oriented, that means the system is decomposed into services encapsulating specific functionalities and communicating with each other only through specific interfaces. Commonly, a microservices architectural style is used.",
            "categories": ["businessDomain", "dataManagement", "networkCommunication"],
            "relevantEntities": ["system", "service"],
            "sources": [],
            "measures": []
        },
        "limitedFunctionalScope": {
            "name": "Limited functional scope",
            "description": "Each service covers only a limited, but cohesive functional scope to keep services manageable.",
            "categories": ["businessDomain", "dataManagement"],
            "relevantEntities": ["service", "endpoint"],
            "sources": [{ "key": "Reznik2019", "section": "9 Microservices Architecture" }, { "key": "Adkins2019", "section": "7 Use Microservices" }, { "key": "Goniwada2021", "section": "3 Polylithic Architecture Principle (Build separate services for different business functionalitites) " }],
            "measures": ["totalServiceInterfaceCohesion", "covesivenessOfService", "cohesionOfAServiceBasedOnOtherEndpointsCalled", "lackOfCohesion", "averageLackOfCohesion", "serviceSize", "unreachableEndpointCount"]
        },
        "limitedDataScope": {
            "name": "Limited data scope",
            "description": "The number of data aggregates that are processed in a service is limited to those which need to be administrated together, for example to fulfill data consistency requirements. The aim is to keep the functional scope of a service cohesive. Data aggregates for which consistency requirements can be relaxed might be distributed over separate services.",
            "categories": ["businessDomain", "dataManagement"],
            "relevantEntities": ["service", "dataAggregate"],
            "sources": [],
            "measures": ["dataAggregateScope", "serviceInterfaceDataCohesion", "cohesionBetweenEndpointsBasedOnDataAggregateUsage", "resourceCount"]
        },
        "limitedEndpointScope": {
            "name": "Limited endpoint scope",
            "description": "To keep the functional scope of services limited, the number of endpoints of a service is limited to a cohesive set of endpoints that provide related operations.",
            "categories": ["businessDomain"],
            "relevantEntities": ["service", "endpoint"],
            "sources": [],
            "measures": ["numberOfProvidedSynchronousAndAsynchronousEndpoints", "numberOfSynchronousEndpointsOfferedByAService", "serviceInterfaceUsageCohesion", "distributionOfSynchronousCalls", "cohesionOfEndpointsBasedOnInvocationByOtherServices", "unusedEndpointCount"]
        },
        "commandQueryResponsibilitySegregation": {
            "name": "Command Query Responsibility Segregation",
            "description": "Endpoints for read (query) and write (command) operations on the same data aggregate are separated into different services. Changes to these operations can then be made independently and also different representations for data aggregates can be used. That way operations on data aggregates can be adjusted to differing usage patterns, different format requirements, or if they are changed for different reasons.",
            "categories": ["networkCommunication", "businessDomain"],
            "relevantEntities": ["service", "endpoint"],
            "sources": [{ "key": "Davis2019", "section": "4.4" }, { "key": "Richardson2019", "section": "7.2 Using the CQRS pattern" }, { "key": "Bastani2017", "section": "12 CQRS (Command Query Responsibility Segregation)" }, { "key": "Indrasiri2021", "section": "4 Command and Query Responsibility Segregation Pattern" }, { "key": "Goniwada2021", "section": "4 Command and Query Responsibility Segregation Pattern" }],
            "measures": ["numberOfReadEndpointsProvidedByAService", "numberOfWriteEndpointsProvidedByAService"]
        },
        "separationByGateways": {
            "name": "Separation by gateways",
            "description": "Individual components or groups of components are separated through gateways. That means communication is proxied and controlled at specific gateway components. It also abstracts one part of a system from another so that it can be reused by different components without needing direct links to components that actually provide the needed functionality. This way, communication can also be redirected when component endpoints change without changing the gateway endpoint. Also incoming communication from outside of a system can be directed at external endpoints of a central component (the gateway).",
            "categories": ["networkCommunication", "businessDomain"],
            "relevantEntities": ["system", "component", "endpoint"],
            "sources": [{ "key": "Davis2019", "section": "10.2" },
            { "key": "Richardson2019", "section": "8.2" }, { "key": "Bastani2017", "section": "8 Edge Services: Filtering and Proxying with Netflix Zuul" }, { "key": "Indrasiri2021", "section": "7 API Gateway Pattern" }, { "key": "Indrasiri2021", "section": "7 API Microgateway Pattern (Smaller API microgateways to avoid having a monolithic API gateway)" }, { "key": "Goniwada2021", "section": "4 “Mediator” (Use a mediator pattern between clients and servers)" }],
            "measures": ["externallyAvailableEndpoints", "centralizationOfExternallyAvailableEndpoints", "apiCompositionUtilizationMetric", "ratioOfRequestTracesThroughGateway"]
        },
        "isolatedState": {
            "name": "Isolated state",
            "description": "Services are structured by clearly separating stateless from stateful services. Stateful services should be reduced to a minimum. That way, state is isolated within these specifically stateful services which can be managed accordingly. The majority of stateless services is easier to deploy and modify.",
            "categories": ["dataManagement", "businessDomain"],
            "relevantEntities": ["system", "component", "storageBackingService"],
            "sources": [{ "key": "Goniwada2021", "section": "3 Coupling (Services should be as loosely coupled as possible)" }],
            "measures": []
        },
        "mostlyStatelessServices": {
            "name": "Mostly stateless services",
            "description": "Most services in a system are kept stateless, that means not requiring durable disk space on the infrastructure that they run on. Stateless services can be replaced, updated or replicated at any time. Stateful services are reduced to a minimum.",
            "categories": ["dataManagement", "businessDomain"],
            "relevantEntities": ["component"],
            "sources": [{ "key": "Davis2019", "section": "5.4" }, { "key": "Scholl2019", "section": "6 “Design Stateless Services That Scale Out" }, { "key": "Goniwada2021", "section": "3 Be Smart with State Principle, 5 Stateless Services" }],
            "measures": ["ratioOfStateDependencyOfEndpoints", "ratioOfStatefulComponents", "ratioOfStatelessComponents", "degreeToWhichComponentsAreLinkedToStatefulComponents"]
        },
        "specializedStatefulServices": {
            "name": "Specialized stateful services",
            "description": "For stateful components, that means components that do require durable disk space on the infrastructure that they run on, specialized software or frameworks are used that can handle distributed state by replicating it over several components or component instances while still ensuring consistency requirements for that state.",
            "categories": ["dataManagement", "businessDomain"],
            "relevantEntities": ["component", "storageBackingService"],
            "sources": [{ "key": "Davis2019", "section": "5.4" }, { "key": "Ibryam2020", "section": "11 “Stateful Service”" }],
            "measures": []
        },
        "looseCoupling": {
            "name": "Loose coupling",
            "description": "In cloud-native applications communication between components is loosely coupled in time, location, and language to achieve greater independence.",
            "categories": ["businessDomain", "networkCommunication"],
            "relevantEntities": ["system", "component", "link"],
            "sources": [],
            "measures": []
        },
        "asynchronousCommunication": {
            "name": "Asynchronous communication",
            "description": "Asynchronous links (e.g. based on messaging backing services) are preferred for the communication between components. That way, components are decoupled in time meaning that not all linked components need to be available at the same time for a successful communication. Additionally, callers do not await a response.",
            "categories": ["networkCommunication", "businessDomain"],
            "relevantEntities": ["link"],
            "sources": [{ "key": "Davis2019", "section": "4.2" }, { "key": "Scholl2019", "section": "6 Prefer Asynchronous Communication" }, { "key": "Richardson2019", "section": "3.3.2, 3.4 Using asynchronous messaging to improve availability" }, { "key": "Indrasiri2021", "section": "3 Service Choreography Pattern" }, { "key": "Ruecker2021", "section": "9 Asynchronous Request/Response (Use asynchronous communication to make services more robust)" }, { "key": "Goniwada2021", "section": "4 Asynchronous Nonblocking I/O" }],
            "measures": ["numberOfAsynchronousEndpointsOfferedByAService", "numberOfSynchronousOutgoingLinks", "numberOfAsynchronousOutgoingLinks", "ratioOfAsynchronousOutgoingLinks", "degreeOfAsynchronousCommunication", "asynchronousCommunicationUtilization"]
        },
        "communicationPartnerAbstraction": {
            "name": "Communication partner abstraction",
            "description": "Communication via links is not based on specific communication partners (specific components) but abstracted based on the content of communication. An example is event-driven communication where events are published to channels without the publisher knowing which components receive events and events can therefore also be received by components which are created later in time.",
            "categories": ["networkCommunication"],
            "relevantEntities": ["link", "backingService"],
            "sources": [{ "key": "Richardson2019", "section": "6 Event-driven communication" }, { "key": "Ruecker2021", "section": "8: Event-driven systems “event chains emerge over time and therefore lack visibility." }],
            "measures": ["serviceInteractionWithEventSourcingUtilizationMetric"]
        },
        "persistentCommunication": {
            "name": "Persistent communication",
            "description": "Links persist messages which have been sent (e.g. based on messaging backing services). That way, components are decoupled, because components need not yet exist at the time a message is sent, but can still receive a message. Communication can also be repeated, because persisted messages can be retrieved again.",
            "categories": ["networkCommunication"],
            "relevantEntities": ["link"],
            "sources": [{ "key": "Indrasiri2021", "section": "5 Event Sourcing Pattern: Log-based message brokers" }],
            "measures": ["serviceLinkPersistenceUtilizationMetric", "outboxEventSourcingUtilizationMetric"]
        },
        "usageOfExistingSolutionsForNonCoreCapabilities": {
            "name": "Usage of existing solutions for non-core capabilities",
            "description": "For non-core capabilities readily available solutions are used. This means solutions which are based on a standard or a specification, are widely adopted and ideally open source so that their well-functioning is ensured by a broader community. Non-core capabilities include interface technologies or protocols for endpoints, infrastructure technologies (for example container orchestration engines), and software for backing services. That way capabilities don't need to self-implemented and existing integration options can be used.",
            "categories": ["cloudInfrastructure", "applicationAdministration"],
            "relevantEntities": ["component", "backingService"],
            "sources": [{ "key": "Reznik2019", "section": "9 Avoid Reinventing the Wheel" }, { "key": "Adkins2019", "section": "12 Frameworks to Enforce Security and Reliability" }],
            "measures": []
        },
        "standardization": {
            "name": "Standardization",
            "description": "By using standardized technologies within components, for interfaces, and especially for the infrastructure, backing services and other non-business concerns, reusability can be increased and the effort to develop additional functionality which integrates with existing components can be reduced.",
            "categories": ["applicationAdministration"],
            "relevantEntities": ["system", "component", "link"],
            "sources": [],
            "measures": []
        },
        "componentSimilarity": {
            "name": "Component similarity",
            "description": "The more similar components are, the easier it is for developers to work on an unfamiliar component. Furthermore, similar components can be more easily integrated and maintained in the same way. Similarity considers mainly the libraries and technologies used for implementing service logic and service endpoints, as well as their deployment.",
            "categories": ["applicationAdministration"],
            "relevantEntities": ["component"],
            "sources": [{ "key": "Reznik2019", "section": "9 Reference Architecture" }],
            "measures": []
        },
        "automatedMonitoring": {
            "name": "Automated Monitoring",
            "description": "Cloud-native applications enable monitoring at various levels (business functionalities in services, backing-service functionalities, infrastructure) in an automated fashion to enable observable and autonomous reactions to changing system conditions.",
            "categories": ["applicationAdministration", "businessDomain", "networkCommunication", "dataManagement"],
            "relevantEntities": ["service", "link", "infrastructure"],
            "sources": [{ "key": "Goniwada2021", "section": "3 High Observability Principle" }],
            "measures": ["ratioOfInfrastructureNodesThatSupportMonitoring", "ratioOfComponentsThatSupportMonitoring"]
        },
        "consistentCentralizedLogging": {
            "name": "Consistent centralized logging",
            "description": "Logging functionality, specifically the automated collection of logs, is concentrated in a centralized backing service which combines and stores logs from the components of a system. The logs are kept consistent regarding their format and level of granularity. In the backing service also log analysis functionalities are provided, for example by also enabling a correlation of logs from different components.",
            "categories": ["applicationAdministration", "dataManagement"],
            "relevantEntities": ["service", "backingService"],
            "sources": [{ "key": "Davis2019", "section": "11.1" }, { "key": "Scholl2019", "section": "6 Use a Unified Logging System" }, { "key": "Scholl2019", "section": "6 Common and Structured Logging Format" }, { "key": "Richardson2019", "section": "11.3.2 Applying the Log aggregation pattern" }, { "key": "Reznik2019", "section": "10 Observability" }, { "key": "Garrison2017", "section": "7 Monitoring and Logging" }, { "key": "Adkins2019", "section": "15 Design your logging to be immutable" }, { "key": "Arundel2019", "section": "15 Logging" }, { "key": "Winn2017", "section": "2 Aggregated Streaming of Logs and Metrics" }, { "key": "Bastani2017", "section": "13 Application Logging" }, { "key": "Bastani2017", "section": "13 Audit Events (capture events for audits, like failed logins etc)" }, { "key": "Ruecker2021", "section": "11 Custom Centralized Monitoring" }, { "key": "Goniwada2021", "section": "19 One Source of Truth" }],
            "measures": ["ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService"]
        },
        "consistentCentralizedMetrics": {
            "name": "Consistent centralized metrics",
            "description": "Metrics gathering and calculation functionality for monitoring purposes is concentrated in a centralized component which combines, aggregates and stores metrics from the components of a system. The metrics are kept consistent regarding their format and support multiple levels of granularity. In the backing service also metric analysis functionalities are provided, for example by also enabling correlations of metrics.",
            "categories": ["applicationAdministration", "businessDomain"],
            "relevantEntities": ["service", "backingService"],
            "sources": [{ "key": "Davis2019", "section": "11.2" }, { "key": "Scholl2019", "section": "6 Tag Your Metrics Appropriately" }, { "key": "Richardson2019", "section": "11.3.4 Applying the Applications metrics pattern" }, { "key": "Garrison2017", "section": "7 Monitoring and Logging, Metrics Aggregation" }, { "key": "Reznik2019", "section": "10 Observability" }, { "key": "Arundel2019", "section": "15 Metrics help predict problems" }, { "key": "Winn2017", "section": "2 Aggregated Streaming of Logs and Metrics" }, { "key": "Arundel2019", "section": "15 Logging" }, { "key": "Winn2017", "section": "2 Aggregated Streaming of Logs and Metrics" }, { "key": "Bastani2017", "section": "13 Metrics" }, { "key": "Arundel2019", "section": "16 The RED Pattern (common metrics you should have for services" }, { "key": "Arundel2019", "section": "16 The USE Pattern (common metrics for resources" }, { "key": "Goniwada2021", "section": "19 One Source of Truth" }],
            "measures": ["ratioOfComponentsOrInfrastructureNodesThatExportMetrics", "ratioOfComponentsOrInfrastructureNodesThatEnablePerformanceAnalytics"]
        },
        "distributedTracingOfInvocations": {
            "name": "Distributed tracing of invocations",
            "description": "For request traces that span multiple components in a system, distributed tracing is enabled so that traces based on correlation IDs are captured automatically and stored in a backing service where they can be analyzed and problems within request traces can be clearly attributed to single components.",
            "categories": ["applicationAdministration", "networkCommunication"],
            "relevantEntities": ["service", "link", "requestTrace"],
            "sources": [{ "key": "Davis2019", "section": "11.3" }, { "key": "Scholl2019", "section": "6 Use Correlation IDs" }, { "key": "Richardson2019", "section": "11.3.3 AUsing the Distributed tracing pattern" }, { "key": "Garrison2017", "section": "7 Debugging and Tracing" }, { "key": "Reznik2019", "section": "10 Observability" }, { "key": "Arundel2019", "section": "15 Tracing" }, { "key": "Bastani2017", "section": "13 Distributed Tracing" }, { "key": "Ruecker2021", "section": "11 Observability and Distributed Tracing Tools (Use Distributed Tracing)" }, { "key": "Goniwada2021", "section": "19 One Source of Truth" }],
            "measures": ["distributedTracingSupport"]
        },
        "healthAndReadinessChecks": {
            "name": "Health and readiness Checks",
            "description": "All components in a system offer health and readiness checks so that unhealthy components can be identified and communication can be restricted to happen only between healthy and ready components. Health and readiness checks can for example be dedicated endpoints of components which can be called regularly to check a component. That way, also an up-to-date holistic overview of the health of a system is enabled.",
            "categories": ["applicationAdministration"],
            "relevantEntities": ["service"],
            "sources": [{ "key": "Scholl2019", "section": "6 Implement Health Checks and Readiness Checks" }, { "key": "Ibryam2020", "section": "4 Health Probe" }, { "key": "Richardson2019", "section": "11.3.1 Using the Health check API pattern" }, { "key": "Garrison2017", "section": "7 State Management" }, { "key": "Arundel2019", "section": "5 Liveness Probes" }, { "key": "Arundel2019", "section": "5 Readiness Probes" }, { "key": "Bastani2017", "section": "13 Health Checks" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?, Health monitoring" }, { "key": "Goniwada2021", "section": "4 Fail Fast, 16 Health Probe" }],
            "measures": ["ratioOfServicesThatProvideHealthEndpoints"]
        },
        "automatedInfrastructureProvisioning": {
            "name": "Automated infrastructure provisioning",
            "description": "Infrastructure provisioning should be automated based on component requirements which are either stated explicitly or inferred from the component which should be deployed. The infrastructure and tools used should require only minimal manual effort. Ideally it should be combined with continuous delivery processes so that no further interaction is needed for a component deployment.",
            "categories": ["cloudInfrastructure", "applicationAdministration"],
            "relevantEntities": ["infrastructure"],
            "sources": [{ "key": "Reznik2019", "section": "10 Automated Infrastructure" }, { "key": "Goniwada2021", "section": "5 Automation" }],
            "measures": []
        },
        "useInfrastructureAsCode": {
            "name": "Use infrastructure as code",
            "description": "The infrastructure requirements and constraints of a system are defined (coded) independently of the actual runtime in a storable format. That way a defined infrastructure can be automatically provisioned repeatedly and ideally also on different underlying infrastructures (cloud providers) based on the stored infrastructure definition. Infrastructure provisioning and configuration operations are not performed manually via an interface of a cloud provider.",
            "categories": ["cloudInfrastructure", "applicationAdministration"],
            "relevantEntities": ["infrastructure"],
            "sources": [{ "key": "Scholl2019", "section": "6 Describe Infrastructure Using Code" }, { "key": "Goniwada2021", "section": "16 Declarative Deployment, 17 What Is Infrastructure as Code?" }],
            "measures": ["linesOfCodeForDeploymentConfiguration"]
        },
        "dynamicScheduling": {
            "name": "Dynamic scheduling",
            "description": "Resource provisioning to deployed components is dynamic and automated so that every component is ensured to have the resources it needs and only that many resources are provisioned wich are really needed at the same time. This requires dynamic adjustments to resources to adapt to changing environments. This capability should be part of the used infrastructure.",
            "categories": ["applicationAdministration", "cloudInfrastructure"],
            "relevantEntities": ["infrastructure"],
            "sources": [{ "key": "Reznik2019", "section": "10 Dynamic Scheduling" }, { "key": "Garrison2017", "section": "7 Resource Allocation and Scheduling" }, { "key": "Ibryam2020", "section": "6 Automated Placement" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; Resource Management" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; Automatic provisioning" }, { "key": "Goniwada2021", "section": "16 Automated Placement" }],
            "measures": []
        },
        "serviceIndependence": {
            "name": "Service independence",
            "description": "Services are as independent as possible throughout their lifecycle, that means development, operation, and evolution. Changes to one service have a minimum impact on other services.",
            "categories": ["businessDomain", "networkCommunication", "cloudInfrastructure", "applicationAdministration", "dataManagement"],
            "relevantEntities": ["service", "link"],
            "sources": [{ "key": "Goniwada2021", "section": "3 Decentralize Everything Principle (Decentralize deployment, governance)" }],
            "measures": []
        },
        "lowCoupling": {
            "name": "Low coupling",
            "description": "The coupling in a system is low in terms of links between components. Each link represents a dependency and therefore decreases service independence.",
            "categories": ["businessDomain"],
            "relevantEntities": ["service", "link"],
            "sources": [],
            "measures": ["numberOfLinksPerComponent", "numberOfConsumedEndpoints", "incomingOutgoingRatioOfAComponent", "ratioOfOutgoingLinksOfAService", "couplingDegreeBasedOnPotentialCoupling", "interactionDensityBasedOnComponents", "interactionDensityBasedOnLinks", "serviceCouplingBasedOnEndpointEntropy", "systemCouplingBasedOnEndpointEntropy", "modularityQualityBasedOnCohesionAndCoupling", "combinedMetricForIndirectDependency", "servicesInterdependenceInTheSystem", "indirectInteractionDensity", "averageNumberOfDirectlyConnectedServices", "numberOfComponentsThatAreLinkedToAComponent", "numberOfComponentsAComponentIsLinkedTo", "numberOfLinksBetweenTwoServices", "aggregateSystemMetricToMeasureServiceCoupling", "numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents", "degreeOfCouplingInASystem", "serviceCouplingBasedOnDataExchangeComplexity", "simpleDegreeOfCouplingInASystem", "directServiceSharing", "transitivelySharedServices", "ratioOfSharedNonExternalComponentsToNonExternalComponents", "ratioOfSharedDependenciesOfNonExternalComponentsToPossibleDependencies", "degreeOfDependenceOnOtherComponents", "averageSystemCoupling", "couplingOfServicesBasedOnUsedDataAggregates", "couplingOfServicesBasedServicesWhichCallThem", "couplingOfServicesBasedServicesWhichAreCalledByThem", "couplingOfServicesBasedOnAmountOfRequestTracesThatIncludeASpecificLink", "couplingOfServicesBasedTimesThatTheyOccurInTheSameRequestTrace"]
        },
        "functionalDecentralization": {
            "name": "Functional decentralization",
            "description": "Business functionality is decentralized over the system as a whole to separate unrelated functionalities from each other and make components more independent.",
            "categories": ["businessDomain"],
            "relevantEntities": ["system", "service", "link"],
            "sources": [],
            "measures": ["conceptualModularityQualityBasedOnDataAggregateCohesionAndCoupling", "cyclicCommunication", "numberOfSynchronousCycles", "relativeImportanceOfTheService", "extentOfAggregationComponents", "systemCentralization", "densityOfAggregation", "aggregatorCentralization", "dataAggregateConvergenceAcrossComponents", "serviceCriticality", "ratioOfCyclicRequestTraces", "numberOfPotentialCyclesInASystem"]
        },
        "limitedRequestTraceScope": {
            "name": "Limited request trace scope",
            "description": "A request that requires the collaboration of several services is still limited to as few services as possible. Otherwise, the more services are part of a request trace the more dependent they are on each other.",
            "categories": ["businessDomain", "networkCommunication"],
            "relevantEntities": ["requestTrace"],
            "sources": [],
            "measures": ["maximumLengthOfServiceLinkChainPerRequestTrace", "maximumNumberOfServicesWithinARequestTrace", "numberOfRequestTraces", "averageComplexityOfRequestTraces", "requestTraceLength", "numberOfCyclesInRequestTraces"]
        },
        "logicalGrouping": {
            "name": "Logical grouping",
            "description": "Services are logically grouped so that services which are related (for example by having many links or processing the same data aggregates) are in the same group, but services which are more independent are separated in different groups. That way a separation can also be achieved on the network and infrastructure level by separating service groups more strictly, such as having different subnets for such logical groups or not letting different groups run on the same infrastructure. Potential impacts of a compromised or misbehaving service can therefore be reduced to the group to which it belongs but other groups are ideally unaffected.",
            "categories": ["cloudInfrastructure", "applicationAdministration", "businessDomain"],
            "relevantEntities": ["system", "service"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Namespaces to Organize Services in Kubernetes" }, { "key": "Arundel2019", "section": "5 Using Namespaces" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; Componentization and isolation" }],
            "measures": []
        },
        "backingServiceDecentralization": {
            "name": "Backing service decentralization",
            "description": "Different backing services are assigned to different components. That way, a decentralization is achieved. For example, instead of one message broker for a whole system, several message brokers can be used, each for a group of components that are interrelated. A problem in one messaging broker has an impact on only those components using it, but not on components having separate message brokers.",
            "categories": ["applicationAdministration", "cloudInfrastructure", "dataManagement"],
            "relevantEntities": ["service", "backingService"],
            "sources": [{ "key": "Indrasiri2021", "section": "4 Decentralized Data Management (decentralized data leads to higher service independence while centralized data leads to higher consistency.)" }, { "key": "Indrasiri2021", "section": "4 Data Service Pattern (As having a negative impact because multiple services should not access the same data);" }, { "key": "Ruecker2021", "section": "2 Different Workflow Engines for different services" }, { "key": "Goniwada2021", "section": "5 Distributed State, Decentralized Data" }],
            "measures": ["degreeOfStorageBackendSharing", "ratioOfStorageBackendSharing", "sharedStorageBackingServiceInteractions", "databaseTypeUtilization", "numberOfServiceConnectedToStorageBackingService"]
        },
        "addressingAbstraction": {
            "name": "Addressing abstraction",
            "description": "In a link from one component to another the specific addresses for reaching the other component is not used, but instead an abstract address is used. That way, the specific addresses of components can be changed without impacting the link between components. This can be achieved for example through service discovery where components are addressed through abstract service names and specific addresses are resolved through service discovery which can be implemented in the infrastructure or a backing service.",
            "categories": ["networkCommunication"],
            "relevantEntities": ["link", "backingService"],
            "sources": [{ "key": "Davis2019", "section": "8.3" }, { "key": "Ibryam2020", "section": "12 Service Discovery" }, { "key": "Richardson2019", "section": "Using service discovery" }, { "key": "Garrison2017", "section": "7 Service Discovery" }, { "key": "Indrasiri2021", "section": "3 Service Registry and Discovery Pattern" }, { "key": "Bastani2017", "section": "7 Routing (Use service discovery with support for health checks and respect varying workloads)" }, { "key": "Indrasiri2021", "section": "3 Service Abstraction Pattern (Use an abstraction layer in front of services (for example Kubernetes Service))" }, { "key": "Goniwada2021", "section": "4 Service Discovery" }],
            "measures": ["serviceDiscoveryUsage"]
        },
        "sparsity": {
            "name": "Sparsity",
            "description": "The more sparse a system is, the less components there are which need to be operated and maintained by the developers of a system. This covers all types of components, such as services, backing services, storage backing services, and also the infrastructure.",
            "categories": ["applicationAdministration", "businessDomain"],
            "relevantEntities": ["system", "component", "infrastructure"],
            "sources": [],
            "measures": ["averageNumberOfEndpointsPerService", "numberOfDependencies", "numberOfVersionsPerService", "concurrentlyAvailableVersionsComplexity", "serviceSupportForTransactions", "numberOfComponents"]
        },
        "operationOutsourcing": {
            "name": "Operation outsourcing",
            "description": "By outsourcing the operation of infrastructure and components to a cloud provider or other vendor, the operation is simplified because responsibility is transferred. Furthermore, costs can be made more flexible because providers and vendors can provide a usage-based pricing.",
            "categories": ["applicationAdministration", "cloudInfrastructure"],
            "relevantEntities": ["backingService", "infrastructure"],
            "sources": [],
            "measures": ["ratioOfProviderManagedComponentsAndInfrastructure"]
        },
        "managedInfrastructure": {
            "name": "Managed infrastructure",
            "description": "Infrastructure such as basic computing, storage or network resources, but potentially also software infrastructure (for example a container orchestration engine) is managed by a cloud provider who is responsible for a stable functioning and up-to-date functionalities. The more infrastructure is managed, the more operational responsibility is transferred. This will also be reflected in the costs which are then calculated more on usage-based pricing schemes.",
            "categories": ["applicationAdministration", "cloudInfrastructure"],
            "relevantEntities": ["infrastructure"],
            "sources": [],
            "measures": []
        },
        "managedBackingServices": {
            "name": "Managed backing services",
            "description": "Backing services that provide non-business functionality are operated and managed by vendors who are responsible for a stable functioning and up-to-date functionalities. Operational responsibility is transferred which is also reflected in the costs which are then calculated more on usage-based pricing schemes.",
            "categories": ["applicationAdministration", "cloudInfrastructure"],
            "relevantEntities": ["backingService"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Managed Databases and Analytics Services" }, { "key": "Arundel2019", "section": "15 Don't build your own monitoring infrastructure (Use an external monitoring service)" }, { "key": "Bastani2017", "section": "10 managed and automated messaging system (operating your own messaging system increases operational overhead, better use a system managed by a platform)" }],
            "measures": []
        },
        "replication": {
            "name": "Replication",
            "description": "Business logic and needed data is replicated at various points in a system so that latencies can be minimized and requests can be distributed for fast request handling.",
            "categories": ["applicationAdministration", "dataManagement", "cloudInfrastructure"],
            "relevantEntities": ["system", "component"],
            "sources": [],
            "measures": []
        },
        "serviceReplication": {
            "name": "Service replication",
            "description": "Services and therefore their provided functionalities are replicated across different locations so that the latency for accesses from different locations is minimized and the incoming load can be distributed among replicas.",
            "categories": ["applicationAdministration", "cloudInfrastructure"],
            "relevantEntities": ["service"],
            "sources": [],
            "measures": ["amountOfRedundancy", "serviceReplicationLevel"]
        },
        "horizontalDataReplication": {
            "name": "Horizontal data replication",
            "description": "Data is replicated horizontally, that means duplicated across several instances of a storage backing service so that a higher load can be handled and replicas closer to the service where data is needed can be used to reduce latency.",
            "categories": ["applicationAdministration", "dataManagement"],
            "relevantEntities": ["storageBackingService", "dataAggregate"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Data Partitioning and Replication for Scale" }, { "key": "Goniwada2021", "section": "4 Data Replication" }],
            "measures": ["storageReplicationLevel"]
        },
        "verticalDataReplication": {
            "name": "Vertical data replication",
            "description": "Data is replicated vertically, that means across a request trace so that it is available closer to where a request initially comes in. Typically caching is used for vertical data replication.",
            "categories": ["applicationAdministration", "dataManagement"],
            "relevantEntities": ["service", "dataAggregate"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Caching" }, { "key": "Bastani2017", "section": "9 Caching (Use an In-Memory cache for queries to relieve datastore from traffic; replication into faster data storage)" }, { "key": "Indrasiri2021", "section": "4 Caching Pattern" }],
            "measures": []
        },
        "shardedDataStoreReplication": {
            "name": "Sharded data store replication",
            "description": "Data storage is sharded, that means data is split into several storage backing service instances by a certain strategy so that requests can be distributed across shards to increase performance. One example strategy could be to shard data geographically, that means user data from one location is stored in one shard while user data from another location is stored in a different shard. One storage backing service instance is then less likely to be overloaded with requests, because the number of potential requests is limited by the amount of data in that instance.",
            "categories": ["applicationAdministration", "dataManagement"],
            "relevantEntities": ["storageBackingService", "dataAggregate"],
            "sources": [{ "key": "Indrasiri2014", "section": "4 Data Sharding Pattern" }, { "key": "Goniwada2021", "section": "4 Data Partitioning Pattern" }],
            "measures": ["dataShardingLevel"]
        },
        "enforcementOfAppropriateResourceBoundaries": {
            "name": "Enforcement of appropriate resource boundaries",
            "description": "The resources required by a component are predictable as precisely as possible and specified accordingly for each component in terms of lower and upper boundaries. Resources include CPU, memory, GPU, or Network requirements. This information is used by the infrastructure to enforce these resource boundaries. Thereby it is ensured that a component has the resources available that it needs to function properly, that the infrastructure can optimize the amount of allocated resource, and that components are not negatively impacted by defective components which excessively consume resources.",
            "categories": ["applicationAdministration", "cloudInfrastructure"],
            "relevantEntities": ["component"],
            "sources": [{ "key": "Scholl2019", "section": "6 Define CPU and Memory Limits for Your Containers" }, { "key": "Arundel2019", "section": "5 Resource Limits" }, { "key": "Ibryam2020", "section": "2 Defined Resource requirements" }, { "key": "Arundel2019", "section": "5 Resource Quotas (limit maximum resources for a namespace)" }, { "key": "Goniwada2021", "section": "3 Runtime Confinement Principle, 6 Predictable Demands" }],
            "measures": []
        },
        "built-InAutoscaling": {
            "name": "Built-in autoscaling",
            "description": "Horizontal up- and down-scaling of components is automated and built into the infrastructure on which components run. Horizontal scaling means that component instances are replicated when the load increases and components instances are removed when load decreases. This autoscaling is based on rules which can be configured according to system needs.",
            "categories": ["applicationAdministration", "cloudInfrastructure"],
            "relevantEntities": ["component", "infrastructure"],
            "sources": [{ "key": "Scholl2019", "section": "6 Use Platform Autoscaling Features" }, { "key": "Ibryam2020", "section": "24 Elastic Scale" }, { "key": "Bastani2017", "section": "13 Autoscaling" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; Scaling" }, { "key": "Goniwada2021", "section": "5 Elasticity in Microservices" }],
            "measures": []
        },
        "infrastructureAbstraction": {
            "name": "Infrastructure abstraction",
            "description": "The used infrastructure such as physical hardware, virtual hardware, or software platform is abstracted by clear boundaries to enable a clear differentiation of responsibilities for operating and managing infrastructure. For example, when a managed container orchestration system is used, the system is operable on that level of abstraction meaning that the API of the orchestration system is the boundary. Problems with underlying hardware or VMs are handled transparently by the provider.",
            "categories": ["applicationAdministration", "cloudInfrastructure"],
            "relevantEntities": ["service", "infrastructure"],
            "sources": [{ "key": "Bastani2017", "section": "14 Service Brokers (make use of service brokers as an additional level of abstraction to automatically add or remove backing services)" }, { "key": "Goniwada2021", "section": "3 Location-Independent Principle" }],
            "measures": []
        },
        "cloudVendorAbstraction": {
            "name": "Cloud vendor abstraction",
            "description": "The managed infrastructure and backing services used by a system and provided by a cloud vendor are based on unified or standardized interfaces so that vendor specifics are abstracted and a system could potentially be transferred to a another cloud vendor offering the same unified or standardized interfaces.",
            "categories": ["applicationAdministration", "cloudInfrastructure"],
            "relevantEntities": ["service", "infrastructure"],
            "sources": [{ "key": "Wimm2017", "section": "3 Infrastructure and the Cloud Provider Interface" }, { "key": "Indrasiri2021", "section": "1 Dynamic Management; Multicloud support" }],
            "measures": ["servicePortability"]
        },
        "configurationManagement": {
            "name": "Configuration management",
            "description": "Configuration values which are specific to an environment are managed separately in a consistent way. Through this, components are more portable across environments and configuration can change independently from components.",
            "categories": ["applicationAdministration", "dataManagement"],
            "relevantEntities": ["component", "backingData"],
            "sources": [],
            "measures": []
        },
        "isolatedConfiguration": {
            "name": "Isolated configuration",
            "description": "Following DevOps principles, environment-specific configurations are separated from component artifacts (e.g. deployment units) and provided by the environment in which a cloud-native application runs. This enables adaptability across environments (also across testing and production environments)",
            "categories": ["applicationAdministration", "dataManagement"],
            "relevantEntities": ["service", "backingData"],
            "sources": [{ "key": "Davis2019", "section": "6.2 The app's configuration layer" }, { "key": "Ibryam2020", "section": "18" }, { "key": "Scholl2019", "section": "6 Never Store Secrets or Configuration Inside an Image" }, { "key": "Adkins2019", "section": "14 Treat Configuration as Code" }, { "key": "Indrasiri2021", "section": " Decoupled Configurations" }],
            "measures": ["configurationExternalization"]
        },
        "configurationStoredInSpecializedServices": {
            "name": "Configuration stored in specialized services",
            "description": "Configuration values are stored in specialized backing services and not only environment variables for example. That way, changing configurations at runtime is facilitated and can be enabled by connecting components to such specialized backing services and checking for updated configurations at runtime. Additionally, configurations can be stored once, but accessed by different components.",
            "categories": ["applicationAdministration", "dataManagement"],
            "relevantEntities": ["service", "backingData", "backingService"],
            "sources": [{ "key": "Ibryam2020", "section": "19 Configuration Resource" }, { "key": "Richardson2019", "section": "11.2 “Designing configurable services" }, { "key": "Arundel2019", "section": "10 ConfigMaps" }, { "key": "Bastani2017", "section": "2 Centralized, Journaled Configuration" }, { "key": "Bastani2017", "section": "2 Refreshable Configuration" }],
            "measures": []
        },
        "contract-BasedLinks": {
            "name": "Contract-based links",
            "description": "Contracts are defined for the communication via links so that changes to endpoints can be evaluated by their impact on the contract and delayed when a contract would be broken. That way consumers of endpoints can adapt to changes when necessary without suddenly breaking communication via a link due to a changed endpoint.",
            "categories": ["networkCommunication", "businessDomain"],
            "relevantEntities": ["service", "endpoint", "link"],
            "sources": [{ "key": "Bastani2017", "section": "4 Consumer-Driven Contract Testing (Use contracts for APIs to test against)" }],
            "measures": []
        },
        "standardizedSelf-containedDeploymentUnit": {
            "name": "Standardized self-contained deployment unit",
            "description": "The components are deployed as standardized self-contained units so that the same artifact can reliably be installed and run in different environments and on different infrastructure.",
            "categories": ["cloudInfrastructure", "applicationAdministration"],
            "relevantEntities": ["component"],
            "sources": [{ "key": "Reznik2019", "section": "10 Containerized Apps" }, { "key": "Adkins2019", "section": "7 Use Containers (smaller deployments, separated operating system, portable);" }, { "key": "Indrasiri2021", "section": "1 Use Containerization and Container Orchestration" }, { "key": "Garrison2017", "section": "7 Application Runtime and Isolation" }, { "key": "Goniwada2021", "section": "3 Deploy Independently Principle (deploy services in independent containers), Self-Containment Principle, 5 Containerization" }],
            "measures": []
        },
        "immutableArtifacts": {
            "name": "Immutable artifacts",
            "description": "Infrastructure and components of a system are defined and described in its entirety at development time so that artifacts are immutable at runtime. This means upgrades are introduced at runtime through replacement of components instead of modification. Furthermore components do not differ across environments and in case of replication all replicas are identical to avoid unexpected behavior.",
            "categories": ["applicationAdministration"],
            "relevantEntities": ["service", "infrastructure"],
            "sources": [{ "key": "Scholl2019", "section": "6 Don't Modify Deployed Infrastructure" }, { "key": "Indrasiri2021", "section": "1 Containerization" }, { "key": "Goniwada2021", "section": "3 Process Disposability Principle, Image Immutability Principle" }],
            "measures": ["numberOfDeploymentTargetEnvironments"]
        },
        "guardedIngress": {
            "name": "Guarded ingress",
            "description": "Ingress communication, that means communication coming from outside of a system, needs to be guarded. It should be ensured that access to external endpoints is controlled by components offering these external endpoints. Control means for example that only authorized access is possible, maliciously large load is blocked, or secure communication protocols are ensured.",
            "categories": ["networkCommunication", "applicationAdministration"],
            "relevantEntities": ["service", "endpoint"],
            "sources": [{ "key": "Scholl2019", "section": "6 Implement Rate Limiting and Throttling" }, { "key": "Adkins2019", "section": "8 Throttling (Delaying processing or responding to remain functional and decrease traffic from individual clients) (should be automated, part of graceful degradation)" }, { "key": "Adkins2019", "section": "8 Load shedding (In case of traffic spike, deny low priority requests to remain functional) (should be automated, part of graceful degradation)" }, { "key": "Goniwada2021", "section": "5 Throttling " }],
            "measures": ["ratioOfEndpointsWhoseIngressIsGuarded"]
        },
        "distribution": {
            "name": "Distribution",
            "description": "Components are distributed across locations and data centers for better availability, reliability, and performance.",
            "categories": ["dataManagement", "cloudInfrastructure"],
            "relevantEntities": ["service", "infrastructure"],
            "sources": [],
            "measures": ["componentDensity", "numberOfServiceHostedOnOneInfrastructure"]
        },
        "physicalDataDistribution": {
            "name": "Physical data distribution",
            "description": "Storage Backing Service instances where Data aggregates are persisted are distributed across physical locations (e.g. availability zones of a cloud vendor) so that even in the case of a failure of one physical location, another physical location is still useable.",
            "categories": ["dataManagement", "cloudInfrastructure"],
            "relevantEntities": ["storageBackingService", "infrastructure"],
            "sources": [{ "key": "Scholl2019", "section": "6 Keep Data in Multiple Regions or Zones" }, { "key": "Indrasiri2021", "section": "4 Data Sharding Pattern: Geographically distribute data" }],
            "measures": ["numberOfAvailabilityZonesUsed"]
        },
        "physicalServiceDistribution": {
            "name": "Physical service distribution",
            "description": "Components are distributed through replication across physical locations (e.g. availability zones of a cloud vendor) so that even in the case of a failure of one physical location, another physical location is still useable.",
            "categories": ["cloudInfrastructure"],
            "relevantEntities": ["component", "infrastructure"],
            "sources": [{ "key": "Winn2017", "section": "2 Resiliency Through Availability Zones" }],
            "measures": ["numberOfAvailabilityZonesUsed"]
        },
        "seamlessUpgrades": {
            "name": "Seamless upgrades",
            "description": "Upgrades of services do not interfere with availability. There are different strategies, like rolling upgrades, to achieve this which should be provided as a capability by the infrastructure.",
            "categories": ["applicationAdministration", "cloudInfrastructure", "networkCommunication", "businessDomain"],
            "relevantEntities": ["component"],
            "sources": [],
            "measures": []
        },
        "rollingUpgradesEnabled": {
            "name": "Rolling upgrades enabled",
            "description": "The infrastructure on which components are deployed provides the ability for rolling upgrades. That means upgrades of components can be performed seamlessly in an automated manner. Seamlessly means that upgrades of components do not necessitate planned downtime.",
            "categories": ["applicationAdministration", "cloudInfrastructure"],
            "relevantEntities": ["component", "infrastructure"],
            "sources": [{ "key": "Davis2019", "section": "7.2" }, { "key": "Scholl2019", "section": "6 Use Zero-Downtime Releases" }, { "key": "Ibryam2020", "section": "3 Declarative Deployment" }, { "key": "Reznik2019", "section": "10 Risk-Reducing Deployment Strategies" }, { "key": "Arundel2019", "section": "13 Rolling Updates" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; Rolling upgrades" }],
            "measures": ["rollingUpdateOption"]
        },
        "automatedInfrastructureMaintenance": {
            "name": "Automated infrastructure maintenance",
            "description": "The used infrastructure should automate regular maintenance tasks as much as possible in a way that the operation of components is not impacted by these tasks. Such tasks include updates of operating systems, standard libraries, and middleware managed by the infrastructure, but also certificate regeneration.",
            "categories": ["cloudInfrastructure", "applicationAdministration"],
            "relevantEntities": ["infrastructure"],
            "sources": [{ "key": "Reznik2019", "section": "10 Automated Infrastructure" }, { "key": "Goniwada2021", "section": "5 Automation" }],
            "measures": []
        },
        "autonomousFaultHandling": {
            "name": "Autonomous fault handling",
            "description": "Services expect faults at different levels and either handle them or minimize their impact by relying on the capabilities of cloud environments.",
            "categories": ["networkCommunication", "cloudInfrastructure"],
            "relevantEntities": ["service", "link", "infrastructure"],
            "sources": [],
            "measures": []
        },
        "invocationTimeouts": {
            "name": "Invocation timeouts",
            "description": "For links between components, timeouts are defined to avoid infinite waiting on a service that is unavailable and a timely handling of problems.",
            "categories": ["networkCommunication"],
            "relevantEntities": ["link"],
            "sources": [{ "key": "Indrasiri2021", "section": "3 Resilient Connectivity Pattern: Time-out" }, { "key": "Richardson2019", "section": "3.2.3 Handling partial failures using the Circuit Breaker pattern" }, { "key": "Goniwada2021", "section": "5 Timeout" }],
            "measures": []
        },
        "retriesForSafeInvocations": {
            "name": "Retries for safe invocations",
            "description": "Links that are safe to invoke multiple times without leading to unintended state changes, are automatically retried in case of errors to transparently handle transient faults in communication. That way faults can be prevented from being propagated higher up in a request trace.",
            "categories": ["networkCommunication"],
            "relevantEntities": ["link"],
            "sources": [{ "key": "Davis2019", "section": "9.1" }, { "key": "Scholl2019", "section": "6 Handle Transient Failures with Retries" }, { "key": "Scholl2019", "section": "6 Use a Finite Number of Retries" }, { "key": "Bastani2017", "section": "12 Isolating Failures and Graceful Degradation: Use retries" }, { "key": "Indrasiri2021", "section": "3 Resilient Connectivity Pattern: Retry" }, { "key": "Ruecker2021", "section": "9 Synchronous Request/Response (Use retries in synchronous communications)" }, { "key": "Ruecker2021", "section": "9 The Importance of Idempotency (Communication which is retried needs idempotency)" }, { "key": "Goniwada2021", "section": "Idempotent Service Operation, Retry, 5 Retry " }],
            "measures": ["numberOfLinksWithRetryLogic"]
        },
        "circuitBreakedCommunication": {
            "name": "Circuit breaked communication",
            "description": "For links a circuit breaker implementation is used which avoids unnecessary communication and therefore waiting time if a communication is known to fail. Instead the circuit breaker immediately returns an error response of a default response, is possible, while periodically retrying communication in the background.",
            "categories": ["networkCommunication"],
            "relevantEntities": ["link"],
            "sources": [{ "key": "Davis2019", "section": "10.1" }, { "key": "Scholl2019", "section": "6 Use Circuit Breakers for Nontransient Failures" }, { "key": "Richardson2019", "section": "3.2.3 Handling partial failures using the Circuit Breaker pattern" }, { "key": "Bastani2017", "section": "12 Isolating Failures and Graceful Degradation: circuit breaker" }, { "key": "Indrasiri2021", "section": "3 Resilient Connectivity Pattern: Circuit breaker" }, { "key": " Goniwada2021", "section": "4 Circuit Breaker" }],
            "measures": ["numberOfLinksWithComplexFailover"]
        },
        "automatedRestarts": {
            "name": "Automated restarts",
            "description": "When a component is found to be unhealthy, that means not functioning as expected, it is directly and automatically restarted. Ideally this capability is provided by the infrastructure on which a component is running.",
            "categories": ["cloudInfrastructure", "applicationAdministration"],
            "relevantEntities": ["component"],
            "sources": [{ "key": "Winn2017", "section": "2 Self-Healing Processes; Self-Healing VMs" }, { "key": "Bastani2017", "section": "13 automatic remediation" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; High availability" }, { "key": "Goniwada2021", "section": "5 Self-Healing" }],
            "measures": []
        },
        "api-BasedCommunication": {
            "name": "API-based communication",
            "description": "All endpoints that are offered by a service are part of a well-defined and documented API. That means, the APIs are based on common principles, are declarative instead of imperative, and are documented in a standardized or specified format (such as the OpenAPI specification). Communication only happens via endpoints that are part of such APIs and can be both synchronous or asynchronous.",
            "categories": ["networkCommunication", "businessDomain"],
            "relevantEntities": ["service", "endpoint", "link"],
            "sources": [{ "key": "Reznik2019", "section": "9 Communicate Through APIs" }, { "key": "Adkins2019", "section": "6 Understandable Interface Specifications (Use Interface specifications for understandability" }, { "key": "Bastani2017", "section": "6 Everything is an API (Services are integrated via APIs)" }, { "key": "Indrasiri2021", "section": "2 Service Definitions in Synchronous Communication (Use a service definition for each service);" }, { "key": "Indrasiri2021", "section": "2 Service Definition in Asynchronous Communication (Use schemas to define message formats);" }, { "key": "Goniwada2021", "section": "3 API First Principle" }],
            "measures": []
        },
        "consistentlyMediatedCommunication": {
            "name": "Consistently mediated communication",
            "description": "By mediating communication through additional components, there is no direct dependence on the other communication partner and additional operations can be performed to manage the communication, such as load balancing, monitoring, or the enforcement of policies. By using centralized mediation approaches, such as Service Meshes, management actions can be performed universally and consistently across the components of an application.",
            "categories": ["networkCommunication"],
            "relevantEntities": ["component", "link"],
            "sources": [{ "key": "Indrasiri2021", "section": "3 Sidecar Pattern, Service Mesh Pattern, Service Abstraction Pattern (Proxy communication with services to include service discovery and load balancing)" }, { "key": "Davis2019", "section": "10.3" }, { "key": "Richardson2019", "section": "11.4.2" }],
            "measures": ["serviceInteractionViaBackingService", "serviceInteractionViaCentralComponentUtilizationMetric"]
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
        { "impactedFactor": "simplicity", "sourceFactor": "usageOfExistingSolutionsForNonCoreCapabilities", "impactType": "positive" },
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
        { "impactedFactor": "simplicity", "sourceFactor": "sparsity", "impactType": "positive" },
        { "impactedFactor": "simplicity", "sourceFactor": "operationOutsourcing", "impactType": "positive" },
        { "impactedFactor": "operationOutsourcing", "sourceFactor": "managedInfrastructure", "impactType": "positive" },
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
        { "impactedFactor": "interoperability", "sourceFactor": "consistentlyMediatedCommunication", "impactType": "positive" },
        { "impactedFactor": "timeBehaviour", "sourceFactor": "consistentlyMediatedCommunication", "impactType": "negative" },
        { "impactedFactor": "analyzability", "sourceFactor": "consistentlyMediatedCommunication", "impactType": "positive" }
    ],
    "measures": {
        "ratioOfEndpointsSupportingSsl": {
            "name": "Ratio of endpoints that support SSL",
            "calculation": "Endpoints that support SSL / Endpoints that do not support SSL",
            "sources": ["Ntentos2022"]
        },
        "ratioOfExternalEndpointsSupportingTls": {
            "name": "Ratio of external endpoints that support TLS",
            "calculation": "External Endpoints that support TLS / All External Endpoints",
            "sources": ["new"]
        },
        "ratioOfSecuredLinks": {
            "name": "Ratio of secured links",
            "calculation": "Links secured by SSL / All links",
            "sources": ["Zdun2023", "Zdun2023a"]
        },
        "ratioOfEndpointsThatSupportTokenBasedAuthentication": {
            "name": "Ratio of endpoints that support token-based authentication ",
            "calculation": "Endpoints supportin tokens / All endpoints",
            "sources": ["Ntentos2022", "Zdun2023", "Zdun2023a"]
        },
        "ratioOfEndpointsThatSupportApiKeys": {
            "name": "Ratio of endpoints that support API Keys",
            "calculation": "",
            "sources": ["Ntentos2022", "Ntentos2022"]
        },
        "ratioOfEndpointsThatSupportPlaintextAuthentication": {
            "name": "Ratio of endpoints that support plaintext authentication",
            "calculation": "",
            "sources": ["Ntentos2022", "Zdun2023", "Zdun2023a"]
        },
        "ratioOfEndpointsThatAreIncludedInASingleSignOnApproach": {
            "name": "Ratio of endpoints that are included in an single-sign-on approach",
            "calculation": "",
            "sources": ["Ntentos2022"]
        },
        "totalServiceInterfaceCohesion": {
            "name": "Total Service Interface Cohesion",
            "calculation": "(\"Service Interface Data Cohesion\" + \"Service Interface Usage Cohesion\") / 2",
            "sources": ["Bogner2017", "Perepletchikov2007"]
        },
        "covesivenessOfService": {
            "name": "Covesiveness of Service",
            "calculation": "",
            "sources": ["Oliveira2018", "La2013"]
        },
        "cohesionOfAServiceBasedOnOtherEndpointsCalled": {
            "name": "Cohesion of a Service based on other Endpoints called",
            "calculation": "Endpoints that are called from this services which are from the same other service / All Endpoints called by this service",
            "sources": ["Peng2022"]
        },
        "dataAggregateScope": {
            "name": "Data aggregate scope",
            "calculation": "Total number of Data Aggregates in a System",
            "sources": ["Shim2008", "Zimmermann2015"]
        },
        "serviceInterfaceDataCohesion": {
            "name": "Service Interface Data Cohesion",
            "calculation": "| Set of Service Endpoints that use the same Data Aggregate | / Number of Data Aggregates used in a Service",
            "sources": ["Bogner2017", "Perepletchikov2007", "Kazemi2011", "Brito2021", "Jin2021", "Jin2018", "Athanasopoulos2011", "Athanasopoulos2015", "Bogner2020"]
        },
        "cohesionBetweenEndpointsBasedOnDataAggregateUsage": {
            "name": "Cohesion between Endpoints based on data aggregate usage",
            "calculation": "Average-of(Number of Shared Usage of Data Aggregates per endpoint pair) over all endpoints / All Data Aggregates used by endpoints",
            "sources": ["Peng2022"]
        },
        "numberOfProvidedSynchronousAndAsynchronousEndpoints": {
            "name": "Number of provided synchronous and asynchronous endpoints",
            "calculation": "Number of endpoints of a service provides",
            "sources": ["Apel2019", "Engel2018", "Shim2008", "Brito2021", "Jin2021", "Daniel2023"]
        },
        "numberOfSynchronousEndpointsOfferedByAService": {
            "name": "Number of synchronous endpoints offered by a service",
            "calculation": "Number of endpoints of a service of kind query or command",
            "sources": ["Shim2008"]
        },
        "serviceInterfaceUsageCohesion": {
            "name": "Service Interface Usage Cohesion",
            "calculation": "Sum-of(Number of endpoints used per client of this service) / (number of clients of this service * number of endpoints of this service)",
            "sources": ["Bogner2017", "Perepletchikov2007", "Kazemi2011"]
        },
        "distributionOfSynchronousCalls": {
            "name": "Distribution of synchronous calls",
            "calculation": "",
            "sources": ["Engel2018"]
        },
        "cohesionOfEndpointsBasedOnInvocationByOtherServices": {
            "name": "Cohesion of Endpoints based on invocation by other services",
            "calculation": "",
            "sources": ["Peng2022"]
        },
        "externallyAvailableEndpoints": {
            "name": "Externally available endpoints",
            "calculation": "Absolute number of external endpoints",
            "sources": ["Zimmermann2015"]
        },
        "centralizationOfExternallyAvailableEndpoints": {
            "name": "Centralization of externally available endpoints",
            "calculation": "",
            "sources": ["Ntentos2020", "Ntentos2021"]
        },
        "apiCompositionUtilizationMetric": {
            "name": "API Composition utilization metric",
            "calculation": "",
            "sources": ["Ntentos2020", "Ntentos2021"]
        },
        "ratioOfStateDependencyOfEndpoints": {
            "name": "Ratio of state dependency of endpoints",
            "calculation": "Number of Endpoints requiring a Data Aggregate / Total number of Endpoints",
            "sources": ["Karhikeyan2012"]
        },
        "ratioOfStatefulComponents": {
            "name": "Ratio of stateful components",
            "calculation": "Number of stateful components / Total number of components",
            "sources": ["Qian2006"]
        },
        "ratioOfStatelessComponents": {
            "name": "Ratio of stateless components",
            "calculation": "Number of stateless components / Total number of components",
            "sources": ["Hirzalla2009"]
        },
        "degreeToWhichComponentsAreLinkedToStatefulComponents": {
            "name": "Degree to which components are linked to stateful components",
            "calculation": "(sum-of(Number of stateful Components a Component is linked to) for all components) / Total Number of Components)",
            "sources": ["Qian2006"]
        },
        "numberOfAsynchronousEndpointsOfferedByAService": {
            "name": "Number of asynchronous endpoints offered by a service",
            "calculation": "Number of endpoints of a service of kind event",
            "sources": ["Shim2008", "Daniel2023"]
        },
        "numberOfSynchronousOutgoingLinks": {
            "name": "Number of synchronous outgoing links",
            "calculation": "Number of outgoing links of a service targeting a synchronous endpoint.",
            "sources": ["Apel2019", "Daniel2023"]
        },
        "numberOfAsynchronousOutgoingLinks": {
            "name": "Number of asynchronous outgoing links",
            "calculation": "Number of outgoing links of a service targeting an asynchronous endpoint.",
            "sources": ["Apel2019", "Daniel2023"]
        },
        "ratioOfAsynchronousOutgoingLinks": {
            "name": "Ratio of asynchronous outgoing links",
            "calculation": "Number of outgoing links of a service that are asynchronous / Number of all outgoing links",
            "sources": ["Karhikeyan2012"]
        },
        "degreeOfAsynchronousCommunication": {
            "name": "Degree of asynchronous communication",
            "calculation": "Average-of(Ratio of asynchronous endpoints) over all components",
            "sources": ["Qian2006"]
        },
        "asynchronousCommunicationUtilization": {
            "name": "Asynchronous Communication Utilization",
            "calculation": "Number of Links targeting an asynchronous Endpoint / Total number of Links",
            "sources": ["Ntentos2020a"]
        },
        "serviceInteractionWithEventSourcingUtilizationMetric": {
            "name": "Service Interaction with Event Sourcing utilization metric",
            "calculation": "",
            "sources": ["Ntentos2020"]
        },
        "serviceLinkPersistenceUtilizationMetric": {
            "name": "Service Link Persistence utilization metric",
            "calculation": "",
            "sources": ["Ntentos2020", "Ntentos2021"]
        },
        "outboxEventSourcingUtilizationMetric": {
            "name": "Outbox/Event Sourcing utilization metric",
            "calculation": "",
            "sources": ["Ntentos2020", "Ntentos2021"]
        },
        "ratioOfInfrastructureNodesThatSupportMonitoring": {
            "name": "Ratio of Infrastructure nodes that support Monitoring",
            "calculation": "",
            "sources": ["Ntentos2022", "Zdun2023"]
        },
        "ratioOfComponentsThatSupportMonitoring": {
            "name": "Ratio of Components that support Monitoring",
            "calculation": "",
            "sources": ["Ntentos2022", "Zdun2023"]
        },
        "ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService": {
            "name": "Ratio of Components or Infrastructure nodes that export logs to a central service",
            "calculation": "",
            "sources": ["Ntentos2022"]
        },
        "ratioOfComponentsOrInfrastructureNodesThatExportMetrics": {
            "name": "Ratio of Components or Infrastructure nodes that export metrics",
            "calculation": "",
            "sources": ["Ntentos2022"]
        },
        "ratioOfComponentsOrInfrastructureNodesThatEnablePerformanceAnalytics": {
            "name": "Ratio of Components or Infrastructure nodes that enable Performance Analytics",
            "calculation": "",
            "sources": ["Ntentos2022"]
        },
        "distributedTracingSupport": {
            "name": "Distributed Tracing Support",
            "calculation": "",
            "sources": ["Ntentos2020", "Ntentos2021"]
        },
        "ratioOfServicesThatProvideHealthEndpoints": {
            "name": "Ratio of Services that provide Health endpoints",
            "calculation": "Number of Service with at least one health endpoint and at least one readiness endpoint / Number of all Services",
            "sources": ["Ntentos2022"]
        },
        "linesOfCodeForDeploymentConfiguration": {
            "name": "Lines of code (LOC) for deployment configuration",
            "calculation": "",
            "sources": ["Lehmann2017", "Talwar2005"]
        },
        "numberOfLinksPerComponent": {
            "name": "Number of Links per Component ",
            "calculation": "Number of outoging and incoming Links of a component",
            "sources": ["Zimmermann2015", "Tiwari2014", "Rosa2020"]
        },
        "numberOfConsumedEndpoints": {
            "name": "Number of Consumed Endpoints",
            "calculation": "Number of endpoints a service is linked to",
            "sources": ["Apel2019", "Gamage2021", "Perera2018"]
        },
        "incomingOutgoingRatioOfAComponent": {
            "name": "Incoming outgoing ratio of a component",
            "calculation": "Number of outgoing links from a component / Number of incoming links of a component",
            "sources": ["Tiwari2014"]
        },
        "ratioOfOutgoingLinksOfAService": {
            "name": "Ratio of outgoing links of a service",
            "calculation": "(Number of outgoing links of a service / (Total Number of links connected to a service)) * 100",
            "sources": ["PhamThiQuynh2009"]
        },
        "couplingDegreeBasedOnPotentialCoupling": {
            "name": "Coupling degree based on potential coupling",
            "calculation": "(Sum-of(Maximum path lengths between components when no links exist) - Sum-of(path lengths between components based on actually existing links)) / Sum-of(Maximum path lengths between components when no links exist) - Sum-of(Minimum path lengths when links exist between all components)",
            "sources": ["PhamThiQuynh2009"]
        },
        "interactionDensityBasedOnComponents": {
            "name": "Interaction density based on components",
            "calculation": "Number of links in a system / Number of components in a system",
            "sources": ["Tiwari2014"]
        },
        "interactionDensityBasedOnLinks" : {
            "name": "Interaction density based on links",
            "calculation": "Number of links in a system / Number of potential links in a system",
            "sources": ["Tiwari2014", "Karhikeyan2012"]
        },
        "indirectInteractionDensity": {
            "name": "Indirect Interaction density of a system",
            "calculation": "Number of other components to which an indirect dependency exist / Number of components to which an indirect dependency could exist (because they are not direct dependencies) ",
            "sources": ["Karhikeyan2012"]
        },
        "serviceCouplingBasedOnEndpointEntropy": {
            "name": "Service Coupling based on Endpoint Entropy",
            "calculation": "(sum-of(-log(1 /(Number of links connected to an endpoint + 1))) for all endpoints of a service) / Number of endpoints of a component",
            "sources": ["Wang2009"]
        },
        "systemCouplingBasedOnEndpointEntropy": {
            "name": "System Coupling based on Endpoint Entropy",
            "calculation": "sum-of(\"Service Coupling based on Endpoint Entropy\" for all components",
            "sources": ["Wang2009"]
        },
        "modularityQualityBasedOnCohesionAndCoupling": {
            "name": "Modularity quality based on cohesion and coupling",
            "calculation": "",
            "sources": ["Brito2021", "Jin2021"]
        },
        "combinedMetricForIndirectDependency": {
            "name": "Combined metric for indirect dependency",
            "calculation": "(\"Indirect Interaction density of a system\" + \"Indirect Dependency because of shared data repository\") / 2",
            "sources": ["Karhikeyan2012"]
        },
        "servicesInterdependenceInTheSystem": {
            "name": "Services Interdependence in the System",
            "calculation": "Number of service pairs which are bi-directionally linked",
            "sources": ["Bogner2017", "Rud2006"]
        },
        "averageNumberOfDirectlyConnectedServices": {
            "name": "Average Number of Directly Connected Services",
            "calculation": "(\"Number of Components a component is linked to\" + \"Number of Components that are linked to a component\") / Number of services in the system",
            "sources": ["Shim2008"]
        },
        "numberOfComponentsThatAreLinkedToAComponent": {
            "name": "Number of Components that are linked to a component",
            "calculation": "Number of Components that are linked to a component (consumers)",
            "sources": ["Bogner2017", "Rud2009", "Shim2008", "Zhang2009", "Asik2017", "Gamage2021", "Perera2018"]
        },
        "numberOfComponentsAComponentIsLinkedTo": {
            "name": "Number of Components a component is linked to",
            "calculation": "Number of Components a component is linked to",
            "sources": ["Bogner2017", "Rud2009", "Engel2018", "Shim2008", "Raj2021", "Raj2018", "Hofmeister2008", "PhamThiQuynh2009", "Zhang2009"]
        },
        "numberOfLinksBetweenTwoServices": {
            "name": "Number of links between two services",
            "calculation": "Number of Links from component to unique endpoints of component B",
            "sources": ["Hofmeister2008"]
        },
        "aggregateSystemMetricToMeasureServiceCoupling": {
            "name": "Aggregate System metric to measure service coupling",
            "calculation": "(sum-of(\"Number of Components a component is linked to\" for all Service Consumers)) / (Number of services) * (Number of services - 1)",
            "sources": ["Hofmeister2008", "Gamage2021"]
        },
        "numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents": {
            "name": "Number of Components a component is linked to relative to the total amount of components",
            "calculation": "Number of Components a component is linked to / Total Number of Components",
            "sources": ["Raj2021", "Raj2018", "Zhang2009"]
        },
        "degreeOfCouplingInASystem": {
            "name": "Degree of coupling in a system",
            "calculation": "Sum-of(Number of Components a component is linked to) / ((Total Number of Components)² - (Total Number of Components))",
            "sources": ["Raj2021", "Raj2018", "Hofmeister2008", "Zhang2009"]
        },
        "serviceCouplingBasedOnDataExchangeComplexity": {
            "name": "Service Coupling based on data exchange complexity",
            "calculation": "",
            "sources": ["Kazemi2013", "Ma2009"]
        },
        "simpleDegreeOfCouplingInASystem": {
            "name": "Simple Degree of coupling in a system",
            "calculation": "Sum-of(Number of Components a component is linked to) / (Total Number of Components)",
            "sources": ["Qian2006"]
        },
        "directServiceSharing": {
            "name": "Direct Service Sharing",
            "calculation": "((Number of Services with at least two incoming links from different services / Total number of services) + (Number of Endpoints with at least two incoming links from different services / Total number of links)) / 2",
            "sources": ["Ntentos2020a"]
        },
        "transitivelySharedServices": {
            "name": "Transitively Shared Services",
            "calculation": "((Number of Services which are transitively reachable by another service / Total number of services) + (Number of Endpoints which are transitively reachable by another service / Total number of links)) / 2",
            "sources": ["Ntentos2020a"]
        },
        "ratioOfSharedNonExternalComponentsToNonExternalComponents": {
            "name": "Ratio of shared non-external components to non-external components",
            "calculation": "Number of Services with at least two incoming links from different services / Total number of services",
            "sources": ["Zdun2017"]
        },
        "ratioOfSharedDependenciesOfNonExternalComponentsToPossibleDependencies": {
            "name": "Ratio of shared dependencies of non-external components to possible dependencies",
            "calculation": "Number of component sharing relationships / (Number of components)²",
            "sources": ["Zdun2017"]
        },
        "degreeOfDependenceOnOtherComponents": {
            "name": "Degree of dependence on other components",
            "calculation": "",
            "sources": ["Oliveira2018", "La2013", "Oh2011", "PhamThiQuynh2009"]
        },
        "averageSystemCoupling": {
            "name": "Average System Coupling",
            "calculation": "Sum-of(relationship weights of links between services) / Number of services",
            "sources": ["Filippone2023"]
        },
        "couplingOfServicesBasedOnUsedDataAggregates": {
            "name": "Coupling of services based on used Data Aggregates",
            "calculation": "Data Aggregates used by both two services / All Data Aggregates used by two services",
            "sources": ["Peng2022"]
        },
        "couplingOfServicesBasedServicesWhichCallThem": {
            "name": "Coupling of services based services which call them",
            "calculation": "Services which call both two services / All services calling either of the two services",
            "sources": ["Peng2022"]
        },
        "couplingOfServicesBasedServicesWhichAreCalledByThem": {
            "name": "Coupling of services based services which are called by them",
            "calculation": "Services which are called by both two services / All services called by either of the two services",
            "sources": ["Peng2022"]
        },
        "couplingOfServicesBasedOnAmountOfRequestTracesThatIncludeASpecificLink": {
            "name": "Coupling of services based on amount of request traces that include a specific link",
            "calculation": "Maximum of probabilities that one service is called by the other in all requests traces in which the first service is included.",
            "sources": ["Peng2022"]
        },
        "couplingOfServicesBasedTimesThatTheyOccurInTheSameRequestTrace": {
            "name": "Coupling of services based times that they occur in the same request trace",
            "calculation": "Number of request traces which contain the same two services / Number of request traces",
            "sources": ["Peng2022"]
        },
        "conceptualModularityQualityBasedOnDataAggregateCohesionAndCoupling": {
            "name": "Conceptual Modularity quality based on Data Aggregate cohesion and coupling",
            "calculation": "",
            "sources": ["Brito2021", "Jin2021"]
        },
        "cyclicCommunication": {
            "name": "Cyclic Communication",
            "calculation": "Whether or not a Service is part of a cyclic communication path",
            "sources": ["Apel2019", "Ntentos2020a"]
        },
        "numberOfSynchronousCycles": {
            "name": "Number of synchronous cycles",
            "calculation": "Number of cycles that exist between services based on synchronous links",
            "sources": ["Engel2018"]
        },
        "relativeImportanceOfTheService": {
            "name": "Relative Importance of the Service",
            "calculation": "Number of Components that are linked to a component (consumers) / Total Number of Components",
            "sources": ["Zhang2009"]
        },
        "extentOfAggregationComponents": {
            "name": "Extent of Aggregation components",
            "calculation": "(sum-of((sum-of(Incoming Links) of all components with in- and outgoing links) / (sum-of(Outgoing Links) for all components with only incoming Links)) for all components that have only outgoing links )",
            "sources": ["Hofmeister2008"]
        },
        "systemCentralization": {
            "name": "System's CentraliZation",
            "calculation": "",
            "sources": ["Hofmeister2008"]
        },
        "densityOfAggregation": {
            "name": "Density of Aggregation",
            "calculation": "sum-of(ln(number of outoging links / total number of outgoing and incoming links * 2)) for all aggregators that means services which have incoming and outgoing links",
            "sources": ["Hofmeister2008"]
        },
        "aggregatorCentralization": {
            "name": "Aggregator CentraliZation",
            "calculation": "",
            "sources": ["Hofmeister2008"]
        },
        "dataAggregateConvergenceAcrossComponents": {
            "name": "Data Aggregate Convergence across Components",
            "calculation": "((sum-of(number of data aggregates used in a service) for all services) / Number of Services) + ((sum-of(Services that use a data aggregate) for all data aggregates) / Number of Data Aggregates)",
            "sources": ["Kazemi2013", "Ma2009"]
        },
        "serviceCriticality": {
            "name": "Service Criticality",
            "calculation": "Number of Components that are linked to a component * Number of Components a component is linked to",
            "sources": ["Bogner2017", "Rud2009"]
        },
        "ratioOfCyclicRequestTraces": {
            "name": "Ratio of cyclic request traces",
            "calculation": "Number of request traces with a cycle / Total number of request traces",
            "sources": ["Genfer2021"]
        },
        "numberOfPotentialCyclesInASystem": {
            "name": "Number of potential cycles in a system",
            "calculation": "Number of cycles found in a system based on defined links",
            "sources": ["Peng2022"]
        },
        "maximumLengthOfServiceLinkChainPerRequestTrace": {
            "name": "Maximum Length of Service Link chain per request trace",
            "calculation": "Maximum of number-of links of request trace for all request traces",
            "sources": ["Apel2019", "Engel2018", "Rosa2020"]
        },
        "maximumNumberOfServicesWithinARequestTrace": {
            "name": "Maximum number of services within a request trace",
            "calculation": "Maximum of number-of components within a request trace for all request traces",
            "sources": ["Apel2019"]
        },
        "numberOfRequestTraces": {
            "name": "Number of Request Traces",
            "calculation": "Total number of request traces",
            "sources": ["Zimmermann2015"]
        },
        "averageComplexityOfRequestTraces": {
            "name": "Average Complexity of Request Traces",
            "calculation": "(sum-of(Number of Links in Request Trace) for all Request Traces) / Total number of request traces",
            "sources": ["Zimmermann2015"]
        },
        "requestTraceLength": {
            "name": "Request Trace Length",
            "calculation": "Number of links in a request trace",
            "sources": ["Peng2022", "Gamage2021"]
        },
        "numberOfCyclesInRequestTraces": {
            "name": "Number of Cycles in Request Traces",
            "calculation": "Number of Cycles in Request Trace",
            "sources": ["Peng2022", "Gamage2021"]
        },
        "degreeOfStorageBackendSharing": {
            "name": "Degree of Storage Backend Sharing",
            "calculation": "Number of Services sharing the same Storage Backing Service",
            "sources": ["Rosa2020"]
        },
        "ratioOfStorageBackendSharing": {
            "name": "Ratio of Storage Backend Sharing",
            "calculation": "(sum-of(Number of Services sharing the same Storage Backing Service) for all Storage Backing Services) / (Total Number of Services * Total Number of Storage Backing Service)",
            "sources": ["Karhikeyan2012"]
        },
        "sharedStorageBackingServiceInteractions": {
            "name": "Shared Storage Backing Service Interactions",
            "calculation": "",
            "sources": ["Ntentos2020", "Ntentos2020a", "Ntentos2021"]
        },
        "databaseTypeUtilization": {
            "name": "Database Type Utilization",
            "calculation": "Storage Backing Services used by individual services / Total number of Storage Backing Services",
            "sources": ["Ntentos2020a"]
        },
        "serviceDiscoveryUsage": {
            "name": "Service Discovery Usage",
            "calculation": "",
            "sources": ["Apel2019"]
        },
        "averageNumberOfEndpointsPerService": {
            "name": "Average Number of Endpoints per Service",
            "calculation": "Number of Endpoints / Number of Services",
            "sources": ["Bogner2017", "Bogner2020", "Hirzalla2009", "Brito2021", "Jin2021", "Rosa2020", "Kazemi2013", "Ma2009", "Desai2021"]
        },
        "numberOfDependencies": {
            "name": "Number of Dependencies",
            "calculation": "",
            "sources": ["Apel2019"]
        },
        "numberOfVersionsPerService": {
            "name": "Number of Versions per Service",
            "calculation": "",
            "sources": ["Bogner2017", "Hirzalla2009"]
        },
        "concurrentlyAvailableVersionsComplexity": {
            "name": "Concurrently available versions complexity",
            "calculation": "",
            "sources": ["Karhikeyan2012"]
        },
        "serviceSupportForTransactions": {
            "name": "Service Support for Transactions",
            "calculation": "",
            "sources": ["Bogner2017", "Hirzalla2009"]
        },
        "numberOfComponents": {
            "name": "Number of components",
            "calculation": "Total number of components",
            "sources": ["Silva2023", "Venkitachalam2017"]
        },
        "ratioOfProviderManagedComponentsAndInfrastructure": {
            "name": "Ratio of Provider-Managed Components and Infrastructure",
            "calculation": "Number of Provider-managed components and infrastrcture nodes / All components and infrastructure nodes",
            "sources": ["Yussupov2022"]
        },
        "amountOfRedundancy": {
            "name": "Amount of redundancy",
            "calculation": "sum-of(deployment mappings) for all Components / Number of deployed Components",
            "sources": ["Zimmermann2015"]
        },
        "serviceReplicationLevel": {
            "name": "Service Replication level",
            "calculation": "The average value of replicas per service",
            "sources": ["Guerron2020", "Souza2016"]
        },
        "storageReplicationLevel": {
            "name": "Storage Replication level",
            "calculation": "The average value of replicas per storage backing service",
            "sources": ["Guerron2020", "Souza2016"]
        },
        "servicePortability": {
            "name": "Service portability",
            "calculation": "",
            "sources": ["Guerron2020", "Singh2015"]
        },
        "configurationExternalization": {
            "name": "Configuration externalization",
            "calculation": "",
            "sources": ["Apel2019"]
        },
        "numberOfDeploymentTargetEnvironments": {
            "name": "Number of Deployment Target Environments",
            "calculation": "",
            "sources": ["Apel2019"]
        },
        "ratioOfEndpointsWhoseIngressIsGuarded": {
            "name": "Ratio of endpoints whose ingress is guarded",
            "calculation": "",
            "sources": ["Ntentos2022"]
        },
        "componentDensity": {
            "name": "Component density",
            "calculation": "Number of deployed components / Number of infrastructure entities on which one or more components are deployed",
            "sources": ["Guerron2020", "Rizvi2017"]
        },
        "numberOfAvailabilityZonesUsed": {
            "name": "Number of Availability Zones used",
            "calculation": "Number of unique availability zones in which the infrastructure is running",
            "sources": ["Guerron2020", "Baranwal2014"]
        },
        "rollingUpdateOption": {
            "name": "Rolling Update Option",
            "calculation": "Number of Infrastructure entities deploying components and supporting rolling update strategies / All Infrastructure entities deploying components",
            "sources": ["Straesser2023"]
        },
        "numberOfLinksWithRetryLogic": {
            "name": "Number of Links with retry logic",
            "calculation": "Number of Links to a synchronous endpoint with retries > 0 / Total number of Links to a synchronous endpoint",
            "sources": ["Apel2019"]
        },
        "numberOfLinksWithComplexFailover": {
            "name": "Number of Links with Complex Failover",
            "calculation": "Number of Links to a synchronous endpoint with a circuit breaker / Total number of Links to a synchronous endpoint",
            "sources": ["Apel2019"]
        },
        "serviceInteractionViaBackingService": {
            "name": "Service Interaction via Backing Service",
            "calculation": "",
            "sources": ["Ntentos2020a"]
        },
        "serviceInteractionViaCentralComponentUtilizationMetric": {
            "name": "Service Interaction via Central Component utilization metric",
            "calculation": "",
            "sources": ["Ntentos2020", "Ntentos2021"]
        },
        "totalNumberOfComponents": {
            "name": "Total Number of Components",
            "calculation": "Total Number of components",
            "sources": ["Shim2008", "Zimmermann2015"]
        },
        "numberOfServices": {
            "name": "Number of Services",
            "calculation": "Total Number of Services",
            "sources": ["Shim2008", "Raj2018", "Hirzalla2009", "Hofmeister2008", "Zhang2009", "Rud2006"]
        },
        "numberOfBackingServices": {
            "name": "Number of Backing Services",
            "calculation": "Total Number of Backing Services",
            "sources": ["Shim2008"]
        },
        "totalNumberOfLinksInASystem": {
            "name": "Total number of links in a system",
            "calculation": "Total number of links",
            "sources": ["Brito2021", "Jin2018", "Tiwari2014", "Assuncao2021", "Zimmermann2015"]
        },
        "numberOfSynchronousEndpoints": {
            "name": "Number of synchronous endpoints",
            "calculation": "Total number of synchronous endpoints",
            "sources": ["Shim2008"]
        },
        "numberOfAsynchronousEndpoints": {
            "name": "Number of asynchronous endpoints",
            "calculation": "Total number of asynchronous endpoints",
            "sources": ["Shim2008"]
        },
        "numberOfServicesWhichHaveIncomingLinks": {
            "name": "Number of Services which have incoming links",
            "calculation": "Total number of services which have at least one incoming link",
            "sources": ["Shim2008", "Hofmeister2008"]
        },
        "numberOfServicesWhichHaveOutgoingLinks": {
            "name": "Number of Services which have outgoing links",
            "calculation": "Total number of services which have at least one outgoing link",
            "sources": ["Shim2008", "Hofmeister2008"]
        },
        "numberOfServicesWhichHaveBothIncomingAndOutgoingLinks": {
            "name": "Number of Services which have both incoming and outgoing links",
            "calculation": "Total number of services which have at least one incoming link and at least one outgoing link",
            "sources": ["Shim2008", "Hofmeister2008"]
        },
        "lackOfCohesion": {
            "name": "Lack of cohesion of a service",
            "calculation": "",
            "sources": ["AlDebagy2020"]
        },
        "averageLackOfCohesion": {
            "name": "Average system lack of cohesion of a service",
            "calculation": "",
            "sources": ["AlDebagy2020"]
        },
        "serviceSize": {
            "name": "Size of a service",
            "calculation": "\"Number of Data Aggregates used in a service\" + \"Number of Components that are linked to a component\"",
            "sources": ["Asik2017"]
        },
        "resourceCount": {
            "name": "Data Aggregate Count",
            "calculation": "Number of Data Aggregates used in a service",
            "sources": ["Asik2017"]
        },
        "unusedEndpointCount": {
            "name": "Unused Endpoint Count",
            "calculation": "Number of Endpoints of a Component not targeted by a Link",
            "sources": ["Asik2017"]
        },
        "unreachableEndpointCount": {
            "name": "Unreachable Endpoint Count",
            "calculation": "",
            "sources": ["Asik2017"]
        },
        "numberOfServiceConnectedToStorageBackingService": {
            "name": "Number of Services connected to a Storage Backing Service",
            "calculation": "Number of Services with a link to an Endpoint of a Storage Backing Service",
            "sources": ["Daniel2023"]
        },
        "numberOfReadEndpointsProvidedByAService": {
            "name": "Number of Read Endpoints provided by a service",
            "calculation": "Number of Endpoints of kind \"query\" of a component",
            "sources": ["Daniel2023"]
        },
        "numberOfWriteEndpointsProvidedByAService": {
            "name": "Number of Wrie Endpoints provided by a service",
            "calculation": "Number of Endpoints of kind \"command\" or \"event\" of a component",
            "sources": ["Daniel2023"]
        },
        "numberOfServiceHostedOnOneInfrastructure": {
            "name": "Number of Services hosted on one infrastructure entity",
            "calculation": "Number of Service deployed on an infrastructure entity",
            "sources": ["Daniel2023"]
        },
        "ratioOfRequestTracesThroughGateway": {
            "name": "Ratio of request traces through a gateway",
            "calculation": "",
            "sources": ["Zdun2023a"]
        },
        "ratioOfRequestTracesContainingFrontend": {
            "name": "Ratio of request traces containing a frontend component",
            "calculation": "",
            "sources": ["Zdun2023a"]
        },
        "dataShardingLevel": {
            "name" : "Level of sharding across storage backing services",
            "calculation": "Average number of shards per Storage Backing Service",
            "sources": ["new"]
        }
    },
    "productFactorEvaluations": [
        {
            "targetFactor": "serviceReplication",
            "evaluation": "serviceReplication",
            "reasoning": "TODO write a suitable reasoning"
        },
        {
            "targetFactor": "horizontalDataReplication",
            "evaluation": "horizontalDataReplication",
            "reasoning": ""
        },
        {
            "targetFactor": "replication",
            "evaluation": "aggregateImpacts", // TODO more general evaluation, like aggregate?
            "reasoning": "TODO write a suitable reasoning"
        },
        {
            "targetFactor": "shardedDataStoreReplication",
            "evaluation": "shardedDataStoreReplication",
            "reasoning": ""
        }
    ],
    "qualityAspectEvaluations": [
        {
            "targetAspect": "timeBehaviour",
            "evaluation": "aggregateImpacts",
            "reasoning": "TODO"
        }
    ]
}