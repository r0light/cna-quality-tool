import { dia, shapes } from 'jointjs'

const defaultTextFont = "sans-serif";

const QualityAspect = dia.Element.define("quamoco.QualityAspect", {
    defaults: {
        size: {
            width: 150,
            height: 70
        },
        fontSize: 15,
        fill: "#cccccc",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 150,
        height: 70
    },
    attrs: {
        body: {
            width: "calc(w)",
            height: "calc(h)",
            strokeDasharray: 0,
            strokeWidth: 2,
            stroke: "black",
            fill: "#cccccc"
        },
        label: {
            fill: "black",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 15,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "middle",
            x: 'calc(0.5*w)',
            y: 'calc(0.5*h)',
            textWrap: {
                text: "Quality Aspect",
            },
        }

    },
}, {
    markup: [{
        tagName: "rect",
        selector: "body"
    },{
        tagName: "text",
        selector: "label"
    }]
});



Object.assign(shapes, {
    quamoco: {
        QualityAspect
    }
});

export {
    QualityAspect
};