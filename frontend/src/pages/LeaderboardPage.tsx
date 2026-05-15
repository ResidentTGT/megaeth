import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { LeaderboardTable } from "../components/LeaderboardTable.js";
import { Metrics } from "../components/Metrics.js";
import { SeasonPointCalculator } from "../components/SeasonPointCalculator.js";
import { formatUpdatedAt } from "../format.js";
import { useLeaderboard } from "../hooks/useLeaderboard.js";
import { sortEntries, type SortKey, type SortState } from "../sort.js";

export const LeaderboardPage = () => {
  const [displayNameQuery, setDisplayNameQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "rank", direction: "asc" });
  const { error, isLoading, leaderboard, reload } = useLeaderboard();
  const rows = useMemo(() => {
    const normalizedQuery = displayNameQuery.trim().toLowerCase();
    const filteredRows = normalizedQuery
      ? (leaderboard?.entries ?? []).filter((entry) =>
          entry.displayName.toLowerCase().includes(normalizedQuery)
        )
      : leaderboard?.entries ?? [];

    return sortEntries(filteredRows, sort);
  }, [displayNameQuery, leaderboard?.entries, sort]);

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
    <Stack sx={{ height: "100%", minHeight: 0 }} spacing={{ xs: 1.25, md: 1.75 }}>
      <Metrics season={leaderboard?.season} stats={leaderboard?.stats ?? null} />
      <SeasonPointCalculator
        defaultTotalPoints={leaderboard?.stats.projectedTotalPoints}
      />

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
          value={displayNameQuery}
          placeholder="Search display name"
          onChange={(event) => {
            setDisplayNameQuery(event.target.value);
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
    </Stack>
  );
};
