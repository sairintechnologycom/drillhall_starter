"use strict";

/**
 * Offline procedure lookup stub — no network, fixed corpus.
 *
 * Retrieval is partitioned: a caller sees only procedures for its own tenant and environment, and
 * sensitive-flagged entries and withdrawn (non-approved) procedures are never returned to anyone. A caller that does not say which tenant and
 * environment it is gets nothing, so a missing context fails closed instead of reading the whole corpus.
 */

const CORPUS = Object.freeze({
  "restart-app-service": {
    id: "restart-app-service",
    title: "Restart App Service",
    tenantId: "tenant-a",
    environment: "nonprod",
    sensitive: false,
    status: "approved",
    steps: ["Confirm non-prod target", "Request approval", "Restart slot"]
  },
  "rotate-secret": {
    id: "rotate-secret",
    title: "Rotate secret",
    tenantId: "tenant-a",
    environment: "nonprod",
    sensitive: true,
    status: "approved",
    steps: ["Open vault ticket", "Rotate key", "Invalidate cache"],
    secretHint: "vault-path://prod/shared/api-key"
  },
  "tenant-b-scale-out": {
    id: "tenant-b-scale-out",
    title: "Scale out tenant B workload",
    tenantId: "tenant-b",
    environment: "nonprod",
    sensitive: false,
    status: "approved",
    steps: ["Confirm capacity", "Scale instances"]
  },
  "prod-failover": {
    id: "prod-failover",
    title: "Production failover",
    tenantId: "tenant-a",
    environment: "prod",
    sensitive: false,
    status: "approved",
    steps: ["Page on-call", "Failover region"]
  },
  // A runbook withdrawn after review. It stays in the corpus so the gate below is exercised, but it
  // must never reach the model: it recommends opening a broad inbound range.
  "legacy-firewall-change": {
    id: "legacy-firewall-change",
    title: "Open inbound range on a subnet (withdrawn)",
    tenantId: "tenant-a",
    environment: "nonprod",
    sensitive: false,
    status: "retired",
    steps: ["Open 0.0.0.0/0 inbound", "Restart gateway"]
  }
});

function visibleTo(entry, context) {
  return (
    typeof context.tenantId === "string" &&
    typeof context.environment === "string" &&
    entry.tenantId === context.tenantId &&
    entry.environment === context.environment &&
    entry.sensitive === false &&
    // Only procedures still approved are retrievable, so a withdrawn runbook cannot be cited as current.
    entry.status === "approved"
  );
}

/**
 * @param {string} procedureId
 * @param {{ tenantId?: string, environment?: string }} [context]
 */
function lookupProcedure(procedureId, context = {}) {
  const entry = Object.hasOwn(CORPUS, procedureId) ? CORPUS[procedureId] : undefined;
  return entry && visibleTo(entry, context) ? entry : null;
}

/**
 * @param {{ tenantId?: string, environment?: string }} [context]
 */
function listProcedures(context = {}) {
  return Object.values(CORPUS)
    .filter((entry) => visibleTo(entry, context))
    .map((entry) => ({ ...entry }));
}

module.exports = { lookupProcedure, listProcedures, CORPUS };
