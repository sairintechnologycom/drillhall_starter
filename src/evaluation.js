"use strict";

/**
 * Offline evaluation runner: scores the golden cases in eval/dataset.json through the real retrieval
 * and recommendation path. Deterministic and offline, so it can run in CI. A case passes when the
 * recommendation matches the expected one, and refusal cases pass only when nothing is recommended.
 */

const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { listProcedures } = require("./procedures");
const { buildRecommendation } = require("./recommendations");

const NO_RECOMMENDATION = "NO_RECOMMENDATION";

function loadDataset(path = join(__dirname, "../eval/dataset.json")) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** The recommendation this service would give for one golden case. */
function recommend(request) {
  const retrieved = listProcedures({ tenantId: request.tenantId, environment: request.environment });
  const procedure = retrieved.find((entry) => entry.id === request.procedureId);
  if (!procedure) return NO_RECOMMENDATION;
  const built = buildRecommendation(
    { text: `Follow procedure: ${procedure.title}`, citations: [procedure.id] },
    retrieved
  );
  return built.ok ? built.text : NO_RECOMMENDATION;
}

function runEvaluation(dataset = loadDataset()) {
  const results = dataset.cases.map((c) => {
    const actual = recommend(c.request);
    return { id: c.id, passed: actual === c.expectedRecommendation, expected: c.expectedRecommendation, actual };
  });
  const passed = results.filter((r) => r.passed).length;
  return { total: results.length, passed, failed: results.length - passed, results };
}

module.exports = { runEvaluation, recommend, loadDataset };
