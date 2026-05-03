import { averageFormatter, numberFormatter } from "../format.js";
import type { LeaderboardStats } from "../types.js";

type MetricsProps = {
  stats: LeaderboardStats | null;
};

export const Metrics = ({ stats }: MetricsProps) => (
  <section className="metrics" aria-label="Leaderboard summary">
    <div className="metric">
      <span className="metric-label">Entries</span>
      <strong>{stats ? numberFormatter.format(stats.entriesCount) : "-"}</strong>
    </div>
    <div className="metric">
      <span className="metric-label">Total Points</span>
      <strong>{stats ? numberFormatter.format(stats.totalPointsSum) : "-"}</strong>
    </div>
    <div className="metric">
      <span className="metric-label">Average Points</span>
      <strong>
        {stats ? averageFormatter.format(stats.averageTotalPoints) : "-"}
      </strong>
    </div>
  </section>
);
