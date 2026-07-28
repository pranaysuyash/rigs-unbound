# Rig Lab 01 Acceptance Review

- Date: 2026-07-25
- Review target: local **Rig Lab 01: Mobility and Capability Translation**
- Decision source: [ADR-0006](../decisions/ADR-0006-rig-capability-portability.md)
- Plan: [Rig Lab 01](../plans/RIG_LAB_01_2026-07-25.md)
- Risk class: low, local browser gameplay prototype; persistence migration raises data-integrity relevance
- Merge verdict: **reviewable local work; no commit or merge requested**
- Code-ready verdict: **yes for the local evidence contract**
- Feature-ready verdict: **partial for the product; complete for the named lab workflow**
- Launch-ready verdict: **no**
- Confidence: **0.96 for the reported local evidence, below 1.00 because external-player feel, representative devices, cold-cache production loading, camera occlusion, and public deployment are unverified**

## 1. Executive summary

Rig Lab 01 replaces the original tractor-shaped runtime contract with one canonical rig model and exercises it through two deliberately contrasting vehicles. Torque, a utility tractor, and Spark, a toy buggy, consume the same semantic actions, fixed-step state transition, camera modes, save, public-state hooks, capability-driven activity, and Three.js renderer adapter. They retain different movement and capability profiles: Torque is heavy, stable under tow, slower, and equipped with a plough; Spark is light, fast, responsive, penalized more heavily by cargo, and able to launch from the relay ramp.

The cargo relay is a complete local workflow rather than a capability label. A capable rig approaches cargo, attaches it through the primary semantic action, transports it, crosses the delivery gate, records completion and best time, persists the result, restores it after reload, and resets it through one explicit local reset. The activity logic asks for the `tow` capability and never asks for a tractor or buggy name.

The v2 save retains both rigs, attachment state, condition, history, cargo-relay state, presentation, and shared world memory. Valid Field Test 001 v1 saves migrate the previous tractor state and furrows into the Torque entry instead of being discarded. Invalid data continues to recover to a clean state with a visible diagnostic.

Local browser instrumentation now reports startup, rolling frame-time, FPS, renderer counts, JavaScript heap when Chrome exposes it, and save/load cost. The final visible Chrome acceptance run observed 175.0 ms from navigation start to the first controllable frame, 8.89 ms average and 10.0 ms p95 sampled frame time, 41 draw calls, 1,658 rendered triangles, and 23.7 MB reported JavaScript heap. Its periodic-save snapshot measured 0.10 ms and a 1,260-byte v2 save. These are local development-server observations, not budgets or production claims.

The result proves more than the original tractor scene, but it does not prove the broad universe architecture. Both current rigs use the same ground-controller adapter. Bicycle balance, tracked steering, water displacement, aircraft flight, rockets, and spacecraft remain controller-family tests, not profile rows waiting to be filled.

## 2. Exact user-facing behavior changed

Before this work, the live page presented one tractor and one tractor-specific primary action. The player could drive, plough, change camera/light state, discover landmarks, and retain furrows.

After this work:

1. The start surface identifies **Rig Lab 01**, not a generic tractor field test.
2. Two persistent rigs exist together in the same world.
3. `R` or the touch **Switch** action changes the active rig without replacing or resetting the other rig.
4. The HUD identifies Torque or Spark, current capabilities, condition, relay status, speed, and camera policy.
5. `Space` or `E` uses a semantic capability action.
6. Near relay cargo, that action attaches the cargo when the active rig advertises `tow`.
7. Away from cargo, Torque can engage or raise the plough because it advertises `plough` and owns the field-plough attachment.
8. Cargo remains attached to the rig that picked it up even if the player switches away.
9. Entering the cyan delivery gate with attached cargo completes and times the relay.
10. Spark accelerates and turns faster than Torque, loses a larger percentage of speed while towing, uses a closer camera policy, and becomes airborne at the relay ramp.
11. Torque remains grounded at that ramp because it does not advertise `jump`.
12. A hard landing changes the shared condition model and produces a visible diagnostic.
13. Reload restores both rig histories and relay completion.
14. A Field Test 001 v1 record migrates into the v2 multi-rig record.
15. Reset explicitly clears both rigs, relay cargo, and shared world memory.
16. The exported browser state exposes both rigs, capabilities, cargo and delivery coordinates, activity timing, world memory, and local performance.

## 3. Product, team, and operational value

### Player value

The player can now compare two machine fantasies rather than infer breadth from distant scenery. Torque and Spark solve the same cargo problem with different movement, load response, and secondary capabilities. The player receives an immediate reason to switch machines, a visible destination, a completion result, and persistent evidence of both machines' histories.

### Business and team value

The implementation tests the Rigs Unbound thesis directly. It reduces the risk of building a farming game underneath a broad name because the second rig forced universal state, inputs, save, activity, camera, and renderer ownership to become explicit. Future vehicle proposals can be reviewed against a concrete profile/adapter/capability boundary rather than discussed abstractly.

The browser acceptance command provides repeatable regression evidence. Performance numbers now have a baseline and source instead of being guessed. The build-size warning remains visible instead of being suppressed by raising Vite's threshold.

### Internal and operational value

The operator can answer:

- which rig is active;
- which rig owns attached cargo;
- whether the relay is ready, active, or complete;
- when it started and completed;
- which best time is persisted;
- each rig's position, condition, attachments, capabilities, and travel history;
- whether a v1 record migrated or invalid data recovered;
- how much the latest save serialized;
- whether the browser produced console or page errors;
- what startup/render measurements were observed locally.

The reusable acceptance tool writes durable visual evidence under `docs/reviews/assets/` rather than leaving screenshots only in a temporary directory.

## 4. Architecture and contract changes

### Rig identity and configuration

`RigState` is the persistent runtime identity. `RigProfile` is versioned product configuration. A profile selects the current `ground` mobility adapter and supplies parameters used by the canonical controller. The state never stores Three.js groups, meshes, materials, lights, or camera objects.

Profile data includes acceleration, reverse acceleration, speed limits, drag, braking, steering response, turn rate, wheel radius, mass, jump impulse, landing tolerance, tow multiplier, camera policy, and advertised capabilities.

This split deliberately avoids two failure modes:

- renderer nodes becoming save identity;
- a class hierarchy pretending all locomotion families are equivalent.

### Semantic action and capability boundary

The continuous input contract remains accelerate, brake, steer left, and steer right. The primary tap action now requests a world/capability interaction. The state decides whether the active context means attach cargo, release cargo, engage a plough, or report that no capability target is reachable.

The cargo activity checks `hasCapability(rig, "tow")`. The ramp checks `hasCapability(rig, "jump")`. Furrow creation checks an engaged field-plough attachment and the `plough` capability. This separates world questions from vehicle names.

### Activity state

The cargo relay owns ready, active, and complete states; start and completion timestamps; best time; and cargo position, attachment ownership, heading, and delivery status. The complete path is auditable in saved and public state.

### Save migration

The canonical key is now `rigs-unbound.save.v2`; the legacy key remains readable. A valid v1 payload maps:

- `vehicle` into `rigs["utility-tractor"]`;
- `ploughLowered` into the field-plough attachment;
- valid furrows into world memory with Torque as the producing rig;
- phase, camera, elapsed time, position, steering, speed, distance, and wheel rotation into equivalent v2 fields.

Spark and the relay initialize from canonical v2 defaults. Clearing a record removes both current and legacy keys. Saving writes only the v2 key.

### Renderer adapter

The renderer owns two rig visual groups, cargo, delivery/pickup signals, a ramp, and a reusable hitch-line buffer. Each frame maps persistent rig/cargo state into those objects. The hitch line initially reallocated geometry while cargo was attached; the architecture review removed that churn and updates the existing position buffer instead.

Portrait camera distance and height scale from the active rig's camera policy to keep the machine legible on the `390 × 844` surface.

## 5. Exact files intentionally created or changed

### Runtime and configuration

- `package.json` — added the visible browser acceptance command and expanded formatting coverage.
- `index.html` — Rig Lab identity, six-instrument HUD, switch/capability controls, and updated entry copy.
- `src/main.ts` — two-rig UI, semantic tap routing, browser hooks, persistence metrics, and operator-facing activity prompts.
- `src/styles.css` — six-instrument layout, mobile no-overlap correction, and narrow-screen density tuning.
- `src/game/contracts.ts` — v2 state, rig/profile/capability/attachment/activity contracts and canonical configuration.
- `src/game/state.ts` — profile-driven ground movement, switching, capabilities, towing, jumping, landing condition, activity completion, public state, validation, and v1 migration.
- `src/game/storage.ts` — v2/legacy keys, migration-aware loading, save bytes, and save/load duration.
- `src/game/performance.ts` — bounded rolling local performance monitor.
- `src/game/renderer.ts` — two rig visuals, relay cargo, ramp/gate, portrait camera policy, and non-allocating hitch update.
- `src/game/state.test.ts` — twelve live-kernel tests.

### Reusable tooling

- `tools/rig-lab-browser-acceptance.cjs` — visible Chrome end-to-end workflow.
- `tools/README.md` — tool purpose, usage, dependency override, and evidence boundary.

### Durable decisions, plans, progress, and review

- `docs/decisions/ADR-0006-rig-capability-portability.md`
- `docs/decisions/ADR-0001-headless-gameplay-kernel-and-engine-bakeoff.md`
- `docs/plans/RIG_LAB_01_2026-07-25.md`
- `docs/reviews/RIG_LAB_01_ACCEPTANCE_2026-07-25.md`
- `docs/reviews/assets/rig-lab-01-desktop.png`
- `docs/reviews/assets/rig-lab-01-narrow.png`
- `docs/exploration/EXPLORATION_MAP.md`
- `README.md`
- `DESIGN.md`
- `progress.md`
- `docs/WORKLOG.md`

Generated project context files were refreshed through `agent-start`; `.agent/` remains a compatibility mirror.

## 6. Commands and evidence

### Baseline

```text
npm test
```

Result before the refactor: 6 live-runtime tests and 7 deterministic-kernel-probe tests passed.

```text
npm run typecheck
```

Result before the refactor: strict live-runtime TypeScript and the preserved experiment typecheck passed.

### After implementation

```text
npm run typecheck
```

Result: passed for the live TypeScript runtime and preserved deterministic experiment.

```text
npm test
```

Result: 14 live-runtime tests plus 7 deterministic-kernel tests passed; 21 total, zero failures.

```text
npm run format:check
```

Result: all configured project JSON, HTML, TypeScript, CSS, and browser-tool files passed Prettier.

```text
npm run build
```

Result: passed. Output:

- HTML: 5.22 kB raw / 1.65 kB gzip;
- CSS: 8.64 kB raw / 2.59 kB gzip;
- JavaScript: 568.88 kB raw / 146.38 kB gzip;
- source map: 2,848.29 kB.

Vite still emits its advisory warning for a minified JavaScript chunk above 500 kB.

```text
npm run test:browser
```

Result: passed in visible Chrome against `http://127.0.0.1:4174/`.

The accepted run:

- approached cargo within 4.21 m;
- attached cargo to Torque through the semantic action;
- completed the relay with the saved best time of 3.37 seconds in accelerated deterministic browser input;
- moved Torque 43.87 m and Spark 103.23 m;
- observed Spark reach 1.70 m airborne height;
- saved and restored the complete relay and both rig histories;
- observed no browser console warnings/errors or page errors;
- verified touch controls at `390 × 844`;
- measured a 10.41 px vertical gap between the field kit and touch controls.

The accelerated browser input is a deterministic acceptance fixture, not a human leaderboard time.

### Live server

```text
curl http://127.0.0.1:4174/
```

The local Vite server returned HTTP 200 during the work. The visible Browser Daemon navigated to the Rig Lab URL.

## 7. Review cycle findings

### Cycle 1: logic, migration, and workflow

Finding: the original state encoded a universal `vehicle` but carried tractor-only movement constants and `ploughLowered`.

Correction: introduced persistent rig entries, profiles, attachment state, capability queries, and one canonical active-rig transition.

Finding: a new schema could silently discard the existing local tractor trail.

Correction: added explicit v1 recovery and migration, retained the legacy key reader, and tested position, plough, buggy initialization, and furrow ownership.

Finding: “towing” could become UI theater without a complete activity transition.

Correction: implemented attach, follow, manual release, gate completion, timing, best time, save, restore, and reset.

Finding: the first browser automation stopped near cargo and then braking carried the rig outside the interaction radius.

Correction: the reusable acceptance driver now stops on the semantic reach threshold without a post-arrival movement command. This made the test describe the actual interaction contract instead of hiding it with direct state mutation.

Retest: typecheck and 21 tests passed; browser activity completed.

### Cycle 2: defensive behavior, performance, and narrow layout

Finding: the first mobile six-instrument layout overlapped the touch controls by approximately 14.4 px.

Correction: raised the narrow field kit and tested the final 10.41 px gap.

Finding: the first portrait camera used the desktop chase distance, leaving the buggy oversized and partially hidden by the field kit.

Correction: portrait chase height/distance and tactical height now scale from the same active-rig camera policy.

Finding: the renderer recreated hitch geometry every frame while towing.

Correction: the hitch owns a stable buffer and updates its two positions in place.

Finding: one performance snapshot after reload could hide the save cost and report a different frustum/draw count than active desktop play.

Correction: acceptance separates desktop active-play, periodic-save, restored-load, and narrow snapshots.

Retest: browser acceptance passed with zero captured console/page errors; screenshots were visually inspected.

## 8. Eleven-dimension audit

### Code — ✅

Strict TypeScript, 21 tests, formatting, production build, and browser acceptance pass. State remains renderer-independent. No suppression comments, blanket `Any`, duplicate controllers, or alternate save pipelines were introduced.

### Operational — ✅ for local lab / 🟡 for product

The local player can trigger, understand, complete, persist, and reset the activity. Public telemetry collection, crash reporting, deployment health, and operator dashboards do not exist.

Closure: decide public hosting and privacy posture, then add deployment/runtime error evidence appropriate to that surface.

### User experience — ✅ for the named workflow / 🟡 for fun

The lab is legible and complete across desktop and narrow surfaces. Numerical and visual contrast is observed. External players have not confirmed that Torque and Spark feel emotionally distinct or that the cargo route remains engaging under normal human input.

Closure: run external sessions and collect whether players independently describe different rig fantasies and understand the capability action.

### Logical consistency — ✅

World interactions query capabilities; activity state transitions are explicit; cargo ownership persists through rig switching; saved state is versioned; and the current ground adapter is not represented as a universal locomotion solution.

### Commercial — 🟡

The work strengthens a differentiating vehicle-universe thesis and reduces architecture rework. It does not establish acquisition, retention, monetization, market demand, or willingness to pay.

Closure: keep commercial claims out of the prototype; validate player pull before pricing or platform investment.

### Data integrity — ✅ for local v1/v2 records

Valid v1 state migrates; invalid data fails closed to a visible clean record; numeric values are clamped; bounded furrows prevent unbounded local growth; both keys clear explicitly. Browser acceptance proves a v2 relay result survives reload.

Remaining risk: no fuzz/property corpus covers arbitrary malformed nested payloads, and no future legacy migration exists yet.

Closure: add schema-validation fixtures and migration-chain tests when a third schema is proposed.

### Quality and reliability — ✅ for current paths / 🟡 for collision

Primary and fallback local-save behavior are tested. The current world has no obstacle collision, camera collision/occlusion, WebGL context-loss recovery, or representative low-power run.

Closure: implement camera/obstacle handling before increasing scenery; exercise context loss and production preview on target devices.

### Compliance — N/A for the local gameplay change

No account, personal data, payment, chat, UGC, or public telemetry was added. The local heap/performance export stays in the user's browser. Private paid source assets remain outside the runtime.

### Operational readiness — ❌ for public launch

There is no deployment, monitoring, rollback runbook, cache/update strategy, public privacy statement, representative-device matrix, or external-player acceptance.

Closure: a separate public-surface decision and launch evidence unit is required.

### Critical path — 🟡

The highest-leverage next evidence is player-perceived rig contrast, camera/collision reliability, and a second locomotion-family adapter. Adding more ground-rig meshes before those gates would produce content breadth without resolving the architecture question.

### Final verdict — explicit

- Code-ready for local review: **yes**.
- Rig Lab 01 feature-ready: **yes for the named local workflow**.
- Rigs Unbound feature-ready: **partial**.
- Public launch-ready: **no**.
- Final engine selected: **no**.
- Broad vehicle-universe portability proven: **no**.

## 9. Verified versus inferred

### Verified

- both rigs use the same state and action entry points;
- profile parameters create different measured movement;
- capability checks gate plough, tow, and jump;
- cargo workflow completes for either towing rig in tests;
- Spark becomes airborne while Torque remains grounded at the ramp;
- v1 state migrates and v2 state restores;
- local build and checks pass;
- visible Chrome completes the two-rig workflow;
- narrow controls do not overlap the field kit;
- captured console/page-error list is empty;
- the local server remains reachable.

### Inferred

- the architecture is a better base for future rigs than the tractor-shaped v1 contract;
- players will perceive the two rigs as meaningfully different;
- the current profile/adapter split will accommodate another ground vehicle without change;
- local frame-time measurements predict reasonable behavior on similar machines.

The inferred claims are plausible but are not elevated to completion evidence.

## 10. Known gaps and hardening path

1. **External feel evidence**
   - Gap: no external player session.
   - Path: test comprehension, favorite rig, described verbs, control feel, and route clarity without creator explanation.
2. **Non-ground portability**
   - Gap: only a ground-controller adapter exists.
   - Path: record and implement one bounded locomotion-family contract before claiming bicycles, tracks, water, or flight.
3. **Collision and camera occlusion**
   - Gap: rigs can pass through scenery and nearby objects can obstruct framing.
   - Path: add simple colliders, camera raycast avoidance, recovery position, and tests before raising prop density.
4. **Production loading**
   - Gap: performance is from local Vite development serving and warm machine conditions.
   - Path: profile a production preview under cold cache, throttled CPU/network, and representative mobile hardware.
5. **Bundle advisory**
   - Gap: 568.88 kB minified JavaScript exceeds Vite's 500 kB advisory.
   - Path: measure module contribution and first-controllable dependency; split or replace only work that improves the player metric. Do not silence the warning by changing the threshold.
6. **Replay**
   - Gap: semantic deterministic input hooks exist, but a durable recorded replay format does not.
   - Path: define a versioned action-frame/event format only when ghost, share, debugging, or multiplayer evidence needs it.
7. **Damage depth**
   - Gap: landing condition proves a shared field but does not yet affect handling, repair, or player decisions.
   - Path: connect condition to bounded behavior and repair only with a complete recovery workflow and clear UI.
8. **Public operations**
   - Gap: no deployment or monitoring.
   - Path: separate ADR and launch gate before public claims.

## 11. Preservation, artifacts, and repository state

- The existing tractor scene, furrow world memory, landmarks, phase changes, and camera modes were extended rather than deleted.
- The parallel `experiments/deterministic-kernel-probe/` remains untouched and continues to run under root checks.
- No private Kenney source asset was copied or referenced by runtime path.
- Two intentional visual QA artifacts were created under `docs/reviews/assets/`.
- The previous temporary screenshots are not part of this delivery.
- No documentation file or historical decision was deleted.
- No git staging, commit, push, branch, reset, checkout, stash, merge, cleanup, or history mutation was performed.
- Local work remains uncommitted because the project owner did not request a git mutation in this conversation.
- No follow-up decision is required to use the local lab. A project-owner decision is required before public deployment, final engine selection, or choosing the next locomotion family.

## Anything else?

Yes. The strongest unresolved risk is not technical failure; it is false validation. Two profiles and a passing activity can still feel like one generic vehicle controller with different numbers. The next evidence must listen for player language: if people say “the tractor felt planted and purposeful” and “the buggy felt playful and risky,” the contrast is working. If they merely say one was slower and one was faster, improve handling, animation, sound, camera, suspension, and activity affordances before adding more vehicle count.
