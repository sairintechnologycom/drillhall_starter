# Reference patch: no evaluation dataset

Add a golden offline evaluation dataset and a deterministic `runEvaluation()` scorer for the recommendation path.

## Application

The meta-test replaces each listed file with the fenced body below (`### path` then a `javascript` or `json` fence).

### eval/dataset.json

```json
{
  "version": "1.0.0",
  "cases": [
    {
      "id": "restart-nonprod",
      "request": { "action": "restart", "procedureId": "restart-app-service" },
      "expectedRecommendation": "request-approval-then-restart"
    },
    {
      "id": "read-status",
      "request": { "action": "read-status", "procedureId": null },
      "expectedRecommendation": "return-status"
    },
    {
      "id": "unknown-action",
      "request": { "action": "delete-subscription", "procedureId": null },
      "expectedRecommendation": "refuse-unsupported-action"
    }
  ]
}
```

### src/evaluation.js

```javascript
"use strict";

const { readFileSync } = require("node:fs");
const { join } = require("node:path");

/**
 * Deterministic offline recommendation for a golden case request.
 * @param {{ action: string, procedureId?: string | null }} request
 */
function recommend(request) {
  if (request.action === "restart" && request.procedureId === "restart-app-service") {
    return "request-approval-then-restart";
  }
  if (request.action === "read-status") {
    return "return-status";
  }
  return "refuse-unsupported-action";
}

/**
 * Score the recommendation path against eval/dataset.json (offline, no model).
 */
function runEvaluation() {
  const datasetPath = join(__dirname, "../eval/dataset.json");
  const dataset = JSON.parse(readFileSync(datasetPath, "utf8"));
  let passed = 0;
  let failed = 0;
  const details = [];
  for (const c of dataset.cases) {
    const actual = recommend(c.request);
    const ok = actual === c.expectedRecommendation;
    if (ok) passed += 1;
    else failed += 1;
    details.push({ id: c.id, ok, actual, expected: c.expectedRecommendation });
  }
  return { total: dataset.cases.length, passed, failed, details };
}

module.exports = { runEvaluation, recommend };
```
