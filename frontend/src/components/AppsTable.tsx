import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import {
  getProjectActionUrl,
  getProjectLaunchUrl,
  getProjectOverride,
} from "../projectOverrides.js";
import type { EcosystemApp } from "../types.js";

type AppsTableProps = {
  isInitialLoading: boolean;
  apps: EcosystemApp[];
};

const linkSx = {
  color: "inherit",
  textDecorationColor: "transparent",
  transition: "color 120ms ease, text-decoration-color 120ms ease",
  "&:hover": {
    color: "primary.main",
    textDecorationColor: "currentColor",
  },
};

const formatStatus = (app: EcosystemApp) => {
  if (app.comingSoon) return "Coming soon";
  if (app.isLiveSoon) return "Live soon";
  return app.status || "Unknown";
};

const isActive = (app: EcosystemApp) =>
  !app.comingSoon &&
  !app.isLiveSoon &&
  app.status.trim().toLowerCase() === "active";

const compareByActiveStatus = (left: EcosystemApp, right: EcosystemApp) =>
  Number(isActive(right)) - Number(isActive(left));

const getAppLinks = (app: EcosystemApp) =>
  [
    app.twitter ? { label: "X", url: app.twitter } : null,
    app.telegram ? { label: "Telegram", url: app.telegram } : null,
    app.discord ? { label: "Discord", url: app.discord } : null,
    app.github ? { label: "GitHub", url: app.github } : null,
  ].filter((link): link is { label: string; url: string } => Boolean(link));

const StatusIndicator = ({ app }: { app: EcosystemApp }) => {
  if (isActive(app)) {
    return (
      <Box
        aria-label="Active"
        component="span"
        title="Active"
        sx={{
          bgcolor: "#22C55E",
          borderRadius: "50%",
          boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.16)",
          display: "inline-block",
          flexShrink: 0,
          height: 10,
          width: 10,
        }}
      />
    );
  }

  if (app.comingSoon || app.isLiveSoon) {
    return (
      <Box
        aria-label={formatStatus(app)}
        component="span"
        title={formatStatus(app)}
        sx={{ display: "inline-flex", flexShrink: 0 }}
      >
        <CircularProgress
          size={14}
          thickness={5}
          sx={{ color: "text.secondary" }}
        />
      </Box>
    );
  }

  return (
    <Chip
      label={formatStatus(app)}
      size="small"
      variant="outlined"
      sx={{
        borderColor: "#3A3A3A",
        color: "text.secondary",
        height: 22,
      }}
    />
  );
};

export const AppsTable = ({ isInitialLoading, apps }: AppsTableProps) => (
  <TableContainer
    component={Paper}
    variant="outlined"
    aria-label="Apps table"
    sx={{
      height: "100%",
      bgcolor: "#141414",
      borderColor: "#2B2B2B",
      overflow: "auto",
    }}
  >
    {isInitialLoading ? (
      <Box sx={{ display: "grid", minHeight: 220, placeItems: "center" }}>
        <CircularProgress size={28} />
      </Box>
    ) : apps.length === 0 ? (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">No apps found</Typography>
      </Box>
    ) : (
      <Table
        stickyHeader
        size="small"
        sx={{
          tableLayout: "fixed",
          minWidth: { xs: 1200, md: 0 },
          width: "100%",
          "& th, & td": {
            borderColor: "#2B2B2B",
            verticalAlign: "top",
          },
          "& thead th": {
            bgcolor: "#101010",
            color: "#DFD9D9",
            whiteSpace: "nowrap",
          },
          "& tbody tr:hover": {
            bgcolor: "#1B1B1B",
          },
          "& tbody td:first-of-type": {
            verticalAlign: "middle",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: { xs: "28%", md: 240 } }}>App</TableCell>
            <TableCell sx={{ width: { xs: 109, md: 137 } }}>
              Categories
            </TableCell>
            <TableCell sx={{ width: { xs: 302, md: 336 } }}>
              Comment
            </TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...apps].sort(compareByActiveStatus).map((app) => {
            const launchUrl = getProjectLaunchUrl(app);
            const links = getAppLinks(app);
            const override = getProjectOverride(app);

            return (
              <TableRow hover key={app.id}>
                <TableCell sx={{ verticalAlign: "middle" }}>
                  <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
                    {app.logoUrl ? (
                      <Box
                        component="img"
                        src={app.logoUrl}
                        alt=""
                        loading="lazy"
                        sx={{
                          bgcolor: "#0B0B0B",
                          borderRadius: "50%",
                          flexShrink: 0,
                          height: 36,
                          objectFit: "cover",
                          width: 36,
                        }}
                      />
                    ) : null}
                    <Box sx={{ display: "grid", gap: 0.75, minWidth: 0 }}>
                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.75,
                        }}
                      >
                        {launchUrl ? (
                          <Link
                            href={launchUrl}
                            target="_blank"
                            rel="noreferrer"
                            underline="hover"
                            sx={{
                              ...linkSx,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {app.name}
                          </Link>
                        ) : (
                          <Typography>{app.name}</Typography>
                        )}
                        <StatusIndicator app={app} />
                      </Box>
                      {links.length ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            rowGap: 0.25,
                          }}
                        >
                          {links.map((link) => (
                            <Link
                              key={`${app.id}-${link.label}-${link.url}`}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              underline="hover"
                              variant="caption"
                              sx={linkSx}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </Box>
                      ) : null}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      alignItems: "flex-start",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.75,
                    }}
                  >
                    {app.categories.length ? (
                      app.categories.map((category) => (
                        <Chip
                          key={category}
                          label={category}
                          size="small"
                          variant="outlined"
                          sx={{ maxWidth: "100%" }}
                        />
                      ))
                    ) : (
                      <Typography color="text.secondary" variant="body2">
                        -
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {override?.comment ? (
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{
                        overflowWrap: "anywhere",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {override.comment}
                    </Typography>
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "grid", gap: 0.75 }}>
                    {app.suggestedActions.length ? (
                      app.suggestedActions.map((action) => {
                        const actionUrl = getProjectActionUrl(app, action);

                        return (
                          <Link
                            key={`${action.icon}-${action.link}`}
                            href={actionUrl}
                            target="_blank"
                            rel="noreferrer"
                            underline="hover"
                            sx={{
                              ...linkSx,
                              overflowWrap: "anywhere",
                              wordBreak: "break-word",
                            }}
                          >
                            {action.description}
                          </Link>
                        );
                      })
                    ) : (
                      "-"
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )}
  </TableContainer>
);
