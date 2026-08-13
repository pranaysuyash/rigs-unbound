import { describe, expect, it } from "vitest";
import {
  bufferToolToggle,
  createToolIntentBuffer,
  IDLE_VEHICLE_INTENT,
  normalizeVehicleIntent,
  popValidBufferedToolToggle,
} from "./vehicle-intent";

describe("normalizeVehicleIntent", () => {
  it("returns a neutral semantic frame when input is absent", () => {
    expect(normalizeVehicleIntent(undefined)).toEqual(IDLE_VEHICLE_INTENT);
  });

  it("clamps axes and rejects non-finite values", () => {
    expect(
      normalizeVehicleIntent({
        throttle: 4,
        steering: -8,
        brake: Number.NaN,
        handbrake: -2,
        primaryTool: 1.7,
        secondaryTool: Number.POSITIVE_INFINITY,
      }),
    ).toMatchObject({
      throttle: 1,
      steering: -1,
      brake: 0,
      handbrake: 0,
      primaryTool: 1,
      secondaryTool: 0,
    });
  });
});

describe("tool intent buffering (150ms window)", () => {
  it("buffers tool toggles within the 150ms window and discards expired ones (S2/S3 sensitivity)", () => {
    let buffer = createToolIntentBuffer();
    buffer = bufferToolToggle(buffer, "diff-lock", 1000);
    buffer = bufferToolToggle(buffer, "headlights", 1100);

    // At 1120ms (within 150ms of 1000ms), diff-lock is popped first
    const pop1 = popValidBufferedToolToggle(buffer, 1120);
    expect(pop1.action).toBe("diff-lock");

    // At 1300ms (1300 - 1100 = 200ms > 150ms window), headlights expired!
    const pop2 = popValidBufferedToolToggle(pop1.nextBuffer, 1300);
    expect(pop2.action).toBe(null);
  });
});
