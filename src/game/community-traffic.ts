/**
 * Civilian movement is a read-only projection of durable material change.
 *
 * It deliberately has no simulation authority: it cannot collide, reserve a
 * route, alter access, discover a site, accept work, or direct the player.
 * Its job is to make a world fact visible after people have enough practical
 * information to move differently.
 */

import type { GameState } from "./contracts";
import { SETTLEMENT_MATERIAL_EFFECTS } from "./settlement-material-effects";
import { SETTLEMENTS } from "./settlement-needs";
import { findSite } from "./world";

export type CommunityTrafficKind = "skiff" | "freight-cart";

export interface CommunityTrafficProjection {
  id: string;
  materialEffectId: string;
  kind: CommunityTrafficKind;
  sourceSiteId: string;
  targetSiteId: string;
  x: number;
  z: number;
  heading: number;
  outbound: boolean;
  progress: number;
}

function stablePhase(id: string): number {
  let hash = 2166136261;
  for (const character of id) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0x1_0000_0000;
}

function activeMaterialEffectIds(state: GameState): ReadonlySet<string> {
  return new Set(
    Object.values(state.settlements).flatMap((settlement) => [
      ...settlement.contributions.map((contribution) => contribution.materialEffectId),
      ...settlement.adaptations.map((adaptation) => adaptation.materialEffectId),
    ]),
  );
}

/**
 * Project one outward-and-returning civilian route for each active traffic
 * effect. The triangular travel cycle prevents a hidden spawn/despawn system,
 * and derives the same visible position from the same saved history and world
 * time on every machine.
 */
export function deriveCommunityTraffic(
  state: GameState,
): readonly CommunityTrafficProjection[] {
  const activeEffects = activeMaterialEffectIds(state);

  return SETTLEMENT_MATERIAL_EFFECTS.flatMap((effect) => {
    if (!effect.traffic || !activeEffects.has(effect.id)) return [];
    const settlement = SETTLEMENTS.find(
      (candidate) => candidate.id === effect.settlementId,
    );
    const source = settlement ? findSite(settlement.siteId) : undefined;
    const target = findSite(effect.traffic.targetSiteId);
    if (!source || !target) return [];

    const cycle =
      (state.worldTimeMinutes / effect.traffic.travelMinutes + stablePhase(effect.id)) % 2;
    const outbound = cycle < 1;
    const progress = outbound ? cycle : 2 - cycle;
    const dx = target.x - source.x;
    const dz = target.z - source.z;
    const heading = Math.atan2(dx, dz) + (outbound ? 0 : Math.PI);

    return [{
      id: `community-traffic:${effect.id}`,
      materialEffectId: effect.id,
      kind: effect.traffic.kind,
      sourceSiteId: source.id,
      targetSiteId: target.id,
      x: source.x + dx * progress,
      z: source.z + dz * progress,
      heading,
      outbound,
      progress,
    }];
  });
}
