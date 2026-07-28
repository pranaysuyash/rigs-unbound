/**
 * The field map: a high-resolution topographical canvas view of surveyed territory.
 *
 * This is the payoff surface for the exploration mechanic. A cell is only drawn
 * once `ExplorationField` says the rig could see it, so the map fills in as a
 * record of where you have been and what you could see from there.
 */

import type { GameState } from "./contracts";
import { SURVEY_CELL, unpackSurveyKey } from "./exploration";
import type { GameWorld } from "./gameworld";
import { WATER_LEVEL, WORLD_RADIUS, WORLD_SITES } from "./world";

/** Resolution of the precomputed world image (384x384 for sub-metre topographical detail). */
const BASE_RESOLUTION = 384;

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
   */
  private ensureBase(): void {
    if (this.baseReady) return;
    const startedAt = performance.now();
    this.paintBase();
    this.buildMs = performance.now() - startedAt;
    this.baseReady = true;
  }

  /**
   * Paint the full world terrain with multi-tier biome colors, 3D hillshading, and topographic contour isolines.
   */
  private paintBase(): void {
    const context = this.base.getContext("2d");
    if (!context) return;
    const image = context.createImageData(BASE_RESOLUTION, BASE_RESOLUTION);

    // Sun direction vector from North-West for 3D terrain hillshading
    const sunX = -0.577;
    const sunY = 0.577;
    const sunZ = -0.577;

    for (let py = 0; py < BASE_RESOLUTION; py += 1) {
      const z = -WORLD_RADIUS + (py + 0.5) * METRES_PER_PIXEL;
      for (let px = 0; px < BASE_RESOLUTION; px += 1) {
        const x = -WORLD_RADIUS + (px + 0.5) * METRES_PER_PIXEL;
        const height = this.world.terrain.height(x, z);

        const east = this.world.terrain.height(x + METRES_PER_PIXEL, z);
        const north = this.world.terrain.height(x, z + METRES_PER_PIXEL);

        // Slope & surface normal components
        const dzdx = (east - height) / METRES_PER_PIXEL;
        const dzdz = (north - height) / METRES_PER_PIXEL;
        const normLen = Math.hypot(dzdx, 1, dzdz);
        const nx = -dzdx / normLen;
        const ny = 1 / normLen;
        const nz = -dzdz / normLen;

        // Hillshade dot product (0.45 to 1.35)
        const dot = nx * sunX + ny * sunY + nz * sunZ;
        const hillshade = Math.max(0.45, Math.min(1.35, 0.75 + dot * 0.55));

        let baseR = 34;
        let baseG = 120;
        let baseB = 60;

        if (height < WATER_LEVEL) {
          // Aquatic gradient: shallow cyan to deep blue
          const depth = Math.min(1, (WATER_LEVEL - height) / 12);
          baseR = Math.round(14 * (1 - depth) + 12 * depth);
          baseG = Math.round(116 * (1 - depth) + 54 * depth);
          baseB = Math.round(180 * (1 - depth) + 110 * depth);
        } else if (height < 10) {
          // Lowland lush meadow
          baseR = 40;
          baseG = 135;
          baseB = 65;
        } else if (height < 22) {
          // Upland plateau & graded soil
          baseR = 125;
          baseG = 105;
          baseB = 55;
        } else if (height < 36) {
          // Mountain ridge rock
          baseR = 85;
          baseG = 95;
          baseB = 105;
        } else {
          // High mountain peak
          baseR = 175;
          baseG = 185;
          baseB = 195;
        }

        // Apply 3D hillshading
        let r = Math.min(255, baseR * hillshade);
        let g = Math.min(255, baseG * hillshade);
        let b = Math.min(255, baseB * hillshade);

        // Contour lines (every 3 metres elevation)
        if (height >= WATER_LEVEL) {
          const interval = 3.0;
          const currentC = Math.floor(height / interval);
          const eastC = Math.floor(east / interval);
          const northC = Math.floor(north / interval);

          if (currentC !== eastC || currentC !== northC) {
            // Crisp gold isoline accent
            r = Math.min(255, r * 0.7 + 245 * 0.35);
            g = Math.min(255, g * 0.7 + 158 * 0.35);
            b = Math.min(255, b * 0.7 + 11 * 0.35);
          }
        }

        const offset = (py * BASE_RESOLUTION + px) * 4;
        image.data[offset] = r;
        image.data[offset + 1] = g;
        image.data[offset + 2] = b;
        image.data[offset + 3] = 255;
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
   * Redraw the visible map with high-tech radar overlays, compass bearings, sightline wedges, and node markers.
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

    const center = size / 2;
    const radius = (WORLD_RADIUS / MAP_SPAN) * size;

    // Unsurveyed ground background
    context.fillStyle = "#090d0c";
    context.fillRect(0, 0, size, size);

    context.imageSmoothingEnabled = true;
    context.drawImage(this.revealed, 0, 0, size, size);

    // 1. Radar Grid & Concentric Range Rings
    context.strokeStyle = "rgba(45, 212, 191, 0.22)";
    context.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach((ratio) => {
      context.beginPath();
      context.arc(center, center, radius * ratio, 0, Math.PI * 2);
      context.stroke();
    });

    // 2. Crosshair Grid Lines
    context.beginPath();
    context.moveTo(center, center - radius);
    context.lineTo(center, center + radius);
    context.moveTo(center - radius, center);
    context.lineTo(center + radius, center);
    context.stroke();

    // 3. Outer World & Compass Bezel Ring
    context.strokeStyle = "rgba(45, 212, 191, 0.55)";
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.stroke();

    // 4. Cardinal Compass Markers (N, E, S, W)
    context.font = `bold ${Math.max(10, size * 0.028)}px ui-monospace, monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#2dd4bf";

    context.fillText("N", center, center - radius + 12);
    context.fillText("S", center, center + radius - 12);
    context.fillText("E", center + radius - 12, center);
    context.fillText("W", center - radius + 12, center);

    // 5. Sightline Cone radiating from Active Rig Heading
    const rig = state.rigs[state.activeRigId];
    const [rx, ry] = this.toPixel(rig.x, rig.z, size);
    const headingAngle = rig.heading + Math.PI;

    context.save();
    context.translate(rx, ry);
    context.fillStyle = "rgba(45, 212, 191, 0.09)";
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(
      0,
      0,
      radius * 0.6,
      headingAngle - Math.PI * 0.22,
      headingAngle + Math.PI * 0.22,
    );
    context.closePath();
    context.fill();
    context.restore();

    // 6. Authored Sites & Landmark Nodes
    context.font = `${Math.max(9, size * 0.026)}px ui-monospace, monospace`;
    context.textAlign = "left";
    context.textBaseline = "middle";

    for (const site of WORLD_SITES) {
      const discovered = state.discoveries.some((item) => item.id === site.id);
      const [px, py] = this.toPixel(site.x, site.z, size);

      context.beginPath();
      context.arc(px, py, discovered ? 5 : 3, 0, Math.PI * 2);
      context.fillStyle = discovered
        ? "rgba(245, 158, 11, 0.95)"
        : "rgba(45, 212, 191, 0.45)";
      context.fill();

      if (discovered) {
        context.strokeStyle = "rgba(245, 158, 11, 0.5)";
        context.lineWidth = 1.2;
        context.beginPath();
        context.arc(px, py, 8, 0, Math.PI * 2);
        context.stroke();

        context.fillStyle = "rgba(253, 230, 138, 0.95)";
        context.fillText(site.name, px + 10, py);
      }
    }

    // 7. Salvage Beacon Markers
    for (const node of this.world.exploration.nodesNear(
      rig.x,
      rig.z,
      70,
      this.world.collectedNodes,
    )) {
      const [px, py] = this.toPixel(node.x, node.z, size);
      context.save();
      context.translate(px, py);
      context.rotate(Math.PI / 4);
      context.fillStyle = "rgba(34, 197, 94, 0.95)";
      context.fillRect(-2.5, -2.5, 5, 5);
      context.restore();
    }

    // 8. Cargo Relay Objective
    const cargo = state.cargoRelay.cargo;
    if (!cargo.delivered) {
      const [cx, cy] = this.toPixel(cargo.x, cargo.z, size);
      context.strokeStyle = "rgba(245, 158, 11, 0.95)";
      context.lineWidth = 1.8;
      context.beginPath();
      context.arc(cx, cy, 6, 0, Math.PI * 2);
      context.stroke();
    }

    // 9. Active Rig Indicator (Heading Arrowhead & Direction Vector)
    context.save();
    context.translate(rx, ry);

    context.strokeStyle = "rgba(245, 158, 11, 0.6)";
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(Math.sin(headingAngle) * 16, -Math.cos(headingAngle) * 16);
    context.stroke();

    context.rotate(headingAngle);
    context.beginPath();
    context.moveTo(0, -8);
    context.lineTo(5, 6);
    context.lineTo(-5, 6);
    context.closePath();
    context.fillStyle = "#f59e0b";
    context.fill();
    context.strokeStyle = "#0f172a";
    context.lineWidth = 1.4;
    context.stroke();
    context.restore();

    context.restore();
  }
}
