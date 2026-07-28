/**
 * Electrical Battery & Alternator Power Grid System.
 *
 * Models 12V DC vehicle electrical current draw (headlights, winch motor, seismic scanner)
 * vs engine alternator charging current. Shuts down accessories if battery depletes below 10.5V.
 */

export interface ElectricalGridState {
  batteryCapacityAh: number; // e.g. 75 Ah
  currentChargeAh: number;
  batteryVoltage: number; // 10.5V (empty) to 13.8V (full charge)
  isHeadlightsActive: boolean;
  isWinchActive: boolean;
  isSeismicActive: boolean;
  accessoryCutoffTriggered: boolean;
}

export function updateElectricalGrid(
  grid: ElectricalGridState,
  engineRpm: number,
  deltaSeconds: number,
): ElectricalGridState {
  // Alternator current (Amperes) generated at current engine RPM
  const alternatorAmps = Math.min(140, 140 * (Math.max(0, engineRpm) / 3200));

  // Current draw from active loads
  let loadAmps = 2.0; // Base ignition & ECU load
  if (grid.isHeadlightsActive) loadAmps += 15.0;
  if (grid.isWinchActive) loadAmps += 110.0;
  if (grid.isSeismicActive) loadAmps += 80.0;

  const netCurrentAmps = alternatorAmps - loadAmps;
  const netChargeAhChange = netCurrentAmps * (deltaSeconds / 3600);

  const newChargeAh = Math.max(
    0,
    Math.min(grid.batteryCapacityAh, grid.currentChargeAh + netChargeAhChange),
  );
  const chargeRatio = newChargeAh / grid.batteryCapacityAh;
  // Voltage curve from 10.5V (0%) to 13.8V (100%)
  const batteryVoltage = Number((10.5 + chargeRatio * 3.3).toFixed(2));
  const accessoryCutoffTriggered = batteryVoltage <= 10.8;

  return {
    ...grid,
    currentChargeAh: Number(newChargeAh.toFixed(3)),
    batteryVoltage,
    accessoryCutoffTriggered,
    isHeadlightsActive: accessoryCutoffTriggered
      ? false
      : grid.isHeadlightsActive,
    isWinchActive: accessoryCutoffTriggered ? false : grid.isWinchActive,
    isSeismicActive: accessoryCutoffTriggered ? false : grid.isSeismicActive,
  };
}
