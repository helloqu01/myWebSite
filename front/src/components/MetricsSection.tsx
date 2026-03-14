// File: components/MetricsSection.tsx
"use client";

import React from "react";
import { Box, Chip, Container, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";

type MetricItem = {
  value: string;
  label: string;
  detail: string;
};

export default function MetricsSection() {
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;
  const metrics = (t.metricsData as MetricItem[]) || [];
  const eyebrow = lang === "en" ? "Impact" : "성과";

  return (
    <Box id="metrics" sx={{ py: { xs: 10, md: 16 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Stack
          spacing={1.5}
          mb={{ xs: 8, md: 12 }}
          alignItems={{ xs: "center", md: "flex-start" }}
          textAlign={{ xs: "center", md: "left" }}
        >
          <Chip
            label={eyebrow}
            sx={{
              borderRadius: 999,
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.22)",
              color: "#a78bfa",
              fontWeight: 700,
              letterSpacing: "0.07em",
              fontSize: "0.7rem",
            }}
          />
          <Typography
            variant="h2"
            sx={{ fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 }}
          >
            {t.metricsHeader}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
            {t.metricsSubtitle}
          </Typography>
        </Stack>

        {/* Giant numbers — no cards, just dividers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            borderTop: "1px solid var(--card-border)",
          }}
        >
          {metrics.map((metric, idx) => (
            <Box
              key={idx}
              component={motion.div}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              sx={{
                py: { xs: 6, md: 8 },
                px: { xs: 2, md: 6 },
                borderBottom: { xs: "1px solid var(--card-border)", md: "none" },
                borderRight: { md: idx < 2 ? "1px solid var(--card-border)" : "none" },
                textAlign: { xs: "center", md: "left" },
                transition: "background 0.3s ease",
                "&:hover": { background: "rgba(139,92,246,0.03)" },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "4rem", md: "5.5rem" },
                  fontWeight: 800,
                  fontFamily: "var(--font-display), 'Fraunces', serif",
                  background: "linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1,
                  mb: 2,
                  letterSpacing: "-0.03em",
                }}
              >
                {metric.value}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, letterSpacing: "-0.01em" }}>
                {metric.label}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 260, lineHeight: 1.75 }}
              >
                {metric.detail}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
