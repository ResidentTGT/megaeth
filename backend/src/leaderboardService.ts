import {
  buildLeaderboardStats,
  parseLeaderboardPayload,
  type LeaderboardResponse,
} from "@megaeth-leaderboard/shared";
import type { AppConfig } from "./config.js";
import { getConfig } from "./config.js";
import { decodeNextFlight, extractJsonObject } from "./nextFlight.js";
import {
  buildCacheInfo,
  createCachedFetcher,
  isRetryableStatus,
  RetryableFetchError,
} from "./upstreamCache.js";

type LeaderboardData = Pick<LeaderboardResponse, "entries" | "stats">;

const fetchLeaderboardData = async (
  config: AppConfig,
  signal: AbortSignal
): Promise<LeaderboardData> => {
  const response = await fetch(config.leaderboardUrl, {
    signal,
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent": "Mozilla/5.0 leaderboard-fetcher",
    },
  });

  if (!response.ok) {
    throw new RetryableFetchError(
      `MegaETH leaderboard returned HTTP ${response.status}`,
      isRetryableStatus(response.status)
    );
  }

  const html = await response.text();
  const flightPayload = decodeNextFlight(html);
  const payload = parseLeaderboardPayload(
    extractJsonObject(flightPayload, "entries")
  );

  return {
    stats: buildLeaderboardStats(payload.all),
    entries: payload.all,
  };
};

const leaderboardFetcher = createCachedFetcher<LeaderboardData, LeaderboardResponse>({
  name: "leaderboard",
  fetchData: fetchLeaderboardData,
  getCacheTtlMs: (config) => config.leaderboardCacheTtlMs,
  toResponse: (snapshot, status) => ({
    updatedAt: snapshot.updatedAt,
    stats: snapshot.stats,
    entries: snapshot.entries,
    cache: buildCacheInfo(snapshot, status),
  }),
});

export const fetchLeaderboardFromSource = (
  config: AppConfig = getConfig()
): Promise<LeaderboardResponse> => leaderboardFetcher.fetchFromSource(config);

export const getLeaderboard = (
  config: AppConfig = getConfig()
): Promise<LeaderboardResponse> => leaderboardFetcher.get(config);

export const clearLeaderboardCache = () => {
  leaderboardFetcher.clear();
};
