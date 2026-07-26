# Rigs Unbound Trailer Audio and Edit Production Log

Date: 2026-07-26
Status: candidate exports ready for human listening
Owner: Pranay

## Purpose

Improve the first public Rigs Unbound trailer without overwriting the original recording or the existing silent edit. The edit promise is:

> A compact field-test trailer that moves from premise, to world response, to a final night-driving button.

The public post and launch framing remain in:

- `docs/comms/POST_TODAY_2026-07-26.md`
- `docs/comms/BUILD_IN_PUBLIC_KIT_2026-07-25.md`
- `docs/comms/TRAILER_AND_POST_RELEASE_REVIEW_2026-07-26.md`

## Source custody

The source recordings remain untouched:

- `docs/comms/assets/trailer.mp4`
- `docs/comms/assets/trailer-cut1-noplough.mp4`

The previously generated silent picture candidate remains available:

- `docs/comms/assets/trailer-tight-cut.mp4`

Its 28.9-second structure keeps the useful beats from the original recording while removing slower repetition:

| Time | Picture role |
| --- | --- |
| 0.0-3.0 | title/premise: `THE GROUND DECIDES` |
| 3.0-8.0 | playable field proof |
| 11.0-16.0 | overhead/map context |
| 16.0-22.0 | terrain-edge consequence |
| 27.5-37.4 source range | night-driving closing button |

The source and silent candidate are preserved so music, copy, or later pacing decisions can be changed without re-recording the game.

## Local music generation path

The local model used for this pass is not Ollama. It is the existing ACE-Step installation at:

`/Users/pranay/Projects/music-lab/ACE-Step-1.5`

The project-local generation skill and wrapper were used:

- `/Users/pranay/Projects/music-lab/ACE-Step-1.5/.claude/skills/acestep/SKILL.md`
- `/Users/pranay/Projects/music-lab/ACE-Step-1.5/.claude/skills/acestep/scripts/acestep.sh`

The local API was started with the repository's documented macOS-compatible command, without changing the checkout:

```bash
uv run acestep-api --host 127.0.0.1 --port 8001
```

Health evidence before generation:

- URL: `http://127.0.0.1:8001`
- service: ACE-Step API
- loaded DiT: `acestep-v15-turbo`
- backend: Apple Silicon/MPS with MLX available
- models were lazy-loaded and initialized on the generation request

The prescribed wrapper generated two candidates from one deterministic request:

```bash
bash .claude/skills/acestep/scripts/acestep.sh generate \
  --caption "Instrumental cinematic trailer bed for a browser game field test: low-poly off-road exploration, restrained analog synth pulse, warm controlled bass, dry mechanical percussion, subtle marsh wind texture, gradual lift from curious to determined, clean final button, dialogue-safe, no vocals, no choir, no aggressive EDM, no lead melody dominating the picture" \
  --lyrics "[Instrumental]" \
  --no-thinking \
  --no-format \
  --model acestep-v15-turbo \
  --steps 8 \
  --duration 34 \
  --bpm 104 \
  --key-scale "D minor" \
  --time-signature "4/4" \
  --seed 13072026 \
  --batch 2
```

Generation job: `3eb63166-ee82-4266-92ae-7b7f5b58163e`

Model custody:

- DiT model: `acestep-v15-turbo`
- LM model: `acestep-5Hz-lm-0.6B`
- generation steps: `8`
- thinking: disabled
- format enhancement: disabled
- duration: `34.0s`
- BPM: `104`
- key: `D minor`
- time signature: `4/4`
- seed values reported by ACE-Step: `13072026,2129265155`
- output: MP3, 48 kHz, stereo, 128 kbps
- lyrics: `[Instrumental]`

The raw generation result is preserved at:

- `docs/comms/assets/trailer-review/audio/ace_step_job_3eb63166-ee82-4266-92ae-7b7f5b58163e.json`
- `docs/comms/assets/trailer-review/audio/ace_step_take_01.mp3`
- `docs/comms/assets/trailer-review/audio/ace_step_take_02.mp3`

Review spectra are preserved at:

- `docs/comms/assets/trailer-review/audio/take_1_spectrum.png`
- `docs/comms/assets/trailer-review/audio/take_2_spectrum.png`

## Candidate exports

Both candidates use the same silent picture edit and differ only in the music take:

- `docs/comms/assets/trailer-tight-cut-ace-step-take-01.mp4`
- `docs/comms/assets/trailer-tight-cut-ace-step-take-02.mp4`

Audio treatment:

- trim to the 28.9-second picture duration
- start fade: 0.8 seconds
- end fade: 1.5 seconds
- level: `0.82` gain before limiting
- true-peak limiter ceiling: `-0.45 dBFS` equivalent limiter setting
- AAC: 192 kbps, 48 kHz stereo

The exact finishing pattern was:

```bash
ffmpeg -y -hide_banner -loglevel error \
  -i docs/comms/assets/trailer-tight-cut.mp4 \
  -i docs/comms/assets/trailer-review/audio/ace_step_take_0N.mp3 \
  -filter_complex "[1:a]atrim=duration=28.9,asetpts=PTS-STARTPTS,volume=0.82,afade=t=in:st=0:d=0.8,afade=t=out:st=27.4:d=1.5,alimiter=limit=0.95[a]" \
  -map 0:v:0 -map "[a]" \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart \
  docs/comms/assets/trailer-tight-cut-ace-step-take-0N.mp4
```

## Finishing evidence

FFmpeg: `8.1.1`.

Both exports were probed after rendering:

- duration: `28.900000s`
- video: H.264, 1280x720, 30 fps, yuv420p-compatible pixel format
- audio: AAC, 48 kHz, stereo
- container: MP4 with fast-start flag
- take 1 integrated loudness: `-18.2 LUFS`, peak `-1.9 dBFS`
- take 2 integrated loudness: `-19.5 LUFS`, peak `-2.7 dBFS`

Checksums:

```text
34be6bb59601695f0caea1ee1d507d43e415a4cb932b2ef7f212b17e20277131  trailer-tight-cut-ace-step-take-01.mp4
50ca2129be06b1857dc1ccbbe2b566aff380376a6f2feae091a3e569cd366b30  trailer-tight-cut-ace-step-take-02.mp4
bdffb31ceff50f6c21061c31cf1460c62e0fb634131b4f5b5c538c7c8e76ce48  trailer-review/audio/ace_step_take_01.mp3
5023d5270ff0c30cb8eac0ed9ff1062dcd941c2d07f65253d260058ee19ffa51  trailer-review/audio/ace_step_take_02.mp3
```

## Review status

Static and media-pipeline review: passed at Tier 1-2.

What is established:

- the original trailer is preserved
- the edit is shorter and has a clear premise-to-button progression
- two locally generated instrumental candidates exist
- the audio is trimmed, faded, limited, and muxed into web-delivery MP4s
- the final files have the expected duration and stream layout
- the ACE-Step prompt, model, seed, parameters, raw result, and candidates are in the repo

What is not established yet:

- human listening preference between take 1 and take 2
- final X upload/transcode behavior
- whether music is better than the silent version for the intended post

Recommended listening order: take 2 first because its spectral energy leaves more space before a stronger closing rise; take 1 is the denser alternate. This is a recommendation, not a final artistic approval.

Before posting, listen to both exports on the intended headphones/speakers, check the first title card and final button with the music, then choose one of the two candidates or retain `trailer-tight-cut.mp4` as the silent fallback. No external post has been made by this work.
