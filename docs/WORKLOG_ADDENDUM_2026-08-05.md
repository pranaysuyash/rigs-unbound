# Worklog Addendum — 2026-08-05

## Fixed teardown() false-warning defect in acceptance helpers

`tools/acceptance-helpers.cjs` `teardown()` installed a 5s `setTimeout`
warning guard that was **never cancelled** when the race was won by the
normal close path. The pending timer kept the Node event loop alive and
fired a false `"Chrome teardown exceeded 5 seconds."` warning even when the
browser closed cleanly in ~90ms.

- Root cause: the guard timer was created with `setTimeout` but the win
  branch returned without `clearTimeout(guardTimer)`.
- Fix: track the guard handle, `clearTimeout(guardTimer)` after the race
  resolves, and only emit the warning when the winner is the timeout.
- Measured: real wall time for a weather acceptance run dropped from
  ~8.78s (dead-tail on the phantom timer) to ~3.76s, with a clean exit and
  no false warning. Subsequent full weather acceptance run: `ok:true` in
  ~3.39s.
- Pattern search: only the shared helper had the defect;
  `tools/add-trailer-audio.cjs` uses its own try/catch close without a
  guard timer, so it was left alone.

## Weather acceptance script hardening (same session, earlier)

- `tools/weather-scene-browser-acceptance.cjs`: switched Playwright launch
  from bundled `chromium` to `channel: "chrome"` (line 35), fixed the
  snapshot read (`snap.weatherPhase` → `snap.weather?.phase`, state nests
  it at `src/game/state.ts:3020`), and replaced the fixed 400ms wait with
  `pollSceneConvergence` polling until `easedRain > 0.5`.

## Installed modlens as a local working skill (not committed)

`modlens` (github.com/liustack/modlens) is an image→structured-JSON
evidence CLI for text-only LLMs. Per operator instruction it is a **working
tool**, deliberately kept **outside the repo**:

- Skill: installed to `~/.agents/skills/modlens` (a real dir; the
  canonical `~/Projects/skills/` symlink convention was not used — the
  skills.sh CLI wrote a firm copy there).
- CLI: resolved via npx (`@liustack/modlens@2.7.1`); `modlens config init`
  created `~/.modlens/config.json` (home dir, never committed).
- Provider routing: default `antigravity-cli` needs `agy` (not installed);
  `claude-cli` hits an upstream parse bug — with `--json-schema`, claude
  CLI emits a JSON **array** of events and modlens `parseEnvelope`
  (`src/providers/claudeCli.ts:93`) only handles a single object, so it
  throws "Claude CLI output contains no result." (worth reporting upstream).
- **Working provider**: `openai` → `gpt-5.4-nano` (smallest vision model
  on the account), baseUrl `https://api.openai.com/v1`. The key is not
  stored in config; it is injected at runtime via `OPENAI_API_KEY`
  (sourced from `/Users/pranay/Projects/LLM/.env`, same key as
  `invoice-intelligence/.env`).
- Verified on `artifacts/playtest2-casual/03-enter-field.png`: exit 0,
  valid JSON across all six schema keys (summary, ocr, layout, semantics,
  visual, uncertainty). Repo stays clean — no modlens artifacts, no key in
  the tree; `.gitignore` already covers `.env`/`.env.*`.
- Security note: skills.sh flagged modlens High Risk / 1 Socket alert /
  Critical on install; CLI is API-only, reviewed, and accepted for local
  tooling use.
