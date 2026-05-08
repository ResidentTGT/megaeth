import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { numberFormatter } from "../format.js";

type SeasonPointCalculatorProps = {
  defaultTotalPoints?: number;
};

const MEGA_SUPPLY = 10_000_000_000;
const DEFAULT_MEGA_PRICE = "0.1";
const DEFAULT_SEASON_ALLOCATION_PERCENT = "0.5";

const usdFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
  minimumFractionDigits: 2,
});

const parseInputNumber = (value: string) => {
  const parsed = Number(value.replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatInputNumber = (value: number) =>
  Number.isFinite(value) && value > 0 ? Math.round(value).toString() : "";

const inputSx = {
  "& .MuiInputBase-input": {
    fontSize: 13,
    px: 1,
    py: 0.65,
  },
};

export const SeasonPointCalculator = ({
  defaultTotalPoints,
}: SeasonPointCalculatorProps) => {
  const [megaPrice, setMegaPrice] = useState(DEFAULT_MEGA_PRICE);
  const [seasonAllocationPercent, setSeasonAllocationPercent] = useState(
    DEFAULT_SEASON_ALLOCATION_PERCENT,
  );
  const [totalPoints, setTotalPoints] = useState(
    formatInputNumber(defaultTotalPoints ?? 0),
  );
  const [hasEditedTotalPoints, setHasEditedTotalPoints] = useState(false);

  useEffect(() => {
    if (!hasEditedTotalPoints) {
      setTotalPoints(formatInputNumber(defaultTotalPoints ?? 0));
    }
  }, [defaultTotalPoints, hasEditedTotalPoints]);

  const megaPriceValue = parseInputNumber(megaPrice);
  const seasonAllocationValue = parseInputNumber(seasonAllocationPercent);
  const totalPointsValue = parseInputNumber(totalPoints);
  const pointValue =
    totalPointsValue > 0
      ? (MEGA_SUPPLY * megaPriceValue * (seasonAllocationValue / 100)) /
        totalPointsValue
      : 0;

  return (
    <Box
      sx={{
        alignItems: "center",
        bgcolor: "#141414",
        border: "1px solid #2B2B2B",
        borderRadius: 1,
        display: "flex",
        flexWrap: "wrap",
        gap: { xs: 0.75, sm: 1 },
        px: { xs: 1.25, sm: 2 },
        py: { xs: 1.25, sm: 1.5 },
      }}
    >
      <Typography color="text.secondary" variant="body2">
        If $MEGA is worth
      </Typography>
      <TextField
        type="number"
        size="small"
        value={megaPrice}
        onChange={(event) => setMegaPrice(event.target.value)}
        slotProps={{
          htmlInput: { "aria-label": "MEGA price", min: 0, step: "0.01" },
        }}
        sx={{ ...inputSx, width: 74 }}
      />
      <Typography color="text.secondary" variant="body2">
        $, Season 1 gets
      </Typography>
      <TextField
        type="number"
        size="small"
        value={seasonAllocationPercent}
        onChange={(event) => setSeasonAllocationPercent(event.target.value)}
        slotProps={{
          htmlInput: {
            "aria-label": "Season allocation percent",
            min: 0,
            step: "0.1",
          },
        }}
        sx={{ ...inputSx, width: 64 }}
      />
      <Typography color="text.secondary" variant="body2">
        % of tokenomics, and Season 1 has
      </Typography>
      <TextField
        type="number"
        size="small"
        value={totalPoints}
        onChange={(event) => {
          setHasEditedTotalPoints(true);
          setTotalPoints(event.target.value);
        }}
        slotProps={{
          htmlInput: { "aria-label": "Season total points", min: 0, step: "1" },
        }}
        sx={{ ...inputSx, width: { xs: 112, sm: 136 } }}
      />
      <Typography color="text.secondary" variant="body2">
        points total,
      </Typography>
      <Box sx={{ flexBasis: "100%", height: 0 }} />
      <Typography color="text.secondary" variant="body2">
        then 1 point is worth
      </Typography>
      <Typography
        color="primary.main"
        variant="body2"
        sx={{ fontWeight: 800, whiteSpace: "nowrap" }}
      >
        ${usdFormatter.format(pointValue)}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        ({numberFormatter.format(MEGA_SUPPLY)} * ${megaPrice || "0"} *{" "}
        {seasonAllocationPercent || "0"} / 100 / {totalPoints || "0"})
      </Typography>
    </Box>
  );
};
