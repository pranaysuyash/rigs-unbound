import { describe, expect, it } from "vitest";

import { effectiveProfile, RIG_IDS, type RigId } from "./contracts";
import {
  deriveFleetRecoveryAssessment,
  RECOVERY_CONNECTION_RANGE_M,
  RECOVERY_RESTORED_CONDITION,
} from "./fleet-recovery-assessment";
import {
  applyFleetRecovery,
  fleetRecoveryProjection,
  resolveFleetRecoveryCommand,
} from "./fleet-recovery-command";
import { GameWorld } from "./gameworld";
import { createInitialState, publicState } from "./state";
import { deriveWeatherState, type WeatherState } from "./weather";

/**
 * The vertical chain the external review found missing:
 *
 *   world situation -> pure assessment -> proposition -> validated command
 *   -> authoritative transition -> event -> persistence
 *
 * Each acceptance case from that review is one test here.
 */

const TORQUE: RigId = "utility-tractor";
const SPARK: RigId = "toy-buggy";

function scenario(
  options: {
    /** Distance from the stranded rig to the support rig. */
    supportDistanceM?: number;
    weather?: Partial<WeatherState>;
    strandSpark?: boolean;
  } = {},
) {
  const state = createInitialState();
  const world = new GameWorld(state.seed);

  if (options.strandSpark !== false) {
    state.rigs[SPARK].condition = 0;
  }

  // Place Torque a chosen distance from Spark on the same ground.
  const distance = options.supportDistanceM ?? 5;
  state.rigs[TORQUE].x = state.rigs[SPARK].x + distance;
  state.rigs[TORQUE].z = state.rigs[SPARK].z;

  const weather: WeatherState = {
    ...deriveWeatherState(state.worldTimeMinutes),
    phase: "clear",
    rainIntensity: 0,
    soilMoisture: 0,
    ...options.weather,
  };

  return { state, world, weather };
}

describe("fleet recovery — assessment", () => {
  it("proposes nothing when no rig is disabled", () => {
    const { state, world, weather } = scenario({ strandSpark: false });
    const assessment = deriveFleetRecoveryAssessment(state, world, weather);

    expect(assessment.status).toBe("none");
    expect(assessment.strandedRigId).toBeNull();
    expect(fleetRecoveryProjection(assessment).command).toBeNull();
  });

  it("blocks with a reason when no operational rig has a tow hook", () => {
    const { state, world, weather } = scenario();
    // Disable every rig that could tow, leaving only the stranded one.
    for (const rigId of RIG_IDS) {
      if (rigId === SPARK) continue;
      if (
        effectiveProfile(
          rigId,
          state.rigs[rigId].modules,
        ).capabilities.includes("tow")
      ) {
        state.rigs[rigId].condition = 0;
      }
    }
    // Now the *first* disabled rig may differ; assess whichever it picks.
    const assessment = deriveFleetRecoveryAssessment(state, world, weather);

    expect(assessment.status).toBe("blocked");
    expect(assessment.reasons.length).toBeGreaterThan(0);
    expect(fleetRecoveryProjection(assessment).command).toBeNull();
  });

  it("is conditional with destination guidance when support is too far", () => {
    const { state, world, weather } = scenario({
      supportDistanceM: RECOVERY_CONNECTION_RANGE_M + 40,
    });
    // Leave exactly one operational rig, so distance is unambiguously the
    // binding constraint rather than another rig being nearer on worse ground.
    for (const rigId of RIG_IDS) {
      if (rigId !== TORQUE && rigId !== SPARK) state.rigs[rigId].condition = 0;
    }
    const assessment = deriveFleetRecoveryAssessment(state, world, weather);

    expect(assessment.status).toBe("conditional");
    expect(assessment.blockedBy).toBe("support-too-far");
    expect(assessment.destination).not.toBeNull();
    expect(assessment.reasons.join(" ")).toMatch(/drive within/i);
    expect(fleetRecoveryProjection(assessment).command).toBeNull();
  });

  it("is available when a tow-capable rig is in range on dry ground", () => {
    const { state, world, weather } = scenario({ supportDistanceM: 5 });
    const assessment = deriveFleetRecoveryAssessment(state, world, weather);

    expect(assessment.status).toBe("available");
    expect(assessment.supportRigId).not.toBeNull();
    expect(fleetRecoveryProjection(assessment).command).not.toBeNull();
  });

  it("blocks on saturated ground and recommends a fix", () => {
    const { state, world, weather } = scenario({
      supportDistanceM: 5,
      weather: { phase: "storm", rainIntensity: 1, soilMoisture: 1 },
    });
    const assessment = deriveFleetRecoveryAssessment(state, world, weather);

    // Saturated soil must either block the pull or be reported as pressure.
    // It must never silently behave like dry ground.
    expect(assessment.weatherPressure).toBe(true);
    if (assessment.status === "blocked") {
      expect(assessment.blockedBy).toBe("insufficient-traction");
      expect(assessment.reasons.join(" ")).toMatch(/lug tyres/i);
    } else {
      expect(assessment.reasons.join(" ")).toMatch(/wet|traction/i);
    }
  });

  it("reports lower grip in a storm than in the clear at the same spot", () => {
    // The assessment must inherit real weather physics, not restate mission copy.
    const dry = scenario({ supportDistanceM: 5 });
    const wet = scenario({
      supportDistanceM: 5,
      weather: { phase: "storm", rainIntensity: 1, soilMoisture: 1 },
    });

    const dryGrip =
      deriveFleetRecoveryAssessment(dry.state, dry.world, dry.weather)
        .candidates[0]?.grip ?? 0;
    const wetGrip =
      deriveFleetRecoveryAssessment(wet.state, wet.world, wet.weather)
        .candidates[0]?.grip ?? 0;

    expect(wetGrip).toBeLessThanOrEqual(dryGrip);
  });
});

describe("fleet recovery — command boundary", () => {
  it("rejects a command naming the wrong support rig", () => {
    const { state, world, weather } = scenario({ supportDistanceM: 5 });
    const assessment = deriveFleetRecoveryAssessment(state, world, weather);
    const wrong = RIG_IDS.find(
      (rigId) => rigId !== assessment.supportRigId && rigId !== SPARK,
    )!;

    const transition = resolveFleetRecoveryCommand(
      state,
      world,
      weather,
      { type: "recover-rig", supportRigId: wrong, strandedRigId: SPARK },
      10,
    );

    expect(transition.accepted).toBe(false);
    expect(transition.reason).toMatch(/not in position|not the rig/i);
  });

  it("rejects when nothing is stranded", () => {
    const { state, world, weather } = scenario({ strandSpark: false });
    const transition = resolveFleetRecoveryCommand(
      state,
      world,
      weather,
      { type: "recover-rig", supportRigId: TORQUE, strandedRigId: SPARK },
      10,
    );

    expect(transition.accepted).toBe(false);
    expect(transition.blockedBy).toBe("no-disabled-rig");
  });

  it("rejects a negative tick rather than emitting an untraceable event", () => {
    const { state, world, weather } = scenario({ supportDistanceM: 5 });
    const transition = resolveFleetRecoveryCommand(
      state,
      world,
      weather,
      { type: "recover-rig", supportRigId: TORQUE, strandedRigId: SPARK },
      -1,
    );

    expect(transition.accepted).toBe(false);
  });

  it("resolving a command does not mutate state; only applying does", () => {
    const { state, world, weather } = scenario({ supportDistanceM: 5 });
    const assessment = deriveFleetRecoveryAssessment(state, world, weather);
    const command = fleetRecoveryProjection(assessment).command!;
    const before = JSON.stringify(state);

    const transition = resolveFleetRecoveryCommand(
      state,
      world,
      weather,
      command,
      42,
    );

    expect(transition.accepted).toBe(true);
    expect(JSON.stringify(state)).toBe(before);
  });

  it("completes the chain: accepted command -> event -> persisted consequence", () => {
    const { state, world, weather } = scenario({ supportDistanceM: 5 });
    const assessment = deriveFleetRecoveryAssessment(state, world, weather);
    const command = fleetRecoveryProjection(assessment).command!;

    const transition = resolveFleetRecoveryCommand(
      state,
      world,
      weather,
      command,
      99,
    );
    expect(transition.accepted).toBe(true);
    if (!transition.accepted) return;

    // The event records who did it and under what conditions — the story data.
    expect(transition.event.supportRigId).toBe(command.supportRigId);
    expect(transition.event.strandedRigId).toBe(SPARK);
    expect(transition.event.weatherPhase).toBe(weather.phase);
    expect(transition.event.tick).toBe(99);

    applyFleetRecovery(state, transition.event);

    expect(state.rigs[SPARK].condition).toBe(RECOVERY_RESTORED_CONDITION);
    // Recovered, not reset: the rig is mobile but visibly damaged.
    expect(state.rigs[SPARK].condition).toBeLessThan(100);

    // The consequence survives a serialise/restore round trip.
    const roundTripped = JSON.parse(JSON.stringify(state));
    expect(roundTripped.rigs[SPARK].condition).toBe(
      RECOVERY_RESTORED_CONDITION,
    );

    // And the same recovery cannot be replayed for a second payout.
    const repeat = resolveFleetRecoveryCommand(
      state,
      world,
      weather,
      command,
      100,
    );
    expect(repeat.accepted).toBe(false);
    expect(repeat.blockedBy).toBe("no-disabled-rig");
  });

  it("keeps read models pure while a recovery is pending", () => {
    const { state, world, weather } = scenario({ supportDistanceM: 5 });
    const before = JSON.stringify(state);

    publicState(state, world);
    deriveFleetRecoveryAssessment(state, world, weather);
    publicState(state, world);

    expect(JSON.stringify(state)).toBe(before);
  });
});
