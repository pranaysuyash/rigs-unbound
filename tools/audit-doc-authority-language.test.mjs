import assert from "node:assert/strict";
import test from "node:test";

import { auditMarkdown } from "./audit-doc-authority-language.mjs";

test("detects unsupported authority and implementation language", () => {
  const findings = auditMarkdown(
    [
      "Status: Accepted",
      "The operator decision selected this engine.",
      "| PyBullet | **Approved Tooling** — Used to validate physics |",
    ].join("\n"),
    "fixture.md",
  );

  assert.deepEqual(
    findings.map(({ line, rule }) => ({ line, rule })),
    [
      { line: 1, rule: "accepted-status" },
      { line: 2, rule: "operator-direction" },
      { line: 3, rule: "approved-label" },
      { line: 3, rule: "used-claim" },
    ],
  );
});

test("does not flag neutral candidate and evidence language", () => {
  const findings = auditMarkdown(
    [
      "Status: Proposed — operator sign-off required",
      "Rapier is an implemented evidence fixture.",
      "PyBullet is a candidate with no executable evidence.",
    ].join("\n"),
  );

  assert.deepEqual(findings, []);
});
