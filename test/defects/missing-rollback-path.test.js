"use strict";

const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const {
  executeAction,
  getExecutionLog,
  resetExecutorState,
  registerCompensatingAction,
  rollbackAction
} = require("../../src/executor");

describe("missing rollback path", () => {
  beforeEach(() => {
    resetExecutorState();
  });

  it("invokes a registered compensating handler on rollback and restores prior state", () => {
    const state = { count: 0 };
    registerCompensatingAction("increment", (entry) => {
      state.count -= 1;
      return { restoredFrom: entry.requestId };
    });

    const run = (action) => {
      if (action === "increment") {
        state.count += 1;
        return { status: "done", count: state.count };
      }
      return { status: "done" };
    };

    const executed = executeAction(
      { id: "req-rb-1", action: "increment", tenantId: "tenant-a", resourceId: "app-service-a" },
      { run }
    );
    assert.equal(executed.ok, true);
    assert.equal(state.count, 1, "side effect must have applied");

    const rolled = rollbackAction("req-rb-1");
    assert.equal(rolled.ok, true, "rollback must succeed when a compensator is registered");
    assert.equal(rolled.compensated, true);
    assert.equal(state.count, 0, "compensating handler must restore prior state");

    const log = getExecutionLog();
    const entry = log.find((e) => e.requestId === "req-rb-1");
    assert.ok(entry, "execution log must retain the original action");
    assert.equal(entry.compensated, true, "execution log must record compensation");
  });

  it("requires every mutable action used in the log to have a registered compensator before success", () => {
    // After a successful execute+rollback cycle above, unregistered actions must not silently succeed rollback.
    const result = executeAction(
      { id: "req-rb-2", action: "restart", tenantId: "tenant-a", resourceId: "app-service-a" },
      { run: () => ({ status: "done" }) }
    );
    assert.equal(result.ok, true);
    const rolled = rollbackAction("req-rb-2");
    assert.equal(rolled.ok, false, "rollback without a compensator must fail closed");
    assert.equal(rolled.compensated, false);
  });
});
