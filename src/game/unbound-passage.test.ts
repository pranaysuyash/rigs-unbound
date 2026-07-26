import { describe, expect, it } from "vitest";
import {
  PASSAGE_LANES,
  canUseInheritedPassage,
  createUnboundPassageState,
  eligiblePassageLanes,
  readUnboundPassage,
  resolveUnboundPassageCommand,
  restoreUnboundPassage,
  serializeUnboundPassage,
} from "./unbound-passage";

describe("Unbound Passage 01", () => {
  it("offers materially different lanes from capabilities, not rig names", () => {
    expect(eligiblePassageLanes(["plough"]).map((lane) => lane.id)).toEqual([
      "grade-and-brace",
    ]);
    expect(eligiblePassageLanes(["jump"]).map((lane) => lane.id)).toEqual([
      "jump-and-scout",
    ]);
    expect(eligiblePassageLanes(["hover"]).map((lane) => lane.id)).toEqual([]);
    expect(PASSAGE_LANES["grade-and-brace"].requiredCapability).not.toBe(
      PASSAGE_LANES["jump-and-scout"].requiredCapability,
    );
  });

  it("opens a lane, records the author, and gives another rig an inherited benefit", () => {
    const transition = resolveUnboundPassageCommand(
      createUnboundPassageState(),
      {
        type: "resolve-attempt",
        actorRigId: "utility-tractor",
        actorCapabilities: ["plough", "tow"],
        laneId: "grade-and-brace",
        outcome: { kind: "opened" },
      },
      120,
    );

    expect(transition.accepted).toBe(true);
    expect(transition.event?.type).toBe("passage-opened");
    expect(transition.state.openedByRigId).toBe("utility-tractor");
    expect(canUseInheritedPassage(transition.state, "toy-buggy")).toBe(true);
    expect(canUseInheritedPassage(transition.state, "utility-tractor")).toBe(
      false,
    );
    expect(
      readUnboundPassage(transition.state, "toy-buggy").explanation,
    ).toContain("inherited route");
  });

  it("supports the second lane with a different capability", () => {
    const transition = resolveUnboundPassageCommand(
      createUnboundPassageState(),
      {
        type: "resolve-attempt",
        actorRigId: "toy-buggy",
        actorCapabilities: ["tow", "jump"],
        laneId: "jump-and-scout",
        outcome: { kind: "opened" },
      },
      240,
    );

    expect(transition.accepted).toBe(true);
    expect(transition.state.openedByLaneId).toBe("jump-and-scout");
    expect(transition.event).toMatchObject({
      type: "passage-opened",
      actorRigId: "toy-buggy",
      laneId: "jump-and-scout",
    });
  });

  it("leaves a recoverable failure instead of resetting the passage", () => {
    const failed = resolveUnboundPassageCommand(
      createUnboundPassageState(),
      {
        type: "resolve-attempt",
        actorRigId: "toy-buggy",
        actorCapabilities: ["tow", "jump"],
        laneId: "jump-and-scout",
        outcome: {
          kind: "recoverable-failure",
          reason: "The landing missed the marker.",
        },
      },
      360,
    );

    expect(failed.accepted).toBe(true);
    expect(failed.state.status).toBe("recoverable");
    expect(failed.state.failureCount).toBe(1);
    expect(failed.state.recoveryLaneId).toBe("jump-and-scout");
    expect(
      readUnboundPassage(failed.state, "utility-tractor").explanation,
    ).toContain("landing missed");

    const rejectedRecovery = resolveUnboundPassageCommand(
      failed.state,
      {
        type: "recover",
        actorRigId: "marsh-skimmer",
        actorCapabilities: ["hover"],
      },
      420,
    );
    expect(rejectedRecovery.accepted).toBe(false);
    expect(rejectedRecovery.reason).toContain("winch");

    const recovered = resolveUnboundPassageCommand(
      failed.state,
      {
        type: "recover",
        actorRigId: "utility-tractor",
        actorCapabilities: ["tow", "winch"],
      },
      480,
    );
    expect(recovered.accepted).toBe(true);
    expect(recovered.state.status).toBe("blocked");
    expect(recovered.state.failureCount).toBe(1);
    expect(recovered.event?.type).toBe("passage-recovered");
  });

  it("fails closed for missing capabilities and repeated attempts", () => {
    const blocked = createUnboundPassageState();
    const missingCapability = resolveUnboundPassageCommand(
      blocked,
      {
        type: "resolve-attempt",
        actorRigId: "marsh-skimmer",
        actorCapabilities: ["hover"],
        laneId: "grade-and-brace",
        outcome: { kind: "opened" },
      },
      1,
    );
    expect(missingCapability.accepted).toBe(false);
    expect(missingCapability.state).toEqual(blocked);

    const opened = resolveUnboundPassageCommand(
      blocked,
      {
        type: "resolve-attempt",
        actorRigId: "utility-tractor",
        actorCapabilities: ["plough"],
        laneId: "grade-and-brace",
        outcome: { kind: "opened" },
      },
      2,
    );
    const repeated = resolveUnboundPassageCommand(
      opened.state,
      {
        type: "resolve-attempt",
        actorRigId: "toy-buggy",
        actorCapabilities: ["jump"],
        laneId: "jump-and-scout",
        outcome: { kind: "opened" },
      },
      3,
    );
    expect(repeated.accepted).toBe(false);
    expect(repeated.reason).toContain("already open");
  });

  it("fails closed instead of normalizing an invalid event tick", () => {
    const blocked = createUnboundPassageState();
    const transition = resolveUnboundPassageCommand(
      blocked,
      {
        type: "resolve-attempt",
        actorRigId: "utility-tractor",
        actorCapabilities: ["plough"],
        laneId: "grade-and-brace",
        outcome: { kind: "opened" },
      },
      Number.NaN,
    );

    expect(transition.accepted).toBe(false);
    expect(transition.state).toEqual(blocked);
    expect(transition.reason).toContain("integer tick");
  });

  it("round-trips valid state and recovers malformed persistence", () => {
    const opened = resolveUnboundPassageCommand(
      createUnboundPassageState(),
      {
        type: "resolve-attempt",
        actorRigId: "utility-tractor",
        actorCapabilities: ["plough"],
        laneId: "grade-and-brace",
        outcome: { kind: "opened" },
      },
      12,
    ).state;

    expect(
      restoreUnboundPassage(JSON.parse(serializeUnboundPassage(opened))),
    ).toEqual(opened);
    expect(
      restoreUnboundPassage({
        schemaVersion: 999,
        passageId: "unbound-passage-01",
        status: "open",
        revision: 2,
      }),
    ).toEqual(createUnboundPassageState());

    expect(
      restoreUnboundPassage({
        ...createUnboundPassageState(),
        status: "recoverable",
        revision: 1,
        failureCount: 1,
        recoveryReason: "missing lane provenance",
      }),
    ).toEqual(createUnboundPassageState());
  });
});
