// This script is not intended to be used within the web app, but locally to generate a nice looking markdown representation of the quality model.

import * as fs from 'fs';
import { getQualityModel } from './QualityModelInstance.js';
import { ProductFactor } from './quamoco/ProductFactor.js';
import { QualityAspect } from './quamoco/QualityAspect.js';
import { ImpactType } from './quamoco/Impact.js';

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

fs.mkdirSync(`./${outerDir}/${innerDir}`, { recursive: true});

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
             qaOutput +=  `\\definitionown{${qualityAspect.getName}}{${qualityAspect.getDescription}}\n\n`;
        } else {
            qaOutput +=  `\\definitioncited{${qualityAspect.getName}}{${qualityAspect.getDescription}}{\\cite{ISO/IEC2014}}\n\n`;
        }
    }
}

fs.writeFile(`./${outerDir}/qualityAspects.tex`, `${qaOutput}`, (err) => {
    if (err) {
        console.error(`Could not export quality aspects to LaTeX`)
    }
})