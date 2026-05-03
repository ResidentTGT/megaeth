import { ChevronLeft, ChevronRight } from "lucide-react";
import { numberFormatter } from "../format.js";

type PaginationProps = {
  currentPage: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({
  currentPage,
  pageSize,
  totalRows,
  onPageChange,
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const firstRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRow = Math.min(currentPage * pageSize, totalRows);

  return (
    <div className="pagination" aria-label="Leaderboard pagination">
      <span>
        {numberFormatter.format(firstRow)}-{numberFormatter.format(lastRow)} of{" "}
        {numberFormatter.format(totalRows)}
      </span>
      <div className="pagination-actions">
        <button
          className="icon-button"
          type="button"
          aria-label="Previous page"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <span>
          {numberFormatter.format(currentPage)} /{" "}
          {numberFormatter.format(totalPages)}
        </span>
        <button
          className="icon-button"
          type="button"
          aria-label="Next page"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
