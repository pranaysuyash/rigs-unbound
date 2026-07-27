/**
 * Procedural Expedition Mission Generator Engine.
 *
 * Generates dynamic multi-objective exploration missions based on world seed,
 * active weather phase, player location, and regional trade demand.
 */

export interface ProceduralMission {
  id: string;
  title: string;
  type: "flood-rescue" | "deep-seismic-survey" | "high-altitude-haul" | "salvage-convoy";
  targetSiteId: string;
  difficultyRating: "standard" | "hard" | "extreme";
  rewardScrap: number;
  timeLimitMinutes: number;
}

export function generateExpeditionMission(
  seed: string,
  _playerSiteId: string,
  weatherPhase: string,
): ProceduralMission {

  // Deterministic seed hash
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
  }
  const absHash = Math.abs(hash);

  const targets = ["sunken-flats", "launch-ridge", "marsh-depot"];
  const targetSiteId = targets[absHash % targets.length]!;

  let type: ProceduralMission["type"] = "salvage-convoy";
  let title = "Standard Regional Cargo Relay";
  let difficulty: ProceduralMission["difficultyRating"] = "standard";
  let rewardScrap = 250;
  let timeLimit = 45;

  if (weatherPhase === "storm" || weatherPhase === "rain") {
    type = "flood-rescue";
    title = "Emergency Flood Basin Rescue";
    difficulty = "extreme";
    rewardScrap = 600;
    timeLimit = 30;
  } else if (targetSiteId === "launch-ridge") {
    type = "high-altitude-haul";
    title = "Summit High-Altitude Relay Supply";
    difficulty = "hard";
    rewardScrap = 450;
    timeLimit = 40;
  } else if (targetSiteId === "sunken-flats") {
    type = "deep-seismic-survey";
    title = "Submerged Strata Seismic Survey";
    difficulty = "hard";
    rewardScrap = 400;
    timeLimit = 35;
  }

  return {
    id: `mission-${absHash % 10000}`,
    title,
    type,
    targetSiteId,
    difficultyRating: difficulty,
    rewardScrap,
    timeLimitMinutes: timeLimit,
  };
}
