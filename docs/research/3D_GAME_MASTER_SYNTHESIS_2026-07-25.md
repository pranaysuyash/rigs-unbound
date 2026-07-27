# Rigs Unbound - 3D Game Master Synthesis (2026-07-25)

Date: 2026-07-25

Owner: Pranay

Scope: a compact repo-local handoff for the current 3D-game research stack,
covering what exists, what is possible, and the next durable sequence.

This synthesis is a summary artifact, not a replacement for the lane-specific
contracts and audits. The lane docs remain authoritative.

## 1) What exists now

The current repo already has the core architecture required for a long-lived
3D game platform:

- deterministic fixed-step kernel and ordered state mutation;
- data-driven rigs, capabilities, activities, and world anchors;
- clear simulation / presentation split;
- versioned save and migration path;
- procedural terrain and authored world substrate;
- lightweight custom physics and collision handling;
- explicit renderer and runtime observability;
- browser-facing runtime hooks and acceptance scripts;
- a growing contract lattice for assets, web runtime, simulation, replay,
  world growth, authority, and threshold evidence.

In plain terms: the project is already beyond a prototype. The missing work is
not "make a game engine from scratch"; it is "lock the contracts that keep the
current architecture coherent as breadth increases."

## 2) What is possible now

The current shape supports the following expansions without a rewrite:

### Capability growth

- add new locomotion families through adapter-backed profiles;
- formalize capability definitions and affordance matching;
- grow from vehicle identity into machine identity where appropriate.

### Presentation growth

- add visibility buckets and LOD discipline;
- tighten camera-feel contracts for speed, obstruction, and motion safety;
- add minimal shader/material layers only where readability or identity needs
  them;
- keep accessibility and reduced-motion behavior first-class.

### World growth

- add chunk or residency manifests before world scale exceeds the current
  bounded model;
- add modding / creator-pack validation before public extension becomes a
  second mutable truth source;
- add authority validation and replay/event separation before shared-state
  claims are introduced.

### Evidence growth

- add deterministic capture bundles for threshold work;
- keep runtime KPIs and readability rubrics aligned with actual fixtures;
- treat asset provenance and runtime manifests as product data, not support
  docs.

## 3) What should happen next

The best near-term path is a sequence, not a rewrite:

1. **Protect the kernel and split**
   - keep simulation authoritative and renderer presentational.
2. **Harden visibility and readability**
   - culling, LOD, camera feel, and threshold captures.
3. **Formalize replay and verification**
   - bounded run records, checksums, and verifier hooks.
4. **Lock world-growth governance**
   - streaming manifests, content packs, and safe rollback behavior.
5. **Introduce authority only when needed**
   - command validation and acceptance boundaries before any shared-state mode.

That sequence keeps the project moving toward a broader platform without
turning the engine into a speculative rewrite.

## 4) What not to do yet

Avoid these premature moves:

- replacing the current runtime stack before the current contracts are proven;
- WebGPU-only posture without a measured device-matrix reason;
- full ECS migration before actor volume and composition pressure justify it;
- multiplayer authority claims before command validation and replay exist;
- open UGC or public pack publishing without provenance and rollback rules;
- broad shader or engine overhauls that do not improve the actual player loop.

## 5) Durable decision frame

The project is best understood as:

`machine identity + world schema + simulation systems + presentation systems + governance + evidence`

That frame keeps the work aligned across the lanes that are already documented:

- assets and provenance;
- web loading and browser runtime;
- simulation, replay, and verification;
- world growth and authority;
- spatial rendering and readability.

## 6) Current proof obligations

These remain the most useful concrete proofs for future implementation work:

- frustum / distance / LOD visibility stage in the renderer flow;
- a canonical replay artifact that reuses the deterministic kernel;
- one world-chunk manifest and residency lifecycle test;
- one pack manifest validator with rollback/disable behavior;
- one capability / affordance compatibility proof slice;
- one budget envelope with clear degraded and fail-soft modes.

## 7) Where to go next in the repo

- [3D Game Contract Index](./3D_GAME_CONTRACT_INDEX_2026-07-25.md)
- [3D Game Platform Long-Term Audit](./3D_GAME_PLATFORM_LONG_TERM_AUDIT_2026-07-25.md)
- [3D Game Optimization Gaps + Long-Term Expansion Synthesis](./3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md)
- [3D Game Optimization Gaps - Full Continuation Audit](./3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md)
- [3D Game Optimization and More - Execution Roadmap](./3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [Additional ChatGPT Research Ingestion](./ADDITIONAL_CHATGPT_RESEARCH_INGESTION_2026-07-25.md)

## Anything else?

The most valuable thing this repo already has is not a single feature; it is a
clear architecture path with growing evidence. The right next move is to keep
turning that path into durable contracts and verified proofs.

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this synthesis. This document still owns the
research map and durable decision frame; the new note carries the wider
machine-keeper thesis and long-range product direction.
