import { useCallback, useEffect, useState } from "react";
import { fetchLeaderboard } from "../api.js";
import type { LeaderboardResponse } from "../types.js";

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchLeaderboard(signal);
      setLeaderboard(response);
    } catch (unknownError) {
      if (
        unknownError instanceof DOMException &&
        unknownError.name === "AbortError"
      ) {
        return;
      }

      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Failed to load leaderboard"
      );
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadLeaderboard(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadLeaderboard]);

  return {
    error,
    isLoading,
    leaderboard,
    reload: loadLeaderboard,
  };
};
