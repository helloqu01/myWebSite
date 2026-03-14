// File: components/SkillsRadarSection.tsx
"use client";

import React from "react";
import { Box, Chip, Container, Stack, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";

type SkillItem = {
  label: string;
  value: number;
  description: string;
};

export default function SkillsRadarSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;
  const skills = (t.skillsRadarData as SkillItem[]) || [];
  const eyebrow = lang === "en" ? "Skills" : "기술 스택";

  return (
    <Box id="skills" sx={{ py: { xs: 10, md: 16 }, borderTop: "1px solid var(--card-border)" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "360px 1fr" },
            gap: { xs: 5, md: 10 },
            alignItems: "start",
          }}
        >
          {/* Sticky label column */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            sx={{ position: { md: "sticky" }, top: { md: 100 } }}
          >
            <Chip
              label={eyebrow}
              sx={{
                mb: 2,
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
              variant="h2"
              sx={{ fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, mb: 2 }}
            >
              {t.skillsHeader}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {t.skillsSubtitle}
            </Typography>
          </Box>

          {/* Skill bars */}
          <Stack spacing={0} divider={<Box sx={{ borderBottom: "1px solid var(--card-border)" }} />}>
            {skills.map((skill, idx) => (
              <Box
                key={idx}
                component={motion.div}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: idx * 0.07 }}
                sx={{
                  py: { xs: 3, md: 4 },
                  px: 0,
                  transition: "background 0.3s ease",
                  "&:hover": { background: "rgba(139,92,246,0.03)" },
                  "&:hover .skill-bar-fill": {
                    boxShadow: "0 0 16px rgba(139,92,246,0.4)",
                  },
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="baseline"
                  mb={1.5}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
                    {skill.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontFamily: "var(--font-display), 'Fraunces', serif",
                      background: "linear-gradient(135deg, #a78bfa, #22d3ee)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontSize: "0.95rem",
                    }}
                  >
                    {skill.value}%
                  </Typography>
                </Stack>

                {/* Track */}
                <Box
                  sx={{
                    height: 3,
                    borderRadius: 999,
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    overflow: "hidden",
                    mb: 1.5,
                  }}
                >
                  <motion.div
                    className="skill-bar-fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: idx * 0.08, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg, #a78bfa, #22d3ee)",
                      borderRadius: 999,
                      transition: "box-shadow 0.3s ease",
                    }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {skill.description}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
