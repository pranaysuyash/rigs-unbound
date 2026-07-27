# First-rung reward and spend acceptance

- Status: local implementation accepted; release gates in progress
- Baseline commit: `1237624822478542e2e4e22d275cdaa6874150cb`
- Candidate commit: uncommitted at this checkpoint
- Risk class: medium gameplay/progression, save continuity, and public packaging
- Evidence: Tier 2 tests/build; Tier 3 local browser evidence pending refresh;
  Tier 4 visual QA identifies remaining composition debt

## User-facing behavior

A fresh player can follow one state-derived chain:

1. recover the authored five-Salvage cache;
2. return to Home Silo;
3. fit the recommended Lug tyres through an accessible workshop button;
4. see and hear a bounded completion response;
5. drive toward Long Furrow to test the resulting grip;
6. reload without losing the fitted part or its visible presentation.

Restored saves do not rely on tutorial flags. Guidance is derived from canonical
currency, collected-node memory, physical rig positions, workshop reach, and
installed modules. If the active rig cannot fit the part, guidance leads to the
nearest compatible physical rig before it suggests switching.

## Value delivered

- Player value: the first reward now buys a recognizable, persistent change.
- Product/team value: one small loop can evaluate economy, progression,
  workshop UI, vehicle identity, world direction, and save continuity together.
- Internal/operational value: `render_game_to_text()`, run-record checkpoints,
  asset-bridge evidence, and browser automation expose the chain without adding
  a second quest or progression ledger.

## Canonical boundaries

- `resolveFirstRung()` is a pure query.
- `performPrimaryAction()` remains the collection mutation.
- `installModule()` remains the fitting mutation.
- `effectiveProfile()` remains the mechanical composition authority.
- `GameState` and `GameWorld` remain the save/world-memory authorities.
- Runtime bridge assets are manifest-driven; unapproved fixtures are excluded
  from player activation and production distribution.

## Verification completed so far

- `npm run test:assets` — 7/7 passed.
- `npm run assets:preflight` — 4 entries, zero findings.
- `npm test` — 205 root tests plus 7 kernel-probe tests passed at the first
  combined-tree checkpoint.
- `npm run build` — passed at the first combined-tree checkpoint.
- `npm run format:check` — passed after formatting the touched source/tools.
- Focused progression/state/runtime-asset checks — 80/80 passed.
- Focused performance/profile/first-rung/run-record/replay checks — 39/39
  passed after integration-blocker repairs.
- Earlier rebuilt-preview browser evidence proved keyboard driving, pointer
  install, visible-module state, periodic save, reload, relay, terrain, cameras,
  reduced motion, narrow layout, and zero console/page errors.

All full-suite, build, and browser claims must be refreshed again after the
final combined source state stops changing.

## Visual inspection

`docs/reviews/assets/first-rung-desktop.png` is internal QA evidence, not public
marketing evidence. Its first capture exposed three problems:

- the workshop prompt still read as unfinished after fitting;
- the completion chip competed with the camera lesson;
- Lug tyres were not distinct enough at gameplay distance.

The current candidate corrects the post-fit workshop wording, adds unmistakable
radial tread blocks tied to canonical fitted-module state, and dismisses the
lesson before the top-down completion capture. A fresh capture is required.

The existing `390x844` capture remains a layout-regression artifact, not proof
of comfortable mobile composition. Real touch and human comprehension remain
separate acceptance gates.

## Asset and production distribution

The two Kenney Car Kit fixtures are CC0-evidenced and runtime-tested on the
developer surface. They are not approved as production art. The production
packager must prove that every `publicRuntimeApproved: false` runtime path is
absent from `dist/client` and returns no asset bytes from the rebuilt preview.

## Three-pass review

### Pass 1 - immediate correctness and completeness

Found and corrected an impossible restored-save rig-switch instruction,
unsupported commands falsely marked replayable, stale post-fit copy, and weak
tread silhouette. Full validation and both browser ports remain open until the
final shared tree is stable.

### Pass 2 - architecture and long-term viability

Kept the guidance layer read-only and canonical-state-derived. Removed an
unfinished billboard/frustum implementation that could cull valid world
instances and duplicated the admitted runtime-profile authority. Moved shared
site-range and rig-switch facts to reusable canonical contracts.

### Pass 3 - rule compliance and supervision readiness

Preserved all parallel work, classified visual evidence honestly, repaired
provenance/tracker drift, and kept production-art approval distinct from CC0
license evidence. Final hook, commit, push, Sites save/deploy, and production
browser acceptance remain explicit open gates.

## Remaining gates

- [x] Full tests, kernel probe, asset tests/preflight, typecheck, format, build.
- [x] Exact final `4173` browser acceptance.
- [x] Rebuilt exact-final `4174` browser acceptance and bundled asset-boundary
      assertion.
- [x] Inspect the refreshed first-rung desktop and narrow captures.
- [ ] Full motto-v4 hook with fresh attestation.
- [ ] `git add -A`, commit without agent attribution, push, and remote-SHA proof.
- [ ] Sites save/deploy from that exact pushed source state.
- [ ] Public production browser and HTTP acceptance.
- [ ] Update deployment ledger, tracker item `.7`, and this report with final IDs.
- [x] Real-touch first-rung evidence on the rebuilt `4174` surface.
- [ ] External-player comprehension evidence.

## Anything else?

Yes. The immediate product constraint is no longer missing systems; it is
feedback hierarchy and visual breathing room. The next UI pass should show one
primary interaction layer at a time and treat the narrow screenshot as an
active design problem rather than a checkbox.

## Addendum (2026-07-26) — finalized 4173 and 4174 acceptance

The finalized combined harness passed against both required local surfaces:

- `http://127.0.0.1:4173/?acceptance=field-02` — development surface, developer
  asset bridges required and resolved;
- `http://127.0.0.1:4174/?acceptance=field-02` — freshly rebuilt
  production-like surface, developer asset bridges required to be absent.

Both runs completed the real-keyboard first rung without teleporting or
granting state: drive to the authored cache, stop, collect with Space, drive
back into the canonical Home service area, stop, fit Lug tyres through the
workshop button, observe the visible tread, save, reload, and observe the fitted
module again. Both continued through the cross-rig, relay, ramp, terrain-face,
deep-water hover, camera, reduced-motion, desktop, and `390×844` matrix with
zero captured console/page problems.

The harness corrections found during stabilization were contract corrections,
not bypasses:

- the hover fixture now points away from the Sunken Flats stilt so collision
  damage cannot masquerade as drowning;
- the production build expects zero developer bridges on both initial and
  recreated pages;
- cache interaction brakes before Act so momentum cannot leave the pickup
  radius;
- Home return terminates on the real `choose-part` state transition instead of
  requiring point-perfect parking;
- recreated contexts clear storage once before asserting fresh Home berths;
- boot-relative input readiness is no longer numerically compared with
  entry-relative controllable-frame latency.

Visual inspection is deliberately not marked as public-quality closure.
`first-rung-desktop.png` proves the fitted tread and Long Furrow consequence,
but the side camera is too close to the barn/tractor and simultaneous
workshop/HUD layers crowd the frame. The narrow capture is unclipped but still
overloaded. These are active visual-composition tasks, not failures of the
functional first-rung contract.

## Addendum (2026-07-26) — real-touch and clean-install release repair

A mobile `390×844`, `hasTouch` Chrome context now completes the first rung
through real UI events:

- tap Enter;
- read and dismiss the state-derived Drive lesson;
- hold simultaneous on-screen accelerate/steer touch points;
- stop inside the authored cache radius;
- read the contextual Act lesson and tap Act;
- drive back into the Home service area;
- read and dismiss the newly relevant Workshop lesson;
- tap the recommended Lug tyres button;
- wait for the canonical save and verify visible fitted tread after reload.

The final `4174` run passed this touch journey and the existing desktop/camera/
cross-rig matrix with zero captured console/page problems. The touch driver
reads rendered control bounds and dispatches Chrome touch events; it does not
call gameplay mutation hooks.

Sites version 8 exposed a separate clean-install release blocker before build:
`vite-plugin-wasm@3.5.0` did not declare Vite 8 peer compatibility. The
dependency and lockfile now use `vite-plugin-wasm@3.6.0`, whose peer range
includes Vite 8. A clean `npm ci`, production build, 220 tests, 7 kernel tests,
9 asset tests, asset preflight, formatting, diff hygiene, and the full rebuilt
`4174` browser matrix passed after the repair. Version 8 remains a failed
deployment record; the repaired commit must be saved as a new Sites version.

## Addendum (2026-07-26) — current 4180 full acceptance pass

The combined local tree later stabilized long enough for a fresh full browser
run against:

`http://127.0.0.1:4180/?acceptance=field-02`

The exact command was:

```bash
RIGS_UNBOUND_URL='http://127.0.0.1:4180/?acceptance=field-02' \
RIGS_PLAYWRIGHT_MODULE='/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright' \
node tools/rig-lab-browser-acceptance.cjs
```

The run passed with zero captured console/page problems. It proved:

- fresh state-derived first-rung guidance;
- real W/A/S/D traversal to the authored cache and back through a dry route;
- canonical Space collection with no currency or state grant;
- a stationary, physically present rig inside the Home workshop radius;
- pointer activation of the enabled, accessibly named Lug tyres button;
- visible tread state plus the mechanical `effectiveProfile()` consequence;
- save/reload continuity for the fitted module and completed first rung;
- rear-side chase orientation and direct selection of all six cameras,
  including Top-down;
- authored-structure, standing-tree, and felled-tree camera collision;
- solid landmark collision and an open deep-water hover lane that does not
  confuse structure damage with drowning;
- relay, ramp, terrain-face, desktop, and `390×844` integration;
- current performance and persistence instrumentation.

Supporting current-tree checks:

- `npm run typecheck` — passed for the main project and deterministic kernel.
- Focused first-rung, control-guidance, and command/event tests — 32/32 passed.
- Harness and touched-document Prettier checks — passed.
- `node --check tools/rig-lab-browser-acceptance.cjs` — passed.

Tier 4 visual inspection confirms that the desktop completion capture clearly
shows the fitted tread, the “grip upgraded” consequence, and the Long Furrow
direction. The narrow capture is functional and unclipped, but it remains dense:
the contextual lesson, workshop, navigator, instruments, and touch controls
compete for attention. That is active composition debt, not a failed input or
layout assertion.

[ADR-0024](../decisions/ADR-0024-browser-acceptance-renderer-lifecycle.md)
records why real-key traversal runs in an isolated renderer process while
retaining the public input and interaction contracts.

This pass did not close the release matrix. The rebuilt `4174` preview had
already passed; the remaining gaps were the complete real-touch first-rung,
external-player comprehension, commit/push, Sites deployment, and
public-production checks.

## Addendum (2026-07-26) — fresh rebuilt 4182 persistence proof

A new `npm run build` passed main and deterministic-kernel typechecks, Vite
client/server compilation, and the player asset-boundary check. The exact
resulting build was then served at `http://127.0.0.1:4182/` and exercised with:

```bash
RIGS_UNBOUND_URL='http://127.0.0.1:4182/?acceptance=field-02' \
RIGS_EXPECT_DEVELOPER_BRIDGES=0 \
RIGS_PLAYWRIGHT_MODULE='/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright' \
node tools/rig-lab-browser-acceptance.cjs
```

The first run exposed an acceptance-harness race: it waited for any non-empty
periodic save and then immediately asserted that the just-completed relay was
present. The production preview could satisfy the first condition with an
earlier save. The harness now waits for the persisted v6 payload to contain
`cargoRelay.status === "complete"` and non-zero save bytes. No gameplay
shortcut or state grant was introduced.

The corrected full run exited 0 with zero captured console/page problems. It
reproved the real-key first rung, visible and persisted Lug tyres, cargo relay,
all six camera policies, signed rear chase, structure/tree camera collision,
three terrain-face refusals, ramp and deep-water hover, reduced motion,
desktop and `390×844` layouts, touch emergency recovery, private bridge
absence, and performance instrumentation.

## Addendum (2026-07-27) — canonical naming cleanup committed on main

The checkpointed first-rung package is now committed and pushed on `main` as
`8de9a5e`. The runtime boundary now names the workshop lesson cue explicitly as
`workshopLessonRelevant`, which keeps the lesson label aligned with the
canonical spend-ready first-rung state instead of generic workshop availability.
This addendum updates the historical checkpoint only; public deployment and
external-player comprehension remain separate open gates.

This adds Tier 3 production-like local integration evidence. The build still
reports the tracked Three.js chunk advisory.

### Full real-touch first-rung follow-up

The harness now runs a second fresh first-rung profile in a `390×844`,
`hasTouch` mobile context. Chrome touch events hold the public
`data-hold-action` buttons, including simultaneous throttle and steering. The
flow:

1. enters the world through the touch button;
2. observes and dismisses the state-derived driving lesson;
3. drives to the authored cache with the visible touch controls;
4. observes the newly relevant contextual Act lesson;
5. collects through touch Act;
6. returns to the canonical Home service area;
7. observes the newly relevant workshop lesson;
8. taps the accessible recommended Lug tyres control;
9. waits for the fitted module in the persisted v6 payload;
10. reloads and observes both canonical completion and visible tread.

The full `4182` production-like matrix then exited 0 with zero captured
console/page problems. Its evidence payload reports the touch cache approach,
stop, Home approach, stop, restored first-rung state, fitted module, and visible
module independently from the keyboard result. Touch emergency recovery also
continues to pass.

This closes the local full-touch implementation gate at Tier 3. External-player
comprehension, a release-authorised commit/push, Sites deployment, and public
production remain open.

## Addendum (2026-07-26) — Sites version 9 public-production acceptance

The release-authorised dependency repair was committed as
`58968333c616cdd055b94ef11c29e69109df3a24`, pushed to `origin/main`, saved as
Sites version
`appgprj_6a64c10e5a2c8191ad80278ea124aa6b~appgver_8d8b9b737464819189a7663efc1dc29e`,
and deployed successfully as
`appgdep_6a66391c33ac8191905ac87775b1585e`.

The default public URL and `?acceptance=field-02` returned HTTP 200. A full
public browser run then exited 0 with zero captured console/page problems. Its
fresh `390×844`, `hasTouch` profile:

1. entered through the visible touch control;
2. drove with rendered throttle/steering controls;
3. stopped when guidance changed to `Collect the salvage`;
4. collected through touch Act;
5. returned to Home Silo;
6. fitted Lug tyres through the accessible workshop control;
7. reloaded and observed canonical `free-explore` completion and visible
   `lug-tires`.

This closes the public-production real-touch implementation gate at Tier 4.
It does not close external fresh-player comprehension. Exact deployment
provenance, checks, observations, gaps, rollback, and handoff are recorded in
[Sites Version 9 Release](SITES_VERSION_9_RELEASE_2026-07-26.md).
