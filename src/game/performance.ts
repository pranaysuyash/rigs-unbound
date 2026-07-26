import type { PropVisibilityMetrics } from "./visibility";

export interface RendererMetrics {
  drawCalls: number;
  triangles: number;
  /** Renderer-owned geometry allocation count, not an estimated byte total. */
  geometries: number;
  /** Renderer-owned texture allocation count, not an estimated byte total. */
  textures: number;
  /** One-time cost of building the terrain mesh, in ms. */
  terrainBuildMs?: number;
  /** Logical prop visibility selected during the latest renderer rebuild. */
  visibility?: PropVisibilityMetrics;
  /** Estimated GPU memory usage in MB (geometries + textures). */
  gpuMemoryMb?: number;
}

export interface PerformanceSnapshot {
  sampledAt: number;
  firstControllableMs: number | null;
  firstInputReadyMs: number | null;
  averageFrameMs: number;
  p95FrameMs: number;
  /** Number of bounded frame samples behind average and p95 values. */
  frameSampleCount: number;
  /** Lifetime valid-frame count used for monotonic policy windows. */
  totalFrameSampleCount: number;
  framesPerSecond: number;
  heapUsedMb: number | null;
  loadDurationMs: number;
  lastSaveDurationMs: number;
  saveBytes: number;
  terrainBuildMs: number | null;
  visibility: PropVisibilityMetrics | null;
  /** Estimated GPU memory usage in MB. */
  gpuMemoryMb: number | null;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
}

interface ChromePerformanceMemory {
  usedJSHeapSize: number;
}

export class PerformanceMonitor {
  private readonly frameDurations: number[] = [];
  private totalFrameSampleCount = 0;
  private firstControllableMs: number | null = null;
  private controllableMeasurementStartedAt: number;
  private firstInputReadyMs: number | null = null;
  private lastSaveDurationMs = 0;
  private saveBytes = 0;

  constructor(
    private readonly bootStartedAt: number,
    private readonly loadDurationMs: number,
  ) {
    this.controllableMeasurementStartedAt = bootStartedAt;
  }

  /**
   * Begin measuring player-entry latency after the player asks to enter.
   *
   * Time spent reading the welcome panel is human dwell time, not renderer
   * pressure, and must never force a reduced-quality profile.
   */
  beginControllableMeasurement(at = performance.now()): void {
    this.controllableMeasurementStartedAt = at;
    this.firstControllableMs = null;
  }

  markControllable(at = performance.now()): void {
    if (this.firstControllableMs === null) {
      this.firstControllableMs = Math.max(
        0,
        at - this.controllableMeasurementStartedAt,
      );
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
    this.totalFrameSampleCount += 1;
    this.frameDurations.push(Math.min(durationMs, 250));
    if (this.frameDurations.length > 240) {
      this.frameDurations.splice(0, this.frameDurations.length - 240);
    }
  }

  /**
   * Start a fresh controllable-play evidence window.
   *
   * Welcome screens and background-tab pauses are not gameplay performance
   * evidence. Resetting both the bounded and monotonic counters keeps runtime
   * profile hysteresis anchored to frames the player could actually control.
   */
  resetFrameWindow(): void {
    this.frameDurations.length = 0;
    this.totalFrameSampleCount = 0;
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

    // Estimate GPU memory: geometries * ~1KB + textures * ~4MB (1024x1024 RGBA)
    const estimatedGpuMemoryMb =
      renderer.gpuMemoryMb ??
      (renderer.geometries * 1024 + renderer.textures * 1024 * 1024 * 4) /
        (1024 * 1024);

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
      totalFrameSampleCount: this.totalFrameSampleCount,
      framesPerSecond:
        averageFrameMs <= 0 ? 0 : Number((1000 / averageFrameMs).toFixed(1)),
      drawCalls: renderer.drawCalls,
      triangles: renderer.triangles,
      geometries: renderer.geometries,
      textures: renderer.textures,
      terrainBuildMs: renderer.terrainBuildMs ?? null,
      visibility: renderer.visibility ? { ...renderer.visibility } : null,
      heapUsedMb: memory.memory
        ? Number((memory.memory.usedJSHeapSize / 1_048_576).toFixed(1))
        : null,
      loadDurationMs: Number(this.loadDurationMs.toFixed(2)),
      lastSaveDurationMs: Number(this.lastSaveDurationMs.toFixed(2)),
      saveBytes: this.saveBytes,
      gpuMemoryMb: Number(estimatedGpuMemoryMb.toFixed(1)),
    };
  }
}
