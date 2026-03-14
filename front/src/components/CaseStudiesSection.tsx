// File: components/CaseStudiesSection.tsx
"use client";

import React from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import { ExternalLink } from "lucide-react";
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
  const eyebrow = lang === "en" ? "Case Studies" : "케이스 스터디";

  return (
    <Box id="case-studies" sx={{ py: { xs: 8, md: 14 }, borderTop: "1px solid var(--card-border)" }}>
      <Container maxWidth="lg">
        <Stack spacing={1.5} alignItems="flex-start" mb={{ xs: 5, md: 8 }}>
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
          <Typography variant="h2" sx={{ fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            {t.caseStudiesHeader}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
            {t.caseStudiesSubtitle}
          </Typography>
        </Stack>

        <Stack spacing={0} divider={<Box sx={{ borderBottom: "1px solid var(--card-border)" }} />}>
          {studies.map((item, idx) => (
            <Box
              key={idx}
              component={motion.div}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              sx={{
                py: { xs: 4, md: 6 },
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: { xs: 3, md: 6 },
                alignItems: "start",
                transition: "background 0.3s ease",
                "&:hover": { background: "rgba(139,92,246,0.02)" },
              }}
            >
              {/* Left: title + problem */}
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: "-0.015em" }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1 }}>
                  <Box component="span" sx={{ color: "#a78bfa", fontWeight: 700 }}>
                    {t.caseStudyProblemLabel}
                  </Box>{" "}
                  {item.problem}
                </Typography>
                <Chip
                  label={item.techStack}
                  size="small"
                  sx={{
                    mt: 1.5,
                    borderRadius: 999,
                    background: "rgba(139,92,246,0.08)",
                    border: "1px solid rgba(139,92,246,0.16)",
                    color: "#c4b5fd",
                    fontWeight: 600,
                    fontSize: "0.73rem",
                  }}
                />
              </Box>

              {/* Right: solution + result + link */}
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1 }}>
                  <Box component="span" sx={{ color: "#22d3ee", fontWeight: 700 }}>
                    {t.caseStudySolutionLabel}
                  </Box>{" "}
                  {item.solution}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  <Box component="span" sx={{ color: "#34d399", fontWeight: 700 }}>
                    {t.caseStudyResultLabel}
                  </Box>{" "}
                  {item.result}
                </Typography>
                {item.link && item.link !== "#" && (
                  <Button
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    endIcon={<ExternalLink size={14} />}
                    size="small"
                    sx={{
                      mt: 2,
                      color: "#a78bfa",
                      border: "1px solid rgba(139,92,246,0.25)",
                      borderRadius: 999,
                      px: 2,
                      fontSize: "0.78rem",
                      textTransform: "none",
                      "&:hover": {
                        background: "rgba(139,92,246,0.08)",
                        borderColor: "rgba(139,92,246,0.4)",
                      },
                    }}
                  >
                    {t.projectsView}
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
