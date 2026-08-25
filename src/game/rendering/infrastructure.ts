import * as THREE from "three";
import type { GameState } from "../contracts";
import type { GameWorld } from "../gameworld";
import {
  INFRASTRUCTURE_DEFINITIONS,
  INFRASTRUCTURE_ENTITY_IDS,
  infrastructureIsOperating,
} from "../infrastructure-network";
import { deriveSettlementCommunityPassageIds } from "../settlement-needs";
import { SETTLEMENT_MATERIAL_EFFECTS } from "../settlement-material-effects";
import { SETTLEMENT_CARGO_MANIFESTS } from "../settlement-cargo";
import { findSite, RESOLVED_COMMUNITY_PASSAGES } from "../world";
import { box, COLORS, cylinder, material } from "./primitives";

/** Parts bundle for an animated infrastructure machine prop. */
interface InfrastructurePropParts {
  root: THREE.Group;
  activity: THREE.Object3D;
  beacon: THREE.Mesh;
}

/**
 * Owns authored infrastructure machines (waterworks, pump, pylon), settlement
 * cargo bays, community traffic vehicles, and the decorative deck boards and
 * rails of restored community passages. Extracted from GameRenderer
 * (ADR-0054 unit 6). Terrain remains the sole authority for route truth;
 * these are readable presentations re-sampled from it.
 */
export class InfrastructurePresenter {
  private readonly infrastructureProps = new Map<
    string,
    InfrastructurePropParts
  >();
  private readonly communityPassageDecks = new Map<string, THREE.Group>();

  constructor(
    private readonly scene: THREE.Scene,
    private readonly world: GameWorld,
  ) {}

  /** Ground a group at the terrain height of its own position. */
  private groundAt(group: THREE.Object3D, x: number, z: number): void {
    group.position.set(x, this.world.terrain.height(x, z), z);
  }

  /**
   * Build compact, authored machine silhouettes from canonical infrastructure
   * definitions. Visible mesh is not collision authority.
   */
  buildInfrastructureProps(): void {
    for (const id of INFRASTRUCTURE_ENTITY_IDS) {
      const definition = INFRASTRUCTURE_DEFINITIONS[id];
      const root = new THREE.Group();
      root.name = `infrastructure:${id}`;
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 8, 6),
        new THREE.MeshBasicMaterial({ color: COLORS.gold }),
      );
      let activity: THREE.Object3D;

      if (id === "sunken-flats-waterworks") {
        const deck = box(8.2, 0.38, 3.6, 0x63584b);
        deck.position.set(0, 0.19, 0);
        const channel = box(7.1, 1.15, 0.58, 0x3f535e);
        channel.position.set(0, 0.76, -0.78);
        const catwalk = box(7.7, 0.18, 0.72, 0x875e3c);
        catwalk.position.set(0, 2.25, 0.48);
        const axle = new THREE.Group();
        for (const offset of [-2.35, 0, 2.35]) {
          const pillar = box(0.64, 2.7, 0.72, 0x6d7379);
          pillar.position.set(offset, 1.35, -0.78);
          const rotor = new THREE.Mesh(
            new THREE.TorusGeometry(0.46, 0.09, 6, 12),
            material(0xb6a88e, 0.48, 0.56),
          );
          rotor.rotation.y = Math.PI / 2;
          rotor.position.set(offset, 1.48, 0.58);
          axle.add(pillar, rotor);
        }
        const intake = cylinder(0.18, 0.22, 6.3, 8, 0x536c72);
        intake.rotation.z = Math.PI / 2;
        intake.position.set(0, 0.66, 1.1);
        beacon.position.set(0, 2.78, 0.48);
        root.add(deck, channel, catwalk, axle, intake, beacon);
        activity = axle;
      } else if (id === "long-furrow-drain-pump") {
        const pad = box(5.6, 0.38, 3.1, 0x514e47);
        pad.position.set(0, 0.19, 0);
        const housing = new THREE.Mesh(
          new THREE.CylinderGeometry(0.82, 0.94, 3.7, 10),
          material(0x9a4931, 0.62, 0.26),
        );
        housing.rotation.z = Math.PI / 2;
        housing.position.set(0, 1.15, 0);
        const intake = cylinder(0.22, 0.22, 3.2, 8, 0x6c777c);
        intake.rotation.z = Math.PI / 2;
        intake.position.set(2.3, 0.68, 0);
        const rotor = new THREE.Mesh(
          new THREE.TorusGeometry(0.68, 0.1, 6, 12),
          material(0xd9aa52, 0.42, 0.5),
        );
        rotor.rotation.y = Math.PI / 2;
        rotor.position.set(-1.95, 1.15, 0);
        beacon.position.set(0, 2.32, 0);
        root.add(pad, housing, intake, rotor, beacon);
        activity = rotor;
      } else {
        const pad = box(6.2, 0.42, 4.2, 0x4e4f4a);
        pad.position.set(0, 0.21, 0);
        const tower = box(0.74, 4.5, 0.74, 0x63717b);
        tower.position.set(-1.75, 2.25, 0);
        const boom = box(4.7, 0.42, 0.55, 0x8f6b42);
        boom.position.set(0.4, 4.15, 0);
        const drum = new THREE.Mesh(
          new THREE.CylinderGeometry(0.72, 0.72, 1.3, 10),
          material(0x9a4931, 0.58, 0.28),
        );
        drum.rotation.z = Math.PI / 2;
        drum.position.set(0.95, 3.55, 0);
        const hose = cylinder(0.2, 0.2, 3.1, 8, 0x536c72);
        hose.rotation.z = Math.PI / 2;
        hose.position.set(1.15, 0.75, 0.65);
        beacon.position.set(-1.75, 4.9, 0);
        root.add(pad, tower, boom, drum, hose, beacon);
        activity = drum;
      }

      this.groundAt(root, definition.x, definition.z);
      this.infrastructureProps.set(id, { root, activity, beacon });
      this.scene.add(root);
    }
  }

  /** Keep machine motion and status light strictly downstream of network state. */
  updateInfrastructureProps(state: GameState, delta: number): void {
    for (const id of INFRASTRUCTURE_ENTITY_IDS) {
      const parts = this.infrastructureProps.get(id);
      if (!parts) continue;
      const definition = INFRASTRUCTURE_DEFINITIONS[id];
      const entity = state.infrastructure.entities[id];
      const operating = infrastructureIsOperating(definition, entity);
      parts.activity.rotation.z += operating ? delta * 2.4 : delta * 0.08;
      (parts.beacon.material as THREE.MeshBasicMaterial).color.setHex(
        !entity.known ? COLORS.gold : operating ? COLORS.cyan : 0xe45b4f,
      );
    }
  }

  buildCommunityTraffic(): void {
    const group = new THREE.Group();
    group.name = "community-traffic";

    for (const effect of SETTLEMENT_MATERIAL_EFFECTS) {
      if (!effect.traffic) continue;
      const vehicle = new THREE.Group();
      vehicle.name = `community-traffic:${effect.id}`;
      vehicle.userData.trafficId = `community-traffic:${effect.id}`;
      vehicle.userData.trafficKind = effect.traffic.kind;
      vehicle.visible = false;

      if (effect.traffic.kind === "skiff") {
        const hull = box(2.65, 0.32, 1.05, COLORS.rust);
        hull.position.y = 0.26;
        const cargo = box(0.72, 0.38, 0.62, COLORS.bone);
        cargo.position.set(-0.3, 0.58, 0);
        const bow = new THREE.Mesh(
          new THREE.ConeGeometry(0.54, 0.9, 4),
          material(COLORS.rust, 0.7, 0.25),
        );
        bow.rotation.z = -Math.PI / 2;
        bow.position.set(1.52, 0.27, 0);
        vehicle.add(hull, cargo, bow);
      } else {
        const bed = box(2.4, 0.34, 1.08, 0x70513c);
        bed.position.y = 0.62;
        const load = box(1.05, 0.48, 0.74, COLORS.gold);
        load.position.set(-0.22, 1.02, 0);
        vehicle.add(bed, load);
        for (const x of [-0.78, 0.78]) {
          for (const z of [-0.64, 0.64]) {
            const wheel = new THREE.Mesh(
              new THREE.CylinderGeometry(0.34, 0.34, 0.18, 8),
              material(0x252321, 0.9, 0.08),
            );
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(x, 0.36, z);
            vehicle.add(wheel);
          }
        }
      }

      group.add(vehicle);
    }

    this.scene.add(group);
  }

  buildSettlementCargoBays(): void {
    const group = new THREE.Group();
    group.name = "settlement-cargo-bays";
    for (const manifest of SETTLEMENT_CARGO_MANIFESTS) {
      const origin = findSite(manifest.originSiteId);
      if (!origin) continue;
      const bay = new THREE.Group();
      bay.name = `settlement-cargo-bay:${manifest.id}`;
      bay.userData.manifestId = manifest.id;
      const x = origin.x + manifest.loadOffsetX;
      const z = origin.z + manifest.loadOffsetZ;
      const pallet = box(2.5, 0.18, 1.7, 0x6e5137);
      pallet.position.y = 0.1;
      const bundle = box(
        1.48,
        0.82,
        1.05,
        manifest.id === "sunken-causeway-kit" ? COLORS.cyan : COLORS.rust,
      );
      bundle.position.y = 0.58;
      const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 1.35, 6),
        material(COLORS.gold, 0.7, 0.22),
      );
      marker.position.set(0.92, 0.77, -0.52);
      bay.add(pallet, bundle, marker);
      this.groundAt(bay, x, z);
      group.add(bay);
    }
    this.scene.add(group);
  }

  /**
   * Terrain owns the actual raised route and all collision. These sparse deck
   * boards and rails only make a restored community causeway readable from the
   * driver's seat; their vertical placement is re-sampled from that terrain.
   */
  buildCommunityPassageDecks(): void {
    for (const passage of RESOLVED_COMMUNITY_PASSAGES) {
      const group = new THREE.Group();
      group.name = `community-passage:${passage.id}`;
      group.visible = false;

      const length = Math.hypot(
        passage.bx - passage.ax,
        passage.bz - passage.az,
      );
      const segments = Math.max(1, Math.ceil(length / 4));
      const directionX = length > 0 ? (passage.bx - passage.ax) / length : 0;
      const directionZ = length > 0 ? (passage.bz - passage.az) / length : 1;
      const heading = Math.atan2(directionX, directionZ);
      const segmentLength = length / segments;
      const deckWidth = Math.max(2, passage.halfWidth * 2 - 0.34);

      for (let index = 0; index < segments; index += 1) {
        const along = (index + 0.5) * segmentLength;
        const x = passage.ax + directionX * along;
        const z = passage.az + directionZ * along;
        const deck = box(
          deckWidth,
          0.18,
          Math.max(0.35, segmentLength - 0.12),
          0x6e5137,
        );
        deck.name = `community-passage-deck:${passage.id}:${index}`;
        deck.position.set(x, this.world.terrain.height(x, z) + 0.12, z);
        deck.rotation.y = heading;
        deck.userData.terrainOffsetY = 0.12;
        group.add(deck);

        for (const side of [-1, 1] as const) {
          const rail = box(
            0.12,
            0.72,
            Math.max(0.35, segmentLength - 0.12),
            0x43372d,
          );
          rail.name = `community-passage-rail:${passage.id}:${index}:${side}`;
          const lateralX = -directionZ * side * (deckWidth * 0.5 - 0.12);
          const lateralZ = directionX * side * (deckWidth * 0.5 - 0.12);
          rail.position.set(
            x + lateralX,
            this.world.terrain.height(x + lateralX, z + lateralZ) + 0.48,
            z + lateralZ,
          );
          rail.rotation.y = heading;
          rail.userData.terrainOffsetY = 0.48;
          group.add(rail);
        }
      }

      this.communityPassageDecks.set(passage.id, group);
      this.scene.add(group);
    }
  }

  syncCommunityPassageDecks(state: GameState): void {
    const activePassages = new Set(deriveSettlementCommunityPassageIds(state));
    for (const [id, group] of this.communityPassageDecks) {
      group.visible = activePassages.has(
        id as typeof activePassages extends Set<infer T> ? T : never,
      );
      if (!group.visible) continue;
      group.children.forEach((part) => {
        const offsetY = part.userData.terrainOffsetY as number | undefined;
        if (offsetY === undefined) return;
        part.position.y =
          this.world.terrain.height(part.position.x, part.position.z) + offsetY;
      });
    }
  }
}
