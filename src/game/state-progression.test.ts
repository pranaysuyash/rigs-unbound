import { describe, expect, it } from "vitest";
import { publicState, createInitialState } from "./state";
import { GameWorld } from "./gameworld";
import {
  addInsight,
  recordJourneyDeed,
  recordMasteryEvent,
} from "./progression";

describe("game state initialisation", () => {
  it("publishes derived account and restoration progression", () => {
    const world = new GameWorld("STATE-TEST");
    const state = createInitialState(world.seed);

    // Add insight
    state.progression = addInsight(state.progression, 42);
    // Add journey deed
    state.progression = recordJourneyDeed(
      state.progression,
      "utility-tractor",
      "deed-1",
      60,
    );
    // Add mastery event
    state.progression = recordMasteryEvent(
      state.progression,
      "utility-tractor",
      "tow",
      "situation-1",
    );

    const snapshot = publicState(state, world) as {
      progression: {
        insight: number;
        journeys: Record<
          string,
          { phase: string; investment: number; allowedModuleSlots: number }
        >;
        mastery: Record<
          string,
          Record<string, { rank: string; points: number }>
        >;
      };
    };

    expect(snapshot.progression.insight).toBe(42);
    expect(snapshot.progression.journeys["utility-tractor"]?.phase).toBe(
      "stabilized",
    );
    expect(snapshot.progression.journeys["utility-tractor"]?.investment).toBe(
      60,
    );
    expect(
      snapshot.progression.journeys["utility-tractor"]?.allowedModuleSlots,
    ).toBe(2);
    expect(
      snapshot.progression.mastery["utility-tractor"]?.["tow"]?.points,
    ).toBe(10);
    expect(snapshot.progression.mastery["utility-tractor"]?.["tow"]?.rank).toBe(
      "novice",
    );
  });
});
