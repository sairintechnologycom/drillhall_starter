"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { authorizeTool, listTools } = require("../../src/tools");

describe("broad tool permissions", () => {
  it("never grants mutable tools to a read-only role", () => {
    assert.equal(authorizeTool("reader", "read-status"), true, "reader keeps read access");
    assert.equal(authorizeTool("reader", "restart-service"), false, "reader must not restart services");
    assert.equal(authorizeTool("reader", "update-firewall"), false, "reader must not change firewalls");
  });

  it("grants an operator only the tools its job needs", () => {
    assert.equal(authorizeTool("operator", "restart-service"), true, "operator restarts services");
    assert.equal(authorizeTool("operator", "update-firewall"), false, "firewall changes need the network role");
  });

  it("grants nothing to an unknown role", () => {
    for (const tool of listTools()) {
      assert.equal(authorizeTool("intruder", tool), false, `unknown role must not use ${tool}`);
    }
  });
});
