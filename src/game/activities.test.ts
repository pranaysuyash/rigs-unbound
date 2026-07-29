import { describe, expect, it } from "vitest";

import {
  ACTIVITY_CONTRACT_VERSION,
  ACTIVITY_DEFINITIONS,
  SURVEY_ROUTE_WINDOW_MINUTES,
  activityDefinition,
  createSurveyRouteState,
  evaluateSurveyRoute,
  surveyRouteMinutesRemaining,
  validateActivityDefinitions,
  type ActivityDefinition,
  type SurveyRouteState,
} from "./activities";
import type { WorldSiteId } from "./world";

describe("activity registry", () => {
  it("accepts the authored registry", () => {
    expect(validateActivityDefinitions()).toEqual([]);
  });

  it("carries every authored activity, so there is one activity truth path", () => {
    // The readiness contract requires each new activity to join the existing
    // registry rather than migrate to a parallel one; a registry missing an
    // authored activity would be the second truth path it was written to
    // prevent.
    expect(ACTIVITY_DEFINITIONS.map((entry) => entry.id).sort()).toEqual([
      "cargo-relay",
      "road-rivalry",
      "survey-route",
    ]);
  });

  it("binds the two activities to different meanings of the same terrain", () => {
    // The whole multi-genre thesis in one assertion: same world, same kernel,
    // different binding. If these ever collapse to one value the project has
    // stopped being multi-genre and is just one activity with two objectives.
    expect(activityDefinition("cargo-relay").binding).toBe("haul");
    expect(activityDefinition("survey-route").binding).toBe("survey");
  });

  const base: ActivityDefinition = {
    id: "survey-route",
    version: ACTIVITY_CONTRACT_VERSION,
    name: "probe",
    premise: "probe",
    binding: "survey",
    requiredCapabilities: ["survey"],
    worldRefs: ["quarry-shelf"],
    reward: { salvage: 1, insight: 1, journeyInvestment: 1 },
  };

  it("rejects an anchor the authored world does not have", () => {
    const problems = validateActivityDefinitions([
      { ...base, worldRefs: ["not-a-site" as WorldSiteId] },
    ]);
    expect(problems).toHaveLength(1);
    expect(problems[0]?.problem).toContain("unknown world anchor");
  });

  it("rejects a capability outside the machine vocabulary", () => {
    const problems = validateActivityDefinitions([
      // Cast: the point is to catch a value that survives an unsafe edit.
      { ...base, requiredCapabilities: ["telepathy" as never] },
    ]);
    expect(problems[0]?.problem).toContain("unknown capability");
  });

  it("rejects an activity every machine qualifies for", () => {
    const problems = validateActivityDefinitions([
      { ...base, requiredCapabilities: [] },
    ]);
    expect(problems[0]?.problem).toBe("no required capability");
  });

  it("rejects duplicate ids", () => {
    const problems = validateActivityDefinitions([base, base]);
    expect(
      problems.some((entry) => entry.problem === "duplicate activity id"),
    ).toBe(true);
  });

  it("rejects an unsupported contract version", () => {
    const problems = validateActivityDefinitions([
      { ...base, version: 99 as typeof ACTIVITY_CONTRACT_VERSION },
    ]);
    expect(problems[0]?.problem).toContain("unsupported contract version");
  });
});

describe("survey route rules", () => {
  const TARGETS: readonly WorldSiteId[] = [
    "quarry-shelf",
    "toy-grove",
    "launch-ridge",
  ];

  function running(
    overrides: Partial<SurveyRouteState> = {},
  ): SurveyRouteState {
    return {
      ...createSurveyRouteState(),
      status: "active",
      startedAtMinutes: 400,
      ...overrides,
    };
  }

  it("does nothing before the contract is taken", () => {
    const state = createSurveyRouteState();
    const result = evaluateSurveyRoute(state, TARGETS, new Set(TARGETS), 400);
    expect(result.state).toBe(state);
    expect(result.completed).toBe(false);
  });

  it("is won by sight alone, without the player ever arriving", () => {
    // The mechanical claim of the survey binding: no target is entered, no
    // discovery is made, and the contract still completes.
    const result = evaluateSurveyRoute(
      running(),
      TARGETS,
      new Set(TARGETS),
      430,
    );
    expect(result.completed).toBe(true);
    expect(result.state.status).toBe("complete");
    expect(result.newlySighted).toEqual(TARGETS);
  });

  it("accumulates sightings across evaluations without double counting", () => {
    const first = evaluateSurveyRoute(
      running(),
      TARGETS,
      new Set<WorldSiteId>(["quarry-shelf"]),
      410,
    );
    expect(first.completed).toBe(false);
    expect(first.state.sighted).toEqual(["quarry-shelf"]);

    const second = evaluateSurveyRoute(
      first.state,
      TARGETS,
      new Set<WorldSiteId>(["quarry-shelf", "toy-grove"]),
      420,
    );
    expect(second.newlySighted).toEqual(["toy-grove"]);
    expect(second.state.sighted).toEqual(["quarry-shelf", "toy-grove"]);
  });

  it("does not lose a sighting when the signal goes back out of view", () => {
    // Terrain hides signals as the machine moves. A contract records what was
    // seen, not what is visible right now, or driving downhill would undo work.
    const first = evaluateSurveyRoute(
      running(),
      TARGETS,
      new Set<WorldSiteId>(["quarry-shelf"]),
      410,
    );
    const second = evaluateSurveyRoute(
      first.state,
      TARGETS,
      new Set<WorldSiteId>(),
      415,
    );
    expect(second.state.sighted).toEqual(["quarry-shelf"]);
  });

  it("fails once the window closes with work outstanding", () => {
    const result = evaluateSurveyRoute(
      running(),
      TARGETS,
      new Set<WorldSiteId>(["quarry-shelf"]),
      400 + SURVEY_ROUTE_WINDOW_MINUTES,
    );
    expect(result.failed).toBe(true);
    expect(result.state.status).toBe("failed");
  });

  it("counts the last sighting on the closing minute as a win", () => {
    const result = evaluateSurveyRoute(
      running({ sighted: ["quarry-shelf", "toy-grove"] }),
      TARGETS,
      new Set(TARGETS),
      400 + SURVEY_ROUTE_WINDOW_MINUTES,
    );
    expect(result.completed).toBe(true);
    expect(result.failed).toBe(false);
  });

  it("reports the remaining window only while a contract is running", () => {
    expect(
      surveyRouteMinutesRemaining(createSurveyRouteState(), 400),
    ).toBeNull();
    expect(surveyRouteMinutesRemaining(running(), 490)).toBe(
      SURVEY_ROUTE_WINDOW_MINUTES - 90,
    );
    expect(surveyRouteMinutesRemaining(running(), 9_999)).toBe(0);
  });
});
