## 2026-07-25 — 3D Optimization Gaps "and more" pass

### Objective

- Analyze the full `chatgpt-conversation://6a64b5ee-9198-83e8-a94f-1ea55983f676` follow-on guidance against current project state and append explicit execution gates for contract correctness, scaling, and deferred claims.

### What was changed

- Appended the synthesis section in:
  - [docs/research/3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md) to classify:
    - what can be formalized immediately,
    - what is possible now,
    - and what is deferred until tests close.
- Ensured map-level gate status remains aligned with the open queue in [docs/exploration/EXPLORATION_MAP.md](exploration/EXPLORATION_MAP.md), including culling/LOD/streaming/replay/authority gates.

### Evidence and status

- Type of change: documentation only, architecture continuity update.
- Evidence depth: Tier 1 with static source-to-doc trace and explicit gap ranking.
- Runtime validation: not executed in this pass.
- Completion level: planning and sequencing gates tightened; execution gates still pending.

### Why this matters

- Prevents the requested long-pass from becoming an undocumented "future list."
- Preserves the current long-term architecture by sequencing high-risk systems behind deterministic replay/validation gates.
- Keeps authority, ECS, and broad streaming claims deferred with explicit close conditions.

### Next closure criteria

- Add command fixture and one explicit reject path test.
- Ship versioned capability and activity definitions with migration semantics.
- Add deterministic replay artifact and playback parity assertion.
- Add chunked world lifecycle counters tied to deterministic IDs.

## 2026-07-25 — 3D web-delivery and command-capability contract continuation

### Objective

- Continue the architecture analysis lane by continuing one-skill-at-a-time review and documenting web-delivery + contract-first execution gates directly in repo artifacts.

### What was changed

- Read and applied additional skill guidance from:
  - [3d-web-experience](/Users/pranay/Projects/skills/3d-web-experience/SKILL.md)
- Added:
  - [docs/research/3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md)
- Linked this audit into exploration/decision records by appending:
  - [docs/decisions/ADR-0011-command-capability-affordance-state-separation.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/decisions/ADR-0011-command-capability-affordance-state-separation.md) linkage in roadmap
  - [docs/exploration/EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md) web-delivery addendum

### Evidence and status

- Type of change: docs/decision continuity update.
- Evidence depth: Tier 1 static alignment plus explicit policy-to-artifact linkage checks.
- Runtime validation: not executed in this pass.
- Completion level: planning proof gates and decision continuity advanced; implementation gates still pending.

### Why this matters

- Prevents the web layer from becoming a “render only” afterthought.
- Ensures reduced-motion/load/fallback behaviors are treated as invariants, not optional polish.
- Keeps command/affordance architecture continuation tied directly to web performance and accessibility commitments.

### Next closure criteria

- Bind profile selection to measured startup/runtime thresholds.
- Add deterministic reduced-motion camera/input fallback behavior.
- Add content ingest reject paths with schema/payload validation before activation.
- Implement one end-to-end command->validation->state->event->presentation interaction with event telemetry.

# Worklog and Evidence Register

## 2026-07-25 — 3d-web-experience runtime check

- Used the `3d-web-experience` skill to inspect the live Field 02 browser
  surface rather than only the static docs.
- Confirmed the current page is canvas-first and still exposes the expected
  accessibility and operator hooks:
  - `#game-canvas`
  - `#map-canvas`
  - skip link to `#game-canvas`
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
- The same DOM snapshot did not show a separate `progress`, `aria-busy`, or
  other explicit loading marker, so the next web-experience question is whether
  the minimal loading/fallback chrome is intentional or should be made
  explicit for slower/public entry.
- Evidence depth: Tier 4 runtime/manual observation on
  `http://127.0.0.1:4173/?p0-repro=welcome`.

## 2026-07-25 — web asset ingest snapshot correction

- Re-checked the browser daemon while continuing the asset ingest / provenance
  lane.
- Corrected the current runtime surface in the asset-ingest contract from
  `Rigs Unbound — Physics Lab 01` to `Rigs Unbound — Field 02`; the daemon
  still reports zero console logs.
- The correction does not change the architectural conclusion:
  - the live runtime remains asset-light and procedurally authored,
  - `src/game/renderer.ts` still documents zero texture assets for the current
    terrain pass,
  - no imported runtime GLB/FBX/texture manifest is active in the playable
    path yet.
- The missing durable milestone is still a versioned manifest that the runtime
  actually consumes before browser asset activation becomes a live gate.

## 2026-07-25 — web loading bootstrap snapshot continuation

- Re-checked the live browser daemon while continuing the browser delivery lane.
- The current runtime surface remains `Rigs Unbound — Field 02`, with zero
  console logs in the daemon snapshot.
- The browser still has the right shell behavior:
  - `welcome-panel` is the real startup shell,
  - `saveStatus` gives a live text boot state,
  - entering the world dismisses the shell and focuses the canvas.
- The remaining open question is still explicit bootstrap visibility:
  - no separate progress meter,
  - no startup percentage,
  - no runtime profile selector visible to the player.
- That means the runtime is past the dead-black-box risk, but the loading /
  profile policy is still implicit rather than fully first-class in the UI.

## 2026-07-25 — threshold capture selection recheck

- Re-checked the threshold capture selection protocol against the live Field 02
  runtime.
- The protocol still matches the current app shape and the fresh review images
  already on disk:
  - `docs/reviews/assets/field-02-front-forward.png`
  - `docs/reviews/assets/field-02-top-down.png`
  - `docs/reviews/assets/rig-lab-01-desktop.png`
  - `docs/reviews/assets/rig-lab-01-narrow.png`
- The right comparison categories remain unchanged:
  - near-field dense scene,
  - occluded / hidden scene,
  - distance-gradient scene,
  - pressure scene,
  - reduced-motion comparison scene.
- What is still missing is the packaged comparison bundle itself: fixture id,
  metrics capture, screenshot/frame capture, operator note, and threshold state.

## 2026-07-25 — asset-production review continuation

- Re-checked the asset-production review against the live Field 02 runtime and
  the current `assets/asset-manifest.json` posture.
- The manifest remains the canonical registry and still contains:
  - two reference/concept tractor records,
  - one proposed Kenney static-prop fixture record,
  - `runtimePath: null` for all current entries.
- Slice A is therefore the right boundary:
  - provenance/rights metadata is formalized,
  - but no imported GLB/texture/audio asset is active in the playable path yet.
- The next durable asset milestone remains a runtime-import proof, not a broad
  import of art assets into the renderer.

## 2026-07-25 — runtime instrumentation KPI recheck

- Re-checked the runtime instrumentation note against the live browser daemon.
- The current runtime surface is still `Rigs Unbound — Field 02`, with zero
  console logs in the snapshot.
- The KPI surface is live and observable:
  - `PerformanceMonitor.snapshot()`
  - `window.getPerformanceSnapshot()`
  - `window.render_game_to_text()`
  - HUD save / fps / draw-call / heap readouts
- The remaining gap is still packaging:
  - no repeatable profile comparison artifact,
  - no per-profile operator summary tied to a fixture,
  - no reusable fallback/degrade summary artifact,
  - no canonical screenshot/frame bundle binding the metrics together.

## 2026-07-25 — renderer/accessibility gate recheck

- Re-checked the renderer/performance/accessibility gate against the live Field
  02 runtime.
- The runtime still exposes the gate hooks:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.selectCamera()`
  - `window.getCameraResolutionEvidence()`
- The runtime still carries the right minimum gate shape:
  - `standard` and `mobile-safe` behavior are present,
  - reduced-motion clamping is present,
  - HUD text and semantic fallback paths are present,
  - the playable canvas remains the focus target after the intro is dismissed.
- The remaining gap is still the same packaged artifact gap:
  - no bundled capture set,
  - no canonical pass/fail summary for fallback events,
  - no operator-ready public smoke-test package.

## 2026-07-25 — culling/LOD spike-test recheck

- Re-checked the culling/LOD spike-test note against the live Field 02 runtime.
- The runtime is still healthy and the browser daemon still reports zero
  console logs.
- The current renderer posture still looks like a deliberate visibility budget:
  - repeated props are instanced,
  - prop rebuilds are radius-bounded,
  - some meshes disable automatic frustum culling for stable presentation,
  - draw calls and triangles remain compact enough for the scene.
- The formal gap remains unchanged:
  - no deterministic near-field fixture bundle,
  - no occluded/hidden fixture bundle,
  - no distance-gradient fixture bundle,
  - no pressure fixture bundle,
  - no reusable metrics/capture bundle promoted for comparison over time.

## 2026-07-25 — rendering-economy recheck

- Re-checked the rendering-economy note against the live Field 02 runtime.
- The browser daemon is still healthy and reports zero console logs.
- The runtime still exposes the frame-budget economy the note names:
  - Three.js canonical path,
  - instanced repeated world items,
  - radius-bounded prop drawing,
  - `PerformanceMonitor` / `window.getPerformanceSnapshot()` for draw-call,
    triangle, frame-time, memory, and terrain-build metrics,
  - HUD fps and save-health readouts.
- The remaining gap is still packaging:
  - no repeatable capture bundle,
  - no operator note for budget changes under pressure,
  - no screenshot/frame capture tied to the metrics,
  - no baseline promotion path for explanatory captures.

## 2026-07-25 — platform long-term audit recheck

- Re-checked the 3D platform long-term audit against the current Field 02
  runtime and browser daemon.
- The current runtime still matches the audit’s core premise:
  - bounded playable loop,
  - deterministic local simulation,
  - accessible shell and focus handoff,
  - observable render/performance metrics,
  - reference-first asset provenance,
  - intentionally bounded visibility/culling behavior.
- The highest-risk gaps remain future-gated:
  - no shipped-mesh authority layer,
  - no packaged comparison bundle for visibility/performance/accessibility,
  - no runtime-imported asset manifest in the playable path,
  - no formal replay transport or authority intent pipeline,
  - no chunk manifest / streaming lifecycle proving out-of-view work stays out
    of the frame budget.
- That keeps the backlog honest: the long-term platform shape is still right,
  but the risky lanes remain documented as future work rather than assumed
  delivered behavior.

## 2026-07-25 — replay artifact and ghost contract recheck

- Re-checked the replay/ghost contract against the live Field 02 runtime.
- The daemon is still healthy and reports zero console logs.
- The current runtime still exposes the bounded record surface:
  - `window.getRunRecord()`
  - `window.getRunRecordVerification()`
  - seed-backed bounded run records with commands, inputs, checkpoints, and
    saves
- The recorder is therefore real and useful as an internal audit log.
- The missing layer remains the first-class replay artifact surface:
  - no exposed playback path in the browser,
  - no ghost share/compatibility envelope,
  - no divergence report from replay execution,
  - no diagnostics-only vs replay-safe trust split.
- So the contract remains correctly staged: record/verify now, replay/ghost
  artifact later.

## 2026-07-25 — streaming-world residency recheck

- Re-checked the streaming-world contract against the live Field 02 runtime.
- The browser daemon is still healthy and reports zero console logs.
- The world substrate still behaves like a single canonical residency:
  - one `GameWorld`,
  - one `TerrainField`,
  - one obstacle field,
  - one exploration field,
  - one snapshot/save boundary.
- `src/game/world.ts` remains authored world data and anchors, not a chunk
  residency graph.
- `src/game/storage.ts` still saves/restores the world as one payload.
- The missing layer remains the chunk-streaming contract:
  - no `WorldChunkManifest`,
  - no residency states,
  - no activate/unload/rollback lifecycle,
  - no residency churn observability.

## 2026-07-25 — authority model groundwork recheck

- Re-checked the authority contract against the live Field 02 runtime.
- The browser daemon is still healthy and reports zero console logs.
- The runtime still supports the local-first authority posture:
  - commands are captured explicitly,
  - the deterministic kernel owns canonical mutation,
  - local persistence restores or replaces invalid records without treating
    them as truth.
- That means local input remains authoritative for the current slice, and no
  remote authority is required yet.
- The missing layer remains the shared-state envelope:
  - authenticated mutation request/response shapes,
  - explicit reject-path state separation,
  - durable-value recovery metadata as policy,
  - telemetry for authoritative outcomes,
  - a visible shared-state/server-authoritative boundary artifact.

## 2026-07-25 — simulation layers and resource governance recheck

- Re-checked the simulation-layers contract against the live Field 02 runtime.
- The browser daemon is still healthy and reports zero console logs.
- The runtime still proves the layered-simulation premise:
  - deterministic gameplay kernel with ordered mutation,
  - bounded, serializable world memory,
  - terrain/physics/collision separated from rendering,
  - runtime pressure measurements exposed through performance hooks,
  - presentation consuming snapshots rather than owning world truth.
- The missing layer remains the named governance envelope:
  - no owned domain-order table for non-render layers,
  - no explicit CPU/GPU/active-actor/residency/save budget ledger,
  - no fallback-policy table naming which layer downgrades first,
  - no recorded downgrade reason surfaced as policy.

## 2026-07-25 — accessibility auditor live recheck

- Re-read the `Accessibility Auditor` skill and rechecked the live Field 02
  runtime using the browser daemon.
- Confirmed the page now has a usable accessibility shell:
  - named landmarks (`main`, `header`, `aside`, `section`, `role="status"`,
    `role="alert"`)
  - meaningful headings
  - a visible skip link
  - a keyboard-focusable `#game-canvas`
  - focus landing on `canvas#game-canvas` after entry
- The current open question is no longer the core keyboard route; it is whether
  the loading/fallback chrome should be made more explicit for slower public
  entry or kept intentionally minimal.
- Evidence depth: Tier 4 runtime/manual observation on
  `http://127.0.0.1:4173/?p0-repro=welcome`.

## 2026-07-25 — 3d-asset-production source-and-runtime split

- Used the `3d-asset-production` skill to distinguish concept/reference assets
  from runtime assets in the current app.
- Confirmed the live Field 02 runtime is still intentionally asset-light:
  - terrain readability is carried by vertex colours and procedural geometry,
  - `src/game/renderer.ts` explicitly documents zero texture assets for the
    terrain pass,
  - there is no imported runtime GLB/FBX/texture manifest yet.
- The repo’s current asset work therefore sits in the right order:
  reference art and source-library audits already exist, and the next durable
  step is a versioned runtime asset manifest once imported art enters the
  playable path.
- Evidence depth: Tier 1 static inspection plus live runtime context.

## 2026-07-25 — Capability and governance runway addendum

### Objective

- Convert the second-tier conversation recommendations into a repository-documented
  long-term architecture addendum focused on high-impact low-risk sequencing.

### What was changed

- Appended a new section to
  `docs/research/3D_GAME_PLATFORM_LONG_TERM_AUDIT_2026-07-25.md` covering:
  - capability as contract vs boolean
  - command/validation/kernel/presentation ordering
  - replay/event/restricted-authority sequencing
  - deferred lanes with proof obligations
- Appended a new addendum to
  `docs/exploration/EXPLORATION_MAP.md` with scope status and lane-order decision
  criteria.

### Evidence and status

- Type of change: documentation only.
- Evidence depth: Tier 1 static source alignment; no runtime change in this pass.
- Decision confidence: sufficient for planning, not sufficient for implementation.
- Explicitly unchanged: renderer split, fixed-step kernel, persistence, and current
  activity loop.

### Why this matters

- Keeps architecture drift in check by adding a capability-first interpretation of
  “more” recommendations.
- Prevents premature multiplayer or streaming claims by sequencing authority and
  streaming after replay + validation lanes.
- Makes the next engineering pass measurable: each lane now has a pass criterion.

### Next closure criteria

- Render and resource budgets are quantified and benchmarked.
- A compact run/replay record with bounded input capture and checkpoint hashes lands.
- Deterministic event bus + capability-affordance compatibility passes at least one
  end-to-end interaction test.
- Stream manifest and chunk lifecycle lands with deterministic activation.

## 2026-07-25 — First executable open field

### Operator direction

- Treated the incoming ChatGPT review as critique, not a specification.
- Preserved the broad Rigs Unbound product horizon after the owner clarified that the game remains open rather than being anchored to every narrowing recommendation.
- Changed ADR-0001's immediate execution order from “two candidates before runtime” to “one provisional reference runtime, then compare when evidence identifies a concrete engine question.”

### Implementation

- Created a Vite/TypeScript/Three.js browser runtime at the repository root.
- Kept game state, fixed-step movement, named actions, furrow memory, discovery, validation, serialization, and browser hooks outside Three.js.
- Built a primitive Patchwork Atlas tractor/world without importing private source-library assets.
- Added keyboard, gamepad, touch, pause, reset, local recovery, visible diagnostics, DOM instruments, opportunity signals, chase/tactical cameras, and day/gloam/night states.
- Added 6 live state-kernel tests.
- Reconciled parallel work under `experiments/deterministic-kernel-probe/`: preserved it as a disposable fixture, scoped Vitest to the live TypeScript runtime, and made root checks run both suites.

### Runtime findings and fixes

- Port conflict: a parallel Python experiment occupied `127.0.0.1:4173`; the 3D Vite runtime moved to `4174` rather than terminating or overwriting the parallel session.
- Furrow density: the first browser drive created 118 marks over 16 metres because spacing compared the tractor position with the prior rear mark. Spacing now compares consecutive rear-mark coordinates; the same acceptance drive produced 16 marks over 17.41 metres.
- Camera composition: tactical mode initially left excessive empty space. It now centers the rig/world trace at a lower camera height.
- Mobile composition: the first `390 × 844` layout overlapped the field kit and stacked action controls. The field kit now ends at `687.20 px` and touch controls begin at `714.41 px`.
- WebGL lifecycle: dynamic shadow-map testing produced a Chrome texture-storage warning. The field now uses a project-owned blob shadow, and the animation loop stops before renderer disposal. The final acceptance run captured zero console warnings/errors.
- Persistence test: reload can preserve a bounded number of in-flight furrows newer than the periodic checkpoint through `beforeunload`; the acceptance assertion now checks no-loss plus bounded freshness rather than false exact equality.

### Commands and outcomes

- `npm install`
  - Installed current local dependency versions and reported 0 audit vulnerabilities.
- `npm run typecheck`
  - Passed root strict TypeScript and the deterministic JavaScript probe check.
- `npm test`
  - Passed 6 live-runtime tests and 7 deterministic-probe tests.
- `npm run build`
  - Passed. Output: HTML 4.73 kB, CSS 8.63 kB, JS 551.01 kB raw / 141.08 kB gzip.
  - One advisory remains: the single Three.js application chunk exceeds Vite's 500 kB raw warning threshold. Owner: runtime architecture. Closure: measure first controllable frame and split/replace renderer loading only if the profile shows player value; do not hide the warning by raising the threshold.
- Visible Playwright acceptance against `http://127.0.0.1:4174/`
  - Drove 17.41 metres, created 16 distance-spaced furrows, switched to tactical/gloam, advanced through the browser hook, recovered local world memory after reload, and passed the narrow-layout non-overlap assertion.
  - Captured zero final console warnings/errors or page errors.

### Evidence and readiness

- Tier 2: typechecks and 13 targeted state/kernel tests.
- Tier 3: production build, browser interaction chain, browser-hook stepping, and local persistence recovery.
- Tier 4: visible desktop and narrow browser observation.
- Code-ready: yes for the local field-test contract.
- Feature-ready: partial; it proves drive/tool/world-memory/camera/state seams but landmark verbs are signals, not full activities.
- Launch-ready: no; there is no public deployment, external player evidence, accepted engine, performance budget, camera-occlusion system, or production asset pipeline.

### Review passes

1. Immediate correctness: fixed furrow spacing, port ambiguity, WebGL lifecycle warning, and mobile overlap.
2. Architecture: separated live and disposable kernels, preserved renderer-independent state, and kept Three.js provisional.
3. Supervision readiness: synchronized README, progress, design, ADR, plan, tests, and evidence wording; no commit or push performed.

### Anything else?

Yes. The game now moves without shrinking its future. The next work should make horizon signals produce distinct spatial consequences and measure runtime behavior before expanding scenery or accepting an engine.

## 2026-07-25 — Exploration foundation

### Baseline

- The repository contained only generated/runtime context material and no game implementation.
- The supplied private workbook `js_python_animation_simulation_physics_3d_2d_catalog_2026.xlsx` was inspected read-only outside the repository.
- Workbook snapshot: 409 catalog entries across JavaScript/TypeScript, Python, legacy/emerging, recommended stacks, and taxonomy sheets; workbook verification date recorded as 2026-07-10.
- No git mutation, dependency installation, credential creation, external account change, deployment, or modification of the supplied workbook was performed.

### Instruction and context actions

- Read the global and projects-level instruction stack.
- Generated the canonical project context with the shared workspace `agent-start` tool for this repository.
- Loaded the project-local motto v4 and generated context pack.
- Applied the named game design, web game, 2D/3D, Three.js, WebGPU, UI, art, asset, testing, playtest, browser, and wide-open exploration guidance.
- Probed optional external media credentials without exposing values. Tripo, Gemini, and ElevenLabs keys were not available; no external media generation was attempted.
- Checked for the wide-open brainstorming skill’s optional external-LLM panel tools; none were available, so local parallel research perspectives were used.

### Research actions

- Classified the workbook as a discovery catalog rather than an adoption manifest.
- Checked current official documentation for representative rendering, engine, physics, multiplayer, backend, and browser paths.
- Delegated independent technology, game-reference, and risk critiques, then reconciled them into the project artifacts.
- Generated and visually inspected one comparative art-direction triptych. Copied it into the project, preserved the original generated file, recorded its hash/prompt/provenance, and marked it concept-only.

### Key commands and outcomes

- `<workspace>/agent-start --project <repo>`
  - Generated the project-local motto v4 and canonical context pack under `docs/context/agent-start/`, with `.agent/` compatibility mirrors.
- `find . -maxdepth 4 -type f -print | sort`
  - Confirmed the initial project baseline and later the documented artifact inventory.
- `shasum -a 256 docs/exploration/assets/patchwork_atlas_triptych_2026-07-25.png`
  - Recorded SHA-256 `bdc8165c12b3beccd6a586a4246d2b959b2fc8ad5cae05b8a446621b8079224a`.
- `node -e '<local Markdown link validation script>'`
  - Inspected 13 project Markdown files and reported `broken_local_links=0`.
- `rg -n "TODO|TBD|placeholder|coming soon|100%|1\\.00|final engine selected|production-ready|launch-ready" README.md DESIGN.md progress.md docs --glob '*.md'`
  - Reported no hidden completion claims or placeholder markers.
- `rg -n "Scrap|Signal|Insight|Favor|currency" README.md DESIGN.md progress.md docs --glob '*.md'`
  - Used during architecture review to find and resolve progression vocabulary drift.

### Decision status

- Proposed: renderer-independent gameplay kernel plus comparable engine probes.
- Proposed: tractor day/night first-playable hypothesis.
- Open: engine, physics integration, backend, art direction, final economy, networking, UGC, AI use, public name.
- Rejected for the first playable: multi-engine production runtime, MMO scope, premium currency, open UGC, and live generative gameplay.

### Evidence tiers

- Tier 0: untested creative hypotheses and future mechanics.
- Tier 1: local file/workbook inspection and official-source research.
- Tier 2: documentation structure/link/content checks recorded below.
- Tier 3–5: none. There is no integrated game, observed runtime, production-like deployment, or real-player evidence.

### Review passes

#### Pass 1 — Immediate correctness and completeness

- Checked the request against the README, exploration map, brainstorm, engine research, game atlas, risk register, design direction, ADRs, progress, and worklog.
- Confirmed all 13 project-authored Markdown files had resolvable local links (`broken_local_links=0`).
- Confirmed each load-bearing project artifact includes an `Anything else?` review section.
- Confirmed no final-engine, production-ready, launch-ready, `100%`, or placeholder claim remained.
- Changed: added the risk/provenance navigation links and recorded the generated concept’s weaknesses rather than presenting it as final art.

#### Pass 2 — Architecture and long-term viability

- Reconciled independent engine, game-reference, and adversarial public-readiness reviews.
- Confirmed one renderer-neutral game/content truth, one versioned vehicle/activity contract family, and no duplicate runtime route/pipeline/code exists because implementation has not begun.
- Confirmed Three/Babylon/PlayCanvas/Godot remain experiments rather than parallel production truths.
- Confirmed the connected-region model, single-vehicle first slice, guest/local-first save, staged multiplayer, server-authoritative durable state, data-only creator ladder, and AI proposal boundary agree across artifacts.
- Found vocabulary drift between `Signal` and `Insight`; standardized on one spendable soft resource (`Scrap`), non-spendable `Insight`, non-spendable `Favor`, and concrete parts. A world “signal” remains fiction, not currency.
- Changed: made the one-vehicle tractor slice the leading decision unit while retaining multi-vehicle breadth as a later proof of the grammar.

#### Pass 3 — Rule compliance and supervision readiness

- Rechecked the shared/project instruction stack, motto v4 acceptance contract, skill-driven test hooks, asset provenance, evidence tiers, deferred-system gates, and append-only ADR update logs.
- Confirmed no dependency install, code route, duplicate pipeline, external account mutation, deployment, git mutation, secret output, or modification of the supplied workbook occurred.
- Confirmed the first-playable’s trigger, states, decisions, actions, exception/failure paths, terminal state, durable outcome, user view, and operator/test visibility are documented.
- Confirmed runtime truth is still explicitly unknown: no Tier 3–5 gameplay evidence exists.
- Changed: recorded exact key commands/outcomes, artifact preservation, public-readiness gates, and the reason a public deployment was not claimed.

### Uncommitted and parallel work

- All files created in this exploration remain local.
- No commit or push was requested or performed.
- Git status was intentionally not inspected because the active project doctrine permits git checks only with explicit approval; therefore broader repository commit state is unverified, while this session's newly created artifacts are known to be local-only.
- No unrelated source work was present or modified.
- Generated `agent-start` context files and the project-local motto v4 were created by the required context process and left for review.
- `mcp-shell.log` existed at baseline and was left untouched.

## Anything else?

This log distinguishes research confidence from game confidence. A well-supported plan is not evidence that the proposed game is fun.

## 2026-07-25 — Additional ChatGPT research ingestion

### Inputs

- `<private-research>/vehicle_game_platform_exploration_2026.xlsx`
  - SHA-256: `149e87a1a82e36a9b4bfe3d45c3954f56c12f9e30115bd0998ef3696a62af993`
  - Read-only; source left unchanged.
- `<private-attachment>/pasted-text.txt`
  - SHA-256: `9865316570decd61682f3104524333ffa1a2d0d0930d0da1a60f9093ed7cc2a2`
  - Read-only; source left unchanged.

### Spreadsheet analysis

- Loaded through the bundled Python/openpyxl runtime.
- Confirmed 20 sheets, 22 structured tables, 42 formulas, 3 charts, and the preserved 409-entry master catalog.
- Confirmed all stated game-specific row counts.
- Confirmed unique mode names, vehicle-system items, engine names, tool names, editor names, progression-system names, roadmap orders, and decision IDs.
- Confirmed all 96 tooling rows and 14 engine rows have nonblank license/access and HTTP(S) source fields. This is a completeness check, not independent license verification.
- Confirmed engine weights sum to 1.0 and all cached weighted scores match manual calculation.
- Ran authoring-heavy, control/performance-heavy, and physics/mode-heavy sensitivity profiles; candidate ranking changed as documented.
- Observed openpyxl warnings for unsupported conditional-formatting extensions. The workbook was not saved, so the source extensions were not removed.

### Primary-source refresh

- Confirmed the PlayCanvas Editor Frontend MIT announcement from the official PlayCanvas blog.
- Confirmed Phaser 4.1.0 “Salusa” from the official Phaser release.
- Confirmed Box3D’s June 2026 announcement, C17 architecture/features, and author-stated alpha maturity from the official Box2D site.
- Did not treat the absence of an observed JavaScript/WASM integration as proof that none can exist; recorded it as an unproven adoption path.

### Reconciliation decisions

- The workbook’s 17 `Accepted` rows remain source-author statuses. No repo ADR was promoted.
- The project retains Scrap as its one spendable early resource; Credits was not added.
- The first slice remains tractor farm → defense. A same-tractor time trial becomes the immediate cross-mode proof.
- PlayCanvas gains a stronger authoring probe, not engine-selection status.
- Box3D enters a bounded feasibility watch, not the dependency plan.
- Incoming content boundaries were formalized as Proposed ADR-0003.
- Incoming public share/evidence objects were formalized as Proposed ADR-0004.

### Key commands and outcomes

- `<workspace-python> - <<'PY' ... load_workbook(...) ... PY`
  - Inspected workbook structure, tables, formulas, rows, source/license completeness, unique identifiers, engine scoring, and sensitivity without writing the file.
- `shasum -a 256 <text-source> <workbook-source>`
  - Recorded both source hashes above.
- `node -e '<local Markdown link validation script>'`
  - Inspected 16 project-authored Markdown files and reported `broken_local_links=0`.
- `rg -n "Credits|Scrap|Insight|Favor" README.md DESIGN.md progress.md docs --glob '*.md'`
  - Confirmed Credits appears only in the documented incoming conflict/rejection; the canonical grammar remains Scrap/Insight/Favor.
- `rg -n "Status: Accepted|- Status: Accepted|final engine|engine selected|production-ready|launch-ready|100%|1\\.00" ...`
  - Confirmed no project ADR was silently marked Accepted and no unsupported completion claim was introduced.
- `<workspace>/agent-start --project <repo>`
  - Completed project indexing; the generated session-context timestamp initially remained stale.
- `<workspace>/agent-start --project <repo> --skip-index`
  - Regenerated the canonical context pack and `.agent` mirrors; `SESSION_CONTEXT.md` now records `2026-07-25T07:40:23Z`.

### Pass 1 — Immediate correctness and completeness

- Compared both new sources against the existing README, exploration map, technology research, risk register, progression vocabulary, ADRs, and progress record.
- Verified workbook structure rather than trusting the narrative’s counts.
- Added the ingestion review, two proposed ADRs, workbook/source hashes, and direct navigation.
- Resolved Credits/Scrap and first-slice/race conflicts explicitly.
- Result: the new research is preserved without overwriting earlier decisions.

### Pass 2 — Architecture and long-term viability

- Separated immutable definitions, mutable owned state, compiled world output, runtime orchestration, and run evidence.
- Corrected `RunDirector` from authored input to ephemeral runtime state.
- Confirmed share-object URLs are conceptual product routes, not duplicate API-route authorization.
- Preserved one runtime truth while allowing Phaser/Box3D/other tools as disposable laboratories.
- Tested engine-score sensitivity and retained raw candidate evidence over aggregate-score authority.
- Result: new structure strengthens the long-term model without multiplying canonical truths.

### Pass 3 — Rule compliance and supervision readiness

- Rechecked motto v4 AI-output, data/config, decision-record, evidence-tier, append-only update, and `Anything else?` requirements.
- Confirmed both source files remain unchanged, no dependency/code/deployment/git/account mutation occurred, and no runtime claim was made.
- Confirmed every new load-bearing artifact has status, owner/reviewer, validation, risks, revisit triggers, update log, and `Anything else?`.
- Confirmed Tier 3–5 game evidence remains absent and visible.
- Result: the research ingestion is auditable and ready to supervise; implementation decisions remain open.

### Files created

- `docs/research/ADDITIONAL_CHATGPT_RESEARCH_INGESTION_2026-07-25.md`

## 2026-07-25 — Optimization gaps audit continuation

### Scope

- Continued structured review of the untrusted optimization conversation `chatgpt-conversation://6a64b5ee-9198-83e8-a94f-1ea55983f676`, with explicit check against source files for rendering, kernel, and progression-scaling architecture.
- Recorded findings in:
  - `docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md` (new "second-pass" addendum section),
  - `docs/exploration/EXPLORATION_MAP.md` (new optimization continuity checkpoint table).

### What changed

- Confirmed deterministic kernel, migration, renderer split, and migration/recovery path are already present and should not be rewritten.
- Marked missing/high-risk items as active queue entries (chunked streaming, collision layer matrix, replay transport, explicit chunked visibility lanes).
- Aligned new queue items with existing render contract (`PLAN_RENDER_PERFORMANCE_ACCESSIBILITY_2026-07-25.md`) and non-functional ADR (`ADR-0010`) so decisions remain coherent.

### Evidence notes

- No code/runtime behavior changed in this pass.
- No tests were run because this was a structured analysis-and-documentation update.
- Confidence remains **Tier 2 static** for all map decisions.
- Remaining confidence barrier: render/runtime hardening artifacts are still pending implementation and execution.

### What is still required

- Add deterministic culling/LOD tests tied to draw-path evidence.
- Add collision category/mask fixtures before introducing more non-ground locomotion classes.
- Add replay input/log + verifier before any public shared-session narrative.
- `docs/decisions/ADR-0003-versioned-gameplay-content-composition.md`
- `docs/decisions/ADR-0004-versioned-public-evidence-surfaces.md`

### Files updated

- `README.md`
- `progress.md`
- `docs/exploration/EXPLORATION_MAP.md`
- `docs/research/TECHNOLOGY_AND_ENGINE_OPTIONS_2026-07-25.md`
- `docs/decisions/ADR-0001-headless-gameplay-kernel-and-engine-bakeoff.md`
- `docs/decisions/ADR-0002-first-playable-tractor-day-night-loop.md`
- `docs/WORKLOG.md`
- `docs/context/agent-start/SESSION_CONTEXT.md`
- `docs/context/agent-start/AGENT_KICKOFF_PROMPT.txt`
- `docs/context/agent-start/STEP1_ENV.sh`
- `.agent/SESSION_CONTEXT.md`
- `.agent/AGENT_KICKOFF_PROMPT.txt`
- `.agent/STEP1_ENV.sh`
- `motto_v4.md` (refreshed from the canonical source by `agent-start`)

### Evidence status

- Tier 1: source inspection and current official-source checks.
- Tier 2: workbook structure, uniqueness, formula, score, sensitivity, and local-link checks.
- Tier 3–5: none.

### Uncommitted and preserved work

- No git command, commit, stage, or push was run.
- All session changes are local-only.
- Both user-provided research sources and the prior project artifacts were preserved.
- No source workbook copy was created, avoiding a second editable workbook truth.

## Anything else?

The 45 modes, 96 tools, and 28 incoming decisions are useful search spaces—not permission to expand the runtime. Their best next role is to supply fixtures and falsifiable experiments after the owning ADRs are accepted.

## 2026-07-25 — Kenney paid-library audit

### Scope and preservation

- Inspected the private external `Kenney Game Assets All-in-1 3.4.0` library read-only.
- Observed an approximately 1.2 GB, 84,992-file source library spanning 2D, 3D, UI, icons, audio, archive packs, and supporting material.
- Also located the private external `kenney_new-platformer-pack-1.1`; classified it as a later 2D/side-view candidate.
- No source asset, preview, license, archive, or supplied pack was modified, copied, converted, moved, or deleted.
- No runtime asset directory or second editable bundle truth was created.

### Rights and visual review

- Read the All-in-1 `Readme.html` and sampled licenses from Car, Toy Car, Nature, Space, Racing, Graveyard, Impact Sounds, Input Prompts, and New Platformer packs.
- Recorded CC0 personal/commercial/modification permission and optional attribution from the inspected files.
- Preserved the bundle-level instruction not to redistribute the All-in-1 package directly.
- Visually inspected the Car, Nature, Toy Car, and Space preview sheets.
- Assessed the library as a strong readable low-poly substrate, with a material identity risk if raw packs become an unmodified “Kenney collage.”

### Technical inspection

- Identified a current Car Kit tractor, shovel variant, separate tractor wheels, crate, Racing Kit ramp, Nature Kit props, and animated Graveyard zombie.
- Parsed selected GLB metadata read-only.
- Confirmed the base tractor has four named wheel nodes plus a body node; the shovel tractor has named body, shovel, and wheel nodes.
- Confirmed the zombie has articulated named parts and 32 clips, including idle, walk, sprint, die, attacks, interactions, and holding states.
- Recorded byte sizes and SHA-256 values for the eleven proposed common probe fixtures.
- Kept archive Mini Car Kit assets out of the primary manifest because the current Car Kit supersedes them for this experiment.

### Key commands and outcomes

- `find` and `rg` over the local Kenney directories
  - Located the main and separate packs; mapped relevant vehicle, environment, UI, audio, road, defense, farm, city, toy, and space content without writing sources.
- extension/count and size inventory commands
  - Observed 84,992 main-bundle files and 4,724 GLBs within the approximately 1.2 GB bundle.
- `shasum -a 256 <selected assets and license evidence>`
  - Recorded repeatable source identities in the Kenney audit.
- `node - <selected GLBs>`
  - Parsed GLB JSON chunks and reported nodes, meshes, materials, animations, and position-accessor bounds without converting the assets.
- visual inspection of four local `Preview.png` files
  - Confirmed cross-pack readability and the need for an authored Patchwork Atlas identity pass.
- `node - <audit-manifest verification>`
  - Parsed all 11 candidate rows from the audit and confirmed every recorded byte size and SHA-256 matched the current source file.
- `node - <local Markdown link validation>`
  - Inspected 19 project Markdown files and reported `broken_local_links=0`.
- `find . -type f` restricted to common 3D asset and Kenney-preview extensions
  - Returned no project files, confirming the source library was not accidentally copied into the repository.
- One attempted macOS-style `stat -f` command encountered the environment’s different `stat` behavior; it made no changes. Byte sizes were then obtained with `wc -c`.

### Pass 1 — Immediate correctness and completeness

- Reconciled the user’s asset note with the first-slice needs and engine comparison scene.
- Checked licensing at bundle and sampled pack levels instead of inferring rights from the paid acquisition alone.
- Inspected visual previews and exact candidate files rather than listing pack names only.
- Changed: added a dedicated audit, source-library provenance entry, and exact hashed first-probe manifest.
- Result: the project now knows what can be tested first and what has not been imported or approved.

### Pass 2 — Architecture and long-term viability

- Kept `adhoc_resources` as an external source library, not a runtime path or second game-content truth.
- Defined semantic asset keys, source/derived hash separation, identical cross-engine fixture rules, per-pack license retention, collider proxies, and measurable importer friction.
- Distinguished prototype substrate, first-slice support, breadth laboratories, and archive-only content.
- Changed: ADR-0001 now requires the same Kenney binaries across engine candidates; DESIGN requires an authored Patchwork Atlas transformation before final-style claims.
- Result: the library accelerates experiments without binding durable state to filenames, scene nodes, one renderer, or the full paid bundle.

### Pass 3 — Rule compliance and supervision readiness

- Rechecked evidence tiers, asset provenance, public redistribution boundaries, AI-output boundary, documentation continuity, and no-silent-production-asset requirements.
- Confirmed no git, dependency, account, deployment, runtime, or source-library mutation occurred.
- Confirmed all 11 manifest sizes/hashes match, all 19 local Markdown links resolve, and no Kenney 3D/preview binary exists inside the project.
- Confirmed Tier 3–5 evidence remains absent: the assets have not been imported, rendered, profiled, animated in the project, or player-tested.
- Changed: progress and exploration records now surface both the opportunity and the visual-coherence/licensing gates.
- Result: the audit is reviewable and implementation-ready without overclaiming game or production evidence.

### Files created

- `docs/research/KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25.md`

### Files updated

- `README.md`
- `DESIGN.md`
- `progress.md`
- `docs/exploration/EXPLORATION_MAP.md`
- `docs/research/ASSET_PROVENANCE_REGISTER.md`
- `docs/decisions/ADR-0001-headless-gameplay-kernel-and-engine-bakeoff.md`
- `docs/WORKLOG.md`

### Evidence status

- Tier 1: local library, previews, licenses, pack organization, and asset metadata inspected.
- Tier 2: selected files, byte sizes, hashes, nodes, materials, and animation clip names checked.
- Tier 3–5: none.

### Anything else?

Kenney makes experimentation cheaper, not design automatic. The valuable next proof is whether the same tractor fixture imports and drives consistently across engines while remaining legible in chase and top-down cameras.

## 2026-07-25 — Direct visual preference and controlled variants

### Input and interpretation

- Inspected the project-owner-provided 1774 × 887 tractor triptych at original resolution.
- Preserved it at `docs/exploration/assets/references/tractor_patchwork_atlas_user_preference_2026-07-25.png`.
- Recorded SHA-256 `adf64c7028e2a55670cbed1255b6745e682f00b0bb5eef5fc2938bfa518674d4`.
- Interpreted the preference as a combination of persistent machine identity, selective detail, tactile diorama composition, close near-isometric character presence, warm/cool world-state contrast, and visible distant promise.
- Did not treat the preference as automatic production approval or an exact camera specification.

### Image-generation skill action

- Used the built-in image-generation path with the preserved image explicitly labeled as a visual-language/camera/material/mood reference rather than an edit target.
- Generated three separate original concept boards:
  - persistent tractor character sheet;
  - gameplay camera-language board;
  - invariant-scene art-direction triptych.
- Copied the selected outputs into `docs/exploration/assets/design_explorations/` while preserving the generated originals.
- Recorded exact prompts in `docs/exploration/VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md`.

### Visual review

- Character sheet: strong stable silhouette, tire ratio, round-light expression, repair grammar, turquoise patch, and functional hardpoints; true orthographic views and exact patch/socket maps remain needed.
- Camera board: close chase, work, tactical, workshop, bridge, and wide-vista roles are legible; gameplay depth-of-field, occlusion, mobile safe areas, and sustained wide-view scale remain unproven.
- Art-direction board: Patchwork Atlas reads as the strongest baseline; Signal Noir works as a danger-state layer; Salvage Opera works as an event/region-scale crescendo.
- Cross-board gap: generic spider-like threats persist and require a separate enemy-ecology exploration.

### Key commands and outcomes

- original-resolution local image inspection
  - Confirmed composition, subject scale, surface language, camera patterns, and visible weaknesses.
- copy and `shasum -a 256`
  - Preserved one input reference and three generated outputs; recorded stable project hashes.
- `file <four project PNGs>`
  - Confirmed RGB PNG type and expected dimensions.
- built-in image generation, three reference-guided calls
  - Produced one distinct board per question, following the image-generation skill’s multi-asset rule.
- `node - <image provenance and local-link verification>`
  - Recomputed all four project image hashes/dimensions, matched every provenance record, inspected 20 Markdown files, and reported `broken_local_links=0`.

### Pass 1 — Immediate correctness and completeness

- Separated the preference into character, material, camera, world-composition, and light/state signals.
- Generated focused boards rather than unstructured near-duplicates.
- Inspected every output at original resolution and documented both strengths and failures.
- Result: “this kind” is now a concrete, reviewable visual hypothesis.

### Pass 2 — Architecture and long-term viability

- Connected the preferred visual language to the existing vehicle identity, camera grammar, first slice, browser budget, and Kenney transformation path.
- Kept Patchwork Atlas, Signal Noir, and Salvage Opera in a hierarchy rather than averaging them into one noisy style.
- Kept concept images outside durable gameplay identity and camera constants.
- Result: the preference guides art investment without prematurely locking runtime or asset architecture.

### Pass 3 — Rule compliance and supervision readiness

- Recorded input and output provenance, hashes, prompts, human review, production status, known gaps, and replacement/validation paths.
- Confirmed the generated boards are proposals, not gameplay or player evidence.
- Confirmed no external account, dependency, deployment, runtime, or git mutation occurred.
- Result: the exploration is reproducible and ready for the next visual or runtime decision.

### Files created

- `docs/exploration/VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md`
- `docs/exploration/assets/references/tractor_patchwork_atlas_user_preference_2026-07-25.png`
- `docs/exploration/assets/design_explorations/tractor_character_model_sheet_2026-07-25.png`
- `docs/exploration/assets/design_explorations/tractor_gameplay_camera_board_2026-07-25.png`
- `docs/exploration/assets/design_explorations/tractor_art_direction_triptych_2026-07-25.png`

### Files updated

- `README.md`
- `DESIGN.md`
- `progress.md`
- `docs/exploration/EXPLORATION_MAP.md`
- `docs/research/ASSET_PROVENANCE_REGISTER.md`
- `docs/WORKLOG.md`

### Evidence status

- Tier 1: preference statement, preserved reference, three generated boards, and visual inspection.
- Tier 2: all four project image hashes/dimensions matched their provenance records; 20 Markdown files reported zero broken local links.
- Tier 3–5: none.

### Anything else?

The most valuable next image is not another beauty shot. It is a strict orthographic tractor sheet and a grayscale/mobile silhouette test that can constrain a real model and camera prototype.

## 2026-07-25 — Dilapidated-to-robust tractor progression discussion

### Proposal

- The project owner proposed a dilapidated/basic starting tractor that becomes visually robust through upgrades and gains switchable additions.
- Reconciled the proposal with the existing damaged-tractor trigger, persistent `VehicleInstance`, module tradeoffs, preferred visual direction, and one-vehicle first-slice boundary.
- Recorded the product phrase `same bones, changing verbs`.

### Design outcome

- Separated restoration, specialization/tuning, swappable physical modules, and deployed module states.
- Proposed the journey `found → stabilized → working → specialized → hybridized → storied`.
- Preserved cab/roof silhouette, round-light face, wheel stance, beacon/mount history, signature patch, chassis proportions, scars and sound motifs as identity anchors.
- Defined workshop-bound large swaps and later earned field-service mechanics.
- Mapped modules to multiple verbs and explicit mass, power, handling, cargo, clearance, setup or vulnerability costs.
- Bounded the first playable to a drivable incomplete tractor, early stabilization, restored plow, one support-module choice, and visible dawn consequences.

### Architecture outcome

- Kept `VehicleBlueprint` responsible for hardpoints, compatibility and envelopes.
- Kept `VehicleInstance` responsible for owned components, condition, repairs, loadouts, scars and history.
- Clarified that a preset references owned parts and cannot clone them or bypass constraints.
- Clarified that deployed module state is not an installation change.
- Added Proposed addenda to ADR-0002 and ADR-0003; no decision was promoted to Accepted.

### Pass 1 — Immediate correctness and completeness

- Checked the idea against current slice, vehicle, visual, progression, economy, workshop and data-model artifacts.
- Preserved the emotional appeal while removing an unbounded all-upgrades-at-once interpretation.
- Result: the idea now has a concrete first-loop expression and explicit exclusions.

### Pass 2 — Architecture and long-term viability

- Prevented gear-score progression, magical hot-swapping, duplicate vehicle identity and renderer-owned modules.
- Made later mobile service, quick couplers, tool trailers, support drones and co-op service vehicles legitimate earned extensions.
- Result: the same model can scale from a tractor to bicycles, toy cars, watercraft, rockets and hybrids without one inheritance tree.

### Pass 3 — Rule compliance and supervision readiness

- Recorded status, tradeoffs, failure modes, validation questions, state ownership and first-playable boundary.
- Confirmed no code, schema, asset, dependency, runtime, deployment, account or git mutation occurred.
- Rechecked 21 Markdown files and reported `broken_local_links=0`; confirmed both ADR addenda remain Proposed and no unsupported completion/production claim was introduced.
- Tier 1 only: design reasoning and current-artifact reconciliation; no playable behavior exists.
- Result: ready for paper flow, visual evolution board and runtime fixture review.

### Files created

- `docs/exploration/TRACTOR_RESTORATION_AND_MODULAR_GROWTH_2026-07-25.md`

### Files updated

- `README.md`
- `DESIGN.md`
- `progress.md`
- `docs/exploration/EXPLORATION_MAP.md`
- `docs/decisions/ADR-0002-first-playable-tractor-day-night-loop.md`
- `docs/decisions/ADR-0003-versioned-gameplay-content-composition.md`
- `docs/WORKLOG.md`

### Anything else?

The robust end-state is most meaningful when it reveals decisions. A tractor with every attachment installed would communicate collection; a tractor with a few carefully chosen systems and beloved repairs communicates authorship.

## 2026-07-25 — Rigs Unbound identity and public-repository preparation

### Authorization and baseline

- The project owner selected **Rigs Unbound** as the game name and `rigs-unbound` as the GitHub repository name.
- The project owner explicitly authorized repository initialization, `git add -A`, a hook-compliant commit, public GitHub repository creation, and push.
- The workspace was not a Git repository at baseline.
- The intended GitHub account was authenticated and the target repository slug was available at the time of the read-only check.

### Identity decision

- Added Accepted ADR-0005 as the canonical naming decision.
- Updated README, progress, and the living exploration map to use **Rigs Unbound**.
- Kept the local `openworld_1` folder name as a location rather than a competing public identity.
- Kept engine, art, economy, multiplayer, and production decisions open.
- Recorded that commercial name/trademark/domain clearance remains a separate pre-launch gate.

### Public boundary and artifact classification

- Added a root `.gitignore` for operating-system metadata, editor state, secrets, logs, caches, dependencies, build output, Python/game-engine generated files, and machine-generated agent context.
- Classified `mcp-shell.log` as machine-local runtime output and excluded it.
- Classified `.agent/` and `docs/context/agent-start/` as generated local instruction/context mirrors and excluded them; canonical durable design and decision documents remain tracked.
- Kept the five project concept/reference images because they are intentional design references with hashes, provenance, review status, and replacement paths.
- Kept `motto_v4.md` as the project-local doctrine source.
- Kept the private paid Kenney source library outside the repository. Only its audit, hashes, license evidence, and candidate manifest are publishable in this commit.
- Sanitized public documentation so private machine paths are represented by descriptive source labels or placeholders.
- Did not add a software/content license: public visibility does not itself grant reuse rights, and license selection remains an explicit project-owner decision.

### Scope

- This publication unit contains the existing research, exploration, visual evidence, decisions, progress, and provenance records plus the new identity/publication boundary.
- There is still no game runtime, dependency manifest, engine selection, deployment, account system, multiplayer service, or production claim.

### Pre-commit checks

- Initialized an empty Git repository on `main`.
- Regenerated the local context pack and installed the managed pre-commit, prepare-commit-message, and commit-message policy hooks.
- Confirmed the hooks include both the motto attestation gate and the no-AI-co-author-trailer guard.
- Inspected 21 Markdown files and found `broken_local_links=0`.
- Searched publishable files for common private-key, service-token, API-key, and credential-assignment patterns; no match was found.
- Searched publishable documents for absolute user, attachment, temporary-folder, and private asset-library paths; no absolute private machine path remained.
- Confirmed no intended tracked file exceeded 20 MB.
- Recomputed the five intentional concept/reference image hashes; each matched its provenance record.
- Confirmed `.agent/`, `docs/context/agent-start/`, and `mcp-shell.log` are ignored while the durable project documents and images remain candidates for the initial commit.
- Completed the coverage-complete 51-section motto review and preserved its generated, human-readable report at `docs/reviews/motto_review.md`.
- Corrected the shared hook renderer so that its report identifies the audited doctrine as motto v4 rather than the obsolete v3 label.

### Anything else?

The first public commit should preserve why the project exists and how it will make decisions, while refusing to imply that research artifacts are already a playable game.

## 2026-07-25 — Local checkout renamed to `rigs-unbound`

### Requested change

- The project owner requested that the local `openworld_1` directory use the Rigs Unbound identity as well.
- Selected the filesystem-safe canonical slug `rigs-unbound`, matching the GitHub repository.

### Migration

- Verified the current checkout had no uncommitted tracked changes.
- Verified the target `Game_dev/rigs-unbound` directory did not already exist.
- Moved the complete checkout from `Game_dev/openworld_1` to `Game_dev/rigs-unbound`.
- Confirmed the old path no longer exists and the new directory retains the same Git repository, `main` branch, `origin`, and commit history.
- Regenerated the ignored `.agent/` and `docs/context/agent-start/` context surfaces at the new location.
- Confirmed their project paths and collection identifier now use `Game_dev/rigs-unbound`.
- Preserved the previous publication entry unchanged as historical evidence of the folder name at that time.

### Boundaries

- No source, design, asset, dependency, gameplay, remote repository, or deployment path was moved outside the checkout.
- No old context/index collection was deleted; cleanup of shared indexed state requires a separate preservation audit.

### Anything else?

The local folder, GitHub slug, and machine-facing project identifier now express one identity, while the human-facing title remains **Rigs Unbound**.

## 2026-07-25 — Rig Lab 01: contrasting rigs and adjacent towing capability

### Baseline and decision

- Re-read the global/project instruction stack, project motto v4, generated context pack, 3D-game skill, Browser Daemon skill, current code, decisions, progress, design, and prior vehicle-game memory.
- Re-ran `agent-start --project Game_dev/rigs-unbound --skip-index`.
- Baseline `npm run typecheck` passed.
- Baseline `npm test` passed: 6 live-runtime and 7 preserved deterministic-kernel tests.
- Recorded Accepted ADR-0006 before refactoring the load-bearing state/save contract.

### Implementation

- Replaced the universal `vehicle`/tractor constants with two persistent rig states and versioned profiles.
- Added Torque and Spark through one semantic input, fixed-step controller, camera, renderer, save, and public-state path.
- Added `plough`, `tow`, and `jump` capability queries plus attachment state.
- Added a complete cargo-relay workflow and a profile-driven buggy ramp launch.
- Advanced local save schema v1 to v2 with deterministic legacy migration.
- Added local startup/frame/render/heap/save/load instrumentation.
- Added reusable `npm run test:browser` visible-Chrome acceptance and project-local screenshot evidence.
- Preserved `experiments/deterministic-kernel-probe/` and the private-asset boundary untouched.

### Review findings and corrections

#### Pass 1 — immediate correctness and completeness

- Found the tractor-only state and renderer assumptions.
- Refactored the canonical path instead of adding `BuggyController`.
- Browser automation initially braked after reaching cargo and rolled outside the interaction radius; corrected the acceptance driver to stop on the semantic reach threshold.
- Result: attach, tow, deliver, jump, save, reload, and reset are complete local workflows.

#### Pass 2 — architecture and long-term viability

- Confirmed activities query capabilities rather than rig names.
- Kept `ground` explicit as one mobility adapter rather than a universal physics claim.
- Replaced per-frame hitch-geometry recreation with updates to one stable position buffer.
- Preserved renderer-independent state and provisional Three.js status.
- Result: no second controller, save, activity, renderer, or input source of truth.

#### Pass 3 — rule compliance and supervision readiness

- Initial narrow layout overlapped instruments and touch controls; final layout has a measured 10.41 px gap.
- Portrait camera was pulled back after screenshot inspection.
- Separated desktop, save, restored, and narrow performance snapshots.
- Added the required plan, decision update, design/exploration continuity, 23.5 kB acceptance review, and “Anything else?” sections.
- Result: local evidence is reviewable; public launch and broad universe portability remain explicitly unproved.

### Final verification

- `npm run typecheck`: passed.
- `npm test`: 14 live-runtime + 7 preserved experiment tests passed.
- `npm run format:check`: passed.
- `npm run build`: passed.
  - HTML 5.22 kB raw / 1.65 kB gzip.
  - CSS 8.64 kB raw / 2.59 kB gzip.
  - JavaScript 568.88 kB raw / 146.38 kB gzip.
  - Vite's 500 kB advisory remains visible.
- `npm run test:browser`: passed in visible Chrome.
  - Cargo attach/delivery and reload persistence passed.
  - Torque moved 43.87 m; Spark moved 103.23 m.
  - Spark reached 1.70 m airborne height.
  - `390 × 844` controls/instruments did not overlap.
  - Captured console/page errors: zero.
- Final local desktop sample: 175.0 ms from navigation start to first controllable, 8.89 ms average / 10.0 ms p95 frame time, 41 calls, 1,658 triangles, 23.7 MB reported JS heap; periodic-save snapshot 0.10 ms and 1,260 bytes.

### Artifacts and boundaries

- Created `docs/reviews/assets/rig-lab-01-desktop.png`.
- Created `docs/reviews/assets/rig-lab-01-narrow.png`.
- No private source asset was copied.
- No public deployment was performed.
- No git staging, commit, push, branch, history, or cleanup action was performed.

### Anything else?

The current technical contrast is real, but player-perceived contrast remains unverified. The next quality gate is whether external players independently describe Torque and Spark with different verbs and emotions rather than only noticing different speed.

## 2026-07-25 — Direct camera policies and Top-down live view

### Baseline and scope

- Refreshed the project context pack and re-read the 3D-game and Browser Daemon guidance.
- Rechecked the live Field 02 runtime after parallel terrain/progression work had superseded the earlier Rig Lab-only state.
- Baseline `npm run typecheck` passed.
- Baseline `npm test` passed with 72 root tests and seven preserved kernel-probe tests.
- Scoped the change to the canonical camera contract, state transition, renderer policy, interface selection, save recovery, browser observability, acceptance coverage, and durable decision record.

### Implementation

- Replaced the private three-item camera order with typed `CAMERA_MODES` and reusable labels.
- Added Hood, Side, and exact heading-oriented Top-down policies while preserving Chase, Tactical, and Survey.
- Added direct `selectCamera` state control and `window.selectCamera(mode)` browser control.
- Added an accessible View selector; `C` and the touch Cam action still cycle the same ordered policies.
- Preserved rig-specific values only for machine scale and chase/focus offsets; no camera policy branches on a rig id.
- Preserved current-schema camera choice through recovery.
- Added ADR-0008 and synchronized README and design-camera language.

### Pass 1 — immediate correctness and completeness

- The first test run correctly exposed one outdated expectation: after Chase, the new ordered next policy is Hood rather than Tactical. Updated the assertion to match the single canonical order.
- The browser test initially captured Top-down during its transition and produced an unrepresentative close frame. Added a bounded settling wait before evidence capture.
- A concurrent dev-server reload destroyed one Playwright execution context on the first acceptance attempt. Re-ran from stable current files; the complete workflow passed.
- Result: all six direct choices, selector/state agreement, cycle order, wraparound, save recovery, and live Top-down selection are exercised.

### Pass 2 — architecture and long-term viability

- Confirmed camera meanings live in one product-level vocabulary rather than per-rig or per-activity controllers.
- Preserved the existing Survey policy introduced by the terrain work instead of overwriting newer workspace state.
- Avoided number-key conflicts with workshop-module fitting.
- Kept the known future boundary explicit: unusual machine geometry may justify a bounded camera-mount adapter, while prop-aware collision remains separate from policy selection.
- Result: a bicycle, aircraft, or spacecraft can test the same policies without inheriting tractor or wheel assumptions.

### Pass 3 — rule compliance and supervision readiness

- `npm test`: 74 root tests plus seven kernel-probe tests passed.
- `npm run build`: typecheck and production build passed; JavaScript remains above Vite's 500 kB advisory at 617.70 kB raw / 162.84 kB gzip.
- `npm run format:check`: passed after formatting the previously unmatched `src/game/performance.ts`.
- `npm run test:browser`: passed in visible Chrome across cargo, jump, schema-v3 save/reload, all six cameras, `390 × 844` touch layout, and zero console/page errors.
- Browser Daemon was restarted after an IPC collision caused by parallel client commands, navigated to the live server, and left at `http://127.0.0.1:4174/?live=camera-policies` in Top-down.
- Result: Tier 4 local browser evidence exists; representative-device performance, external player comfort, prop collision, and non-ground-rig portability remain open.

### Acceptance evidence and boundaries

- Created `docs/reviews/assets/field-02-top-down.png`.
- Updated the existing desktop and narrow acceptance screenshots through the full browser run.
- Live acceptance sample: 458.3 ms first controllable, 21.89 ms average frame, 20.7 ms p95, 68 draw calls, 100,822 triangles, and 30.6 MB reported heap. These are local development-run observations, not device or production targets.
- No dependency, private source asset, public deployment, git staging, commit, push, branch, history, or cleanup action was performed.

### Anything else?

The camera vocabulary is now usable and visible, but comfort is not a one-frame property. A sustained-play review should measure motion comfort and prop obstruction in each policy before these values are treated as tuned production defaults.

## Traversal substrate correctness pass — 2026-07-25

This entry covers the terrain-substrate work in
[ADR-0007](decisions/ADR-0007-terrain-as-simulation-substrate.md) and the eight
defects it surfaced. Full record:
[traversal substrate acceptance review](reviews/TRAVERSAL_SUBSTRATE_ACCEPTANCE_2026-07-25.md).

### What changed for a player

The ground became a simulated system rather than a surface. Grade opposes the
engine with real gravity, surface material limits both drive force and steering
authority, suspension reads four terrain contacts, ploughing cuts the height field
itself, salvage sits off the graded tracks, and the map only shows ground the rig
could actually see. Observed in the browser: driving from pasture into the Sunken
Flats dropped grip 73% → 53% and speed 33 → 10 km/h.

### Defects found, and what each one teaches

- **Both rigs faced backwards.** Grille, hood, and headlights sat at local −Z with
  the plough, while travel is toward +Z. Present in the _accepted_ Rig Lab 01
  screenshot. No test asserted which way a rig faces, so nothing caught it.
- **`low-range gearing` was a false promise.** It claimed to climb grades that
  stall the engine and changed no climb at all, because traction bound before power
  did. Fixed with a `lowSpeedTorque` lugging term; the tractor now pulls from rest
  and the buggy needs a run-up.
- **The buggy out-gripped the tractor on tilled soil**, contradicting the field
  being the tractor's home ground.
- **Route endpoints detached from their pads** — an 11 m cliff at the Quarry
  corridor edge, caused by the grade limiter overwriting its own pinned endpoints.
- **A dark wall around the horizon in daylight**, because a `scene.background`
  colour clear skips tone mapping and the sRGB encode while fogged geometry does
  not. The first hypothesis (mismatched fog colour) was wrong and is recorded as
  wrong.
- **`placeRig` reported the previous location's surface**, which briefly produced a
  false reading inside the acceptance check itself.
- Plus a renderer-owned world layout the kernel could not collide with, and four
  wasted `height()` calls per terrain vertex.

Two of these were false _promises_ rather than crashes. A module that does nothing
and a vehicle that faces backwards both pass every test that only checks state
transitions. The tests added here assert claims — this module changes this outcome,
this surface favours this tyre — not only mechanics.

### Verification

- `npm run typecheck`: clean.
- `npm test`: 75 root tests (was 14) plus 7 preserved kernel-probe tests.
- `npm run build`: passes; 617.70 kB raw / 162.84 kB gzip, still over Vite's
  500 kB advisory.
- Terrain mesh build 445 ms → 174 ms; field map build removed from boot entirely
  (419 ms → 0 ms, deferred to first open); furrow draw calls 640 → 1; first
  controllable frame 3,946 ms → 458 ms.

### Measurement honesty

Frame timing inside the automation browser is unusable: a single 10,298 ms
`requestAnimationFrame` gap was observed and it reported 12 fps for a build whose
per-frame CPU cost measures 0.46 ms for step + render + HUD combined. The ~46 fps
figure in the acceptance review comes from a visible Chrome window and is an M3 Max
snapshot, not a target and not a device claim.

### Still open

External player comprehension (the central "do these feel different" claim),
audio heard by a human, device and cold-cache performance, the 390 × 844 layout
after this pass, and rollover. The world is also now large enough to be empty:
500 m with seven sites risks the "procedural expanse without authored reasons"
that DESIGN.md forbids, and more rigs or biomes will not fix that.

### Parallel work preserved

A parallel agent extended this pass mid-session with a six-mode camera vocabulary
and a Marsh Skimmer rig. Their work was left intact; only a stale hardcoded camera
assertion inside this pass's own test was updated to be table-driven.

## 2026-07-25 — Live visual-forward verification and browser-port correction

- Confirmed the reported backwards-driving defect was real in the earlier model: simulated travel used local `+Z`, while visible nose parts had been authored at `−Z`.
- Rechecked the corrected current geometry: tractor grille/headlights/small steering wheels are at `+Z`, the plough and large drive wheels are at `−Z`; the buggy nose is at `+Z` and tow hook at `−Z`.
- Added `GameRenderer.orientationEvidence()` using actual visible front/rear model parts. The browser acceptance now fails if either rendered nose projects opposite the rig's simulated heading.
- Added `window.getRigOrientationEvidence(id)` so the same contract is inspectable during live debugging rather than inferred from a screenshot.
- Found the in-app browser pointed at port `4173` while the verified server was on `4174` and `4173` had no listener. Moved the single development server to `4173`, updated the current README and acceptance defaults, and retained historical port references as historical evidence.
- Re-ran the full camera/cargo/jump/save/mobile browser workflow on `4173` and refreshed the visual artifacts.
- Captured `docs/reviews/assets/field-02-front-forward.png` after 900 ms of forward tractor input in Chase view.
- Final checks passed with 78 root tests, seven preserved kernel-probe tests, clean typecheck/formatting, production build, and zero current-page console errors.

### Three-pass review

- Pass 1 — correctness: verified both visible noses produce positive distance along simulated heading and observed forward movement with the corrected model.
- Pass 2 — architecture: asserted the visual/physics coordinate contract through real scene objects rather than a duplicated orientation flag.
- Pass 3 — supervision: checked tests, typecheck, production build, formatting, live browser console, current URL, and screenshot evidence; no git or deployment operation was performed.

### Anything else?

A future imported GLB must nominate real nose and rear reference nodes when it enters the renderer. That keeps the acceptance contract useful after primitive geometry is replaced instead of silently returning to a hand-authored assumption.

## 2026-07-25 — Marsh Skimmer 01 bounded mobility adapter

### Baseline and decision

- Re-entered the canonical instruction/context stack and ran `agent-start`
  against the renamed `rigs-unbound` checkout.
- Preserved the parallel camera, minimap, rendering/accessibility, research, and
  screenshot changes already present in the shared tree.
- Chose the existing Sunken Flats as the smallest honest test of a second
  locomotion family. A third wheeled profile would add content without exposing
  an architectural assumption.
- Recorded the decision in
  [ADR-0009](decisions/ADR-0009-bounded-mobility-adapters.md) and the derived
  scope in
  [Marsh Skimmer 01 plan](plans/MARSH_SKIMMER_01_2026-07-25.md).

### Implementation

- Advanced save schema v3 → v4 while preserving v1, v2, and v3 recovery.
- Moved ground-only fields into `GroundMobilityState`; added
  `HoverMobilityState` for lift velocity, clearance, cushion pressure, and skirt
  contact.
- Added a typed registry that owns stepping, settling, and stability for the
  implemented `ground` and `hover` families.
- Added Drift at the authored Sunken Flats berth with a deterministic
  low-hover controller, slope/strain trade-off, and no drowning.
- Added a wheel-free primitive renderer, lift-fan voice, water spray, Cushion
  HUD, public hover telemetry, shared switching, and v4 persistence.
- Extended browser acceptance through three orientation fixtures, deep-water
  motion, no-wheel state, condition preservation, Cushion UI, save, and reload.

### Visual review corrections

- The first passing screenshot was unusable because the camera smoothed from a
  distant Spark position to Drift and travelled through terrain. Added a
  policy-level hard cut when the active rig changes or the desired camera
  position discontinuity exceeds 70 m; ordinary driving remains smoothed.
- The replacement shot drove directly toward the Sunken Flats mast. The
  acceptance route now uses Drift's offset berth, and discovered site masts
  recede so arrival composition remains readable.
- The narrow layout assertions passed while the screenshot still cropped Drift
  on the right. A 35% side-offset trial was insufficient; portrait chase now
  uses 10% of the cinematic side offset with a stronger distance/height
  pullback for the narrow horizontal field of view. Its look target is biased
  downward so the rig composes upward into the safe space above the field kit
  rather than behind the instruments.
- The long autonomous towing leg flaked twice by orbiting/stalling outside the
  gate. Browser acceptance now uses the existing test-only placement hook to
  align the attached cargo 12 m from delivery, then drives the real final towing
  leg. This keeps attach → tow → deliver coverage while removing navigation-bot
  quality from the release gate.
- The rear fans can still resemble circular wheels in one static rear view.
  This is recorded as an authored-model/silhouette hardening item rather than
  hidden behind the passing runtime contract.

### Multi-pass result

- Pass 1: existing ground behavior stayed green; new deterministic water,
  hover-repeatability, steep-ground, mismatch-recovery, and v3 migration tests
  passed.
- Pass 2: replaced the initial two-way dispatcher with the registry promised by
  ADR-0009; no speculative adapter types entered the contract.
- Pass 3: docs, tests, runtime hooks, browser evidence, confidence boundary, and
  remaining hardening paths are recorded in
  [Marsh Skimmer 01 acceptance](reviews/MARSH_SKIMMER_01_ACCEPTANCE_2026-07-25.md).

### Evidence and boundaries

- `npm test`: 83 root tests plus seven preserved kernel-probe tests passed.
- `npm run typecheck`: passed across the game and probe.
- `npm run format:check`: passed.
- `npm run build`: passed; 633.48 kB raw / 167.17 kB gzip JavaScript, with the
  existing 500 kB Vite advisory.
- `npm run test:browser` on port 4173: passed cargo, ramp, three rigs, six
  cameras, steering/body/camera perception, reduced-motion clamping, hover
  water, schema-v4 reload, `390 × 844`, and zero console/page errors.
- No dependency, private Kenney source asset, deployment, branch, stage, commit,
  push, history, cleanup, or deletion operation was performed.

### Anything else?

The architecture proof is strong local evidence; the fun claim is still open.
The next valuable step is external player-language testing and a shared
rescue/repair activity before another roster addition, unless a new locomotion
family exposes a specific body-state assumption the current union cannot hold.

## Optimization gaps second-pass (2026-07-25)

- Completed a structured second-pass analysis of the untrusted optimization-context conversation against live files, with a skill-by-skill audit path (`3d-games`, `threejs-shaders`, `threejs-materials`) to preserve evidence-first method discipline.
- Confirmed no code-path changes were introduced in this pass; all outputs are docs-only.
- Added `docs/research/3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md` with:
  - implemented-vs-missing mapping for culling/LOD/streaming/replay/authority/collision layers;
  - explicit execution ordering aligned to render/perf/accessibility first, then collision/streaming/replay, then authority;
  - skill-to-repo evidence linkage.
- Remaining open gates from this pass:
  - frustum+distance+LOD visibility policy and fixture;
  - collision-category matrix for obstacle/hazard/trigger/projectile surfaces;
  - replay transport and verifier;
  - server-authority plan after replay determinism and public workflow safety contracts are in place.

### 2026-07-25 — Optimization/additional systems continuation (same day)

- Per the follow-on "3D Game Optimization Gaps" context, the same untrusted
  conversation thread was re-checked for broader architecture growth systems beyond
  the initial rendering/physics/perf list.
- Added the systems gap matrix into
  [3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md](research/3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md),
  covering:
  - ECS migration readiness
  - streaming world manifest
  - asset pipeline maturity
  - simulation layers
  - behavior/event architecture
  - modding architecture
  - deterministic replay artifact
  - resource governance
- Synced the same queue into
  [EXPLORATION_MAP.md](../docs/exploration/EXPLORATION_MAP.md) under
  **3D optimization continuity checkpoint** so long-term queueing remains visible.
- Confirmed and documented that the highest-confidence claims are:
  - fixed-step deterministic kernel and save migration are present,
  - renderer state separation is intact,
  - observability exists for first-pass hardening,
  - multiplayer/streaming/replay authority claims are still non-functional.
- No runtime code was changed for this pass; this was an analysis/curation
  update only (evidence tier: static inspection + path-level references).

## 2026-07-25 — Platform-continuation audit expansion

- Per the same objective and the untrusted optimization-context conversation, I ran a second continuation synthesis pass that explicitly maps the “more” section (deterministic kernel as architecture pillar, world schema, renderer/subsystem separation, modding economics, machine-centric capabilities, authority pipeline) into a single platform backlog artifact.
- Added [3D_GAME_PLATFORM_LONG_TERM_AUDIT_2026-07-25.md] with:
  - a matrix that crosschecks claim intent to current repo evidence,
  - explicit status per area (`Strong`, `Partial`, `Missing`),
  - a machine-centric platform sequence,
  - and closed-loop evidence-gate checklist.
- Synced the continuation registry into [EXPLORATION_MAP.md] under the
  3D optimization continuity and machine-capability sections.
- Used the same skill-by-skill audit order:
  - 3d-games → 3d-web-experience → threejs-materials → threejs-shaders.
- This pass remains docs-only; execution remains pending on the highest-priority
  gates (render hardening, replay governance, collision matrix, chunk manifest,
  authority lane).

## 2026-07-25 — Rig Perception Chain 01

- Accepted the project-owner rule that physics, controls, animation, camera,
  lighting/VFX, audio/haptics, UI, and player perception form one gameplay
  chain.
- Added a derived `RigFeedbackFrame` shared by renderer and procedural audio;
  simulation remains authoritative and save-compatible.
- Added visible front-wheel steering, bounded propulsion/lateral chassis
  expression, and speed/steering chase-camera anticipation.
- Added operating-system reduced-motion handling for optional body/camera
  expression and speed-driven field-of-view changes.
- Changed condition feedback history from one active-rig scalar to per-rig
  values, preventing a rig switch from looking like new damage.
- Screenshot review caught broad-rig clipping in portrait chase. The shared
  profile-scaled policy now uses a stronger pullback and zero cinematic side
  offset in narrow view.
- Recorded ADR-0012, the implementation plan, a browser-physics technique
  catalog, exploration schema expansion, design rules, and acceptance evidence.
- Parallel work introduced ADR-0011 while this lane was active; references were
  rechecked and the perception ADR was preserved as ADR-0012.
- Evidence:
  - 83 root tests and seven kernel-probe tests passed;
  - typecheck, formatting, and production build passed;
  - browser acceptance passed three rigs, six cameras, cargo, ramp, hover,
    perception evidence, reduced motion, reload, and `390 × 844`;
  - zero console/page problems;
  - current build: 633.47 kB raw / 167.17 kB gzip JavaScript, retaining the
    existing 500 kB advisory.

### Anything else?

The new evidence proves that the perception pipeline is connected. Emotional
feel, representative-device budgets, haptics, articulated tools, and the
leading Rapier service hypothesis remain explicit proof gates.

- 2026-07-25: Created `docs/research/3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md` to consolidate the latest “3D Game Optimization Gaps” recommendations with repo-grounded implementation status and a prioritized execution order. Included gap-by-gap status (kernel, migration, culling/LOD, streaming, capabilities, affordances, collisions, authority/events, observability) and concrete acceptance gates.
- 2026-07-25: Added a `3d-games` skill synthesis checkpoint to `docs/exploration/EXPLORATION_MAP.md` so the per-skill guidance now lands in the canonical exploration map rather than only in research notes. The checkpoint now explicitly ties frustum culling, LOD, layer-based collisions, camera policy, and shadow strategy back to the live implementation and the remaining proof gates.
- 2026-07-25: Added skill provenance to `docs/research/3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md` so the audit records which `3d-games` skill files were used and what layers of guidance were applied versus project-specific interpretation.
- 2026-07-25: Added an evidence matrix to the same synthesis doc so the audit now names the strongest repository proof for each major gap area (kernel, save/versioning, renderer boundary, culling/LOD, collision matrix, capability model, replay/event lane, chunk streaming, observability).
- 2026-07-25: Cross-linked the execution roadmap to the new synthesis artifact so the implementation runway and the evidence/provenance layer now point at one another instead of drifting apart.
- 2026-07-25: Cleaned two wording slips in the new synthesis/roadmap docs (`capabililty` -> `capability`, duplicate `boundary boundaries`) so the long-term notes remain readable and search-friendly.
- 2026-07-25: Added [ADR-0014](decisions/ADR-0014-sequenced-capability-streaming-replay-authority-rollout.md) to make the capability/streaming/replay/authority/ECS rollout order explicit, then linked it back into the canonical exploration map and roadmap.
- 2026-07-25: Implemented a lightweight bounded run-record lane in `src/main.ts` and `src/game/run-record.ts`, capturing commands, input transitions, checkpoints, and saves so the replay gate has a concrete starting point without unbounded tab-lifetime growth. The browser surface now also exposes the structural verifier alongside the record snapshot.
- 2026-07-25: Extended `docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md` with the bounded recorder state and a compact change-plane / machine-centric growth addendum so the canonical analysis now reflects the current replay contract and the later “and more” architecture in one place.
- 2026-07-25: Extended the same canonical analysis with a data/asset/ingestion addendum and linked that contract layer back into the roadmap so manifests, validation, provenance, and resource budgets are now documented as product architecture rather than implied build steps.
- 2026-07-25: Corrected the canonical analysis replay row so it now states the bounded input-recording lane and browser-visible verification hook as current reality while keeping durable playback API work explicitly open.
- 2026-07-25: Added a behavior/event scheduler addendum to the canonical analysis and mirrored the split into the roadmap so behavior selection stays distinct from event recording and presentation.
- 2026-07-25: Added a streaming-world contract addendum to the canonical analysis and a matching roadmap lane so chunk residency is now described as a manifest-driven lifecycle with explicit activation, unload, and rollback rules.
- 2026-07-25: Added an ECS/entity-composition addendum to the canonical analysis and a threshold-gated ECS lane in the roadmap so ECS remains a proof-based migration decision instead of an assumption.
- 2026-07-25: Added [ECS Threshold and Composition Readiness Contract](research/ECS_THRESHOLD_AND_COMPOSITION_READINESS_CONTRACT_2026-07-25.md) so the composition threshold, migration trigger, and identity-preservation proof slice now live as a dedicated contract note and are linked from analysis, roadmap, and exploration.
- 2026-07-25: Added an authority-scaling addendum to the canonical analysis and a matching roadmap lane so authoritative mutation, intent queues, and replay-safe rejection handling are now explicit contracts instead of implied future work.
- 2026-07-25: Added a simulation-layer and resource-governance addendum to the canonical analysis and a matching roadmap lane so cross-domain systems now have an explicit ordered domain table and budget ledger instead of being implicit loop behavior.
- 2026-07-25: Added a modding and creator-pack addendum to the canonical analysis and a matching roadmap lane so user-authored content is now framed as versioned, validated packs with explicit compatibility and rollback rules.
- 2026-07-25: Added an event-system addendum to the canonical analysis and a matching roadmap lane so world events are now framed as versioned deterministic envelopes with ordered handlers and replay-safe telemetry.
- 2026-07-25: Added an asset-pipeline addendum to the canonical analysis and a matching roadmap lane so runtime assets now flow through versioned manifests with provenance, validation, and safe replacement rules.
- 2026-07-25: Added a web asset ingest/compression/provenance contract and tied it into the web audit plus roadmap lane so browser-facing assets now have explicit source-to-runtime validation, compression, and reject-path rules.
- 2026-07-25: Ran a live accessibility browser pass on the current Field 02 runtime, fixed the concrete keyboard gaps (added a skip link and made the canvas a reliable focus target), and rechecked that dismissing the intro now lands focus on `canvas#game-canvas`. Preserved the positive signals too: semantic landmarks, visible focus rings, reduced-motion support, and no console errors.
- 2026-07-25: Added a visibility-stage and LOD contract after rechecking the live renderer evidence (`render_game_to_text`, `getPerformanceSnapshot`, `selectCamera`) so the instanced world, blob-shadow posture, and current draw-radius strategy are now documented as a deliberate first-pass visibility budget rather than an implicit heuristic.
- 2026-07-25: Added a replay artifact and ghost contract after rechecking the live bounded recorder hooks (`getRunRecord`, `getRunRecordVerification`) so the current record shape, verification state, and missing playback/divergence rules are now documented as a product surface rather than only a debug log.
- 2026-07-25: Added a collision category and mask contract after rechecking the live obstacle-resolution code so obstacle kinds, trigger/sensor behavior, and collision telemetry are now documented as an explicit contract instead of only an implicit resolver.
- 2026-07-25: Added a camera feel contract after rechecking the live camera modes and profile-driven camera work so named modes, obstruction pull-in, reduced-motion clamping, and transition observability are now documented as an explicit contract instead of only renderer behavior.
- 2026-07-25: Added a physics quality envelope contract after rechecking the live traversal model and performance snapshots so deterministic motion, stability invariants, and fallback behavior are now documented as an explicit contract instead of only physics code.
- 2026-07-25: Added a resource budget and fallback envelope after rechecking the live performance snapshot so measured frame, draw, triangle, heap, and load posture are now documented as an explicit resource-governance contract instead of only runtime telemetry.
- 2026-07-25: Added an event graph and deterministic handlers contract after rechecking the command/checkpoint/save flow so event identity, ordering, ownership, and replay-safe payload rules are now documented as an explicit contract instead of only feature-local signaling.
- 2026-07-25: Added a behavior-system addendum to the canonical analysis and a matching roadmap lane so AI/planner behavior is now a versioned read-only decision layer rather than implicit feature logic.
- 2026-07-25: Added a world-affordance addendum to the canonical analysis and tightened the roadmap affordance lane so capability resolution now explicitly validates against world-facing interaction surfaces.
- 2026-07-25: Added a visibility-stage addendum to the canonical analysis and a matching roadmap lane so culling and LOD are now explicit policy with measurable draw budgets and degradations.
- 2026-07-25: Added a collision-category addendum to the canonical analysis and a matching roadmap lane so physics now distinguishes ground, obstacle, hazard, trigger, projectile, sensor, and decorative roles explicitly.

## 2026-07-25 — OpenAI Sites deployment preparation

- Re-entered the instruction stack and regenerated the canonical project context
  after the user requested a public Sites deployment.
- Audited the shared worktree before mutation: one `main` worktree, no stash, no
  local-only commits, and all parallel source/docs/research/visual evidence
  preserved.
- Recorded [ADR-0013](decisions/ADR-0013-sites-deployment-adapter.md) and added a
  bounded Cloudflare Worker-compatible adapter around the existing Vite game.
  The runtime, state model, local persistence, and gameplay routes remain
  canonical and unchanged by hosting.
- Source-controlled only the opaque Sites project ID. No source credential,
  environment value, token, private paid source asset, or runtime secret was
  added.
- Upgraded the hosting toolchain from the bundled template versions to patched
  current releases after the first audit reported transitive advisories.
  `npm audit --json` then reported zero vulnerabilities.
- Verification before commit:
  - `npm run typecheck`: passed;
  - `npm test`: 83 root tests and seven kernel-probe tests passed;
  - `npm run build`: passed and emitted Worker/client/hosting artifacts;
  - production-compatible preview on `4174`: full browser acceptance passed
    with zero console/page errors;
  - the existing 633 kB bundle advisory remains a visible hardening item.
- The exact acceptance boundary and three review passes are recorded in
  [Sites deployment acceptance](reviews/SITES_DEPLOYMENT_ACCEPTANCE_2026-07-25.md).
  Production success is not claimed until the immutable commit is pushed,
  packaged, saved, deployed, and reported `succeeded` by Sites.

### Production closure

- The exact source commit passed the managed hook, was pushed to GitHub and the
  Sites source repository, rebuilt cleanly, and passed the Sites packaging
  validator.
- Public access was enabled and Sites reported terminal `succeeded` status.
- Live URL:
  [https://rigs-unbound.suyashpranay.chatgpt.site](https://rigs-unbound.suyashpranay.chatgpt.site)
- Live verification returned HTTP 200 and passed the product contract: correct
  title, visible welcome surface, schema-v4 state export, Torque/Spark/Drift
  roster, and zero console/page errors.
- The first `networkidle` browser condition timed out; this was not treated as a
  product failure because an always-running game is not expected to become
  network-idle. The corrected readiness contract used DOM content plus explicit
  game assertions and passed.
- Sites Worker error logs contained no recent errors after the live probes.

## 2026-07-25 — Bounded run-record foundation preserved from parallel work

- Preserved the parallel run-record integration that arrived during deployment
  closure and treated it as runtime code, not a docs-only artifact.
- Rejected an unbounded fixed-step input log because a held control would append
  roughly 60 entries per second for the lifetime of the tab.
- Changed the recorder to capture input transitions, retain a bounded recent
  window, and report dropped-entry count explicitly.
- Added deterministic tests for schema serialization, elapsed-time
  normalization, bounded retention, and truncation visibility.
- Re-ran the full port-4174 browser acceptance and a focused keyboard-driven
  recorder probe; command, checkpoint, and input entries were visible, the
  structural verifier returned `ok: true` with no issues, and the browser
  reported zero console/page errors.
- This remains a diagnostics/reproducibility foundation, not a deterministic
  replay claim: durable storage and playback parity are still required, even
  though checkpoint hashes, a structural verifier, and a browser-visible
  verification hook are now in place.
- 2026-07-25: Added a camera-feel addendum to the canonical analysis and a matching roadmap lane so camera policy, transition rules, obstruction handling, reduced-motion behavior, and FOV changes are explicit product contracts.
- 2026-07-25: Added a deterministic-replay addendum to the canonical analysis and a matching roadmap lane so replay becomes a portable artifact with playback verification, divergence reporting, and operator-visible provenance.
- 2026-07-25: Added a shader/material addendum to the canonical analysis and a matching roadmap lane so visual identity, readability, weather cues, hazard feedback, and low-end fallbacks are explicit contract surfaces.
- 2026-07-25: Added a spatial-culling addendum to the canonical analysis and a matching roadmap lane so distance, portal, chunk-residency, and render-streaming behavior are explicit scale contracts.
- 2026-07-25: Added an LOD addendum to the canonical analysis and a matching roadmap lane so geometry, materials, animation, AI, physics, particles, and feedback all have explicit downgrade contracts.
- 2026-07-25: Added a resource-budget addendum to the canonical analysis and a matching roadmap lane so CPU, GPU, memory, residency, active actors, and battery/thermal pressure have explicit fallback envelopes.
- 2026-07-25: Added a portal-visibility addendum to the canonical analysis and a matching roadmap lane so room/portal graphs have explicit bounded-room visibility contracts.
- 2026-07-25: Added a lighting-and-atmosphere addendum to the canonical analysis and a matching roadmap lane so staged lighting, shadow fallbacks, and low-cost readability cues are explicit contracts.
- 2026-07-25: Added an accessibility-and-input addendum to the canonical analysis and a matching roadmap lane so named actions, remapping, reduced-motion, contrast, and device parity are explicit contracts.
- 2026-07-25: Added a kernel-ordering addendum to the canonical analysis and a matching roadmap lane so mutable subsystems must enter through explicit tick-order, write-scope, and replay-safe gates.
- 2026-07-25: Added a world-and-architecture-scalability addendum to the canonical analysis and a matching roadmap lane so chunk growth, activity packs, migration boundaries, and shared-state readiness stay bounded and testable.
- 2026-07-25: Added a save-and-migration observability addendum to the canonical analysis and a matching roadmap lane so state mutations, saves, and migrations carry reason codes, version metadata, and explicit recovery visibility.
- 2026-07-25: Added a physics-quality-envelope addendum to the canonical analysis and a matching roadmap lane so terrain contact, obstacle stability, cornering, and fallback behavior stay deterministic and playable.
- 2026-07-25: Added an authoring-and-content-validation addendum to the canonical analysis and a matching roadmap lane so content manifests, provenance, and validator-first results are explicit contracts.
- 2026-07-25: Added a performance-and-readability baseline addendum to the canonical analysis and a matching roadmap lane so culling, LOD, camera, collision, and instrumentation thresholds have one umbrella policy surface.
- 2026-07-25: Added a second-locomotion-family and cross-mode continuity addendum to the canonical analysis and a matching roadmap lane so capability-first motion expansion preserves shared actions and recovery behavior across modes.
- 2026-07-25: Added an authority-model groundwork addendum to the canonical analysis and a matching roadmap lane so local-first simulation, authenticated mutation, and durable-value recovery have an explicit future authority boundary.
- 2026-07-25: Added an engine-branch evaluation addendum to the canonical analysis and a matching roadmap lane so alternate backends are only benchmarked against the canonical Three.js path when budgets or platform constraints justify it.
- 2026-07-25: Added a replay-and-ghost product feature addendum to the canonical analysis and a matching roadmap lane so shareable replay artifacts stay deterministic, versioned, and trustable.
- 2026-07-25: Added a verification-harness and confidence-gates addendum to the canonical analysis and a matching roadmap lane so deterministic fixtures, tiered evidence, and failure traces are explicit proof contracts.
- 2026-07-25: Created `docs/research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md` as the renderer budget-threshold and visual-language companion note referenced by the canonical analysis.
- 2026-07-25: Created [ADR-0015](decisions/ADR-0015-renderer-camera-policy-v1x.md) as the v1.x renderer/camera policy ADR referenced by the canonical analysis follow-up list.
- 2026-07-25: Created `docs/research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md` as the production-like profile KPI note referenced by the canonical analysis follow-up list.
- 2026-07-25: Created `docs/research/CULLING_LOD_SPIKE_TESTS_2026-07-25.md` as the deterministic culling and LOD spike-test companion note referenced by the canonical analysis follow-up list.
- 2026-07-25: Created `docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md` to answer the first-public-smoke-test accessibility/camera gate and bound the standard/mobile-safe acceptance profiles.
- 2026-07-25: Updated the canonical 3D analysis to remove the open accessibility smoke-test question and point it at the new renderer/performance/accessibility contract note.
- 2026-07-25: Updated the multi-skill long-term possibility audit so the renderer/performance/accessibility contract bundle is recorded as the immediate documentation-and-validation track.
- 2026-07-25: Reconciled the renderer budget and KPI companion notes so their open questions now point to the new first-public-smoke-test contract instead of repeating the same gap.
- 2026-07-25: Created `docs/research/PHYSICS_READABILITY_AND_SPEED_CONTRACT_2026-07-25.md` to answer the remaining high-speed readability question through the shared perception frame.
- 2026-07-25: Updated the canonical 3D analysis so the open physics-readability risk is now a named contract instead of a dangling question.
- 2026-07-25: Created `docs/decisions/ADR-0016-performance-and-readability-threshold-baseline-v1x.md` to bind the shared threshold bands, fallback order, and capture bundle for public acceptance.
- 2026-07-25: Reconciled the KPI and rendering-economy notes so their threshold questions now point at ADR-0016 rather than behaving like standalone policy gaps.
- 2026-07-25: Created `docs/research/THRESHOLD_FIXTURE_BASELINE_2026-07-25.md` to name the canonical comparison scenes for threshold captures.
- 2026-07-25: Updated the KPI and rendering-economy notes so fixture-selection questions now point at the canonical threshold fixture baseline.
- 2026-07-25: Created `docs/research/THRESHOLD_CAPTURE_SELECTION_PROTOCOL_2026-07-25.md` to map each subsystem to the most explanatory canonical capture.
- 2026-07-25: Updated the KPI and rendering-economy notes so capture-selection questions now point at the new selection protocol instead of lingering as open policy questions.
- 2026-07-25: Created `docs/research/READABILITY_METRIC_RUBRIC_2026-07-25.md` to name transition latency as the lead unreadability predictor and rank the supporting signals.
- 2026-07-25: Updated the KPI, rendering-economy, and canonical analysis notes so the unreadability question now points at the metric rubric instead of lingering open.
- 2026-07-25: Created `docs/research/CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md` to bind the 30-second loop, session loop, long arc, and opportunity guidance.
- 2026-07-25: Updated the exploration map and canonical analysis so the player-loop contract is now part of the repo’s living architecture instead of an implied design idea.
- 2026-07-25: Created `docs/research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md` to bind browser loading progression, fallback visibility, and profile bootstrap.
- 2026-07-25: Updated the 3D web audit and canonical analysis so the loading-fallback gap now points at the named bootstrap contract.
- 2026-07-25: Created `docs/research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md` to formalize rig capabilities, adapter binding, reason-coded admission, and world-affordance resolution.
- 2026-07-25: Created `docs/research/BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACTS_2026-07-25.md` to formalize the command-to-decision layer, deterministic planner choice, and read-only behavior boundaries.
- 2026-07-25: Created `docs/research/STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md` to formalize the chunk-manifest lifecycle, residency states, budget counters, and rollback rules.
- 2026-07-25: Created `docs/research/SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md` to formalize owned simulation layers, update order, and governance fallback visibility.
- 2026-07-25: Created `docs/research/MODDING_AND_CREATOR_PACK_VALIDATION_CONTRACT_2026-07-25.md` to formalize validated creator packs, compatibility rules, and rollback-safe publication staging.
- 2026-07-25: Created `docs/research/WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25.md` to formalize the world-verb/capability resolution step and keep interactions deterministic.
- 2026-07-25: Created `docs/research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md` to formalize the source-to-manifest asset path, provenance validation, and runtime replacement rules.
- 2026-07-25: Created `docs/research/SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md` to formalize layered materials, readability, and fallback strategy for renderer cues.
- 2026-07-25: Created `docs/research/LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md` to formalize tiered lighting, shadow fallback, and atmosphere readability.
- 2026-07-25: Created `docs/research/PORTAL_VISIBILITY_AND_BOUNDED_ROOMS_CONTRACT_2026-07-25.md` to formalize room/portal graphs and bounded-room visibility.
- 2026-07-25: Created `docs/research/ACCESSIBILITY_AND_INPUT_CONTRACT_2026-07-25.md` to formalize named actions, remap persistence, and device-parity controls.
- 2026-07-25: Created `docs/research/KERNEL_ORDERING_AND_MUTABLE_SUBSYSTEM_GATES_CONTRACT_2026-07-25.md` to formalize the authoritative step order and mutable subsystem gates.
- 2026-07-25: Created `docs/research/SAVE_AND_MIGRATION_OBSERVABILITY_CONTRACT_2026-07-25.md` to formalize versioned persistence, migration observability, and recovery summaries.
- 2026-07-25: Created `docs/research/AUTHORING_AND_REPRODUCIBLE_CONTENT_VALIDATION_CONTRACT_2026-07-25.md` to formalize manifest validation, provenance metadata, and runtime-ready status.
- 2026-07-25: Updated the exploration map so the behavior/planner and simulation-layer/resource-governance backlog rows now point at their existing contract notes instead of reading as unnamed gaps.
- 2026-07-25: Reconciled the remaining exploration-map backlog rows to their named contract notes so chunked world scaling, ECS, LOD, portal visibility, shader/material, collision, replay, modding, and resource governance are all discoverable from the canonical map.
- 2026-07-25: Normalized the exploration backlog table wording from raw Missing/Partial labels to named-contract status so the canonical map now reflects documented ownership even where implementation is still pending.
- 2026-07-25: Normalized the occlusion-integration row to named-contract status so visibility-stage work is now described consistently with the existing contract note.
- 2026-07-25: Normalized the frustum/distance culling row to named-contract status so the visibility-stage backlog block is now fully described in contract terms.
- 2026-07-25: Added a contract-note reconciliation section to the optimization synthesis doc so the major follow-on lanes now point at the exact durable notes that own them.
- 2026-07-25: Added a contract-note reconciliation section to the platform long-term audit so each major platform-growth lane now has a named boundary note.
- 2026-07-25: Added a contract-note bridge to the second-pass optimization audit so the extended follow-on recommendations now point at the named durable notes that own them.
- 2026-07-25: Expanded the second-pass audit bridge to include shader/material, asset-pipeline, and simulation-layer contract notes so the full follow-on trail is linked rather than partial.
- 2026-07-25: Replaced the umbrella-baseline addendum's generic contract list with explicit links to the named contract notes for visibility, camera, lighting, accessibility, collision, and physics.
- 2026-07-25: Added explicit contract links to the camera, replay, accessibility, world-scaling, and authoring addenda in the main analysis doc so those lanes now point at named boundaries instead of broad prose.
- 2026-07-25: Added an explicit contract anchor to the save/migration observability addendum so the persistence observability lane now points at the named boundary.
- 2026-07-25: Added an explicit contract anchor to the lighting and atmosphere addendum so the lighting lane now points at the named boundary.
- 2026-07-25: Added an explicit contract anchor to the performance/readability baseline addendum so the umbrella policy now points at its named boundary.
- 2026-07-25: Added explicit contract anchors to the second-locomotion, authority, engine-branch, replay, and verification-harness addenda so the remaining growth lanes now point at named boundaries.
- 2026-07-25: Added an explicit contract anchor to the streaming addendum so chunk residency now points at the named boundary.
- 2026-07-25: Added a contract-note map to the second-pass audit execution order so the renderer, collision, replay, authority, and formalization lanes now point at exact owning notes.
- 2026-07-25: Created `docs/research/PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md` to formalize the umbrella policy over culling, LOD, camera, collision, and transition budgets.
- 2026-07-25: Created `docs/research/SECOND_LOCOMOTION_FAMILY_AND_CROSS_MODE_CONTINUITY_CONTRACT_2026-07-25.md` to formalize the second motion grammar, shared actions, and rollback continuity.
- 2026-07-25: Created `docs/research/AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md` to formalize the local-first authority boundary and future-only shared-state wording.
- 2026-07-25: Created `docs/research/ENGINE_BRANCH_EVALUATION_AND_ALTERNATE_BACKEND_GATING_CONTRACT_2026-07-25.md` to formalize the bounded backend-comparison gate.
- 2026-07-25: Created `docs/research/VERIFICATION_HARNESS_AND_CONFIDENCE_GATES_CONTRACT_2026-07-25.md` to formalize deterministic fixtures, evidence tiers, and confidence gates.

## 2026-07-25 — Physics Lab 01: replaceable chassis and raycast-wheel dynamics

- Executed ADR-0017's first coherent physics slice with Rapier `0.19.3` behind
  project-owned intent and dynamics contracts.
- Added a separate Physics Lab entry with a dynamic chassis, four raycast
  wheels, asphalt/gravel/mud/ice response, fixed-step controls, plain-data
  capture/reset, debug geometry, automatic recovery, and six camera policies.
- Made the visual front explicit and added browser proof that positive throttle
  moves the front toward local positive Z.
- Added focused intent/dynamics tests and a reusable browser acceptance tool.
- Captured and inspected desktop, top-down, debug, and `390 × 844` evidence.
- Continued the Adjacent Activity Expansion audit: no repeated
  tractor-name-gated shared-runtime behavior or universal controller appeared;
  the direct tractor migration path remains bounded to historical save input.
- Recorded the decision, plan, research/exploration updates, acceptance
  contract, tool use, and known articulation/device/player-feel gaps.
- A parallel process updated `main` during this work and included part of the
  physics foundation in `aa82cee`; this task did not create or push that commit.

### Anything else?

The next physics evidence should compose unstable towing and motorized lifting
into one rescue, construction, or recovery activity. More isolated chassis
tuning would now provide less information than testing articulation, load, and
capability ownership together.
- 2026-07-25: Added a Physics Lab browser-experience addendum and roadmap lane so the standalone lab stays a browser evidence fixture with explicit boot, accessibility, fallback, and acceptance boundaries.
- 2026-07-25: Linked the replay and ghost roadmap lane back to the existing replay contract so the shareable-artifact boundary is no longer an orphaned bullet list.
- 2026-07-25: Linked the authority roadmap lane back to the existing authority contract so future shared-state behavior remains explicitly future-gated.
- 2026-07-25: Added a world-and-architecture scalability contract so chunk growth, activity packs, migration boundaries, and shared-state readiness stay bounded and testable.
- 2026-07-25: Folded Physics Lab 01 into the verification-harness contract so the browser-visible fixture now anchors the confidence-gates trail as well as the lab-specific acceptance review.

## 2026-07-25 — Direction session: game-systems analysis, ADR-0018, Farmfall plan, simulated playtests

- Full instruction-stack session: explored code, docs, and all 16 ADRs;
  verified ground truth (typecheck + 83 root tests + 7 kernel-probe tests
  green at session start).
- Created `docs/exploration/GAME_SYSTEMS_ANALYSIS_AND_DIRECTION_2026-07-25.md`:
  verified-state assessment, the "engine without a game" gap analysis,
  first-principles leveling/mechanics/modes/scenes/characters proposals, and
  documentation-hygiene findings.
- Operator decisions recorded verbatim in that doc: build all four
  workstreams (farm/defense slice, mastery spine, time trial + ghost,
  external-player gate simulated for now); leveling = full spine **plus**
  in-verb vertical power; engine bakeoff probe scheduled against the existing
  engine-branch gating contract (not duplicated).
- Created ADR-0018 (Accepted): Journey + Verb Mastery + Insight progression
  spine with situation-weighted accrual and bounded in-verb power composed
  through `effectiveProfile()`.
- Created `docs/plans/FARMFALL_SLICE_01_2026-07-25.md`: crops, noise/light
  signature ecology, night threats, dawn consequences, and the mastery
  kernel, with explicit scope boundaries against parallel physics-lab work.
- Launched three uncontaminated simulated-player agents (casual / achiever /
  explorer) against the live build; reports land in
  `docs/reviews/PLAYTEST_SIM_*_2026-07-25.md` with screenshots under
  `artifacts/playtest-*`.

### Anything else?

Yes. The multi-agent stale-state rule was applied wrong at first in this
session (shared docs were avoided instead of re-read); corrected in the same
session — append-only edits with fresh anchors are the motto-conformant path,
and that is how this entry was made.

- 2026-07-25: Created `docs/research/WEBGPU_AND_WEB_PERFORMANCE_ANALYSIS_2026-07-25.md` after the operator loaded the `webgpu` and `web-performance-optimization` skills — full renderer/boot/bundle/caching audit with a prioritized P1–P3 work-item list; headline findings: zero custom GLSL makes WebGPU portability cheap, no context-loss handling exists, boot is a synchronous terrain-build wall with no loading state, `firstControllableMs` measures first render not input-readiness, and WASM payloads are correctly isolated.
- 2026-07-25: Fresh production build recorded in that analysis: game boot ~667 kB raw / ~178 kB gzip; the 2.77 MB three.module sourcemap ships publicly (policy item P3-a).
- 2026-07-25: First simulated playtest (achiever) accepted into evidence: rig fantasy language gate passed ("planted/deliberate/stubborn/honest" vs "skittish/eager/reckless/brittle"), but the economy first rung is unreachable (0 salvage banked in 10+ min, pickup untaught); four bugs routed into Farmfall scope (intro modal re-opens mid-drive, spawn camera blocked by silo wall, no wreck state at 0% condition, Physics Lab dev button exposed in player UI).
- 2026-07-25: Casual and explorer playtests completed (both agents hit the 2h cap still playing, resumed in report-only mode). Casual 4/10 (tab-close at ~6–8 min): Torque "planted/lumbering/sturdy", Spark "twitchy/eager/fragile", Drift "floaty/slidy/ghostly"; found hood camera broken and Drift's 320%-grade climb. Explorer 7/10: "alive as a system, empty as a place — a beautifully instrumented ghost valley"; confirmed persistence works (world restored even a drowned rig); found the salvage-collection defect, day/night clock derail, and the drowned-rig soft-lock.
- 2026-07-25: Created `docs/reviews/PLAYTEST_SIM_SYNTHESIS_2026-07-25.md` — three-persona cross-tabulation: fantasy-differentiation gate PASSED by all personas; blocking fun gap = missing first rung (0 salvage banked by everyone); 12-bug consolidated list (4× P0); scores 4/6/7 with a named cheap path to 7–8. Meta-finding: fresh-eyes simulation caught P0s that all prior tests missed because every prior test knew how the game was supposed to be played; the lane is now proven and repeats after Farmfall.
- 2026-07-25: Farmfall Slice 01 plan revised — Phase 0 (playability repair: B1–B4 P0s + reachable first salvage + P1/P2 cheap fixes) prepended ahead of the kernel phase; implementation launched with regression-test-first mandate.

## 2026-07-25 — Box3D Probe 01 and expanded solver evidence map

- Re-verified Box3D against its official announcement, repository, simulation
  docs, and recording docs; verified the new third-party `box3d-wasm@0.2.0`
  package, so the earlier “no ready npm package” statement is now recorded as
  stale.
- Updated ADR-0017 before implementation: Box3D is now a mandatory bounded
  physical-wheel experiment, while Rapier remains the raycast-wheel proof and
  the product architecture stays solver-independent.
- Split the dynamics service into a shared world port plus explicit raycast and
  physical-wheel creation capabilities.
- Added a single-thread Box3D adapter with four physical wheel bodies/joints,
  semantic intent, telemetry, complete assembly capture/restore, explicit
  lifecycle disposal, exact dependency integrity, and no save/activity
  authority.
- Added the separate `/box3d-lab.html` route through the existing Physics Lab
  runner and renderer. Six views, correct positive-front direction, desktop and
  narrow controls, and browser-readable state all passed.
- Added a Box3D browser acceptance runner and inspected desktop, top-down, and
  narrow screenshots. Positive throttle advanced `+7.96 m` in the acceptance
  run, steering rotated the chassis, all views selected, reset restored four
  wheel bodies, and console problems were empty.
- Expanded the comparison programme into collision roles/masks, CCD, camera
  obstruction, minimap/world-frame fidelity, terrain/material identity,
  streaming, attachments, feedback/audio, and replay diagnostics. Added the
  minimap/world-coordinate contract rather than letting solver-local
  coordinates become map or save truth.
- Verification: 102 root tests + 7 kernel tests passed; typecheck passed;
  production build passed with separate 520.91 kB Box3D WASM and 31.97 kB
  adapter chunks; Box3D, Rapier Physics Lab, and canonical Field 02 browser
  workflows passed.
- The first full test attempt exposed severe CPU contention from a live
  Playwright Chrome GPU process. The daemon was stopped, simulation files were
  made file-serial without raising the five-second per-test timeout, and the
  complete suite then passed in 6.26 seconds.
- No commit, push, branch, deployment, system-wide Emscripten installation,
  deletion, or cleanup was performed. Parallel Farmfall/playtest/progression
  work was preserved.

### Anything else?

Box3D is now executable evidence, not an architectural anchor. The next
high-information proof is the shared semantic collision/attachment scene plus a
world-frame/minimap inset; Jolt should enter only when that harness has an
explicit controller or constraint question.

## 2026-07-26 — Integration, two-port acceptance, and master tracker

### Baseline and preservation

- Loaded the global/project instruction stack, full project `motto_v4.md`,
  generated context pack, Git Commit Helper skill, and Sites hosting skill.
- `agent-start --project` reached its documented shared-context fallback, then
  hung after the timeout; the process was stopped and the required fallback
  loop was completed from the live instruction files and generated pack.
- Confirmed the ambient `openworld_1` path is stale and the authoritative
  checkout is `/Users/pranay/Projects/Game_dev/rigs-unbound`.
- Confirmed one `main` worktree, no stash, and `HEAD == origin/main ==
  aa82cee` before the integration commit.
- Classified the local set as source changes, research/decision continuity,
  curated visual/video evidence, reusable browser tools, and raw simulated
  playtest evidence. No files exceeded GitHub's single-file limit and the
  repository scan found no credential pattern in the candidate set.

### Verification

- `npm run typecheck` — passed.
- `npm test` — 102 root tests and seven deterministic-kernel tests passed.
- `npm run test:assets` — five asset tests passed.
- `npm run format:check` — passed.
- `npm run build` — passed; Field 02, Rapier Physics Lab, and Box3D Probe
  entries built separately. Vite retained the advisory for the 548.69 kB
  Three.js chunk.
- `RIGS_UNBOUND_URL=http://127.0.0.1:4173/?acceptance=field-02 npm run
  test:browser` — passed with zero console/page problems.
- The same Field 02 acceptance on port `4174` — passed with zero console/page
  problems.
- Rapier Physics Lab browser acceptance on `4173` — passed across movement,
  steering, four surfaces, six cameras, reset, and narrow layout.
- Box3D Probe browser acceptance on `4173` — passed across physical-wheel
  movement, steering, six cameras, full-assembly reset, and narrow layout.
- Sites read-only provenance check — version 4 is sourced from `aa82cee` and
  the current public URL is active.

### Documentation continuity

- Added `docs/plans/MASTER_EXECUTION_TRACKER.md` as the canonical task ledger
  with explicit states, dependencies, evidence, and closure gates.
- Corrected `progress.md` deployment provenance and added the current
  integration evidence and next-risk summary.
- Added a dated supersession note to the build-in-public kit: trailer capture
  now exists, field-vs-lab engine wording is precise, current test claims are
  accurate, and deployment remains a pre-flight gate.
- Continued the 3D-games analysis continuity pass by anchoring the remaining
  prose-only addenda to named contract notes for behavior/event scheduling,
  authority, simulation layers, modding, event graphs, asset pipeline,
  affordances, visibility, collision, spatial culling, LOD, budgets, portals,
  and kernel ordering.
- Also bridged the earlier data/asset ingestion lane, machine-centric growth
  synthesis, and shader/material strategy to their named contract notes so the
  full analysis trail is now contract-backed instead of partially descriptive.
- Normalized the remaining physics-quality envelope section so it now uses the
  same explicit contract-bridge language as the rest of the canonical analysis
  doc.
- Extended the second-pass synthesis contract bridge so the lower-lane notes
  (camera, lighting, accessibility, physics quality, performance baseline,
  world affordances, save/migration, content validation, second locomotion,
  engine-branch gating, and verification harness) are now named explicitly.
- Added a dedicated 3D-game contract index so the expanding lane map has one
  durable navigation entry point alongside the research, audit, and roadmap
  docs.
- Exposed the new contract index from the exploration map so the backlog view
  and the contract lattice are now linked from the same navigation surface.
- Wired the contract index into the roadmap and synthesis docs so the wider
  3D-game research stack now has a single compact navigation entry point.
- Normalized the synthesis doc pointer to the contract index into a clean
  standalone paragraph for easier scanning.
- Added the contract index pointer to the platform audit so the top-level
  architecture doc now shares the same quick navigation surface.
- Added the contract index pointer to the second-pass synthesis doc so the
  follow-on audit and the contract lattice share one compact jump point.
- Expanded the contract index to include the remaining obvious lanes: core
  loop, minimap/world coordinates, asset authority, web loading/bootstrap,
  renderer accessibility, and physics readability/speed.
- Added the accessibility/input lane to the contract index after the filename
  comparison surfaced one remaining omission in the navigation table.
- Added a supporting continuity section to the contract index so the
  exploration map, worklog, master tracker, render plan, and public-readiness
  register are surfaced alongside the contract lattice.
- Added the contract index to the master execution tracker header so the
  execution view now has the same quick lane entry point as the research docs.
- Added a docs-root landing page and linked it from the contract index so the
  project now has one obvious start-here entry point for docs navigation.
- Added root-README links to the docs landing page and contract index so the
  repository itself now points directly at the docs navigation surfaces.
- Added a navigation block to the exploration map so the map itself now points
  at the docs root landing page, contract index, tracker, and worklog.
- Added a research-root landing page and linked it from both the docs root and
  repository README so the research stack now has a direct entry point.
- Added back-links from the research landing page to the docs root and root
  README so the navigation path is bidirectional instead of one-way.
- Replaced the docs landing page's directory placeholders with concrete
  research and ADR targets so the page stays clickable and portable.
- Added the asset pipeline, shipped-mesh authority, and web-ingest contracts
  to the research landing page so the 3D asset-production lane is now surfaced
  alongside the rest of the live evidence stack.
- Added the web performance, accessibility, and loading/bootstrap docs to the
  research landing page so browser runtime analysis now has a clear entry point
  beside the asset and architecture lanes.
- Added the core-loop, capability, replay, and verification contracts to the
  research landing page so the simulation spine is now visible from the same
  root navigation surface.
- Added the streaming, modding, authority, and world-scaling contracts to the
  research landing page so world-growth governance has the same root entry
  point as assets, web runtime, and simulation.
- Added the visibility, collision, camera, shader, lighting, and renderer
  accessibility contracts to the research landing page so the spatial
  readability lane is now visible alongside the rest of the research stack.
- Added the threshold, KPI, readability, and rendering-economy docs to the
  research landing page so the evidence-and-metrics lane is now a first-class
  navigation surface as well.
- Added the accessibility findings, render checklist, vehicle-physics catalog,
  game reference atlas, multi-skill audit, and tagged skill coverage map to
  the research landing page so the reference and provenance lane is surfaced
  beside the other research groups.
- Added the Kenney audit and tractor intake / reconstruction / preview docs to
  the research landing page so the asset-intake evidence lane is visible as a
  first-class research surface too.
- Added a master synthesis doc and linked it from the research landing page so
  the repo now has a compact what-exists / what-is-possible / what-next handoff
  above the lane-specific contracts.
- Documented and fixed the live boot/public-state crash in `src/game/state.ts`
  with a runtime note so checkpoint serialization no longer hard-fails on
  missing numeric fields during boot.
- Verified the live enter-world path lands focus on `canvas#game-canvas` and
  recorded that proof in the runtime safety note so the accessibility fix is
  now browser-confirmed too.
- Added a live runtime baseline snapshot with the current performance metrics
  and run-record verifier status so the repo now has a durable observability
  baseline to compare against on future passes.
- Clarified the semantics of `firstControllableMs` so the repo now distinguishes
  controllability timing from any future explicit input-readiness metric.
- Added a live `firstInputReadyMs` metric and documented its semantics so the
  runtime now tracks input readiness separately from controllability.
- Refreshed the live runtime baseline snapshot with the latest observed
  performance values so the evidence note stays aligned with the current live
  browser session.
- Added the accessibility, authoring, behavior, culling, backend, physics lab,
  portal, budget, and locomotion proof docs to the research landing page so
  the operational proof lane has a direct entry point too.

### Three-pass review

1. **Immediate correctness and completeness:** checked the complete local
   inventory, representative visuals, dependency/build changes, source
   contracts, test suites, both local ports, laboratories, and public Sites
   provenance. No candidate file was silently dropped.
2. **Architecture and long-term viability:** confirmed Field 02 remains the
   canonical game runtime; Rapier raycast wheels and Box3D physical wheels are
   separate bounded capabilities behind project-owned ports; the master
   tracker prioritizes the first game loop ahead of additional engine breadth.
3. **Rule compliance and supervision readiness:** rechecked v4 hook and
   co-author guards, evidence tiers, append-only decision continuity,
   deployment-source alignment, known P0 playtest gaps, and the final
   acceptance-report requirements.

### Evidence and boundaries

- Tier 2: typecheck, unit/integration suites, asset tests, formatting, build.
- Tier 4: visible browser acceptance on 4173/4174 and both dynamics labs,
  including desktop/narrow layouts and console capture.
- Tier 5 is not claimed. Real-phone thermals/touch/audio, cold-cache production
  loading, WebGL context recovery, and real human fun/taste remain open.
- The raw playtest corpus is retained because it documents discovery and failed
  paths; a future evidence-retention policy must bound growth without deleting
  historical material.

### Anything else?

Yes. The current systems playground is stronger than its first-session game
loop. The dependency order is now explicit: publish this evidence, repair the
first rung, complete Farmfall, repeat external playtests, then let those results
choose the next physics, world, social, or asset expansion.

## 2026-07-26 — Integration batch commit, push, and Sites version 5

### Exact release chain

- Staged the complete 414-file preservation batch after classifying source,
  package/config, curated media, review screenshots, reusable tools, raw
  simulated-playtest evidence, and concurrent documentation.
- Completed the coverage-complete motto-v4 commit review: all 51 sections
  passed with diff-aware evidence; the normal managed hooks ran without
  bypass; no AI co-author trailer was added.
- Created guarded commit
  `1e7992125824a850eb27a9f9d2bbdbc95b229e2b` and pushed `main` to GitHub.
  Local `main` and `origin/main` were then verified at the same SHA with a
  clean worktree.
- Pushed that exact source state to the existing Sites source repository
  without printing or persisting the short-lived credential.
- Packaged the clean commit with the Sites-provided packager, saved Sites
  version 5, deployed the saved version, and polled deployment
  `appgdep_6a651eeb031081919103b85b9e4eba0c` to terminal `succeeded`.
- Node-based production smoke checks returned HTTP 200 with expected content
  for `/`, `/physics-lab.html`, and `/box3d-lab.html`.

### Acceptance and evidence

- Tier 2: typecheck, 102 root tests, seven kernel tests, five asset-security
  tests, formatting, local Markdown links, and staged-diff integrity passed.
- Tier 3: the production Worker/client build, exact-source push, Sites
  packaging, and saved-version provenance passed.
- Tier 4: Field 02 browser acceptance passed on 4173 and 4174; the Rapier and
  Box3D labs passed local browser acceptance; Sites reported a successful
  public production deployment and all three public routes returned HTTP 200.
- Not claimed: a fresh full production-browser interaction pass, real-device
  performance, cold-cache first frame, WebGL recovery, audio listening, or
  human taste/fun evidence.

### Three-pass closure

1. **Immediate correctness:** rechecked current git state after parallel
   changes, repaired three whitespace defects and three broken local links, and
   reran the full staged validation set.
2. **Architecture and long-term viability:** kept Field 02 as the canonical
   player surface, Rapier and Box3D as replaceable capability laboratories, one
   Sites project, one source branch, and one repeatable deployment runbook.
3. **Rule compliance and supervision readiness:** preserved every parallel
   artifact requested by `git add -A`, recorded exact source/deployment
   provenance, updated the canonical task ledger, and retained explicit P0,
   evidence-growth, performance, device, and human-playtest gaps.

### Anything else?

Yes. Publishing closes RU-0004; it does not make the systems playground a
complete game. The next implementation gate is RU-0106 through RU-0110, with
the first priority being the title-card re-entry and zero-condition recovery
soft-lock because they can prevent a player from reaching or recovering the
core loop.

## 2026-07-26 — First-rung P0 repair (RU-0106 through RU-0109)

### Baseline and decisions

- Reproduced background simulation under the welcome plate. Keyboard focus
  re-entry did not reproduce in the current baseline, so the acceptance harness
  now protects both non-reentry and non-simulation contracts.
- Confirmed there was no guaranteed authored first salvage, condition-zero
  rigs could drift/soft-lock, and visible phase time mixed unrelated clocks.
- Accepted ADR-0019: absolute world time, schema-v5 migration, exceptional
  recovery, explicit world-entry gating, and canonical first-salvage action.

### Implementation

- Added authored `first-recovery-cache`, reachable from Home Silo and collected
  through `performPrimaryAction`.
- Added `worldTimeMinutes`, derived phase boundaries, v4→v5 migration, and
  persisted recovery audit fields.
- Disabled fixed-step movement at zero condition and added a non-rewarding Home
  Silo recovery to 25% condition with repeat protection.
- Gated held input, fixed-step simulation, periodic saves, and input-readiness
  telemetry behind entry; added immediate welcome `[hidden]` behavior.
- Added a contextual desktop mouse recovery action while retaining keyboard and
  responsive touch actions through the same semantic transition.

### Verification and three passes

1. Immediate correctness: TypeScript passed; 62 targeted state/storage tests
   passed; full suite passed with 108 root tests and seven kernel-probe tests.
2. Architecture: activity time remains separate from the world clock; normal
   winch behavior remains capability-gated; v1–v5 save recovery remains one
   canonical chain; Farmfall is resequenced to schema v6.
3. Supervision readiness: formatting and production build passed; Field 02
   browser acceptance passed on `4173` and rebuilt `4174`, covering welcome
   gating, first salvage, day→gloam→night→dawn, reload, keyboard/mouse/touch
   recovery, repeat protection, narrow layout, and zero console/page errors.

Remaining before release: final diff/link/security checks, full motto
attestation, guarded commit/push, exact-source Sites deployment, and production
smoke. RU-0110 (B5–B12) is the next gameplay work package.

## 2026-07-25 — behavior planner and event graph boundary check

- Re-read the behavior/planner and event-graph contracts, then verified the
  live run record through `window.getRunRecordVerification()`.
- Confirmed the app already captures command/checkpoint/input/save history with
  a clean run-record verification result.
- Confirmed the missing layer is still the planner/event envelope itself:
  - no first-class candidate generator,
  - no deterministic branch-selection telemetry,
  - no explicit origin-domain event envelope.
- This keeps the architecture honest: observability exists, but behavior
  planning and event ownership remain explicit next contracts rather than
  accidental hidden behavior.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — capability and affordance admission check

- Re-read the capability and affordance contracts, then exercised a live denied
  action in the browser runtime.
- Verified the runtime already has a real boolean capability gate via
  `hasCapability(...)` and capability-bearing rig profiles.
- Verified a denied capability path produces a deterministic prose diagnostic
  rather than a structured reason envelope:
  - selecting `toy-buggy`
  - invoking blade logic
  - diagnostic: `Spark carries no blade. Torque does.`
- This keeps the current boundary honest: capability resolution is real, but
  the reusable admission envelope and shared resolver still need to be named
  before future planners can depend on them.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — save and migration observability check

- Re-read the save/migration contract and verified the live browser persistence
  surface.
- Confirmed the runtime is using a single versioned save key in localStorage:
  - `rigs-unbound.save.v5`
- Confirmed the HUD exposes a current save status line, but it is still a
  combined health/readout surface rather than a structured persistence reason
  envelope:
  - `Local field record · 50 fps · 78 calls · 15.6 MB`
- Confirmed the run record verification remains clean (`ok: true`), and save
  events are already present in the durable history.
- The missing layer is the explicit load/save/migration reason metadata the
  contract calls for.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-26 — Sites version 6 release

- Pushed guarded commit
  `f5a007d1e9866fea510fcef1cfba102a7ee85e13` to GitHub `main` and the existing
  Sites source branch.
- Packaged from an isolated copy of that exact commit, saved Sites version 6,
  and polled deployment `appgdep_6a652cbbcf108191a07becdbe1beaaf7` to terminal
  `succeeded`.
- Public checks: Field 02 returned HTTP 200; the historical lab `.html` URLs
  redirected to canonical routes; both canonical lab routes returned HTTP 200.
- Fresh public-browser evidence: welcome gating kept elapsed time at zero,
  entry exposed schema v5 and `first-recovery-cache`, input readiness was
  measured, and the captured console had zero entries.
- Preserved concurrent accessibility, asset-provenance, behavior/event, and
  capability/affordance documentation for the follow-up docs commit.

### Anything else?

Yes. Version 6 is the current public first-rung baseline, not completion of the
game. RU-0110 is next; representative-device, cold-cache, WebGL recovery,
audio, and human-fun evidence remain open.

## 2026-07-25 — replay artifact and ghost boundary check

- Re-read the replay contract and verified the live run-record surface.
- Confirmed the browser exposes `getRunRecord()` and
  `getRunRecordVerification()`, and the current verification result is clean.
- Confirmed the bounded record already captures commands, inputs, checkpoints,
  and saves.
- Confirmed the missing layer is still the playback artifact itself:
  - no exposed replay path in the current browser surface,
  - no ghost/share compatibility envelope,
  - no playback divergence report yet.
- This keeps the boundary honest: the recorder is real, but replay remains the
  next contract rather than a shipped product surface.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — verification harness and confidence gates check

- Re-read the verification harness contract and checked the live browser proof
  surface it is meant to organize.
- Confirmed the runtime already exposes the needed evidence hooks:
  - `window.getPerformanceSnapshot()`
  - `window.getRunRecordVerification()`
- Confirmed the current runtime metrics are already being surfaced in the live
  browser state, alongside a clean run-record verification result.
- The missing layer is still the canonical capture bundle and tiered evidence
  summary the contract names.
- This keeps the harness in the right role: it organizes real evidence, but it
  is not yet the finished cross-contract capture package.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — ECS threshold and composition readiness check

- Re-read the ECS threshold contract and checked the current runtime scale.
- Live browser evidence shows a small explicit composition surface:
  - 3 rigs
  - 7 authored sites
  - 1 discovery
  - 0 furrows in the current snapshot
- The implementation matches that scale with explicit profiles, sites, and
  bounded world-memory sets rather than a broad entity zoo.
- ECS therefore remains a future threshold decision, not a current
  architecture requirement.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — culling and LOD spike-test boundary check

- Re-read the culling/LOD spike-test contract and checked the current renderer
  posture against live metrics.
- Confirmed the renderer is intentionally using a first-pass visibility budget:
  - repeated props are instanced,
  - prop rebuilds stay inside a fixed local radius,
  - some meshes explicitly disable automatic frustum culling for stable
    presentation.
- Confirmed the live browser profile remains compact:
  - about 78 draw calls,
  - about 105k triangles,
  - first-controllable and first-input-ready metrics are still tracked.
- The missing layer is still the formal spike-test harness that would prove
  culling and distance-LOD behavior against deterministic fixture scenes.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — physics quality envelope check

- Re-read the physics quality contract, then checked the live physics posture
  and HUD readouts.
- Confirmed the current runtime is still compact and measurable:
  - about 78 draw calls,
  - about 105k triangles,
  - first-controllable and first-input-ready metrics are tracked separately.
- Confirmed the HUD already surfaces the player's physics state directly:
  - `Grip`
  - `82%`
  - `100%`
  - a prompt summarizing the current action context
- Confirmed the code path already exposes the core physics factors
  (`grounded`, `hover`, `slip`, `waterDepth`, `stalled`, condition, strain),
  but not a formal stability-state policy with explicit fallback semantics.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — world and architecture scalability boundary check

- Re-read the world and architecture scalability contract and sampled the live
  browser profile again.
- Confirmed the current runtime is still intentionally compact:
  - 3 rigs
  - 7 authored sites
  - 1 discovery
  - 0 furrows in the sampled state
- Confirmed the code still uses a bounded world disc and bounded runtime memory
  rather than a streaming region/chunk system:
  - `WORLD_RADIUS = 250`
  - `WORLD_LIMIT = 246`
  - `MAX_FELLED = 1500`
  - `MAX_COLLECTED_NODES = 2500`
- The missing layer remains policy, not proof:
  - chunk/region lifecycle,
  - load/unload rules,
  - growth-pressure observability,
  - pack activation rollback,
  - future shared-state readiness.
- This keeps the scalability lane honest: local growth is real, but broader
  scale is still a future-gated boundary rather than a live implementation.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — streaming residency boundary check

- Re-read the streaming world manifest/residency contract against the current
  repo state.
- Confirmed the repo is still built around one canonical world object and one
  save payload:
  - one `GameWorld` with terrain, obstacles, and exploration memory
  - one `GameState` saved/restored together with world memory
  - one authored disc world and one authored site set
- Confirmed the live browser surface still behaves like a single residency, not
  a region-manifest manager.
- The missing layer remains the same policy family named by the contract:
  - chunk/region manifest,
  - residency states,
  - validation before activation,
  - active-budget counters,
  - unload/rollback rules,
  - churn observability.
- This preserves the intended progression: scale the current world cleanly
  before adding a second truth source.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — simulation layers and resource governance check

- Re-read the simulation layers and resource governance contract and sampled
  the live browser surface again.
- Confirmed the current browser status is still healthy:
  - `Rigs Unbound — Field 02`
  - zero console logs in the status snapshot
- Confirmed the runtime already behaves like a layered sim:
  - deterministic kernel
  - terrain / physics / collision separation
  - bounded world memory
  - performance metrics
  - renderer feedback separated from state ownership
- The missing layer is still the explicit governance contract:
  - domain-order table,
  - budget ledger,
  - fallback priority,
  - downgrade reason reporting.
- This keeps the meaning honest: the architecture is layered today, but the
  governance rules are still implicit and should stay named until they are
  formalized.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — resource budget and fallback envelope check

- Re-read the resource budget and fallback envelope contract and the runtime
  performance wiring.
- Confirmed the live app is still exposing measurable pressure fields:
  - frame timing
  - draw calls
  - triangle count
  - heap use
  - load duration
  - first-controllable time
  - save size
- Confirmed the browser surface is healthy and still named `Rigs Unbound —
  Field 02` in the current daemon snapshot.
- The missing layer is still the policy envelope:
  - cross-system budget ledger,
  - explicit fallback profile,
  - pre-overload fallback test,
  - operator-visible oversubscription summary,
  - subsystem attribution for the fallback.
- This keeps the contract honest: the game can measure cost today, but the
  fallback behavior is not yet a first-class policy.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — camera feel contract check

- Re-read the camera feel contract and traced the current camera runtime path.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime camera system already includes the contract’s key
  ingredients:
  - named modes and switching,
  - profile-driven offsets,
  - terrain obstruction pull-in,
  - speed-based FOV expansion,
  - reduced-motion clamping,
  - telemetry hooks for camera-feel evidence.
- The missing layer is still the explicit policy artifact:
  - transition reason table,
  - operator-visible policy summary,
  - separate formal camera-policy schema.
- This keeps the distinction honest: camera feel is implemented, but the policy
  contract is still implicit and should stay named until formalized.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — visibility stage and LOD contract check

- Re-read the visibility stage and LOD contract and the renderer code that
  implements the current visibility budget.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the renderer already behaves like a first-pass visibility budget:
  - single terrain mesh
  - instanced props and furrows
  - local prop rebuilds around the rig
  - `frustumCulled = false` on presentation pieces that currently need it
  - performance metrics for draw calls and triangles
- The missing layer is still the formal policy surface:
  - explicit visibility tiers,
  - missed-cull / residency churn counters,
  - downgrade/readability regression test for non-geometry LOD.
- This keeps the distinction honest: visibility behavior is real, but the
  policy contract is still implicit and should stay named until formalized.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — renderer performance and accessibility smoke-test check

- Re-read the public smoke-test renderer/performance/accessibility contract and
  the runtime wiring that supports it.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already exposes the key evidence surfaces the contract
  expects:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.selectCamera()`
  - an accessible DOM shell with the playable canvas as the focus target after
    the intro is dismissed
- The missing layer is still the fully bundled public-gate artifact:
  - one capture bundle,
  - one named fallback summary,
  - one rendered comparison artifact binding matrix/checklist/KPI evidence.
- This keeps the smoke-test gate honest: observable today, but still not yet
  packaged as the final public acceptance bundle.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — replay artifact and ghost contract check

- Re-read the replay artifact and ghost contract and traced the bounded run
  record path.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the code already proves the bounded record is real:
  - versioned seed-backed record creation,
  - command/input/checkpoint/save entry capture,
  - schema and seed verification,
  - exposed browser hooks for record and verification.
- The missing layer is still the first-class playback artifact:
  - no exposed playback path,
  - no ghost share/compatibility envelope,
  - no replay divergence report,
  - no trust-classification split between diagnostics-only and replay-safe data.
- This keeps the contract honest: audit logging exists, but replay/ghost product
  behavior is still future work.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — authority model groundwork check

- Re-read the authority model groundwork contract and the local-first runtime
  state/persistence path.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the code already proves the local-first authority posture:
  - explicit command capture in `src/main.ts`
  - deterministic kernel mutation in `src/game/state.ts`
  - versioned local save/recovery in `src/game/storage.ts`
  - clean fallback when a local record is incompatible
- The missing layer is still the first-class authority contract:
  - authenticated request/response shapes,
  - reject-path state separation,
  - durable-value recovery metadata,
  - authoritative outcome telemetry,
  - shared-state/server-authoritative boundary artifact.
- This keeps the boundary honest: local authority is real today, while shared
  authority remains future-gated instead of assumed.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — accessibility and input contract check

- Re-read the accessibility and input contract alongside the runtime input and
  accessibility evidence.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime now supports the contract’s base claims:
  - device-neutral named actions in `src/game/input.ts`
  - keyboard and gamepad feeding the same action model
  - touch/button controls routing into the same tap/hold semantics
  - reduced-motion behavior present in renderer/feedback paths
  - skip-link/focus gap closed in the live accessibility recheck
- The missing layer is still the policy surface:
  - persisted remaps,
  - visible input/accessibility profile state,
  - comfort policy for motion and contrast,
  - parity statement for intentionally unsupported differences.
- This keeps the distinction honest: the shell is operable today, but the
  explicit accessibility/input policy is still not fully formalized.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — web loading and profile bootstrap check

- Re-read the web loading and profile bootstrap contract and the browser
  startup wiring.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the current implementation already avoids the dead-black-box risk:
  - `welcome-panel` is a real startup shell
  - `saveStatus` is populated immediately from the load result
  - entering the world dismisses the shell and focuses the canvas
- The missing layer is still the explicit bootstrap policy:
  - no real profile-selection UI,
  - no visible loading progress meter,
  - no distinct fallback-preview state,
  - no measured profile-selection outcome visible to the user.
- This keeps the boundary honest: loading is visible today, but the bootstrap
  policy remains mostly implicit rather than fully packaged.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — runtime instrumentation KPI check

- Re-read the runtime instrumentation KPI note and the performance snapshot
  implementation.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already exposes the KPI vocabulary the note names:
  - `PerformanceMonitor.snapshot()`
  - `window.getPerformanceSnapshot()`
  - HUD-visible fps/draw-call/heap/save-status values
- The missing layer is still the operational bundle:
  - repeatable profile comparison artifact,
  - readable operator summary per profile/fixture pair,
  - fallback/degrade summary tied to the fixture,
  - screenshot or frame capture bound to the metrics.
- This keeps the KPI note honest: the numbers are visible today, but the
  packaged comparison evidence is still implicit rather than finished.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — threshold fixture baseline and capture-selection check

- Re-read the threshold fixture baseline and capture-selection protocol.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the current runtime still fits the canonical comparison shape:
  - one compact world,
  - one active loop,
  - visible renderer metrics,
  - reduced-motion / mobile-safe behavior already present.
- Confirmed the baseline fixture categories remain the right explanatory set:
  - near-field dense scene,
  - occluded / hidden scene,
  - distance-gradient scene,
  - pressure scene,
  - reduced-motion comparison scene.
- The missing layer is still the packaged capture bundle:
  - fixture,
  - metrics capture,
  - screenshot/frame capture,
  - operator note,
  - threshold state.
- This keeps the comparison scaffolding honest: the selection rules are real,
  but the long-term capture set they point to is still not finished.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — physics readability and speed contract check

- Re-read the physics readability and speed contract and the shared perception
  frame implementation.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already implements the contract’s core behavior:
  - authoritative motion in `src/game/physics.ts`
  - shared perception frame in `src/game/feedback.ts`
  - camera/body/speed presentation in `src/game/renderer.ts`
  - readable HUD values in `src/main.ts`
- Confirmed the runtime already exposes the intended readable signals:
  - grip/slip/stall semantics
  - body roll and pitch offsets
  - camera anticipation
  - speed-driven FOV expansion
  - reduced-motion suppression of presentation exaggeration
- The missing layer is still the policy/evidence bundle:
  - named readable-speed regression capture,
  - summary of whether the change comes from speed, terrain, or traction,
  - canonical proof cues for higher-speed readability.
- This keeps the contract honest: the game is already readable at speed, but
  the explicit policy/evidence layer remains implicit rather than fully named.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — rendering potential and economy check

- Re-read the rendering potential and economy note and the renderer/performance
  surfaces.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already exposes the budget economy the note describes:
  - Three.js canonical rendering path
  - instanced repeated world items
  - radius-bounded prop drawing
  - `PerformanceMonitor` and `window.getPerformanceSnapshot()`
  - HUD-level frame health through save status and fps
- Confirmed the renderer already follows the recommended spend order:
  - protect camera response and nearby readability first
  - maintain terrain/obstacle fidelity around the active rig
  - bound distant props and decorative density
- The missing layer is still the packaged comparison artifact:
  - repeatable capture bundle,
  - operator note for what changed under pressure,
  - screenshot/frame capture tied to metrics,
  - baseline promotion path for explanatory captures.
- This keeps the frame-budget companion honest: the spending model is visible
  today, but the reusable comparison set is still not finished.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — asset authority and shipped mesh contract check

- Re-read the asset authority and mesh contract and the provenance/runtime
  evidence it depends on.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the current runtime is still asset-light and procedural:
  - zero texture assets and zero asset provenance obligations for the current
    terrain pass in `src/game/renderer.ts`
  - authored/procedural terrain and instanced props in the live field
  - provenance register still classifies the tractor references as concept/
    reference only, not approved shipped runtime assets
  - runtime asset manifest remains the next durable step once imported art enters
    the playable path
- The missing layer is still the promotion bridge:
  - no approved runtime GLB for the tractor/rig path,
  - no manifest entry proving a shipped mesh profile,
  - no browser-loaded imported mesh that has passed the promotion contract.
- This keeps the authority boundary honest: the repo has concepts, provenance,
  and procedural runtime geometry, but not yet a shipped-mesh authority layer.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code,
  doc, and provenance inspection.

## 2026-07-25 — web asset ingest and compression contract check

- Re-read the web asset ingest and compression contract alongside the asset
  pipeline and provenance contract.
- Confirmed the live browser surface is still `Rigs Unbound — Physics Lab 01`,
  with zero console logs in the current daemon snapshot.
- Confirmed the runtime is still asset-light and procedural:
  - terrain readability comes from authored geometry and vertex colours in
    `src/game/renderer.ts`
  - no imported runtime GLB/FBX/texture manifest is active in the playable path
    yet
  - provenance work remains in concept/reference and source-library notes
- The missing layer is still the manifest bridge:
  - no versioned runtime asset manifest is being consumed by the browser yet
  - no imported asset has crossed the activation gate in the playable path
  - compression remains a future runtime concern, not a live browser policy
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — loading and profile bootstrap contract recheck

- Re-read the loading/bootstrap contract and the profile matrix after the fresh
  browser snapshot.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Physics Lab 01`, with zero console logs in the current daemon
  snapshot.
- Confirmed the bootstrap shell is doing the right basic job:
  - the app is not a dead black box,
  - the shell stays visible until entry,
  - the canvas becomes the interactive landing point after activation.
- The remaining gap is still policy-level rather than survival-level:
  - no explicit loading progress meter,
  - no separate fallback-preview state,
  - no runtime-visible profile chooser or measured profile-selection outcome.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — threshold fixture and capture-selection recheck

- Re-read the threshold fixture baseline and capture-selection protocol after
  the fresh browser snapshot.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still fits the existing canonical comparison shape:
  - bounded world,
  - active simulation loop,
  - visibility and accessibility hooks,
  - reduced-motion behavior already present.
- The missing layer is still the packaged comparison bundle:
  - one representative capture per fixture,
  - metrics capture bound to the frame,
  - operator note and threshold state in one reusable artifact.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — smoke-test gate recheck

- Re-read the renderer/performance/accessibility smoke-test contract against
  the current browser daemon snapshot.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still exposes the gate’s required evidence surface:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.selectCamera()`
  - accessible canvas landing after intro dismissal
- The missing layer is still the bundled public-gate artifact:
  - no packaged capture bundle,
  - no single artifact binding checklist, profile matrix, and KPI evidence,
  - no reusable pass/fail summary for fallback events.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — culling and LOD spike-test recheck

- Re-read the culling and LOD spike-test contract against the current browser
  daemon snapshot.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still behaves like a deliberate visibility-budget scene:
  - instanced repeated props,
  - radius-bounded prop rebuilds,
  - terrain and the active play space remain the main visible workload.
- The missing layer is still the formal spike harness:
  - one deterministic fixture bundle,
  - one occluded/hidden scene,
  - one distance-gradient scene,
  - one pressure scene,
  - repeatable capture + metrics artifact for comparison over time.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — risk and public-readiness register recheck

- Re-read the risk and public-readiness register against the current browser
  daemon snapshot and live repo contracts.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the current runtime still fits the conservative solo-lab posture:
  - bounded playable loop,
  - deterministic local simulation,
  - readable HUD/state surfaces,
  - no evidence of public chat, trade, UGC, or cash-linked systems in the live
    path.
- The higher-risk public branches remain future-gated:
  - multiplayer authority,
  - economy/trading,
  - public UGC and moderation,
  - social identity and child-safety obligations,
  - account recovery and public operator support surfaces.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — authority-groundwork contract recheck

- Re-read the authority-groundwork contract against the current browser daemon
  snapshot.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still supports the local-first authority posture:
  - explicit command capture,
  - deterministic canonical state mutation,
  - local save/restore with recovery metadata,
  - clean failure for invalid local records.
- The missing layer is still the shared-state authority contract:
  - authenticated request/response shapes,
  - explicit reject-path separation,
  - durable-value recovery metadata as policy,
  - authoritative outcome telemetry,
  - visible shared-state/server-authoritative boundary.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — command/state separation decision recheck

- Re-read ADR-0011 against the current browser daemon snapshot and live repo
  state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the current implementation still follows the intended local spine:
  - command capture is explicit,
  - deterministic kernel mutation owns durable state,
  - presentation reacts from snapshot/render state,
  - capability admission and affordance rejection are real.
- The missing layer is still the structured contract envelope:
  - request/response objects,
  - versioned reason codes,
  - distinct telemetry for accept/reject/defer,
  - explicit speculative-vs-durable state boundary.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — behavior/planner contract recheck

- Re-read the behavior/planner contract against the current browser daemon
  snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the current runtime still supports the local command/state spine:
  - explicit command capture,
  - deterministic kernel stepping,
  - snapshot-driven presentation,
  - bounded run-record history with command/checkpoint/input/save entries.
- The missing layer is still the named planner envelope:
  - versioned behavior schema,
  - deterministic candidate ordering,
  - branch-selection / branch-rejection telemetry,
  - fixed thinking budget,
  - read-only contract that prevents direct state mutation.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — world-affordance resolution contract recheck

- Re-read the world-affordance resolution contract against the current browser
  daemon snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already proves world/capability mismatches are real:
  - selecting `toy-buggy` and invoking blade logic still yields the deterministic
    denial `Spark carries no blade. Torque does.`
- The missing layer is still the reusable resolver envelope:
  - explicit legal / deferred / impossible outcome codes,
  - structured rejection record naming the mismatch side,
  - shared resolver entry point for behavior and activities.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — authoring and reproducible content validation recheck

- Re-read the authoring and reproducible content validation contract against the
  current browser daemon snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already validates content before acceptance:
  - state/load paths reject bad or incompatible records,
  - the content model remains data-driven,
  - modules/world definitions already have explicit identities.
- The missing layer is still the reproducible authoring envelope:
  - versioned content-manifest schemas,
  - validator-first rejection tests,
  - reproducible validation result artifacts,
  - runtime-ready vs validation-only status,
  - provenance/source metadata that survives authoring.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — asset provenance and pipeline recheck

- Re-read the asset provenance register and asset pipeline contract against the
  current browser daemon snapshot and repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the project still has the right provenance posture:
  - concept/reference images are registered with hashes and intended-use notes,
  - the private Kenney library is documented as a source library,
  - runtime remains asset-light and procedurally authored.
- The missing layer is still the runtime bridge:
  - no imported runtime asset has become the durable truth source yet,
  - no approved runtime manifest has replaced reference-only status,
  - no public reuse decision has been elevated into a shipped asset path.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code,
  provenance, and doc inspection.

## 2026-07-25 — modding and creator-pack validation recheck

- Re-read the modding and creator-pack validation contract against the current
  browser daemon snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still supports the right underlying posture for packs:
  - data-driven world and rig content,
  - load-time validation and migration,
  - provenance and asset validation contracts already named elsewhere.
- The missing layer is still the pack lifecycle:
  - versioned pack manifest,
  - explicit dependencies,
  - safe disable/rollback behavior,
  - staged publication/moderation flow,
  - a hard boundary keeping packs out of runtime authority.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — creator-pack publication boundary recheck

- Re-read the modding contract and the public evidence surfaces ADR against the
  current browser daemon snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still supports local validated content growth:
  - creator packs remain data-first,
  - load-time validation and migration are still the boundary,
  - safe disable / rollback remains the future behavior.
- The missing layer is still the public publication side:
  - no published pack route,
  - no moderated public pack workflow,
  - no public creator-discovery surface,
  - no pack lifecycle that would treat packs as shared public evidence.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — public evidence/share-route recheck

- Re-read ADR-0004 against the current browser daemon snapshot and live repo
  state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- A source search of `src/` did not reveal any live share/public object route
  family, so the proposed URL shapes remain decision-level only.
- The runtime is still treating public evidence as future-facing:
  - no publication workflow,
  - no moderation queue,
  - no canonical share route family in the playable path.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  repo search inspection.

## 2026-07-25 — replay artifact and ghost contract recheck

- Re-read the replay contract against the current browser daemon snapshot and
  live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still exposes the bounded record surface:
  - `window.getRunRecord()`
  - `window.getRunRecordVerification()`
  - command, input, checkpoint, and save entries in the versioned record
- The missing layer is still the replay artifact surface:
  - no exposed playback path in the browser,
  - no ghost share/compatibility envelope,
  - no divergence report from replay execution,
  - no trust-classification split between diagnostics-only and replay-safe
    data.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — event graph and deterministic handlers recheck

- Re-read the event-graph contract against the current browser daemon snapshot
  and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already emits meaningful outcomes:
  - commands with names and payloads,
  - checkpoints with stable state hashes,
  - saves with schema/version metadata,
  - user-facing toasts/status surfaces,
  - input transitions in the bounded run record.
- The missing layer is still the named event graph:
  - no explicit versioned event envelope,
  - no origin-domain ownership field in a shared event contract,
  - no replayable vs diagnostics-only split,
  - no deduplication/ordering policy as a first-class boundary.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — kernel ordering and mutable subsystem gates recheck

- Re-read the kernel-ordering contract against the current browser daemon
  snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still proves the core kernel boundary:
  - `src/game/state.ts` owns the fixed-step orchestration and canonical mutation
    order,
  - `src/game/renderer.ts` remains presentation-only,
  - `src/main.ts` captures commands and routes user intent into the kernel,
  - replay-sensitive state remains visible through the bounded run-record lane.
- The missing layer is still the named gate table:
  - no explicit subsystem read/write authority matrix,
  - no replay-safe event emission point per mutable subsystem,
  - no kernel-stage telemetry field,
  - no documented renderer-only versus kernel-only enforcement surface.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — collision category and mask contract recheck

- Re-read the collision-category contract against the current browser daemon
  snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already has a real deterministic collision path:
  - `src/game/collision.ts` resolves obstacle contact with role-aware tree vs
    rock behavior,
  - `src/game/state.ts` consumes that outcome after motion and applies the
    consequences,
  - the current obstacle model already distinguishes blocking, fellable, and
    sliding responses.
- The missing layer is still the explicit interaction matrix:
  - no first-class category/mask table for ground, obstacle, hazard, trigger,
    projectile, sensor, and decorative roles,
  - no dedicated trigger/sensor contact semantics,
  - no telemetry for unexpected or incompatible pairs,
  - no documented fallback for unknown roles.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — resource budget and fallback envelope recheck

- Re-read the resource-budget contract against the current browser daemon
  snapshot and live repo state.
- Confirmed the live app is still `Rigs Unbound — Field 02`, and the browser
  daemon is healthy with zero console logs in the current status snapshot.
- Confirmed the runtime already exposes the measurement fields through
  `PerformanceMonitor.snapshot()` and `window.getPerformanceSnapshot()`:
  - frame timing,
  - draw calls,
  - triangle count,
  - heap use,
  - load duration,
  - first-controllable time,
  - save size.
- The missing layer is still the explicit fallback policy:
  - no cross-system budget ledger,
  - no explicit low-budget fallback profile,
  - no test proving fallback before overload,
  - no operator-visible summary naming the oversubscribed resource.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — save and migration observability continuation

- Continued the 3D-game analysis lane using the `3d-games` skill and re-read
  the live persistence path before documenting anything new.
- Confirmed the save spine is already durable:
  - `src/game/storage.ts` uses versioned save keys and recovery branches.
  - `src/main.ts` records save activity into the run record and exposes
    `window.getRunRecordVerification()`.
  - `src/game/run-record.ts` keeps checkpoint hashes and monotonic timing
    checks.
- Appended a new addendum to
  `docs/research/SAVE_AND_MIGRATION_OBSERVABILITY_CONTRACT_2026-07-25.md`
  clarifying that the persistence lane is observable but still missing a named
  reason-code / source-version envelope.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — capability contract formalization continuation

- Extended the same 3D-game analysis pass into the capability-contract lane
  from the execution roadmap.
- Confirmed the runtime already composes capability claims from rig profiles and
  fitted modules:
  - `src/game/contracts.ts` holds the capability vocabulary and profile
    composition.
  - `src/game/state.ts` gates actions through `hasCapability(...)` and
    `effectiveProfile(...)`.
- Appended a new addendum to
  `docs/research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md`
  clarifying that composition is live while adapter governance remains implicit.
- Evidence depth: Tier 1 static inspection.
- Runtime state during this note: browser daemon still healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — second locomotion continuity continuation

- Continued the same analysis run into the second-locomotion-family contract.
- Confirmed the runtime already has a real hover family:
  - `src/game/contracts.ts` defines `marsh-skimmer` with `mobilityAdapter:
    "hover"`.
  - `src/game/state.ts` and `src/main.ts` route that family through the same
    world, camera, save, and recovery spine.
- Appended a new addendum to
  `docs/research/SECOND_LOCOMOTION_FAMILY_AND_CROSS_MODE_CONTINUITY_CONTRACT_2026-07-25.md`
  clarifying that the family is live while the explicit continuity proof remains
  partial.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — authority model groundwork continuation

- Continued the analysis run into the authority-model lane from the roadmap.
- Rechecked the current runtime posture against the contract:
  - `src/main.ts` still captures commands explicitly,
  - `src/game/state.ts` still owns deterministic canonical mutation,
  - `src/game/storage.ts` still recovers or replaces invalid local records
    without treating them as truth.
- Appended a new addendum to
  `docs/research/AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md`
  clarifying that local-first authority is the current mode, while the
  shared-state/server-authoritative envelope remains future-gated.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — event graph / deterministic handlers continuation

- Continued the analysis run into the event-graph lane from the roadmap.
- Confirmed the runtime already records a meaningful history surface:
  - `src/main.ts` records commands and checkpoints into the bounded run record,
  - `src/game/run-record.ts` verifies monotonic timing and checkpoint hashes,
  - the browser surface exposes both `window.getRunRecord()` and
    `window.getRunRecordVerification()`.
- Appended a new addendum to
  `docs/research/EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md`
  clarifying that command/checkpoint/save history is real while the event
  envelope remains implicit.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — minimap and world-coordinate continuation

- Continued the same analysis run into the minimap/world-coordinate lane.
- Confirmed the current field map already acts as a real coordinate audit:
  - `src/game/minimap.ts` samples canonical terrain once and reuses it for
    surveyed reveal,
  - the map uses `GameWorld.surveyedCells` plus world `x/z` coordinates for
    sites, salvage, cargo, and the active rig,
  - `src/main.ts` keeps the surveyed percentage visible in the HUD.
- Appended a new addendum to
  `docs/research/MINIMAP_AND_WORLD_COORDINATE_CONTRACT_2026-07-25.md`
  clarifying that the map is already meaningful while the explicit
  round-trip/world-frame contract remains partial.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — physics quality envelope continuation

- Continued the 3D-game analysis run into the physics-quality lane from the
  roadmap.
- Rechecked the runtime and confirmed the physics layer is already observable
  rather than opaque:
  - `src/main.ts` renders condition, grip, slope/grade, stall, water-depth, and
    mobility-family readouts in the HUD.
  - `src/game/performance.ts` and `window.getPerformanceSnapshot()` expose the
    measurement surface for frame timing, draw calls, triangles, heap use, load
    duration, and first-controllable timing.
- Appended a new addendum to
  `docs/research/PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md`
  clarifying that the physics signals are live while the formal stability
  envelope remains implicit.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — shader and material strategy continuation

- Continued the 3D-game analysis run into the shader/material lane from the
  roadmap.
- Rechecked the renderer and world data paths against the contract:
  - `src/game/renderer.ts` already uses standard materials, vertex-color
    terrain, phase-based fog/sky changes, and readability cues such as dust and
    rust,
  - `src/game/world.ts` and `src/game/terrain.ts` already supply the data-driven
    surface identity that the renderer consumes.
- Appended a new addendum to
  `docs/research/SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md`
  clarifying that the visual language is already real while the layered
  material envelope remains implicit.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — lighting and atmosphere strategy continuation

- Continued the same analysis run into the lighting/atmosphere lane from the
  roadmap.
- Rechecked the renderer and HUD against the contract:
  - `src/game/renderer.ts` already stages a directional sun, hemisphere light,
    phase-based fog/sky shifts, blob-shadows, and headlights for gloam/night,
  - `src/main.ts` already exposes world phase in the HUD, so the lighting
    posture is visible to the player.
- Appended a new addendum to
  `docs/research/LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md`
  clarifying that the lighting strategy is live but still implicit rather than
  contract-shaped.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — verification harness and confidence gates continuation

- Continued the 3D-game analysis run into the verification-harness lane.
- Rechecked the live proof surface against the contract:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.getRunRecordVerification()`
  - the browser daemon is still healthy on the live field surface
- Noted that fresh review-image assets already exist in the worktree, so the
  harness now has real capture candidates rather than just policy text.
- Appended a new addendum to
  `docs/research/VERIFICATION_HARNESS_AND_CONFIDENCE_GATES_CONTRACT_2026-07-25.md`
  clarifying that the proof surface is real while the canonical bundle and
  confidence transition rule remain unnamed.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — renderer performance and accessibility smoke-test continuation

- Continued the same analysis run into the renderer/performance/accessibility
  smoke-test lane.
- Rechecked the live evidence surface against the contract:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.selectCamera()`
  - `window.getCameraResolutionEvidence()`
- Confirmed the browser entry point still keeps the accessibility shell intact
  after intro dismissal and that the current daemon snapshot remains healthy on
  `Rigs Unbound — Field 02`.
- Appended a new addendum to
  `docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md`
  clarifying that the smoke-test gate is observable while the packaged public
  bundle is still missing.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — performance and readability baseline continuation

- Continued the 3D-game analysis run into the umbrella performance/readability
  baseline lane.
- Rechecked the live runtime evidence behind the umbrella policy:
  - culling and LOD are named and observable,
  - camera modes and reduced-motion behavior are real,
  - collision, lighting, shader/material, physics, and performance lanes already
    have live evidence behind them,
  - `window.getPerformanceSnapshot()`, `window.selectCamera()`, and
    `window.render_game_to_text()` expose the pressure signals the baseline
    would read.
- Appended a new addendum to
  `docs/research/PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md`
  clarifying that the component contracts are real while the single umbrella
  budget surface is still missing.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — runtime instrumentation KPI continuation

- Continued the 3D-game analysis run into the runtime-instrumentation KPI lane.
- Rechecked the live metrics surface behind the contract:
  - `src/game/performance.ts` already exposes frame timing, draw calls,
    triangle count, heap use, load duration, first-controllable time,
    first-input-ready time, save size, and terrain build time,
  - `src/main.ts` already forwards that snapshot into the live browser surface
    and HUD summary.
- Appended a new addendum to
  `docs/research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md`
  clarifying that the metrics are surfaced while the canonical comparison
  bundle remains implicit.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — threshold fixture and capture-selection continuation

- Continued the 3D-game analysis run into the threshold-fixture / capture-
  selection lanes.
- Rechecked the live runtime and the on-disk capture candidates against the
  contract:
  - `docs/reviews/assets/field-02-front-forward.png`
  - `docs/reviews/assets/field-02-top-down.png`
  - `docs/reviews/assets/rig-lab-01-desktop.png`
  - `docs/reviews/assets/rig-lab-01-narrow.png`
- Appended new addenda to both
  `docs/research/THRESHOLD_FIXTURE_BASELINE_2026-07-25.md` and
  `docs/research/THRESHOLD_CAPTURE_SELECTION_PROTOCOL_2026-07-25.md`
  clarifying that the fixture categories and selection table already match the
  runtime, while the promoted comparison bundle is still missing.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — culling and LOD spike-test continuation

- Continued the 3D-game analysis run into the culling/LOD spike-test lane.
- Rechecked the live renderer evidence behind the contract:
  - repeated props are instanced,
  - prop rebuilds remain bounded to a local radius,
  - some meshes intentionally disable automatic frustum culling for stable
    presentation,
  - `src/game/renderer.ts` and `src/main.ts` already expose draw-call,
    triangle, and timing metrics plus text and performance snapshots.
- Appended a new addendum to
  `docs/research/CULLING_LOD_SPIKE_TESTS_2026-07-25.md`
  clarifying that the visibility budget is real while the formal spike harness
  and reusable proof bundle are still missing.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

---WORKLOG APPEND---
## 2026-07-25 — accessibility loading explicitness recheck

- Re-checked the live Field 02 runtime with the accessibility-auditor lane.
- The original keyboard/focus gap remains closed:
  - `#game-canvas` is keyboard focusable,
  - the skip link is present,
  - dismissing the intro now lands focus on `canvas#game-canvas`,
  - semantic landmarks are still present in the shell.
- The remaining accessibility-adjacent question is startup explicitness:
  - no explicit progress element,
  - no visible `aria-busy` indicator in the current DOM snapshot,
  - no public loading/profile percentage in the shell.
- That makes the next improvement a loader/boot affordance question, not a basic keyboard-accessibility repair.

## 2026-07-25 — asset-production import-proof recheck

- Re-checked the live Field 02 runtime with the `3d-asset-production` lane.
- The browser daemon still reports zero console logs and the active surface is
  still `Rigs Unbound — Field 02`.
- The manifest/preflight boundary is still the correct long-term asset gate:
  - `assets/asset-manifest.json` remains the canonical registry,
  - the runtime still separates source/provenance from runtime derivative,
  - provenance and rights metadata remain part of the asset story.
- The current runtime still does not consume an imported asset package in the
  playable path:
  - no GLB/texture/audio derivative is active yet,
  - no runtime activation record exists for a validated asset key,
  - the procedural terrain/prop path is still the live browser truth.
- The next durable asset milestone remains a browser import and activation
  proof, not a broader art import.

## 2026-07-26 — capability-composition recheck

- Re-checked the current source contract lane with the `3d-games` skill.
- `src/game/contracts.ts` still shows the runtime is composition-first:
  - `RigCapability` is a real domain type,
  - `RIG_PROFILES` carries explicit capability arrays,
  - `marsh-skimmer` remains a distinct hover-family profile.
- The current gameplay boundary is still implicit governance, not a formal
  adapter registry:
  - capability admission is handled at runtime,
  - failed actions still surface prose diagnostics,
  - the next durable step is structured capability definitions plus explicit
    reason codes.

## 2026-07-26 — physics and collision policy recheck

- Re-checked the live motion stack with the `3d-games` skill.
- `src/game/terrain-traversal.ts` now makes the shared terrain-face refusal
  explicit in code:
  - swept support-edge probes reject discontinuous faces,
  - the refusal returns `terrain-face`,
  - ground and hover adapters use the same boundary with different support
    thresholds.
- `src/game/physics.ts` consumes that boundary as a real motion outcome field,
  so the runtime already knows when a move was refused for terrain-face
  reasons.
- `src/game/collision.ts` still only needs the narrow obstacle roles the live
  game uses today:
  - trees can be felled,
  - rocks block and slide,
  - the field remains deterministic and role-aware.
- The remaining gap is still policy surface, not raw behavior:
  - no named physics envelope state,
  - no first-class collision category/mask table,
  - no trigger/sensor/projectile/hazard policy layer yet.

## 2026-07-26 — lighting and atmosphere policy recheck

- Re-checked the live renderer and HUD against the `3d-games` skill.
- `src/game/renderer.ts` already drives lighting by world phase:
  - directional sun and hemisphere light for the base model,
  - day/gloam/night switching for sky colour, fog, and headlight intensity,
  - blob shadows as the low-cost fallback posture.
- `src/main.ts` already exposes the active world phase in the HUD, so lighting
  context is visible to the player rather than only buried in renderer code.
- The remaining gap is policy naming, not behavior:
  - no tier matrix surfaced as contract data,
  - no explicit operator/debug field naming the active lighting strategy,
  - no formal rule for when atmosphere should simplify before readability is
    at risk.

## 2026-07-26 — world affordance resolution recheck

- Re-checked the live world/capability surface with the `3d-games` skill.
- `src/game/world.ts` still exposes real authored offers through site verbs and
  workshop/service areas.
- `src/game/state.ts` still resolves those offers through capability checks, so
  the world/capability mismatch is not hypothetical.
- The live runtime still emits a direct denial string rather than a structured
  resolver record.
- The remaining gap is the same one named in the contract:
  - no legal / deferred / impossible outcome envelope,
  - no structured mismatch telemetry,
  - no shared resolver entry point for behavior and activities.

## 2026-07-26 — replay artifact recheck

- Re-checked the live replay lane with the `3d-games` skill and browser daemon.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The bounded record spine remains concrete:
  - `schemaVersion`, `seed`, `startedAtMs`, `droppedEntries`,
  - ordered command / input / checkpoint / save entries,
  - checkpoint entries with stable tick hashes.
- `verifyRunRecord()` still passes in the live snapshot, so the record is
  useful as an internal audit and validation log.
- The remaining gap is unchanged:
  - no exposed playback path,
  - no ghost/share compatibility envelope,
  - no divergence report,
  - no diagnostics-vs-replay-safe trust split.

## 2026-07-26 — event graph recheck

- Re-checked the current command/checkpoint/toast/save flow with the
  `3d-games` skill.
- `src/main.ts` still routes outcomes through local command and toast/status
  paths, while `src/game/run-record.ts` keeps the bounded history verifiable.
- That makes the current flow useful for observability and internal validation,
  but still not a first-class shared event graph.
- The remaining gap is unchanged:
  - no versioned shared event envelope,
  - no origin-domain ownership field,
  - no replayable vs diagnostics-only split on the event surface,
  - no explicit deduplication / ordering policy as a contract.

## 2026-07-26 — kernel ordering recheck

- Re-checked the live orchestration boundary with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The kernel boundary is still the real source of truth:
  - `src/game/state.ts` owns the fixed-step orchestration and canonical
    mutation order,
  - `src/game/renderer.ts` remains presentation-only,
  - `src/main.ts` captures commands and routes intent into the kernel,
  - run-record capture keeps replay-sensitive history visible.
- The remaining gap is policy naming, not kernel behavior:
  - no ordered subsystem authority table,
  - no explicit replay-safe event emission point per mutable subsystem,
  - no kernel-stage telemetry field exposed as a first-class boundary,
  - no documented enforcement surface for renderer-only versus kernel-only
    responsibilities.

## 2026-07-26 — save and migration observability recheck

- Re-checked the live persistence lane with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- `src/main.ts` now keeps the HUD save status truthful across fresh/restored/
  migrated/recovered paths, and the persist path still records saves into the
  bounded run record.
- `src/game/storage.ts` still owns the actual load/save branching:
  - versioned keys,
  - migration from older save records,
  - clean replacement for incompatible payloads.
- The remaining gap is still the same contract layer:
  - no structured save/load reason-code field,
  - no versioned persistence-event schema,
  - no source-version metadata as a first-class event field,
  - no operator summary separate from the status string and toast.

## 2026-07-26 — RU-0110 B5–B12 implementation and acceptance

### Scope completed

- Replaced hardcoded hood framing with named Torque/Spark/Drift camera sockets.
- Added one solver-independent camera scene query across terrain, procedural
  obstacles, felled memory, and typed authored Home structures.
- Added immediate camera pull-in, slower recovery, post-smoothing revalidation,
  fallback framing, and mesh-envelope self-intersection evidence.
- Added canonical three-rig Home berths and schema-v6 persistence.
- Added selective v5 migration: only pristine inactive legacy Drift state moves;
  any moved/used/attached player state is preserved.
- Added one swept terrain-face boundary shared by ground and hover adapters,
  including at-rest footprint refusal, high-speed sweep, semantic reason, and
  downhill/reverse escape.
- Removed artificial minimum hover authority on extreme grades.
- Added a pure semantic primary-action resolver consumed by mutation, desktop
  labels, touch labels, aria labels, and browser automation.
- Split public/player persistence status from developer fps/draw-call/heap
  diagnostics; hid Physics Lab navigation on the default player surface while
  retaining explicit developer/evidence surfaces and direct routes.
- Hardened the browser harness with query-gated fixtures, deterministic manual
  stepping, readiness-function navigation, bounded failure cleanup, and
  active-rig assertions before captures.

### Verification evidence

- `npm run format:check` — passed.
- `npm test` — 12 files / 125 root tests passed.
- `npm run test:kernel-probe` — seven tests passed.
- `npm run build` — passed after typecheck; known advisory remains for the
  minified Three.js chunk above 500 kB.
- Field 02 browser acceptance on `4173` — exit code 0, zero captured
  console/page errors.
- Rebuilt production-preview acceptance on `4174` — exit code 0, zero captured
  console/page errors.
- Both browser runs covered player/developer surface boundaries, fresh
  Torque→Spark→Drift proximity acquisition, Home/tree/hood camera resolution,
  three real-terrain face fixtures plus downhill escape, first salvage, cargo
  relay, ramp, deep-water hover, save/reload, keyboard/mouse/touch recovery,
  reduced motion, six views, and `390×844` layout.
- Detailed evidence and caveats:
  `docs/reviews/RU_0110_ACCEPTANCE_2026-07-26.md`.

### Three-pass review

1. **Immediate correctness/completeness:** every B5–B12 finding has a current
   disposition, code path, automated check, and browser evidence. Contradicted
   earlier hood captures remain preserved; validated replacements assert active
   rig identity.
2. **Architecture/long-term viability:** rig identity is dependency-free;
   authored berths/structures have one world-data source; camera and terrain
   queries are solver-independent; ground/hover feel remains adapter-owned;
   action semantics are resolved once rather than copied into UI.
3. **Rule compliance/supervision readiness:** docs, ADRs, exploration map,
   tracker, review artifact, tests, browser evidence, and acceptance caveats are
   synchronized. No duplicate route, renderer-owned world truth, hidden failure,
   or AI co-author attribution was introduced.

### Value delivered

- **Player value:** every advertised rig is reachable immediately; cameras stay
  readable around structures/trees and inside each rig; impossible faces behave
  consistently; controls say what they will do; public HUD is less confusing.
- **Team/project value:** later rigs, GLBs, solvers, activities, and public builds
  reuse typed ports instead of accumulating rig-name patches.
- **Operational value:** migrations preserve player history, acceptance evidence
  identifies exact sources/reasons, developer diagnostics stay available without
  leaking into player presentation, and browser runs terminate predictably.

### Remaining non-blocking hardening

- Clean representative-device performance capture without concurrent
  trailer/browser-daemon GPU load.
- Structured event/reason schemas for action, traversal, and persistence before
  replay/network authority.
- Product decision on compiling acceptance mutation hooks out of public
  production bundles.
- New uncontaminated external-player session for comprehension and feel.

## 2026-07-26 — resource budget and fallback recheck

- Re-checked the live performance lane with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- `src/game/performance.ts` still exposes a rich measurement envelope:
  - frame timing,
  - p95 / average frame times,
  - FPS,
  - draw calls,
  - triangles,
  - heap use,
  - load duration,
  - first-controllable time,
  - save bytes and last save duration.
- `src/main.ts` continues to surface those metrics through the developer/evidence
  readout and `window.getPerformanceSnapshot()`.
- The remaining gap is still policy, not measurement:
  - no cross-system budget ledger,
  - no explicit low-budget fallback profile,
  - no test proving fallback activates before overload,
  - no operator-visible summary naming the oversubscribed resource,
  - no summary field naming the subsystem that caused the fallback.

## 2026-07-26 — authoring validation recheck

- Re-checked the live content-admission lane with the `3d-asset-production`
  skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The repo already has a real asset-specific validation spine:
  - `assets/asset-manifest.json` carries stable ids, source paths, runtime
    paths, status, and rights metadata,
  - `tools/asset-preflight.mjs` validates GLB structure, path safety, and
    missing dependencies,
  - all candidate runtime paths remain out of the playable path until proof
    exists.
- The remaining gap is the general authoring envelope:
  - no versioned content-manifest schema for activities or world modules,
  - no reproducible validation-result artifact for broader authored content,
  - no clean validation-only/runtime-ready/deprecated status signal across the
    general content surface,
  - no reusable authoring contract covering imported, edited, or generated
    content beyond the asset slice.

## 2026-07-26 — world scalability recheck

- Re-checked the live world-memory lane with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- `src/game/gameworld.ts` still models growth as bounded memory sets plus
  terrain deformation:
  - `felledObstacles`
  - `collectedNodes`
  - `surveyedCells`
  - terrain deformation entries
- `snapshot()` and `restore()` keep that memory replayable and recoverable
  through the save system.
- The remaining gap is still the scalability envelope, not the local memory
  substrate:
  - no chunk or region lifecycle policy,
  - no load/unload radius rules,
  - no growth-pressure observability,
  - no pack activation rollback policy,
  - no future shared-state readiness boundary beyond documentation.

## 2026-07-26 — ECS readiness recheck

- Re-checked the live composition lane with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The codebase still expresses composition directly rather than through ECS:
  - `src/game/contracts.ts` composes installed modules onto immutable rig
    blueprints,
  - `src/game/state.ts` keeps rigs, modules, and world state explicit,
  - `src/game/gameworld.ts` keeps world memory as bounded sets and snapshots.
- The live scale remains compact, so there is still no measured pressure that
  justifies an ECS migration threshold.
- The remaining gap is still the threshold contract:
  - no quantified actor-count or coupling trigger,
  - no canonical multi-capability composition schema beyond the current rig
    model,
  - no migration proof that preserves identity through a component-model
    change,
  - no explicit statement that ECS should serve the machine-centric model
    rather than replace it.

## 2026-07-26 — camera policy recheck

- Re-checked the live camera lane with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The camera system is still doing real gameplay work:
  - named modes remain exposed in `src/game/contracts.ts`,
  - `src/main.ts` routes mode selection through commands and checkpoints,
  - `src/game/renderer.ts` resolves obstruction pull-in and speed FOV,
  - reduced-motion clamping remains active in the feedback path,
  - `getCameraResolutionEvidence()` exposes active camera-resolution evidence.
- The remaining gap is still the named policy layer:
  - no camera-policy schema,
  - no explicit transition reason table,
  - no operator-visible camera-policy summary field,
  - no separate persistent camera-policy artifact beyond the save-state camera
    mode.

## 2026-07-26 — visibility and LOD recheck

- Re-checked the live visibility lane with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The current renderer still behaves like a deliberate first-pass visibility
  budget:
  - terrain remains a single mesh derived from the height field,
  - trees, rocks, felled trunks, salvage, and furrows remain instanced,
  - prop rebuilds are still radius-bounded around the rig,
  - presentation pieces such as the sky and dust still opt out of default
    frustum culling when stability matters more than a formal visibility graph,
  - performance hooks still expose draw calls, triangles, and frame timing.
- The remaining gap is still the named policy surface:
  - no visible/local-radius/distant-sim tier matrix,
  - no counters for missed-cull pressure or residency churn,
  - no regression test proving a downgrade tier stays readable rather than
    disappearing into undefined behavior.

## 2026-07-26 — shader/material strategy recheck

- Re-checked the live shader/material lane with the `3d-games` skill and a live
  browser snapshot.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The active material path is still deliberately simple and readable:
  - `src/game/renderer.ts` uses `THREE.MeshStandardMaterial`,
  - terrain uses vertex colors instead of a bespoke layered shader stack,
  - repeated terrain props remain instanced,
  - `src/game/world.ts` and `src/game/terrain.ts` still supply the visual
    vocabulary through data-driven surface, biome, and site definitions.
- The current browser snapshot confirms the field is legible, but the contract
  is still implicit:
  - no layered material schema,
  - no modifier versioning for weather/wear/hazard cues,
  - no operator-visible material-strategy flag.
- The next exploration question is whether the first formal material contract
  should start from terrain transitions, weather feedback, or surface wear.

## 2026-07-26 — performance/readability baseline recheck

- Re-checked the live umbrella performance/readability lane with the
  `3d-games` skill and a live browser snapshot.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The current performance snapshot gives us a real baseline to anchor:
  - `averageFrameMs` is `20.25`,
  - `p95FrameMs` is `21.7`,
  - `framesPerSecond` is `49.4`,
  - `drawCalls` is `73`,
  - `triangles` is `104694`,
  - `terrainBuildMs` is `92.7`,
  - `heapUsedMb` is `29.4`,
  - `firstControllableMs` is `469.2`,
  - `saveBytes` is `2969`.
- These values are a live diagnostic snapshot, not a representative-device
  performance baseline: concurrent browser/trailer GPU activity contaminated
  this session's timing evidence. They may guide the next clean capture but must
  not support a public performance claim.
- The remaining gap is still the umbrella policy surface:
  - no visible within-budget / degraded / fail-soft table,
  - no operator-facing summary that names the exceeded threshold,
  - no single artifact that maps the live numbers back to the specialized
    contracts as one operational policy.
- The next exploration question is how much of that umbrella should be surfaced
  in HUD versus debug tooling versus durable docs.

## 2026-07-26 — minimap/world-coordinate recheck

- Re-checked the live minimap/world-coordinate lane with the `3d-games` skill
  and the current browser snapshot.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The current snapshot confirms the map is still doing real coordinate audit
  work:
  - `surveyedCells` is `19`,
  - `surveyedFraction` is `0.0546`,
  - `discoveries` currently contains `home-silo`,
  - the nearest salvage and authored site list are still presented in world
    coordinates.
- The remaining gap is still the transform boundary:
  - no round-trip world-pixel-world test,
  - no `WorldFrame` / origin-revision record in runtime,
  - no chunk-residency or origin-rebase proof,
  - no diagnostic overlay for route cost, clearance, or capability-aware
    pathing.
- The next exploration question is how to make that map contract survive
  rebasing and richer topologies without losing coordinate identity.

## 2026-07-26 — streaming-world residency recheck

- Re-checked the live streaming-world lane with the `3d-games` skill and the
  current browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The world substrate is still one canonical residency:
  - one `GameWorld`,
  - one `TerrainField`,
  - one obstacle field,
  - one exploration field,
  - one composed save payload in `src/game/storage.ts`.
- The remaining gap is still the streaming contract boundary:
  - no chunk manifest,
  - no residency states,
  - no activate/unload/rollback lifecycle,
  - no active-chunk budget counters,
  - no unload/rollback observability.
- The next exploration question is whether the first streaming proof should be
  authored from world data, region cells, or a hybrid manifest.

## 2026-07-26 — replay artifact and ghost continuity recheck

- Re-checked the live replay lane with the `3d-games` skill and the current
  browser daemon status plus a run-record verification probe.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The live browser surface still exposes:
  - `window.getRunRecord()`
  - `window.getRunRecordVerification()`
- The current verification result remains `ok: true` with no issues.
- The run-record spine is still bounded and versioned:
  - schema version,
  - seed,
  - ordered entries,
  - checkpoint tick hashes,
  - cap-and-trim behavior.
- The remaining gap is still the first-class replay/ghost artifact surface:
  - no exposed playback path,
  - no compatibility envelope,
  - no replay divergence report,
  - no trust split between diagnostics-only and replay-safe output.
- The next exploration question is whether replay should land first as a debug
  validator, a shareable ghost, or a dual-purpose artifact with explicit
  compatibility rules.

## 2026-07-26 — authority model groundwork recheck

- Re-checked the live authority lane with the `3d-games` skill and the current
  browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The live mode remains local-first:
  - `src/main.ts` captures commands as explicit browser-side events,
  - `src/game/state.ts` owns deterministic canonical mutation order,
  - `src/game/storage.ts` saves and restores local state with versioned
    recovery and clean fallback behavior.
- The remaining gap is still the shared-state envelope:
  - no authenticated mutation request/response shape,
  - no explicit reject-path state separation,
  - no durable-value recovery metadata surfaced as policy,
  - no telemetry for authoritative outcomes,
  - no visible shared-state/server-authoritative boundary artifact.
- The next exploration question is which authority-shaped proof should come
  first once a shared-state feature is actually needed: save, repair, or module
  install.

## 2026-07-26 — simulation layers and resource governance recheck

- Re-checked the live simulation-layer lane with the `3d-games` skill and the
  current browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The runtime already behaves like a layered simulation:
  - `src/game/state.ts` carries world time, phase, progression, activity, and
    snapshot validation,
  - `src/game/gameworld.ts` keeps world memory bounded,
  - `src/game/performance.ts` and `src/main.ts` expose runtime pressure,
  - `src/game/contracts.ts` still keeps spendable resource singular by design.
- The remaining gap is still the governance envelope:
  - no owned domain-order table,
  - no CPU/GPU/actor/residency/save budget ledger,
  - no fallback-policy table,
  - no recorded downgrade reason surfaced as policy.
- The next exploration question is which layer should be the canonical first
  downgrade point once the budget ledger becomes first-class.

## 2026-07-26 — resource budget and fallback envelope recheck

- Re-checked the live resource-budget lane with the `3d-games` skill and the
  current browser daemon status plus a live performance snapshot.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current performance snapshot still shows a measurable pressure picture:
  - `averageFrameMs` is `20.01`,
  - `p95FrameMs` is `21.7`,
  - `framesPerSecond` is `50`,
  - `drawCalls` is `72`,
  - `triangles` is `104694`,
  - `terrainBuildMs` is `92.7`,
  - `heapUsedMb` is `12.7`,
  - `loadDurationMs` is `2.7`,
  - `firstControllableMs` is `469.2`,
  - `saveBytes` is `2971`.
- The runtime already measures cost and exposes it through browser hooks.
- The remaining gap is still the envelope:
  - no cross-system budget ledger,
  - no explicit low-budget fallback profile,
  - no test proving fallback activates before overload,
  - no operator-visible summary naming the oversubscribed resource,
  - no summary field naming the subsystem that caused fallback.
- The next exploration question is whether the first trigger should be frame
  time, heap, or draw-call pressure.

## 2026-07-26 — ECS threshold and composition readiness recheck

- Re-checked the live ECS lane with the `3d-games` skill and the current browser
  daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current architecture remains composition-first:
  - `src/game/contracts.ts` composes modules onto immutable rig blueprints,
  - `src/game/state.ts` keeps rigs, modules, and world state explicit,
  - `src/game/gameworld.ts` keeps world memory as bounded sets and snapshots.
- The live scale still does not justify ECS:
  - only three rigs are active,
  - authored sites remain a small fixed set,
  - world memory is bounded and replayable,
  - no broad entity zoo or coupling pressure is visible yet.
- The remaining gap is still the migration threshold:
  - no measured actor-count or coupling trigger,
  - no canonical multi-capability composition schema beyond the current rig
    model,
  - no migration proof that preserves identity through a component-model
    change,
  - no explicit statement that ECS should serve the machine-centric model
    rather than replace it.
- The next exploration question is what measured pressure would actually justify
  an ECS migration in this project.

## 2026-07-26 — behavior/planner boundary recheck

- Re-checked the live behavior/planner lane with the `3d-games` skill and the
  current browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current runtime already has decision-shaped logic:
  - `resolvePrimaryAction()` resolves a semantic action before mutation,
  - `performPrimaryAction()` applies the chosen effect and records the
    consequence,
  - `selectActiveRig()`, `installModule()`, `repairRig()`, and `winchRecover()`
    validate and explain state transitions explicitly.
- The remaining gap is the planner envelope:
  - no versioned behavior schema,
  - no candidate-enumeration interface,
  - no deterministic tie-break surface for equal-score candidates,
  - no separate branch-trace stream naming why one branch lost.
- The next exploration question is when the project will actually need to rank
  multiple candidate actions rather than resolve one contextual action at a
  time.

## 2026-07-26 — capability/adaptor guardrails recheck

- Re-checked the live capability lane with the `3d-games` skill and the current
  browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current code remains composition-first:
  - `RIG_PROFILES` carries explicit capability arrays,
  - `effectiveProfile()` composes fitted modules onto an immutable rig profile,
  - `MODULES` can grant extra capabilities without replacing the base rig.
- The live admission path is still lightweight and prose-driven:
  - capability checks are boolean,
  - denied actions surface human-readable diagnostics,
  - there is no versioned capability-definition registry,
  - there is no structured denial envelope with reason codes,
  - adapter governance is still implicit rather than registry-driven.
- The next exploration question is which capability should be the first
  formally versioned envelope: tow, plough, survey, or hover.

## 2026-07-26 — world affordances and capability resolution recheck

- Re-checked the live world-affordance lane with the `3d-games` skill and the
  current browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The world remains affordance-shaped in code:
  - authored sites carry a `verb`,
  - workshop/service areas expose place-based interaction pressure,
  - `src/game/state.ts` decides whether the active rig can satisfy the offer
    through capability checks.
- The remaining gap is still the resolver envelope:
  - no legal / deferred / impossible outcome code,
  - no reusable resolver record shared by behavior and activities,
  - no structured rejection payload naming which side caused the mismatch,
  - no affordance versioning or validation path.
- The next exploration question is which world offer should become the first
  fully structured resolver example: workshop, tow, survey, or plough.

## 2026-07-26 — asset pipeline and provenance recheck

- Re-checked the live asset-pipeline lane with the `3d-games` skill and the
  current browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- `assets/asset-manifest.json` is a real registry, but still pre-runtime:
  - `schemaVersion` is `1`,
  - `assetRoot` is `assets/runtime`,
  - `runtimeFormat` is `glb`,
  - all three entries still have `runtimePath: null`.
- The registry already tracks the important provenance shape:
  - source/reference paths,
  - rights status,
  - intended use,
  - a hash on the admitted reconstruction reference.
- The remaining gap is still activation:
  - no imported runtime asset is active in the playable path,
  - no manifest entry has crossed into runtime truth,
  - no replacement/deprecation cycle has been exercised on a live imported
    asset,
  - no runtime validator is consuming the registry yet.
- The next exploration question is which asset class should become the first
  runtime-activated proof: static prop, terrain variant, or vehicle-related art.

## 2026-07-26 — authoring validation and reproducible content recheck

- Re-checked the live authoring-validation lane with the `3d-asset-production`
  skill and the current browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The repo already validates content in the slices that matter today:
  - state/load paths reject bad or incompatible records,
  - module and world definitions remain data-driven,
  - `assets/asset-manifest.json` carries stable ids, source paths, runtime
    paths, status, and rights metadata,
  - `tools/asset-preflight.mjs` validates GLB structure, safe paths, and
    missing dependencies.
- The remaining gap is the general content envelope:
  - no versioned content-manifest schema for activities or world modules,
  - no reproducible validation-result artifact for the general content path,
  - no status signal that cleanly separates validation-only, runtime-ready,
    and deprecated across the broader authored content surface,
  - no reusable authoring envelope that applies the same contracts to
    imported, edited, or generated content beyond the asset slice.
- The next exploration question is whether the first general manifest should
  cover activities, world modules, or both.

## 2026-07-26 — lighting and atmosphere recheck

- Re-checked the live lighting lane with the `3d-games` skill and the current
  browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The renderer already has a real lighting posture:
  - a directional sun and hemisphere light provide the base model,
  - lighting responds to world phase with fog/sky/headlight shifts,
  - blob shadows remain the low-cost fallback posture.
- `src/main.ts` still surfaces world phase in the HUD, so the player can see
  the active lighting context.
- The remaining gap is the policy envelope:
  - no tier matrix in contract data,
  - no operator/debug field naming the active lighting strategy,
  - no formal fallback rule stating exactly when atmosphere should simplify
    before clarity is endangered.
- The next exploration question is which atmosphere cue should become the first
  named policy item: dawn/dusk, fog, or storm conditions.

## 2026-07-26 — RU-0110 public release and handoff

- Pushed guarded gameplay commit `9c10d2b` and late-research preservation commit
  `a8869ad`; local `HEAD`, GitHub `origin/main`, and the Sites source branch
  were aligned at `a8869ad` before version saving.
- Packaged the already-green production build with the installed Sites
  packager. Sites saved version 7 with the exact pushed commit provenance and
  deployment `appgdep_6a6564e8f510819186b047775995d015` reached terminal
  `succeeded`.
- Public route evidence:
  - Field 02 returned HTTP 200;
  - `/physics-lab.html` redirected to `/physics-lab`, which returned HTTP 200;
  - `/box3d-lab.html` redirected to `/box3d-lab`, which returned HTTP 200.
- The first production acceptance invocation used the bare URL from the
  runbook and failed its developer-surface precondition because acceptance-only
  fixtures are correctly query-gated. The runbook command now includes
  `?acceptance=field-02`.
- The corrected full production acceptance passed with zero captured
  console/page errors. It covered fresh three-rig acquisition, Home/tree/hood
  cameras, all-rig terrain-face refusal and downhill escape, relay/ramp/deep
  water activities, persistence, keyboard/mouse/touch recovery, reduced motion,
  six views, and `390×844` layout.
- Sites returned no recent production Worker error events.
- Production automation timings remain non-representative because browser/GPU
  workloads were concurrent. A clean device matrix and external-player session
  remain open; the functional release evidence is still valid.
- **User value:** the public build now contains the readable cameras, reachable
  rigs, honest controls, and traversal boundaries proven by RU-0110.
- **Team value:** future agents have an exact version-to-commit ledger,
  corrected production command, rollback candidates, and deployment handoff.
- **Operational value:** source provenance, package validation, terminal
  deployment state, live-route behavior, browser errors, and Worker errors are
  all recorded rather than inferred.
