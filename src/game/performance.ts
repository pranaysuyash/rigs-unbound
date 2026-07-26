import type { PropVisibilityMetrics } from "./visibility";

export interface RendererMetrics {
  drawCalls: number;
  triangles: number;
  /** One-time cost of building the terrain mesh, in ms. */
  terrainBuildMs?: number;
  /** Logical prop visibility selected during the latest renderer rebuild. */
  visibility?: PropVisibilityMetrics;
}

export interface PerformanceSnapshot extends Omit<
  RendererMetrics,
  "terrainBuildMs" | "visibility"
> {
  sampledAt: number;
  firstControllableMs: number | null;
  firstInputReadyMs: number | null;
  averageFrameMs: number;
  p95FrameMs: number;
  /** Number of bounded frame samples behind average and p95 values. */
  frameSampleCount: number;
  framesPerSecond: number;
  heapUsedMb: number | null;
  loadDurationMs: number;
  lastSaveDurationMs: number;
  saveBytes: number;
  terrainBuildMs: number | null;
  visibility: PropVisibilityMetrics | null;
}

interface ChromePerformanceMemory {
  usedJSHeapSize: number;
}

export class PerformanceMonitor {
  private readonly frameDurations: number[] = [];
  private firstControllableMs: number | null = null;
  private firstInputReadyMs: number | null = null;
  private lastSaveDurationMs = 0;
  private saveBytes = 0;

  constructor(
    private readonly bootStartedAt: number,
    private readonly loadDurationMs: number,
  ) {}

  markControllable(at = performance.now()): void {
    if (this.firstControllableMs === null) {
      this.firstControllableMs = Math.max(0, at - this.bootStartedAt);
    }
  }

  markInputReady(at = performance.now()): void {
    if (this.firstInputReadyMs === null) {
      this.firstInputReadyMs = Math.max(0, at - this.bootStartedAt);
    }
  }

  recordFrame(durationMs: number): void {
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      return;
    }
    this.frameDurations.push(Math.min(durationMs, 250));
    if (this.frameDurations.length > 240) {
      this.frameDurations.splice(0, this.frameDurations.length - 240);
    }
  }

  recordSave(durationMs: number, bytes: number): void {
    this.lastSaveDurationMs = Math.max(0, durationMs);
    this.saveBytes = Math.max(0, bytes);
  }

  snapshot(renderer: RendererMetrics): PerformanceSnapshot {
    const samples = [...this.frameDurations].sort(
      (left, right) => left - right,
    );
    const total = samples.reduce((sum, value) => sum + value, 0);
    const averageFrameMs = samples.length === 0 ? 0 : total / samples.length;
    const p95Index = Math.max(0, Math.ceil(samples.length * 0.95) - 1);
    const p95FrameMs = samples[p95Index] ?? 0;
    const memory = performance as Performance & {
      memory?: ChromePerformanceMemory;
    };

    return {
      sampledAt: Math.round(performance.now()),
      firstControllableMs:
        this.firstControllableMs === null
          ? null
          : Number(this.firstControllableMs.toFixed(1)),
      firstInputReadyMs:
        this.firstInputReadyMs === null
          ? null
          : Number(this.firstInputReadyMs.toFixed(1)),
      averageFrameMs: Number(averageFrameMs.toFixed(2)),
      p95FrameMs: Number(p95FrameMs.toFixed(2)),
      frameSampleCount: samples.length,
      framesPerSecond:
        averageFrameMs <= 0 ? 0 : Number((1000 / averageFrameMs).toFixed(1)),
      drawCalls: renderer.drawCalls,
      triangles: renderer.triangles,
      terrainBuildMs: renderer.terrainBuildMs ?? null,
      visibility: renderer.visibility ? { ...renderer.visibility } : null,
      heapUsedMb: memory.memory
        ? Number((memory.memory.usedJSHeapSize / 1_048_576).toFixed(1))
        : null,
      loadDurationMs: Number(this.loadDurationMs.toFixed(2)),
      lastSaveDurationMs: Number(this.lastSaveDurationMs.toFixed(2)),
      saveBytes: this.saveBytes,
    };
  }
}
