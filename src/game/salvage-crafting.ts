/**
 * Salvage Crafting & Module Blueprint Assembly Engine.
 *
 * Validates inventory commodity requirements and crafts functional utility modules
 * (winches, survey masts, extra fuel cells) at the workshop.
 */

import type { CommodityType } from "./expedition-economy";

export interface CraftingRecipe {
  outputModuleId: string;
  name: string;
  requiredMaterials: Record<CommodityType, number>;
}

export const CRAFTING_RECIPES: readonly CraftingRecipe[] = [
  {
    outputModuleId: "winch",
    name: "Winch Assembly",
    requiredMaterials: {
      "steel-scrap": 4,
      microchips: 2,
      "fuel-cell-core": 0,
    },
  },
  {
    outputModuleId: "survey-mast",
    name: "Survey Mast Antenna",
    requiredMaterials: {
      "steel-scrap": 3,
      microchips: 4,
      "fuel-cell-core": 0,
    },
  },
  {
    outputModuleId: "auxiliary-fuel-tank",
    name: "Auxiliary Fuel Tank",
    requiredMaterials: {
      "steel-scrap": 2,
      microchips: 0,
      "fuel-cell-core": 1,
    },
  },
];

export function canCraftRecipe(
  recipe: CraftingRecipe,
  inventory: Record<CommodityType, number>,
): boolean {
  for (const [mat, requiredQty] of Object.entries(recipe.requiredMaterials)) {
    const qty = inventory[mat as CommodityType] ?? 0;
    if (qty < requiredQty) return false;
  }
  return true;
}

export function craftRecipe(
  recipe: CraftingRecipe,
  inventory: Record<CommodityType, number>,
): { success: boolean; updatedInventory: Record<CommodityType, number>; craftedModuleId: string | null } {
  if (!canCraftRecipe(recipe, inventory)) {
    return { success: false, updatedInventory: inventory, craftedModuleId: null };
  }

  const updatedInventory = { ...inventory };
  for (const [mat, requiredQty] of Object.entries(recipe.requiredMaterials)) {
    const key = mat as CommodityType;
    updatedInventory[key] = (updatedInventory[key] ?? 0) - requiredQty;
  }

  return {
    success: true,
    updatedInventory,
    craftedModuleId: recipe.outputModuleId,
  };
}
