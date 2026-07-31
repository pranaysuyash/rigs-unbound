/**
 * Persistent regional ecology.
 *
 * Ecology actors are world groups, not mission states or renderer effects.
 * They inhabit terrain, respond to changing land, and can leave durable land
 * pressure through the existing field-condition authority. Individual animals
 * may later be promoted from a group when a specific interaction requires it.
 */

export const ECOLOGY_ACTOR_KINDS = ["grazers", "waders", "scavengers"] as const;
export type EcologyActorKind = (typeof ECOLOGY_ACTOR_KINDS)[number];

export interface EcologyActorState {
  id: string;
  kind: EcologyActorKind;
  x: number;
  z: number;
  territoryRadiusMeters: number;
  population: number;
  vitality: number;
  /** Decaying memory of a locally disruptive encounter. */
  recentDisturbance: number;
}

export interface EcologyObservation {
  waterDepthM: number;
  vegetationCoverage: number;
  rootDensity: number;
  soilHealth: number;
  disturbance: number;
  nearDisruption: boolean;
}

export interface EcologyAdvanceContext {
  worldTimeMinutes: number;
  rainIntensity: number;
  observe(x: number, z: number): EcologyObservation;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function stablePhase(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function populationLimit(kind: EcologyActorKind): number {
  if (kind === "waders") return 12;
  if (kind === "grazers") return 9;
  return 7;
}

function suitability(
  kind: EcologyActorKind,
  observation: EcologyObservation,
  rainIntensity: number,
): number {
  const water = clamp(observation.waterDepthM / 1.5, 0, 1);
  const rain = clamp(rainIntensity, 0, 1);
  if (kind === "grazers") {
    return clamp(
      observation.vegetationCoverage * 0.52 +
        observation.rootDensity * 0.16 +
        observation.soilHealth * 0.12 -
        water * 0.44 -
        observation.disturbance * 0.34 -
        rain * 0.08,
      0,
      1,
    );
  }
  if (kind === "waders") {
    return clamp(
      water * 0.58 +
        rain * 0.16 +
        observation.soilHealth * 0.08 -
        observation.disturbance * 0.22,
      0,
      1,
    );
  }
  return clamp(
    (observation.nearDisruption ? 0.5 : 0.14) +
      observation.soilHealth * 0.1 +
      (1 - water) * 0.12 -
      observation.disturbance * 0.18 -
      rain * 0.06,
    0,
    1,
  );
}

export function createEcologyActor(actor: EcologyActorState): EcologyActorState {
  return {
    ...actor,
    territoryRadiusMeters: clamp(actor.territoryRadiusMeters, 8, 160),
    population: Math.round(clamp(actor.population, 1, populationLimit(actor.kind))),
    vitality: clamp(actor.vitality, 0, 1),
    recentDisturbance: clamp(actor.recentDisturbance ?? 0, 0, 1),
  };
}

export function recoverEcologyActor(value: unknown): EcologyActorState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<EcologyActorState>;
  if (
    typeof candidate.id !== "string" ||
    candidate.id.length < 1 ||
    candidate.id.length > 80 ||
    !ECOLOGY_ACTOR_KINDS.includes(candidate.kind as EcologyActorKind) ||
    !Number.isFinite(candidate.x) ||
    !Number.isFinite(candidate.z) ||
    !Number.isFinite(candidate.territoryRadiusMeters) ||
    !Number.isFinite(candidate.population) ||
    !Number.isFinite(candidate.vitality) ||
    Math.abs(candidate.x as number) > 100_000 ||
    Math.abs(candidate.z as number) > 100_000
  ) {
    return null;
  }
  return createEcologyActor(candidate as EcologyActorState);
}

/** Advance one regional group by one ecology cadence, without owning world mutation. */
export function advanceEcologyActor(
  actor: EcologyActorState,
  context: EcologyAdvanceContext,
): EcologyActorState {
  const hour = Math.floor(context.worldTimeMinutes / 60);
  const stride = actor.territoryRadiusMeters * 0.18;
  const phase = stablePhase(`${actor.id}:${hour}`) * Math.PI * 2;
  const candidates = [
    { x: actor.x, z: actor.z },
    { x: actor.x + Math.cos(phase) * stride, z: actor.z + Math.sin(phase) * stride },
    {
      x: actor.x + Math.cos(phase + Math.PI * 0.5) * stride,
      z: actor.z + Math.sin(phase + Math.PI * 0.5) * stride,
    },
    {
      x: actor.x + Math.cos(phase + Math.PI) * stride,
      z: actor.z + Math.sin(phase + Math.PI) * stride,
    },
    {
      x: actor.x + Math.cos(phase + Math.PI * 1.5) * stride,
      z: actor.z + Math.sin(phase + Math.PI * 1.5) * stride,
    },
  ];
  let selected = candidates[0]!;
  let selectedScore = suitability(
    actor.kind,
    context.observe(selected.x, selected.z),
    context.rainIntensity,
  );
  for (const candidate of candidates.slice(1)) {
    const candidateScore = suitability(
      actor.kind,
      context.observe(candidate.x, candidate.z),
      context.rainIntensity,
    );
    if (candidateScore > selectedScore) {
      selected = candidate;
      selectedScore = candidateScore;
    }
  }

  const targetPopulation = Math.max(
    1,
    Math.round(1 + selectedScore * (populationLimit(actor.kind) - 1)),
  );
  return createEcologyActor({
    ...actor,
    x: selected.x,
    z: selected.z,
    population: actor.population + clamp(targetPopulation - actor.population, -1, 1),
    vitality: actor.vitality + (selectedScore - actor.vitality) * 0.16,
    recentDisturbance: Math.max(0, actor.recentDisturbance - 0.18),
  });
}

/** Grazing is the first physical ecology effect. Other kinds may add effects later. */
export function grazingPressure(actor: EcologyActorState): number {
  return actor.kind === "grazers"
    ? clamp((actor.population / populationLimit(actor.kind)) * actor.vitality * 0.028, 0, 0.028)
    : 0;
}
