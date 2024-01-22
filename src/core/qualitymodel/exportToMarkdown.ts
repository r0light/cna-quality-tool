// This script is not intended to be used within the web app, but locally to generate a nice looking markdown representation of the quality model.

import * as fs from 'fs';
import { getQualityModel } from './QualityModelInstance';
import { ProductFactor} from './quamoco/ProductFactor';
import { QualityAspect } from './quamoco/QualityAspect';

const qualityModel = getQualityModel();

let output = "";

output += "## Entities which describe a software architecture that the quality model can be applied on\n\n";

let longestEntityName = Math.max(...qualityModel.entities.map(entity => entity.getName.length));
let longestEntityDescription = Math.max(...qualityModel.entities.map(entity => entity.getDescription.length));
let longestRelationString = Math.max(...qualityModel.entities.map(entity => entity.getRelation.type.length)) + longestEntityName + 1;

output += `| Name${" ".repeat(longestEntityName - 4)} | Description${" ".repeat(longestEntityDescription - 11)} | Relation${" ".repeat(longestRelationString - 8)} |\n`;
output += `|${"-".repeat(longestEntityName + 2)}|${"-".repeat(longestEntityDescription + 2)}|${"-".repeat(longestRelationString + 2)}|\n`;
for (const entity of qualityModel.entities) {
    let nameString = `${entity.getName}${" ".repeat(longestEntityName - entity.getName.length)}`
    let descriptionString = `${entity.getDescription}${" ".repeat(longestEntityDescription - entity.getDescription.length)}`
    let relationString = entity.getRelation.type ? `${entity.getRelation.type} ${qualityModel.entities.find(other => other.getKey === entity.getRelation.target).getName}`: "";
    output += `| ${nameString} | ${descriptionString} | ${relationString}${" ".repeat(longestRelationString - relationString.length)} |\n`;
}
output += "\n"



output += "## Quality aspects (high-level) and product factors (tangible in the software)\n\n";

const spacesForIndentation = 2;
const indentation = " ".repeat(spacesForIndentation);
let indentationLevel = 0;

function indent() {
    return indentation.repeat(indentationLevel);
}

function printAdditionalImpacts(factor: ProductFactor, currentImpactedFactor: ProductFactor | QualityAspect) {
    let printedImpacts = "";
    if (factor.getImpactedFactors().length > 1) {
        printedImpacts += factor.getOutgoingImpacts.filter(impact => impact.getImpactedFactor.getId !== currentImpactedFactor.getId).map(impact => ` ${impact.getImpactType}> ${impact.getImpactedFactor.getName}`).join("");
    }
    return printedImpacts;
}

for (const highLevelAspect of qualityModel.highLevelAspects) {

    output += `### ${highLevelAspect.getName}\n\n`;

    const subAspects = qualityModel.qualityAspects.filter(aspect => aspect.getHighLevelAspectKey === highLevelAspect.getId);

    for (const qualityAspect of subAspects) {

        output += `* ${qualityAspect.getName}  \n  *${qualityAspect.getDescription}*\n`;

        function addImpactingFactors(currentFactor: QualityAspect | ProductFactor) {
            let impactingFactors = currentFactor.getImpactingFactors();
            // only add impacting factors if there are any and 
            if (impactingFactors.length > 0) {
                indentationLevel += 1;
                for (const factor of impactingFactors) {
                    // only print if the currentFactor is the main impacted factor, e.g. it comes first in list of impacted factors of this factor (to avoid duplicates in the output)
                    if (factor.getImpactedFactors()[0].getId === currentFactor.getId) {
                        let relevantEntities = factor.getRelevantEntities.length === 0 ? "" : ` (${factor.getRelevantEntities.map(entityKey => qualityModel.findEntity(entityKey).getName).join(", ")})`;
                        let additionalImpacts = printAdditionalImpacts(factor, currentFactor);
                        output += `${indent()}* **${factor.getName}**${relevantEntities}${additionalImpacts}  \n`
                        output += `${indent()}  *${factor.getDescription}*  \n`;
                        if (factor.getSources.length > 0) {
                            let sourcesString = factor.getSources.map(source => {
                                let keyString = "";
                                if (source.getUrl) {
                                    keyString += `[${source.getKey}](${source.getUrl})`;
                                } else {
                                    keyString += source.getKey;
                                }
                                return keyString.concat(` ${source.getInfo}`)
                            }).join("; ");
                            output += `${indent()}  ${sourcesString}\n`;
                        }
                        indentationLevel += 1;
                        for (const measure of factor.getMeasures) {
                            let measureSources = measure.getSources.map(source => {
                                return source.getUrl ? `[${source.getKey}](${source.getUrl})` : source.getKey;
                            })
                            output += `${indent()}* *${measure.getName}* (${measureSources.join("; ")})\n`;
                        }
                        indentationLevel -= 1;
                        addImpactingFactors(factor);
                    }
                }
                indentationLevel -= 1;
            }
        }

        addImpactingFactors(qualityAspect);
    }

    output += `\n`;
}

fs.writeFile(`../../../cna-quality-model.md`, `# A Quality Model for Cloud-native Software Architectures\n\n${output}`, (err) => {
    if (err) {
        console.error(`Could not export quality model to markdown`)
    }
})