"use strict";

/**
 * Offline procedure lookup stub — no network, fixed corpus.
 *
 * Retrieval is partitioned: a caller sees only procedures for its own tenant and environment, and
 * sensitive-flagged entries are never returned to anyone. A caller that does not say which tenant and
 * environment it is gets nothing, so a missing context fails closed instead of reading the whole corpus.
 */

const CORPUS = Object.freeze({
  "restart-app-service": {
    id: "restart-app-service",
    title: "Restart App Service",
    tenantId: "tenant-a",
    environment: "nonprod",
    sensitive: false,
    steps: ["Confirm non-prod target", "Request approval", "Restart slot"]
  },
  "rotate-secret": {
    id: "rotate-secret",
    title: "Rotate secret",
    tenantId: "tenant-a",
    environment: "nonprod",
    sensitive: true,
    steps: ["Open vault ticket", "Rotate key", "Invalidate cache"],
    secretHint: "vault-path://prod/shared/api-key"
  },
  "tenant-b-scale-out": {
    id: "tenant-b-scale-out",
    title: "Scale out tenant B workload",
    tenantId: "tenant-b",
    environment: "nonprod",
    sensitive: false,
    steps: ["Confirm capacity", "Scale instances"]
  },
  "prod-failover": {
    id: "prod-failover",
    title: "Production failover",
    tenantId: "tenant-a",
    environment: "prod",
    sensitive: false,
    steps: ["Page on-call", "Failover region"]
  }
});

function visibleTo(entry, context) {
  return (
    typeof context.tenantId === "string" &&
    typeof context.environment === "string" &&
    entry.tenantId === context.tenantId &&
    entry.environment === context.environment &&
    entry.sensitive === false
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
