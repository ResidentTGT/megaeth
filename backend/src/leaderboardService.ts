import {
  buildLeaderboardStats,
  parseLeaderboardPayload,
  type LeaderboardCacheStatus,
  type LeaderboardResponse,
} from "@megaeth-leaderboard/shared";
import type { AppConfig } from "./config.js";
import { getConfig } from "./config.js";
import { decodeNextFlight, extractJsonObject } from "./nextFlight.js";

type CachedLeaderboard = Omit<LeaderboardResponse, "cache"> & {
  fetchedAtMs: number;
  expiresAtMs: number;
  staleUntilMs: number;
};

class LeaderboardFetchError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = "LeaderboardFetchError";
    this.retryable = retryable;
  }
}

let cachedLeaderboard: CachedLeaderboard | null = null;
let inflightRequest: Promise<LeaderboardResponse> | null = null;

const isRetryableStatus = (status: number) =>
  status === 408 || status === 429 || status >= 500;

const isRetryableError = (error: unknown) => {
  if (error instanceof LeaderboardFetchError) {
    return error.retryable;
  }

  if (error instanceof Error) {
    return (
      error instanceof TypeError ||
      error.name === "TimeoutError" ||
      error.name === "AbortError"
    );
  }

  return false;
};

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const toIso = (timestampMs: number) => new Date(timestampMs).toISOString();

const withCacheInfo = (
  snapshot: CachedLeaderboard,
  status: LeaderboardCacheStatus
): LeaderboardResponse => ({
  updatedAt: snapshot.updatedAt,
  stats: snapshot.stats,
  entries: snapshot.entries,
  cache: {
    status,
    fetchedAt: toIso(snapshot.fetchedAtMs),
    expiresAt: toIso(snapshot.expiresAtMs),
    staleUntil: toIso(snapshot.staleUntilMs),
  },
});

const fetchLeaderboardOnce = async (
  config: AppConfig
): Promise<CachedLeaderboard> => {
  const signal = AbortSignal.timeout(config.leaderboardFetchTimeoutMs);
  const response = await fetch(config.leaderboardUrl, {
    signal,
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent": "Mozilla/5.0 leaderboard-fetcher",
    },
  });

  if (!response.ok) {
    throw new LeaderboardFetchError(
      `MegaETH leaderboard returned HTTP ${response.status}`,
      isRetryableStatus(response.status)
    );
  }

  const html = await response.text();
  const flightPayload = decodeNextFlight(html);
  const payload = parseLeaderboardPayload(
    extractJsonObject(flightPayload, "entries")
  );
  const fetchedAtMs = Date.now();

  return {
    updatedAt: toIso(fetchedAtMs),
    stats: buildLeaderboardStats(payload.all),
    entries: payload.all,
    fetchedAtMs,
    expiresAtMs: fetchedAtMs + config.leaderboardCacheTtlMs,
    staleUntilMs:
      fetchedAtMs +
      config.leaderboardCacheTtlMs +
      config.leaderboardStaleTtlMs,
  };
};

export const fetchLeaderboardFromSource = async (
  config: AppConfig = getConfig()
): Promise<LeaderboardResponse> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.leaderboardFetchAttempts; attempt += 1) {
    try {
      const snapshot = await fetchLeaderboardOnce(config);
      cachedLeaderboard = snapshot;
      return withCacheInfo(snapshot, "fresh");
    } catch (error) {
      lastError = error;

      if (
        attempt >= config.leaderboardFetchAttempts ||
        !isRetryableError(error)
      ) {
        break;
      }

      const backoffMs =
        config.leaderboardRetryBaseDelayMs * 2 ** Math.max(0, attempt - 1);
      if (backoffMs > 0) {
        await delay(backoffMs);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unknown leaderboard fetch failure");
};

export const getLeaderboard = async (
  config: AppConfig = getConfig()
): Promise<LeaderboardResponse> => {
  const now = Date.now();

  if (cachedLeaderboard && now < cachedLeaderboard.expiresAtMs) {
    return withCacheInfo(cachedLeaderboard, "fresh");
  }

  if (!inflightRequest) {
    inflightRequest = fetchLeaderboardFromSource(config).finally(() => {
      inflightRequest = null;
    });
  }

  try {
    return await inflightRequest;
  } catch (error) {
    if (cachedLeaderboard && now < cachedLeaderboard.staleUntilMs) {
      return withCacheInfo(cachedLeaderboard, "stale");
    }

    throw error;
  }
};
