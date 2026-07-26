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
  workshopRelevant: false,
  bladeRelevant: false,
  cameraRelevant: false,
  mapRelevant: false,
  switchRigRelevant: false,
  recoveryRelevant: false,
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

  it("introduces workshop input only when fitting a part is relevant", () => {
    const lesson = resolveControlLesson(
      {
        ...BASE_CONTEXT,
        hasDriven: true,
        workshopRelevant: true,
      },
      new Set(["drive", "act"]),
    );

    expect(lesson).toMatchObject({
      id: "workshop",
      keyboard: "1–6",
      touch: "choose a part",
    });
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
