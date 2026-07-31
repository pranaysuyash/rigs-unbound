import { describe, expect, it } from "vitest";
import { deriveWeatherForecast } from "./weather";

describe("weather forecast", () => {
  it("warns about the next rain or storm from the same deterministic clock", () => {
    expect(deriveWeatherForecast(400)).toEqual({
      targetPhase: "rain",
      minutesUntil: 620,
      label: "Rain in 10h 20m",
    });
    expect(deriveWeatherForecast(1100)).toEqual({
      targetPhase: "storm",
      minutesUntil: 100,
      label: "Storm in 1h 40m",
    });
    expect(deriveWeatherForecast(1250)).toEqual({
      targetPhase: "storm",
      minutesUntil: 0,
      label: "Storm now",
    });
  });
});
