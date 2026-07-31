import { describe, expect, it } from "vitest";
import { deriveHabitatProjection, type HabitatObservation } from "./habitat";

const floodplain: HabitatObservation = {
  terrain: "floodplain",
  worldTimeMinutes: 480,
  soilMoisture: 0.82,
  waterDepthM: 0.76,
  vegetationCoverage: 0.64,
  rootDensity: 0.5,
  rainIntensity: 0.12,
  disturbance: 0,
  recentDisruption: false,
};

describe("living frontier habitat projection", () => {
  it("derives visible floodplain life from the existing environmental outcome", () => {
    const habitat = deriveHabitatProjection(floodplain);

    expect(habitat.activity).toBe("quiet");
    expect(habitat.occupants).toContainEqual(
      expect.objectContaining({ species: "wading-bird", occupancy: "active" }),
    );
  });

  it("makes disturbance reversible presentation behavior rather than a permanent penalty", () => {
    const quiet = deriveHabitatProjection(floodplain);
    const disturbed = deriveHabitatProjection({ ...floodplain, disturbance: 0.9 });
    const recovered = deriveHabitatProjection(floodplain);

    expect(disturbed.activity).toBe("stirring");
    expect(disturbed.occupants.find(({ species }) => species === "wading-bird")).toBeUndefined();
    expect(recovered).toEqual(quiet);
  });

  it("reflects a quarry disruption as scavenger habitat without inventing a mission", () => {
    const habitat = deriveHabitatProjection({
      ...floodplain,
      terrain: "quarry-edge",
      waterDepthM: 0.05,
      recentDisruption: true,
    });

    expect(habitat.occupants).toContainEqual(
      expect.objectContaining({ species: "corvid", occupancy: "active" }),
    );
  });
});
