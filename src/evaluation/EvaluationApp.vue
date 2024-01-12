<template>
    <div>
        <div class="d-flex flex-column p-1">
            <h2>Evaluation</h2>
            <div class="d-flex flex-row">
                <div class="m-1">
                    <span>Select the evaluation viewpoint: </span>
                    <select @change="onSelectViewpoint" v-model="selectedViewpoint">
                        <option value="perQualityAspect">per Quality Aspect</option>
                        <option value="perProductFactor">per Product Factor</option>
                    </select>
                </div>
                <div class="m-1">
                    <span>Select the modeled system to evaluate: </span>
                    <select @change="onSelectSystem" v-model="selectedSystemId">
                        <option value=-1>Select a system...</option>
                        <option v-for="system of systemsData" :value="system.id">{{ system.name }}</option>
                    </select>
                </div>
            </div>
            <div v-if="selectedSystemId > -1">
                <p>In development...</p>
                <div v-if="selectedViewpoint === 'perProductFactor'">
                    <div v-for="[productFactorKey, productFactor] of evaluatedProductFactors.entries()">
                        <span>{{ productFactor.name }}</span>: <span> {{ productFactor.result }}</span>
                        <div v-for="impact of productFactor.impacts">
                            <!-- TODO recursively show impacts using an explicit component-->
                            <span>{{ productFactor.name }} has a {{ impact.impactType }} impact on {{
                                impact.impactedFactorName }}</span>
                        </div>
                        <p>Relevant measures:</p>
                        <div v-for="measure of productFactor.measures">
                            <span>{{ measure.name }}</span>: <span> {{ measure.value }}</span>
                        </div>
                    </div>

                </div>
                <div v-for="calculatedMeasure of calculatedMeasures">
                    <span>{{ calculatedMeasure.name }}</span>: <span> {{ calculatedMeasure.value }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onUpdated, ref, toRaw } from 'vue';
import { ModelingData } from '../App.vue';
import { QualityModelInstance, getQualityModel } from '@/core/qualitymodel/QualityModelInstance';
import { ProductFactorEvaluationResult } from '@/core/qualitymodel/quamoco/ProductFactorEvaluation';
import { Impact } from '@/core/qualitymodel/quamoco/Impact';
import { QualityAspectEvaluationResult } from '@/core/qualitymodel/quamoco/QualityAspectEvaluation';
import { ProductFactor } from '@/core/qualitymodel/quamoco/ProductFactor';
import { QualityAspect } from '@/core/qualitymodel/quamoco/QualityAspect';


type CalculatedMeasure = {
    name: string,
    value: number | string | "n/a";
}

type EvaluatedProductFactor = {
    id: string,
    name: string,
    productFactor: ProductFactor,
    result: ProductFactorEvaluationResult,
    measures: CalculatedMeasure[],
    impacts: ForwardImpactingPath[]
}

type EvaluatedQualityAspect = {
    id: string,
    name: string,
    qualityAspect: QualityAspect,
    result: QualityAspectEvaluationResult,
    impacts: BackwardImpactingPath[]
}

type ForwardImpactingPath = {
    impactedFactorKey: string,
    impactedFactorName: string,
    impactType: string,
    weight: string,
    impactedFactor?: EvaluatedProductFactor | EvaluatedQualityAspect
}

type BackwardImpactingPath = {
    impactingFactorKey: string,
    impactingFactorName: string,
    impactType: string,
    weight: string,
    impactingFactor: EvaluatedProductFactor
}

const props = defineProps<{
    systemsData: ModelingData[],
    active: boolean
}>()

const qualityModel: QualityModelInstance = getQualityModel();

const selectedSystemId = ref<number>(-1);

const selectedViewpoint = ref<"perQualityAspect" | "perProductFactor">("perProductFactor");

const calculatedMeasures = ref<CalculatedMeasure[]>([]);

const evaluatedProductFactors = ref<Map<string, EvaluatedProductFactor>>(new Map());

const notImplementedProductFactors = ref<Map<string, ProductFactor>>(new Map());

var refresh = true;

onUpdated(() => {
    if (props.active) {
        if (refresh) {
            refresh = false;
            onSelectSystem();
        }
    } else {
        refresh = true;
    }
})

function onSelectViewpoint() {
    // TODO reorder display of evaluation
}

function onSelectSystem() {

    calculatedMeasures.value.length = 0;
    evaluatedProductFactors.value.clear();

    if (selectedSystemId.value == -1) {
        return
    }

    console.time('measure calculation');

    let selectedSystem = props.systemsData.find(system => system.id === selectedSystemId.value);
    let systemEntityManager = toRaw(selectedSystem.entityManager);
    let currentSystemEntity = systemEntityManager.getSystemEntity();

    /*
    for (const measure of qualityModel.measures) {

        if (measure.isCalculationAvailable()) {
            calculatedMeasures.value.push({
                name: measure.getName,
                value: measure.calculate(systemEntityManager.getSystemEntity())
            });
        } else {
            // console.log(`Could not calculate metric ${measure.getName}`);
        }
    }
    */

    let factorsToEvaluate = qualityModel.productFactors.slice(0);

    factorLoop: while (factorsToEvaluate.length > 0) {
        let currentFactor = factorsToEvaluate[0];

        // if the current factor has impacting factors and any of these has not been evaluated yet, skip the current factor and try again later
        for (const impactingFactor of currentFactor.getImpactingFactors()) {
            if (!evaluatedProductFactors.value.has(impactingFactor.getId) && !notImplementedProductFactors.value.has(impactingFactor.getId)) {
                factorsToEvaluate.push(factorsToEvaluate.splice(0, 1)[0]);
                continue factorLoop;
            }
        }

        // TODO: temporarily ignore factors for which no evaluation is available
        if (!currentFactor.isEvaluationAvailable()) {
            notImplementedProductFactors.value.set(currentFactor.getId, currentFactor);
            factorsToEvaluate.splice(0, 1);
            continue factorLoop;
        }

        let evaluatedProductFactor = {
            id: currentFactor.getId,
            name: currentFactor.getName,
            productFactor: currentFactor,
            result: currentFactor.evaluate(currentSystemEntity),
            measures: currentFactor.getMeasures.filter(measure => measure.isCalculationAvailable())
                .map(measure => {
                    return {
                        name: measure.getName,
                        value: measure.calculate(currentSystemEntity)
                    }
                }),
            impacts: []
        }

        for (const impact of currentFactor.getOutgoingImpacts) {
            evaluatedProductFactor.impacts.push({
                impactedFactorKey: impact.getImpactedFactor.getId,
                impactedFactorName: impact.getImpactedFactor.getName,
                impactType: impact.getImpactType,
                weight: "slightly" //TODO properly implement a weight assignment here
            })
        }

        // TODO if factor has incoming impacts, set them properly now in the evaluatedProductFactors

        evaluatedProductFactors.value.set(currentFactor.getId, evaluatedProductFactor);
        factorsToEvaluate.splice(0, 1);
    }


    console.timeEnd('measure calculation');

}

</script>
