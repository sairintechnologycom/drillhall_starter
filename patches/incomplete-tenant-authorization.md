# Reference patch: incomplete tenant authorization

Bind each action to the tenant that owns the target resource. Reject cross-tenant access; allow same-tenant access.

## Application

The meta-test replaces each listed file with the fenced body below (`### path` then a `javascript` fence).

### src/executor.js

```javascript
"use strict";

/**
 * Action executor with tenant→resource authorization.
 * (Other starter defects may still be present; this patch only fixes tenant auth.)
 */

const executionLog = [];

const RESOURCE_OWNERS = Object.freeze({
  "app-service-a": "tenant-a",
  "app-service-b": "tenant-b",
  "kv-tenant-a": "tenant-a",
  "kv-tenant-b": "tenant-b"
});

function resetExecutorState() {
  executionLog.length = 0;
}

/**
 * @param {{ id: string, action: string, tenantId?: string, resourceId?: string }} request
 * @param {{ run?: (action: string, request: object) => unknown }} [hooks]
 */
function executeAction(request, hooks = {}) {
  if (request.resourceId) {
    const owner = RESOURCE_OWNERS[request.resourceId];
    if (!owner) {
      return {
        ok: false,
        requestId: request.id,
        error: "unknown resource: authorization denied",
        reason: "unknown resource"
      };
    }
    if (request.tenantId !== owner) {
      return {
        ok: false,
        requestId: request.id,
        error: "tenant is not the resource owner: authorization denied",
        reason: "tenant authorization failed"
      };
    }
  }

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

function registerCompensatingAction(_action, _handler) {}

function rollbackAction(requestId) {
  return { ok: false, requestId, compensated: false };
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
