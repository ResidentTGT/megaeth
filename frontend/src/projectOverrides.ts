import {
  projectOverrides,
  type ProjectOverride,
} from "./config/projectOverrides.js";
import type { AppSuggestedAction, EcosystemApp } from "./types.js";

const normalizeProjectKey = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const overridesByName: ReadonlyMap<string, ProjectOverride> = new Map(
  projectOverrides.map((override) => [
    normalizeProjectKey(override.name),
    override,
  ])
);

const stripWww = (host: string) => host.replace(/^www\./, "");

const localHttpHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

const parseUrl = (url: string | null) => {
  if (!url) return null;

  try {
    return new URL(url);
  } catch {
    return null;
  }
};

const isUsableLaunchUrl = (url: string) => {
  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return false;

  if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
    return !localHttpHosts.has(parsedUrl.hostname);
  }

  return true;
};

const readHttpHost = (url: string | null) => {
  const parsedUrl = parseUrl(url);
  return parsedUrl?.protocol === "http:" || parsedUrl?.protocol === "https:"
    ? stripWww(parsedUrl.hostname)
    : null;
};

const hostsMatch = (left: string, right: string) =>
  left === right || left.endsWith(`.${right}`) || right.endsWith(`.${left}`);

const getFallbackLaunchUrl = (app: EcosystemApp) =>
  [app.websiteUrl, ...app.redirectUrls].find(
    (url): url is string => Boolean(url && isUsableLaunchUrl(url))
  ) ?? null;

export const getProjectOverride = (app: EcosystemApp) =>
  overridesByName.get(normalizeProjectKey(app.name)) ?? null;

export const getProjectLaunchUrl = (app: EcosystemApp) =>
  getProjectOverride(app)?.referralUrl ?? getFallbackLaunchUrl(app);

export const getProjectActionUrl = (
  app: EcosystemApp,
  action: AppSuggestedAction
) => {
  const override = getProjectOverride(app);
  if (!override?.referralUrl) return action.link;

  const actionHost = readHttpHost(action.link);
  if (!actionHost) return action.link;

  const launchHosts = [app.websiteUrl, ...app.redirectUrls]
    .map(readHttpHost)
    .filter((host): host is string => Boolean(host));

  return launchHosts.some((host) => hostsMatch(actionHost, host))
    ? override.referralUrl
    : action.link;
};
