// File: components/ExperienceSection.tsx
"use client";

import React, { useState } from "react";
import {
  Container,
  Stack,
  Typography,
  Card,
  Chip,
  IconButton,
  Box,
  Divider,
  Collapse,
  CardActions,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Calendar, Link2 } from "lucide-react";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";

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

  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const toggle = (idx: number) => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));

  const renderCard = (exp: ExperienceItem, idx: number) => (
    <Card
      key={idx}
      sx={{
        p: 3,
        bgcolor: isDark ? "rgba(255,255,255,0.05)" : theme.palette.background.paper,
        backdropFilter: isDark ? "blur(6px)" : "none",
        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "none",
        boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.7)"
          : theme.shadows[3],
        borderRadius: 3,
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: isDark
            ? "0 12px 40px rgba(0,0,0,0.8)"
            : theme.shadows[6],
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
          {exp.company}
        </Typography>
        <Chip label={exp.role} size="small" color="primary" />
        {exp.details.some(d => typeof d !== "string") && (
          <IconButton
            component="a"
            href={(exp.details.find(d => typeof d !== "string") as LinkDetail).url}
            target="_blank"
            rel="noreferrer"
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": { color: theme.palette.primary.main },
            }}
          >
            <Link2 size={16} />
          </IconButton>
        )}
      </Stack>

      <Typography
        variant="subtitle2"
        color="text.secondary"
        gutterBottom
        sx={{ mb: 2 }}
      >
        {exp.period} · {exp.duration}
      </Typography>

      <Box component="ul" sx={{ pl: 2, mb: 2 }}>
        {exp.details.map((d, i) =>
          typeof d === "string" ? (
            <Typography
              key={i}
              component="li"
              variant="body2"
              sx={{ mb: 0.5, color: theme.palette.text.primary }}
            >
              {d}
            </Typography>
          ) : null
        )}
      </Box>

      {exp.techStack && (
        <Typography
          variant="body2"
          sx={{ fontStyle: "italic", mb: 2, color: theme.palette.text.primary }}
        >
          📦 Tech Stack: {exp.techStack}
        </Typography>
      )}

      {exp.extra && (
        <>
          <Collapse in={expanded[idx]} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />
            <Box component="ul" sx={{ pl: 2, mb: 1 }}>
              {exp.extra.map((item, i) => (
                <li key={i}>
                  <Typography variant="body2" sx={{ mb: 0.5, color: theme.palette.text.secondary }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </Box>
          </Collapse>
          <CardActions sx={{ justifyContent: "flex-end", pt: 2 }}>
            <Button
              size="small"
              onClick={() => toggle(idx)}
              sx={{ color: theme.palette.primary.main }}
            >
              {expanded[idx] ? t.experienceLess : t.experienceMore}
            </Button>
          </CardActions>
        </>
      )}
    </Card>
  );

  return (
    <Container id="experience" sx={{ py: 10 }}>
      <Stack spacing={3} textAlign="center" mb={6}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            color: theme.palette.text.primary,
          }}
        >
          <Calendar size={28} /> {t.experienceHeader}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t.experienceSubtitle}
        </Typography>
      </Stack>

      {isMobile ? (
        <Stack spacing={4}>
          {experiences.map(renderCard)}
        </Stack>
      ) : (
        <Timeline position="alternate">
          {experiences.map((exp, idx) => (
            <TimelineItem key={idx}>
              <TimelineSeparator>
                <TimelineDot color="primary" />
                {idx < experiences.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ py: { xs: 2, sm: 3 } }}>
                {renderCard(exp, idx)}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Container>
  );
}
