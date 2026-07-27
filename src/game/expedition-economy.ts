/**
 * Expedition Economy & Regional Trade Network.
 *
 * Models regional supply/demand trade multipliers for scrap commodities
 * (steel, electronics, fuel cells) across world exploration hubs.
 */

export type CommodityType = "steel-scrap" | "microchips" | "fuel-cell-core";

export interface MarketPriceQuote {
  commodity: CommodityType;
  baseValue: number;
  siteId: string;
  regionalMultiplier: number;
  finalPriceScrap: number;
}

export const REGIONAL_DEMAND_TABLE: Readonly<Record<string, Record<CommodityType, number>>> = {
  "home-farm": {
    "steel-scrap": 1.0,
    microchips: 1.0,
    "fuel-cell-core": 1.0,
  },
  "sunken-flats": {
    "steel-scrap": 1.2,
    microchips: 3.2, // High demand for underwater relay electronics
    "fuel-cell-core": 1.5,
  },
  "launch-ridge": {
    "steel-scrap": 2.6, // High demand for rocket structural steel
    microchips: 1.8,
    "fuel-cell-core": 3.8, // High demand for high-altitude thruster fuel
  },
  "marsh-depot": {
    "steel-scrap": 1.4,
    microchips: 1.6,
    "fuel-cell-core": 2.2,
  },
};

export function quoteCommodityPrice(
  commodity: CommodityType,
  siteId: string,
): MarketPriceQuote {
  const basePrices: Record<CommodityType, number> = {
    "steel-scrap": 25,
    microchips: 60,
    "fuel-cell-core": 120,
  };

  const baseValue = basePrices[commodity];
  const siteDemands = REGIONAL_DEMAND_TABLE[siteId] ?? REGIONAL_DEMAND_TABLE["home-farm"]!;
  const multiplier = siteDemands[commodity];
  const finalPrice = Math.round(baseValue * multiplier);

  return {
    commodity,
    baseValue,
    siteId,
    regionalMultiplier: multiplier,
    finalPriceScrap: finalPrice,
  };
}
