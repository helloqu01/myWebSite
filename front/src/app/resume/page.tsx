// File: app/resume/page.tsx
"use client";

import React from "react";
import "./resume.css";
import Link from "next/link";
import { Box, Button, Container, Stack, Typography, Divider } from "@mui/material";
import { Download, ArrowLeft } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";

type ExperienceItem = {
  period: string;
  company: string;
  role: string;
  details: string[];
};

type SkillItem = {
  label: string;
  value: number;
};

export default function ResumePage() {
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;

  const experiences = (t.experienceData as ExperienceItem[]) || [];
  const skills = (t.skillsRadarData as SkillItem[]) || [];

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="md">
        <Stack direction="row" spacing={2} className="print-hidden" mb={3}>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowLeft size={16} />}
            variant="outlined"
          >
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
                {t.resumeTitle}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t.subtitle}
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
                {t.resumeGoalTitle}
              </Typography>
              <Stack spacing={1}>
                {(t.resumeGoalLines as string[]).map((line, idx) => (
                  <Typography key={idx} variant="body2">
                    {line}
                  </Typography>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeGrowthTitle}
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                {(t.resumeGrowthBullets as string[]).map((item, idx) => (
                  <li key={idx}>
                    <Typography variant="body2">{item}</Typography>
                  </li>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeRoadmapTitle}
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                {(t.resumeRoadmapBullets as string[]).map((item, idx) => (
                  <li key={idx}>
                    <Typography variant="body2">{item}</Typography>
                  </li>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeOnePageLabel}
              </Typography>
              <Typography variant="body2">{t.resumeInterviewLine}</Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeSkillsLabel}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {skills.map((skill, idx) => (
                  <Box
                    key={`${skill.label}-${idx}`}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 999,
                      border: "1px solid var(--card-border)",
                      backgroundColor: "rgba(30,58,138,0.08)",
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {skill.label} · {skill.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeTechStackTitle}
              </Typography>
              <Stack spacing={2}>
                {(t.resumeTechStackSections as { title: string; items: string[] }[]).map(
                  (section, idx) => (
                    <Box key={`${section.title}-${idx}`}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        {section.title}
                      </Typography>
                      <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                        {section.items.map((item, i) => (
                          <li key={i}>
                            <Typography variant="body2">{item}</Typography>
                          </li>
                        ))}
                      </Box>
                    </Box>
                  )
                )}
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeExperienceLabel}
              </Typography>
              <Stack spacing={2}>
                {experiences.map((exp, idx) => (
                  <Box key={`${exp.company}-${idx}`}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {exp.company} — {exp.role}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {exp.period}
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, mt: 1, mb: 0 }}>
                      {exp.details.slice(0, 3).map((item, i) => (
                        <li key={i}>
                          <Typography variant="body2">{item}</Typography>
                        </li>
                      ))}
                    </Box>
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
