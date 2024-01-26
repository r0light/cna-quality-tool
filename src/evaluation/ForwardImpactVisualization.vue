
<template>
    <div :id="graphId" v-html="renderImpactGraph()"></div>
</template>


<script lang="ts" setup>
import $ from 'jquery';
import { EvaluatedProductFactor, EvaluatedQualityAspect, ImpactWeight } from '@/core/qualitymodel/evaluation/EvaluatedSystemModel';
import mermaid from 'mermaid';
import { onMounted } from 'vue';
import { ImpactType } from '@/core/qualitymodel/quamoco/Impact';
import { MermaidBuffer } from './MermaidBuffer';


onMounted(() => {
    mermaid.initialize({ startOnLoad: true });
})

const props = defineProps<{
    rootFactors: EvaluatedProductFactor[],
}>()

const graphId = `${props.rootFactors.map(factor => factor.id).join("-")}-impact-graph`;


function renderImpactGraph() {

    let graphDefinition = "graph LR";

    let rootNodes = props.rootFactors;

    for (const node of rootNodes) {
        graphDefinition = graphDefinition.concat(describeFactor(node));
    }

    let mermaidBuffer = new MermaidBuffer();

    for (const node of rootNodes) {
        addImpacts(node, mermaidBuffer);
    }
    graphDefinition = graphDefinition.concat(mermaidBuffer.getElementSection, "\n", mermaidBuffer.getStylingSection);

    mermaid.render(`${graphId}-svg`, graphDefinition).then(result => {
        let element = $(`#${graphId}`)[0];
        element.innerHTML = result.svg;
    });
}

function addImpacts(currentFactor: EvaluatedProductFactor, buffer: MermaidBuffer) {

    for (const impact of currentFactor.impacts) {

        // TODO currently only render completely, if evaluation result is available
        if (impact.impactedFactor) {
            if (buffer.isNotYetAdded(impact.impactedFactorKey)) {
                buffer.addElement(impact.impactedFactorKey, describeFactor(impact.impactedFactor));
            }
        } else {
            throw new Error(`Impacted factor ${impact.impactedFactorKey} for factor ${currentFactor.id} is undefined`);
        }
        let impactElementId = `${currentFactor.id}-impacts-${impact.impactedFactorKey}`;
        if (buffer.isNotYetAdded(impactElementId)) {
            buffer.addElement(impactElementId, describeImpact(currentFactor.id, impact.weight, impact.impactType, impact.impactedFactorKey));
            buffer.addStyling(describeImpactStyle(buffer.getLinkCounter, impact.weight));
            buffer.incrementLinkCounter();
        }

        if (impact.impactedFactor && impact.impactedFactor.factorType === "productFactor") {
            addImpacts(impact.impactedFactor, buffer);
        }

    }
}

function describeFactor(factor: EvaluatedProductFactor | EvaluatedQualityAspect): string {
    return `\n\t${factor.id}[${factor.name}\n\t<span class="evaluation-result">${factor.result}</span>]`;
}


function describeImpact(sourceFactorKey: string, impactWeight: ImpactWeight, impactType: ImpactType, targetFactorKey: string) {
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

function describeImpactStyle(count: number, impactWeight: ImpactWeight): string {
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


</script>

<style>
.evaluation-result {
    font-style: italic;
}

.unknownFactorResult {}

.neutralFactorResult {}

.highFactorResult {}
</style>