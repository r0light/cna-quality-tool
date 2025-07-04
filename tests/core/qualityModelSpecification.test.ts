import { expect, test } from "vitest";
import { qualityModel } from "@/core/qualitymodel/specifications/qualitymodel";

const qualityModelSpecification = qualityModel;

test.each(Object.entries(qualityModelSpecification.productFactors).map(([key, value]) => value))("applicable entities should match target entities", (productFactor) => {
    console.log(productFactor);

    let applicableEntities = new Set(productFactor.applicableEntities);

    let entitiesTargetedByEvaluation = new Set(productFactor.evaluations.flatMap(evaluation => evaluation.targetEntities));

    expect(applicableEntities.difference(entitiesTargetedByEvaluation).size, `all applicable entities should be targeted by evaluation for ${productFactor.name}`).toBe(0);
    expect(entitiesTargetedByEvaluation.difference(applicableEntities).size, `all targeted entities should be in applicable entities for ${productFactor.name}`).toBe(0);

});