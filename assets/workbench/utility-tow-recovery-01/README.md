# Utility Tow Recovery 01 — Reconstruction Workbench

Status: `envelope-bound blockout refined` (2026-08-23) — authored factory is
dimension-bound to `rig-envelope.json` with a drift-guard test; runtime wiring
still pending. Full audit and task list:
[`docs/reviews/UTILITY_TOW_ASSET_AUDIT_2026-08-23.md`](../../../docs/reviews/UTILITY_TOW_ASSET_AUDIT_2026-08-23.md).

This directory is the repo-owned workbench for the first object-first asset
slice. It is intentionally separate from `assets/runtime/`: nothing here is a
runtime mesh or public-approved asset until the reconstruction, action
hierarchy, material, collision, browser, and provenance gates pass.

## Source

- [Object reference](../../generated/utility-tow-recovery-01-object-reference-2026-07-29.png)
- [Generation prompt and review note](../../generated/utility-tow-recovery-01-object-reference-2026-07-29.prompt.md)
- [Existing intake and functional verbs](../../../docs/research/UTILITY_TOW_RECONSTRUCTION_INTAKE_2026-07-28.md)

## Required reconstruction contract

The candidate must preserve these semantic systems as named, independently
addressable runtime nodes:

- `chassis`
- `cab`
- `recovery-boom` with `boom-pivot`
- `rear-winch` with cable path and `rear-winch` socket
- `front-tool-socket` and twin tow eyes
- four wheel pivots and simplified colliders
- `beacon` / emissive lamp
- left and right service drawers
- `cargo-platform`
- root-level `sculptRuntime` metadata for sockets, colliders, and destruction
  groups

The first generated model is a procedural candidate, not a gameplay authority.
Simulation collision and interaction semantics remain owned by the runtime
systems; the visual model must expose the metadata needed to attach to those
systems later.

## Pipeline evidence expected here

1. image probe and reference-admission result;
2. pre-spec assessment and quality contract;
3. detail inventory with every identity-defining mark mapped to the spec;
4. strict sculpt-spec validation;
5. locked pass status and generated Three.js factory;
6. named browser render(s), comparison sheet(s), and review history;
7. explicit decision: `continue`, `refine-spec`, `refine-code`,
   `request-input`, or `stop`.

Do not copy a generated factory into `src/game/` from this workbench without a
separate runtime integration review and explicit ownership clearance.

## Blocker found 2026-08-11: this rig has no `RIG_PROFILES` entry

A dimensional reconciliation of the three shipped rigs found that every one of
them was floating above the terrain by exactly its ride height, because
hand-authored geometry had drifted from the profile the simulation drives (full
detail in
[`docs/WORKLOG_ADDENDUM_2026-08-11.md`](../../../docs/WORKLOG_ADDENDUM_2026-08-11.md)).
That finding changes what "reconstruct a rig" is allowed to mean here.

`track`, `wheelbase`, `wheelRadius`, and `rideHeight` are **simulation inputs**:
they place the four points where the traversal model samples terrain, convert
distance travelled into wheel rotation, and set the height the kernel rests the
body at. Estimating them from a reference plate is structurally the same act as
hand-writing them as literals in the renderer — the drift that was just removed.
This is the difference between this workbench and `field-plough-01`: a plough is
`assetFamily: "rig-part"`, so its `confidence: 0.3` dimensions are honest and
harmless, because nothing in `physics.ts` reads them.

The binding that makes a rig reconstruction safe now exists —
`tools/rig-asset-envelope.ts` derives the envelope from `RIG_PROFILES`, and
`npm run assets:rig-envelope -- --check <spec>` refuses a spec that drifts off it
(documented in [`tools/README.md`](../../../tools/README.md)). But it needs a
profile to bind to, and there is no `utility-tow-recovery` in `RIG_IDS`
(`src/game/contracts.ts`): the shipped rigs are `utility-tractor`, `toy-buggy`,
and `marsh-skimmer`.

So promoting this plate to `assetFamily: "rig"` is blocked on a **design
decision, not an art gate**: adding a fourth playable rig means physics tuning,
garage/unlock placement, and save migration. That is the operator's call.

**The sequencing the repo already chose points elsewhere in the meantime.**
`docs/plans/MASTER_EXECUTION_TRACKER.md:2966`: *"once this module passes, the same
contract can be reused for the tow boom, winch, stabilizer, wheel, and beacon
modules before the full utility tow rig is attempted."* Those are `rig-part`
family — no dimensional contract with the kernel — and they are extractable from
this same plate, which shows the boom hinge, winch spool and cable, service
drawers, tow eyes, and beacon as clearly separated subassemblies. `winch` is
already a real game module (`SECOND_RUNG_RECOMMENDED_MODULE`,
`src/game/first-rung.ts:21`) with a live capability seam
(`requiredCapability: "tow"`), so a `winch` part has somewhere to land, whereas
a whole recovery truck currently does not.

Recommended order, therefore: parts from this plate first, full rig only after a
profile exists. Recorded here rather than only in the worklog because this
directory is where someone picks the work up.

## Blocker resolved 2026-08-23: the profile exists, and the factory is bound to it

`heavy-utility-tow-recovery-01` is now in `RIG_IDS` (`src/game/contracts.ts`)
with a full `RIG_PROFILES` entry (track 3.0, wheelbase 4.2, wheelRadius 0.85,
rideHeight 1.1). The 2026-08-11 blocker above is historical.

The dimensional binding it demanded now exists in this directory:

- `rig-envelope.json` — derived via
  `npx vite-node tools/derive-rig-asset-envelope.ts heavy-utility-tow-recovery-01 --out rig-envelope.json`
- `authored/createUtilityTowModel.ts` — rewritten against that envelope; the
  four simulated wheel nodes land exactly on the envelope contacts and carry
  `userData.simulationWheelIndex` 0–3; the two middle-axle wheels are visual
  6x6 identity only (`simulationWheelIndex: null`)
- `authored/createUtilityTowModel.test.ts` — drift guard: imports the envelope
  JSON and fails if wheel placement, tyre radius/width, ground contact, or root
  extents drift
- `review/` — browser review harness (`window.utilityTowReview`) plus
  before/after captures; capture tools live in
  `tools/capture-utility-tow-review.cjs` and `tools/capture-utility-tow-ingame.cjs`

Still pending before this becomes a runtime asset: wiring into `renderer.ts`
candidate dispatch (needs `src/game/` ownership clearance), the front/rear
marker fix at `renderer.ts:4465-4466`, pixel-level parity review against the
concept plates, and the GLB forge — see the audit doc's task list.
