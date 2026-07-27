# Agent Operating Notes — Rigs Unbound

## Worklog discipline

The main `docs/WORKLOG.md` is a long-running chronological record. To keep it
maintainable:

- **Prefer dated addendum files** once a session produces more than a few
  worklog entries. Name them `docs/WORKLOG_ADDENDUM_YYYY-MM-DD.md`.
- **Add only a one-line pointer** to `docs/WORKLOG.md` pointing to the addendum.
- Do **not** append large multi-entry blocks directly to `docs/WORKLOG.md`
  when it is already large (>5 MB or >500 entries). Split into addendums and
  link instead.
- If the addendum itself grows large, start a new dated addendum and link the
  previous one at the top.

## Decision and tracker discipline

- Update `docs/decisions/README.md` when creating or changing an ADR status.
- Update `docs/plans/MASTER_EXECUTION_TRACKER.md` when a task produces evidence
  or a status change.
- Load-bearing decisions stay `Proposed` until the operator explicitly accepts
  them; never promote a proposal to `Accepted` without a traceable sign-off.

## Parallel runtime ownership

- `src/game/` may contain uncommitted parallel-owned runtime work. Do not edit
  `src/game/` unless the user explicitly clears the collision.
- Documentation, plans, ADRs, reviews, and exploration notes are safe to edit.

## Canonical local dev surface

- Local development uses **exactly one** canonical Vite dev server on port
  **4173** (`server.port: 4173`, `strictPort: true` in `vite.config.ts`).
- Launch it with `node tools/start-canonical-dev-server.cjs`, which is
  idempotent: it reuses the existing 4173 server if one exists, starts one if
  not, and exits once the port responds.
- Do **not** opportunistically fall back to other ports (4174, 4180, etc.) for
  browser tests, screenshots, or playtest evidence. Multiple ports create
  runtime contradictions and invalid evidence.
- If 4173 is blocked, diagnose and free it (`lsof -i :4173`) or stop the
  conflicting process. Do not paper over the conflict by starting another port.
- Update current guidance, not historical evidence, when the canonical port
  changes.

## Verification before completion claims

- Run `npm run typecheck && npx vitest run` before claiming implementation work
  is complete.
- Report test failures honestly; do not hide regressions in parallel-owned code.
