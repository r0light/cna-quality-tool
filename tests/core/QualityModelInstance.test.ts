import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { ProductFactor } from "@/core/qualitymodel/quamoco/ProductFactor";
import { expect, test } from "vitest";

test("quality model specification is correct", () => {

    let qualityModel = getQualityModel();
    expect(qualityModel).toBeDefined();
})

test("each leaf factor has at least one implemented measure", () => {
    let qualityModel = getQualityModel();
    let impactedFactorIds = qualityModel.impacts.filter(impact => impact.getImpactedFactor.getId).map(impact => impact.getImpactedFactor.getId);

    let leafFactors = qualityModel.productFactors.filter(factor => !impactedFactorIds.includes(factor.getId));

    let noImplementedMeasures = leafFactors.filter(leafFactors => {
        let measures = leafFactors.getAllMeasures();
        return measures.length === 0 || !measures.some(measure => measure.getCalculationDescription.length !== 0);
    })

    expect(noImplementedMeasures.length, `No implemented measures for the following factors: ${noImplementedMeasures.map(measure => measure.getId).join(",")}`).toEqual(0);
})

test("each factor has an evaluation", () =>{
    let qualityModel = getQualityModel();
    let factors = new Set(qualityModel.productFactors);

    let evaluatedFactors = new Set(qualityModel.productFactors.filter(factor => factor.getApplicableEntities.every(entity => factor.isEvaluationAvailable(entity))));

    let notEvaluatedFactors = factors.difference(evaluatedFactors);
    
    expect(notEvaluatedFactors.size,`The following factors don't have an evaluation: ${Array.from(notEvaluatedFactors).map(factor => factor.getId).join(", ")}`).toEqual(0);
})

test("each quality aspect has an evaluation", () => {

    let qualityModel = getQualityModel();
    let qualityAspects = new Set(qualityModel.qualityAspects);

    let evaluatedQualityAspects = new Set(qualityModel.qualityAspects.filter(aspect => aspect.isEvaluationAvailable()));

    let notEvaluatedQualityAspects = qualityAspects.difference(evaluatedQualityAspects);

    expect(notEvaluatedQualityAspects.size, `The following quality Aspects don't have an evaluation: ${Array.from(notEvaluatedQualityAspects).map(aspect => aspect.getId).join(", ")}`).toEqual(0);
})