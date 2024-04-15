import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { expect, test } from "vitest";

test("quality model specification is correct", () => {

    let qualityModel = getQualityModel();
    expect(qualityModel).toBeDefined();
})