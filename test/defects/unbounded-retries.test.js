"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { callModel } = require("../../src/model-client");

describe("unbounded retries", () => {
  it("honors maxAttempts and does not exceed the caller budget", () => {
    let calls = 0;
    const transport = () => {
      calls += 1;
      return { ok: false, error: "upstream unavailable" };
    };

    assert.throws(
      () => callModel("ping", { transport, maxAttempts: 3 }),
      /unavailable|failed/i
    );
    assert.equal(calls, 3, "transport must be invoked exactly maxAttempts times");
  });
});
