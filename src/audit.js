"use strict";

/**
 * Structured audit trail for assistant actions.
 *
 * A record for a mutable action must name who acted (`actor`) and which approval authorized it
 * (`approvalId`); without them the evidence chain cannot be reconstructed, so the record is rejected.
 * Read-only actions need neither.
 */

const auditLog = [];

function present(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * @param {{ requestId: string, action: string, mutable: boolean, outcome: string,
 *           actor?: string, approvalId?: string }} entry
 */
function recordAudit(entry) {
  if (entry.mutable) {
    if (!present(entry.actor)) throw new Error("audit record for a mutable action requires an actor");
    if (!present(entry.approvalId)) throw new Error("audit record for a mutable action requires an approval reference");
  }
  const record = {
    requestId: entry.requestId,
    action: entry.action,
    mutable: entry.mutable,
    outcome: entry.outcome,
    ...(present(entry.actor) ? { actor: entry.actor } : {}),
    ...(present(entry.approvalId) ? { approvalId: entry.approvalId } : {})
  };
  auditLog.push(record);
  return record;
}

function getAuditLog() {
  return auditLog.slice();
}

function resetAuditState() {
  auditLog.length = 0;
}

module.exports = { recordAudit, getAuditLog, resetAuditState };
