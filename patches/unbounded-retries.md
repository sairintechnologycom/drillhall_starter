# Reference patch: unbounded retries

Honor `options.maxAttempts` (default 3) instead of an internal hard ceiling.

## Application

The meta-test replaces each listed file with the fenced body below (`### path` then a `javascript` fence).

Budget fields stay absent so this patch is independent of `no-explicit-model-budget`.

### src/model-client.js

```javascript
"use strict";

/**
 * Model client with bounded retries.
 * Budget fields remain deliberately absent so this patch is independent.
 */

function getModelConfig() {
  return {
    provider: "mock",
    model: "ops-assistant-small"
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
  const maxAttempts =
    typeof options.maxAttempts === "number" && options.maxAttempts > 0
      ? Math.floor(options.maxAttempts)
      : 3;
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
  };
}

module.exports = { getModelConfig, callModel, buildModelRequest };
```
