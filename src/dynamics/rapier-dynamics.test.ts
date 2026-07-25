import { describe, expect, it } from "vitest";
import { normalizeVehicleIntent } from "../game/vehicle-intent";
import type {
  DynamicsSurfaceProfile,
  RaycastVehicleConfig,
} from "./contracts";
import { RapierDynamicsService } from "./rapier-dynamics";

const ASPHALT: DynamicsSurfaceProfile = {
  id: "asphalt",
  frictionSlip: 4.4,
  rollingResistance: 0.02,
};

const VEHICLE: RaycastVehicleConfig = {
  id: "lab-buggy",
  spawn: { x: 0, y: 1.6, z: -8 },
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

function createFixture() {
  const service = new RapierDynamicsService();
  service.createStaticBox({
    id: "ground",
    centre: { x: 0, y: -0.25, z: 0 },
    halfExtents: { x: 40, y: 0.25, z: 60 },
    friction: 1,
  });
  const vehicle = service.createRaycastVehicle(VEHICLE);
  return { service, vehicle };
}

function runScript() {
  const fixture = createFixture();
  for (let index = 0; index < 180; index += 1) {
    fixture.vehicle.applyIntent(
      normalizeVehicleIntent({
        throttle: index < 130 ? 1 : 0,
        steering: index > 65 && index < 125 ? 0.45 : 0,
        brake: index >= 150 ? 0.65 : 0,
      }),
      ASPHALT,
      1 / 60,
    );
    fixture.service.step(1 / 60);
  }
  return fixture;
}

describe("RapierDynamicsService", () => {
  it("runs a fixed-step raycast vehicle through the project-owned port", () => {
    const { service, vehicle } = runScript();
    const telemetry = vehicle.telemetry();

    expect(Math.abs(telemetry.forwardSpeed)).toBeGreaterThan(0.2);
    expect(telemetry.wheels).toHaveLength(4);
    expect(telemetry.wheels.some((wheel) => wheel.inContact)).toBe(true);
    expect(service.metrics()).toMatchObject({
      engine: "Rapier 3D",
      bodyCount: 1,
      colliderCount: 2,
    });
    service.dispose();
  });

  it("replays identical intent deterministically in the same runtime", () => {
    const first = runScript();
    const second = runScript();
    const firstState = first.vehicle.telemetry();
    const secondState = second.vehicle.telemetry();

    expect(secondState.body.position.x).toBeCloseTo(
      firstState.body.position.x,
      8,
    );
    expect(secondState.body.position.y).toBeCloseTo(
      firstState.body.position.y,
      8,
    );
    expect(secondState.body.position.z).toBeCloseTo(
      firstState.body.position.z,
      8,
    );
    expect(secondState.forwardSpeed).toBeCloseTo(firstState.forwardSpeed, 8);

    first.service.dispose();
    second.service.dispose();
  });

  it("restores a project-owned body capture without persisting solver handles", () => {
    const { service, vehicle } = runScript();
    const capture = vehicle.capture();

    for (let index = 0; index < 45; index += 1) {
      vehicle.applyIntent(
        normalizeVehicleIntent({ throttle: -1 }),
        ASPHALT,
        1 / 60,
      );
      service.step(1 / 60);
    }
    vehicle.restore(capture);

    expect(vehicle.capture()).toEqual(capture);
    service.dispose();
  });
});
