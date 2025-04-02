// This script is not intended to be used within the web app, but locally to generate a nice looking markdown representation of the quality model.

import * as fs from 'fs';
import { getQualityModel } from './QualityModelInstance.js';
import { ImpactType } from './quamoco/Impact.js';
import { getBackingDataProperties, getBackingServiceProperties, getBrokerBackingServiceProperties, getComponentProperties, getDataAggregateProperties, getDeploymentMappingProperties, getEndpointProperties, getExternalEndpointProperties, getInfrastructureProperties, getLinkProperties, getNetworkProperties, getProxyBackingServiceProperties, getRequestTraceProperties, getServiceProperties, getStorageBackingServiceProperties, Infrastructure, Link, Network, ProxyBackingService, RequestTrace, Service, StorageBackingService } from '../entities.js';
import { EntityProperty, SelectEntityProperty } from '../common/entityProperty.js';

const qualityModel = getQualityModel();

let frameOutput = "";

const spacesForIndentation = 2;
const indentation = " ".repeat(spacesForIndentation);

function indent(indentationLevel = 1) {
    return indentation.repeat(indentationLevel);
}

function getImpactSymbol(impactType: ImpactType) {
    switch (impactType) {
        case "positive":
            return `\\ding{218}`;
        case "negative":
            return `\\ding{216}`;
        default:
            return "";
    }
}

const outerDir = "latex-generated-qualitymodel";
const innerDir = "factors";

fs.mkdirSync(`./${outerDir}/${innerDir}`, { recursive: true });

// Product Factors

for (const factor of qualityModel.productFactors) {

    let output = "";

    let categories = factor.getCategories.map(categoryKey => qualityModel.factorCategories.find(category => category.categoryKey === categoryKey).categoryName).join(", ");

    output += `\\begin{minipage}{\\textwidth}\n`;
    output += `${indent()}\\begin{mdframed}[backgroundcolor=black!6]\n`;
    output += `${indent(2)}Factor \\textbf{${factor.getName}}\\\\\n`;
    output += `${indent(2)}\\textit{${factor.getDescription}}\\\\\n`;
    output += `${indent(2)}Categories: ${categories}\\\\\n`;
    output += `${indent(2)}Impacts:\n`;
    for (const impact of factor.getOutgoingImpacts) {
        let impactDesc = `${getImpactSymbol(impact.getImpactType)}  \\textbf{${impact.getImpactedFactor.getName}}`;
        output += `${indent(2)}${impactDesc}\n`;
    }
    output += `${indent(2)}\\\\`;
    if (factor.getSources.length > 0) {
        output += `${indent(2)}Read more:\\\\\n`;
        for (const source of factor.getSources) {
            let sourceDesc = `\\cite{${source.getKey}} ${source.getInfo}`;
            output += `${indent(2)}${sourceDesc}\\\\\n`;
        }
    }
    output += `${indent()}\\end{mdframed}\n`;
    output += `\\end{minipage}\n`;
    output += `\n`;

    frameOutput += `\\input{${innerDir}/${factor.getId}.tex}\n\n`;

    fs.writeFile(`./${outerDir}/${innerDir}/${factor.getId}.tex`, `${output}`, (err) => {
        if (err) {
            console.error(`Could not export factor ${factor.getId} to LaTeX`)
        }
    })
}

fs.writeFile(`./${outerDir}/factors-frame.tex`, `${frameOutput}`, (err) => {
    if (err) {
        console.error(`Could not export factor frame to LaTeX`)
    }
})

// Quality Aspects

let qaOutput = "";

for (const highlevelAspect of qualityModel.highLevelAspects) {

    qaOutput += `\\subsection{${highlevelAspect.getName}}\n\\label{sec:qualitymodel:qualityaspects:${highlevelAspect.getId}}\n\n`;

    let qualityAspects = qualityModel.qualityAspects.filter(qa => qa.getHighLevelAspectKey === highlevelAspect.getId);
    // filter out aspects without any impacts
    qualityAspects = qualityAspects.filter(qualityAspect => qualityModel.impacts.some(impact => impact.getImpactedFactor.getId === qualityAspect.getId));

    for (const qualityAspect of qualityAspects) {

        if (["simplicity", "elasticity"].includes(qualityAspect.getId)) {
            qaOutput += `\\definitionown{${qualityAspect.getName}}{${qualityAspect.getDescription}}\n\n`;
        } else {
            qaOutput += `\\definitioncited{${qualityAspect.getName}}{${qualityAspect.getDescription}}{\\cite{ISO/IEC2014}}\n\n`;
        }
    }
}

fs.writeFile(`./${outerDir}/qualityAspects.tex`, `${qaOutput}`, (err) => {
    if (err) {
        console.error(`Could not export quality aspects to LaTeX`)
    }
})

// Entitites

let entitiesTableOutput = "";

for (const entity of qualityModel.entities) {
    entitiesTableOutput += `        ${entity.getName} (${entity.getSymbol}) & ${entity.getDescription} & ${entity.getRelation.type} ${entity.getRelation.target}\\\\\ \\hline \n`;
}

entitiesTableOutput = `
\\begin{table}[h]
	\\caption{Entities of the modeling approach, adopted from \\cite{Lichtenthaeler2024}}
	\\label{tab:results:qualitymodel:entities}
    \\fontsize{12}{14}\\selectfont
	\\begin{tabular}{p{0.15\\textwidth}|p{0.6\\textwidth}|p{0.15\\textwidth}}
		\\textbf{Name}         & \\textbf{Description}  & \\textbf{Relation}  \\\\\ \\hline
        ${entitiesTableOutput}
	\\end{tabular}%
\\end{table}
`;

function prepareForTex(formalSpec: string) {
    return formalSpec.replaceAll("_", "\\_")
                     .replaceAll("{", "\\{")
                     .replaceAll("}", "\\}")
                     .replaceAll("∪", "\\cup ")
                     .replaceAll("⊆", "\\subseteq")
                     .replaceAll("→", "\\rightarrow")
                     .replaceAll("ℕ", "\\mathbb{N}")
                     .replaceAll("∈", "\\in")
                     .replaceAll("∉", "\\notin")
                     .replaceAll("⨯", "\\times ")
                     .replaceAll("≠", "\\neq")
                     .replaceAll("\t", "")
                     .replaceAll("\n", "$\n$")
                     .replaceAll("<sub>", "_{")
                     .replaceAll("</sub>", "}");
}

let entitiesListing1Output = "";

for (const entity of qualityModel.entities.filter(entity => ["system","dataAggregate","backingData","network"].includes(entity.getKey))) {

    let formalSpecification = prepareForTex(entity.getFormalSpecification);
 
    let latexSpec = "";
    let parts = formalSpecification.split("\n");

    if (parts.length > 1) {
        latexSpec = `#${entity.getName}\n`;
        latexSpec += `$${parts.join("\n")}$\n\n`
    } else {
        latexSpec = `#${entity.getName}\n$${formalSpecification}$ \n`;
    }

    entitiesListing1Output += latexSpec;
}

entitiesListing1Output = `
\\begin{lstlisting}[float=h,caption={Formal specifiation of entities - I},label=lst:results:qualitymodel:entities1,mathescape=true]
${entitiesListing1Output}
\\end{lstlisting}
`;

let entitiesListing2Output = "";

for (const entity of qualityModel.entities.filter(entity => ["component","service","backingService","storageBackingService","proxyBackingService","brokerBackingService","endpoint","externalEndpoint","artifact"].includes(entity.getKey))) {

    let formalSpecification = prepareForTex(entity.getFormalSpecification);
 
    let latexSpec = "";
    let parts = formalSpecification.split("\n");

    if (parts.length > 1) {
        latexSpec = `#${entity.getName}\n`;
        latexSpec += `$${parts.join("\n")}$\n\n`
    } else {
        latexSpec = `#${entity.getName}\n$${formalSpecification}$ \n`;
    }

    entitiesListing2Output += latexSpec;
}

entitiesListing2Output = `
\\begin{lstlisting}[float=h,caption={Formal specifiation of entities - II},label=lst:results:qualitymodel:entities2,mathescape=true]
${entitiesListing2Output}
\\end{lstlisting}
`;

let entitiesListing3Output = "";

for (const entity of qualityModel.entities.filter(entity => ["link","requestTrace","infrastructure","deploymentMapping"].includes(entity.getKey))) {

    let formalSpecification = prepareForTex(entity.getFormalSpecification);
 
    let latexSpec = "";
    let parts = formalSpecification.split("\n");

    if (parts.length > 1) {
        latexSpec = `#${entity.getName}\n`;
        latexSpec += `$${parts.join("\n")}$\n\n`
    } else {
        latexSpec = `#${entity.getName}\n$${formalSpecification}$ \n`;
    }

    entitiesListing3Output += latexSpec;
}

entitiesListing3Output = `
\\begin{lstlisting}[float=h,caption={Formal specifiation of entities - III},label=lst:results:qualitymodel:entities3,mathescape=true]
${entitiesListing3Output}
\\end{lstlisting}
`;


fs.writeFile(`./${outerDir}/entities.tex`, `${entitiesTableOutput}\n${entitiesListing1Output}\n${entitiesListing2Output}\n${entitiesListing3Output}`, (err) => {
    if (err) {
        console.error(`Could not export entities to LaTeX`)
    }
})

// Entity properties

let componentPropertyKeys = getComponentProperties().map(property => property.getKey);
let endpointPropertyKeys = getEndpointProperties().map(property => property.getKey);
let entityProperties: { name: string, properties: EntityProperty[] }[] = [
    {
        name: "Component",
        properties: getComponentProperties()
    },
    {
        name: "Service",
        properties: getServiceProperties().filter(prop => !componentPropertyKeys.includes(prop.getKey))
    },
    {
        name: "Backing Service",
        properties: getBackingServiceProperties().filter(prop => !componentPropertyKeys.includes(prop.getKey))
    },
    {
        name: "Storage Backing Service",
        properties: getStorageBackingServiceProperties().filter(prop => !componentPropertyKeys.includes(prop.getKey))
    },
    {
        name: "Proxy Backing Service",
        properties: getProxyBackingServiceProperties().filter(prop => !componentPropertyKeys.includes(prop.getKey))
    },
    {
        name: "Broker Backing Service",
        properties: getBrokerBackingServiceProperties().filter(prop => !componentPropertyKeys.includes(prop.getKey))
    },
    {
        name: "Endpoint",
        properties: getEndpointProperties()
    },
    {
        name: "External Endpoint",
        properties: getExternalEndpointProperties().filter(prop => !endpointPropertyKeys.includes(prop.getKey))
    },
    {
        name: "Link",
        properties: getLinkProperties()
    },
    {
        name: "Infrastructure",
        properties: getInfrastructureProperties()
    },
    {
        name: "Deployment Mapping",
        properties: getDeploymentMappingProperties()
    },
    {
        name: "Request Trace",
        properties: getRequestTraceProperties()
    },
    {
        name: "Data Aggregate",
        properties: getDataAggregateProperties()
    },
    {
        name: "Backing Data",
        properties: getBackingDataProperties()
    },
    {
        name: "Network",
        properties: getNetworkProperties()
    },
];


//TODO per entity?

let entityPropertiesOutput = "";

for (const properties of entityProperties) {
    if (properties.properties.length > 0) {
        let noOfProperties = properties.properties.length;
        entityPropertiesOutput += `\\multirow[b]{${noOfProperties}}{*}{${properties.name}}`;
    
        for (const [i,property] of properties.properties.entries()) {
            let lineType = i === noOfProperties-1 ? "\\hline" : "\\cline{2-4}";

            let dataTypeDesc = property.getDataType === "select" ? (property as SelectEntityProperty).getOptions.map(option => option.text).join(", ") : property.getDataType;


            entityPropertiesOutput += `& ${property.getKey}  &  ${property.getDescription} & ${dataTypeDesc}  \\\\\ ${lineType}\n`;
        }
    }
}

let entityPropertiesTableOutput = `
\\begin{table}[h]
	\\caption{Entities properties}
	\\label{tab:results:qualitymodel:entity-properties}
	\\fontsize{8}{10}\\selectfont
	\\begin{tabularx}{\\linewidth}{llXX}
		\\textbf{Entity} & \\textbf{Property key}         & \\textbf{Description} & \\textbf{Value}   \\\\\ \\hline
        ${entityPropertiesOutput.replaceAll("_", "\\_")}
	\\end{tabularx}%
\\end{table}
`;


fs.writeFile(`./${outerDir}/entityProperties.tex`, `${entityPropertiesTableOutput}`, (err) => {
    if (err) {
        console.error(`Could not export entity properties to LaTeX`)
    }
})