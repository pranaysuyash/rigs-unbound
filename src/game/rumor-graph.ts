/**
 * Rumor Graph Kernel: The interconnected discovery topology for Rigs Unbound.
 *
 * Inspired by Outer Wilds, this module maps the relationship between World Sites,
 * vehicle capabilities, module unlocks, and cargo relay routes.
 *
 * It is pure and deterministic: given a GameState, it computes the exact status
 * of all nodes and edges in the exploration web.
 */

import type { BiomeId } from "./world";
import type { GameState, RigCapability } from "./contracts";

export type RumorNodeType = "site" | "module" | "cargo_route" | "hazard_gate";
export type RumorNodeStatus =
  "undiscovered" | "rumored" | "visited" | "completed";

export interface RumorNode {
  id: string;
  type: RumorNodeType;
  title: string;
  description: string;
  biome?: BiomeId;
  siteId?: string;
  x: number;
  z: number;
  elevation?: number;
  requiredCapability?: RigCapability;
  status: RumorNodeStatus;
  /** Primary reward or verb promised by this node. */
  verb?: string;
}

export type RumorEdgeType =
  "leads_to" | "requires_capability" | "unlocks_module" | "cargo_route";

export interface RumorEdge {
  id: string;
  fromId: string;
  toId: string;
  type: RumorEdgeType;
  label?: string;
  active: boolean;
}

export interface RumorGraph {
  nodes: Record<string, RumorNode>;
  edges: RumorEdge[];
  stats: {
    totalNodes: number;
    discoveredCount: number;
    completedCount: number;
  };
}

/** Static definition of all rumor nodes in the game world. */
const GRAPH_NODES_DEF: Omit<RumorNode, "status">[] = [
  {
    id: "home-silo",
    type: "site",
    title: "Home Silo",
    description:
      "Central workshop and home base. Equipped with repair pad and primary rig lab.",
    biome: "meadow",
    siteId: "home-silo",
    x: 0,
    z: 12,
    elevation: 1.8,
    verb: "restore",
  },
  {
    id: "long-furrow",
    type: "site",
    title: "Long Furrow",
    description:
      "Soft farmland terrace requiring plough attachment to till soil and cut irrigation channels.",
    biome: "farmland",
    siteId: "long-furrow",
    x: 18,
    z: -46,
    elevation: 1.1,
    requiredCapability: "plough",
    verb: "till",
  },
  {
    id: "quarry-shelf",
    type: "site",
    title: "Quarry Shelf",
    description:
      "High elevation rocky shelf with high-relief survey vantage point and heavy cargo depot.",
    biome: "highland",
    siteId: "quarry-shelf",
    x: 82,
    z: 44,
    elevation: 12,
    requiredCapability: "tow",
    verb: "haul",
  },
  {
    id: "salvage-yard",
    type: "site",
    title: "Rustline Salvage",
    description:
      "Badlands scrap depot rich in high-grade salvage nodes; requires heavy torque to haul scrap.",
    biome: "badlands",
    siteId: "salvage-yard",
    x: 148,
    z: -108,
    elevation: 9.5,
    requiredCapability: "winch",
    verb: "tow",
  },
  {
    id: "toy-grove",
    type: "site",
    title: "Toy Grove",
    description:
      "Dense forest basin sheltering agile light vehicles and high-grip agility trails.",
    biome: "grove",
    siteId: "toy-grove",
    x: 110,
    z: 148,
    elevation: 4.2,
    requiredCapability: "jump",
    verb: "shrink",
  },
  {
    id: "sunken-flats",
    type: "site",
    title: "Sunken Flats",
    description:
      "Flooded marsh basin where ordinary ground wheels stall; ford or hover capabilities required.",
    biome: "marsh",
    siteId: "sunken-flats",
    x: -126,
    z: -130,
    elevation: -1.5,
    requiredCapability: "hover",
    verb: "wade",
  },
  {
    id: "launch-ridge",
    type: "site",
    title: "Launch Ridge",
    description:
      "Impassable outer mountain boundary; highest elevation survey point overlooking the entire atlas.",
    biome: "highland",
    siteId: "launch-ridge",
    x: -150,
    z: 140,
    elevation: 45,
    requiredCapability: "survey",
    verb: "ascend",
  },
  {
    id: "cargo-relay-route",
    type: "cargo_route",
    title: "Overland Freight Corridor",
    description:
      "Active cargo relay contract connecting Home Silo to Quarry Shelf over steep highland tracks.",
    x: 41,
    z: 28,
    verb: "deliver",
  },
];

/** Static definition of rumor graph edges. */
const GRAPH_EDGES_DEF: Omit<RumorEdge, "active">[] = [
  {
    id: "home-to-longfurrow",
    fromId: "home-silo",
    toId: "long-furrow",
    type: "leads_to",
    label: "Farmland Track",
  },
  {
    id: "home-to-quarry",
    fromId: "home-silo",
    toId: "quarry-shelf",
    type: "leads_to",
    label: "Highland Ascent",
  },
  {
    id: "quarry-to-cargo",
    fromId: "quarry-shelf",
    toId: "cargo-relay-route",
    type: "cargo_route",
    label: "Cargo Supply Line",
  },
  {
    id: "quarry-to-salvage",
    fromId: "quarry-shelf",
    toId: "salvage-yard",
    type: "leads_to",
    label: "Badlands Ridge",
  },
  {
    id: "quarry-to-toy-grove",
    fromId: "quarry-shelf",
    toId: "toy-grove",
    type: "leads_to",
    label: "Grove Trail",
  },
  {
    id: "home-to-sunkenflats",
    fromId: "home-silo",
    toId: "sunken-flats",
    type: "requires_capability",
    label: "Ford / Hover Barrier",
  },
  {
    id: "sunken-to-launchridge",
    fromId: "sunken-flats",
    toId: "launch-ridge",
    type: "leads_to",
    label: "Boundary Ascent",
  },
];

/**
 * Derives the complete, deterministic RumorGraph for a given GameState.
 */
export function deriveRumorGraph(state: GameState): RumorGraph {
  const discoveredSet = new Set<string>(state.discoveries.map((d) => d.id));

  const nodes: Record<string, RumorNode> = {};

  let discoveredCount = 0;
  let completedCount = 0;

  for (const def of GRAPH_NODES_DEF) {
    let status: RumorNodeStatus = "undiscovered";

    // 1. Home Silo is always visited
    if (def.id === "home-silo") {
      status = "visited";
    } else if (discoveredSet.has(def.id)) {
      status = "visited";
    } else {
      // Check if neighboring node is visited to mark as rumored
      const incomingEdges = GRAPH_EDGES_DEF.filter((e) => e.toId === def.id);
      const isNeighborVisited = incomingEdges.some(
        (e) => e.fromId === "home-silo" || discoveredSet.has(e.fromId),
      );

      if (isNeighborVisited) {
        status = "rumored";
      }
    }

    // Special status logic for cargo relay route
    if (def.id === "cargo-relay-route") {
      if (state.cargoRelay.status === "complete") {
        status = "completed";
      } else if (state.cargoRelay.status === "active") {
        status = "visited";
      } else if (discoveredSet.has("quarry-shelf")) {
        status = "rumored";
      }
    }

    // Check completion criteria for sites (e.g. furrows for long-furrow)
    if (def.id === "long-furrow" && state.furrows.length >= 10) {
      status = "completed";
    }

    if (status !== "undiscovered") discoveredCount++;
    if (status === "completed") completedCount++;

    nodes[def.id] = {
      ...def,
      status,
    };
  }

  const edges: RumorEdge[] = GRAPH_EDGES_DEF.map((def) => {
    const fromNode = nodes[def.fromId];
    const toNode = nodes[def.toId];
    const active =
      fromNode &&
      toNode &&
      fromNode.status !== "undiscovered" &&
      toNode.status !== "undiscovered";

    return {
      ...def,
      active: Boolean(active),
    };
  });

  return {
    nodes,
    edges,
    stats: {
      totalNodes: Object.keys(nodes).length,
      discoveredCount,
      completedCount,
    },
  };
}
