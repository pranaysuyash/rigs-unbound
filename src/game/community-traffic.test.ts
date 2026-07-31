import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import { deriveCommunityTraffic } from "./community-traffic";

describe("community traffic", () => {
  it("keeps civilian traffic absent until a material change supports it", () => {
    const state = createInitialState("COMMUNITY-TRAFFIC-EMPTY");

    expect(deriveCommunityTraffic(state)).toEqual([]);
  });

  it("derives a Sunken Flats skiff from a sounded crossing without discovering or unlocking Marsh Depot", () => {
    const state = createInitialState("COMMUNITY-TRAFFIC-SKIFF");
    state.worldTimeMinutes = 180;
    state.settlements["sunken-flats"] = {
      ...state.settlements["sunken-flats"],
      contributions: [{
        responseId: "sunken-flats:sound-crossing",
        materialEffectId: "sunken-flats:sounded-crossing",
        capability: "survey",
        createdAtWorldMinutes: 180,
      }],
    };

    expect(deriveCommunityTraffic(state)).toEqual([
      expect.objectContaining({
        id: "community-traffic:sunken-flats:sounded-crossing",
        materialEffectId: "sunken-flats:sounded-crossing",
        kind: "skiff",
        sourceSiteId: "sunken-flats",
        targetSiteId: "marsh-depot",
      }),
    ]);
    expect(state.discoveries.some((entry) => entry.id === "marsh-depot")).toBe(false);
  });

  it("moves a route reproducibly from world time rather than spawning traffic state", () => {
    const state = createInitialState("COMMUNITY-TRAFFIC-TIME");
    state.settlements["rustline-salvage"] = {
      ...state.settlements["rustline-salvage"],
      contributions: [{
        responseId: "rustline-salvage:mark-bypass",
        materialEffectId: "rustline-salvage:marked-bypass",
        capability: "survey",
        createdAtWorldMinutes: 60,
      }],
    };

    state.worldTimeMinutes = 60;
    const atSixty = deriveCommunityTraffic(state);
    const repeatedAtSixty = deriveCommunityTraffic(state);
    state.worldTimeMinutes = 74;
    const atSeventyFour = deriveCommunityTraffic(state);

    expect(atSixty).toEqual(repeatedAtSixty);
    expect(atSixty).toEqual([
      expect.objectContaining({
        kind: "freight-cart",
        sourceSiteId: "salvage-yard",
        targetSiteId: "quarry-shelf",
      }),
    ]);
    expect(atSeventyFour[0]?.progress).not.toBe(atSixty[0]?.progress);
    expect(atSeventyFour[0]?.x).not.toBe(atSixty[0]?.x);
  });
});
