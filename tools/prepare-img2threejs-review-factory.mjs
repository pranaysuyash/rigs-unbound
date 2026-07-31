#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const args = process.argv.slice(2);
const inputIndex = args.indexOf("--input");
const inputPath = inputIndex >= 0 ? args[inputIndex + 1] : null;

if (!inputPath) {
  console.error(
    "Usage: prepare-img2threejs-review-factory.mjs --input <factory.ts>",
  );
  process.exit(1);
}

const source = await readFile(inputPath, "utf8");
const pattern =
  /const (endpoint_[A-Za-z0-9_]+) = makeAttachmentEndpoint\((attachment_[A-Za-z0-9_]+)\);/g;
let replacements = 0;
const prepared = source.replace(
  pattern,
  (_match, endpointName, attachmentName) => {
    replacements += 1;
    return `// Keep ${attachmentName} in sculpt metadata; visual review uses authored component geometry.\n  const ${endpointName} = makeAttachmentEndpoint(null);`;
  },
);

if (replacements === 0) {
  throw new Error(`No attachment endpoint declarations found in ${inputPath}`);
}

await writeFile(inputPath, prepared);
console.log(
  `Prepared ${inputPath}: disabled ${replacements} endpoint-cylinder substitutions for visual review.`,
);
