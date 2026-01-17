// File: components/SummarySection.tsx
"use client";

import React from "react";
import { Box, Container, Stack, Typography, Button, Card } from "@mui/material";
import { FileText } from "lucide-react";
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
    <Container id="summary" sx={{ py: { xs: 8, md: 12 } }}>
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
          <FileText size={28} /> {t.summaryHeader}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t.summarySubtitle}
        </Typography>
      </Stack>

      <Card
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          backgroundColor: "var(--surface)",
          border: "1px solid var(--card-border)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <Stack spacing={2}>
          <Box component="ul" sx={{ pl: 3, mb: 0 }}>
            {highlights.map((item, idx) => (
              <li key={idx}>
                <Typography variant="body1">{item}</Typography>
              </li>
            ))}
          </Box>
          <Box>
            <Button
              component={Link}
              href="/summary"
              variant="contained"
              onClick={() => trackEvent("summary_open", { source: "summary_section" })}
              sx={{
                background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
                "&:hover": {
                  background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
                },
              }}
            >
              {t.summaryCTA}
            </Button>
          </Box>
        </Stack>
      </Card>
    </Container>
  );
}
