<template>
    <div :id="graphId" v-html="renderImpactGraph()"></div>
</template>


<script lang="ts" setup>
import $ from 'jquery';
import mermaid from 'mermaid';
import { onMounted } from 'vue';
import { MermaidBuffer } from './MermaidBuffer';
import { describeAspectStyle, describeFactor, describeFactorStyle, describeImpact, describeImpactStyle, describeNodeStyleClasses } from './evaluation-commons';
import { EvaluatedProductFactor, EvaluatedQualityAspect } from '@/core/qualitymodel/evaluation/Evaluation';


onMounted(() => {
    mermaid.initialize({ startOnLoad: true });
})

const props = defineProps<{
    rootFactors: EvaluatedProductFactor[],
}>()

const graphId = `${props.rootFactors.map(factor => factor.id).join("-")}-impact-graph`;

const currentFactors: Map<string, EvaluatedProductFactor | EvaluatedQualityAspect> = new Map();

function renderImpactGraph() {

    let graphDefinition = "graph LR";

    let mermaidBuffer = new MermaidBuffer();
    mermaidBuffer.addStyling(describeNodeStyleClasses());

    let rootNodes = props.rootFactors;
    for (const node of rootNodes) {
        currentFactors.set(node.id, node);
        mermaidBuffer.addElement(node.id, describeFactor(node, currentFactors));

        if (node.factorType === "productFactor") {
            mermaidBuffer.addStyling(describeFactorStyle(node, currentFactors));
        }
    }

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

    for (const impact of currentFactor.forwardImpacts) {

        if (buffer.isNotYetAdded(impact.impactedFactorKey)) {
            currentFactors.set(impact.impactedFactorKey, impact.impactedFactor);
            buffer.addElement(impact.impactedFactorKey, describeFactor(impact.impactedFactor, currentFactors));
            if (impact.impactedFactor.factorType === "productFactor") {
                buffer.addStyling(describeFactorStyle(impact.impactedFactor, currentFactors));
            } else  if (impact.impactedFactor.factorType === "qualityAspect") {
                buffer.addStyling(describeAspectStyle(impact.impactedFactor, currentFactors));
            }
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


</script>

<style>
.evaluation-result {
    font-style: italic;
}

.factor-not-applicable>* {
    fill: #f2f2f2 !important;
    stroke: #d9d9d9 !important;
    stroke-width: 2px !important;
}

.factor-applicable {
    fill: #bfbfbf !important;
    stroke: #000 !important;
    stroke-width: 2px !important;
}

.factor-low {
    fill: #e6f2ff !important;
    stroke: #000 !important;
    stroke-width: 3px !important;
}

.factor-moderate {
    fill: #b3d9ff !important;
    stroke: #000 !important;
    stroke-width: 3px !important;
}

.factor-high {
    fill: #66b3ff !important;
    stroke: #000 !important;
    stroke-width: 3px !important;
}

/*
.factor-negative {
    fill: #ff9999 !important;
    stroke: #000 !important;
    stroke-width: 2px !important;
}

.factor-positive > * {
    fill: #99ff99 !important;
    stroke: #000 !important;
    stroke-width: 2px !important;
}
    */
</style>