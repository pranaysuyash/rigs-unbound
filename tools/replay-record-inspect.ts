import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { RunRecord } from "../src/game/run-record";
import { validateDeterministicReplay } from "../src/game/replay-validator";

const recordPath = process.argv[2];
if (!recordPath) {
  console.error(
    "Usage: npx vite-node tools/replay-record-inspect.ts <run-record.json>",
  );
  process.exitCode = 2;
} else {
  const absolutePath = resolve(recordPath);
  const record = JSON.parse(readFileSync(absolutePath, "utf8")) as RunRecord;
  const validation = validateDeterministicReplay(record);
  console.log(
    JSON.stringify(
      {
        recordPath: absolutePath,
        schemaVersion: record.schemaVersion,
        entries: record.entries.length,
        validation,
      },
      null,
      2,
    ),
  );
  if (!validation.ok) process.exitCode = 1;
}
