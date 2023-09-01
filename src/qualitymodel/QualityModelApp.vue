<template>
    <div class="qualitymodel-container">

        <div id="qualityModel">


        </div>


    </div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { ref, onMounted, nextTick } from 'vue'
import { dia, shapes, util } from "jointjs";



onMounted(() => {

    console.log("mount?")

    const namespace = shapes;

    const graph = new dia.Graph({}, { cellNamespace: namespace });

    var paper = new dia.Paper({
        el: $('#qualityModel'),
        model: graph,
        width: 600,
        height: 300, // height had to be increased
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

    var rect2 = new shapes.standard.Rectangle();
    rect2.position(400, 30);
    rect2.resize(100, 40);
    rect2.attr({
        body: {
            fill: 'grey',
            rx: 5,
            ry: 5,
            strokeWidth: 2
        },
        label: {
            text: 'Installability',
            fill: 'black',
            fontSize: 18,
            fontWeight: 'bold',
            fontVariant: 'small-caps'
        }
    });
    rect2.addTo(graph);

    var link = new shapes.standard.Link();
    link.source(rect);
    link.target(rect2);
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


<style></style>