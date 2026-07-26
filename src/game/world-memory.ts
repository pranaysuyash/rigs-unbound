/**
 * World Memory & Soil Displacement System.
 *
 * Extends the signature world-memory element (ploughing terrain leaves persistent furrows).
 * Computes elevation displacement and modifies local soil surface state dynamically.
 */

import type { GameState, RigState } from "./contracts";


export interface SoilDisplacementCell {
  cellX: number;
  cellZ: number;
  depth: number;
  surfaceOverride: "tilled" | "mud";
}

/** Grid size for soil displacement tracking cells (in metres). */
export const SOIL_CELL_SIZE = 4;

export function soilCellKey(cellX: number, cellZ: number): string {
  return `${cellX},${cellZ}`;
}

export function soilCellOf(x: number, z: number): [number, number] {
  return [Math.floor(x / SOIL_CELL_SIZE), Math.floor(z / SOIL_CELL_SIZE)];
}

/**
 * Evaluates active furrows and rig movement to record persistent soil displacement cells.
 */
export function deriveSoilDisplacement(state: GameState): Map<string, SoilDisplacementCell> {
  const map = new Map<string, SoilDisplacementCell>();

  for (const mark of state.furrows) {
    const [cx, cz] = soilCellOf(mark.x, mark.z);
    const key = soilCellKey(cx, cz);

    const existing = map.get(key);
    if (existing) {
      existing.depth = Math.min(existing.depth + 0.08, 0.45);
    } else {
      map.set(key, {
        cellX: cx,
        cellZ: cz,
        depth: 0.12,
        surfaceOverride: "tilled",
      });
    }
  }

  // Heavy wheel wheelspin in mud deepens displacement into mud rutting
  for (const rigId in state.rigs) {
    const rig: RigState = state.rigs[rigId as keyof typeof state.rigs];
    if (rig.telemetry.slip > 0.4 && rig.telemetry.surfaceId === "mud") {
      const [cx, cz] = soilCellOf(rig.x, rig.z);
      const key = soilCellKey(cx, cz);
      const existing = map.get(key);
      if (existing) {
        existing.depth = Math.min(existing.depth + 0.1, 0.5);
        existing.surfaceOverride = "mud";
      } else {
        map.set(key, {
          cellX: cx,
          cellZ: cz,
          depth: 0.15,
          surfaceOverride: "mud",
        });
      }
    }
  }

  return map;
}
