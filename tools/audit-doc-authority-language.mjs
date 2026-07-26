#!/usr/bin/env node

import { readFile, readdir, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";
import process from "node:process";

const RULES = [
  {
    id: "accepted-status",
    category: "decision-authority",
    pattern: /\bstatus\b.{0,24}\baccepted\b/i,
    note: "Accepted must resolve to explicit sign-off or a clearly bounded technical-runtime status.",
  },
  {
    id: "operator-direction",
    category: "operator-attribution",
    pattern:
      /\boperator (?:direction|decision|accepted|approved|rejected|ratified)\b/i,
    note: "Operator attribution requires a traceable direct statement or sign-off.",
  },
  {
    id: "project-owner-attribution",
    category: "operator-attribution",
    pattern:
      /\bproject owner\b.{0,48}\b(?:accepted|approved|supplied|decided|rejected|ratified)\b/i,
    note: "Supplying material is not the same as authoring or accepting it.",
  },
  {
    id: "approved-label",
    category: "recommendation-authority",
    pattern: /\*\*(?:approved|adopt(?:ed)?|production baseline|canonical)\b/i,
    note: "Recommendation labels need linked evidence and, when load-bearing, sign-off.",
  },
  {
    id: "used-claim",
    category: "implementation-authority",
    pattern: /\*\*used\b|\bused to validate\b/i,
    note: "Used claims require an executable artifact, code reference, or captured run.",
  },
  {
    id: "mandatory-claim",
    category: "decision-authority",
    pattern:
      /\bmandatory\b.{0,64}\b(?:experiment|branch|runtime|system|framework|engine)\b/i,
    note: "Mandatory architecture or experiment language requires an accepted decision.",
  },
];

async function markdownFiles(targetPath) {
  const absolute = resolve(targetPath);
  const targetStat = await stat(absolute);
  if (targetStat.isFile()) {
    return extname(absolute).toLowerCase() === ".md" ? [absolute] : [];
  }

  const entries = await readdir(absolute, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith("."))
      .map((entry) => markdownFiles(resolve(absolute, entry.name))),
  );
  return nested.flat().sort();
}

export function auditMarkdown(source, file = "<memory>") {
  const findings = [];
  const lines = source.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    for (const rule of RULES) {
      if (!rule.pattern.test(line)) {
        continue;
      }
      findings.push({
        file,
        line: index + 1,
        rule: rule.id,
        category: rule.category,
        snippet: line.trim().replace(/\s+/g, " ").slice(0, 240),
        note: rule.note,
      });
    }
  }

  return findings;
}

function asMarkdown(findings, roots) {
  const counts = new Map();
  for (const finding of findings) {
    counts.set(finding.category, (counts.get(finding.category) ?? 0) + 1);
  }

  const lines = [
    "# Documentation Authority-Language Audit",
    "",
    `- Roots: ${roots.map((root) => `\`${resolve(root)}\``).join(", ")}`,
    `- Findings: ${findings.length}`,
    "- Meaning: review candidates, not automatic errors",
    "",
    "## Counts",
    "",
    "| Category | Count |",
    "| --- | ---: |",
    ...[...counts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([category, count]) => `| ${category} | ${count} |`),
    "",
    "## Findings",
    "",
    "| File | Line | Rule | Snippet |",
    "| --- | ---: | --- | --- |",
    ...findings.map(
      (finding) =>
        `| ${finding.file.replaceAll("|", "\\|")} | ${finding.line} | ${finding.rule} | ${finding.snippet.replaceAll("|", "\\|")} |`,
    ),
    "",
  ];

  return lines.join("\n");
}

async function main(argv) {
  const json = argv.includes("--json");
  const failOnFindings = argv.includes("--fail-on-findings");
  const roots = argv.filter((argument) => !argument.startsWith("--"));
  const requestedRoots = roots.length > 0 ? roots : ["docs"];
  const files = (
    await Promise.all(requestedRoots.map((root) => markdownFiles(root)))
  ).flat();

  const findings = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    findings.push(...auditMarkdown(source, file));
  }

  process.stdout.write(
    json
      ? `${JSON.stringify({ roots: requestedRoots, findings }, null, 2)}\n`
      : `${asMarkdown(findings, requestedRoots)}\n`,
  );

  if (failOnFindings && findings.length > 0) {
    process.exitCode = 1;
  }
}

const isEntrypoint =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname);

if (isEntrypoint) {
  await main(process.argv.slice(2));
}
