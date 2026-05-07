import {
  parseAppsResponse,
  parseLeaderboardResponse,
} from "@megaeth-leaderboard/shared";
import type { LeaderboardSortKey, SortDirection } from "./types.js";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type LeaderboardRequest = {
  page: number;
  pageSize: number;
  query: string;
  sortKey: LeaderboardSortKey;
  sortDirection: SortDirection;
};

const getLeaderboardUrl = (request?: LeaderboardRequest) => {
  if (!request) return `${API_BASE_URL}/leaderboard`;

  const params = new URLSearchParams({
    page: request.page.toString(),
    pageSize: request.pageSize.toString(),
    query: request.query,
    sortKey: request.sortKey,
    sortDirection: request.sortDirection,
  });

  return `${API_BASE_URL}/leaderboard?${params}`;
};

export const fetchLeaderboard = async (
  request?: LeaderboardRequest,
  signal?: AbortSignal
) => {
  const response = await fetch(getLeaderboardUrl(request), {
    headers: {
      accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Server returned HTTP ${response.status}`);
  }

  return parseLeaderboardResponse(await response.json());
};

export const fetchApps = async (signal?: AbortSignal) => {
  const response = await fetch(`${API_BASE_URL}/apps`, {
    headers: {
      accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Server returned HTTP ${response.status}`);
  }

  return parseAppsResponse(await response.json());
};
