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

- [ ] Full tests, kernel probe, asset tests/preflight, typecheck, format, build.
- [ ] Exact final `4173` browser acceptance.
- [ ] Rebuilt exact-final `4174` browser acceptance and direct asset-path checks.
- [ ] Inspect the refreshed first-rung desktop and narrow captures.
- [ ] Full motto-v4 hook with fresh attestation.
- [ ] `git add -A`, commit without agent attribution, push, and remote-SHA proof.
- [ ] Sites save/deploy from that exact pushed source state.
- [ ] Public production browser and HTTP acceptance.
- [ ] Update deployment ledger, tracker item `.7`, and this report with final IDs.
- [ ] Real-touch and external-player comprehension evidence.

## Anything else?

Yes. The immediate product constraint is no longer missing systems; it is
feedback hierarchy and visual breathing room. The next UI pass should show one
primary interaction layer at a time and treat the narrow screenshot as an
active design problem rather than a checkbox.

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

This pass does not close the release matrix. Exact-final 4174 rebuilt preview,
real touch, external-player comprehension, commit/push, Sites deployment, and
public-production checks remain open.
