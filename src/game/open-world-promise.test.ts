import { describe, expect, it } from "vitest";
import {
  createOpenWorldPromise,
  openWorldPromiseNarration,
  recoverOpenWorldPromise,
  resolveOpenWorldPromise,
  type OpenWorldPromiseInputs,
} from "./open-world-promise";

function inputs(
  overrides: Partial<OpenWorldPromiseInputs> = {},
): OpenWorldPromiseInputs {
  return {
    firstNightResolved: true,
    waterworksResolved: true,
    causewayReopened: true,
    ...overrides,
  };
}

// Regression: FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md §5 names the finale as the
// slice's proof criterion ("the slice ends with the player choosing the next
// contract — not a cutscene"). Before this module, nothing in the runtime
// ever transitioned into an epilogue state, so this test would have failed
// against every prior build: the promise would never reveal, no matter what
// the player did.
describe("resolveOpenWorldPromise", () => {
  it("stays pending until all three prior beats are resolved", () => {
    expect(
      resolveOpenWorldPromise(
        createOpenWorldPromise(),
        1200,
        inputs({ firstNightResolved: false }),
      ).status,
    ).toBe("pending");
    expect(
      resolveOpenWorldPromise(
        createOpenWorldPromise(),
        1200,
        inputs({ waterworksResolved: false }),
      ).status,
    ).toBe("pending");
    expect(
      resolveOpenWorldPromise(
        createOpenWorldPromise(),
        1200,
        inputs({ causewayReopened: false }),
      ).status,
    ).toBe("pending");
  });

  it("reveals once all three are true", () => {
    const revealed = resolveOpenWorldPromise(
      createOpenWorldPromise(),
      1200,
      inputs(),
    );
    expect(revealed.status).toBe("revealed");
    expect(revealed.revealedAtWorldMinutes).toBe(1200);
  });

  it("resolves exactly once and ignores later calls, even with different inputs", () => {
    const first = resolveOpenWorldPromise(
      createOpenWorldPromise(),
      1200,
      inputs(),
    );
    const second = resolveOpenWorldPromise(
      first,
      5000,
      inputs({ firstNightResolved: false }),
    );
    expect(second).toEqual(first);
    expect(second.status).toBe("revealed");
    expect(second.revealedAtWorldMinutes).toBe(1200);
  });

  it("records a non-negative timestamp even for a malformed negative input", () => {
    const revealed = resolveOpenWorldPromise(
      createOpenWorldPromise(),
      -5,
      inputs(),
    );
    expect(revealed.revealedAtWorldMinutes).toBe(0);
  });
});

describe("openWorldPromiseNarration", () => {
  it("is null before the promise reveals", () => {
    expect(openWorldPromiseNarration(createOpenWorldPromise())).toBeNull();
  });

  it("names the causeway, Marsh Depot, and Launch Ridge once revealed", () => {
    const revealed = resolveOpenWorldPromise(
      createOpenWorldPromise(),
      1200,
      inputs(),
    );
    const narration = openWorldPromiseNarration(revealed);
    expect(narration).not.toBeNull();
    expect(narration).toContain("causeway");
    expect(narration).toContain("Marsh Depot");
    expect(narration).toContain("Launch Ridge");
  });
});

describe("recoverOpenWorldPromise", () => {
  it("round-trips a revealed record exactly", () => {
    const revealed = resolveOpenWorldPromise(
      createOpenWorldPromise(),
      1200,
      inputs(),
    );
    expect(
      recoverOpenWorldPromise(JSON.parse(JSON.stringify(revealed))),
    ).toEqual(revealed);
  });

  it("falls back to pending for missing, malformed, or foreign records", () => {
    expect(recoverOpenWorldPromise(undefined)).toEqual(
      createOpenWorldPromise(),
    );
    expect(recoverOpenWorldPromise(null)).toEqual(createOpenWorldPromise());
    expect(
      recoverOpenWorldPromise({ id: "first-night-threat", status: "revealed" }),
    ).toEqual(createOpenWorldPromise());
  });
});
