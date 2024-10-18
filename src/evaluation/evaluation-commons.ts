import { EvaluatedProductFactor, EvaluatedQualityAspect, ImpactWeight } from "@/core/qualitymodel/evaluation/Evaluation";
import { ImpactType } from "@/core/qualitymodel/quamoco/Impact";

export function describeNodeStyleClasses(): string {
    return `     classDef factor-not-applicable fill:#f2f2f2,stroke:#d9d9d9,stroke-width:2px;
    classDef factor-applicable fill:#d9d9d9,stroke:#000,stroke-width:2px;
    classDef factor-low fill:#e6f2ff,stroke:#000,stroke-width:2px;
    classDef factor-moderate fill:#b3d9ff,stroke:#000,stroke-width:2px;
    classDef factor-high fill:#80bfff,stroke:#000,stroke-width:2px;
    classDef aspect-spositive fill:#e5ffe5,stroke:#000,stroke-width:2px;
    classDef aspect-positive fill:#b3ffb3,stroke:#000,stroke-width:2px;
    classDef aspect-snegative fill:#ffe5e5,stroke:#000,stroke-width:2px;
    classDef aspect-negative fill:#ffb3b3,stroke:#000,stroke-width:2px;
    `;
}

export function describeFactor(factor: EvaluatedProductFactor | EvaluatedQualityAspect): string {
    let result = "";
    if (typeof factor.result === "string") {
        result = factor.result;
    } else if (typeof factor.result === "number") {
        result = factor.result.toString();
    }
    return `\n\t${factor.id}[${factor.name}\n\t<span class="evaluation-result">${result}</span>]`;
}


export function describeFactorStyle(factor: EvaluatedProductFactor): string {
    let styleClass = "";

    if (typeof factor.result === "string") {
        switch (factor.result) {
            case "none":
                styleClass = "factor-applicable";
                break;
            case "low":
                styleClass = "factor-low";
                break;
            case "moderate":
                styleClass = "factor-moderate";
                break;
            case "high":
                styleClass = "factor-high";
                break;
            case "n/a":
            default:
                styleClass = "factor-not-applicable";
                break;
        }
    } else if (typeof factor.result === "number") {
        styleClass = "factor-applicable"; // TODO better solution
    }
    return `\n\tclass ${factor.id} ${styleClass}`;
}

export function describeAspectStyle(factor: EvaluatedQualityAspect): string {
    let styleClass = "";

    if (typeof factor.result === "string") {
        switch (factor.result) {
            case "neutral":
            case "mixed":
                styleClass = "factor-applicable";
                break;
            case "slightly negative":
                styleClass = "aspect-snegative";
                break;
            case "negative":
                styleClass = "aspect-negative";
                break;
            case "slightly positive":
                styleClass = "aspect-spositive";
                break;
            case "positive":
                styleClass = "aspect-positive";
                break;
            case "n/a":
            default:
                styleClass = "factor-not-applicable";
                break;
        }
    } else if (typeof factor.result === "number") {
        styleClass = "factor-applicable"; // TODO better solution
    }
    return `\n\tclass ${factor.id} ${styleClass}`;
}


export function describeImpact(sourceFactorKey: string, impactWeight: ImpactWeight, impactType: ImpactType, targetFactorKey: string) {
    let impactLabel = "";
    switch (impactWeight) {
        case "neutral":
            impactLabel = "o";
            break;
        case "positive":
            impactLabel = "++";
            break;
        case "slightly positive":
            impactLabel = "+";
            break;
        case "negative":
            impactLabel = "--";
            break;
        case "slightly negative":
            impactLabel = "-";
            break;
        case "n/a":
        default:
            if (impactType === "positive") {
                impactLabel = "+";
            } else if (impactType === "negative") {
                impactLabel = "-";
            } else {
                impactLabel = impactType;
            }
            break;
    }
    return `\n\t${sourceFactorKey}-->|${impactLabel}|${targetFactorKey}`;
}

export function describeImpactStyle(count: number, impactWeight: ImpactWeight): string {
    let color = "#000";
    let strokeWidth = "2px"; 

    switch (impactWeight) {
        case "neutral":
            color = "#000";
            break;
        case "positive":
            color = "#33cc33";
            strokeWidth = "3px";
            break;
        case "slightly positive":
            color = "#33cc33";
            break;
        case "negative":
            color = "#ff5050";
            strokeWidth = "3px";
            break;
        case "slightly negative":
            color = "#ff5050";
            break;
        case "n/a":
        default:
            color = "#d9d9d9";
            break;
    }

    return `\n\tlinkStyle ${count} stroke-width:${strokeWidth},fill:none,stroke:${color},color:#000`;
}

