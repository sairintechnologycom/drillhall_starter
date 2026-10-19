# Reference patch: shared retrieval collection

Filter procedure retrieval by requester tenant and environment, and never return sensitive-flagged entries.

## Application

The meta-test replaces each listed file with the fenced body below (`### path` then a `javascript` fence).

### src/procedures.js

```javascript
"use strict";

/**
 * Offline procedure corpus with tenant / environment / sensitivity filtering.
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
 * @param {{ tenantId?: string, environment?: string }} entry
 * @param {{ tenantId?: string, environment?: string }} context
 */
function isVisible(entry, context) {
  if (entry.sensitive) return false;
  if (context.tenantId && entry.tenantId !== context.tenantId) return false;
  if (context.environment && entry.environment !== context.environment) return false;
  return true;
}

/**
 * @param {string} procedureId
 * @param {{ tenantId?: string, environment?: string }} [context]
 */
function lookupProcedure(procedureId, context = {}) {
  const entry = CORPUS[procedureId];
  if (!entry) return null;
  if (!isVisible(entry, context)) return null;
  return { ...entry };
}

/**
 * @param {{ tenantId?: string, environment?: string }} [context]
 */
function listProcedures(context = {}) {
  return Object.values(CORPUS)
    .filter((entry) => isVisible(entry, context))
    .map((entry) => ({ ...entry }));
}

module.exports = { lookupProcedure, listProcedures, CORPUS };
```
