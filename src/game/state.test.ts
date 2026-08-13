import { beforeEach, describe, expect, it } from "vitest";
import {
  BUGGY_RAMP,
  CAMERA_MODES,
  CARGO_DELIVERY,
  CARGO_PICKUP,
  effectiveProfile,
  FIXED_STEP_SECONDS,
  LANDMARKS,
  MODULES,
  RIG_PROFILES,
  rigCollisionRadius,
  SAVE_SCHEMA_VERSION,
  PREVIOUS_SAVE_SCHEMA_VERSION,
  V8_SAVE_SCHEMA_VERSION,
  WORLD_DAY_MINUTES,
  type GameState,
  type RigId,
  worldMinuteOfDay,
} from "./contracts";
import { GameWorld } from "./gameworld";
import { driveForce, effectiveGrip } from "./physics";
import { FIRST_SALVAGE_NODE, SALVAGE_PICKUP_RADIUS } from "./exploration";
import { resolveFirstRung } from "./first-rung";
import { createUnboundPassageState } from "./unbound-passage";
import {
  activeRig,
  advanceGame,
  createInitialState,
  cycleCamera,
  cyclePhase,
  EMERGENCY_RECOVERY_CONDITION,
  executePrimaryActionCommand,
  hasCapability,
  installModule,
  PRIMARY_ACTION_COMMAND_VERSION,
  PRIMARY_ACTION_EVENT_VERSION,
  performPrimaryAction,
  publicState,
  recoverState,
  repairRig,
  resolvePrimaryAction,
  selectCamera,
  settleWorld,
  stepGame,
  switchActiveRig,
  selectActiveRig,
  toggleBladeMode,
  winchRecover,
  acceptArrivalBargain,
  refuseArrivalBargain,
  chooseFarmWaterworks,
  firstNightThreatObstacles,
} from "./state";
import { acceptMission } from "./mission-lifecycle";
import type { MissionProposition } from "./mission-propositions";
import { HOME_SITE, RIG_HOME_BERTHS, SURFACES, findSite } from "./world";

const ACCELERATE = {
  accelerate: true,
  brake: false,
  steerLeft: false,
  steerRight: false,
} as const;

const IDLE = {
  accelerate: false,
  brake: false,
  steerLeft: false,
  steerRight: false,
} as const;

/** Build a state and its world together, settled and ready to step. */
function scenario(seed: string, activeRigId: RigId = "utility-tractor") {
  const state = createInitialState(seed);
  state.activeRigId = activeRigId;
  // Kernel/physics tests exercise driving capability, not the campaign-opening
  // restoration beat (see createInitialState: the tractor narratively starts
  // disabled). Restore it here so the shared scenario helper hands back a
  // machine every other test can assume is drivable.
  state.rigs["utility-tractor"].condition = 100;
  state.rigs["utility-tractor"].componentHealth = {
    tireTreadHealthPercent: 100,
    radiatorCleanlinessPercent: 100,
    winchCableIntegrityPercent: 100,
    alternatorBeltHealthPercent: 100,
  };
  const world = new GameWorld(seed);
  settleWorld(state, world);
  return { state, world };
}

/** Drive a rig on flat home ground, away from obstacles, for N steps. */
function driveFlat(state: GameState, world: GameWorld, steps: number): void {
  for (let index = 0; index < steps; index += 1) {
    stepGame(state, world, ACCELERATE, FIXED_STEP_SECONDS);
  }
}

describe("rig gameplay kernel", () => {
  it("resolves the same truthful primary action before and after mutation", () => {
    const { state, world } = scenario("PRIMARY-ACTION");
    const rig = activeRig(state);
    const node = world.exploration.nearestNode(
      rig.x,
      rig.z,
      70,
      world.collectedNodes,
    );
    if (!node) throw new Error("missing salvage fixture");

    rig.x = node.x;
    rig.z = node.z;
    settleWorld(state, world);
    expect(resolvePrimaryAction(state, world)).toMatchObject({
      kind: "collect-salvage",
      label: `Collect ${node.value}`,
    });
    performPrimaryAction(state, world);
    expect(resolvePrimaryAction(state, world)).toMatchObject({
      kind: "lower-plough",
      label: "Lower blade",
    });
    performPrimaryAction(state, world);
    expect(resolvePrimaryAction(state, world)).toMatchObject({
      kind: "raise-plough",
      label: "Raise blade",
    });
  });

  it("does not block salvage with survey offer on a non-survey home rig", () => {
    const { state, world } = scenario("SURVEY-PRIORITY");
    const rig = activeRig(state);
    rig.x = FIRST_SALVAGE_NODE.x;
    rig.z = FIRST_SALVAGE_NODE.z;
    settleWorld(state, world);
    const node = world.exploration.nearestNode(
      rig.x,
      rig.z,
      SALVAGE_PICKUP_RADIUS,
      world.collectedNodes,
    );
    if (!node) {
      throw new Error("Missing salvage fixture for regression coverage");
    }

    state.surveyRoute.status = "ready";

    expect(resolvePrimaryAction(state, world)).toMatchObject({
      kind: "collect-salvage",
      label: `Collect ${node.value}`,
    });
  });

  it("records voluntary local machine help without accepting a mission or unlocking a route", () => {
    const { state, world } = scenario("SETTLEMENT-CONTRIBUTION", "toy-buggy");
    const furrow = findSite("long-furrow")!;
    const rig = activeRig(state);
    state.settlements["long-furrow"] = {
      ...state.settlements["long-furrow"],
      condition: "waterlogged",
    };
    // Community help resolves at raised stores ground, not anywhere inside
    // the settlement service radius.
    rig.x = furrow.x + 7.4;
    rig.z = furrow.z - 5.8;
    settleWorld(state, world);

    expect(resolvePrimaryAction(state, world)).toMatchObject({
      kind: "contribute-settlement",
      label: "Move soaked stores",
    });
    expect(performPrimaryAction(state, world)).toMatchObject({
      outcome: "accepted",
    });
    expect(state.activeMission).toBeNull();
    expect(state.settlements["long-furrow"].completedNeedIds).toEqual([]);
    expect(state.settlements["long-furrow"].contributions).toEqual([
      expect.objectContaining({
        responseId: "long-furrow:move-soaked-stores",
        materialEffectId: "long-furrow:staged-stores",
        capability: "tow",
      }),
    ]);
    expect(
      recoverState(JSON.parse(JSON.stringify(state)))?.settlements[
        "long-furrow"
      ].contributions,
    ).toEqual(state.settlements["long-furrow"].contributions);
  });

  it("lets a community adapt after a sustained world day without creating a mission or removing later help", () => {
    const { state, world } = scenario("SETTLEMENT-ADAPTATION", "toy-buggy");
    state.settlements["long-furrow"] = {
      ...state.settlements["long-furrow"],
      condition: "waterlogged",
    };
    state.worldTimeMinutes = WORLD_DAY_MINUTES - 0.001;

    stepGame(state, world, IDLE, FIXED_STEP_SECONDS);

    expect(state.settlements["long-furrow"].adaptations).toEqual([
      expect.objectContaining({
        id: "long-furrow:raise-stores-routine",
        materialEffectId: "long-furrow:self-raised-stores",
      }),
    ]);
    expect(state.activeMission).toBeNull();
    expect(state.activeSideMissions).toEqual([]);
    expect(state.settlements["long-furrow"].contributions).toEqual([]);
  });

  it("migrates v24 settlement source records into durable material effects", () => {
    const legacy = JSON.parse(
      JSON.stringify(createInitialState("SETTLEMENT-EFFECT-MIGRATION")),
    ) as {
      schemaVersion: number;
      settlements: {
        "long-furrow": {
          contributions: unknown[];
          adaptations: unknown[];
        };
      };
    };
    legacy.schemaVersion = PREVIOUS_SAVE_SCHEMA_VERSION;
    legacy.settlements["long-furrow"].contributions = [
      {
        responseId: "long-furrow:move-soaked-stores",
        capability: "tow",
        createdAtWorldMinutes: 920,
      },
    ];
    legacy.settlements["long-furrow"].adaptations = [
      {
        id: "long-furrow:raise-stores-routine",
        createdAtWorldMinutes: 1440,
      },
    ];

    const recovered = recoverState(legacy);

    expect(recovered?.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(
      recovered?.settlements["long-furrow"].contributions[0]?.materialEffectId,
    ).toBe("long-furrow:staged-stores");
    expect(
      recovered?.settlements["long-furrow"].adaptations[0]?.materialEffectId,
    ).toBe("long-furrow:self-raised-stores");
  });

  it("starts every rig in a dry, stable, non-overlapping Home berth within switching range", () => {
    const { state, world } = scenario("HOME-BERTHS");
    const rigs = Object.values(state.rigs);

    for (const rig of rigs) {
      const berth = RIG_HOME_BERTHS[rig.id];
      expect(rig.x).toBe(berth.x);
      expect(rig.z).toBe(berth.z);
      expect(rig.heading).toBe(berth.heading);
      expect(world.terrain.sample(rig.x, rig.z).waterDepth, `Failed for rig: ${rig.id}`).toBe(0);
      expect(world.terrain.sample(rig.x, rig.z).slope).toBeLessThan(0.18);
    }

    for (let left = 0; left < rigs.length; left += 1) {
      for (let right = left + 1; right < rigs.length; right += 1) {
        const a = rigs[left]!;
        const b = rigs[right]!;
        const minimum =
          rigCollisionRadius(RIG_PROFILES[a.id]) +
          rigCollisionRadius(RIG_PROFILES[b.id]);
        expect(
          Math.hypot(a.x - b.x, a.z - b.z),
          `Overlap between ${a.id} (${a.x},${a.z}) and ${b.id} (${b.x},${b.z})`,
        ).toBeGreaterThan(minimum);
        expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeLessThan(34);
      }
    }

    selectActiveRig(state, "toy-buggy");
    expect(state.activeRigId).toBe("toy-buggy");
    selectActiveRig(state, "marsh-skimmer");
    expect(state.activeRigId).toBe("marsh-skimmer");
  });

  it("settles both rigs onto the terrain instead of the old zero plane", () => {
    const { state, world } = scenario("SETTLE");
    for (const id of ["utility-tractor", "toy-buggy"] as const) {
      const rig = state.rigs[id];
      const profile = effectiveProfile(id, rig.modules);
      const ground = world.terrain.height(rig.x, rig.z);
      expect(rig.y).toBeGreaterThan(ground);
      expect(rig.y - ground).toBeLessThan(profile.rideHeight + 0.6);
      expect(rig.mobility.kind).toBe("ground");
      if (rig.mobility.kind !== "ground")
        throw new Error("expected ground rig");
      expect(rig.mobility.grounded).toBe(true);
    }
  });

  it("moves contrasting rigs through the same named input contract", () => {
    const tractor = scenario("MOVE", "utility-tractor");
    const buggy = scenario("MOVE", "toy-buggy");

    for (const runner of [tractor, buggy]) {
      const rig = activeRig(runner.state);
      // Compare the controllers on the same open southbound route instead of
      // accidentally benchmarking different berth geometry.
      rig.x = 0;
      rig.z = -12;
      rig.heading = Math.PI;
      settleWorld(runner.state, runner.world);
    }
    driveFlat(tractor.state, tractor.world, 300);
    driveFlat(buggy.state, buggy.world, 300);

    const tractorRig = activeRig(tractor.state);
    const buggyRig = activeRig(buggy.state);
    expect(tractorRig.distanceTravelled).toBeGreaterThan(10);
    expect(buggyRig.distanceTravelled).toBeGreaterThan(5);

    expect(publicState(buggy.state, buggy.world)).not.toHaveProperty(
      "renderer",
    );
  });

  it("keeps the public checkpoint readable when recovered numeric fields are missing or non-finite", () => {
    const { state, world } = scenario("PUBLIC-STATE-FALLBACK");
    const rig = activeRig(state);
    rig.y = undefined as unknown as number;
    rig.telemetry.grip = Number.NaN;
    if (rig.mobility.kind !== "ground") throw new Error("expected ground rig");
    rig.mobility.verticalVelocity = Number.POSITIVE_INFINITY;

    const exposed = publicState(state, world) as {
      activeRig: {
        y: number;
        mobility: { verticalVelocity: number };
        terrain: { grip: number };
      };
    };

    expect(exposed.activeRig.y).toBe(0);
    expect(exposed.activeRig.mobility.verticalVelocity).toBe(0);
    expect(exposed.activeRig.terrain.grip).toBe(0);
  });

  it("crosses standing water through hover state rather than fake wheel contacts", () => {
    const { state, world } = scenario("HOVER-WATER", "marsh-skimmer");
    const marsh = findSite("sunken-flats")!;
    const rig = activeRig(state);
    rig.x = marsh.x;
    rig.z = marsh.z + 7;
    rig.heading = Math.PI;
    settleWorld(state, world);
    const condition = rig.condition;

    driveFlat(state, world, 120);

    expect(rig.mobility.kind).toBe("hover");
    if (rig.mobility.kind !== "hover") throw new Error("expected hover rig");
    expect(rig.telemetry.waterDepth).toBeGreaterThan(
      RIG_PROFILES["utility-tractor"].fordDepth,
    );
    expect(rig.condition).toBe(condition);
    expect(rig.distanceTravelled).toBeGreaterThan(5);
    expect(rig.mobility.cushionPressure).toBeGreaterThan(0.5);
    const exposed = publicState(state, world) as {
      activeRig: { mobility: { kind: string; wheels?: unknown } };
    };
    expect(exposed.activeRig.mobility.kind).toBe("hover");
    expect(exposed.activeRig.mobility.wheels).toBeUndefined();
  });

  it("keeps hover traversal deterministic for the same seed and input", () => {
    const first = scenario("HOVER-DETERMINISM", "marsh-skimmer");
    const second = scenario("HOVER-DETERMINISM", "marsh-skimmer");
    driveFlat(first.state, first.world, 180);
    driveFlat(second.state, second.world, 180);

    expect(publicState(first.state, first.world)).toEqual(
      publicState(second.state, second.world),
    );
  });

  it("makes steep ground cost hover authority and mechanical strain", () => {
    const { state, world } = scenario("HOVER-GRADE", "marsh-skimmer");
    const ridge = findSite("launch-ridge")!;
    const rig = activeRig(state);
    rig.x = (HOME_SITE.x + ridge.x) * 0.42;
    rig.z = (HOME_SITE.z + ridge.z) * 0.42;
    rig.heading = Math.atan2(ridge.x - rig.x, ridge.z - rig.z);
    settleWorld(state, world);

    driveFlat(state, world, 180);

    expect(Math.abs(rig.telemetry.grade)).toBeGreaterThan(0.05);
    expect(rig.telemetry.grip).toBeLessThan(0.9);
    expect(rig.strain).toBeGreaterThan(0.04);
  });

  it("queries capabilities from composed profiles rather than rig-name branches", () => {
    const { state } = scenario("CAPABILITIES");
    const tractor = state.rigs["utility-tractor"];
    const buggy = state.rigs["toy-buggy"];

    expect(hasCapability(tractor, "plough")).toBe(true);
    expect(hasCapability(buggy, "plough")).toBe(false);
    expect(hasCapability(tractor, "tow")).toBe(true);
    expect(hasCapability(buggy, "jump")).toBe(true);
    expect(hasCapability(tractor, "winch")).toBe(false);

    tractor.modules.push("winch");
    expect(hasCapability(tractor, "winch")).toBe(true);
  });

  it("cycles presentation state without replacing either rig", () => {
    const { state } = scenario("PHASE");
    const tractor = state.rigs["utility-tractor"];
    const buggy = state.rigs["toy-buggy"];

    cyclePhase(state);
    cycleCamera(state);

    expect(state.phase).toBe("gloam");
    expect(state.cameraMode).toBe("hood");
    expect(state.rigs["utility-tractor"]).toBe(tractor);
    expect(state.rigs["toy-buggy"]).toBe(buggy);
  });

  it("offers every camera policy through direct selection and ordered cycling", () => {
    const { state } = scenario("CAMERA-POLICIES");

    for (const mode of CAMERA_MODES) {
      selectCamera(state, mode);
      expect(state.cameraMode).toBe(mode);
    }

    selectCamera(state, "chase");
    for (const mode of CAMERA_MODES.slice(1)) {
      cycleCamera(state);
      expect(state.cameraMode).toBe(mode);
    }
    cycleCamera(state);
    expect(state.cameraMode).toBe("chase");
  });

  it("preserves independent rig history while switching the active identity", () => {
    const { state, world } = scenario("SWITCH");
    const tractor = state.rigs["utility-tractor"];
    stepGame(state, world, ACCELERATE, 0.1);
    const tractorDistance = tractor.distanceTravelled;

    switchActiveRig(state);
    stepGame(state, world, ACCELERATE, 0.1);

    expect(state.activeRigId).toBe("toy-buggy");
    expect(state.rigs["utility-tractor"]).toBe(tractor);
    expect(tractor.distanceTravelled).toBe(tractorDistance);
    expect(tractor.speed).toBe(0);
    expect(state.rigs["toy-buggy"].distanceTravelled).toBeGreaterThan(0);
  });

  it("keeps control on an airborne rig until it lands", () => {
    const { state } = scenario("AIRBORNE-SWITCH", "toy-buggy");
    const buggy = state.rigs["toy-buggy"];
    if (buggy.mobility.kind !== "ground")
      throw new Error("expected ground rig");
    buggy.mobility.grounded = false;
    buggy.y += 4;

    switchActiveRig(state);

    expect(state.activeRigId).toBe("toy-buggy");
    expect(state.lastDiagnostic).toContain("Stabilize");
  });

  it("discovers spatial opportunities through either active rig", () => {
    const { state, world } = scenario("DISCOVERY", "toy-buggy");
    const target = LANDMARKS.find(
      (landmark) => landmark.id === "salvage-yard",
    )!;
    const buggy = activeRig(state);
    buggy.x = target.x;
    buggy.z = target.z;
    stepGame(state, world);

    expect(state.discoveries.map((item) => item.id)).toContain(target.id);
  });

  it("supports deterministic external stepping with a bounded duration", () => {
    const left = scenario("STEP");
    const right = scenario("STEP");

    advanceGame(left.state, left.world, 1000);
    advanceGame(right.state, right.world, 1000);

    expect(publicState(left.state, left.world)).toEqual(
      publicState(right.state, right.world),
    );
    expect(left.state.elapsedMs).toBeCloseTo(1000, 5);
  });

  it("is deterministic under an identical input sequence", () => {
    const left = scenario("DETERMINISM");
    const right = scenario("DETERMINISM");
    const inputs = [ACCELERATE, IDLE, { ...ACCELERATE, steerLeft: true }];

    for (let index = 0; index < 240; index += 1) {
      const input = inputs[index % inputs.length]!;
      stepGame(left.state, left.world, input, FIXED_STEP_SECONDS);
      stepGame(right.state, right.world, input, FIXED_STEP_SECONDS);
    }

    expect(publicState(left.state, left.world)).toEqual(
      publicState(right.state, right.world),
    );
  });
});

describe("traversal model", () => {
  it("shapes drive force so the tractor pulls from rest and the buggy needs a run-up", () => {
    // This is the whole gearing model: nobody authors a "climb stat".
    const tractor = effectiveProfile("utility-tractor", []);
    const buggy = effectiveProfile("toy-buggy", []);

    // From a dead stop the tractor has far more to give, despite less peak power.
    expect(driveForce(tractor, 0)).toBeGreaterThan(driveForce(buggy, 0) * 2);
    // The tractor's force is flat from rest; the buggy's climbs with momentum.
    expect(driveForce(tractor, 0)).toBeGreaterThan(
      driveForce(tractor, tractor.lugSpeed) * 0.95,
    );
    expect(driveForce(buggy, buggy.lugSpeed)).toBeGreaterThan(
      driveForce(buggy, 0) * 2.5,
    );
    // And both still fall away toward their top speed.
    expect(driveForce(buggy, buggy.topSpeed)).toBeLessThan(
      driveForce(buggy, buggy.lugSpeed) * 0.5,
    );
  });

  it("makes low-range gearing restore pulling force from rest", () => {
    const stock = effectiveProfile("toy-buggy", []);
    const geared = effectiveProfile("toy-buggy", ["low-range-gearing"]);
    expect(driveForce(geared, 0)).toBeGreaterThan(driveForce(stock, 0) * 2.5);
    // Paid for with top speed, so the module is a choice rather than an upgrade.
    expect(geared.topSpeed).toBeLessThan(stock.topSpeed);
  });

  it("makes lug tyres matter most where grip is worst", () => {
    const tractor = effectiveProfile("utility-tractor", []);
    const buggy = effectiveProfile("toy-buggy", []);

    const mudTractor = effectiveGrip(
      SURFACES.mud.grip,
      tractor.tireGrip,
      tractor.lugBonus,
    );
    const mudBuggy = effectiveGrip(
      SURFACES.mud.grip,
      buggy.tireGrip,
      buggy.lugBonus,
    );
    const trackTractor = effectiveGrip(
      SURFACES.track.grip,
      tractor.tireGrip,
      tractor.lugBonus,
    );
    const trackBuggy = effectiveGrip(
      SURFACES.track.grip,
      buggy.tireGrip,
      buggy.lugBonus,
    );

    // Tractor wins in mud, buggy wins on hardpan: a real contrast, not a tier.
    expect(mudTractor).toBeGreaterThan(mudBuggy);
    expect(trackBuggy).toBeGreaterThan(trackTractor);
  });

  it("slows a rig climbing a grade and speeds it descending the same grade", () => {
    const ridge = findSite("launch-ridge")!;
    const uphill = scenario("GRADE-UP");
    const downhill = scenario("GRADE-DOWN");

    // Place both on the same sloped ground, facing opposite ways.
    const midX = (HOME_SITE.x + ridge.x) * 0.42;
    const midZ = (HOME_SITE.z + ridge.z) * 0.42;
    const toRidge = Math.atan2(ridge.x - midX, ridge.z - midZ);

    for (const [runner, heading] of [
      [uphill, toRidge],
      [downhill, toRidge + Math.PI],
    ] as const) {
      const rig = activeRig(runner.state);
      rig.x = midX;
      rig.z = midZ;
      rig.heading = heading;
      settleWorld(runner.state, runner.world);
      driveFlat(runner.state, runner.world, 150);
    }

    const climbing = activeRig(uphill.state);
    const descending = activeRig(downhill.state);
    expect(Math.abs(descending.speed)).toBeGreaterThan(
      Math.abs(climbing.speed),
    );
  });

  it("lets low-range gearing climb from rest where the stock buggy bogs", () => {
    // The progression promise, asserted: a module changes what terrain is passable.
    // The test finds real terrain in the band the gate is meant to cover rather
    // than assuming a hand-picked coordinate stays valid as the world is tuned.
    const probe = new GameWorld("CLIMB-GATE");
    let siteX = 0;
    let siteZ = 0;
    let siteHeading = 0;
    for (let index = 1; index < 4000; index += 1) {
      const angle = index * 2.399963;
      const radius = Math.sqrt(index / 4000) * 180;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      if (probe.terrain.surfaceIdAt(x, z) !== "grass") continue;
      // Face directly uphill along the terrain gradient.
      const east =
        probe.terrain.height(x + 1, z) - probe.terrain.height(x - 1, z);
      const north =
        probe.terrain.height(x, z + 1) - probe.terrain.height(x, z - 1);
      const gradient = Math.hypot(east, north) / 2;
      if (gradient < 0.5 || gradient > 0.68) continue;
      siteX = x;
      siteZ = z;
      siteHeading = Math.atan2(east, north);
      break;
    }
    expect(siteHeading === 0 && siteX === 0).toBe(false);

    const climbed: number[] = [];
    for (const modules of [[], ["low-range-gearing"]] as const) {
      const { state, world } = scenario("CLIMB-GATE", "toy-buggy");
      const rig = activeRig(state);
      rig.modules = [...modules];
      rig.x = siteX;
      rig.z = siteZ;
      rig.heading = siteHeading;
      settleWorld(state, world);
      const startHeight = rig.y;
      driveFlat(state, world, 420);
      climbed.push(rig.y - startHeight);
    }

    const [stock, geared] = climbed as [number, number];
    expect(geared).toBeGreaterThan(stock + 0.5);
  });

  it("removes steering authority while airborne", () => {
    const { state, world } = scenario("AIR-STEER", "toy-buggy");
    const rig = activeRig(state);
    if (rig.mobility.kind !== "ground") throw new Error("expected ground rig");
    rig.speed = 12;
    rig.mobility.grounded = false;
    rig.y += 6;
    const heading = rig.heading;

    stepGame(
      state,
      world,
      { accelerate: false, brake: false, steerLeft: true, steerRight: false },
      FIXED_STEP_SECONDS,
    );

    expect(rig.heading).toBe(heading);
    expect(rig.mobility.grounded).toBe(false);
  });

  it.each(["utility-tractor", "toy-buggy", "marsh-skimmer"] as const)(
    "turns %s toward the player's screen-left when the player holds left",
    (rigId) => {
      const { state, world } = scenario(`LEFT-STEER-${rigId}`, rigId);
      const rig = activeRig(state);
      rig.speed = 6;
      const heading = rig.heading;

      stepGame(
        state,
        world,
        {
          accelerate: true,
          brake: false,
          steerLeft: true,
          steerRight: false,
        },
        FIXED_STEP_SECONDS,
      );

      // Corrected 2026-07-28: this assertion previously required negative yaw
      // for Left, on the claim that world −X is "the player's left". That claim
      // was derived from a head-on view of the rig, not from the chase camera's
      // actual seat behind it. For a chase viewer looking along +forward,
      // Three.js `lookAt` gives right-axis = -forward × up, which resolves to
      // world −X being screen-RIGHT when facing +Z — the opposite of what this
      // test asserted. See `steering-direction.test.ts` for the corrected,
      // camera-relative derivation and live-browser confirmation. Left must
      // increase heading; Right must decrease it.
      expect(rig.heading).toBeGreaterThan(heading);
    },
  );

  it("bounds the rig inside the world disc", () => {
    const { state, world } = scenario("BOUNDARY");
    const rig = activeRig(state);
    rig.x = 244;
    rig.z = 0;
    rig.heading = Math.PI / 2;
    rig.speed = 10;
    for (let index = 0; index < 120; index += 1) {
      stepGame(state, world, ACCELERATE, FIXED_STEP_SECONDS);
    }
    expect(Math.hypot(rig.x, rig.z)).toBeLessThanOrEqual(246.001);
  });

  it("reports terrain telemetry the HUD and audio can read", () => {
    const { state, world } = scenario("TELEMETRY");
    driveFlat(state, world, 90);
    const telemetry = activeRig(state).telemetry;
    expect(typeof telemetry.surfaceId).toBe("string");
    expect(telemetry.grip).toBeGreaterThan(0);
    expect(telemetry.slip).toBeGreaterThanOrEqual(0);
    expect(telemetry.slip).toBeLessThanOrEqual(1);
  });
});

describe("world memory", () => {
  it("cuts the terrain itself when ploughing, and only on soft ground", () => {
    const field = findSite("long-furrow")!;
    const { state, world } = scenario("PLOUGH");
    const rig = activeRig(state);
    rig.x = field.x - 12;
    // Offset away from the authored Long Furrow Drain Pump (local offset
    // (-11, 6) from the site centre; see infrastructure-network.ts), which
    // otherwise sits inside primary-action range of the drive path and wins
    // priority over the plough engage this test is exercising.
    rig.z = field.z - 16;
    rig.heading = Math.PI / 2;
    settleWorld(state, world);

    // Probe a fixed point the rig will drive across, not the rig's own moving
    // position — the ground under the rig is not the ground it ploughed.
    const probeX = rig.x + 6;
    const probeZ = rig.z;
    const before = world.terrain.height(probeX, probeZ);

    performPrimaryAction(state, world);
    expect(state.lastDiagnostic).toContain("plough");

    driveFlat(state, world, 420);

    expect(state.furrows.length).toBeGreaterThan(3);
    expect(world.terrain.deformationCount()).toBeGreaterThan(3);
    expect(world.terrain.height(probeX, probeZ)).toBeLessThan(before);
    expect(
      state.furrows.every((mark) => mark.rigId === "utility-tractor"),
    ).toBe(true);
  });

  it("does not let a rig without the plough capability cut ground", () => {
    const field = findSite("long-furrow")!;
    const { state, world } = scenario("NO-PLOUGH", "toy-buggy");
    const rig = activeRig(state);
    rig.x = field.x - 12;
    rig.z = field.z;
    rig.heading = Math.PI / 2;
    settleWorld(state, world);

    performPrimaryAction(state, world);
    const deformationsBefore = world.terrain.deformationCount();
    driveFlat(state, world, 300);

    expect(state.furrows).toHaveLength(0);
    expect(world.terrain.deformationCount()).toBe(deformationsBefore);
  });

  it("persists and restores spatial memory through the world snapshot", () => {
    const { state, world } = scenario("MEMORY");
    world.terrain.deform(HOME_SITE.x + 20, HOME_SITE.z, -0.2, 1);
    world.fell("t1:2:0");
    world.collect("3:4");
    world.noteSurveyed([12345, 12346]);

    const snapshot = JSON.parse(JSON.stringify(world.snapshot())) as unknown;
    const restored = new GameWorld(state.seed);
    restored.restore(snapshot);

    expect(restored.felledObstacles.has("t1:2:0")).toBe(true);
    expect(restored.collectedNodes.has("3:4")).toBe(true);
    expect(restored.surveyedCells.has(12345)).toBe(true);
    expect(restored.terrain.deformationCount()).toBe(
      world.terrain.deformationCount(),
    );
  });

  it("drops malformed spatial entries without discarding the good ones", () => {
    const world = new GameWorld("HOSTILE");
    world.restore({
      deformation: [
        { cx: 1, cz: 1, delta: -0.2 },
        { cx: Number.NaN, cz: 1, delta: -0.2 },
        null,
      ],
      felled: ["t1:1:0", "", 42, "x".repeat(200)],
      collected: ["1:1", null],
      surveyed: [10, -5, Number.POSITIVE_INFINITY],
    });

    expect(world.terrain.deformationCount()).toBeGreaterThan(0);
    expect(world.felledObstacles.has("t1:1:0")).toBe(true);
    expect(world.felledObstacles.size).toBe(1);
    expect(world.collectedNodes.size).toBe(1);
    expect(world.surveyedCells.size).toBe(1);
  });
});

describe("exploration and progression", () => {
  it("places salvage off the authored track network", () => {
    const world = new GameWorld("SALVAGE-PLACEMENT");
    const nodes = world.exploration.nodesNear(0, 0, 190, new Set());
    expect(nodes.length).toBeGreaterThan(20);
    for (const node of nodes) {
      expect(world.terrain.routeWeight(node.x, node.z)).toBeLessThanOrEqual(
        0.35,
      );
    }
  });

  it("collects a salvage node once and remembers it is gone", () => {
    const { state, world } = scenario("COLLECT");
    const rig = activeRig(state);
    const node = world.exploration.nodesNear(
      rig.x,
      rig.z,
      190,
      world.collectedNodes,
    )[0]!;
    rig.x = node.x;
    rig.z = node.z;

    performPrimaryAction(state, world);
    expect(state.salvage).toBe(node.value);
    expect(world.collectedNodes.has(node.id)).toBe(true);

    performPrimaryAction(state, world);
    expect(state.salvage).toBe(node.value);
    expect(
      world.exploration.nearestNode(
        node.x,
        node.z,
        SALVAGE_PICKUP_RADIUS,
        world.collectedNodes,
      ),
    ).toBeNull();
  });

  it("maps more of the world from a higher vantage over the same ground", () => {
    // The reason to climb: information. Elevation is isolated by holding the
    // ground position fixed and only raising the eye, so the assertion is about
    // the sightline mechanic rather than about one hand-picked hilltop.
    const world = new GameWorld("SURVEY");
    const ground = world.terrain.height(60, 60);

    const low = new Set<number>();
    world.exploration.survey(60, ground + 2.5, 60, 150, low);

    const high = new Set<number>();
    world.exploration.survey(60, ground + 45, 60, 150, high);

    expect(low.size).toBeGreaterThan(0);
    expect(high.size).toBeGreaterThan(low.size);
  });

  it("gives a survey mast a wider sweep than the bare rig", () => {
    const world = new GameWorld("MAST");
    const bare = effectiveProfile("utility-tractor", []);
    const masted = effectiveProfile("utility-tractor", ["survey-mast"]);
    expect(masted.surveyRange).toBeGreaterThan(bare.surveyRange);

    const withoutMast = new Set<number>();
    const withMast = new Set<number>();
    const eyeY = world.terrain.height(HOME_SITE.x, HOME_SITE.z) + 3;
    world.exploration.survey(
      HOME_SITE.x,
      eyeY,
      HOME_SITE.z,
      bare.surveyRange,
      withoutMast,
    );
    world.exploration.survey(
      HOME_SITE.x,
      eyeY,
      HOME_SITE.z,
      masted.surveyRange,
      withMast,
    );
    expect(withMast.size).toBeGreaterThan(withoutMast.size);
  });

  it("surveys cells as the rig drives", () => {
    const { state, world } = scenario("SURVEY-DRIVE");
    expect(world.surveyedCells.size).toBe(0);
    driveFlat(state, world, 300);
    expect(world.surveyedCells.size).toBeGreaterThan(4);
  });

  it("only installs modules at the workshop, and only when paid for", () => {
    const { state, world } = scenario("INSTALL");
    const rig = activeRig(state);

    // Away from the pad: refused regardless of funds.
    rig.x = 160;
    rig.z = -120;
    state.salvage = 99;
    installModule(state, world, "winch");
    expect(rig.modules).toHaveLength(0);
    expect(state.lastDiagnostic).toContain("workshop");

    // At the pad but broke: refused with the price.
    rig.x = HOME_SITE.x;
    rig.z = HOME_SITE.z;
    state.salvage = 1;
    installModule(state, world, "winch");
    expect(rig.modules).toHaveLength(0);
    expect(state.lastDiagnostic).toContain("salvage");

    // At the pad with funds: fitted, paid for, and not fittable twice.
    state.salvage = MODULES.winch.cost + 2;
    installModule(state, world, "winch");
    expect(rig.modules).toEqual(["winch"]);
    expect(state.salvage).toBe(2);

    installModule(state, world, "winch");
    expect(rig.modules).toEqual(["winch"]);
    expect(state.lastDiagnostic).toContain("already");
  });

  it("composes module effects onto the immutable blueprint without mutating it", () => {
    const base = RIG_PROFILES["toy-buggy"];
    const basePower = base.enginePower;
    const geared = effectiveProfile("toy-buggy", [
      "low-range-gearing",
      "lug-tires",
    ]);

    expect(geared.enginePower).toBeGreaterThan(basePower);
    expect(geared.topSpeed).toBeLessThan(base.topSpeed);
    expect(geared.lugBonus).toBeGreaterThan(base.lugBonus);
    // The blueprint is untouched, which is what makes a module list a save format.
    expect(RIG_PROFILES["toy-buggy"].enginePower).toBe(basePower);
    expect(RIG_PROFILES["toy-buggy"].topSpeed).toBe(base.topSpeed);
  });

  it("repairs only at the workshop and only for a price", () => {
    const { state } = scenario("REPAIR");
    const rig = activeRig(state);
    rig.condition = 40;

    rig.x = 150;
    rig.z = 150;
    state.salvage = 10;
    repairRig(state);
    expect(rig.condition).toBe(40);

    rig.x = HOME_SITE.x;
    rig.z = HOME_SITE.z;
    state.salvage = 0;
    repairRig(state);
    expect(rig.condition).toBe(40);

    state.salvage = 5;
    repairRig(state);
    expect(rig.condition).toBe(100);
    expect(state.salvage).toBe(2);
  });

  it("gates winch recovery behind the winch module", () => {
    const { state, world } = scenario("WINCH");
    const rig = activeRig(state);
    rig.x = 75;
    rig.z = -75;
    settleWorld(state, world);
    const strandedX = rig.x;

    winchRecover(state, world);
    // Without a winch the rig gets a basic nudge attempt.  At (140, 140) the
    // rig is within 60 m of the track network, so the nudge succeeds.
    expect(rig.x).not.toBe(strandedX);
    expect(state.lastDiagnostic).toContain("Nudged");
    const nudgedX = rig.x;
    const nudgedCondition = rig.condition;
    expect(nudgedX).not.toBe(0);
    expect(nudgedCondition).toBeGreaterThan(0);

    // Restore position and verify the winch path is strictly better.
    rig.x = strandedX;
    rig.z = 140;
    rig.condition = 100;
    settleWorld(state, world);

    rig.modules.push("winch");
    winchRecover(state, world);
    expect(rig.x).not.toBe(strandedX);
    expect(world.terrain.routeWeight(rig.x, rig.z)).toBeGreaterThan(0.9);
    expect(rig.mobility.kind).toBe("ground");
    if (rig.mobility.kind !== "ground") throw new Error("expected ground rig");
    expect(rig.mobility.grounded).toBe(true);
  });

  it("guarantees a reachable first salvage cache and collects it through the canonical action", () => {
    const { state, world } = scenario("FIRST-SALVAGE");
    const rig = activeRig(state);
    const node = world.exploration.nearestNode(
      rig.x,
      rig.z,
      70,
      world.collectedNodes,
    );

    expect(node?.id).toBe(FIRST_SALVAGE_NODE.id);
    expect(Math.hypot(node!.x - rig.x, node!.z - rig.z)).toBeLessThan(30);
    expect(world.terrain.routeWeight(node!.x, node!.z)).toBeLessThan(0.35);
    expect(world.terrain.sample(node!.x, node!.z, 1.2).slope).toBeLessThan(0.3);

    rig.x = node!.x;
    rig.z = node!.z;
    settleWorld(state, world);
    performPrimaryAction(state, world);

    expect(state.salvage).toBe(FIRST_SALVAGE_NODE.value);
    expect(state.salvageCollected).toBe(FIRST_SALVAGE_NODE.value);
    expect(world.collectedNodes.has(FIRST_SALVAGE_NODE.id)).toBe(true);
    expect(state.lastDiagnostic).toContain("Recovered");
  });

  it("disables a zero-condition rig and gives it one auditable emergency recovery", () => {
    const { state, world } = scenario("EMERGENCY-RECOVERY");
    const rig = activeRig(state);
    rig.x = -126;
    rig.z = -130;
    rig.condition = 0;
    settleWorld(state, world);
    const stranded = { x: rig.x, z: rig.z };

    driveFlat(state, world, 90);
    expect(rig.x).toBeCloseTo(stranded.x, 3);
    expect(rig.z).toBeCloseTo(stranded.z, 3);

    winchRecover(state, world);

    expect(Math.hypot(rig.x - HOME_SITE.x, rig.z - HOME_SITE.z)).toBeLessThan(
      20,
    );
    expect(rig.condition).toBe(EMERGENCY_RECOVERY_CONDITION);
    expect(state.recovery.emergencyCount).toBe(1);
    expect(state.recovery.lastEmergencyAtMs).toBe(state.elapsedMs);
    expect(state.salvage).toBe(0);
    expect(state.lastDiagnostic).toContain("Emergency field recovery");

    winchRecover(state, world);
    expect(state.recovery.emergencyCount).toBe(1);
    expect(state.lastDiagnostic).toContain("Nudged");
  });

  it("keeps world time monotonic while phase boundaries cycle and persist", () => {
    const { state, world } = scenario("WORLD-CLOCK");
    const elapsedAtStart = state.elapsedMs;

    expect(state.worldTimeMinutes).toBe(400);
    expect(state.phase).toBe("day");

    cyclePhase(state);
    expect(state.worldTimeMinutes).toBe(1125);
    expect(state.phase).toBe("gloam");
    expect(state.elapsedMs).toBe(elapsedAtStart);

    cyclePhase(state);
    expect(state.worldTimeMinutes).toBe(1340);
    expect(state.phase).toBe("night");

    const nightTime = state.worldTimeMinutes;
    cyclePhase(state);
    expect(state.worldTimeMinutes).toBeGreaterThan(nightTime);
    expect(worldMinuteOfDay(state.worldTimeMinutes)).toBe(400);
    expect(state.phase).toBe("day");

    state.worldTimeMinutes = 1124.9;
    state.phase = "day";
    advanceGame(state, world, 1000);
    expect(state.worldTimeMinutes).toBeGreaterThan(1125);
    expect(state.phase).toBe("gloam");

    const recovered = recoverState(JSON.parse(JSON.stringify(state)));
    expect(recovered?.worldTimeMinutes).toBeCloseTo(state.worldTimeMinutes, 5);
    expect(recovered?.phase).toBe("gloam");
  });

  it("publishes and recovers the unbound passage contract", () => {
    const { state, world } = scenario("UNBOUND-PASSAGE-STATE");
    expect(state.unboundPassage).toEqual(createUnboundPassageState());

    state.unboundPassage = {
      ...state.unboundPassage,
      status: "open",
      revision: 2,
      openedByRigId: "utility-tractor",
      openedByLaneId: "grade-and-brace",
    };
    selectActiveRig(state, "toy-buggy");

    const exposed = publicState(state, world) as {
      progression: {
        unboundPassage: {
          status: string;
          inheritedBenefitAvailable: boolean;
          openedByRigId: string | null;
          openedByLaneId: string | null;
          explanation: string;
        };
      };
    };

    expect(exposed.progression.unboundPassage.status).toBe("open");
    expect(exposed.progression.unboundPassage.inheritedBenefitAvailable).toBe(
      true,
    );
    expect(exposed.progression.unboundPassage.openedByRigId).toBe(
      "utility-tractor",
    );
    expect(exposed.progression.unboundPassage.openedByLaneId).toBe(
      "grade-and-brace",
    );
    expect(exposed.progression.unboundPassage.explanation).toContain(
      "inherited route",
    );

    const recovered = recoverState(JSON.parse(JSON.stringify(state)));
    expect(recovered?.unboundPassage).toEqual(state.unboundPassage);
  });

  it("publishes the current first-rung summary from canonical state", () => {
    const { state, world } = scenario("FIRST-RUNG-PUBLIC-STATE");
    state.salvage = 5;
    const exposed = publicState(state, world) as {
      progression: {
        firstRung: {
          stage: string;
          objective: string;
          recommendedModuleId: string | null;
          recommendedRigId: string | null;
          target: { x: number; z: number } | null;
          affordable: boolean;
          complete: boolean;
          reason: string;
        };
        workshopActionable: boolean;
      };
    };
    const resolved = resolveFirstRung(state, world.collectedNodes, world);

    expect(exposed.progression.firstRung).toMatchObject({
      stage: resolved.stage,
      objective: resolved.objective,
      recommendedModuleId: resolved.recommendedModuleId,
      recommendedRigId: resolved.recommendedRigId,
      target: resolved.target,
      affordable: resolved.affordable,
      complete: resolved.complete,
      reason: resolved.reason,
    });
    expect(exposed.progression.workshopActionable).toBe(true);
  });
});

describe("collision", () => {
  it("generates the same obstacle field for the same seed and a different one otherwise", () => {
    const a = new GameWorld("OBSTACLES").obstacles.near(0, 0, 90);
    const b = new GameWorld("OBSTACLES").obstacles.near(0, 0, 90);
    const c = new GameWorld("OBSTACLES-OTHER").obstacles.near(0, 0, 90);

    expect(a.length).toBeGreaterThan(0);
    expect(a.map((item) => item.id)).toEqual(b.map((item) => item.id));
    expect(a.map((item) => item.id)).not.toEqual(c.map((item) => item.id));
  });

  it("keeps obstacles off the authored tracks and out of the water", () => {
    const world = new GameWorld("OBSTACLE-RULES");
    for (const obstacle of world.obstacles.near(0, 0, 190)) {
      expect(
        world.terrain.routeWeight(obstacle.x, obstacle.z),
      ).toBeLessThanOrEqual(0.25);
      expect(world.obstacles).toBeDefined();
      expect(obstacle.groundY).toBeGreaterThan(0);
    }
  });

  it("pushes a rig out of the authored Launch Ridge rocket", () => {
    const { state, world } = scenario("LAUNCH-STRUCTURE-COLLISION");
    const rig = activeRig(state);
    const launch = findSite("launch-ridge");
    if (!launch) throw new Error("missing Launch Ridge fixture");
    const profile = effectiveProfile(rig.id, rig.modules);
    const rigRadius = profile.track * 0.5 + 0.25;
    const rocketRadius = 1.5;

    // Simulate an old save or earlier collision-less build that left the rig
    // inside the visible landmark.
    rig.x = launch.x;
    rig.z = launch.z + 0.2;
    rig.heading = 0;
    rig.speed = 4;
    settleWorld(state, world);

    stepGame(state, world, IDLE, FIXED_STEP_SECONDS);

    expect(
      Math.hypot(rig.x - launch.x, rig.z - launch.z),
    ).toBeGreaterThanOrEqual(rigRadius + rocketRadius - 0.001);
  });

  it("lets a heavy rig fell a tree that stops a light one", () => {
    const world = new GameWorld("FELL");
    const tree = world.obstacles
      .near(0, 0, 190)
      .find((item) => item.kind === "tree" && item.radius <= 0.75)!;
    expect(tree).toBeDefined();

    const heavy = { x: tree.x + 0.2, z: tree.z, speed: 7, heading: 0 };
    const heavyOutcome = world.obstacles.resolve(heavy, 1.5, 4.8, new Set());
    expect(heavyOutcome.felled?.id).toBe(tree.id);

    const light = { x: tree.x + 0.2, z: tree.z, speed: 7, heading: 0 };
    const lightOutcome = world.obstacles.resolve(light, 1.4, 1.2, new Set());
    expect(lightOutcome.felled).toBeNull();
    expect(lightOutcome.blockedBy?.id).toBe(tree.id);
    expect(Math.hypot(light.x - tree.x, light.z - tree.z)).toBeGreaterThan(0.2);
  });

  it("ignores obstacles the player already knocked down", () => {
    const world = new GameWorld("FELLED-IGNORED");
    const tree = world.obstacles
      .near(0, 0, 190)
      .find((item) => item.kind === "tree")!;
    const rig = { x: tree.x, z: tree.z, speed: 6, heading: 0 };
    const outcome = world.obstacles.resolve(rig, 1.5, 4.8, new Set([tree.id]));
    expect(outcome.hit).toBe(false);
    expect(rig.x).toBe(tree.x);
  });
});

describe("cargo relay", () => {
  it("emits a versioned accepted or rejected outcome for primary-action commands", () => {
    const { state, world } = scenario("PRIMARY-ACTION-EVENT");
    const rig = activeRig(state);
    rig.x = CARGO_PICKUP.x;
    rig.z = CARGO_PICKUP.z;
    settleWorld(state, world);

    expect(
      executePrimaryActionCommand(state, world, {
        version: PRIMARY_ACTION_COMMAND_VERSION,
        type: "primary-action",
        actorId: rig.id,
      }),
    ).toEqual({
      version: PRIMARY_ACTION_EVENT_VERSION,
      type: "primary-action-resolved",
      command: {
        version: PRIMARY_ACTION_COMMAND_VERSION,
        type: "primary-action",
        actorId: rig.id,
      },
      action: "attach-cargo",
      outcome: "accepted",
    });

    expect(
      executePrimaryActionCommand(state, world, {
        version: PRIMARY_ACTION_COMMAND_VERSION,
        type: "primary-action",
        actorId: "toy-buggy",
      }),
    ).toEqual({
      version: PRIMARY_ACTION_EVENT_VERSION,
      type: "primary-action-resolved",
      command: {
        version: PRIMARY_ACTION_COMMAND_VERSION,
        type: "primary-action",
        actorId: "toy-buggy",
      },
      action: "none",
      outcome: "rejected",
      reasonCode: "inactive-actor",
    });
  });

  it("runs the complete workflow for either towing rig", () => {
    for (const rigId of ["utility-tractor", "toy-buggy"] as const) {
      const { state, world } = scenario(`RELAY-${rigId}`, rigId);
      const rig = activeRig(state);
      rig.x = CARGO_PICKUP.x;
      rig.z = CARGO_PICKUP.z;
      settleWorld(state, world);

      performPrimaryAction(state, world);
      expect(state.cargoRelay.status).toBe("active");
      expect(state.cargoRelay.cargo.attachedRigId).toBe(rigId);

      rig.x = CARGO_DELIVERY.x;
      rig.z = CARGO_DELIVERY.z;
      stepGame(state, world);

      expect(state.cargoRelay.status).toBe("complete");
      expect(state.cargoRelay.cargo.delivered).toBe(true);
      expect(state.cargoRelay.cargo.attachedRigId).toBeNull();
      expect(state.cargoRelay.bestTimeMs).not.toBeNull();
    }
  });

  it("applies towing penalties through profiles while preserving different feel", () => {
    const tractor = RIG_PROFILES["utility-tractor"];
    const buggy = RIG_PROFILES["toy-buggy"];

    expect(tractor.topSpeed * tractor.towSpeedMultiplier).toBeGreaterThan(8);
    expect(buggy.topSpeed * buggy.towSpeedMultiplier).toBeLessThan(
      buggy.topSpeed * 0.6,
    );
    expect(buggy.topSpeed).toBeGreaterThan(tractor.topSpeed);
    expect(tractor.mass).toBeGreaterThan(buggy.mass * 3);
  });

  it("lets the jump-capable buggy launch while the tractor stays grounded", () => {
    const buggyRun = scenario("BUGGY-JUMP", "toy-buggy");
    const buggy = activeRig(buggyRun.state);
    buggy.x = BUGGY_RAMP.x;
    buggy.z = BUGGY_RAMP.z;
    settleWorld(buggyRun.state, buggyRun.world);
    buggy.speed = BUGGY_RAMP.minimumSpeed + 1;
    const buggyRest = buggy.y;
    stepGame(buggyRun.state, buggyRun.world);

    const tractorRun = scenario("TRACTOR-RAMP");
    const tractor = activeRig(tractorRun.state);
    tractor.x = BUGGY_RAMP.x;
    tractor.z = BUGGY_RAMP.z;
    settleWorld(tractorRun.state, tractorRun.world);
    tractor.speed = BUGGY_RAMP.minimumSpeed + 1;
    stepGame(tractorRun.state, tractorRun.world);

    expect(buggy.mobility.kind).toBe("ground");
    expect(tractor.mobility.kind).toBe("ground");
    if (
      buggy.mobility.kind !== "ground" ||
      tractor.mobility.kind !== "ground"
    ) {
      throw new Error("expected ground rigs");
    }
    expect(buggy.mobility.grounded).toBe(false);
    expect(buggy.y).toBeGreaterThan(buggyRest);
    expect(tractor.mobility.grounded).toBe(true);
  });
});

describe("save recovery and migration", () => {
  it("preserves a selected top-down camera in the current save schema", () => {
    const saved = createInitialState("CAMERA-RECOVERY");
    saved.cameraMode = "top-down";

    expect(recoverState(saved)?.cameraMode).toBe("top-down");
  });

  it("tracks arrival bargain acceptance and refusal", () => {
    const state = createInitialState("ARRIVAL-BARGAIN");
    expect(state.arrivalBargain.status).toBe("unseen");

    acceptArrivalBargain(state);
    expect(state.arrivalBargain.status).toBe("accepted");
    expect(state.lastDiagnostic).toContain("Fix the tractor");

    const fresh = createInitialState("ARRIVAL-BARGAIN-REFUSE");
    refuseArrivalBargain(fresh);
    expect(fresh.arrivalBargain.status).toBe("refused");
    expect(fresh.lastDiagnostic).toContain("offer stands");
  });

  it("defaults arrival bargain to accepted for saves that already started the tractor", () => {
    const legacy = JSON.parse(
      JSON.stringify(createInitialState("V26-ARRIVAL-MIGRATION")),
    ) as {
      schemaVersion: number;
      restoration: { firstStart: boolean };
      arrivalBargain?: { status: string };
    };
    legacy.schemaVersion = PREVIOUS_SAVE_SCHEMA_VERSION;
    legacy.restoration.firstStart = true;
    delete legacy.arrivalBargain;

    const recovered = recoverState(legacy);
    expect(recovered?.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(recovered?.arrivalBargain.status).toBe("accepted");
  });

  it("defaults arrival bargain to unseen for fresh-looking legacy saves", () => {
    const legacy = JSON.parse(
      JSON.stringify(createInitialState("V26-ARRIVAL-FRESH")),
    ) as {
      schemaVersion: number;
      restoration: { firstStart: boolean };
      arrivalBargain?: { status: string };
    };
    legacy.schemaVersion = PREVIOUS_SAVE_SCHEMA_VERSION;
    legacy.restoration.firstStart = false;
    delete legacy.arrivalBargain;

    const recovered = recoverState(legacy);
    expect(recovered?.arrivalBargain.status).toBe("unseen");
  });
});

describe("farm waterworks choice", () => {
  let world: GameWorld;
  beforeEach(() => {
    world = new GameWorld("WATERWORKS");
  });

  it("rejects the waterworks choice before the tractor has started", () => {
    const state = createInitialState("WATERWORKS-EARLY");
    state.activeRigId = "utility-tractor";
    state.rigs["utility-tractor"].x = HOME_SITE.x;
    state.rigs["utility-tractor"].z = HOME_SITE.z;
    const ok = chooseFarmWaterworks(state, world, "repair-pump");
    expect(ok).toBe(false);
    expect(state.farmWaterworks.choice).toBe("unresolved");
  });

  it("rejects the waterworks choice away from the Home Silo workshop", () => {
    const state = createInitialState("WATERWORKS-FAR");
    state.activeRigId = "utility-tractor";
    state.restoration.firstStart = true;
    state.rigs["utility-tractor"].x = 200;
    state.rigs["utility-tractor"].z = 200;
    const ok = chooseFarmWaterworks(state, world, "repair-pump");
    expect(ok).toBe(false);
    expect(state.farmWaterworks.choice).toBe("unresolved");
  });

  it("commits the repair-pump branch and powers the drain pump", () => {
    const state = createInitialState("WATERWORKS-REPAIR");
    state.activeRigId = "utility-tractor";
    state.restoration.firstStart = true;
    state.rigs["utility-tractor"].x = HOME_SITE.x;
    state.rigs["utility-tractor"].z = HOME_SITE.z;
    const ok = chooseFarmWaterworks(state, world, "repair-pump");
    expect(ok).toBe(true);
    expect(state.farmWaterworks.choice).toBe("repair-pump");
    expect(
      state.infrastructure.entities["long-furrow-drain-pump"].commandedOn,
    ).toBe(true);
    expect(state.settlements["long-furrow"].condition).toBe("workable");
    expect(state.lastDiagnostic).toContain("Pump repaired");
  });

  it("commits the redirect-channel branch and floods the low approach", () => {
    const state = createInitialState("WATERWORKS-REDIRECT");
    state.activeRigId = "utility-tractor";
    state.restoration.firstStart = true;
    state.rigs["utility-tractor"].x = HOME_SITE.x;
    state.rigs["utility-tractor"].z = HOME_SITE.z;
    const ok = chooseFarmWaterworks(state, world, "redirect-channel");
    expect(ok).toBe(true);
    expect(state.farmWaterworks.choice).toBe("redirect-channel");
    expect(
      state.infrastructure.entities["long-furrow-drain-pump"].commandedOn,
    ).toBe(false);
    expect(state.settlements["long-furrow"].condition).toBe("waterlogged");
    expect(state.lastDiagnostic).toContain("Channel redirected");
  });

  it("rejects a second waterworks decision", () => {
    const state = createInitialState("WATERWORKS-LOCKED");
    state.activeRigId = "utility-tractor";
    state.restoration.firstStart = true;
    state.rigs["utility-tractor"].x = HOME_SITE.x;
    state.rigs["utility-tractor"].z = HOME_SITE.z;
    chooseFarmWaterworks(state, world, "repair-pump");
    const ok = chooseFarmWaterworks(state, world, "redirect-channel");
    expect(ok).toBe(false);
    expect(state.farmWaterworks.choice).toBe("repair-pump");
  });
});

// Binding proof for GAME_DIRECTOR_AUDIT_2026-08-12.md GD-03: the pure
// first-night-threat module has its own full unit coverage in
// first-night-threat.test.ts; these prove stepGame actually calls it, per
// motto_v5.md §0.5.1 ("prove the binding, not only the contract").
describe("first-night threat binding in stepGame", () => {
  it("resolves once stepGame reads night phase, and never before", () => {
    const { state, world } = scenario("NIGHT-THREAT-BINDING");
    expect(state.firstNightThreat.status).toBe("pending");

    stepGame(state, world, IDLE, FIXED_STEP_SECONDS);
    expect(state.firstNightThreat.status).toBe("pending");

    state.phase = "night";
    stepGame(state, world, IDLE, FIXED_STEP_SECONDS);
    expect(state.firstNightThreat.status).toBe("resolved");
  });

  it("orients to the surveyed north-field signal instead of the farm", () => {
    const { state, world } = scenario("NIGHT-THREAT-SIGNAL");
    const northField = findSite("north-field");
    state.northFieldInvestigation = {
      status: "scanned",
      scannedAtWorldMinutes: state.worldTimeMinutes,
      anomalyDepthMeters: null,
    };
    state.phase = "night";

    stepGame(state, world, IDLE, FIXED_STEP_SECONDS);

    expect(state.firstNightThreat.variant).toBe("signal-drawn");
    expect(state.firstNightThreat.originX).toBe(northField?.x);
    expect(state.firstNightThreat.originZ).toBe(northField?.z);
    // Not asserting state.lastDiagnostic here: a fresh scenario() state has
    // an empty discoveries[], so the same stepGame call also fires the
    // unrelated "Home Silo discovered" landmark message, which overwrites
    // this single-slot field afterward. In real play Home Silo is discovered
    // hours before the first night, so that collision cannot occur; the
    // diagnostic text itself is already covered by
    // first-night-threat.test.ts's firstNightThreatDiagnostic suite.
  });

  it("falls back to a farm-directed storm when the north field was never surveyed", () => {
    const { state, world } = scenario("NIGHT-THREAT-STORM");
    state.phase = "night";

    stepGame(state, world, IDLE, FIXED_STEP_SECONDS);

    expect(state.firstNightThreat.variant).toBe("storm-pressure");
    expect(state.firstNightThreat.originX).toBe(HOME_SITE.x);
    expect(state.firstNightThreat.originZ).toBe(HOME_SITE.z);
  });

  it("places a real collidable obstacle at the resolved origin once stepGame resolves the threat", () => {
    const { state, world } = scenario("NIGHT-THREAT-OBSTACLE");
    const northField = findSite("north-field");
    state.northFieldInvestigation = {
      status: "scanned",
      scannedAtWorldMinutes: state.worldTimeMinutes,
      anomalyDepthMeters: null,
    };
    state.phase = "night";

    expect(firstNightThreatObstacles(state.firstNightThreat, world)).toEqual(
      [],
    );

    stepGame(state, world, IDLE, FIXED_STEP_SECONDS);

    const obstacles = firstNightThreatObstacles(
      state.firstNightThreat,
      world,
    );
    expect(obstacles).toHaveLength(1);
    const [obstacle] = obstacles;
    expect(obstacle?.id).toBe("incident:first-night-threat");
    expect(obstacle?.x).toBe(northField?.x);
    expect(obstacle?.z).toBe(northField?.z);
    expect(obstacle?.fellable).toBe(false);
    // world.incidentObstacles() (the separate Quarry Runout channel) is
    // untouched — the two hazards are composed at each collision call site
    // in stepGame, not merged into one authority.
    expect(world.incidentObstacles()).toHaveLength(0);
  });

  it("does not re-roll the variant if the survey happens after the threat already resolved", () => {
    const { state, world } = scenario("NIGHT-THREAT-LOCKED");
    state.phase = "night";
    stepGame(state, world, IDLE, FIXED_STEP_SECONDS);
    expect(state.firstNightThreat.variant).toBe("storm-pressure");

    state.northFieldInvestigation = {
      status: "scanned",
      scannedAtWorldMinutes: state.worldTimeMinutes,
      anomalyDepthMeters: null,
    };
    stepGame(state, world, IDLE, FIXED_STEP_SECONDS);
    expect(state.firstNightThreat.variant).toBe("storm-pressure");
  });
});

// Binding proof for GAME_DIRECTOR_AUDIT_2026-08-12.md GD-02: the pure
// open-world-promise module has its own full unit coverage in
// open-world-promise.test.ts; these prove stepGame actually calls it.
describe("open-world-promise finale binding in stepGame", () => {
  function markCausewayReopened(state: GameState): void {
    const record = state.settlements["sunken-flats"];
    state.settlements["sunken-flats"] = {
      condition: record?.condition ?? "workable",
      favor: record?.favor ?? 0,
      completedNeedIds: [
        ...(record?.completedNeedIds ?? []),
        "sunken-flats-causeway",
      ],
      contributions: record?.contributions ?? [],
      adaptations: record?.adaptations ?? [],
    };
  }

  it("stays pending until the night is survived, the waterworks are settled, and the causeway reopens", () => {
    const { state, world } = scenario("PROMISE-PENDING");
    state.phase = "night";
    stepGame(state, world, IDLE, FIXED_STEP_SECONDS);
    // firstNightThreat resolves on this step, but waterworks and the
    // causeway are still unresolved, so the promise must stay pending.
    expect(state.firstNightThreat.status).toBe("resolved");
    expect(state.openWorldPromise.status).toBe("pending");
  });

  it("reveals once all three prior beats are true, switches to survey camera, and narrates the vista", () => {
    const { state, world } = scenario("PROMISE-REVEALED");
    state.activeRigId = "utility-tractor";
    state.restoration.firstStart = true;
    state.rigs["utility-tractor"].x = HOME_SITE.x;
    state.rigs["utility-tractor"].z = HOME_SITE.z;
    chooseFarmWaterworks(state, world, "repair-pump");
    markCausewayReopened(state);
    state.phase = "night";
    state.cameraMode = "chase";

    stepGame(state, world, IDLE, FIXED_STEP_SECONDS);

    expect(state.openWorldPromise.status).toBe("revealed");
    expect(state.cameraMode).toBe("survey");
    // Not asserting state.lastDiagnostic here: a fresh scenario() state has
    // an empty discoveries[], so the same stepGame call also fires the
    // unrelated "Home Silo discovered" landmark message afterward, which
    // overwrites this single-slot field (same artifact documented on the
    // first-night-threat binding tests above). In real play Home Silo is
    // discovered hours before this finale can fire; the narration text
    // itself is covered by open-world-promise.test.ts.
  });

  it("does not re-narrate or reset the camera on later frames once revealed", () => {
    const { state, world } = scenario("PROMISE-ONCE");
    state.activeRigId = "utility-tractor";
    state.restoration.firstStart = true;
    state.rigs["utility-tractor"].x = HOME_SITE.x;
    state.rigs["utility-tractor"].z = HOME_SITE.z;
    chooseFarmWaterworks(state, world, "repair-pump");
    markCausewayReopened(state);
    state.phase = "night";
    stepGame(state, world, IDLE, FIXED_STEP_SECONDS);
    expect(state.openWorldPromise.status).toBe("revealed");

    state.cameraMode = "hood";
    state.lastDiagnostic = "unrelated later message";
    stepGame(state, world, IDLE, FIXED_STEP_SECONDS);

    // The finale does not fight the player's later camera choice or
    // overwrite unrelated later diagnostics once it has already fired.
    expect(state.cameraMode).toBe("hood");
    expect(state.lastDiagnostic).toBe("unrelated later message");
  });
});

describe("save recovery and migration", () => {
  let world: GameWorld;
  beforeEach(() => {
    world = new GameWorld("RECOVERY");
  });

  it("migrates predecessor schemas and filters unknown persisted capabilities", () => {
    const source = createInitialState("SCHEMA-PREDECESSOR");
    const makeLegacy = (schemaVersion: number) => {
      const legacy = JSON.parse(JSON.stringify(source)) as Record<
        string,
        unknown
      >;
      legacy.schemaVersion = schemaVersion;
      legacy.progression = {
        journeys: source.progression.journeys,
        mastery: {
          "utility-tractor": {
            tow: {
              rank: "novice",
              points: 2,
              situations: {},
            },
            "future-capability": {
              rank: "master",
              points: 999,
              situations: {},
            },
          },
        },
        insight: 3,
        completedMilestones: [],
      };
      return legacy;
    };

    for (const schemaVersion of [
      V8_SAVE_SCHEMA_VERSION,
      PREVIOUS_SAVE_SCHEMA_VERSION,
    ]) {
      const recovered = recoverState(makeLegacy(schemaVersion));
      expect(recovered?.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
      expect(recovered?.lastDiagnostic).toContain(`Schema v${schemaVersion}`);
      expect(recovered?.progression.mastery["utility-tractor"]).toEqual({
        tow: {
          rank: "novice",
          points: 2,
          situations: {},
        },
      });
    }
  });

  it("moves only pristine inactive v5 Drift state into the Home berth", () => {
    const marsh = findSite("sunken-flats");
    if (!marsh) throw new Error("missing Sunken Flats fixture");

    const pristine = JSON.parse(
      JSON.stringify(createInitialState("V5-PRISTINE-DRIFT")),
    ) as Record<string, unknown> & {
      rigs: Record<RigId, { x: number; z: number; distanceTravelled: number }>;
    };
    pristine.schemaVersion = 5;
    pristine.rigs["marsh-skimmer"].x = marsh.x + 8;
    pristine.rigs["marsh-skimmer"].z = marsh.z + 5;
    const migrated = recoverState(pristine);
    expect(migrated?.rigs["marsh-skimmer"].x).toBe(
      RIG_HOME_BERTHS["marsh-skimmer"].x,
    );
    expect(migrated?.rigs["marsh-skimmer"].z).toBe(
      RIG_HOME_BERTHS["marsh-skimmer"].z,
    );
    expect(migrated?.lastDiagnostic).toContain("Untouched Drift");

    const used = JSON.parse(JSON.stringify(pristine)) as typeof pristine;
    used.rigs["marsh-skimmer"].distanceTravelled = 1;
    const preserved = recoverState(used);
    expect(preserved?.rigs["marsh-skimmer"].x).toBeCloseTo(marsh.x + 8, 6);
    expect(preserved?.rigs["marsh-skimmer"].z).toBeCloseTo(marsh.z + 5, 6);
    expect(preserved?.lastDiagnostic).toContain("positions preserved");
  });

  it("migrates a Field Test 001 (v1) record without discarding its trail", () => {
    const recovered = recoverState({
      schemaVersion: 1,
      seed: "LEGACY",
      elapsedMs: 2400,
      phase: "gloam",
      cameraMode: "tactical",
      paused: false,
      vehicle: {
        x: 12,
        z: -8,
        heading: 1.4,
        speed: 4,
        steering: 0.25,
        ploughLowered: true,
        distanceTravelled: 88,
        wheelRotation: 42,
      },
      furrows: [{ x: 1, z: 2, heading: 0.3, createdAt: 100 }],
      discoveries: [{ id: "home-silo", discoveredAt: 200 }],
      lastDiagnostic: null,
    } as unknown);

    expect(recovered?.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(recovered?.rigs["utility-tractor"].x).toBe(12);
    expect(recovered?.rigs["utility-tractor"].attachments[0]?.engaged).toBe(
      true,
    );
    expect(recovered?.rigs["toy-buggy"].id).toBe("toy-buggy");
    expect(recovered?.discoveries[0]?.id).toBe("home-silo");
    expect(recovered?.rigs["utility-tractor"].modules).toEqual([]);
  });

  it("migrates a Field 02 legacy record without rewriting ground rigs as hover rigs", () => {
    const source = createInitialState("FIELD-02-MIGRATION");
    source.activeRigId = "toy-buggy";
    source.rigs["utility-tractor"].distanceTravelled = 143;
    const flattenGroundRig = (id: "utility-tractor" | "toy-buggy") => {
      const rig = source.rigs[id];
      if (rig.mobility.kind !== "ground") {
        throw new Error("expected legacy ground rig");
      }
      const { mobility, ...shared } = rig;
      return { ...shared, ...mobility };
    };
    const legacyField02 = {
      ...source,
      schemaVersion: 3,
      rigs: {
        "utility-tractor": flattenGroundRig("utility-tractor"),
        "toy-buggy": flattenGroundRig("toy-buggy"),
      },
    };

    const recovered = recoverState(
      JSON.parse(JSON.stringify(legacyField02)) as unknown,
    );

    expect(recovered?.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(recovered?.activeRigId).toBe("toy-buggy");
    expect(recovered?.rigs["utility-tractor"].distanceTravelled).toBe(143);
    expect(recovered?.rigs["utility-tractor"].mobility.kind).toBe("ground");
    expect(recovered?.rigs["toy-buggy"].mobility.kind).toBe("ground");
    expect(recovered?.rigs["marsh-skimmer"].mobility.kind).toBe("hover");
    expect(recovered?.lastDiagnostic).toContain("Drift");
  });

  it("migrates a Rig Lab 01 (v2) record and re-settles it onto terrain", () => {
    const v2 = {
      schemaVersion: 2,
      seed: "RIGLAB",
      elapsedMs: 9000,
      phase: "day",
      cameraMode: "chase",
      paused: false,
      activeRigId: "toy-buggy",
      rigs: {
        "utility-tractor": {
          id: "utility-tractor",
          x: 30,
          y: 0,
          z: -10,
          heading: 1,
          speed: 2,
          steering: 0,
          verticalVelocity: 0,
          grounded: true,
          jumpCooldownMs: 0,
          distanceTravelled: 120,
          wheelRotation: 9,
          condition: 71,
          attachments: [
            { id: "field-plough", engaged: true },
            { id: "tow-hook", engaged: false },
          ],
        },
        "toy-buggy": {
          id: "toy-buggy",
          x: -12,
          y: 0,
          z: 4,
          heading: 0,
          speed: 0,
          steering: 0,
          verticalVelocity: 0,
          grounded: true,
          jumpCooldownMs: 0,
          distanceTravelled: 40,
          wheelRotation: 3,
          condition: 95,
          attachments: [{ id: "tow-hook", engaged: false }],
        },
      },
      cargoRelay: {
        id: "cargo-relay",
        status: "ready",
        startedAt: null,
        completedAt: null,
        bestTimeMs: null,
        cargo: {
          id: "relay-cargo",
          x: 11,
          y: 0.65,
          z: -2,
          heading: 0,
          attachedRigId: null,
          delivered: false,
        },
      },
      furrows: [],
      discoveries: [],
      lastDiagnostic: null,
    };

    const recovered = recoverState(v2);
    expect(recovered?.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(recovered?.activeRigId).toBe("toy-buggy");
    expect(recovered?.rigs["utility-tractor"].condition).toBe(71);
    expect(recovered?.rigs["utility-tractor"].attachments[0]?.engaged).toBe(
      true,
    );
    expect(recovered?.salvage).toBe(0);

    // Positions from the flat plane must end up on the ground, not under it.
    settleWorld(recovered!, world);
    for (const id of ["utility-tractor", "toy-buggy"] as const) {
      const rig = recovered!.rigs[id];
      expect(rig.y).toBeGreaterThan(world.terrain.height(rig.x, rig.z));
    }
  });

  it("rejects incompatible saves and clamps recoverable values into the disc", () => {
    expect(recoverState({ schemaVersion: 99 })).toBeNull();

    const state = createInitialState("RECOVER");
    const mismatched = JSON.parse(JSON.stringify(state)) as {
      rigs: { "marsh-skimmer": { mobility: { kind: string } } };
    };
    mismatched.rigs["marsh-skimmer"].mobility.kind = "ground";
    expect(recoverState(mismatched)).toBeNull();

    state.rigs["toy-buggy"].x = 9999;
    state.rigs["toy-buggy"].z = 0;
    state.rigs["toy-buggy"].condition = -10;
    const recovered = recoverState(
      JSON.parse(JSON.stringify(state)) as unknown,
    );

    expect(recovered).not.toBeNull();
    expect(
      Math.hypot(
        recovered!.rigs["toy-buggy"].x,
        recovered!.rigs["toy-buggy"].z,
      ),
    ).toBeCloseTo(246, 3);
    expect(recovered?.rigs["toy-buggy"].condition).toBe(0);
  });

  it("drops module ids that do not exist or do not fit", () => {
    const state = createInitialState("MODULE-RECOVERY");
    const serialized = JSON.parse(JSON.stringify(state)) as {
      rigs: Record<string, { modules: unknown }>;
    };
    serialized.rigs["utility-tractor"]!.modules = [
      "winch",
      "not-a-module",
      "winch",
      17,
    ];
    const recovered = recoverState(serialized);
    expect(recovered?.rigs["utility-tractor"].modules).toEqual(["winch"]);
  });

  it("rejects internally contradictory activity state", () => {
    const state = createInitialState("CONTRADICTORY-RELAY");
    state.cargoRelay.status = "complete";
    state.cargoRelay.cargo.delivered = false;

    expect(
      recoverState(JSON.parse(JSON.stringify(state)) as unknown),
    ).toBeNull();
  });
});

describe("surface grip identity", () => {
  /**
   * The central design claim of the traversal model, asserted as a table.
   *
   * The buggy's slicks must win on firm ground and the tractor's lugs must win on
   * soft ground, with the crossover *above* tilled soil so the field is genuinely
   * the tractor's home ground. Verified against the live runtime; this test is
   * what stops a surface-table edit from silently inverting it.
   */
  it("gives firm ground to the buggy and soft ground to the tractor", () => {
    const tractor = effectiveProfile("utility-tractor", []);
    const buggy = effectiveProfile("toy-buggy", []);
    const grip = (surface: keyof typeof SURFACES, profile: typeof tractor) =>
      effectiveGrip(SURFACES[surface].grip, profile.tireGrip, profile.lugBonus);

    for (const firm of ["track", "rock"] as const) {
      expect(grip(firm, buggy), firm).toBeGreaterThan(grip(firm, tractor));
    }
    for (const soft of ["tilled", "sand", "mud", "water"] as const) {
      expect(grip(soft, tractor), soft).toBeGreaterThan(grip(soft, buggy));
    }
    // The advantage has to be decisive where it matters most, not a rounding
    // error. It widens as the surface worsens, because `lugBonus` recovers a
    // fraction of what the surface lacks: ~1.25x in mud, ~1.9x in standing water.
    expect(grip("mud", tractor)).toBeGreaterThan(grip("mud", buggy) * 1.2);
    expect(grip("water", tractor)).toBeGreaterThan(grip("water", buggy) * 1.7);
  });
});

describe("blade mode", () => {
  it("cuts by default and fills when flipped, changing what the ground is", () => {
    const field = findSite("long-furrow")!;
    const { state, world } = scenario("BLADE");
    const rig = activeRig(state);
    const plough = rig.attachments.find((a) => a.id === "field-plough")!;
    expect(plough.mode).toBe("cut");

    // Cut a trench first so there is something to fill back.
    rig.x = field.x;
    rig.z = field.z;
    settleWorld(state, world);
    const baseline = world.terrain.height(field.x, field.z);
    for (let i = 0; i < 30; i += 1) {
      world.terrain.deform(field.x, field.z, -0.05, 0);
    }
    const cutHeight = world.terrain.height(field.x, field.z);
    expect(cutHeight).toBeLessThan(baseline);

    toggleBladeMode(state);
    expect(plough.mode).toBe("fill");
    expect(state.lastDiagnostic).toContain("FILL");

    // Fill mode raises the same ground back up.
    for (let i = 0; i < 30; i += 1) {
      world.terrain.deform(field.x, field.z, 0.05, 0);
    }
    expect(world.terrain.height(field.x, field.z)).toBeGreaterThan(cutHeight);

    toggleBladeMode(state);
    expect(plough.mode).toBe("cut");
  });

  it("refuses on a rig with no blade and says which rig has one", () => {
    const { state } = scenario("BLADE-NONE", "toy-buggy");
    toggleBladeMode(state);
    expect(state.lastDiagnostic).toContain("no blade");
    expect(state.lastDiagnostic).toContain("Torque");
  });

  it("persists the blade mode through a save round trip", () => {
    const { state } = scenario("BLADE-SAVE");
    toggleBladeMode(state);
    const recovered = recoverState(
      JSON.parse(JSON.stringify(state)) as unknown,
    );
    const plough = recovered!.rigs["utility-tractor"].attachments.find(
      (a) => a.id === "field-plough",
    )!;
    expect(plough.mode).toBe("fill");
  });

  it("defaults a pre-blade save record to cut rather than undefined", () => {
    const state = createInitialState("BLADE-LEGACY");
    const serialized = JSON.parse(JSON.stringify(state)) as {
      rigs: Record<string, { attachments: { id: string; mode?: unknown }[] }>;
    };
    for (const attachment of serialized.rigs["utility-tractor"]!.attachments) {
      delete attachment.mode;
    }
    const recovered = recoverState(serialized);
    const plough = recovered!.rigs["utility-tractor"].attachments.find(
      (a) => a.id === "field-plough",
    )!;
    expect(plough.mode).toBe("cut");
  });
});

describe("rig switching is a place, not a menu", () => {
  it("refuses to switch to a rig that is too far away, and says how far", () => {
    const { state } = scenario("SWITCH-FAR");
    // First-session berths are intentionally near. This exercises the same
    // spatial rule after the player has actually parked Drift far away.
    state.rigs["marsh-skimmer"].x = -118;
    state.rigs["marsh-skimmer"].z = -123;
    selectActiveRig(state, "marsh-skimmer");
    expect(state.activeRigId).toBe("utility-tractor");
    expect(state.lastDiagnostic).toMatch(/Drift is \d+ m away/);
  });

  it("allows a switch once the rigs are within range", () => {
    const { state, world } = scenario("SWITCH-NEAR");
    const skimmer = state.rigs["marsh-skimmer"];
    const tractor = state.rigs["utility-tractor"];
    tractor.x = skimmer.x + 6;
    tractor.z = skimmer.z;
    settleWorld(state, world);

    selectActiveRig(state, "marsh-skimmer");
    expect(state.activeRigId).toBe("marsh-skimmer");
  });

  it("lets the canonical Home berth chain cycle at spawn", () => {
    // Onboarding must not open with a refusal.
    const { state } = scenario("SWITCH-SPAWN");
    switchActiveRig(state);
    expect(state.activeRigId).not.toBe("utility-tractor");
  });
});

describe("public state mission surface", () => {
  const mainMission: MissionProposition = {
    id: "delivery-home-long-furrow",
    binding: "delivery",
    missionClass: "main",
    giverId: "old-man",
    prerequisites: [],
    title: "Home → Long Furrow",
    premise: "Transport supplies.",
    briefing: "A delivery under pressure.",
    origin: "Home",
    destination: "Long Furrow",
    targetSiteId: "long-furrow",
    waypointIds: ["home-silo", "long-furrow"],
    minInsight: 0,
    requiredCapabilities: ["tow"],
    rewardSalvage: 5,
    difficultyLabel: "standard",
    state: "available",
  };

  const sideMission: MissionProposition = {
    ...mainMission,
    id: "side-salvage",
    missionClass: "side",
    giverId: null,
  };

  it("exposes the focus mission with class and giver", () => {
    const { state, world } = scenario("MISSION-PUBLIC-STATE");
    const accepted = acceptMission(state, mainMission, "utility-tractor", 1000);
    expect(accepted.ok).toBe(true);

    const exposed = publicState(state, world) as {
      mission: {
        id: string;
        missionClass: string;
        giverId: string | null;
      } | null;
      activeSideMissions: { id: string; missionClass: string }[];
    };

    expect(exposed.mission).toMatchObject({
      id: mainMission.id,
      missionClass: "main",
      giverId: "old-man",
    });
    expect(exposed.activeSideMissions).toHaveLength(0);
  });

  it("exposes concurrent side missions separately from the focus mission", () => {
    const { state, world } = scenario("SIDE-MISSION-PUBLIC-STATE");
    expect(acceptMission(state, mainMission, "utility-tractor", 1000).ok).toBe(
      true,
    );
    expect(acceptMission(state, sideMission, "utility-tractor", 1100).ok).toBe(
      true,
    );

    const exposed = publicState(state, world) as {
      mission: { id: string } | null;
      activeSideMissions: { id: string; missionClass: string; giverId: null }[];
    };

    expect(exposed.mission?.id).toBe(mainMission.id);
    expect(exposed.activeSideMissions).toHaveLength(1);
    expect(exposed.activeSideMissions[0]).toMatchObject({
      id: sideMission.id,
      missionClass: "side",
      giverId: null,
    });
  });
});
