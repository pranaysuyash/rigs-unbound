# Sites Version 9 Release and Production Acceptance

- Date: 2026-07-26
- Status: released and publicly accepted
- Risk class: medium; public browser-game deployment and saved local progress
- Evidence: Tier 2 automated, Tier 3 production-like, Tier 4 public runtime
- Public URL: <https://rigs-unbound.suyashpranay.chatgpt.site>

## Exact provenance

- GitHub: `pranaysuyash/rigs-unbound`, branch `main`
- Released commit: `58968333c616cdd055b94ef11c29e69109df3a24`
- Commit subject: `fix(build): admit Vite 8 WASM plugin`
- Sites project: `appgprj_6a64c10e5a2c8191ad80278ea124aa6b`
- Sites version:
  `appgprj_6a64c10e5a2c8191ad80278ea124aa6b~appgver_8d8b9b737464819189a7663efc1dc29e`
- Deployment: `appgdep_6a66391c33ac8191905ac87775b1585e`
- Terminal status: `succeeded`
- Prior accepted rollback: version 7 from
  `a8869ad25f72929b62b6722cb262c91b2b6c7999`
- Version 8 failed before build and is not a rollback candidate.

## Change and exact source boundary

Gameplay/evidence was preserved in
`a340fbd369f5d4b53309abf0f77795b65beb196a`. Version 8 then exposed that
`vite-plugin-wasm@3.5.0` did not declare Vite 8 peer support. The repair moved
to `3.6.0`, which admits Vite 8, without downgrading Vite 8.1.5.

Version 9 is built from the exact pushed repair commit. Later local parallel
work is not part of this deployment.

## User-facing behavior observed

A fresh player can enter, drive Torque to the authored cache, collect five
salvage, return Home, fit Lug tyres, see the module, reload, and retain both the
completed first-rung state and visible fit.

The public touch run used a `390×844`, `hasTouch` browser context and Chrome
touch events against rendered controls. It did not call gameplay mutation
bridges.

## Checks and outcomes

- Clean `npm ci`: passed; 117 packages, zero reported vulnerabilities.
- Build and both typechecks: passed.
- Root suite: 27 files, 220 tests passed.
- Kernel suite: 7 tests passed.
- Asset suite: 9 tests passed.
- Asset preflight: 4 entries, zero findings.
- Player-asset boundary, format, diff hygiene, managed hook: passed.
- Local and `origin/main` matched before Sites save/deploy.
- Default and Field 02 public URLs: HTTP 200, `text/html`.
- Public browser matrix: exit 0; zero console/page problems.

The browser matrix also covered keyboard and touch first-rung paths,
save/reload, cargo relay, six cameras, rear chase, structure/tree obstruction,
terrain-face refusals, ramp/deep-water hover, reduced motion, desktop/narrow
layouts, touch recovery, player/developer separation, and instrumentation.

## Runtime observations and limits

- Touch cache nearest approach: about `4.609 m`; visible lesson changed to
  `Collect the salvage`.
- Touch Home nearest approach: about `5.294 m`; stage became `choose-part`.
- Reloaded stage: `free-explore`.
- Reloaded/visible module: `lug-tires`.
- Desktop sample: about 95.4 fps, 10.49 ms average, 9.2 ms p95, 119 draw calls,
  103,106 triangles.
- Narrow sample: about 101.6 fps, 9.85 ms average, 8.8 ms p95, 39 draw calls,
  103,274 triangles.

These are one-machine observations, not representative-device guarantees. The
restored sample had too few frames and an initialization outlier and must not
be used as a stable performance claim.

## Known gaps

- External fresh-player comprehension is unproven.
- First-rung side/chase composition and workshop/HUD density need refinement.
- The production build retains the tracked large Three.js chunk advisory.
- Representative low/mid-device profiling remains open.
- Current parallel gameplay/research work is newer than version 9 and requires
  its own admission gates.
- The parallel first-cut proposal may change first-rung completion semantics.

## Rollback and agent handoff

For rollback, resolve and deploy the saved version 7, verify terminal status,
default/Field 02 URLs, save/reload, and console health, then record the new
deployment ID and reason. Never use failed version 8.

For future deployment:

1. read `.openai/hosting.json` and reuse its opaque `project_id`;
2. re-check git/worktree/stash/local state;
3. validate and push the exact source;
4. save a Sites version using that commit SHA;
5. deploy only the saved version;
6. inspect until terminal;
7. run HTTP and public browser acceptance;
8. record version, deployment, source, rollback, and evidence.

Never invent Sites IDs. A query-selected developer surface is not an
authorization boundary.

## Acceptance contract

- User value: the first earn → return → fit → retain loop is publicly playable
  with keyboard/pointer and touch.
- Team value: GitHub and Sites have exact provenance and a known-good rollback.
- Operational value: clean-install, build, test, asset, public smoke, real-input,
  and zero-error evidence are recorded.
- Verified: the checks and runtime behavior above.
- Not inferred: representative-device performance and human comprehension.
- Parallel work: preserved outside the released source.
- Follow-up decision: first-cut semantics and next-vertical sequencing.
