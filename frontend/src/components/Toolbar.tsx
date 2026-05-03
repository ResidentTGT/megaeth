import { RefreshCcw } from "lucide-react";
import { formatUpdatedAt, numberFormatter } from "../format.js";
import type { LeaderboardResponse } from "../types.js";

type ToolbarProps = {
  isLoading: boolean;
  leaderboard: LeaderboardResponse | null;
  onRefresh: () => void;
};

export const Toolbar = ({ isLoading, leaderboard, onRefresh }: ToolbarProps) => {
  const cacheStatus = leaderboard?.cache?.status;

  return (
    <header className="toolbar">
      <div>
        <h1>Leaderboard</h1>
        <p>
          {leaderboard ? numberFormatter.format(leaderboard.entries.length) : "-"}{" "}
          entries - Updated {formatUpdatedAt(leaderboard?.updatedAt)}
          {cacheStatus === "stale" ? " - Showing cached data" : ""}
        </p>
      </div>

      <button
        className="refresh-button"
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCcw size={16} aria-hidden="true" />
        Refresh
      </button>
    </header>
  );
};
