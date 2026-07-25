import type { VehicleIntent } from "../game/vehicle-intent";

export interface Vector3Value {
  x: number;
  y: number;
  z: number;
}

export interface QuaternionValue {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface BodyState {
  position: Vector3Value;
  rotation: QuaternionValue;
  linearVelocity: Vector3Value;
  angularVelocity: Vector3Value;
}

export interface WheelDynamicsState {
  connection: Vector3Value;
  contactPoint: Vector3Value | null;
  contactNormal: Vector3Value | null;
  inContact: boolean;
  steering: number;
  rotation: number;
  suspensionLength: number;
  suspensionCompression: number;
  forwardImpulse: number;
  sideImpulse: number;
  longitudinalSlip: number;
}

export interface DynamicsSurfaceProfile {
  id: string;
  frictionSlip: number;
  rollingResistance: number;
}

export interface RaycastVehicleConfig {
  id: string;
  spawn: Vector3Value;
  heading: number;
  mass: number;
  chassisHalfExtents: Vector3Value;
  centreOfMassYOffset: number;
  wheelbase: number;
  track: number;
  wheelRadius: number;
  suspensionRestLength: number;
  suspensionTravel: number;
  suspensionStiffness: number;
  suspensionCompressionDamping: number;
  suspensionRelaxationDamping: number;
  maximumSuspensionForce: number;
  maximumEngineForce: number;
  maximumBrakeImpulse: number;
  maximumHandbrakeImpulse: number;
  maximumSteeringAngle: number;
}

export interface PhysicalWheelVehicleConfig {
  id: string;
  spawn: Vector3Value;
  heading: number;
  mass: number;
  chassisHalfExtents: Vector3Value;
  centreOfMassYOffset: number;
  wheelbase: number;
  track: number;
  wheelRadius: number;
  wheelWidth: number;
  suspensionRestLength: number;
  suspensionTravel: number;
  suspensionHertz: number;
  suspensionDampingRatio: number;
  maximumSpinSpeed: number;
  maximumSpinTorque: number;
  maximumBrakeTorque: number;
  maximumSteeringTorque: number;
  maximumSteeringAngle: number;
}

export interface StaticBoxConfig {
  id: string;
  centre: Vector3Value;
  halfExtents: Vector3Value;
  rotation?: QuaternionValue;
  friction: number;
  restitution?: number;
}

export interface DynamicsMetrics {
  engine: string;
  engineVersion: string;
  stepMilliseconds: number;
  bodyCount: number;
  activeBodyCount: number;
  colliderCount: number;
  wheelContactCount: number;
}

export interface VehicleDynamicsTelemetry {
  id: string;
  body: BodyState;
  forwardSpeed: number;
  speed: number;
  steering: number;
  surfaceId: string;
  averageLongitudinalSlip: number;
  wheels: readonly WheelDynamicsState[];
}

export interface DynamicsDebugGeometry {
  vertices: Float32Array;
  colors: Float32Array;
}

/**
 * Project-owned capture for a vehicle.
 *
 * This intentionally stores plain body/assembly state rather than solver
 * objects or an opaque world snapshot. Durable game saves can migrate this
 * shape without understanding engine handles or insertion order.
 */
export interface VehicleDynamicsCapture {
  version: 1;
  vehicleId: string;
  body: BodyState;
  parts?: readonly BodyState[];
}

export interface DynamicsVehicle {
  readonly id: string;
  applyIntent(
    intent: VehicleIntent,
    surface: DynamicsSurfaceProfile,
    dt: number,
  ): void;
  telemetry(): VehicleDynamicsTelemetry;
  capture(): VehicleDynamicsCapture;
  restore(capture: VehicleDynamicsCapture): void;
}

export interface DynamicsService {
  readonly engine: string;
  readonly engineVersion: string;
  createStaticBox(config: StaticBoxConfig): void;
  step(dt: number): void;
  metrics(): DynamicsMetrics;
  debugGeometry(): DynamicsDebugGeometry;
  dispose(): void;
}

/**
 * Vehicle-creation algorithms are explicit service capabilities. The base
 * world port must not make raycast wheels, physical wheels, tracks, buoyancy,
 * or any other controller family universal by accident.
 */
export interface RaycastVehicleDynamicsService extends DynamicsService {
  createRaycastVehicle(config: RaycastVehicleConfig): DynamicsVehicle;
}

export interface PhysicalWheelDynamicsService extends DynamicsService {
  createPhysicalWheelVehicle(
    config: PhysicalWheelVehicleConfig,
  ): DynamicsVehicle;
}
