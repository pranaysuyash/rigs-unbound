import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import { deriveRigSignature } from "./signature";

const idleContext = { carriedLoad: 0, illumination: 0 };

describe("experimental rig emission source", () => {
  it("derives deterministic bounded channels without mutating the rig", () => {
    const state = createInitialState("SIGNATURE-DETERMINISM");
    const rig = state.rigs["utility-tractor"];
    // Torque narratively starts disabled awaiting restoration (see
    // createInitialState); this test exercises operating emission, not that.
    rig.condition = 100;
    rig.speed = 4;
    rig.strain = 0.45;
    rig.attachments[0]!.engaged = true;
    const before = structuredClone(rig);
    const context = { carriedLoad: 0.8, illumination: 1 };

    const first = deriveRigSignature(rig, context);
    const second = deriveRigSignature(rig, context);

    expect(first).toEqual(second);
    expect(rig).toEqual(before);
    for (const value of Object.values(first.channels)) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it("keeps channel causes distinct across motion, strain, tools, and load", () => {
    const state = createInitialState("SIGNATURE-CAUSES");
    const rig = state.rigs["utility-tractor"];
    rig.condition = 100;
    const idle = deriveRigSignature(rig, idleContext);

    rig.speed = 5;
    rig.strain = 0.5;
    rig.attachments[0]!.engaged = true;
    const working = deriveRigSignature(rig, {
      carriedLoad: 1,
      illumination: 0,
    });
    const lit = deriveRigSignature(rig, {
      carriedLoad: 1,
      illumination: 1,
    });

    expect(working.channels.acoustic).toBeGreaterThan(idle.channels.acoustic);
    expect(working.channels.thermalProxy).toBeGreaterThan(
      idle.channels.thermalProxy,
    );
    expect(working.channels.illumination).toBe(0);
    expect(lit.channels.illumination).toBe(1);
  });

  it("supports ground and hover rigs without wheel or rig-name branches", () => {
    const state = createInitialState("SIGNATURE-MOBILITY");
    const ground = state.rigs["toy-buggy"];
    const hover = state.rigs["marsh-skimmer"];
    ground.speed = 4;
    hover.speed = 4;
    ground.strain = 0.4;
    hover.strain = 0.4;

    expect(deriveRigSignature(ground, idleContext).rigId).toBe("toy-buggy");
    expect(deriveRigSignature(hover, idleContext).rigId).toBe("marsh-skimmer");
  });

  it("does not emit from a disabled rig without an operating-state decision", () => {
    const state = createInitialState("SIGNATURE-DISABLED");
    const rig = state.rigs["utility-tractor"];
    rig.condition = 0;
    rig.speed = 8;
    rig.strain = 1;
    rig.attachments[0]!.engaged = true;

    const signature = deriveRigSignature(rig, {
      carriedLoad: 1,
      illumination: 1,
    });
    expect(signature.channels).toEqual({
      acoustic: 0,
      illumination: 0,
      thermalProxy: 0,
    });
  });
});
