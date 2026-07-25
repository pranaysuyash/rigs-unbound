# Verification Harness and Confidence Gates Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s threshold fixtures, KPI notes, and deterministic addenda into a named evidence harness so confidence grows through reproducible proof instead of ad hoc review.

The analysis already identifies the tests and fixture scenes that matter. What it does not yet have is a first-class contract for how evidence is organized, reproduced, and recorded across culling, camera, collision, migration, replay, and fallback work.

## Current evidence base

- Threshold and capture policy notes:
  - [docs/research/THRESHOLD_FIXTURE_BASELINE_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/THRESHOLD_FIXTURE_BASELINE_2026-07-25.md)
  - [docs/research/THRESHOLD_CAPTURE_SELECTION_PROTOCOL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/THRESHOLD_CAPTURE_SELECTION_PROTOCOL_2026-07-25.md)
  - [docs/research/READABILITY_METRIC_RUBRIC_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/READABILITY_METRIC_RUBRIC_2026-07-25.md)
- Runtime evidence and production-like metrics:
  - [docs/research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)
  - [docs/research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md)
- Analysis lanes for replay, physics, and validation:
  - [docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
  - [docs/research/PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md)
  - [docs/research/REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md)
- Browser-visible fixture evidence:
  - [docs/reviews/PHYSICS_LAB_01_ACCEPTANCE_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/reviews/PHYSICS_LAB_01_ACCEPTANCE_2026-07-25.md)
  - [tools/physics-lab-browser-acceptance.cjs](/Users/pranay/Projects/Game_dev/rigs-unbound/tools/physics-lab-browser-acceptance.cjs)
- Roadmap lane for verification harness and confidence gates:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the ingredients for a formal evidence harness:

- deterministic fixture scenes are named,
- threshold capture selection is named,
- a readability rubric already ranks the leading signal,
- runtime KPIs already identify the metrics that matter,
- several specialized contracts already define the exact gates that need proof.

That means the evidence harness can organize existing proof work rather than inventing new kinds of evidence.

## What is still missing

The current surface still lacks:

- deterministic fixture or scenario requirements for each proof area,
- tiered evidence summaries,
- a failure-report format that preserves violated contracts and missing evidence tiers,
- a canonical capture bundle for each important gate,
- an explicit confidence transition rule from Tier-1 to Tier-2 and beyond,
- a shared way to record what was proven versus what remains inferred.

## Contract shape

A durable verification contract should separate:

1. **Fixture selection**
   - deterministic scene or scenario
   - why that fixture is canonical
2. **Evidence tier**
   - source
   - static inspection
   - targeted test
   - runtime/manual observation
   - production-like verification
3. **Failure reporting**
   - violated contract
   - missing evidence tier
   - divergence or fallback observed
4. **Confidence gates**
   - when a check is enough
   - when a broader gate is required
   - how proof changes over time

This keeps confidence auditable instead of implied.

## Validation rules

The contract should fail visibly if it:

- uses a narrow check to support a broad claim,
- treats a green check as proof for an unrelated contract,
- cannot distinguish what was verified from what was inferred,
- loses the fixture identity or capture selection rule,
- omits the evidence tier in a final report,
- hides a missing proof slice behind general progress.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one deterministic fixture or scenario set,
2. one tiered evidence summary,
3. one failure report that preserves the violated contract and missing tier,
4. one canonical capture bundle for a major gate,
5. one explicit confidence transition rule tied to the evidence tier.

The lab acceptance review now provides one browser-visible fixture candidate that can be used to anchor the capture bundle once the broader harness consumes it.

## Open questions

- Which proof area should be the first canonical fixture bundle: culling, camera, collision, or migration?
- Should evidence summaries be stored per contract or per review run?
- Should confidence gates be visible only to maintainers or also to the broader team?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

This harness is the evidence layer above the specialized contracts.
It keeps future confidence changes reproducible and easy to audit.

## Addendum (2026-07-25) - Live evidence is present, but the bundle is not canonical yet

- Live browser evidence currently exposes the proof surface the harness needs:
  - `window.getPerformanceSnapshot()`
  - `window.getRunRecordVerification()`
  - current runtime metrics and a clean run-record verifier result
- The active runtime values are still healthy enough to summarize directly:
  - `firstControllableMs`
  - `firstInputReadyMs`
  - `framesPerSecond`
  - `drawCalls`
  - `triangles`
  - `saveBytes`
- That confirms the harness is grounded in real metrics, not just policy text.
- What is still missing is the canonical capture bundle and tiered summary
  format the contract calls for:
  - no fixed fixture bundle is yet named as the single evidence package,
  - no shared tiered evidence summary is yet emitted from the runtime surface,
  - no explicit confidence transition rule is yet attached to a capture bundle.
- So this contract is correctly staged as the evidence layer above the
  specialized contracts, not as a finished harness product.
