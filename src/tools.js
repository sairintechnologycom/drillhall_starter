"use strict";

/**
 * Tool registry and authorization.
 *
 * DEFECT (broad tool permissions): every known tool is granted to every
 * requester role. A production-minded registry must enforce least privilege:
 * each role gets exactly the tools its job needs, unknown roles get nothing,
 * and mutable tools are never granted to read-only roles.
 */

const TOOLS = {
  "read-status": { mutable: false },
  "read-procedure": { mutable: false },
  "restart-service": { mutable: true },
  "update-firewall": { mutable: true }
};

/**
 * @param {string} requesterRole
 * @param {string} toolName
 * @returns {boolean} whether the role may invoke the tool
 */
function authorizeTool(requesterRole, toolName) {
  return toolName in TOOLS;
}

/** @param {string} toolName */
function isMutableTool(toolName) {
  return Boolean(TOOLS[toolName]?.mutable);
}

function listTools() {
  return Object.keys(TOOLS);
}

module.exports = { authorizeTool, isMutableTool, listTools };
