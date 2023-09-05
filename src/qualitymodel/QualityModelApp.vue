<template>
    <div class="qualitymodel-container" ref="qmContainer">

        <div id="qualityModel" ref="qmPaper">


        </div>


    </div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { ref, onMounted } from 'vue';
import { dia, shapes, util } from "jointjs";
import { QualityAspect } from './config/elementShapes';
import { qualityModel } from '@/core/qualitymodel/qualitymodel';

const qmContainer = ref(null);

const qualityAspects = Object.assign({}, ...Object.entries(qualityModel.qualityAspects).map(entry => entry[1].aspects));

const productFactors = qualityModel.productFactors;

const impacts = qualityModel.impacts;

onMounted(() => {

    console.log("mount?")

    const namespace = shapes;

    const graph = new dia.Graph({}, { cellNamespace: namespace });

    console.log(qmContainer);


    var paper = new dia.Paper({
        el: $('#qualityModel'),
        model: graph,
        width: 1000,
        height: 1500,
        gridSize: 10,
        drawGrid: true,
        background: {
            color: 'rgba(230, 230, 230, 0.3)'
        },
        cellViewNamespace: namespace
    });

    paper.render();

    let posX = 410;
    let posY = 40;
    for (const qualityAspect of Object.entries(qualityAspects)) {

        var qa = new QualityAspect({
            id: qualityAspect[0],
            position: { x: posX, y: posY },
            attrs: {
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    textWrap: {
                        text: qualityAspect[1]["name"],
                    }
                }
            }
        })

        qa.addTo(graph);

        posX = posX + 10;
        posY = posY + 10;
    }

    let pfPosX = 100;
    let pfPosY = 100

    for (const productFactor of Object.entries(productFactors)) {

        var rect = new shapes.standard.Rectangle({ id: productFactor[0] });
        rect.position(pfPosX, pfPosY);
        rect.resize(150, 60);
        rect.attr({
            body: {
                fill: 'white'
            },
            label: {
                text: util.breakText(productFactor[1]["name"], { width: 150 }),
                fill: 'black'
            }
        });
        rect.addTo(graph);

        pfPosX = pfPosX + 10;
        pfPosY = pfPosY + 10;
    }


    for (const impact of impacts) {

        let impactLabel = (() => {
            switch(impact.impactType) {
                case "positive":
                    return "+";
                case "negative":
                    return "-";
                default:
                    return "o";
            }
        })();

        var link = new shapes.standard.Link();
        link.source(graph.getCell(impact.sourceFactor));
        link.target(graph.getCell(impact.impactedFactor));
        link.appendLabel({
            attrs: {
                text: {
                    text: impactLabel,
                    fill: '#000000',
                    fontSize: 14,
                    textAnchor: 'middle',
                    yAlignment: 'middle',
                    pointerEvents: 'none'
                }
            }
        });

        link.addTo(graph);
    }



})


</script>


<style>
.qualitymodel-container {
    width: 100%;
    height: 100%;
}
</style>