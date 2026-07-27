# Rigs Unbound — Master Execution Tracker

- Status: canonical living task list
- Started: 2026-07-26
- Owner: project owner; agents update evidence and status in the same change
- Product source of truth: [Exploration Map](../exploration/EXPLORATION_MAP.md)
- Quick lane index: [3D Game Contract Index](../research/3D_GAME_CONTRACT_INDEX_2026-07-25.md)
- Decision source of truth: [ADRs](../decisions/)
- Evidence source of truth: [Worklog](../WORKLOG.md) and [reviews](../reviews/)
- Focused current board:
  [Next Execution Board](NEXT_EXECUTION_BOARD_2026-07-26.md)

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

## Current ordered execution queue

This is the operational order. The detailed numbered items below remain the
canonical scope and acceptance contracts.

| Order | Status | Work package                                                      | Why now                                                                                       | Exit before advancing                                                                                                         |
| ----: | :----: | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
|     1 | `[x]`  | RU-0106–RU-0109: first-session P0 repair                          | These defects blocked entry, reward, recovery, or coherent time                               | Unit/migration contracts, development browser, rebuilt production preview, persistence, input parity, and zero console errors |
|     2 | `[x]`  | RU-0110: remaining P1/P2 playtest defects                         | Remove camera, spawn, lab/debug, affordance-label, and record confusion before adding ecology | Every B5–B12 item reproduced, dispositioned, tested, browser-reviewed, committed, pushed, and deployed                        |
|     3 | `[-]`  | RU-0901–RU-0909: session synthesis, provenance, and authority     | Missing synthesis and invented decision authority can misroute every later workstream         | Canonical proposal captured; ADR statuses sourced; tracker deduplicated; lab/public authority explicitly decided              |
|     4 | `[-]`  | RU-0601 + RU-0406: guidance and first meaningful spend            | A reachable reward is not yet a complete first rung                                           | Fresh profile reaches, understands, earns, spends, and recognizes the rig change without project knowledge                    |
|     5 | `[?]`  | RU-0202 + RU-0203: emissions and cultivation                      | Current plans conflict on sequencing, source/listener authority, and schema-v7 ownership      | Operator accepts sequencing and ADR-0025/0026 boundaries; then one real listener and one persistent crop vertical pass        |
|     6 | `[ ]`  | RU-0204 + RU-0205: night threats and dawn consequence             | Complete the first consequence-bearing day→night→dawn loop                                    | Threat failure/retry paths, persisted dawn record, player/operator explanation                                                |
|     7 | `[ ]`  | RU-0206 + RU-0405: mastery and schema v7                          | Progression must reward varied rig verbs without grind or save drift                          | Effective-profile composition, anti-grind tests, v6→v7 migration and recovery summary                                         |
|     8 | `[ ]`  | RU-0207 + RU-0208: presentation and fresh-eyes validation         | Kernel completion is not player comprehension or fun evidence                                 | Desktop/narrow acceptance, save/reload, three simulated personas, at least one human                                          |
|     9 | `[ ]`  | RU-0502–RU-0506 + RU-0603: production assets and public hardening | Replace proof meshes only after the first loop proves what assets and budgets matter          | Selective Kenney pipeline, representative-device profile, boot/readiness, streaming, accessibility                            |
|    10 | `[ ]`  | RU-0304–RU-0307: deeper capability/physics proofs                 | Let real activities pose the next controller and collision questions                          | Shared roles, rescue activity, obstruction query, then one genuinely different motion family                                  |
|    11 | `[ ]`  | RU-0701–RU-0703: replay, guest identity, optional account link    | Sharing starts with inspectable local artifacts, not real-time authority                      | Ghost artifact, export/import, then accepted auth/conflict ADR                                                                |
|    12 | `[>]`  | RU-0704–RU-0707: social, co-op, AI proposals, creator ladder      | High-leverage but depends on stable state, authority, moderation, and recovery                | Named dependencies and operational safety gates close first                                                                   |
|    13 | `[~]`  | RU-0801–RU-0808: continuous research/skill coverage               | Research continues in parallel but must produce decisions or probes                           | Each recommendation is accepted, rejected, deferred, or linked to measured evidence                                           |

### Active work package checklist

#### RU-0110 live task list — remaining P1/P2 playtest defects

This is the active, ordered checklist. A defect is not closed by a code change
alone: its reproduction, contract, automated checks, browser evidence, and
documentation must all agree.

- [x] **RU-0110.0 — Preserve the incoming research batch before implementation.**
  - Evidence: guarded commit `3763a82da03282e11c98a69f2ef1da1b52f6e436`;
    local `main` and `origin/main` aligned after push; typecheck, 108 root
    tests, seven deterministic-kernel tests, Markdown links, and diff checks
    passed.
- [x] **RU-0110.1 — Refresh the live baseline and preserve parallel work.**
  - Evidence: both development ports returned HTTP 200; seven parallel
    research/worklog files and four review captures were classified as
    uncommitted project work and left untouched.
- [x] **RU-0110.2 — Reproduce and disposition B5–B12 with trustworthy
      evidence.**
  - B5 and B9 were reproduced: the old hood pose intersected Torque geometry
    and the fresh chase boom crossed the Home Silo structure. The old spawn's
    exact nearest hit was `home-silo-body`, correcting the earlier gantry-only
    attribution; the canonical v6 Home berth now resolves
    `home-barn-roof`.
  - B6 is reproduced as two gaps: first-session Drift acquisition is hidden
    logistics, while extreme terrain-face penetration affects all mobility
    adapters.
  - B7's prior stuck-lab symptom is not currently reproduced; direct lab boot
    works. The player/developer navigation defect remains.
  - B8, B11, and B12 are reproduced from the public HUD.
  - Evidence correction: the earlier Toy Buggy and Marsh Skimmer hood captures
    do not show their named active rigs. They remain preserved as contradicted
    audit evidence; the `ru-0110/*-hood-after.png` replacements assert the
    active rig before capture.
  - Closure: one baseline matrix records reproduced, not-reproduced, or
    superseded status for every B5–B12 item, with valid captures where a visual
    claim matters.
- [x] **RU-0110.3 — Introduce one canonical scene/camera obstruction query.**
  - Add a solver-independent swept camera query with typed nearest-hit evidence
    (`terrain`, procedural obstacle, or authored structure plus object ID and
    hit fraction).
  - Move Home Silo structural bounds to canonical world data consumed by both
    rendering and the query; do not create a renderer-only proxy truth.
  - Include visual obstacle bounds, standing/felled semantics, tangent
    clearance, finite/zero-length handling, and a bounded hot path.
  - Closure: focused tests cover clear segments, terrain, tree crowns, felled
    trees, authored gantry, tangent clearance, nearest-hit selection, and
    deterministic output.
  - Evidence: `scene-query.ts` composes terrain, procedural obstacles, felled
    world memory, and typed authored structures without importing Three.js;
    seven focused tests plus the full 116-test root suite pass.
- [x] **RU-0110.4 — Replace B5's hardcoded hood pose with rig-owned camera
      sockets.**
  - Author a named hood/cockpit socket for Torque, Spark, and Drift on each
    rendered rig; keep the contract compatible with later GLB node mounts.
  - Prevent camera-mode interpolation through rig geometry and expose
    operator-only evidence for the resolved pose.
  - Closure: all three sockets resolve outside their visual envelopes;
    per-rig browser checks report no self-intersection on desktop and narrow
    viewports.
  - Evidence: typed Torque/Spark/Drift mounts feed named renderer sockets;
    browser evidence reports clear paths and no self-intersection for all three
    rigs, with validated replacement captures under `docs/reviews/assets/ru-0110/`.
- [x] **RU-0110.5 — Resolve B9/B10 chase-camera obstruction without spawn
      hacks.**
  - Use the canonical query for immediate inward avoidance, slower outward
    recovery, a near-plane-safe margin, and post-smoothing revalidation.
  - Keep top-down/tactical cost bounded where full prop queries add no value.
  - Closure: fresh spawn clears the Home Silo structure; a deterministic standing
    tree shortens the boom; felling/clearing it restores the boom without
    oscillation or console errors.
  - Evidence: canonical v6 fresh spawn reports nearest hit
    `home-barn-roof`, resolves from 12.996 m to 5.484 m, then revalidates
    clear. The acceptance-only
    `?acceptance=field-02` fixture finds a real isolated procedural tree,
    observes obstacle pull-in, records the canonical felled-world mutation,
    and observes clear outward recovery. Port 4173 completed with exit code 0
    and zero captured console/page errors.
  - Evidence correction (2026-07-26): the current Home berth can present a
    fully clear 12.996 m chase path. Fresh-spawn acceptance therefore checks a
    clear-or-resolved conditional contract instead of requiring an obstruction
    to exist. The deterministic Launch Ridge structure and standing/felled-tree
    fixtures continue to prove typed inward resolution and outward recovery.
- [x] **RU-0110.6 — Create canonical, non-overlapping starting-rig berths.**
  - Keep spatial switching. Until an explicit claim/unlock mission exists,
    place every advertised starting rig at distinct Home Silo service berths
    that form a real proximity chain.
  - Reuse the same typed berth data for initial state, legacy recovery, and
    emergency recovery; no duplicated spawn coordinates.
  - Add a versioned migration that relocates only pristine legacy Drift state
    and preserves rigs the player already moved, used, or attached.
  - Closure: a fresh player acquires Torque→Spark→Drift without test
    teleportation; berths are dry, stable, non-overlapping, and recovery-safe;
    migration and round-trip tests pass.
  - Evidence: dependency-free rig IDs feed typed world berth records reused by
    fresh state and emergency recovery. Schema v6 reads v5 first, relocates
    only pristine inactive legacy Drift state, and preserves moved/used/attached
    rigs. Focused state/storage tests and fresh browser acquisition pass.
- [x] **RU-0110.7 — Add one shared swept terrain traversability boundary.**
  - Treat the observed cliff penetration as a shared substrate defect, not a
    Drift speed tweak. Add deterministic support-rise/face checks with
    adapter-owned wheel-contact and hover-skirt envelopes.
  - Allow blocked hover authority to reach zero, preserve downhill/reverse
    escape, and return a semantic block reason for player feedback.
  - Closure: Torque, Spark, and Drift cannot penetrate or launch up the seeded
    extreme face at rest or run-up speed; normal grades, water traversal,
    towing, deformation, and deterministic replay remain valid.
  - Evidence: one solver-independent leading-edge/footprint sweep is consumed
    by ground and hover adapters; five focused tests cover all rigs, high-speed
    tunnelling, normal grades, and downhill escape. The final 125-test root suite and
    seven kernel tests pass. A deterministic real-terrain browser fixture
    reaches the semantic `terrain-face` refusal for each adapter under
    acceptance-only manual stepping; final all-flow capture is tracked in
    RU-0110.10.
- [x] **RU-0110.8 — Establish an explicit player/developer surface boundary.**
  - Default player mode hides Physics Lab navigation and runtime
    fps/draw-call/heap diagnostics while keeping direct lab routes available.
  - One explicit developer/evidence surface reveals diagnostics and lab
    navigation for agents and operators.
  - Closure: query/mode behavior is tested; player and developer screenshots
    agree with the contract; direct lab routes still boot with zero errors.
  - Evidence: default player mode hides Physics Lab and runtime metrics;
    `?surface=developer` and `?acceptance=field-02` expose both. The player save
    line reports literal new/restored/migrated/saved-local state. Both 4173 and
    rebuilt 4174 browser runs passed default/developer assertions with zero
    console/page errors.
- [x] **RU-0110.9 — Make actions and persistence language contextual.**
  - Introduce one pure primary-action resolver used by both mutation and UI so
    desktop, touch, prompts, and automation cannot drift.
  - Label the current rig's action, blade availability, recovery, and world
    verbs accessibly on desktop and narrow viewports.
  - Separate persistence status, runtime diagnostics, and the existing genuine
    cargo-relay personal best. Replace the misleading `Local field record` text
    with literal saved/restored/local-state language; do not invent another
    best-time system.
  - Closure: keyboard, pointer, real-touch, aria-label, narrow-layout, and save
    messaging tests pass.
  - Evidence: a pure semantic primary-action resolver drives mutation,
    desktop text, touch text, and aria labels; blade and recovery labels expose
    capability/state instead of generic verbs. Focused tests plus both full
    browser runs cover keyboard, mouse, real touch, save/reload, and the
    `390×844` layout; visible labels include `Lower blade`, `Blade: cut`, and
    `No winch`.
- [x] **RU-0110.10 — Run the complete risk-matched acceptance matrix.**
  - Unit: scene query, camera mounts, terrain traversal, action resolver, save
    migration, and recovery.
  - Integration: typecheck, complete root suite, deterministic kernel suite,
    format, build, local-link check, and diff check.
  - Browser: ports 4173 and rebuilt 4174; desktop and 390×844; fresh profile,
    real proximity acquisition, every hood camera, spawn/prop obstruction,
    developer boundary, persistence, and zero console/page errors.
  - Harness lifecycle: deterministic runs default headless, close their context,
    and previously exited code 0 on both ports. Acceptance-only manual stepping
    now prevents wall-clock frames racing scripted terrain fixtures. The latest
    complete-flow rerun reached all gameplay gates but one screenshot timed out
    while a separate long-running trailer capture and browser daemon were using
    Chrome/GPU resources; that gate remained open until a bounded clean rerun
    passed.
  - Final result: after replacing HMR-sensitive `networkidle` waits with
    readiness-function gates and bounding error cleanup, the expanded harness
    exited code 0 on 4173 and rebuilt 4174 with zero console/page errors.
    `format:check`, 125 root tests, seven kernel tests, typecheck, and production
    build then passed from the formatted source; only the documented Vite
    > 500 kB Three.js advisory remains.
  - Closure: exact commands and outcomes are recorded with evidence tiers; no
    failing touched-area check is described as green.
- [x] **RU-0110.11 — Close documentation, review, git, and release gates.**
  - Update the relevant ADRs, camera/physics/UI contracts, playtest
    disposition, exploration map, worklog, evidence index, and this tracker.
  - Run the three explicit motto-v4 review passes and the missed-anything
    sweep; record user, team, and operational value plus remaining risks.
  - Re-audit all parallel work, run the full managed hook, `git add -A`,
    guarded commit without agent co-author trailers, push, publish the exact
    pushed source through Sites, verify terminal deployment and live routes,
    then update deployment provenance for the next agents.
  - Evidence: guarded gameplay commit `9c10d2b`, preserved research head
    `a8869ad`, Sites version 7 terminal success, HTTP 200 for Field 02 and both
    public evidence lab routes, full public production acceptance, zero captured
    console/page errors, and zero recent Worker error events.

#### RU-0601 + RU-0406 live task list — first understandable reward and spend

This is the next active work package. Its job is to close one complete
first-session rung before Farmfall adds more systems:

`notice a reachable opportunity → collect Scrap → return to Home Silo → choose
and fit a useful part → understand what changed → use that change in the world`.

The guidance layer must be derived from canonical game state. It must not become
a parallel quest state machine, add a second currency, or cover the playfield
with permanent instructions.

- [x] **RU-0601/0406.0 — Establish the current first-rung baseline.**
  - Fresh state starts with zero salvage.
  - The authored `first-recovery-cache` is 18 m from Home and awards 3 salvage.
  - The cheapest compatible modules cost 5; therefore the guaranteed first
    reward cannot currently buy a module.
  - The HUD already points toward nearby salvage and the workshop already
    performs canonical fitting, but neither surface explains the complete
    earn→return→spend→benefit chain.
  - Evidence level: Tier 1 current-source inspection plus the version-7
    production acceptance baseline. The full first-spend flow remains unproven.
- [x] **RU-0601/0406.1 — Add one pure first-rung stage resolver.**
  - Derive stages from existing canonical facts: first cache collected,
    current salvage, workshop reach, and fitted modules.
  - Proposed stages: `find-cache`, `collect-cache`, `return-home`, `choose-part`,
    `part-fitted`, and `free-explore`.
  - Return semantic objective, short mobile label, full accessible label,
    target position, and optional recommended module.
  - Keep the resolver read-only and renderer-independent; mutation remains in
    `performPrimaryAction()` and `installModule()`.
  - Tests: every stage, boundary distances, unexpected active rig, restored
    saves, already-fitted saves, and no contradictory stage.
- [x] **RU-0406.2 — Make the guaranteed first reward economically complete.**
  - Keep one currency: salvage/Scrap. Do not add credits, Favor, premium
    currency, or hidden tutorial grants.
  - Raise the uncollected authored first cache to the exact cheapest meaningful
    spend threshold, currently 5, or document and prove a better equally short
    authored payout path before implementation.
  - Preserve already-collected saves without retroactive duplication or a
    migration exploit; new/fresh profiles receive the corrected authored value.
  - Tests: fresh payout, collected-node idempotency, save/reload, malformed
    state bounds, and total/lifetime counters.
- [x] **RU-0601.3 — Turn the opportunity compass into contextual guidance.**
  - Use one compact objective chip plus the existing transient action prompt;
    keep the center and lower-middle playfield clear.
  - Express a verb and consequence, not quest bureaucracy:
    `Recover 5 Scrap`, `Return to Home Silo`, `Fit a part`, `Test the new grip`.
  - Preserve curiosity after the first part is fitted by collapsing back to
    world opportunities rather than continuing a forced tutorial rail.
  - Desktop and `390×844` layouts must preserve the playfield, 44 px touch
    targets, focus order, aria-live restraint, reduced motion, and player/
    developer surface separation.
- [x] **RU-0406.4 — Make the first workshop choice understandable and usable.**
  - Replace list-item click inference with explicit accessible install buttons
    or an equally strong native control contract.
  - Mark compatible, fitted, affordable, unavailable, and recommended states
    without relying on color alone.
  - Recommend a part because of its next world consequence, not because it is
    numerically cheapest. Current candidate: Lug tyres for Torque, tied to mud
    grip and the Long Furrow direction.
  - Keep other valid choices available; guidance may recommend but must not
    silently buy, lock the player into one build, or expose internal tuning.
  - Keyboard number keys, pointer, touch, and accessible names must invoke the
    same canonical `installModule()` path.
- [x] **RU-0406.5 — Make the fitted change perceptible.**
  - After fitting, explain the exact capability/traversal change and direct the
    player toward a nearby place where it matters.
  - Add a bounded success transition and feedback cue; respect reduced motion.
  - Do not claim the part helps where `effectiveProfile()` shows no meaningful
    change for the active rig.
  - Tests compare pre/post effective profile and player-visible consequence;
    browser evidence must show the fitted module survives save/reload.
- [-] **RU-0601/0406.6 — Add operator and acceptance evidence.**
  - Extend `render_game_to_text()` with the derived first-rung stage,
    recommended module, target, affordability, and completion reason.
  - Record semantic commands/checkpoints for collection and fitting without
    adding a second progression ledger.
  - Fresh browser flow must use real driving and real workshop interaction:
    no teleport, direct state grant, or direct `installRigModule()` shortcut.
  - Cover player and developer URLs, desktop and narrow view, keyboard,
    pointer, real touch, save/reload, reduced motion, and zero console/page
    errors on development, rebuilt preview, and public production.
  - Current evidence (2026-07-26): the finalized harness passed on `4173`
    development and the freshly rebuilt `4174` production-like preview with
    zero console/page problems. Both used real keyboard collection/return,
    pointer workshop fit, visible and persisted Lug tyres, six cameras,
    collision, reduced motion, desktop, and `390×844` coverage. The `4174`
    build also proved zero developer/private runtime asset bridges. Evidence:
    [first-rung acceptance addendum](../reviews/FIRST_RUNG_REWARD_AND_SPEND_ACCEPTANCE_2026-07-26.md#addendum-2026-07-26--finalized-4173-and-4174-acceptance).
    A later fresh production build passed the same full matrix on `4182` and
    strengthened the persistence wait to require the completed relay itself,
    not merely an earlier non-empty save. A subsequent full run used a
    `hasTouch` mobile context plus Chrome touch events to enter the world,
    acknowledge state-derived control lessons, hold the real touch direction
    buttons, collect through touch Act, return to Home, fit Lug tyres through
    touch, and verify the visible module after reload. Public Sites version 9
    then passed the complete real-touch and wider browser matrix with zero
    captured console/page problems. External-player comprehension evidence
    keeps this item in progress. Evidence:
    [Sites version 9 release](../reviews/SITES_VERSION_9_RELEASE_2026-07-26.md).
- [-] **RU-0601/0406.7 — Close documentation and release.**
  - Append the relevant progression/UI ADRs, core-loop contract, exploration
    map, worklog, acceptance review, and this tracker.
  - Run the three motto-v4 passes, missed-anything sweep, format, typecheck,
    full tests, build, links, visual inspection, and complete browser matrix.
  - Preserve parallel work; run the full managed hook; commit without agent
    attribution; push `main`; save/deploy the exact pushed Sites source; append
    the deployment ledger and rollback target.
  - Closure: a fresh player can describe what they found, what they bought, and
    what became newly possible without reading project documentation.
  - Release evidence (2026-07-26): repair commit `5896833` is on
    `origin/main`; Sites version 9 deployed successfully; default and Field 02
    URLs returned HTTP 200; public real-touch/browser acceptance exited 0 with
    zero console/page problems. Release reconciliation and external-player
    comprehension remain open, so this item stays In progress.

#### Closed predecessor checklist — RU-0106 through RU-0109

- [x] Write failing contracts for RU-0106–RU-0109.
- [x] Gate background simulation and input behind explicit world entry.
- [x] Add one authored, reachable first salvage cache and canonical collection.
- [x] Add condition-zero immobility and auditable, non-rewarding recovery.
- [x] Separate absolute world time from activity elapsed time; migrate v4→v5.
- [x] Add keyboard, visible mouse, and touch recovery parity.
- [x] Pass typecheck, 108 root tests, seven kernel-probe tests, format, and build.
- [x] Pass Field 02 browser acceptance on ports 4173 and 4174 with zero captured
      console/page errors.
- [x] Record ADR/worklog/exploration/playtest closure and reconcile schema-v6
      planning.
- [x] Re-run the full gate after documentation settles.
- [x] Guarded `git add -A`, full motto hook attestation, commit, push, exact-source
      Sites version, production deployment, and smoke checks.

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
- [x] **RU-0004 — Preserve and publish the 2026-07-26 integration batch.**
  - Scope: gameplay repairs/additions, obstacle hot-path memoization, Rapier
    lab continuation, Box3D physical-wheel probe, playtest evidence,
    progression decision, trailer tooling/assets, research, and task tracking.
  - Evidence: guarded commit
    `1e7992125824a850eb27a9f9d2bbdbc95b229e2b`; local and `origin/main`
    alignment; Sites version 5 sourced from that exact commit; terminal
    production deployment `succeeded`; live HTTP 200 responses for Field 02,
    the Rapier Physics Lab, and the Box3D Probe.
  - Closure: `git add -A`; full v4 hook attestation; guarded commit; push to
    `origin/main`; Sites version saved and production deployment succeeded from
    that exact pushed commit; live smoke check recorded.
- [x] **RU-0005 — Keep deployment provenance current through version 7.**
  - Evidence: `progress.md`, the Sites runbook deployment ledger, the
    deployment acceptance addendum, and this tracker name version 7 and source
    commit `a8869ad25f72929b62b6722cb262c91b2b6c7999`.
  - Closure: after every deployed commit, update `progress.md` and this tracker
    with the deployed source SHA and evidence tier. Reopen this recurring gate
    when a newer production release is created.
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
- [x] **RU-0106 — Fix playtest P0 B1: title card re-entry.**
  - Evidence: disabled pre-entry input, fixed-step gate, immediate `[hidden]`
    CSS contract, keyboard focus transfer, second-Space primary action, and
    two-port browser regression.
  - Closure: the welcome plate neither reopens nor permits background
    simulation; focus enters the canvas once.
- [x] **RU-0107 — Fix playtest P0 B2: first salvage collection.**
  - Evidence: authored `first-recovery-cache`, reachability/slope tests,
    canonical primary-action collection, player prompt, save/reload, and
    two-port browser acceptance.
  - Closure: a fresh profile can find, understand, collect, and retain the
    first reward.
- [x] **RU-0108 — Fix playtest P0 B3: zero-condition recovery soft-lock.**
  - Evidence: ADR-0019, immobility and repeat-protection tests, persisted
    recovery audit fields, contextual desktop recovery button, keyboard,
    mouse, and isolated real-touch browser paths.
  - Closure: recovery awards nothing, restores 25% condition at Home Silo, and
    cannot be repeated as a resource exploit.
- [x] **RU-0109 — Fix playtest P0 B4: phase-clock consistency.**
  - Evidence: ADR-0019, absolute `worldTimeMinutes`, derived phase boundaries,
    v4→v5 migration, round-trip tests, and browser day→gloam→night→dawn cycle.
  - Closure: activity time and world time are separate; visible time is
    monotonic and survives reload.
- [x] **RU-0110 — Close cheap P1/P2 playtest defects.**
  - Scope: hood clipping, Drift spawn/recovery and extreme-grade behavior,
    player-vs-lab navigation, default debug telemetry, spawn occlusion,
    prop-aware camera obstruction, action labels, and record naming.
  - Gate: each defect has a reproduction, fix, and browser evidence; no
    developer fixture masquerades as a player objective.

## 2. First complete game loop — Farmfall Slice 01

- [x] **RU-0201 — Execute Phase 0 playability repair.**
  - Depends on: RU-0106 through RU-0110.
  - Source: [Farmfall plan](FARMFALL_SLICE_01_2026-07-25.md).
  - Closure: all Phase 0 gates green before new ecology state lands.
- [~] **RU-0202 — Emission/listener system.**
  - Current evidence: `signature.ts` implements a source-only experimental
    fixture with named acoustic/illumination/thermal-proxy channels, explicit
    generic operating context, no cached-telemetry/activity coupling, no
    universal score/falloff, and four passing focused tests.
  - Gate: operator accepts ADR-0025; one real listener owns sensitivity,
    falloff/occlusion/thresholds; active/inactive operating semantics,
    fixed-step behavior, replay, accessible feedback, and browser evidence pass.
- [?] **RU-0203 — Cultivation/crop loop.**
  - Finding: current v6 cannot be silently extended; deformation, furrows, and
    authored `tilled` surfaces cannot prove cultivation-cut provenance.
  - Gate: operator accepts ADR-0026 sequencing, schema-v7 owner, harvest value,
    post-sow terrain policy, and measured bounds; then
    plough→raise→sow→grow→harvest persists and invalid entries recover visibly.
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
  - Status: paused pending operator sign-off on ADR-0023 and a named
    player-fantasy comparison question.
  - Gate: Rapier and Box3D express the same project-owned blocked/fellable/
    trigger/sensor/hazard/attachment roles without solver handles in game state.
- [ ] **RU-0305 — Unstable trailer + lifting arm activity.**
  - Status: proposed candidate harness, not mandatory solver work; requires
    operator sign-off on ADR-0023.
  - Gate: one rescue/construction/recovery job exercises attachment ownership,
    breakage, load, capture/recovery, feedback, and candidate comparison.
- [x] **RU-0306 — Camera-obstruction query port.**
  - Closure: fulfilled by RU-0110.3/0110.5 rather than implemented again.
    `scene-query.ts` composes terrain, procedural obstacles, felled world
    memory, and authored structures into one solver-independent nearest-hit
    result. Chase/side/hood acceptance proves signed rear framing,
    structure/tree pull-in, felled-tree recovery, and no self-intersection.
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
- [ ] **RU-0405 — Save schema v7 and migration observability.**
  - Context: schema v6 is now owned by ADR-0019 world-clock, emergency
    recovery state, and canonical multi-rig Home berths.
  - Gate: crops/mastery/dawn/signature state migrate from v6 with reason-coded
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
- [x] **RU-0604 — Separate player surface from evidence laboratories.**
  - Gate: labs remain reachable through an explicit developer/evidence route
    while the public field flow presents player goals rather than debug tools.
  - Evidence: RU-0110.8 browser matrix; the player surface hides laboratory
    navigation/diagnostics and admits no developer-only runtime bridge assets.
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

## 9. Session-wide synthesis, provenance, and authority closure

This section captures the work that the 2026-07-26 session inventory found
outside the earlier tracker. It is not a second roadmap: these tasks repair the
canonical product/decision trail that every numbered workstream consumes.

- [x] **RU-0901 — Canonical compositional episode grammar.**
  - Scope: record the seven-part grammar
    (`Rig identity + Place + Contract graph + Pressure curve + Rule modifier +
Discovery chain + Persistent consequence`), the pressure/modifier/
    discovery/consequence taxonomy, and the mechanic lattice.
  - Include: failure-generated recovery contracts, VehiclePassport history,
    social footprint, behavioural cargo, cross-rig mysteries, adaptive HUD
    lenses, post-run consequence summaries, and automatic story captures.
  - Closure: one project-local proposal links the existing mechanic grammar,
    VehiclePassport, activity, persistence, replay, and world-memory contracts
    without claiming operator acceptance.
  - Evidence:
    [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md).
- [x] **RU-0902 — Storm Relay and non-privileged frontier proof.**
  - Scope: capture the complete Storm Relay experiment for Torque, Spark, and
    Drift, including rising water, fragile cargo, radio interference,
    capability-specific solutions, persistent success, and stranded-rig
    recovery on failure.
  - Boundary: the farm-to-city fringe is a dense test biome, not the universe's
    privileged center; underwater, orbital, miniature, fantasy, procedural, and
    other worlds remain equally valid.
  - Closure: the proposal states what it tests, what remains reusable, its
    coherence/admission checks, and why it is not automatically the next
    implementation.
  - Evidence:
    [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md).
- [x] **RU-0903 — Decision-provenance and sign-off audit.**
  - Scope: extend the completed physics audit across ADR-0006, ADR-0012,
    ADR-0018, ADR-0021, Farmfall, Time Trial Ghost, and other “operator
    direction” claims.
  - Gate: distinguish direct operator statement, explicit sign-off,
    operator-supplied AI/third-party proposal, agent inference, and runtime
    evidence; correct status append-only.
  - Closure: every load-bearing Accepted decision has a traceable sign-off or is
    returned to Proposed/Deferred without deleting its history.
  - Closure evidence (2026-07-26): added the canonical
    [decision register](../decisions/README.md) and
    [cross-session provenance audit](../reviews/DECISION_PROVENANCE_AND_RECOMMENDATION_STATUS_AUDIT_2026-07-26.md);
    corrected ADR-0006/0012 scope, returned unsupported load-bearing ADR-0021
    to Proposed, reclassified technical ADR-0022/0024 as implemented evidence,
    preserved the documented direct sign-off behind ADR-0018, and bounded
    Farmfall/Time Trial plan authority without removing them from the active
    work queue.
- [x] **RU-0904 — Tracker and authority deduplication.**
  - Scope: reconcile RU-0110.3 versus RU-0306, local technical acceptance versus
    product acceptance, and overlapping research/live-implementation entries.
  - Closure: every active item has one owner, one status, one dependency chain,
    and one evidence ceiling.
  - Closure evidence (2026-07-26): preserved both decisions while resolving the
    duplicate `ADR-0023` identifier; solver-neutral dynamics remains ADR-0023
    and the browser-harness lifecycle decision is ADR-0024. Marked RU-0306
    fulfilled by the already verified RU-0110.3/0110.5 scene-query work instead
    of scheduling a duplicate implementation. The decision register separates
    local implementation evidence from product acceptance; joint packages
    RU-0601/0406 and RU-0206/0405 retain one dependency order rather than
    parallel truth sources.
- [x] **RU-0905 — Canonical motto-v4 stale-reference correction.**
  - Finding: project `motto_v4.md` declares v4 canonical but its multi-pass
    section still says to revalidate against motto-v3.
  - Gate: locate and correct the canonical upstream instruction source, rerun
    `agent-start`, and confirm generated project surfaces no longer reintroduce
    the stale reference.
  - Closure evidence (2026-07-26): corrected
    `/Users/pranay/Downloads/motto_v4.md`, `/Users/pranay/AGENTS.md`,
    `/Users/pranay/Projects/AGENTS.md`, and
    `/Users/pranay/Projects/agent-start`; made the bootstrap use one v4 source
    with a v4 workspace fallback; removed the generated “legacy bridge”
    contract; aligned canonical context paths to lowercase `docs/context`; ran
    `bash -n`; regenerated this project twice after the instruction changes;
    and confirmed no stale v3 startup, clause, source, bridge, or uppercase
    context-path references remain in the live stack. Project `motto_v2.md` and
    `motto_v3.md` are absent.
- [x] **RU-0906 — Research recommendation status-inflation audit.**
  - Scope: reconcile “Adopt,” “Approved,” “Used,” and implementation-authority
    labels across library, engine, UI, asset, and tooling evaluations.
  - Closure: every label is backed by current code/evidence and sign-off or is
    relabelled Candidate/Proposed/Experimental/Rejected/Deferred.
  - Closure evidence (2026-07-26): the decision register defines the canonical
    recommendation vocabulary; a tested reusable audit reports 44
    context-sensitive review candidates; every candidate class is dispositioned
    in the provenance audit; high-impact physics/library/GSAP claims carry
    current status tables; and surviving false operator-authorship wording in
    ADR-0006/0012 is withdrawn at the point of use. The audit remains a
    continuing review tool, not a zero-warning lint gate.
- [?] **RU-0907 — Evidence-lab production-surface decision.**
  - Scope: decide whether Physics Lab and Box3D Probe remain direct production
    routes, become developer-only build entries, or move to a separate evidence
    deployment.
  - Dependency: operator sign-off on ADR-0023 and alignment with RU-0604.
  - Closure: build, navigation, deployment, documentation, and rollback all
    express the same accepted policy.
- [ ] **RU-0908 — Session-wide requirement completion audit.**
  - Gate: recheck every explicit requirement, task ID, proposal, test,
    acceptance condition, deferred item, and decision against current code,
    runtime, docs, and external evidence.
  - Closure: no item is called Done from intent, documentation, or narrow tests;
    unresolved work remains visibly active with a concrete closure path.
- [x] **RU-0909 — Internal wide-open next-tranche arbitration.**
  - Scope: revisit the next product proof from first principles with internal
    Champion, Strategist, Future Self, Methodologist, Cartographer, Archivist,
    Data Steward, Skeptic, Trickster, Executioner, and Outsider roles; use no
    external models.
  - Closure: preserve disagreement, convergence, kill criteria, sequencing
    proposal, and the operator-sign-off boundary in one durable artifact.
  - Evidence:
    [Wide-Open Next-Tranche Arbitration](../exploration/WIDE_OPEN_NEXT_TRANCHE_ARBITRATION_2026-07-26.md).
    The document proposes Unbound Passage before Signal Break while preserving
    Farmfall; it does not silently change the accepted roadmap.

## 10. Recurring acceptance gates

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

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this tracker. This tracker still owns the current
execution order and acceptance gates; the new note carries the wider
machine-keeper thesis and long-range product direction.
