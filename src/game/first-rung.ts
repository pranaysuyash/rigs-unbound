import {
  MODULES,
  RIG_IDS,
  type GameState,
  type ModuleId,
  type RigId,
} from "./contracts";
import { FIRST_SALVAGE_NODE, SALVAGE_PICKUP_RADIUS } from "./exploration";
import { HOME_SITE } from "./world";

export const FIRST_RUNG_RECOMMENDED_MODULE: ModuleId = "lug-tires";

export type FirstRungStage =
  | "find-cache"
  | "collect-cache"
  | "earn-more"
  | "return-home"
  | "choose-part"
  | "free-explore";

export interface FirstRungResolution {
  stage: FirstRungStage;
  objective: string;
  shortLabel: string;
  ariaLabel: string;
  reason: string;
  target: { x: number; z: number } | null;
  recommendedModuleId: ModuleId | null;
  recommendedRigId: RigId | null;
  affordable: boolean;
  complete: boolean;
}

function atHomeWorkshop(state: GameState): boolean {
  const rig = state.rigs[state.activeRigId];
  return (
    Math.hypot(rig.x - HOME_SITE.x, rig.z - HOME_SITE.z) <=
    (HOME_SITE.serviceRadius ?? HOME_SITE.discoverRadius)
  );
}

function firstCompatibleRig(
  state: GameState,
  moduleId: ModuleId,
): RigId | null {
  const definition = MODULES[moduleId];
  if (definition.fits.includes(state.activeRigId)) return state.activeRigId;
  return RIG_IDS.find((rigId) => definition.fits.includes(rigId)) ?? null;
}

function hasFittedPart(state: GameState): boolean {
  return RIG_IDS.some((rigId) => state.rigs[rigId].modules.length > 0);
}

/**
 * Resolve the first progression rung from canonical state only.
 *
 * This query deliberately owns no tutorial flags. Collection lives in world
 * memory, currency and fitted modules live in the save, and workshop reach is a
 * spatial fact. A restored or unusual save therefore receives truthful
 * guidance without migrating a parallel quest state machine.
 */
export function resolveFirstRung(
  state: GameState,
  collectedNodes: ReadonlySet<string>,
): FirstRungResolution {
  if (hasFittedPart(state)) {
    return {
      stage: "free-explore",
      objective: "Use your fitted part",
      shortLabel: "Try the upgrade",
      ariaLabel:
        "First upgrade fitted. Explore and use the new traversal capability.",
      reason: "At least one rig has a fitted module.",
      target: null,
      recommendedModuleId: null,
      recommendedRigId: null,
      affordable: false,
      complete: true,
    };
  }

  const recommendedModuleId = FIRST_RUNG_RECOMMENDED_MODULE;
  const recommendedModule = MODULES[recommendedModuleId];
  const recommendedRigId = firstCompatibleRig(state, recommendedModuleId);
  const affordable = state.salvage >= recommendedModule.cost;

  if (affordable) {
    if (!atHomeWorkshop(state)) {
      return {
        stage: "return-home",
        objective: "Return to Home Silo",
        shortLabel: "Return home",
        ariaLabel: `Return to Home Silo and fit ${recommendedModule.name} for ${recommendedModule.cost} salvage.`,
        reason: "The first recommended part is affordable away from Home.",
        target: { x: HOME_SITE.x, z: HOME_SITE.z },
        recommendedModuleId,
        recommendedRigId,
        affordable,
        complete: false,
      };
    }

    const activeRigCanFit = recommendedRigId === state.activeRigId;
    return {
      stage: "choose-part",
      objective: activeRigCanFit
        ? `Fit ${recommendedModule.name}`
        : `Switch rig · fit ${recommendedModule.name}`,
      shortLabel: activeRigCanFit ? "Fit a part" : "Switch and fit",
      ariaLabel: activeRigCanFit
        ? `At Home Silo, fit ${recommendedModule.name} for ${recommendedModule.cost} salvage. ${recommendedModule.promise}`
        : `At Home Silo, switch to a compatible rig and fit ${recommendedModule.name} for ${recommendedModule.cost} salvage.`,
      reason: activeRigCanFit
        ? "The recommended part is affordable at the workshop."
        : "The active rig cannot fit the recommended part.",
      target: { x: HOME_SITE.x, z: HOME_SITE.z },
      recommendedModuleId,
      recommendedRigId,
      affordable,
      complete: false,
    };
  }

  const firstCacheCollected = collectedNodes.has(FIRST_SALVAGE_NODE.id);
  if (firstCacheCollected) {
    const missing = recommendedModule.cost - state.salvage;
    return {
      stage: "earn-more",
      objective: `Find ${missing} more salvage`,
      shortLabel: `Find ${missing} more`,
      ariaLabel: `Find ${missing} more salvage to afford ${recommendedModule.name}.`,
      reason:
        "The authored first cache is already collected, but the recommended part is not affordable.",
      target: null,
      recommendedModuleId,
      recommendedRigId,
      affordable,
      complete: false,
    };
  }

  const rig = state.rigs[state.activeRigId];
  const cacheDistance = Math.hypot(
    rig.x - FIRST_SALVAGE_NODE.x,
    rig.z - FIRST_SALVAGE_NODE.z,
  );
  const cacheInReach = cacheDistance <= SALVAGE_PICKUP_RADIUS;
  return {
    stage: cacheInReach ? "collect-cache" : "find-cache",
    objective: cacheInReach
      ? `Collect ${FIRST_SALVAGE_NODE.value} salvage`
      : `Recover ${FIRST_SALVAGE_NODE.value} salvage`,
    shortLabel: cacheInReach ? "Collect salvage" : "Find salvage",
    ariaLabel: cacheInReach
      ? `Collect the first cache for ${FIRST_SALVAGE_NODE.value} salvage.`
      : `Drive to the nearby first cache and recover ${FIRST_SALVAGE_NODE.value} salvage.`,
    reason: cacheInReach
      ? "The authored first cache is in interaction range."
      : "The authored first cache is uncollected and remains the nearest guaranteed reward.",
    target: { x: FIRST_SALVAGE_NODE.x, z: FIRST_SALVAGE_NODE.z },
    recommendedModuleId,
    recommendedRigId,
    affordable,
    complete: false,
  };
}
