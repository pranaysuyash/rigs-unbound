import { describe, expect, it } from "vitest";
import { createHoodDashboardUI } from "./hood-dashboard-ui";
import { createInitialState } from "./state";

describe("Hood Dashboard UI", () => {
  it("instantiates dashboard element and defaults to hidden", () => {
    const container = document.createElement("div");
    const controller = createHoodDashboardUI(container);

    expect(controller.element).toBeDefined();
    expect(controller.isVisible()).toBe(false);
    expect(container.contains(controller.element)).toBe(true);

    controller.dispose();
  });

  it("shows dashboard when cameraMode is set to hood and hides otherwise", () => {
    const container = document.createElement("div");
    const controller = createHoodDashboardUI(container);
    const state = createInitialState("test-seed");

    state.cameraMode = "hood";
    controller.update(state);
    expect(controller.isVisible()).toBe(true);

    state.cameraMode = "chase";
    controller.update(state);
    expect(controller.isVisible()).toBe(false);

    controller.dispose();
  });
});
