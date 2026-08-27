/**
 * Observability-contract tests for the slice-beat exposure in publicState.
 *
 * Background (2026-08-25 evidence-integrity finding): the complete-slice
 * browser acceptance harness previously read `firstNightThreatResolved` and
 * `openWorldPromiseFinaleRevealed` from `render_game_to_text()` — fields that
 * did not exist — so its night-threat and finale steps passed vacuously.
 * These tests pin the real exposed shape so the contract cannot silently
 * regress again.
 */
import { describe, expect, it } from "vitest";

import { GameWorld } from "./gameworld";
import { createInitialState, publicState, settleWorld } from "./state";

function scenario() {
  const state = createInitialState("PUBLIC-STATE-CONTRACT");
  const world = new GameWorld("PUBLIC-STATE-CONTRACT");
  settleWorld(state, world);
  return { state, world };
}

describe("publicState slice-beat exposure", () => {
  it("exposes firstNightThreat status/variant on a fresh save", () => {
    const { state, world } = scenario();
    const snapshot = publicState(state, world) as {
      firstNightThreat: {
        status: string;
        variant: string | null;
        resolvedAtWorldMinutes: number | null;
      };
    };
    expect(snapshot.firstNightThreat).toBeDefined();
    expect(snapshot.firstNightThreat.status).toBe("pending");
    expect(snapshot.firstNightThreat.variant).toBeNull();
    expect(snapshot.firstNightThreat.resolvedAtWorldMinutes).toBeNull();
  });

  it("exposes openWorldPromise status on a fresh save", () => {
    const { state, world } = scenario();
    const snapshot = publicState(state, world) as {
      openWorldPromise: {
        status: string;
        revealedAtWorldMinutes: number | null;
      };
    };
    expect(snapshot.openWorldPromise).toBeDefined();
    expect(snapshot.openWorldPromise.status).toBe("pending");
    expect(snapshot.openWorldPromise.revealedAtWorldMinutes).toBeNull();
  });

  it("exposes campaignProgress preconditions on a fresh save", () => {
    const { state, world } = scenario();
    const snapshot = publicState(state, world) as {
      campaignProgress: {
        causewayReopened: boolean;
        waterworksChoice: string;
      };
    };
    expect(snapshot.campaignProgress).toBeDefined();
    expect(snapshot.campaignProgress.causewayReopened).toBe(false);
    expect(snapshot.campaignProgress.waterworksChoice).toBe("unresolved");
  });
});
