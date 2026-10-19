# Reference patch: missing rollback path

Register compensating handlers for mutable actions and invoke them on rollback to restore prior state.

## Application

The meta-test replaces each listed file with the fenced body below (`### path` then a `javascript` fence).

### src/executor.js

```javascript
"use strict";

/**
 * Action executor with compensating-action (rollback) support.
 * (Other starter defects may still be present; this patch only fixes rollback.)
 */

const executionLog = [];
const compensators = new Map();

const RESOURCE_OWNERS = Object.freeze({
  "app-service-a": "tenant-a",
  "app-service-b": "tenant-b",
  "kv-tenant-a": "tenant-a",
  "kv-tenant-b": "tenant-b"
});

function resetExecutorState() {
  executionLog.length = 0;
  compensators.clear();
}

/**
 * @param {string} action
 * @param {(entry: object) => unknown} handler
 */
function registerCompensatingAction(action, handler) {
  if (typeof action !== "string" || action.length === 0) {
    throw new Error("action is required");
  }
  if (typeof handler !== "function") {
    throw new Error("compensating handler must be a function");
  }
  compensators.set(action, handler);
}

/**
 * @param {{ id: string, action: string, tenantId?: string, resourceId?: string }} request
 * @param {{ run?: (action: string, request: object) => unknown }} [hooks]
 */
function executeAction(request, hooks = {}) {
  const run = hooks.run ?? ((action) => ({ action, status: "done" }));
  const result = run(request.action, request);
  executionLog.push({
    requestId: request.id,
    action: request.action,
    tenantId: request.tenantId,
    resourceId: request.resourceId,
    result,
    compensated: false
  });
  return { ok: true, requestId: request.id, result, replay: false };
}

/**
 * @param {string} requestId
 */
function rollbackAction(requestId) {
  const entry = executionLog.find((e) => e.requestId === requestId);
  if (!entry) {
    return { ok: false, requestId, compensated: false, error: "unknown request" };
  }
  if (entry.compensated) {
    return { ok: true, requestId, compensated: true, replay: true };
  }
  const handler = compensators.get(entry.action);
  if (!handler) {
    return { ok: false, requestId, compensated: false, error: "no compensating action registered" };
  }
  handler(entry);
  entry.compensated = true;
  return { ok: true, requestId, compensated: true };
}

function getExecutionLog() {
  return executionLog.slice();
}

function getResourceOwners() {
  return { ...RESOURCE_OWNERS };
}

module.exports = {
  executeAction,
  getExecutionLog,
  resetExecutorState,
  registerCompensatingAction,
  rollbackAction,
  getResourceOwners,
  RESOURCE_OWNERS
};
```
