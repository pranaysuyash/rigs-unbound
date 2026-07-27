# ADR-0030 — Renderer-owned live rig presentation; standalone animation module deferred

- Date: 2026-07-27
- Status: implemented and verified for the current runtime; animation-module migration or retirement remains deferred
- Owner: Rigs Unbound presentation shell
- Affected runtime: `src/game/renderer.ts`, `src/main.ts`, `src/game/animation.ts`
- Related evidence: `docs/reviews/PARALLEL_RUNTIME_INTEGRATION_HANDOFF_2026-07-26.md`, `docs/WORKLOG_ADDENDUM_2026-07-27.md`

## Context

The live runtime already updates rig presentation directly in `GameRenderer.render(state)`. That frame boundary owns the current vehicle pose, wheel spin, steering pivots, module visibility, state-shell pulses, dust emission, and camera-facing presentation state. The standalone `src/game/animation.ts` module exists, but it is not currently wired into the live update path.

A previous cleanup removed an unused `vehicleAnimationSystem` import from `src/game/renderer.ts`. That was a correct dead-import fix, but it also exposed an ownership question: should the renderer delegate to the animation module, or should the renderer remain the canonical live presentation owner?

The long-term risk is a second presentation authority. If the renderer and the standalone animation module both try to own the same per-frame rig visuals, the codebase gains duplicate truth, duplicated updates, and more places for drift.

## Decision

1. Keep `GameRenderer.render(state)` as the canonical live per-frame rig presentation boundary.
2. Treat `src/game/animation.ts` as a parallel runtime artifact until a deliberate migration or retirement plan is recorded.
3. Do not reintroduce `vehicleAnimationSystem` into `src/game/renderer.ts` merely to satisfy the presence of a module or to avoid a dead file.
4. If the animation module is later adopted, it must become the canonical owner for a clearly defined subset of presentation work, with explicit call sites, tests, and docs. Otherwise it should remain deferred or be retired deliberately.
5. Record any future ownership migration as a new decision, not as an implicit cleanup.

## Options considered

- Wire `vehicleAnimationSystem` into the renderer now: rejected for this tranche because the live renderer already owns the runtime path, and introducing a second presentation owner without a full migration plan would create drift.
- Keep the dead import and pretend integration exists: rejected because it would misstate the live boundary and fail the long-term honesty standard.
- Delete the animation module outright: rejected because it is still a parallel runtime artifact with separate evidence and may still be useful if a deliberate migration is later approved.
- Keep the renderer as the live owner and document the module as deferred: chosen because it matches the live tree and keeps a single source of truth.

## Consequences

- The runtime boundary stays explicit: the renderer owns live presentation, and the animation module is not silently promoted to canonical status.
- The dead import removal remains correct and durable, rather than a partial move that implies a delegated path exists when it does not.
- Future animation work must either integrate deliberately or be retired deliberately; it cannot drift into a hidden second owner.
- Parallel runtime work remains preserved without being mistaken for live product authority.

## Validation

- Current tree inspection shows `src/game/renderer.ts` owns the live rig presentation updates directly.
- Current tree inspection shows no live call site for `vehicleAnimationSystem.update(...)`.
- Current tree inspection shows the standalone animation module still exists as a separate runtime artifact.
- No runtime tests were required to establish the ownership fact itself; this is a code-boundary decision, not a gameplay balance claim.

## Rollback and revisit triggers

Revisit this decision if any of the following become true:

- the animation module gains a clear, bounded live responsibility that the renderer no longer should own;
- the renderer becomes a thin delegator and the animation module becomes the canonical per-frame presentation owner;
- authored animation assets, mixer lifecycle, or performance profiling require a dedicated ownership boundary;
- the parallel runtime tranche is explicitly adopted into the live runtime and needs a staged migration.

## Next reviewer

The next runtime/presentation decision should compare the renderer-owned direct-update path against any future imported animation-owner migration using the same long-term ownership and single-truth criteria.

## Anything else?

Yes. The important decision is not whether a module file exists. The important decision is whether the runtime has one clear owner for a given truth. Right now that owner is the renderer.

## Update log

- 2026-07-27: Captured the live ownership boundary after inspecting the renderer and animation module. The renderer owns the live per-frame rig presentation path; the standalone animation module remains deferred until a deliberate migration or retirement plan is recorded.
