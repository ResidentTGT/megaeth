import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import { numberFormatter } from "../format.js";
import { columns, type SortKey, type SortState } from "../sort.js";
import type { LeaderboardEntry } from "../types.js";

type LeaderboardTableProps = {
  isInitialLoading: boolean;
  rows: LeaderboardEntry[];
  sort: SortState;
  onSort: (key: SortKey) => void;
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

const isTruncatedWalletDisplayName = (displayName: string) =>
  /^0x[a-fA-F0-9]+\.\.\.[a-fA-F0-9]+$/.test(displayName.trim());

const getTwitterHandle = (displayName: string) =>
  displayName.trim().replace(/^@+/, "");

const getTwitterUrl = (displayName: string) =>
  `https://x.com/${encodeURIComponent(getTwitterHandle(displayName))}`;

export const LeaderboardTable = ({
  isInitialLoading,
  rows,
  sort,
  onSort,
}: LeaderboardTableProps) => (
  <TableContainer
    component={Paper}
    variant="outlined"
    aria-label="Leaderboard table"
    sx={{
      height: "100%",
      bgcolor: "#141414",
      borderColor: "#2B2B2B",
      overflow: "auto",
    }}
  >
    {isInitialLoading ? (
      <Box
        sx={{
          display: "grid",
          minHeight: 220,
          placeItems: "center",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    ) : rows.length === 0 ? (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">No rows found</Typography>
      </Box>
    ) : (
      <Table
        stickyHeader
        size="small"
        sx={{
          minWidth: 760,
          "& th, & td": {
            borderColor: "#2B2B2B",
            whiteSpace: "nowrap",
            textAlign: "left",
          },
          "& thead th": {
            bgcolor: "#101010",
            color: "#DFD9D9",
          },
          "& tbody tr:hover": {
            bgcolor: "#1B1B1B",
          },
        }}
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                sortDirection={sort.key === column.key ? sort.direction : false}
              >
                <TableSortLabel
                  active={sort.key === column.key}
                  direction={sort.key === column.key ? sort.direction : "asc"}
                  onClick={() => onSort(column.key)}
                >
                  {column.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((entry) => (
            <TableRow hover key={`${entry.rank}-${entry.displayName}`}>
              <TableCell>#{entry.rank}</TableCell>
              <TableCell
                sx={{
                  fontFamily:
                    '"SFMono-Regular", Consolas, "Liberation Mono", ui-monospace, monospace',
                  fontSize: 13,
                }}
              >
                {isTruncatedWalletDisplayName(entry.displayName) ? (
                  entry.displayName
                ) : (
                  <Link
                    href={getTwitterUrl(entry.displayName)}
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                    color="inherit"
                    sx={{ ...linkSx, font: "inherit" }}
                  >
                    {getTwitterHandle(entry.displayName)}
                  </Link>
                )}
              </TableCell>
              <TableCell>{numberFormatter.format(entry.totalPoints)}</TableCell>
              <TableCell>
                {numberFormatter.format(entry.weeklyPointsChange)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </TableContainer>
);
