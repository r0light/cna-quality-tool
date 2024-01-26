<template>
    <div v-for="factorGroup of factorGroups">
        <div v-for="productFactor of factorGroup">
            <span>{{ productFactor.name }}</span>: <span> {{ productFactor.result }}</span>
            <p>Relevant measures:</p>
            <div v-for="[key, measure] of productFactor.measures">
                <span>{{ measure.name }}</span>: <span> {{ measure.value }}</span>
            </div>
        </div>
        <ForwardImpactVisualization :rootFactors="(factorGroup as EvaluatedProductFactor[])"></ForwardImpactVisualization>
    </div>
</template>

<script lang="ts" setup>
import { EvaluatedProductFactor } from '@/core/qualitymodel/evaluation/EvaluatedSystemModel';
import ForwardImpactVisualization from './ForwardImpactVisualization.vue';
import { ComputedRef, computed, onMounted, onUpdated, ref, render } from 'vue';
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

        // ignore non-leaf factors TODO: do not rely on original quality model to not interfere with filtering?
        if (evaluatedProductFactor.productFactor.getImpactingFactors().length > 0) {
            continue factorsToCheck;
        }

        let impactedFactors = searchForImpactedFactors(evaluatedProductFactor);

        for (const relatedFactorsGroup of  relatedFactorGroups) {
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

    console.log(relatedFactorGroups);

    return relatedFactorGroups.map(relatedFactors => relatedFactors.factors);


}

function searchForImpactedFactors(evaluatedProductFactor: EvaluatedProductFactor): string[] {
    let impactedFactors = [];
    for (const impact of evaluatedProductFactor.impacts) {
        impactedFactors.push(impact.impactedFactorKey);
        if (impact.impactedFactor.factorType === "productFactor") {
            impactedFactors.push(...searchForImpactedFactors(impact.impactedFactor));
        }
    }
    return impactedFactors;
}

</script>

<style></style>