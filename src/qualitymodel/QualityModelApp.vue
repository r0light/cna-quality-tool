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
import { first } from 'lodash';

const props = defineProps<{
    inView: boolean,
}>()

const qmContainer = ref(null);
const qmPaper = ref(null)

const namespace = shapes;
const graph = new dia.Graph({}, { cellNamespace: namespace });

const paperRef = ref(null);

const qualityModel = getQualityModel();

const qualityAspectElements: dia.Element[] = [];
const productFactorElements: dia.Element[] = [];
const impactElements: dia.Link[] = [];

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

    orderQualityAspects();

    placeQualityAspects();

    placeProductFactors();

})

function orderQualityAspects() {

    const noOfQualityAspects = qualityModel.qualityAspects.length;

    // calculate pair-wise proximity
    let qualityAspectProximity: number[][] = Array.from({length: noOfQualityAspects}, e => Array(noOfQualityAspects).fill(0));
    let i = 0;
    for (const qualityAspectI of qualityModel.qualityAspects) {
        let j = 0;
        for (const qualityAspectJ of qualityModel.qualityAspects) {
            if (j < i) {
                j = j + 1;
                continue; // skip cells that have already been compared
            }
            if (i === j) {
                qualityAspectProximity[i][j] = 1;
                j = j + 1;
                continue;
            } 
            // else: calculate proximity
            let sameHighlevelAspect = qualityAspectI.getHighLevelAspectKey === qualityAspectJ.getHighLevelAspectKey;
            let sharedHighlevelAspect = sameHighlevelAspect ? 0.5 : 0;

            let impactingFactorsI = qualityAspectI.getImpactingFactors().map(factor => factor.getId);
            let impactingFactorsJ = qualityAspectJ.getImpactingFactors().map(factor => factor.getId);

            let allFactors = [...new Set([...impactingFactorsI, ...impactingFactorsJ])];
            let commonFactors = impactingFactorsI.filter(factor => impactingFactorsJ.includes(factor));

            let sharedFactors = allFactors.length === 0 ? 0 : commonFactors.length / allFactors.length;

            let proximity = (sharedHighlevelAspect * 0.4 + sharedFactors * 0.6);

            qualityAspectProximity[i][j] = proximity;
            qualityAspectProximity[j][i] = proximity;

            j = j + 1;
        }
        i = i + 1;
    }

    // determine order based on proximity
    let ordered = [];
    let toOrder = Array.from(Array(noOfQualityAspects).keys());
    while (toOrder.length > 0) {
        if (ordered.length === 0) {
            ordered.push(toOrder[0]);
            toOrder.splice(0, 1);
        } else {
            let last = ordered[ordered.length - 1];
            let highestProximity = Math.max(...qualityAspectProximity[last].filter((proximity, index) => index !== last && !ordered.includes(index)))
            let next = qualityAspectProximity[last].findIndex((proximity, index) => proximity === highestProximity && index !== last && !ordered.includes(index));
            ordered.push(next);
            toOrder.splice(toOrder.findIndex(value => value === next), 1);
        }
    }

    // order elements
    for (let k = 0; k < noOfQualityAspects; k = k + 1) {
        let expected = qualityModel.qualityAspects[ordered[k]].getId;
        let currentPosition = qualityAspectElements.findIndex(element => element.id === expected);
        if (currentPosition !== k) {
            // swap element positions
            qualityAspectElements[k] = qualityAspectElements.splice(currentPosition, 1, qualityAspectElements[k])[0];
        }
    }
}


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

    let centerX = qmPaper.value.clientWidth / 2;
    let centerY = qmPaper.value.clientHeight / 2;

    let toBePlaced = productFactorElements.map(element => element.id);

    let firstLayerFactors = qualityModel.qualityAspects.map(qualityAspect => qualityAspect.getImpactingFactors()).flat();

    //console.log(firstLayerFactors);

    // TODO iterate based on elements that are already drawn in the sense that in each round only elements are drawn for which all impacted factors are already drawn
    // TODO draw factors which impact only one other factor in a circle around the impacted factor

    for (const firstLayerFactor of firstLayerFactors) {
        //console.log(firstLayerFactor.getImpactedFactors());
        let impactedElements = firstLayerFactor.getImpactedFactors().map(qualityAspect => qualityAspectElements.find(element => element.id === qualityAspect.getId)).filter(element => element !== undefined);

        // middle point between impacted factors
        let averageX = impactedElements.map(element => element.position().x).reduce(function(a, b){ return a + b;}) / impactedElements.length;
        let averageY = impactedElements.map(element => element.position().y).reduce(function(a, b){ return a + b;}) / impactedElements.length;

        console.log("for " + firstLayerFactor.getId + ": averageX: " + averageX + ", averageY: " + averageY);

        // calculate parameters of line between middle point and center
        let slope = (averageY - centerY) / (averageX - centerX);
        let axisDistance = averageY - (slope * averageX);

        // calculate distance between middle point and center
        let distanceToCenter = Math.sqrt(Math.pow((centerX - averageX), 2) + Math.pow((centerY - averageY), 2));

        //console.log("for " + firstLayerFactor.getId + ": distanceToCenter: "  + distanceToCenter);

        let oneStep = 1 / 5

        let newX = (1 - oneStep)*averageX + oneStep*centerX;
        let newY = (1 - oneStep)*averageY + oneStep*centerY;


        //console.log("for " + firstLayerFactor.getId + ": newX: "  + newX + ", newY:" + newY);


        let currentFactorElement = productFactorElements.find(element => element.id === firstLayerFactor.getId);
        currentFactorElement.translate(newX - currentFactorElement.position().x, newY - currentFactorElement.position().y);

        // TODO ensure elements do not overlap (see https://stackoverflow.com/questions/57056432/how-can-i-prevent-elements-from-touching-colliding-in-jointjs)

    }

    // TODO continue for other elements


}

</script>


<style>
.qualitymodel-container {
    width: 100%;
    height: 100%;
}
</style>