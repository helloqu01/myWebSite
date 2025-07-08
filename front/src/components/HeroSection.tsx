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

export default function HeroSection() {
  const theme = useTheme();
  const { lang } = useLocale();              // 'en' or 'ko'
  const t = lang === "en" ? en : ko;         // select the correct JSON

  return (
    <Box
      id="hero"
      component={motion.section}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      sx={{
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
      <IconButton sx={{ color: "inherit" }}>
        <ChevronDown size={36} />
      </IconButton>
    </Box>
  );
}
