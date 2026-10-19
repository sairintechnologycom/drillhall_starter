# Reference patch: missing approval binding

Bind each approval to its request id and action, and consume it on first use.

## Application

The meta-test replaces each listed file with the fenced body below (`### path` then a `javascript` fence).

### src/approvals.js

```javascript
"use strict";

/**
 * Approval issuance and verification bound to one request and action,
 * consumed on first use.
 */

let approvalCounter = 0;
const issued = new Map();
const consumed = new Set();

/**
 * @param {{ requestId: string, action: string, approver: string }} input
 */
function issueApproval(input) {
  approvalCounter += 1;
  const approval = {
    approvalId: `apr-${approvalCounter}`,
    requestId: input.requestId,
    action: input.action,
    approver: input.approver,
    approved: true
  };
  issued.set(approval.approvalId, approval);
  return approval;
}

/**
 * @param {{ approvalId?: string }} approval
 * @param {{ id: string, action: string }} request
 * @returns {boolean} whether the approval authorizes this request
 */
function verifyApproval(approval, request) {
  if (!approval || typeof approval.approvalId !== "string") return false;
  const record = issued.get(approval.approvalId);
  if (!record) return false;
  if (consumed.has(record.approvalId)) return false;
  if (record.requestId !== request.id || record.action !== request.action) return false;
  consumed.add(record.approvalId);
  return true;
}

function resetApprovalState() {
  approvalCounter = 0;
  issued.clear();
  consumed.clear();
}

module.exports = { issueApproval, verifyApproval, resetApprovalState };
```
