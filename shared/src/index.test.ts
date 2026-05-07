import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LeaderboardValidationError,
  buildLeaderboardStats,
  parseAppsPayload,
  parseAppsResponse,
  parseLeaderboardPayload,
  parseLeaderboardResponse,
} from "./index.js";

const entry = {
  rank: 1,
  xAccount: "mega",
  mainWalletAddress: "0x123",
  totalPoints: 100,
  weeklyPointsChange: 7,
};

test("parseLeaderboardPayload validates and normalizes entries", () => {
  assert.deepEqual(parseLeaderboardPayload({ weekly: [], all: [entry] }), {
    weekly: [],
    all: [entry],
  });
});

test("parseLeaderboardPayload rejects malformed numeric fields", () => {
  assert.throws(
    () =>
      parseLeaderboardPayload({
        weekly: [],
        all: [{ ...entry, totalPoints: Number.NaN }],
      }),
    LeaderboardValidationError
  );
});

test("parseLeaderboardResponse accepts cache metadata", () => {
  const stats = buildLeaderboardStats([entry]);
  const response = parseLeaderboardResponse({
    updatedAt: "2026-05-03T00:00:00.000Z",
    stats,
    entries: [entry],
    cache: {
      status: "fresh",
      fetchedAt: "2026-05-03T00:00:00.000Z",
      expiresAt: "2026-05-03T00:01:00.000Z",
      staleUntil: "2026-05-03T00:06:00.000Z",
    },
  });

  assert.equal(response.stats.totalPointsSum, 100);
  assert.equal(response.cache?.status, "fresh");
});

const app = {
  id: "8a9fb4e7-19ab-4690-b277-9053e6e7a892",
  name: "gTrade | Gains Network",
  slug: "g_trade",
  description: "Perpetual futures trading protocol",
  logoUrl: "https://example.com/logo.jpg",
  imageUrl: "https://example.com/image.jpg",
  websiteUrl: "https://gains.trade/megaeth",
  redirectUrls: [],
  categories: ["Trading", "USDm", "MEGA"],
  metadata: { x: 886, y: 833 },
  suggestedActions: [
    {
      icon: "Globe",
      description: "Trade across 50+ RWA markets.",
      link: "https://gains.trade/megaeth",
    },
  ],
  clientId: "gainsnetwork_io",
  status: "active",
  activeUntil: null,
  comingSoon: false,
  isLiveSoon: false,
  liveSoonAt: null,
  rabbitholeProjectId: 114,
  gallery: ["https://example.com/gallery.jpg"],
  twitter: "https://x.com/GainsNetwork_io",
  telegram: "https://t.me/GainsNetwork",
  discord: "https://discord.gg/99Hj4rCd",
  github: "https://github.com/GainsNetwork-org/",
  createdAt: "2026-04-13T00:32:21.267503Z",
  updatedAt: "2026-05-05T11:56:13.025819Z",
};

test("parseAppsPayload validates app fields", () => {
  assert.deepEqual(parseAppsPayload([app]), [app]);
});

test("parseAppsResponse accepts cache metadata", () => {
  const response = parseAppsResponse({
    updatedAt: "2026-05-03T00:00:00.000Z",
    apps: [app],
    cache: {
      status: "fresh",
      fetchedAt: "2026-05-03T00:00:00.000Z",
      expiresAt: "2026-05-03T00:10:00.000Z",
      staleUntil: "2026-05-03T00:15:00.000Z",
    },
  });

  assert.equal(response.apps[0]?.name, "gTrade | Gains Network");
  assert.equal(response.cache?.status, "fresh");
});
