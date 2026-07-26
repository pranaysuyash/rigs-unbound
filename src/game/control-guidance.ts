import type { PrimaryActionKind } from "./state";

export const CONTROL_LESSON_IDS = [
  "drive",
  "act",
  "workshop",
  "blade",
  "camera",
  "map",
  "switch-rig",
  "recovery",
] as const;

export type ControlLessonId = (typeof CONTROL_LESSON_IDS)[number];

export interface ControlLesson {
  id: ControlLessonId;
  title: string;
  description: string;
  keyboard: string;
  touch: string;
}

export interface ControlGuidanceContext {
  hasDriven: boolean;
  primaryActionKind: PrimaryActionKind;
  workshopRelevant: boolean;
  bladeRelevant: boolean;
  cameraRelevant: boolean;
  mapRelevant: boolean;
  switchRigRelevant: boolean;
  recoveryRelevant: boolean;
}

const STATIC_LESSONS: Readonly<
  Record<Exclude<ControlLessonId, "act">, ControlLesson>
> = {
  drive: {
    id: "drive",
    title: "Drive the active rig",
    description:
      "Forward, reverse, and steering stay relative to the machine's visible front.",
    keyboard: "W A S D / arrow keys",
    touch: "direction arrows",
  },
  workshop: {
    id: "workshop",
    title: "Fit a part at Home Silo",
    description:
      "Choose an affordable part to change what this rig can do and where it can travel.",
    keyboard: "1–6",
    touch: "choose a part",
  },
  blade: {
    id: "blade",
    title: "Shape soft ground",
    description:
      "Lower the blade to cut or fill terrain; raise it before ordinary travel.",
    keyboard: "Space / E · B mode",
    touch: "Act · Blade",
  },
  camera: {
    id: "camera",
    title: "Change how you read the world",
    description:
      "Cycle the camera or choose a named view such as Chase, Hood, or Top-down.",
    keyboard: "C · View menu",
    touch: "Cam",
  },
  map: {
    id: "map",
    title: "Read surveyed ground",
    description:
      "The map reveals only terrain your rigs have seen; higher ground extends the view.",
    keyboard: "M",
    touch: "Map",
  },
  "switch-rig": {
    id: "switch-rig",
    title: "Change rigs nearby",
    description:
      "Switch to another parked rig in range; where each machine is left still matters.",
    keyboard: "R",
    touch: "Rig",
  },
  recovery: {
    id: "recovery",
    title: "Recover a disabled or stranded rig",
    description:
      "Use recovery when the current machine cannot continue. The available result depends on its fitted capability.",
    keyboard: "X",
    touch: "Recover / Winch",
  },
};

const CONTEXT_ACTION_LABELS: Readonly<
  Partial<Record<PrimaryActionKind, string>>
> = {
  "collect-salvage": "Collect the salvage in reach",
  "attach-cargo": "Attach the relay cargo",
  "release-cargo": "Release the relay cargo",
};

function contextualActionLesson(kind: PrimaryActionKind): ControlLesson | null {
  const title = CONTEXT_ACTION_LABELS[kind];
  if (!title) return null;
  return {
    id: "act",
    title,
    description: `${title}. Act is contextual: its label changes before you press it, so the same input never hides what will happen.`,
    keyboard: "Space / E",
    touch: "Act",
  };
}

/**
 * Pick one newly relevant lesson without mutating gameplay state.
 *
 * Urgent and contextual actions lead; optional spatial-literacy controls follow.
 * Learned lessons are UI preferences and never become progression gates.
 */
export function resolveControlLesson(
  context: ControlGuidanceContext,
  learned: ReadonlySet<ControlLessonId>,
): ControlLesson | null {
  const candidates: Array<ControlLesson | null> = [
    context.recoveryRelevant ? STATIC_LESSONS.recovery : null,
    contextualActionLesson(context.primaryActionKind),
    context.workshopRelevant ? STATIC_LESSONS.workshop : null,
    !context.hasDriven ? STATIC_LESSONS.drive : null,
    context.bladeRelevant ? STATIC_LESSONS.blade : null,
    context.cameraRelevant ? STATIC_LESSONS.camera : null,
    context.mapRelevant ? STATIC_LESSONS.map : null,
    context.switchRigRelevant ? STATIC_LESSONS["switch-rig"] : null,
  ];
  return (
    candidates.find(
      (candidate) => candidate !== null && !learned.has(candidate.id),
    ) ?? null
  );
}

export function decodeLearnedControlLessons(
  serialized: string | null,
): Set<ControlLessonId> {
  if (!serialized) return new Set();
  try {
    const candidate: unknown = JSON.parse(serialized);
    if (!Array.isArray(candidate)) return new Set();
    const allowed = new Set<string>(CONTROL_LESSON_IDS);
    return new Set(
      candidate.filter(
        (value): value is ControlLessonId =>
          typeof value === "string" && allowed.has(value),
      ),
    );
  } catch {
    return new Set();
  }
}

export function encodeLearnedControlLessons(
  learned: ReadonlySet<ControlLessonId>,
): string {
  return JSON.stringify(
    CONTROL_LESSON_IDS.filter((lessonId) => learned.has(lessonId)),
  );
}
