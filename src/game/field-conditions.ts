/**
 * Persistent condition for land changed by players or autonomous world actors.
 *
 * Terrain remains the authority for geometry and material classification.
 * This module records the slower biological and water response around those
 * canonical terrain edits: saturation, shear strength, vegetation, roots, and
 * soil health. It intentionally tracks only disturbed cells so open-world
 * simulation cost scales with remembered world impact, not map area.
 */

import { updateSoilEcosystem, type SoilEcosystemCell } from "./soil-ecosystem";
import {
  updateSurfaceMoistureCell,
  type SurfaceMoistureCell,
} from "./surface-moisture";

export const FIELD_CONDITION_CELL_SIZE = 6;
export const MAX_FIELD_CONDITION_CELLS = 900;

export interface FieldConditionCell {
  cx: number;
  cz: number;
  moistureRatio: number;
  soilShearStrengthKpa: number;
  vegetationCoverage: number;
  rootDensity: number;
  soilHealth: number;
}

export function fieldConditionCellOf(x: number, z: number): [number, number] {
  return [
    Math.floor(x / FIELD_CONDITION_CELL_SIZE),
    Math.floor(z / FIELD_CONDITION_CELL_SIZE),
  ];
}

export function fieldConditionKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function cellPosition(cell: FieldConditionCell): { x: number; z: number } {
  return {
    x: (cell.cx + 0.5) * FIELD_CONDITION_CELL_SIZE,
    z: (cell.cz + 0.5) * FIELD_CONDITION_CELL_SIZE,
  };
}

function asSurfaceCell(
  cell: FieldConditionCell,
  drainageRate: number,
): SurfaceMoistureCell {
  const { x, z } = cellPosition(cell);
  return {
    x,
    z,
    moistureRatio: cell.moistureRatio,
    soilShearStrengthKpa: cell.soilShearStrengthKpa,
    drainageRate,
  };
}

function asEcosystemCell(cell: FieldConditionCell): SoilEcosystemCell {
  const { x, z } = cellPosition(cell);
  return {
    x,
    z,
    vegetationCoverage: cell.vegetationCoverage,
    rootDensity: cell.rootDensity,
    soilHealth: cell.soilHealth,
  };
}

/** Create previously undisturbed land at the moment it gains a durable trace. */
export function createFieldConditionCell(
  x: number,
  z: number,
  moistureRatio: number,
): FieldConditionCell {
  const [cx, cz] = fieldConditionCellOf(x, z);
  const initialMoisture = clamp(moistureRatio, 0, 1);
  const surface = updateSurfaceMoistureCell(
    {
      x,
      z,
      moistureRatio: initialMoisture,
      soilShearStrengthKpa: 40,
      drainageRate: 0.06,
    },
    0,
    0,
  );
  return {
    cx,
    cz,
    moistureRatio: surface.moistureRatio,
    soilShearStrengthKpa: surface.soilShearStrengthKpa,
    vegetationCoverage: 0.78,
    rootDensity: 0.68,
    soilHealth: 0.73,
  };
}

/** Apply deliberate earthwork or uncontrolled wheelspin to a remembered cell. */
export function disturbFieldCondition(
  cell: FieldConditionCell,
  disturbance: number,
): FieldConditionCell {
  const ecology = updateSoilEcosystem(
    asEcosystemCell(cell),
    0,
    cell.moistureRatio,
    clamp(disturbance, 0, 1),
  );
  return {
    ...cell,
    vegetationCoverage: ecology.vegetationCoverage,
    rootDensity: ecology.rootDensity,
    soilHealth: ecology.soilHealth,
  };
}

/** Advance field response through world time at a local, machine-derived drain rate. */
export function advanceFieldCondition(
  cell: FieldConditionCell,
  deltaWorldHours: number,
  rainIntensity: number,
  drainageRateOffsetPerHour: number,
): FieldConditionCell {
  const drainageRate = clamp(0.06 + drainageRateOffsetPerHour, 0.01, 0.42);
  const surface = updateSurfaceMoistureCell(
    asSurfaceCell(cell, drainageRate),
    clamp(rainIntensity, 0, 1),
    Math.max(0, deltaWorldHours),
  );
  const ecology = updateSoilEcosystem(
    asEcosystemCell(cell),
    Math.max(0, deltaWorldHours) / 24,
    surface.moistureRatio,
    0,
  );
  return {
    ...cell,
    moistureRatio: surface.moistureRatio,
    soilShearStrengthKpa: surface.soilShearStrengthKpa,
    vegetationCoverage: ecology.vegetationCoverage,
    rootDensity: ecology.rootDensity,
    soilHealth: ecology.soilHealth,
  };
}

/** Recover an untrusted persisted field cell without admitting malformed spatial state. */
export function recoverFieldConditionCell(
  value: unknown,
): FieldConditionCell | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<FieldConditionCell>;
  if (!Number.isFinite(candidate.cx) || !Number.isFinite(candidate.cz))
    return null;
  const cx = Math.trunc(candidate.cx as number);
  const cz = Math.trunc(candidate.cz as number);
  if (Math.abs(cx) > 100_000 || Math.abs(cz) > 100_000) return null;
  return {
    cx,
    cz,
    moistureRatio: clamp(Number(candidate.moistureRatio) || 0, 0, 1),
    soilShearStrengthKpa: clamp(
      Number(candidate.soilShearStrengthKpa) || 40,
      5,
      40,
    ),
    vegetationCoverage: clamp(Number(candidate.vegetationCoverage) || 0, 0, 1),
    rootDensity: clamp(Number(candidate.rootDensity) || 0, 0, 1),
    soilHealth: clamp(Number(candidate.soilHealth) || 0, 0, 1),
  };
}
