# ADR-0053: Top-Down Game Mode Architecture, Multi-Engine Adapters, and Control Paradigms

- Date: 2026-08-09 (Updated: 2026-08-12)
- Status: **Accepted** (Operator sign-off received 2026-08-13)
- Owner / next reviewer: project owner (Pranay)
- Affected runtime: `src/game/activities.ts`, `src/game/camera.ts`, `src/game/input.ts`, `src/game/hud.ts`, `src/game/renderer.ts`
- Related documents: [ADR-0001: Headless Kernel & Engine Bakeoff](ADR-0001-headless-gameplay-kernel-and-engine-bakeoff.md), [ADR-0008: Camera policies](ADR-0008-camera-policies-and-direct-view-selection.md), [Game Design Spine](../design/GAME_DESIGN_SPINE.md), [Top-Down Exploration](../exploration/TOP_DOWN_GAME_MODE_EXPLORATION_2026-08-09.md)

## Context

The Rigs Unbound core thesis—*"Same vehicle, many games"*—establishes that a single persistent vehicle can participate across multiple genres and activity modes without losing identity or progress.

Per operator direction (2026-08-12), architectural constraints must never restrict gameplay quality or design possibilities. We remove self-imposed limitations against 2D engines (Phaser, PixiJS, Canvas2D) and implement a **flexible multi-engine renderer adapter architecture**. If a 2D engine or hybrid 2D/3D presentation delivers a superior top-down experience, micro-RTS tactical view, fog-of-war effect, or retro arcade mode, the gameplay kernel will support it directly.

## Decision Proposal

1. **Renderer Engine Architecture**:
   - The gameplay kernel (`src/game/state.ts`) remains 100% headless and renderer-agnostic.
   - Support a **Unified Renderer Adapter Contract**:
     - **Three.js 3D Adapter**: High-angle 75° Diorama perspective or 90° overhead.
     - **PixiJS 2D Overlay Adapter**: High-performance 2D vector HUD, dynamic fog-of-war pixel masks, and micro-RTS tactical overlays layered over 3D scenes.
     - **Phaser / PixiJS 2D Engine Adapter**: Dedicated 2D sprite engine for retro arcade top-down modes and minigames.
2. **Control Paradigm Suite**: `InputController` exposes three player-selectable control schemes:
   - **Vehicle-Centric (Tank / Heading-Relative)**
   - **Screen-Relative (World-Directional Arcade)**
   - **Twin-Stick (WASD Move + Pointer/Right-stick Aim)**
   - Players can toggle control schemes in the HUD or via hotkey.
3. **All 4 Top-Down Activity Archetypes Supported**:
   - `top-down-defense` (Zombie/Horde Night Defense with barricading and twin-stick aiming).
   - `top-down-tactical` (Heavy construction, precision dredging, and micro-RTS logistics).
   - `top-down-stealth` (Nocturnal stealth, fog-of-war, and signal recon).
   - `top-down-arcade` (High-speed retro circuit drift and demolition evasion).

## Validation Plan

- Unit tests verifying that the headless gameplay kernel operates identically regardless of attached renderer adapter (Three.js, PixiJS, or Phaser).
- Browser acceptance test capturing smooth engine, view, and control switching on port `4173`.

## Update Log

- 2026-08-09: Initial ADR proposal drafted.
- 2026-08-12: Updated to reflect Operator Direction: Removed self-imposed 2D engine restrictions; added PixiJS/Phaser adapter support and full multi-mode/multi-control suite.
