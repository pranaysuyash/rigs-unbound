# ADR-0031 — Renderer delegates rig-local animation to `vehicleAnimationSystem`

- Date: 2026-07-27
- Status: **Runtime-wired (2026-07-28):** renderer path now imports and updates
  `vehicleAnimationSystem` once per frame.
- Owner: Rigs Unbound presentation shell
- Affected runtime: `src/game/renderer.ts`, `src/game/animation.ts`, `src/main.ts`
- Related evidence: `docs/decisions/ADR-0030-renderer-owned-live-rig-presentation-and-deferred-animation-module.md`, `docs/WORKLOG_ADDENDUM_2026-07-27.md`, `docs/reviews/PARALLEL_RUNTIME_INTEGRATION_HANDOFF_2026-07-26.md`

## Context

`src/game/animation.ts` is a real, restored subsystem with explicit channels for wheel rotation, suspension, steering, body motion, steering wheel, module visuals, plough articulation, and state-shell pulse. The live renderer also owned several of those same writes directly, which created duplicate truth and made the dead-import removal the wrong first move.

The named `ClipActionBindings` contract in the animation state remains `null`
until future clip-backed rigs arrive. The current tree does not yet import or
drive animation clips, so the live owner remains procedural until authored
clips arrive.

The steering lane now writes pivot orientation only once, at the final
presentation step, after the steering dampers have updated state.

The current owner now has single presentation commit points for body motion
and steering, with no lingering duplicate locals from that consolidation.

The long-term question is not whether the module file exists. It is which layer should own rig-local animation truth. On first principles, the answer is the module that already encapsulates those channels and can be called once per frame from the renderer.

## Decision

1. Keep `GameRenderer` as the orchestration layer for world placement, phase selection, terrain, dust, camera, and post-processing.
2. Delegate rig-local animation channels to `vehicleAnimationSystem`.
3. Register each rig with `vehicleAnimationSystem` during renderer construction and update the system once per frame with the authoritative feedback map.
4. Remove duplicate transform writes from the renderer so one subsystem owns each animation truth.
5. Preserve the renderer-owned boundary history as a superseded decision rather than erasing it.

## Options considered

- Keep renderer-only animation writes: rejected because it duplicates the same transforms in two places and makes supersession impossible to reason about.
- Leave `src/game/animation.ts` deferred: rejected because the module is already present, restored, and now a natural canonical owner for the channels it implements.
- Move the entire renderer into the animation module: rejected because world placement, phase orchestration, terrain, dust, camera, and postprocessing still belong in the renderer.
- Delegate rig-local animation to `vehicleAnimationSystem`: chosen because it creates a clean ownership split without inventing a new abstraction layer.

## Consequences

- There is one canonical owner for rig-local animation transforms.
- The renderer keeps the world/presentation orchestration boundary.
- The animation module becomes live runtime code rather than a dead artifact or parallel rumor.
- Future animation improvements land in one place instead of being duplicated across renderer and helper module.

## Correction — 2026-07-28

This section records both:

- the earlier falsified claim,
- and the subsequent fix that landed in this checkout.

Measured on 2026-07-28 with `node tools/audit-runtime-reachability.mjs`:

- Earlier: `src/game/animation.ts` was not imported by any file, and `renderer`
  did not drive it from the frame loop.
- Current checkout: `src/game/renderer.ts` imports `vehicleAnimationSystem` from
  `src/game/animation.ts`.
- Current checkout: the renderer registers each rig with
  `vehicleAnimationSystem.registerRig(...)`.
- Current checkout: each frame builds `presentationFrames` and calls
  `vehicleAnimationSystem.update(delta, now / 1000, presentationFrames)`.
- Current checkout: renderer-owned duplicate rig-local transform writes for those
  channels are removed.

Specifically withdrawn, at the point of use:

The 2026-07-27 claim is now superseded in this same path:

- `vehicleAnimationSystem` is now reachable from runtime and updates are per frame.

The browser smoke-test evidence remains useful for launch stability. It does not
fully prove rig-channel behavior on its own.

The browser smoke-test evidence is not withdrawn: the page did load without
errors. It simply never proved anything about this ADR, because a renderer that
does not call the animation system loads perfectly well.

### What is still true

The decision reasoning is unaffected. `src/game/animation.ts` remains a real,
tested subsystem, and "one owner per rig-local animation truth" is still the
right boundary. What is missing is the wiring, not the judgement.

### Why this correction matters beyond one file

This is the first observed case in this project of the governance layer making a
false claim about the runtime, and it survived a full documentation and release
gate. It belongs in the same class as the RU-0903 decision-provenance audit and
the RU-0906 status-inflation audit: not a typo, but a signal that
"Implemented in current checkout" was being asserted from reading intent rather
than from executing a check.

The durable mitigation is the standing reachability audit, which now makes this
category of claim falsifiable in one command.

### Closure

The wire-up correction is now complete in runtime and is tracked as closed in
RU-0601/0406.6 with residual acceptance gates elsewhere.

## Validation

- Current checkout shows the renderer registers each rig with `vehicleAnimationSystem`.
- Current checkout shows the renderer updates the system once per frame with the authoritative feedback map and reduced-motion state.
- Current checkout shows the renderer no longer writes the same rig-local channels directly in the frame loop.
- Browser smoke test on the canonical `4173` surface loaded `Rigs Unbound` successfully and reported only Vite debug logs (`[vite] connecting...`, `[vite] connected.`), with no page errors observed.
- Boundary-specific runtime instrumentation should follow if we want proof of the animation channels themselves, not just the live checkout and browser surface.

## Rollback and revisit triggers

Revisit this decision if:

- the animation module needs to own even more of the frame than rig-local animation channels;
- the renderer becomes too thin to justify separate orchestration ownership;
- runtime validation shows a missing visual contract or a performance regression in the delegated path;
- a later migration wants to collapse the subsystem into a different canonical animation owner.

## Next reviewer

The next reviewer should compare the renderer-orchestrated path against any future animation-system migration using the same first-principles criteria: one owner per truth, no duplicate writes, and no dead import cleanup that hides a real boundary question.

## Update log

- 2026-07-27: The presentation lane now uses stored track width to tune visible
  roll response, so rig geometry contributes to animation instead of being a
  cached-only datum.
- 2026-07-27: The module-visual lane now derives lug-tire visibility from the
  rig's installed module list, so the canonical animation owner drives the
  installed-module visual state instead of leaving that flag dormant.
- 2026-07-27: Added static code-boundary verification from the current tree:
  the renderer registers rigs, initializes the animation mixers, and passes the
  feedback map into `vehicleAnimationSystem.update(...)`, while
  `src/game/animation.ts` owns the rig-local channels. Runtime/browser proof
  remains a separate pending gap.
- 2026-07-27: Recorded the delegation boundary after the renderer was updated to register rigs with `vehicleAnimationSystem` and hand over rig-local animation channels each frame.
- 2026-07-27: Reframed the ADR from partial-proposal language to current-checkout implementation language while keeping runtime validation pending.
- 2026-07-27: Added canonical-browser smoke-test evidence from the 4173 surface; the page loaded with only Vite debug logs and no page errors.
- 2026-07-28: The earlier reachability-based withdrawal was corrected by a
  live renderer-path refactor. Runtime now imports and updates the animation
  system from `renderer.ts` once per frame.
