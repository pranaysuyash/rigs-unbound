import { describe, expect, it } from "vitest";
import {
  advanceFieldCondition,
  createFieldConditionCell,
  disturbFieldCondition,
  recoverFieldConditionCell,
} from "./field-conditions";

describe("persistent field conditions", () => {
  it("keeps drainage, soil strength, and ecological recovery on one remembered cell", () => {
    const seed = createFieldConditionCell(12, -18, 0.7);
    const worked = disturbFieldCondition(seed, 0.5);
    const drained = advanceFieldCondition(worked, 3, 0, 0.24);

    expect(worked.vegetationCoverage).toBeLessThan(seed.vegetationCoverage);
    expect(drained.moistureRatio).toBeLessThan(worked.moistureRatio);
    expect(drained.soilShearStrengthKpa).toBeGreaterThan(
      worked.soilShearStrengthKpa,
    );
  });

  it("rejects malformed spatial memory while accepting bounded durable cells", () => {
    expect(recoverFieldConditionCell({ cx: 2, cz: -3, moistureRatio: 0.5 })).toMatchObject({
      cx: 2,
      cz: -3,
      moistureRatio: 0.5,
    });
    expect(recoverFieldConditionCell({ cx: "bad", cz: 0 })).toBeNull();
  });
});
