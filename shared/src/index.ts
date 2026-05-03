export type LeaderboardEntry = {
  rank: number;
  xAccount?: string;
  mainWalletAddress: string;
  totalPoints: number;
  weeklyPointsChange: number;
};

export type LeaderboardPayload = {
  weekly: LeaderboardEntry[];
  all: LeaderboardEntry[];
};

export type LeaderboardStats = {
  entriesCount: number;
  totalPointsSum: number;
  averageTotalPoints: number;
};

export type LeaderboardCacheStatus = "fresh" | "stale";

export type LeaderboardCacheInfo = {
  status: LeaderboardCacheStatus;
  fetchedAt: string;
  expiresAt: string;
  staleUntil: string;
};

export type LeaderboardResponse = {
  updatedAt: string;
  stats: LeaderboardStats;
  entries: LeaderboardEntry[];
  cache?: LeaderboardCacheInfo;
};

export class LeaderboardValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeaderboardValidationError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const fail = (path: string, expected: string): never => {
  throw new LeaderboardValidationError(`${path} must be ${expected}`);
};

const readRecord = (value: unknown, path: string) => {
  if (!isRecord(value)) {
    fail(path, "an object");
  }

  return value as Record<string, unknown>;
};

const readString = (value: unknown, path: string, allowEmpty = false) => {
  if (typeof value !== "string") {
    fail(path, "a string");
  }

  const text = value as string;
  if (!allowEmpty && text.trim().length === 0) {
    fail(path, "a non-empty string");
  }

  return text;
};

const readDateString = (value: unknown, path: string) => {
  const date = readString(value, path);
  if (Number.isNaN(Date.parse(date))) {
    fail(path, "a valid ISO date string");
  }

  return date;
};

const readFiniteNumber = (value: unknown, path: string) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(path, "a finite number");
  }

  return value as number;
};

const readEntry = (value: unknown, path: string): LeaderboardEntry => {
  const entry = readRecord(value, path);
  const xAccountValue = entry.xAccount;
  let xAccount: string | undefined;

  if (xAccountValue !== undefined && xAccountValue !== null) {
    xAccount = readString(xAccountValue, `${path}.xAccount`, true);
  }

  return {
    rank: readFiniteNumber(entry.rank, `${path}.rank`),
    xAccount,
    mainWalletAddress: readString(
      entry.mainWalletAddress,
      `${path}.mainWalletAddress`
    ),
    totalPoints: readFiniteNumber(entry.totalPoints, `${path}.totalPoints`),
    weeklyPointsChange: readFiniteNumber(
      entry.weeklyPointsChange,
      `${path}.weeklyPointsChange`
    ),
  };
};

const readEntries = (value: unknown, path: string) => {
  if (!Array.isArray(value)) {
    fail(path, "an array");
  }

  return (value as unknown[]).map((entry, index) =>
    readEntry(entry, `${path}[${index}]`)
  );
};

export const buildLeaderboardStats = (
  entries: readonly LeaderboardEntry[]
): LeaderboardStats => {
  const totalPointsSum = entries.reduce(
    (sum, entry) => sum + entry.totalPoints,
    0
  );

  return {
    entriesCount: entries.length,
    totalPointsSum,
    averageTotalPoints: entries.length ? totalPointsSum / entries.length : 0,
  };
};

export const parseLeaderboardPayload = (value: unknown): LeaderboardPayload => {
  const payload = readRecord(value, "payload");

  return {
    weekly: readEntries(payload.weekly, "payload.weekly"),
    all: readEntries(payload.all, "payload.all"),
  };
};

const readStats = (value: unknown): LeaderboardStats => {
  const stats = readRecord(value, "response.stats");

  return {
    entriesCount: readFiniteNumber(
      stats.entriesCount,
      "response.stats.entriesCount"
    ),
    totalPointsSum: readFiniteNumber(
      stats.totalPointsSum,
      "response.stats.totalPointsSum"
    ),
    averageTotalPoints: readFiniteNumber(
      stats.averageTotalPoints,
      "response.stats.averageTotalPoints"
    ),
  };
};

const readCacheInfo = (value: unknown): LeaderboardCacheInfo => {
  const cache = readRecord(value, "response.cache");

  const status: LeaderboardCacheStatus =
    cache.status === "fresh" || cache.status === "stale"
      ? cache.status
      : fail("response.cache.status", "\"fresh\" or \"stale\"");

  return {
    status,
    fetchedAt: readDateString(cache.fetchedAt, "response.cache.fetchedAt"),
    expiresAt: readDateString(cache.expiresAt, "response.cache.expiresAt"),
    staleUntil: readDateString(cache.staleUntil, "response.cache.staleUntil"),
  };
};

export const parseLeaderboardResponse = (value: unknown): LeaderboardResponse => {
  const response = readRecord(value, "response");

  return {
    updatedAt: readDateString(response.updatedAt, "response.updatedAt"),
    stats: readStats(response.stats),
    entries: readEntries(response.entries, "response.entries"),
    cache:
      response.cache === undefined || response.cache === null
        ? undefined
        : readCacheInfo(response.cache),
  };
};
