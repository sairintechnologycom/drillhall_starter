"use strict";

/**
 * Action executor.
 *
 * - Idempotent on request id: a repeated id returns the prior result without re-running the action.
 * - Tenant-authorized: a request that names a resource must come from the tenant that owns it.
 * - Reversible: mutable actions register a compensating handler, and rollback runs it. An action with
 *   no registered compensator fails closed instead of pretending to roll back.
 */

const executionLog = [];
const resultsByRequestId = new Map();
const compensators = new Map();

/** Which tenant owns which resource. Consulted by executeAction. */
const RESOURCE_OWNERS = Object.freeze({
  "app-service-a": "tenant-a",
  "app-service-b": "tenant-b",
  "kv-tenant-a": "tenant-a",
  "kv-tenant-b": "tenant-b"
});

function resetExecutorState() {
  executionLog.length = 0;
  resultsByRequestId.clear();
}

/**
 * @param {{ id: string, action: string, tenantId?: string, resourceId?: string }} request
 * @param {{ run?: (action: string, request: object) => unknown }} [hooks]
 */
function executeAction(request, hooks = {}) {
  // Authorize before anything else, and never cache a refusal: the same id may be retried legitimately.
  if (request.resourceId !== undefined) {
    const owner = RESOURCE_OWNERS[request.resourceId];
    if (owner === undefined || owner !== request.tenantId) {
      return {
        ok: false,
        requestId: request.id,
        error: "tenant authorization failed: resource is not owned by the requesting tenant",
        replay: false
      };
    }
  }

  const prior = resultsByRequestId.get(request.id);
  if (prior !== undefined) {
    return { ok: true, requestId: request.id, result: prior, replay: true };
  }

  const run = hooks.run ?? ((action) => ({ action, status: "done" }));
  const result = run(request.action, request);
  resultsByRequestId.set(request.id, result);
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
 * Register the handler that undoes an action.
 * @param {string} action
 * @param {(entry: object) => unknown} handler
 */
function registerCompensatingAction(action, handler) {
  if (typeof action !== "string" || action.length === 0) throw new Error("action name is required");
  if (typeof handler !== "function") throw new Error("compensating handler must be a function");
  compensators.set(action, handler);
}

/**
 * Undo an executed action by running its compensating handler.
 * Fails closed when the request was never executed or its action has no compensator.
 * @param {string} requestId
 */
function rollbackAction(requestId) {
  const entry = executionLog.find((candidate) => candidate.requestId === requestId);
  if (!entry) return { ok: false, requestId, compensated: false, error: "unknown request id" };
  if (entry.compensated) return { ok: true, requestId, compensated: true, replay: true };
  const compensate = compensators.get(entry.action);
  if (!compensate) {
    return { ok: false, requestId, compensated: false, error: `no compensating action registered for ${entry.action}` };
  }
  const result = compensate(entry);
  entry.compensated = true;
  return { ok: true, requestId, compensated: true, result };
}

function getExecutionLog() {
  return executionLog.map((entry) => ({ ...entry }));
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
