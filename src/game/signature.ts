/**
 * Experimental deterministic rig-emission source contract.
 *
 * This module emits named channels only. A future threat or sensor must own its
 * channel sensitivity, falloff, occlusion, and thresholds. Until one real
 * listener and accessible player feedback land together, this remains an
 * evidence fixture rather than a completed gameplay system.
 */

import { effectiveProfile, type RigId, type RigState } from "./contracts";
import { clamp } from "./noise";

export interface SignatureChannels {
  /** Mechanical sound and vibration proxy, normalized to 0..1. */
  acoustic: number;
  /** Operating-light emission supplied by canonical rig policy/state. */
  illumination: number;
  /** Mechanical strain proxy, not a thermodynamic temperature. */
  thermalProxy: number;
}

export interface RigSignature {
  rigId: RigId;
  source: { x: number; z: number };
  channels: SignatureChannels;
}

export interface RigEmissionContext {
  /**
   * Normalized authoritative load imposed by an attached/carried object.
   *
   * The caller derives this from a generic load contract. Signature code must
   * not import Cargo Relay or another activity.
   */
  carriedLoad: number;
  /**
   * Normalized operating-light emission supplied by canonical rig state/policy.
   *
   * The current runtime has no player-owned light/beacon state, so production
   * callers must not infer this from Three.js objects.
   */
  illumination: number;
}

/**
 * Derive source channels from persistent motion/strain/tool state plus explicit
 * generic operating context.
 *
 * Cached `rig.telemetry` is intentionally not read: the contract labels it
 * non-authoritative. There is intentionally no combined attraction score.
 */
export function deriveRigSignature(
  rig: RigState,
  context: RigEmissionContext,
): RigSignature {
  const profile = effectiveProfile(rig.id, rig.modules);
  const operating = rig.condition > 0;
  const speedRatio = operating
    ? clamp(Math.abs(rig.speed) / Math.max(1, profile.topSpeed), 0, 1)
    : 0;
  const activeTool = operating
    ? rig.attachments.some((item) => item.engaged)
      ? 1
      : 0
    : 0;
  const acoustic = clamp(
    speedRatio * 0.36 +
      (operating ? rig.strain : 0) * 0.24 +
      activeTool * 0.2 +
      (operating ? clamp(context.carriedLoad, 0, 1) : 0) * 0.2,
    0,
    1,
  );
  const thermalProxy = clamp(
    (operating ? rig.strain : 0) * 0.65 + speedRatio * 0.35,
    0,
    1,
  );
  const illumination = operating ? clamp(context.illumination, 0, 1) : 0;

  return {
    rigId: rig.id,
    source: { x: rig.x, z: rig.z },
    channels: {
      acoustic,
      illumination,
      thermalProxy,
    },
  };
}
