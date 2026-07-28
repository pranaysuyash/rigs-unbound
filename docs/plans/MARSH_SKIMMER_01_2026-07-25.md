# Marsh Skimmer 01: non-ground mobility proof

- Date: 2026-07-25
- Status: implemented with local Tier 2–4 evidence
- Decision: [ADR-0009](../decisions/ADR-0009-bounded-mobility-adapters.md)
- Player question: does Drift create a new route-reading fantasy rather than a
  third speed profile?
- Architecture question: can non-ground motion compose with the existing rig,
  world, camera, input, persistence, and observability contracts?

## Derived implementation scope

1. Advance persistence to schema v4 while keeping v1–legacy recovery.
2. Move ground-only runtime fields into `GroundMobilityState`.
3. Add the typed mobility registry and preserve the existing ground model.
4. Add a deterministic low-hover adapter and `HoverMobilityState`.
5. Add Drift as a third persistent rig near Sunken Flats.
6. Add a wheel-free skimmer renderer factory with readable lift effects.
7. Make HUD, audio, switching, recovery, public state, and persistence narrow
   through the mobility contract rather than rig IDs.
8. Extend tests for migration, invalid unions, determinism, water crossing,
   steep-ground trade-offs, and shared world memory.
9. Extend browser acceptance across three rigs, schema v4, hover traversal,
   cameras, reload, desktop, and narrow layouts.
10. Update the exploration map, README, design direction, worklog, and evidence
    review with verified outcomes and remaining gaps.

## Explicit exclusions

- no new activity controller or minigame;
- no new currency or progression store;
- no free-flight altitude input;
- no combat, enemies, multiplayer, backend, or public deployment;
- no raw Kenney asset import;
- no speculative adapter types beyond implemented `ground` and `hover`;
- no retuning Torque or Spark unless a regression proves the refactor changed
  their existing contract.

## Acceptance contract

### Player-facing

- Drift is selectable beside Torque and Spark and clearly has no wheels.
- The same controls move it, but its lift, yaw, water freedom, slope weakness,
  sound, particles, and telemetry communicate a distinct machine.
- It crosses a named deep-water route that stops or damages an unmodified
  ground rig.
- It does not erase the reason to use Torque or Spark.
- Its identity, position, condition, discoveries, and hover state survive
  reload.

### Architecture

- universal `RigState` has no ground-only wheel/contact fields;
- each profile and persisted mobility state agree on one adapter kind;
- state stepping and settling dispatch through one adapter registry;
- activities and world queries still use capabilities, not vehicle names;
- renderer narrowing is contained in rig factories and mobility presentation;
- legacy world memory survives v4 migration;
- invalid union data fails closed.

### Verification

- typecheck and formatting pass;
- all existing root and kernel-probe tests pass;
- new adapter, migration, and water-crossing tests pass;
- production build passes with bundle delta recorded;
- visible browser acceptance passes with no console/page errors;
- desktop, top-down, water-crossing, and narrow screenshots are reviewed;
- evidence states exactly what is local, inferred, or still unverified.

## Implementation order

1. Contracts and migration fixtures.
2. Ground-state ownership refactor with no behavior change.
3. Adapter registry and ground dispatch.
4. Hover state and deterministic motion.
5. Drift profile/spawn and shared-state integration.
6. Renderer/audio/UI presentation.
7. Automated tests.
8. Browser acceptance and screenshots.
9. Documentation and multi-pass review.

## Anything else?

Yes. The implementation should make the fourth adapter cheaper to add but not
pretend to know what that adapter is. A clean two-member union with strong
tests is better than a “universal vehicle physics” interface full of optional
fields.

## Outcome — 2026-07-25

The coherent stage is implemented through a two-member typed registry. Ground
contacts are no longer universal state; Drift owns lift velocity, clearance,
cushion pressure, and skirt contact. Valid legacy records migrate to v4, all three
rigs share the world/input/camera/activity/persistence path, and visible Chrome
acceptance exercised deep-water motion and reload.

Verified locally:

- 83 root tests and seven preserved deterministic-kernel probe tests pass;
- TypeScript, formatting, production build, and diff-whitespace checks pass;
- visible Chrome acceptance on port 4173 passes with no console/page errors;
- the desktop and narrow captures were visually inspected.

Still open:

- external-player fun and silhouette-language evidence;
- representative mobile/low-power device performance;
- cold-cache production-host measurements;
- object-aware camera occlusion;
- final authored asset/model/audio fidelity;
- a public deployment.

See
[Marsh Skimmer 01 acceptance](../reviews/MARSH_SKIMMER_01_ACCEPTANCE_2026-07-25.md)
for the exact evidence and completion boundary.
