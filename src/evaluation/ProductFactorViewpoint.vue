<template>
    <div v-for="factorGroup of factorGroups" class="factorGroup d-flex flex-column">
        <ForwardImpactVisualization :rootFactors="(factorGroup as EvaluatedProductFactor[])">
        </ForwardImpactVisualization>
        <div class="accordion">
            <div v-for="productFactor of factorGroup" class="card">
                <h3 class="card-header">
                    <button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse"
                        :data-target="`#${productFactor.id}-details`" aria-expanded="true"
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
                            <span v-if="productFactor.measures.size > 0">Relevant measures:</span>
                            <ul>
                                <li v-for="[key, measure] of productFactor.measures">
                                    <span>{{ measure.name }}</span>: <span> {{ measure.value }}</span>
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
import { EvaluatedProductFactor } from '@/core/qualitymodel/evaluation/EvaluatedSystemModel';
import ForwardImpactVisualization from './ForwardImpactVisualization.vue';
import { ComputedRef, computed } from 'vue';
import { ProductFactor } from '@/core/qualitymodel/quamoco/ProductFactor';

const props = defineProps<{
    evaluatedProductFactors: Map<string, EvaluatedProductFactor>,
}>()

const factorGroups: ComputedRef<EvaluatedProductFactor[][]> = computed(() => {
    return getGroupsOfRelatedFactors();
});

function getEachFactorSeparately() {
    let eachFactorSeparately = [];
    for (const evaluatedProductFactor of props.evaluatedProductFactors.values()) {
        eachFactorSeparately.push([evaluatedProductFactor]);
    };
    return eachFactorSeparately;
}


type RelatedFactorGroup = {
    rootFactorKeys: Set<string>,
    impactedFactorKeys: Set<string>,
    factors: EvaluatedProductFactor[]
}

function getGroupsOfRelatedFactors() {
    let relatedFactorGroups: RelatedFactorGroup[] = [];

    factorsToCheck: for (const [factorKey, evaluatedProductFactor] of props.evaluatedProductFactors.entries()) {

        // ignore non-leaf factors
        if (evaluatedProductFactor.backwardImpacts.length > 0) {
            continue factorsToCheck;
        }

        let impactedFactors = searchForImpactedFactors(evaluatedProductFactor, false);

        for (const relatedFactorsGroup of relatedFactorGroups) {
            // check for common key among impacted factors
            if (Array.from(relatedFactorsGroup.impactedFactorKeys).some(factorKey => impactedFactors.includes(factorKey))) {
                // add this factor to an existing group
                relatedFactorsGroup.rootFactorKeys.add(factorKey);
                relatedFactorsGroup.factors.push(evaluatedProductFactor);
                // add all factors impacted by this factor
                impactedFactors.forEach(factorKey => relatedFactorsGroup.impactedFactorKeys.add(factorKey));
                continue factorsToCheck;
            }
        }

        // if no impacted factors common to an existing group could be found, start a new group
        relatedFactorGroups.push({
            rootFactorKeys: new Set([factorKey]),
            impactedFactorKeys: new Set(impactedFactors),
            factors: [evaluatedProductFactor]
        });

    };

    return relatedFactorGroups.map(relatedFactors => relatedFactors.factors);


}

function searchForImpactedFactors(evaluatedProductFactor: EvaluatedProductFactor, recursively: boolean): string[] {
    let impactedFactors = [];
    for (const impact of evaluatedProductFactor.forwardImpacts) {
        impactedFactors.push(impact.impactedFactorKey);
        if (recursively) {
            if (impact.impactedFactor.factorType === "productFactor") {
                impactedFactors.push(...searchForImpactedFactors(impact.impactedFactor, recursively));
            }
        }
    }
    return impactedFactors;
}

</script>

<style>
.factorGroup {
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