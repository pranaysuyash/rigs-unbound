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
  worldMinuteOfDay,
} from "./game/contracts";
import {
  surveyRouteMinutesRemaining,
  surveyRouteTargets,
} from "./game/activities";
import { RigAudio } from "./game/audio";
import {
  decodeLearnedControlLessons,
  encodeLearnedControlLessons,
  resolveControlLesson,
  type ControlLessonId,
} from "./game/control-guidance";
import { SALVAGE_PICKUP_RADIUS } from "./game/exploration";
import { resolveFirstRung } from "./game/first-rung";
import { GameWorld } from "./game/gameworld";
import { InputController } from "./game/input";
import { FieldMap } from "./game/minimap";
import {
  PerformanceMonitor,
  type PerformanceSnapshot,
} from "./game/performance";
import {
  RuntimeProfileController,
  selectRuntimeProfile,
  type RuntimeProfileSelection,
  STANDARD_RUNTIME_PROFILE_BUDGET,
} from "./game/runtime-profile-policy";
import {
  appendRunRecordEntry,
  createRunRecordInitialContext,
  createRunRecord,
  snapshotRunRecord,
  verifyRunRecord,
  stableHashText,
} from "./game/run-record";
import { validateDeterministicReplay } from "./game/replay-validator";
import { GameRenderer } from "./game/renderer";
import type {
  CameraResolutionEvidence,
  RigOrientationEvidence,
  RigPerceptionEvidence,
  RuntimeAssetBridgeEvidence,
} from "./game/renderer";
import { runtimeBridgeSpecs } from "./game/runtime-assets";
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
  resolvePrimaryAction,
  RIG_SWITCH_RANGE,
  selectCamera,
  selectActiveRig,
  settleWorld,
  stepGame,
  switchActiveRig,
  toggleBladeMode,
  togglePause,
  toggleMap,
  winchRecover,
  workshopInReach,
} from "./game/state";
import {
  clearState,
  loadState,
  peekSavedSeed,
  saveState,
} from "./game/storage";
import { BIOMES, SURFACES, type SurfaceId } from "./game/world";
import type { Obstacle } from "./game/collision";
import { resolveTerrainTraversal } from "./game/terrain-traversal";
import { createRumorMapUI } from "./game/rumor-map-ui";
import { createHoodDashboardUI } from "./game/hood-dashboard-ui";
import { createNavigatorUI } from "./game/navigator-ui";

const navigationEntry = performance.getEntriesByType("navigation")[0] as
  PerformanceNavigationTiming | undefined;
const BOOT_STARTED_AT = navigationEntry?.startTime ?? 0;
const CONTROL_LESSON_STORAGE_KEY = "rigs-unbound.control-lessons.v1";

declare global {
  interface Window {
    render_game_to_text: () => string;
    getRunRecord: () => string;
    getRunRecordVerification: () => ReturnType<typeof verifyRunRecord>;
    getRunRecordReplayValidation: () => ReturnType<
      typeof validateDeterministicReplay
    >;
    advanceTime: (milliseconds: number) => string;
    selectRig: (rigId: RigId) => string;
    selectCamera: (cameraMode: CameraMode) => string;
    performRigAction: () => string;
    applyRigInput: (input: Partial<InputFrame>, milliseconds: number) => string;
    getPerformanceSnapshot: () => PerformanceSnapshot;
    getRigOrientationEvidence: (rigId?: RigId) => RigOrientationEvidence;
    getRigPerceptionEvidence: (rigId?: RigId) => RigPerceptionEvidence;
    getCameraResolutionEvidence: () => CameraResolutionEvidence;
    getRuntimeBridgeEvidenceList: () => RuntimeAssetBridgeEvidence[];
    getRuntimeBridgeEvidence: (assetId: string) => RuntimeAssetBridgeEvidence;
    /**
     * Acceptance-only fixture inventory. The query parameter guard keeps world
     * mutation and procedural internals out of the public player surface.
     */
    getCameraTreeFixtures: () => Obstacle[];
    fellObstacleForAcceptance: (obstacleId: string) => string;
    getTerrainFaceFixture: (rigId: RigId) => {
      x: number;
      z: number;
      heading: number;
      outwardX: number;
      outwardZ: number;
    };
    restoreActiveRigForAcceptance: () => string;
    placeTerrainRigForAcceptance: (
      x: number,
      z: number,
      heading: number,
      speed?: number,
    ) => string;
    setAcceptanceManualStepping: (enabled: boolean) => string;
    installRigModule: (moduleId: ModuleId) => string;
    winchRecoverRig: () => string;
    toggleBlade: () => string;
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
  const minutes = Math.floor(worldMinuteOfDay(state.worldTimeMinutes));
  const hour = Math.floor(minutes / 60);
  return `${String(hour).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function headingLabel(heading: number): string {
  const degrees = ((heading * 180) / Math.PI + 360) % 360;
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
  return labels[Math.round(degrees / 45) % labels.length] ?? "N";
}

/**
 * Coarse range to an unsurveyed signal.
 *
 * A metre-accurate readout for a place the player has never seen is knowledge the
 * machine has no way to have. Bands keep the rail useful for choosing a heading
 * without turning it into a range-finder onto unexplored ground.
 */
function distanceBand(metres: number): string {
  if (metres < 60) return "close";
  if (metres < 140) return "near";
  if (metres < 260) return "far";
  return "distant";
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
  const gameShell = requiredElement<HTMLElement>("#game-shell");
  const canvas = requiredElement<HTMLCanvasElement>("#game-canvas");
  const mapCanvas = requiredElement<HTMLCanvasElement>("#map-canvas");

  // The world must exist before the save is read, because loading pours the
  // record's spatial memory into it. So the seed has to be known *first* — building
  // a default world, restoring deformation and surveyed cells into it, then
  // replacing it for a different seed silently discarded every mark the player had
  // left on the ground.
  const bootState = createInitialState();
  const savedSeed = peekSavedSeed(window.localStorage);
  const world = new GameWorld(savedSeed ?? bootState.seed);
  const loadResult = loadState(window.localStorage, world);
  // Reassigned by the reset control, so this cannot be const.
  let state = loadResult.state;

  const surfaceParameters = new URLSearchParams(window.location.search);
  const acceptanceSurface = surfaceParameters.get("acceptance") === "field-02";
  const developerSurface =
    acceptanceSurface || surfaceParameters.get("surface") === "developer";
  const runtimeBridgeMode = developerSurface ? "developer" : "player";
  let statusMessage = loadResult.message;

  const createRenderer = (): GameRenderer =>
    new GameRenderer(canvas, world, runtimeBridgeSpecs(runtimeBridgeMode));
  let renderer = createRenderer();
  const rendererRecoveryState = {
    lost: false,
    restoring: false,
  };

  const setRecoveryState = (state: "healthy" | "lost" | "restoring"): void => {
    switch (state) {
      case "healthy":
        rendererRecoveryState.lost = false;
        rendererRecoveryState.restoring = false;
        break;
      case "lost":
        rendererRecoveryState.lost = true;
        rendererRecoveryState.restoring = false;
        break;
      case "restoring":
        rendererRecoveryState.lost = true;
        rendererRecoveryState.restoring = true;
        break;
    }
  };

  const disposeRenderer = (): void => {
    try {
      renderer.dispose();
    } catch (error) {
      console.error("Renderer dispose failed during recovery.", error);
      if (typeof recordCheckpoint === "function") {
        recordCheckpoint("rendererDisposeFailed", { error: String(error) });
      }
    }
  };

  const recreateRenderer = (): void => {
    if (!rendererRecoveryState.lost) return;
    try {
      renderer = createRenderer();
      renderer.invalidate(state);
      runtimeProfileSelection = selectRuntimeProfile(
        performanceMonitor.snapshot(renderer.metrics()),
      );
      statusMessage = `Graphics context restored. Recovered on ${runtimeBridgeMode} profile ${runtimeProfileSelection.profile}.`;
      saveStatus.textContent = statusMessage;
      recordCheckpoint("graphicsContextRestored", {
        profile: runtimeProfileSelection.profile,
      });
      setRecoveryState("healthy");
      previousTime = performance.now();
      accumulator = 0;
      saveAccumulator = 0;
      active = true;
      updateInterface(performance.now() + 10);
      requestAnimationFrame(frame);
    } catch (error) {
      disposeRenderer();
      const message = "Graphics context restore failed. Reload the page.";
      statusMessage = message;
      saveStatus.textContent = statusMessage;
      showToast(message);
      recordCheckpoint("graphicsContextRestoreFailed", {
        error: String(error),
      });
    }
  };

  const handleContextLost = (event: Event): void => {
    const contextEvent = event as WebGLContextEvent & { isLost?: boolean };
    event.preventDefault();
    if (rendererRecoveryState.lost) {
      return;
    }
    setRecoveryState("lost");
    disposeRenderer();
    active = false;
    statusMessage = "Graphics context lost. Waiting for restore.";
    saveStatus.textContent = statusMessage;
    showToast("Graphics context lost. Reconnect to continue.");
    recordCheckpoint("graphicsContextLost", {
      statusMessage: contextEvent.statusMessage ?? null,
      wasLost: contextEvent.isLost,
    });
  };
  const handleContextRestored = (): void => {
    if (!rendererRecoveryState.lost) return;
    setRecoveryState("restoring");
    recreateRenderer();
  };
  const graphicsContextState = (): string =>
    rendererRecoveryState.lost
      ? "lost"
      : rendererRecoveryState.restoring
        ? "restoring"
        : "healthy";
  const attachContextRecovery = (): void => {
    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);
  };
  const detachContextRecovery = (): void => {
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    canvas.removeEventListener("webglcontextrestored", handleContextRestored);
  };

  const fieldMap = new FieldMap(mapCanvas, world);
  const input = new InputController();
  const audio = new RigAudio();
  const performanceMonitor = new PerformanceMonitor(
    BOOT_STARTED_AT,
    loadResult.loadDurationMs,
  );
  let runtimeProfileSelection: RuntimeProfileSelection = selectRuntimeProfile(
    performanceMonitor.snapshot(renderer.metrics()),
  );
  const runtimeProfileController = new RuntimeProfileController();
  const runRecord = createRunRecord(
    state.seed,
    BOOT_STARTED_AT,
    createRunRecordInitialContext(state, world),
  );
  let acceptanceManualStepping = false;
  document.body.dataset.surface = developerSurface ? "developer" : "player";
  const markInputReady = (): void => performanceMonitor.markInputReady();
  const markActionReady = (): void => {
    const firstActionReadyMs = performanceMonitor.markActionReady();
    if (firstActionReadyMs !== null) {
      recordCheckpoint("actionReady", { firstActionReadyMs });
    }
  };

  const recordCommand = (
    name: string,
    payload: Record<string, unknown> = {},
  ): void => {
    appendRunRecordEntry(runRecord, "command", name, state.elapsedMs, {
      activeRigId: state.activeRigId,
      cameraMode: state.cameraMode,
      paused: state.paused,
      ...payload,
    });
  };

  const recordEvent = (
    name: string,
    payload: Record<string, unknown> = {},
  ): void => {
    appendRunRecordEntry(runRecord, "event", name, state.elapsedMs, payload);
  };

  appendRunRecordEntry(runRecord, "load", "loadState", state.elapsedMs, {
    status: loadResult.status,
    sourceKey: loadResult.sourceKey,
    sourceSchemaVersion: loadResult.sourceSchemaVersion,
    worldMemoryPresent: loadResult.worldMemoryPresent,
    recoveryReason: loadResult.recoveryReason,
    loadDurationMs: loadResult.loadDurationMs,
  });

  const recordCheckpoint = (
    name: string,
    payload: Record<string, unknown> = {},
  ): void => {
    const stateSnapshot = publicState(state, world);
    appendRunRecordEntry(runRecord, "checkpoint", name, state.elapsedMs, {
      activeRigId: state.activeRigId,
      cameraMode: state.cameraMode,
      paused: state.paused,
      tickHash: stableHashText(JSON.stringify(stateSnapshot)),
      performance: performanceMonitor.snapshot(renderer.metrics()),
      state: stateSnapshot,
      ...payload,
    });
  };

  const phaseLabel = requiredElement<HTMLElement>("#phase-label");
  const timeLabel = requiredElement<HTMLElement>("#time-label");
  const surfaceLabel = requiredElement<HTMLElement>("#surface-label");
  const biomeLabel = requiredElement<HTMLElement>("#biome-label");
  const surveyContract = requiredElement<HTMLElement>("#survey-contract");
  const surveyContractText = requiredElement<HTMLElement>(
    "#survey-contract-text",
  );
  const worldDesignation = requiredElement<HTMLElement>("#world-designation");
  const welcomeDesignation = requiredElement<HTMLElement>(
    "#welcome-designation",
  );
  const worldDesignationText = developerSurface
    ? `Field 02 · ${state.seed}`
    : `World ${state.seed}`;
  worldDesignation.textContent = worldDesignationText;
  welcomeDesignation.textContent = worldDesignationText;
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
  const firstRungObjective = requiredElement<HTMLElement>(
    "#first-rung-objective",
  );
  const firstRungObjectiveText = requiredElement<HTMLElement>(
    "#first-rung-objective-text",
  );
  const emergencyRecover =
    requiredElement<HTMLButtonElement>("#emergency-recover");
  let saveStatus!: HTMLElement;
  const runtimeDiagnostics = requiredElement<HTMLElement>(
    "#runtime-diagnostics",
  );
  const physicsLabLink =
    requiredElement<HTMLAnchorElement>("#physics-lab-link");
  const primaryActionLabel = requiredElement<HTMLElement>(
    "#primary-action-label",
  );
  const bladeActionLabel = requiredElement<HTMLElement>("#blade-action-label");
  const recoveryActionLabel = requiredElement<HTMLElement>(
    "#recovery-action-label",
  );
  const touchPrimaryAction = requiredElement<HTMLButtonElement>(
    "#touch-primary-action",
  );
  const touchBladeAction = requiredElement<HTMLButtonElement>(
    "#touch-blade-action",
  );
  const touchRecoveryAction = requiredElement<HTMLButtonElement>(
    "#touch-recovery-action",
  );
  const landmarkList = requiredElement<HTMLOListElement>("#landmark-list");
  const toast = requiredElement<HTMLElement>("#toast");
  const pauseOverlay = requiredElement<HTMLElement>("#pause-overlay");
  const welcomePanel = requiredElement<HTMLElement>("#welcome-panel");
  const bootstrapStatus = requiredElement<HTMLElement>("#bootstrap-status");
  const controlLesson = requiredElement<HTMLElement>("#control-lesson");
  const controlLessonTitle = requiredElement<HTMLElement>(
    "#control-lesson-title",
  );
  const controlLessonDescription = requiredElement<HTMLElement>(
    "#control-lesson-description",
  );
  const controlLessonKeyboard = requiredElement<HTMLElement>(
    "#control-lesson-keyboard",
  );
  const controlLessonTouch = requiredElement<HTMLElement>(
    "#control-lesson-touch",
  );
  const controlLessonDismiss = requiredElement<HTMLButtonElement>(
    "#control-lesson-dismiss",
  );
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
  saveStatus = requiredElement<HTMLElement>("#save-status");
  attachContextRecovery();
  const rumorMap = createRumorMapUI(document.body, () => {
    if (state.mapOpen) toggleMap(state);
  });
  const hoodDashboard = createHoodDashboardUI(document.body);
  const navigatorUI = createNavigatorUI(document.body);

  let worldEntered =
    window.sessionStorage.getItem("rigs-unbound.welcome-seen") === "true";

  input.setEnabled(worldEntered);
  welcomePanel.hidden = worldEntered;
  welcomePanel.setAttribute("aria-hidden", String(worldEntered));
  enterWorldButton.disabled = worldEntered;
  gameShell.setAttribute("aria-busy", "false");
  if (worldEntered) {
    bootstrapStatus.dataset.state = "ready";
    bootstrapStatus.textContent =
      "Field systems ready. Restored session controls are active.";
  } else {
    bootstrapStatus.dataset.state = "measuring";
    bootstrapStatus.textContent =
      "Measuring device performance… Choose Enter the field to begin.";
    requestAnimationFrame(() => enterWorldButton.focus());
  }

  saveStatus.textContent = statusMessage;
  runtimeDiagnostics.hidden = !developerSurface;
  physicsLabLink.hidden = !developerSurface;
  const learnedControlLessons = decodeLearnedControlLessons(
    window.localStorage.getItem(CONTROL_LESSON_STORAGE_KEY),
  );
  let visibleControlLessonId: ControlLessonId | null = null;
  const markControlLessonLearned = (
    lessonId: ControlLessonId,
    source: "performed" | "dismissed",
  ): void => {
    if (learnedControlLessons.has(lessonId)) return;
    learnedControlLessons.add(lessonId);
    window.localStorage.setItem(
      CONTROL_LESSON_STORAGE_KEY,
      encodeLearnedControlLessons(learnedControlLessons),
    );
    if (visibleControlLessonId === lessonId) {
      controlLesson.hidden = true;
      controlLesson.removeAttribute("data-lesson-id");
      visibleControlLessonId = null;
    }
    recordCheckpoint("controlLessonLearned", { lessonId, source });
  };

  for (const landmark of LANDMARKS) {
    const item = document.createElement("li");
    item.dataset.landmarkId = landmark.id;
    // Deliberately unnamed until surveyed: the rail is an instrument reading a
    // signal, not a gazetteer. `update` fills in the name once it is earned.
    item.innerHTML = `
      <span class="opportunity-rail__signal" aria-hidden="true"></span>
      <span>
        <strong>Unsurveyed</strong>
        <small>no bearing</small>
      </span>
      <em>--</em>
    `;
    landmarkList.append(item);
  }

  for (const moduleId of MODULE_IDS) {
    const definition = MODULES[moduleId];
    const item = document.createElement("li");
    item.innerHTML = `
      <button type="button" data-module-id="${moduleId}">
        <kbd aria-hidden="true">${MODULE_IDS.indexOf(moduleId) + 1}</kbd>
        <span class="module-copy">
        <strong>${definition.name}</strong>
        <small>${definition.promise}</small>
        </span>
        <span class="module-state">${definition.cost} salvage</span>
      </button>
    `;
    moduleList.append(item);
  }

  let toastTimer = 0;
  let firstRungCompletionUntil = 0;
  let firstRungCompletionMessage = "";
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

  const fitModule = (
    moduleId: ModuleId,
    source: "keyboard" | "workshop-panel" | "acceptance",
  ): void => {
    markActionReady();
    const before = resolveFirstRung(state, world.collectedNodes);
    recordCommand("installModule", { moduleId, source });
    installModule(state, world, moduleId);
    markControlLessonLearned("workshop", "performed");
    const after = resolveFirstRung(state, world.collectedNodes);
    const fittedNow = !before.complete && after.complete;
    if (state.lastDiagnostic?.includes("fitted")) audio.chirp(880);
    announce();
    if (fittedNow) {
      const definition = MODULES[moduleId];
      firstRungCompletionMessage =
        moduleId === "lug-tires"
          ? `${definition.name} fitted · test the new grip in the mud toward Long Furrow`
          : `${definition.name} fitted · ${definition.promise}`;
      firstRungCompletionUntil = performance.now() + 4200;
      showToast(firstRungCompletionMessage);
    }
    recordCheckpoint("installModule", {
      moduleId,
      source,
      firstRungBefore: before.stage,
      firstRungAfter: after.stage,
      firstRungCompleted: fittedNow,
    });
  };

  const enterWorld = (source: "welcome-panel" | "keyboard"): void => {
    if (worldEntered) return;
    markInputReady();
    performanceMonitor.beginControllableMeasurement();
    performanceMonitor.resetFrameWindow();
    runtimeProfileController.reset();
    recordCommand("enterWorld", { source });
    worldEntered = true;
    input.setEnabled(true);
    enterWorldButton.disabled = true;
    enterWorldButton.blur();
    welcomePanel.classList.add("welcome-panel--dismissed");
    welcomePanel.hidden = true;
    welcomePanel.setAttribute("aria-hidden", "true");
    window.sessionStorage.setItem("rigs-unbound.welcome-seen", "true");
    canvas.focus();
    void audio.unlock();
    showToast(
      "First cache: leave the Home Silo pad, then press Space or Act in reach.",
    );
    recordCheckpoint("enterWorld", { source });
  };

  const tap = (action: TapAction): void => {
    if (!worldEntered) return;
    markActionReady();
    markInputReady();
    void audio.unlock();
    const lessonIdByAction: Partial<Record<TapAction, ControlLessonId>> = {
      primary: "act",
      switchRig: "switch-rig",
      camera: "camera",
      map: "map",
      blade: "blade",
      recover: "recovery",
    };
    const learnedLessonId = lessonIdByAction[action];
    if (learnedLessonId) {
      markControlLessonLearned(learnedLessonId, "performed");
    }
    if (action === "primary") {
      const before = state.salvage;
      recordCommand("primaryAction", { source: "tap" });
      const event = performPrimaryAction(state, world);
      recordEvent("primaryActionOutcome", { source: "tap", event });
      if (state.salvage > before) audio.chirp(720);
      announce();
    } else if (action === "switchRig") {
      recordCommand("tap", { action });
      const event = switchActiveRig(state);
      recordEvent("rigSelectionOutcome", { source: "tap", event });
      announce();
    } else if (action === "camera") {
      recordCommand("tap", { action });
      cycleCamera(state);
      cameraSelect.value = state.cameraMode;
      showToast(`${CAMERA_LABELS[state.cameraMode]} view.`);
    } else if (action === "phase") {
      recordCommand("tap", { action });
      cyclePhase(state);
      showToast(
        `${state.phase === "day" ? "Daylight" : state.phase === "gloam" ? "Gloam" : "Night"} active.`,
      );
    } else if (action === "map") {
      recordCommand("tap", { action });
      toggleMap(state);
      mapOverlay.hidden = !state.mapOpen;
      if (state.mapOpen) {
        fieldMap.draw(state);
        rumorMap.open(state);
      } else {
        rumorMap.close();
      }
    } else if (action === "blade") {
      recordCommand("tap", { action });
      toggleBladeMode(state);
      announce();
    } else if (action === "recover") {
      recordCommand("tap", { action });
      winchRecover(state, world);
      announce();
    } else {
      recordCommand("tap", { action });
      togglePause(state);
      pauseOverlay.hidden = !state.paused;
    }
    recordCheckpoint("tap", { action });
  };

  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    if (!worldEntered) {
      if (
        event.code === "Space" ||
        event.code === "Enter" ||
        event.code === "NumpadEnter"
      ) {
        event.preventDefault();
        markInputReady();
        enterWorld("keyboard");
      }
      return;
    }
    markInputReady();
    const moduleIndex = Number.parseInt(event.key, 10);
    if (
      Number.isInteger(moduleIndex) &&
      moduleIndex >= 1 &&
      moduleIndex <= MODULE_IDS.length
    ) {
      void audio.unlock();
      fitModule(MODULE_IDS[moduleIndex - 1]!, "keyboard");
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
    } else if (event.code === "KeyB") {
      tap("blade");
    } else if (event.code === "KeyX") {
      tap("recover");
    } else if (event.code === "KeyT") {
      void audio.unlock();
      recordCommand("repairRig", { source: "keyboard" });
      repairRig(state);
      announce();
      recordCheckpoint("repairRig", { source: "keyboard" });
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
    const setHeld = (active: boolean): void => {
      if (active) {
        markActionReady();
      }
      input.hold(action, active);
    };
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
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "button[data-module-id]",
    );
    if (!button || button.disabled) return;
    markInputReady();
    markActionReady();
    void audio.unlock();
    fitModule(button.dataset.moduleId as ModuleId, "workshop-panel");
  });

  enterWorldButton.addEventListener("click", () => {
    markInputReady();
    enterWorld("welcome-panel");
  });
  controlLessonDismiss.addEventListener("click", () => {
    if (visibleControlLessonId) {
      markControlLessonLearned(visibleControlLessonId, "dismissed");
    }
    canvas.focus();
  });
  emergencyRecover.addEventListener("click", () => {
    markInputReady();
    tap("recover");
  });

  muteButton.addEventListener("click", () => {
    markInputReady();
    const next = !audio.isEnabled;
    audio.setEnabled(next);
    muteButton.textContent = next ? "Sound on" : "Sound off";
    muteButton.setAttribute("aria-pressed", next ? "false" : "true");
    if (next) void audio.unlock();
  });

  fullscreenButton.addEventListener("click", () => {
    markInputReady();
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

  mapClose.addEventListener("click", () => {
    markInputReady();
    tap("map");
  });

  cameraSelect.addEventListener("change", () => {
    markInputReady();
    const cameraMode = cameraSelect.value as CameraMode;
    if (!CAMERA_MODES.includes(cameraMode)) return;
    recordCommand("selectCamera", { cameraMode, source: "ui" });
    selectCamera(state, cameraMode);
    markControlLessonLearned("camera", "performed");
    showToast(`${CAMERA_LABELS[cameraMode]} view.`);
    canvas.focus();
    recordCheckpoint("selectCamera", { cameraMode, source: "ui" });
  });

  resetButton.addEventListener("click", () => {
    markInputReady();
    const confirmed = window.confirm(
      "Reset both rigs, the relay, and everything the world remembers?",
    );
    if (!confirmed) return;
    recordCommand("reset", {});
    clearState(window.localStorage);
    world.reset();
    state = createInitialState(state.seed);
    settleWorld(state, world);
    fieldMap.clear();
    renderer.invalidate(state);
    statusMessage = "Local field reset.";
    saveStatus.textContent = statusMessage;
    showToast("Field restored to its starting state.");
    recordCheckpoint("reset", {});
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
    const primaryAction = resolvePrimaryAction(state, world);

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
        ? // Blade direction is part of the current verb, not a hidden setting: the
          // player needs to know which way the soil is going before they commit a
          // pass they cannot easily undo.
          plough.mode === "fill"
          ? "Filling"
          : "Ploughing"
        : profile.capabilities.join(" · ");
    conditionValue.textContent = `${Math.round(rig.condition)}%`;
    emergencyRecover.hidden = rig.condition > 0;
    salvageValue.textContent = String(state.salvage);

    const surveyed = world.exploration.surveyedFraction(
      world.surveyedCells,
      190,
    );
    surveyValue.textContent = `${Math.round(surveyed * 100)}%`;
    cameraSelect.value = state.cameraMode;
    primaryActionLabel.textContent = primaryAction.label.toLowerCase();
    touchPrimaryAction.textContent = primaryAction.label;
    touchPrimaryAction.setAttribute("aria-label", primaryAction.ariaLabel);
    if (plough) {
      const bladeLabel = `blade: ${plough.mode}`;
      bladeActionLabel.textContent = bladeLabel;
      touchBladeAction.textContent = `Blade: ${plough.mode}`;
      touchBladeAction.setAttribute(
        "aria-label",
        `Switch blade from ${plough.mode} to ${plough.mode === "cut" ? "fill" : "cut"}`,
      );
    } else {
      bladeActionLabel.textContent = "no blade";
      touchBladeAction.textContent = "No blade";
      touchBladeAction.setAttribute(
        "aria-label",
        `Blade unavailable on ${profile.fieldName}`,
      );
    }
    const recoveryLabel =
      rig.condition <= 0
        ? "recover rig"
        : profile.capabilities.includes("winch")
          ? "winch"
          : "no winch";
    recoveryActionLabel.textContent = recoveryLabel;
    touchRecoveryAction.textContent =
      rig.condition <= 0
        ? "Recover"
        : profile.capabilities.includes("winch")
          ? "Winch"
          : "No winch";
    touchRecoveryAction.setAttribute(
      "aria-label",
      rig.condition <= 0
        ? "Emergency field recovery to Home Silo"
        : profile.capabilities.includes("winch")
          ? "Winch rig to a graded track"
          : `Recovery winch not fitted to ${profile.fieldName}`,
    );

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
    const firstRung = resolveFirstRung(state, world.collectedNodes);
    const anotherRigInRange = RIG_IDS.some((rigId) => {
      if (rigId === rig.id) return false;
      const parked = state.rigs[rigId];
      return Math.hypot(parked.x - rig.x, parked.z - rig.z) <= RIG_SWITCH_RANGE;
    });
    const nextControlLesson = resolveControlLesson(
      {
        hasDriven:
          rig.distanceTravelled > 1 ||
          RIG_IDS.some((rigId) => state.rigs[rigId].distanceTravelled > 1),
        primaryActionKind: primaryAction.kind,
        workshopRelevant:
          workshop !== undefined && firstRung.stage === "choose-part",
        bladeRelevant:
          (primaryAction.kind === "lower-plough" ||
            primaryAction.kind === "raise-plough") &&
          ["tilled", "mud", "sand"].includes(telemetry.surfaceId),
        cameraRelevant: rig.distanceTravelled > 12,
        mapRelevant: state.discoveries.some(
          (discovery) => discovery.id !== "home-silo",
        ),
        switchRigRelevant: firstRung.complete && anotherRigInRange,
        recoveryRelevant: rig.condition <= 0,
      },
      learnedControlLessons,
    );
    const controlLessonSuppressed =
      !worldEntered || state.paused || state.mapOpen;
    let controlLessonVisible = false;
    if (!nextControlLesson || controlLessonSuppressed) {
      controlLesson.hidden = true;
      controlLesson.removeAttribute("data-lesson-id");
      visibleControlLessonId = null;
    } else {
      controlLessonVisible = true;
      const changed = visibleControlLessonId !== nextControlLesson.id;
      visibleControlLessonId = nextControlLesson.id;
      controlLesson.dataset.lessonId = nextControlLesson.id;
      controlLessonTitle.textContent = nextControlLesson.title;
      controlLessonDescription.textContent = nextControlLesson.description;
      controlLessonKeyboard.textContent = nextControlLesson.keyboard;
      controlLessonTouch.textContent = nextControlLesson.touch;
      controlLesson.hidden = false;
      if (changed) {
        recordCheckpoint("controlLessonIntroduced", {
          lessonId: nextControlLesson.id,
          primaryActionKind: primaryAction.kind,
        });
      }
    }
    const showingFirstRungCompletion =
      firstRung.complete && now < firstRungCompletionUntil;
    firstRungObjective.hidden =
      state.mapOpen || (firstRung.complete && !showingFirstRungCompletion);
    firstRungObjective.classList.toggle(
      "is-complete",
      showingFirstRungCompletion,
    );
    firstRungObjective.dataset.stage = showingFirstRungCompletion
      ? "part-fitted"
      : firstRung.stage;
    firstRungObjectiveText.textContent = showingFirstRungCompletion
      ? firstRungCompletionMessage
      : firstRung.objective;
    firstRungObjective.setAttribute(
      "aria-label",
      showingFirstRungCompletion
        ? firstRungCompletionMessage
        : firstRung.ariaLabel,
    );
    if (state.paused) {
      prompt.textContent = "Paused.";
    } else if (rig.condition <= 0) {
      prompt.textContent =
        "Rig disabled · press X or Winch for emergency field recovery";
    } else if (primaryAction.kind === "collect-salvage") {
      const node = world.exploration.nearestNode(
        rig.x,
        rig.z,
        SALVAGE_PICKUP_RADIUS,
        world.collectedNodes,
      );
      const units = node?.value === 1 ? "unit" : "units";
      prompt.textContent = `Salvage in reach · press Space or Act · ${node?.value ?? 1} ${units}`;
    } else if (workshop) {
      prompt.textContent =
        firstRung.stage === "choose-part"
          ? `${firstRung.objective} · ${state.salvage} salvage ready`
          : firstRung.complete && rig.modules.includes("lug-tires")
            ? "Lug tyres fitted · grip upgraded · take the mud line toward Long Furrow"
            : `${workshop.name} workshop · fit modules, ${state.salvage} salvage in the bin`;
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
        prompt.textContent =
          distance <= 5
            ? `Salvage in reach · press Space or Act · ${node.value} ${units}`
            : `${headingLabel(rig.heading)} · salvage ${distance} m · ${node.value} ${units}`;
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

    hoodDashboard.update(state);
    navigatorUI.update(state);

    /*
     * The contract readout is only shown while a contract is running.
     *
     * It reports sightings and the closing light, because those are the two things
     * the player can act on: which signals are still owed, and how long the window
     * is. A contract that is not running has nothing to say and takes no space.
     */
    const contract = state.surveyRoute;
    surveyContract.hidden = contract.status !== "active";
    if (contract.status === "active") {
      const targets = surveyRouteTargets();
      const remaining = surveyRouteMinutesRemaining(
        contract,
        state.worldTimeMinutes,
      );
      const left = targets.length - contract.sighted.length;
      surveyContractText.textContent =
        left > 0
          ? `${left} signal${left === 1 ? "" : "s"} to sight · ${Math.round(remaining ?? 0)} min of light`
          : "Contract filed";
    }

    const visibleSignals = world.visibleSignals;
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
      const nameElement = item.querySelector<HTMLElement>("strong");
      const detailElement = item.querySelector<HTMLElement>("small");
      const distanceElement = item.querySelector<HTMLElement>("em");
      // Three states, and they are the three states the machine can actually be in:
      // a place it has been (remembered, named), a signal it can currently see
      // (a bearing and a rough range), and a signal terrain is hiding (nothing).
      const inSight = visibleSignals.has(landmark.id);
      item.classList.toggle("is-in-sight", !discovered && inSight);
      if (nameElement) {
        nameElement.textContent = discovered
          ? landmark.name
          : inSight
            ? "Unsurveyed"
            : "No signal";
      }
      if (detailElement) {
        detailElement.textContent = discovered
          ? landmark.verb
          : inSight
            ? `bearing ${headingLabel(
                Math.atan2(landmark.x - rig.x, landmark.z - rig.z),
              )}`
            : "out of sight";
      }
      if (distanceElement) {
        distanceElement.textContent = discovered
          ? "found"
          : inSight
            ? distanceBand(distance)
            : "--";
      }
    }

    /*
     * One owner for the major surfaces, so they can never stack.
     *
     * The map, a control lesson and the workshop each take a large share of the
     * screen, and each used to decide its own visibility from its own condition. On
     * first boot all three drew over each other and over the opportunity rail, so a
     * player's first frame was a stack of instrument panels with a strip of world
     * behind them. Priority runs by how much the player asked for it: an explicit
     * map request beats a lesson the game volunteered, which beats an ambient panel
     * that merely happens to be in range.
     *
     * "In range" is also not enough to earn the space. The workshop opens when there
     * is something to actually do there — a module that is affordable, compatible and
     * not already fitted, or the objective explicitly asking for a part. Otherwise a
     * new player's first sight of the game is five rows reading "Need N more".
     */
    const workshopActionable =
      workshop !== undefined &&
      (firstRung.stage === "choose-part" ||
        MODULE_IDS.some((moduleId) => {
          const definition = MODULES[moduleId];
          return (
            state.salvage >= definition.cost &&
            definition.fits.includes(rig.id) &&
            !rig.modules.includes(moduleId)
          );
        }));
    workshopPanel.hidden =
      !workshopActionable || state.mapOpen || controlLessonVisible;
    if (workshop && !workshopPanel.hidden) {
      workshopSalvage.textContent = `${state.salvage} salvage`;
      for (const moduleId of MODULE_IDS) {
        const button = moduleList.querySelector<HTMLButtonElement>(
          `button[data-module-id="${moduleId}"]`,
        );
        if (!button) continue;
        const definition = MODULES[moduleId];
        const fitted = rig.modules.includes(moduleId);
        const affordable = state.salvage >= definition.cost;
        const compatible = definition.fits.includes(rig.id);
        const recommended =
          !firstRung.complete &&
          firstRung.recommendedModuleId === moduleId &&
          firstRung.recommendedRigId === rig.id;
        button.disabled = fitted || !affordable || !compatible;
        button.classList.toggle("is-fitted", fitted);
        button.classList.toggle("is-locked", !fitted && !affordable);
        button.classList.toggle("is-unavailable", !compatible);
        button.classList.toggle("is-recommended", recommended);
        const stateLabel = button.querySelector<HTMLElement>(".module-state");
        const visibleState = fitted
          ? "Fitted"
          : !compatible
            ? "Unavailable"
            : recommended
              ? `Recommended · ${definition.cost} salvage`
              : affordable
                ? `Fit · ${definition.cost} salvage`
                : `Need ${definition.cost - state.salvage} more`;
        if (stateLabel) stateLabel.textContent = visibleState;
        button.setAttribute(
          "aria-label",
          fitted
            ? `${definition.name} is already fitted. ${definition.promise}`
            : !compatible
              ? `${definition.name} is unavailable for ${profile.fieldName}.`
              : `${recommended ? "Recommended. " : ""}Fit ${definition.name} for ${definition.cost} salvage. ${definition.promise}${affordable ? "" : ` Need ${definition.cost - state.salvage} more salvage.`}`,
        );
      }
    }

    if (state.lastDiagnostic && state.lastDiagnostic !== lastDiagnostic) {
      lastDiagnostic = state.lastDiagnostic;
      showToast(state.lastDiagnostic);
    }

    let metrics = performanceMonitor.snapshot(renderer.metrics());
    runtimeProfileSelection = runtimeProfileController.evaluate(metrics);
    if (
      metrics.visibility?.profile !== runtimeProfileSelection.profile &&
      renderer.setVisibilityProfile(runtimeProfileSelection.profile, state)
    ) {
      metrics = performanceMonitor.snapshot(renderer.metrics());
      const fallbackActive = runtimeProfileSelection.profile === "mobile-safe";
      statusMessage = fallbackActive
        ? "Performance safeguard active: reduced scenery detail."
        : "Performance safeguard cleared: standard scenery detail restored.";
      if (worldEntered) {
        showToast(statusMessage);
      } else if (
        bootstrapStatus.dataset.state === "measuring" &&
        metrics.frameSampleCount >=
          STANDARD_RUNTIME_PROFILE_BUDGET.minimumFrameSamples
      ) {
        // Transition from measuring to ready once the frame-sample collection
        // window is wide enough for a meaningful profile decision.
        bootstrapStatus.dataset.state = "ready";
        bootstrapStatus.textContent = fallbackActive
          ? "Field systems ready with reduced scenery detail."
          : "Field systems ready with standard scenery detail.";
      } else if (bootstrapStatus.dataset.state === "ready") {
        bootstrapStatus.textContent = fallbackActive
          ? "Field systems ready with reduced scenery detail."
          : "Field systems ready with standard scenery detail.";
      }
      recordCheckpoint(
        fallbackActive ? "runtimeProfileFallback" : "runtimeProfileRecovery",
        {
          profile: runtimeProfileSelection.profile,
          reasons: runtimeProfileSelection.reasons,
        },
      );
    }
    saveStatus.textContent = statusMessage;
    if (developerSurface) {
      const heap =
        metrics.heapUsedMb === null ? "heap n/a" : `${metrics.heapUsedMb} MB`;
      const bridgeStates = renderer.runtimeBridgeEvidenceList();
      const loadedBridges = bridgeStates.filter(
        (bridge) => bridge.status === "loaded",
      ).length;
      const bridgeSummary = `bridges:${loadedBridges}/${bridgeStates.length}`;
      const rendererMemorySummary = `geo:${metrics.geometries} tex:${metrics.textures}`;
      const visibility = metrics.visibility;
      const visibilitySummary = visibility
        ? `props:${visibility.submitted}/${visibility.candidates} n${visibility.near}/m${visibility.mid}/f${visibility.far} c${visibility.culled} cap${visibility.capacityLimited}`
        : "props:n/a";
      const profileSummary = `profile:${visibility?.profile ?? "n/a"} ${runtimeProfileSelection.state}${runtimeProfileSelection.reasons.length > 0 ? ` (${runtimeProfileSelection.reasons.join(",")})` : ""}`;
      runtimeDiagnostics.textContent = `${metrics.framesPerSecond || "--"} fps · ${metrics.drawCalls} calls · ${graphicsContextState()} · ${rendererMemorySummary} · ${heap} · ${bridgeSummary} · ${visibilitySummary} · ${profileSummary}`;
    }

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
        welcomeOpen: !worldEntered,
        graphicsContext: graphicsContextState(),
        runtimeProfileSelection,
        runtimeAssetBridges: renderer.runtimeBridgeEvidenceList(),
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
    recordCheckpoint("settle");
    return snapshot();
  };

  window.render_game_to_text = snapshot;
  window.getRunRecord = () => snapshotRunRecord(runRecord);
  window.getRunRecordVerification = () => verifyRunRecord(runRecord);
  window.getRunRecordReplayValidation = () =>
    validateDeterministicReplay(runRecord);
  window.advanceTime = (milliseconds: number) => {
    recordCommand("advanceTime", { milliseconds });
    advanceGame(state, world, milliseconds);
    return settleAndReport();
  };
  window.selectRig = (rigId: RigId) => {
    if (!RIG_IDS.includes(rigId)) {
      throw new Error(`Unknown rig id: ${String(rigId)}`);
    }
    recordCommand("selectRig", { rigId });
    const event = selectActiveRig(state, rigId);
    recordEvent("rigSelectionOutcome", { source: "window", event });
    return settleAndReport();
  };
  window.selectCamera = (cameraMode: CameraMode) => {
    if (!CAMERA_MODES.includes(cameraMode)) {
      throw new Error(`Unknown camera mode: ${String(cameraMode)}`);
    }
    recordCommand("selectCamera", { cameraMode, source: "window" });
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
  window.getCameraResolutionEvidence = () => renderer.cameraEvidence();
  window.getRuntimeBridgeEvidenceList = () =>
    renderer.runtimeBridgeEvidenceList();
  window.getRuntimeBridgeEvidence = (assetId: string) =>
    renderer.runtimeBridgeEvidenceFor(assetId);
  window.getCameraTreeFixtures = () => {
    if (!acceptanceSurface) {
      throw new Error(
        "Camera tree fixtures are available only on the field-02 acceptance surface.",
      );
    }
    const candidates = world.obstacles
      .near(0, 0, 190)
      .filter(
        (obstacle) =>
          obstacle.kind === "tree" &&
          !world.felledObstacles.has(obstacle.id) &&
          world.obstacles.near(obstacle.x, obstacle.z, 18).length === 1,
      )
      .sort((left, right) => left.id.localeCompare(right.id));
    return candidates.slice(0, 40);
  };
  window.fellObstacleForAcceptance = (obstacleId: string) => {
    if (!acceptanceSurface) {
      throw new Error(
        "Obstacle mutation is available only on the field-02 acceptance surface.",
      );
    }
    const candidate = window
      .getCameraTreeFixtures()
      .find((obstacle) => obstacle.id === obstacleId);
    if (!candidate) {
      throw new Error(`Unknown standing acceptance tree: ${obstacleId}`);
    }
    recordCommand("fellObstacleForAcceptance", { obstacleId });
    world.fell(obstacleId);
    renderer.invalidate(state);
    return settleAndReport();
  };
  window.getTerrainFaceFixture = (rigId: RigId) => {
    if (!acceptanceSurface) {
      throw new Error(
        "Terrain fixtures are available only on the field-02 acceptance surface.",
      );
    }
    if (!RIG_IDS.includes(rigId)) {
      throw new Error(`Unknown rig id: ${String(rigId)}`);
    }
    const profile = effectiveProfile(rigId, state.rigs[rigId].modules);
    for (let angleIndex = 0; angleIndex < 64; angleIndex += 1) {
      for (let radius = 188; radius <= 232; radius += 0.25) {
        const angle = (angleIndex / 64) * Math.PI * 2;
        const outwardX = Math.sin(angle);
        const outwardZ = Math.cos(angle);
        const x = outwardX * radius;
        const z = outwardZ * radius;
        if (
          world.obstacles.near(x, z, 6).length > 0 ||
          world.obstacles.near(x - outwardX * 2, z - outwardZ * 2, 5).length > 0
        ) {
          continue;
        }
        const stableApproach = resolveTerrainTraversal(
          world.terrain,
          profile,
          x,
          z,
          x + outwardX * 0.001,
          z + outwardZ * 0.001,
        );
        const result = resolveTerrainTraversal(
          world.terrain,
          profile,
          x,
          z,
          x + outwardX * 0.4,
          z + outwardZ * 0.4,
        );
        if (!stableApproach.blocked && result.blocked) {
          return {
            x,
            z,
            heading: angle,
            outwardX,
            outwardZ,
          };
        }
      }
    }
    throw new Error(
      `No deterministic terrain-face fixture found for ${rigId}.`,
    );
  };
  window.restoreActiveRigForAcceptance = () => {
    if (!acceptanceSurface) {
      throw new Error(
        "Rig restoration is available only on the field-02 acceptance surface.",
      );
    }
    const rig = activeRig(state);
    rig.condition = 100;
    rig.strain = 0;
    rig.speed = 0;
    rig.steering = 0;
    settleWorld(state, world);
    renderer.invalidate(state);
    recordCommand("restoreActiveRigForAcceptance", { rigId: rig.id });
    return settleAndReport();
  };
  window.placeTerrainRigForAcceptance = (
    x: number,
    z: number,
    heading: number,
    speed = 0,
  ) => {
    if (!acceptanceSurface) {
      throw new Error(
        "Terrain placement is available only on the field-02 acceptance surface.",
      );
    }
    if (
      !Number.isFinite(x) ||
      !Number.isFinite(z) ||
      !Number.isFinite(heading) ||
      !Number.isFinite(speed)
    ) {
      throw new Error("Terrain placement requires finite values.");
    }
    const rig = activeRig(state);
    const profile = effectiveProfile(rig.id, rig.modules);
    rig.x = x;
    rig.z = z;
    rig.heading = heading;
    rig.speed = Math.max(
      profile.reverseLimit,
      Math.min(profile.topSpeed, speed),
    );
    rig.steering = 0;
    settleWorld(state, world);
    renderer.invalidate(state);
    recordCommand("placeTerrainRigForAcceptance", {
      rigId: rig.id,
      x,
      z,
      heading,
      speed: rig.speed,
    });
    return settleAndReport();
  };
  window.setAcceptanceManualStepping = (enabled: boolean) => {
    if (!acceptanceSurface) {
      throw new Error(
        "Manual stepping is available only on the field-02 acceptance surface.",
      );
    }
    acceptanceManualStepping = enabled === true;
    recordCommand("setAcceptanceManualStepping", {
      enabled: acceptanceManualStepping,
    });
    return settleAndReport();
  };
  window.performRigAction = () => {
    markActionReady();
    recordCommand("primaryAction", { source: "acceptance" });
    const event = performPrimaryAction(state, world);
    recordEvent("primaryActionOutcome", { source: "acceptance", event });
    return settleAndReport();
  };
  window.applyRigInput = (
    requestedInput: Partial<InputFrame>,
    milliseconds: number,
  ) => {
    recordCommand("applyRigInput", {
      input: {
        accelerate: requestedInput.accelerate === true,
        brake: requestedInput.brake === true,
        steerLeft: requestedInput.steerLeft === true,
        steerRight: requestedInput.steerRight === true,
      },
      milliseconds,
    });
    const inputFrame: InputFrame = {
      accelerate: requestedInput.accelerate === true,
      brake: requestedInput.brake === true,
      steerLeft: requestedInput.steerLeft === true,
      steerRight: requestedInput.steerRight === true,
    };
    if (
      inputFrame.accelerate ||
      inputFrame.brake ||
      inputFrame.steerLeft ||
      inputFrame.steerRight
    ) {
      markActionReady();
    }
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
    fitModule(moduleId, "acceptance");
    return settleAndReport();
  };
  window.toggleBlade = () => {
    markActionReady();
    recordCommand("tap", { action: "blade", source: "acceptance" });
    toggleBladeMode(state);
    return settleAndReport();
  };
  window.winchRecoverRig = () => {
    markActionReady();
    recordCommand("tap", { action: "recover", source: "acceptance" });
    winchRecover(state, world);
    return settleAndReport();
  };
  window.toggleFieldMap = () => {
    markActionReady();
    recordCommand("tap", { action: "map", source: "acceptance" });
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
    recordCommand("placeRig", { x, z, heading });
    const rig = activeRig(state);
    rig.x = x;
    rig.z = z;
    if (heading !== undefined) rig.heading = heading;
    rig.speed = 0;
    rig.steering = 0;
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

  recordCheckpoint("boot");

  // ---------------------------------------------------------------------------
  // Loop
  // ---------------------------------------------------------------------------

  let accumulator = 0;
  let previousTime = performance.now();
  let saveAccumulator = 0;
  let active = true;
  let lastRecordedInput: InputFrame = { ...IDLE_INPUT };
  const previousCondition = Object.fromEntries(
    RIG_IDS.map((rigId) => [rigId, state.rigs[rigId].condition]),
  ) as Record<RigId, number>;

  const persist = (): void => {
    const result = saveState(window.localStorage, state, world);
    performanceMonitor.recordSave(result.durationMs, result.bytes);
    const saved = result.error === undefined;
    statusMessage = saved
      ? "Saved locally just now"
      : "Save failed · prior local save kept";
    if (!saved) {
      state.lastDiagnostic = statusMessage;
    }
    appendRunRecordEntry(runRecord, "save", "persist", state.elapsedMs, {
      bytes: result.bytes,
      durationMs: result.durationMs,
      error: result.error ?? null,
      saveKey: result.saveKey,
      schemaVersion: result.schemaVersion,
      saved,
      statusMessage,
    });
  };

  const frame = (now: number): void => {
    if (!active) return;

    const frameDurationMs = now - previousTime;
    const deltaSeconds = Math.min(frameDurationMs / 1000, 0.1);
    previousTime = now;
    if (worldEntered && !acceptanceManualStepping) {
      accumulator += deltaSeconds;
      saveAccumulator += deltaSeconds;
    } else {
      accumulator = 0;
    }
    if (worldEntered && document.visibilityState === "visible") {
      performanceMonitor.recordFrame(frameDurationMs);
    }

    while (
      worldEntered &&
      !acceptanceManualStepping &&
      accumulator >= FIXED_STEP_SECONDS
    ) {
      const sampledInput = input.sample();
      if (
        sampledInput.accelerate ||
        sampledInput.brake ||
        sampledInput.steerLeft ||
        sampledInput.steerRight
      ) {
        markActionReady();
        markControlLessonLearned("drive", "performed");
      }
      if (
        sampledInput.accelerate !== lastRecordedInput.accelerate ||
        sampledInput.brake !== lastRecordedInput.brake ||
        sampledInput.steerLeft !== lastRecordedInput.steerLeft ||
        sampledInput.steerRight !== lastRecordedInput.steerRight
      ) {
        appendRunRecordEntry(runRecord, "input", "sample", state.elapsedMs, {
          input: sampledInput,
        });
        lastRecordedInput = { ...sampledInput };
      }
      stepGame(state, world, sampledInput, FIXED_STEP_SECONDS);
      accumulator -= FIXED_STEP_SECONDS;
    }

    // Condition loss is the one signal that always earns a shake and a thud, so
    // damage is never silent.
    const rig = activeRig(state);
    const previousRigCondition = previousCondition[rig.id];
    if (rig.condition < previousRigCondition - 0.4) {
      const severity = Math.min(1, (previousRigCondition - rig.condition) / 10);
      renderer.addShake(0.35 + severity * 0.7);
      renderer.recordConditionImpact(rig.id);
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
    if (worldEntered) performanceMonitor.markControllable();
    updateInterface(now);

    if (worldEntered && saveAccumulator >= 2) {
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
      performanceMonitor.resetFrameWindow();
      runtimeProfileController.reset();
    }
  });

  const shutdown = (): void => {
    if (!active) return;
    active = false;
    persist();
    input.dispose();
    detachContextRecovery();
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
