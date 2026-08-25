import * as THREE from "three";
import type { GameWorld } from "../gameworld";
import { generateTerrainPbrTextures } from "../pbr-materials";
import { refreshTerrainNormalsInRegion } from "../terrain-normals";
import { WORLD_RADIUS } from "../world";

/** Terrain mesh sample spacing, in metres. */
export const TERRAIN_STEP = 5.2;

/** Span of the terrain mesh, in metres. Slightly wider than the world disc. */
export const TERRAIN_SPAN = (WORLD_RADIUS + 12) * 2;

/**
 * Owns the terrain mesh: height grid sampling, vertex colouring from canonical
 * surface + field memory, patch-scoped deformation refresh (ADR-0041), and
 * patch-scoped normal recompute. Extracted from GameRenderer (ADR-0054 unit 4).
 * Presentation-only: no value here can change traction or deformation truth.
 */
export class EnvironmentPresenter {
  private readonly cells = Math.round(TERRAIN_SPAN / TERRAIN_STEP);
  private readonly origin = -TERRAIN_SPAN / 2;
  private terrainMesh!: THREE.Mesh;
  private terrainHeights!: Float32Array;

  private readonly scratchColor = new THREE.Color();
  private readonly wetFieldColour = new THREE.Color(0x49351f);
  private readonly damagedFieldColour = new THREE.Color(0x8f6934);
  private readonly recoveringFieldColour = new THREE.Color(0x5f8c48);

  private buildMs = 0;
  private regionRefreshMs = 0;

  constructor(
    private readonly scene: THREE.Scene,
    private readonly world: GameWorld,
  ) {
    this.buildTerrain();
  }

  get mesh(): THREE.Mesh {
    return this.terrainMesh;
  }

  get terrainBuildMs(): number {
    return this.buildMs;
  }

  get terrainRegionRefreshMs(): number {
    return this.regionRefreshMs;
  }

  private buildTerrain(): void {
    const startedAt = performance.now();
    const cells = this.cells;
    const size = cells + 1;

    this.terrainHeights = this.world.terrain.sampleHeightGrid(
      this.origin,
      this.origin,
      cells,
      TERRAIN_STEP,
    );

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(size * size * 3);
    const colors = new Float32Array(size * size * 3);
    const colour = new THREE.Color();

    for (let iz = 0; iz < size; iz += 1) {
      for (let ix = 0; ix < size; ix += 1) {
        const index = iz * size + ix;
        const x = this.origin + ix * TERRAIN_STEP;
        const z = this.origin + iz * TERRAIN_STEP;
        const y = this.terrainHeights[index]!;
        positions[index * 3] = x;
        positions[index * 3 + 1] = y;
        positions[index * 3 + 2] = z;

        // Slope from the grid neighbours we already sampled. Calling `surfaceFor`
        // without it makes the field fall back to `slope()`, which is four more
        // `height()` queries per vertex — measured at ~300 ms of the terrain build
        // on its own, for a number that is sitting in the array beside us.
        const east = this.terrainHeights[index + (ix < cells ? 1 : -1)]!;
        const north = this.terrainHeights[index + (iz < cells ? size : -size)]!;
        const slope = Math.hypot(
          (east - y) / TERRAIN_STEP,
          (north - y) / TERRAIN_STEP,
        );

        const tint = this.resolveTerrainVertexColour(
          x,
          z,
          y,
          slope,
          ix,
          iz,
          colour,
        );
        colors[index * 3] = colour.r * tint;
        colors[index * 3 + 1] = colour.g * tint;
        colors[index * 3 + 2] = colour.b * tint;
      }
    }

    const indices: number[] = [];
    for (let iz = 0; iz < cells; iz += 1) {
      for (let ix = 0; ix < cells; ix += 1) {
        const a = iz * size + ix;
        const b = a + 1;
        const c = a + size;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const uvs = new Float32Array(size * size * 2);
    for (let iz = 0; iz <= cells; iz += 1) {
      for (let ix = 0; ix <= cells; ix += 1) {
        const index = iz * size + ix;
        uvs[index * 2] = ix / cells;
        uvs[index * 2 + 1] = iz / cells;
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const terrainPbr = generateTerrainPbrTextures(512);
    const terrainMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.02,
    });
    if (terrainPbr.normalMap) {
      terrainMaterial.normalMap = terrainPbr.normalMap;
      terrainMaterial.normalScale = new THREE.Vector2(0.75, 0.75);
    }
    if (terrainPbr.roughnessMap) {
      terrainMaterial.roughnessMap = terrainPbr.roughnessMap;
    }

    this.terrainMesh = new THREE.Mesh(geometry, terrainMaterial);
    this.terrainMesh.name = "terrain";
    this.scene.add(this.terrainMesh);
    this.buildMs = performance.now() - startedAt;
  }

  /**
   * Presentation-only terrain colour derived from canonical geometry and
   * GameWorld field memory. No renderer value can change traction, vegetation,
   * or terrain deformation.
   */
  private resolveTerrainVertexColour(
    x: number,
    z: number,
    height: number,
    slope: number,
    ix: number,
    iz: number,
    target: THREE.Color,
  ): number {
    const surface = this.world.terrain.surfaceFor(x, z, height, slope);
    target.setHex(surface.color);
    const field = this.world.fieldConditionAt(x, z);
    if (field) {
      const wetness = Math.max(
        0,
        Math.min(1, (field.moistureRatio - 0.3) / 0.7),
      );
      const damage = Math.max(0, Math.min(1, 1 - field.soilHealth));
      if (wetness > 0) target.lerp(this.wetFieldColour, wetness * 0.62);
      if (damage > 0) target.lerp(this.damagedFieldColour, damage * 0.28);
      if (wetness < 0.45 && field.soilHealth > 0.55) {
        target.lerp(
          this.recoveringFieldColour,
          (field.soilHealth - 0.55) * 0.28,
        );
      }
    }
    // A wider, still-natural-looking per-vertex tint spread than the prior
    // 0.9-1.08 range: at that narrow a swing the ground read as a flat,
    // single-tone plane from any camera angle pulled back far enough to lose
    // per-pixel shading (top-down, tactical, survey).
    return 0.78 + ((ix * 7 + iz * 13) % 13) * 0.028;
  }

  /** Refresh only a local terrain-colour patch from authoritative field memory. */
  refreshTerrainColourRegion(
    centreX: number,
    centreZ: number,
    radius: number,
  ): void {
    const size = this.cells + 1;
    const minIx = Math.max(
      0,
      Math.floor((centreX - radius - this.origin) / TERRAIN_STEP),
    );
    const maxIx = Math.min(
      size - 1,
      Math.ceil((centreX + radius - this.origin) / TERRAIN_STEP),
    );
    const minIz = Math.max(
      0,
      Math.floor((centreZ - radius - this.origin) / TERRAIN_STEP),
    );
    const maxIz = Math.min(
      size - 1,
      Math.ceil((centreZ + radius - this.origin) / TERRAIN_STEP),
    );
    if (minIx > maxIx || minIz > maxIz) return;
    const colour = this.terrainMesh.geometry.getAttribute(
      "color",
    ) as THREE.BufferAttribute;
    for (let iz = minIz; iz <= maxIz; iz += 1) {
      for (let ix = minIx; ix <= maxIx; ix += 1) {
        const index = iz * size + ix;
        const x = this.origin + ix * TERRAIN_STEP;
        const z = this.origin + iz * TERRAIN_STEP;
        const height = this.terrainHeights[index]!;
        const east = this.terrainHeights[index + (ix < this.cells ? 1 : -1)]!;
        const north =
          this.terrainHeights[index + (iz < this.cells ? size : -size)]!;
        const slope = Math.hypot(
          (east - height) / TERRAIN_STEP,
          (north - height) / TERRAIN_STEP,
        );
        const tint = this.resolveTerrainVertexColour(
          x,
          z,
          height,
          slope,
          ix,
          iz,
          this.scratchColor,
        );
        colour.setXYZ(
          index,
          this.scratchColor.r * tint,
          this.scratchColor.g * tint,
          this.scratchColor.b * tint,
        );
      }
    }
    colour.needsUpdate = true;
  }

  /**
   * Re-sample terrain vertices inside a box.
   *
   * Ploughing writes into the height field, so the mesh has to be told. Only the
   * neighbourhood of the cut is rebuilt — without this the ground would deform
   * for physics while looking untouched, which is the worst of both.
   *
   * Normals are rebuilt with `refreshTerrainNormalsInRegion` (scoped to the
   * changed box plus one vertex ring), not `computeVertexNormals()` (whole
   * mesh). Ploughing fires on every deformation tick while a player holds the
   * plough control, and a full recompute costs ~10ms on a 102x102 grid to
   * update the ~130 triangles (0.6% of the mesh) that could have changed —
   * see ADR-0040.
   */
  refreshTerrainRegion(centreX: number, centreZ: number, radius: number): void {
    const startedAt = performance.now();
    const size = this.cells + 1;
    const minIx = Math.max(
      0,
      Math.floor((centreX - radius - this.origin) / TERRAIN_STEP),
    );
    const maxIx = Math.min(
      size - 1,
      Math.ceil((centreX + radius - this.origin) / TERRAIN_STEP),
    );
    const minIz = Math.max(
      0,
      Math.floor((centreZ - radius - this.origin) / TERRAIN_STEP),
    );
    const maxIz = Math.min(
      size - 1,
      Math.ceil((centreZ + radius - this.origin) / TERRAIN_STEP),
    );
    if (minIx > maxIx || minIz > maxIz) return;

    const position = this.terrainMesh.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;

    for (let iz = minIz; iz <= maxIz; iz += 1) {
      for (let ix = minIx; ix <= maxIx; ix += 1) {
        const index = iz * size + ix;
        const x = this.origin + ix * TERRAIN_STEP;
        const z = this.origin + iz * TERRAIN_STEP;
        const y = this.world.terrain.height(x, z);
        this.terrainHeights[index] = y;
        position.setY(index, y);
      }
    }
    position.needsUpdate = true;

    const normal = this.terrainMesh.geometry.getAttribute("normal") as
      THREE.BufferAttribute | undefined;
    if (normal === undefined || normal.count !== position.count) {
      // Defensive fallback only: buildTerrain() always creates a matching
      // normal attribute before any refreshTerrainRegion call is reachable,
      // so this path is not expected to run in the live game.
      this.terrainMesh.geometry.computeVertexNormals();
    } else {
      refreshTerrainNormalsInRegion(
        position,
        normal,
        this.cells,
        minIx,
        maxIx,
        minIz,
        maxIz,
      );
    }
    this.regionRefreshMs = performance.now() - startedAt;
  }

  /** Re-sample the whole terrain mesh. Used after a reset clears deformation. */
  rebuildTerrainHeights(): void {
    const size = this.cells + 1;
    const position = this.terrainMesh.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    this.terrainHeights = this.world.terrain.sampleHeightGrid(
      this.origin,
      this.origin,
      this.cells,
      TERRAIN_STEP,
    );
    for (let index = 0; index < size * size; index += 1) {
      position.setY(index, this.terrainHeights[index]!);
    }
    position.needsUpdate = true;
    this.terrainMesh.geometry.computeVertexNormals();
    this.refreshTerrainColourRegion(0, 0, WORLD_RADIUS + 12);
  }
}
