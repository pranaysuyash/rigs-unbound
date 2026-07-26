# Modding and Creator-Pack Validation Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s data-driven content model into a named validation contract for creator packs before public extension grows into a second mutable truth source.

The project already has a strong data-first direction for world content, rigs, capabilities, and authored anchors. What it does not yet have is a safe modding surface with validated pack manifests, compatibility checks, and rollback/disable behavior.

## Current evidence base

- Data-driven rig and world content:
  - [src/game/contracts.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/contracts.ts)
  - [src/game/world.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/world.ts)
- Validation and migration surfaces:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
  - [src/game/storage.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/storage.ts)
- Roadmap lane for modding and creator-pack validation:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already supports the right starting posture:

- world and rig content are already data-driven,
- content is already validated on load/migration paths,
- capability and activity concepts already exist,
- provenance and asset validation are already being formalized elsewhere in the repo.

That means creator packs can reuse the existing contract stack instead of inventing parallel runtime rules.

## What is still missing

The current surface still lacks:

- a versioned pack manifest,
- explicit dependency declarations,
- pack-level provenance and compatibility rules,
- safe disable/rollback behavior for invalid or stale packs,
- publication or moderation staging,
- a clear boundary between validated packs and runtime authority.

## Contract shape

A durable modding contract should separate:

1. **Pack manifest**
   - id
   - version
   - author/source
   - dependencies
   - compatible game/version range
   - declared capabilities and activities
2. **Validation**
   - schema validation
   - capability compatibility
   - activity compatibility
   - provenance/license checks
   - budget or activation checks
3. **Activation**
   - local/private validation
   - staged enablement
   - safe disable/rollback
   - moderated publication when applicable
4. **Runtime boundary**
   - packs may provide data and contracts
   - packs may not silently become a second authority surface

This keeps the modding layer extensible without letting it bypass the game’s core truth.

## Validation rules

The contract should fail visibly if it:

- accepts a pack with missing or incompatible schemas,
- allows unresolved dependency loops,
- lets a pack exceed activation or budget constraints,
- ignores provenance or license metadata,
- mutates runtime authority directly,
- cannot disable a stale or invalid pack safely.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one versioned pack manifest,
2. one compatibility validator for capability/activity/affordance contracts,
3. one dependency or provenance rejection test,
4. one safe disable or rollback test for an invalid pack,
5. one staged publication note for future public UGC.

## Open questions

- Should the first pack surface be local-only creator packs or curated public packs?
- Should pack compatibility be declared against game version, contract version, or both?
- Should moderation live in a separate ops workflow or in the pack manifest lifecycle?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The repo is already headed toward a data-first content model. This contract makes
creator growth explicit and safe so new packs expand the game without becoming a
shadow runtime.

## Addendum (2026-07-25) - creator packs are still future-facing, not a live runtime authority

- Re-checked the contract against the current browser daemon snapshot and live
  repo state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime still supports the correct underlying posture for packs:
  - data-driven world and rig content,
  - load-time validation and migration,
  - provenance and asset validation contracts already named elsewhere in the
    repo.
- That means creator packs can still be added without rewriting the runtime.
- What is still missing is the first-class pack lifecycle the contract names:
  - versioned pack manifest,
  - explicit dependencies,
  - safe disable/rollback behavior,
  - staged publication/moderation flow,
  - a hard boundary keeping packs out of runtime authority.
- So the modding lane is still a future expansion surface, not an active
  second truth source in the playable path.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## Addendum (2026-07-25) - pack publication stays gated by the public evidence surface

- Re-checked the modding contract against the current browser daemon snapshot
  and live repo state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime still supports local, validated content growth:
  - creator packs remain data-first,
  - load-time validation and migration are still the accepted boundary,
  - safe disable / rollback remains the correct future behavior.
- What is still missing is the public publication layer:
  - no published pack route,
  - no moderated public pack workflow,
  - no public creator-discovery surface in the live runtime,
  - no pack lifecycle that would let a user treat a pack as shared public
    evidence rather than local validated content.
- So the contract is correctly keeping publication behind the public evidence
  surface instead of collapsing local creator growth into a live public channel.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## Addendum (2026-07-25) - fresh Field 02 recheck, same local-only pack boundary

- Re-checked the modding contract against the current browser daemon and live
  Field 02 runtime.
- The daemon still reports a healthy browser surface with zero console logs.
- The current runtime still supports the data-driven posture this contract
  depends on:
  - rig capability definitions live in `src/game/contracts.ts`,
  - authored world anchors and sites live in `src/game/world.ts`,
  - save/load validation and migration keep local content recoverable.
- That means the runtime already has the right substrate for creator packs.
- What is still missing is the pack lifecycle itself:
  - no versioned pack manifest in the playable path,
  - no explicit dependency graph for packs,
  - no staged publication or moderation workflow,
  - no public creator-discovery surface,
  - no live runtime boundary that would let packs become a second authority
    surface.
- So the modding lane is still correctly future-gated: local data-first content
  is real now, but public creator packs remain a separate envelope rather than
  an active runtime feature.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26) - creator-pack lifecycle is still broader than the current asset validation slice

- Re-checked the modding contract against the current repo state and the asset
  validation path.
- The runtime now proves a strong local content posture:
  - data-driven rig/world content is already real,
  - load-time validation and migration are already real,
  - asset manifests and preflight validation already gate runtime imports,
  - imported runtime assets remain separate from public approval.
- That means pack-like validation exists in slices, but the general creator-pack
  lifecycle is still missing:
  - no versioned pack manifest in the playable path,
  - no explicit dependency graph for packs,
  - no staged publication or moderation workflow,
  - no public creator-discovery surface,
  - no safe disable/rollback path for a pack lifecycle that is actually
    present in runtime.
- The next proof should therefore be a local-only pack manifest and rollback
  test first, not a public UGC system. Public moderation stays future-gated.
- Evidence depth: Tier 1 static inspection of the current validation/asset
  contracts, with the earlier Tier 4 runtime anchor unchanged.

## Addendum (2026-07-26) - asset admission is real, but pack lifecycle is still not first-class

- Re-checked the modding lane against the current manifest and preflight code.
- The runtime now has a real asset-admission slice:
  - `assets/asset-manifest.json` carries stable ids, source paths, runtime
    paths, status, and rights metadata,
  - `tools/asset-preflight.mjs` validates GLB structure, path safety, digest
    integrity, and missing dependencies,
  - runtime bridges exist for approved/tested GLBs while public approval stays
    separately gated.
- That proves content can be admitted and rejected in a reproducible local
  slice.
- What is still missing is the broader creator-pack lifecycle:
  - no versioned pack manifest in the playable path,
  - no explicit dependency graph for packs,
  - no staged publication or moderation workflow,
  - no runtime-ready / validation-only / deprecated status across general
    authored content,
  - no safe disable or rollback path for a pack lifecycle that players can
    actually activate.
- So the modding lane is still future-facing at the pack level, even though the
  asset slice is now real enough to serve as the first reusable proof.

## Addendum (2026-07-26) - module composition and asset admission are real, but the pack lifecycle is still future-gated

- Re-checked the modding lane against `src/game/contracts.ts`,
  `src/game/state.ts`, `src/game/runtime-assets.ts`, and `assets/asset-manifest.json`.
- The runtime now proves the important local substrate for packs:
  - rig capabilities and modules are data-driven rather than hardcoded
    inheritance,
  - `installModule()` still validates cost, compatibility, and ownership before
    mutating canonical rig state,
  - asset admission is gated by a versioned manifest and preflight/rights
    metadata,
  - runtime bridges remain separated from public approval.
- That means the content model is real enough to support creator packs without
  inventing a second runtime truth source.
- The remaining gap is the pack lifecycle itself:
  - no versioned pack manifest in the playable path,
  - no explicit pack dependency graph,
  - no staged publication or moderation workflow,
  - no general safe disable / rollback path for player-activatable packs.
- So the modding lane remains future-facing at the pack level, while the local
  module/asset substrate is already strong enough to be the first reusable
  contract boundary.
- Evidence depth: Tier 1 static source inspection of the current data-driven
  modules and asset admission path.

## Addendum (2026-07-26) - episode grammar depends on pack validation, but it does not replace it

- Re-checked the creator-pack lane against the episode-grammar direction.
- Episode grammar can only safely compose on top of validated packs if the
  pack lifecycle remains explicit about dependencies, rollback, and publication
  state.
- That makes the pack-validation contract an upstream content envelope beneath
  episode grammar, not the story-composition layer itself.
- The current local-only pack posture remains the live mode; public pack
  publication is still future-gated.
- Evidence tier: Tier 1 static inspection.
