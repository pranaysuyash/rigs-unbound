/**
 * Playtest movement heatmap, built from exported ghost trails.
 *
 * The runtime already records where a rig went: `GhostTrailRecorder`
 * (`src/game/ghost.ts`) samples every rig's x/y/z/heading/speed at 10Hz during
 * play, and `window.getGhostTrail()` (wired in `src/main.ts`) dumps the
 * current session's trail as JSON at any point. That data has existed in the
 * runtime the whole time; what has never existed is a way to look at many
 * exported trails together and ask the question Nintendo's BOTW team asked of
 * their own playtest instrumentation: where do players never go, and did
 * every hand-placed site actually get found?
 *
 * This tool answers exactly that, offline, from one or more exported trail
 * files. It does not touch the runtime, the save schema, or add any
 * always-on telemetry pipeline — it is a read-only analysis pass over
 * voluntarily-exported session data (console `window.getGhostTrail()` calls,
 * or a scripted browser-acceptance run wired to call it), following this
 * project's existing "reusable offline tool over runtime speculation"
 * pattern (`tools/replay-record-inspect.ts`, `tools/audit-runtime-reachability.mjs`).
 *
 * Usage:
 *   npx vite-node tools/heatmap-from-ghost-trail.ts trail1.json [trail2.json ...] [--out heatmap.svg] [--grid 48]
 *
 * Each input file is expected to be the JSON shape `window.getGhostTrail()`
 * produces: `{ schemaVersion, sampledAtHz, seed, activeRigId, snapshots }`.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

import { WORLD_RADIUS, WORLD_SITES } from "../src/game/world";
import type { GhostSnapshot } from "../src/game/ghost";

interface GhostTrailExport {
  schemaVersion: number;
  sampledAtHz: number;
  seed: string;
  activeRigId?: string;
  snapshots: GhostSnapshot[];
}

interface CliOptions {
  inputPaths: string[];
  outPath: string;
  gridSize: number;
}

function parseArgs(argv: string[]): CliOptions {
  const inputPaths: string[] = [];
  let outPath = "heatmap.svg";
  let gridSize = 48;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg === "--out") {
      outPath = argv[++i] ?? outPath;
    } else if (arg === "--grid") {
      const parsed = Number(argv[++i]);
      if (Number.isFinite(parsed) && parsed > 0) gridSize = Math.round(parsed);
    } else if (!arg.startsWith("--")) {
      inputPaths.push(arg);
    }
  }

  return { inputPaths, outPath, gridSize };
}

function loadTrail(path: string): GhostTrailExport {
  const raw = readFileSync(resolve(path), "utf8");
  const parsed = JSON.parse(raw) as Partial<GhostTrailExport>;
  if (!Array.isArray(parsed.snapshots)) {
    throw new Error(
      `${path}: missing "snapshots" array — is this a window.getGhostTrail() export?`,
    );
  }
  return {
    schemaVersion: parsed.schemaVersion ?? 0,
    sampledAtHz: parsed.sampledAtHz ?? 0,
    seed: parsed.seed ?? "unknown",
    activeRigId: parsed.activeRigId,
    snapshots: parsed.snapshots,
  };
}

function buildHeatmapSvg(
  trails: GhostTrailExport[],
  gridSize: number,
): { svg: string; siteReport: string[] } {
  const size = 800;
  const bounds = WORLD_RADIUS;
  const cellSize = size / gridSize;
  const grid = new Array<number>(gridSize * gridSize).fill(0);
  let totalSamples = 0;

  const toPixel = (x: number, z: number) => ({
    px: ((x + bounds) / (2 * bounds)) * size,
    py: ((z + bounds) / (2 * bounds)) * size,
  });

  for (const trail of trails) {
    for (const snap of trail.snapshots) {
      totalSamples += 1;
      const { px, py } = toPixel(snap.x, snap.z);
      const cx = Math.min(gridSize - 1, Math.max(0, Math.floor(px / cellSize)));
      const cy = Math.min(gridSize - 1, Math.max(0, Math.floor(py / cellSize)));
      // `?? 0` rather than `!`: the clamps above already keep the index in range,
      // so this cannot fire — but if a future change breaks that, an absent cell
      // must count as zero. `!` would make it `undefined + 1`, i.e. NaN, which
      // then propagates through maxCount and silently blanks the whole heatmap.
      // A wrong answer that still looks like a heatmap is the worse failure.
      const cell = cy * gridSize + cx;
      grid[cell] = (grid[cell] ?? 0) + 1;
    }
  }

  const maxCount = grid.reduce((m, v) => Math.max(m, v), 0);
  const visitedCells = grid.filter((v) => v > 0).length;
  const coveragePct = ((visitedCells / grid.length) * 100).toFixed(1);

  const cells: string[] = [];
  for (let cy = 0; cy < gridSize; cy += 1) {
    for (let cx = 0; cx < gridSize; cx += 1) {
      const count = grid[cy * gridSize + cx] ?? 0;
      if (count === 0) continue;
      const t = maxCount > 0 ? count / maxCount : 0;
      // Cool (unvisited-adjacent, low density) -> hot (heavily walked) scale.
      const r = Math.round(40 + t * 215);
      const g = Math.round(60 + (1 - t) * 120);
      const b = Math.round(200 - t * 180);
      cells.push(
        `<rect x="${(cx * cellSize).toFixed(1)}" y="${(cy * cellSize).toFixed(1)}" ` +
          `width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" ` +
          `fill="rgb(${r},${g},${b})" fill-opacity="${(0.25 + t * 0.6).toFixed(2)}" />`,
      );
    }
  }

  const siteReport: string[] = [];
  const siteMarkers: string[] = [];
  for (const site of WORLD_SITES) {
    let hitsWithinDiscoverRadius = 0;
    for (const trail of trails) {
      for (const snap of trail.snapshots) {
        const dx = snap.x - site.x;
        const dz = snap.z - site.z;
        if (Math.sqrt(dx * dx + dz * dz) <= site.discoverRadius) {
          hitsWithinDiscoverRadius += 1;
        }
      }
    }
    const reached = hitsWithinDiscoverRadius > 0;
    siteReport.push(
      `${reached ? "✓" : "✗ NEVER REACHED"}  ${site.name.padEnd(18)} ` +
        `samples-within-discoverRadius=${hitsWithinDiscoverRadius}`,
    );
    const { px, py } = toPixel(site.x, site.z);
    const color = reached ? "#1a8f3c" : "#c92a2a";
    siteMarkers.push(
      `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="6" fill="${color}" stroke="#fff" stroke-width="1.5" />` +
        `<text x="${(px + 9).toFixed(1)}" y="${(py + 4).toFixed(1)}" font-size="12" font-family="sans-serif" fill="#111">${site.name}</text>`,
    );
  }

  const worldBoundaryPx = (bounds / bounds) * (size / 2);
  const svg = [
    `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`,
    `<rect x="0" y="0" width="${size}" height="${size}" fill="#0b0e11" />`,
    `<circle cx="${size / 2}" cy="${size / 2}" r="${worldBoundaryPx}" fill="none" stroke="#3a4048" stroke-width="2" />`,
    ...cells,
    ...siteMarkers,
    `<text x="10" y="${size - 12}" font-size="12" font-family="sans-serif" fill="#9aa3ab">` +
      `${totalSamples} samples across ${trails.length} session(s) · grid coverage ${coveragePct}% (${visitedCells}/${grid.length} cells)</text>`,
    `</svg>`,
  ].join("\n");

  return { svg, siteReport };
}

function main(): void {
  const { inputPaths, outPath, gridSize } = parseArgs(process.argv.slice(2));

  if (inputPaths.length === 0) {
    console.error(
      "Usage: npx vite-node tools/heatmap-from-ghost-trail.ts <trail1.json> [trail2.json ...] [--out heatmap.svg] [--grid 48]\n" +
        "Each input is a window.getGhostTrail() export from a play session.",
    );
    process.exitCode = 2;
    return;
  }

  const trails = inputPaths.map(loadTrail);
  const { svg, siteReport } = buildHeatmapSvg(trails, gridSize);

  writeFileSync(resolve(outPath), svg, "utf8");

  console.log(`Wrote ${outPath} from ${trails.length} trail file(s).`);
  console.log("");
  console.log("Site reachability (this batch of sessions only):");
  for (const line of siteReport) console.log(`  ${line}`);
  const neverReached = siteReport.filter((l) => l.includes("NEVER REACHED"));
  if (neverReached.length > 0) {
    console.log("");
    console.log(
      `${neverReached.length}/${WORLD_SITES.length} sites were never approached in this batch. ` +
        "Per the BOTW playtest-heatmap methodology, treat that as a design signal to " +
        "investigate (landmark visibility, route friction, discoverRadius sizing) — not as " +
        "proof players don't want to go there.",
    );
  }
}

main();
