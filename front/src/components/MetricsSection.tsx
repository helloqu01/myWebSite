// File: components/MetricsSection.tsx
"use client";

import React from "react";
import { Box, Container, Stack, Typography, Card } from "@mui/material";
import { TrendingUp } from "lucide-react";
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

  return (
    <Container id="metrics" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack spacing={2} textAlign="center" mb={6}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <TrendingUp size={28} /> {t.metricsHeader}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t.metricsSubtitle}
        </Typography>
      </Stack>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
        gap={3}
      >
        {metrics.map((metric, idx) => (
          <Card
            key={idx}
            component={motion.div}
            whileHover={{ y: -6 }}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "var(--surface)",
              border: "1px solid var(--card-border)",
              boxShadow: "var(--shadow-soft)",
              transition: "box-shadow 0.25s ease",
              "&:hover": {
                boxShadow: "var(--shadow-strong)",
              },
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {metric.value}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              {metric.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {metric.detail}
            </Typography>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
