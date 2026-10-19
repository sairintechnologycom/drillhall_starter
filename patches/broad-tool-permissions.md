# Reference patch: broad tool permissions

Replace the allow-everything check with a least-privilege role→tool map.

## Application

The meta-test replaces each listed file with the fenced body below (`### path` then a `javascript` fence).

### src/tools.js

```javascript
"use strict";

/**
 * Tool registry and authorization with least-privilege role grants.
 */

const TOOLS = {
  "read-status": { mutable: false },
  "read-procedure": { mutable: false },
  "restart-service": { mutable: true },
  "update-firewall": { mutable: true }
};

const ROLE_GRANTS = {
  reader: ["read-status", "read-procedure"],
  operator: ["read-status", "read-procedure", "restart-service"],
  network: ["read-status", "read-procedure", "update-firewall"]
};

/**
 * @param {string} requesterRole
 * @param {string} toolName
 * @returns {boolean} whether the role may invoke the tool
 */
function authorizeTool(requesterRole, toolName) {
  if (!(toolName in TOOLS)) return false;
  const grants = ROLE_GRANTS[requesterRole];
  return Array.isArray(grants) && grants.includes(toolName);
}

/** @param {string} toolName */
function isMutableTool(toolName) {
  return Boolean(TOOLS[toolName]?.mutable);
}

function listTools() {
  return Object.keys(TOOLS);
}

module.exports = { authorizeTool, isMutableTool, listTools };
```
