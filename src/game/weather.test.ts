import { describe, expect, it } from "vitest";
import { applyWeatherGripPenalty, deriveWeatherState } from "./weather";

describe("dynamic weather engine", () => {
  it("derives clear weather during morning hours", () => {
    const morning = deriveWeatherState(600); // 10:00 AM
    expect(morning.phase).toBe("clear");
    expect(morning.rainIntensity).toBe(0);
  });

  it("derives rain and storm weather during evening hours", () => {
    const rainTime = deriveWeatherState(1100); // 18:20 PM
    expect(rainTime.phase).toBe("rain");
    expect(rainTime.rainIntensity).toBeGreaterThan(0.5);

    const stormTime = deriveWeatherState(1260); // 21:00 PM
    expect(stormTime.phase).toBe("storm");
    expect(stormTime.rainIntensity).toBe(1.0);
  });

  it("applies soil grip penalties to soft ground while preserving hardpan track grip", () => {
    const baseGrip = 0.8;
    const trackGrip = applyWeatherGripPenalty(baseGrip, "track", 0.95);
    expect(trackGrip).toBe(baseGrip);

    const mudGrip = applyWeatherGripPenalty(baseGrip, "mud", 0.95);
    expect(mudGrip).toBeLessThan(baseGrip);
  });
});
