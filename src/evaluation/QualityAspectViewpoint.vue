<template>
    <div v-for="[qualityAspectKey, qualityAspect] of qualityAspectGroups" class="aspectGroup">
        <div :id="`${qualityAspectKey}-impacts`"
            v-html="renderAspectGraph(`${qualityAspectKey}-impacts`, qualityAspect)"></div>
        <div class="accordion">
            <div v-for="productFactor of getRelevantFactors(qualityAspect)" class="card">
                <h3 class="card-header">
                    <button class="btn btn-link btn-block text-left" type="button" data-bs-toggle="collapse"
                        :data-bs-target="`#${productFactor.id}-details`" aria-expanded="true"
                        :aria-controls="`${productFactor.id}-details`">
                        Details for {{ productFactor.name }}
                    </button>
                </h3>
                <div :id="`${productFactor.id}-details`" class="collapse" aria-labelledby="headingOne"
                    data-bs-parent="#accordionExample">
                    <div class="card-body d-flex flex-column factorDetails">
                        <div>
                            <span class="font-weight-bold">{{ productFactor.name }}</span> <span>evaluation
                                result</span>: <span> {{ productFactor.result }}</span>
                        </div>
                        <div>
                            <span class="font-italic"> {{ productFactor.evaluationReasoning }}</span>
                        </div>
                        <div>
                            <span v-if="productFactor.measures.size > 0">Relevant measures:</span>
                            <ul>
                                <li v-for="[key, measure] of productFactor.measures">
                                    <span>{{ measure.name }}</span>: <span class="font-weight-bold"> {{ measure.value
                                        }}</span><span> ({{ measure.description }})</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { ComputedRef, computed } from 'vue';
import { MermaidBuffer } from './MermaidBuffer';
import mermaid from 'mermaid';
import { describeNodeStyleClasses, describeFactor, describeFactorStyle, describeImpact, describeImpactStyle, describeAspectStyle } from './evaluation-commons';
import { EvaluatedProductFactor, EvaluatedQualityAspect } from '@/core/qualitymodel/evaluation/Evaluation';

const props = defineProps<{
    evaluatedQualityAspects: Map<string, EvaluatedQualityAspect>,
    showInconclusiveEvaluations: boolean,
}>()

const qualityAspectGroups: ComputedRef<Map<string, EvaluatedQualityAspect>> = computed(() => {
    return new Map([...props.evaluatedQualityAspects.entries()]
        .filter(([qualityAspectKey, qualityAspect]) => {
            if (!props.showInconclusiveEvaluations && getRelevantFactors(qualityAspect).every(factor => factor.result === "n/a")) {
                return false;
            }
            return true;
        }))
});

function renderAspectGraph(nodeId: string, evaluatedQualityAspect: EvaluatedQualityAspect) {
    let graphDefinition = "graph BT";

    let mermaidBuffer = new MermaidBuffer();

    mermaidBuffer.addStyling(describeNodeStyleClasses());

    let currentFactors: Map<string, EvaluatedProductFactor> = new Map();
    getRelevantFactors(evaluatedQualityAspect).forEach(factor => currentFactors.set(factor.id, factor));
    mermaidBuffer.addElement(evaluatedQualityAspect.id, describeFactor(evaluatedQualityAspect, currentFactors));
    if (evaluatedQualityAspect.factorType === "qualityAspect") {
        mermaidBuffer.addStyling(describeAspectStyle(evaluatedQualityAspect, currentFactors));
    }
    addImpacts(evaluatedQualityAspect, mermaidBuffer);

    graphDefinition = graphDefinition.concat(mermaidBuffer.getElementSection, "\n", mermaidBuffer.getStylingSection);

    mermaid.render(`${nodeId}-svg`, graphDefinition).then(result => {
        let element = $(`#${nodeId}`)[0];
        element.innerHTML = result.svg;
    });

}

function addImpacts(impactedFactor: EvaluatedQualityAspect | EvaluatedProductFactor, buffer: MermaidBuffer) {

    for (const impact of impactedFactor.backwardImpacts) {

        let currentFactors: Map<string, EvaluatedProductFactor> = new Map();
        getRelevantFactors(impact.impactingFactor).forEach(factor => currentFactors.set(factor.id, factor));

        if (buffer.isNotYetAdded(impact.impactingFactorKey)) {
            buffer.addElement(impact.impactingFactorKey, describeFactor(impact.impactingFactor, currentFactors));

            if (impact.impactingFactor.factorType === "productFactor") {
                buffer.addStyling(describeFactorStyle(impact.impactingFactor, currentFactors));
            }
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

function getRelevantFactors(factor: EvaluatedQualityAspect | EvaluatedProductFactor): EvaluatedProductFactor[] {

    let productFactors: EvaluatedProductFactor[] = [];

    addImpactingFactors(factor, productFactors);

    return productFactors;

}

function addImpactingFactors(qualityAspect: EvaluatedQualityAspect | EvaluatedProductFactor, productFactors: EvaluatedProductFactor[]) {
    for (const impact of qualityAspect.backwardImpacts) {
        productFactors.push(impact.impactingFactor);
        addImpactingFactors(impact.impactingFactor, productFactors);
    }
};

</script>

<style>
.aspectGroup {
    margin-top: 10px;
    padding: 10px;
    background-color: #fff;
    border-radius: 5px;
    border: 1px solid #343a40;
    row-gap: 5px;
}

.factorDetails {
    row-gap: 5px;
}
</style>