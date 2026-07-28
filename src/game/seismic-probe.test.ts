import { describe, expect, it } from "vitest";
import { fireSeismicPulse } from "./seismic-probe";

describe("seismic subsurface probe engine", () => {
  it("calculates deeper acoustic penetration in saturated moist ground", () => {
    const dryPulse = fireSeismicPulse(0, 0, 5, 0.1, []);
    const wetPulse = fireSeismicPulse(0, 0, 5, 0.9, []);

    expect(wetPulse.penetrationDepthMeters).toBeGreaterThan(
      dryPulse.penetrationDepthMeters,
    );
  });

  it("detects subterranean salvage deposit anomaly within acoustic range", () => {
    const caches = [{ x: 5, z: 5, depthMeters: 6.5 }];
    const result = fireSeismicPulse(0, 0, 8, 0.5, caches);

    expect(result.detectedAnomaly).not.toBeNull();
    expect(result.detectedAnomaly?.type).toBe("salvage-cache");
    expect(result.detectedAnomaly?.depthMeters).toBe(6.5);
    expect(result.detectedAnomaly?.signalStrength).toBeGreaterThan(0.5);
  });
});
