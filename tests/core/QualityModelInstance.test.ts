import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { ProductFactor } from "@/core/qualitymodel/quamoco/ProductFactor";
import { expect, test } from "vitest";


const qualityModel = getQualityModel();

test("quality model specification is correct", () => {

    expect(qualityModel).toBeDefined();
})

test("each leaf factor has at least one implemented measure", () => {

    let impactedFactorIds = qualityModel.impacts.filter(impact => impact.getImpactedFactor.getId).map(impact => impact.getImpactedFactor.getId);

    let leafFactors = qualityModel.productFactors.filter(factor => !impactedFactorIds.includes(factor.getId));

    let noImplementedMeasures = leafFactors.filter(leafFactors => {
        let measures = leafFactors.getAllMeasures();
        return measures.length === 0 || !measures.some(measure => measure.getCalculationDescription.length !== 0);
    })

    expect(noImplementedMeasures.length, `No implemented measures for the following factors: ${noImplementedMeasures.map(measure => measure.getId).join(",")}`).toEqual(0);
})

test("each factor has an evaluation", () =>{

    let factors = new Set(qualityModel.productFactors);

    let evaluatedFactors = new Set(qualityModel.productFactors.filter(factor => factor.getApplicableEntities.every(entity => factor.isEvaluationAvailable(entity))));

    let notEvaluatedFactors = factors.difference(evaluatedFactors);
    
    expect(notEvaluatedFactors.size,`The following factors don't have an evaluation: ${Array.from(notEvaluatedFactors).map(factor => factor.getId).join(", ")}`).toEqual(0);
})

test("each quality aspect has an evaluation", () => {

    let qualityAspectsWithImpactingFactors = new Set(qualityModel.qualityAspects.filter(aspect => aspect.getImpactingFactors.length > 0));

    let evaluatedQualityAspects = new Set(qualityModel.qualityAspects.filter(aspect => aspect.getImpactingFactors.length > 0).filter(aspect => aspect.isEvaluationAvailable()));

    let notEvaluatedQualityAspects = qualityAspectsWithImpactingFactors.difference(evaluatedQualityAspects);

    expect(notEvaluatedQualityAspects.size, `The following quality Aspects don't have an evaluation: ${Array.from(notEvaluatedQualityAspects).map(aspect => aspect.getId).join(", ")}`).toEqual(0);
})
