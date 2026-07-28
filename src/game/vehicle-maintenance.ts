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
