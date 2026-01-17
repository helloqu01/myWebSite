// File: components/HeroSection.tsx
"use client";

import React from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";
import { useLocale } from "@/context/LocaleContext";
import { trackEvent } from "@/lib/analytics";

// ① import your Three.js scene
import ThreeScene from "./ThreeScene";

export default function HeroSection() {
  const theme = useTheme();
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;

  const scrollToNext = () => {
    const next = document.getElementById("metrics");
    if (next) next.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Box
      id="hero"
      component={motion.section}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      sx={{
        position: "relative",      // ← for layering
        overflow: "hidden",        // ← hide overflow
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 20% 15%, rgba(30,58,138,0.22), transparent 55%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.18), transparent 50%)`,
        color: theme.palette.text.primary,
        textAlign: "center",
        px: 2,
      }}
    >
      {/* ② 배경 3D 캔버스 (zIndex:0) */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <ThreeScene />
      </Box>

      {/* ③ 기존 콘텐츠 (zIndex:1) */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 720,
          px: { xs: 3, sm: 4 },
          py: { xs: 4, sm: 5 },
          borderRadius: 4,
          backgroundColor: "var(--surface-strong)",
          border: "1px solid var(--card-border)",
          boxShadow: "var(--shadow-strong)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 600,
            mb: 2,
            fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
            lineHeight: 1.2,
          }}
        >
          {t.greeting}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            opacity: 0.9,
            mb: 4,
            fontSize: { xs: "1rem", sm: "1.25rem" },
            maxWidth: 700,
            lineHeight: 1.6,
          }}
        >
          {t.subtitle}
        </Typography>

        <Button
          component={Link}
          href="/resume"
          variant="contained"
          onClick={() => trackEvent("resume_open", { source: "hero" })}
          sx={{
            background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
            "&:hover": {
              background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
            },
          }}
        >
          {t.resumeCTA}
        </Button>

      </Box>

      {/* ④ 스크롤 버튼도 위에 띄우기 */}
      <IconButton
        onClick={scrollToNext}
        sx={{
          position: "relative",
          zIndex: 1,
          color: theme.palette.text.primary,
          border: "1px solid var(--card-border)",
          mt: 4,
          backgroundColor: "var(--surface-strong)",
          "&:hover": { backgroundColor: "var(--surface)" },
        }}
      >
        <ChevronDown size={36} />
      </IconButton>
    </Box>
  );
}
