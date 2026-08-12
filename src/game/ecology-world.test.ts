import { describe, expect, it } from "vitest";
import { GameWorld } from "./gameworld";
import { deriveSettlementEcologyFieldNotes } from "./settlement-needs";

describe("persistent regional ecology", () => {
  it("moves independent populations and preserves their land impact through world-memory recovery", () => {
    const world = new GameWorld("ECOLOGY-PERSISTENCE");
    const initialHerd = world
      .ecologySnapshot()
      .find((actor) => actor.kind === "grazers");

    expect(initialHerd).toBeDefined();
    world.advanceEcology(720, 180, 0.1);

    const advancedHerd = world
      .ecologySnapshot()
      .find((actor) => actor.id === initialHerd!.id);
    expect(advancedHerd).toBeDefined();
    expect(
      world.fieldConditionAt(advancedHerd!.x, advancedHerd!.z),
    ).not.toBeNull();

    const restored = new GameWorld("ECOLOGY-PERSISTENCE");
    restored.restore(JSON.parse(JSON.stringify(world.snapshot())));

    expect(restored.ecologySnapshot()).toEqual(world.ecologySnapshot());
    expect(restored.fieldConditionAt(advancedHerd!.x, advancedHerd!.z)).toEqual(
      world.fieldConditionAt(advancedHerd!.x, advancedHerd!.z),
    );
  });

  it("responds differently when machine-disturbed land changes regional suitability", () => {
    const baseline = new GameWorld("ECOLOGY-MACHINE-IMPACT");
    const disturbed = new GameWorld("ECOLOGY-MACHINE-IMPACT");
    const herd = disturbed
      .ecologySnapshot()
      .find((actor) => actor.kind === "grazers");

    disturbed.noteFieldWork(herd!.x, herd!.z, 0.72);
    baseline.advanceEcology(720, 60, 0.1);
    disturbed.advanceEcology(720, 60, 0.1);

    expect(
      disturbed.ecologySnapshot().find((actor) => actor.id === herd!.id),
    ).not.toEqual(
      baseline.ecologySnapshot().find((actor) => actor.id === herd!.id),
    );
  });

  it("moves a nearby group away from real machine presence and keeps that result through reload", () => {
    const world = new GameWorld("ECOLOGY-DIRECT-DISTURBANCE");
    const herd = world
      .ecologySnapshot()
      .find((actor) => actor.kind === "grazers");

    world.noteEcologyDisturbance(herd!.x, herd!.z, 0.9);
    const displaced = world
      .ecologySnapshot()
      .find((actor) => actor.id === herd!.id);

    expect(
      Math.hypot(displaced!.x - herd!.x, displaced!.z - herd!.z),
    ).toBeGreaterThan(0);

    const restored = new GameWorld("ECOLOGY-DIRECT-DISTURBANCE");
    restored.restore(JSON.parse(JSON.stringify(world.snapshot())));
    expect(
      restored.ecologySnapshot().find((actor) => actor.id === herd!.id),
    ).toEqual(displaced);
  });

  it("lets places report ecological change without producing an objective", () => {
    const world = new GameWorld("ECOLOGY-SITUATED-KNOWLEDGE");
    const herd = world
      .ecologySnapshot()
      .find((actor) => actor.id === "long-furrow-herd");

    expect(herd).toBeDefined();
    if (!herd) return;

    const before = deriveSettlementEcologyFieldNotes([herd]);
    expect(before).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          settlementId: "long-furrow",
          speaker: "Sava Nune",
        }),
      ]),
    );

    world.noteEcologyDisturbance(herd.x, herd.z, 1);
    const movedHerd = world
      .ecologySnapshot()
      .find((actor) => actor.id === "long-furrow-herd");
    expect(movedHerd).toBeDefined();
    if (!movedHerd) return;

    const after = deriveSettlementEcologyFieldNotes([movedHerd]);
    expect(after[0]?.text).not.toBe(before[0]?.text);
  });
});
