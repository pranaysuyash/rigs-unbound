# Open-World Community Adaptation Evidence

**Date:** 2026-07-29

## Purpose

Prove that an inhabited place can react to continued local pressure without
turning the world clock into a player deadline, a mission failure, or an access
gate.

## Runtime contract

At a natural full world-day boundary, the deterministic kernel evaluates live
settlement pressure. When pressure remains materially severe and no player
contribution already covers the same community need, the settlement may record
its own adaptation. This record changes only local service capacity, resident
behavior, dialogue, and visible arrangement. It never changes player input
permissions, removes a response, creates a mission, or closes a route.

Current adaptations include raising stores, consolidating a salvage yard or a
landing, posting a ford watch, and maintaining a manual signal watch.

## Automated evidence

- `npm run typecheck` passed, including the deterministic-kernel probe.
- Focused coverage passed: `4` files and `87` tests.
- The new state-level test sets Long Furrow to waterlogged immediately before a
  world-day boundary, steps the canonical kernel, and proves that its
  adaptation records without a mission, side mission, or player contribution.
- The full Vitest run completed without a reported failure. Its captured output
  omitted the aggregate summary, so no exact repository-wide total is claimed.

## Canonical browser evidence, Tier 4

Surface: `http://127.0.0.1:4173`.

The existing persisted browser state was retained. No save was cleared or
rewritten for the observation.

1. The browser had `schemaVersion: 24` and every settlement initially exposed
   an empty adaptation history.
2. The canonical `advanceTime()` hook advanced normal simulation time through
   the next full day boundary.
3. At `worldTimeMinutes: 2928.9375`, Sunken Flats still had `cut-off` route
   pressure, yet independently recorded
   `sunken-flats:consolidate-landing-routine`.
4. Its household exchange changed to `limited`, while crossing watch remained
   `sheltering`. The settlement therefore adapted partially rather than being
   silently solved.
5. Both player responses, `carry-households` and `sound-crossing`, remained
   `available`.
6. `mission` remained `null` and `activeSideMissions` remained empty.
7. Browser console output contained Vite debug reconnect entries only, with no
   application error.

## Architecture status

This establishes a living-world consequence model: places have agency, and
the player can arrive before, after, alongside, or not at all. It is not a
completed general simulation platform. The remaining long-term work is to make
material effects such as cargo staging, drainage, route readings, and crossing
support reusable world facts that settlement capacity consumes, rather than
the current authored effect mappings. That migration should be driven by the
second real use of each material effect, not by a speculative universal ECS.
