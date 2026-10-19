"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { buildRecommendation } = require("../../src/recommendations");

const RETRIEVED = Object.freeze([
  { id: "restart-app-service", title: "Restart App Service" },
  { id: "scale-out", title: "Scale out" }
]);

describe("unverified citations", () => {
  it("rejects a citation id that was never retrieved", () => {
    const result = buildRecommendation(
      {
        text: "Restart the non-prod app service using the documented procedure.",
        citations: ["restart-app-service", "fabricated-procedure-id"]
      },
      RETRIEVED
    );
    assert.equal(result.ok, false, "fabricated citation ids must be rejected");
    assert.equal(result.error, "UNVERIFIED_CITATION");
  });

  it("rejects an empty citation list", () => {
    const result = buildRecommendation(
      {
        text: "I recommend a restart.",
        citations: []
      },
      RETRIEVED
    );
    assert.equal(result.ok, false, "recommendations must cite at least one retrieved procedure");
    assert.equal(result.error, "UNVERIFIED_CITATION");
  });

  it("accepts a recommendation whose citations are all members of the retrieved set", () => {
    const result = buildRecommendation(
      {
        text: "Restart the non-prod app service using the documented procedure.",
        citations: ["restart-app-service"]
      },
      RETRIEVED
    );
    assert.equal(result.ok, true, "verified citations must pass through");
    assert.deepEqual(result.citations, ["restart-app-service"]);
    assert.equal(typeof result.text, "string");
    assert.ok(result.text.length > 0);
  });
});
