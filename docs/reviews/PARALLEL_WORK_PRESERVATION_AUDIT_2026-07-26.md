# Parallel Work Preservation and Admission Audit

- Date: 2026-07-26
- Status: preservation inventory complete; integration admission pending
- Baseline: `58968333c616cdd055b94ef11c29e69109df3a24` on `main` and `origin/main`
- Deployed baseline: Sites version 9
- Evidence tier: Tier 1 live git/diff inspection plus linked Tier 2–4 evidence
- Parent tasks: B1–B8 in
  [Next Execution Board](../plans/NEXT_EXECUTION_BOARD_2026-07-26.md)

## Purpose

The shared worktree contains valuable concurrent work after the version-9
release. This inventory prevents a later `git add -A`, commit, reset, cleanup,
or deployment from conflating independent concerns or losing another agent's
work.

This is a dated snapshot. Git state must be rechecked before every mutation.

## Source state

- Branch: `main`
- Local committed head: `58968333c616cdd055b94ef11c29e69109df3a24`
- Remote committed head: `58968333c616cdd055b94ef11c29e69109df3a24`
- Public deployment: version 9 from that exact commit
- Newer staged, unstaged, and untracked work: intentionally not deployed

## Group P1 — First-rung and first-cut candidate

Representative files:

- `src/game/first-rung.ts`
- `src/game/first-rung.test.ts`
- `src/game/exploration.ts`
- `src/game/gameworld.ts`
- `src/game/world.ts`
- `src/game/world-memory.test.ts`
- `src/game/world-schema.test.ts`
- `src/main.ts`
- `src/styles.css`
- `tools/rig-lab-browser-acceptance.cjs`
- first-rung and Field 02 evidence captures
- first-rung acceptance, exploration map, tracker, and worklog entries

Current interpretation:

- Extends the released earn → return → fit rung toward a real use-in-world or
  first-cut consequence.
- Refreshes real-touch and wider browser evidence.
- Overlaps heavily with state, renderer, UI, storage, and acceptance surfaces.

Admission conditions:

1. Decide whether first-cut is required completion, optional follow-on, or the
   opening of the next vertical.
2. Reconcile the resolver, visible language, persistence, completion evidence,
   and acceptance harness to one contract.
3. Run full tests, build, two-port browser, public-surface boundary, and visual
   review.

Do not commit this group merely because its focused tests pass. It changes the
meaning of first-rung completion.

## Group P2 — Unbound Passage pure proof

Representative files:

- `src/game/unbound-passage.ts`
- `src/game/unbound-passage.test.ts`
- `docs/research/3D_GAME_SKILL_APPLICATION_UNBOUND_PASSAGE_2026-07-26.md`
- `docs/reviews/FIRST_RUNG_AND_UNBOUND_PASSAGE_ADMISSION_2026-07-26.md`
- `docs/exploration/WIDE_OPEN_NEXT_TRANCHE_ARBITRATION_2026-07-26.md`

Current interpretation:

- Pure reducer/contract proof for two capability-authored lanes, provenance,
  inherited benefit, recovery, and versioned restoration.
- Not yet wired into canonical state, storage, locomotion, presentation, or the
  public activity flow.
- The arbitration proposes this before Farmfall; the project owner has not yet
  accepted that sequencing.

Admission conditions:

1. Re-run focused and full suites against the settled tree.
2. Accept storage/schema ownership and sequencing.
3. Integrate only through locomotion result → canonical state/world owner →
   observer → state-derived guidance/rendering.
4. Prove second-rig benefit, save/reload, failure/recovery, mobile/reduced
   motion, and comprehension.

## Group P3 — Emission/listener source proof

Representative files:

- `src/game/signature.ts`
- `src/game/signature.test.ts`
- `docs/decisions/ADR-0025-emission-source-listener-separation.md`
- `docs/research/RIG_SIGNATURE_AND_FEEDBACK_EMISSION_CONTRACT_2026-07-26.md`
- related Farmfall, audio, activity, tracker, exploration, and worklog edits

Current interpretation:

- Source-only experimental emission fixture.
- Correctly avoids owning listener sensitivity, falloff, occlusion, threat
  interpretation, save authority, or a universal score.
- Has no admitted runtime listener or accessible player-facing cue.

Admission conditions:

1. Project owner accepts ADR-0025.
2. Implement one real listener with explicit semantics and observability.
3. Test active/inactive operation, fixed-step behavior, falloff/occlusion,
   replay classification, accessible feedback, and performance.
4. Do not promote the proof from Experimental to Accepted without runtime
   evidence.

## Group P4 — Cultivation and schema-v7 decision proof

Representative files:

- `docs/decisions/ADR-0026-cultivation-provenance-and-schema-v7.md`
- `docs/plans/FARMFALL_SLICE_01_2026-07-25.md`
- related tracker, exploration, worklog, and state/world research

Current interpretation:

- Correctly stops implementation where current deformation/furrow/terrain facts
  cannot prove a semantic cultivation cut.
- Proposes ownership for preparation provenance and schema v7.

Admission conditions:

1. Project owner decides sequencing, schema owner, harvest value, post-sow
   terrain policy, and capacity.
2. Add migration/recovery and bounds before durable crop state.
3. Prove plough → raise → sow → grow → harvest through save/reload and invalid
   record recovery.

## Group P5 — Renderer, sightline, visibility, and profile work

Representative files:

- `src/game/renderer.ts`
- `src/game/exploration.ts`
- `src/game/state.ts`
- `src/game/terrain-traversal.test.ts`
- `src/game/world-memory.test.ts`
- `docs/research/RENDERER_PERFORMANCE_ANALYSIS_2026-07-26.md`
- performance, accessibility, VFX, and Web-experience research edits

Current interpretation:

- Includes useful horizon/sightline and presentation work.
- An incomplete duplicate auto-degrade path was removed because it broke
  typecheck and competed with `RuntimeProfileController`.
- Earlier audit evidence found risks in partial instanced-prop billboard/LOD
  behavior. Current code must be inspected again; the finding is not assumed
  current merely because it was once true.

Admission conditions:

1. Identify one visibility, LOD, DPR, and profile owner.
2. Test moving rebuild anchors, bounds after matrix updates, representation
   exclusivity, billboard updates, tier anchor, and profile changes.
3. Compare screenshots and metrics on desktop, narrow, reduced-motion, and one
   representative constrained profile.
4. Do not turn one-machine frame samples into public performance guarantees.

## Group P6 — Storage and provenance hardening

Representative files:

- `src/game/storage.ts`
- `src/game/storage-provenance.test.ts`
- related state/world schema files

Current interpretation:

- Strengthens recovery/provenance and the canonical state/world seed invariant.
- Shares blast radius with first-rung, passage, and schema-v7 work.

Admission conditions:

1. Validate wrapped, legacy, invalid, mismatched-seed, storage-failure, and
   migration behavior.
2. Ensure one canonical loader owns recovered state and matching world seed.
3. Confirm no new parallel storage writer is introduced.

## Group P7 — Authority and research reconciliation

Representative files:

- `docs/decisions/ADR-0006-rig-capability-portability.md`
- `docs/decisions/ADR-0012-rig-perception-chain.md`
- `docs/decisions/README.md`
- `docs/exploration/EXPLORATION_MAP.md`
- `docs/reviews/DECISION_PROVENANCE_AND_RECOMMENDATION_STATUS_AUDIT_2026-07-26.md`
- multiple research-contract addenda
- `tools/audit-doc-authority-language.mjs`

Current interpretation:

- Removes invented or inflated acceptance language and connects research
  recommendations to explicit evidence/decision status.
- Contains both staged and newer unstaged edits, so the index, ADR states,
  tracker states, and code must be reconciled as one documentation group.

Admission conditions:

1. Every Accepted/Approved/Used claim cites current evidence and real authority.
2. Proposed ADRs remain Proposed until operator sign-off.
3. Historical text is preserved with addenda where appropriate.
4. Link, formatting, authority-audit, and current-code checks pass.

## Group P8 — Browser harness and evidence artifacts

Representative files:

- `tools/rig-lab-browser-acceptance.cjs`
- `tools/capture-world-showcase.cjs`
- `docs/reviews/assets/field-02-*.png`
- `docs/reviews/assets/first-rung-desktop.png`
- `docs/reviews/assets/rig-lab-01-*.png`
- `docs/reviews/assets/ru-0110/*.png`

Current interpretation:

- Adds real-touch first-rung traversal and stronger persistence waiting.
- Screenshots have both staged and unstaged generations.
- The production version-9 run passed with the current touch driver, but current
  screenshots may include later unadmitted gameplay work.

Admission conditions:

1. Confirm harness code uses public input contracts, not mutation shortcuts.
2. Preserve deterministic headless lifecycle and bounded waits.
3. Inspect every screenshot and tie it to exact source, URL, viewport, and
   claim.
4. Commit evidence only with the feature/build it actually represents.

## Group P9 — Local tooling/configuration

Representative files:

- `.claude/launch.json`
- `tools/capture-world-showcase.cjs`

Current interpretation:

- Potentially useful developer workflow changes.
- Must not be bundled with gameplay merely because it is nearby.

Admission conditions:

1. Validate paths, ports, portability, and absence of secrets/local-only
   assumptions.
2. Document reusable tools in `tools/README.md`.
3. Commit as tooling/configuration only if intentional.

## Group P10 — Release reconciliation documents

Representative files:

- `docs/plans/NEXT_EXECUTION_BOARD_2026-07-26.md`
- `docs/reviews/SITES_VERSION_9_RELEASE_2026-07-26.md`
- version-9 additions to the master tracker, first-rung acceptance, Sites
  runbook, and worklog

Current interpretation:

- Records the already-pushed/deployed version-9 baseline.
- Does not change runtime behavior.
- Shares files with active parallel documentation edits, so it should not be
  committed by staging entire shared files without reviewing the combined
  document state.

Admission conditions:

1. Formatting, links, exact IDs, source SHA, deployment status, and rollback
   agree.
2. Stage only after the shared docs settle or intentionally admit their whole
   combined contents.
3. A later docs-only commit must explicitly say version 9 still points to
   `5896833`; it must not be described as deployed source.

## Recommended commit order after admission

This is an ordering recommendation, not authorization to commit:

1. storage/provenance invariant, if independently green;
2. authority/research reconciliation and accepted ADR decisions;
3. first-rung/first-cut contract and runtime;
4. browser harness plus exact matching evidence;
5. pure Unbound Passage groundwork;
6. emissions source proof;
7. renderer/sightline/profile work;
8. reusable tooling/configuration;
9. release and acceptance documentation reconciliation.

If file overlap makes these groups artificial, stop and regroup around the
smallest coherent behavior rather than using partial staging to manufacture
false independence.

## First-rung decision applied

The relationship between fitted-part completion and first-cut is now:

- **Applied:** the first rung completes at fit; first-cut is an immediate
  optional proof-of-benefit and may become the opening beat of Unbound Passage
  or Farmfall.

The staged tractor-mandatory completion proposal was removed from the working
runtime and its tests. This preserves the short onboarding, the public
reward→spend contract, and the explicit product rule that no one rig or
capability defines the platform. Terrain transformation remains preserved as a
separate proposed proof. External fresh-player evidence can still falsify the
onboarding choice.

## Three-pass review

### Pass 1 — Immediate correctness

- Local/remote/deployed baselines are separated from newer mixed work.
- Every observed file class has an explicit preservation and admission path.

### Pass 2 — Architecture and long-term viability

- State, storage, simulation, presentation, replay, and research authority are
  kept distinct.
- Commit grouping follows behavior and dependency rather than file count.

### Pass 3 — Supervision readiness

- No commit, push, reset, checkout, cleanup, or deletion is authorized here.
- Operator decisions and exact closure evidence are visible.
- This snapshot must be refreshed before mutation because the shared tree is
  concurrently edited.
