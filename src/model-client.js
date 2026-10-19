"use strict";

/**
 * Model client config + call helper.
 *
 * DEFECT (unbounded retries): callModel ignores options.maxAttempts and retries
 * a failing transport up to an internal hard ceiling (50), not the caller's budget.
 *
 * DEFECT (no explicit model budget): getModelConfig does not expose maxTokens or
 * a monthly budget; buildModelRequest never attaches a token limit.
 */

function getModelConfig() {
  return {
    provider: "mock",
    model: "ops-assistant-small"
    // intentionally no maxTokens / monthlyBudgetUsd
  };
}

/**
 * @param {string} prompt
 * @param {{
 *   transport?: (prompt: string, attempt: number) => { ok: boolean, text?: string },
 *   maxAttempts?: number
 * }} [options]
 */
function callModel(prompt, options = {}) {
  const transport =
    options.transport ??
    (() => {
      throw new Error("transport required in offline starter");
    });
  // Defect: caller maxAttempts is ignored; internal ceiling is far above a sane default.
  const maxAttempts = 50;
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = transport(prompt, attempt);
      if (result && result.ok) {
        return { ok: true, text: result.text ?? "", attempts: attempt };
      }
      lastError = new Error(result?.error ?? "model call failed");
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError ?? new Error("model call failed");
}

/**
 * @param {string} prompt
 * @param {Record<string, unknown>} [overrides]
 */
function buildModelRequest(prompt, overrides = {}) {
  const config = getModelConfig();
  return {
    provider: config.provider,
    model: config.model,
    prompt,
    ...overrides
    // Defect: no maxTokens from config; no budget enforcement
  };
}

module.exports = { getModelConfig, callModel, buildModelRequest };
