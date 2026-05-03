import assert from "node:assert/strict";
import { test } from "node:test";
import { loadConfig } from "./config.js";

test("loadConfig applies validated defaults", () => {
  const config = loadConfig({});

  assert.equal(config.port, 4000);
  assert.equal(config.leaderboardFetchAttempts, 3);
  assert.deepEqual(config.frontendOrigins, [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);
});

test("loadConfig rejects invalid numeric values", () => {
  assert.throws(
    () => loadConfig({ PORT: "not-a-number" }),
    /PORT must be a finite number/
  );
});

test("loadConfig parses comma-separated frontend origins", () => {
  const config = loadConfig({
    FRONTEND_ORIGIN: "http://localhost:5173, https://app.example.com",
  });

  assert.deepEqual(config.frontendOrigins, [
    "http://localhost:5173",
    "https://app.example.com",
  ]);
});
