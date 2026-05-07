import { parseAppsPayload, type AppsResponse } from "@megaeth-leaderboard/shared";
import type { AppConfig } from "./config.js";
import { getConfig } from "./config.js";
import { decodeNextFlight, extractJsonArrayMatching } from "./nextFlight.js";
import {
  buildCacheInfo,
  createCachedFetcher,
  isRetryableStatus,
  RetryableFetchError,
} from "./upstreamCache.js";

type AppsData = Pick<AppsResponse, "apps">;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);

const isAppRecord = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string" &&
  typeof value.slug === "string" &&
  Array.isArray(value.categories) &&
  Array.isArray(value.suggestedActions) &&
  typeof value.status === "string" &&
  typeof value.comingSoon === "boolean" &&
  typeof value.isLiveSoon === "boolean";

const isAppsPayload = (value: unknown) =>
  Array.isArray(value) && value.some(isAppRecord);

const fetchAppsData = async (
  config: AppConfig,
  signal: AbortSignal
): Promise<AppsData> => {
  const response = await fetch(config.appsUrl, {
    signal,
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent": "Mozilla/5.0 apps-fetcher",
    },
  });

  if (!response.ok) {
    throw new RetryableFetchError(
      `MegaETH apps returned HTTP ${response.status}`,
      isRetryableStatus(response.status)
    );
  }

  const html = await response.text();
  const flightPayload = decodeNextFlight(html);
  const appsPayload = extractJsonArrayMatching(
    flightPayload,
    isAppsPayload,
    "MegaETH apps payload"
  );
  const apps = parseAppsPayload(
    Array.isArray(appsPayload) ? appsPayload.filter(isAppRecord) : appsPayload
  );

  return {
    apps,
  };
};

const appsFetcher = createCachedFetcher<AppsData, AppsResponse>({
  name: "apps",
  fetchData: fetchAppsData,
  getCacheTtlMs: (config) => config.appsCacheTtlMs,
  toResponse: (snapshot, status) => ({
    updatedAt: snapshot.updatedAt,
    apps: snapshot.apps,
    cache: buildCacheInfo(snapshot, status),
  }),
});

export const fetchAppsFromSource = (
  config: AppConfig = getConfig()
): Promise<AppsResponse> => appsFetcher.fetchFromSource(config);

export const getApps = (
  config: AppConfig = getConfig()
): Promise<AppsResponse> => appsFetcher.get(config);

export const clearAppsCache = () => {
  appsFetcher.clear();
};
