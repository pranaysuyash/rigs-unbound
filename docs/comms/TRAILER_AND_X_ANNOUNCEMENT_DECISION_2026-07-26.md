# Trailer and X Announcement Decision

Date: 2026-07-26
Project: Rigs Unbound
Status: Prepared for owner approval; do not publish until the runtime and human-media gates pass

## Decision

Treat the first public release as an **announcement plus gameplay field-test
teaser**, not a launch trailer and not a finished-game announcement.

Use the existing `docs/comms/assets/trailer-final.mp4` as the default media
candidate after human listening and a fresh public-runtime check. Preserve the
tighter ACE-Step exports as alternates, not replacements:

- `docs/comms/assets/trailer-final.mp4`: 37.4 seconds, 1280x720, H.264/AAC,
  approximately 4.6 MB, integrated loudness `-13.7 LUFS`.
- `docs/comms/assets/trailer-tight-cut-ace-step-take-01.mp4`: 28.9 seconds,
  1280x720, H.264/AAC, approximately 4.1 MB, `-18.2 LUFS`.
- `docs/comms/assets/trailer-tight-cut-ace-step-take-02.mp4`: 28.9 seconds,
  1280x720, H.264/AAC, approximately 4.1 MB, `-19.5 LUFS`.

The full candidate currently has the stronger documented mix and preserves the
engine/audio relationship. The tight candidates have useful pacing, but their
lower loudness and music-only treatment mean they are not automatically better.
This is a technical/editorial recommendation, not a human listening approval.

## Why this is the right deliverable

The footage communicates:

- a playable vehicle operating in a world with terrain, water, landmarks, and
  readable objectives;
- a field-test tone rather than a false claim of finished polish;
- a persistent-world direction through map, traversal, and terrain context;
- a clear visual premise: the ground affects what the machine can do.

The footage does **not** visibly prove:

- the buggy-versus-tractor contrast;
- a long continuous plough furrow;
- that the public deployment currently matches the latest local runtime;
- that the experience is fun for anyone other than the builder.

The announcement must therefore use the first group as the trailer promise and
the second group only as bounded text, follow-up material, or future capture
work. Do not claim that this trailer proves the second group.

## Applied production rules

The `game-trailer-production` skill classifies this as a social announcement
teaser with real gameplay capture. The following rules were applied:

- preserve gameplay truth; do not imply a feature that the footage does not
  show;
- communicate the player verb within the opening seconds;
- keep enough HUD/UI to establish that this is a playable build;
- make the trailer work muted, since social autoplay may begin without audio;
- keep generated music provenance in the repo and do not imply that it is
  shipped in-game music;
- retain source recordings and reversible exports;
- use an explicit CTA only after the linked build is manually usable;
- do not use platform, performance, fun, or availability superlatives without
  direct evidence.

## Media truth ledger

| Claim or element | Evidence | Public handling |
|---|---|---|
| 1280x720 H.264 video | `ffprobe` on all candidate MP4s | Safe for X candidate selection |
| 30 fps | `ffprobe` on all candidate MP4s | Safe to describe only as media metadata, not game performance |
| Stereo AAC audio | `ffprobe` on audio candidates | Safe; human listening still required |
| 37.4-second full trailer | `ffprobe` on `trailer-final.mp4` | Use as current default candidate |
| 28.9-second tighter cut | `ffprobe` on ACE-Step exports | Keep as alternate social edit |
| Engine audio and generated music | production log and asset provenance | Do not call all audio in the video shipped game audio |
| Browser URL reachable | `curl -I -L` returned HTTP 200 on 2026-07-26 | Reachability only; not runtime acceptance |
| Current local runtime healthy | browser-daemon console showed startup/module errors | Not claimable until the parallel integration blocker closes |
| Mobile support | historical responsive evidence exists | Do not say “works on every phone” without a fresh real-device check |
| Fun, finished, launch-ready | no direct evidence | Explicitly deny these claims in the announcement |

## X upload fit

X's official guidance at <https://help.x.com/en/using-x/x-videos> states that
non-Premium posts can upload videos up to 140 seconds and 512 MB. It also lists
maximum resolution and frame-rate boundaries that the current 1280x720, 30 fps
exports satisfy. The current files are therefore inside the stated ordinary
upload envelope.

This check proves upload compatibility, not successful upload/transcoding. The
actual uploaded post must still be opened and reviewed after posting or in a
private draft preview.

## Recommended X thread

### Post 1

```text
Most vehicle games start with the vehicle. I'm starting with the ground.

I'm building Rigs Unbound, a browser vehicle world where terrain decides what each machine can do.

This trailer is a raw field test, not a finished game.
```

### Post 2

```text
The tractor owns the marsh. The buggy wins on hardpan.

That difference emerges from one grip rule, not a stat sheet: lugged tyres recover more of what a surface lacks.
```

### Post 3

```text
No goal yet. No story yet. Nobody outside this project has played it. I don't know if it's fun.

That's the next test.

Play: https://rigs-unbound.suyashpranay.chatgpt.site
```

This version keeps the strongest hook, explains the systemic thesis, and puts
the credibility-costing limitation next to the ambition. It does not claim that
the trailer visibly contains a buggy comparison or a persistent furrow.

## Optional single-post version

```text
Most vehicle games start with the vehicle. I'm starting with the ground.

I'm building Rigs Unbound, a browser vehicle world where terrain decides what each machine can do. The tractor owns the marsh; the buggy wins on hardpan.

No goal yet. I don't know if it's fun. Finding out next.

https://rigs-unbound.suyashpranay.chatgpt.site
```

Use the thread when conversation and build-in-public context are the priority.
Use the single post when the trailer is the primary object and the copy should
stay compact.

## Post-publication follow-ups

Do not force every proof into the first announcement. Use later posts for:

1. A clean tractor-versus-buggy comparison on marsh and hardpan.
2. A continuous furrow capture showing the terrain edit before and after.
3. The backwards-tractor bug and the claim-based test that caught it.
4. The upgrade that did nothing because the rig was traction-limited.

Each follow-up should show the evidence directly, then explain the rule. The
bug stories are stronger after the audience understands what Rigs Unbound is.

## Required gates before publishing

### Runtime gate

- [ ] The active parallel integration surfaces reconcile the `visibleSignals`,
      signature export, and undefined collection failures.
- [ ] A fresh server from the current checkout passes the HTML/module-asset
      probe on an isolated port.
- [ ] The browser daemon shows no page or console errors during startup and the
      intended Field Test path.
- [ ] The public URL is opened in a fresh browser context and the entry screen,
      controls, and first interaction are manually confirmed.

### Media gate

- [ ] Owner listens to `trailer-final.mp4` with sound on headphones or speakers.
- [ ] Owner compares both ACE-Step tight-cut takes, especially the engine/music
      balance and the ending button.
- [ ] Owner selects one export; no AI/editorial recommendation is treated as
      human artistic approval.
- [ ] The chosen upload is previewed muted and with sound before publishing.

### Claim and rights gate

- [ ] The post continues to say that the project has no goal yet and fun is
      unproven.
- [ ] No wording implies that the buggy appears in the attached trailer.
- [ ] No wording claims a long furrow trail from the current cut.
- [ ] Local ACE-Step provenance remains documented in the production log.
- [ ] The current README licence position is understood before driving traffic
      to the repository.

## Current outcome

The communication package is strategically ready but operationally not yet
publish-ready. This is not a refusal to announce the game; it is the correct
separation between a strong announcement concept, a technically valid media
candidate, and the runtime/human evidence needed to publish without making a
false promise.

## Pass outcomes

### Pass 1: Immediate correctness

The footage and copy were compared directly. Unsupported trailer-specific
claims were removed from the recommended post.

### Pass 2: Architecture and long-term viability

The source recordings and alternate exports remain preserved. The announcement
uses the real project thesis rather than turning a one-off screenshot into the
product identity.

### Pass 3: Rule compliance and supervision readiness

The decision records evidence tiers, current blockers, owner approvals, rights
provenance, platform constraints, and exact closure gates. No external post was
sent by this work.
