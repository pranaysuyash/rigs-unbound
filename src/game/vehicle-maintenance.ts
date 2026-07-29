/**
 * Component Mechanical Wear & Field Maintenance Engine.
 *
 * Tracks wear rates for tires, radiator mud clogging, winch cable fraying,
 * and alternator belts, providing field maintenance repair mechanics.
 */

export interface ComponentHealthState {
  tireTreadHealthPercent: number; // 0..100%
  radiatorCleanlinessPercent: number; // 0..100% (100 = clean, 0 = mud clogged)
  winchCableIntegrityPercent: number; // 0..100%
  alternatorBeltHealthPercent: number; // 0..100%
}

/** Factory service state: every component at full health. */
export function createComponentHealth(): ComponentHealthState {
  return {
    tireTreadHealthPercent: 100,
    radiatorCleanlinessPercent: 100,
    winchCableIntegrityPercent: 100,
    alternatorBeltHealthPercent: 100,
  };
}

/**
 * Wear is applied in distance batches rather than per fixed step, because the
 * wear maths rounds to 0.1% and per-step deltas would round to zero.
 */
export const WEAR_FLUSH_INTERVAL_M = 250 as const;

/**
 * Grip retained by worn tread. Exactly 1 at full health (so unworn rigs are
 * bit-identical to the pre-wear simulation), down to 0.85 on bald tires.
 */
export function treadGripFactor(tireTreadHealthPercent: number): number {
  const health = Math.min(100, Math.max(0, tireTreadHealthPercent));
  return 1 - 0.15 * (1 - health / 100);
}

/** Total service deficit across all components, 0 (fresh) to 400 (dead). */
export function componentWearDeficit(health: ComponentHealthState): number {
  return (
    100 -
    health.tireTreadHealthPercent +
    (100 - health.radiatorCleanlinessPercent) +
    (100 - health.winchCableIntegrityPercent) +
    (100 - health.alternatorBeltHealthPercent)
  );
}

/**
 * Salvage surcharge the workshop adds on top of the base repair cost for
 * mechanical service. Zero when nothing is worn, so a pure condition repair
 * costs exactly what it always did.
 */
export function serviceSurchargeSalvage(health: ComponentHealthState): number {
  return Math.ceil(componentWearDeficit(health) / 100);
}

export function updateComponentWear(
  current: ComponentHealthState,
  distanceTraveledKm: number,
  isMudFording: boolean,
  winchTensionN: number,
): ComponentHealthState {
  const tireWear = distanceTraveledKm * 0.8;
  const radiatorClog = isMudFording ? 1.5 : 0.05;
  const cableFray = winchTensionN > 20000 ? (winchTensionN / 35000) * 2.5 : 0;

  return {
    tireTreadHealthPercent: Number(
      Math.max(0, current.tireTreadHealthPercent - tireWear).toFixed(1),
    ),
    radiatorCleanlinessPercent: Number(
      Math.max(0, current.radiatorCleanlinessPercent - radiatorClog).toFixed(1),
    ),
    winchCableIntegrityPercent: Number(
      Math.max(0, current.winchCableIntegrityPercent - cableFray).toFixed(1),
    ),
    alternatorBeltHealthPercent: Number(
      Math.max(
        0,
        current.alternatorBeltHealthPercent - distanceTraveledKm * 0.2,
      ).toFixed(1),
    ),
  };
}

export function performFieldRepair(
  current: ComponentHealthState,
  componentKey: keyof ComponentHealthState,
  repairAmountPercent = 35,
): ComponentHealthState {
  return {
    ...current,
    [componentKey]: Math.min(100, current[componentKey] + repairAmountPercent),
  };
}

/**
 * Format the current mechanical condition into a single player-facing sentence.
 *
 * Used by the workshop diagnosis readout so the shell never invents its own
 * description of wear.
 */
export function formatWearDiagnostic(
  condition: number,
  health: ComponentHealthState,
): string {
  const wearDeficit = componentWearDeficit(health);
  const base =
    condition <= 0
      ? "Disabled — engine will not turn over."
      : `Condition ${Math.round(condition)}%.`;
  const wearText =
    wearDeficit < 0.5
      ? "All components at spec."
      : `Tread ${health.tireTreadHealthPercent}%, radiator ${health.radiatorCleanlinessPercent}%, cable ${health.winchCableIntegrityPercent}%, belt ${health.alternatorBeltHealthPercent}%.`;
  return `${base} ${wearText}`;
}
