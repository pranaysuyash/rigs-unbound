import { describe, expect, it } from "vitest";
import { quoteCommodityPrice } from "./expedition-economy";

describe("expedition economy & regional trade network", () => {
  it("quotes base price for commodities at Home Farm", () => {
    const quote = quoteCommodityPrice("microchips", "home-farm");
    expect(quote.regionalMultiplier).toBe(1.0);
    expect(quote.finalPriceScrap).toBe(60);
  });

  it("applies high demand multiplier for electronics at Sunken Flats and fuel cells at Launch Ridge", () => {
    const sunkenFlatsQuote = quoteCommodityPrice("microchips", "sunken-flats");
    expect(sunkenFlatsQuote.regionalMultiplier).toBeGreaterThan(3.0);
    expect(sunkenFlatsQuote.finalPriceScrap).toBeGreaterThan(150);

    const launchRidgeQuote = quoteCommodityPrice(
      "fuel-cell-core",
      "launch-ridge",
    );
    expect(launchRidgeQuote.regionalMultiplier).toBeGreaterThan(3.5);
    expect(launchRidgeQuote.finalPriceScrap).toBeGreaterThan(400);
  });
});
