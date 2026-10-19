# Reference patch: weak prompt boundary

Keep untrusted content in a delimited data section and select tools only from the instruction section.

## Application

The meta-test replaces each listed file with the fenced body below (`### path` then a `javascript` fence).

### src/prompt.js

```javascript
"use strict";

/**
 * Prompt assembly with a hard boundary between instructions and untrusted
 * content. Tool directives are honored only in the instruction section.
 */

const SYSTEM_INSTRUCTIONS = [
  "You are the operations assistant.",
  "TOOL: read-status",
  "Escalate to a human for anything mutable."
].join("\n");

const UNTRUSTED_OPEN = "<<untrusted>>";
const UNTRUSTED_CLOSE = "<<end-untrusted>>";

/** Neutralize boundary markers inside untrusted text. */
function fence(text) {
  return String(text).split(UNTRUSTED_OPEN).join("[untrusted]").split(UNTRUSTED_CLOSE).join("[end-untrusted]");
}

/**
 * @param {{ body: string }} request
 * @param {string} [procedureText]
 * @returns {string} the full prompt text
 */
function buildPrompt(request, procedureText = "") {
  return [
    SYSTEM_INSTRUCTIONS,
    "Request:",
    UNTRUSTED_OPEN,
    fence(request.body),
    UNTRUSTED_CLOSE,
    "Procedure:",
    UNTRUSTED_OPEN,
    fence(procedureText),
    UNTRUSTED_CLOSE
  ].join("\n");
}

/**
 * Deterministic selector: reads TOOL directives only outside untrusted
 * sections; the last trusted directive wins.
 * @param {string} prompt
 * @returns {string} selected tool name
 */
function selectTool(prompt) {
  const trusted = prompt
    .split(UNTRUSTED_OPEN)
    .map((chunk, index) => (index === 0 ? chunk : chunk.split(UNTRUSTED_CLOSE).slice(1).join(UNTRUSTED_CLOSE)))
    .join("\n");
  const matches = [...trusted.matchAll(/TOOL:\s*([a-z][a-z-]*)/g)];
  const last = matches[matches.length - 1];
  return last ? last[1] : "read-status";
}

module.exports = { SYSTEM_INSTRUCTIONS, buildPrompt, selectTool };
```
