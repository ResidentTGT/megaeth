export type LeaderboardEntry = {
  rank: number;
  displayName: string;
  totalPoints: number;
  weeklyPointsChange: number;
};

export type LeaderboardPayload = {
  weekly: LeaderboardEntry[];
  all: LeaderboardEntry[];
};

export type LeaderboardSeason = {
  seasonId: number;
  seasonName: string;
  status: string;
  startsAt: string;
  endsAt: string;
};

export type LeaderboardStats = {
  entriesCount: number;
  totalPointsSum: number;
  totalWeeklyPointsChangeSum: number;
  seasonCurrentWeek: number;
  seasonCompletedWeeks: number;
  seasonTotalWeeks: number;
  projectedRemainingWeeks: number;
  projectedTotalPoints: number;
  averageTotalPoints: number;
};

export type LeaderboardSortKey =
  | "rank"
  | "displayName"
  | "totalPoints"
  | "weeklyPointsChange";

export type SortDirection = "asc" | "desc";

export type LeaderboardCacheStatus = "fresh" | "stale";

export type LeaderboardCacheInfo = {
  status: LeaderboardCacheStatus;
  fetchedAt: string;
  expiresAt: string;
  staleUntil: string;
};

export type LeaderboardResponse = {
  updatedAt: string;
  season?: LeaderboardSeason;
  stats: LeaderboardStats;
  entries: LeaderboardEntry[];
  pagination?: LeaderboardPagination;
  cache?: LeaderboardCacheInfo;
};

export type LeaderboardPagination = {
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
};

export type AppSuggestedAction = {
  icon: string;
  description: string;
  link: string;
};

export type EcosystemApp = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  imageUrl: string | null;
  websiteUrl: string | null;
  redirectUrls: string[];
  categories: string[];
  metadata: {
    x?: number;
    y?: number;
  };
  suggestedActions: AppSuggestedAction[];
  clientId: string | null;
  status: string;
  activeUntil: string | null;
  comingSoon: boolean;
  isLiveSoon: boolean;
  liveSoonAt: string | null;
  rabbitholeProjectId: number | null;
  gallery: string[];
  twitter: string | null;
  telegram: string | null;
  discord: string | null;
  github: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AppsResponse = {
  updatedAt: string;
  apps: EcosystemApp[];
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

const unsafeUrlProtocols = new Set(["javascript:", "data:", "vbscript:"]);

const validateUrl = (
  value: string,
  path: string,
  options: { httpOnly: boolean }
) => {
  const text = value.trim();

  try {
    const url = new URL(text);
    if (unsafeUrlProtocols.has(url.protocol)) {
      fail(path, "a safe URL");
    }

    if (options.httpOnly && url.protocol !== "http:" && url.protocol !== "https:") {
      fail(path, "an HTTP(S) URL");
    }
  } catch {
    fail(path, options.httpOnly ? "a valid HTTP(S) URL" : "a valid safe URL");
  }

  return text;
};

const readUrlString = (value: unknown, path: string) =>
  validateUrl(readString(value, path), path, { httpOnly: true });

const readSafeUrlString = (value: unknown, path: string) =>
  validateUrl(readString(value, path), path, { httpOnly: false });

const readFiniteNumber = (value: unknown, path: string) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(path, "a finite number");
  }

  return value as number;
};

const readBoolean = (value: unknown, path: string) => {
  if (typeof value !== "boolean") {
    fail(path, "a boolean");
  }

  return value as boolean;
};

const readNullableString = (value: unknown, path: string) => {
  if (value === null || value === undefined) {
    return null;
  }

  return readString(value, path, true);
};

const readNullableUrlString = (value: unknown, path: string) => {
  const text = readNullableString(value, path);
  if (text === null || text.trim().length === 0) {
    return null;
  }

  return validateUrl(text, path, { httpOnly: true });
};

const readStringArray = (value: unknown, path: string) => {
  if (!Array.isArray(value)) {
    fail(path, "an array");
  }

  return (value as unknown[]).map((item, index) =>
    readString(item, `${path}[${index}]`, true)
  );
};

const readUrlStringArray = (value: unknown, path: string) => {
  if (!Array.isArray(value)) {
    fail(path, "an array");
  }

  return (value as unknown[]).map((item, index) =>
    readUrlString(item, `${path}[${index}]`)
  );
};

const readSafeUrlStringArray = (value: unknown, path: string) => {
  if (!Array.isArray(value)) {
    fail(path, "an array");
  }

  return (value as unknown[]).map((item, index) =>
    readSafeUrlString(item, `${path}[${index}]`)
  );
};

const readEntry = (value: unknown, path: string): LeaderboardEntry => {
  const entry = readRecord(value, path);

  return {
    rank: readFiniteNumber(entry.rank, `${path}.rank`),
    displayName: readString(entry.displayName, `${path}.displayName`, true),
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

const FALLBACK_SEASON_TOTAL_WEEKS = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const parseLeaderboardSeason = (value: unknown): LeaderboardSeason => {
  const season = readRecord(value, "season");

  return {
    seasonId: readFiniteNumber(season.seasonId, "season.seasonId"),
    seasonName: readString(season.seasonName, "season.seasonName"),
    status: readString(season.status, "season.status", true),
    startsAt: readDateString(season.startsAt, "season.startsAt"),
    endsAt: readDateString(season.endsAt, "season.endsAt"),
  };
};

const getSeasonProgress = (
  season?: LeaderboardSeason,
  now: Date = new Date()
) => {
  const startsAtMs = season ? Date.parse(season.startsAt) : Number.NaN;
  const endsAtMs = season ? Date.parse(season.endsAt) : Number.NaN;
  const hasSeasonDates =
    Number.isFinite(startsAtMs) &&
    Number.isFinite(endsAtMs) &&
    endsAtMs > startsAtMs;
  const seasonTotalWeeks = hasSeasonDates
    ? Math.max(1, Math.ceil((endsAtMs - startsAtMs) / WEEK_MS))
    : FALLBACK_SEASON_TOTAL_WEEKS;
  const elapsedWeeks = hasSeasonDates
    ? Math.max(0, Math.floor((now.getTime() - startsAtMs) / WEEK_MS))
    : 0;
  const seasonCompletedWeeks = Math.min(elapsedWeeks, seasonTotalWeeks);
  const seasonCurrentWeek =
    seasonCompletedWeeks >= seasonTotalWeeks
      ? seasonTotalWeeks
      : seasonCompletedWeeks + 1;
  const projectedRemainingWeeks = Math.max(
    seasonTotalWeeks - seasonCompletedWeeks,
    0
  );

  return {
    seasonCurrentWeek,
    seasonCompletedWeeks,
    seasonTotalWeeks,
    projectedRemainingWeeks,
  };
};

export const buildLeaderboardStats = (
  entries: readonly LeaderboardEntry[],
  weeklyEntries: readonly LeaderboardEntry[] = entries,
  season?: LeaderboardSeason,
  now: Date = new Date()
): LeaderboardStats => {
  const totalPointsSum = entries.reduce(
    (sum, entry) => sum + entry.totalPoints,
    0
  );
  const totalWeeklyPointsChangeSum = weeklyEntries.reduce(
    (sum, entry) => sum + entry.weeklyPointsChange,
    0
  );
  const seasonProgress = getSeasonProgress(season, now);

  return {
    entriesCount: entries.length,
    totalPointsSum,
    totalWeeklyPointsChangeSum,
    ...seasonProgress,
    projectedTotalPoints:
      totalPointsSum +
      totalWeeklyPointsChangeSum * seasonProgress.projectedRemainingWeeks,
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
    totalWeeklyPointsChangeSum: readFiniteNumber(
      stats.totalWeeklyPointsChangeSum,
      "response.stats.totalWeeklyPointsChangeSum"
    ),
    seasonCurrentWeek: readFiniteNumber(
      stats.seasonCurrentWeek,
      "response.stats.seasonCurrentWeek"
    ),
    seasonCompletedWeeks: readFiniteNumber(
      stats.seasonCompletedWeeks,
      "response.stats.seasonCompletedWeeks"
    ),
    seasonTotalWeeks: readFiniteNumber(
      stats.seasonTotalWeeks,
      "response.stats.seasonTotalWeeks"
    ),
    projectedRemainingWeeks: readFiniteNumber(
      stats.projectedRemainingWeeks,
      "response.stats.projectedRemainingWeeks"
    ),
    projectedTotalPoints: readFiniteNumber(
      stats.projectedTotalPoints,
      "response.stats.projectedTotalPoints"
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

const readPagination = (value: unknown): LeaderboardPagination => {
  const pagination = readRecord(value, "response.pagination");

  return {
    page: readFiniteNumber(pagination.page, "response.pagination.page"),
    pageSize: readFiniteNumber(
      pagination.pageSize,
      "response.pagination.pageSize"
    ),
    totalRows: readFiniteNumber(
      pagination.totalRows,
      "response.pagination.totalRows"
    ),
    totalPages: readFiniteNumber(
      pagination.totalPages,
      "response.pagination.totalPages"
    ),
  };
};

const readMetadata = (value: unknown, path: string): EcosystemApp["metadata"] => {
  const metadata = readRecord(value, path);
  const result: EcosystemApp["metadata"] = {};

  if (metadata.x !== undefined && metadata.x !== null) {
    result.x = readFiniteNumber(metadata.x, `${path}.x`);
  }

  if (metadata.y !== undefined && metadata.y !== null) {
    result.y = readFiniteNumber(metadata.y, `${path}.y`);
  }

  return result;
};

const readSuggestedAction = (
  value: unknown,
  path: string
): AppSuggestedAction => {
  const action = readRecord(value, path);

  return {
    icon: readString(action.icon, `${path}.icon`, true),
    description: readString(action.description, `${path}.description`, true),
    link: readUrlString(action.link, `${path}.link`),
  };
};

const readSuggestedActions = (value: unknown, path: string) => {
  if (!Array.isArray(value)) {
    fail(path, "an array");
  }

  return (value as unknown[]).map((item, index) =>
    readSuggestedAction(item, `${path}[${index}]`)
  );
};

const readApp = (value: unknown, path: string): EcosystemApp => {
  const app = readRecord(value, path);

  return {
    id: readString(app.id, `${path}.id`),
    name: readString(app.name, `${path}.name`),
    slug: readString(app.slug, `${path}.slug`),
    description: readString(app.description, `${path}.description`, true),
    logoUrl: readNullableUrlString(app.logoUrl, `${path}.logoUrl`),
    imageUrl: readNullableUrlString(app.imageUrl, `${path}.imageUrl`),
    websiteUrl: readNullableUrlString(app.websiteUrl, `${path}.websiteUrl`),
    redirectUrls: readSafeUrlStringArray(app.redirectUrls, `${path}.redirectUrls`),
    categories: readStringArray(app.categories, `${path}.categories`),
    metadata: readMetadata(app.metadata ?? {}, `${path}.metadata`),
    suggestedActions: readSuggestedActions(
      app.suggestedActions,
      `${path}.suggestedActions`
    ),
    clientId: readNullableString(app.clientId, `${path}.clientId`),
    status: readString(app.status, `${path}.status`, true),
    activeUntil: readNullableString(app.activeUntil, `${path}.activeUntil`),
    comingSoon: readBoolean(app.comingSoon, `${path}.comingSoon`),
    isLiveSoon: readBoolean(app.isLiveSoon, `${path}.isLiveSoon`),
    liveSoonAt: readNullableString(app.liveSoonAt, `${path}.liveSoonAt`),
    rabbitholeProjectId:
      app.rabbitholeProjectId === null || app.rabbitholeProjectId === undefined
        ? null
        : readFiniteNumber(
            app.rabbitholeProjectId,
            `${path}.rabbitholeProjectId`
          ),
    gallery: readUrlStringArray(app.gallery, `${path}.gallery`),
    twitter: readNullableUrlString(app.twitter, `${path}.twitter`),
    telegram: readNullableUrlString(app.telegram, `${path}.telegram`),
    discord: readNullableUrlString(app.discord, `${path}.discord`),
    github: readNullableUrlString(app.github, `${path}.github`),
    createdAt: readDateString(app.createdAt, `${path}.createdAt`),
    updatedAt: readDateString(app.updatedAt, `${path}.updatedAt`),
  };
};

export const parseAppsPayload = (value: unknown) => {
  if (!Array.isArray(value)) {
    fail("apps", "an array");
  }

  return (value as unknown[]).map((app, index) => readApp(app, `apps[${index}]`));
};

export const parseLeaderboardResponse = (value: unknown): LeaderboardResponse => {
  const response = readRecord(value, "response");

  return {
    updatedAt: readDateString(response.updatedAt, "response.updatedAt"),
    season:
      response.season === undefined || response.season === null
        ? undefined
        : parseLeaderboardSeason(response.season),
    stats: readStats(response.stats),
    entries: readEntries(response.entries, "response.entries"),
    pagination:
      response.pagination === undefined || response.pagination === null
        ? undefined
        : readPagination(response.pagination),
    cache:
      response.cache === undefined || response.cache === null
        ? undefined
        : readCacheInfo(response.cache),
  };
};

export const parseAppsResponse = (value: unknown): AppsResponse => {
  const response = readRecord(value, "response");

  return {
    updatedAt: readDateString(response.updatedAt, "response.updatedAt"),
    apps: parseAppsPayload(response.apps),
    cache:
      response.cache === undefined || response.cache === null
        ? undefined
        : readCacheInfo(response.cache),
  };
};
