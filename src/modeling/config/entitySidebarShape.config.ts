import { util } from '@joint/core'
import { Component, Service, BackingService, StorageBackingService,
    Endpoint, ExternalEndpoint, Link,
    Infrastructure, DeploymentMapping,
    RequestTrace, DataAggregate, BackingData, 
    ProxyBackingService, BrokerBackingService,
    Network} from './entityShapes'

/**
 * Configuration of the available entity shapes  
 */
const SidebarEntityShapes = {

    Component: {
        index: 1,
        shape: new Component({
            position: { x: 20, y: 26 },
            size: { width: 100, height: 45 },
            attrs: {
                root: {
                    title: "cna.qualityModel.Component"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: 11,
                    textWrap: {
                        text: "Component",
                    }
                }
            }
        })
    },

    Service: {
        index: 2,
        shape: new Service({
            position: { x: 145, y: 18 },
            size: { width: 80, height: 45 },
            attrs: {
                root: {
                    title: "cna.qualityModel.Service"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: 11,
                    textWrap: {
                        text: "Service"
                    }
                }
            }
        })
    },

    BackingService: {
        index: 3,
        shape: new BackingService({
            position: { x: 20, y: 90 },
            size: { width: 90, height: 90 },
            attrs: {
                root: {
                    title: "cna.qualityModel.BackingService"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: 11,
                    textWrap: {
                        text: "Backing Service",
                    }
                }
            }
        })
    },

    StorageBackingService: {
        index: 4,
        shape: new StorageBackingService({
            position: { x: 145, y: 100 },
            size: { width: 80, height: 60 },
            attrs: {
                root: {
                    title: "cna.qualityModel.StorageBackingService"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: 11,
                    textWrap: {
                        text: "Storage Backing Service",
                    }
                }
            }
        })
    },

    ProxyBackingService: {
        index: 5,
        shape: new ProxyBackingService({
            position: { x: 20, y: 170 },
            size: { width: 90, height: 90 },
            attrs: {
                root: {
                    title: "cna.qualityModel.ProxyBackingService"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: 11,
                    textWrap: {
                        text: "Proxy Backing Service",
                    }
                }
            }
        })
    },

    BrokerBackingService: {
        index: 6,
        shape: new BrokerBackingService({
            position: { x: 140, y: 175 },
            size: { width: 90, height: 60 },
            attrs: {
                root: {
                    title: "cna.qualityModel.BrokerBackingService"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: 11,
                    textWrap: {
                        text: "Broker Backing Service",
                    }
                }
            }
        })
    },

    Endpoint: {
        index: 7,
        shape: new Endpoint({
            position: { x: 41, y: 252 },
            size: { width: 55, height: 55 },
            attrs: {
                root: {
                    title: "cna.qualityModel.Endpoint"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: 11,
                    textWrap: {
                        width: "115%",
                        text: "Endpoint",
                    }
                }
            }
        })
    },

    ExternalEndpoint: {
        index: 8,
        shape: new ExternalEndpoint({
            position: { x: 155, y: 252 },
            size: { width: 55, height: 55 },
            attrs: {
                root: {
                    title: "cna.qualityModel.ExternalEndpoint"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: 11,
                    textWrap: {
                        width: "115%",
                        text: 'External Endpoint',
                    }
                }
            }
        })
    },

    Infrastructure: {
        index: 9,
        shape: new Infrastructure({
            position: { x: 20, y: 334 },
            size: { width: 100, height: 45 },
            attrs: {
                root: {
                    title: "cna.qualityModel.Infrastructure"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: 11,
                    textWrap: {
                        text: "Infrastructure",
                    }
                }
            }
        })
    },

    DataAggregate: {
        index: 10,
        shape: new DataAggregate({
            position: { x: 140, y: 338 },
            size: { width: 45, height: 25 },
            attrs: {
                root: {
                    title: "cna.qualityModel.DataAggregate"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: 11,
                    textWrap: {
                        text: 'Data Aggregate',
                    }
                }
            }
        })
    },

    RequestTrace: {
        index: 11,
        shape: new RequestTrace({
            position: { x: 18, y: 418 },
            size: { width: 110, height: 45 },
            attrs: {
                root: {
                    title: "cna.qualityModel.RequestTrace"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: 11,
                    textWrap: {
                        text: "Request Trace",
                    }
                }
            }
        })
    },

    BackingData: {
        index: 12,
        shape: new BackingData({
            position: { x: 147, y: 426 },
            size: { width: 80, height: 27 },
            attrs: {
                root: {
                    title: "cna.qualityModel.BackingData"
                },
                body: {
                    class: "entityHighlighting"
                },
                label: {
                    fontSize: 11,
                    textWrap: {
                        text: 'Backing Data',
                    }
                }
            },
        })
    },

    Link: {
        index: 13,
        shape: new Link({
            source: { x: 20, y: 504 },
            target: { x: 120, y: 504 },
            labels: [
                {
                    attrs: {
                        rect: {
                            fill: "none"
                        },
                        text: {
                            text: "Link"
                        }
                    },
                    position: {
                        ref: "text",
                        offset: 18
                    }
                }
            ],
            attrs: {
                root: {
                    title: "cna.qualityModel.Link"
                },
                wrapper: {
                    cursor: "move", // TODO after drag change to "pointer"
                    class: "sidebarConnection"
                }
            }
        })
    },

    DeploymentMapping: {
        index: 14,
        shape: new DeploymentMapping({
            source: { x: 145, y: 504 },
            target: { x: 225, y: 504 },
            labels: [
                {
                    attrs: {
                        rect: {
                            fill: "none"
                        },
                        text: {
                            text: util.breakText("Deployment Mapping", { width: 100 })
                        }
                    },
                    position: {
                        ref: "text",
                        offset: 22
                    }
                }
            ],
            attrs: {
                root: {
                    title: "cna.qualityModel.DeploymentMapping"
                },
                wrapper: {
                    cursor: "move", // TODO after drag change to "pointer"
                    class: "sidebarConnection"
                }
            }
        })
    },

    Network: {
        index: 15,
        shape: new Network({
            position: { x: 35, y: 550 },
            size: { width: 60, height: 60 },
            attrs: {
                root: {
                    title: "cna.qualityModel.Network"
                },
                body: {
                    class: "entityHighlighting",
                    fill: "transparent"
                },
                label: {
                    fontSize: 11,
                    textWrap: {
                        text: "Network",
                    }
                }
            }
        })
    },
}

export default SidebarEntityShapes;