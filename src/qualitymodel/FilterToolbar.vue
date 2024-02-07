<template>
<div class="filterToolbar p-1">
            <div class="filterTool">
                <span>Quality aspect filter:</span>
                <div v-for="[highLevelAspectKey, status] of Object.entries(highLevelAspectFilter)">
                    <input :id="`${highLevelAspectKey}-filter`" @change="onFilterSelected()"
                        v-model="status.checked" class="filterCheckbox" type="checkbox" :value="highLevelAspectKey">
                    <span class="" :for="`${highLevelAspectKey}-filter`">
                        {{ status.name }}
                    </span>
                </div>
            </div>
            <div class="filterTool">
                <span>Product factor filter:</span>
                <div v-for="[categoryKey, status] of Object.entries(factorCategoryFilter)">
                    <input :id="`${categoryKey}-filter`" @change="onFilterSelected()"
                        v-model="status.checked" class="filterCheckbox" type="checkbox" :value="categoryKey">
                    <span class="" :for="`${categoryKey}-filter`">
                        {{ status.name }}
                    </span>
                </div>
            </div>
        </div>
</template>

<script lang="ts">
export type ItemFilter =  { [key: string]: { key: string, name: string, checked: boolean } };

export function getActiveFilterItems(filter: ItemFilter): string[] {
    return Object.entries(filter).filter(item => item[1].checked).map(item => item[1].key);
}

export function createHighLevelAspectFilter(qualityModel: QualityModelInstance) {
    let filter = {};
    for (const highLevelAspectKey of [...new Set(qualityModel.qualityAspects.map(qualityAspect => qualityAspect.getHighLevelAspectKey))]) {
        filter[highLevelAspectKey] = {
            key: highLevelAspectKey,
            name: qualityModel.highLevelAspects.find(aspect => aspect.getId === highLevelAspectKey).getName,
            checked: true
        }
    }
    return filter;
}

export function createFactorCategoryFilter(qualityModel: QualityModelInstance) {
    let filter = {};
    for (const category of qualityModel.factorCategories) {
        filter[category.categoryKey] = {
            key: category.categoryKey,
            name: category.categoryName,
            checked: true
        }
    }
    return filter;
}

export function getActiveElements(activeHighLevelAspects: string[], activeCategories: string[], qualityModel: QualityModelInstance): {activeQualityAspects: string[], activeProductFactors: string[]} {
    let activeQualityAspects = qualityModel.qualityAspects.filter(aspect => activeHighLevelAspects.includes(aspect.getHighLevelAspectKey)).map(aspect => aspect.getId);

    // use this to track which quality aspects are also impacted by active factors to later filter out quality aspects for which no impacting factors are active
    let qualityAspectsImpactedByActiveFactor = new Set<string>();

    let activeProductFactors = [];

    for (const productFactor of qualityModel.productFactors) {

        // ignore factors which are not assigned to any of the currently selected categories
        if (!isFactorCategoryInSelectedCategories(productFactor.getCategories, activeCategories)) {
            continue;
        }

        let existingImpactedQualityAspect = false;
        let factorsToCheck: (ProductFactor | QualityAspect)[] = [];
        factorsToCheck.push(...productFactor.getImpactedFactors());
        let i = 0;

        while (i < factorsToCheck.length) {
            let toCheck = factorsToCheck[i];

            if (toCheck.constructor.name === QualityAspect.name) {
                if (activeQualityAspects.includes(toCheck.getId)) {
                    existingImpactedQualityAspect = true;
                    qualityAspectsImpactedByActiveFactor.add(toCheck.getId);
                }
            } else {
                factorsToCheck.push(...(toCheck as ProductFactor).getImpactedFactors());
            }
            i = i + 1;
        }
        // ignore factors for which impacted factors are not drawn
        if (!existingImpactedQualityAspect) {
            continue;
        }

        activeProductFactors.push(productFactor.getId);
    }

    // filter out quality aspects for which no active product factors exist
    activeQualityAspects = activeQualityAspects.filter(aspect => qualityAspectsImpactedByActiveFactor.has(aspect));

    return {
        activeQualityAspects: activeQualityAspects,
        activeProductFactors: activeProductFactors
    }

}

function isFactorCategoryInSelectedCategories(factorCategories: string[], factorCategoryFilter: string[]) {
    return factorCategories.some(categoryKey => {
        return factorCategoryFilter.includes(categoryKey);
    })
}

</script>

<script lang="ts" setup>
import { QualityModelInstance } from '@/core/qualitymodel/QualityModelInstance';
import { ProductFactor } from '@/core/qualitymodel/quamoco/ProductFactor';
import { QualityAspect } from '@/core/qualitymodel/quamoco/QualityAspect';

const props = defineProps<{
    highLevelAspectFilter: ItemFilter,
    factorCategoryFilter: ItemFilter
}>()


const emit = defineEmits<{
    (e: "update:filters", highLevelAspectFilter: ItemFilter, factorCategoryFilter: ItemFilter): void;
}>()


function onFilterSelected() {
    emit("update:filters", props.highLevelAspectFilter, props.factorCategoryFilter);
}



</script>

<style>

.filterToolbar {
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: start;
    column-gap: 0.5em; 
    border-top: 2px solid var(--menu-background-colour);
    border-bottom: 2px solid var(--menu-background-colour);
}

.filterTool{
    display: flex;
    flex-direction: row;
    column-gap: 0.5em;
    flex-wrap: wrap;
    font-size: 0.9em;
}

.filterTool:not(:last-child) {
    padding-right: 5px;
    border-right: 2px solid var(--toolbar-line-colour);
}

.filterTool>div {
    display: flex;
    flex-direction: row;
    column-gap: 0.2em;
}

.filterTool>div>span {
    display: flex;
    align-items: center;
}


.filterCheckbox {
    accent-color: #343a40;
}


</style>