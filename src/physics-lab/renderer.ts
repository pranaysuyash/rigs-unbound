import * as THREE from "three";
import type {
  DynamicsDebugGeometry,
  VehicleDynamicsTelemetry,
} from "../dynamics/contracts";
import type { CameraMode } from "../game/contracts";
import { LAB_SURFACES, LAB_VEHICLE_CONFIG } from "./config";

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const LOCAL_FORWARD = new THREE.Vector3(0, 0, 1);

function material(
  color: number,
  roughness = 0.72,
  metalness = 0.04,
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

export class PhysicsLabRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(54, 1, 0.15, 500);
  private readonly chassis = new THREE.Group();
  private readonly wheelRoots: THREE.Group[] = [];
  private readonly wheelSteering: THREE.Group[] = [];
  private readonly wheelSpin: THREE.Group[] = [];
  private readonly debugLines = new THREE.LineSegments(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ vertexColors: true }),
  );
  private readonly suspensionLines = new THREE.LineSegments(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({
      color: 0xf4ca62,
      transparent: true,
      opacity: 0.9,
    }),
  );
  private cameraReady = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.scene.background = new THREE.Color(0x11191e);
    this.scene.fog = new THREE.Fog(0x11191e, 92, 240);
    this.camera.position.set(8, 5, -10);

    this.buildLighting();
    this.buildWorld();
    this.buildVehicle();
    this.scene.add(this.debugLines, this.suspensionLines);
    this.resize();
    window.addEventListener("resize", this.resize);
  }

  render(
    telemetry: VehicleDynamicsTelemetry,
    cameraMode: CameraMode,
    debugGeometry: DynamicsDebugGeometry | null,
    delta: number,
  ): void {
    const position = telemetry.body.position;
    const rotation = telemetry.body.rotation;
    this.chassis.position.set(position.x, position.y, position.z);
    this.chassis.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);

    const bodyQuaternion = this.chassis.quaternion;
    const suspensionPositions = new Float32Array(telemetry.wheels.length * 6);
    telemetry.wheels.forEach((wheel, index) => {
      const connection = new THREE.Vector3(
        wheel.connection.x,
        wheel.connection.y,
        wheel.connection.z,
      )
        .applyQuaternion(bodyQuaternion)
        .add(this.chassis.position);
      const wheelPosition = new THREE.Vector3(
        wheel.connection.x,
        wheel.connection.y - wheel.suspensionLength,
        wheel.connection.z,
      )
        .applyQuaternion(bodyQuaternion)
        .add(this.chassis.position);

      const root = this.wheelRoots[index]!;
      root.position.copy(wheelPosition);
      root.quaternion.copy(bodyQuaternion);
      this.wheelSteering[index]!.rotation.y = wheel.steering;
      this.wheelSpin[index]!.rotation.x = -wheel.rotation;

      const offset = index * 6;
      suspensionPositions[offset] = connection.x;
      suspensionPositions[offset + 1] = connection.y;
      suspensionPositions[offset + 2] = connection.z;
      suspensionPositions[offset + 3] = wheelPosition.x;
      suspensionPositions[offset + 4] = wheelPosition.y;
      suspensionPositions[offset + 5] = wheelPosition.z;
    });
    this.suspensionLines.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(suspensionPositions, 3),
    );

    if (debugGeometry) {
      this.debugLines.visible = true;
      this.debugLines.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(debugGeometry.vertices, 3),
      );
      this.debugLines.geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(debugGeometry.colors, 4),
      );
    } else {
      this.debugLines.visible = false;
    }

    this.updateCamera(telemetry, cameraMode, delta);
    this.renderer.render(this.scene, this.camera);
  }

  metrics(): { drawCalls: number; triangles: number } {
    return {
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
    };
  }

  dispose(): void {
    window.removeEventListener("resize", this.resize);
    this.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const item of materials) item.dispose();
    });
    this.debugLines.geometry.dispose();
    this.suspensionLines.geometry.dispose();
    this.renderer.dispose();
  }

  private readonly resize = (): void => {
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  private buildLighting(): void {
    this.scene.add(new THREE.HemisphereLight(0xc9e3e7, 0x263329, 1.35));
    const sun = new THREE.DirectionalLight(0xffe1aa, 2.6);
    sun.position.set(-24, 42, -18);
    this.scene.add(sun);

    const rim = new THREE.DirectionalLight(0x70b9d8, 1.15);
    rim.position.set(18, 12, 28);
    this.scene.add(rim);
  }

  private buildWorld(): void {
    for (const surface of LAB_SURFACES) {
      const length = surface.zMax - surface.zMin;
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(48, 0.58, length),
        material(surface.color, surface.id === "ice" ? 0.28 : 0.92),
      );
      panel.position.set(0, -0.29, surface.zMin + length * 0.5);
      this.scene.add(panel);

      const marker = new THREE.Mesh(
        new THREE.BoxGeometry(47.5, 0.025, 0.22),
        material(surface.id === "ice" ? 0x254f5c : 0xe7c765, 0.5),
      );
      marker.position.set(0, 0.02, surface.zMin + 0.35);
      this.scene.add(marker);
    }

    const runout = new THREE.Mesh(
      new THREE.BoxGeometry(48, 0.58, 48),
      material(0x30383a, 0.9),
    );
    runout.position.set(0, -0.29, 143);
    this.scene.add(runout);

    const ramp = new THREE.Mesh(
      new THREE.BoxGeometry(8.8, 0.44, 14.4),
      material(0xc49346, 0.74, 0.08),
    );
    ramp.position.set(0, 0.72, 119);
    ramp.rotation.x = -0.14;
    this.scene.add(ramp);

    const grid = new THREE.GridHelper(260, 52, 0x79939b, 0x34444a);
    grid.position.y = 0.035;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.2;
    this.scene.add(grid);

    for (const x of [-24.5, 24.5]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.5, 256),
        material(0x202d32, 0.8, 0.15),
      );
      rail.position.set(x, 0.75, 40);
      this.scene.add(rail);
    }

    for (let z = -48; z <= 104; z += 16) {
      for (const x of [-7, 7]) {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(0.22, 0.7, 10),
          material(0xf0a43a, 0.65),
        );
        cone.position.set(x + Math.sin(z) * 1.2, 0.35, z);
        this.scene.add(cone);
      }
    }
  }

  private buildVehicle(): void {
    const lower = new THREE.Mesh(
      new THREE.BoxGeometry(1.72, 0.58, 3.3),
      material(0xe45f34, 0.56, 0.14),
    );
    lower.position.y = -0.04;
    this.chassis.add(lower);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.36, 0.72, 1.5),
      material(0x173b49, 0.3, 0.24),
    );
    cabin.position.set(0, 0.55, -0.18);
    this.chassis.add(cabin);

    const nose = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.24, 0.72),
      material(0xf1b84b, 0.5, 0.1),
    );
    nose.position.set(0, 0.18, 1.55);
    this.chassis.add(nose);

    for (const x of [-0.48, 0.48]) {
      const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0xffefb0 }),
      );
      light.position.set(x, 0.24, 1.94);
      this.chassis.add(light);
    }
    this.scene.add(this.chassis);

    const tyreGeometry = new THREE.CylinderGeometry(
      LAB_VEHICLE_CONFIG.wheelRadius,
      LAB_VEHICLE_CONFIG.wheelRadius,
      0.28,
      20,
    );
    const tyreMaterial = material(0x15191a, 0.95);
    for (let index = 0; index < 4; index += 1) {
      const root = new THREE.Group();
      const steering = new THREE.Group();
      const spin = new THREE.Group();
      const tyre = new THREE.Mesh(tyreGeometry, tyreMaterial);
      tyre.rotation.z = Math.PI * 0.5;
      spin.add(tyre);
      steering.add(spin);
      root.add(steering);
      this.scene.add(root);
      this.wheelRoots.push(root);
      this.wheelSteering.push(steering);
      this.wheelSpin.push(spin);
    }
  }

  private updateCamera(
    telemetry: VehicleDynamicsTelemetry,
    mode: CameraMode,
    delta: number,
  ): void {
    const target = new THREE.Vector3(
      telemetry.body.position.x,
      telemetry.body.position.y + 0.45,
      telemetry.body.position.z,
    );
    const rotation = new THREE.Quaternion(
      telemetry.body.rotation.x,
      telemetry.body.rotation.y,
      telemetry.body.rotation.z,
      telemetry.body.rotation.w,
    );
    const forward = LOCAL_FORWARD.clone().applyQuaternion(rotation).normalize();
    const right = new THREE.Vector3()
      .crossVectors(forward, WORLD_UP)
      .normalize();
    const speedLook = Math.min(6, Math.abs(telemetry.forwardSpeed) * 0.25);
    target.addScaledVector(forward, speedLook);
    const desired = target.clone();

    if (mode === "chase") {
      desired
        .addScaledVector(forward, -8.5)
        .addScaledVector(right, 2.5)
        .addScaledVector(WORLD_UP, 4.6);
    } else if (mode === "hood") {
      desired
        .copy(target)
        .addScaledVector(forward, 1.1)
        .addScaledVector(WORLD_UP, 0.75);
      target.addScaledVector(forward, 9);
    } else if (mode === "side") {
      desired
        .addScaledVector(right, 9)
        .addScaledVector(forward, -1.5)
        .addScaledVector(WORLD_UP, 3.1);
    } else if (mode === "tactical") {
      desired.addScaledVector(forward, -6).addScaledVector(WORLD_UP, 13.5);
    } else if (mode === "top-down") {
      desired.addScaledVector(WORLD_UP, 24);
    } else {
      desired.set(28, 32, telemetry.body.position.z - 14);
    }

    const blend = this.cameraReady
      ? 1 - Math.exp(-(mode === "hood" ? 10 : 5.2) * Math.max(0, delta))
      : 1;
    this.camera.position.lerp(desired, blend);
    this.cameraReady = true;
    this.camera.up.copy(mode === "top-down" ? forward : WORLD_UP);
    this.camera.lookAt(target);
  }
}
