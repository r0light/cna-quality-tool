<template>
<div class="filterToolbar p-1">
            <div class="filterTool">
                <span>Quality aspect filter:</span>
                <div v-for="[highLevelAspectKey, status] of Object.entries(highLevelAspectFilter)">
                    <input :id="`${highLevelAspectKey}-filter`" @input="onFilterSelected()"
                        v-model="status.checked" class="filterCheckbox" type="checkbox" :value="highLevelAspectKey">
                    <span class="" :for="`${highLevelAspectKey}-filter`">
                        {{ status.name }}
                    </span>
                </div>
            </div>
            <div class="group-divider"></div>
            <div class="filterTool">
                <span>Product factor filter:</span>
                <div v-for="[categoryKey, status] of Object.entries(factorCategoryFilter)">
                    <input :id="`${categoryKey}-filter`" @input="onFilterSelected()"
                        v-model="status.checked" class="filterCheckbox" type="checkbox" :value="categoryKey">
                    <span class="" :for="`${categoryKey}-filter`">
                        {{ status.name }}
                    </span>
                </div>
            </div>
        </div>
</template>

<script lang="ts">
type ItemFilter =  { [key: string]: { key: string, name: string, checked: boolean } };

export function getActiveFilterItems(filter: ItemFilter) {
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

</script>

<script lang="ts" setup>
import { QualityModelInstance } from '@/core/qualitymodel/QualityModelInstance';

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
    border-bottom: 5px solid var(--menu-background-colour);
}

.filterTool{
    display: flex;
    flex-direction: row;
    column-gap: 0.5em;
    flex-wrap: wrap;
    font-size: 0.9em;
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

.group-divider {
    margin-left: 6px;
    margin-right: 4px;
    position: relative;
    height: 100%;
}

.group-divider:after {
    content: '';
    width: 2px;

    position: absolute;
    right: 0;
    top: 0;

    background-color: var(--toolbar-line-colour);
    height: 100%;
}


</style>