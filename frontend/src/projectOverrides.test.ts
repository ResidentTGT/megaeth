import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getProjectActionUrl,
  getProjectLaunchUrl,
  getProjectOverride,
} from "./projectOverrides.js";
import type { EcosystemApp } from "./types.js";

const createApp = (overrides: Partial<EcosystemApp>): EcosystemApp => ({
  id: "1",
  slug: "unknown",
  name: "Unknown",
  description: "",
  categories: [],
  websiteUrl: null,
  redirectUrls: [],
  logoUrl: null,
  imageUrl: null,
  status: "Active",
  activeUntil: null,
  comingSoon: false,
  isLiveSoon: false,
  liveSoonAt: null,
  rabbitholeProjectId: null,
  suggestedActions: [],
  clientId: null,
  gallery: [],
  twitter: null,
  discord: null,
  telegram: null,
  github: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  metadata: {},
  ...overrides,
});

test("getProjectOverride matches known projects by name", () => {
  const app = createApp({ name: "Hit One" });

  assert.equal(
    getProjectOverride(app)?.referralUrl,
    "https://app.hit.one/r/NMAE4M"
  );
});

test("getProjectLaunchUrl prefers a referral link when one is configured", () => {
  const app = createApp({
    name: "AveForge",
    websiteUrl: "https://aveforge.gg",
  });

  assert.equal(
    getProjectLaunchUrl(app),
    "https://aveforge.gg/?referralCode=resident3342"
  );
});

test("getProjectLaunchUrl falls back to website before redirect URLs", () => {
  const app = createApp({
    name: "Unknown",
    websiteUrl: "https://example.com",
    redirectUrls: ["https://example.com/terminal"],
  });

  assert.equal(getProjectLaunchUrl(app), "https://example.com");
});

test("getProjectLaunchUrl ignores local redirect URLs", () => {
  const app = createApp({
    name: "Unknown",
    websiteUrl: null,
    redirectUrls: [
      "http://localhost/terminal",
      "http://localhost:3000/terminal",
      "https://play.example.com/terminal",
    ],
  });

  assert.equal(getProjectLaunchUrl(app), "https://play.example.com/terminal");
});

test("getProjectActionUrl only rewrites same-project links", () => {
  const app = createApp({
    name: "Hit.One",
    websiteUrl: "https://hit.one",
  });

  assert.equal(
    getProjectActionUrl(app, {
      description: "Trade",
      icon: "trade",
      link: "https://app.hit.one/trade",
    }),
    "https://app.hit.one/r/NMAE4M"
  );
  assert.equal(
    getProjectActionUrl(app, {
      description: "Follow",
      icon: "x",
      link: "https://x.com/hitone",
    }),
    "https://x.com/hitone"
  );
});

test("projects without referral links still expose comments", () => {
  const app = createApp({ name: "blackhaven" });

  assert.match(getProjectOverride(app)?.comment ?? "", /USDm/);
  assert.equal(getProjectLaunchUrl(app), null);
});
