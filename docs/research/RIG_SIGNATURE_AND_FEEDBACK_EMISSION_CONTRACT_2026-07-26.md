# Rig Signature and Feedback Emission Contract (2026-07-26)

## Purpose

Turn the deterministic rig-emission source into a named presentation contract
so the repo keeps its boundary clear: the signature source derives machine
state, but it does not own player feedback, listener distance, or gameplay
authority.

The current runtime fixture in `src/game/signature.ts` already produces bounded
channels from rig state and explicit context:

- acoustic
- illumination
- thermalProxy

The module is intentionally deterministic and non-authoritative. It does not
mutate the rig, it does not select among competing sources, and it does not
claim a combined attraction score.

## Current evidence base

- [src/game/signature.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/signature.ts)
- [src/game/signature.test.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/signature.test.ts)
- [docs/research/AUDIO_PRESENTATION_AND_SPATIAL_BUDGET_CONTRACT_2026-07-26.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/AUDIO_PRESENTATION_AND_SPATIAL_BUDGET_CONTRACT_2026-07-26.md)
- [docs/research/GAME_VFX_STATE_SHELL_VISUAL_QUALITY_2026-07-26.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/GAME_VFX_STATE_SHELL_VISUAL_QUALITY_2026-07-26.md)

## What is already there

The source contract already proves several useful things:

- the emission channels are deterministic for equal inputs,
- the rig object is not mutated by the signature derivation,
- the output stays bounded to `0..1`,
- causes remain distinct across motion, strain, tool use, and load,
- the logic works for both ground and hover rigs without rig-name branching,
- a disabled rig emits no active signature.

That makes the module a real evidence fixture for future feedback work.

## What is still missing

The remaining gap is the player-facing consumer:

- no real listener-owned presentation surface,
- no accessible feedback mapping that turns the signature into player-readable
  state,
- no spatial scheduler or source owner that uses the channels as a runtime
  contract,
- no proof yet that the emission source improves comprehension in the browser
  rather than only in code.

That means the contract is useful, but it is still a fixture until a listener
and accessible player feedback land together.

## Recommended next proof slice

The next durable step should be narrow:

1. connect the signature source to one real listener-owned presentation path,
2. make the player-facing cue accessible and readable without mutating
   gameplay state,
3. keep the source non-authoritative,
4. avoid building a generic audio or VFX scheduler until there are at least two
   consuming surfaces.

## Validation rules

The contract should fail visibly if it:

- mutates rig state while deriving the signature,
- reintroduces rig-name branching,
- treats the signature as gameplay authority,
- hides the output from accessible player feedback,
- claims a generic source scheduler before a second consumer exists,
- conflates listener-facing presentation with simulation truth.

## Anything else?

Yes: this emission layer is deliberately smaller than a full audio or VFX
system. It exists so the game can later express machine condition through a
stable source contract instead of scattered ad hoc effects.
