import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LeaderboardQueryError,
  parseLeaderboardQuery,
  selectLeaderboardPage,
} from "./leaderboardQuery.js";

const response = {
  updatedAt: "2026-05-03T00:00:00.000Z",
  stats: {
    entriesCount: 3,
    totalPointsSum: 160,
    averageTotalPoints: 53.333,
  },
  entries: [
    {
      rank: 2,
      mainWalletAddress: "0xbbb",
      totalPoints: 50,
      weeklyPointsChange: 5,
    },
    {
      rank: 1,
      mainWalletAddress: "0xaaa",
      totalPoints: 100,
      weeklyPointsChange: 7,
    },
    {
      rank: 3,
      mainWalletAddress: "0xabc",
      totalPoints: 10,
      weeklyPointsChange: 1,
    },
  ],
};

test("parseLeaderboardQuery returns null for the legacy full response path", () => {
  assert.equal(parseLeaderboardQuery({}), null);
});

test("parseLeaderboardQuery rejects invalid pagination input", () => {
  assert.throws(
    () => parseLeaderboardQuery({ pageSize: "9999" }),
    LeaderboardQueryError
  );
});

test("selectLeaderboardPage filters, sorts, and paginates entries", () => {
  const page = selectLeaderboardPage(response, {
    page: 1,
    pageSize: 1,
    query: "0xa",
    sortKey: "totalPoints",
    sortDirection: "desc",
  });

  assert.deepEqual(
    page.entries.map((entry) => entry.mainWalletAddress),
    ["0xaaa"]
  );
  assert.deepEqual(page.pagination, {
    page: 1,
    pageSize: 1,
    totalRows: 2,
    totalPages: 2,
  });
});
