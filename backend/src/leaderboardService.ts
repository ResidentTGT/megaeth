import { decodeNextFlight, extractJsonObject } from "./nextFlight.js";
import type { LeaderboardPayload, LeaderboardResponse } from "./types.js";

const LEADERBOARD_URL = "https://terminal.megaeth.com/leaderboard";
const CACHE_TTL_MS = Number(process.env.LEADERBOARD_CACHE_TTL_MS ?? 60_000);

let cachedResponse: LeaderboardResponse | null = null;
let cacheExpiresAt = 0;
let inflightRequest: Promise<LeaderboardResponse> | null = null;

const fetchLeaderboardFromSource = async (): Promise<LeaderboardResponse> => {
  const response = await fetch(LEADERBOARD_URL, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent": "Mozilla/5.0 leaderboard-fetcher",
    },
  });

  if (!response.ok) {
    throw new Error(`MegaETH leaderboard returned HTTP ${response.status}`);
  }

  const html = await response.text();
  const flightPayload = decodeNextFlight(html);
  const entries = extractJsonObject<LeaderboardPayload>(flightPayload, "entries");

  if (!Array.isArray(entries.all)) {
    throw new Error("MegaETH leaderboard payload does not contain entries.all");
  }

  return {
    updatedAt: new Date().toISOString(),
    entries: entries.all,
  };
};

export const getLeaderboard = async (): Promise<LeaderboardResponse> => {
  const now = Date.now();

  if (cachedResponse && now < cacheExpiresAt) {
    return cachedResponse;
  }

  if (!inflightRequest) {
    inflightRequest = fetchLeaderboardFromSource()
      .then((response) => {
        cachedResponse = response;
        cacheExpiresAt = Date.now() + CACHE_TTL_MS;
        return response;
      })
      .finally(() => {
        inflightRequest = null;
      });
  }

  return inflightRequest;
};
