import assert from "node:assert/strict";
import { test } from "node:test";
import { sortEntries } from "./sort.js";
import type { LeaderboardEntry } from "./types.js";

const entries: LeaderboardEntry[] = [
  {
    rank: 2,
    mainWalletAddress: "0xbbb",
    totalPoints: 50,
    weeklyPointsChange: 2,
  },
  {
    rank: 1,
    mainWalletAddress: "0xaaa",
    totalPoints: 100,
    weeklyPointsChange: 1,
  },
];

test("sortEntries sorts numeric columns in the requested direction", () => {
  assert.deepEqual(
    sortEntries(entries, { key: "totalPoints", direction: "desc" }).map(
      (entry) => entry.mainWalletAddress
    ),
    ["0xaaa", "0xbbb"]
  );
});

test("sortEntries sorts string columns case-insensitively", () => {
  assert.deepEqual(
    sortEntries(entries, { key: "mainWalletAddress", direction: "asc" }).map(
      (entry) => entry.rank
    ),
    [1, 2]
  );
});
