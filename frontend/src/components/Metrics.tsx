import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { averageFormatter, numberFormatter } from "../format.js";
import type { LeaderboardStats } from "../types.js";

type MetricsProps = {
  stats: LeaderboardStats | null;
};

const metricItems = [
  {
    key: "entriesCount",
    label: "Entries",
    format: (stats: LeaderboardStats) =>
      numberFormatter.format(stats.entriesCount),
  },
  {
    key: "totalPointsSum",
    label: "Total Points",
    format: (stats: LeaderboardStats) =>
      numberFormatter.format(stats.totalPointsSum),
  },
  {
    key: "averageTotalPoints",
    label: "Average Points",
    format: (stats: LeaderboardStats) =>
      averageFormatter.format(stats.averageTotalPoints),
  },
] as const;

export const Metrics = ({ stats }: MetricsProps) => (
  <Grid container spacing={1.5} aria-label="Leaderboard summary">
    {metricItems.map((metric) => (
      <Grid key={metric.key} size={{ xs: 12, md: 4 }}>
        <Card
          variant="outlined"
          sx={{
            bgcolor: "#141414",
            borderColor: "#2B2B2B",
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack spacing={0.75}>
              <Typography color="text.secondary" variant="body2">
                {metric.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {stats ? metric.format(stats) : "-"}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);
