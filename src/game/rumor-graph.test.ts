import { describe, expect, it } from "vitest";
import { CARGO_DELIVERY, CARGO_PICKUP } from "./contracts";
import { deriveRumorGraph } from "./rumor-graph";
import { createInitialState } from "./state";
import { WORLD_SITES } from "./world";

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

  it("derives site and relay facts from canonical world and activity definitions", () => {
    const graph = deriveRumorGraph(createInitialState("canonical-graph"));

    for (const site of WORLD_SITES) {
      expect(graph.nodes[site.id]).toMatchObject({
        title: site.name,
        x: site.x,
        z: site.z,
        elevation: site.elevation,
        biome: site.biome,
        verb: site.verb,
      });
    }

    expect(graph.nodes["cargo-relay-route"]).toMatchObject({
      x: (CARGO_PICKUP.x + CARGO_DELIVERY.x) / 2,
      z: (CARGO_PICKUP.z + CARGO_DELIVERY.z) / 2,
    });
    expect(graph.edges).toContainEqual(
      expect.objectContaining({
        id: "cargo-to-delivery",
        toId: CARGO_DELIVERY.siteId,
      }),
    );
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

  it("spreads material knowledge from an encountered settlement without discovering its destination", () => {
    const state = createInitialState("SOUNDER-LINE");
    state.settlements["sunken-flats"] = {
      ...state.settlements["sunken-flats"],
      contributions: [
        {
          responseId: "sunken-flats:sound-crossing",
          materialEffectId: "sunken-flats:sounded-crossing",
          capability: "survey",
          createdAtWorldMinutes: 880,
        },
      ],
    };

    const unknownSourceGraph = deriveRumorGraph(state);
    expect(unknownSourceGraph.nodes["marsh-depot"]?.status).toBe(
      "undiscovered",
    );

    state.discoveries.push({ id: "sunken-flats", discoveredAt: 920 });
    const graph = deriveRumorGraph(state);

    expect(graph.nodes["marsh-depot"]?.status).toBe("rumored");
    expect(graph.nodes["marsh-depot"]?.description).toContain("depth reading");
    expect(graph.edges).toContainEqual(
      expect.objectContaining({
        id: "material-effect:sunken-flats:sounded-crossing",
        type: "community_lead",
        active: true,
      }),
    );
    expect(state.discoveries.some((entry) => entry.id === "marsh-depot")).toBe(
      false,
    );
  });
});
