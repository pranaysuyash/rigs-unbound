import * as THREE from "three";
import type { Obstacle } from "../collision";
import {
  felledTrunkLength,
  rockVisualHalfHeight,
  treeCrownCenterY,
  treeCrownRadius,
  treeTrunkHeight,
} from "../collision";
import type { SalvageNode } from "../exploration";
import type { GameWorld } from "../gameworld";
import { createPbrMaterial } from "../pbr-materials";
import {
  classifyVisibility,
  createPropVisibilityMetrics,
  recordVisibilityCandidate,
  visibilityProfile,
  type PropVisibilityMetrics,
  type VisibilityProfileId,
} from "../visibility";
import { WATER_LEVEL } from "../world";

const MAX_TREE_INSTANCES = 900;
const MAX_ROCK_INSTANCES = 700;
const MAX_FELLED_INSTANCES = 220;
const MAX_NODE_INSTANCES = 260;
const MAX_GRASS_INSTANCES = 1200;

/** Renderer-owned services the props presenter needs at rebuild time. */
export interface PropsPresenterDeps {
  readonly world: GameWorld;
  profileId: () => VisibilityProfileId;
  cameraReady: () => boolean;
  cameraPosition: () => THREE.Vector3;
  occludedByTerrain: (x: number, y: number, z: number) => boolean;
}

function material(
  color: number,
  roughness = 0.76,
  metalness = 0.08,
): THREE.MeshPhysicalMaterial {
  return createPbrMaterial(color, {
    roughness,
    metalness,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
    type: "metal",
  });
}

/**
 * Owns every instanced scenery mesh: tree trunks/crowns/billboards, rocks and
 * rock billboards, felled trunks, salvage nodes, and grass tufts. Extracted
 * from GameRenderer (ADR-0054 unit 3). Instancing discipline invariant: each
 * category remains a single draw call regardless of instance count.
 */
export class PropsPresenter {
  private treeTrunks!: THREE.InstancedMesh;
  private treeCrowns!: THREE.InstancedMesh;
  private treeBillboards!: THREE.InstancedMesh;
  private treeBillboardCount = 0;
  private rocks!: THREE.InstancedMesh;
  private rockBillboards!: THREE.InstancedMesh;
  private rockBillboardCount = 0;
  private felledTrunks!: THREE.InstancedMesh;
  private salvageNodes!: THREE.InstancedMesh;
  private grassTufts!: THREE.InstancedMesh;

  private readonly dummy = new THREE.Object3D();
  private readonly billboardDirection = new THREE.Vector3();
  private readonly billboardDefaultNormal = new THREE.Vector3(0, 0, 1);
  private anchorX = Number.POSITIVE_INFINITY;
  private anchorZ = Number.POSITIVE_INFINITY;
  private propVisibility: PropVisibilityMetrics = createPropVisibilityMetrics();

  constructor(
    scene: THREE.Scene,
    private readonly deps: PropsPresenterDeps,
  ) {
    const barkMat = createPbrMaterial(0x523d2b, {
      roughness: 0.94,
      metalness: 0.02,
      type: "bark",
    });
    this.treeTrunks = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.24, 0.42, 1, 8),
      barkMat,
      MAX_TREE_INSTANCES,
    );

    const foliageMat = createPbrMaterial(0x3e5e26, {
      roughness: 0.82,
      metalness: 0.04,
      type: "foliage",
    });
    this.treeCrowns = new THREE.InstancedMesh(
      new THREE.DodecahedronGeometry(1, 1),
      foliageMat,
      MAX_TREE_INSTANCES,
    );

    const rockMat = createPbrMaterial(0x65615a, {
      roughness: 0.88,
      metalness: 0.12,
      type: "rock",
    });
    this.rocks = new THREE.InstancedMesh(
      new THREE.DodecahedronGeometry(1, 0),
      rockMat,
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

    const grassMat = createPbrMaterial(0x426829, {
      roughness: 0.88,
      metalness: 0.02,
      type: "foliage",
    });
    this.grassTufts = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.32, 0.65, 3),
      grassMat,
      MAX_GRASS_INSTANCES,
    );
    this.grassTufts.count = 0;

    /*
     * These dynamic clouds are rebuilt around the active rig. Geometry-only
     * bounds do not include the per-instance transforms, so they can cull
     * visible scenery. Keep culling disabled until refresh computes a
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
      this.grassTufts,
    ]) {
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
  }

  get anchorXValue(): number {
    return this.anchorX;
  }

  get anchorZValue(): number {
    return this.anchorZ;
  }

  /** Force the next refresh regardless of travel distance. */
  resetAnchor(): void {
    this.anchorX = Number.POSITIVE_INFINITY;
    this.anchorZ = Number.POSITIVE_INFINITY;
  }

  snapshotVisibility(): PropVisibilityMetrics {
    return { ...this.propVisibility };
  }

  /**
   * Rebuild prop instances around the rig.
   *
   * Called only when the rig has travelled `PROP_REBUILD_DISTANCE`, because
   * regenerating the obstacle field is a hash-and-sample loop and not something to
   * run per frame.
   */
  refresh(rigX: number, rigZ: number): PropVisibilityMetrics {
    const { world } = this.deps;
    const profile = visibilityProfile(this.deps.profileId());
    const propRadius = profile.farMeters;
    const obstacles = [
      ...world.obstacles.near(rigX, rigZ, propRadius),
      ...world.incidentObstaclesNear(rigX, rigZ, propRadius),
    ];
    const nodes = world.exploration.nodesNear(
      rigX,
      rigZ,
      propRadius,
      world.collectedNodes,
    );
    const visibility = createPropVisibilityMetrics(profile);
    const tierFor = (x: number, z: number) => {
      const tier = classifyVisibility(Math.hypot(x - rigX, z - rigZ), profile);
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
      const down = world.felledObstacles.has(obstacle.id);
      const groundY = world.terrain.height(obstacle.x, obstacle.z);
      // Terrain occlusion: skip instances hidden behind hills from camera.
      const testY = down
        ? groundY + felledTrunkLength(obstacle) * 0.5
        : obstacle.kind === "tree"
          ? groundY + treeTrunkHeight(obstacle) * 0.5
          : groundY + obstacle.radius * 0.35;
      if (this.deps.occludedByTerrain(obstacle.x, testY, obstacle.z)) {
        visibility.occluded += 1;
        continue;
      }
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
      const scale = 0.8 + node.variation * 0.4;
      const testY = node.groundY + scale * 0.5;
      if (this.deps.occludedByTerrain(node.x, testY, node.z)) {
        visibility.occluded += 1;
        continue;
      }
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

    // Scatter natural instanced grass tufts across pasture elevations
    let grassCount = 0;
    for (let i = 0; i < MAX_GRASS_INSTANCES; i++) {
      const angle = i * 2.399963;
      const radius =
        2.5 + Math.sqrt(i / MAX_GRASS_INSTANCES) * (propRadius * 0.85);
      const gx = rigX + Math.cos(angle) * radius + ((i * 13) % 7) - 3.5;
      const gz = rigZ + Math.sin(angle) * radius + ((i * 17) % 7) - 3.5;
      const gy = world.terrain.height(gx, gz);
      if (gy <= WATER_LEVEL + 0.2) continue;
      this.dummy.position.set(gx, gy + 0.32, gz);
      const scale = 0.75 + ((i * 31) % 10) * 0.08;
      this.dummy.scale.set(scale, scale * (0.8 + ((i * 11) % 5) * 0.1), scale);
      this.dummy.rotation.set(0, angle + (i % 4), 0);
      this.dummy.updateMatrix();
      this.grassTufts.setMatrixAt(grassCount, this.dummy.matrix);
      grassCount++;
    }
    this.grassTufts.count = grassCount;
    this.grassTufts.instanceMatrix.needsUpdate = true;

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

    this.anchorX = rigX;
    this.anchorZ = rigZ;
    this.propVisibility = visibility;

    // Compute aggregate bounds for frustum culling and enable it.
    this.computeAndSetInstanceBounds(this.treeTrunks, trees);
    this.computeAndSetInstanceBounds(this.treeCrowns, trees);
    this.computeAndSetInstanceBounds(this.rocks, rocks);
    this.computeAndSetInstanceBounds(this.felledTrunks, felled);
    this.computeAndSetInstanceBounds(this.salvageNodes, nodeCount);
    if (this.treeBillboards !== undefined) {
      this.computeAndSetInstanceBounds(
        this.treeBillboards,
        this.treeBillboardCount,
      );
    }
    if (this.rockBillboards !== undefined) {
      this.computeAndSetInstanceBounds(
        this.rockBillboards,
        this.rockBillboardCount,
      );
    }
    return visibility;
  }

  /**
   * Compute an aggregate bounding sphere from the active instance matrices and
   * enable frustum culling. InstancedMesh uses the base geometry bounds by
   * default, which do not reflect the actual instance spread. This must be
   * called after every rebuild so the renderer can skip off-screen meshes.
   */
  private computeAndSetInstanceBounds(
    mesh: THREE.InstancedMesh,
    count: number,
  ): void {
    if (count === 0) {
      mesh.boundingSphere = null;
      mesh.frustumCulled = false;
      return;
    }
    const sphere = new THREE.Sphere();
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    for (let i = 0; i < count; i += 1) {
      mesh.getMatrixAt(i, matrix);
      position.setFromMatrixPosition(matrix);
      if (position.x < minX) minX = position.x;
      if (position.y < minY) minY = position.y;
      if (position.z < minZ) minZ = position.z;
      if (position.x > maxX) maxX = position.x;
      if (position.y > maxY) maxY = position.y;
      if (position.z > maxZ) maxZ = position.z;
    }

    const centerX = (minX + maxX) * 0.5;
    const centerY = (minY + maxY) * 0.5;
    const centerZ = (minZ + maxZ) * 0.5;
    sphere.center.set(centerX, centerY, centerZ);

    const dx = maxX - centerX;
    const dy = maxY - centerY;
    const dz = maxZ - centerZ;
    sphere.radius = Math.hypot(dx, dy, dz) + 1.0; // padding for scale

    mesh.boundingSphere = sphere;
    mesh.frustumCulled = true;
  }

  /**
   * Orient `this.dummy` so its +Z face normal points at the camera's actual
   * 3D position — full spherical billboarding, not just a horizontal (yaw)
   * facing.
   *
   * A yaw-only facing (rotate around Y so the plane "faces" the camera's
   * horizontal bearing) still stands the plane vertical. That reads fine
   * from a roughly-horizontal camera (Chase, Hood, Side) but is geometrically
   * useless against a steep overhead camera (Tactical, Top-down): a vertical
   * plane's cross-section viewed from above is a thin line no matter which
   * way it yaws, because yaw only rotates around the one axis the overhead
   * camera is looking straight down. Facing the true camera vector — pitch
   * included — is what actually keeps the flat LOD impostor looking like a
   * canopy/rock blob instead of a floating stick from every camera mode.
   *
   * Far-tier LOD billboards are rebuilt only when the rig moves (not every
   * frame), so this is a per-rebuild approximation rather than true
   * per-frame billboarding — sufficient here since the "far" tier is by
   * definition distant scenery, not something the camera sits on top of.
   */
  private faceBillboardAtCamera(x: number, y: number, z: number): void {
    const cam = this.deps.cameraPosition();
    this.billboardDirection.set(cam.x - x, cam.y - y, cam.z - z).normalize();
    this.dummy.quaternion.setFromUnitVectors(
      this.billboardDefaultNormal,
      this.billboardDirection,
    );
  }

  private placeTree(obstacle: Obstacle, index: number): void {
    const trunkHeight = treeTrunkHeight(obstacle);
    // Re-ground on the live height field rather than the cached groundY so trees
    // stay correctly positioned after plough deformation changes the terrain.
    const groundY = this.deps.world.terrain.height(obstacle.x, obstacle.z);
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
      Math.hypot(obstacle.x - this.anchorX, obstacle.z - this.anchorZ),
      visibilityProfile(this.deps.profileId()),
    );
    if (
      tier === "far" &&
      this.treeBillboards !== undefined &&
      this.treeBillboardCount < MAX_TREE_INSTANCES
    ) {
      const billboardY = treeCrownCenterY(obstacle);
      this.dummy.position.set(obstacle.x, billboardY, obstacle.z);
      this.faceBillboardAtCamera(obstacle.x, billboardY, obstacle.z);
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
    const groundY = this.deps.world.terrain.height(obstacle.x, obstacle.z);
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
      Math.hypot(obstacle.x - this.anchorX, obstacle.z - this.anchorZ),
      visibilityProfile(this.deps.profileId()),
    );
    if (
      tier === "far" &&
      this.rockBillboards !== undefined &&
      this.rockBillboardCount < MAX_ROCK_INSTANCES
    ) {
      const halfHeight = rockVisualHalfHeight(obstacle);
      const billboardY = obstacle.groundY + halfHeight;
      this.dummy.position.set(obstacle.x, billboardY, obstacle.z);
      this.faceBillboardAtCamera(obstacle.x, billboardY, obstacle.z);
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

  /** Release GPU resources owned exclusively by this presenter. */
  dispose(): void {
    if (this.grassTufts) {
      this.grassTufts.geometry.dispose();
      (this.grassTufts.material as THREE.Material).dispose();
    }
  }
}
