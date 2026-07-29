/**
 * Rumor Graph Kernel: The interconnected discovery topology for Rigs Unbound.
 *
 * Inspired by Outer Wilds, this module maps the relationship between World Sites,
 * vehicle capabilities, module unlocks, and cargo relay routes.
 *
 * It is pure and deterministic: given a GameState, it computes the exact status
 * of all nodes and edges in the exploration web.
 */

import { WORLD_SITES, type BiomeId } from "./world";
import {
  CARGO_DELIVERY,
  CARGO_PICKUP,
  type GameState,
  type RigCapability,
} from "./contracts";
import { deriveSettlementWorldLeads } from "./settlement-needs";

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
  | "leads_to"
  | "requires_capability"
  | "unlocks_module"
  | "cargo_route"
  | "community_lead";

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

/** Rumor-specific enrichment; spatial site facts remain owned by `WORLD_SITES`. */
const SITE_RUMOR_DETAILS: Readonly<
  Record<string, Pick<RumorNode, "description" | "requiredCapability">>
> = {
  "home-silo": {
    description:
      "Central workshop and home base. Equipped with repair pad and primary rig lab.",
  },
  "long-furrow": {
    description:
      "Soft farmland terrace requiring plough attachment to till soil and cut irrigation channels.",
    requiredCapability: "plough",
  },
  "quarry-shelf": {
    description:
      "High elevation rocky shelf with high-relief survey vantage point and heavy cargo depot.",
    requiredCapability: "tow",
  },
  "salvage-yard": {
    description:
      "Badlands scrap depot rich in high-grade salvage nodes; requires heavy torque to haul scrap.",
    requiredCapability: "winch",
  },
  "toy-grove": {
    description:
      "Dense forest basin sheltering agile light vehicles and high-grip agility trails.",
    requiredCapability: "jump",
  },
  "sunken-flats": {
    description:
      "Flooded marsh basin where ordinary ground wheels stall; ford or hover capabilities required.",
    requiredCapability: "hover",
  },
  "launch-ridge": {
    description:
      "Impassable outer mountain boundary; highest elevation survey point overlooking the entire atlas.",
    requiredCapability: "survey",
  },
};

const SITE_NODES_DEF: readonly Omit<RumorNode, "status">[] = WORLD_SITES.map(
  (site) => {
    const details = SITE_RUMOR_DETAILS[site.id];
    return {
      id: site.id,
      type: "site",
      title: site.name,
      description:
        details?.description ?? `A ${site.biome} opportunity in the field.`,
      biome: site.biome,
      siteId: site.id,
      x: site.x,
      z: site.z,
      elevation: site.elevation,
      ...(details?.requiredCapability
        ? { requiredCapability: details.requiredCapability }
        : {}),
      verb: site.verb,
    };
  },
);

/** Static graph-only nodes; their location derives from the activity contract. */
const GRAPH_NODES_DEF: readonly Omit<RumorNode, "status">[] = [
  ...SITE_NODES_DEF,
  {
    id: "cargo-relay-route",
    type: "cargo_route",
    title: "Overland Freight Corridor",
    description:
      "Active cargo relay from the field pickup to the Long Furrow delivery terrace.",
    x: (CARGO_PICKUP.x + CARGO_DELIVERY.x) / 2,
    z: (CARGO_PICKUP.z + CARGO_DELIVERY.z) / 2,
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
    id: "home-to-cargo",
    fromId: "home-silo",
    toId: "cargo-relay-route",
    type: "cargo_route",
    label: "Relay pickup",
  },
  {
    id: "cargo-to-delivery",
    fromId: "cargo-relay-route",
    toId: CARGO_DELIVERY.siteId,
    type: "cargo_route",
    label: "Freight delivery",
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
  const communityLeads = deriveSettlementWorldLeads(state);
  const communityLeadByTarget = new Map(
    communityLeads.map((lead) => [lead.targetSiteId, lead]),
  );

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

      // A community may name a real place without claiming that the player has
      // seen it. This is earned local knowledge, not a discovery or route gate.
      if (communityLeadByTarget.has(def.id)) {
        status = "rumored";
      }
    }

    // Special status logic for cargo relay route
    if (def.id === "cargo-relay-route") {
      if (state.cargoRelay.status === "complete") {
        status = "completed";
      } else if (state.cargoRelay.status === "active") {
        status = "visited";
      }
    }

    // Check completion criteria for sites (e.g. furrows for long-furrow)
    if (def.id === "long-furrow" && state.furrows.length >= 10) {
      status = "completed";
    }

    if (status !== "undiscovered") discoveredCount++;
    if (status === "completed") completedCount++;

    const communityLead = communityLeadByTarget.get(def.id);
    nodes[def.id] = {
      ...def,
      ...(communityLead && status === "rumored"
        ? { description: communityLead.description }
        : {}),
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

  const communityLeadEdges: RumorEdge[] = communityLeads.map((lead) => {
    const fromNode = nodes[lead.sourceSiteId];
    const toNode = nodes[lead.targetSiteId];
    return {
      id: lead.id,
      fromId: lead.sourceSiteId,
      toId: lead.targetSiteId,
      type: "community_lead",
      label: lead.mapLabel,
      active: Boolean(
        fromNode &&
        toNode &&
        fromNode.status !== "undiscovered" &&
        toNode.status !== "undiscovered",
      ),
    };
  });

  return {
    nodes,
    edges: [...edges, ...communityLeadEdges],
    stats: {
      totalNodes: Object.keys(nodes).length,
      discoveredCount,
      completedCount,
    },
  };
}
