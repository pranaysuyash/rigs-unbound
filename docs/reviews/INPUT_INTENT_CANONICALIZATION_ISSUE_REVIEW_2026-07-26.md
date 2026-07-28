# Input Intent Canonicalization Issue Review

**Date:** 2026-07-26  
**Status:** Open architecture issue; no runtime migration performed in this pass  
**Severity:** P1 architecture drift risk before additional controller, AI, or network input paths  
**Evidence tier:** Tier 1 static source inspection. No test, build, browser, or device command was run in this pass.

## Finding

The playable simulation/replay path currently uses `InputFrame` as its authoritative fixed-step input record. `src/game/vehicle-intent.ts` separately defines a stronger semantic continuous-control model, `VehicleIntent`, but the source search found no active runtime consumer of that module.

This is not a player-facing failure today. With one browser input path and a bounded rig set, the active `InputFrame` path is coherent. It becomes a structural risk as soon as the project adds a second input adapter, analog gamepad controls, AI steering, replay import/export, a physics-lab bridge, or multiplayer input transport: two representations could normalize, record, and interpret the same action differently.

## Current evidence

| Artifact                                        | Role now                                                                           | Canonical status                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `InputFrame` in the contracts/state/replay path | Active fixed-step simulation input and replay sample shape                         | Current authoritative runtime input record.                        |
| `src/game/vehicle-intent.ts`                    | Normalized throttle, steering, brake, handbrake, tool, stabilise, and boost values | Prepared semantic contract; not an active runtime source of truth. |
| `normalizeVehicleIntent()`                      | Sanitizes untrusted continuous input into bounded values                           | Not currently called by the gameplay runtime.                      |
| Primary-action and rig-selection commands       | Versioned discrete intent/outcome proofs                                           | Separate from continuous driving input and correctly narrow.       |

## Why this matters

The project’s architecture requires:

```text
browser / gamepad / AI / replay / network input
  -> one normalized semantic intent
  -> fixed-step simulation interpretation
  -> authoritative state and events
  -> renderer, audio, UI, replay observers
```

If `InputFrame` and `VehicleIntent` both become independently authoritative, the project can develop subtle divergence in axis ranges, brake/throttle coexistence, tool activation, input serialization, replay hashes, and server validation. These are expensive to reconcile after saves/replays or multiple controller types exist.

## Decision for the current stage

`InputFrame` remains the active authoritative runtime contract because it is the record currently used by fixed-step simulation and replay. `VehicleIntent` must be treated as a non-canonical prepared adapter contract until a deliberate migration makes one representation derive from the other at exactly one boundary.

Do not add a third input representation.

## Required migration decision before the next input producer

Before adding analog/gamepad, AI driving, imported replay input, remote input, or a second vehicle controller, choose one of these paths and record the decision in an ADR:

### Option A: Promote `VehicleIntent`

- Input adapters normalize into `VehicleIntent`.
- A single fixed-step adapter derives the simulation’s low-level control frame.
- Replays record the normalized semantic intent or a versioned canonical derivative.
- Existing `InputFrame` callers are migrated together; it is not retained as a parallel editable truth.

### Option B: Retire `VehicleIntent`

- Extend and version `InputFrame` as the only semantic input type.
- Move normalization guarantees into that canonical contract.
- Inventory and remove/archival-document the unused type only after confirming no physics-lab or future bridge owns it.

Option A is the likely long-term fit if analog/mobile/gamepad/AI control is a product direction, because its axes and tool channels express machine intent rather than browser keys. It is not automatically selected until a real second producer demonstrates the required mapping.

## Migration acceptance criteria

1. Exactly one canonical serialized input representation.
2. One normalization boundary for untrusted browser/controller/remote values.
3. Deterministic fixed-step interpretation independent of key-code/UI details.
4. Versioned replay compatibility or explicit replay-format migration.
5. Tests for neutral, malformed, extreme, simultaneous, and analog input cases.
6. No renderer/audio/UI component obtains direct authority over the intent/state transition.
7. Browser and controller evidence before describing analog input as supported.

## What must not happen

- Copy `normalizeVehicleIntent()` into another input adapter.
- Record browser keys in one replay and continuous axes in another without a versioned format boundary.
- Let an AI/controller bypass the same sanitization/validation path as player input.
- Remove the existing `VehicleIntent` module as "unused" without an inventory of physics-lab or future-controller intent.
- Perform a broad input rewrite without the second-producer trigger, migration plan, and replay compatibility work.

## Closure trigger

This issue closes only when a deliberate ADR selects one canonical input contract and the active runtime/replay path has been migrated or the unused prepared contract has been safely superseded. Documentation alone does not close the source-of-truth risk.
