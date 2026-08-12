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
  RIG_PROFILES,
  phaseForWorldTime,
  type ContinuousAction,
  type CameraMode,
  type GameState,
  type InputFrame,
  type ModuleId,
  type RigId,
  type TapAction,
  type WorldPhase,
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
import {
  resolveFirstRung,
  workshopActionable,
  workshopLessonRelevant,
} from "./game/first-rung";
import { GameWorld } from "./game/gameworld";
import { InputController } from "./game/input";
import { FieldMap } from "./game/minimap";
import {
  PerformanceMonitor,
  type PerformanceSnapshot,
} from "./game/performance";
import {
  RuntimeProfileController,
  formatRuntimeProfileOperatorSummary,
  formatRuntimeProfileStatus,
  selectRuntimeProfile,
  type RuntimeProfileSelection,
  STANDARD_RUNTIME_PROFILE_BUDGET,
} from "./game/runtime-profile-policy";
import type { VisibilityProfileId } from "./game/visibility";
import {
  appendRunRecordEntry,
  createRunRecordInitialContext,
  createRunRecord,
  snapshotRunRecord,
  verifyRunRecord,
  stableHashText,
} from "./game/run-record";
import { validateDeterministicReplay } from "./game/replay-validator";
import { GhostTrailRecorder } from "./game/ghost";
import { GameRenderer } from "./game/renderer";
import type {
  CameraResolutionEvidence,
  RigGroundContactEvidence,
  RigModuleVisualEvidence,
  RigOrientationEvidence,
  RigPerceptionEvidence,
  RuntimeAssetBridgeEvidence,
  RendererBackendPolicyConfig,
  RendererBackendRequest,
  RendererPolicy,
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
  performFleetRecovery,
  workshopInReach,
  repairServiceInReach,
  setTirePressure,
  cycleDifferentialMode,
  diagnoseRestoration,
  performRestorationService,
  performFirstStart,
  craftModule,
  installFromPartsBin,
  renameRig,
  completeOpeningNaming,
  acceptArrivalBargain,
  refuseArrivalBargain,
  chooseFarmWaterworks,
} from "./game/state";
import { CRAFTING_RECIPES, canCraftRecipe } from "./game/salvage-crafting";
import { deriveFleetRecoveryAssessment } from "./game/fleet-recovery-assessment";
import { fleetRecoveryProjection } from "./game/fleet-recovery-command";
import { deriveWeatherForecast, deriveWeatherState } from "./game/weather";
import { generateElevationContours } from "./game/topo-map";
import type { WeatherState } from "./game/weather";
import {
  clearState,
  loadState,
  peekSavedSeed,
  saveState,
} from "./game/storage";
import { BIOMES, SURFACES, WORLD_SITES, type SurfaceId } from "./game/world";
import {
  deriveMissions,
  type MissionClass,
  type MissionProposition,
} from "./game/mission-propositions";
import {
  acceptMission,
  MAX_ACTIVE_SIDE_MISSIONS,
} from "./game/mission-lifecycle";
import {
  deriveSettlementEcologyFieldNotes,
  deriveSettlementFieldNotes,
} from "./game/settlement-needs";
import { componentWearDeficit } from "./game/vehicle-maintenance";
import { computeChassisMassDistribution } from "./game/workshop-lab";
import type { Obstacle } from "./game/collision";
import { resolveTerrainTraversal } from "./game/terrain-traversal";
import { createRumorMapUI } from "./game/rumor-map-ui";
import { createHoodDashboardUI } from "./game/hood-dashboard-ui";
import { createNavigatorUI } from "./game/navigator-ui";
import { deriveRigToolProjections } from "./game/rig-tool-projection";

const navigationEntry = performance.getEntriesByType("navigation")[0] as
  PerformanceNavigationTiming | undefined;
const BOOT_STARTED_AT = navigationEntry?.startTime ?? 0;
const CONTROL_LESSON_STORAGE_KEY = "rigs-unbound.control-lessons.v1";
const themeColorMeta = document.querySelector<HTMLMetaElement>(
  'meta[name="theme-color"]',
);
let shellPointerFrame = 0;
let shellPointerX = 50;
let shellPointerY = 38;

declare global {
  interface Window {
    render_game_to_text: () => string;
    getRunRecord: () => string;
    getRunRecordVerification: () => ReturnType<typeof verifyRunRecord>;
    getRunRecordReplayValidation: () => ReturnType<
      typeof validateDeterministicReplay
    >;
    getGhostTrail: () => string;
    advanceTime: (milliseconds: number) => string;
    selectRig: (rigId: RigId) => string;
    selectCamera: (cameraMode: CameraMode) => string;
    performRigAction: () => string;
    applyRigInput: (input: Partial<InputFrame>, milliseconds: number) => string;
    getPerformanceSnapshot: () => PerformanceSnapshot;
    getRigOrientationEvidence: (rigId?: RigId) => RigOrientationEvidence;
    getRigPerceptionEvidence: (rigId?: RigId) => RigPerceptionEvidence;
    /**
     * Measure whether the rendered rig is touching the rendered ground.
     *
     * A presentation-only surface, but the only one that can catch a rig mounted
     * in the wrong vertical frame: everything else compares authored numbers
     * with authored numbers and agrees with itself.
     */
    getRigGroundContactEvidence: (rigId?: RigId) => RigGroundContactEvidence;
    /**
     * Measure the rendered volume of every module visual against the terrain and
     * against the rig's own hand-authored superstructure.
     *
     * The blockout's unit tests cannot reach either: they compare the derived
     * mount boxes with the table those boxes come from, while the cab, roof, and
     * plough are position literals in the renderer.
     */
    getRigModuleVisualEvidence: (rigId?: RigId) => RigModuleVisualEvidence;
    getCameraResolutionEvidence: () => CameraResolutionEvidence;
    getWeatherSceneEvidence: () => {
      easedRain: number;
      fogDensity: number;
      phaseBaseFogDensity: number;
      rainVisible: boolean;
      rainOpacity: number;
    };
    getRuntimeBridgeEvidenceList: () => RuntimeAssetBridgeEvidence[];
    getRuntimeBridgeEvidence: (assetId: string) => RuntimeAssetBridgeEvidence;
    /** Acceptance-only visibility preview hook for controlled profile evidence. */
    __forceProfile: (profileId: VisibilityProfileId) => string;
    /** Acceptance-only no-render fallback hook for controlled degraded-mode evidence. */
    __showNoRenderFallback: (reason?: string) => string;
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
    /** Acceptance-only: disable a rig so the recovery chain can be exercised. */
    strandRigForAcceptance: (rigId: string, x?: number, z?: number) => string;
    /** ADR-0035 comfort preference: pause the world while the Pegboard is open. */
    setPegboardPausesWorld: (pauses: boolean) => boolean;
    placeTerrainRigForAcceptance: (
      x: number,
      z: number,
      heading: number,
      speed?: number,
    ) => string;
    setAcceptanceManualStepping: (enabled: boolean) => string;
    installRigModule: (moduleId: ModuleId) => string;
    /**
     * Top up the salvage bin so a geometry check can fit a module.
     *
     * Deliberately *only* the wallet. `installRigModule` still runs the real
     * install — workshop proximity, rig compatibility, already-fitted, then the
     * cost — so an acceptance script that fits a module is still exercising the
     * path a player takes. Without this, `state.salvage` starts at 0 and every
     * install silently refuses, which is how `capture-reclamation-walkthrough`
     * came to screenshot an unmodified tractor and label it "lug-tires fitted".
     */
    grantSalvageForAcceptance: (amount: number) => string;
    winchRecoverRig: () => string;
    /** Issue a fleet recovery. Returns the transition reason, then the report. */
    recoverStrandedRig: () => { accepted: boolean; reason: string };
    toggleBlade: () => string;
    toggleFieldMap: () => string;
    toggleWorkshop: () => string;
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

interface PresentationMood {
  themeColor: string;
  glowTop: string;
  glowLeft: string;
  glowRight: string;
  backdropStrong: string;
  backdropSoft: string;
  panelFill: string;
  panelFillStrong: string;
  border: string;
  shadow: string;
  rainOpacity: string;
  rainSpeed: string;
  motionEnergy: string;
}

interface RigPresentationTone {
  accent: string;
  accentSoft: string;
  accentStrong: string;
}

function selectRigPresentationTone(rigId: RigId): RigPresentationTone {
  switch (rigId) {
    case "toy-buggy":
      return {
        accent: "#d9aa52",
        accentSoft: "rgba(217, 170, 82, 0.18)",
        accentStrong: "rgba(217, 170, 82, 0.3)",
      };
    case "marsh-skimmer":
      return {
        accent: "#6bc9c4",
        accentSoft: "rgba(107, 201, 196, 0.2)",
        accentStrong: "rgba(107, 201, 196, 0.32)",
      };
    default:
      return {
        accent: "#b94f32",
        accentSoft: "rgba(185, 79, 50, 0.18)",
        accentStrong: "rgba(185, 79, 50, 0.28)",
      };
  }
}

interface CameraPresentationTone {
  depth: string;
  energy: string;
  tilt: string;
}

interface DrivePresentationTone {
  band: "idle" | "rolling" | "cruising" | "fast" | "flat-out";
  label: string;
  energy: string;
}

function selectCameraPresentationTone(
  cameraMode: CameraMode,
): CameraPresentationTone {
  switch (cameraMode) {
    case "hood":
      return { depth: "0.96", energy: "0.05", tilt: "0.08deg" };
    case "side":
      return { depth: "0.94", energy: "0.08", tilt: "-0.06deg" };
    case "tactical":
      return { depth: "0.9", energy: "0.14", tilt: "0.16deg" };
    case "top-down":
      return { depth: "0.88", energy: "0.18", tilt: "0.24deg" };
    case "survey":
      return { depth: "0.9", energy: "0.16", tilt: "0.12deg" };
    case "chase":
    default:
      return { depth: "1", energy: "0.09", tilt: "0.04deg" };
  }
}

function selectDrivePresentationTone(speedKmh: number): DrivePresentationTone {
  const speed = Math.max(0, speedKmh);
  if (speed < 1) {
    return { band: "idle", label: "Idle", energy: "0" };
  }
  if (speed < 8) {
    return { band: "rolling", label: "Rolling", energy: "0.18" };
  }
  if (speed < 22) {
    return { band: "cruising", label: "Cruising", energy: "0.42" };
  }
  if (speed < 40) {
    return { band: "fast", label: "Fast", energy: "0.72" };
  }
  return { band: "flat-out", label: "Flat out", energy: "1" };
}

function selectPresentationMood(
  worldPhase: WorldPhase,
  weather: WeatherState,
  profile: VisibilityProfileId,
  motionEnergy: number,
): PresentationMood {
  const mobileSafe = profile === "mobile-safe";
  const motionLevel = Math.max(0, Math.min(1, motionEnergy));

  const themeColor =
    weather.phase === "storm"
      ? "#111927"
      : weather.phase === "rain"
        ? "#14232a"
        : worldPhase === "night"
          ? "#0e1419"
          : worldPhase === "gloam"
            ? "#121b16"
            : "#18211c";

  const panelFill =
    weather.phase === "storm"
      ? "rgba(13, 20, 28, 0.92)"
      : weather.phase === "rain"
        ? "rgba(16, 25, 30, 0.9)"
        : worldPhase === "night"
          ? "rgba(15, 22, 23, 0.9)"
          : "rgba(18, 26, 22, 0.9)";

  const panelFillStrong =
    weather.phase === "storm"
      ? "rgba(11, 17, 24, 0.95)"
      : weather.phase === "rain"
        ? "rgba(14, 23, 28, 0.94)"
        : worldPhase === "night"
          ? "rgba(16, 23, 24, 0.94)"
          : "rgba(245, 235, 214, 0.96)";

  const border =
    weather.phase === "storm"
      ? "rgba(107, 201, 196, 0.2)"
      : weather.phase === "rain"
        ? "rgba(107, 201, 196, 0.18)"
        : worldPhase === "night"
          ? "rgba(234, 216, 184, 0.15)"
          : "rgba(234, 216, 184, 0.14)";

  const shadow =
    weather.phase === "storm"
      ? "0 1.4rem 3.2rem rgba(0, 0, 0, 0.4)"
      : motionLevel > 0.55
        ? "0 1.25rem 3.1rem rgba(0, 0, 0, 0.34)"
        : "0 1.2rem 3rem rgba(0, 0, 0, 0.3)";
  const rainOpacity =
    weather.phase === "storm"
      ? "0.12"
      : weather.phase === "rain"
        ? "0.06"
        : "0";
  const rainSpeed =
    weather.phase === "storm" ? "11s" : weather.phase === "rain" ? "18s" : "0s";

  return {
    themeColor,
    glowTop:
      weather.phase === "storm"
        ? "rgba(70, 200, 210, 0.16)"
        : weather.phase === "rain"
          ? "rgba(107, 201, 196, 0.14)"
          : worldPhase === "night"
            ? "rgba(80, 120, 170, 0.1)"
            : "rgba(107, 201, 196, 0.14)",
    glowLeft:
      weather.phase === "storm"
        ? "rgba(185, 79, 50, 0.16)"
        : weather.phase === "rain"
          ? "rgba(80, 145, 170, 0.14)"
          : worldPhase === "night"
            ? "rgba(185, 79, 50, 0.12)"
            : "rgba(185, 79, 50, 0.16)",
    glowRight:
      weather.phase === "storm"
        ? "rgba(245, 158, 11, 0.1)"
        : weather.phase === "rain"
          ? "rgba(107, 201, 196, 0.08)"
          : worldPhase === "night"
            ? "rgba(217, 170, 82, 0.06)"
            : "rgba(217, 170, 82, 0.08)",
    backdropStrong:
      weather.phase === "storm"
        ? "rgba(7, 11, 15, 0.86)"
        : weather.phase === "rain"
          ? "rgba(10, 16, 20, 0.84)"
          : worldPhase === "night"
            ? "rgba(8, 12, 15, 0.82)"
            : "rgba(10, 15, 12, 0.84)",
    backdropSoft:
      weather.phase === "storm"
        ? "rgba(7, 11, 15, 0.62)"
        : weather.phase === "rain"
          ? "rgba(10, 16, 20, 0.58)"
          : worldPhase === "night"
            ? "rgba(8, 12, 15, 0.56)"
            : "rgba(10, 15, 12, 0.58)",
    panelFill,
    panelFillStrong: mobileSafe ? "rgba(18, 26, 22, 0.96)" : panelFillStrong,
    border,
    shadow,
    rainOpacity,
    rainSpeed,
    motionEnergy: motionLevel.toFixed(3),
  };
}

let lastPresentationMood = "";
let lastPresentationPulse = "";
let presentationPulseFrame = 0;
let presentationPulseTimer = 0;

function commitShellPointerStyle(): void {
  const root = document.documentElement;
  root.style.setProperty("--shell-pointer-x", `${shellPointerX.toFixed(2)}%`);
  root.style.setProperty("--shell-pointer-y", `${shellPointerY.toFixed(2)}%`);
  root.style.setProperty("--shell-pointer-glow", "0.055");
}

function syncShellPointerPosition(clientX: number, clientY: number): void {
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return;
  const viewportWidth = window.innerWidth || 1;
  const viewportHeight = window.innerHeight || 1;
  shellPointerX = Math.max(0, Math.min(100, (clientX / viewportWidth) * 100));
  shellPointerY = Math.max(0, Math.min(100, (clientY / viewportHeight) * 100));
  if (shellPointerFrame) return;
  shellPointerFrame = window.requestAnimationFrame(() => {
    shellPointerFrame = 0;
    commitShellPointerStyle();
  });
}

function centerShellPointer(): void {
  shellPointerX = 50;
  shellPointerY = 38;
  if (shellPointerFrame) return;
  shellPointerFrame = window.requestAnimationFrame(() => {
    shellPointerFrame = 0;
    commitShellPointerStyle();
  });
}

function syncPresentationMood(
  worldPhase: WorldPhase,
  weather: WeatherState,
  profile: VisibilityProfileId,
  motionEnergy: number,
  rigId: RigId,
  cameraMode: CameraMode,
  speedKmh: number,
): void {
  const mood = selectPresentationMood(
    worldPhase,
    weather,
    profile,
    motionEnergy,
  );
  const tone = selectRigPresentationTone(rigId);
  const cameraTone = selectCameraPresentationTone(cameraMode);
  const driveTone = selectDrivePresentationTone(speedKmh);
  const signature = [
    worldPhase,
    weather.phase,
    profile,
    rigId,
    cameraMode,
    driveTone.band,
    mood.themeColor,
    mood.glowTop,
    mood.glowLeft,
    mood.glowRight,
    mood.backdropStrong,
    mood.backdropSoft,
    mood.panelFill,
    mood.panelFillStrong,
    mood.border,
    mood.shadow,
    mood.rainOpacity,
    mood.rainSpeed,
    mood.motionEnergy,
    tone.accent,
    tone.accentSoft,
    tone.accentStrong,
    cameraTone.depth,
    cameraTone.energy,
    cameraTone.tilt,
    driveTone.energy,
  ].join("|");
  if (signature === lastPresentationMood) return;
  lastPresentationMood = signature;
  const pulseSignature = [
    worldPhase,
    weather.phase,
    profile,
    rigId,
    cameraMode,
    driveTone.band,
    tone.accent,
    tone.accentSoft,
    tone.accentStrong,
    cameraTone.depth,
    cameraTone.energy,
    cameraTone.tilt,
  ].join("|");

  const root = document.documentElement;
  root.dataset.worldPhase = worldPhase;
  root.dataset.weatherPhase = weather.phase;
  root.dataset.qualityProfile = profile;
  root.dataset.cameraMode = cameraMode;
  root.dataset.driveBand = driveTone.band;
  root.style.setProperty("--shell-theme-color", mood.themeColor);
  root.style.setProperty("--shell-glow-top", mood.glowTop);
  root.style.setProperty("--shell-glow-left", mood.glowLeft);
  root.style.setProperty("--shell-glow-right", mood.glowRight);
  root.style.setProperty("--shell-backdrop-strong", mood.backdropStrong);
  root.style.setProperty("--shell-backdrop-soft", mood.backdropSoft);
  root.style.setProperty("--shell-panel-fill", mood.panelFill);
  root.style.setProperty("--shell-panel-fill-strong", mood.panelFillStrong);
  root.style.setProperty("--shell-border", mood.border);
  root.style.setProperty("--shell-shadow", mood.shadow);
  root.style.setProperty("--shell-rain-opacity", mood.rainOpacity);
  root.style.setProperty("--shell-rain-speed", mood.rainSpeed);
  root.style.setProperty("--shell-motion-energy", mood.motionEnergy);
  root.style.setProperty("--shell-rig-accent", tone.accent);
  root.style.setProperty("--shell-rig-accent-soft", tone.accentSoft);
  root.style.setProperty("--shell-rig-accent-strong", tone.accentStrong);
  root.style.setProperty("--shell-camera-depth", cameraTone.depth);
  root.style.setProperty("--shell-camera-energy", cameraTone.energy);
  root.style.setProperty("--shell-camera-tilt", cameraTone.tilt);
  root.style.setProperty("--shell-drive-energy", driveTone.energy);
  themeColorMeta?.setAttribute("content", mood.themeColor);

  if (pulseSignature !== lastPresentationPulse) {
    lastPresentationPulse = pulseSignature;
    if (presentationPulseFrame) {
      window.cancelAnimationFrame(presentationPulseFrame);
      presentationPulseFrame = 0;
    }
    if (presentationPulseTimer) {
      window.clearTimeout(presentationPulseTimer);
      presentationPulseTimer = 0;
    }
    root.removeAttribute("data-presentation-pulse");
    presentationPulseFrame = window.requestAnimationFrame(() => {
      presentationPulseFrame = 0;
      root.setAttribute("data-presentation-pulse", pulseSignature);
      presentationPulseTimer = window.setTimeout(() => {
        if (root.getAttribute("data-presentation-pulse") === pulseSignature) {
          root.removeAttribute("data-presentation-pulse");
        }
        presentationPulseTimer = 0;
      }, 240);
    });
  }
}

commitShellPointerStyle();
window.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
  syncShellPointerPosition(event.clientX, event.clientY);
});
window.addEventListener("pointerleave", centerShellPointer);
window.addEventListener("blur", centerShellPointer);

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

let rendererFallbackKeyboardAttached = false;

function handleRendererFallbackKeydown(event: KeyboardEvent): void {
  const panel = document.querySelector<HTMLElement>("#error-panel");
  const retry = panel?.querySelector<HTMLButtonElement>("button");
  if (!panel || panel.hidden || !retry) return;

  if (event.key === "Escape") {
    event.preventDefault();
    retry.click();
    return;
  }

  if (event.key === "Tab") {
    event.preventDefault();
    retry.focus();
  }
}

function presentRendererFallback(reason: string): void {
  const panel = document.querySelector<HTMLElement>("#error-panel");
  const message = document.querySelector<HTMLElement>("#error-message");
  const shell = document.querySelector<HTMLElement>("#game-shell");
  const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
  const retry = panel?.querySelector<HTMLButtonElement>("button");

  if (shell) {
    shell.dataset.rendererState = "fallback";
    shell.setAttribute("aria-busy", "false");
  }

  document.documentElement.style.overflow = "hidden";
  if (document.body) {
    document.body.style.overflow = "hidden";
  }

  if (canvas) {
    canvas.hidden = true;
  }

  if (panel) {
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
  }

  if (message) {
    message.textContent = reason;
  }

  if (panel && !rendererFallbackKeyboardAttached) {
    panel.addEventListener("keydown", handleRendererFallbackKeydown);
    rendererFallbackKeyboardAttached = true;
  }

  retry?.focus();
}

type RendererPolicyGateReason = string;

function parseRendererRequest(raw: string | null): RendererBackendRequest {
  return raw === "webgl" || raw === "webgpu" || raw === "auto" ? raw : "auto";
}

function parseRendererPolicy(raw: string | null): RendererPolicy {
  return raw === "canary" || raw === "off" || raw === "stable" ? raw : "stable";
}

function isIosClassBrowser(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  const looksLikeIos = /iphone|ipad|ipod/.test(ua);
  const looksLikeMacIOS = /macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return looksLikeIos || looksLikeMacIOS;
}

function resolveRendererPolicy({
  request,
  policy,
}: {
  request: RendererBackendRequest;
  policy: RendererPolicy;
}): {
  policyAllowsAutoWebGPU: boolean;
  reason: RendererPolicyGateReason;
} {
  if (request !== "auto") {
    return {
      policyAllowsAutoWebGPU: true,
      reason: "non-auto request bypasses policy gate",
    };
  }

  if (policy === "canary") {
    return {
      policyAllowsAutoWebGPU: true,
      reason: "rendererPolicy=canary",
    };
  }

  if (policy === "off") {
    return {
      policyAllowsAutoWebGPU: false,
      reason: "rendererPolicy=off",
    };
  }

  const reasons: string[] = [];

  if (typeof navigator === "undefined" || !navigator.gpu) {
    reasons.push("no navigator.gpu");
  }
  if (!window.isSecureContext && window.location.protocol !== "file:") {
    reasons.push("requires secure context");
  }

  const { deviceMemory } = navigator as Navigator & { deviceMemory?: number };
  if (typeof deviceMemory === "number" && deviceMemory <= 4) {
    reasons.push(`deviceMemory=${deviceMemory}`);
  }
  if (
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency < 4
  ) {
    reasons.push(`hardwareConcurrency=${navigator.hardwareConcurrency}`);
  }
  if (isIosClassBrowser()) {
    reasons.push("iOS-class platform");
  }

  return {
    policyAllowsAutoWebGPU: reasons.length === 0,
    reason:
      reasons.length === 0
        ? "rendererPolicy=stable passed"
        : `rendererPolicy=stable blocked: ${reasons.join("; ")}`,
  };
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
  const requestedRendererBackend = parseRendererRequest(
    surfaceParameters.get("renderer"),
  );
  const requestedRendererPolicy = parseRendererPolicy(
    surfaceParameters.get("rendererPolicy"),
  );
  const rendererBackendPolicy = resolveRendererPolicy({
    request: requestedRendererBackend,
    policy: requestedRendererPolicy,
  });
  const rendererBackendConfig: RendererBackendPolicyConfig = {
    request: requestedRendererBackend,
    policy: requestedRendererPolicy,
    policyAllowsAutoWebGPU: rendererBackendPolicy.policyAllowsAutoWebGPU,
    policyReason: rendererBackendPolicy.reason,
  };
  let statusMessage = loadResult.message;

  const createRenderer = (): GameRenderer =>
    new GameRenderer(
      canvas,
      world,
      runtimeBridgeSpecs(runtimeBridgeMode),
      rendererBackendConfig,
    );
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
      emitRendererBackendPolicyCheckpoint();
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
      const message = "The 3D scene could not recover. Reload the page.";
      statusMessage = message;
      saveStatus.textContent = statusMessage;
      showToast(message);
      enterNoRenderFallback(message);
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
  let developerProfilePreview: VisibilityProfileId | null = null;
  let bootstrapFrameCount = 0;
  const bootstrapFrameSampleTarget =
    STANDARD_RUNTIME_PROFILE_BUDGET.minimumFrameSamples;
  function enterNoRenderFallback(reason: string): void {
    active = false;
    try {
      renderer.dispose();
    } catch (error) {
      console.error(
        "Renderer dispose failed during no-render fallback.",
        error,
      );
      if (typeof recordCheckpoint === "function") {
        recordCheckpoint("rendererDisposeFailed", { error: String(error) });
      }
    }
    presentRendererFallback(reason);
  }
  const syncBootstrapStatus = (
    _metrics: PerformanceSnapshot,
    selection: RuntimeProfileSelection,
  ): void => {
    const measuring =
      !worldEntered && bootstrapFrameCount < bootstrapFrameSampleTarget;
    gameShell.setAttribute("aria-busy", String(measuring));
    if (measuring) {
      const sampleCount = Math.min(
        bootstrapFrameCount,
        bootstrapFrameSampleTarget,
      );
      bootstrapStatus.dataset.state = "measuring";
      bootstrapStatus.setAttribute("role", "progressbar");
      bootstrapStatus.setAttribute("aria-valuemin", "0");
      bootstrapStatus.setAttribute(
        "aria-valuemax",
        String(bootstrapFrameSampleTarget),
      );
      bootstrapStatus.setAttribute("aria-valuenow", String(sampleCount));
      bootstrapStatus.setAttribute(
        "aria-valuetext",
        `${sampleCount} of ${bootstrapFrameSampleTarget} frame samples collected.`,
      );
      bootstrapStatus.textContent = `Measuring device performance… ${sampleCount}/${bootstrapFrameSampleTarget} frame samples collected.`;
      return;
    }

    bootstrapStatus.dataset.state = "ready";
    bootstrapStatus.setAttribute("role", "status");
    bootstrapStatus.removeAttribute("aria-valuemin");
    bootstrapStatus.removeAttribute("aria-valuemax");
    bootstrapStatus.removeAttribute("aria-valuenow");
    bootstrapStatus.removeAttribute("aria-valuetext");
    bootstrapStatus.textContent = worldEntered
      ? "Field systems ready. Restored session controls are active."
      : selection.profile === "mobile-safe"
        ? `Field systems ready with reduced scenery detail.${selection.reasonText ? ` ${selection.reasonText}` : ""}`
        : "Field systems ready with standard scenery detail.";
  };
  const runRecord = createRunRecord(
    state.seed,
    BOOT_STARTED_AT,
    createRunRecordInitialContext(state, world),
  );
  const ghostRecorder = new GhostTrailRecorder();
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

  const emitRendererBackendPolicyCheckpoint = (): void => {
    const snapshot = performanceMonitor.snapshot(renderer.metrics());
    recordCheckpoint("rendererBackendPolicy", {
      requested: rendererBackendConfig.request,
      policy: rendererBackendConfig.policy,
      policyAllowsAutoWebGPU: rendererBackendConfig.policyAllowsAutoWebGPU,
      policyReason: rendererBackendConfig.policyReason,
      effective: snapshot.rendererBackend,
      requestedBackend: snapshot.rendererRequestedBackend,
      fallback: snapshot.rendererBackendFallback,
      backendReason: snapshot.rendererBackendReason,
    });
  };

  emitRendererBackendPolicyCheckpoint();

  const phaseLabel = requiredElement<HTMLElement>("#phase-label");
  const timeLabel = requiredElement<HTMLElement>("#time-label");
  const forecastLabel = requiredElement<HTMLElement>("#forecast-label");
  const driveStateLabel = requiredElement<HTMLElement>("#drive-state-label");
  const surfaceLabel = requiredElement<HTMLElement>("#surface-label");
  const biomeLabel = requiredElement<HTMLElement>("#biome-label");
  const terrainHazardLabel = requiredElement<HTMLElement>(
    "#terrain-hazard-label",
  );
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
  const harvestObjective = requiredElement<HTMLElement>("#harvest-objective");
  const harvestObjectiveText = requiredElement<HTMLElement>(
    "#harvest-objective-text",
  );
  const harvestStormTimer = requiredElement<HTMLElement>(
    "#harvest-storm-timer",
  );
  const harvestCompass = requiredElement<HTMLElement>("#harvest-compass");
  const harvestCompassArrow = requiredElement<HTMLElement>(
    "#harvest-compass-arrow",
  );
  const harvestCompassDistance = requiredElement<HTMLElement>(
    "#harvest-compass-distance",
  );
  const emergencyRecover =
    requiredElement<HTMLButtonElement>("#emergency-recover");
  let saveStatus!: HTMLElement;
  const profileStatus = requiredElement<HTMLElement>("#profile-status");
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
  const touchRadialAction = requiredElement<HTMLButtonElement>(
    "#touch-radial-action",
  );
  const mapTapButton = requiredElement<HTMLButtonElement>(
    'button[data-tap-action="map"]',
  );
  const landmarkList = requiredElement<HTMLOListElement>("#landmark-list");
  const toast = requiredElement<HTMLElement>("#toast");
  const pauseOverlay = requiredElement<HTMLElement>("#pause-overlay");
  const pauseResume = requiredElement<HTMLButtonElement>("#pause-resume");
  const pauseMute = requiredElement<HTMLButtonElement>("#pause-mute");
  const pauseFullscreen =
    requiredElement<HTMLButtonElement>("#pause-fullscreen");
  const pauseNavigator = requiredElement<HTMLButtonElement>("#pause-navigator");
  const pauseWelcome = requiredElement<HTMLButtonElement>("#pause-welcome");
  const pauseReset = requiredElement<HTMLButtonElement>("#pause-reset");
  const pauseCopySessionRecord = requiredElement<HTMLButtonElement>(
    "#pause-copy-session-record",
  );
  const pauseSaveStatus = requiredElement<HTMLElement>("#pause-save-status");
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
  const dialoguePanel = requiredElement<HTMLElement>("#dialogue-panel");
  const dialogueScrim = requiredElement<HTMLElement>("#dialogue-scrim");
  const dialogueSpeaker = requiredElement<HTMLElement>("#dialogue-speaker");
  const dialogueBody = requiredElement<HTMLElement>("#dialogue-body");
  const dialogueChoices = requiredElement<HTMLElement>("#dialogue-choices");
  const dialogueInputForm = requiredElement<HTMLFormElement>(
    "#dialogue-input-form",
  );
  const dialogueInput = requiredElement<HTMLInputElement>("#dialogue-input");
  const enterWorldButton = requiredElement<HTMLButtonElement>("#enter-world");
  const resetButton = requiredElement<HTMLButtonElement>("#reset-button");
  const muteButton = requiredElement<HTMLButtonElement>("#mute-button");
  const controlsLegend = requiredElement<HTMLElement>("#controls-legend");
  const controlsLegendToggle = requiredElement<HTMLButtonElement>(
    "#controls-legend-toggle",
  );

  /*
   * The keyboard legend is a reference surface, not play state, so it defaults
   * to hidden and the world fills the screen. ADR-0020 still owns *teaching* a
   * control when its context first becomes relevant; this is only the
   * look-it-up path.
   *
   * `pin` persists the player's choice as a browser-local UI preference, in the
   * same class as the control-lesson preference and deliberately outside the
   * save schema: a cleared or malformed preference simply returns to the
   * default rather than corrupting anything.
   */
  const CONTROLS_LEGEND_PREFERENCE = "rigs-unbound.controls-legend.v1";
  /**
   * ADR-0035 accessibility opt-in: pause the world while the Pegboard is open.
   * A browser-local comfort preference, deliberately outside the save schema.
   */
  const PEGBOARD_PAUSE_PREFERENCE = "rigs-unbound.pegboard-pause.v1";
  let pegboardPausesWorld = false;
  let pegboardPausedWorld = false;
  try {
    pegboardPausesWorld =
      window.localStorage.getItem(PEGBOARD_PAUSE_PREFERENCE) === "pause";
  } catch {
    pegboardPausesWorld = false;
  }

  /** Exposed so settings UI and acceptance can set the comfort preference. */
  const setPegboardPausesWorld = (pauses: boolean): void => {
    pegboardPausesWorld = pauses;
    try {
      window.localStorage.setItem(
        PEGBOARD_PAUSE_PREFERENCE,
        pauses ? "pause" : "live",
      );
    } catch {
      // A blocked storage quota must never break the control surface.
    }
  };

  let controlsLegendVisible = false;

  function setControlsLegendVisible(visible: boolean, pin = false): void {
    controlsLegendVisible = visible;
    controlsLegend.hidden = !visible;
    controlsLegendToggle.setAttribute("aria-expanded", String(visible));
    if (!pin) return;
    try {
      window.localStorage.setItem(
        CONTROLS_LEGEND_PREFERENCE,
        visible ? "shown" : "hidden",
      );
    } catch {
      // A blocked or full storage quota must never break the control surface.
    }
  }

  let legendPreference: string | null = null;
  try {
    legendPreference = window.localStorage.getItem(CONTROLS_LEGEND_PREFERENCE);
  } catch {
    legendPreference = null;
  }
  setControlsLegendVisible(legendPreference === "shown");

  controlsLegendToggle.addEventListener("click", () => {
    setControlsLegendVisible(!controlsLegendVisible, true);
  });
  const fullscreenButton =
    requiredElement<HTMLButtonElement>("#fullscreen-button");
  const cameraSelect = requiredElement<HTMLSelectElement>("#camera-select");
  const workshopPanel = requiredElement<HTMLElement>("#workshop-panel");
  const workshopSalvage = requiredElement<HTMLElement>("#workshop-salvage");
  const workshopCondition = requiredElement<HTMLElement>("#workshop-condition");
  // The old man's tractor arrives narratively broken. This one-time beat
  // (diagnose -> rebuild -> start) gates `isOpeningNamingReady()` in state.ts,
  // so until it completes the naming moment and the waterworks choice can
  // never fire — the section must render before either of those.
  const workshopRestoration = document.createElement("section");
  workshopRestoration.className = "workshop__waterworks workshop__restoration";
  workshopRestoration.hidden = true;
  workshopRestoration.innerHTML = `
    <p>THE OLD MAN'S TRACTOR</p>
    <span id="workshop-restoration-copy"></span>
    <div>
      <button type="button" id="workshop-restoration-action"></button>
    </div>
  `;
  workshopCondition.insertAdjacentElement("afterend", workshopRestoration);
  const workshopRestorationCopy = requiredElement<HTMLElement>(
    "#workshop-restoration-copy",
  );
  const workshopRestorationAction = requiredElement<HTMLButtonElement>(
    "#workshop-restoration-action",
  );
  workshopRestorationAction.addEventListener("click", () => {
    markActionReady();
    void audio.unlock();
    workshopRestoration.classList.add("workshop__restoration--responding");
    window.setTimeout(() => {
      workshopRestoration.classList.remove("workshop__restoration--responding");
    }, 460);
    workshopRestorationAction.setAttribute("aria-busy", "true");
    window.setTimeout(() => {
      workshopRestorationAction.removeAttribute("aria-busy");
    }, 360);
    if (!state.restoration.diagnosed) {
      diagnoseRestoration(state);
      recordCommand("diagnoseRestoration");
      audio.chirp(520);
    } else if (!state.restoration.repaired) {
      performRestorationService(state);
      recordCommand("performRestorationService");
      audio.impact(0.25);
    } else if (!state.restoration.firstStart) {
      audio.chirp(180);
      performFirstStart(state);
      recordCommand("performFirstStart");
      audio.impact(0.35);
      renderer.addShake(0.5);
      renderer.flashHeadlights(state.activeRigId);
      closeOverlay();
    }
    announce();
  });
  const workshopIdentity = document.createElement("form");
  workshopIdentity.className = "workshop__identity";
  workshopIdentity.innerHTML = `
    <label for="workshop-rig-name">Rig identity</label>
    <input id="workshop-rig-name" name="fieldName" maxlength="28" autocomplete="off" />
    <button type="submit">Record name</button>
  `;
  workshopCondition.insertAdjacentElement("afterend", workshopIdentity);
  const workshopRigName =
    workshopIdentity.querySelector<HTMLInputElement>("#workshop-rig-name");
  const workshopRecordName = workshopIdentity.querySelector<HTMLButtonElement>(
    "button[type=submit]",
  );
  workshopIdentity.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!workshopRigName) return;
    renameRig(state, state.activeRigId, workshopRigName.value);
  });
  const waterworksChoice = document.createElement("section");
  waterworksChoice.className = "workshop__waterworks";
  waterworksChoice.hidden = true;
  waterworksChoice.innerHTML = `
    <p>WATER BEFORE NIGHT</p>
    <strong>The old man needs a call before the rain returns.</strong>
    <span>Repair the Long Furrow drain for firmer cultivation, or redirect the channel to the troughs and accept a muddy low approach.</span>
    <div>
      <button type="button" data-waterworks-choice="repair-pump">Repair drain pump</button>
      <button type="button" data-waterworks-choice="redirect-channel">Redirect channel</button>
    </div>
  `;
  workshopIdentity.insertAdjacentElement("afterend", waterworksChoice);
  waterworksChoice
    .querySelectorAll<HTMLButtonElement>("button[data-waterworks-choice]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const choice = button.dataset.waterworksChoice;
        if (choice === "repair-pump" || choice === "redirect-channel") {
          chooseFarmWaterworks(state, world, choice);
        }
      });
    });
  const moduleList = requiredElement<HTMLOListElement>("#module-list");
  const radialOverlay = requiredElement<HTMLElement>("#radial-overlay");
  const radialMenuList = requiredElement<HTMLElement>("#radial-menu-list");
  const radialMenuClose =
    requiredElement<HTMLButtonElement>("#radial-menu-close");
  const missionBoard = requiredElement<HTMLElement>("#mission-board");
  const missionBoardButton = requiredElement<HTMLButtonElement>(
    "#mission-board-button",
  );
  const missionBoardClose = requiredElement<HTMLButtonElement>(
    "#mission-board-close",
  );
  const missionBoardSummary = requiredElement<HTMLElement>(
    "#mission-board-summary",
  );
  const missionBoardContext = requiredElement<HTMLElement>(
    "#mission-board-context",
  );
  const missionBoardList = requiredElement<HTMLOListElement>(
    "#mission-board-list",
  );
  const missionBriefing = requiredElement<HTMLElement>("#mission-briefing");
  const missionBriefingKicker = requiredElement<HTMLElement>(
    "#mission-briefing-kicker",
  );
  const missionBriefingTitle = requiredElement<HTMLElement>(
    "#mission-briefing-title",
  );
  const missionBriefingCopy = requiredElement<HTMLElement>(
    "#mission-briefing-copy",
  );
  const missionBriefingOrigin = requiredElement<HTMLElement>(
    "#mission-briefing-origin",
  );
  const missionBriefingDestination = requiredElement<HTMLElement>(
    "#mission-briefing-destination",
  );
  const missionBriefingReward = requiredElement<HTMLElement>(
    "#mission-briefing-reward",
  );
  const missionBriefingAccept = requiredElement<HTMLButtonElement>(
    "#mission-briefing-accept",
  );
  const mapOverlay = requiredElement<HTMLElement>("#map-overlay");
  const mapProgress = requiredElement<HTMLElement>("#map-progress");
  const mapClose = requiredElement<HTMLButtonElement>("#map-close");
  const mapLayerField = requiredElement<HTMLButtonElement>("#map-layer-field");
  const mapLayerRumor = requiredElement<HTMLButtonElement>("#map-layer-rumor");
  const mapLayerJournal =
    requiredElement<HTMLButtonElement>("#map-layer-journal");
  const rumorMapHost = requiredElement<HTMLElement>("#rumor-map-host");
  const journalMapHost = requiredElement<HTMLElement>("#journal-map-host");
  const mapLegend = requiredElement<HTMLElement>("#map-legend");
  saveStatus = requiredElement<HTMLElement>("#save-status");
  attachContextRecovery();
  const rumorMap = createRumorMapUI(document.body, () => {
    closeOverlay();
  });
  // Move the rumor map into the unified map host so it shares the map overlay.
  rumorMapHost.appendChild(rumorMap.element);
  const hoodDashboard = createHoodDashboardUI(document.body);
  const navigatorUI = createNavigatorUI(document.body);

  // ---------------------------------------------------------------------------
  // Unified overlay shell
  // ---------------------------------------------------------------------------

  type OverlayKind =
    | "none"
    | "map"
    | "pause"
    | "workshop"
    | "lesson"
    | "radial"
    | "mission-board";
  let activeOverlay: OverlayKind = "none";
  let mapLayer: "field" | "rumor" | "journal" = "field";
  let navigatorVisible =
    window.localStorage.getItem("rigs-unbound.navigator-visible") === "true";
  const focusAfterPaint = (element: HTMLElement | null): void => {
    if (!element) return;
    const focus = (): void => {
      if (!element.isConnected) return;
      if (document.activeElement === element) return;
      element.focus({ preventScroll: true });
    };

    focus();
    window.requestAnimationFrame(() => {
      focus();
      window.requestAnimationFrame(() => {
        focus();
        window.setTimeout(() => {
          focus();
        }, 0);
      });
    });
  };

  const MODAL_FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const getActiveModalContainer = (): HTMLElement | null => {
    if (!worldEntered && !welcomePanel.hidden) return welcomePanel;
    if (activeOverlay === "map" && !mapOverlay.hidden) return mapOverlay;
    if (activeOverlay === "pause" && !pauseOverlay.hidden) return pauseOverlay;
    if (activeOverlay === "radial" && !radialOverlay.hidden)
      return radialOverlay;
    if (activeOverlay === "mission-board" && !missionBoard.hidden) {
      return missionBoard;
    }
    return null;
  };

  const handleModalTabKeydown = (event: KeyboardEvent): boolean => {
    if (event.key !== "Tab") return false;
    const modal = getActiveModalContainer();
    if (!modal) return false;
    const focusables = Array.from(
      modal.querySelectorAll<HTMLElement>(MODAL_FOCUSABLE_SELECTOR),
    ).filter((element) => !element.hidden && element.offsetParent !== null);
    if (focusables.length === 0) return false;

    event.preventDefault();
    const activeElement = document.activeElement as HTMLElement | null;
    const currentIndex = activeElement ? focusables.indexOf(activeElement) : -1;
    const nextIndex =
      currentIndex === -1
        ? event.shiftKey
          ? focusables.length - 1
          : 0
        : (currentIndex + (event.shiftKey ? -1 : 1) + focusables.length) %
          focusables.length;
    focusables[nextIndex]?.focus({ preventScroll: true });
    return true;
  };

  const updateNavigatorVisibility = (): void => {
    navigatorUI.element.hidden = !navigatorVisible;
    navigatorUI.element.setAttribute("aria-hidden", String(!navigatorVisible));
  };
  updateNavigatorVisibility();

  /**
   * Render the Pegboard from projections.
   *
   * The wheel stores no gameplay state. Every label, status, and command comes
   * from `deriveRigToolProjections()`, so it cannot disagree with the
   * simulation. Per ADR-0035 it runs live — opening it does not pause — with a
   * comfort setting for players who need the world to hold still.
   */
  const renderRadialMenu = (): void => {
    radialMenuList.replaceChildren();
    for (const tool of deriveRigToolProjections(state)) {
      const entry = document.createElement("li");
      entry.className = [
        tool.status === "engaged" ? "is-active" : "",
        tool.status === "blocked" ? "is-disabled is-locked" : "",
      ]
        .filter(Boolean)
        .join(" ");

      const button = document.createElement("button");
      button.type = "button";
      button.disabled = tool.status === "blocked" || tool.command === null;
      button.textContent = tool.label;
      button.setAttribute("aria-pressed", String(tool.status === "engaged"));
      // The cost travels with the control, so the player never has to open a
      // separate surface to learn what a commitment gives up.
      button.setAttribute(
        "aria-description",
        tool.blockedReason ?? tool.detail,
      );
      button.addEventListener("click", () => {
        if (!tool.command) {
          showToast(tool.blockedReason ?? `${tool.label} is already set.`);
          return;
        }
        markActionReady();
        recordCommand("rig-tool", { toolId: tool.id, command: tool.command });
        const message =
          tool.command.type === "set-tire-pressure"
            ? setTirePressure(state, tool.command.psi)
            : cycleDifferentialMode(state);
        renderRadialMenu();
        showToast(message);
      });
      entry.appendChild(button);

      const detail = document.createElement("span");
      detail.textContent = tool.blockedReason ?? tool.detail;
      entry.appendChild(detail);
      radialMenuList.appendChild(entry);
    }
  };

  let selectedMissionId: string | null = null;
  const missionVisibility = new Set(WORLD_SITES.map((site) => site.id));
  const currentMissions = (): readonly MissionProposition[] =>
    deriveMissions(state, state.progression, state.phase, missionVisibility);

  const renderMissionBoard = (): void => {
    const missions = currentMissions();
    const selected = missions.find(
      (mission) => mission.id === selectedMissionId,
    );
    const fieldNotes = [
      ...deriveSettlementFieldNotes(state),
      ...deriveSettlementEcologyFieldNotes(world.ecologySnapshot()),
    ]
      .map((note) => `${note.speaker}: ${note.text}`)
      .join(" · ");
    missionBoardSummary.textContent = missions.length
      ? `${missions.length} contract${missions.length === 1 ? "" : "s"} resolved from the field state. Field notes: ${fieldNotes}.`
      : `No contract is visible yet. Field notes: ${fieldNotes}.`;
    missionBoardContext.textContent = selected
      ? `Previewing ${selected.missionClass} · ${selected.binding} · ${selected.difficultyLabel}.`
      : missions.length
        ? "Select a contract to preview its route, reward, and acceptance state."
        : "The board stays empty until the field resolves another signal.";
    missionBoardList.replaceChildren();
    missionBriefing.hidden = !selected;
    // Mirrors the lifecycle rules: main-class missions need the focus slot
    // free; every other class needs a side slot free.
    const selectedIsActive =
      !!selected &&
      (state.activeMission?.id === selected.id ||
        state.activeSideMissions.some((m) => m.id === selected.id));
    const sideSlotsFull =
      state.activeSideMissions.length >= MAX_ACTIVE_SIDE_MISSIONS;
    const acceptBlockedReason = !selected
      ? "Select a contract first."
      : selectedIsActive
        ? "This contract is already active."
        : selected.missionClass === "main" && state.activeMission !== null
          ? "Finish the current main contract before taking another."
          : selected.missionClass !== "main" && sideSlotsFull
            ? `At most ${MAX_ACTIVE_SIDE_MISSIONS} side contracts at once.`
            : null;
    missionBriefingAccept.disabled = acceptBlockedReason !== null;
    if (selected) {
      missionBriefingAccept.setAttribute(
        "aria-description",
        acceptBlockedReason ?? "Accept the selected contract.",
      );
    }

    const classOrder: MissionClass[] = [
      "main",
      "side",
      "local",
      "hidden",
      "repeatable",
      "emergent",
    ];
    const byClass = new Map<MissionClass, MissionProposition[]>();
    for (const mission of missions) {
      const list = byClass.get(mission.missionClass) ?? [];
      list.push(mission);
      byClass.set(mission.missionClass, list);
    }

    for (const cls of classOrder) {
      const group = byClass.get(cls);
      if (!group || group.length === 0) continue;
      const section = document.createElement("li");
      section.className = "mission-board__section";
      const heading = document.createElement("h3");
      heading.textContent = cls.charAt(0).toUpperCase() + cls.slice(1);
      section.appendChild(heading);
      const groupList = document.createElement("ol");
      groupList.className = "mission-board__group";

      for (const mission of group) {
        const isActive =
          state.activeMission?.id === mission.id ||
          state.activeSideMissions.some((m) => m.id === mission.id);
        const item = document.createElement("li");
        item.className = [
          mission.id === selectedMissionId ? "is-selected" : "",
          isActive ? "is-active" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute(
          "aria-pressed",
          String(mission.id === selectedMissionId),
        );
        const copy = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = mission.title;
        const meta = document.createElement("small");
        const giverLabel = mission.giverId
          ? `from ${mission.giverId}`
          : "world-derived";
        meta.textContent = `${giverLabel} · ${mission.premise}`;
        copy.append(title, meta);
        const reward = document.createElement("em");
        reward.textContent = `${mission.rewardSalvage} salvage`;
        const statusBadge = document.createElement("span");
        statusBadge.textContent = isActive ? "active" : mission.state;
        button.append(copy, reward, statusBadge);
        button.addEventListener("click", () => {
          selectedMissionId = mission.id;
          renderMissionBoard();
          recordCheckpoint("missionSelected", {
            missionId: mission.id,
            binding: mission.binding,
          });
        });
        item.appendChild(button);
        groupList.appendChild(item);
      }

      section.appendChild(groupList);
      missionBoardList.appendChild(section);
    }

    if (!selected) return;
    missionBriefingKicker.textContent = `${selected.missionClass} · ${selected.binding} · ${selected.difficultyLabel}`;
    missionBriefingTitle.textContent = selected.title;
    missionBriefingCopy.textContent = selected.briefing;
    missionBriefingOrigin.textContent = selected.origin;
    missionBriefingDestination.textContent = selected.destination;
    missionBriefingReward.textContent = `${selected.rewardSalvage} salvage · ${selected.requiredCapabilities.length ? selected.requiredCapabilities.join(" · ") : "no special capability"}`;
    missionBriefingAccept.textContent = selectedIsActive
      ? "Contract active"
      : "Accept contract";
  };

  missionBriefingAccept.addEventListener("click", () => {
    const mission = currentMissions().find(
      (item) => item.id === selectedMissionId,
    );
    if (!mission) return;
    const result = acceptMission(
      state,
      mission,
      state.activeRigId,
      state.elapsedMs,
    );
    if (!result.ok) {
      showToast(`Cannot accept contract: ${result.reason}.`);
      renderMissionBoard();
      return;
    }
    recordCommand("acceptMission", {
      missionId: mission.id,
      binding: mission.binding,
    });
    renderMissionBoard();
    showToast(result.diagnostic);
  });

  const toggleNavigator = (): void => {
    navigatorVisible = !navigatorVisible;
    window.localStorage.setItem(
      "rigs-unbound.navigator-visible",
      String(navigatorVisible),
    );
    updateNavigatorVisibility();
    updatePauseNavigatorButton();
    showToast(navigatorVisible ? "Tactical radar on." : "Tactical radar off.");
    recordCheckpoint("toggleNavigator", { visible: navigatorVisible });
  };

  const renderJournalUI = (): void => {
    const edits = state.semanticEdits || [];
    const inheritances = state.fleetInheritance || [];

    if (edits.length === 0 && inheritances.length === 0) {
      journalMapHost.innerHTML = `
        <div class="journal-entry">
          <div class="journal-entry__header">
            <span>PROVENANCE LOG</span>
            <span>INITIAL</span>
          </div>
          <div class="journal-entry__title">No Earthwork Recorded Yet</div>
          <p>Lower your rig's blade to carve furrows, shape terrain, or open passage corridors. Operations will log automatically.</p>
        </div>
      `;
      return;
    }

    const items: string[] = [];

    for (const edit of edits) {
      items.push(`
        <div class="journal-entry">
          <div class="journal-entry__header">
            <span>TERRAIN EDIT (${edit.visualCategory})</span>
            <span>T: ${Math.round(edit.createdAt)}ms</span>
          </div>
          <div class="journal-entry__title">${edit.mode.toUpperCase()} — Rig ${edit.authorRigId}</div>
          <p>Graded ${edit.affectedCellCount} cells along ${edit.routeId || "field corridor"} at (${edit.x.toFixed(1)}, ${edit.z.toFixed(1)}).</p>
        </div>
      `);
    }

    for (const record of inheritances) {
      items.push(`
        <div class="journal-entry journal-entry--inheritance">
          <div class="journal-entry__header">
            <span>FLEET INHERITANCE</span>
            <span>T: ${Math.round(record.crossedAtMs)}ms</span>
          </div>
          <div class="journal-entry__title">Rig ${record.benefitingRigId} Inherited ${record.authorRigId}'s Path</div>
          <p>Traversed route clearance along ${record.routeId}.</p>
        </div>
      `);
    }

    journalMapHost.innerHTML = items.join("");
  };

  const updateMapLayerUI = (): void => {
    const isField = mapLayer === "field";
    const isRumor = mapLayer === "rumor";
    const isJournal = mapLayer === "journal";

    mapLayerField.classList.toggle("is-active", isField);
    mapLayerField.setAttribute("aria-pressed", String(isField));
    mapLayerRumor.classList.toggle("is-active", isRumor);
    mapLayerRumor.setAttribute("aria-pressed", String(isRumor));
    mapLayerJournal.classList.toggle("is-active", isJournal);
    mapLayerJournal.setAttribute("aria-pressed", String(isJournal));

    mapCanvas.hidden = !isField;
    rumorMapHost.hidden = !isRumor;
    journalMapHost.hidden = !isJournal;
    mapLegend.hidden = !isField;

    if (isField) {
      fieldMap.draw(state);
    } else if (isRumor) {
      rumorMap.open(state);
      rumorMap.update(state);
    } else if (isJournal) {
      renderJournalUI();
    }
  };

  const setMapLayer = (layer: "field" | "rumor" | "journal"): void => {
    if (mapLayer === layer) return;
    mapLayer = layer;
    window.localStorage.setItem("rigs-unbound.map-layer", layer);
    updateMapLayerUI();
  };

  mapLayerField.addEventListener("click", () => setMapLayer("field"));
  mapLayerRumor.addEventListener("click", () => setMapLayer("rumor"));
  mapLayerJournal.addEventListener("click", () => setMapLayer("journal"));

  const openOverlay = (kind: Exclude<OverlayKind, "none">): void => {
    if (activeOverlay === kind) return;
    // Close current overlay before opening the new one.
    closeOverlay();
    activeOverlay = kind;
    if (kind === "map") {
      toggleMap(state);
      mapOverlay.hidden = false;
      mapOverlay.setAttribute("aria-hidden", "false");
      updateMapLayerUI();
      focusAfterPaint(mapClose);
      window.setTimeout(() => {
        if (!mapOverlay.hidden) {
          mapClose.focus({ preventScroll: true });
        }
      }, 120);
    } else if (kind === "pause") {
      togglePause(state);
      pauseOverlay.hidden = false;
      pauseOverlay.setAttribute("aria-hidden", "false");
      updatePauseSaveStatus();
      focusAfterPaint(requiredElement<HTMLButtonElement>("#pause-resume"));
    } else if (kind === "workshop") {
      workshopPanel.hidden = false;
    } else if (kind === "lesson") {
      controlLesson.hidden = false;
    } else if (kind === "radial") {
      // ADR-0035: the Pegboard runs live by default, because a tool choice made
      // outside of time is inventory management. The opt-in exists so that does
      // not become a dexterity gate; it is a comfort setting, never a
      // difficulty setting, and it routes through the canonical pause path so
      // pausing behaves identically however it was reached.
      if (pegboardPausesWorld && !state.paused) {
        togglePause(state);
        pegboardPausedWorld = true;
      }
      renderRadialMenu();
      radialOverlay.hidden = false;
      radialOverlay.setAttribute("aria-hidden", "false");
      focusAfterPaint(radialMenuClose);
      window.setTimeout(() => {
        if (!radialOverlay.hidden) {
          radialMenuClose.focus({ preventScroll: true });
        }
      }, 120);
    } else if (kind === "mission-board") {
      renderMissionBoard();
      missionBoard.hidden = false;
      missionBoard.setAttribute("aria-hidden", "false");
      focusAfterPaint(missionBoardClose);
    }
    updateOverlayLauncherState();
  };

  const closeOverlay = (): void => {
    if (activeOverlay === "none") return;
    const previousOverlay = activeOverlay;
    activeOverlay = "none";
    if (previousOverlay === "map") {
      toggleMap(state);
      mapOverlay.hidden = true;
      mapOverlay.setAttribute("aria-hidden", "true");
      rumorMap.close();
    } else if (previousOverlay === "pause") {
      togglePause(state);
      pauseOverlay.hidden = true;
      pauseOverlay.setAttribute("aria-hidden", "true");
    } else if (previousOverlay === "workshop") {
      workshopPanel.hidden = true;
    } else if (previousOverlay === "lesson") {
      controlLesson.hidden = true;
    } else if (previousOverlay === "radial") {
      if (pegboardPausedWorld && state.paused) {
        togglePause(state);
      }
      pegboardPausedWorld = false;
      radialOverlay.hidden = true;
      radialOverlay.setAttribute("aria-hidden", "true");
    } else if (previousOverlay === "mission-board") {
      missionBoard.hidden = true;
      missionBoard.setAttribute("aria-hidden", "true");
    }
    updateOverlayLauncherState();
  };

  missionBoardButton.addEventListener("click", () =>
    openOverlay("mission-board"),
  );
  missionBoardClose.addEventListener("click", closeOverlay);

  const restoreSavedPreferences = (): void => {
    const savedLayer = window.localStorage.getItem("rigs-unbound.map-layer");
    if (savedLayer === "rumor") mapLayer = "rumor";
  };
  restoreSavedPreferences();

  let worldEntered =
    window.sessionStorage.getItem("rigs-unbound.welcome-seen") === "true" ||
    loadResult.status === "restored" ||
    loadResult.status === "migrated";

  input.setEnabled(worldEntered);
  welcomePanel.hidden = worldEntered;
  welcomePanel.setAttribute("aria-hidden", String(worldEntered));
  enterWorldButton.disabled = worldEntered;
  syncBootstrapStatus(
    performanceMonitor.snapshot(renderer.metrics()),
    runtimeProfileSelection,
  );
  profileStatus.textContent = formatRuntimeProfileStatus(
    runtimeProfileSelection,
  );
  if (!worldEntered) {
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
    const fitsNames = definition.fits
      .map((id) => state.rigs[id].fieldName)
      .join(", ");
    const item = document.createElement("li");
    item.innerHTML = `
      <button type="button" data-module-id="${moduleId}">
        <kbd aria-hidden="true">${MODULE_IDS.indexOf(moduleId) + 1}</kbd>
        <span class="module-copy">
          <strong>${definition.name}</strong>
          <small>${definition.promise} <span class="module-fits">(Fits: ${fitsNames})</span></small>
        </span>
        <span class="module-state">${definition.cost} salvage</span>
      </button>
    `;
    moduleList.append(item);
  }

  // Crafting turns collected commodities into parts-bin modules; installing
  // from the bin is the same compatibility gate as `fitModule` but spends no
  // salvage. Built here, not in index.html, to match the identity/waterworks
  // sections' pattern of owning their own markup next to their wiring.
  const workshopCrafting = document.createElement("section");
  workshopCrafting.className = "workshop__crafting";
  workshopCrafting.innerHTML = `
    <p class="workshop__crafting-heading">BLUEPRINTS</p>
    <ol id="workshop-recipe-list"></ol>
    <p class="workshop__crafting-heading">PARTS BIN</p>
    <ol id="workshop-parts-bin"></ol>
  `;
  moduleList.insertAdjacentElement("afterend", workshopCrafting);
  const recipeList = requiredElement<HTMLOListElement>("#workshop-recipe-list");
  const partsBinList = requiredElement<HTMLOListElement>("#workshop-parts-bin");
  CRAFTING_RECIPES.forEach((recipe, recipeIndex) => {
    const item = document.createElement("li");
    const costText = Object.entries(recipe.requiredMaterials)
      .filter(([, quantity]) => quantity > 0)
      .map(([commodity, quantity]) => `${quantity} ${commodity}`)
      .join(", ");
    item.innerHTML = `
      <button type="button" data-recipe-index="${recipeIndex}">
        <span class="module-copy">
          <strong>${recipe.name}</strong>
          <small>${costText}</small>
        </span>
        <span class="module-state"></span>
      </button>
    `;
    recipeList.append(item);
  });
  recipeList.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "button[data-recipe-index]",
    );
    if (!button || button.disabled) return;
    markActionReady();
    craftModule(state, Number(button.dataset.recipeIndex));
    announce();
  });
  partsBinList.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "button[data-parts-bin-module-id]",
    );
    if (!button) return;
    markActionReady();
    installFromPartsBin(
      state,
      world,
      button.dataset.partsBinModuleId as ModuleId,
    );
    announce();
  });

  let toastTimer = 0;
  let firstRungCompletionUntil = 0;
  let firstRungCompletionMessage = "";
  const showToast = (message: string): void => {
    toast.removeAttribute("aria-hidden");
    toast.textContent = message;
    toast.classList.add("toast--visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("toast--visible");
      toast.setAttribute("aria-hidden", "true");
      toast.textContent = "";
    }, 3000);
  };

  const announce = (): void => {
    if (state.lastDiagnostic) showToast(state.lastDiagnostic);
  };

  let currentDialogueInputHandler: ((value: string) => void) | null = null;

  const hideDialoguePanel = (): void => {
    dialoguePanel.hidden = true;
    dialogueChoices.innerHTML = "";
    dialogueInputForm.hidden = true;
    dialogueInput.value = "";
    currentDialogueInputHandler = null;
    dialogueScrim.classList.remove("dialogue-scrim--visible");
    renderer.setNarrativeFocus(false);
    if (
      document.activeElement &&
      dialoguePanel.contains(document.activeElement)
    ) {
      canvas.focus();
    }
  };

  interface DialogueChoice {
    label: string;
    action: () => void;
  }

  interface DialogueInputOptions {
    label: string;
    value: string;
    onSubmit: (value: string) => void;
  }

  const showDialoguePanel = (
    speaker: string,
    body: string,
    choices: DialogueChoice[],
    input?: DialogueInputOptions,
  ): void => {
    dialogueSpeaker.textContent = speaker;
    dialogueBody.textContent = body;
    dialogueChoices.innerHTML = "";
    currentDialogueInputHandler = null;

    if (input) {
      dialogueInputForm.hidden = false;
      const inputLabel = dialogueInputForm.querySelector("label");
      if (inputLabel) inputLabel.textContent = input.label;
      dialogueInput.value = input.value;
      currentDialogueInputHandler = input.onSubmit;
    } else {
      dialogueInputForm.hidden = true;
    }

    choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = choice.label;
      button.addEventListener("click", () => {
        choice.action();
      });
      dialogueChoices.appendChild(button);
    });

    dialoguePanel.hidden = false;
    dialogueScrim.classList.add("dialogue-scrim--visible");
    renderer.setNarrativeFocus(true);
    if (input) {
      dialogueInput.focus();
    } else if (choices.length > 0) {
      dialogueChoices.querySelector("button")?.focus();
    }
  };

  dialogueInputForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (currentDialogueInputHandler) {
      currentDialogueInputHandler(dialogueInput.value);
    }
  });

  const showArrivalBargain = (): void => {
    showDialoguePanel(
      "Old Man",
      "You walked a long way to find this valley. My tractor is dead in the barn, and I have a bed going cold. Fix her, and you can sleep under my roof. Refuse, and the road keeps going.",
      [
        {
          label: "Take the deal",
          action: () => {
            acceptArrivalBargain(state);
            announce();
            hideDialoguePanel();
          },
        },
        {
          label: "Not now",
          action: () => {
            refuseArrivalBargain(state);
            announce();
            hideDialoguePanel();
          },
        },
      ],
    );
  };

  const showNamingBeat = (): void => {
    const currentName = state.rigs["utility-tractor"].fieldName;
    showDialoguePanel(
      "Old Man",
      "That machine earned a name today. Torque, perhaps. Or something that belongs to you.",
      [],
      {
        label: "Name the tractor",
        value: currentName,
        onSubmit: (value) => {
          completeOpeningNaming(state, value);
          announce();
          hideDialoguePanel();
        },
      },
    );
  };

  const fitModule = (
    moduleId: ModuleId,
    source: "keyboard" | "workshop-panel" | "acceptance",
  ): string => {
    markActionReady();
    const before = resolveFirstRung(state, world.collectedNodes, world);
    recordCommand("installModule", { moduleId, source });
    installModule(state, world, moduleId);
    markControlLessonLearned("workshop", "performed");
    const after = resolveFirstRung(state, world.collectedNodes, world);
    const fittedNow = !before.complete && after.complete;
    const enteringFirstCut =
      before.stage === "choose-part" && after.stage === "first-cut";
    const enteringFreeExplore =
      before.stage === "second-fit" && after.stage === "free-explore";
    if (state.lastDiagnostic?.includes("fitted")) audio.chirp(880);
    announce();
    if (fittedNow && enteringFreeExplore) {
      const definition = MODULES[moduleId];
      firstRungCompletionMessage = `${definition.name} fitted · all upgrades installed · explore freely`;
      firstRungCompletionUntil = performance.now() + 4200;
      showToast(firstRungCompletionMessage);
    } else if (fittedNow) {
      const definition = MODULES[moduleId];
      firstRungCompletionMessage =
        moduleId === "lug-tires"
          ? `${definition.name} fitted · test the new grip in the mud toward Long Furrow`
          : `${definition.name} fitted · ${definition.promise}`;
    } else if (enteringFirstCut) {
      const definition = MODULES[moduleId];
      firstRungCompletionMessage = `${definition.name} fitted · Lower the blade to begin terrain transformation`;
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
    return settleAndReport();
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
      if (activeOverlay === "map") {
        closeOverlay();
      } else {
        openOverlay("map");
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
      if (activeOverlay === "pause") {
        closeOverlay();
      } else {
        openOverlay("pause");
      }
    }
    recordCheckpoint("tap", { action });
  };

  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    if (handleModalTabKeydown(event)) return;
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
    } else if (event.code === "KeyV") {
      toggleNavigator();
    } else if (event.code === "KeyB") {
      tap("blade");
    } else if (event.code === "KeyQ") {
      // ADR-0035 parity gate: the Pegboard was pointer/touch only, which made a
      // core tool surface unreachable by keyboard. Same overlay, same commands.
      markInputReady();
      if (activeOverlay === "radial") {
        closeOverlay();
      } else {
        openOverlay("radial");
      }
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
    } else if (event.code === "Slash" && event.shiftKey) {
      // `?` is the platform convention for "show me the controls".
      event.preventDefault();
      setControlsLegendVisible(!controlsLegendVisible, true);
    } else if (event.code === "KeyP") {
      tap("pause");
    } else if (event.code === "Escape") {
      // Escape closes the active overlay, or opens pause if none is open.
      if (activeOverlay === "none") {
        tap("pause");
      } else {
        closeOverlay();
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
    if (button.dataset.tapAction === "navigator") continue;
    button.addEventListener("click", () =>
      tap(button.dataset.tapAction as TapAction),
    );
  }

  const navigatorTouchButton = document.querySelector<HTMLButtonElement>(
    'button[data-tap-action="navigator"]',
  );
  if (navigatorTouchButton) {
    navigatorTouchButton.addEventListener("click", () => {
      markInputReady();
      toggleNavigator();
    });
  }

  mapLayerField.addEventListener("click", () => {
    markInputReady();
    setMapLayer("field");
  });
  mapLayerRumor.addEventListener("click", () => {
    markInputReady();
    setMapLayer("rumor");
  });

  moduleList.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "button[data-module-id]",
    );
    if (!button || button.disabled) return;
    markInputReady();
    markActionReady();
    void audio.unlock();
    void fitModule(button.dataset.moduleId as ModuleId, "workshop-panel");
  });

  enterWorldButton.addEventListener("click", () => {
    markInputReady();
    enterWorld("welcome-panel");
  });
  controlLessonDismiss.addEventListener("click", () => {
    if (visibleControlLessonId) {
      markControlLessonLearned(visibleControlLessonId, "dismissed");
    }
    if (activeOverlay === "lesson") closeOverlay();
    focusAfterPaint(canvas);
  });
  radialMenuClose.addEventListener("click", () => {
    markInputReady();
    closeOverlay();
    focusAfterPaint(canvas);
  });
  touchRadialAction.addEventListener("click", () => {
    markInputReady();
    if (activeOverlay === "radial") {
      closeOverlay();
    } else {
      openOverlay("radial");
    }
  });
  emergencyRecover.addEventListener("click", () => {
    markInputReady();
    tap("recover");
  });

  const updateMuteButtons = (): void => {
    const enabled = audio.isEnabled;
    const label = enabled ? "Sound on" : "Sound off";
    muteButton.textContent = label;
    muteButton.setAttribute("aria-pressed", String(!enabled));
    pauseMute.textContent = label;
    pauseMute.setAttribute("aria-pressed", String(!enabled));
  };

  const toggleMute = (): void => {
    const next = !audio.isEnabled;
    audio.setEnabled(next);
    updateMuteButtons();
    if (next) void audio.unlock();
  };

  const updateFullscreenButtons = (): void => {
    const isFullscreen = Boolean(document.fullscreenElement);
    fullscreenButton.textContent = isFullscreen
      ? "Exit fullscreen"
      : "Fullscreen";
    pauseFullscreen.textContent = isFullscreen
      ? "Exit fullscreen"
      : "Fullscreen";
  };

  const toggleFullscreen = (): void => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen().catch(() => {
        showToast("This browser refused fullscreen.");
      });
    }
  };

  document.addEventListener("fullscreenchange", updateFullscreenButtons);

  const updatePauseNavigatorButton = (): void => {
    pauseNavigator.textContent = navigatorVisible ? "Radar on" : "Radar off";
    pauseNavigator.setAttribute("aria-pressed", String(navigatorVisible));
  };

  const updateOverlayLauncherState = (): void => {
    mapTapButton.setAttribute("aria-controls", "map-overlay");
    mapTapButton.setAttribute("aria-expanded", String(activeOverlay === "map"));
    touchRadialAction.setAttribute("aria-controls", "radial-overlay");
    touchRadialAction.setAttribute(
      "aria-expanded",
      String(activeOverlay === "radial"),
    );
  };

  const updatePauseSaveStatus = (): void => {
    pauseSaveStatus.textContent = saveStatus.textContent ?? "";
  };

  updatePauseNavigatorButton();
  updateOverlayLauncherState();

  const resetField = (): void => {
    recordCommand("reset", {});
    clearState(window.localStorage);
    world.reset();
    state = createInitialState(state.seed);
    settleWorld(state, world);
    fieldMap.clear();
    ghostRecorder.clear();
    namingBeatPresented = false;
    renderer.invalidate(state);
    statusMessage = "Local field reset.";
    saveStatus.textContent = statusMessage;
    showToast("Field restored to its starting state.");
    recordCheckpoint("reset", {});
  };

  const returnToWelcome = (): void => {
    closeOverlay();
    worldEntered = false;
    input.setEnabled(false);
    welcomePanel.hidden = false;
    welcomePanel.classList.remove("welcome-panel--dismissed");
    welcomePanel.setAttribute("aria-hidden", "false");
    enterWorldButton.disabled = false;
    window.sessionStorage.removeItem("rigs-unbound.welcome-seen");
    requestAnimationFrame(() => enterWorldButton.focus());
    recordCheckpoint("returnToWelcome", {});
  };

  muteButton.addEventListener("click", () => {
    markInputReady();
    toggleMute();
  });
  pauseMute.addEventListener("click", () => {
    markInputReady();
    toggleMute();
  });

  fullscreenButton.addEventListener("click", () => {
    markInputReady();
    toggleFullscreen();
  });
  pauseFullscreen.addEventListener("click", () => {
    markInputReady();
    toggleFullscreen();
  });

  pauseResume.addEventListener("click", () => {
    markInputReady();
    closeOverlay();
    focusAfterPaint(canvas);
  });

  pauseNavigator.addEventListener("click", () => {
    markInputReady();
    toggleNavigator();
  });

  pauseWelcome.addEventListener("click", () => {
    markInputReady();
    returnToWelcome();
  });

  pauseReset.addEventListener("click", () => {
    markInputReady();
    closeOverlay();
    const confirmed = window.confirm(
      "Reset everything: both rigs, the relay, and all world progress?",
    );
    if (!confirmed) return;
    resetField();
  });

  pauseCopySessionRecord.addEventListener("click", () => {
    markActionReady();
    const payload = JSON.stringify(
      {
        runRecord: JSON.parse(window.getRunRecord()),
        ghostTrail: JSON.parse(window.getGhostTrail()),
      },
      null,
      2,
    );
    try {
      void navigator.clipboard.writeText(payload);
      showToast("Session record copied to clipboard.");
    } catch {
      showToast("Clipboard not available; record is on the window object.");
    }
    recordEvent("sessionRecordCopied", { byteLength: payload.length });
  });

  mapClose.addEventListener("click", () => {
    markInputReady();
    closeOverlay();
    focusAfterPaint(canvas);
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
      "Reset everything: both rigs, the relay, and all world progress?",
    );
    if (!confirmed) return;
    resetField();
  });

  let lastDiagnostic: string | null = state.lastDiagnostic;
  let lastUiUpdate = 0;
  let lastMapUpdate = 0;
  let namingBeatPresented = false;
  let prevHarvestCultivatedRows = state.harvest.cultivatedRows;
  let prevHarvestDelivered = state.harvest.delivered;
  let prevStormArrived = state.harvest.stormArrived;
  let prevStormMinutesLeft = Math.max(
    0,
    state.harvest.stormAtMinutes - state.worldTimeMinutes,
  );

  const updateInterface = (now: number): void => {
    if (now - lastUiUpdate < 100) return;
    lastUiUpdate = now;

    const rig = activeRig(state);
    const profile = effectiveProfile(rig.id, rig.modules);
    const worldPhase = phaseForWorldTime(state.worldTimeMinutes);
    const weather = deriveWeatherState(state.worldTimeMinutes);
    renderer.setWeather(weather);
    const speedKmh = Math.abs(rig.speed) * 3.6;
    const motionEnergy = Math.min(1, speedKmh / 26);
    if (
      state.arrivalBargain.status === "unseen" &&
      worldEntered &&
      dialoguePanel.hidden
    ) {
      showArrivalBargain();
    }
    if (
      state.openingNaming.status === "ready" &&
      !namingBeatPresented &&
      dialoguePanel.hidden
    ) {
      namingBeatPresented = true;
      showNamingBeat();
    }
    const plough = rig.attachments.find((item) => item.id === "field-plough");
    const towing = state.cargoRelay.cargo.attachedRigId === rig.id;
    const telemetry = rig.telemetry;
    const primaryAction = resolvePrimaryAction(state, world);

    phaseLabel.textContent = state.phase;
    timeLabel.textContent = phaseTime(state);
    const forecast = deriveWeatherForecast(state.worldTimeMinutes);
    const driveTone = selectDrivePresentationTone(speedKmh);
    syncPresentationMood(
      worldPhase,
      weather,
      runtimeProfileSelection.profile,
      motionEnergy,
      rig.id,
      state.cameraMode,
      speedKmh,
    );
    forecastLabel.textContent = forecast.label;
    forecastLabel.setAttribute(
      "aria-label",
      `Weather forecast: ${forecast.label.toLowerCase()}.`,
    );

    // First playable slice: harvest objective HUD.
    const harvest = state.harvest;
    const stormMinutesLeft = Math.max(
      0,
      harvest.stormAtMinutes - state.worldTimeMinutes,
    );
    const stormHours = Math.floor(stormMinutesLeft / 60);
    const stormMins = Math.round(stormMinutesLeft % 60);
    if (harvest.delivered) {
      harvestObjective.hidden = false;
      harvestObjectiveText.textContent = `Harvest delivered — ${harvest.cultivatedRows} rows`;
      harvestStormTimer.textContent = "";
      harvestObjective.classList.add("is-delivered");
      harvestObjective.classList.remove("is-storm-arrived");
    } else if (harvest.stormArrived) {
      harvestObjective.hidden = false;
      harvestObjectiveText.textContent =
        harvest.cultivatedRows > 0
          ? `${harvest.cultivatedRows}/${harvest.totalRows} rows ploughed — storm arrived`
          : "Storm arrived — crops lost";
      harvestStormTimer.textContent = "Storm now";
      harvestObjective.classList.add("is-storm-arrived");
      harvestObjective.classList.remove("is-delivered");
    } else {
      harvestObjective.hidden = false;
      harvestObjectiveText.textContent =
        harvest.cultivatedRows > 0
          ? `${harvest.cultivatedRows}/${harvest.totalRows} rows ploughed`
          : "Plough the crop rows before the storm";
      harvestStormTimer.textContent =
        stormHours > 0
          ? `Storm in ${stormHours}h ${stormMins}m`
          : `Storm in ${stormMins}m`;
      harvestObjective.classList.remove("is-delivered", "is-storm-arrived");
    }

    // Audio cues for harvest events.
    if (harvest.cultivatedRows > prevHarvestCultivatedRows) {
      audio.ploughCut();
    }
    if (harvest.delivered && !prevHarvestDelivered) {
      audio.harvestDeliver();
    }
    if (harvest.stormArrived && !prevStormArrived) {
      audio.stormApproach(1);
    } else if (!harvest.delivered && !harvest.stormArrived) {
      const minutesLeft = Math.max(
        0,
        harvest.stormAtMinutes - state.worldTimeMinutes,
      );
      const fraction = 1 - minutesLeft / (harvest.stormAtMinutes - 400);
      if (
        fraction > 0.7 &&
        prevStormMinutesLeft / (harvest.stormAtMinutes - 400) <= 0.7
      ) {
        audio.stormApproach(0.6);
      }
    }

    // Outcome summary: show a summary when harvest is delivered or storm destroys crops.
    if (harvest.delivered && !prevHarvestDelivered) {
      showToast(
        `Harvest complete: ${harvest.cultivatedRows} rows delivered. The community at Long Furrow can eat.`,
      );
    } else if (
      harvest.stormArrived &&
      !prevStormArrived &&
      !harvest.delivered
    ) {
      showToast(
        "Storm passed. The uncollected crops are ruined. The community will remember.",
      );
    }

    prevHarvestCultivatedRows = harvest.cultivatedRows;
    prevHarvestDelivered = harvest.delivered;
    prevStormArrived = harvest.stormArrived;
    prevStormMinutesLeft = Math.max(
      0,
      harvest.stormAtMinutes - state.worldTimeMinutes,
    );

    driveStateLabel.textContent = driveTone.label;
    driveStateLabel.setAttribute(
      "aria-label",
      `Driving state: ${driveTone.label.toLowerCase()}.`,
    );
    surfaceLabel.textContent =
      SURFACES[telemetry.surfaceId as SurfaceId]?.displayName ?? "Ground";
    biomeLabel.textContent =
      BIOMES[world.terrain.biomeAt(rig.x, rig.z)].displayName;
    {
      // Diegetic terrain hazard readout from the shared contour generator.
      // Samples a small local height grid around the active rig once per UI
      // tick and reports the worst slope classification in that footprint, so
      // the player sees the same ground truth the climb/loss logic reads.
      const localStep = 6;
      const localCells = 7; // 7x7 grid => a ~36 m x 36 m footprint.
      const originX = rig.x - ((localCells - 1) / 2) * localStep;
      const originZ = rig.z - ((localCells - 1) / 2) * localStep;
      const grid: number[][] = [];
      for (let r = 0; r < localCells; r += 1) {
        const row: number[] = [];
        for (let c = 0; c < localCells; c += 1) {
          row.push(
            world.terrain.height(
              originX + c * localStep,
              originZ + r * localStep,
            ),
          );
        }
        grid.push(row);
      }
      const contours = generateElevationContours(grid, localStep, 5);
      let worst: "safe" | "warning" | "danger" = "safe";
      for (const segment of contours) {
        if (segment.hazardLevel === "danger") {
          worst = "danger";
          break;
        }
        if (segment.hazardLevel === "warning") worst = "warning";
      }
      const hazardText =
        worst === "danger"
          ? "Steep ground"
          : worst === "warning"
            ? "Uneven ground"
            : "Safe ground";
      terrainHazardLabel.textContent = `· ${hazardText}`;
      terrainHazardLabel.setAttribute(
        "aria-label",
        `Terrain hazard: ${hazardText.toLowerCase()}.`,
      );
    }
    rigValue.textContent = rig.fieldName;
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
        `Blade unavailable on ${rig.fieldName}`,
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
          : `Recovery winch not fitted to ${rig.fieldName}`,
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
    const repairService = repairServiceInReach(state);
    const relay = state.cargoRelay;
    const firstRung = resolveFirstRung(state, world.collectedNodes, world);
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
        workshopLessonRelevant:
          workshop !== undefined && workshopLessonRelevant(firstRung),
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
      !worldEntered ||
      activeOverlay === "map" ||
      activeOverlay === "pause" ||
      activeOverlay === "radial" ||
      activeOverlay === "mission-board";
    if (!nextControlLesson || controlLessonSuppressed) {
      if (activeOverlay === "lesson") closeOverlay();
      controlLesson.hidden = true;
      controlLesson.removeAttribute("data-lesson-id");
      visibleControlLessonId = null;
    } else {
      const changed = visibleControlLessonId !== nextControlLesson.id;
      visibleControlLessonId = nextControlLesson.id;
      controlLesson.dataset.lessonId = nextControlLesson.id;
      controlLessonTitle.textContent = nextControlLesson.title;
      controlLessonDescription.textContent = nextControlLesson.description;
      controlLessonKeyboard.textContent = nextControlLesson.keyboard;
      controlLessonTouch.textContent = nextControlLesson.touch;
      if (activeOverlay !== "lesson") openOverlay("lesson");
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
      activeOverlay === "map" ||
      (firstRung.complete && !showingFirstRungCompletion);
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

    // Compass arrow pointing toward Long Furrow during harvest.
    const lfSite = WORLD_SITES.find((s) => s.id === "long-furrow");
    const showCompass =
      lfSite &&
      !harvest.delivered &&
      !harvest.stormArrived &&
      firstRung.stage === "free-explore";
    if (showCompass && lfSite) {
      const dx = lfSite.x - rig.x;
      const dz = lfSite.z - rig.z;
      const dist = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      harvestCompass.hidden = false;
      harvestCompassArrow.style.transform = `rotate(${angle}rad)`;
      harvestCompassDistance.textContent = `${Math.round(dist)} m`;
    } else {
      harvestCompass.hidden = true;
    }

    if (state.paused) {
      prompt.textContent = "Paused.";
    } else if (rig.condition <= 0) {
      prompt.textContent =
        "Rig disabled · press X or Winch for emergency field recovery";
    } else if (state.roadRivalry.status === "active") {
      const nextPlace =
        state.roadRivalry.nextGateIndex === 0 ? "Quarry Shelf" : "Home Silo";
      prompt.textContent = `Grove Run active · next: ${nextPlace} · the valley keeps this rig's record`;
    } else if (primaryAction.kind === "collect-salvage") {
      const node = world.exploration.nearestNode(
        rig.x,
        rig.z,
        SALVAGE_PICKUP_RADIUS,
        world.collectedNodes,
      );
      const units = node?.value === 1 ? "unit" : "units";
      prompt.textContent = `Salvage in reach · press Space or Act · ${node?.value ?? 1} ${units}`;
    } else if (
      primaryAction.kind === "inspect-infrastructure" ||
      primaryAction.kind === "service-infrastructure"
    ) {
      prompt.textContent = `${primaryAction.label} · press Space or Act`;
    } else if (primaryAction.kind === "hear-settlement-contact") {
      prompt.textContent = `${primaryAction.label} · press Space or Act`;
    } else if (workshop) {
      prompt.textContent =
        firstRung.stage === "choose-part"
          ? `${firstRung.objective} · ${state.salvage} salvage ready`
          : firstRung.stage === "second-fit"
            ? `${firstRung.objective} · ${state.salvage} salvage ready`
            : firstRung.complete && rig.modules.includes("lug-tires")
              ? "Lug tyres fitted · grip upgraded · take the mud line toward Long Furrow"
              : `${workshop.name} workshop · fit modules, ${state.salvage} salvage in the bin`;
    } else if (repairService) {
      prompt.textContent = `${repairService.name} · press T to service ${rig.fieldName}`;
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
    // The campaign-opening restoration beat (diagnose -> rebuild -> start)
    // is its own precondition, separate from first-rung module affordability:
    // a fresh arrival at Home Silo has 0 salvage and no fitted modules, so
    // `workshopActionable()` alone would never open the panel a disabled
    // Torque needs to be rebuilt in.
    const restorationPending =
      !state.restoration.diagnosed ||
      !state.restoration.repaired ||
      !state.restoration.firstStart;
    // Water Before Night is a one-time workshop decision; keep the panel
    // actionable after restoration so the player can actually take it.
    const waterworksPending =
      workshop !== undefined &&
      state.restoration.firstStart &&
      state.farmWaterworks.choice === "unresolved";
    const workshopPanelActionable =
      (workshop !== undefined && restorationPending) ||
      waterworksPending ||
      workshopActionable(workshop !== undefined, state, firstRung);
    if (workshopPanelActionable && activeOverlay === "none") {
      openOverlay("workshop");
    } else if (activeOverlay === "workshop" && !workshopPanelActionable) {
      closeOverlay();
    }
    if (workshop && activeOverlay === "workshop") {
      if (state.arrivalBargain.status === "refused" && dialoguePanel.hidden) {
        showArrivalBargain();
      }
      workshopSalvage.textContent = `${state.salvage} salvage`;
      workshopIdentity.hidden = false;
      const restorationDone =
        state.restoration.diagnosed &&
        state.restoration.repaired &&
        state.restoration.firstStart;
      workshopRestoration.hidden = restorationDone;
      if (!restorationDone) {
        if (!state.restoration.diagnosed) {
          workshopRestorationCopy.textContent =
            "This tractor has sat since the flood. Diagnose it before touching a wrench.";
          workshopRestorationAction.textContent = "Diagnose";
        } else if (!state.restoration.repaired) {
          workshopRestorationCopy.textContent =
            "Diagnosis complete. The old man's parts are free — rebuild it.";
          workshopRestorationAction.textContent = "Rebuild";
        } else {
          workshopRestorationCopy.textContent =
            "Rebuilt and ready. Turn it over.";
          workshopRestorationAction.textContent = "Start engine";
        }
      }
      waterworksChoice.hidden =
        !state.restoration.firstStart ||
        state.farmWaterworks.choice !== "unresolved";
      if (workshopRigName && document.activeElement !== workshopRigName) {
        workshopRigName.value = rig.fieldName;
      }
      if (workshopRecordName) workshopRecordName.disabled = false;
      // Mechanical service readout: what a repair would fix, what the fitted
      // modules do to the chassis. Both read canonical state — the panel
      // explains, it never owns.
      const wearDeficit = componentWearDeficit(rig.componentHealth);
      const massReport = computeChassisMassDistribution(
        RIG_PROFILES[rig.id],
        rig.modules,
      );
      const wearText =
        wearDeficit < 0.5
          ? "All components at spec."
          : `Service due — tread ${rig.componentHealth.tireTreadHealthPercent}%, radiator ${rig.componentHealth.radiatorCleanlinessPercent}%, cable ${rig.componentHealth.winchCableIntegrityPercent}%, belt ${rig.componentHealth.alternatorBeltHealthPercent}%.`;
      workshopCondition.textContent = `${wearText} Chassis ${(massReport.totalMassKg / 1000).toFixed(1)} t · rollover risk ${Math.round(massReport.rolloverRisk * 100)}%.`;
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
              ? `${definition.name} is unavailable for ${rig.fieldName}.`
              : `${recommended ? "Recommended. " : ""}Fit ${definition.name} for ${definition.cost} salvage. ${definition.promise}${affordable ? "" : ` Need ${definition.cost - state.salvage} more salvage.`}`,
        );
      }
      CRAFTING_RECIPES.forEach((recipe, recipeIndex) => {
        const button = recipeList.querySelector<HTMLButtonElement>(
          `button[data-recipe-index="${recipeIndex}"]`,
        );
        if (!button) return;
        const craftable = canCraftRecipe(recipe, state.inventory);
        button.disabled = !craftable;
        button.classList.toggle("is-locked", !craftable);
        const stateLabel = button.querySelector<HTMLElement>(".module-state");
        if (stateLabel)
          stateLabel.textContent = craftable ? "Craft" : "Need materials";
      });
      // The parts bin is a variable-length player inventory, unlike the fixed
      // module roster above, so it is rebuilt rather than diffed in place.
      partsBinList.innerHTML = "";
      if (state.partsBin.length === 0) {
        const empty = document.createElement("li");
        empty.className = "workshop__parts-bin-empty";
        empty.textContent = "Empty.";
        partsBinList.append(empty);
      } else {
        for (const moduleId of state.partsBin) {
          const definition = MODULES[moduleId];
          const item = document.createElement("li");
          item.innerHTML = `
            <button type="button" data-parts-bin-module-id="${moduleId}">
              <span class="module-copy"><strong>${definition.name}</strong></span>
              <span class="module-state">Install</span>
            </button>
          `;
          partsBinList.append(item);
        }
      }
    } else {
      workshopIdentity.hidden = true;
      workshopRestoration.hidden = true;
      waterworksChoice.hidden = true;
    }

    if (state.lastDiagnostic && state.lastDiagnostic !== lastDiagnostic) {
      lastDiagnostic = state.lastDiagnostic;
      showToast(state.lastDiagnostic);
    }

    let metrics = performanceMonitor.snapshot(renderer.metrics());
    const previousSubmitted = metrics.visibility?.submitted ?? 0;
    runtimeProfileSelection = runtimeProfileController.evaluate(metrics);
    const effectiveVisibilityProfile =
      developerProfilePreview ?? runtimeProfileSelection.profile;
    if (
      metrics.visibility?.profile !== effectiveVisibilityProfile &&
      renderer.setVisibilityProfile(effectiveVisibilityProfile, state)
    ) {
      metrics = performanceMonitor.snapshot(renderer.metrics());
      const previewActive = developerProfilePreview !== null;
      const fallbackActive = runtimeProfileSelection.profile === "mobile-safe";
      const reasonText = runtimeProfileSelection.reasonText;
      const currentSubmitted = metrics.visibility?.submitted ?? 0;
      const propReductionPct =
        previousSubmitted > 0 && fallbackActive
          ? Math.round(
              ((previousSubmitted - currentSubmitted) / previousSubmitted) *
                100,
            )
          : 0;
      const propNote =
        fallbackActive && propReductionPct > 0
          ? ` ${propReductionPct}% fewer scenery objects shown.`
          : "";
      statusMessage = previewActive
        ? `Acceptance visibility preview active: renderer forced to ${effectiveVisibilityProfile}.`
        : fallbackActive
          ? `Performance safeguard active: reduced scenery detail.${propNote}${reasonText ? ` ${reasonText}` : ""}`
          : "Performance safeguard cleared: standard scenery detail restored.";
      if (worldEntered) {
        showToast(statusMessage);
      } else {
        syncBootstrapStatus(metrics, runtimeProfileSelection);
      }
      recordCheckpoint(
        previewActive
          ? "runtimeProfilePreview"
          : fallbackActive
            ? "runtimeProfileFallback"
            : "runtimeProfileRecovery",
        {
          profile: effectiveVisibilityProfile,
          reasons: runtimeProfileSelection.reasons,
          preview: previewActive,
        },
      );
    }
    saveStatus.textContent = statusMessage;
    profileStatus.textContent = formatRuntimeProfileStatus(
      runtimeProfileSelection,
    );
    syncBootstrapStatus(metrics, runtimeProfileSelection);
    if (developerSurface) {
      const previewActive = developerProfilePreview !== null;
      const heap =
        metrics.heapUsedMb === null ? "heap n/a" : `${metrics.heapUsedMb} MB`;
      const bridgeStates = renderer.runtimeBridgeEvidenceList();
      const loadedBridges = bridgeStates.filter(
        (bridge) => bridge.status === "loaded",
      ).length;
      const bridgeSummary = `bridges:${loadedBridges}/${bridgeStates.length}`;
      const rendererMemorySummary = `geo:${metrics.geometries} tex:${metrics.textures}`;
      const backendSummary = `backend:${metrics.rendererBackend}/${metrics.rendererRequestedBackend} (${metrics.rendererBackendFallback ? "fallback" : "direct"})`;
      const visibility = metrics.visibility;
      const visibilitySummary = visibility
        ? `props:${visibility.submitted}/${visibility.candidates} n${visibility.near}/m${visibility.mid}/f${visibility.far} c${visibility.culled} cap${visibility.capacityLimited}`
        : "props:n/a";
      const profileSummary = formatRuntimeProfileOperatorSummary(
        runtimeProfileSelection,
        effectiveVisibilityProfile,
        previewActive,
      );
      const visibilityProfileSummary = `profile:${visibility?.profile ?? effectiveVisibilityProfile}`;
      runtimeDiagnostics.textContent = `${metrics.framesPerSecond || "--"} fps · ${metrics.drawCalls} calls · ${graphicsContextState()} · ${rendererMemorySummary} · ${backendSummary} · ${heap} · ${bridgeSummary} · ${visibilitySummary} · ${visibilityProfileSummary} · ${profileSummary}`;
    }

    if (activeOverlay === "map" && now - lastMapUpdate > 260) {
      lastMapUpdate = now;
      if (mapLayer === "field") {
        fieldMap.draw(state);
      } else {
        rumorMap.update(state);
      }
      mapProgress.textContent = `${Math.round(surveyed * 100)}% surveyed · ${Math.round(profile.surveyRange)} m sight`;
    }
  };

  // ---------------------------------------------------------------------------
  // Observability contract
  // ---------------------------------------------------------------------------

  const snapshot = (): string => {
    const resolvedFirstRung = resolveFirstRung(
      state,
      world.collectedNodes,
      world,
    );
    return JSON.stringify(
      {
        ...publicState(state, world),
        firstRung: {
          stage: resolvedFirstRung.stage,
          objective: resolvedFirstRung.objective,
          recommendedModuleId: resolvedFirstRung.recommendedModuleId,
          recommendedRigId: resolvedFirstRung.recommendedRigId,
          target: resolvedFirstRung.target,
          affordable: resolvedFirstRung.affordable,
          complete: resolvedFirstRung.complete,
          reason: resolvedFirstRung.reason,
        },
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
  };

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
  window.getGhostTrail = () =>
    JSON.stringify(
      {
        schemaVersion: 1,
        sampledAtHz: 10,
        seed: state.seed,
        activeRigId: state.activeRigId,
        snapshots: ghostRecorder.getSnapshots(),
      },
      null,
      2,
    );
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
  window.getRigGroundContactEvidence = (rigId = state.activeRigId) => {
    if (!RIG_IDS.includes(rigId)) {
      throw new Error(`Unknown rig id: ${String(rigId)}`);
    }
    renderer.render(state);
    return renderer.groundContactEvidence(state, rigId);
  };
  window.getRigModuleVisualEvidence = (rigId = state.activeRigId) => {
    if (!RIG_IDS.includes(rigId)) {
      throw new Error(`Unknown rig id: ${String(rigId)}`);
    }
    // Rendered first, so module visibility reflects the current `rigState.modules`
    // rather than whatever `applyModuleVisuals` last wrote. Measuring a stale
    // scene graph would make this surface agree with itself and nothing else.
    renderer.render(state);
    return renderer.moduleVisualEvidence(state, rigId);
  };
  window.getCameraResolutionEvidence = () => renderer.cameraEvidence();
  window.getWeatherSceneEvidence = () => renderer.weatherSceneEvidence();
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
  window.setPegboardPausesWorld = (pauses: boolean) => {
    setPegboardPausesWorld(pauses);
    return pauses;
  };
  window.strandRigForAcceptance = (rigId: string, x?: number, z?: number) => {
    if (!acceptanceSurface) {
      return "strandRigForAcceptance requires the acceptance surface.";
    }
    const target = state.rigs[rigId as RigId];
    if (!target) return `Unknown rig ${rigId}.`;
    target.condition = 0;
    target.speed = 0;
    if (typeof x === "number" && typeof z === "number") {
      target.x = x;
      target.z = z;
    }
    settleWorld(state, world);
    renderer.invalidate(state);
    recordCommand("strandRigForAcceptance", { rigId });
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
    return fitModule(moduleId, "acceptance");
  };
  window.grantSalvageForAcceptance = (amount: number) => {
    if (!acceptanceSurface) {
      throw new Error(
        "Salvage grants are available only on the field-02 acceptance surface.",
      );
    }
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("A salvage grant must be a finite, non-negative amount.");
    }
    state.salvage += Math.floor(amount);
    recordCommand("grantSalvageForAcceptance", { amount: Math.floor(amount) });
    return settleAndReport();
  };
  window.toggleBlade = () => {
    markActionReady();
    recordCommand("tap", { action: "blade", source: "acceptance" });
    toggleBladeMode(state);
    return settleAndReport();
  };
  window.recoverStrandedRig = () => {
    markActionReady();
    // The projection decides whether a command exists at all, so the runtime
    // hook cannot invent one the board would call impossible.
    const projection = fleetRecoveryProjection(
      deriveFleetRecoveryAssessment(
        state,
        world,
        deriveWeatherState(state.worldTimeMinutes),
      ),
    );
    if (!projection.command) {
      return {
        accepted: false,
        reason: projection.reasons[0] ?? "No recovery is available.",
      };
    }
    recordCommand("tap", { action: "fleet-recovery", source: "acceptance" });
    const transition = performFleetRecovery(state, world, projection.command);
    settleAndReport();
    return { accepted: transition.accepted, reason: transition.reason };
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
    if (activeOverlay === "map") {
      closeOverlay();
    } else {
      openOverlay("map");
    }
    return settleAndReport();
  };
  window.toggleWorkshop = () => {
    markActionReady();
    recordCommand("tap", { action: "workshop", source: "acceptance" });
    if (activeOverlay === "workshop") {
      closeOverlay();
    } else {
      openOverlay("workshop");
    }
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
  window.__forceProfile = (profileId: VisibilityProfileId) => {
    if (!developerSurface && !acceptanceSurface) {
      throw new Error(
        "Visibility profile preview is only available on developer or acceptance surfaces.",
      );
    }
    developerProfilePreview = profileId;
    renderer.setVisibilityProfile(profileId, state);
    renderer.invalidate(state);
    updateInterface(performance.now());
    return `Visibility profile preview set to ${profileId}.`;
  };
  window.__showNoRenderFallback = (reason = "The 3D scene is unavailable.") => {
    if (!developerSurface && !acceptanceSurface) {
      throw new Error(
        "No-render fallback preview is only available on developer or acceptance surfaces.",
      );
    }
    enterNoRenderFallback(reason);
    return `No-render fallback shown: ${reason}`;
  };

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
    if (saved) {
      statusMessage = "Saved locally just now";
    } else {
      const rawError = result.error ?? "storage unavailable";
      const isQuota = /quota|exceeded|size/i.test(rawError);
      statusMessage = isQuota
        ? "Save failed · browser storage is full. Clear some site data or export your save key to back it up."
        : "Save failed · storage unavailable. Your progress is still active this session. Try clearing browser data or exporting your save key.";
      state.lastDiagnostic = `Save failed · ${rawError}`;
    }
    saveStatus.textContent = statusMessage;
    if (!saved) {
      showToast(statusMessage);
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
    if (!worldEntered) {
      bootstrapFrameCount += 1;
    }
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
    ghostRecorder.record(rig, now);
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
  presentRendererFallback(
    error instanceof Error ? error.message : "Unknown browser runtime error.",
  );
  console.error("Rigs Unbound failed to start.", error);
}
