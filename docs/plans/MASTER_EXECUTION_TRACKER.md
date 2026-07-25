# Rigs Unbound — Master Execution Tracker

- Status: canonical living task list
- Started: 2026-07-26
- Owner: project owner; agents update evidence and status in the same change
- Product source of truth: [Exploration Map](../exploration/EXPLORATION_MAP.md)
- Decision source of truth: [ADRs](../decisions/)
- Evidence source of truth: [Worklog](../WORKLOG.md) and [reviews](../reviews/)

## How to maintain this tracker

Use only these states:

- `[x] Done` — closure evidence is linked and the required gate passed.
- `[-] In progress` — implementation or verification is active.
- `[ ] Ready` — decision is sufficient and dependencies are closed.
- `[?] Decision needed` — implementation would encode a load-bearing choice.
- `[~] Researching` — evidence is being gathered; no implementation claim.
- `[>] Deferred` — deliberately sequenced behind a named dependency.
- `[!] Blocked` — an external dependency prevents meaningful progress.

Every item must name its closure gate. New findings are added here before an
agent leaves the task. “Done” is never inferred from code existing.

## 0. Repository, release, and continuity

- [x] **RU-0001 — Canonical project identity.** Rename the checkout, package,
  GitHub repository, and public title to **Rigs Unbound**.
  - Evidence: ADR-0005, `package.json`, Git remote
    `pranaysuyash/rigs-unbound`.
  - Closure: one local checkout on `main`; repository and product naming agree.
- [x] **RU-0002 — Guarded git workflow.** Install the managed v4
  `prepare-commit-msg`, `pre-commit`, and `commit-msg` gates, including the
  AI-co-author rejection.
  - Evidence: active files under `.git/hooks/`; prior guarded commits on `main`.
  - Closure: a normal commit passes only with fresh full-motto evidence and the
    required trailers.
- [x] **RU-0003 — Public Sites foundation.** Reuse the existing Sites project
  and publish version 4 from commit `aa82cee`.
  - Evidence: Sites version 4 source provenance and the live
    <https://rigs-unbound.suyashpranay.chatgpt.site> URL.
  - Closure: production deployment succeeds and the URL responds.
- [-] **RU-0004 — Preserve and publish the 2026-07-26 integration batch.**
  - Scope: gameplay repairs/additions, obstacle hot-path memoization, Rapier
    lab continuation, Box3D physical-wheel probe, playtest evidence,
    progression decision, trailer tooling/assets, research, and task tracking.
  - Current evidence: typecheck, 102 root tests, seven kernel tests, five asset
    tests, formatting, production build, Field 02 browser acceptance on both
    4173 and 4174, Rapier lab acceptance, and Box3D lab acceptance are green.
  - Closure: `git add -A`; full v4 hook attestation; guarded commit; push to
    `origin/main`; Sites version saved and production deployment succeeded from
    that exact pushed commit; live smoke check recorded.
- [ ] **RU-0005 — Keep deployment provenance current.**
  - Closure: after every deployed commit, update `progress.md` and this tracker
    with the deployed source SHA and evidence tier.
- [ ] **RU-0006 — Bound repository evidence growth.**
  - Context: the current raw playtest corpus is about 84 MB and contains useful
    discovery history as well as failed exploratory runs; curated review and
    comms assets are separate.
  - Closure: record an explicit retain/archive/ignore policy without deleting
    historical evidence; define which future raw captures stay local and which
    summaries/screenshots belong in git.

## 1. Current playable and first-rung repair

- [x] **RU-0101 — Field 02 traversal substrate.**
  - Evidence: terrain, routes, surface/grip/grade, collision, minimap, world
    memory, three rigs, six cameras, schema-v4 persistence, and two-port browser
    acceptance.
- [x] **RU-0102 — Rig fantasy differentiation gate (simulated players).**
  - Evidence: three independent persona reports and
    [synthesis](../reviews/PLAYTEST_SIM_SYNTHESIS_2026-07-25.md).
  - Result: Torque, Spark, and Drift were described as different machine
    fantasies rather than merely different speeds.
  - Boundary: human taste evidence remains open.
- [x] **RU-0103 — Make rig switching spatial.**
  - Evidence: `RIG_SWITCH_RANGE`, reason-coded refusal, near/far/spawn tests,
    and updated acceptance driver.
  - Closure: a remote rig cannot be selected as a free teleport; onboarding
    swaps at the shared home pad remain possible.
- [x] **RU-0104 — Add reversible terrain grading.**
  - Evidence: blade cut/fill mode, save-compatible attachment recovery,
    keyboard/touch controls, state tests, and visible capability label.
  - Closure: Torque can lower or raise soft terrain through one project-owned
    attachment state.
- [x] **RU-0105 — Remove obstacle-field hot-path recomputation.**
  - Evidence: bounded deterministic cell memoization and the complete test and
    browser acceptance suites.
  - Closure: collision/prop queries reuse stable generated cells without
    changing deterministic outcomes.
- [ ] **RU-0106 — Fix playtest P0 B1: title card re-entry.**
  - Gate: reproduce through real keyboard focus/Space flow; regression test;
    the welcome plate cannot reopen or allow background simulation after entry.
- [ ] **RU-0107 — Fix playtest P0 B2: first salvage collection.**
  - Gate: place one reachable first node, teach the action, collect through the
    canonical affordance chain, persist it, and prove the loop in browser.
- [ ] **RU-0108 — Fix playtest P0 B3: zero-condition recovery soft-lock.**
  - Gate: drowned/disabled rig with zero salvage always has a clear,
    auditable, non-exploitable recovery path; reset works by mouse, keyboard,
    and touch.
- [ ] **RU-0109 — Fix playtest P0 B4: phase-clock consistency.**
  - Gate: phase transitions and visible time are monotonic within their
    contract, survive save/reload, and complete a day→gloam→night→dawn run.
- [ ] **RU-0110 — Close cheap P1/P2 playtest defects.**
  - Scope: hood clipping, Drift spawn/recovery and extreme-grade behavior,
    player-vs-lab navigation, default debug telemetry, spawn occlusion,
    prop-aware camera obstruction, action labels, and record naming.
  - Gate: each defect has a reproduction, fix, and browser evidence; no
    developer fixture masquerades as a player objective.

## 2. First complete game loop — Farmfall Slice 01

- [-] **RU-0201 — Execute Phase 0 playability repair.**
  - Depends on: RU-0106 through RU-0110.
  - Source: [Farmfall plan](FARMFALL_SLICE_01_2026-07-25.md).
  - Closure: all Phase 0 gates green before new ecology state lands.
- [ ] **RU-0202 — Signature system.**
  - Gate: deterministic noise/light/heat-style channels from kernel state;
    distance falloff, telemetry, tests, and accessible presentation.
- [ ] **RU-0203 — Crop loop.**
  - Gate: plough→sow→grow→harvest uses persistent terrain and bounded,
    serializable crop state; invalid/corrupt entries recover visibly.
- [ ] **RU-0204 — Night threat ecology.**
  - Gate: bounded threats respond to explicit signature channels, damage rigs
    or crops, can be repelled through vehicle/world verbs, and dissolve at dawn.
- [ ] **RU-0205 — Dawn consequence record.**
  - Gate: one bounded, persisted summary explains crops saved/lost, rig damage,
    threats repelled, and mastery changes.
- [ ] **RU-0206 — Journey + Verb Mastery kernel.**
  - Decision: ADR-0018 accepted.
  - Gate: situation-weighted accrual resists repetition grind; per-verb power
    composes through `effectiveProfile()`; migration and balance caps tested.
- [ ] **RU-0207 — Farmfall presentation and full browser acceptance.**
  - Gate: one understandable day→night→dawn loop on desktop and narrow view,
    save/reload, no console errors, player-facing feedback, and updated docs.
- [ ] **RU-0208 — Repeat fresh-eyes playtests.**
  - Gate: same three simulated personas plus at least one real human session;
    compare comprehension/fun language against the pre-Farmfall baseline.

## 3. Vehicle, physics, and capability platform

- [x] **RU-0301 — Project-owned semantic vehicle intent and dynamics ports.**
  - Evidence: `src/dynamics/contracts.ts`, normalized intent, Rapier adapter,
    tests, and Physics Lab.
- [x] **RU-0302 — Rapier raycast-wheel Physics Lab 01.**
  - Evidence: four surfaces, fixed stepping, capture/reset, six cameras,
    telemetry/debug UI, unit and browser acceptance.
- [x] **RU-0303 — Box3D physical-wheel Probe 01.**
  - Evidence: exact `box3d-wasm@0.2.0` pin, four physical wheels/joints,
    complete assembly capture/restore, unit tests, desktop/narrow browser
    acceptance, and zero console problems.
  - Boundary: evidence compares controller families; it does not select a final
    physics engine.
- [ ] **RU-0304 — Shared collision-role/mask fixture.**
  - Gate: Rapier and Box3D express the same project-owned blocked/fellable/
    trigger/sensor/hazard/attachment roles without solver handles in game state.
- [ ] **RU-0305 — Unstable trailer + lifting arm activity.**
  - Gate: one rescue/construction/recovery job exercises attachment ownership,
    breakage, load, capture/recovery, feedback, and candidate comparison.
- [ ] **RU-0306 — Camera-obstruction query port.**
  - Gate: terrain and props feed one solver-independent scene-query result;
    chase/hood/side policies recover without clipping or disorientation.
- [ ] **RU-0307 — Next genuinely different motion family.**
  - Candidates: bicycle balance, tracks, buoyancy/hover, flight, 6-DOF, or
    articulation.
  - Decision gate: select the family that answers a product fantasy and exposes
    a new body-state contract; do not add another wheel-tuning demo.
- [>] **RU-0308 — Jolt comparison.**
  - Dependency: RU-0304 or RU-0305 must pose a constraint/controller question
    that Jolt can answer better than a duplicate benchmark.

## 4. Progression, economy, state, and content

- [x] **RU-0401 — Minimal economy grammar.**
  - Scrap is the one early spendable resource; Insight and Favor are
    non-spendable progression; Parts are concrete inventory.
- [x] **RU-0402 — Progression spine decision.**
  - ADR-0018: per-rig Journey, per-verb Mastery, and profile-level Insight; no
    universal player XP or aggregate power score.
- [ ] **RU-0403 — Canonical module slot and compatibility model.**
  - Gate: immutable blueprint slots + mutable installed instances + explicit
    incompatibilities + derived capabilities; one validator and one
    `effectiveProfile()` composition path.
- [ ] **RU-0404 — Torque Restoration Proof 01.**
  - Gate: start visibly dilapidated; stabilize and repair; fit one signature
    working attachment and one support choice; body/sound/handling/history show
    the transformation without a universal stat ladder.
- [ ] **RU-0405 — Save schema v5 and migration observability.**
  - Gate: crops/mastery/dawn/signature state migrate from v4 with reason-coded
    recovery, bounded data, round-trip tests, and operator-visible summary.
- [ ] **RU-0406 — First job and first meaningful spend.**
  - Gate: a new player reaches, understands, earns, and spends the first Scrap
    without reading project docs.
- [>] **RU-0407 — Favor, Parts, NPC barter, and contracts.**
  - Dependency: first spend and Farmfall loop must prove the core economy.
- [>] **RU-0408 — Player trading or real-money systems.**
  - Dependency: explicit product decision, server authority, ledger/escrow,
    abuse controls, reconciliation, and legal/operational review. No premium
    currency is currently proposed.

## 5. World, rendering, assets, and performance

- [x] **RU-0501 — Selective Kenney source-library audit.**
  - Evidence: local all-in-one bundle provenance, sampled CC0 evidence, pack
    previews, hashes, and selective-import policy; source bundle stays private.
- [ ] **RU-0502 — Import the first production-intent asset set.**
  - Gate: copy only chosen assets into a project-owned source/runtime pipeline;
    provenance manifest, preflight, stable semantic IDs, compression/budget,
    replacement path, and visual review.
- [ ] **RU-0503 — Cold-cache and representative-device profile.**
  - Gate: production URL on at least one real phone and one lower-power desktop;
    first input-ready, route transfer, frame p95, memory/thermal observations,
    touch, audio, context-loss/recovery, and degraded path recorded.
- [ ] **RU-0504 — Boot progress and honest readiness telemetry.**
  - Gate: loading is visible and non-blocking; `firstControllableMs` measures
    real input readiness; invalid/oversized content has a readable reject path.
- [ ] **RU-0505 — Chunk/sourcemap/cache policy.**
  - Current finding: production build is green but retains a >500 kB Three.js
    chunk advisory.
  - Gate: intentional code-splitting and sourcemap publication policy; cache
    headers and route isolation measured, not guessed.
- [ ] **RU-0506 — World residency/streaming proof.**
  - Gate: deterministic chunk manifest, residency transitions, stable IDs,
    bounded memory, unload/reload recovery, and minimap/world-coordinate
    continuity.
- [>] **RU-0507 — WebGPU runtime branch.**
  - Dependency: measured device/browser evidence shows the branch answers a
    real renderer or performance question; no shadow renderer by default.

## 6. UI, accessibility, feedback, and public surface

- [ ] **RU-0601 — First-session guidance without quest spam.**
  - Gate: opportunity compass explains reachable verbs, first salvage, current
    rig action, recovery, and night choice while preserving curiosity.
- [ ] **RU-0602 — Remappable action map and device parity.**
  - Gate: keyboard, touch, and gamepad use named actions; remaps persist;
    focus-loss and stuck-key recovery pass.
- [ ] **RU-0603 — Accessibility profile completion.**
  - Gate: reduced motion, contrast, non-audio threat cues, keyboard focus,
    readable touch targets, zoom/text behavior, and WebGL failure fallback.
- [ ] **RU-0604 — Separate player surface from evidence laboratories.**
  - Gate: labs remain reachable through an explicit developer/evidence route
    while the public field flow presents player goals rather than debug tools.
- [ ] **RU-0605 — Audio and haptic human review.**
  - Gate: a human listens to the procedural mix across load/slip/phase and
    records comfort/readability findings; haptic design remains capability- and
    accessibility-aware.
- [ ] **RU-0606 — Fleet/workshop information architecture.**
  - Gate: journey, mastery, modules, condition, and provenance remain legible
    without dashboard/card sprawl or a universal power score.

## 7. Replay, sharing, multiplayer, auth, AI, and creator systems

- [ ] **RU-0701 — Time Trial Ghost 01.**
  - Gate: versioned semantic input record, deterministic checkpoints,
    divergence explanation, per-circuit best record, shareable artifact, and
    backward-compatible replay policy.
- [ ] **RU-0702 — Guest/local identity and save export/import.**
  - Gate: versioned local profile, recovery bundle, explicit ownership, and no
    account requirement for first play.
- [?] **RU-0703 — Account link and cloud-save conflict policy.**
  - Decision needed: provider and conflict semantics.
  - Gate before implementation: ADR covering local→linked migration, auth vs
    authorization, offline queue, conflict UI, deletion/export, audit trail,
    and recovery.
- [>] **RU-0704 — Asynchronous social layer.**
  - Dependency: RU-0701 and RU-0703. Candidate scope: ghosts, shared seeds,
    records, and curated creations before real-time co-op.
- [>] **RU-0705 — Small authoritative co-op.**
  - Dependency: deterministic/replay evidence, server authority, abuse
    boundaries, reconnect/host migration decision, observability, and operator
    recovery.
- [ ] **RU-0706 — AI proposal boundary.**
  - Gate: any AI-authored mission/dialogue/content is versioned, validated,
    reviewable, deterministic at runtime, and has fallback; AI never authorizes
    economy, safety, or durable-value mutations.
- [>] **RU-0707 — Creator/editor ladder.**
  - Order: versioned internal data → inspector/validator → data-only packs →
    curated sharing → sandboxed scripting only if needed → open publishing only
    after moderation/rights/rollback operations.

## 8. Research and skill-coverage queue

Tagging a skill is not evidence that its guidance was analyzed. Each cluster
closes only when its relevant recommendations are reconciled against current
code and linked to accepted, rejected, deferred, or implemented outcomes.

- [~] **RU-0801 — Game direction and reference-game atlas.**
  - Coverage: game-development, game-director, wide-open brainstorm, indie/
    studio reference games, mechanics, UI flows, leveling, editors, and
    open-world coherence.
  - Gate: source register + pattern synthesis + concrete probes, with copied
    inspiration rejected in favor of transferable principles.
- [~] **RU-0802 — Three.js and browser-game systems.**
  - Coverage: Three.js fundamentals, geometry, materials, textures, lighting,
    animation, loaders, interaction, shaders, post-processing, gameplay
    systems, R3F/Drei alternatives, web-game foundations, and 3D web delivery.
  - Gate: every recommendation mapped to current architecture, a measured need,
    or an explicit rejection/defer reason.
- [~] **RU-0803 — Game art and asset pipelines.**
  - Coverage: game-art, image generation, sprite pipeline, web 3D asset
    pipeline, 2D/3D asset production, Kenney, LOD/compression/provenance, and
    art-direction consistency.
  - Gate: first production-intent asset set and documented source→runtime
    pipeline, not another unbounded asset catalog.
- [~] **RU-0804 — Physics, animation, and simulation catalog.**
  - Coverage: the supplied JS/Python workbook, Rapier, Box3D, Jolt, Havok,
    cannon-es, ammo.js, character/vehicle controllers, fluids, destruction,
    IK, procedural animation, and deterministic/replay implications.
  - Gate: question-led experiments behind project-owned ports; no package
    collection for its own sake.
- [~] **RU-0805 — UI, accessibility, and frontend delivery.**
  - Coverage: game UI frontend, Three.js UI design, responsive controls,
    onboarding, HUD legibility, settings, accessibility, and public website.
  - Gate: screenshot/device review and accessibility acceptance tied to the
    current player job.
- [~] **RU-0806 — Testing and browser tooling.**
  - Coverage: game-testing, game-playtest, Browser/Playwright/Webwright,
    Chrome DevTools, deterministic hooks, visual evidence, performance traces,
    and fresh-eyes playtesting.
  - Gate: reusable harnesses cover direct load, interaction, resize, focus,
    save/reload, console, failure, and production smoke surfaces.
- [~] **RU-0807 — Multiplayer, auth, backend, economy, and safety.**
  - Coverage: multiplayer skill, Supabase/Postgres, Nakama/Colyseus,
    authorization, durable-value ledgers, moderation, privacy, abuse, and
    operator recovery.
  - Gate: ADRs and threat/failure models precede any public shared mutation.
- [~] **RU-0808 — WebGPU and performance.**
  - Coverage: WebGPU skill, browser compatibility, worker/off-main-thread
    options, WASM/threading/COOP-COEP, culling/LOD/streaming, caching, PWA, and
    representative-device budgets.
  - Gate: measured profile data selects the next experiment.
- [x] **RU-0809 — Sites deployment workflow.**
  - Evidence: existing Sites project reused, source-provenance versions,
    packaging runbook, deployment status polling, and public URL.
  - Continuing duty: RU-0005.

## 9. Recurring acceptance gates

- [ ] **Before each commit:** re-read current status; classify every local
  item; inspect hooks and attribution; run targeted tests, typecheck, build,
  formatting, diff check, and the risk-appropriate browser path.
- [ ] **Before each deployment:** push the exact validated commit; package that
  exact source; save one Sites version; deploy only that version; poll to a
  terminal state; smoke the production URL.
- [ ] **Before each “done” claim:** three review passes; user/business/internal
  value; exact files/commands/outcomes; verified vs inferred; remaining gaps
  and hardening paths; uncommitted-state check; “Anything else?” answer.
- [ ] **After every fresh playtest or research pass:** add new findings here,
  update the exploration map, and route decisions to an append-only ADR before
  implementation.

## Anything else?

Yes. The immediate product risk is no longer “can a browser render a vehicle
world?” The current build proves that. The risk is whether a first-time player
can reach a meaningful job, consequence, and improvement without searching for
the game inside an impressive systems playground. The dependency order is:

`publish current evidence → repair the first rung → complete Farmfall →
repeat external playtests → expand physics/world/social breadth only when the
game loop asks a sharper question`.
