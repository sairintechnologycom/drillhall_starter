# Atlas starter (AI operations assistant)

Minimal plain-Node skeleton used by Project Atlas build-stage learners.

**Zero npm dependencies.** Run with bare Node 20+:

```bash
node --test test/defects/*.test.js
```

## Layout

| Path | Role |
| --- | --- |
| `src/intake.js` | ServiceNow-style request intake (safe simulator) |
| `src/procedures.js` | Procedure lookup stub (shared corpus — tenant/env filtering is a defect to repair) |
| `src/executor.js` | Action executor (tenant auth, idempotency, and rollback are defects to repair) |
| `src/model-client.js` | Model client configuration and call helper |
| `src/tools.js` | Tool registry and authorization |
| `src/approvals.js` | Approval issuance and verification for mutable actions |
| `src/prompt.js` | Prompt assembly and deterministic tool selection |
| `src/audit.js` | Structured audit trail |
| `src/recommendations.js` | Model recommendation builder (citation validation is a defect to repair) |
| `src/index.js` | Composition entry |
| `src/evaluation.js` | Offline evaluation runner (missing until you add the golden dataset) |
| `eval/dataset.json` | Golden request→recommendation cases (missing until you add them) |
| `test/defects/` | Engineering and security defect checks (must fail on the starter as shipped) |
| `patches/` | Reference repairs (for authoring meta-tests; learners should not need these) |

Copy this repository into your own **public** GitHub repo, associate it with your Atlas run, discover failures from the tests, and push minimal production-minded fixes.
