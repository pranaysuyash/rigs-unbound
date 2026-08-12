/**
 * Rig asset envelope CLI — emit the dimensional contract a reconstructed rig
 * must satisfy, and audit a candidate `.asset.json` against it.
 *
 * ## Why this tool exists
 *
 * The `img2threejs` forge pipeline reconstructs a Three.js model from a
 * reference plate, and it works: `field-plough-01` went through it end to end
 * (`tools/derive-img2threejs-spec.mjs`). Pointing it at a *rig* introduces one
 * problem a plough does not have.
 *
 * `field-plough-01.asset.json` declares its root as
 * `{width: 3.8, height: 1.8, depth: 1.35, confidence: 0.3}`. That confidence is
 * honest and harmless, because nothing in `physics.ts` reads a plough's width. A
 * rig's `track`, `wheelbase`, `wheelRadius`, and `rideHeight` are the opposite
 * case: they *are* simulation inputs. Estimating them from a photograph is
 * structurally the same act as hand-writing them as literals in the renderer —
 * which is exactly the drift that left every rig in this game floating above the
 * terrain by precisely its ride height (see `docs/WORKLOG_ADDENDUM_2026-08-11.md`).
 *
 * The plough spec already states the rule in prose:
 * `runtime.visualAuthority: "generated meshes never define physics truth"`.
 * This tool makes that sentence executable for rigs.
 *
 *   the reference plate supplies FORM  — which subassemblies exist, proportions
 *                                        within a derived extent, materials,
 *                                        greebles, wear, silhouette character
 *   `RIG_PROFILES` supplies DIMENSIONS — footprint, ride height, wheel radii,
 *                                        contact-point placement, decal lift
 *
 * ## What it deliberately does NOT do
 *
 * It does not scaffold schema-legal components. It would be easy to emit
 * `role: "TODO"`, `materials: ["placeholder"]` and friends so that the result
 * validates — and that is precisely the hazard: a spec that passes
 * `npm run test:assets` while nobody has authored it is worse than no spec,
 * because the green check is then evidence of nothing. The envelope is emitted as
 * a derivation an author reads and works from; `--check` is what refuses their
 * drift afterwards.
 *
 * ## Usage
 *
 *   # Emit one rig's envelope (stdout summary + optional JSON file)
 *   npx vite-node tools/derive-rig-asset-envelope.ts utility-tractor
 *   npx vite-node tools/derive-rig-asset-envelope.ts utility-tractor --out envelope.json
 *
 *   # Emit every shipped rig
 *   npx vite-node tools/derive-rig-asset-envelope.ts --all --out envelopes.json
 *
 *   # Audit a candidate spec (rig id from runtime.adapter.rigId, or --rig)
 *   npx vite-node tools/derive-rig-asset-envelope.ts --check assets/specs/foo.asset.json
 *
 * Exit codes: 0 clean, 1 drift found, 2 usage/input error.
 *
 * The comparison logic lives in `./rig-asset-envelope.ts` and is unit tested
 * (`./rig-asset-envelope.test.ts`, collected by `npm run test`), so this file
 * stays a thin CLI over a tested module rather than a second implementation.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

import { RIG_IDS, type RigId } from "../src/game/contracts";
import {
  candidatesFromSpecComponents,
  compareEnvelope,
  diagnoseUniformOffset,
  looksGroundFramed,
  rigAssetEnvelope,
  type EnvelopeDrift,
  type RigAssetEnvelope,
} from "./rig-asset-envelope";

interface CliOptions {
  rigIds: RigId[];
  outPath: string | null;
  checkPath: string | null;
  explicitRigId: RigId | null;
}

interface CandidateSpec {
  assetId?: unknown;
  assetFamily?: unknown;
  coordinateFrame?: { origin?: unknown; units?: unknown };
  components?: unknown;
  runtime?: { adapter?: { rigId?: unknown } };
}

function isRigId(value: unknown): value is RigId {
  return (
    typeof value === "string" && (RIG_IDS as readonly string[]).includes(value)
  );
}

function parseArgs(argv: string[]): CliOptions {
  const rigIds: RigId[] = [];
  let outPath: string | null = null;
  let checkPath: string | null = null;
  let explicitRigId: RigId | null = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg === "--out") {
      outPath = argv[++i] ?? null;
    } else if (arg === "--check") {
      checkPath = argv[++i] ?? null;
    } else if (arg === "--rig") {
      const value = argv[++i];
      if (!isRigId(value)) {
        throw new Error(
          `--rig expects one of: ${RIG_IDS.join(", ")} (got ${String(value)})`,
        );
      }
      explicitRigId = value;
    } else if (arg === "--all") {
      rigIds.push(...RIG_IDS);
    } else if (arg.startsWith("--")) {
      throw new Error(`Unknown flag ${arg}`);
    } else if (isRigId(arg)) {
      rigIds.push(arg);
    } else {
      throw new Error(
        `"${arg}" is not a shipped rig id. Known ids: ${RIG_IDS.join(", ")}`,
      );
    }
  }

  return { rigIds, outPath, checkPath, explicitRigId };
}

/** Metres get four decimals; ordinals like a wheel index are not measurements. */
function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(4);
}

function formatEnvelope(envelope: RigAssetEnvelope): string[] {
  const lines: string[] = [
    `${envelope.displayName}  (${envelope.rigId})  frame=${envelope.frame}`,
    `  origin: ${envelope.coordinateFrame.origin}`,
    "",
  ];

  for (const node of envelope.nodes) {
    const [x, y, z] = node.localPosition;
    const dims = Object.entries(node.dimensions)
      .map(([key, value]) => `${key}=${formatValue(value)}`)
      .join(" ");
    lines.push(
      `  ${node.id.padEnd(18)} ${node.level.padEnd(5)} ` +
        `pos=[${x.toFixed(4)}, ${y.toFixed(4)}, ${z.toFixed(4)}]  ${dims}`,
    );
    lines.push(`  ${" ".repeat(18)}   ↳ ${node.derivation}`);
  }

  lines.push("");
  lines.push("  Authorable (not derived — a reconstruction decides these):");
  for (const item of envelope.authorable) lines.push(`    · ${item}`);

  return lines;
}

/**
 * Map an asset spec's components into the candidate shape the module compares.
 *
 * Only `id`, `pivot.localPosition`, and `dimensions` participate: those are the
 * fields the profile determines. Everything else in a component is form, and
 * form is the plate's job.
 */
function reportDrift(drift: readonly EnvelopeDrift[]): void {
  // Grouped by node, with each node's derivation printed once. Repeating it per
  // field turns a seven-node frame error into seven identical paragraphs, which
  // buries the one line that matters.
  const byNode = new Map<string, EnvelopeDrift[]>();
  for (const item of drift) {
    const bucket = byNode.get(item.nodeId);
    if (bucket) bucket.push(item);
    else byNode.set(item.nodeId, [item]);
  }

  for (const [nodeId, items] of byNode) {
    for (const item of items) {
      if (item.field === "*") {
        console.error(`  ✗ ${nodeId}: node missing entirely`);
        continue;
      }
      const actual = item.actual === null ? "absent" : item.actual.toFixed(4);
      const delta = item.delta === null ? "n/a" : item.delta.toFixed(4);
      console.error(
        `  ✗ ${nodeId}.${item.field}: expected ${item.expected.toFixed(4)}, ` +
          `got ${actual} (delta ${delta})`,
      );
    }
    console.error(`      ${items[0]!.reason}`);
  }
}

/** Returns the process exit code. */
function runCheck(checkPath: string, explicitRigId: RigId | null): number {
  const absolute = resolve(checkPath);
  const spec = JSON.parse(readFileSync(absolute, "utf8")) as CandidateSpec;

  // A plough has no dimensional contract with the kernel; running this check on
  // one would report drift that is not a defect. Refusing is the whole point of
  // the asymmetry this tool encodes, so say so rather than emitting noise.
  if (spec.assetFamily !== "rig") {
    console.log(
      `${checkPath}: assetFamily is "${String(spec.assetFamily)}", not "rig".`,
    );
    console.log(
      "  No dimensional envelope applies. Only a rig's footprint, ride height, and\n" +
        "  wheel radii are simulation inputs; a part's dimensions are art direction,\n" +
        "  which is why a provisional confidence on them is honest rather than a bug.",
    );
    return 0;
  }

  const rigId = explicitRigId ?? spec.runtime?.adapter?.rigId;
  if (!isRigId(rigId)) {
    console.error(
      `${checkPath}: cannot tell which rig this reconstructs.\n` +
        "  Declare it as runtime.adapter.rigId, or pass --rig <id>.\n" +
        `  Known ids: ${RIG_IDS.join(", ")}.\n` +
        "  Not guessed from assetId on purpose: binding the wrong profile would\n" +
        "  produce a confident, wrong comparison, which is worse than no check.",
    );
    return 2;
  }

  const envelope = rigAssetEnvelope(rigId);
  let exitCode = 0;

  // Position comparison is only meaningful if both sides mean the same y = 0.
  const origin =
    typeof spec.coordinateFrame?.origin === "string"
      ? spec.coordinateFrame.origin
      : "";
  if (!looksGroundFramed(origin)) {
    console.error(
      `${checkPath}: coordinateFrame.origin does not read as the ground frame.`,
    );
    console.error(`  origin: ${origin || "(absent)"}`);
    console.error(
      "  Every position below is compared against y = 0 at the contact plane. A spec\n" +
        "  authored around its body origin instead will disagree by exactly rideHeight —\n" +
        "  the float this envelope exists to prevent. Fix the frame before reading the\n" +
        "  drift list, or it will be misleading. (Keyword heuristic: prose cannot be\n" +
        "  parsed, so a passing frame is the reviewer's call, not this tool's.)",
    );
    exitCode = 1;
  }

  const drift = compareEnvelope(
    envelope,
    candidatesFromSpecComponents(spec.components),
  );
  if (drift.length === 0) {
    console.log(
      `${checkPath}: matches the ${envelope.displayName} envelope ` +
        `(${envelope.nodes.length} derived nodes, ground frame).`,
    );
    console.log(
      "  Form, materials, and superstructure are unconstrained by this check — see\n" +
        "  the envelope's authorable list.",
    );
    return exitCode;
  }

  console.error(
    `${checkPath}: ${drift.length} disagreement(s) with the derived ` +
      `${envelope.displayName} envelope.`,
  );

  const uniform = diagnoseUniformOffset(envelope, drift);
  if (uniform) {
    console.error("");
    console.error(
      `  ONE CAUSE, not ${uniform.nodeIds.length}: every drift is the same ` +
        `${uniform.offset.toFixed(4)} offset on ${uniform.axis}.`,
    );
    if (uniform.matchesRideHeight) {
      console.error(
        `  That offset is this rig's rideHeight. The spec is authored around the body\n` +
          `  origin, not the contact plane — the exact float this envelope exists to catch.\n` +
          `  Re-author the frame; do not edit ${uniform.nodeIds.length} positions.`,
      );
    } else {
      console.error(
        "  A shared offset is a frame or origin error, not a set of independent\n" +
          "  mistakes. Fix the origin before touching individual nodes.",
      );
    }
  }

  console.error("");
  reportDrift(drift);
  console.error("");
  console.error(
    "These numbers are simulation inputs, not art direction. Reshape the model to\n" +
      "the profile, or change RIG_SILHOUETTES / RIG_PROFILES so the derivation moves\n" +
      "with it — do not edit the spec to match a mesh.",
  );
  return 1;
}

function main(): void {
  let options: CliOptions;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error((error as Error).message);
    process.exitCode = 2;
    return;
  }

  if (options.checkPath) {
    try {
      process.exitCode = runCheck(options.checkPath, options.explicitRigId);
    } catch (error) {
      console.error(`${options.checkPath}: ${(error as Error).message}`);
      process.exitCode = 2;
    }
    return;
  }

  const rigIds = options.rigIds.length > 0 ? options.rigIds : [...RIG_IDS];
  if (options.rigIds.length === 0) {
    console.log(
      "No rig id given — emitting all shipped rigs. " +
        "Pass a rig id, --all, or --check FILE.\n",
    );
  }

  const envelopes = rigIds.map((rigId) => rigAssetEnvelope(rigId));
  for (const envelope of envelopes) {
    for (const line of formatEnvelope(envelope)) console.log(line);
    console.log("");
  }

  if (options.outPath) {
    const payload = envelopes.length === 1 ? envelopes[0] : envelopes;
    writeFileSync(
      resolve(options.outPath),
      `${JSON.stringify(payload, null, 2)}\n`,
      "utf8",
    );
    console.log(`Wrote ${options.outPath}.`);
  }

  console.log(
    "Every number above is derived from RIG_PROFILES via rigBlockout(); none is\n" +
      "estimated from reference imagery. Author form against these, then audit with\n" +
      "--check so the reconstruction cannot quietly drift off the simulation.",
  );
}

main();
