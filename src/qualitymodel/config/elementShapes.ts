import { dia, shapes } from 'jointjs'

const defaultTextFont = "sans-serif";

const QualityAspectElement = dia.Element.define("quamoco.QualityAspect", {
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

const ProductFactorElement = dia.Element.define("quamoco.ProductFactor", {
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

const ImpactElement = shapes.standard.Link.define("quamoco.Impact", {
    attrs: {
        root: {
            title: "Link"
        },
        line: {
            stroke: "black",
            strokeDasharray: "4 4",
            strokeWidth: 2,
            strokeLineJoin: "round",
            targetMarker: {
                type: "path",
                d: "M 10 -5 0 0 10 5 z"
            }
        }
    },
    defaultLabel: {
        markup: [
            {
                tagName: 'rect',
                selector: 'body'
            }, {
                tagName: 'text',
                selector: 'label'
            }
        ],
        // no `size` object provided = calc() operations need `ref` property
        attrs: {
            label: {
                fill: '#000000',
                fontSize: 14,
                textAnchor: 'middle',
                yAlignment: 'middle',
                pointerEvents: 'none'
            },
            body: {
                // calc() is responsive to size of 'label':
                ref: 'label', // subelement identified by 'label' selector
                fill: 'white',
                width: 'calc(1.2*w)',
                height: 'calc(1.2*h)',
                x: 'calc(x-calc(0.1*w))',
                y: 'calc(y-calc(0.1*h))'
            }
        },
    }
});



Object.assign(shapes, {
    quamoco: {
        QualityAspectElement, ProductFactorElement, ImpactElement
    }
});


export {
    QualityAspectElement, ProductFactorElement, ImpactElement
};