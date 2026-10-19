# Reference patch: no explicit model budget

Expose `maxTokens` and `monthlyBudgetUsd` on model config and attach `maxTokens` to every request.

## Application

The meta-test replaces each listed file with the fenced body below (`### path` then a `javascript` fence).

Note: this patch also includes bounded retries so applying only the budget patch still leaves the retry defect if applied alone — the meta-test applies patches independently against a fresh starter copy. Budget tests only assert config/request fields.

### src/model-client.js

```javascript
"use strict";

/**
 * Model client with explicit budget fields.
 * Retries remain deliberately unbounded here so the budget patch is independent
 * of the unbounded-retries patch (meta-test applies each patch alone).
 */

function getModelConfig() {
  return {
    provider: "mock",
    model: "ops-assistant-small",
    maxTokens: 512,
    monthlyBudgetUsd: 50
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
  // Intentionally still defective on retries when this patch is applied alone.
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
    maxTokens: config.maxTokens,
    ...overrides
  };
}

module.exports = { getModelConfig, callModel, buildModelRequest };
```
