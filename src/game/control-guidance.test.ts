import { describe, expect, it } from "vitest";
import {
  CONTROL_LESSON_IDS,
  decodeLearnedControlLessons,
  resolveControlLesson,
  type ControlGuidanceContext,
} from "./control-guidance";

const BASE_CONTEXT: ControlGuidanceContext = {
  hasDriven: false,
  primaryActionKind: "none",
  workshopLessonRelevant: false,
  bladeRelevant: false,
  cameraRelevant: false,
  mapRelevant: false,
  switchRigRelevant: false,
  recoveryRelevant: false,
  restorationPending: false,
};

describe("first-use control guidance", () => {
  it("teaches movement first on a fresh field", () => {
    expect(resolveControlLesson(BASE_CONTEXT, new Set())).toMatchObject({
      id: "drive",
      keyboard: "W A S D / arrow keys",
      touch: "direction arrows",
    });
  });

  it("prioritises a newly available context action over optional views", () => {
    const lesson = resolveControlLesson(
      {
        ...BASE_CONTEXT,
        hasDriven: true,
        primaryActionKind: "collect-salvage",
        cameraRelevant: true,
      },
      new Set(["drive"]),
    );

    expect(lesson).toMatchObject({
      id: "act",
      keyboard: "Space / E",
      touch: "Act",
    });
    expect(lesson?.description).toContain("Collect");
  });

  it("introduces workshop input only when the lesson is relevant", () => {
    const lesson = resolveControlLesson(
      {
        ...BASE_CONTEXT,
        hasDriven: true,
        workshopLessonRelevant: true,
      },
      new Set(["drive", "act"]),
    );

    expect(lesson).toMatchObject({
      id: "workshop",
      keyboard: "1–6",
      touch: "choose a part",
    });
  });

  it("does not let optional lessons block the workshop after its lesson is learned", () => {
    const lesson = resolveControlLesson(
      {
        ...BASE_CONTEXT,
        hasDriven: true,
        workshopLessonRelevant: true,
        bladeRelevant: true,
        cameraRelevant: true,
        mapRelevant: true,
      },
      new Set(["drive", "act", "workshop"]),
    );

    expect(lesson).toBeNull();
  });

  it("does not repeat learned lessons and can advance to a contextual tool", () => {
    const lesson = resolveControlLesson(
      {
        ...BASE_CONTEXT,
        hasDriven: true,
        bladeRelevant: true,
        cameraRelevant: true,
      },
      new Set(["drive", "blade"]),
    );

    expect(lesson?.id).toBe("camera");
  });

  it("puts recovery ahead of every optional lesson when a rig needs it", () => {
    const lesson = resolveControlLesson(
      {
        ...BASE_CONTEXT,
        hasDriven: true,
        primaryActionKind: "attach-cargo",
        cameraRelevant: true,
        recoveryRelevant: true,
      },
      new Set(["drive"]),
    );

    expect(lesson?.id).toBe("recovery");
  });

  /*
   * The campaign-opening soft-lock, promoted into a unit test.
   *
   * `activeOverlay` in `main.ts` is a single slot, and the control-lesson block
   * claims it before the workshop block runs. The opening tractor sits at
   * `condition: 0`, so `recoveryRelevant` is permanently true, so an *urgent*
   * lesson held that slot forever — and the workshop panel, the only surface in
   * the game that can rebuild a condition-0 rig, only auto-opens while
   * `activeOverlay === "none"`.
   *
   * The result was a reachable-only-by-accident opening: the player had to dismiss
   * two lessons, both of which gave advice that could not work. `recovery` says
   * "press X", which is not how a wreck on the Home Silo pad gets rebuilt; `drive`
   * says "W A S D", which a disabled rig ignores because `condition <= 0` blocks
   * movement outright. Neither lesson can be satisfied by doing what it asks, and
   * `hasDriven` therefore never flips on its own.
   *
   * The rule that dissolves it is the one this module's own docblock already
   * promises — "learned lessons ... never become progression gates". A lesson is
   * advice; the restoration is a required beat. Advice yields.
   */
  it("offers no lesson while the opening restoration still needs the overlay", () => {
    // Every urgent trigger at once, which is close to the real opening state: a
    // condition-0 rig that has never moved, standing where the rebuild happens.
    const lesson = resolveControlLesson(
      {
        ...BASE_CONTEXT,
        recoveryRelevant: true,
        restorationPending: true,
      },
      new Set(),
    );

    expect(lesson).toBeNull();
  });

  it("resumes teaching once the restoration no longer needs the overlay", () => {
    // The other half of the invariant: suppression must be scoped to the pending
    // beat. A rule that silences guidance for the rest of the run would trade a
    // soft-lock for a game that never teaches its controls, and no assertion above
    // would notice.
    const lesson = resolveControlLesson(
      { ...BASE_CONTEXT, recoveryRelevant: true, restorationPending: false },
      new Set(),
    );

    expect(lesson?.id).toBe("recovery");
  });

  it("decodes only canonical ids and tolerates malformed local preferences", () => {
    expect(
      decodeLearnedControlLessons(
        JSON.stringify(["drive", "unknown", "camera", "drive"]),
      ),
    ).toEqual(new Set(["drive", "camera"]));
    expect(decodeLearnedControlLessons("{broken")).toEqual(new Set());
    expect(
      decodeLearnedControlLessons(JSON.stringify({ drive: true })),
    ).toEqual(new Set());
    expect(CONTROL_LESSON_IDS).toHaveLength(8);
  });
});
