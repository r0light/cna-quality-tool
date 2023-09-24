<template>
    <div class="qualitymodel-container" ref="qmContainer">
        <div class="qualityModelToolbar">
            <div class="qualityModelTool">
                <span>Filter by High-level aspect:</span>
                <div v-for="[highLevelAspectKey, status] of Object.entries(highLevelAspectFilter)">
                    <input :id="`${highLevelAspectKey}-filter`" @input="onHighLevelFilterSelected()"
                        v-model="status.checked" class="filterCheckbox" type="checkbox" :value="highLevelAspectKey">
                    <label class="" :for="`${highLevelAspectKey}-filter`">
                        {{ status.name }}
                    </label>
                </div>
            </div>
        </div>
        <div class="qualityModelView">
            <div class="paperContainer">
                <div id="qmPaper" ref="qmPaper"></div>
            </div>
            <div class="qualityModelDetails">
                <div v-if="!!selectedFactor">
                    <h2>{{ selectedFactor.getName }}</h2>
                    <p>{{ selectedFactor.getDescription }}</p>
                </div>
                <div v-if="!selectedFactor">No Factor selected</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { ref, onMounted, onUpdated, Ref, ComputedRef, computed } from 'vue';
import { dia, shapes, util, highlighters } from "jointjs";
import { QualityAspectElement, ProductFactorElement, ImpactElement } from './config/elementShapes';
import { getQualityModel } from '@/core/qualitymodel/QualityModelInstance';
import { ProductFactor } from '@/core/qualitymodel/ProductFactor';
import { QualityAspect } from '@/core/qualitymodel/QualityAspect';

const props = defineProps<{
    inView: boolean,
}>()

const qmContainer = ref(null);
const qmPaper = ref(null)

const namespace = shapes;
const graph = new dia.Graph({}, { cellNamespace: namespace });

const paperRef = ref(null);

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
                //link.toBack();
            });
            graph.getConnectedLinks(cellView.model).forEach(link => {
                highlighters.stroke.add(link.findView(paperRef.value), { selector: 'line' }, 'my-element-highlight', {
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

onUpdated(() => {

    if (!props.inView) {
        return;
    }

    arrangeQualityModelElements();

})

async function drawQualityModelElements(highLevelFilter: string[], productFactorFilter: string) {

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

        qualityAspectElement.addTo(graph);
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

            if (toCheck.constructor.name === "QualityAspect") {
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

        productFactorElement.addTo(graph);
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

    orderQualityAspects();

    placeQualityAspects();

    placeProductFactors();

    updateLinkRoutes();
}


function orderQualityAspects() {

    let drawnQualityAspects = qualityAspectElements.map(element => element.id);
    const relevantQualityAspects = qualityModel.qualityAspects.filter(qualityAspect => drawnQualityAspects.includes(qualityAspect.getId));
    const noOfQualityAspects = relevantQualityAspects.length;

    // calculate pair-wise proximity
    let qualityAspectProximity: number[][] = Array.from({ length: noOfQualityAspects }, e => Array(noOfQualityAspects).fill(0));
    let i = 0;
    for (const qualityAspectI of relevantQualityAspects) {
        let j = 0;
        for (const qualityAspectJ of relevantQualityAspects) {
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

            let proximity = (sharedHighlevelAspect * 0.3 + sharedFactors * 0.7);

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
        let expected = relevantQualityAspects[ordered[k]].getId;
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

    let qa = new QualityAspectElement();
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
                let horizontalSpaceForElements = paperSide.elements * paperSide.elementLength;
                let horizontalRemainingSpace = paperSide.sideLength - horizontalSpaceForElements;
                if (paperSide.elements <= 1) {
                    paperSide.spaceBetween = horizontalRemainingSpace;
                } else {
                    paperSide.spaceBetween = Math.floor(horizontalRemainingSpace / (paperSide.elements - 1));
                }
                break;
            case "right":
            case "left":
                let verticalSpaceForElements = (paperSide.elements + 2) * paperSide.elementLength;
                let verticalRemainingSpace = paperSide.sideLength - verticalSpaceForElements;
                paperSide.spaceBetween = Math.floor(verticalRemainingSpace / (paperSide.elements + 1));
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
                // at the end of phase 0, move furthest to the right to ensure also the edge case when only one element is placed top
                currentX = paperSideDistribution[phase].sideLength - paperSideDistribution[phase].elementLength + 10;
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

    let drawnQualityAspects = qualityAspectElements.map(element => element.id);
    let drawnProductFactors = productFactorElements.map(element => element.id);

    let toBePlaced = productFactorElements.map(element => element.id);
    let placed = qualityAspectElements.map(element => element.id);
    let allTries = [];
    const maximumTries = 1000;

    outerLoop: while (toBePlaced.length > 0) {

        let nextElementId = toBePlaced[0];
        let nextElement = productFactorElements.find(element => element.id === nextElementId);
        let horizontalCenter = nextElement.size().width / 2;
        let verticalCenter = nextElement.size().height / 2;

        let impactedFactors = qualityModel.findProductFactor(nextElement.id.toString()).getImpactedFactors();

        // check if all impacted factors are already placed
        innerLoop: for (const factor of impactedFactors) {
            if (!drawnQualityAspects.includes(factor.getId) && !drawnProductFactors.includes(factor.getId)) {
                // ignore factors which are not drawn;
                continue innerLoop;
            }
            if (!placed.includes(factor.getId)) {
                // if an impacted factor is not yet placed, put element and the end again
                toBePlaced.push(toBePlaced.splice(0, 1)[0]);
                // continue with next element
                continue outerLoop;
            }
        }

        let impactedElements = impactedFactors.map(impactedFactor => {
            if (impactedFactor.constructor.name === "QualityAspect") {
                return qualityAspectElements.find(element => element.id === impactedFactor.getId);
            } else {
                return productFactorElements.find(element => element.id === impactedFactor.getId);
            }
        }).filter(element => element !== undefined);

        // middle point between impacted factors
        let averageX = impactedElements.map(element => {
            return element.position().x + horizontalCenter // calculate center of element
        }).reduce(function (a, b) { return a + b; }) / impactedElements.length;
        let averageY = impactedElements.map(element => {
            return element.position().y + verticalCenter // calculate center of element
        }).reduce(function (a, b) { return a + b; }) / impactedElements.length;

        // calculate distance between middle point and center
        const distanceToCenter = Math.sqrt(Math.pow((centerX - averageX), 2) + Math.pow((centerY - averageY), 2));

        // placement algorithm parameters:
        const oneStep = 150;
        const centerDistanceRatio = oneStep / distanceToCenter;
        const angleMovement = 15;
        const radiusIncrease = Math.ceil(360 / angleMovement);

        let newX = ((1 - centerDistanceRatio) * averageX + centerDistanceRatio * centerX) - horizontalCenter;
        let newY = ((1 - centerDistanceRatio) * averageY + centerDistanceRatio * centerY) - verticalCenter;

        nextElement.translate(newX - nextElement.position().x, newY - nextElement.position().y);

        let elementOverlapping = graph.findModelsInArea(nextElement.getBBox()).filter(el => el !== nextElement).length > 0;
        let elementOutsidePaper =
            nextElement.position().x < 0
            || (nextElement.position().x + nextElement.size().width) > qmPaper.value.clientWidth
            || nextElement.position().y < 0
            || (nextElement.position().y + nextElement.size().height) > qmPaper.value.clientHeight;

        let tries = 1;
        while ((elementOverlapping || elementOutsidePaper) && tries < maximumTries) {

            let largerRatio = tries * centerDistanceRatio;

            if (impactedElements.length > 1 && largerRatio < 0) {
                // current element impacts multiple elements
                // (largerRatio < 0) is the edge case that an element is already quite in the middle of the paper and cannot move any further towards the center
                newX = ((1 - largerRatio) * averageX + largerRatio * centerX) - horizontalCenter;
                newY = ((1 - largerRatio) * averageY + largerRatio * centerY) - verticalCenter;
                nextElement.translate(newX - nextElement.position().x, newY - nextElement.position().y);
                /*nextElement.transition('position', {x: newX, y: newY}, {
                    delay: 0,
                    duration: 1000,
                    valueFunction: util.interpolate.object
                })*/
                tries = tries + 1;
            } else {
                // current element impacts only one element

                // calculate angle of initial position 
                let normalizedX = newX - averageX;
                let normalizedY = newY - averageY;
                let radius = oneStep * (Math.floor(tries / radiusIncrease) + 1);

                let angle = calcAngleDegrees(normalizedX, normalizedY);
                if (angle < 0) {
                    angle = angle + 360;
                }

                let newAngle = (() => {
                    // calculate new angle by increasing or decreasing angle by the same value, that means:
                    // +angleMovement, -angleMovement, +2*angleMovement, -2*angleMovement, +3*angleMovement, -3*angleMovement, ...
                    if (tries % 2 === 0) {
                        return angle - ((tries / 2) * angleMovement);
                    } else {
                        return angle + ((tries - ((tries - 1) / 2)) * angleMovement);
                    }
                })();

                let updatedX = ((radius * Math.cos(newAngle * (Math.PI / 180))) + averageX) - horizontalCenter;
                let updatedY = ((radius * Math.sin(newAngle * (Math.PI / 180))) + averageY) - verticalCenter;

                nextElement.translate(updatedX - nextElement.position().x, updatedY - nextElement.position().y);
                tries = tries + 1;
            }

            elementOverlapping = graph.findModelsInArea(nextElement.getBBox()).filter(el => el !== nextElement).length > 0;
            elementOutsidePaper =
                nextElement.position().x < 0
                || (nextElement.position().x + nextElement.size().width) > qmPaper.value.clientWidth
                || nextElement.position().y < 0
                || (nextElement.position().y + nextElement.size().height) > qmPaper.value.clientHeight;
        }

        placed.push(toBePlaced.splice(0, 1)[0]);
        allTries.push(tries);
    }

    /*
    const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
    console.log("average tries: " + average(allTries));
    console.log("unplaceable: " + allTries.filter(value => value === maximumTries).length);
    */
}

function calcAngleDegrees(x, y) {
    return (Math.atan2(y, x) * 180) / Math.PI;
}

function updateLinkRoutes() {
    for (const impactElement of impactElements) {
        (impactElement.findView(paperRef.value) as dia.LinkView).requestConnectionUpdate();
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
    padding: 5px;
    border-bottom: 5px solid var(--menu-background-colour);
}

.qualityModelTool {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
}

.qualityModelTool * {
    margin-left: 5px;
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
    padding: 5px;
}

.paperContainer {
    display: flex;
    overflow: scroll;
}

#qmPaper {
    min-width: 1600px;
    min-height: 1400px;
}

.qualityModelDetails {
    display: flex;
    flex-grow: 1;
    min-width: 300px;
    max-width: 600px;
    padding: 5px;
}
</style>