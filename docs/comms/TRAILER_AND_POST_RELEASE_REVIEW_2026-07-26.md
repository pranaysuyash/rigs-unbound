# Trailer and Build-in-Public Release Review

**Date:** 2026-07-26  
**Scope:** Review of the current trailer recordings and the Claude-prepared public announcement copy.  
**Decision:** Copy can be posted after the owner chooses the media treatment; the current best default candidate is `trailer-final.mp4` with sound, while the silent `trailer.mp4` remains the fallback if a no-audio post is preferred.

## Evidence inspected

| Artifact | Observation |
|---|---|
| [`trailer.mp4`](./assets/trailer.mp4) | 37.4 seconds, 1280x720 H.264, 30fps, one video stream, no audio stream, approximately 3.7MB. |
| [`trailer-cut1-noplough.mp4`](./assets/trailer-cut1-noplough.mp4) | 37.4 seconds, 1280x720 H.264, approximately 5.1MB. It is also tractor-focused and removes the plough emphasis. |
| [`trailer.gif`](./assets/trailer.gif) | 7 seconds, 640x360 GIF, approximately 5.1MB. Suitable for lightweight preview use, not the preferred X attachment. |
| [`trailer-poster.jpg`](./assets/trailer-poster.jpg) | Strongest single frame: tractor, water, farm landmark, terrain, objective panel, and HUD are all legible. |
| [`POST_TODAY_2026-07-26.md`](./POST_TODAY_2026-07-26.md) | Strong honest positioning and thread structure. It correctly flags the silent video and weak furrow beat. |
| [`BUILD_IN_PUBLIC_KIT_2026-07-25.md`](./BUILD_IN_PUBLIC_KIT_2026-07-25.md) | Broader historical story bank. The mistake stories are strong but should remain later posts, not the first trailer announcement. |
| [`trailer-review/trailer-detail-sheet.jpg`](./assets/trailer-review/trailer-detail-sheet.jpg) | Review contact sheet generated from the current main trailer. |
| [`trailer-review/trailer-cut1-contact-sheet.jpg`](./assets/trailer-review/trailer-cut1-contact-sheet.jpg) | Review contact sheet generated from the no-plough cut. |

The live URL returned HTTP 200 during this review. That is a reachability check only, not proof of current mobile runtime quality, fun, or launch readiness.

## What the main trailer actually communicates

The shot sequence is coherent and legible:

1. Title card: “The Ground Decides.”
2. Tractor positioned in the authored field beside water and landmarks.
3. Objective and salvage UI, close traversal, map view, terrain-edge movement, and a darker/night section.
4. A recognizable machine-in-place fantasy: the player is operating a rig inside a living field rather than looking at a static model.

The main limitations are equally clear:

- The video is silent. The post’s recommendation to add a music bed remains open.
- The trailer does not show the buggy, so the tractor-versus-buggy comparison belongs in text or a later comparison clip, not as an implied trailer proof.
- The long furrow hero shot is not established in the current cut. The existing draft correctly reports a weak ploughing beat and should not call the trailer proof of a long persistent trail.
- The UI is useful for demonstrating a real playable build, but it makes the trailer read more like a field-test capture than a polished game trailer. That is acceptable for a build-in-public first post if stated through the copy’s early-build framing.

## Claim review

| Claim | Status for public copy | Handling |
|---|---|---|
| Browser-playable | Supported by the live URL reachability check and existing project artifacts, but current check is Tier 1/Tier 2 boundary only. | Say “playable in a browser.” Keep phone/laptop wording only where the existing responsive evidence is intended to support it. |
| Terrain is a meaningful system | Supported by the current project direction and visible trailer framing. | Lead with this. |
| Tractor and buggy have different surface personalities | Supported by existing project evidence, but not shown in this trailer. | Use in the post, not as a trailer-specific claim. |
| Furrows persist | Supported as a project behavior claim in existing docs, but not visibly proven by this cut. | Put in a reply or follow-up clip, not “the trailer proves this.” |
| No full game engine underneath | Too easy to misunderstand. Three.js is still the rendering library. | Say: “There is no full game engine underneath this build; the terrain, traversal physics, audio, and save system are project-owned, with Three.js handling rendering.” |
| The game is fun or launch-ready | Not supported. | Keep the honest “no goal yet; I do not know if it is fun” line. |

## Recommended publish decision

### Best current option

Post the main `trailer-final.mp4` as the field-test teaser with the short X post below. The full export preserves the strongest runtime rhythm and already includes the locally generated music bed. Keep `trailer.mp4` as the silent fallback and use the shorter ACE-Step cuts only if a platform constraint or post-length decision needs them.

### Do not use as the primary asset

Do not use `trailer-cut1-noplough.mp4` as the main announcement attachment. It removes one of the clearest differentiators, the machine changing the ground, while retaining the same tractor-only story.
Do not silently fall back to `trailer.mp4` as the default attachment unless the owner explicitly wants the no-audio variant.

### Hold for a second media pass

Create a stronger trailer revision when the ploughing regression is fixed. The target shot is a visibly continuous furrow trail, followed by a clean terrain-edge or marsh traversal beat. A later comparison clip should show the buggy on hardpan and bogging or needing a run-up on soft ground.

## Ready-to-post X copy

### Main post

```text
Rigs Unbound is a browser driving game where the ground is the enemy.

Mud, dust, rock and standing water grip differently. The tractor claws through the marsh; the buggy is quick on hard ground and needs a run-up on steep terrain.

The trailer is a raw field test. No goal yet. I do not know if it is fun. That is what I am finding out next.

Play: rigs-unbound.suyashpranay.chatgpt.site
```

### Optional reply

```text
The longer-term bet is that the vehicle personalities should emerge from the ground simulation, not from a list of “tractor stats.” Furrows, visibility, slope, grip and persistence are all part of the experiment.
```

### Optional reply when the furrow shot has been re-recorded

```text
Plough a furrow and it stays cut into the terrain. Drive back later and your own lines are still there. The map only reveals ground your machine could actually see from where it stood.
```

Do not use the last reply with the current trailer as if the video visibly proves the complete claim. Use it only after a replacement shot or a separate evidence clip is attached.

## Pre-flight checklist

- [ ] Decide whether the current silent cut is intentional or add a music bed.
- [ ] Attach the main `trailer-final.mp4`, not the no-plough cut.
- [ ] Open the live URL in the posting browser and confirm the intended entry screen.
- [ ] If retaining “phone or laptop,” use the existing responsive acceptance evidence and do not imply universal device support.
- [ ] Confirm the post still says there is no goal and that fun is unproven.
- [ ] Do not mention the buggy as visible trailer footage.
- [ ] Do not claim a long furrow trail from this cut.
- [ ] Post the first reply only if the thread is intended; save the mistake stories for later posts.

## Evidence and confidence

- Media metadata: directly inspected with `ffprobe`.
- Visual shot content: manually inspected from the poster and generated contact sheets.
- Live URL: HTTP 200 reachability check; no browser/device interaction was performed in this review.
- Copy readiness: editorial recommendation, not a runtime or product-readiness claim.
- Overall confidence: high for the media description and claim boundaries; medium for current responsive behavior because no fresh mobile browser run was performed.

## Skill influence

The `3d-web-experience` skill was used for the browser-delivery claim review. It reinforced three boundaries: do not overclaim desktop/mobile support without device evidence, retain truthful loading/fallback expectations, and treat the trailer as a visual introduction rather than proof of the entire interactive experience.

No external post was sent. This artifact is the approval surface before posting.

## Addendum (2026-07-27): media choice tightened to the audio-enhanced cut

After reviewing the current poster and contact sheets against the encoded candidates, the primary announcement asset is now `trailer-final.mp4`. That export is the honest long-form teaser because it preserves the full 37.4-second field-test rhythm and includes the locally generated music bed already described in the production log.

The silent `trailer.mp4` is still preserved as a fallback. The tighter ACE-Step alternates remain valid if a shorter social cut is later preferred, but they are no longer the default recommendation for this post package.
