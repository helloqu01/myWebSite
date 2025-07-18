// File: components/HeroSection.tsx
"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";
import { useLocale } from "@/context/LocaleContext";

// ① import your Three.js scene
import ThreeScene from "./ThreeScene";

export default function HeroSection() {
  const theme = useTheme();
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;

  const scrollToNext = () => {
    const next = document.getElementById("experience");
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
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: theme.palette.primary.contrastText,
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
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
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
      </Box>

      {/* ④ 스크롤 버튼도 위에 띄우기 */}
      <IconButton
        onClick={scrollToNext}
        sx={{ position: "relative", zIndex: 1, color: "inherit" }}
      >
        <ChevronDown size={36} />
      </IconButton>
    </Box>
  );
}
