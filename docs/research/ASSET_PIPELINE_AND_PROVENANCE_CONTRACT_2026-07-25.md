# Asset Pipeline and Provenance Contract (2026-07-25)

## Skills consulted

1. [3d-asset-production](/Users/pranay/Projects/external-skills/calesthio__generative-media-skills/skills/production/3d-craft/3d-asset-production/SKILL.md)

## Purpose

Turn the repo’s asset provenance notes into a named runtime asset pipeline contract.

The repo already treats asset provenance as important, but it still lacks a first-class asset flow from source artifact to runtime manifest. This contract makes that flow explicit so browser-facing assets can be validated, compressed, versioned, replaced, and deprecated without becoming a second truth source.

## Current evidence base

- Asset provenance and rights notes:
  - [docs/research/ASSET_PROVENANCE_REGISTER.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/ASSET_PROVENANCE_REGISTER.md)
  - [docs/research/WEB_ASSET_INGEST_AND_COMPRESSION_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/WEB_ASSET_INGEST_AND_COMPRESSION_CONTRACT_2026-07-25.md)
- Runtime data path and world rendering:
  - [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)
  - [src/game/terrain.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/terrain.ts)
  - [src/game/world.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/world.ts)
- Roadmap lane for asset pipeline and provenance:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the right direction:

- asset provenance is tracked as a separate concern,
- browser-facing asset ingestion and compression are already named elsewhere,
- world and terrain are data-driven rather than ad hoc,
- asset replacement and rights warnings are already part of the broader documentation trail.

That means the pipeline can be formalized without inventing a parallel asset truth source.

## What is still missing

The current surface still lacks:

- a canonical runtime asset manifest schema,
- source artifact to runtime manifest lineage,
- provenance/license metadata on every runtime-relevant asset,
- explicit compression and LOD-intent metadata,
- safe replacement/deprecation behavior for runtime entries,
- rejection rules for incomplete or incompatible asset records.

## Contract shape

A durable asset pipeline should separate:

1. **Source artifact**
   - DCC file, scan, generated asset, or other source
   - source path or source ID
   - authoring provenance
2. **Normalized export**
   - cleaned geometry
   - bake outputs
   - compression profile
   - derived runtime files
3. **Manifest entry**
   - id
   - version
   - hash
   - license / ownership status
   - modification history
   - LOD intent
   - replacement/deprecation path
4. **Runtime activation**
   - validated-manifest only
   - reject or defer invalid records
   - preserve a consistent asset registry across sessions

This keeps runtime asset use inspectable and safe.

## Validation rules

The contract should fail visibly if it:

- lacks provenance or license metadata,
- exceeds the allowed budget or compression policy,
- violates naming or schema rules,
- references incompatible runtime expectations,
- misses derived artifacts,
- lets raw source files bypass validated manifests,
- cannot replace or deprecate an asset safely.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one versioned asset manifest schema,
2. one provenance/license validator,
3. one rejection test for a missing or incompatible asset record,
4. one safe replacement/deprecation path for a runtime asset entry.

## Open questions

- Should the first runtime manifest cover static props, terrain variants, or vehicle-related art?
- Should provenance include both authoring source and tool/provider lineage for generated inputs?
- Should replacement/deprecation events be visible to operators only, or also to the player?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The repo already knows asset provenance matters. This contract makes the delivery
path explicit so runtime can consume validated manifests instead of raw source
art, and so replacement never becomes ambiguous.

## Addendum (2026-07-25) - Current runtime asset posture

- The live Field 02 renderer is still deliberately asset-light:
  - terrain readability comes from vertex colours and procedural geometry,
  - `src/game/renderer.ts` explicitly notes zero texture assets and zero asset
    provenance obligations for the current terrain pass,
  - no imported runtime GLB/FBX/texture manifest is part of the active browser
    path yet.
- That makes the current asset-production pressure point clearer:
  - the repo already has concept/reference art and source-library audits,
  - the next durable step is a versioned runtime asset manifest once imported
    art actually enters the playable path.
- Evidence tier: Tier 1 static code/doc inspection plus live runtime context.

## Addendum (2026-07-25) - provenance remains reference-first, not runtime-activated

- Re-checked the pipeline contract against the current browser daemon snapshot
  and repo state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The pipeline still has the right separation:
  - provenance is tracked in the register,
  - source-library inspection is recorded,
  - runtime remains procedural and asset-light.
- The missing layer is still the activation bridge:
  - no runtime asset manifest has been promoted into the playable path,
  - no imported asset has crossed from reference-only into runtime truth,
  - no replacement/deprecation cycle has yet been exercised against a live
    imported asset entry.
- That means the pipeline is correctly preventing provenance drift today, but it
  still needs the first runtime manifest adoption before the contract becomes a
  live asset gate rather than a documented boundary.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code,
  provenance, and doc inspection.

## Addendum (2026-07-26) - the asset registry is real, but still not runtime-activated

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- `assets/asset-manifest.json` is now a real registry, but it is still entirely
  pre-runtime:
  - `schemaVersion: 1`,
  - `assetRoot: "assets/runtime"`,
  - `runtimeFormat: "glb"`,
  - three entries, all still reference/proposed and all with `runtimePath:
null`.
- The registry already does the important provenance work:
  - source/reference paths are named,
  - rights status is recorded,
  - intended use is documented,
  - a hash exists for the admitted reconstruction reference.
- The missing layer is still the activation bridge:
  - no imported runtime asset is active in the playable path,
  - no manifest entry has crossed into runtime truth,
  - no replacement/deprecation cycle has been exercised on a live imported
    asset,
  - no runtime validator is consuming this registry yet.
- The useful conclusion is that the repo has a credible asset-governance spine,
  but it remains a source/provenance registry until a real runtime asset is
  admitted and validated through the playable path.

## Addendum (2026-07-26) - first bridge proof should be a small static prop, not the tractor rig

- Re-checked the live runtime summary before choosing the next proof slice.
- The current playable surface already carries the game’s core semantics:
  - active rig `utility-tractor`,
  - additional `toy-buggy` and `marsh-skimmer` rigs,
  - live activity `cargo-relay`,
  - world memory, discovery, and performance hooks all working.
- Because the runtime already exercises multiple locomotion and capability
  paths, the first imported asset should prove the activation bridge without
  adding new gameplay semantics at the same time.
- The better first proof slice is therefore a small static prop or fixture:
  - it still exercises manifest admission, rights/provenance, import, and
    browser visibility,
  - it keeps mesh promotion separate from tractor behavior contracts,
  - it gives us a clean baseline for replacement/deprecation and budget checks.
- The tractor-specific mesh can still be the eventual flagship asset, but it is
  not the cleanest first bridge proof because its runtime meaning overlaps with
  the existing rig contract.
- So the next durable milestone should be: one small approved static prop in
  `assets/runtime`, promoted through the manifest and visible in the browser.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## Addendum (2026-07-26) - chosen first bridge candidate is the Car Kit breakable crate

- Re-checked the Kenney audit against the current manifest posture.
- The first bridge candidate is now explicit:
  - source file: `3D assets/Car Kit/Models/GLB format/box.glb`,
  - stable semantic key: `kenney-car-kit-breakable-crate-fixture`,
  - role: small static prop / breakable crate baseline for manifest admission
    and browser visibility.
- Why this specific asset won:
  - it is smaller and less semantically entangled than the tractor GLB,
  - it exercises the same import/validation/promotion path needed for later
    runtime assets,
  - it gives a clean baseline for replacement/deprecation behavior.
- The manifest now names that exact candidate, but the runtime bridge is still
  not crossed:
  - `runtimePath` now points at a repo-owned runtime copy,
  - the runtime renderer now has a bridge fixture hook for that GLB,
  - browser proof is still pending because the change has not been observed live.
- Next concrete step from here is browser observation of the imported prop,
  not another candidate search.
- Evidence depth: Tier 1 static code and doc inspection, plus Tier 4 runtime

## Addendum (2026-07-26) - source-of-truth reconciliation for runtime bridge candidates

Direct static inspection resolves a drift between earlier addenda and the
current repository source:

- `assets/asset-manifest.json` now contains four entries, not three;
- two `proposed` static-prop entries have repo-owned `.glb` `runtimePath`
  values: `kenney-car-kit-breakable-crate-fixture` and
  `kenney-car-kit-tractor-preview`;
- `src/game/runtime-assets.ts` derives bridge specifications from every
  manifest entry with a runtime path;
- `src/game/renderer.ts` loads those specifications with `GLTFLoader`, keeps a
  fallback visible while loading or after failure, and exposes per-asset bridge
  evidence to the acceptance surface;
- the asset preflight tool accepts runtime paths only inside `assets/runtime`
  and preflights their GLB structure and local dependencies.

The prior phrasing that "no runtime asset has been imported" is therefore no
longer accurate at the source-wiring level. The accurate current claim is:

> Two manifest-owned runtime bridge candidates are wired into the renderer, but
> remain `proposed`. A fresh browser observation and rights review are still
> required before either is promoted to `runtime-tested` or `approved`.

Evidence tier: Tier 1 static inspection of the manifest, preflight, runtime
asset registry, renderer bridge, and test fixture. This addendum does not claim
a new browser run or approve either asset for distribution.
observation for the pre-change surface only.

## Addendum (2026-07-26) - tractor preview proves the bridge scales beyond one prop

- Re-checked the live browser after promoting the tractor preview into the same
  bridge path.
- The pipeline now has two live runtime assets:
  - `kenney-car-kit-breakable-crate-fixture`,
  - `kenney-car-kit-tractor-preview`.
- The tractor preview proves the bridge pattern scales beyond a tiny prop:
  - `status: loaded`,
  - `fallbackActive: false`,
  - `loadedNodeCount: 5`,
  - `errorMessage: null`.
- The browser console remains clean apart from the expected Vite connect logs.
- The registry is therefore no longer merely a pre-runtime manifest: it now
  promotes both a small static prop and a vehicle-shaped preview through the
  same browser-visible path.
- Evidence depth: Tier 4 runtime/manual observation.

## Addendum (2026-07-26) - asset bridge evidence now appears in the main snapshot

- Re-checked the live browser after the `render_game_to_text()` update.
- The canonical snapshot now includes `runtimeAssetBridges`, so the bridge
  state is visible in the main runtime JSON instead of only through ad hoc
  helper hooks.
- The snapshot currently reports both bridges as loaded:
  - crate bridge,
  - tractor preview bridge.
- This is the right observability shape for a manifest-driven asset pipeline:
  the main payload now tells the same story as the bridge hooks and the browser
  console.
- Evidence depth: Tier 4 runtime/manual observation.

## Addendum (2026-07-26) - operator HUD now shows bridge health directly

- Re-checked the live developer HUD after the observability wiring landed.
- The runtime diagnostics line now includes bridge state directly:
  - `crate:loaded`
  - `tractor:loaded`
- The same HUD line still shows the basic performance budget:
  - fps,
  - draw calls,
  - heap usage.
- This is the operator-facing version of the bridge proof:
  the app now exposes asset-health status in the HUD, in the canonical snapshot,
  and in the direct bridge hooks.
- Evidence depth: Tier 4 runtime/manual observation.

## Addendum (2026-07-26) - bridge health is intentionally runtime-only, not save data

- Re-checked the storage contract before closing the bridge lane.
- `src/game/storage.ts` still serializes only:
  - `state`
  - `worldMemory`
- The new bridge evidence is intentionally excluded from save payloads:
  - it is runtime-derived truth,
  - it should rehydrate from the runtime asset files on reload,
  - persisting it would create an unnecessary second truth source.
- That keeps the asset pipeline clean:
  - save files remember the world,
  - the browser reloads the bridge health from the manifest and runtime copy.
- Evidence depth: Tier 1 static code inspection.

## Addendum (2026-07-26) - runtime bridge selection now comes from the manifest

- Re-checked the live browser after the manifest-driven refactor landed.
- `src/game/runtime-assets.ts` now derives the runtime bridge list from
  `assets/asset-manifest.json` instead of hardcoding bridge files inside the
  renderer.
- The runtime snapshot now exposes `runtimeAssetBridges` as a list, and the
  developer HUD summarizes bridge health as `bridges:2/2`.
- Live browser proof currently shows:
  - `kenney-car-kit-breakable-crate-fixture` loaded,
  - `kenney-car-kit-tractor-preview` loaded.
- This is the durable shape we wanted: the manifest is the source of truth for
  runtime bridge selection, and the renderer only consumes that derived list.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26) - asset-production lens: runtime-tested is not the same as public-approved

- Re-checked the asset manifest and the live browser status after the
  `3d-asset-production` pass.
- The repo now clearly separates three states for imported assets:
  - `concept` reference assets with no runtime path,
  - `runtime-tested` bridge assets that load in the browser,
  - `publicRuntimeApproved: false` for both bridge assets, meaning they are
    still not cleared as public/shippable production truth.
- This is the correct long-term distinction, but it also reveals the next
  production gap:
  - explicit target-consumer budgets,
  - material/LOD/profile intent,
  - browser validation report per asset,
  - and a public-approval step that is separate from “it loads.”
- The current runtime evidence is strong enough to prove the bridge, not strong
  enough to declare the assets production-approved.
- Evidence depth: Tier 1 static manifest inspection plus Tier 4 live browser
  status continuity.
