<template>
    <span>{{ currentFactor.name }} has a {{ impactPath.weight }} impact on {{
        impactPath.impactedFactorName }}</span>
    <div v-if="impactPath.impactedFactor && impactPath.impactedFactor.factorType === 'productFactor'">
        <div v-for="nextImpactPath of impactPath.impactedFactor.impacts">
            <ImpactRelation :currentFactor="impactPath.impactedFactor" :impactPath="nextImpactPath"></ImpactRelation>
        </div>
    </div>
</template>


<script lang="ts" setup>
import { EvaluatedProductFactor, ForwardImpactingPath } from '@/core/qualitymodel/evaluation/EvaluatedSystemModel';


const props = defineProps<{
    currentFactor: EvaluatedProductFactor,
    impactPath: ForwardImpactingPath
}>()


</script>