// File: components/ExperienceSection.tsx
"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Collapse,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link2 } from "lucide-react";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import { motion } from "framer-motion";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";
import { useLocale } from "@/context/LocaleContext";

interface LinkDetail {
  url: string;
}
type Detail = string | LinkDetail;

interface ExperienceItem {
  period: string;
  duration: string;
  company: string;
  role: string;
  details: Detail[];
  techStack?: string;
  extra?: string[];
}

export default function ExperienceSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;
  const experiences: ExperienceItem[] = t.experienceData;
  const eyebrow = lang === "en" ? "Experience" : "경력";

  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const toggle = (idx: number) =>
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));

  const renderCard = (exp: ExperienceItem, idx: number) => (
    <Box
      key={idx}
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.4, delay: idx * 0.06 }}
    >
      <Card
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          border: "1px solid var(--card-border)",
          transition: "all 0.3s ease",
          "&:hover": {
            border: "1px solid rgba(139,92,246,0.22)",
            boxShadow: "var(--glow-violet)",
          },
        }}
      >
        {/* Header row */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {exp.company}
              </Typography>
              <Chip
                label={exp.role}
                size="small"
                sx={{
                  borderRadius: 999,
                  background: "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.18)",
                  color: "#c4b5fd",
                  fontWeight: 600,
                  fontSize: "0.73rem",
                }}
              />
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block", fontWeight: 500 }}
            >
              {exp.period} · {exp.duration}
            </Typography>
          </Box>
          {exp.details.some(d => typeof d !== "string") && (
            <IconButton
              href={(exp.details.find(d => typeof d !== "string") as LinkDetail).url}
              target="_blank"
              rel="noreferrer"
              size="small"
              sx={{
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)",
                "&:hover": { color: "#a78bfa" },
              }}
            >
              <Link2 size={15} />
            </IconButton>
          )}
        </Stack>

        <Divider sx={{ my: 2, borderColor: "var(--card-border)" }} />

        {/* Details */}
        <Box component="ul" sx={{ pl: 2.5, mb: exp.techStack ? 2 : 0 }}>
          {exp.details.map((d, i) =>
            typeof d === "string" ? (
              <Typography
                key={i}
                component="li"
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.75, lineHeight: 1.75 }}
              >
                {d}
              </Typography>
            ) : null
          )}
        </Box>

        {exp.techStack && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "#a78bfa",
              fontWeight: 600,
              mt: 1,
              opacity: 0.8,
            }}
          >
            {exp.techStack}
          </Typography>
        )}

        {/* Expandable extra */}
        {exp.extra && (
          <>
            <Collapse in={expanded[idx]} timeout="auto" unmountOnExit>
              <Divider sx={{ my: 2, borderColor: "var(--card-border)" }} />
              <Box component="ul" sx={{ pl: 2.5 }}>
                {exp.extra.map((item, i) => (
                  <Typography
                    key={i}
                    component="li"
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.75, lineHeight: 1.75 }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            </Collapse>
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button
                size="small"
                onClick={() => toggle(idx)}
                sx={{
                  color: "#a78bfa",
                  border: "1px solid rgba(139,92,246,0.25)",
                  borderRadius: 999,
                  px: 2,
                  fontSize: "0.78rem",
                  "&:hover": {
                    background: "rgba(139,92,246,0.08)",
                    borderColor: "rgba(139,92,246,0.4)",
                  },
                }}
              >
                {expanded[idx] ? t.experienceLess : t.experienceMore}
              </Button>
            </Box>
          </>
        )}
      </Card>
    </Box>
  );

  return (
    <Box
      id="experience"
      sx={{ py: { xs: 10, md: 16 }, borderTop: "1px solid var(--card-border)" }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Stack spacing={1.5} mb={{ xs: 6, md: 10 }} alignItems="flex-start">
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
            {t.experienceHeader}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
            {t.experienceSubtitle}
          </Typography>
        </Stack>

        {isMobile ? (
          <Stack spacing={3}>
            {experiences.map((exp, idx) => renderCard(exp, idx))}
          </Stack>
        ) : (
          <Timeline position="alternate">
            {experiences.map((exp, idx) => (
              <TimelineItem key={idx}>
                <TimelineSeparator>
                  <TimelineDot
                    sx={{
                      background: "linear-gradient(135deg, #a78bfa, #22d3ee)",
                      boxShadow: "0 0 16px rgba(139,92,246,0.4)",
                      border: "none",
                    }}
                  />
                  {idx < experiences.length - 1 && (
                    <TimelineConnector
                      sx={{ backgroundColor: "var(--card-border)" }}
                    />
                  )}
                </TimelineSeparator>
                <TimelineContent sx={{ py: 2 }}>
                  {renderCard(exp, idx)}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </Container>
    </Box>
  );
}
