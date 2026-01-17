// File: components/CaseStudiesSection.tsx
"use client";

import React from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Card,
  Chip,
  Button,
} from "@mui/material";
import { FileSearch } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";

type CaseStudy = {
  title: string;
  problem: string;
  solution: string;
  result: string;
  techStack: string;
  link?: string;
};

export default function CaseStudiesSection() {
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;
  const studies = (t.caseStudiesData as CaseStudy[]) || [];

  return (
    <Container id="case-studies" sx={{ py: { xs: 8, md: 12 } }}>
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
          <FileSearch size={28} /> {t.caseStudiesHeader}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t.caseStudiesSubtitle}
        </Typography>
      </Stack>

      <Stack spacing={3}>
        {studies.map((item, idx) => (
          <Card
            key={idx}
            component={motion.div}
            whileHover={{ y: -4 }}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "var(--surface)",
              border: "1px solid var(--card-border)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{t.caseStudyProblemLabel}:</strong> {item.problem}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{t.caseStudySolutionLabel}:</strong> {item.solution}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{t.caseStudyResultLabel}:</strong> {item.result}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={item.techStack} size="small" />
              </Stack>
              {item.link && item.link !== "#" && (
                <Box>
                  <Button
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ px: 2 }}
                  >
                    {t.projectsView}
                  </Button>
                </Box>
              )}
            </Stack>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
