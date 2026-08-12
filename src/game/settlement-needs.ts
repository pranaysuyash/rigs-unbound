/**
 * Persistent community conditions and the work they make meaningful.
 *
 * This module owns regional social/material state, not a second quest ledger.
 * Offers remain derived by `mission-propositions.ts`; acceptance and outcomes
 * remain in `mission-lifecycle.ts`.
 */

import type {
  ActiveMissionState,
  FarmWaterworksState,
  GameState,
  RigCapability,
} from "./contracts";
import { RIG_CAPABILITIES } from "./contracts";
import {
  SETTLEMENT_MATERIAL_EFFECTS,
  materialEffectIdForSourceId,
  settlementMaterialEffect,
} from "./settlement-material-effects";
import type { MissionProposition } from "./mission-propositions";
import {
  INFRASTRUCTURE_DEFINITIONS,
  infrastructureIsOperating,
} from "./infrastructure-network";
import { deriveWeatherState } from "./weather";
import {
  findSite,
  isWithinSiteServiceArea,
  type CommunityPassageId,
  type WorldSiteId,
} from "./world";
import type { EcologyActorState } from "./ecology";

export const SETTLEMENT_IDS = [
  "home-valley",
  "long-furrow",
  "rustline-salvage",
  "sunken-flats",
  "marsh-depot",
  "launch-ridge",
] as const;

export type SettlementId = (typeof SETTLEMENT_IDS)[number];

export type SettlementCondition =
  | "water-stressed"
  | "waterlogged"
  | "workable"
  | "cultivated"
  | "supplied"
  | "isolated"
  | "cut-off"
  | "silent"
  | "connected"
  | "stable";

export interface SettlementRecord {
  condition: SettlementCondition;
  /** Favor is access/trust, never a purchasable currency. */
  favor: number;
  /** Idempotence record for permanent community outcomes. */
  completedNeedIds: readonly SettlementNeedOutcomeId[];
  /** Material, capability-specific help that a community remembers. */
  contributions: readonly SettlementContribution[];
  /** Local routines a community adopted while a pressure continued. */
  adaptations: readonly SettlementAdaptation[];
}

export interface SettlementContribution {
  responseId: string;
  materialEffectId: string;
  capability: RigCapability;
  createdAtWorldMinutes: number;
}

export interface SettlementAdaptation {
  id: string;
  materialEffectId: string;
  createdAtWorldMinutes: number;
}

export const RUSTLINE_SERVICE_STOCK_RESPONSE_ID =
  "rustline-salvage:deliver-service-stock";
export const RUSTLINE_SERVICE_STOCK_EFFECT_ID =
  "rustline-salvage:service-stocked";
export const SUNKEN_CAUSEWAY_RESPONSE_ID = "sunken-flats:deliver-causeway-kit";
export const SUNKEN_CAUSEWAY_EFFECT_ID = "sunken-flats:raised-causeway";

export type SettlementState = Record<SettlementId, SettlementRecord>;

export interface SettlementDefinition {
  id: SettlementId;
  name: string;
  siteId: WorldSiteId;
  people: string;
  residentAnchors: readonly {
    x: number;
    z: number;
    heading: number;
  }[];
  contact: {
    name: string;
    role: string;
  };
}

export const SETTLEMENTS: readonly SettlementDefinition[] = [
  {
    id: "home-valley",
    name: "Home Valley",
    siteId: "home-silo",
    people: "the home valley hands",
    residentAnchors: [
      { x: -5.8, z: -2.8, heading: 0.6 },
      { x: 3.4, z: 4.2, heading: 2.8 },
      { x: 8, z: -3.8, heading: -0.9 },
    ],
    contact: { name: "Mara Iles", role: "pump keeper" },
  },
  {
    id: "long-furrow",
    name: "Long Furrow",
    siteId: "long-furrow",
    people: "the Long Furrow growers",
    residentAnchors: [
      { x: -5.6, z: 1.8, heading: 0.2 },
      { x: -1.2, z: 4.6, heading: 2.7 },
      { x: 5.4, z: -2.2, heading: -1.1 },
    ],
    contact: { name: "Sava Nune", role: "grower" },
  },
  {
    id: "rustline-salvage",
    name: "Rustline Salvage",
    siteId: "salvage-yard",
    people: "the Rustline salvage crews",
    residentAnchors: [
      { x: -3.4, z: 2.4, heading: 0.8 },
      { x: 3.1, z: 4.8, heading: -2.4 },
      { x: 6.5, z: -2.8, heading: 2.3 },
    ],
    contact: { name: "Kellan Voss", role: "yard chief" },
  },
  {
    id: "sunken-flats",
    name: "Sunken Flats",
    siteId: "sunken-flats",
    people: "the Sunken Flats households",
    residentAnchors: [
      { x: 7.8, z: 0.8, heading: -0.4 },
      { x: 10.8, z: -2.4, heading: 2.6 },
    ],
    contact: { name: "Ione Vale", role: "ferry caller" },
  },
  {
    id: "marsh-depot",
    name: "Marsh Depot",
    siteId: "marsh-depot",
    people: "the Marsh Depot ferrymen",
    residentAnchors: [
      { x: -1.2, z: 3.1, heading: 0.2 },
      { x: 3.3, z: -2.7, heading: 2.8 },
    ],
    contact: { name: "Oren Pike", role: "depot ferryman" },
  },
  {
    id: "launch-ridge",
    name: "Launch Ridge",
    siteId: "launch-ridge",
    people: "the ridge signal keepers",
    residentAnchors: [{ x: 3.2, z: -4.4, heading: 2.4 }],
    contact: { name: "Sera Tal", role: "signal keeper" },
  },
] as const;

function settlement(id: SettlementId): SettlementDefinition {
  const definition = SETTLEMENTS.find((item) => item.id === id);
  if (!definition) throw new Error(`Unknown settlement ${id}.`);
  return definition;
}

export function settlementContact(id: SettlementId): string {
  const contact = settlement(id).contact;
  return `${contact.name}, ${contact.role}`;
}

export function settlementResidentAnchors(
  siteId: WorldSiteId,
): SettlementDefinition["residentAnchors"] {
  return (
    SETTLEMENTS.find((definition) => definition.siteId === siteId)
      ?.residentAnchors ?? []
  );
}

const SETTLEMENT_OUTCOMES = {
  "long-furrow-first-cut": {
    settlementId: "long-furrow",
    nextCondition: "cultivated",
    favorGain: 1,
    summary:
      "Sava Nune: The furrow is open. We can make food from this ground again.",
  },
  "sunken-flats-causeway": {
    settlementId: "sunken-flats",
    nextCondition: "connected",
    favorGain: 2,
    summary:
      "Ione Vale: The causeway is carrying. Take our channel mark; Marsh Depot may still have its lamps on.",
  },
  "rustline-parts-run": {
    settlementId: "rustline-salvage",
    nextCondition: "supplied",
    favorGain: 1,
    summary:
      "Kellan Voss: You hauled it through. We can turn a wrench at Rustline again.",
  },
  "marsh-depot-relief": {
    settlementId: "marsh-depot",
    nextCondition: "supplied",
    favorGain: 2,
    summary:
      "Oren Pike: Lamps are lit and the ford is stocked. The basin has a way through tonight.",
  },
  "launch-ridge-repeater": {
    settlementId: "launch-ridge",
    nextCondition: "connected",
    favorGain: 2,
    summary:
      "Sera Tal: The ridge is speaking again. Keep your receiver clear and you will hear who answers.",
  },
} as const satisfies Record<
  string,
  {
    settlementId: SettlementId;
    nextCondition: SettlementCondition;
    favorGain: number;
    summary: string;
  }
>;

export type SettlementNeedOutcomeId = keyof typeof SETTLEMENT_OUTCOMES;

/**
 * A settlement can share knowledge of a real place after the player has
 * materially helped it. Leads are derived from durable community history, not
 * a second collectible or a route-unlock flag: a player still has to decide to
 * travel and physically discover the destination.
 */
export interface SettlementWorldLead {
  id: string;
  sourceSettlementId: SettlementId;
  sourceSiteId: WorldSiteId;
  targetSiteId: WorldSiteId;
  title: string;
  description: string;
  mapLabel: string;
}

const SETTLEMENT_WORLD_LEADS: readonly (SettlementWorldLead & {
  requiredOutcomeId: SettlementNeedOutcomeId;
})[] = [
  {
    id: "sunken-flats-ferrymens-cut",
    sourceSettlementId: "sunken-flats",
    sourceSiteId: "sunken-flats",
    targetSiteId: "marsh-depot",
    requiredOutcomeId: "sunken-flats-causeway",
    title: "The Ferrymen's Cut",
    description:
      "With the causeway carrying supplies again, Sunken Flats households share a hand-drawn channel mark toward Marsh Depot. The depot is named, not discovered: the water and ground between are still yours to read.",
    mapLabel: "Ferrymen's channel mark",
  },
] as const;

/**
 * Terrain passages are derived from completed community work. They are not a
 * second unlock ledger: settlement history remains the sole durable fact.
 */
export function deriveSettlementCommunityPassageIds(
  state: Pick<GameState, "settlements">,
): readonly CommunityPassageId[] {
  const activeEffectIds = new Set(
    Object.values(state.settlements).flatMap((settlement) => [
      ...settlement.contributions.map((entry) => entry.materialEffectId),
      ...settlement.adaptations.map((entry) => entry.materialEffectId),
    ]),
  );
  return [
    ...new Set(
      SETTLEMENT_MATERIAL_EFFECTS.flatMap((effect) =>
        effect.communityPassageId && activeEffectIds.has(effect.id)
          ? [effect.communityPassageId]
          : [],
      ),
    ),
  ];
}

export function isSettlementNeedOutcomeId(
  value: unknown,
): value is SettlementNeedOutcomeId {
  return typeof value === "string" && value in SETTLEMENT_OUTCOMES;
}

/**
 * Project earned local knowledge into the world atlas without mutating the
 * discovery record. This keeps information social and optional while travel
 * and on-site observation remain the authority for knowing a place firsthand.
 */
export function deriveSettlementWorldLeads(
  state: Pick<GameState, "settlements">,
): readonly SettlementWorldLead[] {
  const legacyLeads = SETTLEMENT_WORLD_LEADS.filter((lead) =>
    state.settlements[lead.sourceSettlementId].completedNeedIds.includes(
      lead.requiredOutcomeId,
    ),
  );
  const materialLeads = SETTLEMENTS.flatMap((settlement) => {
    const record = state.settlements[settlement.id];
    const effectIds = [
      ...record.contributions.map((entry) => entry.materialEffectId),
      ...record.adaptations.map((entry) => entry.materialEffectId),
    ];
    return effectIds.flatMap((effectId) => {
      const effect = settlementMaterialEffect(effectId);
      if (!effect?.worldLead || effect.settlementId !== settlement.id)
        return [];
      return [
        {
          id: `material-effect:${effect.id}`,
          sourceSettlementId: settlement.id,
          sourceSiteId: settlement.siteId,
          targetSiteId: effect.worldLead.targetSiteId as WorldSiteId,
          title: effect.worldLead.title,
          description: effect.worldLead.description,
          mapLabel: effect.worldLead.mapLabel,
        } satisfies SettlementWorldLead,
      ];
    });
  });
  return [...legacyLeads, ...materialLeads];
}

export interface SettlementFieldNote {
  settlementId: SettlementId;
  speaker: string;
  text: string;
}

/**
 * Locals interpret the condition of the living systems around their place.
 * These are observations, not requests: nobody assigns the player a remedy
 * and the note simply changes as the shared world changes.
 */
const SETTLEMENT_ECOLOGY_WITNESSES: readonly {
  actorId: string;
  settlementId: SettlementId;
  describe: (actor: EcologyActorState) => string;
}[] = [
  {
    actorId: "long-furrow-herd",
    settlementId: "long-furrow",
    describe: (actor) =>
      actor.recentDisturbance > 0.2
        ? "The herd has pulled away from the furrow. Something out there has made the ground feel wrong to them."
        : actor.vitality < 0.5
          ? "The herd has pulled away from the furrow. Something out there has made the ground feel wrong to them."
          : actor.population < 5
            ? "Only a few grazers are crossing the furrow now. The pasture is changing faster than we can name it."
            : "The grazers are working the far pasture again. They know which ground still gives under a hoof.",
  },
  {
    actorId: "sunken-flats-flock",
    settlementId: "sunken-flats",
    describe: (actor) =>
      actor.recentDisturbance > 0.2
        ? "The waders have left the shallows unsettled. Water remembers more than a marked channel does."
        : actor.vitality < 0.5
          ? "The waders have left the shallows unsettled. Water remembers more than a marked channel does."
          : actor.population < 6
            ? "The flats are quieter than usual. Even the waders are choosing their crossings carefully."
            : "The waders are reading the shallows for us. Watch where they settle before you trust a crossing.",
  },
  {
    actorId: "quarry-run-corvids",
    settlementId: "rustline-salvage",
    describe: (actor) =>
      actor.recentDisturbance > 0.2
        ? "The corvids have scattered from Quarry Run. Something has changed the shape of that place."
        : actor.vitality < 0.5
          ? "The corvids have scattered from Quarry Run. Something has changed the shape of that place."
          : actor.population < 4
            ? "There are fewer corvids over the runout today. The yard notices when its watchers stop circling."
            : "The corvids still circle Quarry Run. They find loose things before any of us do.",
  },
];

export function deriveSettlementEcologyFieldNotes(
  actors: readonly EcologyActorState[],
): readonly SettlementFieldNote[] {
  return SETTLEMENT_ECOLOGY_WITNESSES.flatMap((witness) => {
    const actor = actors.find((candidate) => candidate.id === witness.actorId);
    if (!actor) return [];
    return [
      {
        settlementId: witness.settlementId,
        speaker: settlement(witness.settlementId).contact.name,
        text: witness.describe(actor),
      },
    ];
  });
}

/**
 * A named local the player can physically approach at a place they already
 * know. This is deliberately derived, not stored: a contact speaks the current
 * truth of their settlement and does not accumulate a consumable dialogue log.
 */
export interface SettlementContactEncounter {
  settlementId: SettlementId;
  siteId: WorldSiteId;
  siteName: string;
  speaker: string;
  text: string;
  x: number;
  z: number;
}

/** Read-only world facts a local may acknowledge without acquiring world authority. */
export interface SettlementWorldKnowledge {
  quarryRunoutStatus?: "dormant" | "active" | "cleared";
}

const SETTLEMENT_FIELD_VOICES: Readonly<
  Partial<Record<SettlementId, Partial<Record<SettlementCondition, string>>>>
> = {
  "home-valley": {
    "water-stressed":
      "The yard is dry where it should not be. Decide where the water goes before the light fails.",
    stable:
      "The pump line is holding. Home can spare attention for the road again.",
  },
  "long-furrow": {
    waterlogged:
      "The soil is too wet to trust; a wheel rut here becomes a season of trouble.",
    workable:
      "One terrace will carry a plough if somebody is willing to make the first cut.",
    cultivated: "The furrow is holding its shape. Work has a future here now.",
  },
  "rustline-salvage": {
    isolated:
      "The gantry is quiet. Bring fuel and service parts, and we can make machines useful again.",
    supplied:
      "The gantry has power, and the yard is listening for hard jobs again.",
  },
  "sunken-flats": {
    "cut-off":
      "The flats have gone inward. Nothing crosses until someone makes a route that can hold.",
    connected:
      "The causeway carries. The ferrymen have marked a safer line through the basin.",
  },
  "marsh-depot": {
    "cut-off":
      "Our lamps are dark, but the depot is still there if somebody can read the marsh.",
    supplied:
      "Fuel is dry, rations are counted, and a traveler can find a light at the depot.",
  },
  "launch-ridge": {
    silent:
      "The ridge hears the valley but cannot answer. A relay would change that.",
    connected:
      "The receiver is warm. Bring news worth sending and the ridge will carry it.",
  },
};

function contactVoice(
  definition: SettlementDefinition,
  condition: SettlementCondition,
  world: SettlementWorldKnowledge | undefined,
): string {
  if (world?.quarryRunoutStatus === "active") {
    if (definition.id === "rustline-salvage") {
      return "Kellan Voss, yard chief: Stone came down on the Quarry Run. Do not mistake a blocked old line for the edge of the valley; take the ground you trust, or put a machine to the rock.";
    }
    if (definition.id === "home-valley") {
      return "Mara Iles, pump keeper: The rain has moved the hill again. Rustline says the Quarry Run is under stone, but the valley is bigger than one road.";
    }
  }
  if (
    world?.quarryRunoutStatus === "cleared" &&
    definition.id === "rustline-salvage"
  ) {
    return "Kellan Voss, yard chief: I heard the runout shift. That is what a working machine sounds like from across the valley.";
  }
  return (
    SETTLEMENT_FIELD_VOICES[definition.id]?.[condition] ??
    `${definition.name} is ${condition.replace("-", " ")}.`
  );
}

/**
 * Current community truth for the existing field-notes surface. These are not
 * conversations to exhaust or quest instructions to obey; they are concise,
 * revisitable world memory spoken by named people who live at real sites.
 */
export function deriveSettlementFieldNotes(
  state: Pick<GameState, "settlements" | "infrastructure" | "worldTimeMinutes">,
): readonly SettlementFieldNote[] {
  return SETTLEMENTS.map((definition) => {
    const condition = deriveSettlementCondition(state, definition.id);
    const text =
      SETTLEMENT_FIELD_VOICES[definition.id]?.[condition] ??
      `${definition.name} is ${condition.replace("-", " ")}.`;
    return {
      settlementId: definition.id,
      speaker: settlementContact(definition.id),
      text,
    };
  });
}

/**
 * Find the named contact at an authored, personally known settlement. The
 * contact's first resident anchor is intentional: additional anchors are the
 * local crew, not a second set of conversation authorities.
 *
 * This exposes place-based knowledge only. It never changes discovery,
 * settlement condition, missions, favor, or player location.
 */
export function nearbySettlementContact(
  state: Pick<
    GameState,
    "settlements" | "infrastructure" | "worldTimeMinutes" | "discoveries"
  >,
  x: number,
  z: number,
  range = 3,
  world?: SettlementWorldKnowledge,
): SettlementContactEncounter | null {
  let nearest: SettlementContactEncounter | null = null;
  let nearestDistance = range;

  for (const definition of SETTLEMENTS) {
    const siteIsKnown =
      definition.siteId === "home-silo" ||
      state.discoveries.some((discovery) => discovery.id === definition.siteId);
    if (!siteIsKnown) continue;

    const anchor = definition.residentAnchors[0];
    const site = findSite(definition.siteId);
    if (!anchor || !site) continue;

    const contactX = site.x + anchor.x;
    const contactZ = site.z + anchor.z;
    const distance = Math.hypot(x - contactX, z - contactZ);
    if (distance > nearestDistance) continue;

    const condition = deriveSettlementCondition(state, definition.id);
    nearestDistance = distance;
    nearest = {
      settlementId: definition.id,
      siteId: definition.siteId,
      siteName: site.name,
      speaker: settlementContact(definition.id),
      text: contactVoice(definition, condition, world),
      x: contactX,
      z: contactZ,
    };
  }

  return nearest;
}

const SETTLEMENT_LAMP_COLORS: Readonly<Record<SettlementCondition, number>> = {
  "water-stressed": 0xe45b4f,
  waterlogged: 0x9b6d49,
  workable: 0xd9aa52,
  cultivated: 0x6bc9c4,
  supplied: 0x6bc9c4,
  isolated: 0xe45b4f,
  "cut-off": 0xe45b4f,
  silent: 0x2b2c31,
  connected: 0x6bc9c4,
  stable: 0x6bc9c4,
};

/**
 * Presentation-only condition color for the one authored horizon lamp at a
 * settlement. Terrain, discovery, collision, and mission truth stay elsewhere.
 */
export function settlementLampColor(
  state: Pick<GameState, "settlements" | "infrastructure" | "worldTimeMinutes">,
  siteId: WorldSiteId,
): number | null {
  const definition = SETTLEMENTS.find((item) => item.siteId === siteId);
  return definition
    ? SETTLEMENT_LAMP_COLORS[deriveSettlementCondition(state, definition.id)]
    : null;
}

/**
 * The renderer uses this to make a place look inhabited without assigning
 * simulation behavior to people. A struggling settlement retains its named
 * contact; a working settlement can visibly support its whole local crew.
 */
export function settlementResidentCount(
  state: Pick<GameState, "settlements" | "infrastructure" | "worldTimeMinutes">,
  siteId: WorldSiteId,
): number {
  const definition = SETTLEMENTS.find((item) => item.siteId === siteId);
  if (!definition) return 0;
  const condition = deriveSettlementCondition(state, definition.id);
  const working =
    condition === "stable" ||
    condition === "workable" ||
    condition === "cultivated" ||
    condition === "supplied" ||
    condition === "connected";
  return working
    ? definition.residentAnchors.length
    : Math.min(1, definition.residentAnchors.length);
}

function initialLongFurrowCondition(
  waterworks: FarmWaterworksState["choice"],
): SettlementCondition {
  return waterworks === "repair-pump" ? "workable" : "waterlogged";
}

/**
 * A durable community achievement is not permission to pretend its machinery
 * can never fail. This is a read-only current-condition projection: the
 * completed need stays persisted while the lived field condition follows the
 * actual pump and weather authority already used by terrain physics.
 */
export function deriveSettlementCondition(
  state: Pick<GameState, "settlements" | "infrastructure" | "worldTimeMinutes">,
  settlementId: SettlementId,
): SettlementCondition {
  const durableCondition = state.settlements[settlementId].condition;
  if (settlementId === "rustline-salvage" && rustlineServiceStocked(state)) {
    return "supplied";
  }
  if (settlementId === "sunken-flats" && sunkenCausewayBuilt(state)) {
    return "connected";
  }
  if (
    settlementId !== "long-furrow" ||
    (durableCondition !== "workable" && durableCondition !== "cultivated")
  ) {
    return durableCondition;
  }

  const pumpDefinition = INFRASTRUCTURE_DEFINITIONS["long-furrow-drain-pump"];
  const pump = state.infrastructure.entities[pumpDefinition.id];
  const weather = deriveWeatherState(state.worldTimeMinutes);
  const drainageFailed = !infrastructureIsOperating(pumpDefinition, pump);
  return drainageFailed && weather.soilMoisture >= 0.75
    ? "waterlogged"
    : durableCondition;
}

export function createSettlementState(
  waterworks: FarmWaterworksState["choice"] = "unresolved",
): SettlementState {
  return {
    "home-valley": {
      condition: waterworks === "unresolved" ? "water-stressed" : "stable",
      favor: 0,
      completedNeedIds: [],
      contributions: [],
      adaptations: [],
    },
    "long-furrow": {
      condition: initialLongFurrowCondition(waterworks),
      favor: 0,
      completedNeedIds: [],
      contributions: [],
      adaptations: [],
    },
    "rustline-salvage": {
      condition: "isolated",
      favor: 0,
      completedNeedIds: [],
      contributions: [],
      adaptations: [],
    },
    "sunken-flats": {
      condition: "cut-off",
      favor: 0,
      completedNeedIds: [],
      contributions: [],
      adaptations: [],
    },
    "marsh-depot": {
      condition: "cut-off",
      favor: 0,
      completedNeedIds: [],
      contributions: [],
      adaptations: [],
    },
    "launch-ridge": {
      condition: "silent",
      favor: 0,
      completedNeedIds: [],
      contributions: [],
      adaptations: [],
    },
  };
}

const SETTLEMENT_CONDITIONS: readonly SettlementCondition[] = [
  "water-stressed",
  "waterlogged",
  "workable",
  "cultivated",
  "supplied",
  "isolated",
  "cut-off",
  "silent",
  "connected",
  "stable",
];

/** Recover bounded community state; missing v18-and-earlier data derives safely. */
export function recoverSettlementState(
  value: unknown,
  waterworks: FarmWaterworksState["choice"],
): SettlementState {
  const fallback = createSettlementState(waterworks);
  if (!value || typeof value !== "object") return fallback;
  const source = value as Record<string, unknown>;
  const recovered = { ...fallback };

  for (const id of SETTLEMENT_IDS) {
    const raw = source[id];
    if (!raw || typeof raw !== "object") continue;
    const record = raw as Record<string, unknown>;
    const completedNeedIds = Array.isArray(record.completedNeedIds)
      ? record.completedNeedIds.filter(isSettlementNeedOutcomeId)
      : [];
    const contributions = Array.isArray(record.contributions)
      ? record.contributions
          .filter(
            (entry): entry is Record<string, unknown> =>
              !!entry && typeof entry === "object",
          )
          .filter(
            (entry) =>
              typeof entry.responseId === "string" &&
              /^[a-z0-9:-]{3,96}$/.test(entry.responseId) &&
              RIG_CAPABILITIES.includes(entry.capability as RigCapability) &&
              typeof entry.createdAtWorldMinutes === "number" &&
              Number.isFinite(entry.createdAtWorldMinutes),
          )
          .map((entry) => ({
            responseId: entry.responseId as string,
            materialEffectId:
              typeof entry.materialEffectId === "string"
                ? entry.materialEffectId
                : (materialEffectIdForSourceId(entry.responseId as string) ??
                  (entry.responseId as string)),
            capability: entry.capability as RigCapability,
            createdAtWorldMinutes: Math.max(
              0,
              entry.createdAtWorldMinutes as number,
            ),
          }))
          .filter(
            (entry, index, all) =>
              all.findIndex(
                (candidate) => candidate.responseId === entry.responseId,
              ) === index,
          )
          .slice(-24)
      : [];
    const adaptations = Array.isArray(record.adaptations)
      ? record.adaptations
          .filter(
            (entry): entry is Record<string, unknown> =>
              !!entry && typeof entry === "object",
          )
          .filter(
            (entry) =>
              typeof entry.id === "string" &&
              /^[a-z0-9:-]{3,96}$/.test(entry.id) &&
              typeof entry.createdAtWorldMinutes === "number" &&
              Number.isFinite(entry.createdAtWorldMinutes),
          )
          .map((entry) => ({
            id: entry.id as string,
            materialEffectId:
              typeof entry.materialEffectId === "string"
                ? entry.materialEffectId
                : (materialEffectIdForSourceId(entry.id as string) ??
                  (entry.id as string)),
            createdAtWorldMinutes: Math.max(
              0,
              entry.createdAtWorldMinutes as number,
            ),
          }))
          .filter(
            (entry, index, all) =>
              all.findIndex((candidate) => candidate.id === entry.id) === index,
          )
          .slice(-12)
      : [];
    const recoveredContributions =
      id === "rustline-salvage" &&
      completedNeedIds.includes("rustline-parts-run") &&
      !contributions.some(
        (entry) => entry.materialEffectId === RUSTLINE_SERVICE_STOCK_EFFECT_ID,
      )
        ? [
            ...contributions,
            {
              responseId: RUSTLINE_SERVICE_STOCK_RESPONSE_ID,
              materialEffectId: RUSTLINE_SERVICE_STOCK_EFFECT_ID,
              capability: "tow" as const,
              createdAtWorldMinutes: 0,
            },
          ]
        : id === "sunken-flats" &&
            completedNeedIds.includes("sunken-flats-causeway") &&
            !contributions.some(
              (entry) => entry.materialEffectId === SUNKEN_CAUSEWAY_EFFECT_ID,
            )
          ? [
              ...contributions,
              {
                responseId: SUNKEN_CAUSEWAY_RESPONSE_ID,
                materialEffectId: SUNKEN_CAUSEWAY_EFFECT_ID,
                capability: "tow" as const,
                createdAtWorldMinutes: 0,
              },
            ]
          : contributions;
    recovered[id] = {
      condition: SETTLEMENT_CONDITIONS.includes(
        record.condition as SettlementCondition,
      )
        ? (record.condition as SettlementCondition)
        : fallback[id].condition,
      favor:
        typeof record.favor === "number" && Number.isFinite(record.favor)
          ? Math.max(0, Math.min(10, Math.floor(record.favor)))
          : fallback[id].favor,
      completedNeedIds: [...new Set(completedNeedIds)],
      contributions: recoveredContributions,
      adaptations,
    };
  }
  return recovered;
}

/** Apply the material outcome of the one-time Home Valley waterworks choice. */
export function applyFarmWaterworksSettlementOutcome(
  state: GameState,
  choice: Exclude<FarmWaterworksState["choice"], "unresolved">,
): void {
  state.settlements = {
    ...state.settlements,
    "home-valley": { ...state.settlements["home-valley"], condition: "stable" },
    "long-furrow": {
      ...state.settlements["long-furrow"],
      condition: initialLongFurrowCondition(choice),
    },
  };
}

/** Record partial local help without turning a settlement into a completed node. */
export function recordSettlementContribution(
  state: GameState,
  settlementId: SettlementId,
  contribution: SettlementContribution,
): boolean {
  const current = state.settlements[settlementId];
  if (
    current.contributions.some(
      (entry) => entry.responseId === contribution.responseId,
    )
  ) {
    return false;
  }
  state.settlements = {
    ...state.settlements,
    [settlementId]: {
      ...current,
      favor: Math.min(10, current.favor + 1),
      contributions: [...current.contributions, contribution],
    },
  };
  return true;
}

/** Rustline can work because stock physically reached its yard, not because a mission flag says so. */
export function rustlineServiceStocked(
  state: Pick<GameState, "settlements">,
): boolean {
  return state.settlements["rustline-salvage"].contributions.some(
    (entry) => entry.materialEffectId === RUSTLINE_SERVICE_STOCK_EFFECT_ID,
  );
}

export function recordRustlineServiceStock(
  state: GameState,
  createdAtWorldMinutes: number,
): boolean {
  return recordSettlementContribution(state, "rustline-salvage", {
    responseId: RUSTLINE_SERVICE_STOCK_RESPONSE_ID,
    materialEffectId: RUSTLINE_SERVICE_STOCK_EFFECT_ID,
    capability: "tow",
    createdAtWorldMinutes,
  });
}

export function sunkenCausewayBuilt(
  state: Pick<GameState, "settlements">,
): boolean {
  return state.settlements["sunken-flats"].contributions.some(
    (entry) => entry.materialEffectId === SUNKEN_CAUSEWAY_EFFECT_ID,
  );
}

export function recordSunkenCauseway(
  state: GameState,
  createdAtWorldMinutes: number,
): boolean {
  return recordSettlementContribution(state, "sunken-flats", {
    responseId: SUNKEN_CAUSEWAY_RESPONSE_ID,
    materialEffectId: SUNKEN_CAUSEWAY_EFFECT_ID,
    capability: "tow",
    createdAtWorldMinutes,
  });
}

/** Record community agency without treating it as player progress or a lock. */
export function recordSettlementAdaptation(
  state: GameState,
  settlementId: SettlementId,
  adaptation: SettlementAdaptation,
): boolean {
  const current = state.settlements[settlementId];
  if (current.adaptations.some((entry) => entry.id === adaptation.id))
    return false;
  state.settlements = {
    ...state.settlements,
    [settlementId]: {
      ...current,
      adaptations: [...current.adaptations, adaptation].slice(-12),
    },
  };
  return true;
}

/** The first community offer requires actual cultivation at a named place. */
export function deriveSettlementNeedMissions(
  state: GameState,
  visibleSites: ReadonlySet<WorldSiteId>,
): readonly MissionProposition[] {
  const furrow = state.settlements["long-furrow"];
  const needs: MissionProposition[] = [];
  if (
    furrow.condition === "workable" &&
    !furrow.completedNeedIds.includes("long-furrow-first-cut") &&
    visibleSites.has("long-furrow")
  ) {
    const definition = settlement("long-furrow");
    needs.push({
      id: "need-long-furrow-first-cut",
      binding: "cultivation",
      missionClass: "side",
      giverId: settlementContact("long-furrow"),
      prerequisites: [{ kind: "discovery", siteId: "long-furrow" }],
      title: "Keep the Furrow Open",
      premise: `${definition.people} need the first pass cut before the soil closes again.`,
      briefing:
        "The repaired drainage has made one field workable. Lower a plough at Long Furrow and lay a real cut through the soil; this is food and access, not a calibration exercise.",
      origin: definition.name,
      destination: definition.name,
      targetSiteId: definition.siteId,
      waypointIds: [definition.siteId],
      minInsight: 0,
      requiredCapabilities: ["plough"],
      rewardSalvage: 8,
      difficultyLabel: "standard",
      settlementOutcomeId: "long-furrow-first-cut",
      state: "available",
    });
  }

  const rustline = state.settlements["rustline-salvage"];
  if (
    rustline.condition === "isolated" &&
    !rustlineServiceStocked(state) &&
    !rustline.completedNeedIds.includes("rustline-parts-run") &&
    visibleSites.has("salvage-yard")
  ) {
    const definition = settlement("rustline-salvage");
    needs.push({
      id: "need-rustline-parts-run",
      binding: "delivery",
      missionClass: "side",
      giverId: settlementContact("rustline-salvage"),
      prerequisites: [{ kind: "discovery", siteId: "salvage-yard" }],
      title: "Bring Rustline Back Online",
      premise: `${definition.people} have a yard full of recoverable machines but no parts or fuel to move them.`,
      briefing:
        "Rustline's crews can trade knowledge, salvage, and routes once their gantry has fuel and service parts. Take the crate from Home Valley across the badlands; the yard becomes a working place only when the cargo is actually there.",
      origin: "Home Valley",
      destination: definition.name,
      targetSiteId: definition.siteId,
      waypointIds: ["home-silo", definition.siteId],
      minInsight: 0,
      requiredCapabilities: ["tow"],
      rewardSalvage: 14,
      difficultyLabel: "hard",
      settlementOutcomeId: "rustline-parts-run",
      state: "available",
    });
  }

  return needs;
}

/** Whether a newly written furrow physically fulfils the active community need. */
export function canFulfillCultivationNeed(
  mission: ActiveMissionState,
  x: number,
  z: number,
): boolean {
  if (
    mission.binding !== "cultivation" ||
    mission.settlementOutcomeId !== "long-furrow-first-cut"
  )
    return false;
  const site = findSite(mission.targetSiteId);
  return !!site && isWithinSiteServiceArea(site, x, z);
}

/** Apply one idempotent consequence at the authoritative mission boundary. */
export function applySettlementNeedOutcome(
  state: GameState,
  outcomeId: SettlementNeedOutcomeId | null,
): string | null {
  if (!outcomeId) return null;
  const outcome = SETTLEMENT_OUTCOMES[outcomeId];
  const current = state.settlements[outcome.settlementId];
  if (current.completedNeedIds.includes(outcomeId)) return null;
  if (outcomeId === "rustline-parts-run") {
    const changed = recordRustlineServiceStock(state, state.worldTimeMinutes);
    const updated = state.settlements["rustline-salvage"];
    state.settlements = {
      ...state.settlements,
      "rustline-salvage": {
        ...updated,
        completedNeedIds: [...updated.completedNeedIds, outcomeId],
      },
    };
    return changed ? outcome.summary : null;
  }
  if (outcomeId === "sunken-flats-causeway") {
    const changed = recordSunkenCauseway(state, state.worldTimeMinutes);
    const updated = state.settlements["sunken-flats"];
    state.settlements = {
      ...state.settlements,
      "sunken-flats": {
        ...updated,
        completedNeedIds: [...updated.completedNeedIds, outcomeId],
      },
    };
    return changed ? outcome.summary : null;
  }
  state.settlements = {
    ...state.settlements,
    [outcome.settlementId]: {
      ...current,
      condition: outcome.nextCondition,
      favor: Math.min(10, current.favor + outcome.favorGain),
      completedNeedIds: [...current.completedNeedIds, outcomeId],
    },
  };
  return outcome.summary;
}
