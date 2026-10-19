"use strict";

const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { issueApproval, verifyApproval, resetApprovalState } = require("../../src/approvals");

describe("missing approval binding", () => {
  beforeEach(() => {
    resetApprovalState();
  });

  it("rejects an approval issued for a different request", () => {
    const approval = issueApproval({ requestId: "req-1", action: "restart-service", approver: "casey" });
    assert.equal(verifyApproval(approval, { id: "req-1", action: "restart-service" }), true);
    assert.equal(
      verifyApproval(approval, { id: "req-2", action: "restart-service" }),
      false,
      "approval must be bound to its request id"
    );
  });

  it("rejects an approval issued for a different action", () => {
    const approval = issueApproval({ requestId: "req-3", action: "restart-service", approver: "casey" });
    assert.equal(
      verifyApproval(approval, { id: "req-3", action: "update-firewall" }),
      false,
      "approval must be bound to its action"
    );
  });

  it("consumes an approval on first use", () => {
    const approval = issueApproval({ requestId: "req-4", action: "restart-service", approver: "casey" });
    assert.equal(verifyApproval(approval, { id: "req-4", action: "restart-service" }), true);
    assert.equal(
      verifyApproval(approval, { id: "req-4", action: "restart-service" }),
      false,
      "an approval must not be reusable"
    );
  });

  it("rejects a forged approval object", () => {
    assert.equal(
      verifyApproval({ approved: true }, { id: "req-5", action: "update-firewall" }),
      false,
      "an unissued object must never verify"
    );
  });
});
