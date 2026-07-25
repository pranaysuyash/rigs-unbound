// @ts-check

export const FIXED_STEP_MS = 20;
export const WORLD = Object.freeze({ width: 100, height: 64 });
export const REQUIRED_HARVESTS = 3;
export const DEFENSE_DURATION_TICKS = 400;

const MAX_ADVANCE_MS = 10_000;
const TWO_PI = Math.PI * 2;

/** @typedef {"farm" | "defense" | "time-trial" | "complete" | "failed"} GameMode */

/**
 * @typedef {object} InputState
 * @property {number} throttle
 * @property {number} steer
 * @property {boolean} action
 */

/**
 * @typedef {object} VehicleState
 * @property {string} id
 * @property {number} x
 * @property {number} y
 * @property {number} heading
 * @property {number} speed
 * @property {number} condition
 * @property {number} scrap
 * @property {number} harvested
 * @property {number} actionCooldownTicks
 * @property {string[]} history
 */

/**
 * @typedef {object} CropState
 * @property {string} id
 * @property {number} x
 * @property {number} y
 * @property {boolean} harvested
 */

/**
 * @typedef {object} EnemyState
 * @property {string} id
 * @property {number} x
 * @property {number} y
 * @property {number} contactCooldownTicks
 */

/**
 * @typedef {object} CheckpointState
 * @property {string} id
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {object} ProbeEvent
 * @property {number} tick
 * @property {string} type
 * @property {string} message
 */

/**
 * @typedef {object} GameState
 * @property {1} version
 * @property {number} seed
 * @property {number} rngState
 * @property {number} tick
 * @property {number} accumulatorMs
 * @property {GameMode} mode
 * @property {"chase" | "top-down" | "route"} cameraMode
 * @property {VehicleState} vehicle
 * @property {CropState[]} crops
 * @property {EnemyState[]} enemies
 * @property {{ elapsedTicks: number, nextSpawnTick: number, defeated: number }} defense
 * @property {{ elapsedTicks: number, nextCheckpointIndex: number, checkpoints: CheckpointState[] }} trial
 * @property {ProbeEvent[]} events
 */

/** @type {Readonly<InputState>} */
export const NEUTRAL_INPUT = Object.freeze({
  throttle: 0,
  steer: 0,
  action: false,
});

const CROP_POSITIONS = Object.freeze([
  [25, 18],
  [39, 18],
  [53, 18],
  [32, 32],
  [47, 32],
]);

const CHECKPOINT_POSITIONS = Object.freeze([
  [72, 15],
  [84, 48],
  [53, 56],
  [18, 46],
]);

/**
 * Create the canonical state for this experiment.
 *
 * @param {number} [seed]
 * @returns {GameState}
 */
export function createGameState(seed = 0x52494753) {
  const normalizedSeed = normalizeSeed(seed);
  return {
    version: 1,
    seed: normalizedSeed,
    rngState: normalizedSeed,
    tick: 0,
    accumulatorMs: 0,
    mode: "farm",
    cameraMode: "chase",
    vehicle: {
      id: "vehicle.tractor.patch-01",
      x: 14,
      y: 48,
      heading: -0.2,
      speed: 0,
      condition: 0.55,
      scrap: 0,
      harvested: 0,
      actionCooldownTicks: 0,
      history: ["Recovered from the west shed"],
    },
    crops: CROP_POSITIONS.map(([x, y], index) => ({
      id: `crop.signal-${index + 1}`,
      x,
      y,
      harvested: false,
    })),
    enemies: [],
    defense: {
      elapsedTicks: 0,
      nextSpawnTick: 60,
      defeated: 0,
    },
    trial: {
      elapsedTicks: 0,
      nextCheckpointIndex: 0,
      checkpoints: CHECKPOINT_POSITIONS.map(([x, y], index) => ({
        id: `checkpoint-${index + 1}`,
        x,
        y,
      })),
    },
    events: [
      {
        tick: 0,
        type: "run.started",
        message: "The old tractor turns over at dawn.",
      },
    ],
  };
}

/**
 * Advance by real or virtual elapsed time. Simulation always resolves in
 * integer fixed steps, so equal input/time produces equal state.
 *
 * @param {GameState} state
 * @param {Partial<InputState>} input
 * @param {number} elapsedMs
 * @returns {number} number of fixed steps applied
 */
export function advanceGame(state, input, elapsedMs) {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) {
    return 0;
  }

  const normalizedInput = normalizeInput(input);
  state.accumulatorMs += Math.min(elapsedMs, MAX_ADVANCE_MS);
  let steps = 0;

  while (state.accumulatorMs >= FIXED_STEP_MS) {
    stepGame(state, normalizedInput);
    state.accumulatorMs -= FIXED_STEP_MS;
    steps += 1;
  }

  return steps;
}

/**
 * Apply exactly one simulation step.
 *
 * @param {GameState} state
 * @param {InputState} input
 */
export function stepGame(state, input) {
  if (state.mode === "complete" || state.mode === "failed") {
    state.tick += 1;
    return;
  }

  state.tick += 1;
  updateVehicle(state.vehicle, input);

  if (state.mode === "farm") {
    updateFarm(state, input);
  } else if (state.mode === "defense") {
    updateDefense(state, input);
  } else if (state.mode === "time-trial") {
    updateTimeTrial(state);
  }
}

/**
 * @param {GameState} state
 * @returns {string}
 */
export function renderGameToText(state) {
  const nextCheckpoint =
    state.trial.checkpoints[state.trial.nextCheckpointIndex] ?? null;

  const payload = {
    schema: "rigs-unbound.kernel-probe-state.v1",
    coordinates:
      "world origin is top-left; +x points right; +y points down; heading is radians clockwise from +x",
    seed: state.seed,
    tick: state.tick,
    timeMs: state.tick * FIXED_STEP_MS,
    mode: state.mode,
    camera: state.cameraMode,
    objective: describeObjective(state),
    vehicle: {
      id: state.vehicle.id,
      x: round(state.vehicle.x),
      y: round(state.vehicle.y),
      heading: round(state.vehicle.heading),
      speed: round(state.vehicle.speed),
      condition: round(state.vehicle.condition),
      scrap: state.vehicle.scrap,
      harvested: state.vehicle.harvested,
    },
    crops: state.crops
      .filter((crop) => !crop.harvested)
      .map(({ id, x, y }) => ({ id, x, y })),
    enemies: state.enemies.map(({ id, x, y }) => ({
      id,
      x: round(x),
      y: round(y),
    })),
    defense: {
      remainingMs: Math.max(
        0,
        (DEFENSE_DURATION_TICKS - state.defense.elapsedTicks) * FIXED_STEP_MS,
      ),
      defeated: state.defense.defeated,
    },
    trial: {
      nextCheckpoint: nextCheckpoint
        ? { id: nextCheckpoint.id, x: nextCheckpoint.x, y: nextCheckpoint.y }
        : null,
      completed: state.trial.nextCheckpointIndex,
      total: state.trial.checkpoints.length,
    },
    recentEvents: state.events.slice(-4),
  };

  return JSON.stringify(payload);
}

/**
 * @param {GameState} state
 * @returns {string}
 */
export function describeObjective(state) {
  if (state.mode === "farm") {
    return `Harvest ${Math.max(
      0,
      REQUIRED_HARVESTS - state.vehicle.harvested,
    )} more signal crop(s).`;
  }
  if (state.mode === "defense") {
    const seconds = Math.ceil(
      Math.max(0, DEFENSE_DURATION_TICKS - state.defense.elapsedTicks) /
        (1000 / FIXED_STEP_MS),
    );
    return `Hold the yard for ${seconds}s; plow threats with Space.`;
  }
  if (state.mode === "time-trial") {
    return `Reach checkpoint ${Math.min(
      state.trial.nextCheckpointIndex + 1,
      state.trial.checkpoints.length,
    )} of ${state.trial.checkpoints.length}.`;
  }
  if (state.mode === "complete") {
    return "Run complete: the same tractor survived all three verbs.";
  }
  return "The tractor is disabled. Press R to restart the probe.";
}

/**
 * @param {VehicleState} vehicle
 * @param {InputState} input
 */
function updateVehicle(vehicle, input) {
  const maxForwardSpeed = 11;
  const maxReverseSpeed = -4;
  const acceleration = input.throttle === 0 ? 0.82 : 0.42;
  const desiredSpeed =
    input.throttle >= 0
      ? input.throttle * maxForwardSpeed
      : -input.throttle * maxReverseSpeed;

  vehicle.speed += (desiredSpeed - vehicle.speed) * acceleration;
  if (Math.abs(vehicle.speed) < 0.015) vehicle.speed = 0;

  const steeringAuthority = 0.014 + Math.abs(vehicle.speed) * 0.0022;
  vehicle.heading = wrapAngle(
    vehicle.heading +
      input.steer * steeringAuthority * Math.sign(vehicle.speed || 1),
  );

  vehicle.x = clamp(
    vehicle.x +
      Math.cos(vehicle.heading) * vehicle.speed * (FIXED_STEP_MS / 1000),
    2,
    WORLD.width - 2,
  );
  vehicle.y = clamp(
    vehicle.y +
      Math.sin(vehicle.heading) * vehicle.speed * (FIXED_STEP_MS / 1000),
    2,
    WORLD.height - 2,
  );

  vehicle.actionCooldownTicks = Math.max(0, vehicle.actionCooldownTicks - 1);
}

/**
 * @param {GameState} state
 * @param {InputState} input
 */
function updateFarm(state, input) {
  if (!input.action || state.vehicle.actionCooldownTicks > 0) return;

  const target = state.crops.find(
    (crop) =>
      !crop.harvested &&
      distance(state.vehicle.x, state.vehicle.y, crop.x, crop.y) <= 5,
  );

  if (!target) return;

  target.harvested = true;
  state.vehicle.harvested += 1;
  state.vehicle.scrap += 1;
  state.vehicle.actionCooldownTicks = 8;
  recordEvent(
    state,
    "crop.harvested",
    `${target.id} yielded a usable repair plate.`,
  );

  if (state.vehicle.harvested >= REQUIRED_HARVESTS) {
    state.mode = "defense";
    state.cameraMode = "top-down";
    state.vehicle.history.push(
      "Worked the signal field before the first night",
    );
    recordEvent(
      state,
      "mode.changed",
      "The signal wakes the dark; the field becomes a defense yard.",
    );
  }
}

/**
 * @param {GameState} state
 * @param {InputState} input
 */
function updateDefense(state, input) {
  state.defense.elapsedTicks += 1;

  if (state.defense.elapsedTicks >= state.defense.nextSpawnTick) {
    spawnEnemy(state);
    state.defense.nextSpawnTick += 72;
  }

  /** @type {EnemyState[]} */
  const survivors = [];

  for (const enemy of state.enemies) {
    const angle = Math.atan2(
      state.vehicle.y - enemy.y,
      state.vehicle.x - enemy.x,
    );
    enemy.x += Math.cos(angle) * 2.2 * (FIXED_STEP_MS / 1000);
    enemy.y += Math.sin(angle) * 2.2 * (FIXED_STEP_MS / 1000);
    enemy.contactCooldownTicks = Math.max(0, enemy.contactCooldownTicks - 1);

    const touching =
      distance(state.vehicle.x, state.vehicle.y, enemy.x, enemy.y) <= 2.8;
    const plowing =
      input.action && Math.abs(state.vehicle.speed) >= 1.75 && touching;

    if (plowing) {
      state.defense.defeated += 1;
      state.vehicle.scrap += 1;
      recordEvent(state, "enemy.plowed", `${enemy.id} became salvage.`);
      continue;
    }

    if (touching && enemy.contactCooldownTicks === 0) {
      state.vehicle.condition = clamp(state.vehicle.condition - 0.08, 0, 1);
      enemy.contactCooldownTicks = 35;
      recordEvent(
        state,
        "vehicle.damaged",
        `${enemy.id} struck the tractor body.`,
      );
    }

    survivors.push(enemy);
  }

  state.enemies = survivors;

  if (state.vehicle.condition <= 0) {
    state.mode = "failed";
    state.vehicle.speed = 0;
    state.vehicle.history.push("Disabled during the first signal night");
    recordEvent(state, "run.failed", "The tractor can no longer move.");
    return;
  }

  if (state.defense.elapsedTicks >= DEFENSE_DURATION_TICKS) {
    state.mode = "time-trial";
    state.cameraMode = "route";
    state.enemies = [];
    state.vehicle.history.push("Held the yard until dawn");
    recordEvent(
      state,
      "mode.changed",
      "Dawn opens the ridge route; the tractor enters a time trial.",
    );
  }
}

/**
 * @param {GameState} state
 */
function updateTimeTrial(state) {
  state.trial.elapsedTicks += 1;
  const checkpoint =
    state.trial.checkpoints[state.trial.nextCheckpointIndex] ?? null;
  if (!checkpoint) return;

  if (
    distance(state.vehicle.x, state.vehicle.y, checkpoint.x, checkpoint.y) > 4
  ) {
    return;
  }

  state.trial.nextCheckpointIndex += 1;
  recordEvent(
    state,
    "checkpoint.reached",
    `${checkpoint.id} recorded the tractor.`,
  );

  if (state.trial.nextCheckpointIndex >= state.trial.checkpoints.length) {
    state.mode = "complete";
    state.cameraMode = "chase";
    state.vehicle.speed = 0;
    state.vehicle.history.push("Completed the first cross-mode run");
    recordEvent(
      state,
      "run.completed",
      "One tractor carried its condition and history through every mode.",
    );
  }
}

/**
 * @param {GameState} state
 */
function spawnEnemy(state) {
  const side = Math.floor(nextRandom(state) * 4);
  const offset = 5 + nextRandom(state) * 54;
  let x = 2;
  let y = offset;

  if (side === 1) {
    x = WORLD.width - 2;
  } else if (side === 2) {
    x = offset * (WORLD.width / WORLD.height);
    y = 2;
  } else if (side === 3) {
    x = offset * (WORLD.width / WORLD.height);
    y = WORLD.height - 2;
  }

  state.enemies.push({
    id: `threat-${state.tick}-${state.enemies.length + 1}`,
    x: clamp(x, 2, WORLD.width - 2),
    y: clamp(y, 2, WORLD.height - 2),
    contactCooldownTicks: 0,
  });
}

/**
 * @param {GameState} state
 * @returns {number}
 */
function nextRandom(state) {
  let value = state.rngState >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  state.rngState = value >>> 0;
  return state.rngState / 0x1_0000_0000;
}

/**
 * @param {GameState} state
 * @param {string} type
 * @param {string} message
 */
function recordEvent(state, type, message) {
  state.events.push({ tick: state.tick, type, message });
  if (state.events.length > 24)
    state.events.splice(0, state.events.length - 24);
}

/**
 * @param {Partial<InputState>} input
 * @returns {InputState}
 */
function normalizeInput(input) {
  return {
    throttle: clamp(Number(input.throttle ?? 0), -1, 1),
    steer: clamp(Number(input.steer ?? 0), -1, 1),
    action: Boolean(input.action),
  };
}

/**
 * @param {number} seed
 * @returns {number}
 */
function normalizeSeed(seed) {
  const value = Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : 0x52494753;
  return value === 0 ? 0x52494753 : value;
}

/**
 * @param {number} value
 * @param {number} minimum
 * @param {number} maximum
 */
function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

/**
 * @param {number} value
 */
function wrapAngle(value) {
  return ((value % TWO_PI) + TWO_PI) % TWO_PI;
}

/**
 * @param {number} ax
 * @param {number} ay
 * @param {number} bx
 * @param {number} by
 */
function distance(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

/**
 * @param {number} value
 */
function round(value) {
  return Math.round(value * 1000) / 1000;
}
