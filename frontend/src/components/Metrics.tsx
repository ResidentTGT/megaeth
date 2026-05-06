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
  <Grid container spacing={{ xs: 0.75, sm: 1.5 }} aria-label="Leaderboard summary">
    {metricItems.map((metric) => (
      <Grid key={metric.key} size={{ xs: 4, md: 4 }}>
        <Card
          variant="outlined"
          sx={{
            bgcolor: "#141414",
            borderColor: "#2B2B2B",
            height: "100%",
          }}
        >
          <CardContent
            sx={{
              px: { xs: 1, sm: 2 },
              py: { xs: 1.1, sm: 2 },
              "&:last-child": {
                pb: { xs: 1.1, sm: 2 },
              },
            }}
          >
            <Stack spacing={{ xs: 0.35, sm: 0.75 }}>
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ fontSize: { xs: 11, sm: 14 }, lineHeight: 1.2 }}
              >
                {metric.label}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: 18, sm: 24 },
                  fontWeight: 800,
                  lineHeight: 1.15,
                  whiteSpace: "nowrap",
                }}
              >
                {stats ? metric.format(stats) : "-"}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);
