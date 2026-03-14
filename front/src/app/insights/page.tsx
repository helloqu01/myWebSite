"use client";

import React from "react";
import NextLink from "next/link";
import {
  Box,
  Card,
  CardActionArea,
  Container,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import { useLocale } from "@/context/LocaleContext";
import { insights } from "@/lib/insights";

export default function InsightsPage() {
  const { lang } = useLocale();
  const title = lang === "en" ? "Insights" : "인사이트";
  const subtitle =
    lang === "en"
      ? "Practical, step-by-step notes based on real delivery work across deployment, AI features, automation, payments, and debugging."
      : "배포, AI 기능, 자동화, 결제, 디버깅까지 실제로 해결하고 운영한 내용을 초보자도 따라갈 수 있게 단계별로 정리했습니다.";
  const featuredLabel = lang === "en" ? "Field Notes" : "현장 노트";

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 10%, rgba(59,130,246,0.18), transparent 50%), radial-gradient(circle at 80% 0%, rgba(14,116,144,0.18), transparent 45%)",
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={4}>
          <Stack spacing={2} alignItems="flex-start">
            <Chip
              label={featuredLabel}
              sx={{
                backgroundColor: "rgba(15,118,110,0.16)",
                color: "text.primary",
                fontWeight: 600,
              }}
            />
            <Typography variant="h2" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
              {subtitle}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3,
            }}
          >
            {insights.map(article => (
              <Card
                key={article.slug}
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: "1px solid var(--card-border)",
                  background: "var(--surface-strong)",
                  boxShadow: "var(--shadow-soft)",
                  overflow: "hidden",
                }}
              >
                <CardActionArea
                  component={NextLink}
                  href={`/insights/${article.slug}`}
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 1.5,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ letterSpacing: "0.18em" }}
                  >
                    {lang === "en" ? article.categoryEn : article.categoryKo}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {lang === "en" ? article.titleEn : article.titleKo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lang === "en" ? article.summaryEn : article.summaryKo}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mt: "auto",
                      fontWeight: 600,
                      color: "primary.main",
                    }}
                  >
                    {lang === "en" ? "Read more →" : "더 읽기 →"}
                  </Typography>
                </CardActionArea>
              </Card>
            ))}
          </Box>

        </Stack>
      </Container>
    </Box>
  );
}
