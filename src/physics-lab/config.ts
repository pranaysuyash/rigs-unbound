import type {
  DynamicsService,
  DynamicsSurfaceProfile,
  PhysicalWheelVehicleConfig,
  RaycastVehicleConfig,
} from "../dynamics/contracts";

export interface LabSurfaceZone {
  id: "asphalt" | "gravel" | "mud" | "ice";
  label: string;
  zMin: number;
  zMax: number;
  color: number;
  profile: DynamicsSurfaceProfile;
}

export const LAB_SURFACES: readonly LabSurfaceZone[] = [
  {
    id: "asphalt",
    label: "Asphalt / full grip",
    zMin: -64,
    zMax: -10,
    color: 0x343b3d,
    profile: { id: "asphalt", frictionSlip: 4.5, rollingResistance: 0.018 },
  },
  {
    id: "gravel",
    label: "Gravel / loose response",
    zMin: -10,
    zMax: 30,
    color: 0x8a7353,
    profile: { id: "gravel", frictionSlip: 2.65, rollingResistance: 0.07 },
  },
  {
    id: "mud",
    label: "Mud / load and wheelspin",
    zMin: 30,
    zMax: 70,
    color: 0x4e4932,
    profile: { id: "mud", frictionSlip: 1.28, rollingResistance: 0.2 },
  },
  {
    id: "ice",
    label: "Ice / low lateral authority",
    zMin: 70,
    zMax: 112,
    color: 0xa6c7ca,
    profile: { id: "ice", frictionSlip: 0.52, rollingResistance: 0.008 },
  },
] as const;

export const LAB_VEHICLE_CONFIG: RaycastVehicleConfig = {
  id: "raycast-buggy-01",
  spawn: { x: 0, y: 1.8, z: -52 },
  heading: 0,
  mass: 920,
  chassisHalfExtents: { x: 0.86, y: 0.38, z: 1.65 },
  centreOfMassYOffset: 0.28,
  wheelbase: 2.4,
  track: 1.52,
  wheelRadius: 0.42,
  suspensionRestLength: 0.34,
  suspensionTravel: 0.24,
  suspensionStiffness: 34,
  suspensionCompressionDamping: 4.8,
  suspensionRelaxationDamping: 5.4,
  maximumSuspensionForce: 120_000,
  maximumEngineForce: 8_400,
  maximumBrakeImpulse: 72,
  maximumHandbrakeImpulse: 95,
  maximumSteeringAngle: 0.46,
};

export const BOX3D_LAB_VEHICLE_CONFIG: PhysicalWheelVehicleConfig = {
  id: "physical-buggy-01",
  spawn: { x: 0, y: 1.8, z: -52 },
  heading: 0,
  mass: 920,
  chassisHalfExtents: { x: 0.86, y: 0.38, z: 1.65 },
  centreOfMassYOffset: 0.28,
  wheelbase: 2.4,
  track: 1.52,
  wheelRadius: 0.42,
  wheelWidth: 0.28,
  suspensionRestLength: 0.34,
  suspensionTravel: 0.24,
  suspensionHertz: 4.6,
  suspensionDampingRatio: 0.86,
  maximumSpinSpeed: 42,
  maximumSpinTorque: 1_850,
  maximumBrakeTorque: 3_800,
  maximumSteeringTorque: 2_400,
  maximumSteeringAngle: 0.46,
};

export function labSurfaceAt(z: number): LabSurfaceZone {
  return (
    LAB_SURFACES.find((surface) => z >= surface.zMin && z < surface.zMax) ??
    LAB_SURFACES[0]!
  );
}

export function buildLabCollisionWorld(service: DynamicsService): void {
  for (const surface of LAB_SURFACES) {
    const length = surface.zMax - surface.zMin;
    service.createStaticBox({
      id: `surface:${surface.id}`,
      centre: {
        x: 0,
        y: -0.3,
        z: surface.zMin + length * 0.5,
      },
      halfExtents: { x: 24, y: 0.3, z: length * 0.5 },
      friction: Math.max(0.12, surface.profile.frictionSlip * 0.24),
    });
  }

  const rampAngle = -0.14;
  service.createStaticBox({
    id: "ramp",
    centre: { x: 0, y: 0.72, z: 119 },
    halfExtents: { x: 4.4, y: 0.22, z: 7.2 },
    rotation: {
      x: Math.sin(rampAngle * 0.5),
      y: 0,
      z: 0,
      w: Math.cos(rampAngle * 0.5),
    },
    friction: 1,
  });

  service.createStaticBox({
    id: "runout",
    centre: { x: 0, y: -0.3, z: 143 },
    halfExtents: { x: 24, y: 0.3, z: 24 },
    friction: 1,
  });

  for (const x of [-24.5, 24.5]) {
    service.createStaticBox({
      id: `boundary:${x}`,
      centre: { x, y: 0.75, z: 40 },
      halfExtents: { x: 0.5, y: 0.75, z: 128 },
      friction: 0.8,
      restitution: 0.08,
    });
  }
}
