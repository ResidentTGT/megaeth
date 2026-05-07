import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { AppsTable } from "../components/AppsTable.js";
import { formatUpdatedAt } from "../format.js";
import { useApps } from "../hooks/useApps.js";

export const AppsPage = () => {
  const { apps, error, isLoading, reload } = useApps();
  const [appQuery, setAppQuery] = useState("");

  const rows = useMemo(() => {
    const query = appQuery.trim().toLowerCase();
    const entries = apps?.apps ?? [];

    if (!query) return entries;

    return entries.filter((app) => {
      const searchableText = [
        app.name,
        app.slug,
        app.description,
        app.status,
        app.clientId ?? "",
        ...app.categories,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [apps, appQuery]);

  return (
    <Stack sx={{ height: "100%", minHeight: 0 }} spacing={{ xs: 1.25, md: 1.75 }}>
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
          value={appQuery}
          placeholder="Search apps"
          onChange={(event) => setAppQuery(event.target.value)}
          sx={{ width: { xs: "100%", md: 440 } }}
        />
        <Stack
          direction="row"
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
            {formatUpdatedAt(apps?.updatedAt)}
            {apps?.cache?.status === "stale" ? " - cached" : ""}
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
        <AppsTable isInitialLoading={isLoading && !apps} apps={rows} />
      </Box>
    </Stack>
  );
};
