"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Card, CardContent, Container, Stack, Typography, Link } from "@mui/material";
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

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          </Stack>

          <Stack spacing={2}>
            {articles.map(article => (
              <Card key={article.slug}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {lang === "en" ? article.titleEn : article.titleKo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {lang === "en" ? article.summaryEn : article.summaryKo}
                  </Typography>
                  <Link component={NextLink} href={`/insights/${article.slug}`} underline="hover">
                    {lang === "en" ? "Read more" : "더 읽기"}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Link component={NextLink} href="/" underline="hover" color="primary">
            {lang === "en" ? "Back to Home" : "홈으로 돌아가기"}
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
