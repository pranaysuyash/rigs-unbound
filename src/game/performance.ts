import type { PropVisibilityMetrics } from "./visibility";

type RendererBackend = "webgl" | "webgpu";
type RendererBackendRequest = "auto" | "webgl" | "webgpu";

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
  rendererBackend?: "webgl" | "webgpu";
  rendererRequestedBackend?: "auto" | "webgl" | "webgpu";
  rendererBackendFallback?: boolean;
  rendererBackendReason?: string;

}

export interface PerformanceSnapshot {
  sampledAt: number;
  firstControllableMs: number | null;
  firstInputReadyMs: number | null;
  firstActionReadyMs: number | null;
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
  rendererBackend: RendererBackend;
  rendererRequestedBackend: RendererBackendRequest;
  rendererBackendFallback: boolean;
  rendererBackendReason: string;
  largestContentfulPaintMs: number | null;
  inputDelayMs: number | null;
  cumulativeLayoutShift: number;
  longTaskCount: number;
  longTaskDurationMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
}

interface ChromePerformanceMemory {
  usedJSHeapSize: number;
}

type PerformanceObserverEntryType = string;

type LayoutShiftLike = {
  hadRecentInput?: boolean;
  value?: number;
};
type EventTimingLike = {
  duration?: number;
};

export class PerformanceMonitor {
  private readonly frameDurations: number[] = [];
  private totalFrameSampleCount = 0;
  private firstControllableMs: number | null = null;
  private controllableMeasurementStartedAt: number;
  private firstInputReadyMs: number | null = null;
  private firstActionReadyMs: number | null = null;
  private lastSaveDurationMs = 0;
  private saveBytes = 0;
  private readonly webVitals = {
    largestContentfulPaintMs: null as number | null,
    inputDelayMs: null as number | null,
    cumulativeLayoutShift: 0,
    longTaskCount: 0,
    longTaskDurationMs: 0,
  };
  private static readonly WEBVITAL_EVENT_TYPE: string = "event";
  private static readonly LAYOUT_SHIFT_TYPE: string = "layout-shift";
  private static readonly LONGTASK_TYPE: string = "longtask";
  private static readonly LCP_TYPE: string = "largest-contentful-paint";

  constructor(
    private readonly bootStartedAt: number,
    private readonly loadDurationMs: number,
  ) {
    this.controllableMeasurementStartedAt = bootStartedAt;
    this.initializeWebVitalObservers();
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

  markActionReady(at = performance.now()): number | null {
    if (this.firstActionReadyMs === null) {
      this.firstActionReadyMs = Math.max(0, at - this.bootStartedAt);
    }
    return this.firstActionReadyMs;
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

  private supportsObserverType(entryType: string): boolean {
    if (typeof PerformanceObserver === "undefined") {
      return false;
    }
    if (typeof PerformanceObserver.supportedEntryTypes === "undefined") {
      return false;
    }
    return PerformanceObserver.supportedEntryTypes.includes(entryType);
  }

  private initializeWebVitalObservers(): void {
    if (typeof PerformanceObserver === "undefined") {
      return;
    }

    const observe = (
      entryType: string,
      callback: (entries: PerformanceEntry[]) => void,
    ): void => {
      if (!this.supportsObserverType(entryType)) {
        return;
      }
      try {
        const observer = new PerformanceObserver((list): void => {
          callback(list.getEntries());
        });
        observer.observe({
          type: entryType as PerformanceObserverEntryType,
          buffered: true,
        });
      } catch {
        return;
      }
    };

    observe(PerformanceMonitor.LCP_TYPE, (entries) => {
      for (const entry of entries) {
        this.webVitals.largestContentfulPaintMs = Math.max(
          this.webVitals.largestContentfulPaintMs ?? 0,
          entry.startTime,
        );
      }
    });

    observe(PerformanceMonitor.WEBVITAL_EVENT_TYPE, (entries) => {
      for (const entry of entries) {
        const eventTiming = entry as EventTimingLike;
        if (eventTiming.duration === undefined) {
          continue;
        }
        if (!Number.isFinite(eventTiming.duration)) {
          continue;
        }
        this.webVitals.inputDelayMs = Math.max(
          this.webVitals.inputDelayMs ?? 0,
          eventTiming.duration,
        );
      }
    });

    observe(PerformanceMonitor.LAYOUT_SHIFT_TYPE, (entries) => {
      for (const entry of entries) {
        const layoutShift = entry as LayoutShiftLike;
        if (layoutShift.hadRecentInput === true) {
          continue;
        }
        if (
          typeof layoutShift.value === "number" &&
          Number.isFinite(layoutShift.value)
        ) {
          this.webVitals.cumulativeLayoutShift += layoutShift.value;
        }
      }
    });

    observe(PerformanceMonitor.LONGTASK_TYPE, (entries) => {
      for (const entry of entries) {
        if (!Number.isFinite(entry.duration)) {
          continue;
        }
        this.webVitals.longTaskCount += 1;
        this.webVitals.longTaskDurationMs += entry.duration;
      }
    });
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
      firstActionReadyMs:
        this.firstActionReadyMs === null
          ? null
          : Number(this.firstActionReadyMs.toFixed(1)),
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
      rendererBackend: renderer.rendererBackend ?? "webgl",
      rendererRequestedBackend: renderer.rendererRequestedBackend ?? "auto",
      rendererBackendFallback: renderer.rendererBackendFallback ?? false,
      rendererBackendReason: renderer.rendererBackendReason ?? "default WebGL renderer",

      visibility: renderer.visibility ? { ...renderer.visibility } : null,
      heapUsedMb: memory.memory
        ? Number((memory.memory.usedJSHeapSize / 1_048_576).toFixed(1))
        : null,
      largestContentfulPaintMs:
        this.webVitals.largestContentfulPaintMs === null
          ? null
          : Number(this.webVitals.largestContentfulPaintMs.toFixed(1)),
      inputDelayMs:
        this.webVitals.inputDelayMs === null
          ? null
          : Number(this.webVitals.inputDelayMs.toFixed(1)),
      cumulativeLayoutShift: Number(
        this.webVitals.cumulativeLayoutShift.toFixed(4),
      ),
      longTaskCount: this.webVitals.longTaskCount,
      longTaskDurationMs: Number(this.webVitals.longTaskDurationMs.toFixed(1)),
      loadDurationMs: Number(this.loadDurationMs.toFixed(2)),
      lastSaveDurationMs: Number(this.lastSaveDurationMs.toFixed(2)),
      saveBytes: this.saveBytes,
      gpuMemoryMb: Number(estimatedGpuMemoryMb.toFixed(1)),
    };
  }
}
