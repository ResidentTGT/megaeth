import MuiPagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      aria-label="Leaderboard pagination"
      sx={{
        alignItems: { xs: "center", sm: "center" },
        justifyContent: "space-between",
      }}
    >
      <Typography color="text.secondary" variant="body2">
        {numberFormatter.format(firstRow)}-{numberFormatter.format(lastRow)} of{" "}
        {numberFormatter.format(totalRows)}
      </Typography>
      <MuiPagination
        count={totalPages}
        page={currentPage}
        color="primary"
        shape="rounded"
        onChange={(_, page) => onPageChange(page)}
        siblingCount={0}
        boundaryCount={1}
      />
    </Stack>
  );
};
