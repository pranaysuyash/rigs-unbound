import { describe, expect, it } from "vitest";
import { createNavigatorUI } from "./navigator-ui";
import { createInitialState } from "./state";

describe("Navigator UI", () => {
  it("instantiates navigator panel element", () => {
    const container = document.createElement("div");
    const controller = createNavigatorUI(container);

    expect(controller.element).toBeDefined();
    expect(container.contains(controller.element)).toBe(true);

    controller.dispose();
  });

  it("sets and clears waypoints correctly", () => {
    const container = document.createElement("div");
    const controller = createNavigatorUI(container);

    const wp1 = controller.setWaypoint(40, -80, "SCOUT PING");
    expect(controller.getWaypoints()).toHaveLength(1);
    expect(controller.getWaypoints()[0]?.label).toBe("SCOUT PING");


    controller.clearWaypoint(wp1.id);
    expect(controller.getWaypoints()).toHaveLength(0);

    controller.dispose();
  });

  it("updates radar elements without throwing error", () => {
    const container = document.createElement("div");
    const controller = createNavigatorUI(container);
    const state = createInitialState("test-seed");

    expect(() => controller.update(state)).not.toThrow();

    controller.dispose();
  });
});
