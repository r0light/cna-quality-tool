import { getAvailableArtifactTypes } from "@/core/common/artifact";
import { expect, test } from "vitest";

test("artifact types are parsed from profiles", () => {

    let artifactTypes = getAvailableArtifactTypes();
    expect(artifactTypes.length).toBeGreaterThan(0);
})