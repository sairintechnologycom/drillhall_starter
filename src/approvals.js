"use strict";

/**
 * Approval issuance and verification for mutable actions.
 *
 * DEFECT (missing approval binding): any object with `approved: true` passes
 * verification for any request and any action, any number of times. A
 * production-minded verifier must bind an approval to one specific request id
 * and action, and consume it on first use so it cannot be replayed.
 */

let approvalCounter = 0;

/**
 * @param {{ requestId: string, action: string, approver: string }} input
 */
function issueApproval(input) {
  approvalCounter += 1;
  return {
    approvalId: `apr-${approvalCounter}`,
    requestId: input.requestId,
    action: input.action,
    approver: input.approver,
    approved: true
  };
}

/**
 * @param {{ approved?: boolean }} approval
 * @param {{ id: string, action: string }} request
 * @returns {boolean} whether the approval authorizes this request
 */
function verifyApproval(approval, request) {
  return Boolean(approval && approval.approved);
}

function resetApprovalState() {
  approvalCounter = 0;
}

module.exports = { issueApproval, verifyApproval, resetApprovalState };
