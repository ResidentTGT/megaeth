import { parseLeaderboardResponse } from "@megaeth-leaderboard/shared";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const fetchLeaderboard = async (signal?: AbortSignal) => {
  const response = await fetch(`${API_BASE_URL}/leaderboard`, {
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
