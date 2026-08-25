import * as THREE from "three";
import type { GameWorld } from "../gameworld";
import { generateTerrainPbrTextures } from "../pbr-materials";
import { refreshTerrainNormalsInRegion } from "../terrain-normals";
import { SURFACES, WATER_LEVEL, WORLD_RADIUS } from "../world";
import type { GameState } from "../contracts";
import {
  createInfrastructureNetworkState,
  INFRASTRUCTURE_DEFINITIONS,
  INFRASTRUCTURE_ENTITY_IDS,
  infrastructureIsOperating,
} from "../infrastructure-network";

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

  // --- Sky / water / precipitation state (unit 4b lift) ---
  water!: THREE.Mesh;
  waterMaterial!: THREE.ShaderMaterial;
  sky!: THREE.Mesh;
  rainPoints: THREE.Points | null = null;
  rainPositions: Float32Array | null = null;
  stormClouds!: THREE.Group;
  stormCloudMeshes: THREE.Mesh[] = [];

  private buildMs = 0;
  private regionRefreshMs = 0;

  constructor(
    private readonly scene: THREE.Scene,
    private readonly world: GameWorld,
  ) {}

  get mesh(): THREE.Mesh {
    return this.terrainMesh;
  }

  get terrainBuildMs(): number {
    return this.buildMs;
  }

  get terrainRegionRefreshMs(): number {
    return this.regionRefreshMs;
  }

  buildTerrain(): void {
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

  buildWater(): void {
    // Custom water shader with wave animation, foam, depth-based color, and specular highlights
    const initialInfrastructure = createInfrastructureNetworkState();
    const waterUniforms = {
      time: { value: 0 },
      waterColor: { value: new THREE.Color(SURFACES.water.color) },
      waterLevel: { value: WATER_LEVEL },
      sunDirection: { value: new THREE.Vector3(-0.6, 0.8, -0.4).normalize() },
      sunColor: { value: new THREE.Color(0xffd58a) },
      foamColor: { value: new THREE.Color(0xffffff) },
      deepColor: { value: new THREE.Color(0x0a1f2e) },
      shallowColor: { value: new THREE.Color(0x2a6b8a) },
      waveScale: { value: 1.0 },
      waveSpeed: { value: 0.8 },
      foamThreshold: { value: 0.65 },
      foamStrength: { value: 0.35 },
      specularPower: { value: 40.0 },
      specularIntensity: { value: 0.6 },
      // These inputs are presentation copies of canonical infrastructure
      // effects. The simulation still owns condition and waterline truth.
      infrastructureCenters: {
        value: INFRASTRUCTURE_ENTITY_IDS.map((id) => {
          const definition = INFRASTRUCTURE_DEFINITIONS[id];
          return new THREE.Vector2(definition.x, definition.z);
        }),
      },
      infrastructureRadii: {
        value: INFRASTRUCTURE_ENTITY_IDS.map((id) => {
          const effect = INFRASTRUCTURE_DEFINITIONS[id].effects.find(
            (candidate) => candidate.kind === "water-level-offset",
          );
          return effect?.radiusM ?? 0;
        }),
      },
      infrastructureWaterOffsets: {
        value: INFRASTRUCTURE_ENTITY_IDS.map((id) => {
          const definition = INFRASTRUCTURE_DEFINITIONS[id];
          const effect = definition.effects.find(
            (candidate) => candidate.kind === "water-level-offset",
          );
          return effect &&
            infrastructureIsOperating(
              definition,
              initialInfrastructure.entities[id],
            )
            ? effect.operatingValue
            : (effect?.dormantValue ?? 0);
        }),
      },
    };

    const waterMaterial = new THREE.ShaderMaterial({
      uniforms: waterUniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        uniform float time;
        uniform float waveScale;
        uniform float waveSpeed;

        // Gerstner wave function
        vec3 gerstnerWave(vec2 position, vec2 direction, float amplitude, float wavelength, float speed, float time) {
          float k = 2.0 * 3.14159265 / wavelength;
          float c = sqrt(9.81 / k);
          float f = k * dot(direction, position) - speed * time;
          float a = amplitude / k;

          float sinF = sin(f);
          float cosF = cos(f);

          return vec3(
            direction.x * a * sinF,
            a * cosF,
            direction.y * a * sinF
          );
        }

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Sum multiple Gerstner waves
          vec3 waveOffset = vec3(0.0);
          waveOffset += gerstnerWave(pos.xz, normalize(vec2(1.0, 0.3)), 0.15 * waveScale, 12.0, 1.2 * waveSpeed, time);
          waveOffset += gerstnerWave(pos.xz, normalize(vec2(0.7, -0.7)), 0.1 * waveScale, 8.0, 1.5 * waveSpeed, time);
          waveOffset += gerstnerWave(pos.xz, normalize(vec2(0.3, 1.0)), 0.08 * waveScale, 5.0, 1.8 * waveSpeed, time);
          waveOffset += gerstnerWave(pos.xz, normalize(vec2(-0.5, 0.8)), 0.05 * waveScale, 3.0, 2.2 * waveSpeed, time);

          pos += waveOffset;

          // Calculate normal from wave derivatives (simplified)
          vec2 eps = vec2(0.1, 0.0);
          float h0 = pos.y;
          float hx = h0;
          float hy = h0;
          
          // Approximate normal from finite differences
          vec3 normal = normalize(vec3(
            -waveOffset.x / 0.1,
            1.0,
            -waveOffset.z / 0.1
          ));

          vNormal = normalize(normalMatrix * normal);

          vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPosition.xyz;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        uniform float time;
        uniform vec3 waterColor;
        uniform float waterLevel;
        uniform vec3 sunDirection;
        uniform vec3 sunColor;
        uniform vec3 foamColor;
        uniform vec3 deepColor;
        uniform vec3 shallowColor;
        uniform float foamThreshold;
        uniform float foamStrength;
        uniform float specularPower;
        uniform float specularIntensity;
        uniform vec2 infrastructureCenters[3];
        uniform float infrastructureRadii[3];
        uniform float infrastructureWaterOffsets[3];

        // Fresnel-Schlick approximation
        float fresnelSchlick(float cosTheta, float roughness) {
          float f0 = 0.02;
          return f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);
        }

        // Value noise for foam
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);

          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));

          vec2 u = f * f * (3.0 - 2.0 * f);

          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        // Fractal Brownian Motion
        float fbm(vec2 st, float time) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 5; i++) {
            value += amplitude * noise(st);
            st *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          float drainageMask = 0.0;
          float pressureTint = 0.0;
          for (int index = 0; index < 3; index++) {
            float radius = infrastructureRadii[index];
            if (radius <= 0.0) continue;
            float distanceToMachine = distance(vWorldPosition.xz, infrastructureCenters[index]);
            float t = clamp(1.0 - distanceToMachine / radius, 0.0, 1.0);
            float influence = t * t * (3.0 - 2.0 * t);
            float offset = infrastructureWaterOffsets[index];
            if (offset < 0.0) {
              drainageMask = max(drainageMask, influence * clamp(-offset / 2.6, 0.0, 1.0));
            } else {
              pressureTint = max(pressureTint, influence * clamp(offset / 1.1, 0.0, 1.0));
            }
          }
          // The terrain remains present behind a drained basin. This is a visual
          // consequence of the simulation's local waterline, not a new terrain
          // or collision shape owned by the renderer.
          if (drainageMask > 0.72) discard;

          // Depth-based color blending
          float depth = max(0.0, waterLevel - vWorldPosition.y);
          float depthFactor = smoothstep(0.0, 8.0, depth);
          vec3 baseColor = mix(shallowColor, deepColor, depthFactor);
          baseColor = mix(baseColor, deepColor, pressureTint * 0.55);

          // Fresnel effect for surface reflection
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float cosTheta = dot(vNormal, viewDir);
          float fresnel = pow(1.0 - max(0.0, cosTheta), 4.0);

          // Foam generation using noise
          float foamNoise = fbm(vUv * 20.0 + vec2(time * 0.1, time * 0.05), time);
          float foamEdge = smoothstep(0.6, 0.8, foamNoise);
          
          // Wave crest foam (based on normal angle)
          float waveFoam = smoothstep(0.7, 0.95, vNormal.y);
          
          // Combine foam sources
          float foam = max(foamEdge, waveFoam) * 0.35;
          foam = clamp(foam, 0.0, 1.0);

          // Specular highlight from sun
          vec3 halfVector = normalize(sunDirection + viewDir);
          float spec = max(0.0, dot(vNormal, halfVector));
          float sunSpec = pow(spec, specularPower) * specularIntensity;

          // Final color composition
          vec3 color = baseColor;
          
          // Add sun specular
          color += sunColor * sunSpec * max(0.0, dot(vNormal, sunDirection));
          
          // Add foam
          color = mix(baseColor, vec3(1.0, 1.0, 1.0), foam * 0.8);
          
          // Add sun specular
          color += sunColor * sunSpec * max(0.0, dot(vNormal, sunDirection));
          
          // Fresnel reflection
          color = mix(color, vec3(0.2, 0.4, 0.6) * sunColor, fresnel * 0.3);
          
          // Final opacity based on depth and angle
          float opacity = 0.75;
          opacity *= 1.0 - fresnel * 0.3;
          opacity *= 1.0 - drainageMask * 0.88;
          
          gl_FragColor = vec4(color, opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.water = new THREE.Mesh(
      new THREE.PlaneGeometry(TERRAIN_SPAN, TERRAIN_SPAN, 128, 128),
      waterMaterial,
    );
    this.water.rotation.x = -Math.PI / 2;
    this.water.position.y = WATER_LEVEL;
    this.water.name = "water";
    this.scene.add(this.water);

    this.waterMaterial = waterMaterial;
  }

  /**
   * Presentation consumes network-owned state once per frame. The shader has
   * the same authored centres/radii as the effect resolver, but cannot mutate
   * an entity or decide whether a machine is operating.
   */
  updateInfrastructureWater(state: GameState): void {
    const uniforms = this.waterMaterial.uniforms as {
      infrastructureCenters: { value: THREE.Vector2[] };
      infrastructureRadii: { value: number[] };
      infrastructureWaterOffsets: { value: number[] };
    };
    for (let index = 0; index < INFRASTRUCTURE_ENTITY_IDS.length; index += 1) {
      const id = INFRASTRUCTURE_ENTITY_IDS[index]!;
      const definition = INFRASTRUCTURE_DEFINITIONS[id];
      const effect = definition.effects.find(
        (candidate) => candidate.kind === "water-level-offset",
      );
      const centre = uniforms.infrastructureCenters.value[index]!;
      centre.set(definition.x, definition.z);
      uniforms.infrastructureRadii.value[index] = effect?.radiusM ?? 0;
      uniforms.infrastructureWaterOffsets.value[index] =
        effect &&
        infrastructureIsOperating(definition, state.infrastructure.entities[id])
          ? effect.operatingValue
          : (effect?.dormantValue ?? 0);
    }
  }

  /**
   * Build the atmospheric gradient sky dome.
   *
   * Features a smooth Rayleigh/Mie atmospheric zenith-to-horizon gradient with
   * physical sun optical disc and forward scattering halo.
   */
  buildSky(): void {
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x3a78a6) },
        bottomColor: { value: new THREE.Color(0xcae2d8) },
        sunPosition: { value: new THREE.Vector3(-120, 190, -70) },
        sunColor: { value: new THREE.Color(0xffedd0) },
        exponent: { value: 0.55 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 sunPosition;
        uniform vec3 sunColor;
        uniform float exponent;
        varying vec3 vWorldPosition;

        void main() {
          vec3 h = normalize(vWorldPosition);
          float p = max(0.0, h.y);
          vec3 sky = mix(bottomColor, topColor, pow(p, exponent));
          vec3 sunDir = normalize(sunPosition);
          float sunCos = max(0.0, dot(h, sunDir));
          float sunDisc = smoothstep(0.998, 0.9996, sunCos);
          float sunGlow = pow(sunCos, 6.0) * 0.45;
          sky += sunColor * (sunDisc * 2.5 + sunGlow);
          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
    });

    this.sky = new THREE.Mesh(
      new THREE.SphereGeometry(860, 24, 16),
      skyMaterial,
    );
    this.sky.name = "sky";
    this.sky.frustumCulled = false;
    this.scene.add(this.sky);
  }

  /**
   * The sky, as geometry rather than a clear colour.
   *
   * `scene.background` as a `THREE.Color` is written by a buffer clear, which does
   * **not** pass through tone mapping or the sRGB output encode. Fogged geometry
   * does. The result was a hard dark band around the whole horizon in broad
   * daylight: distant terrain resolved to a correctly-encoded light fog colour while
   * the sky behind it stayed dark and linear.
   *
   * An inside-out sphere with a tone-mapped basic material travels the same path as
   * everything else, so the horizon and the sky are guaranteed to agree by
   * construction instead of by matching two numbers through two different pipelines.
   * `fog: false` keeps the dome itself from being fogged toward its own colour, and
   * `depthWrite: false` keeps it from occluding anything.
   */
  buildStars(): void {
    const positions: number[] = [];
    for (let index = 0; index < 260; index += 1) {
      const angle = index * 2.399963;
      const radius = 300 + ((index * 37) % 200);
      positions.push(
        Math.sin(angle) * radius,
        90 + ((index * 53) % 160),
        Math.cos(angle) * radius,
      );
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    const stars = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0xdbeeff,
        size: 1.4,
        transparent: true,
        opacity: 0.85,
      }),
    );
    stars.name = "night-stars";
    this.scene.add(stars);
  }

  /**
   * Build a volume of falling rain streaks around the rig.
   *
   * Each particle holds a fixed world-space direction (downward streaks) with a
   * small authored horizontal lean so rain reads as falling rather than as a
   * static haze. The whole cloud is re-centred on the active rig every frame by
   * `render()`, so the precipitation follows the camera's frame of reference
   * without the player needing to out-drive it.
   *
   * The cloud is invisible until `setWeather` raises `weatherTargetRain`, and
   * `currentRain` is eased so handoff from clear to rain never pops.
   */
  buildRain(): void {
    const count = 420;
    const positions = new Float32Array(count * 3);
    const lean = 0.55;
    for (let index = 0; index < count; index += 1) {
      // Deterministic spread across a ~60 m x 40 m box centred on the origin;
      // the per-instance position is re-based onto the active rig each frame.
      const px = ((index * 37) % 61) - 30;
      const py = ((index * 53) % 41) - 20;
      const pz = ((index * 71) % 61) - 30;
      positions[index * 3] = px;
      positions[index * 3 + 1] = py;
      // A downward-leaning streak instead of a vertical drop: rain blown by the
      // wind reads as weather with direction, matching `windVector` on the state.
      positions[index * 3 + 2] = pz + lean;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    const rain = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0x8fb2c8,
        size: 0.09,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    rain.name = "rain";
    rain.frustumCulled = false;
    this.rainPositions = positions;
    this.rainPoints = rain;
    this.scene.add(rain);
  }

  buildStormClouds(): void {
    this.stormClouds = new THREE.Group();
    this.stormClouds.name = "storm-clouds";

    // A cluster of dark, flat cloud volumes positioned on the horizon near
    // Long Furrow. They are always present but start nearly invisible; as the
    // weather clock approaches storm, they darken and thicken so the player
    // sees the threat building from across the valley.
    const LONG_FURROW_X = 18;
    const LONG_FURROW_Z = -46;
    const cloudCount = 7;
    for (let i = 0; i < cloudCount; i++) {
      const angle = (i / cloudCount) * Math.PI * 2;
      const spread = 28 + (i % 3) * 14;
      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(18 + (i % 3) * 8, 8, 5),
        new THREE.MeshBasicMaterial({
          color: 0x2a2a2e,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      cloud.position.set(
        LONG_FURROW_X + Math.cos(angle) * spread,
        52 + (i % 2) * 12,
        LONG_FURROW_Z + Math.sin(angle) * spread,
      );
      cloud.scale.set(1, 0.25, 1);
      cloud.userData.baseOpacity = 0.08 + (i % 3) * 0.04;
      cloud.userData.phase = i * 0.7;
      this.stormCloudMeshes.push(cloud);
      this.stormClouds.add(cloud);
    }
    this.scene.add(this.stormClouds);
  }

  updateStormClouds(
    weatherPhase: string,
    rainIntensity: number,
    elapsedMs: number,
  ): void {
    // Storm clouds darken as the weather progresses: clear = nearly invisible,
    // overcast = faint shadow, rain = dark, storm = heavy.
    const targetOpacity =
      weatherPhase === "storm"
        ? 0.72
        : weatherPhase === "rain"
          ? 0.45
          : weatherPhase === "overcast"
            ? 0.18
            : 0.06;

    // Rain intensity provides a smooth blend within each phase.
    const intensityBlend = rainIntensity * 0.15;

    for (const cloud of this.stormCloudMeshes) {
      const mat = cloud.material as THREE.MeshBasicMaterial;
      const base = Number(cloud.userData.baseOpacity ?? 0.1);
      const phase = Number(cloud.userData.phase ?? 0);
      const drift = Math.sin(elapsedMs * 0.00008 + phase) * 0.03;
      mat.opacity = Math.min(
        1,
        (targetOpacity + intensityBlend) * base * 8 + drift,
      );
      // Slow lateral drift so the mass feels alive.
      cloud.position.x += Math.sin(elapsedMs * 0.00003 + phase) * 0.004;
    }
  }

  /** Phase palette application for sky dome colours (fragment of updatePhase). */
  setSkyPhaseColors(top: number, bottom: number, sun: number): void {
    const skyMat = this.sky.material as THREE.ShaderMaterial;
    const skyUniforms = skyMat.uniforms as
      Record<string, { value: THREE.Color }> | undefined;
    if (skyUniforms) {
      skyUniforms.topColor?.value.setHex(top);
      skyUniforms.bottomColor?.value.setHex(bottom);
      skyUniforms.sunColor?.value.setHex(sun);
    }
  }

  /** Phase palette application for water colours (fragment of updatePhase). */
  setWaterPalette(
    waterColor: number,
    deepColor: number,
    shallowColor: number,
  ): void {
    const waterUniforms = this.waterMaterial.uniforms as {
      waterColor: { value: THREE.Color };
      deepColor: { value: THREE.Color };
      shallowColor: { value: THREE.Color };
    };
    waterUniforms.waterColor.value.setHex(waterColor);
    waterUniforms.deepColor.value.setHex(deepColor);
    waterUniforms.shallowColor.value.setHex(shallowColor);
  }

  setStarsVisible(visible: boolean): void {
    const stars = this.scene.getObjectByName("night-stars");
    if (stars) stars.visible = visible;
  }

  /**
   * Rain-cloud mechanics eased by the renderer's weather state machine
   * (verbatim fragment of updateWeather). Fog easing stays renderer-side.
   */
  updateRain(
    rigX: number,
    rigZ: number,
    delta: number,
    currentRain: number,
  ): void {
    const rain = this.rainPoints;
    const rainPositions = this.rainPositions;
    if (!rain || !rainPositions) return;
    const material = rain.material as THREE.PointsMaterial;
    material.opacity = currentRain * 0.5;
    if (currentRain <= 0.01) {
      if (rain.visible) rain.visible = false;
      return;
    }
    if (!rain.visible) rain.visible = true;

    // Re-anchor the cloud on the rig and drift the streaks downward so the
    // precipitation visibly falls rather than hanging in place.
    rain.position.set(rigX, 0, rigZ);
    const fallStep = 4.2 * delta;
    const positions = rainPositions;
    for (let index = 0; index < positions.length; index += 3) {
      positions[index + 1]! -= fallStep;
      // Never let a streak fall through the ground plane; wrap it to the top
      // of the cloud so the density in view stays constant.
      if (positions[index + 1]! < -20) {
        positions[index + 1]! += 40;
      }
    }
    const attribute = rain.geometry.getAttribute("position");
    attribute.needsUpdate = true;
  }

  positionSkyAt(position: THREE.Vector3): void {
    this.sky.position.copy(position);
  }

  rainVisible(): boolean {
    return this.rainPoints?.visible ?? false;
  }

  rainOpacity(): number {
    const material = this.rainPoints?.material as
      THREE.PointsMaterial | undefined;
    return material ? Number(material.opacity.toFixed(3)) : 0;
  }

  disposeRain(): void {
    if (this.rainPoints) {
      this.rainPoints.geometry.dispose();
      (this.rainPoints.material as THREE.Material).dispose();
    }
  }
}
