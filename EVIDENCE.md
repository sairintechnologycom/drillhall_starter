# Build evidence

- ba2340d: the unmodified starter. The twelve build checks failed.
- d57d2d1: the twelve defects repaired. 30 of 30 local tests pass; the platform evaluation passed.
- 886ad83: retrieval gated on procedure status, with `test/regression/stale-procedure.test.js`,
  which fails if a retired procedure can be listed, looked up or cited. 34 of 34 tests pass.

Run locally with `npm test`.
