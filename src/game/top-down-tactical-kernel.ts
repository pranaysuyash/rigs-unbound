/**
 * Top-Down Quarry Logistics & Dredging Kernel
 *
 * Headless, pure simulation rules for top-down heavy construction:
 * - Channel dredging depth tracking.
 * - Structural component grid snapping and placement validation.
 */

export interface DredgingSegment {
  id: string;
  gridX: number;
  gridZ: number;
  targetDepthMeters: number;
  currentDepthMeters: number;
  complete: boolean;
}

export interface TopDownTacticalState {
  status: "ready" | "active" | "completed";
  segments: readonly DredgingSegment[];
  totalDredgedMeters: number;
}

export function createInitialTacticalState(): TopDownTacticalState {
  return {
    status: "ready",
    segments: [
      {
        id: "channel-01",
        gridX: 10,
        gridZ: 5,
        targetDepthMeters: 2.5,
        currentDepthMeters: 0,
        complete: false,
      },
      {
        id: "channel-02",
        gridX: 10,
        gridZ: 6,
        targetDepthMeters: 2.5,
        currentDepthMeters: 0,
        complete: false,
      },
      {
        id: "channel-03",
        gridX: 10,
        gridZ: 7,
        targetDepthMeters: 2.5,
        currentDepthMeters: 0,
        complete: false,
      },
    ],
    totalDredgedMeters: 0,
  };
}

export function applyDredgingProgress(
  state: TopDownTacticalState,
  gridX: number,
  gridZ: number,
  dredgeAmount: number,
): TopDownTacticalState {
  let dredgedTotal = state.totalDredgedMeters;

  const updatedSegments = state.segments.map((seg) => {
    if (seg.gridX === gridX && seg.gridZ === gridZ && !seg.complete) {
      const newDepth = Math.min(
        seg.targetDepthMeters,
        seg.currentDepthMeters + dredgeAmount,
      );
      dredgedTotal += newDepth - seg.currentDepthMeters;
      return {
        ...seg,
        currentDepthMeters: newDepth,
        complete: newDepth >= seg.targetDepthMeters,
      };
    }
    return seg;
  });

  const allComplete = updatedSegments.every((s) => s.complete);

  return {
    ...state,
    segments: updatedSegments,
    totalDredgedMeters: dredgedTotal,
    status: allComplete ? "completed" : state.status,
  };
}
