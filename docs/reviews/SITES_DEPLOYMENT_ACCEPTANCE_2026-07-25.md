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

| Check | Result | Evidence tier |
| --- | --- | --- |
| `npm run typecheck` | Passed | Tier 2 |
| `npm test` | 83 + 7 passed | Tier 2 |
| `npm run format:check` | Passed after formatting `tsconfig.json` | Tier 2 |
| `npm audit --json` | Zero vulnerabilities after patched hosting upgrades | Tier 2 |
| `npm run build` | Passed; Worker and client artifacts emitted | Tier 3 |
| `npm run test:browser` on `4174` | Passed full flow, narrow layout, reload, reduced motion; zero console/page errors | Tier 4 local |
| Sites package validator | Passed for the clean committed source | Tier 3 |
| Sites production status | `succeeded` | Tier 4 |
| Production URL load | HTTP 200; title, welcome flow, schema v4, three rigs, zero browser errors | Tier 4 |

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
