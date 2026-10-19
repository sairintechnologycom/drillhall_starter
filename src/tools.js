"use strict";

/**
 * Tool registry and authorization.
 *
 * Least privilege: each role is granted exactly the tools its job needs. A role that is not listed,
 * or a tool that does not exist, gets nothing. Mutable tools are never granted to the read-only role.
 */

const TOOLS = {
  "read-status": { mutable: false },
  "read-procedure": { mutable: false },
  "restart-service": { mutable: true },
  "update-firewall": { mutable: true }
};

const ROLE_TOOLS = Object.freeze({
  reader: Object.freeze(["read-status", "read-procedure"]),
  operator: Object.freeze(["read-status", "read-procedure", "restart-service"]),
  network: Object.freeze(["read-status", "read-procedure", "update-firewall"])
});

/**
 * @param {string} requesterRole
 * @param {string} toolName
 * @returns {boolean} whether the role may invoke the tool
 */
function authorizeTool(requesterRole, toolName) {
  if (!Object.hasOwn(ROLE_TOOLS, requesterRole)) return false;
  return Object.hasOwn(TOOLS, toolName) && ROLE_TOOLS[requesterRole].includes(toolName);
}

/** @param {string} toolName */
function isMutableTool(toolName) {
  return Boolean(TOOLS[toolName]?.mutable);
}

function listTools() {
  return Object.keys(TOOLS);
}

module.exports = { authorizeTool, isMutableTool, listTools };
