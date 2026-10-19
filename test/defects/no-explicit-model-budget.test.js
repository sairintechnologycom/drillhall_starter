"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { getModelConfig, buildModelRequest } = require("../../src/model-client");

describe("no explicit model budget", () => {
  it("exposes maxTokens and monthlyBudgetUsd on model config", () => {
    const config = getModelConfig();
    assert.equal(typeof config.maxTokens, "number");
    assert.ok(config.maxTokens > 0, "maxTokens must be a positive number");
    assert.equal(typeof config.monthlyBudgetUsd, "number");
    assert.ok(config.monthlyBudgetUsd > 0, "monthlyBudgetUsd must be a positive number");
  });

  it("attaches maxTokens from config on every model request", () => {
    const config = getModelConfig();
    const request = buildModelRequest("summarize ticket");
    assert.equal(typeof request.maxTokens, "number");
    assert.ok(request.maxTokens > 0, "request.maxTokens must be a positive number");
    assert.equal(request.maxTokens, config.maxTokens);
  });
});
