"use strict";

// Regression test for the outdated-runbook incident: a withdrawn procedure reached the model and
// produced a confident, wrong firewall recommendation. This fails if the retrieval status gate is removed.

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { listProcedures, lookupProcedure, CORPUS } = require("../../src/procedures");
const { buildRecommendation } = require("../../src/recommendations");

const context = { tenantId: "tenant-a", environment: "nonprod" };

describe("outdated runbook cannot recur", () => {
  it("keeps the withdrawn runbook in the corpus so this test exercises the gate", () => {
    assert.equal(CORPUS["legacy-firewall-change"].status, "retired");
  });

  it("never lists or looks up a retired procedure, even for its own tenant and environment", () => {
    assert.ok(!listProcedures(context).some((entry) => entry.id === "legacy-firewall-change"));
    assert.equal(lookupProcedure("legacy-firewall-change", context), null);
  });

  it("cannot cite the retired procedure, because it is never in the retrieved set", () => {
    const retrieved = listProcedures(context);
    const result = buildRecommendation(
      { text: "Open the inbound range as the runbook says.", citations: ["legacy-firewall-change"] },
      retrieved
    );
    assert.equal(result.ok, false);
    assert.equal(result.error, "UNVERIFIED_CITATION");
  });

  it("still serves the approved procedures", () => {
    assert.equal(lookupProcedure("restart-app-service", context)?.id, "restart-app-service");
  });
});
