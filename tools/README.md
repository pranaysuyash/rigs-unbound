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

The ceiling lives in `package.json`'s `audit:reachability:budget` script and is
deliberately **not restated here**. It was restated here once, as "currently
29", and drifted: the ratchet was lowered to 25 and this line was not updated,
so the document that explains the ratchet was the thing quietly misreporting it.
Read the script for the number.

It is a ratchet: lowering it is a deliberate act taken when a tranche item
lands, and raising it requires a recorded reason. Archiving a module is a
legitimate way to reduce the count — the goal is that pre-positioned work is
_declared_ rather than accumulated by inattention.

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

### Deferral

"Unreachable" was carrying three states that need three different responses:

1. **Not yet connected** — connective work is all that's missing. Wire it.
2. **Must not be connected** — an accepted decision forbids it. Quarantine.
3. **Cannot be connected yet** — wiring it today would create a parallel system
   or fabricate behaviour the game does not have.

State 3 had no representation, so it read as state 1. That is not a cosmetic
gap: a review read two unreachable module names, inferred that connective work
was all that stood between them and shipping, and published "wire these two
modules" as a priority action. Both were the wrong modules for the feature, and
one would have stood up a second soil model beside the canonical one.

The `DEFERRED` registry represents state 3. Each entry names the **precondition**
that would unblock it and a **rationale** explaining what the module actually
does — the second field exists because a module's _filename_ is what misled the
review in the first place.

Two design properties are load-bearing:

- **Deferred modules stay in the unreachable budget**, unlike quarantined ones.
  Quarantine is permanent and decided, so excluding it is right. Deferral is
  temporary and conditional — it is _supposed_ to resolve — so it must keep
  counting, or the budget stops applying pressure exactly where pressure is
  still wanted. Excluding deferrals would also make the registry an escape
  hatch: label anything inconvenient "deferred" and the budget means nothing.
- **A stale entry fails the audit** (`❌ Stale registry entries`, non-zero exit).
  Two rot modes: an entry naming a module that no longer exists, and a deferred
  module that has become reachable — precondition met, entry left behind, now
  asserting a blocker that is gone. Either turns the registry into folklore that
  outlives the fact it described.

`findStaleRegistryEntries` is exported and pure so it can be tested on synthetic
input. It cannot be tested through a fixture tree: the registries name paths in
this repository, so any fixture root reports every entry as stale. For the same
reason the live check is gated on the audit root being this repository.

### Shared blockers

An entry may carry a `sharedBlocker` slug naming the missing capability it waits
on. When two or more entries share a slug, the audit groups them and reports the
combined line count.

This exists because free-text preconditions hide shared causes. Two entries
described the same absent concept — player-owned operating-light state — in
different words, and read as two unrelated blockers. They are one missing
capability holding back 147 unreachable lines, which is prioritisation
information the flat list destroyed.

Read a grouping as **necessary, not sufficient**: clearing a shared blocker may
leave an entry still waiting on something else, so it never discharges an entry
on its own. Blockers unique to one module are not promoted — that module's
precondition already says it, and repeating it under a second heading is padding.

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

## Rig ground-contact acceptance

`rig-ground-contact-acceptance.cjs` proves the rig a player sees is touching the
ground they see it on — for every rig, at several places on the terrain.

It exists because that was not true. Every rig shipped floating: both ground
rigs sat exactly `rideHeight` above the terrain (0.95 m and 0.62 m) and the
hover rig 0.63 m above its own shadow, with its lift skirt 0.82 m clear of a
0.55 m cushion. The models were authored with y = 0 at the ground while the
simulation positions their root at the **body origin** — two defensible frames
that differ by exactly the ride height.

The reason it is a browser check rather than a unit test is the more useful
lesson. `rig-blockout.test.ts` proves the authored geometry agrees with
`RIG_PROFILES`, and it passed throughout: a model can be internally perfect and
still be mounted at the wrong height, because the defect lived in the
relationship between the scene graph and the terrain mesh, and no authored
constant participates in that relationship. Authored numbers compared against
authored numbers agree with themselves. This tool measures the relationship
instead — world-space tyre extents, shadow position, and hover-skirt edge
against `world.terrain.height` beneath each — via
`window.getRigGroundContactEvidence()`, the sibling of the existing
`getRigOrientationEvidence()` and for the same reason.

Per sample it asserts: the body origin sits within 1 m of `terrainY +
rideHeight` (the simulation's own contract, checked here so a failure can be
attributed to presentation rather than to traversal), `|shadowGap| <= 0.25`,
all four measured tyres within 0.6 m, and a hover skirt gap that reads as a
cushion (0.1–1.2 m) rather than as a float. It samples three places
(`spawn-flat`, `north-rise`, `west-fall`) because a flat-ground check passes on
a rig whose contact is correct at spawn and wrong on a slope, and calls
`window.advanceTime(600)` before each read so the suspension has settled.

Start the canonical server on port `4173`, then run:

```bash
npm run test:ground-contact
```

Measured at the fix (2026-08-11): tractor tyre gaps −0.033…+0.020 m, buggy
−0.023…−0.022 m, shadows 0.028–0.045 m off the surface against the deliberate
`GROUND_DECAL_LIFT` of 0.04, and skimmer skirt gaps 0.538–0.547 m against the
0.55 m cushion — with `bodyOriginY - terrainY` equal to `rideHeight` to three
decimals at every skimmer sample.

## Weather scene-presence acceptance

`weather-scene-browser-acceptance.cjs` proves the weather clock reaches the 3D
scene and not only the CSS shell.

The failure it guards against is a specific and easy one: a weather system whose
visible output is a tinted overlay and a HUD string looks like it works from
outside, because both of those are downstream of the same phase value the check
would read. So this tool reads the scene instead — it advances the deterministic
clock until the phase enters `rain`/`storm`, polls until the eased rain value
converges, and then requires that the instanced rain cloud is actually visible
with non-zero opacity, that exp-2 fog density has risen **above the phase base**
(`fogDensity > phaseBaseFogDensity`, so a phase-table lookup alone cannot
satisfy it), and that the diegetic terrain hazard readout is populated.

Polling rather than a fixed wait is deliberate: the rain value is eased, so a
single timed read either flakes or has to be padded to the worst case.

Start the canonical server on port `4173`, then run:

```bash
npm run test:weather-scene
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

## Asset manifest coverage audit

`audit-asset-manifest-coverage.mjs` reconciles the manifest against what is
actually on disk. It exists because the preflight above and the player-build
boundary assert (`assert-player-build-assets.mjs`) are both **manifest-driven**:
they iterate `manifest.entries` and check each entry's claims. That direction of
traversal has a blind spot by construction — an asset nobody declared has no
entry to iterate, so every manifest-driven check passes it silently.

This tool walks the filesystem first and reports three disagreements:

1. **Undeclared runtime binaries** — a `.glb`/`.gltf` on disk that no entry
   declares. It has no recorded provenance, rights status, or distribution
   approval, and the build guard cannot see it.
2. **Declared but absent** — an entry whose `runtimePath` points at nothing.
3. **Export deferred, yet the file exists** — an entry recording
   `runtimePath: null` while a file sits at the conventional
   `<assetRoot>/<id>.glb` slot. This is the subtle one: the rights and approval
   status recorded against that entry no longer describes bytes that exist.

```bash
npm run audit:asset-coverage          # human-readable report, always exits 0
npm run audit:asset-coverage:strict   # exits 1 when there are findings
npm run test:asset-coverage           # self-tests for the audit itself
node tools/audit-asset-manifest-coverage.mjs --json
```

`node_modules`, `.git`, `dist`, `coverage`, and `.vite` are skipped, and only
shippable runtime formats are in scope — source art and reference images are
tracked with `runtimePath: null` by design and are not distribution risks.

`verify:head` runs the self-tests and, **as of 2026-08-11, the strict audit**.

The paragraph this replaces said the strict form was "deliberately not gating
yet: the tree has open findings whose resolution is an operator decision, and a
gate that fails the moment it lands teaches people to bypass gates. Promote
`audit:asset-coverage:strict` into `verify:head` once the findings below are
dispositioned." That reasoning was sound and its condition is now met. Both
findings are dispositioned — `field-plough-01` reconciled (its GLB is declared,
and the entry now states each artifact's build disposition separately) and
`plow_4_furrow.glb` removed as unprovenanced (see
`docs/research/ASSET_PROVENANCE_REGISTER.md`, addendum 2026-08-11). Strict now
reports "Manifest and filesystem agree. No findings." and exits 0, so it was
promoted while green, which is the only moment a gate can be added without
teaching anyone to bypass it. The non-strict script remains for local reading.

Self-tests live in `audit-asset-manifest-coverage.test.mjs`. Each builds a
throwaway fixture tree provoking exactly one finding, because a tool that has
only ever reported "clean" is not evidence that it can report anything else.
Two cases mirror findings that were live when the tool was written: a GLB swept
into the repository root, and a deferred entry whose GLB exists anyway. Both are
now fixed in the tree, which is exactly why those fixtures matter — they are the
only remaining proof the tool can still detect them.

`auditAssetManifestCoverage(manifestPath, repoRoot)` is exported so a future CI
surface can call it without reimplementing the reconciliation.

## Player build asset boundary

`assert-player-build-assets.mjs` is the last gate in `npm run build`. It answers
one question: did anything the manifest has not cleared for public distribution
reach `dist/client`?

The subtlety it exists to handle is that **one manifest entry can name two
artifacts that ship by completely different mechanisms**:

| Manifest field | Example | How it would reach the player |
| --- | --- | --- |
| `sourcePath` | an authored procedural factory (`.ts`) | the bundler **compiles it in** when player code imports it |
| `runtimePath` | an exported `.glb` | only if something **copies the bytes** into `dist` |

So the tool checks two invariants that are easy to conflate:

- **Containment** — unapproved *bytes* must not ship. This is the only invariant
  that can actually put an artifact in a player's hands. Checked unconditionally.
- **Disclosure** — an unapproved developer-only *identity* should not become a
  discoverable public manifest, even with no bytes copied.

These come apart whenever an asset's source form legitimately ships while its
runtime binary does not. `field-plough-01` is exactly that case: the factory at
`sourcePath` is imported by `src/game/renderer.ts:55` and stamps
`userData.assetId`, so the id string is in the bundle *by construction*, while
the GLB stays out of `dist` behind the copy gate in `vite.config.ts`.
`publicRuntimeApproved` is named for, and scoped to, the runtime artifact; a
single boolean cannot also say "the source ships". `sourceFormInPlayerBuild`
carries that, and the tool **verifies the claim rather than trusting it**:

1. It never relaxes containment. Byte presence and export-path references are
   flagged regardless of the declaration.
2. It must stay load-bearing. If an entry claims its source form ships but the id
   appears in no bundle, the exemption has rotted and is reported as stale. An
   exemption nobody re-checks is how an allowlist quietly stops meaning anything
   — see the formatting-gate note at the end of this file for the same failure.
3. Accepted exemptions print as `note:` lines, so a passing run still says which
   identities were excused and why.

```bash
npm run assets:assert-player-build     # runs against dist/client
npm run test:player-build-boundary     # self-tests for the boundary logic
```

`evaluateBoundary` and `selectGuardedEntries` are exported pure functions, so the
self-tests drive the branches directly without building a dist tree. Two older
integration cases still live in `asset-preflight.test.mjs`, where they reuse that
file's GLB fixture helpers.

What this tool **cannot** prove: that a bundle occurrence of an id came from the
declared `sourcePath` rather than some other reference. It proves the bytes are
absent, which is the invariant that governs what a player can obtain.

Adding a field to the manifest means updating **three** places, none of which
derive from the others: `assets/asset-manifest.schema.json` (which sets
`additionalProperties: false`, so an undeclared field is rejected outright),
`asset-preflight.mjs` (which validates independently of the schema), and this
tool if the field affects the boundary.

## GLB provenance inspector

`inspect-glb-provenance.mjs` reports where a GLB came from and what is inside it
without opening a 3D tool. `asset.generator` is the cheapest provenance signal a
GLB carries — exporters stamp themselves — and nothing here was reading it.

```bash
npm run assets:inspect-glbs                            # every .glb in the tree
node tools/inspect-glb-provenance.mjs a.glb b.glb
node tools/inspect-glb-provenance.mjs --json a.glb
npm run test:glb-provenance
```

It was written during the 2026-08-11 GLB disposition, because "where did this
binary come from" had been asked three times across two weeks and answered by
hand each time. Run over the tree, generator strings partitioned the set exactly
along the provenance boundary that mattered:

| File | Generator | Materials | Origin |
| --- | --- | --- | --- |
| `assets/runtime/field-plough-01.glb` | `THREE.GLTFExporter r185` | 22 | repo-authored, this pipeline |
| `assets/runtime/kenney-car-kit-*.glb` | `UnityGLTF` | 1 | Kenney kit, registered |
| `plow_4_furrow.glb` | `trimesh` | 0 | unestablished — removed |

Use it to vet any imported blockout **before** registering it in the manifest: a
generator that matches no pipeline here, combined with zero materials and
auto-generated node names (`world`, `geometry_0`), is the signature of an
unprovenanced dump rather than authored art. It reports what the bytes say and
makes no rights determination; that judgement is a human's.

It also validates the container itself — magic, chunk bounds, header length
against real file size — and exits 2 on any unreadable file, so it doubles as a
cheap integrity check on an asset drop.

## Slice binding claim audit

`audit-slice-binding-claims.mjs` cross-checks the module disposition table in
`docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` §6 against the real import
graph. It exists because the table was a hand-maintained claim about a set the
graph already derives, and between 2026-07-29 and 2026-08-07 every one of the
ten binding claims checked by hand in this document was wrong — some named
plausible-but-wrong modules, others parked modules the graph actually reached.

This is the third tool that replaces a hand-curated list with a machine-derived
comparison, alongside `audit-runtime-reachability.mjs` (import graph budget)
and `audit-asset-manifest-coverage.mjs` (asset registration). The failure shape
is the same each time: a human list and a machine-derivable set drift because
nothing compares them.

```bash
npm run audit:slice-bindings          # human-readable report, exits 1 on contradiction
npm run test:slice-bindings           # self-tests for the parser and cross-check
node tools/audit-slice-binding-claims.mjs --json
```

The tool only checks **bookkeeping** — whether a named module exists, whether
the counts agree, and whether the disposition (wired/archived/conditional)
agrees with the import graph's reachable/unreachable measurement. It **cannot**
prove the semantic half: that the named module actually models the mechanism the
quest needs. A green run means the table's numbers are sound; it does not mean
the design claims are true. Ten binding claims in this document were wrong, and
three of them (`electrical-grid.ts`, `world-memory.ts`, `signature.ts`) were
wrong for a reason this tool cannot catch: a module named for what the quest
*intended* was mistaken for one that implemented the *mechanism*.

`verify:head` runs both the self-tests and the audit. The audit exits 1 on any
contradiction, so it gates on agreement between the spec and the tree.

### Finding kinds

| Kind | What it catches |
| --- | --- |
| `missing-module` | A disposition names a file that does not exist in `src/` |
| `ambiguous-module` | A basename resolves to more than one source file |
| `count-mismatch` | A group's declared count disagrees with its listed modules |
| `total-mismatch` | The heading total disagrees with the sum of the groups |
| `duplicate-disposition` | A module appears under two conflicting groups |
| `undispositioned-unreachable` | An unreachable module never appears in any group |
| `unknown-group` | A group label the tool does not recognise (modules would be silently skipped) |
| `wired-but-unreachable` | Claimed wired, but the graph cannot reach it, with no recorded deferral |
| `wired-but-quarantined` | Claimed wired, but the reachability audit quarantines it |
| `archived-but-reachable` | Claimed parked, but the graph actually reaches it |

### Note kinds (informational, not failures)

| Kind | Meaning |
| --- | --- |
| `wired-pending-deferral` | Claimed wired, unreachable, but has a recorded deferral explaining why |
| `condition-resolved` | A conditional module is reachable — the condition has been met |

### Verifying: add a new entry to §6 then run the audit

To update the disposition table when a module status changes:
1. Edit the relevant group in `docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` §6
2. Update the group's declared count
3. Ensure the heading total still equals the sum of the groups
4. Run `npm run audit:slice-bindings` — it exits 0 when everything agrees

Self-tests in `audit-slice-binding-claims.test.mjs` (18 tests) use inline
fixtures, not the real spec, so a legitimate spec edit never breaks the parser
tests. This is the same pattern as `audit-runtime-reachability.test.mjs`.

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

## Complete-slice acceptance and the night-beat probe

`tools/complete-slice-browser-acceptance.cjs` (GD-05) drives the whole opening
slice in headless Chrome: salvage, restoration, module fitment, first-cut
ploughing, the Water Before Night choice, the authored first-night threat, and
the finale gate. As of 2026-08-25:

- **Step 6 (night threat) is a real assertion.** It advances world time to
  night via `window.advanceTime` and requires the authored threat diagnostic in
  `lastDiagnostic`. The previous version read snapshot fields that do not exist
  in the observability contract (`firstNightThreatResolved`, `obstacles`) and
  passed vacuously — it had never verified this beat.
- **Step 7 (finale) fails honestly instead of passing vacuously.** The finale
  needs the sunken-relay causeway, which this harness does not complete, and
  the text contract exposes no finale state. The gate names both follow-ups.
- `tools/probe-night-beat.cjs` is the minimal reusable probe for the night
  beat alone (fresh save → real restoration path → waterworks branch → forced
  night → authored diagnostic assertion).

```bash
node tools/start-canonical-dev-server.cjs
node tools/probe-night-beat.cjs
node tools/complete-slice-browser-acceptance.cjs   # currently red: step 7 gap + PCFSoftShadowMap console warnings
```

## Canonical dev-server launcher (identity-checked)

`tools/start-canonical-dev-server.cjs` does not treat "port responds" as
healthy. It probes `GET /src/main.ts` and requires a JavaScript transform
containing the `render_game_to_text` marker, so only this project's Vite dev
server passes. If another process owns port 4173 (twice in one day a
`python -m http.server` serving an unrelated project squatted it and made every
acceptance script fail at bootstrap with a misleading timeout), the launcher
prints the `lsof` port-owner evidence and the exact kill command, and exits 1.
It never kills unknown processes itself.

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

## Rig asset envelope (dimensional contract for reconstructed rigs)

`derive-rig-asset-envelope.ts` emits the dimensional envelope a generated or
imported rig model must satisfy, and audits a candidate `.asset.json` against it.
The comparison logic lives in `rig-asset-envelope.ts` beside it and is unit tested
inside `npm run test` (`vitest.config.ts` collects `tools/**/*.test.ts`), so this
file is a thin CLI over a tested module rather than a second implementation.

It lives in `tools/` rather than `src/game/` on purpose, and the reason is the
general rule for this directory: **tools may depend on the runtime; the runtime
must never depend on a tool.** An earlier draft put the module in `src/game/`
merely because vitest collected only `src/` tests, and `npm run audit:slice-bindings`
correctly refused it — `audit-runtime-reachability.mjs` scans `src/`, and an
authoring-time contract checker sitting there is 452 lines of noise in a budget
that exists to pressure *unwired gameplay*. Put a new TypeScript tool here, name
its test `*.test.ts`, and both properties hold: it is typechecked (`tools` is in
`tsconfig.json`'s include), unit tested by `npm run test`, and invisible to the
runtime reachability graph.

**Why it exists.** The `img2threejs` forge pipeline reconstructs a Three.js model
from a reference plate, and it works — `field-plough-01` went through it end to
end. Pointing it at a *rig* introduces one problem a plough does not have.
`field-plough-01.asset.json` declares its root as
`{width: 3.8, height: 1.8, depth: 1.35, confidence: 0.3}`; that low confidence is
honest and harmless, because nothing in `physics.ts` reads a plough's width. A
rig's `track`, `wheelbase`, `wheelRadius`, and `rideHeight` are the opposite case:
they *are* simulation inputs. Estimating them from a photograph is structurally
the same act as hand-writing them as literals in the renderer — which is exactly
the drift that left every rig floating above the terrain by precisely its ride
height (see
[`docs/WORKLOG_ADDENDUM_2026-08-11.md`](../docs/WORKLOG_ADDENDUM_2026-08-11.md)).

So for rigs the pipeline is inverted at the dimensional layer:

- the reference plate supplies **form** — which subassemblies exist, proportions
  within a derived extent, materials, greebles, wear, silhouette character;
- `RIG_PROFILES` supplies **dimensions** — footprint, ride height, wheel radii,
  contact-point placement, decal lift.

The plough spec already states the rule in prose
(`runtime.visualAuthority: "generated meshes never define physics truth"`). This
tool makes that sentence executable.

```bash
# Emit one rig's envelope, or all of them
npm run assets:rig-envelope -- utility-tractor
npm run assets:rig-envelope -- --all --out envelopes.json

# Audit a candidate spec (rig id from runtime.adapter.rigId, or --rig)
npm run assets:rig-envelope -- --check assets/specs/some-rig.asset.json
```

Exit codes: `0` clean, `1` drift found, `2` usage/input error — so it can gate a
pipeline step.

Behaviours worth knowing about, each of which encodes a lesson rather than a
preference:

- **A non-`rig` spec is refused, not audited.** Run it on the plough and it says
  so and exits 0. A part's dimensions are art direction; reporting them as drift
  would be noise that trains people to ignore the tool.
- **The rig id is never guessed from `assetId`.** Declare it as
  `runtime.adapter.rigId` (the section where the plough already declares its
  `attachmentId`) or pass `--rig`. Binding the wrong profile would produce a
  confident, wrong comparison, which is worse than no check.
- **`coordinateFrame.origin` is checked for the ground frame** by keyword, and a
  miss is a failure with an explanation. Prose cannot be parsed, so a *pass* is
  the reviewer's call, not the tool's — but the cost of not asking is a drift
  report where every node is wrong by the same amount for one reason.
- **A uniform offset is reported as one cause, not N.** If every position drift is
  the same offset on the same axis, the tool leads with that and names
  `rideHeight` when it matches. This is the diagnostic lesson of the float
  promoted into code: reported as "seven nodes are at the wrong height", a
  reviewer edits seven numbers and the frame stays broken. It needs at least three
  agreeing nodes and refuses if any dimension drift is also present, so it cannot
  dress up a coincidence as a systemic cause.
- **Extra nodes are ignored.** A reconstruction is *expected* to model a cab, a
  boom, a beacon. The envelope constrains what the simulation determines and
  nothing else; each envelope also lists its `authorable` facts explicitly, so
  "not derived" is distinguishable from "forgotten".

**It deliberately does not scaffold schema-legal components.** Emitting
`role: "TODO"`, `materials: ["placeholder"]` and friends would make a spec pass
`npm run test:assets` before anyone had authored it, and a green check that is
evidence of nothing is worse than no spec at all. Read the envelope, author the
form against it, then let `--check` refuse the drift.

**Current blocker for the tow-recovery rig** (2026-08-11): the only rig-scale
reference plate in the repo is
`assets/generated/utility-tow-recovery-01-object-reference-2026-07-29.png`, and
there is no `utility-tow-recovery` entry in `RIG_PROFILES` — so `--check` has
nothing to bind it to, and speccing it as `assetFamily: "rig"` would mean
inventing a fourth playable rig (physics tuning, unlocks, save migration). The
tracker's own sequencing agrees: *"once this module passes, the same contract can
be reused for the tow boom, winch, stabilizer, wheel, and beacon modules before
the full utility tow rig is attempted"*
(`docs/plans/MASTER_EXECUTION_TRACKER.md:2966`). Those parts are `rig-part`
family, carry no dimensional contract, and `winch` is already a real module
(`src/game/first-rung.ts:21`). Parts first.

## Playtest movement heatmap (from ghost trails)

`heatmap-from-ghost-trail.ts` answers "where do players actually go" from data
the runtime already records: `GhostTrailRecorder` (`src/game/ghost.ts`) samples
rig position at 10Hz during play, and the browser console command
`window.getGhostTrail()` (wired in `src/main.ts`) exports the current
session's trail as JSON. This tool takes one or more of those exports and
renders an SVG heatmap of visited ground, plus a per-`WORLD_SITE`
reachability report — directly applying the BOTW playtest-heatmap technique
(instrument where players walk, treat unvisited hand-placed sites as a design
signal, not a footnote) documented in
[`docs/research/GAME_DESIGN_BEST_PRACTICES_2026-08-01.md`](../docs/research/GAME_DESIGN_BEST_PRACTICES_2026-08-01.md).

It is read-only analysis over voluntarily-exported session data — no runtime,
save-schema, or always-on telemetry changes.

```bash
# During or after a play session, in the browser console:
copy(window.getGhostTrail())   # or JSON.stringify + save to a file manually

# Then, offline:
npx vite-node tools/heatmap-from-ghost-trail.ts session1.json [session2.json ...] \
  --out heatmap.svg --grid 48
```

Output: an SVG heatmap (`heatmap.svg` by default) plus a stdout report listing
every `WORLD_SITE` with its within-`discoverRadius` sample count across the
supplied sessions, flagging any site with zero hits as never reached in that
batch. Multiple session files aggregate into one heatmap, so this scales from
a single manual playtest to a batch of scripted `*-browser-acceptance.cjs`
runs once one of those is wired to call `window.getGhostTrail()` before
exiting.

---

## The formatting gate covers `tools/` now (2026-08-06)

`format:check` used to glob `"tools/**/*.cjs"`. Every tool in this directory
written as `.mjs` or `.ts` — which is all 11 audit tools, including the
reachability budget enforcer that gates the build — was therefore never
format-checked. Three were unformatted when this was found.

The underlying defect was an asymmetry between the two halves of the same
concern:

| script         | scope                                             |
| -------------- | ------------------------------------------------- |
| `format`       | `prettier --write .` — the whole tree, unfiltered |
| `format:check` | a hand-maintained enumerated allowlist            |

A fixer that rewrites everything paired with a checker that inspects a list
means any file type nobody remembered to enumerate is silently exempt from the
gate while still being reformatted by the fixer. New extensions and new
directories fall into that blind spot by default, and nothing reports it — the
gate stays green precisely _because_ it isn't looking.

The glob now reads `"tools/**/*.{cjs,mjs,ts}"` and `"*.html"` (was the single
`index.html`, while `accessibility.html`, `box3d-lab.html`, and
`physics-lab.html` sat outside). Widening it added exactly one new failing
file, `accessibility.html`, to a gate that was already failing on 52 — so the
gate's red/green status is unchanged by the widening, and the `format` script
already fixes all of them.

**This is not the same problem as the formatting backlog.** The backlog — 43
files unmodified at HEAD that do not satisfy `prettier --check` — is "the gate
existed and was not enforced at commit time." The glob gap was "the gate
structurally could not see these files." Clearing one does not close the other,
and the widening above deliberately does not attempt the backlog: see the
2026-08-06 WORKLOG entry for why that sweep needs operator sequencing.

If you add a tool here in a new language or extension, extend the glob in the
same change. Better, if you are touching this anyway: replace the allowlist
with an ignore-list (`prettier --check .` plus `.prettierignore`), so the
checker and the fixer describe the same set by construction and the blind spot
cannot reopen. That was not done here because `prettier --check .` currently
sweeps `docs/` — 100+ prose files with hand-wrapped tables — and that is a
scope decision for the operator, not a formatting fix.
