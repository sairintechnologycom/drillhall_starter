"use strict";

/**
 * Offline procedure lookup stub — no network, fixed corpus.
 *
 * DEFECT (shared retrieval collection): one shared corpus is returned to every
 * caller. Entries carry tenantId, environment, and sensitive markers, but
 * listProcedures / lookupProcedure ignore them. A production-minded retrieval
 * path must partition by tenant and environment and never return
 * sensitive-flagged entries to the model or another tenant.
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

/**
 * @param {string} procedureId
 * @param {{ tenantId?: string, environment?: string }} [_context]
 */
function lookupProcedure(procedureId, _context = {}) {
  // DEFECT: context is ignored; any id is returned including sensitive/cross-tenant.
  return CORPUS[procedureId] ?? null;
}

/**
 * @param {{ tenantId?: string, environment?: string }} [_context]
 */
function listProcedures(_context = {}) {
  // DEFECT: returns the full shared corpus with no tenant/environment/sensitivity filter.
  return Object.values(CORPUS).map((entry) => ({ ...entry }));
}

module.exports = { lookupProcedure, listProcedures, CORPUS };
