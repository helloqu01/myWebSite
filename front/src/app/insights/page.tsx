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
  Link,
  Chip,
} from "@mui/material";
import { useLocale } from "@/context/LocaleContext";

const articles = [
  {
    slug: "site-performance",
    titleEn: "Shipping Fast: Practical Web Performance Checks",
    titleKo: "빠르게 여는 사이트: 실전 성능 점검 포인트",
    summaryEn:
      "A short checklist of measurable improvements that keep page load stable on real devices.",
    summaryKo:
      "실제 사용자 환경에서 로딩 안정성을 높이는 체크리스트를 정리했습니다.",
  },
  {
    slug: "ux-accessibility",
    titleEn: "UX & Accessibility: Small Fixes, Big Gains",
    titleKo: "UX와 접근성: 작은 개선으로 큰 효과",
    summaryEn:
      "Simple accessibility fixes that improve both usability and conversion.",
    summaryKo:
      "사용성과 전환율을 함께 높이는 접근성 개선 항목을 정리했습니다.",
  },
  {
    slug: "adsense-readiness",
    titleEn: "AdSense Readiness: Content and Compliance",
    titleKo: "애드센스 승인 준비: 콘텐츠와 정책",
    summaryEn:
      "What helps sites pass review: content depth, policies, and crawlability.",
    summaryKo:
      "승인에 필요한 콘텐츠 깊이, 정책, 크롤링 접근성을 정리했습니다.",
  },
  {
    slug: "api-reliability",
    titleEn: "API Reliability: Guardrails That Prevent Incidents",
    titleKo: "API 안정성: 장애를 줄이는 가드레일",
    summaryEn:
      "A practical checklist for timeouts, retries, idempotency, and rate limits.",
    summaryKo:
      "타임아웃, 재시도, 멱등성, 레이트리밋을 포함한 체크리스트입니다.",
  },
  {
    slug: "design-systems",
    titleEn: "Design Systems That Scale With Teams",
    titleKo: "팀과 함께 커지는 디자인 시스템",
    summaryEn:
      "How to standardize components without slowing down product delivery.",
    summaryKo:
      "컴포넌트 표준화와 딜리버리를 함께 잡는 방법을 정리했습니다.",
  },
  {
    slug: "cloud-costs",
    titleEn: "Cloud Costs: Reduce Waste Without Breaking Systems",
    titleKo: "클라우드 비용 최적화: 낭비 줄이기",
    summaryEn:
      "Identify hot spots in storage, compute, and CDN with quick wins.",
    summaryKo:
      "스토리지, 컴퓨트, CDN 비용을 빠르게 줄이는 방법입니다.",
  },
  {
    slug: "testing-strategy",
    titleEn: "Testing Strategy: Coverage That Matters",
    titleKo: "테스트 전략: 의미 있는 커버리지",
    summaryEn:
      "Focus on integration, critical flows, and stable contracts.",
    summaryKo:
      "핵심 플로우와 통합 테스트 중심으로 정리했습니다.",
  },
  {
    slug: "security-basics",
    titleEn: "Security Basics for Product Teams",
    titleKo: "제품팀을 위한 보안 기초",
    summaryEn:
      "Practical steps: secrets, headers, dependency hygiene, and access control.",
    summaryKo:
      "시크릿 관리, 보안 헤더, 의존성 점검, 접근 제어를 다룹니다.",
  },
];

export default function InsightsPage() {
  const { lang } = useLocale();
  const title = lang === "en" ? "Insights" : "인사이트";
  const subtitle =
    lang === "en"
      ? "Short notes from real projects and production delivery."
      : "실무 경험에서 얻은 짧은 노트들을 정리했습니다.";
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
            {articles.map((article, index) => (
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
                    {lang === "en" ? "Insight" : "인사이트"} {String(index + 1).padStart(2, "0")}
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

          <Link component={NextLink} href="/" underline="hover" color="primary">
            {lang === "en" ? "Back to Home" : "홈으로 돌아가기"}
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
