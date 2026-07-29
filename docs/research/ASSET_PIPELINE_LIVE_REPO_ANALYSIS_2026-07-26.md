# Asset Pipeline Live Repo Analysis (2026-07-26)

## Skills consulted

1. [3d-asset-production](/Users/pranay/Projects/external-skills/calesthio__generative-media-skills/skills/production/3d-craft/3d-asset-production/SKILL.md)

## Purpose

Reconcile the asset-provenance contract with the live runtime bridge state.
The repo now has enough asset machinery to prove that imported GLBs can be
admitted, loaded, and reported in the browser. The remaining question is what
must happen before that bridge becomes shippable truth rather than a private
runtime proof.

## Current evidence base

- Asset manifest and runtime bridge derivation:
  - [assets/asset-manifest.json](/Users/pranay/Projects/Game_dev/rigs-unbound/assets/asset-manifest.json)
  - [src/game/runtime-assets.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/runtime-assets.ts)
- Renderer bridge loading and fallback handling:
  - [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)
- Existing provenance contract:
  - [docs/research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)
- Live asset-runway notes:
  - [docs/WORKLOG.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/WORKLOG.md)
  - [docs/exploration/EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## What the live code already proves

The asset lane is no longer just a registry on paper:

- `assets/asset-manifest.json` contains four entries, including two runtime GLB
  candidates and two reference-only records.
- `src/game/runtime-assets.ts` derives the runtime bridge list from the
  manifest instead of hardcoding bridge files in the renderer.
- `src/game/renderer.ts` loads runtime bridge assets and emits fallback-aware
  evidence that says whether the imported asset loaded or fell back.
- The browser surface can already report bridge state by asset id, which makes
  the bridge observable rather than hidden.

## What is still missing

The important gap is not asset loading. It is the public-approval boundary.

Still missing:

- one explicit production-profile contract for the asset classes that may be
  shown to players,
- one durable decision boundary between `runtime-tested` and
  `publicRuntimeApproved`,
- one repeatable approval workflow for promoting a runtime asset from private
  bridge proof to public truth,
- one operator-visible summary that says why a runtime-tested asset is still not
  public,
- one small rights/provenance report that is tied to the promotion decision
  rather than to the registry entry alone.

## Recommended next proof slice

The next durable slice should be the public-approval workflow for one already
loaded bridge asset:

1. define the promotion criteria in the docs trail,
2. record the approval decision separately from the manifest entry,
3. keep the runtime bridge evidence API as the browser proof source,
4. avoid adding more asset classes until the promotion path is explicit.

That keeps the asset lane aligned with the skill guidance:

- finish against the consumer contract,
- preserve source provenance,
- validate in the actual target runtime,
- and keep runtime derivatives separate from editable source truth.

## Addendum (2026-07-26) - runtime bridge is live, but public approval is still the real contract boundary

- Re-checked the live source state while writing this note.
- The manifest now drives the bridge list, and the runtime can already load and
  report imported GLBs.
- The bridge assets are still not the same as public approval:
  - `runtime-tested` means the browser can ingest the asset,
  - `publicRuntimeApproved` still decides whether the player surface may treat
    it as shippable truth.
- That distinction is the useful long-term asset contract:
  runtime ingestion is a proof, public approval is a separate decision.
- Evidence tier: Tier 1 static inspection plus the live repo state already
  recorded in the worklog.

## Addendum (2026-07-26) - bridge evidence and resource evidence answer different questions

The new renderer performance snapshot reports aggregate geometry and texture
counts. That establishes a lightweight runtime resource signal, but it cannot
attribute those resources to either GLB bridge candidate while the scene also
owns procedural terrain, instanced world props, shared material state, and
other runtime-built resources.

For the current bridge assets, the evidence remains intentionally separate:

- manifest + hash + license establish provenance and identity;
- bridge `loaded`/fallback status and `loadedNodeCount` establish ingestion and
  scene presence;
- aggregate renderer counts establish whole-runtime pressure;
- a future isolated load/unload capture must establish an individual candidate
  budget before public promotion.

This prevents an invalid inference such as "the tractor preview loaded five
nodes, therefore it costs a known amount of GPU memory." It also keeps public
approval a deliberate decision rather than an automatic consequence of browser
loading.

Evidence tier: Tier 1 static inspection. This note does not claim a new runtime
capture or a budget approval.

## Addendum (2026-07-26) - public approval is the promotion gate, not the bridge proof

- Re-checked the bridge contract against the current asset/provenance lane.
- `runtime-tested` is the browser proof that the runtime can ingest the GLB.
- `publicRuntimeApproved` is the separate decision that allows the player
  surface to treat that asset as shippable truth.
- That promotion gate belongs to the asset/provenance lane, not to episode
  grammar or any other story-composition surface.
- The durable next step is a separate promotion record with rights,
  provenance, consumer budget, and operator-visible reason attached to the
  approval decision.
- Evidence tier: Tier 1 static inspection.

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this asset-pipeline analysis. This document still
owns the asset provenance and promotion frame; the new note carries the wider
machine-keeper thesis and long-range product direction.

## Addendum (2026-07-28) - developer bridge proof is live, but the public gate remains the real decision

- Re-checked the canonical browser on the developer surface:
  `http://localhost:4173/?surface=developer`.
- The live runtime bridge now reports both imported assets as loaded:
  - `kenney-car-kit-breakable-crate-fixture`
  - `kenney-car-kit-tractor-preview`
- The player surface still stays separate because both rows remain
  `publicRuntimeApproved: false`; that means the bridge is live without being
  public.
- The lowest-risk public-approval candidate remains the breakable crate:
  - it is smaller,
  - it is less semantically entangled with rig gameplay,
  - it already proved the manifest/runtime/texture bridge cleanly,
  - and it can carry the approval workflow without conflating mesh promotion
    with vehicle behavior promotion.
- The tractor preview should stay developer-only until the project explicitly
  wants to promote a vehicle-shaped asset and own the extra behavior/identity
  implications.
- Evidence depth: Tier 4 live browser inspection plus current manifest/runtime
  state.

## Addendum (2026-07-28) - the promotion workflow is now written down separately

- The concrete public-approval workflow now lives in
  [Public Asset Promotion Workflow for First Runtime Bridge Candidate](./PUBLIC_ASSET_PROMOTION_WORKFLOW_FOR_FIRST_RUNTIME_BRIDGE_CANDIDATE_2026-07-28.md).
- The canonical navigation page for the full trail is
  [Public Asset Promotion Package Index](../reviews/PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md).
- That note keeps the decision separate from the manifest entry: the first
  public candidate remains the breakable crate, while the tractor preview stays
  developer-scale proof.
- Evidence depth: Tier 1 doc linkage.

## Addendum (2026-07-28) - developer surface proves the bridge, while public approval remains separate

- Re-checked the developer browser surface on `http://localhost:4173/?surface=developer`.
- The live runtime text now exposes the bridge list directly in the current
  shell snapshot:
  - `kenney-car-kit-breakable-crate-fixture` shows `status: loaded` with
    `loadedNodeCount: 1`
  - `kenney-car-kit-tractor-preview` shows `status: loaded` with
    `loadedNodeCount: 5`
  - both assets report `fallbackActive: false`
- The runtime text also keeps the asset bridge distinct from the acceptance
  gate by continuing to report `runtimeProfileSelection` separately from the
  loaded asset entries.
- That means the asset-production question is now narrower and better defined:
  runtime bridge admission is proven in the developer surface, and the next
  question is public promotion for the first candidate, not whether imported
  GLBs can load at all.
- The durable decision boundary is now captured in
  [ADR-0038](../decisions/ADR-0038-public-asset-promotion-boundary-separates-runtime-tested-bridges-from-public-approval.md),
  which keeps `runtime-tested` distinct from `publicRuntimeApproved`.
- Evidence depth: Tier 4 runtime/manual observation.

## Addendum (2026-07-28) - runtime observability does not weaken the player gate

- Re-checked the current runtime snapshot against the player distribution
  contract.
- The runtime can expose bridge state for developer and operator visibility, but
  that is intentionally separate from player distribution:
  - bridge-loaded runtime assets can be reported in the browser;
  - `publicRuntimeApproved` still controls player-facing admission;
  - the build gate continues to reject unapproved runtime files from player
    output.
- This is the useful long-term asset shape:
  runtime observability for proof, manifest approval for player truth, and a
  build-time gate that enforces the difference.
- Evidence depth: Tier 1 synthesis from the current live bridge notes and
  player-asset boundary review.

## Addendum (2026-07-28) - the player gate still excludes unapproved assets while the developer bridge stays visible

- Re-checked the live developer bridge notes against the player-asset
  distribution boundary.
- The useful distinction is still intact:
  - runtime bridge assets are visible and reportable in the developer surface;
  - `publicRuntimeApproved` remains the player-distribution gate;
  - the build/packaging path continues to reject unapproved runtime files from
    player output.
- The crate remains the first public candidate because it is already proved in
  the developer surface but not yet approved for player truth.
- The tractor preview stays developer-only bridge proof because it is the
  clearer larger-asset test, not the first public candidate.
- Evidence depth: Tier 1 synthesis from the current live bridge notes and the
  player-asset boundary review.

## Addendum (2026-07-29) - the remaining asset gap is rights/provenance linkage, not bridge admission

The current asset trail now separates three questions cleanly:

- can the runtime ingest and report the GLB? yes, the developer bridge already
  proves that;
- can the manifest and approval boundary keep player truth separate from
  developer proof? yes, ADR-0038 and the promotion workflow already define
  that separation;
- is the rights/provenance summary tied to the promotion decision itself
  rather than only to the registry entry? that is the remaining durable
  question.

That narrows the next asset-proof slice in a useful way: the repo does not need
another bridge candidate to understand the current architecture. It needs the
promotion decision to carry a compact rights/provenance summary so the public
approval record can stand on its own.

The next artifact should therefore be a promotion record that ties the asset,
source/right status, runtime proof, and rollback path together in one findable
decision note.

## Addendum (2026-07-29) - the approval templates now force the missing linkage

The public-asset promotion approval record template, candidate checklist, and
workflow now all require a compact rights/provenance summary in the promotion
decision record itself.

That means the remaining asset gap is no longer a vague “add more provenance”
task. The trail now knows exactly where the missing linkage belongs: in the
decision artifact that promotes an already runtime-tested asset to public
approval.

## Addendum (2026-07-29) - the approval worksheet is now explicit, but the manifest is still not the decision

The new approval field map makes the operator workflow easier to use:

- the manifest continues to carry identity, runtime path, hash, and
  `publicRuntimeApproved` state;
- the approval template stays the durable decision artifact;
- the field map now tells the operator which proof feeds each blank in that
  template.

That keeps the manifest from drifting into a second approval surface while
still making the public-approval path easier to execute when the operator is
ready.

## Addendum (2026-07-29) - the package index now points at the exact remaining asset proof

The package index and workflow together make the next step explicit enough that
the repo no longer needs another bridge candidate to explain the architecture.

The remaining proof is the promotion record itself:

- it must identify the asset being promoted,
- it must carry the compact rights/provenance summary,
- it must record the runtime proof that the developer bridge already showed,
- it must name the rollback or replacement path,
- and it must be findable from the package index as the operator-authored
  approval artifact.

That keeps the asset lane honest: runtime bridge admission proves the asset can
be loaded, but the promotion decision proves whether it may become player
truth.

## Addendum (2026-07-29) - the next asset-production proof is a source-to-runtime representation chain

- The current analysis now separates two different problems cleanly:
  - visibility/LOD still needs a representation-tier proof slice;
  - public asset approval still needs a durable rights/provenance-linked
    promotion record.
- The next asset-production proof should therefore be a source-to-runtime chain
  for one asset family, not another bridge candidate:
  - one named source file or source package;
  - one documented runtime derivative or export target;
  - one explicit rights/provenance summary carried into the promotion note;
  - one visible representation choice or LOD-variant summary tied to the
    exported asset.
- That keeps asset production grounded in deliverable consumer contracts rather
  than in generator-side output alone.
- Anything else? No. The current gap is already specific enough to avoid
  widening the lane into a generic asset-management rewrite.
