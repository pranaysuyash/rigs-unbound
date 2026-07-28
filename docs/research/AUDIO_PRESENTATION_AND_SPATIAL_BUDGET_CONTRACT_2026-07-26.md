# Audio Presentation and Spatial Budget Contract

**Date:** 2026-07-26  
**Status:** Current single-rig procedural audio documented; multi-source spatial audio staged  
**Skill applied:** `/Users/pranay/Projects/skills/game-development/game-audio/SKILL.md`  
**Evidence tier:** Tier 1 - static source and architecture inspection. No test, build, browser, or audio-device command was run in this pass.

## Decision

Audio is a presentation consumer of authoritative state and events. It must never choose, validate, or mutate gameplay state.

The current procedural active-rig voice remains local, immediate, and independent of listener-distance selection. Future world sound enters only through a categorized source contract with explicit priority, distance behavior, concurrency policy, and fallback order.

## What exists now

`src/game/audio.ts` provides one `RigAudio` presentation owner:

| Capability              | Current behavior                                                          | Boundary                                                   |
| ----------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Active-rig engine voice | Two oscillators, load/filter response, per-rig voice profiles             | Reads `RigState` and `EffectiveRig`; does not mutate them. |
| Surface/traction voice  | Looping deterministic noise filtered by surface, speed, slip, and contact | Telemetry-driven feedback, not a simulation input.         |
| Impact                  | Disposable filtered-noise one-shot                                        | Rare presentation event; non-fatal if unavailable.         |
| Confirmation            | Short synthesized chirp                                                   | UI/action acknowledgement only.                            |
| Browser activation      | `AudioContext` unlock from a user gesture; failure is a safe no-op        | Autoplay policy cannot break boot or simulation.           |
| Accessibility           | Mute is safe because audio is not the only channel for mechanics          | No mechanic may be audio-exclusive.                        |

There is no active music system, ambient-zone system, dialogue/voice system, `PannerNode` source graph, listener-relative world-source scheduler, or imported audio asset runtime path. That is accurate current scope, not a gap to hide with mock infrastructure.

## Current category posture

| Category                | Current state    | Required behavior if expanded                                                            |
| ----------------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| Player machine feedback | Active and local | Highest gameplay-audio priority; preserve before ambience.                               |
| UI feedback             | Active and local | Immediate and non-spatial; never the sole accessibility channel.                         |
| World SFX               | Not active       | Must be event-driven and source-budgeted.                                                |
| Ambient zones           | Not active       | Must be optional and first to shed under pressure.                                       |
| Music                   | Not active       | Must declare state ownership, transition policy, and ducking rules before assets arrive. |
| Dialogue/announcer      | Not active       | Must declare accessibility text/transcript support and a ducking policy before use.      |

## Future `WorldAudioSource` admission contract

No world object should directly create a browser audio node. A future source definition must be validated before activation and contain at least:

```ts
type WorldAudioSource = {
  id: string;
  category: "world-sfx" | "ambient" | "voice" | "music";
  priority: "critical" | "important" | "atmospheric";
  position?: { x: number; y: number; z: number };
  distancePolicy?: "local" | "positional" | "zone";
  maxDistance?: number;
  state: "requested" | "active" | "culled" | "failed" | "stopped";
  sourceDefinitionVersion: number;
};
```

This is a future schema sketch, not an active runtime type. Its purpose is to preserve ownership and validation requirements before a second audio use case arrives.

### Selection and degradation order

When multiple future sources compete, the presentation scheduler must make a deterministic, observable decision using category/priority and listener distance. The default shedding order is:

1. Atmospheric ambience and optional environmental tails.
2. Distant non-critical world effects.
3. Expensive spatial/reverb processing on retained non-critical sources.
4. Optional music layers.

It must not shed the active machine’s core feedback or critical accessibility-equivalent UI confirmation merely because a distant ambient source exists. Any occlusion, raycast, low-pass, or distance result is a presentation hint; it cannot change collision, detection, objectives, or simulation authority.

## Resource and observability requirements

Before world audio is implemented, define and expose:

- concurrent-source ceiling by category;
- start/stop/cull/failure counts;
- active source count and selected/cull reason;
- source asset/decode cost when imported audio exists;
- listener-relative distance tier;
- autoplay/unlock status;
- mute and reduced-sensory preference state;
- duplicate-event suppression or cooldown behavior for bursty impact/interaction streams.

The current `PerformanceMonitor` does not claim an audio-memory budget, and renderer allocation counts must not be reused as an audio budget. Browser/device measurement is required before choosing numeric source caps or asset-memory targets.

## Asset and content boundary

Procedural audio currently avoids external-audio provenance and download obligations. When a real asset is introduced, it must enter through the existing asset/provenance process with source rights, format/derivative information, intended category, duration/loop semantics, decode/loading policy, and fallback behavior. No raw downloaded audio URL may become an implicit runtime dependency.

## Activation proof sequence

1. Preserve the current local active-rig audio as baseline.
2. Add one non-critical positional source, with no gameplay dependency and a visible alternate cue.
3. Prove listener rotation, distance tiers, source stop/disposal, mute behavior, and autoplay recovery in a browser.
4. Add source-count telemetry and a measured fallback that culls the non-critical source first.
5. Only then consider ambient zones, music layers, dialogue ducking, or acoustic occlusion.

## Non-goals

- No full audio mixer, music director, or generic sound-bank framework now.
- No numeric audio memory target without browser/device evidence.
- No spatialized player engine that can become inaudible while driving.
- No use of audio as an authoritative combat, navigation, or interaction channel.
- No imported audio asset bypassing provenance and browser-ingest validation.

## Closure trigger

Revisit this contract when the game gains a second real audio producer: a world machine, hazard, objective beacon, ambient zone, or dialogue source. That use case must supply the measured browser proof and source lifecycle needed to turn this contract into runtime code.

## Anything else?

Yes: imported audio introduces both decode/resource behavior and provenance obligations. Neither may be hidden inside a presentation feature. No current sound path was found that makes audio authoritative gameplay input.

## Addendum (2026-07-26) - mute is functional, but the preference is not yet persisted

- Re-checked `src/main.ts` and `src/game/audio.ts` against the mute control.
- The player-facing mute toggle already works in-session:
  - the button toggles audio enablement,
  - the label and `aria-pressed` state update immediately,
  - `RigAudio` treats mute as a safe no-op instead of a failure.
- The remaining gap is preference persistence:
  - no local preference key is visible in the current source,
  - the reload path does not currently restore mute from durable storage,
  - the setting is therefore a comfort control, not yet a remembered player preference.
- So the audio contract is still missing one small but important trust feature:
  mute survives the session only, not the browser restart.
- Evidence tier: Tier 1 static source inspection. No browser or reload walkthrough was run in this pass.

## Addendum (2026-07-26) - audio presentation supports episode grammar, but it does not own it

- The current audio posture already does useful supporting work for the game:
  it makes machine state, traction, impact, and UI acknowledgement readable
  through sound.
- That makes audio a support layer for the episode grammar, because episodes
  only stay fully legible when pressure, consequence, and machine identity can
  be heard as well as seen.
- The layering stays explicit:
  - episode grammar names the lived moment,
  - audio presentation reinforces that moment with feedback and spatial
    budget policy,
  - the audio layer remains a consumer of authoritative state rather than a
    gameplay owner.
- This note intentionally keeps audio out of authority or story ownership; it
  only preserves the dependency so future episode work can rely on the current
  feedback surface.

## Addendum (2026-07-26) - rig signature needs a listener-owned consumer before it becomes more than a fixture

- Re-checked the current runtime against the audio contract and the new
  deterministic rig-emission source.
- `src/game/signature.ts` now derives bounded acoustic, illumination, and
  thermal-proxy channels from rig state without mutating the rig.
- That makes the signature source a real presentation fixture, but not yet a
  complete audio contract:
  - there is still no listener-owned source scheduler,
  - no accessible player-facing consumer of the signature output,
  - no browser proof that the signature improves comprehension rather than just
    existing as a code-level signal.
- The next proof should connect the source to one readable player-facing cue
  before any broader audio scheduler is generalized.
- Evidence depth: Tier 1 static source inspection.

## Addendum (2026-07-26) - bursty event suppression is still only a contract seed

- Re-checked `src/game/audio.ts` against the bursty-event lane.
- The current audio implementation has discrete one-shot paths:
  - `impact()` builds a disposable burst per hit,
  - `chirp()` provides a short acknowledgement cue,
  - the procedural machine voice is continuously updated rather than queued.
- What is still missing is an explicit duplicate-event suppression or cooldown
  contract for rapid impact / interaction streams:
  - no named suppression window,
  - no event-level coalescing rule,
  - no browser proof that repeated bursts stay readable rather than stacking
    into noise.
- That means the contract line already exists in prose, but the runtime owner
  for burst gating is still unresolved.
- The next proof should name one suppression/cooldown rule before any second
  bursty audio source arrives.
- Evidence depth: Tier 1 static source inspection.
