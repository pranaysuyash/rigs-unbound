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
