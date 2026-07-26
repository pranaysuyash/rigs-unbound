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

## Addendum (2026-07-26): rig sockets and canonical scene obstruction

### Decision

The shared camera-policy vocabulary remains canonical, but a rig now owns only
its physical hood/cockpit socket. The renderer resolves chase and side views
through one solver-independent scene query that composes:

- authored structures from typed world data shared with rendering;
- procedural standing obstacles from the canonical obstacle field;
- felled-tree state from world memory;
- terrain from the canonical terrain field.

Camera resolution uses immediate inward avoidance, slower outward recovery, a
near-plane safety margin, and a second query after smoothing. Large teleports or
camera-mode changes cut to a safe pose instead of interpolating through the rig.
Tactical, top-down, and survey retain terrain-only resolution because a full
local-prop query does not improve their high framing enough to justify its cost.

### Why this path

Three.js meshes and any later physics solver are presentation/implementation
details, not gameplay truth. A shared typed query preserves the same camera
semantics across the deterministic kernel, Box3D/Rapier experiments, later GLB
assets, tests, and operator evidence. Per-rig sockets keep silhouette knowledge
with the rig without duplicating camera policy.

### Options considered

- Raycast renderer meshes: rejected because it would make camera behavior depend
  on render LOD, asset loading, and Three.js scene state.
- Terrain-only pull-in: superseded because authored Home structures and standing
  trees demonstrably obscure the player.
- Per-rig camera implementations: rejected because they would fork policy and
  make new locomotion families harder to validate.

### Risks, validation, and revisit triggers

The authored proxy bounds are intentionally conservative and must be updated
when structure assets materially change. Future GLBs should map named nodes to
the existing socket records rather than create a second camera truth source.
Revisit query acceleration when measured prop-query cost exceeds the frame
budget, or when transparent/non-solid structures require semantic occluder
metadata beyond the current typed bounds.

Validation is Tier 2 through focused camera/query tests and Tier 4 through
browser acceptance on the live Field 02 surface: the nearest authored Home
structure (`home-barn-roof` at the canonical v6 berth) resolves clear, a real
standing procedural tree pulls the boom inward, felling the same tree restores
it, and all three hood sockets report clear non-intersecting poses. The
acceptance mutation hooks are guarded by
`?acceptance=field-02`; they are not exposed through player controls.

## Addendum (2026-07-26): signed rear-side and rig-clearance invariants

### Decision

Chase-camera correctness now includes a signed spatial invariant. The renderer
reports the camera displacement projected onto the active rig's forward vector
as `forwardOffset`; a chase camera is on the rear side only when that value is
negative. Distance from the focus point is no longer accepted as proof of
correct side.

After endpoint obstruction resolution and smoothing, the final camera pose must
also remain outside a profile-scaled clearance envelope around the active rig.
If an obstruction leaves less room than that envelope, the shared camera policy
tries clear elevated rear-shoulder candidates before rendering. This is a
policy-level rule shared by rigs, not a tractor or Launch Ridge exception.

Hood view remains intentionally forward-facing and may report a positive
`forwardOffset`; the rear-side invariant applies to chase acceptance.

### Evidence and revisit trigger

Browser acceptance now proves rear-side, path-clear, and non-intersecting chase
poses at the obstructed Home berth and after a Launch Ridge rocket overlap. It
also proves visual front markers remain forward for Torque, Spark, and Drift.
Revisit the clearance representation when a real articulated or unusually long
rig demonstrates that the current profile-scaled envelope is insufficient.

### Update log

- 2026-07-26: Added signed camera-side observability, rear-side browser
  assertions, and final rig-clearance fallback.
