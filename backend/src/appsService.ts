import {
  parseAppsPayload,
  type AppsResponse,
  type LeaderboardCacheStatus,
} from "@megaeth-leaderboard/shared";
import type { AppConfig } from "./config.js";
import { getConfig } from "./config.js";
import { decodeNextFlight, extractJsonArrayStartingWith } from "./nextFlight.js";

type CachedApps = Omit<AppsResponse, "cache"> & {
  fetchedAtMs: number;
  expiresAtMs: number;
  staleUntilMs: number;
};

class AppsFetchError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = "AppsFetchError";
    this.retryable = retryable;
  }
}

let cachedApps: CachedApps | null = null;
let inflightRequest: Promise<AppsResponse> | null = null;

const isRetryableStatus = (status: number) =>
  status === 408 || status === 429 || status >= 500;

const isRetryableError = (error: unknown) => {
  if (error instanceof AppsFetchError) {
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
  snapshot: CachedApps,
  status: LeaderboardCacheStatus
): AppsResponse => ({
  updatedAt: snapshot.updatedAt,
  apps: snapshot.apps,
  cache: {
    status,
    fetchedAt: toIso(snapshot.fetchedAtMs),
    expiresAt: toIso(snapshot.expiresAtMs),
    staleUntil: toIso(snapshot.staleUntilMs),
  },
});

const isNamedApp = (value: unknown) =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  typeof (value as { name?: unknown }).name === "string";

const fetchAppsOnce = async (config: AppConfig): Promise<CachedApps> => {
  const signal = AbortSignal.timeout(config.leaderboardFetchTimeoutMs);
  const response = await fetch(config.appsUrl, {
    signal,
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent": "Mozilla/5.0 apps-fetcher",
    },
  });

  if (!response.ok) {
    throw new AppsFetchError(
      `MegaETH apps returned HTTP ${response.status}`,
      isRetryableStatus(response.status)
    );
  }

  const html = await response.text();
  const flightPayload = decodeNextFlight(html);
  const appsPayload = extractJsonArrayStartingWith(
    flightPayload,
    '"name":"gTrade | Gains Network"'
  );
  const namedAppsPayload = Array.isArray(appsPayload)
    ? appsPayload.filter(isNamedApp)
    : appsPayload;
  const apps = parseAppsPayload(
    namedAppsPayload
  );
  const fetchedAtMs = Date.now();

  return {
    updatedAt: toIso(fetchedAtMs),
    apps,
    fetchedAtMs,
    expiresAtMs: fetchedAtMs + config.appsCacheTtlMs,
    staleUntilMs:
      fetchedAtMs + config.appsCacheTtlMs + config.leaderboardStaleTtlMs,
  };
};

export const fetchAppsFromSource = async (
  config: AppConfig = getConfig()
): Promise<AppsResponse> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.leaderboardFetchAttempts; attempt += 1) {
    try {
      const snapshot = await fetchAppsOnce(config);
      cachedApps = snapshot;
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
    : new Error("Unknown apps fetch failure");
};

export const getApps = async (
  config: AppConfig = getConfig()
): Promise<AppsResponse> => {
  const now = Date.now();

  if (cachedApps && now < cachedApps.expiresAtMs) {
    return withCacheInfo(cachedApps, "fresh");
  }

  if (!inflightRequest) {
    inflightRequest = fetchAppsFromSource(config).finally(() => {
      inflightRequest = null;
    });
  }

  try {
    return await inflightRequest;
  } catch (error) {
    if (cachedApps && now < cachedApps.staleUntilMs) {
      return withCacheInfo(cachedApps, "stale");
    }

    throw error;
  }
};
