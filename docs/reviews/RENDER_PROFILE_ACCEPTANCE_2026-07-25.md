# Render Profile Acceptance (2026-07-25)

## Objective

Create an acceptance checkpoint for renderer profile and accessibility behavior before expanding to new locomotion or major content.

## Evidence to collect

- baseline profile selection and runtime snapshot
- reduced-motion behavior verification
- desktop and narrow layout validation
- console and recoverability checks

## Invariants (hard)

1. Deterministic input/output path remains unchanged.
2. Camera and world contracts remain grounded in kernel world state.
3. Performance profile degradation does not alter save/restore invariants.
4. Core visibility/action feedback remains present in all profiles.

## Acceptance criteria

- `npm run build` path remains stable across profile-related changes.
- browser acceptance includes at least one mobile-safe and one standard-path run.
- no newly introduced hard fallback to blank/errored rendering path.

## Anything else?

Use this review as the gate before public playtest or route expansion.
