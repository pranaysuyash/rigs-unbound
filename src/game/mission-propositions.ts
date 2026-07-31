/**
 * Mission Proposition System.
 *
 * Missions are *derived state* — recomputed from the current world state
 * every evaluation, never stored in the save file.  This makes the system
 * open to new mission types: adding a generator to the registry instantly
 * makes those missions visible whenever the world state qualifies.
 *
 * Design invariants:
 *   - Every generator is a pure function: (state, world, weather, time, visibleSites) → proposition[]
 *   - Propositions are not persisted.  The player's acceptance is tracked by
 *     the target mission binding (e.g. "cargo-relay" or "survey-route").
 *   - Future generators (courier, escort, expedition) are added to the registry
 *     without changing any existing code path.
 */

import { CAMPAIGN_CONTRACTS } from "./campaign";
import type { GameState, RigCapability } from "./contracts";
import type { ProgressionState } from "./progression";
import type { SettlementNeedOutcomeId } from "./settlement-needs";
import type { WorldSiteId } from "./world";
import { findSite } from "./world";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MissionBinding =
  /** Transport cargo from A to B (uses existing 'haul' binding under the hood). */
  | "delivery"
  /** Survey / line-of-sight contract (uses existing 'survey' binding). */
  | "survey"
  /** Salvage retrieval — go to a site, collect a cache. Not rig recovery. */
  | "salvage-retrieval"
  /** Fleet recovery — another rig is disabled and needs logistical assistance. */
  | "fleet-recovery"
  /** Place-specific field work, completed by an actual plough pass. */
  | "cultivation"
  /** Multi-site expedition — visit several points in a loop. */
  | "expedition";

export type MissionState = "available" | "active" | "completed" | "failed";

/**
 * Quest class per the Game Design Spine §5.
 *
 * "main" advances a campaign and claims the focus slot exclusively;
 * "side" is authored and optional; "local" is world-derived (the procedural
 * generators below); "hidden" only appears once its prerequisites are met;
 * "repeatable" never writes a completion deed; "emergent" is systems-driven.
 */
export type MissionClass =
  | "main"
  | "side"
  | "local"
  | "hidden"
  | "repeatable"
  | "emergent";

export const MISSION_CLASSES: readonly MissionClass[] = [
  "main",
  "side",
  "local",
  "hidden",
  "repeatable",
  "emergent",
];

/**
 * A quest-graph edge. Propositions whose prerequisites are unmet are not
 * offered at all — the graph gates visibility, not just acceptance.
 */
export type MissionPrerequisite =
  | { kind: "mission-completed"; missionId: string }
  | { kind: "discovery"; siteId: WorldSiteId }
  | { kind: "capability"; capability: RigCapability }
  | { kind: "insight"; min: number };

/** Mission ids whose completion deed exists in progression. */
export function completedMissionIds(
  progression: ProgressionState,
): ReadonlySet<string> {
  return new Set(
    Object.values(progression.journeys).flatMap((journey) =>
      journey.completedDeeds
        .filter((deed) => deed.startsWith("mission:"))
        .map((deed) => deed.slice("mission:".length)),
    ),
  );
}

/**
 * Evaluate a prerequisite list against current state. Pure and deterministic;
 * capability prerequisites read the active rig's base profile capabilities
 * via the mission's own `requiredCapabilities` at acceptance time, so here
 * "capability" gates visibility on the discovered world rather than the rig.
 */
export function prerequisitesMet(
  state: GameState,
  progression: ProgressionState,
  prerequisites: readonly MissionPrerequisite[],
): boolean {
  if (prerequisites.length === 0) return true;
  const completed = completedMissionIds(progression);
  const discovered = new Set(state.discoveries.map((d) => d.id));
  return prerequisites.every((prerequisite) => {
    switch (prerequisite.kind) {
      case "mission-completed":
        return completed.has(prerequisite.missionId);
      case "discovery":
        return discovered.has(prerequisite.siteId);
      case "capability":
        // Visibility-level capability gate: the mission is offered when any
        // owned rig could take it; hard enforcement stays in acceptMission.
        return true;
      case "insight":
        return progression.insight >= prerequisite.min;
    }
  });
}

/**
 * A mission proposition — what the player sees and can accept.
 *
 * Derived from the world state, never stored.  The same world state produces
 * the same propositions (deterministic).
 */
export interface MissionProposition {
  /** Deterministic id derived from seed + type + target. */
  id: string;
  binding: MissionBinding;
  /** Quest class; see MissionClass. */
  missionClass: MissionClass;
  /** Who asked: character/site/faction id, or null for world-derived. */
  giverId: string | null;
  /** Persisted community consequence applied only by mission lifecycle. */
  settlementOutcomeId?: SettlementNeedOutcomeId;
  /** Quest-graph edges that gate whether this proposition is offered. */
  prerequisites: readonly MissionPrerequisite[];
  title: string;
  /** One-line premise shown in mission select. */
  premise: string;
  /** Full briefing text. */
  briefing: string;
  /** Origin description (where to start). */
  origin: string;
  /** Destination or target description. */
  destination: string;
  /** Target site id this mission resolves against. */
  targetSiteId: WorldSiteId;
  /** World anchor ids this mission involves. */
  waypointIds: readonly WorldSiteId[];
  /** Minimum Insight required to see this proposition. */
  minInsight: number;
  /** Capabilities the active rig must have to accept. */
  requiredCapabilities: readonly RigCapability[];
  /** Reward in salvage. */
  rewardSalvage: number;
  /** Approximate difficulty label for display. */
  difficultyLabel: "standard" | "hard" | "extreme";
  state: MissionState;
}
// ---------------------------------------------------------------------------
// Generator interface
// ---------------------------------------------------------------------------

/**
 * A mission generator produces propositions from world state.
 * Add new generators to the registry below to make new mission types appear.
 */
export interface MissionGenerator {
  readonly binding: MissionBinding;
  generate(
    state: GameState,
    progression: ProgressionState,
    weatherPhase: string,
    visibleSites: ReadonlySet<WorldSiteId>,
  ): readonly MissionProposition[];
}

// ---------------------------------------------------------------------------
// Concrete generators
// ---------------------------------------------------------------------------

/**
 * Delivery generator — site-to-site cargo transport missions.
 *
 * Any two discovered sites generate a potential delivery mission when the
 * active rig has the `tow` capability.  More distant pairs pay more salvage.
 */
function generateDeliveryMissions(
  state: GameState,
  _progression: ProgressionState,
  _weatherPhase: string,
  visibleSites: ReadonlySet<WorldSiteId>,
): readonly MissionProposition[] {
  const discovered = new Set(state.discoveries.map((d) => d.id));
  const discoveredSites = [...discovered].filter((id) => visibleSites.has(id));

  if (discoveredSites.length < 2) return [];

  const proposals: MissionProposition[] = [];

  for (let i = 0; i < discoveredSites.length; i++) {
    for (let j = i + 1; j < discoveredSites.length; j++) {
      const originSite = findSite(discoveredSites[i]!);
      const destSite = findSite(discoveredSites[j]!);
      if (!originSite || !destSite) continue;

      const dx = destSite.x - originSite.x;
      const dz = destSite.z - originSite.z;
      const distance = Math.hypot(dx, dz);

      // Short hops are not worth the fuel.
      if (distance < 30) continue;

      // Cap at the biggest proposals so we don't flood.
      if (proposals.length >= 4) break;

      proposals.push({
        id: `delivery-${originSite.id}-${destSite.id}`,
        binding: "delivery",
        missionClass: "local",
        giverId: null,
        prerequisites: [],
        title: `${originSite.verb} → ${destSite.name}`,
        premise: `Transport supplies from ${originSite.name} to ${destSite.name}.`,
        briefing: `A ${Math.round(distance)}m haul through open country. ${destSite.name} needs these supplies before the next weather window closes.`,
        origin: originSite.name,
        destination: destSite.name,
        targetSiteId: destSite.id,
        waypointIds: [originSite.id, destSite.id],
        minInsight: 0,
        requiredCapabilities: ["tow"],
        rewardSalvage: Math.max(3, Math.round(distance / 15)),
        difficultyLabel: distance > 80 ? "hard" : "standard",
        state: "available",
      });
    }
  }

  return proposals;
}

/**
 * Recovery generator — salvage retrieval missions.
 *
 * From the current rig's position, suggests recovery at unvisited sites
 * that have salvage value.  The farther the site, the more valuable.
 */
function generateSalvageRetrievalMissions(
  state: GameState,
  _progression: ProgressionState,
  weatherPhase: string,
  visibleSites: ReadonlySet<WorldSiteId>,
): readonly MissionProposition[] {
  const discovered = new Set(state.discoveries.map((d) => d.id));
  const rig = state.rigs[state.activeRigId];

  const proposals: MissionProposition[] = [];

  for (const siteId of visibleSites) {
    if (proposals.length >= 3) break;
    if (discovered.has(siteId)) continue;

    const site = findSite(siteId);
    if (!site) continue;

    const dx = site.x - rig.x;
    const dz = site.z - rig.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 20) continue;

    const isStorm = weatherPhase === "storm" || weatherPhase === "rain";
    proposals.push({
      id: `salvage-retrieval-${siteId}`,
      binding: "salvage-retrieval",
      missionClass: "local",
      giverId: null,
      prerequisites: [],
      title: `Salvage: ${site.name}`,
      premise: `Unmarked signal at ${site.name}. Possible salvage cache.`,
      briefing: `A weak return signal is coming from near ${site.name} (${Math.round(distance)}m ${distance > 60 ? "— a serious journey" : "— a short trip"}). Could be salvage, equipment, or a lead on something bigger.`,
      origin: "Current position",
      destination: site.name,
      targetSiteId: site.id,
      waypointIds: [site.id],
      minInsight: 0,
      requiredCapabilities: [],
      rewardSalvage: isStorm
        ? Math.max(5, Math.round(distance / 10))
        : Math.max(3, Math.round(distance / 15)),
      difficultyLabel: isStorm ? "hard" : "standard",
      state: "available",
    });
  }

  return proposals;
}

/**
 * Survey generator — line-of-sight survey contracts.
 *
 * When the active rig has `survey` capability, suggests survey contracts
 * at clusters of undiscovered sites.
 */
function generateSurveyMissions(
  _state: GameState,
  _progression: ProgressionState,
  _weatherPhase: string,
  visibleSites: ReadonlySet<WorldSiteId>,
): readonly MissionProposition[] {
  const proposals: MissionProposition[] = [];

  // Group visible sites into survey regions by proximity.
  const unvisited: { id: WorldSiteId; site: ReturnType<typeof findSite> }[] =
    [];
  for (const siteId of visibleSites) {
    const site = findSite(siteId);
    if (site) unvisited.push({ id: siteId, site });
  }

  // Simple clustering: if we have 3+ unvisited sites, suggest a survey.
  if (unvisited.length >= 3) {
    const cluster = unvisited.slice(0, 5);
    const names = cluster.map((c) => c.site!.name).join(", ");

    proposals.push({
      id: `survey-${cluster[0]!.id}`,
      binding: "survey",
      missionClass: "local",
      giverId: null,
      prerequisites: [],
      title: `Survey: ${cluster[0]!.site!.name} region`,
      premise: `Sight and map ${cluster.length} signals in the ${cluster[0]!.site!.name} region.`,
      briefing: `Unsurveyed terrain near ${names}. A survey mast would resolve these signals from the high ground. ${cluster.length} targets within a manageable loop.`,
      origin: "Current position",
      destination: cluster[0]!.site!.name,
      targetSiteId: cluster[0]!.id,
      waypointIds: cluster.map((c) => c.id),
      minInsight: 1,
      requiredCapabilities: ["survey"],
      rewardSalvage: 5 + cluster.length * 2,
      difficultyLabel: cluster.length > 4 ? "hard" : "standard",
      state: "available",
    });
  }

  return proposals;
}

/**
 * Expedition generator — multi-site multi-objective missions.
 *
 * Becomes available at Rung 2+.  Generates a loop through several sites
 * the player hasn't visited, with higher rewards.
 */
function generateExpeditionMissions(
  state: GameState,
  progression: ProgressionState,
  _weatherPhase: string,
  visibleSites: ReadonlySet<WorldSiteId>,
): readonly MissionProposition[] {
  if (progression.insight < 2) return [];

  const discovered = new Set(state.discoveries.map((d) => d.id));
  const sites: { id: WorldSiteId; site: ReturnType<typeof findSite> }[] = [];

  for (const siteId of visibleSites) {
    const site = findSite(siteId);
    if (site && !discovered.has(siteId)) {
      sites.push({ id: siteId, site });
    }
  }

  if (sites.length < 2) return [];

  // Pick a start and loop through several sites.
  const loop = sites.slice(0, Math.min(4, sites.length));

  return [
    {
      id: `expedition-${loop[0]!.id}`,
      binding: "expedition",
      missionClass: "local",
      giverId: null,
      prerequisites: [],
      title: `Expedition: ${loop[0]!.site!.name} loop`,
      premise: `Visit ${loop.length} sites in a single expedition. Higher risk, higher reward.`,
      briefing: `A multi-site loop through ${loop.map((s) => s.site!.name).join(", ")}. ${loop.length} signals to resolve, each with potential salvage or discoveries. Prepare for extended field operations.`,
      origin: "Current position",
      destination: loop[loop.length - 1]!.site!.name,
      targetSiteId: loop[loop.length - 1]!.id,
      waypointIds: loop.map((s) => s.id),
      minInsight: 2,
      requiredCapabilities: [],
      rewardSalvage: 8 + loop.length * 4,
      difficultyLabel: "hard",
      state: "available",
    },
  ];
}

/**
 * Campaign generator — authored main-quest contracts.
 *
 * Derives class-"main" propositions from the authored CAMPAIGN_CONTRACTS
 * data. Chaining is expressed as quest-graph prerequisites (the follow-up
 * contracts require the relay contract's completion deed), so campaign
 * availability flows through the same lifecycle authority as every other
 * mission — `campaign.ts` supplies content, never a second quest system.
 */
const CAMPAIGN_GIVER_ID = "old-man";

/** Follow-up contracts unlock when the relay route is reopened. */
const CAMPAIGN_CHAIN_ROOT_ID = "contract-sunken-relay";

function campaignPrerequisites(
  contractId: string,
): readonly MissionPrerequisite[] {
  if (contractId === CAMPAIGN_CHAIN_ROOT_ID) return [];
  return [{ kind: "mission-completed", missionId: CAMPAIGN_CHAIN_ROOT_ID }];
}

function generateCampaignMissions(
  _state: GameState,
  _progression: ProgressionState,
  _weatherPhase: string,
  _visibleSites: ReadonlySet<WorldSiteId>,
): readonly MissionProposition[] {
  const proposals: MissionProposition[] = [];

  for (const contract of CAMPAIGN_CONTRACTS) {
    const origin = findSite(contract.originSiteId as WorldSiteId);
    const destination = findSite(contract.destinationSiteId as WorldSiteId);
    if (!origin || !destination) continue;

    proposals.push({
      id: contract.id,
      binding: "delivery",
      missionClass: "main",
      giverId: CAMPAIGN_GIVER_ID,
      settlementOutcomeId: contract.settlementOutcomeId,
      prerequisites: campaignPrerequisites(contract.id),
      title: contract.title,
      premise: contract.description,
      briefing: `${contract.description} The route runs ${origin.name} → ${destination.name}. Reopening it matters more than the pay.`,
      origin: origin.name,
      destination: destination.name,
      targetSiteId: destination.id,
      waypointIds: [origin.id, destination.id],
      minInsight: 0,
      requiredCapabilities: contract.requiredCapability
        ? [contract.requiredCapability]
        : [],
      rewardSalvage: Math.max(10, Math.round(contract.rewardScrap / 20)),
      difficultyLabel:
        contract.id === CAMPAIGN_CHAIN_ROOT_ID ? "standard" : "hard",
      state: "available",
    });
  }

  return proposals;
}

// ---------------------------------------------------------------------------
// Generator registry — add new generators here
// ---------------------------------------------------------------------------

const GENERATORS: readonly MissionGenerator[] = [
  { binding: "delivery" as const, generate: generateCampaignMissions },
  { binding: "delivery" as const, generate: generateDeliveryMissions },
  {
    binding: "salvage-retrieval" as const,
    generate: generateSalvageRetrievalMissions,
  },
  { binding: "survey" as const, generate: generateSurveyMissions },
  { binding: "expedition" as const, generate: generateExpeditionMissions },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Derive all currently available mission propositions from the world state.
 *
 * Pure — the same state always produces the same propositions.
 * Call this every tick/frame to keep the mission board current.
 *
 * @param state       Current GameState (rig positions, discoveries, etc.)
 * @param progression Current ProgressionState (for rung gating)
 * @param weatherPhase Current weather phase ("clear", "rain", "storm")
 * @param visibleSites Set of site ids the active rig can currently see
 * @returns An ordered list of propositions, sorted by distance (closest first)
 */
export function deriveMissions(
  state: GameState,
  progression: ProgressionState,
  weatherPhase: string,
  visibleSites: ReadonlySet<WorldSiteId>,
): readonly MissionProposition[] {
  const all: MissionProposition[] = [];

  for (const generator of GENERATORS) {
    const generated = generator.generate(
      state,
      progression,
      weatherPhase,
      visibleSites,
    );
    for (const prop of generated) {
      if (progression.insight < prop.minInsight) continue;
      if (!prerequisitesMet(state, progression, prop.prerequisites)) continue;
      all.push(prop);
    }
  }

  const completed = completedMissionIds(progression);
  const activeIds = new Set<string>(
    state.activeSideMissions.map((mission) => mission.id),
  );
  if (state.activeMission) activeIds.add(state.activeMission.id);
  const lifecycleAware = all
    .filter(
      (mission) =>
        mission.missionClass === "repeatable" || !completed.has(mission.id),
    )
    .map((mission) => ({
      ...mission,
      state: activeIds.has(mission.id) ? ("active" as const) : mission.state,
    }));

  // Sort by proximity to the active rig.
  const rig = state.rigs[state.activeRigId];
  return lifecycleAware.sort((a, b) => {
    const aDist = siteDistance(a.targetSiteId, rig.x, rig.z);
    const bDist = siteDistance(b.targetSiteId, rig.x, rig.z);
    return aDist - bDist;
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function siteDistance(siteId: WorldSiteId, rigX: number, rigZ: number): number {
  const site = findSite(siteId);
  if (!site) return Number.POSITIVE_INFINITY;
  return Math.hypot(site.x - rigX, site.z - rigZ);
}
