import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { numberFormatter } from "../format.js";
import type { LeaderboardSeason, LeaderboardStats } from "../types.js";

type MetricsProps = {
  season?: LeaderboardSeason;
  stats: LeaderboardStats | null;
};

type MetricCardProps = {
  label: string;
  tooltip?: string;
  value: string;
};

const metricItems = [
  {
    key: "totalPointsSum",
    label: "Total Points",
    format: (stats: LeaderboardStats) =>
      numberFormatter.format(stats.totalPointsSum),
  },
  {
    key: "totalWeeklyPointsChangeSum",
    label: "Total Weekly Change",
    format: (stats: LeaderboardStats) =>
      numberFormatter.format(stats.totalWeeklyPointsChangeSum),
  },
  {
    key: "projectedTotalPoints",
    label: "Projected Total Points",
    format: (stats: LeaderboardStats) =>
      numberFormatter.format(stats.projectedTotalPoints),
  },
] as const;

const getProjectedTooltip = (stats: LeaderboardStats) =>
  `Projected Total Points = Total Points + Remaining Weeks * Total Weekly Change = ${numberFormatter.format(
    stats.totalPointsSum
  )} + ${numberFormatter.format(
    stats.projectedRemainingWeeks
  )} * ${numberFormatter.format(
    stats.totalWeeklyPointsChangeSum
  )} = ${numberFormatter.format(stats.projectedTotalPoints)}`;

const formatSeasonProgress = (
  season: LeaderboardSeason | undefined,
  stats: LeaderboardStats | null
) => {
  if (!season || !stats) return "-";

  return `S.${season.seasonId} - Week ${stats.seasonCurrentWeek}/${stats.seasonTotalWeeks}`;
};

const MetricCard = ({ label, tooltip, value }: MetricCardProps) => {
  const card = (
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
            {label}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: 18, sm: 24 },
              fontWeight: 800,
              lineHeight: 1.15,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );

  if (!tooltip) return card;

  return (
    <Tooltip arrow title={tooltip}>
      {card}
    </Tooltip>
  );
};

export const Metrics = ({ season, stats }: MetricsProps) => (
  <Box
    aria-label="Leaderboard summary"
    sx={{
      display: "grid",
      gap: { xs: 0.75, sm: 1.5 },
      gridTemplateColumns: {
        xs: "repeat(2, minmax(0, 1fr))",
        sm: "repeat(4, minmax(0, 1fr))",
      },
    }}
  >
    <MetricCard
      label="Current Season"
      value={formatSeasonProgress(season, stats)}
    />
    {metricItems.map((metric) => (
      <MetricCard
        key={metric.key}
        label={metric.label}
        tooltip={
          stats && metric.key === "projectedTotalPoints"
            ? getProjectedTooltip(stats)
            : undefined
        }
        value={stats ? metric.format(stats) : "-"}
      />
    ))}
  </Box>
);
