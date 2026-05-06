import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import MuiToolbar from "@mui/material/Toolbar";
import { useEffect, useMemo, useState } from "react";
import {
  Link as RouterLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { LeaderboardTable } from "./components/LeaderboardTable.js";
import { Metrics } from "./components/Metrics.js";
import { Pagination } from "./components/Pagination.js";
import { Toolbar } from "./components/Toolbar.js";
import { numberFormatter } from "./format.js";
import { useLeaderboard } from "./hooks/useLeaderboard.js";
import { sortEntries, type SortKey, type SortState } from "./sort.js";

const PAGE_SIZE = 100;
const CONTENT_MAX_WIDTH = 1080;

const navigationTabs = [{ label: "Leaderboard", path: "/leaderboard" }];

const AppHeader = () => {
  const location = useLocation();
  const activeTab = navigationTabs.some((tab) =>
    location.pathname.startsWith(tab.path)
  )
    ? "/leaderboard"
    : false;

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: "#0B0B0B",
        borderBottom: 1,
        borderColor: "#2B2B2B",
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: CONTENT_MAX_WIDTH,
          mx: "auto",
          px: { xs: 1.5, sm: 2.5 },
        }}
      >
        <MuiToolbar
          disableGutters
          sx={{
            minHeight: { xs: 56, sm: 64 },
            gap: { xs: 2, sm: 4 },
          }}
        >
          <Box
            component={RouterLink}
            to="/leaderboard"
            aria-label="MegaETH leaderboard"
            sx={{
              alignItems: "center",
              display: "inline-flex",
              flexShrink: 0,
              textDecoration: "none",
            }}
          >
            <Box
              component="img"
              src="/megaeth-wordmark.svg"
              alt="MegaETH"
              sx={{
                display: "block",
                height: { xs: 18, sm: 22 },
                width: "auto",
              }}
            />
          </Box>

          <Tabs
            value={activeTab}
            aria-label="Primary navigation"
            textColor="primary"
            indicatorColor="primary"
            sx={{ minHeight: { xs: 56, sm: 64 } }}
          >
            {navigationTabs.map((tab) => (
              <Tab
                key={tab.path}
                component={RouterLink}
                label={tab.label}
                to={tab.path}
                value={tab.path}
                sx={{
                  minHeight: { xs: 56, sm: 64 },
                  px: { xs: 1.25, sm: 2 },
                  textTransform: "none",
                }}
              />
            ))}
          </Tabs>
        </MuiToolbar>
      </Container>
    </AppBar>
  );
};

const LeaderboardPage = () => {
  const { error, isLoading, leaderboard, reload } = useLeaderboard();
  const [walletQuery, setWalletQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "rank", direction: "asc" });
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const query = walletQuery.trim().toLowerCase();
    const entries = leaderboard?.entries ?? [];

    const filteredEntries = entries.filter((entry) => {
      if (!query) return true;
      return entry.mainWalletAddress.toLowerCase().includes(query);
    });

    return sortEntries(filteredEntries, sort);
  }, [leaderboard, sort, walletQuery]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const visibleRows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, rows]);

  useEffect(() => {
    setPage(1);
  }, [sort, walletQuery]);

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

  const changePage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <Stack sx={{ height: "100%", minHeight: 0 }} spacing={{ xs: 1.75, md: 2.25 }}>
      <Toolbar
        isLoading={isLoading}
        leaderboard={leaderboard}
        onRefresh={() => void reload()}
      />

      <Metrics stats={leaderboard?.stats ?? null} />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
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
          onChange={(event) => setWalletQuery(event.target.value)}
          sx={{ width: { xs: "100%", md: 440 } }}
        />
        <Chip
          label={`Showing ${numberFormatter.format(rows.length)} rows`}
          color="primary"
          variant="outlined"
          sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
        />
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <LeaderboardTable
          isInitialLoading={isLoading && !leaderboard}
          rows={visibleRows}
          sort={sort}
          onSort={toggleSort}
        />
      </Box>

      <Pagination
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalRows={rows.length}
        onPageChange={changePage}
      />
    </Stack>
  );
};

export default function App() {
  return (
    <Box
      sx={{
        height: "100dvh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <AppHeader />
      <Container
        component="main"
        maxWidth={false}
        sx={{
          maxWidth: CONTENT_MAX_WIDTH,
          height: { xs: "calc(100dvh - 56px)", sm: "calc(100dvh - 64px)" },
          mx: "auto",
          px: { xs: 1.5, sm: 2.5 },
          py: { xs: 1.5, md: 2 },
          overflow: "hidden",
        }}
      >
        <Routes>
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="*" element={<Navigate to="/leaderboard" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}
