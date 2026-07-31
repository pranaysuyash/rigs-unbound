# Open-World Rustline Material Exchange Evidence

**Date:** 2026-07-29

**Status:** Tier 2 local implementation and full-suite verification. Broader
mission-authority migration remains proposed in ADR-0050.

## What changed for the player

Once the player has personally discovered Rustline Salvage, they can visit Home
Silo and choose `Load Rustline stock`. This prepares the existing towable crate
for the Rustline yard without accepting `need-rustline-parts-run` or any other
mission. Towing the crate to the actual yard records a durable material fact:
`rustline-salvage:service-stocked`.

That fact, rather than a mission completion flag, now determines whether the
Rustline repair yard is working. Existing story delivery completion converges
on the same fact for compatibility, and a save containing the former
`rustline-parts-run` outcome recovers into it.

## Open-world boundaries proved in code

- Loading stock uses the existing primary command and one physical crate.
- Towing and collision remain owned by the current cargo path.
- No mission is accepted, created, completed, or required by the voluntary
  cargo path.
- The destination is an already-known place, not an automatic discovery.
- Service stock is idempotent: repeated delivery cannot duplicate capacity or
  favor.
- The material fact derives Rustline's supplied condition and repair service;
  mission lifecycle no longer directly grants it for the Rustline outcome.

## Verification

**Tier 2:** `npm run typecheck` passed, including the deterministic-kernel
probe.

**Tier 2:** `npx vitest run` passed: 86 test files and 520 tests.

**Focused coverage:**

- `src/game/settlement-cargo.test.ts` proves personal-knowledge gating,
  voluntary preparation, the primary command path, material delivery without
  active missions, idempotence, and legacy-outcome recovery.
- Existing cargo tests continue to cover physical towing and completion.
- Existing settlement-life and mission-lifecycle tests continue to cover the
  shared service and compatibility seams.

## Remaining evidence

No browser playthrough was executed for this stage because the canonical
browser session preserves an unrelated, real community-history state. The
required next runtime proof is a clean or intentionally prepared save that
shows Home Silo's load action, physical arrival at Rustline, service activation
after reload, and no active mission before or after delivery.
