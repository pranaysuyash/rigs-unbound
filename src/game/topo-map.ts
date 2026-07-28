/**
 * Diegetic Topo Map & Isometric Contour Generator.
 *
 * Extracts elevation contour lines at regular height step intervals,
 * computing local slope gradient vectors and hazard color classifications for map UI displays.
 */

export interface ContourLineSegment {
  elevationM: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  slopeAngleDeg: number;
  hazardLevel: "safe" | "warning" | "danger";
}

export function generateElevationContours(
  elevationGrid: number[][],
  gridStepSizeM = 2.0,
  contourIntervalM = 5.0,
): ContourLineSegment[] {
  const contours: ContourLineSegment[] = [];
  const rows = elevationGrid.length;
  if (rows < 2) return contours;
  const cols = elevationGrid[0]?.length ?? 0;
  if (cols < 2) return contours;

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const eTL = elevationGrid[r]![c]!;
      const eTR = elevationGrid[r]![c + 1]!;
      const eBL = elevationGrid[r + 1]![c]!;

      const avgElevation = (eTL + eTR + eBL) / 3;
      const nearestContour =
        Math.round(avgElevation / contourIntervalM) * contourIntervalM;

      const dzX = (eTR - eTL) / gridStepSizeM;
      const dzY = (eBL - eTL) / gridStepSizeM;
      const slopeGrad = Math.sqrt(dzX * dzX + dzY * dzY);
      const slopeAngleDeg = (Math.atan(slopeGrad) * 180) / Math.PI;

      let hazardLevel: ContourLineSegment["hazardLevel"] = "safe";
      if (slopeAngleDeg > 28) {
        hazardLevel = "danger";
      } else if (slopeAngleDeg > 15) {
        hazardLevel = "warning";
      }

      contours.push({
        elevationM: nearestContour,
        startX: Number((c * gridStepSizeM).toFixed(1)),
        startY: Number((r * gridStepSizeM).toFixed(1)),
        endX: Number(((c + 1) * gridStepSizeM).toFixed(1)),
        endY: Number(((r + 1) * gridStepSizeM).toFixed(1)),
        slopeAngleDeg: Number(slopeAngleDeg.toFixed(1)),
        hazardLevel,
      });
    }
  }

  return contours;
}
