# ADR-0008: Camera policies and direct view selection

- Date: 2026-07-25
- Status: accepted for the local reference runtime
- Owner / next reviewer: project owner
- Affected runtime: `src/game/contracts.ts`, `src/game/state.ts`, `src/game/renderer.ts`, `src/main.ts`

## Context

The reference runtime had accumulated Chase, Tactical, and Survey branches while the product thesis spans many vehicle types, scales, perspectives, and activities. The player also had only a cycle key, so reaching a particular view was indirect and the available camera vocabulary was not visible.

The camera needs to give the player an immediate way to choose how they read the world while remaining a reusable policy layer whose meanings survive new rigs and mobility adapters.

## Decision

The canonical camera vocabulary is an ordered, typed list:

- Chase: rig-following action framing with speed-sensitive field of view;
- Hood: rig-height, forward-looking driving framing;
- Side: attachment, suspension, towing, and silhouette inspection;
- Tactical: elevated local manoeuvring;
- Top-down: exact overhead, heading-oriented world reading;
- Survey: high pulled-back route and terrain planning.

`CAMERA_MODES` owns the list and save-validation vocabulary. The gameplay state exposes `selectCamera` for direct choice and `cycleCamera` for keyboard/touch convenience. The interface exposes an accessible View selector, the `C` cycle action remains, and `window.selectCamera(mode)` joins the browser observability contract.

Rig profiles may supply scale-sensitive chase/focus offsets. They do not own camera meanings. The renderer applies the same policy to every rig, so a new vehicle can inherit the camera vocabulary without vehicle-name branches.

## Alternatives considered

- Add only a top-down branch: rejected because it would preserve an invisible, ad-hoc toggle and offer no reusable vocabulary.
- Make every rig define all camera transforms: rejected because that duplicates policy and encourages vehicle-specific assumptions.
- Add number-key shortcuts: rejected because number keys already fit workshop modules.
- Replace the existing cycle action: rejected because touch and keyboard users already rely on it.

## Trade-offs and risks

- Hood can intersect unusually tall or long future rigs. A bounded camera-mount adapter is the closure path when a real contrasting rig proves it necessary.
- Exact top-down hides height differences. Tactical and Survey remain available when vertical terrain context matters.
- Camera collision currently raymarches terrain, not arbitrary props. Prop collision is a future hardening item if live play shows repeatable obstruction.
- Transitions interpolate position and field of view but not a separately persisted orientation quaternion.

## Validation plan

- deterministic state tests cover direct selection, ordered cycling, wraparound, and current-schema recovery;
- TypeScript and production build checks cover the typed browser/UI contract;
- browser acceptance selects every policy, checks selector/state agreement, and captures a top-down artifact;
- manual desktop and narrow-viewport inspection checks framing, controls, and console output.

## Rollback and revisit triggers

The policy list can be narrowed or reordered without changing rig state, but saved values must remain recoverable for at least one schema cycle. Revisit this decision when a bicycle, aircraft, or spacecraft demonstrates that a policy no longer maps coherently through a bounded adapter.

## Anything else?

Yes. Camera policies are part of the player’s spatial literacy, not a cosmetic
setting. Future activity modes should request an existing policy or justify a
new reusable one; they should not silently reposition the camera through
activity-specific renderer branches. A new locomotion family must test every
policy before the policy vocabulary is claimed to be portable.

## Update log

- 2026-07-25: Accepted and implemented with typed direct selection, an
  accessible selector, browser observability, state recovery coverage, and a
  captured top-down acceptance artifact.
