/**
 * Persistent world infrastructure.
 *
 * Machines are authored world entities, not quest stages. They retain their
 * own condition and operating command, progress with the deterministic world
 * clock, and contribute spatial environmental effects used by normal physics.
 * A player rig is one possible service actor; no activity owns this state.
 */

import type { RigCapability } from "./contracts";
import {
  AFFORDANCE_CONTRACT_VERSION,
  resolveAffordance,
  type AffordanceResolution,
  type WorldAffordanceDefinition,
} from "./affordances";
import type { WeatherState } from "./weather";
import { findSite } from "./world";

export const INFRASTRUCTURE_NETWORK_VERSION = 1 as const;

export const INFRASTRUCTURE_ENTITY_IDS = [
  "sunken-flats-waterworks",
  "long-furrow-drain-pump",
  "quarry-dewatering-rig",
] as const;
export type InfrastructureEntityId = (typeof INFRASTRUCTURE_ENTITY_IDS)[number];

/** Save-only alias for the retired singleton identity. */
const LEGACY_FLOODGATE_ENTITY_ID = "floodgate-12";

export const INFRASTRUCTURE_COMPONENTS = [
  "hydraulic",
  "mechanical",
  "power",
  "control",
] as const;
export type InfrastructureComponent =
  (typeof INFRASTRUCTURE_COMPONENTS)[number];

export type InfrastructureEffect =
  | {
      kind: "water-level-offset";
      radiusM: number;
      operatingValue: number;
      dormantValue: number;
    }
  | {
      kind: "soil-moisture-offset";
      radiusM: number;
      operatingValue: number;
      dormantValue: number;
    }
  | {
      kind: "salvage-yield-multiplier";
      radiusM: number;
      operatingValue: number;
      dormantValue: number;
    }
  | {
      kind: "terrain-workability-multiplier";
      radiusM: number;
      operatingValue: number;
      dormantValue: number;
    }
  | {
      kind: "soil-drainage-rate-per-hour";
      radiusM: number;
      operatingValue: number;
      dormantValue: number;
    };

export interface InfrastructureDefinition {
  id: InfrastructureEntityId;
  name: string;
  siteId: string;
  x: number;
  z: number;
  interactionRadiusM: number;
  components: readonly InfrastructureComponent[];
  serviceCapabilities: readonly RigCapability[];
  serviceSalvageCost: number;
  serviceRecovery: number;
  operationalCondition: number;
  maintenanceCondition: number;
  wearPerWorldMinute: number;
  weatherExposure: number;
  initialCondition: number;
  initialCommandedOn: boolean;
  effects: readonly InfrastructureEffect[];
}

export interface InfrastructureEntityState {
  id: InfrastructureEntityId;
  known: boolean;
  commandedOn: boolean;
  condition: number;
  components: Record<InfrastructureComponent, number>;
  lastInspectedAtMs: number | null;
  lastServicedAtMs: number | null;
  lastServicedByRigId: string | null;
}

export interface InfrastructureNetworkState {
  version: typeof INFRASTRUCTURE_NETWORK_VERSION;
  entities: Record<InfrastructureEntityId, InfrastructureEntityState>;
}

export interface InfrastructureActorContext {
  rigId: string;
  x: number;
  z: number;
  capabilities: readonly RigCapability[];
  salvage: number;
  nowMs: number;
}

export type InfrastructureActionKind = "inspect" | "service" | "none";

export interface InfrastructureActionResolution {
  kind: InfrastructureActionKind;
  entityId: InfrastructureEntityId | null;
  label: string;
  ariaLabel: string;
  reason?: "out-of-range" | "missing-capability" | "insufficient-salvage";
  /** Shared capability-resolution evidence when service is not possible. */
  affordance?: AffordanceResolution;
}

export interface InfrastructureActionOutcome {
  accepted: boolean;
  network: InfrastructureNetworkState;
  salvageDelta: number;
  explanation: string;
  entityId: InfrastructureEntityId | null;
  action: InfrastructureActionKind;
}

export interface LocalInfrastructureEffects {
  waterLevelOffsetM: number;
  soilMoistureOffset: number;
  salvageYieldMultiplier: number;
  terrainWorkabilityMultiplier: number;
  soilDrainageRatePerHour: number;
  activeEntityIds: InfrastructureEntityId[];
}

function locationAt(siteId: string, localX: number, localZ: number) {
  const site = findSite(siteId);
  if (!site)
    throw new Error(`Infrastructure references unknown world site: ${siteId}.`);
  return { x: site.x + localX, z: site.z + localZ };
}

const sunkenFlats = locationAt("sunken-flats", 0, 0);
const longFurrow = locationAt("long-furrow", -11, 6);
const quarryShelf = locationAt("quarry-shelf", 10.5, 0);

export const INFRASTRUCTURE_DEFINITIONS: Readonly<
  Record<InfrastructureEntityId, InfrastructureDefinition>
> = {
  "sunken-flats-waterworks": {
    id: "sunken-flats-waterworks",
    name: "Sunken Flats Waterworks",
    siteId: "sunken-flats",
    ...sunkenFlats,
    interactionRadiusM: 10,
    components: ["hydraulic", "mechanical", "control"],
    serviceCapabilities: ["tow"],
    serviceSalvageCost: 4,
    serviceRecovery: 62,
    operationalCondition: 55,
    maintenanceCondition: 76,
    wearPerWorldMinute: 0.018,
    weatherExposure: 0.16,
    initialCondition: 18,
    initialCommandedOn: false,
    effects: [
      {
        kind: "water-level-offset",
        radiusM: 68,
        operatingValue: -2.6,
        dormantValue: 1.05,
      },
      {
        kind: "soil-moisture-offset",
        radiusM: 68,
        operatingValue: -0.5,
        dormantValue: 0.18,
      },
    ],
  },
  "long-furrow-drain-pump": {
    id: "long-furrow-drain-pump",
    name: "Long Furrow Drain Pump",
    siteId: "long-furrow",
    ...longFurrow,
    interactionRadiusM: 9,
    components: ["hydraulic", "power"],
    serviceCapabilities: ["plough"],
    serviceSalvageCost: 2,
    serviceRecovery: 38,
    operationalCondition: 42,
    maintenanceCondition: 68,
    wearPerWorldMinute: 0.01,
    weatherExposure: 0.08,
    initialCondition: 82,
    initialCommandedOn: true,
    effects: [
      {
        kind: "water-level-offset",
        radiusM: 44,
        operatingValue: -0.7,
        dormantValue: 0.28,
      },
      {
        kind: "soil-moisture-offset",
        radiusM: 52,
        operatingValue: -0.26,
        dormantValue: 0.16,
      },
      {
        kind: "terrain-workability-multiplier",
        radiusM: 52,
        operatingValue: 1.35,
        dormantValue: 0.42,
      },
      {
        kind: "soil-drainage-rate-per-hour",
        radiusM: 52,
        operatingValue: 0.24,
        dormantValue: -0.03,
      },
    ],
  },
  "quarry-dewatering-rig": {
    id: "quarry-dewatering-rig",
    name: "Quarry Dewatering Rig",
    siteId: "quarry-shelf",
    ...quarryShelf,
    interactionRadiusM: 12,
    components: ["mechanical", "power", "control"],
    serviceCapabilities: ["tow"],
    serviceSalvageCost: 3,
    serviceRecovery: 44,
    operationalCondition: 48,
    maintenanceCondition: 70,
    wearPerWorldMinute: 0.014,
    weatherExposure: 0.12,
    initialCondition: 64,
    initialCommandedOn: true,
    effects: [
      {
        kind: "water-level-offset",
        radiusM: 56,
        operatingValue: -1.15,
        dormantValue: 0.52,
      },
      {
        kind: "soil-moisture-offset",
        radiusM: 42,
        operatingValue: -0.2,
        dormantValue: 0.1,
      },
      {
        kind: "salvage-yield-multiplier",
        radiusM: 58,
        operatingValue: 1.65,
        dormantValue: 0.72,
      },
    ],
  },
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function fullComponentState(
  value: number,
): Record<InfrastructureComponent, number> {
  return {
    hydraulic: value,
    mechanical: value,
    power: value,
    control: value,
  };
}

function conditionFor(
  definition: InfrastructureDefinition,
  components: Record<InfrastructureComponent, number>,
): number {
  const total = definition.components.reduce(
    (sum, component) => sum + components[component],
    0,
  );
  return Number((total / definition.components.length).toFixed(2));
}

function entityState(
  definition: InfrastructureDefinition,
): InfrastructureEntityState {
  const components = fullComponentState(definition.initialCondition);
  return {
    id: definition.id,
    known: false,
    commandedOn: definition.initialCommandedOn,
    condition: conditionFor(definition, components),
    components,
    lastInspectedAtMs: null,
    lastServicedAtMs: null,
    lastServicedByRigId: null,
  };
}

export function createInfrastructureNetworkState(): InfrastructureNetworkState {
  return {
    version: INFRASTRUCTURE_NETWORK_VERSION,
    entities: {
      "sunken-flats-waterworks": entityState(
        INFRASTRUCTURE_DEFINITIONS["sunken-flats-waterworks"],
      ),
      "long-furrow-drain-pump": entityState(
        INFRASTRUCTURE_DEFINITIONS["long-furrow-drain-pump"],
      ),
      "quarry-dewatering-rig": entityState(
        INFRASTRUCTURE_DEFINITIONS["quarry-dewatering-rig"],
      ),
    },
  };
}

export function infrastructureIsOperating(
  definition: InfrastructureDefinition,
  state: InfrastructureEntityState,
): boolean {
  return (
    state.commandedOn && state.condition >= definition.operationalCondition
  );
}

function nearestDefinition(
  actor: InfrastructureActorContext,
): { definition: InfrastructureDefinition; distanceM: number } | null {
  let nearest: {
    definition: InfrastructureDefinition;
    distanceM: number;
  } | null = null;
  for (const id of INFRASTRUCTURE_ENTITY_IDS) {
    const definition = INFRASTRUCTURE_DEFINITIONS[id];
    const distanceM = Math.hypot(
      actor.x - definition.x,
      actor.z - definition.z,
    );
    if (distanceM > definition.interactionRadiusM) continue;
    if (!nearest || distanceM < nearest.distanceM)
      nearest = { definition, distanceM };
  }
  return nearest;
}

function serviceAffordanceFor(
  definition: InfrastructureDefinition,
): WorldAffordanceDefinition {
  if (definition.serviceCapabilities.length !== 1) {
    throw new Error(
      `${definition.id} must declare exactly one service capability until multi-capability affordances are introduced.`,
    );
  }
  return {
    id: `infrastructure-service:${definition.id}`,
    version: AFFORDANCE_CONTRACT_VERSION,
    owningDomain: "world",
    requiredCapability: definition.serviceCapabilities[0]!,
  };
}

export function resolveInfrastructureAction(
  network: InfrastructureNetworkState,
  actor: InfrastructureActorContext,
): InfrastructureActionResolution {
  const nearest = nearestDefinition(actor);
  if (!nearest) {
    return {
      kind: "none",
      entityId: null,
      label: "",
      ariaLabel: "No infrastructure machine is in reach",
      reason: "out-of-range",
    };
  }
  const { definition } = nearest;
  const entity = network.entities[definition.id];
  if (!entity.known) {
    return {
      kind: "inspect",
      entityId: definition.id,
      label: `Inspect ${definition.name}`,
      ariaLabel: `Inspect ${definition.name}`,
    };
  }
  const needsService =
    !infrastructureIsOperating(definition, entity) ||
    entity.condition < definition.maintenanceCondition;
  if (!needsService) {
    return {
      kind: "none",
      entityId: definition.id,
      label: "",
      ariaLabel: `${definition.name} is operating normally`,
    };
  }
  const serviceAffordance = resolveAffordance(
    serviceAffordanceFor(definition),
    { capabilities: actor.capabilities },
    { available: needsService, inRange: true },
  );
  if (serviceAffordance.outcome !== "legal") {
    return {
      kind: "none",
      entityId: definition.id,
      label: `${definition.serviceCapabilities.join(" + ")} required`,
      ariaLabel: `${definition.name} needs ${definition.serviceCapabilities.join(" and ")} capability for service`,
      reason: "missing-capability",
      affordance: serviceAffordance,
    };
  }
  if (actor.salvage < definition.serviceSalvageCost) {
    return {
      kind: "none",
      entityId: definition.id,
      label: `${definition.serviceSalvageCost} salvage needed`,
      ariaLabel: `${definition.name} needs ${definition.serviceSalvageCost} salvage for service`,
      reason: "insufficient-salvage",
    };
  }
  return {
    kind: "service",
    entityId: definition.id,
    label: `Service ${definition.name}`,
    ariaLabel: `Service ${definition.name} for ${definition.serviceSalvageCost} salvage`,
  };
}

export function performInfrastructureAction(
  network: InfrastructureNetworkState,
  actor: InfrastructureActorContext,
  requestedAction: Exclude<InfrastructureActionKind, "none">,
): InfrastructureActionOutcome {
  const resolution = resolveInfrastructureAction(network, actor);
  if (resolution.kind !== requestedAction || resolution.entityId === null) {
    return {
      accepted: false,
      network,
      salvageDelta: 0,
      explanation: resolution.label || "No machine action is available here.",
      entityId: resolution.entityId,
      action: requestedAction,
    };
  }
  const definition = INFRASTRUCTURE_DEFINITIONS[resolution.entityId];
  const prior = network.entities[definition.id];
  if (requestedAction === "inspect") {
    const next: InfrastructureEntityState = {
      ...prior,
      known: true,
      lastInspectedAtMs: actor.nowMs,
    };
    return {
      accepted: true,
      network: {
        ...network,
        entities: { ...network.entities, [definition.id]: next },
      },
      salvageDelta: 0,
      explanation: `${definition.name} is ${infrastructureIsOperating(definition, prior) ? "operating" : "not holding pressure"}; its ${definition.components.join(", ")} system is at ${Math.round(prior.condition)}% condition.`,
      entityId: definition.id,
      action: requestedAction,
    };
  }
  const components = { ...prior.components };
  for (const component of definition.components) {
    components[component] = clamp(
      components[component] + definition.serviceRecovery,
      0,
      100,
    );
  }
  const next: InfrastructureEntityState = {
    ...prior,
    commandedOn: true,
    components,
    condition: conditionFor(definition, components),
    lastServicedAtMs: actor.nowMs,
    lastServicedByRigId: actor.rigId,
  };
  return {
    accepted: true,
    network: {
      ...network,
      entities: { ...network.entities, [definition.id]: next },
    },
    salvageDelta: -definition.serviceSalvageCost,
    explanation: `${definition.name} is back in the world network. Local ground and water will respond while it holds.`,
    entityId: definition.id,
    action: requestedAction,
  };
}

/** Advance every machine even when no player is nearby or active. */
export function advanceInfrastructure(
  network: InfrastructureNetworkState,
  weather: WeatherState,
  seconds: number,
): void {
  if (!Number.isFinite(seconds) || seconds <= 0) return;
  const worldMinutes = seconds / 2.4;
  const stormLoad = weather.phase === "storm" ? 0.08 : 0;
  for (const id of INFRASTRUCTURE_ENTITY_IDS) {
    const definition = INFRASTRUCTURE_DEFINITIONS[id];
    const prior = network.entities[id];
    const operating = infrastructureIsOperating(definition, prior);
    const weatherWear =
      (weather.rainIntensity + stormLoad) * definition.weatherExposure;
    const operatingWear = operating ? definition.wearPerWorldMinute : 0;
    const wear = (weatherWear + operatingWear) * worldMinutes;
    if (wear <= 0) continue;
    const components = { ...prior.components };
    for (const component of definition.components) {
      components[component] = clamp(components[component] - wear, 0, 100);
    }
    network.entities[id] = {
      ...prior,
      components,
      condition: conditionFor(definition, components),
    };
  }
}

function influenceAt(
  x: number,
  z: number,
  definition: InfrastructureDefinition,
  radiusM: number,
): number {
  const distance = Math.hypot(x - definition.x, z - definition.z);
  if (distance >= radiusM) return 0;
  const t = 1 - distance / radiusM;
  return t * t * (3 - 2 * t);
}

export function deriveInfrastructureEffects(
  network: InfrastructureNetworkState,
  x: number,
  z: number,
): LocalInfrastructureEffects {
  let waterLevelOffsetM = 0;
  let soilMoistureOffset = 0;
  let salvageYieldMultiplier = 1;
  let terrainWorkabilityMultiplier = 1;
  let soilDrainageRatePerHour = 0;
  const activeEntityIds: InfrastructureEntityId[] = [];
  for (const id of INFRASTRUCTURE_ENTITY_IDS) {
    const definition = INFRASTRUCTURE_DEFINITIONS[id];
    const entity = network.entities[id];
    const operating = infrastructureIsOperating(definition, entity);
    if (operating) activeEntityIds.push(id);
    for (const effect of definition.effects) {
      const influence = influenceAt(x, z, definition, effect.radiusM);
      if (influence === 0) continue;
      const value = operating ? effect.operatingValue : effect.dormantValue;
      if (effect.kind === "water-level-offset") {
        waterLevelOffsetM += value * influence;
      } else if (effect.kind === "soil-moisture-offset") {
        soilMoistureOffset += value * influence;
      } else if (effect.kind === "salvage-yield-multiplier") {
        salvageYieldMultiplier *= 1 + (value - 1) * influence;
      } else if (effect.kind === "terrain-workability-multiplier") {
        terrainWorkabilityMultiplier *= 1 + (value - 1) * influence;
      } else {
        soilDrainageRatePerHour += value * influence;
      }
    }
  }
  return {
    waterLevelOffsetM: Number(waterLevelOffsetM.toFixed(3)),
    soilMoistureOffset: Number(soilMoistureOffset.toFixed(3)),
    salvageYieldMultiplier: Number(
      clamp(salvageYieldMultiplier, 0.25, 3).toFixed(3),
    ),
    terrainWorkabilityMultiplier: Number(
      clamp(terrainWorkabilityMultiplier, 0.35, 1.8).toFixed(3),
    ),
    soilDrainageRatePerHour: Number(
      clamp(soilDrainageRatePerHour, -0.08, 0.4).toFixed(3),
    ),
    activeEntityIds,
  };
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function legacyFloodgateCondition(
  value: unknown,
): InfrastructureEntityState | null {
  if (!value || typeof value !== "object") return null;
  const legacy = value as Record<string, unknown>;
  const status = String(legacy.status ?? "dormant");
  const definition = INFRASTRUCTURE_DEFINITIONS["sunken-flats-waterworks"];
  const condition =
    status === "restored"
      ? 100
      : status === "stabilized"
        ? 70
        : status === "diagnosed"
          ? 42
          : status === "discovered"
            ? 28
            : definition.initialCondition;
  const components = fullComponentState(condition);
  return {
    id: definition.id,
    known: status !== "dormant",
    commandedOn: status === "restored" || status === "stabilized",
    condition: conditionFor(definition, components),
    components,
    lastInspectedAtMs:
      typeof legacy.discoveredAtMs === "number" &&
      Number.isFinite(legacy.discoveredAtMs)
        ? legacy.discoveredAtMs
        : null,
    lastServicedAtMs:
      typeof legacy.restoredAtMs === "number" &&
      Number.isFinite(legacy.restoredAtMs)
        ? legacy.restoredAtMs
        : null,
    lastServicedByRigId:
      typeof legacy.restoredByRigId === "string"
        ? legacy.restoredByRigId
        : null,
  };
}

/**
 * Recovers prior records without preserving the retired Floodgate singleton as
 * a second authoritative state shape.
 */
export function recoverInfrastructureNetwork(
  value: unknown,
  legacyFloodgate: unknown,
): InfrastructureNetworkState {
  const network = createInfrastructureNetworkState();
  const candidate =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : null;
  const entities =
    candidate?.entities && typeof candidate.entities === "object"
      ? (candidate.entities as Record<string, unknown>)
      : null;
  if (!entities) {
    const legacy = legacyFloodgateCondition(legacyFloodgate);
    if (legacy) network.entities[legacy.id] = legacy;
    return network;
  }
  for (const id of INFRASTRUCTURE_ENTITY_IDS) {
    const definition = INFRASTRUCTURE_DEFINITIONS[id];
    const raw =
      entities[id] ??
      (id === "sunken-flats-waterworks"
        ? entities[LEGACY_FLOODGATE_ENTITY_ID]
        : undefined);
    if (!raw || typeof raw !== "object") continue;
    const record = raw as Record<string, unknown>;
    const components = { ...network.entities[id].components };
    const rawComponents =
      record.components && typeof record.components === "object"
        ? (record.components as Record<string, unknown>)
        : null;
    for (const component of definition.components) {
      components[component] = clamp(
        finiteNumber(rawComponents?.[component], components[component]),
        0,
        100,
      );
    }
    network.entities[id] = {
      id,
      known: record.known === true,
      commandedOn:
        typeof record.commandedOn === "boolean"
          ? record.commandedOn
          : definition.initialCommandedOn,
      components,
      condition: conditionFor(definition, components),
      // `finiteNumber(x, 0) || null` would fold a legitimate timestamp of
      // exactly 0ms into null, since 0 is falsy — this checks finiteness
      // directly instead of coalescing through a falsy fallback.
      lastInspectedAtMs:
        typeof record.lastInspectedAtMs === "number" &&
        Number.isFinite(record.lastInspectedAtMs)
          ? record.lastInspectedAtMs
          : null,
      lastServicedAtMs:
        typeof record.lastServicedAtMs === "number" &&
        Number.isFinite(record.lastServicedAtMs)
          ? record.lastServicedAtMs
          : null,
      lastServicedByRigId:
        typeof record.lastServicedByRigId === "string"
          ? record.lastServicedByRigId
          : null,
    };
  }
  return network;
}

export function publicInfrastructureNetwork(
  network: InfrastructureNetworkState,
  actorX: number,
  actorZ: number,
) {
  return INFRASTRUCTURE_ENTITY_IDS.map((id) => {
    const definition = INFRASTRUCTURE_DEFINITIONS[id];
    const entity = network.entities[id];
    return {
      id,
      name: definition.name,
      siteId: definition.siteId,
      x: definition.x,
      z: definition.z,
      distanceMeters: Number(
        Math.hypot(actorX - definition.x, actorZ - definition.z).toFixed(2),
      ),
      known: entity.known,
      condition: entity.condition,
      operating: infrastructureIsOperating(definition, entity),
      commandedOn: entity.commandedOn,
      components: { ...entity.components },
      lastInspectedAtMs: entity.lastInspectedAtMs,
      lastServicedAtMs: entity.lastServicedAtMs,
      lastServicedByRigId: entity.lastServicedByRigId,
    };
  });
}
