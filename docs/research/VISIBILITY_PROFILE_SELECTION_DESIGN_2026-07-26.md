# Visibility Profile Selection Design (2026-07-26)

**Date:** 2026-07-26
**Status:** Design proposal — not yet implemented
**Evidence tier:** Tier 1 static source inspection plus design reasoning

## Purpose

Define device-profile tiers with measurable thresholds, and expose fallback reasons to players in plain language. This turns the current "standard vs mobile-safe" binary into a richer, honest, player-facing quality story.

## Current state

### What exists today

| Layer | Implementation | Gap |
|-------|---------------|-----|
| Visibility profiles | `full`, `standard`, `mobile-safe` with near/mid/far distance bands | No device-detection tier; no player-facing reason text |
| Runtime profile policy | `selectRuntimeProfile()` checks average/p95 frame time against budget | Binary decision; no graduated quality tiers |
| Fallback activation | `RuntimeProfileController` tracks fallback/recovery with 180-frame hysteresis | Player sees only "reduced scenery detail"; no reason why |
| Developer diagnostics | fps, draw calls, heap, geometry/texture counts, profile summary | Hidden from players; no public surface |
| Recovery | 180-frame healthy window, then restore to standard | No player notification of recovery |

### What's missing

1. **Device-profile tiers**: No system to classify a device into a quality tier before runtime pressure appears
2. **Player-facing reason text**: The current message "Performance safeguard active: reduced scenery detail." doesn't explain *why*
3. **Loading progress meter**: No startup progress indicator beyond the welcome panel
4. **Profile chooser**: No player-facing way to select or override the auto-detected tier
5. **Cross-system resource governance**: Visibility fallback exists; simulation/audio/persistence fallbacks don't

## Design proposal

### 1. Device-profile tiers

Two player-facing tiers plus one operator-only benchmark tier:

| Tier | Prop Radius | Frustum Cull | Representation | Instance Cap | Who selects it |
|------|------------|--------------|----------------|--------------|----------------|
| **balanced** (standard) | 168m | Yes | Full geometry, near/mid/far classification | Unlimited | Default; auto-selected at startup |
| **conservative** (mobile-safe) | 132m | Yes | Reduced near distance, fewer instances | 600 instances | Auto-selected after 90 frame samples show budget breach |
| ~~full~~ (benchmark-only) | 168m | Yes | Full geometry, all instances | Unlimited | Operator-only; never auto-selected, never player-facing |

**Detection strategy**: Do NOT infer from user-agent. Instead:
- Start at `balanced` (the acceptance baseline)
- After 90 frame samples, if average frame time > 25ms or p95 frame time > 33.4ms, fall back to `conservative`
- Recovery after 180 healthy frames (~3 seconds at 60fps)
- `full` remains operator-only for benchmarking; it never appears in the player-facing tier list

**Why not detect from hardware?** Because browser memory APIs are inconsistent, user-agent strings lie, and the same device can perform differently based on browser tabs, thermal state, and battery level. Measured performance is the only honest signal.

### 2. Graduated visual consequences

Each tier should have distinct, measurable visual differences:

| Tier | Near Distance | Mid Distance | Far Distance | Instance Cap |
|------|--------------|--------------|--------------|--------------|
| balanced | 64m | 120m | 168m | Unlimited |
| conservative | 48m | 96m | 132m | 600 instances |

**What changes for the player:**
- **balanced**: Full visual range. Props rendered up to 168m. This is the acceptance baseline that most devices will use.
- **conservative**: Noticeably sparser scenery. Props disappear at 132m instead of 168m. Near distance shrinks from 64m to 48m. Instance count capped at 600. Terrain feels more open. Frame rate improves.

**What does NOT change:**
- Simulation frequency (physics, collision, terrain deformation)
- Camera behavior (all six policies still work)
- Input responsiveness (same semantic actions)
- Save/load behavior (same persistence)
- Audio (same layered mechanical voice)

### 3. Player-facing fallback reasons

Replace the opaque "Performance safeguard active: reduced scenery detail." with honest, plain-language reasons:

| Fallback Reason Code | Player Message | Operator Message |
|---------------------|---------------|-----------------|
| `average-frame-budget` | "Your device is working hard to render the world. We've simplified the scenery to keep things smooth." | `average-frame-budget: avg {X}ms > {budget}ms` |
| `p95-frame-budget` | "Some moments are heavier than usual. We've simplified the scenery to prevent stuttering." | `p95-frame-budget: p95 {X}ms > {budget}ms` |
| `insufficient-frame-samples` | "Still measuring your device performance. Scenery will adjust automatically." | `awaiting-evidence: {count}/{min} samples` |
| `recovery-window` | "Performance has improved. Scenery will restore in a few seconds." | `recovery: {count}/180 healthy frames` |

**Recovery message**: "Performance recovered. Scenery detail restored." (shown after the 180-frame hysteresis window completes, approximately 3 seconds at 60fps)

**Why this works:**
- Player learns *what* changed (scenery) and *why* (device performance)
- No technical jargon (no "frame time", "p95", "budget")
- Honest about the tradeoff (simpler scenery for smoother play)
- Operator retains full technical detail in diagnostics

### 4. Loading progress surface

The current bootstrap uses `bootstrapStatus` in the welcome panel and `saveStatus` for persistence state. This design augments those existing elements rather than replacing them:

| State | Player Sees (bootstrapStatus) | What Happens |
|-------|------------------------------|--------------|
| Initial | "Loading field data..." | Scene warming up (replaces empty welcome panel) |
| Measuring | "Measuring device performance..." | Frame samples collecting after scene ready |
| Ready | "Field systems ready." | Profile selected, world entered (existing behavior) |
| Fallback | "Performance safeguard active: reduced scenery detail." | Conservative profile activated (existing behavior) |
| Recovery | "Performance recovered. Scenery detail restored." | Standard profile restored |

**Integration with existing shell**: The `bootstrapStatus` element already exists in `index.html` and is updated by `src/main.ts`. This design adds the "Measuring" state between "Loading" and "Ready" without changing the existing shell structure. The `saveStatus` element continues to show persistence state independently.

**What we will NOT do:**
- Fake progress bars (the contract forbids this)
- Show percentage numbers (we can't accurately predict load time)
- Block interaction behind a splash screen

### 5. Evidence requirements before these tiers become public claims

| Claim | Evidence Needed | Current Status |
|-------|----------------|----------------|
| "Smooth on most devices" | Representative-device benchmark across 3+ device classes | Missing |
| "Automatic quality adjustment" | Browser capture showing profile switch before overload | Partial (policy exists, no representative capture) |
| "No visual glitches during fallback" | Before/after screenshots at desktop + narrow mobile | Missing |
| "Recovery is imperceptible" | Side-by-side comparison of standard vs restored standard | Missing |
| "Scenery scales honestly" | Measured prop count reduction at each tier | Missing |

## Implementation path

### Phase 1: Named tiers with measured thresholds
- Define the three tiers with explicit distance bands
- Wire tier selection through the existing `RuntimeProfileController`
- Add player-facing reason text for each fallback code
- Test: verify fallback activates before overload in a controlled scenario

### Phase 2: Loading progress surface
- Add a textual progress indicator to the bootstrap shell
- Wire it to actual load events (scene ready, first controllable, input ready)
- Test: verify progress text updates during startup

### Phase 3: Representative-device evidence
- Capture performance snapshots across 3+ device classes
- Prove each tier produces distinct, measurable visual differences
- Prove fallback and recovery are imperceptible to players
- Test: before/after screenshots at each tier

### Phase 4: Player-facing profile chooser (future)
- Only after representative-device evidence exists
- Allow players to override auto-detection with a named quality preset ("balanced" / "conservative")
- Preserve the "auto" default; manual selection is opt-in
- If a player manually selects "conservative" but performance is fine, the system still monitors but does not force an upgrade
- If a player manually selects "balanced" but performance is poor, the system shows a warning and may force fallback after a second measurement window
- Manual override resets the measurement window so the system re-evaluates from scratch

## Anything else?

The most important design decision is that **device detection is measured, not inferred**. This project should never guess a device class from user-agent strings or hardware hints. The only honest signal is how the device actually performs during the first 90 frames. This keeps the system truthful and avoids the common game-dev trap of assuming "mobile = slow" or "desktop = fast."

The second important decision is that **fallback reasons are plain language for players, technical for operators**. The player message explains what changed and why in terms they understand. The operator message retains the exact budget breach for debugging. This keeps the public surface honest without hiding information from developers.

The third important decision is that **simulation is never affected by visibility fallback**. Physics, collision, terrain deformation, save/load, and input responsiveness remain identical across all tiers. This preserves the game's core promise: the world behaves consistently regardless of visual quality.

## Addendum (2026-07-27) - the runtime profile policy had already moved past the binary seed at the time

- Re-checked the renderer performance flow against the profile-selection design.
- At the time of the addendum, the live renderer path already implemented
  graduated quality tiers and auto-degrade behavior:
  - quality tiers exist in the renderer/performance flow,
  - GPU memory is tracked in the performance snapshot,
  - frustum culling is on for instanced meshes,
  - and the renderer can reduce quality without changing simulation truth.
- That meant the old “binary decision; no graduated quality tiers” row was
  stale as a repo-state description.
- The remaining open parts of this design are therefore the player-facing
  policy surface, not the tier machinery itself:
  - plain-language fallback reasons,
  - visible active-profile state,
  - and the loading/progress surface that tells the player what the runtime is
    measuring.
- Evidence depth: Tier 1 static inspection of the design note against the live
  renderer-performance documentation trail. No runtime/browser pass was run in
  this update.
