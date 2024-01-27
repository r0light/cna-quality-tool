import { EvaluatedProductFactor, EvaluatedQualityAspect, ImpactWeight } from "@/core/qualitymodel/evaluation/EvaluatedSystemModel";
import { ImpactType } from "@/core/qualitymodel/quamoco/Impact";

export function describeNodeStyleClasses(): string {
    return `     classDef factor-not-applicable fill:#f2f2f2,stroke:#d9d9d9,stroke-width:2px;
    classDef factor-applicable fill:#d9d9d9,stroke:#000,stroke-width:2px;
    classDef factor-low fill:#b3d9ff,stroke:#000,stroke-width:2px;
    classDef factor-high fill:#80bfff,stroke:#000,stroke-width:3px;`;
}

export function describeFactor(factor: EvaluatedProductFactor | EvaluatedQualityAspect): string {
    return `\n\t${factor.id}[${factor.name}\n\t<span class="evaluation-result">${factor.result}</span>]`;
}


export function describeFactorStyle(factor: EvaluatedProductFactor | EvaluatedQualityAspect): string {
    let styleClass = "";

    if (typeof factor.result === "string") {
        switch (factor.result) {
            case "none":
                styleClass = "factor-applicable";
                break;
            case "low":
                styleClass = "factor-low";
                break;
            case "high":
                styleClass = "factor-high";
                break;
            case "n/a":
            default:
                styleClass = "factor-not-applicable";
                break;
        }
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
        case "slightly positive":
            impactLabel = "+";
            break;
        case "negative":
        case "slightly negative":
            impactLabel = "-";
            break;
        case "n/a":
        default:
            impactLabel = impactType;
            break;
    }
    return `\n\t${sourceFactorKey}-->|${impactLabel}|${targetFactorKey}`;
}

export function describeImpactStyle(count: number, impactWeight: ImpactWeight): string {
    let color = "#000";

    switch (impactWeight) {
        case "neutral":
            color = "#000";
            break;
        case "positive":
        case "slightly positive":
            color = "#33cc33";
            break;
        case "negative":
        case "slightly negative":
            color = "#ff5050";
            break;
        case "n/a":
        default:
            color = "#d9d9d9";
            break;
    }

    return `\n\tlinkStyle ${count} stroke-width:2px,fill:none,stroke:${color},color:#000`;
}

