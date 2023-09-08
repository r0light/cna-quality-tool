import { dia, shapes } from 'jointjs'

const defaultTextFont = "sans-serif";

const QualityAspect = dia.Element.define("quamoco.QualityAspect", {
    defaults: {
        size: {
            width: 150,
            height: 40
        },
        fontSize: 14,
        fill: "#cccccc",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 150,
        height: 40
    },
    attrs: {
        root: {
            title: "cna.quamoco.QualityAspect"
        },
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
            fontSize: 14,
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
    }, {
        tagName: "text",
        selector: "label"
    }]
});

const ProductFactor = dia.Element.define("quamoco.ProductFactor", {
    defaults: {
        size: {
            width: 120,
            height: 60
        },
        fontSize: 14,
        fill: "#cccccc",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 120,
        height: 60
    },
    attrs: {
        root: {
            title: "cna.quamoco.QualityAspect"
        },
        body: {
            width: "calc(w)",
            height: "calc(h)",
            strokeDasharray: 0,
            strokeWidth: 2,
            stroke: "black",
            fill: "white"
        },
        label: {
            fill: "black",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 12,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "middle",
            x: 'calc(0.5*w)',
            y: 'calc(0.5*h)',
            textWrap: {
                text: "Product Factor",
            },
        }

    },
}, {
    markup: [{
        tagName: "rect",
        selector: "body"
    }, {
        tagName: "text",
        selector: "label"
    }]
});



Object.assign(shapes, {
    quamoco: {
        QualityAspect, ProductFactor
    }
});

export {
    QualityAspect, ProductFactor
};