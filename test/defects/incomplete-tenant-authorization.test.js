"use strict";

const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const {
  executeAction,
  resetExecutorState,
  getResourceOwners
} = require("../../src/executor");

describe("incomplete tenant authorization", () => {
  beforeEach(() => {
    resetExecutorState();
  });

  it("exposes a tenant→resource ownership map for authorization", () => {
    const owners = getResourceOwners();
    assert.equal(owners["app-service-a"], "tenant-a");
    assert.equal(owners["app-service-b"], "tenant-b");
  });

  it("rejects a request from tenant A against tenant B's resource", () => {
    const result = executeAction({
      id: "req-xtenant",
      action: "restart",
      tenantId: "tenant-a",
      resourceId: "app-service-b"
    });
    assert.equal(result.ok, false, "cross-tenant resource access must be rejected");
    assert.match(String(result.error ?? result.reason ?? ""), /tenant|owner|authoriz/i);
  });

  it("allows a same-tenant request against an owned resource", () => {
    const result = executeAction({
      id: "req-same",
      action: "restart",
      tenantId: "tenant-a",
      resourceId: "app-service-a"
    });
    assert.equal(result.ok, true, "same-tenant resource access must succeed");
  });
});
