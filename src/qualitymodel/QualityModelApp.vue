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
import { QualityAspect } from './config/elementShapes';
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

    console.log("inView: " + props.inView);
    console.log(qmContainer.value.clientWidth);

    paperRef.value = new dia.Paper({
        el: $('#qualityModel'),
        model: graph,
        width: 1800,
        height: 1300,
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

        var qa = new QualityAspect({
            id: qualityAspect.getId,
            position: { x: posX, y: posY },
            attrs: {
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    textWrap: {
                        text: qualityAspect.getName
                    }
                }
            }
        })

        qa.addTo(graph);
        qualityAspectElements.push(qa);

        posX = posX + 10;
        posY = posY + 10;
    }

    let pfPosX = 100;
    let pfPosY = 100

    for (const productFactor of qualityModel.productFactors) {

        var rect = new shapes.standard.Rectangle({ id: productFactor.getId });
        rect.position(pfPosX, pfPosY);
        rect.resize(150, 60);
        rect.attr({
            body: {
                fill: 'white'
            },
            label: {
                text: util.breakText(productFactor.getName, { width: 150 }),
                fill: 'black'
            }
        });
        rect.addTo(graph);
        productFactorElements.push(rect);

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

/*
onUpdated(() => {

    console.log("on update")
    paperRef.value.render();
});
*/


onUpdated(() => {

    console.log("inView: " + props.inView);
    //console.log(qmContainer);
    console.log(qmPaper.value.clientWidth);

    //TODO include some padding?
    let paperPerimeter = qmPaper.value.clientWidth * 2 + qmPaper.value.clientHeight * 2;

    let qa = new QualityAspect();
    let elementWidth = 150; // TODO read from shape
    let elementHeight = 40; // TODO read from shape
    let spaceBetween = (paperPerimeter - (qualityAspectElements.length * elementWidth)) / (qualityAspectElements.length - 1);

    let currentX = qmPaper.value.clientWidth / 2;
    let currentY = 10;
    let phase = 0; //phase should describe the phases when walking along the perimeter


    for (const qualityAspect of qualityAspectElements) {

        console.log("phase: " + phase);
        console.log("currentX: " + currentX);
        console.log("currentY: " + currentY);

        //(graph.getCell(qualityAspect.id) as dia.Element).position(currentX, currentY);
        qualityAspect.position(currentX, currentY);

        if (phase === 0) {
            if (qmPaper.value.clientWidth - currentX - (elementWidth / 2) - spaceBetween - elementWidth > 0) {
                // there is space to the right
                currentX = currentX + spaceBetween + (elementWidth / 2);
            } else {
                phase = phase + 1;
            }
        }
        if (phase === 1) {
            if (qmPaper.value.clientHeight - currentY - (elementHeight / 2) - spaceBetween - elementWidth > 0) {
               // there is space down
               currentY = currentY + spaceBetween;
            } else {
                phase = phase + 1;
            }
        }
        if (phase === 2) {
            if (currentX - spaceBetween - elementWidth > 0) {
                // there is space to the left
                currentX = currentX - spaceBetween - (elementWidth / 2);
            } else {
                phase = phase + 1;
            }
        }
        if (phase === 3) {
            if (currentY - spaceBetween - elementWidth > 0) {
                // there is space to the top
                currentY = currentY - spaceBetween;
            } else {
                phase = phase + 1
            }
        }
        if (phase === 4) {
            if (qmPaper.value.clientWidth - currentX - (elementWidth / 2) - spaceBetween - elementWidth > (qmPaper.value.clientWidth / 2)) {
                // there is space to the right
                currentX = currentX + spaceBetween + (elementWidth / 2);
            } else {
                phase = phase + 1;
            }
        }
        if (phase === 5) {
            throw new Error("There is no space left to place elements")
        }


        
    }
})

</script>


<style>
.qualitymodel-container {
    width: 100%;
    height: 100%;
}
</style>