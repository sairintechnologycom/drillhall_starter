"use strict";

/**
 * Approval issuance and verification for mutable actions.
 *
 * An approval is only what this module issued. Verification looks the approval up by id in the
 * issuer's own record, checks it was issued for this request id and this action, and consumes it, so
 * it cannot be replayed or reused for another request. An object the issuer never produced never verifies.
 */

let approvalCounter = 0;
const issued = new Map();

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
  issued.set(approval.approvalId, { requestId: input.requestId, action: input.action, consumed: false });
  return approval;
}

/**
 * @param {{ approvalId?: string }} approval
 * @param {{ id: string, action: string }} request
 * @returns {boolean} whether the approval authorizes this request; true at most once per approval
 */
function verifyApproval(approval, request) {
  if (!approval || typeof approval.approvalId !== "string") return false;
  // Trust the issuer's record, never the fields on the object the caller hands back.
  const record = issued.get(approval.approvalId);
  if (!record || record.consumed) return false;
  if (record.requestId !== request.id || record.action !== request.action) return false;
  record.consumed = true;
  return true;
}

function resetApprovalState() {
  approvalCounter = 0;
  issued.clear();
}

module.exports = { issueApproval, verifyApproval, resetApprovalState };
