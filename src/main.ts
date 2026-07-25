/**
 * Browser entry point: wiring, HUD, and the observability contract.
 *
 * Owns no gameplay rules. Its jobs are to construct the world, run the fixed-step
 * loop, translate named actions from keyboard/gamepad/touch, render the DOM HUD,
 * and expose the `window.*` hooks the browser acceptance tool drives.
 */

import "./styles.css";
import {
  BASE_SURVEY_RANGE,
  CAMERA_LABELS,
  CAMERA_MODES,
  effectiveProfile,
  FIXED_STEP_SECONDS,
  IDLE_INPUT,
  LANDMARKS,
  MODULE_IDS,
  MODULES,
  RIG_IDS,
  type ContinuousAction,
  type CameraMode,
  type GameState,
  type InputFrame,
  type ModuleId,
  type RigId,
  type TapAction,
} from "./game/contracts";
import { RigAudio } from "./game/audio";
import { GameWorld } from "./game/gameworld";
import { InputController } from "./game/input";
import { FieldMap } from "./game/minimap";
import {
  PerformanceMonitor,
  type PerformanceSnapshot,
} from "./game/performance";
import { GameRenderer } from "./game/renderer";
import type {
  RigOrientationEvidence,
  RigPerceptionEvidence,
} from "./game/renderer";
import {
  activeRig,
  advanceGame,
  createInitialState,
  cycleCamera,
  cyclePhase,
  installModule,
  performPrimaryAction,
  publicState,
  repairRig,
  selectCamera,
  selectActiveRig,
  settleWorld,
  stepGame,
  switchActiveRig,
  togglePause,
  toggleMap,
  winchRecover,
  workshopInReach,
} from "./game/state";
import { clearState, loadState, saveState } from "./game/storage";
import { BIOMES, SURFACES, type SurfaceId } from "./game/world";

const navigationEntry = performance.getEntriesByType("navigation")[0] as
  PerformanceNavigationTiming | undefined;
const BOOT_STARTED_AT = navigationEntry?.startTime ?? 0;

declare global {
  interface Window {
    render_game_to_text: () => string;
    advanceTime: (milliseconds: number) => string;
    selectRig: (rigId: RigId) => string;
    selectCamera: (cameraMode: CameraMode) => string;
    performRigAction: () => string;
    applyRigInput: (input: Partial<InputFrame>, milliseconds: number) => string;
    getPerformanceSnapshot: () => PerformanceSnapshot;
    getRigOrientationEvidence: (rigId?: RigId) => RigOrientationEvidence;
    getRigPerceptionEvidence: (rigId?: RigId) => RigPerceptionEvidence;
    installRigModule: (moduleId: ModuleId) => string;
    winchRecoverRig: () => string;
    toggleFieldMap: () => string;
    /**
     * Test hook: place the active rig anywhere and settle it.
     *
     * The world is 500 m across and deliberately slow to cross in the tractor, so
     * without this an acceptance run would spend minutes driving instead of
     * checking behaviour. Not reachable from any in-game control.
     */
    placeRig: (x: number, z: number, heading?: number) => string;
  }
}

function requiredElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Required interface element is missing: ${selector}`);
  }
  return element;
}

function phaseTime(state: GameState): string {
  const baseMinutes =
    state.phase === "day" ? 400 : state.phase === "gloam" ? 1125 : 1340;
  const minutes = (baseMinutes + Math.floor(state.elapsedMs / 2400)) % 1440;
  const hour = Math.floor(minutes / 60);
  return `${String(hour).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function headingLabel(heading: number): string {
  const degrees = ((heading * 180) / Math.PI + 360) % 360;
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
  return labels[Math.round(degrees / 45) % labels.length] ?? "N";
}

/**
 * Describe a grade in words as well as a bar.
 *
 * Icon + text + state, never colour alone: the grade readout has to work for a
 * player who cannot distinguish the bar's colour, per the UI rules in DESIGN.md.
 */
function gradeLabel(grade: number): string {
  const percent = Math.round(grade * 100);
  if (percent > 22) return `steep up ${percent}%`;
  if (percent > 7) return `up ${percent}%`;
  if (percent < -22) return `steep down ${percent}%`;
  if (percent < -7) return `down ${percent}%`;
  return "level";
}

function boot(): void {
  const canvas = requiredElement<HTMLCanvasElement>("#game-canvas");
  const mapCanvas = requiredElement<HTMLCanvasElement>("#map-canvas");

  // The world must exist before the save is read, because loading applies the
  // record's spatial memory into it and settles the rigs onto its terrain.
  const bootState = createInitialState();
  let world = new GameWorld(bootState.seed);
  const loadResult = loadState(window.localStorage, world);
  let state = loadResult.state;
  if (state.seed !== world.seed) {
    // A restored record can carry a different seed than the default. Rebuild the
    // world for it rather than silently playing the wrong terrain.
    world = new GameWorld(state.seed);
    settleWorld(state, world);
  }

  const renderer = new GameRenderer(canvas, world);
  const fieldMap = new FieldMap(mapCanvas, world);
  const input = new InputController();
  const audio = new RigAudio();
  const performanceMonitor = new PerformanceMonitor(
    BOOT_STARTED_AT,
    loadResult.loadDurationMs,
  );

  const phaseLabel = requiredElement<HTMLElement>("#phase-label");
  const timeLabel = requiredElement<HTMLElement>("#time-label");
  const surfaceLabel = requiredElement<HTMLElement>("#surface-label");
  const biomeLabel = requiredElement<HTMLElement>("#biome-label");
  const rigValue = requiredElement<HTMLElement>("#rig-value");
  const speedValue = requiredElement<HTMLElement>("#speed-value");
  const capabilityValue = requiredElement<HTMLElement>("#capability-value");
  const conditionValue = requiredElement<HTMLElement>("#condition-value");
  const salvageValue = requiredElement<HTMLElement>("#salvage-value");
  const surveyValue = requiredElement<HTMLElement>("#survey-value");
  const mobilityLabel = requiredElement<HTMLElement>("#mobility-label");
  const gripBar = requiredElement<HTMLElement>("#grip-bar");
  const gripText = requiredElement<HTMLElement>("#grip-text");
  const gradeBar = requiredElement<HTMLElement>("#grade-bar");
  const gradeText = requiredElement<HTMLElement>("#grade-text");
  const prompt = requiredElement<HTMLElement>("#current-prompt");
  const saveStatus = requiredElement<HTMLElement>("#save-status");
  const landmarkList = requiredElement<HTMLOListElement>("#landmark-list");
  const toast = requiredElement<HTMLElement>("#toast");
  const pauseOverlay = requiredElement<HTMLElement>("#pause-overlay");
  const welcomePanel = requiredElement<HTMLElement>("#welcome-panel");
  const enterWorldButton = requiredElement<HTMLButtonElement>("#enter-world");
  const resetButton = requiredElement<HTMLButtonElement>("#reset-button");
  const muteButton = requiredElement<HTMLButtonElement>("#mute-button");
  const fullscreenButton =
    requiredElement<HTMLButtonElement>("#fullscreen-button");
  const cameraSelect = requiredElement<HTMLSelectElement>("#camera-select");
  const workshopPanel = requiredElement<HTMLElement>("#workshop-panel");
  const workshopSalvage = requiredElement<HTMLElement>("#workshop-salvage");
  const moduleList = requiredElement<HTMLOListElement>("#module-list");
  const mapOverlay = requiredElement<HTMLElement>("#map-overlay");
  const mapProgress = requiredElement<HTMLElement>("#map-progress");
  const mapClose = requiredElement<HTMLButtonElement>("#map-close");

  let statusMessage = loadResult.message;
  saveStatus.textContent = statusMessage;

  for (const landmark of LANDMARKS) {
    const item = document.createElement("li");
    item.dataset.landmarkId = landmark.id;
    item.innerHTML = `
      <span class="opportunity-rail__signal" aria-hidden="true"></span>
      <span>
        <strong>${landmark.name}</strong>
        <small>${landmark.verb}</small>
      </span>
      <em>-- m</em>
    `;
    landmarkList.append(item);
  }

  for (const moduleId of MODULE_IDS) {
    const definition = MODULES[moduleId];
    const item = document.createElement("li");
    item.dataset.moduleId = moduleId;
    item.innerHTML = `
      <kbd>${MODULE_IDS.indexOf(moduleId) + 1}</kbd>
      <span>
        <strong>${definition.name}</strong>
        <small>${definition.promise}</small>
      </span>
      <em>${definition.cost}</em>
    `;
    moduleList.append(item);
  }

  let toastTimer = 0;
  const showToast = (message: string): void => {
    toast.textContent = message;
    toast.classList.add("toast--visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(
      () => toast.classList.remove("toast--visible"),
      3000,
    );
  };

  const announce = (): void => {
    if (state.lastDiagnostic) showToast(state.lastDiagnostic);
  };

  const tap = (action: TapAction): void => {
    void audio.unlock();
    if (action === "primary") {
      const before = state.salvage;
      performPrimaryAction(state, world);
      if (state.salvage > before) audio.chirp(720);
      announce();
    } else if (action === "switchRig") {
      switchActiveRig(state);
      announce();
    } else if (action === "camera") {
      cycleCamera(state);
      cameraSelect.value = state.cameraMode;
      showToast(`${CAMERA_LABELS[state.cameraMode]} view.`);
    } else if (action === "phase") {
      cyclePhase(state);
      showToast(
        `${state.phase === "day" ? "Daylight" : state.phase === "gloam" ? "Gloam" : "Night"} active.`,
      );
    } else if (action === "map") {
      toggleMap(state);
      mapOverlay.hidden = !state.mapOpen;
      if (state.mapOpen) fieldMap.draw(state);
    } else if (action === "recover") {
      winchRecover(state, world);
      announce();
    } else {
      togglePause(state);
      pauseOverlay.hidden = !state.paused;
    }
  };

  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    const moduleIndex = Number.parseInt(event.key, 10);
    if (
      Number.isInteger(moduleIndex) &&
      moduleIndex >= 1 &&
      moduleIndex <= MODULE_IDS.length
    ) {
      void audio.unlock();
      installModule(state, world, MODULE_IDS[moduleIndex - 1]!);
      if (state.lastDiagnostic?.includes("fitted")) audio.chirp(880);
      announce();
      return;
    }

    if (event.code === "Space" || event.code === "KeyE") {
      event.preventDefault();
      tap("primary");
    } else if (event.code === "KeyR") {
      tap("switchRig");
    } else if (event.code === "KeyC") {
      tap("camera");
    } else if (event.code === "KeyN") {
      tap("phase");
    } else if (event.code === "KeyM") {
      tap("map");
    } else if (event.code === "KeyX") {
      tap("recover");
    } else if (event.code === "KeyT") {
      void audio.unlock();
      repairRig(state);
      announce();
    } else if (event.code === "KeyU") {
      muteButton.click();
    } else if (event.code === "KeyF") {
      fullscreenButton.click();
    } else if (event.code === "KeyP") {
      tap("pause");
    } else if (event.code === "Escape") {
      // Escape closes the map first, so it never traps the player behind a panel.
      if (state.mapOpen) {
        tap("map");
      } else {
        tap("pause");
      }
    }
  });

  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-hold-action]",
  )) {
    const action = button.dataset.holdAction as ContinuousAction;
    const setHeld = (active: boolean): void => input.hold(action, active);
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      void audio.unlock();
      setHeld(true);
    });
    button.addEventListener("pointerup", () => setHeld(false));
    button.addEventListener("pointercancel", () => setHeld(false));
    button.addEventListener("lostpointercapture", () => setHeld(false));
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-tap-action]",
  )) {
    button.addEventListener("click", () =>
      tap(button.dataset.tapAction as TapAction),
    );
  }

  moduleList.addEventListener("click", (event) => {
    const item = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-module-id]",
    );
    if (!item) return;
    void audio.unlock();
    installModule(state, world, item.dataset.moduleId as ModuleId);
    announce();
  });

  enterWorldButton.addEventListener("click", () => {
    welcomePanel.classList.add("welcome-panel--dismissed");
    window.sessionStorage.setItem("rigs-unbound.welcome-seen", "true");
    canvas.focus();
    void audio.unlock();
    showToast("Salvage sits off the graded tracks. Press M for the field map.");
  });

  if (window.sessionStorage.getItem("rigs-unbound.welcome-seen") === "true") {
    welcomePanel.classList.add("welcome-panel--dismissed");
  }

  muteButton.addEventListener("click", () => {
    const next = !audio.isEnabled;
    audio.setEnabled(next);
    muteButton.textContent = next ? "Sound on" : "Sound off";
    muteButton.setAttribute("aria-pressed", next ? "false" : "true");
    if (next) void audio.unlock();
  });

  fullscreenButton.addEventListener("click", () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      fullscreenButton.textContent = "Fullscreen";
    } else {
      void document.documentElement.requestFullscreen().catch(() => {
        showToast("This browser refused fullscreen.");
      });
      fullscreenButton.textContent = "Exit fullscreen";
    }
  });

  mapClose.addEventListener("click", () => tap("map"));

  cameraSelect.addEventListener("change", () => {
    const cameraMode = cameraSelect.value as CameraMode;
    if (!CAMERA_MODES.includes(cameraMode)) return;
    selectCamera(state, cameraMode);
    showToast(`${CAMERA_LABELS[cameraMode]} view.`);
    canvas.focus();
  });

  resetButton.addEventListener("click", () => {
    const confirmed = window.confirm(
      "Reset both rigs, the relay, and everything the world remembers?",
    );
    if (!confirmed) return;
    clearState(window.localStorage);
    world.reset();
    state = createInitialState(state.seed);
    settleWorld(state, world);
    fieldMap.clear();
    renderer.invalidate(state);
    statusMessage = "Local field reset.";
    saveStatus.textContent = statusMessage;
    showToast("Field restored to its starting state.");
  });

  let lastDiagnostic: string | null = state.lastDiagnostic;
  let lastUiUpdate = 0;
  let lastMapUpdate = 0;

  const updateInterface = (now: number): void => {
    if (now - lastUiUpdate < 100) return;
    lastUiUpdate = now;

    const rig = activeRig(state);
    const profile = effectiveProfile(rig.id, rig.modules);
    const plough = rig.attachments.find((item) => item.id === "field-plough");
    const towing = state.cargoRelay.cargo.attachedRigId === rig.id;
    const telemetry = rig.telemetry;

    phaseLabel.textContent = state.phase;
    timeLabel.textContent = phaseTime(state);
    surfaceLabel.textContent =
      SURFACES[telemetry.surfaceId as SurfaceId]?.displayName ?? "Ground";
    biomeLabel.textContent =
      BIOMES[world.terrain.biomeAt(rig.x, rig.z)].displayName;
    rigValue.textContent = profile.fieldName;
    speedValue.textContent = String(Math.round(Math.abs(rig.speed) * 3.6));
    capabilityValue.textContent = towing
      ? "Towing"
      : plough?.engaged
        ? "Ploughing"
        : profile.capabilities.join(" · ");
    conditionValue.textContent = `${Math.round(rig.condition)}%`;
    salvageValue.textContent = String(state.salvage);

    const surveyed = world.exploration.surveyedFraction(
      world.surveyedCells,
      190,
    );
    surveyValue.textContent = `${Math.round(surveyed * 100)}%`;
    cameraSelect.value = state.cameraMode;

    const gripRatio = Math.min(1, telemetry.grip / 1.2);
    const hovering = rig.mobility.kind === "hover";
    mobilityLabel.textContent = hovering ? "Cushion" : "Grip";
    gripBar.style.width = `${Math.round(gripRatio * 100)}%`;
    gripText.textContent = telemetry.stalled
      ? "stalled"
      : telemetry.slip > 0.3
        ? hovering
          ? "weak"
          : "slipping"
        : `${Math.round(gripRatio * 100)}%`;
    gripBar.classList.toggle("is-poor", gripRatio < 0.45);

    const gradeRatio = Math.min(1, Math.abs(telemetry.grade) / 0.6);
    gradeBar.style.width = `${Math.round(gradeRatio * 100)}%`;
    gradeText.textContent = gradeLabel(telemetry.grade);
    gradeBar.classList.toggle("is-poor", telemetry.grade > 0.3);

    // Prompt: the nearest thing worth doing, phrased as a verb and a consequence.
    const workshop = workshopInReach(state);
    const relay = state.cargoRelay;
    if (state.paused) {
      prompt.textContent = "Paused.";
    } else if (workshop) {
      prompt.textContent = `${workshop.name} workshop · fit modules, ${state.salvage} salvage in the bin`;
    } else if (relay.cargo.attachedRigId === rig.id) {
      const distance = Math.round(
        Math.hypot(rig.x - LANDMARKS[1]!.x, rig.z - LANDMARKS[1]!.z),
      );
      prompt.textContent = `${headingLabel(rig.heading)} · Long Furrow ${distance} m · deliver the crate`;
    } else if (telemetry.stalled) {
      prompt.textContent =
        "Too steep for this gearing. Back off or find a line.";
    } else if (telemetry.waterDepth > profile.fordDepth) {
      prompt.textContent =
        "Water is over the axles. Get out before it costs you.";
    } else if (hovering && telemetry.waterDepth > 1.1) {
      prompt.textContent =
        "Cushion holding · skim the flooded line Torque cannot ford.";
    } else {
      const node = world.exploration.nearestNode(
        rig.x,
        rig.z,
        70,
        world.collectedNodes,
      );
      if (node) {
        const distance = Math.round(Math.hypot(rig.x - node.x, rig.z - node.z));
        const units = node.value === 1 ? "unit" : "units";
        prompt.textContent = `${headingLabel(rig.heading)} · salvage ${distance} m · ${node.value} ${units}`;
      } else {
        const nearest = LANDMARKS.map((landmark) => ({
          ...landmark,
          distance: Math.round(
            Math.hypot(rig.x - landmark.x, rig.z - landmark.z),
          ),
        })).sort((a, b) => a.distance - b.distance)[0];
        prompt.textContent = nearest
          ? `${headingLabel(rig.heading)} · ${nearest.name} ${nearest.distance} m · ${nearest.verb}`
          : "Drive toward anything that pulls you.";
      }
    }

    for (const landmark of LANDMARKS) {
      const item = landmarkList.querySelector<HTMLElement>(
        `[data-landmark-id="${landmark.id}"]`,
      );
      if (!item) continue;
      const distance = Math.round(
        Math.hypot(rig.x - landmark.x, rig.z - landmark.z),
      );
      const discovered = state.discoveries.some(
        (discovery) => discovery.id === landmark.id,
      );
      item.classList.toggle("is-discovered", discovered);
      const distanceElement = item.querySelector<HTMLElement>("em");
      if (distanceElement) {
        distanceElement.textContent = discovered ? "found" : `${distance} m`;
      }
    }

    // Workshop panel appears only where it can be used.
    workshopPanel.hidden = !workshop || state.mapOpen;
    if (workshop) {
      workshopSalvage.textContent = `${state.salvage} salvage`;
      for (const moduleId of MODULE_IDS) {
        const item = moduleList.querySelector<HTMLElement>(
          `[data-module-id="${moduleId}"]`,
        );
        if (!item) continue;
        const definition = MODULES[moduleId];
        const fitted = rig.modules.includes(moduleId);
        const affordable = state.salvage >= definition.cost;
        item.classList.toggle("is-fitted", fitted);
        item.classList.toggle("is-locked", !fitted && !affordable);
        const cost = item.querySelector<HTMLElement>("em");
        if (cost)
          cost.textContent = fitted ? "fitted" : String(definition.cost);
      }
    }

    if (state.lastDiagnostic && state.lastDiagnostic !== lastDiagnostic) {
      lastDiagnostic = state.lastDiagnostic;
      showToast(state.lastDiagnostic);
    }

    const metrics = performanceMonitor.snapshot(renderer.metrics());
    const heap =
      metrics.heapUsedMb === null ? "heap n/a" : `${metrics.heapUsedMb} MB`;
    saveStatus.textContent = `${statusMessage} · ${metrics.framesPerSecond || "--"} fps · ${metrics.drawCalls} calls · ${heap}`;

    if (state.mapOpen && now - lastMapUpdate > 260) {
      lastMapUpdate = now;
      fieldMap.draw(state);
      mapProgress.textContent = `${Math.round(surveyed * 100)}% surveyed · ${Math.round(profile.surveyRange)} m sight`;
    }
  };

  // ---------------------------------------------------------------------------
  // Observability contract
  // ---------------------------------------------------------------------------

  const snapshot = (): string =>
    JSON.stringify(
      {
        ...publicState(state, world),
        performance: performanceMonitor.snapshot(renderer.metrics()),
        fieldMapBuildMs: Number.isFinite(fieldMap.buildMs)
          ? Number(fieldMap.buildMs.toFixed(1))
          : 0,
        audioRunning: audio.running,
        baseSurveyRange: BASE_SURVEY_RANGE,
      },
      null,
      2,
    );

  const settleAndReport = (): string => {
    updateInterface(performance.now() + 1000);
    renderer.render(state);
    return snapshot();
  };

  window.render_game_to_text = snapshot;
  window.advanceTime = (milliseconds: number) => {
    advanceGame(state, world, milliseconds);
    return settleAndReport();
  };
  window.selectRig = (rigId: RigId) => {
    if (!RIG_IDS.includes(rigId)) {
      throw new Error(`Unknown rig id: ${String(rigId)}`);
    }
    selectActiveRig(state, rigId);
    return settleAndReport();
  };
  window.selectCamera = (cameraMode: CameraMode) => {
    if (!CAMERA_MODES.includes(cameraMode)) {
      throw new Error(`Unknown camera mode: ${String(cameraMode)}`);
    }
    selectCamera(state, cameraMode);
    cameraSelect.value = cameraMode;
    return settleAndReport();
  };
  window.getRigOrientationEvidence = (rigId = state.activeRigId) => {
    if (!RIG_IDS.includes(rigId)) {
      throw new Error(`Unknown rig id: ${String(rigId)}`);
    }
    renderer.render(state);
    return renderer.orientationEvidence(state, rigId);
  };
  window.getRigPerceptionEvidence = (rigId = state.activeRigId) => {
    if (!RIG_IDS.includes(rigId)) {
      throw new Error(`Unknown rig id: ${String(rigId)}`);
    }
    renderer.render(state);
    return renderer.perceptionEvidence(state, rigId);
  };
  window.performRigAction = () => {
    performPrimaryAction(state, world);
    return settleAndReport();
  };
  window.applyRigInput = (
    requestedInput: Partial<InputFrame>,
    milliseconds: number,
  ) => {
    const inputFrame: InputFrame = {
      accelerate: requestedInput.accelerate === true,
      brake: requestedInput.brake === true,
      steerLeft: requestedInput.steerLeft === true,
      steerRight: requestedInput.steerRight === true,
    };
    if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
      return snapshot();
    }
    let remaining = Math.min(milliseconds, 30_000) / 1000;
    while (remaining > 0) {
      const step = Math.min(FIXED_STEP_SECONDS, remaining);
      stepGame(state, world, inputFrame, step);
      remaining -= step;
    }
    return settleAndReport();
  };
  window.installRigModule = (moduleId: ModuleId) => {
    installModule(state, world, moduleId);
    return settleAndReport();
  };
  window.winchRecoverRig = () => {
    winchRecover(state, world);
    return settleAndReport();
  };
  window.toggleFieldMap = () => {
    toggleMap(state);
    mapOverlay.hidden = !state.mapOpen;
    if (state.mapOpen) fieldMap.draw(state);
    return settleAndReport();
  };
  window.placeRig = (x: number, z: number, heading?: number) => {
    if (!Number.isFinite(x) || !Number.isFinite(z)) {
      throw new Error("placeRig needs finite coordinates.");
    }
    if (heading !== undefined && !Number.isFinite(heading)) {
      throw new Error("placeRig heading must be finite when supplied.");
    }
    const rig = activeRig(state);
    rig.x = x;
    rig.z = z;
    if (heading !== undefined) rig.heading = heading;
    rig.speed = 0;
    settleWorld(state, world);
    // Telemetry (surface, grip, grade, water depth) is written by the traversal
    // model, so a teleport that skips the step leaves the HUD and the reported
    // snapshot describing the *previous* location. One idle step re-reads the
    // ground here, which keeps `render_game_to_text` honest for the acceptance
    // tool — this bit the first measurement of surface grip contrast.
    stepGame(state, world, IDLE_INPUT, FIXED_STEP_SECONDS);
    renderer.invalidate(state);
    return settleAndReport();
  };
  window.getPerformanceSnapshot = () =>
    performanceMonitor.snapshot(renderer.metrics());

  // ---------------------------------------------------------------------------
  // Loop
  // ---------------------------------------------------------------------------

  let accumulator = 0;
  let previousTime = performance.now();
  let saveAccumulator = 0;
  let active = true;
  const previousCondition = Object.fromEntries(
    RIG_IDS.map((rigId) => [rigId, state.rigs[rigId].condition]),
  ) as Record<RigId, number>;

  const persist = (): void => {
    const result = saveState(window.localStorage, state, world);
    performanceMonitor.recordSave(result.durationMs, result.bytes);
    statusMessage = "Local field record";
  };

  const frame = (now: number): void => {
    if (!active) return;

    const frameDurationMs = now - previousTime;
    const deltaSeconds = Math.min(frameDurationMs / 1000, 0.1);
    previousTime = now;
    accumulator += deltaSeconds;
    saveAccumulator += deltaSeconds;
    performanceMonitor.recordFrame(frameDurationMs);

    while (accumulator >= FIXED_STEP_SECONDS) {
      stepGame(state, world, input.sample(), FIXED_STEP_SECONDS);
      accumulator -= FIXED_STEP_SECONDS;
    }

    // Condition loss is the one signal that always earns a shake and a thud, so
    // damage is never silent.
    const rig = activeRig(state);
    const previousRigCondition = previousCondition[rig.id];
    if (rig.condition < previousRigCondition - 0.4) {
      const severity = Math.min(1, (previousRigCondition - rig.condition) / 10);
      renderer.addShake(0.35 + severity * 0.7);
      audio.impact(0.35 + severity * 0.65);
    }
    previousCondition[rig.id] = rig.condition;

    renderer.render(state);
    audio.update(
      rig,
      effectiveProfile(rig.id, rig.modules),
      state.phase,
      state.paused,
    );
    performanceMonitor.markControllable();
    updateInterface(now);

    if (saveAccumulator >= 2) {
      persist();
      saveAccumulator = 0;
    }
    requestAnimationFrame(frame);
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      persist();
    } else {
      // Reset the clock so a backgrounded tab does not return with a huge delta
      // and integrate a second of motion in one frame.
      previousTime = performance.now();
      accumulator = 0;
    }
  });

  const shutdown = (): void => {
    if (!active) return;
    active = false;
    persist();
    input.dispose();
    renderer.dispose();
    audio.dispose();
  };
  window.addEventListener("pagehide", shutdown, { once: true });
  window.addEventListener("beforeunload", shutdown, { once: true });

  renderer.invalidate(state);
  updateInterface(performance.now() + 1000);
  requestAnimationFrame(frame);
}

try {
  boot();
} catch (error) {
  const panel = document.querySelector<HTMLElement>("#error-panel");
  const message = document.querySelector<HTMLElement>("#error-message");
  if (panel && message) {
    panel.hidden = false;
    message.textContent =
      error instanceof Error ? error.message : "Unknown browser runtime error.";
  }
  console.error("Rigs Unbound failed to start.", error);
}
