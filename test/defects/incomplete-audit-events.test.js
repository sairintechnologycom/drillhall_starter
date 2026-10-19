"use strict";

const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { recordAudit, getAuditLog, resetAuditState } = require("../../src/audit");

describe("incomplete audit events", () => {
  beforeEach(() => {
    resetAuditState();
  });

  it("records actor and approval reference for a mutable action", () => {
    recordAudit({
      requestId: "req-1",
      action: "restart-service",
      mutable: true,
      outcome: "executed",
      actor: "casey",
      approvalId: "apr-1"
    });
    const entry = getAuditLog()[0];
    assert.equal(entry.actor, "casey", "mutable audit record must include the actor");
    assert.equal(entry.approvalId, "apr-1", "mutable audit record must reference its approval");
  });

  it("rejects a mutable-action record with no actor or approval", () => {
    assert.throws(
      () => recordAudit({ requestId: "req-2", action: "update-firewall", mutable: true, outcome: "executed" }),
      /actor|approval/i,
      "an evidence-free mutable audit record must be rejected"
    );
  });

  it("accepts a read-only record without approval evidence", () => {
    const entry = recordAudit({ requestId: "req-3", action: "read-status", mutable: false, outcome: "executed" });
    assert.equal(entry.requestId, "req-3");
  });
});
