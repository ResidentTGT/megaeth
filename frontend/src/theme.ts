import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0B0B0B",
      paper: "#19191A",
    },
    primary: {
      main: "#26DE96",
      contrastText: "#0B0B0B",
    },
    secondary: {
      main: "#EA5989",
    },
    error: {
      main: "#FF4834",
    },
    warning: {
      main: "#FFA600",
    },
    divider: "#2B2B2B",
    text: {
      primary: "#ECE8E8",
      secondary: "#DFD9D9",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
});
