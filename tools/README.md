# Project tools

## Documentation authority-language audit

`audit-doc-authority-language.mjs` recursively scans Markdown for high-risk
decision, operator-attribution, recommendation, and implementation language.
It reports review candidates with file/line evidence; findings are not
automatically errors because an `Accepted` decision can be legitimate when its
sign-off is traceable.

```bash
node tools/audit-doc-authority-language.mjs docs
node tools/audit-doc-authority-language.mjs --json docs/decisions docs/research
node --test tools/audit-doc-authority-language.test.mjs
```

Use `--fail-on-findings` only after a reviewed allowlist or a zero-finding
policy is intentionally adopted. The default audit is non-mutating and prints
Markdown so status-inflation work can be reproduced without ad-hoc searches.

## Runtime reachability audit

`audit-runtime-reachability.mjs` answers a question the documentation cannot
answer about itself: **which modules can a player actually reach?** It walks the
transitive import graph from the real entry points — root-level HTML shells plus
the build configs — and reports every non-test source module the traversal never
visits.

```bash
node tools/audit-runtime-reachability.mjs
node tools/audit-runtime-reachability.mjs --json
node tools/audit-runtime-reachability.mjs --max 30
node --test tools/audit-runtime-reachability.test.mjs
```

Why transitive rather than "does anything import this?": orphans travel in
clusters. `expedition-economy.ts` has an importer, but only
`salvage-crafting.ts`, which is itself unreachable. A per-file grep reports that
pair as healthy; the graph walk does not.

Deliberate exclusions, so the number stays trustworthy:

- ambient `.d.ts` declarations are never runtime imports and are skipped;
- `vite.config.ts`, `vitest.config.ts`, and `worker/index.ts` count as entry
  points so build-time plugins are not reported as orphans;
- HTML shells under `docs/` (archived evidence previews) do **not** confer
  reachability — only root-level shells do.

A module that is typechecked, tested, and documented but unreachable is an
_unreachable claim_: behaviour the player can never observe. Absence of a path
is the strong signal. Presence of a path only proves the module is wired, not
that it is exercised.

### The budget

`--max N` is a **budget, not a purity gate**: a declared ceiling with an explicit
allowance for deliberate pre-positioned work.

```bash
npm run audit:reachability:budget
```

The ceiling is currently **29**, recorded in `package.json`. It is a ratchet:
lowering it is a deliberate act taken when a tranche item lands, and raising it
requires a recorded reason. Archiving a module is a legitimate way to reduce the
count — the goal is that pre-positioned work is _declared_ rather than
accumulated by inattention.

### Quarantine

Some modules must **never** be admitted, not merely "not yet". The audit carries
an explicit quarantine list; importing one of those from anything reachable from
an entry point prints `❌ Quarantine violations`, exits non-zero, and fails
`verify:head`. Quarantined modules are excluded from the unreachable budget,
because counting them would create pressure to "fix" them by wiring them.

Current entry: `src/game/xp-progression.ts` (ADR-0036 — universal XP contradicts
ADR-0018).

Adopted under RU-0911 after ADR-0034 showed the failure this prevents: a
load-bearing decision record asserted a module was wired into the live path when
nothing imported it, and the claim survived a full documentation and release
gate.

## Field 02 browser acceptance

`rig-lab-browser-acceptance.cjs` retains its original Rig Lab filename for
history, but now exercises the current Field 02 Vite build as a player-facing
browser workflow:

- starts from a clean schema-v6 browser state and verifies v6 persistence;
- proves the default player surface hides labs/tuning metrics while the
  developer/acceptance surface exposes them;
- acquires Torque, Spark, and Drift through the real Home-berth proximity rule;
- verifies Home-structure, standing/felled-tree, and per-rig hood camera
  resolution with typed evidence;
- finds obstacle-free extreme faces in the real seeded terrain, then proves all
  three rigs refuse at-rest/high-speed penetration and retain downhill escape;
- uses acceptance-only manual stepping while deterministic terrain fixtures run
  so wall-clock animation frames cannot race scripted input;
- checks contextual primary/blade/recovery labels and aria text;
- drives the tractor to relay cargo through semantic input;
- attaches the cargo, aligns a short final approach through the explicit test
  hook, then tows through the real delivery gate;
- switches to the buggy and drives it over the ramp;
- switches to Drift and crosses water deeper than Torque can ford;
- checks local-save restoration after reload;
- traverses the canonical terrain and physics substrate;
- checks desktop and narrow layouts;
- captures local runtime metrics and browser console/page errors;
- writes reviewed screenshots to `docs/reviews/assets/`.

Acceptance mutation/query hooks exist only when the URL contains
`?acceptance=field-02`; they are not reachable from player controls. The
default run is headless and must close its browser with exit code 0. Use
`RIGS_BROWSER_HEADLESS=0` only for supervised visual debugging.

Start the game on the canonical Vite port (`4173`), then run:

```bash
npm run test:browser
```

## Dynamic world collision acceptance

`collision-browser-acceptance.cjs` isolates the canonical fleet-body collision
contract on the Field 02 acceptance surface:

- drives Torque into a parked Spark with deterministic manual stepping;
- proves the active rig stays on the near side and loses speed;
- proves the parked rig is displaced by the mass-weighted response;
- requires swept contact identity, registered semantic roles, and zero policy
  violations in `render_game_to_text()`;
- checks that the bounded recent-contact buffer remains observable after the
  multi-step browser command;
- rejects console/page errors and writes JSON plus screenshot evidence under
  `docs/reviews/assets/`.

Start the canonical server on port `4173`, then run:

```bash
npm run test:collision-browser
```

This is focused Tier 3 integration plus Tier 4 local browser evidence. It does
not select a future rigid-body solver or claim representative-device handling.

## Shell accessibility acceptance

`shell-accessibility-browser-acceptance.cjs` verifies the player-facing shell
contracts for the public profile line and save announcement:

- the visible profile line stays in the public HUD and reports the current
  quality state;
- the save line stays announced as a live status region;
- the operator diagnostics surface remains hidden from the public HUD;
- the profile and save lines stay separated and non-overlapping at mobile
  width;
- Chrome’s accessibility tree exposes both status lines as readable text.

Run it against the live Vite server:

```bash
npm run test:shell-accessibility
```

If you want the probe to start the canonical dev server for you, set
`RIGS_ACCESSIBILITY_AUTOSTART=1`. The default path stays explicit and expects
the live server to already be running.

Override the browser target or viewport when needed:

```bash
RIGS_ACCESSIBILITY_URL=http://127.0.0.1:4173/?proof=1 \
RIGS_ACCESSIBILITY_WIDTH=390 \
RIGS_ACCESSIBILITY_HEIGHT=844 \
npm run test:shell-accessibility
```

This is local Tier 3/4 evidence for the shell readability and accessibility
contract. It is not a substitute for a manual VoiceOver/NVDA/JAWS narration
pass.

## Shell accessibility summary

`shell-accessibility-summary.cjs` runs the authoritative probe and prints a
compact human-readable summary of the visible profile line, announced save
line, diagnostics visibility, layout separation, and accessibility-tree hit
count.

Run it against the live server:

```bash
npm run test:shell-accessibility:summary
```

Use this when you want the proof in one glance without losing the underlying
evidence command:

- the detailed probe remains the source of truth;
- the summary helper is just the fast reader.

## Open-world causeway browser acceptance

`open-world-causeway-browser-acceptance.cjs` proves the voluntary Sunken Flats
material-consequence path in a new Playwright context, without reading or
changing an interactive browser's save:

- bootstraps only personal Sunken knowledge and a clear Home Silo yard position;
- loads the causeway kit through the ordinary spatial action;
- attaches it through the ordinary cargo action;
- drives the Marsh Skimmer through real fixed-step water traversal until the
  trailing crate enters the delivery radius;
- proves material-derived Sunken capacity, no active mission, no side mission,
  and reload persistence;
- writes a reviewed screenshot and JSON evidence to `docs/reviews/assets/`.

Run against the canonical server on port `4173`:

```bash
npm run test:causeway-browser
```

The acceptance hook does not represent an autonomous player-navigation system.
It sets up independently testable world knowledge and bay position, then proves
the normal load, attach, movement, delivery, and persistence authorities.

## Open-world ecology browser acceptance

`open-world-ecology-browser-acceptance.cjs` uses an isolated browser context
to verify the player-facing ecology surface:

- starts a fresh local world and confirms the three persistent regional groups;
- places the Marsh Skimmer near the real Long Furrow herd without creating a
  route permission, mission, or side mission;
- captures a survey-camera observation of the group in the world;
- writes a screenshot and machine-readable evidence under `docs/reviews/assets/`;
- never reads or mutates the interactive browser profile.

Run it against the canonical server on port `4173`:

```bash
npm run test:ecology-browser
```

The screenshot proves local player-surface visibility, not final art direction
or complete individual-creature interaction design.

## Asset manifest preflight

`assets/asset-manifest.json` is the canonical registry for reviewed source and
runtime asset candidates. It keeps semantic IDs, approval state, rights status,
source/reference paths, and `.glb` runtime paths separate from renderer code.
The registry currently contains concept records and two manifest-owned,
runtime-tested developer bridge fixtures. Their Car Kit 3.0 CC0 evidence,
runtime hashes, loader/fallback behavior, and browser evidence are recorded.
Neither is approved as default player-surface production art or included in a
production build while `publicRuntimeApproved` remains false.

Run the bounded structural preflight with:

```bash
npm run assets:preflight
npm run test:assets
```

The preflight checks manifest shape, stable IDs, approval/runtime-path
consistency, repository-relative paths, source existence, GLB v2 headers and
JSON chunks, embedded BIN sizing, and safe relative external dependencies. It
is not a replacement for the Khronos glTF Validator or browser import testing.

The tool uses the workspace Browser Daemon skill's Playwright installation by default. Override the module location when needed:

```bash
RIGS_PLAYWRIGHT_MODULE=/absolute/path/to/playwright npm run test:browser
```

This is local Tier 3/4 evidence. It is not a public-deployment or representative-device benchmark.

## Replay record inspector

`replay-record-inspect.ts` validates a JSON run-record export against the
deterministic replay subset and prints compact divergence paths when a
checkpoint differs.

```bash
npx vite-node tools/replay-record-inspect.ts /path/to/run-record.json
```

It exits zero only for a verified record. Invalid, truncated, unsupported, and
diverged records exit non-zero, making it suitable for local diagnostics or a
future CI artifact check.

The Field 02 browser harness can preserve a failed touch replay outside the
repository when deeper inspection is needed:

```bash
RIGS_REPLAY_FAILURE_DUMP=/tmp/rigs-touch-run-record.json npm run test:browser
```

## Physics Lab 01 browser acceptance

`physics-lab-browser-acceptance.cjs` verifies the bounded Rapier evidence
fixture:

- settled four-wheel contact and project-owned telemetry;
- positive throttle moving the visually identified front along local positive
  Z;
- steering reaching the raycast wheels and rotating the chassis;
- asphalt, gravel, mud, and ice traversal with ordered grip profiles;
- direct selection of all six camera policies;
- collider debug geometry, 120 Hz selection, and plain-data reset;
- desktop, top-down, debug, and `390 × 844` screenshots;
- non-overlapping narrow controls and zero console/page problems.

Start the Vite server on port `4173`, then run:

```bash
npm run test:physics-lab
```

Override the route when required:

```bash
RIGS_PHYSICS_LAB_URL=http://127.0.0.1:4173/physics-lab.html npm run test:physics-lab
```

The script is acceptance evidence for one wheeled-controller family. It does
not assert final player feel, representative-device performance, or universal
vehicle physics.

## Box3D Probe 01 browser acceptance

`box3d-lab-browser-acceptance.cjs` drives the bounded Box3D physical-wheel
browser route through the same semantic intent and six-camera vocabulary used
by Physics Lab 01. It verifies exact engine/wrapper identity, the five-body
physical rig, forward direction, steering, complete assembly reset, narrow
layout, and clean console output. It also captures desktop, top-down, and narrow
visual evidence in `docs/reviews/assets/`.

Run it against the live server:

```bash
npm run test:box3d-lab
```

## `browser-watchdog.cjs`

A hard deadline for any script that drives a browser. Playwright can throw
_after_ launching a browser but _before_ the calling script's `finally` is
reachable — `newPage()` failing when the host is out of GPU processes is the case
this repository has actually hit. The script then never exits, the browser is
never closed, and the process holds a slot indefinitely. A 14-hour trailer
capture and an 18-hour playtest driver were both lost to that shape.

Every browser-driving script in `tools/` and `artifacts/playtest-explorer/` arms
it at module load. The timer is `unref`'d, so arming it never keeps a finished
process alive; it fires only on a genuine overrun, and exits non-zero so an
overrun reads as the failure it is.

```js
const { armWatchdog } = require("./browser-watchdog.cjs");

armWatchdog({ minutes: 20, label: "trailer capture" });
```

Pick `minutes` from the script's realistic worst case, not its typical case — the
deadline is there to bound a hang, not to enforce a performance budget. Add it to
any new browser script; a script that cannot exit is worse than one that fails,
because a failure is visible.

## Campaign contract browser acceptance

`campaign-contract-browser-acceptance.cjs` proves the quest-semantics tranche
end to end in the live shell:

- bootstraps a clean state and enters the world;
- opens the mission board and asserts the campaign root contract
  ("Sunken Flats Submerged Relay", derived from `src/game/campaign.ts`) is
  listed as an acceptable main-class quest;
- asserts the chained Launch Ridge contract stays hidden until the relay
  completion deed exists;
- selects and accepts the relay contract and verifies it becomes the
  persisted active mission through the public text contract;
- fails on any application console error (headless-GPU driver performance
  warnings are filtered as environmental noise).

Start the canonical dev server (`node tools/start-canonical-dev-server.cjs`),
then run:

```bash
npm run test:campaign-browser
```

## Field-plough procedural candidate compiler and review

`npm run assets:build-field-plough` derives the tool-specific `img2threejs`
spec, validates its strict semantic contract, generates the procedural factory,
and prepares the visual review factory while retaining attachment metadata for
future adapter work. It does not alter `src/game/` or assign simulation
collision authority.

With the canonical Vite server running on port 4173, capture the named review
viewpoints into the repository with:

```bash
node tools/capture-field-plough-review.cjs
```

The review images, browser state, and comparison sheet live under
`assets/workbench/field-plough-01/review/`.
