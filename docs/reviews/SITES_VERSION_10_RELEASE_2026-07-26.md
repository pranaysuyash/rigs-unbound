# Sites version 10 release and production acceptance

Date: 2026-07-26  
Status: released; production browser contract passed; visual follow-ups open  
Source commit: `6b4536f900cc98404767096cd3eb4f45bac53fda`  
Production URL: <https://rigs-unbound.suyashpranay.chatgpt.site>  
Sites version: 10  
Version ID:
`appgprj_6a64c10e5a2c8191ad80278ea124aa6b~appgver_ba475cadf6248191945fa88d29924374`  
Deployment ID: `appgdep_6a664864f3c08191a2e6d5c2cf776600`

## Outcome

The pushed schema-v7/first-rung integration checkpoint is now the public Sites
baseline. The exact pushed commit was reconstructed in an isolated directory,
installed from its lockfile, typechecked, built, passed the player-asset
distribution assertion, packaged with the canonical Sites helper, saved as
version 10, and deployed successfully.

The full browser harness then passed against the immutable production
deployment with no console warnings or errors. This closes the automated
production acceptance gate for the version-10 source state. It does not close
the visual-readability or fresh-player-comprehension gates identified below.

## User-facing behavior proved

- A fresh player can find the guaranteed five-salvage cache, recover it, return
  to Home Silo, fit lug tyres, see the module on the rig, save, reload, and
  retain the fitted result.
- The same first-rung flow works through real touch events at a 390 x 844
  viewport.
- All three rigs can be acquired and controlled.
- Cargo Relay can be completed.
- Terrain faces remain escapable for all three rigs.
- Chase-camera obstruction avoidance, felled-tree release, and hood-camera
  self-intersection contracts pass.
- Reduced-motion presentation preserves steering information while suppressing
  the speed-FOV boost and reducing body motion.
- Narrow controls remain within the viewport and do not overlap the field HUD.
- Production emits no console warning or error during the acceptance sequence.

## Business and team value

- The public build now carries the schema-v7 and first-rung checkpoint rather
  than leaving it local-only.
- Source, package, Sites version, deployment, and production evidence are tied
  to one exact commit, so another agent can deploy or roll back without
  reconstructing provenance.
- The first meaningful reward-and-spend loop is browser-proved on desktop and
  touch, which creates a reliable base for a fresh-player comprehension test.

## Internal and operational value

- The production player-asset boundary excludes unapproved runtime files and
  manifest identities.
- The acceptance harness now expects schema v7 instead of the superseded v6
  contract.
- A concurrency-specific build-coherence failure was isolated from gameplay
  behavior: a local Vite preview can serve a new `index.html` after another
  process rebuilds `dist/`, while the page or harness still expects the earlier
  hashed chunk. Production provided the stable acceptance surface.

## Exact checks and outcomes

From an isolated archive of
`6b4536f900cc98404767096cd3eb4f45bac53fda`:

- `npm ci` — passed; 117 packages installed; zero reported vulnerabilities.
- `npm run build` — passed.
  - application and deterministic-kernel typechecks passed;
  - server and client production builds passed;
  - player-build asset assertion passed;
  - the existing 586.92 kB Three.js chunk warning remains.
- canonical Sites packaging helper — passed.
- Sites source-mirror push — passed.
- Sites version save — version 10 created from the exact commit.
- Sites production deployment — succeeded.

Against version 10 production:

```bash
RIGS_UNBOUND_URL='https://rigs-unbound.suyashpranay.chatgpt.site/?acceptance=field-02' \
RIGS_EXPECT_DEVELOPER_BRIDGES=0 \
npm run test:browser
```

Outcome: passed with `consoleProblems: []`.

Selected observed production evidence:

- desktop average: 8.75 ms/frame, 114.3 FPS, 119 draw calls;
- desktop scene: 39,084 triangles, 156 geometries, 1 texture;
- desktop visibility: 198 candidates and 198 submitted;
- narrow sampled average: 19.33 ms/frame, 51.7 FPS;
- touch first-rung: cache recovered, Home reached, lug tyres fitted, reload
  restored the fitted and visible module;
- Cargo Relay: complete in 4,927 ms;
- save payload: 4,072 bytes.

These are acceptance-run observations, not universal device benchmarks. The
restored and narrow samples contain short/warm-up windows and must not be used
as optimization claims without a controlled benchmark run.

## Invalidated local browser runs

Two local preview attempts were not valid gameplay evidence:

1. port 4186 served an `index.html` that referenced a missing
   `field-D35UUI0O.js`; the fallback HTML response at that module URL caused a
   strict MIME rejection and prevented the acceptance bridge from loading;
2. port 4187 initially advanced to the stale schema-v6 harness assertion, but a
   parallel build later replaced the hashed client output while the rerun was
   active, causing the same missing-bridge symptom.

The schema assertion was corrected to v7 and committed. The production run
passed from an immutable version, so neither invalid local run is classified as
a gameplay regression. A coherent local dev and preview rerun remains open for
environment parity.

## Visual inspection

Tier-4 inspection of the refreshed acceptance screenshots found important
quality gaps even though the automated contract passed:

1. **Narrow chase framing is not acceptable yet.** The camera can sit inside or
   extremely close to the rig/nearby structure, leaving most of the viewport
   filled by flat geometry. The game remains operable, but the world and route
   are difficult to read.
2. **HUD density is excessive.** The field card, radar, signals list, tutorial
   panel, telemetry dials, control strip, and touch controls compete
   simultaneously. The first-session hierarchy is unclear.
3. **Tutorial panels obscure the playfield.** Desktop and top-down screenshots
   place a wide instructional panel across the lower middle of the scene.
4. **Desktop chase framing can still be dominated by nearby structure or the
   rig body.** Collision-path checks pass, but the composition is not reliably
   readable or attractive.
5. **Signals and radar compete for the same right-side attention.** This is
   especially costly while first-rung guidance is also active.

These are release-quality follow-ups, not reasons to falsify the successful
behavioral acceptance result.

## Evidence tiers

- Tier 2: isolated typecheck and production build passed.
- Tier 3: full automated production browser flow passed.
- Tier 4: production deployment observed and screenshots inspected.
- Tier 5: not claimed; no uncontrolled public-player or broad device sample was
  run.

## Verified versus inferred

Verified:

- exact pushed-source build and package;
- Sites version/deployment success;
- declared automated browser behaviors;
- zero harness-observed console problems;
- the visual defects listed above.

Inferred or still unknown:

- whether an unfamiliar player understands the reward, return, fit, and
  post-fit purpose without prompting;
- broader device/GPU/browser performance;
- gamepad and assistive-technology quality;
- whether the current HUD experiments should remain canonical;
- whether first-cut should be mandatory, optional proof, or the opening of the
  next vertical slice.

## Next closure path

1. Treat fitting the first module as completion of the mandatory first rung.
2. Keep first-cut as an immediate optional proof or as the opening beat of
   Unbound Passage, pending the recorded operator decision.
3. Fix narrow chase framing before claiming responsive visual acceptance.
4. Establish a first-session HUD budget and progressive disclosure policy.
5. Rerun local dev and preview acceptance from a stable, non-mutating build.
6. Conduct a fresh-player comprehension test.
7. After the next coherent tranche: preservation audit, full hook, commit,
   push, exact-source Sites version, and production acceptance.

## Three-pass review

### Pass 1 — immediate correctness and completeness

Confirmed that the source SHA, archive, version, deployment, browser URL, and
schema expectation align. Separated invalid mutable-preview evidence from the
successful immutable-production run.

### Pass 2 — architecture and long-term viability

Confirmed that the player-asset boundary remains enforced and that release
provenance has one exact source. Kept visual hierarchy and camera composition
as explicit product contracts rather than treating test success as sufficient.

### Pass 3 — rule compliance and supervision readiness

Recorded exact checks, evidence tiers, inferred claims, artifacts, remaining
risks, and closure steps. No local parallel changes were discarded or rewritten
for this release.

