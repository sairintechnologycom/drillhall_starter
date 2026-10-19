# Reference patch: missing idempotency

Track processed request IDs and return the prior result on replay without re-running the side effect.

## Application

The meta-test replaces each listed file with the fenced body below (`### path` then a `javascript` fence).

### src/executor.js

```javascript
"use strict";

/**
 * Action executor — idempotent on request id.
 */

const executionLog = [];
const resultsByRequestId = new Map();

function resetExecutorState() {
  executionLog.length = 0;
  resultsByRequestId.clear();
}

/**
 * @param {{ id: string, action: string }} request
 * @param {{ run?: (action: string) => unknown }} [hooks]
 */
function executeAction(request, hooks = {}) {
  if (resultsByRequestId.has(request.id)) {
    return {
      ok: true,
      requestId: request.id,
      result: resultsByRequestId.get(request.id),
      replay: true
    };
  }
  const run = hooks.run ?? ((action) => ({ action, status: "done" }));
  const result = run(request.action);
  resultsByRequestId.set(request.id, result);
  executionLog.push({ requestId: request.id, action: request.action, result });
  return { ok: true, requestId: request.id, result, replay: false };
}

function getExecutionLog() {
  return executionLog.slice();
}

module.exports = { executeAction, getExecutionLog, resetExecutorState };
```
