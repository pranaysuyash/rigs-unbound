/**
 * Deterministic living-frontier habitat projection.
 *
 * Habitat describes local environmental opportunity. Persistent regional
 * ecology actors may embody that opportunity in the world; renderer instances
 * are only one presentation of it. World systems remain the authority for
 * moisture, vegetation, weather, terrain, disturbance, and ecology history.
 */

export const HABITAT_CONTRACT_VERSION = 1 as const;

export const HABITAT_TERRAINS = [
  "floodplain",
  "field-margin",
  "quarry-edge",
  "woodland",
  "roadside",
] as const;
export type HabitatTerrain = (typeof HABITAT_TERRAINS)[number];

export const HABITAT_SPECIES = [
  "wading-bird",
  "field-bird",
  "small-grazer",
  "corvid",
] as const;
export type HabitatSpecies = (typeof HABITAT_SPECIES)[number];

export type HabitatOccupancy = "active" | "wary" | "absent";

export interface HabitatObservation {
  terrain: HabitatTerrain;
  worldTimeMinutes: number;
  soilMoisture: number;
  waterDepthM: number;
  vegetationCoverage: number;
  rootDensity: number;
  rainIntensity: number;
  /** Normalized recent vehicle or machinery presence at this location. */
  disturbance: number;
  /** A nearby physical disruption, such as a persistent road runout. */
  recentDisruption: boolean;
}

export interface HabitatOccupant {
  species: HabitatSpecies;
  occupancy: HabitatOccupancy;
  /** 0..1 suitability before local disturbance changes behavior. */
  habitatScore: number;
  /** Stable, low-cost presentation population for this environmental state. */
  visibleCount: number;
}

export interface HabitatProjection {
  version: typeof HABITAT_CONTRACT_VERSION;
  activity: "quiet" | "stirring" | "sheltering";
  occupants: readonly HabitatOccupant[];
}

function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function rounded(value: number): number {
  return Number(value.toFixed(3));
}

function daylight(worldTimeMinutes: number): number {
  const dayMinute = ((Math.floor(worldTimeMinutes) % 1440) + 1440) % 1440;
  // Dawn and dusk are most active. Midnight is deliberately quiet.
  const solar = Math.sin(((dayMinute - 360) / 720) * Math.PI);
  return clamp(solar);
}

function scoreFor(
  species: HabitatSpecies,
  observation: HabitatObservation,
): number {
  const moisture = clamp(observation.soilMoisture);
  const water = clamp(observation.waterDepthM / 1.5);
  const vegetation = clamp(observation.vegetationCoverage);
  const roots = clamp(observation.rootDensity);
  const rain = clamp(observation.rainIntensity);
  const day = daylight(observation.worldTimeMinutes);

  if (species === "wading-bird") {
    return clamp(
      (observation.terrain === "floodplain" ? 0.36 : 0) +
        water * 0.42 +
        moisture * 0.16 +
        day * 0.16 -
        rain * 0.22,
    );
  }
  if (species === "field-bird") {
    return clamp(
      (observation.terrain === "field-margin" ? 0.34 : 0) +
        vegetation * 0.3 +
        roots * 0.12 +
        day * 0.2 -
        water * 0.18 -
        rain * 0.16,
    );
  }
  if (species === "small-grazer") {
    return clamp(
      (observation.terrain === "field-margin" ||
      observation.terrain === "woodland"
        ? 0.3
        : 0) +
        vegetation * 0.36 +
        roots * 0.12 +
        (1 - rain) * 0.1 -
        water * 0.24,
    );
  }
  return clamp(
    (observation.terrain === "quarry-edge" || observation.terrain === "roadside"
      ? 0.24
      : 0) +
      (observation.recentDisruption ? 0.38 : 0) +
      day * 0.12 +
      (1 - water) * 0.08 -
      rain * 0.08,
  );
}

function occupancyFor(score: number, disturbance: number): HabitatOccupancy {
  if (score < 0.28 || disturbance >= 0.82) return "absent";
  if (score < 0.5 || disturbance >= 0.38) return "wary";
  return "active";
}

function countFor(
  species: HabitatSpecies,
  score: number,
  occupancy: HabitatOccupancy,
): number {
  if (occupancy === "absent") return 0;
  const ceiling = species === "small-grazer" ? 4 : species === "corvid" ? 6 : 8;
  const base = Math.max(1, Math.round(score * ceiling));
  return occupancy === "wary" ? Math.max(1, Math.ceil(base / 2)) : base;
}

/**
 * Produces stable ambient occupants for one locally-observed patch.
 * Repeating the same observation produces exactly the same projection.
 */
export function deriveHabitatProjection(
  observation: HabitatObservation,
): HabitatProjection {
  const disturbance = clamp(observation.disturbance);
  const occupants = HABITAT_SPECIES.map((species) => {
    const habitatScore = rounded(scoreFor(species, observation));
    const occupancy = occupancyFor(habitatScore, disturbance);
    return {
      species,
      occupancy,
      habitatScore,
      visibleCount: countFor(species, habitatScore, occupancy),
    };
  }).filter((occupant) => occupant.visibleCount > 0);

  return {
    version: HABITAT_CONTRACT_VERSION,
    activity:
      observation.rainIntensity >= 0.7
        ? "sheltering"
        : disturbance >= 0.38
          ? "stirring"
          : "quiet",
    occupants,
  };
}
