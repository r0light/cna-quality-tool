<template>
    <div v-for="[qualityAspectKey, qualityAspect] of evaluatedQualityAspects">
        <div :id="`${qualityAspectKey}-impacts`" v-html="renderAspectGraph(`${qualityAspectKey}-impacts`, qualityAspect)"></div>

    </div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { EvaluatedProductFactor, EvaluatedQualityAspect } from '@/core/qualitymodel/evaluation/EvaluatedSystemModel';
import { ComputedRef, computed } from 'vue';
import { MermaidBuffer } from './MermaidBuffer';
import mermaid from 'mermaid';
import { describeNodeStyleClasses, describeFactor, describeFactorStyle, describeImpact, describeImpactStyle } from './evaluation-commons';

const props = defineProps<{
    evaluatedQualityAspects: Map<string, EvaluatedQualityAspect>,
}>()

function renderAspectGraph(nodeId: string, evaluatedQualityAspect: EvaluatedQualityAspect) {
    let graphDefinition = "graph BT";

    let mermaidBuffer = new MermaidBuffer();

 mermaidBuffer.addStyling(describeNodeStyleClasses());

        mermaidBuffer.addElement(evaluatedQualityAspect.id, describeFactor(evaluatedQualityAspect));
        mermaidBuffer.addStyling(describeFactorStyle(evaluatedQualityAspect));

        addImpacts(evaluatedQualityAspect, mermaidBuffer);

    graphDefinition = graphDefinition.concat(mermaidBuffer.getElementSection, "\n", mermaidBuffer.getStylingSection);

    mermaid.render(`${nodeId}-svg`, graphDefinition).then(result => {
        let element = $(`#${nodeId}`)[0];
        element.innerHTML = result.svg;
    });

}

function addImpacts(impactedFactor: EvaluatedQualityAspect | EvaluatedProductFactor, buffer: MermaidBuffer) {

    for (const impact of impactedFactor.backwardImpacts) {

        if (buffer.isNotYetAdded(impact.impactingFactorKey)) {
            buffer.addElement(impact.impactingFactorKey, describeFactor(impact.impactingFactor));
            buffer.addStyling(describeFactorStyle(impact.impactingFactor));
        }

        let impactElementId = `${impact.impactingFactor.id}-impacts-${impactedFactor.id}`;
        if (buffer.isNotYetAdded(impactElementId)) {
            buffer.addElement(impactElementId, describeImpact(impact.impactingFactorKey, impact.weight, impact.impactType, impactedFactor.id));
            buffer.addStyling(describeImpactStyle(buffer.getLinkCounter, impact.weight));
            buffer.incrementLinkCounter();
        }

        addImpacts(impact.impactingFactor, buffer);
    }
}

</script>

<style></style>