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
