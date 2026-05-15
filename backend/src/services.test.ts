import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  clearAppsCache,
  fetchAppsFromSource,
} from "./appsService.js";
import type { AppConfig } from "./config.js";
import {
  clearLeaderboardCache,
  fetchLeaderboardFromSource,
  getLeaderboard,
} from "./leaderboardService.js";

const originalFetch = globalThis.fetch;

const baseConfig: AppConfig = {
  port: 4000,
  host: "0.0.0.0",
  frontendOrigins: ["http://localhost:5173"],
  leaderboardUrl: "https://source.example/leaderboard",
  appsUrl: "https://source.example/apps",
  leaderboardCacheTtlMs: 60_000,
  appsCacheTtlMs: 60_000,
  leaderboardStaleTtlMs: 300_000,
  leaderboardFetchTimeoutMs: 1_000,
  leaderboardFetchAttempts: 2,
  leaderboardRetryBaseDelayMs: 0,
};

const leaderboardEntry = {
  rank: 1,
  displayName: "0x123",
  totalPoints: 100,
  weeklyPointsChange: 7,
};

const app = {
  id: "8a9fb4e7-19ab-4690-b277-9053e6e7a892",
  name: "Different App",
  slug: "different_app",
  description: "A structurally valid app fixture",
  logoUrl: "https://example.com/logo.jpg",
  imageUrl: "https://example.com/image.jpg",
  websiteUrl: "https://example.com",
  redirectUrls: ["https://example.com/open"],
  categories: ["Trading"],
  metadata: { x: 10, y: 20 },
  suggestedActions: [
    {
      icon: "Globe",
      description: "Open the app.",
      link: "https://example.com/open",
    },
  ],
  clientId: "different_app",
  status: "active",
  activeUntil: null,
  comingSoon: false,
  isLiveSoon: false,
  liveSoonAt: null,
  rabbitholeProjectId: null,
  gallery: ["https://example.com/gallery.jpg"],
  twitter: "https://x.com/example",
  telegram: "https://t.me/example",
  discord: "https://discord.gg/example",
  github: "https://github.com/example/repo",
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-02T00:00:00.000Z",
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
      all: [leaderboardEntry],
      weekly: [],
    },
  })
);

const appsHtml = htmlWithFlightPayload(
  JSON.stringify({
    apps: [app, { id: "map-only", status: "active", metadata: { x: 1, y: 2 } }],
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

test("getLeaderboard reuses a fresh cached response", async () => {
  let requests = 0;
  mockFetch(() => {
    requests += 1;
    return new Response(leaderboardHtml);
  });

  const first = await getLeaderboard(baseConfig);
  const second = await getLeaderboard(baseConfig);

  assert.equal(requests, 1);
  assert.equal(first.cache?.status, "fresh");
  assert.equal(second.entries[0]?.displayName, "0x123");
});

test("getLeaderboard serves stale cache after refresh failure", async () => {
  let requests = 0;
  const config = {
    ...baseConfig,
    leaderboardCacheTtlMs: 0,
    leaderboardFetchAttempts: 1,
  };

  mockFetch(() => {
    requests += 1;
    return new Response(leaderboardHtml);
  });
  await getLeaderboard(config);

  globalThis.fetch = (async () => {
    requests += 1;
    throw new TypeError("network down");
  }) as typeof fetch;

  const response = await getLeaderboard(config);

  assert.equal(requests, 2);
  assert.equal(response.cache?.status, "stale");
  assert.equal(response.entries.length, 1);
});

test("fetchLeaderboardFromSource retries retryable HTTP failures", async () => {
  let requests = 0;
  mockFetch(() => {
    requests += 1;
    return requests === 1
      ? new Response("temporary failure", { status: 500 })
      : new Response(leaderboardHtml);
  });

  const response = await fetchLeaderboardFromSource(baseConfig);

  assert.equal(requests, 2);
  assert.equal(response.entries.length, 1);
});

test("fetchAppsFromSource extracts apps without a hardcoded app name", async () => {
  mockFetch(() => new Response(appsHtml));

  const response = await fetchAppsFromSource(baseConfig);

  assert.equal(response.apps[0]?.name, "Different App");
});
