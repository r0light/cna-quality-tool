import { AspectEvaluationFunction, exponentialNumericalMapping, FactorEvaluationFunction, FactorEvaluationParameters, ImpactWeight, impactWeightNumericMapping, interpretNumericalResultAsFactorEvaluation, interpretNumericValueAsOutcome, linearNumericalMapping, squareRootedNumericalMapping } from "./Evaluation";
import { ProductFactorKey } from "../specifications/qualitymodel";
import { param } from "jquery";
import { average } from "./measure-implementations/general-functions";
import { max } from "lodash";

const mean: (list: number[]) => number = list => {
    return list.reduce((e1, e2) => e1 + e2, 0) / list.length
}
const median = (arr: number[]): number | undefined => {
    if (!arr.length) return undefined;
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : ((s[mid - 1] + s[mid]) / 2);
};
const lowest: (list: number[]) => number = list => { return Math.min(...list) }
const highest: (list: number[]) => number = list => { return Math.max(...list) }


const generalProductFactorEvaluationImplementation: {
    [evaluationKey: string]: FactorEvaluationFunction
} = {
    "aggregateImpacts": (parameters) => {
        let aggregateResult: ImpactWeight[] = parameters.incomingImpacts.map(impact => impact.weight);

        if (aggregateResult.length === 0) {
            return "n/a";
        }

        let valuedImpacts = aggregateResult.filter(result => result !== "n/a");
        let numberOfValuedImpacts = valuedImpacts.length;

        // if there is no valued impact, directly return 
        if (numberOfValuedImpacts === 0) {
            return "n/a";
        }

        // if precondition is all, all incoming impacts need to have a value
        if (parameters.precondition === "all" && numberOfValuedImpacts < aggregateResult.length) {
            return "n/a";
        }

        // if precondition is majority, a majority needs to be valued
        if (parameters.precondition === "majority" && numberOfValuedImpacts < Math.ceil(aggregateResult.length / 2)) {
            return "n/a";
        }

        let numericalImpacts = valuedImpacts.map(impact => impactWeightNumericMapping(impact));

        // else: precondition is at-least-one
        let numericalResult = ((parameters: FactorEvaluationParameters) => {
            switch (parameters.impactsInterpretation) {
                case "highest":
                    return highest(numericalImpacts);
                case "lowest":
                    return lowest(numericalImpacts);
                case "mean":
                    return mean(numericalImpacts);
                case "median":
                    return median(numericalImpacts);
                case "custom":
                    return parameters.customImpactInterpretation(numericalImpacts);
                default:
                    throw new Error("Unknown impacts interpretation: " + parameters.impactsInterpretation);
            }
        })(parameters);

        return interpretNumericalResultAsFactorEvaluation(numericalResult);
    }
}

const productFactorEvaluationImplementation: {
    [factorKey: string]: FactorEvaluationFunction
} = {
    "serviceReplication": (parameters) => {
        let serviceReplicationLevel = parameters.calculatedMeasures.get("serviceReplicationLevel").value;
        let deploymentRedundancy = parameters.calculatedMeasures.get("amountOfRedundancy").value;
        if (serviceReplicationLevel === "n/a") {
            return "n/a";
        } else if (typeof serviceReplicationLevel === "number") {
            if (serviceReplicationLevel <= 1) {
                return "none";
            } else if (serviceReplicationLevel > 1 && serviceReplicationLevel < 1.5) {
                return "low";
            } else if (serviceReplicationLevel >= 1.5 && serviceReplicationLevel < 3) {
                return "moderate";
            } else {
                if (deploymentRedundancy as number > 2) {
                    return "high";
                } else {
                    return "moderate";
                }
            }
        } else {
            throw new Error(`serviceReplicationLevel is of type ${typeof serviceReplicationLevel}, but should be of type number`);
        }
    },
    "horizontalDataReplication": (parameters) => {
        let storageReplicationLevel = parameters.calculatedMeasures.get("storageReplicationLevel").value;
        if (storageReplicationLevel === "n/a") {
            return "n/a";
        } else if (typeof storageReplicationLevel === "number") {
            if (storageReplicationLevel <= 1) {
                return "none";
            } else if (storageReplicationLevel > 1 && storageReplicationLevel < 1.5) {
                return "low";
            } else if (storageReplicationLevel >= 1.5 && storageReplicationLevel < 3) {
                return "moderate";
            } else {
                return "high";
            }
        } else {
            throw new Error(`storageReplicationLevel is of type ${typeof storageReplicationLevel}, but should be of type number`);
        }
    },
    "shardedDataStoreReplication": (parameters) => {
        let dataShardingLevel = parameters.calculatedMeasures.get("dataShardingLevel").value;
        if (dataShardingLevel === "n/a") {
            return "n/a";
        } else if (typeof dataShardingLevel === "number") {
            if (dataShardingLevel <= 1) {
                return "none";
            } else if (dataShardingLevel > 1 && dataShardingLevel < 1.5) {
                return "low";
            } else if (dataShardingLevel >= 1.5 && dataShardingLevel < 3) {
                return "moderate";
            } else {
                return "high";
            }
        } else {
            throw new Error(`dataShardingLevel is of type ${typeof dataShardingLevel}, but should be of type number`);
        }
    },
    "systemVerticalDataReplication": (parameters) => {
        let ratioOfCachedDataAggregates = parameters.calculatedMeasures.get("ratioOfCachedDataAggregates").value;

        if (ratioOfCachedDataAggregates === "n/a") {
            return "n/a";
        } else if (typeof ratioOfCachedDataAggregates === "number") {
            return linearNumericalMapping(ratioOfCachedDataAggregates);
        } else {
            throw new Error(`ratioOfCachedDataAggregates is of type ${typeof ratioOfCachedDataAggregates}, but should be of type number`);
        }
    },
    "requestTraceVerticalDataReplication": (parameters) => {
        let requestTraceVerticalReplication = parameters.calculatedMeasures.get("dataReplicationAlongRequestTrace").value;

        if (requestTraceVerticalReplication === "n/a") {
            return "n/a";
        } else if (typeof requestTraceVerticalReplication === "number") {
            return linearNumericalMapping(requestTraceVerticalReplication);
        } else {
            throw new Error(`dataReplicationAlongRequestTrace is of type ${typeof requestTraceVerticalReplication}, but should be of type number`);
        }
    },
    "consistentlyMediatedCommunication": (parameters) => {
        let serviceMeshUsage = parameters.calculatedMeasures.get("serviceMeshUsage").value;

        if (serviceMeshUsage === "n/a") {
            return "n/a";
        } else if (typeof serviceMeshUsage === "number") {
            return linearNumericalMapping(serviceMeshUsage);
        } else {
            throw new Error(`dataReplicationAlongRequestTrace is of type ${typeof serviceMeshUsage}, but should be of type number`);
        }
    },
    "addressingAbstraction": (parameters) => {
        let serviceDiscoveryUsage = parameters.calculatedMeasures.get("serviceDiscoveryUsage").value;

        if (serviceDiscoveryUsage === "n/a") {
            return "n/a";
        } else if (typeof serviceDiscoveryUsage === "number") {
            return linearNumericalMapping(serviceDiscoveryUsage);
        } else {
            throw new Error(`dataReplicationAlongRequestTrace is of type ${typeof serviceDiscoveryUsage}, but should be of type number`);
        }
    },
    "dataEncryptionInTransit": (parameters) => {
        let securedExternalEndpoints = parameters.calculatedMeasures.get("ratioOfExternalEndpointsSupportingTls").value;
        let securedLinks = parameters.calculatedMeasures.get("ratioOfSecuredLinks").value;

        if (securedLinks === "n/a" || securedExternalEndpoints === "n/a") {
            return "n/a";
        }
        return linearNumericalMapping(average([securedExternalEndpoints as number, securedLinks as number]));
    },
    "isolatedSecrets": (parameters) => {
        let externalizedSecrets = parameters.calculatedMeasures.get("secretsExternalization").value;

        if (externalizedSecrets === "n/a") {
            return "n/a";
        }
        return linearNumericalMapping(externalizedSecrets as number);
    },
    "secretsStoredInSpecializedServices": (parameters) => {
        let secretsInVaults = parameters.calculatedMeasures.get("secretsStoredInVault").value;

        if (secretsInVaults === "n/a") {
            return "n/a";
        }
        return linearNumericalMapping(secretsInVaults as number);
    },
    "leastPrivilegedAccess": (parameters) => {
        let accessRestrictedToCallers = parameters.calculatedMeasures.get("accessRestrictedToCallers").value;

        if (accessRestrictedToCallers === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(accessRestrictedToCallers as number);
    },
    "accessControlManagementConsistency": (parameters) => {
        let iendpointAccessMethodsConsistency = parameters.calculatedMeasures.get("iendpointAccessMethodsConsistency").value;
        let externalEndpointAccessConsistency = parameters.calculatedMeasures.get("externalEndpointAccessConsistency").value;

        if (iendpointAccessMethodsConsistency === "n/a") {
            if (externalEndpointAccessConsistency === "n/a") {
                return "n/a";
            }
            return linearNumericalMapping(externalEndpointAccessConsistency as number);
        } else if (externalEndpointAccessConsistency === "n/a") {
            return linearNumericalMapping(iendpointAccessMethodsConsistency as number);
        } else {
            return linearNumericalMapping(average([iendpointAccessMethodsConsistency, externalEndpointAccessConsistency] as number[]) as number);
        }
    },
    "accountSeparation": (parameters) => {
        let ratioOfUniqueAccountUsage = parameters.calculatedMeasures.get("ratioOfUniqueAccountUsage").value;

        if (ratioOfUniqueAccountUsage === "n/a") {
            return "n/a";
        }

        return squareRootedNumericalMapping(ratioOfUniqueAccountUsage as number);
    },
    "authenticationDelegation": (parameters) => {
        let ratioOfDelegatedAuthentication = parameters.calculatedMeasures.get("ratioOfDelegatedAuthentication").value;

        if (ratioOfDelegatedAuthentication === "n/a") {
            return "n/a";
        }

        return squareRootedNumericalMapping(ratioOfDelegatedAuthentication as number);
    },
    "limitedDataScope": (parameters) => {
        let cohesionBetweenEndpointsBasedOnDataAggregateUsage = parameters.calculatedMeasures.get("cohesionBetweenEndpointsBasedOnDataAggregateUsage").value;

        if (cohesionBetweenEndpointsBasedOnDataAggregateUsage === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(cohesionBetweenEndpointsBasedOnDataAggregateUsage as number);
    },
    "limitedEndpointScope": (parameters) => {
        let serviceInterfaceUsageCohesion = parameters.calculatedMeasures.get("serviceInterfaceUsageCohesion").value;

        if (serviceInterfaceUsageCohesion === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(serviceInterfaceUsageCohesion as number);
    },
    "commandQueryResponsibilitySegregation": (parameters) => {
        let readWriteSeparationForDataAggregates = parameters.calculatedMeasures.get("readWriteSeparationForDataAggregates").value;

        if (readWriteSeparationForDataAggregates === "n/a") {
            return "n/a";
        }

        return exponentialNumericalMapping(readWriteSeparationForDataAggregates as number);
    },
    "mostlyStatelessServices": (parameters) => {
        let ratioOfStatelessComponents = parameters.calculatedMeasures.get("ratioOfStatelessComponents").value;

        let degreeToWhichComponentsAreLinkedToStatefulComponents = parameters.calculatedMeasures.get("degreeToWhichComponentsAreLinkedToStatefulComponents").value;

        if (ratioOfStatelessComponents === "n/a" || degreeToWhichComponentsAreLinkedToStatefulComponents === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(average([ratioOfStatelessComponents, 1 - (degreeToWhichComponentsAreLinkedToStatefulComponents as number)] as number[]));
    },
    "specializedStatefulServices": (parameters) => {
        let ratioOfSpecializedStatefulServices = parameters.calculatedMeasures.get("ratioOfSpecializedStatefulServices").value;

        let suitablyReplicatedStatefulService = parameters.calculatedMeasures.get("suitablyReplicatedStatefulService").value;

        if (ratioOfSpecializedStatefulServices === "n/a") {
            return "n/a";
        }

        if (suitablyReplicatedStatefulService !== "n/a") {
            return linearNumericalMapping(ratioOfSpecializedStatefulServices as number * (suitablyReplicatedStatefulService as number));
        } else {
            return linearNumericalMapping(ratioOfSpecializedStatefulServices as number);
        }
    },
    "asynchronousCommunication": (parameters) => {
        let degreeOfAsynchronousCommunication = parameters.calculatedMeasures.get("degreeOfAsynchronousCommunication").value;

        let asynchronousCommunicationUtilization = parameters.calculatedMeasures.get("asynchronousCommunicationUtilization").value;

        if (degreeOfAsynchronousCommunication === "n/a") {
            return "n/a";
        }

        if (asynchronousCommunicationUtilization !== "n/a") {
            return linearNumericalMapping(average([degreeOfAsynchronousCommunication, degreeOfAsynchronousCommunication] as number[]));
        } else {
            return linearNumericalMapping(degreeOfAsynchronousCommunication as number);
        }
    },
    "healthAndReadinessChecks": (parameters) => {
        let ratioOfServicesThatProvideHealthEndpoints = parameters.calculatedMeasures.get("ratioOfServicesThatProvideHealthEndpoints").value;
        let ratioOfServicesThatProvideReadinessEndpoints = parameters.calculatedMeasures.get("ratioOfServicesThatProvideHealthEndpoints").value;

        if (ratioOfServicesThatProvideHealthEndpoints === "n/a") {
            if (ratioOfServicesThatProvideReadinessEndpoints === "n/a") {
                return "n/a";
            }
            return squareRootedNumericalMapping(ratioOfServicesThatProvideReadinessEndpoints as number * 0.5);
        } else {
            if (ratioOfServicesThatProvideReadinessEndpoints === "n/a") {
                return squareRootedNumericalMapping(ratioOfServicesThatProvideHealthEndpoints as number * 0.5);
            } else {
                return squareRootedNumericalMapping(average([ratioOfServicesThatProvideHealthEndpoints,ratioOfServicesThatProvideReadinessEndpoints] as number[])
                )
            }
        }
    },
    "separationByGateways": (parameters) => {
        let degreeOfSeparationByGateways = parameters.calculatedMeasures.get("degreeOfSeparationByGateways").value;

        if (degreeOfSeparationByGateways === "n/a") {
            return "n/a";
        }
        return linearNumericalMapping(degreeOfSeparationByGateways as number);
    },
    "communicationPartnerAbstraction": (parameters) => {
        let eventSourcingUtilizationMetric = parameters.calculatedMeasures.get("eventSourcingUtilizationMetric").value;

        if (eventSourcingUtilizationMetric === "n/a") {
            return "n/a";
        }
        return exponentialNumericalMapping(eventSourcingUtilizationMetric as number);
    },
    "persistentCommunication": (parameters) => {
        let serviceInteractionViaBackingService = parameters.calculatedMeasures.get("serviceInteractionViaBackingService").value;
        let eventSourcingUtilizationMetric = parameters.calculatedMeasures.get("eventSourcingUtilizationMetric").value;

        if (serviceInteractionViaBackingService === "n/a") {
            if (eventSourcingUtilizationMetric === "n/a") {
                return "n/a";
            }
            return linearNumericalMapping(eventSourcingUtilizationMetric as number);
        } else {
            if (eventSourcingUtilizationMetric === "n/a") {
                return linearNumericalMapping(serviceInteractionViaBackingService as number);
            } else {
                return linearNumericalMapping(
                    (serviceInteractionViaBackingService as number * 0.4) +
                    (eventSourcingUtilizationMetric as number * 0.6)
                )
            }
        }
    },
    "usageOfExistingSolutionsForNonCoreCapabilities": (parameters) => {
        let ratioOfNonCustomBackingServices = parameters.calculatedMeasures.get("ratioOfNonCustomBackingServices").value;

        if (ratioOfNonCustomBackingServices === "n/a") {
            return "n/a";
        }
        return squareRootedNumericalMapping(ratioOfNonCustomBackingServices as number);
    },
    "standardization": (parameters) => {
        let ratioOfStandardizedArtifacts = parameters.calculatedMeasures.get("ratioOfStandardizedArtifacts").value;
        let ratioOfEntitiesProvidingStandardizedArtifacts = parameters.calculatedMeasures.get("ratioOfEntitiesProvidingStandardizedArtifacts").value;

        if (ratioOfStandardizedArtifacts === "n/a") {
            if (ratioOfEntitiesProvidingStandardizedArtifacts === "n/a") {
                return "n/a";
            }
            return linearNumericalMapping(ratioOfEntitiesProvidingStandardizedArtifacts as number);
        } else {
            if (ratioOfEntitiesProvidingStandardizedArtifacts === "n/a") {
                return linearNumericalMapping(ratioOfStandardizedArtifacts as number);
            } else {
                return linearNumericalMapping(
                    (ratioOfEntitiesProvidingStandardizedArtifacts as number * 0.7) +
                    (ratioOfStandardizedArtifacts as number * 0.3)
                )
            }
        }
    },
    "componentSimilarityRequestTrace": (parameters) => {
        let componentArtifactsSimilarity = parameters.calculatedMeasures.get("componentArtifactsSimilarity").value;

        if (componentArtifactsSimilarity === "n/a") {
            return "n/a";
        }
        return linearNumericalMapping(componentArtifactsSimilarity as number);
    },
    "componentSimilaritySystem": (parameters) => {
        let componentArtifactsSimilarity = parameters.calculatedMeasures.get("componentArtifactsSimilarity").value;
        let infrastructureArtifactsSimilarity = parameters.calculatedMeasures.get("infrastructureArtifactsSimilarity").value;

        if (componentArtifactsSimilarity === "n/a") {
            if (infrastructureArtifactsSimilarity === "n/a") {
                return "n/a";
            }
            return linearNumericalMapping(infrastructureArtifactsSimilarity as number);
        } else {
            if (infrastructureArtifactsSimilarity === "n/a") {
                return linearNumericalMapping(componentArtifactsSimilarity as number);
            } else {
                return linearNumericalMapping(average([
                    componentArtifactsSimilarity as number,
                    infrastructureArtifactsSimilarity as number]
                ))
            }
        }
    },
    "distributedTracingOfInvocations": (parameters) => {
        let distributedTracingSupport = parameters.calculatedMeasures.get("distributedTracingSupport").value;

        if (distributedTracingSupport === "n/a") {
            return "n/a";
        }
        return linearNumericalMapping(distributedTracingSupport as number);
    },
    "consistentCentralizedLogging": (parameters) => {
        let ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService = parameters.calculatedMeasures.get("ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService").value;

        if (ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService === "n/a") {
            return "n/a";
        }
        return linearNumericalMapping(ratioOfComponentsOrInfrastructureNodesThatExportLogsToACentralService as number);
    },
    "consistentCentralizedMetrics": (parameters) => {
        let ratioOfComponentsOrInfrastructureNodesThatExportMetrics = parameters.calculatedMeasures.get("ratioOfComponentsOrInfrastructureNodesThatExportMetrics").value;

        if (ratioOfComponentsOrInfrastructureNodesThatExportMetrics === "n/a") {
            return "n/a";
        }
        return linearNumericalMapping(ratioOfComponentsOrInfrastructureNodesThatExportMetrics as number);
    },
    "automatedInfrastructureProvisioning": (parameters) => {
        let ratioOfAutomaticallyProvisionedInfrastructure = parameters.calculatedMeasures.get("ratioOfAutomaticallyProvisionedInfrastructure").value;

        if (ratioOfAutomaticallyProvisionedInfrastructure === "n/a") {
            return "n/a";
        }
        return linearNumericalMapping(ratioOfAutomaticallyProvisionedInfrastructure as number);
    },
    "useInfrastructureAsCode": (parameters) => {
        let ratioOfInfrastructureWithIaCArtifact = parameters.calculatedMeasures.get("ratioOfInfrastructureWithIaCArtifact").value;

        if (ratioOfInfrastructureWithIaCArtifact === "n/a") {
            return "n/a";
        }
        return linearNumericalMapping(ratioOfInfrastructureWithIaCArtifact as number);
    },
    "dynamicScheduling": (parameters) => {
        let ratioOfDeploymentsOnDynamicInfrastructure = parameters.calculatedMeasures.get("ratioOfDeploymentsOnDynamicInfrastructure").value;

        if (ratioOfDeploymentsOnDynamicInfrastructure === "n/a") {
            return "n/a";
        }
        return linearNumericalMapping(ratioOfDeploymentsOnDynamicInfrastructure as number);
    },
    "lowCouplingForComponent": (parameters) => {
        let numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents = parameters.calculatedMeasures.get("numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents").value;

        if (numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents === "n/a") {
            return "n/a";
        }

        let inverseCoupling = 1 - (numberOfComponentsAComponentIsLinkedToRelativeToTheTotalAmountOfComponents as number);

        return linearNumericalMapping(inverseCoupling as number);
    },
    "lowCouplingForSystem": (parameters) => {
        let degreeOfCouplingInASystem = parameters.calculatedMeasures.get("degreeOfCouplingInASystem").value;

        if (degreeOfCouplingInASystem === "n/a") {
            return "n/a";
        }

        let inverseCoupling = 1 - (degreeOfCouplingInASystem as number);

        return squareRootedNumericalMapping(inverseCoupling as number);
    },
    "functionalDecentralization": (parameters) => {
        let dataAggregateSpread = parameters.calculatedMeasures.get("dataAggregateSpread").value;
        let requestTraceSimilarityBasedOnIncludedComponents = parameters.calculatedMeasures.get("requestTraceSimilarityBasedOnIncludedComponents").value;

        if (dataAggregateSpread === "n/a") {
            if (requestTraceSimilarityBasedOnIncludedComponents === "n/a") {
                return "n/a";
            }
            return squareRootedNumericalMapping(1 - (requestTraceSimilarityBasedOnIncludedComponents as number));
        } else {
            if (requestTraceSimilarityBasedOnIncludedComponents === "n/a") {
                return squareRootedNumericalMapping(1 - (dataAggregateSpread as number));
            } else {
                return squareRootedNumericalMapping(average([1 - (dataAggregateSpread as number), 1 - (requestTraceSimilarityBasedOnIncludedComponents as number)]));
            }
        }
    },
    "limitedRequestTraceScopeForRequestTrace": (parameters) => {
        let requestTraceComplexity = parameters.calculatedMeasures.get("requestTraceComplexity").value;
        let maximumNumberOfServicesWithinARequestTrace = parameters.calculatedMeasures.get("maximumNumberOfServicesWithinARequestTrace").value;

        if (requestTraceComplexity === "n/a" || maximumNumberOfServicesWithinARequestTrace === "n/a") {
            return "n/a";
        }

        let maximum = Math.max(requestTraceComplexity as number, maximumNumberOfServicesWithinARequestTrace as number);

        if (maximum <= 1) {
            return "high";
        } else if (maximum > 1 && maximum <= 3) {
            return "moderate";
        } else if (maximum > 3 && maximum <= 6) {
            return "low";
        } else {
            return "none";
        }
    },
    "limitedRequestTraceScopeForSystem": (parameters) => {
        let averageComplexityOfRequestTraces = parameters.calculatedMeasures.get("averageComplexityOfRequestTraces").value;
        let maximumNumberOfServicesWithinARequestTrace = parameters.calculatedMeasures.get("maximumNumberOfServicesWithinARequestTrace").value;

        if (averageComplexityOfRequestTraces === "n/a" || maximumNumberOfServicesWithinARequestTrace === "n/a") {
            return "n/a";
        }

        let maximum = Math.max(averageComplexityOfRequestTraces as number, maximumNumberOfServicesWithinARequestTrace as number);

        if (maximum <= 1) {
            return "high";
        } else if (maximum > 1 && maximum <= 3) {
            return "moderate";
        } else if (maximum > 3 && maximum <= 6) {
            return "low";
        } else {
            return "none";
        }
    },
    "logicalGrouping": (parameters) => {
        let namespaceSeparation = parameters.calculatedMeasures.get("namespaceSeparation").value;

        if (namespaceSeparation === "n/a") {
            return "n/a";
        }

        return squareRootedNumericalMapping(namespaceSeparation as number);
    },
    "backingServiceDecentralizationForComponent": (parameters) => {
        let ratioOfStorageBackendSharing = parameters.calculatedMeasures.get("ratioOfStorageBackendSharing").value;
        let ratioOfBrokerBackendSharing = parameters.calculatedMeasures.get("ratioOfBrokerBackendSharing").value;

        if (ratioOfStorageBackendSharing === "n/a") {
            if (ratioOfBrokerBackendSharing === "n/a") {
                return "n/a";
            }
            return linearNumericalMapping(1 - (ratioOfBrokerBackendSharing as number));
        } else {
            if (ratioOfBrokerBackendSharing === "n/a") {
                return linearNumericalMapping(1 - (ratioOfStorageBackendSharing as number));
            } else {
                return linearNumericalMapping(average([1 - (ratioOfStorageBackendSharing as number), 1 - (ratioOfBrokerBackendSharing as number)]));
            }
        }
    },
    "backingServiceDecentralizationForSystem": (parameters) => {
        let averageWeightedStorageBackendSharing = parameters.calculatedMeasures.get("averageWeightedStorageBackendSharing").value;
        let averageWeightedBrokerBackendSharing = parameters.calculatedMeasures.get("averageWeightedBrokerBackendSharing").value;

        if (averageWeightedStorageBackendSharing === "n/a") {
            if (averageWeightedBrokerBackendSharing === "n/a") {
                return "n/a";
            }
            return squareRootedNumericalMapping(1 - (averageWeightedBrokerBackendSharing as number));
        } else {
            if (averageWeightedBrokerBackendSharing === "n/a") {
                return squareRootedNumericalMapping(1 - (averageWeightedStorageBackendSharing as number));
            } else {
                return squareRootedNumericalMapping(average([1 - (averageWeightedStorageBackendSharing as number), 1 - (averageWeightedBrokerBackendSharing as number)]));
            }
        }
    },
    "managedInfrastructure": (parameters) => {
        let ratioOfFullyManagedInfrastructure = parameters.calculatedMeasures.get("ratioOfFullyManagedInfrastructure").value;

        if (ratioOfFullyManagedInfrastructure === "n/a") {
            return "n/a";
        }

        return squareRootedNumericalMapping(ratioOfFullyManagedInfrastructure as number);
    },
    "managedBackingServices": (parameters) => {
        let ratioOfManagedBackingServices = parameters.calculatedMeasures.get("ratioOfManagedBackingServices").value;

        if (ratioOfManagedBackingServices === "n/a") {
            return "n/a";
        }

        return squareRootedNumericalMapping(ratioOfManagedBackingServices as number);
    },
    "operationOutsourcing": (parameters) => {
        let ratioOfProviderManagedComponentsAndInfrastructure = parameters.calculatedMeasures.get("ratioOfProviderManagedComponentsAndInfrastructure").value;

        if (ratioOfProviderManagedComponentsAndInfrastructure === "n/a") {
            return "n/a";
        }

        return squareRootedNumericalMapping(ratioOfProviderManagedComponentsAndInfrastructure as number);
    },
    "enforcementOfAppropriateResourceBoundaries": (parameters) => {
        let ratioOfInfrastructureEnforcingResourceBoundaries = parameters.calculatedMeasures.get("ratioOfInfrastructureEnforcingResourceBoundaries").value;

        let ratioOfDeploymentMappingsWithStatedResourceRequirements = parameters.calculatedMeasures.get("ratioOfDeploymentMappingsWithStatedResourceRequirements").value;

        if (ratioOfInfrastructureEnforcingResourceBoundaries === "n/a") {
            if (ratioOfDeploymentMappingsWithStatedResourceRequirements === "n/a") {
                return "n/a";
            }
            return linearNumericalMapping(ratioOfDeploymentMappingsWithStatedResourceRequirements as number);
        } else {
            if (ratioOfDeploymentMappingsWithStatedResourceRequirements === "n/a") {
                return linearNumericalMapping(ratioOfInfrastructureEnforcingResourceBoundaries as number);
            } else {
                return linearNumericalMapping(average([ratioOfInfrastructureEnforcingResourceBoundaries as number, ratioOfDeploymentMappingsWithStatedResourceRequirements as number]));
            }
        }
    },
    "enforcementOfAppropriateResourceBoundariesForComponents": (parameters) => {
        let ratioOfDeploymentMappingsWithStatedResourceRequirements = parameters.calculatedMeasures.get("ratioOfDeploymentMappingsWithStatedResourceRequirements").value;

        if (ratioOfDeploymentMappingsWithStatedResourceRequirements === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(ratioOfDeploymentMappingsWithStatedResourceRequirements as number);
    },
    "automatedInfrastructureMaintenance": (parameters) => {
        let ratioOfAutomaticallyMaintainedInfrastructure = parameters.calculatedMeasures.get("ratioOfAutomaticallyMaintainedInfrastructure").value;

        if (ratioOfAutomaticallyMaintainedInfrastructure === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(ratioOfAutomaticallyMaintainedInfrastructure as number);
    },
    "builtInAutoscaling": (parameters) => {
        let infrastructureAutoscaling = parameters.calculatedMeasures.get("infrastructureAutoscaling").value;
        let deployedEntitiesAutoscaling = parameters.calculatedMeasures.get("deployedEntitiesAutoscaling").value;

        if (infrastructureAutoscaling === "n/a") {
            if (deployedEntitiesAutoscaling === "n/a") {
                return "n/a";
            }
            return linearNumericalMapping(deployedEntitiesAutoscaling as number);
        } else {
            if (deployedEntitiesAutoscaling === "n/a") {
                return linearNumericalMapping(infrastructureAutoscaling as number);
            } else {
                return linearNumericalMapping(average([infrastructureAutoscaling as number, deployedEntitiesAutoscaling as number]));
            }
        }
    },
    "builtInAutoscalingForComponent": (parameters) => {
        let deployedEntitiesAutoscaling = parameters.calculatedMeasures.get("deployedEntitiesAutoscaling").value;

        if (deployedEntitiesAutoscaling === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(deployedEntitiesAutoscaling as number);
    },
    "infrastructureAbstraction": (parameters) => {
        let ratioOfAbstractedHardware = parameters.calculatedMeasures.get("ratioOfAbstractedHardware").value;

        if (ratioOfAbstractedHardware === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(ratioOfAbstractedHardware as number);
    },
    "cloudVendorAbstraction": (parameters) => {
        let nonProviderSpecificInfrastructureArtifacts = parameters.calculatedMeasures.get("nonProviderSpecificInfrastructureArtifacts").value;
        let nonProviderSpecificComponentArtifacts = parameters.calculatedMeasures.get("nonProviderSpecificComponentArtifacts").value;

        if (nonProviderSpecificInfrastructureArtifacts === "n/a") {
            if (nonProviderSpecificComponentArtifacts === "n/a") {
                return "n/a";
            }
            return linearNumericalMapping(nonProviderSpecificComponentArtifacts as number);
        } else {
            if (nonProviderSpecificComponentArtifacts === "n/a") {
                return linearNumericalMapping(nonProviderSpecificInfrastructureArtifacts as number);
            } else {
                return linearNumericalMapping(average([nonProviderSpecificInfrastructureArtifacts as number, nonProviderSpecificComponentArtifacts as number]));
            }
        }
    },
    "cloudVendorAbstractionForInfrastructure": (parameters) => {
        let nonProviderSpecificInfrastructureArtifacts = parameters.calculatedMeasures.get("nonProviderSpecificInfrastructureArtifacts").value;

        if (nonProviderSpecificInfrastructureArtifacts === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(nonProviderSpecificInfrastructureArtifacts as number);
    },
    "cloudVendorAbstractionForComponents": (parameters) => {
        let nonProviderSpecificComponentArtifacts = parameters.calculatedMeasures.get("nonProviderSpecificComponentArtifacts").value;

        if (nonProviderSpecificComponentArtifacts === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(nonProviderSpecificComponentArtifacts as number);
    },
    "isolatedConfiguration": (parameters) => {
        let configurationExternalization = parameters.calculatedMeasures.get("configurationExternalization").value;

        if (configurationExternalization === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(configurationExternalization as number);
    },
    "configurationStoredInSpecializedServices": (parameters) => {
        let configurationStoredInConfigService = parameters.calculatedMeasures.get("configurationStoredInConfigService").value;

        if (configurationStoredInConfigService === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(configurationStoredInConfigService as number);
    },
    "contractBasedLinks": (parameters) => {
        let ratioOfEndpointsCoveredByContract = parameters.calculatedMeasures.get("ratioOfEndpointsCoveredByContract").value;

        if (ratioOfEndpointsCoveredByContract === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(ratioOfEndpointsCoveredByContract as number);
    },
    "standardizedSelfContainedDeploymentUnit": (parameters) => {
        let standardizedDeployments = parameters.calculatedMeasures.get("standardizedDeployments").value;
        let selfContainedDeployments = parameters.calculatedMeasures.get("selfContainedDeployments").value;

        if (standardizedDeployments === "n/a") {
            if (selfContainedDeployments === "n/a") {
                return "n/a";
            }
            return linearNumericalMapping(selfContainedDeployments as number);
        } else {
            if (selfContainedDeployments === "n/a") {
                return linearNumericalMapping(standardizedDeployments as number);
            } else {
                return linearNumericalMapping(average([standardizedDeployments as number, selfContainedDeployments as number]));
            }
        }
    },
    "immutableArtifacts": (parameters) => {
        let replacingDeployments = parameters.calculatedMeasures.get("replacingDeployments").value;

        if (replacingDeployments === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(replacingDeployments as number);
    },
    "guardedIngress": (parameters) => {
        let ratioOfComponentsWhoseIngressIsProxied = parameters.calculatedMeasures.get("ratioOfComponentsWhoseExternalIngressIsProxied").value;
        let ratioOfRateLimitingEndpoints = parameters.calculatedMeasures.get("ratioOfRateLimitingEndpoints").value

        if (ratioOfComponentsWhoseIngressIsProxied === "n/a") {
            if (ratioOfRateLimitingEndpoints === "n/a") {
                return "n/a";
            }
            return linearNumericalMapping(ratioOfRateLimitingEndpoints as number * 0.5);
        } else {
            if (ratioOfRateLimitingEndpoints === "n/a") {
                return linearNumericalMapping(ratioOfComponentsWhoseIngressIsProxied as number * 0.5);
            } else {
                return linearNumericalMapping(average([ratioOfComponentsWhoseIngressIsProxied as number, ratioOfRateLimitingEndpoints as number]));
            }
        }
    },
    "rollingUpgradesEnabledForInfrastructure": (parameters) => {
        let rollingUpdateOption = parameters.calculatedMeasures.get("rollingUpdateOption").value;

        if (rollingUpdateOption === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(rollingUpdateOption as number);
    },
    "rollingUpgradesEnabledForComponents": (parameters) => {
        let rollingUpdates = parameters.calculatedMeasures.get("rollingUpdates").value;

        if (rollingUpdates === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(rollingUpdates as number);
    },
    "rollingUpgradesEnabled": (parameters) => {
        let rollingUpdateOption = parameters.calculatedMeasures.get("rollingUpdateOption").value;
        let rollingUpdates = parameters.calculatedMeasures.get("rollingUpdates").value;

        if (rollingUpdateOption === "n/a") {
            if (rollingUpdates === "n/a") {
                return "n/a";
            }
            return linearNumericalMapping(rollingUpdates as number);
        } else {
            if (rollingUpdates === "n/a") {
                return linearNumericalMapping(rollingUpdateOption as number);
            } else {
                return linearNumericalMapping(average([rollingUpdateOption as number, rollingUpdates as number]));
            }
        }
    },
    "physicalDataDistribution": (parameters) => {
        let numberOfAvailabilityZonesUsedByStorageServices = parameters.calculatedMeasures.get("numberOfAvailabilityZonesUsedByStorageServices").value;

        if (numberOfAvailabilityZonesUsedByStorageServices === "n/a" || numberOfAvailabilityZonesUsedByStorageServices === 0) {
            return "n/a";
        }

        if (numberOfAvailabilityZonesUsedByStorageServices === 1) {
            return "none";
        } else if (numberOfAvailabilityZonesUsedByStorageServices as number > 1 && numberOfAvailabilityZonesUsedByStorageServices as number < 3) {
            return "low";
        } else if (numberOfAvailabilityZonesUsedByStorageServices as number >= 3 && numberOfAvailabilityZonesUsedByStorageServices as number < 5) {
            return "moderate";
        } else if (numberOfAvailabilityZonesUsedByStorageServices as number >= 5) {
            return "high";
        }
    },
    "physicalServiceDistribution": (parameters) => {
        let numberOfAvailabilityZonesUsedByServices = parameters.calculatedMeasures.get("numberOfAvailabilityZonesUsedByServices").value;

        if (numberOfAvailabilityZonesUsedByServices === "n/a" || numberOfAvailabilityZonesUsedByServices === 0) {
            return "n/a";
        }

        if (numberOfAvailabilityZonesUsedByServices === 1) {
            return "none";
        } else if (numberOfAvailabilityZonesUsedByServices as number > 1 && numberOfAvailabilityZonesUsedByServices as number < 3) {
            return "low";
        } else if (numberOfAvailabilityZonesUsedByServices as number >= 3 && numberOfAvailabilityZonesUsedByServices as number < 5) {
            return "moderate";
        } else if (numberOfAvailabilityZonesUsedByServices as number >= 5) {
            return "high";
        }
    },
    "distribution": (parameters) => {
        let numberOfAvailabilityZonesUsedByInfrastructure = parameters.calculatedMeasures.get("numberOfAvailabilityZonesUsedByInfrastructure").value;

        if (numberOfAvailabilityZonesUsedByInfrastructure === "n/a" || numberOfAvailabilityZonesUsedByInfrastructure === 0) {
            return "n/a";
        }

        if (numberOfAvailabilityZonesUsedByInfrastructure === 1) {
            return "none";
        } else if (numberOfAvailabilityZonesUsedByInfrastructure as number > 1 && numberOfAvailabilityZonesUsedByInfrastructure as number < 3) {
            return "low";
        } else if (numberOfAvailabilityZonesUsedByInfrastructure as number >= 3 && numberOfAvailabilityZonesUsedByInfrastructure as number < 5) {
            return "moderate";
        } else if (numberOfAvailabilityZonesUsedByInfrastructure as number >= 5) {
            return "high";
        }
    },
    "invocationTimeouts": (parameters) => {
        let ratioOfLinksWithTimeout = parameters.calculatedMeasures.get("ratioOfLinksWithTimeout").value;

        if (ratioOfLinksWithTimeout === "n/a") {
            return "n/a";
        }

        return squareRootedNumericalMapping(ratioOfLinksWithTimeout as number);
    },
    "retriesForSafeInvocations": (parameters) => {
        let ratioOfLinksWithRetryLogic = parameters.calculatedMeasures.get("ratioOfLinksWithRetryLogic").value;

        if (ratioOfLinksWithRetryLogic === "n/a") {
            return "n/a";
        }

        return squareRootedNumericalMapping(ratioOfLinksWithRetryLogic as number);
    },
    "circuitBreakedCommunication": (parameters) => {
        let ratioOfLinksWithComplexFailover = parameters.calculatedMeasures.get("ratioOfLinksWithComplexFailover").value;

        if (ratioOfLinksWithComplexFailover === "n/a") {
            return "n/a";
        }

        return squareRootedNumericalMapping(ratioOfLinksWithComplexFailover as number);
    },
    "automatedRestarts": (parameters) => {
        let deploymentsWithRestart = parameters.calculatedMeasures.get("deploymentsWithRestart").value;

        if (deploymentsWithRestart === "n/a") {
            return "n/a";
        }

        return squareRootedNumericalMapping(deploymentsWithRestart as number);
    },
    "apiBasedCommunication": (parameters) => {
        let ratioOfDocumentedEndpoints = parameters.calculatedMeasures.get("ratioOfDocumentedEndpoints").value;

        if (ratioOfDocumentedEndpoints === "n/a") {
            return "n/a";
        }

        return linearNumericalMapping(ratioOfDocumentedEndpoints as number);
    },
    "sparsity": (parameters) => {
        let numberOfComponents = parameters.calculatedMeasures.get("numberOfComponents").value;

        if (numberOfComponents === "n/a") {
            return "n/a";
        }
        if (numberOfComponents as number < 3) {
            return "high";
        } else if (numberOfComponents as number >= 3 && numberOfComponents as number < 6 ) {
            return "moderate";
        } else if (numberOfComponents as number >= 6 && numberOfComponents as number < 10 ) {
            return "low";
        } else {
            return "none";
        }
    },
};


const generalQualityAspectEvaluationImplementation: {
    [aspectKey: string]: AspectEvaluationFunction
} = {
    "aggregateImpacts": (parameters) => {
        let aggregateResult: ImpactWeight[] = parameters.incomingImpacts.map(impact => impact.weight);

        if (aggregateResult.length === 0) {
            return "n/a";
        }

        let valuedImpacts = aggregateResult.filter(result => result !== "n/a");
        let numberOfValuedImpacts = valuedImpacts.length;

        // if there is no valued impact, directly return 
        if (numberOfValuedImpacts === 0) {
            return "n/a";
        }

        // if precondition is all, all incoming impacts need to have a value
        if (parameters.precondition === "all" && numberOfValuedImpacts < aggregateResult.length) {
            return "n/a";
        }

        // if precondition is majority, a majority needs to be valued
        if (parameters.precondition === "majority" && numberOfValuedImpacts < Math.ceil(aggregateResult.length / 2)) {
            return "n/a";
        }

        let numericalImpacts = valuedImpacts.map(impact => impactWeightNumericMapping(impact));

        // else: precondition is at-least-one
        if (numericalImpacts.every(impact => impact >= 0) || numericalImpacts.every(impact => impact < 0)) {
            switch (parameters.impactsInterpretation) {
                case "highest":
                    return interpretNumericValueAsOutcome(highest(numericalImpacts));
                case "lowest":
                    return interpretNumericValueAsOutcome(lowest(numericalImpacts));
                case "mean":
                    return interpretNumericValueAsOutcome(mean(numericalImpacts));
                case "median":
                    return interpretNumericValueAsOutcome(median(numericalImpacts));
                case "custom":
                    return interpretNumericValueAsOutcome(parameters.customImpactInterpretation(numericalImpacts));
                default:
                    throw new Error("Unknown impacts interpretation: " + parameters.impactsInterpretation);
            }
        } else {
            return "mixed";
        }
    }
};

const qualityAspectEvaluationImplementation: {
    [aspectKey: string]: AspectEvaluationFunction
} = {

};

export { generalProductFactorEvaluationImplementation, productFactorEvaluationImplementation, generalQualityAspectEvaluationImplementation, qualityAspectEvaluationImplementation }