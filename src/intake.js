"use strict";

/**
 * ServiceNow-style request intake (safe offline simulator).
 * @param {{ id: string, tenantId: string, action: string, body?: string }} raw
 */
function acceptRequest(raw) {
  if (!raw || typeof raw.id !== "string" || raw.id.length === 0) {
    throw new Error("request id is required");
  }
  if (!raw.tenantId || typeof raw.tenantId !== "string") {
    throw new Error("tenantId is required");
  }
  if (!raw.action || typeof raw.action !== "string") {
    throw new Error("action is required");
  }
  return {
    id: raw.id,
    tenantId: raw.tenantId,
    action: raw.action,
    body: typeof raw.body === "string" ? raw.body : "",
    receivedAt: new Date(0).toISOString()
  };
}

module.exports = { acceptRequest };
