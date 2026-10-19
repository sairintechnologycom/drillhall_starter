"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { listProcedures, lookupProcedure, CORPUS } = require("../../src/procedures");

describe("shared retrieval collection", () => {
  it("seeds corpus entries with tenant, environment, and sensitive markers", () => {
    const entries = Object.values(CORPUS);
    assert.ok(entries.length >= 3, "corpus must include multi-tenant sample entries");
    for (const entry of entries) {
      assert.equal(typeof entry.tenantId, "string");
      assert.ok(entry.environment === "prod" || entry.environment === "nonprod");
      assert.equal(typeof entry.sensitive, "boolean");
    }
    assert.ok(entries.some((e) => e.sensitive === true), "at least one sensitive entry");
    assert.ok(entries.some((e) => e.tenantId === "tenant-b"), "at least one other-tenant entry");
    assert.ok(entries.some((e) => e.environment === "prod"), "at least one prod entry");
  });

  it("filters listProcedures by requester tenant and environment", () => {
    const listed = listProcedures({ tenantId: "tenant-a", environment: "nonprod" });
    assert.ok(listed.length >= 1, "tenant-a nonprod must see its own non-sensitive procedures");
    for (const entry of listed) {
      assert.equal(entry.tenantId, "tenant-a", "must not return another tenant's procedures");
      assert.equal(entry.environment, "nonprod", "must not mix prod and nonprod knowledge");
      assert.equal(entry.sensitive, false, "must never return sensitive-flagged entries");
    }
    assert.ok(
      !listed.some((e) => e.id === "tenant-b-scale-out"),
      "tenant-b procedures must be excluded"
    );
    assert.ok(!listed.some((e) => e.id === "prod-failover"), "prod procedures must be excluded");
    assert.ok(!listed.some((e) => e.id === "rotate-secret"), "sensitive entries must be excluded");
  });

  it("lookupProcedure refuses cross-tenant, wrong-environment, and sensitive ids", () => {
    assert.equal(
      lookupProcedure("tenant-b-scale-out", { tenantId: "tenant-a", environment: "nonprod" }),
      null,
      "cross-tenant lookup must return null"
    );
    assert.equal(
      lookupProcedure("prod-failover", { tenantId: "tenant-a", environment: "nonprod" }),
      null,
      "prod procedure must not be visible in nonprod"
    );
    assert.equal(
      lookupProcedure("rotate-secret", { tenantId: "tenant-a", environment: "nonprod" }),
      null,
      "sensitive-flagged procedure must never be returned"
    );
    const own = lookupProcedure("restart-app-service", {
      tenantId: "tenant-a",
      environment: "nonprod"
    });
    assert.ok(own, "same-tenant nonprod non-sensitive lookup must succeed");
    assert.equal(own.id, "restart-app-service");
  });
});
