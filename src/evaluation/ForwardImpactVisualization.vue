
<template>
    <div :id="graphId" v-html="renderImpact()"></div>
</template>


<script lang="ts" setup>
import $ from 'jquery';
import { EvaluatedProductFactor, EvaluatedQualityAspect, ForwardImpactingPath } from '@/core/qualitymodel/evaluation/EvaluatedSystemModel';
import mermaid from 'mermaid';
import { onMounted } from 'vue';


onMounted(() => {
    mermaid.initialize({ startOnLoad: true });
})

const props = defineProps<{
    rootFactor: EvaluatedProductFactor,
}>()

const graphId = `${props.rootFactor.id}-impact-graph`;


function renderImpact() {

    let graphDefinition = "graph LR";

    let rootNode = props.rootFactor;

    graphDefinition = graphDefinition.concat(`\n\t${rootNode.id}[${rootNode.name}\n\t<span class="evaluation-result">${rootNode.result}</span>]`);

    graphDefinition = graphDefinition.concat(addImpacts(rootNode));

    mermaid.render(`${graphId}-svg`, graphDefinition).then(result => {
        let element = $(`#${graphId}`)[0];
        element.innerHTML = result.svg;
    });
}

function addImpacts(currentFactor: EvaluatedProductFactor) {
    let impactDescriptions = "";

    for (const impact of currentFactor.impacts) {

        // TODO currently only render completely, if evaluation result is available
        if (impact.impactedFactor) {
            impactDescriptions = impactDescriptions.concat(`\n\t${impact.impactedFactorKey}[${impact.impactedFactorName}\n\t<span class="evaluation-result">${impact.impactedFactor.result}</span>]`);
        } else {
            impactDescriptions = impactDescriptions.concat(`\n\t${impact.impactedFactorKey}[${impact.impactedFactorName}]`);
        }
        impactDescriptions = impactDescriptions.concat(`\n\t${currentFactor.id}-->|${impact.weight}|${impact.impactedFactorKey}`);

        if (impact.impactedFactor && impact.impactedFactor.factorType === "productFactor") {
            impactDescriptions = impactDescriptions.concat(addImpacts(impact.impactedFactor))
        }

    }
    return impactDescriptions;
}


</script>

<style>
.evaluation-result {
    font-style: italic;
}
</style>