/**
 * Shared, read-only life projection for authored settlements.
 *
 * The kernel records causal facts, not a player route. This module projects
 * overlapping conditions, local services, resident behavior, and voluntary
 * capability-specific responses from those facts.
 */

import {
  NIGHT_START_MINUTE,
  worldMinuteOfDay,
  type GameState,
  type RigCapability,
} from "./contracts";
import {
  deriveSettlementCondition,
  SETTLEMENTS,
  type SettlementCondition,
  type SettlementAdaptation,
  type SettlementContribution,
  type SettlementId,
} from "./settlement-needs";
import { deriveWeatherState } from "./weather";
import { findSite, type WorldSiteId } from "./world";
import {
  settlementMaterialEffect,
  type SettlementMaterialEffect,
  type SettlementMaterialEffectKind,
} from "./settlement-material-effects";

export type SettlementPressureKind =
  | "water-balance"
  | "field-saturation"
  | "route-isolation"
  | "route-disruption"
  | "supply-shortfall"
  | "signal-silence"
  | "storm-exposure";

export type SettlementResidentActivity =
  | "water-watch"
  | "field-work"
  | "route-watch"
  | "yard-work"
  | "sheltering"
  | "signal-watch"
  | "community-work"
  | "resting";

export type SettlementResponseInteraction = "context" | "plough-cut";
export type SettlementResponseStatus = "available" | "contributed";
export type SettlementShift = "working" | "after-dark";
export type SettlementConsequenceKind = SettlementMaterialEffectKind;

export interface SettlementLifeWorldKnowledge {
  quarryRunoutStatus: "dormant" | "active" | "cleared";
}

export interface SettlementPressure {
  id: string;
  kind: SettlementPressureKind;
  label: string;
  severity: number;
  baseSeverity: number;
  source: string;
  affectedServices: readonly string[];
  compatibleCapabilities: readonly RigCapability[];
}

export interface SettlementServiceProjection {
  id: string;
  label: string;
  availability: "open" | "limited" | "sheltering" | "off-shift";
  reason: string;
}

export interface SettlementResidentProjection {
  id: string;
  role: string;
  activity: SettlementResidentActivity;
  anchorIndex: number;
  offsetX: number;
  offsetZ: number;
  headingOffset: number;
  color: number;
}

export interface SettlementResponseDefinition {
  id: string;
  settlementId: SettlementId;
  /** The local material situation a machine can actually affect. */
  affordanceId: string;
  pressureKind: SettlementPressureKind;
  capability: RigCapability;
  materialEffectId: string;
  interaction: SettlementResponseInteraction;
  label: string;
  explanation: string;
}

/**
 * Spatial authored facts, not task targets. A machine must reach one of these
 * places before the kernel can evaluate whether its capability changes a live
 * local condition.
 */
export interface SettlementMaterialAffordance {
  id: string;
  settlementId: SettlementId;
  label: string;
  offsetX: number;
  offsetZ: number;
  radius: number;
}

export interface SettlementResponseProjection {
  id: string;
  materialEffectId: string;
  label: string;
  explanation: string;
  compatibleCapabilities: readonly RigCapability[];
  interaction: SettlementResponseInteraction;
  status: SettlementResponseStatus;
  consequence: SettlementMaterialEffect["consequence"];
}

export interface SettlementLifeProjection {
  settlementId: SettlementId;
  siteId: WorldSiteId;
  name: string;
  people: string;
  shift: SettlementShift;
  condition: SettlementCondition;
  favor: number;
  pressures: readonly SettlementPressure[];
  services: readonly SettlementServiceProjection[];
  residents: readonly SettlementResidentProjection[];
  adaptations: readonly SettlementAdaptationProjection[];
  responses: readonly SettlementResponseProjection[];
}

export interface SettlementAdaptationProjection {
  id: string;
  materialEffectId: string;
  label: string;
  explanation: string;
  consequence: SettlementMaterialEffect["consequence"];
}

export interface SettlementAdaptationDefinition {
  id: string;
  settlementId: SettlementId;
  pressureKind: SettlementPressureKind;
  minimumSeverity: number;
  blockedByContributionIds: readonly string[];
  label: string;
  explanation: string;
  materialEffectId: string;
}

const RESIDENT_ROLES: Readonly<Record<SettlementId, readonly string[]>> = {
  "home-valley": ["pump keeper", "yard hauler", "field hand"],
  "long-furrow": ["grower", "field hand", "seed keeper"],
  "rustline-salvage": ["yard chief", "rig hauler", "salvage sorter"],
  "sunken-flats": ["ferry caller", "crossing keeper"],
  "marsh-depot": ["depot ferryman", "stores keeper"],
  "launch-ridge": ["signal keeper"],
};

const SERVICE_DEFINITIONS: Readonly<
  Record<SettlementId, readonly { id: string; label: string }[]>
> = {
  "home-valley": [
    { id: "water", label: "Water service" },
    { id: "yard", label: "Yard exchange" },
  ],
  "long-furrow": [
    { id: "field", label: "Field exchange" },
    { id: "haul", label: "Stores exchange" },
  ],
  "rustline-salvage": [
    { id: "haul", label: "Yard exchange" },
    { id: "exchange", label: "Rig assessment" },
  ],
  "sunken-flats": [
    { id: "crossing", label: "Crossing watch" },
    { id: "exchange", label: "Household exchange" },
  ],
  "marsh-depot": [
    { id: "crossing", label: "Ford watch" },
    { id: "exchange", label: "Stores exchange" },
  ],
  "launch-ridge": [{ id: "information", label: "Signal watch" }],
};

export const SETTLEMENT_MATERIAL_AFFORDANCES: readonly SettlementMaterialAffordance[] =
  [
    {
      id: "long-furrow:drainage-edge",
      settlementId: "long-furrow",
      label: "saturated field edge",
      offsetX: -5.6,
      offsetZ: 1.8,
      radius: 5.2,
    },
    {
      id: "long-furrow:raised-ground",
      settlementId: "long-furrow",
      label: "raised stores ground",
      offsetX: 7.4,
      offsetZ: -5.8,
      radius: 4.2,
    },
    {
      id: "rustline-salvage:blocked-yard",
      settlementId: "rustline-salvage",
      label: "blocked salvage yard",
      offsetX: -6.2,
      offsetZ: -4.8,
      radius: 4.5,
    },
    {
      id: "rustline-salvage:bypass-line",
      settlementId: "rustline-salvage",
      label: "uncertain bypass line",
      offsetX: 8.5,
      offsetZ: 5.5,
      radius: 4.5,
    },
    {
      id: "sunken-flats:landing-bank",
      settlementId: "sunken-flats",
      label: "flooded landing bank",
      offsetX: -6.8,
      offsetZ: 4.6,
      radius: 5.5,
    },
    {
      id: "sunken-flats:sounding-bank",
      settlementId: "sunken-flats",
      label: "changing crossing bed",
      offsetX: 9.5,
      offsetZ: 6.4,
      radius: 5.5,
    },
    {
      id: "marsh-depot:stores-landing",
      settlementId: "marsh-depot",
      label: "narrow stores landing",
      offsetX: -5.6,
      offsetZ: 4.6,
      radius: 5.2,
    },
    {
      id: "marsh-depot:ford-anchor",
      settlementId: "marsh-depot",
      label: "ford recovery anchor",
      offsetX: 6.4,
      offsetZ: -4.8,
      radius: 4.8,
    },
    {
      id: "launch-ridge:signal-mast",
      settlementId: "launch-ridge",
      label: "ridge signal mast",
      offsetX: 5.5,
      offsetZ: 3.8,
      radius: 4.2,
    },
    {
      id: "launch-ridge:repeater-sled",
      settlementId: "launch-ridge",
      label: "repeater sled",
      offsetX: -4.4,
      offsetZ: 5.3,
      radius: 4.2,
    },
  ];

/** Authored possibilities, not a sequence or a mandatory objective list. */
export const SETTLEMENT_RESPONSE_DEFINITIONS: readonly SettlementResponseDefinition[] =
  [
    {
      id: "long-furrow:cut-relief-channel",
      settlementId: "long-furrow",
      affordanceId: "long-furrow:drainage-edge",
      pressureKind: "field-saturation",
      capability: "plough",
      materialEffectId: "long-furrow:drainage-cut",
      interaction: "plough-cut",
      label: "Cut relief channels",
      explanation: "A real cut gives the water a way off the working edge.",
    },
    {
      id: "long-furrow:move-soaked-stores",
      settlementId: "long-furrow",
      affordanceId: "long-furrow:raised-ground",
      pressureKind: "field-saturation",
      capability: "tow",
      materialEffectId: "long-furrow:staged-stores",
      interaction: "context",
      label: "Move soaked stores",
      explanation:
        "Shift seed and tools to higher ground while the field remains wet.",
    },
    {
      id: "rustline-salvage:shift-yard-load",
      settlementId: "rustline-salvage",
      affordanceId: "rustline-salvage:blocked-yard",
      pressureKind: "route-isolation",
      capability: "tow",
      materialEffectId: "rustline-salvage:staged-yard",
      interaction: "context",
      label: "Shift the yard load",
      explanation:
        "Put a stranded machine and its parts where the crew can work around the blocked run.",
    },
    {
      id: "rustline-salvage:mark-bypass",
      settlementId: "rustline-salvage",
      affordanceId: "rustline-salvage:bypass-line",
      pressureKind: "route-isolation",
      capability: "survey",
      materialEffectId: "rustline-salvage:marked-bypass",
      interaction: "context",
      label: "Mark a bypass",
      explanation:
        "Give the crews a trustworthy route reading before anyone commits a heavy load.",
    },
    {
      id: "sunken-flats:carry-households",
      settlementId: "sunken-flats",
      affordanceId: "sunken-flats:landing-bank",
      pressureKind: "route-isolation",
      capability: "hover",
      materialEffectId: "sunken-flats:carried-crossing",
      interaction: "context",
      label: "Carry the crossing",
      explanation:
        "Move people and essential supplies across water that ground rigs cannot safely read.",
    },
    {
      id: "sunken-flats:sound-crossing",
      settlementId: "sunken-flats",
      affordanceId: "sunken-flats:sounding-bank",
      pressureKind: "route-isolation",
      capability: "survey",
      materialEffectId: "sunken-flats:sounded-crossing",
      interaction: "context",
      label: "Sound the crossing",
      explanation:
        "Map the depth and ground changes so locals can choose their own safer window.",
    },
    {
      id: "marsh-depot:carry-stores",
      settlementId: "marsh-depot",
      affordanceId: "marsh-depot:stores-landing",
      pressureKind: "storm-exposure",
      capability: "hover",
      materialEffectId: "marsh-depot:ferried-stores",
      interaction: "context",
      label: "Ferry the stores",
      explanation:
        "Keep food and fuel moving while the basin narrows the safe route.",
    },
    {
      id: "marsh-depot:secure-ford-line",
      settlementId: "marsh-depot",
      affordanceId: "marsh-depot:ford-anchor",
      pressureKind: "storm-exposure",
      capability: "tow",
      materialEffectId: "marsh-depot:secured-ford",
      interaction: "context",
      label: "Secure the ford line",
      explanation:
        "Set a recovery line so local crossings remain deliberate rather than blind.",
    },
    {
      id: "launch-ridge:reacquire-signal",
      settlementId: "launch-ridge",
      affordanceId: "launch-ridge:signal-mast",
      pressureKind: "signal-silence",
      capability: "survey",
      materialEffectId: "launch-ridge:reacquired-signal",
      interaction: "context",
      label: "Reacquire the signal",
      explanation:
        "Use a high reading to find what the ridge can receive and pass on.",
    },
    {
      id: "launch-ridge:haul-repeater",
      settlementId: "launch-ridge",
      affordanceId: "launch-ridge:repeater-sled",
      pressureKind: "signal-silence",
      capability: "tow",
      materialEffectId: "launch-ridge:positioned-repeater",
      interaction: "context",
      label: "Haul the repeater",
      explanation:
        "Move local hardware into a position the keepers can maintain.",
    },
  ];

/** Community agency after an unresolved pressure survives a full local cycle. */
export const SETTLEMENT_ADAPTATION_DEFINITIONS: readonly SettlementAdaptationDefinition[] =
  [
    {
      id: "long-furrow:raise-stores-routine",
      settlementId: "long-furrow",
      pressureKind: "field-saturation",
      minimumSeverity: 0.78,
      blockedByContributionIds: ["long-furrow:move-soaked-stores"],
      label: "Growers have raised the stores",
      explanation:
        "The crew has shifted what it can above the wet edge while field work remains constrained.",
      materialEffectId: "long-furrow:self-raised-stores",
    },
    {
      id: "rustline-salvage:consolidate-yard-routine",
      settlementId: "rustline-salvage",
      pressureKind: "route-isolation",
      minimumSeverity: 0.62,
      blockedByContributionIds: ["rustline-salvage:shift-yard-load"],
      label: "Rustline has consolidated the yard",
      explanation:
        "Crews are working from a smaller, safer yard while the route remains uncertain.",
      materialEffectId: "rustline-salvage:consolidated-yard",
    },
    {
      id: "sunken-flats:consolidate-landing-routine",
      settlementId: "sunken-flats",
      pressureKind: "route-isolation",
      minimumSeverity: 0.8,
      blockedByContributionIds: ["sunken-flats:carry-households"],
      label: "Sunken Flats has consolidated the landing",
      explanation:
        "Households are sharing the safer bank and narrowing their own crossings.",
      materialEffectId: "sunken-flats:consolidated-landing",
    },
    {
      id: "marsh-depot:watch-ford-routine",
      settlementId: "marsh-depot",
      pressureKind: "route-isolation",
      minimumSeverity: 0.8,
      blockedByContributionIds: ["marsh-depot:secure-ford-line"],
      label: "Marsh Depot has posted a ford watch",
      explanation:
        "The depot is pooling crossings around local watchers instead of treating the ford as ordinary ground.",
      materialEffectId: "marsh-depot:watched-ford",
    },
    {
      id: "launch-ridge:manual-watch-routine",
      settlementId: "launch-ridge",
      pressureKind: "signal-silence",
      minimumSeverity: 0.6,
      blockedByContributionIds: ["launch-ridge:reacquire-signal"],
      label: "The ridge has kept a manual watch",
      explanation:
        "Keepers are passing sightings by hand while the signal remains incomplete.",
      materialEffectId: "launch-ridge:manual-signal-watch",
    },
  ];

export function settlementResponseDefinitionsForSite(
  siteId: WorldSiteId,
): readonly SettlementResponseDefinition[] {
  const settlement = SETTLEMENTS.find(
    (definition) => definition.siteId === siteId,
  );
  return settlement
    ? SETTLEMENT_RESPONSE_DEFINITIONS.filter(
        (definition) => definition.settlementId === settlement.id,
      )
    : [];
}

export function settlementAdaptationDefinitionsForSite(
  siteId: WorldSiteId,
): readonly SettlementAdaptationDefinition[] {
  const settlement = SETTLEMENTS.find(
    (definition) => definition.siteId === siteId,
  );
  return settlement
    ? SETTLEMENT_ADAPTATION_DEFINITIONS.filter(
        (definition) => definition.settlementId === settlement.id,
      )
    : [];
}

export function settlementMaterialAffordanceForResponse(
  response: SettlementResponseDefinition,
): SettlementMaterialAffordance | undefined {
  return SETTLEMENT_MATERIAL_AFFORDANCES.find(
    (affordance) =>
      affordance.id === response.affordanceId &&
      affordance.settlementId === response.settlementId,
  );
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function pressureForCondition(
  settlementId: SettlementId,
  condition: SettlementCondition,
): SettlementPressure | null {
  if (condition === "water-stressed")
    return {
      id: `${settlementId}:water-balance`,
      kind: "water-balance",
      label: "Water balance is strained",
      severity: 0.72,
      baseSeverity: 0.72,
      source: "Local water service cannot meet present demand.",
      affectedServices: ["water", "yard"],
      compatibleCapabilities: ["tow"],
    };
  if (condition === "waterlogged")
    return {
      id: `${settlementId}:field-saturation`,
      kind: "field-saturation",
      label: "Ground is saturated",
      severity: 0.84,
      baseSeverity: 0.84,
      source: "Rain and failed drainage have made field work unreliable.",
      affectedServices: ["field", "haul"],
      compatibleCapabilities: ["plough", "tow"],
    };
  if (condition === "isolated" || condition === "cut-off") {
    const severity = condition === "cut-off" ? 0.86 : 0.67;
    return {
      id: `${settlementId}:route-isolation`,
      kind: "route-isolation",
      label: "Local movement is constrained",
      severity,
      baseSeverity: severity,
      source:
        "The settlement has fewer reliable ways to exchange people and goods.",
      affectedServices: ["haul", "exchange", "crossing"],
      compatibleCapabilities: ["tow", "survey", "hover"],
    };
  }
  if (condition === "silent")
    return {
      id: `${settlementId}:signal-silence`,
      kind: "signal-silence",
      label: "The settlement cannot carry a signal",
      severity: 0.64,
      baseSeverity: 0.64,
      source:
        "The ridge can receive nearby traffic but cannot reliably answer.",
      affectedServices: ["information"],
      compatibleCapabilities: ["survey", "tow"],
    };
  return null;
}

function contributed(
  definition: SettlementResponseDefinition,
  contributions: readonly SettlementContribution[],
): boolean {
  return contributions.some((entry) => entry.responseId === definition.id);
}

function adapted(
  definition: SettlementAdaptationDefinition,
  adaptations: readonly SettlementAdaptation[],
): boolean {
  return adaptations.some((entry) => entry.id === definition.id);
}

function totalRelief(
  settlementId: SettlementId,
  pressureKind: SettlementPressureKind,
  contributions: readonly SettlementContribution[],
  adaptations: readonly SettlementAdaptation[],
  service?: string,
): number {
  const contributionRelief = contributions
    .map((entry) => settlementMaterialEffect(entry.materialEffectId))
    .filter(
      (effect): effect is SettlementMaterialEffect =>
        effect?.settlementId === settlementId &&
        effect.pressureKind === pressureKind,
    )
    .flatMap((effect) => effect.serviceRelief)
    .filter((effect) => service === undefined || effect.service === service)
    .reduce((sum, effect) => sum + effect.amount, 0);
  const adaptationRelief = adaptations
    .map((entry) => settlementMaterialEffect(entry.materialEffectId))
    .filter(
      (effect): effect is SettlementMaterialEffect =>
        effect?.settlementId === settlementId &&
        effect.pressureKind === pressureKind,
    )
    .flatMap((effect) => effect.serviceRelief)
    .filter((effect) => service === undefined || effect.service === service)
    .reduce((sum, effect) => sum + effect.amount, 0);
  return contributionRelief + adaptationRelief;
}

function derivePressures(
  state: GameState,
  settlementId: SettlementId,
  knowledge: SettlementLifeWorldKnowledge,
): readonly SettlementPressure[] {
  const condition = deriveSettlementCondition(state, settlementId);
  const raw: SettlementPressure[] = [];
  const conditionPressure = pressureForCondition(settlementId, condition);
  if (conditionPressure) raw.push(conditionPressure);
  if (
    knowledge.quarryRunoutStatus === "active" &&
    (settlementId === "rustline-salvage" || settlementId === "home-valley")
  ) {
    const severity = settlementId === "rustline-salvage" ? 0.8 : 0.46;
    raw.push({
      id: `${settlementId}:quarry-runout`,
      kind: "route-disruption",
      label: "The Quarry Run has shifted under stone",
      severity,
      baseSeverity: severity,
      source:
        "A persistent road runout has changed the practical route through the valley.",
      affectedServices: ["haul", "exchange"],
      compatibleCapabilities: ["tow", "survey"],
    });
  }
  const weather = deriveWeatherState(state.worldTimeMinutes);
  if (
    weather.rainIntensity >= 0.55 &&
    (settlementId === "sunken-flats" || settlementId === "marsh-depot")
  ) {
    const severity = clamp(0.38 + weather.rainIntensity * 0.55);
    raw.push({
      id: `${settlementId}:storm-exposure`,
      kind: "storm-exposure",
      label: "Rising weather is closing the safe window",
      severity,
      baseSeverity: severity,
      source:
        "Heavy rain is reducing confidence in local crossings and stores.",
      affectedServices: ["crossing", "exchange"],
      compatibleCapabilities: ["tow", "survey", "hover"],
    });
  }
  const contributions = state.settlements[settlementId].contributions;
  const adaptations = state.settlements[settlementId].adaptations;
  return raw
    .map((pressure) => ({
      ...pressure,
      severity: clamp(
        pressure.baseSeverity -
          totalRelief(settlementId, pressure.kind, contributions, adaptations),
      ),
    }))
    .sort((a, b) => b.severity - a.severity || a.id.localeCompare(b.id));
}

function serviceUnderPressure(
  settlementId: SettlementId,
  serviceId: string,
  pressures: readonly SettlementPressure[],
  contributions: readonly SettlementContribution[],
  adaptations: readonly SettlementAdaptation[],
): boolean {
  return pressures.some(
    (pressure) =>
      pressure.affectedServices.includes(serviceId) &&
      clamp(
        pressure.baseSeverity -
          totalRelief(
            settlementId,
            pressure.kind,
            contributions,
            adaptations,
            serviceId,
          ),
      ) >= 0.48,
  );
}

function residentActivity(
  settlementId: SettlementId,
  role: string,
  pressures: readonly SettlementPressure[],
  contributions: readonly SettlementContribution[],
  adaptations: readonly SettlementAdaptation[],
  shift: SettlementShift,
): SettlementResidentActivity {
  const fieldUnderPressure = serviceUnderPressure(
    settlementId,
    "field",
    pressures,
    contributions,
    adaptations,
  );
  const routeUnderPressure =
    serviceUnderPressure(
      settlementId,
      "haul",
      pressures,
      contributions,
      adaptations,
    ) ||
    serviceUnderPressure(
      settlementId,
      "crossing",
      pressures,
      contributions,
      adaptations,
    ) ||
    serviceUnderPressure(
      settlementId,
      "exchange",
      pressures,
      contributions,
      adaptations,
    );
  if ((role.includes("grower") || role.includes("field")) && fieldUnderPressure)
    return "sheltering";
  if (role.includes("signal"))
    return serviceUnderPressure(
      settlementId,
      "information",
      pressures,
      contributions,
      adaptations,
    )
      ? "signal-watch"
      : "community-work";
  if (
    role.includes("hauler") ||
    role.includes("ferryman") ||
    role.includes("caller")
  )
    return routeUnderPressure ? "route-watch" : "yard-work";
  if (role.includes("yard") || role.includes("salvage"))
    return routeUnderPressure ? "yard-work" : "community-work";
  if (
    serviceUnderPressure(
      settlementId,
      "water",
      pressures,
      contributions,
      adaptations,
    )
  )
    return "water-watch";
  if (shift === "after-dark") {
    return role.includes("signal") ? "signal-watch" : "resting";
  }
  if (role.includes("grower") || role.includes("field")) return "field-work";
  return "community-work";
}

function residentColor(activity: SettlementResidentActivity): number {
  if (activity === "sheltering") return 0x46535a;
  if (activity === "water-watch") return 0x6f8e98;
  if (activity === "route-watch") return 0xd9aa52;
  if (activity === "field-work") return 0x789553;
  if (activity === "signal-watch") return 0x8d78b8;
  if (activity === "resting") return 0x6f6871;
  return 0xead8b8;
}

function serviceAvailability(
  settlementId: SettlementId,
  serviceId: string,
  pressures: readonly SettlementPressure[],
  contributions: readonly SettlementContribution[],
  adaptations: readonly SettlementAdaptation[],
): SettlementServiceProjection["availability"] {
  const severity = Math.max(
    0,
    ...pressures
      .filter((pressure) => pressure.affectedServices.includes(serviceId))
      .map((pressure) =>
        clamp(
          pressure.baseSeverity -
            totalRelief(
              settlementId,
              pressure.kind,
              contributions,
              adaptations,
              serviceId,
            ),
        ),
      ),
  );
  return severity >= 0.8 ? "sheltering" : severity >= 0.48 ? "limited" : "open";
}

function servicesFor(
  settlementId: SettlementId,
  pressures: readonly SettlementPressure[],
  contributions: readonly SettlementContribution[],
  adaptations: readonly SettlementAdaptation[],
  shift: SettlementShift,
): readonly SettlementServiceProjection[] {
  const reason =
    pressures[0]?.label ?? "The settlement can support ordinary local work.";
  return SERVICE_DEFINITIONS[settlementId].map((service) => {
    const availability = serviceAvailability(
      settlementId,
      service.id,
      pressures,
      contributions,
      adaptations,
    );
    return {
      id: `${settlementId}:service:${service.id}`,
      label: service.label,
      availability:
        availability === "open" && shift === "after-dark"
          ? "off-shift"
          : availability,
      reason:
        availability === "open" && shift === "after-dark"
          ? "The ordinary crew is off shift after dark."
          : reason,
    };
  });
}

function responsesFor(
  settlementId: SettlementId,
  pressures: readonly SettlementPressure[],
  contributions: readonly SettlementContribution[],
): readonly SettlementResponseProjection[] {
  const activeKinds = new Set(pressures.map((pressure) => pressure.kind));
  return SETTLEMENT_RESPONSE_DEFINITIONS.filter(
    (definition) =>
      definition.settlementId === settlementId &&
      activeKinds.has(definition.pressureKind),
  ).map((definition) => ({
    id: definition.id,
    materialEffectId: definition.materialEffectId,
    label: definition.label,
    explanation: definition.explanation,
    compatibleCapabilities: [definition.capability],
    interaction: definition.interaction,
    status: contributed(definition, contributions)
      ? "contributed"
      : "available",
    consequence: settlementMaterialEffect(definition.materialEffectId)
      ?.consequence,
  }));
}

export function deriveSettlementLife(
  state: GameState,
  knowledge: SettlementLifeWorldKnowledge,
): readonly SettlementLifeProjection[] {
  return SETTLEMENTS.map((definition) => {
    const contributions = state.settlements[definition.id].contributions;
    const adaptations = state.settlements[definition.id].adaptations;
    const pressures = derivePressures(state, definition.id, knowledge);
    const shift: SettlementShift =
      worldMinuteOfDay(state.worldTimeMinutes) >= NIGHT_START_MINUTE ||
      worldMinuteOfDay(state.worldTimeMinutes) < 400
        ? "after-dark"
        : "working";
    const residents = definition.residentAnchors.map((_, index) => {
      const role = RESIDENT_ROLES[definition.id][index] ?? "community hand";
      const activity = residentActivity(
        definition.id,
        role,
        pressures,
        contributions,
        adaptations,
        shift,
      );
      const direction = index % 2 === 0 ? 1 : -1;
      return {
        id: `${definition.id}:resident:${index}`,
        role,
        activity,
        anchorIndex: index,
        offsetX:
          activity === "sheltering" || activity === "resting"
            ? direction * 0.28
            : direction * 0.62,
        offsetZ:
          activity === "field-work"
            ? 0.92
            : activity === "route-watch"
              ? -0.7
              : activity === "resting"
                ? -0.28
                : 0.18,
        headingOffset: activity === "route-watch" ? direction * 0.55 : 0,
        color: residentColor(activity),
      };
    });
    const adaptationProjection = SETTLEMENT_ADAPTATION_DEFINITIONS.filter(
      (candidate) =>
        candidate.settlementId === definition.id &&
        adapted(candidate, adaptations),
    ).map((candidate) => ({
      id: candidate.id,
      materialEffectId: candidate.materialEffectId,
      label: candidate.label,
      explanation: candidate.explanation,
      consequence: settlementMaterialEffect(candidate.materialEffectId)
        ?.consequence,
    }));
    return {
      settlementId: definition.id,
      siteId: definition.siteId,
      name: definition.name,
      people: definition.people,
      shift,
      condition: deriveSettlementCondition(state, definition.id),
      favor: state.settlements[definition.id].favor,
      pressures,
      services: servicesFor(
        definition.id,
        pressures,
        contributions,
        adaptations,
        shift,
      ),
      residents,
      adaptations: adaptationProjection,
      responses: responsesFor(definition.id, pressures, contributions),
    };
  });
}

/**
 * A contact reports what their place can currently sustain. This is local
 * knowledge, not a task instruction and not a hidden acceptance prompt.
 */
export function settlementContactSpeech(
  settlement: SettlementLifeProjection,
): string {
  const adaptation = settlement.adaptations[0];
  const remembered = settlement.responses.find(
    (response) => response.status === "contributed",
  );
  const strained = settlement.services.filter(
    (service) => service.availability !== "open",
  );
  if (remembered && strained.length > 0) {
    return `${remembered.label} is already changing things here. ${strained.map((service) => service.label.toLowerCase()).join(" and ")} still need watching.`;
  }
  if (adaptation) {
    return `${adaptation.label}. ${adaptation.explanation}`;
  }
  if (remembered) {
    return `${remembered.label} is holding. People here can work again, but the place still remembers who made that possible.`;
  }
  if (settlement.shift === "after-dark" && settlement.pressures.length === 0) {
    return "The ordinary crew is off shift after dark. The place will be working again with the morning light.";
  }
  const pressure = settlement.pressures[0];
  return pressure
    ? `${pressure.label}. ${pressure.source}`
    : "The place is carrying its ordinary work today.";
}

/**
 * Communities may reorganize after a full world-day boundary. This returns
 * causal candidates only; state mutation remains in the kernel.
 */
export function communityAdaptationCandidates(
  state: GameState,
  knowledge: SettlementLifeWorldKnowledge,
): readonly SettlementAdaptationDefinition[] {
  return SETTLEMENT_ADAPTATION_DEFINITIONS.filter((definition) => {
    const record = state.settlements[definition.settlementId];
    if (adapted(definition, record.adaptations)) return false;
    if (
      record.contributions.some((entry) =>
        definition.blockedByContributionIds.includes(entry.responseId),
      )
    )
      return false;
    const pressure = derivePressures(
      state,
      definition.settlementId,
      knowledge,
    ).find((candidate) => candidate.kind === definition.pressureKind);
    return (pressure?.severity ?? 0) >= definition.minimumSeverity;
  });
}

/** Resolve local voluntary help. It never accepts a mission or changes a route gate. */
export function resolveSettlementContribution(
  state: GameState,
  knowledge: SettlementLifeWorldKnowledge,
  input: {
    x: number;
    z: number;
    capabilities: readonly RigCapability[];
    interaction: SettlementResponseInteraction;
  },
): SettlementResponseDefinition | null {
  const candidates = SETTLEMENT_RESPONSE_DEFINITIONS.flatMap((definition) => {
    if (
      definition.interaction !== input.interaction ||
      !input.capabilities.includes(definition.capability)
    )
      return [];
    const settlement = SETTLEMENTS.find(
      (candidate) => candidate.id === definition.settlementId,
    );
    const site = settlement ? findSite(settlement.siteId) : undefined;
    const affordance = settlementMaterialAffordanceForResponse(definition);
    if (!site || !affordance) return [];
    const distance = Math.hypot(
      input.x - (site.x + affordance.offsetX),
      input.z - (site.z + affordance.offsetZ),
    );
    if (distance > affordance.radius) return [];
    const contributions =
      state.settlements[definition.settlementId].contributions;
    const activeKinds = new Set(
      derivePressures(state, definition.settlementId, knowledge).map(
        (pressure) => pressure.kind,
      ),
    );
    return activeKinds.has(definition.pressureKind) &&
      !contributed(definition, contributions)
      ? [{ definition, distance }]
      : [];
  });
  return (
    candidates.sort(
      (left, right) =>
        left.distance - right.distance ||
        left.definition.id.localeCompare(right.definition.id),
    )[0]?.definition ?? null
  );
}
