<template>
    <div class="qualitymodel-container" ref="qmContainer">

        <div id="qualityModel" ref="qmPaper">


        </div>


    </div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { ref, onMounted, onUpdated } from 'vue';
import { dia, shapes, util } from "jointjs";
import { QualityAspect, ProductFactor } from './config/elementShapes';
import { getQualityModel } from '@/core/qualitymodel/QualityModelInstance';

const props = defineProps<{
    inView: boolean,
}>()

const qmContainer = ref(null);
const qmPaper = ref(null)

const namespace = shapes;
const graph = new dia.Graph({}, { cellNamespace: namespace });

const paperRef = ref(null);

const qualityModel = getQualityModel();

const qualityAspectElements = [];
const productFactorElements = [];
const impactElements = [];

onMounted(() => {

    //console.log("inView: " + props.inView);
    //console.log(qmContainer.value.clientWidth);

    paperRef.value = new dia.Paper({
        el: $('#qualityModel'),
        model: graph,
        width: 1600,
        height: 1400,
        gridSize: 10,
        drawGrid: true,
        background: {
            color: 'rgba(230, 230, 230, 0.3)'
        },
        cellViewNamespace: namespace
    });

    paperRef.value.render();

    let posX = 410;
    let posY = 40;
    for (const qualityAspect of qualityModel.qualityAspects) {

        var qualityAspectElement = new QualityAspect({
            id: qualityAspect.getId,
            position: { x: posX, y: posY },
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

        qualityAspectElement.addTo(graph);
        qualityAspectElements.push(qualityAspectElement);

        posX = posX + 10;
        posY = posY + 10;
    }

    let pfPosX = 100;
    let pfPosY = 100

    for (const productFactor of qualityModel.productFactors) {

        var productFactorElement = new ProductFactor({
            id: productFactor.getId,
            position: { x: pfPosX, y: pfPosY },
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

        productFactorElement.addTo(graph);
        productFactorElements.push(productFactorElement);

        pfPosX = pfPosX + 10;
        pfPosY = pfPosY + 10;
    }


    for (const impact of qualityModel.impacts) {


        var link = new shapes.standard.Link();
        link.source(graph.getCell(impact.getSourceFactor.getId));
        link.target(graph.getCell(impact.getImpactedFactor.getId));
        link.appendLabel({
            attrs: {
                text: {
                    text: impact.getImpactType,
                    fill: '#000000',
                    fontSize: 14,
                    textAnchor: 'middle',
                    yAlignment: 'middle',
                    pointerEvents: 'none'
                }
            }
        });

        link.addTo(graph);
        impactElements.push(link);
    }



})


onUpdated(() => {

    console.log("inView: " + props.inView);
    //console.log(qmContainer);

    if (!props.inView) {
        return;
    }

    // TODO sort Quality Aspects by their relatedness (based on high level aspect and connected product factors)

    placeQualityAspects();

    //TODO place product factors

    placeProductFactors();
   
})


function placeQualityAspects() {

    let availableWidth = qmPaper.value.clientWidth - 20;
    let availableHeight = qmPaper.value.clientHeight - 20;

    let qa = new QualityAspect();
    let elementWidth = qa.prop("defaults/size/width");
    let elementHeight = qa.prop("defaults/size/height");

    let maxElementsOnWidth = Math.floor(availableWidth / (elementWidth + 10));
    let maxElementsOnHeight = Math.floor(availableHeight / (elementHeight + 10));

    // [top,right,bottom,left]; Decrease maximum for right and left because of corner elements
    let paperSideDistribution = [
        { side: "top", sideLength: availableWidth, elementLength: elementWidth, elements: 0, maximum: maxElementsOnWidth, maximumReached: false, spaceBetween: 0 },
        { side: "right", sideLength: availableHeight, elementLength: elementHeight, elements: 0, maximum: maxElementsOnHeight - 2, maximumReached: false, spaceBetween: 0 },
        { side: "bottom", sideLength: availableWidth, elementLength: elementWidth, elements: 0, maximum: maxElementsOnWidth, maximumReached: false, spaceBetween: 0 },
        { side: "left", sideLength: availableHeight, elementLength: elementHeight, elements: 0, maximum: maxElementsOnHeight - 2, maximumReached: false, spaceBetween: 0 }
    ];

    // distribute elements equally over the four sides
    let elementsToDistribute = qualityAspectElements.length;
    let currentSide = 0;
    while (elementsToDistribute > 0 && (paperSideDistribution.some(side => !side.maximumReached))) {
        let currentSideDistribution = paperSideDistribution[currentSide];
        if (currentSideDistribution.elements < currentSideDistribution.maximum) {
            currentSideDistribution.elements = currentSideDistribution.elements + 1;
            elementsToDistribute = elementsToDistribute - 1;
        } else {
            currentSideDistribution.maximumReached = true;
        }
        currentSide = currentSide === 3 ? 0 : currentSide + 1;
    }
    if (elementsToDistribute > 0) {
        throw Error("Not enough space for all quality aspects");
    }

    // calculate maximum space between elements based on number of elements per side
    for (const paperSide of paperSideDistribution) {
        switch (paperSide.side) {
            case "top":
            case "bottom":
                paperSide.spaceBetween = Math.floor((paperSide.sideLength - (paperSide.elements * paperSide.elementLength)) / (paperSide.elements - 1));
                break;
            case "right":
            case "left":
                paperSide.spaceBetween = Math.floor((paperSide.sideLength - ((paperSide.elements + 2) * paperSide.elementLength)) / (paperSide.elements + 1));
                break;
        }

    }

    // start positioning in the left top corner;
    let currentX = 10 
    let currentY = 10;
    let phase = 0; //phase should describe the phases when walking along the perimeter
    let sides = [0, 0, 0, 0];

    for (const qualityAspect of qualityAspectElements) {

        if (phase === 4) {
            throw new Error("There is no space left to place elements")
        }

        //(graph.getCell(qualityAspect.id) as dia.Element).position(currentX, currentY);
        qualityAspect.translate(currentX - qualityAspect.position().x, currentY - qualityAspect.position().y); //TODO animation?
        sides[phase] = sides[phase] + 1;

        if (phase === 0) {

            if (sides[phase] < paperSideDistribution[phase].elements) {
                currentX = currentX + paperSideDistribution[phase].elementLength + paperSideDistribution[phase].spaceBetween;
            } else {
                phase = phase + 1;
            }
        }
        if (phase === 1) {

            if (sides[phase] < paperSideDistribution[phase].elements) {
                currentY = currentY + paperSideDistribution[phase].elementLength + paperSideDistribution[phase].spaceBetween;
            } else {
                // at the end of the right side, go one step further down for the first element of the bottom row, and continue here so that we don't move to the left yet
                currentY = currentY + paperSideDistribution[phase].elementLength + paperSideDistribution[phase].spaceBetween;
                phase = phase + 1;
                continue;
            }
        }
        if (phase === 2) {
            if (sides[phase] < paperSideDistribution[phase].elements) {
                currentX = currentX - paperSideDistribution[phase].elementLength - paperSideDistribution[phase].spaceBetween;
            } else {
                phase = phase + 1;
            }
        }
        if (phase === 3) {
            if (sides[phase] < paperSideDistribution[phase].elements) {
                currentY = currentY - paperSideDistribution[phase].elementLength - paperSideDistribution[phase].spaceBetween;
            } else {
                phase = phase + 1;
            }
        }
    }

}

function placeProductFactors() {



}

</script>


<style>
.qualitymodel-container {
    width: 100%;
    height: 100%;
}
</style>