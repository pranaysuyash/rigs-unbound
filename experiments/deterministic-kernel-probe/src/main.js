// @ts-check

import {
  advanceGame,
  createGameState,
  describeObjective,
  renderGameToText,
  WORLD,
} from "./kernel.js";

/** @typedef {"up" | "down" | "left" | "right" | "action"} ControlName */

const TWO_PI = Math.PI * 2;
const canvas = /** @type {HTMLCanvasElement} */ (
  document.querySelector("#game-canvas")
);
const context = /** @type {CanvasRenderingContext2D} */ (
  canvas.getContext("2d")
);
const startPanel = /** @type {HTMLElement} */ (
  document.querySelector("#start-panel")
);
const startButton = /** @type {HTMLButtonElement} */ (
  document.querySelector("#start-btn")
);
const phaseLabel = /** @type {HTMLElement} */ (
  document.querySelector("#phase-label")
);
const objectiveLabel = /** @type {HTMLElement} */ (
  document.querySelector("#objective-label")
);
const conditionOutput = /** @type {HTMLOutputElement} */ (
  document.querySelector("#condition-output")
);
const scrapOutput = /** @type {HTMLOutputElement} */ (
  document.querySelector("#scrap-output")
);
const modeOutput = /** @type {HTMLOutputElement} */ (
  document.querySelector("#mode-output")
);
const tickOutput = /** @type {HTMLOutputElement} */ (
  document.querySelector("#tick-output")
);

let state = createGameState();
let started = false;
let automationMode = false;
let previousFrameTime = performance.now();

/** @type {Record<ControlName, boolean>} */
const held = {
  up: false,
  down: false,
  left: false,
  right: false,
  action: false,
};

/** @type {Map<string, ControlName>} */
const keyMap = new Map([
  ["arrowup", "up"],
  ["w", "up"],
  ["arrowdown", "down"],
  ["s", "down"],
  ["arrowleft", "left"],
  ["a", "left"],
  ["arrowright", "right"],
  ["d", "right"],
  [" ", "action"],
]);

startButton.addEventListener("click", () => {
  started = true;
  startPanel.hidden = true;
  canvas.focus();
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const control = keyMap.get(key);
  if (control) {
    event.preventDefault();
    held[control] = true;
    return;
  }
  if (key === "r") reset();
  if (key === "f") void toggleFullscreen();
});

window.addEventListener("keyup", (event) => {
  const control = keyMap.get(event.key.toLowerCase());
  if (!control) return;
  event.preventDefault();
  held[control] = false;
});

window.addEventListener("blur", clearHeldControls);
window.addEventListener("resize", resizeCanvas);

for (const button of document.querySelectorAll("[data-control]")) {
  if (!(button instanceof HTMLButtonElement)) continue;
  const control = button.dataset.control;
  if (!isControlName(control)) continue;

  /** @param {PointerEvent} event */
  const press = (event) => {
    event.preventDefault();
    held[control] = true;
    started = true;
    startPanel.hidden = true;
  };
  /** @param {PointerEvent} event */
  const release = (event) => {
    event.preventDefault();
    held[control] = false;
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
}

Object.assign(window, {
  render_game_to_text: () => renderGameToText(state),
  advanceTime,
});

resizeCanvas();
render();
requestAnimationFrame(frame);

/**
 * @param {number} now
 */
function frame(now) {
  const elapsedMs = Math.min(100, Math.max(0, now - previousFrameTime));
  previousFrameTime = now;
  if (started && !automationMode) {
    advanceGame(state, readInput(), elapsedMs);
  }
  render();
  requestAnimationFrame(frame);
}

function render() {
  const scaleX = canvas.width / WORLD.width;
  const scaleY = canvas.height / WORLD.height;
  drawGround(scaleX, scaleY);
  drawRoute(scaleX, scaleY);
  drawCrops(scaleX, scaleY);
  drawCheckpoints(scaleX, scaleY);
  drawEnemies(scaleX, scaleY);
  drawTractor(scaleX, scaleY);
  drawLighting();
  updateHud();
}

/**
 * @param {number} scaleX
 * @param {number} scaleY
 */
function drawGround(scaleX, scaleY) {
  const night = state.mode === "defense" || state.mode === "failed";
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  if (night) {
    gradient.addColorStop(0, "#162d36");
    gradient.addColorStop(1, "#07171a");
  } else {
    gradient.addColorStop(0, "#d7b66c");
    gradient.addColorStop(1, "#8b743e");
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.save();
  context.globalAlpha = night ? 0.13 : 0.25;
  context.strokeStyle = night ? "#88a78c" : "#604b27";
  context.lineWidth = Math.max(1, scaleX * 0.08);
  for (let y = 8; y < WORLD.height; y += 8) {
    context.beginPath();
    context.moveTo(0, y * scaleY);
    context.lineTo(canvas.width, y * scaleY);
    context.stroke();
  }
  context.restore();

  context.fillStyle = night ? "#274639" : "#6b6b34";
  context.fillRect(0, 0, canvas.width, 5 * scaleY);
  context.fillRect(0, 59 * scaleY, canvas.width, 5 * scaleY);
}

/**
 * @param {number} scaleX
 * @param {number} scaleY
 */
function drawRoute(scaleX, scaleY) {
  if (state.mode !== "time-trial" && state.mode !== "complete") return;

  context.save();
  context.strokeStyle = "#d9c596";
  context.lineWidth = 1.8 * Math.min(scaleX, scaleY);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(12 * scaleX, 49 * scaleY);
  for (const checkpoint of state.trial.checkpoints) {
    context.lineTo(checkpoint.x * scaleX, checkpoint.y * scaleY);
  }
  context.stroke();
  context.restore();
}

/**
 * @param {number} scaleX
 * @param {number} scaleY
 */
function drawCrops(scaleX, scaleY) {
  for (const crop of state.crops) {
    context.save();
    context.translate(crop.x * scaleX, crop.y * scaleY);
    context.globalAlpha = crop.harvested ? 0.16 : 1;
    context.fillStyle = state.mode === "defense" ? "#6b8a67" : "#466c31";
    for (let stem = -2; stem <= 2; stem += 1) {
      context.fillRect(
        stem * scaleX * 0.35,
        -scaleY * (2.4 + Math.abs(stem) * 0.1),
        scaleX * 0.18,
        scaleY * 2.4,
      );
    }
    context.fillStyle = "#e7b347";
    context.beginPath();
    context.arc(0, -scaleY * 2.3, scaleX * 0.62, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}

/**
 * @param {number} scaleX
 * @param {number} scaleY
 */
function drawCheckpoints(scaleX, scaleY) {
  if (state.mode !== "time-trial" && state.mode !== "complete") return;
  state.trial.checkpoints.forEach((checkpoint, index) => {
    const active = index === state.trial.nextCheckpointIndex;
    const completed = index < state.trial.nextCheckpointIndex;
    context.save();
    context.translate(checkpoint.x * scaleX, checkpoint.y * scaleY);
    context.strokeStyle = completed
      ? "#87a86c"
      : active
        ? "#f7c65c"
        : "#716c59";
    context.lineWidth = active ? 4 : 2;
    context.beginPath();
    context.arc(0, 0, scaleX * (active ? 3.2 : 2.2), 0, Math.PI * 2);
    context.stroke();
    context.restore();
  });
}

/**
 * @param {number} scaleX
 * @param {number} scaleY
 */
function drawEnemies(scaleX, scaleY) {
  for (const enemy of state.enemies) {
    context.save();
    context.translate(enemy.x * scaleX, enemy.y * scaleY);
    context.rotate(Math.PI / 4);
    context.fillStyle = "#172127";
    context.fillRect(-scaleX, -scaleY, scaleX * 2, scaleY * 2);
    context.fillStyle = "#e2573e";
    context.beginPath();
    context.arc(0, 0, scaleX * 0.38, 0, TWO_PI);
    context.fill();
    context.restore();
  }
}

/**
 * @param {number} scaleX
 * @param {number} scaleY
 */
function drawTractor(scaleX, scaleY) {
  const vehicle = state.vehicle;
  context.save();
  context.translate(vehicle.x * scaleX, vehicle.y * scaleY);
  context.rotate(vehicle.heading);

  const bodyLength = scaleX * 6.3;
  const bodyWidth = scaleY * 4.6;
  const damage = 1 - vehicle.condition;

  context.fillStyle = "#242823";
  context.fillRect(
    -bodyLength * 0.52,
    -bodyWidth * 0.72,
    scaleX,
    bodyWidth * 1.44,
  );
  context.fillRect(
    bodyLength * 0.24,
    -bodyWidth * 0.62,
    scaleX,
    bodyWidth * 1.24,
  );

  context.fillStyle = damage > 0.65 ? "#76452d" : "#a84f32";
  context.fillRect(
    -bodyLength * 0.45,
    -bodyWidth * 0.5,
    bodyLength * 0.9,
    bodyWidth,
  );

  context.fillStyle = "#d4c58e";
  context.fillRect(
    -bodyLength * 0.05,
    -bodyWidth * 0.45,
    bodyLength * 0.42,
    bodyWidth * 0.9,
  );

  context.strokeStyle = "#3e3427";
  context.lineWidth = 2;
  context.strokeRect(
    -bodyLength * 0.05,
    -bodyWidth * 0.45,
    bodyLength * 0.42,
    bodyWidth * 0.9,
  );

  context.fillStyle = "#f4c65a";
  context.beginPath();
  context.arc(bodyLength * 0.38, -bodyWidth * 0.29, scaleX * 0.24, 0, TWO_PI);
  context.arc(bodyLength * 0.38, bodyWidth * 0.29, scaleX * 0.24, 0, TWO_PI);
  context.fill();

  context.strokeStyle = "#7e8d79";
  context.lineWidth = scaleY * 0.5;
  context.beginPath();
  context.moveTo(bodyLength * 0.48, -bodyWidth * 0.62);
  context.lineTo(bodyLength * 0.82, -bodyWidth * 0.95);
  context.moveTo(bodyLength * 0.48, bodyWidth * 0.62);
  context.lineTo(bodyLength * 0.82, bodyWidth * 0.95);
  context.stroke();

  if (held.action) {
    context.strokeStyle = "#f0d58c";
    context.lineWidth = 2;
    context.strokeRect(
      bodyLength * 0.75,
      -bodyWidth * 1.15,
      scaleX * 1.2,
      bodyWidth * 2.3,
    );
  }

  context.restore();
}

function drawLighting() {
  if (state.mode !== "defense" && state.mode !== "failed") return;

  const vehicle = state.vehicle;
  const scaleX = canvas.width / WORLD.width;
  const scaleY = canvas.height / WORLD.height;
  const x = vehicle.x * scaleX;
  const y = vehicle.y * scaleY;
  const radius = Math.min(canvas.width, canvas.height) * 0.25;
  const glow = context.createRadialGradient(x, y, radius * 0.12, x, y, radius);
  glow.addColorStop(0, "rgba(242, 190, 92, 0.26)");
  glow.addColorStop(1, "rgba(4, 10, 13, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function updateHud() {
  const labels = {
    farm: "Dawn repair run",
    defense: "Signal night",
    "time-trial": "Ridge time trial",
    complete: "One rig, three verbs",
    failed: "Tractor disabled",
  };
  phaseLabel.textContent = labels[state.mode];
  objectiveLabel.textContent = describeObjective(state);
  conditionOutput.value = `${Math.round(state.vehicle.condition * 100)}%`;
  scrapOutput.value = String(state.vehicle.scrap);
  modeOutput.value = state.mode;
  tickOutput.value = String(state.tick);
}

function readInput() {
  return {
    throttle: Number(held.up) - Number(held.down),
    steer: Number(held.right) - Number(held.left),
    action: held.action,
  };
}

function clearHeldControls() {
  held.up = false;
  held.down = false;
  held.left = false;
  held.right = false;
  held.action = false;
}

/**
 * @param {number} elapsedMs
 */
function advanceTime(elapsedMs) {
  automationMode = true;
  started = true;
  startPanel.hidden = true;
  advanceGame(state, readInput(), Number(elapsedMs));
  render();
  return renderGameToText(state);
}

/**
 * @param {string | undefined} value
 * @returns {value is ControlName}
 */
function isControlName(value) {
  return (
    value === "up" ||
    value === "down" ||
    value === "left" ||
    value === "right" ||
    value === "action"
  );
}

function reset() {
  state = createGameState();
  clearHeldControls();
  started = true;
  automationMode = false;
  startPanel.hidden = true;
  previousFrameTime = performance.now();
  render();
}

async function toggleFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await document.documentElement.requestFullscreen();
  }
  resizeCanvas();
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(640, Math.round(bounds.width * pixelRatio));
  canvas.height = Math.max(360, Math.round(bounds.height * pixelRatio));
  render();
}
