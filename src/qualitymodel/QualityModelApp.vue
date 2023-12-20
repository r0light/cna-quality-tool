<template>
    <div class="qualitymodel-container" ref="qmContainer">
        <div class="qualityModelToolbar p-1">
            <div class="qualityModelTool">
                <span>Filter by High-level aspect:</span>
                <div v-for="[highLevelAspectKey, status] of Object.entries(highLevelAspectFilter)">
                    <input :id="`${highLevelAspectKey}-filter`" @input="onHighLevelFilterSelected()"
                        v-model="status.checked" class="filterCheckbox" type="checkbox" :value="highLevelAspectKey">
                    <span class="" :for="`${highLevelAspectKey}-filter`">
                        {{ status.name }}
                    </span>
                </div>
            </div>
        </div>
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
                            <span>Entities which are relevant for this factor: </span><br><span>{{ (selectedFactor as
                                ProductFactor).getRelevantEntities.map(entityKey => entities[entityKey].name).join(", ")
                            }}</span>
                        </div>
                        <div
                            v-if="selectedFactor.getFactorType === 'productFactor' && (selectedFactor as ProductFactor).getSources.length > 0">
                            <span>Read more:</span>
                            <ul>
                                <li v-for="source of (selectedFactor as ProductFactor).getSources">
                                    <span><a :href="source.getUrl"><span>{{ source.getKey }}</span></a>: {{ source.getInfo
                                    }}</span>
                                </li>
                            </ul>
                        </div>
                        <div
                            v-if="selectedFactor.getFactorType === 'productFactor' && (selectedFactor as ProductFactor).getMeasures.length > 0">
                            <span>Potential measures:</span>
                            <ul>
                                <li v-for="measure of (selectedFactor as ProductFactor).getMeasures">
                                    <span class="font-italics">{{ measure.getName }}</span>
                                    <span> (</span>
                                    <span v-for="source of measure.getSources">
                                        <a :href="source.getUrl"><span>{{ source.getKey }}, </span></a>
                                    </span>
                                    <span> )</span>
                                </li>
                            </ul>
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
import { dia, shapes, util, highlighters } from "jointjs";
import { QualityAspectElement, ProductFactorElement, ImpactElement, quamocoShapes } from './config/elementShapes';
import { getQualityModel } from '@/core/qualitymodel/QualityModelInstance';
import { ProductFactor } from '@/core/qualitymodel/ProductFactor';
import { QualityAspect } from '@/core/qualitymodel/QualityAspect';
import { entities } from '@/core/qualitymodel/entities';
import { orderQualityAspects, placeProductFactors, placeQualityAspects } from './placementAlgorithm';

let initialized = true;
let doRearrange = false;
const props = defineProps<{
    inView: Boolean,
}>()
const watchInView = computed(() => props.inView);

const qmContainer = ref<HTMLElement>(null);
const qmPaper = ref<HTMLElement>(null)

const namespace = quamocoShapes;
const graph = new dia.Graph({}, { cellNamespace: namespace });

const paperRef = ref<dia.Paper>(null);

const qualityModel = getQualityModel();

const highLevelAspectFilter: { [key: string]: { key: string, name: string, checked: boolean } } = (() => {
    let filter = {};
    for (const highLevelAspectKey of [...new Set(Object.entries(qualityModel.qualityAspects).map(qualityAspect => qualityAspect[1].getHighLevelAspectKey))]) {
        filter[highLevelAspectKey] = {
            key: highLevelAspectKey,
            name: qualityModel.highLevelAspects.find(aspect => aspect.getId === highLevelAspectKey).getName,
            checked: true
        }
    }
    return filter;
})();

function getActiveHighLevelAspects() {
    return Object.entries(highLevelAspectFilter).filter(aspect => aspect[1].checked).map(aspect => aspect[1].key);
}

const qualityAspectElements: dia.Element[] = [];
const productFactorElements: dia.Element[] = [];
const impactElements: dia.Link[] = [];

const selectedElement: Ref<dia.ElementView> = ref(null);
const selectedFactor: ComputedRef<ProductFactor | QualityAspect> = computed(() => {
    if (!selectedElement.value) {
        return null;
    }
    let factor = qualityModel.findQualityAspect(selectedElement.value.model.id.toString());
    if (factor) {
        return factor;
    } else {
        return qualityModel.findProductFactor(selectedElement.value.model.id.toString());
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

    drawQualityModelElements(getActiveHighLevelAspects(), "");


    paperRef.value.on({
        'element:pointerdown': function (cellView: dia.ElementView, evt, x, y) {
            selectedElement.value = cellView;
            //let currentPaper = this;
            this.model.getLinks().forEach(function (link) {
                highlighters.stroke.remove(link.findView(paperRef.value));
                link.toBack();
            });
            graph.getConnectedLinks(cellView.model).forEach(link => {
                highlighters.stroke.add(link.findView(paperRef.value as dia.Paper), { selector: 'line' }, 'my-element-highlight', {
                    layer: 'back',
                    attrs: {
                        'stroke': '#feb663',
                        'stroke-width': 5,
                    }
                });
                //link.toFront();
            });
        },
        'blank:pointerdown': function (evt, x, y) {
            selectedElement.value = null;
            this.model.getLinks().forEach(function (link) {
                highlighters.stroke.remove(link.findView(paperRef.value));
            });
        },

    });

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


function drawQualityModelElements(highLevelFilter: string[], productFactorFilter: string) {

    // clear existing elements
    graph.clear();
    qualityAspectElements.length = 0;
    productFactorElements.length = 0;
    impactElements.length = 0;

    let initialPositionX = -50;
    let initialPositionY = -50;
    for (const qualityAspect of qualityModel.qualityAspects) {

        // Filters

        // 1. ignore quality aspects for which no impacts are defined
        if (qualityAspect.getImpactingFactors().length === 0) {
            continue;
        }
        // 2. filter based on high level quality aspect
        if (!highLevelFilter.includes(qualityAspect.getHighLevelAspectKey)) {
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

        let existingImpactedQualityAspect = false;
        let factorsToCheck: (ProductFactor | QualityAspect)[] = [];
        factorsToCheck.push(...productFactor.getImpactedFactors());
        let i = 0;

        while (i < factorsToCheck.length) {
            let toCheck = factorsToCheck[i];

            if (toCheck.constructor.name === QualityAspect.name) {
                if (drawnQualityAspects.includes(toCheck.getId)) {
                    existingImpactedQualityAspect = true;
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

        var productFactorElement = new ProductFactorElement({
            id: productFactor.getId,
            position: { x: initialPositionX, y: initialPositionY },
            attrs: {
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    textWrap: {
                        text: util.breakText(productFactor.getName, { width: 120 }),
                    }
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

    //updateLinkRoutes();
}


function updateLinkRoutes() {
    for (const impactElement of impactElements) {
        (impactElement.findView(paperRef.value as dia.Paper) as dia.LinkView).requestConnectionUpdate();
        impactElement.toBack();
    }
}

function onHighLevelFilterSelected() {
    // use setTimeout as a workaround to wait for highLevelAspectFilter to be properly updated so that the filter is applied
    setTimeout(() => {
        drawQualityModelElements(getActiveHighLevelAspects(), "");
        arrangeQualityModelElements();
    }, 50);
}

</script>


<style>
.qualitymodel-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.qualityModelToolbar {
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: start;
    border-bottom: 5px solid var(--menu-background-colour);
}

.qualityModelTool {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    column-gap: 1em;
}

.qualityModelTool>div {
    display: flex;
    flex-direction: row;
    column-gap: 0.2em;
}

.qualityModelTool>div>span {
    display: flex;
    align-items: center;
}

.filterCheckbox {
    accent-color: #343a40;
}

.highLevel-select {
    width: 300px;
}

.qualityModelView {
    display: flex;
    flex-direction: row;
    overflow: scroll;
    justify-content: center;
}

.paperContainer {
    display: flex;
    overflow: scroll;
    border-left: 4px solid var(--menu-background-colour);
    border-bottom: 4px solid var(--menu-background-colour);
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
    overflow: scroll;
}

.factorDetails {
    display: flex;
    flex-direction: column;
    row-gap: 0.5em;
}
</style>