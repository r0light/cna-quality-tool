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

const qmContainer = ref(null);

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

    console.log(paper);

    var rect = new shapes.standard.Rectangle();
    rect.position(100, 100);
    rect.resize(150, 60);
    rect.attr({
        body: {
            fill: 'white'
        },
        label: {
            text: util.breakText('Automated infrastructure provisioning', { width: 150 }),
            fill: 'black'
        }
    });
    rect.addTo(graph);


    var qa = new QualityAspect({
        position: { x: 400, y: 30 },
        attrs: {
            root: {
                title: "cna.quamoco.QualityAspect"
            },
            body: {
                class: "entityHighlighting"
            },
            label: {
                textWrap: {
                    text: "Installability",
                }
            }
        }
    })

    qa.addTo(graph);

    var link = new shapes.standard.Link();
    link.source(rect);
    link.target(qa);
    link.appendLabel({
        attrs: {
            text: {
                text: "+",
                fill: '#000000',
                fontSize: 14,
                textAnchor: 'middle',
                yAlignment: 'middle',
                pointerEvents: 'none'
            }
        }
    });

    link.addTo(graph);

})


</script>


<style>

.qualitymodel-container {
    width: 100%;
    height: 100%;
}
</style>