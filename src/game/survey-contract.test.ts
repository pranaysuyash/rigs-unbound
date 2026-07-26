import { describe, expect, it } from "vitest";

import {
  PRIMARY_ACTION_COMMAND_VERSION,
  createInitialState,
  performPrimaryAction,
  publicState,
  recoverState,
  resolvePrimaryAction,
} from "./state";
import { GameWorld } from "./gameworld";
import { SAVE_SCHEMA_VERSION } from "./contracts";
import { surveyRouteTargets } from "./activities";
import { HOME_SITE } from "./world";
import type { GameState } from "./contracts";

function atHome(state: GameState, rigId: GameState["activeRigId"]): void {
  state.activeRigId = rigId;
  const rig = state.rigs[rigId];
  rig.x = HOME_SITE.x;
  rig.z = HOME_SITE.z;
}

function takeContract(state: GameState, world: GameWorld) {
  return performPrimaryAction(state, world, {
    version: PRIMARY_ACTION_COMMAND_VERSION,
    type: "primary-action",
    actorId: state.activeRigId,
  });
}

describe("survey contract", () => {
  it("is offered to a machine that can survey", () => {
    const world = new GameWorld("UNBOUND-260725");
    const state = createInitialState(world.seed);
    atHome(state, "marsh-skimmer");

    const resolution = resolvePrimaryAction(state, world);
    expect(resolution.kind).toBe("take-survey-contract");
  });

  it("refuses a machine that cannot, and says why", () => {
    /*
     * The point of the whole activity: only Drift carries `survey`, so taking a
     * survey contract is a decision about which machine you are, not a menu choice.
     * The refusal has to be explained rather than absent, or the player just sees a
     * prompt that never appears.
     */
    const world = new GameWorld("UNBOUND-260725");
    const state = createInitialState(world.seed);
    atHome(state, "utility-tractor");

    const resolution = resolvePrimaryAction(state, world);
    expect(resolution.kind).toBe("none");
    expect(resolution.label).toBe("Survey required");
    expect(resolution.affordance?.reasonCode).toBe("missing-capability");
    expect(resolution.affordance?.mismatchSource).toBe("capability");
  });

  it("is not offered away from the board", () => {
    const world = new GameWorld("UNBOUND-260725");
    const state = createInitialState(world.seed);
    atHome(state, "marsh-skimmer");
    state.rigs["marsh-skimmer"].x = HOME_SITE.x + 400;

    expect(resolvePrimaryAction(state, world).kind).not.toBe(
      "take-survey-contract",
    );
  });

  it("starts the clock in diegetic minutes when taken", () => {
    const world = new GameWorld("UNBOUND-260725");
    const state = createInitialState(world.seed);
    atHome(state, "marsh-skimmer");
    state.worldTimeMinutes = 512;

    const event = takeContract(state, world);
    expect(event.outcome).toBe("accepted");
    expect(state.surveyRoute.status).toBe("active");
    expect(state.surveyRoute.startedAtMinutes).toBe(512);
    expect(state.surveyRoute.sighted).toEqual([]);
  });

  it("is not offered twice while one is running", () => {
    const world = new GameWorld("UNBOUND-260725");
    const state = createInitialState(world.seed);
    atHome(state, "marsh-skimmer");
    takeContract(state, world);

    expect(resolvePrimaryAction(state, world).kind).not.toBe(
      "take-survey-contract",
    );
  });

  it("publishes progress the HUD can read without recomputing it", () => {
    const world = new GameWorld("UNBOUND-260725");
    const state = createInitialState(world.seed);
    atHome(state, "marsh-skimmer");
    state.worldTimeMinutes = 300;
    takeContract(state, world);

    const exposed = publicState(state, world) as {
      surveyRoute: {
        status: string;
        targets: string[];
        sighted: string[];
        minutesRemaining: number | null;
      };
    };
    expect(exposed.surveyRoute.status).toBe("active");
    expect(exposed.surveyRoute.targets).toEqual(surveyRouteTargets());
    expect(exposed.surveyRoute.minutesRemaining).toBeGreaterThan(0);
  });

  it("survives a save round trip with its sightings intact", () => {
    const world = new GameWorld("UNBOUND-260725");
    const state = createInitialState(world.seed);
    atHome(state, "marsh-skimmer");
    takeContract(state, world);
    state.surveyRoute = {
      ...state.surveyRoute,
      sighted: [surveyRouteTargets()[0]!],
      bestSightedCount: 1,
    };

    const restored = recoverState(JSON.parse(JSON.stringify(state)));
    expect(restored).not.toBeNull();
    expect(restored!.surveyRoute.status).toBe("active");
    expect(restored!.surveyRoute.sighted).toEqual([surveyRouteTargets()[0]]);
  });

  it("rejects a record claiming completion it never earned", () => {
    // Same discipline as the relay: an activity that cannot be true is a corrupt
    // record, and restoring it produces a contract that can never resolve.
    const world = new GameWorld("UNBOUND-260725");
    const state = createInitialState(world.seed);
    const corrupt = JSON.parse(JSON.stringify(state));
    corrupt.surveyRoute = {
      id: "survey-route",
      status: "complete",
      startedAtMinutes: 10,
      sighted: [],
      bestSightedCount: 0,
    };

    expect(recoverState(corrupt)).toBeNull();
  });

  it("gives a record from before survey contracts a fresh one", () => {
    const world = new GameWorld("UNBOUND-260725");
    const state = createInitialState(world.seed);
    const older = JSON.parse(JSON.stringify(state));
    older.schemaVersion = SAVE_SCHEMA_VERSION - 1;
    delete older.surveyRoute;

    const restored = recoverState(older);
    expect(restored).not.toBeNull();
    expect(restored!.surveyRoute.status).toBe("ready");
    expect(restored!.surveyRoute.sighted).toEqual([]);
  });
});
