"use strict";

/**
 * Action executor.
 *
 * DEFECT (missing idempotency): every call with the same request id is executed
 * again. A production-minded executor must treat request id as an idempotency
 * key and return the prior result on replay without re-running the side effect.
 *
 * DEFECT (incomplete tenant authorization): a tenant→resource ownership map is
 * present, but executeAction never consults it. Any tenant can run an action
 * against any resource. Production-minded authorization must reject
 * cross-tenant resource access.
 *
 * DEFECT (missing rollback path): there is no compensating-action registry and
 * no rollback path. Mutable actions must register a compensating handler so a
 * failed or rolled-back action can restore prior state.
 */

const executionLog = [];

/** Seed ownership map — intentionally unused by executeAction (tenant auth defect). */
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
  // DEFECT: RESOURCE_OWNERS is never checked — cross-tenant access succeeds.
  // DEFECT: no compensating handlers registered or invoked on failure/rollback.
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
 * Intended compensating-action registration — shipped as a no-op (rollback defect).
 * @param {string} _action
 * @param {(entry: object) => unknown} _handler
 */
function registerCompensatingAction(_action, _handler) {
  // DEFECT: registration is discarded.
}

/**
 * Intended rollback — shipped as a no-op that does not restore state.
 * @param {string} requestId
 */
function rollbackAction(requestId) {
  // DEFECT: no compensating handler is invoked; prior state is not restored.
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
