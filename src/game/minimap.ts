/**
 * The field map: a canvas view of what the player has actually surveyed.
 *
 * This is the payoff surface for the exploration mechanic. A cell is only drawn
 * once `ExplorationField` says the rig could see it, so the map fills in as a
 * record of where you have been and what you could see from there — which makes
 * climbing a hill a legible reward rather than an abstract one.
 *
 * ## Why three canvases
 *
 * - **base**: the whole world's terrain colour, sampled once at construction.
 *   Sampling 128×128 is ~16k terrain queries, which is affordable once and
 *   unaffordable per frame.
 * - **revealed**: starts blank and has regions punched in from `base` as cells are
 *   surveyed. Incremental, so the per-update cost is proportional to *newly*
 *   surveyed cells rather than to the size of the world.
 * - **visible**: the on-screen canvas, redrawn from `revealed` plus live markers.
 *
 * Without the middle layer, fog-of-war would mean up to ~770 `fillRect` masking
 * calls every update.
 */

import type { GameState } from "./contracts";
import { SURVEY_CELL, unpackSurveyKey } from "./exploration";
import type { GameWorld } from "./gameworld";
import { WATER_LEVEL, WORLD_RADIUS, WORLD_SITES } from "./world";

/** Resolution of the precomputed world image, in pixels per side. */
const BASE_RESOLUTION = 144;

/** World span the map covers, in metres. */
const MAP_SPAN = WORLD_RADIUS * 2;

const METRES_PER_PIXEL = MAP_SPAN / BASE_RESOLUTION;

export class FieldMap {
  private readonly base: HTMLCanvasElement;
  private readonly revealed: HTMLCanvasElement;
  private readonly revealedCells = new Set<number>();
  private readonly context: CanvasRenderingContext2D;

  /** Terrain sampling cost of the first map open, in ms. 0 until then. */
  buildMs = 0;
  private baseReady = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly world: GameWorld,
  ) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("The field map needs a 2D canvas context.");
    }
    this.context = context;

    this.base = document.createElement("canvas");
    this.base.width = BASE_RESOLUTION;
    this.base.height = BASE_RESOLUTION;

    this.revealed = document.createElement("canvas");
    this.revealed.width = BASE_RESOLUTION;
    this.revealed.height = BASE_RESOLUTION;
  }

  /**
   * Sample the world image on first use rather than at construction.
   *
   * Painting the base costs ~20k terrain queries, which was measured at 419 ms and
   * was being spent during boot for a panel the player may never open. Deferring it
   * to the first `M` press takes that entirely off the time-to-first-frame path;
   * the cost then lands on a frame where the player has already stopped driving to
   * read a map.
   */
  private ensureBase(): void {
    if (this.baseReady) return;
    const startedAt = performance.now();
    this.paintBase();
    this.buildMs = performance.now() - startedAt;
    this.baseReady = true;
  }

  /**
   * Paint the whole world once.
   *
   * Elevation is shaded into the surface colour so the map reads as terrain rather
   * than as a flat political map: you can see where the ridges and the basins are,
   * which is what makes it usable for choosing a route.
   */
  private paintBase(): void {
    const context = this.base.getContext("2d");
    if (!context) return;
    const image = context.createImageData(BASE_RESOLUTION, BASE_RESOLUTION);

    for (let py = 0; py < BASE_RESOLUTION; py += 1) {
      const z = -WORLD_RADIUS + (py + 0.5) * METRES_PER_PIXEL;
      for (let px = 0; px < BASE_RESOLUTION; px += 1) {
        const x = -WORLD_RADIUS + (px + 0.5) * METRES_PER_PIXEL;
        const height = this.world.terrain.height(x, z);

        // Two neighbour samples serve double duty: relief shading, and the slope
        // that `surfaceFor` would otherwise recompute with four more queries.
        const east = this.world.terrain.height(x + METRES_PER_PIXEL, z);
        const north = this.world.terrain.height(x, z + METRES_PER_PIXEL);
        const slope = Math.hypot(
          (east - height) / METRES_PER_PIXEL,
          (north - height) / METRES_PER_PIXEL,
        );
        const surface = this.world.terrain.surfaceFor(x, z, height, slope);

        const relief = Math.max(-1, Math.min(1, (height - east) * 0.32));
        const elevation = Math.max(0, Math.min(1, (height + 6) / 70));
        const shade = 0.62 + elevation * 0.5 + relief * 0.22;

        const offset = (py * BASE_RESOLUTION + px) * 4;
        image.data[offset] = Math.min(
          255,
          ((surface.color >> 16) & 0xff) * shade,
        );
        image.data[offset + 1] = Math.min(
          255,
          ((surface.color >> 8) & 0xff) * shade,
        );
        image.data[offset + 2] = Math.min(255, (surface.color & 0xff) * shade);
        image.data[offset + 3] = 255;

        if (height < WATER_LEVEL) {
          image.data[offset] = 44;
          image.data[offset + 1] = 82;
          image.data[offset + 2] = 96;
        }
      }
    }
    context.putImageData(image, 0, 0);
  }

  /** Copy any newly surveyed cells from the base image into the revealed image. */
  private punchNewCells(): void {
    const context = this.revealed.getContext("2d");
    if (!context) return;
    const cellPixels = SURVEY_CELL / METRES_PER_PIXEL;

    for (const key of this.world.surveyedCells) {
      if (this.revealedCells.has(key)) continue;
      this.revealedCells.add(key);
      const [cx, cz] = unpackSurveyKey(key);
      const px = (cx * SURVEY_CELL + WORLD_RADIUS) / METRES_PER_PIXEL;
      const py = (cz * SURVEY_CELL + WORLD_RADIUS) / METRES_PER_PIXEL;
      // Overdraw by a pixel so adjacent revealed cells do not leave seams.
      context.drawImage(
        this.base,
        px - 1,
        py - 1,
        cellPixels + 2,
        cellPixels + 2,
        px - 1,
        py - 1,
        cellPixels + 2,
        cellPixels + 2,
      );
    }
  }

  /** Reset revealed area, after a world reset. */
  clear(): void {
    const context = this.revealed.getContext("2d");
    context?.clearRect(0, 0, BASE_RESOLUTION, BASE_RESOLUTION);
    this.revealedCells.clear();
  }

  private toPixel(
    x: number,
    z: number,
    size: number,
  ): readonly [number, number] {
    return [
      ((x + WORLD_RADIUS) / MAP_SPAN) * size,
      ((z + WORLD_RADIUS) / MAP_SPAN) * size,
    ];
  }

  /**
   * Redraw the visible map.
   *
   * Callers should throttle this — the map is information, not animation, and it
   * carries no benefit from running at frame rate.
   */
  draw(state: GameState): void {
    this.ensureBase();
    this.punchNewCells();

    const size = Math.max(
      1,
      Math.min(this.canvas.clientWidth, this.canvas.clientHeight),
    );
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    const target = Math.round(size * pixelRatio);
    if (this.canvas.width !== target || this.canvas.height !== target) {
      this.canvas.width = target;
      this.canvas.height = target;
    }

    const context = this.context;
    context.save();
    context.scale(pixelRatio, pixelRatio);
    context.clearRect(0, 0, size, size);

    // Unsurveyed ground.
    context.fillStyle = "#141a17";
    context.fillRect(0, 0, size, size);

    context.imageSmoothingEnabled = true;
    context.drawImage(this.revealed, 0, 0, size, size);

    // World boundary.
    context.strokeStyle = "rgba(217, 170, 82, 0.42)";
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(
      size / 2,
      size / 2,
      (WORLD_RADIUS / MAP_SPAN) * size,
      0,
      Math.PI * 2,
    );
    context.stroke();

    // Authored sites: only shown once discovered, so the map is earned.
    context.font = `${Math.max(9, size * 0.026)}px ui-monospace, monospace`;
    context.textBaseline = "middle";
    for (const site of WORLD_SITES) {
      const discovered = state.discoveries.some((item) => item.id === site.id);
      const [px, py] = this.toPixel(site.x, site.z, size);
      context.beginPath();
      context.arc(px, py, discovered ? 4 : 3, 0, Math.PI * 2);
      context.fillStyle = discovered
        ? "rgba(217, 170, 82, 0.95)"
        : "rgba(107, 201, 196, 0.42)";
      context.fill();
      if (discovered) {
        context.fillStyle = "rgba(234, 216, 184, 0.92)";
        context.fillText(site.name, px + 7, py);
      }
    }

    // Salvage the rig can currently see.
    const rig = state.rigs[state.activeRigId];
    context.fillStyle = "rgba(140, 236, 178, 0.9)";
    for (const node of this.world.exploration.nodesNear(
      rig.x,
      rig.z,
      70,
      this.world.collectedNodes,
    )) {
      const [px, py] = this.toPixel(node.x, node.z, size);
      context.fillRect(px - 1.5, py - 1.5, 3, 3);
    }

    // The relay objective.
    const cargo = state.cargoRelay.cargo;
    if (!cargo.delivered) {
      const [cx, cy] = this.toPixel(cargo.x, cargo.z, size);
      context.strokeStyle = "rgba(217, 170, 82, 0.95)";
      context.lineWidth = 1.6;
      context.beginPath();
      context.arc(cx, cy, 5, 0, Math.PI * 2);
      context.stroke();
    }

    // The rig itself: a triangle, so heading is readable at a glance.
    const [rx, ry] = this.toPixel(rig.x, rig.z, size);
    context.save();
    context.translate(rx, ry);
    // Screen +y is world +z, and world heading 0 faces +z.
    context.rotate(-rig.heading);
    context.beginPath();
    context.moveTo(0, -7);
    context.lineTo(4.6, 5);
    context.lineTo(-4.6, 5);
    context.closePath();
    context.fillStyle = "#f4e3c0";
    context.fill();
    context.strokeStyle = "#17201c";
    context.lineWidth = 1.2;
    context.stroke();
    context.restore();

    context.restore();
  }
}
