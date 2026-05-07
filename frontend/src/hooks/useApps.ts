import { useCallback, useEffect, useState } from "react";
import { fetchApps } from "../api.js";
import type { AppsResponse } from "../types.js";

export const useApps = () => {
  const [apps, setApps] = useState<AppsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApps = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchApps(signal);
      setApps(response);
    } catch (unknownError) {
      if (
        unknownError instanceof DOMException &&
        unknownError.name === "AbortError"
      ) {
        return;
      }

      setError(
        unknownError instanceof Error ? unknownError.message : "Failed to load apps"
      );
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadApps(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadApps]);

  return {
    apps,
    error,
    isLoading,
    reload: loadApps,
  };
};
