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
import { HOME_SITE, findSite, isWithinSiteServiceArea } from "./world";

export const FIRST_RUNG_RECOMMENDED_MODULE: ModuleId = "lug-tires";
export const SECOND_RUNG_RECOMMENDED_MODULE: ModuleId = "winch";

export type FirstRungStage =
  | "find-cache"
  | "collect-cache"
  | "sight-destination"
  | "attempt-route"
  | "earn-more"
  | "return-home"
  | "reach-rig"
  | "switch-rig"
  | "choose-part"
  | "first-cut"
  | "second-fit"
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

const SIGHT_RADIUS_MULTIPLIER = 3;
/**
 * Radius (metres from Long Furrow) at which the attempt-route stage fires.
 *
 * The authored gully sits ~38.6 m from Long Furrow (gully at (-5, -15),
 * Long Furrow at (18, -46)). The old value of 36 m fired *after* the player
 * crossed the gully. 42 m fires ~3.4 m before the gully face, giving the
 * player just enough warning to read the blockage prompt and turn back.
 */
const ATTEMPT_ROUTE_RADIUS = 42;

/**
 * Before fitting the blade, guide the player to scout Long Furrow and
 * discover the terrain blockage. Only fires when salvage is affordable,
 * no modules are fitted, the rig is compatible, and the player is not
 * at the Home workshop.
 */
function resolvePreBladeJourney(
  state: GameState,
): FirstRungResolution | null {
  const affordable = state.salvage >= MODULES[FIRST_RUNG_RECOMMENDED_MODULE].cost;
  if (!affordable) return null;
  if (state.rigs[state.activeRigId].modules.length > 0) return null;
  const compatible = MODULES[FIRST_RUNG_RECOMMENDED_MODULE].fits.includes(state.activeRigId);
  if (!compatible) return null;
  if (atHomeWorkshop(state)) return null;

  const rig = state.rigs[state.activeRigId];
  const longFurrow = findSite("long-furrow");
  if (!longFurrow) return null;

  // Only activate when the player is near enough to actually scout Long
  // Furrow.  If they are far away the normal find-cache / return-home flow
  // should guide them to fit the blade first.
  const distToLongFurrow = Math.hypot(
    rig.x - longFurrow.x,
    rig.z - longFurrow.z,
  );
  const sightRadius = longFurrow.discoverRadius * SIGHT_RADIUS_MULTIPLIER;
  if (distToLongFurrow > sightRadius) return null;

  if (distToLongFurrow <= ATTEMPT_ROUTE_RADIUS) {
    return {
      stage: "attempt-route",
      objective: "The terrain blocks the way. Return for lug tyres.",
      shortLabel: "Need lug tyres",
      ariaLabel:
        "A steep terrain face blocks the direct route to Long Furrow. Return to Home Silo and fit lug tyres for better grip, then plough through.",
      reason:
        "The direct route to Long Furrow is blocked by a terrain face that the plough can clear with better grip.",
      target: { x: HOME_SITE.x, z: HOME_SITE.z },
      recommendedModuleId: FIRST_RUNG_RECOMMENDED_MODULE,
      recommendedRigId: null,
      affordable: true,
      complete: false,
    };
  }

  if (distToLongFurrow <= sightRadius) {
    return {
      stage: "sight-destination",
      objective: "Head toward Long Furrow",
      shortLabel: "Sight Long Furrow",
      ariaLabel:
        "Long Furrow is visible ahead. Drive toward it to scout the terrain.",
      reason:
        "Long Furrow is visible and should be scouted before fitting the blade.",
      target: { x: longFurrow.x, z: longFurrow.z },
      recommendedModuleId: FIRST_RUNG_RECOMMENDED_MODULE,
      recommendedRigId: null,
      affordable: true,
      complete: false,
    };
  }

  return null;
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

/** Count how many modules are fitted across all rigs. */
function totalFittedModules(state: GameState): number {
  return RIG_IDS.reduce(
    (sum, rigId) => sum + state.rigs[rigId].modules.length,
    0,
  );
}

/**
 * After the first module is fitted and the terrain transformation is complete,
 * guide the player to fit a second module before releasing to free-explore.
 *
 * The second module (winch) introduces a different traversal capability: self-
 * recovery on steep terrain. This creates a two-module introduction loop where
 * the player learns both terrain modification (blade) and self-recovery (winch)
 * before being set free.
 */
export function resolveSecondFit(state: GameState): FirstRungResolution {
  const recommendedModuleId = SECOND_RUNG_RECOMMENDED_MODULE;
  const recommendedModule = MODULES[recommendedModuleId];
  const recommendedRigId = firstCompatibleRig(state, recommendedModuleId);
  const affordable = state.salvage >= recommendedModule.cost;

  // If the active rig can't fit the winch, guide to switch first.
  if (recommendedRigId !== null && recommendedRigId !== state.activeRigId) {
    const active = state.rigs[state.activeRigId];
    const compatible = state.rigs[recommendedRigId];
    const compatibleName = RIG_PROFILES[recommendedRigId].fieldName;
    const compatibleDistance = Math.hypot(
      compatible.x - active.x,
      compatible.z - active.z,
    );
    const compatibleInReach = compatibleDistance <= RIG_SWITCH_RANGE;
    return {
      stage: "second-fit",
      objective: compatibleInReach
        ? `Switch to ${compatibleName}`
        : `Reach ${compatibleName}`,
      shortLabel: compatibleInReach ? "Switch rig" : "Reach compatible rig",
      ariaLabel: compatibleInReach
        ? `Switch to the nearby ${compatibleName}, then return to Home Silo and fit ${recommendedModule.name}.`
        : `Drive to the ${compatibleName}, ${Math.ceil(compatibleDistance)} metres away, so you can switch rigs and fit ${recommendedModule.name}.`,
      reason: compatibleInReach
        ? "The second recommended part requires a different rig."
        : "The compatible rig must be reached before control can switch.",
      target: { x: compatible.x, z: compatible.z },
      recommendedModuleId,
      recommendedRigId,
      affordable,
      complete: false,
    };
  }

  // If already affordable and at Home, guide to fit it.
  if (affordable && atHomeWorkshop(state)) {
    // The player has just completed the terrain transformation and reached
    // Long Furrow. Before fitting the second module, acknowledge the
    // cross-rig benefit: the route they opened is now passable for other rigs.
    const hasFurrows = state.furrows.length > 0;
    const crossRigNote = hasFurrows
      ? " The route you opened to Long Furrow is now passable for other rigs too."
      : "";
    return {
      stage: "second-fit",
      objective: `Fit ${recommendedModule.name}`,
      shortLabel: "Fit second part",
      ariaLabel: `Return to Home Silo and fit ${recommendedModule.name} for ${recommendedModule.cost} salvage. ${recommendedModule.promise}${crossRigNote}`,
      reason: "The second recommended part is affordable at the workshop.",
      target: { x: HOME_SITE.x, z: HOME_SITE.z },
      recommendedModuleId,
      recommendedRigId,
      affordable,
      complete: false,
    };
  }

  // If affordable but away from Home, guide back.
  if (affordable) {
    return {
      stage: "second-fit",
      objective: "Return to Home Silo",
      shortLabel: "Return home",
      ariaLabel: `Return to Home Silo and fit ${recommendedModule.name} for ${recommendedModule.cost} salvage.`,
      reason: "The second recommended part is affordable away from Home.",
      target: { x: HOME_SITE.x, z: HOME_SITE.z },
      recommendedModuleId,
      recommendedRigId,
      affordable,
      complete: false,
    };
  }

  // Not yet affordable — guide to earn more salvage.
  const missing = recommendedModule.cost - state.salvage;
  return {
    stage: "second-fit",
    objective: `Find ${missing} more salvage`,
    shortLabel: `Find ${missing} more`,
    ariaLabel: `Find ${missing} more salvage to afford ${recommendedModule.name}.`,
    reason: "The second recommended part is not yet affordable.",
    target: null,
    recommendedModuleId,
    recommendedRigId,
    affordable,
    complete: false,
  };
}

/**
 * After the first module is fitted, guide the player through terrain
 * transformation before releasing to free-explore. The progression:
 * 1. If the active rig has no blade → switch to a rig with plough
 * 2. If the blade is not engaged → "Lower the blade"
 * 3. If the blade is engaged but no furrows → "Drive forward"
 * 4. If furrows exist but not near Long Furrow → "Drive toward Long Furrow"
 * 5. If near Long Furrow with furrows → transition to second-fit
 */
function resolvePostFitRung(state: GameState): FirstRungResolution {
  const rig = state.rigs[state.activeRigId];

  // Check if this rig has plough capability.
  const hasBlade = effectiveProfile(rig.id, rig.modules).capabilities.includes("plough");
  if (!hasBlade) {
    // Guide to a rig that can plough.
    const ploughRigs = RIG_IDS.filter((id) =>
      effectiveProfile(id, state.rigs[id].modules).capabilities.includes("plough"),
    );
    const targetRigId = ploughRigs[0];
    if (targetRigId) {
      const target = state.rigs[targetRigId];
      const name = RIG_PROFILES[targetRigId].fieldName;
      const distance = Math.hypot(rig.x - target.x, rig.z - target.z);
      const inReach = distance <= RIG_SWITCH_RANGE;
      return {
        stage: "first-cut",
        objective: inReach ? `Switch to ${name}` : `Reach ${name}`,
        shortLabel: "Get a rig with a blade",
        ariaLabel: `Switch to the ${name} which has a plough blade for terrain transformation.`,
        reason: "The active rig cannot transform terrain.",
        target: { x: target.x, z: target.z },
        recommendedModuleId: null,
        recommendedRigId: targetRigId,
        affordable: false,
        complete: false,
      };
    }
  }

  // Check if blade is engaged.
  const plough = rig.attachments.find((a) => a.id === "field-plough");
  if (hasBlade && !plough) {
    return {
      stage: "first-cut",
      objective: "Plough attachment missing — re-fit at workshop",
      shortLabel: "Re-fit plough",
      ariaLabel:
        "The plough blade was expected but not found. Return to the workshop to re-fit it.",
      reason: "Blade capability reported but plough attachment not found on rig.",
      target: { x: HOME_SITE.x, z: HOME_SITE.z },
      recommendedModuleId: null,
      recommendedRigId: null,
      affordable: false,
      complete: false,
    };
  }
  if (plough && !plough.engaged) {
    return {
      stage: "first-cut",
      objective: "Lower the blade",
      shortLabel: "Lower blade",
      ariaLabel: "Press B to lower the plough blade and begin terrain transformation.",
      reason: "The blade is fitted but not engaged.",
      target: null,
      recommendedModuleId: null,
      recommendedRigId: null,
      affordable: false,
      complete: false,
    };
  }

  // Blade engaged but no furrows yet — drive to create them.
  if (state.furrows.length === 0) {
    return {
      stage: "first-cut",
      objective: "Drive forward",
      shortLabel: "Create furrows",
      ariaLabel: "Drive forward with the blade lowered to transform the terrain.",
      reason: "The blade is engaged but no terrain has been transformed yet.",
      target: null,
      recommendedModuleId: null,
      recommendedRigId: null,
      affordable: false,
      complete: false,
    };
  }

  // Furrows exist — check if near Long Furrow.
  const longFurrow = findSite("long-furrow");
  if (longFurrow) {
    const distance = Math.hypot(rig.x - longFurrow.x, rig.z - longFurrow.z);
    if (distance <= longFurrow.discoverRadius) {
      // Near Long Furrow with furrows — the route is open. Transition to
      // the second-fit stage. The cross-rig benefit note is added by
      // resolveSecondFit when furrows exist.
      return resolveSecondFit(state);
    }
  }

  // Furrows exist but not near Long Furrow — plough toward it.
  const target = longFurrow ? { x: longFurrow.x, z: longFurrow.z } : null;
  const furrowCount = state.furrows.length;
  return {
    stage: "first-cut",
    objective: furrowCount > 0
      ? `Plough toward Long Furrow (${furrowCount} furrow${furrowCount === 1 ? "" : "s"} carved)`
      : "Plough toward Long Furrow",
    shortLabel: "Plough toward Long Furrow",
    ariaLabel: furrowCount > 0
      ? `Keep ploughing toward Long Furrow. You have carved ${furrowCount} furrow${furrowCount === 1 ? "" : "s"} so far. The terrain is transforming under your blade.`
      : "Drive toward Long Furrow with the blade lowered to transform the terrain.",
    reason: "Terrain has been transformed but the route is not yet complete.",
    target,
    recommendedModuleId: null,
    recommendedRigId: null,
    affordable: false,
    complete: false,
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
    const fittedCount = totalFittedModules(state);

    // After the first module is fitted, guide the player through terrain
    // transformation (first-cut) before releasing to free-explore.
    if (fittedCount === 1) {
      return resolvePostFitRung(state);
    }

    // Two or more modules fitted — free-explore.
    return {
      stage: "free-explore",
      objective: "Use your fitted parts",
      shortLabel: "Try your upgrades",
      ariaLabel:
        "Upgrades fitted. Explore and use your new traversal capabilities.",
      reason: "At least two modules have been fitted.",
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

  // The pre-blade journey only activates after the player has collected the
  // first cache.  Before that, the normal find-cache → return-home flow
  // should guide them to fit the blade first.
  const firstCacheCollected = collectedNodes.has(FIRST_SALVAGE_NODE.id);
  const preBladeJourney = firstCacheCollected ? resolvePreBladeJourney(state) : null;
  if (preBladeJourney) return preBladeJourney;

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
