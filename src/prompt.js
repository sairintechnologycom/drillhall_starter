"use strict";

/**
 * Prompt assembly and deterministic tool selection.
 *
 * The assistant picks its tool from `TOOL:` directives in the instruction
 * text. DEFECT (weak prompt boundary): request bodies and procedure text are
 * concatenated straight into the prompt, so a `TOOL:` directive smuggled into
 * untrusted content is indistinguishable from a real instruction. A
 * production-minded builder keeps untrusted content in a delimited data
 * section that the selector never reads directives from.
 */

const SYSTEM_INSTRUCTIONS = [
  "You are the operations assistant.",
  "TOOL: read-status",
  "Escalate to a human for anything mutable."
].join("\n");

/**
 * @param {{ body: string }} request
 * @param {string} [procedureText]
 * @returns {string} the full prompt text
 */
function buildPrompt(request, procedureText = "") {
  return [SYSTEM_INSTRUCTIONS, "Request:", request.body, "Procedure:", procedureText].join("\n");
}

/**
 * Deterministic selector: the LAST `TOOL:` directive in the prompt wins,
 * mirroring how a runbook may override the default.
 * @param {string} prompt
 * @returns {string} selected tool name
 */
function selectTool(prompt) {
  const matches = [...prompt.matchAll(/TOOL:\s*([a-z][a-z-]*)/g)];
  const last = matches[matches.length - 1];
  return last ? last[1] : "read-status";
}

module.exports = { SYSTEM_INSTRUCTIONS, buildPrompt, selectTool };
