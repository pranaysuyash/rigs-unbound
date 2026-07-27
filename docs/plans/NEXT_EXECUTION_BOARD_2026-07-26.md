# Rigs Unbound — Next Execution Board

- Date: 2026-07-26
- Status: active, living execution board
- Canonical parent: [Master Execution Tracker](MASTER_EXECUTION_TRACKER.md)
- Product direction: [Exploration Map](../exploration/EXPLORATION_MAP.md)
- Release evidence: [Sites Version 10 Release](../reviews/SITES_VERSION_10_RELEASE_2026-07-26.md)
- Owner: project owner; agents update status and evidence in the same change

This is the focused working view of the larger master tracker. It does not
replace the stable `RU-*` identifiers or create a second roadmap. An item is
Done only when its stated closure evidence exists.

## Status legend

- `[x]` Done — required evidence exists and is linked.
- `[-]` In progress — implementation or verification is active.
- `[ ]` Ready — dependency and decision gates are closed.
- `[?]` Decision needed — implementation would encode an unaccepted choice.
- `[~]` Researching — evidence gathering remains active.
- `[>]` Deferred — deliberately sequenced behind a named dependency.
- `[!]` Blocked — an external dependency prevents useful progress.

## Execution rules

1. Re-check the live checkout before every stage, commit, push, or deployment.
2. Preserve concurrent staged, unstaged, and untracked work.
3. Do not mix release repair, gameplay admission, research, and generated
   evidence into an unexplained commit.
4. Player-facing work needs browser evidence; comprehension needs a fresh human.
5. Deploy only an exact pushed commit and record its Sites IDs and rollback.
6. Update this board, the parent tracker, acceptance review, and worklog when a
   task changes state.

## Phase A — Freeze and reconcile the released first rung

- [x] **A1 — Preserve the validated source baseline.**
  - Related: RU-0601/0406.7, RU-0002.
  - Evidence: guarded gameplay/evidence commit `a340fbd369f5d4b53309abf0f77795b65beb196a`
    and clean-install repair `58968333c616cdd055b94ef11c29e69109df3a24`
    are on `origin/main`.
  - Gate: full managed hook; no AI co-author trailer; local/remote IDs agree.

- [x] **A2 — Repair the clean-install Sites build boundary.**
  - Finding: Sites version 8 failed because `vite-plugin-wasm@3.5.0` did not
    admit Vite 8.
  - Resolution: upgrade to `vite-plugin-wasm@3.6.0`; retain Vite 8.1.5.
  - Evidence: clean `npm ci`, build, tests, assets, and format gates passed.

- [x] **A3 — Publish exact-source Sites version 9.**
  - Source: `58968333c616cdd055b94ef11c29e69109df3a24`.
  - Version:
    `appgprj_6a64c10e5a2c8191ad80278ea124aa6b~appgver_8d8b9b737464819189a7663efc1dc29e`.
  - Deployment: `appgdep_6a66391c33ac8191905ac87775b1585e`.
  - URL: <https://rigs-unbound.suyashpranay.chatgpt.site>.
  - Gate: terminal status `succeeded`; default and Field 02 return HTTP 200.

- [x] **A4 — Run public-production real-touch acceptance.**
  - Related: RU-0601/0406.6.
  - A fresh `390×844`, `hasTouch` profile used public touch controls to enter,
    drive, collect five salvage, return Home, fit Lug tyres, reload, and observe
    the visible fitted module.
  - The wider rig/camera/terrain/activity matrix exited 0 with zero captured
    console/page problems.
  - Evidence tier: Tier 4 public runtime observation.

- [x] **A5 — Reconcile release documentation and git state.**
  - Add version 9 to the release ledger and acceptance review.
  - Keep version 7 as the prior known-good rollback; version 8 is failed.
  - State that later parallel changes are not part of version 9.
  - Re-audit staged/unstaged/untracked work before any new commit.
  - Evidence: tracker, worklog, acceptance, runbook, and version-9 release
    record now agree; the documentation remains uncommitted alongside the
    actively changing shared tranche and has not swallowed that tranche into a
    release commit.

- [ ] **A6 — External fresh-player comprehension.**
  - Related: RU-0601/0406.6, RU-0208.
  - Use at least one person who has not read project documentation.
  - Ask them to enter, identify the objective, earn salvage, return Home, fit a
    part, explain the change, and use the new benefit.
  - Record hesitation, wrong turns, coaching, completion time, device/input,
    and the player's own explanation.
  - Gate: the player can describe what they found, bought, and made newly
    possible without coaching.

## Phase B — Admit the current parallel tranche

- [x] **B1 — Preserve and classify every concurrent change.**
  - Related: RU-0908.
  - Inventory staged, unstaged, untracked, screenshot, generated, and runtime
    artifacts.
  - Group by concern: first-rung/first-cut, Unbound Passage, emissions,
    cultivation/schema v7, renderer, docs/authority, harness, and captures.
  - Identify overlap in `state.ts`, `renderer.ts`, `main.ts`, `styles.css`,
    storage, and the browser harness.
  - Evidence:
    [Parallel Work Preservation and Admission Audit](../reviews/PARALLEL_WORK_PRESERVATION_AUDIT_2026-07-26.md)
    assigns purpose, dependencies, admission gates, and a proposed commit order;
    nothing was discarded.

- [x] **B2 — Resolve the first-rung completion contract.**
  - Released behavior: fitting the part resolves to `free-explore` and marks
    the rung complete.
  - Decision: preserve that short, rig-neutral completion. A first-cut is an
    optional capability-specific follow-on or a beat inside a later admitted
    vertical; it is not universal onboarding.
  - Reason: requiring the tractor blade after any rig's first fitted part
    contradicted the product's explicit anti-anchoring principle and the
    released reward→spend contract.
  - Keep guidance derived from canonical state; add no shadow quest ledger.
  - Evidence: resolver/tests restored; browser matrix rerun remains part of B7.

- [x] **B3 — Admit or reject Unbound Passage groundwork.**
  - Related: RU-0909.
  - Current evidence: pure reducer now preserves failed-lane provenance,
    rejects invalid ticks, and passes seven focused tests plus typecheck; the
    canonical `GameState`/save path now carries `unboundPassage`, and the public
    progression snapshot publishes the inherited-route read model.
  - Keep the reducer downstream of locomotion; no direct storage, renderer, or
    generic quest ownership.
  - Verify author provenance, inherited benefit, recoverable failure,
    malformed-record recovery, and schema ownership.
  - Gate: tests pass and the admission review has no stale blocker claims.
  - Browser/runtime admission remains in C2.

- [?] **B3a — Admit or reject Survey Route 01 and its schema-v7 claim.**
  - Current evidence: a second activity binding (`survey`) uses the shared
    activity/affordance/state/save path; focused rules, integration, corruption,
    v6 migration, stationary-expiry, and exactly-once reward tests pass.
  - Fixes applied: impossible survey offers no longer hide legal actions;
    expiry evaluates every fixed step rather than only after movement.
  - Decision gate: operator admits this as the next runtime activity and accepts
    that cultivation moves to schema v8, or rejects/resequences it before merge.
  - Browser gate: take, sight, expire, retry, complete, reward, reload, touch,
    accessibility, and comprehension.

- [?] **B4 — Admit or reject emissions and cultivation groundwork.**
  - Related: RU-0202, RU-0203, ADR-0025, ADR-0026.
  - Emissions: source output stays separate from listener sensitivity, falloff,
    occlusion, and threat interpretation.
  - Cultivation: decide real-cut provenance, schema-v7 owner, bounds, harvest
    value, and post-sow terrain policy.
  - Gate: operator accepts decisions; tests, migration, typecheck, and browser
    evidence match.

- [-] **B5 — Remove or complete partial renderer work.**
  - Related: RU-0503, RU-0506.
  - Preserve one visibility/LOD and DPR/profile authority.
  - Reject stale instance bounds, duplicate near/far representations,
    unpopulated matrices, counters surviving rebuilds, and wrong tier anchors.
  - Current correction: incomplete billboards and dangling counters are absent;
    dynamic instance clouds retain `frustumCulled = false` until truthful
    aggregate bounds exist. Earlier “complete” research claims were withdrawn.
  - Gate: moving-anchor, bounds, profile, screenshot, and runtime-metric
    coverage passes.

- [x] **B6 — Reconcile replay/run-record truth.**
  - Related: RU-0701.
  - Classify every command as replay-supported, diagnostic, or non-replayable.
  - Cover malformed kinds, repair, reset, recovery, map, input timing, and
    acceptance-only commands.
  - Gate: fresh first-rung replay status is honest and unsupported commands are
    visible rather than misrepresented.
  - Evidence:
    [Replay and run-record truth acceptance](../reviews/REPLAY_RUN_RECORD_ACCEPTANCE_2026-07-26.md).
    Schema 4 distinguishes supported, diagnostic, and non-replayable entries;
    real-touch fixed-step reconstruction, repair/reset, malformed/truncated
    records, and explicit acceptance-fixture refusal pass.

- [x] **B7 — Run the full integrated admission matrix.**
  - Format and diff hygiene.
  - Main and deterministic-kernel typechecks.
  - Full root, kernel, asset, preflight, storage, passage, signature, world,
    terrain, renderer, and replay tests.
  - Clean production build and player-asset boundary.
  - Development `4173` and freshly rebuilt preview `4174`.
  - Desktop, `390×844`, keyboard, pointer, real touch, reduced motion,
    save/reload, player/developer surfaces, and zero console/page errors.
  - Three motto-v4 passes and missed-anything sweep.
  - Gate: no failing or Tier 1-only gameplay claim is called complete.
  - Evidence:
    [Integrated admission matrix](../reviews/INTEGRATED_ADMISSION_MATRIX_2026-07-26.md).
    The frozen production build passed 275 root tests, seven kernel tests,
    typecheck, build, nine asset tests, asset preflight, formatting, whitespace,
    and the full keyboard/touch browser harness with zero captured console/page
    problems.
  - Environment note: a frozen static server on `4193` replaced the normal
    mutable preview port for this pass because concurrent Vite rebuilds were
    invalidating shared `dist` asset hashes. Public deployment and external
    comprehension remain separate gates.

- [-] **B8 — Commit, push, and deploy admitted groups.**
  - Re-run preservation audit before each mutation.
  - Commit by coherent concern only after its gates pass.
  - Run the complete managed hook.
  - Push, verify GitHub, save/deploy exact source in Sites, and rerun public
    acceptance.
  - Gate: local, GitHub, Sites, tests, browser, and docs agree.
  - Evidence: the admitted integration checkpoints were pushed through
    `6b4536f900cc98404767096cd3eb4f45bac53fda`; that exact source was built in
    isolation, saved as Sites version 10, deployed successfully, and passed the
    full public production browser harness with zero captured console problems.
    See
    [Sites Version 10 Release](../reviews/SITES_VERSION_10_RELEASE_2026-07-26.md).
  - Reopened for the post-version-10 tranche: another active process committed
    and pushed through `a092e89` during this task, while the public deployment
    still points to older source `6b4536f`. This agent issued none of those git
    or deployment mutations. Current replay/first-rung corrections and
    concurrent renderer/performance work need a fresh grouped audit,
    exact-source deployment, and public rerun before B8 can close again.

## Phase C — Next playable vertical

- [?] **C1 — Operator chooses the next vertical.**
  - Current first-principles recommendation: **Unbound Passage 01 before
    Farmfall expansion**, because it tests whether one rig creates durable,
    useful world change for another. See
    [Next Vertical Recommendation: Unbound Passage 01](../reviews/NEXT_VERTICAL_RECOMMENDATION_UNBOUND_PASSAGE_2026-07-27.md).
  - Alternative: keep Farmfall first but require the same cross-rig inheritance
    invariant inside cultivation/harvest/recovery.
  - Gate: explicit project-owner choice recorded without erasing alternatives.

- [>] **C2 — Build Unbound Passage 01: Three Ways Through.**
  - Dependency: C1 and Phase B.
  - One blocked destination; at least two capability-authored lanes.
  - One rig authors a persisted route consequence; a physically selected
    second rig benefits after reload.
  - Failure leaves a visible recoverable state.
  - No universal episode engine.
  - Gate: two lanes, inherited benefit, save/reload, failure/recovery,
    accessibility, browser evidence, and fresh-player comprehension.

- [>] **C3 — Run Signal Break 01 as a falsification test.**
  - Test readable pressure, fragile cargo, intermittent guidance, and recovery.
  - Compare real seams with Unbound Passage before generalising orchestration.

- [>] **C4 — Complete Farmfall Slice 01.**
  - Persistent plough → sow → grow → harvest.
  - One real listener consumes explicit emissions.
  - Bounded night threats and a persisted dawn consequence.
  - Journey + Verb Mastery; failure/retry/recovery; schema migration.
  - Desktop, narrow, real-touch, browser, and human acceptance.

## Phase D — Platform hardening

- [ ] **D1 — Representative-device performance envelope.**
  - Related: RU-0503 through RU-0506, RU-0808.
  - Measure cold cache, controllable/input-ready time, frame p50/p95, calls,
    triangles, GPU/heap memory, save latency, terrain build, and visibility.
  - Add honest readiness, bounded residency/streaming, cache/chunk policy,
    fallback, and operator visibility.
  - Gate: measured low/mid-device budgets preserve playability.

- [ ] **D2 — Production-intent art slice.**
  - Related: RU-0501, RU-0502, RU-0803.
  - Keep the Kenney All-in-One bundle private.
  - Select assets through manifest, license, hash, budget, runtime, and
    production-art gates.
  - Replace one coherent vehicle/environment slice with explicit sockets,
    capabilities, collision, LOD, materials, and fallback.
  - Prove dilapidated → repaired → robust states and switchable equipment.

- [ ] **D3 — Input, accessibility, feedback, and workshop UX.**
  - Remappable actions; keyboard/touch/gamepad parity.
  - Reduced motion, contrast, scaling, safe areas, semantic DOM, accessible
    failures, and non-color cues.
  - Simplify narrow HUD/workshop composition.
  - Gate: automated checks plus keyboard, touch, gamepad, and human review.

- [ ] **D4 — Replay, guest portability, and account boundary.**
  - Time Trial Ghost and deterministic inspection first.
  - Guest save export/import with validation/recovery second.
  - Account/cloud conflict, ownership, deletion, offline, and migration decision
    third.

- [>] **D5 — Social, multiplayer, AI, and creator systems.**
  - Async sharing before authoritative co-op.
  - AI remains proposal-only; deterministic validation owns durable mutation.
  - Data packs before bounded editor; scripting only after validation,
    versioning, moderation, provenance, and recovery.

## Phase E — Research and skill coverage

The tagged skills are not all “finished.” They are a continuing capability
catalog. Each recommendation must become Accepted, Rejected, Experimental,
Deferred, or Superseded with evidence.

- [~] **E1 — Game direction and reference-game atlas.**
  - Open-world vehicles, sandboxes, farming, survival, racing, defense, space,
    toys, repair/upgrades, indie hybrids, UI, onboarding, economy, failure, and
    progression.

- [~] **E2 — Browser engine and gameplay stack.**
  - Three.js, R3F/Drei, Phaser, Babylon.js, PlayCanvas, Godot Web, PixiJS,
    Excalibur, ECS, Rapier/Box2D/Jolt, Workers, WASM, WebGPU, and hybrid 2D/3D.
  - Evaluate licensing, runtime cost, maintenance, determinism, accessibility,
    debugging, and escape hatches.

- [~] **E3 — Three.js depth lanes.**
  - Geometry, materials, textures, loaders, lighting, animation, interaction,
    shaders, postprocessing, gameplay systems, UI, generation, and performance.
  - Apply through measured probes that preserve game-owned state/simulation.

- [~] **E4 — Art, sprite, animation, and asset pipelines.**
  - 2D sprites, GLTF, modular vehicles, damage/repair, sockets, variants,
    LOD/impostors, procedural dressing, VFX, and image-generation concepts.

- [~] **E5 — UI, frontend, and accessibility.**
  - HUD, workshop/fleet, map, editor, economy, progression, mobile input,
    accessibility, semantic overlays, responsiveness, and presentation state.

- [~] **E6 — Testing and browser tooling.**
  - Kernel tests, migration fuzzing, real-input browser acceptance, screenshots,
    production smoke, cold-cache profiles, and browser lifecycle.

- [~] **E7 — Backend, auth, economy, multiplayer, safety, and AI.**
  - Guest identity, cloud sync, authority, rooms, trading, anti-cheat,
    moderation, analytics, costs, privacy, backup, and disaster recovery.

- [~] **E8 — Procedural generation, modding, and editors.**
  - Authored anchors plus seeded variation; schemas, validators, versioning,
    provenance, sandboxing, budgets, migration, and recovery.

- [~] **E9 — Source catalogs and external research.**
  - Reconcile the supplied spreadsheets, prior ChatGPT research, current docs,
    primary sources, and implementation evidence in the Exploration Map.

## Immediate next call

The integrated and replay matrices now pass locally. The next ordered work is:

1. run external fresh-player comprehension for A6;
2. reconcile Survey Route's schema ownership with cultivation and obtain the
   remaining B3/B3a/B4/C1 operator decisions;
3. close the current renderer/performance admission evidence by publishing the
   W1 rollout matrix in `docs/research/WEBGPU_AND_WEB_PERFORMANCE_ANALYSIS_2026-07-25.md`
   and then begin the representative-device D1 envelope;
4. perform a fresh preservation audit, exact-source deployment, and public
   rerun for the post-version-10 tranche;
5. then wire the chosen player-facing vertical without turning a validation
fixture into product identity.

### Renderer policy lane (motto_v4 long-term continuation)

1. Close W1 renderer evidence before any new load-bearing vertical decision:
   - publish measured startup failure/fallback rates by policy/request (`auto|webgl|webgpu`)
     and device class,
   - verify checkpoint observability (`rendererBackendPolicy`, `graphicsContextLost`,
     `graphicsContextRestored`) remains consistent after `recreateRenderer`,
   - decide whether `rendererPolicy=stable` can shift from conservative `off` on production surfaces.
2. Keep `rendererPolicy=off` on conservative production until D1 representative-device data demonstrates
   non-regressive stability under default paths.
3. Reopen `B3a` and `B4` once this lane has stable telemetry, because unresolved game schema decisions
   and render reliability decisions are coupled at first release surfaces.

This protects the playable public baseline while preserving the ambitious
cross-rig direction.

## Three-pass review record

### Pass 1 — Immediate correctness and completeness

- Existing RU IDs are reused and every task has a closure gate.
- Released, active, decision-gated, research, and deferred work are separated.
- Public touch evidence is recorded without claiming human comprehension.

### Pass 2 — Architecture and long-term viability

- One canonical state/mutation path remains the rule.
- Passage, emissions, cultivation, replay, renderer, and social authority
  boundaries are explicit.
- Broad research is gated by concrete player-visible proofs.

### Pass 3 — Rule compliance and supervision readiness

- Parallel work has a preservation/admission phase.
- Git, Sites, test, browser, documentation, and operator-decision gates exist.
- Open questions remain visible rather than becoming false Done claims.

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this execution board. This board still owns the
current gating and sequencing decisions; the new note carries the wider
machine-keeper thesis and long-range direction.
