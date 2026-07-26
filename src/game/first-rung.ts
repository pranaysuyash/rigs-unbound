import {
  effectiveProfile,
  MODULES,
  RIG_IDS,
  RIG_PROFILES,
  RIG_SWITCH_RANGE,
  type GameState,
  type ModuleId,
  type RigId,
} from "./contracts";
import { FIRST_SALVAGE_NODE, SALVAGE_PICKUP_RADIUS } from "./exploration";
import { HOME_SITE, isWithinSiteServiceArea, WORLD_SITES } from "./world";

export const FIRST_RUNG_RECOMMENDED_MODULE: ModuleId = "lug-tires";

export type FirstRungStage =
  | "find-cache"
  | "collect-cache"
  | "earn-more"
  | "return-home"
  | "reach-rig"
  | "switch-rig"
  | "choose-part"
  | "first-cut"
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
  return isWithinSiteServiceArea(HOME_SITE, rig.x, rig.z);
}

function firstCompatibleRig(
  state: GameState,
  moduleId: ModuleId,
): RigId | null {
  const definition = MODULES[moduleId];
  if (definition.fits.includes(state.activeRigId)) return state.activeRigId;
  const active = state.rigs[state.activeRigId];
  return (
    RIG_IDS.filter((rigId) => definition.fits.includes(rigId)).sort(
      (leftId, rightId) => {
        const left = state.rigs[leftId];
        const right = state.rigs[rightId];
        return (
          Math.hypot(left.x - active.x, left.z - active.z) -
          Math.hypot(right.x - active.x, right.z - active.z)
        );
      },
    )[0] ?? null
  );
}

function hasFittedPart(state: GameState): boolean {
  return RIG_IDS.some((rigId) => state.rigs[rigId].modules.length > 0);
}

/**
 * After the player has fitted their first module, guide them through terrain
 * transformation and route opening before releasing into free-explore.
 *
 * Sub-steps:
 * 1. If the active rig has no blade, guide to the tractor.
 * 2. If the blade is not engaged, prompt to lower it.
 * 3. If the blade is engaged but no furrows exist, prompt to drive forward.
 * 4. If furrows exist but not near Long Furrow, guide toward it.
 * 5. If near Long Furrow with furrows, free-explore (complete).
 */
function resolvePostFitRung(
  state: GameState,
  collectedNodes: ReadonlySet<string>,
): FirstRungResolution {
  void collectedNodes;
  const rig = state.rigs[state.activeRigId];
  const profile = effectiveProfile(rig.id, rig.modules);
  const hasBlade = profile.capabilities.includes("plough");

  // If the active rig has no blade, guide to the tractor.
  if (!hasBlade) {
    const tractorId: RigId = "utility-tractor";
    const tractor = state.rigs[tractorId];
    const distance = Math.hypot(rig.x - tractor.x, rig.z - tractor.z);
    const inRange = distance <= RIG_SWITCH_RANGE;
    return {
      stage: "first-cut",
      objective: inRange ? "Switch to Torque" : "Reach Torque",
      shortLabel: inRange ? "Switch rig" : "Reach Torque",
      ariaLabel: inRange
        ? "Switch to the utility tractor which carries the plough blade."
        : `Drive ${Math.ceil(distance)} m to the utility tractor which carries the plough blade.`,
      reason: "The active rig has no plough capability.",
      target: inRange ? { x: tractor.x, z: tractor.z } : null,
      recommendedModuleId: null,
      recommendedRigId: tractorId,
      affordable: false,
      complete: false,
    };
  }

  // Check plough engagement.
  const plough = rig.attachments.find((a) => a.id === "field-plough");
  if (plough && !plough.engaged) {
    return {
      stage: "first-cut",
      objective: "Lower the blade",
      shortLabel: "Lower blade",
      ariaLabel: "Lower the field plough to begin terrain transformation.",
      reason: "The plough is available but not engaged.",
      target: null,
      recommendedModuleId: null,
      recommendedRigId: null,
      affordable: false,
      complete: false,
    };
  }

  // If blade is engaged but no furrows exist, prompt to drive forward.
  if (state.furrows.length === 0) {
    return {
      stage: "first-cut",
      objective: "Drive forward",
      shortLabel: "Drive forward",
      ariaLabel: "Drive forward with the blade lowered to create terrain furrows.",
      reason: "The blade is engaged but no terrain has been transformed yet.",
      target: null,
      recommendedModuleId: null,
      recommendedRigId: null,
      affordable: false,
      complete: false,
    };
  }

  // If furrows exist but not near Long Furrow, guide toward it.
  const longFurrow = WORLD_SITES.find((s) => s.id === "long-furrow");
  if (longFurrow) {
    const distance = Math.hypot(rig.x - longFurrow.x, rig.z - longFurrow.z);
    if (distance > longFurrow.discoverRadius) {
      return {
        stage: "first-cut",
        objective: "Drive toward Long Furrow",
        shortLabel: "Head to Long Furrow",
        ariaLabel: `Drive ${Math.ceil(distance)} metres toward Long Furrow to complete the terrain transformation journey.`,
        reason: "Furrows exist but the destination has not been reached.",
        target: { x: longFurrow.x, z: longFurrow.z },
        recommendedModuleId: null,
        recommendedRigId: null,
        affordable: false,
        complete: false,
      };
    }
  }

  // Near Long Furrow with furrows — free-explore (complete).
  return {
    stage: "free-explore",
    objective: "Use your fitted part",
    shortLabel: "Try the upgrade",
    ariaLabel:
      "First upgrade fitted. Explore and use the new traversal capability.",
    reason: "Terrain transformation and route opening are complete.",
    target: null,
    recommendedModuleId: null,
    recommendedRigId: null,
    affordable: false,
    complete: true,
  };
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
    return resolvePostFitRung(state, collectedNodes);
  }

  const recommendedModuleId = FIRST_RUNG_RECOMMENDED_MODULE;
  const recommendedModule = MODULES[recommendedModuleId];
  const recommendedRigId = firstCompatibleRig(state, recommendedModuleId);
  const affordable = state.salvage >= recommendedModule.cost;

  if (affordable) {
    const activeRigCanFit = recommendedRigId === state.activeRigId;
    if (!activeRigCanFit && recommendedRigId !== null) {
      const active = state.rigs[state.activeRigId];
      const compatible = state.rigs[recommendedRigId];
      const compatibleName = RIG_PROFILES[recommendedRigId].fieldName;
      const compatibleDistance = Math.hypot(
        compatible.x - active.x,
        compatible.z - active.z,
      );
      const compatibleInReach = compatibleDistance <= RIG_SWITCH_RANGE;
      return {
        stage: compatibleInReach ? "switch-rig" : "reach-rig",
        objective: compatibleInReach
          ? `Switch to ${compatibleName}`
          : `Reach ${compatibleName}`,
        shortLabel: compatibleInReach ? "Switch rig" : "Reach compatible rig",
        ariaLabel: compatibleInReach
          ? `Switch to the nearby ${compatibleName}, then return to Home Silo and fit ${recommendedModule.name}.`
          : `Drive to the ${compatibleName}, ${Math.ceil(compatibleDistance)} metres away, so you can switch rigs and fit ${recommendedModule.name}.`,
        reason: compatibleInReach
          ? "A compatible physical rig is inside switching range."
          : "The compatible physical rig must be reached before control can switch.",
        target: { x: compatible.x, z: compatible.z },
        recommendedModuleId,
        recommendedRigId,
        affordable,
        complete: false,
      };
    }

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

    return {
      stage: "choose-part",
      objective: `Fit ${recommendedModule.name}`,
      shortLabel: "Fit a part",
      ariaLabel: `At Home Silo, fit ${recommendedModule.name} for ${recommendedModule.cost} salvage. ${recommendedModule.promise}`,
      reason: "The recommended part is affordable at the workshop.",
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
