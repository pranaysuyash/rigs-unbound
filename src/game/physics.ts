/**
 * The traversal model: how a rig moves over the terrain field.
 *
 * This is the reduced-DOF body-on-four-contacts model chosen in ADR-0007 §3.
 * Planar position and heading integrate as before; body elevation, pitch, and
 * roll are driven by the terrain under four sampled wheel positions.
 *
 * ## Coordinate contract
 *
 * A rig's **local +Z is its front**, because `stepGame` translates along
 * `(sin heading, cos heading)` and Three.js maps local +Z to exactly that vector
 * for `rotation.y = heading`. Local +X is the rig's right.
 *
 * This was previously violated by the renderer, which placed the tractor's
 * grille, hood, and headlights at local −Z — the same end as the plough — so the
 * machine drove cab-first with its lights pointing backwards. The geometry is
 * corrected in `renderer.ts`; this comment exists so the convention is stated
 * once, in the module that depends on it most.
 *
 * ## Why the numbers behave the way they do
 *
 * Three couplings carry the whole feel of the game, and none of them is a
 * special case for a particular rig:
 *
 * - **Gearing is emergent.** Drive force decays toward `topSpeed` and is reduced
 *   below `lugSpeed` by `lowSpeedTorque`. A tractor makes full force from rest and
 *   climbs; a buggy geared for 21 m/s bogs off the line and needs a run-up.
 *   Nobody authored a "climb stat".
 * - **Grade is gravity.** Slope resistance is the real gravitational component
 *   along the direction of travel. A hill the rig cannot climb is therefore a
 *   physical fact, which is what makes it a legible progression gate.
 * - **Grip gates everything.** Surface grip limits drive force *and* steering
 *   authority *and* is what lug tyres partially recover. So mud understeers and
 *   spins, and the tractor is genuinely the right tool for it.
 */

import {
  type EffectiveRig,
  GRAVITY,
  type InputFrame,
  type MobilityAdapter,
  type RigState,
  WORLD_LIMIT,
} from "./contracts";
import { applyWeatherGripPenalty } from "./weather";
import { calculateTirePressureState } from "./tire-pressure";
import { computeAxleTorque } from "./differential-lock";
import type { RigToolState } from "./contracts";
import { clamp } from "./noise";
import type { TerrainField } from "./terrain";
import {
  resolveTerrainTraversal,
  type TerrainTraversalBlockReason,
} from "./terrain-traversal";
import { WATER_LEVEL } from "./world";
import { calculateRiverHydroState } from "./river-hydrology";
import {
  computeBarometricAtmosphere,
  applyAltitudePowerDerate,
} from "./barometric-engine";

/**
 * Fraction of gravity a tyre can transmit at grip 1.0.
 *
 * This is the single tuning constant that sets how "grippy" the whole game
 * feels, because it sets the maximum climbable grade on every surface. At 0.5 a
 * full-grip surface tops out near a 28-degree climb and mud near 18, which keeps
 * the world's steep ground meaningfully closed until a module opens it.
 */
const TRACTION_GRAVITY_FRACTION = 0.5;

/** Body must rise this multiple of suspension travel above rest to go airborne. */
const LAUNCH_TRAVEL_MULTIPLE = 1.15;

/** Speed below which a held throttle on a rising grade counts as stalled. */
const STALL_SPEED = 0.55;

export interface MotionOutcome {
  /** Vertical speed at touchdown, or 0 when no landing happened this step. */
  landingSpeed: number;
  /** True when the rig left the ground this step. */
  launched: boolean;
  /** True when the rig left the ground via the relay ramp specifically. */
  rampLaunch: boolean;
  /** True when the throttle is held but grade and grip cannot move the rig. */
  stalled: boolean;
  /** Impact speed against the world boundary, or 0. */
  boundarySpeed: number;
  /** Water depth at the body position, in metres. */
  waterDepth: number;
  /** True when water depth exceeds this rig's fording ability. */
  drowning: boolean;
  /** Mean wheel slip, 0..1. */
  slip: number;
  /** Distance travelled this step, in metres. */
  distance: number;
  surfaceId: string;
  /** Signed grade along the direction of travel; positive is uphill. */
  grade: number;
  /** Effective grip available to this rig on this surface. */
  grip: number;
  /** Semantic shared-substrate refusal; null when the requested path is valid. */
  traversalBlockReason: TerrainTraversalBlockReason | null;
}

const WHEEL_LOCAL: readonly (readonly [number, number])[] = [
  [-1, 1], // front-left  (x sign, z sign)
  [1, 1], // front-right
  [-1, -1], // rear-left
  [1, -1], // rear-right
];

export interface RampDefinition {
  x: number;
  z: number;
  radius: number;
  minimumSpeed: number;
}

/**
 * Effective grip for a rig on a surface.
 *
 * `lugBonus` recovers a fraction of what the surface *lacks*, so it is worth
 * most where grip is worst. That single term is why the tractor owns the marsh
 * and the buggy owns the hardpan, without either being scripted to.
 */
/** Per-step motion inputs that are not part of rig or terrain state. */
export interface MotionOptions {
  towing: boolean;
  ramp: RampDefinition | null;
  canJump: boolean;
  /** 0..1 ground saturation from the deterministic weather clock. */
  soilMoisture?: number;
  /** Kernel-owned tool commitments. Omitted means "neutral, nothing committed". */
  tools?: RigToolState;
}

/**
 * Traction and speed consequences of the player's committed tool states.
 *
 * Neither state may be strictly better than the other, or it stops being a
 * decision and becomes a delay before the obvious choice:
 *
 * - **airing down** grows the contact patch, so soft ground holds better, but
 *   carcass flex raises rolling resistance and caps top speed;
 * - **locking the differential** sends torque to the wheel that still has grip,
 *   but the axle scrubs, so turning is worse.
 */
export function toolTractionModifiers(tools: RigToolState | undefined): {
  softGripMultiplier: number;
  topSpeedMultiplier: number;
  steeringMultiplier: number;
} {
  if (!tools) {
    return {
      softGripMultiplier: 1,
      topSpeedMultiplier: 1,
      steeringMultiplier: 1,
    };
  }

  const patch = calculateTirePressureState(tools.tirePressurePsi, 900);
  // Floatation is the payoff; rolling resistance is the price.
  const softGripMultiplier = 1 + patch.mudFloatationFactor * 0.32;
  const topSpeedMultiplier = clamp(
    1 - (patch.rollingResistanceCoeff - 0.015) * 9,
    0.72,
    1,
  );

  // A locked axle drives better and turns worse; limited-slip splits the
  // difference. `computeAxleTorque` owns the torque math; this reads its scrub.
  const axle = computeAxleTorque(1000, 0.8, 0.25, tools.differentialMode);
  const lockGrip = tools.differentialMode === "open" ? 1 : 1.14;
  const steeringMultiplier = clamp(1 / axle.turningScrubFactor, 0.7, 1);

  return {
    softGripMultiplier: softGripMultiplier * lockGrip,
    topSpeedMultiplier,
    steeringMultiplier,
  };
}

export function effectiveGrip(
  surfaceGrip: number,
  tireGrip: number,
  lugBonus: number,
): number {
  return clamp(
    surfaceGrip * tireGrip + lugBonus * (1 - surfaceGrip),
    0.04,
    1.35,
  );
}

/**
 * Drive force available at a given speed, as an acceleration in m/s².
 *
 * Two independent falloffs, and the game's whole handling identity lives in the
 * gap between them:
 *
 * - **Top-end falloff** (`ratio`): force decays toward `topSpeed`. This is what
 *   makes a low-top-speed rig strong and a high-top-speed rig fast.
 * - **Lugging falloff** (`lug`): force is reduced *below* `lugSpeed` for rigs
 *   geared tall. A tractor has `lowSpeedTorque` 1 and ignores this; a buggy has
 *   0.22 and must build momentum before it can pull hard.
 *
 * The lugging term is why "you need a run-up at that hill" is a real, learnable
 * fact about the buggy rather than a message on the HUD.
 */
export function driveForce(profile: EffectiveRig, speed: number): number {
  const ratio = clamp(
    Math.abs(speed) / Math.max(0.001, profile.topSpeed),
    0,
    1,
  );
  const topEnd = 1 - ratio * ratio * 0.88;
  const floor = clamp(profile.lowSpeedTorque, 0.05, 1);
  const lug =
    floor +
    (1 - floor) *
      clamp(Math.abs(speed) / Math.max(0.1, profile.lugSpeed), 0, 1);
  return profile.enginePower * topEnd * lug;
}

/**
 * Advance one rig by one fixed step.
 *
 * Mutates `rig` and returns what happened, so the caller owns all diagnostics,
 * audio triggers, and world side effects. Keeping this function free of
 * messaging is what lets it be tested as pure motion.
 */
function stepGroundMotion(
  rig: RigState,
  profile: EffectiveRig,
  input: InputFrame,
  terrain: TerrainField,
  dt: number,
  options: MotionOptions,
): MotionOutcome {
  if (profile.mobilityAdapter !== "ground" || rig.mobility.kind !== "ground") {
    throw new Error(
      `Ground adapter received ${profile.mobilityAdapter}/${rig.mobility.kind}.`,
    );
  }
  const mobility = rig.mobility;
  const previousX = rig.x;
  const previousZ = rig.z;

  const forwardX = Math.sin(rig.heading);
  const forwardZ = Math.cos(rig.heading);
  const rightX = Math.cos(rig.heading);
  const rightZ = -Math.sin(rig.heading);

  // ---------------------------------------------------------------------------
  // 1. Sample the ground under each wheel and derive the contact plane.
  // ---------------------------------------------------------------------------
  const halfBase = profile.wheelbase * 0.5;
  const halfTrack = profile.track * 0.5;
  let frontSum = 0;
  let rearSum = 0;
  let leftSum = 0;
  let rightSum = 0;
  let contactSum = 0;

  const wheelHeights: number[] = [0, 0, 0, 0];
  for (let index = 0; index < 4; index += 1) {
    const [signX, signZ] = WHEEL_LOCAL[index]!;
    const localX = signX * halfTrack;
    const localZ = signZ * halfBase;
    const worldX = rig.x + rightX * localX + forwardX * localZ;
    const worldZ = rig.z + rightZ * localX + forwardZ * localZ;
    const groundY = terrain.height(worldX, worldZ);
    wheelHeights[index] = groundY;
    contactSum += groundY;
    if (signZ > 0) frontSum += groundY;
    else rearSum += groundY;
    if (signX < 0) leftSum += groundY;
    else rightSum += groundY;
  }

  const meanContact = contactSum / 4;
  const pitchTarget = Math.atan2((frontSum - rearSum) / 2, profile.wheelbase);
  const rollTarget = Math.atan2((rightSum - leftSum) / 2, profile.track);

  // ---------------------------------------------------------------------------
  // 2. Vertical body dynamics: a spring-damper toward the contact plane.
  //
  // Cresting a hill fast makes `restY` fall faster than the spring can follow,
  // so the body rises above its travel limit and goes airborne. Air time is
  // therefore a consequence of terrain and speed, not a jump button.
  // ---------------------------------------------------------------------------
  const restY = meanContact + profile.rideHeight;
  let landingSpeed = 0;
  let launched = false;
  let rampLaunch = false;

  const ramp = options.ramp;
  const atRamp =
    ramp !== null &&
    Math.hypot(rig.x - ramp.x, rig.z - ramp.z) <= ramp.radius &&
    Math.abs(rig.speed) >= ramp.minimumSpeed;

  mobility.jumpCooldownMs = Math.max(0, mobility.jumpCooldownMs - dt * 1000);

  if (
    mobility.grounded &&
    atRamp &&
    options.canJump &&
    mobility.jumpCooldownMs === 0 &&
    profile.jumpImpulse > 0
  ) {
    mobility.grounded = false;
    mobility.verticalVelocity = profile.jumpImpulse;
    mobility.jumpCooldownMs = 1800;
    launched = true;
    rampLaunch = true;
  }

  if (mobility.grounded) {
    const acceleration =
      profile.suspensionStiffness * (restY - rig.y) -
      profile.suspensionDamping * mobility.verticalVelocity;
    mobility.verticalVelocity += acceleration * dt;
    rig.y += mobility.verticalVelocity * dt;

    if (rig.y - restY > profile.suspensionTravel * LAUNCH_TRAVEL_MULTIPLE) {
      mobility.grounded = false;
      launched = true;
    }
  } else {
    mobility.verticalVelocity -= GRAVITY * dt;
    rig.y += mobility.verticalVelocity * dt;
    if (rig.y <= restY) {
      landingSpeed = Math.abs(mobility.verticalVelocity);
      rig.y = restY;
      mobility.verticalVelocity = 0;
      mobility.grounded = true;
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Attitude and per-wheel compression.
  // ---------------------------------------------------------------------------
  const attitudeBlend = mobility.grounded
    ? 1 - Math.exp(-profile.suspensionDamping * 0.85 * dt)
    : 1 - Math.exp(-1.6 * dt);
  rig.pitch +=
    ((mobility.grounded ? pitchTarget : 0) - rig.pitch) * attitudeBlend;
  rig.roll += ((mobility.grounded ? rollTarget : 0) - rig.roll) * attitudeBlend;

  let contactCount = 0;
  for (let index = 0; index < 4; index += 1) {
    const [signX, signZ] = WHEEL_LOCAL[index]!;
    // Elevation of this wheel's mounting point once the body is tilted.
    const mountY =
      rig.y +
      signZ * halfBase * Math.sin(rig.pitch) +
      signX * halfTrack * Math.sin(rig.roll);
    const gap = mountY - profile.rideHeight - wheelHeights[index]!;
    const compression = clamp(
      0.5 - gap / Math.max(0.05, profile.suspensionTravel),
      0,
      1,
    );
    const wheel = mobility.wheels[index]!;
    wheel.compression = compression;
    wheel.contact = mobility.grounded && compression > 0.02;
    if (wheel.contact) contactCount += 1;
  }
  const contactFraction = contactCount / 4;

  // ---------------------------------------------------------------------------
  // 4. Surface, grip, grade.
  // ---------------------------------------------------------------------------
  const ground = terrain.sample(rig.x, rig.z);
  // Weather lowers grip in the *simulation*, before any mission text is allowed
  // to claim conditions are harder. Hardpan and rock resist it; soft soils do
  // not. `deriveFleetRecoveryAssessment()` reads grip through this same helper
  // so the board can never promise traction the rig does not have.
  const toolModifiers = toolTractionModifiers(options.tools);
  const weatheredGrip = applyWeatherGripPenalty(
    effectiveGrip(ground.surface.grip, profile.tireGrip, profile.lugBonus),
    ground.surface.id,
    options.soilMoisture ?? 0,
  );
  // Airing down and locking the diff only help where grip is actually scarce.
  // On hardpan they are pure cost, which is what makes them a decision rather
  // than a permanent upgrade the player would simply leave switched on.
  const softGround =
    ground.surface.id !== "track" && ground.surface.id !== "rock";
  const grip = clamp(
    softGround
      ? weatheredGrip * toolModifiers.softGripMultiplier
      : weatheredGrip,
    0.04,
    1.35,
  );
  const grade = terrain.gradeAlong(rig.x, rig.z, forwardX, forwardZ);
  // Gravitational acceleration along the direction of travel. sin(atan(g)) keeps
  // this correct for steep grades instead of over-reading like a raw slope would.
  const slopeAcceleration =
    -GRAVITY * (grade / Math.sqrt(1 + grade * grade)) * contactFraction;

  const waterDepth = Math.max(0, WATER_LEVEL - ground.height);
  const hydroState = calculateRiverHydroState(
    waterDepth,
    rig.speed,
    0.6,
    profile.mass,
    false,
    profile.fordDepth,
  );
  const drowning =
    hydroState.engineHydroLocked || waterDepth > profile.fordDepth;
  const netGrip = grip * hydroState.effectiveGripRatio;

  // ---------------------------------------------------------------------------
  // 5. Longitudinal dynamics.
  // ---------------------------------------------------------------------------
  const tractionLimit =
    netGrip *
    GRAVITY *
    TRACTION_GRAVITY_FRACTION *
    Math.max(0.05, contactFraction);

  let slipDemand = 0;
  if (input.accelerate) {
    const atmos = computeBarometricAtmosphere(
      ground.height,
      rig.modules.includes("survey-mast"),
    );
    const effectivePower = applyAltitudePowerDerate(
      profile.enginePower,
      atmos.engineAirEfficiency,
    );
    const baseDemand = driveForce(profile, rig.speed);
    // Carcass flex at low pressure costs top end. This is the price that stops
    // airing down from being a free upgrade the player leaves on permanently.
    const demand =
      (baseDemand * effectivePower * toolModifiers.topSpeedMultiplier) /
      profile.enginePower;
    const applied = Math.min(demand, tractionLimit);
    if (demand > tractionLimit) {
      slipDemand = clamp((demand - tractionLimit) / demand, 0, 1);
    }
    rig.speed += applied * dt;
  }

  if (input.brake) {
    if (rig.speed > 0.25) {
      const braking = Math.min(profile.activeBrake, tractionLimit * 1.35);
      rig.speed = Math.max(0, rig.speed - braking * dt);
    } else {
      const reverse = Math.min(profile.reverseAcceleration, tractionLimit);
      rig.speed -= reverse * dt;
    }
  }

  if (!input.accelerate && !input.brake) {
    const drag = profile.coastDrag * ground.surface.rollingDrag;
    rig.speed -=
      Math.sign(rig.speed) * Math.min(Math.abs(rig.speed), drag * dt);
  }

  // Gravity along the slope, and rolling resistance proportional to speed.
  rig.speed += slopeAcceleration * dt;
  const rollingResistance =
    (ground.surface.rollingDrag - 1) * 0.85 + (options.towing ? 1.1 : 0);
  if (rollingResistance > 0) {
    rig.speed -=
      Math.sign(rig.speed) *
      Math.min(
        Math.abs(rig.speed),
        rollingResistance * Math.abs(rig.speed) * dt,
      );
  }
  if (drowning) {
    // Beyond the fording depth the rig bogs down hard rather than being teleported
    // out. The player keeps agency; they just lose the ground they gambled on.
    rig.speed *= Math.max(0, 1 - 3.4 * dt);
  }

  const towLimit = options.towing ? profile.towSpeedMultiplier : 1;
  rig.speed = clamp(
    rig.speed,
    profile.reverseLimit * 1.35,
    profile.topSpeed * towLimit * 1.6,
  );

  const stalled =
    input.accelerate &&
    mobility.grounded &&
    Math.abs(rig.speed) < STALL_SPEED &&
    grade > 0.05 &&
    driveForce(profile, 0) * grip * TRACTION_GRAVITY_FRACTION <
      Math.abs(slopeAcceleration);

  // ---------------------------------------------------------------------------
  // 6. Steering. Authority is grip and contact, so ice understeers and air does
  //    nothing at all.
  // ---------------------------------------------------------------------------
  const steerTarget = Number(input.steerLeft) - Number(input.steerRight);
  const steerBlend = profile.steeringResponse * dt;
  rig.steering +=
    clamp(steerTarget - rig.steering, -steerBlend, steerBlend) || 0;
  rig.steering = clamp(rig.steering, -1, 1);

  const movementFactor = clamp(Math.abs(rig.speed) / 4, 0, 1);
  const direction = rig.speed >= 0 ? 1 : -1;
  const towStability = options.towing
    ? clamp(profile.mass / (profile.mass + 1.4), 0.45, 0.9)
    : 1;
  const steerAuthority = clamp(grip * contactFraction, 0, 1.1);
  // Positive steering is the player's left. For the chase viewer standing
  // BEHIND the rig looking along +forward, screen-left is world +X when the rig
  // faces +Z (Three.js lookAt right-axis = -X), so positive steering must
  // INCREASE heading. An earlier revision subtracted here after deriving
  // "left = -X" from the head-on view - a mirror error that made the body turn
  // opposite to its own visibly-steered front wheels.
  rig.heading +=
    rig.steering *
    profile.turnRate *
    movementFactor *
    direction *
    towStability *
    steerAuthority *
    // A locked axle scrubs: torque goes where grip is, and the rig turns wider.
    toolModifiers.steeringMultiplier *
    dt;

  // ---------------------------------------------------------------------------
  // 7. Integrate position, then bound the world as a disc.
  // ---------------------------------------------------------------------------
  const proposedX = rig.x + Math.sin(rig.heading) * rig.speed * dt;
  const proposedZ = rig.z + Math.cos(rig.heading) * rig.speed * dt;
  const traversal = resolveTerrainTraversal(
    terrain,
    profile,
    previousX,
    previousZ,
    proposedX,
    proposedZ,
  );
  rig.x = traversal.x;
  rig.z = traversal.z;
  if (traversal.blocked) rig.speed = 0;

  let boundarySpeed = 0;
  const radius = Math.hypot(rig.x, rig.z);
  if (radius > WORLD_LIMIT) {
    boundarySpeed = Math.abs(rig.speed);
    const scale = WORLD_LIMIT / radius;
    rig.x *= scale;
    rig.z *= scale;
    rig.speed *= -0.12;
  }

  const distance = Math.hypot(rig.x - previousX, rig.z - previousZ);
  rig.distanceTravelled += distance;
  // Wheel spin includes slip, so a spinning wheel visibly outruns the ground.
  const slipSpin = 1 + slipDemand * 2.4;
  mobility.wheelRotation += (rig.speed * dt * slipSpin) / profile.wheelRadius;

  // Smooth slip so audio and dust do not chatter on the fixed step.
  const slipBlend = 1 - Math.exp(-9 * dt);
  let slipAverage = 0;
  for (const wheel of mobility.wheels) {
    wheel.slip += (slipDemand - wheel.slip) * slipBlend;
    slipAverage += wheel.slip;
  }
  slipAverage /= 4;

  // Strain rises with load and slip, and recovers when coasting. This is the
  // hook a future maintenance/repair loop attaches to; today it drives audio and
  // the condition penalty for abusing a rig on ground it cannot handle.
  const strainInput =
    slipAverage * 0.7 + (drowning ? 0.5 : 0) + (stalled ? 0.6 : 0);
  rig.strain = clamp(
    rig.strain + (strainInput - rig.strain * 0.42) * dt * 1.6,
    0,
    1,
  );

  rig.telemetry.surfaceId = ground.surface.id;
  rig.telemetry.grade = grade;
  rig.telemetry.grip = grip;
  rig.telemetry.slip = slipAverage;
  rig.telemetry.waterDepth = waterDepth;
  rig.telemetry.engineLoad = input.accelerate
    ? clamp(driveForce(profile, rig.speed) / profile.enginePower, 0, 1)
    : 0;
  rig.telemetry.stalled = stalled;

  return {
    landingSpeed,
    launched,
    rampLaunch,
    stalled,
    boundarySpeed,
    waterDepth,
    drowning,
    slip: slipAverage,
    distance,
    surfaceId: ground.surface.id,
    grade,
    grip,
    traversalBlockReason: traversal.reason,
  };
}

/**
 * Low-hover traversal.
 *
 * This is deliberately not a wheeled controller with contact values set to
 * convenient numbers. The skirt follows the higher of terrain or standing
 * water, lift is a damped vertical system, and planar authority comes from
 * cushion pressure rather than tyre grip.
 */
function stepHoverMotion(
  rig: RigState,
  profile: EffectiveRig,
  input: InputFrame,
  terrain: TerrainField,
  dt: number,
  options: { towing: boolean },
): MotionOutcome {
  if (profile.mobilityAdapter !== "hover" || rig.mobility.kind !== "hover") {
    throw new Error(
      `Hover adapter received ${profile.mobilityAdapter}/${rig.mobility.kind}.`,
    );
  }

  const mobility = rig.mobility;
  const previousX = rig.x;
  const previousZ = rig.z;
  const forwardX = Math.sin(rig.heading);
  const forwardZ = Math.cos(rig.heading);
  const ground = terrain.sample(rig.x, rig.z);
  const waterDepth = Math.max(0, WATER_LEVEL - ground.height);
  const supportY = Math.max(
    ground.height,
    waterDepth > 0 ? WATER_LEVEL : -Infinity,
  );
  const targetY = supportY + profile.rideHeight;

  const liftAcceleration =
    profile.suspensionStiffness * (targetY - rig.y) -
    profile.suspensionDamping * mobility.liftVelocity;
  mobility.liftVelocity += liftAcceleration * dt;
  rig.y += mobility.liftVelocity * dt;
  mobility.clearance = Math.max(0, rig.y - supportY);
  mobility.skirtContact =
    mobility.clearance <= profile.rideHeight + profile.suspensionTravel;

  const pressureTarget = mobility.skirtContact
    ? clamp(
        1 -
          Math.abs(mobility.clearance - profile.rideHeight) /
            Math.max(0.2, profile.suspensionTravel * 2.2),
        0,
        1,
      )
    : 0;
  mobility.cushionPressure +=
    (pressureTarget - mobility.cushionPressure) *
    (1 - Math.exp(-profile.suspensionDamping * 0.55 * dt));

  const grade = terrain.gradeAlong(rig.x, rig.z, forwardX, forwardZ);
  const slopePenalty = clamp(1 - Math.abs(grade) * 1.45, 0, 1);
  const cushionAuthority = clamp(mobility.cushionPressure * slopePenalty, 0, 1);

  if (input.accelerate) {
    rig.speed += profile.enginePower * cushionAuthority * dt;
  }
  if (input.brake) {
    if (rig.speed > 0.25) {
      rig.speed = Math.max(0, rig.speed - profile.activeBrake * dt);
    } else {
      rig.speed -= profile.reverseAcceleration * cushionAuthority * dt;
    }
  }
  if (!input.accelerate && !input.brake) {
    const drag =
      profile.coastDrag *
      (waterDepth > 0 ? 0.62 : 1.05) *
      (options.towing ? 1.35 : 1);
    rig.speed -=
      Math.sign(rig.speed) * Math.min(Math.abs(rig.speed), drag * dt);
  }

  // Hovering removes tyre traction, not gravity. Cross-slope travel costs
  // authority and climbing a steep face still bleeds speed and raises strain.
  const slopeAcceleration =
    -GRAVITY * (grade / Math.sqrt(1 + grade * grade)) * 0.38;
  rig.speed += slopeAcceleration * dt;
  if (options.towing) {
    rig.speed *= Math.max(0, 1 - 0.48 * dt);
  }
  rig.speed = clamp(
    rig.speed,
    profile.reverseLimit * 1.25,
    profile.topSpeed * (options.towing ? profile.towSpeedMultiplier : 1) * 1.3,
  );

  const steerTarget = Number(input.steerLeft) - Number(input.steerRight);
  const steerBlend = profile.steeringResponse * dt;
  rig.steering +=
    clamp(steerTarget - rig.steering, -steerBlend, steerBlend) || 0;
  rig.steering = clamp(rig.steering, -1, 1);
  const movementFactor = clamp(Math.abs(rig.speed) / 3, 0.2, 1);
  const direction = rig.speed >= 0 ? 1 : -1;
  // Hover and ground adapters share the same player-relative steering sign.
  rig.heading +=
    rig.steering *
    profile.turnRate *
    movementFactor *
    direction *
    cushionAuthority *
    dt;

  const attitudeBlend = 1 - Math.exp(-5 * dt);
  const pitchTarget = clamp(-grade * 0.16, -0.12, 0.12);
  const rollTarget = clamp(-rig.steering * movementFactor * 0.12, -0.14, 0.14);
  rig.pitch += (pitchTarget - rig.pitch) * attitudeBlend;
  rig.roll += (rollTarget - rig.roll) * attitudeBlend;

  const proposedX = rig.x + Math.sin(rig.heading) * rig.speed * dt;
  const proposedZ = rig.z + Math.cos(rig.heading) * rig.speed * dt;
  const traversal = resolveTerrainTraversal(
    terrain,
    profile,
    previousX,
    previousZ,
    proposedX,
    proposedZ,
  );
  rig.x = traversal.x;
  rig.z = traversal.z;
  if (traversal.blocked) rig.speed = 0;

  let boundarySpeed = 0;
  const radius = Math.hypot(rig.x, rig.z);
  if (radius > WORLD_LIMIT) {
    boundarySpeed = Math.abs(rig.speed);
    const scale = WORLD_LIMIT / radius;
    rig.x *= scale;
    rig.z *= scale;
    rig.speed *= -0.12;
  }

  const distance = Math.hypot(rig.x - previousX, rig.z - previousZ);
  rig.distanceTravelled += distance;
  const slip = clamp(1 - cushionAuthority, 0, 1);
  const stalled =
    input.accelerate && Math.abs(rig.speed) < STALL_SPEED && slopePenalty < 0.3;
  const strainInput =
    slip * 0.52 + Math.abs(grade) * 0.34 + (options.towing ? 0.18 : 0);
  rig.strain = clamp(
    rig.strain + (strainInput - rig.strain * 0.5) * dt * 1.35,
    0,
    1,
  );

  rig.telemetry.surfaceId = waterDepth > 0 ? "water" : ground.surface.id;
  rig.telemetry.grade = grade;
  rig.telemetry.grip = cushionAuthority;
  rig.telemetry.slip = slip;
  rig.telemetry.waterDepth = waterDepth;
  rig.telemetry.engineLoad = input.accelerate
    ? clamp(1 - cushionAuthority * 0.35 + Math.abs(grade) * 0.2, 0, 1)
    : 0;
  rig.telemetry.stalled = stalled;

  return {
    landingSpeed: 0,
    launched: false,
    rampLaunch: false,
    stalled,
    boundarySpeed,
    waterDepth,
    drowning: false,
    slip,
    distance,
    surfaceId: waterDepth > 0 ? "water" : ground.surface.id,
    grade,
    grip: cushionAuthority,
    traversalBlockReason: traversal.reason,
  };
}

/**
 * Settle a rig onto the terrain without simulating a fall.
 *
 * Used at spawn, after a save restore, and after a winch recovery. Without this,
 * a restored rig starts `suspensionTravel` above or below the ground and the
 * first frame reads as an impact.
 */
function settleGroundRig(
  rig: RigState,
  profile: EffectiveRig,
  terrain: TerrainField,
): void {
  if (profile.mobilityAdapter !== "ground" || rig.mobility.kind !== "ground") {
    throw new Error(
      `Ground settle received ${profile.mobilityAdapter}/${rig.mobility.kind}.`,
    );
  }
  const mobility = rig.mobility;
  const forwardX = Math.sin(rig.heading);
  const forwardZ = Math.cos(rig.heading);
  const rightX = Math.cos(rig.heading);
  const rightZ = -Math.sin(rig.heading);
  const halfBase = profile.wheelbase * 0.5;
  const halfTrack = profile.track * 0.5;

  let sum = 0;
  let frontSum = 0;
  let rearSum = 0;
  let leftSum = 0;
  let rightSum = 0;
  for (const [signX, signZ] of WHEEL_LOCAL) {
    const localX = signX * halfTrack;
    const localZ = signZ * halfBase;
    const groundY = terrain.height(
      rig.x + rightX * localX + forwardX * localZ,
      rig.z + rightZ * localX + forwardZ * localZ,
    );
    sum += groundY;
    if (signZ > 0) frontSum += groundY;
    else rearSum += groundY;
    if (signX < 0) leftSum += groundY;
    else rightSum += groundY;
  }

  rig.y = sum / 4 + profile.rideHeight;
  mobility.verticalVelocity = 0;
  mobility.grounded = true;
  rig.pitch = Math.atan2((frontSum - rearSum) / 2, profile.wheelbase);
  rig.roll = Math.atan2((rightSum - leftSum) / 2, profile.track);
  for (const wheel of mobility.wheels) {
    wheel.compression = 0.5;
    wheel.contact = true;
    wheel.slip = 0;
  }
}

function settleHoverRig(
  rig: RigState,
  profile: EffectiveRig,
  terrain: TerrainField,
): void {
  if (profile.mobilityAdapter !== "hover" || rig.mobility.kind !== "hover") {
    throw new Error(
      `Hover settle received ${profile.mobilityAdapter}/${rig.mobility.kind}.`,
    );
  }
  const ground = terrain.sample(rig.x, rig.z);
  const waterDepth = Math.max(0, WATER_LEVEL - ground.height);
  const supportY = Math.max(
    ground.height,
    waterDepth > 0 ? WATER_LEVEL : -Infinity,
  );
  rig.y = supportY + profile.rideHeight;
  rig.pitch = 0;
  rig.roll = 0;
  rig.mobility.liftVelocity = 0;
  rig.mobility.clearance = profile.rideHeight;
  rig.mobility.cushionPressure = 1;
  rig.mobility.skirtContact = true;
}

interface MobilityAdapterImplementation {
  step(
    rig: RigState,
    profile: EffectiveRig,
    input: InputFrame,
    terrain: TerrainField,
    dt: number,
    options: MotionOptions,
  ): MotionOutcome;
  settle(rig: RigState, profile: EffectiveRig, terrain: TerrainField): void;
  stable(rig: RigState): boolean;
}

/**
 * Canonical bounded adapter registry.
 *
 * Only implemented locomotion families enter this table. Each implementation
 * still validates its discriminated state, so registry lookup cannot turn a
 * malformed profile/save pairing into permissive fallback behaviour.
 */
const MOBILITY_ADAPTERS: Readonly<
  Record<MobilityAdapter, MobilityAdapterImplementation>
> = {
  ground: {
    step: stepGroundMotion,
    settle: settleGroundRig,
    stable: (rig) => rig.mobility.kind === "ground" && rig.mobility.grounded,
  },
  hover: {
    step: stepHoverMotion,
    settle: settleHoverRig,
    stable: (rig) =>
      rig.mobility.kind === "hover" &&
      rig.mobility.skirtContact &&
      Math.abs(rig.mobility.liftVelocity) < 1.5,
  },
};

function adapterFor(
  rig: RigState,
  profile: EffectiveRig,
): MobilityAdapterImplementation {
  if (profile.mobilityAdapter !== rig.mobility.kind) {
    throw new Error(
      `Rig ${rig.id} profile/state mobility mismatch: ${profile.mobilityAdapter}/${rig.mobility.kind}.`,
    );
  }
  return MOBILITY_ADAPTERS[profile.mobilityAdapter];
}

export function stepRigMotion(
  rig: RigState,
  profile: EffectiveRig,
  input: InputFrame,
  terrain: TerrainField,
  dt: number,
  options: MotionOptions,
): MotionOutcome {
  return adapterFor(rig, profile).step(
    rig,
    profile,
    input,
    terrain,
    dt,
    options,
  );
}

export function settleRig(
  rig: RigState,
  profile: EffectiveRig,
  terrain: TerrainField,
): void {
  adapterFor(rig, profile).settle(rig, profile, terrain);
}

export function rigIsStable(rig: RigState): boolean {
  return MOBILITY_ADAPTERS[rig.mobility.kind].stable(rig);
}
