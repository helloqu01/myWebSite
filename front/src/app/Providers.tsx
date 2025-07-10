// src/app/Providers.tsx
"use client";

import React, { useState, useMemo } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Header from "@/components/Header";
import { ColorModeContext } from "./context/ColorModeContext";
import { LocaleProvider } from "@/context/LocaleContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const colorMode = useMemo(
    () => ({ toggleColorMode: () => setMode(m => (m === "light" ? "dark" : "light")) }),
    []
  );
  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode, primary: { main: "#1976d2" }, secondary: { main: "#9c27b0" } },
      }),
    [mode]
  );

  return (
    <LocaleProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Header />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </LocaleProvider>
  );
}
