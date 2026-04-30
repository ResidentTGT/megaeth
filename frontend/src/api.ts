import type { LeaderboardResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const fetchLeaderboard = async (signal?: AbortSignal) => {
  const response = await fetch(`${API_BASE_URL}/leaderboard`, { signal });

  if (!response.ok) {
    throw new Error(`Server returned HTTP ${response.status}`);
  }

  return (await response.json()) as LeaderboardResponse;
};
