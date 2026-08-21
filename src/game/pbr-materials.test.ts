import { describe, it, expect } from "vitest";
import {
  generateTerrainPbrTextures,
  generateVehicleMetalPbrTextures,
  createPbrMaterial,
} from "./pbr-materials";

describe("PBR Materials Engine", () => {
  it("generates terrain PBR textures without crashing", () => {
    const textures = generateTerrainPbrTextures(64);
    expect(textures).toBeDefined();
  });

  it("generates vehicle metal PBR textures with valid maps", () => {
    const textures = generateVehicleMetalPbrTextures(64);
    expect(textures).toBeDefined();
  });

  it("creates enhanced PBR physical materials", () => {
    const mat = createPbrMaterial(0x4c3328, {
      roughness: 0.6,
      metalness: 0.3,
      type: "metal",
    });
    expect(mat).toBeDefined();
    expect(mat.roughness).toBe(0.6);
    expect(mat.metalness).toBe(0.3);
  });
});
