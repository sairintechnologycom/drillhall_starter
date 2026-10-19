"use strict";

const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { executeAction, getExecutionLog, resetExecutorState } = require("../../src/executor");

describe("missing idempotency", () => {
  beforeEach(() => {
    resetExecutorState();
  });

  it("replays the same request id without re-running the side effect", () => {
    let sideEffects = 0;
    const run = () => {
      sideEffects += 1;
      return { status: "done", n: sideEffects };
    };

    const first = executeAction({ id: "req-1", action: "restart" }, { run });
    const second = executeAction({ id: "req-1", action: "restart" }, { run });

    assert.equal(sideEffects, 1, "side effect must run once for a repeated request id");
    assert.equal(first.replay, false);
    assert.equal(second.replay, true);
    assert.deepEqual(second.result, first.result);
    assert.equal(getExecutionLog().length, 1);
  });
});
