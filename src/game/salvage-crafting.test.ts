import { describe, expect, it } from "vitest";
import { CommodityType } from "./expedition-economy";
import { canCraftRecipe, CRAFTING_RECIPES, craftRecipe } from "./salvage-crafting";

describe("salvage crafting & blueprint assembly engine", () => {
  it("rejects crafting when material inventory is insufficient", () => {
    const recipe = CRAFTING_RECIPES.find((r) => r.outputModuleId === "winch")!;
    const inventory: Record<CommodityType, number> = {
      "steel-scrap": 2, // Needs 4
      microchips: 2,
      "fuel-cell-core": 0,
    };

    expect(canCraftRecipe(recipe, inventory)).toBe(false);
    const result = craftRecipe(recipe, inventory);
    expect(result.success).toBe(false);
    expect(result.craftedModuleId).toBeNull();
  });

  it("crafts module assembly and deducts exact material quantities when inventory is sufficient", () => {
    const recipe = CRAFTING_RECIPES.find((r) => r.outputModuleId === "winch")!;
    const inventory: Record<CommodityType, number> = {
      "steel-scrap": 5,
      microchips: 3,
      "fuel-cell-core": 0,
    };

    expect(canCraftRecipe(recipe, inventory)).toBe(true);
    const result = craftRecipe(recipe, inventory);
    expect(result.success).toBe(true);
    expect(result.craftedModuleId).toBe("winch");
    expect(result.updatedInventory["steel-scrap"]).toBe(1);
    expect(result.updatedInventory.microchips).toBe(1);
  });
});
