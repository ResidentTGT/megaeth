const DEFAULT_LEADERBOARD_URL = "https://terminal.megaeth.com/leaderboard";
const DEFAULT_FRONTEND_ORIGINS =
  "http://localhost:5173,http://127.0.0.1:5173";

export type AppConfig = {
  port: number;
  host: string;
  frontendOrigins: string[];
  leaderboardUrl: string;
  leaderboardCacheTtlMs: number;
  leaderboardStaleTtlMs: number;
  leaderboardFetchTimeoutMs: number;
  leaderboardFetchAttempts: number;
  leaderboardRetryBaseDelayMs: number;
};

type NumberOptions = {
  integer?: boolean;
  min?: number;
  max?: number;
};

const readString = (
  env: NodeJS.ProcessEnv,
  key: string,
  defaultValue: string
) => {
  const value = env[key]?.trim() || defaultValue;

  if (!value) {
    throw new Error(`${key} must not be empty`);
  }

  return value;
};

const readNumber = (
  env: NodeJS.ProcessEnv,
  key: string,
  defaultValue: number,
  options: NumberOptions = {}
) => {
  const rawValue = env[key]?.trim();
  const value = rawValue === undefined || rawValue === "" ? defaultValue : Number(rawValue);

  if (!Number.isFinite(value)) {
    throw new Error(`${key} must be a finite number`);
  }

  if (options.integer && !Number.isInteger(value)) {
    throw new Error(`${key} must be an integer`);
  }

  if (options.min !== undefined && value < options.min) {
    throw new Error(`${key} must be greater than or equal to ${options.min}`);
  }

  if (options.max !== undefined && value > options.max) {
    throw new Error(`${key} must be less than or equal to ${options.max}`);
  }

  return value;
};

const readUrl = (
  env: NodeJS.ProcessEnv,
  key: string,
  defaultValue: string
) => {
  const value = readString(env, key, defaultValue);

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("URL protocol must be http or https");
    }
  } catch (error) {
    const reason = error instanceof Error ? `: ${error.message}` : "";
    throw new Error(`${key} must be a valid HTTP(S) URL${reason}`, {
      cause: error,
    });
  }

  return value;
};

const readOrigins = (env: NodeJS.ProcessEnv) => {
  const rawValue = readString(
    env,
    "FRONTEND_ORIGIN",
    DEFAULT_FRONTEND_ORIGINS
  );
  const origins = rawValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!origins.length) {
    throw new Error("FRONTEND_ORIGIN must contain at least one origin");
  }

  for (const origin of origins) {
    try {
      new URL(origin);
    } catch (error) {
      const reason = error instanceof Error ? `: ${error.message}` : "";
      throw new Error(`FRONTEND_ORIGIN contains an invalid origin${reason}`, {
        cause: error,
      });
    }
  }

  return origins;
};

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): AppConfig => ({
  port: readNumber(env, "PORT", 4000, { integer: true, min: 1, max: 65_535 }),
  host: readString(env, "HOST", "0.0.0.0"),
  frontendOrigins: readOrigins(env),
  leaderboardUrl: readUrl(env, "LEADERBOARD_URL", DEFAULT_LEADERBOARD_URL),
  leaderboardCacheTtlMs: readNumber(env, "LEADERBOARD_CACHE_TTL_MS", 60_000, {
    integer: true,
    min: 0,
  }),
  leaderboardStaleTtlMs: readNumber(env, "LEADERBOARD_STALE_TTL_MS", 300_000, {
    integer: true,
    min: 0,
  }),
  leaderboardFetchTimeoutMs: readNumber(
    env,
    "LEADERBOARD_FETCH_TIMEOUT_MS",
    10_000,
    { integer: true, min: 100 }
  ),
  leaderboardFetchAttempts: readNumber(env, "LEADERBOARD_FETCH_ATTEMPTS", 3, {
    integer: true,
    min: 1,
    max: 10,
  }),
  leaderboardRetryBaseDelayMs: readNumber(
    env,
    "LEADERBOARD_RETRY_BASE_DELAY_MS",
    250,
    { integer: true, min: 0 }
  ),
});

let cachedConfig: AppConfig | null = null;

export const getConfig = () => {
  cachedConfig ??= loadConfig();
  return cachedConfig;
};
