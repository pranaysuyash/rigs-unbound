# Open-World Spatial Affordance Evidence

**Date:** 2026-07-29

## Question

Does settlement help resolve as an open-world material interaction, or as a
site-wide task menu with deterministic player choreography?

## Change

`src/game/settlement-life.ts` now associates each authored, capability-specific
consequence with a physical material affordance. Resolution requires all three
facts:

```text
machine capability + nearby material affordance + current local pressure
```

Examples include Long Furrow's saturated drainage edge and raised stores
ground, Rustline's blocked yard and bypass line, Sunken Flats' landing banks,
Marsh Depot's ford anchor, and Launch Ridge's signal equipment.

The action resolver no longer grants the lexicographically first compatible
response merely because a rig is somewhere in a settlement service radius.

## Evidence

### Tier 2: static and automated

- `npm run typecheck` passed, including the deterministic-kernel probe.
- Focused Vitest coverage passed: `4` files, `85` tests.
- The new settlement-life test proves that a tow-capable machine has no
  contribution at an unrelated world coordinate and resolves Long Furrow's
  raised-stores action only at the actual site-relative affordance location.
- The repository-wide Vitest run completed without a reported test failure.
  The captured terminal output omitted its final aggregate summary, so this
  record deliberately does not claim an exact total.

### Tier 4: canonical runtime observation

Canonical surface: `http://127.0.0.1:4173`.

1. The existing `toy-buggy` was selected and placed at Rustline Salvage's site
   center, `(148, -108)`. The primary action produced no settlement
   contribution.
2. The same rig was placed at Rustline's blocked-yard affordance,
   `(141.8, -112.8)`.
3. The normal `performRigAction()` path recorded `shift-yard-load`.
4. The runtime snapshot showed Rustline favor `1`, the yard-load response
   `contributed`, `mission: null`, and `activeSideMissions: []`.
5. Browser console output contained only Vite debug reconnect messages, with no
   application error.

## What this proves

- Determinism is used for causal authority and persistence, not for a player
  sequence.
- Spatial approach and machine choice now matter to the settlement outcome.
- A partial contribution does not close the settlement or erase other
  possibilities.
- No mission acceptance, route unlock, or deadline was introduced.

## Remaining limitation

This is a coherent correction to the response-menu seam, not the final general
interaction model. The current action effects are still authored mappings from
capability and local material affordance to service relief. The next long-term
stage should make material state changes such as moving cargo, cutting drainage,
surveying a route, or securing a line their own reusable simulation effects,
from which community capacity is derived. That will reduce reliance on named
settlement action entries without pretending every physical interaction can be
generic before there are multiple real uses.

## Follow-on implementation: community adaptation

The next stage records community adaptations only when a live, unresolved
pressure crosses a complete world-day boundary. The kernel records an
adaptation, but it does not create a failure, remove a response, block a route,
or require the player to react. Communities can raise stores, consolidate a
yard or landing, post a ford watch, or maintain a manual signal watch while the
player continues to choose whether, when, and how to intervene.
