import { getValidPropertyValues } from "@/core/common/helpers";
import { expect, test } from "vitest";


test("valid options are read correctly from parsed profile", () => {

    let validOptions = getValidPropertyValues("node", "cna-modeling.entities.Component", "software_type");
    expect(validOptions.length).toBeGreaterThan(0);
})