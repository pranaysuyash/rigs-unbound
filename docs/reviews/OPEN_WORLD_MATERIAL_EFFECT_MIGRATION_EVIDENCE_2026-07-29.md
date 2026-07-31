# Open-World Material Effect Migration Evidence

**Date:** 2026-07-29

## Decision implemented

Settlement actions and community adaptations no longer own service relief or
renderer consequence data. They now record a durable `materialEffectId`, and
the shared `settlement-material-effects` registry owns the local fact's
service impact and visible consequence.

```text
player action / community adaptation
              |
              v
       durable materialEffectId
              |
      +-------+--------+
      v                v
community capacity   renderer consequence
```

This is a deliberately bounded extraction, not a speculative universal ECS.
It has two real producers already: player machine work and independent
community adaptation.

## Save migration

Schema `25` adds `materialEffectId` to contribution and adaptation records.
Schema `24` records recover through the existing predecessor migration and map
their prior source IDs to semantic material-effect IDs. Source IDs remain for
idempotence and historical attribution, but no longer define relief or meshes.

## Automated evidence

- `npm run typecheck` passed, including the deterministic-kernel probe.
- Focused coverage passed: `4` files and `88` tests.
- A state test supplies v24 contribution and adaptation source records without
  `materialEffectId`, recovers them as schema `25`, and proves the expected
  `long-furrow:staged-stores` and `long-furrow:self-raised-stores` facts.
- Full suite passed: `84` files and `511` tests.

## Canonical runtime evidence, Tier 4

Surface: `http://127.0.0.1:4173`.

The browser's existing schema-24 persisted state was retained and reloaded.
The runtime reported schema `25` with:

- Rustline's prior player contribution still `contributed`, now carrying
  `rustline-salvage:staged-yard`.
- Rustline's alternative survey response still `available`.
- Sunken Flats' independent landing adaptation still present, now carrying
  `sunken-flats:consolidated-landing`.
- Sunken Flats' player hover and survey responses still `available`.
- `mission: null` and no active side missions.
- Browser console output contained Vite reconnect diagnostics only, with no
  application error.

## Remaining boundary

The registry is the authoritative source for settlement material effects, but
it is not yet a whole-world effect system. The next expansion should occur only
when a non-settlement domain, such as terrain drainage, cargo logistics, or
route surveying, needs to consume the same fact. At that point, move the effect
to a broader world domain with an explicit migration rather than duplicating a
second effect registry.
