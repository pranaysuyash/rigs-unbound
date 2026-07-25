import createBox3D, {
  type Body,
  type Box3DModule,
  type Quaternion,
  type Shape,
  type WheelJoint,
  type World,
} from "box3d-wasm/standard";
import type { VehicleIntent } from "../game/vehicle-intent";
import type {
  BodyState,
  DynamicsDebugGeometry,
  DynamicsMetrics,
  DynamicsSurfaceProfile,
  DynamicsVehicle,
  PhysicalWheelDynamicsService,
  PhysicalWheelVehicleConfig,
  QuaternionValue,
  StaticBoxConfig,
  Vector3Value,
  VehicleDynamicsCapture,
  VehicleDynamicsTelemetry,
  WheelDynamicsState,
} from "./contracts";

const MINIMUM_STEP = 1 / 240;
const MAXIMUM_STEP = 1 / 20;
const BOX3D_ENGINE_VERSION = "0.1.0 / box3d-wasm 0.2.0";
const SQRT_HALF = Math.SQRT1_2;

const IDENTITY: Quaternion = { x: 0, y: 0, z: 0, w: 1 };
const SUSPENSION_FRAME: Quaternion = { x: 0.5, y: 0.5, z: 0.5, w: 0.5 };
const WHEEL_FRAME: Quaternion = {
  x: -SQRT_HALF,
  y: 0,
  z: 0,
  w: SQRT_HALF,
};
const WHEEL_BODY_ORIENTATION: Quaternion = {
  x: 0,
  y: 0,
  z: -SQRT_HALF,
  w: SQRT_HALF,
};

function finiteStep(dt: number): number {
  if (!Number.isFinite(dt) || dt <= 0) {
    throw new Error("Dynamics step must be a positive finite duration.");
  }
  return Math.min(MAXIMUM_STEP, Math.max(MINIMUM_STEP, dt));
}

function copyVector(value: Vector3Value): Vector3Value {
  return { x: value.x, y: value.y, z: value.z };
}

function copyQuaternion(value: QuaternionValue): QuaternionValue {
  return { x: value.x, y: value.y, z: value.z, w: value.w };
}

function multiplyQuaternion(
  left: QuaternionValue,
  right: QuaternionValue,
): QuaternionValue {
  return {
    x:
      left.w * right.x + left.x * right.w + left.y * right.z - left.z * right.y,
    y:
      left.w * right.y - left.x * right.z + left.y * right.w + left.z * right.x,
    z:
      left.w * right.z + left.x * right.y - left.y * right.x + left.z * right.w,
    w:
      left.w * right.w - left.x * right.x - left.y * right.y - left.z * right.z,
  };
}

function rotateVector(
  rotation: QuaternionValue,
  value: Vector3Value,
): Vector3Value {
  const tx = 2 * (rotation.y * value.z - rotation.z * value.y);
  const ty = 2 * (rotation.z * value.x - rotation.x * value.z);
  const tz = 2 * (rotation.x * value.y - rotation.y * value.x);
  return {
    x: value.x + rotation.w * tx + (rotation.y * tz - rotation.z * ty),
    y: value.y + rotation.w * ty + (rotation.z * tx - rotation.x * tz),
    z: value.z + rotation.w * tz + (rotation.x * ty - rotation.y * tx),
  };
}

function inverseRotateVector(
  rotation: QuaternionValue,
  value: Vector3Value,
): Vector3Value {
  return rotateVector(
    { x: -rotation.x, y: -rotation.y, z: -rotation.z, w: rotation.w },
    value,
  );
}

function add(left: Vector3Value, right: Vector3Value): Vector3Value {
  return {
    x: left.x + right.x,
    y: left.y + right.y,
    z: left.z + right.z,
  };
}

function subtract(left: Vector3Value, right: Vector3Value): Vector3Value {
  return {
    x: left.x - right.x,
    y: left.y - right.y,
    z: left.z - right.z,
  };
}

function magnitude(value: Vector3Value): number {
  return Math.hypot(value.x, value.y, value.z);
}

function stateOf(body: Body): BodyState {
  return {
    position: copyVector(body.getPosition()),
    rotation: copyQuaternion(body.getRotation()),
    linearVelocity: copyVector(body.getLinearVelocity()),
    angularVelocity: copyVector(body.getAngularVelocity()),
  };
}

function restoreBody(body: Body, state: BodyState): void {
  body.setTransform(state.position, state.rotation);
  body.setLinearVelocity(state.linearVelocity);
  body.setAngularVelocity(state.angularVelocity);
  body.setAwake(true);
}

function headingRotation(heading: number): QuaternionValue {
  return {
    x: 0,
    y: Math.sin(heading * 0.5),
    z: 0,
    w: Math.cos(heading * 0.5),
  };
}

interface Box3DWheel {
  readonly body: Body;
  readonly shape: Shape;
  readonly joint: WheelJoint;
  readonly connection: Vector3Value;
  rotation: number;
}

class Box3DPhysicalWheelVehicle implements DynamicsVehicle {
  readonly id: string;
  private lastSurface: DynamicsSurfaceProfile = {
    id: "asphalt",
    frictionSlip: 4.4,
    rollingResistance: 0.02,
  };
  private lastSteering = 0;
  private lastDt = 1 / 60;

  constructor(
    private readonly chassis: Body,
    private readonly wheels: readonly Box3DWheel[],
    private readonly config: PhysicalWheelVehicleConfig,
  ) {
    this.id = config.id;
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
      intent.steering * this.config.maximumSteeringAngle * speedSteeringScale;
    this.lastSteering = steering;
    const requestedSpin =
      intent.throttle *
      this.config.maximumSpinSpeed *
      (intent.boost ? 1.15 : 1);
    const braking = Math.max(intent.brake, intent.handbrake);

    this.wheels.forEach((wheel, index) => {
      const front = index < 2;
      wheel.rotation += wheel.joint.getSpinSpeed() * this.lastDt;
      wheel.joint.setTargetSteeringAngle(front ? steering : 0);
      wheel.joint.setMaxSteeringTorque(this.config.maximumSteeringTorque);
      wheel.joint.setSpinMotorSpeed(braking > 0.02 ? 0 : requestedSpin);
      wheel.joint.setMaxSpinTorque(
        braking > 0.02
          ? this.config.maximumBrakeTorque * braking
          : this.config.maximumSpinTorque *
              Math.max(0.08, Math.abs(intent.throttle)),
      );
      wheel.shape.setFriction(
        Math.max(0.08, Math.min(1.8, surface.frictionSlip * 0.24)),
      );
      wheel.joint.wakeBodies();
    });

    if (
      Math.abs(intent.throttle) < 0.02 &&
      braking < 0.02 &&
      surface.rollingResistance > 0
    ) {
      const velocity = this.chassis.getLinearVelocity();
      const decay = Math.max(0, 1 - surface.rollingResistance * this.lastDt);
      this.chassis.setLinearVelocity({
        x: velocity.x * decay,
        y: velocity.y,
        z: velocity.z * decay,
      });
    }
  }

  telemetry(): VehicleDynamicsTelemetry {
    const body = stateOf(this.chassis);
    const forwardSpeed = this.forwardSpeed();
    let totalSlip = 0;
    const wheels: WheelDynamicsState[] = this.wheels.map((wheel) => {
      const worldWheelPosition = wheel.body.getPosition();
      const localWheelPosition = inverseRotateVector(
        body.rotation,
        subtract(worldWheelPosition, body.position),
      );
      const suspensionLength = Math.max(
        0,
        wheel.connection.y - localWheelPosition.y,
      );
      const suspensionCompression = Math.max(
        0,
        Math.min(
          1,
          (this.config.suspensionRestLength - suspensionLength) /
            Math.max(0.01, this.config.suspensionTravel),
        ),
      );
      const angularSpeed = wheel.joint.getSpinSpeed();
      const wheelLinearSpeed = angularSpeed * this.config.wheelRadius;
      const longitudinalSlip =
        Math.abs(wheelLinearSpeed - forwardSpeed) /
        Math.max(2, Math.abs(wheelLinearSpeed), Math.abs(forwardSpeed));
      totalSlip += Math.min(1, longitudinalSlip);
      const aabb = wheel.shape.getAABB();
      const inContact = aabb.lowerBound.y <= 0.08;
      return {
        connection: wheel.connection,
        contactPoint: inContact
          ? {
              x: worldWheelPosition.x,
              y: aabb.lowerBound.y,
              z: worldWheelPosition.z,
            }
          : null,
        contactNormal: inContact ? { x: 0, y: 1, z: 0 } : null,
        inContact,
        steering: wheel.joint.getSteeringAngle(),
        rotation: wheel.rotation,
        suspensionLength,
        suspensionCompression,
        forwardImpulse: 0,
        sideImpulse: 0,
        longitudinalSlip: Math.min(1, longitudinalSlip),
      };
    });

    return {
      id: this.id,
      body,
      forwardSpeed,
      speed: magnitude(body.linearVelocity),
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
      body: stateOf(this.chassis),
      parts: this.wheels.map((wheel) => stateOf(wheel.body)),
    };
  }

  restore(capture: VehicleDynamicsCapture): void {
    if (
      capture.version !== 1 ||
      capture.vehicleId !== this.id ||
      capture.parts?.length !== this.wheels.length
    ) {
      throw new Error(
        `Capture ${capture.vehicleId} is not compatible with physical-wheel assembly ${this.id}.`,
      );
    }
    restoreBody(this.chassis, capture.body);
    this.wheels.forEach((wheel, index) => {
      restoreBody(wheel.body, capture.parts![index]!);
      wheel.rotation = 0;
    });
  }

  private forwardSpeed(): number {
    const forward = rotateVector(this.chassis.getRotation(), {
      x: 0,
      y: 0,
      z: 1,
    });
    const velocity = this.chassis.getLinearVelocity();
    return (
      velocity.x * forward.x + velocity.y * forward.y + velocity.z * forward.z
    );
  }
}

export class Box3DDynamicsService implements PhysicalWheelDynamicsService {
  readonly engine = "Box3D";
  readonly engineVersion = BOX3D_ENGINE_VERSION;

  private readonly world: World;
  private readonly bodies: Body[] = [];
  private readonly shapes: Shape[] = [];
  private readonly joints: WheelJoint[] = [];
  private readonly vehicles: Box3DPhysicalWheelVehicle[] = [];
  private readonly staticBoxIds = new Set<string>();
  private lastStepMilliseconds = 0;
  private disposed = false;

  private constructor(module: Box3DModule) {
    this.world = new module.World({
      gravity: { x: 0, y: -9.81, z: 0 },
      enableSleep: true,
      enableContinuous: true,
    });
  }

  static async create(): Promise<Box3DDynamicsService> {
    const module = await createBox3D();
    if (module.threaded) {
      throw new Error(
        "Box3D Probe 01 requires the reviewed single-thread standard build.",
      );
    }
    return new Box3DDynamicsService(module);
  }

  createStaticBox(config: StaticBoxConfig): void {
    this.assertActive();
    if (this.staticBoxIds.has(config.id)) {
      throw new Error(`Static dynamics id already exists: ${config.id}`);
    }
    const body = this.world.createBody({
      type: "static",
      position: config.centre,
      rotation: config.rotation ?? IDENTITY,
      name: config.id,
    });
    const shape = body.createBox({
      halfExtents: config.halfExtents,
      friction: Math.max(0, config.friction),
      restitution: Math.max(0, config.restitution ?? 0),
    });
    this.bodies.push(body);
    this.shapes.push(shape);
    this.staticBoxIds.add(config.id);
  }

  createPhysicalWheelVehicle(
    config: PhysicalWheelVehicleConfig,
  ): DynamicsVehicle {
    this.assertActive();
    if (this.vehicles.some((vehicle) => vehicle.id === config.id)) {
      throw new Error(`Dynamics vehicle id already exists: ${config.id}`);
    }

    const heading = headingRotation(config.heading);
    const chassis = this.world.createBody({
      type: "dynamic",
      position: config.spawn,
      rotation: heading,
      linearDamping: 0.08,
      angularDamping: 0.34,
      enableSleep: true,
      isBullet: true,
      name: config.id,
    });
    const chassisVolume =
      8 *
      config.chassisHalfExtents.x *
      config.chassisHalfExtents.y *
      config.chassisHalfExtents.z;
    const chassisShape = chassis.createBox({
      halfExtents: config.chassisHalfExtents,
      offset: { x: 0, y: -config.centreOfMassYOffset, z: 0 },
      density: Math.max(1, config.mass / Math.max(0.1, chassisVolume)),
      friction: 0.65,
      restitution: 0.04,
    });
    this.bodies.push(chassis);
    this.shapes.push(chassisShape);

    const halfTrack = config.track * 0.5;
    const halfWheelbase = config.wheelbase * 0.5;
    const connections: readonly Vector3Value[] = [
      { x: -halfTrack, y: -config.chassisHalfExtents.y, z: halfWheelbase },
      { x: halfTrack, y: -config.chassisHalfExtents.y, z: halfWheelbase },
      { x: -halfTrack, y: -config.chassisHalfExtents.y, z: -halfWheelbase },
      { x: halfTrack, y: -config.chassisHalfExtents.y, z: -halfWheelbase },
    ];

    const wheelBodyRotation = multiplyQuaternion(
      heading,
      WHEEL_BODY_ORIENTATION,
    );
    const wheels = connections.map((connection, index): Box3DWheel => {
      const restPosition = {
        x: connection.x,
        y: connection.y - config.suspensionRestLength,
        z: connection.z,
      };
      const worldPosition = add(
        config.spawn,
        rotateVector(heading, restPosition),
      );
      const body = this.world.createBody({
        type: "dynamic",
        position: worldPosition,
        rotation: wheelBodyRotation,
        linearDamping: 0.04,
        angularDamping: 0.06,
        enableSleep: true,
        isBullet: true,
        name: `${config.id}:wheel:${index}`,
      });
      const shape = body.createCapsule({
        height: Math.max(0.04, config.wheelWidth * 0.35),
        radius: config.wheelRadius,
        density: 28,
        friction: 1.05,
        restitution: 0.02,
      });
      const front = index < 2;
      const joint = this.world.createWheelJoint(chassis, body, {
        localFrameA: {
          position: restPosition,
          rotation: SUSPENSION_FRAME,
        },
        localFrameB: {
          position: { x: 0, y: 0, z: 0 },
          rotation: WHEEL_FRAME,
        },
        collideConnected: false,
        enableSuspensionSpring: true,
        suspensionHertz: config.suspensionHertz,
        suspensionDampingRatio: config.suspensionDampingRatio,
        enableSuspensionLimit: true,
        lowerSuspensionLimit: -config.suspensionTravel * 0.55,
        upperSuspensionLimit: config.suspensionTravel * 0.45,
        enableSpinMotor: true,
        maxSpinTorque: config.maximumSpinTorque,
        spinSpeed: 0,
        enableSteering: front,
        steeringHertz: 7,
        steeringDampingRatio: 0.92,
        targetSteeringAngle: 0,
        maxSteeringTorque: config.maximumSteeringTorque,
        enableSteeringLimit: front,
        lowerSteeringLimit: -config.maximumSteeringAngle,
        upperSteeringLimit: config.maximumSteeringAngle,
      });
      this.bodies.push(body);
      this.shapes.push(shape);
      this.joints.push(joint);
      return {
        body,
        shape,
        joint,
        connection,
        rotation: 0,
      };
    });

    const vehicle = new Box3DPhysicalWheelVehicle(chassis, wheels, config);
    this.vehicles.push(vehicle);
    return vehicle;
  }

  step(dt: number): void {
    this.assertActive();
    const step = finiteStep(dt);
    const startedAt = performance.now();
    this.world.step(step, 4);
    this.lastStepMilliseconds = performance.now() - startedAt;
  }

  metrics(): DynamicsMetrics {
    this.assertActive();
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
      bodyCount: this.bodies.length,
      activeBodyCount: this.world.getAwakeBodyCount(),
      colliderCount: this.shapes.length,
      wheelContactCount,
    };
  }

  debugGeometry(): DynamicsDebugGeometry {
    this.assertActive();
    return {
      vertices: new Float32Array(),
      colors: new Float32Array(),
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.world.destroy();
    for (const joint of this.joints) joint.delete();
    for (const shape of this.shapes) shape.delete();
    for (const body of this.bodies) body.delete();
    this.joints.length = 0;
    this.shapes.length = 0;
    this.bodies.length = 0;
    this.vehicles.length = 0;
    this.staticBoxIds.clear();
    this.world.delete();
  }

  private assertActive(): void {
    if (this.disposed) {
      throw new Error("Dynamics service has been disposed.");
    }
  }
}
