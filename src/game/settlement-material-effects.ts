/**
 * Durable, local material facts consumed by settlement life. Actions and
 * community routines can produce these effects, but neither owns their relief
 * or presentation payload.
 */

export type SettlementMaterialEffectKind =
  | "raised-stores"
  | "yard-load"
  | "route-markers"
  | "ferry-cache"
  | "ford-line"
  | "signal-array";

export interface SettlementMaterialEffect {
  id: string;
  settlementId: string;
  pressureKind: string;
  serviceRelief: readonly { service: string; amount: number }[];
  consequence?: {
    kind: SettlementMaterialEffectKind;
    offsetX: number;
    offsetZ: number;
    heading?: number;
  };
  /** Local knowledge a changed material condition lets people share. */
  worldLead?: {
    targetSiteId: string;
    title: string;
    description: string;
    mapLabel: string;
  };
  /**
   * A visible local movement pattern enabled by this changed material fact.
   * This is presentation input, never navigation authority, collision, or a
   * player permission rule.
   */
  traffic?: {
    kind: "skiff" | "freight-cart";
    targetSiteId: string;
    travelMinutes: number;
  };
  /** A durable terrain passage made possible by this material fact. */
  communityPassageId?: CommunityPassageId;
  /** Save-v24 source IDs that now resolve to this material fact. */
  legacySourceIds: readonly string[];
}

export const SETTLEMENT_MATERIAL_EFFECTS: readonly SettlementMaterialEffect[] = [
  { id: "long-furrow:drainage-cut", settlementId: "long-furrow", pressureKind: "field-saturation", serviceRelief: [{ service: "field", amount: 0.48 }], legacySourceIds: ["long-furrow:cut-relief-channel"] },
  { id: "long-furrow:staged-stores", settlementId: "long-furrow", pressureKind: "field-saturation", serviceRelief: [{ service: "haul", amount: 0.44 }], consequence: { kind: "raised-stores", offsetX: 7.4, offsetZ: -5.8, heading: -0.3 }, legacySourceIds: ["long-furrow:move-soaked-stores"] },
  { id: "rustline-salvage:staged-yard", settlementId: "rustline-salvage", pressureKind: "route-isolation", serviceRelief: [{ service: "haul", amount: 0.44 }], consequence: { kind: "yard-load", offsetX: -6.2, offsetZ: -4.8, heading: 0.42 }, legacySourceIds: ["rustline-salvage:shift-yard-load"] },
  { id: "rustline-salvage:service-stocked", settlementId: "rustline-salvage", pressureKind: "route-isolation", serviceRelief: [{ service: "haul", amount: 0.24 }, { service: "exchange", amount: 0.68 }], consequence: { kind: "yard-load", offsetX: -1.8, offsetZ: 2.6, heading: 0.18 }, legacySourceIds: ["rustline-salvage:deliver-service-stock", "rustline-parts-run"] },
  { id: "rustline-salvage:marked-bypass", settlementId: "rustline-salvage", pressureKind: "route-isolation", serviceRelief: [{ service: "exchange", amount: 0.32 }], consequence: { kind: "route-markers", offsetX: 8.5, offsetZ: 5.5, heading: -0.5 }, traffic: { kind: "freight-cart", targetSiteId: "quarry-shelf", travelMinutes: 26 }, legacySourceIds: ["rustline-salvage:mark-bypass"] },
  { id: "sunken-flats:carried-crossing", settlementId: "sunken-flats", pressureKind: "route-isolation", serviceRelief: [{ service: "crossing", amount: 0.54 }, { service: "exchange", amount: 0.22 }], consequence: { kind: "ferry-cache", offsetX: -6.8, offsetZ: 4.6, heading: 0.2 }, legacySourceIds: ["sunken-flats:carry-households"] },
  { id: "sunken-flats:raised-causeway", settlementId: "sunken-flats", pressureKind: "route-isolation", serviceRelief: [{ service: "crossing", amount: 0.72 }, { service: "exchange", amount: 0.32 }], consequence: { kind: "ferry-cache", offsetX: -2.6, offsetZ: -3.2, heading: -0.28 }, communityPassageId: "sunken-flats-causeway", legacySourceIds: ["sunken-flats:deliver-causeway-kit", "sunken-flats-causeway"] },
  { id: "sunken-flats:sounded-crossing", settlementId: "sunken-flats", pressureKind: "route-isolation", serviceRelief: [{ service: "crossing", amount: 0.3 }], consequence: { kind: "route-markers", offsetX: 9.5, offsetZ: 6.4, heading: 0.8 }, worldLead: { targetSiteId: "marsh-depot", title: "The Sounder's Line", description: "Sunken Flats callers have copied a depth reading toward Marsh Depot. The depot is named, not discovered. The water and ground between remain yours to judge.", mapLabel: "Sounded channel notes" }, traffic: { kind: "skiff", targetSiteId: "marsh-depot", travelMinutes: 34 }, legacySourceIds: ["sunken-flats:sound-crossing"] },
  { id: "marsh-depot:ferried-stores", settlementId: "marsh-depot", pressureKind: "storm-exposure", serviceRelief: [{ service: "exchange", amount: 0.5 }], consequence: { kind: "raised-stores", offsetX: -5.6, offsetZ: 4.6, heading: 0.25 }, legacySourceIds: ["marsh-depot:carry-stores"] },
  { id: "marsh-depot:secured-ford", settlementId: "marsh-depot", pressureKind: "storm-exposure", serviceRelief: [{ service: "crossing", amount: 0.36 }], consequence: { kind: "ford-line", offsetX: 6.4, offsetZ: -4.8, heading: -0.6 }, legacySourceIds: ["marsh-depot:secure-ford-line"] },
  { id: "launch-ridge:reacquired-signal", settlementId: "launch-ridge", pressureKind: "signal-silence", serviceRelief: [{ service: "information", amount: 0.48 }], consequence: { kind: "signal-array", offsetX: 5.5, offsetZ: 3.8, heading: 0.1 }, legacySourceIds: ["launch-ridge:reacquire-signal"] },
  { id: "launch-ridge:positioned-repeater", settlementId: "launch-ridge", pressureKind: "signal-silence", serviceRelief: [{ service: "information", amount: 0.3 }], consequence: { kind: "signal-array", offsetX: -4.4, offsetZ: 5.3, heading: -0.7 }, legacySourceIds: ["launch-ridge:haul-repeater"] },
  { id: "long-furrow:self-raised-stores", settlementId: "long-furrow", pressureKind: "field-saturation", serviceRelief: [{ service: "haul", amount: 0.22 }], consequence: { kind: "raised-stores", offsetX: 6.2, offsetZ: -4.1, heading: -0.16 }, legacySourceIds: ["long-furrow:raise-stores-routine"] },
  { id: "rustline-salvage:consolidated-yard", settlementId: "rustline-salvage", pressureKind: "route-isolation", serviceRelief: [{ service: "haul", amount: 0.18 }], consequence: { kind: "yard-load", offsetX: -4.8, offsetZ: -3.5, heading: 0.2 }, legacySourceIds: ["rustline-salvage:consolidate-yard-routine"] },
  { id: "sunken-flats:consolidated-landing", settlementId: "sunken-flats", pressureKind: "route-isolation", serviceRelief: [{ service: "exchange", amount: 0.2 }], consequence: { kind: "ferry-cache", offsetX: -5.4, offsetZ: 3.4, heading: 0.08 }, legacySourceIds: ["sunken-flats:consolidate-landing-routine"] },
  { id: "marsh-depot:watched-ford", settlementId: "marsh-depot", pressureKind: "route-isolation", serviceRelief: [{ service: "crossing", amount: 0.16 }], consequence: { kind: "ford-line", offsetX: 5.1, offsetZ: -3.4, heading: -0.42 }, legacySourceIds: ["marsh-depot:watch-ford-routine"] },
  { id: "launch-ridge:manual-signal-watch", settlementId: "launch-ridge", pressureKind: "signal-silence", serviceRelief: [{ service: "information", amount: 0.14 }], consequence: { kind: "signal-array", offsetX: 3.8, offsetZ: 2.9, heading: 0.24 }, legacySourceIds: ["launch-ridge:manual-watch-routine"] },
];

export function settlementMaterialEffect(id: string): SettlementMaterialEffect | undefined {
  return SETTLEMENT_MATERIAL_EFFECTS.find((effect) => effect.id === id);
}

export function materialEffectIdForSourceId(sourceId: string): string | undefined {
  return SETTLEMENT_MATERIAL_EFFECTS.find((effect) =>
    effect.legacySourceIds.includes(sourceId),
  )?.id;
}
import type { CommunityPassageId } from "./world";
