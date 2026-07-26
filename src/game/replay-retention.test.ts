import { describe, expect, it } from "vitest";

import { createRunRecord } from "./run-record";
import { validateDeterministicReplay } from "./replay-validator";

describe("replay retention contract", () => {
  it("refuses to certify replay when retained history no longer starts at the captured context", () => {
    const record = createRunRecord("field-02", 4174);
    record.droppedEntries = 1;

    expect(validateDeterministicReplay(record)).toMatchObject({
      ok: false,
      status: "truncated-record",
      commandsApplied: 0,
      inputsApplied: 0,
      checkpointsVerified: 0,
      finalTickHash: null,
      issues: [
        {
          sequence: null,
          code: "truncated-record",
          message:
            "Run record dropped 1 replay entry and cannot replay from its captured initial context.",
        },
      ],
    });
  });
});
