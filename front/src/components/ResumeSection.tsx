// File: components/ResumeSection.tsx
"use client";

import React from "react";
import { Container, Stack, Typography, Card, Button } from "@mui/material";
import { Download } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";
import { trackEvent } from "@/lib/analytics";

export default function ResumeSection() {
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;

  return (
    <Container id="resume" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack spacing={2} textAlign="center" mb={6}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          {t.resumeHeader}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t.resumeSubtitle}
        </Typography>
      </Stack>

      <Card
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          backgroundColor: "var(--surface)",
          border: "1px solid var(--card-border)",
          boxShadow: "var(--shadow-soft)",
          textAlign: "center",
        }}
      >
        <Button
          component={Link}
          href="/resume"
          variant="contained"
          startIcon={<Download size={16} />}
          onClick={() => trackEvent("resume_open", { source: "section" })}
          sx={{
            background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
            "&:hover": {
              background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
            },
          }}
        >
          {t.resumeCTA}
        </Button>
      </Card>
    </Container>
  );
}
