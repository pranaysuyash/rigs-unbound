#!/usr/bin/env node
/**
 * Export the authored Field Plough 01 model through the canonical browser
 * review harness and Three's GLTFExporter.
 *
 * The review harness is the source of the browser-resolved module graph. This
 * avoids a second Node/TypeScript loading path and keeps the exported model
 * identical to the one used for visual review. The output is a derived runtime
 * artifact only. It does not promote the asset in any manifest.
 */

const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const projectRoot = path.resolve(__dirname, "..");
const canonicalPort = 4173;
const reviewUrl = `http://127.0.0.1:${canonicalPort}/assets/workbench/field-plough-01/review/index.html`;
const defaultOutputPath = path.join(
  projectRoot,
  "assets/runtime/field-plough-01.glb",
);

function parseArgs(argv) {
  const args = [...argv];
  let outputPath = defaultOutputPath;
  while (args.length > 0) {
    const argument = args.shift();
    if (argument === "--output") {
      const value = args.shift();
      if (!value) throw new Error("--output requires a path.");
      outputPath = path.resolve(projectRoot, value);
      continue;
    }
    if (argument === "--help" || argument === "-h") {
      console.log(
        "Usage: node tools/export-field-plough-glb.cjs [--output assets/runtime/field-plough-01.glb]",
      );
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  return outputPath;
}

function assertInsideProject(filePath) {
  const relative = path.relative(projectRoot, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Output must remain inside the repository: ${filePath}`);
  }
}

function inspectGlb(buffer) {
  if (buffer.length < 20)
    throw new Error("Exported GLB is shorter than its header.");
  if (buffer.toString("ascii", 0, 4) !== "glTF") {
    throw new Error("Exported file does not have a glTF binary header.");
  }
  const version = buffer.readUInt32LE(4);
  const declaredLength = buffer.readUInt32LE(8);
  if (version !== 2) throw new Error(`Unsupported GLB version: ${version}`);
  if (declaredLength !== buffer.length) {
    throw new Error(
      `GLB length mismatch: header=${declaredLength}, actual=${buffer.length}`,
    );
  }

  const jsonChunkLength = buffer.readUInt32LE(12);
  const jsonChunkType = buffer.toString("ascii", 16, 20);
  if (jsonChunkType !== "JSON") throw new Error("GLB JSON chunk is missing.");
  const jsonStart = 20;
  const jsonEnd = jsonStart + jsonChunkLength;
  const json = JSON.parse(buffer.toString("utf8", jsonStart, jsonEnd).trim());
  if (json.asset?.version !== "2.0") {
    throw new Error("GLB JSON does not declare glTF asset version 2.0.");
  }
  return {
    assetVersion: json.asset.version,
    sceneCount: Array.isArray(json.scenes) ? json.scenes.length : 0,
    nodeCount: Array.isArray(json.nodes) ? json.nodes.length : 0,
    meshCount: Array.isArray(json.meshes) ? json.meshes.length : 0,
    materialCount: Array.isArray(json.materials) ? json.materials.length : 0,
  };
}

async function exportFromHarness(page) {
  return page.evaluate(async () => {
    const review = window.fieldPloughReview;
    if (!review?.model)
      throw new Error("Field-plough review model is unavailable.");

    const { GLTFExporter } =
      await import("/node_modules/three/examples/jsm/exporters/GLTFExporter.js");
    review.model.updateMatrixWorld(true);
    const exporter = new GLTFExporter();
    const result = await exporter.parseAsync(review.model, {
      binary: true,
      embedImages: true,
      onlyVisible: true,
      trs: false,
    });
    if (!(result instanceof ArrayBuffer)) {
      throw new Error("GLTFExporter returned JSON instead of binary GLB data.");
    }

    const bytes = new Uint8Array(result);
    let binary = "";
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(
        ...bytes.subarray(offset, offset + chunkSize),
      );
    }
    return btoa(binary);
  });
}

async function main() {
  const outputPath = parseArgs(process.argv.slice(2));
  assertInsideProject(outputPath);
  if (path.extname(outputPath).toLowerCase() !== ".glb") {
    throw new Error(`Output must use the .glb extension: ${outputPath}`);
  }

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    await page.goto(reviewUrl, { waitUntil: "networkidle" });
    await page.waitForFunction(() => Boolean(window.fieldPloughReview?.model));
    const encoded = await exportFromHarness(page);
    if (consoleErrors.length > 0) {
      throw new Error(
        `Browser review emitted errors: ${consoleErrors.join(" | ")}`,
      );
    }

    const buffer = Buffer.from(encoded, "base64");
    const inspection = inspectGlb(buffer);
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    let wrote = true;
    try {
      const existing = await fs.readFile(outputPath);
      if (existing.equals(buffer)) wrote = false;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (wrote) await fs.writeFile(outputPath, buffer);

    console.log(
      JSON.stringify(
        {
          outputPath: path.relative(projectRoot, outputPath),
          bytes: buffer.length,
          sha256: hash,
          wrote,
          ...inspection,
          source: reviewUrl,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(`[field-plough-glb-export] ${error.stack || error.message}`);
  process.exitCode = 1;
});
