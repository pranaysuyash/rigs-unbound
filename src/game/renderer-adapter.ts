/**
 * Agnostic Renderer Adapter Contract for Rigs Unbound.
 * Decouples the headless gameplay kernel (src/game/state.ts) from specific renderers.
 * Supports Three.js 3D rendering, PixiJS 2D overlay layers, and Phaser/Canvas 2D sprite rendering.
 */

import { GameState as KernelState } from "./contracts";

export type RendererBackendType = "threejs-3d" | "pixijs-overlay" | "phaser-2d";

export interface RenderViewport {
  width: number;
  height: number;
  devicePixelRatio: number;
}

export interface RendererAdapterOptions {
  container: HTMLElement;
  viewport: RenderViewport;
  backend: RendererBackendType;
}

export interface RendererAdapter {
  readonly backend: RendererBackendType;

  /** Initialize rendering context and canvas elements */
  init(options: RendererAdapterOptions): Promise<void>;

  /** Render frame consuming headless kernel state */
  renderFrame(state: KernelState, deltaSeconds: number): void;

  /** Handle window resize events */
  resize(viewport: RenderViewport): void;

  /** Dispose WebGL/Canvas resources cleanly without memory leaks */
  dispose(): void;
}

/**
 * Registry of active renderer adapters for composite rendering (e.g. Three.js 3D + PixiJS 2D overlay)
 */
export class CompositeRendererPipeline implements RendererAdapter {
  readonly backend: RendererBackendType = "threejs-3d";
  private adapters: RendererAdapter[] = [];

  constructor(adapters: RendererAdapter[] = []) {
    this.adapters = adapters;
  }

  addAdapter(adapter: RendererAdapter): void {
    this.adapters.push(adapter);
  }

  async init(options: RendererAdapterOptions): Promise<void> {
    for (const adapter of this.adapters) {
      await adapter.init(options);
    }
  }

  renderFrame(state: KernelState, deltaSeconds: number): void {
    for (const adapter of this.adapters) {
      adapter.renderFrame(state, deltaSeconds);
    }
  }

  resize(viewport: RenderViewport): void {
    for (const adapter of this.adapters) {
      adapter.resize(viewport);
    }
  }

  dispose(): void {
    for (const adapter of this.adapters) {
      adapter.dispose();
    }
    this.adapters = [];
  }
}
