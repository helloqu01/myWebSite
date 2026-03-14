// File: components/SummarySection.tsx
"use client";

import React from "react";
import { Box, Button, Chip, Container, Typography } from "@mui/material";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";
import { trackEvent } from "@/lib/analytics";

export default function SummarySection() {
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;
  const highlights = (t.summaryHighlights as string[]) || [];

  return (
    <Box
      id="summary"
      sx={{ py: { xs: 10, md: 16 }, borderTop: "1px solid var(--card-border)" }}
    >
      <Container maxWidth="lg">
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6 }}
          sx={{
            p: { xs: 4, md: 8 },
            borderRadius: 5,
            border: "1px solid rgba(139,92,246,0.2)",
            background:
              "linear-gradient(135deg, rgba(109,40,217,0.12) 0%, rgba(8,145,178,0.08) 100%)",
            position: "relative",
            overflow: "hidden",
            textAlign: { xs: "center", md: "left" },
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.12), transparent 55%)",
              pointerEvents: "none",
            },
          }}
        >
          <Chip
            label={lang === "en" ? "Summary" : "요약"}
            sx={{
              mb: 2.5,
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
            variant="h3"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              mb: 3,
              position: "relative",
              zIndex: 1,
            }}
          >
            {t.summaryHeader}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 640, lineHeight: 1.8, position: "relative", zIndex: 1 }}
          >
            {t.summarySubtitle}
          </Typography>

          <Box
            component="ul"
            sx={{
              pl: 2.5,
              mb: 5,
              position: "relative",
              zIndex: 1,
              maxWidth: 700,
            }}
          >
            {highlights.map((item, idx) => (
              <Typography
                key={idx}
                component="li"
                variant="body1"
                sx={{ mb: 1.2, lineHeight: 1.8 }}
              >
                {item}
              </Typography>
            ))}
          </Box>

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Button
              component={Link}
              href="/summary"
              variant="contained"
              endIcon={<ArrowRight size={16} />}
              onClick={() => trackEvent("summary_open", { source: "summary_section" })}
              sx={{ py: 1.5, px: 3.5 }}
            >
              {t.summaryCTA}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
