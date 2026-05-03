import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LeaderboardTable } from "./components/LeaderboardTable.js";
import { Metrics } from "./components/Metrics.js";
import { Pagination } from "./components/Pagination.js";
import { Toolbar } from "./components/Toolbar.js";
import { numberFormatter } from "./format.js";
import { useLeaderboard } from "./hooks/useLeaderboard.js";
import { sortEntries, type SortKey, type SortState } from "./sort.js";

const PAGE_SIZE = 100;

export default function App() {
  const { error, isLoading, leaderboard, reload } = useLeaderboard();
  const [walletQuery, setWalletQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "rank", direction: "asc" });
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const query = walletQuery.trim().toLowerCase();
    const entries = leaderboard?.entries ?? [];

    const filteredEntries = entries.filter((entry) => {
      if (!query) return true;
      return entry.mainWalletAddress.toLowerCase().includes(query);
    });

    return sortEntries(filteredEntries, sort);
  }, [leaderboard, sort, walletQuery]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const visibleRows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, rows]);

  useEffect(() => {
    setPage(1);
  }, [sort, walletQuery]);

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

  const changePage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
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
        <Toolbar
          isLoading={isLoading}
          leaderboard={leaderboard}
          onRefresh={() => void reload()}
        />

        <Metrics stats={leaderboard?.stats ?? null} />

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

        <LeaderboardTable
          isInitialLoading={isLoading && !leaderboard}
          rows={visibleRows}
          sort={sort}
          onSort={toggleSort}
        />

        <Pagination
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalRows={rows.length}
          onPageChange={changePage}
        />
      </main>
    </div>
  );
}
