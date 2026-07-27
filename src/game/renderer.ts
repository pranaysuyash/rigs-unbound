/**
 * The view. Reads the world substrate; owns no world truth of its own.
 *
 * Before ADR-0007 this module scattered 42 decorative props with a private RNG,
 * which the kernel could neither collide with nor reason about. It now renders
 * exactly what `TerrainField`, `ObstacleField`, and `ExplorationField` say is
 * there, so what you see is what you can hit.
 *
 * ## Draw-call discipline
 *
 * Everything repeated is instanced: trees, rocks, felled trunks, salvage, and
 * furrow decals are one draw call each regardless of count. The previous build
 * added one mesh per furrow, which meant up to 640 draw calls of world memory.
 *
 * ## Coordinate contract
 *
 * Local **+Z is the front** of a rig (see the header of `physics.ts`). The
 * previous geometry violated this: the tractor's grille, hood, and headlights sat
 * at local −Z, the same end as the plough, so it drove cab-first with its lights
 * pointing backwards. Both rigs are rebuilt front-forward here.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import {
  CARGO_DELIVERY,
  CARGO_PICKUP,
  BUGGY_RAMP,
  type CameraMode,
  effectiveProfile,
  type GameState,
  MAX_FURROWS,
  type ModuleId,
  RIG_IDS,
  type RigId,
  type WorldPhase,
} from "./contracts";
import {
  felledTrunkLength,
  rockVisualHalfHeight,
  treeCrownCenterY,
  treeCrownRadius,
  treeTrunkHeight,
  type Obstacle,
} from "./collision";
import { chaseViewportPolicy, RIG_HOOD_CAMERA_MOUNTS } from "./camera";
import type { SalvageNode } from "./exploration";
import { deriveRigFeedback, type RigFeedbackFrame } from "./feedback";
import type { GameWorld } from "./gameworld";
import type { RuntimeBridgeSpec } from "./runtime-assets";
import type { CameraObstructionHit } from "./scene-query";
import {
  classifyVisibility,
  createPropVisibilityMetrics,
  DEFAULT_VISIBILITY_PROFILE,
  recordVisibilityCandidate,
  type PropVisibilityMetrics,
  type VisibilityProfileId,
  visibilityProfile,
} from "./visibility";
import {
  SURFACES,
  WATER_LEVEL,
  WORLD_RADIUS,
  WORLD_SITES,
  WORLD_STRUCTURE_PARTS,
  type WorldStructurePart,
} from "./world";

const COLORS = {
  rust: 0xb94f32,
  bone: 0xead8b8,
  gold: 0xd9aa52,
  cyan: 0x6bc9c4,
  tire: 0x242421,
  night: 0x13283c,
} as const;

/** Terrain mesh sample spacing, in metres. */
const TERRAIN_STEP = 5.2;

/** Span of the terrain mesh, in metres. Slightly wider than the world disc. */
const TERRAIN_SPAN = (WORLD_RADIUS + 12) * 2;

/** Rig travel that triggers an obstacle/salvage instance rebuild, in metres. */
const PROP_REBUILD_DISTANCE = 34;

const MAX_TREE_INSTANCES = 900;
const MAX_ROCK_INSTANCES = 700;
const MAX_FELLED_INSTANCES = 220;
const MAX_NODE_INSTANCES = 260;
const MAX_DUST = 260;

interface RigParts {
  root: THREE.Group;
  /** Named local-space mount authored on the rendered rig silhouette. */
  hoodCameraSocket: THREE.Object3D;
  /** Wheel spin pivots in physics order: front-left, front-right, rear-L, rear-R. */
  wheels: THREE.Group[];
  /** Steering pivots in the same order. Hover rigs expose an empty list. */
  steeringPivots: THREE.Group[];
  wheelRestY: number[];
  /** Module-owned meshes, toggled from canonical fitted module ids each frame. */
  moduleVisuals: Partial<Record<ModuleId, THREE.Object3D[]>>;
  ploughPivot: THREE.Group | null;
  headlights: THREE.SpotLight;
  /** A real visible part at the nose, used to verify the visual/physics axis. */
  frontMarker: THREE.Object3D;
  /** A real visible part at the rear, used to verify the visual/physics axis. */
  rearMarker: THREE.Object3D;
  /** State Shell mesh representing surrounding integrity, aura, and hit ripples. */
  stateShell?: THREE.Mesh;
  stateShellMaterial?: THREE.ShaderMaterial;
}

export interface RigOrientationEvidence {
  rigId: RigId;
  heading: number;
  frontAlongHeadingMetres: number;
  visualFrontIsForward: boolean;
}

export interface RigPerceptionEvidence {
  rigId: RigId;
  reducedMotion: boolean;
  steeringAngle: number;
  bodyRollOffset: number;
  bodyPitchOffset: number;
  speedFovBoost: number;
  cameraFocusOffset: number | null;
  expectedFocusOffset: number;
  cameraFocusContractMet: boolean;
  visibleModules: ModuleId[];
}

export interface CameraResolutionEvidence {
  rigId: RigId;
  mode: CameraMode;
  obstructionSource: CameraObstructionHit["source"] | null;
  obstructionId: string | null;
  idealDistance: number;
  resolvedDistance: number;
  minimumReadableDistance: number;
  /**
   * True when the final camera is clear of world/rig geometry and preserves the
   * viewport-specific minimum composition distance.
   */
  readableComposition: boolean;
  /** Signed camera displacement along rig-forward; negative means behind. */
  forwardOffset: number;
  /** True when the resolved camera remains on the rear side of the rig. */
  behindRig: boolean;
  pathClear: boolean;
  selfIntersecting: boolean;
  selfIntersectionPart: string | null;
}

export interface RuntimeAssetBridgeEvidence {
  assetId: string;
  runtimePath: string;
  status: "loading" | "loaded" | "fallback" | "error";
  fallbackActive: boolean;
  loadedNodeCount: number;
  errorMessage: string | null;
}

export type RendererBackend = "webgl" | "webgpu";
export type RendererBackendRequest = "auto" | "webgl" | "webgpu";
export type RendererPolicy = "stable" | "canary" | "off";

export interface RendererBackendPolicyConfig {
  request: RendererBackendRequest;
  policy: RendererPolicy;
  policyAllowsAutoWebGPU: boolean;
  policyReason: string;
}

type FXAAUniforms = {
  resolution: {
    value: {
      set: (x: number, y: number) => void;
    };
  };
};

function material(
  color: number,
  roughness = 0.76,
  metalness = 0.08,
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
  });
}

function box(
  width: number,
  height: number,
  depth: number,
  color: number,
): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material(color),
  );
}

/** A signal lamp that has been visited: the housing, unlit. */
const SIGNAL_LAMP_DARK = 0x4a3a24;

function cylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  segments: number,
  color: number,
): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material(color),
  );
}

function hoodCameraSocket(rigId: RigId): THREE.Object3D {
  const mount = RIG_HOOD_CAMERA_MOUNTS[rigId];
  const socket = new THREE.Object3D();
  socket.name = `camera:hood:${rigId}`;
  socket.position.set(mount.localX, mount.localY, mount.localZ);
  return socket;
}

export class GameRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(52, 1, 0.25, 900);
  private readonly gltfLoader = new GLTFLoader();
  private readonly sun = new THREE.DirectionalLight(0xffdeb0, 2.4);
    private readonly hemisphere = new THREE.HemisphereLight(
      0xb8ddff,
      0x5d422d,
      1.6,
    );

    private readonly rigs = new Map<RigId, RigParts>();
    private readonly cargo: THREE.Group;
    private readonly hitchLine: THREE.Line;

    private terrainMesh!: THREE.Mesh;
    private terrainHeights!: Float32Array;
    private readonly terrainCells = Math.round(TERRAIN_SPAN / TERRAIN_STEP);
    private readonly terrainOrigin = -TERRAIN_SPAN / 2;

    private treeTrunks!: THREE.InstancedMesh;
    private treeCrowns!: THREE.InstancedMesh;
    private treeBillboards!: THREE.InstancedMesh;
    private treeBillboardCount = 0;
    private rocks!: THREE.InstancedMesh;
    private rockBillboards!: THREE.InstancedMesh;
    private rockBillboardCount = 0;
    private felledTrunks!: THREE.InstancedMesh;
    private salvageNodes!: THREE.InstancedMesh;
    private furrowDecals!: THREE.InstancedMesh;
    private water!: THREE.Mesh;
    private waterMaterial!: THREE.ShaderMaterial;
    private sky!: THREE.Mesh;

    private dust!: THREE.Points;
    private readonly dustPositions = new Float32Array(MAX_DUST * 3);
    private readonly dustVelocities = new Float32Array(MAX_DUST * 3);
    private readonly dustLife = new Float32Array(MAX_DUST);
    private dustCursor = 0;

    private readonly dummy = new THREE.Object3D();
  private propAnchorX = Number.POSITIVE_INFINITY;
  private propAnchorZ = Number.POSITIVE_INFINITY;
  private renderedFurrows = 0;
  private lastDeformCount = 0;
  private readonly furrowCutColor = new THREE.Color(0x3a2c1e);
  private readonly furrowFillColor = new THREE.Color(0x8a7a5a);
  private readonly tempColor = new THREE.Color();
    private currentPhase: WorldPhase | null = null;
    private lastFrameTime = performance.now();
    private shake = 0;
    private cameraInitialised = false;
    private cameraRigId: RigId | null = null;
    private lastCameraMode: CameraMode | null = null;
    private lastCameraFocus: THREE.Vector3 | null = null;
    private cameraResolution: CameraResolutionEvidence | null = null;
    private readonly runtimeBridgeEvidence = new Map<
      string,
      RuntimeAssetBridgeEvidence
    >();
    private activeVisibilityProfileId: VisibilityProfileId =
      DEFAULT_VISIBILITY_PROFILE;
    private propVisibility: PropVisibilityMetrics = createPropVisibilityMetrics();
    private readonly reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    private readonly feedbackFrames = new Map<RigId, RigFeedbackFrame>();
    /** One-frame presentation pulses sourced from authoritative condition loss. */
    private readonly pendingConditionImpacts = new Set<RigId>();
    private lastCameraFocusY: number | null = null;

    /** Boot cost of terrain mesh generation, in ms. Surfaced through metrics(). */
    terrainBuildMs = 0;

  private readonly backendPolicy: RendererBackendPolicyConfig;
  private readonly rendererRequestedBackend: RendererBackendRequest;
  private rendererBackend: RendererBackend = "webgl";
  private rendererBackendFallback = false;
  private rendererBackendReason = "WebGL fallback/default policy";

    private composer!: EffectComposer;
    private bloomPass!: UnrealBloomPass;
    private fxaaPass!: ShaderPass;
  // quality-tier fields to the renderer: `RuntimeProfileController` measures the
  // frame window and the first controllable frame, and drives this class through
  // `setVisibilityProfile` (see `runtime-profile-policy.ts` and the call site in
  // `main.ts`). A second degrade path in the renderer has twice been added here and
  // twice been dead on arrival — never read, never written — which is worse than no
  // path at all, because it reads as a capability the renderer does not have.

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly world: GameWorld,
    private readonly runtimeBridgeSpecs: readonly RuntimeBridgeSpec[] = [],
    backendPolicy: RendererBackendPolicyConfig = {
      request: "auto",
      policy: "stable",
      policyAllowsAutoWebGPU: false,
      policyReason: "rendererPolicy=stable passed",
    },
  ) {
    this.backendPolicy = backendPolicy;
    this.rendererRequestedBackend = this.backendPolicy.request;

    const selectedBackend = this.createRendererBackend();
    this.renderer = selectedBackend.renderer;
    this.rendererBackend = selectedBackend.backend;
    this.rendererBackendFallback = selectedBackend.fallback;
    this.rendererBackendReason = selectedBackend.reason;

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    // Blob shadows rather than shadow maps: a shadow-map allocation warning was
    // observed in Chrome during lifecycle testing, and this is also the cheaper
    // first-frame posture on low-power devices. Revisit when measured value exists.
    this.renderer.shadowMap.enabled = false;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;

    // Initialize post-processing composer
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    
    // Bloom pass for emissive materials and bright highlights
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    this.composer.addPass(this.bloomPass);

    // FXAA anti-aliasing (cheaper than MSAA, works with WebGPU)
    const fxaaPass = new ShaderPass(FXAAShader);
    const fxaaUniforms = fxaaPass.material.uniforms as FXAAUniforms;
    fxaaUniforms.resolution.value.set(
      1 / (window.innerWidth * this.renderer.getPixelRatio()),
      1 / (window.innerHeight * this.renderer.getPixelRatio()),
    );
    this.composer.addPass(fxaaPass);
    this.fxaaPass = fxaaPass;

    this.sun.position.set(-120, 190, -70);
    this.scene.add(this.sun, this.hemisphere);

    this.buildSky();
    this.buildTerrain();
    this.buildWater();
    this.buildInstancedProps();
    this.buildDust();
    this.buildSites();
    this.buildRuntimeBridgeAssets();
    this.buildStars();

    const tractor = this.createTractor();
    const buggy = this.createBuggy();
    const skimmer = this.createSkimmer();
    this.rigs.set("utility-tractor", tractor);
    this.rigs.set("toy-buggy", buggy);
    this.rigs.set("marsh-skimmer", skimmer);
    this.scene.add(tractor.root, buggy.root, skimmer.root);

    this.cargo = this.createCargo();
    this.hitchLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
      new THREE.LineBasicMaterial({ color: COLORS.gold }),
    );
    this.hitchLine.visible = false;
    this.scene.add(this.cargo, this.hitchLine);

    window.addEventListener("resize", this.resize);
    this.resize();
  }

  private createRendererBackend(): {
    backend: RendererBackend;
    renderer: THREE.WebGLRenderer;
    reason: string;
    fallback: boolean;
  } {
    const request = this.backendPolicy.request;
    if (request === "webgl") {
      return {
        backend: "webgl",
        renderer: this.createWebGLRenderer("renderer request=webgl"),
        reason: "renderer request=webgl",
        fallback: false,
      };
    }

    if (request === "webgpu") {
      return {
        backend: "webgl",
        renderer: this.createWebGLRenderer(
          "renderer request=webgpu is not available in this build",
        ),
        reason: "renderer request=webgpu unavailable; using webgl",
        fallback: true,
      };
    }

    const policyAllowsAutoWebGPU =
      this.backendPolicy.policy === "canary" ||
      (this.backendPolicy.policy === "stable" &&
        this.backendPolicy.policyAllowsAutoWebGPU);

    return {
      backend: "webgl",
      renderer: this.createWebGLRenderer(
        policyAllowsAutoWebGPU
          ? "renderer auto policy kept webgl for composer compatibility"
          : "policy gate block",
      ),
      reason: policyAllowsAutoWebGPU
        ? `renderer=auto retained webgl for composer compatibility (${this.backendPolicy.policy})`
        : `rendererPolicy=${this.backendPolicy.policy} blocked auto webgpu (${this.backendPolicy.policyReason})`,
      fallback: this.backendPolicy.request === "auto" && !policyAllowsAutoWebGPU,
    };
  }

  private createWebGLRenderer(reasonLabel: string): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
    });

    if (this.rendererBackendReason === "WebGL fallback/default policy") {
      this.rendererBackendReason = reasonLabel;
    }
    return renderer;
  }

  private readonly resize = (): void => {
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    this.renderer.setSize(width, height, false);
    this.composer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Update FXAA resolution
    if (this.fxaaPass) {
      const fxaaUniforms = this.fxaaPass.material.uniforms as FXAAUniforms;
      fxaaUniforms.resolution.value.set(
        1 / (width * this.renderer.getPixelRatio()),
        1 / (height * this.renderer.getPixelRatio()),
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Terrain
  // ---------------------------------------------------------------------------

  /**
   * Build the terrain mesh from the height field.
   *
   * Heights come from one bulk `sampleHeightGrid` call and normals are derived
   * from grid neighbours, which costs one `height()` per vertex instead of the
   * five a per-vertex `sample()` would need. Vertex colours carry the surface
   * material, so the world is readable with zero texture assets and zero asset
   * provenance obligations.
   */
  private buildTerrain(): void {
    const startedAt = performance.now();
    const cells = this.terrainCells;
    const size = cells + 1;

    this.terrainHeights = this.world.terrain.sampleHeightGrid(
      this.terrainOrigin,
      this.terrainOrigin,
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
        const x = this.terrainOrigin + ix * TERRAIN_STEP;
        const z = this.terrainOrigin + iz * TERRAIN_STEP;
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

        const surface = this.world.terrain.surfaceFor(x, z, y, slope);
        colour.setHex(surface.color);
        // A stable per-vertex tint keeps large single-surface regions from reading
        // as flat paint without needing a texture.
        const tint = 0.9 + ((ix * 7 + iz * 13) % 11) * 0.018;
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

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    this.terrainMesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.95,
        metalness: 0.02,
      }),
    );
    this.terrainMesh.name = "terrain";
    this.scene.add(this.terrainMesh);
    this.terrainBuildMs = performance.now() - startedAt;
  }

  /**
   * Re-sample terrain vertices inside a box.
   *
   * Ploughing writes into the height field, so the mesh has to be told. Only the
   * neighbourhood of the cut is rebuilt — without this the ground would deform
   * for physics while looking untouched, which is the worst of both.
   */
  private refreshTerrainRegion(
    centreX: number,
    centreZ: number,
    radius: number,
  ): void {
    const size = this.terrainCells + 1;
    const minIx = Math.max(
      0,
      Math.floor((centreX - radius - this.terrainOrigin) / TERRAIN_STEP),
    );
    const maxIx = Math.min(
      size - 1,
      Math.ceil((centreX + radius - this.terrainOrigin) / TERRAIN_STEP),
    );
    const minIz = Math.max(
      0,
      Math.floor((centreZ - radius - this.terrainOrigin) / TERRAIN_STEP),
    );
    const maxIz = Math.min(
      size - 1,
      Math.ceil((centreZ + radius - this.terrainOrigin) / TERRAIN_STEP),
    );
    if (minIx > maxIx || minIz > maxIz) return;

    const position = this.terrainMesh.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;

    for (let iz = minIz; iz <= maxIz; iz += 1) {
      for (let ix = minIx; ix <= maxIx; ix += 1) {
        const index = iz * size + ix;
        const x = this.terrainOrigin + ix * TERRAIN_STEP;
        const z = this.terrainOrigin + iz * TERRAIN_STEP;
        const y = this.world.terrain.height(x, z);
        this.terrainHeights[index] = y;
        position.setY(index, y);
      }
    }
    position.needsUpdate = true;
    this.terrainMesh.geometry.computeVertexNormals();
  }

  private buildWater(): void {
    // Custom water shader with wave animation, foam, depth-based color, and specular highlights
    const waterUniforms = {
      time: { value: 0 },
      waterColor: { value: new THREE.Color(SURFACES.water.color) },
      waterLevel: { value: WATER_LEVEL },
      sunDirection: { value: new THREE.Vector3(-0.6, 0.8, -0.4).normalize() },
      sunColor: { value: new THREE.Color(0xffd58a) },
      foamColor: { value: new THREE.Color(0xffffff) },
      deepColor: { value: new THREE.Color(0x0a1f2e) },
      shallowColor: { value: new THREE.Color(0x2a6b8a) },
      cameraPosition: { value: new THREE.Vector3() },
      waveScale: { value: 1.0 },
      waveSpeed: { value: 0.8 },
      foamThreshold: { value: 0.65 },
      foamStrength: { value: 0.35 },
      specularPower: { value: 40.0 },
      specularIntensity: { value: 0.6 },
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
          // Depth-based color blending
          float depth = max(0.0, waterLevel - vWorldPosition.y);
          float depthFactor = smoothstep(0.0, 8.0, depth);
          vec3 baseColor = mix(shallowColor, deepColor, depthFactor);

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

  // ---------------------------------------------------------------------------
  // Instanced props
  // ---------------------------------------------------------------------------

  private buildInstancedProps(): void {
    this.treeTrunks = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.24, 0.4, 1, 4),
      material(0x5f432f),
      MAX_TREE_INSTANCES,
    );
    this.treeCrowns = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 1),
      material(0x54682f),
      MAX_TREE_INSTANCES,
    );
    this.rocks = new THREE.InstancedMesh(
      new THREE.OctahedronGeometry(1, 0),
      material(0x7d746a),
      MAX_ROCK_INSTANCES,
    );
    this.treeBillboards = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1),
      material(0x5f7d4d),
      MAX_TREE_INSTANCES,
    );
    this.rockBillboards = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1),
      material(0x7d746a),
      MAX_ROCK_INSTANCES,
    );
    this.felledTrunks = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.3, 0.34, 1, 6),
      material(0x6a5038),
      MAX_FELLED_INSTANCES,
    );
    this.salvageNodes = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      material(0x9a5c39, 0.7, 0.25),
      MAX_NODE_INSTANCES,
    );

    this.furrowDecals = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1.05, 1.5),
      material(0xffffff, 1),
      MAX_FURROWS,
    );
    this.furrowDecals.count = 0;
    // Pre-fill all instances with the cut-furrow colour so the initial state
    // looks correct before any mode-specific calls happen.
    this.furrowCutColor.set(0x3a2c1e);
    this.furrowFillColor.set(0x8a7a5a);
    for (let i = 0; i < MAX_FURROWS; i++) {
      this.furrowDecals.setColorAt(i, this.furrowCutColor);
    }
    if (this.furrowDecals.instanceColor)
      this.furrowDecals.instanceColor.needsUpdate = true;

    /*
     * These dynamic clouds are rebuilt around the active rig. Geometry-only
     * bounds do not include the per-instance transforms, so they can cull
     * visible scenery. Keep culling disabled until refreshProps computes a
     * truthful aggregate instance bound after each rebuild.
     */
    for (const mesh of [
      this.treeTrunks,
      this.treeCrowns,
      this.rocks,
      this.treeBillboards,
      this.rockBillboards,
      this.felledTrunks,
      this.salvageNodes,
      this.furrowDecals,
    ]) {
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;
      this.scene.add(mesh);
    }
  }

  /**
   * Rebuild prop instances around the rig.
   *
   * Called only when the rig has travelled `PROP_REBUILD_DISTANCE`, because
   * regenerating the obstacle field is a hash-and-sample loop and not something to
   * run per frame.
   */
  private refreshProps(state: GameState): void {
    const rig = state.rigs[state.activeRigId];
    const profile = visibilityProfile(this.activeVisibilityProfileId);
    const propRadius = profile.farMeters;
    const obstacles = this.world.obstacles.near(rig.x, rig.z, propRadius);
    const nodes = this.world.exploration.nodesNear(
      rig.x,
      rig.z,
      propRadius,
      this.world.collectedNodes,
    );
    const visibility = createPropVisibilityMetrics(profile);
    const tierFor = (x: number, z: number) => {
      const tier = classifyVisibility(
        Math.hypot(x - rig.x, z - rig.z),
        profile,
      );
      recordVisibilityCandidate(visibility, tier);
      return tier;
    };

    // Reset billboard counters for this rebuild
    this.treeBillboardCount = 0;
    this.rockBillboardCount = 0;

    let trees = 0;
    let rocks = 0;
    let felled = 0;

    for (const obstacle of obstacles) {
      if (tierFor(obstacle.x, obstacle.z) === "culled") continue;
      const down = this.world.felledObstacles.has(obstacle.id);
      if (obstacle.kind === "tree" && !down) {
        if (trees >= MAX_TREE_INSTANCES) {
          visibility.capacityLimited += 1;
          continue;
        }
        this.placeTree(obstacle, trees);
        trees += 1;
      } else if (obstacle.kind === "tree") {
        if (felled >= MAX_FELLED_INSTANCES) {
          visibility.capacityLimited += 1;
          continue;
        }
        this.placeFelled(obstacle, felled);
        felled += 1;
      } else {
        if (rocks >= MAX_ROCK_INSTANCES) {
          visibility.capacityLimited += 1;
          continue;
        }
        this.placeRock(obstacle, rocks);
        rocks += 1;
      }
      visibility.submitted += 1;
    }

    let nodeCount = 0;
    for (const node of nodes) {
      if (tierFor(node.x, node.z) === "culled") continue;
      if (nodeCount >= MAX_NODE_INSTANCES) {
        visibility.capacityLimited += 1;
        continue;
      }
      this.placeNode(node, nodeCount);
      nodeCount += 1;
      visibility.submitted += 1;
    }

    this.treeTrunks.count = trees;
    this.treeCrowns.count = trees;
    this.rocks.count = rocks;
    if (this.treeBillboards !== undefined) {
      this.treeBillboards.count = this.treeBillboardCount;
    }
    if (this.rockBillboards !== undefined) {
      this.rockBillboards.count = this.rockBillboardCount;
    }
    this.felledTrunks.count = felled;
    this.salvageNodes.count = nodeCount;

    this.treeTrunks.instanceMatrix.needsUpdate = true;
    this.treeCrowns.instanceMatrix.needsUpdate = true;
    this.rocks.instanceMatrix.needsUpdate = true;
    if (this.treeBillboards !== undefined) {
      this.treeBillboards.instanceMatrix.needsUpdate = true;
    }
    if (this.rockBillboards !== undefined) {
      this.rockBillboards.instanceMatrix.needsUpdate = true;
    }
    this.felledTrunks.instanceMatrix.needsUpdate = true;
    this.salvageNodes.instanceMatrix.needsUpdate = true;

    this.propAnchorX = rig.x;
    this.propAnchorZ = rig.z;
    this.propVisibility = visibility;
  }

  private placeTree(obstacle: Obstacle, index: number): void {
    const trunkHeight = treeTrunkHeight(obstacle);
    // Re-ground on the live height field rather than the cached groundY so trees
    // stay correctly positioned after plough deformation changes the terrain.
    const groundY = this.world.terrain.height(obstacle.x, obstacle.z);
    this.dummy.position.set(
      obstacle.x,
      groundY + trunkHeight * 0.5,
      obstacle.z,
    );
    this.dummy.rotation.set(0, obstacle.variation * Math.PI, 0);
    this.dummy.scale.set(
      obstacle.radius * 1.6,
      trunkHeight,
      obstacle.radius * 1.6,
    );
    this.dummy.updateMatrix();
    this.treeTrunks.setMatrixAt(index, this.dummy.matrix);

    const crownRadius = treeCrownRadius(obstacle);
    this.dummy.position.set(obstacle.x, treeCrownCenterY(obstacle), obstacle.z);
    this.dummy.rotation.set(0, obstacle.variation * 4.1, 0);
    this.dummy.scale.set(crownRadius, crownRadius * 1.3, crownRadius);
    this.dummy.updateMatrix();
    this.treeCrowns.setMatrixAt(index, this.dummy.matrix);

    // Also place billboard for far-tier LOD
    const tier = classifyVisibility(
      Math.hypot(obstacle.x - this.propAnchorX, obstacle.z - this.propAnchorZ),
      visibilityProfile(this.activeVisibilityProfileId),
    );
    if (
      tier === "far" &&
      this.treeBillboards !== undefined &&
      this.treeBillboardCount < MAX_TREE_INSTANCES
    ) {
      this.dummy.position.set(
        obstacle.x,
        treeCrownCenterY(obstacle),
        obstacle.z,
      );
      this.dummy.rotation.set(-Math.PI / 2, 0, 0); // Face up
      this.dummy.scale.set(crownRadius * 1.5, crownRadius * 1.5, 1);
      this.dummy.updateMatrix();
      this.treeBillboards.setMatrixAt(
        this.treeBillboardCount,
        this.dummy.matrix,
      );
      this.treeBillboardCount += 1;
    }
  }

  private placeFelled(obstacle: Obstacle, index: number): void {
    const length = felledTrunkLength(obstacle);
    this.dummy.position.set(
      obstacle.x,
      obstacle.groundY + obstacle.radius * 0.9,
      obstacle.z,
    );
    // Lying on its side, so a cleared route is visibly a route you cleared.
    this.dummy.rotation.set(Math.PI / 2, obstacle.variation * Math.PI, 0.08);
    this.dummy.scale.set(obstacle.radius * 1.7, length, obstacle.radius * 1.7);
    this.dummy.updateMatrix();
    this.felledTrunks.setMatrixAt(index, this.dummy.matrix);
  }

  private placeRock(obstacle: Obstacle, index: number): void {
    // Re-ground on the live height field so rocks track the surface after
    // plough deformation changes the terrain height.
    const groundY = this.world.terrain.height(obstacle.x, obstacle.z);
    this.dummy.position.set(
      obstacle.x,
      groundY + obstacle.radius * 0.35,
      obstacle.z,
    );
    this.dummy.rotation.set(
      obstacle.variation * 0.6,
      obstacle.variation * Math.PI * 2,
      obstacle.variation * 0.4,
    );
    this.dummy.scale.set(
      obstacle.radius,
      rockVisualHalfHeight(obstacle),
      obstacle.radius * (0.85 + obstacle.variation * 0.3),
    );
    this.dummy.updateMatrix();
    this.rocks.setMatrixAt(index, this.dummy.matrix);

    // Also place billboard for far-tier LOD
    const tier = classifyVisibility(
      Math.hypot(obstacle.x - this.propAnchorX, obstacle.z - this.propAnchorZ),
      visibilityProfile(this.activeVisibilityProfileId),
    );
    if (
      tier === "far" &&
      this.rockBillboards !== undefined &&
      this.rockBillboardCount < MAX_ROCK_INSTANCES
    ) {
      const halfHeight = rockVisualHalfHeight(obstacle);
      this.dummy.position.set(
        obstacle.x,
        obstacle.groundY + halfHeight,
        obstacle.z,
      );
      this.dummy.rotation.set(-Math.PI / 2, 0, 0); // Face up
      this.dummy.scale.set(obstacle.radius * 1.5, obstacle.radius * 1.5, 1);
      this.dummy.updateMatrix();
      this.rockBillboards.setMatrixAt(
        this.rockBillboardCount,
        this.dummy.matrix,
      );
      this.rockBillboardCount += 1;
    }
  }

  private placeNode(node: SalvageNode, index: number): void {
    const scale = 0.8 + node.variation * 0.4;
    this.dummy.position.set(node.x, node.groundY + scale * 0.5, node.z);
    this.dummy.rotation.set(0, node.variation * Math.PI, 0);
    this.dummy.scale.set(scale, scale * 0.8, scale);
    this.dummy.updateMatrix();
    this.salvageNodes.setMatrixAt(index, this.dummy.matrix);
  }

  // ---------------------------------------------------------------------------
  // Dust
  // ---------------------------------------------------------------------------

  private buildDust(): void {
    const geometry = new THREE.BufferGeometry();
    this.dustPositions.fill(-9999);
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.dustPositions, 3),
    );
    this.dust = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0xd8c9a8,
        size: 0.7,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    );
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);
  }

  /**
   * Emit dust from a slipping wheel.
   *
   * Tied to `wheel.slip` and the surface's own `spray`, so the particle plume is a
   * readout of the traction model rather than decoration: a plume means you are
   * losing grip right now, on this ground.
   */
  private emitDust(
    x: number,
    y: number,
    z: number,
    strength: number,
    speed: number,
  ): void {
    const bursts = Math.min(3, Math.max(1, Math.round(strength * 3)));
    for (let burst = 0; burst < bursts; burst += 1) {
      const index = this.dustCursor;
      this.dustCursor = (this.dustCursor + 1) % MAX_DUST;
      const offset = index * 3;
      this.dustPositions[offset] = x;
      this.dustPositions[offset + 1] = y;
      this.dustPositions[offset + 2] = z;
      // Deterministic-looking spread from the index; visual only, never simulated.
      const angle = index * 2.399963;
      this.dustVelocities[offset] = Math.cos(angle) * (0.6 + speed * 0.06);
      this.dustVelocities[offset + 1] = 0.9 + strength * 1.3;
      this.dustVelocities[offset + 2] = Math.sin(angle) * (0.6 + speed * 0.06);
      this.dustLife[index] = 0.55 + strength * 0.5;
    }
  }

  private updateDust(delta: number): void {
    for (let index = 0; index < MAX_DUST; index += 1) {
      if (this.dustLife[index]! <= 0) continue;
      const offset = index * 3;
      this.dustLife[index] = this.dustLife[index]! - delta;
      if (this.dustLife[index]! <= 0) {
        this.dustPositions[offset + 1] = -9999;
        continue;
      }
      const velocityY = this.dustVelocities[offset + 1]!;
      this.dustPositions[offset] =
        this.dustPositions[offset]! + this.dustVelocities[offset]! * delta;
      this.dustPositions[offset + 1] =
        this.dustPositions[offset + 1]! + velocityY * delta;
      this.dustPositions[offset + 2] =
        this.dustPositions[offset + 2]! +
        this.dustVelocities[offset + 2]! * delta;
      this.dustVelocities[offset + 1] = velocityY - 1.6 * delta;
    }
    (
      this.dust.geometry.getAttribute("position") as THREE.BufferAttribute
    ).needsUpdate = true;
  }

  // ---------------------------------------------------------------------------
  // Authored sites
  // ---------------------------------------------------------------------------

  /** Ground a group at the terrain height of its own position. */
  private groundAt(group: THREE.Object3D, x: number, z: number): void {
    group.position.set(x, this.world.terrain.height(x, z), z);
  }

  private createStructurePart(part: WorldStructurePart): THREE.Mesh {
    let object: THREE.Mesh;
    if (part.shape.kind === "box") {
      object = box(
        part.shape.width,
        part.shape.height,
        part.shape.depth,
        part.color,
      );
    } else if (part.shape.kind === "cylinder") {
      object = cylinder(
        part.shape.radiusTop ?? part.shape.radius,
        part.shape.radiusBottom ?? part.shape.radius,
        part.shape.height,
        part.shape.radialSegments,
        part.color,
      );
    } else {
      object = new THREE.Mesh(
        new THREE.ConeGeometry(
          part.shape.radius,
          part.shape.height,
          part.shape.radialSegments,
        ),
        material(part.color, part.roughness),
      );
      object.scale.z = part.shape.scaleZ ?? 1;
    }
    object.name = `structure:${part.id}`;
    object.position.set(part.localX, part.localY, part.localZ);
    object.rotation.y = part.rotationY ?? 0;
    if (part.roughness !== undefined && part.shape.kind !== "cone") {
      (object.material as THREE.MeshStandardMaterial).roughness =
        part.roughness;
    }
    return object;
  }

  private buildSites(): void {
    for (const site of WORLD_SITES) {
      const group = new THREE.Group();
      group.name = `site:${site.id}`;

      for (const part of WORLD_STRUCTURE_PARTS) {
        if (part.siteId !== site.id) continue;
        const object = this.createStructurePart(part);
        if (part.discoverySignal) {
          // Unlit material so the lamp reads as a light source rather than a
          // painted cylinder, and so dimming it needs no lighting pass.
          object.material = new THREE.MeshBasicMaterial({ color: part.color });
          group.userData.signalLamp = object;
          group.userData.signalLitColor = part.color;
        }
        group.add(object);
      }

      this.groundAt(group, site.x, site.z);
      this.scene.add(group);
    }

    // Relay route furniture, grounded on real terrain.
    const pickupRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.4, 0.14, 8, 32),
      new THREE.MeshBasicMaterial({ color: COLORS.gold }),
    );
    pickupRing.rotation.x = Math.PI / 2;
    pickupRing.position.set(
      CARGO_PICKUP.x,
      this.world.terrain.height(CARGO_PICKUP.x, CARGO_PICKUP.z) + 0.2,
      CARGO_PICKUP.z,
    );

    const deliveryRing = new THREE.Mesh(
      new THREE.TorusGeometry(CARGO_DELIVERY.radius * 0.75, 0.2, 8, 42),
      new THREE.MeshBasicMaterial({
        color: COLORS.cyan,
        transparent: true,
        opacity: 0.82,
      }),
    );
    deliveryRing.name = "relay-delivery-ring";
    deliveryRing.rotation.x = Math.PI / 2;
    deliveryRing.position.set(
      CARGO_DELIVERY.x,
      this.world.terrain.height(CARGO_DELIVERY.x, CARGO_DELIVERY.z) + 0.24,
      CARGO_DELIVERY.z,
    );

    const rampBase = this.world.terrain.height(BUGGY_RAMP.x, BUGGY_RAMP.z);
    const ramp = box(6.5, 0.6, 8, 0xd59a43);
    ramp.name = "relay-ramp";
    ramp.position.set(BUGGY_RAMP.x, rampBase + 0.85, BUGGY_RAMP.z);
    ramp.rotation.x = -0.18;
    const rampStripe = box(5, 0.09, 1.2, COLORS.bone);
    rampStripe.position.set(BUGGY_RAMP.x, rampBase + 1.45, BUGGY_RAMP.z - 0.4);
    rampStripe.rotation.x = -0.18;

    this.scene.add(pickupRing, deliveryRing, ramp, rampStripe);
  }

  private buildRuntimeBridgeAssets(): void {
    this.runtimeBridgeSpecs.forEach((spec) => {
      const bridge = new THREE.Group();
      bridge.name = `bridge:${spec.assetId}`;
      bridge.rotation.y = spec.yaw;
      this.groundAt(bridge, spec.x, spec.z);

      const fallback = box(
        spec.fallbackWidth,
        spec.fallbackHeight,
        spec.fallbackDepth,
        spec.fallbackColor,
      );
      fallback.position.y = spec.fallbackHeight / 2;
      bridge.add(fallback);
      this.scene.add(bridge);
      this.runtimeBridgeEvidence.set(spec.assetId, {
        assetId: spec.assetId,
        runtimePath: spec.runtimeUrl,
        status: "loading",
        fallbackActive: true,
        loadedNodeCount: 0,
        errorMessage: null,
      });

      void this.gltfLoader
        .loadAsync(spec.runtimeUrl)
        .then((gltf) => {
          const root = gltf.scene ?? gltf.scenes[0];
          if (!root) return;

          root.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = false;
              child.receiveShadow = false;
            }
          });

          const bounds = new THREE.Box3().setFromObject(root);
          const size = bounds.getSize(new THREE.Vector3());
          const center = bounds.getCenter(new THREE.Vector3());
          const maxDimension = Math.max(size.x, size.y, size.z, 0.0001);
          const scale = spec.targetMaxDimension / maxDimension;
          root.scale.setScalar(scale);
          root.position.set(
            -center.x * scale,
            -bounds.min.y * scale,
            -center.z * scale,
          );

          bridge.clear();
          bridge.add(root);
          this.runtimeBridgeEvidence.set(spec.assetId, {
            assetId: spec.assetId,
            runtimePath: spec.runtimeUrl,
            status: "loaded",
            fallbackActive: false,
            loadedNodeCount: root.children.length,
            errorMessage: null,
          });
        })
        .catch((error: unknown) => {
          this.runtimeBridgeEvidence.set(spec.assetId, {
            assetId: spec.assetId,
            runtimePath: spec.runtimeUrl,
            status: "error",
            fallbackActive: true,
            loadedNodeCount: 0,
            errorMessage:
              error instanceof Error
                ? error.message
                : String(error ?? "unknown"),
          });
          console.warn(
            `Runtime bridge asset could not load (${spec.assetId}); keeping fallback geometry.`,
            error,
          );
        });
    });
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
  private buildSky(): void {
    this.sky = new THREE.Mesh(
      new THREE.SphereGeometry(860, 18, 12),
      new THREE.MeshBasicMaterial({
        color: 0xbfd5c5,
        side: THREE.BackSide,
        fog: false,
        depthWrite: false,
      }),
    );
    this.sky.name = "sky";
    this.sky.frustumCulled = false;
    this.scene.add(this.sky);
  }

  private buildStars(): void {
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

  // ---------------------------------------------------------------------------
  // Rigs
  // ---------------------------------------------------------------------------

  private blobShadow(radius: number, opacity: number): THREE.Mesh {
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 24),
      new THREE.MeshBasicMaterial({
        color: 0x111811,
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    return shadow;
  }

  /**
   * Add a visible, module-owned tread band to a wheel spin pivot.
   *
   * The stock tyre stays authoritative for wheel size and contact. These outer
   * bands only expose the fitted lug-tyre state through silhouette and material,
   * so presentation never invents a second handling model.
   */
  private addLugTireVisual(
    spinPivot: THREE.Group,
    radius: number,
    width: number,
  ): THREE.Group {
    const tread = new THREE.Group();
    tread.name = "module:lug-tires";
    const treadMaterial = material(0x4f5147, 0.96, 0.02);
    for (const side of [-1, 1] as const) {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(radius * 0.92, radius * 0.105, 5, 14),
        treadMaterial,
      );
      band.rotation.y = Math.PI / 2;
      band.position.x = side * (width * 0.5 + 0.035);
      tread.add(band);
    }
    const lugGeometry = new THREE.BoxGeometry(
      width + 0.18,
      radius * 0.14,
      radius * 0.3,
    );
    for (let index = 0; index < 12; index += 1) {
      const angle = (index / 12) * Math.PI * 2;
      const lug = new THREE.Mesh(lugGeometry, treadMaterial);
      lug.position.set(
        0,
        Math.sin(angle) * radius * 1.03,
        Math.cos(angle) * radius * 1.03,
      );
      lug.rotation.x = angle;
      tread.add(lug);
    }
    tread.visible = false;
    spinPivot.add(tread);
    return tread;
  }

  private buildStateShell(
    boundsX: number,
    boundsY: number,
    boundsZ: number,
    baseColorHex: number,
  ): { mesh: THREE.Mesh; material: THREE.ShaderMaterial } {
    const geometry = new THREE.BoxGeometry(
      boundsX * 1.08,
      boundsY * 1.08,
      boundsZ * 1.08,
      10,
      10,
      10,
    );
    const stateShellMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntegrity: { value: 1.0 },
        uHitPoint: { value: new THREE.Vector3() },
        uHitTime: { value: -99.0 },
        uBaseColor: { value: new THREE.Color(baseColorHex) },
        uDamageColor: { value: new THREE.Color(0xd94e34) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vNormal = normal;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntegrity;
        uniform vec3 uHitPoint;
        uniform float uHitTime;
        uniform vec3 uBaseColor;
        uniform vec3 uDamageColor;

        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(0.0, dot(viewDir, vWorldNormal)), 2.6);
          
          float distToHit = length(vWorldPosition - uHitPoint);
          float timeSinceHit = uTime - uHitTime;
          float ripple = 0.0;
          if (timeSinceHit >= 0.0 && timeSinceHit < 0.65) {
            float waveRadius = timeSinceHit * 14.0;
            float waveWidth = 0.9;
            float distDelta = abs(distToHit - waveRadius);
            if (distDelta < waveWidth) {
              ripple = sin((1.0 - distDelta / waveWidth) * 3.14159) * (1.0 - timeSinceHit / 0.65);
            }
          }

          vec3 stateColor = mix(uDamageColor, uBaseColor, uIntegrity);
          float pulse = (1.0 - uIntegrity) * 0.22 * sin(uTime * 8.0);
          float alpha = clamp(fresnel * mix(0.65, 0.12, uIntegrity) + ripple * 0.75 + pulse, 0.0, 0.85);
          
          gl_FragColor = vec4(stateColor + vec3(ripple * 0.5), alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(geometry, stateShellMaterial);
    mesh.name = "vfx:state-shell";
    // The shell is a transparent VFX envelope, not solid rig geometry. Hood
    // cameras legitimately sit inside it, so it must not trip the near-plane
    // self-intersection contract used for opaque vehicle parts.
    mesh.userData.cameraSolid = false;
    return { mesh, material: stateShellMaterial };
  }

  /**
   * The utility tractor, built front-forward.

   *
   * Layout along local Z, front (+) to rear (−): grille and headlights at +2.6,
   * hood at +1.2, small steering wheels at +1.65, cab at −1.05, large drive wheels
   * at −1.25, plough at −3.2. The previous build had the grille, hood, headlights
   * *and* plough all at −Z, which is why it appeared to drive backwards.
   */
  private createTractor(): RigParts {
    const root = new THREE.Group();
    root.name = "persistent-rig";
    root.rotation.order = "YXZ";
    const cameraSocket = hoodCameraSocket("utility-tractor");

    const shadow = this.blobShadow(2.6, 0.3);
    shadow.position.set(0, 0.04, -0.2);
    shadow.scale.set(1, 1.65, 1);

    const chassis = box(2.5, 0.7, 4.6, 0x4c3328);
    chassis.position.y = 0.95;
    const hood = box(2.1, 1.4, 2.6, COLORS.rust);
    hood.position.set(0, 1.75, 1.2);
    const grille = box(1.9, 1, 0.2, 0x292824);
    grille.position.set(0, 1.7, 2.55);
    const cab = box(2.4, 2.4, 2.1, COLORS.bone);
    cab.position.set(0, 2.7, -1.05);
    const windscreen = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 1.2, 0.1),
      material(0x274d58, 0.3, 0.15),
    );
    windscreen.position.set(0, 2.95, 0.02);
    const roof = box(2.9, 0.22, 2.5, 0x8e3328);
    roof.position.set(0, 4.05, -1.05);
    const beacon = cylinder(0.2, 0.28, 0.4, 10, 0xe7a63b);
    beacon.position.set(0.7, 4.4, -1);
    const exhaust = cylinder(0.13, 0.17, 2.4, 8, 0x2d2d29);
    exhaust.position.set(-0.68, 2.9, 1.4);

    const wheels: THREE.Group[] = [];
    const steeringPivots: THREE.Group[] = [];
    const wheelRestY: number[] = [];
    const lugTireVisuals: THREE.Object3D[] = [];
    // Physics order: front-left, front-right, rear-left, rear-right.
    const layout: ReadonlyArray<readonly [number, number, number]> = [
      [-1.36, 1.65, 0.62],
      [1.36, 1.65, 0.62],
      [-1.5, -1.25, 1.05],
      [1.5, -1.25, 1.05],
    ];
    for (const [x, z, radius] of layout) {
      const steeringPivot = new THREE.Group();
      steeringPivot.position.set(x, radius, z);
      const spinPivot = new THREE.Group();
      const wheel = cylinder(radius, radius, 0.66, 14, COLORS.tire);
      wheel.rotation.z = Math.PI / 2;
      const hub = cylinder(radius * 0.44, radius * 0.44, 0.7, 10, COLORS.gold);
      hub.rotation.z = Math.PI / 2;
      wheel.add(hub);
      spinPivot.add(wheel);
      lugTireVisuals.push(this.addLugTireVisual(spinPivot, radius, 0.66));
      steeringPivot.add(spinPivot);
      wheels.push(spinPivot);
      steeringPivots.push(steeringPivot);
      wheelRestY.push(radius);
      root.add(steeringPivot);
    }

    const ploughPivot = new THREE.Group();
    ploughPivot.position.set(0, 1, -2.5);
    const ploughBeam = box(3.7, 0.24, 1.5, 0x583930);
    ploughBeam.position.z = -0.5;
    const blade = box(4.6, 1.05, 0.24, 0xa94a36);
    blade.position.set(0, -0.12, -1.3);
    blade.rotation.x = 0.22;
    ploughPivot.add(ploughBeam, blade);
    for (let index = -2; index <= 2; index += 1) {
      const tooth = box(0.17, 0.52, 0.52, 0x2f2e2a);
      tooth.position.set(index * 0.88, -0.56, -1.36);
      ploughPivot.add(tooth);
    }

    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffe7a8 });
    for (const x of [-0.68, 0.68]) {
      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12),
        headlightMaterial,
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, 1.85, 2.66);
      root.add(lens);
    }
    // A spotlight aimed forward, so night driving actually lights the road ahead.
    const headlights = new THREE.SpotLight(0xffd58a, 0, 46, 0.62, 0.45, 1.2);
    headlights.position.set(0, 2.1, 2.6);
    headlights.target.position.set(0, 0, 22);
    root.add(headlights.target);

    const { mesh: stateShell, material: stateShellMaterial } =
      this.buildStateShell(3.2, 2.8, 5.2, 0xe89d43);
    stateShell.position.set(0, 1.8, -0.2);

    root.add(
      shadow,
      chassis,
      hood,
      grille,
      cab,
      windscreen,
      roof,
      beacon,
      exhaust,
      ploughPivot,
      headlights,
      cameraSocket,
      stateShell,
    );
    return {
      root,
      hoodCameraSocket: cameraSocket,
      wheels,
      steeringPivots,
      wheelRestY,
      moduleVisuals: { "lug-tires": lugTireVisuals },
      ploughPivot,
      headlights,
      frontMarker: grille,
      rearMarker: blade,
      stateShell,
      stateShellMaterial,
    };
  }

  /** The toy buggy, built front-forward: nose and lights at +Z, tow hook at −Z. */
  private createBuggy(): RigParts {
    const root = new THREE.Group();
    root.name = "toy-buggy";
    root.rotation.order = "YXZ";
    const cameraSocket = hoodCameraSocket("toy-buggy");

    const shadow = this.blobShadow(2.1, 0.26);
    shadow.position.y = 0.04;
    shadow.scale.set(1, 1.45, 1);

    const chassis = box(2.4, 0.42, 3.4, 0x283d45);
    chassis.position.y = 0.62;
    const nose = box(2.15, 0.62, 1.4, 0xe1ad52);
    nose.position.set(0, 0.95, 1.15);
    const cockpit = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.6, 1.35),
      material(0x315f6b, 0.28, 0.12),
    );
    cockpit.position.set(0, 1.15, -0.55);
    const rollBar = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.1, 6, 16, Math.PI),
      material(COLORS.bone),
    );
    rollBar.position.set(0, 1.5, -0.7);
    rollBar.rotation.z = Math.PI;

    const wheels: THREE.Group[] = [];
    const steeringPivots: THREE.Group[] = [];
    const wheelRestY: number[] = [];
    const lugTireVisuals: THREE.Object3D[] = [];
    for (const [x, z] of [
      [-1.45, 1.1],
      [1.45, 1.1],
      [-1.45, -1.1],
      [1.45, -1.1],
    ] as const) {
      const steeringPivot = new THREE.Group();
      steeringPivot.position.set(x, 0.56, z);
      const spinPivot = new THREE.Group();
      const wheel = cylinder(0.56, 0.56, 0.46, 12, COLORS.tire);
      wheel.rotation.z = Math.PI / 2;
      const hub = cylinder(0.23, 0.23, 0.5, 8, COLORS.cyan);
      hub.rotation.z = Math.PI / 2;
      wheel.add(hub);
      spinPivot.add(wheel);
      lugTireVisuals.push(this.addLugTireVisual(spinPivot, 0.56, 0.46));
      steeringPivot.add(spinPivot);
      wheels.push(spinPivot);
      steeringPivots.push(steeringPivot);
      wheelRestY.push(0.56);
      root.add(steeringPivot);
    }

    const towHook = cylinder(0.12, 0.16, 0.6, 8, COLORS.gold);
    towHook.rotation.x = Math.PI / 2;
    towHook.position.set(0, 0.5, -2);

    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xdffcff });
    for (const x of [-0.62, 0.62]) {
      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.12, 10),
        headlightMaterial,
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, 1, 1.9);
      root.add(lens);
    }
    const headlights = new THREE.SpotLight(0xc8f8ff, 0, 38, 0.55, 0.4, 1.3);
    headlights.position.set(0, 1.1, 1.9);
    headlights.target.position.set(0, 0, 20);
    root.add(headlights.target);

    const { mesh: stateShell, material: stateShellMaterial } =
      this.buildStateShell(2.4, 1.8, 4.2, 0xd9aa52);
    stateShell.position.set(0, 1.0, 0);

    root.add(
      shadow,
      chassis,
      nose,
      cockpit,
      rollBar,
      towHook,
      headlights,
      cameraSocket,
      stateShell,
    );
    return {
      root,
      hoodCameraSocket: cameraSocket,
      wheels,
      steeringPivots,
      wheelRestY,
      moduleVisuals: { "lug-tires": lugTireVisuals },
      ploughPivot: null,
      headlights,
      frontMarker: nose,
      rearMarker: towHook,
      stateShell,
      stateShellMaterial,
    };
  }

  /**
   * Drift, a compact marsh skimmer.
   *
   * Its silhouette exposes the mobility contract: sealed pontoons, a flexible
   * lift skirt, and twin rear fans instead of decorative wheels. Presentation
   * must not imply ground contacts the simulation does not own.
   */
  private createSkimmer(): RigParts {
    const root = new THREE.Group();
    root.name = "marsh-skimmer";
    root.rotation.order = "YXZ";
    const cameraSocket = hoodCameraSocket("marsh-skimmer");

    const shadow = this.blobShadow(2.6, 0.22);
    shadow.position.y = -0.72;
    shadow.scale.set(1.2, 1.75, 1);

    const skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(2.15, 2.45, 0.62, 12),
      material(0x242a2b, 0.95, 0),
    );
    skirt.scale.z = 1.45;
    skirt.position.y = -0.22;

    const deck = box(3.8, 0.42, 5.1, 0x315861);
    deck.position.y = 0.28;
    const prow = new THREE.Mesh(
      new THREE.ConeGeometry(1.82, 2.1, 4),
      material(COLORS.cyan, 0.58, 0.16),
    );
    prow.rotation.x = Math.PI / 2;
    prow.rotation.z = Math.PI / 4;
    prow.position.set(0, 0.48, 3.05);
    const cabin = box(2.45, 1.25, 2.1, COLORS.bone);
    cabin.position.set(0, 1.12, 0.35);
    const windscreen = box(2.1, 0.58, 0.12, 0x234d5a);
    windscreen.position.set(0, 1.35, 1.43);
    const roof = box(2.8, 0.18, 2.35, COLORS.rust);
    roof.position.set(0, 1.83, 0.28);

    const pontoonMaterial = material(0x476f75, 0.66, 0.14);
    for (const x of [-1.72, 1.72]) {
      const pontoon = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.42, 3.7, 5, 10),
        pontoonMaterial,
      );
      pontoon.rotation.x = Math.PI / 2;
      pontoon.position.set(x, 0.15, 0.05);
      root.add(pontoon);
    }

    const fanMaterial = material(0x26383c, 0.62, 0.25);
    for (const x of [-0.92, 0.92]) {
      const fan = new THREE.Group();
      fan.position.set(x, 1.28, -2.35);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.66, 0.1, 8, 18),
        fanMaterial,
      );
      const hub = cylinder(0.15, 0.15, 0.24, 8, COLORS.gold);
      hub.rotation.x = Math.PI / 2;
      const bladeA = box(0.15, 1.05, 0.08, 0xc7a35b);
      const bladeB = bladeA.clone();
      bladeB.rotation.z = Math.PI / 2;
      fan.add(ring, hub, bladeA, bladeB);
      root.add(fan);
    }

    const towHook = cylinder(0.12, 0.16, 0.62, 8, COLORS.gold);
    towHook.rotation.x = Math.PI / 2;
    towHook.position.set(0, 0.1, -3);

    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xbdfaff });
    for (const x of [-0.72, 0.72]) {
      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.19, 0.12, 10),
        lightMaterial,
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, 0.68, 3.45);
      root.add(lens);
    }
    const headlights = new THREE.SpotLight(0xbdfaff, 0, 42, 0.62, 0.45, 1.2);
    headlights.position.set(0, 0.78, 3.3);
    headlights.target.position.set(0, -0.25, 23);
    root.add(headlights.target);

    const { mesh: stateShell, material: stateShellMaterial } =
      this.buildStateShell(4.2, 2.2, 6.2, 0x6bc9c4);
    stateShell.position.set(0, 0.8, 0.2);

    root.add(
      shadow,
      skirt,
      deck,
      prow,
      cabin,
      windscreen,
      roof,
      towHook,
      headlights,
      cameraSocket,
      stateShell,
    );
    return {
      root,
      hoodCameraSocket: cameraSocket,
      wheels: [],
      steeringPivots: [],
      wheelRestY: [],
      moduleVisuals: {},
      ploughPivot: null,
      headlights,
      frontMarker: prow,
      rearMarker: towHook,
      stateShell,
      stateShellMaterial,
    };
  }

  private createCargo(): THREE.Group {
    const root = new THREE.Group();
    root.name = "relay-cargo";
    const pallet = box(2.2, 0.25, 2, 0x604834);
    pallet.position.y = -0.45;
    const crate = box(1.75, 1.4, 1.55, 0x8c5236);
    crate.position.y = 0.3;
    const bandA = box(1.88, 0.13, 1.68, COLORS.gold);
    const bandB = bandA.clone();
    bandA.position.y = 0.07;
    bandB.position.y = 0.53;
    const beacon = cylinder(0.18, 0.22, 0.35, 8, COLORS.cyan);
    beacon.position.y = 1.17;
    root.add(pallet, crate, bandA, bandB, beacon);
    return root;
  }

  // ---------------------------------------------------------------------------
  // Furrows
  // ---------------------------------------------------------------------------

  private updateFurrows(state: GameState): void {
    if (state.furrows.length < this.renderedFurrows) {
      // A reset, a save restore, or a circular-buffer splice at MAX_FURROWS
      // shortened the list. When the oldest entries are trimmed the remaining
      // furrows shift down by `offset` indices, so instance-slot `i` now
      // corresponds to array entry `i - offset`. Detect that case and copy
      // forward rather than rebuilding from scratch every frame.
      const offset =
        this.renderedFurrows - state.furrows.length;
      if (offset > 0 && offset < this.renderedFurrows) {
        // Circular-buffer splice: copy shifted matrices and colours forward
        // in-place so the visual order matches the trimmed array.
        for (let i = offset; i < this.renderedFurrows; i++) {
          this.furrowDecals.getMatrixAt(i, this.dummy.matrix);
          this.furrowDecals.setMatrixAt(i - offset, this.dummy.matrix);
          if (this.furrowDecals.instanceColor) {
            const c = this.furrowDecals.getColorAt(i, this.tempColor);
            this.furrowDecals.setColorAt(i - offset, c);
          }
        }
      }
      this.renderedFurrows = state.furrows.length;
    }
    while (this.renderedFurrows < state.furrows.length) {
      const mark = state.furrows[this.renderedFurrows]!;
      this.dummy.position.set(
        mark.x,
        this.world.terrain.height(mark.x, mark.z) + 0.05,
        mark.z,
      );
      this.dummy.rotation.set(-Math.PI / 2, mark.heading, 0);
      this.dummy.scale.set(1, 1, 1);
      this.dummy.updateMatrix();
      this.furrowDecals.setMatrixAt(this.renderedFurrows, this.dummy.matrix);
      // Cut furrows are dark brown; fill furrows are lighter to show raised ground.
      const colour = mark.mode === "fill" ? this.furrowFillColor : this.furrowCutColor;
      this.furrowDecals.setColorAt(this.renderedFurrows, colour);
      this.renderedFurrows += 1;
    }
    if (this.furrowDecals.count !== this.renderedFurrows) {
      this.furrowDecals.count = this.renderedFurrows;
      this.furrowDecals.instanceMatrix.needsUpdate = true;
      if (this.furrowDecals.instanceColor)
        this.furrowDecals.instanceColor.needsUpdate = true;
    }
  }

  // ---------------------------------------------------------------------------
  // Presentation state
  // ---------------------------------------------------------------------------

  /**
   * Apply a presentation phase.
   *
   * Fog colour **must** equal the background colour in every phase. The world is
   * ringed by a 78 m impassable ridge about 200 m out (see `world.ts`), so a large
   * band of the horizon is always distant geometry. When fog converged on a
   * different colour than the sky, that ridge resolved as a dark grey wall around
   * the whole horizon — in broad daylight. Matching the two makes the rim dissolve
   * into the sky, which is what distance is supposed to look like.
   */
  private updatePhase(phase: WorldPhase): void {
    if (phase === this.currentPhase) return;
    this.currentPhase = phase;
    const stars = this.scene.getObjectByName("night-stars");
    const waterMaterial = this.waterMaterial;
    const waterUniforms = waterMaterial.uniforms as {
      waterColor: { value: THREE.Color };
      deepColor: { value: THREE.Color };
      shallowColor: { value: THREE.Color };
    };
    const setWaterPalette = (
      waterColor: number,
      deepColor: number,
      shallowColor: number,
    ): void => {
      waterUniforms.waterColor.value.setHex(waterColor);
      waterUniforms.deepColor.value.setHex(deepColor);
      waterUniforms.shallowColor.value.setHex(shallowColor);
    };

    if (phase === "day") {
      this.scene.background = new THREE.Color(0xbfd5c5);
      (this.sky.material as THREE.MeshBasicMaterial).color.setHex(0xbfd5c5);
      this.scene.fog = new THREE.FogExp2(0xbfd5c5, 0.0052);
      this.sun.color.setHex(0xffdeb0);
      this.sun.intensity = 2.5;
      this.hemisphere.intensity = 1.6;
      setWaterPalette(0x3d6672, 0x0b1720, 0x0f3f5f);
      for (const rig of this.rigs.values()) rig.headlights.intensity = 0;
      if (stars) stars.visible = false;
    } else if (phase === "gloam") {
      this.scene.background = new THREE.Color(0x9d6b50);
      (this.sky.material as THREE.MeshBasicMaterial).color.setHex(0x9d6b50);
      this.scene.fog = new THREE.FogExp2(0x9d6b50, 0.0058);
      this.sun.color.setHex(0xff9d66);
      this.sun.intensity = 1.3;
      this.hemisphere.intensity = 0.9;
      setWaterPalette(0x4a4a58, 0x17202f, 0x2a5a77);
      for (const rig of this.rigs.values()) rig.headlights.intensity = 60;
      if (stars) stars.visible = true;
    } else {
      this.scene.background = new THREE.Color(COLORS.night);
      (this.sky.material as THREE.MeshBasicMaterial).color.setHex(COLORS.night);
      this.scene.fog = new THREE.FogExp2(COLORS.night, 0.007);
      this.sun.color.setHex(0x86a8d6);
      this.sun.intensity = 0.35;
      this.hemisphere.intensity = 0.45;
      setWaterPalette(0x1c3340, 0x060d14, 0x14364c);
      for (const rig of this.rigs.values()) rig.headlights.intensity = 150;
      if (stars) stars.visible = true;
    }
  }

  /** Register an impact so the camera can react to it. */
  addShake(amount: number): void {
    if (this.reducedMotionQuery.matches) return;
    this.shake = Math.min(1.2, this.shake + amount);
  }

  /**
   * Queue a visual shell pulse for a condition-loss outcome.
   *
   * The simulation remains authoritative: this is deliberately presentation
   * state only, shares the existing audio/shake trigger, and does not claim a
   * physical collision point that the current collision outcome does not carry.
   */
  recordConditionImpact(rigId: RigId): void {
    this.pendingConditionImpacts.add(rigId);
  }

  // ---------------------------------------------------------------------------
  // Frame
  // ---------------------------------------------------------------------------

  render(state: GameState): void {
    const now = performance.now();
    const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;

    this.updatePhase(state.phase);
    this.updateFurrows(state);

    const activeRigState = state.rigs[state.activeRigId];
    const profile = effectiveProfile(activeRigState.id, activeRigState.modules);

    // Terrain mesh follows the height field when the plough changes it.
    // Gate on the terrain's mutation revision, never on its cell count. Deepening
    // an existing furrow changes a cell's value without changing the count, and the
    // FIFO eviction at capacity swaps one cell for another — both leave the count
    // identical while the ground the physics reads has moved.
    const deformCount = this.world.terrain.deformationRevision();
    if (deformCount !== this.lastDeformCount) {
      this.lastDeformCount = deformCount;
      this.refreshTerrainRegion(activeRigState.x, activeRigState.z, 9);
      // Event-driven prop invalidation: terrain deformation changes the
      // ground beneath nearby props, so force a prop rebuild on the next
      // frame rather than waiting for the rig to travel PROP_REBUILD_DISTANCE.
      this.propAnchorX = Number.POSITIVE_INFINITY;
      this.propAnchorZ = Number.POSITIVE_INFINITY;
    }

    if (
      Math.hypot(
        activeRigState.x - this.propAnchorX,
        activeRigState.z - this.propAnchorZ,
      ) > PROP_REBUILD_DISTANCE
    ) {
      this.refreshProps(state);
    }

    for (const id of RIG_IDS) {
      const rigState = state.rigs[id];
      const parts = this.rigs.get(id);
      if (!parts) continue;
      const rigProfile = effectiveProfile(rigState.id, rigState.modules);
      const feedback = deriveRigFeedback(
        rigState,
        rigProfile,
        this.reducedMotionQuery.matches,
      );
      this.feedbackFrames.set(id, feedback);

      parts.root.position.set(rigState.x, rigState.y, rigState.z);
      parts.root.rotation.y = rigState.heading;
      // Positive pitch is nose-up; a Y-then-X rotation drops +Z for positive X,
      // so the sign is inverted here.
      parts.root.rotation.x = -rigState.pitch + feedback.bodyPitchOffset;
      parts.root.rotation.z = rigState.roll + feedback.bodyRollOffset;

      for (const [moduleId, visuals] of Object.entries(parts.moduleVisuals)) {
        const visible = rigState.modules.includes(moduleId as ModuleId);
        for (const visual of visuals) visual.visible = visible;
      }

      if (parts.stateShellMaterial) {
        const uniforms = parts.stateShellMaterial.uniforms;
        if (uniforms["uTime"]) uniforms["uTime"].value = now / 1000;
        if (uniforms["uIntegrity"])
          uniforms["uIntegrity"].value = feedback.integrityRatio;
        const impact = feedback.lastImpact;
        const conditionImpact = this.pendingConditionImpacts.delete(id);
        if (
          (impact || conditionImpact) &&
          uniforms["uHitPoint"] &&
          uniforms["uHitTime"]
        ) {
          // Current collision outcomes identify severity but not a stable local
          // hit coordinate. Use the shell centre for that authoritative damage
          // pulse; a future collision event may supply `feedback.lastImpact`.
          const point = impact ?? { x: 0, y: 0.6, z: 0, intensity: 1 };
          (uniforms["uHitPoint"].value as THREE.Vector3).set(
            point.x,
            point.y,
            point.z,
          );
          uniforms["uHitTime"].value = now / 1000;
        }
      }

      if (rigState.mobility.kind === "ground") {
        for (let index = 0; index < parts.wheels.length; index += 1) {
          const wheel = parts.wheels[index]!;
          const steeringPivot = parts.steeringPivots[index]!;
          const rest = parts.wheelRestY[index]!;
          const wheelState = rigState.mobility.wheels[index];
          wheel.rotation.x = rigState.mobility.wheelRotation;
          steeringPivot.rotation.y = index < 2 ? feedback.steeringAngle : 0;
          if (wheelState) {
            // Compression 0.5 is the resting position, so the wheel visibly
            // rides up into the arch over a bump and drops away over a crest.
            const travel = (wheelState.compression - 0.5) * 2 * 0.5;
            steeringPivot.position.y = rest + travel * 0.6;
          }
        }
      }

      if (parts.ploughPivot) {
        const plough = rigState.attachments.find(
          (item) => item.id === "field-plough",
        );
        parts.ploughPivot.rotation.x = THREE.MathUtils.lerp(
          parts.ploughPivot.rotation.x,
          plough?.engaged ? 0.3 : -0.22,
          1 - Math.exp(-8 * delta),
        );
      }
    }

    // Dust from the active rig's slipping wheels.
    const ground = this.world.terrain.sample(
      activeRigState.x,
      activeRigState.z,
      1.2,
    );
    const spray = ground.surface.spray;
    if (activeRigState.mobility.kind === "ground") {
      for (
        let index = 0;
        index < activeRigState.mobility.wheels.length;
        index += 1
      ) {
        const wheel = activeRigState.mobility.wheels[index]!;
        if (!wheel.contact) continue;
        const strength = wheel.slip * spray;
        if (strength < 0.18) continue;
        const angle =
          activeRigState.heading + (index < 2 ? 0.4 : Math.PI - 0.4);
        const radius = profile.track * 0.5;
        this.emitDust(
          activeRigState.x + Math.sin(angle) * radius,
          ground.height + 0.3,
          activeRigState.z + Math.cos(angle) * radius,
          Math.min(1, strength),
          Math.abs(activeRigState.speed),
        );
      }
    } else if (
      Math.abs(activeRigState.speed) > 1.5 &&
      activeRigState.telemetry.waterDepth > 0.05
    ) {
      const rearX = activeRigState.x - Math.sin(activeRigState.heading) * 2.2;
      const rearZ = activeRigState.z - Math.cos(activeRigState.heading) * 2.2;
      this.emitDust(
        rearX,
        WATER_LEVEL + 0.15,
        rearZ,
        Math.min(1, Math.abs(activeRigState.speed) / profile.topSpeed),
        Math.abs(activeRigState.speed),
      );
    }
    this.updateDust(delta);

    // Cargo and hitch.
    const cargo = state.cargoRelay.cargo;
    this.cargo.visible = true;
    this.cargo.position.set(cargo.x, cargo.y, cargo.z);
    this.cargo.rotation.y = cargo.heading;

    this.hitchLine.visible = cargo.attachedRigId !== null;
    if (cargo.attachedRigId) {
      const attachedRig = state.rigs[cargo.attachedRigId];
      const positions = this.hitchLine.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      positions.setXYZ(0, attachedRig.x, attachedRig.y + 0.4, attachedRig.z);
      positions.setXYZ(1, cargo.x, cargo.y + 0.35, cargo.z);
      positions.needsUpdate = true;
      this.hitchLine.geometry.computeBoundingSphere();
    }

    const deliveryRing = this.scene.getObjectByName("relay-delivery-ring");
    if (deliveryRing) {
      deliveryRing.rotation.z += delta * 0.42;
      deliveryRing.visible = state.cargoRelay.status !== "complete";
    }

    for (const site of WORLD_SITES) {
      const group = this.scene.getObjectByName(`site:${site.id}`);
      const lamp = group?.userData.signalLamp as THREE.Mesh | undefined;
      if (!lamp) continue;
      const discovered = state.discoveries.some((item) => item.id === site.id);
      // The housing stays: a dead lamp on a real structure still reads as a place
      // you have already been, where a vanished marker reads as a bug.
      (lamp.material as THREE.MeshBasicMaterial).color.setHex(
        discovered
          ? SIGNAL_LAMP_DARK
          : ((group?.userData.signalLitColor as number | undefined) ??
              SIGNAL_LAMP_DARK),
      );
    }

    this.updateCamera(state, delta, profile);
    this.composer.render();
  }

  /**
   * Position the camera, keeping the rig visible.
   *
   * Includes the terrain-occlusion pull-in that `DESIGN.md` records as an
   * unimplemented gap: the ideal camera position is raymarched against the height
   * field and pulled toward the rig if a hill is in the way. Without this the
   * player's own machine disappears behind terrain, which is exactly what the
   * accepted Rig Lab 01 screenshot shows happening behind a tree.
   */
  private updateCamera(
    state: GameState,
    delta: number,
    profile: ReturnType<typeof effectiveProfile>,
  ): void {
    const rig = state.rigs[state.activeRigId];
    const parts = this.rigs.get(rig.id);
    if (!parts) {
      throw new Error(`Missing rendered rig for camera: ${rig.id}`);
    }
    parts.root.updateWorldMatrix(true, true);
    const feedback = deriveRigFeedback(
      rig,
      profile,
      this.reducedMotionQuery.matches,
    );
    const chasePolicy = chaseViewportPolicy(
      this.camera.aspect,
      profile.camera.chaseDistance,
      profile.track,
    );
    const narrow = chasePolicy.narrow;
    const forward = new THREE.Vector3(
      Math.sin(rig.heading),
      0,
      Math.cos(rig.heading),
    );
    const right = new THREE.Vector3(forward.z, 0, -forward.x);

    const focus = new THREE.Vector3(
      rig.x,
      rig.y +
        (state.cameraMode === "chase" ||
        state.cameraMode === "hood" ||
        state.cameraMode === "side"
          ? profile.camera.focusHeight
          : 0.8),
      rig.z,
    );
    this.lastCameraFocusY = focus.y;

    let desired: THREE.Vector3;
    let target: THREE.Vector3;

    if (state.cameraMode === "chase") {
      // Portrait has far less horizontal field of view. Pulling back 2.5× keeps
      // broad machines (and future articulated silhouettes) inside the safe
      // column between the field kit and touch controls. The policy remains
      // profile-scaled rather than branching on a rig id.
      const distance = profile.camera.chaseDistance * chasePolicy.distanceScale;
      const height = profile.camera.chaseHeight * chasePolicy.heightScale;
      const side = profile.camera.chaseSide * chasePolicy.sideScale;
      desired = new THREE.Vector3(rig.x, rig.y + height, rig.z)
        .addScaledVector(forward, -distance)
        .add(
          new THREE.Vector3(side, 0, 0).applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            rig.heading,
          ),
        );
      target = focus
        .clone()
        .addScaledVector(forward, 4 + feedback.cameraForwardLook)
        .addScaledVector(right, feedback.cameraLateralLook);
      target.y -= chasePolicy.targetDrop;
    } else if (state.cameraMode === "hood") {
      // The silhouette owns a named socket. A shared focus-relative offset put
      // Torque's camera inside its hood and could never describe the much lower
      // buggy or forward-cab skimmer honestly.
      const mount = RIG_HOOD_CAMERA_MOUNTS[rig.id];
      desired = parts.hoodCameraSocket.getWorldPosition(new THREE.Vector3());
      target = desired.clone().addScaledVector(forward, mount.lookDistance);
      target.y -= mount.lookDrop;
    } else if (state.cameraMode === "side") {
      // A readable inspection/action view that exposes suspension, attachments,
      // and towing without encoding any particular vehicle class.
      desired = focus
        .clone()
        .addScaledVector(right, narrow ? 13 : 11)
        .addScaledVector(forward, -2)
        .add(new THREE.Vector3(0, narrow ? 5.8 : 4.8, 0));
      target = focus.clone().addScaledVector(forward, 2.5);
    } else if (state.cameraMode === "tactical") {
      desired = new THREE.Vector3(
        rig.x,
        rig.y + (narrow ? 34 : 27),
        rig.z,
      ).addScaledVector(forward, -3);
      target = focus;
    } else if (state.cameraMode === "top-down") {
      // Exact overhead composition keeps the active rig centered and rotates
      // screen-up with its heading. This is a policy, not a wheel/ground special
      // case, so aerial and space rigs can reuse it through bounded adapters.
      desired = new THREE.Vector3(rig.x, rig.y + (narrow ? 48 : 40), rig.z);
      target = focus;
    } else {
      // Survey: a high, pulled-back vantage for reading the land and planning a
      // route. Distinct from tactical, which stays close for manoeuvring.
      desired = new THREE.Vector3(
        rig.x,
        rig.y + (narrow ? 78 : 64),
        rig.z,
      ).addScaledVector(forward, -46);
      target = focus;
    }

    const idealDesired = desired.clone();
    const fullSceneQuery =
      state.cameraMode === "chase" || state.cameraMode === "side";
    let obstruction: CameraObstructionHit | null = null;
    let finalPathHit: CameraObstructionHit | null = null;

    if (state.cameraMode !== "hood") {
      const queryOptions = {
        includeObstacles: fullSceneQuery,
        includeStructures: fullSceneQuery,
      };
      const queryCandidate = (candidate: THREE.Vector3) =>
        this.world.cameraObstruction(focus, candidate, 0.45, queryOptions);
      const pullBeforeHit = (
        candidate: THREE.Vector3,
        hit: CameraObstructionHit,
      ) => {
        const length = Math.max(0.001, focus.distanceTo(candidate));
        return focus
          .clone()
          .lerp(candidate, Math.max(0, hit.fraction - 0.55 / length));
      };

      obstruction = queryCandidate(desired);
      if (obstruction) {
        desired = pullBeforeHit(desired, obstruction);
        const minimumResolvedDistance =
          state.cameraMode === "chase"
            ? chasePolicy.minimumReadableDistance
            : 2.8;
        if (focus.distanceTo(desired) < minimumResolvedDistance) {
          // When the rig starts almost against a wall there is no usable boom
          // between focus and obstruction. Choose a deterministic shoulder/high
          // fallback rather than placing the near plane inside the rig.
          const sideDistance = Math.max(5, profile.track * 2);
          const wideSideDistance = Math.max(9, profile.track * 3.4);
          const fallbackCandidates = [
            focus
              .clone()
              .addScaledVector(right, wideSideDistance)
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 5.2, 0)),
            focus
              .clone()
              .addScaledVector(right, -wideSideDistance)
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 5.2, 0)),
            focus
              .clone()
              .addScaledVector(right, sideDistance)
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 3.2, 0)),
            focus
              .clone()
              .addScaledVector(right, -sideDistance)
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 3.2, 0)),
            focus
              .clone()
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 6.5, 0)),
          ];
          for (const candidate of fallbackCandidates) {
            candidate.y = Math.max(
              candidate.y,
              this.world.terrain.height(candidate.x, candidate.z) + 2.4,
            );
            if (!queryCandidate(candidate)) {
              desired = candidate;
              break;
            }
          }
        }
      }

      // Also lift clear of the ground so a pulled-in camera does not end up
      // inside the same hill it was avoiding.
      desired.y = Math.max(
        desired.y,
        this.world.terrain.height(desired.x, desired.z) +
          (obstruction ? 2.4 : 2),
      );
    }

    const cameraModeChanged =
      this.lastCameraMode !== null && this.lastCameraMode !== state.cameraMode;
    const focusTeleported =
      this.lastCameraFocus !== null &&
      this.lastCameraFocus.distanceTo(focus) > 8;
    const cameraDiscontinuity =
      this.cameraRigId !== rig.id ||
      cameraModeChanged ||
      focusTeleported ||
      this.camera.position.distanceTo(desired) > 70;
    const desiredDistance = focus.distanceTo(desired);
    const currentDistance = focus.distanceTo(this.camera.position);
    const needsImmediatePullIn =
      obstruction !== null && currentDistance > desiredDistance + 0.08;
    if (
      !this.cameraInitialised ||
      cameraDiscontinuity ||
      needsImmediatePullIn
    ) {
      this.camera.position.copy(desired);
      this.cameraInitialised = true;
    } else {
      const blend =
        state.cameraMode === "chase"
          ? 1 - Math.exp(-6 * delta)
          : 1 - Math.exp(-3.5 * delta);
      this.camera.position.lerp(desired, blend);
    }

    // A smoothed camera can still sweep through a nearer prop even when its
    // endpoint is valid. Re-query the actual candidate and pull inward
    // immediately; outward recovery remains smoothed above.
    if (state.cameraMode !== "hood") {
      const smoothedHit = this.world.cameraObstruction(
        focus,
        this.camera.position,
        0.45,
        {
          includeObstacles: fullSceneQuery,
          includeStructures: fullSceneQuery,
        },
      );
      if (smoothedHit) {
        const length = Math.max(0.001, focus.distanceTo(this.camera.position));
        const safeFraction = Math.max(0, smoothedHit.fraction - 0.55 / length);
        this.camera.position.lerpVectors(
          focus,
          this.camera.position,
          safeFraction,
        );
        obstruction = obstruction ?? smoothedHit;
      }

      // Endpoint and boom checks can both be valid while an obstruction leaves
      // too little room for the rig itself. Enforce the final composition
      // invariant at the boundary that actually renders: select a clear,
      // elevated rear shoulder rather than accepting a camera inside the cab.
      const minimumRigClearance =
        state.cameraMode === "chase"
          ? Math.max(
              3.2,
              profile.track * 1.35,
              chasePolicy.minimumReadableDistance,
            )
          : Math.max(3.2, profile.track * 1.35);
      if (focus.distanceTo(this.camera.position) < minimumRigClearance) {
        const emergencySide = narrow
          ? Math.max(10, profile.track * 3.6)
          : Math.max(6, profile.track * 2.5);
        const emergencyBack = narrow ? -4 : -0.5;
        const emergencyHeight = narrow ? 11 : 12;
        const emergencyCandidates = [
          focus
            .clone()
            .addScaledVector(right, emergencySide)
            .addScaledVector(forward, emergencyBack)
            .add(new THREE.Vector3(0, emergencyHeight, 0)),
          focus
            .clone()
            .addScaledVector(right, -emergencySide)
            .addScaledVector(forward, emergencyBack)
            .add(new THREE.Vector3(0, emergencyHeight, 0)),
          focus
            .clone()
            .addScaledVector(forward, narrow ? -9 : -4)
            .add(new THREE.Vector3(0, narrow ? 16 : 14, 0)),
        ];
        for (const candidate of emergencyCandidates) {
          candidate.y = Math.max(
            candidate.y,
            this.world.terrain.height(candidate.x, candidate.z) + 3,
          );
          const candidateHit = this.world.cameraObstruction(
            focus,
            candidate,
            0.45,
            {
              includeObstacles: fullSceneQuery,
              includeStructures: fullSceneQuery,
            },
          );
          if (!candidateHit) {
            this.camera.position.copy(candidate);
            break;
          }
        }
      }

      finalPathHit = this.world.cameraObstruction(
        focus,
        this.camera.position,
        0.45,
        {
          includeObstacles: fullSceneQuery,
          includeStructures: fullSceneQuery,
        },
      );
    }
    this.cameraRigId = rig.id;
    this.lastCameraMode = state.cameraMode;
    this.lastCameraFocus = focus.clone();

    if (this.shake > 0.001) {
      this.shake = Math.max(0, this.shake - delta * 2.6);
      const magnitude = this.shake * 0.42;
      const phase = performance.now() * 0.045;
      this.camera.position.x += Math.sin(phase) * magnitude;
      this.camera.position.y += Math.sin(phase * 1.7) * magnitude * 0.7;
    }

    // Speed opens the field of view slightly; reduced-motion removes the
    // presentation-only expansion while retaining the chosen camera policy.
    const targetFov =
      state.cameraMode === "chase"
        ? 52 + feedback.speedFovBoost
        : state.cameraMode === "hood"
          ? 64 + feedback.speedFovBoost * 0.625
          : state.cameraMode === "side"
            ? 48
            : state.cameraMode === "top-down"
              ? 46
              : 52;
    if (Math.abs(this.camera.fov - targetFov) > 0.05) {
      this.camera.fov +=
        (targetFov - this.camera.fov) * (1 - Math.exp(-4 * delta));
      this.camera.updateProjectionMatrix();
    }

    if (state.cameraMode === "top-down") {
      this.camera.up.copy(forward);
    } else {
      this.camera.up.set(0, 1, 0);
    }
    this.camera.lookAt(target);
    this.sky.position.copy(this.camera.position);

    const selfIntersectionPart = this.rigIntersectionPart(
      parts,
      this.camera.position,
    );
    const cameraForwardOffset = this.camera.position
      .clone()
      .sub(focus)
      .dot(forward);
    const resolvedDistance = Number(
      focus.distanceTo(this.camera.position).toFixed(3),
    );
    const minimumReadableDistance =
      state.cameraMode === "chase"
        ? Number(chasePolicy.minimumReadableDistance.toFixed(3))
        : 0;
    this.cameraResolution = {
      rigId: rig.id,
      mode: state.cameraMode,
      obstructionSource: obstruction?.source ?? null,
      obstructionId: obstruction?.id ?? null,
      idealDistance: Number(focus.distanceTo(idealDesired).toFixed(3)),
      resolvedDistance,
      minimumReadableDistance,
      readableComposition:
        finalPathHit === null &&
        selfIntersectionPart === null &&
        resolvedDistance + 0.01 >= minimumReadableDistance,
      forwardOffset: Number(cameraForwardOffset.toFixed(3)),
      behindRig: cameraForwardOffset < -0.05,
      pathClear: finalPathHit === null,
      selfIntersecting: selfIntersectionPart !== null,
      selfIntersectionPart,
    };
  }

  private rigIntersectionPart(
    parts: RigParts,
    worldPoint: THREE.Vector3,
  ): string | null {
    let intersectionPart: string | null = null;
    parts.root.traverse((object) => {
      if (
        intersectionPart ||
        !(object instanceof THREE.Mesh) ||
        !object.visible ||
        object.userData.cameraSolid === false
      ) {
        return;
      }
      const geometry = object.geometry;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      if (!geometry.boundingBox) return;
      const localPoint = object.worldToLocal(worldPoint.clone());
      if (
        geometry.boundingBox
          .clone()
          // The camera point can be outside a mesh while the 0.25 m near plane
          // still slices it into a screen-filling black polygon. Reserve a
          // little more than the near distance as the usable-view contract.
          .expandByScalar(0.35)
          .containsPoint(localPoint)
      ) {
        intersectionPart =
          object.name ||
          `${object.geometry.type}@${object.position.x.toFixed(2)},${object.position.y.toFixed(2)},${object.position.z.toFixed(2)}`;
      }
    });
    return intersectionPart;
  }

  cameraEvidence(): CameraResolutionEvidence {
    if (!this.cameraResolution) {
      throw new Error(
        "Camera evidence is unavailable before the first render.",
      );
    }
    return { ...this.cameraResolution };
  }

  runtimeBridgeEvidenceFor(assetId: string): RuntimeAssetBridgeEvidence {
    const evidence = this.runtimeBridgeEvidence.get(assetId);
    if (!evidence) {
      throw new Error(`Missing runtime bridge evidence: ${assetId}`);
    }
    return { ...evidence };
  }

  runtimeBridgeEvidenceList(): RuntimeAssetBridgeEvidence[] {
    return this.runtimeBridgeSpecs.map((spec) =>
      this.runtimeBridgeEvidenceFor(spec.assetId),
    );
  }

  /**
   * Switch only the visibility budget for already-created instanced props.
   *
   * This cannot alter world, input, or simulation state. Rebuilding immediately
   * keeps the reported active profile and the actual submitted prop set aligned.
   */
  setVisibilityProfile(
    profileId: VisibilityProfileId,
    state: GameState,
  ): boolean {
    if (profileId === this.activeVisibilityProfileId) return false;
    this.activeVisibilityProfileId = profileId;
    this.propAnchorX = Number.POSITIVE_INFINITY;
    this.propAnchorZ = Number.POSITIVE_INFINITY;
    this.refreshProps(state);
    return true;
  }

  metrics(): {
    drawCalls: number;
    triangles: number;
    geometries: number;
    textures: number;
    terrainBuildMs: number;
    visibility: PropVisibilityMetrics;
    gpuMemoryMb: number;
    rendererBackend: RendererBackend;
    rendererRequestedBackend: RendererBackendRequest;
    rendererBackendFallback: boolean;
    rendererBackendReason: string;
  } {
    return {
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      geometries: this.renderer.info.memory.geometries,
      textures: this.renderer.info.memory.textures,
      terrainBuildMs: Number(this.terrainBuildMs.toFixed(1)),
      visibility: { ...this.propVisibility },
      gpuMemoryMb: this.estimateGpuMemoryMb(),
      rendererBackend: this.rendererBackend,
      rendererRequestedBackend: this.rendererRequestedBackend,
      rendererBackendFallback: this.rendererBackendFallback,
      rendererBackendReason: this.rendererBackendReason,
    };
  }

  /**
   * Estimate GPU memory usage in MB based on renderer info.
   * Formula: geometries * ~1KB + textures * ~4MB (assuming 1024x1024 RGBA)
   */
  private estimateGpuMemoryMb(): number {
    const { geometries, textures } = this.renderer.info.memory;
    const estimatedBytes = geometries * 1024 + textures * 1024 * 1024 * 4;
    return Number((estimatedBytes / (1024 * 1024)).toFixed(1));
  }

  /**
   * Prove that the rendered nose is on the same side of the rig as simulated
   * forward travel. This uses visible model parts—not duplicate authored
   * coordinates—so browser acceptance catches a future mesh built backwards.
   */
  orientationEvidence(state: GameState, rigId: RigId): RigOrientationEvidence {
    const rig = state.rigs[rigId];
    const parts = this.rigs.get(rigId);
    if (!parts) {
      throw new Error(`Missing rendered rig: ${rigId}`);
    }

    parts.root.updateWorldMatrix(true, true);
    const front = parts.frontMarker.getWorldPosition(new THREE.Vector3());
    const rear = parts.rearMarker.getWorldPosition(new THREE.Vector3());
    const forward = new THREE.Vector3(
      Math.sin(rig.heading),
      0,
      Math.cos(rig.heading),
    );
    const frontAlongHeading = front.sub(rear).dot(forward);

    return {
      rigId,
      heading: Number(rig.heading.toFixed(4)),
      frontAlongHeadingMetres: Number(frontAlongHeading.toFixed(3)),
      visualFrontIsForward: frontAlongHeading > 0,
    };
  }

  /**
   * Expose presentation evidence without making rendered transforms game truth.
   * Browser acceptance uses this to prove that simulation telemetry reaches
   * animation/camera and that the operating-system motion preference is honored.
   */
  perceptionEvidence(state: GameState, rigId: RigId): RigPerceptionEvidence {
    const rig = state.rigs[rigId];
    const parts = this.rigs.get(rigId);
    if (!parts) throw new Error(`Missing rendered rig parts: ${rigId}`);
    const profile = effectiveProfile(rig.id, rig.modules);
    const feedback =
      this.feedbackFrames.get(rigId) ??
      deriveRigFeedback(rig, profile, this.reducedMotionQuery.matches);
    const expectedFocusOffset =
      state.cameraMode === "chase" ||
      state.cameraMode === "hood" ||
      state.cameraMode === "side"
        ? profile.camera.focusHeight
        : 0.8;
    const cameraFocusOffset =
      state.activeRigId === rigId && this.lastCameraFocusY !== null
        ? this.lastCameraFocusY - rig.y
        : null;

    return {
      rigId,
      reducedMotion: this.reducedMotionQuery.matches,
      steeringAngle: Number(feedback.steeringAngle.toFixed(4)),
      bodyRollOffset: Number(feedback.bodyRollOffset.toFixed(4)),
      bodyPitchOffset: Number(feedback.bodyPitchOffset.toFixed(4)),
      speedFovBoost: Number(feedback.speedFovBoost.toFixed(3)),
      cameraFocusOffset:
        cameraFocusOffset === null
          ? null
          : Number(cameraFocusOffset.toFixed(4)),
      expectedFocusOffset: Number(expectedFocusOffset.toFixed(4)),
      cameraFocusContractMet:
        cameraFocusOffset !== null &&
        Math.abs(cameraFocusOffset - expectedFocusOffset) < 0.001,
      visibleModules: Object.entries(parts.moduleVisuals)
        .filter(([, visuals]) => visuals.some((visual) => visual.visible))
        .map(([moduleId]) => moduleId as ModuleId),
    };
  }

  /** Force a full prop and furrow rebuild, after a reset or a save restore. */
  invalidate(state: GameState): void {
    this.renderedFurrows = 0;
    this.lastDeformCount = -1;
    this.propAnchorX = Number.POSITIVE_INFINITY;
    this.propAnchorZ = Number.POSITIVE_INFINITY;
    this.refreshProps(state);
    this.rebuildTerrainHeights();
  }

  /** Re-sample the whole terrain mesh. Used after a reset clears deformation. */
  private rebuildTerrainHeights(): void {
    const size = this.terrainCells + 1;
    const position = this.terrainMesh.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    this.terrainHeights = this.world.terrain.sampleHeightGrid(
      this.terrainOrigin,
      this.terrainOrigin,
      this.terrainCells,
      TERRAIN_STEP,
    );
    for (let index = 0; index < size * size; index += 1) {
      position.setY(index, this.terrainHeights[index]!);
    }
    position.needsUpdate = true;
    this.terrainMesh.geometry.computeVertexNormals();
  }

  dispose(): void {
    window.removeEventListener("resize", this.resize);
    // Dispose runtime bridge assets (GLTF models)
    this.runtimeBridgeEvidence.forEach((evidence) => {
      if (evidence.status === "loaded") {
        // The GLTFLoader creates meshes that need disposal
        // We can't easily access them here without storing references,
        // but the renderer.dispose() below will clean up the WebGL resources.
      }
    });
    this.renderer.dispose();
  }
}
