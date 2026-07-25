/**
 * The gameplay kernel: fixed-step orchestration over the world substrate.
 *
 * This module owns *what happens*, not *how motion works* (`physics.ts`), *what
 * the ground is* (`terrain.ts`), or *what is out there* (`collision.ts`,
 * `exploration.ts`). It reads those, applies consequences, and writes
 * diagnostics. Keeping the orchestration thin is what lets each substrate be
 * tested in isolation.
 *
 * Determinism contract: given the same seed, the same `GameWorld`, the same
 * starting `GameState`, and the same sequence of `(input, dt)` pairs, this
 * produces identical output. `window.applyRigInput` and the vitest suite both
 * depend on it, and no code here may consult wall-clock time or `Math.random`.
 */

import {
  BUGGY_RAMP,
  CAMERA_MODES,
  type CameraMode,
  CARGO_DELIVERY,
  CARGO_PICKUP,
  effectiveProfile,
  FIXED_STEP_SECONDS,
  type FurrowMark,
  type GameState,
  IDLE_INPUT,
  type InputFrame,
  LANDMARKS,
  LEGACY_SAVE_SCHEMA_VERSION,
  MAX_FURROWS,
  MODULES,
  type ModuleId,
  RIG_IDS,
  RIG_LAB_SAVE_SCHEMA_VERSION,
  RIG_PROFILES,
  type RigCapability,
  type RigId,
  type RigState,
  SAVE_SCHEMA_VERSION,
  type WorldPhase,
  WORLD_LIMIT,
} from "./contracts";
import { SALVAGE_PICKUP_RADIUS, SURVEY_MOVE_THRESHOLD } from "./exploration";
import type { GameWorld } from "./gameworld";
import { clamp } from "./noise";
import { settleRig, stepRigMotion } from "./physics";
import { HOME_SITE, RESOLVED_ROUTES, WORLD_SITES } from "./world";

const FURROW_SPACING = 1.1;
const CARGO_HITCH_DISTANCE = 2.8;
const PHASE_ORDER: readonly WorldPhase[] = ["day", "gloam", "night"];

/** Depth the plough cuts per pass, in metres. */
const PLOUGH_DEPTH = -0.13;

/** Salvage cost to restore a rig to full condition. */
export const REPAIR_COST = 3;

/** Condition restored per repair. */
const REPAIR_AMOUNT = 100;

function approach(value: number, target: number, amount: number): number {
  if (value < target) return Math.min(target, value + amount);
  return Math.max(target, value - amount);
}

function cycle<T>(values: readonly T[], current: T): T {
  const index = values.indexOf(current);
  return values[(index + 1) % values.length] ?? values[0]!;
}

function createWheels(): RigState["wheels"] {
  return Array.from({ length: 4 }, () => ({
    compression: 0.5,
    contact: true,
    slip: 0,
  }));
}

function createRig(id: RigId, x: number, z: number): RigState {
  return {
    id,
    x,
    y: 0,
    z,
    heading: Math.PI,
    pitch: 0,
    roll: 0,
    speed: 0,
    steering: 0,
    verticalVelocity: 0,
    grounded: true,
    jumpCooldownMs: 0,
    distanceTravelled: 0,
    wheelRotation: 0,
    condition: 100,
    strain: 0,
    wheels: createWheels(),
    attachments:
      id === "utility-tractor"
        ? [
            { id: "field-plough", engaged: false },
            { id: "tow-hook", engaged: false },
          ]
        : [{ id: "tow-hook", engaged: false }],
    modules: [],
    telemetry: {
      surfaceId: "grass",
      grade: 0,
      grip: 1,
      slip: 0,
      waterDepth: 0,
      engineLoad: 0,
      stalled: false,
    },
  };
}

export function createInitialState(seed = "UNBOUND-260725"): GameState {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    seed,
    elapsedMs: 0,
    phase: "day",
    cameraMode: "chase",
    paused: false,
    mapOpen: false,
    activeRigId: "utility-tractor",
    rigs: {
      "utility-tractor": createRig(
        "utility-tractor",
        HOME_SITE.x + 4,
        HOME_SITE.z - 6,
      ),
      "toy-buggy": createRig("toy-buggy", HOME_SITE.x - 5, HOME_SITE.z - 3),
    },
    cargoRelay: {
      id: "cargo-relay",
      status: "ready",
      startedAt: null,
      completedAt: null,
      bestTimeMs: null,
      cargo: {
        id: "relay-cargo",
        x: CARGO_PICKUP.x,
        y: 0.65,
        z: CARGO_PICKUP.z,
        heading: 0,
        attachedRigId: null,
        delivered: false,
      },
    },
    furrows: [],
    discoveries: [],
    salvage: 0,
    salvageCollected: 0,
    lastDiagnostic: null,
  };
}

/**
 * Place both rigs and the relay cargo on the terrain.
 *
 * Must be called after `createInitialState` or a save restore, before the first
 * step. A rig created at `y = 0` on 12 m terrain would otherwise spend its first
 * frames falling and register a hard landing at spawn.
 */
export function settleWorld(state: GameState, world: GameWorld): void {
  for (const id of RIG_IDS) {
    const rig = state.rigs[id];
    settleRig(rig, effectiveProfile(id, rig.modules), world.terrain);
  }
  const cargo = state.cargoRelay.cargo;
  if (cargo.attachedRigId === null) {
    cargo.y = world.terrain.height(cargo.x, cargo.z) + 0.65;
  }
}

export function activeRig(state: GameState): RigState {
  return state.rigs[state.activeRigId];
}

export function activeProfile(state: GameState) {
  const rig = activeRig(state);
  return effectiveProfile(rig.id, rig.modules);
}

export function hasCapability(
  rig: RigState,
  capability: RigCapability,
): boolean {
  return effectiveProfile(rig.id, rig.modules).capabilities.includes(
    capability,
  );
}

function attachment(
  rig: RigState,
  id: RigState["attachments"][number]["id"],
): RigState["attachments"][number] | undefined {
  return rig.attachments.find((item) => item.id === id);
}

/** The workshop site, if the active rig is standing in its service area. */
export function workshopInReach(state: GameState) {
  const rig = activeRig(state);
  return WORLD_SITES.find(
    (site) =>
      site.workshop === true &&
      Math.hypot(rig.x - site.x, rig.z - site.z) <=
        (site.serviceRadius ?? site.discoverRadius),
  );
}

// -----------------------------------------------------------------------------
// Player actions
// -----------------------------------------------------------------------------

/**
 * The single context action.
 *
 * Ordered as a priority chain so one button is never ambiguous: what you are
 * holding beats what you are standing on, which beats what you are carrying a
 * tool for. Every branch sets a diagnostic explaining the verb *and* its
 * consequence, per the UI rules in `DESIGN.md`.
 */
export function performPrimaryAction(state: GameState, world: GameWorld): void {
  const rig = activeRig(state);
  const profile = effectiveProfile(rig.id, rig.modules);
  const relay = state.cargoRelay;
  const cargo = relay.cargo;

  if (cargo.attachedRigId === rig.id) {
    cargo.attachedRigId = null;
    const forwardX = Math.sin(rig.heading);
    const forwardZ = Math.cos(rig.heading);
    cargo.x = rig.x - forwardX * CARGO_HITCH_DISTANCE;
    cargo.z = rig.z - forwardZ * CARGO_HITCH_DISTANCE;
    cargo.y = world.terrain.height(cargo.x, cargo.z) + 0.65;
    attachment(rig, "tow-hook")!.engaged = false;
    state.lastDiagnostic = "Cargo released. The relay clock keeps running.";
    return;
  }

  const distanceToCargo = Math.hypot(rig.x - cargo.x, rig.z - cargo.z);
  if (
    !cargo.delivered &&
    cargo.attachedRigId === null &&
    distanceToCargo <= CARGO_PICKUP.radius &&
    profile.capabilities.includes("tow")
  ) {
    cargo.attachedRigId = rig.id;
    attachment(rig, "tow-hook")!.engaged = true;
    if (relay.status === "ready") {
      relay.status = "active";
      relay.startedAt = state.elapsedMs;
    }
    state.lastDiagnostic = `${profile.displayName} attached the relay crate. Haul it to Long Furrow.`;
    return;
  }

  const node = world.exploration.nearestNode(
    rig.x,
    rig.z,
    SALVAGE_PICKUP_RADIUS,
    world.collectedNodes,
  );
  if (node) {
    world.collect(node.id);
    state.salvage += node.value;
    state.salvageCollected += node.value;
    state.lastDiagnostic = `Recovered ${node.value} salvage. ${state.salvage} in the bin.`;
    return;
  }

  const plough = attachment(rig, "field-plough");
  if (plough && profile.capabilities.includes("plough")) {
    plough.engaged = !plough.engaged;
    state.lastDiagnostic = plough.engaged
      ? "Field plough lowered. Soft ground will hold the cut."
      : "Field plough raised.";
    return;
  }

  state.lastDiagnostic =
    "Nothing in reach. Salvage sits off the graded tracks — leave the road.";
}

/**
 * Winch self-recovery: earned anti-frustration.
 *
 * Being stuck on ground you cannot climb is the intended consequence of the grade
 * model, but being *permanently* stuck is a bug in the player's experience rather
 * than a lesson. Recovery is gated behind the winch module so the answer to
 * "I'm stuck" is a thing you went and earned, not a menu option.
 */
export function winchRecover(state: GameState, world: GameWorld): void {
  const rig = activeRig(state);
  const profile = effectiveProfile(rig.id, rig.modules);

  if (!profile.capabilities.includes("winch")) {
    state.lastDiagnostic =
      "No winch fitted. A recovery winch is 8 salvage at the Home Silo workshop.";
    return;
  }

  // Nearest point on the authored track network within reach.
  let bestX = HOME_SITE.x;
  let bestZ = HOME_SITE.z;
  let bestDistance = Infinity;
  for (const route of RESOLVED_ROUTES) {
    const dx = route.bx - route.ax;
    const dz = route.bz - route.az;
    const lengthSquared = dx * dx + dz * dz;
    const t =
      lengthSquared <= 1e-6
        ? 0
        : clamp(
            ((rig.x - route.ax) * dx + (rig.z - route.az) * dz) / lengthSquared,
            0,
            1,
          );
    const px = route.ax + dx * t;
    const pz = route.az + dz * t;
    const distance = Math.hypot(rig.x - px, rig.z - pz);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestX = px;
      bestZ = pz;
    }
  }

  if (bestDistance > 110) {
    state.lastDiagnostic =
      "No anchor point in winch range. Drive back toward a graded track.";
    return;
  }

  rig.x = bestX;
  rig.z = bestZ;
  rig.speed = 0;
  rig.steering = 0;
  rig.strain = clamp(rig.strain + 0.25, 0, 1);
  rig.condition = clamp(rig.condition - 2, 0, 100);
  settleRig(rig, profile, world.terrain);
  state.lastDiagnostic = `Winched ${Math.round(bestDistance)} m back to the graded track. Condition ${Math.round(rig.condition)}%.`;
}

export function installModule(
  state: GameState,
  world: GameWorld,
  moduleId: ModuleId,
): void {
  const rig = activeRig(state);
  const definition = MODULES[moduleId];
  if (!definition) {
    state.lastDiagnostic = "Unknown module.";
    return;
  }
  if (!workshopInReach(state)) {
    state.lastDiagnostic = `${definition.name} needs the Home Silo workshop. Drive back to the pad.`;
    return;
  }
  if (!definition.fits.includes(rig.id)) {
    state.lastDiagnostic = `${definition.name} does not fit ${RIG_PROFILES[rig.id].fieldName}.`;
    return;
  }
  if (rig.modules.includes(moduleId)) {
    state.lastDiagnostic = `${definition.name} is already fitted.`;
    return;
  }
  if (state.salvage < definition.cost) {
    state.lastDiagnostic = `${definition.name} costs ${definition.cost} salvage; ${state.salvage} in the bin.`;
    return;
  }

  state.salvage -= definition.cost;
  rig.modules.push(moduleId);
  settleRig(rig, effectiveProfile(rig.id, rig.modules), world.terrain);
  state.lastDiagnostic = `${definition.name} fitted. ${definition.promise}`;
}

export function repairRig(state: GameState): void {
  const rig = activeRig(state);
  if (!workshopInReach(state)) {
    state.lastDiagnostic = "Repairs need the Home Silo workshop pad.";
    return;
  }
  if (rig.condition >= 99.5 && rig.strain < 0.05) {
    state.lastDiagnostic = "Nothing to repair.";
    return;
  }
  if (state.salvage < REPAIR_COST) {
    state.lastDiagnostic = `Repairs cost ${REPAIR_COST} salvage; ${state.salvage} in the bin.`;
    return;
  }
  state.salvage -= REPAIR_COST;
  rig.condition = Math.min(100, rig.condition + REPAIR_AMOUNT);
  rig.strain = 0;
  state.lastDiagnostic = `${RIG_PROFILES[rig.id].fieldName} rebuilt to ${Math.round(rig.condition)}%.`;
}

export function selectActiveRig(state: GameState, rigId: RigId): void {
  if (state.activeRigId === rigId) return;
  const current = activeRig(state);
  if (!current.grounded) {
    state.lastDiagnostic = "Land the active rig before switching machines.";
    return;
  }
  current.speed = 0;
  current.steering = 0;
  state.activeRigId = rigId;
  const profile = effectiveProfile(rigId, state.rigs[rigId].modules);
  state.lastDiagnostic = `${profile.displayName} active · ${profile.capabilities.join(" + ")}.`;
}

export function switchActiveRig(state: GameState): void {
  selectActiveRig(state, cycle(RIG_IDS, state.activeRigId));
}

export function cyclePhase(state: GameState): void {
  state.phase = cycle(PHASE_ORDER, state.phase);
}

export function cycleCamera(state: GameState): void {
  state.cameraMode = cycle(CAMERA_MODES, state.cameraMode);
}

export function selectCamera(state: GameState, cameraMode: CameraMode): void {
  state.cameraMode = cameraMode;
}

export function togglePause(state: GameState): void {
  state.paused = !state.paused;
}

export function toggleMap(state: GameState): void {
  state.mapOpen = !state.mapOpen;
}

// -----------------------------------------------------------------------------
// Fixed step
// -----------------------------------------------------------------------------

function updateCargo(state: GameState, world: GameWorld, rig: RigState): void {
  const relay = state.cargoRelay;
  const cargo = relay.cargo;
  if (cargo.attachedRigId !== rig.id) return;

  const forwardX = Math.sin(rig.heading);
  const forwardZ = Math.cos(rig.heading);
  cargo.x = rig.x - forwardX * CARGO_HITCH_DISTANCE;
  cargo.z = rig.z - forwardZ * CARGO_HITCH_DISTANCE;
  // The crate rides the terrain, not the rig's suspension: it should drag on the
  // ground behind a rig that is nose-up on a climb.
  cargo.y =
    Math.max(world.terrain.height(cargo.x, cargo.z), rig.y - 1.2) + 0.65;
  cargo.heading = rig.heading;

  if (
    Math.hypot(cargo.x - CARGO_DELIVERY.x, cargo.z - CARGO_DELIVERY.z) <=
    CARGO_DELIVERY.radius
  ) {
    cargo.attachedRigId = null;
    cargo.delivered = true;
    cargo.x = CARGO_DELIVERY.x;
    cargo.z = CARGO_DELIVERY.z;
    cargo.y = world.terrain.height(cargo.x, cargo.z) + 0.65;
    attachment(rig, "tow-hook")!.engaged = false;
    relay.status = "complete";
    relay.completedAt = state.elapsedMs;
    const duration =
      relay.startedAt === null ? 0 : state.elapsedMs - relay.startedAt;
    relay.bestTimeMs =
      relay.bestTimeMs === null
        ? duration
        : Math.min(relay.bestTimeMs, duration);
    state.lastDiagnostic = `Relay delivered in ${(duration / 1000).toFixed(1)} s with ${RIG_PROFILES[rig.id].displayName}.`;
  }
}

/** Distance the active rig has moved since the last survey sweep, per rig. */
const lastSurveyPosition = new WeakMap<RigState, { x: number; z: number }>();

export function stepGame(
  state: GameState,
  world: GameWorld,
  input: InputFrame = IDLE_INPUT,
  seconds = FIXED_STEP_SECONDS,
): void {
  if (state.paused || seconds <= 0 || !Number.isFinite(seconds)) return;

  const dt = Math.min(seconds, 0.1);
  const rig = activeRig(state);
  const profile = effectiveProfile(rig.id, rig.modules);
  const towing = state.cargoRelay.cargo.attachedRigId === rig.id;

  const motion = stepRigMotion(rig, profile, input, world.terrain, dt, {
    towing,
    ramp: BUGGY_RAMP,
    canJump: profile.capabilities.includes("jump"),
  });

  // ---------------------------------------------------------------------------
  // Collision. Resolved after motion so the push-out is the final word on
  // position, and the rig is re-settled if a tree came down under it.
  // ---------------------------------------------------------------------------
  const rigRadius = profile.track * 0.5 + 0.25;
  const collision = world.obstacles.resolve(
    rig,
    rigRadius,
    profile.mass,
    world.felledObstacles,
  );
  if (collision.felled) {
    world.fell(collision.felled.id);
    state.lastDiagnostic = `${profile.fieldName} pushed a tree over. The clearing stays open.`;
  } else if (collision.hit && collision.impactSpeed > 3.2) {
    const damage = Math.min(
      12,
      (collision.impactSpeed - 3.2) *
        1.6 *
        (profile.landingTolerance > 8 ? 0.55 : 1),
    );
    rig.condition = clamp(rig.condition - damage, 0, 100);
    if (damage > 1.5) {
      state.lastDiagnostic = `${profile.fieldName} struck ${collision.blockedBy?.kind ?? "an obstacle"} · condition ${Math.round(rig.condition)}%.`;
    }
  }

  // ---------------------------------------------------------------------------
  // Consequences of motion.
  // ---------------------------------------------------------------------------
  if (motion.landingSpeed > profile.landingTolerance) {
    const damage = Math.min(
      16,
      (motion.landingSpeed - profile.landingTolerance) * 1.4,
    );
    rig.condition = clamp(rig.condition - damage, 0, 100);
    state.lastDiagnostic = `${profile.displayName} landed hard · condition ${Math.round(rig.condition)}%.`;
  } else if (motion.rampLaunch) {
    state.lastDiagnostic = `${profile.displayName} launched from the relay ramp.`;
  }

  if (motion.drowning) {
    rig.condition = clamp(rig.condition - 4.5 * dt, 0, 100);
    if (
      Math.floor(state.elapsedMs / 1500) !==
      Math.floor((state.elapsedMs + dt * 1000) / 1500)
    ) {
      state.lastDiagnostic = `Water over ${profile.fordDepth.toFixed(1)} m is drowning ${profile.fieldName}. Pontoons would cross this.`;
    }
  } else if (motion.stalled) {
    if (
      Math.floor(state.elapsedMs / 2000) !==
      Math.floor((state.elapsedMs + dt * 1000) / 2000)
    ) {
      state.lastDiagnostic = `Grade too steep for this gearing. Low-range gearing would climb it.`;
    }
  }

  if (motion.boundarySpeed > 0) {
    state.lastDiagnostic = "The boundary ridge turns the rig back.";
  }

  // ---------------------------------------------------------------------------
  // Ploughing writes into the terrain itself, then records a visual mark.
  // ---------------------------------------------------------------------------
  const plough = attachment(rig, "field-plough");
  if (
    plough?.engaged &&
    profile.capabilities.includes("plough") &&
    motion.distance > 0.001 &&
    Math.abs(rig.speed) > 1.2 &&
    rig.grounded
  ) {
    const forwardX = Math.sin(rig.heading);
    const forwardZ = Math.cos(rig.heading);
    const markX = rig.x - forwardX * 2.1;
    const markZ = rig.z - forwardZ * 2.1;
    const last = state.furrows[state.furrows.length - 1];
    const distanceFromLast = last
      ? Math.hypot(markX - last.x, markZ - last.z)
      : Infinity;
    if (distanceFromLast >= FURROW_SPACING) {
      if (world.terrain.deform(markX, markZ, PLOUGH_DEPTH, 1)) {
        state.furrows.push({
          x: markX,
          z: markZ,
          heading: rig.heading,
          createdAt: state.elapsedMs,
          rigId: rig.id,
        } satisfies FurrowMark);
        if (state.furrows.length > MAX_FURROWS) {
          state.furrows.splice(0, state.furrows.length - MAX_FURROWS);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Discovery and survey.
  // ---------------------------------------------------------------------------
  for (const landmark of LANDMARKS) {
    if (state.discoveries.some((item) => item.id === landmark.id)) continue;
    if (Math.hypot(rig.x - landmark.x, rig.z - landmark.z) <= landmark.radius) {
      state.discoveries.push({
        id: landmark.id,
        discoveredAt: state.elapsedMs,
      });
      state.lastDiagnostic = `${landmark.name} discovered: ${landmark.verb}.`;
    }
  }

  const lastSurvey = lastSurveyPosition.get(rig);
  const movedSinceSurvey =
    lastSurvey === undefined
      ? Infinity
      : Math.hypot(rig.x - lastSurvey.x, rig.z - lastSurvey.z);
  if (movedSinceSurvey >= SURVEY_MOVE_THRESHOLD) {
    lastSurveyPosition.set(rig, { x: rig.x, z: rig.z });
    const result = world.exploration.survey(
      rig.x,
      rig.y + profile.camera.focusHeight + 1.4,
      rig.z,
      profile.surveyRange,
      world.surveyedCells,
    );
    if (result.revealed.length > 24) {
      state.lastDiagnostic = `Mapped ${result.revealed.length} new cells from this vantage.`;
    }
  }

  updateCargo(state, world, rig);

  // Idle rigs recover strain, so parking a machine is a real choice.
  for (const id of RIG_IDS) {
    if (id === rig.id) continue;
    const idle = state.rigs[id];
    idle.strain = approach(idle.strain, 0, 0.04 * dt);
  }

  state.elapsedMs += dt * 1000;
}

export function advanceGame(
  state: GameState,
  world: GameWorld,
  milliseconds: number,
): void {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return;
  let remaining = Math.min(milliseconds, 120_000) / 1000;
  while (remaining > 0) {
    const step = Math.min(FIXED_STEP_SECONDS, remaining);
    stepGame(state, world, IDLE_INPUT, step);
    remaining -= step;
  }
}

// -----------------------------------------------------------------------------
// Observability
// -----------------------------------------------------------------------------

export function publicState(state: GameState, world: GameWorld): object {
  const rigSummary = (rig: RigState) => {
    const profile = effectiveProfile(rig.id, rig.modules);
    return {
      id: rig.id,
      x: Number(rig.x.toFixed(3)),
      y: Number(rig.y.toFixed(3)),
      z: Number(rig.z.toFixed(3)),
      heading: Number(rig.heading.toFixed(4)),
      pitch: Number(rig.pitch.toFixed(4)),
      roll: Number(rig.roll.toFixed(4)),
      speed: Number(rig.speed.toFixed(3)),
      grounded: rig.grounded,
      condition: Number(rig.condition.toFixed(1)),
      strain: Number(rig.strain.toFixed(3)),
      distanceTravelled: Number(rig.distanceTravelled.toFixed(2)),
      attachments: rig.attachments.map((item) => ({ ...item })),
      modules: [...rig.modules],
      capabilities: [...profile.capabilities],
      surveyRange: profile.surveyRange,
      terrain: {
        surface: rig.telemetry.surfaceId,
        grade: Number(rig.telemetry.grade.toFixed(3)),
        grip: Number(rig.telemetry.grip.toFixed(3)),
        slip: Number(rig.telemetry.slip.toFixed(3)),
        waterDepth: Number(rig.telemetry.waterDepth.toFixed(2)),
        stalled: rig.telemetry.stalled,
      },
      wheels: rig.wheels.map((wheel) => ({
        compression: Number(wheel.compression.toFixed(3)),
        contact: wheel.contact,
      })),
    };
  };

  return {
    schemaVersion: state.schemaVersion,
    seed: state.seed,
    elapsedMs: Math.round(state.elapsedMs),
    phase: state.phase,
    cameraMode: state.cameraMode,
    paused: state.paused,
    mapOpen: state.mapOpen,
    activeRigId: state.activeRigId,
    activeRig: rigSummary(activeRig(state)),
    rigs: Object.fromEntries(
      RIG_IDS.map((id) => [id, rigSummary(state.rigs[id])]),
    ),
    progression: {
      salvage: state.salvage,
      salvageCollected: state.salvageCollected,
      workshopInReach: workshopInReach(state)?.id ?? null,
    },
    activity: {
      id: state.cargoRelay.id,
      status: state.cargoRelay.status,
      elapsedMs:
        state.cargoRelay.startedAt === null
          ? 0
          : Math.round(
              (state.cargoRelay.completedAt ?? state.elapsedMs) -
                state.cargoRelay.startedAt,
            ),
      bestTimeMs: state.cargoRelay.bestTimeMs,
      cargoAttachedTo: state.cargoRelay.cargo.attachedRigId,
      delivered: state.cargoRelay.cargo.delivered,
      cargoPosition: {
        x: Number(state.cargoRelay.cargo.x.toFixed(3)),
        y: Number(state.cargoRelay.cargo.y.toFixed(3)),
        z: Number(state.cargoRelay.cargo.z.toFixed(3)),
      },
      deliveryPosition: { x: CARGO_DELIVERY.x, z: CARGO_DELIVERY.z },
      rampPosition: { x: BUGGY_RAMP.x, z: BUGGY_RAMP.z },
    },
    worldMemory: {
      furrowCount: state.furrows.length,
      deformedCells: world.terrain.deformationCount(),
      felledObstacles: world.felledObstacles.size,
      collectedNodes: world.collectedNodes.size,
      surveyedCells: world.surveyedCells.size,
      surveyedFraction: Number(
        world.exploration.surveyedFraction(world.surveyedCells, 190).toFixed(4),
      ),
      discoveries: state.discoveries.map((item) => item.id),
    },
    lastDiagnostic: state.lastDiagnostic,
  };
}

// -----------------------------------------------------------------------------
// Save recovery and migration
// -----------------------------------------------------------------------------

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRigId(value: unknown): value is RigId {
  return RIG_IDS.includes(value as RigId);
}

function recoverModules(value: unknown, rigId: RigId): ModuleId[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<ModuleId>();
  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const definition = MODULES[entry as ModuleId];
    if (definition && definition.fits.includes(rigId)) {
      seen.add(entry as ModuleId);
    }
  }
  return [...seen];
}

/**
 * Recover one rig from an untrusted record.
 *
 * Deliberately tolerant of *missing* fields introduced after v2 (pitch, roll,
 * strain, wheels, modules) and strict about fields that existed before: a v2
 * record must still load, and a v3 record with a corrupted position must not.
 */
function recoverRig(value: unknown, id: RigId): RigState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.id !== id ||
    !isFiniteNumber(candidate.x) ||
    !isFiniteNumber(candidate.z) ||
    !isFiniteNumber(candidate.heading) ||
    !isFiniteNumber(candidate.speed) ||
    !isFiniteNumber(candidate.steering) ||
    !isFiniteNumber(candidate.distanceTravelled) ||
    !isFiniteNumber(candidate.wheelRotation) ||
    !isFiniteNumber(candidate.condition) ||
    !Array.isArray(candidate.attachments)
  ) {
    return null;
  }

  const template = createRig(id, 0, 0);
  const validAttachments = new Set(template.attachments.map((item) => item.id));
  const attachments = candidate.attachments
    .filter((item) => {
      if (!item || typeof item !== "object") return false;
      const entry = item as Record<string, unknown>;
      return (
        typeof entry.id === "string" &&
        validAttachments.has(entry.id as never) &&
        typeof entry.engaged === "boolean"
      );
    })
    .map((item) => {
      const entry = item as {
        id: RigState["attachments"][number]["id"];
        engaged: boolean;
      };
      return { id: entry.id, engaged: entry.engaged };
    });
  if (attachments.length !== validAttachments.size) return null;

  const profile = RIG_PROFILES[id];
  const radius = Math.hypot(candidate.x, candidate.z);
  const scale = radius > WORLD_LIMIT ? WORLD_LIMIT / radius : 1;

  return {
    id,
    x: candidate.x * scale,
    y: isFiniteNumber(candidate.y) ? clamp(candidate.y, -12, 200) : 0,
    z: candidate.z * scale,
    heading: candidate.heading,
    pitch: isFiniteNumber(candidate.pitch)
      ? clamp(candidate.pitch, -1.4, 1.4)
      : 0,
    roll: isFiniteNumber(candidate.roll) ? clamp(candidate.roll, -1.4, 1.4) : 0,
    speed: clamp(
      candidate.speed,
      profile.reverseLimit * 1.4,
      profile.topSpeed * 1.6,
    ),
    steering: clamp(candidate.steering, -1, 1),
    verticalVelocity: isFiniteNumber(candidate.verticalVelocity)
      ? clamp(candidate.verticalVelocity, -40, 40)
      : 0,
    grounded:
      typeof candidate.grounded === "boolean" ? candidate.grounded : true,
    jumpCooldownMs: isFiniteNumber(candidate.jumpCooldownMs)
      ? clamp(candidate.jumpCooldownMs, 0, 10_000)
      : 0,
    distanceTravelled: Math.max(0, candidate.distanceTravelled),
    wheelRotation: candidate.wheelRotation,
    condition: clamp(candidate.condition, 0, 100),
    strain: isFiniteNumber(candidate.strain)
      ? clamp(candidate.strain, 0, 1)
      : 0,
    wheels: createWheels(),
    attachments,
    modules: recoverModules(candidate.modules, id),
    telemetry: template.telemetry,
  };
}

function recoverShared(
  candidate: Record<string, unknown>,
  rigs: Record<RigId, RigState>,
): GameState | null {
  const relay = candidate.cargoRelay as Record<string, unknown> | undefined;
  const cargo = relay?.cargo as Record<string, unknown> | undefined;
  if (
    !relay ||
    !cargo ||
    relay.id !== "cargo-relay" ||
    !["ready", "active", "complete"].includes(String(relay.status)) ||
    (relay.startedAt !== null && !isFiniteNumber(relay.startedAt)) ||
    (relay.completedAt !== null && !isFiniteNumber(relay.completedAt)) ||
    (relay.bestTimeMs !== null && !isFiniteNumber(relay.bestTimeMs)) ||
    cargo.id !== "relay-cargo" ||
    !isFiniteNumber(cargo.x) ||
    !isFiniteNumber(cargo.z) ||
    !isFiniteNumber(cargo.heading) ||
    (cargo.attachedRigId !== null && !isRigId(cargo.attachedRigId)) ||
    typeof cargo.delivered !== "boolean"
  ) {
    return null;
  }

  const relayStatus = relay.status as GameState["cargoRelay"]["status"];
  const relayStarted = relay.startedAt as number | null;
  const relayCompleted = relay.completedAt as number | null;
  const relayBest = relay.bestTimeMs as number | null;
  const cargoAttachedRigId = cargo.attachedRigId as RigId | null;
  const cargoDelivered = cargo.delivered;

  // The relay is a small state machine; an inconsistent combination means the
  // record was hand-edited or a migration went wrong, and silently accepting it
  // would produce an activity that can never complete.
  const relayIsConsistent =
    (relayStatus === "ready" &&
      relayStarted === null &&
      relayCompleted === null &&
      relayBest === null &&
      cargoAttachedRigId === null &&
      cargoDelivered === false) ||
    (relayStatus === "active" &&
      relayStarted !== null &&
      relayCompleted === null &&
      cargoAttachedRigId !== null &&
      cargoDelivered === false) ||
    (relayStatus === "complete" &&
      relayStarted !== null &&
      relayCompleted !== null &&
      relayBest !== null &&
      cargoAttachedRigId === null &&
      cargoDelivered === true);
  if (!relayIsConsistent) return null;

  for (const id of RIG_IDS) {
    const towHook = attachment(rigs[id], "tow-hook");
    if (!towHook) return null;
    towHook.engaged = cargoAttachedRigId === id;
  }

  const furrows = (Array.isArray(candidate.furrows) ? candidate.furrows : [])
    .filter((mark): mark is FurrowMark => {
      if (!mark || typeof mark !== "object") return false;
      const item = mark as Partial<FurrowMark>;
      return (
        isFiniteNumber(item.x) &&
        isFiniteNumber(item.z) &&
        isFiniteNumber(item.heading) &&
        isFiniteNumber(item.createdAt) &&
        isRigId(item.rigId)
      );
    })
    .slice(-MAX_FURROWS);

  const validLandmarkIds = new Set(LANDMARKS.map((item) => item.id));
  const discoveries = (
    Array.isArray(candidate.discoveries) ? candidate.discoveries : []
  )
    .filter((item) => {
      if (!item || typeof item !== "object") return false;
      const discovery = item as Record<string, unknown>;
      return (
        typeof discovery.id === "string" &&
        validLandmarkIds.has(discovery.id) &&
        isFiniteNumber(discovery.discoveredAt)
      );
    })
    .map((item) => {
      const discovery = item as { id: string; discoveredAt: number };
      return { id: discovery.id, discoveredAt: discovery.discoveredAt };
    });

  const cargoRadius = Math.hypot(cargo.x as number, cargo.z as number);
  const cargoScale = cargoRadius > WORLD_LIMIT ? WORLD_LIMIT / cargoRadius : 1;

  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    seed: String(candidate.seed),
    elapsedMs: Math.max(0, candidate.elapsedMs as number),
    phase: candidate.phase as WorldPhase,
    cameraMode: CAMERA_MODES.includes(candidate.cameraMode as CameraMode)
      ? (candidate.cameraMode as CameraMode)
      : "chase",
    paused: false,
    mapOpen: false,
    activeRigId: candidate.activeRigId as RigId,
    rigs,
    cargoRelay: {
      id: "cargo-relay",
      status: relayStatus,
      startedAt: relayStarted,
      completedAt: relayCompleted,
      bestTimeMs: relayBest,
      cargo: {
        id: "relay-cargo",
        x: (cargo.x as number) * cargoScale,
        y: isFiniteNumber(cargo.y) ? clamp(cargo.y, -12, 200) : 0.65,
        z: (cargo.z as number) * cargoScale,
        heading: cargo.heading as number,
        attachedRigId: cargoAttachedRigId,
        delivered: cargoDelivered,
      },
    },
    furrows,
    discoveries,
    salvage: isFiniteNumber(candidate.salvage)
      ? clamp(Math.floor(candidate.salvage), 0, 99_999)
      : 0,
    salvageCollected: isFiniteNumber(candidate.salvageCollected)
      ? clamp(Math.floor(candidate.salvageCollected), 0, 999_999)
      : isFiniteNumber(candidate.salvage)
        ? clamp(Math.floor(candidate.salvage), 0, 999_999)
        : 0,
    lastDiagnostic:
      typeof candidate.lastDiagnostic === "string"
        ? candidate.lastDiagnostic
        : "Local rig lab record restored.",
  };
}

function recoverCurrent(candidate: Record<string, unknown>): GameState | null {
  if (
    typeof candidate.seed !== "string" ||
    candidate.seed.length < 1 ||
    !isFiniteNumber(candidate.elapsedMs) ||
    !PHASE_ORDER.includes(candidate.phase as WorldPhase) ||
    !isRigId(candidate.activeRigId) ||
    !candidate.rigs ||
    typeof candidate.rigs !== "object"
  ) {
    return null;
  }

  const rigValues = candidate.rigs as Partial<Record<RigId, unknown>>;
  const tractor = recoverRig(rigValues["utility-tractor"], "utility-tractor");
  const buggy = recoverRig(rigValues["toy-buggy"], "toy-buggy");
  if (!tractor || !buggy) return null;

  return recoverShared(candidate, {
    "utility-tractor": tractor,
    "toy-buggy": buggy,
  });
}

/**
 * Migrate a Field Test 001 (v1) record.
 *
 * v1 stored one `vehicle` on a flat plane. Position is preserved but the world it
 * was recorded in no longer exists, so the rig is re-settled onto terrain by
 * `settleWorld` after load rather than trusting the old `y`.
 */
function migrateV1(candidate: Record<string, unknown>): GameState | null {
  const vehicle = candidate.vehicle as Record<string, unknown> | undefined;
  if (
    typeof candidate.seed !== "string" ||
    candidate.seed.length < 1 ||
    !isFiniteNumber(candidate.elapsedMs) ||
    !PHASE_ORDER.includes(candidate.phase as WorldPhase) ||
    !vehicle ||
    !isFiniteNumber(vehicle.x) ||
    !isFiniteNumber(vehicle.z) ||
    !isFiniteNumber(vehicle.heading) ||
    !isFiniteNumber(vehicle.speed) ||
    !isFiniteNumber(vehicle.steering) ||
    !isFiniteNumber(vehicle.distanceTravelled) ||
    !isFiniteNumber(vehicle.wheelRotation) ||
    typeof vehicle.ploughLowered !== "boolean"
  ) {
    return null;
  }

  const migrated = createInitialState(candidate.seed);
  migrated.elapsedMs = Math.max(0, candidate.elapsedMs);
  migrated.phase = candidate.phase as WorldPhase;
  if (CAMERA_MODES.includes(candidate.cameraMode as CameraMode)) {
    migrated.cameraMode = candidate.cameraMode as CameraMode;
  }

  const tractor = migrated.rigs["utility-tractor"];
  const radius = Math.hypot(vehicle.x, vehicle.z);
  const scale = radius > WORLD_LIMIT ? WORLD_LIMIT / radius : 1;
  tractor.x = vehicle.x * scale;
  tractor.z = vehicle.z * scale;
  tractor.heading = vehicle.heading;
  tractor.speed = clamp(
    vehicle.speed,
    RIG_PROFILES["utility-tractor"].reverseLimit,
    RIG_PROFILES["utility-tractor"].topSpeed,
  );
  tractor.steering = clamp(vehicle.steering, -1, 1);
  tractor.distanceTravelled = Math.max(0, vehicle.distanceTravelled);
  tractor.wheelRotation = vehicle.wheelRotation;
  attachment(tractor, "field-plough")!.engaged = vehicle.ploughLowered;

  const validLandmarkIds = new Set(LANDMARKS.map((item) => item.id));
  if (Array.isArray(candidate.discoveries)) {
    migrated.discoveries = candidate.discoveries
      .filter((item) => {
        if (!item || typeof item !== "object") return false;
        const discovery = item as Record<string, unknown>;
        return (
          typeof discovery.id === "string" &&
          validLandmarkIds.has(discovery.id) &&
          isFiniteNumber(discovery.discoveredAt)
        );
      })
      .map((item) => {
        const discovery = item as { id: string; discoveredAt: number };
        return { id: discovery.id, discoveredAt: discovery.discoveredAt };
      });
  }
  migrated.lastDiagnostic =
    "Field Test 001 record migrated. The flat field is now terrain.";
  return migrated;
}

/**
 * Migrate a Rig Lab 01 (v2) record.
 *
 * v2's rig shape is a strict subset of v3's, so the shared recovery path handles
 * it directly. The only semantic change is the world: v2 positions were recorded
 * on a flat plane inside a `±92` box, so they are clamped into the disc and
 * re-settled onto terrain.
 */
function migrateV2(candidate: Record<string, unknown>): GameState | null {
  const recovered = recoverCurrent(candidate);
  if (!recovered) return null;
  recovered.lastDiagnostic =
    "Rig Lab 01 record migrated. Both rigs re-settled onto real terrain.";
  return recovered;
}

export function recoverState(value: unknown): GameState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  if (candidate.schemaVersion === SAVE_SCHEMA_VERSION) {
    return recoverCurrent(candidate);
  }
  if (candidate.schemaVersion === RIG_LAB_SAVE_SCHEMA_VERSION) {
    return migrateV2(candidate);
  }
  if (candidate.schemaVersion === LEGACY_SAVE_SCHEMA_VERSION) {
    return migrateV1(candidate);
  }
  return null;
}
