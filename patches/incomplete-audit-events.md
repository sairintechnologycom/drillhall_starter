# Reference patch: incomplete audit events

Record actor and approval reference on every mutable action and reject evidence-free records.

## Application

The meta-test replaces each listed file with the fenced body below (`### path` then a `javascript` fence).

### src/audit.js

```javascript
"use strict";

/**
 * Structured audit trail: mutable actions must carry actor and approval
 * evidence; incomplete records are rejected, not silently stored.
 */

const auditLog = [];

/**
 * @param {{ requestId: string, action: string, mutable: boolean, outcome: string,
 *           actor?: string, approvalId?: string }} entry
 */
function recordAudit(entry) {
  if (entry.mutable) {
    if (typeof entry.actor !== "string" || entry.actor.length === 0) {
      throw new Error("mutable audit record requires an actor");
    }
    if (typeof entry.approvalId !== "string" || entry.approvalId.length === 0) {
      throw new Error("mutable audit record requires an approval reference");
    }
  }
  const record = {
    requestId: entry.requestId,
    action: entry.action,
    mutable: entry.mutable,
    outcome: entry.outcome,
    ...(entry.actor ? { actor: entry.actor } : {}),
    ...(entry.approvalId ? { approvalId: entry.approvalId } : {})
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
```
