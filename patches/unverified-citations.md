# Reference patch: unverified citations

Require every cited id to be a member of the retrieved procedure set and reject empty citation lists.

## Application

The meta-test replaces each listed file with the fenced body below (`### path` then a `javascript` fence).

### src/recommendations.js

```javascript
"use strict";

/**
 * Recommendation builder: model output must cite retrieved procedures only.
 */

/**
 * @param {{ text: string, citations?: string[] }} modelOutput
 * @param {Array<{ id: string }>} retrievedProcedures
 * @returns {{ ok: true, text: string, citations: string[] } | { ok: false, error: string }}
 */
function buildRecommendation(modelOutput, retrievedProcedures) {
  const citations = Array.isArray(modelOutput.citations) ? [...modelOutput.citations] : [];
  if (citations.length === 0) {
    return { ok: false, error: "UNVERIFIED_CITATION" };
  }
  const retrievedIds = new Set((retrievedProcedures ?? []).map((entry) => entry.id));
  for (const id of citations) {
    if (!retrievedIds.has(id)) {
      return { ok: false, error: "UNVERIFIED_CITATION" };
    }
  }
  return {
    ok: true,
    text: modelOutput.text,
    citations
  };
}

module.exports = { buildRecommendation };
```
