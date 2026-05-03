import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LeaderboardValidationError,
  buildLeaderboardStats,
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
