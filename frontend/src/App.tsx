import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  RefreshCcw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchLeaderboard } from "./api";
import type { LeaderboardEntry, LeaderboardResponse } from "./types";

type SortKey =
  | "rank"
  | "mainWalletAddress"
  | "xAccount"
  | "totalPoints"
  | "weeklyPointsChange";

type SortDirection = "asc" | "desc";

type SortState = {
  key: SortKey;
  direction: SortDirection;
};

const columns: Array<{ key: SortKey; label: string; numeric?: boolean }> = [
  { key: "rank", label: "Rank", numeric: true },
  { key: "mainWalletAddress", label: "Wallet" },
  { key: "xAccount", label: "X Account" },
  { key: "totalPoints", label: "Total Points", numeric: true },
  { key: "weeklyPointsChange", label: "Weekly Change", numeric: true },
];

const numberFormatter = new Intl.NumberFormat("en-US");

const compareValues = (
  left: LeaderboardEntry,
  right: LeaderboardEntry,
  sort: SortState
) => {
  const leftValue = left[sort.key];
  const rightValue = right[sort.key];

  if (typeof leftValue === "number" && typeof rightValue === "number") {
    return leftValue - rightValue;
  }

  return String(leftValue ?? "").localeCompare(String(rightValue ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
};

const SortIcon = ({ sort, column }: { sort: SortState; column: SortKey }) => {
  if (sort.key !== column) {
    return <ArrowUpDown size={14} aria-hidden="true" />;
  }

  return sort.direction === "asc" ? (
    <ArrowUp size={14} aria-hidden="true" />
  ) : (
    <ArrowDown size={14} aria-hidden="true" />
  );
};

const formatUpdatedAt = (value?: string) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
};

export default function App() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletQuery, setWalletQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "rank", direction: "asc" });

  const loadLeaderboard = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchLeaderboard(signal);
      setLeaderboard(response);
    } catch (unknownError) {
      if (unknownError instanceof DOMException && unknownError.name === "AbortError") {
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

  const rows = useMemo(() => {
    const query = walletQuery.trim().toLowerCase();
    const entries = leaderboard?.entries ?? [];

    const filteredEntries = entries.filter((entry) => {
      if (!query) return true;
      return entry.mainWalletAddress.toLowerCase().includes(query);
    });

    return [...filteredEntries].sort((left, right) => {
      const result = compareValues(left, right, sort);
      return sort.direction === "asc" ? result : -result;
    });
  }, [leaderboard, sort, walletQuery]);

  const toggleSort = (key: SortKey) => {
    setSort((current) => {
      if (current.key !== key) {
        return { key, direction: "asc" };
      }

      return {
        key,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">MegaETH</div>
        <nav className="tabs" aria-label="Primary navigation">
          <button className="tab active" type="button">
            Leaderboard
          </button>
        </nav>
      </aside>

      <main className="content">
        <header className="toolbar">
          <div>
            <h1>Leaderboard</h1>
            <p>
              {leaderboard ? numberFormatter.format(leaderboard.entries.length) : "-"}{" "}
              entries · Updated {formatUpdatedAt(leaderboard?.updatedAt)}
            </p>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={() => void loadLeaderboard()}
            disabled={isLoading}
          >
            <RefreshCcw size={16} aria-hidden="true" />
            Refresh
          </button>
        </header>

        <section className="controls" aria-label="Leaderboard controls">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={walletQuery}
              placeholder="Search wallet address"
              onChange={(event) => setWalletQuery(event.target.value)}
            />
          </label>
          <span className="result-count">
            Showing {numberFormatter.format(rows.length)} rows
          </span>
        </section>

        {error ? (
          <div className="state-message error" role="alert">
            {error}
          </div>
        ) : null}

        <section className="table-wrap" aria-label="Leaderboard table">
          {isLoading && !leaderboard ? (
            <div className="state-message">Loading leaderboard...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className={column.numeric ? "numeric" : ""}>
                      <button
                        className="sort-button"
                        type="button"
                        onClick={() => toggleSort(column.key)}
                      >
                        <span>{column.label}</span>
                        <SortIcon sort={sort} column={column.key} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={`${entry.rank}-${entry.mainWalletAddress}`}>
                    <td className="numeric">#{entry.rank}</td>
                    <td className="wallet-cell">{entry.mainWalletAddress}</td>
                    <td>{entry.xAccount ? `@${entry.xAccount}` : "-"}</td>
                    <td className="numeric">
                      {numberFormatter.format(entry.totalPoints)}
                    </td>
                    <td className="numeric">
                      {numberFormatter.format(entry.weeklyPointsChange)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
