# ADR-0006: Rig profiles, capabilities, and contrasting evidence

- Status: **Accepted product principle; implemented contrasting evidence**
- Date: 2026-07-25
- Decision owner: project owner
- Implementation owner: current project agent
- Next reviewer: project owner after Rig Lab 01 browser evidence

## Context

Field Test 001 proved that a controllable vehicle, renderer-independent fixed-step state, local persistence, world memory, and browser delivery can work together. It did not prove the product architecture is portable. Its single `vehicle` state, tractor movement constants, `ploughLowered` field, and tractor-only renderer can silently turn a disposable scenario into the product model.

The project owner accepted a broader hierarchy:

> Rigs Unbound is a vehicle-driven universe spanning many vehicle types, worlds, scales, perspectives and mechanics.

A tractor is one content instance. It has no privileged architectural status. The first portability evidence should use contrasting rigs and an adjacent capability rather than deepen one farming domain.

## Decision

Replace the tractor-shaped gameplay contract with one canonical rig system:

- persistent `RigState` instances identified independently of renderer nodes;
- versioned `RigProfile` data for mobility, mass, handling, camera, and capability parameters;
- semantic input actions consumed by the active rig;
- capability and attachment queries used by world interactions;
- camera policies driven by rig profile and current state;
- activities composed from capabilities rather than rig names;
- one save containing every rig, shared world memory, activity state, and schema migration evidence.

**Rig Lab 01: Mobility and Capability Translation** uses:

- a utility tractor emphasizing torque, low-speed control, ploughing, and stable towing;
- a toy buggy emphasizing acceleration, responsive turning, speed, and jump response;
- a shared towing capability;
- a short cargo-relay activity that starts by attaching cargo and completes at a delivery gate;
- a compact ramp that produces different airborne behavior through profile data;
- measured startup, frame, renderer, heap-when-available, and save/load evidence.

The activity must ask whether the active rig has the required capability. It must not branch on `"utility-tractor"` or `"toy-buggy"`.

## Portability contract

Every foundational system is reviewed against:

> Can this support a bicycle, toy car, tractor and spacecraft through configuration or bounded adapters, without rewriting the product architecture?

This is a design test, not a demand for one universal physics controller. Mobility profiles may share the current ground-controller adapter. Future flight, water, tracked, or articulated rigs may use bounded controllers behind the same semantic action and persistent identity contracts.

## Options considered

1. Add more tractor activities before changing the state shape.
   - Rejected because it reinforces farming assumptions without testing reuse.
2. Add a separate `BuggyController` and separate save/runtime path.
   - Rejected because it creates parallel product truth and prevents honest portability evidence.
3. Generalize every possible vehicle category now.
   - Rejected because bicycle, aircraft, boat, and spacecraft behavior has not produced concrete controller requirements.
4. Introduce two real ground rigs, one shared capability, and bounded profile-driven differences.
   - Accepted because it creates contrasting evidence without pretending all mobility families are already solved.

## Save migration

The save schema advances from v1 to v2. A valid v1 tractor record migrates into the utility tractor entry while a fresh toy buggy entry and cargo-relay state are added. Invalid data still fails closed to a clean state with a visible diagnostic. No renderer object or DOM state enters the save.

## Risks and mitigations

- **False variety:** two meshes with identical feel.
  - Mitigation: profile-level acceleration, speed, steering, grip response, wheel radius, jump impulse, mass, and tow penalty are exercised in tests and browser play.
- **Universal-controller overreach:** future flight or water behavior forced into ground assumptions.
  - Mitigation: the current controller is explicitly `ground`; future locomotion families use bounded adapters.
- **Capability theater:** UI says “tow” without a complete state transition.
  - Mitigation: attach, transport, detach/deliver, save, restore, reset, and visible activity feedback form one testable workflow.
- **Save loss:** schema change discards the existing field record.
  - Mitigation: deterministic v1-to-v2 migration and recovery tests.
- **Prototype telemetry presented as production performance.**
  - Mitigation: label measurements local/browser-specific and retain raw runtime metrics beside any interpretation.

## Validation plan

- Tier 2: profile contrast, rig switching, capability queries, towing workflow, ramp response, v1 migration, invalid-save recovery, and deterministic stepping tests.
- Tier 3: browser workflow covering both rigs, cargo attach and delivery, reload persistence, and runtime metrics export.
- Tier 4: visible desktop and narrow-screen play, screenshot inspection, and console/page-error review.
- Production/public performance remains unverified.

## Rollback and revisit

The v2 schema may migrate again; it must not be silently rewritten in place. A future mobility family may add a bounded controller without changing rig identity, actions, activity contracts, or world capability queries. Revisit the current ground-controller profile fields if two real ground rigs cannot remain distinct without rig-name branching.

## Update log

- 2026-07-25: Accepted after the project owner supplied the broad vehicle-universe hierarchy, portability test, and adjacent-capability sequence and asked implementation to continue.
- 2026-07-26: Provenance scope corrected. The operator directly established
  the broad vehicle-universe and no-tractor-privilege principle. The exact
  buggy/towing/ramp fixture was supplied through ChatGPT background and selected
  as an implementation hypothesis; its runtime evidence does not make that
  fixture a permanent product mandate. Effective status is indexed in
  [the decision register](README.md).

## Anything else?

The tractor artwork and furrow mechanic remain useful scenario evidence, but neither is the repository center. Rig Lab 01 is successful only if the buggy is fun for different reasons, the tractor retains its own character, and the shared cargo activity proves reuse without erasing those differences.
