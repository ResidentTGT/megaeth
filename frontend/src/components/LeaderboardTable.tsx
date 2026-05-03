import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { numberFormatter } from "../format.js";
import { columns, type SortKey, type SortState } from "../sort.js";
import type { LeaderboardEntry } from "../types.js";

type LeaderboardTableProps = {
  isInitialLoading: boolean;
  rows: LeaderboardEntry[];
  sort: SortState;
  onSort: (key: SortKey) => void;
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

export const LeaderboardTable = ({
  isInitialLoading,
  rows,
  sort,
  onSort,
}: LeaderboardTableProps) => (
  <section className="table-wrap" aria-label="Leaderboard table">
    {isInitialLoading ? (
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
                  onClick={() => onSort(column.key)}
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
              <td className="numeric">{numberFormatter.format(entry.totalPoints)}</td>
              <td className="numeric">
                {numberFormatter.format(entry.weeklyPointsChange)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </section>
);
