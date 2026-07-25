import "./styles.css";
import type {
  DynamicsMetrics,
  DynamicsService,
  DynamicsVehicle,
  VehicleDynamicsCapture,
  VehicleDynamicsTelemetry,
} from "../dynamics/contracts";
import {
  CAMERA_LABELS,
  CAMERA_MODES,
  type CameraMode,
} from "../game/contracts";
import {
  IDLE_VEHICLE_INTENT,
  normalizeVehicleIntent,
  type VehicleIntent,
} from "../game/vehicle-intent";
import {
  buildLabCollisionWorld,
  BOX3D_LAB_VEHICLE_CONFIG,
  LAB_VEHICLE_CONFIG,
  labSurfaceAt,
} from "./config";
import { PhysicsLabRenderer } from "./renderer";

interface PhysicsLabSnapshot {
  mode: "physics-lab-01" | "box3d-probe-01";
  controllerFamily: "raycast-wheel" | "physical-wheel";
  paused: boolean;
  debugGeometry: boolean;
  cameraMode: CameraMode;
  physicsFrequency: number;
  timeScale: number;
  surface: {
    id: string;
    label: string;
    frictionSlip: number;
    rollingResistance: number;
  };
  vehicle: VehicleDynamicsTelemetry;
  physics: DynamicsMetrics;
  render: {
    framesPerSecond: number;
    p95FrameMilliseconds: number;
    drawCalls: number;
    triangles: number;
    firstControllableMilliseconds: number;
  };
  recoveryCount: number;
}

declare global {
  interface Window {
    render_physics_lab_to_text: () => string;
    applyPhysicsLabIntent: (
      intent: Partial<VehicleIntent>,
      milliseconds: number,
    ) => string;
    selectPhysicsLabCamera: (cameraMode: CameraMode) => string;
    setPhysicsLabPaused: (paused: boolean) => string;
    togglePhysicsLabDebug: (enabled?: boolean) => string;
    resetPhysicsLab: () => string;
    render_box3d_lab_to_text: () => string;
    applyBox3DLabIntent: (
      intent: Partial<VehicleIntent>,
      milliseconds: number,
    ) => string;
    selectBox3DLabCamera: (cameraMode: CameraMode) => string;
    setBox3DLabPaused: (paused: boolean) => string;
    toggleBox3DLabDebug: (enabled?: boolean) => string;
    resetBox3DLab: () => string;
  }
}

function required<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Physics Lab is missing ${selector}.`);
  return element;
}

function percentile95(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[
    Math.min(ordered.length - 1, Math.ceil(ordered.length * 0.95) - 1)
  ]!;
}

async function createDynamicsFixture(useBox3D: boolean): Promise<{
  dynamics: DynamicsService;
  vehicle: DynamicsVehicle;
}> {
  if (useBox3D) {
    const { Box3DDynamicsService } = await import("../dynamics/box3d-dynamics");
    const dynamics = await Box3DDynamicsService.create();
    buildLabCollisionWorld(dynamics);
    return {
      dynamics,
      vehicle: dynamics.createPhysicalWheelVehicle(BOX3D_LAB_VEHICLE_CONFIG),
    };
  }

  const { RapierDynamicsService } = await import("../dynamics/rapier-dynamics");
  const dynamics = new RapierDynamicsService();
  buildLabCollisionWorld(dynamics);
  return {
    dynamics,
    vehicle: dynamics.createRaycastVehicle(LAB_VEHICLE_CONFIG),
  };
}

async function boot(): Promise<void> {
  const startedAt = performance.now();
  const useBox3D = document.body.dataset.dynamicsEngine === "box3d";
  const mode = useBox3D ? "box3d-probe-01" : "physics-lab-01";
  const controllerFamily = useBox3D ? "physical-wheel" : "raycast-wheel";
  const canvas = required<HTMLCanvasElement>("#physics-canvas");
  const renderer = new PhysicsLabRenderer(canvas);
  const { dynamics, vehicle } = await createDynamicsFixture(useBox3D);

  for (let index = 0; index < 90; index += 1) {
    vehicle.applyIntent(IDLE_VEHICLE_INTENT, labSurfaceAt(-52).profile, 1 / 60);
    dynamics.step(1 / 60);
  }
  let resetCapture: VehicleDynamicsCapture = vehicle.capture();

  const engineValue = required<HTMLElement>("#engine-value");
  const surfaceValue = required<HTMLElement>("#surface-value");
  const speedValue = required<HTMLElement>("#speed-value");
  const slipValue = required<HTMLElement>("#slip-value");
  const contactValue = required<HTMLElement>("#contact-value");
  const physicsMsValue = required<HTMLElement>("#physics-ms-value");
  const frameValue = required<HTMLElement>("#frame-value");
  const bodyValue = required<HTMLElement>("#body-value");
  const labPrompt = required<HTMLElement>("#lab-prompt");
  const labStatus = required<HTMLElement>("#lab-status");
  const pauseButton = required<HTMLButtonElement>("#pause-button");
  const debugButton = required<HTMLButtonElement>("#debug-button");
  const resetButton = required<HTMLButtonElement>("#reset-lab");
  const cameraSelect = required<HTMLSelectElement>("#lab-camera");
  const frequencySelect = required<HTMLSelectElement>("#physics-frequency");
  const timeScaleSelect = required<HTMLSelectElement>("#time-scale");
  const wheelBars = [0, 1, 2, 3].map((index) =>
    required<HTMLElement>(`#wheel-${index}`),
  );

  engineValue.textContent = `${dynamics.engine} ${dynamics.engineVersion}`;
  labStatus.textContent = useBox3D
    ? "Physical-wheel assembly ready. The bright nose is the front; the chase camera follows from behind."
    : "Raycast-wheel chassis ready. The bright nose is the front; the chase camera follows from behind.";

  let paused = false;
  let debugGeometry = false;
  let cameraMode: CameraMode = "chase";
  let physicsFrequency = 60;
  let timeScale = 1;
  let accumulator = 0;
  let previousTime = performance.now();
  let firstControllableMilliseconds = 0;
  let recoveryCount = 0;
  let active = true;
  const held = new Set<string>();
  const frameDurations: number[] = [];

  const keyboardMap: Readonly<Record<string, string>> = {
    KeyW: "forward",
    ArrowUp: "forward",
    KeyS: "reverse",
    ArrowDown: "reverse",
    KeyA: "left",
    ArrowLeft: "left",
    KeyD: "right",
    ArrowRight: "right",
    Space: "brake",
    ShiftLeft: "handbrake",
    ShiftRight: "handbrake",
  };

  const currentIntent = (): VehicleIntent =>
    normalizeVehicleIntent({
      throttle: Number(held.has("forward")) - Number(held.has("reverse")),
      steering: Number(held.has("left")) - Number(held.has("right")),
      brake: Number(held.has("brake")),
      handbrake: Number(held.has("handbrake")),
    });

  const step = (intent: VehicleIntent, dt: number): void => {
    const telemetry = vehicle.telemetry();
    const surface = labSurfaceAt(telemetry.body.position.z);
    vehicle.applyIntent(intent, surface.profile, dt);
    dynamics.step(dt);

    const next = vehicle.telemetry();
    if (
      next.body.position.y < -8 ||
      Math.abs(next.body.position.x) > 90 ||
      Math.abs(next.body.position.z) > 190
    ) {
      vehicle.restore(resetCapture);
      recoveryCount += 1;
      labStatus.textContent =
        "Automatic recovery returned the chassis to the last reset capture.";
    }
  };

  const snapshotObject = (): PhysicsLabSnapshot => {
    const telemetry = vehicle.telemetry();
    const surface = labSurfaceAt(telemetry.body.position.z);
    const metrics = dynamics.metrics();
    const renderMetrics = renderer.metrics();
    const averageFrame =
      frameDurations.length === 0
        ? 0
        : frameDurations.reduce((sum, value) => sum + value, 0) /
          frameDurations.length;
    return {
      mode,
      controllerFamily,
      paused,
      debugGeometry,
      cameraMode,
      physicsFrequency,
      timeScale,
      surface: {
        id: surface.id,
        label: surface.label,
        frictionSlip: surface.profile.frictionSlip,
        rollingResistance: surface.profile.rollingResistance,
      },
      vehicle: telemetry,
      physics: metrics,
      render: {
        framesPerSecond: averageFrame > 0 ? 1000 / averageFrame : 0,
        p95FrameMilliseconds: percentile95(frameDurations),
        drawCalls: renderMetrics.drawCalls,
        triangles: renderMetrics.triangles,
        firstControllableMilliseconds,
      },
      recoveryCount,
    };
  };

  const snapshot = (): string => JSON.stringify(snapshotObject(), null, 2);

  const updateInterface = (state: PhysicsLabSnapshot): void => {
    const { vehicle: telemetry, physics, surface, render } = state;
    surfaceValue.textContent = surface.label;
    speedValue.textContent = (Math.abs(telemetry.forwardSpeed) * 3.6).toFixed(
      1,
    );
    slipValue.textContent = `${Math.round(telemetry.averageLongitudinalSlip * 100)}%`;
    contactValue.textContent = `${physics.wheelContactCount} / 4`;
    physicsMsValue.textContent = `${physics.stepMilliseconds.toFixed(2)} ms`;
    frameValue.textContent = `${Math.round(render.framesPerSecond) || "--"} fps`;
    bodyValue.textContent = `${physics.bodyCount} / ${physics.colliderCount}`;
    telemetry.wheels.forEach((wheel, index) => {
      wheelBars[index]!.style.width =
        `${Math.max(7, Math.round(wheel.suspensionCompression * 100))}%`;
    });
    labPrompt.textContent =
      surface.id === "asphalt"
        ? "Build speed, then compare the same steering input on every strip."
        : surface.id === "gravel"
          ? "Gravel lowers the grip budget without changing the controls."
          : surface.id === "mud"
            ? "Mud raises rolling load and reveals wheelspin."
            : "Ice keeps momentum while lateral authority collapses.";
  };

  const renderNow = (delta = 0): string => {
    const telemetry = vehicle.telemetry();
    renderer.render(
      telemetry,
      cameraMode,
      debugGeometry ? dynamics.debugGeometry() : null,
      delta,
    );
    const state = snapshotObject();
    updateInterface(state);
    return JSON.stringify(state, null, 2);
  };

  const restore = (): string => {
    vehicle.restore(resetCapture);
    held.clear();
    labStatus.textContent =
      "Rig reset to the settled asphalt capture. No solver handles were saved.";
    return renderNow();
  };

  pauseButton.addEventListener("click", () => {
    paused = !paused;
    pauseButton.setAttribute("aria-pressed", String(paused));
    pauseButton.textContent = paused ? "Resume" : "Pause";
    labStatus.textContent = paused
      ? "Simulation paused; cameras and telemetry remain available."
      : "Fixed-step simulation resumed.";
  });
  debugButton.addEventListener("click", () => {
    debugGeometry = !debugGeometry;
    debugButton.setAttribute("aria-pressed", String(debugGeometry));
    labStatus.textContent = debugGeometry
      ? useBox3D
        ? "Box3D wrapper debug geometry is unavailable; wheel extraction remains visible."
        : "Rapier collider debug geometry is visible."
      : "Debug geometry hidden; extracted wheel state remains visible.";
  });
  resetButton.addEventListener("click", restore);

  cameraSelect.addEventListener("change", () => {
    const requested = cameraSelect.value as CameraMode;
    if (!CAMERA_MODES.includes(requested)) return;
    cameraMode = requested;
    labStatus.textContent = `${CAMERA_LABELS[requested]} camera selected.`;
    canvas.focus();
  });
  frequencySelect.addEventListener("change", () => {
    const requested = Number(frequencySelect.value);
    if (![30, 60, 120].includes(requested)) return;
    physicsFrequency = requested;
    accumulator = 0;
    labStatus.textContent = `Fixed physics frequency set to ${requested} Hz.`;
  });
  timeScaleSelect.addEventListener("change", () => {
    const requested = Number(timeScaleSelect.value);
    if (![0.5, 1, 2].includes(requested)) return;
    timeScale = requested;
    labStatus.textContent = `Laboratory time scale set to ${requested}×.`;
  });

  window.addEventListener("keydown", (event) => {
    const control = keyboardMap[event.code];
    if (control) {
      event.preventDefault();
      held.add(control);
      return;
    }
    if (event.repeat) return;
    if (event.code === "KeyC") {
      const index = CAMERA_MODES.indexOf(cameraMode);
      cameraMode = CAMERA_MODES[(index + 1) % CAMERA_MODES.length]!;
      cameraSelect.value = cameraMode;
    } else if (event.code === "KeyV") {
      debugButton.click();
    } else if (event.code === "KeyR") {
      restore();
    } else if (event.code === "KeyP") {
      pauseButton.click();
    }
  });
  window.addEventListener("keyup", (event) => {
    const control = keyboardMap[event.code];
    if (control) held.delete(control);
  });
  window.addEventListener("blur", () => held.clear());

  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-hold]",
  )) {
    const control = button.dataset.hold;
    if (!control) continue;
    const setHeld = (enabled: boolean): void => {
      if (enabled) held.add(control);
      else held.delete(control);
    };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      setHeld(true);
    });
    button.addEventListener("pointerup", () => setHeld(false));
    button.addEventListener("pointercancel", () => setHeld(false));
    button.addEventListener("lostpointercapture", () => setHeld(false));
  }

  window.render_physics_lab_to_text = snapshot;
  window.applyPhysicsLabIntent = (
    intent: Partial<VehicleIntent>,
    milliseconds: number,
  ) => {
    if (!Number.isFinite(milliseconds) || milliseconds <= 0) return snapshot();
    const normalized = normalizeVehicleIntent(intent);
    const dt = 1 / physicsFrequency;
    let remaining = Math.min(30_000, milliseconds) / 1000;
    while (remaining > 0) {
      const currentStep = Math.min(dt, remaining);
      step(normalized, currentStep);
      remaining -= currentStep;
    }
    return renderNow();
  };
  window.selectPhysicsLabCamera = (requested: CameraMode) => {
    if (!CAMERA_MODES.includes(requested)) {
      throw new Error(`Unknown Physics Lab camera: ${String(requested)}`);
    }
    cameraMode = requested;
    cameraSelect.value = requested;
    return renderNow();
  };
  window.setPhysicsLabPaused = (requested: boolean) => {
    paused = requested === true;
    pauseButton.setAttribute("aria-pressed", String(paused));
    pauseButton.textContent = paused ? "Resume" : "Pause";
    return renderNow();
  };
  window.togglePhysicsLabDebug = (requested?: boolean) => {
    debugGeometry = typeof requested === "boolean" ? requested : !debugGeometry;
    debugButton.setAttribute("aria-pressed", String(debugGeometry));
    return renderNow();
  };
  window.resetPhysicsLab = restore;
  window.render_box3d_lab_to_text = snapshot;
  window.applyBox3DLabIntent = window.applyPhysicsLabIntent;
  window.selectBox3DLabCamera = window.selectPhysicsLabCamera;
  window.setBox3DLabPaused = window.setPhysicsLabPaused;
  window.toggleBox3DLabDebug = window.togglePhysicsLabDebug;
  window.resetBox3DLab = restore;

  const frame = (now: number): void => {
    if (!active) return;
    const duration = Math.min(100, now - previousTime);
    previousTime = now;
    frameDurations.push(duration);
    if (frameDurations.length > 120) frameDurations.shift();

    const delta = duration / 1000;
    if (!paused) {
      accumulator += delta * timeScale;
      const dt = 1 / physicsFrequency;
      while (accumulator >= dt) {
        step(currentIntent(), dt);
        accumulator -= dt;
      }
    }

    if (firstControllableMilliseconds === 0) {
      firstControllableMilliseconds = performance.now() - startedAt;
      resetCapture = vehicle.capture();
    }
    renderNow(delta);
    requestAnimationFrame(frame);
  };

  const shutdown = (): void => {
    if (!active) return;
    active = false;
    renderer.dispose();
    dynamics.dispose();
  };
  window.addEventListener("pagehide", shutdown, { once: true });
  window.addEventListener("beforeunload", shutdown, { once: true });

  canvas.focus();
  renderNow();
  requestAnimationFrame(frame);
}

boot().catch((error: unknown) => {
  const panel = document.querySelector<HTMLElement>("#lab-error");
  const message = document.querySelector<HTMLElement>("#lab-error-message");
  if (panel && message) {
    panel.hidden = false;
    message.textContent =
      error instanceof Error ? error.message : "Unknown Physics Lab error.";
  }
  console.error("Rigs Unbound Physics Lab failed to start.", error);
});
