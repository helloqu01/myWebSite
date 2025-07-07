/* =========================
src/app/layout.tsx
========================= */

"use client";

import React, { useState, createContext, useMemo } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Header from "@/components/Header";

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#1976d2" },
          secondary: { main: "#9c27b0" },
        },
        typography: {
          fontFamily: ['"Noto Sans KR"', 'sans-serif'].join(',')
        }
      }),
    [mode]
  );

  return (
    <html lang="ko">
      <head />
      <body>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Header />
            {children}
          </ThemeProvider>
        </ColorModeContext.Provider>
      </body>
    </html>
  );
}