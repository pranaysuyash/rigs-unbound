import { describe, expect, it } from "vitest";
import {
  createInitialProgressionState,
  recordJourneyDeed,
  recordMasteryEvent,
  addInsight,
  completeMilestone,
  moduleSlotsForJourney,
} from "./progression";

describe("progression kernel", () => {
  it("initialises progression state with rig journeys", () => {
    const state = createInitialProgressionState(["utility-tractor", "toy-buggy"]);
    expect(state.insight).toBe(0);
    expect(state.completedMilestones).toEqual([]);
    expect(state.journeys["utility-tractor"]?.phase).toBe("found");
    expect(state.journeys["utility-tractor"]?.investment).toBe(0);
  });

  it("updates rig journey phase upon recording deed and investment", () => {
    let state = createInitialProgressionState(["utility-tractor"]);
    state = recordJourneyDeed(state, "utility-tractor", "deed-1", 60);

    const journey = state.journeys["utility-tractor"]!;
    expect(journey.investment).toBe(60);
    expect(journey.completedDeeds).toContain("deed-1");
    // stabilized phase requires investment >= 50 and deeds >= 1
    expect(journey.phase).toBe("stabilized");
    expect(moduleSlotsForJourney(journey.phase)).toBe(2);
  });

  it("advances mastery rank through situation events with diminishing returns", () => {
    let state = createInitialProgressionState(["toy-buggy"]);
    state = recordMasteryEvent(state, "toy-buggy", "tow", "situation-1");
    
    // First occurrence earns 10 points
    let mastery = state.mastery["toy-buggy"]?.["tow"]!;
    expect(mastery.points).toBe(10);
    expect(mastery.rank).toBe("novice");
    expect(mastery.situations["situation-1"]).toBe(1);

    // Second occurrence earns Math.max(1, Math.floor(10 / (1 + 1))) = 5 points
    state = recordMasteryEvent(state, "toy-buggy", "tow", "situation-1");
    mastery = state.mastery["toy-buggy"]?.["tow"]!;
    expect(mastery.points).toBe(15);
    expect(mastery.situations["situation-1"]).toBe(2);
  });

  it("accumulates account insight", () => {
    let state = createInitialProgressionState();
    state = addInsight(state, 42);
    expect(state.insight).toBe(42);
  });

  it("records completed milestones", () => {
    let state = createInitialProgressionState();
    state = completeMilestone(state, "milestone-1");
    expect(state.completedMilestones).toContain("milestone-1");
  });
});
