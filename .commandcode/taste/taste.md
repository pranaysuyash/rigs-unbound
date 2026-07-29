# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# git
- Do not bypass git pre-commit hooks with core.hooksPath=/dev/null; always let hooks run as part of the commit process. Confidence: 0.90
- Never bypass or disable project safety gates (pre-commit hooks, motto checks, verification steps) under any circumstances — the motto system has an explicit no-skip design. Confidence: 0.95

# workflow
- When user instructions are ambiguous about scope (e.g., commit scope, what files to touch), stop and ask a clarifying question with explicit options rather than guessing — especially when AGENTS.md flags directories as parallel-owned. Confidence: 0.85
- Before touching code flagged as parallel-owned (e.g., `src/game/` per AGENTS.md), get explicit user go-ahead even when the user has given a broad instruction. Confidence: 0.85
- Run required verification (`npm run typecheck && npx vitest run` per project AGENTS.md) before claiming implementation work is complete; if checks fail, report honestly and do not paper over the failure. Confidence: 0.90

# communication
- When making a mistake (e.g., bypassing a safety gate), acknowledge it plainly and own it without making excuses; describe the corrected understanding specifically rather than vague apologies. Confidence: 0.85
- Flag failures and regressions explicitly in commit messages and end-of-task summaries — never hide them in the commit body or skip them to look clean. Confidence: 0.90

# debugging
- When tool output seems contradictory (e.g., vitest reports a diff that grep shows doesn't exist), establish ground truth with first-principles checks: kill stale processes, clear transform/snapshot caches (`node_modules/.vite`, `node_modules/.vitest-temp`), verify file bytes with `md5sum`, re-run from a known-clean state before drawing conclusions. Confidence: 0.85
- For long-running commands (full test suites, ~90s+), redirect output to a temp file and background the process with sleep polling, rather than relying on inline shell pipes that may hit timeouts mid-run. Confidence: 0.85

