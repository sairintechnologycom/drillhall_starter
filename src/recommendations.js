"use strict";

/**
 * Recommendation builder: turns model output plus the retrieval result set
 * into a recommendation the service can act on.
 *
 * DEFECT (unverified-citations): accepts any citation list — including ids
 * that were never retrieved and empty lists — and returns `{ ok: true, ... }`
 * regardless. A production-minded builder must require at least one citation
 * and every cited id to be a member of the retrieved set; unverifiable
 * citations must yield a rejection, never a recommendation.
 */

/**
 * @param {{ text: string, citations?: string[] }} modelOutput
 * @param {Array<{ id: string }>} retrievedProcedures
 * @returns {{ ok: true, text: string, citations: string[] } | { ok: false, error: string }}
 */
function buildRecommendation(modelOutput, retrievedProcedures) {
  // DEFECT: retrievedProcedures is ignored; fabricated and empty citations pass through.
  void retrievedProcedures;
  const citations = Array.isArray(modelOutput.citations) ? [...modelOutput.citations] : [];
  return {
    ok: true,
    text: modelOutput.text,
    citations
  };
}

module.exports = { buildRecommendation };
