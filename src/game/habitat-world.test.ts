import { describe, expect, it } from "vitest";
import { GameWorld } from "./gameworld";

describe("living frontier habitat in GameWorld", () => {
  it("turns an active Quarry Runout into local scavenger habitat without adding incident state", () => {
    const world = new GameWorld("HABITAT-QUARRY-RUNOUT");
    const transition = world.advanceRoadIncidents(720, 0.95);
    const incident = world.roadIncidentProjection();

    expect(transition.triggered).toBe(true);
    expect(incident.boulder).not.toBeNull();

    const habitat = world.habitatProjectionAt(
      incident.boulder!.x,
      incident.boulder!.z,
      720,
      0.95,
      0.08,
    );

    expect(habitat.occupants).toContainEqual(
      expect.objectContaining({ species: "corvid", occupancy: "active" }),
    );
  });

});
