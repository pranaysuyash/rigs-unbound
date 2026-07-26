import { describe, expect, it } from "vitest";
import { deriveRumorGraph } from "./rumor-graph";
import { createInitialState } from "./state";

describe("rumor-graph kernel", () => {
  it("derives correct initial rumor graph with home silo visited and connected sites rumored", () => {
    const state = createInitialState("test-seed");
    const graph = deriveRumorGraph(state);

    expect(graph.nodes["home-silo"]?.status).toBe("visited");
    expect(graph.nodes["long-furrow"]?.status).toBe("rumored");
    expect(graph.nodes["quarry-shelf"]?.status).toBe("rumored");
    expect(graph.nodes["sunken-flats"]?.status).toBe("rumored");
    expect(graph.stats.totalNodes).toBeGreaterThan(5);
    expect(graph.stats.discoveredCount).toBeGreaterThanOrEqual(4);
  });

  it("updates site node to visited when present in state discoveries", () => {
    const state = createInitialState("test-seed");
    state.discoveries.push({
      id: "quarry-shelf",
      discoveredAt: 420,
    });

    const graph = deriveRumorGraph(state);

    expect(graph.nodes["quarry-shelf"]?.status).toBe("visited");
    // Quarry shelf neighbors should now be rumored
    expect(graph.nodes["salvage-yard"]?.status).toBe("rumored");
    expect(graph.nodes["toy-grove"]?.status).toBe("rumored");
  });

  it("activates connection edges between discovered nodes", () => {
    const state = createInitialState("test-seed");
    state.discoveries.push({
      id: "quarry-shelf",
      discoveredAt: 420,
    });

    const graph = deriveRumorGraph(state);
    const homeToQuarryEdge = graph.edges.find((e) => e.id === "home-to-quarry");

    expect(homeToQuarryEdge).toBeDefined();
    expect(homeToQuarryEdge?.active).toBe(true);
  });

  it("marks cargo relay route complete when cargoRelay.status is complete", () => {
    const state = createInitialState("test-seed");
    state.cargoRelay.status = "complete";

    const graph = deriveRumorGraph(state);
    expect(graph.nodes["cargo-relay-route"]?.status).toBe("completed");
  });
});
