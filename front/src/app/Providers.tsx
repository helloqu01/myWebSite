// src/app/Providers.tsx
"use client";

import React, { useState, useMemo } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Header from "@/components/Header";
import ChatbotWidget from "@/components/ChatbotWidget";
import { ColorModeContext } from "./context/ColorModeContext";
import { LocaleProvider } from "@/context/LocaleContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const colorMode = useMemo(
    () => ({ toggleColorMode: () => setMode(m => (m === "light" ? "dark" : "light")) }),
    []
  );
  const theme = useMemo(
    () => {
      const isDark = mode === "dark";
      const primaryMain = isDark ? "#93c5fd" : "#1e3a8a";
      const secondaryMain = isDark ? "#60a5fa" : "#3b82f6";
      const backgroundDefault = isDark ? "#0b0f16" : "#f5f7fb";
      const backgroundPaper = isDark ? "#111827" : "#fdfdff";
      const textPrimary = isDark ? "#f1f5f9" : "#1f2937";
      const textSecondary = isDark ? "#cbd5e1" : "#5b5b5b";
      const divider = isDark ? "rgba(148,163,184,0.22)" : "rgba(30,58,138,0.18)";

      return createTheme({
        palette: {
          mode,
          primary: { main: primaryMain },
          secondary: { main: secondaryMain },
          background: {
            default: backgroundDefault,
            paper: backgroundPaper,
          },
          text: {
            primary: textPrimary,
            secondary: textSecondary,
          },
          divider,
        },
        shape: { borderRadius: 16 },
        typography: {
          fontFamily: "var(--font-sans), 'Space Grotesk', sans-serif",
          h1: {
            fontFamily: "var(--font-display), 'Fraunces', serif",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          },
          h2: {
            fontFamily: "var(--font-display), 'Fraunces', serif",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          },
          h3: {
            fontFamily: "var(--font-display), 'Fraunces', serif",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          },
          h4: {
            fontFamily: "var(--font-display), 'Fraunces', serif",
            fontWeight: 600,
            letterSpacing: "-0.01em",
          },
          button: {
            textTransform: "none",
            fontWeight: 600,
            letterSpacing: "0.01em",
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                color: textPrimary,
                backgroundColor: backgroundDefault,
                backgroundImage: isDark
                  ? "linear-gradient(180deg, #0b0f16 0%, #111827 45%, #0b0f16 100%), radial-gradient(circle at 12% 20%, rgba(147,197,253,0.14), transparent 50%), radial-gradient(circle at 90% 12%, rgba(96,165,250,0.18), transparent 45%)"
                  : "linear-gradient(180deg, #f5f7fb 0%, #e8edf7 45%, #f5f7fb 100%), radial-gradient(circle at 10% 18%, rgba(30,58,138,0.12), transparent 50%), radial-gradient(circle at 88% 12%, rgba(59,130,246,0.16), transparent 45%)",
                backgroundAttachment: "fixed",
                "--surface": isDark
                  ? "rgba(18,28,31,0.78)"
                  : "rgba(255,250,242,0.78)",
                "--surface-strong": isDark
                  ? "rgba(18,28,31,0.92)"
                  : "rgba(255,250,242,0.94)",
                "--card-border": isDark
                  ? "rgba(148,163,184,0.25)"
                  : "rgba(30,58,138,0.18)",
                "--shadow-soft": isDark
                  ? "0 18px 40px rgba(0,0,0,0.45)"
                  : "0 24px 50px rgba(15,23,26,0.12)",
                "--shadow-strong": isDark
                  ? "0 24px 60px rgba(0,0,0,0.6)"
                  : "0 30px 70px rgba(15,23,26,0.16)",
                "--page-pattern": isDark
                  ? "repeating-linear-gradient(0deg, rgba(226,232,240,0.08) 0, rgba(226,232,240,0.08) 1px, transparent 1px, transparent 18px), repeating-linear-gradient(90deg, rgba(226,232,240,0.06) 0, rgba(226,232,240,0.06) 1px, transparent 1px, transparent 18px)"
                  : "repeating-linear-gradient(0deg, rgba(30,58,138,0.08) 0, rgba(30,58,138,0.08) 1px, transparent 1px, transparent 18px), repeating-linear-gradient(90deg, rgba(30,58,138,0.06) 0, rgba(30,58,138,0.06) 1px, transparent 1px, transparent 18px)",
                "--page-pattern-opacity": isDark ? "0.22" : "0.18",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                border: `1px solid ${divider}`,
                backgroundColor: "var(--surface)",
                backdropFilter: "blur(16px)",
                boxShadow: "var(--shadow-soft)",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 999,
              },
            },
          },
        },
      });
    },
    [mode]
  );

  return (
    <LocaleProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Header />
          <ChatbotWidget />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </LocaleProvider>
  );
}
