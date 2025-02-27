// This script is not intended to be used within the web app, but locally to generate a nice looking markdown representation of the quality model.

import * as fs from 'fs';
import { getQualityModel } from './QualityModelInstance.js';
import { ImpactType } from './quamoco/Impact.js';
import { BackingData, BackingService, BrokerBackingService, Component, DataAggregate, DeploymentMapping, Endpoint, ExternalEndpoint, getBackingDataProperties, getBackingServiceProperties, getBrokerBackingServiceProperties, getComponentProperties, getDataAggregateProperties, getDeploymentMappingProperties, getEndpointProperties, getExternalEndpointProperties, getInfrastructureProperties, getLinkProperties, getNetworkProperties, getProxyBackingServiceProperties, getRequestTraceProperties, getServiceProperties, getStorageBackingServiceProperties, Infrastructure, Link, Network, ProxyBackingService, RequestTrace, Service, StorageBackingService } from '../entities.js';
import { EntityProperty } from '../common/entityProperty.js';
import { prop } from 'vue-class-component';

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

let entitiesTableOutput = "";
let entitiesListingOutput = "";

for (const entity of qualityModel.entities) {
    entitiesTableOutput += `        ${entity.getName} & ${entity.getDescription} & ${entity.getRelation.type} ${entity.getRelation.target}\\\\\ \\hline \n`;

    let formalSpecification = entity.getFormalSpecification
        .replaceAll("∪", "\\cup ")
        .replaceAll("⊆", "\\subseteq")
        .replaceAll("→", "\\rightarrow")
        .replaceAll("ℕ", "\\mathbb{N}")
        .replaceAll("∈", "\\in")
        .replaceAll("⨯", "\\times ")
        .replaceAll("\t", "")
        .replaceAll("\n", "$\n$");

    let latexSpec = "";
    let parts = formalSpecification.split("\n");

    if (parts.length > 1) {
        parts[0] = `${parts[0]} #${entity.getName}`;
        latexSpec = `$${parts.join("\n")}$\n`
    } else {
        latexSpec = `$${formalSpecification}$ #${entity.getName}\n`;
    }

    entitiesListingOutput += latexSpec;
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

entitiesListingOutput = `
\\begin{lstlisting}[caption={Formal specifiation of entities},label=lst:results:qualitymodel:entities,mathescape=true]
${entitiesListingOutput}
\\end{lstlisting}
`;


fs.writeFile(`./${outerDir}/entities.tex`, `${entitiesTableOutput}\n${entitiesListingOutput}`, (err) => {
    if (err) {
        console.error(`Could not export entities to LaTeX`)
    }
})

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
    }
];


let entityPropertiesOutput = "";

for (const properties of entityProperties) {
    if (properties.properties.length > 0) {
        let noOfProperties = properties.properties.length;
        entityPropertiesOutput += `\\multirow[b]{${noOfProperties}}{*}{${properties.name}}`;
    
        for (const [i,property] of properties.properties.entries()) {
            let lineType = i === noOfProperties-1 ? "\\hline" : "\\cline{2-5}";
            entityPropertiesOutput += `& ${property.getKey} & ${property.getName} &  ${property.getDescription} & ${property.getDataType}  \\\\\ ${lineType}\n`;
        }
    }
}

let entityPropertiesTableOutput = `
\\begin{table}[h]
	\\caption{Entities properties}
	\\label{tab:results:qualitymodel:entity-properties}
	\\fontsize{8}{10}\\selectfont
	\\begin{tabularx}{\\linewidth}{lllXl}
		\\textbf{Entity} & \\textbf{Property key}         & \\textbf{Property name}  & \\textbf{Description} & \\textbf{Value}   \\\\\ \\hline
        ${entityPropertiesOutput.replaceAll("_", "\\_")}
	\\end{tabularx}%
\\end{table}
`;


fs.writeFile(`./${outerDir}/entityProperties.tex`, `${entityPropertiesTableOutput}`, (err) => {
    if (err) {
        console.error(`Could not export entity properties to LaTeX`)
    }
})