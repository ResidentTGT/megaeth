import type {
  LeaderboardCacheInfo,
  LeaderboardCacheStatus,
} from "@megaeth-leaderboard/shared";
import type { AppConfig } from "./config.js";
import { getConfig } from "./config.js";

type CachedSnapshot<TData extends object> = TData & {
  updatedAt: string;
  fetchedAtMs: number;
  expiresAtMs: number;
  staleUntilMs: number;
};

type CachedFetcherOptions<TData extends object, TResponse> = {
  name: string;
  fetchData: (config: AppConfig, signal: AbortSignal) => Promise<TData>;
  getCacheTtlMs: (config: AppConfig) => number;
  toResponse: (
    snapshot: CachedSnapshot<TData>,
    status: LeaderboardCacheStatus
  ) => TResponse;
};

export class RetryableFetchError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = "RetryableFetchError";
    this.retryable = retryable;
  }
}

export const isRetryableStatus = (status: number) =>
  status === 408 || status === 429 || status >= 500;

const isRetryableError = (error: unknown) => {
  if (error instanceof RetryableFetchError) {
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

export const buildCacheInfo = (
  snapshot: CachedSnapshot<object>,
  status: LeaderboardCacheStatus
): LeaderboardCacheInfo => ({
  status,
  fetchedAt: toIso(snapshot.fetchedAtMs),
  expiresAt: toIso(snapshot.expiresAtMs),
  staleUntil: toIso(snapshot.staleUntilMs),
});

export const createCachedFetcher = <TData extends object, TResponse>({
  name,
  fetchData,
  getCacheTtlMs,
  toResponse,
}: CachedFetcherOptions<TData, TResponse>) => {
  let cachedSnapshot: CachedSnapshot<TData> | null = null;
  let inflightRequest: Promise<TResponse> | null = null;

  const fetchFromSource = async (
    config: AppConfig = getConfig()
  ): Promise<TResponse> => {
    let lastError: unknown;

    for (
      let attempt = 1;
      attempt <= config.leaderboardFetchAttempts;
      attempt += 1
    ) {
      try {
        const signal = AbortSignal.timeout(config.leaderboardFetchTimeoutMs);
        const data = await fetchData(config, signal);
        const fetchedAtMs = Date.now();
        const cacheTtlMs = getCacheTtlMs(config);
        const snapshot: CachedSnapshot<TData> = {
          ...data,
          updatedAt: toIso(fetchedAtMs),
          fetchedAtMs,
          expiresAtMs: fetchedAtMs + cacheTtlMs,
          staleUntilMs:
            fetchedAtMs + cacheTtlMs + config.leaderboardStaleTtlMs,
        };

        cachedSnapshot = snapshot;
        return toResponse(snapshot, "fresh");
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
      : new Error(`Unknown ${name} fetch failure`);
  };

  const get = async (config: AppConfig = getConfig()): Promise<TResponse> => {
    const now = Date.now();

    if (cachedSnapshot && now < cachedSnapshot.expiresAtMs) {
      return toResponse(cachedSnapshot, "fresh");
    }

    if (!inflightRequest) {
      inflightRequest = fetchFromSource(config).finally(() => {
        inflightRequest = null;
      });
    }

    try {
      return await inflightRequest;
    } catch (error) {
      if (cachedSnapshot && now < cachedSnapshot.staleUntilMs) {
        return toResponse(cachedSnapshot, "stale");
      }

      throw error;
    }
  };

  const clear = () => {
    cachedSnapshot = null;
    inflightRequest = null;
  };

  return {
    clear,
    fetchFromSource,
    get,
  };
};
