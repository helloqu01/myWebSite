"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Link, Stack, Typography } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";

const items = [
  {
    slug: "api-reliability",
    titleEn: "API Reliability: Guardrails That Prevent Incidents",
    titleKo: "API 안정성: 장애를 줄이는 가드레일",
  },
  {
    slug: "design-systems",
    titleEn: "Design Systems That Scale With Teams",
    titleKo: "팀과 함께 커지는 디자인 시스템",
  },
  {
    slug: "cloud-costs",
    titleEn: "Cloud Costs: Reduce Waste Without Breaking Systems",
    titleKo: "클라우드 비용 최적화: 낭비 줄이기",
  },
  {
    slug: "testing-strategy",
    titleEn: "Testing Strategy: Coverage That Matters",
    titleKo: "테스트 전략: 의미 있는 커버리지",
  },
  {
    slug: "security-basics",
    titleEn: "Security Basics for Product Teams",
    titleKo: "제품팀을 위한 보안 기초",
  },
  {
    slug: "site-performance",
    titleEn: "Shipping Fast: Practical Web Performance Checks",
    titleKo: "빠르게 여는 사이트: 실전 성능 점검 포인트",
  },
  {
    slug: "ux-accessibility",
    titleEn: "UX & Accessibility: Small Fixes, Big Gains",
    titleKo: "UX와 접근성: 작은 개선으로 큰 효과",
  },
  {
    slug: "adsense-readiness",
    titleEn: "AdSense Readiness: Content and Compliance",
    titleKo: "애드센스 승인 준비: 콘텐츠와 정책",
  },
];

export default function RelatedInsights({ currentSlug }: { currentSlug: string }) {
  const { lang } = useLocale();
  const filtered = items.filter(item => item.slug !== currentSlug).slice(0, 4);

  return (
    <Box sx={{ mt: 5, pt: 3, borderTop: "1px solid var(--card-border)" }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        {lang === "en" ? "Related Insights" : "관련 글"}
      </Typography>
      <Stack spacing={1}>
        {filtered.map(item => (
          <Link
            key={item.slug}
            component={NextLink}
            href={`/insights/${item.slug}`}
            underline="hover"
          >
            {lang === "en" ? item.titleEn : item.titleKo}
          </Link>
        ))}
      </Stack>
    </Box>
  );
}
