# ADR-0053: Top-Down Game Mode Architecture and Control Paradigms

- Date: 2026-08-09
- Status: **Proposed — operator sign-off required**
- Owner / next reviewer: project owner (Pranay)
- Affected runtime: `src/game/activities.ts`, `src/game/camera.ts`, `src/game/input.ts`, `src/game/hud.ts`, `src/game/renderer.ts`
- Related documents: [ADR-0008: Camera policies](ADR-0008-camera-policies-and-direct-view-selection.md), [ADR-0040: Open Vehicle Universe](ADR-0040-open-vehicle-universe-and-design-spine-hierarchy.md), [Game Design Spine](../design/GAME_DESIGN_SPINE.md), [Top-Down Exploration](../exploration/TOP_DOWN_GAME_MODE_EXPLORATION_2026-08-09.md)

## Context

The Rigs Unbound core thesis—*"Same vehicle, many games"*—establishes that a single persistent vehicle can participate across multiple genres and activity modes without losing identity or progress.

Currently, top-down perspective exists as a basic camera policy (`selectCamera('top-down')` per ADR-0008). However, turning top-down perspective into a distinct, high-quality **Game Mode** requires resolving:
1. **Control Paradigms**: Balancing realistic vehicle heading-relative steering against screen-relative arcade driving and twin-stick aiming.
2. **Presentation & Camera Angle**: Choosing between strict 90° overhead orthographic projection versus 75°-80° near-orthographic perspective with diorama depth.
3. **HUD & Perception Overlay**: Tactical fog-of-war, light cones, threat radars, and grid overlays.
4. **Activity State Binding**: Wiring top-down game modes into the existing spatial activity binding architecture (`src/game/activities.ts`).

## Decision Proposal

1. **Renderer Engine**: Retain Three.js as the single unified renderer per ADR-0001. Do not introduce a second 2D engine (Phaser/PixiJS). Top-down modes are rendered using Three.js with tailored high-angle perspective camera parameters.
2. **Camera Tuning**: Default to a **75° tilt angle, North-aligned overhead view** with smooth velocity-predictive target lead. This maintains vehicle silhouette visibility, suspension articulation, and ground depth while providing full tactical overhead visibility.
3. **Control Architecture**:
   - Provide an explicit option in `InputController` between **Heading-Relative** (Vehicle Tank Controls) and **Screen-Relative** (World Arcade Controls).
   - Support **Twin-Stick Aiming** (WASD move + Mouse/Right-stick direction) when directional tools (searchlights, winches, turrets) are active.
4. **Activity Declarations**:
   - Define top-down activity profiles (`top-down-defense`, `top-down-tactical`, `top-down-arcade`) under `src/game/activities.ts`.
   - Each activity declares camera bias, control scheme, verb reinterpretation (e.g. `plough` = barricading), and HUD overlay.

## Alternatives Considered

- **Menu-Based Game Mode Toggle**: Rejected per Game Design Spine. Game modes must be spatially or diegetically triggered (place-driven or contract-driven), not menu items that break immersion.
- **Pure 90° Flat Orthographic Camera**: Rejected because 90° vertical orientation hides vehicle height, wheel movement, and terrain elevation drops, making rigs look like flat 2D sprites.
- **Enforcing Screen-Relative Driving Only**: Rejected because experienced vehicle simulation players prefer tank/heading controls for towing and precision maneuvering.

## Risks & Trade-offs

- Screen-relative steering with physics momentum can cause rapid chassis spinning if not properly damped.
- Overhead lights and shadows require clean normal maps to prevent visual flattening; grazing lights must be audited per ADR-0041.

## Validation Plan

- Unit tests for activity binding state and control mode switching in `src/game/input.ts` and `src/game/activities.ts`.
- Browser acceptance test capturing live top-down game mode HUD, input response, and zero console/render errors.

## Update Log

- 2026-08-09: Proposed ADR drafted based on Top-Down Game Mode exploration.
