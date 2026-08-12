import { describe, expect, it } from "vitest";
import { runtimeBridgeSpecs } from "./runtime-assets";

describe("runtime asset surface boundary", () => {
  it("keeps proof candidates out of the normal player world", () => {
    expect(runtimeBridgeSpecs("player")).toEqual([]);
  });

  it("exposes developer candidates with asset-id-keyed presentation", () => {
    const specs = runtimeBridgeSpecs("developer");

    expect(specs.map((spec) => spec.assetId)).toEqual([
      "kenney-car-kit-breakable-crate-fixture",
      "kenney-car-kit-tractor-preview",
      "field-plough-01",
    ]);
    expect(specs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetId: "kenney-car-kit-breakable-crate-fixture",
          targetMaxDimension: 1.65,
          fallbackColor: 0x8f6548,
        }),
        expect.objectContaining({
          assetId: "kenney-car-kit-tractor-preview",
          targetMaxDimension: 4.2,
          fallbackColor: 0x75614b,
        }),
        expect.objectContaining({
          assetId: "field-plough-01",
          targetMaxDimension: 3.5,
          fallbackColor: 0x5c5c5c,
        }),
      ]),
    );
  });
});
