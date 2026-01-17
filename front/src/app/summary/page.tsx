// File: app/summary/page.tsx
"use client";

import React from "react";
import "../resume/resume.css";
import Link from "next/link";
import { Box, Button, Container, Stack, Typography, Divider } from "@mui/material";
import { ArrowLeft, Download } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";

type CaseStudy = {
  title: string;
  result: string;
};

export default function SummaryPage() {
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;
  const caseStudies = (t.caseStudiesData as CaseStudy[]) || [];

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="md">
        <Stack direction="row" spacing={2} className="print-hidden" mb={3}>
          <Button component={Link} href="/" startIcon={<ArrowLeft size={16} />} variant="outlined">
            {t.resumeBackLabel}
          </Button>
          <Button
            onClick={() => window.print()}
            startIcon={<Download size={16} />}
            variant="contained"
          sx={{
              background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
              "&:hover": {
                background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
              },
            }}
          >
            {t.resumeDownloadLabel}
          </Button>
        </Stack>

        <Box
          className="print-sheet"
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            backgroundColor: "var(--surface-strong)",
            border: "1px solid var(--card-border)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {t.summaryHeader}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t.summarySubtitle}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="body1">{t.resumeHeadline}</Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeSummaryLabel}
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                {(t.summaryHighlights as string[]).map((item, idx) => (
                  <li key={idx}>
                    <Typography variant="body2">{item}</Typography>
                  </li>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.caseStudiesHeader}
              </Typography>
              <Stack spacing={1.5}>
                {caseStudies.map((item, idx) => (
                  <Box key={`${item.title}-${idx}`}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.result}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeContactLabel}
              </Typography>
              <Typography variant="body2">Email: ddaaadd01@gmail.com</Typography>
              <Typography variant="body2">Website: https://codingbyohj.com</Typography>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
