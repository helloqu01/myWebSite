"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";
import AdUnit from "@/components/AdUnit";
import RelatedInsights from "@/components/RelatedInsights";

export default function TestingStrategyPage() {
  const { lang } = useLocale();
  const content =
    lang === "en"
      ? {
          title: "Testing Strategy: Coverage That Matters",
          body: [
            "High-value tests focus on user-critical flows and integration points.",
            "Keep unit tests fast, but invest more in integration and smoke tests.",
            "Use contract tests for API boundaries to prevent breaking changes.",
            "Stabilize CI with deterministic data and clear teardown steps.",
          ],
        }
      : {
          title: "테스트 전략: 의미 있는 커버리지",
          body: [
            "사용자 핵심 플로우와 통합 지점을 중심으로 테스트를 설계합니다.",
            "유닛 테스트는 빠르게, 통합/스모크 테스트에 더 투자하세요.",
            "API 경계는 컨트랙트 테스트로 변경 리스크를 줄입니다.",
            "CI 안정화를 위해 테스트 데이터와 정리 절차를 표준화합니다.",
          ],
        };

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {content.title}
          </Typography>
          <Typography variant="body1">{content.body[0]}</Typography>
          <Typography variant="body1">{content.body[1]}</Typography>
          <AdUnit />
          <Typography variant="body1">{content.body[2]}</Typography>
          <Typography variant="body1">{content.body[3]}</Typography>
          <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INSIGHTS_SECONDARY} minHeight={220} />
          <RelatedInsights currentSlug="testing-strategy" />
          <Link component={NextLink} href="/insights" underline="hover" color="primary">
            {lang === "en" ? "Back to Insights" : "인사이트로 돌아가기"}
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
