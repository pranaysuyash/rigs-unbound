/**
 * Voluntary community shipments reuse the single physical relay crate.
 *
 * A manifest defines why a load matters after it arrives. It never supplies
 * collision, pathfinding, a mission, or a player permission rule; the cargo
 * state and towing physics remain their existing authorities.
 */

import type { CargoAssignment, GameState } from "./contracts";
import {
  recordRustlineServiceStock,
  rustlineServiceStocked,
  recordSunkenCauseway,
  sunkenCausewayBuilt,
} from "./settlement-needs";
import { findSite } from "./world";

export interface SettlementCargoManifest {
  id: string;
  label: string;
  /** Local knowledge offered after loading, never an interaction gate. */
  loadedDiagnostic: string;
  originSiteId: string;
  destinationSiteId: string;
  loadOffsetX: number;
  loadOffsetZ: number;
  loadRadius: number;
}

export const SETTLEMENT_CARGO_MANIFESTS: readonly SettlementCargoManifest[] = [
  {
    id: "rustline-service-stock",
    label: "Load Rustline service stock",
    loadedDiagnostic:
      "Rustline service stock is loaded at Home Silo. Tow it to the salvage yard when you choose.",
    originSiteId: "home-silo",
    destinationSiteId: "salvage-yard",
    // South-east yard, clear of the barn, gantry, silo, and parked rigs.
    loadOffsetX: 18,
    loadOffsetZ: -11,
    loadRadius: 3.2,
  },
  {
    id: "sunken-causeway-kit",
    label: "Load Sunken causeway kit",
    loadedDiagnostic:
      "The Sunken causeway kit is loaded. Any tow rig can move it; a low hover machine can cross the flooded flats.",
    originSiteId: "home-silo",
    destinationSiteId: "sunken-flats",
    // Adjacent yard bay with a clear south-west departure toward the flats.
    loadOffsetX: 12,
    loadOffsetZ: -11,
    loadRadius: 3.2,
  },
];

export function settlementCargoManifest(
  id: string | undefined,
): SettlementCargoManifest | undefined {
  return SETTLEMENT_CARGO_MANIFESTS.find((manifest) => manifest.id === id);
}

export function isSettlementCargoManifestAvailable(
  state: GameState,
  manifest: SettlementCargoManifest,
): boolean {
  const relayFree =
    state.cargoRelay.cargo.attachedRigId === null &&
    state.cargoRelay.status !== "active" &&
    state.cargoRelay.assignment === null;
  if (!relayFree) return false;
  if (manifest.id === "rustline-service-stock") {
    return state.discoveries.some((entry) => entry.id === "salvage-yard") &&
      !rustlineServiceStocked(state);
  }
  if (manifest.id === "sunken-causeway-kit") {
    return state.discoveries.some((entry) => entry.id === "sunken-flats") &&
      !sunkenCausewayBuilt(state);
  }
  return false;
}

export function availableSettlementCargoManifest(
  state: GameState,
  x?: number,
  z?: number,
): SettlementCargoManifest | undefined {
  return SETTLEMENT_CARGO_MANIFESTS.find((manifest) => {
    if (!isSettlementCargoManifestAvailable(state, manifest)) return false;
    if (x === undefined || z === undefined) return true;
    const origin = findSite(manifest.originSiteId);
    return origin !== undefined &&
      Math.hypot(
        x - (origin.x + manifest.loadOffsetX),
        z - (origin.z + manifest.loadOffsetZ),
      ) <= manifest.loadRadius;
  });
}

export function prepareSettlementCargo(
  state: GameState,
  manifest: SettlementCargoManifest,
): boolean {
  const origin = findSite(manifest.originSiteId);
  const destination = findSite(manifest.destinationSiteId);
  if (!origin || !destination || state.cargoRelay.cargo.attachedRigId !== null) {
    return false;
  }

  const assignment: CargoAssignment = {
    missionId: null,
    manifestId: manifest.id,
    originSiteId: origin.id,
    destinationSiteId: destination.id,
  };
  state.cargoRelay = {
    ...state.cargoRelay,
    status: "ready",
    startedAt: null,
    completedAt: null,
    bestTimeMs: null,
    assignment,
    cargo: {
      ...state.cargoRelay.cargo,
      // A voluntary shipment is physical stock, not an abstract site action.
      // Spawn the one reusable crate at the same reachable bay that exposes the
      // command, so the player never has to pull cargo out of building geometry.
      x: origin.x + manifest.loadOffsetX,
      y: 0.65,
      z: origin.z + manifest.loadOffsetZ,
      heading: 0,
      attachedRigId: null,
      delivered: false,
    },
  };
  return true;
}

/** Apply a manifest's durable local consequence after the crate reaches its real destination. */
export function completeSettlementCargoDelivery(
  state: GameState,
): string | null {
  const assignment = state.cargoRelay.assignment;
  if (!assignment || assignment.missionId !== null || !state.cargoRelay.cargo.delivered) {
    return null;
  }
  const manifest = settlementCargoManifest(assignment.manifestId);
  if (!manifest || assignment.destinationSiteId !== manifest.destinationSiteId) {
    return null;
  }
  if (manifest.id === "rustline-service-stock") {
    return recordRustlineServiceStock(state, state.worldTimeMinutes)
      ? "Rustline crews have stock, fuel, and service parts at the yard. The repair bay is working again."
      : "Rustline already has the stock it needs; the crate is set down with the yard crew.";
  }
  if (manifest.id === "sunken-causeway-kit") {
    return recordSunkenCauseway(state, state.worldTimeMinutes)
      ? "Sunken Flats crews set the causeway kit into the crossing. The raised route is open to weather and use, not reserved for you."
      : "Sunken Flats already has a raised causeway; the kit is left with the crossing crew.";
  }
  return null;
}
