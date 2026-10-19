"use strict";

/**
 * Recommendation builder: turns model output plus the retrieval result set into a recommendation
 * the service can act on.
 *
 * A recommendation must cite at least one procedure, and every cited id must be one that was actually
 * retrieved for this request. Anything unverifiable is rejected, never passed through as a recommendation.
 */

/**
 * @param {{ text: string, citations?: string[] }} modelOutput
 * @param {Array<{ id: string }>} retrievedProcedures
 * @returns {{ ok: true, text: string, citations: string[] } | { ok: false, error: string }}
 */
function buildRecommendation(modelOutput, retrievedProcedures) {
  const citations = Array.isArray(modelOutput?.citations) ? [...modelOutput.citations] : [];
  const retrieved = new Set((retrievedProcedures ?? []).map((procedure) => procedure.id));
  const verified = citations.length > 0 && citations.every((id) => typeof id === "string" && retrieved.has(id));
  if (!verified) return { ok: false, error: "UNVERIFIED_CITATION" };
  return { ok: true, text: modelOutput.text, citations };
}

module.exports = { buildRecommendation };
