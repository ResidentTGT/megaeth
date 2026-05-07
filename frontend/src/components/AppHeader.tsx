import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import MuiLink from "@mui/material/Link";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import MuiToolbar from "@mui/material/Toolbar";
import { Link as RouterLink, useLocation } from "react-router-dom";

export const CONTENT_MAX_WIDTH = 1200;

const navigationTabs = [
  { label: "Leaderboard", path: "/leaderboard" },
  { label: "Apps", path: "/apps" },
];
const telegramChannelUrl = "https://t.me/crypto_resident_notes";
const telegramChannelAvatarUrl = "/crypto-resident-notes.jpg";

export const AppHeader = () => {
  const location = useLocation();
  const activeTab =
    navigationTabs.find((tab) => location.pathname.startsWith(tab.path))?.path ??
    false;

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

          <MuiLink
            href={telegramChannelUrl}
            target="_blank"
            rel="noreferrer"
            underline="none"
            aria-label="Made by Crypto Resident's notes"
            sx={{
              alignItems: "center",
              color: "text.secondary",
              display: "inline-flex",
              flexShrink: 0,
              fontSize: 13,
              fontWeight: 600,
              gap: 0.75,
              lineHeight: 1,
              ml: "auto",
              transition: "color 120ms ease",
              whiteSpace: "nowrap",
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              Made by
            </Box>
            <Box
              component="img"
              src={telegramChannelAvatarUrl}
              alt=""
              loading="lazy"
              sx={{
                bgcolor: "#101010",
                border: "1px solid #2B2B2B",
                borderRadius: "50%",
                display: "block",
                height: { xs: 28, sm: 30 },
                objectFit: "cover",
                width: { xs: 28, sm: 30 },
              }}
            />
          </MuiLink>
        </MuiToolbar>
      </Container>
    </AppBar>
  );
};
