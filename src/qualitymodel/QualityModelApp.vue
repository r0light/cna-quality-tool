<template>
    <div class="qualitymodel-container" ref="qmContainer">
        <FilterToolbar :highLevelAspectFilter="highLevelAspectFilter" :factorCategoryFilter="factorCategoryFilter"
            @update:filters="saveFilterConfig(); redrawWithFilter()"></FilterToolbar>
        <div class="qualityModelView">
            <div class="paperContainer">
                <div id="qmPaper" ref="qmPaper"></div>
            </div>
            <div class="qualityModelDetails">
                <div class="detailsHeading">Factor Details</div>
                <div class="detailsBody p-2">
                    <div v-if="!!selectedFactor" class="factorDetails">
                        <h3>{{ selectedFactor.getName }}</h3>
                        <p class="font-italic">{{ selectedFactor.getDescription }}</p>
                        <div v-if="selectedFactor.getFactorType === 'productFactor'">
                            <span>Entities which are needed to evaluate this factor: </span><br><span>{{ (selectedFactor as
                                ProductFactor).getRelevantEntities.map(entityKey => entities[entityKey].name).join(", ")
                                }}</span>
                        </div>
                        <div v-if="selectedFactor.getFactorType === 'productFactor'">
                            <span>Entities based on which this factor can be evaluated: </span><br><span>{{ (selectedFactor as
                                ProductFactor).getApplicableEntities.map(entityKey => entities[entityKey].name).join(", ")
                                }}</span>
                        </div>
                        <div v-if="selectedFactor.getFactorType === 'productFactor'">
                            <span>Categories that this factor is assigned to: </span><br><span>{{ (selectedFactor as
                                ProductFactor).getCategories.map(categoryKey =>
                                    qualityModel.findFactorCategory(categoryKey).categoryName).join(", ")
                                }}</span>
                        </div>
                        <div
                            v-if="selectedFactor.getFactorType === 'productFactor' && (selectedFactor as ProductFactor).getSources.length > 0">
                            <span>Read more:</span>
                            <ul>
                                <li v-for="source of (selectedFactor as ProductFactor).getSources">
                                    <span><a :href="source.getUrl"><span>{{ source.getKey }}</span></a>: {{
                                        source.getInfo
                                        }}</span>
                                </li>
                            </ul>
                        </div>
                        <div
                            v-if="selectedFactor.getFactorType === 'productFactor' && (selectedFactor as ProductFactor).getAllMeasures().length > 0">
                            <div
                                v-if="(selectedFactor as ProductFactor).getAllMeasures().filter(measure => measure.isCalculationAvailable()).length > 0">
                                <span>Implemented measures:</span>
                                <ul class="listWithoutBullets">
                                    <li
                                        v-for="measure of (selectedFactor as ProductFactor).getAllMeasures().filter(measure => measure.isCalculationAvailable())">
                                        <details>
                                            <summary>
                                                <span class="font-italics">{{ measure.getName }}</span>
                                                <span> (</span>
                                                <span v-for="source of measure.getSources">
                                                    <a v-if="!!source.getUrl" :href="source.getUrl"><span>{{
                                                        source.getKey }},
                                                        </span></a>
                                                    <span v-else="!source.getUrl.length">{{ source.getKey }}</span>
                                                </span>
                                                <span> )</span>
                                            </summary>
                                            <span class="indented">Calculation: {{ measure.getCalculationDescription
                                                }}</span>
                                        </details>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <span>Potential measures:</span>
                                <ul>
                                    <li
                                        v-for="measure of (selectedFactor as ProductFactor).getAllMeasures().filter(measure => !measure.isCalculationAvailable())">
                                        <span class="font-italics">{{ measure.getName }}</span>
                                        <span> (</span>
                                        <span v-for="source of measure.getSources">
                                            <a v-if="!!source.getUrl" :href="source.getUrl"><span>{{ source.getKey }},
                                                </span></a>
                                            <span v-else="!source.getUrl.length">{{ source.getKey }}</span>
                                        </span>
                                        <span> )</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div v-if="!selectedFactor">Select a factor to see it's details here</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { ref, onMounted, onUpdated, watch, Ref, ComputedRef, computed } from 'vue';
import { dia, shapes, util, highlighters } from '@joint/core';
import { QualityAspectElement, ProductFactorElement, ImpactElement, quamocoShapes } from './config/elementShapes';
import { getQualityModel } from '@/core/qualitymodel/QualityModelInstance';
import { ProductFactor } from '@/core/qualitymodel/quamoco/ProductFactor';
import { QualityAspect } from '@/core/qualitymodel/quamoco/QualityAspect';
import { entities } from '@/core/qualitymodel/specifications/entities';
import { orderQualityAspects, placeProductFactors, placeQualityAspects } from './placementAlgorithm';
import FilterToolbar, { createFactorCategoryFilter, createHighLevelAspectFilter, getActiveElements, getActiveFilterItems, ItemFilter } from './FilterToolbar.vue';
import { useRouter } from 'vue-router';
import { ProductFactorKey, QualityAspectKey } from '@/core/qualitymodel/specifications/qualitymodel';

type QualityModelFilterConfig = {
    highLevelAspectFilter: ItemFilter,
    factorCategoryFilter: ItemFilter,
}

let initialized = true;
let doRearrange = false;
const props = defineProps<{
    active: boolean,
    path: string,
    filterConfig: QualityModelFilterConfig
}>()

const emit = defineEmits<{
    (e: "update:filterConfig", filterConfig: QualityModelFilterConfig): void;
}>()

const watchInView = computed(() => props.active);

const router = useRouter();

const qmContainer = ref<HTMLElement>(null);
const qmPaper = ref<HTMLElement>(null)

const namespace = quamocoShapes;
const graph = new dia.Graph({}, { cellNamespace: namespace });

const paperRef = ref<dia.Paper>(null);

const qualityModel = getQualityModel();

const highLevelAspectFilter = ref<ItemFilter>(createHighLevelAspectFilter(qualityModel));

const factorCategoryFilter= ref<ItemFilter>(createFactorCategoryFilter(qualityModel));

function saveFilterConfig() {
    emit("update:filterConfig", {
        highLevelAspectFilter: highLevelAspectFilter.value,
        factorCategoryFilter: factorCategoryFilter.value
    })
}

const qualityAspectElements: dia.Element[] = [];
const productFactorElements: dia.Element[] = [];
const impactElements: dia.Link[] = [];

const selectedElement: Ref<dia.ElementView> = ref(null);
const selectedFactor: ComputedRef<ProductFactor | QualityAspect> = computed(() => {
    if (!selectedElement.value) {
        return null;
    }
    let factor = qualityModel.findQualityAspect(selectedElement.value.model.id.toString() as QualityAspectKey);
    if (factor) {
        return factor;
    } else {
        return qualityModel.findProductFactor(selectedElement.value.model.id.toString() as ProductFactorKey);
    }
});

onMounted(() => {

    paperRef.value = new dia.Paper({
        el: $('#qmPaper'),
        model: graph,
        width: 1600,
        height: 1400,
        gridSize: 10,
        drawGrid: true,
        async: true,
        background: {
            color: 'rgba(230, 230, 230, 0.3)'
        },
        cellViewNamespace: namespace
    });

    paperRef.value.render();

    if (props.filterConfig) {
        if(props.filterConfig.highLevelAspectFilter) {
            highLevelAspectFilter.value = props.filterConfig.highLevelAspectFilter;
        }

        if(props.filterConfig.factorCategoryFilter) {
            factorCategoryFilter.value = props.filterConfig.factorCategoryFilter;
        }
    }

    drawQualityModelElements(getActiveFilterItems(highLevelAspectFilter.value), getActiveFilterItems(factorCategoryFilter.value));


    paperRef.value.on({
        'element:pointerdown': function (cellView: dia.ElementView, evt, x, y) {
            selectElement(cellView);
        },
        'blank:pointerdown': function (evt, x, y) {
            unselectElement();
        },

    });

    updateViewIfPossible();

    if (router.currentRoute.value.params["factorKey"]) {
        let factorKey = router.currentRoute.value.params["factorKey"];
        let factorElement = qualityAspectElements.find(element => element.id === factorKey);
        if (!factorElement) {
            factorElement = productFactorElements.find(element => element.id === factorKey);
        }
        if (factorElement) {
            selectElement(factorElement.findView(paperRef.value as dia.Paper) as dia.ElementView);
        } else {
            router.replace({ path: props.path })
        }
    }

});


watch(watchInView, (newValue, oldValue) => {
    // detect whether the page has just been entered for the first time and only then require a rearrangement of the quality model
    if (initialized && oldValue === false && newValue === true) {
        doRearrange = true;
        initialized = false;
    }
});
onUpdated(() => {
    // make sure arrangeQualityModelElements is only called when the page is freshly viewed, otherwise this function here will be called everytime something in the component data changes.
    if (doRearrange) {
        updateViewIfPossible();
    }
})

function updateViewIfPossible() {
    // to avoid errors, wait for the view to be visible and only then rearrange the factors
    if ($('#qmPaper').is(':visible')) {
        arrangeQualityModelElements();
        doRearrange = false;
    } else {
        setTimeout(updateViewIfPossible, 50);
    }
}

function drawQualityModelElements(highLevelFilter: string[], factorCategoryFilter: string[]) {

    // clear existing elements
    graph.clear();
    qualityAspectElements.length = 0;
    productFactorElements.length = 0;
    impactElements.length = 0;

    let activeElements = getActiveElements(highLevelFilter, factorCategoryFilter, qualityModel);

    let initialPositionX = -50;
    let initialPositionY = -50;
    for (const qualityAspect of qualityModel.qualityAspects) {


        // filter
        if (!activeElements.activeQualityAspects.includes(qualityAspect.getId)) {
            continue;
        }

        // draw quality aspect
        var qualityAspectElement = new QualityAspectElement({
            id: qualityAspect.getId,
            position: { x: initialPositionX, y: initialPositionY },
            attrs: {
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    textWrap: {
                        text: util.breakText(qualityAspect.getName, { width: 150 }),
                    }
                }
            }
        })

        qualityAspectElement.addTo(graph, { async: false });
        qualityAspectElements.push(qualityAspectElement);
    }

    let drawnQualityAspects = qualityAspectElements.map(element => element.id);
    for (const productFactor of qualityModel.productFactors) {

        // filter
        if (!activeElements.activeProductFactors.includes(productFactor.getId)) {
            continue;
        }

        var productFactorElement = new ProductFactorElement({
            id: productFactor.getId,
            position: { x: initialPositionX, y: initialPositionY },
            attrs: {
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    text: util.breakText(productFactor.getName, { width: 110, height: 50 }, { 'font-size': 12 }, { ellipsis: "..." }),
                }
            }
        })

        productFactorElement.addTo(graph, { async: false });
        productFactorElements.push(productFactorElement);
    }

    let drawnProductFactors = productFactorElements.map(element => element.id);
    for (const impact of qualityModel.impacts) {

        // ignore impacts for which not both connected elements are drawn
        if ((!drawnQualityAspects.includes(impact.getImpactedFactor.getId) && !drawnProductFactors.includes(impact.getImpactedFactor.getId)) || !drawnProductFactors.includes(impact.getSourceFactor.getId)) {
            continue;
        }

        var link = new ImpactElement();
        link.source(graph.getCell(impact.getSourceFactor.getId), {
            anchor: {
                name: 'modelCenter'
            },
            connectionPoint: {
                name: 'boundary',
                args: {
                    sticky: false
                }
            }
        });
        link.target(graph.getCell(impact.getImpactedFactor.getId), {
            anchor: {
                name: 'modelCenter'
            },
            connectionPoint: {
                name: 'boundary',
                args: {
                    sticky: false
                }
            }
        });
        link.appendLabel({
            attrs: {
                text: {
                    text: impact.getImpactType,
                }
            }
        });
        link.connector({ "name": 'rounded' });

        link.router({
            name: "normal",
        });
        /*
        link.router({
            name: "metro",
            args: {
                maximumLoops: 2000,
                padding: {
                    horizontal: 75,
                    vertical: 20
                },
                startDirection: ['left', 'right', 'top', 'bottom'],
                endDirection: ['left', 'right', 'top', 'bottom']
                //isPointObstacle: (point: dia.Point) => { return graph.findModelsFromPoint(point).length > 0}
            }
        });
        */

        link.addTo(graph);
        link.toBack();
        impactElements.push(link);
    }

}

function arrangeQualityModelElements() {

    orderQualityAspects(qualityAspectElements, qualityModel);

    placeQualityAspects(qmPaper.value, qualityAspectElements);

    placeProductFactors(qmPaper.value, graph, qualityAspectElements, productFactorElements, qualityModel);

    setTimeout(updateLinkRoutes, 50);
}


function updateLinkRoutes() {
    for (const impactElement of impactElements) {
        //(impactElement.findView(paperRef.value as dia.Paper) as dia.LinkView).requestConnectionUpdate();
        impactElement.toBack();
    }
}

function redrawWithFilter() {
    drawQualityModelElements(getActiveFilterItems(highLevelAspectFilter.value), getActiveFilterItems(factorCategoryFilter.value));
    arrangeQualityModelElements();
}

function selectElement(element: dia.ElementView) {
    selectedElement.value = element;
    //router.replace({ path: `${props.path}/${element.model.id}` });

    history.pushState(
        {},
        null,
        `${props.path}/${element.model.id}`
    )


    //let currentPaper = this;
    graph.getLinks().forEach(function (link) {
        highlighters.stroke.remove(link.findView(paperRef.value as dia.Paper));
        link.toBack();
    });
    graph.getConnectedLinks(element.model).forEach(link => {
        highlighters.stroke.add(link.findView(paperRef.value as dia.Paper), { selector: 'line' }, 'my-element-highlight', {
            layer: 'back',
            attrs: {
                'stroke': '#feb663',
                'stroke-width': 5,
            }
        });
        //link.toFront();
    });
}


function unselectElement() {
    selectedElement.value = null;
    router.replace({ path: props.path });
    graph.getLinks().forEach(function (link) {
        highlighters.stroke.remove(link.findView(paperRef.value as dia.Paper));
    });
}


</script>


<style>
.qualitymodel-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.qualityModelView {
    display: flex;
    flex-direction: row;
    overflow: auto;
    justify-content: center;
}

@media (max-width: 576px) {
    .qualityModelView {
        display: flex;
        flex-direction: column;
        overflow: auto;
        justify-content: center;
    }
}


.paperContainer {
    display: flex;
    overflow: auto;
    border-left: 4px solid var(--menu-background-colour);
    border-bottom: 4px solid var(--menu-background-colour);
    min-height: 90%;
}

#qmPaper {
    min-width: 1600px;
    width: calc(100vw) !important;
    max-width: 1800px;
    min-height: 1200px;
    height: calc(100vh - 93px) !important;
    max-height: 1400px;
}

.qualityModelDetails {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-width: 300px;
    max-width: 600px;
    border: 4px solid var(--menu-background-colour);
}

.detailsHeading {
    display: flex;
    color: #ffffff;
    text-align: center;
    justify-content: center;
    padding-bottom: 0.2em;
    background-color: var(--menu-background-colour);
}

.detailsBody {
    overflow: auto;
}

.factorDetails {
    display: flex;
    flex-direction: column;
    row-gap: 0.5em;
}

.listWithoutBullets {
    list-style-type: none;
    padding-left: 26px;
}

.indented {
    padding-left: 13px;
}
</style>