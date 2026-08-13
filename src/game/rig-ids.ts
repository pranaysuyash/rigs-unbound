/**
 * Foundational rig identity vocabulary.
 *
 * Kept dependency-free so authored world data and gameplay contracts can share
 * the exact same IDs without importing each other or duplicating a union.
 */
export const RIG_IDS = [
  "utility-tractor",
  "toy-buggy",
  "marsh-skimmer",
  "heavy-utility-tow-recovery-01",
  "heavy-salvage-crane-02",
  "snow-crawler-expedition-01",
  "harvester-combined-cultivator-01",
  "sentinel-mobile-fort-01",
  "aero-skimmer-survey-01",
  "aero-cargo-freighter-02",
  "torque-field-cutter-02",
  "spark-dune-runner-02",
  "marsh-dredger-heavy-02",
  "hauler-road-train-01",
  "construction-excavator-01",
  "micro-scout-pipe-crawler-01",
] as const;

export type RigId = (typeof RIG_IDS)[number];
