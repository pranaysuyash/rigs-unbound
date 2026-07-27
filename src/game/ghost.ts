/**
 * Ghost Telemetry & Replay Trail System.
 *
 * Samples vehicle transforms during active runs and provides continuous 3D interpolation
 * for rendering ghost vehicle overlays during time trials and route optimization.
 */

import type { RigState } from "./contracts";

export interface GhostSnapshot {
  timestampMs: number;
  x: number;
  y: number;
  z: number;
  heading: number;
  speed: number;
}

export class GhostTrailRecorder {
  private snapshots: GhostSnapshot[] = [];
  private sampleIntervalMs = 100; // 10Hz sampling
  private lastSampleMs = -1;

  record(rig: RigState, timestampMs: number): void {
    if (this.lastSampleMs < 0 || timestampMs - this.lastSampleMs >= this.sampleIntervalMs) {
      this.lastSampleMs = timestampMs;
      this.snapshots.push({
        timestampMs,
        x: Number(rig.x.toFixed(3)),
        y: Number(rig.y.toFixed(3)),
        z: Number(rig.z.toFixed(3)),
        heading: Number(rig.heading.toFixed(3)),
        speed: Number(rig.speed.toFixed(2)),
      });
    }
  }

  getSnapshots(): readonly GhostSnapshot[] {
    return this.snapshots;
  }

  clear(): void {
    this.snapshots = [];
    this.lastSampleMs = -1;
  }

  /**
   * Samples interpolated ghost transform at a given run timestamp.
   */
  sampleAt(timestampMs: number): GhostSnapshot | null {
    if (this.snapshots.length === 0) return null;
    if (timestampMs <= this.snapshots[0]!.timestampMs) return this.snapshots[0]!;
    if (timestampMs >= this.snapshots[this.snapshots.length - 1]!.timestampMs) {
      return this.snapshots[this.snapshots.length - 1]!;
    }

    // Binary search for surrounding keyframes
    let low = 0;
    let high = this.snapshots.length - 1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (this.snapshots[mid]!.timestampMs <= timestampMs) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const prev = this.snapshots[high]!;
    const next = this.snapshots[low]!;
    const span = next.timestampMs - prev.timestampMs;
    const factor = span > 0 ? (timestampMs - prev.timestampMs) / span : 0;

    return {
      timestampMs,
      x: prev.x + (next.x - prev.x) * factor,
      y: prev.y + (next.y - prev.y) * factor,
      z: prev.z + (next.z - prev.z) * factor,
      heading: prev.heading + (next.heading - prev.heading) * factor,
      speed: prev.speed + (next.speed - prev.speed) * factor,
    };
  }
}
