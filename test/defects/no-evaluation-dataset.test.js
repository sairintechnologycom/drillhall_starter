"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const { join } = require("node:path");

const datasetPath = join(__dirname, "../../eval/dataset.json");

describe("no evaluation dataset", () => {
  it("ships a golden eval/dataset.json with request→expected-recommendation cases", () => {
    assert.ok(existsSync(datasetPath), "eval/dataset.json must exist");
    const dataset = JSON.parse(readFileSync(datasetPath, "utf8"));
    assert.ok(Array.isArray(dataset.cases), "dataset.cases must be an array");
    assert.ok(dataset.cases.length >= 3, "golden dataset must include at least 3 cases");
    for (const c of dataset.cases) {
      assert.equal(typeof c.id, "string");
      assert.equal(typeof c.request, "object");
      assert.equal(typeof c.expectedRecommendation, "string");
    }
  });

  it("exposes a deterministic offline runEvaluation() scorer", () => {
    // eslint-disable-next-line import/no-unresolved -- present after the reference patch
    const { runEvaluation } = require("../../src/evaluation");
    assert.equal(typeof runEvaluation, "function");
    const report = runEvaluation();
    assert.equal(typeof report.total, "number");
    assert.equal(typeof report.passed, "number");
    assert.equal(typeof report.failed, "number");
    assert.ok(report.total >= 3, "evaluation must score the golden cases");
    assert.equal(report.passed + report.failed, report.total);
    assert.equal(report.failed, 0, "shipped golden cases must pass the recommendation path");
  });
});
