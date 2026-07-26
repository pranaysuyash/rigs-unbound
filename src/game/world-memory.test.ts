import { describe, expect, it } from "vitest";
import { deriveSoilDisplacement, soilCellOf } from "./world-memory";
import { createInitialState } from "./state";

describe("World Memory Soil Displacement System", () => {
  it("converts world coordinates to soil cell coordinates", () => {
    const [cx, cz] = soilCellOf(16, -24);
    expect(cx).toBe(4);
    expect(cz).toBe(-6);
  });

  it("derives displacement map from furrow marks in state", () => {
    const state = createInitialState("test-seed");
    state.furrows.push(
      { x: 10, z: 20, heading: 0, createdAt: 100, rigId: "utility-tractor" },
      { x: 10, z: 20, heading: 0, createdAt: 101, rigId: "utility-tractor" },
    );

    const map = deriveSoilDisplacement(state);
    expect(map.size).toBeGreaterThan(0);

    const cell = map.get("2,5");
    expect(cell).toBeDefined();
    expect(cell?.depth).toBeGreaterThan(0.12);
    expect(cell?.surfaceOverride).toBe("tilled");
  });
});
