import RAPIER, {
  type DynamicRayCastVehicleController,
  type RigidBody,
} from "@dimforge/rapier3d/rapier.js";
import type { VehicleIntent } from "../game/vehicle-intent";
import type {
  BodyState,
  DynamicsDebugGeometry,
  DynamicsMetrics,
  DynamicsService,
  DynamicsSurfaceProfile,
  DynamicsVehicle,
  QuaternionValue,
  RaycastVehicleConfig,
  StaticBoxConfig,
  Vector3Value,
  VehicleDynamicsCapture,
  VehicleDynamicsTelemetry,
  WheelDynamicsState,
} from "./contracts";

const MINIMUM_STEP = 1 / 240;
const MAXIMUM_STEP = 1 / 20;

function vector(value: RAPIER.Vector): Vector3Value {
  return { x: value.x, y: value.y, z: value.z };
}

function quaternion(value: RAPIER.Rotation): QuaternionValue {
  return { x: value.x, y: value.y, z: value.z, w: value.w };
}

function bodyState(body: RigidBody): BodyState {
  return {
    position: vector(body.translation()),
    rotation: quaternion(body.rotation()),
    linearVelocity: vector(body.linvel()),
    angularVelocity: vector(body.angvel()),
  };
}

function rotateVector(
  rotation: RAPIER.Rotation,
  value: Vector3Value,
): Vector3Value {
  const tx = 2 * (rotation.y * value.z - rotation.z * value.y);
  const ty = 2 * (rotation.z * value.x - rotation.x * value.z);
  const tz = 2 * (rotation.x * value.y - rotation.y * value.x);
  return {
    x:
      value.x +
      rotation.w * tx +
      (rotation.y * tz - rotation.z * ty),
    y:
      value.y +
      rotation.w * ty +
      (rotation.z * tx - rotation.x * tz),
    z:
      value.z +
      rotation.w * tz +
      (rotation.x * ty - rotation.y * tx),
  };
}

function magnitude(value: RAPIER.Vector): number {
  return Math.hypot(value.x, value.y, value.z);
}

function finiteStep(dt: number): number {
  if (!Number.isFinite(dt) || dt <= 0) {
    throw new Error("Dynamics step must be a positive finite duration.");
  }
  return Math.min(MAXIMUM_STEP, Math.max(MINIMUM_STEP, dt));
}

class RapierRaycastVehicle implements DynamicsVehicle {
  readonly id: string;
  private readonly wheelConnections: readonly Vector3Value[];
  private readonly previousWheelRotations: number[];
  private readonly wheelAngularSpeeds: number[];
  private lastSurface: DynamicsSurfaceProfile = {
    id: "asphalt",
    frictionSlip: 4.4,
    rollingResistance: 0.02,
  };
  private lastSteering = 0;
  private lastDt = 1 / 60;

  constructor(
    private readonly body: RigidBody,
    private readonly controller: DynamicRayCastVehicleController,
    private readonly config: RaycastVehicleConfig,
  ) {
    this.id = config.id;
    const halfTrack = config.track * 0.5;
    const halfWheelbase = config.wheelbase * 0.5;
    this.wheelConnections = [
      { x: -halfTrack, y: -config.chassisHalfExtents.y, z: halfWheelbase },
      { x: halfTrack, y: -config.chassisHalfExtents.y, z: halfWheelbase },
      { x: -halfTrack, y: -config.chassisHalfExtents.y, z: -halfWheelbase },
      { x: halfTrack, y: -config.chassisHalfExtents.y, z: -halfWheelbase },
    ];
    this.previousWheelRotations = [0, 0, 0, 0];
    this.wheelAngularSpeeds = [0, 0, 0, 0];

    controller.indexUpAxis = 1;
    controller.setIndexForwardAxis = 2;
    for (const connection of this.wheelConnections) {
      controller.addWheel(
        connection,
        { x: 0, y: -1, z: 0 },
        { x: -1, y: 0, z: 0 },
        config.suspensionRestLength,
        config.wheelRadius,
      );
    }
    for (let index = 0; index < controller.numWheels(); index += 1) {
      controller.setWheelSuspensionStiffness(
        index,
        config.suspensionStiffness,
      );
      controller.setWheelSuspensionCompression(
        index,
        config.suspensionCompressionDamping,
      );
      controller.setWheelSuspensionRelaxation(
        index,
        config.suspensionRelaxationDamping,
      );
      controller.setWheelMaxSuspensionTravel(
        index,
        config.suspensionTravel,
      );
      controller.setWheelMaxSuspensionForce(
        index,
        config.maximumSuspensionForce,
      );
      controller.setWheelFrictionSlip(index, this.lastSurface.frictionSlip);
      controller.setWheelSideFrictionStiffness(index, 1.15);
    }
  }

  applyIntent(
    intent: VehicleIntent,
    surface: DynamicsSurfaceProfile,
    dt: number,
  ): void {
    this.lastSurface = surface;
    this.lastDt = finiteStep(dt);
    const speed = this.forwardSpeed();
    const speedSteeringScale = Math.max(
      0.32,
      1 - Math.min(1, Math.abs(speed) / 24) * 0.64,
    );
    const steering =
      intent.steering *
      this.config.maximumSteeringAngle *
      speedSteeringScale;
    this.lastSteering = steering;

    const engine =
      intent.throttle *
      this.config.maximumEngineForce *
      (intent.boost ? 1.18 : 1);
    const brake = intent.brake * this.config.maximumBrakeImpulse;
    const handbrake =
      intent.handbrake * this.config.maximumHandbrakeImpulse;

    for (let index = 0; index < this.controller.numWheels(); index += 1) {
      const front = index < 2;
      this.controller.setWheelSteering(index, front ? steering : 0);
      this.controller.setWheelEngineForce(index, engine * 0.25);
      this.controller.setWheelBrake(
        index,
        Math.max(brake, front ? 0 : handbrake),
      );
      this.controller.setWheelFrictionSlip(
        index,
        Math.max(0.35, surface.frictionSlip),
      );
    }

    const rollingResistance = Math.max(0, surface.rollingResistance);
    if (
      Math.abs(intent.throttle) < 0.02 &&
      intent.brake < 0.02 &&
      rollingResistance > 0
    ) {
      const velocity = this.body.linvel();
      const decay = Math.max(0, 1 - rollingResistance * this.lastDt);
      this.body.setLinvel(
        { x: velocity.x * decay, y: velocity.y, z: velocity.z * decay },
        true,
      );
    }

    for (let index = 0; index < this.controller.numWheels(); index += 1) {
      this.previousWheelRotations[index] =
        this.controller.wheelRotation(index) ?? 0;
    }
    this.controller.updateVehicle(this.lastDt);
    for (let index = 0; index < this.controller.numWheels(); index += 1) {
      const rotation = this.controller.wheelRotation(index) ?? 0;
      this.wheelAngularSpeeds[index] =
        (rotation - (this.previousWheelRotations[index] ?? rotation)) /
        this.lastDt;
    }
  }

  telemetry(): VehicleDynamicsTelemetry {
    const body = bodyState(this.body);
    const speed = magnitude(this.body.linvel());
    const forwardSpeed = this.forwardSpeed();
    const wheels: WheelDynamicsState[] = [];
    let totalSlip = 0;

    for (let index = 0; index < this.controller.numWheels(); index += 1) {
      const rotation = this.controller.wheelRotation(index) ?? 0;
      const angularSpeed = this.wheelAngularSpeeds[index] ?? 0;
      const wheelLinearSpeed = angularSpeed * this.config.wheelRadius;
      const longitudinalSlip =
        Math.abs(wheelLinearSpeed - forwardSpeed) /
        Math.max(2, Math.abs(wheelLinearSpeed), Math.abs(forwardSpeed));
      totalSlip += Math.min(1, longitudinalSlip);
      const suspensionLength =
        this.controller.wheelSuspensionLength(index) ??
        this.config.suspensionRestLength;
      const suspensionCompression = Math.max(
        0,
        Math.min(
          1,
          (this.config.suspensionRestLength - suspensionLength) /
            Math.max(0.01, this.config.suspensionTravel),
        ),
      );
      const contactPoint = this.controller.wheelContactPoint(index);
      const contactNormal = this.controller.wheelContactNormal(index);
      wheels.push({
        connection: this.wheelConnections[index]!,
        contactPoint: contactPoint ? vector(contactPoint) : null,
        contactNormal: contactNormal ? vector(contactNormal) : null,
        inContact: this.controller.wheelIsInContact(index),
        steering: this.controller.wheelSteering(index) ?? 0,
        rotation,
        suspensionLength,
        suspensionCompression,
        forwardImpulse: this.controller.wheelForwardImpulse(index) ?? 0,
        sideImpulse: this.controller.wheelSideImpulse(index) ?? 0,
        longitudinalSlip: Math.min(1, longitudinalSlip),
      });
    }

    return {
      id: this.id,
      body,
      forwardSpeed,
      speed,
      steering: this.lastSteering,
      surfaceId: this.lastSurface.id,
      averageLongitudinalSlip: totalSlip / Math.max(1, wheels.length),
      wheels,
    };
  }

  capture(): VehicleDynamicsCapture {
    return {
      version: 1,
      vehicleId: this.id,
      body: bodyState(this.body),
    };
  }

  restore(capture: VehicleDynamicsCapture): void {
    if (capture.version !== 1 || capture.vehicleId !== this.id) {
      throw new Error(
        `Capture ${capture.vehicleId} is not compatible with ${this.id}.`,
      );
    }
    const { body } = capture;
    this.body.setTranslation(body.position, true);
    this.body.setRotation(body.rotation, true);
    this.body.setLinvel(body.linearVelocity, true);
    this.body.setAngvel(body.angularVelocity, true);
  }

  private forwardSpeed(): number {
    const forward = rotateVector(this.body.rotation(), { x: 0, y: 0, z: 1 });
    const velocity = this.body.linvel();
    return (
      velocity.x * forward.x +
      velocity.y * forward.y +
      velocity.z * forward.z
    );
  }
}

export class RapierDynamicsService implements DynamicsService {
  readonly engine = "Rapier 3D";
  readonly engineVersion = RAPIER.version();

  private readonly world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  private readonly vehicles: RapierRaycastVehicle[] = [];
  private readonly staticBoxIds = new Set<string>();
  private lastStepMilliseconds = 0;
  private disposed = false;

  constructor() {
    this.world.timestep = 1 / 60;
    this.world.numSolverIterations = 6;
    this.world.numInternalPgsIterations = 2;
    this.world.maxCcdSubsteps = 1;
  }

  createStaticBox(config: StaticBoxConfig): void {
    this.assertActive();
    if (this.staticBoxIds.has(config.id)) {
      throw new Error(`Static dynamics id already exists: ${config.id}`);
    }
    const collider = RAPIER.ColliderDesc.cuboid(
      config.halfExtents.x,
      config.halfExtents.y,
      config.halfExtents.z,
    )
      .setTranslation(config.centre.x, config.centre.y, config.centre.z)
      .setFriction(Math.max(0, config.friction))
      .setRestitution(Math.max(0, config.restitution ?? 0));
    if (config.rotation) {
      collider.setRotation(config.rotation);
    }
    this.world.createCollider(collider);
    this.staticBoxIds.add(config.id);
  }

  createRaycastVehicle(config: RaycastVehicleConfig): DynamicsVehicle {
    this.assertActive();
    if (this.vehicles.some((vehicle) => vehicle.id === config.id)) {
      throw new Error(`Dynamics vehicle id already exists: ${config.id}`);
    }

    const halfHeight = config.chassisHalfExtents.y;
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(config.spawn.x, config.spawn.y, config.spawn.z)
        .setRotation({
          x: 0,
          y: Math.sin(config.heading * 0.5),
          z: 0,
          w: Math.cos(config.heading * 0.5),
        })
        .setAdditionalMass(Math.max(1, config.mass))
        .setLinearDamping(0.08)
        .setAngularDamping(0.32)
        .setCcdEnabled(true),
    );
    this.world.createCollider(
      RAPIER.ColliderDesc.roundCuboid(
        config.chassisHalfExtents.x,
        halfHeight,
        config.chassisHalfExtents.z,
        Math.min(0.16, halfHeight * 0.25),
      )
        .setTranslation(0, -config.centreOfMassYOffset, 0)
        .setFriction(0.8)
        .setRestitution(0.05),
      body,
    );

    const controller = this.world.createVehicleController(body);
    const vehicle = new RapierRaycastVehicle(body, controller, config);
    this.vehicles.push(vehicle);
    return vehicle;
  }

  step(dt: number): void {
    this.assertActive();
    const step = finiteStep(dt);
    const startedAt = performance.now();
    this.world.timestep = step;
    this.world.step();
    this.lastStepMilliseconds = performance.now() - startedAt;
  }

  metrics(): DynamicsMetrics {
    this.assertActive();
    let activeBodyCount = 0;
    this.world.bodies.forEach((body) => {
      if (body.isDynamic() && !body.isSleeping()) activeBodyCount += 1;
    });
    let wheelContactCount = 0;
    for (const vehicle of this.vehicles) {
      wheelContactCount += vehicle
        .telemetry()
        .wheels.filter((wheel) => wheel.inContact).length;
    }
    return {
      engine: this.engine,
      engineVersion: this.engineVersion,
      stepMilliseconds: this.lastStepMilliseconds,
      bodyCount: this.world.bodies.len(),
      activeBodyCount,
      colliderCount: this.world.colliders.len(),
      wheelContactCount,
    };
  }

  debugGeometry(): DynamicsDebugGeometry {
    this.assertActive();
    const buffers = this.world.debugRender();
    return {
      vertices: buffers.vertices,
      colors: buffers.colors,
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.vehicles.length = 0;
    this.staticBoxIds.clear();
    this.world.free();
  }

  private assertActive(): void {
    if (this.disposed) {
      throw new Error("Dynamics service has been disposed.");
    }
  }
}
