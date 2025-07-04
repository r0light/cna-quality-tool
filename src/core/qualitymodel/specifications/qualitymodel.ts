import { ENDPOINT_TOSCA_EQUIVALENT } from "@/core/entities/endpoint"
import { ENTITIES } from "./entities"
import { LiteratureKey } from "./literature"

type HighLevelQualityAspecSpec = {
    name: string,
    aspects: { [aspectKey: string]: QualityAspectSpec }
}

type QualityAspectSpec = {
    name: string,
    description: string
}

const qualityAspects = {
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
} satisfies { [highLevelAspectKey: string]: HighLevelQualityAspecSpec }

const highLevelAspectKeys = Object.freeze(qualityAspects);
export type HighLevelAspectKey = keyof typeof highLevelAspectKeys;

const qualityAspectKeys = Object.freeze({ ...qualityAspects.compatibility.aspects, ...qualityAspects.maintainability.aspects, ...qualityAspects.performanceEfficiency.aspects, ...qualityAspects.portability.aspects, ...qualityAspects.reliability.aspects, ...qualityAspects.security.aspects });
export type QualityAspectKey = keyof typeof qualityAspectKeys;

export type CategorySpec = {
    name: string
}

const factorCategories = {
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
} satisfies { [categoryKey: string]: CategorySpec }

const factorCategoryKeys = Object.freeze(factorCategories);
export type FactorCategoryKey = keyof typeof factorCategoryKeys;

type SourceSpec = {
    key: LiteratureKey,
    section: string
}

export const DEFAULT_PRECONDITION: EvaluationPrecondition = "at-least-one";
export type EvaluationPrecondition = "at-least-one" | "all" | "majority";
export const DEFAULT_IMPACTS_INTERPRETATION: IncomingImpactsInterpretation = "mean";
export type IncomingImpactsInterpretation = "lowest" | "highest" | "mean" | "median" | "custom"

type ProductFactorEvaluationSpec = {
    targetEntities: `${ENTITIES}`[],
    evaluation: string,
    measures: MeasureKey[],
    reasoning: string,
    precondition?: EvaluationPrecondition,
    impactsInterpretation?: IncomingImpactsInterpretation,
    customImpactInterpretation?: (list: number[]) => number
}

export type ProductFactorSpec = {
    name: string,
    description: string,
    categories: FactorCategoryKey[],
    relevantEntities: `${ENTITIES}`[],
    applicableEntities: (ENTITIES.SYSTEM | ENTITIES.COMPONENT | ENTITIES.INFRASTRUCTURE | ENTITIES.REQUEST_TRACE)[],
    sources: SourceSpec[],
    measures: MeasureKey[],
    evaluations: ProductFactorEvaluationSpec[]
}

const productFactors = {
    "dataEncryptionInTransit": {
        "name": "Data encryption in transit",
        "description": "Data which is sent or received through a link from one component to or from an endpoint of another component is encrypted so that even when an attacker has access to the network layer, the data is protected.",
        "categories": ["networkCommunication"],
        "relevantEntities": [ENTITIES.LINK, ENTITIES.ENDPOINT],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [
            { "key": "Scholl2019", "section": "6 Encrypt Data in Transit" },
            { "key": "Indrasiri2021", "section": "2 Security (Use TLS for synchronous communications)" }
        ],
        "measures": ["ratioOfEndpointsSupportingSsl", "ratioOfExternalEndpointsSupportingTls", "ratioOfSecuredLinks"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
                "evaluation": "dataEncryptionInTransit",
                "measures": ["ratioOfExternalEndpointsSupportingTls", "ratioOfSecuredLinks"],
                "reasoning": "The more communication is encrypted, the better confidential data is protected. It can be measured by links targeting secure endpoints."
            }
        ]
    },
    "secretsManagement": {
        "name": "Secrets management",
        "description": "Secrets (e.g. passwords, access tokens, encryption keys) which allow access to other components or data are managed specifically to make sure they stay confidential and only authorized components or persons can access them. Managed in this case refers to where and how secrets are stored and how components which need them can access them.",
        "categories": ["applicationAdministration", "cloudInfrastructure", "dataManagement"],
        "relevantEntities": [ENTITIES.BACKING_SERVICE, ENTITIES.INFRASTRUCTURE, ENTITIES.BACKING_DATA, ENTITIES.COMPONENT],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [],
        "measures": [],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
                "evaluation": "aggregateImpacts",
                "measures": [],
                "reasoning": "Secrets management is concered with where and how secrets are stored and how they are made accessible to components which need them.",
                "precondition": "at-least-one",
                "impactsInterpretation": "mean"
            },
        ]
    },
    "isolatedSecrets": {
        "name": "Isolated secrets",
        "description": "Secrets (e.g. passwords, access tokens, encryption keys) are not stored in component artifacts (e.g. binaries, images). Instead, secrets are stored for example in the deployment environment and components are given access at runtime only to those secrets which they actually need and only when they need it.",
        "categories": ["applicationAdministration"],
        "relevantEntities": [ENTITIES.BACKING_SERVICE, ENTITIES.INFRASTRUCTURE, ENTITIES.BACKING_DATA, ENTITIES.COMPONENT],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Scholl2019", "section": "6 Never Store Secrets or Configuration Inside an Image" }, { "key": "Adkins2020", "section": "14 Don't Check In Secrets" }],
        "measures": ["secretsExternalization"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
                "evaluation": "isolatedSecrets",
                "measures": ["secretsExternalization"],
                "reasoning": "The more secrets are stored outside of the components which use them, the more secrets are isolated."
            },
        ]
    },
    "secretsStoredInSpecializedServices": {
        "name": "Secrets stored in specialized services",
        "description": "A dedicated backing service to host secrets (e.g. passwords, access tokens, encryption keys) exists. All secrets required by a system are hosted in this backing service where they can also be managed (for example they can be revoked or replaced with updated secrets). Components fetch secrets from this backing services in a controlled way when they need them.",
        "categories": ["cloudInfrastructure", "dataManagement"],
        "relevantEntities": [ENTITIES.BACKING_SERVICE, ENTITIES.BACKING_DATA, ENTITIES.COMPONENT],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM],
        "sources": [{ "key": "Scholl2019", "section": "6 Securely Store All Secrets" },
        { "key": "Arundel2019", "section": "10 Kubernetes Secrets" }
        ],
        "measures": ["secretsStoredInVault"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM],
                "evaluation": "secretsStoredInSpecializedServices",
                "measures": ["secretsStoredInVault"],
                "reasoning": "The more secrets are stored in vaults, the more they are stored in specialized services which encrypt them and offer management features."
            }
        ]
    },
    "accessRestriction": {
        "name": "Access restriction",
        "description": "Access to components is restricted to those who actually need it. Also, within a system access controls are put in place to have multiple layers of defense. A dedicated component to manage access policies can be used.",
        "categories": ["networkCommunication", "applicationAdministration"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.ENDPOINT, ENTITIES.BACKING_SERVICE],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM],
        "sources": [],
        "measures": [],
        "evaluations": [{
            "targetEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM],
            "evaluation": "aggregateImpacts",
            "measures": [],
            "precondition": "at-least-one",
            "impactsInterpretation": "lowest",
            "reasoning": "How well access restriction is supported depends on the impacting factors. Their impacts are simply aggregated to evaluate this factor.",
        }
        ]
    },
    "leastPrivilegedAccess": {
        "name": "Least-privileged access",
        "description": "Access to endpoints is given as restrictive as possible so that only components who really need it can access an endpoint.",
        "categories": ["networkCommunication", "applicationAdministration"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.ENDPOINT],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM],
        "sources": [{ "key": "Scholl2019", "section": "6 Grant Least-Privileged Access" }, { "key": "Arundel2019", "section": "11 Access Control and Permissions" }],
        "measures": ["accessRestrictedToCallers"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM],
                "evaluation": "leastPrivilegedAccess",
                "measures": ["accessRestrictedToCallers"],
                "reasoning": "Access to endpoints is minimal if access is allowed only to those who actually need. it",
            },
        ]
    },
    "accessControlManagementConsistency": {
        "name": "Access control management consistency",
        "description": "Access control for endpoints is managed in a consistent way, that means for example always the same format is used for access control lists or a single account directory in a dedicated backing service exists for all components. Access control configurations can then be made always in the same known style and only in a dedicated place. Based on such a consistent access control configuration, also verifications can be performed to ensure that access restrictions are implemented correctly.",
        "categories": ["applicationAdministration", "networkCommunication"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.ENDPOINT, ENTITIES.BACKING_SERVICE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
        "sources": [{ "key": "Adkins2020", "section": "6 Access Control (Access control managed by framework)" }, { "key": "Goniwada2021", "section": "9 Policy as Code (consistently describe your security policies in form of code)" }],
        "measures": ["ratioOfEndpointsThatSupportTokenBasedAuthentication", "ratioOfEndpointsThatSupportApiKeys", "ratioOfEndpointsThatSupportPlaintextAuthentication", "ratioOfEndpointsThatAreIncludedInASingleSignOnApproach", "iendpointAccessMethodsConsistency", "externalEndpointAccessConsistency"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
                "evaluation": "accessControlManagementConsistency",
                "measures": ["iendpointAccessMethodsConsistency", "externalEndpointAccessConsistency"],
                "reasoning": "Access control consistency is calculated for all endpoints and all external endpoints separately. Both results are averaged and the factor is evaluated as high if this consistency is also high. If there are not endpoints in the system, the evaluation is none."
            }
        ]
    },
    "accountSeparation": {
        "name": "Account separation",
        "description": "Components are separated by assigning them different accounts. Ideally each component has an individual account. Through this, it is possible to trace which component performed which actions and it is possible to restrict access to other components on a fine-grained level, so that for example in the case of an attack, compromised components can be isolated based on their account.",
        "categories": ["applicationAdministration", "businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Scholl2019", "section": "6 Use Separate Accounts/Subscriptions/Tenants”" }, { "key": "Adkins2020", "section": "8 Role separation”(let different services run with different roles to restrict access)" }, { "key": "Adkins2020", "section": "8 “Location separation (use different roles for a service in different locations to limit attack impacts)" }],
        "measures": ["ratioOfUniqueAccountUsage"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
                "evaluation": "accountSeparation",
                "measures": ["ratioOfUniqueAccountUsage"],
                "reasoning": "The higher the ratio of unique account usage, the more this product factor is present."
            }
        ]
    },
    "authenticationDelegation": {
        "name": "Authentication delegation",
        "description": "The verification of an entity for authenticity, for example upon a request, is delegated to a dedicated backing service. This concern is therefore removed from individual components so that their focus can remain on business functionalities while for example different authentication options can be managed in one place only.",
        "categories": ["applicationAdministration", "businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.BACKING_SERVICE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Scholl2019", "section": "6 Use Federated Identity Management" }, { "key": "Goniwada2021", "section": "9 Decentralized Identity" }],
        "measures": ["ratioOfDelegatedAuthentication"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
                "evaluation": "authenticationDelegation",
                "measures": ["ratioOfDelegatedAuthentication"],
                "reasoning": "The higher the ratio of delegated authentication, the more this product factor is present."
            }
        ]
    },
    "serviceOrientation": {
        "name": "Service-orientation",
        "description": "Cloud-native applications realize modularity by being service-oriented, that means the system is decomposed into services encapsulating specific functionalities and communicating with each other only through specific interfaces. Commonly, a microservices architectural style is used.",
        "categories": ["businessDomain", "dataManagement", "networkCommunication"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.DATA_AGGREGATE, ENTITIES.ENDPOINT, ENTITIES.LINK],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
        "sources": [],
        "measures": [],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
            "evaluation": "aggregateImpacts",
            "measures": [],
            "reasoning": "Service-orientation has a number of aspects that need to be considered. Therefore, the evaluation for this factor just aggregates the impacts from other factors impacting this factor.",
            "precondition": "majority",
            "impactsInterpretation": "median"
        }]
    },
    "limitedFunctionalScope": {
        "name": "Limited functional scope",
        "description": "Each service covers only a limited, but cohesive functional scope to keep services manageable.",
        "categories": ["businessDomain", "dataManagement"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.ENDPOINT, ENTITIES.LINK],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM],
        "sources": [{ "key": "Reznik2019", "section": "9 Microservices Architecture" }, { "key": "Adkins2020", "section": "7 Use Microservices" }, { "key": "Goniwada2021", "section": "3 Polylithic Architecture Principle (Build separate services for different business functionalitites) " }],
        "measures": ["totalServiceInterfaceCohesion", "cohesivenessOfService", "cohesionOfAServiceBasedOnOtherEndpointsCalled", "lackOfCohesion", "averageLackOfCohesion", "serviceSize", "unreachableEndpointCount"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
                "evaluation": "aggregateImpacts",
                "measures": [],
                "reasoning": "The limited functional scope of a component or system is evaluated simply by aggregating the results of limited data scope and limited functional scope.",
                "precondition": "at-least-one",
                "impactsInterpretation": "median"
            }
        ]
    },
    "limitedDataScope": {
        "name": "Limited data scope",
        "description": "The number of data aggregates that are processed in a service is limited to those which need to be administrated together, for example to fulfill data consistency requirements. The aim is to keep the functional scope of a service cohesive. Data aggregates for which consistency requirements can be relaxed might be distributed over separate services.",
        "categories": ["businessDomain", "dataManagement"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.ENDPOINT, ENTITIES.DATA_AGGREGATE],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM],
        "sources": [],
        "measures": ["dataAggregateScope", "serviceInterfaceDataCohesion", "cohesionBetweenEndpointsBasedOnDataAggregateUsage", "resourceCount"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
                "evaluation": "limitedDataScope",
                "measures": ["cohesionBetweenEndpointsBasedOnDataAggregateUsage"],
                "reasoning": "Based on cohesionBetweenEndpointsBasedOnDataAggregateUsage. The higher the cohesion is, the more this factor is present. For the system entity, the measure is aggregated across services."
            }
        ]
    },
    "limitedEndpointScope": {
        "name": "Limited endpoint scope",
        "description": "To keep the functional scope of services limited, the number of endpoints of a service is limited to a cohesive set of endpoints that provide related operations.",
        "categories": ["businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.ENDPOINT, ENTITIES.LINK],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
        "sources": [],
        "measures": ["numberOfProvidedSynchronousAndAsynchronousEndpoints", "numberOfSynchronousEndpointsOfferedByAService", "serviceInterfaceUsageCohesion", "distributionOfSynchronousCalls", "cohesionOfEndpointsBasedOnInvocationByOtherServices", "unusedEndpointCount"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
            "evaluation": "limitedEndpointScope",
            "measures": ["serviceInterfaceUsageCohesion"],
            "reasoning": "Based on serviceInterfaceUsageCohesion. The higher the cohesion is, the more this factor is present. For the system entity, the measure is aggregated across services."
        }]
    },
    "commandQueryResponsibilitySegregation": {
        "name": "Command Query Responsibility Segregation",
        "description": "Endpoints for read (query) and write (command) operations on the same data aggregate are separated into different services. Changes to these operations can then be made independently and also different representations for data aggregates can be used. That way operations on data aggregates can be adjusted to differing usage patterns, different format requirements, or if they are changed for different reasons.",
        "categories": ["networkCommunication", "businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.ENDPOINT, ENTITIES.LINK],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
        "sources": [{ "key": "Davis2019", "section": "4.4" }, { "key": "Richardson2019", "section": "7.2 Using the CQRS pattern" }, { "key": "Bastani2017", "section": "12 CQRS (Command Query Responsibility Segregation)" }, { "key": "Indrasiri2021", "section": "4 Command and Query Responsibility Segregation Pattern" }, { "key": "Goniwada2021", "section": "4 Command and Query Responsibility Segregation Pattern" }],
        "measures": ["numberOfReadEndpointsProvidedByAService", "numberOfWriteEndpointsProvidedByAService", "readWriteSeparationForDataAggregates"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
            "evaluation": "commandQueryResponsibilitySegregation",
            "measures": ["readWriteSeparationForDataAggregates"],
            "reasoning": "Based on readWriteSeparationForDataAggregates the factor is evaluated as being present, the higher the separation of read and write operations on the same data aggregate is, across one or more component(s)."
        }]
    },
    "separationByGateways": {
        "name": "Separation by gateways",
        "description": "Individual components or groups of components are separated through gateways. That means communication is proxied and controlled at specific gateway components. It also abstracts one part of a system from another so that it can be reused by different components without needing direct links to components that actually provide the needed functionality. This way, communication can also be redirected when component endpoints change without changing the gateway endpoint. Also incoming communication from outside of a system can be directed at external endpoints of a central component (the gateway).",
        "categories": ["networkCommunication", "businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.PROXY_BACKING_SERVICE, ENTITIES.ENDPOINT, ENTITIES.LINK],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Davis2019", "section": "10.2" },
        { "key": "Richardson2019", "section": "8.2" }, { "key": "Bastani2017", "section": "8 Edge Services: Filtering and Proxying with Netflix Zuul" }, { "key": "Indrasiri2021", "section": "7 API Gateway Pattern" }, { "key": "Indrasiri2021", "section": "7 API Microgateway Pattern (Smaller API microgateways to avoid having a monolithic API gateway)" }, { "key": "Goniwada2021", "section": "4 “Mediator” (Use a mediator pattern between clients and servers)" }],
        "measures": ["externallyAvailableEndpoints", "centralizationOfExternallyAvailableEndpoints", "apiCompositionUtilizationMetric", "ratioOfRequestTracesThroughGateway", "degreeOfSeparationByGateways"],
        "evaluations": [{
            "targetEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
            "evaluation": "separationByGateways",
            "measures": ["degreeOfSeparationByGateways"],
            "reasoning": "Based on degreeOfSeparationByGateways the factor is evaluated as being present, the higher the degree of separation by gateways is."
        }]
    },
    "isolatedState": {
        "name": "Isolated state",
        "description": "Services are structured by clearly separating stateless from stateful services. Stateful services should be reduced to a minimum. That way, state is isolated within these specifically stateful services which can be managed accordingly. The majority of stateless services is easier to deploy and modify.",
        "categories": ["dataManagement", "businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.DATA_AGGREGATE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Goniwada2021", "section": "3 Be Smart with State Principle" }],
        "measures": [],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
            "evaluation": "aggregateImpacts",
            "measures": [],
            "reasoning": "Depends on whether state is only stored in specific services (mostlyStatelessServices) and if those services that are stateful are handled properly (specializedStatefulServices)",
            "precondition": "at-least-one",
            "impactsInterpretation": "lowest"
        }]
    },
    "mostlyStatelessServices": {
        "name": "Mostly stateless services",
        "description": "Most services in a system are kept stateless, that means not requiring durable disk space on the infrastructure that they run on. Stateless services can be replaced, updated or replicated at any time. Stateful services are reduced to a minimum.",
        "categories": ["dataManagement", "businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.DATA_AGGREGATE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Davis2019", "section": "5.4" }, { "key": "Scholl2019", "section": "6 “Design Stateless Services That Scale Out" }, { "key": "Goniwada2021", "section": "3 Be Smart with State Principle, 5 Stateless Services" }],
        "measures": ["ratioOfStateDependencyOfEndpoints", "ratioOfStatefulComponents", "ratioOfStatelessComponents", "degreeToWhichComponentsAreLinkedToStatefulComponents"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
            "evaluation": "mostlyStatelessServices",
            "measures": ["ratioOfStatelessComponents", "degreeToWhichComponentsAreLinkedToStatefulComponents"],
            "reasoning": "This factor is fulfilled if the ratio of stateless services is rather high and if in addition the degree to which components are linked to stateful components is rather low. These two measures are aggregated."
        }]
    },
    "specializedStatefulServices": {
        "name": "Specialized stateful services",
        "description": "For stateful components, that means components that do require durable disk space on the infrastructure that they run on, specialized software or frameworks are used that can handle distributed state by replicating it over several components or component instances while still ensuring consistency requirements for that state.",
        "categories": ["dataManagement", "businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.STORAGE_BACKING_SERVICE, ENTITIES.DATA_AGGREGATE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Davis2019", "section": "5.4" }, { "key": "Ibryam2020", "section": "11 “Stateful Service”" }],
        "measures": ["ratioOfSpecializedStatefulServices", "suitablyReplicatedStatefulService"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
            "evaluation": "specializedStatefulServices",
            "measures": ["ratioOfSpecializedStatefulServices", "suitablyReplicatedStatefulService"],
            "reasoning": "This factor is fulfilled if the ratio of specialized stateful services is rather high. If stateful services are replicated, also suitablyReplicatedStatefulService is included in the evaluation and needs to be rather high."
        }]
    },
    "looseCoupling": {
        "name": "Loose coupling",
        "description": "In cloud-native applications communication between components is loosely coupled in time, location, and language to achieve greater independence.",
        "categories": ["businessDomain", "networkCommunication"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.LINK, ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [],
        "measures": [],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
            "evaluation": "aggregateImpacts",
            "measures": [],
            "reasoning": "Depends on whether communication is asynchronous and in addition, if event sourcing is used.",
            "precondition": "at-least-one",
            "impactsInterpretation": "median"
        }]
    },
    "asynchronousCommunication": {
        "name": "Asynchronous communication",
        "description": "Asynchronous links (e.g. based on messaging backing services) are preferred for the communication between components. That way, components are decoupled in time meaning that not all linked components need to be available at the same time for a successful communication. Additionally, callers do not await a response.",
        "categories": ["networkCommunication", "businessDomain"],
        "relevantEntities": [ENTITIES.LINK, ENTITIES.ENDPOINT, ENTITIES.REQUEST_TRACE, ENTITIES.BROKER_BACKING_SERVICE,],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Davis2019", "section": "4.2" }, { "key": "Scholl2019", "section": "6 Prefer Asynchronous Communication" }, { "key": "Richardson2019", "section": "3.3.2, 3.4 Using asynchronous messaging to improve availability" }, { "key": "Indrasiri2021", "section": "3 Service Choreography Pattern" }, { "key": "Ruecker2021", "section": "9 Asynchronous Request/Response (Use asynchronous communication to make services more robust)" }, { "key": "Goniwada2021", "section": "4 Asynchronous Nonblocking I/O" }],
        "measures": ["numberOfAsynchronousEndpointsOfferedByAService", "numberOfSynchronousOutgoingLinks", "numberOfAsynchronousOutgoingLinks", "ratioOfAsynchronousOutgoingLinks", "degreeOfAsynchronousCommunication", "asynchronousCommunicationUtilization", "numberOfSynchronousEndpoints", "numberOfAsynchronousEndpoints"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
            "evaluation": "asynchronousCommunication",
            "measures": ["degreeOfAsynchronousCommunication", "asynchronousCommunicationUtilization"],
            "reasoning": "This factor is fulfilled if the degree of asychronous communication and the asynchronousCommunicationUtilization are rather high. Both measures are relevant and therefore aggregated."
        }]
    },
    "communicationPartnerAbstraction": {
        "name": "Communication partner abstraction",
        "description": "Communication via links is not based on specific communication partners (specific components) but abstracted based on the content of communication. An example is event-driven communication where events are published to channels without the publisher knowing which components receive events and events can therefore also be received by components which are created later in time.",
        "categories": ["networkCommunication"],
        "relevantEntities": [ENTITIES.LINK, ENTITIES.BROKER_BACKING_SERVICE, ENTITIES.ENDPOINT, ENTITIES.REQUEST_TRACE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Richardson2019", "section": "6 Event-driven communication" }, { "key": "Ruecker2021", "section": "8: Event-driven systems “event chains emerge over time and therefore lack visibility." }],
        "measures": ["eventSourcingUtilizationMetric"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
            "evaluation": "communicationPartnerAbstraction",
            "measures": ["eventSourcingUtilizationMetric"],
            "reasoning": "This factor is fulfilled if the degree of communication via an event store is rather high."
        }]
    },
    "persistentCommunication": {
        "name": "Persistent communication",
        "description": "Links persist messages which have been sent (e.g. based on messaging backing services). That way, components are decoupled, because components need not yet exist at the time a message is sent, but can still receive a message. Communication can also be repeated, because persisted messages can be retrieved again.",
        "categories": ["networkCommunication"],
        "relevantEntities": [ENTITIES.LINK, ENTITIES.BROKER_BACKING_SERVICE, ENTITIES.ENDPOINT],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Indrasiri2021", "section": "5 Event Sourcing Pattern: Log-based message brokers" }],
        "measures": ["serviceInteractionViaBackingService", "eventSourcingUtilizationMetric"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
            "evaluation": "persistentCommunication",
            "measures": ["serviceInteractionViaBackingService", "eventSourcingUtilizationMetric"],
            "reasoning": "This factor is fulfilled if communication is persistent. It can be partly persistent if communication happens via a message broker which at least temporarily stores messages. But for a higher fullfillment an event store should be utilized."
        }]
    },
    "usageOfExistingSolutionsForNonCoreCapabilities": {
        "name": "Usage of existing solutions for non-core capabilities",
        "description": "For non-core capabilities readily available solutions are used. This means solutions which are based on a standard or a specification, are widely adopted and ideally open source so that their well-functioning is ensured by a broader community. Non-core capabilities include interface technologies or protocols for endpoints, infrastructure technologies (for example container orchestration engines), and software for backing services. That way capabilities don't need to self-implemented and existing integration options can be used.",
        "categories": ["cloudInfrastructure", "applicationAdministration"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.BACKING_SERVICE, ENTITIES.STORAGE_BACKING_SERVICE, ENTITIES.BROKER_BACKING_SERVICE, ENTITIES.PROXY_BACKING_SERVICE, ENTITIES.INFRASTRUCTURE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
        "sources": [{ "key": "Reznik2019", "section": "9 Avoid Reinventing the Wheel" }, { "key": "Adkins2020", "section": "12 Frameworks to Enforce Security and Reliability" }],
        "measures": ["ratioOfNonCustomBackingServices"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
            "evaluation": "usageOfExistingSolutionsForNonCoreCapabilities",
            "measures": ["ratioOfNonCustomBackingServices"],
            "reasoning": "This factor depends on the ratio of non-custom backing services used. The higher this ratio is, the more this factor is fulfilled."
        }]
    },
    "standardization": {
        "name": "Standardization",
        "description": "By using standardized technologies within components, for interfaces, and especially for the infrastructure, backing services and other non-business concerns, reusability can be increased and the effort to develop additional functionality which integrates with existing components can be reduced.",
        "categories": ["applicationAdministration"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.REQUEST_TRACE],
        "sources": [],
        "measures": ["ratioOfStandardizedArtifacts", "ratioOfEntitiesProvidingStandardizedArtifacts"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.REQUEST_TRACE],
            "evaluation": "standardization",
            "measures": ["ratioOfStandardizedArtifacts", "ratioOfEntitiesProvidingStandardizedArtifacts"],
            "reasoning": "This factor is present, if entities include standardized artifacts. It is evaluated on the one hand based on whether entities include standardized artifacts at all and on the other hand the ratio of standardized artifacts."
        }]
    },
    "componentSimilarity": {
        "name": "Component similarity",
        "description": "The more similar components are, the easier it is for developers to work on an unfamiliar component. Furthermore, similar components can be more easily integrated and maintained in the same way. Similarity considers mainly the libraries and technologies used for implementing service logic and service endpoints, as well as their deployment.",
        "categories": ["applicationAdministration"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Reznik2019", "section": "9 Reference Architecture" }],
        "measures": ["componentArtifactsSimilarity", "infrastructureArtifactsSimilarity"],
        "evaluations": [{
            "targetEntities": [ENTITIES.REQUEST_TRACE],
            "evaluation": "componentSimilarityRequestTrace",
            "measures": ["componentArtifactsSimilarity"],
            "reasoning": "On the level of a request trace, the evaluation of this factor only considers the component similarity of the components involved in the request trace. The similarity is based on the artifacts."
        },
        {
            "targetEntities": [ENTITIES.SYSTEM],
            "evaluation": "componentSimilaritySystem",
            "measures": ["componentArtifactsSimilarity", "infrastructureArtifactsSimilarity"],
            "reasoning": "On the level of the whole system, the evaluation of this factor considers the component similarity and infrastructure similarity based on their included artifacts."
        }]
    },
    "automatedMonitoring": {
        "name": "Automated Monitoring",
        "description": "Cloud-native applications enable monitoring at various levels (business functionalities in services, backing-service functionalities, infrastructure) in an automated fashion to enable observable and autonomous reactions to changing system conditions.",
        "categories": ["applicationAdministration", "businessDomain", "networkCommunication", "dataManagement"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.BACKING_SERVICE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Goniwada2021", "section": "3 High Observability Principle" }],
        "measures": ["ratioOfInfrastructureNodesThatSupportMonitoring", "ratioOfComponentsThatSupportMonitoring"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.REQUEST_TRACE],
            "evaluation": "aggregateImpacts",
            "measures": [],
            "reasoning": "Depends on whether components and infrastructure support monitoring through logging, metrics, distributed tracing and health and readiness checks.",
            "precondition": "at-least-one",
            "impactsInterpretation": "median"
        }]
    },
    "consistentCentralizedLogging": {
        "name": "Consistent centralized logging",
        "description": "Logging functionality, specifically the automated collection of logs, is concentrated in a centralized backing service which combines and stores logs from the components of a system. The logs are kept consistent regarding their format and level of granularity. In the backing service also log analysis functionalities are provided, for example by also enabling a correlation of logs from different components.",
        "categories": ["applicationAdministration", "dataManagement"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.BACKING_DATA, ENTITIES.BACKING_SERVICE, ENTITIES.LINK],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE],
        "sources": [{ "key": "Davis2019", "section": "11.1" }, { "key": "Scholl2019", "section": "6 Use a Unified Logging System" }, { "key": "Scholl2019", "section": "6 Common and Structured Logging Format" }, { "key": "Richardson2019", "section": "11.3.2 Applying the Log aggregation pattern" }, { "key": "Reznik2019", "section": "10 Observability" }, { "key": "Garrison2017", "section": "7 Monitoring and Logging" }, { "key": "Adkins2020", "section": "15 Design your logging to be immutable" }, { "key": "Arundel2019", "section": "15 Logging" }, { "key": "Bastani2017", "section": "13 Application Logging" }, { "key": "Bastani2017", "section": "13 Audit Events (capture events for audits, like failed logins etc)" }, { "key": "Ruecker2021", "section": "11 Custom Centralized Monitoring" }, { "key": "Goniwada2021", "section": "19 One Source of Truth" }],
        "measures": ["ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService"],
        "evaluations": [{
            "targetEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM],
            "evaluation": "consistentCentralizedLogging",
            "measures": ["ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService"],
            "reasoning": "The factor is fullfilled, if services export logs to a logging service. This is checked by the ratio of components or infrastructure that export logs to a central service."
        }]
    },
    "consistentCentralizedMetrics": {
        "name": "Consistent centralized metrics",
        "description": "Metrics gathering and calculation functionality for monitoring purposes is concentrated in a centralized component which combines, aggregates and stores metrics from the components of a system. The metrics are kept consistent regarding their format and support multiple levels of granularity. In the backing service also metric analysis functionalities are provided, for example by also enabling correlations of metrics.",
        "categories": ["applicationAdministration", "businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.BACKING_DATA, ENTITIES.BACKING_SERVICE, ENTITIES.LINK],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM],
        "sources": [{ "key": "Davis2019", "section": "11.2" }, { "key": "Scholl2019", "section": "6 Tag Your Metrics Appropriately" }, { "key": "Richardson2019", "section": "11.3.4 Applying the Applications metrics pattern" }, { "key": "Garrison2017", "section": "7 Monitoring and Logging, Metrics Aggregation" }, { "key": "Reznik2019", "section": "10 Observability" }, { "key": "Arundel2019", "section": "15 Metrics help predict problems" }, { "key": "Bastani2017", "section": "13 Metrics" }, { "key": "Arundel2019", "section": "16 The RED Pattern (common metrics you should have for services" }, { "key": "Arundel2019", "section": "16 The USE Pattern (common metrics for resources" }, { "key": "Goniwada2021", "section": "19 One Source of Truth" }],
        "measures": ["ratioOfComponentsOrInfrastructureNodesThatExportMetrics", "ratioOfComponentsOrInfrastructureNodesThatEnablePerformanceAnalytics"],
        "evaluations": [{
            "targetEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM],
            "evaluation": "consistentCentralizedMetrics",
            "measures": ["ratioOfComponentsOrInfrastructureNodesThatExportMetrics"],
            "reasoning": "The factor is fullfilled, if services export metrics to a metrics service. This is checked by the ratio of components or infrastructure that export metrics to a central service."
        }]
    },
    "distributedTracingOfInvocations": {
        "name": "Distributed tracing of invocations",
        "description": "For request traces that span multiple components in a system, distributed tracing is enabled so that traces based on correlation IDs are captured automatically and stored in a backing service where they can be analyzed and problems within request traces can be clearly attributed to single components.",
        "categories": ["applicationAdministration", "networkCommunication"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.BACKING_SERVICE, ENTITIES.REQUEST_TRACE],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Davis2019", "section": "11.3" }, { "key": "Scholl2019", "section": "6 Use Correlation IDs" }, { "key": "Richardson2019", "section": "11.3.3 AUsing the Distributed tracing pattern" }, { "key": "Garrison2017", "section": "7 Debugging and Tracing" }, { "key": "Reznik2019", "section": "10 Observability" }, { "key": "Arundel2019", "section": "15 Tracing" }, { "key": "Bastani2017", "section": "13 Distributed Tracing" }, { "key": "Ruecker2021", "section": "11 Observability and Distributed Tracing Tools (Use Distributed Tracing)" }, { "key": "Goniwada2021", "section": "19 One Source of Truth" }],
        "measures": ["distributedTracingSupport"],
        "evaluations": [{
            "targetEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
            "evaluation": "distributedTracingOfInvocations",
            "measures": ["distributedTracingSupport"],
            "reasoning": "The more components are connected to a distributed tracing service, the more this factor is fulfilled."
        }]
    },
    "healthAndReadinessChecks": {
        "name": "Health and readiness Checks",
        "description": "All components in a system offer health and readiness checks so that unhealthy components can be identified and communication can be restricted to happen only between healthy and ready components. Health and readiness checks can for example be dedicated endpoints of components which can be called regularly to check a component. That way, also an up-to-date holistic overview of the health of a system is enabled.",
        "categories": ["applicationAdministration"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.ENDPOINT],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Scholl2019", "section": "6 Implement Health Checks and Readiness Checks" }, { "key": "Ibryam2020", "section": "4 Health Probe" }, { "key": "Richardson2019", "section": "11.3.1 Using the Health check API pattern" }, { "key": "Garrison2017", "section": "7 State Management" }, { "key": "Arundel2019", "section": "5 Liveness Probes" }, { "key": "Arundel2019", "section": "5 Readiness Probes" }, { "key": "Bastani2017", "section": "13 Health Checks" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?, Health monitoring" }, { "key": "Goniwada2021", "section": "4 Fail Fast, 16 Health Probe" }],
        "measures": ["ratioOfServicesThatProvideHealthEndpoints", "ratioOfServicesThatProvideReadinessEndpoints"],
        "evaluations": [{
            "targetEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
            "evaluation": "healthAndReadinessChecks",
            "measures": ["ratioOfServicesThatProvideHealthEndpoints", "ratioOfServicesThatProvideReadinessEndpoints"],
            "reasoning": "The higher the number of services providing health and readiness checks, the more this factor is fulfilled."
        }]
    },
    "automatedInfrastructureProvisioning": {
        "name": "Automated infrastructure provisioning",
        "description": "Infrastructure provisioning should be automated based on component requirements which are either stated explicitly or inferred from the component which should be deployed. The infrastructure and tools used should require only minimal manual effort. Ideally it should be combined with continuous delivery processes so that no further interaction is needed for a component deployment.",
        "categories": ["cloudInfrastructure", "applicationAdministration"],
        "relevantEntities": [ENTITIES.INFRASTRUCTURE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE],
        "sources": [{ "key": "Reznik2019", "section": "10 Automated Infrastructure" }, { "key": "Goniwada2021", "section": "5 Automation" }],
        "measures": ["ratioOfAutomaticallyProvisionedInfrastructure"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE],
            "evaluation": "automatedInfrastructureProvisioning",
            "measures": ["ratioOfAutomaticallyProvisionedInfrastructure"],
            "reasoning": "The higher the number of infrastructure entites that are provisioned automatically, the more this factor is fulfilled."
        }]
    },
    "useInfrastructureAsCode": {
        "name": "Use infrastructure as code",
        "description": "The infrastructure requirements and constraints of a system are defined (coded) independently of the actual runtime in a storable format. That way a defined infrastructure can be automatically provisioned repeatedly and ideally also on different underlying infrastructures (cloud providers) based on the stored infrastructure definition. Infrastructure provisioning and configuration operations are not performed manually via an interface of a cloud provider.",
        "categories": ["cloudInfrastructure", "applicationAdministration"],
        "relevantEntities": [ENTITIES.INFRASTRUCTURE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE],
        "sources": [{ "key": "Scholl2019", "section": "6 Describe Infrastructure Using Code" }, { "key": "Goniwada2021", "section": "16 Declarative Deployment, 17 What Is Infrastructure as Code?" }],
        "measures": ["linesOfCodeForDeploymentConfiguration", "ratioOfInfrastructureWithIaCArtifact"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE],
            "evaluation": "useInfrastructureAsCode",
            "measures": ["ratioOfInfrastructureWithIaCArtifact"],
            "reasoning": "The higher the number of infrastructure entites that include an IaC (Infrastructure as Code) artifact, the more this factor is fulfilled."
        }]
    },
    "dynamicScheduling": {
        "name": "Dynamic scheduling",
        "description": "Resource provisioning to deployed components is dynamic and automated so that every component is ensured to have the resources it needs and only that many resources are provisioned wich are really needed at the same time. This requires dynamic adjustments to resources to adapt to changing environments. This capability should be part of the used infrastructure.",
        "categories": ["applicationAdministration", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.INFRASTRUCTURE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Reznik2019", "section": "10 Dynamic Scheduling" }, { "key": "Garrison2017", "section": "7 Resource Allocation and Scheduling" }, { "key": "Ibryam2020", "section": "6 Automated Placement" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; Resource Management" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; Automatic provisioning" }, { "key": "Goniwada2021", "section": "16 Automated Placement" }],
        "measures": ["ratioOfDeploymentsOnDynamicInfrastructure"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
            "evaluation": "dynamicScheduling",
            "measures": ["ratioOfDeploymentsOnDynamicInfrastructure"],
            "reasoning": "The higher the number of deployment mappings on a platform or cloud service, the more this factor is fulfilled."
        }]
    },
    "serviceIndependence": {
        "name": "Service independence",
        "description": "Services are as independent as possible throughout their lifecycle, that means development, operation, and evolution. Changes to one service have a minimum impact on other services.",
        "categories": ["businessDomain", "networkCommunication", "cloudInfrastructure", "applicationAdministration", "dataManagement"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.LINK, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
        "sources": [{ "key": "Goniwada2021", "section": "3 Decentralize Everything Principle (Decentralize deployment, governance)" }],
        "measures": [],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
            "evaluation": "aggregateImpacts",
            "reasoning": "Depends on various aspects of how services depend on each other. Each aspect can have an impact",
            "measures": [],
            "precondition": "majority",
            "impactsInterpretation": "mean"
        }]
    },
    "lowCoupling": {
        "name": "Low coupling",
        "description": "The coupling in a system is low in terms of links between components. Each link represents a dependency and therefore decreases service independence.",
        "categories": ["businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.LINK, ENTITIES.ENDPOINT, ENTITIES.DATA_AGGREGATE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
        "sources": [],
        "measures": ["numberOfLinksPerComponent", "numberOfConsumedEndpoints", "incomingOutgoingRatioOfAComponent", "ratioOfOutgoingLinksOfAService", "couplingDegreeBasedOnPotentialCoupling", "interactionDensityBasedOnComponents", "interactionDensityBasedOnLinks", "serviceCouplingBasedOnEndpointEntropy", "systemCouplingBasedOnEndpointEntropy", "modularityQualityBasedOnCohesionAndCoupling", "combinedMetricForIndirectDependency", "servicesInterdependenceInTheSystem", "indirectInteractionDensity", "averageNumberOfDirectlyConnectedServices", "numberOfComponentsThatAreLinkedToAComponent", "numberOfComponentsAComponentIsLinkedTo", "numberOfLinksBetweenTwoServices", "aggregateSystemMetricToMeasureServiceCoupling", "numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents", "degreeOfCouplingInASystem", "serviceCouplingBasedOnDataExchangeComplexity", "simpleDegreeOfCouplingInASystem", "directServiceSharing", "transitivelySharedServices", "ratioOfSharedNonExternalComponentsToNonExternalComponents", "ratioOfSharedDependenciesOfNonExternalComponentsToPossibleDependencies", "degreeOfDependenceOnOtherComponents", "averageSystemCoupling", "couplingOfServicesBasedOnUsedDataAggregates", "couplingOfServicesBasedServicesWhichCallThem", "couplingOfServicesBasedServicesWhichAreCalledByThem", "couplingOfServicesBasedOnAmountOfRequestTracesThatIncludeASpecificLink", "couplingOfServicesBasedTimesThatTheyOccurInTheSameRequestTrace", "totalNumberOfLinksInASystem", "numberOfServicesWhichHaveIncomingLinks", "numberOfServicesWhichHaveOutgoingLinks", "numberOfServicesWhichHaveBothIncomingAndOutgoingLinks"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.COMPONENT],
                "evaluation": "lowCouplingForComponent",
                "measures": ["numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents"],
                "reasoning": "Evaluation is based on the number of components a component is linked to relative to the total amount of components. The higher this metric is, the less this factor is fulfilled."
            },
            {
                "targetEntities": [ENTITIES.SYSTEM],
                "evaluation": "lowCouplingForSystem",
                "measures": ["degreeOfCouplingInASystem"],
                "reasoning": "Evaluation is based on the degree of coupling in the system. The higher this degree is, the less this factor is fulfilled."
            }]
    },
    "functionalDecentralization": {
        "name": "Functional decentralization",
        "description": "Business functionality is decentralized over the system as a whole to separate unrelated functionalities from each other and make components more independent.",
        "categories": ["businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.LINK, ENTITIES.ENDPOINT, ENTITIES.REQUEST_TRACE],
        "applicableEntities": [ENTITIES.SYSTEM],
        "sources": [],
        "measures": ["conceptualModularityQualityBasedOnDataAggregateCohesionAndCoupling", "cyclicCommunication", "numberOfSynchronousCycles", "relativeImportanceOfTheService", "extentOfAggregationComponents", "systemCentralization", "densityOfAggregation", "aggregatorCentralization", "dataAggregateConvergenceAcrossComponents", "serviceCriticality", "ratioOfCyclicRequestTraces", "numberOfPotentialCyclesInASystem", "dataAggregateSpread", "requestTraceSimilarityBasedOnIncludedComponents"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM],
            "evaluation": "functionalDecentralization",
            "measures": ["dataAggregateSpread", "requestTraceSimilarityBasedOnIncludedComponents"],
            "reasoning": "Evaluation is based on Data Aggregate Spread and Request trace simiarlity. If both measures are available, they equally contribute to the evaluation. If only on measure is available, only this is used."
        }]
    },
    "limitedRequestTraceScope": {
        "name": "Limited request trace scope",
        "description": "A request that requires the collaboration of several services is still limited to as few services as possible. Otherwise, the more services are part of a request trace the more dependent they are on each other.",
        "categories": ["businessDomain", "networkCommunication"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.LINK, ENTITIES.ENDPOINT, ENTITIES.REQUEST_TRACE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [],
        "measures": ["maximumLengthOfServiceLinkChainPerRequestTrace", "maximumNumberOfServicesWithinARequestTrace", "numberOfRequestTraces", "averageComplexityOfRequestTraces", "requestTraceComplexity", "requestTraceLength", "numberOfCyclesInRequestTraces", "ratioOfRequestTracesContainingFrontend"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM],
            "evaluation": "limitedRequestTraceScopeForSystem",
            "measures": ["averageComplexityOfRequestTraces", "maximumNumberOfServicesWithinARequestTrace"],
            "reasoning": "Evaluation is based on the number of involved links and components of request traces. On the system level, the evaluation is averaged across request traces."
        },
        {
            "targetEntities": [ENTITIES.REQUEST_TRACE],
            "evaluation": "limitedRequestTraceScopeForRequestTrace",
            "measures": ["requestTraceComplexity", "maximumNumberOfServicesWithinARequestTrace"],
            "reasoning": "Evaluation is based on the number of involved links and components of a request traces"
        }]
    },
    "logicalGrouping": {
        "name": "Logical grouping",
        "description": "Services are logically grouped so that services which are related (for example by having many links or processing the same data aggregates) are in the same group, but services which are more independent are separated in different groups. That way a separation can also be achieved on the network and infrastructure level by separating service groups more strictly, such as having different subnets for such logical groups or not letting different groups run on the same infrastructure. Potential impacts of a compromised or misbehaving service can therefore be reduced to the group to which it belongs but other groups are ideally unaffected.",
        "categories": ["cloudInfrastructure", "applicationAdministration", "businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.LINK, ENTITIES.NETWORK],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
        "sources": [{ "key": "Scholl2019", "section": "6 Use Namespaces to Organize Services in Kubernetes" }, { "key": "Arundel2019", "section": "5 Using Namespaces" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; Componentization and isolation" }],
        "measures": ["namespaceSeparation"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
            "evaluation": "logicalGrouping",
            "measures": ["namespaceSeparation"],
            "reasoning": "Evaluation of this factor is based on namespaces. The more components are separated and thus grouped by namespaces, the more the factor is fullfilled"
        }]
    },
    "backingServiceDecentralization": {
        "name": "Backing service decentralization",
        "description": "Different backing services are assigned to different components. That way, a decentralization is achieved. For example, instead of one message broker for a whole system, several message brokers can be used, each for a group of components that are interrelated. A problem in one messaging broker has an impact on only those components using it, but not on components having separate message brokers.",
        "categories": ["applicationAdministration", "cloudInfrastructure", "dataManagement"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.LINK, ENTITIES.BACKING_SERVICE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
        "sources": [{ "key": "Indrasiri2021", "section": "4 Decentralized Data Management (decentralized data leads to higher service independence while centralized data leads to higher consistency.)" }, { "key": "Indrasiri2021", "section": "4 Data Service Pattern (As having a negative impact because multiple services should not access the same data);" }, { "key": "Ruecker2021", "section": "2 Different Workflow Engines for different services" }, { "key": "Goniwada2021", "section": "5 Distributed State, Decentralized Data" }],
        "measures": ["degreeOfStorageBackendSharing", "ratioOfStorageBackendSharing", "sharedStorageBackingServiceInteractions", "databaseTypeUtilization", "numberOfServiceConnectedToStorageBackingService", "ratioOfBrokerBackendSharing", "averageStorageBackendSharing", "averageWeightedStorageBackendSharing", "averageBrokerBackendSharing", "averageWeightedBrokerBackendSharing"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM],
            "evaluation": "backingServiceDecentralizationForSystem",
            "measures": ["averageWeightedStorageBackendSharing", "averageWeightedBrokerBackendSharing"],
            "reasoning": "Evaluation is based on the average sharing of backing services (storage backing services and broker services). The lower the sharing, the higher the decentralization and thus the fulfillment of this factor"
        },
        {
            "targetEntities": [ENTITIES.COMPONENT],
            "evaluation": "backingServiceDecentralizationForComponent",
            "measures": ["ratioOfStorageBackendSharing", "ratioOfBrokerBackendSharing"],
            "reasoning": "Evaluation is based on the ratio of backend sharing (storage backing services and broker services). The lower the sharing, the higher the decentralization and thus the fulfillment of this factor"
        }]
    },
    "addressingAbstraction": {
        "name": "Addressing abstraction",
        "description": "In a link from one component to another the specific addresses for reaching the other component is not used, but instead an abstract address is used. That way, the specific addresses of components can be changed without impacting the link between components. This can be achieved for example through service discovery where components are addressed through abstract service names and specific addresses are resolved through service discovery which can be implemented in the infrastructure or a backing service.",
        "categories": ["networkCommunication"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.LINK, ENTITIES.BACKING_SERVICE, ENTITIES.INFRASTRUCTURE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Davis2019", "section": "8.3" }, { "key": "Ibryam2020", "section": "12 Service Discovery" }, { "key": "Richardson2019", "section": "Using service discovery" }, { "key": "Garrison2017", "section": "7 Service Discovery" }, { "key": "Indrasiri2021", "section": "3 Service Registry and Discovery Pattern" }, { "key": "Bastani2017", "section": "7 Routing (Use service discovery with support for health checks and respect varying workloads)" }, { "key": "Indrasiri2021", "section": "3 Service Abstraction Pattern (Use an abstraction layer in front of services (for example Kubernetes Service))" }, { "key": "Goniwada2021", "section": "4 Service Discovery" }],
        "measures": ["serviceDiscoveryUsage"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
                "evaluation": "addressingAbstraction",
                "measures": ["serviceDiscoveryUsage"],
                "reasoning": "The more communication uses abstract addresses for communication partners, the higher is the adressing abstraction. Usage of abstract addresses can be measured by the usage of service discovery mechanisms."
            },
        ]
    },
    "sparsity": {
        "name": "Sparsity",
        "description": "The more sparse a system is, the less components there are which need to be operated and maintained by the developers of a system. This covers all types of components, such as services, backing services, storage backing services, and also the infrastructure.",
        "categories": ["applicationAdministration", "businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.LINK, ENTITIES.ENDPOINT, ENTITIES.INFRASTRUCTURE],
        "applicableEntities": [ENTITIES.SYSTEM],
        "sources": [],
        "measures": ["averageNumberOfEndpointsPerService", "numberOfDependencies", "numberOfVersionsPerService", "concurrentlyAvailableVersionsComplexity", "serviceSupportForTransactions", "numberOfComponents", "numberOfServices", "numberOfBackingServices"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM],
                "evaluation": "sparsity",
                "measures": ["numberOfComponents"],
                "reasoning": "The more components there are in a system, the less sparse it is. Although the evaluation is quite subjective, for a general tendency, this evaluation considers systems sparse that have less than 10 components."
            },
        ]
    },
    "operationOutsourcing": {
        "name": "Operation outsourcing",
        "description": "By outsourcing the operation of infrastructure and components to a cloud provider or other vendor, the operation is simplified because responsibility is transferred. Furthermore, costs can be made more flexible because providers and vendors can provide a usage-based pricing.",
        "categories": ["applicationAdministration", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE],
        "sources": [],
        "measures": ["ratioOfProviderManagedComponentsAndInfrastructure"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM],
            "evaluation": "operationOutsourcing",
            "measures": ["ratioOfProviderManagedComponentsAndInfrastructure"],
            "reasoning": "Depends on both the outsourcing (management by provider) of components and infrastructure.",
        },
        {
            "targetEntities": [ENTITIES.COMPONENT],
            "evaluation": "aggregateImpacts",
            "reasoning": "Depends on the factor Managed backing services",
            "measures": [],
            "precondition": "at-least-one",
            "impactsInterpretation": "median"
        },
        {
            "targetEntities": [ENTITIES.INFRASTRUCTURE],
            "evaluation": "aggregateImpacts",
            "measures": [],
            "reasoning": "Depends on the factor Managed infrastructure",
            "precondition": "at-least-one",
            "impactsInterpretation": "median"
        }]
    },
    "managedInfrastructure": {
        "name": "Managed infrastructure",
        "description": "Infrastructure such as basic computing, storage or network resources, but potentially also software infrastructure (for example a container orchestration engine) is managed by a cloud provider who is responsible for a stable functioning and up-to-date functionalities. The more infrastructure is managed, the more operational responsibility is transferred. This will also be reflected in the costs which are then calculated more on usage-based pricing schemes.",
        "categories": ["applicationAdministration", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE],
        "sources": [],
        "measures": ["ratioOfFullyManagedInfrastructure"],
        "evaluations": [{
            "targetEntities": [ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM],
            "evaluation": "managedInfrastructure",
            "measures": ["ratioOfFullyManagedInfrastructure"],
            "reasoning": "The more infrastructure entities are managed by a provider, the more this factor is fulfilled."
        }]
    },
    "managedBackingServices": {
        "name": "Managed backing services",
        "description": "Backing services that provide non-business functionality are operated and managed by vendors who are responsible for a stable functioning and up-to-date functionalities. Operational responsibility is transferred which is also reflected in the costs which are then calculated more on usage-based pricing schemes.",
        "categories": ["applicationAdministration", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.BACKING_SERVICE, ENTITIES.BROKER_BACKING_SERVICE, ENTITIES.PROXY_BACKING_SERVICE, ENTITIES.STORAGE_BACKING_SERVICE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
        "sources": [{ "key": "Scholl2019", "section": "6 Use Managed Databases and Analytics Services" }, { "key": "Arundel2019", "section": "15 Don't build your own monitoring infrastructure (Use an external monitoring service)" }, { "key": "Bastani2017", "section": "10 managed and automated messaging system (operating your own messaging system increases operational overhead, better use a system managed by a platform)" }],
        "measures": ["ratioOfManagedBackingServices"],
        "evaluations": [{
            "targetEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM],
            "evaluation": "managedBackingServices",
            "measures": ["ratioOfManagedBackingServices"],
            "reasoning": "The more backing services are managed by a provider, the more this factor is fulfilled."
        }]
    },
    "replication": {
        "name": "Replication",
        "description": "Business logic and needed data is replicated at various points in a system so that latencies can be minimized and requests can be distributed for fast request handling.",
        "categories": ["applicationAdministration", "dataManagement", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.DATA_AGGREGATE, ENTITIES.DEPLOYMENT_MAPPING, ENTITIES.INFRASTRUCTURE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT],
        "sources": [],
        "measures": [],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
                "evaluation": "aggregateImpacts",
                "measures": [],
                "reasoning": "Replication can be achieved in different ways, each way already having a positive impact. Therefore if any of the underlying factors is present, replication is increased.",
                "precondition": "at-least-one",
                "impactsInterpretation": "mean"
            },
        ]
    },
    "serviceReplication": {
        "name": "Service replication",
        "description": "Services and therefore their provided functionalities are replicated across different locations so that the latency for accesses from different locations is minimized and the incoming load can be distributed among replicas.",
        "categories": ["applicationAdministration", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.SYSTEM, ENTITIES.SERVICE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Davis2019", "section": "5.1. Cloud-native apps have many instances deployed" }, { "key": "Scholl2019", "section": "6 Design Stateless Services That Scale Out" }],
        "measures": ["amountOfRedundancy", "serviceReplicationLevel", "medianServiceReplication", "smallestReplicationValue"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
                "evaluation": "serviceReplication",
                "measures": ["serviceReplicationLevel", "amountOfRedundancy"],
                "reasoning": "Service replication is measured by the number of replicas for a service and the redudancy introduced by deploying it on multiple infrastructure instances."
            },
        ]
    },
    "horizontalDataReplication": {
        "name": "Horizontal data replication",
        "description": "Data is replicated horizontally, that means duplicated across several instances of a storage backing service so that a higher load can be handled and replicas closer to the service where data is needed can be used to reduce latency.",
        "categories": ["applicationAdministration", "dataManagement"],
        "relevantEntities": [ENTITIES.STORAGE_BACKING_SERVICE, ENTITIES.DATA_AGGREGATE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE, ENTITIES.COMPONENT],
        "sources": [{ "key": "Scholl2019", "section": "6 Use Data Partitioning and Replication for Scale" }, { "key": "Goniwada2021", "section": "4 Data Replication" }],
        "measures": ["storageReplicationLevel"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
                "evaluation": "horizontalDataReplication",
                "measures": ["storageReplicationLevel"],
                "reasoning": "Horizontal data replication is measured by the number of replicas for storage backing services."
            },
        ]
    },
    "verticalDataReplication": {
        "name": "Vertical data replication",
        "description": "Data is replicated vertically, that means across a request trace so that it is available closer to where a request initially comes in. Typically caching is used for vertical data replication.",
        "categories": ["applicationAdministration", "dataManagement"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.DATA_AGGREGATE, ENTITIES.REQUEST_TRACE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE, ENTITIES.COMPONENT],
        "sources": [{ "key": "Scholl2019", "section": "6 Use Caching" }, { "key": "Bastani2017", "section": "9 Caching (Use an In-Memory cache for queries to relieve datastore from traffic; replication into faster data storage)" }, { "key": "Indrasiri2021", "section": "4 Caching Pattern" }],
        "measures": ["ratioOfCachedDataAggregates", "dataReplicationAlongRequestTrace"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM],
                "evaluation": "systemVerticalDataReplication",
                "measures": ["ratioOfCachedDataAggregates"],
                "reasoning": "Data is replicated vertically if data aggregates are cached by those components using them."
            },
            {
                "targetEntities": [ENTITIES.REQUEST_TRACE],
                "evaluation": "requestTraceVerticalDataReplication",
                "measures": ["dataReplicationAlongRequestTrace"],
                "reasoning": "Data is replicated vertically if data aggregates used throughout a request trace are cached by the involved components."
            },
        ]
    },
    "shardedDataStoreReplication": {
        "name": "Sharded data store replication",
        "description": "Data storage is sharded, that means data is split into several storage backing service instances by a certain strategy so that requests can be distributed across shards to increase performance. One example strategy could be to shard data geographically, that means user data from one location is stored in one shard while user data from another location is stored in a different shard. One storage backing service instance is then less likely to be overloaded with requests, because the number of potential requests is limited by the amount of data in that instance.",
        "categories": ["applicationAdministration", "dataManagement"],
        "relevantEntities": [ENTITIES.STORAGE_BACKING_SERVICE, ENTITIES.DATA_AGGREGATE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE, ENTITIES.COMPONENT],
        "sources": [{ "key": "Indrasiri2021", "section": "4 Data Sharding Pattern" }, { "key": "Goniwada2021", "section": "4 Data Partitioning Pattern" }],
        "measures": ["dataShardingLevel"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE, ENTITIES.COMPONENT],
                "evaluation": "shardedDataStoreReplication",
                "measures": ["dataShardingLevel"],
                "reasoning": "Sharding is a specific form of replication and is measured by the amount of shards used by each storage backing service."
            },
        ]
    },
    "enforcementOfAppropriateResourceBoundaries": {
        "name": "Enforcement of appropriate resource boundaries",
        "description": "The resources required by a component are predictable as precisely as possible and specified accordingly for each component in terms of lower and upper boundaries. Resources include CPU, memory, GPU, or Network requirements. This information is used by the infrastructure to enforce these resource boundaries. Thereby it is ensured that a component has the resources available that it needs to function properly, that the infrastructure can optimize the amount of allocated resource, and that components are not negatively impacted by defective components which excessively consume resources.",
        "categories": ["applicationAdministration", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE],
        "sources": [{ "key": "Scholl2019", "section": "6 Define CPU and Memory Limits for Your Containers" }, { "key": "Arundel2019", "section": "5 Resource Limits" }, { "key": "Ibryam2020", "section": "2 Defined Resource requirements" }, { "key": "Arundel2019", "section": "5 Resource Quotas (limit maximum resources for a namespace)" }, { "key": "Goniwada2021", "section": "3 Runtime Confinement Principle, 6 Predictable Demands" }],
        "measures": ["ratioOfInfrastructureEnforcingResourceBoundaries", "ratioOfDeploymentMappingsWithStatedResourceRequirements"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM],
                "evaluation": "enforcementOfAppropriateResourceBoundaries",
                "measures": ["ratioOfInfrastructureEnforcingResourceBoundaries", "ratioOfDeploymentMappingsWithStatedResourceRequirements"],
                "reasoning": "Enforcement of appropriate resource boundaries is evaluated based on infrastructure entities. The more infrastructure entities support it, the more this factor is fullfilled."
            },
            {
                "targetEntities": [ENTITIES.COMPONENT],
                "evaluation": "enforcementOfAppropriateResourceBoundariesForComponents",
                "measures": ["ratioOfDeploymentMappingsWithStatedResourceRequirements"],
                "reasoning": "Enforcement of appropriate resource boundaries is evaluated based on deployment mappings of components that state resource boundaries. Only then it is possible to have suitable resource boundaries."
            },
        ]
    },
    "builtInAutoscaling": {
        "name": "Built-in autoscaling",
        "description": "Horizontal up- and down-scaling of components is automated and built into the infrastructure on which components run. Horizontal scaling means that component instances are replicated when the load increases and components instances are removed when load decreases. This autoscaling is based on rules which can be configured according to system needs.",
        "categories": ["applicationAdministration", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE],
        "sources": [{ "key": "Scholl2019", "section": "6 Use Platform Autoscaling Features" }, { "key": "Ibryam2020", "section": "24 Elastic Scale" }, { "key": "Bastani2017", "section": "13 Autoscaling" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; Scaling" }, { "key": "Goniwada2021", "section": "5 Elasticity in Microservices" }],
        "measures": ["deployedEntitiesAutoscaling", "infrastructureAutoscaling"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM],
                "evaluation": "builtInAutoscaling",
                "measures": ["deployedEntitiesAutoscaling", "infrastructureAutoscaling"],
                "reasoning": "The evaluation of this factor considers whether the used infrastructure can on the one hand automatically scale the components deployed on it and on the other hand whether it can scale itself."
            },
            {
                "targetEntities": [ENTITIES.COMPONENT],
                "evaluation": "builtInAutoscalingForComponent",
                "measures": ["deployedEntitiesAutoscaling"],
                "reasoning": "For single components it is evaluated whether the infrastructure that it is deployed on supports autoscaling."
            },
        ]
    },
    "infrastructureAbstraction": {
        "name": "Infrastructure abstraction",
        "description": "The used infrastructure such as physical hardware, virtual hardware, or software platform is abstracted by clear boundaries to enable a clear differentiation of responsibilities for operating and managing infrastructure. For example, when a managed container orchestration system is used, the system is operable on that level of abstraction meaning that the API of the orchestration system is the boundary. Problems with underlying hardware or VMs are handled transparently by the provider.",
        "categories": ["applicationAdministration", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.INFRASTRUCTURE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE],
        "sources": [{ "key": "Bastani2017", "section": "14 Service Brokers (make use of service brokers as an additional level of abstraction to automatically add or remove backing services)" }, { "key": "Goniwada2021", "section": "3 Location-Independent Principle" }],
        "measures": ["ratioOfAbstractedHardware"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM],
                "evaluation": "infrastructureAbstraction",
                "measures": ["ratioOfAbstractedHardware"],
                "reasoning": "The evaluation of this factor considers whether the used infrastructure abstracts from underlying hardware. Thus components can be deployed on a platform without having to consider the underlying hardware."
            },
        ]
    },
    "cloudVendorAbstraction": {
        "name": "Cloud vendor abstraction",
        "description": "The managed infrastructure and backing services used by a system and provided by a cloud vendor are based on unified or standardized interfaces so that vendor specifics are abstracted and a system could potentially be transferred to a another cloud vendor offering the same unified or standardized interfaces.",
        "categories": ["applicationAdministration", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.INFRASTRUCTURE, ENTITIES.COMPONENT],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE],
        "sources": [{ "key": "Indrasiri2021", "section": "1 Dynamic Management; Multicloud support" }],
        "measures": ["servicePortability", "nonProviderSpecificInfrastructureArtifacts", "nonProviderSpecificComponentArtifacts"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM],
                "evaluation": "cloudVendorAbstraction",
                "measures": ["nonProviderSpecificInfrastructureArtifacts", "nonProviderSpecificComponentArtifacts"],
                "reasoning": "The evaluation of this factor considers whether artifacts used for components and infrastructure are specific to certain cloud providers or not."
            },
            {
                "targetEntities": [ENTITIES.INFRASTRUCTURE],
                "evaluation": "cloudVendorAbstractionForInfrastructure",
                "measures": ["nonProviderSpecificInfrastructureArtifacts"],
                "reasoning": "The evaluation of this factor considers whether artifacts used for infrastructure are specific to certain cloud providers or not."
            },
            {
                "targetEntities": [ENTITIES.COMPONENT],
                "evaluation": "cloudVendorAbstractionForComponents",
                "measures": ["nonProviderSpecificComponentArtifacts"],
                "reasoning": "The evaluation of this factor considers whether artifacts used for components are specific to certain cloud providers or not."
            },
        ]
    },
    "configurationManagement": {
        "name": "Configuration management",
        "description": "Configuration values which are specific to an environment are managed separately in a consistent way. Through this, components are more portable across environments and configuration can change independently from components.",
        "categories": ["applicationAdministration", "dataManagement"],
        "relevantEntities": [ENTITIES.BACKING_DATA, ENTITIES.INFRASTRUCTURE, ENTITIES.COMPONENT],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.REQUEST_TRACE],
        "sources": [],
        "measures": [],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
                "evaluation": "aggregateImpacts",
                "measures": [],
                "reasoning": "Configuration management is concered with where and how config data is stored and how it is made accessible to components which need them.",
                "precondition": "at-least-one",
                "impactsInterpretation": "median"
            }
        ]
    },
    "isolatedConfiguration": {
        "name": "Isolated configuration",
        "description": "Following DevOps principles, environment-specific configurations are separated from component artifacts (e.g. deployment units) and provided by the environment in which a cloud-native application runs. This enables adaptability across environments (also across testing and production environments)",
        "categories": ["applicationAdministration", "dataManagement"],
        "relevantEntities": [ENTITIES.BACKING_DATA, ENTITIES.INFRASTRUCTURE, ENTITIES.COMPONENT],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Davis2019", "section": "6.2 The app's configuration layer" }, { "key": "Ibryam2020", "section": "18 EnvVar Configuration" }, { "key": "Scholl2019", "section": "6 Never Store Secrets or Configuration Inside an Image" }, { "key": "Adkins2020", "section": "14 Treat Configuration as Code" }, { "key": "Indrasiri2021", "section": "1 Decoupled Configurations" }],
        "measures": ["configurationExternalization"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.REQUEST_TRACE],
                "evaluation": "isolatedConfiguration",
                "measures": ["configurationExternalization"],
                "reasoning": "Configuration is isolated, when it is externalized from those components that use it. The more configuration data is externalized, the more this factor is fulfilled."
            },
        ]
    },
    "configurationStoredInSpecializedServices": {
        "name": "Configuration stored in specialized services",
        "description": "Configuration values are stored in specialized backing services and not only environment variables for example. That way, changing configurations at runtime is facilitated and can be enabled by connecting components to such specialized backing services and checking for updated configurations at runtime. Additionally, configurations can be stored once, but accessed by different components.",
        "categories": ["applicationAdministration", "dataManagement"],
        "relevantEntities": [ENTITIES.BACKING_DATA, ENTITIES.INFRASTRUCTURE, ENTITIES.COMPONENT, ENTITIES.BACKING_SERVICE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE],
        "sources": [{ "key": "Ibryam2020", "section": "19 Configuration Resource" }, { "key": "Richardson2019", "section": "11.2 “Designing configurable services" }, { "key": "Arundel2019", "section": "10 ConfigMaps" }, { "key": "Bastani2017", "section": "3 Centralized, Journaled Configuration" }, { "key": "Bastani2017", "section": "3 Refreshable Configuration" }],
        "measures": ["configurationStoredInConfigService"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE],
            "evaluation": "configurationStoredInSpecializedServices",
            "measures": ["configurationStoredInConfigService"],
            "reasoning": "The more config data is stored in specialized config services, the more this factor is fulfilled."
        },]
    },
    "contractBasedLinks": {
        "name": "Contract-based links",
        "description": "Contracts are defined for the communication via links so that changes to endpoints can be evaluated by their impact on the contract and delayed when a contract would be broken. That way consumers of endpoints can adapt to changes when necessary without suddenly breaking communication via a link due to a changed endpoint.",
        "categories": ["networkCommunication", "businessDomain"],
        "relevantEntities": [ENTITIES.LINK, ENTITIES.ENDPOINT, ENTITIES.COMPONENT],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Bastani2017", "section": "4 Consumer-Driven Contract Testing (Use contracts for APIs to test against)" }],
        "measures": ["ratioOfEndpointsCoveredByContract"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
                "evaluation": "contractBasedLinks",
                "measures": ["ratioOfEndpointsCoveredByContract"],
                "reasoning": "The more endpoints are covered by a contract artifact, the more this factor is fulfilled."
            },
        ]
    },
    "standardizedSelfContainedDeploymentUnit": {
        "name": "Standardized self-contained deployment unit",
        "description": "The components are deployed as standardized self-contained units so that the same artifact can reliably be installed and run in different environments and on different infrastructure.",
        "categories": ["cloudInfrastructure", "applicationAdministration"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Reznik2019", "section": "10 Containerized Apps" }, { "key": "Adkins2020", "section": "7 Use Containers (smaller deployments, separated operating system, portable);" }, { "key": "Indrasiri2021", "section": "1 Use Containerization and Container Orchestration" }, { "key": "Garrison2017", "section": "7 Application Runtime and Isolation" }, { "key": "Goniwada2021", "section": "3 Deploy Independently Principle (deploy services in independent containers), Self-Containment Principle, 5 Containerization" }],
        "measures": ["standardizedDeployments", "selfContainedDeployments"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
                "evaluation": "standardizedSelfContainedDeploymentUnit",
                "measures": ["standardizedDeployments", "selfContainedDeployments"],
                "reasoning": "The evaluation is based on whether artifacts of components are standardized and self-contained, both aspects contribute equally to the fulfillment of this factor."
            },
        ]
    },
    "immutableArtifacts": {
        "name": "Immutable artifacts",
        "description": "Infrastructure and components of a system are defined and described in its entirety at development time so that artifacts are immutable at runtime. This means upgrades are introduced at runtime through replacement of components instead of modification. Furthermore components do not differ across environments and in case of replication all replicas are identical to avoid unexpected behavior.",
        "categories": ["applicationAdministration"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.DEPLOYMENT_MAPPING, ENTITIES.INFRASTRUCTURE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE],
        "sources": [{ "key": "Scholl2019", "section": "6 Don't Modify Deployed Infrastructure" }, { "key": "Indrasiri2021", "section": "1 Containerization" }, { "key": "Goniwada2021", "section": "3 Process Disposability Principle, Image Immutability Principle" }],
        "measures": ["numberOfDeploymentTargetEnvironments", "replacingDeployments"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE],
                "evaluation": "immutableArtifacts",
                "measures": ["replacingDeployments"],
                "reasoning": "The evaluation is based on whether the deployment mappings in focus are immutable in the sense that they do not allow in-place updates, but instead replacing updates."
            },
        ]
    },
    "guardedIngress": {
        "name": "Guarded ingress",
        "description": "Ingress communication, that means communication coming from outside of a system, needs to be guarded. It should be ensured that access to external endpoints is controlled by components offering these external endpoints. Control means for example that only authorized access is possible, maliciously large load is blocked, or secure communication protocols are ensured.",
        "categories": ["networkCommunication", "applicationAdministration"],
        "relevantEntities": [ENTITIES.ENDPOINT, ENTITIES.EXTERNAL_ENDPOINT, ENTITIES.COMPONENT, ENTITIES.PROXY_BACKING_SERVICE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Scholl2019", "section": "6 Implement Rate Limiting and Throttling" }, { "key": "Adkins2020", "section": "8 Throttling (Delaying processing or responding to remain functional and decrease traffic from individual clients) (should be automated, part of graceful degradation)" }, { "key": "Adkins2020", "section": "8 Load shedding (In case of traffic spike, deny low priority requests to remain functional) (should be automated, part of graceful degradation)" }, { "key": "Goniwada2021", "section": "5 Throttling " }],
        "measures": ["ratioOfComponentsWhoseExternalIngressIsProxied"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
            "evaluation": "guardedIngress",
            "measures": ["ratioOfComponentsWhoseExternalIngressIsProxied"],
            "reasoning": "The evaluation is based on whether the external ingress traffic on considered components is proxied. Proxies can provide analysis, transformation and filtering of incoming traffic."
        },]
    },
    "distribution": {
        "name": "Distribution",
        "description": "Components are distributed across locations and data centers for better availability, reliability, and performance.",
        "categories": ["dataManagement", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.REQUEST_TRACE],
        "sources": [],
        "measures": ["componentDensity", "numberOfServiceHostedOnOneInfrastructure", "numberOfAvailabilityZonesUsedByInfrastructure"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
                "evaluation": "aggregateImpacts",
                "measures": [],
                "reasoning": "The evaluation is based on the factors Physical Data Distribution and Physical Service Distribution.",
                "precondition": "at-least-one",
                "impactsInterpretation": "median"
            },
            {
                "targetEntities": [ENTITIES.INFRASTRUCTURE],
                "evaluation": "distribution",
                "measures": ["numberOfAvailabilityZonesUsedByInfrastructure"],
                "reasoning": "The evaluation is based on whether the infrastructure is using multiple availability zones. The factor is fulfilled low if more than one availability zone is used, and increasing to moderate if three are used to high if five or more are used."
            }
        ]
    },
    "physicalDataDistribution": {
        "name": "Physical data distribution",
        "description": "Storage Backing Service instances where Data aggregates are persisted are distributed across physical locations (e.g. availability zones of a cloud vendor) so that even in the case of a failure of one physical location, another physical location is still useable.",
        "categories": ["dataManagement", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING, ENTITIES.DATA_AGGREGATE, ENTITIES.STORAGE_BACKING_SERVICE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Scholl2019", "section": "6 Keep Data in Multiple Regions or Zones" }, { "key": "Indrasiri2021", "section": "4 Data Sharding Pattern: Geographically distribute data" }],
        "measures": ["numberOfAvailabilityZonesUsedByStorageServices"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
            "evaluation": "physicalDataDistribution",
            "measures": ["numberOfAvailabilityZonesUsedByStorageServices"],
            "reasoning": "The evaluation is based on whether the storage service are deployed on infrastructure using multiple availability zones. The factor is fulfilled low if more than one availability zone is used, and increasing to moderate if three are used to high if five or more are used."
        },]
    },
    "physicalServiceDistribution": {
        "name": "Physical service distribution",
        "description": "Components are distributed through replication across physical locations (e.g. availability zones of a cloud vendor) so that even in the case of a failure of one physical location, another physical location is still useable.",
        "categories": ["cloudInfrastructure"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [],
        "measures": ["numberOfAvailabilityZonesUsedByServices"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
            "evaluation": "physicalServiceDistribution",
            "measures": ["numberOfAvailabilityZonesUsedByServices"],
            "reasoning": "The evaluation is based on whether the services are deployed on infrastructure using multiple availability zones. The factor is fulfilled low if more than one availability zone is used, and increasing to moderate if three are used to high if five or more are used."
        },]
    },
    "seamlessUpgrades": {
        "name": "Seamless upgrades",
        "description": "Upgrades of services do not interfere with availability. There are different strategies, like rolling upgrades, to achieve this which should be provided as a capability by the infrastructure.",
        "categories": ["applicationAdministration", "cloudInfrastructure", "networkCommunication", "businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [],
        "measures": [],
        "evaluations": [{
            "targetEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
            "evaluation": "aggregateImpacts",
            "measures": [],
            "reasoning": "Seamless upgrades are possible if rolling upgrade of components can be done and are further simplified if components are proxied by gateways.",
            "precondition": "at-least-one",
            "impactsInterpretation": "median"
        }]
    },
    "rollingUpgradesEnabled": {
        "name": "Rolling upgrades enabled",
        "description": "The infrastructure on which components are deployed provides the ability for rolling upgrades. That means upgrades of components can be performed seamlessly in an automated manner. Seamlessly means that upgrades of components do not necessitate planned downtime.",
        "categories": ["applicationAdministration", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Davis2019", "section": "7.2" }, { "key": "Scholl2019", "section": "6 Use Zero-Downtime Releases" }, { "key": "Ibryam2020", "section": "3 Declarative Deployment" }, { "key": "Reznik2019", "section": "10 Risk-Reducing Deployment Strategies" }, { "key": "Arundel2019", "section": "13 Rolling Updates" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; Rolling upgrades" }],
        "measures": ["rollingUpdateOption", "rollingUpdates"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.SYSTEM],
                "evaluation": "rollingUpgradesEnabled",
                "measures": ["rollingUpdateOption", "rollingUpdates"],
                "reasoning": "The evaluation is based on whether the infrastructure entities on which components are deployed, support a rolling upgrade option and whether the components also use it via their deployment mappings"
            },
            {
                "targetEntities": [ENTITIES.INFRASTRUCTURE],
                "evaluation": "rollingUpgradesEnabledForInfrastructure",
                "measures": ["rollingUpdateOption"],
                "reasoning": "The evaluation is based on whether the infrastructure entities on which components are deployed, support a rolling upgrade option."
            },
            {
                "targetEntities": [ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
                "evaluation": "rollingUpgradesEnabledForComponents",
                "measures": ["rollingUpdates"],
                "reasoning": "The evaluation is based on whether the components use a rolling upgrade strategy via their deployment mappings"
            }
        ]
    },
    "automatedInfrastructureMaintenance": {
        "name": "Automated infrastructure maintenance",
        "description": "The used infrastructure should automate regular maintenance tasks as much as possible in a way that the operation of components is not impacted by these tasks. Such tasks include updates of operating systems, standard libraries, and middleware managed by the infrastructure, but also certificate regeneration.",
        "categories": ["cloudInfrastructure", "applicationAdministration"],
        "relevantEntities": [ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE],
        "sources": [{ "key": "Reznik2019", "section": "10 Automated Infrastructure" }, { "key": "Goniwada2021", "section": "5 Automation" }],
        "measures": ["ratioOfAutomaticallyMaintainedInfrastructure"],
        "evaluations": [{
            "targetEntities": [ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM],
            "evaluation": "automatedInfrastructureMaintenance",
            "measures": ["ratioOfAutomaticallyMaintainedInfrastructure"],
            "reasoning": "The more infrastructure entities are automatically maintained, the more this factor is fulfilled."
        }]
    },
    "autonomousFaultHandling": {
        "name": "Autonomous fault handling",
        "description": "Services expect faults at different levels and either handle them or minimize their impact by relying on the capabilities of cloud environments.",
        "categories": ["networkCommunication", "cloudInfrastructure"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.LINK, ENTITIES.ENDPOINT, ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [],
        "measures": [],
        "evaluations": [{
            "targetEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
            "evaluation": "aggregateImpacts",
            "measures": [],
            "reasoning": "Autonomous fault handling is evaluated based on the factors impacting it, mainly those considering the fault tolerance of communication links",
            "precondition": "at-least-one",
            "impactsInterpretation": "median"
        }]
    },
    "invocationTimeouts": {
        "name": "Invocation timeouts",
        "description": "For links between components, timeouts are defined to avoid infinite waiting on a service that is unavailable and a timely handling of problems.",
        "categories": ["networkCommunication"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.LINK, ENTITIES.ENDPOINT],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Indrasiri2021", "section": "3 Resilient Connectivity Pattern: Time-out" }, { "key": "Richardson2019", "section": "3.2.3 Handling partial failures using the Circuit Breaker pattern" }, { "key": "Goniwada2021", "section": "5 Timeout" }],
        "measures": ["ratioOfLinksWithTimeout"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
            "evaluation": "invocationTimeouts",
            "measures": ["ratioOfLinksWithTimeout"],
            "reasoning": "The evaluation is simply based on whether links within the system use timeouts, not specific timeout durations. The more links use a timeout, the more this factor is fulfilled."
        }]
    },
    "retriesForSafeInvocations": {
        "name": "Retries for safe invocations",
        "description": "Links that are safe to invoke multiple times without leading to unintended state changes, are automatically retried in case of errors to transparently handle transient faults in communication. That way faults can be prevented from being propagated higher up in a request trace.",
        "categories": ["networkCommunication"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.LINK, ENTITIES.ENDPOINT],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Davis2019", "section": "9.1" }, { "key": "Scholl2019", "section": "6 Handle Transient Failures with Retries" }, { "key": "Scholl2019", "section": "6 Use a Finite Number of Retries" }, { "key": "Bastani2017", "section": "12 Isolating Failures and Graceful Degradation: Use retries" }, { "key": "Indrasiri2021", "section": "3 Resilient Connectivity Pattern: Retry" }, { "key": "Ruecker2021", "section": "9 Synchronous Request/Response (Use retries in synchronous communications)" }, { "key": "Ruecker2021", "section": "9 The Importance of Idempotency (Communication which is retried needs idempotency)" }, { "key": "Goniwada2021", "section": "Idempotent Service Operation, Retry, 5 Retry " }],
        "measures": ["ratioOfLinksWithRetryLogic"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
            "evaluation": "retriesForSafeInvocations",
            "measures": ["ratioOfLinksWithRetryLogic"],
            "reasoning": "The evaluation is simply based on whether links within the system use retry logic if applicable. The more links use retries, the more this factor is fulfilled."
        }]
    },
    "circuitBreakedCommunication": {
        "name": "Circuit breaked communication",
        "description": "For links a circuit breaker implementation is used which avoids unnecessary communication and therefore waiting time if a communication is known to fail. Instead the circuit breaker immediately returns an error response of a default response, is possible, while periodically retrying communication in the background.",
        "categories": ["networkCommunication"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.LINK, ENTITIES.ENDPOINT],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Davis2019", "section": "10.1" }, { "key": "Scholl2019", "section": "6 Use Circuit Breakers for Nontransient Failures" }, { "key": "Richardson2019", "section": "3.2.3 Handling partial failures using the Circuit Breaker pattern" }, { "key": "Bastani2017", "section": "12 Isolating Failures and Graceful Degradation: circuit breaker" }, { "key": "Indrasiri2021", "section": "3 Resilient Connectivity Pattern: Circuit breaker" }, { "key": "Goniwada2021", "section": "4 Circuit Breaker" }],
        "measures": ["ratioOfLinksWithComplexFailover"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
            "evaluation": "circuitBreakedCommunication",
            "measures": ["ratioOfLinksWithComplexFailover"],
            "reasoning": "The evaluation is simply based on whether links within the system use circuit breakers. The more links use circuit breakers, the more this factor is fulfilled."
        }]
    },
    "automatedRestarts": {
        "name": "Automated restarts",
        "description": "When a component is found to be unhealthy, that means not functioning as expected, it is directly and automatically restarted. Ideally this capability is provided by the infrastructure on which a component is running.",
        "categories": ["cloudInfrastructure", "applicationAdministration"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE],
        "sources": [{ "key": "Bastani2017", "section": "13 automatic remediation" }, { "key": "Indrasiri2021", "section": "1 Why container orchestration?; High availability" }, { "key": "Goniwada2021", "section": "5 Self-Healing" }],
        "measures": ["deploymentsWithRestart"],
        "evaluations": [{
            "targetEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE],
            "evaluation": "automatedRestarts",
            "measures": ["deploymentsWithRestart"],
            "reasoning": "The evaluation is based on whether the deployment mappings of components include automated restarts in case of failing health checks."
        }]
    },
    "apiBasedCommunication": {
        "name": "API-based communication",
        "description": "All endpoints that are offered by a service are part of a well-defined and documented API. That means, the APIs are based on common principles, are declarative instead of imperative, and are documented in a standardized or specified format (such as the OpenAPI specification). Communication only happens via endpoints that are part of such APIs and can be both synchronous or asynchronous.",
        "categories": ["networkCommunication", "businessDomain"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.ENDPOINT, ENTITIES.LINK],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Reznik2019", "section": "9 Communicate Through APIs" }, { "key": "Adkins2020", "section": "6 Understandable Interface Specifications (Use Interface specifications for understandability" }, { "key": "Bastani2017", "section": "6 Everything is an API (Services are integrated via APIs)" }, { "key": "Indrasiri2021", "section": "2 Service Definitions in Synchronous Communication (Use a service definition for each service);" }, { "key": "Indrasiri2021", "section": "2 Service Definition in Asynchronous Communication (Use schemas to define message formats);" }, { "key": "Goniwada2021", "section": "3 API First Principle" }],
        "measures": ["ratioOfDocumentedEndpoints"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
                "evaluation": "apiBasedCommunication",
                "measures": ["ratioOfDocumentedEndpoints"],
                "reasoning": "Communication is based on documented APIs if documentation artifacts exist that specify an API and cover the endpoints of components."
            },
        ]
    },
    "consistentlyMediatedCommunication": {
        "name": "Consistently mediated communication",
        "description": "By mediating communication through additional components, there is no direct dependence on the other communication partner and additional operations can be performed to manage the communication, such as load balancing, monitoring, or the enforcement of policies. By using centralized mediation approaches, such as Service Meshes, management actions can be performed universally and consistently across the components of an application.",
        "categories": ["networkCommunication"],
        "relevantEntities": [ENTITIES.COMPONENT, ENTITIES.ENDPOINT, ENTITIES.LINK, ENTITIES.BACKING_SERVICE, ENTITIES.PROXY_BACKING_SERVICE],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
        "sources": [{ "key": "Indrasiri2021", "section": "3 Sidecar Pattern, Service Mesh Pattern, Service Abstraction Pattern (Proxy communication with services to include service discovery and load balancing)" }, { "key": "Davis2019", "section": "10.3" }, { "key": "Richardson2019", "section": "11.4.2" }],
        "measures": ["serviceMeshUsage", "ratioOfComponentsWhoseEgressIsProxied"],
        "evaluations": [
            {
                "targetEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
                "evaluation": "consistentlyMediatedCommunication",
                "measures": ["serviceMeshUsage"],
                "reasoning": "Communication is mediated, if ingress and egress of components is proxied for example by a service mesh"
            },
        ]
    }
} satisfies { [productFactorKey: string]: ProductFactorSpec }

const productFactorKeys = Object.freeze(productFactors);
export type ProductFactorKey = keyof typeof productFactorKeys;

type ImpactSpec = {
    impactedFactor: ProductFactorKey | QualityAspectKey,
    sourceFactor: ProductFactorKey,
    impactType: "positive" | "negative"
}

const impacts = [
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
    { "impactedFactor": "reusability", "sourceFactor": "componentSimilarity", "impactType": "positive" },
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
    { "impactedFactor": "availability", "sourceFactor": "horizontalDataReplication", "impactType": "positive" },
    { "impactedFactor": "replication", "sourceFactor": "verticalDataReplication", "impactType": "positive" },
    { "impactedFactor": "analyzability", "sourceFactor": "verticalDataReplication", "impactType": "negative" },
    { "impactedFactor": "availability", "sourceFactor": "verticalDataReplication", "impactType": "positive" },
    { "impactedFactor": "replication", "sourceFactor": "shardedDataStoreReplication", "impactType": "positive" },
    { "impactedFactor": "resourceUtilization", "sourceFactor": "enforcementOfAppropriateResourceBoundaries", "impactType": "positive" },
    { "impactedFactor": "availability", "sourceFactor": "enforcementOfAppropriateResourceBoundaries", "impactType": "positive" },
    { "impactedFactor": "availability", "sourceFactor": "builtInAutoscaling", "impactType": "positive" },
    { "impactedFactor": "elasticity", "sourceFactor": "builtInAutoscaling", "impactType": "positive" },
    { "impactedFactor": "adaptability", "sourceFactor": "infrastructureAbstraction", "impactType": "positive" },
    { "impactedFactor": "adaptability", "sourceFactor": "cloudVendorAbstraction", "impactType": "positive" },
    { "impactedFactor": "reusability", "sourceFactor": "cloudVendorAbstraction", "impactType": "positive" },
    { "impactedFactor": "adaptability", "sourceFactor": "configurationManagement", "impactType": "positive" },
    { "impactedFactor": "configurationManagement", "sourceFactor": "isolatedConfiguration", "impactType": "positive" },
    { "impactedFactor": "configurationManagement", "sourceFactor": "configurationStoredInSpecializedServices", "impactType": "positive" },
    { "impactedFactor": "interoperability", "sourceFactor": "contractBasedLinks", "impactType": "positive" },
    { "impactedFactor": "adaptability", "sourceFactor": "contractBasedLinks", "impactType": "positive" },
    { "impactedFactor": "installability", "sourceFactor": "standardizedSelfContainedDeploymentUnit", "impactType": "positive" },
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
    { "impactedFactor": "interoperability", "sourceFactor": "apiBasedCommunication", "impactType": "positive" },
    { "impactedFactor": "testability", "sourceFactor": "apiBasedCommunication", "impactType": "positive" },
    { "impactedFactor": "interoperability", "sourceFactor": "consistentlyMediatedCommunication", "impactType": "positive" },
    { "impactedFactor": "timeBehaviour", "sourceFactor": "consistentlyMediatedCommunication", "impactType": "negative" },
    { "impactedFactor": "analyzability", "sourceFactor": "consistentlyMediatedCommunication", "impactType": "positive" }
] satisfies ImpactSpec[]


type MeasureSpec = {
    name: string,
    calculation: string,
    calculationFormula: string,
    helperFunctions: string[],
    sources: string[],
    applicableEntities: (ENTITIES.SYSTEM | ENTITIES.COMPONENT | ENTITIES.INFRASTRUCTURE | ENTITIES.REQUEST_TRACE)[],
    aggregateOf?: string
}


const measures = {
    "ratioOfEndpointsSupportingSsl": {
        "name": "Ratio of endpoints that support SSL",
        "calculation": "Endpoints that support SSL / All endpoints",
        "calculationFormula": "\\frac{| \\Set{ e | e \\in E \\land e.protocol \\in SUPPORTS\\_TLS } |}{|E|}",
        "helperFunctions": ["SUPPORTS\\_TLS = \\{ \\text{\"https\"}, \\text{\"sftp\"} \\}"],
        "sources": ["Ntentos2022"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfExternalEndpointsSupportingTls": {
        "name": "Ratio of external endpoints that support TLS",
        "calculation": "External Endpoints that support TLS / All External Endpoints",
        "calculationFormula": "\\frac{| \\Set{ ee | ee \\in EE \\land ee.protocol \\in SUPPORTS\\_TLS } |}{|EE|}",
        "helperFunctions": ["SUPPORTS\\_TLS = \\{\\text{\"https\"}, \\text{\"sftp\"} \\}"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfSecuredLinks": {
        "name": "Ratio of secured links",
        "calculation": "Links secured by SSL / All links",
        "calculationFormula": "\\frac{| \\Set{ l | l \\in L \\land l.targetEndpoint.protocol \\in SUPPORTS\\_TLS } |}{|L|}",
        "helperFunctions": ["SUPPORTS\\_TLS = \\{\\text{\"https\"}, \\text{\"sftp\"} \\}"],
        "sources": ["Zdun2023", "Zdun2023a"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfEndpointsThatSupportTokenBasedAuthentication": {
        "name": "Ratio of endpoints that support token-based authentication ",
        "calculation": "Endpoints supporting tokens / All endpoints",
        "calculationFormula": "\\frac{| \\Set{ e | e \\in E \\land \\text{\"Token\"} \\in e.supported\\_authentication\\_methods } |}{|E|}",
        "helperFunctions": [],
        "sources": ["Ntentos2022", "Zdun2023", "Zdun2023a"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfEndpointsThatSupportApiKeys": {
        "name": "Ratio of endpoints that support API Keys",
        "calculation": "Endpoints supporting API keys / All endpoints",
        "calculationFormula": "\\frac{| \\Set{ e | e \\in E \\land \\text{\"API-Key\"} \\in e.supported\\_authentication\\_methods } |}{|E|}",
        "helperFunctions": [],
        "sources": ["Ntentos2022"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfEndpointsThatSupportPlaintextAuthentication": {
        "name": "Ratio of endpoints that support plaintext authentication",
        "calculation": "Endpoints supporting basic authentication / All endpoints",
        "calculationFormula": "\\frac{| \\Set{ e | e \\in E \\land \\text{\"basic\\_authentication\"} \\in e.supported\\_authentication\\_methods } |}{|E|}",
        "helperFunctions": [],
        "sources": ["Ntentos2022", "Zdun2023", "Zdun2023a"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfEndpointsThatAreIncludedInASingleSignOnApproach": {
        "name": "Ratio of endpoints that are included in an single-sign-on approach",
        "calculation": "Endpoints supporting a Single Sign-On approach / All endpoints",
        "calculationFormula": "\\frac{| \\Set{ e | e \\in E \\land \\text{\"Single Sign-On\"} \\in e.supported\\_authentication\\_methods } |}{|E|}",
        "helperFunctions": [],
        "sources": ["Ntentos2022"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
    },
    "totalServiceInterfaceCohesion": {
        "name": "Total Service Interface Cohesion",
        "calculation": "(\"Service Interface Data Cohesion\" + \"Service Interface Usage Cohesion\") / 2",
        "calculationFormula": "\\frac{Service Interface Data Cohesion + Service Interface Usage Cohesion}{2}",
        "helperFunctions": [],
        "sources": ["Bogner2017", "Perepletchikov2007"],
        "applicableEntities": [ENTITIES.COMPONENT]
    },
    "cohesivenessOfService": {
        "name": "Cohesiveness of Service",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Oliveira2018", "La2013"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "cohesionOfAServiceBasedOnOtherEndpointsCalled": {
        "name": "Cohesion of a Service based on other Endpoints called",
        "calculation": "Endpoints that are called from this services which are from the same other service / All Endpoints called by this service",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Peng2022"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "dataAggregateScope": {
        "name": "Data aggregate scope",
        "calculation": "Total number of Data Aggregates in a Component/System",
        "calculationFormula": "| SYS.DA | or | C.RDA |",
        "helperFunctions": [],
        "sources": ["Shim2008", "Zimmermann2015"],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM],
    },
    "serviceInterfaceDataCohesion": {
        "name": "Service Interface Data Cohesion",
        "calculation": "| Set of Service Endpoints that use the same Data Aggregate | / Number of Data Aggregates used in a Service",
        "calculationFormula": "\\frac{| \\Set{ e | e \\in c.providedEndpoints \\land \\exists e' \\in c.providedEndpoints (\\land ((e.RDA \\cap e'.RDA) \\neq \\emptyset))} |}{|c.RDA|}",
        "helperFunctions": [],
        "sources": ["Bogner2017", "Perepletchikov2007", "Kazemi2011", "Brito2021", "Jin2021", "Jin2018", "Athanasopoulos2011", "Athanasopoulos2015", "Bogner2020"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "cohesionBetweenEndpointsBasedOnDataAggregateUsage": {
        "name": "Cohesion between Endpoints based on data aggregate usage",
        "calculation": "Average-of(Number of Shared Usage of Data Aggregates per endpoint pair) over all endpoints / All Data Aggregates used by endpoints",
        "calculationFormula": "\\frac{\\frac{\\displaystyle\\sum_{i=1}^{|c.providedEndpoints|} |\\Set{(e_i,e_n) | n>i \\land ((e_i.RDA \\cap e_n.RDA) \\neq \\emptyset) }|}{|c.providedEndpoints|}}{ | \\Set{da | \\exists e \\in c.providedEndpoints ( \\exists (e,da) \\in e.RDA) } |}",
        "helperFunctions": [],
        "sources": ["Peng2022"],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM],
    },
    "numberOfProvidedSynchronousAndAsynchronousEndpoints": {
        "name": "Number of provided synchronous and asynchronous endpoints",
        "calculation": "Number of endpoints of a service provides",
        "calculationFormula": "|\\Set{ e | e \\in c.providedEndpoints } |",
        "helperFunctions": [],
        "sources": ["Apel2019", "Engel2018", "Shim2008", "Brito2021", "Jin2021", "Daniel2023"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfSynchronousEndpointsOfferedByAService": {
        "name": "Number of synchronous endpoints offered by a service",
        "calculation": "Number of endpoints of a service of kind query or command",
        "calculationFormula": "|\\Set{ e | e \\in c.providedEndpoints \\land (e.kind = \\text{\"query\"} \\lor e.kind = \\text{\"command\"})  } |",
        "helperFunctions": [],
        "sources": ["Shim2008"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "serviceInterfaceUsageCohesion": {
        "name": "Service Interface Usage Cohesion",
        "calculation": "Sum-of(Number of endpoints used per client of this service) / (number of clients of this service * number of endpoints of this service)",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|C|} |\\Set{e | e \\in c.providedEndpoints \\land linked(c_i,e)}|}{ |\\Set{ c' | c' \\in C \\land connected(c',c) }| \\times |c.providedEndpoints| }",
        "helperFunctions": ["linked: c,e \\to (\\exists l \\in L (l.sourceComponent = c \\land l.targetEndpoint = e))",
            "connected: c_a,c_b \\to \\exists l \\in L (l.sourceComponent = c_a \\land l.targetEndpoint \\in c_b.providedEndpoints)"
        ],
        "sources": ["Bogner2017", "Perepletchikov2007", "Kazemi2011"],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM],
    },
    "distributionOfSynchronousCalls": {
        "name": "Distribution of synchronous calls",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Engel2018"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "cohesionOfEndpointsBasedOnInvocationByOtherServices": {
        "name": "Cohesion of Endpoints based on invocation by other services",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Peng2022"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "externallyAvailableEndpoints": {
        "name": "Externally available endpoints",
        "calculation": "Absolute number of external endpoints",
        "calculationFormula": "|\\Set{ ee | ee \\in EE }|",
        "helperFunctions": [],
        "sources": ["Zimmermann2015"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "centralizationOfExternallyAvailableEndpoints": {
        "name": "Centralization of externally available endpoints",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Ntentos2020", "Ntentos2021"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "apiCompositionUtilizationMetric": {
        "name": "API Composition utilization metric",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Ntentos2020", "Ntentos2021"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "ratioOfStateDependencyOfEndpoints": {
        "name": "Ratio of state dependency of endpoints",
        "calculation": "Number of Endpoints requiring a Data Aggregate / Total number of Endpoints",
        "calculationFormula": "\\frac{ |\\Set{e | e \\in E \\land e.RDA \\neq \\emptyset }| }{ |E|  }",
        "helperFunctions": [],
        "sources": ["Karhikeyan2012"],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfStatefulComponents": {
        "name": "Ratio of stateful components",
        "calculation": "Number of stateful components / Total number of components",
        "calculationFormula": "\\frac{ |\\Set{ c | c \\in C \\land c.stateless = false }| }{ |C|  }",
        "helperFunctions": [],
        "sources": ["Qian2006"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfStatelessComponents": {
        "name": "Ratio of stateless components",
        "calculation": "Number of stateless components / Total number of components",
        "calculationFormula": "\\frac{ |\\Set{ c | c \\in C \\land c.stateless = true }| }{ |C|  }",
        "helperFunctions": [],
        "sources": ["Hirzalla2009"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "degreeToWhichComponentsAreLinkedToStatefulComponents": {
        "name": "Degree to which components are linked to stateful components",
        "calculation": "(sum-of(Ratio of stateful Components based on all Components a Component is linked to) for all Components) / Total Number of Components)",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|C|} \\frac{ |\\Set{ c' | c' \\in C \\land isLinkedTo(c_i,c') \\land c'.stateless = false  }| }{ |\\Set{ c' | c' \\in C \\land isLinkedTo(c_i,c')}| } }{ |C| }",
        "helperFunctions": ["isLinkedTo: c_a,c_b \\to (\\exists l \\in L (l.sourceComponent = c_a \\land l.targetEndpoint \\in c_b.providedEndpoints)"],
        "sources": ["Qian2006"],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "numberOfAsynchronousEndpointsOfferedByAService": {
        "name": "Number of asynchronous endpoints offered by a service",
        "calculation": "Number of endpoints of a service of kind event or subscribe",
        "calculationFormula": "|\\Set{ e | e \\in c.providedEndpoints \\land isAsync(e)  }|",
        "helperFunctions": ["isAsync: e \\to (e.kind = \\text{\"send event\"} \\lor e.kind = \\text{\"subscribe\"})"],
        "sources": ["Shim2008", "Daniel2023"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfSynchronousOutgoingLinks": {
        "name": "Number of synchronous outgoing links",
        "calculation": "Number of outgoing links of a service targeting a synchronous endpoint.",
        "calculationFormula": "|\\Set{ l | l \\in L \\land l.sourceComponent = c \\land isSync(l)  }|",
        "helperFunctions": ["isSync: l \\to (l.targetEndpoint.kind = \\text{\"query\"} \\lor l.targetEndpoint.kind = \\text{\"command\"})"],
        "sources": ["Apel2019", "Daniel2023"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfAsynchronousOutgoingLinks": {
        "name": "Number of asynchronous outgoing links",
        "calculation": "Number of outgoing links of a service targeting an asynchronous endpoint.",
        "calculationFormula": "|\\Set{ l | l \\in L \\land l.sourceComponent = c \\land isAsync(l)  }|",
        "helperFunctions": ["isAsync: l \\to (l.targetEndpoint.kind = \\text{\"send event\"} \\lor l.targetEndpoint.kind = \\text{\"subscribe\"})"],
        "sources": ["Apel2019", "Daniel2023"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "ratioOfAsynchronousOutgoingLinks": {
        "name": "Ratio of asynchronous outgoing links",
        "calculation": "Number of outgoing links of a service that are asynchronous / Number of all outgoing links",
        "calculationFormula": "\\frac{|\\Set{ l | l \\in L \\land l.sourceComponent = c \\land isAsync(l)  }|}{|\\Set{ l | l \\in L \\land l.sourceComponent = c }|}",
        "helperFunctions": ["isAsync: l \\to (l.targetEndpoint.kind = \\text{\"send event\"} \\lor l.targetEndpoint.kind = \\text{\"subscribe\"})"],
        "sources": ["Karhikeyan2012"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "degreeOfAsynchronousCommunication": {
        "name": "Degree of asynchronous communication",
        "calculation": "Average-of(Ratio of asynchronous endpoints) over all components",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|C|} \\frac{|\\Set{ e | e \\in c_i.providedEndpoints \\land isAsync(e)  }|}{|\\Set{ e | e \\in c_i.providedEndpoints}|}  }{|C|}",
        "helperFunctions": ["isAsync: e \\to (e.kind = \\text{\"send event\"} \\lor e.kind = \\text{\"subscribe\"})"],
        "sources": ["Qian2006"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "asynchronousCommunicationUtilization": {
        "name": "Asynchronous Communication Utilization",
        "calculation": "Number of Links targeting an asynchronous Endpoint / Total number of Links",
        "calculationFormula": "\\frac{|\\Set{ l | l \\in L \\land isAsync(l) }| }{|L|}",
        "helperFunctions": ["isAsync: l \\to (l.targetEndpoint.kind = \\text{\"send event\"} \\lor l.targetEndpoint.kind = \\text{\"subscribe\"})"],
        "sources": ["Ntentos2020a"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE]
    },
    "eventSourcingUtilizationMetric": {
        "name": "Event Sourcing utilization metric",
        "calculation": "Number of service interconnections via an Event Store / Total number of service interconnections",
        "calculationFormula": "\\frac{|eventBasedInteractions|}{|eventBasedInteractions| + |\\Set{ l | l \\in L \\land isSync(l)  } | }",
        "helperFunctions": ["eventBasedInteractions = \\Set{ (l_1,l_2) | t(l_1) = e_1 \\land t(l_2) = e_2 \\land ofLog(e_1) \\land ofLog(e_2) \\land isEventBased(e_1,e_2) }",
            "t: l \\to l.targetEndpoint",
            "ofLog: e \\to e \\in bbs.providedEndpoints \\land bbs \\in BBS \\land bbs.kind = \\text{\"log\"}",
            "isEventBased: e_a,e_b \\to e_a.kind = \\text{\"send event\"} \\land e_b.kind = \\text{\"subscribe\"} \\land e_a.url = e_b.url",
            "isSync: l \\to (l.targetEndpoint.kind = \\text{\"query\"} \\lor l.targetEndpoint.kind = \\text{\"command\"})",
        ],
        "sources": ["Ntentos2020", "Ntentos2021"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE]
    },
    "ratioOfInfrastructureNodesThatSupportMonitoring": {
        "name": "Ratio of Infrastructure nodes that support Monitoring",
        "calculation": "Number of Infrastructure nodes providing metrics and logs / Total number of Infrastructure nodes",
        "calculationFormula": "\\frac{ |\\Set{ i | i \\in I \\land \\exists bd \\in BD (\\exists (i,bd) \\in i.BDA \\land bd.kind = \\text{\"metrics\"} \\land bd.kind = \\text{\"logs\"} )} | }{|I|}",
        "helperFunctions": [],
        "sources": ["Ntentos2022", "Zdun2023"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfComponentsThatSupportMonitoring": {
        "name": "Ratio of Components that support Monitoring",
        "calculation": "Number of Components providing metrics and logs / Total number of Components",
        "calculationFormula": "\\frac{ |\\Set{ c | c \\in C \\land \\exists bd \\in BD (\\exists (c,bd) \\in c.BDA \\land bd.kind = \\text{\"metrics\"} \\land bd.kind = \\text{\"logs\"} )} | }{|C|}",
        "helperFunctions": [],
        "sources": ["Ntentos2022", "Zdun2023"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService": {
        "name": "Ratio of Components or Infrastructure nodes that export logs to a central service",
        "calculation": "Number of Components or Infrastrcture Entities exporting logs to a central service / Total number of Components and Infrastructure entities",
        "calculationFormula": "\\frac{ |componentsExportingLogs| + |infrastructureExportingLogs|}{ |C| + |I|}",
        "helperFunctions": [
            "linkedToLogger: c \\to (\\exists l \\in L (l.sourceComponent = c \\land l.targetEndpoint \\in ls \\land ls \\in BS \\land ls.kind = \\text{\"logging\"}) \\lor \\exists  l\\in L ( l.sourceComponent = ls \\land ls \\in BS \\land ls.kind = \\text{\"logging\"} \\land l.targetEndpoint \\in c.providedEndpoints))",
            "sharesLogs: c \\to (\\exists bd \\in BD (bd.kind = \\text{\"logs\"} \\land \\exists (c,bd) \\in c.RBD \\land \\exists (ls,bd) \\in ls.RBD (ls \\in BS \\land ls.kind = \\text{\"logging\"})))",
            "componentsExportingLogs = \\Set{ c | c \\in C \\land linkedToLogger(c) \\land sharesLogs(c) }",
            "infrastructureExportingLogs = \\Set{ i | i \\in I \\land sharesLogs(i)  }"
        ],
        "sources": ["Ntentos2022"],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM],
    },
    "ratioOfComponentsOrInfrastructureNodesThatExportMetrics": {
        "name": "Ratio of Components or Infrastructure nodes that export metrics",
        "calculation": "Number of Components or Infrastructure Entities exporting metrics to a central service / Total number of Components and Infrastructure entities",
        "calculationFormula": "\\frac{ |componentsExportingMetrics| + |infrastructureExportingMetrics|}{ |C| + |I|}",
        "helperFunctions": [  
            "linkedToMetrics: c \\to (\\exists l \\in L (l.sourceComponent = c \\land l.targetEndpoint \\in ms \\land ms \\in BS \\land ms.kind = \\text{\"metrics\"}) \\lor \\exists  l\\in L ( l.sourceComponent = ms \\land ms \\in BS \\land ms.kind = \\text{\"metrics\"} \\land l.targetEndpoint \\in c.providedEndpoints))",
            "sharesMetrics: c \\to (\\exists bd \\in BD (bd.kind = \\text{\"metrics\"} \\land \\exists (c,bd) \\in c.RBD \\land \\exists (ms,bd) \\in ms.RBD (ms \\in BS \\land ms.kind = \\text{\"metrics\"})))",
            "componentsExportingMetrics = \\Set{ c | c \\in C \\land linkedToMetrics(c) \\land sharesMetrics(c) }",
            "infrastructureExportingMetrics = \\Set{ i | i \\in I \\land sharesMetrics(i)  }"],
        "sources": ["Ntentos2022"],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.SYSTEM],
    },
    "ratioOfComponentsOrInfrastructureNodesThatEnablePerformanceAnalytics": {
        "name": "Ratio of Components or Infrastructure nodes that enable Performance Analytics",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Ntentos2022"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "distributedTracingSupport": {
        "name": "Distributed Tracing Support",
        "calculation": "Number of Components linked to a tracing service / Total Number of Components which are not tracing services themselves",
        "calculationFormula": "\\frac{ |\\Set{ c | c \\in C \\land \\lnot(isTracing(c)) \\land linkedToTracing(c) }| }{ |\\Set{ c | c \\in C \\land \\lnot(isTracing(c)) }|  }",
        "helperFunctions": ["isTracing: c \\to (c \\in BS \\land c.kind = \\text{\"tracing\"})", 
            "linkedToTracing: c \\to (\\exists l \\in L (l.sourceComponent = c \\land l.targetEndpoint \\in ts.providedEndpoints \\land ts \\in BS \\land ts.kind \\text{\"tracing\"}))"],
        "sources": ["Ntentos2020", "Ntentos2021"],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfServicesThatProvideHealthEndpoints": {
        "name": "Ratio of Services that provide Health endpoints",
        "calculation": "Number of Service with at least one health endpoint / Number of all Services",
        "calculationFormula": "\\frac{ | \\Set{ s | s \\in S \\land \\exists e \\in s.providedEndpoints (e.health\\_check = true ) } | } {|S|} ",
        "helperFunctions": [],
        "sources": ["Ntentos2022"],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfServicesThatProvideReadinessEndpoints": {
        "name": "Ratio of Services that provide Readiness endpoints",
        "calculation": "Number of Service with at least one readiness endpoint / Number of all Services",
        "calculationFormula": "\\frac{ | \\Set{ s | s \\in S \\land \\exists e \\in s.providedEndpoints (e.readiness\\_check = true ) } | } {|S|} ",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "linesOfCodeForDeploymentConfiguration": {
        "name": "Lines of code (LOC) for deployment configuration",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Lehmann2017", "Talwar2005"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfLinksPerComponent": {
        "name": "Number of Links per Component ",
        "calculation": "Number of outoging and incoming Links of a component",
        "calculationFormula": "|\\Set{ l | l \\in L \\land (l.sourceComponent = c \\lor l.targetEndpoint \\in c.providedEndpoints ) } | ",
        "helperFunctions": [],
        "sources": ["Zimmermann2015", "Tiwari2014", "Rosa2020"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfConsumedEndpoints": {
        "name": "Number of Consumed Endpoints",
        "calculation": "Number of endpoints a service is linked to",
        "calculationFormula": "| \\Set{ e | e \\in E \\land \\exists l \\in L (l.sourceComponent = s \\land l.targetEndpoint = e)  } | ",
        "helperFunctions": [],
        "sources": ["Apel2019", "Gamage2021", "Perera2018"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "incomingOutgoingRatioOfAComponent": {
        "name": "Incoming outgoing ratio of a component",
        "calculation": "Number of outgoing links from a component / Number of incoming links of a component",
        "calculationFormula": "\\frac{|\\Set{ l | l \\in L \\land l.sourceComponent = c } | }{ | \\Set{ l | l \\in L \\land l.targetEndpoint \\in c.providedEndpoints  } | }",
        "helperFunctions": [],
        "sources": ["Tiwari2014"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "ratioOfOutgoingLinksOfAService": {
        "name": "Ratio of outgoing links of a service",
        "calculation": "(Number of outgoing links of a service / (Total Number of links connected to a service)) * 100",
        "calculationFormula": "\\frac{|\\Set{ l | l \\in L \\land l.sourceComponent = c } | }{ |\\Set{ l | l \\in L \\land (l.sourceComponent = c \\lor l.targetEndpoint \\in c.providedEndpoints ) } | } * 100",
        "helperFunctions": [],
        "sources": ["PhamThiQuynh2009"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "couplingDegreeBasedOnPotentialCoupling": {
        "name": "Coupling degree based on potential coupling",
        "calculation": "(Sum-of(Maximum path lengths between components when no links exist) - Sum-of(path lengths between components based on actually existing links)) / Sum-of(Maximum path lengths between components when no links exist) - Sum-of(Minimum path lengths when links exist between all components)",
        "calculationFormula": "\\frac{ (|C| * (|C| - 1) * (|C| - 1)) - \\displaystyle\\sum_{i=1}^{|C|}\\sum_{j=1}^{|C|} minPath(c_i,c_j) }{(|C| * (|C| - 1) * (|C| - 1)) - (|C| * (|C| - 1))}",
        "helperFunctions": ["minPath: c_a,c_b \\to |(l_1,...,l_n)| | (l_1.sourceComponent = c_a \\land l_n.targetEndpoint \\in c_b.providedEndpoints) \\lor (l_1.sourceComponent = c_b \\land l_n.targetEndpoint \\in c_a.providedEndpoints) \\land \\min(n)"],
        "sources": ["PhamThiQuynh2009"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "interactionDensityBasedOnComponents": {
        "name": "Interaction density based on components",
        "calculation": "Number of links in a system / Number of components in a system",
        "calculationFormula": "\\frac{|L|}{|C|}",
        "helperFunctions": [],
        "sources": ["Tiwari2014"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "interactionDensityBasedOnLinks": {
        "name": "Interaction density based on links",
        "calculation": "Number of links in a system / Number of potential links in a system",
        "calculationFormula": "\\frac{|L|}{ |C| * (|C| - 1)}",
        "helperFunctions": [],
        "sources": ["Tiwari2014", "Karhikeyan2012"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "indirectInteractionDensity": {
        "name": "Indirect Interaction density of a system",
        "calculation": "Number of other components to which an indirect dependency exist / Number of components to which an indirect dependency could exist (because they are not direct dependencies) ",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|C \\setminus c|} \\begin{cases} 0 &\\text{if } directlyLinked(c,c_i) \\\\ 1 &\\text{if } indirectlyLinked(c,c_i) \\end{cases} }{ |\\Set{ c' | linked(c,c') }|}",
        "helperFunctions": ["directlyLinked: c_a,c_b \\to (\\exists l \\in L (l.sourceComponent = c_a \\land l.targetEndpoint \\in c_b.providedEndpoints))",
            "indirectlyLinked: c_a,c_b \\to (\\exists (l_1,...,l_n) \\subset L (l_1.sourceComponent = c_a \\land l_n.targetEndpoint \\in c_b.providedEndpoints \\land n > 1))",
            "linked: c_a,c_b \\to (\\exists (l_1,...,l_n) \\subset L (l_1.sourceComponent = c_a \\land l_n.targetEndpoint \\in c_b.providedEndpoints))"
        ],
        "sources": ["Karhikeyan2012"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "serviceCouplingBasedOnEndpointEntropy": {
        "name": "Service Coupling based on Endpoint Entropy",
        "calculation": "(sum-of(-log(1 /(Number of links connected to an endpoint + 1))) for all endpoints of a service) / Number of endpoints of a component",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|c.providedEndpoints|} - \\log (\\frac{1}{ |\\Set{ l | l \\in L \\land l.targetEndpoint = e_i}| + 1}) }{ |c.providedEndpoints|  }", "helperFunctions": [],
        "sources": ["Wang2009"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "systemCouplingBasedOnEndpointEntropy": {
        "name": "System Coupling based on Endpoint Entropy",
        "calculation": "sum-of(\"Service Coupling based on Endpoint Entropy\" for all components",
        "calculationFormula": "\\displaystyle\\sum_{j=1}^{|C|}(\\frac{ \\displaystyle\\sum_{i=1}^{|c.providedEndpoints|} - \\log (\\frac{1}{ |\\Set{ l | l \\in L \\land l.targetEndpoint = e_i}| + 1}) }{ |c.providedEndpoints|  })",
        "helperFunctions": [],
        "sources": ["Wang2009"],
        "applicableEntities": [ENTITIES.SYSTEM]
    },
    "modularityQualityBasedOnCohesionAndCoupling": {
        "name": "Modularity quality based on cohesion and coupling",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Brito2021", "Jin2021"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "combinedMetricForIndirectDependency": {
        "name": "Combined metric for indirect dependency",
        "calculation": "(\"Indirect Interaction density of a system\" + \"Indirect Dependency because of shared data repository\") / 2",
        "calculationFormula": "\\frac{ \"Indirect Interaction density of a system\" + \"Indirect Dependency because of shared data repository\" }{2} ",
        "helperFunctions": [],
        "sources": ["Karhikeyan2012"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "servicesInterdependenceInTheSystem": {
        "name": "Services Interdependence in the System",
        "calculation": "Number of service pairs which are bi-directionally linked",
        "calculationFormula": "|\\Set{ (c_1,c_2) | c_1,c_2 \\in C \\land bidirectionalLink(c_1,c_2)} |",
        "helperFunctions": ["bidirectionalLink: c_a,c_b \\to (\\exists l \\in L (l.sourceComponent = c_a \\land l.targetEndpoint \\in c_b.providedEndpoints) \\land \\exists l \\in L (l.sourceComponent = c_b \\land l.targetEndpoint \\in c_a.providedEndpoints))"],
        "sources": ["Bogner2017", "Rud2006"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "averageNumberOfDirectlyConnectedServices": {
        "name": "Average Number of Directly Connected Services",
        "calculation": "(\"Number of Components a component is linked to\" + \"Number of Components that are linked to a component\") / Number of services in the system",
        "calculationFormula": "\\frac{| \\Set{ c' | c' \\in C \\land linked(c,c') } | + | \\Set{ c' | c' \\in C \\land linked(c',c) } | }{ |C| } ",
        "helperFunctions": ["linked: c_a,c_b \\to (\\exists l \\in L (l.sourceComponent = c_a \\land l.targetEndpoint \\in c_b.providedEndpoints))"
        ],
        "sources": ["Shim2008"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfComponentsThatAreLinkedToAComponent": {
        "name": "Number of Components that are linked to a component",
        "calculation": "Number of Components that are linked to a component (consumers)",
        "calculationFormula": "| \\Set{ c' | c' \\in C \\land \\exists l \\in L (l.sourceComponent = c' \\land l.targetEndpoint \\in c.providedEndpoints) } |",
        "helperFunctions": [],
        "sources": ["Bogner2017", "Rud2006", "Shim2008", "Zhang2009", "Asik2017", "Gamage2021", "Perera2018"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfComponentsAComponentIsLinkedTo": {
        "name": "Number of Components a component is linked to",
        "calculation": "Number of Components a component is linked to",
        "calculationFormula": "| \\Set{ c' | c' \\in C \\land \\exists l \\in L (l.sourceComponent = c \\land l.targetEndpoint \\in c'.providedEndpoints) } |",
        "helperFunctions": [],
        "sources": ["Bogner2017", "Rud2006", "Engel2018", "Shim2008", "Raj2021", "Raj2018", "Hofmeister2008", "PhamThiQuynh2009", "Zhang2009"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfLinksBetweenTwoServices": {
        "name": "Number of links between two services",
        "calculation": "Number of Links from component A to unique endpoints of component B",
        "calculationFormula": "| \\Set{ l | l \\in L \\land l.sourceComponent = c \\land l.targetEndpoint \\in c'.providedEndpoints } |",
        "helperFunctions": [],
        "sources": ["Hofmeister2008"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "aggregateSystemMetricToMeasureServiceCoupling": {
        "name": "Aggregate System metric to measure service coupling",
        "calculation": "(sum-of(\"Number of Components a component is linked to\" for all Service Consumers)) / (Number of services) * (Number of services - 1)",
        "calculationFormula": "\\frac{ \\sum_{i=1}^{|S|} | \\Set{ s' | s' \\in S \\land linked(s_i,s')} |  }{|S| * (|S| - 1) }",
        "helperFunctions": ["linked: s_a,s_b \\to (\\exists l \\in L (l.sourceComponent = s_a \\land l.targetEndpoint \\in s_b.providedEndpoints))"],
        "sources": ["Hofmeister2008", "Gamage2021"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents": {
        "name": "Number of Components a component is linked to relative to the total amount of components",
        "calculation": "Number of Components a component is linked to / Total Number of other Components",
        "calculationFormula": "\\frac{| \\Set{ c' | c' \\in C \\land \\exists l \\in L (l.sourceComponent = c \\land l.targetEndpoint \\in c'.providedEndpoints) } |}{|C| - 1}",
        "helperFunctions": [],
        "sources": ["Raj2021", "Raj2018", "Zhang2009"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "degreeOfCouplingInASystem": {
        "name": "Degree of coupling in a system",
        "calculation": "Sum-of(Number of Components a component is linked to) / ((Total Number of Components)² - (Total Number of Components))",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|C|} | \\Set{ c' | c' \\in C \\land \\exists l \\in L (l.sourceComponent = c_i \\land l.targetEndpoint \\in c'.providedEndpoints) } | } {|C|^2 - |C| }",
        "helperFunctions": [],
        "sources": ["Raj2021", "Raj2018", "Hofmeister2008", "Zhang2009"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "serviceCouplingBasedOnDataExchangeComplexity": {
        "name": "Service Coupling based on data exchange complexity",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Kazemi2013", "Ma2009"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "simpleDegreeOfCouplingInASystem": {
        "name": "Simple Degree of coupling in a system",
        "calculation": "Sum-of(Number of Components a component is linked to) / (Total Number of Components)",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|C|} | \\Set{ c' | c' \\in C \\land \\exists l \\in L (l.sourceComponent = c_i \\land l.targetEndpoint \\in c'.providedEndpoints) } | } {|C|}",
        "helperFunctions": [],
        "sources": ["Qian2006"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "directServiceSharing": {
        "name": "Direct Service Sharing",
        "calculation": "((Number of Services with at least two incoming links from different services / Total number of services) + (Number of Endpoints with at least two incoming links from different services / Total number of links)) / 2",
        "calculationFormula": "\\frac{\\frac{ |\\Set{ s | s \\in S \\land  differentIncomingLinksS(s)}|  }{|S|} + \\frac{ |\\Set{e | e \\in E \\land differentIncomingLinksE(e)}| }{|L|}}{2}  ",
        "helperFunctions": ["differentIncomingLinksS: s \\to (\\exists (l_1,l_2) \\subset L (l_1.sourceComponent = s' \\land l_1.targetEndpoint \\in s.providedEndpoints \\land l_2.sourceComponent = s'' \\land l_2.targetEndpoint \\in s.providedEndpoints))",
            "differentIncomingLinksE: e \\to (\\exists (l_1,l_2) \\subset L (l_1.sourceComponent = s' \\land l_1.targetEndpoint = e \\land l_2.sourceComponent = s'' \\land l_2.targetEndpoint = e))"
        ],
        "sources": ["Ntentos2020a"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "transitivelySharedServices": {
        "name": "Transitively Shared Services",
        "calculation": "((Number of Services which are transitively reachable by another service / Total number of services) + (Number of Endpoints which are transitively reachable by another service / Total number of links)) / 2",
        "calculationFormula": "\\frac{ \\frac{ |\\Set{ c | c \\in C \\land transitiveReach(c) }|  }{|C|}  + \\frac{ |\\Set{ e | e \\in E \\land  transitiveReachE(e)}| }{|L|}   }{2}",
        "helperFunctions": ["transitiveReachC: c \\to (\\exists (l_1,l_2) \\subset L (l_1.targetEndpoint \\in l_2.sourceComponent.providedEndpoints \\land l_2.targetEndpoint \\in c.providedEndpoints \\land l_1.sourceComponent \\neq c))",
            "transitiveReachE: e \\to (\\exists (l_1,l_2) \\subset L (l_1.targetEndpoint \\in l_2.sourceComponent.providedEndpoints \\land l_2.targetEndpoint = e \\land e \\notin l_1.sourceComponent.providedEndpoints))"
        ],
        "sources": ["Ntentos2020a"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "ratioOfSharedNonExternalComponentsToNonExternalComponents": {
        "name": "Ratio of shared non-external components to non-external components",
        "calculation": "Number of Services with at least two incoming links from different services / Total number of services",
        "calculationFormula": "\\frac{| \\Set{ s | s \\in S \\land twoDifferentInLinks(s) }|}{|S|}",
        "helperFunctions": ["twoDifferentInLinks: s \\to (\\exists s',s'' \\in S (s' \\neq s'' \\land \\exists l \\in L (l.sourceComponent = s' \\land l.targetEndpoint \\in s.providedEndpoints) \\land \\exists l' \\in L (l'.sourceComponent = s'' \\land l'.targetEndpoint \\in s.providedEndpoints)))"],
        "sources": ["Zdun2017"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "ratioOfSharedDependenciesOfNonExternalComponentsToPossibleDependencies": {
        "name": "Ratio of shared dependencies of non-external components to possible dependencies",
        "calculation": "Number of component sharing relationships / (Number of components)²",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|C|} | \\Set{ (c',c'') | sharedDependency(c',c'',c_i) }| }{|C|}",
        "helperFunctions": ["sharedDependency: c_a,c_b,c_c \\to (c_a,c_b \\neq c_c \\land \\exists l \\in L (l.sourceComponent = c_a \\land l.targetEndpoint \\in c_a.providedEndpoints) \\land \\exists l' \\in L (\\land l'.sourceComponent = c_b \\land l'.targetEndpoint \\in c_c.providedEndpoints))"],
        "sources": ["Zdun2017"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "degreeOfDependenceOnOtherComponents": {
        "name": "Degree of dependence on other components",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Oliveira2018", "La2013", "Oh2011", "PhamThiQuynh2009"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "averageSystemCoupling": {
        "name": "Average System Coupling",
        "calculation": "Sum-of(relationship weights of links between services) / Number of services",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|L|} \\begin{cases} 0.1 &\\text{if } isSend(l_i)  \\\\ 0.5 &\\text{if } isCommand(l_i) \\\\ 0.2 &\\text{else } \\end{cases} + \\frac{\\displaystyle\\sum_{j=1}^{|l.targetEndpoint.RDA|} \\begin{cases} 0.1 &\\text{if } persists(l_i.targetEndpoint.rda_j) \\\\ 0.5 &\\text{if } caches(l_i.targetEndpoint.rda_j) \\\\ 0.25 &\\text{else } \\end{cases}   }{|l.targetEndpoint.RDA|} } { |C| }",
        "helperFunctions": ["isSend: l \\to (l.targetEndpoint.kind = \\text{\"send event\"})",
            "isCommand: l \\to (l.targetEndpoint.kind = \\text{\"command\"})",
            "persists: rda \\to (rda.usage\\_relation = \\text{\"persistence\"})",
            "caches: rda \\to (rda.usage\\_relation = \\text{\"cached-usage\"})",
        ],
        "sources": ["Filippone2023"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "couplingOfServicesBasedOnUsedDataAggregates": {
        "name": "Coupling of services based on used Data Aggregates",
        "calculation": "Data Aggregates used by both two services / All Data Aggregates used by two services",
        "calculationFormula": "\\frac{ |\\Set{ da | da \\in DA \\land \\exists (c_x, da) \\in c_x.RDA } \\cap \\Set{ da | da \\in DA \\land \\exists (c_y, da) \\in c_y.RDA }|  }{|\\Set{ da | da \\in DA \\land \\exists (c_x, da) \\in c_x.RDA } \\cup \\Set{ da | da \\in DA \\land \\exists (c_y, da) \\in c_y.RDA }|}",
        "helperFunctions": [],
        "sources": ["Peng2022"],
        "applicableEntities": [ENTITIES.COMPONENT], // TODO actually Component Pair
    },
    "couplingOfServicesBasedServicesWhichCallThem": {
        "name": "Coupling of services based services which call them",
        "calculation": "Services which call both two services / All services calling either of the two services",
        "calculationFormula": "\\frac{ |\\Set{ c | c \\in C \\land linked(c,c_x)  } \\cap \\Set{ c | c \\in C \\land linked(c,c_y) }|  }{|\\Set{ c | c \\in C \\land linked(c,c_x) } \\cup \\Set{ c | c \\in C \\land linked(c,c_y)}| }",
        "helperFunctions": ["linked: c_a,c_b \\to (\\exists l \\in L (l.sourceComponent = c_a \\land l.targetEndpoint \\in c_b.providedEndpoints))"],
        "sources": ["Peng2022"],
        "applicableEntities": [ENTITIES.COMPONENT], // TODO actually Component Pair
    },
    "couplingOfServicesBasedServicesWhichAreCalledByThem": {
        "name": "Coupling of services based services which are called by them",
        "calculation": "Services which are called by both two services / All services called by either of the two services",
        "calculationFormula": "\\frac{ |\\Set{ c | c \\in C \\land linked(c_x,c) } \\cap \\Set{ c | c \\in C \\land linked(c_y,c)}|  }{|\\Set{ c | c \\in C \\land linked(c_x,c) } \\cup \\Set{ c | c \\in C \\land linked(c_y,c)}| }",
        "helperFunctions": ["linked: c_a,c_b \\to (\\exists l \\in L (l.sourceComponent = c_a \\land l.targetEndpoint \\in c_b.providedEndpoints))"],
        "sources": ["Peng2022"],
        "applicableEntities": [ENTITIES.COMPONENT], // TODO actually Component Pair
    },
    "couplingOfServicesBasedOnAmountOfRequestTracesThatIncludeASpecificLink": {
        "name": "Coupling of services based on amount of request traces that include a specific link",
        "calculation": "Maximum of probabilities that one service is called by the other in all requests traces in which the first service is included.",
        "calculationFormula": "\\max(\\frac{ |\\Set{ rt | rt \\in RT \\land linkInRT(rt,c_x,c_y) }|  }{ |\\Set{ rt | rt \\in RT \\land c_y \\in rt.nodes}| }, \\frac{|\\Set{ rt | rt \\in RT \\land linkInRT(rt,c_y,c_x) }|   }{ |\\Set{ rt | rt \\in RT \\land c_x \\in rt.nodes}| }",
        "helperFunctions": ["linkInRT: rt,c_a,c_b \\to (\\exists l \\in rt.involvedLinks (l.sourceComponent = c_a \\land l.targetEndpoint \\in c_b.providedEndpoints))"],
        "sources": ["Peng2022"],
        "applicableEntities": [ENTITIES.COMPONENT], // TODO actually Component Pair
    },
    "couplingOfServicesBasedTimesThatTheyOccurInTheSameRequestTrace": {
        "name": "Coupling of services based times that they occur in the same request trace",
        "calculation": "Number of request traces which contain the same two services / Number of request traces",
        "calculationFormula": "\\frac{|\\Set{rt | rt \\in RT \\land c_x,c_y \\in rt.nodes}| }{|RT|}",
        "helperFunctions": [],
        "sources": ["Peng2022"],
        "applicableEntities": [ENTITIES.COMPONENT], // TODO actually Component Pair
    },
    "conceptualModularityQualityBasedOnDataAggregateCohesionAndCoupling": {
        "name": "Conceptual Modularity quality based on Data Aggregate cohesion and coupling",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Brito2021", "Jin2021"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "cyclicCommunication": {
        "name": "Cyclic Communication",
        "calculation": "Whether or not a Service is part of a cyclic communication path",
        "calculationFormula": "\\exists (l_1,l_2,...,l_n) \\in L (l_1.sourceComponent = c \\land l_n.targetEndpoint \\in c.providedEndpoints)",
        "helperFunctions": [],
        "sources": ["Apel2019", "Ntentos2020a"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfSynchronousCycles": {
        "name": "Number of synchronous cycles",
        "calculation": "Number of cycles that exist between services based on synchronous links",
        "calculationFormula": "| \\Set{ (l_1,l_2,...,l_n) | \\forall l_i \\in L (isSync(l_i)) \\land chain(l_n,l_1) } |",
        "helperFunctions": ["isSync: l \\to (l.targetEndpoint.kind = \\text{\"query\"} \\lor l.targetEndpoint.kind = \\text{\"command\"})",
            "chain: l_a,l_b \\to (l_a.targetEndpoint \\in l_b.sourceComponent.providedEndpoints)"
        ],
        "sources": ["Engel2018"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "relativeImportanceOfTheService": {
        "name": "Relative Importance of the Service",
        "calculation": "Number of Components that are linked to a component (consumers) / Total Number of Components",
        "calculationFormula": "\\frac{| \\Set{ c' | c' \\in C \\land \\exists l \\in L (l.sourceComponent = c' \\land l.targetEndpoint \\in c.providedEndpoints) } |}{ |C| }",
        "helperFunctions": [],
        "sources": ["Zhang2009"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "extentOfAggregationComponents": {
        "name": "Extent of Aggregation components",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Hofmeister2008"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "systemCentralization": {
        "name": "System's CentraliZation",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Hofmeister2008"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "densityOfAggregation": {
        "name": "Density of Aggregation",
        "calculation": "sum-of(ln(number of outoging links / total number of outgoing and incoming links * 2)) for all aggregators that means services which have incoming and outgoing links",
        "calculationFormula": "\\displaystyle\\sum_{i=1}^{|\\Set{c | c \\in C \\land inAndOut(c)}|} \\ln( \\frac{ |\\Set{l | l \\in L \\land out(l,c_i) } |  }{|\\Set{l | l \\in L \\land inOrOut(c_i,l) } | * 2}   ) ",
        "helperFunctions": ["inAndOut: c \\to (\\exists l_1,l_2 \\in L (l_1.sourceComponent = c \\land l_2.targetEndpoint \\in c.providedEndpoints))",
            "out: c,l \\to (l.sourceComponent = c)",
            "inOrOut: c,l \\to (l.sourceComponent = c \\lor l.targetEndpoint \\in c.providedEndpoints)"
        ],
        "sources": ["Hofmeister2008"],
        "applicableEntities": [ENTITIES.SYSTEM]
    },
    "aggregatorCentralization": {
        "name": "Aggregator CentraliZation",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Hofmeister2008"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "dataAggregateConvergenceAcrossComponents": {
        "name": "Data Aggregate Convergence across Components",
        "calculation": "((sum-of(number of data aggregates used in a service) for all services) / Number of Services) + ((sum-of(Services that use a data aggregate) for all data aggregates) / Number of Data Aggregates)",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|C|} |c_i.RDA|}{|C|} + \\frac{\\displaystyle\\sum_{i=1}^{|DA|} |\\Set{ c | \\exists c.RDA (c.RDA.da = da_i)}| }{ |DA| }",
        "helperFunctions": [],
        "sources": ["Kazemi2013", "Ma2009"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "serviceCriticality": {
        "name": "Service Criticality",
        "calculation": "Number of Components that are linked to a component * Number of Components a component is linked to",
        "calculationFormula": "| \\Set{ c' | c' \\in C \\land \\exists l (l \\in L \\land l.sourceComponent = c' \\land l.targetEndpoint \\in c.providedEndpoints) } | * | \\Set{ c' | c' \\in C \\land \\exists l \\in L (l.sourceComponent = c \\land l.targetEndpoint \\in c'.providedEndpoints) } | ",
        "helperFunctions": [],
        "sources": ["Bogner2017", "Rud2006"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "ratioOfCyclicRequestTraces": {
        "name": "Ratio of cyclic request traces",
        "calculation": "Number of request traces with a cycle / Total number of request traces",
        "calculationFormula": "\\frac{|\\Set{ rt | rt \\in RT \\land hasCycle(rt) }}{|RT|}",
        "helperFunctions": ["hasCycle: rt \\to (\\exists (l_1,l_2,...l_n) \\in rt.involvedLinks (l_n.targetEndpoint \\in l_1.sourceComponent.providedEndpoints))"],
        "sources": ["Genfer2021"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "numberOfPotentialCyclesInASystem": {
        "name": "Number of potential cycles in a system",
        "calculation": "Number of cycles found in a system based on defined links",
        "calculationFormula": "| \\Set{ (l_1,l_2,...,l_n) | \\forall l_i \\in L \\land l_n.targetEndpoint \\in l_1.sourceComponent.providedEndpoints } |",
        "helperFunctions": [],
        "sources": ["Peng2022"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "maximumLengthOfServiceLinkChainPerRequestTrace": {
        "name": "Maximum Length of Service Link chain per request trace",
        "calculation": "Maximum of number-of links of request trace for all request traces",
        "calculationFormula": "(\\displaystyle\\sum_{i=1}^{|rt.involvedLinks|} |rt.involvedLinksᵢ.links|) | \\forall rt' (rt' \\in RT \\land rt' \\neq rt \\land \\displaystyle\\sum_{i=1}^{|rt'.involvedLinks|} |rt'.involvedLinksᵢ.links| \\leq \\displaystyle\\sum_{i=1}^{|rt.involvedLinks|} |rt.involvedLinksᵢ.links|",
        "helperFunctions": [],
        "sources": ["Apel2019", "Engel2018", "Rosa2020"],
        "applicableEntities": [ENTITIES.SYSTEM],
        "aggregateOf": "requestTraceLength"
    },
    "maximumNumberOfServicesWithinARequestTrace": {
        "name": "Maximum number of services within a request trace",
        "calculation": "Maximum of number-of components within a request trace for all request traces",
        "calculationFormula": "(| rt.nodes |) | \\forall rt' (rt' \\in RT \\land rt' \\neq rt \\land rt'.nodes \\leq rt.nodes",
        "helperFunctions": [],
        "sources": ["Apel2019"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "numberOfRequestTraces": {
        "name": "Number of Request Traces",
        "calculation": "Total number of request traces",
        "calculationFormula": "|RT|",
        "helperFunctions": [],
        "sources": ["Zimmermann2015"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "averageComplexityOfRequestTraces": {
        "name": "Average Complexity of Request Traces",
        "calculation": "(sum-of(Number of Links in Request Trace) for all Request Traces) / Total number of request traces",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|RT|} \\displaystyle\\sum_{j=1}^{|rt.involvedLinks|} |rt.involvedLinks_j.links| }{ |RT| }",
        "helperFunctions": [],
        "sources": ["Zimmermann2015"],
        "applicableEntities": [ENTITIES.SYSTEM],
        "aggregateOf": "requestTraceComplexity"
    },
    "requestTraceLength": {
        "name": "Request Trace Length",
        "calculation": "Number of link steps in a request trace",
        "calculationFormula": "|rt.involvedLinks|",
        "helperFunctions": [],
        "sources": ["Peng2022", "Gamage2021"],
        "applicableEntities": [ENTITIES.REQUEST_TRACE],
    },
    "requestTraceComplexity": {
        "name": "Request Trace Complexity",
        "calculation": "Number of links in a request trace",
        "calculationFormula": "\\displaystyle\\sum_{i=1}^{|rt.involvedLinks|} |rt.involvedLinks_i.links|",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.REQUEST_TRACE],
    },
    "numberOfCyclesInRequestTraces": {
        "name": "Number of Cycles in Request Traces",
        "calculation": "Number of Cycles in Request Trace",
        "calculationFormula": "| \\Set{ (l_1,...,l_n) | l_i \\in L \\land hasCycle((l_1,...,l_n),rt)} |",
        "helperFunctions": ["hasCycle: (l_1,...,l_n),rt  \\to (\\forall l_i \\in (l_1,...,l_n) \\exists rt.involvedLinks ( l_i \\in rt.involvedLinks.links \\land chain(l_n,l_1)))",
            "chain: l_a,l_b \\to (l_a.targetEndpoint \\in l_b.sourceComponent.providedEndpoints)"],
        "sources": ["Peng2022", "Gamage2021"],
        "applicableEntities": [ENTITIES.REQUEST_TRACE],
    },
    "degreeOfStorageBackendSharing": {
        "name": "Degree of Storage Backend Sharing",
        "calculation": "Number of Services sharing the same Storage Backing Service",
        "calculationFormula": "| \\Set{ c' | c' \\in C \\land \\exists l \\in L (l.sourceComponent = c' \\land l.targetEndpoint \\in sbs.providedEndpoints) } |",
        "helperFunctions": [],
        "sources": ["Rosa2020"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "ratioOfStorageBackendSharing": {
        "name": "Ratio of Storage Backend Sharing",
        "calculation": "(sum-of(Number of Services sharing the same Storage Backing Service) for all Storage Backing Services) / (Total Number of Services * Total Number of Storage Backing Service)",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|SBS|} |\\Set{ s' | s' \\in S \\land share(s,s',sbs_i)  }|  }{|S| * |SBS|}",
        "helperFunctions": ["share s_a,s_b,sbs \\to (\\exists l_1,l_2 \\subset L (l_1.sourceComponent = s_a \\land l_2.sourceComponent = s_b \\land l_1.targetEndpoint \\in sbs.providedEndpoints \\land l_2.targetEndpoint \\in sbs.providedEndpoints))"],
        "sources": ["Karhikeyan2012"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "sharedStorageBackingServiceInteractions": {
        "name": "Shared Storage Backing Service Interactions",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Ntentos2020", "Ntentos2020a", "Ntentos2021"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "databaseTypeUtilization": {
        "name": "Database Type Utilization",
        "calculation": "Storage Backing Services used by individual services / Total number of Storage Backing Services",
        "calculationFormula": "\\frac{| \\Set{ sbs | sbs \\in SBS \\land | \\Set{ c' | connected(c',sbs) }| = 1 } | }{|SBS|}   ",
        "helperFunctions": ["connected: c,sbs \\to (\\exists l\\in L (l.sourceComponent = c \\land l.targetEndpoint \\in sbs.providedEndpoints))"],
        "sources": ["Ntentos2020a"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "serviceDiscoveryUsage": {
        "name": "Service Discovery Usage",
        "calculation": "Number of Links whose outgoing component is using address resolution / Total number of Links",
        "calculationFormula": "\\frac{|\\Set{ l | l \\in L \\land l.sourceComponent.addressResolutionBy.address\\_resolution\\_kind \\neq \\text{\"none\"}}|}{|L|}",
        "helperFunctions": [],
        "sources": ["Apel2019"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "averageNumberOfEndpointsPerService": {
        "name": "Average Number of Endpoints per Service",
        "calculation": "Number of Endpoints / Number of Services",
        "calculationFormula": "\\frac{|E|}{|C|}",
        "helperFunctions": [],
        "sources": ["Bogner2017", "Bogner2020", "Hirzalla2009", "Brito2021", "Jin2021", "Rosa2020", "Kazemi2013", "Ma2009", "Desai2021"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "numberOfDependencies": {
        "name": "Number of Dependencies",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Apel2019"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfVersionsPerService": {
        "name": "Number of Versions per Service",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Bogner2017", "Hirzalla2009"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "concurrentlyAvailableVersionsComplexity": {
        "name": "Concurrently available versions complexity",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Karhikeyan2012"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "serviceSupportForTransactions": {
        "name": "Service Support for Transactions",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Bogner2017", "Hirzalla2009"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfComponents": {
        "name": "Number of components",
        "calculation": "Total number of components",
        "calculationFormula": "|C|",
        "helperFunctions": [],
        "sources": ["Silva2023", "Venkitachalam2017", "Shim2008", "Zimmermann2015"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "ratioOfProviderManagedComponentsAndInfrastructure": {
        "name": "Ratio of Provider-Managed Components and Infrastructure",
        "calculation": "Number of Provider-managed components and infrastructure nodes / All components and infrastructure nodes",
        "calculationFormula": "\\frac{|\\Set{c | c \\in C \\land c.managed = true}| + |\\Set{ i | i \\in I \\land isManaged(i) }| }{|C| + |I|}",
        "helperFunctions": ["isManaged: i \\to (i.environment\\_access = \\text{\"limited\"} \\lor i.environment\\_access = \\text{\"none\"})"],
        "sources": ["Yussupov2022"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "amountOfRedundancy": {
        "name": "Amount of redundancy",
        "calculation": "sum-of(deployment mappings) for all Components / Number of deployed Components",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|C|} | \\Set{ dm | dm \\in DM \\land dm.deployed = c_i} | }{ | \\Set{ c | c \\in C \\land \\exists dm \\in DM (dm.deployed = c)} |}",
        "helperFunctions": [],
        "sources": ["Zimmermann2015"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE, ENTITIES.COMPONENT],
    },
    "serviceReplicationLevel": {
        "name": "Service Replication level",
        "calculation": "The average value of replicas per service",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|DM|} dm_i.replicas | dm_i.deployed \\in S  }{ | \\Set{ s | s \\in S \\land \\exists dm \\in DM (dm.deployed = s)} | }",
        "helperFunctions": [],
        "sources": ["Guerron2020", "Souza2016"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE, ENTITIES.COMPONENT],
    },
    "medianServiceReplication": {
        "name": "Median Service Replication level",
        "calculation": "The median value of replicas per service",
        "calculationFormula": "median(\\Set{ (repl_1,...,repl_n) | repl_i = \\displaystyle\\sum_{j=1}^{| \\Set{ dm | dm \\in DM \\land dm.deployed = s_i \\land s \\in S}|} dm_j.replicas })",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "smallestReplicationValue": {
        "name": "Smallest Service Replication Value",
        "calculation": "minimum(value of replicas per service)",
        "calculationFormula": "min(\\Set{ (repl_1,...,repl_n) | repl_i = \\displaystyle\\sum_{j=1}^{| \\Set{ dm | dm \\in DM \\land dm.deployed = s_i \\land s \\in S}|} dm_j.replicas })",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "storageReplicationLevel": {
        "name": "Storage Replication level",
        "calculation": "The average value of replicas per storage backing service",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|DM|} dm_i.replicas | dm_i.deployed \\in SBS  }{ | \\Set{ sbs | sbs \\in SBS \\land \\exists dm \\in DM (dm.deployed = sbs)} | }",
        "helperFunctions": [],
        "sources": ["Guerron2020", "Souza2016"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE, ENTITIES.COMPONENT],
    },
    "servicePortability": {
        "name": "Service portability",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Guerron2020", "Singh2015"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "configurationExternalization": {
        "name": "Configuration externalization",
        "calculation": "Number of configuration usages where config data is stored externally / Total number of configuration usages",
        "calculationFormula": "\\frac{| \\Set{ bd | bd \\in BD \\land bd.kind = \\text{\"config\"} \\land  externalized(bd)} |}{ | \\Set{ bd | bd \\in BD \\land bd.kind = \\text{\"config\"} \\land isUsed(bd)}|}",
        "helperFunctions": ["externalized: bd \\to (\\exists (ci,bd) \\in ci.RBD (ci \\in C \\cup I \\land (ci,bd).usage\\_relation = \\text{\"usage\"}) \\land \\exists (ci',bd) \\in ci'.RBD (ci' \\in C \\cup I \\land (ci',bd).usage\\_relation = \\text{\"persistence\"}))",
            "isUsed: bd \\to (\\exists (ci,bd) \\in ci.RBD (ci \\in C \\cup I))"
        ],
        "sources": ["Apel2019"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.REQUEST_TRACE],
    },
    "numberOfDeploymentTargetEnvironments": {
        "name": "Number of Deployment Target Environments",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Apel2019"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "ratioOfComponentsWhoseExternalIngressIsProxied": {
        "name": "Ratio of components whose external ingress is proxied",
        "calculation": "Number of components with external endpoints and an external ingress proxy / Total number of components with external endpoints",
        "calculationFormula": "\\frac{|\\Set{ c | c \\in C \\land \\exists ee \\in EE (ee \\in c.providedEndpoints) \\land c.externalIngressProxiedBy \\neq \\emptyset }|}{ |\\Set{ c | c \\in C \\land \\exists ee \\in EE (ee \\in c.providedEndpoints)}| }",
        "helperFunctions": [],
        "sources": ["Ntentos2022"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfComponentsWhoseEgressIsProxied": {
        "name": "Ratio of components whose egress is proxied",
        "calculation": "Number of components with an egress proxy / Total number of components",
        "calculationFormula": "\\frac{|\\Set{ c | c \\in C \\land c.egressProxiedBy \\neq \\emptyset }|}{ |\\Set{ c | c \\in C }| }",
        "helperFunctions": [],
        "sources": ["Ntentos2022"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "componentDensity": {
        "name": "Component density",
        "calculation": "Number of deployed components / Number of infrastructure entities on which one or more components are deployed",
        "calculationFormula": "\\frac{ | \\Set{ c | c \\in C \\land \\exists dm \\in DM (dm.deployed = c)} |  }{ | \\Set{ i | i \\in I \\land \\exists dm \\in DM (dm.host = i \\land dm.deployed \\in C)} |  }",
        "helperFunctions": [],
        "sources": ["Guerron2020", "Rizvi2017"],
        "applicableEntities": [ENTITIES.SYSTEM],
        "aggregateOf": "numberOfServiceHostedOnOneInfrastructure"
    },
    "numberOfAvailabilityZonesUsedByInfrastructure": {
        "name": "Number of Availability Zones used by infrastructure",
        "calculation": "Number of unique availability zones in which the infrastructure is running",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Guerron2020", "Baranwal2014"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE, ENTITIES.REQUEST_TRACE],
    },
    "numberOfAvailabilityZonesUsedByServices": {
        "name": "Number of Availability Zones used by services",
        "calculation": "Number of unique availability zones used by the infrastructure on which services run.",
        "calculationFormula": "| \\Set{ az | \\exists i \\in I (\\exists dm \\in DM (dm.host = i \\land dm.deployed \\in S) \\land az \\in i.availability\\_zone) } |",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
    },
    "numberOfAvailabilityZonesUsedByStorageServices": {
        "name": "Number of Availability Zones used by storage services",
        "calculation": "Number of unique availability zones used by the infrastructure on which storage services run.",
        "calculationFormula": "| \\Set{ az | \\exists i \\in I (\\exists dm \\in DM (dm.host = i \\land dm.deployed \\in SBS) \\land az \\in i.availability\\_zone) } |",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
    },
    "rollingUpdateOption": {
        "name": "Rolling Update Option",
        "calculation": "Number of Infrastructure entities deploying components and supporting rolling update strategies / All Infrastructure entities deploying components",
        "calculationFormula": "\\frac{ | \\Set{ i | i \\in I \\land deploysComponent(i) \\land supportsRollingUpdate(i)}  |}{| \\Set{ i | i \\in I \\land deploysComponent(i) }|}",
        "helperFunctions": [
            "deploysComponent: i \\to (\\exists dm \\in DM (dm.host = i \\land dm.deployed \\in C))",
            "supportsRollingUpdate: i \\to (\\text{\"rolling\"} \\in i.supported\\_update\\_strategies \\lor \"blue\\text{-}green\" \\in i.supported\\_update\\_strategies )"],
        "sources": ["Straesser2023"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE],
    },
    "ratioOfLinksWithRetryLogic": {
        "name": "Ratio of Links with retry logic",
        "calculation": "Number of Links to a synchronous endpoint with retries > 0 / Total number of Links to a synchronous endpoint",
        "calculationFormula": "\\frac{|\\Set{l | l \\in L \\land isSync(l.targetEndpoint) \\land l.retries > 0 }| }{\\Set{l | l \\in L \\land isSync(l.targetEndpoint) }|}",
        "helperFunctions": ["isSync: e \\to (e.kind = \\text{\"query\"} \\lor e.kind = \\text{\"command\"})"],
        "sources": ["Apel2019"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfLinksWithComplexFailover": {
        "name": "Ratio of Links with Complex Failover",
        "calculation": "Number of Links to a synchronous endpoint with a circuit breaker / Total number of Links to a synchronous endpoint",
        "calculationFormula": "\\frac{|\\Set{l | l \\in L \\land isSync(l.targetEndpoint) \\land l.circuit\\_breaker \\neq \\text{\"none\"} }| }{\\Set{l | l \\in L \\land isSync(l.targetEndpoint) }|}",
        "helperFunctions": ["isSync e \\to (e.kind = \\text{\"query\"} \\lor e.kind = \\text{\"command\"})"],
        "sources": ["Apel2019"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
    },
    "serviceInteractionViaBackingService": {
        "name": "Service Interaction via Backing Service",
        "calculation": "Number of service interconnections via a broker backing service / Total number of service interconnections",
        "calculationFormula": "\\frac{connectionsViaBroker}{connectionsViaBroker + \\Set{ l | l \\in L \\land serviceInteration(l) \\land isSync(l.targetEndpoint) }| }",
        "helperFunctions": ["connectionsViaBroker = | \\Set{ (l_1,l_2) | l_1,l_2 \\in L \\land viaBackingService(l_1,l_2)} |",
            "viaBackingService: l_a,l_b \\to l_a.sourceComponent \\in S \\land l_a.targetEndpoint \\in bbs.providedEndpoints \\land bbs \\in BBS \\land (bbs.kind = \\text{\"queue\"} \\lor bbs.kind = \\text{\"topic\"}) \\land l_a.targetEndpoint.kind = \\text{\"send event\"} \\land l_b.sourceComponent \\in S \\land l_b.targetEndpoint \\in bbs.providedEndpoints \\land l_b.targetEndpoint.kind = \\text{\"subscribe\"} \\land l_a.targetEndpoint.url\\_path = l_b.targetEndpoint.url\\_path",
            "serviceInteration: l \\to (l.sourceComponent \\in S \\land l.targetEndpoint \\in s'.providedEndpoints \\land s' \\in S)",
            "isSync: e \\to (e.kind = \\text{\"query\"} \\lor e.kind = \\text{\"command\"})"

        ],
        "sources": ["Ntentos2020a", "Ntentos2020", "Ntentos2021"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "numberOfServices": {
        "name": "Number of Services",
        "calculation": "Total Number of Services",
        "calculationFormula": "|S|",
        "helperFunctions": [],
        "sources": ["Shim2008", "Raj2018", "Hirzalla2009", "Hofmeister2008", "Zhang2009", "Rud2006"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "numberOfBackingServices": {
        "name": "Number of Backing Services",
        "calculation": "Total Number of Backing Services",
        "calculationFormula": "|BS|",
        "helperFunctions": [],
        "sources": ["Shim2008"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "totalNumberOfLinksInASystem": {
        "name": "Total number of links in a system",
        "calculation": "Total number of links",
        "calculationFormula": "|L|",
        "helperFunctions": [],
        "sources": ["Brito2021", "Jin2018", "Tiwari2014", "Assuncao2021", "Zimmermann2015"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "numberOfSynchronousEndpoints": {
        "name": "Number of synchronous endpoints",
        "calculation": "Total number of synchronous endpoints",
        "calculationFormula": "|\\Set{ e | e \\in E \\land (e.kind = \\text{\"query\"} \\lor e.kind = \\text{\"command\"})}|",
        "helperFunctions": [],
        "sources": ["Shim2008"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "numberOfAsynchronousEndpoints": {
        "name": "Number of asynchronous endpoints",
        "calculation": "Total number of asynchronous endpoints",
        "calculationFormula": "|\\Set{ e | e \\in E \\land (e.kind = \\text{\"send event\"} \\lor e.kind = \\text{\"subscribe\"})}|",
        "helperFunctions": [],
        "sources": ["Shim2008"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "numberOfServicesWhichHaveIncomingLinks": {
        "name": "Number of Services which have incoming links",
        "calculation": "Total number of services which have at least one incoming link",
        "calculationFormula": "|\\Set{ s | s \\in S \\land \\exists l \\in L (l.targetEndpoint \\in s.providedEndpoints) }|",
        "helperFunctions": [],
        "sources": ["Shim2008", "Hofmeister2008"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "numberOfServicesWhichHaveOutgoingLinks": {
        "name": "Number of Services which have outgoing links",
        "calculation": "Total number of services which have at least one outgoing link",
        "calculationFormula": "|\\Set{ s | s \\in S \\land \\exists l \\in L (l.sourceComponent = s) }|",
        "helperFunctions": [],
        "sources": ["Shim2008", "Hofmeister2008"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "numberOfServicesWhichHaveBothIncomingAndOutgoingLinks": {
        "name": "Number of Services which have both incoming and outgoing links",
        "calculation": "Total number of services which have at least one incoming link and at least one outgoing link",
        "calculationFormula": "|\\Set{ s | s \\in S \\land \\exists l \\in L (l.sourceComponent = s) \\exists l \\in L (l.targetEndpoint \\in s.providedEndpoints) }|",
        "helperFunctions": [],
        "sources": ["Shim2008", "Hofmeister2008"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "lackOfCohesion": {
        "name": "Lack of cohesion of a service",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["AlDebagy2020"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "averageLackOfCohesion": {
        "name": "Average system lack of cohesion of a service",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["AlDebagy2020"],
        "applicableEntities": [ENTITIES.SYSTEM],
        "aggregateOf": "lackOfCohesion"
    },
    "serviceSize": {
        "name": "Size of a service",
        "calculation": "\"Number of Data Aggregates used in a service\" + \"Number of Components that are linked to a component\"",
        "calculationFormula": "|c.RDA| + |\\Set{ c' | \\exists l \\in L (l.sourceComponent = c' \\land l.targetEndpoint \\in c.providedEndpoints) }|",
        "helperFunctions": [],
        "sources": ["Asik2017"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "resourceCount": {
        "name": "Data Aggregate Count",
        "calculation": "Number of Data Aggregates used in a service",
        "calculationFormula": "|s.RDA|",
        "helperFunctions": [],
        "sources": ["Asik2017"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "unusedEndpointCount": {
        "name": "Unused Endpoint Count",
        "calculation": "Number of Endpoints of a Component not targeted by a Link",
        "calculationFormula": "|\\Set{ e | e \\in c.providedEndpoints \\land \\nexists l (l\\in L \\land l.targetEndpoint = e)  }| ",
        "helperFunctions": [],
        "sources": ["Asik2017"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "unreachableEndpointCount": {
        "name": "Unreachable Endpoint Count",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Asik2017"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfServiceConnectedToStorageBackingService": {
        "name": "Number of Services connected to a Storage Backing Service",
        "calculation": "Number of Services with a link to an Endpoint of a Storage Backing Service",
        "calculationFormula": "|\\Set{s | s \\in S \\land linkedToBackingService(s) }|",
        "helperFunctions": ["linkedToBackingService: s \\to (\\exists l \\in L (l.sourceComponent = s \\land l.targetEndpoint \\in sbs.providedEndpoints \\land sbs \\in SBS))"],
        "sources": ["Daniel2023"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "numberOfReadEndpointsProvidedByAService": {
        "name": "Number of Read Endpoints provided by a service",
        "calculation": "Number of Endpoints of kind \"query\" of a component",
        "calculationFormula": "|\\Set{ e | e \\in c.providedEndpoints \\land e.kind = \\text{\"query\"}}|",
        "helperFunctions": [],
        "sources": ["Daniel2023"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfWriteEndpointsProvidedByAService": {
        "name": "Number of Write Endpoints provided by a service",
        "calculation": "Number of Endpoints of kind \"command\" or \"send event\" of a component",
        "calculationFormula": "|\\Set{ e | e \\in c.providedEndpoints \\land (e.kind = \\text{\"command\"} \\lor e.kind = \\text{\"send event\"})}|",
        "helperFunctions": [],
        "sources": ["Daniel2023"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "numberOfServiceHostedOnOneInfrastructure": {
        "name": "Number of Services hosted on one infrastructure entity",
        "calculation": "Number of Service deployed on an infrastructure entity",
        "calculationFormula": "|\\Set{ s | s \\in S \\land \\exists dm \\in DM (dm.deployed = s \\land dm.host = i)}|",
        "helperFunctions": [],
        "sources": ["Daniel2023"],
        "applicableEntities": [ENTITIES.INFRASTRUCTURE],
    },
    "ratioOfRequestTracesThroughGateway": {
        "name": "Ratio of request traces through a gateway",
        "calculation": "Number of request traces including an API Gateway as a proxy / Total number of request traces",
        "calculationFormula": "\\frac{|\\Set{ rt | rt \\in RT \\land proxiedByGateway(rt) }|}{|RT|}",
        "helperFunctions": ["proxiedByGateway: rt \\to ((rt.referencedEndpoint \\in c.providedEndpoints \\land c.externalIngressProxiedBy = p \\land p \\in PBS \\land p.kind = \\text{\"API Gateway\"}) \\lor (rt.referencedEndpoint \\in g.providedEndpoints \\land g \\in PBS \\land g.kind = \\text{\"API Gateway\"}))"],
        "sources": ["Zdun2023a"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "ratioOfRequestTracesContainingFrontend": {
        "name": "Ratio of request traces containing a frontend component",
        "calculation": "",
        "calculationFormula": "",
        "helperFunctions": [],
        "sources": ["Zdun2023a"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "dataShardingLevel": {
        "name": "Level of sharding across storage backing services",
        "calculation": "Average number of shards per Storage Backing Service",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|SBS|} sbs_i.shards}{|SBS|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE],
    },
    "ratioOfCachedDataAggregates": {
        "name": "Ratio of Cached Data Aggregates",
        "calculation": "Sum-of(Cached usage of a Data Aggregate in a Component) / Sum-of(Cached and uncached usage of a Data Aggregate in a Component",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|C|} \\displaystyle\\sum_{j=1}^{|c_i.RDA|} \\begin{cases} 1 &\\text{if } c_i.rda_j.usage\\_relation = \"cached\\text{-}usage\" \\\\ 0 &\\text{else } \\end{cases}}{ \\displaystyle\\sum_{i=1}^{|C|} \\displaystyle\\sum_{j=1}^{|c_i.RDA|} \\begin{cases} 1 &\\text{if } c_i.rda_j.usage\\_relation = \"cached\\text{-}usage\" \\lor c_i.rda_j.usage\\_relation = \\text{\"usage\"} \\\\ 0 &\\text{else } \\end{cases} }",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM],
    },
    "dataReplicationAlongRequestTrace": {
        "name": "Data Replication Along Request Trace",
        "calculation": "Average(Replication of Data Aggregates along request trace)",
        "calculationFormula": "\\frac{replicationAlong(rt)+ replicationInEndpoint(rt)}{ \\displaystyle\\sum_{i=1}^{|rt.involvedLinks|} |rt.involvedLinks_i.RDA| + |rt.referencedEndpoint.RDA|}",
        "helperFunctions": [
            "replicationAlong: rt \\to \\bigg( \\displaystyle\\sum_{i=1}^{|rt.involvedLinks|}  replicatedDAs(rt.involvedLinks_i) \\bigg)",
            "replicatedDAs: link \\to \\bigg( \\displaystyle\\sum_{j=1}^{|link.targetEndpoint.RDA|} \\begin{cases} 1 &\\text{if } replicated(link.targetEndpoint.rda_j) \\\\ 0 &\\text{else } \\end{cases} \\bigg)",
            "replicationInE: rt \\to \\bigg( \\displaystyle\\sum_{i=1}^{|rt.referencedEndpoint.RDA|} \\begin{cases} 1 &\\text{if } replicated(rt.referencedEndpoint.rda_i)\\\\ 0 &\\text{else } \\end{cases} \\bigg)",
            "replicated: rda \\to (rda.usage\\_relation = \"cached\\text{-}usage\" \\lor rt.involvedLinks_i.rda_j.usage\\_relation = \\text{\"persistence\"})"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.REQUEST_TRACE],
    },
    "serviceMeshUsage": {
        "name": "Service Mesh Usage",
        "calculation": "Average(Component Communication proxied by Service Mesh)",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|C|} \\begin{cases} 0.5 &\\text{if } iProxiedByMesh(c_i) \\\\ 0 &\\text{else } \\end{cases} + \\begin{cases} 0.5 &\\text{if } eProxiedByMesh(c_i) \\\\ 0 &\\text{else } \\end{cases}}{|C|}",
        "helperFunctions": ["iProxiedByMesh: c \\to (c.ingressProxiedBy = p \\land p \\in PBS \\land p.kind = \\text{\"Service Mesh\"})",
            "eProxiedByMesh: c \\to (c.egressProxiedBy = p \\land p \\in PBS \\land p.kind = \\text{\"Service Mesh\"})"
        ],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE]
    },
    "secretsExternalization": {
        "name": "Secrets Externalization",
        "calculation": "Secrets used in a component but stored in another / All secrets used in a component",
        "calculationFormula": "\\frac{| \\Set{ bd | bd \\in BD \\land bd.kind = \\text{\"secret\"} \\land externalized(bd)} |}{ | \\Set{ bd | bd \\in BD \\land bd.kind = \\text{\"secret\"} \\land \\exists (ci,bd) \\in ci.RBD (ci \\in C \\cup I)}|}",
        "helperFunctions": ["externalized: bd \\to  (\\exists (ci,bd) \\in ci.RBD (ci \\in C \\cup I \\land (ci,bd).usage\\_relation = \\text{\"usage\"}) \\land \\exists (ci',bd) \\in ci'.RBD  (ci' \\in C \\cup I \\land (ci',bd).usage\\_relation = \\text{\"persistence\"}))"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.REQUEST_TRACE]
    },
    "ratioOfSpecializedStatefulServices": {
        "name": "Ratio of specialized stateful services",
        "calculation": "Stateful services that are Backing Services, Storage Backing Services, or Broker Backing Services / All stateful services",
        "calculationFormula": "\\frac{|\\Set{ bs | bs \\in BS \\cup SBS \\cup BBS \\land bs.stateless = false}|}{ |\\Set{ c | c \\in C \\land c.stateless = false}| }",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE]
    },
    "suitablyReplicatedStatefulService": {
        "name": "Ratio of suitably replicated stateful services",
        "calculation": "Stateful Backing Services, Storage Backing Services, or Broker Backing Services that are replicated with a strategy other than \"none\" / All Stateful Backing Services, Storage Backing Services, or Broker Backing Services",
        "calculationFormula": "\\frac{|\\Set{ bs | bs \\in BS \\cup SBS \\cup BBS \\land bs.stateless = false \\land suitablyReplicated(bs)}|}{|\\Set{ bs | bs \\in BS \\cup SBS \\cup BBS \\land bs.stateless = false \\land replicated(bs)}|}",
        "helperFunctions": ["suitablyReplicated bs \\to (\\exists dm \\in DM (dm.deployed = bs \\land dm.replicas > 1) \\land bs.replication\\_strategy \\neq \\text{\"none\"})",
            "replicated: bs \\to (\\exists dm \\in DM (dm.deployed = bs \\land dm.replicas > 1))"
        ],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE]
    },
    "ratioOfUniqueAccountUsage": {
        "name": "Ratio of unique account usage",
        "calculation": "Number of unique accounts used by components and infrastructure / Number of components and infrastructure",
        "calculationFormula": "\\frac{|\\Set{ account | \\exists ci \\in C\\cup I (account \\in ci.identities)}|}{|C| + |I|} ",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE]
    },
    "ratioOfNonCustomBackingServices": {
        "name": "Ratio of non-custom backing services",
        "calculation": "Backing Services, Storage Backing Services, Proxy Backing Services, and Broker Backing Services which are not of software type custom / All Backing Services, Storage Backing Services, Proxy Backing Services, and Broker Backing Services",
        "calculationFormula": "\\frac{|\\Set{ bs | bs \\in BS \\cup SBS \\cup PBS \\cup BBS \\land bs.software\\_type \\neq \\text{\"custom\"} }|}{|\\Set{ bs | bs \\in BS \\cup SBS \\cup PBS \\cup BBS}|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT]
    },
    "secretsStoredInVault": {
        "name": "Secrets stored in vault",
        "calculation": "Backing Data of type secret stored in vault / All backing data of type secret",
        "calculationFormula": "\\frac{|\\Set{bd | bd \\in BD \\land bd.kind = \\text{\"secret\"} \\land storedOnlyInVault(bd) }|}{ |\\Set{bd | bd \\in BD \\land bd.kind = \\text{\"secret\"}}| }",
        "helperFunctions": ["storedOnlyInVault: bd \\to (\\exists vault \\in BS (vault.kind = \\text{\"vault\"} \\land \\exists (vault,bd) \\in vault.RBD ((vault,bd).usage\\_relation = \\text{\"persistence\"})) \\land \\nexists (c,bd) ((c,bd) \\in c.RBD \\land (c \\notin BS \\lor c.kind \\neq \\text{\"vault\"}) \\land (c,bd).usage\\_relation = \\text{\"persistence\"})))"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE]
    },
    "accessRestrictedToCallers": {
        "name": "Access restricted to callers",
        "calculation": "Average-of(1 - (allowed accounts which do not call the endpoint / allowed accounts)) over all Endpoints",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|E|} 1 - \\frac{e_i.allow\\_acces\\_to \\setminus \\Set{acc | acc \\in e_i.allow\\_acces\\_to \\land noCall(acc, e_i)}}{|e_i.allow\\_acces\\_to|}  }{|E|}",
        "helperFunctions": ["noCall: acc,e \\to (\\nexists l \\in L (acc \\in l.sourceComponent.identities \\land l.targetEndpoint = e))"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE]
    },
    "ratioOfDelegatedAuthentication": {
        "name": "Ratio of delegated authentication",
        "calculation": "Component delegating authentication / All components (excluding authentication backing services)",
        "calculationFormula": "\\frac{|\\Set{c | c \\in C \\land notAuthService(c) \\land c.authenticationBy \\neq \\emptyset}|}{ |\\Set{c | c \\in C \\land notAuthService(c)}|  }",
        "helperFunctions": ["notAuthService: c \\to (c \\notin BS \\lor c.providedFunctionality \\neq \"authentication/authorization\")"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE]
    },
    "ratioOfStandardizedArtifacts": {
        "name": "Ratio of standardized artifacts",
        "calculation": "Artifacts complying to a standard / All artifacts",
        "calculationFormula": "\\frac{|\\Set{a | a \\in A \\land a.based\\_on\\_standard = true}|}{|\\Set{a | a \\in A }|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.REQUEST_TRACE]
    },
    "ratioOfEntitiesProvidingStandardizedArtifacts": {
        "name": "Ratio of entities providing standardized artifacts",
        "calculation": "Components and infrastructure entities having a standardized artifact / All components and infrastructure entities",
        "calculationFormula": "\\frac{|\\Set{ci | ci \\in C \\cup I \\land \\exists a \\in ci.artifacts (a.based\\_on\\_standard = true)} |}{|C| + |I|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE, ENTITIES.REQUEST_TRACE]
    },
    "componentArtifactsSimilarity": {
        "name": "Component Artifacts Similarity",
        "calculation": "Average similarity of components based on a pairwise comparison of component artifacts.",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|C|}\\sum_{j=i+1}^{|C|} \\begin{cases} 0 &\\text{if } | artifactTypes(c_i) \\cup artifactTypes(c_j) | = 0 \\\\ \\frac{| artifactTypes(c_i) \\cap artifactTypes(c_j) |}{| artifactTypes(c_i) \\cup artifactTypes(c_j) |} &\\text{else } \\end{cases}}{\\frac{|C| * (|C| - 1)}{2}}",
        "helperFunctions": ["artifactTypes: c \\to \\Set{ t | t = a.type \\land a \\in c.artifacts }"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE]
    },
    "infrastructureArtifactsSimilarity": {
        "name": "Infrastructure Artifacts Similarity",
        "calculation": "Average similarity of infrastructure entities based on a pairwise comparison of infrastructure artifacts.",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{k=1}^{|I|}\\sum_{l=k+1}^{|I|} \\begin{cases} 0 &\\text{if } | artifactTypes(i_k) \\cup artifactTypes(i_l) | = 0 \\\\ \\frac{| artifactTypes(i_k) \\cap artifactTypes(i_l) |}{| artifactTypes(i_k) \\cup artifactTypes(i_l) |} &\\text{else } \\end{cases}}{\\frac{|I| * (|I| - 1)}{2}}",
        "helperFunctions": ["artifactTypes: i \\to \\Set{ t | t = a.type \\land a \\in i.artifacts }"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM]
    },
    "ratioOfAutomaticallyProvisionedInfrastructure": {
        "name": "Ratio of automatically provisioned infrastructure",
        "calculation": "Infrastructure entities that are provisioned automatically / All infrastructure entities",
        "calculationFormula": "\\frac{ |\\Set{i | i \\in I \\land isAutomated(i.provisioning) } |}{ |I| }",
        "helperFunctions": ["isAutomated: provisioning \\to (provisioning = \\text{\"automated-coded\"} \\lor provisioning = \\text{\"automated-inferred\"} \\lor provisioning = \\text{\"transparent\"})"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE]
    },
    "ratioOfDeploymentsOnDynamicInfrastructure": {
        "name": "Ratio of components deployed dynamically",
        "calculation": "DeploymentMappings of components on a software platform or cloud service / All deployment mappings of components",
        "calculationFormula": "\\frac{|\\Set{ dm | dm \\in DM \\land dm.deployed \\in C \\land isDynamic(dm.host) }|}{ |\\Set{ dm | dm \\in DM \\land dm.deployed \\in C}|}",
        "helperFunctions": ["isDynamic i \\to (i.kind = \\text{\"software-platform\"} \\lor i.kind = \\text{\"cloud-service\"})"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE]
    },
    "ratioOfInfrastructureWithIaCArtifact": {
        "name": "Ratio of infrastructure with IaC artifact",
        "calculation": "Infrastructure entities with an IaC artifact / All infrastructure entities",
        "calculationFormula": "\\frac{ |\\Set{ i | i \\in I \\land \\exists a \\in i.artifacts (isIaC(a)) }|  }{ |I| }",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE]
    },
    "namespaceSeparation": {
        "name": "Namespace Separation",
        "calculation": "1 - (Average sharing of namespaces)",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|C|} 1 - \\frac{\\displaystyle\\sum_{j=1}^{|C \\setminus c_i|} \\begin{cases} 1 &\\text{if } c_i.namespace = c_j.namespace \\\\ 0 &\\text{else } \\end{cases} }{|C \\setminus c_i|} }{|C|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT]
    },
    "ratioOfFullyManagedInfrastructure": {
        "name": "Ratio of fully managed infrastructure",
        "calculation": "Infrastructure entities with no environment access and transparent maintenance / All infrastructure entities",
        "calculationFormula": "\\frac{|\\Set{ i | i \\in I \\land fullyManaged(i) }|  }{|I|}",
        "helperFunctions": ["fullyManaged: i \\to ((i.environment\\_access = \\text{\"none\"} \\lor  i.environment\\_access = \\text{\"limited\"}) \\land i.maintenance = \\text{\"transparent\"})"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE]
    },
    "ratioOfManagedBackingServices": {
        "name": "Ratio of managed backing services",
        "calculation": "Managed Backing Services, Storage Backing Services, Proxy Backing Services and Broker Backing Services / All Backing Services, Storage Backing Services, Proxy Backing Services and Broker Backing Services",
        "calculationFormula": "\\frac{|\\Set{bs | bs \\in BS \\cup SBS \\cup PBS \\cup BBS \\land bs.managed = true)} | }{|\\Set{bs | bs \\in BS \\cup SBS \\cup PBS \\cup BBS}|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT]
    },
    "ratioOfInfrastructureEnforcingResourceBoundaries": {
        "name": "Ratio infrastructure enforcing resource boundaries",
        "calculation": "Infrastructure entities enforcing resource boundaries / All infrastructure entities",
        "calculationFormula": "\\frac{|\\Set{i | i \\in I \\land t.enforced\\_resource\\_bounds = true}|}{|I|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE]
    },
    "ratioOfDeploymentMappingsWithStatedResourceRequirements": {
        "name": "Ratio of Deployment Mappings with stated resource requirements",
        "calculation": "Deployment Mappings with stated resource requirements / All Deployment Mappings",
        "calculationFormula": "\\frac{|\\Set{dm | dm \\in DM \\land t.resource\\_requirements \\neq  \\text{\"unstated\"}}|}{|DM|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE]
    },
    "deployedEntitiesAutoscaling": {
        "name": "Deployed Entities Autoscaling",
        "calculation": "Infrastructure that hosts Components and automatically scales them via the infrastructure they are deployed on / All infrastructure",
        "calculationFormula": "\\frac{|\\Set{i | i \\in I \\land \\exists dm \\in DM (dm.host = i \\land dm.deployed \\in C) \\land autoscale(i)}|}{|\\Set{i | i \\in I \\land \\exists dm \\in DM (dm.host = i \\land dm.deployed \\in C)}|}",
        "helperFunctions": ["autoscale i \\to (i.deployed\\_entities\\_scaling = \"automated-built-in\" \\lor i.deployed\\_entities\\_scaling = \"automated-separate\")"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE]
    },
    "infrastructureAutoscaling": {
        "name": "Infrastructure Autoscaling",
        "calculation": "Infrastructure entities that scale themselves automatically / All infrastructure entities",
        "calculationFormula": "\\frac{|\\Set{i | i \\in I \\land selfscale(i)}|}{|I|}",
        "helperFunctions": ["selfscale i \\to (i.self\\_scaling = \"automated-built-in\" \\lor i.self\\_scaling = \"automated-separate\")"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE]
    },
    "ratioOfAbstractedHardware": {
        "name": "Ratio of abstracted hardware",
        "calculation": "Infrastructure entities that are software-platform or cloud-service/ All infrastructure entities",
        "calculationFormula": "\\frac{|\\Set{i | i \\in I \\land (i.kind = \"software-platform\" \\lor i.kind = \"cloud-service\" )}|}{|I|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE]
    },
    "nonProviderSpecificInfrastructureArtifacts": {
        "name": "Non-provider-specific infrastructure artifacts",
        "calculation": "Infrastructure entities with all artifacts being non-provider-specific / All infrastructure entities",
        "calculationFormula": "\\frac{|\\Set{i | i \\in I \\land \\forall a \\in i.artifacts (a.provider\\_specific = false)}|}{|I|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE]
    },
    "nonProviderSpecificComponentArtifacts": {
        "name": "Non-provider-specific component artifacts",
        "calculation": "Component entities with all artifacts being non-provider-specific / All components",
        "calculationFormula": "\\frac{|\\Set{c | c \\in C \\land \\forall a \\in c.artifacts (a.provider\\_specific = false)}|}{|C|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT]
    },
    "configurationStoredInConfigService": {
        "name": "Configuration stored in config service",
        "calculation": "Backing Data of type config stored in config service / All backing data of type config",
        "calculationFormula": "\\frac{ |\\Set{ bd | bd \\in BD \\land bd.kind = \\text{\"config\"} \\land storedInConfigService(bd) }| }{ |\\Set{ bd | bd \\in BD \\land bd.kind = \\text{\"config\"}}|  }",
        "helperFunctions": ["storedInConfigService: bd  \\to (\\exists bs \\in BS (bs.providedFunctionality = \\text{\"configuration\"}) \\land \\exists (bs,bd) \\in bs.RBD ((bs,bd).usage\\_relation = \\text{\"persistence\"}))"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE]
    },
    "ratioOfEndpointsCoveredByContract": {
        "name": "Ratio of endpoints covered by contract",
        "calculation": "Endpoints documented by contract / All endpoints",
        "calculationFormula": "\\frac{ |\\Set{ e | e \\in E \\land e.documentedBy \\neq \\emptyset \\land isContract(e.documentedBy) } | }{|E|}",
        "helperFunctions": ["isContract: a \\to (a.type = \"Spring.CloudContract\" \\lor a.type = \"Pact.Contract\")"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE]
    },
    "standardizedDeployments": {
        "name": "Standardized Deployments",
        "calculation": "DeploymentMappings of components with a standardized deployment unit / All deployment mappings of components",
        "calculationFormula": "\\frac{ |\\Set{ dm | dm \\in DM \\land dm.deployed \\in C \\land dm.deployment\\_unit.based\\_on\\_standard = true} |}{|\\Set{ dm | dm \\in DM \\land dm.deployed \\in C}|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE]
    },
    "selfContainedDeployments": {
        "name": "Self-contained Deployments",
        "calculation": "DeploymentMappings of components with a self-contained deployment unit / All deployment mappings of components",
        "calculationFormula": "\\frac{ |\\Set{ dm | dm \\in DM \\land dm.deployed \\in C \\land dm.deployment\\_unit.self\\_contained = true} |}{|\\Set{ dm | dm \\in DM \\land dm.deployed \\in C}|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE]
    },
    "replacingDeployments": {
        "name": "Replacing Deployments",
        "calculation": "DeploymentMappings that disallow in-place updates / All deployment mappings",
        "calculationFormula": "\\frac{ |\\Set{ dm | dm \\in DM \\land dm.update\\_strategy \\neq \"in-place\"} |}{|DM|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE]
    },
    "ratioOfAutomaticallyMaintainedInfrastructure": {
        "name": "Ratio of automatically maintained infrastructure",
        "calculation": "Infrastructure maintained in a non-manual way / All infrastructure entities",
        "calculationFormula": "\\frac{|\\Set{i | i \\in I \\land (i.maintenance = \\text{\"automated\"} \\lor i.maintenance = \\text{\"transparent\"})}|}{|I|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.INFRASTRUCTURE]
    },
    "ratioOfLinksWithTimeout": {
        "name": "Ratio of links with timeout",
        "calculation": "Links with a specified timeout / All links",
        "calculationFormula": "\\frac{ |\\Set{l | l \\in L \\land l.timeout > 0}| }{|L|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE]
    },
    "deploymentsWithRestart": {
        "name": "Deployments with restart",
        "calculation": "DeploymentMappings with configured restart / All deployment mappings",
        "calculationFormula": "\\frac{ |\\Set{ dm | dm \\in DM \\land automatedRestart(dm)} |}{|DM|}",
        "helperFunctions": ["automatedRestart: dm \\to (dm.automated\\_restart\\_policy = \\text{\"onProcessFailure\"} \\lor dm.automated\\_restart\\_policy = \\text{\"onHealthFailure\"})"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.INFRASTRUCTURE]
    },
    "ratioOfDocumentedEndpoints": {
        "name": "Ratio of documented endpoints",
        "calculation": "Endpoints documented / All endpoints",
        "calculationFormula": "\\frac{ |\\Set{ e | e \\in E \\land e.documentedBy \\neq \\emptyset} | }{|E|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE]
    },
    "iendpointAccessMethodsConsistency": {
        "name": "Consistency of supported authentication methods of endpoints",
        "calculation": "Similarity of supported authentication methods / All endpoints",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|E \\setminus EE|}\\sum_{j=i+1}^{|E \\setminus EE|} \\begin{cases} 0 &\\text{if } none(e_i,e_j) \\\\ similarity(e_i,e_j) &\\text{else } \\end{cases}}{\\frac{|E \\setminus EE | * (|E \\setminus EE | - 1)}{2}}",
        "helperFunctions": ["none: e_a,e_b \\to (| e_a.supported\\_authentication\\_methods \\cup e_b.supported\\_authentication\\_methods | = 0)",
            "similarity: e_a,e_b \\to (\\frac{| e_a.supported\\_authentication\\_methods \\cap e_b.supported\\_authentication\\_methods |}{| e_a.supported\\_authentication\\_methods \\cup e_b.supported\\_authentication\\_methods |})"
        ],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE]
    },
    "externalEndpointAccessConsistency": {
        "name": "Consistency of supported authentication methods of external endpoints",
        "calculation": "Similarity of supported authentication methods / All external endpoints",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|EE|}\\sum_{j=i+1}^{|EE|} \\begin{cases} 0 &\\text{if } none(ee_i,ee_j) \\\\ similarity(ee_i,ee_j) &\\text{else } \\end{cases}}{\\frac{|EE | * (|EE | - 1)}{2}}",
        "helperFunctions": ["none: ee_a,ee_b \\to (| ee_a.supported\\_authentication\\_methods \\cup ee_b.supported\\_authentication\\_methods | = 0)",
            "similarity: ee_a,ee_b \\to (\\frac{| ee_a.supported\\_authentication\\_methods \\cap ee_b.supported\\_authentication\\_methods |}{| ee_a.supported\\_authentication\\_methods \\cup ee_b.supported\\_authentication\\_methods |})"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT]
    },
    "readWriteSeparationForDataAggregates": {
        "name": "Read Write Separation for Data Aggregates",
        "calculation": "Average(Separated Read and Write Access to Data Aggregate by Endpoint(s)) over all Data Aggregates",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|DA|} \\begin{cases} 1 &\\text{if } separated(da_i)  \\\\ 0 & else \\end{cases} }{|DA|}",
        "helperFunctions": ["separatedRead: da \\to (\\exists c_1,c_2 \\in C (c_1 \\neq c_2 \\land \\exists (e_1,da) (e_1 \\in c_1.providedEndpoints  \\land \\exists(e_1, da) \\in e_1.RDA \\land e_1.kind = \\text{\"query\"} \\land \\nexists (e_2,da) (e_2 \\in c_1.providedEndpoints \\land (e_2,da) \\in e_2.RDA \\land e_2.kind = \\text{\"command\"})) \\land \\exists (e_3,da) (e_3 \\in c_2.providedEndpoints \\land \\exists (e_3,da) \\in e_3.RDA \\land e_3.kind = \\text{\"command\"})))",
            "separatedWrite: da \\to (\\exists c_1,c_2 \\in C (c_1 \\neq c_2 \\land \\exists (e_1,da) (e_1 \\in c_1.providedEndpoints  \\land \\exists(e_1, da) \\in e_1.RDA \\land e_1.kind = \\text{\"command\"} \\land \\nexists (e_2,da) (e_2 \\in c_1.providedEndpoints \\land (e_2,da) \\in e_2.RDA \\land e_2.kind = \\text{\"query\"})) \\land \\exists (e_3,da) (e_3 \\in c_2.providedEndpoints \\land \\exists (e_3,da) \\in e_3.RDA \\land e_3.kind = \\text{\"query\"})))",
            "separated: da \\to (separatedRead(da) \\lor separatedWrite(da))",
        ],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT]
    },
    "degreeOfSeparationByGateways": {
        "name": "Degree of separation by gateways",
        "calculation": "1 / (Number of services proxied by an API gateway / Number of API gateways)",
        "calculationFormula": "\\frac{1}{\\frac{ |\\Set{s | s \\in S \\land s.externalIngressProxiedBy = g \\land g \\in PBS \\land g.kind = \\text{\"API Gateway\"}}|}{|\\Set{g | g \\in PBS \\land \\land g.kind = \\text{\"API Gateway\"}}| }}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.COMPONENT, ENTITIES.SYSTEM, ENTITIES.REQUEST_TRACE]
    },
    "dataAggregateSpread": {
        "name": "Data Aggregate Spread",
        "calculation": "Average(Number of services using a data aggregate / Number of Services) for all data aggregates",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|DA|} \\frac{\\sum_{j=1}^{|S|} \\begin{cases} 1 &\\text{if } \\exists (c_j,da_i) \\in c_j.RDA \\\\ 0 &\\text{else } \\end{cases} }{|S|} }{|DA|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM]
    },
    "requestTraceSimilarityBasedOnIncludedComponents": {
        "name": "Request Trace similarity based on included components",
        "calculation": "Average(Request trace similarity based on included components) for all request traces",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|RT|} \\sum_{j=i+1}^{|RT|}  \\frac{|rt_i.nodes \\cap rt_j.nodes|}{|rt_i.nodes \\cup rt_j.nodes|} }{|RT| * (|RT| - 1)}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM]
    },
    "ratioOfBrokerBackendSharing": {
        "name": "Ratio of Broker Backend Sharing",
        "calculation": "(sum-of(Number of Services sharing the same Broker Backing Service) for all Broker Backing Services) / (Total Number of Services * Total Number of Broker Backing Service)",
        "calculationFormula": "\\frac{\\displaystyle\\sum_{i=1}^{|BBS|} |\\Set{ s' | s' \\in S \\land share(s,s',bbs) }|  }{|S| * |BBS|}",
        "helperFunctions": ["share s_a,s_b,bbs \\to (\\exists l_1,l_2 \\subset L (l_1.sourceComponent = s_a \\land l_2.sourceComponent = s_b \\land l_1.targetEndpoint \\in bbs.providedEndpoints \\land l_2.targetEndpoint \\in bbs.providedEndpoints))"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.COMPONENT],
    },
    "averageBrokerBackendSharing": {
        "name": "Average Broker Backend Sharing",
        "calculation": "Average(Number of services using a broker service / Number of services) for all broker services",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|BBS|} \\frac{\\displaystyle\\sum_{j=1}^{|S|} \\begin{cases} 1 &\\text{if } \\exists l \\in L (l.sourceComponent = s_j \\land l.targetEndpoint \\in bbs_i.providedEndpoints) \\\\ 0 &\\text{else } \\end{cases}}{|S|} }{|BBS|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "averageWeightedBrokerBackendSharing": {
        "name": "Average Weighted Broker Backend Sharing",
        "calculation": "Average(Number of services (transitively) using a broker service weighted by their distance / Number of services) for all broker services",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|BBS|} \\frac{\\displaystyle\\sum_{j=1}^{|S|} \\begin{cases} 1/n &\\text{if } transitiveUse(s_j,bbs_i) \\\\ 0 &\\text{else } \\end{cases}}{|S|} }{|BBS|}",
        "helperFunctions": ["transitiveUse: s,bbs \\to (\\exists (l_1,...,l_n) \\subset L (l_1.sourceComponent = s \\land l_n.targetEndpoint \\in bbs.providedEndpoints))"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "averageStorageBackendSharing": {
        "name": "Average Storage Backend Sharing",
        "calculation": "Average(Number of services using a storage service / Number of services) for all storage services",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|SBS|} \\frac{\\displaystyle\\sum_{j=1}^{|S|} \\begin{cases} 1 &\\text{if } \\exists l \\in L (l.sourceComponent = s_j \\land l.targetEndpoint \\in sbs_i.providedEndpoints) \\\\ 0 &\\text{else } \\end{cases}}{|S|} }{|SBS|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "averageWeightedStorageBackendSharing": {
        "name": "Average Weighted Storage Backend Sharing",
        "calculation": "Average(Number of services (transitively) using a storage service weighted by their distance / Number of services) for all storage services",
        "calculationFormula": "\\frac{ \\displaystyle\\sum_{i=1}^{|SBS|} \\frac{\\displaystyle\\sum_{j=1}^{|S|} \\begin{cases} 1/n &\\text{if } transitiveUse(s_j,sbs_i) \\\\ 0 &\\text{else } \\end{cases}}{|S|} }{|SBS|}",
        "helperFunctions": ["transitiveUse: s,sbs \\to (\\exists (l_1,...,l_n) \\subset L (l_1.sourceComponent = s \\land l_n.targetEndpoint \\in sbs.providedEndpoints))"],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM],
    },
    "rollingUpdates": {
        "name": "Rolling updates",
        "calculation": "Deployment Mappings with rolling updates / All Deployment Mappings",
        "calculationFormula": "\\frac{ |\\Set{ dm | dm \\in DM \\land (dm.update\\_strategy = \\text{\"rolling\"} \\lor dm.update\\_strategy = \"blue-green\")} |}{|DM|}",
        "helperFunctions": [],
        "sources": ["new"],
        "applicableEntities": [ENTITIES.SYSTEM, ENTITIES.COMPONENT, ENTITIES.REQUEST_TRACE],
    }
} satisfies { [measureKey: string]: MeasureSpec }

const measureKeys = Object.freeze(measures);
export type MeasureKey = keyof typeof measureKeys;

type QualityAspectEvaluationSpec = {
    targetAspect: QualityAspectKey
    evaluation: string,
    reasoning: string,
    precondition?: EvaluationPrecondition,
    impactsInterpretation?: IncomingImpactsInterpretation,
    customImpactInterpretation?: (list: number[]) => number
}

const qualityAspectEvaluations = [
    {
        "targetAspect": "timeBehaviour",
        "evaluation": "aggregateImpacts",
        "reasoning": "Different fators can influcence the time-behaviour of an application in various ways. Theses influences are not necessarily comparable in the sense that a positive impact could neutralize a negative impact or the other way around. The aspect therefore only provides an overview, but individual impacts need to be reviewed independently.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "availability",
        "evaluation": "aggregateImpacts",
        "reasoning": "The availability of an application can be influenced in different ways, considering different failure scenarios. The impacts on this aspect are therefore difficult to aggregate in a reasonable way. While this evaluation aims to provide an overview, individual impacts nevertheless need to be reviewed separately.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "analyzability",
        "evaluation": "aggregateImpacts",
        "reasoning": "The analyzability of an application can be influenced in different ways and depends on the specific goal for which a software is analyzed (debugging, refactoring, extension...). The impacts on this aspect are therefore difficult to aggregate. While this evaluation aims to provide an overview, individual impacts nevertheless need to be reviewed separately.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "confidentiality",
        "evaluation": "aggregateImpacts",
        "reasoning": "The confidentiality of an application depends on the confidentatiality of data both at rest (stored in an environemnt or a database) and it transit (when requests and responses are send via the network.) ",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "integrity",
        "evaluation": "aggregateImpacts",
        "reasoning": "The integrity depends on how access is restricted.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "accountability",
        "evaluation": "aggregateImpacts",
        "reasoning": "The accountability depends on how parts of application can be assigned to different accounts and how well actions can be traced to certain accounts.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "authenticity",
        "evaluation": "aggregateImpacts",
        "reasoning": "The authenticity depends on how well authentication is implemented and managed in a system",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "modularity",
        "evaluation": "aggregateImpacts",
        "reasoning": "The modularity mainly depends on service-orientation and how coupled components of a system are.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "reusability",
        "evaluation": "aggregateImpacts",
        "reasoning": "The reusability depends on whether components are standardized and similar to each other. Then there is potentialy for reusability.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "modifiability",
        "evaluation": "aggregateImpacts",
        "reasoning": "The modifiability depends on automation for changes and redeployments as well as independence of components.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "testability",
        "evaluation": "aggregateImpacts",
        "reasoning": "The testability depends on whether interfaces are well documented and can thus be tested against these specifications.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "simplicity",
        "evaluation": "aggregateImpacts",
        "reasoning": "The simplicity depends on how many components there are and how complex a system is.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "resourceUtilization",
        "evaluation": "aggregateImpacts",
        "reasoning": "Resource Utilization can be improved if resource requirements are clear and the system manages the resource consumption.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "elasticity",
        "evaluation": "aggregateImpacts",
        "reasoning": "Elasticity is impacted by statelessness as well as infrastructure supporting elastic scaling.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "adaptability",
        "evaluation": "aggregateImpacts",
        "reasoning": "The adaptability can be improved through automationa and codification of requirements.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "installability",
        "evaluation": "aggregateImpacts",
        "reasoning": "The installability depends on types of artifacts used and suitable automation.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "replaceability",
        "evaluation": "aggregateImpacts",
        "reasoning": "The replaceability depends on how state is managed and how communcation is managed.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "faultTolerance",
        "evaluation": "aggregateImpacts",
        "reasoning": "Fault Tolerance can be improved through managing communcation and implementing measures mitigating faults.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "recoverability",
        "evaluation": "aggregateImpacts",
        "reasoning": "The recoverability depends on how quickly problems can be detected and on how easy it is to set up a system again.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
    {
        "targetAspect": "interoperability",
        "evaluation": "aggregateImpacts",
        "reasoning": "The interoperability depends on how well interfaces are described and thus useable by others.",
        "precondition": "at-least-one",
        "impactsInterpretation": "median"
    },
] satisfies QualityAspectEvaluationSpec[]


export type QualityModelSpec = {
    qualityAspects: { [highLevelAspectKey in HighLevelAspectKey]: HighLevelQualityAspecSpec },
    factorCategories: { [categoryKey in FactorCategoryKey]: CategorySpec },
    productFactors: { [productFatorKey in ProductFactorKey]: ProductFactorSpec },
    impacts: ImpactSpec[],
    measures: { [measureKey in MeasureKey]: MeasureSpec },
    qualityAspectEvaluations: QualityAspectEvaluationSpec[]
}

export const qualityModel = {
    "qualityAspects": qualityAspects,
    "factorCategories": factorCategories,
    "productFactors": productFactors,
    "impacts": impacts,
    "measures": measures,
    "qualityAspectEvaluations": qualityAspectEvaluations
} satisfies QualityModelSpec;
