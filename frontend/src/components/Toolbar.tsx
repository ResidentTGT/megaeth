import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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
    <Stack
      component="header"
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        alignItems: { xs: "stretch", sm: "flex-start" },
        justifyContent: "space-between",
      }}
    >
      <Stack spacing={0.75}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
          Leaderboard
        </Typography>
        <Typography
          color="text.secondary"
          variant="body2"
          sx={{ maxWidth: 720 }}
        >
          {leaderboard ? numberFormatter.format(leaderboard.entries.length) : "-"}{" "}
          entries - Updated {formatUpdatedAt(leaderboard?.updatedAt)}
          {cacheStatus === "stale" ? " - Showing cached data" : ""}
        </Typography>
      </Stack>

      <Button
        type="button"
        variant="outlined"
        onClick={onRefresh}
        disabled={isLoading}
        sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
      >
        Refresh
      </Button>
    </Stack>
  );
};
