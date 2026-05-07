import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppHeader, CONTENT_MAX_WIDTH } from "./components/AppHeader.js";
import { AppsPage } from "./pages/AppsPage.js";
import { LeaderboardPage } from "./pages/LeaderboardPage.js";

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
          <Route path="/apps" element={<AppsPage />} />
          <Route path="*" element={<Navigate to="/leaderboard" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}
