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
] as const;

export type RigId = (typeof RIG_IDS)[number];
