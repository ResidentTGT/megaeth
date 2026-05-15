import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { buildApp } from "./app.js";
import { clearAppsCache } from "./appsService.js";
import type { AppConfig } from "./config.js";
import { clearLeaderboardCache } from "./leaderboardService.js";

const originalFetch = globalThis.fetch;

const config: AppConfig = {
  port: 4000,
  host: "0.0.0.0",
  frontendOrigins: ["http://localhost:5173"],
  leaderboardUrl: "https://source.example/leaderboard",
  appsUrl: "https://source.example/apps",
  leaderboardCacheTtlMs: 60_000,
  appsCacheTtlMs: 60_000,
  leaderboardStaleTtlMs: 300_000,
  leaderboardFetchTimeoutMs: 1_000,
  leaderboardFetchAttempts: 1,
  leaderboardRetryBaseDelayMs: 0,
};

const encodeChunk = (value: string) => JSON.stringify(value).slice(1, -1);

const htmlWithFlightPayload = (payload: string) =>
  `<script>self.__next_f.push([1,"${encodeChunk(payload)}"])</script>`;

const season = {
  seasonId: 1,
  seasonName: "Season 1",
  status: "active",
  startsAt: "2026-04-28T00:00:00Z",
  endsAt: "2026-06-23T00:00:00Z",
};

const leaderboardHtml = htmlWithFlightPayload(
  JSON.stringify({
    season,
    entries: {
      all: [
        {
          rank: 1,
          displayName: "0xaaa",
          totalPoints: 100,
          weeklyPointsChange: 7,
        },
        {
          rank: 2,
          displayName: "0xbbb",
          totalPoints: 50,
          weeklyPointsChange: 5,
        },
      ],
      weekly: [],
    },
  })
);

const mockFetch = (handler: () => Response | Promise<Response>) => {
  globalThis.fetch = (async () => handler()) as typeof fetch;
};

afterEach(() => {
  globalThis.fetch = originalFetch;
  clearAppsCache();
  clearLeaderboardCache();
});

test("GET /health returns ok", async () => {
  const app = await buildApp(config, false);
  const response = await app.inject({ method: "GET", url: "/health" });
  await app.close();

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { ok: true });
});

test("GET /health allows configured frontend origins", async () => {
  const app = await buildApp(
    {
      ...config,
      frontendOrigins: ["https://www.megaeth.farm"],
    },
    false
  );
  const response = await app.inject({
    method: "GET",
    url: "/health",
    headers: {
      origin: "https://www.megaeth.farm",
    },
  });
  await app.close();

  assert.equal(response.statusCode, 200);
  assert.equal(
    response.headers["access-control-allow-origin"],
    "https://www.megaeth.farm"
  );
});

test("GET /leaderboard supports server-side pagination", async () => {
  mockFetch(() => new Response(leaderboardHtml));
  const app = await buildApp(config, false);
  const response = await app.inject({
    method: "GET",
    url: "/leaderboard?page=1&pageSize=1&sortKey=totalPoints&sortDirection=desc",
  });
  await app.close();
  const body = response.json();

  assert.equal(response.statusCode, 200);
  assert.equal(body.entries.length, 1);
  assert.equal(body.entries[0].displayName, "0xaaa");
  assert.equal(body.pagination.totalRows, 2);
});

test("GET /leaderboard accepts displayName upstream entries", async () => {
  mockFetch(() =>
    new Response(
      htmlWithFlightPayload(
        JSON.stringify({
          season,
          entries: {
            all: [
              {
                rank: 1,
                displayName: "0xA03C...60aa",
                totalPoints: 100,
                weeklyPointsChange: 7,
              },
            ],
            weekly: [],
          },
        })
      )
    )
  );
  const app = await buildApp(config, false);
  const response = await app.inject({
    method: "GET",
    url: "/leaderboard?page=1&pageSize=1&query=a03c",
  });
  await app.close();
  const body = response.json();

  assert.equal(response.statusCode, 200);
  assert.equal(body.entries[0].displayName, "0xA03C...60aa");
  assert.equal(body.pagination.totalRows, 1);
});

test("GET /leaderboard rejects invalid query parameters", async () => {
  const app = await buildApp(config, false);
  const response = await app.inject({
    method: "GET",
    url: "/leaderboard?pageSize=9999",
  });
  await app.close();

  assert.equal(response.statusCode, 400);
});
