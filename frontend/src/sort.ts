import type { LeaderboardEntry } from "./types.js";

export type SortKey =
  | "rank"
  | "mainWalletAddress"
  | "xAccount"
  | "totalPoints"
  | "weeklyPointsChange";

export type SortDirection = "asc" | "desc";

export type SortState = {
  key: SortKey;
  direction: SortDirection;
};

export const columns: Array<{ key: SortKey; label: string; numeric?: boolean }> = [
  { key: "rank", label: "Rank", numeric: true },
  { key: "mainWalletAddress", label: "Wallet" },
  { key: "xAccount", label: "X Account" },
  { key: "totalPoints", label: "Total Points", numeric: true },
  { key: "weeklyPointsChange", label: "Weekly Change", numeric: true },
];

export const compareValues = (
  left: LeaderboardEntry,
  right: LeaderboardEntry,
  sort: SortState
) => {
  const leftValue = left[sort.key];
  const rightValue = right[sort.key];

  if (typeof leftValue === "number" && typeof rightValue === "number") {
    return leftValue - rightValue;
  }

  return String(leftValue ?? "").localeCompare(String(rightValue ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
};

export const sortEntries = (
  entries: readonly LeaderboardEntry[],
  sort: SortState
) =>
  [...entries].sort((left, right) => {
    const result = compareValues(left, right, sort);
    return sort.direction === "asc" ? result : -result;
  });
