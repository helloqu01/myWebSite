// File: components/SkillsRadarSection.tsx
"use client";

import React from "react";
import { Box, Container, Stack, Typography, Card } from "@mui/material";
import { Radar } from "lucide-react";
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
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;
  const skills = (t.skillsRadarData as SkillItem[]) || [];

  return (
    <Container id="skills" sx={{ py: { xs: 8, md: 12 } }}>
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
          <Radar size={28} /> {t.skillsHeader}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t.skillsSubtitle}
        </Typography>
      </Stack>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }}
        gap={3}
      >
        {skills.map((skill, idx) => (
          <Card
            key={idx}
            component={motion.div}
            whileHover={{ y: -4 }}
            sx={{
              p: 2.5,
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "var(--surface)",
              border: "1px solid var(--card-border)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                margin: "0 auto 12px",
                background: `conic-gradient(#1e3a8a ${skill.value}%, rgba(148,163,184,0.2) 0)`,
                display: "grid",
                placeItems: "center",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  backgroundColor: "var(--surface-strong)",
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid var(--card-border)",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {skill.value}
                </Typography>
              </Box>
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {skill.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {skill.description}
            </Typography>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
