# Sites update and deployment runbook

- Status: canonical operating procedure
- Applies to: the existing public Rigs Unbound OpenAI Sites project
- Live URL:
  [https://rigs-unbound.suyashpranay.chatgpt.site](https://rigs-unbound.suyashpranay.chatgpt.site)
- Architecture decision:
  [ADR-0013](../decisions/ADR-0013-sites-deployment-adapter.md)
- Initial acceptance evidence:
  [Sites deployment acceptance](../reviews/SITES_DEPLOYMENT_ACCEPTANCE_2026-07-25.md)

This runbook is the operational source of truth for agents updating and
deploying Rigs Unbound. It extends the accepted hosting architecture; it does
not create another application, deployment adapter, or Sites project.

## Current production baseline

As verified on 2026-07-25:

| Field                      | Current value                              |
| -------------------------- | ------------------------------------------ |
| Sites title                | Rigs Unbound                               |
| Access                     | Public                                     |
| Sites status               | Active                                     |
| Latest verified version    | 3                                          |
| Latest verified Git commit | `e886540a31a20075714482e2365f6f0767bd1720` |
| Project binding            | `.openai/hosting.json`                     |
| GitHub repository          | `github.com/pranaysuyash/rigs-unbound`     |

The project ID in `.openai/hosting.json` is an opaque binding. Copy it exactly
into Sites calls. Never derive, rename, replace, or commit credentials beside
it. **Do not call `create_site` again for this repository.**

## Non-negotiable release invariant

The commit pushed to the Sites source repository, the `commit_sha` used when
saving a Sites version, and the source used to build the uploaded archive must
all identify the same source state.

```text
validated source
      │
      ├── GitHub main
      ├── Sites source branch
      └── packaged build
               │
               └── saved Sites version
                         │
                         └── production deployment
```

If those paths diverge, stop. Do not compensate by changing the commit SHA or
reusing an older archive.

## Authority and permission boundaries

- Read the current Sites building and hosting skills before deployment because
  connector contracts can change.
- Reuse the existing project binding and public URL.
- Git staging, commits, pushes, and a public production deployment require
  explicit approval in the current conversation.
- Never force-push, rewrite history, discard local work, or remove another
  agent's files to make a release look clean.
- Obtain Sites source credentials through the Sites connector. Keep the token
  inside the single authenticated push operation; never print it, store it in a
  remote URL, persist it in Git configuration, or write it to a file.
- Runtime environment values belong in Sites, not `.openai/hosting.json`,
  source control, or the archive.
- Do not publish paid Kenney source packs or other private source assets. Only
  reviewed runtime exports with recorded provenance may enter the public build.

## 1. Refresh context and classify the worktree

Start from the repository root:

```bash
/Users/pranay/Projects/agent-start \
  --project /Users/pranay/Projects/Game_dev/rigs-unbound \
  --skip-index
```

Read the generated kickoff and session context, then inspect current state:

```bash
git status --short
git branch --show-current
git branch -vv
git log --oneline --decorate --graph --all -35
git diff --stat
git diff --cached --stat
git stash list
git worktree list --porcelain
git ls-files --others --exclude-standard
```

Classify every changed and untracked item before staging:

- release source;
- documentation or reviewed visual evidence;
- another agent's moving work;
- rebuildable output;
- credential, cache, or machine-private state;
- unknown and requiring review.

Parallel edits are normal. Re-check status immediately before staging,
committing, pushing, packaging, and reporting completion. If files are still
changing, freeze a coherent release boundary and preserve later edits
uncommitted rather than chasing a moving snapshot or losing work.

Uncommitted build inputs are not allowed in an archive. Documentation-only
changes may remain outside the release commit only after they are explicitly
classified and confirmed not to affect Vite, the Worker, public assets,
dependencies, configuration, or generated build metadata.

## 2. Choose the verification gate

All production deployments require a fresh production build. Apply additional
checks according to the changed surface.

| Changed surface                               | Required checks                                                               |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| Documentation only                            | Markdown/link inspection, `npm run build` before publishing                   |
| Game logic, UI, terrain, camera, input, audio | typecheck, tests, format check, build, full browser acceptance                |
| Save schema or persistence                    | all gameplay checks plus migration, reload, malformed/legacy save evidence    |
| Hosting adapter, dependencies, Worker         | all checks plus audit and Sites package validation                            |
| Public assets                                 | provenance/license review, asset budget inspection, build, browser acceptance |

Canonical local checks:

```bash
npm run typecheck
npm test
npm run format:check
npm audit --json
npm run build
```

For player-facing or runtime changes, start the documented local server and run:

```bash
npm run test:browser
```

The browser acceptance runner currently exercises:

- Torque, Spark, and Drift;
- semantic input and all camera policies;
- towing and cargo delivery;
- the buggy ramp and Marsh Skimmer water traversal;
- save/reload behavior;
- reduced motion;
- desktop and narrow layouts;
- console and page errors;
- visual-QA screenshots in `docs/reviews/assets/`.

A passing test is evidence for the exact source checked. It is not permission
to silently include later edits.

## 3. Commit and push the validated source

Before committing:

1. re-check the diff and artifact classification;
2. read the current full `motto_v4.md`;
3. complete the repository's section-by-section motto attestation;
4. verify commit tooling will not add an AI co-author trailer;
5. let the managed hook run—do not bypass it.

Commit by coherent concern on `main`. Push to GitHub only after explicit
approval, then confirm:

```bash
git rev-parse HEAD
git rev-parse origin/main
```

The two SHAs must match before the Sites version is saved.

## 4. Push the same commit to the Sites source branch

Use the existing project ID from `.openai/hosting.json` to request a short-lived
Sites source-repository write credential.

Push the exact current `HEAD` to the branch returned with that credential using
per-command HTTP authorization. Do not add a persistent Git remote containing
the token and do not echo the credential.

Record only:

- the Git commit SHA;
- the returned Sites source branch;
- whether the push succeeded.

Do not record the token.

## 5. Build and package the exact source

Run the build after the final source commit is selected:

```bash
npm run build
```

Use the **currently installed Sites plugin's root-level**
`scripts/package-site.sh` helper. Do not copy its packaging logic into this
repository. Pass:

1. this repository root;
2. an archive path in a fresh temporary directory.

The package helper must validate the Sites build, including:

- `dist/server/index.js`;
- the generated client assets;
- the staged `.openai/hosting.json`;
- any generated migrations if future storage work introduces them.

Temporary archives are deployment transport, not project artifacts. Keep them
out of the repository and never commit them.

## 6. Save one immutable Sites version

Call the Sites version-saving operation once with:

- the existing project ID;
- `commit_sha` equal to the pushed Sites source-branch head;
- the archive built from that commit.

Retain the returned opaque version ID in the active deployment flow. Do not
invent an ID or substitute a project/deployment ID.

Saving a version does **not** publish it.

## 7. Publish and poll to a terminal state

Rigs Unbound currently has public access. Public deployment requires explicit
approval in the current conversation.

Deploy the saved version, then poll the returned deployment ID until Sites
reports one terminal state:

- `succeeded`: continue to live verification;
- `failed`: stop, preserve the version and evidence, and report the failure
  message;
- `pending`, `building`, or `publishing`: keep polling rather than creating
  another version or deployment.

Do not change the existing access policy during a normal update. Access changes
are separate decisions.

## 8. Verify the production game

First confirm the exact URL returned by the successful deployment responds:

```bash
curl -sS -o /dev/null \
  -w 'HTTP %{http_code} %{content_type}\n' \
  https://rigs-unbound.suyashpranay.chatgpt.site
```

For runtime releases, run the full acceptance flow against production:

```bash
RIGS_UNBOUND_URL=https://rigs-unbound.suyashpranay.chatgpt.site \
  npm run test:browser
```

Then check:

- correct page title and welcome flow;
- schema and rig roster;
- the changed player-facing behavior;
- save/reload when persistence was touched;
- desktop and narrow layouts when UI was touched;
- zero unexplained console/page errors;
- recent Sites Worker logs with `errors_only=true`.

An always-running game is not a reliable `networkidle` target. Prefer
`domcontentloaded` plus explicit product assertions for focused probes.

Do not turn a failed assertion green by rerunning blindly. Capture the observed
state, diagnose whether it is product behavior, deployment propagation, test
synchronization, or stale data, then rerun only after the cause is bounded.

After Sites reports `succeeded`, open the exact returned production URL in the
Codex in-app browser when that capability is available.

## 9. Append the deployment ledger and handoff

Append a row after every successful production deployment. Do not rewrite older
rows.

| Date       | Sites version | Git commit                                 | Access | Evidence                                                      | Notes                        |
| ---------- | ------------: | ------------------------------------------ | ------ | ------------------------------------------------------------- | ---------------------------- |
| 2026-07-25 |             1 | `5fa6805f1a259a7cb5a9ea20de4bbd8518d8815d` | Public | Sites version saved                                           | Initial hosting foundation   |
| 2026-07-25 |             2 | `9d308dae2ee8e43673566fb2e50312d2a31a644e` | Public | HTTP 200, live contract, zero Worker errors                   | Run-record verifier included |
| 2026-07-25 |             3 | `e886540a31a20075714482e2365f6f0767bd1720` | Public | Full production browser acceptance passed; zero Worker errors | Current verified baseline    |
| 2026-07-25 |             4 | `aa82cee4f986f106b121b42348748bf5c9c64c27` | Public | Sites source provenance inspected; public URL active          | Physics-foundation baseline  |
| 2026-07-26 |             5 | `1e7992125824a850eb27a9f9d2bbdbc95b229e2b` | Public | Terminal success; three public routes returned HTTP 200       | Current verified baseline    |
| 2026-07-26 |             6 | `f5a007d1e9866fea510fcef1cfba102a7ee85e13` | Public | Terminal success; fresh-profile browser contract and three routes passed | First-rung P0 baseline |

Every handoff should include:

```text
Live URL:
Git commit:
Sites version:
Access mode:
Build/test result:
Production behavior verified:
Worker/browser errors:
Known gaps:
Uncommitted or parallel work preserved:
Rollback target:
```

## Rollback

If production is broken:

1. use Sites version discovery to list versions for the existing project;
2. identify the last verified version from this ledger;
3. redeploy that saved version;
4. poll the rollback deployment to `succeeded`;
5. verify the live URL and Worker errors;
6. fix forward in a new commit and new saved version.

Do not force-push or rewrite Git history as a rollback mechanism. Do not delete
the failed saved version; it is useful operational evidence.

The current rollback candidates are version 4
(`aa82cee4f986f106b121b42348748bf5c9c64c27`) and version 3
(`e886540a31a20075714482e2365f6f0767bd1720`). Resolve their opaque version IDs
through Sites at rollback time rather than copying or guessing IDs.

## Known failure modes

| Symptom                                  | First check                                        | Correct response                                               |
| ---------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| Sites rejects `commit_sha`               | Sites source branch head                           | Push the exact release commit; do not substitute a SHA         |
| Package validation fails                 | Worker entrypoint, client output, hosting metadata | Fix the canonical adapter/build and rebuild                    |
| Deployment stays non-terminal            | Existing deployment status                         | Continue polling the same deployment                           |
| Production returns 500                   | Errors-only Worker logs                            | Diagnose the recorded route/error before redeploying           |
| Browser check times out at `networkidle` | Game loop and explicit DOM readiness               | Use product assertions after `domcontentloaded`                |
| Save appears missing                     | Browser origin/device and schema migration         | Confirm same public origin and test migration/reload           |
| New deployment serves old behavior       | version-to-commit mapping and browser cache        | Verify the saved version SHA and perform a fresh-context probe |
| Bundle warning persists                  | player-visible load profile                        | Code-split only when measurement identifies a useful boundary  |

## Current boundaries

- Saves remain device-local browser state; there is no account-backed
  continuity.
- Public playable does not mean representative-device, external-player,
  multiplayer, commercial-launch, or production-service readiness.
- The main JavaScript bundle currently exceeds Vite's 500 kB advisory threshold.
  Treat code-splitting as a measured performance decision, not a deployment
  correctness workaround.
- Hosting and public deployment do not authorize publishing paid source assets.

## Three-pass review of this runbook

### Pass 1 — immediate correctness

Checked the procedure against the current `.openai/hosting.json`, package
scripts, Worker/client output contract, successful version 3 deployment, live
URL, and production browser evidence. The runbook distinguishes build, save,
deploy, and verification rather than treating them as one opaque action. This
pass also found and corrected a stale `4173` default in the README and browser
runner; the canonical `4174` command then passed the full local browser flow.

### Pass 2 — architecture and long-term viability

Kept ADR-0013 as the hosting decision and made this file the single operations
procedure. No duplicate Worker, package script, Sites project, persistence
system, or deployment pipeline was introduced. Exact-source provenance and
rollback are first-class contracts.

### Pass 3 — supervision readiness

Added explicit permission boundaries, credential handling, parallel-work
preservation, evidence gates, a deployment ledger, rollback, failure
diagnostics, and a reusable handoff template.

## Anything else?

The deployment path is now repeatable, but reliable public operation still
needs later, decision-backed work for account continuity, representative-device
performance, multiplayer authority, and asset-release governance. Those gaps
must remain explicit; deploying successfully must not silently upgrade the
project's maturity claims.
