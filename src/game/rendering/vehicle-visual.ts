import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ModuleId, RigId } from "../contracts";
import {
  createSnowCrawlerModel,
  snowCrawlerDimensionsFromBlockout,
  snowCrawlerRollerSpinScale,
  snowCrawlerSpinPivots,
} from "../../../assets/workbench/snow-crawler-expedition-01/authored/createSnowCrawlerModel";
import {
  createDuneRunnerModel,
  duneRunnerWheelPivots,
} from "../../../assets/workbench/spark-dune-runner-02/authored/createDuneRunnerModel";
import {
  createTorqueFieldCutterModel,
  torqueFieldCutterWheelPivots,
} from "../../../assets/workbench/torque-field-cutter-02/authored/createTorqueFieldCutterModel";
import {
  createUtilityTowModel,
  utilityTowWheelPivots,
} from "../../../assets/workbench/utility-tow-recovery-01/authored/createUtilityTowModel";
import {
  createHarvesterModel,
  harvesterWheelPivots,
} from "../../../assets/workbench/harvester-combined-cultivator-01/authored/createHarvesterModel";
import {
  blockoutFor,
  LUG_TREAD_FORM,
  type RigBlockout,
  type RigModuleMount,
  type RigSuperstructureVolume,
} from "../rig-blockout";
import { RIG_HOOD_CAMERA_MOUNTS } from "../camera";
import { createFieldPlough01Model } from "../../../assets/workbench/field-plough-01/authored/createFieldPloughModel";
import { box, COLORS, cylinder, material } from "./primitives";

export interface RigParts {
  root: THREE.Group;
  /**
   * Ground-frame content holder, offset below `root` by the rig's ride height.
   *
   * `root` is mounted at `RigState.y`, the body origin. Rig models are authored
   * in the ground frame — wheel bottoms and blob shadows at y ≈ 0 — so this
   * group carries the single conversion between the two. See `rig-blockout.ts`.
   */
  body: THREE.Group;
  /** Named local-space mount authored on the rendered rig silhouette. */
  hoodCameraSocket: THREE.Object3D;
  /** Wheel spin pivots in physics order: front-left, front-right, rear-L, rear-R. */
  wheels: THREE.Group[];
  /** Steering pivots in the same order. Hover rigs expose an empty list. */
  steeringPivots: THREE.Group[];
  wheelRestY: number[];
  /**
   * Per-wheel multiplier turning the kernel's single reference wheel rotation
   * into each wheel's true rotation, in the same order. Derived by
   * `rig-blockout.ts` so unequal axles roll without visibly skidding.
   */
  wheelSpinScale: number[];
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
  headlightCone?: THREE.Mesh;
  headlightConeMaterial?: THREE.ShaderMaterial;
}

function hoodCameraSocket(rigId: RigId): THREE.Object3D {
  const mount = RIG_HOOD_CAMERA_MOUNTS[rigId];
  const socket = new THREE.Object3D();
  socket.name = `camera:hood:${rigId}`;
  socket.position.set(mount.localX, mount.localY, mount.localZ);
  return socket;
}

/**
 * Owns authored and procedural rig construction: blockout hulls, wheels with
 * lug-tire visuals, suspension forms, module sockets and visuals, state
 * shells, volumetric headlight cones, plough attachments, blob shadows,
 * steering controls, and the hitch cargo group. Extracted from GameRenderer
 * (ADR-0054 unit 7). Construction is pure: geometry only, no simulation
 * reads, no state writes.
 */
export class VehicleVisualPresenter {
  private shadowGradientTexture: THREE.Texture | null = null;

  /**
   * Build a cockpit steering control mounted on a raked column.
   *
   * The returned group is the column. Inside it, the spinning part is named
   * `steeringWheel` so `vehicleAnimationSystem` can resolve and turn it without
   * the renderer having to expose another typed part. The rim lies in the XY
   * plane, so the spin is a single rotation about local Z and the column's rake
   * stays on the parent — that keeps the animation channel one axis regardless
   * of how the rig is posed.
   *
   * This exists because the hood camera is a shipped feature that previously
   * looked at nothing. A control that visibly answers the player's steering
   * input is the rig telling the player what it is doing, which is the
   * "rig is the interface" layer rather than another HUD readout.
   */
  private steeringControl(
    radius: number,
    rimColor: number,
    rake: number,
  ): THREE.Group {
    const column = new THREE.Group();
    column.rotation.x = rake;

    const spin = new THREE.Group();
    spin.name = "steeringWheel";

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(radius, radius * 0.14, 6, 16),
      material(rimColor, 0.7, 0.1),
    );
    spin.add(rim);

    const hub = cylinder(
      radius * 0.22,
      radius * 0.22,
      radius * 0.18,
      8,
      COLORS.gold,
    );
    hub.rotation.x = Math.PI / 2;
    spin.add(hub);

    // Three spokes read as a steering wheel from the hood view without the
    // cost of a full rim mesh.
    for (let index = 0; index < 3; index += 1) {
      const angle = (index / 3) * Math.PI * 2;
      const spoke = box(radius * 0.12, radius * 0.92, radius * 0.1, rimColor);
      spoke.position.set(
        (Math.sin(angle) * radius) / 2,
        (Math.cos(angle) * radius) / 2,
        0,
      );
      spoke.rotation.z = -angle;
      spin.add(spoke);
    }

    const stalk = cylinder(
      radius * 0.1,
      radius * 0.1,
      radius * 1.1,
      6,
      0x2d2d29,
    );
    stalk.rotation.x = Math.PI / 2;
    stalk.position.z = -radius * 0.6;
    column.add(spin, stalk);

    return column;
  }
  private blobShadow(radius: number, opacity: number): THREE.Mesh {
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 24),
      new THREE.MeshBasicMaterial({
        color: 0x111811,
        transparent: true,
        opacity,
        depthWrite: false,
        alphaMap: this.getShadowGradientTexture(),
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    // The one cue a player reads for "is this touching the ground". Named so
    // ground-contact evidence can find it on any rig without a parts field.
    shadow.name = "blob-shadow";
    // A transparent ground decal with `depthWrite: false` — not solid rig
    // geometry. It is a plane spanning the whole footprint at ground level, so
    // any surface reasoning about "which part is this touching" has to skip it or
    // every underbody answer is "the shadow".
    shadow.userData.cameraSolid = false;
    return shadow;
  }

  /**
   * Add a visible, module-owned tread band to a wheel spin pivot.
   *
   * The stock tyre stays authoritative for wheel size and contact. These outer
   * bands only expose the fitted lug-tyre state through silhouette and material,
   * so presentation never invents a second handling model.
   *
   * Every proud dimension comes from {@link LUG_TREAD_FORM} because a tread that
   * stands outboard of the tyre widens the wheel's clearance envelope, and the
   * pontoon that has to clear that envelope is derived in `rig-blockout.ts`. When
   * these were local literals — two of them absolute metres — the tractor's
   * pontoons sat 6.8 cm inside its own tread bands at full lock, on a rig the
   * garage sells both modules to.
   */
  private addLugTireVisual(
    spinPivot: THREE.Group,
    radius: number,
    width: number,
  ): THREE.Group {
    const tread = new THREE.Group();
    tread.name = "module:lug-tires";
    tread.userData.moduleAnchor = "wheel";
    const treadMaterial = material(0x4f5147, 0.96, 0.02);
    for (const side of [-1, 1] as const) {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(
          radius * LUG_TREAD_FORM.bandRingScale,
          radius * LUG_TREAD_FORM.bandTubeScale,
          5,
          14,
        ),
        treadMaterial,
      );
      band.rotation.y = Math.PI / 2;
      band.position.x =
        side * (width * 0.5 + radius * LUG_TREAD_FORM.bandStandoffScale);
      tread.add(band);
    }
    const lugGeometry = new THREE.BoxGeometry(
      width + radius * LUG_TREAD_FORM.lugOverhangScale * 2,
      radius * LUG_TREAD_FORM.lugThicknessScale,
      radius * LUG_TREAD_FORM.lugDepthScale,
    );
    const lugReach =
      radius *
      (LUG_TREAD_FORM.lugReachScale - LUG_TREAD_FORM.lugThicknessScale / 2);
    for (let index = 0; index < LUG_TREAD_FORM.lugCount; index += 1) {
      const angle = (index / LUG_TREAD_FORM.lugCount) * Math.PI * 2;
      const lug = new THREE.Mesh(lugGeometry, treadMaterial);
      lug.position.set(
        0,
        Math.sin(angle) * lugReach,
        Math.cos(angle) * lugReach,
      );
      // Point the block's *thickness* axis radially outward, so the dimension
      // named `lugThicknessScale` is the one that decides how proud of the tyre
      // the tread stands and `lugReachScale` is the outer surface it reaches.
      //
      // This was `rotation.x = angle`, which pointed the block's `lugDepthScale`
      // axis outward instead. The tread then reached `1.03 + 0.30/2 = 1.18` tyre
      // radii while `treadEnvelope` in `rig-blockout.ts` derived every clearance
      // around it from `lugReachScale: 1.1` — so the envelope understated the
      // rendered tread by 8% of a tyre radius, 6.8 cm on the tractor's rear
      // wheel, which is what kept putting the flotation pontoons inside it. Both
      // sides agreed with each other; only the browser disagreed with both.
      //
      // A rotation of `π/2 - angle` maps local +Y onto the outward radial
      // direction `(0, sin angle, cos angle)`, leaving `lugDepthScale` as the
      // block's length along the direction of travel, which is what a lug bar is.
      lug.rotation.x = Math.PI / 2 - angle;
      tread.add(lug);
    }
    tread.visible = false;
    spinPivot.add(tread);
    return tread;
  }

  /**
   * Shrink a module's form until it fits the box its mount derived, and record by
   * how much.
   *
   * The guarantee, not the intent. `buildModuleForm` is supposed to author every
   * form inside its envelope, and each form below does — but "inside" depends on
   * the box's aspect ratio, and the tractor's and the buggy's hulls have different
   * ones, so a single set of ratios cannot be checked by reading it. Two forms were
   * outside their boxes when this was measured for the first time, and one of them
   * had put the pontoon brackets 3.4 cm inside the rear tread at every place and
   * every steering angle.
   *
   * Uniform, about the box centre, so proportions survive. Silent shrinkage would
   * be its own defect — a module rendering smaller than authored with nothing to
   * show it — so the factor is recorded and module-visual acceptance fails when a
   * form needed more than a rounding error of it. The clamp is what makes every
   * clearance `rig-blockout.test.ts` proves true of the rendered rig; the recorded
   * factor is what stops the clamp from hiding an authoring mistake.
   */
  private fitFormToEnvelope(group: THREE.Group, mount: RigModuleMount): number {
    group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(group);
    if (box.isEmpty()) return 1;
    const half = [mount.width / 2, mount.height / 2, mount.depth / 2] as const;
    const reach = [
      Math.max(Math.abs(box.min.x), Math.abs(box.max.x)),
      Math.max(Math.abs(box.min.y), Math.abs(box.max.y)),
      Math.max(Math.abs(box.min.z), Math.abs(box.max.z)),
    ] as const;
    let fit = 1;
    for (let axis = 0; axis < 3; axis += 1) {
      if (reach[axis]! > half[axis]!) {
        fit = Math.min(fit, half[axis]! / reach[axis]!);
      }
    }
    if (fit < 1) group.scale.setScalar(fit);
    return fit;
  }

  /**
   * A bodywork box, sized and placed from the blockout's authored volume.
   *
   * The common case: most bodywork *is* a box, so the volume the placement search
   * reasons about and the mesh a player sees are the same six numbers. Volumes
   * whose real geometry is curved (the buggy's roll bar, the skimmer's prow) take
   * the volume as their bounding box and invert its dimensions back into the
   * curve's parameters at the call site — see `createBuggy`.
   */
  private bodyworkBox(
    blockout: RigBlockout,
    label: string,
    color: number,
    roughness = 0.45,
    metalness = 0.35,
  ): THREE.Mesh {
    const volume = this.bodywork(blockout, label);
    const smallestDim = Math.min(volume.width, volume.height, volume.depth);
    const radius = Math.min(0.045, smallestDim * 0.12);
    const mesh = new THREE.Mesh(
      new RoundedBoxGeometry(
        volume.width,
        volume.height,
        volume.depth,
        2,
        radius,
      ),
      material(color, roughness, metalness),
    );
    mesh.position.set(volume.x, volume.y, volume.z);
    return mesh;
  }
  private buildModuleForm(mount: RigModuleMount): THREE.Group {
    const group = new THREE.Group();
    group.name = `module:${mount.moduleId}`;
    const { width, height, depth } = mount;

    switch (mount.moduleId) {
      case "winch": {
        // A drum lying across the nose, between two end plates, with a fairlead
        // and a hook — the parts that read as "this can pull something".
        //
        // `rotation.z = π/2` lays the cylinder axis along x, which puts its radial
        // extent into *both* y and z, so the radius is bounded by the narrower of
        // the two — not by `height` alone. Taking the plates from `height * 0.46`
        // put them 2.8 cm outside a box whose depth is smaller than its height.
        const crossRadius = Math.min(height, depth) * 0.5;
        const drum = cylinder(
          crossRadius * 0.84,
          crossRadius * 0.84,
          width * 0.58,
          14,
          0x6f7a72,
        );
        drum.rotation.z = Math.PI / 2;
        group.add(drum);
        for (const side of [-1, 1] as const) {
          const plate = cylinder(
            crossRadius * 0.96,
            crossRadius * 0.96,
            width * 0.06,
            14,
            0x3d443f,
          );
          plate.rotation.z = Math.PI / 2;
          plate.position.x = side * width * 0.32;
          group.add(plate);
        }
        const fairlead = box(
          width * 0.82,
          height * 0.2,
          depth * 0.34,
          0x2f342f,
        );
        fairlead.position.set(0, height * 0.34, depth * 0.3);
        const hook = box(width * 0.12, height * 0.3, depth * 0.3, 0xc9a94f);
        hook.position.set(0, -height * 0.26, depth * 0.28);
        group.add(fairlead, hook);
        break;
      }
      case "survey-mast": {
        // Slim tower, three rungs, sensor head, dish. The rungs matter: a bare
        // pole at this width reads as an aerial, not as instrumentation worth 7.
        //
        // The mount box is deliberately much wider than the pole (see
        // `RIG_MODULE_FORMS`): the head and dish are the widest parts of this form,
        // and a box sized to the pole cannot contain them. x is the free axis on the
        // hull top, so the box takes its room there and the ratios below shrink to
        // match — the rendered silhouette is the one authored when the box was
        // pole-sized, but now every part of it is inside.
        const pole = cylinder(
          width * 0.052,
          width * 0.068,
          height * 0.9,
          8,
          0x8d9490,
        );
        pole.position.y = -height * 0.05;
        group.add(pole);
        for (let rung = 0; rung < 3; rung += 1) {
          const bar = box(
            width * 0.204,
            height * 0.014,
            depth * 0.78,
            0x6d746f,
          );
          bar.position.y = height * (rung * 0.24 - 0.24);
          group.add(bar);
        }
        // Square in plan, from whichever horizontal dimension is tighter, so the
        // head reads as an instrument pod on any hull. At `depth * 1.5` it reached
        // 4.1 cm into the tractor's cab across a mount box that clears the cab by
        // 2.2 cm — the module was never the thing out of place, its geometry was.
        const headSpan = Math.min(width * 0.393, depth * 0.96);
        const head = box(headSpan, height * 0.07, headSpan, 0x2f3a40);
        head.position.y = height * 0.44;
        // The dish leans back, so its radius spends most of itself in y and only a
        // quarter in z. Bounded by the box's half-width and by the room left above
        // the dish's own centre: 0.49w binds on the tractor's tall box, 0.13h on the
        // buggy's short one. `fitFormToEnvelope` is the guarantee for a hull whose
        // proportions make some third axis bind instead.
        const dishRadius = Math.min(width * 0.49, height * 0.13);
        const dish = cylinder(
          dishRadius,
          width * 0.0786,
          height * 0.05,
          12,
          0xd9d2bd,
        );
        dish.rotation.x = Math.PI * 0.42;
        dish.position.y = height * 0.36;
        group.add(head, dish);
        break;
      }
      case "flotation-pontoons": {
        // A sealed float: barrel along Z, capped both ends, on two brackets that
        // reach back toward the hull so it reads as bolted on rather than welded.
        //
        // The barrel's radius is half the *narrower* of the box's two cross-section
        // dimensions, so it is inscribed in the envelope on both rigs. Taking it
        // from `height` alone made the float 1.9 cm wider than its box on the
        // tractor, whose pontoon box is taller than it is wide.
        const barrelRadius = Math.min(width, height) * 0.5;
        const float = cylinder(
          barrelRadius,
          barrelRadius,
          depth * 0.82,
          12,
          0xd8cdb0,
        );
        float.rotation.x = Math.PI / 2;
        group.add(float);
        // Brackets reach toward the hull, so the sign of the mount's x says which
        // way is inboard. This is the only place a mirrored pair's two halves
        // differ; everything else about them is symmetric by derivation.
        const inboard = mount.x < 0 ? 1 : -1;
        for (const end of [-1, 1] as const) {
          const cap = cylinder(0.001, barrelRadius, depth * 0.09, 12, 0xb8ac8c);
          cap.rotation.x = end * (Math.PI / 2);
          cap.position.z = end * depth * 0.455;
          group.add(cap);
        }
        const bracketWidth = width * 0.7;
        for (const along of [-1, 1] as const) {
          const bracket = box(
            bracketWidth,
            height * 0.16,
            depth * 0.06,
            0x4a4f49,
          );
          // Flush with the inboard face of the envelope, not `width * 0.42` from
          // its centre: at that offset a bracket `width * 0.7` wide reached
          // `width * 0.77` from centre — `width * 0.27` outside its own box, and
          // the box is only `width * 0.19` clear of the rear tread band. That is
          // the 3.4 cm the browser measured of pontoon inside tyre at every place
          // and every steering angle, on a rig the garage sells both modules to.
          bracket.position.set(
            inboard * (width - bracketWidth) * 0.5,
            height * 0.32,
            along * depth * 0.3,
          );
          group.add(bracket);
        }
        break;
      }
      case "skid-plate": {
        // Plate on top of its own envelope, ribs hanging under it — both inside
        // the box, so the lowest point of the module is still the box's floor.
        const plate = box(width, height * 0.5, depth, 0x77706a);
        plate.position.y = height * 0.25;
        group.add(plate);
        for (let rib = 0; rib < 3; rib += 1) {
          const runner = box(
            width * 0.13,
            height * 0.5,
            depth * 0.94,
            0x565b55,
          );
          runner.position.set((rib - 1) * width * 0.36, -height * 0.25, 0);
          group.add(runner);
        }
        break;
      }
      case "low-range-gearing": {
        // A transfer case: housing, output barrel, drain plug. No capability and
        // no silhouette claim, so the read is close-up detail — "something was
        // fitted here" — rather than a distant outline.
        //
        // The housing is held a hair shy of the envelope's depth so the output
        // barrel can protrude from it and still be inside the box. Sizing both to
        // the full depth and the barrel to `depth * 1.02` is how it protruded
        // before, and it put 7 mm of barrel through each end of its own mount.
        const housing = box(width, height * 0.72, depth * 0.94, 0x4d5250);
        housing.position.y = height * 0.14;
        const barrel = cylinder(
          height * 0.26,
          height * 0.26,
          depth,
          10,
          0x6a7370,
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.y = -height * 0.22;
        const plug = cylinder(
          width * 0.07,
          width * 0.07,
          height * 0.08,
          8,
          0xc0a35a,
        );
        // Flush with the envelope floor, not `0.48` — the plug is `height * 0.08`
        // long, so its own half-length has to come out of the offset.
        plug.position.y = -height * 0.46;
        group.add(housing, barrel, plug);
        break;
      }
      case "lug-tires":
        // Unreachable: `lug-tires` is wheel-mounted, so `rig-blockout.ts` derives
        // no hull mount for it and `addLugTireVisual` owns its form. Named rather
        // than defaulted so that adding a seventh module is a type error here.
        break;
    }

    group.visible = false;
    return group;
  }

  /**
   * Build every module visual this rig can carry, from its derived mounts.
   *
   * Driven entirely by `blockout.moduleMounts`, so a rig no module fits gets an
   * empty record with no branch for it, and a module added to `MODULES` with a
   * form appears on every rig that lists it in `fits` without touching the three
   * rig builders.
   */
  private buildModuleVisuals(
    body: THREE.Group,
    blockout: RigBlockout,
  ): Partial<Record<ModuleId, THREE.Object3D[]>> {
    const visuals: Partial<Record<ModuleId, THREE.Object3D[]>> = {};
    for (const mount of blockout.moduleMounts) {
      const group = this.buildModuleForm(mount);
      const fit = this.fitFormToEnvelope(group, mount);
      group.position.set(mount.x, mount.y, mount.z);
      // Recorded where it is known rather than inferred later. A hull bolt-on
      // must not interpenetrate the rig; a wheel tread must. Module-visual
      // evidence reads this to tell the two apart without restating which
      // modules are wheel-mounted, which is knowledge `rig-blockout.ts` owns.
      group.userData.moduleAnchor = "hull";
      // The box the form promised to stay inside, carried on the group so the
      // promise can be *measured* instead of trusted. `buildModuleForm`'s
      // docblock claims that expressing every dimension as a ratio of the mount
      // keeps the form inside the envelope; that claim is not true on its own — a
      // radius of `height * 0.5` escapes a box narrower than it is tall, and a
      // part positioned at `width * 0.42` with a half-extent of `width * 0.35`
      // escapes by `width * 0.27`. Both of those were live, and the second put
      // the tractor's pontoon brackets 3.4 cm inside its own rear tread.
      group.userData.moduleEnvelope = {
        width: mount.width,
        height: mount.height,
        depth: mount.depth,
      };
      // How much `fitFormToEnvelope` had to shrink the form to keep that promise.
      // 1 means the form was authored to fit. Anything less means the clamp saved a
      // clearance the blockout had already proved, and acceptance says so out loud
      // rather than letting the module render quietly undersized.
      group.userData.moduleEnvelopeFit = fit;
      body.add(group);
      (visuals[mount.moduleId] ??= []).push(group);
    }
    return visuals;
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

  private buildVolumetricLightCone(
    colorHex = 0xffe29d,
    length = 26,
    radius = 5.5,
  ): { mesh: THREE.Mesh; material: THREE.ShaderMaterial } {
    const geometry = new THREE.ConeGeometry(radius, length, 16, 1, true);
    geometry.translate(0, -length / 2, 0);
    geometry.rotateX(-Math.PI / 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(colorHex) },
        intensity: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float intensity;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          float dotNV = dot(normalize(vNormal), normalize(vViewPosition));
          float edge = max(0.0, 1.0 - abs(dotNV));
          float falloff = pow(edge, 1.8) * intensity;
          gl_FragColor = vec4(color, falloff * 0.32);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "vfx:headlight-cone";
    mesh.userData.cameraSolid = false;
    mesh.frustumCulled = false;
    return { mesh, material };
  }

  /**
   * The utility tractor, built front-forward.

   *
   * Layout along local Z, front (+) to rear (−): grille and headlights at +2.6,
   * hood at +1.2, small steering wheels at +1.65, cab at −1.05, large drive wheels
   * at −1.25, plough at −3.2. The previous build had the grille, hood, headlights
   * *and* plough all at −Z, which is why it appeared to drive backwards.
   */
  /**
   * The plough attachment, built from the studio's own authored procedural
   * factory (`assets/workbench/field-plough-01/authored/createFieldPloughModel.ts`)
   * instead of the flat solid-colour box placeholder this used to be.
   *
   * That factory is deliberately *not* yet marked `publicRuntimeApproved` in
   * `assets/asset-manifest.json` — its img2threejs silhouette-accuracy gate
   * (Tier 1 IoU 0.470 against the reference photo) has not cleared threshold
   * for hero/production art. This use respects that: the manifest's own notes
   * describe the factory as a legitimate "repo-local developer derivative for
   * validating named part boundaries... and customizable rig-part
   * integration" — exactly this use, an internal placeholder upgrade, not a
   * claim that this is finished, approved hero art. `root.userData` on the
   * returned group still carries `visualAuthority`/`collisionAuthority`
   * markers the factory authored for this exact boundary.
   *
   * The factory has its own internal scale/origin convention (built to match
   * its reference photo, not this rig's pivot space), so the fit here is
   * computed from its actual bounding box rather than hand-guessed offsets:
   * scaled to the old placeholder's blade width and grounded so its lowest
   * point sits where the old teeth tips sat.
   */
  private buildPloughAttachment(): THREE.Object3D {
    const model = createFieldPlough01Model({
      castShadow: true,
      receiveShadow: true,
    });
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());

    const targetWidth = 4.6; // old blade width, the widest prior element
    const targetBottomY = -0.82; // old tooth-tip depth in pivot-local space
    const targetCenterZ = -0.85; // midpoint of the old beam-to-tooth-tip span

    const scale = size.x > 0 ? targetWidth / size.x : 1;
    model.scale.setScalar(scale);

    // Re-measure after scaling rather than assume the pre-scale bounds times
    // the scale factor, since RoundedBoxGeometry bevels make that an
    // approximation, not an identity.
    const scaledBounds = new THREE.Box3().setFromObject(model);
    const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());
    model.position.set(
      -scaledCenter.x,
      targetBottomY - scaledBounds.min.y,
      targetCenterZ - scaledCenter.z,
    );
    return model;
  }

  /**
   * Look up one authored bodywork volume by label, in GROUND-frame metres.
   *
   * The blockout owns where a cab is; this is how the renderer asks. Before, both
   * owned it — the cab's size and position were literals in `createTractor` *and*
   * entries in `RIG_SUPERSTRUCTURES`, which is a duplicated constant with the two
   * copies in different files, the most durable form of drift there is. The
   * blockout's copy is the one that has to be right, because module placement is
   * derived from it, so the renderer reads from that and the literals are gone.
   *
   * Throws on an unknown label rather than returning a default. A silently-missing
   * cab would draw a rig with a hole in it while every placement check still passed
   * against the volume the model believes is there, which is worse than a crash on
   * first load: the blockout would be reserving space for bodywork nobody can see.
   */
  private bodywork(
    blockout: RigBlockout,
    label: string,
  ): RigSuperstructureVolume {
    const volume = blockout.superstructure.find(
      (entry) => entry.label === label,
    );
    if (!volume) {
      const known = blockout.superstructure
        .map((entry) => entry.label)
        .join(", ");
      throw new Error(
        `${blockout.id} has no authored bodywork volume "${label}"; ` +
          `RIG_SUPERSTRUCTURES declares [${known}]`,
      );
    }
    return volume;
  }

  /**
   * Build a rig's wheels from its blockout, in the simulation's wheel order.
   *
   * Both ground rigs previously ran their own copy of this loop with their own
   * hand-written coordinates, which is how the tractor came to sample terrain at
   * a footprint it never drew. Deriving from the blockout means the visible
   * wheel and the simulated contact are the same point by construction.
   *
   * Mounts are added to `body`, the ground-frame group, so `restY` keeps its
   * natural reading: a tyre of radius r centred at y = r touches y = 0.
   */
  private buildWheels(
    body: THREE.Group,
    blockout: RigBlockout,
    hubColor: number,
    hubRadiusScale: number,
  ): {
    wheels: THREE.Group[];
    steeringPivots: THREE.Group[];
    wheelRestY: number[];
    wheelSpinScale: number[];
    lugTireVisuals: THREE.Object3D[];
  } {
    const wheels: THREE.Group[] = [];
    const steeringPivots: THREE.Group[] = [];
    const wheelRestY: number[] = [];
    const wheelSpinScale: number[] = [];
    const lugTireVisuals: THREE.Object3D[] = [];

    for (const mount of blockout.wheelMounts) {
      const steeringPivot = new THREE.Group();
      steeringPivot.name = `wheel-mount-${mount.label}`;
      steeringPivot.position.set(mount.x, mount.restY, mount.z);

      // Mechanical suspension strut and coilover spring
      const strut = cylinder(0.042, 0.042, mount.radius * 0.9, 8, 0x222222);
      strut.position.set(0, mount.radius * 0.45, 0);
      steeringPivot.add(strut);

      const coil = new THREE.Mesh(
        new THREE.TorusGeometry(0.075, 0.02, 6, 12),
        material(0xb83822, 0.6, 0.4),
      );
      coil.rotation.x = Math.PI / 2;
      coil.position.set(0, mount.radius * 0.45, 0);
      steeringPivot.add(coil);

      const spinPivot = new THREE.Group();
      const wheel = cylinder(
        mount.radius,
        mount.radius,
        mount.width,
        14,
        COLORS.tire,
      );
      // Named so ground-contact evidence can measure the tyre's rendered extent
      // without counting module tread blocks that may not even be visible.
      wheel.name = "tyre";
      wheel.rotation.z = Math.PI / 2;
      const hubRadius = mount.radius * hubRadiusScale;
      const hub = cylinder(
        hubRadius,
        hubRadius,
        mount.width * 1.06,
        10,
        hubColor,
      );
      hub.rotation.z = Math.PI / 2;
      wheel.add(hub);

      // 6-bolt lug pattern
      for (let b = 0; b < 6; b++) {
        const bAngle = (b / 6) * Math.PI * 2;
        const bolt = cylinder(0.018, 0.018, mount.width * 1.08, 6, 0xd9aa52);
        bolt.rotation.z = Math.PI / 2;
        bolt.position.set(
          0,
          Math.sin(bAngle) * hubRadius * 0.65,
          Math.cos(bAngle) * hubRadius * 0.65,
        );
        wheel.add(bolt);
      }

      spinPivot.add(wheel);
      lugTireVisuals.push(
        this.addLugTireVisual(spinPivot, mount.radius, mount.width),
      );
      steeringPivot.add(spinPivot);
      wheels.push(spinPivot);
      steeringPivots.push(steeringPivot);
      wheelRestY.push(mount.restY);
      wheelSpinScale.push(mount.spinScale);
      body.add(steeringPivot);
    }

    return {
      wheels,
      steeringPivots,
      wheelRestY,
      wheelSpinScale,
      lugTireVisuals,
    };
  }

  createTractor(): RigParts {
    const blockout = blockoutFor("utility-tractor");
    const root = new THREE.Group();
    root.name = "persistent-rig";
    root.rotation.order = "YXZ";
    // Everything below is authored in the ground frame; this carries the single
    // conversion into the body frame the runtime mounts. See rig-blockout.ts.
    const body = new THREE.Group();
    body.name = "rig-body-ground-frame";
    body.position.y = blockout.groundFrameOffsetY;
    root.add(body);
    const cameraSocket = hoodCameraSocket("utility-tractor");

    const shadow = this.blobShadow(2.6, 0.3);
    shadow.position.set(0, blockout.shadowY, -0.2);
    shadow.scale.set(1, 1.65, 1);

    const chassis = box(
      blockout.hull.width,
      blockout.hull.height,
      blockout.hull.depth,
      0x4c3328,
    );
    chassis.position.y = blockout.hull.centreY;
    // The surface hull-anchored modules bolt to. A bolt-on is *meant* to seat a
    // centimetre or two into it — modelling a gap instead would read as a part
    // floating off the machine — so module-visual evidence has to tell "seated
    // against its mounting face" apart from "buried in the cab", which is a
    // defect. Marked at the three places that build a chassis rather than
    // inferred from a name or a position, so a rig rebuilt in a different shape
    // keeps the distinction.
    chassis.name = "chassis";
    chassis.userData.moduleMountSurface = true;
    // Bodywork from the blockout, not from literals here: the placement search
    // reserves space against these volumes, so the volume it reserves and the mesh
    // a player sees have to be the same numbers. Trim hangs off the volume it is
    // attached to for the same reason — a grille pinned at z 2.55 while the hood it
    // sits on moves is the drift this file exists to stop.
    const hood = this.bodyworkBox(blockout, "hood", COLORS.rust);
    const grille = box(1.9, 1, 0.2, 0x292824);
    grille.position.set(0, hood.position.y - 0.05, hood.position.z + 1.35);
    const cab = this.bodyworkBox(blockout, "cab", COLORS.bone);
    const cabVolume = this.bodywork(blockout, "cab");
    const windscreen = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 1.2, 0.1),
      material(0x274d58, 0.3, 0.15),
    );
    // Proud of the cab's forward face by half its own thickness, so the glass reads
    // as set into a frame rather than sunk behind one, and raised toward the
    // roofline where a windscreen sits.
    windscreen.position.set(
      0,
      cabVolume.y + 0.25,
      cabVolume.z + cabVolume.depth / 2 + 0.05,
    );
    const roof = this.bodyworkBox(blockout, "roof", 0x8e3328);
    const roofVolume = this.bodywork(blockout, "roof");
    const beacon = cylinder(0.2, 0.28, 0.4, 10, 0xe7a63b);
    // Standing on the roof, so it rises with the roof rather than through it.
    beacon.position.set(
      0.7,
      roofVolume.y + roofVolume.height / 2 + 0.24,
      roofVolume.z + 0.05,
    );
    const exhaust = cylinder(0.13, 0.17, 2.4, 8, 0x2d2d29);
    exhaust.position.set(-0.68, 2.9, 1.4);

    const {
      wheels,
      steeringPivots,
      wheelRestY,
      wheelSpinScale,
      lugTireVisuals,
    } = this.buildWheels(body, blockout, COLORS.gold, 0.44);

    const ploughPivot = new THREE.Group();
    ploughPivot.position.set(0, 1, -2.5);
    ploughPivot.add(this.buildPloughAttachment());

    // Rear cab window for rearview visibility
    const rearGlass = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.0, 0.08),
      material(0x274d58, 0.2, 0.1),
    );
    rearGlass.position.set(
      0,
      cabVolume.y + 0.2,
      cabVolume.z - cabVolume.depth / 2 - 0.04,
    );

    // Left and right side windows
    for (const sideX of [
      -cabVolume.width / 2 - 0.04,
      cabVolume.width / 2 + 0.04,
    ]) {
      const sideGlass = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.9, 1.4),
        material(0x274d58, 0.2, 0.1),
      );
      sideGlass.position.set(sideX, cabVolume.y + 0.25, cabVolume.z);
      body.add(sideGlass);
    }

    // Dual rear red brake taillights
    for (const x of [-0.95, 0.95]) {
      const taillight = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.14, 0.08),
        new THREE.MeshStandardMaterial({
          color: 0xff1808,
          emissive: 0xcc0500,
          emissiveIntensity: 0.85,
          roughness: 0.2,
        }),
      );
      taillight.position.set(x, 1.45, -2.12);
      body.add(taillight);
    }

    // Heavy front bumper bar
    const bumperBar = new THREE.Mesh(
      new RoundedBoxGeometry(2.3, 0.25, 0.35, 2, 0.04),
      material(0x1e2022, 0.6, 0.8),
    );
    bumperBar.position.set(0, 0.85, 2.75);
    body.add(bumperBar);

    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffe7a8 });
    for (const x of [-0.68, 0.68]) {
      const bezel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.16, 12),
        material(0x18181a, 0.4, 0.9),
      );
      bezel.rotation.x = Math.PI / 2;
      bezel.position.set(x, 1.85, 2.62);
      body.add(bezel);

      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.21, 0.21, 0.14, 12),
        headlightMaterial,
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, 1.85, 2.66);
      body.add(lens);
    }
    // A spotlight aimed forward, so night driving actually lights the road ahead.
    const headlights = new THREE.SpotLight(0xffd58a, 0, 46, 0.62, 0.45, 1.2);
    headlights.position.set(0, 2.1, 2.6);
    headlights.target.position.set(0, 0, 22);
    body.add(headlights.target);

    const { mesh: stateShell, material: stateShellMaterial } =
      this.buildStateShell(3.2, 2.8, 5.2, 0xe89d43);
    stateShell.position.set(0, 1.8, -0.2);

    const { mesh: headlightCone, material: headlightConeMaterial } =
      this.buildVolumetricLightCone(0xffe29d, 28, 6.2);
    headlightCone.position.set(0, 2.1, 2.6);

    // Inside the cab (centre z -1.05, depth 2.1), raked toward the seat, so it
    // is physically where a driver would hold it and reads through the
    // windscreen from the exterior cameras. The hood camera socket sits ahead
    // of the windscreen at z 0.55, so this control is deliberately behind that
    // view rather than pasted in front of it; an interior camera is what would
    // make it a true cockpit instrument.
    const steeringColumn = this.steeringControl(0.42, 0x30302c, -0.62);
    steeringColumn.position.set(0, 2.72, -0.55);

    body.add(
      shadow,
      chassis,
      hood,
      grille,
      cab,
      windscreen,
      rearGlass,
      roof,
      beacon,
      exhaust,
      steeringColumn,
      ploughPivot,
      headlights,
      headlightCone,
      cameraSocket,
      stateShell,
    );
    return {
      root,
      body,
      hoodCameraSocket: cameraSocket,
      wheels,
      steeringPivots,
      wheelRestY,
      wheelSpinScale,
      moduleVisuals: {
        ...this.buildModuleVisuals(body, blockout),
        "lug-tires": lugTireVisuals,
      },
      ploughPivot,
      headlights,
      headlightCone,
      headlightConeMaterial,
      frontMarker: grille,
      rearMarker: ploughPivot,
      stateShell,
      stateShellMaterial,
    };
  }

  /** The toy buggy, built front-forward: nose and lights at +Z, tow hook at −Z. */
  createBuggy(): RigParts {
    const blockout = blockoutFor("toy-buggy");
    const root = new THREE.Group();
    root.name = "toy-buggy";
    root.rotation.order = "YXZ";
    const body = new THREE.Group();
    body.name = "rig-body-ground-frame";
    body.position.y = blockout.groundFrameOffsetY;
    root.add(body);
    const cameraSocket = hoodCameraSocket("toy-buggy");

    const shadow = this.blobShadow(2.1, 0.26);
    shadow.position.y = blockout.shadowY;
    shadow.scale.set(1, 1.45, 1);

    const chassis = box(
      blockout.hull.width,
      blockout.hull.height,
      blockout.hull.depth,
      0x283d45,
    );
    chassis.position.y = blockout.hull.centreY;
    // The mounting face for hull-anchored modules; see `createTractor`.
    chassis.name = "chassis";
    chassis.userData.moduleMountSurface = true;
    const nose = this.bodyworkBox(blockout, "nose", 0xe1ad52);
    const cockpit = this.bodyworkBox(blockout, "cockpit", 0x315f6b, 0.28, 0.12);
    // The roll bar keeps its curve; only its *size* comes from the blockout. A
    // half-torus of major radius R and tube t bounds to `2(R+t) × (R+t) × 2t`, so
    // the authored box inverts cleanly: `R + t = width / 2` and `t = depth / 2`.
    // That is the whole point of boxing it in `RIG_SUPERSTRUCTURES` — the placement
    // search needs the space it denies, the player needs the arc, and neither has to
    // restate the other's numbers.
    const rollBarVolume = this.bodywork(blockout, "roll bar");
    const rollBarTube = rollBarVolume.depth / 2;
    const rollBarRadius = rollBarVolume.width / 2 - rollBarTube;
    const rollBar = new THREE.Mesh(
      new THREE.TorusGeometry(rollBarRadius, rollBarTube, 6, 16, Math.PI),
      material(COLORS.bone),
    );
    // Spun so the arc opens downward, which puts its centre on the volume's floor
    // rather than at the volume's centre.
    rollBar.position.set(
      rollBarVolume.x,
      rollBarVolume.y - rollBarVolume.height / 2,
      rollBarVolume.z,
    );
    rollBar.rotation.z = Math.PI;

    const {
      wheels,
      steeringPivots,
      wheelRestY,
      wheelSpinScale,
      lugTireVisuals,
    } = this.buildWheels(body, blockout, COLORS.cyan, 0.41);

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
      body.add(lens);
    }
    const headlights = new THREE.SpotLight(0xc8f8ff, 0, 38, 0.55, 0.4, 1.3);
    headlights.position.set(0, 1.1, 1.9);
    headlights.target.position.set(0, 0, 20);
    body.add(headlights.target);

    const { mesh: stateShell, material: stateShellMaterial } =
      this.buildStateShell(2.4, 1.8, 4.2, 0xd9aa52);
    stateShell.position.set(0, 1.0, 0);

    const { mesh: headlightCone, material: headlightConeMaterial } =
      this.buildVolumetricLightCone(0xc8f8ff, 24, 5.2);
    headlightCone.position.set(0, 1.1, 1.9);

    // In the open cockpit (centre z -0.55), smaller and more steeply raked than
    // the tractor's, matching the buggy's go-kart posture. The buggy has no
    // windscreen, so this one is directly visible from chase and side views.
    const steeringColumn = this.steeringControl(0.3, 0x1f3b44, -0.78);
    steeringColumn.position.set(0, 1.42, -0.3);

    body.add(
      shadow,
      chassis,
      nose,
      cockpit,
      rollBar,
      towHook,
      headlights,
      headlightCone,
      cameraSocket,
      stateShell,
      steeringColumn,
    );
    return {
      root,
      body,
      hoodCameraSocket: cameraSocket,
      wheels,
      steeringPivots,
      wheelRestY,
      wheelSpinScale,
      moduleVisuals: {
        ...this.buildModuleVisuals(body, blockout),
        "lug-tires": lugTireVisuals,
      },
      ploughPivot: null,
      headlights,
      headlightCone,
      headlightConeMaterial,
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
   *
   * Authored in the GROUND frame like the other rigs, so every height below
   * reads as metres above the marsh. It previously sat in a frame of its own —
   * y = 0 at the body origin, with the ground assumed 0.72 m below rather than
   * the profile's 1.35 — which left its blob shadow hovering 0.63 m in the air
   * and its lift skirt stopping 0.27 m short of the cushion it rides on.
   */
  createSkimmer(): RigParts {
    const blockout = blockoutFor("marsh-skimmer");
    const root = new THREE.Group();
    root.name = "marsh-skimmer";
    root.rotation.order = "YXZ";
    const body = new THREE.Group();
    body.name = "rig-body-ground-frame";
    body.position.y = blockout.groundFrameOffsetY;
    root.add(body);
    const cameraSocket = hoodCameraSocket("marsh-skimmer");

    const shadow = this.blobShadow(2.6, 0.22);
    shadow.position.y = blockout.shadowY;
    shadow.scale.set(1.2, 1.75, 1);

    // A lift skirt has to flare past the deck to trap its cushion, and taper
    // inward as it rises. Both are art, so both are ratios of derived extents:
    // retuning the profile widens the skirt with the hull instead of stranding
    // it at a hand-written radius.
    const skirtGeometry = blockout.hoverSkirt!;
    const skirtBottomRadius = (blockout.hull.width / 2) * 1.29;
    const skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(
        skirtBottomRadius * 0.88,
        skirtBottomRadius,
        skirtGeometry.height,
        12,
      ),
      material(0x242a2b, 0.95, 0),
    );
    skirt.name = "hover-skirt";
    skirt.scale.z = blockout.hull.depth / blockout.hull.width;
    skirt.position.y = skirtGeometry.centreY;

    const deck = box(
      blockout.hull.width,
      blockout.hull.height,
      blockout.hull.depth,
      0x315861,
    );
    deck.position.y = blockout.hull.centreY;
    // The skimmer is sold no modules today, so nothing bolts to this deck. Marked
    // anyway: the moment a module lists `marsh-skimmer` in `fits`, its mount
    // surface has to already be declared or the geometry check reads a legitimate
    // seating as a foul.
    deck.name = "chassis";
    deck.userData.moduleMountSurface = true;
    // Like the buggy's roll bar, the prow keeps its cone and takes its size from the
    // blockout's bounding box. A 4-sided cone spun 45° presents corner-to-corner, so
    // its bounding width is the full diagonal — `radius = width / 2` — and its own
    // length lies along z once it is laid down, giving `height = depth`.
    const prowVolume = this.bodywork(blockout, "prow");
    const prow = new THREE.Mesh(
      new THREE.ConeGeometry(prowVolume.width / 2, prowVolume.depth, 4),
      material(COLORS.cyan, 0.58, 0.16),
    );
    prow.rotation.x = Math.PI / 2;
    prow.rotation.z = Math.PI / 4;
    prow.position.set(prowVolume.x, prowVolume.y, prowVolume.z);
    const cabin = this.bodyworkBox(blockout, "cabin", COLORS.bone);
    const cabinVolume = this.bodywork(blockout, "cabin");
    const windscreen = box(2.1, 0.58, 0.12, 0x234d5a);
    // On the cabin's forward face, in its upper half where a screen belongs.
    windscreen.position.set(
      0,
      cabinVolume.y + 0.23,
      cabinVolume.z + cabinVolume.depth / 2 + 0.03,
    );
    const roof = this.bodyworkBox(blockout, "roof", COLORS.rust);

    const pontoonMaterial = material(0x476f75, 0.66, 0.14);
    for (const x of [-1.72, 1.72]) {
      const pontoon = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.42, 3.7, 5, 10),
        pontoonMaterial,
      );
      pontoon.rotation.x = Math.PI / 2;
      pontoon.position.set(x, 1.22, 0.05);
      body.add(pontoon);
    }

    const fanMaterial = material(0x26383c, 0.62, 0.25);
    for (const x of [-0.92, 0.92]) {
      const fan = new THREE.Group();
      fan.position.set(x, 2.35, -2.35);
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
      body.add(fan);
    }

    const towHook = cylinder(0.12, 0.16, 0.62, 8, COLORS.gold);
    towHook.rotation.x = Math.PI / 2;
    towHook.position.set(0, 1.17, -3);

    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xbdfaff });
    for (const x of [-0.72, 0.72]) {
      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.19, 0.12, 10),
        lightMaterial,
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, 1.75, 3.45);
      body.add(lens);
    }
    const headlights = new THREE.SpotLight(0xbdfaff, 0, 42, 0.62, 0.45, 1.2);
    headlights.position.set(0, 1.85, 3.3);
    headlights.target.position.set(0, 0.82, 23);
    body.add(headlights.target);

    const { mesh: stateShell, material: stateShellMaterial } =
      this.buildStateShell(4.2, 2.2, 6.2, 0x6bc9c4);
    stateShell.position.set(0, 1.87, 0.2);

    const { mesh: headlightCone, material: headlightConeMaterial } =
      this.buildVolumetricLightCone(0xbdfaff, 26, 5.8);
    headlightCone.position.set(0, 1.85, 3.3);

    body.add(
      shadow,
      skirt,
      deck,
      prow,
      cabin,
      windscreen,
      roof,
      towHook,
      headlights,
      headlightCone,
      cameraSocket,
      stateShell,
    );
    return {
      root,
      body,
      hoodCameraSocket: cameraSocket,
      wheels: [],
      steeringPivots: [],
      wheelRestY: [],
      wheelSpinScale: [],
      // Empty in practice, because no module in `MODULES` fits the skimmer — but
      // derived rather than hard-coded `{}`, so writing one for it is a data
      // change in `contracts.ts` and not a renderer change here.
      moduleVisuals: this.buildModuleVisuals(body, blockout),
      ploughPivot: null,
      headlights,
      headlightCone,
      headlightConeMaterial,
      frontMarker: prow,
      rearMarker: towHook,
      stateShell,
      stateShellMaterial,
    };
  }

  createCandidateRig(rigId: RigId): RigParts {
    const blockout = blockoutFor(rigId);
    const root = new THREE.Group();
    root.name = rigId;
    root.rotation.order = "YXZ";

    const body = new THREE.Group();
    body.name = "rig-body-ground-frame";
    body.position.y = blockout.groundFrameOffsetY;
    root.add(body);
    const cameraSocket = hoodCameraSocket(rigId);

    const shadow = this.blobShadow(blockout.hull.width * 0.9, 0.25);
    shadow.position.y = blockout.shadowY;

    const hullMesh = box(
      blockout.hull.width,
      blockout.hull.height,
      blockout.hull.depth,
      COLORS.rust,
    );
    hullMesh.name = "chassis-hull";
    hullMesh.position.y = blockout.hull.centreY;

    const isHover = blockout.profile.mobilityAdapter === "hover";
    const wheelData = isHover
      ? {
          wheels: [] as THREE.Group[],
          steeringPivots: [] as THREE.Group[],
          wheelRestY: [] as number[],
          wheelSpinScale: [] as number[],
          lugTireVisuals: [] as THREE.Object3D[],
        }
      : this.buildWheels(body, blockout, COLORS.gold, 0.45);

    body.add(shadow, hullMesh);

    for (const form of blockout.superstructure) {
      const b = this.bodyworkBox(blockout, form.label, COLORS.bone);
      body.add(b);
    }

    root.add(cameraSocket);

    const headlights = new THREE.SpotLight(0xbdfaff, 0, 42, 0.62, 0.45, 1.2);
    headlights.position.set(0, blockout.hull.topY, blockout.hull.depth / 2);
    headlights.target.position.set(
      0,
      blockout.hull.centreY,
      blockout.hull.depth / 2 + 20,
    );
    body.add(headlights, headlights.target);

    const { mesh: stateShell, material: stateShellMaterial } =
      this.buildStateShell(
        blockout.hull.width * 1.1,
        blockout.hull.height * 1.1,
        blockout.hull.depth * 1.1,
        0x6bc9c4,
      );
    stateShell.position.set(0, blockout.hull.centreY, 0);

    const { mesh: headlightCone, material: headlightConeMaterial } =
      this.buildVolumetricLightCone(0xbdfaff, 26, 5.8);
    headlightCone.position.set(0, blockout.hull.topY, blockout.hull.depth / 2);

    body.add(stateShell, headlightCone);

    return {
      root,
      body,
      hoodCameraSocket: cameraSocket,
      wheels: wheelData.wheels,
      steeringPivots: wheelData.steeringPivots,
      wheelRestY: wheelData.wheelRestY,
      wheelSpinScale: wheelData.wheelSpinScale,
      moduleVisuals: {
        ...this.buildModuleVisuals(body, blockout),
        "lug-tires": wheelData.lugTireVisuals,
      },
      ploughPivot: null,
      headlights,
      headlightCone,
      headlightConeMaterial,
      frontMarker: hullMesh,
      rearMarker: hullMesh,
      stateShell,
      stateShellMaterial,
    };
  }

  /**
   * The snow crawler renders through its authored Lane-A factory — the first
   * candidate promoted off the generic blockout (Rig Production Pipeline S6).
   * The blockout stays the dimensional authority: the factory receives its
   * metres through `snowCrawlerDimensionsFromBlockout`, and every operational
   * peripheral (blob shadow, camera socket, headlights, state shell, light
   * cone) uses blockout-derived values exactly as `createCandidateRig` does.
   */
  createSnowCrawler(): RigParts {
    const blockout = blockoutFor("snow-crawler-expedition-01");
    const dims = snowCrawlerDimensionsFromBlockout(blockout);
    const root = new THREE.Group();
    root.name = "snow-crawler-expedition-01";
    root.rotation.order = "YXZ";

    const body = new THREE.Group();
    body.name = "rig-body-ground-frame";
    body.position.y = blockout.groundFrameOffsetY;
    root.add(body);
    const cameraSocket = hoodCameraSocket("snow-crawler-expedition-01");

    const shadow = this.blobShadow(blockout.hull.width * 0.95, 0.25);
    shadow.position.y = blockout.shadowY;

    const model = createSnowCrawlerModel({ dimensions: dims });
    body.add(shadow, model, cameraSocket);

    // Kernel wheel order (FL, FR, RL, RR) maps onto the track's spin pivots.
    // Steering pivots are present-but-empty by design: the kernel's per-wheel
    // suspension channel has nothing to move on a tracked undercarriage, and
    // yawing a roller about its hub would read as a bug, not as steering.
    const spinPivots = snowCrawlerSpinPivots(model);
    const spinScale = snowCrawlerRollerSpinScale(dims);
    const steeringPivots: THREE.Group[] = [];
    const wheelRestY: number[] = [];
    const wheelSpinScale: number[] = [];
    for (const mount of blockout.wheelMounts) {
      const steeringPivot = new THREE.Group();
      steeringPivot.name = `wheel-mount-${mount.label}`;
      steeringPivot.position.set(mount.x, mount.restY, mount.z);
      body.add(steeringPivot);
      steeringPivots.push(steeringPivot);
      wheelRestY.push(mount.restY);
      wheelSpinScale.push(spinScale);
    }

    const headlights = new THREE.SpotLight(0xbdfaff, 0, 42, 0.62, 0.45, 1.2);
    headlights.position.set(0, dims.roofY * 0.72, blockout.hull.depth / 2);
    headlights.target.position.set(
      0,
      blockout.hull.centreY,
      blockout.hull.depth / 2 + 20,
    );
    body.add(headlights, headlights.target);

    const { mesh: stateShell, material: stateShellMaterial } =
      this.buildStateShell(
        dims.bodyWidth * 1.06,
        (dims.roofY - blockout.hull.bottomY) * 1.06,
        dims.bodyLength * 1.04,
        0x6bc9c4,
      );
    stateShell.position.set(0, (dims.roofY + blockout.hull.bottomY) / 2, 0);

    const { mesh: headlightCone, material: headlightConeMaterial } =
      this.buildVolumetricLightCone(0xbdfaff, 26, 5.8);
    headlightCone.position.set(0, blockout.hull.topY, blockout.hull.depth / 2);

    body.add(stateShell, headlightCone);

    const frontMarker = model.getObjectByName("ice-breaker-plow");
    const rearMarker = model.getObjectByName("rear-marker");
    if (!frontMarker || !rearMarker) {
      throw new Error(
        "snow-crawler-expedition-01: authored model is missing its axis markers",
      );
    }

    return {
      root,
      body,
      hoodCameraSocket: cameraSocket,
      wheels: spinPivots,
      steeringPivots,
      wheelRestY,
      wheelSpinScale,
      moduleVisuals: {
        ...this.buildModuleVisuals(body, blockout),
        "lug-tires": [],
      },
      ploughPivot: null,
      headlights,
      headlightCone,
      headlightConeMaterial,
      frontMarker,
      rearMarker,
      stateShell,
      stateShellMaterial,
    };
  }

  /**
   * Shared Wave-1 promotion path for authored steered-wheeled rig factories.
   *
   * The blockout stays the dimensional authority: kernel steering columns
   * mount at blockout wheel positions, and each factory spin pivot is
   * reparented under its column with hub compensation, so kernel yaw (front
   * pair) and suspension travel move the visible tyres while the factory
   * keeps full authority over the rig's form. Per-rig differences come in as
   * the pivot accessor, axis-marker node names, and state-shell tint.
   */
  createAuthoredWheeledRig(
    rigId: RigId,
    options: {
      model: THREE.Group;
      spinPivots: THREE.Group[];
      frontMarkerName: string;
      rearMarkerName: string;
      shellColor: number;
    },
  ): RigParts {
    const blockout = blockoutFor(rigId);
    const root = new THREE.Group();
    root.name = rigId;
    root.rotation.order = "YXZ";

    const body = new THREE.Group();
    body.name = "rig-body-ground-frame";
    body.position.y = blockout.groundFrameOffsetY;
    root.add(body);
    const cameraSocket = hoodCameraSocket(rigId);

    const shadow = this.blobShadow(blockout.hull.width * 0.95, 0.25);
    shadow.position.y = blockout.shadowY;

    body.add(shadow, options.model, cameraSocket);

    const steeringPivots: THREE.Group[] = [];
    const wheelRestY: number[] = [];
    const wheelSpinScale: number[] = [];
    for (const [index, mount] of blockout.wheelMounts.entries()) {
      const steeringPivot = new THREE.Group();
      steeringPivot.name = `wheel-mount-${mount.label}`;
      steeringPivot.position.set(mount.x, mount.restY, mount.z);
      body.add(steeringPivot);

      const wheel = options.spinPivots[index];
      if (!wheel) {
        throw new Error(
          `${rigId}: factory returned fewer wheel pivots than the blockout has mounts (${index})`,
        );
      }
      wheel.position.set(
        wheel.position.x - mount.x,
        wheel.position.y - mount.restY,
        wheel.position.z - mount.z,
      );
      steeringPivot.add(wheel);

      steeringPivots.push(steeringPivot);
      wheelRestY.push(mount.restY);
      wheelSpinScale.push(mount.spinScale);
    }

    const headlights = new THREE.SpotLight(0xbdfaff, 0, 42, 0.62, 0.45, 1.2);
    headlights.position.set(
      0,
      blockout.hull.topY * 0.82,
      blockout.hull.depth / 2,
    );
    headlights.target.position.set(
      0,
      blockout.hull.centreY,
      blockout.hull.depth / 2 + 20,
    );
    body.add(headlights, headlights.target);

    const { mesh: stateShell, material: stateShellMaterial } =
      this.buildStateShell(
        blockout.hull.width * 1.06,
        blockout.hull.height * 1.06,
        blockout.hull.depth * 1.04,
        options.shellColor,
      );
    stateShell.position.set(0, blockout.hull.centreY, 0);

    const { mesh: headlightCone, material: headlightConeMaterial } =
      this.buildVolumetricLightCone(0xbdfaff, 26, 5.8);
    headlightCone.position.set(0, blockout.hull.topY, blockout.hull.depth / 2);

    body.add(stateShell, headlightCone);

    const frontMarker = options.model.getObjectByName(options.frontMarkerName);
    const rearMarker = options.model.getObjectByName(options.rearMarkerName);
    if (!frontMarker || !rearMarker) {
      throw new Error(`${rigId}: authored model is missing its axis markers`);
    }

    return {
      root,
      body,
      hoodCameraSocket: cameraSocket,
      wheels: options.spinPivots,
      steeringPivots,
      wheelRestY,
      wheelSpinScale,
      moduleVisuals: {
        ...this.buildModuleVisuals(body, blockout),
        "lug-tires": [],
      },
      ploughPivot: null,
      headlights,
      headlightCone,
      headlightConeMaterial,
      frontMarker,
      rearMarker,
      stateShell,
      stateShellMaterial,
    };
  }

  /**
   * The dune runner renders through its authored factory — second candidate
   * promoted off the generic blockout (Rig Production Pipeline Wave 1).
   */
  createDuneRunner(): RigParts {
    const model = createDuneRunnerModel();
    return this.createAuthoredWheeledRig("spark-dune-runner-02", {
      model,
      spinPivots: duneRunnerWheelPivots(model),
      frontMarkerName: "front-marker",
      rearMarkerName: "rear-marker",
      shellColor: 0x59d6da,
    });
  }

  /**
   * Torque field cutter — third Wave-1 promotion; the authored mulcher head
   * serves as the front axis marker.
   */
  createTorqueFieldCutter(): RigParts {
    const model = createTorqueFieldCutterModel();
    return this.createAuthoredWheeledRig("torque-field-cutter-02", {
      model,
      spinPivots: torqueFieldCutterWheelPivots(model),
      frontMarkerName: "front-mulcher-head",
      rearMarkerName: "rear-marker",
      shellColor: 0xb7c46a,
    });
  }

  /**
   * Heavy utility tow — fourth Wave-1 promotion. 6x6 identity: the four
   * factory wheels carrying `userData.simulationWheelIndex` map onto the
   * kernel columns; the cosmetic middle axle stays visual-only.
   */
  createUtilityTow(): RigParts {
    const model = createUtilityTowModel();
    return this.createAuthoredWheeledRig("heavy-utility-tow-recovery-01", {
      model,
      spinPivots: utilityTowWheelPivots(model),
      frontMarkerName: "front-marker",
      rearMarkerName: "rear-hazard-bumper",
      shellColor: 0xd08a3e,
    });
  }

  /**
   * Harvester — fifth Wave-1 promotion. Dual front drive tyres ride inside
   * one pivot per side; the authored header drum is the front marker and the
   * chaff spreader the rear marker.
   */
  createHarvester(): RigParts {
    const model = createHarvesterModel();
    return this.createAuthoredWheeledRig("harvester-combined-cultivator-01", {
      model,
      spinPivots: harvesterWheelPivots(model),
      frontMarkerName: "rotary-header-drum",
      rearMarkerName: "rear-marker",
      shellColor: 0xc9a53f,
    });
  }

  createCargo(): THREE.Group {
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

  /**
   * Soft radial-falloff alpha map, generated once and reused by every blob
   * shadow. A uniform-opacity circle (the previous approach) reads as a hard,
   * unlit disc pasted onto the ground; a soft centre-to-edge falloff is what
   * actually sells contact-shadow "blob shadows" as shadows rather than decals
   * — this is the same trick stylised low-poly games (Mario-style blob
   * shadows) have used for decades specifically because a real shadow map was
   * too expensive.
   */
  private getShadowGradientTexture(): THREE.Texture {
    if (this.shadowGradientTexture) return this.shadowGradientTexture;
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.7, "rgba(255,255,255,0.55)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.shadowGradientTexture = texture;
    return texture;
  }
}
