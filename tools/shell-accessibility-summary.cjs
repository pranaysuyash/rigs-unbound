const path = require("node:path");
const { spawnSync } = require("node:child_process");

const probePath = path.resolve(
  __dirname,
  "shell-accessibility-browser-acceptance.cjs",
);

const result = spawnSync(process.execPath, [probePath], {
  encoding: "utf8",
  env: process.env,
});

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  process.exit(result.status || 1);
}

let parsed;
try {
  parsed = JSON.parse(result.stdout);
} catch (error) {
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  throw new Error(
    `Could not parse shell accessibility probe output: ${error.message}`,
  );
}

const lines = [
  `Shell accessibility summary for ${parsed.url}`,
  `Viewport: ${parsed.viewport.width}x${parsed.viewport.height}`,
  `Profile: ${parsed.profile.text} [${parsed.profile.role}, ${parsed.profile.live}] visible=${parsed.profile.visible}`,
  `Save: ${parsed.save.text} [${parsed.save.role}, ${parsed.save.live}, atomic=${parsed.save.atomic}] visible=${parsed.save.visible}`,
  `Diagnostics hidden: ${parsed.diagnosticsHidden}`,
  `Bands overlap: ${parsed.overlap}`,
  `Accessibility hits: ${parsed.accessibilityHits.length}`,
  `Console problems: ${parsed.consoleProblems.length}`,
];

process.stdout.write(lines.join("\n") + "\n");
