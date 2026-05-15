import type {
  LeaderboardEntry,
  LeaderboardResponse,
  LeaderboardSortKey,
  SortDirection,
} from "@megaeth-leaderboard/shared";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 500;

const sortKeys = new Set<LeaderboardSortKey>([
  "rank",
  "displayName",
  "totalPoints",
  "weeklyPointsChange",
]);

export class LeaderboardQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeaderboardQueryError";
  }
}

export type LeaderboardQueryOptions = {
  page: number;
  pageSize: number;
  query: string;
  sortKey: LeaderboardSortKey;
  sortDirection: SortDirection;
};

const readSingleQueryValue = (
  value: unknown,
  key: string
): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  throw new LeaderboardQueryError(`${key} must be a string`);
};

const readPositiveInteger = (
  value: string | undefined,
  key: string,
  defaultValue: number,
  max?: number
) => {
  if (value === undefined || value.trim() === "") return defaultValue;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new LeaderboardQueryError(`${key} must be a positive integer`);
  }

  if (max !== undefined && parsed > max) {
    throw new LeaderboardQueryError(`${key} must be less than or equal to ${max}`);
  }

  return parsed;
};

const isQueryRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const parseLeaderboardQuery = (
  value: unknown
): LeaderboardQueryOptions | null => {
  if (!isQueryRecord(value)) return null;

  const hasLeaderboardQuery =
    value.page !== undefined ||
    value.pageSize !== undefined ||
    value.query !== undefined ||
    value.sortKey !== undefined ||
    value.sortDirection !== undefined;

  if (!hasLeaderboardQuery) return null;

  const sortKey =
    readSingleQueryValue(value.sortKey, "sortKey") ?? "rank";
  const sortDirection =
    readSingleQueryValue(value.sortDirection, "sortDirection") ?? "asc";

  if (!sortKeys.has(sortKey as LeaderboardSortKey)) {
    throw new LeaderboardQueryError("sortKey is not supported");
  }

  if (sortDirection !== "asc" && sortDirection !== "desc") {
    throw new LeaderboardQueryError("sortDirection must be asc or desc");
  }

  return {
    page: readPositiveInteger(
      readSingleQueryValue(value.page, "page"),
      "page",
      DEFAULT_PAGE
    ),
    pageSize: readPositiveInteger(
      readSingleQueryValue(value.pageSize, "pageSize"),
      "pageSize",
      DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    ),
    query: readSingleQueryValue(value.query, "query")?.trim().toLowerCase() ?? "",
    sortKey: sortKey as LeaderboardSortKey,
    sortDirection,
  };
};

const compareEntries = (
  left: LeaderboardEntry,
  right: LeaderboardEntry,
  sortKey: LeaderboardSortKey
) => {
  const leftValue = left[sortKey];
  const rightValue = right[sortKey];

  if (typeof leftValue === "number" && typeof rightValue === "number") {
    return leftValue - rightValue;
  }

  return String(leftValue ?? "").localeCompare(String(rightValue ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
};

export const selectLeaderboardPage = (
  response: LeaderboardResponse,
  options: LeaderboardQueryOptions
): LeaderboardResponse => {
  const filteredEntries = options.query
    ? response.entries.filter((entry) =>
        entry.displayName.toLowerCase().includes(options.query)
      )
    : response.entries;
  const sortedEntries = [...filteredEntries].sort((left, right) => {
    const result = compareEntries(left, right, options.sortKey);
    return options.sortDirection === "asc" ? result : -result;
  });
  const totalRows = sortedEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / options.pageSize));
  const page = Math.min(options.page, totalPages);
  const startIndex = (page - 1) * options.pageSize;

  return {
    ...response,
    entries: sortedEntries.slice(startIndex, startIndex + options.pageSize),
    pagination: {
      page,
      pageSize: options.pageSize,
      totalRows,
      totalPages,
    },
  };
};
