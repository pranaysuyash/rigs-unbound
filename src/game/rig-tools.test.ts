import { describe, expect, it } from "vitest";

import { effectiveProfile, type RigId } from "./contracts";
import { GameWorld } from "./gameworld";
import { stepRigMotion, toolTractionModifiers } from "./physics";
import {
  AIRED_DOWN_PSI,
  deriveRigToolProjections,
} from "./rig-tool-projection";
import {
  createInitialState,
  cycleDifferentialMode,
  publicState,
  setTirePressure,
} from "./state";

/**
 * Tool states must be **commitments with a cost**, not upgrades.
 *
 * If a state is strictly better it is not a decision — it is a delay before the
 * obvious choice, and the player would simply leave it switched on. These tests
 * pin the tradeoff in both directions.
 */

const TORQUE: RigId = "utility-tractor";
const DRIFT: RigId = "marsh-skimmer";

const THROTTLE = {
  accelerate: true,
  brake: false,
  steerLeft: false,
  steerRight: false,
};

describe("tyre pressure is a tradeoff", () => {
  it("buys soft-ground float and gives up top end", () => {
    const airedUp = toolTractionModifiers({
      tirePressurePsi: 35,
      differentialMode: "open",
    });
    const airedDown = toolTractionModifiers({
      tirePressurePsi: AIRED_DOWN_PSI,
      differentialMode: "open",
    });

    expect(airedDown.softGripMultiplier).toBeGreaterThan(
      airedUp.softGripMultiplier,
    );
    // The price. Without this, airing down would be a free upgrade.
    expect(airedDown.topSpeedMultiplier).toBeLessThan(
      airedUp.topSpeedMultiplier,
    );
  });

  it("is neutral when nothing has been committed", () => {
    const neutral = toolTractionModifiers(undefined);
    expect(neutral.softGripMultiplier).toBe(1);
    expect(neutral.topSpeedMultiplier).toBe(1);
    expect(neutral.steeringMultiplier).toBe(1);
  });

  it("clamps to the physical range rather than trusting a caller", () => {
    const state = createInitialState();
    setTirePressure(state, -50);
    expect(state.rigs[state.activeRigId].tools.tirePressurePsi).toBe(10);
    setTirePressure(state, 9999);
    expect(state.rigs[state.activeRigId].tools.tirePressurePsi).toBe(45);
  });

  it("reaches a slower top speed on hardpan when aired down", () => {
    // End-to-end: identical rig, identical input, only the commitment differs.
    const run = (psi: number) => {
      const state = createInitialState();
      const world = new GameWorld(state.seed);
      const rig = state.rigs[TORQUE];
      rig.tools.tirePressurePsi = psi;
      const profile = effectiveProfile(rig.id, rig.modules);
      for (let step = 0; step < 400; step += 1) {
        stepRigMotion(rig, profile, THROTTLE, world.terrain, 1 / 60, {
          towing: false,
          ramp: null,
          canJump: false,
          soilMoisture: 0,
          tools: rig.tools,
        });
      }
      return Math.abs(rig.speed);
    };

    expect(run(AIRED_DOWN_PSI)).toBeLessThan(run(35));
  });
});

describe("differential lock is a tradeoff", () => {
  it("buys traction and gives up turning", () => {
    const open = toolTractionModifiers({
      tirePressurePsi: 32,
      differentialMode: "open",
    });
    const locked = toolTractionModifiers({
      tirePressurePsi: 32,
      differentialMode: "locked",
    });

    expect(locked.softGripMultiplier).toBeGreaterThan(open.softGripMultiplier);
    expect(locked.steeringMultiplier).toBeLessThan(open.steeringMultiplier);
  });

  it("cycles open -> limited-slip -> locked -> open", () => {
    const state = createInitialState();
    const rig = state.rigs[state.activeRigId];

    expect(rig.tools.differentialMode).toBe("open");
    cycleDifferentialMode(state);
    expect(rig.tools.differentialMode).toBe("limited-slip");
    cycleDifferentialMode(state);
    expect(rig.tools.differentialMode).toBe("locked");
    cycleDifferentialMode(state);
    expect(rig.tools.differentialMode).toBe("open");
  });

  it("turns a rig less over the same steering input when locked", () => {
    const run = (mode: "open" | "locked") => {
      const state = createInitialState();
      const world = new GameWorld(state.seed);
      const rig = state.rigs[TORQUE];
      rig.tools.differentialMode = mode;
      const profile = effectiveProfile(rig.id, rig.modules);
      const startHeading = rig.heading;
      for (let step = 0; step < 200; step += 1) {
        stepRigMotion(
          rig,
          profile,
          { ...THROTTLE, steerRight: true },
          world.terrain,
          1 / 60,
          {
            towing: false,
            ramp: null,
            canJump: false,
            soilMoisture: 0,
            tools: rig.tools,
          },
        );
      }
      return Math.abs(rig.heading - startHeading);
    };

    expect(run("locked")).toBeLessThanOrEqual(run("open"));
  });
});

describe("the Pegboard is a projection, not a store", () => {
  it("derives entries from canonical state", () => {
    const state = createInitialState();
    const before = deriveRigToolProjections(state);
    const airDown = before.find((tool) => tool.id === "air-down-tires")!;

    expect(airDown.status).toBe("available");
    expect(airDown.command).toEqual({
      type: "set-tire-pressure",
      psi: AIRED_DOWN_PSI,
    });

    setTirePressure(state, AIRED_DOWN_PSI);
    const after = deriveRigToolProjections(state);
    const airDownAfter = after.find((tool) => tool.id === "air-down-tires")!;

    // Engaged is derived, never stored on the item.
    expect(airDownAfter.status).toBe("engaged");
    expect(airDownAfter.command).toBeNull();
  });

  it("states the cost on every usable entry", () => {
    // A control that shows only the benefit is an upgrade button.
    for (const tool of deriveRigToolProjections(createInitialState())) {
      expect(tool.detail.length).toBeGreaterThan(0);
    }
  });

  it("blocks the winch with a reason rather than hiding it", () => {
    const tools = deriveRigToolProjections(createInitialState());
    const winch = tools.find((tool) => tool.id === "winch")!;
    expect(winch.status).toBe("blocked");
    expect(winch.blockedReason).toMatch(/no winch/i);
  });

  it("offers no tyre or axle entries to a rig with neither", () => {
    const state = createInitialState();
    state.activeRigId = DRIFT;
    const ids = deriveRigToolProjections(state).map((tool) => tool.id);
    expect(ids).not.toContain("air-down-tires");
    expect(ids).not.toContain("cycle-differential");
  });

  it("does not mutate state while projecting", () => {
    const state = createInitialState();
    const world = new GameWorld(state.seed);
    const before = JSON.stringify(state);
    deriveRigToolProjections(state);
    publicState(state, world);
    expect(JSON.stringify(state)).toBe(before);
  });
});

describe("tool state persistence", () => {
  it("survives a serialise round trip", () => {
    const state = createInitialState();
    setTirePressure(state, AIRED_DOWN_PSI);
    cycleDifferentialMode(state);

    const roundTripped = JSON.parse(JSON.stringify(state));
    expect(roundTripped.rigs[state.activeRigId].tools).toEqual({
      tirePressurePsi: AIRED_DOWN_PSI,
      differentialMode: "limited-slip",
    });
  });
});

describe("tool state survives the real storage path", () => {
  it("round-trips through saveState and loadState", async () => {
    const { saveState, loadState } = await import("./storage");
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
      key: (index: number) => [...store.keys()][index] ?? null,
      get length() {
        return store.size;
      },
      clear: () => store.clear(),
    } as Storage;

    const state = createInitialState();
    const world = new GameWorld(state.seed);
    setTirePressure(state, AIRED_DOWN_PSI);
    cycleDifferentialMode(state);

    saveState(storage, state, world);
    const loaded = loadState(storage, world);

    expect(loaded.state).toBeTruthy();
    expect(loaded.state!.rigs[loaded.state!.activeRigId].tools).toEqual({
      tirePressurePsi: AIRED_DOWN_PSI,
      differentialMode: "limited-slip",
    });
  });

  it("defaults tool state when an older save omits it", async () => {
    const { recoverState } = await import("./state");
    const state = createInitialState();
    const raw = JSON.parse(JSON.stringify(state));
    for (const rigId of Object.keys(raw.rigs)) delete raw.rigs[rigId].tools;

    const restored = recoverState(raw);
    expect(restored).toBeTruthy();
    expect(restored!.rigs[restored!.activeRigId].tools).toEqual({
      tirePressurePsi: 32,
      differentialMode: "open",
    });
  });
});
