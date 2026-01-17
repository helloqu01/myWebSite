"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";
import AdUnit from "@/components/AdUnit";
import RelatedInsights from "@/components/RelatedInsights";

export default function ApiReliabilityPage() {
  const { lang } = useLocale();
  const content =
    lang === "en"
      ? {
          title: "API Reliability: Guardrails That Prevent Incidents",
          body: [
            "Reliable APIs come from small guardrails that prevent cascading failures.",
            "Start with timeouts, retries with backoff, and idempotency keys on write operations.",
            "Add circuit breakers, clear error codes, and service-level objectives that teams can monitor.",
            "Rate limits protect core services and keep traffic spikes from becoming outages.",
          ],
        }
      : {
          title: "API 안정성: 장애를 줄이는 가드레일",
          body: [
            "안정적인 API는 작은 가드레일에서 시작합니다.",
            "타임아웃, 지수 백오프 재시도, 쓰기 요청의 멱등성 키를 먼저 적용하세요.",
            "서킷 브레이커, 명확한 에러 코드, SLO 모니터링을 함께 준비합니다.",
            "레이트리밋은 핵심 서비스를 보호해 트래픽 급증이 장애로 번지는 것을 막습니다.",
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
          <RelatedInsights currentSlug="api-reliability" />
          <Link component={NextLink} href="/insights" underline="hover" color="primary">
            {lang === "en" ? "Back to Insights" : "인사이트로 돌아가기"}
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
