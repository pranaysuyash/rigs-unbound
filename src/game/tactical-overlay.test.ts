import { describe, expect, it, vi } from "vitest";
import {
  TacticalOverlayRenderer,
  type TacticalOverlayOptions,
} from "./tactical-overlay";

describe("TacticalOverlayRenderer", () => {
  it("initializes canvas element and handles resize operations", () => {
    // Mock canvas context
    const mockContext = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      strokeRect: vi.fn(),
      fillRect: vi.fn(),
      createRadialGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
    };

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      mockContext as unknown as CanvasRenderingContext2D,
    );

    const overlay = new TacticalOverlayRenderer(1280, 720);
    const canvas = overlay.getElement();
    expect(canvas.width).toBe(1280);
    expect(canvas.height).toBe(720);

    overlay.resize(1920, 1080);
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);

    const options: TacticalOverlayOptions = {
      fogOfWarEnabled: true,
      threatRadarEnabled: true,
      tacticalGridEnabled: true,
      driftTrailsEnabled: false,
      playerX: 0,
      playerZ: 0,
      playerHeadingRad: 0,
      visionRadiusMeters: 30,
      searchlightConeAngleRad: Math.PI / 4,
      threats: [
        {
          id: "threat-1",
          x: 10,
          z: 15,
          type: "drone",
          distanceMeters: 18,
          active: true,
        },
      ],
      gridSnapTargets: [
        {
          x: 5,
          z: 5,
          label: "Silo Wall",
          valid: true,
        },
      ],
    };

    overlay.render(options);
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 1920, 1080);
    expect(mockContext.strokeRect).toHaveBeenCalled();
  });
});
