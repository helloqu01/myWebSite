// src/app/Providers.tsx
"use client";

import React, { useState, useMemo } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Header from "@/components/Header";
import ChatbotWidget from "@/components/ChatbotWidget";
import CookieBanner from "@/components/CookieBanner";
import ConsentScripts from "@/components/ConsentScripts";
import { ColorModeContext } from "./context/ColorModeContext";
import { LocaleProvider } from "@/context/LocaleContext";
import AnalyticsTracker from "./AnalyticsTracker";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const colorMode = useMemo(
    () => ({ toggleColorMode: () => setMode(m => (m === "light" ? "dark" : "light")) }),
    []
  );
  const theme = useMemo(
    () => {
      const isDark = mode === "dark";
      const primaryMain = isDark ? "#a78bfa" : "#7c3aed";
      const secondaryMain = isDark ? "#22d3ee" : "#0891b2";
      const backgroundDefault = isDark ? "#060912" : "#fafafe";
      const backgroundPaper = isDark ? "#0c1122" : "#ffffff";
      const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
      const textSecondary = isDark ? "#a0aec0" : "#334155";
      const divider = isDark ? "rgba(255,255,255,0.07)" : "rgba(109,40,217,0.1)";

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
            disabled: isDark ? "#6b7a99" : "#64748b",
          },
          divider,
        },
        shape: { borderRadius: 16 },
        typography: {
          fontFamily: "var(--font-sans), 'Space Grotesk', sans-serif",
          h1: {
            fontFamily: "var(--font-display), 'Fraunces', serif",
            fontWeight: 700,
            letterSpacing: "-0.03em",
          },
          h2: {
            fontFamily: "var(--font-display), 'Fraunces', serif",
            fontWeight: 700,
            letterSpacing: "-0.03em",
          },
          h3: {
            fontFamily: "var(--font-display), 'Fraunces', serif",
            fontWeight: 700,
            letterSpacing: "-0.025em",
          },
          h4: {
            fontFamily: "var(--font-display), 'Fraunces', serif",
            fontWeight: 700,
            letterSpacing: "-0.02em",
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
                  ? "radial-gradient(ellipse at 20% -5%, rgba(109,40,217,0.2) 0%, transparent 55%), radial-gradient(ellipse at 85% 5%, rgba(14,116,144,0.15) 0%, transparent 50%)"
                  : "radial-gradient(ellipse at 20% -5%, rgba(109,40,217,0.08) 0%, transparent 55%), radial-gradient(ellipse at 85% 5%, rgba(8,145,178,0.07) 0%, transparent 50%)",
                backgroundAttachment: "fixed",
                "--surface": isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(109,40,217,0.03)",
                "--surface-strong": isDark
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(109,40,217,0.06)",
                "--card-border": isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(109,40,217,0.12)",
                "--shadow-soft": isDark
                  ? "0 4px 24px rgba(0,0,0,0.5)"
                  : "0 4px 24px rgba(0,0,0,0.08)",
                "--shadow-strong": isDark
                  ? "0 20px 60px rgba(0,0,0,0.7)"
                  : "0 20px 60px rgba(0,0,0,0.12)",
                "--glow-violet": isDark
                  ? "0 0 40px rgba(139,92,246,0.3)"
                  : "0 0 30px rgba(124,58,237,0.2)",
                "--glow-cyan": isDark
                  ? "0 0 40px rgba(34,211,238,0.25)"
                  : "0 0 30px rgba(8,145,178,0.15)",
                "--gradient-accent": "linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)",
                "--page-pattern": isDark
                  ? "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 28px)"
                  : "repeating-linear-gradient(0deg, rgba(109,40,217,0.04) 0, rgba(109,40,217,0.04) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(109,40,217,0.03) 0, rgba(109,40,217,0.03) 1px, transparent 1px, transparent 28px)",
                "--page-pattern-opacity": "1",
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
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(109,40,217,0.02)",
                backdropFilter: "blur(16px)",
                boxShadow: "var(--shadow-soft)",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 999,
                transition: "all 0.25s ease",
              },
              containedPrimary: {
                background: "linear-gradient(135deg, #7c3aed, #0891b2)",
                boxShadow: "0 0 20px rgba(124,58,237,0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #6d28d9, #0e7490)",
                  boxShadow: "0 0 32px rgba(124,58,237,0.5)",
                  transform: "translateY(-1px)",
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
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
          <ConsentScripts />
          <AnalyticsTracker />
          <ChatbotWidget />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <CookieBanner />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </LocaleProvider>
  );
}
