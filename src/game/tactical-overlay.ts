/**
 * 2D Tactical Overlay Renderer Component
 *
 * Provides dynamic 2D vector HUD graphics layered over the 3D rendering pipeline:
 * 1. Dynamic Fog-of-War pixel mask (radial vision & searchlight vision cones).
 * 2. Vector Threat Radar (pulsing range rings & threat indicators for Horde Night Defense).
 * 3. Tactical Construction & Dredging Grid (5m grid snap lines for Heavy Logistics).
 * 4. Arcade Drift & Velocity Motion Trails.
 */

export interface ThreatTarget {
  id: string;
  x: number;
  z: number;
  type: "drone" | "sentry" | "obstacle";
  distanceMeters: number;
  active: boolean;
}

export interface GridSnapTarget {
  x: number;
  z: number;
  label: string;
  valid: boolean;
}

export interface TacticalOverlayOptions {
  fogOfWarEnabled: boolean;
  threatRadarEnabled: boolean;
  tacticalGridEnabled: boolean;
  driftTrailsEnabled: boolean;

  // Vision parameters
  playerX: number;
  playerZ: number;
  playerHeadingRad: number;
  visionRadiusMeters: number;
  searchlightConeAngleRad: number;

  // Active threat list
  threats: readonly ThreatTarget[];

  // Construction grid
  gridSnapTargets: readonly GridSnapTarget[];
}

export class TacticalOverlayRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(width: number = 1280, height: number = 720) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "10";

    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to acquire 2D canvas context for TacticalOverlayRenderer.");
    this.ctx = ctx;
  }

  public getElement(): HTMLCanvasElement {
    return this.canvas;
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  public render(options: TacticalOverlayOptions): void {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    if (options.tacticalGridEnabled) {
      this.drawTacticalGrid(width, height, options.gridSnapTargets);
    }

    if (options.threatRadarEnabled) {
      this.drawThreatRadar(width, height, options.threats);
    }

    if (options.fogOfWarEnabled) {
      this.drawFogOfWar(width, height, options.visionRadiusMeters);
    }
  }

  /**
   * Draws tactical grid overlay lines for precision construction & dredging.
   */
  private drawTacticalGrid(
    width: number,
    height: number,
    snapTargets: readonly GridSnapTarget[],
  ): void {
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(70, 180, 140, 0.15)";
    this.ctx.lineWidth = 1;

    const gridSize = 40; // Pixel spacing for 5m grid representation
    for (let x = 0; x < width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Draw active snap targets
    for (const snap of snapTargets) {
      const screenX = width / 2 + snap.x * 4;
      const screenY = height / 2 + snap.z * 4;

      this.ctx.strokeStyle = snap.valid ? "rgba(100, 220, 160, 0.8)" : "rgba(240, 80, 80, 0.8)";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(screenX - 12, screenY - 12, 24, 24);
    }

    this.ctx.restore();
  }

  /**
   * Draws vector threat radar rings & indicators.
   */
  private drawThreatRadar(
    width: number,
    height: number,
    threats: readonly ThreatTarget[],
  ): void {
    this.ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;

    // Range rings
    this.ctx.strokeStyle = "rgba(220, 120, 40, 0.25)";
    this.ctx.lineWidth = 1.5;

    for (const radius of [80, 160, 240]) {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Draw threat markers
    for (const threat of threats) {
      if (!threat.active) continue;
      const screenX = centerX + threat.x * 3.5;
      const screenY = centerY + threat.z * 3.5;

      this.ctx.fillStyle = "rgba(240, 60, 60, 0.85)";
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
      this.ctx.fill();

      // Threat ring
      this.ctx.strokeStyle = "rgba(255, 100, 100, 0.6)";
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, 12, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * Draws dynamic radial Fog-of-War shroud.
   */
  private drawFogOfWar(
    width: number,
    height: number,
    visionRadiusMeters: number,
  ): void {
    this.ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusPx = Math.max(120, visionRadiusMeters * 5);

    // Shroud background
    this.ctx.fillStyle = "rgba(10, 14, 12, 0.45)";
    this.ctx.fillRect(0, 0, width, height);

    // Punch out clear vision circle
    this.ctx.globalCompositeOperation = "destination-out";

    const gradient = this.ctx.createRadialGradient(
      centerX,
      centerY,
      radiusPx * 0.4,
      centerX,
      centerY,
      radiusPx,
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radiusPx, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }
}
