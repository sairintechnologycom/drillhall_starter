"use strict";

/**
 * Structured audit trail for assistant actions.
 *
 * DEFECT (incomplete audit events): records for mutable actions omit who
 * acted (`actor`) and which approval authorized it (`approvalId`), and
 * nothing rejects an incomplete record. A production-minded audit trail
 * requires actor and approval reference on every mutable action record so
 * the evidence chain is reconstructible.
 */

const auditLog = [];

/**
 * @param {{ requestId: string, action: string, mutable: boolean, outcome: string,
 *           actor?: string, approvalId?: string }} entry
 */
function recordAudit(entry) {
  auditLog.push({
    requestId: entry.requestId,
    action: entry.action,
    mutable: entry.mutable,
    outcome: entry.outcome
  });
  return auditLog[auditLog.length - 1];
}

function getAuditLog() {
  return auditLog.slice();
}

function resetAuditState() {
  auditLog.length = 0;
}

module.exports = { recordAudit, getAuditLog, resetAuditState };
