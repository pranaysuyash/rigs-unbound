# Sites deployment acceptance — 2026-07-25

## Scope

Publish the current Rigs Unbound playable and all preserved parallel work as one
immutable OpenAI Sites version. The deployment adapter must not fork or replace
the Vite game runtime.

## Artifact classification

- `.openai/hosting.json`: source-controlled opaque Sites project binding; no
  credential or runtime secret.
- `src/hosting/sites-vite-plugin.ts` and `worker/index.ts`: source-controlled hosting
  adapter.
- `package.json` and `package-lock.json`: source-controlled toolchain contract.
- `docs/**/*.md`: project decisions, research, plans, worklog, and acceptance
  evidence worth preserving.
- `docs/reviews/assets/*.png`: intentional visual-QA evidence.
- `src/game/*.ts` and tests: game source and deterministic regression coverage.
- `dist/`, `.wrangler/`, `node_modules/`, generated agent context, and temporary
  deployment archives: ignored/rebuildable outputs.
- No paid Kenney source assets, local credentials, `.env` values, caches, or
  machine-private files are included.

## Three-pass review

### Pass 1 — correctness and completeness

- TypeScript game and deterministic-kernel typechecks passed.
- 83 game tests and seven kernel-probe tests passed.
- Prettier checks cover the new `build/` and `worker/` source paths.
- The production build emits `dist/server/index.js`,
  `dist/client/index.html`, and `dist/.openai/hosting.json`.
- The browser acceptance flow passed on the production-compatible preview at
  port 4174 with zero console/page errors.

### Pass 2 — architecture and long-term viability

- The existing Vite/Three.js runtime remains the single player-facing
  application.
- The hosting adapter delegates to the asset binding and does not introduce a
  second game state, route, gameplay pipeline, or persistence layer.
- Direct-route fallback is explicit for the single-page application.
- Hosting dependencies were upgraded from the bundled template versions to
  patched current releases; `npm audit` reports zero known vulnerabilities.
- The existing bundle-size advisory remains visible; code-splitting is a
  performance hardening item, not a deployment correctness failure.

### Pass 3 — rule compliance and supervision readiness

- One `main` worktree, no stash, no local-only commits, and no branch rewrite.
- All parallel source, documentation, research, and visual evidence is
  preserved.
- Managed hooks block AI co-author trailers and enforce the full motto
  attestation.
- The production version must reference the exact pushed commit and the archive
  must be packaged from that source state.
- Sites reported terminal `succeeded` status for the public deployment and the
  resulting URL passed a live browser contract check.

## Verification record

| Check                            | Result                                                                            | Evidence tier |
| -------------------------------- | --------------------------------------------------------------------------------- | ------------- |
| `npm run typecheck`              | Passed                                                                            | Tier 2        |
| `npm test`                       | 83 + 7 passed                                                                     | Tier 2        |
| `npm run format:check`           | Passed after formatting `tsconfig.json`                                           | Tier 2        |
| `npm audit --json`               | Zero vulnerabilities after patched hosting upgrades                               | Tier 2        |
| `npm run build`                  | Passed; Worker and client artifacts emitted                                       | Tier 3        |
| `npm run test:browser` on `4174` | Passed full flow, narrow layout, reload, reduced motion; zero console/page errors | Tier 4 local  |
| Sites package validator          | Passed for the clean committed source                                             | Tier 3        |
| Sites production status          | `succeeded`                                                                       | Tier 4        |
| Production URL load              | HTTP 200; title, welcome flow, schema v4, three rigs, zero browser errors         | Tier 4        |

## Production closure

- Public URL:
  [https://rigs-unbound.suyashpranay.chatgpt.site](https://rigs-unbound.suyashpranay.chatgpt.site)
- The immutable source commit was pushed to GitHub and the Sites source
  repository before version saving.
- The public access policy was applied before deployment.
- A first browser probe using `networkidle` timed out because perpetual game
  activity is not a valid idle contract. The corrected probe used
  `domcontentloaded` plus product assertions and passed.
- Recent production Worker error logs were empty after the live requests.

## Repeatable agent handoff

The canonical ongoing procedure is
[Sites update and deployment runbook](../operations/SITES_UPDATE_AND_DEPLOY_RUNBOOK.md).
Future agents should append new deployment evidence to that runbook's ledger
instead of rewriting this initial acceptance snapshot.

## User, team, and operational value

- User value: the current playable becomes accessible from a public link.
- Team value: one immutable source commit can be reviewed, rolled back, and
  redeployed without reconstructing local state.
- Operational value: hosting metadata, build output, source provenance, and
  deployment status have explicit ownership and verification gates.

## Remaining boundaries

- Progress remains device-local browser state; there is no account-backed save.
- This is public-playable evidence, not representative-device, external-player,
  multiplayer, commercial-launch, or production-service evidence.
- The 633 kB JavaScript chunk retains Vite's 500 kB advisory. Closure path:
  profile code-splitting by player-visible loading benefit, then re-run browser
  acceptance and representative-device measurements.

## Anything else?

This acceptance record proves the initial public hosting path. It does not
replace the ongoing runbook, and it does not upgrade device-local persistence
or public-playable evidence into account, multiplayer, representative-device,
or commercial-launch readiness.

## Addendum (2026-07-26) — Integration batch release

- Guarded source commit:
  `1e7992125824a850eb27a9f9d2bbdbc95b229e2b`.
- GitHub `main`, local `main`, and the Sites source branch were verified at the
  same commit before version saving.
- The Sites-provided packager produced the deployable archive from that exact
  clean source state.
- Sites version 5 retained the exact commit provenance and deployment
  `appgdep_6a651eeb031081919103b85b9e4eba0c` reached terminal `succeeded`.
- The public Field 02 route, `/physics-lab.html`, and `/box3d-lab.html` each
  returned HTTP 200 with expected page content.
- Local pre-release evidence: TypeScript passed; 102 root tests, seven
  deterministic-kernel tests, and five asset-security tests passed; formatting
  and production build passed; Field 02 passed browser acceptance on 4173 and
  4174; both dynamics labs passed browser acceptance.
- Remaining boundary: an HTTP/content smoke check is not a fresh full
  production browser interaction run. Real-device, cold-cache, WebGL recovery,
  audio, and human-fun evidence remain open.

## Addendum (2026-07-26) — First-rung P0 release

- Guarded source commit:
  `f5a007d1e9866fea510fcef1cfba102a7ee85e13`.
- Local `main`, GitHub `origin/main`, and the Sites source branch used the same
  commit before version saving.
- The Sites packager validated an archive isolated from that exact pushed
  source; Sites version 6 retained the same commit provenance.
- Deployment `appgdep_6a652cbbcf108191a07becdbe1beaaf7` reached terminal
  `succeeded`.
- The public Field 02 route returned HTTP 200. The historical `.html` lab URLs
  redirected to their canonical routes, and `/physics-lab` plus `/box3d-lab`
  returned HTTP 200.
- A fresh public-browser profile verified: elapsed time remained `0` while the
  welcome plate was open; entry closed it; schema v5 loaded; the authored
  `first-recovery-cache` was exposed; `firstInputReadyMs` was recorded; and the
  captured console contained zero entries.
- Pre-release gates: 108 root tests, seven deterministic-kernel tests, five
  asset tests, TypeScript, formatting, production build, and Field 02
  production-preview browser acceptance passed.
- Remaining boundary: representative-device performance, cold-cache loading,
  WebGL recovery, audio listening, and human taste/fun evidence remain open.

## Addendum (2026-07-26) — RU-0110 release

- Guarded gameplay commit:
  `9c10d2b109da12ce816ad3ec6235a31a4d0d6f4e`; preserved late-research head:
  `a8869ad25f72929b62b6722cb262c91b2b6c7999`.
- GitHub `origin/main` and the Sites source branch were both verified at
  `a8869ad25f72929b62b6722cb262c91b2b6c7999` before Sites saved version 7.
- Deployment `appgdep_6a6564e8f510819186b047775995d015` reached terminal
  `succeeded` at the existing public URL.
- The Field 02 route returned HTTP 200. Historical `.html` lab URLs redirected
  to `/physics-lab` and `/box3d-lab`; both canonical routes returned HTTP 200.
- The first production browser command exposed a runbook mismatch: the bare
  URL does not enable acceptance-only fixtures. The corrected command includes
  `?acceptance=field-02`; the runbook now records that contract.
- Full production acceptance then passed: three-rig fresh acquisition,
  structure/tree/hood camera checks, all-rig terrain-face refusal and escape,
  cargo relay, ramp, deep water, persistence, keyboard/mouse/touch recovery,
  reduced motion, six views, and `390×844` layout. Captured console/page errors
  were empty.
- Recent production Worker error logs were empty.
- Remaining boundary: the measured production run occurred under automation
  and concurrent browser workloads. It is functional Tier 4 evidence, not a
  representative-device performance or human-fun claim.
