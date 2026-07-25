import { describe, expect, it } from "vitest";
import { normalizeVehicleIntent } from "../game/vehicle-intent";
import { BOX3D_LAB_VEHICLE_CONFIG } from "../physics-lab/config";
import { Box3DDynamicsService } from "./box3d-dynamics";
import type { DynamicsSurfaceProfile } from "./contracts";

const ASPHALT: DynamicsSurfaceProfile = {
  id: "asphalt",
  frictionSlip: 4.4,
  rollingResistance: 0.02,
};

async function createFixture() {
  const service = await Box3DDynamicsService.create();
  service.createStaticBox({
    id: "ground",
    centre: { x: 0, y: -0.25, z: 0 },
    halfExtents: { x: 40, y: 0.25, z: 60 },
    friction: 1,
  });
  const vehicle = service.createPhysicalWheelVehicle(BOX3D_LAB_VEHICLE_CONFIG);
  for (let index = 0; index < 90; index += 1) {
    vehicle.applyIntent(normalizeVehicleIntent({}), ASPHALT, 1 / 60);
    service.step(1 / 60);
  }
  return { service, vehicle };
}

async function runScript() {
  const fixture = await createFixture();
  for (let index = 0; index < 180; index += 1) {
    fixture.vehicle.applyIntent(
      normalizeVehicleIntent({
        throttle: index < 135 ? 1 : 0,
        steering: index > 70 && index < 125 ? 0.35 : 0,
        brake: index >= 150 ? 0.6 : 0,
      }),
      ASPHALT,
      1 / 60,
    );
    fixture.service.step(1 / 60);
  }
  return fixture;
}

describe("Box3DDynamicsService", () => {
  it("runs a physical-wheel assembly through the project-owned port", async () => {
    const { service, vehicle } = await runScript();
    const telemetry = vehicle.telemetry();
    expect(telemetry.wheels).toHaveLength(4);
    expect(telemetry.body.position.z).toBeGreaterThan(-51);
    expect(Math.abs(telemetry.forwardSpeed)).toBeGreaterThan(0.1);
    expect(service.metrics()).toMatchObject({
      engine: "Box3D",
      bodyCount: 6,
      colliderCount: 6,
    });
    service.dispose();
  });

  it("repeats the same scripted physical-wheel run in one runtime", async () => {
    const first = await runScript();
    const second = await runScript();
    const firstState = first.vehicle.telemetry();
    const secondState = second.vehicle.telemetry();

    expect(secondState.body.position.x).toBeCloseTo(
      firstState.body.position.x,
      6,
    );
    expect(secondState.body.position.y).toBeCloseTo(
      firstState.body.position.y,
      6,
    );
    expect(secondState.body.position.z).toBeCloseTo(
      firstState.body.position.z,
      6,
    );
    expect(secondState.forwardSpeed).toBeCloseTo(firstState.forwardSpeed, 6);

    first.service.dispose();
    second.service.dispose();
  });

  it("restores the complete physical-wheel assembly", async () => {
    const { service, vehicle } = await createFixture();
    const capture = vehicle.capture();
    expect(capture.parts).toHaveLength(4);

    for (let index = 0; index < 45; index += 1) {
      vehicle.applyIntent(
        normalizeVehicleIntent({ throttle: 1 }),
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
