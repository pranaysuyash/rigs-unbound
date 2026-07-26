import type { RigCapability } from "./contracts";

/**
 * Compatibility is a stable simulation contract, not UI prose.
 *
 * A world offer declares the one capability it needs. A machine makes a claim
 * from its effective composed profile. The resolver reports a deterministic
 * result that actions, activities, replay, and a later authority boundary can
 * consume without each re-implementing their own capability check.
 */
export const AFFORDANCE_CONTRACT_VERSION = 1 as const;

export type AffordanceOutcome = "legal" | "deferred" | "impossible";

export type AffordanceReasonCode =
  "ready" | "out-of-range" | "missing-capability" | "offer-unavailable";

export type AffordanceMismatchSource = "world" | "capability" | null;

export interface WorldAffordanceDefinition {
  id: string;
  version: typeof AFFORDANCE_CONTRACT_VERSION;
  owningDomain: "activity" | "world";
  requiredCapability: RigCapability;
}

export interface AffordanceAvailability {
  available: boolean;
  inRange: boolean;
}

export interface CapabilityClaim {
  capabilities: readonly RigCapability[];
}

export interface AffordanceResolution {
  affordanceId: string;
  contractVersion: typeof AFFORDANCE_CONTRACT_VERSION;
  outcome: AffordanceOutcome;
  reasonCode: AffordanceReasonCode;
  mismatchSource: AffordanceMismatchSource;
  requiredCapability: RigCapability;
}

/** The relay crate is the first real world offer using this contract. */
export const RELAY_CARGO_TOW_AFFORDANCE: WorldAffordanceDefinition = {
  id: "relay-cargo-tow",
  version: AFFORDANCE_CONTRACT_VERSION,
  owningDomain: "activity",
  requiredCapability: "tow",
};

/**
 * The survey contract board at the home site.
 *
 * The second offer, and the one that proves the contract generalises: it needs a
 * different capability, belongs to a different activity binding, and resolves
 * through exactly the same four outcomes as the crate.
 */
export const SURVEY_CONTRACT_AFFORDANCE: WorldAffordanceDefinition = {
  id: "survey-contract-board",
  version: AFFORDANCE_CONTRACT_VERSION,
  owningDomain: "activity",
  requiredCapability: "survey",
};

/**
 * Resolve an offer in a fixed order.
 *
 * An unavailable offer cannot be acted on. A machine without the required
 * capability is incompatible. A compatible machine outside the interaction
 * radius is deferred rather than denied. This ordering is deliberate and
 * replay-safe: equal inputs always produce the same outcome and reason code.
 */
export function resolveAffordance(
  affordance: WorldAffordanceDefinition,
  claim: CapabilityClaim,
  availability: AffordanceAvailability,
): AffordanceResolution {
  const base = {
    affordanceId: affordance.id,
    contractVersion: affordance.version,
    requiredCapability: affordance.requiredCapability,
  } as const;

  if (!availability.available) {
    return {
      ...base,
      outcome: "impossible",
      reasonCode: "offer-unavailable",
      mismatchSource: "world",
    };
  }

  if (!claim.capabilities.includes(affordance.requiredCapability)) {
    return {
      ...base,
      outcome: "impossible",
      reasonCode: "missing-capability",
      mismatchSource: "capability",
    };
  }

  if (!availability.inRange) {
    return {
      ...base,
      outcome: "deferred",
      reasonCode: "out-of-range",
      mismatchSource: "world",
    };
  }

  return {
    ...base,
    outcome: "legal",
    reasonCode: "ready",
    mismatchSource: null,
  };
}
