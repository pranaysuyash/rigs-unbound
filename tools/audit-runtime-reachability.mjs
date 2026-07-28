#!/usr/bin/env node

/**
 * Runtime reachability audit.
 *
 * Answers one question the documentation cannot answer for itself:
 * which TypeScript modules can actually be reached from a shipped entry point?
 *
 * A module that is typechecked, tested, and documented but never imported by
 * any entry-reachable module is an *unreachable claim*: it describes behaviour
 * the player can never observe. This audit makes that count measurable so the
 * project can treat it as a tracked number instead of a rediscovered surprise.
 *
 * The audit is deliberately static and dependency-free. It does not execute the
 * app, so it cannot prove a reachable module is *used* — only that a path from
 * an entry point exists. Absence of a path is the strong signal; presence of a
 * path is a weaker one.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import process from "node:process";

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts"];

/** Static import, `export ... from`, and dynamic `import()` specifiers. */
const IMPORT_PATTERNS = [
  /\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']/g,
  /\bimport\s*["']([^"']+)["']/g,
];

/** `<script type="module" src="...">` entries in an HTML shell. */
const HTML_MODULE_PATTERN = /<script[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;

/**
 * Build-time entry points that live outside `src/` but legitimately pull
 * modules into the graph (Vite/Vitest config plugins, for example).
 */
const BUILD_CONFIG_ENTRIES = [
  "vite.config.ts",
  "vitest.config.ts",
  "worker/index.ts",
];

function isTestFile(absolutePath) {
  return /\.(test|spec)\.[cm]?tsx?$/.test(absolutePath);
}

/**
 * Ambient declaration files are never imported at runtime by design; counting
 * them as unreachable would inflate the budget with a permanent false positive.
 */
function isAmbientDeclaration(absolutePath) {
  return absolutePath.endsWith(".d.ts");
}

function isSourceFile(absolutePath) {
  return SOURCE_EXTENSIONS.includes(extname(absolutePath).toLowerCase());
}

async function walk(targetPath) {
  const absolute = resolve(targetPath);
  let entryStat;
  try {
    entryStat = await stat(absolute);
  } catch {
    return [];
  }

  if (entryStat.isFile()) {
    return [absolute];
  }

  const entries = await readdir(absolute, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith("."))
      .filter((entry) => entry.name !== "node_modules")
      .map((entry) => walk(resolve(absolute, entry.name))),
  );
  return nested.flat();
}

/**
 * Resolve a relative import specifier the way Vite/TypeScript would, trying the
 * extensionless form, each source extension, and the directory index form.
 */
async function resolveSpecifier(specifier, fromFile, rootDir) {
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
    return null; // bare package specifier — outside the project graph
  }

  // Root-absolute specifiers are Vite's `/src/...` form and must resolve
  // against the audited root, not the process working directory.
  const base = specifier.startsWith("/")
    ? resolve(rootDir, `.${specifier}`)
    : resolve(dirname(fromFile), specifier);

  const withoutExplicitJs = base.replace(/\.js$/, "");
  const candidates = [
    base,
    ...SOURCE_EXTENSIONS.map((extension) => `${withoutExplicitJs}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => `${base}/index${extension}`),
  ];

  for (const candidate of candidates) {
    if (!isSourceFile(candidate)) continue;
    try {
      const candidateStat = await stat(candidate);
      if (candidateStat.isFile()) return candidate;
    } catch {
      // try the next candidate shape
    }
  }
  return null;
}

async function readImports(absolutePath, rootDir) {
  const source = await readFile(absolutePath, "utf8");
  const specifiers = new Set();
  for (const pattern of IMPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match = pattern.exec(source);
    while (match) {
      specifiers.add(match[1]);
      match = pattern.exec(source);
    }
  }

  const resolved = [];
  for (const specifier of specifiers) {
    const target = await resolveSpecifier(specifier, absolutePath, rootDir);
    if (target) resolved.push(target);
  }
  return resolved;
}

/**
 * Only root-level HTML shells confer reachability. Archived evidence previews
 * under `docs/` must not make a module look wired.
 */
async function discoverHtmlEntries(rootDir) {
  const rootEntries = await readdir(rootDir, { withFileTypes: true });
  const htmlFiles = rootEntries
    .filter((entry) => entry.isFile())
    .map((entry) => resolve(rootDir, entry.name))
    .filter((file) => extname(file).toLowerCase() === ".html");

  const moduleEntries = [];
  for (const htmlFile of htmlFiles) {
    const source = await readFile(htmlFile, "utf8");
    HTML_MODULE_PATTERN.lastIndex = 0;
    let match = HTML_MODULE_PATTERN.exec(source);
    while (match) {
      const target = await resolveSpecifier(match[1], htmlFile, rootDir);
      if (target) moduleEntries.push(target);
      match = HTML_MODULE_PATTERN.exec(source);
    }
  }
  return [...new Set(moduleEntries)];
}

async function countLines(absolutePath) {
  const source = await readFile(absolutePath, "utf8");
  return source.split("\n").length;
}

/**
 * Build the reachable set from the given entry points, then report every
 * non-test source module that the traversal never visited.
 */
export async function auditReachability({
  rootDir = process.cwd(),
  sourceDir = "src",
  entryPoints = [],
} = {}) {
  const root = resolve(rootDir);
  const allFiles = (await walk(resolve(root, sourceDir))).filter(isSourceFile);
  const sourceFiles = allFiles.filter(
    (file) => !isTestFile(file) && !isAmbientDeclaration(file),
  );

  const discovered = await discoverHtmlEntries(root);
  const explicit = entryPoints.map((entry) => resolve(root, entry));
  const buildConfigs = BUILD_CONFIG_ENTRIES.map((entry) =>
    resolve(root, entry),
  );
  const candidateEntries = [
    ...new Set([...discovered, ...explicit, ...buildConfigs]),
  ];
  const entries = [];
  for (const entry of candidateEntries) {
    try {
      if ((await stat(entry)).isFile()) entries.push(entry);
    } catch {
      // a declared build entry that does not exist in this checkout
    }
  }

  const reachable = new Set();
  const queue = [...entries];
  while (queue.length > 0) {
    const current = queue.pop();
    if (reachable.has(current)) continue;
    reachable.add(current);
    for (const next of await readImports(current, root)) {
      if (!reachable.has(next)) queue.push(next);
    }
  }

  const unreachable = [];
  for (const file of sourceFiles) {
    if (reachable.has(file)) continue;
    unreachable.push({
      path: relative(root, file),
      lines: await countLines(file),
      hasTest: allFiles.some(
        (candidate) =>
          isTestFile(candidate) &&
          candidate.replace(/\.(test|spec)\./, ".") === file,
      ),
    });
  }
  unreachable.sort((a, b) => b.lines - a.lines || a.path.localeCompare(b.path));

  const totalLines = (
    await Promise.all(sourceFiles.map((file) => countLines(file)))
  ).reduce((sum, lines) => sum + lines, 0);
  const unreachableLines = unreachable.reduce(
    (sum, entry) => sum + entry.lines,
    0,
  );

  return {
    entryPoints: entries.map((entry) => relative(root, entry)),
    moduleCount: sourceFiles.length,
    reachableCount: sourceFiles.filter((file) => reachable.has(file)).length,
    unreachableCount: unreachable.length,
    totalLines,
    unreachableLines,
    unreachable,
  };
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Runtime reachability audit", "");
  lines.push(
    `- Entry points: ${report.entryPoints.join(", ") || "none found"}`,
  );
  lines.push(
    `- Non-test source modules: ${report.moduleCount} (${report.totalLines} lines)`,
  );
  lines.push(
    `- Entry-reachable modules: ${report.reachableCount}`,
    `- Unreachable modules: ${report.unreachableCount} (${report.unreachableLines} lines)`,
    "",
  );

  if (report.unreachableCount === 0) {
    lines.push(
      "Every non-test source module is reachable from an entry point.",
    );
    return lines.join("\n");
  }

  lines.push("| Module | Lines | Has tests |", "| --- | ---: | :---: |");
  for (const entry of report.unreachable) {
    lines.push(
      `| ${entry.path} | ${entry.lines} | ${entry.hasTest ? "yes" : "no"} |`,
    );
  }
  lines.push(
    "",
    "A module with tests but no entry path is tested behaviour the player",
    "cannot reach. Wire it, or record an explicit archived/deferred status.",
  );
  return lines.join("\n");
}

async function main(argv) {
  const args = argv.slice(2);
  const json = args.includes("--json");
  const failOnFindings = args.includes("--fail-on-findings");
  const maxIndex = args.indexOf("--max");
  const max = maxIndex >= 0 ? Number(args[maxIndex + 1]) : null;
  const entryPoints = args.filter(
    (arg, index) =>
      !arg.startsWith("--") && !(maxIndex >= 0 && index === maxIndex + 1),
  );

  const report = await auditReachability({ entryPoints });

  process.stdout.write(
    json
      ? `${JSON.stringify(report, null, 2)}\n`
      : `${renderMarkdown(report)}\n`,
  );

  if (failOnFindings && report.unreachableCount > 0) {
    process.exitCode = 1;
  } else if (
    max !== null &&
    Number.isFinite(max) &&
    report.unreachableCount > max
  ) {
    process.stderr.write(
      `Unreachable module count ${report.unreachableCount} exceeds budget ${max}.\n`,
    );
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main(process.argv);
}
