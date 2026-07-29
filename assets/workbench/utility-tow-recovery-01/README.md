# Utility Tow Recovery 01 — Reconstruction Workbench

Status: `intake-pending`

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
