# 3D Game Parallel Review Addendum

**Date:** 2026-07-26  
**Parent ledger:** [3D Game Skill-to-Repository Execution Ledger](./3D_GAME_SKILL_TO_REPO_EXECUTION_LEDGER_2026-07-26.md)  
**Scope:** Consolidation of three independent static reviews of the optimization/platform audit.  
**Evidence tier:** Tier 1. No tests, typecheck, browser run, or runtime observation was performed by these review lanes.

## Why this addendum exists

The referenced “3D Game Optimization Gaps” conversation combines renderer optimization, simulation architecture, extensibility, persistence, and multiplayer concerns. The parallel review checked those claims against the current repository so the long-term plan remains ambitious without treating proposed architecture as implemented behavior.

The parent ledger remains the only active status and skill-provenance authority for this audit. This addendum records review evidence and the resulting corrections; it is not a competing roadmap or contract index.

## Review lanes

| Lane                         | Focus                                                                                                             | Result                                                                                                                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rendering and web delivery   | Instancing, culling, LOD, camera obstruction, lighting, asset/world streaming                                     | Instancing and logical visibility telemetry are real; representation-changing LOD, general occlusion, and residency streaming remain open.                                                           |
| Simulation architecture      | Fixed-step kernel, collision, capabilities, affordances, commands/events, replay, authority, persistence, budgets | The kernel, migrations, capability composition, one affordance slice, and bounded run records are real; command/event closure, replay playback, collision masks, and budget reactions remain open.   |
| Documentation and governance | Status authority, skill provenance, ADR wording, acceptance evidence, instruction-path drift                      | The execution ledger is the correct active status surface; older docs need links/addenda rather than parallel current-state claims. ADR-0014 remains proposed until its acceptance criteria are met. |

All three lanes preserved the existing worktree and made no file edits.

## Corrected current-state claims

### Rendering

- Instanced environmental props and furrows provide a real batching foundation in [`src/game/renderer.ts`](../../src/game/renderer.ts).
- Logical distance classification and submitted/culled counters exist in [`src/game/visibility.ts`](../../src/game/visibility.ts) and the renderer.
- This is not yet a complete culling/LOD system. Current gaps include actual per-instance frustum behavior, alternate geometry/material/billboard representations, occlusion/portal culling, and subsystem cadence policies.
- Camera obstruction handling is materially stronger than a basic follow camera, but cross-rig browser evidence and a formal mode-transition contract remain open.
- The no-shadow-map/blob-shadow choice is a deliberate low-cost baseline. It is not evidence of a device/profile lighting matrix.
- Manifest-derived runtime asset loading is an activation bridge, not asset residency streaming. Prefetch, cancellation, eviction, and memory budgets remain open.

### Simulation and extensibility

- The fixed-step kernel remains a strong foundation: authoritative ordering is centralized in [`src/game/state.ts`](../../src/game/state.ts).
- Capability composition and one versioned affordance resolver are present. The durable target is still capability plus compatible affordance, not rig-type branching.
- Browser input still directly calls state mutators for several actions through [`src/main.ts`](../../src/main.ts). A semantic resolver and run-record hook do not equal a complete command -> validate -> transition -> event -> presentation pipeline.
- Run records are diagnostic and bounded, not replay playback. A durable replay must preserve seed, schema, initial state, semantic inputs, and a first-divergence report.
- Collision remains a narrow obstacle vocabulary. A category/mask matrix for static, dynamic, trigger, sensor, pickup, projectile, and decoration roles is not yet a runtime contract.
- Save migration and recovery are real, but migration failure reporting should preserve structured source-version, target-version, reason, and recovery information.
- Authority scaling and ECS are correctly downstream. No current evidence justifies networking or wholesale ECS migration before the preceding proof gates.

## Priority acceptance gates

1. **Visibility gate:** deterministic profile-aware visibility for representative prop categories, with candidate/submitted/culled/capacity-limited telemetry and desktop/narrow browser evidence.
2. **Representation LOD gate:** one real near/mid/far representation ladder plus one explicit non-render cadence policy, proven at the fixed thresholds.
3. **Camera gate:** wheeled and hover rigs across terrain, obstacle, near-wall, mode-switch, and reduced-motion cases; capture path-clear and fallback outcomes.
4. **Command/event gate:** one relay or tow interaction routed through command, validation, state transition, event, and presentation; cover valid, invalid, duplicate, and persistence outcomes with stable reason codes.
5. **Replay gate:** import and re-simulate the command sequence against a seeded world and report the first mismatch.
6. **Collision gate:** introduce and test category/mask semantics, including the invariant that triggers and sensors do not accidentally mutate motion.
7. **Budget gate:** define within-budget, degraded, and fail-soft states with the subsystem and reason that caused fallback visible in telemetry.
8. **Streaming gate:** only after measured pressure justifies it, add versioned requested/loading/resident/inactive/evicted/failed lifecycle states with cancellation, recovery, save integration, and load/memory telemetry.

## Three-pass review outcome

### Pass 1: completeness

The supplied research was checked against current renderer, kernel, persistence, capability, affordance, and telemetry surfaces. Claims were narrowed where the repository only has a policy seam or proposal.

### Pass 2: architecture

The recommended direction preserves the portable `Rig` noun, fixed-step authority, renderer separation, validated data, and second-use extraction rule. Full ECS, multiplayer authority, universal render graphs, and broad streaming remain staged rather than silently introduced.

### Pass 3: supervision readiness

Every open item above has an evidence tier and a concrete closure gate. No Tier 1 static finding is presented as runtime closure. The remaining documentation governance issue is explicit: older synthesis docs retain history, while the parent ledger owns active status and skill provenance.

## Follow-up ownership

The next implementation owner should take the smallest vertical proof in this order: command/event slice, replay playback, collision masks, budget state/fallback, then a second capability/affordance consumer. Renderer LOD and streaming remain parallelizable only when their own measured pressure and browser evidence justify implementation. Project-owner acceptance is required before changing ADR-0014 from proposed or introducing authority/ECS as active scope.

## Addendum (2026-07-26) - current boundary map after the live lane rechecks

- Re-checked the repo against the current live lane notes already recorded in
  the worklog and research contracts.
- The current status split is now clearer:
  - visibility budget: active and auditable, with `mobile-safe` fallback and a
    recovery window;
  - replay: record and verify are real, playback is still missing;
  - collision: obstacle truth is real, category/mask matrix is still future;
  - streaming: the world remains single-residency, chunk residency is still
    future-bound.
- That means the next implementation owner should still take the same smallest
  vertical proof order, but with a narrower budget implication:
  - budget work now extends beyond visibility toward cross-system ownership and
    representative-device capture, rather than starting from zero policy.
- The broader architectural conclusion is unchanged: the repo has a real
  first-playable core, and every larger system still needs a measured trigger
  before it becomes active scope.
- Evidence tier: Tier 1 static inspection plus earlier recorded runtime notes
  in the worklog.

## Addendum (2026-07-27): reread bridge for the optimization-gaps thread

- The reread of the "3D Game Optimization Gaps" thread is archived in
  [Additional ChatGPT Research Ingestion](./ADDITIONAL_CHATGPT_RESEARCH_INGESTION_2026-07-25.md).
- This addendum does not alter the parallel review verdict; it only makes the
  updated ordering easy to reach from this review surface.
- The same long-term sequence still applies: kernel and renderer split first,
  then capability/affordance contracts, then migration and observability, then
  streaming or authority only when evidence demands it.

## Addendum (2026-07-27): animation implementation evidence was outside the canonical trail at the time

- A new implementation-flow artifact existed at
  `docs/research/THREEJS_ANIMATION_IMPLEMENTATION_FLOW_2026-07-27.md` when this
  review addendum was written.
- It was runtime implementation evidence from the parallel lane at the time,
  not canonical research or roadmap content, so it remained intentionally
  outside this review addendum and the canonical research bridge.
- The boundary is documented in the worklog so the repository can preserve the
  distinction without folding parallel implementation proof into the research
  path.

## Addendum (2026-07-27): live renderer delegation superseded the earlier
parallel-only reading of the animation note

- At the time of the later 2026-07-27 addendum, the checkout wired
  `vehicleAnimationSystem` into `src/game/renderer.ts`, so the animation
  implementation flow was no longer just an isolated parallel evidence note.
- The earlier classification in this addendum remained historically valid for
  the review context, but the live boundary belonged to the renderer/
  animation delegation recorded in ADR-0031, the worklog, and the animation
  implementation-flow note itself.
- Keep reading this addendum as research provenance, not as the final live
  authority on the current animation boundary.
- The live boundary itself is now tracked in
  [Three.js Animation Implementation Flow](./THREEJS_ANIMATION_IMPLEMENTATION_FLOW_2026-07-27.md)
  and
  [Three.js Interaction Implementation Flow](./THREEJS_INTERACTION_IMPLEMENTATION_FLOW_2026-07-27.md),
  so readers can jump from provenance to the present implementation trail.

## Addendum (2026-07-27): interaction boundary is separate runtime-owned evidence too

- At the time of the addendum, the tree exposed
  `docs/research/THREEJS_INTERACTION_IMPLEMENTATION_FLOW_2026-07-27.md` as the
  interaction evidence, rather than a present `src/game/interaction.ts` source
  file.
- It belonged with the animation lane as presentation/interaction evidence, not
  with the passage/state tranche or the canonical research trail.
- The ownership split was reflected in the worklog and the parallel runtime
  handoff so the live lane stayed coherent without becoming the active research
  authority.

## Addendum (2026-07-27): the newer runtime tranche stays parallel-owned too

- A broader untracked runtime tranche surfaced with atmospheric, debris,
  electrical-grid, expedition-economy, fuel-efficiency, salvage-crafting,
  surface-moisture, and winch-pulley modules plus their tests.
- These files are implementation evidence from the parallel lane, not canonical
  research or roadmap content, so they remain outside the research canon and
  outside this addendum's active trail.
- The correct role for this note is classification only: it preserves the
  boundary so the repo can keep the research canon clean while the runtime lane
  continues independently.

## Addendum (2026-07-27): the runtime tranche now includes hazard, missions, UI, and maintenance too

- The live tree now also carries `src/game/landslide-hazard.ts`,
  `src/game/procedural-missions.ts`, `src/game/radial-ui.ts`, and
  `src/game/vehicle-maintenance.ts` with matching tests.
- These remain parallel-owned implementation evidence, not canonical research
  or roadmap content, so they belong with the runtime lane and outside the
  research canon.
- This keeps the research boundary honest as the live lane grows beyond the
  earlier atmospheric and economy modules.
