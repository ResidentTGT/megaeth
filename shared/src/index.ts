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

const readStringArray = (value: unknown, path: string) => {
  if (!Array.isArray(value)) {
    fail(path, "an array");
  }

  return (value as unknown[]).map((item, index) =>
    readString(item, `${path}[${index}]`, true)
  );
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
    link: readString(action.link, `${path}.link`, true),
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
    logoUrl: readNullableString(app.logoUrl, `${path}.logoUrl`),
    imageUrl: readNullableString(app.imageUrl, `${path}.imageUrl`),
    websiteUrl: readNullableString(app.websiteUrl, `${path}.websiteUrl`),
    redirectUrls: readStringArray(app.redirectUrls, `${path}.redirectUrls`),
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
    gallery: readStringArray(app.gallery, `${path}.gallery`),
    twitter: readNullableString(app.twitter, `${path}.twitter`),
    telegram: readNullableString(app.telegram, `${path}.telegram`),
    discord: readNullableString(app.discord, `${path}.discord`),
    github: readNullableString(app.github, `${path}.github`),
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
    stats: readStats(response.stats),
    entries: readEntries(response.entries, "response.entries"),
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
