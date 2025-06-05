// This script is not intended to be used within the web app, but locally to generate a nice looking markdown representation of the quality model.

import * as fs from 'fs';
import { getQualityModel } from './QualityModelInstance.js';
import { ImpactType } from './quamoco/Impact.js';
import { getBackingDataProperties, getBackingServiceProperties, getBrokerBackingServiceProperties, getComponentProperties, getDataAggregateProperties, getDeploymentMappingProperties, getEndpointProperties, getExternalEndpointProperties, getInfrastructureProperties, getLinkProperties, getNetworkProperties, getProxyBackingServiceProperties, getRequestTraceProperties, getServiceProperties, getStorageBackingServiceProperties, Infrastructure, Link, Network, ProxyBackingService, RequestTrace, Service, StorageBackingService } from '../entities.js';
import { EntityProperty, SelectEntityProperty } from '../common/entityProperty.js';
import { ENTITIES } from './specifications/entities.js';
import { getArtifactTypeProperties } from '../common/artifact.js';
import { Measure } from './quamoco/Measure.js';
import { MeasureKey, ProductFactorKey, qualityModel, QualityModelSpec } from './specifications/qualitymodel.js';
import { QualityAspect } from './quamoco/QualityAspect.js';
import { ProductFactor } from './quamoco/ProductFactor.js';

const specifiedQualityModel = qualityModel as QualityModelSpec;
const qualityModelInstance = getQualityModel();

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

// Product Factors for LaTeX

let factorCommands = "";

for (const factor of qualityModelInstance.productFactors) {

    let output = "";

    let categories = factor.getCategories.map(categoryKey => qualityModelInstance.factorCategories.find(category => category.categoryKey === categoryKey).categoryName).join(", ");

    output += `\\begin{minipage}{\\textwidth}\n`;
    output += `${indent()}\\begin{mdframed}[backgroundcolor=black!6]\n`;
    output += `${indent(2)}\\refstepcounter{productfactor}\\label{productfactor:${factor.getId}}\n`;
    output += `${indent(2)}Factor \\textbf{${factor.getName}}\\\\\n`;
    output += `${indent(2)}\\textit{${factor.getDescription}}\\\\\n`;
    output += `${indent(2)}Categories: ${categories}\\\\\n`;
    output += `${indent(2)}Impacts:\n`;
    for (const impact of factor.getOutgoingImpacts) {
        let labelPrefix = impact.getImpactedFactor.getFactorType === 'qualityAspect' ? "qualityaspect" : "productfactor";
        let impactDesc = `${getImpactSymbol(impact.getImpactType)}  \\textbf{\\hyperref[${labelPrefix}:${impact.getImpactedFactor.getId}]{${impact.getImpactedFactor.getName}}}`;
        output += `${indent(2)}${impactDesc}\n`;
    }
    output += `${indent(2)}\\`;
    if (factor.getIncomingImpacts.length > 0) {
        output += `\\`;
        output += `${indent(2)}Impacted by:\n`;
        let impactedBy = [];
        for (const impact of factor.getIncomingImpacts) {
            let labelPrefix = impact.getSourceFactor.getFactorType === 'productFactor' ? "productfactor" : "??";
            let impactDesc = `\\textbf{\\hyperref[${labelPrefix}:${impact.getSourceFactor.getId}]{${impact.getSourceFactor.getName}}}`;
            impactedBy.push(impactDesc);
        }
        output += `${indent(2)}${impactedBy.join(", ")}\n\\`;
    }
    if (factor.getSources.length > 0) {
        output += `\\`;
        output += `${indent(2)}Read more:\n`;
        for (const source of factor.getSources) {
            let sourceDesc = `\\cite{${source.getKey}} ${source.getInfo}`;
            output += `\\\\${indent(2)}${sourceDesc}\n`;
        }
    }
    let uniqueMeasures = new Map<string, Measure>();
    factor.getAllEvaluations().flatMap(evaluation => evaluation.getEvaluationDetails.getUsedMeasures).forEach(measure => uniqueMeasures.set(measure.getId, measure));
    let measuresForFactor = [...uniqueMeasures.values()];
    if (measuresForFactor.length > 0) {
        output += `\\\\`;
        output += `${indent(2)}Measure(s) used for evaluation:\n`;
        for (const measure of measuresForFactor) {
            //let measureDesc = `\\textbf{${measure.getName}}`;
            let measureDesc = `\\${measure.getId}`;
            //TODO add hyperref to measure
            output += `\\\\${indent(2)}${measureDesc}\n`;
        }
    }
    output += `${indent()}\\end{mdframed}\n`;
    output += `\\end{minipage}\n`;
    output += `\n`;

    factorCommands += `\\newglossaryentry{${factor.getId}}{name=${factor.getName},description={}}\n`
    factorCommands += `\\newcommand\\${factor.getId}{\\hyperref[productfactor:${factor.getId}]{\\gls{${factor.getId}}}}\n`
    frameOutput += `\\input{${innerDir}/${factor.getId}.tex}\n\n`;

    fs.writeFile(`./${outerDir}/${innerDir}/${factor.getId}.tex`, `${output}`, (err) => {
        if (err) {
            console.error(`Could not export factor ${factor.getId} to LaTeX`)
        }
    })
}

fs.writeFile(`./${outerDir}/factors-frame.tex`, `\\newcounter{productfactor}\n\n${factorCommands}\n\n${frameOutput}`, (err) => {
    if (err) {
        console.error(`Could not export factor frame to LaTeX`)
    }
})

// Product Factors as CSV

const factorSimpleFieldHeaders = ["id", "name"];
const factorEntitiesHeaders = Object.values(ENTITIES);
const factorCategoryHeaders = qualityModelInstance.factorCategories.map(category => category.categoryKey);
const factorQualityAspectHeaders = Object.entries(qualityModel.qualityAspects).flatMap(([hlaKey, hla]) => Object.keys(hla.aspects));

const exportFactorsAsCSV = [
    factorSimpleFieldHeaders.concat(factorEntitiesHeaders).concat(factorCategoryHeaders).concat(factorQualityAspectHeaders).join(';'), // header row first
    ...qualityModelInstance.productFactors.map(factor => {
        let simpleValues = [factor.getId, factor.getName];
        let entitiesValues = factorEntitiesHeaders.map(entityKey => factor.getApplicableEntities.includes(entityKey) ? "1" : "0");
        let categoriesValues = factorCategoryHeaders.map(categoryKey => factor.getCategories.includes(categoryKey) ? "1" : "0");

        let qualityAspects = [];
        let search: (QualityAspect | ProductFactor)[] = qualityModelInstance.findProductFactor(factor.getId).getImpactedFactors();
        while (search.length > 0) {
            let current = search[0];
            if (current.getFactorType === "productFactor") {
                search.push(...current.getImpactedFactors());
            }
            if (current.getFactorType === "qualityAspect") {
                qualityAspects.push(current.getId);
            }
            search.splice(0, 1);
        }
        
        let qualityAspectValues = factorQualityAspectHeaders.map(qaKey => qualityAspects.includes(qaKey) ? "1" : "0");
        
        return simpleValues.concat(entitiesValues).concat(categoriesValues).concat(qualityAspectValues).join(";")
    })
].join('\n');

fs.writeFile(`./${outerDir}/productFactors.csv`, `${exportFactorsAsCSV}`, (err) => {
    if (err) {
        console.error(`Could not export product factors to CSV`)
    }
})

// Categories as CSV

const categorySimpleFieldHeaders = ["key", "name"];

const categoriesAsCSV = [
    categorySimpleFieldHeaders.join(';'), // header row first
    ...qualityModelInstance.factorCategories.map(category => {
        let simpleValues = [category.categoryKey, category.categoryName];
        
        return simpleValues.join(";")
    })
].join('\n');

fs.writeFile(`./${outerDir}/categories.csv`, `${categoriesAsCSV}`, (err) => {
    if (err) {
        console.error(`Could not export categories to CSV`)
    }
})

// Quality Aspects

// Quality Aspects for LaTeX

let qaOutput = "\\newcounter{qualityaspect}\n\n";
let qaCommands = "";

for (const highlevelAspect of qualityModelInstance.highLevelAspects) {

    qaOutput += `\\subsection{${highlevelAspect.getName}}\n\\label{sec:qualitymodel:qualityaspects:${highlevelAspect.getId}}\n\n`;

    let qualityAspects = qualityModelInstance.qualityAspects.filter(qa => qa.getHighLevelAspectKey === highlevelAspect.getId);
    // filter out aspects without any impacts
    qualityAspects = qualityAspects.filter(qualityAspect => qualityModelInstance.impacts.some(impact => impact.getImpactedFactor.getId === qualityAspect.getId));

    for (const qualityAspect of qualityAspects) {

        qaOutput += `\\refstepcounter{qualityaspect}\\label{qualityaspect:${qualityAspect.getId}}\n`;
        if (["simplicity", "elasticity"].includes(qualityAspect.getId)) {
            qaOutput += `\\definitionown{${qualityAspect.getName}}{${qualityAspect.getDescription}}\n\n`;
        } else {
            qaOutput += `\\definitioncited{${qualityAspect.getName}}{${qualityAspect.getDescription}}{\\cite{ISO/IEC2014}}\n\n`;
        }
        qaCommands += `\\newcommand\\${qualityAspect.getId}{\\hyperref[qualityaspect:${qualityAspect.getId}]{${qualityAspect.getName}}}\n`;
    }
}

fs.writeFile(`./${outerDir}/qualityAspects.tex`, `${qaOutput}\n\n${qaCommands}`, (err) => {
    if (err) {
        console.error(`Could not export quality aspects to LaTeX`)
    }
})

//  Quality Aspects as CSV

const qaSimpleFieldHeaders = ["id", "name", "highLevelAspect"];

const exportQualityAspectsAsCSV = [
    qaSimpleFieldHeaders.join(';'), // header row first
    ...qualityModelInstance.qualityAspects.map(qa => {
        let simpleValues = [qa.getId, qa.getName, qa.getHighLevelAspectKey];

        return simpleValues.join(";")
    })
].join('\n');

fs.writeFile(`./${outerDir}/qualityAspects.csv`, `${exportQualityAspectsAsCSV}`, (err) => {
    if (err) {
        console.error(`Could not export quality aspects to CSV`)
    }
})
// Highlevel Quality Aspects as CSV

const hqaSimpleFieldHeaders = ["id", "name" ];

const exportHighlevelQualityAspectsAsCSV = [
    hqaSimpleFieldHeaders.join(';'), // header row first
    ...qualityModelInstance.highLevelAspects.map(qa => {
        let simpleValues = [qa.getId, qa.getName];

        return simpleValues.join(";")
    })
].join('\n');

fs.writeFile(`./${outerDir}/highlevelQualityAspects.csv`, `${exportHighlevelQualityAspectsAsCSV}`, (err) => {
    if (err) {
        console.error(`Could not export highlevel quality aspects to CSV`)
    }
})

// Entitites

// Entities as LaTeX

let entityCommandsOutput = "\\newcounter{entity} \n";
let entitiesTableOutput = "";

for (const entity of qualityModelInstance.entities) {
    entitiesTableOutput += `    \\refstepcounter{entity}\\label{entity:${entity.getKey}}
    ${entity.getName} (${entity.getSymbol}) & ${entity.getDescription} & ${entity.getRelation.type} ${entity.getRelation.target}\\\\\ \\hline \n`;
    entityCommandsOutput += `\\newcommand\\${entity.getKey}{\\hyperref[entity:${entity.getKey}]{${entity.getName}}} \n`;
}

entitiesTableOutput = `
${entityCommandsOutput}

\\begin{table}[h]
	\\caption{Entities of the quality model}
	\\label{tab:results:qualitymodel:entities}
    \\fontsize{11}{13}\\selectfont
	\\begin{tabular}{p{0.22\\textwidth}|p{0.55\\textwidth}|p{0.18\\textwidth}}
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

let entitiesListingOutput = "";
let entityKeys2 = ["system", "dataAggregate", "bakingData", "network", "component", "service", "backingService", "storageBackingService", "proxyBackingService", "brokerBackingService", "endpoint", "externalEndpoint", "artifact", "link", "requestTrace", "infrastructure", "deploymentMapping"];
let entityKeys: ENTITIES[] = [ENTITIES.SYSTEM, ENTITIES.DATA_AGGREGATE, ENTITIES.BACKING_DATA, ENTITIES.NETWORK, ENTITIES.COMPONENT, ENTITIES.SERVICE, ENTITIES.BACKING_SERVICE, ENTITIES.STORAGE_BACKING_SERVICE, ENTITIES.PROXY_BACKING_SERVICE, ENTITIES.BROKER_BACKING_SERVICE, ENTITIES.ENDPOINT, ENTITIES.EXTERNAL_ENDPOINT, ENTITIES.ARTIFACT, ENTITIES.LINK, ENTITIES.REQUEST_TRACE, ENTITIES.INFRASTRUCTURE, ENTITIES.DEPLOYMENT_MAPPING];

for (const entityKey of entityKeys) {
    let entity = qualityModelInstance.entities.find(entity => entity.getKey === entityKey);
    let formalSpecification = prepareForTex(entity.getFormalSpecification);

    let latexSpec = "";
    let parts = formalSpecification.split("\n");

    if (parts.length > 1) {
        latexSpec += `$${parts.join("\n")}$\n\n`
    } else {
        latexSpec = `$${formalSpecification}$ \n`;
    }

    entitiesListingOutput += latexSpec;
}

entitiesListingOutput = `
\\begin{lstlisting}[float=h,caption={Formal specifiation of entities},label=lst:results:qualitymodel:entities,mathescape=true]
${entitiesListingOutput}
\\end{lstlisting}
`;

fs.writeFile(`./${outerDir}/entities.tex`, `${entitiesTableOutput}\n${entitiesListingOutput}`, (err) => {
    if (err) {
        console.error(`Could not export entities to LaTeX`)
    }
})

// Entities as CSV

const entitySimpleFieldHeaders = ["key", "name", "symbol"];

const exportEntitiesAsCSV = [
    entitySimpleFieldHeaders.join(';'), // header row first
    ...qualityModelInstance.entities.map(entity => {
        let simpleValues = [entity.getKey, entity.getName, entity.getSymbol];

        return simpleValues.join(";")
    })
].join('\n');

fs.writeFile(`./${outerDir}/entities.csv`, `${exportEntitiesAsCSV}`, (err) => {
    if (err) {
        console.error(`Could not export entities to CSV`)
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
    {
        name: "Artifact",
        properties: getArtifactTypeProperties("CNA.Artifact")
    }
];


//TODO per entity?

let entityPropertiesOutput = "";

for (const properties of entityProperties) {
    if (properties.properties.length > 0) {
        let noOfProperties = properties.properties.length;
        entityPropertiesOutput += `\\multirow[b]{${noOfProperties}}{*}{${properties.name}}`;

        for (const [i, property] of properties.properties.entries()) {
            let lineType = i === noOfProperties - 1 ? "\\hline" : "\\cline{2-4}";

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


// Measures

// prepare dataset 

type LatexMeasure = {
    id: String,
    name: String,
    formula: String,
    status: "IN USE" | "IMPLEMENTED" | "UNSUPPORTED",
    functions: string[],
    entities: ENTITIES[],
    factorKey: String,
    sources: String[],
    qualityAspects: String[]
}

let measuresToExport: LatexMeasure[] = [];

for (const [measureKey, measure] of Object.entries(specifiedQualityModel.measures)) {

    let productFactor = Object.entries(specifiedQualityModel.productFactors).find(([factorKey, factor]) => factor.measures.includes(measureKey as MeasureKey));
    let status: "IN USE" | "IMPLEMENTED" | "UNSUPPORTED" = "UNSUPPORTED";
    if (qualityModelInstance.findMeasure(measure.applicableEntities[0], measureKey as MeasureKey).isCalculationAvailable()) {
        status = "IMPLEMENTED";
    }

    if (productFactor[1].evaluations.some(evaluation => evaluation.measures.includes(measureKey as MeasureKey))) {
        status = "IN USE";
    }
    let qualityAspects = [];
    let search: (QualityAspect | ProductFactor)[] = qualityModelInstance.findProductFactor(productFactor[0] as ProductFactorKey).getImpactedFactors();
    while (search.length > 0) {
        let current = search[0];
        if (current.getFactorType === "productFactor") {
            search.push(...current.getImpactedFactors());
        }
        if (current.getFactorType === "qualityAspect") {
            qualityAspects.push(current.getId);
        }
        search.splice(0, 1);
    }

    measuresToExport.push({
        id: measureKey,
        name: measure.name,
        formula: measure.calculationFormula === "" ? "n/a" : measure.calculationFormula,
        functions: measure.helperFunctions,
        status: status,
        entities: measure.applicableEntities,
        factorKey: productFactor[0],
        sources: measure.sources,
        qualityAspects: qualityAspects
    })
}

function compareFactorKey(measureA: LatexMeasure, measureB: LatexMeasure) {
    if (measureA.factorKey < measureB.factorKey)
        return -1;
    if (measureA.factorKey > measureB.factorKey)
        return 1;
    return 0;
}

function compareSource(measureA: LatexMeasure, measureB: LatexMeasure) {
    let aNew = measureA.sources.includes("new");
    let bNew = measureB.sources.includes("new");
    if (!aNew && bNew)
        return -1;
    if (aNew && !bNew)
        return 1;
    return 0;
}

measuresToExport = measuresToExport.sort(compareFactorKey).sort(compareSource);

const simpleFieldHeaders = ["id", "name", "status", "factorKey"];
const sourceHeader = ["sourceType"];
const entitiesHeaders = Object.values(ENTITIES);
const qualityAspectsHeaders = Object.entries(qualityModel.qualityAspects).flatMap(([hlaKey, hla]) => Object.keys(hla.aspects));
const exportMeasuresAsCSV = [
    simpleFieldHeaders.concat(sourceHeader).concat(entitiesHeaders).concat(qualityAspectsHeaders).join(';'), // header row first
    ...measuresToExport.map(row => {
        let simpleValues = simpleFieldHeaders.map(fieldName => JSON.stringify(row[fieldName]));
        let sourceValue = [row.sources.includes("new") ? "new" : "existing"];
        let entitiesValues = entitiesHeaders.map(entityKey => row.entities.includes(entityKey) ? "1" : "0");
        let qualityAspectsValues = qualityAspectsHeaders.map(qualityAspectKey => row.qualityAspects.includes(qualityAspectKey) ? "1" : "0");
        
        return simpleValues.concat(sourceValue).concat(entitiesValues).concat(qualityAspectsValues).join(";")
    })
].join('\n');

fs.writeFile(`./${outerDir}/measures.csv`, `${exportMeasuresAsCSV}`, (err) => {
    if (err) {
        console.error(`Could not export measures to CSV`)
    }
})

let usedMeasuresOutput = measuresToExport.filter(measure => measure.status === "IN USE");
let notUsedMeasuresOutput = measuresToExport.filter(measure => measure.status !== "IN USE");

function formatMeasureForExport(measureToExport: LatexMeasure) {
    let helperFunctions = "";
    if (measureToExport.functions.length > 0) {
        let helpers = measureToExport.functions.map(helper => `\\multicolumn{2}{|p{15.05cm}|}{$\\scriptstyle ${helper} $} \\\\`).join("\n");
        helperFunctions = `
        Functions: & \\\\
        ${helpers}
        `;
    }

    return `\\textbf{${measureToExport.name}} \\refstepcounter{measure}\\label{measure:${measureToExport.id}}  & ${measureToExport.status} \\T \\\\
    Formula: & \\T \\\\
    \\multicolumn{2}{|>{\\centering\\arraybackslash}p{15.05cm}|}{$\\displaystyle ${measureToExport.formula}$} \\T\\B \\\\ ${helperFunctions} \\cline{1-2}
    Applicable Entities: & Associated Factor: \\T \\\\
    ${measureToExport.entities.map(entity => `\\textbf{\\${entity}}`).join(", ")} & \\textbf{\\${measureToExport.factorKey}} \\\\
    Associated Quality Aspects: & Literature Sources: \\T \\\\
    ${measureToExport.qualityAspects.map(qa => `\\textbf{\\${qa}}`).join(", ")} & ${measureToExport.sources.map(source => source === "new" ? source : `\\cite{${source}}`).join(", ")} \\\\ \\hline`;
}

function exportMeasures(measuresToExport: LatexMeasure[], measuresPerTable: number, caption: string) {
    let measuresTableOutput = `
    \\newcommand\\T{\\rule{0pt}{2.6ex}}       % Top strut
    \\newcommand\\B{\\rule[-3ex]{0pt}{0pt}}   % Bottom strut
    
    \\newcounter{measure}
    
    `;
    for (let i = 1; i < measuresToExport.length; i = i + measuresPerTable) {
        let currentMeasures = measuresToExport.slice(i, i + measuresPerTable);

        measuresTableOutput += `
        \\begin{table}[h]
            \\caption{${caption} - ${Math.trunc(i / measuresPerTable) + 1}}
            \\label{tab:results:qualitymodel:${caption.replace(/\s+/g, "").toLocaleLowerCase()}${Math.trunc(i / measuresPerTable) + 1}}
            \\fontsize{10}{12}\\selectfont
            \\begin{tabularx}{\\linewidth}{|Xr|}
                \\hline
                ${currentMeasures.map(formatMeasureForExport).join("\\hline \n")}
            \\end{tabularx}%
        \\end{table}
    `;
        /*if (i % 5 == 0) {
            measuresTableOutput += "\\clearpage"
        }*/
    }
    return measuresTableOutput;
}
function exportMeasureCommands(measuresToExport: LatexMeasure[]) {
    let measureCommandsOutput = "";
    for (let measure of measuresToExport) {
        measureCommandsOutput += `\\newcommand\\${measure.id}{\\hyperref[measure:${measure.id}]{${measure.name}}} \n`;
    }
    return measureCommandsOutput;
}


fs.writeFile(`./${outerDir}/usedMeasures.tex`, `${exportMeasures(usedMeasuresOutput, 4, "Architectural measures")}`, (err) => {
    if (err) {
        console.error(`Could not export measures to LaTeX`)
    }
})

fs.writeFile(`./${outerDir}/usedMeasuresCommands.tex`, `${exportMeasureCommands(usedMeasuresOutput)}`, (err) => {
    if (err) {
        console.error(`Could not export used measure commands to LaTeX`)
    }
})

fs.writeFile(`./${outerDir}/unusedMeasures.tex`, `${exportMeasures(notUsedMeasuresOutput, 4, "Additional architectural measures")}`, (err) => {
    if (err) {
        console.error(`Could not export measures to LaTeX`)
    }
})

fs.writeFile(`./${outerDir}/unusedMeasuresCommands.tex`, `${exportMeasureCommands(notUsedMeasuresOutput)}`, (err) => {
    if (err) {
        console.error(`Could not export used measure commands to LaTeX`)
    }
})