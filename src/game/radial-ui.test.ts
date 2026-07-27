import { describe, expect, it } from "vitest";
import { createInitialRadialMenuState, deriveRadialMenuItems, selectRadialMenuItem } from "./radial-ui";
import { createInitialState } from "./state";

describe("radial quick-action control wheel", () => {
  it("derives available radial menu items based on active rig modules", () => {
    const state = createInitialState("RADIAL-TEST");
    const items = deriveRadialMenuItems(state);

    expect(items.length).toBeGreaterThan(5);
    const airDown = items.find((i) => i.id === "air-down-tires");
    expect(airDown?.available).toBe(true);
  });

  it("selects and toggles active status on available radial menu items", () => {
    const state = createInitialState("RADIAL-TEST");
    const menuState = createInitialRadialMenuState(state);

    const { updatedMenu, selectedItem } = selectRadialMenuItem(menuState, 2); // Air down tires
    expect(selectedItem).not.toBeNull();
    expect(selectedItem?.id).toBe("air-down-tires");
    expect(updatedMenu.selectedIndex).toBe(2);
  });
});
