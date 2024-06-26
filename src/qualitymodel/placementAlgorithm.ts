import { QualityModelInstance } from "../core/qualitymodel/QualityModelInstance";
import { dia } from '@joint/core';
import { QualityAspectElement } from "./config/elementShapes";
import { QualityAspect } from "../core/qualitymodel/quamoco/QualityAspect";


export function orderQualityAspects(qualityAspectElements: dia.Element[], qualityModel: QualityModelInstance) {

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


export function placeQualityAspects(qmPaper: HTMLElement, qualityAspectElements: dia.Element[]) {

    let availableWidth = qmPaper.clientWidth - 20;
    let availableHeight = qmPaper.clientHeight - 20;

    let qa = new QualityAspectElement();
    let elementWidth = qa.prop("defaults/size/width");
    let elementHeight = qa.prop("defaults/size/height");

    let maxElementsOnWidth = Math.floor(availableWidth / (elementWidth + 10));
    let maxElementsOnHeight = Math.floor(availableHeight / (elementHeight + 10));

    // [top,right,bottom,left]; Decrease maximum for right and left because of corner elements
    let paperSideDistribution = [
        { side: "top", sideX: 10, sideY: 10, sideLength: availableWidth, elementLength: elementWidth, elements: 0, maximum: maxElementsOnWidth, maximumReached: false, spaceBetween: 0 },
        { side: "right", sideX: 10 + availableWidth - elementWidth, sideY: 10 + elementHeight, sideLength: availableHeight, elementLength: elementHeight, elements: 0, maximum: maxElementsOnHeight - 2, maximumReached: false, spaceBetween: 0 },
        { side: "bottom", sideX: 10 + availableWidth - elementWidth, sideY: 10 + availableHeight - elementHeight, sideLength: availableWidth, elementLength: elementWidth, elements: 0, maximum: maxElementsOnWidth, maximumReached: false, spaceBetween: 0 },
        { side: "left", sideX: 10, sideY: 10 + availableHeight - elementHeight, sideLength: availableHeight, elementLength: elementHeight, elements: 0, maximum: maxElementsOnHeight - 2, maximumReached: false, spaceBetween: 0 }
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
                let horizontalSpaces = paperSide.elements + 1;
                paperSide.spaceBetween = Math.floor(horizontalRemainingSpace / horizontalSpaces);
                break;
            case "right":
            case "left":
                let verticalSpaceForElements = (paperSide.elements + 2) * paperSide.elementLength;
                let verticalRemainingSpace = paperSide.sideLength - verticalSpaceForElements;
                let verticalSpaces = paperSide.elements + 1;
                paperSide.spaceBetween = Math.floor(verticalRemainingSpace / verticalSpaces);
                break;
        }

    }

    // initialize
    let elementIndex = 0;
    let sides = [0, 0, 0, 0];

    // iterate through phases
    for (let phase = 0; phase < 4; phase++) {

        let current = paperSideDistribution[phase];
        let currentX = current.sideX;
        let currentY = current.sideY;

        let calculateNextPosition = (x, y) => { return { x: x, y: y } };
        switch (current.side) {
            case "top":
                currentX = current.sideX + current.spaceBetween;
                calculateNextPosition = (currentX, currentY) => {
                    return {
                        x: currentX + current.spaceBetween + current.elementLength,
                        y: currentY
                    }
                }
                break;
            case "right":
                currentY = current.sideY + current.spaceBetween;
                calculateNextPosition = (currentX, currentY) => {
                    return {
                        x: currentX,
                        y: currentY + current.spaceBetween + current.elementLength,
                    }
                }
                break;
            case "bottom":
                currentX = currentX - current.spaceBetween;
                calculateNextPosition = (currentX, currentY) => {
                    return {
                        x: currentX - current.spaceBetween - current.elementLength,
                        y: currentY
                    }
                }
                break;
            case "left":
                currentY = current.sideY - current.spaceBetween;
                calculateNextPosition = (currentX, currentY) => {
                    return {
                        x: currentX,
                        y: currentY - current.spaceBetween - current.elementLength,
                    }
                }
                break;
        }

        while (sides[phase] < current.elements) {
            let nextQualityAspect = qualityAspectElements[elementIndex];
            nextQualityAspect.translate(currentX - nextQualityAspect.position().x, currentY - nextQualityAspect.position().y); //TODO animation?
            sides[phase] = sides[phase] + 1;
            elementIndex = elementIndex + 1;

            let nextPosition = calculateNextPosition(currentX, currentY);
            currentX = nextPosition.x;
            currentY = nextPosition.y;
        }
    }

}

export function placeProductFactors(qmPaper: HTMLElement, graph: dia.Graph, qualityAspectElements: dia.Element[], productFactorElements: dia.Element[], qualityModel: QualityModelInstance) {

    let centerX = qmPaper.clientWidth / 2;
    let centerY = qmPaper.clientHeight / 2;

    let drawnQualityAspects = qualityAspectElements.map(element => element.id.toString());
    let drawnProductFactors = productFactorElements.map(element => element.id.toString());

    let toBePlaced = productFactorElements.map(element => element.id.toString());
    let placed = qualityAspectElements.map(element => element.id.toString());
    let allTries = [];
    const maximumTries = 1000;

    outerLoop: while (toBePlaced.length > 0) {

        let nextElementId = toBePlaced[0];
        let nextElement = productFactorElements.find(element => element.id === nextElementId);
        let horizontalCenter = nextElement.size().width / 2;
        let verticalCenter = nextElement.size().height / 2;

        let impactedFactors = qualityModel.findProductFactor(nextElement.id.toString())
            .getImpactedFactors()
            .filter(factor => {
                // only consider factors which are actually drawn
                for (const factorToBePlaced of drawnProductFactors) {
                    if (factor.getId === factorToBePlaced) {
                        return true;
                    }
                }
                for (const drawnAspect of drawnQualityAspects) {
                    if (factor.getId === drawnAspect) {
                        return true;
                    }
                }
                return false;
            });

        if (impactedFactors.length === 0) {
            throw new Error(`No impacted factors found for: ${nextElementId}`);
        }

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
            if (impactedFactor.constructor.name === QualityAspect.name) {
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
        const oneStep = 120;
        const centerDistanceRatio = oneStep / distanceToCenter;
        const angleMovement = 15;
        const radiusIncrease = Math.ceil(360 / angleMovement);

        let newX = ((1 - centerDistanceRatio) * averageX + centerDistanceRatio * centerX) - horizontalCenter;
        let newY = ((1 - centerDistanceRatio) * averageY + centerDistanceRatio * centerY) - verticalCenter;

        nextElement.translate(newX - nextElement.position().x, newY - nextElement.position().y);

        let elementOverlapping = graph.findModelsInArea(nextElement.getBBox().moveAndExpand({ x: -10, y: -10, width: 20, height: 20 })).filter(el => el !== nextElement).length > 0;
        let elementOutsidePaper =
            nextElement.position().x < 0
            || (nextElement.position().x + nextElement.size().width) > qmPaper.clientWidth
            || nextElement.position().y < 0
            || (nextElement.position().y + nextElement.size().height) > qmPaper.clientHeight;

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

            elementOverlapping = graph.findModelsInArea(nextElement.getBBox().moveAndExpand({ x: -10, y: -10, width: 20, height: 20 })).filter(el => el !== nextElement).length > 0;
            elementOutsidePaper =
                nextElement.position().x < 0
                || (nextElement.position().x + nextElement.size().width) > qmPaper.clientWidth
                || nextElement.position().y < 0
                || (nextElement.position().y + nextElement.size().height) > qmPaper.clientHeight;
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