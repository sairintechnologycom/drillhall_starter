"use strict";

/**
 * Model client config + call helper.
 *
 * Every model call is bounded: a token limit on each request, a monthly spend ceiling in the config,
 * and a retry budget the caller sets (with a default and a hard cap) so a failing upstream cannot be
 * hammered without limit.
 */

const DEFAULT_MAX_ATTEMPTS = 3;
const HARD_MAX_ATTEMPTS = 5;

function getModelConfig() {
  return {
    provider: "mock",
    model: "ops-assistant-small",
    maxTokens: 1024,
    monthlyBudgetUsd: 100
  };
}

function attemptBudget(requested) {
  if (requested === undefined) return DEFAULT_MAX_ATTEMPTS;
  if (!Number.isInteger(requested) || requested < 1) {
    throw new Error("maxAttempts must be a positive integer");
  }
  return Math.min(requested, HARD_MAX_ATTEMPTS);
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
  const maxAttempts = attemptBudget(options.maxAttempts);
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
  const requested = overrides.maxTokens;
  return {
    provider: config.provider,
    model: config.model,
    prompt,
    ...overrides,
    // A caller may ask for fewer tokens, never more than the configured limit.
    maxTokens: Number.isInteger(requested) && requested > 0 ? Math.min(requested, config.maxTokens) : config.maxTokens
  };
}

module.exports = { getModelConfig, callModel, buildModelRequest };
