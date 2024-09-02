import { dia, shapes, util } from '@joint/core'
import { getComponentProperties, getBackingServiceProperties, getStorageBackingServiceProperties, getEndpointProperties, getInfrastructureProperties, getDataAggregateProperties, getBackingDataProperties, getDeploymentMappingProperties, getExternalEndpointProperties, getServiceProperties, getRequestTraceProperties, getProxyBackingServiceProperties } from "../../core/entities";
import EntityTypes from "./entityTypes";
import { getLinkProperties } from '@/core/entities/link';
import { getBrokerBackingServiceProperties } from '@/core/entities/brokerBackingService';

// TODO section:
/*  -   Icon on first load not on correct position --> with firefox for every F5, 
 *      for Chrome and edge only for first load
 *  -   Label position
*/

// TODO decide
const defaultTextFont = "sans-serif";
// const defaultTextFont = "Roboto Condensed"
const expandEntityIconPath = "static/icons/magnifying-glass-plus-solid.svg";

function parseProperties(entityProperties) {
    var keyValueOnlyProperty = {}
    entityProperties.map(property => {
        keyValueOnlyProperty[property.getKey] = property.value;

    });
    return keyValueOnlyProperty;
}

/**
 * Shape for a Component entity. Creates a regular rectangle shape using the value of 
 * the largest side (width/height) to calculate the size. Default size is { 160, 80 }.
 * It additionally includes a label for text, and an icon to indicate if embedded entities
 * should be shown or not. The only data that should be provided for this shape is the label
 * __text__ provided as a __textWrap__ and the __position__ and possibly the __size__.
 * 
 * @example let component = new joint.shapes.qualityModel.Component({
            position: { x: 50, y: 50 },
            size: { width: 160, height: 80 },
            attrs: {
                label: {
                    textWrap: {
                        text: 'Restaurant Service',
                    }
                }
            }
        })
 */
const Component = dia.Element.define("qualityModel.Component", {
    defaults: {
        type: "qualityModel.Component",
        size: {
            width: 160,
            height: 80
        },
        fontSize: 14,
        fill: "white",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 160,
        height: 80
    },
    attrs: {
        body: {
            width: "calc(l)",
            height: "calc(0.5*l)",
            rx: 2,
            ry: 2,
            strokeDasharray: 0,
            strokeWidth: 2,
            stroke: "black",
            fill: "white",
            class: "entityShape" // TODO keep?

        },
        label: {
            ref: "body",
            fill: "black",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 14,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "top",
            refX: "50%",
            refY: "10%",
            textWrap: {
                text: "Component",
            },
            class: "entityLabel" // TODO keep?
        },
        icon: {
            title: "Expand to show included entities",
            ref: "body",
            href: expandEntityIconPath,
            class: "expandEntityIcon",
            transform: "scale(calc(0.0018 * h))",
            refX: "50%",
            refY: "90%",
            xAlignment: "middle",
            yAlignment: "bottom",
            preserveAspectRatio: 'xMidYMin',
            visibility: "hidden",
            event: "element:icon:pointerclick"
        }

    },
    collapsed: false,
    entityTypeHidden: false,
    entity: {
        type: EntityTypes.COMPONENT,
        properties: parseProperties(getComponentProperties()),
        artifacts: []
    }
}, {
    markup: [{
        tagName: "rect",
        selector: "body"
    }, {
        tagName: "text",
        selector: "label"
    }, {
        tagName: "image",
        selector: "icon"
    }]
});


/**
 * Shape for a Service entity. Creates a regular hexagon shape using the value of 
 * the largest side (width/height) to calculate the size. Default size is { 140, 120 }.
 * It additionally includes a label for text, and an icon to indicate if embedded entities
 * should be shown or not. The only data that should be provided for this shape is the label
 * __text__ provided as a __textWrap__ and the __position__ and possibly the __size__.
 * 
 * @example let service = new joint.shapes.qualityModel.Service({
            position: { x: 50, y: 50 },
            size: { width: 140, height: 120 },
            attrs: {
                label: {
                    textWrap: {
                        text: 'Restaurant Service',
                    }
                }
            }
        })
 */
const Service = dia.Element.define("qualityModel.Service", {
    defaults: {
        type: "qualityModel.Service",
        size: {
            width: 140,
            height: 120
        },
        fontSize: 14,
        fill: "white",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 140,
        height: 120
    },
    attrs: {
        body: {
            points: 'calc(0.25 * l),0 calc(0.75 * l),0 calc(l),calc(0.4 * l) calc(0.75 * l),calc(0.8 * l) calc(0.25 * l),calc(0.8 * l) 0,calc(0.4 * l)',
            strokeDasharray: 0,
            strokeWidth: 2,
            stroke: "black",
            fill: "white",
            class: "entityShape" // TODO keep?
        },
        label: {
            ref: "body",
            fill: "black",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 14,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "top",
            refX: "50%",
            refY: "10%",
            textWrap: {
                width: "80%",
                text: "Service",
            },
            class: "entityLabel" // TODO keep?
        },
        icon: {
            title: "Expand to show included entities",
            ref: "body",
            href: expandEntityIconPath,
            class: "expandEntityIcon",
            transform: "scale(calc(0.0014 * h))",
            refX: "50%",
            refY: "95%",
            xAlignment: "middle",
            yAlignment: "bottom",
            preserveAspectRatio: 'xMidYMin',
            visibility: "hidden",
            event: "element:icon:pointerclick"
        }
    },
    collapsed: false,
    entityTypeHidden: false,
    entity: {
        type: EntityTypes.SERVICE,
        properties: parseProperties(getComponentProperties().concat(getServiceProperties())),
        artifacts: []
    }
}, {
    markup: [{
        tagName: "polygon",
        selector: "body"
    }, {
        tagName: "text",
        selector: "label"
    }, {
        tagName: "image",
        selector: "icon"
    }]
});


/**
 * Shape for a Backing Service entity. Creates a regular rhombus shape using the value of 
 * the largest side (width/height) to calculate the size. Default size is { 200, 120 }.
 * It additionally includes a label for text, and an icon to indicate if embedded entities
 * should be shown or not. The only data that should be provided for this shape is the label
 * __text__ provided as a __textWrap__ and the __position__ and possibly the __size__.
 * 
 * @example let backingService = new joint.shapes.qualityModel.BackingService({
            position: { x: 50, y: 50 },
            size: { width: 140, height: 140 },
            attrs: {
                label: {
                    textWrap: {
                        text: 'Restaurant Service',
                    }
                }
            }
        })
 */
const BackingService = dia.Element.define("qualityModel.BackingService", {
    defaults: {
        type: "qualityModel.BackingService",
        size: {
            width: 140,
            height: 140
        },
        fontSize: 14,
        fill: "white",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 140,
        height: 140
    },
    attrs: {
        body: {
            points: "calc(0.5 * l),0 calc(l),calc(0.4 * l) calc(0.5 * l),calc(0.8 * l) 0,calc(0.4 * l)",
            strokeWidth: 2,
            stroke: "black",
            fill: "white",
            class: "entityShape" // TODO keep?
        },
        label: {
            ref: "body",
            fill: "black",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 14,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "top",
            refX: "50%",
            refY: "40%", // TODO Fix me
            textWrap: {
                text: "Backing Service",
            },
            class: "entityLabel" // TODO keep?
        },
        icon: {
            title: "Expand to show included entities",
            ref: "body",
            href: expandEntityIconPath,
            class: "expandEntityIcon",
            transform: "scale(calc(0.0013 * h))",
            refX: "49%",
            refY: "90%",
            xAlignment: "middle",
            yAlignment: "bottom",
            preserveAspectRatio: 'xMidYMin',
            visibility: "hidden",
            event: "element:icon:pointerclick",
        }
    },
    collapsed: false,
    entityTypeHidden: false,
    entity: {
        type: EntityTypes.BACKING_SERVICE,
        properties: parseProperties(getComponentProperties().concat(getBackingServiceProperties())),
        artifacts: []
    }
}, {
    markup: [{
        tagName: "polygon",
        selector: "body"
    }, {
        tagName: "text",
        selector: "label"
    }, {
        tagName: "image",
        selector: "icon"
    }]
});


const ProxyBackingService = dia.Element.define("qualityModel.ProxyBackingService", {
    defaults: {
        type: "qualityModel.ProxyBackingService",
        size: {
            width: 140,
            height: 140
        },
        fontSize: 14,
        fill: "white",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 140,
        height: 140
    },
    attrs: {
        body: {
            points: "0,0 calc(0.5 * w),0 calc(w),calc(0.4 * h) calc(0.5 * w),calc(0.8 * h) 0,calc(0.8 * h)",
            strokeWidth: 2,
            stroke: "black",
            fill: "white",
            class: "entityShape" // TODO keep?
        },
        label: {
            ref: "body",
            fill: "black",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 14,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "top",
            refX: "45%",
            refY: "40%", // TODO Fix me
            textWrap: {
                text: "Proxy Backing Service",
            },
            class: "entityLabel" // TODO keep?
        },
        icon: {
            title: "Expand to show included entities",
            ref: "body",
            href: expandEntityIconPath,
            class: "expandEntityIcon",
            transform: "scale(calc(0.0013 * h))",
            refX: "49%",
            refY: "90%",
            xAlignment: "middle",
            yAlignment: "bottom",
            preserveAspectRatio: 'xMidYMin',
            visibility: "hidden",
            event: "element:icon:pointerclick",
        }
    },
    collapsed: false,
    entityTypeHidden: false,
    entity: {
        type: EntityTypes.PROXY_BACKING_SERVICE,
        properties: parseProperties(getComponentProperties().concat(getProxyBackingServiceProperties())),
        artifacts: []
    }
}, {
    markup: [{
        tagName: "polygon",
        selector: "body"
    }, {
        tagName: "text",
        selector: "label"
    }, {
        tagName: "image",
        selector: "icon"
    }]
});



// TODO ensure aspect ratio
const StorageBackingService = shapes.standard.Cylinder.define("qualityModel.StorageBackingService", {
    defaults: {
        type: "qualityModel.StorageBackingService",
        size: {
            width: 160,
            height: 140
        },
        fontSize: 14,
        fill: "white",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 160,
        height: 140
    },
    attrs: {
        body: {
            strokeWidth: 2,
            stroke: "black",
            fill: "white",
            class: "entityShape"
        },
        top: {
            strokeWidth: 2,
            stroke: "black",
            fill: "white",
            class: "entityShape"
        },
        label: {
            ref: "body",
            fill: "black",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 14,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "top",
            refY: "-85%", // TODO Fix me
            textWrap: {
                width: "95%",
                text: "Storage Backing Service",
            },
            class: "entityLabel" // TODO keep?
        },
        icon: {
            title: "Expand to show included entities",
            ref: "body",
            href: expandEntityIconPath,
            class: "expandEntityIcon",
            transform: "scale(calc(0.0011 * h))",
            refX: "49%",
            refY: "95%",
            xAlignment: "middle",
            yAlignment: "bottom",
            preserveAspectRatio: 'xMidYMin',
            visibility: "hidden",
            event: "element:icon:pointerclick"
        }
    },
    collapsed: false,
    entityTypeHidden: false,
    entity: {
        type: EntityTypes.STORAGE_BACKING_SERVICE,
        properties: parseProperties(getComponentProperties().concat(getStorageBackingServiceProperties())),
        artifacts: []
    }
}, {
    markup: [{
        tagName: "path",
        selector: "body"
    }, {
        tagName: "ellipse",
        selector: "top"
    }, {
        tagName: "text",
        selector: "label"
    }, {
        tagName: "image",
        selector: "icon"
    }]
});

// adapted from https://github.com/clientIO/joint/blob/master/packages/joint-core/src/shapes/standard.mjs
var CYLINDER_TILT = 10;
const KAPPA = 0.551784;
const BrokerBackingService = dia.Element.define("qualityModel.BrokerBackingService", {
    defaults: {
        type: "qualityModel.BrokerBackingService",
        size: {
            width: 150,
            height: 100
        },
        fontSize: 14,
        fill: "white",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 150,
        height: 100
    },
    attrs: {
        root: {
            cursor: 'move'
        },
        body: {
            lateralArea: CYLINDER_TILT,
            strokeWidth: 2,
            stroke: "black",
            fill: "white",
            class: "entityShape" // TODO keep?
        },
        top: {
            cx: CYLINDER_TILT,
            cy: 'calc(h/2)',
            rx: CYLINDER_TILT,
            ry: 'calc(h/2)',
            fill: '#FFFFFF',
            stroke: '#333333',
            strokeWidth: 2,
            class: "entityShape"
        },
        label: {
            ref: "body",
            fill: "black",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 14,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "middle",
            //x: 'calc(w/2)',
            //y: 'calc(h/2)',
            refY: "35%",
            refX: "50%",
            textWrap: {
                width: "80%",
                text: "Broker Backing Service",
            },
            class: "entityLabel" // TODO keep?
        },
        icon: {
            title: "Expand to show included entities",
            ref: "body",
            href: expandEntityIconPath,
            class: "expandEntityIcon",
            transform: "scale(calc(0.0011 * h))",
            refX: "49%",
            refY: "95%",
            xAlignment: "middle",
            yAlignment: "bottom",
            preserveAspectRatio: 'xMidYMin',
            visibility: "hidden",
            event: "element:icon:pointerclick"
        }
    },
    collapsed: false,
    entityTypeHidden: false,
    entity: {
        type: EntityTypes.BROKER_BACKING_SERVICE,
        properties: parseProperties(getComponentProperties().concat(getBrokerBackingServiceProperties())),
        artifacts: []
    }
}, {
    markup: [{
        tagName: "path",
        selector: "body"
    }, {
        tagName: "ellipse",
        selector: "top"
    }, {
        tagName: "text",
        selector: "label"
    }, {
        tagName: "image",
        selector: "icon"
    }],

    topRy: function (t, opt) {
        // getter
        if (t === undefined) return this.attr('body/lateralArea');

        // setter
        var bodyAttrs = { lateralArea: t };

        var isPercentageSetter = util.isPercentage(t);
        //var ty = (isPercentageSetter) ? `calc(${parseFloat(t) / 100}*h)` : t;
        var ty = (isPercentageSetter) ? `calc(${parseFloat(t) / 100}*h)` : t;
        var topAttrs = { cy: ty, ry: ty };

        return this.attr({ body: bodyAttrs, top: topAttrs }, opt);
    }
}, {
    attributes: {
        'lateral-area': {
            set: function (t, refBBox) {
                var isPercentageSetter = util.isPercentage(t);
                if (isPercentageSetter) t = parseFloat(t) / 100;

                var x = refBBox.x;
                var y = refBBox.y;
                var w = refBBox.width;
                var h = refBBox.height;

                // curve control point variables
                var ry = h / 2;
                var rx = isPercentageSetter ? (w * t) : t;

                var kappa = KAPPA;
                var cy = kappa * ry;
                var cx = kappa * (isPercentageSetter ? (w * t) : t);

                // shape variables
                var yTop = y;
                var yCenter = y + (h / 2);
                var yBottom = y + h;

                var xCurveLeft = x + rx;
                var xCurveLeftest = x;
                var xCurveRight = x + w - rx;
                var xCurveRightest = x + w;

                // return calculated shape
                var data = [
                    'M', xCurveLeft, yBottom,
                    'L', xCurveRight, yBottom,
                    'C', (xCurveRight + cx),yBottom , xCurveRightest, (yBottom - cy), xCurveRightest, yCenter,
                    'C', xCurveRightest, (yCenter -cy), (xCurveRight + cx), yTop, xCurveRight, yTop,
                    'L', xCurveLeft, yTop,
                    'C', (xCurveLeft - cx), yTop, xCurveLeftest, (yTop + cy), xCurveLeftest, yCenter,
                    'C', (xCurveLeftest + cx), yCenter, xCurveLeft, (yBottom- cy), xCurveLeft, yBottom,
                    'Z'
                ];

                return { d: data.join(' ') };
            },
            unset: 'd'
        }
    }
}
);



/**
 * Shape for an Endpoint entity. Creates a circle shape using the value of the smallest 
 * side (width/height) to calculate the size. Default size is { 50, 50 }. It additionally 
 * includes a label for text. The only data that should be provided for this shape is the label
 * __text__ provided as a __textWrap__ and the __position__ and possibly the __size__.
 * 
 * @example let endpoint = new joint.shapes.qualityModel.Endpoint({
            position: { x: 50, y: 50 },
            size: { width: 50, height: 50 },
            attrs: {
                label: {
                    textWrap: {
                        text: 'POST /order',
                    }
                }
            }
        })
 */
const Endpoint = shapes.standard.Circle.define("qualityModel.Endpoint", {
    defaults: {
        type: "qualityModel.Endpoint",
        size: {
            width: 50,
            height: 50
        },
        fontSize: 11,
        fill: "white",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 50,
        height: 50
    },
    attrs: {
        body: {
            fill: 'white',
            stroke: 'black',
            strokeWidth: 2,
            strokeDasharray: '0'
        },
        label: {
            fill: "black",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 14,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "middle",
            textWrap: {
                width: "90%",
                text: "Endpoint"
            }
        }
    },
    entityTypeHidden: false,
    parentCollapsed: false,
    entity: {
        type: EntityTypes.ENDPOINT,
        embedded: "",
        properties: parseProperties(getEndpointProperties())
    }
}, {
    markup: [{
        tagName: "circle",
        selector: "body"
    }, {
        tagName: "text",
        selector: "label"
    }]
});


/**
 * Shape for an External Endpoint entity. Creates a black filled circle shape using the value 
 * of the smallest side (width/height) to calculate the size. Default size is { 50, 50 }. It 
 * additionally includes a label for text. The only data that should be provided for this shape 
 * is the label __text__ provided as a __textWrap__ and the __position__ and possibly the 
 * __size__.
 * 
 * @example let externalEndpoint = new joint.shapes.qualityModel.ExternalEndpoint({
            position: { x: 50, y: 50 },
            size: { width: 50, height: 50 },
            attrs: {
                label: {
                    textWrap: {
                        text: 'POST /order',
                    }
                }
            }
        })
 */
const ExternalEndpoint = shapes.standard.Circle.define("qualityModel.ExternalEndpoint", {
    defaults: {
        type: "qualityModel.ExternalEndpoint",
        size: {
            width: 50,
            height: 50
        },
        fontSize: 11,
        fill: "black",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 50,
        height: 50
    },
    attrs: {
        body: {
            fill: 'black',
            stroke: 'black',
            strokeWidth: 2,
            strokeDasharray: '0'
        },
        label: {
            fill: "white",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 14,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "middle",
            textWrap: {
                width: "90%",
                text: "External Endpoint",
            },
        }
    },
    entityTypeHidden: false,
    parentCollapsed: false,
    entity: {
        type: EntityTypes.EXTERNAL_ENDPOINT,
        embedded: "",
        properties: parseProperties(getEndpointProperties().concat(getExternalEndpointProperties()))
    }
}, {
    markup: [{
        tagName: "circle",
        selector: "body"
    }, {
        tagName: "text",
        selector: "label"
    }]
});


/**
 * Shape for a Infrastructure entity. Creates an isosceles trapezoid shape using the value of 
 * the largest side (width/height) to calculate the size. Default size is { 180, 90 }.
 * It additionally includes a label for text, and an icon to indicate if embedded entities
 * should be shown or not. The only data that should be provided for this shape is the label
 * __text__ provided as a __textWrap__ and the __position__ and possibly the __size__.
 * 
 * @example let infrastructure = new joint.shapes.qualityModel.Infrastructure({
            position: { x: 50, y: 50 },
            size: { width: 180, height: 90 },
            attrs: {
                label: {
                    textWrap: {
                        text: 'Docker Host',
                    }
                }
            }
        })
 */
const Infrastructure = dia.Element.define("qualityModel.Infrastructure", {
    defaults: {
        type: "qualityModel.Infrastructure",
        size: {
            width: 180,
            height: 90
        },
        fontSize: 14,
        fill: "white",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 180,
        height: 90
    },
    attrs: {
        body: {
            points: 'calc(0.15 * w),0 calc(0.85 * w),0 calc(w),calc(h) 0,calc(h)',
            strokeWidth: 2,
            stroke: "black",
            fill: "white",
            class: "entityShape" // TODO keep?
        },
        label: {
            ref: "body",
            fill: "black",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 14,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "top",
            refX: "50%",
            // refY: "10%",
            y: "calc(y + 10)",
            textWrap: {
                text: "Backing Service",
            },
            class: "entityLabel" // TODO keep?
        },
        icon: {
            title: "Expand to show included entities",
            ref: "body",
            href: expandEntityIconPath,
            class: "expandEntityIcon",
            transform: "scale(calc(0.0017 * h))",
            refX: "49%",
            refY: "90%",
            xAlignment: "middle",
            yAlignment: "bottom",
            preserveAspectRatio: 'xMidYMin',
            visibility: "hidden",
            event: "element:icon:pointerclick"
        }
    },
    entityTypeHidden: false,
    collapsed: false,
    entity: {
        type: EntityTypes.INFRASTRUCTURE,
        properties: parseProperties(getInfrastructureProperties()),
        artifacts: []
    }
}, {
    markup: [{
        tagName: "polygon",
        selector: "body"
    }, {
        tagName: "text",
        selector: "label"
    }, {
        tagName: "image",
        selector: "icon"
    }]
});


/**
 * Shape for a Request Trace entity. Creates an arrow-shaped polygon shape using the value of 
 * the largest side (width/height) to calculate the size. Default size is { 190, 76 }.
 * It additionally includes a label for text, and an icon which allows to inspect the details 
 * of the entity, which means showing all involved entities. The only data that should be provided 
 * for this shape is the label __text__ provided as a __textWrap__ and the __position__ and 
 * possibly the __size__.
 * 
 * @example let requestTrace = new joint.shapes.qualityModel.RequestTrace({
            position: { x: 50, y: 50 },
            size: { width: 190, height: 76 },
            attrs: {
                label: {
                    textWrap: {
                        text: 'POST /orders',
                    }
                }
            }
        })
 */
const RequestTrace = dia.Element.define("qualityModel.RequestTrace", {
    defaults: {
        type: "qualityModel.RequestTrace",
        size: {
            width: 190,
            height: 76
        },
        fontSize: 14,
        fill: "white",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 190,
        height: 76
    },
    attrs: {
        body: {
            points: '0,0 calc(0.8 * l),0 calc(l),calc(0.2 * l) calc(0.8 * l),calc(0.4 * l) 0,calc(0.4 * l) calc(0.2 * l),calc(0.2 * l)',
            strokeWidth: 2,
            stroke: "black",
            fill: "white",
            class: "entityShape" // TODO keep?
        },
        label: {
            ref: "body",
            fill: "black",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 14,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "top",
            refX: "47%",
            refY: "10%",
            textWrap: {
                text: "Backing Service",
            },
            class: "entityLabel" // TODO keep?
        },
        icon: {
            title: "Expand to show included entities",
            ref: "body",
            href: expandEntityIconPath,
            class: "expandEntityIcon",
            transform: "scale(calc(0.0021 * h))",
            refX: "49%",
            refY: "90%",
            xAlignment: "middle",
            yAlignment: "bottom",
            preserveAspectRatio: 'xMidYMin',
            visibility: "visible",
            event: "requestTrace:icon:pointerclick"
        }
    },
    entityTypeHidden: false,
    collapsed: true,
    entity: {
        type: EntityTypes.REQUEST_TRACE,
        properties: parseProperties(getRequestTraceProperties())
    }
}, {
    markup: [{
        tagName: "polygon",
        selector: "body"
    }, {
        tagName: "text",
        selector: "label"
    }, {
        tagName: "image",
        selector: "icon"
    }]
});


/**
 * Shape for a Link entity. Creates a solid line with an arrow at the end. Normally not used as standalone 
 * but as a connection between to other entities. It additionally includes a label for text. The only data 
 * that should be provided for this shape is the label __text__ provided as a __textWrap__ and the 
 * __position__ and possibly the __size__.
 * 
 * @example let link = new joint.shapes.qualityModel.Link({
            source: new g.Point(30, 250),
            target: new g.Point(100, 250),
        })
        
        // To provide a label:
        link.appendLabel({
            attrs: {
                text: {
                    text: "connects-to"
                }
            }
        })
 */
const Link = shapes.standard.Link.define("qualityModel.Link", {
    defaults: {
        type: "qualityModel.Link",
    },
    attrs: {
        root: {
            title: "Link",
            visibility: "visible"
        },
        line: {
            stroke: "black",
            strokeDasharray: "none",
            strokeWidth: 2,
            strokeLineJoin: "round",
            targetMarker: {
                type: "path",
                d: "M 10 -5 0 0 10 5 z"
            }
        }
    },
    entityTypeHidden: false,
    entity: {
        type: EntityTypes.LINK,
        properties: parseProperties(getLinkProperties())
    }
});


/**
 * Shape for a Deployment Mapping entity. Creates an dashed line. Normally not used as standalone but as
 * a connection between to other entities. It additionally includes a label for text. The only data that 
 * should be provided for this shape is the label __text__  provided as a __textWrap__ and the 
 * __position__ and possibly the __size__.
 * 
 * @example let deploymentMapping = new joint.shapes.qualityModel.DeploymentMapping({
            source: new g.Point(30, 250),
            target: new g.Point(100, 250),
        })

        // To provide a label:
        deploymentMapping.appendLabel({
            attrs: {
                text: {
                    text: "hosted-on"
                }
            }
        })
 */
const DeploymentMapping = shapes.standard.Link.define("qualityModel.DeploymentMapping", {
    defaults: {
        type: "qualityModel.DeploymentMapping",
    },
    attrs: {
        root: {
            title: "Deployment Mapping",
            visibility: "visible"
        },
        line: {
            stroke: "black",
            strokeDasharray: 4,
            strokeLineJoin: "round",
            targetMarker: "none",
            markerEnd: "none"
        }
    },
    entityTypeHidden: false,
    entity: {
        type: EntityTypes.DEPLOYMENT_MAPPING,
        properties: parseProperties(getDeploymentMappingProperties())
    }
});


/**
 * Shape for a Data Aggregate entity. Creates an ellipse shape using the value of the largest 
 * side (width/height) to calculate the size. Default size is { 50, 25 }. It additionally includes 
 * a label for text. The only data that should be provided for this shape is the label __text__ 
 * provided as a __textWrap__ and the __position__ and possibly the __size__.
 * 
 * @example let dataAggregate = new joint.shapes.qualityModel.DataAggregate({
            position: { x: 50, y: 50 },
            size: { width: 50, height: 25 },
            attrs: {
                label: {
                    textWrap: {
                        text: 'Order',
                    }
                }
            }
        })
 */
const DataAggregate = dia.Element.define("qualityModel.DataAggregate", {
    defaults: {
        type: "qualityModel.DataAggregate",
        size: {
            width: 50,
            height: 25
        },
        fontSize: 13,
        fill: "white",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 50,
        height: 25
    },
    attrs: {
        body: {
            rx: "calc(l)",
            ry: "calc(0.5 * l)",
            cx: "calc(l)",
            cy: "calc(0.5 * l)",
            fill: 'white',
            stroke: 'black',
            strokeWidth: 2,
            strokeDasharray: '0'
        },
        label: {
            ref: "body",
            fill: "black",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 14,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "middle",
            refX: '50%',
            refY: '50%',
            textWrap: {
                text: "Data Aggregate",
            }
        }
    },
    entityTypeHidden: false,
    parentCollapsed: false,
    entity: {
        type: EntityTypes.DATA_AGGREGATE,
        embedded: "", // id of the element in which this entity is embedded
        assignedFamily: "",
        properties: parseProperties(getDataAggregateProperties())
    }
}, {
    markup: [{
        tagName: "ellipse",
        selector: "body"
    }, {
        tagName: "text",
        selector: "label"
    }]
});


/**
 * Shape for a Backing Data entity. Creates the delay shape of flow chart diagrams using the value of 
 * the largest side (width/height) to calculate the size. Default size is { 100, 60 }.
 * It additionally includes a label for text, and an icon which allows to inspect the details 
 * of the entity, which means showing all involved entities. The only data that should be provided 
 * for this shape is the label __text__ provided as a __textWrap__ and the __position__ and 
 * possibly the __size__.
 * 
 * @example let backingData = new joint.shapes.qualityModel.BackingData({
            position: { x: 50, y: 50 },
            size: { width: 100, height: 60 },
            attrs: {
                label: {
                    textWrap: {
                        text: 'Database Configuration',
                    }
                }
            }
        })
 */
const BackingData = dia.Element.define("qualityModel.BackingData", {
    defaults: {
        type: "qualityModel.BackingData",
        size: {
            width: 100,
            height: 60
        },
        fontSize: 14,
        fill: "white",
        stroke: "black",
        strokeWidth: 2
    },
    size: {
        width: 100,
        height: 60
    },
    attrs: {
        body: {
            d: "M 0 0 L calc(0.7 * l) 0 Q calc(l) 0 calc(l) calc(0.3 * l) Q calc(l) calc(0.6 * l) calc(0.7 * l) calc(0.6 * l) L 0 calc(0.6 * l) Z",
            fill: "white",
            stroke: "black",
            strokeWidth: 2,
            strokeDasharray: "0"
        },
        label: {
            ref: "body",
            fill: "black",
            fontFamily: defaultTextFont,
            fontWeight: "Normal",
            fontSize: 14,
            strokeWidth: 0,
            textAnchor: "middle",
            textVerticalAnchor: "middle",
            refX: '50%',
            refY: '50%',
            textWrap: {
                text: "Backing Data",
            }
        }
    },
    entityTypeHidden: false,
    parentCollapsed: false,
    entity: {
        type: EntityTypes.BACKING_DATA,
        embedded: "", // id of the element in which this entity is embedded
        assignedFamily: "",
        properties: parseProperties(getBackingDataProperties())
    }
}, {
    markup: [{
        tagName: "path",
        selector: "body"
    }, {
        tagName: "text",
        selector: "label"
    }]
});


const entityShapes = Object.assign({
    qualityModel: {
        Component, Service, BackingService, StorageBackingService, ProxyBackingService, BrokerBackingService,
        Endpoint, ExternalEndpoint, Link,
        Infrastructure, DeploymentMapping,
        RequestTrace, DataAggregate, BackingData
    }, shapes
});


export {
    entityShapes, Component, Service, BackingService, ProxyBackingService, BrokerBackingService, StorageBackingService,
    Endpoint, ExternalEndpoint, Link,
    Infrastructure, DeploymentMapping,
    RequestTrace, DataAggregate, BackingData
};