# Playtest2 Artifact Disposition

- Date: 2026-07-27
- Status: preserved as local evidence; not yet admitted as gameplay proof
- Evidence tier: Tier 1 artifact inspection

## What was found

The current worktree contains a new playtest bundle:

- `artifacts/playtest2-achiever.cjs`
- `artifacts/playtest2-casual.cjs`
- `artifacts/playtest2-explorer.cjs`
- `artifacts/playtest2-explorer/plan1.json`
- `artifacts/playtest2-explorer/01-first-load.png`
- `artifacts/playtest2-explorer/02-settled.png`

## Classification

- `playtest2-*.cjs` are reusable local drivers. They are source-like tool
  evidence, not disposable scratch output.
- `playtest2-explorer/plan1.json` is a small execution recipe and should be
  preserved with the run.
- The two explorer screenshots are evidence of a failed browser connection
  against `127.0.0.1:4174`, not evidence of gameplay state.

The screenshots currently show `ERR_CONNECTION_REFUSED`, which means the run
did not reach the game surface. They are still useful as launcher diagnostics,
but they do not support any claim about player flow, world state, or browser
comprehension.

## Decision

Preserve the drivers and the failed-run evidence in the repository history if
the playtest lane is being tracked, but do not cite these screenshots as game
acceptance evidence until the same plan is rerun against a live, reachable
development server.

## Follow-up

- Re-run the playtest bundle once the expected local port is confirmed live.
- If the scripts become part of the standard evidence path, add a short pointer
  from the worklog or relevant review.
- Keep the generated images out of any gameplay-complete claim until they show
  actual game state.
