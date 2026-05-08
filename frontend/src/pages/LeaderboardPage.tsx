import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { LeaderboardTable } from "../components/LeaderboardTable.js";
import { Metrics } from "../components/Metrics.js";
import { Pagination } from "../components/Pagination.js";
import { formatUpdatedAt } from "../format.js";
import { useLeaderboard } from "../hooks/useLeaderboard.js";
import type { SortKey, SortState } from "../sort.js";

const PAGE_SIZE = 100;

export const LeaderboardPage = () => {
  const [walletQuery, setWalletQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "rank", direction: "asc" });
  const [page, setPage] = useState(1);
  const leaderboardRequest = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      query: walletQuery,
      sortKey: sort.key,
      sortDirection: sort.direction,
    }),
    [page, sort.direction, sort.key, walletQuery]
  );
  const { error, isLoading, leaderboard, reload } =
    useLeaderboard(leaderboardRequest);
  const rows = leaderboard?.entries ?? [];
  const currentPage = leaderboard?.pagination?.page ?? page;
  const totalRows = leaderboard?.pagination?.totalRows ?? rows.length;

  const toggleSort = (key: SortKey) => {
    setPage(1);
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
    setPage(Math.max(nextPage, 1));
  };

  return (
    <Stack sx={{ height: "100%", minHeight: 0 }} spacing={{ xs: 1.25, md: 1.75 }}>
      <Metrics season={leaderboard?.season} stats={leaderboard?.stats ?? null} />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 1, md: 2 }}
        sx={{
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
        }}
      >
        <TextField
          type="search"
          size="small"
          value={walletQuery}
          placeholder="Search wallet address"
          onChange={(event) => {
            setPage(1);
            setWalletQuery(event.target.value);
          }}
          sx={{ width: { xs: "100%", md: 440 } }}
        />
        <Stack
          direction={{ xs: "row", sm: "row" }}
          spacing={1.25}
          sx={{
            alignItems: "center",
            justifyContent: { xs: "space-between", md: "flex-end" },
            minWidth: { md: 320 },
          }}
        >
          <Typography
            color="text.secondary"
            variant="body2"
            sx={{
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {formatUpdatedAt(leaderboard?.updatedAt)}
            {leaderboard?.cache?.status === "stale" ? " - cached" : ""}
          </Typography>
          <Button
            type="button"
            variant="outlined"
            onClick={() => void reload()}
            disabled={isLoading}
            sx={{ flexShrink: 0 }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <LeaderboardTable
          isInitialLoading={isLoading && !leaderboard}
          rows={rows}
          sort={sort}
          onSort={toggleSort}
        />
      </Box>

      <Pagination
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalRows={totalRows}
        onPageChange={changePage}
      />
    </Stack>
  );
};
